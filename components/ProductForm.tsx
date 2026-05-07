"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@prisma/client";

const LABEL: React.CSSProperties = {
  display: "block", fontSize: "0.72rem", fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.5px", color: "#555", marginBottom: 6,
};
const INPUT: React.CSSProperties = {
  width: "100%", padding: "9px 13px", border: "1px solid #e0e0e0", borderRadius: 8,
  fontSize: "0.875rem", outline: "none", background: "#fff", color: "#333",
  boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s",
};

const CATEGORIES = ["Laptops", "Smartphones", "Cameras", "Accessories", "TVs", "Audio", "Gaming", "Other"];

/* ── Single image upload row ── */
function ImageRow({
  url,
  onRemove,
  onReplace,
}: {
  url: string;
  onRemove: () => void;
  onReplace: (newUrl: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({ error: `Server error (${res.status})` }));
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onReplace(data.url);
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      {/* Thumbnail */}
      <div style={{ width: 52, height: 52, borderRadius: 8, border: "1px solid #e0e0e0", background: "#f8f9fc", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {url
          ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          : <i className="fas fa-image" style={{ color: "#ccc", fontSize: 18 }} />}
      </div>
      {/* URL input */}
      <input
        style={{ ...INPUT, flex: 1, fontSize: "0.8rem" }}
        value={url}
        onChange={(e) => onReplace(e.target.value)}
        placeholder="https://... or upload →"
      />
      {/* Upload */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        title="Upload from device"
        style={{
          flexShrink: 0, height: 36, padding: "0 12px", border: "1px solid #d10024",
          borderRadius: 8, background: "#fff", color: "#d10024", fontWeight: 600,
          fontSize: "0.78rem", cursor: uploading ? "default" : "pointer",
          display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
        }}
      >
        {uploading ? <><i className="fas fa-spinner fa-spin" /> Uploading</> : <><i className="fas fa-upload" /> Upload</>}
      </button>
      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        title="Remove image"
        style={{ flexShrink: 0, height: 36, width: 36, border: "1px solid #fee2e2", borderRadius: 8, background: "#fff", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <i className="fas fa-trash" style={{ fontSize: 13 }} />
      </button>
      {err && <span style={{ fontSize: "0.72rem", color: "#ef4444" }}>{err}</span>}
    </div>
  );
}

export default function ProductForm({ product }: { product: Product | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(
    product?.images?.length ? product.images : [""]
  );

  /* image helpers */
  function setImg(i: number, val: string) {
    setImages((prev) => prev.map((x, idx) => (idx === i ? val : x)));
  }
  function removeImg(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }
  function addImg() {
    setImages((prev) => [...prev, ""]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      name:        fd.get("name"),
      description: fd.get("description"),
      price:       parseFloat(fd.get("price") as string),
      salePrice:   fd.get("salePrice") ? parseFloat(fd.get("salePrice") as string) : null,
      stock:       parseInt(fd.get("stock") as string),
      category:    fd.get("category"),
      brand:       fd.get("brand"),
      images:      images.filter(Boolean),
    };

    const url    = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PATCH" : "POST";

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Failed to save product");
    } else {
      router.push("/admin/products");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit}>

      {error && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", padding: "12px 16px", borderRadius: 8, marginBottom: 20, fontSize: "0.875rem" }}>
          <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }} />{error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* ── Left column ── */}
        <div>
          <div className="data-card" style={{ marginBottom: 20 }}>
            <div className="data-card-header">
              <h2 className="data-card-title"><i className="fas fa-info-circle" style={{ marginRight: 8, color: "#d10024" }} />Basic Info</h2>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: 16 }}>
                <label style={LABEL}>Product Name *</label>
                <input name="name" style={INPUT} className="admin-input" defaultValue={product?.name ?? ""} required placeholder="e.g. MacBook Pro 16-inch" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={LABEL}>Description *</label>
                <textarea name="description" style={{ ...INPUT, minHeight: 110, resize: "vertical" }} className="admin-input" defaultValue={product?.description ?? ""} required placeholder="Describe the product features, specs, etc." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LABEL}>Category *</label>
                  <select name="category" style={INPUT} className="admin-input" defaultValue={product?.category ?? ""} required>
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c.toLowerCase()}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={LABEL}>Brand *</label>
                  <input name="brand" style={INPUT} className="admin-input" defaultValue={product?.brand ?? ""} required placeholder="e.g. Apple" />
                </div>
              </div>
            </div>
          </div>

          <div className="data-card">
            <div className="data-card-header">
              <h2 className="data-card-title"><i className="fas fa-dollar-sign" style={{ marginRight: 8, color: "#d10024" }} />Pricing & Stock</h2>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LABEL}>Price ($) *</label>
                  <input name="price" type="number" step="0.01" min="0" style={INPUT} className="admin-input" defaultValue={product?.price ?? ""} required placeholder="0.00" />
                </div>
                <div>
                  <label style={LABEL}>Sale Price ($)</label>
                  <input name="salePrice" type="number" step="0.01" min="0" style={INPUT} className="admin-input" defaultValue={product?.salePrice ?? ""} placeholder="Leave blank" />
                </div>
                <div>
                  <label style={LABEL}>Stock *</label>
                  <input name="stock" type="number" min="0" style={INPUT} className="admin-input" defaultValue={product?.stock ?? 0} required />
                </div>
              </div>
              {/* Live sale badge preview */}
              <div style={{ marginTop: 14, padding: "10px 14px", background: "#f8f9fc", borderRadius: 8, fontSize: "0.78rem", color: "#888" }}>
                <i className="fas fa-info-circle" style={{ marginRight: 6 }} />
                Leave Sale Price blank for regular price. A discount % badge will appear automatically.
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column: images ── */}
        <div>
          <div className="data-card">
            <div className="data-card-header">
              <h2 className="data-card-title"><i className="fas fa-images" style={{ marginRight: 8, color: "#d10024" }} />Product Images</h2>
              <button type="button" onClick={addImg} className="btn-as" style={{ fontSize: "0.75rem", padding: "5px 10px" }}>
                <i className="fas fa-plus" /> Add Image
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              {images.length === 0 && (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#ccc" }}>
                  <i className="fas fa-image" style={{ fontSize: 32, display: "block", marginBottom: 10 }} />
                  <p style={{ margin: "0 0 12px", fontSize: "0.82rem" }}>No images yet</p>
                  <button type="button" onClick={addImg} className="btn-ap" style={{ fontSize: "0.78rem", padding: "7px 14px" }}>
                    <i className="fas fa-plus" /> Add First Image
                  </button>
                </div>
              )}
              {images.map((url, i) => (
                <ImageRow
                  key={i}
                  url={url}
                  onReplace={(v) => setImg(i, v)}
                  onRemove={() => removeImg(i)}
                />
              ))}
              {images.length > 0 && (
                <p style={{ marginTop: 10, marginBottom: 0, fontSize: "0.72rem", color: "#aaa" }}>
                  <i className="fas fa-info-circle" style={{ marginRight: 4 }} />
                  First image is used as the main product thumbnail. You can paste a URL or upload from your device.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer actions ── */}
      <div style={{ display: "flex", gap: 12, marginTop: 24, alignItems: "center" }}>
        <button type="submit" className="btn-ap" disabled={loading} style={{ padding: "10px 28px", fontSize: "0.9rem" }}>
          {loading
            ? <><i className="fas fa-spinner fa-spin" /> Saving…</>
            : <><i className="fas fa-save" /> {product ? "Update Product" : "Add Product"}</>}
        </button>
        <button type="button" className="btn-as" onClick={() => router.back()} style={{ padding: "10px 20px" }}>
          Cancel
        </button>
        {product && (
          <a href={`/product/${product.slug}`} target="_blank" className="btn-as" style={{ padding: "10px 20px", marginLeft: "auto" }}>
            <i className="fas fa-eye" style={{ marginRight: 6 }} />View on Store
          </a>
        )}
      </div>
    </form>
  );
}
