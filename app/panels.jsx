import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { SectionHead, Card } from './ui.jsx';
import s from './ui.module.css';

function LeftColumn({ insights, actions, onCopilot, onAction, mode = "balanced" }) {
  const showInsights = mode !== "subtle";
  const showHistory = mode !== "subtle";
  const bold = mode === "bold";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ borderRadius: 16, padding: 18, color: "#fff", position: "relative", overflow: "hidden",
        background: "linear-gradient(140deg,var(--teal-600),var(--teal-800))", boxShadow: "var(--shadow-md)" }}>
        <div style={{ position: "absolute", insetInlineStart: -30, top: -30, width: 120, height: 120, borderRadius: 999, background: "rgba(255,255,255,.07)" }}/>
        <div style={{ display: "flex", alignItems: "center", gap: 9, position: "relative" }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,.18)", display: "grid", placeItems: "center" }}>
            <Icon name="sparkle" size={18} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>AI Copilot</div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.75)" }}>עוזר הגבייה החכם</div>
          </div>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,.9)", margin: "12px 0 14px", position: "relative" }}>
          נתח את החוב, הצע הסדר תשלומים או נסח מכתב — בשפה טבעית, עם מקורות.
        </p>
        <button data-focusring onClick={onCopilot} style={{ width: "100%", border: "none", cursor: "pointer", borderRadius: 999,
          padding: "10px", background: "#fff", color: "var(--teal-700)", fontFamily: "var(--font)", fontWeight: 700, fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7, position: "relative" }}>
          <Icon name="sparkle" size={16} color="var(--teal-700)"/> פתח שיחה
        </button>
      </div>

      {showInsights && (
      <Card pad={18} style={bold ? { borderColor: "var(--teal-200)", boxShadow: "var(--shadow-md)" } : null}>
        <SectionHead title="תובנות והסברים" sub="כל המלצה מלווה במקור" icon="info"/>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {insights.map(ins => {
            const c = { warn: "var(--amber)", good: "var(--green)", crit: "var(--red)" }[ins.tone];
            const bg = { warn: "#FDF3DE", good: "#E7F6EE", crit: "#FBE9E9" }[ins.tone];
            return (
              <div key={ins.id} style={{ borderInlineStart: `3px solid ${c}`, background: "var(--ink-50)", borderRadius: "0 11px 11px 0", padding: "11px 13px" }}>
                <div style={{ display: "flex", gap: 9 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: bg, display: "grid", placeItems: "center", flex: "none" }}>
                    <Icon name={ins.icon} size={15} color={c}/>
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-800)" }}>{ins.text}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 8, marginInlineStart: 35, fontSize: 11, color: "var(--ink-500)" }}>
                  <Icon name="citation" size={12} color="var(--ink-400)"/>
                  <span>מקור: {ins.source}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      )}

      <Card pad={18}>
        <SectionHead title="פעולות מהירות" icon="sparkle"/>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {actions.map(a => (
            <button key={a.id} data-focusring onClick={() => onAction(a)} className={`${s.listRow} ${s.listRowTeal}`} style={{ padding: "10px 12px" }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--teal-50)", display: "grid", placeItems: "center", flex: "none" }}>
                <Icon name={a.icon} size={17} color="var(--teal-600)"/>
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-800)" }}>{a.label}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}>{a.hint}</div>
              </div>
              <Icon name="chevleft" size={16} color="var(--ink-300)"/>
            </button>
          ))}
        </div>
      </Card>

      {showHistory && (
      <Card pad={18}>
        <SectionHead title="משלמים היסטוריים" icon="history"/>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {[{ n: "לדוגמה ישראל (קודם)", no: "888-DEMO-1", y: "2008–2014" }, { n: "לדוגמה רחל", no: "888-DEMO-2", y: "2014–2019" }].map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
              <div style={{ width: 28, height: 28, borderRadius: 999, background: "var(--ink-100)", color: "var(--ink-500)", display: "grid", placeItems: "center", flex: "none" }}>
                <Icon name="user" size={15} color="var(--ink-500)"/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "var(--ink-800)" }}>{h.n}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-500)" }}><span className="num">{h.no}</span> · {h.y}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      )}
    </div>
  );
}

function CommandBar({ open, onClose, onRun }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inputRef.current && inputRef.current.focus(), 30); } }, [open]);

  const all = [
    { group: "פעולות", id: "pay", icon: "card", label: "מעבר לתשלום", hint: "גביית תשלום / קבלה" },
    { group: "פעולות", id: "letter", icon: "send", label: "נסח מכתב התראה", hint: "AI · טיוטה אוטומטית" },
    { group: "פעולות", id: "arrangement", icon: "wallet", label: "פתח הסדר תשלומים", hint: "פריסה לתשלומים" },
    { group: "פעולות", id: "calc", icon: "calc", label: "מחשבון ריבית והצמדה", hint: "חישוב עד תאריך" },
    { group: "פעולות", id: "print", icon: "print", label: "הדפס מצב חשבון", hint: "PDF" },
    { group: "מסכים", id: "enforce", icon: "shield", label: "מסך אכיפה", hint: "התראות וסנקציות" },
    { group: "מסכים", id: "notes", icon: "notes", label: "הערות המשלם", hint: "25 הערות" },
    { group: "מסכים", id: "docs", icon: "docs", label: "מסמכים מקושרים", hint: "4 מסמכים" },
    { group: "משלמים", id: "p1", icon: "user", label: "ישראל לדוגמה", hint: "משלם 999-DEMO · פעיל" },
    { group: "משלמים", id: "p2", icon: "user", label: "כהן דוד", hint: "משלם 028841200" },
    { group: "משלמים", id: "p3", icon: "building", label: "פיזי 5002205", hint: "נכס · רחוב הדוגמה 1" },
    { group: "היסטוריה", id: "h1", icon: "clock", label: "מצב חשבון · ישראל לדוגמה", hint: "נצפה לאחרונה" },
  ];
  const filtered = q ? all.filter(it => (it.label + it.hint).includes(q)) : all;
  const groups = [...new Set(filtered.map(f => f.group))];
  const flat = filtered;

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(s + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); flat[sel] && onRun(flat[sel]); }
    else if (e.key === "Escape") { onClose(); }
  };
  if (!open) return null;
  let idx = -1;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,38,50,.4)", zIndex: 6000,
      display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "11vh", animation: "muFade .14s ease" }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="חיפוש ופקודות" className="mu-rise" style={{ width: 620, maxWidth: "92vw", background: "#fff",
        borderRadius: 16, boxShadow: "var(--shadow-lg)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderBottom: "1px solid var(--ink-200)" }}>
          <Icon name="search" size={20} color="var(--teal-500)"/>
          <input ref={inputRef} value={q} onChange={e => { setQ(e.target.value); setSel(0); }} onKeyDown={onKey}
            placeholder="חפש משלם, פיזי, פעולה או מסך…" style={{ flex: 1, border: "none", outline: "none", fontFamily: "var(--font)",
            fontSize: 16, color: "var(--ink-900)", background: "transparent" }}/>
          <kbd style={{ fontFamily: "var(--font)", fontSize: 11.5, fontWeight: 600, color: "var(--ink-500)", background: "var(--ink-50)",
            border: "1px solid var(--ink-300)", borderRadius: 6, padding: "2px 7px" }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto", padding: "8px 0" }}>
          {flat.length === 0 && <div style={{ padding: "32px", textAlign: "center", color: "var(--ink-400)" }}>לא נמצאו תוצאות</div>}
          {groups.map(g => (
            <div key={g}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-400)", padding: "8px 18px 4px" }}>{g}</div>
              {filtered.filter(f => f.group === g).map(it => {
                idx++; const active = idx === sel; const myIdx = idx;
                return (
                  <button key={it.id} onMouseEnter={() => setSel(myIdx)} onClick={() => onRun(it)}
                    style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "start", border: "none",
                      cursor: "pointer", padding: "9px 18px", background: active ? "var(--teal-50)" : "transparent", fontFamily: "var(--font)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: active ? "var(--teal-500)" : "var(--ink-100)",
                      display: "grid", placeItems: "center", flex: "none" }}>
                      <Icon name={it.icon} size={17} color={active ? "#fff" : "var(--ink-600)"}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-800)" }}>{it.label}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{it.hint}</div>
                    </div>
                    {active && <Icon name="enter" size={16} color="var(--teal-500)"/>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "9px 18px", borderTop: "1px solid var(--ink-100)",
          background: "var(--ink-50)", fontSize: 11.5, color: "var(--ink-500)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><kbd style={kbdStyle}>↑</kbd><kbd style={kbdStyle}>↓</kbd> ניווט</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><kbd style={kbdStyle}>↵</kbd> בחירה</span>
          <div style={{ flex: 1 }}/>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Icon name="sparkle" size={13} color="var(--teal-500)"/> מופעל ע״י AI</span>
        </div>
      </div>
    </div>
  );
}
const kbdStyle = { fontFamily: "var(--font)", fontSize: 11, fontWeight: 600, color: "var(--ink-600)", background: "#fff", border: "1px solid var(--ink-300)", borderRadius: 5, padding: "1px 5px" };

export { LeftColumn, CommandBar };
