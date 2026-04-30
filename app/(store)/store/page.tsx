import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import StoreFilters from "@/components/StoreFilters";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { q?: string; category?: string; min?: string; max?: string; brand?: string; sale?: string };
}

export default async function StorePage({ searchParams }: Props) {
  const { q, category, min, max, brand, sale } = searchParams;

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let categories: { category: string }[] = [];
  let brands: { brand: string }[] = [];
  let topProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];

  try {
    [products, categories, brands, topProducts] = await Promise.all([
      prisma.product.findMany({
        where: {
          AND: [
            q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] } : {},
            category ? { category: { equals: category, mode: "insensitive" } } : {},
            brand ? { brand: { equals: brand, mode: "insensitive" } } : {},
            min ? { price: { gte: parseFloat(min) } } : {},
            max ? { price: { lte: parseFloat(max) } } : {},
            sale ? { salePrice: { not: null } } : {},
          ],
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.groupBy({ by: ["category"] }),
      prisma.product.groupBy({ by: ["brand"] }),
      prisma.product.findMany({ take: 3, orderBy: { createdAt: "desc" } }),
    ]);
  } catch {
    // DB unavailable
  }

  const currentLabel = q ? `Results for "${q}"` : category ? category : "All Products";

  return (
    <>
      {/* BREADCRUMB */}
      <div id="breadcrumb" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul className="breadcrumb-tree">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/store">All Categories</Link></li>
                {category && <li><a href="#">{category}</a></li>}
                <li className="active">{currentLabel} ({products.length} Results)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION */}
      <div className="section">
        <div className="container">
          <div className="row">
            {/* ASIDE */}
            <div id="aside" className="col-md-3">
              <Suspense fallback={null}>
                <StoreFilters
                  categories={categories.map((c) => c.category)}
                  brands={brands.map((b) => b.brand)}
                  current={{ q, category, min, max, brand }}
                  topProducts={topProducts}
                />
              </Suspense>
            </div>

            {/* STORE */}
            <div id="store" className="col-md-9">
              {/* store top filter */}
              <div className="store-filter clearfix">
                <div className="store-sort">
                  <label>
                    Sort By:
                    <select className="input-select">
                      <option value="0">Popular</option>
                      <option value="1">Newest</option>
                    </select>
                  </label>
                  <label>
                    Show:
                    <select className="input-select">
                      <option value="0">20</option>
                      <option value="1">50</option>
                    </select>
                  </label>
                </div>
                <ul className="store-grid">
                  <li className="active"><i className="fa fa-th" /></li>
                  <li><a href="#"><i className="fa fa-th-list" /></a></li>
                </ul>
              </div>

              {/* store products */}
              {products.length === 0 ? (
                <div className="text-center" style={{ padding: "60px 0" }}>
                  <i className="fa fa-search fa-3x" style={{ color: "#ccc", marginBottom: 20 }} />
                  <p>No products found.</p>
                  <Link href="/store" className="primary-btn">View All Products</Link>
                </div>
              ) : (
                <div className="row">
                  {products.map((p) => (
                    <div key={p.id} className="col-md-4 col-xs-6">
                      <ProductCard product={p} />
                    </div>
                  ))}
                </div>
              )}

              {/* store bottom filter */}
              <div className="store-filter clearfix">
                <span className="store-qty">Showing {products.length} products</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEWSLETTER */}
      <div id="newsletter" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="newsletter">
                <p>Sign Up for the <strong>NEWSLETTER</strong></p>
                <form>
                  <input className="input" type="email" placeholder="Enter Your Email" />
                  <button className="newsletter-btn"><i className="fa fa-envelope" /> Subscribe</button>
                </form>
                <ul className="newsletter-follow">
                  <li><a href="#"><i className="fa fa-facebook" /></a></li>
                  <li><a href="#"><i className="fa fa-twitter" /></a></li>
                  <li><a href="#"><i className="fa fa-instagram" /></a></li>
                  <li><a href="#"><i className="fa fa-pinterest" /></a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
