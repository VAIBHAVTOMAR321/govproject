// Admin print preview — वर्मी कम्पोस्ट documents.
// Mirrors the print documents produced by src/componets/kishanavedan/KisanAvedan.js
// (buildVermiApplication + buildVermiAffidavit + buildVermiBill + the expense
// section of buildWork), reading values straight from the API record.

import { esc, fmt0, fmtN, num, roField, roSelect, words } from "./adminPrintCommon";

const DISTRICT_NAME = "पौड़ी गढ़वाल";

const genderFromApi = (value) => {
  const key = String(value || "").trim().toLowerCase();
  if (key === "male" || key === "पुरुष") return "पुरुष";
  if (key === "female" || key === "महिला") return "महिला";
  return "";
};

const buildVermiState = (raw) => {
  const personal = raw.personal || {};
  const expenses = raw.expenses || {};

  const standardCost = num(expenses.standard_cost) || 33333;
  const subsidyRate = num(expenses.subsidy_rate) || 75;
  const cap = num(expenses.maximum_subsidy) || Math.round(standardCost * subsidyRate / 100);

  const mbSources = [
    expenses.mb_valuation_amount,
    raw.mb_details && raw.mb_details.mb_valuation_amount,
    personal.mb_valuation_amount,
  ];
  const mbLoaded = mbSources.find((value) => value !== null && value !== undefined && String(value).trim() !== "");

  return {
    name: personal.full_name || personal.farmer_name || "",
    father: personal.father_name || personal.father_husband_name || "",
    village: personal.village || "",
    post: personal.post || "",
    tehsil: personal.tehsil || "",
    dist: personal.dist || DISTRICT_NAME,
    block: personal.block || "",
    mob: personal.mob || personal.mobile || "",
    aadhar: personal.aadhar || personal.aadhaar || "",
    khasra: personal.khasra || "",
    hortiCard: personal.horticulture_card || personal.garden_card || "",
    gender: genderFromApi(personal.gender),
    bank: personal.bank_name || "",
    branch: personal.branch || personal.bank_branch || "",
    acct: personal.account || personal.bank_account_number || "",
    ifsc: personal.ifsc || personal.bank_ifsc || "",
    cat: personal.category || "सामान्य",
    farmerCat: personal.farmer_category || "सीमांत",
    proposedArea: personal.proposed_area || "",
    irrigation: personal.irrigation || "उपलब्ध",
    place: personal.place || "",
    date: personal.date || "",
    officer: personal.officer || "",
    desig: personal.designation || "",
    mbAmt: mbLoaded === undefined ? "" : mbLoaded,
    rate: subsidyRate,
    standardCost,
    cap,
    crops: Array.isArray(personal.crop_details) && personal.crop_details.length
      ? personal.crop_details.map((row) => ({ name: Array.isArray(row) ? row[0] : "", area: Array.isArray(row) ? row[1] : "" }))
      : [],
    expenses: Array.isArray(expenses.vermi_expenses) ? expenses.vermi_expenses : [],
  };
};

const expenseBillRows = (state) =>
  state.expenses.filter((row) => {
    const item = Array.isArray(row) ? row[0] : "";
    const amount = Array.isArray(row) ? row[1] : 0;
    return String(item || "").trim() !== "" || num(amount) > 0;
  });

const calcVermi = (state) => {
  const parts = [["वर्मी कम्पोस्ट इकाई निर्माण कार्य", expenseBillRows(state).reduce((total, row) => total + num(Array.isArray(row) ? row[1] : 0), 0)]];
  const bill = parts.reduce((total, part) => total + part[1], 0);
  const rate = state.rate / 100;
  const mb = num(state.mbAmt);
  const standardCost = state.standardCost;

  const bases = [];
  if (bill > 0) bases.push({ key: "bill", label: "बिल / वाउचर के अनुसार कुल व्यय", val: bill });
  if (mb > 0) bases.push({ key: "mb", label: "एम०बी० मूल्यांकन धनराशि", val: mb });
  if (standardCost > 0) bases.push({ key: "standard", label: "मानक लागत (10 फीट × 8 फीट × 2.5 फीट)", val: standardCost });
  const base = bases.length ? Math.min(...bases.map((entry) => entry.val)) : 0;
  const shortfall = Math.max(0, standardCost - base);

  let subsidy = Math.round(base * rate);
  const capped = state.cap > 0 && subsidy > state.cap;
  if (capped) subsidy = state.cap;

  const effective = bill ? subsidy / bill : 0;
  const rows = [];
  let running = 0;
  parts.forEach((part, index) => {
    const value = index < parts.length - 1 ? Math.round(part[1] * effective) : Math.max(0, subsidy - running);
    running += value;
    rows.push({ name: part[0], amt: part[1], sub: value, own: part[1] - value });
  });

  return { bill, mb, base, bases, rate, sub: subsidy, own: bill - subsidy, cap: state.cap, capped, standardCost, shortfall, rows };
};

const field = (label, input) => `<div class="field"><label>${label}</label>${input}</div>`;

const buildVermiApplicationHtml = (state) => {
  const f = state;
  const cropRows = f.crops.length
    ? f.crops
        .map(
          (row, index) =>
            `<tr><td class="n">${index + 1}</td><td>${roField(row.name || "", `placeholder="फसल / बागवानी फसल का नाम"`)}</td><td>${roField(row.area || "", `inputmode="decimal" placeholder="हे०"`)}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="3" class="empty">कोई फसल नहीं जोड़ी गई</td></tr>`;

  return `<div class="appdoc">
    <div style="text-align:center;font-size:11.5px;color:#65746B;margin:2px 0 4px">उद्यान विभाग · वित्तीय वर्ष 2026-27</div>
    <h3 style="text-decoration:underline">राज्य सेक्टर योजना अन्तर्गत वर्मी कम्पोस्ट इकाई हेतु</h3>
    <h4 style="color:var(--ink);font-size:16px;font-weight:600">कृषक आवेदन पत्र</h4>

    <div class="st">आवेदक का विवरण</div>
    <div class="grid2">
      ${field("कृषक का नाम", roField(f.name || ""))}
      ${field("पिता / पति का नाम", roField(f.father || ""))}
      ${field("ग्राम", roField(f.village || ""))}
      ${field("डाकघर", roField(f.post || ""))}
      ${field("तहसील", roField(f.tehsil || "", `placeholder="तहसील का नाम"`))}
      ${field("जनपद", roField(f.dist || DISTRICT_NAME, `readonly disabled title="यह जनपद पूर्व निर्धारित है"`))}
      ${field("उद्यान कार्ड संख्या", roField(f.hortiCard || ""))}
      ${field("मोबाइल नं.", roField(f.mob || "", `inputmode="numeric" maxlength="10"`))}
      ${field("आधार संख्या", roField(f.aadhar || "", `inputmode="numeric" maxlength="12"`))}
      ${field("खाता / खतौनी संख्या", roField(f.khasra || ""))}
      ${field("लिंग", roSelect(f.gender || "", ["चुनें", "पुरुष", "महिला"]))}
    </div>

    <div class="st">भूमि का विवरण</div>
    <div class="grid2">
      ${field("भूमि का क्षेत्रफल (हे०)", roField(f.proposedArea || "", `inputmode="decimal" placeholder="हे० में क्षेत्रफल"`))}
    </div>

    <div class="st">कृषक की खेती का विवरण</div>
    <table class="expense-table"><colgroup><col style="width:38px"><col><col style="width:140px"></colgroup><thead><tr>
      <th>क्र०</th><th>फसल / बागवानी फसल का नाम</th><th>क्षेत्रफल (हे०)</th>
    </tr></thead><tbody>${cropRows}</tbody></table>

    <div class="st">बैंक विवरण</div>
    <div class="grid2">
      ${field("विकासखण्ड", roField(f.block || ""))}
      ${field("बैंक का नाम", roField(f.bank || ""))}
      ${field("शाखा", roField(f.branch || ""))}
      ${field("बैंक खाता संख्या", roField(f.acct || ""))}
      ${field("IFSC कोड", roField(f.ifsc || ""))}
    </div>

    <div class="st">स्थान एवं दिनांक</div>
    <div class="grid2">
      ${field("स्थान", roField(f.place || "", `placeholder="स्थान का नाम"`))}
      ${field("दिनांक", roField(f.date || "", `type="date"`))}
    </div>

    <div class="st">7. घोषणा</div>
    <div class="declaration-box">
      <p>उपर्युक्त सभी विवरण मेरी जानकारी में पूर्णतः सत्य हैं। मुझे पूर्व में किसी भी सरकारी योजना से वर्मी कम्पोस्ट यूनिट हेतु अनुदान प्राप्त नहीं हुआ है। यूनिट की स्थापना व रखरखाव विभागीय दिशा-निर्देशों के अनुसार मेरी जिम्मेदारी होगी।</p>
      <div class="farmer-signature">
        <div>कृषक का नाम : <strong>${esc(f.name || "…………")}</strong></div>
        <div>कृषक के हस्ताक्षर : ______________________________</div>
      </div>
    </div>

    <div class="st">संलग्न दस्तावेज</div>
    <div class="note">
      1. खाता-खतौनी की प्रति — 6 माह से अधिक पुरानी नहीं हो।<br>
      2. आधार कार्ड की प्रति।<br>
      3. उद्यान कार्ड की प्रति।<br>
      4. बैंक खाते का विवरण / बैंक पासबुक की प्रति।<br>
      5. ₹10 का नोटरीकृत शपथ-पत्र।
    </div>

    <div class="st">8. प्रभारी की आख्या</div>
    <div class="declaration-box prabhari-box">
      <p>प्रमाणित किया जाता है कि कृषक द्वारा प्रस्तुत आवेदन, भूमि अभिलेख एवं अन्य संबंधित अभिलेखों का परीक्षण कर लिया गया है। आवेदन में अंकित विवरण एवं प्रस्तुत अभिलेख सही पाए गए हैं।अतः कृषक आवेदन <strong>उद्यान विशेषज्ञ, कोटद्वार महोदय की सेवा में वर्क ऑर्डर जारी करने हेतु संस्तुति सहित अग्रसारित</strong> है।</p>
      <p style="margin-top:24px;"><strong>प्रभारी, उद्यान सचल दल केन्द्र</strong><br>
      <strong>केन्द्र का नाम :</strong> <span style="display:inline-block;min-width:300px;border-bottom:1px solid #333;text-align:center">&nbsp;</span></p>
    </div>
  </div>`;
};

const buildVermiAffidavitHtml = (state) => {
  const f = state;
  const name = esc(f.name || "…………");
  const father = esc(f.father || "…………");
  const village = esc(f.village || "…………");
  const post = esc(f.post || "…………");
  const tehsil = esc(f.tehsil || "…………");
  const dist = esc(f.dist || "…………");
  const horti = esc(f.hortiCard || "…………");
  const khasra = esc(f.khasra || "…………");
  const place = esc(f.place || "…………");
  const date = esc(f.date || "…………");
  const mob = esc(f.mob || "…………");

  return `<div class="appdoc" style="padding:34px 40px">
    <h2 style="text-align:center">शपथ-पत्र</h2>
    <h3 style="text-align:center">(वर्मी कम्पोस्ट यूनिट निर्माण हेतु)</h3>
    <p>मैं <b>${name}</b> पुत्र / पुत्री / पत्नी श्री <b>${father}</b>, निवासी ग्राम <b>${village}</b> डाकघर <b>${post}</b>, तहसील <b>${tehsil}</b> जनपद <b>${dist}</b>, उद्यान कार्ड (कृषक पहचान) संख्या <b>${horti}</b></p>
    <p>यह शपथपूर्वक कथन करता / करती हूँ कि—</p>
    <p><b>1.</b> मेरा नाम, पता एवं अन्य व्यक्तिगत विवरण उपर्युक्त अनुसार पूर्णतः सत्य, सही एवं प्रमाणिक हैं।</p>
    <p><b>2.</b> मेरे द्वारा राज्य सेक्टर योजनान्तर्गत <b>वर्मी कम्पोस्ट यूनिट निर्माण हेतु</b> उद्यान विभाग में विधिवत आवेदन किया गया है।</p>
    <p><b>3.</b> जिस भूमि पर वर्मी कम्पोस्ट यूनिट का निर्माण किया गया है, वह भूमि मेरे वैधानिक स्वामित्व एवं वास्तविक कब्जे में है।</p>
    <p>ग्राम : <b>${village}</b> &nbsp;&nbsp; खाता संख्या : <b>${khasra}</b></p>
    <p><b>4.</b> मेरे द्वारा उक्त भूमि पर विभागीय मानकों के अनुसार <b>10 फीट × 8 फीट × 2.5 फीट आकार की पक्की वर्मी कम्पोस्ट यूनिट</b> का निर्माण किया गया है।</p>
    <p><b>5.</b> उक्त वर्मी कम्पोस्ट यूनिट की प्रो-रेटा लागत <b>₹33,333/-</b>, देय 75 प्रतिशत राजसहायता <b>₹24,998/-</b> तथा कृषक का 25 प्रतिशत अंशदान <b>₹8,335/-</b> है।</p>
    <p><b>6.</b> इससे पूर्व मेरे द्वारा उक्त यूनिट हेतु किसी अन्य सरकारी विभाग / संस्था / योजना / परियोजना से कोई सरकारी अनुदान, सहायता अथवा वित्तीय लाभ प्राप्त नहीं किया गया है।</p>
    <p><b>7.</b> मेरे द्वारा प्रस्तुत समस्त दस्तावेज, भूमि अभिलेख, बैंक विवरण, बिल / वाउचर एवं अन्य जानकारी सत्य एवं सही है।</p>
    <p><b>8.</b> यूनिट का निर्माण विभागीय तकनीकी मानकों एवं दिशा-निर्देशों के अनुरूप किया गया है। भिन्नता पाए जाने पर उसकी जिम्मेदारी मेरी होगी।</p>
    <p><b>9.</b> यूनिट के रख-रखाव, सफाई, संचालन, केंचुओं की देखभाल एवं नमी बनाए रखने की जिम्मेदारी मेरी होगी।</p>
    <p><b>10.</b> कोई जानकारी असत्य या भ्रामक पाए जाने पर विभाग को आवेदन / राजसहायता निरस्त करने तथा प्राप्त राशि की वसूली करने का अधिकार होगा।</p>
    <p><b>11.</b> मैं योजना की निर्धारित शर्तों एवं विभागीय दिशा-निर्देशों से सहमत हूँ।</p>
    <p>मैं यह शपथ-पत्र पूर्ण होश-हवास में, बिना किसी दबाव, प्रलोभन अथवा भय के, अपनी स्वेच्छा से सत्यनिष्ठा के साथ दे रहा / रही हूँ।</p>
    <div style="margin-top:22px">स्थान : <b>${place}</b><br>दिनांक : <b>${date}</b></div>
    <div style="margin-top:28px;text-align:right">शपथकर्ता के हस्ताक्षर : ____________________<br><br>
    नाम : <b>${name}</b><br><br>मोबाइल नं. : <b>${mob}</b></div>
  </div>`;
};

const buildVermiWorkHtml = (state) => {
  const rows = expenseBillRows(state);
  const total = rows.reduce((sum, row) => sum + num(Array.isArray(row) ? row[1] : 0), 0);
  const body = rows.length
    ? rows
        .map(
          (row, index) =>
            `<tr><td class="n">${index + 1}</td><td>${roField(Array.isArray(row) ? row[0] || "" : "", `placeholder="कार्य / सामग्री का विवरण"`)}</td><td class="calc num">${fmtN(num(Array.isArray(row) ? row[1] : 0))}</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="3" class="empty">कोई प्रविष्टि नहीं जोड़ी गई है।</td></tr>`;

  return `<div class="card">
    <div class="cap"><i></i>वर्मी कम्पोस्ट इकाई — सामग्री एवं व्यय<small>ईंट, सीमेंट, रेत, बजरी, चिनाई, केंचुए, गोबर आदि</small></div>
    <div class="pad">
      <table class="expense-table">
        <colgroup><col style="width:38px"><col style="width:62%"><col style="width:38%"></colgroup>
        <thead><tr><th>क्र०</th><th>कार्य / सामग्री का विवरण</th><th>बिल राशि (₹)</th></tr></thead>
        <tbody>${body}
          <tr class="tot"><td colspan="2" style="text-align:right">योग</td><td class="calc num">${fmtN(total)}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="note">कार्य / सामग्री: ईंट, सीमेंट, रेत, बजरी, चिनाई मजदूरी, प्लास्टर कार्य, केंचुए (वर्म कल्चर), गोबर / जैविक अपशिष्ट, छाया हेतु शेड / तिरपाल एवं अन्य।</div>`;
};

const buildVermiBillHtml = (state) => {
  const f = state;
  const c = calcVermi(state);
  const rows = expenseBillRows(state);

  let table = `<table><colgroup><col style="width:10%"><col style="width:58%"><col class="num" style="width:32%"></colgroup><thead><tr><th style="width:10%">क्र०</th><th style="width:58%">कार्य / सामग्री का विवरण</th><th class="num" style="width:32%">बिल राशि (₹)</th></tr></thead><tbody>`;
  if (rows.length) {
    rows.forEach((row, index) => {
      table += `<tr><td style="text-align:center">${index + 1}</td><td>${esc(Array.isArray(row) ? row[0] || "…………" : "…………")}</td><td class="num">${fmtN(num(Array.isArray(row) ? row[1] : 0))}</td></tr>`;
    });
  } else {
    table += `<tr><td colspan="3" class="empty">व्यय विवरण में कोई प्रविष्टि नहीं जोड़ी गई है।</td></tr>`;
  }
  table += `</tbody><tfoot><tr><th colspan="2" class="num">कुल योग</th><th class="num">₹ ${fmtN(c.bill)}</th></tr></tfoot></table>`;

  return `<div class="appdoc" style="padding:34px 40px">
    <h3 style="text-align:center;margin:0 0 2px">वर्मी कम्पोस्ट इकाई — राजसहायता देयक प्रपत्र</h3>
    <h4 style="text-align:center;margin:0 0 18px">उद्यान विभाग · राज्य सेक्टर योजना · वित्तीय वर्ष 2026-27</h4>

    <div class="st">1. कृषक का विवरण</div>
    <table><colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup><tbody>
      <tr><td>नाम कृषक</td><td>${esc(f.name || "…………")}</td><td>पिता / पति का नाम</td><td>${esc(f.father || "…………")}</td></tr>
      <tr><td>ग्राम</td><td>${esc(f.village || "…………")}</td><td>विकासखण्ड</td><td>${esc(f.block || "…………")}</td></tr>
      <tr><td>जनपद</td><td>${esc(f.dist || "…………")}</td><td>आधार संख्या</td><td>${esc(f.aadhar || "…………")}</td></tr>
      <tr><td>बैंक का नाम</td><td>${esc(f.bank || "…………")}</td><td>शाखा</td><td>${esc(f.branch || "…………")}</td></tr>
      <tr><td>खाता संख्या</td><td>${esc(f.acct || "…………")}</td><td>IFSC कोड</td><td>${esc(f.ifsc || "…………")}</td></tr>
    </tbody></table>

    <div class="st">2. इकाई का विवरण</div>
    <table><colgroup><col style="width:34%"><col style="width:66%"></colgroup><tbody>
      <tr><td>यूनिट का आकार</td><td>10 फीट × 8 फीट × 2.5 फीट (पक्की संरचना)</td></tr>
      <tr><td>मानक लागत</td><td>₹ ${c.standardCost.toLocaleString("en-IN")}</td></tr>
      <tr><td>राजसहायता दर</td><td>${(c.rate * 100).toFixed(0)}%</td></tr>
    </tbody></table>

    <div class="st">3. प्रस्तुत व्यय (बिल / वाउचर)</div>
    ${table}

    <div class="st">4. राजसहायता की गणना — तीनों में से न्यूनतम</div>
    <table class="summaryTbl"><colgroup><col style="width:62%"><col style="width:38%"></colgroup><tbody>
      <tr><td>बिल / वाउचर के अनुसार कुल व्यय</td><td class="sv">${c.bill ? fmt0(c.bill) : "—"}</td></tr>
      <tr><td>एम०बी० मूल्यांकन धनराशि</td><td class="sv">${c.mb ? fmt0(c.mb) : "—"}</td></tr>
      <tr><td>मानक लागत (10 फीट × 8 फीट × 2.5 फीट)</td><td class="sv">${fmt0(c.standardCost)}</td></tr>
      <tr class="hi"><td>राजसहायता हेतु स्वीकार्य आधार — उपरोक्त में से न्यूनतम</td><td class="sv">${fmt0(c.base)}</td></tr>
      <tr><td>लागू राजसहायता दर</td><td class="sv">${(c.rate * 100).toFixed(0)}%</td></tr>
      <tr class="hi"><td>देय राजसहायता धनराशि</td><td class="sv big">${fmt0(c.sub)}</td></tr>
      <tr><td>कृषक अंश (आधार × शेष दर — मानक अनुसार)</td><td class="sv">${fmt0(c.base - c.sub)}</td></tr>
      <tr><td>मानक की अधिकतम अनुदान सीमा (मानक लागत × दर)</td><td class="sv">${fmt0(c.cap || 24998)}</td></tr>
      <tr><td>मानक से कम हुई लागत (कमी के कारण)</td><td class="sv">${fmt0(c.shortfall)}</td></tr>
      <tr><td>कृषक द्वारा वहन की गयी वास्तविक धनराशि (बिल − राजसहायता)</td><td class="sv">${c.bill > 0 ? fmt0(c.own) : "—"}</td></tr>
    </tbody></table>

    <div class="note">
      <b>महत्वपूर्ण नोट — वर्मी कम्पोस्ट इकाई की गणना</b><br>
      • मानक लागत: एक इकाई (10 फीट × 8 फीट × 2.5 फीट) हेतु निर्धारित ₹${c.standardCost.toLocaleString("en-IN")}।<br>
      • देय आधार: बिल / वाउचर राशि, एम०बी० मूल्यांकन धनराशि एवं मानक लागत — इनमें से न्यूनतम राशि (${fmt0(c.base)})।<br>
      • कृषक अंश: आधार राशि पर लागू शेष दर (${100 - (c.rate * 100).toFixed(0)}%) के अनुसार।<br>
      • कृषक द्वारा वहन की गयी वास्तविक धनराशि: बिल राशि में से देय राजसहायता घटाकर।
    </div>

    <div style="margin-top:12px">संलग्न : बिल / वाउचर, एम०बी० (मापपुस्तिका), जियो टैग कलर फोटोग्राफ, कृषक का शपथ-पत्र आदि।</div>

    <div class="st">5. कृषक का प्रमाणपत्र</div>
    <div class="report-box">प्रमाणित किया जाता है कि मेरे द्वारा राज्य सेक्टर योजना अन्तर्गत वर्मी कम्पोस्ट इकाई के निर्माण पर उक्तानुसार धनराशि व्यय की गई है। अतः राजसहायता की धनराशि <b>${fmt0(c.sub)}</b> (${words(c.sub)}) का भुगतान मुझे करने की कृपा कीजिएगा।</div>
    <div class="farmer-signature" style="display:flex;justify-content:space-between;gap:30px;margin-top:24px;line-height:1.8">
      <div>दिनांक : <b>${esc(f.date || "…………")}</b><br>स्थान : <b>${esc(f.place || "…………")}</b></div>
      <div style="text-align:right">हस्ताक्षर कृषक<br><br><b>${esc(f.name || "…………")}</b></div>
    </div>

    <div class="st">6. प्रभारी की आख्या एवं सत्यापन</div>
    <div class="report-box">प्रमाणित किया जाता है कि मेरे द्वारा वर्मी कम्पोस्ट इकाई के निर्माण कार्य का स्थलीय निरीक्षण कर लिया गया है तथा इकाई विभागीय मानक (10 फीट × 8 फीट × 2.5 फीट) के अनुरूप पूर्ण पायी गयी। एम०बी० (मापपुस्तिका) के अनुसार कनिष्ठ अभियन्ता द्वारा तैयार मूल्यांकन धनराशि : <b>${c.mb ? fmt0(c.mb) : "…………"}</b>। बिल में दर्शायी गयी कुल राशि : <b>${c.bill > 0 ? fmt0(c.bill) : "…………"}</b>। बिल, एम०बी० एवं स्थलीय सत्यापन का मिलान करने के उपरान्त लागू आधार पर देय राजसहायता धनराशि <b>${fmt0(c.sub)}</b> कृषक को भुगतान हेतु देयक सत्यापित कर संस्तुति सहित अग्रसारित।</div>
    <div class="report-sign" style="margin-top:24px;text-align:right;line-height:1.8">हस्ताक्षर प्रभारी<br>…………</div>
  </div>`;
};

export const buildVermiDocuments = (raw) => {
  const state = buildVermiState(raw);
  return [
    { id: "application", label: "आवेदन पत्र", html: buildVermiApplicationHtml(state), pageBreakBefore: false },
    { id: "affidavit", label: "शपथ-पत्र", html: buildVermiAffidavitHtml(state), pageBreakBefore: true },
    { id: "work", label: "व्यय विवरण", html: buildVermiWorkHtml(state), pageBreakBefore: true },
    { id: "bill", label: "देयक प्रपत्र", html: buildVermiBillHtml(state), pageBreakBefore: true },
  ];
};
