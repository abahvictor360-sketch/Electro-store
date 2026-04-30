import Link from "next/link";
import type { SiteConfigData } from "@/lib/siteConfig";

export default function Footer({ config }: { config: SiteConfigData }) {
  const { footer } = config;

  return (
    <footer id="footer">
      {/* top footer */}
      <div className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-3 col-xs-6">
              <div className="footer">
                <h3 className="footer-title">About Us</h3>
                <p>{footer.about}</p>
                <ul className="footer-links">
                  <li><a href="#"><i className="fa fa-map-marker" /> {footer.address}</a></li>
                  <li><a href="#"><i className="fa fa-phone" /> {footer.phone}</a></li>
                  <li><a href="#"><i className="fa fa-envelope-o" /> {footer.email}</a></li>
                </ul>
              </div>
            </div>

            <div className="col-md-3 col-xs-6">
              <div className="footer">
                <h3 className="footer-title">Categories</h3>
                <ul className="footer-links">
                  <li><Link href="/store?sale=true">Hot deals</Link></li>
                  <li><Link href="/store?category=laptops">Laptops</Link></li>
                  <li><Link href="/store?category=smartphones">Smartphones</Link></li>
                  <li><Link href="/store?category=cameras">Cameras</Link></li>
                  <li><Link href="/store?category=accessories">Accessories</Link></li>
                </ul>
              </div>
            </div>

            <div className="clearfix visible-xs" />

            <div className="col-md-3 col-xs-6">
              <div className="footer">
                <h3 className="footer-title">Information</h3>
                <ul className="footer-links">
                  <li><Link href="#">About Us</Link></li>
                  <li><Link href="#">Contact Us</Link></li>
                  <li><Link href="#">Privacy Policy</Link></li>
                  <li><Link href="/orders">Orders and Returns</Link></li>
                  <li><Link href="#">Terms &amp; Conditions</Link></li>
                </ul>
              </div>
            </div>

            <div className="col-md-3 col-xs-6">
              <div className="footer">
                <h3 className="footer-title">Service</h3>
                <ul className="footer-links">
                  <li><Link href="/profile">My Account</Link></li>
                  <li><Link href="/cart">View Cart</Link></li>
                  <li><Link href="/wishlist">Wishlist</Link></li>
                  <li><Link href="/orders">Track My Order</Link></li>
                  <li><Link href="/auth/login">Help</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /top footer */}

      {/* bottom footer */}
      <div id="bottom-footer" className="section">
        <div className="container">
          <div className="row">
            <div className="col-md-12 text-center">
              <ul className="footer-payments">
                <li><a href="#"><i className="fa fa-cc-visa" /></a></li>
                <li><a href="#"><i className="fa fa-credit-card" /></a></li>
                <li><a href="#"><i className="fa fa-cc-paypal" /></a></li>
                <li><a href="#"><i className="fa fa-cc-mastercard" /></a></li>
                <li><a href="#"><i className="fa fa-cc-discover" /></a></li>
                <li><a href="#"><i className="fa fa-cc-amex" /></a></li>
              </ul>
              <span className="copyright">
                Copyright &copy; {new Date().getFullYear()} {footer.copyright}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* /bottom footer */}
    </footer>
  );
}
