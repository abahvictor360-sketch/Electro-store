import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import { getSiteConfig } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();

  return (
    <SessionProvider>
      <Header config={config} />
      <main style={{ minHeight: "70vh" }}>{children}</main>
      <Footer config={config} />
    </SessionProvider>
  );
}
