// table-utils.jsx — shared table utilities: sort, drag-to-reorder, column visibility.
// Used by content.jsx (levels 1-3) and wide-txns.jsx.
import React, { useState, useRef, useCallback } from 'react';
import { Icon } from './icons.jsx';

// ── Sort ─────────────────────────────────────────────────────────────────────
export function useColSort() {
  const [col, setCol] = useState(null);
  const [dir, setDir] = useState("asc");
  const toggle = useCallback((key) => {
    setCol(prev => {
      if (prev === key) { setDir(d => d === "asc" ? "desc" : "asc"); return key; }
      setDir("asc"); return key;
    });
  }, []);
  const applySort = useCallback((arr, getVal) => {
    if (!col || !getVal) return arr;
    return [...arr].sort((a, b) => {
      const va = getVal(a, col), vb = getVal(b, col);
      if (va == null) return 1; if (vb == null) return -1;
      const cmp = typeof va === "string" ? va.localeCompare(vb, "he") : (va < vb ? -1 : va > vb ? 1 : 0);
      return dir === "asc" ? cmp : -cmp;
    });
  }, [col, dir]);
  return { sortCol: col, sortDir: dir, toggleSort: toggle, applySort };
}

// ── Drag-to-reorder ───────────────────────────────────────────────────────────
export function useColOrder(count) {
  const [order, setOrder] = useState(() => Array.from({ length: count }, (_, i) => i));
  const dragging = useRef(null);
  const [dragOver, setDragOver] = useState(null);
  const handlers = useCallback((i) => ({
    draggable: true,
    onDragStart: (e) => { dragging.current = i; e.dataTransfer.effectAllowed = "move"; },
    onDragOver:  (e) => { e.preventDefault(); setDragOver(i); },
    onDragLeave: ()  => setDragOver(null),
    onDrop:      (e) => {
      e.preventDefault(); setDragOver(null);
      if (dragging.current === null || dragging.current === i) return;
      setOrder(prev => {
        const next = [...prev];
        const from = next.indexOf(dragging.current);
        const to   = next.indexOf(i);
        next.splice(from, 1); next.splice(to, 0, dragging.current);
        return next;
      });
      dragging.current = null;
    },
  }), []);
  return { order, setOrder, dragOver, handlers };
}

// ── SortTh — sortable + draggable <th> ───────────────────────────────────────
export function SortTh({ colKey, label, align, sortable, sortCol, sortDir, onSort, dragHandlers, isDragOver, style }) {
  const isSorted = sortable && sortCol === colKey;
  return (
    <th onClick={sortable ? () => onSort(colKey) : undefined}
      {...dragHandlers}
      style={{ textAlign: align || "start", padding: "9px 10px", fontSize: 11.5, fontWeight: 700,
        color: "rgba(255,255,255,.95)", whiteSpace: "nowrap", overflow: "hidden",
        cursor: sortable ? "pointer" : "grab",
        background: isDragOver ? "rgba(255,255,255,.22)" : "transparent",
        borderInlineEnd: isDragOver ? "2px solid rgba(255,255,255,.8)" : "2px solid transparent",
        userSelect: "none", transition: "background .12s",
        ...style }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {label}
        {sortable && (
          <span style={{ fontSize: 9, opacity: isSorted ? 1 : 0.35 }}>
            {isSorted ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
          </span>
        )}
        {!sortable && label && <span style={{ fontSize: 9, opacity: 0.3, marginInlineStart: 2 }}>⣿</span>}
      </span>
    </th>
  );
}

// ── ColumnPicker — floating checklist to toggle column visibility ─────────────
export function ColumnPicker({ cols, hidden, onToggle }) {
  const [open, setOpen] = useState(false);
  const hiddenCount = hidden.size;
  return (
    <div style={{ position: "relative" }}>
      <button data-focusring onClick={() => setOpen(o => !o)}
        title="בחירת שדות לתצוגה"
        style={{ display: "inline-flex", alignItems: "center", gap: 5,
          border: "1px solid var(--teal-300)", background: hiddenCount ? "var(--teal-600)" : "var(--teal-50)",
          color: hiddenCount ? "#fff" : "var(--teal-700)",
          borderRadius: 7, padding: "5px 10px", cursor: "pointer",
          fontFamily: "var(--font)", fontSize: 12, fontWeight: 600, transition: "all .13s" }}>
        <Icon name="sigma" size={13} color={hiddenCount ? "#fff" : "var(--teal-600)"}/>
        שדות{hiddenCount ? ` (${cols.length - hiddenCount}/${cols.length})` : ""}
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 8000 }}/>
          <div className="mu-rise" style={{ position: "absolute", top: "calc(100% + 6px)", insetInlineEnd: 0, zIndex: 8001,
            background: "#fff", border: "1px solid var(--ink-200)", borderRadius: 12, boxShadow: "var(--shadow-lg)",
            padding: "10px 0", minWidth: 200, maxHeight: 320, overflowY: "auto" }}>
            <div style={{ padding: "4px 14px 8px", fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", borderBottom: "1px solid var(--ink-100)", marginBottom: 4 }}>
              בחר שדות לתצוגה
            </div>
            {cols.filter(c => c.label).map(c => {
              const isHidden = hidden.has(c.key);
              return (
                <label key={c.key} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 14px", cursor: "pointer",
                  background: isHidden ? "transparent" : "var(--ink-50)", transition: "background .1s" }}>
                  <span style={{ width: 16, height: 16, borderRadius: 4, flex: "none", display: "grid", placeItems: "center",
                    background: isHidden ? "var(--white)" : "var(--teal-500)",
                    border: `1.5px solid ${isHidden ? "var(--ink-300)" : "var(--teal-500)"}` }}>
                    {!isHidden && <Icon name="check" size={10} color="#fff"/>}
                  </span>
                  <input type="checkbox" checked={!isHidden} onChange={() => onToggle(c.key)}
                    style={{ display: "none" }}/>
                  <span style={{ fontSize: 13, color: "var(--ink-800)", fontFamily: "var(--font)" }}>{c.label}</span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── useColVisibility — hidden columns state ───────────────────────────────────
export function useColVisibility(initialHidden = []) {
  const [hidden, setHidden] = useState(new Set(initialHidden));
  const toggle = useCallback((key) => setHidden(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  }), []);
  return { hidden, toggleCol: toggle };
}

// ── COLOR THEMES ─────────────────────────────────────────────────────────────
export const THEMES = [
  { id: "teal",   name: "ים",    dot: "#2AA7B8",
    vars: { "--teal-50":"#E6F5F7","--teal-100":"#CDEBEF","--teal-200":"#9FDBE2","--teal-300":"#70C8D2","--teal-400":"#4AB7C4","--teal-500":"#2AA7B8","--teal-600":"#1D8F9F","--teal-700":"#166F7C","--teal-800":"#0E525C","--teal-900":"#083C44","--wash-hero":"linear-gradient(180deg,#EAF6F8 0%,#F5FBFC 55%,#F7F9FB 100%)" }},
  { id: "blue",   name: "כחול",  dot: "#2563EB",
    vars: { "--teal-50":"#EFF6FF","--teal-100":"#DBEAFE","--teal-200":"#BFDBFE","--teal-300":"#93C5FD","--teal-400":"#60A5FA","--teal-500":"#3B82F6","--teal-600":"#2563EB","--teal-700":"#1D4ED8","--teal-800":"#1E40AF","--teal-900":"#1e3a8a","--wash-hero":"linear-gradient(180deg,#EFF6FF 0%,#F0F7FF 55%,#F7F9FB 100%)" }},
  { id: "purple", name: "סגול",  dot: "#7C3AED",
    vars: { "--teal-50":"#F5F3FF","--teal-100":"#EDE9FE","--teal-200":"#DDD6FE","--teal-300":"#C4B5FD","--teal-400":"#A78BFA","--teal-500":"#8B5CF6","--teal-600":"#7C3AED","--teal-700":"#6D28D9","--teal-800":"#4C1D95","--teal-900":"#3b0764","--wash-hero":"linear-gradient(180deg,#F5F3FF 0%,#F8F6FF 55%,#F7F9FB 100%)" }},
  { id: "green",  name: "ירוק",  dot: "#059669",
    vars: { "--teal-50":"#ECFDF5","--teal-100":"#D1FAE5","--teal-200":"#A7F3D0","--teal-300":"#6EE7B7","--teal-400":"#34D399","--teal-500":"#10B981","--teal-600":"#059669","--teal-700":"#047857","--teal-800":"#065F46","--teal-900":"#064e3b","--wash-hero":"linear-gradient(180deg,#ECFDF5 0%,#F0FDF4 55%,#F7F9FB 100%)" }},
  { id: "rose",   name: "ורוד",  dot: "#E11D48",
    vars: { "--teal-50":"#FFF1F2","--teal-100":"#FFE4E6","--teal-200":"#FECDD3","--teal-300":"#FDA4AF","--teal-400":"#FB7185","--teal-500":"#F43F5E","--teal-600":"#E11D48","--teal-700":"#BE123C","--teal-800":"#9F1239","--teal-900":"#881337","--wash-hero":"linear-gradient(180deg,#FFF1F2 0%,#FFF5F6 55%,#F7F9FB 100%)" }},
];

// ThemePicker — floating color palette button
export function ThemePicker({ activeId, onChange }) {
  const [open, setOpen] = useState(false);
  const active = THEMES.find(t => t.id === activeId) || THEMES[0];
  return (
    <div style={{ position: "relative" }}>
      <button data-focusring onClick={() => setOpen(o => !o)} title="ערכת צבעים"
        style={{ display: "flex", alignItems: "center", gap: 7, border: "1px solid var(--ink-200)",
          background: "var(--white)", borderRadius: 999, padding: "6px 12px 6px 8px",
          cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600, color: "var(--ink-700)" }}>
        <span style={{ width: 18, height: 18, borderRadius: 999, background: active.dot, display: "block", boxShadow: "0 2px 6px rgba(0,0,0,.2)" }}/>
        {active.name}
        <Icon name="chevdown" size={13} color="var(--ink-400)"/>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 9000 }}/>
          <div className="mu-rise" style={{ position: "absolute", insetInlineEnd: 0, top: "calc(100% + 6px)", zIndex: 9001,
            background: "#fff", border: "1px solid var(--ink-200)", borderRadius: 12, boxShadow: "var(--shadow-lg)",
            padding: "10px 12px", display: "flex", flexDirection: "column", gap: 4, minWidth: 160 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)", marginBottom: 4 }}>ערכת צבעים</div>
            {THEMES.map(t => (
              <button key={t.id} onClick={() => { onChange(t.id); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 10, border: "none", cursor: "pointer",
                  borderRadius: 8, padding: "7px 10px", fontFamily: "var(--font)", fontSize: 13,
                  background: t.id === activeId ? "var(--ink-50)" : "transparent",
                  fontWeight: t.id === activeId ? 700 : 500, color: "var(--ink-800)", textAlign: "start",
                  transition: "background .12s" }}>
                <span style={{ width: 20, height: 20, borderRadius: 999, background: t.dot, flex: "none",
                  boxShadow: t.id === activeId ? `0 0 0 3px ${t.dot}44` : "none" }}/>
                {t.name}
                {t.id === activeId && <Icon name="check" size={13} color="var(--ink-600)" style={{ marginInlineStart: "auto" }}/>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
