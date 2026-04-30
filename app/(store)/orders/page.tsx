import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const STATUS_STEPS = ["PENDING", "PAID", "SHIPPED", "DELIVERED"];

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  PENDING:   { label: "Pending",   color: "#92400e", bg: "#fef3c7", icon: "fa-clock" },
  PAID:      { label: "Paid",      color: "#155e75", bg: "#cffafe", icon: "fa-check-circle" },
  SHIPPED:   { label: "Shipped",   color: "#1e40af", bg: "#dbeafe", icon: "fa-truck" },
  DELIVERED: { label: "Delivered", color: "#065f46", bg: "#d1fae5", icon: "fa-box-check" },
  CANCELLED: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2", icon: "fa-times-circle" },
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: true } }, address: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      {/* BREADCRUMB */}
      <div id="breadcrumb" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul className="breadcrumb-tree">
                <li><Link href="/">Home</Link></li>
                <li className="active">My Orders</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="section" style={{ padding: "30px 0 60px" }}>
        <div className="container">
          <div className="row">

            {/* Sidebar */}
            <div className="col-md-3 hidden-sm hidden-xs">
              <div className="user-dash-sidebar">
                <div style={{ padding: "20px", borderBottom: "1px solid #f0f2f7" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#d10024", color: "#fff", fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    {(session.user.name ?? session.user.email ?? "U")[0].toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 700, color: "#2b2d42", fontSize: "0.95rem" }}>{session.user.name ?? "User"}</div>
                  <div style={{ fontSize: "0.78rem", color: "#999" }}>{session.user.email}</div>
                </div>
                <nav style={{ padding: "8px 0" }}>
                  {[
                    { href: "/orders",   icon: "fa-receipt",    label: "My Orders",  active: true },
                    { href: "/wishlist", icon: "fa-heart",      label: "Wishlist" },
                    { href: "/profile",  icon: "fa-user",       label: "Profile" },
                    { href: "/store",    icon: "fa-shopping-bag", label: "Continue Shopping" },
                  ].map((item) => (
                    <div key={item.href} className="nav-item">
                      <Link href={item.href} className={item.active ? "active" : ""}>
                        <i className={`fa ${item.icon}`} style={{ width: 18, color: item.active ? "#d10024" : undefined }} />
                        {item.label}
                      </Link>
                    </div>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main content */}
            <div className="col-md-9">
              {orders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 20px", background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}>
                  <i className="fa fa-shopping-bag" style={{ fontSize: 48, color: "#eee", display: "block", marginBottom: 20 }} />
                  <h4 style={{ color: "#2b2d42", fontFamily: "Montserrat, sans-serif", fontWeight: 700, marginBottom: 10 }}>No orders yet</h4>
                  <p style={{ color: "#999", marginBottom: 24 }}>You haven&apos;t placed any orders. Start shopping now!</p>
                  <Link href="/store" className="primary-btn">Shop Now</Link>
                </div>
              ) : (
                <div>
                  {orders.map((order) => {
                    const meta = STATUS_META[order.status] ?? STATUS_META.PENDING;
                    const stepIndex = STATUS_STEPS.indexOf(order.status);

                    return (
                      <div key={order.id} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.06)", marginBottom: 20, overflow: "hidden" }}>
                        {/* Order header */}
                        <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f2f7", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <div>
                              <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#d10024", fontSize: "0.9rem" }}>
                                #{order.id.slice(-8).toUpperCase()}
                              </span>
                              <span style={{ color: "#999", fontSize: "0.8rem", marginLeft: 12 }}>
                                {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ background: meta.bg, color: meta.color, padding: "4px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700 }}>
                              <i className={`fa ${meta.icon}`} style={{ marginRight: 6 }} />
                              {meta.label}
                            </span>
                            <span style={{ fontWeight: 700, color: "#2b2d42", fontSize: "1rem" }}>
                              ${order.total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Progress bar (not for cancelled) */}
                        {order.status !== "CANCELLED" && (
                          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0f2f7" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              {STATUS_STEPS.map((s, i) => {
                                const done = i <= stepIndex;
                                const current = i === stepIndex;
                                return (
                                  <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STATUS_STEPS.length - 1 ? 1 : undefined }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? "#d10024" : "#f0f2f7", color: done ? "#fff" : "#bbb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, border: current ? "3px solid #d10024" : "none", boxSizing: "border-box" }}>
                                        {done ? <i className="fa fa-check" /> : i + 1}
                                      </div>
                                      <span style={{ fontSize: "0.65rem", color: done ? "#d10024" : "#bbb", fontWeight: done ? 600 : 400, whiteSpace: "nowrap" }}>
                                        {s.charAt(0) + s.slice(1).toLowerCase()}
                                      </span>
                                    </div>
                                    {i < STATUS_STEPS.length - 1 && (
                                      <div style={{ flex: 1, height: 2, background: i < stepIndex ? "#d10024" : "#f0f2f7", margin: "0 4px", marginBottom: 18 }} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            {order.trackingNo && (
                              <p style={{ marginTop: 12, marginBottom: 0, fontSize: "0.8rem", color: "#666" }}>
                                <i className="fa fa-truck" style={{ marginRight: 6, color: "#d10024" }} />
                                Tracking: <strong>{order.trackingNo}</strong>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Items */}
                        <div style={{ padding: "12px 24px" }}>
                          {order.items.slice(0, 3).map((item) => {
                            const img = item.product.images?.[0] || "/img/product01.png";
                            return (
                              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #f9fafb" }}>
                                <div style={{ width: 44, height: 44, borderRadius: 8, border: "1px solid #f0f2f7", background: "#f8f9fc", overflow: "hidden", flexShrink: 0 }}>
                                  <img src={img} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", color: "#2b2d42", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {item.product.name}
                                  </p>
                                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#999" }}>
                                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                                  </p>
                                </div>
                                <span style={{ fontWeight: 700, color: "#2b2d42", flexShrink: 0 }}>
                                  ${(item.quantity * item.price).toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                          {order.items.length > 3 && (
                            <p style={{ margin: "8px 0 0", fontSize: "0.8rem", color: "#999" }}>
                              + {order.items.length - 3} more item(s)
                            </p>
                          )}
                        </div>

                        {/* Footer actions */}
                        <div style={{ padding: "12px 24px", background: "#fafbfd", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                          <Link href={`/orders/${order.id}`} className="primary-btn" style={{ padding: "8px 18px", fontSize: "0.8rem" }}>
                            View Details
                          </Link>
                          <a href={`/api/invoices/${order.id}`} target="_blank" style={{ padding: "8px 18px", fontSize: "0.8rem", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 3, color: "#555", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <i className="fa fa-download" /> Invoice
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
