"use client";

import { useState } from "react";

interface Props {
  productId: string;
  initialStock: number;
}

export default function StockUpdateCell({ productId, initialStock }: Props) {
  const [stock, setStock] = useState(initialStock);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState(initialStock.toString());
  const [error, setError] = useState(false);

  async function save() {
    const newStock = parseInt(value);
    if (isNaN(newStock) || newStock < 0) { setError(true); return; }
    setError(false);
    setSaving(true);
    const res = await fetch("/api/admin/stock", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, stock: newStock }),
    });
    setSaving(false);
    if (res.ok) {
      setStock(newStock);
      setEditing(false);
    }
  }

  function cancel() {
    setEditing(false);
    setError(false);
    setValue(stock.toString());
  }

  const stockColor =
    stock === 0
      ? { bg: "#fee2e2", color: "#991b1b" }
      : stock <= 5
      ? { bg: "#fef3c7", color: "#92400e" }
      : { bg: "#d1fae5", color: "#065f46" };

  if (editing) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
          autoFocus
          style={{
            width: 72, padding: "4px 8px", fontSize: "0.82rem",
            border: `1px solid ${error ? "#d10024" : "#d10024"}`,
            borderRadius: 6, outline: "none",
          }}
        />
        <button
          onClick={save}
          disabled={saving}
          style={{ background: "#d10024", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: "0.78rem", cursor: "pointer", fontWeight: 700 }}
        >
          {saving ? "…" : "✓"}
        </button>
        <button
          onClick={cancel}
          style={{ background: "#f0f2f7", color: "#666", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: "0.78rem", cursor: "pointer" }}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setEditing(true); setValue(stock.toString()); }}
      title="Click to edit stock"
      style={{
        background: stockColor.bg, color: stockColor.color,
        border: "none", borderRadius: 6, padding: "4px 14px",
        fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
        display: "inline-flex", alignItems: "center", gap: 6,
      }}
    >
      {stock === 0 ? "Out of stock" : stock}
      <i className="fas fa-pen" style={{ fontSize: "0.65rem", opacity: 0.65 }} />
    </button>
  );
}
