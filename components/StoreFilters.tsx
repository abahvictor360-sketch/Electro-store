"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  categories: string[];
  brands: string[];
  current: { q?: string; category?: string; min?: string; max?: string; brand?: string };
}

export default function StoreFilters({ categories, brands, current }: Props) {
  const router = useRouter();
  const [min, setMin] = useState(current.min ?? "");
  const [max, setMax] = useState(current.max ?? "");

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { ...current, ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    return `/store?${params.toString()}`;
  }

  return (
    <div>
      {/* Categories */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3" style={{ color: "var(--dark)" }}>Categories</h6>
        <ul className="list-unstyled">
          <li className="mb-1">
            <a
              href={buildUrl({ category: undefined })}
              className={`text-decoration-none ${!current.category ? "fw-semibold" : "text-muted"}`}
            >
              All Products
            </a>
          </li>
          {categories.map((cat) => (
            <li key={cat} className="mb-1">
              <a
                href={buildUrl({ category: cat.toLowerCase() })}
                className={`text-decoration-none text-capitalize ${current.category === cat.toLowerCase() ? "fw-semibold" : "text-muted"}`}
              >
                {cat}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3" style={{ color: "var(--dark)" }}>Price Range</h6>
        <div className="d-flex gap-2 align-items-center mb-2">
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
          <span>—</span>
          <input
            type="number"
            className="form-control form-control-sm"
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </div>
        <button
          className="btn btn-sm btn-electro w-100"
          onClick={() => router.push(buildUrl({ min: min || undefined, max: max || undefined }))}
        >
          Apply
        </button>
      </div>

      {/* Brands */}
      {brands.length > 0 && (
        <div className="mb-4">
          <h6 className="fw-bold mb-3" style={{ color: "var(--dark)" }}>Brands</h6>
          <ul className="list-unstyled">
            {brands.map((b) => (
              <li key={b} className="mb-1">
                <a
                  href={buildUrl({ brand: b.toLowerCase() })}
                  className={`text-decoration-none text-capitalize ${current.brand === b.toLowerCase() ? "fw-semibold" : "text-muted"}`}
                >
                  {b}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {Object.values(current).some(Boolean) && (
        <a href="/store" className="btn btn-sm btn-outline-secondary w-100">
          Clear Filters
        </a>
      )}
    </div>
  );
}
