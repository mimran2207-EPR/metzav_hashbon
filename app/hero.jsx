import React, { useState } from 'react';
import { Icon } from './icons.jsx';
import { Card, Chip, PillButton, useMediaQuery } from './ui.jsx';
import { YEARS, fmt } from './data.jsx';

function fieldRow(label, value, mono) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
      <span style={{ fontSize: 11.5, color: "var(--ink-500)", fontWeight: 500 }}>{label}</span>
      <span className={mono ? "num" : ""} style={{ fontSize: 14, color: "var(--ink-800)", fontWeight: 600,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

function IdentityCard({ p }) {
  return (
    <Card pad={20} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))",
          color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 19, flex: "none" }}>
          {p.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 19, fontWeight: 700, color: "var(--ink-900)" }}>{p.name}</span>
            <Chip tone="green">{p.status}</Chip>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3, fontSize: 12.5, color: "var(--ink-500)" }}>
            <span>מס׳ משלם <b className="num" style={{ color: "var(--ink-700)" }}>{p.payerNo}</b></span>
            <span style={{ color: "var(--ink-300)" }}>·</span>
            <span>{p.type}</span>
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: "var(--ink-100)" }}/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "13px 18px" }}>
        {fieldRow("ת.ז. / ח.פ.", p.taz, true)}
        {fieldRow("טלפון", p.phone, true)}
        {fieldRow("כתובת", `${p.address}`, false)}
        {fieldRow("יישוב / מיקוד", `${p.city} · ${p.zip}`, false)}
        {fieldRow("דוא״ל", p.email, false)}
        {fieldRow("רשות", p.council, false)}
      </div>
    </Card>
  );
}

function BalanceCard({ totals, year, onPay }) {
  const parts = [
    { label: "נומינלי (קרן)", val: totals.nominal },
    { label: "הצמדה", val: totals.indexation },
    { label: "ריבית", val: totals.interest },
  ];
  return (
    <Card pad={20} style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--teal-700)" }}>יתרה למשלם</span>
        <Chip tone="gray"><Icon name="calendar" size={13} color="var(--ink-500)"/> שנת {year}</Chip>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
        <span className="num" style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1,
          background: "linear-gradient(135deg,var(--teal-600) 0%,var(--teal-800) 100%)",
          WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", color: "var(--teal-700)" }}>
          ₪{fmt(totals.balance)}
        </span>
        <Chip tone="red" style={{ alignSelf: "center" }}>חובה</Chip>
      </div>
      <div style={{ display: "flex", gap: 0, marginTop: 16, marginBottom: 16, borderRadius: 12, overflow: "hidden", border: "1px solid var(--ink-200)" }}>
        {parts.map((p, i) => (
          <div key={p.label} style={{ flex: 1, padding: "9px 12px", borderInlineEnd: i < 2 ? "1px solid var(--ink-200)" : "none",
            background: "var(--ink-50)" }}>
            <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{p.label}</div>
            <div className="num" style={{ fontSize: 15, fontWeight: 700, color: "var(--ink-800)", marginTop: 1 }}>₪{fmt(p.val)}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
        <PillButton variant="primary" chevron onClick={onPay} style={{ flex: 1 }}>לתשלום</PillButton>
        <PillButton variant="secondary" icon="sigma" onClick={() => window.muToast("נפתח סיכום כספי למשלם", "sigma")}>סיכום</PillButton>
      </div>
    </Card>
  );
}

function AlertsCard({ notesCount, docsCount, onNotes, onDocs, onEnforce }) {
  const rows = [
    { icon: "alert", tone: "crit", title: "2 שוברים פתוחים", sub: "ארנונה 2026 · יתרת קרן ₪1,376", onClick: onDocs },
    { icon: "bell", tone: "warn", title: "מכתב התראה נשלח", sub: "21/05/2026 · דואר רשום", onClick: onNotes },
  ];
  const toneColor = { crit: "var(--red)", warn: "var(--amber)", good: "var(--green)" };
  const toneBg = { crit: "#FBE9E9", warn: "#FDF3DE", good: "#E7F6EE" };
  return (
    <Card pad={20} style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--teal-700)" }}>התראות ומסמכים</span>
        <div style={{ display: "flex", gap: 6 }}>
          <Chip tone="teal"><Icon name="notes" size={12} color="var(--teal-600)"/> {notesCount}</Chip>
          <Chip tone="gray"><Icon name="docs" size={12} color="var(--ink-500)"/> {docsCount}</Chip>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
        {rows.map((r, i) => (
          <button key={i} data-focusring onClick={r.onClick} style={{ display: "flex", alignItems: "center", gap: 11,
            textAlign: "start", border: "1px solid var(--ink-200)", background: "var(--white)", borderRadius: 11,
            padding: "9px 11px", cursor: "pointer", transition: "all .14s ease", width: "100%" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--ink-50)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--white)"}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: toneBg[r.tone], display: "grid", placeItems: "center", flex: "none" }}>
              <Icon name={r.icon} size={17} color={toneColor[r.tone]}/>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-800)" }}>{r.title}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-500)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.sub}</div>
            </div>
          </button>
        ))}
      </div>
      <button data-focusring onClick={onEnforce} style={{ marginTop: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        border: "1.5px solid var(--ink-200)", background: "transparent", borderRadius: 999, padding: "8px",
        cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "var(--ink-700)", fontFamily: "var(--font)" }}>
        <Icon name="shield" size={16} color="var(--ink-600)"/> מעבר לאכיפה
      </button>
    </Card>
  );
}

function AIStrip({ insights, onCopilot }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 16px", borderRadius: 14,
      background: "linear-gradient(90deg,var(--teal-50),#F4FBFC 60%,#fff)", border: "1px solid var(--teal-100)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))",
          display: "grid", placeItems: "center" }}>
          <Icon name="sparkle" size={17} color="#fff"/>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--teal-700)" }}>תובנות AI</span>
      </div>
      <div style={{ display: "flex", gap: 9, flex: 1, overflowX: "auto", paddingBottom: 1 }}>
        {insights.map(ins => {
          const c = { warn: "var(--amber)", good: "var(--green)", crit: "var(--red)" }[ins.tone];
          return (
            <div key={ins.id} title={ins.source} style={{ display: "flex", alignItems: "center", gap: 8, flex: "none",
              background: "var(--white)", border: "1px solid var(--ink-200)", borderRadius: 999, padding: "6px 13px",
              fontSize: 12.5, color: "var(--ink-700)", maxWidth: 420 }}>
              <Icon name={ins.icon} size={14} color={c}/>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ins.text}</span>
            </div>
          );
        })}
      </div>
      <PillButton size="sm" variant="primary" icon="sparkle" onClick={onCopilot} style={{ flex: "none" }}>פתח Copilot</PillButton>
    </div>
  );
}

function HeroZone({ p, totals, year, notesCount, docsCount, insights, handlers, showStrip = true, narrow = false }) {
  return (
    <div className="mu-rise" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "1.45fr 1fr 1fr", gap: 14, alignItems: "stretch" }}>
        <IdentityCard p={p}/>
        <BalanceCard totals={totals} year={year} onPay={handlers.onPay}/>
        <AlertsCard notesCount={notesCount} docsCount={docsCount} onNotes={handlers.onNotes} onDocs={handlers.onDocs} onEnforce={handlers.onEnforce}/>
      </div>
      {showStrip && <AIStrip insights={insights} onCopilot={handlers.onCopilot}/>}
    </div>
  );
}

function ActionBar({ notesCount, year, onYear, handlers }) {
  const [yearOpen, setYearOpen] = useState(false);
  const narrow = useMediaQuery("(max-width: 900px)");
  const groups = [
    { name: "תקשורת", items: [
      { id: "notes", icon: "notes", label: "הערות", badge: notesCount, onClick: handlers.onNotes },
      { id: "docs", icon: "docs", label: "מסמכים", onClick: handlers.onDocs },
      { id: "scan", icon: "scan", label: "סריקת מסמכים", onClick: () => window.muToast("נפתח חלון סריקת מסמכים", "scan") },
      { id: "print", icon: "print", label: "הדפסה", onClick: () => window.muToast("מכין הדפסת מצב חשבון…", "print") },
    ]},
    { name: "כספים", items: [
      { id: "summary", icon: "sigma", label: "סיכום", onClick: () => window.muToast("נפתח סיכום כספי למשלם", "sigma") },
      { id: "pay", icon: "card", label: "תשלומים", onClick: handlers.onPay },
      { id: "calc", icon: "calc", label: "מחשבון ריבית", onClick: handlers.onCalc },
    ]},
    { name: "אכיפה", items: [
      { id: "enforce", icon: "shield", label: "אכיפה", onClick: handlers.onEnforce },
    ]},
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: narrow ? "wrap" : "nowrap",
      background: "var(--white)", border: "1px solid var(--ink-200)",
      borderRadius: 14, boxShadow: "var(--shadow-card)", padding: "8px 12px",
      position: narrow ? "static" : "sticky", top: 68, zIndex: 40, overflowX: narrow ? "visible" : "auto" }}>
      {groups.map((g, gi) => (
        <React.Fragment key={g.name}>
          {gi > 0 && <div style={{ width: 1, height: 30, background: "var(--ink-200)", margin: "0 4px" }}/>}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--ink-400)", marginInlineEnd: 4, letterSpacing: ".02em" }}>{g.name}</span>
            {g.items.map(it => (
              <button key={it.id} data-focusring onClick={it.onClick} title={it.label}
                style={{ display: "flex", alignItems: "center", gap: 7, border: "none", background: "transparent",
                  cursor: "pointer", borderRadius: 9, padding: "8px 11px", color: "var(--ink-700)", fontFamily: "var(--font)",
                  fontSize: 13.5, fontWeight: 500, position: "relative", transition: "all .12s ease" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--teal-50)"; e.currentTarget.style.color = "var(--teal-700)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--ink-700)"; }}>
                <Icon name={it.icon} size={18} color="currentColor"/>
                <span>{it.label}</span>
                {it.badge != null && (
                  <span className="num" style={{ background: "var(--teal-500)", color: "#fff", fontSize: 10.5, fontWeight: 700,
                    borderRadius: 999, padding: "1px 6px", marginInlineStart: 1 }}>{it.badge}</span>
                )}
              </button>
            ))}
          </div>
        </React.Fragment>
      ))}
      <div style={{ flex: 1 }}/>
      <div style={{ position: "relative" }}>
        <button data-focusring onClick={() => setYearOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 8,
          border: "1px solid var(--ink-200)", background: "var(--white)", borderRadius: 999, padding: "7px 14px",
          cursor: "pointer", fontFamily: "var(--font)", fontSize: 13.5, fontWeight: 600, color: "var(--ink-800)" }}>
          <Icon name="calendar" size={16} color="var(--teal-500)"/>
          <span>שנת <span className="num">{year}</span></span>
          <Icon name="chevdown" size={15} color="var(--ink-400)"/>
        </button>
        {yearOpen && (
          <>
            <div onClick={() => setYearOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }}/>
            <div className="mu-rise" style={{ position: "absolute", insetInlineEnd: 0, top: "calc(100% + 6px)", zIndex: 61,
              background: "#fff", border: "1px solid var(--ink-200)", borderRadius: 12, boxShadow: "var(--shadow-lg)",
              padding: 6, width: 130, maxHeight: 260, overflowY: "auto" }}>
              {YEARS.map(y => (
                <button key={y} onClick={() => { onYear(y); setYearOpen(false); }} className="num"
                  style={{ display: "block", width: "100%", textAlign: "start", border: "none", cursor: "pointer",
                    borderRadius: 8, padding: "8px 12px", fontFamily: "var(--font)", fontSize: 14, fontWeight: y === year ? 700 : 500,
                    background: y === year ? "var(--teal-50)" : "transparent", color: y === year ? "var(--teal-700)" : "var(--ink-700)" }}
                  onMouseEnter={e => { if (y !== year) e.currentTarget.style.background = "var(--ink-50)"; }}
                  onMouseLeave={e => { if (y !== year) e.currentTarget.style.background = "transparent"; }}>{y}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export { HeroZone, ActionBar };
