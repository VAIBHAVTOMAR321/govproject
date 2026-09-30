import React, { useEffect, useLayoutEffect, useState } from "react";
import "../kishanavedan/DragfruitsAndKiwi.css";

const ID_PREFIX = "dragon-";

const MASTER = {
  dragon: {
    name: "ड्रैगन फ्रूट (कमलम)",
    baseNali: 20, baseHa: 0.40, baseCost: 796000,
    subsidy: n => n <= 50 ? 80 : 50,
    components: [
      { name: "भूमि रेखांकन एवं अन्य तैयारी", qty: n => ({ v: "सम्पूर्ण परियोजना क्षेत्र हेतु", u: "" }), cost: 12000, spec: "भूमि समतलीकरण, जुताई, निराई-गुड़ाई, ढलान अनुसार मेड़बंदी तथा स्थल का लेआउट निर्धारित दूरी के अनुसार किया जाएगा। पिल्लर से पिल्लर 2.0 मीटर तथा लाइन से लाइन 3.0 मीटर की व्यवस्था रहेगी।" },
      { name: "गड्ढा खुदान/भरान, बंड, खाद एवं उर्वरक प्रबंधन", qty: n => { const p = { 5: 167, 10: 333, 15: 500, 20: 666 }; const key = Number(n); const pillars = Object.prototype.hasOwnProperty.call(p, key) ? p[key] : Math.round(666 * (key / 20)); return { v: pillars * 4, u: "गड्ढे (प्रति पिल्लर 4)" } }, cost: 90000, spec: "गड्ढे का आकार 0.20 मीटर × 0.20 मीटर × 0.20 मीटर। प्रत्येक गड्ढे को 0.30 मीटर ऊँचाई तक भराई करनी होगी। प्रत्येक पिल्लर के आधार पर 4 गड्ढे। प्रति गड्ढा 2–3 किलोग्राम कम्पोस्ट तथा 50 ग्राम सिंगल सुपर फॉस्फेट (SSP) मिलाना अनिवार्य।" },
      { name: "ड्रिप सिंचाई प्रणाली एवं फर्टिगेशन", qty: n => ({ v: "1", u: "पूर्ण सेट" }), cost: 44000, spec: "PMKSY मानकों के अनुसार संपूर्ण ड्रिप प्रणाली: वाटर टैंक, केन्द्रिफ्यूगल पम्प, बाईपास वाल्व, स्क्रीन फिल्टर/सेंड सेपरेटर, वेंचुरी इंजेक्टर, प्रेशर गेज, NRV, मुख्य लाइन, उप-मुख्य लाइन, कंट्रोल वाल्व, एयर रिलीज वाल्व, फ्लश वाल्व, लैटरल लाइन, इंडकैप तथा ड्रिपर/इमीटर्स। प्रति पिल्लर कम से कम 4 ड्रिपर।" },
      { name: "RCC पिल्लर सिस्टम + कंक्रीट रिंग", qty: n => { const standardPillarsByNali = { 5: 167, 10: 333, 15: 500, 20: 666 }; const pillars = Object.prototype.hasOwnProperty.call(standardPillarsByNali, Number(n)) ? standardPillarsByNali[Number(n)] : Math.round(666 * (Number(n) / 20)); return { v: pillars, u: "नग" }; }, cost: 265000, spec: "RCC पिल्लर: लंबाई 2.30 मीटर, क्रॉस-सेक्शन 5×5 इंच (लगभग 12.5×12.5 सेमी)। भूमि की सतह से 1.80 मीटर ऊपर और 0.50 मीटर भूमि के अंदर। शीर्ष पर कंक्रीट रिंग: व्यास 2 फीट, मोटाई 2 इंच, 8 इंच के 4 छेद। पिल्लर से पिल्लर दूरी 2.0 मीटर और लाइन से लाइन 3.0 मीटर।" },
      { name: "GI चेन लिंक्ड फेंसिंग", qty: n => { const L = Math.round(200 + 4 * Number(n)); return { v: L, u: "मीटर" } }, cost: 175000, spec: "जाली की ऊँचाई 1.8 मीटर, तार की मोटाई 2.5 mm (BWG), मेश 4×4 इंच। लोहे के खम्भे 3 मीटर की दूरी पर तथा कंक्रीट से स्थापित। प्रवेश द्वार कम से कम 10–12 फीट चौड़ा। फेंसिंग की लंबाई किसान के स्वीकृत क्षेत्रफल की area-wise table के अनुसार होगी।" },
      { name: "उर्वरक एवं पौध रक्षा रसायन", qty: n => ({ v: "1", u: "प्रथम वर्ष की मानक आवश्यकता" }), cost: 10000, spec: "प्रथम वर्ष हेतु आवश्यक नाइट्रोजन, फास्फोरस, पोटाश तथा कीटनाशक/फफूंदनाशक; जैसे 19:19:19 NPK, सल्फेट ऑफ पोटाश, बोरान, जिंक एवं आवश्यकता अनुसार स्प्रे।" },
      { name: "रोपण सामग्री", qty: n => { const standardPillarsByNali = { 5: 167, 10: 333, 15: 500, 20: 666 }; let pillars; const exactNali = Number(n); if (Object.prototype.hasOwnProperty.call(standardPillarsByNali, exactNali)) { pillars = standardPillarsByNali[exactNali]; } else { pillars = Math.round(666 * (exactNali / 20)); } const plants = pillars * 4; return { v: plants, u: `नग (प्रति पिल्लर 4 पौधे × ${pillars} पिल्लर)` } }, cost: 200000, spec: "प्रति पिल्लर ठीक 4 पौधे — चारों दिशाओं में 1-1 पौधा। इसलिए पौधों की कुल संख्या हमेशा स्वीकृत/गणना किए गए पिल्लरों की संख्या × 4 होगी। पौधा 4–6 माह पुराना, स्वस्थ, रोगमुक्त स्टेम कटिंग अथवा तैयार पौधा होना चाहिए तथा जड़ें विकसित हों। प्रजाति की पहचान हेतु नर्सरी पंजीकरण आवश्यक।" }
    ],
    instructions: ["निर्धारित 2.0 मीटर × 3.0 मीटर layout के अनुसार खेत का रेखांकन करें।", "प्रत्येक पिल्लर के आधार पर 4 गड्ढे निर्धारित आकार और खाद/उर्वरक के साथ तैयार करें।", "निर्धारित संख्या में RCC पिल्लर लगाकर शीर्ष पर निर्धारित कंक्रीट रिंग स्थापित करें।", "प्रत्येक पिल्लर पर 4 पौधों की रोपण व्यवस्था करें।", "PMKSY मानकों के अनुसार पूर्ण ड्रिप एवं फर्टिगेशन व्यवस्था स्थापित करें।", "निर्धारित specification के अनुसार GI chain-link fencing पूर्ण करें।", "प्रथम वर्ष के मानक अनुसार उर्वरक एवं पौध रक्षा रसायनों का उपयोग करें।"]
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

// प्रिंट के समय body पर लगने वाले class तथा उनसे दिखने वाले section
const PRINT_CLASSES = [
  "print-app", "print-project", "print-affidavit", "print-consent",
  "print-affidavit-all", "print-anudan", "print-selected",
  "print-sel-application", "print-sel-project", "print-sel-affidavit",
  "print-sel-consent", "print-sel-anudan",
];
const PRINT_SECTIONS = {
  app: ["applicationPrint"],
  project: ["report"],
  affidavit: ["affidavitPrint"],
  consent: ["consentPrint"],
  all: ["affidavitPrint", "consentPrint"],
  anudan: ["anudanPrint"],
  selected: [],
};
const SELECTED_SECTIONS = {
  app: "applicationPrint", project: "report", aff: "affidavitPrint",
  consent: "consentPrint", anudan: "anudanPrint",
};

const CENTERS = [
  "कोटद्वार", "किनगोड़िखाल", "चौखाल", "धुमाकोट", "बीरोंखाल", "हल्दूखाल", "किल्वोंखाल",
  "चेलूसैंण", "जयहरीखाल", "जेठागांव", "देवियोंखाल", "सिलोगी", "सिसल्ड़ी", "पौखाल",
  "सतपुली", "संगलाकोटी", "देवराजखाल", "पोखड़ा", "वेदीखाल", "विथ्याणी", "गंगाभोगपुर",
  "दिउली", "दुगड्डा", "सेंधीखाल",
];

const RELATIONS = ["सहखातेदार", "भाई", "पुत्र", "पिता", "पत्नी", "अन्य"];

const DragfruitsAndKiwi = () => {
  const [activeSideTab, setActiveSideTab] = useState("view");
  const [workflowStep, setWorkflowStep] = useState(0);
  const [sideOpen, setSideOpen] = useState(false);
  const [flashAnchor, setFlashAnchor] = useState(null);
  const [headerH, setHeaderH] = useState(0);
  const [footerH, setFooterH] = useState(0);

  // Form States
  const [form, setForm] = useState({
    name: "", father: "", gender: "पुरुष", mobile: "", aadhaar: "", udyan: "",
    district: "", block: "", center: "", village: "", post: "", appno: "DRG-2026-0001", remarks: "",
    bankHolder: "", bankName: "", bankBranch: "", bankAccount: "",
    bankIfsc: "", bankType: "बचत खाता",
    workMode: "firm", firmName: "", firmReg: "", workRemark: "",
    declWater: "", declIrrigation: "", declPrevious: "", declLand: "", declInspection: "", declShare: "",
  });

  const [landRows, setLandRows] = useState([
    { rel: "स्वयं", name: "", father: "", village: "", khata: "", khasra: "", gender: "पुरुष", area: "" },
    ...Array(4).fill({ rel: "", name: "", father: "", village: "", khata: "", khasra: "", gender: "पुरुष", area: "" })
  ]);

  // Render & Print States
  const [showAppPrint, setShowAppPrint] = useState(false);
  const [showReportPrint, setShowReportPrint] = useState(false);
  const [showAffPrint, setShowAffPrint] = useState(false);
  const [showConsentPrint, setShowConsentPrint] = useState(false);
  const [showAnudanPrint, setShowAnudanPrint] = useState(false);
  const [viewMode, setViewMode] = useState(null);
  const [printType, setPrintType] = useState(null);
  const [printCheckboxes, setPrintCheckboxes] = useState({ app: true, project: true, aff: true, consent: true, anudan: false });

  // Sync Own Land
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
    document.body.classList.toggle("drag-fruits-lock", sideOpen);
    return () => document.body.classList.remove("drag-fruits-lock");
  }, [sideOpen]);

  useEffect(() => {
    if (!flashAnchor) return undefined;
    const t = setTimeout(() => setFlashAnchor(null), 1400);
    return () => clearTimeout(t);
  }, [flashAnchor]);

  // Print Trigger Effect (Ensures DOM is fully rendered before printing)
  useEffect(() => {
    if (!printType) return;

    const timer = setTimeout(() => {
      let cls = "";
      if (printType === 'app') cls = 'print-app';
      else if (printType === 'project') cls = 'print-project';
      else if (printType === 'affidavit') cls = 'print-affidavit';
      else if (printType === 'consent') cls = 'print-consent';
      else if (printType === 'all') cls = 'print-affidavit-all';
      else if (printType === 'anudan') cls = 'print-anudan';
      else if (printType === 'selected') {
        cls = 'print-selected';
        document.body.classList.add('print-sel-application', 'print-sel-project', 'print-sel-affidavit', 'print-sel-consent', 'print-sel-anudan');
        if (!printCheckboxes.app) document.body.classList.remove('print-sel-application');
        if (!printCheckboxes.project) document.body.classList.remove('print-sel-project');
        if (!printCheckboxes.aff) document.body.classList.remove('print-sel-affidavit');
        if (!printCheckboxes.consent) document.body.classList.remove('print-sel-consent');
        if (!printCheckboxes.anudan) document.body.classList.remove('print-sel-anudan');
      }

      document.body.classList.add(cls);

      // खोलने से पहले जाँच लेते हैं कि चुना गया दस्तावेज़ DOM में सचमुच मौजूद है
      // — नहीं तो PDF प्रीव्यू खाली (blank) आता है।
      const ids = printType === 'selected'
        ? Object.keys(SELECTED_SECTIONS).filter((k) => printCheckboxes[k]).map((k) => SELECTED_SECTIONS[k])
        : (PRINT_SECTIONS[printType] || []);
      const ready = ids.length > 0 && ids.every((id) => {
        const el = document.getElementById(id);
        return el && el.textContent.trim();
      });
      if (!ready) {
        PRINT_CLASSES.forEach((c) => document.body.classList.remove(c));
        setPrintType(null);
        alert(ids.length
          ? 'चुना गया दस्तावेज़ तैयार नहीं है — पहले "मानक बनाएँ / दस्तावेज़ तैयार करें" दबाएँ।'
          : 'पहले कम से कम एक दस्तावेज़ चुनें।');
        return;
      }

      window.print();

      // Cleanup
      PRINT_CLASSES.forEach((c) => document.body.classList.remove(c));
      setPrintType(null);
    }, 300); // 300ms delay ensures React has painted the DOM

    return () => clearTimeout(timer);
  }, [printType, showAppPrint, showReportPrint, showAffPrint, showConsentPrint, showAnudanPrint, printCheckboxes]);

  // -------------- Helpers & Calculations --------------
  const money = n => "₹" + Math.round(n).toLocaleString("en-IN");
  const num = v => parseFloat(v) || 0;

  const landTotalHa = () => landRows.reduce((s, r) => s + (num(r.area)), 0);
  const derivedNali = () => landTotalHa() * 50;
  const hectare = () => landTotalHa();

  const valid = () => {
    if (!form.name || !form.father || !form.mobile || !form.district || !form.block || !form.center || !form.village) return false;
    if (landTotalHa() <= 0) return false;
    if (!form.bankHolder || !form.bankName || !form.bankAccount || !form.bankIfsc) return false;
    if (!form.declWater || !form.declIrrigation || !form.declLand || !form.declInspection || !form.declShare) return false;
    return true;
  };

  // -------------- Action Handlers --------------
  const handleGenerate = () => {
    if (!valid()) { alert("कृपया सभी आवश्यक (*) जानकारी भरें और भूमि क्षेत्रफल दर्ज करें।"); return; }
    setShowAppPrint(true);
    setShowReportPrint(true);
    setViewMode('report');
    setTimeout(() => document.getElementById('report')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleBuildAffidavit = () => {
    if (!valid()) { alert("कृपया सभी आवश्यक (*) जानकारी भरें।"); return; }
    setShowAffPrint(true);
    setShowConsentPrint(true);
    setViewMode('aff');
    setTimeout(() => document.getElementById('affidavitPrint')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleBuildAnudan = () => {
    if (!valid()) { alert("कृपया सभी आवश्यक (*) जानकारी भरें।"); return; }
    setShowAnudanPrint(true);
    setViewMode('anudan');
    setTimeout(() => document.getElementById('anudanPrint')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handlePrint = (type) => {
    if (!valid()) { alert('पहले आवेदन की आवश्यक जानकारी सही करें।'); return; }
    
    // Ensure the necessary print components are rendered in DOM
    if (['app', 'project', 'selected'].includes(type)) setShowAppPrint(true);
    if (['project', 'selected'].includes(type)) setShowReportPrint(true);
    if (['affidavit', 'consent', 'all', 'selected'].includes(type)) setShowAffPrint(true);
    if (['consent', 'all', 'selected'].includes(type)) setShowConsentPrint(true);
    if (['anudan', 'selected'].includes(type)) setShowAnudanPrint(true);

    setPrintType(type); // This triggers the useEffect that handles window.print()
  };

  const handleView = (type) => {
    if (type === 'app') { setShowAppPrint(true); setViewMode('app'); }
    else if (type === 'report') { setShowReportPrint(true); setViewMode('report'); }
    else if (type === 'aff') { setShowAffPrint(true); setViewMode('aff'); }
    else if (type === 'consent') { setShowConsentPrint(true); setViewMode('consent'); }
    else if (type === 'anudan') { setShowAnudanPrint(true); setViewMode('anudan'); }
    
    setTimeout(() => {
      const id = type === 'report' ? 'report' : `${type}Print`;
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const applyDemo = (kind) => {
    const co = kind.endsWith('Co');
    setForm({
      ...form, name: 'राम सिंह (DEMO)', father: 'कमल सिंह', gender: 'पुरुष', mobile: '9876543210',
      aadhaar: '999999999999', district: 'पौड़ी गढ़वाल', block: 'कोटद्वार', center: 'कोटद्वार',
      village: 'कोटद्वार', post: 'कोटद्वार', beneficiary: 'individual', bankHolder: 'राम सिंह (DEMO)',
      bankName: 'उत्तराखण्ड ग्रामीण बैंक (DEMO)', bankBranch: 'कोटद्वार शाखा', bankAccount: '000000000001',
      bankIfsc: 'DEMO0123456', bankType: 'बचत खाता', workMode: 'self',
      declWater: 'हाँ', declIrrigation: 'हाँ', declPrevious: 'नहीं', declLand: 'हाँ', declInspection: 'हाँ', declShare: 'हाँ'
    });
    setLandRows(prev => {
      const newArr = [...prev];
      newArr[0] = { ...newArr[0], khata: '00056', khasra: '12/1', area: '0.10' };
      newArr[1] = co ? { rel: 'सहखातेदार', name: 'मोहन सिंह (DEMO)', father: 'हरि सिंह', village: 'कोटद्वार', khata: '00057', khasra: '12/2', area: '0.10', gender: 'पुरुष' } : { rel: "", name: "", father: "", village: "", khata: "", khasra: "", gender: "पुरुष", area: "" };
      return newArr;
    });
    setTimeout(() => { handleGenerate(); handleBuildAffidavit(); }, 200);
  };

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
    localStorage.setItem("projectApp", JSON.stringify({ form, landRows }));
    alert("आवेदन Draft सुरक्षित हो गया।");
  };

  const loadDraft = () => {
    const o = JSON.parse(localStorage.getItem("projectApp") || "null");
    if (o) {
      setForm(o.form);
      setLandRows(o.landRows);
      alert("Draft लोड हो गया।");
    } else {
      alert("कोई Draft उपलब्ध नहीं है।");
    }
  };

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

  // -------------- Render Print Documents (Pure JSX) --------------
  const m = MASTER.dragon;
  const n = derivedNali();
  const f = n / m.baseNali;
  const totalCost = m.components.reduce((s, c) => s + c.cost * f, 0);
  const pct = m.subsidy(n, "individual");
  const subCost = totalCost * pct / 100;
  const farmerCost = totalCost - subCost;
  const coOwners = landRows.filter(r => r.rel && r.rel !== "स्वयं" && r.name);
  const coMode = coOwners.length > 0;

  return (
    <div className="drag-fruits-root" style={{ "--app-header-h": `${headerH}px`, "--app-footer-h": `${footerH}px` }}>
      <button type="button" aria-label="पैनल बंद करें" className={`side-backdrop ${sideOpen ? "open" : ""}`} onClick={() => setSideOpen(false)} />

      <div className="drag-content">
        <header className="top noprint">
          <div className="top-inner">
            <div className="brand">
              <span className="brand-badge">🐉</span>
              <h1>कृषक आवेदन एवं स्वचालित परियोजना मानक प्रणाली</h1>
            </div>
            <p className="top-sub">
              ड्रैगन फ्रूट (कमलम) — आवेदन के क्षेत्रफल के अनुसार कार्य, मात्रा, Specification,
              Component लागत, परियोजना लागत, कृषक अंश एवं अनुदान
            </p>
            <div className="top-tags">
              <span>🟢 स्वचालित मानक</span><span>🟡 चरणबद्ध अनुदान</span><span>🔵 प्रिंट-रेडी</span>
            </div>
          </div>
        </header>

        <main className="wrap">
          <div className="card noprint">
            <div className="tabs">
              <button type="button" className="tab active">🐉 ड्रैगन फ्रूट</button>
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
            <p className="card-intro">किसान अपने वास्तविक प्रस्तावित क्षेत्रफल के अनुसार आवेदन भरे। इसी क्षेत्रफल से नीचे पूरा व्यक्तिगत परियोजना मानक स्वतः बनेगा।</p>

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
              <div className="field"><label htmlFor="f-beneficiary">लाभार्थी का प्रकार</label><select id="f-beneficiary" defaultValue="individual" onChange={e => setForm({ ...form, beneficiary: e.target.value })}><option value="individual">व्यक्तिगत कृषक</option><option value="group">समूह</option></select></div>
              <div className="field"><label htmlFor="f-appno">आवेदन संख्या</label><input id="f-appno" readOnly placeholder="स्वतः जारी" value={form.appno} onChange={e => setForm({ ...form, appno: e.target.value })} /><span className="hint">Draft सुरक्षित करने पर स्वतः बनेगी।</span></div>
              <div className="field full"><label htmlFor="f-remark">भूमि / परियोजना संबंधी टिप्पणी</label><textarea id="f-remark" placeholder="यदि कोई विशेष बात हो तो यहाँ लिखें" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} /></div>
            </div>

            {/* Land Table */}
            <div className={`inner-card ${anchorCls("wf-land")}`} id={`${ID_PREFIX}wf-land`}>
              <h3>भूमि एवं कार्य का विवरण</h3>
              <p className="card-intro"><b>स्वयं</b> वाली पहली पंक्ति किसान की ऊपर भरी गई जानकारी से स्वतः भरेगी। यदि प्रस्तावित भूमि में सहखातेदार / अन्य खातेदार की भूमि शामिल है तो नीचे की पंक्ति में संबंध चुनकर उसका विवरण एवं क्षेत्रफल भरें।</p>
              <div className="table-wrap">
                <table className="land-table">
                  <thead><tr><th>क्र.</th><th>भूमि किसकी / विवरण</th><th>नाम (खतौनी के अनुसार)</th><th>पिता का नाम</th><th>ग्राम</th><th>खाता सं०</th><th>खसरा / खतौनी सं०</th><th>प्रस्तावित भूमि (हे०)</th></tr></thead>
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
                <div className="stage"><b>चरण 1 — Infrastructure Verification</b><span className="small">निर्धारित infrastructure पूर्ण होने पर स्थलीय / संयुक्त निरीक्षण एवं सत्यापन।</span></div>
                <div className="stage"><b>चरण 2 — 90% पौध जीवितता</b><span className="small">द्वितीय निरीक्षण में पौधों की कम से कम 90% जीवितता का सत्यापन।</span></div>
                <div className="stage"><b>चरण 3 — उत्पादन / फल सत्यापन</b><span className="small">तृतीय निरीक्षण में लागू योजना के अनुसार फल / गुणवत्ता / मात्रा का सत्यापन।</span></div>
              </div>
              <p className="card-intro" style={{ marginTop: "9px", marginBottom: 0 }}><b>पौध अनुदान:</b> लागू योजना / स्वीकृति के अनुसार चरणबद्ध भुगतान (70% + 20% + 10%)।</p>
            </div>

            <div className="err" />
            <div className={`btns ${anchorCls("wf-grant")}`} id={`${ID_PREFIX}wf-grant`}>
              <button type="button" className="btn" onClick={handleGenerate}>✓ आवेदन से किसान-विशिष्ट मानक बनाएं</button>
              <button type="button" className="btn secondary" onClick={saveDraft}>💾 Draft सुरक्षित करें</button>
              <button type="button" className="btn secondary" onClick={loadDraft}>↶ Draft लोड करें</button>
              <button type="button" className="btn gold" onClick={() => handlePrint('app')}>🖨️ आवेदन पत्र Print</button>
              <button type="button" className="btn gold" onClick={() => handlePrint('project')}>🖨️ पूर्ण परियोजना मानक Print</button>
              <button type="button" className="btn" onClick={handleBuildAffidavit}>📜 शपथ-पत्र तैयार करें</button>
              <button type="button" className="btn gold" onClick={() => handlePrint('affidavit')}>🖨️ शपथ-पत्र Print</button>
              <button type="button" className="btn gold" onClick={() => handlePrint('consent')}>🖨️ सहमति / NOC Print</button>
              <button type="button" className="btn secondary" onClick={() => handlePrint('all')}>📑 सभी शपथ-पत्र / सहमति Print</button>
              <button type="button" className="btn" onClick={handleBuildAnudan}>💰 अनुदान देयक तैयार करें</button>
              <button type="button" className="btn gold" onClick={() => handlePrint('anudan')}>🖨️ अनुदान देयक Print</button>
            </div>

            <div className={`print-select ${anchorCls("wf-review")}`} id={`${ID_PREFIX}wf-review`}>
              <h3>🖨️ चयनित दस्तावेज एक साथ Print करें</h3>
              <div className="small">आवेदन पत्र में संलग्न दस्तावेज सूची + घोषणा तथा प्रभारी की आख्या स्वतः शामिल हैं।</div>
              <div className="print-options">
                <label className="print-option"><input type="checkbox" checked={printCheckboxes.app} onChange={e => setPrintCheckboxes({ ...printCheckboxes, app: e.target.checked })} /> <span>आवेदन पत्र</span></label>
                <label className="print-option"><input type="checkbox" checked={printCheckboxes.project} onChange={e => setPrintCheckboxes({ ...printCheckboxes, project: e.target.checked })} /> <span>पूर्ण परियोजना मानक</span></label>
                <label className="print-option"><input type="checkbox" checked={printCheckboxes.aff} onChange={e => setPrintCheckboxes({ ...printCheckboxes, aff: e.target.checked })} /> <span>मुख्य शपथ-पत्र / स्व-घोषणा</span></label>
                <label className="print-option"><input type="checkbox" checked={printCheckboxes.consent} onChange={e => setPrintCheckboxes({ ...printCheckboxes, consent: e.target.checked })} /> <span>सह-खातेदार सहमति / NOC</span></label>
                <label className="print-option"><input type="checkbox" checked={printCheckboxes.anudan} onChange={e => setPrintCheckboxes({ ...printCheckboxes, anudan: e.target.checked })} /> <span>अनुदान देयक / भुगतान प्रपत्र</span></label>
              </div>
              <div className="aff-actions">
                <button type="button" className="btn" onClick={() => handlePrint('selected')}>🖨️ चयनित सभी दस्तावेज Print करें</button>
                <button type="button" className="btn secondary" onClick={() => setPrintCheckboxes({ app: true, project: true, aff: true, consent: true, anudan: true })}>☑ सभी चुनें</button>
                <button type="button" className="btn secondary" onClick={() => setPrintCheckboxes({ app: false, project: false, aff: false, consent: false, anudan: false })}>☐ सभी हटाएँ</button>
              </div>
            </div>

            <div className="demo-tools">
              <b>🧪 Demo Testing — Affidavit</b>
              <div className="card-intro" style={{ margin: "5px 0 0" }}>नीचे से demo data लगाकर स्वयं की भूमि और स्वयं + सह-खातेदार दोनों affidavit तुरंत test करें।</div>
              <div className="demo-row">
                <button type="button" className="btn secondary" onClick={() => applyDemo('dragonSelf')}>Dragon Demo — केवल स्वयं</button>
                <button type="button" className="btn secondary" onClick={() => applyDemo('dragonCo')}>Dragon Demo — सह-खातेदार</button>
              </div>
            </div>
          </section>

          {/* ================= React Based Print Documents ================= */}
          
          {showAppPrint && (
            <section id="applicationPrint" className="card print-doc" style={{ display: viewMode === 'app' ? 'block' : 'none' }}>
              <h2 style={{ textAlign: "center", color: "#1e6091" }}>कृषक आवेदन पत्र</h2>
              <p style={{ textAlign: "center" }}><b>{m.name}</b></p>
              <h3>1. कृषक का विवरण</h3>
              <table>
                <tbody>
                  <tr><th>कृषक का नाम</th><td>{form.name}</td><th>पिता / पति का नाम</th><td>{form.father}</td></tr>
                  <tr><th>मोबाइल</th><td>{form.mobile}</td><th>आधार</th><td>{form.aadhaar || "—"}</td></tr>
                  <tr><th>लिंग</th><td>{form.gender}</td><th>उद्यान कार्ड</th><td>{form.udyan || "—"}</td></tr>
                  <tr><th>जनपद</th><td>{form.district}</td><th>विकासखण्ड</th><td>{form.block}</td></tr>
                  <tr><th>केंद्र</th><td>{form.center}</td><th>ग्राम</th><td>{form.village}</td></tr>
                  <tr><th>प्रस्तावित क्षेत्रफल</th><td><b>{n.toFixed(2)} नाली</b></td><th>क्षेत्रफल</th><td><b>{hectare().toFixed(2)} हे०</b></td></tr>
                </tbody>
              </table>
            </section>
          )}

          {showReportPrint && (
            <section id="report" className="card print-doc" style={{ display: viewMode === 'report' ? 'block' : 'none' }}>
              <div className="summary">
                <div className="metric"><span>योजना</span><b>{m.name}</b></div>
                <div className="metric"><span>प्रस्तावित क्षेत्रफल</span><b>{n.toFixed(2)} नाली</b></div>
                <div className="metric"><span>परियोजना लागत</span><b>{money(totalCost)}</b></div>
                <div className="metric"><span>अनुदान</span><b>{pct}%</b></div>
              </div>
              <h2>2. मानक के अनुसार कार्य, मात्रा एवं Component-wise लागत</h2>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>क्र.</th><th>Component</th><th>Specification</th><th>Quantity</th><th>लागत</th></tr></thead>
                  <tbody>
                    {m.components.map((c, i) => {
                      const q = c.qty(n);
                      const cost = c.cost * f;
                      return (
                        <tr key={i}>
                          <td className="qty">{i + 1}</td>
                          <td><b>{c.name}</b></td>
                          <td className="spec">{c.spec}</td>
                          <td className="qty"><b>{q.v}</b><br /><span className="small">{q.u}</span></td>
                          <td className="money">{money(cost)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="finalbox">
                <div className="finalrow"><span>कुल परियोजना लागत</span><b>{money(totalCost)}</b></div>
                <div className="finalrow"><span>कृषक अंश</span><b>{money(farmerCost)}</b></div>
                <div className="finalrow"><span>देय अनुदान ({pct}%)</span><b>{money(subCost)}</b></div>
              </div>
            </section>
          )}

          {showAffPrint && (
            <section id="affidavitPrint" className="card print-doc" style={{ display: viewMode === 'aff' ? 'block' : 'none' }}>
              <article className="aff-doc">
                <div className="doc-title">{m.name}</div>
                <div className="doc-subtitle">लाभार्थी स्व-घोषणा एवं शपथ-पत्र — {coMode ? 'स्वयं + सह-खातेदार' : 'केवल स्वयं की भूमि'}</div>
                <p>मैं श्री/श्रीमती {form.name}, पुत्र/पुत्री/पत्नी श्री {form.father}, निवासी {form.village}, {form.district}, उत्तराखण्ड, निम्नलिखित घोषणा करता/करती हूँ कि—</p>
                <ol>
                  <li>मेरे द्वारा कुल <b>{n.toFixed(2)} नाली / {hectare().toFixed(4)} हे०</b> भूमि प्रस्तावित की गई है।</li>
                  <li>प्रस्तावित भूमि का विवरण संबंधित भूमि अभिलेख के अनुसार सही है।</li>
                  <li>मैं विभागीय निरीक्षण एवं सत्यापन में सहयोग करूँगा/करूँगी।</li>
                  <li>मैं निर्धारित कृषक अंश का वहन करूँगा/करूँगी।</li>
                </ol>
                <div className="sig">
                  <div>स्थान: ____________________<br />दिनांक: ____________________</div>
                  <div>शपथकर्ता/कृषक<br /><b>{form.name}</b><br />हस्ताक्षर ____________________</div>
                </div>
              </article>
            </section>
          )}

          {showConsentPrint && (
            <section id="consentPrint" className="card print-doc" style={{ display: viewMode === 'consent' ? 'block' : 'none' }}>
              {coOwners.length === 0 ? (
                <div className="aff-doc">
                  <div className="doc-title">सह-खातेदार का सहमति पत्र</div>
                  <p>इस आवेदन में कोई सह-खातेदार दर्ज नहीं है।</p>
                </div>
              ) : (
                coOwners.map((r, idx) => (
                  <article key={idx} className={`aff-doc ${idx ? 'page-break-doc' : ''}`}>
                    <div className="doc-title">{m.name} हेतु</div>
                    <div className="doc-subtitle">सह-खातेदार का सहमति एवं अनापत्ति पत्र</div>
                    <p>मैं श्री/श्रीमती <b>{r.name}</b>, पुत्र/पुत्री/पत्नी श्री <b>{r.father}</b>, निवासी <b>{r.village || form.village}</b>, आवेदक से संबंध <b>{r.rel}</b> हूँ। मैं निम्नलिखित सहमति प्रदान करता/करती हूँ कि—</p>
                    <ol>
                      <li>मेरी भूमि का विवरण खाता संख्या <b>{r.khata}</b>, खसरा/गाटा संख्या <b>{r.khasra}</b>, कुल/प्रस्तावित क्षेत्रफल <b>{num(r.area).toFixed(4)} हे०</b> है।</li>
                      <li>मैं अपनी भूमि को श्री/श्रीमती <b>{form.name}</b> द्वारा {m.name} योजना के आवेदन में सम्मिलित करने की सहमति देता/देती हूँ।</li>
                      <li>मुझे इस पर कोई आपत्ति नहीं है।</li>
                    </ol>
                    <div className="sig">
                      <div>स्थान: ____________________<br />दिनांक: ____________________</div>
                      <div>सह-खातेदार<br /><b>{r.name}</b><br />हस्ताक्षर ____________________</div>
                    </div>
                  </article>
                ))
              )}
            </section>
          )}

          {showAnudanPrint && (
            <section id="anudanPrint" className="card print-doc" style={{ display: viewMode === 'anudan' ? 'block' : 'none' }}>
              <div className="anudan-form">
                <div className="af-head">जिला योजना वर्ष 2026-27</div>
                <div className="af-title">{m.name} अन्तर्गत राजसहायता देयक</div>
                <div className="af-meta">
                  <div><b>नाम कृषक :</b> {form.name}</div><div><b>पिता का नाम :</b> {form.father}</div>
                  <div><b>ग्राम :</b> {form.village}</div><div><b>विकास खण्ड :</b> {form.block}</div>
                </div>
                <div><b>देयक सारणी</b></div>
                <table>
                  <thead><tr><th>क्र०</th><th>कार्य का विवरण</th><th>देयक (₹)</th><th>राजसहायता (₹)</th><th>कृषक अंश (₹)</th></tr></thead>
                  <tbody>
                    <tr><td>1</td><td>ड्रैगन फ्रूट स्थापना</td><td className="money">{money(totalCost)}</td><td className="money">{money(subCost)}</td><td className="money">{money(farmerCost)}</td></tr>
                  </tbody>
                  <tfoot>
                    <tr className="af-total">
                      <td colSpan="2">कुल योग</td>
                      <td className="money">{money(totalCost)}</td>
                      <td className="money">{money(subCost)}</td>
                      <td className="money">{money(farmerCost)}</td>
                    </tr>
                  </tfoot>
                </table>
                <div className="af-sign"><div>हस्ताक्षर कृषक : ____________________</div></div>
              </div>
            </section>
          )}

        </main>

        <div className="footer noprint">Dragon Fruit Farmer Application &amp; Project Standard System</div>
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
            <button type="button" className="side-action" onClick={handleGenerate}>✓ आवेदन से किसान-विशिष्ट मानक बनाएं</button>
            <button type="button" className="side-action" onClick={saveDraft}>💾 Draft सुरक्षित करें</button>
            <button type="button" className="side-action" onClick={loadDraft}>↶ Draft लोड करें</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">शपथ-पत्र</div>
            <button type="button" className="side-action" onClick={handleBuildAffidavit}>📜 शपथ-पत्र तैयार करें</button>
            <button type="button" className="side-action" onClick={handleBuildAffidavit}>🤝 सहमति / NOC तैयार करें</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">अनुदान</div>
            <button type="button" className="side-action" onClick={handleBuildAnudan}>💰 अनुदान देयक तैयार करें</button>
          </div>
        </div>

        <div className={`side-pane ${activeSideTab === "view" ? "active" : ""}`}>
          <h4>दस्तावेज / फॉर्म देखें</h4>
          <div className="side-group">
            <div className="side-group-title">आवेदन एवं मानक</div>
            <button type="button" className="side-action" onClick={() => handleView('app')}>📄 आवेदन पत्र देखें</button>
            <button type="button" className="side-action" onClick={() => handleView('report')}>📋 पूर्ण परियोजना मानक देखें</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">शपथ-पत्र / सहमति</div>
            <button type="button" className="side-action" onClick={() => handleView('aff')}>📜 शपथ-पत्र तैयार / देखें</button>
            <button type="button" className="side-action" onClick={() => handleView('consent')}>🤝 सहमति / NOC देखें</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">अनुदान</div>
            <button type="button" className="side-action" onClick={() => handleView('anudan')}>💰 अनुदान देयक फॉर्म खोलें</button>
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
            <button type="button" className="side-action gold" onClick={() => handlePrint('anudan')}>🖨 अनुदान देयक Print</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">चयनित दस्तावेज एक साथ</div>
            <div className="side-mini">☑ आवेदन पत्र चुनने पर संलग्न दस्तावेज सूची + घोषणा तथा प्रभारी की आख्या भी शामिल होंगी।</div>
            <label className="side-check"><input type="checkbox" checked={printCheckboxes.app} onChange={e => setPrintCheckboxes({ ...printCheckboxes, app: e.target.checked })} /> आवेदन पत्र</label>
            <label className="side-check"><input type="checkbox" checked={printCheckboxes.project} onChange={e => setPrintCheckboxes({ ...printCheckboxes, project: e.target.checked })} /> पूर्ण परियोजना मानक</label>
            <label className="side-check"><input type="checkbox" checked={printCheckboxes.aff} onChange={e => setPrintCheckboxes({ ...printCheckboxes, aff: e.target.checked })} /> मुख्य शपथ-पत्र</label>
            <label className="side-check"><input type="checkbox" checked={printCheckboxes.consent} onChange={e => setPrintCheckboxes({ ...printCheckboxes, consent: e.target.checked })} /> सह-खातेदार सहमति / NOC</label>
            <label className="side-check"><input type="checkbox" checked={printCheckboxes.anudan} onChange={e => setPrintCheckboxes({ ...printCheckboxes, anudan: e.target.checked })} /> अनुदान देयक</label>
            <button type="button" className="side-action gold" onClick={() => handlePrint('selected')}>🖨 चयनित सभी दस्तावेज Print</button>
            <button type="button" className="side-action" onClick={() => setPrintCheckboxes({ app: true, project: true, aff: true, consent: true, anudan: true })}>☑ सभी चुनें</button>
            <button type="button" className="side-action" onClick={() => setPrintCheckboxes({ app: false, project: false, aff: false, consent: false, anudan: false })}>☐ सभी हटाएँ</button>
          </div>
        </div>

        <div className={`side-pane ${activeSideTab === "anudan" ? "active" : ""}`}>
          <h4>अनुदान देयक</h4>
          <div className="side-group">
            <div className="side-group-title">अनुदान कार्य</div>
            <button type="button" className="side-action" onClick={handleBuildAnudan}>✓ अनुदान देयक बनाएं</button>
            <button type="button" className="side-action gold" onClick={() => handlePrint('anudan')}>🖨 अनुदान देयक Print</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">वर्तमान स्थिति</div>
            <div className="side-mini">बिल / वाउचर की राशि अनुदान फॉर्म में दर्ज होगी।</div>
            <div className="side-stats">
              <div><b>कुल देयक</b><span>₹0</span></div>
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
            <button type="button" className="side-step"><span className="num">3</span><div><b>चरण 3 — गणना / समीक्षा</b><span>कुल देयक, राजसहायता और कृषक अंश देखें</span></div></button>
            <button type="button" className="side-step"><span className="num">4</span><div><b>चरण 4 — देयक / Print</b><span>अनुदान देयक तैयार और print करें</span></div></button>
          </div>
        </div>

        <div className={`side-pane ${activeSideTab === "demo" ? "active" : ""}`}>
          <h4>Demo Testing</h4>
          <div className="side-group">
            <div className="side-group-title">Affidavit Demo</div>
            <div className="side-mini">Demo data लगाकर स्वयं की भूमि और स्वयं + सह-खातेदार दोनों affidavit तुरंत test करें।</div>
            <button type="button" className="side-action" onClick={() => applyDemo('dragonSelf')}>🐉 Dragon — केवल स्वयं</button>
            <button type="button" className="side-action" onClick={() => applyDemo('dragonCo')}>🐉 Dragon — सह-खातेदार</button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default DragfruitsAndKiwi;