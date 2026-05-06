import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, stock } = body;

  if (!productId || typeof stock !== "number" || stock < 0) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id: productId },
    data: { stock },
    select: { id: true, name: true, stock: true },
  });

  return NextResponse.json(product);
}
