import React, { useState, useRef } from 'react';
import { Icon } from './icons.jsx';
import { Chip, Segmented } from './ui.jsx';
import { fmt, SUBJECT_DETAILS, TXNS, QUICK_ACTIONS } from './data.jsx';
import { useColSort, useColOrder, SortTh, ColumnPicker, useColVisibility } from './table-utils.jsx';
import s from './ui.module.css';

// SubjectCard — one subject in the carousel.
function SubjectCard({ sub, active, onSelect }) {
  const paid = (sub.balance || 0) <= 0;
  return (
    <button data-focusring onClick={() => onSelect(sub.id)} style={{ ...entityCardStyle(active), minWidth: 178, flex: "0 0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
        <div style={entityIcon(active)}><Icon name={sub.icon} size={19} color="#fff"/></div>
        <div style={{ textAlign: "start", minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-800)", whiteSpace: "nowrap" }}>{sub.name}</span>
            <Chip tone="teal" style={{ fontSize: 10 }}><span className="num">{sub.count}</span> {sub.unit}</Chip>
          </div>
          <div className="num" style={{ fontSize: 11.5, marginTop: 2, fontWeight: 600, color: paid ? "var(--green)" : "var(--ink-700)" }}>
            {paid ? "0 ✓ ללא חוב" : `₪${fmt(sub.balance)}`}
          </div>
        </div>
      </div>
    </button>
  );
}

// SubjectStrip — horizontal CAROUSEL of subjects. Scroll with the arrows (or
// native swipe/wheel); the pin button keeps the strip docked while you scroll.
function SubjectStrip({ subjects, selected, onSelect }) {
  const scroller = useRef(null);
  const [pinned, setPinned] = useState(false);
  const nudge = (dir) => scroller.current && scroller.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  const arrowBtn = { width: 32, height: 32, borderRadius: 9, border: "1px solid var(--ink-200)", background: "var(--white)",
    cursor: "pointer", display: "grid", placeItems: "center", flex: "none", boxShadow: "var(--shadow-card)" };
  return (
    <div style={{ position: pinned ? "sticky" : "static", top: 118, zIndex: 30,
      background: pinned ? "var(--ink-50)" : "transparent", borderRadius: 14, padding: pinned ? "8px 0" : 0,
      boxShadow: pinned ? "0 6px 16px rgba(18,48,60,.08)" : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button data-focusring aria-label="גלול ימינה" onClick={() => nudge(1)} style={arrowBtn}>
          <Icon name="chevright" size={18} color="var(--ink-600)"/>
        </button>
        <div ref={scroller} style={{ display: "flex", gap: 12, overflowX: "auto", flex: 1, padding: "4px 2px",
          scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <button data-focusring onClick={() => onSelect("all")} style={{ ...entityCardStyle(selected === "all"), minWidth: 152, flex: "0 0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={entityIcon(selected === "all")}><Icon name="wallet" size={18} color="#fff"/></div>
              <div style={{ textAlign: "start" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-800)" }}>כל הנושאים</div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)" }}><span className="num">{subjects.length}</span> נושאים פעילים</div>
              </div>
            </div>
          </button>
          {subjects.map(sub => <SubjectCard key={sub.id} sub={sub} active={selected === sub.id} onSelect={onSelect}/>)}
        </div>
        <button data-focusring aria-label="גלול שמאלה" onClick={() => nudge(-1)} style={arrowBtn}>
          <Icon name="chevleft" size={18} color="var(--ink-600)"/>
        </button>
        <button data-focusring aria-pressed={pinned} title={pinned ? "שחרר רצועה" : "קבע רצועה"} onClick={() => setPinned(p => !p)}
          style={{ ...arrowBtn, background: pinned ? "var(--teal-500)" : "var(--white)", border: pinned ? "1px solid var(--teal-500)" : arrowBtn.border }}>
          <Icon name="pin" size={17} color={pinned ? "#fff" : "var(--ink-600)"}/>
        </button>
      </div>
    </div>
  );
}

// ── Drill-down: subject → sub-items → charges → account status ──────────────
const UNIT_SINGULAR = { "נכסים": "נכס", "מדי מים": "מד מים", "ילדים": "ילד/ה", "דוחות": "דוח", "שלט": "שלט", "רישומים": "רישום", "תיק": "תיק", "היתר": "היתר" };
function getSubItems(subject) {
  const authored = SUBJECT_DETAILS[subject.id];
  if (authored) return authored.subItems;
  const sing = UNIT_SINGULAR[subject.unit] || subject.unit;
  const per = subject.count ? Math.round((subject.balance || 0) / subject.count) : 0;
  return Array.from({ length: subject.count }, (_, i) => ({
    id: `${subject.id}-${i + 1}`, name: `${sing} ${i + 1}`, meta: `${subject.name} · פריט ${i + 1}`,
    charges: [{ id: `${subject.id}-${i + 1}-c`, name: subject.name, balance: per }],
  }));
}
function chargeBalance(charge) {
  if (charge.txns && TXNS[charge.txns]) { const r = TXNS[charge.txns]; return r[r.length - 1].bal; }
  return charge.balance || 0;
}
function Crumb({ label, kind, onClick, last }) {
  const labelEl = onClick && !last
    ? <button data-focusring onClick={onClick} style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600, color: "var(--teal-600)", padding: 0 }}>{label}</button>
    : <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-800)" }}>{label}</span>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ display: "inline-flex", flexDirection: "column", gap: 1, lineHeight: 1.15, textAlign: "start" }}>
        {kind && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)" }}>{kind}</span>}
        {labelEl}
      </span>
      {!last && <Icon name="chevleft" size={14} color="var(--ink-300)"/>}
    </span>
  );
}
function DrillRow({ icon, title, badge, meta, balance, count, countLabel, holders, onClick }) {
  const paid = (balance || 0) <= 0;
  return (
    <button data-focusring onClick={onClick} className={`${s.listRow} ${s.listRowTeal}`} style={{ padding: "12px 14px" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, flex: "none", display: "grid", placeItems: "center",
        background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))", boxShadow: "0 3px 8px rgba(var(--teal-rgb),.3)" }}>
        <Icon name={icon} size={18} color="#fff"/>
      </div>
      <div style={{ minWidth: 0, flex: 1, textAlign: "start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-800)" }}>{title}</span>
          {badge && <span className="num" style={{ fontSize: 10.5, fontWeight: 600, color: "var(--teal-700)", background: "var(--teal-50)",
            border: "1px solid var(--teal-100)", borderRadius: 6, padding: "1px 7px" }}>{badge}</span>}
          {count != null && <Chip tone="gray" style={{ fontSize: 10 }}><span className="num">{count}</span> {countLabel}</Chip>}
          {holders > 1 && <Chip tone="gray" style={{ fontSize: 10 }}><Icon name="history" size={11} color="var(--ink-500)"/> <span className="num">{holders}</span> מחזיקים</Chip>}
        </div>
        {meta && <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 1 }}>{meta}</div>}
      </div>
      <div className="num" style={{ fontSize: 13.5, fontWeight: 700, color: paid ? "var(--green)" : "var(--ink-900)", flex: "none", marginInlineEnd: 4 }}>
        {paid ? "0 ✓" : `₪${fmt(balance)}`}
      </div>
      <Icon name="chevleft" size={16} color="var(--ink-300)"/>
    </button>
  );
}

// PropertyContextPanel — shown when a single פיזי (sub-item) is selected.
// Displays: identity banner + scoped quick actions + holder history chain.
function PropertyContextPanel({ subItem, subject, totalBalance, onAction }) {
  const [holdersOpen, setHoldersOpen] = useState(false);
  const holders = subItem.holders || [];
  const currentHolder = holders.find(h => h.current);
  const prevHolders = holders.filter(h => !h.current);

  return (
    <div style={{ marginBottom: 20 }}>
      {/* ── identity banner ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
        background: "linear-gradient(135deg,var(--teal-800) 0%,var(--teal-600) 100%)",
        borderRadius: "12px 12px 0 0", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", insetInlineEnd: -24, top: -24, width: 100, height: 100,
          borderRadius: 999, background: "rgba(255,255,255,.07)", pointerEvents: "none" }}/>
        <div style={{ width: 44, height: 44, borderRadius: 12, flex: "none", display: "grid", placeItems: "center",
          background: "rgba(255,255,255,.18)" }}>
          <Icon name={subject.icon} size={22} color="#fff"/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{subItem.name}</span>
            <span className="num" style={{ fontSize: 12, fontWeight: 600, background: "rgba(255,255,255,.2)",
              color: "#fff", borderRadius: 6, padding: "2px 8px" }}>פיזי {subItem.id}</span>
          </div>
          {subItem.meta && <div style={{ fontSize: 13, color: "rgba(255,255,255,.8)", marginTop: 2 }}>{subItem.meta}</div>}
        </div>
        <div style={{ textAlign: "start", flex: "none" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>יתרת חוב</div>
          <div className="num" style={{ fontSize: 22, fontWeight: 700, color: totalBalance > 0 ? "#ffd9d9" : "#c8f5d8" }}>
            {totalBalance > 0 ? `₪${fmt(totalBalance)}` : "0 ✓"}
          </div>
        </div>
      </div>

      {/* ── quick actions scoped to this פיזי ── */}
      <div style={{ padding: "12px 16px 4px", background: "var(--teal-50)",
        borderInlineStart: "3px solid var(--teal-400)", borderInlineEnd: "3px solid var(--teal-400)" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--teal-700)", marginBottom: 8, letterSpacing: ".01em" }}>
          פעולות לפיזי {subItem.id}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {QUICK_ACTIONS.map(a => (
            <button key={a.id} data-focusring onClick={() => onAction && onAction(a)}
              title={a.hint}
              style={{ display: "inline-flex", alignItems: "center", gap: 6,
                border: "1px solid var(--teal-300)", background: "#fff",
                borderRadius: 999, padding: "7px 14px", cursor: "pointer",
                fontFamily: "var(--font)", fontSize: 13, fontWeight: 600, color: "var(--teal-700)",
                transition: "background .13s ease, border-color .13s ease, transform .1s ease",
                boxShadow: "0 1px 4px rgba(var(--teal-rgb),.10)" }}>
              <Icon name={a.icon} size={14} color="var(--teal-600)"/>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── holder chain — compact strip, expandable ── */}
      {holders.length > 0 && (
        <div style={{ padding: "10px 16px", background: "var(--ink-50)",
          borderInlineStart: "3px solid var(--teal-400)", borderInlineEnd: "3px solid var(--teal-400)",
          borderTop: "1px solid var(--teal-100)" }}>
          <button data-focusring onClick={() => setHoldersOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", border: "none",
              background: "transparent", cursor: "pointer", padding: 0, fontFamily: "var(--font)" }}>
            <Icon name="history" size={15} color="var(--teal-600)"/>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--teal-700)" }}>שרשרת מחזיקים</span>
            {/* compact preview — current + count */}
            {currentHolder && (
              <span style={{ fontSize: 12, color: "var(--ink-muted)", marginInlineStart: 4 }}>
                {currentHolder.name}
                {prevHolders.length > 0 && ` + ${prevHolders.length} קודמים`}
              </span>
            )}
            <Icon name="chevdown" size={14} color="var(--ink-400)"
              style={{ marginInlineStart: "auto", transform: holdersOpen ? "rotate(180deg)" : "none", transition: "transform .18s" }}/>
          </button>

          {holdersOpen && (
            <div className="mu-rise" style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 0,
              border: "1px solid var(--ink-200)", borderRadius: 10, overflow: "hidden" }}>
              {holders.map((h, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                  background: h.current ? "var(--teal-50)" : "#fff",
                  borderBottom: i < holders.length - 1 ? "1px solid var(--ink-100)" : "none" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 999, flex: "none", display: "grid",
                    placeItems: "center", fontSize: 11, fontWeight: 700,
                    background: h.current ? "var(--teal-500)" : "var(--ink-100)",
                    color: h.current ? "#fff" : "var(--ink-muted)" }}>
                    {h.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)" }}>{h.name}</span>
                      {h.current
                        ? <Chip tone="green" style={{ fontSize: 10 }}>נוכחי</Chip>
                        : <Chip tone="gray" style={{ fontSize: 10 }}>קודם</Chip>}
                      {h.reason && <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>· {h.reason}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                      משלם <span className="num">{h.payerNo}</span>
                      {" · "}{h.from} – {h.to || "היום"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* bottom border closing the banner */}
      <div style={{ height: 3, background: "linear-gradient(90deg,var(--teal-600),var(--teal-400))",
        borderRadius: "0 0 4px 4px" }}/>
    </div>
  );
}

// HolderHistory — "משלמים היסטוריים" scoped to a single פיזי (property): the
// chain of holders who were the payer for this property over time.
function HolderHistory({ holders, naxasId }) {
  if (!holders || !holders.length) return null;
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, flex: "none", display: "grid", placeItems: "center",
          background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))", boxShadow: "0 3px 8px rgba(var(--teal-rgb),.3)" }}>
          <Icon name="history" size={16} color="#fff"/>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-800)" }}>משלמים היסטוריים לנכס</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>שרשרת מחזיקים · פיזי <span className="num">{naxasId}</span></div>
        </div>
      </div>
      <div style={{ border: "1px solid var(--ink-200)", borderRadius: 11, overflow: "hidden" }}>
        {holders.map((h, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 13px",
            background: h.current ? "var(--teal-50)" : "#fff", borderBottom: i < holders.length - 1 ? "1px solid var(--ink-100)" : "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, flex: "none", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700,
              background: h.current ? "var(--teal-500)" : "var(--ink-100)", color: h.current ? "#fff" : "var(--ink-500)" }}>
              {h.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-800)" }}>{h.name}</span>
                {h.current ? <Chip tone="green" style={{ fontSize: 10 }}>מחזיק נוכחי</Chip> : <Chip tone="gray" style={{ fontSize: 10 }}>מחזיק קודם</Chip>}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>
                משלם <span className="num">{h.payerNo}</span>{h.reason ? ` · ${h.reason}` : ""}
              </div>
            </div>
            <div className="num" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-600)", flex: "none", whiteSpace: "nowrap" }}>
              {h.from} – {h.to || "היום"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// SubjectDrillDown — renders the current level (sub-items / charges / account)
// for a selected subject, with a breadcrumb trail.
function SubjectDrillDown({ subject, subItemId, chargeId, onSelectSubItem, onSelectCharge, onReset, onOpenWide, density, txnTypes, onAction }) {
  const subItems = getSubItems(subject);
  const subItem = subItems.find(si => si.id === subItemId);
  const charges = subItem ? subItem.charges : [];
  const charge = charges.find(c => c.id === chargeId);
  const subItemBalance = (si) => si.charges.reduce((a, c) => a + chargeBalance(c), 0);
  const sing = UNIT_SINGULAR[subject.unit] || subject.unit || "פריט"; // level-2 singular (נכס / מד מים / ילד…)
  const authored = !!SUBJECT_DETAILS[subject.id]; // real physical ids vs auto-generated

  return (
    <div>
      {/* breadcrumb — typed levels: נושא › נכס › סוג חיוב */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 14,
        background: "var(--ink-50)", border: "1px solid var(--ink-100)", borderRadius: 10, padding: "8px 12px" }}>
        <Crumb kind="נושא" label={subject.name} onClick={onReset} last={!subItem}/>
        {subItem && <Crumb kind={sing} label={subItem.name} onClick={() => onSelectCharge(null)} last={!charge}/>}
        {charge && <Crumb kind="סוג חיוב" label={charge.name} last/>}
      </div>

      {/* level 2 — sub-items (נכסים / מדי מים / ילדים…) */}
      {!subItem && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 13, color: "var(--ink-muted)", fontWeight: 600, marginBottom: 4 }}>{subject.unit} ({subItems.length})</div>
          {subItems.map(si => (
            <DrillRow key={si.id} icon={subject.icon} title={si.name} badge={authored ? `פיזי ${si.id}` : null} meta={si.meta}
              count={si.charges.length} countLabel="סוגי חיוב" holders={si.holders ? si.holders.length : 0} balance={subItemBalance(si)}
              onClick={() => onSelectSubItem(si.id)}/>
          ))}
        </div>
      )}

      {/* level 3 — property context banner + quick actions + holder chain + charge types */}
      {subItem && !charge && (
        <>
          <PropertyContextPanel
            subItem={subItem}
            subject={subject}
            totalBalance={subItemBalance(subItem)}
            onAction={onAction}/>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", fontWeight: 600, marginBottom: 4 }}>
              סוגי חיוב ({charges.length})
            </div>
            {charges.map(c => (
              <DrillRow key={c.id} icon="receipt" title={c.name}
                meta={c.txns ? `${(TXNS[c.txns] || []).length} תנועות` : "אין תנועות"} balance={chargeBalance(c)}
                onClick={() => onSelectCharge(c.id)}/>
            ))}
          </div>
        </>
      )}

      {/* level 4 — account status */}
      {charge && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-800)" }}>מצב חשבון — {charge.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="num" style={{ fontSize: 15, fontWeight: 800, color: chargeBalance(charge) > 0 ? "var(--ink-900)" : "var(--green)" }}>
                יתרה: {chargeBalance(charge) > 0 ? `₪${fmt(chargeBalance(charge))}` : "0 ✓"}
              </div>
              {onOpenWide && (
                <button data-focusring onClick={onOpenWide} title="פתח מסך תנועות מלא"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--teal-500)",
                    background: "var(--teal-50)", color: "var(--teal-700)", borderRadius: 999, padding: "5px 12px",
                    cursor: "pointer", fontFamily: "var(--font)", fontSize: 12.5, fontWeight: 600 }}>
                  <Icon name="receipt" size={14} color="var(--teal-600)"/> מסך תנועות מלא
                </button>
              )}
            </div>
          </div>
          {charge.txns && TXNS[charge.txns]
            ? <TxnTable rows={TXNS[charge.txns]} types={txnTypes} compact={density === "compact"}/>
            : <div style={{ padding: "28px", textAlign: "center", color: "var(--ink-400)", fontSize: 13, background: "var(--ink-50)", border: "1px solid var(--ink-100)", borderRadius: 11 }}>אין תנועות להצגה בחיוב זה</div>}
        </div>
      )}
    </div>
  );
}
function entityCardStyle(active) {
  return { display: "flex", alignItems: "center", cursor: "pointer", textAlign: "start",
    background: active ? "var(--teal-50)" : "var(--white)", border: `1.5px solid ${active ? "var(--teal-500)" : "var(--ink-200)"}`,
    borderRadius: 14, padding: "11px 14px", transition: "all .14s ease", fontFamily: "var(--font)",
    boxShadow: active ? "0 0 0 4px rgba(var(--teal-rgb),.16), 0 4px 12px rgba(var(--teal-rgb),.18)" : "var(--shadow-card)" };
}
function entityIcon(active) {
  return { width: 36, height: 36, borderRadius: 10, flex: "none", display: "grid", placeItems: "center",
    background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))",
    boxShadow: "0 3px 8px rgba(var(--teal-rgb),.30)" };
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
          <tr style={{ background: "linear-gradient(135deg,var(--teal-700) 0%,var(--teal-800) 100%)", position: "sticky", top: 0, zIndex: 2 }}>
            {cols.map((c, i) => (
              <th key={i} style={{ textAlign: colAlign[i], padding: "12px 14px", fontSize: 13, fontWeight: 700,
                color: "rgba(255,255,255,.95)", whiteSpace: "nowrap",
                width: i === 0 ? "auto" : i === 5 ? 44 : 110 }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {services.length === 0 && (
            <tr><td colSpan={6} style={{ padding: "30px 14px", textAlign: "center", color: "var(--ink-400)", fontSize: 13.5 }}>
              אין יתרות חוב פתוחות לנושא זה
            </td></tr>
          )}
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
            <td className="num" style={{ ...footCell, fontSize: 17, fontWeight: 700 }}>₪{fmt(totals.balance)}</td>
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
  const { sortCol: t3Sort, sortDir: t3Dir, toggleSort: t3Toggle, applySort: t3Apply } = useColSort();
  const { hidden: t3Hidden, toggleCol: t3ToggleCol } = useColVisibility();
  const T3_COLS = [
    { key:"date",  label:"תאריך",       align:"start", sortable:true },
    { key:"type",  label:"סוג תנועה",   align:"start", sortable:true },
    { key:"ref",   label:"אסמכתא",      align:"start", sortable:true },
    { key:"dc",    label:"ז/ח",         align:"center",sortable:true },
    { key:"nom",   label:"נומינלי",     align:"end",   sortable:true },
    { key:"addon", label:"הצמדה+ריבית", align:"end",   sortable:true },
    { key:"bal",   label:"יתרה רצה",    align:"end",   sortable:true },
  ];
  const { order: t3Order, dragOver: t3DragOver, handlers: t3DragH } = useColOrder(T3_COLS.length);
  const orderedT3 = t3Order.map(i => T3_COLS[i]).filter(c => !t3Hidden.has(c.key));

  const t3SortVal = (r, key) => {
    if (key === "date")  { const [d,m,y] = r.date.split("/"); return +new Date(+y, +m-1, +d); }
    if (key === "type")  return types[r.type] || "";
    if (key === "ref")   return r.ref || "";
    if (key === "dc")    return r.dc;
    if (key === "nom")   return r.nominal || 0;
    if (key === "addon") return r.addon || 0;
    if (key === "bal")   return r.bal || 0;
    return 0;
  };

  const filtered = rows.filter(r => {
    if (dc !== "all" && r.dc !== dc) return false;
    if (q && !(`${types[r.type]} ${r.ref} ${r.date}`.includes(q))) return false;
    return true;
  });
  const sortedFiltered = t3Apply(filtered, (r, col) => t3SortVal(r, col));

  // Cell renderers per column
  const t3Cell = (r, key, cp) => {
    const credit = r.dc === "ז";
    if (key === "date")  return <td key="date" className="num" style={{ padding:cp, color:"var(--ink-600)", whiteSpace:"nowrap" }}>{r.date}</td>;
    if (key === "type")  return <td key="type" style={{ padding:cp, color:"var(--ink-800)", fontWeight:500, whiteSpace:"nowrap" }}>{types[r.type]} <span className="num" style={{ color:"var(--ink-400)", fontSize:11 }}>({r.type})</span></td>;
    if (key === "ref")   return <td key="ref" className="num" style={{ padding:cp, color:"var(--ink-muted)", whiteSpace:"nowrap" }}>{r.ref}</td>;
    if (key === "dc")    return <td key="dc" style={{ padding:cp, textAlign:"center" }}><span style={{ display:"inline-block", minWidth:20, fontSize:11, fontWeight:700, color:credit?"#1f8a52":"#b23636", background:credit?"#E7F6EE":"#FBE9E9", borderRadius:6, padding:"2px 7px" }}>{r.dc}</span></td>;
    if (key === "nom")   return <td key="nom" className="num" style={{ padding:cp, textAlign:"end", fontWeight:600, color:credit?"#1f8a52":"var(--ink-800)", whiteSpace:"nowrap" }}>{r.nominal?(credit?"−":"")+"₪"+fmt(r.nominal):"—"}</td>;
    if (key === "addon") return <td key="addon" className="num" style={{ padding:cp, textAlign:"end", color:"var(--ink-600)", whiteSpace:"nowrap" }}>{r.addon?"₪"+fmt(r.addon):"—"}</td>;
    if (key === "bal")   return <td key="bal" className="num" style={{ padding:cp, textAlign:"end", fontWeight:700, color:"var(--ink-900)", whiteSpace:"nowrap" }}>₪{fmt(r.bal)}</td>;
    return <td key={key}/>;
  };

  const cp = compact ? "6px 12px" : "9px 12px";

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
        <span style={{ fontSize: 12, color: "var(--ink-muted)" }}><span className="num">{sortedFiltered.length}</span> שורות</span>
        <ColumnPicker cols={T3_COLS} hidden={t3Hidden} onToggle={t3ToggleCol}/>
        <button data-focusring title="ייצוא" onClick={() => window.muToast("מייצא תנועות ל-Excel", "download")}
          style={{ border: "1px solid var(--ink-200)", background: "#fff", borderRadius: 8, padding: "5px 8px", cursor: "pointer", display: "grid", placeItems: "center" }}>
          <Icon name="download" size={15} color="var(--ink-600)"/>
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "linear-gradient(135deg,var(--teal-700),var(--teal-800))", position: "sticky", top: 0 }}>
            {orderedT3.map((c, ci) => (
              <SortTh key={c.key} colKey={c.key} label={c.label} align={c.align}
                sortable={c.sortable} sortCol={t3Sort} sortDir={t3Dir} onSort={t3Toggle}
                dragHandlers={t3DragH(t3Order[ci])} isDragOver={t3DragOver === t3Order[ci]}/>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedFiltered.length === 0 && (
            <tr><td colSpan={7} style={{ padding: "26px", textAlign: "center", color: "var(--ink-400)", fontSize: 13 }}>אין תנועות התואמות לסינון</td></tr>
          )}
          {sortedFiltered.map((r, i) => (
            <tr key={i} className={s.txRow} style={{ borderBottom: "1px solid var(--ink-50)" }}>
              {orderedT3.map(col => t3Cell(r, col.key, cp))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// buildEntityRows — flatten all subjects into a list of entity objects (level 1 rows).
function buildEntityRows(subjects, filterSubject) {
  const result = [];
  const list = filterSubject ? [filterSubject] : subjects;
  list.forEach(subj => {
    const authored = SUBJECT_DETAILS[subj.id];
    if (authored) {
      authored.subItems.forEach(si => result.push({
        id: si.id, name: si.name, meta: si.meta || "", subject: subj,
        charges: si.charges, holders: si.holders || [],
        propertyTypes: si.propertyTypes || [], subItem: si,
      }));
    } else {
      const sing = UNIT_SINGULAR[subj.unit] || subj.unit || "פריט";
      Array.from({ length: subj.count }, (_, i) => {
        const id = `${subj.id}-${i + 1}`;
        const ch = { id: `${id}-c`, name: subj.name, balance: 0 };
        const si = { id, name: `${sing} ${i + 1}`, meta: subj.name, charges: [ch] };
        result.push({ id, name: si.name, meta: subj.name, subject: subj, charges: [ch], holders: [], propertyTypes: [], subItem: si });
      });
    }
  });
  return result;
}

// PropertyTypesModal — shows the property-type breakdown for a single entity.
function PropertyTypesModal({ entity, onClose }) {
  if (!entity) return null;
  const types = entity.propertyTypes || [];
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,38,50,.42)", zIndex: 7000 }}/>
      <div className="mu-rise" role="dialog" aria-modal="true" aria-labelledby="pt-modal-title"
        onClick={e => e.stopPropagation()}
        style={{ position: "fixed", inset: 0, zIndex: 7001, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-lg)", width: "100%", maxWidth: 480, overflow: "hidden" }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", background: "linear-gradient(135deg,var(--teal-700),var(--teal-600))", color: "#fff" }}>
            <div>
              <div id="pt-modal-title" style={{ fontSize: 16, fontWeight: 700 }}>סוגי נכס — {entity.name}</div>
              <div className="num" style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 2 }}>פיזי {entity.id}</div>
            </div>
            <button data-focusring onClick={onClose} aria-label="סגור"
              style={{ width: 32, height: 32, display: "grid", placeItems: "center", border: "none",
                background: "rgba(255,255,255,.18)", borderRadius: 8, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
          {/* content */}
          <div style={{ padding: 20 }}>
            {types.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--ink-400)", padding: "24px 0", fontSize: 13 }}>
                אין נתוני סיווג לנכס זה
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--ink-50)" }}>
                    {["קוד", "תיאור", "שטח / כמות"].map((h, i) => (
                      <th key={i} style={{ padding: "8px 12px", fontWeight: 600, color: "var(--ink-muted)",
                        textAlign: i === 2 ? "end" : "start", borderBottom: "1px solid var(--ink-200)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {types.map((t, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--ink-100)", background: i % 2 === 0 ? "#fff" : "var(--ink-50)" }}>
                      <td className="num" style={{ padding: "10px 12px", fontWeight: 700, color: "var(--teal-700)" }}>{t.code}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--ink-800)" }}>{t.desc}</td>
                      <td className="num" style={{ padding: "10px 12px", textAlign: "end", color: "var(--ink-700)", fontWeight: 600 }}>
                        {t.area != null ? `${t.area} ${t.unit}` : t.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {types.length > 1 && (() => {
                  const totalArea = types.filter(t => t.area != null).reduce((a, t) => a + t.area, 0);
                  return totalArea > 0 ? (
                    <tfoot>
                      <tr style={{ background: "var(--teal-50)" }}>
                        <td colSpan={2} style={{ padding: "9px 12px", fontWeight: 700, color: "var(--teal-700)" }}>סה"כ שטח</td>
                        <td className="num" style={{ padding: "9px 12px", textAlign: "end", fontWeight: 700, color: "var(--teal-700)" }}>
                          {totalArea} מ"ר
                        </td>
                      </tr>
                    </tfoot>
                  ) : null;
                })()}
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// HoldersHistoryModal — shows all historical holders for an entity.
// Each holder has a "פתח כרטיס יתרה" button to navigate to their account.
function HoldersHistoryModal({ entity, onClose, onOpenHolder }) {
  if (!entity) return null;
  const holders = entity.holders || [];
  const currentHolder = holders.find(h => h.current);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,38,50,.42)", zIndex: 7000 }}/>
      <div className="mu-rise" role="dialog" aria-modal="true" aria-labelledby="hh-modal-title"
        onClick={e => e.stopPropagation()}
        style={{ position: "fixed", inset: 0, zIndex: 7001, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-lg)", width: "100%", maxWidth: 540, overflow: "hidden" }}>
          {/* header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", background: "linear-gradient(135deg,var(--teal-700),var(--teal-600))", color: "#fff" }}>
            <div>
              <div id="hh-modal-title" style={{ fontSize: 16, fontWeight: 700 }}>מחזיקים — {entity.name}</div>
              <div className="num" style={{ fontSize: 12, color: "rgba(255,255,255,.75)", marginTop: 2 }}>
                פיזי {entity.id} · {holders.length} מחזיקים
              </div>
            </div>
            <button data-focusring onClick={onClose} aria-label="סגור"
              style={{ width: 32, height: 32, display: "grid", placeItems: "center", border: "none",
                background: "rgba(255,255,255,.18)", borderRadius: 8, cursor: "pointer", color: "#fff", fontSize: 16 }}>✕</button>
          </div>
          {/* holder list */}
          <div style={{ padding: "12px 0" }}>
            {holders.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--ink-400)", padding: "24px", fontSize: 13 }}>אין נתוני מחזיקים</div>
            ) : holders.map((h, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px",
                background: h.current ? "var(--teal-50)" : "#fff",
                borderBottom: i < holders.length - 1 ? "1px solid var(--ink-100)" : "none" }}>
                {/* avatar */}
                <div style={{ width: 40, height: 40, borderRadius: 999, flex: "none", display: "grid", placeItems: "center",
                  fontSize: 13, fontWeight: 700,
                  background: h.current ? "var(--teal-500)" : "var(--ink-100)",
                  color: h.current ? "#fff" : "var(--ink-muted)" }}>
                  {h.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                </div>
                {/* info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-800)" }}>{h.name}</span>
                    {h.current
                      ? <Chip tone="green" style={{ fontSize: 10 }}>מחזיק נוכחי</Chip>
                      : <Chip tone="gray" style={{ fontSize: 10 }}>קודם</Chip>}
                    {h.reason && <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>· {h.reason}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
                    משלם <span className="num">{h.payerNo}</span>
                    {" · "}{h.from} – {h.to || "היום"}
                  </div>
                </div>
                {/* action */}
                <button data-focusring onClick={() => { onOpenHolder && onOpenHolder(h); onClose(); }}
                  title={`פתח כרטיס יתרה של ${h.name}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, flex: "none",
                    border: "1px solid var(--teal-300)", background: h.current ? "var(--teal-600)" : "var(--white)",
                    color: h.current ? "#fff" : "var(--teal-700)", borderRadius: 999,
                    padding: "6px 12px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 12, fontWeight: 600,
                    transition: "all .13s" }}>
                  <Icon name="user" size={13} color={h.current ? "#fff" : "var(--teal-600)"}/>
                  כרטיס יתרה
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// AllEntitiesView — 3-level inline accordion presented as a proper table.
// Level 1: entity row with named columns (matches legacy MASTER screen layout).
// Level 2: PropertyContextPanel + charges sub-table, inline below the row.
// Level 3: TxnTable per charge, inline below the charge row.
function AllEntitiesView({ subjects, filterSubject, density, txnTypes, onAction, onOpenWide }) {
  const [openEntity, setOpenEntity] = useState(null);
  const [openCharge, setOpenCharge] = useState(null);
  const [typesModal, setTypesModal] = useState(null);   // entity for property-types modal
  const [holdersModal, setHoldersModal] = useState(null); // entity for holders modal
  const compact = density === "compact";
  const entities = buildEntityRows(subjects, filterSubject);
  const grandTotal = entities.reduce((sum, e) => sum + e.charges.reduce((a, c) => a + chargeBalance(c), 0), 0);
  const cellPad = compact ? "7px 10px" : "10px 12px";

  const toggleEntity = (id) => {
    if (openEntity === id) { setOpenEntity(null); setOpenCharge(null); }
    else { setOpenEntity(id); setOpenCharge(null); }
  };

  // ── Level 1 sort + drag + visibility ──
  const { sortCol, sortDir, toggleSort, applySort } = useColSort();
  const { hidden: l1Hidden, toggleCol: l1ToggleCol } = useColVisibility();
  // ── Level 2 sort + drag ──
  const { sortCol: l2SortCol, sortDir: l2SortDir, toggleSort: l2Toggle, applySort: l2Sort } = useColSort();
  const L2_MID = [
    { key:"idx2",  label:"רץ",          align:"center", sortable:false },
    { key:"code",  label:"שירות",       align:"center", sortable:true },
    { key:"name",  label:"תיאור שירות", align:"start",  sortable:true },
    { key:"src",   label:"ש.מקור",      align:"center", sortable:true },
    { key:"disc",  label:"הנחה",        align:"center", sortable:true },
    { key:"dname", label:"תיאור הנחה",  align:"start",  sortable:false },
    { key:"arr",   label:"הסדר",        align:"center", sortable:true },
    { key:"aname", label:"תיאור הסדר",  align:"start",  sortable:false },
    { key:"track", label:"מעקב",        align:"center", sortable:false },
    { key:"paid",  label:"תשלומים",     align:"end",    sortable:true },
    { key:"charg", label:"חיובים",      align:"end",    sortable:true },
    { key:"bal",   label:"יתרה",        align:"end",    sortable:true },
  ];
  const { order: l2ColOrder, dragOver: l2DragOver, handlers: l2DragH } = useColOrder(L2_MID.length);
  const l2OrderedMid = l2ColOrder.map(i => L2_MID[i]);
  const l2ColCount = 1 + L2_MID.length; // expand + mid

  // Level 2 sort value getter
  const l2SortVal = (c, rows, key) => {
    if (key === "code")  return c.code || 0;
    if (key === "name")  return c.name || "";
    if (key === "src")   return c.srcYear || 0;
    if (key === "disc")  return c.discount || 0;
    if (key === "arr")   return c.arrangement || 0;
    if (key === "paid")  return rows.filter(r => r.dc === "ז").reduce((a,r) => a + (r.nominal||r.addon||0), 0);
    if (key === "charg") return rows.filter(r => r.dc === "ח").reduce((a,r) => a + (r.nominal||r.addon||0), 0);
    if (key === "bal")   return chargeBalance(c);
    return 0;
  };

  // Draggable middle columns (idx fixed-left, expand fixed-right)
  const L1_MID = [
    { key: "code",   label: "נושא",        w: "52px",  align: "center", sortable: true },
    { key: "id",     label: "מס' מזהה",   w: "96px",  align: "end",    sortable: true },
    { key: "name",   label: "תיאור נושא",  w: "130px", align: "start",  sortable: true },
    { key: "meta",   label: "פרטי אב",     w: "auto",  align: "start",  sortable: true },
    { key: "types",  label: "סוגי נכס",    w: "80px",  align: "center", sortable: true },
    { key: "holder", label: "מחזיק נוכחי", w: "88px",  align: "center", sortable: false },
    { key: "bal",    label: "יתרה",         w: "110px", align: "end",    sortable: true },
    { key: "docs",   label: "מסמכים",       w: "72px",  align: "center", sortable: false },
  ];
  const { order: colOrder, dragOver: l1DragOver, handlers: l1DragH } = useColOrder(L1_MID.length);
  const orderedMid = colOrder.map(i => L1_MID[i]).filter(c => !l1Hidden.has(c.key));
  const allCols = [{ key:"idx", label:"רץ", w:"40px", align:"center" }, ...orderedMid, { key:"expand", label:"", w:"40px", align:"center" }];
  const colCount = allCols.length;

  // Sort logic for level-1 entities
  const l1SortVal = (e, key) => {
    if (key === "code") return e.subject.code || 0;
    if (key === "id")   return parseInt(e.id.replace(/\D/g,"")) || 0;
    if (key === "name") return e.subject.name || "";
    if (key === "meta") return e.name || "";
    if (key === "types") return (e.propertyTypes || []).length;
    if (key === "bal")  return e.charges.reduce((a, c) => a + chargeBalance(c), 0);
    return 0;
  };
  const sortedEntities = applySort(entities, (e, col) => l1SortVal(e, col));

  // Cell renderer per column key
  const cellOf = {
    idx:    (entity, i) => <td key="idx" className="num" style={{ padding: cellPad, textAlign: "center", color: "var(--ink-400)", fontSize: 11, fontWeight: 600 }}>{i + 1}</td>,
    code:   (entity, i, isOpen) => (
      <td key="code" style={{ padding: cellPad, textAlign: "center" }}>
        <span className="num" style={{ background: isOpen ? "var(--teal-100)" : "var(--ink-100)", color: isOpen ? "var(--teal-800)" : "var(--ink-600)", borderRadius: 5, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>
          {String(entity.subject.code || "—").padStart(2, "0")}
        </span>
      </td>),
    id:     (entity, i, isOpen) => (
      <td key="id" className="num" style={{ padding: cellPad, textAlign: "end", fontWeight: 700, color: isOpen ? "var(--teal-700)" : "var(--ink-700)" }}>
        {entity.id.replace(/\D/g,"") || entity.id}
      </td>),
    name:   (entity, i, isOpen) => (
      <td key="name" style={{ padding: cellPad }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, overflow: "hidden" }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, flex: "none", display: "grid", placeItems: "center", background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))" }}>
            <Icon name={entity.subject.icon} size={12} color="#fff"/>
          </div>
          <span style={{ fontWeight: 600, color: "var(--ink-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entity.subject.name}</span>
        </div>
      </td>),
    meta:   (entity) => (
      <td key="meta" style={{ padding: cellPad }}>
        <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--ink-muted)", fontSize: 12 }}>
          {entity.name}{entity.meta && entity.meta !== entity.subject.name ? ` · ${entity.meta}` : ""}
        </div>
      </td>),
    types:  (entity) => (
      <td key="types" style={{ padding: cellPad, textAlign: "center" }}>
        <button onClick={e => { e.stopPropagation(); setTypesModal(entity); }} title="הצג סוגי נכס"
          style={{ display: "inline-flex", alignItems: "center", gap: 4,
            border: entity.propertyTypes.length ? "1px solid var(--teal-200)" : "1px solid var(--ink-200)",
            background: entity.propertyTypes.length ? "var(--teal-50)" : "var(--ink-50)",
            color: entity.propertyTypes.length ? "var(--teal-700)" : "var(--ink-400)",
            borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 12, fontWeight: 600 }}>
          <span className="num">{entity.propertyTypes.length || "—"}</span>
          {entity.propertyTypes.length > 0 && <Icon name="chevdown" size={11} color="var(--teal-500)"/>}
        </button>
      </td>),
    holder: (entity) => {
      const current = entity.holders.find(h => h.current);
      const hasH = entity.holders.length > 0;
      return (
        <td key="holder" style={{ padding: cellPad, textAlign: "center" }}>
          <button onClick={e => { e.stopPropagation(); if (hasH) setHoldersModal(entity); }}
            aria-label={current ? `${current.name} — לחץ לפרטים` : "ללא מחזיק נוכחי"}
            style={{ width: 32, height: 32, display: "grid", placeItems: "center",
              border: current ? "1.5px solid var(--ok-fg)" : "1.5px solid var(--ink-300)",
              background: current ? "var(--ok-bg)" : "transparent",
              borderRadius: 8, cursor: hasH ? "pointer" : "default", transition: "all .13s" }}>
            {current ? <span style={{ fontSize: 16, color: "var(--ok-fg)", fontWeight: 800, lineHeight: 1 }}>✓</span>
              : <Icon name="history" size={14} color="var(--ink-400)"/>}
          </button>
        </td>);},
    bal:    (entity, i, isOpen) => {
      const bal = entity.charges.reduce((a, c) => a + chargeBalance(c), 0);
      return (
        <td key="bal" className="num" style={{ padding: cellPad, textAlign: "end", fontWeight: 700, color: bal > 0 ? "var(--ink-900)" : "var(--ok-fg)" }}>
          {bal > 0 ? `₪${fmt(bal)}` : "0 ✓"}
        </td>);},
    docs:   (entity) => {
      const btns = [{ icon: "docs", label: "מסמכים" }, { icon: "notes", label: "הערות" }];
      return (
        <td key="docs" style={{ padding: cellPad, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
            {btns.map(btn => (
              <button key={btn.icon} onClick={e => { e.stopPropagation(); onAction && onAction({ id: btn.icon, label: btn.label }); }}
                title={btn.label} style={{ width: 24, height: 24, display: "grid", placeItems: "center",
                  border: "1px solid var(--ink-200)", background: "var(--white)", borderRadius: 6, cursor: "pointer" }}>
                <Icon name={btn.icon} size={12} color="var(--ink-500)"/>
              </button>
            ))}
          </div>
        </td>);},
    expand: (entity, i, isOpen) => (
      <td key="expand" style={{ padding: cellPad, textAlign: "center" }}>
        <Icon name="chevdown" size={15} color="var(--ink-400)"
          style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s", display: "block", margin: "0 auto" }}/>
      </td>),
  };

  return (
    <>
    {/* column picker bar */}
    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 8 }}>
      <ColumnPicker cols={L1_MID} hidden={l1Hidden} onToggle={l1ToggleCol}/>
    </div>
    <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--ink-200)" }}>
      <table style={{ width: "100%", minWidth: 860, borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed" }}>
        <colgroup>
          {allCols.map((c, i) => <col key={i} style={{ width: c.w === "auto" ? undefined : c.w }}/>)}
        </colgroup>
        <thead>
          <tr style={{ background: "linear-gradient(135deg,var(--teal-700),var(--teal-800))", position: "sticky", top: 0, zIndex: 2 }}>
            <th style={{ textAlign:"center", padding:"10px 10px", fontSize:11.5, fontWeight:700, color:"rgba(255,255,255,.95)", whiteSpace:"nowrap" }}>רץ</th>
            {orderedMid.map((c, ci) => (
              <SortTh key={c.key} colKey={c.key} label={c.label} align={c.align}
                sortable={c.sortable} sortCol={sortCol} sortDir={sortDir} onSort={toggleSort}
                dragHandlers={l1DragH(colOrder[ci])} isDragOver={l1DragOver === colOrder[ci]}/>
            ))}
            <th style={{ width:"40px" }}/>
          </tr>
        </thead>
        <tbody>
          {sortedEntities.map((entity, i) => {
            const isOpen = openEntity === entity.id;
            const entityBalance = entity.charges.reduce((a, c) => a + chargeBalance(c), 0);
            const rowBg = isOpen ? "var(--teal-50)" : i % 2 === 0 ? "#fff" : "var(--ink-50)";

            return (
              <React.Fragment key={entity.id}>
                {/* ── Level 1: entity row — cells rendered via cellOf in colOrder ── */}
                <tr onClick={() => toggleEntity(entity.id)}
                  style={{ cursor: "pointer", background: rowBg, borderBottom: "1px solid var(--ink-100)", transition: "background .12s" }}>
                  {cellOf.idx(entity, i)}
                  {orderedMid.map(c => cellOf[c.key](entity, i, isOpen))}
                  {cellOf.expand(entity, i, isOpen)}
                </tr>

                {/* ── Level 2: full-width sub-panel (legacy-style) ── */}
                {isOpen && (
                  <tr>
                    <td colSpan={colCount} style={{ padding: 0, borderBottom: "2px solid var(--teal-500)" }}>
                      <div className="mu-rise" style={{ background: "#fafcfd" }}>

                        {/* Sub-header: entity identity + action toolbar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
                          background: "linear-gradient(135deg,var(--teal-800),var(--teal-700))", color: "#fff" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>יתרות לנכס — </span>
                            <span className="num" style={{ fontSize: 14, fontWeight: 700 }}>{entity.id}</span>
                            <span style={{ fontSize: 13, color: "rgba(255,255,255,.75)", marginInlineStart: 8 }}>
                              · סוגי שירות ({entity.charges.length})
                            </span>
                          </div>
                          {/* toolbar */}
                          {[
                            { icon: "print", label: "הדפסה" }, { icon: "scan", label: "סריקת מסמכים" },
                            { icon: "notes", label: "הערות" }, { icon: "sigma", label: "סיכום" },
                            { icon: "card", label: "עדכון הסדר" }, { icon: "receipt", label: "זיכוי חיוב" },
                            { icon: "wallet", label: "הנחות" }, { icon: "user", label: "מחזיקים" },
                          ].map(btn => (
                            <button key={btn.icon} data-focusring
                              onClick={e => { e.stopPropagation(); onAction && onAction({ id: btn.icon, label: btn.label }); }}
                              title={btn.label}
                              style={{ width: 30, height: 30, display: "grid", placeItems: "center",
                                border: "1px solid rgba(255,255,255,.25)", background: "rgba(255,255,255,.12)",
                                borderRadius: 7, cursor: "pointer", flexShrink: 0 }}>
                              <Icon name={btn.icon} size={14} color="#fff"/>
                            </button>
                          ))}
                          {onOpenWide && (
                            <button data-focusring onClick={e => { e.stopPropagation(); onOpenWide(entity.id); }}
                              title={`תנועות מלאות לפיזי ${entity.id}`}
                              style={{ display: "inline-flex", alignItems: "center", gap: 5,
                                border: "1px solid rgba(255,255,255,.4)", background: "rgba(255,255,255,.15)",
                                color: "#fff", borderRadius: 7, padding: "5px 10px", cursor: "pointer",
                                fontFamily: "var(--font)", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                              <Icon name="receipt" size={13} color="#fff"/> תנועות מלאות — {entity.id}
                            </button>
                          )}
                        </div>

                        {/* Level 2 table — service types with financial columns */}
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", minWidth: 840, borderCollapse: "collapse", fontSize: 12.5, tableLayout: "fixed" }}>
                            <colgroup>
                              <col style={{ width: "36px" }}/>{/* expand */}
                              <col style={{ width: "36px" }}/>{/* רץ */}
                              <col style={{ width: "52px" }}/>{/* שירות */}
                              <col style={{ width: "140px" }}/>{/* תיאור שירות */}
                              <col style={{ width: "68px" }}/>{/* ש.מקור */}
                              <col style={{ width: "52px" }}/>{/* הנחה */}
                              <col style={{ width: "120px" }}/>{/* תיאור הנחה */}
                              <col style={{ width: "52px" }}/>{/* הסדר */}
                              <col style={{ width: "auto" }}/>{/* תיאור הסדר */}
                              <col style={{ width: "52px" }}/>{/* מעקב */}
                              <col style={{ width: "110px" }}/>{/* תשלומים */}
                              <col style={{ width: "110px" }}/>{/* חיובים */}
                              <col style={{ width: "110px" }}/>{/* יתרה */}
                            </colgroup>
                            <thead>
                              <tr style={{ background: "var(--ink-100)", borderBottom: "1px solid var(--ink-200)" }}>
                                <th style={{ width:36, padding:"7px 8px" }}/>{/* expand — fixed */}
                                {l2OrderedMid.map((c, ci) => (
                                  <SortTh key={c.key} colKey={c.key} label={c.label} align={c.align}
                                    sortable={c.sortable} sortCol={l2SortCol} sortDir={l2SortDir} onSort={l2Toggle}
                                    dragHandlers={l2DragH(l2ColOrder[ci])} isDragOver={l2DragOver === l2ColOrder[ci]}
                                    style={{ background:"transparent", color:"var(--ink-700)", borderInlineEnd: l2DragOver === l2ColOrder[ci] ? "2px solid var(--teal-400)" : "2px solid transparent" }}/>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                // Sort charges for Level 2
                                const sorted2 = l2SortCol ? l2Sort(entity.charges, (c, key) => {
                                  const rows = c.txns ? (TXNS[c.txns] || []) : [];
                                  return l2SortVal(c, rows, key);
                                }) : entity.charges;
                                return sorted2.map((c, ci) => {
                                const txnRows = c.txns ? (TXNS[c.txns] || []) : [];
                                const bal = chargeBalance(c);
                                const paid = txnRows.filter(r => r.dc === "ז").reduce((a, r) => a + (r.nominal || r.addon || 0), 0);
                                const charged = txnRows.filter(r => r.dc === "ח").reduce((a, r) => a + (r.nominal || r.addon || 0), 0);
                                const isChargeOpen = openCharge === c.id;
                                const hasTxns = txnRows.length > 0;
                                const rowBg = isChargeOpen ? "var(--teal-50)" : ci % 2 === 0 ? "#fff" : "var(--ink-50)";
                                // Cell renderer for L2
                                const l2Cell = {
                                  idx2:  () => <td key="idx2" className="num" style={{ padding:"8px 10px", textAlign:"center", color:"var(--ink-400)", fontSize:11 }}>{ci + 1}</td>,
                                  code:  () => <td key="code" style={{ padding:"8px 10px", textAlign:"center" }}><span className="num" style={{ background:"var(--teal-50)", color:"var(--teal-700)", borderRadius:5, padding:"1px 7px", fontSize:11, fontWeight:700 }}>{String(c.code || ci+1).padStart(2,"0")}</span></td>,
                                  name:  () => <td key="name" style={{ padding:"8px 10px", fontWeight:600, color:isChargeOpen?"var(--teal-700)":"var(--ink-800)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</td>,
                                  src:   () => <td key="src" className="num" style={{ padding:"8px 10px", textAlign:"center", color:"var(--ink-muted)", fontSize:11 }}>{c.srcYear||"—"}</td>,
                                  disc:  () => <td key="disc" className="num" style={{ padding:"8px 10px", textAlign:"center", color:c.discount?"var(--ok-fg)":"var(--ink-300)", fontWeight:c.discount?700:400 }}>{c.discount?`${c.discount}%`:"—"}</td>,
                                  dname: () => <td key="dname" style={{ padding:"8px 10px", color:"var(--ink-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:11 }}>{c.discountDesc||""}</td>,
                                  arr:   () => <td key="arr" className="num" style={{ padding:"8px 10px", textAlign:"center", color:c.arrangement?"var(--warn-fg)":"var(--ink-300)", fontWeight:c.arrangement?700:400 }}>{c.arrangement?`${c.arrangement}%`:"—"}</td>,
                                  aname: () => <td key="aname" style={{ padding:"8px 10px", color:"var(--ink-muted)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:11 }}>{c.arrangementDesc||""}</td>,
                                  track: () => <td key="track" style={{ padding:"8px 10px", textAlign:"center" }}>{c.tracking&&<span style={{ color:"var(--ok-fg)", fontWeight:700, fontSize:14 }}>✓</span>}</td>,
                                  paid:  () => <td key="paid" className="num" style={{ padding:"8px 10px", textAlign:"end", color:"var(--ok-fg)", fontWeight:600 }}>{paid>0?fmt(paid):"—"}</td>,
                                  charg: () => <td key="charg" className="num" style={{ padding:"8px 10px", textAlign:"end", color:"var(--ink-700)", fontWeight:600 }}>{charged>0?fmt(charged):"—"}</td>,
                                  bal:   () => <td key="bal" className="num" style={{ padding:"8px 10px", textAlign:"end", fontWeight:700, color:bal>0?"var(--red)":"var(--ok-fg)" }}>{bal>0?fmt(bal):"0 ✓"}</td>,
                                };
                                return (
                                  <React.Fragment key={c.id}>
                                    <tr onClick={() => hasTxns && setOpenCharge(isChargeOpen ? null : c.id)}
                                      style={{ cursor: hasTxns ? "pointer" : "default", background: rowBg, borderBottom: "1px solid var(--ink-100)", transition: "background .12s" }}>
                                      {/* expand — fixed left */}
                                      <td style={{ textAlign:"center", padding:"8px 6px" }}>
                                        {hasTxns && <Icon name="chevdown" size={13} color="var(--ink-400)"
                                          style={{ display:"block", margin:"0 auto", transform:isChargeOpen?"rotate(180deg)":"none", transition:"transform .18s" }}/>}
                                      </td>
                                      {l2OrderedMid.map(col => l2Cell[col.key]())}
                                    </tr>
                                    {/* ── Level 3: transactions inline ── */}
                                    {isChargeOpen && (
                                      <tr>
                                        <td colSpan={13} style={{ padding: 0, background: "var(--teal-50)", borderBottom: "1px solid var(--teal-200)" }}>
                                          <div className="mu-rise">
                                            <TxnTable rows={txnRows} types={txnTypes} compact={compact}/>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              });})()}
                            </tbody>
                          </table>
                        </div>

                        {/* Holder chain — compact strip below the table */}
                        {entity.holders.length > 0 && (
                          <div style={{ padding: "8px 16px 12px", borderTop: "1px solid var(--ink-200)" }}>
                            <PropertyContextPanel subItem={entity.subItem} subject={entity.subject}
                              totalBalance={entityBalance} onAction={onAction}/>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ background: "linear-gradient(135deg,var(--teal-600),var(--teal-800))" }}>
            <td colSpan={7} style={{ padding: "12px 14px", color: "#fff", fontWeight: 700, fontSize: 14 }}>
              סך הכל · {entities.length} ישויות
            </td>
            <td className="num" style={{ padding: "12px 14px", textAlign: "end", color: "#fff", fontWeight: 700, fontSize: 15 }}>
              ₪{fmt(grandTotal)}
            </td>
            <td colSpan={2}/>
          </tr>
        </tfoot>
      </table>
    </div>

    {/* ── modals ── */}
    <PropertyTypesModal entity={typesModal} onClose={() => setTypesModal(null)}/>
    <HoldersHistoryModal entity={holdersModal} onClose={() => setHoldersModal(null)}
      onOpenHolder={h => window.muToast(`פותח כרטיס יתרה — ${h.name} · ${h.payerNo}`, "user")}/>
    </>
  );
}

export { SubjectStrip, SubjectDrillDown, AllEntitiesView, BalancesTable, TxnTable };
