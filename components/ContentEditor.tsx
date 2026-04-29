"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteConfigData } from "@/lib/siteConfig";

export default function ContentEditor({ initialConfig }: { initialConfig: SiteConfigData }) {
  const router = useRouter();
  const [config, setConfig] = useState<SiteConfigData>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("banner");

  function update<K extends keyof SiteConfigData>(section: K, key: keyof SiteConfigData[K], value: unknown) {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/site-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  const tabs = [
    { id: "banner", label: "Announcement Banner", icon: "fa-bullhorn" },
    { id: "hero", label: "Hero / Slider", icon: "fa-image" },
    { id: "header", label: "Header", icon: "fa-heading" },
    { id: "homepage", label: "Homepage Sections", icon: "fa-home" },
    { id: "footer", label: "Footer", icon: "fa-shoe-prints" },
  ];

  return (
    <div className="row g-4">
      {/* Tab nav */}
      <div className="col-lg-3">
        <div className="card border-0 shadow-sm">
          <div className="list-group list-group-flush rounded">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`list-group-item list-group-item-action d-flex align-items-center gap-2 border-0 ${activeTab === t.id ? "active" : ""}`}
                style={activeTab === t.id ? { background: "var(--primary)", color: "#fff", border: "none" } : {}}
              >
                <i className={`fas ${t.icon}`} style={{ width: 18 }} />
                <span style={{ fontSize: "0.9rem" }}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-electro w-100 mt-3 py-2"
          onClick={save}
          disabled={saving}
        >
          {saving ? (
            <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
          ) : saved ? (
            <><i className="fas fa-check me-2" />Saved!</>
          ) : (
            <><i className="fas fa-save me-2" />Save All Changes</>
          )}
        </button>
        {saved && (
          <p className="text-success text-center mt-2 mb-0" style={{ fontSize: "0.85rem" }}>
            <i className="fas fa-check-circle me-1" />Changes are live on the site.
          </p>
        )}
      </div>

      {/* Editor panels */}
      <div className="col-lg-9">

        {/* BANNER */}
        {activeTab === "banner" && (
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-4"><i className="fas fa-bullhorn me-2 text-danger" />Announcement Banner</h5>
            <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
              A slim banner shown at the very top of every page. Great for promotions or announcements.
            </p>

            <div className="mb-3 d-flex align-items-center gap-3">
              <label className="form-label fw-semibold mb-0">Enable Banner</label>
              <div className="form-check form-switch ms-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  role="switch"
                  checked={config.banner.enabled}
                  onChange={(e) => update("banner", "enabled", e.target.checked)}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Banner Text</label>
              <input
                className="form-control"
                value={config.banner.text}
                onChange={(e) => update("banner", "text", e.target.value)}
                placeholder="e.g. 🎉 Free shipping on orders over $50!"
              />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Background Color</label>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={config.banner.bgColor}
                    onChange={(e) => update("banner", "bgColor", e.target.value)}
                  />
                  <input
                    className="form-control"
                    value={config.banner.bgColor}
                    onChange={(e) => update("banner", "bgColor", e.target.value)}
                    placeholder="#d10024"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Text Color</label>
                <div className="d-flex gap-2 align-items-center">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={config.banner.textColor}
                    onChange={(e) => update("banner", "textColor", e.target.value)}
                  />
                  <input
                    className="form-control"
                    value={config.banner.textColor}
                    onChange={(e) => update("banner", "textColor", e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Banner Link (optional)</label>
              <input
                className="form-control"
                value={config.banner.link}
                onChange={(e) => update("banner", "link", e.target.value)}
                placeholder="/store"
              />
            </div>

            {config.banner.enabled && (
              <div
                className="mt-3 p-2 text-center rounded"
                style={{ background: config.banner.bgColor, color: config.banner.textColor, fontSize: "0.85rem" }}
              >
                <strong>Preview:</strong> {config.banner.text}
              </div>
            )}
          </div>
        )}

        {/* HERO */}
        {activeTab === "hero" && (
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-4"><i className="fas fa-image me-2 text-danger" />Hero / Slider Section</h5>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Badge Text</label>
                <input
                  className="form-control"
                  value={config.hero.badge}
                  onChange={(e) => update("hero", "badge", e.target.value)}
                  placeholder="New Arrivals"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Background Color</label>
                <div className="d-flex gap-2">
                  <input
                    type="color"
                    className="form-control form-control-color"
                    value={config.hero.bgColor}
                    onChange={(e) => update("hero", "bgColor", e.target.value)}
                  />
                  <input
                    className="form-control"
                    value={config.hero.bgColor}
                    onChange={(e) => update("hero", "bgColor", e.target.value)}
                  />
                </div>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Hero Title</label>
                <input
                  className="form-control"
                  value={config.hero.title}
                  onChange={(e) => update("hero", "title", e.target.value)}
                  placeholder="Latest Electronics at Best Prices"
                />
                <small className="text-muted">Use \n for a line break</small>
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Hero Subtitle</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={config.hero.subtitle}
                  onChange={(e) => update("hero", "subtitle", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Primary Button Text</label>
                <input
                  className="form-control"
                  value={config.hero.primaryBtnText}
                  onChange={(e) => update("hero", "primaryBtnText", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Primary Button Link</label>
                <input
                  className="form-control"
                  value={config.hero.primaryBtnLink}
                  onChange={(e) => update("hero", "primaryBtnLink", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Secondary Button Text</label>
                <input
                  className="form-control"
                  value={config.hero.secondaryBtnText}
                  onChange={(e) => update("hero", "secondaryBtnText", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Secondary Button Link</label>
                <input
                  className="form-control"
                  value={config.hero.secondaryBtnLink}
                  onChange={(e) => update("hero", "secondaryBtnLink", e.target.value)}
                />
              </div>
            </div>

            {/* Mini preview */}
            <div
              className="mt-4 p-4 rounded"
              style={{ background: config.hero.bgColor, color: "#fff" }}
            >
              <small className="text-warning fw-semibold">{config.hero.badge}</small>
              <h4 className="fw-bold mt-1 mb-2" style={{ whiteSpace: "pre-line" }}>{config.hero.title}</h4>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem" }}>{config.hero.subtitle}</p>
              <div className="d-flex gap-2 mt-3">
                <span className="badge px-3 py-2" style={{ background: "var(--primary)" }}>{config.hero.primaryBtnText}</span>
                <span className="badge px-3 py-2 border" style={{ background: "transparent" }}>{config.hero.secondaryBtnText}</span>
              </div>
            </div>
          </div>
        )}

        {/* HEADER */}
        {activeTab === "header" && (
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-4"><i className="fas fa-heading me-2 text-danger" />Header Settings</h5>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Logo / Brand Name</label>
                <input
                  className="form-control"
                  value={config.header.logo}
                  onChange={(e) => update("header", "logo", e.target.value)}
                  placeholder="Electro"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Phone Number (top bar)</label>
                <input
                  className="form-control"
                  value={config.header.phone}
                  onChange={(e) => update("header", "phone", e.target.value)}
                  placeholder="+1 (800) ELECTRO"
                />
              </div>
              <div className="col-12 d-flex align-items-center gap-3">
                <label className="form-label fw-semibold mb-0">Show Search Bar</label>
                <div className="form-check form-switch ms-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    role="switch"
                    checked={config.header.showSearch}
                    onChange={(e) => update("header", "showSearch", e.target.checked)}
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Navigation Links</label>
              <small className="text-muted d-block mb-2">Edit label and URL for each nav link.</small>
              {config.header.navLinks.map((link, i) => (
                <div key={i} className="d-flex gap-2 mb-2 align-items-center">
                  <input
                    className="form-control"
                    value={link.label}
                    placeholder="Label"
                    onChange={(e) => {
                      const updated = config.header.navLinks.map((l, j) =>
                        j === i ? { ...l, label: e.target.value } : l
                      );
                      update("header", "navLinks", updated);
                    }}
                  />
                  <input
                    className="form-control"
                    value={link.href}
                    placeholder="/path"
                    onChange={(e) => {
                      const updated = config.header.navLinks.map((l, j) =>
                        j === i ? { ...l, href: e.target.value } : l
                      );
                      update("header", "navLinks", updated);
                    }}
                  />
                  <button
                    className="btn btn-sm btn-outline-danger px-2"
                    onClick={() => {
                      update("header", "navLinks", config.header.navLinks.filter((_, j) => j !== i));
                    }}
                  >
                    <i className="fas fa-times" />
                  </button>
                </div>
              ))}
              <button
                className="btn btn-sm btn-outline-secondary mt-1"
                onClick={() => update("header", "navLinks", [...config.header.navLinks, { label: "New Link", href: "/" }])}
              >
                <i className="fas fa-plus me-1" /> Add Nav Link
              </button>
            </div>
          </div>
        )}

        {/* HOMEPAGE SECTIONS */}
        {activeTab === "homepage" && (
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-4"><i className="fas fa-home me-2 text-danger" />Homepage Sections</h5>

            {/* Categories */}
            <div className="p-3 rounded mb-3" style={{ background: "#f8f9fa" }}>
              <div className="d-flex justify-content-between align-items-center">
                <label className="fw-semibold">Category Cards Section</label>
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    role="switch"
                    checked={config.homepage.showCategories}
                    onChange={(e) => update("homepage", "showCategories", e.target.checked)}
                  />
                </div>
              </div>
            </div>

            {/* New Arrivals */}
            <div className="p-3 rounded mb-3" style={{ background: "#f8f9fa" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="fw-semibold">New Arrivals Section</label>
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    role="switch"
                    checked={config.homepage.showNewArrivals}
                    onChange={(e) => update("homepage", "showNewArrivals", e.target.checked)}
                  />
                </div>
              </div>
              {config.homepage.showNewArrivals && (
                <div>
                  <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Section Title</label>
                  <input
                    className="form-control form-control-sm"
                    value={config.homepage.newArrivalsTitle}
                    onChange={(e) => update("homepage", "newArrivalsTitle", e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Hot Deals */}
            <div className="p-3 rounded mb-3" style={{ background: "#f8f9fa" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="fw-semibold">Hot Deals Section</label>
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    role="switch"
                    checked={config.homepage.showHotDeals}
                    onChange={(e) => update("homepage", "showHotDeals", e.target.checked)}
                  />
                </div>
              </div>
              {config.homepage.showHotDeals && (
                <div>
                  <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Section Title</label>
                  <input
                    className="form-control form-control-sm"
                    value={config.homepage.hotDealsTitle}
                    onChange={(e) => update("homepage", "hotDealsTitle", e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Newsletter */}
            <div className="p-3 rounded mb-3" style={{ background: "#f8f9fa" }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="fw-semibold">Newsletter Section</label>
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    role="switch"
                    checked={config.homepage.showNewsletter}
                    onChange={(e) => update("homepage", "showNewsletter", e.target.checked)}
                  />
                </div>
              </div>
              {config.homepage.showNewsletter && (
                <div className="row g-2">
                  <div className="col-12">
                    <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Title</label>
                    <input
                      className="form-control form-control-sm"
                      value={config.homepage.newsletterTitle}
                      onChange={(e) => update("homepage", "newsletterTitle", e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold" style={{ fontSize: "0.85rem" }}>Subtitle</label>
                    <input
                      className="form-control form-control-sm"
                      value={config.homepage.newsletterSubtitle}
                      onChange={(e) => update("homepage", "newsletterSubtitle", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER */}
        {activeTab === "footer" && (
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-4"><i className="fas fa-shoe-prints me-2 text-danger" />Footer Settings</h5>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">About Text</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={config.footer.about}
                  onChange={(e) => update("footer", "about", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Support Email</label>
                <input
                  className="form-control"
                  type="email"
                  value={config.footer.email}
                  onChange={(e) => update("footer", "email", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Phone</label>
                <input
                  className="form-control"
                  value={config.footer.phone}
                  onChange={(e) => update("footer", "phone", e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Address</label>
                <input
                  className="form-control"
                  value={config.footer.address}
                  onChange={(e) => update("footer", "address", e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Copyright Text</label>
                <input
                  className="form-control"
                  value={config.footer.copyright}
                  onChange={(e) => update("footer", "copyright", e.target.value)}
                  placeholder="Electro Store. All rights reserved."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
