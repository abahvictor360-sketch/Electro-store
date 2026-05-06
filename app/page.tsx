import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/siteConfig";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import HomeTabs from "@/components/HomeTabs";
import HeroSection from "@/components/HeroSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getSiteConfig();

  let newProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let topProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let categories: string[] = [];
  // Custom sections: map of sectionId -> products
  let customSectionProducts: Record<string, Awaited<ReturnType<typeof prisma.product.findMany>>> = {};

  try {
    const allCustomIds = (config.customSections ?? [])
      .filter((s) => s.enabled && s.productIds.length > 0)
      .flatMap((s) => s.productIds);
    const uniqueIds = Array.from(new Set(allCustomIds));

    const [np, tp, cats, customProds] = await Promise.all([
      prisma.product.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
      prisma.product.findMany({ take: 8, orderBy: { price: "desc" } }),
      prisma.product.groupBy({ by: ["category"] }),
      uniqueIds.length > 0
        ? prisma.product.findMany({ where: { id: { in: uniqueIds } } })
        : Promise.resolve([]),
    ]);
    newProducts = np;
    topProducts = tp;
    categories = cats.map((c) => c.category);

    // Build per-section product list (preserving order from productIds array)
    for (const section of config.customSections ?? []) {
      if (!section.enabled || section.productIds.length === 0) continue;
      customSectionProducts[section.id] = section.productIds
        .map((id) => customProds.find((p) => p.id === id))
        .filter(Boolean) as typeof customProds;
    }
  } catch {
    // DB unavailable at build time
  }

  const { homepage } = config;

  return (
    <SessionProvider>
      {/* Announcement Banner */}
      {config.banner.enabled && (
        <div style={{ background: config.banner.bgColor, color: config.banner.textColor, textAlign: "center", padding: "10px 16px", fontSize: "0.9rem", fontWeight: 500 }}>
          {config.banner.link ? (
            <Link href={config.banner.link} style={{ color: config.banner.textColor, textDecoration: "none" }}>{config.banner.text}</Link>
          ) : config.banner.text}
        </div>
      )}

      <Header config={config} />

      {/* HERO SECTION */}
      <HeroSection slides={config.heroSlides} />

      {/* SECTION — Shop Banners */}
      <div className="section">
        <div className="container">
          <div className="row">
            {config.shopBanners.map((banner) => (
              <div key={banner.id} className="col-md-4 col-xs-6">
                <div className="shop">
                  <div className="shop-img">
                    <img src={banner.image} alt={banner.title.replace("\n", " ")} />
                  </div>
                  <div className="shop-body">
                    <h3 dangerouslySetInnerHTML={{ __html: banner.title.replace("\n", "<br />") }} />
                    <Link href={banner.link} className="cta-btn">
                      Shop now <i className="fa fa-arrow-circle-right" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION — New Products */}
      {homepage.showNewProducts && (
        <div className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <HomeTabs
                  products={newProducts}
                  title={homepage.newProductsTitle}
                  categories={categories}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HOT DEAL SECTION */}
      {homepage.showHotDeals && (
        <div id="hot-deal" className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="hot-deal">
                  <ul className="hot-deal-countdown" id="countdown">
                    <li><div><h3>02</h3><span>Days</span></div></li>
                    <li><div><h3>10</h3><span>Hours</span></div></li>
                    <li><div><h3>34</h3><span>Mins</span></div></li>
                    <li><div><h3>60</h3><span>Secs</span></div></li>
                  </ul>
                  <h2 className="text-uppercase">{homepage.hotDealsTitle}</h2>
                  <p>{homepage.hotDealsSubtitle}</p>
                  <Link href="/store?sale=true" className="primary-btn cta-btn">Shop now</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION — Top Selling */}
      {homepage.showTopSelling && (
        <div className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <HomeTabs
                  products={topProducts}
                  title={homepage.topSellingTitle}
                  categories={categories}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM SECTIONS */}
      {(config.customSections ?? [])
        .filter((s) => s.enabled && (customSectionProducts[s.id]?.length ?? 0) > 0)
        .map((section) => (
          <div key={section.id} className="section">
            <div className="container">
              <div className="row">
                <div className="col-md-12">
                  <HomeTabs
                    products={customSectionProducts[section.id]}
                    title={section.title}
                    categories={categories}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

      {/* NEWSLETTER */}
      {homepage.showNewsletter && (
        <div id="newsletter" className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="newsletter">
                  <p>Sign Up for the <strong>NEWSLETTER</strong></p>
                  <form>
                    <input className="input" type="email" placeholder="Enter Your Email" />
                    <button className="newsletter-btn">
                      <i className="fa fa-envelope" /> Subscribe
                    </button>
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
      )}

      <Footer config={config} />
    </SessionProvider>
  );
}
