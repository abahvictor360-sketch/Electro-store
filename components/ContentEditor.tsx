"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { SiteConfigData, HeroSlide, ShopBanner, CustomSection, CustomSectionType } from "@/lib/siteConfig";

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

/* ── Image Field: URL input + device upload ──────────────── */
function ImageField({
  label,
  hint,
  value,
  preview,
  previewHeight = 110,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  preview?: boolean;
  previewHeight?: number;
  onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadErr("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err: unknown) {
      setUploadErr(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Field label={label} hint={hint}>
      {/* Preview */}
      {preview && value && (
        <div style={{ marginBottom: 10, borderRadius: 8, overflow: "hidden", background: "#f0f2f7", height: previewHeight }}>
          <img src={value} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      {/* URL input row */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          style={{ ...INPUT, flex: 1 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste a URL  or  upload from device →"
        />
        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFile}
        />
        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{
            flexShrink: 0, height: 38, padding: "0 14px",
            border: "1px solid #d10024", borderRadius: 8,
            background: uploading ? "#f0f2f7" : "#fff",
            color: "#d10024", fontWeight: 600, fontSize: "0.8rem",
            cursor: uploading ? "default" : "pointer",
            display: "flex", alignItems: "center", gap: 6,
            transition: "background 0.15s",
            whiteSpace: "nowrap",
          }}
        >
          {uploading
            ? <><i className="fas fa-spinner fa-spin" /> Uploading…</>
            : <><i className="fas fa-upload" /> Upload</>}
        </button>
      </div>

      {uploadErr && (
        <span style={{ fontSize: "0.72rem", color: "#ef4444", marginTop: 4, display: "block" }}>
          ⚠ {uploadErr}
        </span>
      )}
    </Field>
  );
}

/* ── Product Picker ──────────────────────────────────────── */
interface PickerProduct {
  id: string;
  name: string;
  category: string;
  images: string[];
  price: number;
}

function ProductPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickerProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  return (
    <div style={{ border: "1px solid #e0e0e0", borderRadius: 8, overflow: "hidden" }}>
      {/* Search input */}
      <div style={{ position: "relative", borderBottom: "1px solid #e0e0e0" }}>
        <i className="fas fa-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 13 }} />
        <input
          style={{ ...INPUT, border: "none", borderRadius: 0, paddingLeft: 34, outline: "none" }}
          placeholder="Search products by name, category, brand…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Results */}
      <div style={{ maxHeight: 260, overflowY: "auto", background: "#fafafa" }}>
        {loading && (
          <div style={{ padding: "16px", textAlign: "center", color: "#aaa", fontSize: "0.82rem" }}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: 6 }} />Loading…
          </div>
        )}
        {!loading && results.length === 0 && (
          <div style={{ padding: "16px", textAlign: "center", color: "#bbb", fontSize: "0.82rem" }}>
            {query ? "No products found." : "Start typing to search…"}
          </div>
        )}
        {!loading && results.map((p) => {
          const checked = selected.includes(p.id);
          return (
            <label
              key={p.id}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer",
                background: checked ? "rgba(209,0,36,0.05)" : "transparent",
                borderBottom: "1px solid #f0f2f7",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(p.id)}
                style={{ width: 15, height: 15, flexShrink: 0 }}
              />
              <div style={{ width: 34, height: 34, borderRadius: 6, overflow: "hidden", background: "#f0f2f7", flexShrink: 0 }}>
                <img
                  src={p.images?.[0] || "/img/product01.png"}
                  alt={p.name}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "0.83rem", color: "#1e2030", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                <div style={{ fontSize: "0.72rem", color: "#888" }}>{p.category} · ${p.price.toFixed(2)}</div>
              </div>
              {checked && <i className="fas fa-check-circle" style={{ color: "#d10024", fontSize: 14, flexShrink: 0 }} />}
            </label>
          );
        })}
      </div>

      {/* Selected count */}
      {selected.length > 0 && (
        <div style={{ padding: "8px 14px", background: "#fff", borderTop: "1px solid #e0e0e0", fontSize: "0.78rem", color: "#555", display: "flex", justifyContent: "space-between" }}>
          <span><strong style={{ color: "#d10024" }}>{selected.length}</strong> product{selected.length !== 1 ? "s" : ""} selected</span>
          <button onClick={() => onChange([])} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "0.75rem", padding: 0 }}>Clear all</button>
        </div>
      )}
    </div>
  );
}

/* ── Selected Product Chips ──────────────────────────────── */
function SelectedChips({ ids, onRemove }: { ids: string[]; onRemove: (id: string) => void }) {
  const [products, setProducts] = useState<PickerProduct[]>([]);

  useEffect(() => {
    if (ids.length === 0) { setProducts([]); return; }
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, [ids.join(",")]);

  if (ids.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
      {ids.map((id) => {
        const p = products.find((x) => x.id === id);
        return (
          <span
            key={id}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: "#f0f2f7", borderRadius: 20, padding: "4px 10px",
              fontSize: "0.75rem", color: "#555",
            }}
          >
            {p ? p.name : id.slice(-6)}
            <button
              onClick={() => onRemove(id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0, lineHeight: 1, fontSize: 12 }}
            >
              ×
            </button>
          </span>
        );
      })}
    </div>
  );
}

/* ── Main Editor ─────────────────────────────────────────── */
export default function ContentEditor({ initialConfig }: { initialConfig: SiteConfigData }) {
  const router = useRouter();
  const [cfg, setCfg] = useState<SiteConfigData>({
    ...initialConfig,
    customSections: initialConfig.customSections ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("identity");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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

  /* Custom sections helpers */
  function addSection() {
    const s: CustomSection = { id: uid(), title: "New Section", type: "custom", enabled: true, productIds: [] };
    const currentOrder = cfg.sectionOrder ?? DEFAULT_SECTION_ORDER;
    // Insert before newsletter if present, otherwise append
    const newsletterIdx = currentOrder.indexOf("newsletter");
    const newOrder = [...currentOrder];
    if (newsletterIdx >= 0) newOrder.splice(newsletterIdx, 0, s.id);
    else newOrder.push(s.id);
    setCfg((p) => ({ ...p, customSections: [...p.customSections, s], sectionOrder: newOrder }));
    setExpandedSection(s.id);
    setSaved(false);
  }
  function updateSection(id: string, patch: Partial<CustomSection>) {
    setTop("customSections", cfg.customSections.map((s) => s.id === id ? { ...s, ...patch } : s));
    setSaved(false);
  }
  function removeSection(id: string) {
    const newOrder = (cfg.sectionOrder ?? DEFAULT_SECTION_ORDER).filter((sid) => sid !== id);
    setCfg((p) => ({
      ...p,
      customSections: p.customSections.filter((s) => s.id !== id),
      sectionOrder: newOrder,
    }));
    if (expandedSection === id) setExpandedSection(null);
    setSaved(false);
  }

  const SECTION_TYPE_LABELS: Record<CustomSectionType, string> = {
    "flash-sale": "⚡ Flash Sale",
    "featured":   "⭐ Featured Products",
    "custom":     "🗂 Custom",
  };

  // ── Default section order (used when sectionOrder is missing in saved config)
  const DEFAULT_SECTION_ORDER = [
    "new-products", "hot-deals", "top-selling", "top-selling-widgets", "newsletter",
  ];

  // Metadata for built-in sections
  const BUILT_IN_META: Record<string, { label: string; icon: string }> = {
    "new-products":        { label: "New Products (Slider)",     icon: "fa-star" },
    "hot-deals":           { label: "Hot Deal Banner",           icon: "fa-fire" },
    "top-selling":         { label: "Top Selling (Slider)",      icon: "fa-chart-line" },
    "top-selling-widgets": { label: "Top Selling (Widget List)", icon: "fa-th-list" },
    "newsletter":          { label: "Newsletter Signup",         icon: "fa-envelope" },
  };

  // Compute the effective full order: saved order + any custom sections not yet in it
  const savedOrder: string[] = cfg.sectionOrder ?? DEFAULT_SECTION_ORDER;
  const allCustomIds = cfg.customSections.map((s) => s.id);
  const fullOrder = [
    ...savedOrder,
    ...allCustomIds.filter((id) => !savedOrder.includes(id)),
  ];

  function moveSection(idx: number, dir: -1 | 1) {
    const newOrder = [...fullOrder];
    const target = idx + dir;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[idx], newOrder[target]] = [newOrder[target], newOrder[idx]];
    setCfg((p) => ({ ...p, sectionOrder: newOrder }));
    setSaved(false);
  }

  // Built-in section show/hide helpers
  function builtInVisible(id: string): boolean {
    if (id === "new-products")        return cfg.homepage.showNewProducts;
    if (id === "hot-deals")           return cfg.homepage.showHotDeals;
    if (id === "top-selling")         return cfg.homepage.showTopSelling;
    if (id === "top-selling-widgets") return cfg.homepage.showTopSelling;
    if (id === "newsletter")          return cfg.homepage.showNewsletter;
    return false;
  }
  function toggleBuiltIn(id: string, visible: boolean) {
    if (id === "new-products")        set("homepage", "showNewProducts",  visible);
    if (id === "hot-deals")           set("homepage", "showHotDeals",     visible);
    if (id === "top-selling" || id === "top-selling-widgets") set("homepage", "showTopSelling", visible);
    if (id === "newsletter")          set("homepage", "showNewsletter",   visible);
  }

  const tabs = [
    { id: "identity",  label: "Site Identity",       icon: "fa-id-card" },
    { id: "banner",    label: "Announcement Banner",  icon: "fa-bullhorn" },
    { id: "hero",      label: "Hero Slider",          icon: "fa-images" },
    { id: "shop",      label: "Category Banners",     icon: "fa-th-large" },
    { id: "homepage",  label: "Homepage Layout",       icon: "fa-home" },
    { id: "sections",  label: "Custom Sections",      icon: "fa-layer-group" },
    { id: "header",    label: "Header",               icon: "fa-heading" },
    { id: "footer",    label: "Footer",               icon: "fa-copyright" },
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
                  <ImageField
                    label="Logo Image"
                    hint="Overrides text logo. Leave blank to use text. Recommended: 180×40px."
                    value={cfg.logoImageUrl}
                    onChange={(url) => setTop("logoImageUrl", url)}
                  />
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
                  <ImageField
                    label="Slide Image"
                    hint="Recommended: 1920×600px. Upload from device or paste a URL."
                    value={slide.image}
                    preview
                    previewHeight={130}
                    onChange={(url) => setTop("heroSlides", cfg.heroSlides.map((s, i) => i === idx ? { ...s, image: url } : s))}
                  />
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
                  <div className="row g-2">
                    <div className="col-md-12">
                      <ImageField
                        label="Banner Image"
                        hint="Upload from device or paste a URL. Recommended: 400×300px."
                        value={b.image}
                        preview
                        previewHeight={80}
                        onChange={(url) => setTop("shopBanners", cfg.shopBanners.map((x, i) => i === idx ? { ...x, image: url } : x))}
                      />
                    </div>
                    <div className="col-md-4">
                      <Field label="Title" hint="Use \n for line break">
                        <input style={INPUT} value={b.title} onChange={(e) => setTop("shopBanners", cfg.shopBanners.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))} placeholder="Laptop\nCollection" />
                      </Field>
                    </div>
                    <div className="col-md-8">
                      <Field label="Link">
                        <input style={INPUT} value={b.link} onChange={(e) => setTop("shopBanners", cfg.shopBanners.map((x, i) => i === idx ? { ...x, link: e.target.value } : x))} placeholder="/store?category=Laptops" />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── HOMEPAGE LAYOUT ── */}
        {tab === "homepage" && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "#1e2030" }}>Homepage Layout</h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.78rem", color: "#888" }}>
                Drag sections up or down to reorder them. Toggle the eye to show/hide. Click a section to edit its title or settings.
              </p>
            </div>

            {fullOrder.map((sectionId, idx) => {
              const isBuiltIn = sectionId in BUILT_IN_META;
              const meta = BUILT_IN_META[sectionId];
              const customSec = !isBuiltIn ? cfg.customSections.find((s) => s.id === sectionId) : null;
              const visible = isBuiltIn ? builtInVisible(sectionId) : (customSec?.enabled ?? false);
              const label = isBuiltIn ? meta.label : (customSec?.title || "Untitled Section");
              const icon  = isBuiltIn ? meta.icon : "fa-layer-group";

              return (
                <div
                  key={sectionId}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: visible ? "#fff" : "#fafafa",
                    border: `1px solid ${visible ? "#e4e7ed" : "#f0f2f7"}`,
                    borderRadius: 10, padding: "12px 16px", marginBottom: 8,
                    opacity: visible ? 1 : 0.6,
                    transition: "all 0.15s",
                  }}
                >
                  {/* Order buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                    <button
                      onClick={() => moveSection(idx, -1)}
                      disabled={idx === 0}
                      title="Move up"
                      style={{ width: 24, height: 22, border: "1px solid #e0e0e0", borderRadius: 4, background: idx === 0 ? "#f9fafb" : "#fff", color: idx === 0 ? "#ddd" : "#555", cursor: idx === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}
                    >
                      <i className="fas fa-chevron-up" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 1)}
                      disabled={idx === fullOrder.length - 1}
                      title="Move down"
                      style={{ width: 24, height: 22, border: "1px solid #e0e0e0", borderRadius: 4, background: idx === fullOrder.length - 1 ? "#f9fafb" : "#fff", color: idx === fullOrder.length - 1 ? "#ddd" : "#555", cursor: idx === fullOrder.length - 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}
                    >
                      <i className="fas fa-chevron-down" />
                    </button>
                  </div>

                  {/* Position badge */}
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: visible ? "#d10024" : "#ccc", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {idx + 1}
                  </span>

                  {/* Icon + Label */}
                  <i className={`fas ${icon}`} style={{ color: visible ? "#d10024" : "#bbb", fontSize: 14, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontWeight: 600, fontSize: "0.875rem", color: visible ? "#1e2030" : "#aaa" }}>
                    {label}
                    {!isBuiltIn && customSec && (
                      <span style={{ marginLeft: 8, fontSize: "0.7rem", background: "#f0f2f7", color: "#888", padding: "1px 7px", borderRadius: 20, fontWeight: 600 }}>
                        {SECTION_TYPE_LABELS[customSec.type]}
                      </span>
                    )}
                  </span>

                  {/* Title edit for built-in sections with titles */}
                  {isBuiltIn && (sectionId === "new-products" || sectionId === "top-selling" || sectionId === "top-selling-widgets") && (
                    <input
                      style={{ ...INPUT, width: 200, fontSize: "0.8rem", padding: "6px 10px" }}
                      value={
                        sectionId === "new-products" ? cfg.homepage.newProductsTitle :
                        cfg.homepage.topSellingTitle
                      }
                      onChange={(e) => set("homepage", sectionId === "new-products" ? "newProductsTitle" : "topSellingTitle", e.target.value)}
                      placeholder="Section title…"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}

                  {/* Hot deals subtitle quick-edit */}
                  {isBuiltIn && sectionId === "hot-deals" && (
                    <input
                      style={{ ...INPUT, width: 180, fontSize: "0.8rem", padding: "6px 10px" }}
                      value={cfg.homepage.hotDealsTitle}
                      onChange={(e) => set("homepage", "hotDealsTitle", e.target.value)}
                      placeholder="Hot deals title…"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}

                  {/* Custom section: jump to edit */}
                  {!isBuiltIn && customSec && (
                    <button
                      onClick={() => { setExpandedSection(sectionId); setTab("sections"); }}
                      style={{ flexShrink: 0, height: 30, padding: "0 10px", border: "1px solid #e0e0e0", borderRadius: 6, background: "#fff", color: "#555", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <i className="fas fa-pen" /> Edit
                    </button>
                  )}

                  {/* Visibility toggle */}
                  <button
                    onClick={() => {
                      if (isBuiltIn) toggleBuiltIn(sectionId, !visible);
                      else if (customSec) updateSection(sectionId, { enabled: !visible });
                    }}
                    title={visible ? "Hide section" : "Show section"}
                    style={{ flexShrink: 0, width: 34, height: 34, border: "1px solid #e0e0e0", borderRadius: 8, background: visible ? "#fff" : "#f0f2f7", color: visible ? "#d10024" : "#bbb", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}
                  >
                    <i className={`fas fa-eye${visible ? "" : "-slash"}`} />
                  </button>
                </div>
              );
            })}

            <p style={{ marginTop: 14, fontSize: "0.72rem", color: "#aaa" }}>
              <i className="fas fa-info-circle" style={{ marginRight: 4 }} />
              Use the ↑↓ arrows to reorder. Changes apply after you click <strong>Save Changes</strong>. Add custom sections in the <button onClick={() => setTab("sections")} style={{ background: "none", border: "none", color: "#d10024", cursor: "pointer", fontWeight: 700, fontSize: "0.72rem", padding: 0 }}>Custom Sections</button> tab.
            </p>
          </div>
        )}

        {/* ── CUSTOM SECTIONS ── */}
        {tab === "sections" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "#1e2030" }}>Custom Homepage Sections</h3>
                <p style={{ margin: "3px 0 0", fontSize: "0.78rem", color: "#888" }}>
                  Create sections like &ldquo;Flash Sale&rdquo; or &ldquo;Featured Products&rdquo; and hand-pick which products appear there.
                </p>
              </div>
              <button onClick={addSection} className="btn-ap" style={{ padding: "8px 14px", fontSize: "0.8rem" }}>
                <i className="fas fa-plus" /> Add Section
              </button>
            </div>

            {cfg.customSections.length === 0 && (
              <div className="data-card">
                <div style={{ padding: "50px", textAlign: "center", color: "#bbb" }}>
                  <i className="fas fa-layer-group" style={{ fontSize: "2.5rem", display: "block", marginBottom: 12 }} />
                  <p style={{ margin: "0 0 14px" }}>No custom sections yet.</p>
                  <button onClick={addSection} className="btn-ap" style={{ padding: "9px 18px", fontSize: "0.82rem" }}>
                    <i className="fas fa-plus" style={{ marginRight: 6 }} /> Create your first section
                  </button>
                </div>
              </div>
            )}

            {cfg.customSections.map((section, i) => {
              const isOpen = expandedSection === section.id;
              return (
                <div key={section.id} className="data-card" style={{ marginBottom: 14 }}>
                  {/* Section header (always visible) */}
                  <div
                    className="data-card-header"
                    style={{ cursor: "pointer" }}
                    onClick={() => setExpandedSection(isOpen ? null : section.id)}
                  >
                    <h2 className="data-card-title" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 24, height: 24, borderRadius: "50%", background: section.enabled ? "#d10024" : "#ccc", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {i + 1}
                      </span>
                      <span style={{ flex: 1 }}>{section.title || "Untitled Section"}</span>
                      <span style={{ fontSize: "0.72rem", background: "#f0f2f7", color: "#888", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>
                        {SECTION_TYPE_LABELS[section.type]}
                      </span>
                      <span style={{ fontSize: "0.72rem", background: section.enabled ? "#d1fae5" : "#fee2e2", color: section.enabled ? "#065f46" : "#991b1b", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>
                        {section.enabled ? "Visible" : "Hidden"}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#aaa", marginLeft: 4 }}>
                        {section.productIds.length} product{section.productIds.length !== 1 ? "s" : ""}
                      </span>
                    </h2>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: 13, padding: "4px 8px" }}
                      >
                        <i className="fas fa-trash" />
                      </button>
                      <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`} style={{ color: "#aaa", fontSize: 12, alignSelf: "center" }} />
                    </div>
                  </div>

                  {/* Expanded editor */}
                  {isOpen && (
                    <div style={{ padding: "20px 24px", borderTop: "1px solid #f0f2f7" }}>
                      <div className="row g-3" style={{ marginBottom: 16 }}>
                        <div className="col-md-5">
                          <Field label="Section Title">
                            <input
                              style={INPUT}
                              value={section.title}
                              onChange={(e) => updateSection(section.id, { title: e.target.value })}
                              placeholder="e.g. Flash Sale, Featured Products…"
                            />
                          </Field>
                        </div>
                        <div className="col-md-4">
                          <Field label="Section Type">
                            <select
                              style={{ ...INPUT }}
                              value={section.type}
                              onChange={(e) => updateSection(section.id, { type: e.target.value as CustomSectionType })}
                            >
                              <option value="flash-sale">⚡ Flash Sale</option>
                              <option value="featured">⭐ Featured Products</option>
                              <option value="custom">🗂 Custom</option>
                            </select>
                          </Field>
                        </div>
                        <div className="col-md-3">
                          <Field label="Visibility">
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 6 }}>
                              <input
                                type="checkbox"
                                checked={section.enabled}
                                onChange={(e) => updateSection(section.id, { enabled: e.target.checked })}
                                style={{ width: 16, height: 16 }}
                              />
                              <span style={{ fontSize: "0.875rem" }}>Visible on homepage</span>
                            </label>
                          </Field>
                        </div>
                      </div>

                      <Field
                        label={`Products in this section (${section.productIds.length} selected)`}
                        hint="Search and select products to show in this section. They will appear in a slider on the homepage."
                      >
                        <ProductPicker
                          selected={section.productIds}
                          onChange={(ids) => updateSection(section.id, { productIds: ids })}
                        />
                        <SelectedChips
                          ids={section.productIds}
                          onRemove={(id) => updateSection(section.id, { productIds: section.productIds.filter((x) => x !== id) })}
                        />
                      </Field>
                    </div>
                  )}
                </div>
              );
            })}
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
