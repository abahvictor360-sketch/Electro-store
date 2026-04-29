"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import type { Product } from "@prisma/client";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem: addToCart } = useCart();
  const { toggle, has } = useWishlist();

  const price = product.salePrice ?? product.price;
  const savings = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  const inWishlist = has(product.id);

  return (
    <div className="product-card">
      <div className="product-img">
        {savings > 0 && <span className="badge-sale">-{savings}%</span>}
        {/* Wishlist heart */}
        <button
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
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
            zIndex: 1,
            padding: 4,
          }}
          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <i
            className={inWishlist ? "fas fa-heart" : "far fa-heart"}
            style={{ color: inWishlist ? "#d10024" : "#aaa", fontSize: 16 }}
          />
        </button>

        {product.images[0] ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <i className="fas fa-image fa-3x text-secondary" />
        )}
      </div>
      <div className="card-body">
        <Link href={`/product/${product.slug}`} className="product-name d-block mb-2">
          {product.name}
        </Link>
        <div className="mb-3">
          <span className="product-price">${price.toFixed(2)}</span>
          {product.salePrice && (
            <span className="product-price-original">${product.price.toFixed(2)}</span>
          )}
        </div>
        <button
          className="btn-add-cart"
          onClick={() =>
            addToCart({
              id: product.id,
              name: product.name,
              price,
              image: product.images[0] ?? "",
              slug: product.slug,
            })
          }
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? (
            "Out of Stock"
          ) : (
            <><i className="fas fa-cart-plus me-1" />Add to Cart</>
          )}
        </button>
      </div>
    </div>
  );
}
