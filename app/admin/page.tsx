import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalOrders, revenue, customers, products, lowStock, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count(),
    prisma.product.findMany({ where: { stock: { lte: 5 } }, take: 5 }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } }, items: true },
    }),
  ]);

  const stats = [
    { label: "Total Revenue", value: `$${(revenue._sum.total ?? 0).toFixed(2)}`, icon: "fa-dollar-sign", color: "#198754" },
    { label: "Total Orders", value: totalOrders, icon: "fa-receipt", color: "#0d6efd" },
    { label: "Customers", value: customers, icon: "fa-users", color: "#6f42c1" },
    { label: "Products", value: products, icon: "fa-box", color: "#fd7e14" },
  ];

  const statusClass: Record<string, string> = {
    PENDING: "badge-pending", PAID: "badge-paid", SHIPPED: "badge-shipped",
    DELIVERED: "badge-delivered", CANCELLED: "badge-cancelled",
  };

  return (
    <div>
      <h2 className="fw-bold mb-4" style={{ color: "var(--dark)" }}>Dashboard</h2>

      <div className="row g-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm p-4 d-flex flex-row align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 52, height: 52, background: s.color + "20", flexShrink: 0 }}
              >
                <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: 20 }} />
              </div>
              <div>
                <p className="text-muted mb-1" style={{ fontSize: "0.8rem" }}>{s.label}</p>
                <h4 className="fw-bold mb-0">{s.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <h5 className="fw-bold">Recent Orders</h5>
                <Link href="/admin/orders" className="btn btn-sm btn-outline-secondary">View All</Link>
              </div>
              <div className="table-responsive">
                <table className="table mb-0">
                  <thead>
                    <tr>
                      <th>Order</th><th>Customer</th><th>Total</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="align-middle">
                        <td className="font-monospace" style={{ fontSize: "0.8rem" }}>
                          <Link href={`/admin/orders?id=${o.id}`}>#{o.id.slice(-8).toUpperCase()}</Link>
                        </td>
                        <td style={{ fontSize: "0.85rem" }}>{o.user.name ?? o.user.email}</td>
                        <td>${o.total.toFixed(2)}</td>
                        <td><span className={`badge ${statusClass[o.status]}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <h5 className="fw-bold">Low Stock Alert</h5>
                <Link href="/admin/products" className="btn btn-sm btn-outline-secondary">Manage</Link>
              </div>
              {lowStock.length === 0 ? (
                <p className="text-muted text-center py-3">All products are well-stocked.</p>
              ) : (
                lowStock.map((p) => (
                  <div key={p.id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                    <span style={{ fontSize: "0.9rem" }}>{p.name}</span>
                    <span className={`badge ${p.stock === 0 ? "bg-danger" : "bg-warning text-dark"}`}>
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
