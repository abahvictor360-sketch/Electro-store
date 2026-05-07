"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddUserModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "CUSTOMER" });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to create user"); return; }
    setOpen(false);
    setForm({ name: "", email: "", password: "", role: "CUSTOMER" });
    router.refresh();
  }

  const OVERLAY: React.CSSProperties = {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  };
  const MODAL: React.CSSProperties = {
    background: "#fff", borderRadius: 14, padding: 32, width: "100%", maxWidth: 440,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  };
  const LABEL: React.CSSProperties = {
    display: "block", fontSize: "0.72rem", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.5px", color: "#555", marginBottom: 5,
  };
  const INPUT: React.CSSProperties = {
    width: "100%", padding: "9px 13px", border: "1px solid #e0e0e0", borderRadius: 8,
    fontSize: "0.875rem", outline: "none", background: "#fff", color: "#333",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  return (
    <>
      <button className="btn-ap" onClick={() => setOpen(true)} style={{ padding: "8px 18px" }}>
        <i className="fas fa-user-plus" style={{ marginRight: 6 }} />Add User
      </button>

      {open && (
        <div style={OVERLAY} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <div style={MODAL}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#1e2030" }}>
                <i className="fas fa-user-plus" style={{ marginRight: 8, color: "#d10024" }} />Add New User
              </h3>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#aaa" }}>
                <i className="fas fa-times" />
              </button>
            </div>

            {error && (
              <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: "0.83rem" }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: 6 }} />{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={LABEL}>Name</label>
                <input style={INPUT} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="John Doe" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={LABEL}>Email *</label>
                <input type="email" style={INPUT} value={form.email} onChange={(e) => set("email", e.target.value)} required placeholder="john@example.com" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={LABEL}>Password *</label>
                <input type="password" style={INPUT} value={form.password} onChange={(e) => set("password", e.target.value)} required placeholder="Min. 6 characters" minLength={6} />
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={LABEL}>Role *</label>
                <select style={INPUT} value={form.role} onChange={(e) => set("role", e.target.value)} required>
                  <option value="CUSTOMER">Customer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn-ap" disabled={loading} style={{ flex: 1, padding: "10px", justifyContent: "center" }}>
                  {loading ? <><i className="fas fa-spinner fa-spin" /> Creating…</> : <><i className="fas fa-check" /> Create User</>}
                </button>
                <button type="button" className="btn-as" onClick={() => setOpen(false)} style={{ padding: "10px 18px" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
