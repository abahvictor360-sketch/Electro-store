"use client";

import Link from "next/link";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import type { Product } from "@prisma/client";

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCart((s) => s.addItem);
  const toggle = useWishlist((s) => s.toggle);
  const has = useWishlist((s) => s.has);

  const price = product.salePrice ?? product.price;
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  const inWishlist = has(product.id);
  const img = product.images?.[0] || "/img/product01.png";

  return (
    <div className="product">
      <div className="product-img">
        <Link href={`/product/${product.slug}`}>
          <img src={img} alt={product.name} />
        </Link>
        {(discount > 0 || product.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) && (
          <div className="product-label">
            {discount > 0 && <span className="sale">-{discount}%</span>}
            <span className="new">NEW</span>
          </div>
        )}
      </div>
      <div className="product-body">
        <p className="product-category">{product.category}</p>
        <h3 className="product-name">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <h4 className="product-price">
          ${price.toFixed(2)}
          {product.salePrice && (
            <del className="product-old-price">${product.price.toFixed(2)}</del>
          )}
        </h4>
        <div className="product-rating">
          <i className="fa fa-star" />
          <i className="fa fa-star" />
          <i className="fa fa-star" />
          <i className="fa fa-star" />
          <i className="fa fa-star-o" />
        </div>
        <div className="product-btns">
          <button
            className="add-to-wishlist"
            onClick={() => toggle({ id: product.id, name: product.name, slug: product.slug, price: product.price, salePrice: product.salePrice, image: img })}
          >
            <i className={inWishlist ? "fa fa-heart" : "fa fa-heart-o"} />
            <span className="tooltipp">{inWishlist ? "remove from wishlist" : "add to wishlist"}</span>
          </button>
          <button className="add-to-compare">
            <i className="fa fa-exchange" />
            <span className="tooltipp">add to compare</span>
          </button>
          <button className="quick-view">
            <i className="fa fa-eye" />
            <span className="tooltipp">quick view</span>
          </button>
        </div>
      </div>
      <div className="add-to-cart">
        <button
          className="add-to-cart-btn"
          disabled={product.stock === 0}
          onClick={() => addItem({ id: product.id, name: product.name, slug: product.slug, price, image: img })}
        >
          <i className="fa fa-shopping-cart" /> {product.stock === 0 ? "out of stock" : "add to cart"}
        </button>
      </div>
    </div>
  );
}
