import React, { useEffect, useLayoutEffect, useState } from "react";
import "../kishanavedan/Kiwi.css";

const ID_PREFIX = "kiwi-";

const MASTER = {
  kiwi: {
    name: "कीवी उद्यान स्थापना",
    baseNali: 20, baseHa: 0.40, baseCost: 1184000,
    subsidy: (n, type) => type === "group" ? (n / 50 <= 5 ? 70 : 50) : ((n / 50) <= 1 ? 70 : 50),
    components: [
      { name: "भूमि विकास", qty: n => ({ v: "सम्पूर्ण परियोजना क्षेत्र हेतु", u: "" }), cost: 60000, spec: "भूमि समतलीकरण, सफाई, जुताई, ढलान के अनुसार मेड़बंदी तथा 6 मीटर × 4 मीटर की रोपण दूरी के अनुसार स्थल का layout/रेखांकन।" },
      { name: "गड्ढा खुदान एवं भराई", qty: n => ({ v: Math.round(167 * (n / 20)), u: "मुख्य गड्ढे" }), cost: 50000, spec: "कुल मुख्य गड्ढे निर्धारित अनुपात में। गड्ढे का आकार 1 मीटर × 1 मीटर × 1 मीटर। प्रति गड्ढा 30 किलोग्राम कम्पोस्ट मिलाकर भराई तथा भूमि सतह से 0.30 मीटर ऊँचाई तक भराव। रोपण दूरी 6 मीटर × 4 मीटर।" },
      { name: "टपक सिंचाई एवं जल संचयन प्रणाली", qty: n => ({ v: "1", u: "पूर्ण सेट" }), cost: 64000, spec: "फर्टिगेशन सहित वाटर टैंक, पम्प, बाईपास वाल्व, सेंड सेपरेटर/हाइड्रोसाइक्लोन फिल्टर, वेंचुरी इंजेक्टर, प्रेशर गेज, मीडिया फिल्टर, NRV, मेन लाइन, सब-मेन लाइन, कंट्रोल वाल्व, एयर रिलीज वाल्व, फ्लश वाल्व, इंड कैप तथा ड्रिपर/इमीटर्स।" },
      { name: "ट्रेलिस (T-Bar) सिस्टम", qty: n => { const p = { 5: 42, 10: 84, 15: 125, 20: 167 }; const key = Number(n); const main = Object.prototype.hasOwnProperty.call(p, key) ? p[key] : Math.round(167 * (key / 20)); return { v: main, u: "नग (मुख्य पौध/रोपण स्थान के अनुसार)" } }, cost: 600000, spec: "T-Bar सिस्टम: मोटाई 6 mm, कुल ऊँचाई 2.5 मीटर (2.0 मीटर जमीन से ऊपर + 0.5 मीटर गहराई), arm चौड़ाई 2.0 मीटर, T-Bar दूरी 6 मीटर तथा 4 mm galvanized तार पूरी तरह कसा हुआ। T-Bar की संख्या मुख्य पौध/मुख्य रोपण स्थानों के अनुसार दिखाई जाएगी।" },
      { name: "GI चेन लिंक्ड फेंसिंग", qty: n => { const L = Math.round(200 + 4 * Number(n)); return { v: L, u: "मीटर" } }, cost: 295000, spec: "गैल्वेनाइज्ड GI chain-linked fencing, लोहे के खम्भों सहित। फेंसिंग की लंबाई किसान के स्वीकृत क्षेत्रफल की area-wise table के अनुसार होगी।" },
      { name: "खेती के औजार", qty: n => ({ v: "1", u: "मानक सेट" }), cost: 10000, spec: "सेकेटियर, pruning shear, sprayer आदि आवश्यक औद्यानिक/कृषि औजार।" },
      { name: "पौध संरक्षण रसायन / विकास नियामक / उर्वरक", qty: n => ({ v: "1", u: "प्रथम वर्ष की मानक आवश्यकता" }), cost: 15000, spec: "प्रथम वर्ष हेतु आवश्यक मात्रा में पौध संरक्षण रसायन, growth regulators तथा उर्वरक।" },
      { name: "विविध लागत", qty: n => ({ v: "1", u: "मानक प्रावधान" }), cost: 32000, spec: "गेट, बोर्ड तथा कटाई उपरान्त प्रबंधन हेतु plastic crates, corrugated fibre boxes आदि।" },
      { name: "रोपण सामग्री", qty: n => { const f = n / 20, main = Math.round(167 * f), gap = Math.round(41 * f), total = main + gap, female = Math.round(total * .9), male = total - female; return { v: total, u: `नग (मुख्य ${main} + gap ${gap}; मादा ${female}, नर ${male})` } }, cost: 58000, spec: "कुल उच्च गुणवत्तायुक्त कीवी पौधे = 167 मुख्य + 41 अतिरिक्त (25% रिक्तता पूर्ति हेतु बैकअप स्टॉक) प्रति 20 नाली के अनुपात में। कुल पौधों में 9 मादा : 1 नर अनुपात। दूरी 6m × 4m। अतिरिक्त पौधे replacement हेतु सुरक्षित रखे जाएंगे।" }
    ],
    instructions: ["6 मीटर × 4 मीटर रोपण दूरी के अनुसार स्थल का layout तैयार करें।", "प्रति मानक क्षेत्र मुख्य गड्ढे निर्धारित आकार में तैयार कर 30 किग्रा कम्पोस्ट के साथ भरें।", "कुल पौधों में 9 मादा : 1 नर अनुपात बनाए रखें।", "अतिरिक्त 41/20 नाली अनुपात के पौधों को backup stock के रूप में सुरक्षित रखें और आवश्यकता पर replacement करें।", "T-Bar trellis को निर्धारित height, arm width, spacing और 4 mm galvanized wire specification के अनुसार स्थापित करें।", "पूर्ण drip/fertigation system स्थापित करें।", "GI chain-link fencing, औजार, उर्वरक/रसायन और miscellaneous provisions मानक के अनुसार रखें।"]
  }
};

const APP_STEPS = [
  { title: "योजना + मूल जानकारी", sub: "योजना, नाम, पिता/पति, लिंग, मोबाइल, पता और आवेदन संख्या", anchor: "wf-basic" },
  { title: "भूमि / सह-खातेदार", sub: "स्वयं/सह-खातेदार, संबंध, खाता, खसरा और क्षेत्रफल का exact match", anchor: "wf-land" },
  { title: "बैंक + कार्य निष्पादन", sub: "बैंक विवरण और स्वयं/फर्म द्वारा कार्य", anchor: "wf-bank" },
  { title: "दस्तावेज + घोषणा", sub: "संलग्न दस्तावेज और पात्रता/किसान घोषणा", anchor: "wf-docs" },
  { title: "मानक बनाएं", sub: "क्षेत्रफल से पूर्ण परियोजना मानक और लागत/राजसहायता", anchor: "wf-standard" },
  { title: "शपथ-पत्र / NOC", sub: "स्वयं या सह-खातेदार के अनुसार automatic affidavit/NOC", anchor: "wf-affidavit" },
  { title: "अनुदान व्यय", sub: "चरण चुनें, project component से voucher जोड़ें, भुगतान पाने वाला चुनें", anchor: "wf-grant" },
  { title: "समीक्षा + Print", sub: "आवेदन, मानक, affidavit/NOC और अनुदान print", anchor: "wf-review" },
];

const SIDE_TABS = [
  { id: "work", label: "⚙ कार्य" }, { id: "view", label: "👁 देखें" },
  { id: "print", label: "🖨 प्रिंट" }, { id: "anudan", label: "💰 अनुदान" },
  { id: "demo", label: "🧪 Demo" }, { id: "steps", label: "🧭 चरण" },
];

const CENTERS = ["कोटद्वार", "किनगोड़िखाल", "चौखाल", "धुमाकोट", "बीरोंखाल", "हल्दूखाल", "किल्वोंखाल", "चेलूसैंण", "जयहरीखाल", "जेठागांव", "देवियोंखाल", "सिलोगी", "सिसल्ड़ी", "पौखाल", "सतपुली", "संगलाकोटी", "देवराजखाल", "पोखड़ा", "वेदीखाल", "विथ्याणी", "गंगाभोगपुर", "दिउली", "दुगड्डा", "सेंधीखाल"];
const RELATIONS = ["सहखातेदार", "भाई", "पुत्र", "पिता", "पत्नी", "अन्य"];

const KiwiFruits = () => {
  const [activeSideTab, setActiveSideTab] = useState("view");
  const [workflowStep, setWorkflowStep] = useState(0);
  const [sideOpen, setSideOpen] = useState(false);
  const [flashAnchor, setFlashAnchor] = useState(null);
  const [headerH, setHeaderH] = useState(0);
  const [footerH, setFooterH] = useState(0);

  const [form, setForm] = useState({
    name: "", father: "", gender: "पुरुष", mobile: "", aadhaar: "", udyan: "",
    district: "", block: "", center: "", village: "", post: "", appno: "KWI-2026-0001", remarks: "",
    beneficiary: "individual",
    bankHolder: "", bankName: "", bankBranch: "", bankAccount: "",
    bankIfsc: "", bankType: "बचत खाता",
    workMode: "firm", firmName: "", firmReg: "", workRemark: "",
    declWater: "", declIrrigation: "", declPrevious: "", declLand: "", declInspection: "", declShare: "",
  });

  const [landRows, setLandRows] = useState([
    { rel: "स्वयं", name: "", father: "", village: "", khata: "", khasra: "", gender: "पुरुष", area: "" },
    ...Array(4).fill({ rel: "", name: "", father: "", village: "", khata: "", khasra: "", gender: "पुरुष", area: "" })
  ]);

  const [htmlOutputs, setHtmlOutputs] = useState({ app: "", report: "", aff: "", consent: "", anudan: "" });
  const [printCheckboxes, setPrintCheckboxes] = useState({ app: true, project: true, aff: true, consent: true, anudan: false });

  useEffect(() => {
    setLandRows(prev => {
      const newArr = [...prev];
      newArr[0] = { ...newArr[0], name: form.name, father: form.father, village: form.village };
      return newArr;
    });
  }, [form.name, form.father, form.village]);

  useLayoutEffect(() => {
    const measure = () => {
      const nav = document.querySelector(".Dash-header, .navbar-top");
      if (nav) {
        const pos = window.getComputedStyle(nav).position;
        const h = pos === "fixed" ? Math.round(nav.getBoundingClientRect().height) : 0;
        setHeaderH((prev) => (prev === h ? prev : h));
      }
      const foot = document.querySelector(".copyright-footer");
      if (foot) {
        const pos = window.getComputedStyle(foot).position;
        const h = pos === "fixed" ? Math.round(foot.getBoundingClientRect().height) : 0;
        setFooterH((prev) => (prev === h ? prev : h));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    let observer;
    if (window.ResizeObserver) {
      observer = new ResizeObserver(measure);
      const nav = document.querySelector(".Dash-header, .navbar-top");
      if (nav) observer.observe(nav);
    }
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      if (observer) observer.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("kiwi-lock", sideOpen);
    return () => document.body.classList.remove("kiwi-lock");
  }, [sideOpen]);

  useEffect(() => {
    if (!flashAnchor) return undefined;
    const t = setTimeout(() => setFlashAnchor(null), 1400);
    return () => clearTimeout(t);
  }, [flashAnchor]);

  useEffect(() => {
    const clearPrint = () => {
      document.body.classList.remove("print-app", "print-project", "print-affidavit", "print-consent", "print-affidavit-all", "print-anudan", "print-selected", "print-sel-application", "print-sel-project", "print-sel-affidavit", "print-sel-consent", "print-sel-anudan");
    };
    window.addEventListener("afterprint", clearPrint);
    return () => window.removeEventListener("afterprint", clearPrint);
  }, []);

  // -------------- Helpers & Calculations --------------
  const money = n => "₹" + Math.round(n).toLocaleString("en-IN");
  const num = v => parseFloat(v) || 0;
  const esc = v => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const landTotalHa = () => landRows.reduce((s, r) => s + (num(r.area)), 0);
  const derivedNali = () => landTotalHa() * 50;
  const hectare = () => landTotalHa();

  const valid = () => {
    if (!form.name || !form.father || !form.mobile || !form.district || !form.block || !form.center || !form.village) return false;
    if (landTotalHa() <= 0) return false;
    if (!form.bankHolder || !form.bankName || !form.bankAccount || !form.bankIfsc) return false;
    if (!form.declWater || !form.declIrrigation || !form.declLand || !form.declInspection || !form.declShare) return false;
    const n = derivedNali();
    if (n < 2) return false;
    if (form.beneficiary === 'individual' && n > 50) return false;
    if (form.beneficiary === 'group' && n > 250) return false;
    return true;
  };

  // -------------- Document Generators --------------
  const generate = () => {
    if (!valid()) { alert("कृपया सभी आवश्यक (*) जानकारी भरें और भूमि क्षेत्रफल दर्ज करें। कीवी हेतु न्यूनतम 2 नाली आवश्यक है।"); return false; }
    const m = MASTER.kiwi, n = derivedNali(), f = n / m.baseNali;
    const total = m.components.reduce((s, c) => s + c.cost * f, 0);
    const pct = m.subsidy(n, form.beneficiary), sub = total * pct / 100, farmer = total - sub;

    const rows = m.components.map((c, i) => {
      const q = c.qty(n), cost = c.cost * f;
      return `<tr><td class="qty">${i + 1}</td><td><b>${c.name}</b></td><td class="spec">${c.spec}</td><td class="qty"><b>${q.v}</b><br><span class="small">${q.u}</span></td><td class="money">${money(cost)}</td></tr>`;
    }).join("");

    const appHtml = `<h2 style="text-align:center;color:#17633a">कृषक आवेदन पत्र</h2><p style="text-align:center"><b>${m.name}</b></p><h3>1. कृषक का विवरण</h3><table><tbody>
      <tr><th>कृषक का नाम</th><td>${esc(form.name)}</td><th>पिता / पति का नाम</th><td>${esc(form.father)}</td></tr>
      <tr><th>मोबाइल</th><td>${esc(form.mobile)}</td><th>आधार</th><td>${esc(form.aadhaar) || "—"}</td></tr>
      <tr><th>लिंग</th><td>${esc(form.gender)}</td><th>उद्यान कार्ड</th><td>${esc(form.udyan) || "—"}</td></tr>
      <tr><th>जनपद</th><td>${esc(form.district)}</td><th>विकासखण्ड</th><td>${esc(form.block)}</td></tr>
      <tr><th>केंद्र</th><td>${esc(form.center)}</td><th>ग्राम</th><td>${esc(form.village)}</td></tr>
      <tr><th>प्रस्तावित क्षेत्रफल</th><td><b>${n.toFixed(2)} नाली</b></td><th>क्षेत्रफल</th><td><b>${hectare().toFixed(2)} हे०</b></td></tr>
      </tbody></table>`;

    const reportHtml = `<div class="summary">
        <div class="metric"><span>योजना</span><b>${m.name}</b></div>
        <div class="metric"><span>प्रस्तावित क्षेत्रफल</span><b>${n.toFixed(2)} नाली</b></div>
        <div class="metric"><span>परियोजना लागत</span><b>${money(total)}</b></div>
        <div class="metric"><span>अनुदान</span><b>${pct}%</b></div>
      </div>
      <h2>2. मानक के अनुसार कार्य, मात्रा एवं Component-wise लागत</h2>
      <div class="table-wrap"><table><thead><tr><th>क्र.</th><th>Component</th><th>Specification</th><th>Quantity</th><th>लागत</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="finalbox">
        <div class="finalrow"><span>कुल परियोजना लागत</span><b>${money(total)}</b></div>
        <div class="finalrow"><span>कृषक अंश</span><b>${money(farmer)}</b></div>
        <div class="finalrow"><span>देय अनुदान (${pct}%)</span><b>${money(sub)}</b></div>
      </div>`;

    setHtmlOutputs(prev => ({ ...prev, app: appHtml, report: reportHtml }));
    return true;
  };

  const buildAffidavit = () => {
    if (!valid()) return false;
    const m = MASTER.kiwi, n = derivedNali(), f = n / m.baseNali;
    const co = landRows.filter(r => r.rel && r.rel !== "स्वयं" && r.name);
    const coMode = co.length > 0;

    const affHtml = `<article class="aff-doc">
      <div class="doc-title">${esc(m.name)}</div>
      <div class="doc-subtitle">लाभार्थी स्व-घोषणा एवं शपथ-पत्र — ${coMode ? 'स्वयं + सह-खातेदार' : 'केवल स्वयं की भूमि'}</div>
      <p>मैं श्री/श्रीमती ${esc(form.name)}, पुत्र/पुत्री/पत्नी श्री ${esc(form.father)}, निवासी ${esc(form.village)}, ${esc(form.district)}, उत्तराखण्ड, निम्नलिखित घोषणा करता/करती हूँ कि—</p>
      <ol>
        <li>मेरे द्वारा कुल <b>${n.toFixed(2)} नाली / ${hectare().toFixed(4)} हे०</b> भूमि प्रस्तावित की गई है।</li>
        <li>प्रस्तावित भूमि का विवरण संबंधित भूमि अभिलेख के अनुसार सही है।</li>
        <li>मैं विभागीय निरीक्षण एवं सत्यापन में सहयोग करूँगा/करूँगी।</li>
        <li>मैं निर्धारित कृषक अंश का वहन करूँगा/करूँगी।</li>
      </ol>
      <div class="sig">
        <div>स्थान: ____________________<br>दिनांक: ____________________</div>
        <div>शपथकर्ता/कृषक<br><b>${esc(form.name)}</b><br>हस्ताक्षर ____________________</div>
      </div>
    </article>`;

    const consentHtml = co.length ? co.map((r, idx) => `<article class="aff-doc ${idx ? 'page-break-doc' : ''}">
      <div class="doc-title">${esc(m.name)} हेतु</div>
      <div class="doc-subtitle">सह-खातेदार का सहमति एवं अनापत्ति पत्र</div>
      <p>मैं श्री/श्रीमती <b>${esc(r.name)}</b>, पुत्र/पुत्री/पत्नी श्री <b>${esc(r.father)}</b>, निवासी <b>${esc(r.village || form.village)}</b>, आवेदक से संबंध <b>${esc(r.rel)}</b> हूँ। मैं निम्नलिखित सहमति प्रदान करता/करती हूँ कि—</p>
      <ol>
        <li>मेरी भूमि का विवरण खाता संख्या <b>${esc(r.khata)}</b>, खसरा/गाटा संख्या <b>${esc(r.khasra)}</b>, कुल/प्रस्तावित क्षेत्रफल <b>${num(r.area).toFixed(4)} हे०</b> है।</li>
        <li>मैं अपनी भूमि को श्री/श्रीमती <b>${esc(form.name)}</b> द्वारा ${esc(m.name)} योजना के आवेदन में सम्मिलित करने की सहमति देता/देती हूँ।</li>
        <li>मुझे इस पर कोई आपत्ति नहीं है।</li>
      </ol>
      <div class="sig">
        <div>स्थान: ____________________<br>दिनांक: ____________________</div>
        <div>सह-खातेदार<br><b>${esc(r.name)}</b><br>हस्ताक्षर ____________________</div>
      </div>
    </article>`).join('') : `<div class="aff-doc"><div class="doc-title">सह-खातेदार का सहमति पत्र</div><p>इस आवेदन में कोई सह-खातेदार दर्ज नहीं है।</p></div>`;

    setHtmlOutputs(prev => ({ ...prev, aff: affHtml, consent: consentHtml }));
    return true;
  };

  const buildAnudan = () => {
    if (!valid()) return false;
    const m = MASTER.kiwi, n = derivedNali(), f = n / m.baseNali;
    const anudanHtml = `<div class="anudan-form">
      <div class="af-head">जिला योजना वर्ष 2026-27</div>
      <div class="af-title">${esc(m.name)} अन्तर्गत राजसहायता देयक</div>
      <div class="af-meta">
        <div><b>नाम कृषक :</b> ${esc(form.name)}</div><div><b>पिता का नाम :</b> ${esc(form.father)}</div>
        <div><b>ग्राम :</b> ${esc(form.village)}</div><div><b>विकास खण्ड :</b> ${esc(form.block)}</div>
      </div>
      <div><b>देयक सारणी</b></div>
      <table><thead><tr><th>क्र०</th><th>कार्य का विवरण</th><th>देयक (₹)</th><th>राजसहायता (₹)</th><th>कृषक अंश (₹)</th></tr></thead>
      <tbody><tr><td>1</td><td>कीवी स्थापना</td><td class="money">${money(m.baseCost * f)}</td><td class="money">${money(m.baseCost * f * 0.7)}</td><td class="money">${money(m.baseCost * f * 0.3)}</td></tr></tbody>
      <tfoot><tr class="af-total"><td colspan="2">कुल योग</td><td class="money">${money(m.baseCost * f)}</td><td class="money">${money(m.baseCost * f * 0.7)}</td><td class="money">${money(m.baseCost * f * 0.3)}</td></tr></tfoot></table>
      <div class="af-sign"><div>हस्ताक्षर कृषक : ____________________</div></div>
    </div>`;
    setHtmlOutputs(prev => ({ ...prev, anudan: anudanHtml }));
    return true;
  };

  // -------------- Print Handlers --------------
  const triggerPrint = (className) => {
    document.body.classList.add(className);
    setTimeout(() => window.print(), 250);
  };

  const handlePrint = (type) => {
    if (!valid()) { alert('पहले आवेदन की आवश्यक जानकारी सही करें।'); return; }
    generate();
    if (type === 'affidavit' || type === 'consent' || type === 'all' || type === 'selected') buildAffidavit();
    if (type === 'anudan' || type === 'selected') buildAnudan();

    const cls = {
      app: 'print-app', project: 'print-project', affidavit: 'print-affidavit',
      consent: 'print-consent', all: 'print-affidavit-all', anudan: 'print-anudan', selected: 'print-selected'
    }[type];

    if (type === 'selected') {
      document.body.classList.add('print-sel-application', 'print-sel-project', 'print-sel-affidavit', 'print-sel-consent', 'print-sel-anudan');
      if (!printCheckboxes.app) document.body.classList.remove('print-sel-application');
      if (!printCheckboxes.project) document.body.classList.remove('print-sel-project');
      if (!printCheckboxes.aff) document.body.classList.remove('print-sel-affidavit');
      if (!printCheckboxes.consent) document.body.classList.remove('print-sel-consent');
      if (!printCheckboxes.anudan) document.body.classList.remove('print-sel-anudan');
    }
    triggerPrint(cls);
  };

  // -------------- Demo Handler --------------
  const applyDemo = (kind) => {
    const co = kind.endsWith('Co');
    setForm({
      ...form, name: 'अजय सिंह (DEMO)', father: 'मोहन सिंह', gender: 'पुरुष', mobile: '9876543210',
      aadhaar: '999999999999', district: 'पौड़ी गढ़वाल', block: 'कोटद्वार', center: 'कोटद्वार',
      village: 'दुगड्डा', post: 'दुगड्डा', beneficiary: 'individual', bankHolder: 'अजय सिंह (DEMO)',
      bankName: 'उत्तराखण्ड ग्रामीण बैंक (DEMO)', bankBranch: 'कोटद्वार शाखा', bankAccount: '000000000001',
      bankIfsc: 'DEMO0123456', bankType: 'बचत खाता', workMode: 'self',
      declWater: 'हाँ', declIrrigation: 'हाँ', declPrevious: 'नहीं', declLand: 'हाँ', declInspection: 'हाँ', declShare: 'हाँ'
    });
    setLandRows(prev => {
      const newArr = [...prev];
      newArr[0] = { ...newArr[0], khata: '00077', khasra: '18/2', area: '0.20' };
      newArr[1] = co ? { rel: 'सहखातेदार', name: 'सुरेश सिंह (DEMO)', father: 'हरि सिंह', village: 'दुगड्डा', khata: '00078', khasra: '18/3', area: '0.20', gender: 'पुरुष' } : { rel: "", name: "", father: "", village: "", khata: "", khasra: "", gender: "पुरुष", area: "" };
      return newArr;
    });
    setTimeout(() => { generate(); buildAffidavit(); }, 200);
  };

  // -------------- Form & Land Handlers --------------
  const handleLandChange = (i, field, val) => {
    setLandRows(prev => {
      const newArr = [...prev];
      newArr[i] = { ...newArr[i], [field]: val };
      if (field === 'rel' && !val) {
        newArr[i] = { ...newArr[i], name: '', father: '', village: '', khata: '', khasra: '', area: '', gender: 'पुरुष' };
      }
      return newArr;
    });
  };

  const saveDraft = () => {
    localStorage.setItem("kiwiApp", JSON.stringify({ form, landRows }));
    alert("आवेदन Draft सुरक्षित हो गया।");
  };

  const loadDraft = () => {
    const o = JSON.parse(localStorage.getItem("kiwiApp") || "null");
    if (o) {
      setForm(o.form);
      setLandRows(o.landRows);
      alert("Draft लोड हो गया।");
    } else {
      alert("कोई Draft उपलब्ध नहीं है।");
    }
  };

  // -------------- Workflow --------------
  const goToStep = (i) => {
    const step = APP_STEPS[i];
    if (!step) return;
    setWorkflowStep(i);
    if (window.matchMedia("(max-width: 1180px)").matches) setSideOpen(false);
    const el = document.getElementById(`${ID_PREFIX}${step.anchor}`);
    if (!el) return;
    setFlashAnchor(step.anchor);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const anchorCls = (anchor) => `step-anchor ${flashAnchor === anchor ? "step-flash" : ""}`;
  const selectSideTab = (id) => {
    setActiveSideTab(id);
    if (window.matchMedia("(max-width: 1180px)").matches) setSideOpen(false);
  };

  return (
    <div className="kiwi-root" style={{ "--app-header-h": `${headerH}px`, "--app-footer-h": `${footerH}px` }}>
      <button type="button" aria-label="पैनल बंद करें" className={`side-backdrop ${sideOpen ? "open" : ""}`} onClick={() => setSideOpen(false)} />

      <div className="kiwi-content">
        <header className="top noprint">
          <div className="top-inner">
            <div className="brand">
              <span className="brand-badge">🥝</span>
              <h1>कीवी उद्यान स्थापना — कृषक आवेदन एवं परियोजना मानक प्रणाली</h1>
            </div>
            <p className="top-sub">
              कीवी — आवेदन के क्षेत्रफल के अनुसार कार्य, मात्रा, Specification,
              Component लागत, परियोजना लागत, कृषक अंश एवं अनुदान (उत्तराखण्ड कीवी नीति-2025)
            </p>
            <div className="top-tags">
              <span>🟢 स्वचालित मानक</span><span>🟡 चरणबद्ध अनुदान</span><span>🔵 प्रिंट-रेडी</span>
            </div>
          </div>
        </header>

        <main className="wrap">
          {/* Tabs Card */}
          <div className="card noprint">
            <div className="tabs">
              <button type="button" className="tab active">🥝 कीवी</button>
            </div>
            <div className="note">
              <b>महत्वपूर्ण:</b> किसान के अंतिम मानक पत्र में प्रति इकाई Rate नहीं दिखाया जाएगा।
              Master Standard के आधार पर अंदर से गणना होगी और किसान को Component-wise कुल लागत दिखाई जाएगी।
            </div>
          </div>

          {/* Workflow Card */}
          <div className="workflow-card noprint">
            <div className="workflow-head">
              <div>
                <div className="workflow-title">🧭 आवेदन से अनुदान तक — Step-by-Step</div>
                <div className="workflow-sub">
                  चरण {workflowStep + 1}: {APP_STEPS[workflowStep].title} —{" "}{APP_STEPS[workflowStep].sub}
                </div>
              </div>
              <div className="workflow-count">{workflowStep + 1} / {APP_STEPS.length}</div>
            </div>
            <div className="workflow-progress">
              <span style={{ width: `${((workflowStep + 1) / APP_STEPS.length) * 100}%` }} />
            </div>
            <div className="workflow-steps">
              {APP_STEPS.map((s, i) => (
                <button key={i} type="button" className={`workflow-step ${i === workflowStep ? "active" : ""} ${i < workflowStep ? "done" : ""}`} onClick={() => goToStep(i)}>
                  {i + 1}. {s.title}
                </button>
              ))}
            </div>
            <div className="workflow-actions">
              <button type="button" className="btn secondary" onClick={() => goToStep(Math.max(0, workflowStep - 1))}>← पिछला</button>
              <button type="button" className="btn" onClick={() => goToStep(Math.min(APP_STEPS.length - 1, workflowStep + 1))}>
                {workflowStep === APP_STEPS.length - 1 ? "✓ अंतिम समीक्षा" : "अगला चरण →"}
              </button>
              <button type="button" className="btn secondary" onClick={() => { setForm({ gender: "पुरुष", beneficiary: "individual", bankType: "बचत खाता", workMode: "firm" }); setLandRows(Array(5).fill({ rel: "स्वयं", name: "", father: "", village: "", khata: "", khasra: "", gender: "पुरुष", area: "" })); }}>🆕 नया आवेदन</button>
              <button type="button" className="btn gold" onClick={() => goToStep(6)}>💰 अनुदान पर जाएँ</button>
            </div>
          </div>

          {/* Application Form Section */}
          <section className={`card noprint ${anchorCls("wf-basic")}`} id={`${ID_PREFIX}wf-basic`}>
            <h2><span className="idx">1</span> कृषक का आवेदन</h2>
            <p className="card-intro">
              किसान अपने वास्तविक प्रस्तावित क्षेत्रफल के अनुसार आवेदन भरे। इसी क्षेत्रफल से नीचे
              पूरा व्यक्तिगत परियोजना मानक स्वतः बनेगा। कीवी हेतु न्यूनतम 2 नाली, व्यक्तिगत
              अधिकतम 50 नाली तथा समूह हेतु अधिकतम 250 नाली (5 हे०) लागू है।
            </p>

            <div className="grid">
              <div className="field"><label htmlFor="f-name">कृषक का नाम<span className="req">*</span></label><input id="f-name" placeholder="पूरा नाम" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label htmlFor="f-father">पिता / पति का नाम<span className="req">*</span></label><input id="f-father" placeholder="पिता / पति का नाम" value={form.father} onChange={e => setForm({ ...form, father: e.target.value })} /></div>
              <div className="field"><label htmlFor="f-gender">लिंग</label><select id="f-gender" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option>पुरुष</option><option>महिला</option><option>अन्य</option></select></div>
              <div className="field"><label htmlFor="f-hortcard">उद्यान कार्ड संख्या</label><input id="f-hortcard" inputMode="numeric" placeholder="वैकल्पिक" value={form.udyan} onChange={e => setForm({ ...form, udyan: e.target.value })} /></div>
              <div className="field"><label htmlFor="f-mobile">मोबाइल नम्बर<span className="req">*</span></label><input id="f-mobile" inputMode="numeric" maxLength={10} placeholder="10 अंक" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} /></div>
              <div className="field"><label htmlFor="f-aadhaar">आधार संख्या</label><input id="f-aadhaar" inputMode="numeric" maxLength={12} placeholder="XXXX XXXX 1234" value={form.aadhaar} onChange={e => setForm({ ...form, aadhaar: e.target.value })} /></div>
              <div className="field"><label htmlFor="f-district">जनपद<span className="req">*</span></label><input id="f-district" placeholder="जनपद का नाम" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
              <div className="field"><label htmlFor="f-block">विकासखण्ड<span className="req">*</span></label><input id="f-block" placeholder="विकासखण्ड का नाम" value={form.block} onChange={e => setForm({ ...form, block: e.target.value })} /></div>
              <div className="field"><label htmlFor="f-center">उद्यान सचल दल केंद्र<span className="req">*</span></label><select id="f-center" value={form.center} onChange={e => setForm({ ...form, center: e.target.value })}><option value="">-- केंद्र चुनें --</option>{CENTERS.map((c) => (<option key={c} value={c}>{c}</option>))}</select></div>
              <div className="field"><label htmlFor="f-village">ग्राम<span className="req">*</span></label><input id="f-village" placeholder="ग्राम का नाम" value={form.village} onChange={e => setForm({ ...form, village: e.target.value })} /></div>
              <div className="field"><label htmlFor="f-post">पोस्ट</label><input id="f-post" placeholder="पोस्ट ऑफिस" value={form.post} onChange={e => setForm({ ...form, post: e.target.value })} /></div>
              <div className="field"><label htmlFor="f-beneficiary">लाभार्थी का प्रकार<span className="req">*</span></label><select id="f-beneficiary" value={form.beneficiary} onChange={e => setForm({ ...form, beneficiary: e.target.value })}><option value="individual">व्यक्तिगत कृषक (अधिकतम 50 नाली)</option><option value="group">समूह (अधिकतम 250 नाली / 5 हे०)</option></select></div>
              <div className="field"><label htmlFor="f-appno">आवेदन संख्या</label><input id="f-appno" readOnly placeholder="स्वतः जारी" value={form.appno} onChange={e => setForm({ ...form, appno: e.target.value })} /><span className="hint">Draft सुरक्षित करने पर स्वतः बनेगी।</span></div>
              <div className="field full"><label htmlFor="f-remark">भूमि / परियोजना संबंधी टिप्पणी</label><textarea id="f-remark" placeholder="यदि कोई विशेष बात हो तो यहाँ लिखें" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} /></div>
            </div>

            {/* Land Table */}
            <div className={`inner-card ${anchorCls("wf-land")}`} id={`${ID_PREFIX}wf-land`}>
              <h3>भूमि एवं कार्य का विवरण</h3>
              <p className="card-intro"><b>स्वयं</b> वाली पहली पंक्ति किसान की ऊपर भरी गई जानकारी से स्वतः भरेगी। यदि प्रस्तावित भूमि में सहखातेदार / अन्य खातेदार की भूमि शामिल है तो नीचे की पंक्ति में संबंध चुनकर उसका विवरण एवं क्षेत्रफल भरें।</p>
              <div className="table-wrap">
                <table className="land-table">
                  <thead>
                    <tr><th>क्र.</th><th>भूमि किसकी / विवरण</th><th>नाम (खतौनी के अनुसार)</th><th>पिता का नाम</th><th>ग्राम</th><th>खाता सं०</th><th>खसरा / खतौनी सं०</th><th>प्रस्तावित भूमि (हे०)</th></tr>
                  </thead>
                  <tbody>
                    {landRows.map((r, i) => (
                      <tr key={i}>
                        <td className="qty" data-label="क्रमांक">{i + 1}</td>
                        <td data-label="भूमि किसकी">
                          <select value={r.rel} disabled={i === 0} onChange={e => handleLandChange(i, 'rel', e.target.value)}>
                            {i === 0 ? <option value="स्वयं">स्वयं</option> : <><option value="">— चयन करें —</option>{RELATIONS.map(rel => <option key={rel} value={rel}>{rel}</option>)}</>}
                          </select>
                        </td>
                        <td data-label="नाम (खतौनी)"><input placeholder="नाम" value={r.name} readOnly={i === 0} disabled={i !== 0 && !r.rel} onChange={e => handleLandChange(i, 'name', e.target.value)} /></td>
                        <td data-label="पिता का नाम"><input placeholder="पिता का नाम" value={r.father} readOnly={i === 0} disabled={i !== 0 && !r.rel} onChange={e => handleLandChange(i, 'father', e.target.value)} /></td>
                        <td data-label="ग्राम"><input placeholder="ग्राम" value={r.village} readOnly={i === 0} disabled={i !== 0 && !r.rel} onChange={e => handleLandChange(i, 'village', e.target.value)} /></td>
                        <td data-label="खाता सं०"><input placeholder="खाता सं०" value={r.khata} disabled={i !== 0 && !r.rel} onChange={e => handleLandChange(i, 'khata', e.target.value)} /></td>
                        <td data-label="खसरा / खतौनी"><input placeholder="खसरा / खतौनी" value={r.khasra} disabled={i !== 0 && !r.rel} onChange={e => handleLandChange(i, 'khasra', e.target.value)} /></td>
                        <td data-label="क्षेत्रफल (हे०)"><input className="land-area" type="number" min="0" step="0.0001" placeholder="हे०" value={r.area} disabled={i !== 0 && !r.rel} onChange={e => handleLandChange(i, 'area', e.target.value)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="summary" style={{ marginBottom: 0 }}>
                <div className="metric"><span>प्रस्तावित क्षेत्रफल (नाली)</span><b>{derivedNali().toFixed(2)} नाली</b></div>
                <div className="metric"><span>कुल भूमि क्षेत्रफल</span><b>{landTotalHa().toFixed(2)} हे०</b></div>
                <div className="metric"><span>क्षेत्रफल (हेक्टेयर)</span><b>{hectare().toFixed(2)} हे०</b></div>
                <div className="metric"><span>स्थिति</span><b>{landTotalHa() > 0 ? "✓ पूर्ण" : "✕ अपूर्ण"}</b></div>
              </div>
              <div className="err" />
            </div>

            {/* Bank Details */}
            <div className={`inner-card ${anchorCls("wf-bank")}`} id={`${ID_PREFIX}wf-bank`}>
              <h3>बैंक खाता विवरण</h3>
              <p className="card-intro">अनुदान / राजसहायता भुगतान हेतु किसान के बैंक खाते की जानकारी भरें।</p>
              <div className="grid">
                <div className="field"><label htmlFor="b-holder">खाता धारक का नाम<span className="req">*</span></label><input id="b-holder" placeholder="बैंक पासबुक के अनुसार" value={form.bankHolder} onChange={e => setForm({ ...form, bankHolder: e.target.value })} /></div>
                <div className="field"><label htmlFor="b-bank">बैंक का नाम<span className="req">*</span></label><input id="b-bank" placeholder="बैंक का नाम" value={form.bankName} onChange={e => setForm({ ...form, bankName: e.target.value })} /></div>
                <div className="field"><label htmlFor="b-branch">शाखा का नाम<span className="req">*</span></label><input id="b-branch" placeholder="शाखा" value={form.bankBranch} onChange={e => setForm({ ...form, bankBranch: e.target.value })} /></div>
                <div className="field"><label htmlFor="b-acct">बैंक खाता संख्या<span className="req">*</span></label><input id="b-acct" inputMode="numeric" placeholder="खाता संख्या" value={form.bankAccount} onChange={e => setForm({ ...form, bankAccount: e.target.value })} /></div>
                <div className="field"><label htmlFor="b-ifsc">IFSC Code<span className="req">*</span></label><input id="b-ifsc" maxLength={11} className="ifsc-input" placeholder="ABCD0123456" value={form.bankIfsc} onChange={e => setForm({ ...form, bankIfsc: e.target.value.toUpperCase() })} /></div>
                <div className="field"><label htmlFor="b-type">खाता प्रकार</label><select id="b-type" value={form.bankType} onChange={e => setForm({ ...form, bankType: e.target.value })}><option>बचत खाता</option><option>चालू खाता</option><option>अन्य</option></select></div>
                <div className="field full"><label htmlFor="b-doc">बैंक पासबुक / cancelled cheque</label><input id="b-doc" type="file" accept="image/*,.pdf" /><span className="hint">यदि आवश्यक हो तो JPG / PNG / PDF (अधिकतम 5 MB)।</span></div>
              </div>
            </div>

            {/* Work Execution */}
            <div className="inner-card">
              <h3>कार्य निष्पादन का विकल्प</h3>
              <div className="grid">
                <div className="field"><label htmlFor="w-mode">कार्य किसके द्वारा कराया जाएगा<span className="req">*</span></label><select id="w-mode" value={form.workMode} onChange={e => setForm({ ...form, workMode: e.target.value })}><option value="firm">विभागीय पंजीकृत / Empanelled Firm</option><option value="self">कृषक द्वारा स्वयं</option></select></div>
                <div className="field"><label htmlFor="w-firm">Firm का नाम</label><input id="w-firm" placeholder="यदि लागू हो" value={form.firmName} onChange={e => setForm({ ...form, firmName: e.target.value })} /></div>
                <div className="field"><label htmlFor="w-reg">Firm Registration No.</label><input id="w-reg" placeholder="यदि लागू हो" value={form.firmReg} onChange={e => setForm({ ...form, firmReg: e.target.value })} /></div>
                <div className="field full"><label htmlFor="w-remark">कार्य / भुगतान से संबंधित टिप्पणी</label><textarea id="w-remark" placeholder="विशेष निर्देश यदि कोई हों" value={form.workRemark} onChange={e => setForm({ ...form, workRemark: e.target.value })} /></div>
              </div>
            </div>

            {/* Documents */}
            <div className={`inner-card ${anchorCls("wf-docs")}`} id={`${ID_PREFIX}wf-docs`}>
              <h3>आवश्यक दस्तावेज</h3>
              <p className="card-intro">प्रत्येक दस्तावेज का प्रारूप चुनें — फाइल नाम यहाँ दिखाई देगी।</p>
              <div className="grid">
                <div className="field"><label htmlFor="d-land">भूमि अभिलेख / खतौनी</label><input id="d-land" type="file" accept="image/*,.pdf" /></div>
                <div className="field"><label htmlFor="d-id">आधार / पहचान</label><input id="d-id" type="file" accept="image/*,.pdf" /></div>
                <div className="field"><label htmlFor="d-card">उद्यान कार्ड</label><input id="d-card" type="file" accept="image/*,.pdf" /></div>
                <div className="field"><label htmlFor="d-cheque">बैंक पासबुक / cancelled cheque</label><input id="d-cheque" type="file" accept="image/*,.pdf" /></div>
                <div className="field"><label htmlFor="d-map">भूमि नक्शा / अन्य अभिलेख</label><input id="d-map" type="file" accept="image/*,.pdf" /></div>
                <div className="field"><label htmlFor="d-other">अन्य दस्तावेज</label><input id="d-other" type="file" accept="image/*,.pdf" /></div>
              </div>
            </div>

            {/* Declaration */}
            <div className={`inner-card ${anchorCls("wf-standard")}`} id={`${ID_PREFIX}wf-standard`}>
              <h3>पात्रता एवं किसान घोषणा</h3>
              <p className="card-intro">आवेदन स्वीकृति हेतु निम्न सभी बिंदुओं का सही उत्तर दें।</p>
              <div className="grid">
                <div className="field"><label>भूमि में जलभराव नहीं है<span className="req">*</span></label><select value={form.declWater} onChange={e => setForm({ ...form, declWater: e.target.value })}><option value="">-- चुनें --</option><option value="हाँ">हाँ</option><option value="नहीं">नहीं</option></select></div>
                <div className="field"><label>सिंचाई सुविधा उपलब्ध है<span className="req">*</span></label><select value={form.declIrrigation} onChange={e => setForm({ ...form, declIrrigation: e.target.value })}><option value="">-- चुनें --</option><option value="हाँ">हाँ</option><option value="नहीं">नहीं</option></select></div>
                <div className="field"><label>पूर्व में इसी योजना का लाभ लिया है?<span className="req">*</span></label><select value={form.declPrevious} onChange={e => setForm({ ...form, declPrevious: e.target.value })}><option value="">-- चुनें --</option><option value="हाँ">हाँ</option><option value="नहीं">नहीं</option></select></div>
                <div className="field"><label>भूमि / अभिलेख सही हैं<span className="req">*</span></label><select value={form.declLand} onChange={e => setForm({ ...form, declLand: e.target.value })}><option value="">-- चुनें --</option><option value="हाँ">हाँ</option><option value="नहीं">नहीं</option></select></div>
                <div className="field"><label>स्थलीय निरीक्षण हेतु सहमति<span className="req">*</span></label><select value={form.declInspection} onChange={e => setForm({ ...form, declInspection: e.target.value })}><option value="">-- चुनें --</option><option value="हाँ">हाँ</option><option value="नहीं">नहीं</option></select></div>
                <div className="field"><label>कृषक अंश वहन करने की सहमति<span className="req">*</span></label><select value={form.declShare} onChange={e => setForm({ ...form, declShare: e.target.value })}><option value="">-- चुनें --</option><option value="हाँ">हाँ</option><option value="नहीं">नहीं</option></select></div>
              </div>
            </div>

            {/* Process */}
            <div className={`inner-card ${anchorCls("wf-affidavit")}`} id={`${ID_PREFIX}wf-affidavit`}>
              <h3>निरीक्षण एवं अनुदान प्रक्रिया</h3>
              <div className="stage-grid">
                <div className="stage"><b>चरण 1 — Infrastructure Verification</b><span className="small">T-Bar ट्रेलिस, ड्रिप/फर्टिगेशन, गड्ढे एवं फेंसिंग सहित निर्धारित infrastructure पूर्ण होने पर स्थलीय निरीक्षण एवं सत्यापन।</span></div>
                <div className="stage"><b>चरण 2 — 90% पौध जीवितता</b><span className="small">द्वितीय निरीक्षण में कीवी पौधों की कम से कम 90% जीवितता (9 मादा : 1 नर अनुपात सहित) का सत्यापन।</span></div>
                <div className="stage"><b>चरण 3 — उत्पादन / फल सत्यापन</b><span className="small">तृतीय निरीक्षण में उत्तराखण्ड कीवी नीति-2025 के अनुसार फल / गुणवत्ता / मात्रा का सत्यापन।</span></div>
              </div>
              <p className="card-intro" style={{ marginTop: "9px", marginBottom: 0 }}><b>पौध अनुदान:</b> लागू योजना / स्वीकृति के अनुसार चरणबद्ध भुगतान (70% + 20% + 10%)। Infrastructure component का भुगतान सत्यापन / स्वीकृति के बाद लागू प्रावधान के अनुसार होगा।</p>
            </div>

            <div className="err" />
            <div className={`btns ${anchorCls("wf-grant")}`} id={`${ID_PREFIX}wf-grant`}>
              <button type="button" className="btn" onClick={generate}>✓ आवेदन से किसान-विशिष्ट मानक बनाएं</button>
              <button type="button" className="btn secondary" onClick={saveDraft}>💾 Draft सुरक्षित करें</button>
              <button type="button" className="btn secondary" onClick={loadDraft}>↶ Draft लोड करें</button>
              <button type="button" className="btn gold" onClick={() => handlePrint('app')}>🖨️ आवेदन पत्र Print</button>
              <button type="button" className="btn gold" onClick={() => handlePrint('project')}>🖨️ पूर्ण परियोजना मानक Print</button>
              <button type="button" className="btn" onClick={buildAffidavit}>📜 शपथ-पत्र तैयार करें</button>
              <button type="button" className="btn gold" onClick={() => handlePrint('affidavit')}>🖨️ शपथ-पत्र Print</button>
              <button type="button" className="btn gold" onClick={() => handlePrint('consent')}>🖨️ सहमति / NOC Print</button>
              <button type="button" className="btn secondary" onClick={() => handlePrint('all')}>📑 सभी शपथ-पत्र / सहमति Print</button>
              <button type="button" className="btn" onClick={buildAnudan}>💰 अनुदान व्यय तैयार करें</button>
              <button type="button" className="btn gold" onClick={() => handlePrint('anudan')}>🖨️ अनुदान व्यय Print</button>
            </div>

            <div className={`print-select ${anchorCls("wf-review")}`} id={`${ID_PREFIX}wf-review`}>
              <h3>🖨️ चयनित दस्तावेज एक साथ Print करें</h3>
              <div className="small">आवेदन पत्र में संलग्न दस्तावेज सूची + घोषणा तथा प्रभारी की आख्या स्वतः शामिल हैं।</div>
              <div className="print-options">
                <label className="print-option"><input type="checkbox" checked={printCheckboxes.app} onChange={e => setPrintCheckboxes({ ...printCheckboxes, app: e.target.checked })} /> <span>आवेदन पत्र</span></label>
                <label className="print-option"><input type="checkbox" checked={printCheckboxes.project} onChange={e => setPrintCheckboxes({ ...printCheckboxes, project: e.target.checked })} /> <span>पूर्ण परियोजना मानक</span></label>
                <label className="print-option"><input type="checkbox" checked={printCheckboxes.aff} onChange={e => setPrintCheckboxes({ ...printCheckboxes, aff: e.target.checked })} /> <span>मुख्य शपथ-पत्र / स्व-घोषणा</span></label>
                <label className="print-option"><input type="checkbox" checked={printCheckboxes.consent} onChange={e => setPrintCheckboxes({ ...printCheckboxes, consent: e.target.checked })} /> <span>सह-खातेदार सहमति / NOC</span></label>
                <label className="print-option"><input type="checkbox" checked={printCheckboxes.anudan} onChange={e => setPrintCheckboxes({ ...printCheckboxes, anudan: e.target.checked })} /> <span>अनुदान व्यय / भुगतान प्रपत्र</span></label>
              </div>
              <div className="aff-actions">
                <button type="button" className="btn" onClick={() => handlePrint('selected')}>🖨️ चयनित सभी दस्तावेज Print करें</button>
                <button type="button" className="btn secondary" onClick={() => setPrintCheckboxes({ app: true, project: true, aff: true, consent: true, anudan: true })}>☑ सभी चुनें</button>
                <button type="button" className="btn secondary" onClick={() => setPrintCheckboxes({ app: false, project: false, aff: false, consent: false, anudan: false })}>☐ सभी हटाएँ</button>
              </div>
            </div>

            <div className="demo-tools">
              <b>🧪 Demo Testing — Kiwi Affidavit</b>
              <div className="card-intro" style={{ margin: "5px 0 0" }}>नीचे से demo data लगाकर स्वयं की भूमि और स्वयं + सह-खातेदार दोनों affidavit तुरंत test करें।</div>
              <div className="demo-row">
                <button type="button" className="btn secondary" onClick={() => applyDemo('kiwiSelf')}>🥝 Kiwi Demo — केवल स्वयं</button>
                <button type="button" className="btn secondary" onClick={() => applyDemo('kiwiCo')}>🥝 Kiwi Demo — सह-खातेदार</button>
              </div>
            </div>
          </section>

          {/* Hidden Print Sections Injected via State */}
          {htmlOutputs.app && <section id="applicationPrint" className="card hidden" dangerouslySetInnerHTML={{ __html: htmlOutputs.app }} />}
          {htmlOutputs.report && <section id="report" className="card hidden" dangerouslySetInnerHTML={{ __html: htmlOutputs.report }} />}
          {htmlOutputs.aff && <section id="affidavitPrint" className="card hidden" dangerouslySetInnerHTML={{ __html: htmlOutputs.aff }} />}
          {htmlOutputs.consent && <section id="consentPrint" className="card hidden" dangerouslySetInnerHTML={{ __html: htmlOutputs.consent }} />}
          {htmlOutputs.anudan && <section id="anudanPrint" className="card hidden" dangerouslySetInnerHTML={{ __html: htmlOutputs.anudan }} />}

        </main>

        <div className="footer noprint">Kiwi Farmer Application &amp; Project Standard System</div>
      </div>

      <button type="button" className="side-toggle" aria-expanded={sideOpen} onClick={() => setSideOpen((v) => !v)}>☰ दस्तावेज विकल्प</button>

      <aside className={`side-tabs ${sideOpen ? "open" : ""}`} aria-label="दस्तावेज विकल्प">
        <button type="button" className="side-close" aria-label="बंद करें" onClick={() => setSideOpen(false)}>×</button>
        <div className="side-tab-head">
          {SIDE_TABS.map((t) => (
            <button key={t.id} type="button" className={activeSideTab === t.id ? "active" : ""} onClick={() => selectSideTab(t.id)}>{t.label}</button>
          ))}
        </div>

        <div className={`side-pane ${activeSideTab === "work" ? "active" : ""}`}>
          <h4>मुख्य कार्य</h4>
          <div className="side-group">
            <div className="side-group-title">आवेदन एवं मानक</div>
            <button type="button" className="side-action" onClick={() => { setForm({ gender: "पुरुष", beneficiary: "individual", bankType: "बचत खाता", workMode: "firm" }); setLandRows(Array(5).fill({ rel: "स्वयं", name: "", father: "", village: "", khata: "", khasra: "", gender: "पुरुष", area: "" })); }}>🆕 नया आवेदन शुरू करें</button>
            <button type="button" className="side-action" onClick={generate}>✓ आवेदन से किसान-विशिष्ट मानक बनाएं</button>
            <button type="button" className="side-action" onClick={saveDraft}>💾 Draft सुरक्षित करें</button>
            <button type="button" className="side-action" onClick={loadDraft}>↶ Draft लोड करें</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">शपथ-पत्र</div>
            <button type="button" className="side-action" onClick={buildAffidavit}>📜 शपथ-पत्र तैयार करें</button>
            <button type="button" className="side-action" onClick={buildAffidavit}>🤝 सहमति / NOC तैयार करें</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">अनुदान</div>
            <button type="button" className="side-action" onClick={buildAnudan}>💰 अनुदान व्यय तैयार करें</button>
          </div>
        </div>

        <div className={`side-pane ${activeSideTab === "view" ? "active" : ""}`}>
          <h4>दस्तावेज / फॉर्म देखें</h4>
          <div className="side-group">
            <div className="side-group-title">आवेदन एवं मानक</div>
            <button type="button" className="side-action" onClick={() => { generate(); document.getElementById('applicationPrint')?.scrollIntoView({ behavior: 'smooth' }); }}>📄 आवेदन पत्र देखें</button>
            <button type="button" className="side-action" onClick={() => { generate(); document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' }); }}>📋 पूर्ण परियोजना मानक देखें</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">शपथ-पत्र / सहमति</div>
            <button type="button" className="side-action" onClick={() => { buildAffidavit(); document.getElementById('affidavitPrint')?.scrollIntoView({ behavior: 'smooth' }); }}>📜 शपथ-पत्र तैयार / देखें</button>
            <button type="button" className="side-action" onClick={() => { buildAffidavit(); document.getElementById('consentPrint')?.scrollIntoView({ behavior: 'smooth' }); }}>🤝 सहमति / NOC देखें</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">अनुदान</div>
            <button type="button" className="side-action" onClick={() => { buildAnudan(); document.getElementById('anudanPrint')?.scrollIntoView({ behavior: 'smooth' }); }}>💰 अनुदान व्यय फॉर्म खोलें</button>
          </div>
        </div>

        <div className={`side-pane ${activeSideTab === "print" ? "active" : ""}`}>
          <h4>प्रिंट विकल्प</h4>
          <div className="side-group">
            <div className="side-group-title">अलग-अलग प्रिंट</div>
            <button type="button" className="side-action gold" onClick={() => handlePrint('app')}>🖨 आवेदन पत्र Print</button>
            <button type="button" className="side-action gold" onClick={() => handlePrint('project')}>🖨 पूर्ण परियोजना मानक Print</button>
            <button type="button" className="side-action gold" onClick={() => handlePrint('affidavit')}>🖨 मुख्य शपथ-पत्र Print</button>
            <button type="button" className="side-action gold" onClick={() => handlePrint('consent')}>🖨 सहमति / NOC Print</button>
            <button type="button" className="side-action gold" onClick={() => handlePrint('all')}>🖨 सभी शपथ-पत्र / NOC Print</button>
            <button type="button" className="side-action gold" onClick={() => handlePrint('anudan')}>🖨 अनुदान व्यय Print</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">चयनित दस्तावेज एक साथ</div>
            <div className="side-mini">☑ आवेदन पत्र चुनने पर संलग्न दस्तावेज सूची + घोषणा तथा प्रभारी की आख्या भी शामिल होंगी।</div>
            <label className="side-check"><input type="checkbox" checked={printCheckboxes.app} onChange={e => setPrintCheckboxes({ ...printCheckboxes, app: e.target.checked })} /> आवेदन पत्र</label>
            <label className="side-check"><input type="checkbox" checked={printCheckboxes.project} onChange={e => setPrintCheckboxes({ ...printCheckboxes, project: e.target.checked })} /> पूर्ण परियोजना मानक</label>
            <label className="side-check"><input type="checkbox" checked={printCheckboxes.aff} onChange={e => setPrintCheckboxes({ ...printCheckboxes, aff: e.target.checked })} /> मुख्य शपथ-पत्र</label>
            <label className="side-check"><input type="checkbox" checked={printCheckboxes.consent} onChange={e => setPrintCheckboxes({ ...printCheckboxes, consent: e.target.checked })} /> सह-खातेदार सहमति / NOC</label>
            <label className="side-check"><input type="checkbox" checked={printCheckboxes.anudan} onChange={e => setPrintCheckboxes({ ...printCheckboxes, anudan: e.target.checked })} /> अनुदान व्यय</label>
            <button type="button" className="side-action gold" onClick={() => handlePrint('selected')}>🖨 चयनित सभी दस्तावेज Print</button>
            <button type="button" className="side-action" onClick={() => setPrintCheckboxes({ app: true, project: true, aff: true, consent: true, anudan: true })}>☑ सभी चुनें</button>
            <button type="button" className="side-action" onClick={() => setPrintCheckboxes({ app: false, project: false, aff: false, consent: false, anudan: false })}>☐ सभी हटाएँ</button>
          </div>
        </div>

        <div className={`side-pane ${activeSideTab === "anudan" ? "active" : ""}`}>
          <h4>अनुदान व्यय</h4>
          <div className="side-group">
            <div className="side-group-title">अनुदान कार्य</div>
            <button type="button" className="side-action" onClick={() => buildAnudan()}>✓ अनुदान व्यय बनाएं</button>
            <button type="button" className="side-action gold" onClick={() => handlePrint('anudan')}>🖨 अनुदान व्यय Print</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">वर्तमान स्थिति</div>
            <div className="side-mini">बिल / वाउचर की राशि अनुदान फॉर्म में दर्ज होगी।</div>
            <div className="side-stats">
              <div><b>कुल व्यय</b><span>₹0</span></div>
              <div><b>राजसहायता</b><span>₹0</span></div>
              <div><b>कृषक अंश</b><span>₹0</span></div>
            </div>
          </div>
        </div>

        <div className={`side-pane ${activeSideTab === "steps" ? "active" : ""}`}>
          <h4>🧭 पूरा Step-by-Step Workflow</h4>
          <div className="fresh-note"><b>नया आवेदन:</b> पहले "नया आवेदन शुरू करें" से खाली form लें।</div>
          <div>
            {APP_STEPS.map((s, i) => (
              <button key={i} type="button" className={`side-step ${i === workflowStep ? "active" : ""}`} onClick={() => goToStep(i)}>
                <span className="num">{i + 1}</span>
                <div><b>{s.title}</b><span>{s.sub}</span></div>
              </button>
            ))}
          </div>
          <div className="side-group">
            <div className="side-group-title">अनुदान के 4 चरण</div>
            <button type="button" className="side-step"><span className="num">1</span><div><b>चरण 1 — आधार / चरण</b><span>Inspection stage और project component चुनें</span></div></button>
            <button type="button" className="side-step"><span className="num">2</span><div><b>चरण 2 — Bill / Voucher</b><span>Voucher, राशि और भुगतान पाने वाला भरें</span></div></button>
            <button type="button" className="side-step"><span className="num">3</span><div><b>चरण 3 — गणना / समीक्षा</b><span>कुल व्यय, राजसहायता और कृषक अंश देखें</span></div></button>
            <button type="button" className="side-step"><span className="num">4</span><div><b>चरण 4 — व्यय / Print</b><span>अनुदान व्यय तैयार और print करें</span></div></button>
          </div>
        </div>

        <div className={`side-pane ${activeSideTab === "demo" ? "active" : ""}`}>
          <h4>Demo Testing</h4>
          <div className="side-group">
            <div className="side-group-title">Kiwi Affidavit Demo</div>
            <div className="side-mini">Demo data लगाकर स्वयं की भूमि और स्वयं + सह-खातेदार दोनों affidavit तुरंत test करें।</div>
            <button type="button" className="side-action" onClick={() => applyDemo('kiwiSelf')}>🥝 Kiwi — केवल स्वयं</button>
            <button type="button" className="side-action" onClick={() => applyDemo('kiwiCo')}>🥝 Kiwi — सह-खातेदार</button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default KiwiFruits;