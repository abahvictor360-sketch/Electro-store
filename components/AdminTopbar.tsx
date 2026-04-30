"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const pageTitles: Record<string, string> = {
  "/admin":            "Dashboard",
  "/admin/products":   "Products",
  "/admin/orders":     "Orders",
  "/admin/customers":  "Customers",
  "/admin/content":    "Site Content",
};

interface Props { userName: string; userInitial: string; }

export default function AdminTopbar({ userName, userInitial }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const title =
    Object.entries(pageTitles)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => pathname.startsWith(path))?.[1] ?? "Admin";

  return (
    <header className="a-topbar">
      <h1 className="a-topbar-title">{title}</h1>

      <div className="a-topbar-right">
        <Link href="/admin/products/new" className="btn-ap" style={{ padding: "7px 14px", fontSize: "0.78rem" }}>
          <i className="fas fa-plus" /> Add Product
        </Link>

        <Link href="/admin/orders" style={{ color: "#888", textDecoration: "none" }} title="Orders">
          <i className="fas fa-bell" style={{ fontSize: 17 }} />
        </Link>

        <Link href="/" style={{ color: "#888", textDecoration: "none" }} target="_blank" title="View Store">
          <i className="fas fa-external-link-alt" style={{ fontSize: 15 }} />
        </Link>

        {/* Avatar + dropdown */}
        <div style={{ position: "relative" }}>
          <button className="a-avatar" onClick={() => setOpen((o) => !o)} title={userName}>
            {userInitial}
          </button>

          {open && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setOpen(false)} />
              <div className="a-dropdown">
                <div style={{ padding: "12px 15px", borderBottom: "1px solid #f0f2f7" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "0.855rem", color: "#1e2030" }}>{userName}</p>
                  <p style={{ margin: 0, fontSize: "0.72rem", color: "#888" }}>Administrator</p>
                </div>
                <Link href="/" onClick={() => setOpen(false)}>
                  <i className="fas fa-store" style={{ width: 16, color: "#888" }} /> View Store
                </Link>
                <button onClick={() => signOut({ callbackUrl: "/" })}>
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
