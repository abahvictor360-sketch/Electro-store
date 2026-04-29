import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } }, address: true, user: true },
  });

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const isOwner = order.userId === session.user.id;
  const isAdmin = (session.user as { role?: string }).role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orderNum = order.id.slice(-8).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "long" });

  const rows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.product.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${item.price.toFixed(2)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:600">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
  .logo { font-size: 28px; font-weight: 700; color: #2b2d42; }
  .logo span { color: #d10024; }
  .invoice-title { font-size: 14px; color: #888; text-align: right; }
  .invoice-title strong { display: block; font-size: 24px; color: #2b2d42; margin-bottom: 4px; }
  .section { margin-bottom: 30px; }
  .section h4 { color: #2b2d42; border-bottom: 2px solid #d10024; padding-bottom: 8px; margin-bottom: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #2b2d42; color: #fff; padding: 10px 8px; text-align: left; font-size: 13px; }
  th:last-child, th:nth-child(3), th:nth-child(2) { text-align: right; }
  th:nth-child(2) { text-align: center; }
  .total-row td { padding: 12px 8px; font-size: 16px; font-weight: 700; color: #d10024; text-align: right; }
  .footer { margin-top: 50px; text-align: center; color: #aaa; font-size: 12px; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #d4edda; color: #155724; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">Electro<span>.</span></div>
    <p style="color:#888;margin:4px 0;font-size:13px">electronics@electro.store</p>
    <p style="color:#888;margin:0;font-size:13px">+1 (800) ELECTRO</p>
  </div>
  <div class="invoice-title">
    <strong>INVOICE</strong>
    #${orderNum}<br>
    Date: ${date}<br>
    <span class="status-badge">${order.status}</span>
  </div>
</div>

<div style="display:flex;gap:40px;margin-bottom:30px">
  <div class="section" style="flex:1">
    <h4>Bill To</h4>
    <p style="margin:0;font-weight:600">${order.user.name ?? order.user.email}</p>
    <p style="margin:4px 0;color:#666">${order.user.email}</p>
  </div>
  <div class="section" style="flex:1">
    <h4>Ship To</h4>
    <p style="margin:0;font-weight:600">${order.address.name}</p>
    <p style="margin:4px 0;color:#666">${order.address.street}</p>
    <p style="margin:0;color:#666">${order.address.city}, ${order.address.zip}, ${order.address.country}</p>
    ${order.address.phone ? `<p style="margin:4px 0;color:#666">${order.address.phone}</p>` : ""}
  </div>
</div>

<div class="section">
  <h4>Order Items</h4>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="padding:12px 8px;text-align:right;font-size:14px;color:#888">Shipping</td>
        <td style="padding:12px 8px;text-align:right;color:#198754;font-weight:600">Free</td>
      </tr>
      <tr class="total-row">
        <td colspan="3" style="padding:12px 8px;text-align:right;font-size:14px;color:#333">Total</td>
        <td>$${order.total.toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>
</div>

<div class="footer">
  <p>Thank you for shopping with Electro Store!</p>
  <p>For support: support@electro.store | electro.store</p>
</div>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="invoice-${orderNum}.html"`,
    },
  });
}
