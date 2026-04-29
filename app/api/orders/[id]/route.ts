import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status, trackingNo } = await req.json();
  const order = await prisma.order.update({
    where: { id: params.id },
    data: { ...(status && { status }), ...(trackingNo !== undefined && { trackingNo }) },
  });

  return NextResponse.json(order);
}
