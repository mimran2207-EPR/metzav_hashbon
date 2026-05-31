import React, { useState, useRef } from 'react';
import { Icon } from './icons.jsx';
import { Chip, Segmented } from './ui.jsx';
import { fmt, SUBJECT_DETAILS, TXNS, QUICK_ACTIONS } from './data.jsx';
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
        background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))", boxShadow: "0 3px 8px rgba(42,167,184,.3)" }}>
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
                boxShadow: "0 1px 4px rgba(42,167,184,.10)" }}>
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
          background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))", boxShadow: "0 3px 8px rgba(42,167,184,.3)" }}>
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
        <span style={{ fontSize: 12, color: "var(--ink-muted)" }}><span className="num">{filtered.length}</span> שורות</span>
        <button data-focusring title="ייצוא" onClick={() => window.muToast("מייצא תנועות ל-Excel", "download")}
          style={{ border: "1px solid var(--ink-200)", background: "#fff", borderRadius: 8, padding: "5px 8px", cursor: "pointer", display: "grid", placeItems: "center" }}>
          <Icon name="download" size={15} color="var(--ink-600)"/>
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "var(--ink-50)", position: "sticky", top: 0 }}>{cols.map((c, i) => <th key={i} style={{ textAlign: align[i], padding: "8px 12px", fontSize: 13, fontWeight: 600, color: "var(--ink-muted)", borderBottom: "1px solid var(--ink-200)", whiteSpace: "nowrap" }}>{c}</th>)}</tr>
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
                <td className="num" style={{ padding: compact ? "6px 12px" : "9px 12px", color: "var(--ink-muted)", whiteSpace: "nowrap" }}>{r.ref}</td>
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

// buildEntityRows — flatten all subjects into a list of entity objects (level 1 rows).
function buildEntityRows(subjects, filterSubject) {
  const result = [];
  const list = filterSubject ? [filterSubject] : subjects;
  list.forEach(subj => {
    const authored = SUBJECT_DETAILS[subj.id];
    if (authored) {
      authored.subItems.forEach(si => result.push({ id: si.id, name: si.name, meta: si.meta || "", subject: subj, charges: si.charges, holders: si.holders || [], subItem: si }));
    } else {
      const sing = UNIT_SINGULAR[subj.unit] || subj.unit || "פריט";
      Array.from({ length: subj.count }, (_, i) => {
        const id = `${subj.id}-${i + 1}`;
        const ch = { id: `${id}-c`, name: subj.name, balance: 0 };
        const si = { id, name: `${sing} ${i + 1}`, meta: subj.name, charges: [ch] };
        result.push({ id, name: si.name, meta: subj.name, subject: subj, charges: [ch], holders: [], subItem: si });
      });
    }
  });
  return result;
}

// AllEntitiesView — 3-level inline accordion presented as a proper table.
// Level 1: entity row with named columns (matches legacy MASTER screen layout).
// Level 2: PropertyContextPanel + charges sub-table, inline below the row.
// Level 3: TxnTable per charge, inline below the charge row.
function AllEntitiesView({ subjects, filterSubject, density, txnTypes, onAction, onOpenWide }) {
  const [openEntity, setOpenEntity] = useState(null);
  const [openCharge, setOpenCharge] = useState(null);
  const compact = density === "compact";
  const entities = buildEntityRows(subjects, filterSubject);
  const grandTotal = entities.reduce((sum, e) => sum + e.charges.reduce((a, c) => a + chargeBalance(c), 0), 0);
  const cellPad = compact ? "7px 10px" : "10px 12px";

  const toggleEntity = (id) => {
    if (openEntity === id) { setOpenEntity(null); setOpenCharge(null); }
    else { setOpenEntity(id); setOpenCharge(null); }
  };

  // Column definitions — in RTL table the first col is rightmost visually
  const COLS = [
    { label: "רץ",          w: 44,  align: "center", cls: "num" },
    { label: "נושא",        w: 56,  align: "center" },
    { label: "תיאור נושא",  w: null,align: "start" },
    { label: "זיהוי פיזי",  w: 110, align: "start",  cls: "num" },
    { label: "פרטי אב",     w: 230, align: "start" },
    { label: "נ.מ.",         w: 52,  align: "center", cls: "num" },
    { label: "נוחי",         w: 52,  align: "center" },
    { label: "יתרה",         w: 120, align: "end",    cls: "num" },
    { label: "מסמכים",       w: 76,  align: "center" },
    { label: "",             w: 44,  align: "center" },
  ];

  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid var(--ink-200)" }}>
      <table style={{ width: "100%", minWidth: 860, borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "linear-gradient(135deg,var(--teal-700),var(--teal-800))", position: "sticky", top: 0, zIndex: 2 }}>
            {COLS.map((c, i) => (
              <th key={i} style={{ textAlign: c.align, padding: "10px 12px", fontSize: 12, fontWeight: 700,
                color: "rgba(255,255,255,.95)", whiteSpace: "nowrap", width: c.w || undefined }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entities.map((entity, i) => {
            const isOpen = openEntity === entity.id;
            const entityBalance = entity.charges.reduce((a, c) => a + chargeBalance(c), 0);
            const isPaid = entityBalance === 0;
            const rowBg = isOpen ? "var(--teal-50)" : i % 2 === 0 ? "#fff" : "var(--ink-50)";

            return (
              <React.Fragment key={entity.id}>
                {/* ── Level 1: entity row ── */}
                <tr onClick={() => toggleEntity(entity.id)}
                  style={{ cursor: "pointer", background: rowBg, borderBottom: "1px solid var(--ink-100)", transition: "background .12s" }}>

                  {/* רץ */}
                  <td className="num" style={{ padding: cellPad, textAlign: "center", color: "var(--ink-400)", fontWeight: 600, fontSize: 12 }}>
                    {i + 1}
                  </td>
                  {/* נושא code */}
                  <td style={{ padding: cellPad, textAlign: "center" }}>
                    <span className="num" style={{ background: isOpen ? "var(--teal-100)" : "var(--ink-100)",
                      color: isOpen ? "var(--teal-800)" : "var(--ink-600)", borderRadius: 5, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>
                      {String(entity.subject.code || "—").padStart(2, "0")}
                    </span>
                  </td>
                  {/* תיאור נושא */}
                  <td style={{ padding: cellPad }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, flex: "none", display: "grid", placeItems: "center",
                        background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))" }}>
                        <Icon name={entity.subject.icon} size={13} color="#fff"/>
                      </div>
                      <span style={{ fontWeight: 600, color: "var(--ink-800)" }}>{entity.subject.name}</span>
                    </div>
                  </td>
                  {/* זיהוי פיזי */}
                  <td className="num" style={{ padding: cellPad, fontWeight: 600, color: isOpen ? "var(--teal-700)" : "var(--ink-700)" }}>
                    {entity.id}
                  </td>
                  {/* פרטי אב */}
                  <td style={{ padding: cellPad, color: "var(--ink-muted)", fontSize: 12,
                    maxWidth: 230, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entity.name}{entity.meta && entity.meta !== entity.subject.name ? ` · ${entity.meta}` : ""}
                  </td>
                  {/* נ.מ. */}
                  <td className="num" style={{ padding: cellPad, textAlign: "center", color: "var(--ink-muted)" }}>
                    {entity.charges.length}
                  </td>
                  {/* נוחי */}
                  <td style={{ padding: cellPad, textAlign: "center" }}>
                    {isPaid && <span style={{ color: "var(--ok-fg)", fontSize: 15, fontWeight: 700 }}>✓</span>}
                  </td>
                  {/* יתרה */}
                  <td className="num" style={{ padding: cellPad, textAlign: "end", fontWeight: 700,
                    color: isPaid ? "transparent" : "var(--ink-900)" }}>
                    {isPaid ? "" : `₪${fmt(entityBalance)}`}
                  </td>
                  {/* מסמכים */}
                  <td style={{ padding: cellPad, textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      {[{ icon: "docs", tip: "מסמכים" }, { icon: "notes", tip: "הערות" }].map(btn => (
                        <button key={btn.icon} onClick={e => { e.stopPropagation(); window.muToast(btn.tip, btn.icon); }}
                          style={{ width: 26, height: 26, display: "grid", placeItems: "center",
                            border: "1px solid var(--ink-200)", background: "var(--white)", borderRadius: 6, cursor: "pointer" }}>
                          <Icon name={btn.icon} size={12} color="var(--ink-500)"/>
                        </button>
                      ))}
                    </div>
                  </td>
                  {/* expand */}
                  <td style={{ padding: cellPad, textAlign: "center" }}>
                    <Icon name="chevdown" size={15} color="var(--ink-400)"
                      style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s", display: "block", margin: "0 auto" }}/>
                  </td>
                </tr>

                {/* ── Expanded body: context panel + charges ── */}
                {isOpen && (
                  <tr>
                    <td colSpan={COLS.length} style={{ padding: 0, background: "#fff", borderBottom: "2px solid var(--teal-400)" }}>
                      <div className="mu-rise">
                        <PropertyContextPanel subItem={entity.subItem} subject={entity.subject}
                          totalBalance={entityBalance} onAction={onAction}/>

                        {/* ── Level 2: charges sub-table ── */}
                        <div style={{ padding: "0 16px 16px" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-muted)", marginBottom: 8 }}>
                            סוגי חיוב ({entity.charges.length})
                          </div>
                          <div style={{ borderRadius: 10, border: "1px solid var(--ink-200)", overflow: "hidden" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                              <thead>
                                <tr style={{ background: "var(--ink-100)" }}>
                                  {["סוג חיוב", "תנועות", "יתרה", ""].map((h, j) => (
                                    <th key={j} style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "var(--ink-muted)",
                                      textAlign: j === 2 ? "end" : j === 3 ? "center" : "start", whiteSpace: "nowrap" }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {entity.charges.map((c, ci) => {
                                  const bal = chargeBalance(c);
                                  const txnRows = c.txns ? (TXNS[c.txns] || []) : [];
                                  const isChargeOpen = openCharge === c.id;
                                  const hasTxns = txnRows.length > 0;
                                  return (
                                    <React.Fragment key={c.id}>
                                      <tr onClick={() => hasTxns && setOpenCharge(isChargeOpen ? null : c.id)}
                                        style={{ cursor: hasTxns ? "pointer" : "default",
                                          background: isChargeOpen ? "var(--teal-50)" : ci % 2 === 0 ? "#fff" : "var(--ink-50)",
                                          borderBottom: "1px solid var(--ink-100)", transition: "background .12s" }}>
                                        <td style={{ padding: "9px 12px" }}>
                                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                            <Icon name="receipt" size={13} color={isChargeOpen ? "var(--teal-600)" : "var(--ink-400)"}/>
                                            <span style={{ fontWeight: 600, color: "var(--ink-800)" }}>{c.name}</span>
                                          </div>
                                        </td>
                                        <td style={{ padding: "9px 12px" }}>
                                          {hasTxns && <Chip tone={isChargeOpen ? "teal" : "gray"} style={{ fontSize: 10 }}>{txnRows.length} תנועות</Chip>}
                                        </td>
                                        <td className="num" style={{ padding: "9px 12px", textAlign: "end", fontWeight: 700,
                                          color: bal > 0 ? "var(--ink-900)" : "var(--ok-fg)" }}>
                                          {bal > 0 ? `₪${fmt(bal)}` : "0 ✓"}
                                        </td>
                                        <td style={{ padding: "9px 12px", textAlign: "center", width: 36 }}>
                                          {hasTxns && <Icon name="chevdown" size={13} color="var(--ink-400)"
                                            style={{ transform: isChargeOpen ? "rotate(180deg)" : "none", transition: "transform .18s", display: "block", margin: "0 auto" }}/>}
                                        </td>
                                      </tr>
                                      {/* ── Level 3: transactions ── */}
                                      {isChargeOpen && (
                                        <tr>
                                          <td colSpan={4} style={{ padding: 0, background: "var(--teal-50)" }}>
                                            <div className="mu-rise">
                                              {onOpenWide && (
                                                <div style={{ padding: "7px 14px 4px", display: "flex", justifyContent: "flex-end" }}>
                                                  <button data-focusring onClick={onOpenWide}
                                                    style={{ display: "inline-flex", alignItems: "center", gap: 5,
                                                      border: "1px solid var(--teal-300)", background: "var(--teal-50)", color: "var(--teal-700)",
                                                      borderRadius: 999, padding: "4px 10px", cursor: "pointer", fontFamily: "var(--font)", fontSize: 12, fontWeight: 600 }}>
                                                    <Icon name="receipt" size={12} color="var(--teal-600)"/> מסך תנועות מלא
                                                  </button>
                                                </div>
                                              )}
                                              <TxnTable rows={txnRows} types={txnTypes} compact={compact}/>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
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
  );
}

export { SubjectStrip, SubjectDrillDown, AllEntitiesView, BalancesTable, TxnTable };
