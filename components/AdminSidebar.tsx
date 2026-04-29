"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/admin", label: "Dashboard", icon: "fa-gauge" },
  { href: "/admin/products", label: "Products", icon: "fa-box" },
  { href: "/admin/orders", label: "Orders", icon: "fa-receipt" },
  { href: "/admin/customers", label: "Customers", icon: "fa-users" },
  { href: "/admin/content", label: "Content Editor", icon: "fa-pen-to-square" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="admin-sidebar">
      <div className="brand">
        Electro<span style={{ color: "#d10024" }}>.</span> Admin
      </div>
      <nav className="mt-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`nav-link d-flex align-items-center gap-2 ${pathname === l.href ? "active" : ""}`}
          >
            <i className={`fas ${l.icon}`} style={{ width: 18 }} />
            {l.label}
          </Link>
        ))}
        <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "12px 0" }} />
        <Link href="/" className="nav-link d-flex align-items-center gap-2">
          <i className="fas fa-store" style={{ width: 18 }} />
          View Store
        </Link>
        <button
          className="nav-link btn text-start d-flex align-items-center gap-2 w-100 border-0"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <i className="fas fa-sign-out-alt" style={{ width: 18 }} />
          Logout
        </button>
      </nav>
    </div>
  );
}
