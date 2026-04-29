import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { items, address } = await req.json();
  if (!items?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const savedAddress = await prisma.address.create({
    data: { ...address, userId: session.user.id },
  });

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      addressId: savedAddress.id,
      total: items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0),
      items: {
        create: items.map((i: { id: string; price: number; quantity: number }) => ({
          productId: i.id,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    },
  });

  const lineItems = items.map((i: { name: string; price: number; quantity: number; image?: string }) => ({
    price_data: {
      currency: "usd",
      product_data: { name: i.name, images: i.image ? [i.image] : [] },
      unit_amount: Math.round(i.price * 100),
    },
    quantity: i.quantity,
  }));

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    success_url: `${process.env.NEXT_PUBLIC_URL}/orders/${order.id}?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/cart`,
    metadata: { orderId: order.id },
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeId: stripeSession.id },
  });

  return NextResponse.json({ url: stripeSession.url });
}
