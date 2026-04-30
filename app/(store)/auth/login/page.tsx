"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

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
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <>
      {/* BREADCRUMB */}
      <div id="breadcrumb" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul className="breadcrumb-tree">
                <li><Link href="/">Home</Link></li>
                <li className="active">Login</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* AUTH SECTION */}
      <div className="section" style={{ padding: "40px 0 60px" }}>
        <div className="container">
          <div className="row">

            {/* LEFT PANEL — Branding */}
            <div className="col-md-5 hidden-sm hidden-xs">
              <div style={{
                background: "linear-gradient(135deg, #2b2d42 0%, #1a1b2e 60%, #d10024 100%)",
                borderRadius: "4px 0 0 4px",
                padding: "60px 40px",
                minHeight: "520px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "#fff",
              }}>
                <div style={{ marginBottom: 40 }}>
                  <h2 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 28, color: "#fff", marginBottom: 8 }}>
                    Welcome Back!
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.8, marginBottom: 0 }}>
                    Sign in to access your orders, wishlist, and exclusive member deals.
                  </p>
                </div>

                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {[
                    { icon: "fa-shopping-bag", text: "Track your orders in real-time" },
                    { icon: "fa-heart", text: "Save products to your wishlist" },
                    { icon: "fa-tag", text: "Access exclusive member discounts" },
                    { icon: "fa-shield", text: "Secure & encrypted account" },
                  ].map((item, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                      <span style={{
                        width: 40, height: 40, borderRadius: "50%",
                        background: "rgba(255,255,255,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginRight: 16, flexShrink: 0,
                      }}>
                        <i className={`fa ${item.icon}`} style={{ color: "#d10024", fontSize: 16 }} />
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>{item.text}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 40, paddingTop: 30, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 0 }}>
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/register" style={{ color: "#d10024", fontWeight: 600 }}>
                      Create one free
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL — Form */}
            <div className="col-md-7 col-sm-12 col-xs-12">
              <div style={{
                background: "#fff",
                borderRadius: "0 4px 4px 0",
                padding: "50px 48px",
                minHeight: "520px",
                boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}>
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "#d10024",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 20,
                  }}>
                    <i className="fa fa-user" style={{ color: "#fff", fontSize: 22 }} />
                  </div>
                  <h3 style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: 24,
                    color: "#2b2d42",
                    marginBottom: 6,
                  }}>
                    Sign In
                  </h3>
                  <p style={{ color: "#999", fontSize: 13, marginBottom: 0 }}>
                    Enter your credentials to access your account
                  </p>
                </div>

                {/* Success alert */}
                {params.get("registered") && (
                  <div style={{
                    background: "#f0fff4",
                    border: "1px solid #b2dfdb",
                    borderLeft: "4px solid #2e7d32",
                    borderRadius: 3,
                    padding: "12px 16px",
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}>
                    <i className="fa fa-check-circle" style={{ color: "#2e7d32", fontSize: 16 }} />
                    <span style={{ color: "#2e7d32", fontSize: 13 }}>Account created successfully! Please sign in.</span>
                  </div>
                )}

                {/* Error alert */}
                {error && (
                  <div style={{
                    background: "#fff5f5",
                    border: "1px solid #ffcdd2",
                    borderLeft: "4px solid #d10024",
                    borderRadius: 3,
                    padding: "12px 16px",
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}>
                    <i className="fa fa-exclamation-circle" style={{ color: "#d10024", fontSize: 16 }} />
                    <span style={{ color: "#d10024", fontSize: 13 }}>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {/* Email field */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{
                      display: "block",
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 600,
                      fontSize: 12,
                      color: "#2b2d42",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: 8,
                    }}>
                      Email Address
                    </label>
                    <div style={{ position: "relative" }}>
                      <i className="fa fa-envelope-o" style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#999",
                        fontSize: 14,
                        zIndex: 1,
                      }} />
                      <input
                        name="email"
                        type="email"
                        className="input"
                        placeholder="you@example.com"
                        required
                        style={{ paddingLeft: 40, width: "100%", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{
                      display: "block",
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 600,
                      fontSize: 12,
                      color: "#2b2d42",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: 8,
                    }}>
                      Password
                    </label>
                    <div style={{ position: "relative" }}>
                      <i className="fa fa-lock" style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#999",
                        fontSize: 14,
                        zIndex: 1,
                      }} />
                      <input
                        name="password"
                        type={showPass ? "text" : "password"}
                        className="input"
                        placeholder="Enter your password"
                        required
                        style={{ paddingLeft: 40, paddingRight: 44, width: "100%", boxSizing: "border-box" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          bottom: 0,
                          background: "none",
                          border: "none",
                          padding: "0 14px",
                          cursor: "pointer",
                          color: "#999",
                          fontSize: 14,
                        }}
                      >
                        <i className={`fa ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Forgot password */}
                  <div style={{ textAlign: "right", marginBottom: 28 }}>
                    <a href="#" style={{ color: "#d10024", fontSize: 12, fontWeight: 600 }}>
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={loading}
                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {loading ? (
                      <>
                        <i className="fa fa-spinner fa-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa fa-sign-in" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", margin: "28px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
                  <span style={{ padding: "0 16px", color: "#bbb", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
                    or
                  </span>
                  <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
                </div>

                {/* Register link */}
                <p style={{ textAlign: "center", color: "#999", fontSize: 13, margin: 0 }}>
                  New to Electro Store?{" "}
                  <Link href="/auth/register" style={{ color: "#d10024", fontWeight: 700 }}>
                    Create a free account
                  </Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
