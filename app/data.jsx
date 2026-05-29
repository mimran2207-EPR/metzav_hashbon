// data.jsx — mock account-status data (demo only — all personal details are fictional)

const PAYER = {
  name: "ישראל לדוגמה",
  payerNo: "999-DEMO",
  taz: "000000000",
  type: "משלם פרטי",
  address: "רחוב הדוגמה 1, דירה 1",
  city: "עיר הדוגמה",
  zip: "00000",
  phone: "000-000-0000",
  email: "demo@example.com",
  council: "מועצה אזורית שדות נגב",
  since: "2008",
  status: "פעיל",
};

const ENTITIES = [
  { id: "5002205", subject: 3,  subjectName: "נכס", title: "דירת מגורים", sub: "רחוב הדוגמה 1, דירה 1", balance: 11268, services: 3 },
  { id: "13-88142", subject: 13, subjectName: "מים שוטף", title: "מד מים 2\"", sub: "צריכה רבעונית", balance: 1386, services: 1 },
  { id: "15-2204",  subject: 15, subjectName: "שלטים", title: "שילוט עסק", sub: "רחוב הדוגמה 1", balance: 0, services: 1 },
];

const SERVICES = [
  { id: "arnona",  name: "ארנונה", subject: "arnona", entity: "5002205", nominal: 8420, indexation: 612, interest: 1340, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 9 },
  { id: "water",   name: "מים וביוב", subject: "water", entity: "13-88142", nominal: 1180, indexation: 64, interest: 142, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 6 },
  { id: "shmira",  name: "אגרת שמירה", subject: "arnona", entity: "5002205", nominal: 540, indexation: 22, interest: 38, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 4 },
  { id: "sewage",  name: "אגרת ביוב", subject: "arnona", entity: "5002205", nominal: 760, indexation: 40, interest: 96, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 5 },
  { id: "collect", name: "הוצ' גבייה (מילגם חדש)", subject: "arnona", entity: "5002205", nominal: 320, indexation: 0, interest: 0, get balance(){ return this.nominal+this.indexation+this.interest; }, txns: 2 },
];

// SUBJECTS — the payer's subjects ("נושאים"). Each has an icon and a count whose
// UNIT changes per subject type: properties / children / reports / signs …
// `id` matches SERVICES.subject so selecting a subject filters the balances table.
function subjectBalance(id) { return SERVICES.filter(s => s.subject === id).reduce((a, s) => a + s.balance, 0); }
const SUBJECTS = [
  { id: "arnona",      name: "ארנונה",   icon: "building",    count: 3, unit: "נכסים",   get balance(){ return subjectBalance("arnona"); } },
  { id: "water",       name: "מים וביוב", icon: "droplet",     count: 2, unit: "מדי מים", get balance(){ return subjectBalance("water"); } },
  { id: "education",   name: "חינוך",     icon: "education",   count: 2, unit: "ילדים",   balance: 0 },
  { id: "parking",     name: "חניה",      icon: "parking",     count: 5, unit: "דוחות",   balance: 740 },
  { id: "signage",     name: "שילוט",     icon: "signage",     count: 1, unit: "שלט",     balance: 0 },
  { id: "clubs",       name: "חוגים",     icon: "clubs",       count: 3, unit: "רישומים", balance: 180 },
  { id: "welfare",     name: "רווחה",     icon: "welfare",     count: 1, unit: "תיק",     balance: 0 },
  { id: "engineering", name: "הנדסה",     icon: "engineering", count: 1, unit: "היתר",    balance: 0 },
  { id: "supervision", name: "פיקוח",     icon: "supervision", count: 1, unit: "תיק",     balance: 0 },
];

function sumServices(field) { return SERVICES.reduce((a, s) => a + (field === "balance" ? s.balance : s[field]), 0); }
const TOTALS = {
  nominal: sumServices("nominal"),
  indexation: sumServices("indexation"),
  interest: sumServices("interest"),
  get balance() { return this.nominal + this.indexation + this.interest; },
};

const TXN_TYPES = {
  8:   "יתרה עוברת",
  1:   "תק. ארנונה",
  100: "העברה בנקאית",
  12:  "תשלום במזומן",
  31:  "הצמדה וריבית",
  44:  "זיכוי הנחה",
  17:  "חיוב מים",
};

const TXNS = {
  arnona: [
    { date: "01/01/2026", type: 8,   ref: "—",        dc: "ח", nominal: 7980, addon: 0,    bal: 7980 },
    { date: "01/01/2026", type: 1,   ref: "חיוב שנתי", dc: "ח", nominal: 8420, addon: 0,    bal: 16400 },
    { date: "12/02/2026", type: 44,  ref: "ועדת הנחות",dc: "ז", nominal: 1260, addon: 0,    bal: 15140 },
    { date: "28/02/2026", type: 100, ref: "BANK-7741", dc: "ז", nominal: 4000, addon: 0,    bal: 11140 },
    { date: "31/03/2026", type: 12,  ref: "קבלה 90412",dc: "ז", nominal: 2000, addon: 0,    bal: 9140 },
    { date: "30/04/2026", type: 31,  ref: "חישוב מע'", dc: "ח", nominal: 0,    addon: 612,  bal: 9752 },
    { date: "30/04/2026", type: 31,  ref: "חישוב מע'", dc: "ח", nominal: 0,    addon: 1340, bal: 11092 },
    { date: "15/05/2026", type: 12,  ref: "קבלה 90855",dc: "ז", nominal: 1100, addon: 0,    bal: 9992 },
    { date: "28/05/2026", type: 1,   ref: "יתרת קרן",  dc: "ח", nominal: 1376, addon: 0,    bal: 11368 },
  ],
  water: [
    { date: "01/01/2026", type: 8,   ref: "—",        dc: "ח", nominal: 980,  addon: 0,   bal: 980 },
    { date: "20/02/2026", type: 17,  ref: "רבעון 1",   dc: "ח", nominal: 410,  addon: 0,   bal: 1390 },
    { date: "15/03/2026", type: 100, ref: "BANK-8120", dc: "ז", nominal: 600,  addon: 0,   bal: 790 },
    { date: "20/04/2026", type: 17,  ref: "רבעון 2",   dc: "ח", nominal: 390,  addon: 0,   bal: 1180 },
    { date: "30/04/2026", type: 31,  ref: "חישוב מע'", dc: "ח", nominal: 0,    addon: 64,  bal: 1244 },
    { date: "30/04/2026", type: 31,  ref: "חישוב מע'", dc: "ח", nominal: 0,    addon: 142, bal: 1386 },
  ],
  shmira: [
    { date: "01/01/2026", type: 8,  ref: "—",        dc: "ח", nominal: 180, addon: 0,  bal: 180 },
    { date: "01/01/2026", type: 1,  ref: "אגרה שנתית",dc: "ח", nominal: 360, addon: 0,  bal: 540 },
    { date: "30/04/2026", type: 31, ref: "חישוב מע'", dc: "ח", nominal: 0,   addon: 22, bal: 562 },
    { date: "30/04/2026", type: 31, ref: "חישוב מע'", dc: "ח", nominal: 0,   addon: 38, bal: 600 },
  ],
  sewage: [
    { date: "01/01/2026", type: 8,   ref: "—",        dc: "ח", nominal: 360, addon: 0,  bal: 360 },
    { date: "01/01/2026", type: 1,   ref: "אגרה שנתית",dc: "ח", nominal: 600, addon: 0,  bal: 960 },
    { date: "10/03/2026", type: 100, ref: "BANK-8330", dc: "ז", nominal: 200, addon: 0,  bal: 760 },
    { date: "30/04/2026", type: 31,  ref: "חישוב מע'", dc: "ח", nominal: 0,   addon: 40, bal: 800 },
    { date: "30/04/2026", type: 31,  ref: "חישוב מע'", dc: "ח", nominal: 0,   addon: 96, bal: 896 },
  ],
  collect: [
    { date: "12/02/2026", type: 1,  ref: "מילגם חדש", dc: "ח", nominal: 200, addon: 0, bal: 200 },
    { date: "28/05/2026", type: 1,  ref: "מילגם חדש", dc: "ח", nominal: 120, addon: 0, bal: 320 },
  ],
};

const YEARS = Array.from({ length: 2026 - 2007 + 1 }, (_, i) => 2026 - i);

const AI_INSIGHTS = [
  { id: "growth", tone: "warn", icon: "trend",
    text: "החוב גדל ב-21% מתחילת השנה — ₪1,950 מתוכם ריבית והצמדה מצטברת.",
    source: "מנוע חישוב ריבית · תנועות 30/04/2026", weight: 1 },
  { id: "payer", tone: "good", icon: "check",
    text: "המשלם שילם 4 מתוך 5 התשלומים האחרונים במועד — פרופיל אמין להסדר.",
    source: "היסטוריית תנועות 2024–2026", weight: 2 },
  { id: "unpaid", tone: "crit", icon: "alert",
    text: "זוהו 2 שוברי ארנונה פתוחים לשנת 2026 (יתרת קרן ₪1,376).",
    source: "קובץ אב משלמים · נושא 1", weight: 1 },
];

const AI_ACTIONS = [
  { id: "arrangement", icon: "card",    label: "הצע הסדר תשלומים", hint: "6 תשלומים · ₪2,262 לחודש" },
  { id: "letter",      icon: "send",    label: "נסח מכתב התראה", hint: "טיוטה אוטומטית מוכנה" },
  { id: "interest",    icon: "calc",    label: "חשב ריבית מעודכנת", hint: "נכון להיום" },
  { id: "summary",     icon: "sigma",   label: "הפק סיכום למשלם", hint: "PDF · עברית" },
];

const QUICK_ACTIONS = [
  { id: "update_arrangement", icon: "card",    label: "עדכון הסדר",        hint: "הסדר תשלומים פעיל" },
  { id: "credit_charge",      icon: "receipt", label: "זיכוי חיוב לנכס",   hint: "ביטול / תיקון חיוב" },
  { id: "discounts",          icon: "wallet",  label: "הנחות לנכס",        hint: "ניהול הנחות וועדה" },
  { id: "swap_holders",       icon: "user",    label: "החלפת מחזיקים",     hint: "עדכון מחזיק הנכס" },
  { id: "view_refs",          icon: "docs",    label: "הצגת אסמכתאות",     hint: "צפייה במסמכים מקושרים" },
];

const NOTES = [
  { id: 1, author: "שמעון עמר", role: "פקיד גבייה", date: "28/05/2026 14:12", text: "המשלם פנה טלפונית, ביקש לפרוס את יתרת הארנונה ל-6 תשלומים. ממתין לאישור מנהל." },
  { id: 2, author: "רונית כהן", role: "מוקדנית", date: "21/05/2026 09:40", text: "נשלח מכתב התראה ראשון בדואר רשום. אסמכתא RR-44120." },
  { id: 3, author: "מערכת", role: "אוטומטי", date: "30/04/2026 02:00", text: "בוצע חישוב ריבית והצמדה חודשי לכלל השירותים הפתוחים." },
  { id: 4, author: "שמעון עמר", role: "פקיד גבייה", date: "12/02/2026 11:05", text: "אושרה הנחת ועדה 15% לשנת 2026 בגין מצב סוציו-אקונומי." },
];

const DOCUMENTS = [
  { id: 1, name: "שובר ארנונה 2026 — מחזור 1", type: "PDF", date: "01/01/2026", size: "240KB" },
  { id: 2, name: "אישור ועדת הנחות", type: "PDF", date: "12/02/2026", size: "180KB" },
  { id: 3, name: "מכתב התראה ראשון", type: "PDF", date: "21/05/2026", size: "96KB" },
  { id: 4, name: "צילום ת.ז.", type: "JPG", date: "08/03/2024", size: "1.2MB" },
];

function fmt(n) { return Math.round(n).toLocaleString("en-US"); }

export {
  PAYER, ENTITIES, SUBJECTS, SERVICES, TOTALS, TXNS, TXN_TYPES, YEARS,
  AI_INSIGHTS, AI_ACTIONS, QUICK_ACTIONS, NOTES, DOCUMENTS, fmt,
};
