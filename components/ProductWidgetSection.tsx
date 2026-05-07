"use client";

import { useState } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  category: string;
  images: string[];
}

interface Props {
  products: Product[];
  title?: string;
}

const PER_COL = 3; // products shown per column per page

function ArrowBtn({ dir, disabled, onClick }: { dir: "prev" | "next"; disabled: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const active = !disabled && hovered;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 28, height: 28,
        background: active ? "#D10024" : "#fff",
        border: `1px solid ${active ? "#D10024" : "#E4E7ED"}`,
        borderRadius: 0,
        cursor: disabled ? "default" : "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        fontSize: 13,
        color: active ? "#fff" : "#2B2D42",
        opacity: disabled ? 0.3 : 1,
        transition: "all 0.18s",
        outline: "none",
      }}
    >
      <i className={`fa fa-angle-${dir === "prev" ? "left" : "right"}`} />
    </button>
  );
}

export default function ProductWidgetSection({ products, title = "Top Selling" }: Props) {
  const [page, setPage] = useState(0);

  if (products.length === 0) return null;

  // Distribute products across 3 columns as evenly as possible
  const colCount = Math.min(3, products.length);
  const perCol = Math.ceil(products.length / colCount);
  const cols: Product[][] = Array.from({ length: colCount }, (_, i) =>
    products.slice(i * perCol, (i + 1) * perCol)
  ).filter((c) => c.length > 0);

  const maxPages = Math.max(...cols.map((c) => Math.ceil(c.length / PER_COL)));
  const canPrev = page > 0;
  const canNext = page < maxPages - 1;

  return (
    <div className="section">
      <div className="container">
        <div className="row">
          {cols.map((colProducts, ci) => {
            const visible = colProducts.slice(page * PER_COL, (page + 1) * PER_COL);
            return (
              <div key={ci} className={`col-md-${12 / colCount} col-xs-6`}>
                {/* Column header */}
                <div className="section-title">
                  <h4 className="title">{title}</h4>
                  <div className="section-nav" style={{ float: "right", display: "flex", gap: 2 }}>
                    <ArrowBtn dir="prev" disabled={!canPrev} onClick={() => setPage((p) => Math.max(0, p - 1))} />
                    <ArrowBtn dir="next" disabled={!canNext} onClick={() => setPage((p) => Math.min(maxPages - 1, p + 1))} />
                  </div>
                </div>

                {/* Product widgets */}
                {visible.map((p) => {
                  const img = p.images?.[0] || "/img/product01.png";
                  const price = p.salePrice ?? p.price;
                  return (
                    <div key={p.id} className="product-widget">
                      <div className="product-img">
                        <Link href={`/product/${p.slug}`}>
                          <img src={img} alt={p.name} />
                        </Link>
                      </div>
                      <div className="product-body">
                        <p className="product-category">{p.category}</p>
                        <h3 className="product-name">
                          <Link href={`/product/${p.slug}`}>{p.name}</Link>
                        </h3>
                        <h4 className="product-price">
                          ${price.toFixed(2)}
                          {p.salePrice && (
                            <del className="product-old-price">${p.price.toFixed(2)}</del>
                          )}
                        </h4>
                      </div>
                    </div>
                  );
                })}

                {/* View all link on last column only */}
                {ci === cols.length - 1 && (
                  <div style={{ textAlign: "right", marginTop: 8 }}>
                    <Link
                      href="/store"
                      style={{ fontSize: "0.8rem", color: "#D10024", fontWeight: 600, textDecoration: "none" }}
                    >
                      View All <i className="fa fa-arrow-right" style={{ marginLeft: 3 }} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
