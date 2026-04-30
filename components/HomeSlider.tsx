"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  category: string;
  images: string[];
}

interface Props {
  products: Product[];
  navId: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jQuery: any;
  }
}

export default function HomeSlider({ products, navId }: Props) {
  const addToCart = useCart((s) => s.addItem);
  const toggleWishlist = useWishlist((s) => s.toggle);
  const wishlistItems = useWishlist((s) => s.items);

  useEffect(() => {
    const $ = window.jQuery;
    if (!$) return;

    const selector = `.products-slick[data-nav="#${navId}"]`;
    const $slick = $(selector);
    if ($slick.length && !$slick.hasClass("slick-initialized")) {
      $slick.slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        appendDots: `#${navId}`,
        dots: true,
        responsive: [
          { breakpoint: 991, settings: { slidesToShow: 3 } },
          { breakpoint: 767, settings: { slidesToShow: 2 } },
          { breakpoint: 480, settings: { slidesToShow: 1 } },
        ],
      });
    }
  }, [navId]);

  return (
    <div className="products-slick" data-nav={`#${navId}`}>
      {products.map((p) => {
        const img = p.images?.[0] || "/img/product01.png";
        const inWishlist = wishlistItems.some((w) => w.id === p.id);
        const discount = p.salePrice ? Math.round(((p.price - p.salePrice) / p.price) * 100) : null;

        return (
          <div key={p.id} className="product">
            <div className="product-img">
              <Link href={`/product/${p.slug}`}>
                <img src={img} alt={p.name} />
              </Link>
              {(discount || p.salePrice === null) && (
                <div className="product-label">
                  {discount && <span className="sale">-{discount}%</span>}
                </div>
              )}
            </div>
            <div className="product-body">
              <p className="product-category">{p.category}</p>
              <h3 className="product-name">
                <Link href={`/product/${p.slug}`}>{p.name}</Link>
              </h3>
              <h4 className="product-price">
                ${(p.salePrice ?? p.price).toFixed(2)}
                {p.salePrice && (
                  <del className="product-old-price">${p.price.toFixed(2)}</del>
                )}
              </h4>
              <div className="product-rating">
                <i className="fa fa-star" />
                <i className="fa fa-star" />
                <i className="fa fa-star" />
                <i className="fa fa-star" />
                <i className="fa fa-star-o" />
              </div>
              <div className="product-btns">
                <button
                  className="add-to-wishlist"
                  onClick={() => toggleWishlist({ id: p.id, name: p.name, slug: p.slug, price: p.salePrice ?? p.price, salePrice: p.salePrice, image: img })}
                >
                  <i className={inWishlist ? "fa fa-heart" : "fa fa-heart-o"} />
                  <span className="tooltipp">{inWishlist ? "remove from wishlist" : "add to wishlist"}</span>
                </button>
                <button className="quick-view">
                  <i className="fa fa-eye" />
                  <span className="tooltipp">quick view</span>
                </button>
              </div>
            </div>
            <div className="add-to-cart">
              <button
                className="add-to-cart-btn"
                onClick={() => addToCart({ id: p.id, name: p.name, slug: p.slug, price: p.salePrice ?? p.price, image: img })}
              >
                <i className="fa fa-shopping-cart" /> add to cart
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
