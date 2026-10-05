// Admin print preview — stylesheet used for BOTH the on-screen preview sheet and
// the print/PDF iframe, so what the admin sees is exactly what gets printed.
// Values are taken from the print rules of
//   src/componets/kishanavedan/kisan-aavedan-portal.css
//   src/componets/kishanavedan/DragfruitsAndKiwi.css
//   src/componets/kishanavedan/Kiwi.css

export const ADMIN_PRINT_CSS = `
:root {
  --ink: #1e293b;
  --ink-soft: #64748b;
  --seal: #2563eb;
  --seal-dk: #1e3a8a;
  --rule: #e2e8f0;
  --fill: #f8fafc;
  --alert: #dc2626;
  --gov-green: #17633a;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background: #fff;
  color: #000;
  font-family: "Noto Sans Devanagari", "Nirmala UI", "Mangal", "Segoe UI", sans-serif;
  font-size: 11.5px;
  line-height: 1.55;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.admin-print-sheet { width: 100%; color: #000; }
.admin-print-sheet .scheme-doc { width: 100%; max-width: 100%; margin: 0 auto; background: #fff; }

/* ══════════ फेंसिंग / वर्मी (KisanAavedanPortal.js + KisanAvedan.js) ══════════ */
.admin-print-sheet .doc,
.admin-print-sheet .appdoc,
.admin-print-sheet .bill-doc,
.admin-print-sheet .affidavit-doc {
  background: #fff !important;
  color: #000;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  font-size: 11.5px;
  line-height: 1.55;
}
.admin-print-sheet .appdoc h3,
.admin-print-sheet .appdoc h4 {
  color: #000 !important;
  text-align: center;
  text-decoration: none;
  margin: 0 0 2px !important;
}
.admin-print-sheet .bill-title {
  color: #000;
  font-weight: 700;
  text-align: center;
  margin: 0 0 2px;
}
.admin-print-sheet .bill-header {
  border: 1px solid #d5dce8;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
}
.admin-print-sheet .bill-date-place { display: none !important; }
.admin-print-sheet .bill-kicker {
  background: #2563eb;
  color: #fff;
  padding: 7px 12px;
  text-align: center;
}
.admin-print-sheet .bill-rule { background: #eab308; height: 3px; width: 76px; margin: 0 auto 10px; }
.admin-print-sheet .bill-meta {
  display: grid;
  grid-template-columns: 1.15fr 1.55fr 0.8fr;
  background: #f8fafc;
  border-top: 1px solid #d5dce8;
}
.admin-print-sheet .bill-meta > div {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  background: #f8fafc;
  border-right: 1px solid #d5dce8;
  text-align: center;
  padding: 4px 6px;
}
.admin-print-sheet .bill-meta > div:last-child { border-right: 0; }
.admin-print-sheet .bill-meta span { display: inline; margin-bottom: 0; color: #64748b; }
.admin-print-sheet .bill-meta b { flex: 0 1 auto; min-width: 0; color: #1e293b; }
.admin-print-sheet .serial-title,
.admin-print-sheet .appdoc h5,
.admin-print-sheet .bill-table-title,
.admin-print-sheet .aff-sub,
.admin-print-sheet .aff-kicker,
.admin-print-sheet .bill-table-heading {
  display: block;
  background: #fff !important;
  color: #000 !important;
  border: 1px solid #000 !important;
  border-radius: 0 !important;
  font-size: 11.5px;
  font-weight: 700;
  text-align: center;
  margin: 10px 0 0 !important;
  padding: 3px 6px !important;
  text-decoration: none;
  box-shadow: none !important;
}
.admin-print-sheet .bill-table-heading { padding: 5px 8px !important; }
.admin-print-sheet .bill-table-subtitle {
  background: #fff !important;
  color: #000 !important;
  font-size: 10.5px;
  font-weight: 700;
  padding: 0 0 2px;
  border-bottom: 1px solid #000;
  margin-bottom: 2px;
  text-align: center;
}
.admin-print-sheet .serial-layout { display: block; margin: 0; }
.admin-print-sheet .serial-section {
  border: 0 !important;
  border-radius: 0 !important;
  padding: 0 !important;
  margin: 0 0 6px;
  break-inside: avoid;
  page-break-inside: avoid;
}
.admin-print-sheet .kv {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  margin: 0;
}
.admin-print-sheet .kv .r {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: flex-start;
  gap: 4px;
  padding: 3px 6px;
  min-height: 26px;
  border: 1px solid #000;
  margin: 0 -1px -1px 0;
  background: #fff;
}
.admin-print-sheet .kv .r b {
  color: #000;
  font-size: 10.5px;
  font-weight: 600;
  white-space: normal;
  line-height: 1.3;
  flex: 0 1 auto;
}
.admin-print-sheet .kv .r > b:first-child { flex: 0 0 auto; min-width: 45%; padding-right: 2px; }
.admin-print-sheet .kv .r > b:not(:first-child) { flex: 0 0 auto; }
.admin-print-sheet .kv .r .auto,
.admin-print-sheet .kv .r .ln,
.admin-print-sheet .kv .r .blank {
  display: inline-block;
  width: auto;
  flex: 0 1 auto;
  min-width: 0;
  color: #000;
  font-size: 11.5px;
  font-weight: 600;
  background: transparent !important;
  border: 0 !important;
  border-bottom: 0 !important;
  border-radius: 0 !important;
  padding: 0 1px 1px !important;
  box-shadow: none !important;
  text-align: left !important;
  -webkit-appearance: none;
  appearance: none;
}
.admin-print-sheet .kv .r .ln { min-width: 64px; }
.admin-print-sheet .kv .r .ln.sm { flex: 0 0 110px; }
.admin-print-sheet .kv .r .ln.rt { text-align: right !important; }
.admin-print-sheet .calc-hint { font-size: 10.5px; font-style: italic; color: #4a5a50; }
.admin-print-sheet .auto { font-weight: 700; color: #000; }

.admin-print-sheet table {
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  margin: 4px 0 0;
  outline: 1px solid #000;
  outline-offset: -1px;
}
.admin-print-sheet th,
.admin-print-sheet td {
  border: 1px solid #000 !important;
  padding: 3px 5px;
  font-size: 11px;
  color: #000;
  background: #fff !important;
  vertical-align: middle;
  overflow-wrap: anywhere;
  word-break: break-word;
  white-space: normal;
}
.admin-print-sheet th {
  font-size: 10.5px;
  font-weight: 700;
  text-align: center;
  background: #f0f0f0 !important;
}
/* border-collapse के कारण टेबल का बाह्य किनारा कोशिका बॉर्डर से नहीं बनता —
   इसलिए अंतिम स्तम्भ की दाईं लाइन अलग से बनाई जाती है, वरना PDF में गायब
   दिखती है (स्क्रीन पर दिखती है, प्रिंट पर नहीं)। */
.admin-print-sheet table tr > *:last-child { border-right: 1px solid #000; }
.admin-print-sheet .scheme-doc table tr > *:last-child { border-right: 1px solid #666; }
.admin-print-sheet .xbox table tr > *:last-child { border-right: 0; }
.admin-print-sheet .summaryTbl tr > *:last-child { border-right: 0; }
.admin-print-sheet .infoTable td.flabel,
.admin-print-sheet .landtable tr.tot td,
.admin-print-sheet .bill-doc > table .tot td,
.admin-print-sheet .xbox tr.hi td {
  background: #f6f6f6 !important;
  color: #000;
  font-weight: 700;
}
.admin-print-sheet .infoTable td.flabel { width: 150px; font-size: 10.5px; }
.admin-print-sheet .xbox,
.admin-print-sheet .note-box,
.admin-print-sheet .note,
.admin-print-sheet .decl,
.admin-print-sheet .appnote,
.admin-print-sheet .declaration-box,
.admin-print-sheet .report-box,
.admin-print-sheet .appgrid,
.admin-print-sheet .appok,
.admin-print-sheet .appbad {
  background: #fff !important;
  color: #000 !important;
  border: 1px solid #000 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 5px 8px !important;
  margin: 6px 0 0 !important;
  font-size: 11px;
  line-height: 1.6;
}
.admin-print-sheet .appnote {
  width: auto !important;
  max-width: 100% !important;
  box-sizing: border-box;
  overflow-wrap: anywhere;
}
.admin-print-sheet .appnote-values {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 14px;
}
.admin-print-sheet .appnote-entry { white-space: normal; }
.admin-print-sheet .appnote-explanation { margin-top: 4px; }
.admin-print-sheet .noprint,
.admin-print-sheet .addrow,
.admin-print-sheet .rm,
.admin-print-sheet .land-row-actions,
.admin-print-sheet .app-actions,
.admin-print-sheet .save-bar {
  display: none !important;
}
.admin-print-sheet .xbox .xh,
.admin-print-sheet .note-title {
  background: #fff !important;
  color: #000 !important;
  font-size: 10.5px;
  font-weight: 700;
  padding: 0 0 2px;
  border-bottom: 1px solid #000;
  margin-bottom: 2px;
}
.admin-print-sheet .xbox table { width: 100% !important; margin: 0; }
.admin-print-sheet .xbox td {
  border: 0 !important;
  border-bottom: 1px solid #999 !important;
  padding: 2px 4px;
}
.admin-print-sheet .xbox td.v { width: auto; font-weight: 700; text-align: right; }
.admin-print-sheet .summaryTbl { outline: 1px solid #000; outline-offset: -1px; }
.admin-print-sheet .summaryTbl td { border: 0 !important; border-bottom: 1px dotted #999 !important; padding: 3px 6px; }
.admin-print-sheet .summaryTbl td:first-child { color: #1e293b; }
.admin-print-sheet .summaryTbl td.sv { text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }
.admin-print-sheet .summaryTbl tr.hi td { background: #f6f6f6 !important; }
.admin-print-sheet .expense-table .calc.num { text-align: right; }
.admin-print-sheet .landtable td.calc { font-weight: 700; }
.admin-print-sheet .land-sno { text-align: center; }

.admin-print-sheet input,
.admin-print-sheet select,
.admin-print-sheet textarea {
  background: transparent !important;
  color: #000 !important;
  border: 0 !important;
  
  border-radius: 0 !important;
  box-shadow: none !important;
  font: inherit;
  font-size: 11px;
  min-width: 60px;
  padding: 1px 2px !important;
  -webkit-appearance: none;
  appearance: none;
  text-align: left !important;
}
.admin-print-sheet select { padding-right: 0 !important; }
.admin-print-sheet .landtable input,
.admin-print-sheet .landtable select,
.admin-print-sheet .infoTable input,
.admin-print-sheet .infoTable select {
  border: 0 !important;
  border-bottom: 0 !important;
  padding: 1px 2px !important;
  width: 100%;
}
.admin-print-sheet .landSelfName,
.admin-print-sheet .landSelfFather,
.admin-print-sheet .landSelfAadhaar,
.admin-print-sheet .landVil {
  background: #eef1ec !important;
  color: #4a5a50 !important;
}
.admin-print-sheet .grid2 {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 4px 10px;
}
.admin-print-sheet .field label { display: block; font-size: 13px; color: #64748b; margin-bottom: 1px; }
.admin-print-sheet .field-value-line {
  display: block;
  width: 100%;
  min-height: 18px;

}
.admin-print-sheet .field-value-line input,
.admin-print-sheet .field-value-line select {
  display: block;
  width: 100%;
  min-height: 17px;
  border: 0 !important;
  padding: 0 2px !important;
}
.admin-print-sheet .st {
  display: block;
  background: #fff !important;
  color: #000 !important;
  border: 1px solid #000 !important;
  font-size: 11.5px;
  font-weight: 700;
  text-align: center;
  margin: 10px 0 0 !important;
  padding: 3px 6px !important;
}
.admin-print-sheet .declaration-box p { margin: 4px 0; }
.admin-print-sheet .farmer-signature {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  flex-wrap: wrap;
  margin-top: 12px;
  line-height: 1.8;
}
.admin-print-sheet .report-sign { margin-top: 24px; text-align: right; line-height: 1.8; }
.admin-print-sheet .prabhari-box { text-align: justify; }
.admin-print-sheet .appgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 12px; }
.admin-print-sheet .flag {
  margin-top: 6px;
  padding: 4px 8px;
  font-size: 11px;
  border: 1px solid #000;
}
.admin-print-sheet .flag.ok { background: #f1f8f2 !important; }
.admin-print-sheet .flag.bad { background: #fdf1f1 !important; }
.admin-print-sheet .card-print-block { margin: 0; }
.admin-print-sheet .empty { text-align: center; color: #444; }

/* KisanAvedanPortal.js / KisanAvedan.js — व्यय विवरण के "राजसहायता के मानक"
   कार्ड एवं अनुभाग कार्ड (kisan-aavedan-portal.css .card/.cap/.pad/.grid) */
.admin-print-sheet .card {
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: 12px;
  margin: 0 0 10px;
  overflow: hidden;
}
.admin-print-sheet .card > .cap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 7px 12px;
  border-bottom: 1px solid var(--rule);
  background: var(--fill);
  font-weight: 700;
  font-size: 12px;
  color: var(--ink);
}
.admin-print-sheet .cap i {
  width: 8px;
  height: 8px;
  background: var(--seal);
  border-radius: 50%;
  display: inline-block;
  flex: 0 0 8px;
}
.admin-print-sheet .cap small {
  margin-left: auto;
  font-weight: 500;
  color: var(--ink-soft);
  font-size: 10px;
  text-align: right;
}
.admin-print-sheet .pad { padding: 10px 12px; }
.admin-print-sheet .grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}
.admin-print-sheet label.f {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: var(--ink-soft);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.admin-print-sheet .pad > .grid input,
.admin-print-sheet .pad > .grid select {
  width: 100%;
  font: inherit;
  font-size: 11px;
  padding: 3px 4px !important;
  border: 1px solid var(--rule) !important;
  background: #fff !important;
  border-radius: 6px;
  color: var(--ink);
}

/* शपथ-पत्र (फेंसिंग) */
.admin-print-sheet .affidavit-doc .aff-title {
  color: #000;
  font-weight: 700;
  text-align: center;
  margin: 0 0 2px;
}
.admin-print-sheet .affidavit-doc .aff-line { border-top: 1px solid #000; margin: 4px 0 8px; }
.admin-print-sheet .affidavit-doc .aff-intro,
.admin-print-sheet .affidavit-doc .aff-item {
  line-height: 1.75;
  text-align: justify;
  margin: 6px 0;
}
.admin-print-sheet .affidavit-doc .aff-decl {
  margin: 10px 0;
  padding: 6px 8px;
  border: 1px solid #000;
  text-align: justify;
  line-height: 1.7;
}
.admin-print-sheet .affidavit-doc .aff-sign-plain {
  margin-top: 10px;
  padding: 6px 8px;
  border: 1px solid #000;
  line-height: 1.7;
}
.admin-print-sheet .affidavit-doc .aff-sign-plain > div { margin: 1px 0; }
.admin-print-sheet .affidavit-doc .aff-consent-block { margin-top: 10px; }
.admin-print-sheet .aff-land th,
.admin-print-sheet .aff-land td { border: 1px solid #000 !important; }

/* ══════════ ड्रैगन फ्रूट / कीवी (DragfruitsAndKiwi.js + KiwiFruits.js) ══════════ */
.admin-print-sheet .print-doc,
.admin-print-sheet .print-doc * { color: #000; }
.admin-print-sheet .print-doc table { display: table !important; border-collapse: collapse; width: 100% !important; max-width: 100% !important; margin-top: 0; }
.admin-print-sheet .print-doc thead { display: table-header-group !important; }
.admin-print-sheet .print-doc tbody { display: table-row-group !important; }
.admin-print-sheet .print-doc tfoot { display: table-footer-group !important; }
.admin-print-sheet .print-doc tr { display: table-row !important; }
.admin-print-sheet .print-doc th,
.admin-print-sheet .print-doc td {
  display: table-cell !important;
  width: auto !important;
  max-width: none !important;
  height: auto !important;
  border: 1px solid #666 !important;
  padding: 4px 5px !important;
  text-align: left !important;
  font-size: 9px !important;
  vertical-align: middle;
  white-space: normal !important;
  overflow-wrap: anywhere !important;
  word-break: normal !important;
  background: #fff !important;
  color: #000 !important;
  box-sizing: border-box;
}
.admin-print-sheet .print-doc th {
  position: static !important;
  top: auto !important;
  z-index: auto !important;
  letter-spacing: 0 !important;
  background: #eaf1ec !important;
  color: #000 !important;
}
.admin-print-sheet .print-doc td.qty,
.admin-print-sheet .print-doc th { text-align: center !important; }
.admin-print-sheet .print-doc .money { text-align: right !important; }
.admin-print-sheet .print-doc h2,
.admin-print-sheet .print-doc h3,
.admin-print-sheet .print-doc .doc-title,
.admin-print-sheet .print-doc .doc-subtitle,
.admin-print-sheet .print-doc .af-title { color: #17633a !important; }
.admin-print-sheet .print-doc h2 { font-size: 16px; margin: 12px 0 8px; }
.admin-print-sheet .print-doc h3 {
  display: block;
  border-bottom: 1px solid #7f8a83;
  padding-bottom: 4px;
  margin: 12px 0 8px;
  font-size: 13px;
  break-after: avoid-page;
  page-break-after: avoid;
}
.admin-print-sheet .print-doc .application-header {
  text-align: center;
  border-bottom: 2px solid #17633a;
  margin-bottom: 12px;
  padding-bottom: 8px;
  break-after: avoid-page;
  page-break-after: avoid;
}
.admin-print-sheet .print-doc .application-header h2 {
  display: block;
  border: 0;
  padding: 0;
  margin: 0 0 2px;
  color: #17633a !important;
  font-size: 18px;
}
.admin-print-sheet .print-doc .application-header p { margin: 0; line-height: 1.15; }
.admin-print-sheet .print-doc .print-only { display: block !important; text-align: center; }
.admin-print-sheet .print-doc .print-only h2 { margin: 0 0 4px; }
.admin-print-sheet .print-doc .print-only p { margin: 0 0 10px; }
.admin-print-sheet .print-doc .small { color: #68736d !important; font-size: 9px !important; }
.admin-print-sheet .print-doc .spec { font-size: 9px !important; line-height: 1.45; }
.admin-print-sheet .print-doc .note {
  border-left: 4px solid #b58a35;
  background: #f8f5e8 !important;
  padding: 8px;
  margin: 8px 0;
  border-radius: 0;
  font-size: 11px;
  line-height: 1.6;
}
.admin-print-sheet .print-doc .checklist { padding-left: 20px; margin: 6px 0; }
.admin-print-sheet .print-doc .checklist li { margin: 4px 0; font-size: 11px; line-height: 1.6; }
.admin-print-sheet .print-doc .finalbox {
  border: 2px solid #17633a !important;
  padding: 8px !important;
  margin-top: 14px !important;
  break-inside: avoid-page;
  border-radius: 0;
  overflow: visible;
}
.admin-print-sheet .print-doc .finalrow {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  background: #f3f7f4 !important;
  border-bottom: 1px dashed #b8c8bd !important;
  padding: 7px 9px;
}
.admin-print-sheet .print-doc .finalrow:last-child { color: #17633a !important; font-size: 16px; }
.admin-print-sheet .print-doc .summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
  margin: 12px 0 0;
}
.admin-print-sheet .print-doc .metric {
  background: #f3f7fb;
  border: 1px solid #d2e0ec;
  border-radius: 9px;
  padding: 9px 11px;
  min-width: 0;
}
.admin-print-sheet .print-doc .metric span {
  display: block;
  color: #61748a;
  font-size: 10.5px;
  font-weight: 600;
  line-height: 1.3;
}
.admin-print-sheet .print-doc .metric b {
  display: block;
  font-size: 15px;
  margin-top: 3px;
  font-weight: 800;
  color: #000;
}
.admin-print-sheet .print-doc .table-wrap {
  overflow: visible !important;
  border: 1px solid #c9d6e3;
  border-radius: 9px;
  margin-top: 8px;
}
.admin-print-sheet .print-doc .project-standard-table { table-layout: fixed !important; }
.admin-print-sheet .print-doc .project-standard-table th:nth-child(1),
.admin-print-sheet .print-doc .project-standard-table td:nth-child(1) { width: 6% !important; }
.admin-print-sheet .print-doc .project-standard-table th:nth-child(2),
.admin-print-sheet .print-doc .project-standard-table td:nth-child(2) { width: 19% !important; }
.admin-print-sheet .print-doc .project-standard-table th:nth-child(3),
.admin-print-sheet .print-doc .project-standard-table td:nth-child(3) { width: 40% !important; }
.admin-print-sheet .print-doc .project-standard-table th:nth-child(4),
.admin-print-sheet .print-doc .project-standard-table td:nth-child(4) { width: 23% !important; }
.admin-print-sheet .print-doc .project-standard-table th:nth-child(5),
.admin-print-sheet .print-doc .project-standard-table td:nth-child(5) { width: 12% !important; }
.admin-print-sheet .print-doc .project-standard-table .spec { font-size: 8px !important; line-height: 1.35; }
.admin-print-sheet .print-doc .aff-doc {
  max-width: 100%;
  margin: 0 auto 12px !important;
  padding: 0 2mm !important;
  line-height: 1.55;
  border: 0 !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  background: #fff;
}
.admin-print-sheet .print-doc .doc-title { font-size: 18px; font-weight: 800; text-align: center; }
.admin-print-sheet .print-doc .doc-subtitle { font-size: 14px; font-weight: 700; text-align: center; margin-bottom: 12px; }
.admin-print-sheet .print-doc .aff-doc p { margin: 8px 0; text-align: justify; }
.admin-print-sheet .print-doc .aff-doc ol { padding-left: 24px; }
.admin-print-sheet .print-doc .aff-doc li { margin: 6px 0; text-align: justify; }
.admin-print-sheet .print-doc .sig,
.admin-print-sheet .print-doc .signature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 28px;
  page-break-inside: avoid;
}
.admin-print-sheet .print-doc .sig > div:last-child,
.admin-print-sheet .print-doc .signature-grid > div:last-child { text-align: right; }
.admin-print-sheet .print-doc .application-sign-off { break-inside: avoid-page; page-break-inside: avoid; }
.admin-print-sheet .print-doc .application-annexure { margin-top: 6px; }
.admin-print-sheet .print-doc .verify-box {
  margin-top: 18px;
  border: 1px solid #777 !important;
  padding: 12px !important;
  page-break-inside: avoid;
}
.admin-print-sheet .print-doc .aff-note { font-size: 9px; color: #68736d !important; }
.admin-print-sheet .page-break,
.admin-print-sheet .page-break-doc,
.admin-print-sheet .aff-page-break {
  break-before: page;
  page-break-before: always;
}
.admin-print-sheet .print-doc .print-footer { text-align: center; color: #68736d !important; font-size: 9px; padding: 12px 0; }
.admin-print-sheet .print-doc .anudan-form {
  font-size: 12px;
  line-height: 1.45;
  border: 0 !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  background: #fff;
}
.admin-print-sheet .print-doc .anudan-form .af-head { font-size: 15px; font-weight: 700; text-align: center; }
.admin-print-sheet .print-doc .anudan-form .af-title { font-size: 17px; margin: 2px 0 10px; text-align: center; }
.admin-print-sheet .print-doc .anudan-form .af-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 20px;
  font-size: 11px;
  margin-bottom: 7px;
}
.admin-print-sheet .print-doc .af-bank {
  margin: 10px 0 12px;
  border: 1px solid #777 !important;
  padding: 7px 9px !important;
  break-inside: avoid;
}
.admin-print-sheet .print-doc .af-bank h4 { margin: 0 0 6px; font-size: 13px; }
.admin-print-sheet .print-doc .af-bank-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px 16px; font-size: 11px; }
.admin-print-sheet .print-doc .af-bank-grid > div { border-bottom: 1px solid #ddd; padding: 2px 0; }
.admin-print-sheet .print-doc .af-para { margin: 9px 0; }
.admin-print-sheet .print-doc .af-sign { margin-top: 28px; font-size: 12.5px; break-inside: avoid; page-break-inside: avoid; }
.admin-print-sheet .print-doc .af-inspect { margin-top: 14px; }
.admin-print-sheet .print-doc .af-inspect-title { font-weight: 700; margin-bottom: 4px; }
.admin-print-sheet .print-doc .af-footer-sign { text-align: right; margin-top: 6px; }
.admin-print-sheet .print-doc .af-total td { background: #f4f4f4 !important; font-weight: 800; }

/* ══════════ पेज मैनेजमेंट ══════════ */
.admin-print-sheet .scheme-doc tr,
.admin-print-sheet .appdoc tr,
.admin-print-sheet .bill-doc tr,
.admin-print-sheet .affidavit-doc tr { break-inside: avoid; page-break-inside: avoid; }
.admin-print-sheet thead { display: table-header-group; }
.admin-print-sheet tfoot { display: table-footer-group; }
.admin-print-sheet .scheme-doc h2,
.admin-print-sheet .appdoc h2,
.admin-print-sheet .appdoc h3,
.admin-print-sheet .appdoc h4,
.admin-print-sheet .appdoc h5,
.admin-print-sheet .bill-title,
.admin-print-sheet .st,
.admin-print-sheet .serial-title { break-after: avoid; page-break-after: avoid; }
.admin-print-sheet .scheme-doc .note,
.admin-print-sheet .scheme-doc .finalbox,
.admin-print-sheet .scheme-doc .aff-doc .sig,
.admin-print-sheet .scheme-doc .verify-box,
.admin-print-sheet .appdoc > *,
.admin-print-sheet .bill-doc > *,
.admin-print-sheet .affidavit-doc > *,
.admin-print-sheet .appdoc .grid2,
.admin-print-sheet .report-box,
.admin-print-sheet .declaration-box,
.admin-print-sheet .prabhari-box,
.admin-print-sheet .summaryTbl,
.admin-print-sheet .farmer-signature,
.admin-print-sheet .report-sign,
.admin-print-sheet .appnote,
.admin-print-sheet .xbox,
.admin-print-sheet .note,
.admin-print-sheet .note-box,
.admin-print-sheet .decl,
.admin-print-sheet .flag {
  break-inside: avoid;
  page-break-inside: avoid;
}
.admin-print-sheet .bill-doc > .serial-layout {
  break-inside: auto !important;
  page-break-inside: auto !important;
}
.admin-print-sheet .bill-doc > .bill-header,
.admin-print-sheet .bill-doc > .bill-table-heading {
  break-inside: avoid !important;
  page-break-inside: avoid !important;
}
.admin-print-sheet p, .admin-print-sheet li { orphans: 3; widows: 3; }
.admin-print-sheet table, .admin-print-sheet td, .admin-print-sheet th { box-sizing: border-box; }
.admin-print-sheet td, .admin-print-sheet th { max-width: 100%; }

@page { size: A4 portrait; margin: 12mm; }

@media print {
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
  .admin-print-sheet { width: auto !important; max-width: none !important; }
  .admin-print-sheet .scheme-doc { width: auto !important; max-width: none !important; }
}
`;
