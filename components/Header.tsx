"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { signOut, useSession } from "next-auth/react";
import { useState, Suspense } from "react";
import type { SiteConfigData } from "@/lib/siteConfig";

function HeaderInner({ config }: { config: SiteConfigData }) {
  const cartItems = useCart((s) => s.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const wishlistItems = useWishlist((s) => s.items);
  const { data: session } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) router.push(`/store?q=${encodeURIComponent(search.trim())}`);
  }

  const { header } = config;

  return (
    <header>
      {/* TOP HEADER */}
      <div id="top-header">
        <div className="container">
          <ul className="header-links pull-left">
            <li><a href="#"><i className="fa fa-phone" /> {header.phone}</a></li>
            <li><Link href="/store"><i className="fa fa-tag" /> Shop Now</Link></li>
          </ul>
          <ul className="header-links pull-right">
            {session ? (
              <>
                <li><Link href="/profile"><i className="fa fa-user-o" /> My Account</Link></li>
                <li>
                  <button
                    style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, font: "inherit" }}
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <i className="fa fa-sign-out" /> Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link href="/auth/login"><i className="fa fa-user-o" /> Login</Link></li>
                <li><Link href="/auth/register"><i className="fa fa-pencil" /> Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
      {/* /TOP HEADER */}

      {/* MAIN HEADER */}
      <div id="header">
        <div className="container">
          <div className="row">
            {/* LOGO */}
            <div className="col-md-3">
              <div className="header-logo">
                <Link href="/" className="logo">
                  {config.logoImageUrl ? (
                    <img src={config.logoImageUrl} alt={config.logoText || config.siteTitle} />
                  ) : config.logoText ? (
                    <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#d10024", letterSpacing: "-1px", textDecoration: "none" }}>
                      {config.logoText}
                    </span>
                  ) : (
                    <img src="/img/logo.png" alt="Electro" />
                  )}
                </Link>
              </div>
            </div>
            {/* /LOGO */}

            {/* SEARCH BAR */}
            <div className="col-md-6">
              <div className="header-search">
                <form onSubmit={handleSearch}>
                  <select className="input-select">
                    <option value="0">All Categories</option>
                    <option value="laptops">Laptops</option>
                    <option value="smartphones">Smartphones</option>
                    <option value="cameras">Cameras</option>
                    <option value="accessories">Accessories</option>
                  </select>
                  <input
                    className="input"
                    placeholder="Search here"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="search-btn">Search</button>
                </form>
              </div>
            </div>
            {/* /SEARCH BAR */}

            {/* ACCOUNT */}
            <div className="col-md-3 clearfix">
              <div className="header-ctn">
                {/* Wishlist */}
                <div>
                  <Link href="/wishlist">
                    <i className="fa fa-heart-o" />
                    <span>Your Wishlist</span>
                    <div className="qty">{wishlistItems.length}</div>
                  </Link>
                </div>
                {/* /Wishlist */}

                {/* Cart */}
                <div className="dropdown">
                  <Link href="/cart" className="dropdown-toggle" data-toggle="dropdown">
                    <i className="fa fa-shopping-cart" />
                    <span>Your Cart</span>
                    <div className="qty">{cartCount}</div>
                  </Link>
                  <div className="cart-dropdown">
                    <div className="cart-list">
                      {cartItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="product-widget">
                          <div className="product-img">
                            <img src={item.image || "/img/product01.png"} alt={item.name} />
                          </div>
                          <div className="product-body">
                            <h3 className="product-name"><Link href={`/product/${item.slug}`}>{item.name}</Link></h3>
                            <h4 className="product-price"><span className="qty">{item.quantity}x</span>${item.price.toFixed(2)}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="cart-summary">
                      <small>{cartCount} Item(s) selected</small>
                      <h5>SUBTOTAL: ${cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)}</h5>
                    </div>
                    <div className="cart-btns">
                      <Link href="/cart">View Cart</Link>
                      <Link href="/checkout">Checkout <i className="fa fa-arrow-circle-right" /></Link>
                    </div>
                  </div>
                </div>
                {/* /Cart */}

                {/* Menu Toggle */}
                <div className="menu-toggle">
                  <a href="#">
                    <i className="fa fa-bars" />
                    <span>Menu</span>
                  </a>
                </div>
                {/* /Menu Toggle */}
              </div>
            </div>
            {/* /ACCOUNT */}
          </div>
        </div>
      </div>
      {/* /MAIN HEADER */}

      {/* NAVIGATION */}
      <nav id="navigation">
        <div className="container">
          <div id="responsive-nav">
            <ul className="main-nav nav navbar-nav">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/store?sale=true">Hot Deals</Link></li>
              <li><Link href="/store">Categories</Link></li>
              <li><Link href="/store?category=laptops">Laptops</Link></li>
              <li><Link href="/store?category=smartphones">Smartphones</Link></li>
              <li><Link href="/store?category=cameras">Cameras</Link></li>
              <li><Link href="/store?category=accessories">Accessories</Link></li>
              {session && <li><Link href="/orders">My Orders</Link></li>}
              {(session?.user as { role?: string })?.role === "ADMIN" && (
                <li><Link href="/admin">Admin Panel</Link></li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      {/* /NAVIGATION */}
    </header>
  );
}

export default function Header({ config }: { config: SiteConfigData }) {
  return (
    <Suspense fallback={null}>
      <HeaderInner config={config} />
    </Suspense>
  );
}
