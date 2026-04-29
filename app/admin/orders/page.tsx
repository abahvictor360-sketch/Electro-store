import { prisma } from "@/lib/prisma";
import OrderStatusForm from "@/components/OrderStatusForm";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const where = searchParams.status ? { status: searchParams.status as never } : {};
  const orders = await prisma.order.findMany({
    where,
    include: { user: { select: { name: true, email: true } }, items: true, address: true },
    orderBy: { createdAt: "desc" },
  });

  const statusClass: Record<string, string> = {
    PENDING: "badge-pending", PAID: "badge-paid", SHIPPED: "badge-shipped",
    DELIVERED: "badge-delivered", CANCELLED: "badge-cancelled",
  };

  const statuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: "var(--dark)" }}>Order Management</h2>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        <a href="/admin/orders" className={`btn btn-sm ${!searchParams.status ? "btn-electro" : "btn-outline-secondary"}`}>
          All
        </a>
        {statuses.map((s) => (
          <a
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`btn btn-sm ${searchParams.status === s ? "btn-electro" : "btn-outline-secondary"}`}
          >
            {s}
          </a>
        ))}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead style={{ background: "#f8f9fa" }}>
              <tr>
                <th className="py-3 ps-3">Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Tracking</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="align-middle">
                  <td className="ps-3 font-monospace" style={{ fontSize: "0.8rem" }}>
                    #{o.id.slice(-8).toUpperCase()}
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>
                    <div>{o.user.name ?? "—"}</div>
                    <small className="text-muted">{o.user.email}</small>
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>{o.items.length}</td>
                  <td className="fw-semibold">${o.total.toFixed(2)}</td>
                  <td><span className={`badge ${statusClass[o.status]}`}>{o.status}</span></td>
                  <td style={{ fontSize: "0.8rem" }}>{o.trackingNo ?? "—"}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <a href={`/api/invoices/${o.id}`} target="_blank" className="btn btn-sm btn-outline-danger" title="Invoice">
                        <i className="fas fa-file-pdf" />
                      </a>
                      <OrderStatusForm orderId={o.id} current={o.status} tracking={o.trackingNo ?? ""} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <p className="text-center text-muted py-4">No orders found.</p>
        )}
      </div>
    </div>
  );
}
