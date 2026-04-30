export interface HeroSlide {
  id: string;
  image: string;        // URL
  title: string;
  subtitle: string;
  btnText: string;
  btnLink: string;
  badgeText: string;
}

export interface ShopBanner {
  id: string;
  image: string;        // URL e.g. /img/shop01.png
  title: string;        // e.g. "Laptop\nCollection"
  link: string;
}

export interface AnnouncementBanner {
  enabled: boolean;
  text: string;
  bgColor: string;
  textColor: string;
  link: string;
}

export interface SiteConfigData {
  // ── Site identity ───────────────────────────────
  siteTitle: string;
  tagline: string;
  logoText: string;
  logoImageUrl: string;   // empty = use text logo

  // ── Announcement banner (top of every page) ────
  banner: AnnouncementBanner;

  // ── Hero / slider ───────────────────────────────
  heroSlides: HeroSlide[];

  // ── Category shop banners (3 tiles on homepage) ─
  shopBanners: ShopBanner[];

  // ── Header ──────────────────────────────────────
  header: {
    phone: string;
    showSearch: boolean;
  };

  // ── Homepage sections ───────────────────────────
  homepage: {
    showNewProducts: boolean;
    newProductsTitle: string;
    showTopSelling: boolean;
    topSellingTitle: string;
    showHotDeals: boolean;
    hotDealsTitle: string;
    hotDealsSubtitle: string;
    showNewsletter: boolean;
  };

  // ── Footer ──────────────────────────────────────
  footer: {
    about: string;
    email: string;
    phone: string;
    address: string;
    copyright: string;
  };
}

export const defaultConfig: SiteConfigData = {
  siteTitle: "Electro Store",
  tagline: "Shop the latest electronics at the best prices.",
  logoText: "Electro",
  logoImageUrl: "",

  banner: {
    enabled: false,
    text: "🎉 Free shipping on all orders over $50 — Limited time offer!",
    bgColor: "#d10024",
    textColor: "#ffffff",
    link: "/store",
  },

  heroSlides: [
    {
      id: "slide-1",
      image: "/img/hero.jpg",
      title: "Latest Electronics\nat Best Prices",
      subtitle: "Shop thousands of top-brand laptops, smartphones, cameras and accessories.",
      btnText: "Shop Now",
      btnLink: "/store",
      badgeText: "New Arrivals",
    },
  ],

  shopBanners: [
    { id: "b1", image: "/img/shop01.png", title: "Laptop\nCollection",     link: "/store?category=Laptops" },
    { id: "b2", image: "/img/shop03.png", title: "Accessories\nCollection", link: "/store?category=Accessories" },
    { id: "b3", image: "/img/shop02.png", title: "Cameras\nCollection",    link: "/store?category=Cameras" },
  ],

  header: {
    phone: "+1 (800) ELECTRO",
    showSearch: true,
  },

  homepage: {
    showNewProducts: true,
    newProductsTitle: "New Products",
    showTopSelling: true,
    topSellingTitle: "Top Selling",
    showHotDeals: true,
    hotDealsTitle: "Hot Deal Of The Week",
    hotDealsSubtitle: "New Collection Up to 50% OFF",
    showNewsletter: true,
  },

  footer: {
    about: "Your one-stop shop for the latest electronics — laptops, smartphones, cameras and accessories.",
    email: "support@electro.store",
    phone: "+1 (800) ELECTRO",
    address: "123 Tech Ave, Silicon Valley, CA",
    copyright: "Electro Store. All rights reserved.",
  },
};

export async function getSiteConfig(): Promise<SiteConfigData> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const row = await prisma.siteConfig.findUnique({ where: { id: "site" } });
    if (!row) return defaultConfig;
    // Deep-merge: DB value takes priority, defaults fill missing keys
    return deepMerge(defaultConfig, row.data as Partial<SiteConfigData>);
  } catch {
    return defaultConfig;
  }
}

function deepMerge<T extends object>(defaults: T, overrides: Partial<T>): T {
  const result = { ...defaults };
  for (const key in overrides) {
    const v = overrides[key];
    if (v !== undefined && v !== null) {
      if (Array.isArray(v)) {
        (result as Record<string, unknown>)[key] = v;
      } else if (typeof v === "object" && typeof defaults[key] === "object" && !Array.isArray(defaults[key])) {
        (result as Record<string, unknown>)[key] = deepMerge(
          defaults[key] as object,
          v as Partial<object>
        );
      } else {
        (result as Record<string, unknown>)[key] = v;
      }
    }
  }
  return result;
}
