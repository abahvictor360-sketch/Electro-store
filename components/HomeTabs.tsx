"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  category: string;
  images: string[];
  stock: number;
  createdAt: Date;
}

interface Props {
  products: Product[];
  title: string;
  categories: string[];
}

export default function HomeTabs({ products, title, categories }: Props) {
  const [active, setActive] = useState("All");
  const addToCart = useCart((s) => s.addItem);
  const toggle = useWishlist((s) => s.toggle);
  const has = useWishlist((s) => s.has);

  const tabs = ["All", ...categories];

  const filtered =
    active === "All"
      ? products
      : products.filter(
          (p) => p.category.toLowerCase() === active.toLowerCase()
        );

  const visible = filtered.slice(0, 8);

  return (
    <>
      <div className="section-title">
        <h3 className="title">{title}</h3>
        <div className="section-nav">
          <ul className="section-tab-nav tab-nav">
            {tabs.map((tab) => (
              <li key={tab} className={active === tab ? "active" : ""}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActive(tab);
                  }}
                >
                  {tab}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="row">
        {visible.length === 0 ? (
          <div className="col-md-12 text-center" style={{ padding: "40px 0", color: "#999" }}>
            <p>No products in this category yet.</p>
            <Link href="/store" className="primary-btn">Browse All Products</Link>
          </div>
        ) : (
          visible.map((p) => {
            const img = p.images?.[0] || "/img/product01.png";
            const price = p.salePrice ?? p.price;
            const discount = p.salePrice
              ? Math.round(((p.price - p.salePrice) / p.price) * 100)
              : 0;
            const isNew =
              new Date(p.createdAt) >
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const inWishlist = has(p.id);

            return (
              <div key={p.id} className="col-md-3 col-sm-6 col-xs-6">
                <div className="product">
                  <div className="product-img">
                    <Link href={`/product/${p.slug}`}>
                      <img src={img} alt={p.name} />
                    </Link>
                    {(discount > 0 || isNew) && (
                      <div className="product-label">
                        {discount > 0 && (
                          <span className="sale">-{discount}%</span>
                        )}
                        {isNew && <span className="new">NEW</span>}
                      </div>
                    )}
                  </div>
                  <div className="product-body">
                    <p className="product-category">{p.category}</p>
                    <h3 className="product-name">
                      <Link href={`/product/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <h4 className="product-price">
                      ${price.toFixed(2)}
                      {p.salePrice && (
                        <del className="product-old-price">
                          ${p.price.toFixed(2)}
                        </del>
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
                        onClick={() =>
                          toggle({
                            id: p.id,
                            name: p.name,
                            slug: p.slug,
                            price: p.price,
                            salePrice: p.salePrice,
                            image: img,
                          })
                        }
                      >
                        <i
                          className={
                            inWishlist ? "fa fa-heart" : "fa fa-heart-o"
                          }
                        />
                        <span className="tooltipp">
                          {inWishlist
                            ? "remove from wishlist"
                            : "add to wishlist"}
                        </span>
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
                      disabled={p.stock === 0}
                      onClick={() =>
                        addToCart({
                          id: p.id,
                          name: p.name,
                          slug: p.slug,
                          price,
                          image: img,
                        })
                      }
                    >
                      <i className="fa fa-shopping-cart" />{" "}
                      {p.stock === 0 ? "out of stock" : "add to cart"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
