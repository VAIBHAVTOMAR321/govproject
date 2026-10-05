// Admin print preview — फेंसिंग / घेरबाड़ documents.
// Mirrors the print documents produced by src/componets/kishanavedan/KisanAavedanPortal.js
// (buildFencingApplication + buildFencingAffidavit + buildBill), but reads the
// data straight from the API record instead of the portal's live form state.

import { esc, fmt0, fmtN, num, roField, roSelect, words } from "./adminPrintCommon";

const DISTRICT_NAME = "पौड़ी गढ़वाल";

const GENDER_BACK = { male: "पुरुष", पुरुष: "पुरुष", female: "महिला", महिला: "महिला" };
const CAT_BACK = { general: "सामान्य", सामान्य: "सामान्य", obc: "OBC", sc: "SC", st: "ST", female: "महिला" };
const FARMER_BACK = {
  "small farmer": "लघु",
  small: "लघु",
  लघु: "लघु",
  marginal: "सीमांत",
  "border farmer": "सीमांत",
  सीमांत: "सीमांत",
  other: "अन्य",
  अन्य: "अन्य",
};
const MAT_BACK = {
  "chain link": "चेनलिंक जाली",
  chainlink: "चेनलिंक जाली",
  "चेनलिंक जाली": "चेनलिंक जाली",
  "barbed wire": "कंटीले तार (बार्बड वायर)",
  barbedwire: "कंटीले तार (बार्बड वायर)",
  "कंटीले तार": "कंटीले तार (बार्बड वायर)",
  "कंटीले तार (बार्बड वायर)": "कंटीले तार (बार्बड वायर)",
};

const matchValue = (map, value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  const key = String(value).trim().toLowerCase();
  if (map[key]) return map[key];
  const hit = Object.keys(map).find((candidate) => candidate.length > 2 && key.indexOf(candidate) === 0);
  return hit ? map[hit] : value;
};

const FENCE_AREA_MAP = [
  { nali: 10, hec: 0.2, len: 240, poles: 81 },
  { nali: 15, hec: 0.3, len: 260, poles: 87 },
  { nali: 20, hec: 0.4, len: 280, poles: 94 },
  { nali: 25, hec: 0.5, len: 300, poles: 101 },
  { nali: 30, hec: 0.6, len: 320, poles: 107 },
  { nali: 35, hec: 0.7, len: 340, poles: 114 },
  { nali: 40, hec: 0.8, len: 360, poles: 121 },
  { nali: 45, hec: 0.9, len: 380, poles: 127 },
  { nali: 50, hec: 1.0, len: 400, poles: 134 },
  { nali: 60, hec: 1.2, len: 440, poles: 147 },
  { nali: 70, hec: 1.4, len: 480, poles: 161 },
  { nali: 80, hec: 1.6, len: 520, poles: 174 },
  { nali: 90, hec: 1.8, len: 560, poles: 187 },
  { nali: 100, hec: 2.0, len: 600, poles: 201 },
];

export const normalizeFenceMap = (rows) => {
  const list = (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      nali: num(row.land_nali),
      hec: num(row.area_hectare),
      len: num(row.permissible_length),
      poles: num(row.pillars),
    }))
    .filter((row) => row.hec > 0)
    .sort((a, b) => a.hec - b.hec);
  return list.length ? list : FENCE_AREA_MAP;
};

const fenceStandard = (hec, fenceMap) => {
  const value = Math.round(num(hec) * 100) / 100;
  if (value <= 0) return null;
  return fenceMap.find((row) => Math.abs(row.hec - value) < 0.0001) || null;
};

const isAllowedFenceHec = (hec, fenceMap) => {
  const value = Math.round(num(hec) * 100) / 100;
  return fenceMap.some((row) => Math.abs(row.hec - value) < 0.0001);
};

const EXTRA = { material: ["sup", "bill"], footing: ["sup"], labour: [], other: ["name", "vil", "aad"] };

const expenseSections = [
  { key: "material", label: "अ · सामग्री", sub: "चेनलिंक / कंटीले वायर, एंगल आयरन, नटबोल्ट आदि → देयक पंक्ति 1" },
  { key: "footing", label: "ब · फुटिंग सामग्री", sub: "सीमेंट, रेत, बजरी → देयक पंक्ति 2" },
  { key: "labour", label: "स · श्रमिक कार्य", sub: "→ देयक पंक्ति 3" },
  { key: "other", label: "अन्य", sub: "→ देयक पंक्ति 4" },
];

const buildFenceState = (raw, fenceMap, centerName) => {
  const personal = raw.personal || {};
  const expenses = raw.expenses || {};

  const fenceMaterial = matchValue(MAT_BACK, personal.fencing_material, "चेनलिंक जाली");
  const gender = matchValue(GENDER_BACK, personal.gender, "पुरुष");
  const planType = personal.scheme_name && String(personal.scheme_name).trim() ? String(personal.scheme_name).trim() : "जिला योजना";

  let rate = 80;
  if (num(personal.subsidy_rate) > 0) rate = num(personal.subsidy_rate);
  if (num(expenses.subsidy_rate) > 0) rate = num(expenses.subsidy_rate);
  rate = rate >= 60 ? 80 : 50;

  const costHa = num(expenses.unit_cost_per_hectare) > 0 ? num(expenses.unit_cost_per_hectare) : 200000;
  const cap = expenses.additional_max_limit !== undefined && expenses.additional_max_limit !== null && String(expenses.additional_max_limit) !== ""
    ? num(expenses.additional_max_limit)
    : 0;

  const landSource = Array.isArray(personal.farmer_details) ? personal.farmer_details : [];
  const landRows = landSource.length
    ? landSource.map((row, index) => {
      const cells = Array.isArray(row) ? row : [];
      const hec = num(cells[6]) || (num(cells[5]) > 0 ? num(cells[5]) / 50 : 0);
      return {
        relation: index === 0 ? "स्वयं" : cells[0] || "अन्य",
        name: cells[0] || "",
        father: cells[1] || "",
        village: cells[2] || "",
        khasra: cells[3] || "",
        aadhaar: cells[4] || "",
        hec: hec > 0 ? String(hec) : "",
      };
    })
    : [{ relation: "स्वयं", name: "", father: "", khasra: "", aadhaar: "", hec: "" }];

  const sections = expenseSections.reduce((acc, section) => {
    const rows = Array.isArray(expenses[`${section.key}_expenses`]) ? expenses[`${section.key}_expenses`] : [];
    const extraKeys = EXTRA[section.key] || [];
    acc[section.key] = rows.map((row) => {
      const cells = Array.isArray(row) ? row : row && typeof row === "object" ? Object.values(row) : [];
      const item = {
        item: cells[0] || "",
        work: cells[0] || "",
        qty: num(cells[1]) || "",
        unit: cells[2] || "",
        rate: num(cells[3]) || "",
        amt: num(cells[4]) || "",
      };
      extraKeys.forEach((key, index) => {
        item[key] = cells[5 + index] || "";
      });
      return item;
    });
    return acc;
  }, {});

  return {
    planType,
    // KisanAavedanPortal.js → centerLine() = लॉग-इन केंद्र का नाम, अन्यथा "……………………"
    centerLine: (centerName || "").trim() || "……………………",
    fenceMaterial,
    fenceHeading: fenceMaterial === "कंटीले तार" ? "कंटीले तार" : "चेनलिंक फेंसिंग",
    fenceKaamPhrase: fenceMaterial === "कंटीले तार" ? "कंटीले तार की घेरबाड़" : "चेनलिंक फेंसिंग की घेरबाड़",
    fenceMaterialName: fenceMaterial === "कंटीले तार" ? "कंटीले तार (बार्बड वायर)" : "चेनलिंक जाली",
    gender,
    rate,
    costHa,
    cap,
    name: personal.full_name || personal.farmer_name || "",
    father: personal.father_name || personal.father_husband_name || "",
    village: personal.village || "",
    post: personal.post || "",
    block: personal.block || "",
    dist: personal.dist || DISTRICT_NAME,
    mob: personal.mob || personal.mobile || "",
    aadhar: personal.aadhar || personal.aadhaar || "",
    cat: personal.category !== undefined && personal.category !== null && String(personal.category) !== ""
      ? matchValue(CAT_BACK, personal.category, "सामान्य")
      : "सामान्य",
    farmerCat: personal.farmer_category !== undefined && personal.farmer_category !== null && String(personal.farmer_category) !== ""
      ? matchValue(FARMER_BACK, personal.farmer_category, "सीमांत")
      : "सीमांत",
    bank: personal.bank_name || "",
    branch: personal.branch || personal.bank_branch || "",
    acct: personal.account || personal.bank_account_number || "",
    ifsc: personal.ifsc || personal.bank_ifsc || "",
    gardenCard: personal.garden_card || personal.horticulture_card || "",
    plants: personal.plants_no !== undefined && personal.plants_no !== null ? personal.plants_no : "",
    date: personal.date || "",
    place: personal.place || "",
    officer: personal.officer || "",
    desig: personal.designation || "",
    mbLen: expenses.measured_actual_length !== undefined && expenses.measured_actual_length !== null && String(expenses.measured_actual_length) !== ""
      ? String(num(expenses.measured_actual_length))
      : "",
    mbAmt: expenses.direct_mb_amount !== undefined && expenses.direct_mb_amount !== null && String(expenses.direct_mb_amount) !== ""
      ? String(num(expenses.direct_mb_amount))
      : "",
    verifiedLen: expenses.site_verified_actual_length !== undefined && expenses.site_verified_actual_length !== null && String(expenses.site_verified_actual_length) !== ""
      ? String(num(expenses.site_verified_actual_length))
      : "",
    allowedLen: expenses.permissible_length_override !== undefined && expenses.permissible_length_override !== null && String(expenses.permissible_length_override) !== ""
      ? String(num(expenses.permissible_length_override))
      : "",
    billDate: expenses.payable_date || "",
    landRows,
    sections,
    fenceMap,
  };
};

const sectionSum = (state, key) =>
  (state.sections[key] || []).reduce((total, row) => total + num(row.amt), 0);

const applicationData = (state) => {
  const totalHec = Math.round((state.landRows || []).reduce((total, row) => total + num(row.hec), 0) * 100) / 100;
  const exact = fenceStandard(totalHec, state.fenceMap);
  const totalNali = exact ? exact.nali : 0;
  const plants = num(state.plants);
  const area = totalHec;
  const allowedArea = isAllowedFenceHec(totalHec, state.fenceMap);
  const eligible = !!state.gardenCard && plants > 0 && allowedArea && plants / area >= 100;
  return { totalHec, totalNali, exact, plants, area, allowedArea, eligible, minPlants: area * 100 };
};

const calcFence = (state) => {
  const parts = [
    ["सामग्री — चेनलिंक / कंटीले वायर, एंगल आयरन, नटबोल्ट आदि", sectionSum(state, "material")],
    ["फुटिंग सामग्री — सीमेंट, रेत, बजरी", sectionSum(state, "footing")],
    ["श्रमिक कार्य — गड्ढा खुदान, खम्बों की स्थापना, चेनलिंक / कंटीले वायर लगाना, गेट लगाना आदि", sectionSum(state, "labour")],
    ["अन्य", sectionSum(state, "other")],
  ];

  const bill = parts.reduce((total, part) => total + part[1], 0);
  const rate = state.rate / 100;
  const cap = state.cap;

  let mb = num(state.mbAmt);
  if (mb <= 0) {
    const length = num(state.mbLen);
    const mbRate = 0;
    mb = length > 0 && mbRate > 0 ? length * mbRate : 0;
  }

  const data = applicationData(state);
  const hec = data.totalHec;
  const standard = fenceStandard(hec, state.fenceMap);
  const allowedLen = num(state.allowedLen) > 0 ? num(state.allowedLen) : standard ? standard.len : 0;
  const verifiedLen = num(state.verifiedLen);
  const ratio = allowedLen > 0 && verifiedLen > 0 ? verifiedLen / allowedLen : 1;
  const actualArea = hec * ratio;
  const standardCost = actualArea > 0 ? Math.round(actualArea * state.costHa) : 0;
  const shortfall = Math.max(0, allowedLen - verifiedLen);

  const bases = [];
  if (bill > 0) bases.push({ key: "bill", label: "बिल / वाउचर के अनुसार कुल व्यय", val: bill });
  if (mb > 0) bases.push({ key: "mb", label: "एम०बी० मूल्यांकन धनराशि", val: mb });
  if (standardCost > 0) bases.push({ key: "standard", label: "मानक लागत (क्षेत्रफल × ₹2,00,000)", val: standardCost });
  const base = bases.length ? Math.min(...bases.map((entry) => entry.val)) : 0;

  let subsidy = Math.round(base * rate);
  const capped = cap > 0 && subsidy > cap;
  if (capped) subsidy = cap;

  const effective = bill ? subsidy / bill : 0;
  const rows = [];
  let running = 0;
  parts.forEach((part, index) => {
    const value = index < parts.length - 1 ? Math.round(part[1] * effective) : Math.max(0, subsidy - running);
    running += value;
    rows.push({ name: part[0], amt: part[1], sub: value, own: part[1] - value });
  });

  return {
    bill, mb, base, bases, rate, sub: subsidy, own: bill - subsidy, cap, capped,
    over: mb > 0 && bill > 0 && bill > mb,
    hec, totalHec: hec, allowedLen, verifiedLen, mbLen: num(state.mbLen), ratio, actualArea,
    standardCost, shortfall, rows,
  };
};

const isFemale = (state) => state.gender === "महिला";
const G = (state, male, female) => (isFemale(state) ? female : male);
const applicantWord = (state) => G(state, "आवेदक", "आवेदिका");
const beneficiaryWord = (state) => G(state, "लाभार्थी", "लाभार्थिनी");

const affHec = (value) => {
  const parsed = num(value);
  return parsed > 0 ? parsed.toFixed(2) : "…………";
};

const affNali = (value) => {
  const parsed = num(value);
  return parsed > 0 ? parsed.toFixed(2).replace(/\.00$/, "") : "…………";
};

const landRowHasValue = (row, index) => {
  if (index === 0) return true;
  if (!row) return false;
  return num(row.hec) > 0 || ["name", "father", "khasra", "aadhaar"].some((key) => String(row[key] == null ? "" : row[key]).trim() !== "");
};

const buildFencingAffidavit = (state, data) => {
  const joint = data.totalHec > num((state.landRows || [])[0]?.hec) + 0.000001;
  const total = affHec(data.totalHec);
  const totalNali = affNali(data.totalNali);
  const first = (state.landRows && state.landRows[0]) || {};
  const coRows = (state.landRows || []).slice(1).filter((row) => num(row.hec) > 0 || String(row.name || "").trim());
  const allRows = (state.landRows || []).filter((row, index) => index === 0 || num(row.hec) > 0 || String(row.name || "").trim());

  const plan = esc(state.planType);
  const name = esc(state.name || "…………");
  const father = esc(state.father || "…………");
  const village = esc(state.village || "…………");
  const dist = esc(state.dist || "…………");
  const khasra = esc(first.khasra || "…………");
  const block = esc(state.block || "…………");
  const bank = esc(state.bank || "…………");
  const branch = esc(state.branch || "…………");
  const acct = esc(state.acct || "…………");
  const mob = esc(state.mob || "…………");
  const date = esc(state.date || "…………");

  const rate = state.rate;
  const stdCost = Math.round(num(data.totalHec) * state.costHa);
  const estSub = Math.round((stdCost * rate) / 100);

  if (!joint) {
    return `<div class="affidavit-doc aff-page-break">
      <div class="aff-head">
        <div class="aff-kicker">उद्यान विभाग, कोटद्वार · वित्तीय वर्ष 2026-27</div>
        <div class="aff-title">लाभार्थी स्व-घोषणा एवं शपथ-पत्र</div>
        <div class="aff-sub">(${state.fenceKaamPhrase} हेतु आवेदन एवं स्व-घोषणा — स्वयं की पूर्ण भूमि की स्थिति में) · स्टाम्प : ₹10/-</div>
        <div class="aff-line"></div>
      </div>
      <div class="aff-intro">मैं श्री <b>${name}</b>, ${G(state, "पुत्र", "पुत्री")} श्री <b>${father}</b>, निवासी ग्राम <b>${village}</b>, ग्राम पंचायत <b>${village}</b>, विकासखण्ड <b>${block}</b>, उद्यान सचल दल केन्द्र कोटद्वार, जनपद <b>${dist}</b>, उत्तराखण्ड, सत्यनिष्ठा से शपथपूर्वक निम्नलिखित घोषणा ${G(state, "करता", "करती")} हूँ कि —</div>
      <div class="aff-item">1. यह कि जिस संपूर्ण भूमि पर मेरे द्वारा घेराबड़ का कार्य कराया जाना प्रस्तावित है, वह भूमि हमारे संयुक्त परिवार के वैधानिक स्वामित्व एवं वास्तविक कब्जे में है तथा वह भौगोलिक रूप से एक ही चक (एक स्थान पर संरेखित) के रूप में स्थित है। जिला योजना के अंतर्गत चेनलिंक फेंसिंग घेराबड़ की स्थापना हेतु मेरे द्वारा कुल ${total} हे० भूमि प्रस्तावित की गई है। उक्त क्षेत्रफल का विवरण निम्नानुसार है  — ग्राम <b>${village}</b>, खसरा / खतौनी सं० <b>${khasra}</b>, कुल क्षेत्रफल <b>${total} हे० (${totalNali} नाली)</b>, भूमि का स्वामित्व : स्वयं। उक्त संपूर्ण भूमि मेरी स्वयं की है तथा ${plan} अन्तर्गत ${state.fenceKaamPhrase} की स्थापना हेतु प्रस्तावित क्षेत्रफल इसी भूमि से संबंधित है।</div>
      <div class="aff-item">2. यह कि आवेदन स्वीकृत होने की दशा में, उक्त भूमि पर ${state.fenceKaamPhrase} का कार्य उद्यान विभाग द्वारा निर्धारित मानकों एवं स्वीकृत तकनीकी विवरण के अनुसार ही कराया जाएगा। कार्य पूर्ण होने के पश्चात मैं मौके पर सामग्री एवं कार्य का निरीक्षण कर विभाग को सूचित ${G(state, "करूँगा", "करूँगी")}।</div>
      <div class="aff-item">3. यह कि आवेदन के समय विभागीय मानक दर के अनुसार उक्त क्षेत्रफल हेतु ${state.fenceKaamPhrase} की अनुमानित लागत <b>${fmt0(stdCost)}/-</b> आँकी गई है। चूँकि कार्य अभी प्रारम्भ नहीं हुआ है, अतः वास्तविक व्यय की जानकारी मुझे नहीं है — कार्य पूर्ण होने के पश्चात प्रस्तुत बिल / वाउचर के आधार पर अंतिम राजसहायता की गणना मान्य लागत या वास्तविक व्यय, इन दोनों में से जो भी कम हो, उसके अनुसार की जाएगी।</div>
      <div class="aff-item">4. उक्त अनुमानित लागत पर योजना में निर्धारित दर (<b>${rate}%</b>) के अनुसार अनुमानित राजसहायता <b>${fmt0(estSub)}/-</b> होगी, जिसका भुगतान कार्य पूर्ण होने एवं देयक सत्यापित होने के पश्चात नियमानुसार डी.बी.टी. (DBT) के माध्यम से मेरे बैंक खाते (<b>${bank}, ${branch}</b>, खाता सं० <b>${acct}</b>) में किया जाएगा।</div>
      <div class="aff-item">5. यह कि योजनान्तर्गत निर्धारित राजसहायता की शर्तों से मैं पूर्णतः सहमत हूँ। यदि वास्तविक ${state.fenceKaamPhrase} कार्य स्वीकृत मानकों या स्वीकृत क्षेत्रफल से अधिक होता है, तो अतिरिक्त लंबाई / क्षेत्रफल पर होने वाला समस्त व्यय मैं स्वयं वहन ${G(state, "करूँगा", "करूँगी")} और विभाग से किसी अतिरिक्त राजसहायता की मांग नहीं ${G(state, "करूँगा", "करूँगी")}। इसके अतिरिक्त, वास्तविक व्यय मान्य विभागीय लागत से अधिक होने की दशा में भी उस अतिरिक्त राशि पर कोई राजसहायता देय नहीं होगी तथा मान्य लागत एवं देय राजसहायता के मध्य की शेष राशि सहित यह संपूर्ण भार मेरे द्वारा स्वयं वहन किया जाएगा।</div>
      <div class="aff-item">6. यह कि इससे पूर्व मेरे द्वारा उक्त प्रस्तावित भूमि की घेराबाड़ हेतु किसी भी अन्य सरकारी विभाग अथवा किसी अन्य योजना / परियोजना से कोई सरकारी अनुदान, सहायता या वित्तीय लाभ प्राप्त नहीं किया गया है।</div>
      <div class="aff-item">7. यह कि उक्त भूमि पूर्णतः विवाद रहित है तथा इस पर किसी भी प्रकार का कोई मालिकाना हक का वाद-विवाद, न्यायालयीन प्रकरण, बैंक बंधक अथवा अन्य कोई कानूनी अड़चन विद्यमान नहीं है।</div>
      <div class="aff-item">8. यह कि कार्य स्थल पर मेरे द्वारा विभागीय निर्देशानुसार हरी पृष्ठभूमि पर सफेद पेंट से अंकित एक लोहे का सूचना बोर्ड लगाया जाएगा, जिसमें योजना का नाम "${plan} अन्तर्गत उद्यान की ${state.fenceHeading} घेराबाड़ योजना वर्ष 2026-2027", कृषक का विवरण, कुल क्षेत्रफल, कुल लागत एवं राजसहायता का स्पष्ट उल्लेख होगा।</div>
      <div class="aff-item">9. यह कि स्थापित की जाने वाली घेराबाड़ के भविष्य में रख-रखाव, मरम्मत एवं देख-रेख की संपूर्ण जिम्मेदारी मेरी स्वयं की होगी। प्राकृतिक आपदा या किसी अन्य कारण से घेराबाड़ को होने वाले नुकसान के लिए उद्यान विभाग उत्तरदायी नहीं होगा।</div>
      <div class="aff-item">10. यह कि मैं विभाग द्वारा किए जाने वाले स्थलीय निरीक्षण, भौतिक सत्यापन एवं आवश्यक जाँच में सहयोग ${G(state, "करूँगा", "करूँगी")}। यदि मेरे द्वारा प्रस्तुत भूमि अभिलेख, बैंक खाते की जानकारी या घेराबाड़ से संबंधित कोई भी तथ्य भविष्य में असत्य या भ्रामक पाया जाता है, तो विभाग को मेरे विरुद्ध कानूनी कार्यवाही करने तथा दी गई राजसहायता की राशि को भू-राजस्व की भांति वसूल करने का पूर्ण अधिकार होगा, जो मुझे सहर्ष स्वीकार होगा।</div>
      <div class="aff-decl">मैंने यह शपथ-पत्र बिना किसी दबाव, भय अथवा प्रलोभन के अपनी स्वतंत्र इच्छा से दिया है तथा इसमें वर्णित सभी तथ्य मेरे ज्ञान एवं विश्वास के अनुसार सत्य एवं सही हैं।</div>
      <div class="aff-sign-plain">
        <div><b>${G(state, "शपथकर्ता", "शपथकर्त्री")} / कृषक</b></div>
        <div>नाम : ${name}</div>
        <div>हस्ताक्षर : ________________</div>
        <div>मो० : ${mob}</div>
        <div>स्थान : ${esc(state.centerLine)}</div>
        <div>दिनांक : ${date}</div>
      </div>
    </div>`;
  }

  const landDesc = (row, index) => {
    const rel = String(row.relation || "").trim();
    const nm = String(row.name || "").trim();
    if (index === 0) {
      if (rel && nm) return `${rel} ${nm} की भूमि`;
      if (rel) return `${rel} की भूमि`;
      return "आवेदक की स्वयं की भूमि";
    }
    if (rel && nm) return `सह-खातेदार ${rel} ${nm} की भूमि`;
    if (nm) return `सह-खातेदार ${nm} की भूमि`;
    if (rel) return `सह-खातेदार ${rel} की भूमि`;
    return "सह-खातेदार की भूमि";
  };

  const landTableRows = allRows
    .map((row, index) => `
      <tr>
        <td style="text-align:center">${index + 1}</td>
        <td>${landDesc(row, index)}</td>
        <td>${esc(row.khasra || "…………")}</td>
        <td style="text-align:right">${affHec(row.hec)} हे०</td>
        <td style="text-align:center">${index === 0 ? "स्वयं" : "सह-खातेदार"}</td>
      </tr>`)
    .join("");

  const consentLetters = coRows
    .map((row) => {
      const rName = esc(row.name || "…………");
      const rFather = esc(row.father || "…………");
      const rVillage = esc(row.village || state.village || "…………");
      const rKhasra = esc(row.khasra || "…………");
      const rHec = affHec(row.hec);
      const rRel = esc(row.relation || "…………");
      const rAadhaar = esc(row.aadhaar || "…………");
      return `
      <div class="aff-consent-block">
        <div class="aff-head">
          <div class="aff-title">सह-खातेदार का सहमति एवं अनापत्ति पत्र</div>
          <div class="aff-line"></div>
        </div>
        <div class="aff-intro">मैं श्री <b>${rName}</b>, पुत्र श्री <b>${rFather}</b>, निवासी ग्राम <b>${rVillage}</b>, यह घोषित करता हूँ कि मेरी भूमि का विवरण निम्नानुसार है — खाता सं० <b>${rKhasra}</b>, कुल क्षेत्रफल <b>${rHec} हे०</b>।</div>
        <div class="aff-item">मैं यह सहमति प्रदान करता हूँ कि मेरी उक्त भूमि में से ${rHec} हे० क्षेत्रफल को श्री ${name}, जो मेरे ${rRel} हैं, द्वारा जिला योजना के अंतर्गत प्रस्तुत चेनलिंक फेंसिंग घेराबड़ आवेदन में सम्मिलित किया जाए।</div>
        <div class="aff-item">मुझे उक्त भूमि पर घेराबड़ की स्थापना किए जाने पर कोई आपत्ति नहीं है।</div>
        <div class="aff-item">मैं यह भी सहमति देता हूँ कि योजना के अंतर्गत अनुमन्य राजसहायता की राशि आवेदक के नाम से डी.बी.टी. (DBT) के माध्यम से उसके बैंक खाते में प्राप्त की जाए।</div>
        <div class="aff-item">मैंने यह सहमति अपनी स्वतंत्र इच्छा से दी है और भविष्य में उक्त स्थापना एवं योजना के लाभ के संबंध में अनावश्यक आपत्ति नहीं करूँगा।</div>
        <div class="aff-sign-plain">
          <div><b>सह-खातेदार का विवरण</b></div>
          <div>नाम : ${rName}</div>
          <div>हस्ताक्षर : ________________</div>
          <div>आवेदक से संबंध : ${rRel}</div>
          <div>आधार कार्ड संख्या : ${rAadhaar}</div>
          <div>दिनांक : ________________</div>
        </div>
      </div>`;
    })
    .join("");

  return `<div class="affidavit-doc aff-page-break">
    <div class="aff-head">
      <div class="aff-kicker">उद्यान विभाग, कोटद्वार · वित्तीय वर्ष 2026-27</div>
      <div class="aff-title">शपथ-पत्र</div>
      <div class="aff-sub">(${state.fenceKaamPhrase} हेतु आवेदन एवं स्व-घोषणा — संयुक्त भूमि / सह-खातेदार) · स्टाम्प : ₹10/-</div>
      <div class="aff-line"></div>
    </div>
    <div class="aff-intro">मैं श्री <b>${name}</b>, ${G(state, "पुत्र", "पुत्री")} श्री <b>${father}</b>, निवासी ग्राम <b>${village}</b>, ग्राम पंचायत <b>${village}</b>, विकासखण्ड <b>${block}</b>, उद्यान सचल दल केन्द्र कोटद्वार, जनपद <b>${dist}</b>, उत्तराखण्ड, सत्यनिष्ठा से शपथपूर्वक निम्नलिखित घोषणा ${G(state, "करता", "करती")} हूँ कि —</div>

    <div class="aff-item">1. यह कि जिस संपूर्ण भूमि पर मेरे द्वारा घेराबड़ का कार्य कराया जाना प्रस्तावित है, वह भूमि हमारे संयुक्त परिवार के वैधानिक स्वामित्व एवं वास्तविक कब्जे में है तथा वह भौगोलिक रूप से एक ही चक (एक स्थान पर संरेखित) के रूप में स्थित है। जिला योजना के अंतर्गत चेनलिंक फेंसिंग घेराबड़ की स्थापना हेतु मेरे द्वारा कुल ${total} हे० भूमि प्रस्तावित की गई है। उक्त क्षेत्रफल का विवरण निम्नानुसार है —</div>
    <table class="aff-land">
      <thead><tr><th style="width:42px">क्र.</th><th>भूमि का विवरण</th><th>खसरा सं०</th><th>क्षेत्रफल</th><th>स्थिति</th></tr></thead>
      <tbody>
        ${landTableRows}
        <tr><td colspan="3" style="text-align:right"><b>कुल प्रस्तावित क्षेत्रफल</b></td><td style="text-align:right"><b>${total} हे०</b></td><td></td></tr>
      </tbody>
    </table>

    <div class="aff-item">2. यह कि सह-खातेदारों की भूमि को जिला योजना के अंतर्गत मेरे आवेदन में सम्मिलित करने हेतु संबंधित सह-खातेदारों द्वारा स्वेच्छा से लिखित सहमति एवं अनापत्ति प्रदान की गई है (संलग्न)। सह-खातेदारों को प्रस्तावित घेराबड़ स्थापना, भूमि के उपयोग तथा योजना के अंतर्गत देय राजसहायता के संबंध में पूर्ण जानकारी है।</div>

    <div class="aff-item">3. यह कि सह-खातेदारों की सहमति से सम्मिलित भूमि सहित कुल प्रस्तावित क्षेत्रफल में स्थापित की जाने वाली घेराबड़ का उपयोग संबंधित उद्यान / फसल सुरक्षा के लिए किया जाएगा तथा उसके संचालन, सुरक्षा एवं रख-रखाव की जिम्मादारी मेरे द्वारा निभाई जाएगी।</div>

    <div class="aff-item">4. यह कि आवेदन स्वीकृत होने की दशा में, जिला योजना के अंतर्गत प्रस्तावित चेनलिंक फेंसिंग घेराबड़ की स्थापना का कार्य उद्यान विभाग द्वारा निर्धारित मानकों एवं स्वीकृत तकनीकी विवरण के अनुसार ही कराया जाएगा। कार्य पूर्ण होने के पश्चात मैं मौके पर उपलब्ध सामग्री एवं कार्य का निरीक्षण कर विभाग को सूचित ${G(state, "करूँगा", "करूँगी")}।</div>

    <div class="aff-item">5. यह कि आवेदन के समय विभागीय मानक दर के अनुसार उक्त कुल क्षेत्रफल हेतु चेनलिंक फेंसिंग घेराबड़ की अनुमानित लागत <b>${fmt0(stdCost)}/-</b> आँकी गई है। चूँकि कार्य अभी प्रारम्भ नहीं हुआ है, अतः वास्तविक व्यय की जानकारी अभी ज्ञात नहीं है — कार्य पूर्ण होने के पश्चात राजसहायता की गणना नियमानुसार मान्य लागत / वास्तविक व्यय में से जो कम हो, उसके अनुसार की जाएगी।</div>

    <div class="aff-item">6. उक्त अनुमानित लागत पर लागू दर (<b>${rate}%</b>) के अनुसार अनुमानित राजसहायता <b>${fmt0(estSub)}/-</b> होगी, जिसका भुगतान कार्य पूर्ण होने एवं देयक सत्यापित होने के पश्चात नियमानुसार डी.बी.टी. (DBT) के माध्यम से आवेदक के बैंक खाते (<b>${bank}, ${branch}</b>, खाता सं० <b>${acct}</b>) में किया जाएगा।</div>

    <div class="aff-item">7. यह कि योजनान्तर्गत निर्धारित राजसहायता की शर्तों से मैं पूर्णतः सहमत हूँ। यदि वास्तविक घेराबड़ कार्य स्वीकृत मानकों या स्वीकृत क्षेत्रफल से अधिक होता है, तो अतिरिक्त लंबाई / क्षेत्रफल पर होने वाला समस्त व्यय मैं स्वयं वहन ${G(state, "करूँगा", "करूँगी")} और विभाग से किसी अतिरिक्त राजसहायता की मांग नहीं ${G(state, "करूँगा", "करूँगी")}। इसके अतिरिक्त, वास्तविक व्यय मान्य विभागीय लागत से अधिक होने की दशा में भी उस अतिरिक्त राशि पर कोई राजसहायता देय नहीं होगी तथा मान्य लागत एवं देय राजसहायता के मध्य की शेष राशि सहित यह संपूर्ण भार मेरे द्वारा वहन किया जाएगा।</div>

    <div class="aff-item">8. यह कि सह-खातेदारों को इस बात की जानकारी एवं सहमति है कि उनकी भूमि को उक्त जिला योजना आवेदन में सम्मिलित किया गया है और योजना के अंतर्गत स्वीकृत राजसहायता आवेदक के बैंक खाते में डी.बी.टी. के माध्यम से प्राप्त होगी। इस संबंध में सह-खातेदारों की लिखित सहमति इस शपथ-पत्र के साथ संलग्न है।</div>

    <div class="aff-item">9. यह कि प्रस्तावित कुल भूमि पर घेराबड़ हेतु इससे पूर्व किसी अन्य सरकारी योजना / विभाग से कोई सरकारी अनुदान, सहायता या वित्तीय लाभ प्राप्त नहीं किया गया है।</div>

    <div class="aff-item">10. यह कि कार्य स्थल पर मेरे द्वारा विभागीय निर्देशानुसार हरी पृष्ठभूमि पर सफेद पेंट से अंकित एक लोहे का सूचना बोर्ड लगाया जाएगा, जिसमें योजना का नाम "${plan} अन्तर्गत उद्यान की ${state.fenceHeading} घेराबाड़ योजना वर्ष 2026-2027", कृषक का विवरण, कुल क्षेत्रफल, कुल लागत एवं राजसहायता का स्पष्ट उल्लेख होगा।</div>

    <div class="aff-item">11. यह कि मेरे द्वारा प्रस्तुत भूमि अभिलेख, खाता / खसरा विवरण, क्षेत्रफल, सह-खातेदारों की सहमति तथा योजना से संबंधित अन्य जानकारी मेरे ज्ञान एवं विश्वास के अनुसार सही है।</div>

    <div class="aff-item">12. यह कि उक्त भूमि पूर्णतः विवाद रहित है तथा इस पर किसी भी प्रकार का कोई मालिकाना हक का वाद-विवाद, न्यायालयीन प्रकरण, पारिवारिक आपसी बंटवारे का विवाद, बैंक बंधक अथवा अन्य कोई कानूनी अड़चन विद्यमान नहीं है।</div>

    <div class="aff-item">13. मैं विभाग द्वारा किए जाने वाले स्थलीय निरीक्षण, भौतिक सत्यापन एवं अभिलेखीय जाँच में आवश्यक सहयोग ${G(state, "करूँगा", "करूँगी")}। यदि मेरे द्वारा प्रस्तुत भूमि, सह-खातेदारों की सहमति, पूर्व अनुदान अथवा वित्तीय विवरण के संबंध में भविष्य में कोई जानकारी असत्य, भ्रामक अथवा योजना के नियमों के विपरीत पाई जाती है, तो प्राप्त राजसहायता की वसूली तथा नियमानुसार विभागीय / कानूनी कार्यवाही के लिए मैं स्वयं उत्तरदायी रहूँगा।</div>

    <div class="aff-decl">मैंने यह शपथ-पत्र बिना किसी दबाव, भय अथवा प्रलोभन के अपनी स्वतंत्र इच्छा से दिया है और इसमें वर्णित जानकारी मेरे ज्ञान एवं विश्वास के अनुसार सत्य एवं सही है।</div>

    <div class="aff-sign-plain">
      <div><b>आवेदक</b></div>
      <div>नाम : ${name}</div>
      <div>हस्ताक्षर : ________________</div>
      <div>मो० : ${mob}</div>
      <div>स्थान : ${esc(state.centerLine)}</div>
      <div>दिनांक : ${date}</div>
    </div>
  </div>
  ${coRows.length
    ? `
  <div class="affidavit-doc aff-page-break">
    ${consentLetters}
    <div class="aff-sign-plain">
      <div><b>शपथकर्ता / आवेदक</b></div>
      <div>नाम : ${name}</div>
      <div>हस्ताक्षर : ________________</div>
      <div>मो० : ${mob}</div>
      <div>स्थान : ${esc(state.centerLine)}</div>
      <div>दिनांक : ${date}</div>
    </div>
  </div>`
    : ""}`;
};

const buildFencingApplicationHtml = (state) => {
  const data = applicationData(state);
  const rate = state.rate;
  const standard = data.allowedArea && data.totalHec > 0 ? Math.round(data.totalHec * state.costHa) : 0;
  const subsidy = standard > 0 ? Math.round((standard * rate) / 100) : 0;
  const okPlants = data.area > 0 && data.plants > 0 && data.plants / data.area >= 100;

  const status = !state.gardenCard
    ? `<div class="appbad"><b>फेंसिंग पात्रता:</b> अयोग्य — उद्यान कार्ड संख्या अनिवार्य है।</div>`
    : data.plants <= 0
      ? `<div class="appbad"><b>फेंसिंग पात्रता:</b> अयोग्य — उद्यान में उपलब्ध फल पौधों की संख्या भरना अनिवार्य है।</div>`
      : data.area <= 0
        ? `<div class="appbad"><b>फेंसिंग पात्रता:</b> पहले भूमि का क्षेत्रफल चुनें।</div>`
        : !data.allowedArea
          ? `<div class="appbad"><b>आवेदन स्थिति:</b> लागू नहीं — सभी भूमि प्रविष्टियों को जोड़ने पर प्रस्तावित भूमि का कुल क्षेत्रफल निर्धारित मैपिंग की किसी भी स्वीकृत श्रेणी से मेल नहीं खाता। केवल 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00, 1.20, 1.40, 1.60, 1.80 या 2.00 हे० का कुल क्षेत्रफल मान्य होगा।</div>`
          : data.plants / data.area < 100
            ? `<div class="appbad"><b>फेंसिंग पात्रता:</b> अयोग्य — न्यूनतम 100 पौधे प्रति हे० आवश्यक हैं। वर्तमान ${fmtN(data.plants / data.area)} पौधे/हे०।</div>`
            : `<div class="appok"><b>फेंसिंग पात्रता:</b> पात्र — न्यूनतम 100 पौधे प्रति हे० की शर्त पूरी है।</div>`;

  let printedNo = 0;
  const landRows = (state.landRows || [])
    .map((row, index) => {
      const has = landRowHasValue(row, index);
      if (has) printedNo++;
      return `
      <tr class="land-row${has ? "" : " land-row-empty"}">
        <td class="land-sno" style="text-align:center"><span class="land-sno-print">${has ? printedNo : ""}</span></td>
        <td>${index === 0
          ? `<input data-land="0" data-k="relation" readonly tabindex="-1" value="${esc(row.relation || "")}" placeholder="भूमि किसकी / विवरण">`
          : roField(row.relation || "", `placeholder="भूमि किसकी / विवरण"`)}</td>
        <td>${index === 0
          ? `<input class="landSelfName" readonly tabindex="-1" value="${esc(state.name || "")}" placeholder="नाम खतौनी अनुसार">`
          : roField(row.name || "", `placeholder="नाम खतौनी अनुसार"`)}</td>
        <td>${index === 0
          ? `<input class="landSelfFather" readonly tabindex="-1" value="${esc(state.father || "")}" placeholder="पिता का नाम">`
          : roField(row.father || "", `placeholder="पिता का नाम"`)}</td>
        <td><input class="landVil" readonly tabindex="-1" value="${esc(state.village || "")}" placeholder="ग्राम"></td>
        <td>${roField(row.khasra || "", `placeholder="खसरा / खतौनी सं०"`)}</td>
        <td>${index === 0
          ? `<input class="landSelfAadhaar" readonly tabindex="-1" value="${esc(state.aadhar || "")}" placeholder="आधार संख्या">`
          : roField(row.aadhaar || "", `inputmode="numeric" maxlength="12" placeholder="आधार संख्या"`)}</td>
        <td>${roField(row.hec || "", `inputmode="decimal" placeholder="हे०"`)}</td>
      </tr>`;
    })
    .join("");

  return `<div class="appdoc">
    <div style="text-align:center;font-size:11.5px;color:#65746B;margin:2px 0 4px">उद्यान विभाग · वित्तीय वर्ष 2026-27</div>
    <h3 style="text-decoration:underline">${esc(state.planType)} अन्तर्गत ${state.fenceHeading} हेतु</h3>
    <h4 style="color:var(--ink);font-size:16px;font-weight:600">कृषक आवेदन पत्र</h4>
    <div class="appnote">
      <b>योजना:</b> ${roSelect(state.planType, ["जिला योजना", "राज्य सेक्टर योजना"], `style="margin-left:8px;padding:3px"`)}
      <span style="margin-left:18px"><b>लिंग:</b></span> ${roSelect(state.gender, ["पुरुष", "महिला"], `style="margin-left:8px;padding:3px"`)}
      <span style="margin-left:18px"><b>फेंसिंग सामग्री:</b></span> ${roSelect(state.fenceMaterial, ["चेनलिंक जाली", "कंटीले तार (बार्बड वायर)"], `style="margin-left:8px;padding:3px"`)}
      <span style="margin-left:18px"><b>फेंसिंग राजसहायता दर:</b></span> ${roSelect(String(rate), ["50", "80"], `style="margin-left:8px;padding:3px"`)}
      <span style="margin-left:12px">सभी श्रेणियों के लिए समान चयनित दर लागू होगी। चुनी गयी सामग्री (चेनलिंक/कंटीले तार) के अनुसार भाषा पूरे आवेदन एवं अनुदान (देयक) प्रपत्र में स्वतः बदल जाती है।</span>
    </div>
    <h5>उद्यान कार्ड विवरण — फेंसिंग आवेदन के लिए अनिवार्य</h5>
    <table class="landtable infoTable"><tbody>
      <tr><td class="flabel">उद्यान कार्ड संख्या</td><td>${roField(state.gardenCard || "")}</td></tr>
      <tr><td class="flabel">उद्यान में उपलब्ध फल पौधों की संख्या</td><td>${roField(state.plants, `inputmode="numeric"`)}</td></tr>
    </tbody></table>
    <div id="fenceEligibility">${status}</div>
    <h5>1. ${applicantWord(state)} का विवरण</h5>
    <table class="landtable infoTable"><tbody>
      <tr><td class="flabel">${beneficiaryWord(state)} / ${applicantWord(state)} का नाम</td><td>${roField(state.name || "")}</td></tr>
      <tr><td class="flabel">पिता / पति का नाम</td><td>${roField(state.father || "")}</td></tr>
      <tr><td class="flabel">ग्राम</td><td>${roField(state.village || "")}</td></tr>
      <tr><td class="flabel">पोस्ट ऑफिस</td><td>${roField(state.post || "")}</td></tr>
      <tr><td class="flabel">विकास खण्ड</td><td>${roField(state.block || "")}</td></tr>
      <tr><td class="flabel">जनपद</td><td>${roField(state.dist || DISTRICT_NAME)}</td></tr>
      <tr><td class="flabel">मोबाइल नंबर</td><td>${roField(state.mob || "")}</td></tr>
      <tr><td class="flabel">आधार संख्या</td><td>${roField(state.aadhar || "")}</td></tr>
      <tr><td class="flabel">वर्ग</td><td>${roSelect(state.cat, ["सामान्य", "OBC", "SC", "ST", "महिला"])}</td></tr>
      <tr><td class="flabel">कृषक श्रेणी</td><td>${roSelect(state.farmerCat, ["सीमांत", "लघु", "अन्य"])}</td></tr>
      <tr><td class="flabel">सिंचाई की सुविधा</td><td>${roSelect("उपलब्ध", ["उपलब्ध", "उपलब्ध नहीं"])}</td></tr>
    </tbody></table>
    <h5>2. बैंक विवरण (DBT हेतु)</h5>
    <table class="landtable infoTable"><tbody>
      <tr><td class="flabel">बैंक का नाम</td><td>${roField(state.bank || "")}</td></tr>
      <tr><td class="flabel">शाखा</td><td>${roField(state.branch || "")}</td></tr>
      <tr><td class="flabel">खाता संख्या</td><td>${roField(state.acct || "")}</td></tr>
      <tr><td class="flabel">IFSC कोड</td><td>${roField(state.ifsc || "")}</td></tr>
    </tbody></table>
    <h5>3. भूमि एवं कार्य का विवरण</h5>
    <table class="landtable">
      <thead><tr>
        <th style="width:42px">क्र.</th>
        <th style="width:110px">भूमि किसकी / विवरण</th>
        <th>नाम (खतौनी के अनुसार)</th>
        <th>पिता का नाम</th>
        <th style="width:120px">ग्राम</th>
        <th style="width:120px">खसरा / खतौनी सं०</th>
        <th style="width:125px">आधार संख्या</th>
        <th style="width:110px">${applicantWord(state)} की प्रस्तावित भूमि — फेंसिंग हेतु</th>
      </tr></thead>
      <tbody>${landRows}
        <tr class="tot">
          <td colspan="7" style="text-align:right">प्रस्तावित भूमि का क्षेत्रफल (कुल हे०) — वास्तविक आवेदन क्षेत्रफल</td>
          <td class="calc">${fmtN(data.totalHec)}</td>
        </tr>
      </tbody>
    </table>
    <h5>4. सारांश — क्षेत्रफल, फेंसिंग एवं राजसहायता</h5>
    <table>
      <thead><tr>
        <th>भूमि (नाली)</th><th>क्षेत्रफल (हे०)</th><th>अनुमन्य लम्बाई (मी०</th><th>खम्बे</th>
        <th>लागत (₹)</th><th>राजसहायता 80%</th><th>राजसहायता 50%</th>
      </tr></thead>
      <tbody>
        <tr>
          <td style="text-align:center">${data.exact ? fmtN(data.totalNali).replace(/\.00$/, "") : "—"}</td>
          <td style="text-align:center">${data.allowedArea ? data.totalHec.toFixed(2) : "—"}</td>
          <td style="text-align:center">${data.exact ? data.exact.len : "—"}</td>
          <td style="text-align:center">${data.exact ? data.exact.poles : "—"}</td>
          <td style="text-align:right">${fmt0(standard)}</td>
          <td style="text-align:right">${fmt0(Math.round(standard * 0.8))}</td>
          <td style="text-align:right">${fmt0(Math.round(standard * 0.5))}</td>
        </tr>
        <tr class="tot">
          <td colspan="6" style="text-align:right">देय राजसहायता (चयनित दर ${rate}%)</td>
          <td class="calc">${fmt0(subsidy)}</td>
        </tr>
      </tbody>
    </table>
    <h5>5. घोषणा</h5>
    <div class="appnote">
      • उपर्युक्त सभी विवरण मेरी जानकारी में पूर्णतः सत्य हैं।<br>
      • मुझे पूर्व में किसी अन्य सरकारी योजना से इस कार्य हेतु अनुदान प्राप्त नहीं हुआ है।<br>
      • कार्य / इकाई का निर्माण, रखरखाव एवं संचालन विभागीय दिशा-निर्देशों के अनुसार मेरी जिम्मादारी होगी।<br>
      • संलग्न बिल / वाउचर एवं दस्तावेज सही हैं।
    </div>
    <h5>6. आवश्यक संलग्नक</h5>
    <div class="appgrid">
      <div>☐ उद्यान कार्ड</div><div>☐ खतौनी / भूमि स्वामित्व प्रमाण पत्र</div>
      <div>☐ आधार कार्ड एवं बैंक पासबुक की छायाप्रति</div><div>☐ अन्य आवश्यक दस्तावेज</div>
    </div>
    <h5>7. कृषक का प्रमाणपत्र</h5>
    <div class="appnote" style="line-height:1.9;text-align:justify">
      प्रमाणित किया जाता है कि मेरे द्वारा ${state.planType} अन्तर्गत ${state.fenceHeading} / घेरबाड़ कार्य हेतु उपर्युक्तानुसार आवेदन प्रस्तुत किया जा रहा है तथा आवेदन में अंकित समस्त विवरण सत्य एवं सही हैं।
      अतः नियमानुसार देय राजसहायता की धनराशि <b>${fmt0(subsidy)}</b> (${subsidy > 0 ? `${words(subsidy)} रुपये मात्र` : "…………"}) स्वीकृत करने की कृपा कीजिएगा।
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:22px;gap:20px">
      <div style="flex:0 0 auto">
        <div style="display:flex;gap:6px;align-items:baseline"><b>दिनांक :</b>${roField(state.date || "", `class="ln sm" type="date"`)}</div>
        <div style="display:flex;gap:6px;align-items:baseline;margin-top:8px"><b>स्थान :</b><input class="ln sm" readonly tabindex="-1" value="${esc(state.centerLine)}"></div>
      </div>
      <div style="text-align:center;min-width:240px;border-top:1px solid var(--ink);padding-top:5px">
        हस्ताक्षर ${G(state, "कृषक", "कृषिका")}<br><span class="auto">${esc(state.name || "")}</span></div>
    </div>
    <h5>8. प्रभारी की आख्या</h5>
    <div class="appnote" style="line-height:1.9;text-align:justify">
      प्रमाणित किया जाता है कि ${G(state, "कृषक", "कृषिका")} द्वारा प्रस्तुत आवेदन, उद्यान कार्ड, भूमि अभिलेख (खतौनी) एवं अन्य संबंधित अभिलेखों का परीक्षण कर लिया गया है तथा प्रस्तावित भूमि का स्थलीय निरीक्षण किया गया है। आवेदन में अंकित विवरण एवं प्रस्तुत अभिलेख सही पाए गए हैं।
      प्रस्तावित भूमि का कुल क्षेत्रफल <b>${data.totalHec > 0 ? data.totalHec.toFixed(2) : "…………"}</b> हे० (<b>${data.totalNali ? fmtN(data.totalNali).replace(/\.00$/, "") : "…………"}</b> नाली) पाया गया, जिस पर विभागीय मानक के अनुसार अनुमन्य ${state.fenceHeading} की लम्बाई <b>${data.exact ? data.exact.len : "…………"}</b> मी० तथा अनुमन्य खम्बे <b>${data.exact ? data.exact.poles : "…………"}</b> नग हैं। उद्यान में उपलब्ध फलदार पौधों की संख्या <b>${data.plants > 0 ? fmtN(data.plants).replace(/\.00$/, "") : "…………"}</b> होने के कारण न्यूनतम 100 पौधे प्रति हे० की शर्त <b>${okPlants ? "पूर्ण होती है" : "पूर्ण नहीं होती है"}</b>।
      मानक लागत <b>${fmt0(standard)}</b> के सापेक्ष चयनित दर <b>${rate}</b>% के अनुसार देय राजसहायता की अनुमानित धनराशि <b>${fmt0(subsidy)}</b> होगी।
      अतः ${G(state, "कृषक", "कृषिका")} का आवेदन <b>उद्यान विशेषज्ञ, कोटद्वार महोदय की सेवा में ${state.planType} अन्तर्गत ${state.fenceHeading} / घेरबाड़ कार्य हेतु वर्क ऑर्डर जारी करने के लिए संस्तुति सहित अग्रसारित</b> है।
    </div>
    <div style="margin-top:18px;line-height:2">
      <b>प्रभारी, उद्यान सचल दल केन्द्र :</b> <span class="auto">${esc(state.centerLine)}</span>
    </div>
  </div>
  ${buildFencingAffidavit(state, data)}`;
};

const LR = (label, value) => `<div class="r"><b>${label}</b><span class="auto">${esc(value || "…………")}</span></div>`;

const buildFencingWorkHtml = (state) => {
  const columns = {
    material: [["item", "किस कार्य / सामग्री का बिल है"], ["sup", "आपूर्तिकर्ता / फर्म"], ["bill", "बिल सं०"], ["amt", "बिल राशि (₹)"]],
    footing: [["item", "किस कार्य / सामग्री का बिल है"], ["sup", "आपूर्तिकर्ता / फर्म"], ["amt", "बिल राशि (₹)"]],
    labour: [["work", "कार्य का विवरण"], ["amt", "भुगतान राशि (₹)"]],
    other: [["item", "विवरण"], ["name", "प्राप्तकर्ता का नाम"], ["vil", "ग्राम"], ["aad", "आधार सं०"], ["amt", "राशि (₹)"]],
  };

  const totalBill = expenseSections.reduce((total, section) => total + sectionSum(state, section.key), 0);

  return `<div class="doc">
    <div class="card">
      <div class="cap"><i></i><span>राजसहायता के मानक</span><small>प्रपत्र पर नहीं छपेंगे — यहीं से अपडेट करें</small></div>
      <div class="pad">
        <div class="grid">
          <div><label class="f">फेंसिंग राजसहायता दर (%) — सभी श्रेणियों के लिए समान</label>
            <select>${["50", "80"].map((option) => `<option value="${option}"${String(state.rate) === option ? " selected" : ""}>${option}%</option>`).join("")}</select></div>
          <div><label class="f">इकाई लागत ₹ प्रति हेक्टेयर</label><input value="${state.costHa}" inputmode="decimal" readonly disabled></div>
          <div><label class="f">अतिरिक्त अधिकतम सीमा ₹ (वैकल्पिक)</label><input value="${state.cap}" inputmode="decimal" readonly disabled></div>
        </div>
      </div>
    </div>
    ${expenseSections
      .map((section) => {
        const cols = columns[section.key];
        const rows = state.sections[section.key] || [];
        const body = rows.length
          ? rows
              .map(
                (row, index) => `<tr>
                  <td class="n">${index + 1}</td>
                  ${cols.map(([key]) => `<td${key === "amt" ? ' class="calc num"' : ""}>${key === "amt" ? fmtN(num(row[key])) : roField(row[key] || "")}</td>`).join("")}
                </tr>`,
              )
              .join("")
          : `<tr><td colspan="${cols.length + 1}" class="empty">कोई प्रविष्टि नहीं</td></tr>`;
        const amountIndex = cols.findIndex(([key]) => key === "amt");
        return `<div class="card">
          <div class="cap"><i></i>${section.label}<small>${section.sub}</small></div>
          <div class="pad">
            <table class="expense-table">
              <thead><tr><th style="width:38px">क्र०</th>${cols.map(([, label]) => `<th>${label}</th>`).join("")}</tr></thead>
              <tbody>${body}
                <tr class="tot"><td colspan="${amountIndex + 1}" style="text-align:right">योग</td><td class="calc num">${fmtN(sectionSum(state, section.key))}</td>${cols.slice(amountIndex + 1).map(() => "<td></td>").join("")}</tr>
              </tbody>
            </table>
          </div>
        </div>`;
      })
      .join("")}
    <div class="xbox">
      <div class="xh">कुल व्यय</div>
      <table><tbody>
        <tr><td>कुल योग</td><td class="v">${fmtN(totalBill)}</td></tr>
      </tbody></table>
    </div>
  </div>`;
};

const buildFencingBillHtml = (state) => {
  const c = calcFence(state);
  const title = `${state.fenceHeading} / घेरबाड़ — राजसहायता देयक`;
  const planLabel = state.planType;
  const kaam = state.fenceKaamPhrase;
  const actualAreaTxt = c.actualArea > 0 ? Number(c.actualArea).toFixed(2) : "—";
  const fullCost = c.hec > 0 ? Math.round(c.hec * state.costHa) : 0;
  const exact = fenceStandard(c.totalHec, state.fenceMap);

  let table = `<table><thead><tr><th style="width:44px">क्र०सं०</th><th>कार्य का विवरण</th>
    <th style="width:116px">देयक की कुल धनराशि</th><th style="width:138px">भुगतान की जाने वाली राजसहायता धनराशि</th>
    <th style="width:128px">कृषक द्वारा वहन की गयी धनराशि</th></tr></thead><tbody>`;
  c.rows.forEach((row, index) => {
    table += `<tr><td style="text-align:center">${index + 1}</td><td>${esc(row.name)}</td>
      <td class="calc num">${fmtN(row.amt)}</td><td class="calc num">${fmtN(row.sub)}</td>
      <td class="calc num">${fmtN(row.own)}</td></tr>`;
  });
  table += `<tr class="tot"><td colspan="2" style="text-align:right">योग</td>
    <td class="calc num">${fmtN(c.bill)}</td><td class="calc num">${fmtN(c.sub)}</td><td class="calc num">${fmtN(c.own)}</td></tr></tbody></table>`;

  let flag = "";
  if (!c.bases.length) {
    flag = `<div class="flag bad">व्यय विवरण, एम०बी०, अथवा भूमि का क्षेत्रफल — इनमें से कम से कम एक भरें।</div>`;
  } else {
    const min = c.bases.reduce((a, b) => (b.val < a.val ? b : a));
    flag = `<div class="flag ok">देय आधार — ${min.label}: ${fmt0(min.val)} (उपलब्ध आधारों में न्यूनतम)</div>`;
  }
  if (c.shortfall > 0) {
    flag += `<div class="flag bad">सत्यापित लम्बाई अनुमन्य ${fmtN(c.allowedLen).replace(/\.00$/, "")} मी० से ${fmtN(c.shortfall).replace(/\.00$/, "")} मी० कम है — उसी अनुपात में क्षेत्रफल घटाकर मानक लागत निकाली गयी है।</div>`;
  }
  if (c.mb > 0 && c.bill > 0 && c.bill > c.mb) {
    flag += `<div class="flag bad">बिल का योग एम०बी० मूल्यांकन से ${fmt0(c.bill - c.mb)} अधिक है — अंतर कृषक द्वारा स्वयं वहन किया जाएगा।</div>`;
  }
  if (c.capped) flag += `<div class="flag bad">गणना अधिकतम सीमा ${fmt0(c.cap)} से अधिक थी — राजसहायता सीमा तक ही देय।</div>`;

  return `<div class="doc bill-doc">
    <div class="bill-header">
      <div class="bill-kicker">उद्यान विभाग · राजसहायता प्रपत्र</div>
      <h3 class="bill-title">${esc(title)}</h3>
      <div class="bill-rule"></div>
      <div class="bill-meta">
        <div><span>योजना :</span><b>${esc(planLabel)}</b></div>
        <div><span>कार्यालय :</span><b>उद्यान विशेषज्ञ, कोटद्वार (गढ़वाल)</b></div>
        <div><span>वित्तीय वर्ष :</span><b>2026-27</b></div>
      </div>
    </div>
    <div class="serial-layout">
      <div class="serial-section">
        <div class="serial-title">1. कृषक का विवरण</div>
        <div class="kv">
          ${LR("नाम कृषक:", state.name)}${LR("पिता / पति का नाम:", state.father)}
          ${LR("ग्राम:", state.village)}${LR("पोस्ट ऑफिस:", state.post)}
          ${LR("विकास खण्ड:", state.block)}${LR("जनपद:", state.dist)}
          ${LR("आधार संख्या:", state.aadhar)}${LR("मोबाइल:", state.mob)}
          <div class="r"><b>खसरा / खतौनी सं० (स्वयं):</b><span class="auto">${esc((state.landRows && state.landRows[0] && state.landRows[0].khasra) || "…………")}</span></div>
          <div class="r"><b>वर्ग:</b><span class="auto">${esc(state.cat || "…………")}</span>
            <b>· लागू राजसहायता दर:</b><span class="auto">${(c.rate * 100).toFixed(0)}%</span></div>
        </div>
      </div>
      <div class="serial-section">
        <div class="serial-title">2. बैंक विवरण</div>
        <div class="kv">
          ${LR("बैंक का नाम:", state.bank)}${LR("शाखा:", state.branch)}
          ${LR("बैंक खाता संख्या:", state.acct)}${LR("IFSC कोड:", state.ifsc)}
        </div>
      </div>
      <div class="serial-section">
        <div class="serial-title">3. फेंसिंग एवं भूमि का विवरण</div>
        <div class="kv">
          <div class="r"><b>फेंसिंग सामग्री:</b><span class="auto">${esc(state.fenceMaterialName)}</span></div>
          <div class="r"><b>${applicantWord(state)} की प्रस्तावित भूमि — फेंसिंग हेतु:</b><span class="auto">${c.totalHec > 0 ? `${c.totalHec.toFixed(2)} हे०` : "…………"}</span></div>
          <div class="r"><b>अनुमन्य फेंसिंग लम्बाई:</b><span class="auto">${exact ? fmtN(exact.len).replace(/\.00$/, "") : "…………"}</span> मी०</div>
          <div class="r"><b>अनुमन्य खम्बे:</b><span class="auto">${exact ? fmtN(exact.poles).replace(/\.00$/, "") : "…………"}</span> नग</div>
        </div>
      </div>
      <div class="serial-section">
        <div class="serial-title">4. एम०बी० (मापपुस्तिका) के अनुसार मूल्यांकन — कनिष्ठ अभियन्ता द्वारा तैयार</div>
        <div class="kv">
          <div class="r"><b>मापी गयी वास्तविक लम्बाई:</b>${roField(state.mbLen || "", `class="ln rt sm" inputmode="decimal"`)}<b> मी०</b></div>
          <div class="r"><b>अथवा सीधे एम०बी० धनराशि:</b>${roField(state.mbAmt || "", `class="ln rt sm" inputmode="decimal"`)}<b> ₹</b></div>
          <div class="r"><b>एम०बी० मूल्यांकन धनराशि:</b><span class="auto">${c.mb ? fmt0(c.mb) : "—"}</span></div>
        </div>
      </div>
      <div class="serial-section">
        <div class="serial-title">5. प्रभारी द्वारा स्थलीय सत्यापन</div>
        <div class="kv">
          <div class="r"><b>क्षेत्रफलानुसार अनुमन्य लम्बाई:</b><span class="auto calc-hint">${c.allowedLen ? fmtN(c.allowedLen).replace(/\.00$/, "") + " मी०" : "…………"}</span></div>
          <div class="r"><b>स्थलीय सत्यापित वास्तविक लम्बाई:</b>${roField(state.verifiedLen || "", `class="ln rt sm" inputmode="decimal"`)}<b> मी०</b></div>
          <div class="r"><b>कार्य में कमी:</b><span class="auto">${c.shortfall > 0 ? fmtN(c.shortfall).replace(/\.00$/, "") : "0"}</span> मी०</div>
          <div class="r"><b>वास्तविक क्षेत्रफल (कमी समायोजित):</b><span class="auto">${c.actualArea > 0 ? Number(c.actualArea).toFixed(2) : "…………"}</span> हे०</div>
          <div class="r"><b>मानक लागत: वास्तविक क्षेत्रफल (${actualAreaTxt} हे०) × ₹2,00,000 प्रति हे०:</b><span class="auto">${c.standardCost ? fmt0(c.standardCost) : "—"}</span></div>
        </div>
      </div>
    </div>
    <div class="bill-table-heading">
      <div class="bill-table-title">कृषक द्वारा प्रस्तुत कार्य एवं व्यय का विवरण</div>
      <div class="bill-table-subtitle">प्रस्तुत बिल / वाउचर के आधार पर — एम०बी० एवं स्थलीय सत्यापन से मिलान हेतु</div>
    </div>
    ${table}
    <div>${flag}</div>
    <div class="xbox">
      <div class="xh">राजसहायता की गणना — तीनों में से न्यूनतम</div>
      <table><tbody>
        <tr><td>बिल / वाउचर के अनुसार कुल व्यय</td><td class="v">${c.bill ? fmt0(c.bill) : "— (नहीं भरा गया)"}</td></tr>
        <tr><td>एम०बी० मूल्यांकन धनराशि</td><td class="v">${c.mb ? fmt0(c.mb) : "— (नहीं भरा गया)"}</td></tr>
        <tr><td>मानक लागत: वास्तविक क्षेत्रफल (${actualAreaTxt} हे०) × ₹2,00,000 प्रति हे०</td><td class="v">${c.standardCost ? fmt0(c.standardCost) : "— (भूमि हे० भरें)"}</td></tr>
        <tr><td>राजसहायता हेतु स्वीकार्य आधार — उपरोक्त में से न्यूनतम</td><td class="v">${fmt0(c.base)}</td></tr>
        <tr><td>लागू राजसहायता दर</td><td class="v">${(c.rate * 100).toFixed(0)}%</td></tr>
        <tr class="hi"><td><b>देय राजसहायता धनराशि</b></td><td class="v">${fmt0(c.sub)}</td></tr>
        <tr><td>कृषक अंश (आधार × शेष दर — मानक अनुसार)</td><td class="v">${fmt0(Math.round(c.base * (1 - c.rate)))}</td></tr>
        <tr><td>मानक की अधिकतम अनुदान सीमा (मानक लागत × दर)</td><td class="v">${fmt0(c.sub)}</td></tr>
        <tr><td>मानक से कम हुई लागत (कमी के कारण)</td><td class="v">${fmt0(Math.max(0, fullCost - c.standardCost))}</td></tr>
        <tr><td>कृषक द्वारा वहन की गयी वास्तविक धनराशि (बिल − राजसहायता)</td><td class="v">${fmt0(c.own)}</td></tr>
      </tbody></table>
    </div>
    <div class="note-box">
      <div class="note-title">महत्वपूर्ण नोट — फेंसिंग कार्य की गणना</div>
      <div>• मानक लागत: वास्तविक क्षेत्रफल (${actualAreaTxt} हे०) × ₹2,00,000 प्रति हे० = ${c.standardCost ? fmt0(c.standardCost) : "—"}</div>
      <div style="margin-top:5px">• सत्यापित लम्बाई कम होने पर क्षेत्रफल एवं मानक लागत उसी अनुपात में निर्धारित की गई है।</div>
      <div style="margin-top:5px">• देय आधार: उपलब्ध आधारों में न्यूनतम राशि — ${c.base ? fmt0(c.base) : "—"}</div>
      <div style="margin-top:5px">• कृषक अंश: आधार राशि पर लागू शेष दर के अनुसार।</div>
      <div style="margin-top:5px">• कृषक द्वारा वहन की गयी वास्तविक धनराशि: बिल राशि में से देय राजसहायता घटाकर।</div>
    </div>
    <p style="margin:10px 0 0"><b>संलग्न:</b> बिल वाउचर, एम०बी०, जियो टैग कलर फोटोग्राफ आदि।</p>
    <div class="decl">प्रमाणित किया जाता है कि मेरे द्वारा ${planLabel} अन्तर्गत ${kaam} पर उक्तानुसार धनराशि व्यय की गई है।
    अतः राजसहायता की धनराशि ${fmt0(c.sub)} (${words(c.sub)} रुपये मात्र) का भुगतान मुझे करने की कृपा कीजिएगा।</div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:22px;gap:20px">
      <div class="bill-date-place" style="flex:0 0 auto">
        <div style="display:flex;gap:6px;align-items:baseline"><b>देयक दिनांक:</b>${roField(state.billDate || "", `class="ln sm" type="date"`)}</div>
        <div style="display:flex;gap:6px;align-items:baseline;margin-top:8px"><b>स्थान:</b><input class="ln sm" readonly tabindex="-1" value="${esc(state.centerLine)}"></div>
      </div>
      <div style="text-align:center;min-width:240px;border-top:1px solid var(--ink);padding-top:5px">
        हस्ताक्षर ${G(state, "कृषक", "कृषिका")}<br><span class="auto">${esc(state.name || "…………")}</span></div>
    </div>
    <div class="decl" style="margin-top:26px">प्रमाणित किया जाता है कि मेरे द्वारा ${planLabel} अन्तर्गत ${kaam} कार्य का स्थलीय निरीक्षण कर लिया गया है। प्रभारी द्वारा सत्यापित वास्तविक लम्बाई: ${c.verifiedLen ? fmtN(c.verifiedLen).replace(/\.00$/, "") : "…………"} मी०। एम०बी० (मापपुस्तिका) के अनुसार मूल्यांकन — कनिष्ठ अभियन्ता द्वारा तैयार; मापी गयी वास्तविक लम्बाई: ${c.mbLen ? fmtN(c.mbLen).replace(/\.00$/, "") : "…………"} मी०; मूल्यांकन धनराशि: ${c.mb ? fmt0(c.mb) : "…………"}। बिल में दर्शायी गयी कुल राशि: ${c.bill ? fmt0(c.bill) : "…………"}। बिल, एम०बी० एवं स्थलीय सत्यापन का मिलान करने के उपरान्त लागू आधार पर देय राजसहायता धनराशि ${fmt0(c.sub)} कृषक को भुगतान हेतु देयक सत्यापित कर संस्तुति सहित अग्रसारित।</div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:20px;gap:20px">
      <div style="font-size:13px;color:#4A5A50;display:flex;gap:6px;align-items:baseline;flex-wrap:wrap"></div>
      <div style="text-align:center;min-width:240px;border-top:1px solid var(--ink);padding-top:5px;margin-left:auto">
        हस्ताक्षर प्रभारी<br><span class="auto">${esc(state.officer || "…………")}${state.desig ? `<br>${esc(state.desig)}` : ""}</span></div>
    </div>
  </div>`;
};

export const buildFencingDocuments = (raw, fenceMap, centerName) => {
  const state = buildFenceState(raw, fenceMap, centerName);
  return [
    { id: "application", label: "फेंसिंग आवेदन पत्र", html: buildFencingApplicationHtml(state), pageBreakBefore: false },
    { id: "work", label: "व्यय विवरण", html: buildFencingWorkHtml(state), pageBreakBefore: true },
    { id: "bill", label: "देयक प्रपत्र", html: buildFencingBillHtml(state), pageBreakBefore: true },
  ];
};
