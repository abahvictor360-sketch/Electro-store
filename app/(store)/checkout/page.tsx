"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <p>Your cart is empty. <Link href="/store">Shop now</Link></p>
      </div>
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
      setError(d.error ?? "Checkout failed");
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4" style={{ color: "var(--dark)" }}>Checkout</h2>
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-4">Shipping Information</h5>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleCheckout} id="checkoutForm">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input name="name" className="form-control" required />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Street Address</label>
                  <input name="street" className="form-control" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">City</label>
                  <input name="city" className="form-control" required />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">ZIP Code</label>
                  <input name="zip" className="form-control" required />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Country</label>
                  <input name="country" className="form-control" required defaultValue="US" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Phone Number</label>
                  <input name="phone" type="tel" className="form-control" />
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-3">Order Summary</h5>
            {items.map((item) => (
              <div key={item.id} className="d-flex justify-content-between mb-2">
                <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                  {item.name} × {item.quantity}
                </span>
                <span className="fw-semibold">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5 mb-1">
              <span>Total</span>
              <span style={{ color: "var(--primary)" }}>${total().toFixed(2)}</span>
            </div>
            <small className="text-muted d-block mb-4">Free shipping on all orders</small>

            <div className="p-3 rounded mb-4" style={{ background: "#f8f9fa", border: "1px solid #e4e7ed" }}>
              <p className="mb-1 fw-semibold"><i className="fab fa-cc-stripe me-2 text-primary" />Secure Payment via Stripe</p>
              <small className="text-muted">You&apos;ll be redirected to Stripe to complete payment.</small>
            </div>

            <button
              type="submit"
              form="checkoutForm"
              className="btn btn-electro w-100 py-2"
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" />Processing...</>
              ) : (
                <>Pay ${total().toFixed(2)} <i className="fas fa-lock ms-2" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
