import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import "../kishanavedan/DragfruitsAndKiwi.css";
import { useAuth } from "../../context/AuthContext";

const ID_PREFIX = "dragon-";

const MASTER = {
  dragon: {
    name: "ड्रैगन फ्रूट (कमलम)",
    baseNali: 20,
    baseHa: 0.4,
    baseCost: 796000,
    subsidy: (n) => (n <= 50 ? 80 : 50),
    components: [
      {
        name: "भूमि रेखांकन एवं अन्य तैयारी",
        qty: (n) => ({ v: "सम्पूर्ण परियोजना क्षेत्र हेतु", u: "" }),
        cost: 12000,
        spec: "भूमि समतलीकरण, जुताई, निराई-गुड़ाई, ढलान अनुसार मेड़बंदी तथा स्थल का लेआउट निर्धारित दूरी के अनुसार किया जाएगा। पिल्लर से पिल्लर 2.0 मीटर तथा लाइन से लाइन 3.0 मीटर की व्यवस्था रहेगी।",
      },
      {
        name: "गड्ढा खुदान/भरान, बंड, खाद एवं उर्वरक प्रबंधन",
        qty: (n) => {
          const p = { 5: 167, 10: 333, 15: 500, 20: 666 };
          const key = Number(n);
          const pillars = Object.prototype.hasOwnProperty.call(p, key)
            ? p[key]
            : Math.round(666 * (key / 20));
          return { v: pillars * 4, u: "गड्ढे (प्रति पिल्लर 4)" };
        },
        cost: 90000,
        spec: "गड्ढे का आकार 0.20 मीटर × 0.20 मीटर × 0.20 मीटर। प्रत्येक गड्ढे को 0.30 मीटर ऊँचाई तक भराई करनी होगी। प्रत्येक पिल्लर के आधार पर 4 गड्ढे। प्रति गड्ढा 2–3 किलोग्राम कम्पोस्ट तथा 50 ग्राम सिंगल सुपर फॉस्फेट (SSP) मिलाना अनिवार्य।",
      },
      {
        name: "ड्रिप सिंचाई प्रणाली एवं फर्टिगेशन",
        qty: (n) => ({ v: "1", u: "पूर्ण सेट" }),
        cost: 44000,
        spec: "PMKSY मानकों के अनुसार संपूर्ण ड्रिप प्रणाली: वाटर टैंक, केन्द्रिफ्यूगल पम्प, बाईपास वाल्व, स्क्रीन फिल्टर/सेंड सेपरेटर, वेंचुरी इंजेक्टर, प्रेशर गेज, NRV, मुख्य लाइन, उप-मुख्य लाइन, कंट्रोल वाल्व, एयर रिलीज वाल्व, फ्लश वाल्व, लैटरल लाइन, इंडकैप तथा ड्रिपर/इमीटर्स। प्रति पिल्लर कम से कम 4 ड्रिपर।",
      },
      {
        name: "RCC पिल्लर सिस्टम + कंक्रीट रिंग",
        qty: (n) => {
          const standardPillarsByNali = { 5: 167, 10: 333, 15: 500, 20: 666 };
          const pillars = Object.prototype.hasOwnProperty.call(
            standardPillarsByNali,
            Number(n),
          )
            ? standardPillarsByNali[Number(n)]
            : Math.round(666 * (Number(n) / 20));
          return { v: pillars, u: "नग" };
        },
        cost: 265000,
        spec: "RCC पिल्लर: लंबाई 2.30 मीटर, क्रॉस-सेक्शन 5×5 इंच (लगभग 12.5×12.5 सेमी)। भूमि की सतह से 1.80 मीटर ऊपर और 0.50 मीटर भूमि के अंदर। शीर्ष पर कंक्रीट रिंग: व्यास 2 फीट, मोटाई 2 इंच, 8 इंच के 4 छेद। पिल्लर से पिल्लर दूरी 2.0 मीटर और लाइन से लाइन 3.0 मीटर।",
      },
      {
        name: "GI चेन लिंक्ड फेंसिंग",
        qty: (n) => {
          const L = Math.round(200 + 4 * Number(n));
          return { v: L, u: "मीटर" };
        },
        cost: 175000,
        spec: "जाली की ऊँचाई 1.8 मीटर, तार की मोटाई 2.5 mm (BWG), मेश 4×4 इंच। लोहे के खम्भे 3 मीटर की दूरी पर तथा कंक्रीट से स्थापित। प्रवेश द्वार कम से कम 10–12 फीट चौड़ा। फेंसिंग की लंबाई किसान के स्वीकृत क्षेत्रफल की area-wise table के अनुसार होगी।",
      },
      {
        name: "उर्वरक एवं पौध रक्षा रसायन",
        qty: (n) => ({ v: "1", u: "प्रथम वर्ष की मानक आवश्यकता" }),
        cost: 10000,
        spec: "प्रथम वर्ष हेतु आवश्यक नाइट्रोजन, फास्फोरस, पोटाश तथा कीटनाशक/फफूंदनाशक; जैसे 19:19:19 NPK, सल्फेट ऑफ पोटाश, बोरान, जिंक एवं आवश्यकता अनुसार स्प्रे।",
      },
      {
        name: "रोपण सामग्री",
        qty: (n) => {
          const standardPillarsByNali = { 5: 167, 10: 333, 15: 500, 20: 666 };
          let pillars;
          const exactNali = Number(n);
          if (
            Object.prototype.hasOwnProperty.call(
              standardPillarsByNali,
              exactNali,
            )
          ) {
            pillars = standardPillarsByNali[exactNali];
          } else {
            pillars = Math.round(666 * (exactNali / 20));
          }
          const plants = pillars * 4;
          return {
            v: plants,
            u: `नग (प्रति पिल्लर 4 पौधे × ${pillars} पिल्लर)`,
          };
        },
        cost: 200000,
        spec: "प्रति पिल्लर ठीक 4 पौधे — चारों दिशाओं में 1-1 पौधा। इसलिए पौधों की कुल संख्या हमेशा स्वीकृत/गणना किए गए पिल्लरों की संख्या × 4 होगी। पौधा 4–6 माह पुराना, स्वस्थ, रोगमुक्त स्टेम कटिंग अथवा तैयार पौधा होना चाहिए तथा जड़ें विकसित हों। प्रजाति की पहचान हेतु नर्सरी पंजीकरण आवश्यक।",
      },
    ],
    instructions: [
      "निर्धारित 2.0 मीटर × 3.0 मीटर layout के अनुसार खेत का रेखांकन करें।",
      "प्रत्येक पिल्लर के आधार पर 4 गड्ढे निर्धारित आकार और खाद/उर्वरक के साथ तैयार करें।",
      "निर्धारित संख्या में RCC पिल्लर लगाकर शीर्ष पर निर्धारित कंक्रीट रिंग स्थापित करें।",
      "प्रत्येक पिल्लर पर 4 पौधों की रोपण व्यवस्था करें।",
      "PMKSY मानकों के अनुसार पूर्ण ड्रिप एवं फर्टिगेशन व्यवस्था स्थापित करें।",
      "निर्धारित specification के अनुसार GI chain-link fencing पूर्ण करें।",
      "प्रथम वर्ष के मानक अनुसार उर्वरक एवं पौध रक्षा रसायनों का उपयोग करें।",
    ],
  },
};

const APP_STEPS = [
  {
    title: "योजना + मूल जानकारी",
    sub: "योजना, नाम, पिता/पति, लिंग, मोबाइल, पता और आवेदन संख्या",
    anchor: "wf-basic",
  },
  {
    title: "भूमि / सह-खातेदार",
    sub: "स्वयं/सह-खातेदार, संबंध, खाता, खसरा और क्षेत्रफल का exact match",
    anchor: "wf-land",
  },
  {
    title: "बैंक + कार्य निष्पादन",
    sub: "बैंक विवरण और स्वयं/फर्म द्वारा कार्य",
    anchor: "wf-bank",
  },
  {
    title: "दस्तावेज + घोषणा",
    sub: "संलग्न दस्तावेज और पात्रता/किसान घोषणा",
    anchor: "wf-docs",
  },
  {
    title: "मानक बनाएं",
    sub: "क्षेत्रफल से पूर्ण परियोजना मानक और लागत/राजसहायता",
    anchor: "wf-standard",
  },
  {
    title: "शपथ-पत्र / NOC",
    sub: "स्वयं या सह-खातेदार के अनुसार automatic affidavit/NOC",
    anchor: "wf-affidavit",
  },
  {
    title: "अनुदान व्यय",
    sub: "चरण चुनें, project component से voucher जोड़ें, भुगतान पाने वाला चुनें",
    anchor: "wf-grant",
  },
  {
    title: "समीक्षा + Print",
    sub: "आवेदन, मानक, affidavit/NOC और अनुदान print",
    anchor: "wf-review",
  },
];

const SIDE_TABS = [
  { id: "work", label: "⚙ कार्य" },
  { id: "view", label: "👁 देखें" },
  { id: "print", label: "🖨 प्रिंट" },
  { id: "anudan", label: "💰 अनुदान" },
  { id: "demo", label: "🧪 Demo" },
  { id: "steps", label: "🧭 चरण" },
];

// प्रिंट के समय body पर लगने वाले class तथा उनसे दिखने वाले section
const PRINT_CLASSES = [
  "print-app",
  "print-project",
  "print-affidavit",
  "print-consent",
  "print-affidavit-all",
  "print-anudan",
  "print-selected",
  "print-sel-application",
  "print-sel-project",
  "print-sel-affidavit",
  "print-sel-consent",
  "print-sel-anudan",
  "print-break-project",
  "print-break-affidavit",
  "print-break-consent",
  "print-break-anudan",
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
  app: "applicationPrint",
  project: "report",
  aff: "affidavitPrint",
  consent: "consentPrint",
  anudan: "anudanPrint",
};
const API_MEDIA_BASE = "https://mahadevaaya.com/govbillingsystem/backend";
const MAX_DOC_BYTES = 5 * 1024 * 1024;
// scope: "documents" → document_details, scope: "personal" → personal_details
const DOC_FIELDS = [
  { key: "land_record_khatauni", label: "भूमि अभिलेख / खतौनी" },
  { key: "aadhaar_identity", label: "आधार / पहचान" },
  { key: "horticulture_card", label: "उद्यान कार्ड" },
  { key: "bank_passbook_cancelled_cheque", label: "बैंक पासबुक / cancelled cheque" },
  { key: "land_map_other_record", label: "भूमि नक्शा / अन्य अभिलेख" },
  { key: "other_document", label: "अन्य दस्तावेज" },
  { key: "bank_proof", label: "बैंक पासबुक / cancelled cheque (बैंक प्रमाण)", scope: "personal" },
];
const docMediaUrl = (path) => {
  const value = String(path == null ? "" : path).trim();
  if (!value || value === "null" || value === "undefined") return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${API_MEDIA_BASE}${value}`;
  return `${API_MEDIA_BASE}/${value}`;
};
const createEmptyDocUrls = () =>
  DOC_FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {});

const CENTERS = [
  "कोटद्वार",
  "किनगोड़िखाल",
  "चौखाल",
  "धुमाकोट",
  "बीरोंखाल",
  "हल्दूखाल",
  "किल्वोंखाल",
  "चेलूसैंण",
  "जयहरीखाल",
  "जेठागांव",
  "देवियोंखाल",
  "सिलोगी",
  "सिसल्ड़ी",
  "पौखाल",
  "सतपुली",
  "संगलाकोटी",
  "देवराजखाल",
  "पोखड़ा",
  "वेदीखाल",
  "विथ्याणी",
  "गंगाभोगपुर",
  "दिउली",
  "दुगड्डा",
  "सेंधीखाल",
];

const RELATIONS = ["सहखातेदार", "भाई", "पुत्र", "पिता", "पत्नी", "अन्य"];

// लॉगिन केंद्र (AuthContext) से केंद्र नाम निकालने का साझा तरीका
const getCenterNameFromUser = (authUser) => {
  if (!authUser) return "";
  const candidates = [
    authUser.center_name,
    authUser.centerName,
    authUser.center?.center_name,
    authUser.center?.name,
    authUser.profile?.center_name,
    authUser.centre?.center_name,
    authUser.data?.center_name,
    // केंद्र लॉगिन में केंद्र का नाम "username" में आता है
    authUser.username,
    authUser.name,
  ];
  const direct = candidates.find(
    (value) => value !== null && value !== undefined && String(value).trim() !== "",
  );
  return direct ? String(direct).trim() : "";
};
const API_DRAGON_FRUIT =
  "https://mahadevaaya.com/govbillingsystem/backend/api/dragon-fruit-kisan/";

// GET पर ?center_name=... भेजने पर सर्वर खाली मिलने पर 404 दे देता है,
// इसलिए पूरी सूची लेकर केंद्र छानना frontend पर ही किया जाता है (portal जैसा)।
const apiFetch = async (url, options = {}) => {
  const method = (options.method || "GET").toUpperCase();
  return fetch(url, { ...options, method, credentials: "omit" });
};

const readApiResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      contentType.toLowerCase().includes("application/json")
        ? "सर्वर का उत्तर पढ़ा नहीं जा सका।"
        : `सर्वर से अपेक्षित JSON नहीं मिला (${response.status})।`,
    );
  }
};

const normalizeText = (value) =>
  String(value === null || value === undefined ? "" : value)
    .replace(/\s+/g, " ")
    .trim();

const centerMatches = (recordCenter, wantedCenter) => {
  const wanted = normalizeText(wantedCenter).toLowerCase();
  const actual = normalizeText(recordCenter).toLowerCase();
  if (!wanted || !actual) return true;
  return (
    actual === wanted || actual.includes(wanted) || wanted.includes(actual)
  );
};

const recordList = (data) => (Array.isArray(data) ? data : data?.results || []);
const recordPersonal = (record) => record?.personal_details || record || {};
const recordFormId = (record) =>
  record?.form_id || record?.personal_details?.form_id || "";

const createDragonForm = () => ({
  name: "",
  father: "",
  gender: "पुरुष",
  mobile: "",
  aadhaar: "",
  udyan: "",
  district: "",
  block: "",
  center: "",
  village: "",
  post: "",
  appno: "",
  remarks: "",
  beneficiary: "individual",
  bankHolder: "",
  bankName: "",
  bankBranch: "",
  bankAccount: "",
  bankIfsc: "",
  bankType: "बचत खाता",
  workMode: "firm",
  firmName: "",
  firmReg: "",
  workRemark: "",
  declWater: "",
  declIrrigation: "",
  declPrevious: "",
  declLand: "",
  declInspection: "",
  declShare: "",
});

const createLandRows = () => [
  {
    rel: "स्वयं",
    name: "",
    father: "",
    village: "",
    khata: "",
    khasra: "",
    gender: "पुरुष",
    area: "",
  },
  ...Array.from({ length: 4 }, () => ({
    rel: "",
    name: "",
    father: "",
    village: "",
    khata: "",
    khasra: "",
    gender: "पुरुष",
    area: "",
  })),
];

const DragfruitsAndKiwi = () => {
  const { user } = useAuth();
  const authCenter = getCenterNameFromUser(user);
  const [activeSideTab, setActiveSideTab] = useState("view");
  const [workflowStep, setWorkflowStep] = useState(0);
  const [sideOpen, setSideOpen] = useState(false);
  const [flashAnchor, setFlashAnchor] = useState(null);
  const [headerH, setHeaderH] = useState(0);
  const [footerH, setFooterH] = useState(0);
  const [activePage, setActivePage] = useState("register");
  const [formId, setFormId] = useState("");
  const [registration, setRegistration] = useState({
    name: "",
    mobile: "",
    center: "",
  });
  const [registeredRows, setRegisteredRows] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [savingStage, setSavingStage] = useState("");
  const [saveStates, setSaveStates] = useState({});
  const [voucherRows, setVoucherRows] = useState([["", "", "", "", "", ""]]);

  // Form States
  const [form, setForm] = useState(createDragonForm);
  const [landRows, setLandRows] = useState(createLandRows);

  // Uploaded / Pending Documents
  const [docFiles, setDocFiles] = useState({});
  const [docRemoved, setDocRemoved] = useState({});
  const [docUrls, setDocUrls] = useState(createEmptyDocUrls);
  const [docInputTick, setDocInputTick] = useState(0);

  // लॉगिन केंद्र AuthContext से आता है — यहाँ पंजीकरण का केंद्र उसी से बदला जाता है
  useEffect(() => {
    if (!authCenter) return;
    setRegistration((prev) =>
      prev.center === authCenter ? prev : { ...prev, center: authCenter },
    );
  }, [authCenter]);

  // Render & Print States
  const [showAppPrint, setShowAppPrint] = useState(false);
  const [showReportPrint, setShowReportPrint] = useState(false);
  const [showAffPrint, setShowAffPrint] = useState(false);
  const [showConsentPrint, setShowConsentPrint] = useState(false);
  const [showAnudanPrint, setShowAnudanPrint] = useState(false);
  const [viewMode, setViewMode] = useState(null);
  const [printType, setPrintType] = useState(null);
  const [printCheckboxes, setPrintCheckboxes] = useState({
    app: true,
    project: true,
    aff: true,
    consent: true,
    anudan: false,
  });

  // Sync Own Land
  useEffect(() => {
    setLandRows((prev) => {
      const newArr = [...prev];
      newArr[0] = {
        ...newArr[0],
        name: form.name,
        father: form.father,
        village: form.village,
      };
      return newArr;
    });
  }, [form.name, form.father, form.village]);

  useLayoutEffect(() => {
    const measure = () => {
      const nav = document.querySelector(".Dash-header, .navbar-top");
      if (nav) {
        const pos = window.getComputedStyle(nav).position;
        const h =
          pos === "fixed" ? Math.round(nav.getBoundingClientRect().height) : 0;
        setHeaderH((prev) => (prev === h ? prev : h));
      }
      const foot = document.querySelector(".copyright-footer");
      if (foot) {
        const pos = window.getComputedStyle(foot).position;
        const h =
          pos === "fixed" ? Math.round(foot.getBoundingClientRect().height) : 0;
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
      if (printType === "app") cls = "print-app";
      else if (printType === "project") cls = "print-project";
      else if (printType === "affidavit") cls = "print-affidavit";
      else if (printType === "consent") cls = "print-consent";
      else if (printType === "all") cls = "print-affidavit-all";
      else if (printType === "anudan") cls = "print-anudan";
      else if (printType === "selected") {
        cls = "print-selected";
        document.body.classList.add(
          "print-sel-application",
          "print-sel-project",
          "print-sel-affidavit",
          "print-sel-consent",
          "print-sel-anudan",
        );
        if (!printCheckboxes.app)
          document.body.classList.remove("print-sel-application");
        if (!printCheckboxes.project)
          document.body.classList.remove("print-sel-project");
        if (!printCheckboxes.aff)
          document.body.classList.remove("print-sel-affidavit");
        if (!printCheckboxes.consent)
          document.body.classList.remove("print-sel-consent");
        if (!printCheckboxes.anudan)
          document.body.classList.remove("print-sel-anudan");
        let hasSelectedDocument = false;
        [
          ["app", printCheckboxes.app],
          ["project", printCheckboxes.project],
          ["affidavit", printCheckboxes.aff],
          ["consent", printCheckboxes.consent],
          ["anudan", printCheckboxes.anudan],
        ].forEach(([key, selected]) => {
          if (selected && hasSelectedDocument && key !== "app")
            document.body.classList.add(`print-break-${key}`);
          if (selected) hasSelectedDocument = true;
        });
      }

      document.body.classList.add(cls);

      // खोलने से पहले जाँच लेते हैं कि चुना गया दस्तावेज़ DOM में सचमुच मौजूद है
      // — नहीं तो PDF प्रीव्यू खाली (blank) आता है।
      const ids =
        printType === "selected"
          ? Object.keys(SELECTED_SECTIONS)
              .filter((k) => printCheckboxes[k])
              .map((k) => SELECTED_SECTIONS[k])
          : PRINT_SECTIONS[printType] || [];
      const ready =
        ids.length > 0 &&
        ids.every((id) => {
          const el = document.getElementById(id);
          return el && el.textContent.trim();
        });
      if (!ready) {
        PRINT_CLASSES.forEach((c) => document.body.classList.remove(c));
        setPrintType(null);
        alert(
          ids.length
            ? 'चुना गया दस्तावेज़ तैयार नहीं है — पहले "मानक बनाएँ / दस्तावेज़ तैयार करें" दबाएँ।'
            : "पहले कम से कम एक दस्तावेज़ चुनें।",
        );
        return;
      }

      window.print();

      // Cleanup
      PRINT_CLASSES.forEach((c) => document.body.classList.remove(c));
      setPrintType(null);
    }, 300); // 300ms delay ensures React has painted the DOM

    return () => clearTimeout(timer);
  }, [
    printType,
    showAppPrint,
    showReportPrint,
    showAffPrint,
    showConsentPrint,
    showAnudanPrint,
    printCheckboxes,
  ]);

  // -------------- Helpers & Calculations --------------
  const money = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
  const num = (v) => parseFloat(v) || 0;

  const landTotalHa = () => landRows.reduce((s, r) => s + num(r.area), 0);
  const derivedNali = () => landTotalHa() * 50;
  const hectare = () => landTotalHa();

  const valid = () => {
    if (
      !form.name ||
      !form.father ||
      !form.mobile ||
      !form.district ||
      !form.block ||
      !form.center ||
      !form.village
    )
      return false;
    if (landTotalHa() <= 0) return false;
    if (
      !form.bankHolder ||
      !form.bankName ||
      !form.bankAccount ||
      !form.bankIfsc
    )
      return false;
    if (
      !form.declWater ||
      !form.declIrrigation ||
      !form.declLand ||
      !form.declInspection ||
      !form.declShare
    )
      return false;
    return true;
  };

  // -------------- Action Handlers --------------
  const handleGenerate = () => {
    if (!valid()) {
      alert("कृपया सभी आवश्यक (*) जानकारी भरें और भूमि क्षेत्रफल दर्ज करें।");
      return;
    }
    setShowAppPrint(true);
    setShowReportPrint(true);
    setViewMode("report");
    setTimeout(
      () =>
        document
          .getElementById("report")
          ?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  const handleBuildAffidavit = () => {
    if (!valid()) {
      alert("कृपया सभी आवश्यक (*) जानकारी भरें।");
      return;
    }
    setShowAffPrint(true);
    setShowConsentPrint(true);
    setViewMode("aff");
    setTimeout(
      () =>
        document
          .getElementById("affidavitPrint")
          ?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  const handleBuildAnudan = () => {
    if (!valid()) {
      alert("कृपया सभी आवश्यक (*) जानकारी भरें।");
      return;
    }
    setShowAnudanPrint(true);
    setViewMode("anudan");
    setTimeout(
      () =>
        document
          .getElementById("anudanPrint")
          ?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  const handlePrint = (type) => {
    if (!valid()) {
      alert("पहले आवेदन की आवश्यक जानकारी सही करें।");
      return;
    }

    // Ensure the necessary print components are rendered in DOM
    if (["app", "project", "selected"].includes(type)) setShowAppPrint(true);
    if (["project", "selected"].includes(type)) setShowReportPrint(true);
    if (["affidavit", "consent", "all", "selected"].includes(type))
      setShowAffPrint(true);
    if (["consent", "all", "selected"].includes(type))
      setShowConsentPrint(true);
    if (["anudan", "selected"].includes(type)) setShowAnudanPrint(true);

    setPrintType(type); // This triggers the useEffect that handles window.print()
  };

  const handleView = (type) => {
    if (type === "app") {
      setShowAppPrint(true);
      setViewMode("app");
    } else if (type === "report") {
      setShowReportPrint(true);
      setViewMode("report");
    } else if (type === "aff") {
      setShowAffPrint(true);
      setViewMode("aff");
    } else if (type === "consent") {
      setShowConsentPrint(true);
      setViewMode("consent");
    } else if (type === "anudan") {
      setShowAnudanPrint(true);
      setViewMode("anudan");
    }

    setTimeout(() => {
      const id = type === "report" ? "report" : `${type}Print`;
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const applyDemo = (kind) => {
    const co = kind.endsWith("Co");
    setForm({
      ...form,
      name: "राम सिंह (DEMO)",
      father: "कमल सिंह",
      gender: "पुरुष",
      mobile: "9876543210",
      aadhaar: "999999999999",
      district: "पौड़ी गढ़वाल",
      block: "कोटद्वार",
      center: "कोटद्वार",
      village: "कोटद्वार",
      post: "कोटद्वार",
      beneficiary: "individual",
      bankHolder: "राम सिंह (DEMO)",
      bankName: "उत्तराखण्ड ग्रामीण बैंक (DEMO)",
      bankBranch: "कोटद्वार शाखा",
      bankAccount: "000000000001",
      bankIfsc: "DEMO0123456",
      bankType: "बचत खाता",
      workMode: "self",
      declWater: "हाँ",
      declIrrigation: "हाँ",
      declPrevious: "नहीं",
      declLand: "हाँ",
      declInspection: "हाँ",
      declShare: "हाँ",
    });
    setLandRows((prev) => {
      const newArr = [...prev];
      newArr[0] = {
        ...newArr[0],
        khata: "00056",
        khasra: "12/1",
        area: "0.10",
      };
      newArr[1] = co
        ? {
            rel: "सहखातेदार",
            name: "मोहन सिंह (DEMO)",
            father: "हरि सिंह",
            village: "कोटद्वार",
            khata: "00057",
            khasra: "12/2",
            area: "0.10",
            gender: "पुरुष",
          }
        : {
            rel: "",
            name: "",
            father: "",
            village: "",
            khata: "",
            khasra: "",
            gender: "पुरुष",
            area: "",
          };
      return newArr;
    });
    setTimeout(() => {
      handleGenerate();
      handleBuildAffidavit();
    }, 200);
  };

  const handleLandChange = (i, field, val) => {
    setLandRows((prev) => {
      const newArr = [...prev];
      newArr[i] = { ...newArr[i], [field]: val };
      if (field === "rel" && !val) {
        newArr[i] = {
          ...newArr[i],
          name: "",
          father: "",
          village: "",
          khata: "",
          khasra: "",
          area: "",
          gender: "पुरुष",
        };
      }
      return newArr;
    });
  };

  const handleVoucherChange = (rowIndex, columnIndex, value) => {
    setVoucherRows((previous) =>
      previous.map((row, index) =>
        index === rowIndex
          ? row.map((cell, cellIndex) =>
              cellIndex === columnIndex ? value : cell,
            )
          : row,
      ),
    );
  };

  const syncDocUrls = (record) => {
    const personal = recordPersonal(record);
    const documents = record?.document_details || {};
    setDocUrls(
      DOC_FIELDS.reduce(
        (acc, field) => ({
          ...acc,
          [field.key]: docMediaUrl(
            field.scope === "personal"
              ? personal[field.key]
              : documents[field.key],
          ),
        }),
        {},
      ),
    );
  };

  const resetDocState = () => {
    setDocFiles({});
    setDocRemoved({});
    setDocUrls(createEmptyDocUrls());
    setDocInputTick((tick) => tick + 1);
  };

  const handleDocFileChange = (key, file) => {
    if (!file) return;
    if (file.size > MAX_DOC_BYTES) {
      setApiMessage(
        `"${file.name}" 5 MB से बड़ी है — अधिकतम 5 MB की फाइल चुनें।`,
      );
      setDocInputTick((tick) => tick + 1);
      return;
    }
    setDocFiles((previous) => ({ ...previous, [key]: file }));
    setDocRemoved((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const clearDocField = (key) => {
    setDocFiles((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
    setDocRemoved((previous) =>
      docUrls[key] ? { ...previous, [key]: true } : previous,
    );
    setDocUrls((previous) => ({ ...previous, [key]: "" }));
    setDocInputTick((tick) => tick + 1);
  };

  const pendingDocKeys = () =>
    Object.keys(docRemoved).filter((key) => docRemoved[key]);

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

  const getApiError = (data, response) => {
    if (typeof data === "string") return data;
    return (
      data?.detail ||
      data?.error ||
      data?.message ||
      `अनुरोध विफल (status ${response.status})`
    );
  };

  const fetchAllRegistrations = async () => {
    const response = await apiFetch(API_DRAGON_FRUIT);
    if (response.status === 404) return [];
    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(getApiError(data, response));
    return recordList(data);
  };

  const loadRegistrations = useCallback(
    async (centerName = registration.center) => {
      setRegistrationsLoading(true);
      try {
        const all = await fetchAllRegistrations();
        setRegisteredRows(
          all.filter((record) =>
            centerMatches(recordPersonal(record).center_name, centerName),
          ),
        );
        setApiMessage("");
      } catch (error) {
        setRegisteredRows([]);
        setApiMessage(
          `सूची लोड नहीं हो सकी: ${error.message || "अज्ञात त्रुटि"}`,
        );
      } finally {
        setRegistrationsLoading(false);
      }
    },
    [registration.center],
  );

  useEffect(() => {
    if (!registration.center) return;
    loadRegistrations(registration.center);
  }, [loadRegistrations, registration.center]);

  const registerFarmer = async (event) => {
    event.preventDefault();
    if (!registration.name.trim()) {
      setApiMessage("कृषक का नाम भरना अनिवार्य है।");
      return;
    }
    if (!/^\d{10}$/.test(registration.mobile.trim())) {
      setApiMessage("10 अंक का सही मोबाइल नंबर भरें।");
      return;
    }
    if (!registration.center) {
      setApiMessage("लॉगिन केंद्र नहीं मिला — कृषक पंजीकरण करने के लिए केंद्र आवश्यक है।");
      return;
    }
    try {
      setSavingStage("register");
      const response = await apiFetch(API_DRAGON_FRUIT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmer_name: registration.name.trim(),
          mobile: registration.mobile.trim(),
          center_name: registration.center,
        }),
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(getApiError(data, response));
      const newFormId = data.form_id || data.personal_details?.form_id;
      if (!newFormId) throw new Error("सर्वर से फॉर्म आईडी नहीं मिली।");
      setForm({
        ...createDragonForm(),
        name: registration.name.trim(),
        mobile: registration.mobile.trim(),
        center: registration.center,
        appno: newFormId,
      });
      setLandRows(createLandRows());
      setVoucherRows([["", "", "", "", "", ""]]);
      setFormId(newFormId);
      setSaveStates({});
      resetDocState();
      setActivePage("filling");
      setApiMessage(`पंजीकरण सफल। फॉर्म आईडी: ${newFormId}`);
      await loadRegistrations(registration.center);
    } catch (error) {
      setApiMessage(`पंजीकरण विफल: ${error.message || "अज्ञात त्रुटि"}`);
    } finally {
      setSavingStage("");
    }
  };

  const applyApiRecord = (record) => {
    const personal = record.personal_details || record;
    const documents = record.document_details || {};
    const id = record.form_id || personal.form_id || "";
    const farmerType = personal.farmer_type || "व्यक्तिगत कृषक";
    const bankType = personal.bank_account_type || "Savings";
    setForm({
      ...createDragonForm(),
      name: personal.farmer_name || "",
      father: personal.father_husband_name || "",
      gender: personal.gender || "पुरुष",
      mobile: personal.mobile || "",
      aadhaar: personal.aadhaar || "",
      udyan: personal.udyan_card_no || "",
      district: personal.district || "",
      block: personal.block || "",
      center: personal.center_name || personal.center || registration.center,
      village: personal.village || "",
      post: personal.post || "",
      appno: id,
      remarks: personal.remarks || "",
      beneficiary: farmerType.includes("समूह") ? "group" : "individual",
      bankHolder: personal.bank_holder_name || "",
      bankName: personal.bank_name || "",
      bankBranch: personal.bank_branch || "",
      bankAccount: personal.bank_account_number || "",
      bankIfsc: personal.bank_ifsc || "",
      bankType:
        bankType === "Current"
          ? "चालू खाता"
          : bankType === "Other"
            ? "अन्य"
            : "बचत खाता",
      workMode: personal.work_mode === "स्वयं" ? "self" : "firm",
      firmName: personal.firm_name || "",
      firmReg: personal.firm_registration_no || "",
      workRemark: personal.work_remark || "",
      declWater: documents.declaration_no_waterlogging || "",
      declIrrigation: documents.declaration_irrigation_available || "",
      declPrevious: documents.declaration_previous_benefit || "",
      declLand: documents.declaration_land_correct || "",
      declInspection: documents.declaration_inspection_consent || "",
      declShare: documents.declaration_farmer_share || "",
    });
    const land = personal.land_work_details || [];
    setLandRows(
      land.length
        ? land.map((row) => ({
            rel: row[0] || "",
            name: row[1] || "",
            father: row[2] || "",
            gender: row[3] || "पुरुष",
            village: row[4] || "",
            khata: row[5] || "",
            khasra: row[6] || "",
            area: row[7] || "",
          }))
        : createLandRows(),
    );
    const vouchers = documents.anudan_voucher || [];
    setVoucherRows(
      vouchers.length
        ? vouchers.map((row) => [...row])
        : [["", "", "", "", "", ""]],
    );
    setFormId(id);
    setDocFiles({});
    setDocRemoved({});
    setDocInputTick((tick) => tick + 1);
    syncDocUrls(record);
    setSaveStates({});
  };

  const openRegisteredForm = async (formIdToOpen) => {
    try {
      setSavingStage("loading");
      let records = registeredRows;
      if (!records.some((item) => recordFormId(item) === formIdToOpen)) {
        records = await fetchAllRegistrations();
        setRegisteredRows(records);
      }
      const record = records.find(
        (item) => recordFormId(item) === formIdToOpen,
      );
      if (!record) throw new Error(`फॉर्म ${formIdToOpen} सूची में नहीं मिला।`);
      applyApiRecord(record);
      setActivePage("filling");
      setApiMessage(`फॉर्म ${formIdToOpen} सर्वर से लोड हुआ।`);
      window.scrollTo(0, 0);
    } catch (error) {
      setApiMessage(
        `फॉर्म लोड नहीं हो सका: ${error.message || "अज्ञात त्रुटि"}`,
      );
    } finally {
      setSavingStage("");
    }
  };

  const saveSteps = (activeFormId = formId) => [
    {
      key: "personal",
      label: "आवेदक विवरण",
      payload: {
        form_id: activeFormId,
        farmer_name: form.name,
        father_husband_name: form.father,
        gender: form.gender,
        udyan_card_no: form.udyan,
        mobile: form.mobile,
        aadhaar: form.aadhaar,
        district: form.district,
        block: form.block,
        center: form.center,
        village: form.village,
        post: form.post,
        farmer_type: form.beneficiary === "group" ? "समूह" : "व्यक्तिगत कृषक",
        remarks: form.remarks,
      },
    },
    {
      key: "land",
      label: "भूमि एवं कार्य विवरण",
      payload: {
        form_id: activeFormId,
        land_work_details: landRows
          .filter(
            (row) =>
              row.rel ||
              row.name ||
              row.father ||
              row.village ||
              row.khata ||
              row.khasra ||
              row.area,
          )
          .map((row) => [
            row.rel,
            row.name,
            row.father,
            row.gender,
            row.village,
            row.khata,
            row.khasra,
            row.area,
          ]),
      },
    },
    {
      key: "bank",
      label: "बैंक विवरण",
      acceptsFiles: true,
      payload: {
        form_id: activeFormId,
        bank_holder_name: form.bankHolder,
        bank_name: form.bankName,
        bank_branch: form.bankBranch,
        bank_account_number: form.bankAccount,
        bank_ifsc: form.bankIfsc,
        bank_account_type:
          form.bankType === "चालू खाता"
            ? "Current"
            : form.bankType === "अन्य"
              ? "Other"
              : "Savings",
      },
    },
    {
      key: "work",
      label: "कार्य निष्पादन विवरण",
      payload: {
        form_id: activeFormId,
        work_mode: form.workMode === "self" ? "स्वयं" : "फर्म",
        firm_name: form.firmName,
        firm_registration_no: form.firmReg,
        work_remark: form.workRemark,
      },
    },
    {
      key: "documents",
      label: "दस्तावेज",
      acceptsFiles: true,
      payload: {
        form_id: activeFormId,
      },
    },
    {
      key: "declarations",
      label: "घोषणाएँ",
      payload: {
        form_id: activeFormId,
        declaration_no_waterlogging: form.declWater,
        declaration_irrigation_available: form.declIrrigation,
        declaration_previous_benefit: form.declPrevious,
        declaration_land_correct: form.declLand,
        declaration_inspection_consent: form.declInspection,
        declaration_farmer_share: form.declShare,
      },
    },
    {
      key: "vouchers",
      label: "अनुदान व्यय",
      payload: {
        form_id: activeFormId,
        anudan_voucher: voucherRows.filter((row) =>
          row.some((value) => String(value || "").trim() !== ""),
        ),
      },
    },
  ];

  const buildMultipartBody = (step) => {
    const formData = new FormData();
    Object.entries(step.payload).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      formData.append(
        key,
        typeof value === "object" ? JSON.stringify(value) : String(value),
      );
    });
    DOC_FIELDS.forEach((field) => {
      const file = docFiles[field.key];
      if (file) formData.append(field.key, file, file.name || field.label);
    });
    pendingDocKeys().forEach((key) => formData.append(key, ""));
    return formData;
  };

  const hasDocChanges = () =>
    DOC_FIELDS.some((field) => docFiles[field.key]) ||
    pendingDocKeys().length > 0;

  const putStage = async (step) => {
    const options = { method: "PUT" };
    if (step.acceptsFiles && hasDocChanges()) {
      options.body = buildMultipartBody(step);
    } else {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(step.payload);
    }
    const response = await apiFetch(API_DRAGON_FRUIT, options);
    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(getApiError(data, response));
    return data;
  };

  const refreshDocUrls = async (activeFormId) => {
    if (!activeFormId) return;
    try {
      const all = await fetchAllRegistrations();
      const records = all.filter((record) =>
        centerMatches(recordPersonal(record).center_name, registration.center),
      );
      setRegisteredRows(records);
      const record = records.find(
        (item) => recordFormId(item) === activeFormId,
      );
      if (record) syncDocUrls(record);
    } catch {
      setApiMessage("फाइलें सहेजी गईं, पर सूची ताज़ा नहीं हो सकी।");
    }
  };

  const saveOneStage = async (key) => {
    if (savingStage) return;
    const step = saveSteps().find((item) => item.key === key);
    if (!step) return;
    if (!formId) {
      const message =
        "पहले कृषक पंजीकरण करें या पंजीकृत फॉर्म खोलें — PUT के लिए फॉर्म आईडी आवश्यक है।";
      setSaveStates((previous) => ({
        ...previous,
        [key]: "फॉर्म आईडी नहीं है",
      }));
      setApiMessage(message);
      return;
    }
    setSavingStage(key);
    setSaveStates((previous) => ({ ...previous, [key]: "सहेजा जा रहा है…" }));
    try {
      const uploadedDocs = step.acceptsFiles && hasDocChanges();
      await putStage(step);
      setSaveStates((previous) => ({ ...previous, [key]: "सहेजा गया" }));
      setApiMessage(
        uploadedDocs
          ? `${step.label} सफलतापूर्वक सहेजा गया — फाइलें अपलोड हो गईं।`
          : `${step.label} सफलतापूर्वक सहेजा गया।`,
      );
      if (uploadedDocs) {
        resetDocState();
        await refreshDocUrls(formId);
      }
    } catch (error) {
      setSaveStates((previous) => ({
        ...previous,
        [key]: `विफल: ${error.message || "त्रुटि"}`,
      }));
      setApiMessage(
        `${step.label} सहेजा नहीं जा सका: ${error.message || "अज्ञात त्रुटि"}`,
      );
    } finally {
      setSavingStage("");
    }
  };

  const saveAllStages = async () => {
    if (!formId || savingStage) return;
    let completed = 0;
    setSavingStage("all");
    for (const step of saveSteps()) {
      setSaveStates((previous) => ({
        ...previous,
        [step.key]: "सहेजा जा रहा है…",
      }));
      try {
        const uploadedDocs = step.acceptsFiles && hasDocChanges();
        await putStage(step);
        completed += 1;
        setSaveStates((previous) => ({ ...previous, [step.key]: "सहेजा गया" }));
        if (uploadedDocs) {
          resetDocState();
          await refreshDocUrls(formId);
        }
      } catch (error) {
        setSaveStates((previous) => ({
          ...previous,
          [step.key]: `विफल: ${error.message || "त्रुटि"}`,
        }));
        setApiMessage(
          `${completed} / 7 चरण सहेजे गए। ${step.label}: ${error.message || "अज्ञात त्रुटि"}`,
        );
        setSavingStage("");
        return;
      }
    }
    setApiMessage("सभी 7 चरण सफलतापूर्वक सहेजे गए।");
    setSavingStage("");
  };

  const deleteRegisteredForm = async (formIdToDelete) => {
    if (!window.confirm(`फॉर्म ${formIdToDelete} को स्थायी रूप से हटाएँ?`))
      return;
    try {
      setSavingStage("delete");
      const response = await apiFetch(API_DRAGON_FRUIT, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_ids: [formIdToDelete] }),
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(getApiError(data, response));
      if (formId === formIdToDelete) {
        setFormId("");
        setForm(createDragonForm());
        setLandRows(createLandRows());
        setVoucherRows([["", "", "", "", "", ""]]);
        setActivePage("register");
        resetDocState();
      }
      setApiMessage(`फॉर्म ${formIdToDelete} हटा दिया गया।`);
      await loadRegistrations(registration.center);
    } catch (error) {
      setApiMessage(
        `फॉर्म हटाया नहीं जा सका: ${error.message || "अज्ञात त्रुटि"}`,
      );
    } finally {
      setSavingStage("");
    }
  };

  const startNewApplication = () => {
    setForm(createDragonForm());
    setLandRows(createLandRows());
    setVoucherRows([["", "", "", "", "", ""]]);
    setFormId("");
    setSaveStates({});
    resetDocState();
    setActivePage("register");
  };

  const goToFilling = () => {
    setSideOpen(false);
    setActivePage("filling");
    if (!formId)
      setApiMessage(
        "कोई फॉर्म चयनित नहीं — सहेजने के लिए पहले 'कृषक पंजीकरण' से पंजीकरण करें या कोई फॉर्म खोलें।",
      );
    window.scrollTo(0, 0);
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

  const anchorCls = (anchor) =>
    `step-anchor ${flashAnchor === anchor ? "step-flash" : ""}`;
  const saveStepControl = (key, label) => (
    <div className="save-step-control noprint">
      <button
        type="button"
        className="btn secondary"
        onClick={() => saveOneStage(key)}
        disabled={Boolean(savingStage)}
      >
        {savingStage === key
          ? `सहेजा जा रहा है: ${label}…`
          : `सहेजें — ${label}`}
      </button>
      {saveStates[key] && (
        <span className="save-step-status" role="status">
          {saveStates[key]}
        </span>
      )}
      <span className="save-step-hint">
        PUT · {formId || "फॉर्म आईडी आवश्यक"}
      </span>
    </div>
  );
  const pendingDocCount =
    DOC_FIELDS.filter((field) => docFiles[field.key]).length +
    pendingDocKeys().length;

  const docFieldInput = (field, inputId) => {
    const pending = docFiles[field.key];
    const savedUrl = docUrls[field.key];
    const markedForRemoval = Boolean(docRemoved[field.key]);
    return (
      <div className="field" key={field.key}>
        <label htmlFor={inputId}>{field.label}</label>
        <input
          id={inputId}
          key={`${field.key}-${docInputTick}`}
          type="file"
          accept="image/*,.pdf"
          disabled={Boolean(savingStage)}
          onChange={(event) => {
            handleDocFileChange(
              field.key,
              event.target.files && event.target.files[0],
            );
            event.target.value = "";
          }}
        />
        <div className="doc-field-state">
          {markedForRemoval ? (
            <span className="doc-pending">
              यह दस्तावेज सहेजते ही सर्वर से हट जाएगा।
            </span>
          ) : null}
          {!markedForRemoval && pending ? (
            <span className="doc-pending">नई फाइल चुनी गई: {pending.name}</span>
          ) : null}
          {!markedForRemoval && !pending && savedUrl ? (
            <span className="doc-saved">सर्वर पर सहेजी गई फाइल उपलब्ध है।</span>
          ) : null}
          {!markedForRemoval && !pending && !savedUrl ? (
            <span className="hint">JPG / PNG / PDF (अधिकतम 5 MB)</span>
          ) : null}
        </div>
        <div className="doc-field-actions">
          {savedUrl ? (
            <a
              className="btn gold"
              href={savedUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              👁 फाइल देखें
            </a>
          ) : null}
          {pending || savedUrl || markedForRemoval ? (
            <button
              type="button"
              className="btn danger"
              onClick={() => clearDocField(field.key)}
              disabled={Boolean(savingStage)}
            >
              हटाएँ
            </button>
          ) : null}
        </div>
      </div>
    );
  };

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
  const subCost = (totalCost * pct) / 100;
  const farmerCost = totalCost - subCost;
  const coOwners = landRows.filter((r) => r.rel && r.rel !== "स्वयं" && r.name);
  const coMode = coOwners.length > 0;

  return (
    <div
      className="drag-fruits-root"
      style={{
        "--app-header-h": `${headerH}px`,
        "--app-footer-h": `${footerH}px`,
      }}
    >
      <button
        type="button"
        aria-label="पैनल बंद करें"
        className={`side-backdrop ${sideOpen ? "open" : ""}`}
        onClick={() => setSideOpen(false)}
      />

      <div className="drag-content">
        <header className="top noprint">
          <div className="top-inner">
            <div className="brand">
              <span className="brand-badge"></span>
              <h1>कृषक आवेदन एवं स्वचालित परियोजना मानक प्रणाली</h1>
            </div>
            <p className="top-sub">
              ड्रैगन फ्रूट (कमलम) — आवेदन के क्षेत्रफल के अनुसार कार्य, मात्रा,
              Specification, Component लागत, परियोजना लागत, कृषक अंश एवं अनुदान
            </p>
            <div className="top-tags">
              <span>🟢 स्वचालित मानक</span>
              <span>🟡 चरणबद्ध अनुदान</span>
              <span>🔵 प्रिंट-रेडी</span>
            </div>
          </div>
        </header>

        <main className="wrap">
          <div className="card noprint">
            <div className="tabs">
              <button
                type="button"
                className={`tab ${activePage === "register" ? "active" : ""}`}
                onClick={() => {
                  setSideOpen(false);
                  setActivePage("register");
                }}
              >
                ड्रैगन फ्रूट कृषक पंजीकरण
              </button>
              <button
                type="button"
                className={`tab ${activePage === "filling" ? "active" : ""}`}
                onClick={goToFilling}
              >
                प्रपत्र भरना {formId ? `· ${formId}` : ""}
              </button>
            </div>
            {activePage === "filling" && (
              <div className="note">
                <b>महत्वपूर्ण:</b> किसान के अंतिम मानक पत्र में प्रति इकाई Rate
                नहीं दिखाया जाएगा। Master Standard के आधार पर अंदर से गणना होगी
                और किसान को Component-wise कुल लागत दिखाई जाएगी।
              </div>
            )}
          </div>

          {apiMessage && (
            <div
              className={`api-message ${apiMessage.includes("विफल") || apiMessage.includes("नहीं") ? "error" : "success"}`}
              role="status"
            >
              {apiMessage}
            </div>
          )}

          {activePage === "register" ? (
            <section className="card noprint registration-screen">
              <h2>ड्रैगन फ्रूट कृषक पंजीकरण</h2>
              <p className="card-intro">
                पहले किसान का पंजीकरण करें। सर्वर से मिली फॉर्म आईडी पर आवेदन के
                बाकी चरण सहेजें।
              </p>
              <form className="grid" onSubmit={registerFarmer}>
                <div className="field">
                  <label htmlFor="reg-farmer-name">
                    कृषक का नाम<span className="req">*</span>
                  </label>
                  <input
                    id="reg-farmer-name"
                    value={registration.name}
                    onChange={(event) =>
                      setRegistration({
                        ...registration,
                        name: event.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="reg-farmer-mobile">
                    मोबाइल नंबर<span className="req">*</span>
                  </label>
                  <input
                    id="reg-farmer-mobile"
                    inputMode="numeric"
                    maxLength={10}
                    value={registration.mobile}
                    onChange={(event) =>
                      setRegistration({
                        ...registration,
                        mobile: event.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="reg-farmer-center">
                    केंद्र<span className="req">*</span>
                  </label>
                  <select
                    id="reg-farmer-center"
                    value={registration.center}
                    disabled={Boolean(authCenter)}
                    onChange={(event) =>
                      setRegistration({
                        ...registration,
                        center: event.target.value,
                      })
                    }
                  >
                    {!authCenter && <option value="">केंद्र चुनें</option>}
                    {CENTERS.map((center) => (
                      <option key={center} value={center}>
                        {center}
                      </option>
                    ))}
                    {authCenter && !CENTERS.includes(authCenter) && (
                      <option value={authCenter}>{authCenter}</option>
                    )}
                  </select>
                  {authCenter && (
                    <span className="small">लॉगिन केंद्र — बदला नहीं जा सकता</span>
                  )}
                </div>
                <div className="field">
                  <button
                    className="btn"
                    type="submit"
                    disabled={Boolean(savingStage)}
                  >
                    {savingStage === "register"
                      ? "पंजीकरण हो रहा है…"
                      : "पंजीकरण करें"}
                  </button>
                </div>
              </form>
              <div className="registration-list-head">
                <div>
                  <h3>पंजीकृत किसान</h3>
                  <span className="small">
                    केंद्र: {registration.center}
                    {registeredRows.length
                      ? ` · ${registeredRows.length} फॉर्म`
                      : ""}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => loadRegistrations(registration.center)}
                  disabled={Boolean(savingStage) || registrationsLoading}
                >
                  {registrationsLoading ? "लोड हो रहा है…" : "सूची ताज़ा करें"}
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>क्र०</th>
                      <th>फॉर्म आईडी</th>
                      <th>कृषक का नाम</th>
                      <th>मोबाइल</th>
                      <th>केंद्र</th>
                      <th>भूमि (हे०)</th>
                      <th>स्थिति</th>
                      <th>क्रिया</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredRows.length ? (
                      registeredRows.map((record, index) => {
                        const personal = recordPersonal(record);
                        const id = recordFormId(record);
                        const landArea = (
                          personal.land_work_details || []
                        ).reduce(
                          (sum, row) =>
                            sum + num(Array.isArray(row) ? row[7] : row?.area),
                          0,
                        );
                        const filled = Boolean(
                          normalizeText(personal.bank_account_number) ||
                          normalizeText(personal.bank_ifsc) ||
                          normalizeText(personal.father_husband_name) ||
                          normalizeText(personal.district) ||
                          normalizeText(personal.block) ||
                          (personal.land_work_details || []).length ||
                          (record?.document_details?.anudan_voucher || [])
                            .length,
                        );
                        return (
                          <tr
                            key={id || index}
                            className={id && id === formId ? "sel" : ""}
                          >
                            <td className="qty">{index + 1}</td>
                            <td>
                              <b>{id || "—"}</b>
                            </td>
                            <td>{personal.farmer_name || "—"}</td>
                            <td>{personal.mobile || "—"}</td>
                            <td>
                              {personal.center_name || personal.center || "—"}
                            </td>
                            <td className="qty">
                              {landArea > 0 ? landArea.toFixed(2) : "—"}
                            </td>
                            <td>
                              <span
                                className={`reg-status ${filled ? "ok" : "wait"}`}
                              >
                                {filled ? "भरा गया" : "पंजीकृत (रिक्त)"}
                              </span>
                            </td>
                            <td>
                              <div className="registration-actions">
                                <button
                                  type="button"
                                  className="btn secondary"
                                  onClick={() => openRegisteredForm(id)}
                                  disabled={Boolean(savingStage)}
                                >
                                  फॉर्म खोलें / संपादित करें
                                </button>
                                <button
                                  type="button"
                                  className="btn danger"
                                  onClick={() => deleteRegisteredForm(id)}
                                  disabled={Boolean(savingStage)}
                                >
                                  हटाएँ
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8">
                          {registrationsLoading
                            ? "लोड हो रहा है…"
                            : "इस केंद्र के लिए कोई पंजीकरण नहीं मिला।"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <>
              <div className="card noprint">
                <div className="note">
                  <b>चयनित फॉर्म:</b> {formId} · सभी चरण इसी फॉर्म आईडी के साथ
                  सर्वर पर सहेजें।
                </div>
              </div>

              {/* Workflow Card */}
              <div className="workflow-card noprint">
                <div className="workflow-head">
                  <div>
                    <div className="workflow-title">
                      🧭 आवेदन से अनुदान तक — Step-by-Step
                    </div>
                    <div className="workflow-sub">
                      चरण {workflowStep + 1}: {APP_STEPS[workflowStep].title} —{" "}
                      {APP_STEPS[workflowStep].sub}
                    </div>
                  </div>
                  <div className="workflow-count">
                    {workflowStep + 1} / {APP_STEPS.length}
                  </div>
                </div>
                <div className="workflow-progress">
                  <span
                    style={{
                      width: `${((workflowStep + 1) / APP_STEPS.length) * 100}%`,
                    }}
                  />
                </div>
                <div className="workflow-steps">
                  {APP_STEPS.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`workflow-step ${i === workflowStep ? "active" : ""} ${i < workflowStep ? "done" : ""}`}
                      onClick={() => goToStep(i)}
                    >
                      {i + 1}. {s.title}
                    </button>
                  ))}
                </div>
                <div className="workflow-actions">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => goToStep(Math.max(0, workflowStep - 1))}
                  >
                    ← पिछला
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      goToStep(Math.min(APP_STEPS.length - 1, workflowStep + 1))
                    }
                  >
                    {workflowStep === APP_STEPS.length - 1
                      ? "✓ अंतिम समीक्षा"
                      : "अगला चरण →"}
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={startNewApplication}
                  >
                    🆕 नया आवेदन
                  </button>
                  <button
                    type="button"
                    className="btn gold"
                    onClick={() => goToStep(6)}
                  >
                    💰 अनुदान पर जाएँ
                  </button>
                </div>
              </div>

              <section className="card noprint api-save-panel">
                <div className="registration-list-head">
                  <div>
                    <h3>सर्वर पर सहेजें</h3>
                    <span className="small">फॉर्म आईडी: {formId}</span>
                  </div>
                  <button
                    type="button"
                    className="btn"
                    onClick={saveAllStages}
                    disabled={Boolean(savingStage)}
                  >
                    {savingStage === "all"
                      ? "सभी चरण सहेजे जा रहे हैं…"
                      : "सभी 7 चरण सहेजें"}
                  </button>
                </div>
                <div className="save-stage-list">
                  {[
                    ["personal", "आवेदक विवरण"],
                    ["land", "भूमि विवरण"],
                    ["bank", "बैंक विवरण"],
                    ["work", "कार्य निष्पादन"],
                    ["documents", "दस्तावेज"],
                    ["declarations", "घोषणाएँ"],
                    ["vouchers", "अनुदान व्यय"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className="btn secondary"
                      onClick={() => saveOneStage(key)}
                      disabled={Boolean(savingStage)}
                    >
                      {label}
                      {saveStates[key] ? ` · ${saveStates[key]}` : " · सहेजें"}
                    </button>
                  ))}
                </div>
              </section>

              {/* Application Form Section */}
              <section
                className={`card noprint ${anchorCls("wf-basic")}`}
                id={`${ID_PREFIX}wf-basic`}
              >
                <h2>
                  <span className="idx">1</span> कृषक का आवेदन
                </h2>
                <p className="card-intro">
                  किसान अपने वास्तविक प्रस्तावित क्षेत्रफल के अनुसार आवेदन भरे।
                  इसी क्षेत्रफल से नीचे पूरा व्यक्तिगत परियोजना मानक स्वतः
                  बनेगा।
                </p>

                <div className="grid">
                  <div className="field">
                    <label htmlFor="f-name">
                      कृषक का नाम<span className="req">*</span>
                    </label>
                    <input
                      id="f-name"
                      placeholder="पूरा नाम"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-father">
                      पिता / पति का नाम<span className="req">*</span>
                    </label>
                    <input
                      id="f-father"
                      placeholder="पिता / पति का नाम"
                      value={form.father}
                      onChange={(e) =>
                        setForm({ ...form, father: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-gender">लिंग</label>
                    <select
                      id="f-gender"
                      value={form.gender}
                      onChange={(e) =>
                        setForm({ ...form, gender: e.target.value })
                      }
                    >
                      <option>पुरुष</option>
                      <option>महिला</option>
                      <option>अन्य</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="f-hortcard">उद्यान कार्ड संख्या</label>
                    <input
                      id="f-hortcard"
                      inputMode="numeric"
                      placeholder="वैकल्पिक"
                      value={form.udyan}
                      onChange={(e) =>
                        setForm({ ...form, udyan: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-mobile">
                      मोबाइल नम्बर<span className="req">*</span>
                    </label>
                    <input
                      id="f-mobile"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10 अंक"
                      value={form.mobile}
                      onChange={(e) =>
                        setForm({ ...form, mobile: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-aadhaar">आधार संख्या</label>
                    <input
                      id="f-aadhaar"
                      inputMode="numeric"
                      maxLength={12}
                      placeholder="XXXX XXXX 1234"
                      value={form.aadhaar}
                      onChange={(e) =>
                        setForm({ ...form, aadhaar: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-district">
                      जनपद<span className="req">*</span>
                    </label>
                    <input
                      id="f-district"
                      placeholder="जनपद का नाम"
                      value={form.district}
                      onChange={(e) =>
                        setForm({ ...form, district: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-block">
                      विकासखण्ड<span className="req">*</span>
                    </label>
                    <input
                      id="f-block"
                      placeholder="विकासखण्ड का नाम"
                      value={form.block}
                      onChange={(e) =>
                        setForm({ ...form, block: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-center">
                      उद्यान सचल दल केंद्र<span className="req">*</span>
                    </label>
                    <select
                      id="f-center"
                      value={form.center}
                      onChange={(e) =>
                        setForm({ ...form, center: e.target.value })
                      }
                    >
                      <option value="">-- केंद्र चुनें --</option>
                      {CENTERS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="f-village">
                      ग्राम<span className="req">*</span>
                    </label>
                    <input
                      id="f-village"
                      placeholder="ग्राम का नाम"
                      value={form.village}
                      onChange={(e) =>
                        setForm({ ...form, village: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-post">पोस्ट</label>
                    <input
                      id="f-post"
                      placeholder="पोस्ट ऑफिस"
                      value={form.post}
                      onChange={(e) =>
                        setForm({ ...form, post: e.target.value })
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="f-beneficiary">लाभार्थी का प्रकार</label>
                    <select
                      id="f-beneficiary"
                      value={form.beneficiary}
                      onChange={(e) =>
                        setForm({ ...form, beneficiary: e.target.value })
                      }
                    >
                      <option value="individual">व्यक्तिगत कृषक</option>
                      <option value="group">समूह</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="f-appno">आवेदन संख्या</label>
                    <input
                      id="f-appno"
                      readOnly
                      placeholder="स्वतः जारी"
                      value={form.appno}
                      onChange={(e) =>
                        setForm({ ...form, appno: e.target.value })
                      }
                    />
                    <span className="hint">
                      Draft सुरक्षित करने पर स्वतः बनेगी।
                    </span>
                  </div>
                  <div className="field full">
                    <label htmlFor="f-remark">
                      भूमि / परियोजना संबंधी टिप्पणी
                    </label>
                    <textarea
                      id="f-remark"
                      placeholder="यदि कोई विशेष बात हो तो यहाँ लिखें"
                      value={form.remarks}
                      onChange={(e) =>
                        setForm({ ...form, remarks: e.target.value })
                      }
                    />
                  </div>
                </div>
                {saveStepControl("personal", "आवेदक विवरण")}

                {/* Land Table */}
                <div
                  className={`inner-card ${anchorCls("wf-land")}`}
                  id={`${ID_PREFIX}wf-land`}
                >
                  <h3>भूमि एवं कार्य का विवरण</h3>
                  <p className="card-intro">
                    <b>स्वयं</b> वाली पहली पंक्ति किसान की ऊपर भरी गई जानकारी से
                    स्वतः भरेगी। यदि प्रस्तावित भूमि में सहखातेदार / अन्य
                    खातेदार की भूमि शामिल है तो नीचे की पंक्ति में संबंध चुनकर
                    उसका विवरण एवं क्षेत्रफल भरें।
                  </p>
                  <div className="table-wrap">
                    <table className="land-table">
                      <thead>
                        <tr>
                          <th>क्र.</th>
                          <th>भूमि किसकी / विवरण</th>
                          <th>नाम (खतौनी के अनुसार)</th>
                          <th>पिता का नाम</th>
                          <th>ग्राम</th>
                          <th>खाता सं०</th>
                          <th>खसरा / खतौनी सं०</th>
                          <th>प्रस्तावित भूमि (हे०)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {landRows.map((r, i) => (
                          <tr key={i}>
                            <td className="qty" data-label="क्रमांक">
                              {i + 1}
                            </td>
                            <td data-label="भूमि किसकी">
                              <select
                                value={r.rel}
                                disabled={i === 0}
                                onChange={(e) =>
                                  handleLandChange(i, "rel", e.target.value)
                                }
                              >
                                {i === 0 ? (
                                  <option value="स्वयं">स्वयं</option>
                                ) : (
                                  <>
                                    <option value="">— चयन करें —</option>
                                    {RELATIONS.map((rel) => (
                                      <option key={rel} value={rel}>
                                        {rel}
                                      </option>
                                    ))}
                                  </>
                                )}
                              </select>
                            </td>
                            <td data-label="नाम (खतौनी)">
                              <input
                                placeholder="नाम"
                                value={r.name}
                                readOnly={i === 0}
                                disabled={i !== 0 && !r.rel}
                                onChange={(e) =>
                                  handleLandChange(i, "name", e.target.value)
                                }
                              />
                              {i !== 0 && (
                                <select
                                  className="land-gender-select"
                                  aria-label={`लिंग — भूमि पंक्ति ${i + 1}`}
                                  value={r.gender || "पुरुष"}
                                  disabled={!r.rel}
                                  onChange={(e) =>
                                    handleLandChange(i, "gender", e.target.value)
                                  }
                                >
                                  <option value="पुरुष">पुरुष</option>
                                  <option value="महिला">महिला</option>
                                  <option value="अन्य">अन्य</option>
                                </select>
                              )}
                            </td>
                            <td data-label="पिता का नाम">
                              <input
                                placeholder="पिता का नाम"
                                value={r.father}
                                readOnly={i === 0}
                                disabled={i !== 0 && !r.rel}
                                onChange={(e) =>
                                  handleLandChange(i, "father", e.target.value)
                                }
                              />
                            </td>
                            <td data-label="ग्राम">
                              <input
                                placeholder="ग्राम"
                                value={r.village}
                                readOnly={i === 0}
                                disabled={i !== 0 && !r.rel}
                                onChange={(e) =>
                                  handleLandChange(i, "village", e.target.value)
                                }
                              />
                            </td>
                            <td data-label="खाता सं०">
                              <input
                                placeholder="खाता सं०"
                                value={r.khata}
                                disabled={i !== 0 && !r.rel}
                                onChange={(e) =>
                                  handleLandChange(i, "khata", e.target.value)
                                }
                              />
                            </td>
                            <td data-label="खसरा / खतौनी">
                              <input
                                placeholder="खसरा / खतौनी"
                                value={r.khasra}
                                disabled={i !== 0 && !r.rel}
                                onChange={(e) =>
                                  handleLandChange(i, "khasra", e.target.value)
                                }
                              />
                            </td>
                            <td data-label="क्षेत्रफल (हे०)">
                              <input
                                className="land-area"
                                type="number"
                                min="0"
                                step="0.0001"
                                placeholder="हे०"
                                value={r.area}
                                disabled={i !== 0 && !r.rel}
                                onChange={(e) =>
                                  handleLandChange(i, "area", e.target.value)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="summary" style={{ marginBottom: 0 }}>
                    <div className="metric">
                      <span>प्रस्तावित क्षेत्रफल (नाली)</span>
                      <b>{derivedNali().toFixed(2)} नाली</b>
                    </div>
                    <div className="metric">
                      <span>कुल भूमि क्षेत्रफल</span>
                      <b>{landTotalHa().toFixed(2)} हे०</b>
                    </div>
                    <div className="metric">
                      <span>क्षेत्रफल (हेक्टेयर)</span>
                      <b>{hectare().toFixed(2)} हे०</b>
                    </div>
                    <div className="metric">
                      <span>स्थिति</span>
                      <b>{landTotalHa() > 0 ? "✓ पूर्ण" : "✕ अपूर्ण"}</b>
                    </div>
                  </div>
                  <div className="err" />
                </div>
                {saveStepControl("land", "भूमि विवरण")}

                {/* Bank Details */}
                <div
                  className={`inner-card ${anchorCls("wf-bank")}`}
                  id={`${ID_PREFIX}wf-bank`}
                >
                  <h3>बैंक खाता विवरण</h3>
                  <p className="card-intro">
                    अनुदान / राजसहायता भुगतान हेतु किसान के बैंक खाते की जानकारी
                    भरें।
                  </p>
                  <div className="grid">
                    <div className="field">
                      <label htmlFor="b-holder">
                        खाता धारक का नाम<span className="req">*</span>
                      </label>
                      <input
                        id="b-holder"
                        placeholder="बैंक पासबुक के अनुसार"
                        value={form.bankHolder}
                        onChange={(e) =>
                          setForm({ ...form, bankHolder: e.target.value })
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="b-bank">
                        बैंक का नाम<span className="req">*</span>
                      </label>
                      <input
                        id="b-bank"
                        placeholder="बैंक का नाम"
                        value={form.bankName}
                        onChange={(e) =>
                          setForm({ ...form, bankName: e.target.value })
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="b-branch">
                        शाखा का नाम<span className="req">*</span>
                      </label>
                      <input
                        id="b-branch"
                        placeholder="शाखा"
                        value={form.bankBranch}
                        onChange={(e) =>
                          setForm({ ...form, bankBranch: e.target.value })
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="b-acct">
                        बैंक खाता संख्या<span className="req">*</span>
                      </label>
                      <input
                        id="b-acct"
                        inputMode="numeric"
                        placeholder="खाता संख्या"
                        value={form.bankAccount}
                        onChange={(e) =>
                          setForm({ ...form, bankAccount: e.target.value })
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="b-ifsc">
                        IFSC Code<span className="req">*</span>
                      </label>
                      <input
                        id="b-ifsc"
                        maxLength={11}
                        className="ifsc-input"
                        placeholder="ABCD0123456"
                        value={form.bankIfsc}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            bankIfsc: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="b-type">खाता प्रकार</label>
                      <select
                        id="b-type"
                        value={form.bankType}
                        onChange={(e) =>
                          setForm({ ...form, bankType: e.target.value })
                        }
                      >
                        <option>बचत खाता</option>
                        <option>चालू खाता</option>
                        <option>अन्य</option>
                      </select>
                    </div>
                    <div className="field full">
                      {docFieldInput(DOC_FIELDS[6], "b-doc")}
                    </div>
                  </div>
                </div>
                {saveStepControl("bank", "बैंक विवरण")}

                {/* Work Execution */}
                <div className="inner-card">
                  <h3>कार्य निष्पादन का विकल्प</h3>
                  <div className="grid">
                    <div className="field">
                      <label htmlFor="w-mode">
                        कार्य किसके द्वारा कराया जाएगा
                        <span className="req">*</span>
                      </label>
                      <select
                        id="w-mode"
                        value={form.workMode}
                        onChange={(e) =>
                          setForm({ ...form, workMode: e.target.value })
                        }
                      >
                        <option value="firm">
                          विभागीय पंजीकृत / Empanelled Firm
                        </option>
                        <option value="self">कृषक द्वारा स्वयं</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="w-firm">Firm का नाम</label>
                      <input
                        id="w-firm"
                        placeholder="यदि लागू हो"
                        value={form.firmName}
                        onChange={(e) =>
                          setForm({ ...form, firmName: e.target.value })
                        }
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="w-reg">Firm Registration No.</label>
                      <input
                        id="w-reg"
                        placeholder="यदि लागू हो"
                        value={form.firmReg}
                        onChange={(e) =>
                          setForm({ ...form, firmReg: e.target.value })
                        }
                      />
                    </div>
                    <div className="field full">
                      <label htmlFor="w-remark">
                        कार्य / भुगतान से संबंधित टिप्पणी
                      </label>
                      <textarea
                        id="w-remark"
                        placeholder="विशेष निर्देश यदि कोई हों"
                        value={form.workRemark}
                        onChange={(e) =>
                          setForm({ ...form, workRemark: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
                {saveStepControl("work", "कार्य निष्पादन")}

                {/* Documents */}
                <div
                  className={`inner-card ${anchorCls("wf-docs")}`}
                  id={`${ID_PREFIX}wf-docs`}
                >
                  <h3>आवश्यक दस्तावेज</h3>
                  <p className="card-intro">
                    प्रत्येक दस्तावेज की फाइल चुनें — चुनी गई फाइल का नाम यहाँ
                    दिखेगा। "सहेजें — दस्तावेज" दबाते ही फाइल PUT (multipart)
                    अपलोड होगी और सर्वर से लौटे URL पर "फाइल देखें" बटन मिलेगा।
                  </p>
                  <div className="grid">
                    {DOC_FIELDS.slice(0, 6).map((field) =>
                      docFieldInput(field, `d-${field.key}`),
                    )}
                  </div>
                  <div className="doc-summary">
                    चयनित नई फाइलें:{" "}
                    <b>
                      {
                        DOC_FIELDS.filter((field) => docFiles[field.key])
                          .length
                      }
                    </b>{" "}
                    · हटाने हेतु चिन्हित: <b>{pendingDocKeys().length}</b> ·
                    सर्वर पर सहेजी गई:{" "}
                    <b>
                      {
                        DOC_FIELDS.filter((field) => docUrls[field.key])
                          .length
                      }{" "}
                      / {DOC_FIELDS.length}
                    </b>
                    {pendingDocCount ? (
                      <span className="doc-summary-warn">
                        {" "}
                        — सहेजें बटन दबाने के बाद ही सर्वर पर अपलोड/हटाने की
                        क्रिया होगी।
                      </span>
                    ) : null}
                  </div>
                </div>
                {saveStepControl("documents", "दस्तावेज")}

                {/* Declaration */}
                <div
                  className={`inner-card ${anchorCls("wf-standard")}`}
                  id={`${ID_PREFIX}wf-standard`}
                >
                  <h3>पात्रता एवं किसान घोषणा</h3>
                  <p className="card-intro">
                    आवेदन स्वीकृति हेतु निम्न सभी बिंदुओं का सही उत्तर दें।
                  </p>
                  <div className="grid">
                    <div className="field">
                      <label>
                        भूमि में जलभराव नहीं है<span className="req">*</span>
                      </label>
                      <select
                        value={form.declWater}
                        onChange={(e) =>
                          setForm({ ...form, declWater: e.target.value })
                        }
                      >
                        <option value="">-- चुनें --</option>
                        <option value="हाँ">हाँ</option>
                        <option value="नहीं">नहीं</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>
                        सिंचाई सुविधा उपलब्ध है<span className="req">*</span>
                      </label>
                      <select
                        value={form.declIrrigation}
                        onChange={(e) =>
                          setForm({ ...form, declIrrigation: e.target.value })
                        }
                      >
                        <option value="">-- चुनें --</option>
                        <option value="हाँ">हाँ</option>
                        <option value="नहीं">नहीं</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>
                        पूर्व में इसी योजना का लाभ लिया है?
                        <span className="req">*</span>
                      </label>
                      <select
                        value={form.declPrevious}
                        onChange={(e) =>
                          setForm({ ...form, declPrevious: e.target.value })
                        }
                      >
                        <option value="">-- चुनें --</option>
                        <option value="हाँ">हाँ</option>
                        <option value="नहीं">नहीं</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>
                        भूमि / अभिलेख सही हैं<span className="req">*</span>
                      </label>
                      <select
                        value={form.declLand}
                        onChange={(e) =>
                          setForm({ ...form, declLand: e.target.value })
                        }
                      >
                        <option value="">-- चुनें --</option>
                        <option value="हाँ">हाँ</option>
                        <option value="नहीं">नहीं</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>
                        स्थलीय निरीक्षण हेतु सहमति<span className="req">*</span>
                      </label>
                      <select
                        value={form.declInspection}
                        onChange={(e) =>
                          setForm({ ...form, declInspection: e.target.value })
                        }
                      >
                        <option value="">-- चुनें --</option>
                        <option value="हाँ">हाँ</option>
                        <option value="नहीं">नहीं</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>
                        कृषक अंश वहन करने की सहमति<span className="req">*</span>
                      </label>
                      <select
                        value={form.declShare}
                        onChange={(e) =>
                          setForm({ ...form, declShare: e.target.value })
                        }
                      >
                        <option value="">-- चुनें --</option>
                        <option value="हाँ">हाँ</option>
                        <option value="नहीं">नहीं</option>
                      </select>
                    </div>
                  </div>
                </div>
                {saveStepControl("declarations", "घोषणाएँ")}

                <div className="inner-card">
                  <h3>अनुदान बिल / वाउचर</h3>
                  <p className="card-intro">
                    हर पंक्ति सर्वर पर चरण, घटक, बिल संख्या, राशि और भुगतान पाने
                    वाले के क्रम में सहेजी जाएगी।
                  </p>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>चरण</th>
                          <th>कार्य / घटक</th>
                          <th>बिल संख्या</th>
                          <th>राशि</th>
                          <th>भुगतान किसे</th>
                          <th>फर्म / कृषक का नाम</th>
                          <th>क्रिया</th>
                        </tr>
                      </thead>
                      <tbody>
                        {voucherRows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((value, columnIndex) => (
                              <td key={columnIndex}>
                                <input
                                  aria-label={
                                    [
                                      "चरण",
                                      "कार्य / घटक",
                                      "बिल संख्या",
                                      "राशि",
                                      "भुगतान किसे",
                                      "फर्म / कृषक का नाम",
                                    ][columnIndex]
                                  }
                                  value={value}
                                  onChange={(event) =>
                                    handleVoucherChange(
                                      rowIndex,
                                      columnIndex,
                                      event.target.value,
                                    )
                                  }
                                />
                              </td>
                            ))}
                            <td>
                              <button
                                type="button"
                                className="btn danger"
                                onClick={() =>
                                  setVoucherRows((previous) =>
                                    previous.length > 1
                                      ? previous.filter(
                                          (_, index) => index !== rowIndex,
                                        )
                                      : [["", "", "", "", "", ""]],
                                  )
                                }
                              >
                                हटाएँ
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() =>
                      setVoucherRows((previous) => [
                        ...previous,
                        ["", "", "", "", "", ""],
                      ])
                    }
                  >
                    + वाउचर जोड़ें
                  </button>
                </div>
                {saveStepControl("vouchers", "अनुदान व्यय")}

                {/* Process */}
                <div
                  className={`inner-card ${anchorCls("wf-affidavit")}`}
                  id={`${ID_PREFIX}wf-affidavit`}
                >
                  <h3>निरीक्षण एवं अनुदान प्रक्रिया</h3>
                  <div className="stage-grid">
                    <div className="stage">
                      <b>चरण 1 — Infrastructure Verification</b>
                      <span className="small">
                        निर्धारित infrastructure पूर्ण होने पर स्थलीय / संयुक्त
                        निरीक्षण एवं सत्यापन।
                      </span>
                    </div>
                    <div className="stage">
                      <b>चरण 2 — 90% पौध जीवितता</b>
                      <span className="small">
                        द्वितीय निरीक्षण में पौधों की कम से कम 90% जीवितता का
                        सत्यापन।
                      </span>
                    </div>
                    <div className="stage">
                      <b>चरण 3 — उत्पादन / फल सत्यापन</b>
                      <span className="small">
                        तृतीय निरीक्षण में लागू योजना के अनुसार फल / गुणवत्ता /
                        मात्रा का सत्यापन।
                      </span>
                    </div>
                  </div>
                  <p
                    className="card-intro"
                    style={{ marginTop: "9px", marginBottom: 0 }}
                  >
                    <b>पौध अनुदान:</b> लागू योजना / स्वीकृति के अनुसार चरणबद्ध
                    भुगतान (70% + 20% + 10%)।
                  </p>
                </div>

                <div className="err" />
                <div
                  className={`btns ${anchorCls("wf-grant")}`}
                  id={`${ID_PREFIX}wf-grant`}
                >
                  <button
                    type="button"
                    className="btn"
                    onClick={handleGenerate}
                  >
                    ✓ आवेदन से किसान-विशिष्ट मानक बनाएं
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={saveDraft}
                  >
                    💾 Draft सुरक्षित करें
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={loadDraft}
                  >
                    ↶ Draft लोड करें
                  </button>
                  <button
                    type="button"
                    className="btn gold"
                    onClick={() => handlePrint("app")}
                  >
                    🖨️ आवेदन पत्र Print
                  </button>
                  <button
                    type="button"
                    className="btn gold"
                    onClick={() => handlePrint("project")}
                  >
                    🖨️ पूर्ण परियोजना मानक Print
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleBuildAffidavit}
                  >
                    📜 शपथ-पत्र तैयार करें
                  </button>
                  <button
                    type="button"
                    className="btn gold"
                    onClick={() => handlePrint("affidavit")}
                  >
                    🖨️ शपथ-पत्र Print
                  </button>
                  <button
                    type="button"
                    className="btn gold"
                    onClick={() => handlePrint("consent")}
                  >
                    🖨️ सहमति / NOC Print
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => handlePrint("all")}
                  >
                    📑 सभी शपथ-पत्र / सहमति Print
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleBuildAnudan}
                  >
                    💰 अनुदान देयक तैयार करें
                  </button>
                  <button
                    type="button"
                    className="btn gold"
                    onClick={() => handlePrint("anudan")}
                  >
                    🖨️ अनुदान देयक Print
                  </button>
                </div>

                <div
                  className={`print-select ${anchorCls("wf-review")}`}
                  id={`${ID_PREFIX}wf-review`}
                >
                  <h3>🖨️ चयनित दस्तावेज एक साथ Print करें</h3>
                  <div className="small">
                    आवेदन पत्र में संलग्न दस्तावेज सूची + घोषणा तथा प्रभारी की
                    आख्या स्वतः शामिल हैं।
                  </div>
                  <div className="print-options">
                    <label className="print-option">
                      <input
                        type="checkbox"
                        checked={printCheckboxes.app}
                        onChange={(e) =>
                          setPrintCheckboxes({
                            ...printCheckboxes,
                            app: e.target.checked,
                          })
                        }
                      />{" "}
                      <span>आवेदन पत्र</span>
                    </label>
                    <label className="print-option">
                      <input
                        type="checkbox"
                        checked={printCheckboxes.project}
                        onChange={(e) =>
                          setPrintCheckboxes({
                            ...printCheckboxes,
                            project: e.target.checked,
                          })
                        }
                      />{" "}
                      <span>पूर्ण परियोजना मानक</span>
                    </label>
                    <label className="print-option">
                      <input
                        type="checkbox"
                        checked={printCheckboxes.aff}
                        onChange={(e) =>
                          setPrintCheckboxes({
                            ...printCheckboxes,
                            aff: e.target.checked,
                          })
                        }
                      />{" "}
                      <span>मुख्य शपथ-पत्र / स्व-घोषणा</span>
                    </label>
                    <label className="print-option">
                      <input
                        type="checkbox"
                        checked={printCheckboxes.consent}
                        onChange={(e) =>
                          setPrintCheckboxes({
                            ...printCheckboxes,
                            consent: e.target.checked,
                          })
                        }
                      />{" "}
                      <span>सह-खातेदार सहमति / NOC</span>
                    </label>
                    <label className="print-option">
                      <input
                        type="checkbox"
                        checked={printCheckboxes.anudan}
                        onChange={(e) =>
                          setPrintCheckboxes({
                            ...printCheckboxes,
                            anudan: e.target.checked,
                          })
                        }
                      />{" "}
                      <span>अनुदान देयक / भुगतान प्रपत्र</span>
                    </label>
                  </div>
                  <div className="aff-actions">
                    <button
                      type="button"
                      className="btn"
                      onClick={() => handlePrint("selected")}
                    >
                      🖨️ चयनित सभी दस्तावेज Print करें
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() =>
                        setPrintCheckboxes({
                          app: true,
                          project: true,
                          aff: true,
                          consent: true,
                          anudan: true,
                        })
                      }
                    >
                      ☑ सभी चुनें
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() =>
                        setPrintCheckboxes({
                          app: false,
                          project: false,
                          aff: false,
                          consent: false,
                          anudan: false,
                        })
                      }
                    >
                      ☐ सभी हटाएँ
                    </button>
                  </div>
                </div>

                <div className="demo-tools">
                  <b>🧪 Demo Testing — Affidavit</b>
                  <div className="card-intro" style={{ margin: "5px 0 0" }}>
                    नीचे से demo data लगाकर स्वयं की भूमि और स्वयं + सह-खातेदार
                    दोनों affidavit तुरंत test करें।
                  </div>
                  <div className="demo-row">
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => applyDemo("dragonSelf")}
                    >
                      Dragon Demo — केवल स्वयं
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => applyDemo("dragonCo")}
                    >
                      Dragon Demo — सह-खातेदार
                    </button>
                  </div>
                </div>
              </section>

              {/* ================= React Based Print Documents ================= */}

              {showAppPrint && (
                <section
                  id="applicationPrint"
                  className="card print-doc"
                  style={{ display: viewMode === "app" ? "block" : "none" }}
                >
                  <div className="application-header">
                    <h2>कृषक आवेदन पत्र</h2>
                    <p>
                      <b>{m.name} — आवेदन पत्र</b>
                    </p>
                  </div>
                  <h3>1. कृषक का विवरण</h3>
                  <table>
                    <tbody>
                      <tr>
                        <th>कृषक का नाम</th>
                        <td>{form.name}</td>
                        <th>पिता / पति का नाम</th>
                        <td>{form.father}</td>
                      </tr>
                      <tr>
                        <th>मोबाइल</th>
                        <td>{form.mobile}</td>
                        <th>आधार</th>
                        <td>{form.aadhaar || "—"}</td>
                      </tr>
                      <tr>
                        <th>उद्यान कार्ड</th>
                        <td>{form.udyan || "—"}</td>
                        <th>लिंग</th>
                        <td>{form.gender}</td>
                      </tr>
                      <tr>
                        <th>जनपद</th>
                        <td>{form.district}</td>
                        <th>विकासखण्ड</th>
                        <td>{form.block}</td>
                      </tr>
                      <tr>
                        <th>उद्यान सचल दल केंद्र</th>
                        <td colSpan="3">
                          <b>{form.center || "—"}</b>
                        </td>
                      </tr>
                      <tr>
                        <th>ग्राम</th>
                        <td>{form.village}</td>
                        <th>पोस्ट</th>
                        <td>{form.post || "—"}</td>
                      </tr>
                      <tr>
                        <th>स्वयं की भूमि खाता</th>
                        <td>{landRows[0].khata || "—"}</td>
                        <th>स्वयं की भूमि खसरा/गाटा</th>
                        <td>{landRows[0].khasra || "—"}</td>
                      </tr>
                      <tr>
                        <th>प्रस्तावित क्षेत्रफल</th>
                        <td>
                          <b>{n.toFixed(2)} नाली</b>
                        </td>
                        <th>क्षेत्रफल</th>
                        <td>
                          <b>{hectare().toFixed(2)} हे०</b>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <h3>2. किसान घोषणा</h3>
                  <ul>
                    <li>
                      मैंने आवेदन में दी गई भूमि एवं क्षेत्रफल की जानकारी सही दी
                      है।
                    </li>
                    <li>
                      मैं योजना के निर्धारित तकनीकी मानकों के अनुसार कार्य
                      कराने/करने के लिए सहमत हूँ।
                    </li>
                    <li>
                      मैं विभागीय स्थलीय निरीक्षण एवं सत्यापन में सहयोग{" "}
                      {form.gender === "महिला"
                        ? "करूँगी"
                        : form.gender === "अन्य"
                          ? "करूँगा/करूँगी"
                          : "करूँगा"}
                      ।
                    </li>
                    <li>
                      मैं पात्र होने पर निर्धारित कृषक अंश का वहन{" "}
                      {form.gender === "महिला"
                        ? "करूँगी"
                        : form.gender === "अन्य"
                          ? "करूँगा/करूँगी"
                          : "करूँगा"}
                      ।
                    </li>
                  </ul>
                  <h3>3. मानक/स्वीकृत लागत एवं राजसहायता</h3>
                  <table>
                    <tbody>
                      <tr>
                        <th>मानक/स्वीकृत लागत</th>
                        <td>{money(totalCost)}</td>
                      </tr>
                      <tr>
                        <th>प्रस्तावित कुल क्षेत्रफल</th>
                        <td>
                          {n.toFixed(2)} नाली / {hectare().toFixed(4)} हे०
                        </td>
                      </tr>
                      <tr>
                        <th>कुल परियोजना लागत</th>
                        <td>{money(totalCost)}</td>
                      </tr>
                      <tr>
                        <th>देय राजसहायता</th>
                        <td>
                          {money(subCost)} ({pct}%)
                        </td>
                      </tr>
                      <tr>
                        <th>कृषक अंश</th>
                        <td>{money(farmerCost)}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="application-annexure">
                    <h3>7. संलग्न दस्तावेजों की सूची</h3>
                    <ol>
                      <li>
                        ☑ खतौनी/भूमि अभिलेख की प्रति (06 माह से अधिक पुरानी न
                        हो)
                      </li>
                      <li>☑ पहचान पत्र (आधार कार्ड)</li>
                      <li>☑ उद्यान कार्ड</li>
                      <li>☑ बैंक पासबुक की प्रति</li>
                      <li>☑ समूह का पंजीकरण प्रमाण पत्र (यदि समूह हो)</li>
                      <li>
                        ☑ कार्य प्रारम्भ से पूर्व प्रस्तावित स्थल का जियो-टैग
                        फोटो
                      </li>
                    </ol>
                    <h3>घोषणा</h3>
                    <p>
                      मैं प्रमाणित{" "}
                      {form.gender === "महिला"
                        ? "करती हूँ"
                        : form.gender === "अन्य"
                          ? "करता/करती हूँ"
                          : "करता हूँ"}{" "}
                      कि उपरोक्त दी गई सभी जानकारी मेरी जानकारी में पूर्णतः सही
                      है। भविष्य में जानकारी असत्य पाई जाने पर मेरा आवेदन निरस्त
                      किया जा सकता है / मुझे योजना से वंचित किया जा सकता है।
                    </p>
                  </div>
                  <div className="application-sign-off">
                    <div className="signature-grid">
                      <div>
                        स्थान: ____________________
                        <br />
                        दिनांक: ____________________
                      </div>
                      <div>
                        कृषक / आवेदक
                        <br />
                        <b>{form.name || "____________________"}</b>
                        <br />
                        हस्ताक्षर / अंगूठा: ____________________
                      </div>
                    </div>
                    <div className="verify-box">
                      <b>प्रभारी की आख्या</b>
                      <br />
                      निरीक्षण दिनांक .................... को प्रस्तावित भूमि की
                      उत्पादन हेतु उपयुक्त पायी गयी। मृदा परीक्षण / भौगोलिक
                      स्थिति की जाँच बागान हेतु मानक के अनुकूल है।
                      <br />
                      <br />
                      <b>
                        उद्यान सचल दल केंद्र -{" "}
                        {form.center || "________________"}
                      </b>
                      <br />
                      <br />
                      हस्ताक्षर प्रभारी: ____________________
                    </div>
                  </div>
                </section>
              )}

              {showReportPrint && (
                <section
                  id="report"
                  className="card print-doc"
                  style={{ display: viewMode === "report" ? "block" : "none" }}
                >
                  <div className="print-only">
                    <h2>कृषक हेतु परियोजना मानक एवं कार्य-विवरण</h2>
                    <p>
                      आवेदन के प्रस्तावित क्षेत्रफल के अनुसार स्वचालित रूप से
                      तैयार
                    </p>
                  </div>
                  <div className="summary">
                    <div className="metric">
                      <span>योजना</span>
                      <b>{m.name}</b>
                    </div>
                    <div className="metric">
                      <span>प्रस्तावित क्षेत्रफल</span>
                      <b>{n.toFixed(2)} नाली</b>
                    </div>
                    <div className="metric">
                      <span>परियोजना लागत</span>
                      <b>{money(totalCost)}</b>
                    </div>
                    <div className="metric">
                      <span>अनुदान</span>
                      <b>{pct}%</b>
                    </div>
                  </div>
                  <h2>
                    2. मानक के अनुसार कार्य, मात्रा एवं Component-wise लागत
                  </h2>
                  <p className="small">
                    किसान की रिपोर्ट में प्रति इकाई Rate नहीं दिखाया गया है।
                    केवल निर्धारित Quantity, स्पष्ट Technical Specification और
                    Component की कुल लागत दी गई है।
                  </p>
                  <div className="table-wrap">
                    <table className="project-standard-table">
                      <thead>
                        <tr>
                          <th>क्र.</th>
                          <th>कार्य / Component</th>
                          <th>स्पष्ट Technical Specification</th>
                          <th>Quantity</th>
                          <th>Component-wise लागत</th>
                        </tr>
                      </thead>
                      <tbody>
                        {m.components.map((c, i) => {
                          const q = c.qty(n);
                          const cost = c.cost * f;
                          return (
                            <tr key={i}>
                              <td className="qty">{i + 1}</td>
                              <td>
                                <b>{c.name}</b>
                              </td>
                              <td className="spec">{c.spec}</td>
                              <td className="qty">
                                <b>{q.v}</b>
                                <br />
                                <span className="small">{q.u}</span>
                              </td>
                              <td className="money">{money(cost)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="finalbox">
                    <div className="finalrow">
                      <span>कुल परियोजना लागत</span>
                      <b>{money(totalCost)}</b>
                    </div>
                    <div className="finalrow">
                      <span>कृषक अंश</span>
                      <b>{money(farmerCost)}</b>
                    </div>
                    <div className="finalrow">
                      <span>देय अनुदान ({pct}%)</span>
                      <b>{money(subCost)}</b>
                    </div>
                  </div>
                  <div className="page-break" />
                  <h2>3. किसान द्वारा किए जाने वाले कार्य का विवरण</h2>
                  <div className="note">
                    <b>
                      {m.name} — {n.toFixed(2)} नाली ({hectare().toFixed(2)}{" "}
                      हे०) के लिए किसान हेतु कार्य
                    </b>
                  </div>
                  <ol className="checklist">
                    {m.components.map((c) => {
                      const q = c.qty(n);
                      return (
                        <li key={c.name}>
                          <b>{c.name}</b> — {c.spec}{" "}
                          <b>
                            मात्रा: {q.v}
                            {q.u ? ` ${q.u}` : ""}
                          </b>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="note">
                    <b>नोट:</b> ऊपर दिए गए सभी कार्य एवं मात्राएँ किसान के आवेदन
                    में दर्ज क्षेत्रफल के अनुसार स्वतः निर्धारित की गई हैं।
                  </div>
                  <h2>4. परियोजना के महत्वपूर्ण तकनीकी एवं सत्यापन निर्देश</h2>
                  <div className="note">
                    <b>{m.name} — महत्वपूर्ण तकनीकी एवं सत्यापन निर्देश</b>
                  </div>
                  <ul className="checklist">
                    {m.instructions.map((instruction, i) => (
                      <li key={instruction}>
                        <b>{i + 1}. </b>
                        {instruction}
                      </li>
                    ))}
                    <li>
                      <b>क्षेत्रफल:</b> {n.toFixed(2)} नाली (
                      {hectare().toFixed(2)} हे०) के अनुसार ही कार्य किया जाए।
                    </li>
                    <li>
                      <b>सत्यापन:</b> पिल्लर, पौधे, गड्ढे, सिंचाई, फेंसिंग एवं
                      अन्य कार्यों की संख्या/स्थिति स्थल पर निर्धारित मानक के
                      अनुसार सत्यापित की जाएगी।
                    </li>
                    <li>
                      <b>भुगतान/अनुदान:</b> निरीक्षण एवं स्वीकृति के बाद लागू
                      चरणबद्ध प्रावधान के अनुसार भुगतान होगा।
                    </li>
                    <li>
                      <b>दस्तावेज:</b> भूमि अभिलेख, बैंक विवरण, बिल/वाउचर तथा
                      निरीक्षण से संबंधित अभिलेख सुरक्षित रखें।
                    </li>
                  </ul>
                  <div className="note">
                    <b>किसान घोषणा:</b> भूमि विवरण का कुल{" "}
                    {landTotalHa().toFixed(2)} हे०, आवेदन क्षेत्रफल{" "}
                    {hectare().toFixed(2)} हे० से मिलान करता है। पात्रता एवं
                    सत्यापन की अंतिम स्वीकृति विभागीय जाँच के अधीन होगी।
                  </div>
                  <div className="print-footer">
                    यह पत्र आवेदन में दर्ज क्षेत्रफल और उपलब्ध Master Standard
                    के आधार पर स्वचालित रूप से तैयार किया गया है।
                  </div>
                </section>
              )}

              {showAffPrint && (
                <section
                  id="affidavitPrint"
                  className="card print-doc"
                  style={{ display: viewMode === "aff" ? "block" : "none" }}
                >
                  <article className="aff-doc">
                    <div className="doc-title">{m.name}</div>
                    <div className="doc-subtitle">
                      लाभार्थी स्व-घोषणा एवं शपथ-पत्र —{" "}
                      {coMode ? "स्वयं + सह-खातेदार" : "केवल स्वयं की भूमि"}
                    </div>
                    <p>
                      मैं श्री/श्रीमती {form.name}, पुत्र/पुत्री/पत्नी श्री{" "}
                      {form.father}, निवासी{" "}
                      {[
                        form.village,
                        form.post,
                        form.block,
                        form.district,
                        "उत्तराखण्ड",
                      ]
                        .filter(Boolean)
                        .join(", ")}
                      , पौड़ी गढ़वाल, उत्तराखण्ड, सत्यनिष्ठा से शपथपूर्वक
                      निम्नलिखित घोषणा{" "}
                      {form.gender === "महिला"
                        ? "करती"
                        : form.gender === "अन्य"
                          ? "करता/करती"
                          : "करता"}{" "}
                      हूँ कि—
                    </p>
                    <ol>
                      {(coMode
                        ? [
                            <>
                              मेरे द्वारा कुल{" "}
                              <b>
                                {n.toFixed(2)} नाली / {hectare().toFixed(4)} हे०
                              </b>{" "}
                              भूमि प्रस्तावित की गई है, जिसमें मेरी स्वयं की
                              भूमि तथा आवश्यकतानुसार सह-खातेदार की भूमि सम्मिलित
                              है।
                            </>,
                            <>
                              सभी खाता, खसरा/गाटा तथा प्रस्तावित क्षेत्रफल का
                              विवरण संबंधित भूमि अभिलेख के अनुसार सही है।
                            </>,
                            <>
                              प्रत्येक सह-खातेदार ने अपनी स्वतंत्र इच्छा से मेरी
                              योजना में अपनी भूमि सम्मिलित करने हेतु लिखित सहमति
                              एवं अनापत्ति दी है, जो इस शपथ-पत्र के साथ संलग्न
                              है।
                            </>,
                            <>
                              सह-खातेदारों को परियोजना, भूमि के उपयोग तथा
                              पात्रता के अनुसार राजसहायता के आवेदक के सत्यापित
                              बैंक खाते में DBT के माध्यम से प्राप्त होने की
                              जानकारी है और उन्हें इस पर कोई आपत्ति नहीं है।
                            </>,
                          ]
                        : [
                            <>
                              मेरे द्वारा कुल{" "}
                              <b>
                                {n.toFixed(2)} नाली / {hectare().toFixed(4)} हे०
                              </b>{" "}
                              भूमि प्रस्तावित की गई है, जो मेरी स्वयं की भूमि
                              है।
                            </>,
                            <>
                              सभी खाता, खसरा/गाटा तथा प्रस्तावित क्षेत्रफल का
                              विवरण संबंधित भूमि अभिलेख के अनुसार सही है।
                            </>,
                            <>
                              प्रस्तावित भूमि मेरी स्वयं की है और इस भूमि के
                              संबंध में किसी अन्य सह-खातेदार की सहमति की
                              आवश्यकता नहीं है।
                            </>,
                            <>
                              राजसहायता, यदि देय हो, योजना की पात्रता एवं
                              सत्यापन के अनुसार मेरे सत्यापित बैंक खाते में DBT
                              के माध्यम से प्राप्त होने की जानकारी मुझे है।
                            </>,
                          ]
                      ).map((clause, i) => (
                        <li key={`opening-${i}`}>{clause}</li>
                      ))}
                      <li>
                        आवेदन में दर्ज कार्य, मात्रा, कृषक अंश, राजसहायता एवं
                        अन्य जानकारी मेरी जानकारी के अनुसार सही है।
                      </li>
                      <li>
                        कृषक अंश तथा अनुमन्य लागत से अधिक अतिरिक्त व्यय, जहाँ
                        लागू हो, मैं{" "}
                        {form.gender === "महिला"
                          ? "स्वयं दूँगी"
                          : form.gender === "अन्य"
                            ? "स्वयं दूँगा/दूँगी"
                            : "स्वयं दूँगा"}
                        ।
                      </li>
                      <li>
                        यह कि मेरे द्वारा <b>ड्रैगन फ्रूट (कमलम)</b> उद्यान
                        स्थापना हेतु उद्यान विभाग में विधिवत आवेदन किया गया है
                        और प्रस्तावित भूमि पर योजना के लागू प्रावधानों के अनुसार
                        कार्य किया जाएगा।
                      </li>
                      <li>
                        यह कि प्रस्तावित भूमि मेरे वैध स्वामित्व/अधिकार एवं
                        वास्तविक कब्जे में है तथा परियोजना के क्रियान्वयन में
                        मेरी जानकारी के अनुसार कोई ऐसी ज्ञात कानूनी बाधा नहीं है
                        जो कार्य में बाधा उत्पन्न करे।
                      </li>
                      <li>
                        यह कि आवेदन में दर्शाया गया प्रस्तावित क्षेत्रफल ही
                        परियोजना का आवेदन क्षेत्रफल माना जाएगा तथा वास्तविक
                        क्षेत्रफल एवं कार्य का सत्यापन विभागीय स्थलीय निरीक्षण
                        के समय किया जा सकेगा।
                      </li>
                      <li>
                        यह कि परियोजना क्षेत्र में भूमि रेखांकन, आवश्यक भूमि
                        तैयारी तथा निर्धारित layout के अनुसार{" "}
                        <b>
                          पंक्ति से पंक्ति 3.0 मीटर तथा पिल्लर से पिल्लर 2.0
                          मीटर
                        </b>{" "}
                        की व्यवस्था रखी जाएगी।
                      </li>
                      <li>
                        यह कि निर्धारित मानक के अनुसार गड्ढा खुदान/भराई, बंड तथा
                        खाद एवं उर्वरक प्रबंधन किया जाएगा और आवश्यक खाद/उर्वरक
                        का उपयोग विभागीय मानक के अनुसार किया जाएगा।
                      </li>
                      <li>
                        यह कि परियोजना में निर्धारित{" "}
                        <b>RCC पिल्लर एवं कंक्रीट रिंग</b> प्रणाली स्थापित की
                        जाएगी तथा निर्धारित पिल्लर संख्या के अनुसार पौधों का
                        रोपण किया जाएगा।
                      </li>
                      <li>
                        यह कि स्वस्थ, रोगमुक्त एवं गुणवत्तायुक्त ड्रैगन फ्रूट
                        पौध/स्टेम कटिंग का उपयोग किया जाएगा और निर्धारित रोपण
                        सामग्री की गुणवत्ता/स्रोत संबंधी विभागीय आवश्यकताओं का
                        पालन किया जाएगा।
                      </li>
                      <li>
                        यह कि परियोजना में निर्धारित{" "}
                        <b>ड्रिप सिंचाई एवं फर्टिगेशन प्रणाली</b> स्थापित/उपयोग
                        की जाएगी तथा जहाँ योजना मानक में लागू हो, GI Chain Link
                        Fencing का कार्य निर्धारित specification के अनुसार किया
                        जाएगा।
                      </li>
                      <li>
                        यह कि प्रथम वर्ष के लिए अनुमन्य उर्वरक एवं पौध संरक्षण
                        सामग्री का उपयोग निर्धारित मानक एवं आवश्यकता के अनुसार
                        किया जाएगा तथा उद्यान का नियमित रख-रखाव किया जाएगा।
                      </li>
                      <li>
                        यह कि पौध/रोपण सामग्री तथा infrastructure से संबंधित
                        भुगतान/राजसहायता योजना के निर्धारित चरणों, विभागीय
                        निरीक्षण एवं सत्यापन के अधीन होगी।
                      </li>
                      <li>
                        यह कि विभागीय निरीक्षण/सत्यापन में यदि कोई कमी, त्रुटि
                        अथवा सुधार योग्य बिंदु पाया जाता है तो विभागीय
                        निर्देशानुसार निर्धारित समय में आवश्यक सुधार किया जाएगा
                        तथा आवश्यक मूल दस्तावेज प्रस्तुत किए जाएंगे।
                      </li>
                      <li>
                        प्रस्तावित भूमि/कार्य पर ऐसा कोई दोहरा सरकारी लाभ
                        प्राप्त नहीं किया गया है जिससे एक ही कार्य पर दोहरा
                        अनुदान मिले; यदि कोई पूर्वलाभ लागू/प्राप्त हुआ है तो
                        उसका विवरण आवेदन में सत्य रूप से दिया गया है।
                      </li>
                      <li>
                        मैं परियोजना में स्थापित पौध, सिंचाई प्रणाली,
                        infrastructure/सहायक संरचना, फेंसिंग तथा अन्य स्वीकृत
                        परिसंपत्तियों के उचित उपयोग, सुरक्षा एवं रख-रखाव की
                        जिम्मेदारी{" "}
                        {form.gender === "महिला"
                          ? "निभाऊँगी"
                          : form.gender === "अन्य"
                            ? "निभाऊँगा/निभाऊँगी"
                            : "निभाऊँगा"}
                        ।
                      </li>
                      <li>
                        असत्य/भ्रामक/नियम-विरुद्ध जानकारी पाए जाने पर नियमानुसार
                        आवेदन निरस्त, राजसहायता की वसूली तथा आवश्यक
                        विभागीय/कानूनी कार्यवाही स्वीकार्य होगी।
                      </li>
                      <li>
                        मैंने यह शपथ-पत्र बिना दबाव, भय अथवा प्रलोभन के अपनी
                        स्वतंत्र इच्छा से दिया है।
                      </li>
                      <li>
                        यह कि आवेदन में दी गई भूमि, क्षेत्रफल, खसरा/गाटा,
                        खाता/खतौनी, बैंक विवरण, उद्यान कार्ड तथा अन्य जानकारी
                        सत्य एवं सही है।
                      </li>
                      <li>
                        यह कि प्राकृतिक आपदा, जंगली जानवरों, मौसमजनित क्षति अथवा
                        अन्य व्यावहारिक नुकसान की स्थिति में विभाग की जिम्मेदारी
                        योजना के लागू नियमों तक ही सीमित होगी।
                      </li>
                    </ol>
                    <h3>भूमि एवं {coMode ? "सह-खातेदार " : ""}विवरण</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>क्र.</th>
                          <th>भूमि किसकी</th>
                          <th>नाम</th>
                          <th>पिता/पति</th>
                          <th>ग्राम</th>
                          <th>खाता</th>
                          <th>खसरा/गाटा</th>
                          <th>प्रस्तावित भूमि (हे०)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {landRows
                          .filter((row) => row.rel && (row.name || row.area))
                          .map((row, i) => (
                            <tr key={`land-${i}`}>
                              <td>{i + 1}</td>
                              <td>
                                {row.rel === "सहखातेदार"
                                  ? "सह-खातेदार"
                                  : row.rel || "—"}
                              </td>
                              <td>{row.name || "—"}</td>
                              <td>{row.father || "—"}</td>
                              <td>{row.village || "—"}</td>
                              <td>{row.khata || "—"}</td>
                              <td>{row.khasra || "—"}</td>
                              <td className="money">
                                {num(row.area).toFixed(4)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th colSpan="7">कुल प्रस्तावित क्षेत्रफल</th>
                          <th>{hectare().toFixed(4)} हे०</th>
                        </tr>
                      </tfoot>
                    </table>
                    <div className="sig">
                      <div>
                        स्थान: ____________________
                        <br />
                        दिनांक: ____________________
                      </div>
                      <div>
                        शपथकर्ता/कृषक
                        <br />
                        <b>{form.name}</b>
                        <br />
                        हस्ताक्षर ____________________
                      </div>
                    </div>
                    <p className="aff-note">
                      स्टाम्प/नोटरी/शपथ आयुक्त संबंधी औपचारिकता संबंधित
                      विभाग/लागू नियम के अनुसार पूरी की जाए।
                    </p>
                  </article>
                </section>
              )}

              {showConsentPrint && (
                <section
                  id="consentPrint"
                  className="card print-doc"
                  style={{ display: viewMode === "consent" ? "block" : "none" }}
                >
                  {coOwners.length === 0 ? (
                    <div className="aff-doc">
                      <div className="doc-title">
                        सह-खातेदार का सहमति एवं अनापत्ति पत्र
                      </div>
                      <p>इस आवेदन में कोई सह-खातेदार दर्ज नहीं है।</p>
                    </div>
                  ) : (
                    coOwners.map((r, idx) => (
                      <article
                        key={idx}
                        className={`aff-doc ${idx ? "page-break-doc" : ""}`}
                      >
                        <div className="doc-title">{m.name} हेतु</div>
                        <div className="doc-subtitle">
                          सह-खातेदार का सहमति एवं अनापत्ति पत्र
                        </div>
                        <p>
                          मैं श्री/श्रीमती <b>{r.name}</b>, पुत्र/पुत्री/पत्नी
                          श्री <b>{r.father}</b>, निवासी{" "}
                          <b>{r.village || form.village}</b>, आवेदक से संबंध{" "}
                          <b>{r.rel === "सहखातेदार" ? "सह-खातेदार" : r.rel}</b>{" "}
                          हूँ। मैं निम्नलिखित सहमति प्रदान{" "}
                          {r.gender === "महिला" ? "करती" : "करता/करती"} हूँ कि—
                        </p>
                        <ol>
                          <li>
                            मेरी भूमि का विवरण खाता संख्या <b>{r.khata}</b>,
                            खसरा/गाटा संख्या <b>{r.khasra}</b>, कुल/प्रस्तावित
                            क्षेत्रफल <b>{num(r.area).toFixed(4)} हे०</b> है।
                          </li>
                          <li>
                            मैं अपनी भूमि में से{" "}
                            <b>{num(r.area).toFixed(4)} हे०</b> क्षेत्रफल को
                            श्री/श्रीमती <b>{form.name}</b> द्वारा {m.name}{" "}
                            योजना के आवेदन में सम्मिलित करने की सहमति{" "}
                            {r.gender === "महिला" ? "देती" : "देता/देती"} हूँ।
                          </li>
                          <li>
                            मुझे उक्त भूमि पर प्रस्तावित उद्यान स्थापना एवं
                            स्वीकृत कार्य किए जाने पर कोई आपत्ति नहीं है।
                          </li>
                          <li>
                            मुझे योजना, प्रस्तावित कार्य तथा पात्रता के अनुसार
                            राजसहायता के आवेदक के सत्यापित बैंक खाते में DBT के
                            माध्यम से प्राप्त होने की जानकारी है और मुझे इस पर
                            कोई आपत्ति नहीं है।
                          </li>
                          <li>
                            मैं यह सहमति अपनी स्वतंत्र इच्छा से{" "}
                            {r.gender === "महिला" ? "देती" : "देता/देती"} हूँ और
                            प्रस्तावित भूमि के उपयोग के संबंध में जानबूझकर
                            अनावश्यक बाधा उत्पन्न नहीं{" "}
                            {r.gender === "महिला" ? "करूँगी" : "करूँगा/करूँगी"}।
                          </li>
                        </ol>
                        <h3>सह-खातेदार का विवरण</h3>
                        <table>
                          <tbody>
                            <tr>
                              <th>नाम</th>
                              <td>{r.name}</td>
                            </tr>
                            <tr>
                              <th>पिता/पति</th>
                              <td>{r.father}</td>
                            </tr>
                            <tr>
                              <th>आवेदक से संबंध</th>
                              <td>
                                <b>
                                  {r.rel === "सहखातेदार" ? "सह-खातेदार" : r.rel}
                                </b>
                              </td>
                            </tr>
                            <tr>
                              <th>लिंग</th>
                              <td>{r.gender || "पुरुष"}</td>
                            </tr>
                            <tr>
                              <th>ग्राम</th>
                              <td>{r.village}</td>
                            </tr>
                            <tr>
                              <th>खाता संख्या</th>
                              <td>{r.khata}</td>
                            </tr>
                            <tr>
                              <th>खसरा/गाटा संख्या</th>
                              <td>{r.khasra}</td>
                            </tr>
                            <tr>
                              <th>सम्मिलित भूमि</th>
                              <td>{num(r.area).toFixed(4)} हे०</td>
                            </tr>
                            <tr>
                              <th>मोबाइल</th>
                              <td>________________</td>
                            </tr>
                            <tr>
                              <th>पहचान दस्तावेज</th>
                              <td>________________</td>
                            </tr>
                          </tbody>
                        </table>
                        <div className="sig">
                          <div>
                            स्थान: ____________________
                            <br />
                            दिनांक: ____________________
                          </div>
                          <div>
                            सह-खातेदार
                            <br />
                            <b>{r.name}</b>
                            <br />
                            हस्ताक्षर ____________________
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </section>
              )}

              {showAnudanPrint && (
                <section
                  id="anudanPrint"
                  className="card print-doc"
                  style={{ display: viewMode === "anudan" ? "block" : "none" }}
                >
                  <div className="anudan-form">
                    <div className="af-head">जिला योजना वर्ष 2026-27</div>
                    <div className="af-title">
                      {m.name} अन्तर्गत राजसहायता देयक
                    </div>
                    <div className="af-meta">
                      <div>
                        <b>नाम कृषक :</b> {form.name}
                      </div>
                      <div>
                        <b>पिता का नाम :</b> {form.father}
                      </div>
                      <div>
                        <b>ग्राम :</b> {form.village}
                      </div>
                      <div>
                        <b>विकास खण्ड :</b> {form.block}
                      </div>
                      <div>
                        <b>आधार संख्या :</b> {form.aadhaar || "—"}
                      </div>
                      <div>
                        <b>मो० नं० :</b> {form.mobile}
                      </div>
                      <div>
                        <b>उद्यान का क्षेत्रफल (हेक्टेयर में) :</b>{" "}
                        {hectare().toFixed(2)}
                      </div>
                      <div>
                        <b>आवेदन संख्या :</b> {form.appno || "—"}
                      </div>
                    </div>
                    <div className="af-bank">
                      <h4>बैंक खाता विवरण</h4>
                      <div className="af-bank-grid">
                        <div>
                          <b>खाता धारक :</b>{" "}
                          {form.bankHolder || form.name || "—"}
                        </div>
                        <div>
                          <b>बैंक :</b> {form.bankName || "—"}
                        </div>
                        <div>
                          <b>शाखा :</b> {form.bankBranch || "—"}
                        </div>
                        <div>
                          <b>खाता संख्या :</b> {form.bankAccount || "—"}
                        </div>
                        <div>
                          <b>IFSC :</b> {form.bankIfsc || "—"}
                        </div>
                        <div>
                          <b>खाता प्रकार :</b> {form.bankType || "—"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <b>देयक सारणी</b>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>क्र० सं०</th>
                          <th>निरीक्षण / भुगतान चरण</th>
                          <th>कार्य का विवरण</th>
                          <th>देयक की कुल धनराशि (₹)</th>
                          <th>राजसहायता हेतु धनराशि (₹)</th>
                          <th>कृषक द्वारा वहन की गयी धनराशि (₹)</th>
                          <th>जिसे भुगतान किया जाना है का विवरण</th>
                        </tr>
                      </thead>
                      <tbody>
                        {voucherRows
                          .filter((row) =>
                            row.some(
                              (value) => String(value || "").trim() !== "",
                            ),
                          )
                          .map((row, i) => {
                            const amount = num(row[3]);
                            const subsidy = (amount * pct) / 100;
                            return (
                              <tr key={`voucher-print-${i}`}>
                                <td>{i + 1}</td>
                                <td>{row[0] || "Infrastructure स्थापना"}</td>
                                <td>
                                  {row[1] || "—"}
                                  {row[2] ? (
                                    <>
                                      <br />
                                      <span>बिल/वाउचर नं. {row[2]}</span>
                                    </>
                                  ) : null}
                                </td>
                                <td className="money">{money(amount)}</td>
                                <td className="money">{money(subsidy)}</td>
                                <td className="money">
                                  {money(amount - subsidy)}
                                </td>
                                <td>{row[4] || row[5] || "—"}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                      <tfoot>
                        <tr className="af-total">
                          <td colSpan="3">कुल योग</td>
                          <td className="money">
                            {money(
                              voucherRows.reduce(
                                (sum, row) => sum + num(row[3]),
                                0,
                              ),
                            )}
                          </td>
                          <td className="money">
                            {money(
                              voucherRows.reduce(
                                (sum, row) => sum + (num(row[3]) * pct) / 100,
                                0,
                              ),
                            )}
                          </td>
                          <td className="money">
                            {money(
                              voucherRows.reduce(
                                (sum, row) =>
                                  sum + (num(row[3]) * (100 - pct)) / 100,
                                0,
                              ),
                            )}
                          </td>
                          <td>
                            {Array.from(
                              new Set(
                                voucherRows
                                  .map((row) => row[4] || row[5])
                                  .filter(Boolean),
                              ),
                            ).join(", ") || "संबंधित बिल/वाउचर अनुसार"}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                    <p className="af-para">संलग्न-</p>
                    <p className="af-para">
                      प्रमाणित किया जाता है कि मेरे द्वारा {m.name} स्थापना
                      कार्यों पर उक्तानुसार धनराशि व्यय की गई है। कृषक अंश की
                      धनराशि कुल ₹{" "}
                      <b>
                        {money(
                          voucherRows.reduce(
                            (sum, row) =>
                              sum + (num(row[3]) * (100 - pct)) / 100,
                            0,
                          ),
                        )}
                      </b>{" "}
                      मेरे द्वारा भुगतान कर दी गयी है। अतः राजसहायता की {pct}%
                      की धनराशि ₹{" "}
                      <b>
                        {money(
                          voucherRows.reduce(
                            (sum, row) => sum + (num(row[3]) * pct) / 100,
                            0,
                          ),
                        )}
                      </b>{" "}
                      का भुगतान संलग्न देयक अनुसार सम्बन्धितों को करने की कृपा
                      कीजिएगा।
                    </p>
                    <div className="af-sign">
                      <div>
                        हस्ताक्षर कृषक : ____________________
                        <br />
                        नाम (अक्षरों में) : <b>{form.name}</b>
                      </div>
                    </div>
                    <div className="af-inspect">
                      <div className="af-inspect-title">निरीक्षण</div>
                      <p>
                        प्रमाणित किया जाता है कि मेरे द्वारा {m.name} स्थापना
                        कार्य का निरीक्षण कर लिया गया है। अतः देयक राजसहायता की{" "}
                        {pct}% की धनराशि ₹{" "}
                        <b>
                          {money(
                            voucherRows.reduce(
                              (sum, row) => sum + (num(row[3]) * pct) / 100,
                              0,
                            ),
                          )}
                        </b>{" "}
                        संलग्न देयक अनुसार सम्बन्धितों को कृषक के अनुरोध पर
                        सत्यापित कर संस्तुति सहित भुगतान हेतु अग्रसारित।
                      </p>
                      <div className="af-footer-sign">
                        हस्ताक्षर प्रभारी : ____________________
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </main>

        <div className="footer noprint">
          Dragon Fruit Farmer Application &amp; Project Standard System
        </div>
      </div>

      {activePage === "filling" && (
        <>
          <button
            type="button"
            className="side-toggle"
            aria-expanded={sideOpen}
            onClick={() => setSideOpen((v) => !v)}
          >
            ☰ दस्तावेज विकल्प
          </button>

          <aside
            className={`side-tabs ${sideOpen ? "open" : ""}`}
            aria-label="दस्तावेज विकल्प"
          >
            <button
              type="button"
              className="side-close"
              aria-label="बंद करें"
              onClick={() => setSideOpen(false)}
            >
              ×
            </button>
            <div className="side-tab-head">
              {SIDE_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={activeSideTab === t.id ? "active" : ""}
                  onClick={() => selectSideTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div
              className={`side-pane ${activeSideTab === "work" ? "active" : ""}`}
            >
              <h4>मुख्य कार्य</h4>
              <div className="side-group">
                <div className="side-group-title">आवेदन एवं मानक</div>
                <button
                  type="button"
                  className="side-action"
                  onClick={startNewApplication}
                >
                  🆕 नया आवेदन शुरू करें
                </button>
                <button
                  type="button"
                  className="side-action"
                  onClick={handleGenerate}
                >
                  ✓ आवेदन से किसान-विशिष्ट मानक बनाएं
                </button>
                <button
                  type="button"
                  className="side-action"
                  onClick={saveDraft}
                >
                  💾 Draft सुरक्षित करें
                </button>
                <button
                  type="button"
                  className="side-action"
                  onClick={loadDraft}
                >
                  ↶ Draft लोड करें
                </button>
              </div>
              <div className="side-group">
                <div className="side-group-title">शपथ-पत्र</div>
                <button
                  type="button"
                  className="side-action"
                  onClick={handleBuildAffidavit}
                >
                  📜 शपथ-पत्र तैयार करें
                </button>
                <button
                  type="button"
                  className="side-action"
                  onClick={handleBuildAffidavit}
                >
                  🤝 सहमति / NOC तैयार करें
                </button>
              </div>
              <div className="side-group">
                <div className="side-group-title">अनुदान</div>
                <button
                  type="button"
                  className="side-action"
                  onClick={handleBuildAnudan}
                >
                  💰 अनुदान देयक तैयार करें
                </button>
              </div>
            </div>

            <div
              className={`side-pane ${activeSideTab === "view" ? "active" : ""}`}
            >
              <h4>दस्तावेज / फॉर्म देखें</h4>
              <div className="side-group">
                <div className="side-group-title">आवेदन एवं मानक</div>
                <button
                  type="button"
                  className="side-action"
                  onClick={() => handleView("app")}
                >
                  📄 आवेदन पत्र देखें
                </button>
                <button
                  type="button"
                  className="side-action"
                  onClick={() => handleView("report")}
                >
                  📋 पूर्ण परियोजना मानक देखें
                </button>
              </div>
              <div className="side-group">
                <div className="side-group-title">शपथ-पत्र / सहमति</div>
                <button
                  type="button"
                  className="side-action"
                  onClick={() => handleView("aff")}
                >
                  📜 शपथ-पत्र तैयार / देखें
                </button>
                <button
                  type="button"
                  className="side-action"
                  onClick={() => handleView("consent")}
                >
                  🤝 सहमति / NOC देखें
                </button>
              </div>
              <div className="side-group">
                <div className="side-group-title">अनुदान</div>
                <button
                  type="button"
                  className="side-action"
                  onClick={() => handleView("anudan")}
                >
                  💰 अनुदान देयक फॉर्म खोलें
                </button>
              </div>
            </div>

            <div
              className={`side-pane ${activeSideTab === "print" ? "active" : ""}`}
            >
              <h4>प्रिंट विकल्प</h4>
              <div className="side-group">
                <div className="side-group-title">अलग-अलग प्रिंट</div>
                <button
                  type="button"
                  className="side-action gold"
                  onClick={() => handlePrint("app")}
                >
                  🖨 आवेदन पत्र Print
                </button>
                <button
                  type="button"
                  className="side-action gold"
                  onClick={() => handlePrint("project")}
                >
                  🖨 पूर्ण परियोजना मानक Print
                </button>
                <button
                  type="button"
                  className="side-action gold"
                  onClick={() => handlePrint("affidavit")}
                >
                  🖨 मुख्य शपथ-पत्र Print
                </button>
                <button
                  type="button"
                  className="side-action gold"
                  onClick={() => handlePrint("consent")}
                >
                  🖨 सहमति / NOC Print
                </button>
                <button
                  type="button"
                  className="side-action gold"
                  onClick={() => handlePrint("all")}
                >
                  🖨 सभी शपथ-पत्र / NOC Print
                </button>
                <button
                  type="button"
                  className="side-action gold"
                  onClick={() => handlePrint("anudan")}
                >
                  🖨 अनुदान देयक Print
                </button>
              </div>
              <div className="side-group">
                <div className="side-group-title">चयनित दस्तावेज एक साथ</div>
                <div className="side-mini">
                  ☑ आवेदन पत्र चुनने पर संलग्न दस्तावेज सूची + घोषणा तथा प्रभारी
                  की आख्या भी शामिल होंगी।
                </div>
                <label className="side-check">
                  <input
                    type="checkbox"
                    checked={printCheckboxes.app}
                    onChange={(e) =>
                      setPrintCheckboxes({
                        ...printCheckboxes,
                        app: e.target.checked,
                      })
                    }
                  />{" "}
                  आवेदन पत्र
                </label>
                <label className="side-check">
                  <input
                    type="checkbox"
                    checked={printCheckboxes.project}
                    onChange={(e) =>
                      setPrintCheckboxes({
                        ...printCheckboxes,
                        project: e.target.checked,
                      })
                    }
                  />{" "}
                  पूर्ण परियोजना मानक
                </label>
                <label className="side-check">
                  <input
                    type="checkbox"
                    checked={printCheckboxes.aff}
                    onChange={(e) =>
                      setPrintCheckboxes({
                        ...printCheckboxes,
                        aff: e.target.checked,
                      })
                    }
                  />{" "}
                  मुख्य शपथ-पत्र
                </label>
                <label className="side-check">
                  <input
                    type="checkbox"
                    checked={printCheckboxes.consent}
                    onChange={(e) =>
                      setPrintCheckboxes({
                        ...printCheckboxes,
                        consent: e.target.checked,
                      })
                    }
                  />{" "}
                  सह-खातेदार सहमति / NOC
                </label>
                <label className="side-check">
                  <input
                    type="checkbox"
                    checked={printCheckboxes.anudan}
                    onChange={(e) =>
                      setPrintCheckboxes({
                        ...printCheckboxes,
                        anudan: e.target.checked,
                      })
                    }
                  />{" "}
                  अनुदान देयक
                </label>
                <button
                  type="button"
                  className="side-action gold"
                  onClick={() => handlePrint("selected")}
                >
                  🖨 चयनित सभी दस्तावेज Print
                </button>
                <button
                  type="button"
                  className="side-action"
                  onClick={() =>
                    setPrintCheckboxes({
                      app: true,
                      project: true,
                      aff: true,
                      consent: true,
                      anudan: true,
                    })
                  }
                >
                  ☑ सभी चुनें
                </button>
                <button
                  type="button"
                  className="side-action"
                  onClick={() =>
                    setPrintCheckboxes({
                      app: false,
                      project: false,
                      aff: false,
                      consent: false,
                      anudan: false,
                    })
                  }
                >
                  ☐ सभी हटाएँ
                </button>
              </div>
            </div>

            <div
              className={`side-pane ${activeSideTab === "anudan" ? "active" : ""}`}
            >
              <h4>अनुदान देयक</h4>
              <div className="side-group">
                <div className="side-group-title">अनुदान कार्य</div>
                <button
                  type="button"
                  className="side-action"
                  onClick={handleBuildAnudan}
                >
                  ✓ अनुदान देयक बनाएं
                </button>
                <button
                  type="button"
                  className="side-action gold"
                  onClick={() => handlePrint("anudan")}
                >
                  🖨 अनुदान देयक Print
                </button>
              </div>
              <div className="side-group">
                <div className="side-group-title">वर्तमान स्थिति</div>
                <div className="side-mini">
                  बिल / वाउचर की राशि अनुदान फॉर्म में दर्ज होगी।
                </div>
                <div className="side-stats">
                  <div>
                    <b>कुल देयक</b>
                    <span>₹0</span>
                  </div>
                  <div>
                    <b>राजसहायता</b>
                    <span>₹0</span>
                  </div>
                  <div>
                    <b>कृषक अंश</b>
                    <span>₹0</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`side-pane ${activeSideTab === "steps" ? "active" : ""}`}
            >
              <h4>🧭 पूरा Step-by-Step Workflow</h4>
              <div className="fresh-note">
                <b>नया आवेदन:</b> पहले "नया आवेदन शुरू करें" से खाली form लें।
              </div>
              <div>
                {APP_STEPS.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`side-step ${i === workflowStep ? "active" : ""}`}
                    onClick={() => goToStep(i)}
                  >
                    <span className="num">{i + 1}</span>
                    <div>
                      <b>{s.title}</b>
                      <span>{s.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
              <div className="side-group">
                <div className="side-group-title">अनुदान के 4 चरण</div>
                <button type="button" className="side-step">
                  <span className="num">1</span>
                  <div>
                    <b>चरण 1 — आधार / चरण</b>
                    <span>Inspection stage और project component चुनें</span>
                  </div>
                </button>
                <button type="button" className="side-step">
                  <span className="num">2</span>
                  <div>
                    <b>चरण 2 — Bill / Voucher</b>
                    <span>Voucher, राशि और भुगतान पाने वाला भरें</span>
                  </div>
                </button>
                <button type="button" className="side-step">
                  <span className="num">3</span>
                  <div>
                    <b>चरण 3 — गणना / समीक्षा</b>
                    <span>कुल देयक, राजसहायता और कृषक अंश देखें</span>
                  </div>
                </button>
                <button type="button" className="side-step">
                  <span className="num">4</span>
                  <div>
                    <b>चरण 4 — देयक / Print</b>
                    <span>अनुदान देयक तैयार और print करें</span>
                  </div>
                </button>
              </div>
            </div>

            <div
              className={`side-pane ${activeSideTab === "demo" ? "active" : ""}`}
            >
              <h4>Demo Testing</h4>
              <div className="side-group">
                <div className="side-group-title">Affidavit Demo</div>
                <div className="side-mini">
                  Demo data लगाकर स्वयं की भूमि और स्वयं + सह-खातेदार दोनों
                  affidavit तुरंत test करें।
                </div>
                <button
                  type="button"
                  className="side-action"
                  onClick={() => applyDemo("dragonSelf")}
                >
                   Dragon — केवल स्वयं
                </button>
                <button
                  type="button"
                  className="side-action"
                  onClick={() => applyDemo("dragonCo")}
                >
                   Dragon — सह-खातेदार
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default DragfruitsAndKiwi;
