import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from './icons.jsx';
import { space } from './tokens.js';
import s from './ui.module.css';

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

// PillButton — migrated to CSS Modules: hover / active / focus / disabled are
// pure CSS pseudo-classes (no JS hover state, no per-render style objects).
// `style` is still accepted for one-off layout overrides (e.g. width: "100%").
function PillButton({ children, variant = "primary", size = "md", chevron = false, icon, onClick, style, title, loading = false, disabled = false }) {
  const off = disabled || loading;
  const className = [s.btn, s[size], s[variant]].filter(Boolean).join(" ");
  return (
    <button data-focusring title={title} disabled={off} aria-busy={loading || undefined}
      onClick={off ? undefined : onClick} className={className} style={style}>
      {loading
        ? <span aria-hidden="true" className={s.spinner}/>
        : <>
            {chevron && <span className={s.chev}>‹</span>}
            {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} color="currentColor" stroke={1.9}/>}
          </>}
      {children}
    </button>
  );
}

function Card({ children, pad = space[5.5], style, hover, onClick, accent }) {
  const className = [s.card, hover ? s.cardHoverable : null].filter(Boolean).join(" ");
  return (
    <div onClick={onClick} className={className}
      style={{ padding: pad, cursor: onClick ? "pointer" : "default",
        ...(accent ? { borderTop: `3px solid ${accent}` } : null), ...style }}>
      {children}
    </div>
  );
}

function Chip({ children, tone = "teal", style }) {
  const toneClass = { teal: s.chipTeal, gray: s.chipGray, green: s.chipGreen, amber: s.chipAmber, red: s.chipRed, blue: s.chipBlue };
  return (
    <span className={[s.chip, toneClass[tone] || s.chipTeal].join(" ")} style={style}>
      {children}
    </span>
  );
}

function SectionHead({ title, sub, icon, right }) {
  return (
    <div className={s.sectionHead}>
      <div className={s.sectionHeadLeft}>
        {icon && <div className={s.sectionIcon}><Icon name={icon} size={17} color="#fff"/></div>}
        <div>
          <div className={s.sectionTitle}>{title}</div>
          {sub && <div className={s.sectionSub}>{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

// Tip — CSS-only tooltip. Appears on hover AND keyboard focus (:focus-within),
// so it no longer needs JS show/hide state.
function Tip({ label, children, side = "bottom" }) {
  return (
    <span className={s.tipWrap}>
      {children}
      <span role="tooltip" className={[s.tip, side === "bottom" ? s.tipBottom : s.tipTop].join(" ")}>
        {label}
      </span>
    </span>
  );
}

function Segmented({ options, value, onChange, size = "md" }) {
  const sizeClass = size === "sm" ? s.segSm : s.segMd;
  return (
    <div className={s.segmented}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <button key={o.value} data-focusring onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={[s.segBtn, sizeClass, active ? s.segActive : null].filter(Boolean).join(" ")}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ToastHost() {
  const [items, setItems] = useState([]);
  const remove = (id) => setItems(x => x.filter(i => i.id !== id));
  useEffect(() => {
    // window.muToast(text, icon?, tone?) — tone: default | success | error | warn
    window.muToast = (text, icon = "check", tone = "default") => {
      const id = Math.random().toString(36).slice(2);
      setItems(x => [...x, { id, text, icon, tone }]);
      setTimeout(() => remove(id), 4000);
    };
  }, []);
  const dot = { default: "var(--teal-500)", success: "var(--green)", error: "var(--red)", warn: "var(--amber)" };
  return (
    <div role="status" aria-live="polite" className={s.toastHost}>
      {items.map(i => (
        <div key={i.id} className={`${s.toast} mu-rise`}>
          <div className={s.toastDot} style={{ background: dot[i.tone] || dot.default }}>
            <Icon name={i.icon} size={14} color="#fff" stroke={2.4}/>
          </div>
          <span className={s.toastText}>{i.text}</span>
          <button data-focusring aria-label="סגירה" className={s.toastClose} onClick={() => remove(i.id)}>
            <Icon name="close" size={15} color="currentColor"/>
          </button>
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
  const sideClass = side === "start" ? s.panelStart : s.panelEnd;
  return (
    <div onClick={onClose} className={s.overlay}>
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        onClick={e => e.stopPropagation()} className={[s.panel, sideClass].join(" ")} style={{ width }}>
        <div className={s.sheetHeader}>
          <div>
            <div className={s.sheetTitle}>{title}</div>
            {sub && <div className={s.sheetSub}>{sub}</div>}
          </div>
          <button data-focusring aria-label="סגירה" className={s.sheetClose} onClick={onClose}>
            <Icon name="close" size={18} color="var(--ink-600)"/>
          </button>
        </div>
        <div className={s.sheetBody}>{children}</div>
        {footer && <div className={s.sheetFooter}>{footer}</div>}
      </div>
    </div>
  );
}

export { PillButton, Card, Chip, SectionHead, Tip, Segmented, ToastHost, Sheet, useMediaQuery };
