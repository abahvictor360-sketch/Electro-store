"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  categories: string[];
  brands: string[];
  current: { q?: string; category?: string; min?: string; max?: string; brand?: string };
  topProducts: { id: string; name: string; slug: string; price: number; salePrice: number | null; images: string[] }[];
}

export default function StoreFilters({ categories, brands, current, topProducts }: Props) {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(current.min || "");
  const [maxPrice, setMaxPrice] = useState(current.max || "");

  function applyFilter(params: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const merged = { ...current, ...params };
    Object.entries(merged).forEach(([k, v]) => { if (v) sp.set(k, v); });
    router.push(`/store?${sp.toString()}`);
  }

  return (
    <>
      {/* Categories */}
      <div className="aside">
        <h3 className="aside-title">Categories</h3>
        <div className="checkbox-filter">
          {categories.map((cat, i) => (
            <div key={cat} className="input-checkbox">
              <input
                type="checkbox"
                id={`cat-${i}`}
                checked={current.category?.toLowerCase() === cat.toLowerCase()}
                onChange={(e) => applyFilter({ category: e.target.checked ? cat : undefined })}
              />
              <label htmlFor={`cat-${i}`}>
                <span></span>
                {cat}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="aside">
        <h3 className="aside-title">Price</h3>
        <div className="price-filter">
          <div className="input-number price-min">
            <input
              id="price-min"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Min"
            />
            <span className="qty-up" onClick={() => setMinPrice(v => String(parseInt(v || "0") + 10))}>+</span>
            <span className="qty-down" onClick={() => setMinPrice(v => String(Math.max(0, parseInt(v || "0") - 10)))}>-</span>
          </div>
          <span>-</span>
          <div className="input-number price-max">
            <input
              id="price-max"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Max"
            />
            <span className="qty-up" onClick={() => setMaxPrice(v => String(parseInt(v || "0") + 10))}>+</span>
            <span className="qty-down" onClick={() => setMaxPrice(v => String(Math.max(0, parseInt(v || "0") - 10)))}>-</span>
          </div>
          <button
            className="primary-btn"
            style={{ marginTop: 10, width: "100%" }}
            onClick={() => applyFilter({ min: minPrice, max: maxPrice })}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Brand */}
      <div className="aside">
        <h3 className="aside-title">Brand</h3>
        <div className="checkbox-filter">
          {brands.map((brand, i) => (
            <div key={brand} className="input-checkbox">
              <input
                type="checkbox"
                id={`brand-${i}`}
                checked={current.brand?.toLowerCase() === brand.toLowerCase()}
                onChange={(e) => applyFilter({ brand: e.target.checked ? brand : undefined })}
              />
              <label htmlFor={`brand-${i}`}>
                <span></span>
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Top Selling sidebar */}
      {topProducts.length > 0 && (
        <div className="aside">
          <h3 className="aside-title">Top selling</h3>
          {topProducts.slice(0, 3).map((p) => (
            <div key={p.id} className="product-widget">
              <div className="product-img">
                <a href={`/product/${p.slug}`}>
                  <img src={p.images?.[0] || "/img/product01.png"} alt={p.name} />
                </a>
              </div>
              <div className="product-body">
                <p className="product-category">Product</p>
                <h3 className="product-name"><a href={`/product/${p.slug}`}>{p.name}</a></h3>
                <h4 className="product-price">
                  ${(p.salePrice ?? p.price).toFixed(2)}
                  {p.salePrice && <del className="product-old-price">${p.price.toFixed(2)}</del>}
                </h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
