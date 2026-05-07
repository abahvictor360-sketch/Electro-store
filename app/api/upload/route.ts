import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Admin-only
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate type
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  // Limit to 5 MB
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  try {
    // "private" is required for private Vercel Blob stores.
    // We route the URL through /api/image so browsers can load the image
    // without needing an Authorization header (the proxy adds it server-side).
    const blob = await put(filename, file, {
      access: "private",
      contentType: file.type,
    });
    // Return a proxy URL so <img> tags can display private blobs in browsers.
    const proxyUrl = `/api/image?url=${encodeURIComponent(blob.url)}`;
    return NextResponse.json({ url: proxyUrl });
  } catch (err: unknown) {
    console.error("[upload] Vercel Blob error:", err);
    const msg = err instanceof Error ? err.message : "Upload failed";
    // Surface a helpful hint when the token is missing
    const hint = msg.includes("token") || msg.includes("BLOB_READ_WRITE_TOKEN")
      ? "BLOB_READ_WRITE_TOKEN is not configured. Add it in Vercel → Storage → Blob → your project → Settings."
      : msg;
    return NextResponse.json({ error: hint }, { status: 500 });
  }
}
