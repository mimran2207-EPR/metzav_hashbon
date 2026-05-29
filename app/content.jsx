import React, { useState } from 'react';
import { Icon } from './icons.jsx';
import { Chip, Segmented } from './ui.jsx';
import { fmt } from './data.jsx';
import s from './ui.module.css';

function EntityStrip({ entities, selected, onSelect }) {
  const subjIcon = { 3: "building", 13: "droplet", 15: "receipt", 1: "user" };
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <button data-focusring onClick={() => onSelect("all")} style={{ ...entityCardStyle(selected === "all"), minWidth: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ ...entityIcon(selected === "all") }}><Icon name="wallet" size={18} color="#fff"/></div>
          <div style={{ textAlign: "start" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink-800)" }}>כל הישויות</div>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{entities.length} נושאים</div>
          </div>
        </div>
      </button>
      {entities.map(e => {
        const active = selected === e.id;
        return (
          <button key={e.id} data-focusring onClick={() => onSelect(e.id)} style={entityCardStyle(active)}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={entityIcon(active)}><Icon name={subjIcon[e.subject] || "building"} size={18} color="#fff"/></div>
              <div style={{ textAlign: "start", minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink-800)", whiteSpace: "nowrap" }}>{e.title}</span>
                  <Chip tone="gray" style={{ fontSize: 10 }}>נושא {e.subject}</Chip>
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-500)", display: "flex", gap: 7, marginTop: 1 }}>
                  <span className="num">פיזי {e.id}</span>
                  <span className="num" style={{ color: e.balance > 0 ? "var(--ink-700)" : "var(--green)", fontWeight: 600 }}>
                    {e.balance > 0 ? `₪${fmt(e.balance)}` : "0 ✓"}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
function entityCardStyle(active) {
  return { display: "flex", alignItems: "center", cursor: "pointer", textAlign: "start",
    background: active ? "var(--teal-50)" : "var(--white)", border: `1.5px solid ${active ? "var(--teal-500)" : "var(--ink-200)"}`,
    borderRadius: 14, padding: "11px 14px", transition: "all .14s ease", fontFamily: "var(--font)",
    boxShadow: active ? "0 0 0 4px rgba(42,167,184,.16), 0 4px 12px rgba(42,167,184,.18)" : "var(--shadow-card)" };
}
function entityIcon(active) {
  return { width: 36, height: 36, borderRadius: 10, flex: "none", display: "grid", placeItems: "center",
    background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))",
    boxShadow: "0 3px 8px rgba(42,167,184,.30)" };
}

function BalancesTable({ services, totals, density, txns, txnTypes }) {
  const [open, setOpen] = useState(null);
  const compact = density === "compact";
  const cellPad = compact ? "9px 14px" : "13px 14px";
  const cols = ["סוג שירות", "נומינלי (קרן)", "הצמדה", "ריבית", "יתרה", ""];
  const colAlign = ["start", "end", "end", "end", "end", "center"];
  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--ink-200)" }}>
      <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ background: "linear-gradient(135deg,var(--teal-700) 0%,var(--teal-800) 100%)" }}>
            {cols.map((c, i) => (
              <th key={i} style={{ textAlign: colAlign[i], padding: "12px 14px", fontSize: 12, fontWeight: 700,
                color: "rgba(255,255,255,.9)", letterSpacing: ".01em", whiteSpace: "nowrap",
                width: i === 0 ? "auto" : i === 5 ? 44 : 110 }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {services.map(svc => {
            const isOpen = open === svc.id;
            const rows = txns[svc.id] || [];
            return (
              <React.Fragment key={svc.id}>
                <tr data-focusring role="button" tabIndex={0} aria-expanded={isOpen}
                  aria-label={`${svc.name} — יתרה ₪${fmt(svc.balance)}. הקש להצגת תנועות`}
                  onClick={() => setOpen(isOpen ? null : svc.id)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(isOpen ? null : svc.id); } }}
                  className={`${s.tRow} ${isOpen ? s.tRowOpen : ""}`}>
                  <td style={{ padding: cellPad, borderBottom: "1px solid var(--ink-100)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 999, background: svc.balance > 0 ? "var(--amber)" : "var(--green)", flex: "none" }}/>
                      <span style={{ fontWeight: 600, color: "var(--ink-800)" }}>{svc.name}</span>
                      <Chip tone="gray" style={{ fontSize: 10 }}><span className="num">{rows.length}</span> תנועות</Chip>
                    </div>
                  </td>
                  <td className="num" style={{ ...numCell(cellPad) }}>₪{fmt(svc.nominal)}</td>
                  <td className="num" style={{ ...numCell(cellPad), color: "var(--ink-600)" }}>₪{fmt(svc.indexation)}</td>
                  <td className="num" style={{ ...numCell(cellPad), color: "var(--ink-600)" }}>₪{fmt(svc.interest)}</td>
                  <td className="num" style={{ ...numCell(cellPad), fontWeight: 700, color: "var(--ink-900)" }}>₪{fmt(svc.balance)}</td>
                  <td style={{ padding: cellPad, textAlign: "center", borderBottom: "1px solid var(--ink-100)" }}>
                    <Icon name="chevdown" size={17} color="var(--ink-400)" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .18s ease", margin: "0 auto" }}/>
                  </td>
                </tr>
                {isOpen && (
                  <tr>
                    <td colSpan={6} style={{ padding: 0, background: "var(--ink-50)", borderBottom: "1px solid var(--ink-200)" }}>
                      <div className="mu-rise" style={{ padding: "6px 14px 14px" }}>
                        <TxnTable rows={rows} types={txnTypes} compact={compact}/>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: "linear-gradient(135deg,var(--teal-600) 0%,var(--teal-800) 100%)" }}>
            <td style={{ padding: "14px 14px", color: "#fff", fontWeight: 700, fontSize: 15 }}>סך הכל למשלם</td>
            <td className="num" style={{ ...footCell }}>₪{fmt(totals.nominal)}</td>
            <td className="num" style={{ ...footCell }}>₪{fmt(totals.indexation)}</td>
            <td className="num" style={{ ...footCell }}>₪{fmt(totals.interest)}</td>
            <td className="num" style={{ ...footCell, fontSize: 17, fontWeight: 800 }}>₪{fmt(totals.balance)}</td>
            <td/>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
function numCell(p) { return { padding: p, textAlign: "end", borderBottom: "1px solid var(--ink-100)", fontWeight: 600, color: "var(--ink-800)" }; }
const footCell = { padding: "13px 14px", textAlign: "end", color: "rgba(255,255,255,.92)", fontWeight: 600, fontSize: 14 };

function TxnTable({ rows, types, compact }) {
  const [q, setQ] = useState("");
  const [dc, setDc] = useState("all");
  const filtered = rows.filter(r => {
    if (dc !== "all" && r.dc !== dc) return false;
    if (q && !(`${types[r.type]} ${r.ref} ${r.date}`.includes(q))) return false;
    return true;
  });
  const cols = ["תאריך", "סוג תנועה", "אסמכתא", "ז/ח", "נומינלי", "הצמדה+ריבית", "יתרה רצה"];
  const align = ["start", "start", "start", "center", "end", "end", "end"];
  return (
    <div style={{ background: "#fff", border: "1px solid var(--ink-200)", borderRadius: 11, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: "1px solid var(--ink-100)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flex: "1 1 auto", maxWidth: 300, background: "var(--ink-50)",
          border: "1px solid var(--ink-200)", borderRadius: 9, padding: "5px 10px" }}>
          <Icon name="search" size={15} color="var(--ink-400)"/>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="סנן תנועות…"
            style={{ border: "none", outline: "none", background: "transparent", fontFamily: "var(--font)", fontSize: 13, width: "100%", color: "var(--ink-800)" }}/>
        </div>
        <Segmented size="sm" value={dc} onChange={setDc} options={[{ value: "all", label: "הכל" }, { value: "ח", label: "חובה" }, { value: "ז", label: "זכות" }]}/>
        <div style={{ flex: 1 }}/>
        <span style={{ fontSize: 12, color: "var(--ink-500)" }}><span className="num">{filtered.length}</span> שורות</span>
        <button data-focusring title="ייצוא" onClick={() => window.muToast("מייצא תנועות ל-Excel", "download")}
          style={{ border: "1px solid var(--ink-200)", background: "#fff", borderRadius: 8, padding: "5px 8px", cursor: "pointer", display: "grid", placeItems: "center" }}>
          <Icon name="download" size={15} color="var(--ink-600)"/>
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>{cols.map((c, i) => <th key={i} style={{ textAlign: align[i], padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "var(--ink-500)", borderBottom: "1px solid var(--ink-100)", whiteSpace: "nowrap" }}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={7} style={{ padding: "26px", textAlign: "center", color: "var(--ink-400)", fontSize: 13 }}>אין תנועות התואמות לסינון</td></tr>
          )}
          {filtered.map((r, i) => {
            const credit = r.dc === "ז";
            return (
              <tr key={i} className={s.txRow} style={{ borderBottom: "1px solid var(--ink-50)" }}>
                <td className="num" style={{ padding: compact ? "6px 12px" : "9px 12px", color: "var(--ink-600)", whiteSpace: "nowrap" }}>{r.date}</td>
                <td style={{ padding: compact ? "6px 12px" : "9px 12px", color: "var(--ink-800)", fontWeight: 500, whiteSpace: "nowrap" }}>
                  {types[r.type]} <span className="num" style={{ color: "var(--ink-400)", fontSize: 11 }}>({r.type})</span>
                </td>
                <td className="num" style={{ padding: compact ? "6px 12px" : "9px 12px", color: "var(--ink-500)", whiteSpace: "nowrap" }}>{r.ref}</td>
                <td style={{ padding: compact ? "6px 12px" : "9px 12px", textAlign: "center" }}>
                  <span style={{ display: "inline-block", minWidth: 20, fontSize: 11, fontWeight: 700, color: credit ? "#1f8a52" : "#b23636",
                    background: credit ? "#E7F6EE" : "#FBE9E9", borderRadius: 6, padding: "2px 7px" }}>{r.dc}</span>
                </td>
                <td className="num" style={{ padding: compact ? "6px 12px" : "9px 12px", textAlign: "end", fontWeight: 600,
                  color: credit ? "#1f8a52" : "var(--ink-800)", whiteSpace: "nowrap" }}>
                  {r.nominal ? (credit ? "−" : "") + "₪" + fmt(r.nominal) : "—"}
                </td>
                <td className="num" style={{ padding: compact ? "6px 12px" : "9px 12px", textAlign: "end", color: "var(--ink-600)", whiteSpace: "nowrap" }}>
                  {r.addon ? "₪" + fmt(r.addon) : "—"}
                </td>
                <td className="num" style={{ padding: compact ? "6px 12px" : "9px 12px", textAlign: "end", fontWeight: 700, color: "var(--ink-900)", whiteSpace: "nowrap" }}>₪{fmt(r.bal)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { EntityStrip, BalancesTable, TxnTable };
