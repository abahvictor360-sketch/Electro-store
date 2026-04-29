import Link from "next/link";
import type { SiteConfigData } from "@/lib/siteConfig";

export default function Footer({ config }: { config: SiteConfigData }) {
  const { footer } = config;

  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <h5>
              {config.header.logo}<span style={{ color: "var(--primary)" }}>.</span>
            </h5>
            <p style={{ fontSize: "0.9rem" }}>{footer.about}</p>
          </div>
          <div className="col-md-2 mb-4">
            <h5>Shop</h5>
            <Link href="/store?category=laptops">Laptops</Link>
            <Link href="/store?category=smartphones">Smartphones</Link>
            <Link href="/store?category=cameras">Cameras</Link>
            <Link href="/store?category=accessories">Accessories</Link>
          </div>
          <div className="col-md-2 mb-4">
            <h5>Account</h5>
            <Link href="/auth/login">Login</Link>
            <Link href="/auth/register">Register</Link>
            <Link href="/profile">My Profile</Link>
            <Link href="/orders">My Orders</Link>
          </div>
          <div className="col-md-4 mb-4">
            <h5>Contact</h5>
            <p style={{ fontSize: "0.9rem" }}>
              <i className="fas fa-envelope me-2" />{footer.email}<br />
              <i className="fas fa-phone me-2" />{footer.phone}<br />
              <i className="fas fa-map-marker-alt me-2" />{footer.address}
            </p>
          </div>
        </div>
        <div className="footer-bottom text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} {footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
