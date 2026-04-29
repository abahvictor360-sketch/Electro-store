"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, Suspense } from "react";
import type { SiteConfigData } from "@/lib/siteConfig";

function HeaderInner({ config }: { config: SiteConfigData }) {
  const cartItems = useCart((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const wishlistItems = useWishlist((s) => s.items);

  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/store?q=${encodeURIComponent(search.trim())}`);
  }

  const { header } = config;

  return (
    <>
      {/* Announcement Banner */}
      {config.banner.enabled && (
        <div
          className="text-center py-1 px-3"
          style={{ background: config.banner.bgColor, color: config.banner.textColor, fontSize: "0.85rem" }}
        >
          {config.banner.link ? (
            <Link href={config.banner.link} style={{ color: config.banner.textColor, textDecoration: "none" }}>
              {config.banner.text}
            </Link>
          ) : (
            config.banner.text
          )}
        </div>
      )}

      {/* Top Bar */}
      <div className="top-bar">
        <div className="container d-flex justify-content-between">
          <span><i className="fas fa-phone me-1" /> {header.phone}</span>
          <div className="d-flex gap-3">
            {session ? (
              <>
                <Link href="/profile">My Account</Link>
                <button
                  className="btn btn-link p-0 text-white-50"
                  style={{ fontSize: "0.8rem", textDecoration: "none" }}
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login">Login</Link>
                <Link href="/auth/register">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar navbar-electro navbar-expand-lg py-2">
        <div className="container">
          <Link href="/" className="navbar-brand">
            {header.logo}<span>.</span>
          </Link>

          {header.showSearch && (
            <form className="d-flex flex-grow-1 mx-4 search-bar" onSubmit={handleSearch}>
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="px-3">
                <i className="fas fa-search" />
              </button>
            </form>
          )}

          {/* Icons */}
          <div className="d-flex align-items-center gap-3">
            {/* Wishlist */}
            <Link href="/wishlist" className="text-white position-relative" style={{ textDecoration: "none" }} title="Wishlist">
              <i className="fas fa-heart fs-5" />
              {wishlistItems.length > 0 && (
                <span className="cart-badge">{wishlistItems.length}</span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="text-white position-relative" style={{ textDecoration: "none" }} title="Cart">
              <i className="fas fa-shopping-cart fs-5" />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            <button
              className="navbar-toggler ms-1"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navMain"
            >
              <i className="fas fa-bars text-white" />
            </button>
          </div>

          <div className="collapse navbar-collapse" id="navMain">
            <ul className="navbar-nav ms-auto">
              {header.navLinks.map((l) => (
                <li key={l.href} className="nav-item">
                  <Link href={l.href} className="nav-link">{l.label}</Link>
                </li>
              ))}
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">
                  Categories
                </a>
                <ul className="dropdown-menu">
                  {["Laptops", "Smartphones", "Cameras", "Accessories"].map((c) => (
                    <li key={c}>
                      <Link href={`/store?category=${c.toLowerCase()}`} className="dropdown-item">
                        {c}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              {session && (
                <li className="nav-item">
                  <Link href="/orders" className="nav-link">My Orders</Link>
                </li>
              )}
              {(session?.user as { role?: string })?.role === "ADMIN" && (
                <li className="nav-item">
                  <Link href="/admin" className="nav-link" style={{ color: "#ffc107 !important" }}>
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default function Header({ config }: { config: SiteConfigData }) {
  return (
    <Suspense fallback={null}>
      <HeaderInner config={config} />
    </Suspense>
  );
}
