import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { defaultConfig } from "@/lib/siteConfig";

export async function GET() {
  const row = await prisma.siteConfig.findUnique({ where: { id: "site" } });
  const data = row ? { ...defaultConfig, ...(row.data as object) } : defaultConfig;
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates = await req.json();

  const existing = await prisma.siteConfig.findUnique({ where: { id: "site" } });
  const current = existing ? (existing.data as object) : {};

  const merged = { ...current, ...updates };

  const config = await prisma.siteConfig.upsert({
    where: { id: "site" },
    update: { data: merged },
    create: { id: "site", data: merged },
  });

  return NextResponse.json(config.data);
}
