"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const pageTitles: Record<string, string> = {
  "/admin":             "Dashboard",
  "/admin/products":    "Products",
  "/admin/orders":      "Orders",
  "/admin/customers":   "Customers",
  "/admin/content":     "Site Content",
};

interface Props {
  userName: string;
  userInitial: string;
}

export default function AdminTopbar({ userName, userInitial }: Props) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const title =
    Object.entries(pageTitles)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => pathname.startsWith(path))?.[1] ?? "Admin";

  return (
    <header className="admin-topbar">
      <h1 className="admin-page-title">{title}</h1>

      <div className="admin-topbar-actions">
        {/* Quick links */}
        <Link
          href="/admin/products/new"
          className="btn-admin-primary"
          style={{ padding: "7px 14px", fontSize: "0.8rem" }}
        >
          <i className="fas fa-plus" /> Add Product
        </Link>

        {/* Notification bell */}
        <Link href="/admin/orders" style={{ color: "#888", position: "relative", textDecoration: "none" }}>
          <i className="fas fa-bell" style={{ fontSize: 18 }} />
        </Link>

        {/* View store */}
        <Link href="/" style={{ color: "#888", textDecoration: "none" }} target="_blank" title="View Store">
          <i className="fas fa-external-link-alt" style={{ fontSize: 16 }} />
        </Link>

        {/* Avatar dropdown */}
        <div style={{ position: "relative" }}>
          <button
            className="admin-avatar"
            onClick={() => setDropdownOpen((o) => !o)}
            title={userName}
          >
            {userInitial}
          </button>

          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                style={{ position: "fixed", inset: 0, zIndex: 998 }}
                onClick={() => setDropdownOpen(false)}
              />
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)",
                background: "#fff", borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                border: "1px solid #eee", width: 200, zIndex: 999, overflow: "hidden",
              }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f2f7" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: "#1e2030" }}>{userName}</p>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>Administrator</p>
                </div>
                <Link
                  href="/"
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", color: "#555", textDecoration: "none", fontSize: "0.875rem" }}
                  onClick={() => setDropdownOpen(false)}
                >
                  <i className="fas fa-store" style={{ width: 16 }} /> View Store
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", color: "#d10024", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", fontSize: "0.875rem" }}
                >
                  <i className="fas fa-sign-out-alt" style={{ width: 16 }} /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
