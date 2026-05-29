// panels2.jsx — AI Copilot chat, Notes drawer, Documents drawer, Interest calculator
import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './icons.jsx';
import { Sheet, PillButton, Chip } from './ui.jsx';
import { fmt, PAYER } from './data.jsx';

function CopilotPanel({ open, onClose }) {
  const [msgs, setMsgs] = useState([
    { who: "ai", text: `שלום שמעון. אני כאן כדי לעזור עם תיק המשלם ${PAYER.name}. אפשר לשאול אותי כל דבר על החוב, או לבחור הצעה למטה.`, cites: [] },
  ]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const canned = {
    "נתח את החוב": {
      text: "יתרת החוב הכוללת היא ₪13,574. מתוכה ₪11,220 קרן נומינלית, ₪738 הצמדה ו-₪1,616 ריבית. המרכיב הדומיננטי הוא הארנונה (₪10,372 — 76% מהחוב), ובתוכה הריבית צמחה ב-₪1,340 מאז תחילת השנה בשל יתרה פתוחה.",
      cites: ["טבלת יתרות · 5 שירותים", "מנוע ריבית · 30/04/2026"],
    },
    "הצע הסדר תשלומים": {
      text: "בהתבסס על היסטוריית תשלומים אמינה (4/5 במועד), מומלץ הסדר של 6 תשלומים חודשיים בסך ₪2,262 כל אחד, החל מ-01/07/2026. ההסדר מקפיא ריבית עתידית כל עוד התשלומים בזמן.",
      cites: ["היסטוריית תנועות 2024–2026", "מדיניות הסדרים · סעיף 4.2"],
    },
    "נסח מכתב התראה": {
      text: "טיוטת מכתב מוכנה: \u201cהנדון: יתרת חוב בסך ₪13,574 בגין ארנונה ואגרות. הינך נדרש להסדיר את החוב תוך 14 יום, אחרת יינקטו הליכי אכיפה לפי פקודת המסים (גבייה).\u201d רוצה שאשלח לאישור מנהל?",
      cites: ["תבנית מכתב 1 · מח׳ גבייה"],
    },
  };
  const suggestions = Object.keys(canned);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [msgs, typing]);

  const ask = (q) => {
    if (!q.trim()) return;
    setMsgs(m => [...m, { who: "me", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const a = canned[q] || { text: "ניתחתי את הבקשה מול נתוני המשלם. ניתן לחדד את השאלה או לבחור אחת ההצעות המוכנות למעלה.", cites: ["תיק המשלם 999-DEMO"] };
      setTyping(false);
      setMsgs(m => [...m, { who: "ai", text: a.text, cites: a.cites }]);
    }, 1100);
  };

  return (
    <Sheet open={open} onClose={onClose} side="start" width={440} title="AI Copilot" sub={`עוזר הגבייה · ${PAYER.name}`}
      footer={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "var(--ink-50)", border: "1px solid var(--ink-200)", borderRadius: 999, padding: "6px 14px" }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && ask(input)}
              placeholder="שאל את ה-Copilot…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font)", fontSize: 14, color: "var(--ink-800)" }}/>
          </div>
          <button data-focusring onClick={() => ask(input)} style={{ width: 40, height: 40, borderRadius: 999, border: "none", cursor: "pointer",
            background: "var(--teal-500)", display: "grid", placeItems: "center" }}>
            <Icon name="send" size={18} color="#fff"/>
          </button>
        </div>
      }>
      <div ref={scrollRef} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.who === "me" ? "flex-start" : "stretch" }}>
            {m.who === "ai" && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, background: "linear-gradient(135deg,var(--teal-400),var(--teal-600))", display: "grid", placeItems: "center" }}>
                  <Icon name="sparkle" size={13} color="#fff"/>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--teal-700)" }}>Copilot</span>
              </div>
            )}
            <div style={{ maxWidth: m.who === "me" ? "85%" : "100%", fontSize: 13.5, lineHeight: 1.6,
              background: m.who === "me" ? "var(--teal-500)" : "var(--ink-50)", color: m.who === "me" ? "#fff" : "var(--ink-800)",
              borderRadius: m.who === "me" ? "13px 13px 13px 3px" : 13, padding: "11px 14px",
              border: m.who === "me" ? "none" : "1px solid var(--ink-200)" }}>
              {m.text}
            </div>
            {m.cites && m.cites.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {m.cites.map((c, j) => (
                  <span key={j} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--ink-600)",
                    background: "#fff", border: "1px solid var(--ink-200)", borderRadius: 999, padding: "3px 9px" }}>
                    <Icon name="citation" size={12} color="var(--teal-500)"/> {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "10px 14px", background: "var(--ink-50)", border: "1px solid var(--ink-200)", borderRadius: 13, width: "fit-content" }}>
            {[0, 1, 2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: 999, background: "var(--teal-400)", animation: `muType 1s ${i * .15}s infinite` }}/>)}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
          <span style={{ fontSize: 11.5, color: "var(--ink-400)", fontWeight: 600 }}>הצעות</span>
          {suggestions.map(s => (
            <button key={s} data-focusring onClick={() => ask(s)} style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "start",
              border: "1px solid var(--teal-200)", background: "var(--teal-50)", borderRadius: 11, padding: "9px 12px", cursor: "pointer",
              fontFamily: "var(--font)", fontSize: 13, fontWeight: 600, color: "var(--teal-700)" }}>
              <Icon name="sparkle" size={14} color="var(--teal-600)"/> {s}
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

function NotesDrawer({ open, onClose, notes, onAdd }) {
  const [draft, setDraft] = useState("");
  return (
    <Sheet open={open} onClose={onClose} side="end" width={420} title={`הערות (${notes.length})`} sub={`${PAYER.name} · ${PAYER.payerNo}`}
      footer={
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="הוסף הערה חדשה…" rows={2}
            style={{ width: "100%", resize: "none", border: "1px solid var(--ink-200)", borderRadius: 11, padding: "10px 12px",
              fontFamily: "var(--font)", fontSize: 13.5, color: "var(--ink-800)", outline: "none", boxSizing: "border-box" }}/>
          <PillButton variant="primary" icon="plus" onClick={() => { if (draft.trim()) { onAdd(draft); setDraft(""); window.muToast("ההערה נוספה"); } }}>הוסף הערה</PillButton>
        </div>
      }>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {notes.map(n => (
          <div key={n.id} style={{ border: "1px solid var(--ink-200)", borderRadius: 12, padding: "12px 14px", background: n.author === "מערכת" ? "var(--ink-50)" : "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, background: n.author === "מערכת" ? "var(--ink-200)" : "var(--teal-100)",
                color: n.author === "מערכת" ? "var(--ink-600)" : "var(--teal-700)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flex: "none" }}>
                {n.author === "מערכת" ? <Icon name="settings" size={14} color="var(--ink-500)"/> : n.author.split(" ").map(w => w[0]).join("").slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)" }}>{n.author}</div>
                <div style={{ fontSize: 11, color: "var(--ink-500)" }}>{n.role}</div>
              </div>
              <span className="num" style={{ fontSize: 11, color: "var(--ink-400)" }}>{n.date}</span>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink-700)" }}>{n.text}</div>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

function DocsDrawer({ open, onClose, docs }) {
  const typeColor = { PDF: "red", JPG: "blue", DOC: "teal" };
  return (
    <Sheet open={open} onClose={onClose} side="end" width={420} title={`מסמכים (${docs.length})`} sub="מסמכים מקושרים למשלם"
      footer={<PillButton variant="secondary" icon="scan" onClick={() => window.muToast("נפתח חלון סריקת מסמכים", "scan")} style={{ width: "100%" }}>סרוק מסמך חדש</PillButton>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {docs.map(d => (
          <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, border: "1px solid var(--ink-200)", borderRadius: 12, padding: "11px 13px" }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: "var(--ink-50)", display: "grid", placeItems: "center", flex: "none" }}>
              <Icon name="docs" size={19} color="var(--teal-600)"/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, fontSize: 11.5, color: "var(--ink-500)" }}>
                <Chip tone={typeColor[d.type] || "gray"} style={{ fontSize: 10 }}>{d.type}</Chip>
                <span className="num">{d.date}</span><span>·</span><span className="num">{d.size}</span>
              </div>
            </div>
            <button data-focusring title="הורד" onClick={() => window.muToast("מוריד " + d.name, "download")}
              style={{ border: "1px solid var(--ink-200)", background: "#fff", borderRadius: 8, padding: "7px", cursor: "pointer", display: "grid", placeItems: "center", flex: "none" }}>
              <Icon name="download" size={16} color="var(--ink-600)"/>
            </button>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

// Hoisted out of the component: defining Field inline re-created the component
// type on every render, remounting the inputs and dropping focus mid-typing.
const CalcField = ({ label, children }) => (
  <div><div style={{ fontSize: 12, color: "var(--ink-500)", fontWeight: 500, marginBottom: 5 }}>{label}</div>{children}</div>
);
const calcInputStyle = { width: "100%", boxSizing: "border-box", height: 42, border: "1px solid var(--ink-300)", borderRadius: 10,
  padding: "0 12px", fontFamily: "var(--font)", fontSize: 15, color: "var(--ink-800)", outline: "none" };
// Demo-only indexation rate. NOTE: in production, interest + indexation must come
// from the authoritative back-end engine — not a hard-coded client constant.
const CALC_INDEXATION_ANNUAL_RATE = 0.015;

function InterestCalc({ open, onClose, baseNominal }) {
  const [principal, setPrincipal] = useState(baseNominal);
  const [rate, setRate] = useState(4.0);
  const [months, setMonths] = useState(6);
  useEffect(() => { if (open) setPrincipal(baseNominal); }, [open, baseNominal]);
  // a11y: close on Escape (overlay click already closes).
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  const idx = Math.round(principal * CALC_INDEXATION_ANNUAL_RATE * (months / 12));
  const interest = Math.round(principal * (rate / 100) * (months / 12));
  const total = principal + idx + interest;
  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,38,50,.4)", zIndex: 6000, display: "grid", placeItems: "center", animation: "muFade .14s ease" }}>
      <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="מחשבון ריבית והצמדה" className="mu-rise" style={{ width: 460, maxWidth: "92vw", background: "#fff", borderRadius: 16, boxShadow: "var(--shadow-lg)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid var(--ink-200)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--teal-50)", display: "grid", placeItems: "center" }}><Icon name="calc" size={18} color="var(--teal-600)"/></div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--teal-700)" }}>מחשבון ריבית והצמדה</div>
          </div>
          <button data-focusring onClick={onClose} style={{ border: "none", background: "var(--ink-100)", width: 32, height: 32, borderRadius: 9, cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="close" size={17} color="var(--ink-600)"/></button>
        </div>
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <CalcField label="קרן נומינלית (₪)"><input type="number" className="num" value={principal} onChange={e => setPrincipal(+e.target.value || 0)} style={calcInputStyle}/></CalcField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <CalcField label="ריבית שנתית (%)"><input type="number" step="0.1" className="num" value={rate} onChange={e => setRate(+e.target.value || 0)} style={calcInputStyle}/></CalcField>
            <CalcField label="תקופה (חודשים)"><input type="number" className="num" value={months} onChange={e => setMonths(+e.target.value || 0)} style={calcInputStyle}/></CalcField>
          </div>
          <div style={{ background: "var(--ink-50)", border: "1px solid var(--ink-200)", borderRadius: 12, padding: 16, marginTop: 2 }}>
            {[["קרן", principal], ["הצמדה", idx], ["ריבית", interest]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "4px 0", color: "var(--ink-700)" }}>
                <span>{l}</span><span className="num" style={{ fontWeight: 600 }}>₪{fmt(v)}</span>
              </div>
            ))}
            <div style={{ height: 1, background: "var(--ink-200)", margin: "8px 0" }}/>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink-900)" }}>סך לתשלום</span>
              <span className="num" style={{ fontSize: 24, fontWeight: 700, color: "var(--teal-600)" }}>₪{fmt(total)}</span>
            </div>
          </div>
          <PillButton variant="primary" icon="check" onClick={() => { window.muToast("החישוב נשמר לתיק המשלם"); onClose(); }} style={{ width: "100%" }}>שמור חישוב</PillButton>
        </div>
      </div>
    </div>
  );
}

export { CopilotPanel, NotesDrawer, DocsDrawer, InterestCalc };
