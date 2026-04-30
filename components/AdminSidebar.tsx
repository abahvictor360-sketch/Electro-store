"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const mainNav: { href: string; label: string; icon: string; badge?: number | null }[] = [
  { href: "/admin",            label: "Dashboard",   icon: "fa-chart-pie" },
  { href: "/admin/products",   label: "Products",    icon: "fa-box" },
  { href: "/admin/orders",     label: "Orders",      icon: "fa-receipt" },
  { href: "/admin/customers",  label: "Customers",   icon: "fa-users" },
];

const settingsNav = [
  { href: "/admin/content",    label: "Site Content",  icon: "fa-pen-to-square" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="admin-sidebar">
      {/* Brand */}
      <div className="admin-brand">
        <Link href="/admin" className="admin-brand-logo">
          <div className="admin-brand-icon">
            <i className="fas fa-bolt" />
          </div>
          <div>
            <div className="admin-brand-text">Electro</div>
            <div className="admin-brand-sub">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="admin-nav">
        <div className="admin-nav-section">Main Menu</div>
        {mainNav.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`admin-nav-link${isActive(l.href) ? " active" : ""}`}
          >
            <span className="nav-icon">
              <i className={`fas ${l.icon}`} />
            </span>
            <span style={{ flex: 1 }}>{l.label}</span>
            {l.badge !== null && l.badge !== undefined && (
              <span className="nav-badge">{l.badge}</span>
            )}
          </Link>
        ))}

        <div className="admin-nav-section" style={{ marginTop: 12 }}>Settings</div>
        {settingsNav.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`admin-nav-link${isActive(l.href) ? " active" : ""}`}
          >
            <span className="nav-icon">
              <i className={`fas ${l.icon}`} />
            </span>
            {l.label}
          </Link>
        ))}

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "16px 10px" }} />

        <Link href="/" className="admin-nav-link">
          <span className="nav-icon"><i className="fas fa-store" /></span>
          View Store
        </Link>

        <button
          className="admin-nav-link"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <span className="nav-icon"><i className="fas fa-sign-out-alt" /></span>
          Logout
        </button>
      </nav>

      {/* Footer info */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", margin: 0, lineHeight: 1.5 }}>
          Electro Store v1.0<br />Admin Panel
        </p>
      </div>
    </aside>
  );
}
