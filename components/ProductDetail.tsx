"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import type { Product } from "@prisma/client";
import ProductCard from "./ProductCard";

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetail({ product, related }: Props) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const [qty, setQty] = useState(1);
  const inWishlist = has(product.id);
  const [activeImg, setActiveImg] = useState(0);

  const price = product.salePrice ?? product.price;
  const savings = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <>
      <div className="breadcrumb-section">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/store">Shop</Link></li>
              <li className="breadcrumb-item">
                <Link href={`/store?category=${product.category.toLowerCase()}`} className="text-capitalize">
                  {product.category}
                </Link>
              </li>
              <li className="breadcrumb-item active">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-5">
          {/* Images */}
          <div className="col-md-5">
            <div
              className="border rounded d-flex align-items-center justify-content-center mb-3"
              style={{ height: 380, background: "#f8f9fa" }}
            >
              {product.images[activeImg] ? (
                <img
                  src={product.images[activeImg]}
                  alt={product.name}
                  style={{ maxHeight: 360, maxWidth: "100%", objectFit: "contain" }}
                />
              ) : (
                <i className="fas fa-image fa-5x text-secondary" />
              )}
            </div>
            {product.images.length > 1 && (
              <div className="d-flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`btn p-1 border ${activeImg === i ? "border-danger" : ""}`}
                    style={{ width: 70, height: 70 }}
                  >
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="col-md-7">
            <span
              className="badge text-capitalize mb-2"
              style={{ background: "var(--dark)", color: "#fff" }}
            >
              {product.category}
            </span>
            <h1 className="h3 fw-bold mb-2">{product.name}</h1>
            <p className="text-muted mb-1">Brand: <strong className="text-dark">{product.brand}</strong></p>

            <div className="my-3 d-flex align-items-center gap-3">
              <span style={{ color: "var(--primary)", fontSize: "2rem", fontWeight: 700 }}>
                ${price.toFixed(2)}
              </span>
              {product.salePrice && (
                <>
                  <span className="text-muted text-decoration-line-through fs-5">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="badge" style={{ background: "var(--primary)", color: "#fff" }}>
                    Save {savings}%
                  </span>
                </>
              )}
            </div>

            <p className="text-muted mb-1">
              Availability:{" "}
              <strong className={product.stock > 0 ? "text-success" : "text-danger"}>
                {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
              </strong>
            </p>

            <hr />

            <p className="mb-4" style={{ color: "#555", lineHeight: 1.7 }}>{product.description}</p>

            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="d-flex align-items-center border rounded">
                <button
                  className="btn btn-sm px-3"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >−</button>
                <span className="px-3 fw-semibold">{qty}</span>
                <button
                  className="btn btn-sm px-3"
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                >+</button>
              </div>
              <button
                className="btn btn-electro px-4 py-2 flex-grow-1"
                disabled={product.stock === 0}
                onClick={() => {
                  for (let i = 0; i < qty; i++) {
                    addItem({
                      id: product.id,
                      name: product.name,
                      price,
                      image: product.images[0] ?? "",
                      slug: product.slug,
                    });
                  }
                }}
              >
                <i className="fas fa-cart-plus me-2" />
                Add to Cart
              </button>
              <button
                className={`btn px-3 py-2 ${inWishlist ? "btn-danger" : "btn-outline-danger"}`}
                title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() =>
                  toggle({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    salePrice: product.salePrice,
                    image: product.images[0] ?? "",
                    slug: product.slug,
                  })
                }
              >
                <i className={inWishlist ? "fas fa-heart" : "far fa-heart"} />
              </button>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-5">
            <h3 className="section-title">Related Products</h3>
            <div className="row g-3">
              {related.map((p) => (
                <div key={p.id} className="col-6 col-md-3">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
