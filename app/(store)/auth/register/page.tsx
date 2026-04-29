"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password: fd.get("password"),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Registration failed");
    } else {
      router.push("/auth/login?registered=1");
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm border-0 p-4">
            <h3 className="fw-bold mb-1" style={{ color: "var(--dark)" }}>Create Account</h3>
            <p className="text-muted mb-4">Join Electro Store today</p>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Full Name</label>
                <input name="name" type="text" className="form-control" required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <input name="email" type="email" className="form-control" required />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Password</label>
                <input name="password" type="password" className="form-control" minLength={8} required />
                <small className="text-muted">Minimum 8 characters</small>
              </div>
              <button type="submit" className="btn btn-electro w-100 py-2" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
            <p className="text-center mt-3 mb-0 text-muted">
              Already have an account? <Link href="/auth/login" style={{ color: "var(--primary)" }}>Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
