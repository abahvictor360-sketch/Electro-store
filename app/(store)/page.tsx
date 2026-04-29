import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/siteConfig";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getSiteConfig();

  let newProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let saleProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];

  try {
    [newProducts, saleProducts] = await Promise.all([
      prisma.product.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
      prisma.product.findMany({ take: 4, where: { salePrice: { not: null } }, orderBy: { createdAt: "desc" } }),
    ]);
  } catch {
    // DB unavailable at build time — render empty state
  }

  const { hero, homepage } = config;

  const categories = [
    { name: "Laptops", icon: "fa-laptop", color: "#4e73df" },
    { name: "Smartphones", icon: "fa-mobile-alt", color: "#1cc88a" },
    { name: "Cameras", icon: "fa-camera", color: "#36b9cc" },
    { name: "Accessories", icon: "fa-headphones", color: "#f6c23e" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="hero-section" style={{ background: `linear-gradient(135deg, ${hero.bgColor} 0%, #1a1c2b 100%)` }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <p className="text-warning fw-semibold mb-2">{hero.badge}</p>
              <h1 style={{ whiteSpace: "pre-line" }}>{hero.title}</h1>
              <p className="mt-3 mb-4" style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.05rem" }}>
                {hero.subtitle}
              </p>
              <Link href={hero.primaryBtnLink} className="btn btn-electro px-4 py-2 me-3">
                {hero.primaryBtnText} <i className="fas fa-arrow-right ms-2" />
              </Link>
              <Link href={hero.secondaryBtnLink} className="btn btn-outline-light px-4 py-2">
                {hero.secondaryBtnText}
              </Link>
            </div>
            <div className="col-lg-6 d-none d-lg-flex justify-content-center">
              <i className="fas fa-laptop" style={{ fontSize: "160px", color: "rgba(255,255,255,0.08)" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {homepage.showCategories && (
        <section className="py-5">
          <div className="container">
            <h2 className="section-title">Shop by Category</h2>
            <div className="row g-3">
              {categories.map((cat) => (
                <div key={cat.name} className="col-6 col-md-3">
                  <Link href={`/store?category=${cat.name.toLowerCase()}`} className="text-decoration-none">
                    <div
                      className="rounded-3 p-4 text-center"
                      style={{ background: cat.color + "15", border: `1px solid ${cat.color}30` }}
                    >
                      <i className={`fas ${cat.icon} fa-2x mb-3`} style={{ color: cat.color }} />
                      <p className="fw-semibold mb-0" style={{ color: "#333" }}>{cat.name}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {homepage.showNewArrivals && (
        <section className="py-5 bg-light">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="section-title mb-0">{homepage.newArrivalsTitle}</h2>
              <Link href="/store" className="btn btn-sm btn-outline-danger">View All</Link>
            </div>
            {newProducts.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-box-open fa-3x mb-3" />
                <p>No products yet. Add products via the admin panel.</p>
                <Link href="/admin/products" className="btn btn-electro mt-2">Go to Admin</Link>
              </div>
            ) : (
              <div className="row g-3">
                {newProducts.map((p) => (
                  <div key={p.id} className="col-6 col-md-4 col-lg-3">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Hot Deals */}
      {homepage.showHotDeals && saleProducts.length > 0 && (
        <section className="py-5">
          <div className="container">
            <h2 className="section-title">{homepage.hotDealsTitle}</h2>
            <div className="row g-3">
              {saleProducts.map((p) => (
                <div key={p.id} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      {homepage.showNewsletter && (
        <section className="py-5" style={{ background: "var(--dark)", color: "#fff" }}>
          <div className="container text-center">
            <h3 className="fw-bold mb-2">{homepage.newsletterTitle}</h3>
            <p style={{ color: "rgba(255,255,255,0.7)" }} className="mb-4">
              {homepage.newsletterSubtitle}
            </p>
            <form className="d-flex justify-content-center gap-2 flex-wrap">
              <input
                type="email"
                className="form-control"
                placeholder="Your email address"
                style={{ maxWidth: 360, borderRadius: 2 }}
              />
              <button type="submit" className="btn btn-electro px-4">Subscribe</button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}
