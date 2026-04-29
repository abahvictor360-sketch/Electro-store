"use client";

import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import Link from "next/link";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <i className="fas fa-heart fa-4x text-muted mb-4" />
        <h3>Your wishlist is empty</h3>
        <p className="text-muted mb-4">Save products you love and come back to them anytime.</p>
        <Link href="/store" className="btn btn-electro px-4">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-1" style={{ color: "var(--dark)" }}>My Wishlist</h2>
      <p className="text-muted mb-4">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>

      <div className="row g-3">
        {items.map((item) => {
          const price = item.salePrice ?? item.price;
          const savings = item.salePrice
            ? Math.round(((item.price - item.salePrice) / item.price) * 100)
            : 0;

          return (
            <div key={item.id} className="col-12 col-md-6 col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                {/* Image */}
                <div
                  className="d-flex align-items-center justify-content-center position-relative"
                  style={{ height: 200, background: "#f8f9fa" }}
                >
                  {savings > 0 && (
                    <span
                      className="position-absolute top-0 start-0 m-2 badge"
                      style={{ background: "var(--primary)", color: "#fff" }}
                    >
                      -{savings}%
                    </span>
                  )}
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ maxHeight: 180, maxWidth: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <i className="fas fa-image fa-3x text-secondary" />
                  )}
                  <button
                    className="position-absolute top-0 end-0 m-2 btn btn-sm btn-light rounded-circle"
                    onClick={() => removeItem(item.id)}
                    title="Remove from wishlist"
                    style={{ width: 32, height: 32, padding: 0 }}
                  >
                    <i className="fas fa-times text-danger" />
                  </button>
                </div>

                <div className="card-body d-flex flex-column">
                  <Link
                    href={`/product/${item.slug}`}
                    className="fw-semibold text-decoration-none mb-2"
                    style={{ color: "var(--dark)", fontSize: "0.95rem" }}
                  >
                    {item.name}
                  </Link>
                  <div className="mb-3">
                    <span style={{ color: "var(--primary)", fontWeight: 700, fontSize: "1.1rem" }}>
                      ${price.toFixed(2)}
                    </span>
                    {item.salePrice && (
                      <span className="text-muted text-decoration-line-through ms-2" style={{ fontSize: "0.9rem" }}>
                        ${item.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="d-flex gap-2 mt-auto">
                    <button
                      className="btn btn-electro flex-grow-1"
                      onClick={() => {
                        addItem({ id: item.id, name: item.name, price, image: item.image, slug: item.slug });
                        removeItem(item.id);
                      }}
                    >
                      <i className="fas fa-cart-plus me-2" />Move to Cart
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => removeItem(item.id)}
                      title="Remove"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
