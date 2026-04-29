import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

const STEPS = ["PENDING", "PAID", "SHIPPED", "DELIVERED"] as const;

export default async function OrderDetailPage({ params, searchParams }: {
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

  const stepIndex = order.status === "CANCELLED" ? -1 : STEPS.indexOf(order.status as typeof STEPS[number]);

  return (
    <div className="container py-5">
      {searchParams.success && (
        <div className="alert alert-success mb-4 d-flex align-items-center gap-3">
          <i className="fas fa-check-circle fa-2x" />
          <div>
            <strong>Payment successful!</strong> Your order has been placed.
          </div>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--dark)" }}>
            Order #{order.id.slice(-8).toUpperCase()}
          </h2>
          <small className="text-muted">Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })}</small>
        </div>
        <div className="d-flex gap-2">
          <Link href="/orders" className="btn btn-outline-secondary btn-sm">← All Orders</Link>
          <a href={`/api/invoices/${order.id}`} target="_blank" className="btn btn-sm btn-electro">
            <i className="fas fa-download me-1" /> Invoice PDF
          </a>
        </div>
      </div>

      {/* Tracking timeline */}
      <div className="card border-0 shadow-sm p-4 mb-4">
        <h5 className="fw-bold mb-4">Order Status</h5>
        {order.status === "CANCELLED" ? (
          <div className="alert alert-danger">This order has been cancelled.</div>
        ) : (
          <div className="d-flex align-items-center">
            {STEPS.map((step, i) => (
              <div key={step} className="d-flex align-items-center flex-grow-1">
                <div className="text-center" style={{ minWidth: 80 }}>
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1"
                    style={{
                      width: 40, height: 40,
                      background: i <= stepIndex ? "var(--primary)" : "#e4e7ed",
                      color: i <= stepIndex ? "#fff" : "#999",
                    }}
                  >
                    <i className={`fas ${
                      step === "PENDING" ? "fa-clock" :
                      step === "PAID" ? "fa-credit-card" :
                      step === "SHIPPED" ? "fa-truck" : "fa-check"
                    }`} />
                  </div>
                  <small className={i <= stepIndex ? "fw-semibold" : "text-muted"}>{step}</small>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className="flex-grow-1"
                    style={{ height: 3, background: i < stepIndex ? "var(--primary)" : "#e4e7ed", margin: "0 4px 18px" }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
        {order.trackingNo && (
          <p className="mt-3 mb-0 text-muted">
            Tracking Number: <strong className="text-dark">{order.trackingNo}</strong>
          </p>
        )}
      </div>

      <div className="row g-4">
        {/* Items */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Items Ordered</h5>
              {order.items.map((item) => (
                <div key={item.id} className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                  <div className="border rounded d-flex align-items-center justify-content-center"
                    style={{ width: 60, height: 60, background: "#f8f9fa", flexShrink: 0 }}>
                    {item.product.images[0] ? (
                      <Image src={item.product.images[0]} alt={item.product.name} width={50} height={50} style={{ objectFit: "contain" }} />
                    ) : (
                      <i className="fas fa-image text-muted" />
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <Link href={`/product/${item.product.slug}`} className="text-decoration-none fw-semibold" style={{ color: "var(--dark)" }}>
                      {item.product.name}
                    </Link>
                    <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>Qty: {item.quantity}</p>
                  </div>
                  <span className="fw-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="d-flex justify-content-between fw-bold fs-5 mt-2">
                <span>Total</span>
                <span style={{ color: "var(--primary)" }}>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Shipping Address</h5>
              <p className="mb-1 fw-semibold">{order.address.name}</p>
              <p className="text-muted mb-1">{order.address.street}</p>
              <p className="text-muted mb-1">{order.address.city}, {order.address.zip}</p>
              <p className="text-muted mb-0">{order.address.country}</p>
              {order.address.phone && <p className="text-muted mt-1">{order.address.phone}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
