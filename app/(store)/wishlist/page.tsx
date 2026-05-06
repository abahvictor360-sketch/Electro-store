"use client";

import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import Link from "next/link";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  return (
    <>
      {/* BREADCRUMB */}
      <div id="breadcrumb" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul className="breadcrumb-tree">
                <li><Link href="/">Home</Link></li>
                <li className="active">Wishlist</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container" style={{ paddingBottom: 60 }}>

          {items.length === 0 ? (
            <div className="row">
              <div className="col-md-12 text-center" style={{ padding: "70px 0" }}>
                <i className="fa fa-heart-o fa-4x" style={{ color: "#ddd", display: "block", marginBottom: 20 }} />
                <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, color: "#2b2d42" }}>Your wishlist is empty</h3>
                <p style={{ color: "#999", marginBottom: 24 }}>Save products you love and come back to them anytime.</p>
                <Link href="/store" className="primary-btn">Browse Products</Link>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
                <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, color: "#2b2d42", margin: 0, fontSize: "1.4rem" }}>
                  My Wishlist
                </h2>
                <span style={{ color: "#999", fontSize: "0.88rem" }}>
                  {items.length} saved item{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="row">
                {items.map((item) => {
                  const price = item.salePrice ?? item.price;
                  const savings = item.salePrice
                    ? Math.round(((item.price - item.salePrice) / item.price) * 100)
                    : 0;

                  return (
                    <div key={item.id} className="col-md-4 col-sm-6" style={{ marginBottom: 24 }}>
                      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 1px 8px rgba(0,0,0,0.07)", overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>

                        {/* Image area */}
                        <div style={{ position: "relative", height: 200, background: "#f8f9fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {savings > 0 && (
                            <span style={{ position: "absolute", top: 10, left: 10, background: "#d10024", color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "3px 9px", borderRadius: 4 }}>
                              -{savings}%
                            </span>
                          )}
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ maxHeight: 170, maxWidth: "80%", objectFit: "contain" }}
                            />
                          ) : (
                            <i className="fa fa-image fa-3x" style={{ color: "#ddd" }} />
                          )}
                          {/* Remove button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            title="Remove from wishlist"
                            style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", background: "#fff", border: "1px solid #eee", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}
                          >
                            <i className="fa fa-times" style={{ color: "#e74c3c", fontSize: 12 }} />
                          </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                          <Link
                            href={`/product/${item.slug}`}
                            style={{ fontWeight: 600, color: "#2b2d42", textDecoration: "none", fontSize: "0.9rem", lineHeight: 1.4, marginBottom: 10, display: "block" }}
                          >
                            {item.name}
                          </Link>

                          <div style={{ marginBottom: 16 }}>
                            <span style={{ color: "#d10024", fontWeight: 700, fontSize: "1.1rem" }}>
                              ${price.toFixed(2)}
                            </span>
                            {item.salePrice && (
                              <del style={{ color: "#bbb", fontSize: "0.88rem", marginLeft: 8 }}>
                                ${item.price.toFixed(2)}
                              </del>
                            )}
                          </div>

                          {/* Actions */}
                          <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                            <button
                              className="add-to-cart-btn"
                              style={{ flex: 1, fontSize: "0.82rem" }}
                              onClick={() => {
                                addItem({ id: item.id, name: item.name, price, image: item.image, slug: item.slug });
                                removeItem(item.id);
                              }}
                            >
                              <i className="fa fa-shopping-cart" style={{ marginRight: 6 }} />
                              Move to Cart
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              title="Remove"
                              style={{ width: 38, height: 38, borderRadius: 6, border: "1px solid #f5c6cb", background: "#fff5f6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                            >
                              <i className="fa fa-trash" style={{ color: "#e74c3c", fontSize: 13 }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign: "center", marginTop: 10 }}>
                <Link href="/store" style={{ color: "#999", fontSize: "0.88rem", textDecoration: "none" }}>
                  <i className="fa fa-arrow-left" style={{ marginRight: 4 }} /> Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
