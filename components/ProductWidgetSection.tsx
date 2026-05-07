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

function SlickNav({ canPrev, canNext, onPrev, onNext }: {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="products-slick-nav">
      <button
        className="slick-prev"
        onClick={onPrev}
        disabled={!canPrev}
        style={{
          cursor: canPrev ? "pointer" : "default",
          opacity: canPrev ? 1 : 0.35,
          background: "none",
          border: "1px solid #E4E7ED",
          width: 28,
          height: 28,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 2,
        }}
      >
        <i className="fa fa-angle-left" />
      </button>
      <button
        className="slick-next"
        onClick={onNext}
        disabled={!canNext}
        style={{
          cursor: canNext ? "pointer" : "default",
          opacity: canNext ? 1 : 0.35,
          background: "none",
          border: "1px solid #E4E7ED",
          width: 28,
          height: 28,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <i className="fa fa-angle-right" />
      </button>
    </div>
  );
}

export default function ProductWidgetSection({ products, title = "Top Selling" }: Props) {
  const [page, setPage] = useState(0);

  if (products.length === 0) return null;

  // Distribute products across up to 3 columns evenly
  const colCount = Math.min(3, Math.max(1, products.length));
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
            const isLast = ci === cols.length - 1;

            return (
              <div key={ci} className={`col-md-${Math.floor(12 / colCount)} col-sm-6 col-xs-12`}>
                {/* Column header — matches .section-title structure */}
                <div className="section-title">
                  <h4 className="title">{title}</h4>
                  <div className="section-nav">
                    <SlickNav
                      canPrev={canPrev}
                      canNext={canNext}
                      onPrev={() => setPage((p) => Math.max(0, p - 1))}
                      onNext={() => setPage((p) => Math.min(maxPages - 1, p + 1))}
                    />
                  </div>
                </div>

                {/* Product widget list */}
                {visible.map((p) => {
                  // Use first image or fall back to placeholder
                  const img = (p.images && p.images.length > 0 && p.images[0])
                    ? p.images[0]
                    : "/img/product01.png";
                  const price = p.salePrice ?? p.price;

                  return (
                    <div key={p.id} className="product-widget">
                      {/*
                        IMPORTANT: The CSS rule `.product-widget .product-img > img { width: 100% }`
                        requires img to be a *direct* child of .product-img.
                        Do NOT add a wrapper element (e.g. <Link>) inside .product-img.
                      */}
                      <div className="product-img">
                        <img src={img} alt={p.name} />
                      </div>
                      <div className="product-body">
                        <p className="product-category">{p.category}</p>
                        <h3 className="product-name">
                          <Link href={`/product/${p.slug}`}>{p.name}</Link>
                        </h3>
                        <h4 className="product-price">
                          ${price.toFixed(2)}
                          {p.salePrice != null && (
                            <del className="product-old-price">${p.price.toFixed(2)}</del>
                          )}
                        </h4>
                      </div>
                    </div>
                  );
                })}

                {/* "View all" link on last column only */}
                {isLast && (
                  <div style={{ textAlign: "right", marginTop: 8 }}>
                    <Link
                      href="/store"
                      style={{
                        fontSize: "0.8rem",
                        color: "#D10024",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
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
