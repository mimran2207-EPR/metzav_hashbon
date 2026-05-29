import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from './icons.jsx';
import { space, font, weight } from './tokens.js';

// useMediaQuery — SSR-safe responsive hook. Lets components react to viewport
// breakpoints without hand-rolling resize listeners or relying on CSS classes
// (which inline styles can't easily target).
function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function PillButton({ children, variant = "primary", size = "md", chevron = false, icon, onClick, style, title }) {
  const [hover, setHover] = useState(false);
  const pads = { sm: "7px 16px", md: "10px 22px", lg: "12px 28px" };
  const fss = { sm: font.sm, md: font.base, lg: font.lg };
  const variants = {
    primary:   { background: "linear-gradient(135deg,var(--teal-500),var(--teal-700))", color: "#fff", border: "1.5px solid transparent",
                 boxShadow: hover ? "0 8px 20px rgba(42,167,184,.45)" : "0 4px 12px rgba(42,167,184,.32)" },
    secondary: { background: hover ? "var(--teal-50)" : "transparent", color: "var(--teal-600)", border: "1.5px solid var(--teal-500)" },
    ghost:     { background: hover ? "var(--ink-100)" : "transparent", color: "var(--ink-700)", border: "1.5px solid transparent" },
    light:     { background: hover ? "#fff" : "rgba(255,255,255,.14)", color: "#fff", border: "1.5px solid rgba(255,255,255,.5)" },
    danger:    { background: hover ? "#d23f3f" : "var(--red)", color: "#fff", border: "1.5px solid transparent" },
  };
  return (
    <button data-focusring title={title} onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: space[2],
        fontFamily: "var(--font)", fontWeight: weight.semibold, fontSize: fss[size], padding: pads[size],
        borderRadius: 999, cursor: "pointer", transition: "transform .15s ease, box-shadow .15s ease, background .15s ease", whiteSpace: "nowrap",
        transform: hover ? "translateY(-1px)" : "none",
        ...variants[variant], ...style }}>
      {chevron && <span style={{ fontSize: font.xl, lineHeight: 1, marginInlineEnd: -2 }}>‹</span>}
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} color="currentColor" stroke={1.9}/>}
      {children}
    </button>
  );
}

function Card({ children, pad = space[5.5], style, hover, onClick, accent }) {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => hover && setH(true)} onMouseLeave={() => hover && setH(false)}
      style={{ background: "var(--white)", border: "1px solid var(--ink-200)", borderRadius: 16,
        boxShadow: h ? "var(--shadow-md)" : "var(--shadow-card)", padding: pad,
        transform: h ? "translateY(-2px)" : "none", transition: "all .16s ease",
        cursor: onClick ? "pointer" : "default", position: "relative", overflow: "hidden",
        ...(accent ? { borderTop: `3px solid ${accent}` } : null), ...style }}>
      {children}
    </div>
  );
}

function Chip({ children, tone = "teal", style }) {
  const tones = {
    teal:  { bg: "var(--teal-50)",  fg: "var(--teal-700)" },
    gray:  { bg: "var(--ink-100)",  fg: "var(--ink-600)" },
    green: { bg: "#E7F6EE",         fg: "#1f8a52" },
    amber: { bg: "#FDF3DE",         fg: "#9a6a10" },
    red:   { bg: "#FBE9E9",         fg: "#b23636" },
    blue:  { bg: "#E9F0FD",         fg: "#2456c0" },
  }[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: tones.bg, color: tones.fg,
      fontSize: font.xs, fontWeight: weight.semibold, padding: "3px 10px", borderRadius: 999, lineHeight: 1.4, whiteSpace: "nowrap", ...style }}>
      {children}
    </span>
  );
}

function SectionHead({ title, sub, icon, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: space[3], marginBottom: space[3.5] }}>
      <div style={{ display: "flex", alignItems: "center", gap: space[2.5] }}>
        {icon && <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))",
          display: "grid", placeItems: "center", boxShadow: "0 3px 8px rgba(42,167,184,.32)" }}>
          <Icon name={icon} size={17} color="#fff"/></div>}
        <div>
          <div style={{ fontSize: font.xl, fontWeight: weight.bold, color: "var(--teal-700)", lineHeight: 1.2 }}>{title}</div>
          {sub && <div style={{ fontSize: font.xs, color: "var(--ink-500)", marginTop: space[0.5] }}>{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

function Tip({ label, children, side = "bottom" }) {
  const [show, setShow] = useState(false);
  const pos = side === "bottom"
    ? { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" }
    : { bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" };
  return (
    <span style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <span style={{ position: "absolute", ...pos, background: "var(--ink-900)", color: "#fff",
          fontSize: font.xs, fontWeight: weight.medium, padding: "5px 9px", borderRadius: 7, whiteSpace: "nowrap",
          zIndex: 200, pointerEvents: "none", boxShadow: "var(--shadow-md)", animation: "muFade .12s ease" }}>
          {label}
        </span>
      )}
    </span>
  );
}

function Segmented({ options, value, onChange, size = "md" }) {
  return (
    <div style={{ display: "inline-flex", background: "var(--ink-100)", borderRadius: 999, padding: 3, gap: space[0.5] }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <button key={o.value} data-focusring onClick={() => onChange(o.value)}
            style={{ border: "none", cursor: "pointer", borderRadius: 999, fontFamily: "var(--font)",
              fontSize: size === "sm" ? font.sm : font.base, fontWeight: weight.semibold, padding: size === "sm" ? "5px 14px" : "7px 18px",
              background: active ? "var(--white)" : "transparent", color: active ? "var(--teal-600)" : "var(--ink-600)",
              boxShadow: active ? "var(--shadow-card)" : "none", transition: "all .15s ease" }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    window.muToast = (text, icon = "check") => {
      const id = Math.random().toString(36).slice(2);
      setItems(x => [...x, { id, text, icon }]);
      setTimeout(() => setItems(x => x.filter(i => i.id !== id)), 3200);
    };
  }, []);
  return (
    <div style={{ position: "fixed", bottom: space[6], left: space[6], zIndex: 9000, display: "flex", flexDirection: "column", gap: space[2.5] }}>
      {items.map(i => (
        <div key={i.id} className="mu-rise" style={{ display: "flex", alignItems: "center", gap: space[2.5],
          background: "var(--ink-900)", color: "#fff", padding: "11px 16px", borderRadius: 12,
          boxShadow: "var(--shadow-lg)", fontSize: font.base, fontWeight: weight.medium, maxWidth: 380 }}>
          <div style={{ width: 22, height: 22, borderRadius: 999, background: "var(--teal-500)", display: "grid", placeItems: "center", flex: "none" }}>
            <Icon name={i.icon} size={14} color="#fff" stroke={2.4}/>
          </div>
          {i.text}
        </div>
      ))}
    </div>
  );
}

function Sheet({ open, onClose, title, sub, width = 420, children, footer, side = "start" }) {
  const panelRef = useRef(null);
  // a11y: close on Escape, move focus into the sheet on open, restore it on close.
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const id = requestAnimationFrame(() => panelRef.current && panelRef.current.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(id);
      if (prevFocus && typeof prevFocus.focus === "function") prevFocus.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  const edge = side === "start" ? { insetInlineStart: 0 } : { insetInlineEnd: 0 };
  const anim = side === "start" ? "muSlideL" : "muSlideR";
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,38,50,.32)", zIndex: 5000, animation: "muFade .15s ease" }}>
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 0, bottom: 0, ...edge, width, maxWidth: "92vw",
        background: "var(--white)", boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", outline: "none",
        animation: `${anim} .26s cubic-bezier(.22,1,.36,1)` }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: space[3],
          padding: "20px 22px 16px", borderBottom: "1px solid var(--ink-200)" }}>
          <div>
            <div style={{ fontSize: font['2xl'], fontWeight: weight.bold, color: "var(--teal-700)" }}>{title}</div>
            {sub && <div style={{ fontSize: font.sm, color: "var(--ink-500)", marginTop: 3 }}>{sub}</div>}
          </div>
          <button data-focusring onClick={onClose} style={{ border: "none", background: "var(--ink-100)", width: 34, height: 34,
            borderRadius: 9, cursor: "pointer", display: "grid", placeItems: "center", flex: "none" }}>
            <Icon name="close" size={18} color="var(--ink-600)"/>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>{children}</div>
        {footer && <div style={{ borderTop: "1px solid var(--ink-200)", padding: "14px 22px" }}>{footer}</div>}
      </div>
    </div>
  );
}

export { PillButton, Card, Chip, SectionHead, Tip, Segmented, ToastHost, Sheet, useMediaQuery };
