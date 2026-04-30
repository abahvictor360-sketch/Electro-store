"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const mainNav = [
  { href: "/admin",           label: "Dashboard",    icon: "fa-chart-pie" },
  { href: "/admin/products",  label: "Products",     icon: "fa-box" },
  { href: "/admin/orders",    label: "Orders",       icon: "fa-receipt" },
  { href: "/admin/customers", label: "Customers",    icon: "fa-users" },
];

const settingsNav = [
  { href: "/admin/content",   label: "Site Content", icon: "fa-pen-to-square" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="a-sidebar">
      {/* Brand */}
      <div className="a-brand">
        <Link href="/admin" className="a-brand-link">
          <div className="a-brand-icon">
            <i className="fas fa-bolt" />
          </div>
          <div>
            <div className="a-brand-name">Electro</div>
            <div className="a-brand-sub">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="a-nav">
        <div className="a-nav-section">Main Menu</div>
        {mainNav.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`a-nav-link${isActive(l.href) ? " active" : ""}`}
          >
            <span className="a-nav-icon"><i className={`fas ${l.icon}`} /></span>
            {l.label}
          </Link>
        ))}

        <div className="a-nav-section" style={{ marginTop: 8 }}>Settings</div>
        {settingsNav.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`a-nav-link${isActive(l.href) ? " active" : ""}`}
          >
            <span className="a-nav-icon"><i className={`fas ${l.icon}`} /></span>
            {l.label}
          </Link>
        ))}

        <hr className="a-nav-divider" />

        <Link href="/" className="a-nav-link">
          <span className="a-nav-icon"><i className="fas fa-store" /></span>
          View Store
        </Link>

        <button
          className="a-nav-link"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <span className="a-nav-icon"><i className="fas fa-sign-out-alt" /></span>
          Logout
        </button>
      </nav>

      <div className="a-sidebar-foot">
        Electro Store v1.0<br />Admin Panel
      </div>
    </aside>
  );
}
