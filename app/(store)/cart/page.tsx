"use client";

import { useCart } from "@/store/cart";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <i className="fas fa-shopping-cart fa-4x text-muted mb-4" />
        <h3>Your cart is empty</h3>
        <p className="text-muted mb-4">Add some products to continue shopping.</p>
        <Link href="/store" className="btn btn-electro px-4">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4" style={{ color: "var(--dark)" }}>Shopping Cart</h2>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <table className="table mb-0">
                <thead style={{ background: "#f8f9fa" }}>
                  <tr>
                    <th className="py-3 ps-3">Product</th>
                    <th className="py-3">Price</th>
                    <th className="py-3">Qty</th>
                    <th className="py-3">Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="align-middle">
                      <td className="ps-3 py-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="border rounded d-flex align-items-center justify-content-center"
                            style={{ width: 60, height: 60, background: "#f8f9fa", flexShrink: 0 }}
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.name} style={{ maxWidth: 50, maxHeight: 50, objectFit: "contain" }} />
                            ) : (
                              <i className="fas fa-image text-muted" />
                            )}
                          </div>
                          <Link href={`/product/${item.slug}`} className="text-decoration-none fw-semibold" style={{ color: "var(--dark)", fontSize: "0.9rem" }}>
                            {item.name}
                          </Link>
                        </div>
                      </td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <div className="d-flex align-items-center border rounded" style={{ width: "fit-content" }}>
                          <button
                            className="btn btn-sm px-2"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >−</button>
                          <span className="px-2">{item.quantity}</span>
                          <button
                            className="btn btn-sm px-2"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >+</button>
                        </div>
                      </td>
                      <td className="fw-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeItem(item.id)}
                        >
                          <i className="fas fa-times" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-3">
            <Link href="/store" className="btn btn-outline-secondary">
              <i className="fas fa-arrow-left me-2" /> Continue Shopping
            </Link>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3" style={{ color: "var(--dark)" }}>Order Summary</h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>${total().toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 mb-4">
                <span>Total</span>
                <span style={{ color: "var(--primary)" }}>${total().toFixed(2)}</span>
              </div>
              <Link href="/checkout" className="btn btn-electro w-100 py-2">
                Proceed to Checkout <i className="fas fa-arrow-right ms-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
