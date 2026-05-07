"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  autoPlay?: boolean;
  autoPlayInterval?: number; // ms, default 3500
}

function getPerPage(w: number) {
  if (w < 480) return 1;
  if (w < 991) return 2;
  return 4;
}

/** Slick-style arrow button */
function ArrowBtn({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = !disabled && hovered;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 40,
        height: 40,
        background: active ? "#D10024" : "#fff",
        border: `1px solid ${active ? "#D10024" : "#E4E7ED"}`,
        borderRadius: 0,
        cursor: disabled ? "default" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        color: active ? "#fff" : "#2B2D42",
        opacity: disabled ? 0.35 : 1,
        transition: "all 0.2s",
        margin: "0 2px",
        flexShrink: 0,
        outline: "none",
      }}
    >
      <i className={`fa fa-angle-${dir === "prev" ? "left" : "right"}`} />
    </button>
  );
}

export default function HomeTabs({ products, title, categories, autoPlay = false, autoPlayInterval = 3500 }: Props) {
  const [active, setActive] = useState("All");
  const [idx, setIdx] = useState(0);
  const [perPage, setPerPage] = useState(4);
  const [containerW, setContainerW] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const addToCart = useCart((s) => s.addItem);
  const toggle = useWishlist((s) => s.toggle);
  const has = useWishlist((s) => s.has);

  // Track container width for pixel-perfect sliding
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setContainerW(w);
      setPerPage(getPerPage(w));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const tabs = ["All", ...categories];

  const filtered =
    active === "All"
      ? products
      : products.filter(
          (p) => p.category.toLowerCase() === active.toLowerCase()
        );

  // Reset to first slide whenever tab or per-page count changes
  useEffect(() => {
    setIdx(0);
  }, [active, perPage]);

  const maxIdx = Math.max(0, filtered.length - perPage);
  const canPrev = idx > 0;
  const canNext = idx < maxIdx;

  const prev = () => setIdx((i) => Math.max(0, i - perPage));
  const next = useCallback(() => setIdx((i) => Math.min(maxIdx, i + perPage)), [maxIdx, perPage]);

  // Auto-play: advance one slide at a time, wrap around
  useEffect(() => {
    if (!autoPlay || filtered.length <= perPage) return;
    const timer = setInterval(() => {
      setIdx((i) => (i >= maxIdx ? 0 : i + 1));
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, filtered.length, perPage, maxIdx]);

  // Pixel-based offset (accurate after first paint)
  const slideWidth = containerW > 0 ? containerW / perPage : 0;
  const offset = -idx * slideWidth;

  return (
    <>
      {/* ── Section header: title left, tabs + arrows right ── */}
      <div className="section-title">
        <h3 className="title">{title}</h3>
        <div
          className="section-nav"
          style={{ float: "right", display: "flex", alignItems: "center", gap: 8 }}
        >
          <ul className="section-tab-nav tab-nav" style={{ margin: 0 }}>
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

          {/* Arrows – only visible when there are more slides than fit */}
          {filtered.length > perPage && (
            <div style={{ display: "flex" }}>
              <ArrowBtn dir="prev" disabled={!canPrev} onClick={prev} />
              <ArrowBtn dir="next" disabled={!canNext} onClick={next} />
            </div>
          )}
        </div>
      </div>

      {/* ── Slider ── */}
      {filtered.length === 0 ? (
        <div className="text-center" style={{ padding: "40px 0", color: "#999" }}>
          <p>No products in this category yet.</p>
          <Link href="/store" className="primary-btn">
            Browse All Products
          </Link>
        </div>
      ) : (
        /* paddingBottom+marginBottom = Slick's 60px overflow zone so the add-to-cart hover animation isn't clipped */
        <div ref={containerRef} style={{ overflow: "hidden", paddingBottom: 60, marginBottom: -60 }}>
          <div
            style={{
              display: "flex",
              transform: slideWidth > 0 ? `translateX(${offset}px)` : "none",
              transition: "transform 0.35s ease",
              willChange: "transform",
            }}
          >
            {filtered.map((p) => {
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
                <div
                  key={p.id}
                  className="hometabs-slide"
                  style={{
                    flexShrink: 0,
                    width: slideWidth > 0 ? `${slideWidth}px` : `${100 / perPage}%`,
                    padding: "0 10px",
                    boxSizing: "border-box",
                  }}
                >
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
            })}
          </div>
        </div>
      )}
    </>
  );
}
