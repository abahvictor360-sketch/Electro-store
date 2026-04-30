"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        password,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Registration failed. Please try again.");
    } else {
      router.push("/auth/login?registered=1");
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
                <li className="active">Create Account</li>
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
                background: "linear-gradient(135deg, #1a1b2e 0%, #2b2d42 50%, #d10024 130%)",
                borderRadius: "4px 0 0 4px",
                padding: "60px 40px",
                minHeight: "580px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                color: "#fff",
              }}>
                <div style={{ marginBottom: 36 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "rgba(209,0,36,0.2)",
                    border: "2px solid rgba(209,0,36,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 24,
                  }}>
                    <i className="fa fa-bolt" style={{ color: "#d10024", fontSize: 26 }} />
                  </div>
                  <h2 style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: 26,
                    color: "#fff",
                    marginBottom: 10,
                    lineHeight: 1.3,
                  }}>
                    Join Electro Store
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.8, marginBottom: 0 }}>
                    Create your free account and discover the best deals on electronics.
                  </p>
                </div>

                {/* Benefits */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 36px" }}>
                  {[
                    { icon: "fa-truck", text: "Free shipping on orders over $50" },
                    { icon: "fa-refresh", text: "Easy 30-day returns & exchanges" },
                    { icon: "fa-star", text: "Earn loyalty points with every purchase" },
                    { icon: "fa-bell", text: "Get notified on price drops" },
                  ].map((item, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>
                      <span style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "rgba(209,0,36,0.15)",
                        border: "1px solid rgba(209,0,36,0.3)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginRight: 14, flexShrink: 0,
                      }}>
                        <i className={`fa ${item.icon}`} style={{ color: "#d10024", fontSize: 14 }} />
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{item.text}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginBottom: 0 }}>
                    Already have an account?{" "}
                    <Link href="/auth/login" style={{ color: "#d10024", fontWeight: 600 }}>
                      Sign in here
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
                padding: "48px 48px 40px",
                minHeight: "580px",
                boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}>
                {/* Header */}
                <div style={{ marginBottom: 28 }}>
                  <h3 style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: 24,
                    color: "#2b2d42",
                    marginBottom: 6,
                  }}>
                    Create Account
                  </h3>
                  <p style={{ color: "#999", fontSize: 13, marginBottom: 0 }}>
                    Fill in the details below to get started
                  </p>
                </div>

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

                <form onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <div style={{ marginBottom: 18 }}>
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
                      Full Name
                    </label>
                    <div style={{ position: "relative" }}>
                      <i className="fa fa-user-o" style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#999",
                        fontSize: 14,
                        zIndex: 1,
                      }} />
                      <input
                        name="name"
                        type="text"
                        className="input"
                        placeholder="John Doe"
                        required
                        style={{ paddingLeft: 40, width: "100%", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: 18 }}>
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

                  {/* Password */}
                  <div style={{ marginBottom: 18 }}>
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
                        placeholder="Min. 8 characters"
                        minLength={8}
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

                  {/* Confirm Password */}
                  <div style={{ marginBottom: 28 }}>
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
                      Confirm Password
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
                        name="confirm"
                        type={showConfirm ? "text" : "password"}
                        className="input"
                        placeholder="Re-enter your password"
                        required
                        style={{ paddingLeft: 40, paddingRight: 44, width: "100%", boxSizing: "border-box" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
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
                        <i className={`fa ${showConfirm ? "fa-eye-slash" : "fa-eye"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Terms notice */}
                  <p style={{ fontSize: 12, color: "#aaa", marginBottom: 24, lineHeight: 1.6 }}>
                    By creating an account you agree to our{" "}
                    <a href="#" style={{ color: "#d10024" }}>Terms of Service</a> and{" "}
                    <a href="#" style={{ color: "#d10024" }}>Privacy Policy</a>.
                  </p>

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
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa fa-user-plus" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div style={{ display: "flex", alignItems: "center", margin: "24px 0" }}>
                  <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
                  <span style={{ padding: "0 16px", color: "#bbb", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
                    or
                  </span>
                  <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
                </div>

                {/* Login link */}
                <p style={{ textAlign: "center", color: "#999", fontSize: 13, margin: 0 }}>
                  Already have an account?{" "}
                  <Link href="/auth/login" style={{ color: "#d10024", fontWeight: 700 }}>
                    Sign in
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
