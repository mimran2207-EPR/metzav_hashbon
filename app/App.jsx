// App.jsx — composes the מצב חשבון workspace + state management
import React, { useState, useEffect } from 'react';
import { TopBar, FooterBand } from './chrome.jsx';
import { HeroZone, ActionBar } from './hero.jsx';
import { SubjectStrip, SubjectDrillDown, BalancesTable } from './content.jsx';
import { LeftColumn, CommandBar } from './panels.jsx';
import { CopilotPanel, NotesDrawer, DocsDrawer, InterestCalc } from './panels2.jsx';
import { WideTxnScreen } from './wide-txns.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle } from './tweaks-panel.jsx';
import { SectionHead, Card, Segmented, ToastHost, useMediaQuery } from './ui.jsx';
import { Icon } from './icons.jsx';
import { PAYER, TOTALS, SERVICES, TXNS, TXN_TYPES, SUBJECTS, DOCUMENTS, AI_INSIGHTS, QUICK_ACTIONS, NOTES } from './data.jsx';

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#2AA7B8",
  "aiProminence": "balanced",
  "density": "comfortable",
  "showCityscape": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const narrow = useMediaQuery("(max-width: 900px)"); // tablet / mobile breakpoint
  const [year, setYear] = useState(2026);
  const [entity, setEntity] = useState("all");      // subject (level 1)
  const [subItemId, setSubItemId] = useState(null); // sub-subject (level 2)
  const [chargeId, setChargeId] = useState(null);   // charge type (level 3)
  const [density, setDensity] = useState(t.density);
  // selecting a subject resets the drill-down path
  const selectSubject = (id) => { setEntity(id); setSubItemId(null); setChargeId(null); };
  const [notes, setNotes] = useState(NOTES);

  // tweak: density sync + accent override (stays in the teal family)
  useEffect(() => setDensity(t.density), [t.density]);
  useEffect(() => {
    document.documentElement.style.setProperty("--teal-500", t.accent);
  }, [t.accent]);
  const ai = t.aiProminence; // subtle | balanced | bold

  const [cmdOpen, setCmdOpen] = useState(false);
  const [copilot, setCopilot] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [wideOpen, setWideOpen] = useState(false);

  // ⌘K / Ctrl+K + shortcuts
  // NOTE: we intentionally do NOT hijack Ctrl/⌘+P — overriding the browser's
  // native print is hostile to users (and screen-reader / a11y workflows).
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") { e.preventDefault(); setCmdOpen(o => !o); }
      else if ((e.metaKey || e.ctrlKey) && k === "j") { e.preventDefault(); setCopilot(o => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const services = entity === "all" ? SERVICES : SERVICES.filter(s => s.subject === entity);
  const activeSubject = SUBJECTS.find(s => s.id === entity);
  const totals = {
    nominal: services.reduce((a, s) => a + s.nominal, 0),
    indexation: services.reduce((a, s) => a + s.indexation, 0),
    interest: services.reduce((a, s) => a + s.interest, 0),
    get balance() { return this.nominal + this.indexation + this.interest; },
  };

  const handlers = {
    onPay: () => window.muToast("מעבר למסך גביית תשלום / קבלה", "card"),
    onNotes: () => setNotesOpen(true),
    onDocs: () => setDocsOpen(true),
    onEnforce: () => window.muToast("מעבר למסך פעולות אכיפה", "shield"),
    onCopilot: () => setCopilot(true),
    onCalc: () => setCalcOpen(true),
  };

  const runCommand = (item) => {
    setCmdOpen(false);
    const map = {
      pay: handlers.onPay, calc: () => setCalcOpen(true), print: () => window.muToast("מכין הדפסת מצב חשבון…", "print"),
      enforce: handlers.onEnforce, notes: () => setNotesOpen(true), docs: () => setDocsOpen(true),
      letter: () => setCopilot(true), arrangement: () => window.muToast("נפתח מסך הסדר תשלומים", "wallet"),
    };
    if (map[item.id]) map[item.id]();
    else window.muToast("נבחר: " + item.label);
  };

  const runAction = (a) => {
    if (a.id === "view_refs") setDocsOpen(true);
    else if (a.id === "update_arrangement") window.muToast("נפתח מסך עדכון הסדר תשלומים", "card");
    else if (a.id === "interest") setCalcOpen(true);
    else if (a.id === "letter") setCopilot(true);
    else window.muToast(a.label, a.icon);
  };

  const addNote = (text) => setNotes(n => [{ id: Date.now(), author: "שמעון עמר", role: "פקיד גבייה", date: new Date().toLocaleDateString("he-IL") + " " + new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" }), text }, ...n]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar onCommand={() => setCmdOpen(true)} onNav={(id) => window.muToast({ home: "חזרה לעמוד הבית", back: "ניווט אחורה", forward: "ניווט קדימה", history: "היסטוריית מסכים", fav: "נוסף למועדפים" }[id] || "ניווט", id === "fav" ? "star" : "home")}
          year={year} breadcrumb={{ name: PAYER.name, no: PAYER.payerNo }}/>

      {/* hero atmosphere wash */}
      <div style={{ background: "var(--wash-hero)", borderBottom: "1px solid var(--ink-100)" }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "20px 24px 22px" }}>
          <HeroZone p={PAYER} totals={totals} year={year} notesCount={notes.length} docsCount={DOCUMENTS.length} insights={AI_INSIGHTS} handlers={handlers} showStrip={ai !== "subtle"} narrow={narrow} onYear={setYear}/>
        </div>
      </div>

      <div style={{ maxWidth: 1360, margin: "0 auto", width: "100%", padding: "16px 24px 0", boxSizing: "border-box" }}>
        <ActionBar notesCount={notes.length} year={year} onYear={setYear} handlers={handlers}/>
      </div>

      {/* main two-column */}
      <main id="main" style={{ flex: 1, maxWidth: 1360, margin: "0 auto", width: "100%", padding: "18px 24px 0", boxSizing: "border-box", scrollMarginTop: 72 }}>
        <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "minmax(0,1fr) 340px", gap: 18, alignItems: "start" }}>
          {/* right (data) column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <SectionHead title="ישויות ונושאים" sub={`מס׳ משלם ${PAYER.payerNo} · ת.ז ${PAYER.taz}`}/>
              <SubjectStrip subjects={SUBJECTS} selected={entity} onSelect={selectSubject}/>
            </div>
            <Card pad={0} style={{ overflow: "visible" }}>
              <div style={{ padding: "18px 20px 0" }}>
                <SectionHead title={entity === "all" ? "יתרות לפי סוג שירות" : "פירוט נושא"} icon="sigma"
                  sub={entity === "all" ? "כל הנושאים · לחץ שורה לפירוט תנועות"
                    : `${activeSubject ? activeSubject.name : entity}${activeSubject ? ` · ${activeSubject.count} ${activeSubject.unit}` : ""} · לחץ פריט לפירוט סוגי חיוב ותנועות`}
                  right={
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button data-focusring onClick={() => setWideOpen(true)} title="פתח מסך תנועות מלא"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--teal-500)",
                          background: "var(--teal-50)", color: "var(--teal-700)", borderRadius: 999, padding: "6px 13px",
                          cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600 }}>
                        <Icon name="receipt" size={15} color="var(--teal-600)"/> תנועות למשלם
                      </button>
                      <Segmented size="sm" value={density} onChange={setDensity}
                        options={[{ value: "comfortable", label: "מרווח" }, { value: "compact", label: "צפוף" }]}/>
                    </div>
                  }/>
              </div>
              <div style={{ padding: "0 20px 20px" }}>
                {entity === "all" || !activeSubject
                  ? <BalancesTable services={services} totals={totals} density={density} txns={TXNS} txnTypes={TXN_TYPES}/>
                  : <SubjectDrillDown subject={activeSubject} subItemId={subItemId} chargeId={chargeId}
                      onSelectSubItem={(id) => { setSubItemId(id); setChargeId(null); }}
                      onSelectCharge={setChargeId} onReset={() => { setSubItemId(null); setChargeId(null); }}
                      onOpenWide={() => setWideOpen(true)} density={density} txnTypes={TXN_TYPES}/>}
              </div>
            </Card>
          </div>

          {/* left (AI) column */}
          <LeftColumn insights={AI_INSIGHTS} actions={QUICK_ACTIONS} onCopilot={() => setCopilot(true)} onAction={runAction} mode={ai}/>
        </div>
      </main>

      {t.showCityscape ? <FooterBand/> : <div style={{ height: 40 }}/>}

      {/* overlays */}
      <CommandBar open={cmdOpen} onClose={() => setCmdOpen(false)} onRun={runCommand}/>
      <CopilotPanel open={copilot} onClose={() => setCopilot(false)}/>
      <NotesDrawer open={notesOpen} onClose={() => setNotesOpen(false)} notes={notes} onAdd={addNote}/>
      <DocsDrawer open={docsOpen} onClose={() => setDocsOpen(false)} docs={DOCUMENTS}/>
      <InterestCalc open={calcOpen} onClose={() => setCalcOpen(false)} baseNominal={TOTALS.nominal}/>
      <WideTxnScreen open={wideOpen} onClose={() => setWideOpen(false)} payer={PAYER}/>
      <ToastHost/>

      <TweaksPanel>
        <TweakSection label="שכבת ה-AI"/>
        <TweakRadio label="בולטות AI" value={t.aiProminence}
          options={[{ value: "subtle", label: "מינימלי" }, { value: "balanced", label: "מאוזן" }, { value: "bold", label: "בולט" }]}
          onChange={v => setTweak("aiProminence", v)}/>
        <TweakSection label="נתונים"/>
        <TweakRadio label="צפיפות טבלה" value={t.density}
          options={[{ value: "comfortable", label: "מרווח" }, { value: "compact", label: "צפוף" }]}
          onChange={v => setTweak("density", v)}/>
        <TweakSection label="מיתוג"/>
        <TweakColor label="גוון ראשי" value={t.accent}
          options={["#2AA7B8", "#1D8F9F", "#2E9CC4", "#1aa0a0"]}
          onChange={v => setTweak("accent", v)}/>
        <TweakToggle label="קו רקיע בתחתית" value={t.showCityscape} onChange={v => setTweak("showCityscape", v)}/>
      </TweaksPanel>
    </div>
  );
}

export default App;
