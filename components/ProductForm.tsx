"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@prisma/client";

export default function ProductForm({ product }: { product: Product | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const imagesRaw = (fd.get("images") as string).trim();
    const images = imagesRaw ? imagesRaw.split("\n").map((s) => s.trim()).filter(Boolean) : [];

    const body = {
      name: fd.get("name"),
      description: fd.get("description"),
      price: parseFloat(fd.get("price") as string),
      salePrice: fd.get("salePrice") ? parseFloat(fd.get("salePrice") as string) : null,
      stock: parseInt(fd.get("stock") as string),
      category: fd.get("category"),
      brand: fd.get("brand"),
      images,
    };

    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Failed to save product");
    } else {
      router.push("/admin/products");
      router.refresh();
    }
  }

  return (
    <div className="card border-0 shadow-sm p-4" style={{ maxWidth: 700 }}>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label fw-semibold">Product Name *</label>
            <input name="name" className="form-control" defaultValue={product?.name ?? ""} required />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Category *</label>
            <select name="category" className="form-select" defaultValue={product?.category ?? ""} required>
              <option value="">Select category</option>
              {["Laptops", "Smartphones", "Cameras", "Accessories"].map((c) => (
                <option key={c} value={c.toLowerCase()}>{c}</option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-semibold">Brand *</label>
            <input name="brand" className="form-control" defaultValue={product?.brand ?? ""} required />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Price ($) *</label>
            <input name="price" type="number" step="0.01" min="0" className="form-control" defaultValue={product?.price ?? ""} required />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Sale Price ($)</label>
            <input name="salePrice" type="number" step="0.01" min="0" className="form-control" defaultValue={product?.salePrice ?? ""} placeholder="Leave blank if no sale" />
          </div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Stock *</label>
            <input name="stock" type="number" min="0" className="form-control" defaultValue={product?.stock ?? 0} required />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Description *</label>
            <textarea name="description" className="form-control" rows={4} defaultValue={product?.description ?? ""} required />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold">Image URLs</label>
            <textarea
              name="images"
              className="form-control"
              rows={3}
              defaultValue={product?.images.join("\n") ?? ""}
              placeholder="One URL per line"
            />
            <small className="text-muted">Enter one image URL per line</small>
          </div>
        </div>
        <div className="d-flex gap-3 mt-4">
          <button type="submit" className="btn btn-electro px-4" disabled={loading}>
            {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => router.back()}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
