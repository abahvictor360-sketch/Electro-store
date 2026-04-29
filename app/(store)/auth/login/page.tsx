"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm border-0 p-4">
            <h3 className="fw-bold mb-1" style={{ color: "var(--dark)" }}>Welcome Back</h3>
            <p className="text-muted mb-4">Sign in to your account</p>
            {params.get("registered") && (
              <div className="alert alert-success py-2">Account created! Please login.</div>
            )}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address</label>
                <input name="email" type="email" className="form-control" required />
              </div>
              <div className="mb-4">
                <label className="form-label fw-semibold">Password</label>
                <input name="password" type="password" className="form-control" required />
              </div>
              <button type="submit" className="btn btn-electro w-100 py-2" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            <p className="text-center mt-3 mb-0 text-muted">
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" style={{ color: "var(--primary)" }}>Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
