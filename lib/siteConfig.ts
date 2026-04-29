export interface SiteConfigData {
  banner: {
    enabled: boolean;
    text: string;
    bgColor: string;
    textColor: string;
    link: string;
  };
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    primaryBtnText: string;
    primaryBtnLink: string;
    secondaryBtnText: string;
    secondaryBtnLink: string;
    bgColor: string;
  };
  header: {
    logo: string;
    phone: string;
    showSearch: boolean;
    navLinks: { label: string; href: string }[];
  };
  footer: {
    about: string;
    email: string;
    phone: string;
    address: string;
    copyright: string;
  };
  homepage: {
    showNewArrivals: boolean;
    newArrivalsTitle: string;
    showHotDeals: boolean;
    hotDealsTitle: string;
    showNewsletter: boolean;
    newsletterTitle: string;
    newsletterSubtitle: string;
    showCategories: boolean;
  };
}

export const defaultConfig: SiteConfigData = {
  banner: {
    enabled: false,
    text: "🎉 Free shipping on all orders over $50 — Limited time offer!",
    bgColor: "#d10024",
    textColor: "#ffffff",
    link: "/store",
  },
  hero: {
    badge: "New Arrivals",
    title: "Latest Electronics\nat Best Prices",
    subtitle: "Shop thousands of top-brand laptops, smartphones, cameras and accessories.",
    primaryBtnText: "Shop Now",
    primaryBtnLink: "/store",
    secondaryBtnText: "View Deals",
    secondaryBtnLink: "/store?category=laptops",
    bgColor: "#2b2d42",
  },
  header: {
    logo: "Electro",
    phone: "+1 (800) ELECTRO",
    showSearch: true,
    navLinks: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/store" },
    ],
  },
  footer: {
    about: "Your one-stop shop for the latest electronics — laptops, smartphones, cameras and accessories.",
    email: "support@electro.store",
    phone: "+1 (800) ELECTRO",
    address: "123 Tech Ave, Silicon Valley, CA",
    copyright: "Electro Store. All rights reserved.",
  },
  homepage: {
    showNewArrivals: true,
    newArrivalsTitle: "New Arrivals",
    showHotDeals: true,
    hotDealsTitle: "Hot Deals",
    showNewsletter: true,
    newsletterTitle: "Subscribe to Our Newsletter",
    newsletterSubtitle: "Get the latest deals and new arrivals straight to your inbox.",
    showCategories: true,
  },
};

export async function getSiteConfig(): Promise<SiteConfigData> {
  const { prisma } = await import("@/lib/prisma");
  const row = await prisma.siteConfig.findUnique({ where: { id: "site" } });
  if (!row) return defaultConfig;
  return { ...defaultConfig, ...(row.data as Partial<SiteConfigData>) };
}
