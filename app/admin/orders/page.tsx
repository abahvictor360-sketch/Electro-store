import { prisma } from "@/lib/prisma";
import Link from "next/link";
import OrderStatusForm from "@/components/OrderStatusForm";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { status?: string; q?: string };
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:   { bg: "#fef3c7", color: "#92400e" },
  PAID:      { bg: "#cffafe", color: "#155e75" },
  SHIPPED:   { bg: "#dbeafe", color: "#1e40af" },
  DELIVERED: { bg: "#d1fae5", color: "#065f46" },
  CANCELLED: { bg: "#fee2e2", color: "#991b1b" },
};

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status, q } = searchParams;

  const orders = await prisma.order.findMany({
    where: {
      AND: [
        status ? { status: status as never } : {},
        q ? {
          OR: [
            { user: { name: { contains: q, mode: "insensitive" } } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
        } : {},
      ],
    },
    include: { user: { select: { name: true, email: true } }, items: true, address: true },
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.order.groupBy({ by: ["status"], _count: true });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));
  const totalCount = counts.reduce((a, c) => a + c._count, 0);

  const statuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

  return (
    <div>
      {/* Status filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <Link
          href="/admin/orders"
          style={{
            padding: "7px 16px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 600,
            textDecoration: "none", transition: "all 0.15s",
            background: !status ? "#1e2030" : "#fff",
            color: !status ? "#fff" : "#555",
            border: `1px solid ${!status ? "#1e2030" : "#e0e0e0"}`,
          }}
        >
          All <span style={{ opacity: 0.6, marginLeft: 4 }}>({totalCount})</span>
        </Link>
        {statuses.map((s) => {
          const sc = STATUS_COLORS[s];
          const active = status === s;
          return (
            <Link
              key={s}
              href={`/admin/orders?status=${s}`}
              style={{
                padding: "7px 16px", borderRadius: 20, fontSize: "0.82rem", fontWeight: 600,
                textDecoration: "none", transition: "all 0.15s",
                background: active ? sc.color : sc.bg,
                color: active ? "#fff" : sc.color,
                border: `1px solid ${sc.color}40`,
              }}
            >
              {s} <span style={{ opacity: 0.7, marginLeft: 4 }}>({countMap[s] ?? 0})</span>
            </Link>
          );
        })}

        {/* Search */}
        <form method="GET" style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {status && <input type="hidden" name="status" value={status} />}
          <div className="admin-search" style={{ maxWidth: 220 }}>
            <i className="fas fa-search search-icon" />
            <input name="q" defaultValue={q} placeholder="Search customer..." className="admin-input" style={{ paddingLeft: 36 }} />
          </div>
          <button type="submit" className="btn-admin-secondary">Search</button>
        </form>
      </div>

      {/* Table */}
      <div className="data-card">
        <div className="data-card-header">
          <h2 className="data-card-title">
            {status ? `${status} Orders` : "All Orders"} ({orders.length})
          </h2>
        </div>
        <div className="data-card-body">
          {orders.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-receipt" />
              <p>No orders found.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
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
                {orders.map((o) => {
                  const sc = STATUS_COLORS[o.status] ?? { bg: "#f0f0f0", color: "#555" };
                  return (
                    <tr key={o.id}>
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#d10024", fontSize: "0.82rem" }}>
                          #{o.id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{o.user.name ?? "—"}</div>
                        <div style={{ fontSize: "0.75rem", color: "#888" }}>{o.user.email}</div>
                      </td>
                      <td style={{ color: "#666", fontSize: "0.82rem" }}>
                        {new Date(o.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ fontWeight: 600 }}>{o.items.length}</td>
                      <td style={{ fontWeight: 700, color: "#1e2030" }}>${o.total.toFixed(2)}</td>
                      <td>
                        <span style={{ background: sc.bg, color: sc.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.8rem", color: "#888", fontFamily: "monospace" }}>
                        {o.trackingNo ?? "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <a href={`/api/invoices/${o.id}`} target="_blank" className="btn-icon danger" title="Download Invoice">
                            <i className="fas fa-file-pdf" />
                          </a>
                          <OrderStatusForm orderId={o.id} current={o.status} tracking={o.trackingNo ?? ""} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
