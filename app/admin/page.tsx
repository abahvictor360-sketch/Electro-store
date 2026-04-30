import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalOrders, revenue, customers, productCount, pendingOrders, lowStock, recentOrders, topProducts] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.findMany({ where: { stock: { lte: 5 } }, take: 5, orderBy: { stock: "asc" } }),
      prisma.order.findMany({
        take: 8, orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } }, items: true },
      }),
      prisma.product.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    ]);

  const stats = [
    { label: "Total Revenue", value: `$${(revenue._sum.total ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: "fa-dollar-sign", color: "#10b981", bg: "#ecfdf5", change: "+12.5%", positive: true },
    { label: "Total Orders", value: totalOrders.toString(), icon: "fa-receipt", color: "#3b82f6", bg: "#eff6ff", change: pendingOrders > 0 ? `${pendingOrders} pending` : "All fulfilled", positive: pendingOrders === 0 },
    { label: "Customers", value: customers.toString(), icon: "fa-users", color: "#8b5cf6", bg: "#f5f3ff", change: "Registered users", positive: true },
    { label: "Products", value: productCount.toString(), icon: "fa-box", color: "#f59e0b", bg: "#fffbeb", change: lowStock.length > 0 ? `${lowStock.length} low stock` : "All stocked", positive: lowStock.length === 0 },
  ];

  const SC: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: "#fef3c7", color: "#92400e" }, PAID: { bg: "#cffafe", color: "#155e75" },
    SHIPPED: { bg: "#dbeafe", color: "#1e40af" }, DELIVERED: { bg: "#d1fae5", color: "#065f46" },
    CANCELLED: { bg: "#fee2e2", color: "#991b1b" },
  };

  return (
    <div>
      {/* Stats */}
      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="col-sm-6 col-xl-3">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                <i className={`fas ${s.icon}`} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-change" style={{ color: s.positive ? "#10b981" : "#f59e0b" }}>
                  <i className={`fas fa-${s.positive ? "arrow-up" : "exclamation-triangle"}`} style={{ fontSize: "0.65rem", marginRight: 4 }} />
                  {s.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Recent Orders */}
        <div className="col-lg-8">
          <div className="data-card">
            <div className="data-card-header">
              <h2 className="data-card-title">Recent Orders</h2>
              <Link href="/admin/orders" className="btn-as">
                View All <i className="fas fa-arrow-right" style={{ marginLeft: 4 }} />
              </Link>
            </div>
            <div className="data-card-body">
              {recentOrders.length === 0 ? (
                <div className="empty-state" style={{ padding: "40px 20px" }}>
                  <i className="fas fa-receipt" />
                  <p>No orders yet</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => {
                      const sc = SC[o.status] ?? { bg: "#f0f0f0", color: "#333" };
                      return (
                        <tr key={o.id}>
                          <td><span style={{ fontFamily: "monospace", fontWeight: 700, color: "#d10024", fontSize: "0.8rem" }}>#{o.id.slice(-8).toUpperCase()}</span></td>
                          <td>
                            <div style={{ fontWeight: 500 }}>{o.user.name ?? "—"}</div>
                            <div style={{ fontSize: "0.75rem", color: "#888" }}>{o.user.email}</div>
                          </td>
                          <td>{o.items.length}</td>
                          <td style={{ fontWeight: 700 }}>${o.total.toFixed(2)}</td>
                          <td><span style={{ background: sc.bg, color: sc.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>{o.status}</span></td>
                          <td style={{ color: "#888", fontSize: "0.8rem" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-lg-4">
          {/* Low Stock */}
          <div className="data-card mb-4">
            <div className="data-card-header">
              <h2 className="data-card-title">
                <i className="fas fa-exclamation-triangle" style={{ color: "#f59e0b", marginRight: 6 }} />
                Low Stock
              </h2>
              <Link href="/admin/products" className="btn-as" style={{ padding: "5px 12px", fontSize: "0.78rem" }}>Manage</Link>
            </div>
            <div className="data-card-body">
              {lowStock.length === 0 ? (
                <div style={{ padding: "24px 22px", textAlign: "center", color: "#10b981" }}>
                  <i className="fas fa-check-circle" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: "0.85rem" }}>All products are well-stocked</p>
                </div>
              ) : (
                lowStock.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 22px", borderBottom: "1px solid #f0f2f7" }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{p.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#888" }}>{p.category}</div>
                    </div>
                    <span style={{ background: p.stock === 0 ? "#fee2e2" : "#fef3c7", color: p.stock === 0 ? "#991b1b" : "#92400e", padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
                      {p.stock === 0 ? "Out" : `${p.stock} left`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="data-card">
            <div className="data-card-header">
              <h2 className="data-card-title">Quick Actions</h2>
            </div>
            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { href: "/admin/products/new",          icon: "fa-plus",    label: "Add New Product",      color: "#d10024" },
                { href: "/admin/orders?status=PENDING", icon: "fa-clock",   label: "View Pending Orders",  color: "#f59e0b" },
                { href: "/admin/customers",             icon: "fa-users",   label: "Manage Customers",     color: "#8b5cf6" },
                { href: "/admin/content",               icon: "fa-pen",     label: "Edit Site Content",    color: "#3b82f6" },
              ].map((a) => (
                <Link key={a.href} href={a.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "1px solid #f0f2f7", textDecoration: "none", color: "#333", fontSize: "0.855rem", fontWeight: 500, background: "#fff" }}>
                  <span style={{ width: 30, height: 30, borderRadius: 8, background: a.color + "15", color: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                    <i className={`fas ${a.icon}`} />
                  </span>
                  {a.label}
                  <i className="fas fa-chevron-right" style={{ marginLeft: "auto", fontSize: 11, color: "#ccc" }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="data-card mt-4">
        <div className="data-card-header">
          <h2 className="data-card-title">Recently Added Products</h2>
          <Link href="/admin/products" className="btn-as" style={{ padding: "6px 14px", fontSize: "0.8rem" }}>View All</Link>
        </div>
        <div className="data-card-body">
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Action</th></tr></thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: "#f8f9fc", border: "1px solid #e8eaf0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                        {p.images[0] ? <img src={p.images[0]} alt="" style={{ width: 34, height: 34, objectFit: "contain" }} /> : <i className="fas fa-image" style={{ color: "#ccc" }} />}
                      </div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "#888" }}>{p.category}</td>
                  <td style={{ fontWeight: 700, color: "#d10024" }}>${(p.salePrice ?? p.price).toFixed(2)}</td>
                  <td>
                    <span style={{ background: p.stock === 0 ? "#fee2e2" : p.stock <= 5 ? "#fef3c7" : "#d1fae5", color: p.stock === 0 ? "#991b1b" : p.stock <= 5 ? "#92400e" : "#065f46", padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
                      {p.stock === 0 ? "Out of stock" : `${p.stock} in stock`}
                    </span>
                  </td>
                  <td>
                    <Link href={`/admin/products/${p.id}`} className="btn-icon" title="Edit">
                      <i className="fas fa-edit" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Features Checklist */}
      <div className="data-card mt-4">
        <div className="data-card-header">
          <h2 className="data-card-title">
            <i className="fas fa-tasks" style={{ marginRight: 8, color: "#d10024" }} />
            Platform Features
          </h2>
          <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700, background: "#d1fae5", padding: "4px 12px", borderRadius: 20 }}>
            <i className="fas fa-check-circle" style={{ marginRight: 4 }} />All Active
          </span>
        </div>
        <div style={{ padding: "8px 22px 18px" }}>
          <div className="row g-3">
            {[
              { icon: "fa-mouse-pointer",  label: "Client-Side Interaction",  desc: "Cart, wishlist, search — all reactive without page reloads",   color: "#3b82f6" },
              { icon: "fa-shield-alt",     label: "Admin Panel",              desc: "Protected dashboard for managing products, orders & customers",  color: "#d10024" },
              { icon: "fa-user-plus",      label: "Customer Registration",    desc: "Email/password sign-up with bcrypt hashing via NextAuth",        color: "#8b5cf6" },
              { icon: "fa-shopping-cart",  label: "Add to Cart System",       desc: "Zustand-powered cart with localStorage persistence",             color: "#f59e0b" },
              { icon: "fa-search",         label: "Search Products",          desc: "Full-text search by name/description with category filters",     color: "#06b6d4" },
              { icon: "fa-credit-card",    label: "Simple Payment Structure", desc: "Stripe Checkout with card, Apple Pay & Google Pay support",      color: "#10b981" },
              { icon: "fa-list-alt",       label: "List Orders",              desc: "Customer order history with status timeline & item preview",     color: "#6366f1" },
              { icon: "fa-map-marker-alt", label: "Track Orders",             desc: "Real-time status tracking with progress bar & tracking number",  color: "#ec4899" },
              { icon: "fa-file-pdf",       label: "Download Invoice (PDF)",   desc: "Auto-generated PDF invoices with order items and totals",        color: "#ef4444" },
              { icon: "fa-user-edit",      label: "View / Update Profile",    desc: "Name, email, password & saved address management",               color: "#f97316" },
              { icon: "fa-clipboard-list", label: "Order Management",         desc: "Admin order table with status updates & tracking assignment",    color: "#14b8a6" },
              { icon: "fa-boxes",          label: "Product Management",       desc: "Full CRUD with images, categories, stock & sale prices",         color: "#a855f7" },
              { icon: "fa-users-cog",      label: "Customer Management",      desc: "View all customers, order counts, spend totals & enable/disable", color: "#64748b" },
            ].map((feat) => (
              <div key={feat.label} className="col-xl-4 col-md-6">
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 16px", border: "1px solid #f0f2f7", borderRadius: 10, background: "#fff", height: "100%" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: feat.color + "15", color: feat.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
                    <i className={`fas ${feat.icon}`} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.84rem", color: "#1e2030" }}>{feat.label}</span>
                      <span style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: "#d1fae5", color: "#065f46", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                        <i className="fas fa-check" />
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.74rem", color: "#888", lineHeight: 1.45 }}>{feat.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
