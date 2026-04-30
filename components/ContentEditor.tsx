"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteConfigData, HeroSlide, ShopBanner } from "@/lib/siteConfig";

function uid() { return Math.random().toString(36).slice(2, 9); }

const INPUT: React.CSSProperties = {
  width: "100%", padding: "9px 13px", border: "1px solid #e0e0e0", borderRadius: 8,
  fontSize: "0.875rem", outline: "none", background: "#fff", color: "#333",
  boxSizing: "border-box", fontFamily: "inherit",
};
const HINT: React.CSSProperties = { fontSize: "0.72rem", color: "#aaa", marginTop: 4, display: "block" };

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#555", marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <span style={HINT}>{hint}</span>}
    </div>
  );
}

export default function ContentEditor({ initialConfig }: { initialConfig: SiteConfigData }) {
  const router = useRouter();
  const [cfg, setCfg] = useState<SiteConfigData>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("identity");

  function set<K extends keyof SiteConfigData>(section: K, key: keyof SiteConfigData[K], val: unknown) {
    setCfg((p) => ({ ...p, [section]: { ...(p[section] as object), [key]: val } }));
    setSaved(false);
  }
  function setTop(key: keyof SiteConfigData, val: unknown) {
    setCfg((p) => ({ ...p, [key]: val }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/site-config", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cfg),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); router.refresh(); }
  }

  const tabs = [
    { id: "identity", label: "Site Identity",       icon: "fa-id-card" },
    { id: "banner",   label: "Announcement Banner", icon: "fa-bullhorn" },
    { id: "hero",     label: "Hero Slider",         icon: "fa-images" },
    { id: "shop",     label: "Category Banners",    icon: "fa-th-large" },
    { id: "homepage", label: "Homepage Sections",   icon: "fa-home" },
    { id: "header",   label: "Header",              icon: "fa-heading" },
    { id: "footer",   label: "Footer",              icon: "fa-copyright" },
  ];

  return (
    <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>

      {/* Sidebar */}
      <div style={{ width: 215, flexShrink: 0 }}>
        <div className="data-card">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "11px 16px",
              width: "100%", border: "none", cursor: "pointer",
              background: tab === t.id ? "rgba(209,0,36,0.08)" : "transparent",
              color: tab === t.id ? "#d10024" : "#555",
              fontWeight: tab === t.id ? 700 : 400, fontSize: "0.845rem",
              textAlign: "left", borderLeft: tab === t.id ? "3px solid #d10024" : "3px solid transparent",
              transition: "all 0.15s",
            }}>
              <i className={`fas ${t.icon}`} style={{ width: 16, fontSize: 13 }} /> {t.label}
            </button>
          ))}
        </div>
        <button onClick={save} disabled={saving} style={{
          marginTop: 12, width: "100%", padding: "11px", border: "none", borderRadius: 10,
          fontWeight: 700, fontSize: "0.875rem", cursor: saving ? "default" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          background: saved ? "#10b981" : "#d10024", color: "#fff", transition: "background 0.2s",
        }}>
          {saving ? <><i className="fas fa-spinner fa-spin" /> Saving...</>
           : saved  ? <><i className="fas fa-check" /> Saved!</>
           : <><i className="fas fa-save" /> Save Changes</>}
        </button>
        {saved && <p style={{ fontSize: "0.72rem", color: "#10b981", textAlign: "center", marginTop: 8 }}>✓ Changes are live.</p>}
      </div>

      {/* Panel */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* ── SITE IDENTITY ── */}
        {tab === "identity" && (
          <div className="data-card">
            <div className="data-card-header"><h2 className="data-card-title"><i className="fas fa-id-card" style={{ marginRight: 8, color: "#d10024" }} />Site Identity</h2></div>
            <div style={{ padding: "24px" }}>
              <div className="row g-3">
                <div className="col-md-6">
                  <Field label="Website Title (browser tab)" hint="Shown in the browser tab and search results.">
                    <input style={INPUT} value={cfg.siteTitle} onChange={(e) => setTop("siteTitle", e.target.value)} placeholder="Electro Store" />
                  </Field>
                  <Field label="Tagline / Slogan" hint="Shown in meta description and footer.">
                    <input style={INPUT} value={cfg.tagline} onChange={(e) => setTop("tagline", e.target.value)} placeholder="Shop the latest electronics..." />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Logo Text" hint="Displayed in the header if no logo image is set.">
                    <input style={INPUT} value={cfg.logoText} onChange={(e) => setTop("logoText", e.target.value)} placeholder="Electro" />
                  </Field>
                  <Field label="Logo Image URL" hint="Overrides text logo. Leave blank to use text. Recommended: 180×40px.">
                    <input style={INPUT} value={cfg.logoImageUrl} onChange={(e) => setTop("logoImageUrl", e.target.value)} placeholder="https://... or /img/logo.png" />
                  </Field>
                </div>
              </div>
              <div style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 8, background: "#1a1b2e", padding: "12px 20px", borderRadius: 8 }}>
                {cfg.logoImageUrl
                  ? <img src={cfg.logoImageUrl} alt="logo" style={{ height: 34, objectFit: "contain" }} />
                  : <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.25rem", fontFamily: "Montserrat, sans-serif" }}>{cfg.logoText || "Electro"}<span style={{ color: "#d10024" }}>.</span></span>}
              </div>
              <span style={HINT}>Logo preview on dark background</span>
            </div>
          </div>
        )}

        {/* ── ANNOUNCEMENT BANNER ── */}
        {tab === "banner" && (
          <div className="data-card">
            <div className="data-card-header"><h2 className="data-card-title"><i className="fas fa-bullhorn" style={{ marginRight: 8, color: "#d10024" }} />Announcement Banner</h2></div>
            <div style={{ padding: "24px" }}>
              {cfg.banner.enabled && (
                <div style={{ background: cfg.banner.bgColor, color: cfg.banner.textColor, textAlign: "center", padding: "10px 20px", borderRadius: 8, marginBottom: 20, fontSize: "0.875rem", fontWeight: 500 }}>
                  {cfg.banner.text || "(empty)"}
                </div>
              )}
              <Field label="Enable Banner">
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={cfg.banner.enabled} onChange={(e) => set("banner", "enabled", e.target.checked)} style={{ width: 17, height: 17 }} />
                  <span style={{ fontSize: "0.875rem" }}>Show at the top of every page</span>
                </label>
              </Field>
              <Field label="Banner Message">
                <input style={INPUT} value={cfg.banner.text} onChange={(e) => set("banner", "text", e.target.value)} placeholder="🎉 Free shipping on orders over $50!" />
              </Field>
              <div className="row g-3">
                <div className="col-md-4">
                  <Field label="Background Color">
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="color" value={cfg.banner.bgColor} onChange={(e) => set("banner", "bgColor", e.target.value)} style={{ width: 44, height: 38, borderRadius: 8, border: "1px solid #e0e0e0", cursor: "pointer", padding: 2 }} />
                      <input style={{ ...INPUT, flex: 1 }} value={cfg.banner.bgColor} onChange={(e) => set("banner", "bgColor", e.target.value)} />
                    </div>
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Text Color">
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="color" value={cfg.banner.textColor} onChange={(e) => set("banner", "textColor", e.target.value)} style={{ width: 44, height: 38, borderRadius: 8, border: "1px solid #e0e0e0", cursor: "pointer", padding: 2 }} />
                      <input style={{ ...INPUT, flex: 1 }} value={cfg.banner.textColor} onChange={(e) => set("banner", "textColor", e.target.value)} />
                    </div>
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Click Link (optional)">
                    <input style={INPUT} value={cfg.banner.link} onChange={(e) => set("banner", "link", e.target.value)} placeholder="/store" />
                  </Field>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HERO SLIDER ── */}
        {tab === "hero" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "#1e2030" }}>Hero / Slider Images</h3>
                <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#888" }}>Add one or more slides for the homepage hero area.</p>
              </div>
              <button onClick={() => setTop("heroSlides", [...cfg.heroSlides, { id: uid(), image: "", title: "New Slide Title", subtitle: "Subtitle here", btnText: "Shop Now", btnLink: "/store", badgeText: "New" } as HeroSlide])} className="btn-ap" style={{ padding: "8px 14px", fontSize: "0.8rem" }}>
                <i className="fas fa-plus" /> Add Slide
              </button>
            </div>
            {cfg.heroSlides.length === 0 && (
              <div className="data-card"><div style={{ padding: "50px", textAlign: "center", color: "#bbb" }}><i className="fas fa-images" style={{ fontSize: "2.5rem", display: "block", marginBottom: 12 }} /><p style={{ margin: 0 }}>No slides yet. Click &ldquo;Add Slide&rdquo; to start.</p></div></div>
            )}
            {cfg.heroSlides.map((slide, idx) => (
              <div key={slide.id} className="data-card" style={{ marginBottom: 16 }}>
                <div className="data-card-header">
                  <h2 className="data-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#d10024", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{idx + 1}</span>
                    Slide {idx + 1}
                  </h2>
                  <button onClick={() => setTop("heroSlides", cfg.heroSlides.filter((_, i) => i !== idx))} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13 }}>
                    <i className="fas fa-trash" /> Remove
                  </button>
                </div>
                <div style={{ padding: "20px 24px" }}>
                  {slide.image && <div style={{ marginBottom: 14, borderRadius: 8, overflow: "hidden", maxHeight: 130, background: "#f0f2f7" }}><img src={slide.image} alt="" style={{ width: "100%", height: 130, objectFit: "cover" }} /></div>}
                  <Field label="Slide Image URL" hint="Recommended: 1920×600px. Use /img/... for local images.">
                    <input style={INPUT} value={slide.image} onChange={(e) => setTop("heroSlides", cfg.heroSlides.map((s, i) => i === idx ? { ...s, image: e.target.value } : s))} placeholder="https://... or /img/hero.jpg" />
                  </Field>
                  <div className="row g-3">
                    <div className="col-md-4"><Field label="Badge Text"><input style={INPUT} value={slide.badgeText} onChange={(e) => setTop("heroSlides", cfg.heroSlides.map((s, i) => i === idx ? { ...s, badgeText: e.target.value } : s))} placeholder="New Arrivals" /></Field></div>
                    <div className="col-md-8"><Field label="Title" hint="Use \n for a line break."><input style={INPUT} value={slide.title} onChange={(e) => setTop("heroSlides", cfg.heroSlides.map((s, i) => i === idx ? { ...s, title: e.target.value } : s))} placeholder="Latest Electronics\nat Best Prices" /></Field></div>
                    <div className="col-md-12"><Field label="Subtitle"><input style={INPUT} value={slide.subtitle} onChange={(e) => setTop("heroSlides", cfg.heroSlides.map((s, i) => i === idx ? { ...s, subtitle: e.target.value } : s))} /></Field></div>
                    <div className="col-md-4"><Field label="Button Text"><input style={INPUT} value={slide.btnText} onChange={(e) => setTop("heroSlides", cfg.heroSlides.map((s, i) => i === idx ? { ...s, btnText: e.target.value } : s))} /></Field></div>
                    <div className="col-md-8"><Field label="Button Link"><input style={INPUT} value={slide.btnLink} onChange={(e) => setTop("heroSlides", cfg.heroSlides.map((s, i) => i === idx ? { ...s, btnLink: e.target.value } : s))} placeholder="/store" /></Field></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CATEGORY BANNERS ── */}
        {tab === "shop" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "#1e2030" }}>Category Shop Banners</h3>
                <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#888" }}>The image tiles shown below the header (typically 3).</p>
              </div>
              <button onClick={() => setTop("shopBanners", [...cfg.shopBanners, { id: uid(), image: "", title: "New Category", link: "/store" } as ShopBanner])} className="btn-ap" style={{ padding: "8px 14px", fontSize: "0.8rem" }}>
                <i className="fas fa-plus" /> Add Banner
              </button>
            </div>
            {cfg.shopBanners.map((b, idx) => (
              <div key={b.id} className="data-card" style={{ marginBottom: 14 }}>
                <div className="data-card-header">
                  <h2 className="data-card-title">Banner {idx + 1}</h2>
                  <button onClick={() => setTop("shopBanners", cfg.shopBanners.filter((_, i) => i !== idx))} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13 }}><i className="fas fa-trash" /> Remove</button>
                </div>
                <div style={{ padding: "18px 22px" }}>
                  <div className="row g-3" style={{ alignItems: "center" }}>
                    {b.image && <div className="col-md-2"><div style={{ height: 80, borderRadius: 8, overflow: "hidden", background: "#f0f2f7" }}><img src={b.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div></div>}
                    <div className={b.image ? "col-md-10" : "col-md-12"}>
                      <div className="row g-2">
                        <div className="col-md-5"><Field label="Image URL"><input style={INPUT} value={b.image} onChange={(e) => setTop("shopBanners", cfg.shopBanners.map((x, i) => i === idx ? { ...x, image: e.target.value } : x))} placeholder="/img/shop01.png" /></Field></div>
                        <div className="col-md-3"><Field label="Title" hint="Use \n for line break"><input style={INPUT} value={b.title} onChange={(e) => setTop("shopBanners", cfg.shopBanners.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))} placeholder="Laptop\nCollection" /></Field></div>
                        <div className="col-md-4"><Field label="Link"><input style={INPUT} value={b.link} onChange={(e) => setTop("shopBanners", cfg.shopBanners.map((x, i) => i === idx ? { ...x, link: e.target.value } : x))} placeholder="/store?category=Laptops" /></Field></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── HOMEPAGE SECTIONS ── */}
        {tab === "homepage" && (
          <div className="data-card">
            <div className="data-card-header"><h2 className="data-card-title"><i className="fas fa-home" style={{ marginRight: 8, color: "#d10024" }} />Homepage Sections</h2></div>
            <div style={{ padding: "24px" }}>
              {([
                { show: "showNewProducts", title: "newProductsTitle", label: "New Products", defaultTitle: "New Products" },
                { show: "showTopSelling", title: "topSellingTitle", label: "Top Selling", defaultTitle: "Top Selling" },
              ] as const).map((s) => (
                <div key={s.show} style={{ padding: "14px", background: "#f8f9fc", borderRadius: 10, marginBottom: 12 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", marginBottom: 12 }}>
                    <input type="checkbox" checked={cfg.homepage[s.show]} onChange={(e) => set("homepage", s.show, e.target.checked)} style={{ width: 16, height: 16 }} />
                    Show {s.label} Section
                  </label>
                  <Field label="Section Title"><input style={INPUT} value={cfg.homepage[s.title]} onChange={(e) => set("homepage", s.title, e.target.value)} placeholder={s.defaultTitle} /></Field>
                </div>
              ))}
              <div style={{ padding: "14px", background: "#f8f9fc", borderRadius: 10, marginBottom: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", marginBottom: 12 }}>
                  <input type="checkbox" checked={cfg.homepage.showHotDeals} onChange={(e) => set("homepage", "showHotDeals", e.target.checked)} style={{ width: 16, height: 16 }} />
                  Show Hot Deals Section
                </label>
                <div className="row g-2">
                  <div className="col-md-6"><Field label="Title"><input style={INPUT} value={cfg.homepage.hotDealsTitle} onChange={(e) => set("homepage", "hotDealsTitle", e.target.value)} /></Field></div>
                  <div className="col-md-6"><Field label="Subtitle"><input style={INPUT} value={cfg.homepage.hotDealsSubtitle} onChange={(e) => set("homepage", "hotDealsSubtitle", e.target.value)} /></Field></div>
                </div>
              </div>
              <div style={{ padding: "14px", background: "#f8f9fc", borderRadius: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>
                  <input type="checkbox" checked={cfg.homepage.showNewsletter} onChange={(e) => set("homepage", "showNewsletter", e.target.checked)} style={{ width: 16, height: 16 }} />
                  Show Newsletter Section
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── HEADER ── */}
        {tab === "header" && (
          <div className="data-card">
            <div className="data-card-header"><h2 className="data-card-title"><i className="fas fa-heading" style={{ marginRight: 8, color: "#d10024" }} />Header Settings</h2></div>
            <div style={{ padding: "24px" }}>
              <Field label="Phone Number (shown in top-header bar)"><input style={INPUT} value={cfg.header.phone} onChange={(e) => set("header", "phone", e.target.value)} placeholder="+1 (800) ELECTRO" /></Field>
              <Field label="Show Search Bar">
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={cfg.header.showSearch} onChange={(e) => set("header", "showSearch", e.target.checked)} style={{ width: 16, height: 16 }} />
                  <span style={{ fontSize: "0.875rem" }}>Display the search bar in the main header</span>
                </label>
              </Field>
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        {tab === "footer" && (
          <div className="data-card">
            <div className="data-card-header"><h2 className="data-card-title"><i className="fas fa-copyright" style={{ marginRight: 8, color: "#d10024" }} />Footer Settings</h2></div>
            <div style={{ padding: "24px" }}>
              <Field label="About Text"><textarea style={{ ...INPUT, minHeight: 78, resize: "vertical" }} value={cfg.footer.about} onChange={(e) => set("footer", "about", e.target.value)} /></Field>
              <div className="row g-3">
                <div className="col-md-6"><Field label="Contact Email"><input style={INPUT} value={cfg.footer.email} onChange={(e) => set("footer", "email", e.target.value)} /></Field></div>
                <div className="col-md-6"><Field label="Phone"><input style={INPUT} value={cfg.footer.phone} onChange={(e) => set("footer", "phone", e.target.value)} /></Field></div>
                <div className="col-12"><Field label="Address"><input style={INPUT} value={cfg.footer.address} onChange={(e) => set("footer", "address", e.target.value)} /></Field></div>
                <div className="col-12"><Field label="Copyright Line"><input style={INPUT} value={cfg.footer.copyright} onChange={(e) => set("footer", "copyright", e.target.value)} /></Field></div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
