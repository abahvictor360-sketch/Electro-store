import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Image proxy for private Vercel Blob store.
 *
 * Vercel Blob private-store URLs require an Authorization header that
 * browsers cannot supply when fetching an <img src>.  This route fetches the
 * blob server-side using BLOB_READ_WRITE_TOKEN and streams it back with
 * long-lived cache headers so images are only fetched once per CDN edge.
 *
 * Usage: <img src={`/api/image?url=${encodeURIComponent(blobUrl)}`} />
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing ?url param", { status: 400 });
  }

  // Only proxy Vercel Blob URLs; redirect everything else as-is.
  if (!url.includes("blob.vercel-storage.com")) {
    return NextResponse.redirect(url);
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return new NextResponse("BLOB_READ_WRITE_TOKEN is not configured", { status: 500 });
  }

  try {
    const upstream = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      // Don't cache the upstream fetch itself; we cache the response below
      cache: "no-store",
    });

    if (!upstream.ok) {
      return new NextResponse(`Blob fetch failed: ${upstream.status}`, { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        // Cache at the CDN edge for 1 year; the URL already has a unique hash.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[image-proxy] fetch error:", err);
    return new NextResponse("Failed to fetch image", { status: 502 });
  }
}
