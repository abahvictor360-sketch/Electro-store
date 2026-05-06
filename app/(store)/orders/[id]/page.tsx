import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STEPS = ["PENDING", "PAID", "SHIPPED", "DELIVERED"] as const;

const STEP_ICONS: Record<string, string> = {
  PENDING:   "fa-clock-o",
  PAID:      "fa-credit-card",
  SHIPPED:   "fa-truck",
  DELIVERED: "fa-check",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { success?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } }, address: true },
  });

  if (!order || order.userId !== session.user.id) notFound();

  const stepIndex =
    order.status === "CANCELLED" ? -1 : STEPS.indexOf(order.status as typeof STEPS[number]);

  return (
    <div className="section">
      <div className="container">

        {/* Success alert */}
        {searchParams.success && (
          <div
            style={{
              background: "#d1fae5",
              border: "1px solid #6ee7b7",
              borderRadius: 6,
              padding: "14px 20px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "#065f46",
            }}
          >
            <i className="fa fa-check-circle fa-2x" />
            <div>
              <strong>Payment successful!</strong> Your order has been placed.
            </div>
          </div>
        )}

        {/* Page header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontWeight: 700, color: "#2B2D42" }}>
              Order #{order.id.slice(-8).toUpperCase()}
            </h2>
            <small style={{ color: "#888" }}>
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </small>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link
              href="/orders"
              style={{
                padding: "8px 16px",
                border: "1px solid #E4E7ED",
                borderRadius: 4,
                color: "#555",
                textDecoration: "none",
                fontSize: "0.875rem",
                background: "#fff",
              }}
            >
              ← All Orders
            </Link>
            <a
              href={`/api/invoices/${order.id}`}
              target="_blank"
              className="primary-btn"
              style={{ padding: "8px 16px", fontSize: "0.875rem" }}
            >
              <i className="fa fa-download" style={{ marginRight: 6 }} />
              Invoice PDF
            </a>
          </div>
        </div>

        {/* ── Tracking timeline ── */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #E4E7ED",
            borderRadius: 8,
            padding: "24px",
            marginBottom: 24,
          }}
        >
          <h5 style={{ margin: "0 0 20px", fontWeight: 700, color: "#2B2D42" }}>Order Status</h5>

          {order.status === "CANCELLED" ? (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fca5a5",
                borderRadius: 6,
                padding: "12px 18px",
                color: "#991b1b",
              }}
            >
              This order has been cancelled.
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center" }}>
              {STEPS.map((step, i) => (
                <div
                  key={step}
                  style={{ flex: 1, display: "flex", alignItems: "center" }}
                >
                  <div style={{ textAlign: "center", minWidth: 80 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background: i <= stepIndex ? "#D10024" : "#E4E7ED",
                        color: i <= stepIndex ? "#fff" : "#999",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                        fontSize: 16,
                      }}
                    >
                      <i className={`fa ${STEP_ICONS[step]}`} />
                    </div>
                    <small
                      style={{
                        fontWeight: i <= stepIndex ? 700 : 400,
                        color: i <= stepIndex ? "#2B2D42" : "#aaa",
                        fontSize: "0.75rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {step.charAt(0) + step.slice(1).toLowerCase()}
                    </small>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 3,
                        background: i < stepIndex ? "#D10024" : "#E4E7ED",
                        margin: "0 4px 20px",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {order.trackingNo && (
            <p style={{ marginTop: 16, marginBottom: 0, color: "#888" }}>
              Tracking Number:{" "}
              <strong style={{ color: "#2B2D42" }}>{order.trackingNo}</strong>
            </p>
          )}
        </div>

        {/* ── Items + Address ── */}
        <div className="row">
          {/* Items ordered */}
          <div className="col-md-7">
            <div
              style={{
                background: "#fff",
                border: "1px solid #E4E7ED",
                borderRadius: 8,
                padding: "24px",
                marginBottom: 20,
              }}
            >
              <h5 style={{ margin: "0 0 20px", fontWeight: 700, color: "#2B2D42" }}>
                Items Ordered
              </h5>
              {order.items.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    paddingBottom: 16,
                    marginBottom: 16,
                    borderBottom:
                      idx < order.items.length - 1 ? "1px solid #f0f2f7" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 62,
                      height: 62,
                      border: "1px solid #E4E7ED",
                      borderRadius: 6,
                      background: "#f8f9fc",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {item.product.images[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <i className="fa fa-image" style={{ color: "#ccc", fontSize: 20 }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Link
                      href={`/product/${item.product.slug}`}
                      style={{ fontWeight: 600, color: "#2B2D42", textDecoration: "none" }}
                    >
                      {item.product.name}
                    </Link>
                    <p style={{ margin: "3px 0 0", fontSize: "0.82rem", color: "#888" }}>
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span style={{ fontWeight: 600, color: "#2B2D42" }}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 8,
                  fontWeight: 700,
                  fontSize: "1.05rem",
                }}
              >
                <span>Total</span>
                <span style={{ color: "#D10024" }}>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="col-md-5">
            <div
              style={{
                background: "#fff",
                border: "1px solid #E4E7ED",
                borderRadius: 8,
                padding: "24px",
              }}
            >
              <h5 style={{ margin: "0 0 16px", fontWeight: 700, color: "#2B2D42" }}>
                Shipping Address
              </h5>
              <p style={{ margin: "0 0 6px", fontWeight: 600, color: "#2B2D42" }}>
                {order.address.name}
              </p>
              <p style={{ margin: "0 0 4px", color: "#666" }}>{order.address.street}</p>
              <p style={{ margin: "0 0 4px", color: "#666" }}>
                {order.address.city}, {order.address.zip}
              </p>
              <p style={{ margin: "0 0 4px", color: "#666" }}>{order.address.country}</p>
              {order.address.phone && (
                <p style={{ margin: "6px 0 0", color: "#888" }}>{order.address.phone}</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
