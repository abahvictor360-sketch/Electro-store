import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/siteConfig";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import HomeSlider from "@/components/HomeSlider";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = await getSiteConfig();

  let newProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let topProducts: Awaited<ReturnType<typeof prisma.product.findMany>> = [];

  try {
    [newProducts, topProducts] = await Promise.all([
      prisma.product.findMany({ take: 8, orderBy: { createdAt: "desc" } }),
      prisma.product.findMany({ take: 8, orderBy: { createdAt: "asc" } }),
    ]);
  } catch {
    // DB unavailable at build time
  }

  return (
    <SessionProvider>
      <Header config={config} />

      {/* SECTION — Shop Banners */}
      <div className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-4 col-xs-6">
              <div className="shop">
                <div className="shop-img">
                  <img src="/img/shop01.png" alt="Laptop Collection" />
                </div>
                <div className="shop-body">
                  <h3>Laptop<br />Collection</h3>
                  <Link href="/store?category=laptops" className="cta-btn">
                    Shop now <i className="fa fa-arrow-circle-right" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-xs-6">
              <div className="shop">
                <div className="shop-img">
                  <img src="/img/shop03.png" alt="Accessories Collection" />
                </div>
                <div className="shop-body">
                  <h3>Accessories<br />Collection</h3>
                  <Link href="/store?category=accessories" className="cta-btn">
                    Shop now <i className="fa fa-arrow-circle-right" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-xs-6">
              <div className="shop">
                <div className="shop-img">
                  <img src="/img/shop02.png" alt="Cameras Collection" />
                </div>
                <div className="shop-body">
                  <h3>Cameras<br />Collection</h3>
                  <Link href="/store?category=cameras" className="cta-btn">
                    Shop now <i className="fa fa-arrow-circle-right" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /SECTION */}

      {/* SECTION — New Products */}
      <div className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h3 className="title">New Products</h3>
                <div className="section-nav">
                  <ul className="section-tab-nav tab-nav">
                    <li className="active"><a data-toggle="tab" href="#tab1">All</a></li>
                    <li><a data-toggle="tab" href="#tab1">Laptops</a></li>
                    <li><a data-toggle="tab" href="#tab1">Smartphones</a></li>
                    <li><a data-toggle="tab" href="#tab1">Cameras</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="row">
                <div className="products-tabs">
                  <div id="tab1" className="tab-pane active">
                    {newProducts.length === 0 ? (
                      <div className="products-slick" data-nav="#slick-nav-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div key={n} className="product">
                            <div className="product-img">
                              <img src={`/img/product0${n}.png`} alt="Product" />
                            </div>
                            <div className="product-body">
                              <p className="product-category">Electronics</p>
                              <h3 className="product-name"><a href="/store">Sample Product</a></h3>
                              <h4 className="product-price">$0.00</h4>
                              <div className="product-rating">
                                <i className="fa fa-star" /><i className="fa fa-star" /><i className="fa fa-star" />
                                <i className="fa fa-star" /><i className="fa fa-star-o" />
                              </div>
                              <div className="product-btns">
                                <button className="add-to-wishlist"><i className="fa fa-heart-o" /><span className="tooltipp">add to wishlist</span></button>
                                <button className="quick-view"><i className="fa fa-eye" /><span className="tooltipp">quick view</span></button>
                              </div>
                            </div>
                            <div className="add-to-cart">
                              <Link href="/store" className="add-to-cart-btn"><i className="fa fa-shopping-cart" /> Browse Products</Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <HomeSlider products={newProducts} navId="slick-nav-1" />
                    )}
                    <div id="slick-nav-1" className="products-slick-nav" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /SECTION */}

      {/* HOT DEAL SECTION */}
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
                <h2 className="text-uppercase">hot deal this week</h2>
                <p>New Collection Up to 50% OFF</p>
                <Link href="/store?sale=true" className="primary-btn cta-btn">Shop now</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /HOT DEAL SECTION */}

      {/* SECTION — Top Selling */}
      <div className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="section-title">
                <h3 className="title">Top Selling</h3>
                <div className="section-nav">
                  <ul className="section-tab-nav tab-nav">
                    <li className="active"><a data-toggle="tab" href="#tab2">All</a></li>
                    <li><a data-toggle="tab" href="#tab2">Laptops</a></li>
                    <li><a data-toggle="tab" href="#tab2">Smartphones</a></li>
                    <li><a data-toggle="tab" href="#tab2">Cameras</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-md-12">
              <div className="row">
                <div className="products-tabs">
                  <div id="tab2" className="tab-pane fade in active">
                    {topProducts.length === 0 ? (
                      <div className="products-slick" data-nav="#slick-nav-2">
                        {[6, 7, 8, 9, 1].map((n) => (
                          <div key={n} className="product">
                            <div className="product-img">
                              <img src={`/img/product0${n}.png`} alt="Product" />
                            </div>
                            <div className="product-body">
                              <p className="product-category">Electronics</p>
                              <h3 className="product-name"><a href="/store">Sample Product</a></h3>
                              <h4 className="product-price">$0.00</h4>
                              <div className="product-rating">
                                <i className="fa fa-star" /><i className="fa fa-star" /><i className="fa fa-star" />
                                <i className="fa fa-star" /><i className="fa fa-star-o" />
                              </div>
                              <div className="product-btns">
                                <button className="add-to-wishlist"><i className="fa fa-heart-o" /><span className="tooltipp">add to wishlist</span></button>
                                <button className="quick-view"><i className="fa fa-eye" /><span className="tooltipp">quick view</span></button>
                              </div>
                            </div>
                            <div className="add-to-cart">
                              <Link href="/store" className="add-to-cart-btn"><i className="fa fa-shopping-cart" /> Browse Products</Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <HomeSlider products={topProducts} navId="slick-nav-2" />
                    )}
                    <div id="slick-nav-2" className="products-slick-nav" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /SECTION */}

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
      {/* /NEWSLETTER */}

      <Footer config={config} />
    </SessionProvider>
  );
}
