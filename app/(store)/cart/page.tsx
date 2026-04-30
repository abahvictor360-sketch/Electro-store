"use client";

import { useCart } from "@/store/cart";
import Link from "next/link";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const total = useCart((s) => s.total);

  return (
    <>
      {/* BREADCRUMB */}
      <div id="breadcrumb" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul className="breadcrumb-tree">
                <li><Link href="/">Home</Link></li>
                <li className="active">Shopping Cart</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION */}
      <div className="section">
        <div className="container">
          {items.length === 0 ? (
            <div className="row">
              <div className="col-md-12 text-center" style={{ padding: "60px 0" }}>
                <i className="fa fa-shopping-cart fa-4x" style={{ color: "#ccc", marginBottom: 20, display: "block" }} />
                <h3>Your cart is empty</h3>
                <p>Add products to continue shopping.</p>
                <Link href="/store" className="primary-btn" style={{ marginTop: 20, display: "inline-block" }}>Browse Products</Link>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-md-9">
                <div className="cart-table-wrapper">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="product-widget">
                              <div className="product-img">
                                <img src={item.image || "/img/product01.png"} alt={item.name} />
                              </div>
                              <div className="product-body">
                                <h3 className="product-name">
                                  <Link href={`/product/${item.slug}`}>{item.name}</Link>
                                </h3>
                              </div>
                            </div>
                          </td>
                          <td>${item.price.toFixed(2)}</td>
                          <td>
                            <div className="input-number" style={{ width: 100 }}>
                              <input
                                type="number"
                                value={item.quantity}
                                min={1}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              />
                              <span className="qty-up" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</span>
                              <span className="qty-down" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</span>
                            </div>
                          </td>
                          <td>${(item.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <button
                              className="delete"
                              onClick={() => removeItem(item.id)}
                              style={{ background: "none", border: "none", cursor: "pointer" }}
                            >
                              <i className="fa fa-close" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div>
                    <Link href="/store" className="primary-btn">
                      <i className="fa fa-arrow-left" /> Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="cart-summary" style={{ padding: 20, border: "1px solid #e4e7ed" }}>
                  <h5>ORDER SUMMARY</h5>
                  <hr />
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span>Subtotal</span>
                    <strong>${total().toFixed(2)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <span>Shipping</span>
                    <strong style={{ color: "green" }}>Free</strong>
                  </div>
                  <hr />
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <strong>Total</strong>
                    <strong style={{ color: "#d10024", fontSize: "1.2rem" }}>${total().toFixed(2)}</strong>
                  </div>
                  <Link href="/checkout" className="primary-btn" style={{ display: "block", textAlign: "center" }}>
                    Proceed to Checkout <i className="fa fa-arrow-circle-right" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
