"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <>
        <div id="breadcrumb" className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <ul className="breadcrumb-tree">
                  <li><Link href="/">Home</Link></li>
                  <li className="active">Checkout</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12 text-center" style={{ padding: "60px 0" }}>
                <i className="fa fa-shopping-cart fa-4x" style={{ color: "#ccc", marginBottom: 20, display: "block" }} />
                <h3>Your cart is empty</h3>
                <p>Add products before checking out.</p>
                <Link href="/store" className="primary-btn" style={{ marginTop: 20, display: "inline-block" }}>
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const res = await fetch("/api/payments/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items,
        address: {
          name: fd.get("name"),
          street: fd.get("street"),
          city: fd.get("city"),
          country: fd.get("country"),
          zip: fd.get("zip"),
          phone: fd.get("phone"),
        },
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Checkout failed. Please try again.");
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <>
      {/* BREADCRUMB */}
      <div id="breadcrumb" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul className="breadcrumb-tree">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/cart">Cart</Link></li>
                <li className="active">Checkout</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT SECTION */}
      <div className="section">
        <div className="container" style={{ paddingBottom: 60 }}>
          <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, color: "#2b2d42", marginBottom: 28, fontSize: "1.55rem" }}>
            Checkout
          </h2>

          <div className="row">
            {/* ── Shipping form ── */}
            <div className="col-md-7">
              <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", padding: 28, marginBottom: 20 }}>
                <h5 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, color: "#2b2d42", marginBottom: 22, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa fa-truck" style={{ color: "#d10024" }} /> Shipping Information
                </h5>

                {error && (
                  <div className="alert alert-danger" style={{ borderRadius: 8, marginBottom: 20 }}>
                    <i className="fa fa-exclamation-circle" style={{ marginRight: 6 }} />{error}
                  </div>
                )}

                <form onSubmit={handleCheckout} id="checkoutForm">
                  {/* Full name */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.84rem", color: "#555" }}>
                      Full Name <span style={{ color: "#d10024" }}>*</span>
                    </label>
                    <input name="name" className="form-control" required placeholder="John Doe" />
                  </div>

                  {/* Street */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.84rem", color: "#555" }}>
                      Street Address <span style={{ color: "#d10024" }}>*</span>
                    </label>
                    <input name="street" className="form-control" required placeholder="123 Main Street" />
                  </div>

                  {/* City / ZIP / Country */}
                  <div className="row">
                    <div className="col-md-5" style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.84rem", color: "#555" }}>
                        City <span style={{ color: "#d10024" }}>*</span>
                      </label>
                      <input name="city" className="form-control" required placeholder="New York" />
                    </div>
                    <div className="col-md-3" style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.84rem", color: "#555" }}>
                        ZIP <span style={{ color: "#d10024" }}>*</span>
                      </label>
                      <input name="zip" className="form-control" required placeholder="10001" />
                    </div>
                    <div className="col-md-4" style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.84rem", color: "#555" }}>
                        Country <span style={{ color: "#d10024" }}>*</span>
                      </label>
                      <input name="country" className="form-control" required defaultValue="US" placeholder="US" />
                    </div>
                  </div>

                  {/* Phone */}
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "0.84rem", color: "#555" }}>
                      Phone Number
                    </label>
                    <input name="phone" type="tel" className="form-control" placeholder="+1 555 000 0000" />
                  </div>
                </form>
              </div>
            </div>

            {/* ── Order summary ── */}
            <div className="col-md-5">
              <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", padding: 28 }}>
                <h5 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, color: "#2b2d42", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa fa-list-alt" style={{ color: "#d10024" }} /> Order Summary
                </h5>

                {/* Items */}
                <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 16 }}>
                  {items.map((item) => (
                    <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <div style={{ flex: 1, paddingRight: 10 }}>
                        <div style={{ fontSize: "0.86rem", color: "#2b2d42", fontWeight: 600, lineHeight: 1.3 }}>{item.name}</div>
                        <div style={{ fontSize: "0.76rem", color: "#999" }}>Qty: {item.quantity}</div>
                      </div>
                      <span style={{ fontWeight: 700, color: "#2b2d42", whiteSpace: "nowrap" }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ color: "#888" }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>${total().toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f0f2f7" }}>
                  <span style={{ color: "#888" }}>Shipping</span>
                  <span style={{ color: "#10b981", fontWeight: 600 }}>Free</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                  <span style={{ fontWeight: 700, fontSize: "1rem", color: "#2b2d42" }}>Total</span>
                  <span style={{ fontWeight: 800, fontSize: "1.25rem", color: "#d10024" }}>${total().toFixed(2)}</span>
                </div>

                {/* Stripe notice */}
                <div style={{ background: "#f8f9fc", borderRadius: 8, border: "1px solid #e4e7ed", padding: "12px 14px", marginBottom: 20 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.84rem", color: "#2b2d42" }}>
                    <i className="fa fa-lock" style={{ marginRight: 6, color: "#d10024" }} />
                    Secure Payment via Stripe
                  </p>
                  <small style={{ color: "#999" }}>You&apos;ll be redirected to Stripe to complete your payment.</small>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  form="checkoutForm"
                  disabled={loading}
                  className="primary-btn"
                  style={{ width: "100%", textAlign: "center", padding: "13px", fontSize: "0.95rem", justifyContent: "center", display: "flex", alignItems: "center", gap: 8, opacity: loading ? 0.75 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                >
                  {loading ? (
                    <><i className="fa fa-spinner fa-spin" /> Processing...</>
                  ) : (
                    <><i className="fa fa-lock" /> Pay ${total().toFixed(2)}</>
                  )}
                </button>

                <div style={{ textAlign: "center", marginTop: 14 }}>
                  <Link href="/cart" style={{ fontSize: "0.82rem", color: "#999", textDecoration: "none" }}>
                    <i className="fa fa-arrow-left" style={{ marginRight: 4 }} /> Back to cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
