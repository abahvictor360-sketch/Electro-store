import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function GET(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const ids = searchParams.get("ids");

  if (ids) {
    const idList = ids.split(",").filter(Boolean);
    const products = await prisma.product.findMany({
      where: { id: { in: idList } },
      select: { id: true, name: true, category: true, images: true, price: true, salePrice: true, stock: true, slug: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(products);
  }

  const products = await prisma.product.findMany({
    where: q ? { OR: [
      { name: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
    ]} : undefined,
    select: { id: true, name: true, category: true, images: true, price: true, salePrice: true, stock: true, slug: true },
    orderBy: { name: "asc" },
    take: 60,
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();
  const slug = slugify(data.name, { lower: true, strict: true });

  const existing = await prisma.product.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const product = await prisma.product.create({
    data: { ...data, slug: finalSlug },
  });

  return NextResponse.json(product, { status: 201 });
}
