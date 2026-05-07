import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "ADMIN" ? session : null;
}

// PATCH — update role or active status
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { role, active } = await req.json();

  // Prevent removing your own admin role
  const currentUserId = (session?.user as { id?: string } | undefined)?.id;
  if (currentUserId === params.id && role === "CUSTOMER") {
    return NextResponse.json({ error: "You cannot remove your own admin role" }, { status: 400 });
  }

  const data: { role?: "ADMIN" | "CUSTOMER"; active?: boolean } = {};
  if (role !== undefined) data.role = role === "ADMIN" ? "ADMIN" : "CUSTOMER";
  if (active !== undefined) data.active = Boolean(active);

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  return NextResponse.json(user);
}

// DELETE — remove user
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const currentUserId = (session?.user as { id?: string } | undefined)?.id;
  if (currentUserId === params.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
