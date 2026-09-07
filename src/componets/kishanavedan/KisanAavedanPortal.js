import React, { useEffect, useMemo, useState } from "react";
import "./kisan-aavedan-portal.css";

const NALI_HA = 0.02;
const NALI_ACRE = 20;
const IRR = ["पाइपलाइन", "पानी की टंकी", "नहर", "बोरिंग", "अन्य"];
const CAT_SM = ["लघु कृषक", "सीमांत कृषक", "अन्य"];

const SCHEMES = {
  fencing: {
    name: "फेंसिंग",
    full: "जिला योजनान्तर्गत फेंसिंग हेतु कृषक आवेदन पत्र",
    tag: "खेत की सुरक्षा हेतु बाड़",
    blurb:
      "जंगली जानवरों व आवारा पशुओं से फसल बचाने हेतु फेंसिंग — चेन लिंक अथवा कांटेदार तार।",
    tags: ["चेन लिंक फेंसिंग", "कांटेदार तार की बाड़"],
    code: "CLF",
    costPerHa: 200000,
    docs: [
      "अद्यतन खतौनी की प्रति",
      "पहचान पत्र (आधार कार्ड)",
      "उद्यान कार्ड",
      "बैंक पासबुक की प्रति",
      "₹10/- का शपथ पत्र",
      "कार्य प्रारम्भ से पूर्व प्रस्तावित स्थल का जियो-टैग फोटो",
    ],
    standards: [
      "चैनलिंक वायर: मोटाई 3.15 mm, ऊँचाई 1.40 मीटर, मेश साइज 75 mm × 75 mm, मानक IS 2721 (2003)।",
      "एम.एस. एंगल पोस्ट: 35 mm × 35 mm × 5 mm, कुल लंबाई 2.20 मीटर।",
      "एंगल से एंगल की दूरी 3 मीटर तथा कोनों पर सपोर्टिंग एंगल लगेंगे।",
      "नींव 0.30 × 0.30 × 0.60 मीटर C.C. 1:3:6 में।",
      "समस्त एंगल आयरन पर जंग रोधक पेंट अनिवार्य।",
      "खेत में आवागमन हेतु उपयुक्त स्थान पर गेट लगाया जाएगा।",
      "कार्य का जियो-टैगिंग / फोटोग्राफी कराना अनिवार्य है।",
    ],
    barbed: [
      "एम.एस. एंगल पोस्ट: 35 mm × 35 mm × 5 mm, कुल लंबाई 2.20 मीटर।",
      "एंगल से एंगल की दूरी 3 मीटर तथा कोनों पर सपोर्टिंग एंगल लगेंगे।",
      "नींव 0.30 × 0.30 × 0.60 मीटर C.C. 1:3:6 में।",
      "समस्त एंगल आयरन पर जंग रोधक पेंट अनिवार्य।",
      "कांटेदार तार की पंक्तियाँ तनाव तार सहित लगाई जाएंगी।",
      "खेत में आवागमन हेतु उपयुक्त स्थान पर गेट लगाया जाएगा।",
      "कार्य का जियो-टैगिंग / फोटोग्राफी कराना अनिवार्य है।",
    ],
    steps: [
      "scheme",
      "personal",
      "land",
      "bank",
      "technical",
      "docs",
      "declaration",
    ],
  },
  kiwi: {
    name: "कीवी उद्यान स्थापना",
    full: "जिला योजनान्तर्गत कीवी उद्यान स्थापना — कृषक आवेदन पत्र",
    tag: "नकदी बागवानी",
    blurb:
      "ट्रेलिस, ड्रिप सिंचाई व फेंसिंग सहित कीवी बागान की स्थापना पर सहायता।",
    tags: ["208 पौधे/एकड़", "9 मादा : 1 नर", "कृषक अंश 30%"],
    code: "KWI",
    farmerShare: 30,
    docs: [
      "अद्यतन खतौनी (06 माह के भीतर) की प्रति",
      "पहचान पत्र (आधार कार्ड)",
      "उद्यान कार्ड",
      "बैंक पासबुक की प्रति",
      "समूह का पंजीकरण प्रमाण पत्र (यदि समूह हो)",
      "कार्य प्रारम्भ से पूर्व प्रस्तावित स्थल का जियो-टैग फोटो",
    ],
    standards: [
      "ट्रेलिस सिस्टम: T-Bar डिज़ाइन — कुल ऊँचाई 2.5m और आर्म चौड़ाई 2.0m।",
      "फेंसिंग: जी.आई. चेन लिंक फेंसिंग, लोहे के खम्भों के साथ।",
      "रोपण सामग्री: 208 पौधे प्रति एकड़ (167 मुख्य + 41 बैकअप), 9 मादा : 1 नर।",
      "सिंचाई: टपक (Drip) सिंचाई प्रणाली का उपयोग अनिवार्य।",
    ],
    steps: ["personal", "land", "planbank", "technical", "docs", "declaration"],
  },
  dragon: {
    name: "ड्रैगन फ्रूट (कमलम)",
    full: "ड्रैगन फ्रूट (कमलम) उत्पादन प्रोत्साहन योजना — कृषक आवेदन पत्र",
    tag: "कम पानी, अधिक आय",
    blurb:
      "RCC पिलर, ड्रिप-फर्टिगेशन व फेंसिंग सहित ड्रैगन फ्रूट बागान की स्थापना।",
    tags: ["666 पिलर/एकड़", "2667 पौधे", "कृषक अंश 20%"],
    code: "DRF",
    farmerShare: 20,
    docs: [
      "अद्यतन खतौनी (06 माह के भीतर) की प्रति",
      "पहचान पत्र (आधार कार्ड)",
      "उद्यान कार्ड",
      "बैंक पासबुक की प्रति",
      "समूह का पंजीकरण प्रमाण पत्र (यदि समूह हो)",
      "कार्य प्रारम्भ से पूर्व प्रस्तावित स्थल का जियो-टैग फोटो",
    ],
    standards: [
      "प्रति एकड़ 666 RCC पिलर, 2.30 मीटर लंबाई के, शीर्ष पर कंक्रीट रिंग/छल्ला अनिवार्य।",
      "पिलर से पिलर 2.0 मीटर एवं लाइन से लाइन 3.0 मीटर।",
      "प्रति पिलर 4 पौधे — कुल लगभग 2667 पौधे प्रति एकड़।",
      "ड्रिप सिंचाई प्रणाली एवं फर्टिगेशन सिस्टम अनिवार्य।",
      "फेंसिंग: जी.आई. चेन लिंक फेंसिंग, लोहे के खम्भों के साथ।",
    ],
    steps: ["personal", "land", "planbank", "technical", "docs", "declaration"],
  },
};

const initialData = {
  gender: "",
  docs: [],
  irrSource: [],
  date: new Date().toISOString().slice(0, 10),
  propArea_unit: "नाली",
  photo: "",
};


// =========================================================
// KISAN APPLICATION API
// =========================================================
const KISAN_API = {
  application: "https://mahadevaaya.com/govbillingsystem/backend/api/kisan-application/",
  personalLandUpdate:
    "https://mahadevaaya.com/govbillingsystem/backend/api/kisan-personal-land-update/",
  planTechnicalBankUpdate:
    "https://mahadevaaya.com/govbillingsystem/backend/api/kisan-plan-technical-bank-update/",
  documentsUpdate:
    "https://mahadevaaya.com/govbillingsystem/backend/api/kisan-application-documents-update/",
};

const API_TO_HI = {
  gender: { Male: "पुरुष", Female: "महिला", Other: "अन्य" },
  category: {
    General: "सामान्य",
    Scheduled: "अनुसूचित",
    SC: "अनुसूचित",
    ST: "अनुसूचित",
    Small: "लघु कृषक",
    Marginal: "सीमांत कृषक",
    Other: "अन्य",
  },
  irrigation: { Yes: "हाँ", No: "नहीं" },
  prop_area_unit: { Nali: "नाली", Hectare: "हेक्टेयर", Acre: "एकड़" },
  slope: {
    Flat: "समतल",
    Mild: "हल्का ढाल",
    Moderate: "मध्यम ढाल",
    Steep: "तीव्र ढाल",
  },
  soil: {
    Loamy: "दोमट",
    Loam: "दोमट",
    Loamyu: "दोमट",
    SandyLoam: "बलुई दोमट",
    ClayLoam: "चिकनी दोमट",
    Sandy: "बलुई",
  },
  plan_type: { Individual: "व्यक्तिगत", Group: "समूह" },
  execution: {
    Self: "स्वयं कार्य करने पर",
    Department: "विभागीय पंजीकृत फर्म के माध्यम से",
  },
};

const HI_TO_API = {
  gender: { पुरुष: "Male", महिला: "Female", अन्य: "Other" },
  category: {
    सामान्य: "General",
    अनुसूचित: "Scheduled",
    "लघु कृषक": "Small",
    "सीमांत कृषक": "Marginal",
    अन्य: "Other",
  },
  irrigation: { हाँ: "Yes", नहीं: "No" },
  prop_area_unit: { नाली: "Nali", हेक्टेयर: "Hectare", एकड़: "Acre" },
  slope: {
    समतल: "Flat",
    "हल्का ढाल": "Mild",
    "मध्यम ढाल": "Moderate",
    "तीव्र ढाल": "Steep",
  },
  plan_type: { व्यक्तिगत: "Individual", समूह: "Group" },
  execution: {
    "स्वयं कार्य करने पर": "Self",
    "विभागीय पंजीकृत फर्म के माध्यम से": "Department",
  },
};


const DOC_TO_API = {
  "अद्यतन खतौनी की प्रति": "Land Ownership Document",
  "अद्यतन खतौनी (06 माह के भीतर) की प्रति": "Land Ownership Document",
  "पहचान पत्र (आधार कार्ड)": "Aadhaar Card",
  "उद्यान कार्ड": "Udyan Card",
  "बैंक पासबुक की प्रति": "Bank Passbook",
  "₹10/- का शपथ पत्र": "Affidavit",
  "कार्य प्रारम्भ से पूर्व प्रस्तावित स्थल का जियो-टैग फोटो": "Geo-tagged Site Photo",
  "समूह का पंजीकरण प्रमाण पत्र (यदि समूह हो)": "Group Registration Certificate",
};

const API_TO_DOC = Object.fromEntries(
  Object.entries(DOC_TO_API).map(([hi, en]) => [en, hi]),
);

const IRR_TO_API = {
  पाइपलाइन: "Pipeline",
  "पानी की टंकी": "Water Tank",
  नहर: "Canal",
  बोरिंग: "Boring",
  अन्य: "Other",
};

const API_TO_IRR = Object.fromEntries(
  Object.entries(IRR_TO_API).map(([hi, en]) => [en, hi]),
);

function apiJsonValue(value) {
  return value === "" || value === undefined ? null : value;
}

function buildPersonalLandPayload(data) {
  return {
    name: apiJsonValue(data.name),
    gender: HI_TO_API.gender[data.gender] || data.gender || null,
    father: apiJsonValue(data.father),
    udyan_card: apiJsonValue(data.udyanCard),
    village: apiJsonValue(data.village),
    post: apiJsonValue(data.post),
    block: apiJsonValue(data.block),
    district: apiJsonValue(data.district),
    mobile: apiJsonValue(data.mobile),
    aadhaar: apiJsonValue(data.aadhaar),
    category: HI_TO_API.category[data.category] || data.category || null,
    total_land: data.totalLand === "" ? null : Number(data.totalLand),
    prop_area_val: data.propArea_val === "" ? null : Number(data.propArea_val),
    prop_area_unit:
      HI_TO_API.prop_area_unit[data.propArea_unit] || data.propArea_unit || null,
    irrigation: HI_TO_API.irrigation[data.irrigation] || data.irrigation || null,
    irrigation_sources: (data.irrSource || []).map(
      (item) => IRR_TO_API[item] || item,
    ),
    irrigation_other: apiJsonValue(data.irrOther),
    altitude: data.altitude === "" ? null : Number(data.altitude),
    road_dist: data.roadDist === "" ? null : Number(data.roadDist),
    slope: HI_TO_API.slope[data.slope] || data.slope || null,
    soil: data.soil || null,
    latitude: data.lat === "" ? null : Number(data.lat),
    longitude: data.lng === "" ? null : Number(data.lng),
  };
}

function buildPlanTechnicalBankPayload(data) {
  let subsidyRatio = data.subsidyRatio || "";
  if (subsidyRatio.startsWith("80%")) subsidyRatio = "80%";
  else if (subsidyRatio.startsWith("50%")) subsidyRatio = "50%";

  let fencingType = data.fencingType || "";
  if (fencingType === "चेन लिंक फेंसिंग") fencingType = "Chain Link";
  if (fencingType === "कांटेदार तार की बाड़") fencingType = "Barbed Wire";

  return {
    form_id: data.formId || undefined,
    plan_scheme: apiJsonValue(data.planScheme),
    cost_per_ha:
      data.costPerHa !== "" && data.costPerHa !== undefined
        ? Number(data.costPerHa)
        : null,
    plan_type: HI_TO_API.plan_type[data.planType] || data.planType || null,
    group_name: apiJsonValue(data.groupName),
    contribution: apiJsonValue(data.contribution),
    other_scheme: apiJsonValue(data.otherScheme),
    fencing_type: apiJsonValue(fencingType),
    subsidy_ratio: apiJsonValue(subsidyRatio),
    execution: HI_TO_API.execution[data.execution] || data.execution || null,
    firm_name: apiJsonValue(data.firmName),
    technical_standard_accepted: !!data.accept,
    bank_name: apiJsonValue(data.bankName),
    branch: apiJsonValue(data.branch),
    account: apiJsonValue(data.account),
    ifsc: apiJsonValue(data.ifsc),
  };
}

function buildDocumentsPayload(data, formId) {
  return {
    form_id: formId,
    place: apiJsonValue(data.place),
    application_date: data.date || null,
    documents: (data.docs || []).map(
      (item) => DOC_TO_API[item] || item,
    ),
    photo: null,
    declaration_accepted: !!data.declare,
  };
}

async function apiRequest(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    const message =
      body?.message ||
      body?.error ||
      body?.detail ||
      `API request failed (${response.status})`;
    throw new Error(message);
  }

  return body;
}

function applicationFromApi(record) {
  const p = record?.personal || record || {};
  const t = record?.plan_technical_bank || {};
  const d = record?.application_documents || {};

  const irrigationSources = Array.isArray(p.irrigation_sources)
    ? p.irrigation_sources.map((x) => API_TO_IRR[x] || x)
    : [];

  return {
    name: p.name || "",
    gender: API_TO_HI.gender[p.gender] || p.gender || "",
    father: p.father || "",
    udyanCard: p.udyan_card || "",
    village: p.village || "",
    post: p.post || "",
    block: p.block || "",
    district: p.district || "",
    mobile: p.mobile || "",
    aadhaar: p.aadhaar || "",
    category: API_TO_HI.category[p.category] || p.category || "",
    totalLand: p.total_land ?? "",
    propArea_val: p.prop_area_val ?? "",
    propArea_unit:
      API_TO_HI.prop_area_unit[p.prop_area_unit] || p.prop_area_unit || "नाली",
    irrigation: API_TO_HI.irrigation[p.irrigation] || p.irrigation || "",
    irrSource: irrigationSources,
    irrOther: p.irrigation_other || "",
    altitude: p.altitude ?? "",
    roadDist: p.road_dist ?? "",
    slope: API_TO_HI.slope[p.slope] || p.slope || "",
    soil: API_TO_HI.soil[p.soil] || p.soil || "",
    lat: p.latitude ?? "",
    lng: p.longitude ?? "",
    planScheme: t.plan_scheme || "",
    costPerHa: t.cost_per_ha ?? "",
    planType: API_TO_HI.plan_type[t.plan_type] || t.plan_type || "",
    groupName: t.group_name || "",
    contribution: t.contribution || "",
    otherScheme: t.other_scheme || "",
    fencingType:
      t.fencing_type === "Chain Link"
        ? "चेन लिंक फेंसिंग"
        : t.fencing_type === "Barbed Wire"
          ? "कांटेदार तार की बाड़"
          : t.fencing_type || "",
    subsidyRatio: t.subsidy_ratio
      ? `${t.subsidy_ratio} राजसहायता`
      : "",
    execution: API_TO_HI.execution[t.execution] || t.execution || "",
    firmName: t.firm_name || "",
    bankName: t.bank_name || "",
    branch: t.branch || "",
    account: t.account || "",
    ifsc: t.ifsc || "",
    place: d.place || "",
    date: d.application_date || initialData.date,
    docs: Array.isArray(d.documents)
      ? d.documents.map((item) => API_TO_DOC[item] || item)
      : [],
    photo: d.photo || "",
    accept: !!t.technical_standard_accepted,
    declare: !!d.declaration_accepted,
  };
}


const stepTitles = {
  scheme: "योजना एवं फेंसिंग का प्रकार",
  personal: "कृषक का विवरण",
  land: "भूमि एवं भौगोलिक स्थिति",
  bank: "बैंक विवरण",
  planbank: "योजना एवं बैंक विवरण",
  technical: "कार्यनिष्पादन एवं तकनीकी मानक",
  docs: "संलग्न दस्तावेज़",
  declaration: "घोषणा",
};

function rupees(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
function toNali(data) {
  const v = parseFloat(data.propArea_val);
  if (!v || v <= 0) return 0;
  if (data.propArea_unit === "हेक्टेयर") return v / NALI_HA;
  if (data.propArea_unit === "एकड़") return v * NALI_ACRE;
  return v;
}
function escName(gender) {
  if (gender === "महिला") return "करती हूँ";
  if (gender === "अन्य") return "करता/करती हूँ";
  return "करता हूँ";
}
function calculate(scheme, data) {
  const nali = toNali(data),
    acre = nali / NALI_ACRE,
    ha = nali * NALI_HA;
  const perHa = scheme.costPerHa || Number(data.costPerHa || 0);
  let subPct = scheme.farmerShare ? 100 - scheme.farmerShare : null;
  if (scheme === SCHEMES.fencing) {
    if (!data.subsidyRatio) subPct = null;
    else subPct = data.subsidyRatio.startsWith("50%") ? 50 : 80;
  }
  const cost =
    ha && perHa && subPct != null
      ? {
          ha,
          perHa,
          total: ha * perHa,
          sub: (ha * perHa * subPct) / 100,
          farmer: (ha * perHa * (100 - subPct)) / 100,
          subPct,
        }
      : null;
  const rows = nali
    ? [
        [
          "क्षेत्रफल",
          `${acre.toFixed(2)} एकड़ / ${ha.toFixed(3)} हे0 / ${nali.toFixed(1)} नाली`,
        ],
      ]
    : [];
  if (nali && scheme === SCHEMES.kiwi) {
    const main = Math.round(167 * acre),
      back = Math.round(41 * acre);
    rows.push(
      ["कुल पौधे", (main + back).toLocaleString("en-IN")],
      [
        "मुख्य + बैकअप",
        `${main.toLocaleString("en-IN")} + ${back.toLocaleString("en-IN")}`,
      ],
      [
        "मादा : नर",
        `${Math.round(main * 0.9).toLocaleString("en-IN")} : ${(main - Math.round(main * 0.9)).toLocaleString("en-IN")}`,
      ],
    );
  }
  if (nali && scheme === SCHEMES.dragon)
    rows.push(
      ["RCC पिलर", Math.round(666 * acre).toLocaleString("en-IN")],
      ["कुल पौधे", Math.round(2667 * acre).toLocaleString("en-IN")],
    );
  if (nali && scheme === SCHEMES.fencing) {
    const perimeter = Math.round(4 * Math.sqrt(ha * 10000));
    rows.push(["अनुमानित परिधि", `${perimeter.toLocaleString("en-IN")} मीटर`]);
    if (data.fencingType === "कांटेदार तार की बाड़")
      rows.push(
        ["खम्भे", Math.ceil(perimeter / 2.5).toLocaleString("en-IN")],
        ["कांटेदार तार", `${(perimeter * 5).toLocaleString("en-IN")} मीटर`],
      );
    else
      rows.push(
        ["लोहे के खम्भे", Math.ceil(perimeter / 3).toLocaleString("en-IN")],
        [
          "जी.आई. जाली",
          `${Math.round(perimeter * 1.5).toLocaleString("en-IN")} वर्ग मीटर`,
        ],
      );
  }
  return { nali, rows, cost };
}

function SchemeIcon({ type }) {
  return (
    <span className="scheme-icon">
      {type === "kiwi" ? "🥝" : type === "dragon" ? "🌵" : "🛡️"}
    </span>
  );
}
function Field({ label, required, children, hint, error }) {
  return (
    <div className={`field ${error ? "field-error" : ""}`}>
      {label && (
        <label className="lbl">
          {label}
          {required && <span className="req"> *</span>}
        </label>
      )}
      {children}
      {hint && <div className="hint">{hint}</div>}
      {error && <div className="errmsg">यह जानकारी भरना ज़रूरी है</div>}
    </div>
  );
}
function TextInput({ data, set, k, type = "text", step, placeholder }) {
  return (
    <input
      className="control"
      type={type}
      value={data[k] ?? ""}
      step={step}
      placeholder={placeholder}
      onChange={(e) => set(k, e.target.value)}
    />
  );
}
function Radio({ data, set, k, options }) {
  return (
    <div className="opts">
      {options.map((o) => (
        <label className="opt" key={o}>
          <input
            type="radio"
            name={k}
            checked={data[k] === o}
            onChange={() => set(k, o)}
          />
          {o}
        </label>
      ))}
    </div>
  );
}
function Select({ data, set, k, options }) {
  return (
    <select
      className="control"
      value={data[k] ?? ""}
      onChange={(e) => set(k, e.target.value)}
    >
      <option value="">— चुनें —</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}
function Ledger({ calc, scheme }) {
  if (!calc.nali) return null;
  return (
    <div className="ledger">
      <div className="lhead">आपके क्षेत्रफल पर विभागीय मानक</div>
      <div className="lbody">
        {calc.rows.map(([a, b]) => (
          <div className="lrow" key={a}>
            <span>{a}</span>
            <b>{b}</b>
          </div>
        ))}
      </div>
      <div className="lfoot">
        अनुमानित गणना — अंतिम स्वीकृति विभागीय निरीक्षण के बाद।
        {scheme.farmerShare
          ? ` कृषक अंश ${scheme.farmerShare}% सीधे फर्म को देय हो सकता है।`
          : ""}
      </div>
    </div>
  );
}
function CostBox({ calc, scheme }) {
  if (!calc.cost)
    return (
      <div className="ledger">
        <div className="lhead">लागत एवं राजसहायता</div>
        <div className="lbody">
          <div className="lrow">
            <span>क्षेत्रफल और योजना लागत भरें</span>
            <b>—</b>
          </div>
        </div>
      </div>
    );
  const c = calc.cost;
  return (
    <div className="ledger">
      <div className="lhead">लागत एवं राजसहायता</div>
      <div className="lbody">
        <div className="lrow">
          <span>प्रति हेक्टेयर योजना लागत</span>
          <b>{rupees(c.perHa)}</b>
        </div>
        <div className="lrow">
          <span>क्षेत्रफल</span>
          <b>{c.ha.toFixed(3)} हे0</b>
        </div>
        <div className="lrow">
          <span>कुल लागत</span>
          <b>{rupees(c.total)}</b>
        </div>
        <div className="lrow">
          <span>राजसहायता ({c.subPct}%)</span>
          <b>{rupees(c.sub)}</b>
        </div>
        <div className="lrow">
          <span>कृषक अंश ({100 - c.subPct}%)</span>
          <b>{rupees(c.farmer)}</b>
        </div>
      </div>
      <div className="lfoot">
        राजसहायता प्रति हेक्टेयर लागत पर आनुपातिक रूप से देय। स्वीकृत मानक से
        अधिक व्यय कृषक द्वारा स्वयं वहन किया जाएगा।
      </div>
    </div>
  );
}


const PRINT_LABELS = {
  planScheme: "योजना का नाम",
  fencingType: "फेंसिंग का प्रकार",
  subsidyRatio: "राजसहायता अनुपात",
  name: "कृषक का नाम",
  gender: "लिंग",
  father: "पिता / पति का नाम",
  udyanCard: "उद्यान कार्ड संख्या",
  village: "ग्राम",
  post: "पोस्ट",
  block: "विकासखंड (ब्लॉक)",
  district: "जनपद",
  mobile: "मोबाइल नम्बर",
  aadhaar: "आधार संख्या",
  category: "कृषक की श्रेणी",
  totalLand: "कुल भूमि (हेक्टेयर)",
  propArea_val: "प्रस्तावित क्षेत्रफल",
  propArea_unit: "क्षेत्रफल इकाई",
  irrigation: "भूमि पर सिंचाई सुविधा",
  irrSource: "सिंचाई स्रोत",
  irrOther: "अन्य सिंचाई स्रोत",
  altitude: "ऊँचाई (मीटर)",
  roadDist: "मुख्य सड़क से दूरी",
  slope: "भूमि की ढाल",
  soil: "मृदा प्रकार",
  lat: "अक्षांश (Latitude)",
  lng: "देशांतर (Longitude)",
  costPerHa: "प्रति हेक्टेयर योजना लागत",
  planType: "आवेदन का प्रकार",
  groupName: "समूह का नाम",
  contribution: "अन्य योजना से सहायता",
  otherScheme: "अन्य योजना का नाम",
  execution: "कार्यनिष्पादन का माध्यम",
  firmName: "चयनित फर्म का नाम",
  bankName: "बैंक का नाम",
  branch: "शाखा",
  account: "बैंक खाता संख्या",
  ifsc: "IFSC कोड",
  place: "स्थान",
  date: "दिनांक",
};

function printValue(key, value) {
  if (Array.isArray(value)) return value.join(", ");
  if (key === "costPerHa" && value) return rupees(Number(value));
  if (key === "date" && value) {
    const [y, m, d] = String(value).split("-");
    return y && m && d ? `${d}-${m}-${y}` : value;
  }
  return String(value);
}

function PrintableApplication({ scheme, data, calc, appNo, preview = false }) {
  if (!scheme) return null;

  const excluded = new Set(["photo", "docs", "irrSource", "accept", "declare"]);
  const rows = [];
  Object.entries(data).forEach(([key, value]) => {
    if (excluded.has(key) || value === "" || value === false || value == null) return;
    if (!PRINT_LABELS[key]) return;
    rows.push([PRINT_LABELS[key], printValue(key, value)]);
  });

  if (data.irrSource?.length) {
    rows.push(["सिंचाई स्रोत", data.irrSource.join(", ")]);
  }

  const standards =
    scheme === SCHEMES.fencing && data.fencingType === "कांटेदार तार की बाड़"
      ? scheme.barbed
      : scheme.standards;

  const calculatedRows = calc?.rows || [];
  const cost = calc?.cost;
  const nali = calc?.nali || 0;

  return (
    <div className={`print-document ${preview ? "print-document-preview" : ""}`}>
      <div className="print-page">
        <div className="print-top">
          <div className="print-app-no">आवेदन क्रमांक: {appNo}</div>
          <div className="print-photo">
            {data.photo ? (
              <img src={data.photo} alt="कृषक" />
            ) : (
              <>फोटो<br />प्रभारी द्वारा<br />सत्यापित</>
            )}
          </div>
        </div>

        <h1 className="print-title">{scheme.full}</h1>
        <div className="print-department">उद्यान एवं खाद्य प्रसंस्करण विभाग</div>

        <table className="print-table print-details-table">
          <tbody>
            <tr>
              <td className="print-key">आवेदित योजना</td>
              <td>{scheme.name}</td>
            </tr>
            {rows.map(([label, value]) => (
              <tr key={`${label}-${value}`}>
                <td className="print-key">{label}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {nali > 0 && (
          <section className="print-section">
            <h2>क्षेत्रफल एवं मानकानुसार अनुमानित गणना</h2>
            <table className="print-table">
              <tbody>
                {calculatedRows.map(([label, value]) => (
                  <tr key={`calc-${label}`}>
                    <td className="print-key">{label}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {cost && (
          <section className="print-section">
            <h2>लागत एवं राजसहायता</h2>
            <table className="print-table">
              <tbody>
                <tr><td className="print-key">प्रति हेक्टेयर योजना लागत</td><td>{rupees(cost.perHa)}</td></tr>
                <tr><td className="print-key">प्रस्तावित क्षेत्रफल</td><td>{cost.ha.toFixed(3)} हेक्टेयर</td></tr>
                <tr><td className="print-key">कुल लागत</td><td>{rupees(cost.total)}</td></tr>
                <tr><td className="print-key">राजसहायता ({cost.subPct}%)</td><td>{rupees(cost.sub)}</td></tr>
                <tr><td className="print-key">कृषक अंश ({100 - cost.subPct}%)</td><td>{rupees(cost.farmer)}</td></tr>
              </tbody>
            </table>
            <p className="print-note">राजसहायता का निर्धारण प्रति हेक्टेयर लागत पर आनुपातिक (Pro-rata) रूप से किया जाएगा। स्वीकृत मानक से अधिक होने वाला व्यय कृषक द्वारा स्वयं वहन किया जाएगा तथा उस पर अतिरिक्त राजसहायता देय नहीं होगी।</p>
          </section>
        )}

        {standards?.length > 0 && (
          <section className="print-section print-avoid-break">
            <h2>तकनीकी मानकों एवं शर्तों की स्वीकारोक्ति</h2>
            <ul className="print-list">
              {standards.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <p className="print-note">{data.accept ? "☑ उपरोक्त मानक स्वीकार किए गए।" : "☐ उपरोक्त मानक स्वीकार किए गए।"}</p>
          </section>
        )}

        <section className="print-section print-avoid-break">
          <h2>संलग्न दस्तावेज़ों की सूची</h2>
          <ol className="print-list">
            {scheme.docs.map((doc) => (
              <li key={doc}>{data.docs?.includes(doc) ? "☑" : "☐"} {doc}</li>
            ))}
          </ol>
        </section>

        <section className="print-section print-avoid-break">
          <h2>घोषणा</h2>
          <p>मैं प्रमाणित {escName(data.gender)} कि उपरोक्त दी गई सभी जानकारी मेरी जानकारी में पूर्णतः सही है।</p>
          <p>मैं प्रमाणित {escName(data.gender)} कि कार्य के दौरान उपरोक्त तकनीकी मानकों का पालन अनिवार्यतः करूँगा/करूँगी।</p>
          <p className="print-check">{data.declare ? "☑" : "☐"} घोषणा स्वीकार की गई।</p>
        </section>

        <div className="print-signatures">
          <div>दिनांक: {printValue("date", data.date || "—")}<br />स्थान: {data.place || "—"}</div>
          <div>हस्ताक्षर ({data.gender === "महिला" ? "आवेदिका" : "आवेदक"}): ____________________</div>
        </div>

        <div className="print-officer">
          <b>प्रभारी की आख्या</b>
          <p>{scheme.officer || "स्थलीय निरीक्षण एवं विभागीय परीक्षण के उपरांत आख्या अंकित की जाएगी।"}</p>
          <div>हस्ताक्षर प्रभारी: ____________________</div>
        </div>
      </div>
    </div>
  );
}

export default function KisanAavedanPortal() {
  const [schemeId, setSchemeId] = useState(null);
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [formId, setFormId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const scheme = schemeId ? SCHEMES[schemeId] : null;
  const calc = useMemo(
    () =>
      scheme ? calculate(scheme, data) : { nali: 0, rows: [], cost: null },
    [scheme, data],
  );
  const appNo = useMemo(
    () =>
      formId ||
      (scheme
        ? `${scheme.code}/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`
        : ""),
    [schemeId, formId],
  );

  useEffect(() => {
    let cancelled = false;

    const loadDraftAndServerData = async () => {
      try {
        const raw = localStorage.getItem("udyan-aavedan:draft");
        if (!raw) return;

        const d = JSON.parse(raw);
        if (cancelled) return;

        if (d.schemeId && SCHEMES[d.schemeId]) {
          setSchemeId(d.schemeId);
          setStep(d.step || 0);
          setData(d.data || initialData);
          setFormId(d.formId || "");

          // If a server form already exists, GET the latest server data.
          if (d.formId) {
            try {
              const result = await apiRequest(
                `${KISAN_API.application}?form_id=${encodeURIComponent(d.formId)}`,
              );
              const records = Array.isArray(result?.data) ? result.data : [];
              const record =
                records.find((item) => item.form_id === d.formId) ||
                (result?.form_id === d.formId ? result : null);

              if (record && !cancelled) {
                setData((current) => ({
                  ...current,
                  ...applicationFromApi(record),
                }));
                setSubmittedApplication(record);
              }
            } catch (error) {
              // Keep the local draft if the server record cannot be loaded.
              console.warn("Kisan application GET failed:", error);
            }
          }
        }
      } catch (error) {
        console.warn("Unable to restore Kisan application draft:", error);
      }
    };

    loadDraftAndServerData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!schemeId) return;
    try {
      localStorage.setItem(
        "udyan-aavedan:draft",
        JSON.stringify({ schemeId, step, data, formId }),
      );
    } catch {}
  }, [schemeId, step, data, formId]);
  const set = (k, v) => {
    setData((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: false }));
  };
  const selectScheme = (id) => {
    if (
      schemeId &&
      schemeId !== id &&
      Object.keys(data).length > 2 &&
      !window.confirm("योजना बदलने पर भरा हुआ विवरण हट जाएगा। बदलें?")
    )
      return;
    setSchemeId(id);
    setStep(0);
    setData({ ...initialData });
    setErrors({});
    setFormId("");
    setApiError("");
    setSubmittedApplication(null);
  };
  const backToSchemes = () => {
    setSchemeId(null);
    setStep(0);
    setErrors({});
  };
  const visible = (f) =>
    !f.showIf ||
    (f.showIf.has
      ? (data[f.showIf.k] || []).includes(f.showIf.has)
      : f.showIf.any
        ? !!data[f.showIf.k]
        : data[f.showIf.k] === f.showIf.v);
  const validate = () => {
    const required = [];
    if (step === 0 && schemeId === "fencing")
      required.push("planScheme", "fencingType", "subsidyRatio");
    if (step === 1)
      required.push(
        "name",
        "gender",
        "father",
        "village",
        "block",
        "district",
        "mobile",
        "aadhaar",
        "category",
      );
    if (step === 2) required.push("totalLand", "propArea_val", "lat", "lng");
    if (step === 3 && schemeId === "fencing")
      required.push("bankName", "branch", "account", "ifsc");
    if (
      (step === 2 && schemeId !== "fencing") ||
      (step === 3 && schemeId === "fencing")
    ) {
    }
    if (schemeId !== "fencing" && step === 2)
      required.push("irrigation", "altitude", "roadDist", "slope", "soil");
    if (
      schemeId !== "fencing" &&
      step === 2 &&
      data.irrigation === "हाँ" &&
      !(data.irrSource || []).length
    )
      required.push("irrSource");
    if (schemeId !== "fencing" && step === 3)
      required.push(
        "planScheme",
        "planType",
        "contribution",
        "bankName",
        "branch",
        "account",
        "ifsc",
      );
    if (schemeId !== "fencing" && step === 3 && data.planType === "समूह")
      required.push("groupName");
    if (
      schemeId !== "fencing" &&
      step === 3 &&
      data.contribution === "अन्य योजना"
    )
      required.push("otherScheme");
    if (schemeId !== "fencing" && step === 4)
      required.push("execution", "accept");
    if (schemeId === "fencing" && step === 4) required.push("accept");
    if (schemeId === "fencing" && step === 6)
      required.push("place", "date", "declare");
    if (schemeId !== "fencing" && step === 5)
      required.push("place", "date", "declare");
    const e = {};
    required.forEach((k) => {
      if (!data[k] || (Array.isArray(data[k]) && !data[k].length)) e[k] = true;
    });
    if (
      data.mobile &&
      !/^[6-9]\d{9}$/.test(String(data.mobile).replace(/\D/g, ""))
    )
      e.mobile = true;
    if (
      data.aadhaar &&
      !/^\d{12}$/.test(String(data.aadhaar).replace(/\D/g, ""))
    )
      e.aadhaar = true;
    if (
      data.account &&
      !/^\d{9,18}$/.test(String(data.account).replace(/\s/g, ""))
    )
      e.account = true;
    if (
      data.ifsc &&
      !/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(String(data.ifsc).trim())
    )
      e.ifsc = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const submitApplication = async () => {
    if (!scheme || isSubmitting) return;

    setApiError("");
    setIsSubmitting(true);

    try {
      // 1) Create the base application and receive the server-generated form_id.
      let currentFormId = formId;
      if (!currentFormId) {
        const created = await apiRequest(KISAN_API.application, {
          method: "POST",
          body: JSON.stringify(buildPersonalLandPayload(data)),
        });

        currentFormId =
          created?.form_id ||
          created?.data?.[0]?.form_id ||
          created?.data?.form_id ||
          "";

        if (!currentFormId) {
          throw new Error("POST API ने form_id नहीं लौटाया।");
        }

        setFormId(currentFormId);
      }

      // 2) Update personal + land data using the dedicated PUT endpoint.
      await apiRequest(KISAN_API.personalLandUpdate, {
        method: "PUT",
        body: JSON.stringify({
          form_id: currentFormId,
          ...buildPersonalLandPayload(data),
        }),
      });

      // 3) Update plan + technical + bank data.
      await apiRequest(KISAN_API.planTechnicalBankUpdate, {
        method: "PUT",
        body: JSON.stringify({
          form_id: currentFormId,
          ...buildPlanTechnicalBankPayload(data),
        }),
      });

      // 4) Update documents + declaration.
      // Keep the JSON contract shown in the supplied API example.
      await apiRequest(KISAN_API.documentsUpdate, {
        method: "PUT",
        body: JSON.stringify(buildDocumentsPayload(data, currentFormId)),
      });

      // 5) GET the completed application so the UI always reflects server data.
      const result = await apiRequest(
        `${KISAN_API.application}?form_id=${encodeURIComponent(currentFormId)}`,
      );
      const records = Array.isArray(result?.data) ? result.data : [];
      const record =
        records.find((item) => item.form_id === currentFormId) ||
        (result?.form_id === currentFormId ? result : null);

      if (record) {
        const serverData = applicationFromApi(record);
        setData((current) => ({ ...current, ...serverData }));
        setSubmittedApplication(record);
      }

      localStorage.removeItem("udyan-aavedan:draft");
      setStep(scheme.steps.length);

      // Print only after every API operation has succeeded.
      window.setTimeout(() => print(), 150);
    } catch (error) {
      console.error("Kisan application submission failed:", error);
      setApiError(
        error?.message ||
          "आवेदन API पर जमा नहीं हो सका। कृपया पुनः प्रयास करें।",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const next = () => {
    if (validate()) setStep((s) => s + 1);
  };
  const gps = () => {
    if (!navigator.geolocation)
      return alert("इस ब्राउज़र में GPS उपलब्ध नहीं है।");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        set("lat", p.coords.latitude.toFixed(6));
        set("lng", p.coords.longitude.toFixed(6));
      },
      () => alert("लोकेशन नहीं मिली। ब्राउज़र में लोकेशन की अनुमति दें।"),
    );
  };
  const photo = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => set("photo", r.result);
    r.readAsDataURL(f);
  };
  /*
   * Reliable printing:
   * Do not depend on changing the current React page into a print-only
   * layout. Some Chromium print-preview versions can snapshot the page
   * before the React/CSS state change is painted, which can result in a
   * completely blank page.
   *
   * Instead, copy the already-rendered PrintableApplication into a
   * dedicated, same-origin print iframe and print that iframe. The
   * iframe receives the application's existing stylesheets, so all three
   * schemes (fencing, kiwi and dragon) use the exact same A4 structure.
   */
  const print = () => {
    const source = document.querySelector(
      ".print-document:not(.print-document-preview)"
    );

    if (!source) {
      window.alert("प्रिंट के लिए आवेदन तैयार नहीं है। कृपया पुनः प्रयास करें।");
      return;
    }

    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";

    document.body.appendChild(iframe);

    const printDocument = iframe.contentDocument;
    const printWindow = iframe.contentWindow;

    if (!printDocument || !printWindow) {
      iframe.remove();
      window.alert("प्रिंट विंडो तैयार नहीं हो सकी।");
      return;
    }

    const styles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((node) => {
        if (node.tagName.toLowerCase() === "link") {
          return `<link rel="stylesheet" href="${node.href}">`;
        }
        return `<style>${node.textContent || ""}</style>`;
      })
      .join("\n");

    const printableHtml = source.outerHTML
      .replace(/position:\s*absolute/gi, "position: static")
      .replace(/left:\s*-9999px/gi, "left: 0")
      .replace(/opacity:\s*0/gi, "opacity: 1")
      .replace(/z-index:\s*-1/gi, "z-index: 1");

    printDocument.open();
    printDocument.write(`<!doctype html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${scheme.full || "कृषक आवेदन पत्र"}</title>
  ${styles}
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }

    html,
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
      width: 100% !important;
      min-height: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .print-document {
      display: block !important;
      position: static !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: visible !important;
      opacity: 1 !important;
      visibility: visible !important;
      z-index: 1 !important;
      pointer-events: auto !important;
      background: #fff !important;
    }

    .print-page {
      display: block !important;
      visibility: visible !important;
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      padding: 12mm !important;
      box-sizing: border-box !important;
      background: #fff !important;
      color: #000 !important;
      box-shadow: none !important;
    }

    .print-document-preview {
      display: none !important;
    }

    .print-table tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .print-avoid-break {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    .print-photo img {
      display: block !important;
      max-width: 100% !important;
    }

    @media print {
      html,
      body {
        width: 100% !important;
        background: #fff !important;
      }

      .print-document {
        display: block !important;
      }
    }
  </style>
</head>
<body>
  ${printableHtml}
</body>
</html>`);
    printDocument.close();

    const finish = () => {
      window.setTimeout(() => iframe.remove(), 500);
    };

    const waitForImages = () => {
      const images = Array.from(printDocument.images || []);

      if (!images.length) {
        printWindow.focus();
        printWindow.print();
        finish();
        return;
      }

      let remaining = images.length;
      let done = false;

      const complete = () => {
        if (done) return;
        remaining -= 1;
        if (remaining > 0) return;
        done = true;
        printWindow.focus();
        printWindow.print();
        finish();
      };

      images.forEach((img) => {
        if (img.complete) {
          complete();
        } else {
          img.addEventListener("load", complete, { once: true });
          img.addEventListener("error", complete, { once: true });
        }
      });

      window.setTimeout(() => {
        if (done) return;
        done = true;
        printWindow.focus();
        printWindow.print();
        finish();
      }, 2500);
    };

    window.setTimeout(waitForImages, 300);
  };

  if (!scheme)
    return (
      <div className="kisan-page">
        <Header scheme={null} />
        <main className="portal">
          <div className="intro">
            <span className="eyebrow">उद्यान एवं खाद्य प्रसंस्करण विभाग</span>
            <h1>कृषक आवेदन पोर्टल</h1>
            <p>तीनों योजनाओं का आवेदन — एक ही जगह</p>
          </div>
          <div className="scheme-grid">
            {Object.entries(SCHEMES).map(([id, s]) => (
              <button
                className={`scheme-card s-${id}`}
                key={id}
                onClick={() => selectScheme(id)}
              >
                <SchemeIcon type={id} />
                <div>
                  <h3>{s.name}</h3>
                  <p>{s.blurb}</p>
                  <div className="tags">
                    {s.tags.map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="arrow">→</span>
              </button>
            ))}
          </div>
        </main>
      </div>
    );

  const total = scheme.steps.length,
    current = scheme.steps[step];
  return (
    <>
      <div className="kisan-page">
      <Header scheme={scheme} />
      <main className="portal">
        <div className="topline">
          <div>
            <span className="eyebrow">आवेदन क्रमांक</span>
            <b>{appNo}</b>
          </div>
          <button className="link-btn" onClick={backToSchemes}>
            योजना बदलें
          </button>
        </div>
        <div className="progress">
          <span>
            चरण {Math.min(step + 1, total)} / {total}
          </span>
          <div className="progressbar">
            <i style={{ width: `${((step + 1) / total) * 100}%` }} />
          </div>
        </div>
        {step < total ? (
          <section className="form-card">
            <div className="section-head">
              <div>
                <h2>{stepTitles[current]}</h2>
                <p>
                  {current === "personal"
                    ? "आधार कार्ड में जो नाम है, वही लिखें।"
                    : current === "land"
                      ? "क्षेत्रफल और भौगोलिक विवरण सही भरें।"
                      : "आवश्यक जानकारी भरें और आगे बढ़ें।"}
                </p>
              </div>
            </div>
            <div className="form-grid">{renderStep(current)}</div>
          </section>
        ) : (
          <Review />
        )}
        {apiError && (
          <div
            className="api-error"
            role="alert"
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 8,
              background: "#fff1f1",
              border: "1px solid #e0a0a0",
              color: "#a00000",
            }}
          >
            {apiError}
          </div>
        )}
        <div className="actions">
          <div className="save-line">
            {isSubmitting
              ? "आवेदन API पर जमा किया जा रहा है…"
              : formId
                ? `सर्वर पर सुरक्षित: ${formId}`
                : "विवरण इसी डिवाइस पर सुरक्षित"}
          </div>
          <div className="action-buttons">
            {step === 0 ? (
              <button className="btn ghost" onClick={backToSchemes}>
                योजना बदलें
              </button>
            ) : (
              <button
                className="btn ghost"
                onClick={() => setStep((s) => s - 1)}
              >
                पीछे
              </button>
            )}
            {step < total ? (
              <button className="btn" onClick={next}>
                {step === total - 1 ? "आवेदन देखें" : "आगे बढ़ें"}
              </button>
            ) : (
              <button
                className="btn"
                onClick={submitApplication}
                disabled={isSubmitting}
                type="button"
              >
                {isSubmitting ? "जमा हो रहा है…" : "आवेदन जमा करें एवं प्रिंट / PDF"}
              </button>
            )}
          </div>
        </div>
      </main>
      </div>
      <PrintableApplication
        scheme={scheme}
        data={data}
        calc={calc}
        appNo={appNo}
      />
    </>
  );

  function renderStep(type) {
    if (type === "scheme")
      return (
        <>
          <Field label="योजना का नाम" required error={errors.planScheme}>
            <Radio
              data={data}
              set={set}
              k="planScheme"
              options={["जिला योजना", "राज्य सेक्टर योजना"]}
            />
          </Field>
          <Field label="फेंसिंग का प्रकार" required error={errors.fencingType}>
            <Radio
              data={data}
              set={set}
              k="fencingType"
              options={["चेन लिंक फेंसिंग", "कांटेदार तार की बाड़"]}
            />
          </Field>
          <Field label="राजसहायता अनुपात" required error={errors.subsidyRatio}>
            <Radio
              data={data}
              set={set}
              k="subsidyRatio"
              options={[
                "80% राजसहायता : 20% कृषक अंश",
                "50% राजसहायता : 50% कृषक अंश",
              ]}
            />
          </Field>
          <CostBox calc={calc} scheme={scheme} />
        </>
      );
    if (type === "personal")
      return (
        <>
          <Field label="कृषक का नाम" required error={errors.name}>
            <TextInput data={data} set={set} k="name" />
          </Field>
          <Field label="लिंग" required error={errors.gender}>
            <Radio
              data={data}
              set={set}
              k="gender"
              options={["पुरुष", "महिला", "अन्य"]}
            />
          </Field>
          <Field label="पिता / पति का नाम" required error={errors.father}>
            <TextInput data={data} set={set} k="father" />
          </Field>
          <Field label="उद्यान कार्ड संख्या">
            <TextInput data={data} set={set} k="udyanCard" />
          </Field>
          <Field label="ग्राम" required error={errors.village}>
            <TextInput data={data} set={set} k="village" />
          </Field>
          <Field label="पोस्ट">
            <TextInput data={data} set={set} k="post" />
          </Field>
          <Field label="विकासखंड (ब्लॉक)" required error={errors.block}>
            <TextInput data={data} set={set} k="block" />
          </Field>
          <Field label="जनपद" required error={errors.district}>
            <TextInput data={data} set={set} k="district" />
          </Field>
          <Field
            label="मोबाइल नम्बर"
            required
            error={errors.mobile}
            hint="10 अंक, बिना +91"
          >
            <TextInput data={data} set={set} k="mobile" type="tel" />
          </Field>
          <Field
            label="आधार संख्या"
            required
            error={errors.aadhaar}
            hint="12 अंक"
          >
            <TextInput data={data} set={set} k="aadhaar" inputMode="numeric" />
          </Field>
          <Field label="कृषक की श्रेणी" required error={errors.category}>
            <Radio
              data={data}
              set={set}
              k="category"
              options={
                scheme === SCHEMES.fencing ? ["सामान्य", "अनुसूचित"] : CAT_SM
              }
            />
          </Field>
          <Field label="पासपोर्ट साइज़ फोटो">
            <div className="photo-row">
              <div className="photo-preview">
                {data.photo ? (
                  <img src={data.photo} alt="कृषक" />
                ) : (
                  <>
                    फोटो
                    <br />
                    बॉक्स
                  </>
                )}
              </div>
              <input type="file" accept="image/*" onChange={photo} />
            </div>
          </Field>
        </>
      );
    if (type === "land")
      return (
        <>
          <Field
            label="कुल भूमि (हेक्टेयर में)"
            required
            error={errors.totalLand}
          >
            <TextInput
              data={data}
              set={set}
              k="totalLand"
              type="number"
              step="0.01"
            />
          </Field>
          <Field
            label="प्रस्तावित क्षेत्रफल"
            required
            error={errors.propArea_val}
          >
            <div className="area-wrap">
              <TextInput
                data={data}
                set={set}
                k="propArea_val"
                type="number"
                step="0.01"
              />
              <Select
                data={data}
                set={set}
                k="propArea_unit"
                options={["नाली", "हेक्टेयर", "एकड़"]}
              />
            </div>
            <div className="hint">1 एकड़ = 20 नाली = 0.40 हेक्टेयर</div>
            <Ledger calc={calc} scheme={scheme} />
            <CostBox calc={calc} scheme={scheme} />
          </Field>
          {scheme !== SCHEMES.fencing && (
            <>
              <Field
                label="भूमि पर सिंचाई सुविधा उपलब्ध है?"
                required
                error={errors.irrigation}
              >
                <Radio
                  data={data}
                  set={set}
                  k="irrigation"
                  options={["हाँ", "नहीं"]}
                />
              </Field>
              {data.irrigation === "हाँ" && (
                <Field label="सिंचाई स्रोत" required error={errors.irrSource}>
                  <div className="opts">
                    {IRR.map((o) => (
                      <label className="opt" key={o}>
                        <input
                          type="checkbox"
                          checked={(data.irrSource || []).includes(o)}
                          onChange={(e) =>
                            set(
                              "irrSource",
                              e.target.checked
                                ? [...(data.irrSource || []), o]
                                : (data.irrSource || []).filter((x) => x !== o),
                            )
                          }
                        />
                        {o}
                      </label>
                    ))}
                  </div>
                </Field>
              )}
              {data.irrigation === "हाँ" &&
                (data.irrSource || []).includes("अन्य") && (
                  <Field label="अन्य स्रोत का नाम">
                    <TextInput data={data} set={set} k="irrOther" />
                  </Field>
                )}
              <Field
                label="भूमि की ऊँचाई (मीटर में)"
                required
                error={errors.altitude}
              >
                <TextInput data={data} set={set} k="altitude" type="number" />
              </Field>
              <Field
                label="मुख्य मार्ग से दूरी (किलोमीटर)"
                required
                error={errors.roadDist}
              >
                <TextInput
                  data={data}
                  set={set}
                  k="roadDist"
                  type="number"
                  step="0.1"
                />
              </Field>
              <Field
                label="प्रस्तावित भूमि का ढाल"
                required
                error={errors.slope}
              >
                <Select
                  data={data}
                  set={set}
                  k="slope"
                  options={["समतल", "हल्का ढाल", "मध्यम ढाल", "तीव्र ढाल"]}
                />
              </Field>
              <Field label="मृदा का प्रकार" required error={errors.soil}>
                <Select
                  data={data}
                  set={set}
                  k="soil"
                  options={["दोमट", "बलुई दोमट", "चिकनी दोमट", "बलुई", "अन्य"]}
                />
              </Field>
            </>
          )}
          <Field label="अक्षांश (Latitude)" required error={errors.lat}>
            <TextInput data={data} set={set} k="lat" />
          </Field>
          <Field label="देशांतर (Longitude)" required error={errors.lng}>
            <TextInput data={data} set={set} k="lng" />
          </Field>
          <button className="btn gps" type="button" onClick={gps}>
            📍 मेरी वर्तमान लोकेशन भरें
          </button>
        </>
      );
    if (type === "bank") return <BankFields />;
    if (type === "planbank")
      return (
        <>
          <Field label="योजना का नाम" required error={errors.planScheme}>
            <Radio
              data={data}
              set={set}
              k="planScheme"
              options={["जिला योजना", "राज्य सेक्टर योजना"]}
            />
          </Field>
          <Field label="प्रति हेक्टेयर योजना लागत (₹)">
            <TextInput data={data} set={set} k="costPerHa" type="number" />
          </Field>
          <CostBox calc={calc} scheme={scheme} />
          <Field label="योजना श्रेणी" required error={errors.planType}>
            <Radio
              data={data}
              set={set}
              k="planType"
              options={["व्यक्तिगत", "समूह"]}
            />
          </Field>
          {data.planType === "समूह" && (
            <Field label="समूह का नाम" required error={errors.groupName}>
              <TextInput data={data} set={set} k="groupName" />
            </Field>
          )}
          <Field
            label="अंशदान की व्यवस्था"
            required
            error={errors.contribution}
          >
            <Radio
              data={data}
              set={set}
              k="contribution"
              options={["स्वयं", "ऋण", "अन्य योजना"]}
            />
          </Field>
          {data.contribution === "अन्य योजना" && (
            <Field
              label="अन्य योजना का नाम"
              required
              error={errors.otherScheme}
            >
              <TextInput data={data} set={set} k="otherScheme" />
            </Field>
          )}
          <BankFields />
        </>
      );
    if (type === "technical")
      return (
        <>
          <Field
            label="कार्य कैसे कराया जाएगा"
            required
            error={errors.execution}
          >
            <Radio
              data={data}
              set={set}
              k="execution"
              options={[
                "स्वयं कार्य करने पर",
                "विभागीय पंजीकृत फर्म के माध्यम से",
              ]}
            />
          </Field>
          {data.execution === "विभागीय पंजीकृत फर्म के माध्यम से" && (
            <Field label="चयनित फर्म का नाम">
              <TextInput data={data} set={set} k="firmName" />
            </Field>
          )}
          <div className="standards">
            <h3>तकनीकी मानक</h3>
            <ul>
              {(scheme === SCHEMES.fencing &&
              data.fencingType === "कांटेदार तार की बाड़"
                ? scheme.barbed
                : scheme.standards
              ).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <Ledger calc={calc} scheme={scheme} />
          <CostBox calc={calc} scheme={scheme} />
          <Field error={errors.accept}>
            <label className="declare">
              <input
                type="checkbox"
                checked={!!data.accept}
                onChange={(e) => set("accept", e.target.checked)}
              />
              <span className="declare-text">
                मैं प्रमाणित {escName(data.gender)} कि कार्य के दौरान उपरोक्त
                तकनीकी मानकों का पालन अनिवार्यतः करूँगा/करूँगी।
              </span>
            </label>
          </Field>
        </>
      );
    if (type === "docs")
      return (
        <div className="docs">
          <p>जो दस्तावेज़ तैयार हैं उन पर निशान लगाएँ।</p>
          {scheme.docs.map((d) => (
            <label className="doc" key={d}>
              <input
                type="checkbox"
                checked={(data.docs || []).includes(d)}
                onChange={(e) =>
                  set(
                    "docs",
                    e.target.checked
                      ? [...(data.docs || []), d]
                      : (data.docs || []).filter((x) => x !== d),
                  )
                }
              />
              <span className="doc-text">{d}</span>
            </label>
          ))}
        </div>
      );
    return (
      <>
        <Field label="स्थान" required error={errors.place}>
          <TextInput data={data} set={set} k="place" />
        </Field>
        <Field label="दिनांक" required error={errors.date}>
          <TextInput data={data} set={set} k="date" type="date" />
        </Field>
        <div className="declare-block">
          <Field error={errors.declare}>
            <label className="declare">
              <input
                type="checkbox"
                checked={!!data.declare}
                onChange={(e) => set("declare", e.target.checked)}
              />
              <span className="declare-text">
                मैं प्रमाणित {escName(data.gender)} कि उपरोक्त दी गई सभी जानकारी
                मेरी जानकारी में पूर्णतः सही है।
              </span>
            </label>
          </Field>
        </div>
      </>
    );
  }
  function BankFields() {
    return (
      <>
        {[
          ["bankName", "बैंक का नाम"],
          ["branch", "शाखा"],
        ].map(([k, l]) => (
          <Field label={l} required error={errors[k]} key={k}>
            <TextInput data={data} set={set} k={k} />
          </Field>
        ))}
        <Field label="खाता संख्या" required error={errors.account}>
          <TextInput data={data} set={set} k="account" type="text" />
        </Field>
        <Field label="IFSC कोड" required error={errors.ifsc}>
          <TextInput data={data} set={set} k="ifsc" />
        </Field>
      </>
    );
  }
  function Review() {
    const missing = scheme.docs.filter((d) => !(data.docs || []).includes(d));
    return (
      <section className="form-card review">
        <div className="section-head">
          <div>
            <h2>आवेदन की समीक्षा</h2>
            <p>प्रिंट करने से पहले विवरण जाँच लें।</p>
          </div>
        </div>
        <div className="review-grid">
          {Object.entries(data)
            .filter(
              ([k, v]) =>
                v !== "" &&
                v !== false &&
                k !== "photo" &&
                k !== "docs" &&
                k !== "irrSource",
            )
            .map(([k, v]) => (
              <div className="revrow" key={k}>
                <span>{k}</span>
                <b>{Array.isArray(v) ? v.join(", ") : String(v)}</b>
              </div>
            ))}
        </div>
        <Ledger calc={calc} scheme={scheme} />
        <CostBox calc={calc} scheme={scheme} />
        <div className="docs-summary">
          <b>
            दस्तावेज़: {data.docs?.length || 0}/{scheme.docs.length}
          </b>
          {missing.length > 0 && <p>{missing.join(" · ")}</p>}
        </div>
        <div className="print-preview-box">
          <div className="print-preview-heading">
            <div>
              <b>पूरा आवेदन (जैसा छपेगा)</b>
              <span>नीचे वही A4 संरचना है जो Print / PDF में जाएगी।</span>
            </div>
          </div>
          <PrintableApplication
            scheme={scheme}
            data={data}
            calc={calc}
            appNo={appNo}
            preview
          />
        </div>
      </section>
    );
  }
}

function Header({ scheme }) {
  return (
    <header
      className={`portal-header ${scheme ? `theme-${scheme.code.toLowerCase()}` : ""}`}
    >
      <div>
        <div className="brand">🌱 कृषक आवेदन पोर्टल</div>
        <div className="subtitle">
          {scheme ? scheme.name : "तीनों योजनाओं का आवेदन — एक ही जगह"}
        </div>
      </div>
    </header>
  );
}