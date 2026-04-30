"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import type { Product } from "@prisma/client";
import ProductCard from "./ProductCard";

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetail({ product, related }: Props) {
  const addItem = useCart((s) => s.addItem);
  const toggle = useWishlist((s) => s.toggle);
  const has = useWishlist((s) => s.has);
  const [qty, setQty] = useState(1);
  const inWishlist = has(product.id);

  const price = product.salePrice ?? product.price;
  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  const images = product.images?.length ? product.images : ["/img/product01.png"];

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, slug: product.slug, price, image: images[0] });
    }
  }

  return (
    <>
      {/* BREADCRUMB */}
      <div id="breadcrumb" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ul className="breadcrumb-tree">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/store">Store</Link></li>
                <li><Link href={`/store?category=${product.category.toLowerCase()}`}>{product.category}</Link></li>
                <li className="active">{product.name}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION */}
      <div className="section">
        <div className="container">
          <div className="row">
            {/* Product main img */}
            <div className="col-md-5 col-md-push-2">
              <div id="product-main-img">
                {images.map((img, i) => (
                  <div key={i} className="product-preview">
                    <img src={img} alt={product.name} />
                  </div>
                ))}
              </div>
            </div>

            {/* Product thumb imgs */}
            <div className="col-md-2 col-md-pull-5">
              <div id="product-imgs">
                {images.map((img, i) => (
                  <div key={i} className="product-preview">
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Product details */}
            <div className="col-md-5">
              <div className="product-details">
                <h2 className="product-name">{product.name}</h2>
                <div>
                  <div className="product-rating">
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                    <i className="fa fa-star" />
                    <i className="fa fa-star-o" />
                  </div>
                  <a className="review-link" href="#tab3">0 Review(s) | Add your review</a>
                </div>
                <div>
                  <h3 className="product-price">
                    ${price.toFixed(2)}
                    {product.salePrice && (
                      <del className="product-old-price">${product.price.toFixed(2)}</del>
                    )}
                  </h3>
                  <span className="product-available">
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <p>{product.description}</p>

                <div className="add-to-cart">
                  <div className="qty-label">
                    Qty
                    <div className="input-number">
                      <input
                        type="number"
                        value={qty}
                        min={1}
                        max={product.stock}
                        onChange={(e) => setQty(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      />
                      <span className="qty-up" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</span>
                      <span className="qty-down" onClick={() => setQty(q => Math.max(1, q - 1))}>-</span>
                    </div>
                  </div>
                  <button
                    className="add-to-cart-btn"
                    disabled={product.stock === 0}
                    onClick={handleAddToCart}
                  >
                    <i className="fa fa-shopping-cart" /> add to cart
                  </button>
                </div>

                <ul className="product-btns">
                  <li>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); toggle({ id: product.id, name: product.name, slug: product.slug, price: product.price, salePrice: product.salePrice, image: images[0] }); }}
                    >
                      <i className={inWishlist ? "fa fa-heart" : "fa fa-heart-o"} />
                      {inWishlist ? " remove from wishlist" : " add to wishlist"}
                    </a>
                  </li>
                  <li><a href="#"><i className="fa fa-exchange" /> add to compare</a></li>
                </ul>

                <ul className="product-links">
                  <li>Category:</li>
                  <li><Link href={`/store?category=${product.category.toLowerCase()}`}>{product.category}</Link></li>
                </ul>

                <ul className="product-links">
                  <li>Brand: <strong>{product.brand}</strong></li>
                </ul>

                <ul className="product-links">
                  <li>Share:</li>
                  <li><a href="#"><i className="fa fa-facebook" /></a></li>
                  <li><a href="#"><i className="fa fa-twitter" /></a></li>
                  <li><a href="#"><i className="fa fa-google-plus" /></a></li>
                  <li><a href="#"><i className="fa fa-envelope" /></a></li>
                </ul>
              </div>
            </div>

            {/* Product tab */}
            <div className="col-md-12">
              <div id="product-tab">
                <ul className="tab-nav">
                  <li className="active"><a data-toggle="tab" href="#tab1">Description</a></li>
                  <li><a data-toggle="tab" href="#tab2">Details</a></li>
                  <li><a data-toggle="tab" href="#tab3">Reviews (0)</a></li>
                </ul>
                <div className="tab-content">
                  <div id="tab1" className="tab-pane fade in active">
                    <div className="row">
                      <div className="col-md-12">
                        <p>{product.description}</p>
                      </div>
                    </div>
                  </div>
                  <div id="tab2" className="tab-pane fade in">
                    <div className="row">
                      <div className="col-md-12">
                        <table className="table">
                          <tbody>
                            <tr><td><strong>Brand</strong></td><td>{product.brand}</td></tr>
                            <tr><td><strong>Category</strong></td><td>{product.category}</td></tr>
                            <tr><td><strong>Stock</strong></td><td>{product.stock} units</td></tr>
                            {discount > 0 && <tr><td><strong>Discount</strong></td><td>{discount}% OFF</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div id="tab3" className="tab-pane fade in">
                    <div className="row">
                      <div className="col-md-12">
                        <p>No reviews yet. Be the first to review this product!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="section-title text-center">
                  <h3 className="title">Related Products</h3>
                </div>
              </div>
              {related.map((p) => (
                <div key={p.id} className="col-md-3 col-xs-6">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
