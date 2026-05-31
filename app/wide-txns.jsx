// wide-txns.jsx — the wide "תנועות למשלם" screen.
//
// A full-screen takeover that recreates the legacy MASTER transactions screen
// in the web language of this app: payer header + quick search, a tab strip,
// a filter/checkbox panel, and a very wide ledger grid (all columns from the
// field dictionary) with per-charge grouping + subtotals and payer totals.
import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { LEDGER, LEDGER_COLUMNS, fmt } from './data.jsx';
import { useColSort, useColOrder, SortTh, ColumnPicker, useColVisibility } from './table-utils.jsx';

const TABS = [
  "הצגת תנועות", "הצגת תשלומים", "נכסים מרוכז", "טיפול בשוברים",
  "ביטול ריבית והצמדה", "תזכורות והיסטוריה", "דו\"ח", "מסמכים", "חוגים",
];
const CHECKS = [
  "ללא יתרת פתיחה", "ללא חלוקה לסוגי חיוב", "פירוט ריבית והצמדה", "הפרדת הנחות",
  "הצג סטורנו ברוטו", "שמור נתוני סינון", "מחזיק", "לפי ילדים",
];

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-500)" }}>{label}</span>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <select value={value} onChange={e => onChange && onChange(e.target.value)} data-focusring
          style={{ appearance: "none", WebkitAppearance: "none", width: "100%", height: 34, padding: "0 10px",
            border: "1px solid var(--ink-300)", borderRadius: 9, background: "var(--white)", cursor: "pointer",
            fontFamily: "var(--font)", fontSize: 13, color: "var(--ink-800)", paddingInlineStart: 26 }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Icon name="chevdown" size={14} color="var(--ink-400)" style={{ position: "absolute", insetInlineStart: 8, pointerEvents: "none" }}/>
      </div>
    </label>
  );
}

function CheckPill({ label, on, onToggle }) {
  return (
    <button data-focusring onClick={onToggle} role="checkbox" aria-checked={on}
      style={{ display: "inline-flex", alignItems: "center", gap: 7, border: `1px solid ${on ? "var(--teal-400)" : "var(--ink-200)"}`,
        background: on ? "var(--teal-50)" : "var(--white)", borderRadius: 999, padding: "5px 11px 5px 8px", cursor: "pointer",
        fontFamily: "var(--font)", fontSize: 12, fontWeight: 600, color: on ? "var(--teal-700)" : "var(--ink-600)", transition: "all .12s ease" }}>
      <span style={{ width: 16, height: 16, borderRadius: 5, flex: "none", display: "grid", placeItems: "center",
        background: on ? "var(--teal-500)" : "var(--white)", border: `1.5px solid ${on ? "var(--teal-500)" : "var(--ink-300)"}` }}>
        {on && <Icon name="check" size={11} color="#fff" stroke={3}/>}
      </span>
      {label}
    </button>
  );
}

function Cell({ col, row }) {
  let v = row[col.key];
  let color = "var(--ink-800)", weight = col.key === "itra" ? 700 : 500;
  if (col.key === "dc") {
    const credit = v === "ז";
    return (
      <td style={{ padding: "8px 12px", textAlign: "center", borderBottom: "1px solid var(--ink-100)" }}>
        <span style={{ display: "inline-block", minWidth: 20, fontSize: 11, fontWeight: 700, color: credit ? "var(--ok-fg)" : "var(--err-fg)",
          background: credit ? "var(--ok-bg)" : "var(--err-bg)", borderRadius: 6, padding: "2px 7px" }}>{v}</span>
      </td>
    );
  }
  if (col.money) {
    if (v == null) v = "—";
    else { v = "₪" + fmt(v); if (col.key === "zchut") color = "var(--ok-fg)"; }
  } else if (v == null || v === "") v = "—";
  return (
    <td className={col.num ? "num" : ""} style={{ padding: "8px 12px", textAlign: col.align,
      borderBottom: "1px solid var(--ink-100)", color, fontWeight: weight, whiteSpace: "nowrap",
      fontSize: 12.5 }}>{v}</td>
  );
}

function WideTxnScreen({ open, onClose, payer, filterNaxas }) {
  const [tab, setTab] = useState(0);
  const [q, setQ] = useState("");
  const [sug, setSug] = useState("all");
  const [naxas, setNaxas] = useState(filterNaxas || "all");
  const [dc, setDc] = useState("all");
  const [sort, setSort] = useState("terech");
  const [checks, setChecks] = useState({ "פירוט ריבית והצמדה": true });
  const toggle = (k) => setChecks(c => ({ ...c, [k]: !c[k] }));

  // Sync naxas filter when opened from a specific פיזי
  useEffect(() => { setNaxas(filterNaxas || "all"); }, [filterNaxas, open]);

  // Sort + drag + column visibility for the ledger table
  const { sortCol: wSortCol, sortDir: wSortDir, toggleSort: wToggleSort, applySort: wApplySort } = useColSort();
  const { order: wColOrder, dragOver: wDragOver, handlers: wDragH } = useColOrder(LEDGER_COLUMNS.length);
  const { hidden: wHidden, toggleCol: wToggleCol } = useColVisibility();
  const orderedLedgerCols = wColOrder.map(i => LEDGER_COLUMNS[i]).filter(c => !wHidden.has(c.key));

  const sugs = useMemo(() => [...new Set(LEDGER.map(r => r.sug))], []);
  const naxasim = useMemo(() => [...new Set(LEDGER.map(r => r.naxas))], []);

  const rows = useMemo(() => {
    let r = LEDGER.filter(x => {
      if (sug !== "all" && x.sug !== sug) return false;
      if (naxas !== "all" && x.naxas !== naxas) return false;
      if (dc !== "all" && x.dc !== dc) return false;
      if (q && !`${x.sug} ${x.peratim} ${x.naxas} ${x.pkuda}`.includes(q)) return false;
      if (checks["ללא יתרת פתיחה"] && x.type === 8) return false;
      return true;
    });
    const toNum = d => { const [a, b, c] = String(d).split("/").map(Number); return c * 1e4 + b * 1e2 + a; };
    if (sort === "terech") r = [...r].sort((a, b) => toNum(a.terech) - toNum(b.terech));
    else if (sort === "itra") r = [...r].sort((a, b) => b.itra - a.itra);
    else if (sort === "sug") r = [...r].sort((a, b) => a.sug.localeCompare(b.sug, "he"));
    return r;
  }, [q, sug, naxas, dc, sort, checks]);

  const totals = useMemo(() => {
    const zchut = rows.reduce((a, r) => a + (r.zchut || 0), 0);
    const chova = rows.reduce((a, r) => a + (r.chova || 0), 0);
    return { zchut, chova, balance: chova - zchut };
  }, [rows]);

  // group by סוג חיוב unless "ללא חלוקה לסוגי חיוב" is on
  const grouped = !checks["ללא חלוקה לסוגי חיוב"];
  const groups = useMemo(() => {
    const src = wSortCol ? rows : rows; // sortedRows applied per-group below
    if (!grouped) return [{ sug: null, rows: src }];
    const map = new Map();
    src.forEach(r => { if (!map.has(r.sug)) map.set(r.sug, []); map.get(r.sug).push(r); });
    return [...map.entries()].map(([sug, rs]) => ({ sug, rows: rs }));
  }, [rows, grouped, wSortCol]);

  // Wide-screen sort value getter
  const wSortVal = (r, key) => {
    if (key === "terech" || key === "tpeula" || key === "tgviya") {
      const d = String(r[key] || "").split("/").map(Number);
      return d.length === 3 ? d[2]*1e4 + d[1]*1e2 + d[0] : 0;
    }
    if (key === "zchut")   return r.zchut || 0;
    if (key === "chova")   return r.chova || 0;
    if (key === "itra")    return r.itra || 0;
    return r[key] || "";
  };
  const sortedRows = wApplySort(rows, (r, key) => wSortVal(r, key));

  if (!open) return null;
  const minW = orderedLedgerCols.reduce((a, c) => a + c.w, 0);
  const selSty = { fontFamily: "var(--font)" };

  return (
    <div role="dialog" aria-modal="true" aria-label="תנועות למשלם"
      style={{ position: "fixed", inset: 0, zIndex: 7000, background: "var(--ink-50)", display: "flex", flexDirection: "column", animation: "muFade .15s ease" }}>
      {/* ── header ── */}
      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 14, padding: "12px 20px", color: "#fff",
        background: "linear-gradient(135deg,var(--teal-800) 0%,var(--teal-700) 55%,var(--teal-600) 100%)", boxShadow: "var(--shadow-md)" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.18)", display: "grid", placeItems: "center", flex: "none" }}>
          <Icon name="receipt" size={20} color="#fff"/>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.01em" }}>תנועות למשלם</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.8)" }}>תצוגה מלאה · כל סוגי החיוב והתנועות</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.16)", borderRadius: 999, padding: "5px 12px", fontSize: 13, fontWeight: 600 }}>
          <Icon name="user" size={14} color="#fff"/> {payer.name} <span className="num" style={{ opacity: .85 }}>· {payer.payerNo}</span>
        </span>
        <div style={{ flex: 1 }}/>
        {["חפש שם משלם", "חפש קוד משלם", "חפש לפי נכס"].map(ph => (
          <div key={ph} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.28)",
            borderRadius: 9, padding: "5px 10px", height: 32 }}>
            <Icon name="search" size={14} color="rgba(255,255,255,.8)"/>
            <input placeholder={ph} style={{ border: "none", outline: "none", background: "transparent", color: "#fff",
              fontFamily: "var(--font)", fontSize: 12.5, width: 120 }} className="mu-ph-light"/>
          </div>
        ))}
        <button data-focusring onClick={onClose} aria-label="חזרה למצב חשבון" title="חזרה למצב חשבון"
          style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.12)",
            cursor: "pointer", display: "grid", placeItems: "center", flex: "none", marginInlineStart: 4 }}>
          <Icon name="close" size={18} color="#fff"/>
        </button>
      </div>

      {/* ── tabs ── */}
      <div style={{ flex: "none", display: "flex", gap: 4, padding: "8px 16px 0", background: "var(--white)",
        borderBottom: "1px solid var(--ink-200)", overflowX: "auto" }}>
        {TABS.map((t, i) => {
          const active = i === tab;
          return (
            <button key={t} data-focusring onClick={() => setTab(i)}
              style={{ flex: "none", border: "none", borderBottom: `2.5px solid ${active ? "var(--teal-500)" : "transparent"}`,
                background: "transparent", cursor: "pointer", padding: "9px 14px 11px", fontFamily: "var(--font)",
                fontSize: 13.5, fontWeight: active ? 700 : 500, color: active ? "var(--teal-700)" : "var(--ink-600)", whiteSpace: "nowrap" }}>
              {t}
            </button>
          );
        })}
      </div>

      {/* ── filter panel ── */}
      <div style={{ flex: "none", background: "var(--white)", borderBottom: "1px solid var(--ink-200)", padding: "12px 16px",
        display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <FilterSelect label="קבוצת חייבים" value="all" options={[{ value: "all", label: "הכל" }, { value: "muni", label: "גביה עירונית" }]}/>
          <FilterSelect label="מיון לפי" value={sort} onChange={setSort}
            options={[{ value: "terech", label: "ת. ערך" }, { value: "itra", label: "יתרה" }, { value: "sug", label: "סוג חיוב" }]}/>
          <FilterSelect label="סוג חיוב" value={sug} onChange={setSug}
            options={[{ value: "all", label: "כל הסוגים" }, ...sugs.map(s => ({ value: s, label: s }))]}/>
          <FilterSelect label="נכס" value={naxas} onChange={setNaxas}
            options={[{ value: "all", label: "כל הנכסים" }, ...naxasim.map(n => ({ value: n, label: n }))]}/>
          <FilterSelect label="ז/ח" value={dc} onChange={setDc}
            options={[{ value: "all", label: "הכל" }, { value: "ח", label: "חובה" }, { value: "ז", label: "זכות" }]}/>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            <FilterSelect label="מחודש" value="01/2026" options={[{ value: "01/2026", label: "01/2026" }]}/>
            <FilterSelect label="עד" value="12/2026" options={[{ value: "12/2026", label: "12/2026" }]}/>
          </div>
          <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-500)" }}>חיפוש חופשי</span>
            <div style={{ display: "flex", alignItems: "center", gap: 7, height: 34, padding: "0 10px", background: "var(--ink-50)", border: "1px solid var(--ink-300)", borderRadius: 9 }}>
              <Icon name="search" size={14} color="var(--ink-400)"/>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="פרטים / אסמכתא / נכס…"
                style={{ border: "none", outline: "none", background: "transparent", fontFamily: "var(--font)", fontSize: 13, width: "100%", color: "var(--ink-800)" }}/>
            </div>
          </div>
          <button data-focusring onClick={() => { setQ(""); setSug("all"); setNaxas("all"); setDc("all"); }}
            style={{ height: 34, border: "1px solid var(--ink-300)", background: "var(--white)", borderRadius: 9, padding: "0 14px",
              cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600, color: "var(--ink-600)" }}>נקה שדות</button>
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {CHECKS.map(c => <CheckPill key={c} label={c} on={!!checks[c]} onToggle={() => toggle(c)}/>)}
        </div>
      </div>

      {/* ── grid ── */}
      <div style={{ flex: 1, overflow: "auto", padding: "14px 16px" }}>
        <div style={{ background: "var(--white)", border: "1px solid var(--ink-200)", borderRadius: 12, overflow: "hidden",
          boxShadow: "var(--shadow-card)", minWidth: minW }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: minW }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,var(--teal-700),var(--teal-800))" }}>
                {orderedLedgerCols.map((c, ci) => (
                  <SortTh key={c.key} colKey={c.key} label={c.label} align={c.align}
                    sortable={true} sortCol={wSortCol} sortDir={wSortDir} onSort={wToggleSort}
                    dragHandlers={wDragH(wColOrder[ci])} isDragOver={wDragOver === wColOrder[ci]}
                    style={{ width: c.w, position: "sticky", top: 0 }}/>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={orderedLedgerCols.length} style={{ padding: 30, textAlign: "center", color: "var(--ink-400)", fontSize: 13.5 }}>
                  אין תנועות התואמות לסינון
                </td></tr>
              )}
              {groups.map((g, gi) => (
                <React.Fragment key={g.sug || gi}>
                  {grouped && g.sug && (
                    <tr style={{ background: "var(--teal-50)" }}>
                      <td colSpan={orderedLedgerCols.length} style={{ padding: "7px 12px", borderBottom: "1px solid var(--teal-100)" }}>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--teal-700)" }}>{g.sug}</span>
                        <span className="num" style={{ fontSize: 11.5, color: "var(--ink-500)", marginInlineStart: 8 }}>· {g.rows.length} תנועות</span>
                      </td>
                    </tr>
                  )}
                  {g.rows.map(r => (
                    <tr key={r.id} className="mu-txrow">
                      {orderedLedgerCols.map(c => <Cell key={c.key} col={c} row={r}/>)}
                    </tr>
                  ))}
                  {grouped && g.sug && (
                    <tr style={{ background: "var(--ink-50)" }}>
                      <td colSpan={6} style={{ padding: "7px 12px", textAlign: "start", fontSize: 12, fontWeight: 700, color: "var(--ink-700)", borderBottom: "2px solid var(--ink-200)" }}>סיכום {g.sug}</td>
                      <td style={{ borderBottom: "2px solid var(--ink-200)" }}/>
                      <td className="num" style={{ padding: "7px 12px", textAlign: "end", fontWeight: 700, color: "var(--ok-fg)", borderBottom: "2px solid var(--ink-200)" }}>₪{fmt(g.rows.reduce((a, x) => a + (x.zchut || 0), 0))}</td>
                      <td className="num" style={{ padding: "7px 12px", textAlign: "end", fontWeight: 700, color: "var(--ink-800)", borderBottom: "2px solid var(--ink-200)" }}>₪{fmt(g.rows.reduce((a, x) => a + (x.chova || 0), 0))}</td>
                      <td className="num" style={{ padding: "7px 12px", textAlign: "end", fontWeight: 800, color: "var(--ink-900)", borderBottom: "2px solid var(--ink-200)" }}>₪{fmt(g.rows[g.rows.length - 1].itra)}</td>
                      <td colSpan={3} style={{ borderBottom: "2px solid var(--ink-200)" }}/>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── footer totals ── */}
      <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 20, padding: "10px 20px", background: "var(--white)",
        borderTop: "1px solid var(--ink-200)", boxShadow: "0 -6px 16px rgba(18,48,60,.05)" }}>
        {filterNaxas && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "var(--teal-50)", border: "1px solid var(--teal-200)", borderRadius: 999, padding: "3px 10px", fontSize: 12, fontWeight: 600, color: "var(--teal-700)" }}>
            <Icon name="building" size={12} color="var(--teal-600)"/> פיזי {filterNaxas}
          </span>
        )}
        <span style={{ fontSize: 12.5, color: "var(--ink-500)" }}><span className="num" style={{ fontWeight: 700, color: "var(--ink-800)" }}>{rows.length}</span> תנועות</span>
        <ColumnPicker cols={LEDGER_COLUMNS} hidden={wHidden} onToggle={wToggleCol}/>
        <div style={{ width: 1, height: 22, background: "var(--ink-200)" }}/>
        <span style={{ fontSize: 13 }}>סך זכות <span className="num" style={{ fontWeight: 700, color: "var(--ok-fg)" }}>₪{fmt(totals.zchut)}</span></span>
        <span style={{ fontSize: 13 }}>סך חובה <span className="num" style={{ fontWeight: 700, color: "var(--ink-800)" }}>₪{fmt(totals.chova)}</span></span>
        <div style={{ flex: 1 }}/>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--teal-700)", color: "#fff", borderRadius: 999, padding: "7px 16px" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>יתרת חוב</span>
          <span className="num" style={{ fontSize: 17, fontWeight: 800 }}>₪{fmt(totals.balance)}</span>
        </span>
        <button data-focusring onClick={() => window.muToast("מייצא תנועות ל-Excel", "download")}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, border: "1px solid var(--ink-300)", background: "var(--white)",
            borderRadius: 9, padding: "7px 14px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600, color: "var(--ink-700)" }}>
          <Icon name="download" size={15} color="var(--ink-600)"/> ייצוא
        </button>
      </div>
    </div>
  );
}

export { WideTxnScreen };
