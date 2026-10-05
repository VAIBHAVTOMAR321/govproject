// Admin print preview — ड्रैगन फ्रूट (कमलम) / कीवी उद्यान स्थापना documents.
// Mirrors the print documents produced by
// src/componets/kishanavedan/DragfruitsAndKiwi.js and
// src/componets/kishanavedan/KiwiFruits.js — each scheme keeps its own wording,
// quantities and page management exactly as defined in its own component.

import { esc, money, num } from "./adminPrintCommon";

const DRAGON_MASTER = {
  key: "dragon",
  name: "ड्रैगन फ्रूट (कमलम)",
  baseNali: 20,
  subsidy: (n) => (n <= 50 ? 80 : 50),
  components: [
    {
      name: "भूमि रेखांकन एवं अन्य तैयारी",
      qty: () => ({ v: "सम्पूर्ण परियोजना क्षेत्र हेतु", u: "" }),
      cost: 12000,
      spec: "भूमि समतलीकरण, जुताई, निराई-गुड़ाई, ढलान अनुसार मेड़बंदी तथा स्थल का लेआउट निर्धारित दूरी के अनुसार किया जाएगा। पिल्लर से पिल्लर 2.0 मीटर तथा लाइन से लाइन 3.0 मीटर की व्यवस्था रहेगी।",
    },
    {
      name: "गड्ढा खुदान/भरान, बंड, खाद एवं उर्वरक प्रबंधन",
      qty: (n) => {
        const table = { 5: 167, 10: 333, 15: 500, 20: 666 };
        const pillars = Object.prototype.hasOwnProperty.call(table, Number(n)) ? table[Number(n)] : Math.round(666 * (Number(n) / 20));
        return { v: pillars * 4, u: "गड्ढे (प्रति पिल्लर 4)" };
      },
      cost: 90000,
      spec: "गड्ढे का आकार 0.20 मीटर × 0.20 मीटर × 0.20 मीटर। प्रत्येक गड्ढे को 0.30 मीटर ऊँचाई तक भराई करनी होगी। प्रत्येक पिल्लर के आधार पर 4 गड्ढे। प्रति गड्ढा 2–3 किलोग्राम कम्पोस्ट तथा 50 ग्राम सिंगल सुपर फॉस्फेट (SSP) मिलाना अनिवार्य।",
    },
    {
      name: "ड्रिप सिंचाई प्रणाली एवं फर्टिगेशन",
      qty: () => ({ v: "1", u: "पूर्ण सेट" }),
      cost: 44000,
      spec: "PMKSY मानकों के अनुसार संपूर्ण ड्रिप प्रणाली: वाटर टैंक, केन्द्रिफ्यूगल पम्प, बाईपास वाल्व, स्क्रीन फिल्टर/सेंड सेपरेटर, वेंचुरी इंजेक्टर, प्रेशर गेज, NRV, मुख्य लाइन, उप-मुख्य लाइन, कंट्रोल वाल्व, एयर रिलीज वाल्व, फ्लश वाल्व, लैटरल लाइन, इंडकैप तथा ड्रिपर/इमीटर्स। प्रति पिल्लर कम से कम 4 ड्रिपर।",
    },
    {
      name: "RCC पिल्लर सिस्टम + कंक्रीट रिंग",
      qty: (n) => {
        const table = { 5: 167, 10: 333, 15: 500, 20: 666 };
        const pillars = Object.prototype.hasOwnProperty.call(table, Number(n)) ? table[Number(n)] : Math.round(666 * (Number(n) / 20));
        return { v: pillars, u: "नग" };
      },
      cost: 265000,
      spec: "RCC पिल्लर: लंबाई 2.30 मीटर, क्रॉस-सेक्शन 5×5 इंच (लगभग 12.5×12.5 सेमी)। भूमि की सतह से 1.80 मीटर ऊपर और 0.50 मीटर भूमि के अंदर। शीर्ष पर कंक्रीट रिंग: व्यास 2 फीट, मोटाई 2 इंच, 8 इंच के 4 छेद। पिल्लर से पिल्लर दूरी 2.0 मीटर और लाइन से लाइन 3.0 मीटर।",
    },
    {
      name: "GI चेन लिंक्ड फेंसिंग",
      qty: (n) => ({ v: Math.round(200 + 4 * Number(n)), u: "मीटर" }),
      cost: 175000,
      spec: "जाली की ऊँचाई 1.8 मीटर, तार की मोटाई 2.5 mm (BWG), मेश 4×4 इंच। लोहे के खम्भे 3 मीटर की दूरी पर तथा कंक्रीट से स्थापित। प्रवेश द्वार कम से कम 10–12 फीट चौड़ा। फेंसिंग की लंबाई किसान के स्वीकृत क्षेत्रफल की area-wise table के अनुसार होगी।",
    },
    {
      name: "उर्वरक एवं पौध रक्षा रसायन",
      qty: () => ({ v: "1", u: "प्रथम वर्ष की मानक आवश्यकता" }),
      cost: 10000,
      spec: "प्रथम वर्ष हेतु आवश्यक नाइट्रोजन, फास्फोरस, पोटाश तथा कीटनाशक/फफूंदनाशक; जैसे 19:19:19 NPK, सल्फेट ऑफ पोटाश, बोरान, जिंक एवं आवश्यकता अनुसार स्प्रे।",
    },
    {
      name: "रोपण सामग्री",
      qty: (n) => {
        const table = { 5: 167, 10: 333, 15: 500, 20: 666 };
        const pillars = Object.prototype.hasOwnProperty.call(table, Number(n)) ? table[Number(n)] : Math.round(666 * (Number(n) / 20));
        const plants = pillars * 4;
        return { v: plants, u: `नग (प्रति पिल्लर 4 पौधे × ${pillars} पिल्लर)` };
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
};

const KIWI_MASTER = {
  key: "kiwi",
  name: "कीवी उद्यान स्थापना",
  baseNali: 20,
  subsidy: (n, type) => (type === "group" ? (n / 50 <= 5 ? 70 : 50) : n / 50 <= 1 ? 70 : 50),
  components: [
    { name: "भूमि विकास", qty: () => ({ v: "सम्पूर्ण परियोजना क्षेत्र हेतु", u: "" }), cost: 60000, spec: "भूमि समतलीकरण, सफाई, जुताई, ढलान के अनुसार मेड़बंदी तथा 6 मीटर × 4 मीटर की रोपण दूरी के अनुसार स्थल का layout/रेखांकन।" },
    { name: "गड्ढा खुदान एवं भराई", qty: (n) => ({ v: Math.round(167 * (n / 20)), u: "मुख्य गड्ढे" }), cost: 50000, spec: "कुल मुख्य गड्ढे निर्धारित अनुपात में। गड्ढे का आकार 1 मीटर × 1 मीटर × 1 मीटर। प्रति गड्ढा 30 किलोग्राम कम्पोस्ट मिलाकर भराई तथा भूमि सतह से 0.30 मीटर ऊँचाई तक भराव। रोपण दूरी 6 मीटर × 4 मीटर।" },
    { name: "टपक सिंचाई एवं जल संचयन प्रणाली", qty: () => ({ v: "1", u: "पूर्ण सेट" }), cost: 64000, spec: "फर्टिगेशन सहित वाटर टैंक, पम्प, बाईपास वाल्व, सेंड सेपरेटर/हाइड्रोसाइक्लोन फिल्टर, वेंचुरी इंजेक्टर, प्रेशर गेज, मीडिया फिल्टर, NRV, मेन लाइन, सब-मेन लाइन, कंट्रोल वाल्व, एयर रिलीज वाल्व, फ्लश वाल्व, इंड कैप तथा ड्रिपर/इमीटर्स।" },
    {
      name: "ट्रेलिस (T-Bar) सिस्टम",
      qty: (n) => {
        const table = { 5: 42, 10: 84, 15: 125, 20: 167 };
        const key = Number(n);
        const main = Object.prototype.hasOwnProperty.call(table, key) ? table[key] : Math.round(167 * (key / 20));
        return { v: main, u: "नग (मुख्य पौध/रोपण स्थान के अनुसार)" };
      },
      cost: 600000,
      spec: "T-Bar सिस्टम: मोटाई 6 mm, कुल ऊँचाई 2.5 मीटर (2.0 मीटर जमीन से ऊपर + 0.5 मीटर गहराई), arm चौड़ाई 2.0 मीटर, T-Bar दूरी 6 मीटर तथा 4 mm galvanized तार पूरी तरह कसा हुआ। T-Bar की संख्या मुख्य पौध/मुख्य रोपण स्थानों के अनुसार दिखाई जाएगी।",
    },
    { name: "GI चेन लिंक्ड फेंसिंग", qty: (n) => ({ v: Math.round(200 + 4 * Number(n)), u: "मीटर" }), cost: 295000, spec: "गैल्वेनाइज्ड GI chain-linked fencing, लोहे के खम्भों सहित। फेंसिंग की लंबाई किसान के स्वीकृत क्षेत्रफल की area-wise table के अनुसार होगी।" },
    { name: "खेती के औजार", qty: () => ({ v: "1", u: "मानक सेट" }), cost: 10000, spec: "सेकेटियर, pruning shear, sprayer आदि आवश्यक औद्यानिक/कृषि औजार।" },
    { name: "पौध संरक्षण रसायन / विकास नियामक / उर्वरक", qty: () => ({ v: "1", u: "प्रथम वर्ष की मानक आवश्यकता" }), cost: 15000, spec: "प्रथम वर्ष हेतु आवश्यक मात्रा में पौध संरक्षण रसायन, growth regulators तथा उर्वरक।" },
    { name: "विविध लागत", qty: () => ({ v: "1", u: "मानक प्रावधान" }), cost: 32000, spec: "गेट, बोर्ड तथा कटाई उपरान्त प्रबंधन हेतु plastic crates, corrugated fibre boxes आदि।" },
    {
      name: "रोपण सामग्री",
      qty: (n) => {
        const factor = n / 20;
        const main = Math.round(167 * factor);
        const gap = Math.round(41 * factor);
        const total = main + gap;
        const female = Math.round(total * 0.9);
        return { v: total, u: `नग (मुख्य ${main} + gap ${gap}; मादा ${female}, नर ${total - female})` };
      },
      cost: 58000,
      spec: "कुल उच्च गुणवत्तायुक्त कीवी पौधे = 167 मुख्य + 41 अतिरिक्त (25% रिक्तता पूर्ति हेतु बैकअप स्टॉक) प्रति 20 नाली के अनुपात में। कुल पौधों में 9 मादा : 1 नर अनुपात। दूरी 6m × 4m। अतिरिक्त पौधे replacement हेतु सुरक्षित रखे जाएंगे।",
    },
  ],
};

const bankTypeText = (value) => {
  if (value === "Current") return "चालू खाता";
  if (value === "Other") return "अन्य";
  return "बचत खाता";
};

const buildOrchardState = (raw, master) => {
  const personal = raw.personal || {};
  const documents = raw.documents || {};
  const formId = raw.formId || "";
  const farmerType = personal.farmer_type || "व्यक्तिगत कृषक";

  const form = {
    name: personal.farmer_name || "",
    father: personal.father_husband_name || "",
    gender: personal.gender || "पुरुष",
    mobile: personal.mobile || "",
    aadhaar: personal.aadhaar || "",
    udyan: personal.udyan_card_no || personal.horticulture_card || "",
    district: personal.district || personal.dist || "",
    block: personal.block || "",
    center: personal.center_name || personal.center || "",
    village: personal.village || "",
    post: personal.post || "",
    appno: formId,
    remarks: personal.remarks || "",
    beneficiary: farmerType.includes("समूह") ? "group" : "individual",
    bankHolder: personal.bank_holder_name || "",
    bankName: personal.bank_name || "",
    bankBranch: personal.bank_branch || "",
    bankAccount: personal.bank_account_number || "",
    bankIfsc: personal.bank_ifsc || "",
    bankType: bankTypeText(personal.bank_account_type),
  };

  const landSource = Array.isArray(personal.land_work_details) ? personal.land_work_details : [];
  const landRows = landSource.length
    ? landSource.map((row) => ({
      rel: row[0] || "",
      name: row[1] || "",
      father: row[2] || "",
      gender: row[3] || "पुरुष",
      village: row[4] || "",
      khata: row[5] || "",
      khasra: row[6] || "",
      area: row[7] || "",
    }))
    : [];

  const vouchers = Array.isArray(documents.anudan_voucher) ? documents.anudan_voucher : [];

  const landTotalHa = () => landRows.reduce((sum, row) => sum + num(row.area), 0);
  const n = landTotalHa() * 50;
  const f = n / master.baseNali;
  const total = master.components.reduce((sum, component) => sum + component.cost * f, 0);
  const pct = master.key === "kiwi" ? master.subsidy(n, form.beneficiary) : master.subsidy(n);
  const subsidy = (total * pct) / 100;

  return {
    master,
    form,
    landRows,
    voucherRows: vouchers.length ? vouchers.map((row) => (Array.isArray(row) ? [...row] : [])) : [],
    landTotalHa,
    n,
    f,
    total,
    pct,
    subsidy,
    farmerCost: total - subsidy,
    coOwners: landRows.filter((row) => row.rel && row.rel !== "स्वयं" && row.name),
  };
};

const genderWord = (gender, male, female, other) => (gender === "महिला" ? female : gender === "अन्य" ? other : male);

const buildApplicationHtml = (state) => {
  const { master: m, form, landRows, n, total, pct, subsidy, farmerCost } = state;
  const totalHa = state.landTotalHa();
  const ownLand = landRows[0] || {};
  const isKiwi = m.key === "kiwi";
  const genderText = (male, female, other = male) => genderWord(form.gender, male, female, other);

  return `<div class="application-header"><h2>कृषक आवेदन पत्र</h2><p><b>${esc(m.name)} — आवेदन पत्र</b></p></div>
  <h3>1. कृषक का विवरण</h3><table${isKiwi ? ' class="application-data-table"' : ""}><tbody>
  <tr><th>कृषक का नाम</th><td>${esc(form.name)}</td><th>पिता / पति का नाम</th><td>${esc(form.father)}</td></tr>
  <tr><th>मोबाइल</th><td>${esc(form.mobile)}</td><th>आधार</th><td>${esc(form.aadhaar) || "—"}</td></tr>
  <tr><th>उद्यान कार्ड</th><td>${esc(form.udyan) || "—"}</td><th>लिंग</th><td>${esc(form.gender)}</td></tr>
  <tr><th>जनपद</th><td>${esc(form.district)}</td><th>विकासखण्ड</th><td>${esc(form.block)}</td></tr>
  <tr><th>उद्यान सचल दल केंद्र</th><td colspan="3"><b>${esc(form.center) || "—"}</b></td></tr>
  <tr><th>ग्राम</th><td>${esc(form.village)}</td><th>पोस्ट</th><td>${esc(form.post) || "—"}</td></tr>
  <tr><th>स्वयं की भूमि खाता</th><td>${esc(ownLand.khata) || "—"}</td><th>स्वयं की भूमि खसरा/गाटा</th><td>${esc(ownLand.khasra) || "—"}</td></tr>
  <tr><th>प्रस्तावित क्षेत्रफल</th><td><b>${n.toFixed(2)} नाली</b></td><th>क्षेत्रफल</th><td><b>${totalHa.toFixed(2)} हे०</b></td></tr>
  </tbody></table>
  <h3>2. किसान घोषणा</h3><ul>
  <li>मैंने आवेदन में दी गई भूमि एवं क्षेत्रफल की जानकारी सही दी है।</li>
  <li>मैं योजना के निर्धारित तकनीकी मानकों के अनुसार कार्य कराने/करने के लिए सहमत हूँ।</li>
  <li>मैं विभागीय स्थलीय निरीक्षण एवं सत्यापन में सहयोग ${genderText("करूँगा", "करूँगी", "करूँगा/करूँगी")}।</li>
  <li>मैं पात्र होने पर निर्धारित कृषक अंश का वहन ${genderText("करूँगा", "करूँगी", "करूँगा/करूँगी")}।</li>
  </ul>
  <h3>3. मानक/स्वीकृत लागत एवं राजसहायता</h3><table${isKiwi ? ' class="application-cost-table"' : ""}><tbody>
  <tr><th>मानक/स्वीकृत लागत</th><td>${money(total)}</td></tr>
  <tr><th>प्रस्तावित कुल क्षेत्रफल</th><td>${n.toFixed(2)} नाली / ${totalHa.toFixed(4)} हे०</td></tr>
  <tr><th>कुल परियोजना लागत</th><td>${money(total)}</td></tr>
  <tr><th>देय राजसहायता</th><td>${money(subsidy)} (${pct}%)</td></tr>
  <tr><th>कृषक अंश</th><td>${money(farmerCost)}</td></tr></tbody></table>
  <div class="application-annexure"><h3>7. संलग्न दस्तावेजों की सूची</h3><ol>
  <li>☑ खतौनी/भूमि अभिलेख की प्रति (06 माह से अधिक पुरानी न हो)</li><li>☑ पहचान पत्र (आधार कार्ड)</li>
  <li>☑ उद्यान कार्ड</li><li>☑ बैंक पासबुक की प्रति</li><li>☑ समूह का पंजीकरण प्रमाण पत्र (यदि समूह हो)</li>
  <li>☑ कार्य प्रारम्भ से पूर्व प्रस्तावित स्थल का जियो-टैग फोटो</li></ol><h3>घोषणा</h3>
  <p>मैं प्रमाणित ${genderText("करता हूँ", "करती हूँ", "करता/करती हूँ")} कि उपरोक्त दी गई सभी जानकारी मेरी जानकारी में पूर्णतः सही है। भविष्य में जानकारी असत्य पाई जाने पर मेरा आवेदन निरस्त किया जा सकता है / मुझे योजना से वंचित किया जा सकता है।</p></div>
  <div class="application-sign-off"><div class="signature-grid"><div>स्थान: ____________________<br>दिनांक: ____________________</div><div>कृषक / आवेदक<br><b>${esc(form.name) || "____________________"}</b><br>हस्ताक्षर / अंगूठा: ____________________</div></div>
  <div class="verify-box"><b>प्रभारी की आख्या</b><br>निरीक्षण दिनांक .................... को प्रस्तावित भूमि की उत्पादन हेतु उपयुक्त पायी गयी। मृदा परीक्षण / भौगोलिक स्थिति की जाँच बागान हेतु मानक के अनुकूल है।<br><br><b>उद्यान सचल दल केंद्र - ${esc(form.center) || "________________"}</b><br><br>हस्ताक्षर प्रभारी: ____________________</div></div>`;
};

const buildReportHtml = (state) => {
  const { master: m, n, total, pct, subsidy, farmerCost } = state;
  const totalHa = state.landTotalHa();
  const isKiwi = m.key === "kiwi";

  const rows = m.components
    .map((component, index) => {
      const q = component.qty(n);
      const cost = component.cost * state.f;
      return `<tr><td class="qty">${index + 1}</td><td><b>${esc(component.name)}</b></td><td class="spec">${esc(component.spec)}</td><td class="qty"><b>${esc(q.v)}</b><br><span class="small">${esc(q.u)}</span></td><td class="money">${money(cost)}</td></tr>`;
    })
    .join("");

  const workItems = m.components
    .map((component) => {
      const q = component.qty(n);
      return `<li><b>${esc(component.name)}</b> — ${esc(component.spec)} <b>मात्रा: ${esc(q.v)}${q.u ? ` ${esc(q.u)}` : ""}</b></li>`;
    })
    .join("");

  let instructions;
  let declarationNote;
  let finalLabel;

  if (isKiwi) {
    instructions = [
      `<b>क्षेत्रफल:</b> ${n.toFixed(2)} नाली (${totalHa.toFixed(2)} हे०) के अनुसार ही कार्य किया जाए।`,
      "<b>Quantity:</b> प्रत्येक component की निर्धारित मात्रा के अनुसार कार्य पूर्ण किया जाए।",
      "<b>Technical Specification:</b> कार्य संबंधित component के ऊपर दिए गए specification के अनुसार किया जाए।",
      "<b>सत्यापन:</b> गड्ढे, पौधे, ट्रेलिस, सिंचाई, फेंसिंग एवं अन्य कार्य स्थल पर निर्धारित मानक के अनुसार सत्यापित किए जाएंगे।",
      "<b>पौध सामग्री:</b> निर्धारित 9 मादा : 1 नर अनुपात तथा अतिरिक्त/प्रतिस्थापन पौधों का प्रावधान रखा जाए।",
      "<b>भुगतान/अनुदान:</b> निरीक्षण एवं स्वीकृति के बाद लागू चरणबद्ध प्रावधान के अनुसार भुगतान होगा।",
      "<b>दस्तावेज:</b> भूमि अभिलेख, बैंक विवरण, बिल/वाउचर तथा निरीक्षण से संबंधित अभिलेख सुरक्षित रखें।",
    ]
      .map((item) => `<li>${item}</li>`)
      .join("");
    declarationNote = `<b>किसान घोषणा:</b> भूमि विवरण का कुल ${totalHa.toFixed(2)} हे०, आवेदन क्षेत्रफल ${totalHa.toFixed(2)} हे० से मिलान करता है। पात्रता एवं सत्यापन की अंतिम स्वीकृति विभागीय जाँच के अधीन होगी।`;
    finalLabel = `देय अनुदान / राजसहायता (${pct}%)`;
  } else {
    instructions = m.instructions
      .map((instruction, index) => `<li><b>${index + 1}. </b>${instruction}</li>`)
      .join("");
    instructions += [
      `<li><b>क्षेत्रफल:</b> ${n.toFixed(2)} नाली (${totalHa.toFixed(2)} हे०) के अनुसार ही कार्य किया जाए।</li>`,
      "<li><b>सत्यापन:</b> पिल्लर, पौधे, गड्ढे, सिंचाई, फेंसिंग एवं अन्य कार्यों की संख्या/स्थिति स्थल पर निर्धारित मानक के अनुसार सत्यापित की जाएगी।</li>",
      "<li><b>भुगतान/अनुदान:</b> निरीक्षण एवं स्वीकृति के बाद लागू चरणबद्ध प्रावधान के अनुसार भुगतान होगा।</li>",
      "<li><b>दस्तावेज:</b> भूमि अभिलेख, बैंक विवरण, बिल/वाउचर तथा निरीक्षण से संबंधित अभिलेख सुरक्षित रखें।</li>",
    ].join("");
    declarationNote = `<b>किसान घोषणा:</b> भूमि विवरण का कुल ${state.landTotalHa().toFixed(2)} हे०, आवेदन क्षेत्रफल ${totalHa.toFixed(2)} हे० से मिलान करता है। पात्रता एवं सत्यापन की अंतिम स्वीकृति विभागीय जाँच के अधीन होगी।`;
    finalLabel = `देय अनुदान (${pct}%)`;
  }

  return `<div class="print-only"><h2>कृषक हेतु परियोजना मानक एवं कार्य-विवरण</h2><p>आवेदन के प्रस्तावित क्षेत्रफल के अनुसार स्वचालित रूप से तैयार</p></div>
  <div class="summary"><div class="metric"><span>योजना</span><b>${esc(m.name)}</b></div><div class="metric"><span>प्रस्तावित क्षेत्रफल</span><b>${n.toFixed(2)} नाली</b></div><div class="metric"><span>परियोजना लागत</span><b>${money(total)}</b></div><div class="metric"><span>अनुदान</span><b>${pct}%</b></div></div>
  <h2>2. मानक के अनुसार कार्य, मात्रा एवं Component-wise लागत</h2>
  <p class="small">किसान की रिपोर्ट में प्रति इकाई Rate नहीं दिखाया गया है। केवल निर्धारित Quantity, स्पष्ट Technical Specification और Component की कुल लागत दी गई है।</p>
  <div class="table-wrap"><table class="project-standard-table"><thead><tr><th>क्र.</th><th>कार्य / Component</th><th>स्पष्ट Technical Specification</th><th>Quantity</th><th>Component-wise लागत</th></tr></thead><tbody>${rows}</tbody></table></div>
  <div class="finalbox"><div class="finalrow"><span>कुल परियोजना लागत</span><b>${money(total)}</b></div><div class="finalrow"><span>कृषक अंश</span><b>${money(farmerCost)}</b></div><div class="finalrow"><span>${finalLabel}</span><b>${money(subsidy)}</b></div></div>
  <div class="page-break"></div><h2>3. किसान द्वारा किए जाने वाले कार्य का विवरण</h2>
  <div class="note"><b>${esc(m.name)} — ${n.toFixed(2)} नाली (${totalHa.toFixed(2)} हे०) के लिए किसान हेतु कार्य</b></div><ol class="checklist">${workItems}</ol>
  <div class="note"><b>नोट:</b> ऊपर दिए गए सभी कार्य एवं मात्राएँ किसान के आवेदन में दर्ज क्षेत्रफल के अनुसार स्वतः निर्धारित की गई हैं।</div>
  <h2>4. परियोजना के महत्वपूर्ण तकनीकी एवं सत्यापन निर्देश</h2>
  <div class="note"><b>${esc(m.name)} — महत्वपूर्ण तकनीकी एवं सत्यापन निर्देश</b></div>
  <ul class="checklist">${instructions}</ul><div class="note">${declarationNote}</div>
  <div class="print-footer">यह पत्र आवेदन में दर्ज क्षेत्रफल और उपलब्ध Master Standard के आधार पर स्वचालित रूप से तैयार किया गया है।</div>`;
};

const DRAGON_CLAUSES = {
  opening: [
    "मेरे द्वारा कुल <b>{NALI} नाली / {HA} हे०</b> भूमि प्रस्तावित की गई है, जिसमें मेरी स्वयं की भूमि तथा आवश्यकतानुसार सह-खातेदार की भूमि सम्मिलित है।",
    "सभी खाता, खसरा/गाटा तथा प्रस्तावित क्षेत्रफल का विवरण संबंधित भूमि अभिलेख के अनुसार सही है।",
    "प्रत्येक सह-खातेदार ने अपनी स्वतंत्र इच्छा से मेरी योजना में अपनी भूमि सम्मिलित करने हेतु लिखित सहमति एवं अनापत्ति दी है, जो इस शपथ-पत्र के साथ संलग्न है।",
    "सह-खातेदारों को परियोजना, भूमि के उपयोग तथा पात्रता के अनुसार राजसहायता के आवेदक के सत्यापित बैंक खाते में DBT के माध्यम से प्राप्त होने की जानकारी है और उन्हें इस पर कोई आपत्ति नहीं है।",
  ],
  openingSolo: [
    "मेरे द्वारा कुल <b>{NALI} नाली / {HA} हे०</b> भूमि प्रस्तावित की गई है, जो मेरी स्वयं की भूमि है।",
    "सभी खाता, खसरा/गाटा तथा प्रस्तावित क्षेत्रफल का विवरण संबंधित भूमि अभिलेख के अनुसार सही है।",
    "प्रस्तावित भूमि मेरी स्वयं की है और इस भूमि के संबंध में किसी अन्य सह-खातेदार की सहमति की आवश्यकता नहीं है।",
    "राजसहायता, यदि देय हो, योजना की पात्रता एवं सत्यापन के अनुसार मेरे सत्यापित बैंक खाते में DBT के माध्यम से प्राप्त होने की जानकारी मुझे है।",
  ],
  scheme: [
    "यह कि मेरे द्वारा <b>ड्रैगन फ्रूट (कमलम)</b> उद्यान स्थापना हेतु उद्यान विभाग में विधिवत आवेदन किया गया है और प्रस्तावित भूमि पर योजना के लागू प्रावधानों के अनुसार कार्य किया जाएगा।",
    "यह कि प्रस्तावित भूमि मेरे वैध स्वामित्व/अधिकार एवं वास्तविक कब्जे में है तथा परियोजना के क्रियान्वयन में मेरी जानकारी के अनुसार कोई ऐसी ज्ञात कानूनी बाधा नहीं है जो कार्य में बाधा उत्पन्न करे।",
    "यह कि आवेदन में दर्शाया गया प्रस्तावित क्षेत्रफल ही परियोजना का आवेदन क्षेत्रफल माना जाएगा तथा वास्तविक क्षेत्रफल एवं कार्य का सत्यापन विभागीय स्थलीय निरीक्षण के समय किया जा सकेगा।",
    "यह कि परियोजना क्षेत्र में भूमि रेखांकन, आवश्यक भूमि तैयारी तथा निर्धारित layout के अनुसार <b>पंक्ति से पंक्ति 3.0 मीटर तथा पिल्लर से पिल्लर 2.0 मीटर</b> की व्यवस्था रखी जाएगी।",
    "यह कि निर्धारित मानक के अनुसार गड्ढा खुदान/भराई, बंड तथा खाद एवं उर्वरक प्रबंधन किया जाएगा और आवश्यक खाद/उर्वरक का उपयोग विभागीय मानक के अनुसार किया जाएगा।",
    "यह कि परियोजना में निर्धारित <b>RCC पिल्लर एवं कंक्रीट रिंग</b> प्रणाली स्थापित की जाएगी तथा निर्धारित पिल्लर संख्या के अनुसार पौधों का रोपण किया जाएगा।",
    "यह कि स्वस्थ, रोगमुक्त एवं गुणवत्तायुक्त ड्रैगन फ्रूट पौध/स्टेम कटिंग का उपयोग किया जाएगा और निर्धारित रोपण सामग्री की गुणवत्ता/स्रोत संबंधी विभागीय आवश्यकताओं का पालन किया जाएगा।",
    "यह कि परियोजना में निर्धारित <b>ड्रिप सिंचाई एवं फर्टिगेशन प्रणाली</b> स्थापित/उपयोग की जाएगी तथा जहाँ योजना मानक में लागू हो, GI Chain Link Fencing का कार्य निर्धारित specification के अनुसार किया जाएगा।",
    "यह कि प्रथम वर्ष के लिए अनुमन्य उर्वरक एवं पौध संरक्षण सामग्री का उपयोग निर्धारित मानक एवं आवश्यकता के अनुसार किया जाएगा तथा उद्यान का नियमित रख-रखाव किया जाएगा।",
    "यह कि पौध/रोपण सामग्री तथा infrastructure से संबंधित भुगतान/राजसहायता योजना के निर्धारित चरणों, विभागीय निरीक्षण एवं सत्यापन के अधीन होगी।",
    "यह कि विभागीय निरीक्षण/सत्यापन में यदि कोई कमी, त्रुटि अथवा सुधार योग्य बिंदु पाया जाता है तो विभागीय निर्देशानुसार निर्धारित समय में आवश्यक सुधार किया जाएगा तथा आवश्यक मूल दस्तावेज प्रस्तुत किए जाएंगे।",
  ],
  closing: [
    "आवेदन में दर्ज कार्य, मात्रा, कृषक अंश, राजसहायता एवं अन्य जानकारी मेरी जानकारी के अनुसार सही है।",
    "कृषक अंश तथा अनुमन्य लागत से अधिक अतिरिक्त व्यय, जहाँ लागू हो, मैं स्वयं {DOV}.।",
    "प्रस्तावित भूमि/कार्य पर ऐसा कोई दोहरा सरकारी लाभ प्राप्त नहीं किया गया है जिससे एक ही कार्य पर दोहरा अनुदान मिले; यदि कोई पूर्वलाभ लागू/प्राप्त हुआ है तो उसका विवरण आवेदन में सत्य रूप से दिया गया है।",
    "मैं परियोजना में स्थापित पौध, सिंचाई प्रणाली, infrastructure/सहायक संरचना, फेंसिंग तथा अन्य स्वीकृत परिसंपत्तियों के उचित उपयोग, सुरक्षा एवं रख-रखाव की जिम्मेदारी {MAINTAIN}।",
    "असत्य/भ्रामक/नियम-विरुद्ध जानकारी पाए जाने पर नियमानुसार आवेदन निरस्त, राजसहायता की वसूली तथा आवश्यक विभागीय/कानूनी कार्यवाही स्वीकार्य होगी।",
    "मैंने यह शपथ-पत्र बिना दबाव, भय अथवा प्रलोभन के अपनी स्वतंत्र इच्छा से दिया है।",
    "यह कि आवेदन में दी गई भूमि, क्षेत्रफल, खसरा/गाटा, खाता/खतौनी, बैंक विवरण, उद्यान कार्ड तथा अन्य जानकारी सत्य एवं सही है।",
    "यह कि प्राकृतिक आपदा, जंगली जानवरों, मौसमजनित क्षति अथवा अन्य व्यावहारिक नुकसान की स्थिति में विभाग की जिम्मेदारी योजना के लागू नियमों तक ही सीमित होगी।",
  ],
};

const KIWI_CLAUSES = {
  opening: [
    "मेरे द्वारा कुल <b>{NALI} नाली / {HA} हे०</b> भूमि प्रस्तावित की गई है, जिसमें मेरी स्वयं की भूमि तथा आवश्यकतानुसार सह-खातेदार की भूमि सम्मिलित है।",
    "सभी खाता, खसरा/गाटा तथा प्रस्तावित क्षेत्रफल का विवरण संबंधित भूमि अभिलेख के अनुसार सही है।",
    "प्रत्येक सह-खातेदार ने अपनी स्वतंत्र इच्छा से मेरी योजना में अपनी भूमि सम्मिलित करने हेतु लिखित सहमति एवं अनापत्ति दी है, जो इस शपथ-पत्र के साथ संलग्न है।",
    "सह-खातेदारों को परियोजना, भूमि के उपयोग तथा पात्रता के अनुसार राजसहायता के आवेदक के सत्यापित बैंक खाते में DBT के माध्यम से प्राप्त होने की जानकारी है और उन्हें इस पर कोई आपत्ति नहीं है.",
  ],
  openingSolo: [
    "मेरे द्वारा कुल <b>{NALI} नाली / {HA} हे०</b> भूमि प्रस्तावित की गई है, जो मेरी स्वयं की भूमि है।",
    "सभी खाता, खसरा/गाटा तथा प्रस्तावित क्षेत्रफल का विवरण संबंधित भूमि अभिलेख के अनुसार सही है।",
    "प्रस्तावित भूमि मेरी स्वयं की है और इस भूमि के संबंध में किसी अन्य सह-खातेदार की सहमति की आवश्यकता नहीं है।",
    "राजसहायता, यदि देय हो, योजना की पात्रता एवं सत्यापन के अनुसार मेरे सत्यापित बैंक खाते में DBT के माध्यम से प्राप्त होने की जानकारी मुझे है।",
  ],
  scheme: [
    "यह कि मेरे द्वारा <b>कीवी उद्यान स्थापना</b> हेतु उद्यान विभाग में विधिवत आवेदन किया गया है और प्रस्तावित भूमि पर उत्तराखण्ड कीवी नीति-2025 के लागू प्रावधानों के अनुसार कार्य किया जाएगा।",
    "यह कि प्रस्तावित भूमि मेरे वैध स्वामित्व/अधिकार एवं वास्तविक कब्जे में है तथा परियोजना के क्रियान्वयन में मेरी जानकारी के अनुसार कोई ऐसी ज्ञात कानूनी बाधा नहीं है जो कार्य में बाधा उत्पन्न करे।",
    "यह कि आवेदन में दर्शाया गया प्रस्तावित क्षेत्रफल ही परियोजना का आवेदन क्षेत्रफल माना जाएगा तथा वास्तविक क्षेत्रफल एवं कार्य का सत्यापन विभागीय स्थलीय निरीक्षण के समय किया जा सकेगा।",
    "यह कि परियोजना क्षेत्र में भूमि विकास, आवश्यक भूमि तैयारी तथा <b>6 मीटर × 4 मीटर</b> की निर्धारित रोपण दूरी के अनुसार layout/रेखांकन किया जाएगा।",
    "यह कि निर्धारित मानक के अनुसार <b>1 मीटर × 1 मीटर × 1 मीटर</b> आकार के गड्ढे तैयार किए जाएंगे तथा गड्ढा भराई में निर्धारित मात्रा में कम्पोस्ट/जैविक खाद का उपयोग किया जाएगा।",
    "यह कि निर्धारित गुणवत्तायुक्त कीवी रोपण सामग्री का उपयोग किया जाएगा तथा पौधों में योजना के लागू मानक के अनुसार <b>9 मादा : 1 नर</b> का अनुपात बनाए रखा जाएगा।",
    "यह कि अतिरिक्त/बैकअप पौध सामग्री, जहाँ योजना मानक में प्रावधानित है, replacement की आवश्यकता के लिए सुरक्षित रखी जाएगी।",
    "यह कि परियोजना में निर्धारित <b>ड्रिप सिंचाई एवं फर्टिगेशन प्रणाली</b> स्थापित/उपयोग की जाएगी।",
    "यह कि निर्धारित <b>T-Bar ट्रेलिस प्रणाली</b> को विभागीय मानक के अनुसार स्थापित किया जाएगा तथा आवश्यक galvanized wire एवं support व्यवस्था निर्धारित specification के अनुरूप रखी जाएगी।",
    "यह कि जहाँ योजना मानक में लागू हो, GI Chain Link Fencing, कृषि/बागवानी औजार, पौध संरक्षण सामग्री, विकास नियामक/उर्वरक तथा अन्य अनुमन्य inputs का उपयोग निर्धारित मानक के अनुसार किया जाएगा।",
    "यह कि पौध/रोपण सामग्री तथा infrastructure से संबंधित भुगतान/राजसहायता योजना के निर्धारित चरणों, विभागीय निरीक्षण एवं सत्यापन के अधीन होगी।",
    "यह कि विभागीय निरीक्षण/सत्यापन में यदि कोई कमी, त्रुटि अथवा सुधार योग्य बिंदु पाया जाता है तो विभागीय निर्देशानुसार निर्धारित समय में आवश्यक सुधार किया जाएगा तथा आवश्यक मूल दस्तावेज प्रस्तुत किए जाएंगे।",
  ],
  closing: [
    "आवेदन में दर्ज कार्य, मात्रा, कृषक अंश, राजसहायता एवं अन्य जानकारी मेरी जानकारी के अनुसार सही है।",
    "कृषक अंश तथा अनुमन्य लागत से अधिक अतिरिक्त व्यय, जहाँ लागू हो, मैं स्वयं {DOV}।",
    "प्रस्तावित भूमि/कार्य पर ऐसा कोई दोहरा सरकारी लाभ प्राप्त नहीं किया गया है जिससे एक ही कार्य पर दोहरा अनुदान मिले; यदि कोई पूर्वलाभ लागू/प्राप्त हुआ है तो उसका विवरण आवेदन में सत्य रूप से दिया गया है।",
    "मैं परियोजना में स्थापित पौध, सिंचाई प्रणाली, infrastructure/सहायक संरचना, फेंसिंग तथा अन्य स्वीकृत परिसंपत्तियों के उचित उपयोग, सुरक्षा एवं रख-रखाव की जिम्मेदारी {MAINTAIN}।",
    "असत्य/भ्रामक/नियम-विरुद्ध जानकारी पाए जाने पर नियमानुसार आवेदन निरस्त, राजसहायता की वसूली तथा आवश्यक विभागीय/कानूनी कार्यवाही {ACCEPT}।",
    "मैंने यह शपथ-पत्र बिना दबाव, भय अथवा प्रलोभन के अपनी स्वतंत्र इच्छा से दिया है।",
    "यह कि आवेदन में दी गई भूमि, क्षेत्रफल, खसरा/गाटा, खाता/खतौनी, बैंक विवरण, उद्यान कार्ड तथा अन्य जानकारी सत्य एवं सही है।",
    "यह कि प्राकृतिक आपदा, जंगली जानवरों, मौसमजनित क्षति अथवा अन्य व्यावहारिक नुकसान की स्थिति में विभाग की जिम्मेदारी योजना के लागू नियमों तक ही सीमित होगी।",
  ],
};

const fillTokens = (text, tokens) =>
  Object.keys(tokens).reduce((result, key) => result.split(`{${key}}`).join(tokens[key]), text);

const buildAffidavitHtml = (state) => {
  const { master: m, form, landRows, n, coOwners } = state;
  const isKiwi = m.key === "kiwi";
  const coMode = coOwners.length > 0;
  const totalHa = state.landTotalHa().toFixed(4);
  const totalNali = n.toFixed(2);
  const genderText = (male, female, other = male) => genderWord(form.gender, male, female, other);
  const clauses = isKiwi ? KIWI_CLAUSES : DRAGON_CLAUSES;

  const tokens = {
    NALI: totalNali,
    HA: totalHa,
    DOV: genderText("दूँगा", "दूँगी", "दूँगा/दूँगी"),
    MAINTAIN: genderText("निभाऊँगा", "निभाऊँगी", "निभाऊँगा/निभाऊँगी"),
    ACCEPT: genderText("स्वीकार्य होगा", "स्वीकार्य होगी", "स्वीकार्य होगा/होगी"),
  };

  const address = [form.village, form.post, form.block, form.district, "उत्तराखण्ड"].filter(Boolean).join(", ");
  const addressLine = isKiwi
    ? `${esc([form.village, form.post, form.block, form.district].filter(Boolean).join(", "))}, उत्तराखण्ड, सत्यनिष्ठा से शपथपूर्वक निम्नलिखित घोषणा ${genderText("करता", "करती", "करता/करती")} हूँ कि—`
    : `${esc(address)}, पौड़ी गढ़वाल, उत्तराखण्ड, सत्यनिष्ठा से शपथपूर्वक निम्नलिखित घोषणा ${genderText("करता", "करती", "करता/करती")} हूँ कि—`;

  const list = [
    ...(coMode ? clauses.opening : clauses.openingSolo),
    clauses.closing[0],
    fillTokens(clauses.closing[1], tokens),
    ...clauses.scheme,
    ...clauses.closing.slice(2).map((clause) => fillTokens(clause, tokens)),
  ];

  const landRowsHtml = landRows
    .filter((row) => row.rel && (row.name || row.area))
    .map(
      (row, index) =>
        `<tr><td>${index + 1}</td><td>${esc(row.rel === "सहखातेदार" ? "सह-खातेदार" : row.rel)}</td><td>${esc(row.name || "—")}</td><td>${esc(row.father || "—")}</td><td>${esc(row.village || "—")}</td><td>${esc(row.khata || "—")}</td><td>${esc(row.khasra || "—")}</td><td class="money">${num(row.area).toFixed(4)}</td></tr>`,
    )
    .join("");

  return `<article class="aff-doc"><div class="doc-title">${esc(m.name)}</div>
  <div class="doc-subtitle">लाभार्थी स्व-घोषणा एवं शपथ-पत्र — ${coMode ? "स्वयं + सह-खातेदार" : "केवल स्वयं की भूमि"}</div>
  <p>मैं श्री/श्रीमती ${esc(form.name)}, पुत्र/पुत्री/पत्नी श्री ${esc(form.father)}, निवासी ${addressLine}</p>
  <ol>${list.map((clause) => `<li>${fillTokens(clause, tokens)}</li>`).join("")}</ol>
  <h3>भूमि एवं ${coMode ? "सह-खातेदार " : ""}विवरण</h3>
  <table><thead><tr><th>क्र.</th><th>भूमि किसकी</th><th>नाम</th><th>पिता/पति</th><th>ग्राम</th><th>खाता</th><th>खसरा/गाटा</th><th>प्रस्तावित भूमि (हे०)</th></tr></thead><tbody>${landRowsHtml}</tbody><tfoot><tr><th colspan="7">कुल प्रस्तावित क्षेत्रफल</th><th>${totalHa} हे०</th></tr></tfoot></table>
  <div class="sig"><div>स्थान: ____________________<br>दिनांक: ____________________</div><div>शपथकर्ता/कृषक<br><b>${esc(form.name)}</b><br>हस्ताक्षर${isKiwi ? "/अंगूठा" : ""} ____________________</div></div>
  <p class="aff-note">स्टाम्प/नोटरी/शपथ आयुक्त संबंधी औपचारिकता संबंधित विभाग/लागू नियम के अनुसार पूरी की जाए।</p></article>`;
};

const buildConsentHtml = (state) => {
  const { master: m, form, coOwners } = state;
  const isKiwi = m.key === "kiwi";

  if (!coOwners.length) {
    return `<div class="aff-doc"><div class="doc-title">सह-खातेदार का सहमति एवं अनापत्ति पत्र</div><p>इस आवेदन में कोई सह-खातेदार दर्ज नहीं है।</p></div>`;
  }

  return coOwners
    .map((row, index) => {
      const rel = row.rel === "सहखातेदार" ? "सह-खातेदार" : row.rel;
      const word = (male, female, other) => genderWord(row.gender, male, female, other);
      return `<article class="aff-doc ${index ? "page-break-doc" : ""}"><div class="doc-title">${esc(m.name)} हेतु</div>
    <div class="doc-subtitle">सह-खातेदार का सहमति एवं अनापत्ति पत्र</div>
    <p>मैं श्री/श्रीमती <b>${esc(row.name)}</b>, पुत्र/पुत्री/पत्नी श्री <b>${esc(row.father)}</b>, निवासी <b>${esc(row.village || form.village)}</b>, आवेदक से संबंध <b>${esc(rel)}</b> हूँ। मैं निम्नलिखित सहमति प्रदान ${word(isKiwi ? "करता" : "करता/करती", "करती", isKiwi ? "करता/करती" : "करता/करती")} हूँ कि—</p>
    <ol><li>मेरी भूमि का विवरण खाता संख्या <b>${esc(row.khata)}</b>, खसरा/गाटा संख्या <b>${esc(row.khasra)}</b>, कुल/प्रस्तावित क्षेत्रफल <b>${num(row.area).toFixed(4)} हे०</b> है।</li>
    <li>मैं अपनी भूमि में से <b>${num(row.area).toFixed(4)} हे०</b> क्षेत्रफल को श्री/श्रीमती <b>${esc(form.name)}</b> द्वारा ${esc(m.name)} योजना के आवेदन में सम्मिलित करने की सहमति ${word(isKiwi ? "देता" : "देता/देती", "देती", "देता/देती")} हूँ।</li>
    <li>मुझे उक्त भूमि पर प्रस्तावित उद्यान स्थापना एवं स्वीकृत कार्य किए जाने पर कोई आपत्ति नहीं है।</li>
    <li>मुझे योजना, प्रस्तावित कार्य तथा पात्रता के अनुसार राजसहायता के आवेदक के सत्यापित बैंक खाते में DBT के माध्यम से प्राप्त होने की जानकारी है और मुझे इस पर कोई आपत्ति नहीं है।</li>
    <li>मैं यह सहमति अपनी स्वतंत्र इच्छा से ${word(isKiwi ? "देता" : "देता/देती", "देती", "देता/देती")} हूँ और प्रस्तावित भूमि के उपयोग के संबंध में जानबूझकर अनावश्यक बाधा उत्पन्न नहीं ${word(isKiwi ? "करूँगा" : "करूँगा/करूँगी", "करूँगी", "करूँगा/करूँगी")}।</li></ol>
    <h3>सह-खातेदार का विवरण</h3><table><tbody><tr><th>नाम</th><td>${esc(row.name)}</td></tr><tr><th>पिता/पति</th><td>${esc(row.father)}</td></tr><tr><th>आवेदक से संबंध</th><td><b>${esc(rel)}</b></td></tr><tr><th>लिंग</th><td>${esc(row.gender || "पुरुष")}</td></tr><tr><th>ग्राम</th><td>${isKiwi ? esc(row.village || form.village) : esc(row.village)}</td></tr><tr><th>खाता संख्या</th><td>${esc(row.khata)}</td></tr><tr><th>खसरा/गाटा संख्या</th><td>${esc(row.khasra)}</td></tr><tr><th>सम्मिलित भूमि</th><td>${num(row.area).toFixed(4)} हे०</td></tr><tr><th>मोबाइल</th><td>________________</td></tr><tr><th>पहचान दस्तावेज</th><td>________________</td></tr></tbody></table>
    <div class="sig"><div>स्थान: ____________________<br>दिनांक: ____________________</div><div>सह-खातेदार<br><b>${esc(row.name)}</b><br>हस्ताक्षर${isKiwi ? "/अंगूठा" : ""} ____________________</div></div></article>`;
    })
    .join("");
};

const buildAnudanHtml = (state) => {
  const { master: m, form, pct } = state;
  const isKiwi = m.key === "kiwi";
  const entries = state.voucherRows.filter((row) => row.some((value) => String(value || "").trim() !== ""));
  const total = entries.reduce((sum, row) => sum + num(row[3]), 0);

  let rows;
  let subsidyTotal;
  let farmerTotal;
  let payeeCell;

  if (isKiwi) {
    subsidyTotal = (total * pct) / 100;
    farmerTotal = total - subsidyTotal;
    const recipients = Array.from(new Set(entries.map((row) => (row[4] === "फर्म" ? row[5] : form.name)).filter(Boolean))).join(", ") || "संबंधित बिल/वाउचर अनुसार";
    rows = entries
      .map((row, index) => {
        const amount = num(row[3]);
        const grant = (amount * pct) / 100;
        return `<tr><td>${index + 1}</td><td>${esc(row[0] || "Infrastructure स्थापना")}</td><td>${esc(row[1] || "—")}${row[2] ? `<br><span>बिल/वाउचर नं. ${esc(row[2])}</span>` : ""}</td><td class="money">${money(amount)}</td><td class="money">${money(grant)}</td><td class="money">${money(amount - grant)}</td><td>${esc(row[4] === "फर्म" ? row[5] : form.name)}</td></tr>`;
      })
      .join("");
    payeeCell = esc(recipients);
  } else {
    subsidyTotal = entries.reduce((sum, row) => sum + (num(row[3]) * pct) / 100, 0);
    farmerTotal = entries.reduce((sum, row) => sum + (num(row[3]) * (100 - pct)) / 100, 0);
    rows = entries
      .map((row, index) => {
        const amount = num(row[3]);
        const grant = (amount * pct) / 100;
        return `<tr><td>${index + 1}</td><td>${esc(row[0] || "Infrastructure स्थापना")}</td><td>${esc(row[1] || "—")}${row[2] ? `<br><span>बिल/वाउचर नं. ${esc(row[2])}</span>` : ""}</td><td class="money">${money(amount)}</td><td class="money">${money(grant)}</td><td class="money">${money(amount - grant)}</td><td>${esc(row[4] || row[5] || "—")}</td></tr>`;
      })
      .join("");
    payeeCell = esc(Array.from(new Set(entries.map((row) => row[4] || row[5]).filter(Boolean))).join(", ") || "संबंधित बिल/वाउचर अनुसार");
  }

  return `<div class="anudan-form">
  <div class="af-head">जिला योजना वर्ष 2026-27</div>
  <div class="af-title">${esc(m.name)} अन्तर्गत राजसहायता देयक</div>
  <div class="af-meta">
    <div><b>नाम कृषक :</b> ${esc(form.name)}</div><div><b>पिता का नाम :</b> ${esc(form.father)}</div>
    <div><b>ग्राम :</b> ${esc(form.village)}</div><div><b>विकास खण्ड :</b> ${esc(form.block)}</div>
    <div><b>आधार संख्या :</b> ${esc(form.aadhaar || "—")}</div><div><b>मो० नं० :</b> ${esc(form.mobile)}</div>
    <div><b>उद्यान का क्षेत्रफल (हेक्टेयर में) :</b> ${state.landTotalHa().toFixed(2)}</div><div><b>आवेदन संख्या :</b> ${esc(form.appno || "—")}</div>
  </div>
  <div class="af-bank"><h4>बैंक खाता विवरण</h4><div class="af-bank-grid"><div><b>खाता धारक :</b> ${esc(form.bankHolder || form.name || "—")}</div><div><b>बैंक :</b> ${esc(form.bankName || "—")}</div><div><b>शाखा :</b> ${esc(form.bankBranch || "—")}</div><div><b>खाता संख्या :</b> ${esc(form.bankAccount || "—")}</div><div><b>IFSC :</b> ${esc(form.bankIfsc || "—")}</div><div><b>खाता प्रकार :</b> ${esc(form.bankType || "—")}</div></div></div>
  <div><b>देयक सारणी</b></div>
  <table><thead><tr><th>क्र० सं०</th><th>निरीक्षण / भुगतान चरण</th><th>कार्य का विवरण</th><th>देयक की कुल धनराशि (₹)</th><th>राजसहायता हेतु धनराशि (₹)</th><th>कृषक द्वारा वहन की गयी धनराशि (₹)</th><th>जिसे भुगतान किया जाना है का विवरण</th></tr></thead>
  <tbody>${rows || '<tr><td colspan="7">कोई बिल/वाउचर नहीं जोड़ा गया है।</td></tr>'}</tbody>
  <tfoot><tr class="af-total"><td colspan="3">कुल योग</td><td class="money">${money(total)}</td><td class="money">${money(subsidyTotal)}</td><td class="money">${money(farmerTotal)}</td><td>${payeeCell}</td></tr></tfoot></table>
  <p class="af-para">संलग्न-</p><p class="af-para">प्रमाणित किया जाता है कि मेरे द्वारा ${esc(m.name)} स्थापना कार्यों पर उक्तानुसार धनराशि व्यय की गई है। कृषक अंश की धनराशि कुल ₹ <b>${money(farmerTotal)}</b> मेरे द्वारा भुगतान कर दी गयी है। अतः राजसहायता की ${pct}% की धनराशि ₹ <b>${money(subsidyTotal)}</b> का भुगतान संलग्न देयक अनुसार सम्बन्धितों को करने की कृपा कीजिएगा।</p>
  <div class="af-sign"><div>हस्ताक्षर कृषक : ____________________<br>नाम (अक्षरों में) : <b>${esc(form.name)}</b></div></div>
  <div class="af-inspect"><div class="af-inspect-title">निरीक्षण</div><p>प्रमाणित किया जाता है कि मेरे द्वारा ${esc(m.name)} स्थापना कार्य का निरीक्षण कर लिया गया है। अतः देयक राजसहायता की ${pct}% की धनराशि ₹ <b>${money(subsidyTotal)}</b> संलग्न देयक अनुसार सम्बन्धितों को कृषक के अनुरोध पर सत्यापित कर संस्तुति सहित भुगतान हेतु अग्रसारित।</p><div class="af-footer-sign">हस्ताक्षर प्रभारी : ____________________</div></div>
</div>`;
};

const buildOrchardDocuments = (raw, master) => {
  const state = buildOrchardState(raw, master);
  return [
    { id: "application", label: "कृषक आवेदन पत्र", html: buildApplicationHtml(state), pageBreakBefore: false },
    { id: "project", label: "परियोजना मानक एवं कार्य-विवरण", html: buildReportHtml(state), pageBreakBefore: true },
    { id: "affidavit", label: "लाभार्थी स्व-घोषणा एवं शपथ-पत्र", html: buildAffidavitHtml(state), pageBreakBefore: true },
    { id: "consent", label: "सह-खातेदार सहमति एवं अनापत्ति पत्र", html: buildConsentHtml(state), pageBreakBefore: true },
    { id: "anudan", label: "अनुदान देयक", html: buildAnudanHtml(state), pageBreakBefore: true },
  ];
};

export const buildDragonDocuments = (raw) => buildOrchardDocuments(raw, DRAGON_MASTER);
export const buildKiwiDocuments = (raw) => buildOrchardDocuments(raw, KIWI_MASTER);
