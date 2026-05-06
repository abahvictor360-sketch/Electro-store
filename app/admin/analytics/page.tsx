import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Build last-N-months labels
function getLast6Months() {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    });
  }
  return months;
}

export default async function AnalyticsPage() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    allOrders,
    statusCounts,
    orderItemGroups,
    totalRevenue,
    totalCustomers,
    totalProducts,
  ] = await Promise.all([
    // Orders from last 6 months for monthly breakdown
    prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    }),
    // Orders grouped by status (all time)
    prisma.order.groupBy({ by: ["status"], _count: true, _sum: { total: true } }),
    // Top products by units sold
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 8,
    }),
    // Total revenue (non-cancelled)
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count(),
  ]);

  // Monthly revenue map
  const months = getLast6Months();
  const monthlyMap: Record<string, number> = {};
  for (const o of allOrders) {
    const key = o.createdAt.toISOString().slice(0, 7);
    monthlyMap[key] = (monthlyMap[key] ?? 0) + o.total;
  }
  const monthlyData = months.map((m) => ({ ...m, revenue: monthlyMap[m.key] ?? 0 }));
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue), 1);

  // Top products — fetch names
  const productIds = orderItemGroups.map((g) => g.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, category: true, images: true, price: true },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
  const topProducts = orderItemGroups
    .map((g) => ({ ...g, product: productMap[g.productId] }))
    .filter((g) => g.product);

  // Status breakdown
  const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
    PENDING:   { label: "Pending",   color: "#92400e", bg: "#fef3c7" },
    PAID:      { label: "Paid",      color: "#155e75", bg: "#cffafe" },
    SHIPPED:   { label: "Shipped",   color: "#1e40af", bg: "#dbeafe" },
    DELIVERED: { label: "Delivered", color: "#065f46", bg: "#d1fae5" },
    CANCELLED: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2" },
  };
  const totalOrderCount = statusCounts.reduce((a, c) => a + c._count, 0) || 1;
  const revenue = totalRevenue._sum.total ?? 0;

  // KPI cards
  const kpis = [
    { label: "Total Revenue", value: `$${revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: "fa-dollar-sign", color: "#10b981", bg: "#ecfdf5" },
    { label: "Total Orders", value: totalOrderCount.toString(), icon: "fa-receipt", color: "#3b82f6", bg: "#eff6ff" },
    { label: "Customers", value: totalCustomers.toString(), icon: "fa-users", color: "#8b5cf6", bg: "#f5f3ff" },
    { label: "Products Listed", value: totalProducts.toString(), icon: "fa-box", color: "#f59e0b", bg: "#fffbeb" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "#1e2030" }}>Analytics</h1>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: "0.82rem" }}>Store performance overview</p>
        </div>
        <Link href="/admin" className="btn-as">
          <i className="fas fa-arrow-left" style={{ marginRight: 6 }} /> Dashboard
        </Link>
      </div>

      {/* KPI row */}
      <div className="row g-3 mb-4">
        {kpis.map((k) => (
          <div key={k.label} className="col-sm-6 col-xl-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: k.bg, color: k.color }}>
                <i className={`fas ${k.icon}`} />
              </div>
              <div>
                <div className="stat-label">{k.label}</div>
                <div className="stat-value">{k.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Revenue chart */}
        <div className="col-lg-8">
          <div className="data-card">
            <div className="data-card-header">
              <h2 className="data-card-title">Revenue — Last 6 Months</h2>
              <span style={{ fontSize: "0.78rem", color: "#aaa" }}>Excludes cancelled orders</span>
            </div>
            <div style={{ padding: "24px 24px 16px" }}>
              {/* Bar chart */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 180 }}>
                {monthlyData.map((m) => {
                  const pct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={m.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      {m.revenue > 0 && (
                        <span style={{ fontSize: "0.65rem", color: "#888", fontWeight: 600 }}>
                          ${m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(1)}k` : m.revenue.toFixed(0)}
                        </span>
                      )}
                      <div
                        style={{
                          width: "100%", borderRadius: "6px 6px 0 0",
                          background: pct > 0 ? "linear-gradient(180deg,#d10024 0%,#ff4d6d 100%)" : "#f0f2f7",
                          height: `${Math.max(pct, pct > 0 ? 4 : 0)}%`,
                          minHeight: pct > 0 ? 8 : 4,
                          transition: "height 0.3s",
                        }}
                        title={`$${m.revenue.toFixed(2)}`}
                      />
                    </div>
                  );
                })}
              </div>
              {/* X-axis labels */}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                {monthlyData.map((m) => (
                  <div key={m.key} style={{ flex: 1, textAlign: "center", fontSize: "0.72rem", color: "#aaa", fontWeight: 600 }}>
                    {m.label}
                  </div>
                ))}
              </div>
              {monthlyData.every((m) => m.revenue === 0) && (
                <p style={{ textAlign: "center", color: "#ccc", marginTop: 16, fontSize: "0.85rem" }}>
                  No revenue data in the last 6 months yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="col-lg-4">
          <div className="data-card" style={{ height: "100%" }}>
            <div className="data-card-header">
              <h2 className="data-card-title">Orders by Status</h2>
            </div>
            <div style={{ padding: "20px" }}>
              {statusCounts.length === 0 ? (
                <p style={{ color: "#ccc", textAlign: "center", padding: "30px 0" }}>No orders yet</p>
              ) : (
                statusCounts.map((s) => {
                  const meta = STATUS_META[s.status] ?? { label: s.status, color: "#666", bg: "#f0f0f0" };
                  const pct = Math.round((s._count / totalOrderCount) * 100);
                  return (
                    <div key={s.status} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 600, color: meta.color }}>{meta.label}</span>
                        <span style={{ fontSize: "0.78rem", color: "#888" }}>{s._count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: "#f0f2f7", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: meta.color, borderRadius: 4, transition: "width 0.3s" }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top products */}
      <div className="data-card" style={{ marginTop: 24 }}>
        <div className="data-card-header">
          <h2 className="data-card-title">Top Selling Products</h2>
          <Link href="/admin/products" className="btn-as" style={{ fontSize: "0.78rem" }}>
            All Products <i className="fas fa-arrow-right" style={{ marginLeft: 4 }} />
          </Link>
        </div>
        <div className="data-card-body">
          {topProducts.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-box-open" />
              <p>No sales data yet</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Units Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((g, i) => {
                  const p = g.product;
                  const units = g._sum.quantity ?? 0;
                  const rev = units * p.price;
                  return (
                    <tr key={g.productId}>
                      <td style={{ color: "#aaa", fontWeight: 700 }}>#{i + 1}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", background: "#f8f9fc", flexShrink: 0 }}>
                            <img
                              src={p.images?.[0] || "/img/product01.png"}
                              alt={p.name}
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          </div>
                          <Link href={`/admin/products/${g.productId}`} style={{ fontWeight: 600, color: "#1e2030", textDecoration: "none", fontSize: "0.855rem" }}>
                            {p.name}
                          </Link>
                        </div>
                      </td>
                      <td>
                        <span style={{ background: "#f0f2f7", color: "#555", fontSize: "0.75rem", fontWeight: 600, padding: "3px 8px", borderRadius: 4 }}>
                          {p.category}
                        </span>
                      </td>
                      <td>${p.price.toFixed(2)}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: "#1e2030" }}>{units}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: "#10b981" }}>${rev.toFixed(2)}</td>
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
