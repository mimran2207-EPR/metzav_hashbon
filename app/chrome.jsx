import React from 'react';
import { Icon } from './icons.jsx';
import { Tip } from './ui.jsx';

function TopBar({ onCommand, onNav, year, breadcrumb }) {
  const navBtns = [
  { id: "home", icon: "home", label: "עמוד הבית" },
  { id: "back", icon: "back", label: "אחורה" },
  { id: "forward", icon: "forward", label: "קדימה" },
  { id: "history", icon: "history", label: "היסטוריית מסכים" },
  { id: "fav", icon: "star", label: "מועדפים" }];

  return (
    <header style={{ height: 56, background: "var(--white)", borderBottom: "1px solid var(--ink-200)",
      display: "flex", alignItems: "center", gap: 16, padding: "0 20px", position: "sticky", top: 0, zIndex: 100 }}>
      <a href="#main" className="skip-link">דלג לתוכן הראשי</a>
      <div style={{ display: "flex", alignItems: "center", gap: 11, flex: "none" }}>
        <img src="/assets/municipality-crest.png" alt="מועצה אזורית שדות נגב" style={{ width: 36, height: 36, objectFit: "contain" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, whiteSpace: "nowrap" }}>
          <span style={{ color: "var(--teal-600)", fontWeight: 600 }}>מצב חשבון</span>
          <Icon name="chevleft" size={14} color="var(--ink-400)" />
          <span style={{ color: "var(--ink-800)", fontWeight: 600 }}>{breadcrumb.name}</span>
          <span className="num" style={{ color: "var(--ink-500)", fontWeight: 500 }}>{breadcrumb.no}</span>
        </div>
      </div>

      <button data-focusring onClick={onCommand} style={{ flex: "1 1 auto", maxWidth: 520, margin: "0 auto",
        display: "flex", alignItems: "center", gap: 10, height: 38, padding: "0 14px",
        background: "var(--ink-50)", border: "1px solid var(--ink-200)", borderRadius: 999, cursor: "text",
        color: "var(--ink-500)", fontFamily: "var(--font)", fontSize: 14, transition: "all .15s ease" }}
      onMouseEnter={(e) => {e.currentTarget.style.borderColor = "var(--teal-300)";e.currentTarget.style.background = "#fff";}}
      onMouseLeave={(e) => {e.currentTarget.style.borderColor = "var(--ink-200)";e.currentTarget.style.background = "var(--ink-50)";}}>
        <Icon name="search" size={17} color="var(--teal-500)" />
        <span style={{ flex: 1, textAlign: "start" }}>חפש משלם, פיזי, פעולה או מסך…</span>
        <kbd style={{ fontFamily: "var(--font)", fontSize: 11.5, fontWeight: 600, color: "var(--ink-500)",
          background: "var(--white)", border: "1px solid var(--ink-300)", borderRadius: 6, padding: "2px 7px" }}>⌘K</kbd>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 2, flex: "none" }}>
        {navBtns.map((b) =>
        <Tip key={b.id} label={b.label}>
            <button data-focusring onClick={() => onNav && onNav(b.id)} aria-label={b.label}
          style={{ width: 36, height: 36, borderRadius: 9, border: "none", background: "transparent",
            cursor: "pointer", display: "grid", placeItems: "center", color: "var(--ink-600)", transition: "all .12s ease" }}
          onMouseEnter={(e) => {e.currentTarget.style.background = "var(--ink-100)";e.currentTarget.style.color = "var(--teal-600)";}}
          onMouseLeave={(e) => {e.currentTarget.style.background = "transparent";e.currentTarget.style.color = "var(--ink-600)";}}>
              <Icon name={b.icon} size={19} color="currentColor" />
            </button>
          </Tip>
        )}
      </div>

      <div style={{ width: 1, height: 26, background: "var(--ink-200)", flex: "none" }} />

      <div data-focusring tabIndex={0} style={{ display: "flex", alignItems: "center", gap: 9, flex: "none", cursor: "pointer",
        padding: "5px 6px 5px 10px", borderRadius: 999, border: "1px solid var(--ink-200)" }}>
        <div style={{ width: 30, height: 30, borderRadius: 999, background: "var(--teal-100)", color: "var(--teal-700)",
          display: "grid", placeItems: "center", fontWeight: 700, fontSize: 12.5 }}>שע</div>
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)" }}>ישראל ישראלי</div>
          <div style={{ fontSize: 10.5, color: "var(--ink-500)" }}>פקיד גבייה</div>
        </div>
        <Icon name="chevdown" size={15} color="var(--ink-400)" />
      </div>

      <img src="/assets/muni-wordmark.svg" alt="muni" style={{ height: 30, flex: "none" }} />
    </header>
  );
}

function FooterBand() {
  return (
    <footer style={{ marginTop: 40 }}>
      <div style={{ position: "relative", background: "linear-gradient(180deg,#FFFFFF 0%,#E8F4F6 100%)" }}>
        <img src="/assets/footer-cityscape.svg" alt="" style={{ display: "block", width: "100%", height: 120, objectFit: "cover", objectPosition: "bottom" }} />
      </div>
      <div style={{ background: "var(--white)", borderTop: "1px solid var(--ink-200)", padding: "14px 32px",
        display: "flex", alignItems: "center", gap: 24 }}>
        <img src="/assets/epr-systems.svg" alt="EPR Systems" style={{ height: 24 }} />
        <img src="/assets/tsg.svg" alt="TSG" style={{ height: 22, opacity: .9 }} />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: 22, fontSize: 13, color: "var(--ink-500)" }}>
          <span style={{ cursor: "pointer" }}>נגישות</span>
          <span style={{ cursor: "pointer" }}>מדיניות פרטיות</span>
          <span style={{ cursor: "pointer" }}>תמיכה</span>
        </div>
      </div>
    </footer>
  );
}

export { TopBar, FooterBand };
