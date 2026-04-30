"use client";

import Link from "next/link";
import type { HeroSlide } from "@/lib/siteConfig";
import { useState, useEffect } from "react";

interface Props {
  slides: HeroSlide[];
}

export default function HeroSection({ slides }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[active] ?? slides[0];
  if (!slide) return null;

  const lines = slide.title.split(/\n/);

  return (
    <div
      style={{
        background: slide.image
          ? `linear-gradient(100deg, rgba(15,16,32,0.92) 0%, rgba(15,16,32,0.70) 55%, rgba(15,16,32,0.20) 100%), url(${slide.image}) center/cover no-repeat`
          : "linear-gradient(135deg, #0d0e1c 0%, #1e2030 40%, #2b1a20 70%, #3a0a14 100%)",
        minHeight: 420,
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* decorative circles */}
      <div style={{ position: "absolute", top: -60, right: "18%", width: 300, height: 300, borderRadius: "50%", background: "rgba(209,0,36,0.07)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, right: "8%", width: 200, height: 200, borderRadius: "50%", background: "rgba(209,0,36,0.05)", pointerEvents: "none" }} />

      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <div className="row" style={{ alignItems: "center" }}>

          {/* ── Text column ── */}
          <div className="col-md-7 col-sm-8">
            {/* badge */}
            {slide.badgeText && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(209,0,36,0.18)", border: "1px solid rgba(209,0,36,0.35)", borderRadius: 30, padding: "5px 16px", marginBottom: 18 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#d10024", flexShrink: 0 }} />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#ff6080", textTransform: "uppercase", letterSpacing: "1.5px" }}>{slide.badgeText}</span>
              </div>
            )}

            {/* title */}
            <h1 style={{ color: "#fff", fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
              {lines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < lines.length - 1 && <br />}
                </span>
              ))}
            </h1>

            {/* subtitle */}
            {slide.subtitle && (
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.97rem", lineHeight: 1.65, maxWidth: 460, marginBottom: 28 }}>
                {slide.subtitle}
              </p>
            )}

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <Link
                href={slide.btnLink || "/store"}
                className="primary-btn"
                style={{ borderRadius: 40, padding: "12px 32px", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase" }}
              >
                {slide.btnText || "Shop Now"} &nbsp;<i className="fa fa-arrow-right" />
              </Link>
              <Link
                href="/store"
                style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              >
                Browse all <i className="fa fa-long-arrow-right" />
              </Link>
            </div>
          </div>

          {/* ── Product image column ── */}
          <div className="col-md-5 col-sm-4 hidden-xs" style={{ textAlign: "center" }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div style={{ position: "absolute", inset: -20, borderRadius: "50%", background: "radial-gradient(circle, rgba(209,0,36,0.18) 0%, transparent 70%)", pointerEvents: "none" }} />
              <img
                src="/img/product01.png"
                alt="Featured Product"
                style={{ maxHeight: 300, maxWidth: "100%", objectFit: "contain", filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))", position: "relative", zIndex: 1 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* slide dots (only if multiple slides) */}
      {slides.length > 1 && (
        <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 3 }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: i === active ? 22 : 8, height: 8, borderRadius: 4,
                background: i === active ? "#d10024" : "rgba(255,255,255,0.35)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
