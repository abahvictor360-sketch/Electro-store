import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } }, address: true },
    orderBy: { createdAt: "desc" },
  });

  const statusClass: Record<string, string> = {
    PENDING: "badge-pending",
    PAID: "badge-paid",
    SHIPPED: "badge-shipped",
    DELIVERED: "badge-delivered",
    CANCELLED: "badge-cancelled",
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4" style={{ color: "var(--dark)" }}>My Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="fas fa-box-open fa-4x mb-4" />
          <h4>No orders yet</h4>
          <Link href="/store" className="btn btn-electro mt-3">Start Shopping</Link>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead style={{ background: "#f8f9fa" }}>
                <tr>
                  <th className="py-3 ps-3">Order ID</th>
                  <th className="py-3">Date</th>
                  <th className="py-3">Items</th>
                  <th className="py-3">Total</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="align-middle">
                    <td className="ps-3 py-3 font-monospace" style={{ fontSize: "0.85rem" }}>
                      #{order.id.slice(-8).toUpperCase()}
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                    <td className="fw-semibold">${order.total.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${statusClass[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link href={`/orders/${order.id}`} className="btn btn-sm btn-outline-secondary">
                          View
                        </Link>
                        <a
                          href={`/api/invoices/${order.id}`}
                          target="_blank"
                          className="btn btn-sm btn-outline-danger"
                        >
                          <i className="fas fa-file-pdf me-1" /> PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
