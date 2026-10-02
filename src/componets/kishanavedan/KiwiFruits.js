import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import "../kishanavedan/Kiwi.css";

const ID_PREFIX = "kiwi-";

/*
const MASTER = {
  kiwi: {
    const m = MASTER.kiwi, n = derivedNali();
    baseNali: 20, baseHa: 0.40, baseCost: 1184000,
    subsidy: (n, type) => type === "group" ? (n / 50 <= 5 ? 70 : 50) : ((n / 50) <= 1 ? 70 : 50),
    const g = form.gender;
    const doVerb = g === "महिला" ? "करूँगी" : g === "अन्य" ? "करूँगा/करूँगी" : "करूँगा";
    const maintainVerb = g === "महिला" ? "निभाऊँगी" : g === "अन्य" ? "निभाऊँगा/निभाऊँगी" : "निभाऊँगा";
    const acceptVerb = g === "महिला" ? "स्वीकार्य होगी" : g === "अन्य" ? "स्वीकार्य होगी" : "स्वीकार्य होगा";
    const pron = g === "महिला" ? "करती" : g === "अन्य" ? "करता/करती" : "करता";
    const address = [form.village, form.post, form.block, form.district, "उत्तराखण्ड"].filter(Boolean).map(esc).join(", ");
    const opening = coMode ? [
      `मेरे द्वारा कुल <b>${n.toFixed(2)} नाली / ${hectare().toFixed(4)} हे०</b> भूमि प्रस्तावित की गई है, जिसमें मेरी स्वयं की भूमि तथा आवश्यकतानुसार सह-खातेदार की भूमि सम्मिलित है।`,
      "सभी खाता, खसरा/गाटा तथा प्रस्तावित क्षेत्रफल का विवरण संबंधित भूमि अभिलेख के अनुसार सही है।",
      "प्रत्येक सह-खातेदार ने अपनी स्वतंत्र इच्छा से मेरी योजना में अपनी भूमि सम्मिलित करने हेतु लिखित सहमति एवं अनापत्ति दी है, जो इस शपथ-पत्र के साथ संलग्न है।",
      "सह-खातेदारों को परियोजना, भूमि के उपयोग तथा पात्रता के अनुसार राजसहायता के आवेदक के सत्यापित बैंक खाते में DBT के माध्यम से प्राप्त होने की जानकारी है और उन्हें इस पर कोई आपत्ति नहीं है.",
    ] : [
      `मेरे द्वारा कुल <b>${n.toFixed(2)} नाली / ${hectare().toFixed(4)} हे०</b> भूमि प्रस्तावित की गई है, जो मेरी स्वयं की भूमि है।`,
      "सभी खाता, खसरा/गाटा तथा प्रस्तावित क्षेत्रफल का विवरण संबंधित भूमि अभिलेख के अनुसार सही है।",
      "प्रस्तावित भूमि मेरी स्वयं की है और इस भूमि के संबंध में किसी अन्य सह-खातेदार की सहमति की आवश्यकता नहीं है।",
      "राजसहायता, यदि देय हो, योजना की पात्रता एवं सत्यापन के अनुसार मेरे सत्यापित बैंक खाते में DBT के माध्यम से प्राप्त होने की जानकारी मुझे है।",
    ];
    const kiwiClauses = [
      `यह कि मेरे द्वारा <b>कीवी उद्यान स्थापना</b> हेतु उद्यान विभाग में विधिवत आवेदन किया गया है और प्रस्तावित भूमि पर उत्तराखण्ड कीवी नीति-2025 के लागू प्रावधानों के अनुसार कार्य किया जाएगा।`,
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
    ];
    const closing = [
      "आवेदन में दर्ज कार्य, मात्रा, कृषक अंश, राजसहायता एवं अन्य जानकारी मेरी जानकारी के अनुसार सही है।",
      `कृषक अंश तथा अनुमन्य लागत से अधिक अतिरिक्त व्यय, जहाँ लागू हो, मैं स्वयं ${doVerb}।`,
      "प्रस्तावित भूमि/कार्य पर ऐसा कोई दोहरा सरकारी लाभ प्राप्त नहीं किया गया है जिससे एक ही कार्य पर दोहरा अनुदान मिले; यदि कोई पूर्वलाभ लागू/प्राप्त हुआ है तो उसका विवरण आवेदन में सत्य रूप से दिया गया है।",
      `मैं परियोजना में स्थापित पौध, सिंचाई प्रणाली, infrastructure/सहायक संरचना, फेंसिंग तथा अन्य स्वीकृत परिसंपत्तियों के उचित उपयोग, सुरक्षा एवं रख-रखाव की जिम्मेदारी ${maintainVerb}।`,
      `असत्य/भ्रामक/नियम-विरुद्ध जानकारी पाए जाने पर नियमानुसार आवेदन निरस्त, राजसहायता की वसूली तथा आवश्यक विभागीय/कानूनी कार्यवाही ${acceptVerb}।`,
      "मैंने यह शपथ-पत्र बिना दबाव, भय अथवा प्रलोभन के अपनी स्वतंत्र इच्छा से दिया है।",
      "यह कि आवेदन में दी गई भूमि, क्षेत्रफल, खसरा/गाटा, खाता/खतौनी, बैंक विवरण, उद्यान कार्ड तथा अन्य जानकारी सत्य एवं सही है।",
      "यह कि प्राकृतिक आपदा, जंगली जानवरों, मौसमजनित क्षति अथवा अन्य व्यावहारिक नुकसान की स्थिति में विभाग की जिम्मेदारी योजना के लागू नियमों तक ही सीमित होगी।",
    ];
    const clauses = [...opening, ...closing.slice(0, 2), ...kiwiClauses, ...closing.slice(2)];
    const landRowsHtml = landRows.filter(r => r.rel && (r.name || num(r.area))).map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.rel === "सहखातेदार" ? "सह-खातेदार" : r.rel)}</td><td>${esc(r.name || "—")}</td><td>${esc(r.father || "—")}</td><td>${esc(r.village || "—")}</td><td>${esc(r.khata || "—")}</td><td>${esc(r.khasra || "—")}</td><td class="money">${num(r.area).toFixed(4)}</td></tr>`).join("");
    const affHtml = `<article class="aff-doc"><div class="doc-title">${esc(m.name)}</div>
      <div class="doc-subtitle">लाभार्थी स्व-घोषणा एवं शपथ-पत्र — ${coMode ? "स्वयं + सह-खातेदार" : "केवल स्वयं की भूमि"}</div>
      <p>मैं श्री/श्रीमती ${esc(form.name)}, पुत्र/पुत्री/पत्नी श्री ${esc(form.father)}, निवासी ${address}, पौड़ी गढ़वाल, उत्तराखण्ड, सत्यनिष्ठा से शपथपूर्वक निम्नलिखित घोषणा ${pron} हूँ कि—</p>
      <ol>${clauses.map(clause => `<li>${clause}</li>`).join("")}</ol>
      <h3>भूमि एवं ${coMode ? "सह-खातेदार " : ""}विवरण</h3>
      <table><thead><tr><th>क्र.</th><th>भूमि किसकी</th><th>नाम</th><th>पिता/पति</th><th>ग्राम</th><th>खाता</th><th>खसरा/गाटा</th><th>प्रस्तावित भूमि (हे०)</th></tr></thead><tbody>${landRowsHtml}</tbody><tfoot><tr><th colspan="7">कुल प्रस्तावित क्षेत्रफल</th><th>${hectare().toFixed(4)} हे०</th></tr></tfoot></table>
      <div class="sig"><div>स्थान: ____________________<br>दिनांक: ____________________</div><div>शपथकर्ता/कृषक<br><b>${esc(form.name)}</b><br>हस्ताक्षर/अंगूठा ____________________</div></div>
      <p class="aff-note">स्टाम्प/नोटरी/शपथ आयुक्त संबंधी औपचारिकता संबंधित विभाग/लागू नियम के अनुसार पूरी की जाए।</p></article>`;

    const consentHtml = co.length ? co.map((r, idx) => {
      const rel = r.rel === "सहखातेदार" ? "सह-खातेदार" : r.rel;
      const female = r.gender === "महिला";
      const subject = female ? "करती" : "करता/करती";
      const consent = female ? "देती" : "देता/देती";
      const future = female ? "करूँगी" : "करूँगा/करूँगी";
      return `<article class="aff-doc ${idx ? "page-break-doc" : ""}"><div class="doc-title">${esc(m.name)} हेतु</div>
        <div class="doc-subtitle">सह-खातेदार का सहमति एवं अनापत्ति पत्र</div>
        <p>मैं श्री/श्रीमती <b>${esc(r.name)}</b>, पुत्र/पुत्री/पत्नी श्री <b>${esc(r.father)}</b>, निवासी <b>${esc(r.village || form.village)}</b>, आवेदक से संबंध <b>${esc(rel)}</b> हूँ। मैं निम्नलिखित सहमति प्रदान ${subject} हूँ कि—</p>
        <ol><li>मेरी भूमि का विवरण खाता संख्या <b>${esc(r.khata)}</b>, खसरा/गाटा संख्या <b>${esc(r.khasra)}</b>, कुल/प्रस्तावित क्षेत्रफल <b>${num(r.area).toFixed(4)} हे०</b> है।</li>
        <li>मैं अपनी भूमि में से <b>${num(r.area).toFixed(4)} हे०</b> क्षेत्रफल को श्री/श्रीमती <b>${esc(form.name)}</b> द्वारा ${esc(m.name)} योजना के आवेदन में सम्मिलित करने की सहमति ${consent} हूँ।</li>
        <li>मुझे उक्त भूमि पर प्रस्तावित उद्यान स्थापना एवं स्वीकृत कार्य किए जाने पर कोई आपत्ति नहीं है।</li>
        <li>मुझे योजना, प्रस्तावित कार्य तथा पात्रता के अनुसार राजसहायता के आवेदक के सत्यापित बैंक खाते में DBT के माध्यम से प्राप्त होने की जानकारी है और मुझे इस पर कोई आपत्ति नहीं है।</li>
        <li>मैं यह सहमति अपनी स्वतंत्र इच्छा से ${consent} हूँ और प्रस्तावित भूमि के उपयोग के संबंध में जानबूझकर अनावश्यक बाधा उत्पन्न नहीं ${future}।</li></ol>
        <h3>सह-खातेदार का विवरण</h3><table><tbody><tr><th>नाम</th><td>${esc(r.name)}</td></tr><tr><th>पिता/पति</th><td>${esc(r.father)}</td></tr><tr><th>आवेदक से संबंध</th><td><b>${esc(rel)}</b></td></tr><tr><th>लिंग</th><td>${esc(r.gender || "पुरुष")}</td></tr><tr><th>ग्राम</th><td>${esc(r.village)}</td></tr><tr><th>खाता संख्या</th><td>${esc(r.khata)}</td></tr><tr><th>खसरा/गाटा संख्या</th><td>${esc(r.khasra)}</td></tr><tr><th>सम्मिलित भूमि</th><td>${num(r.area).toFixed(4)} हे०</td></tr><tr><th>मोबाइल</th><td>________________</td></tr><tr><th>पहचान दस्तावेज</th><td>________________</td></tr></tbody></table>
        <div class="sig"><div>स्थान: ____________________<br>दिनांक: ____________________</div><div>सह-खातेदार<br><b>${esc(r.name)}</b><br>हस्ताक्षर/अंगूठा ____________________</div></div></article>`;
    }).join("") : `<div class="aff-doc"><div class="doc-title">सह-खातेदार का सहमति एवं अनापत्ति पत्र</div><p>इस आवेदन में कोई सह-खातेदार दर्ज नहीं है।</p></div>`;

// प्रिंट के समय body पर लगने वाले class तथा उनसे दिखने वाले section
const PRINT_CLASSES = [
  "print-app", "print-project", "print-affidavit", "print-consent",
  "print-affidavit-all", "print-anudan", "print-selected",
  "print-sel-application", "print-sel-project", "print-sel-affidavit",
  "print-sel-consent", "print-sel-anudan", "print-break-project",
  "print-break-affidavit", "print-break-consent", "print-break-anudan",
    const m = MASTER.kiwi, n = derivedNali();
    const pct = m.subsidy(n, form.beneficiary);
    const used = {};
    const calcRows = voucherRows.filter(row => row.some(value => String(value || "").trim() !== "")).map((row, i) => {
      const stage = row[0] || "Infrastructure स्थापना";
      const component = m.components.find(item => item.name === row[1]);
      const amount = num(row[3]);
      const cap = component ? component.cost * n / m.baseNali : 0;
      const previous = component ? (used[row[1]] || 0) : 0;
      const eligible = Math.min(amount, Math.max(0, cap - previous));
      if (component) used[row[1]] = previous + eligible;
      const subsidy = eligible * pct / 100;
      return { row, i, stage, componentName: row[1] || "—", amount, eligible, subsidy, farmer: amount - subsidy };
    });
    const total = calcRows.reduce((sum, row) => sum + row.amount, 0);
    const subsidyTotal = calcRows.reduce((sum, row) => sum + row.subsidy, 0);
    const farmerTotal = total - subsidyTotal;
    const payeeSummary = Array.from(new Set(calcRows.map(item => item.row[5] || item.row[4]).filter(Boolean))).join(", ") || "संबंधित बिल/वाउचर अनुसार";
    const anudanRowsHtml = calcRows.map(({ row, i, stage, componentName, amount, subsidy, farmer }) => `<tr><td>${i + 1}</td><td>${esc(stage)}</td><td>${esc(componentName)}${row[2] ? `<br><span>बिल/वाउचर नं. ${esc(row[2])}</span>` : ""}</td><td class="money">${money(amount)}</td><td class="money">${money(subsidy)}</td><td class="money">${money(farmer)}</td><td>${esc(row[5] || row[4] || "—")}</td></tr>`).join("");
    const anudanHtml = `<div class="anudan-form">
  app: ["applicationPrint"],
  project: ["report"],
  affidavit: ["affidavitPrint"],
  consent: ["consentPrint"],
  all: ["affidavitPrint", "consentPrint"],
        <div><b>आधार संख्या :</b> ${esc(form.aadhaar || "—")}</div><div><b>मो० नं० :</b> ${esc(form.mobile)}</div>
        <div><b>उद्यान का क्षेत्रफल (हेक्टेयर में) :</b> ${hectare().toFixed(2)}</div><div><b>आवेदन संख्या :</b> ${esc(form.appno || "—")}</div>
  anudan: ["anudanPrint"],
      <div class="af-bank"><h4>बैंक खाता विवरण</h4><div class="af-bank-grid"><div><b>खाता धारक :</b> ${esc(form.bankHolder || form.name || "—")}</div><div><b>बैंक :</b> ${esc(form.bankName || "—")}</div><div><b>शाखा :</b> ${esc(form.bankBranch || "—")}</div><div><b>खाता संख्या :</b> ${esc(form.bankAccount || "—")}</div><div><b>IFSC :</b> ${esc(form.bankIfsc || "—")}</div><div><b>खाता प्रकार :</b> ${esc(form.bankType || "—")}</div></div></div>
  selected: [],
      <table><thead><tr><th>क्र० सं०</th><th>निरीक्षण / भुगतान चरण</th><th>कार्य का विवरण</th><th>देयक की कुल धनराशि (₹)</th><th>राजसहायता हेतु धनराशि (₹)</th><th>कृषक द्वारा वहन की गयी धनराशि (₹)</th><th>जिसे भुगतान किया जाना है का विवरण</th></tr></thead>
      <tbody>${anudanRowsHtml || `<tr><td colspan="7">कोई बिल/वाउचर नहीं जोड़ा गया है।</td></tr>`}</tbody>
      <tfoot><tr class="af-total"><td colspan="3">कुल योग</td><td class="money">${money(total)}</td><td class="money">${money(subsidyTotal)}</td><td class="money">${money(farmerTotal)}</td><td>${esc(payeeSummary)}</td></tr></tfoot></table>
      <p class="af-para">संलग्न-</p><p class="af-para">प्रमाणित किया जाता है कि मेरे द्वारा ${esc(m.name)} स्थापना कार्यों पर उक्तानुसार धनराशि व्यय की गई है। कृषक अंश की धनराशि कुल ₹ <b>${money(farmerTotal)}</b> मेरे द्वारा भुगतान कर दी गयी है। अतः राजसहायता की ${pct}% की धनराशि ₹ <b>${money(subsidyTotal)}</b> का भुगतान संलग्न देयक अनुसार सम्बन्धितों को करने की कृपा कीजिएगा।</p>
      <div class="af-sign"><div>हस्ताक्षर कृषक : ____________________<br>नाम (अक्षरों में) : <b>${esc(form.name)}</b></div></div>
      <div class="af-inspect"><div class="af-inspect-title">निरीक्षण</div><p>प्रमाणित किया जाता है कि मेरे द्वारा ${esc(m.name)} स्थापना कार्य का निरीक्षण कर लिया गया है। अतः देयक राजसहायता की ${pct}% की धनराशि ₹ <b>${money(subsidyTotal)}</b> संलग्न देयक अनुसार सम्बन्धितों को कृषक के अनुरोध पर सत्यापित कर संस्तुति सहित भुगतान हेतु अग्रसारित।</p><div class="af-footer-sign">हस्ताक्षर प्रभारी : ____________________</div></div>
};

*/
const MASTER = {
  kiwi: {
    name: "कीवी उद्यान स्थापना",
    baseNali: 20,
    baseHa: 0.40,
    baseCost: 1184000,
    subsidy: (n, type) => type === "group" ? (n / 50 <= 5 ? 70 : 50) : ((n / 50) <= 1 ? 70 : 50),
    components: [
      { name: "भूमि विकास", qty: n => ({ v: "सम्पूर्ण परियोजना क्षेत्र हेतु", u: "" }), cost: 60000, spec: "भूमि समतलीकरण, सफाई, जुताई, ढलान के अनुसार मेड़बंदी तथा 6 मीटर × 4 मीटर की रोपण दूरी के अनुसार स्थल का layout/रेखांकन।" },
      { name: "गड्ढा खुदान एवं भराई", qty: n => ({ v: Math.round(167 * (n / 20)), u: "मुख्य गड्ढे" }), cost: 50000, spec: "कुल मुख्य गड्ढे निर्धारित अनुपात में। गड्ढे का आकार 1 मीटर × 1 मीटर × 1 मीटर। प्रति गड्ढा 30 किलोग्राम कम्पोस्ट मिलाकर भराई तथा भूमि सतह से 0.30 मीटर ऊँचाई तक भराव। रोपण दूरी 6 मीटर × 4 मीटर।" },
      { name: "टपक सिंचाई एवं जल संचयन प्रणाली", qty: n => ({ v: "1", u: "पूर्ण सेट" }), cost: 64000, spec: "फर्टिगेशन सहित वाटर टैंक, पम्प, बाईपास वाल्व, सेंड सेपरेटर/हाइड्रोसाइक्लोन फिल्टर, वेंचुरी इंजेक्टर, प्रेशर गेज, मीडिया फिल्टर, NRV, मेन लाइन, सब-मेन लाइन, कंट्रोल वाल्व, एयर रिलीज वाल्व, फ्लश वाल्व, इंड कैप तथा ड्रिपर/इमीटर्स।" },
      { name: "ट्रेलिस (T-Bar) सिस्टम", qty: n => { const p = { 5: 42, 10: 84, 15: 125, 20: 167 }; const key = Number(n); const main = Object.prototype.hasOwnProperty.call(p, key) ? p[key] : Math.round(167 * (key / 20)); return { v: main, u: "नग (मुख्य पौध/रोपण स्थान के अनुसार)" }; }, cost: 600000, spec: "T-Bar सिस्टम: मोटाई 6 mm, कुल ऊँचाई 2.5 मीटर (2.0 मीटर जमीन से ऊपर + 0.5 मीटर गहराई), arm चौड़ाई 2.0 मीटर, T-Bar दूरी 6 मीटर तथा 4 mm galvanized तार पूरी तरह कसा हुआ। T-Bar की संख्या मुख्य पौध/मुख्य रोपण स्थानों के अनुसार दिखाई जाएगी।" },
      { name: "GI चेन लिंक्ड फेंसिंग", qty: n => ({ v: Math.round(200 + 4 * Number(n)), u: "मीटर" }), cost: 295000, spec: "गैल्वेनाइज्ड GI chain-linked fencing, लोहे के खम्भों सहित। फेंसिंग की लंबाई किसान के स्वीकृत क्षेत्रफल की area-wise table के अनुसार होगी।" },
      { name: "खेती के औजार", qty: n => ({ v: "1", u: "मानक सेट" }), cost: 10000, spec: "सेकेटियर, pruning shear, sprayer आदि आवश्यक औद्यानिक/कृषि औजार।" },
      { name: "पौध संरक्षण रसायन / विकास नियामक / उर्वरक", qty: n => ({ v: "1", u: "प्रथम वर्ष की मानक आवश्यकता" }), cost: 15000, spec: "प्रथम वर्ष हेतु आवश्यक मात्रा में पौध संरक्षण रसायन, growth regulators तथा उर्वरक।" },
      { name: "विविध लागत", qty: n => ({ v: "1", u: "मानक प्रावधान" }), cost: 32000, spec: "गेट, बोर्ड तथा कटाई उपरान्त प्रबंधन हेतु plastic crates, corrugated fibre boxes आदि।" },
      { name: "रोपण सामग्री", qty: n => { const factor = n / 20; const main = Math.round(167 * factor); const gap = Math.round(41 * factor); const total = main + gap; const female = Math.round(total * 0.9); return { v: total, u: `नग (मुख्य ${main} + gap ${gap}; मादा ${female}, नर ${total - female})` }; }, cost: 58000, spec: "कुल उच्च गुणवत्तायुक्त कीवी पौधे = 167 मुख्य + 41 अतिरिक्त (25% रिक्तता पूर्ति हेतु बैकअप स्टॉक) प्रति 20 नाली के अनुपात में। कुल पौधों में 9 मादा : 1 नर अनुपात। दूरी 6m × 4m। अतिरिक्त पौधे replacement हेतु सुरक्षित रखे जाएंगे।" },
    ],
    instructions: ["6 मीटर × 4 मीटर रोपण दूरी के अनुसार स्थल का layout तैयार करें।", "प्रति मानक क्षेत्र मुख्य गड्ढे निर्धारित आकार में तैयार कर 30 किग्रा कम्पोस्ट के साथ भरें।", "कुल पौधों में 9 मादा : 1 नर अनुपात बनाए रखें।", "अतिरिक्त 41/20 नाली अनुपात के पौधों को backup stock के रूप में सुरक्षित रखें और आवश्यकता पर replacement करें।", "T-Bar trellis को निर्धारित height, arm width, spacing और 4 mm galvanized wire specification के अनुसार स्थापित करें।", "पूर्ण drip/fertigation system स्थापित करें।", "GI chain-link fencing, औजार, उर्वरक/रसायन और miscellaneous provisions मानक के अनुसार रखें."],
  },
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
const PRINT_CLASSES = [
  "print-app", "print-project", "print-affidavit", "print-consent", "print-affidavit-all", "print-anudan", "print-selected",
  "print-sel-application", "print-sel-project", "print-sel-affidavit", "print-sel-consent", "print-sel-anudan",
  "print-break-project", "print-break-affidavit", "print-break-consent", "print-break-anudan",
];
const PRINT_SECTIONS = {
  app: ["applicationPrint"], project: ["report"], affidavit: ["affidavitPrint"],
  consent: ["consentPrint"], all: ["affidavitPrint", "consentPrint"], anudan: ["anudanPrint"], selected: [],
};
const SELECTED_SECTIONS = {
  app: "applicationPrint", project: "report", aff: "affidavitPrint", consent: "consentPrint", anudan: "anudanPrint",
};
const API_MEDIA_BASE = "https://mahadevaaya.com/govbillingsystem/backend";
const MAX_DOC_BYTES = 5 * 1024 * 1024;
const DOC_FIELDS = [
  { key: "land_record_khatauni", label: "भूमि अभिलेख / खतौनी" },
  { key: "aadhaar_identity", label: "आधार / पहचान" },
  { key: "horticulture_card", label: "उद्यान कार्ड" },
  { key: "bank_passbook_cancelled_cheque", label: "बैंक पासबुक / cancelled cheque" },
  { key: "land_map_other_record", label: "भूमि नक्शा / अन्य अभिलेख" },
  { key: "other_document", label: "अन्य दस्तावेज" },
];
const docMediaUrl = path => {
  const value = String(path == null ? "" : path).trim();
  if (!value || value === "null" || value === "undefined") return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return `${API_MEDIA_BASE}${value}`;
  return `${API_MEDIA_BASE}/${value}`;
};
const createEmptyDocUrls = () => DOC_FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {});

const CENTERS = ["कोटद्वार", "किनगोड़िखाल", "चौखाल", "धुमाकोट", "बीरोंखाल", "हल्दूखाल", "किल्वोंखाल", "चेलूसैंण", "जयहरीखाल", "जेठागांव", "देवियोंखाल", "सिलोगी", "सिसल्ड़ी", "पौखाल", "सतपुली", "संगलाकोटी", "देवराजखाल", "पोखड़ा", "वेदीखाल", "विथ्याणी", "गंगाभोगपुर", "दिउली", "दुगड्डा", "सेंधीखाल"];
const RELATIONS = ["सहखातेदार", "भाई", "पुत्र", "पिता", "पत्नी", "अन्य"];
const API_KIWI = "https://mahadevaaya.com/govbillingsystem/backend/api/kiwi-kishan-avedan/";
const createKiwiForm = () => ({
  name: "", father: "", gender: "पुरुष", mobile: "", aadhaar: "", udyan: "",
  district: "", block: "", center: "", village: "", post: "", appno: "", remarks: "",
  beneficiary: "individual", bankHolder: "", bankName: "", bankBranch: "", bankAccount: "",
  bankIfsc: "", bankType: "बचत खाता", workMode: "firm", firmName: "", firmReg: "", workRemark: "",
  declWater: "", declIrrigation: "", declPrevious: "", declLand: "", declInspection: "", declShare: "",
});
const createKiwiLandRows = () => [
  { rel: "स्वयं", name: "", father: "", village: "", khata: "", khasra: "", gender: "पुरुष", area: "" },
  ...Array.from({ length: 4 }, () => ({ rel: "", name: "", father: "", village: "", khata: "", khasra: "", gender: "पुरुष", area: "" })),
];
const apiFetch = async (url, options = {}) => fetch(url, {
  ...options,
  method: (options.method || "GET").toUpperCase(),
  credentials: "omit",
});
const readApiResponse = async response => {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); }
  catch {
    throw new Error(contentType.toLowerCase().includes("application/json")
      ? "सर्वर का उत्तर पढ़ा नहीं जा सका।"
      : `सर्वर से अपेक्षित JSON नहीं मिला (${response.status})।`);
  }
};
const normalizeText = value => String(value == null ? "" : value).replace(/\s+/g, " ").trim();
const recordList = data => Array.isArray(data) ? data : (data?.data || data?.results || []);
const recordPersonal = record => record?.personal_details || record || {};
const recordFormId = record => record?.form_id || record?.personal_details?.form_id || "";

const KiwiFruits = () => {
  const [activeSideTab, setActiveSideTab] = useState("view");
  const [workflowStep, setWorkflowStep] = useState(0);
  const [sideOpen, setSideOpen] = useState(false);
  const [flashAnchor, setFlashAnchor] = useState(null);
  const [headerH, setHeaderH] = useState(0);
  const [footerH, setFooterH] = useState(0);
  const [activePage, setActivePage] = useState("register");
  const [formId, setFormId] = useState("");
  const [registration, setRegistration] = useState({ name: "", mobile: "", center: "कोटद्वार" });
  const [registeredRows, setRegisteredRows] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState("");
  const [savingStage, setSavingStage] = useState("");
  const [saveStates, setSaveStates] = useState({});
  const [voucherRows, setVoucherRows] = useState([["", "", "", "", "", ""]]);
  const [form, setForm] = useState(createKiwiForm);
  const [landRows, setLandRows] = useState(createKiwiLandRows);

  const [htmlOutputs, setHtmlOutputs] = useState({ app: "", report: "", aff: "", consent: "", anudan: "" });
  const [printCheckboxes, setPrintCheckboxes] = useState({ app: true, project: true, aff: true, consent: true, anudan: false });

  const [docFiles, setDocFiles] = useState({});
  const [docRemoved, setDocRemoved] = useState({});
  const [docUrls, setDocUrls] = useState(createEmptyDocUrls);
  const [docInputTick, setDocInputTick] = useState(0);

  const clearPrintClasses = () => {
    PRINT_CLASSES.forEach((c) => document.body.classList.remove(c));
  };

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

  // -------------- Print Handlers --------------
  useEffect(() => {
    const clear = clearPrintClasses;
    window.addEventListener("afterprint", clear);
    return () => window.removeEventListener("afterprint", clear);
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
    if (!form.bankHolder || !form.bankName || !form.bankBranch || !form.bankAccount || !form.bankIfsc) return false;
    if (!form.declWater || !form.declIrrigation || !form.declPrevious || !form.declLand || !form.declInspection || !form.declShare) return false;
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
    const totalHa = hectare();
    const ownLand = landRows[0] || {};
    const genderText = (male, female, other = male) => form.gender === "महिला" ? female : form.gender === "अन्य" ? other : male;
    const rows = m.components.map((c, i) => {
      const q = c.qty(n), cost = c.cost * f;
      return `<tr><td class="qty">${i + 1}</td><td><b>${esc(c.name)}</b></td><td class="spec">${esc(c.spec)}</td><td class="qty"><b>${q.v}</b><br><span class="small">${esc(q.u)}</span></td><td class="money">${money(cost)}</td></tr>`;
    }).join("");
    const workItems = m.components.map(c => {
      const q = c.qty(n);
      return `<li><b>${esc(c.name)}</b> — ${esc(c.spec)} <b>मात्रा: ${q.v}${q.u ? ` ${esc(q.u)}` : ""}</b></li>`;
    }).join("");
    const instructions = [
      `<b>क्षेत्रफल:</b> ${n.toFixed(2)} नाली (${totalHa.toFixed(2)} हे०) के अनुसार ही कार्य किया जाए।`,
      "<b>Quantity:</b> प्रत्येक component की निर्धारित मात्रा के अनुसार कार्य पूर्ण किया जाए।",
      "<b>Technical Specification:</b> कार्य संबंधित component के ऊपर दिए गए specification के अनुसार किया जाए।",
      "<b>सत्यापन:</b> गड्ढे, पौधे, ट्रेलिस, सिंचाई, फेंसिंग एवं अन्य कार्य स्थल पर निर्धारित मानक के अनुसार सत्यापित किए जाएंगे।",
      "<b>पौध सामग्री:</b> निर्धारित 9 मादा : 1 नर अनुपात तथा अतिरिक्त/प्रतिस्थापन पौधों का प्रावधान रखा जाए।",
      "<b>भुगतान/अनुदान:</b> निरीक्षण एवं स्वीकृति के बाद लागू चरणबद्ध प्रावधान के अनुसार भुगतान होगा।",
      "<b>दस्तावेज:</b> भूमि अभिलेख, बैंक विवरण, बिल/वाउचर तथा निरीक्षण से संबंधित अभिलेख सुरक्षित रखें।",
    ].map(item => `<li>${item}</li>`).join("");

    const appHtml = `<div class="application-header"><h2>कृषक आवेदन पत्र</h2><p><b>${esc(m.name)} — आवेदन पत्र</b></p></div>
      <h3>1. कृषक का विवरण</h3><table class="application-data-table"><tbody>
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
      <h3>3. मानक/स्वीकृत लागत एवं राजसहायता</h3><table class="application-cost-table"><tbody>
      <tr><th>मानक/स्वीकृत लागत</th><td>${money(total)}</td></tr>
      <tr><th>प्रस्तावित कुल क्षेत्रफल</th><td>${n.toFixed(2)} नाली / ${totalHa.toFixed(4)} हे०</td></tr>
      <tr><th>कुल परियोजना लागत</th><td>${money(total)}</td></tr>
      <tr><th>देय राजसहायता</th><td>${money(sub)} (${pct}%)</td></tr>
      <tr><th>कृषक अंश</th><td>${money(farmer)}</td></tr></tbody></table>
      <div class="application-annexure"><h3>7. संलग्न दस्तावेजों की सूची</h3><ol>
      <li>☑ खतौनी/भूमि अभिलेख की प्रति (06 माह से अधिक पुरानी न हो)</li><li>☑ पहचान पत्र (आधार कार्ड)</li>
      <li>☑ उद्यान कार्ड</li><li>☑ बैंक पासबुक की प्रति</li><li>☑ समूह का पंजीकरण प्रमाण पत्र (यदि समूह हो)</li>
      <li>☑ कार्य प्रारम्भ से पूर्व प्रस्तावित स्थल का जियो-टैग फोटो</li></ol><h3>घोषणा</h3>
      <p>मैं प्रमाणित ${genderText("करता हूँ", "करती हूँ", "करता/करती हूँ")} कि उपरोक्त दी गई सभी जानकारी मेरी जानकारी में पूर्णतः सही है। भविष्य में जानकारी असत्य पाई जाने पर मेरा आवेदन निरस्त किया जा सकता है / मुझे योजना से वंचित किया जा सकता है।</p></div>
      <div class="application-sign-off"><div class="signature-grid"><div>स्थान: ____________________<br>दिनांक: ____________________</div><div>कृषक / आवेदक<br><b>${esc(form.name)}</b><br>हस्ताक्षर / अंगूठा: ____________________</div></div>
      <div class="verify-box"><b>प्रभारी की आख्या</b><br>निरीक्षण दिनांक .................... को प्रस्तावित भूमि की उत्पादन हेतु उपयुक्त पायी गयी। मृदा परीक्षण / भौगोलिक स्थिति की जाँच बागान हेतु मानक के अनुकूल है।<br><br><b>उद्यान सचल दल केंद्र - ${esc(form.center) || "________________"}</b><br><br>हस्ताक्षर प्रभारी: ____________________</div></div>`;

    const reportHtml = `<div class="print-only"><h2>कृषक हेतु परियोजना मानक एवं कार्य-विवरण</h2><p>आवेदन के प्रस्तावित क्षेत्रफल के अनुसार स्वचालित रूप से तैयार</p></div>
      <div class="summary"><div class="metric"><span>योजना</span><b>${esc(m.name)}</b></div><div class="metric"><span>प्रस्तावित क्षेत्रफल</span><b>${n.toFixed(2)} नाली</b></div><div class="metric"><span>परियोजना लागत</span><b>${money(total)}</b></div><div class="metric"><span>अनुदान</span><b>${pct}%</b></div></div>
      <h2>2. मानक के अनुसार कार्य, मात्रा एवं Component-wise लागत</h2>
      <p class="small">किसान की रिपोर्ट में प्रति इकाई Rate नहीं दिखाया गया है। केवल निर्धारित Quantity, स्पष्ट Technical Specification और Component की कुल लागत दी गई है।</p>
      <div class="table-wrap"><table class="project-standard-table"><thead><tr><th>क्र.</th><th>कार्य / Component</th><th>स्पष्ट Technical Specification</th><th>Quantity</th><th>Component-wise लागत</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="finalbox"><div class="finalrow"><span>कुल परियोजना लागत</span><b>${money(total)}</b></div><div class="finalrow"><span>कृषक अंश</span><b>${money(farmer)}</b></div><div class="finalrow"><span>देय अनुदान / राजसहायता (${pct}%)</span><b>${money(sub)}</b></div></div>
      <div class="page-break"></div><h2>3. किसान द्वारा किए जाने वाले कार्य का विवरण</h2>
      <div class="note"><b>${esc(m.name)} — ${n.toFixed(2)} नाली (${totalHa.toFixed(2)} हे०) के लिए किसान हेतु कार्य</b></div><ol class="checklist">${workItems}</ol>
      <div class="note"><b>नोट:</b> ऊपर दिए गए सभी कार्य एवं मात्राएँ किसान के आवेदन में दर्ज क्षेत्रफल के अनुसार स्वतः निर्धारित की गई हैं।</div>
      <h2>4. परियोजना के महत्वपूर्ण तकनीकी एवं सत्यापन निर्देश</h2><div class="note"><b>${esc(m.name)} — महत्वपूर्ण तकनीकी एवं सत्यापन निर्देश</b></div>
      <ul class="checklist">${instructions}</ul><div class="note"><b>किसान घोषणा:</b> भूमि विवरण का कुल ${totalHa.toFixed(2)} हे०, आवेदन क्षेत्रफल ${totalHa.toFixed(2)} हे० से मिलान करता है। पात्रता एवं सत्यापन की अंतिम स्वीकृति विभागीय जाँच के अधीन होगी।</div>
      <div class="print-footer">यह पत्र आवेदन में दर्ज क्षेत्रफल और उपलब्ध Master Standard के आधार पर स्वचालित रूप से तैयार किया गया है।</div>`;

    setHtmlOutputs(prev => ({ ...prev, app: appHtml, report: reportHtml }));
    return true;
  };

  const buildAffidavit = () => {
    if (!valid()) return false;
    const m = MASTER.kiwi, n = derivedNali();
    const co = landRows.filter(r => r.rel && r.rel !== "स्वयं" && r.name);
    const coMode = co.length > 0;
    const g = form.gender;
    const genderText = (male, female, other = male) => g === "महिला" ? female : g === "अन्य" ? other : male;
    const totalHa = hectare().toFixed(4);
    const totalNali = n.toFixed(2);
    const address = [form.village, form.post, form.block, form.district].filter(Boolean).join(", ");
    const commonOpening = coMode ? [
      `मेरे द्वारा कुल <b>${totalNali} नाली / ${totalHa} हे०</b> भूमि प्रस्तावित की गई है, जिसमें मेरी स्वयं की भूमि तथा आवश्यकतानुसार सह-खातेदार की भूमि सम्मिलित है।`,
      "सभी खाता, खसरा/गाटा तथा प्रस्तावित क्षेत्रफल का विवरण संबंधित भूमि अभिलेख के अनुसार सही है।",
      "प्रत्येक सह-खातेदार ने अपनी स्वतंत्र इच्छा से मेरी योजना में अपनी भूमि सम्मिलित करने हेतु लिखित सहमति एवं अनापत्ति दी है, जो इस शपथ-पत्र के साथ संलग्न है।",
      "सह-खातेदारों को परियोजना, भूमि के उपयोग तथा पात्रता के अनुसार राजसहायता के आवेदक के सत्यापित बैंक खाते में DBT के माध्यम से प्राप्त होने की जानकारी है और उन्हें इस पर कोई आपत्ति नहीं है.",
    ] : [
      `मेरे द्वारा कुल <b>${totalNali} नाली / ${totalHa} हे०</b> भूमि प्रस्तावित की गई है, जो मेरी स्वयं की भूमि है।`,
      "सभी खाता, खसरा/गाटा तथा प्रस्तावित क्षेत्रफल का विवरण संबंधित भूमि अभिलेख के अनुसार सही है।",
      "प्रस्तावित भूमि मेरी स्वयं की है और इस भूमि के संबंध में किसी अन्य सह-खातेदार की सहमति की आवश्यकता नहीं है।",
      "राजसहायता, यदि देय हो, योजना की पात्रता एवं सत्यापन के अनुसार मेरे सत्यापित बैंक खाते में DBT के माध्यम से प्राप्त होने की जानकारी मुझे है।",
    ];
    const schemeClauses = [
      `यह कि मेरे द्वारा <b>कीवी उद्यान स्थापना</b> हेतु उद्यान विभाग में विधिवत आवेदन किया गया है और प्रस्तावित भूमि पर उत्तराखण्ड कीवी नीति-2025 के लागू प्रावधानों के अनुसार कार्य किया जाएगा।`,
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
    ];
    const commonClosing = [
      "आवेदन में दर्ज कार्य, मात्रा, कृषक अंश, राजसहायता एवं अन्य जानकारी मेरी जानकारी के अनुसार सही है।",
      `कृषक अंश तथा अनुमन्य लागत से अधिक अतिरिक्त व्यय, जहाँ लागू हो, मैं स्वयं ${genderText("दूँगा", "दूँगी", "दूँगा/दूँगी")}।`,
      "प्रस्तावित भूमि/कार्य पर ऐसा कोई दोहरा सरकारी लाभ प्राप्त नहीं किया गया है जिससे एक ही कार्य पर दोहरा अनुदान मिले; यदि कोई पूर्वलाभ लागू/प्राप्त हुआ है तो उसका विवरण आवेदन में सत्य रूप से दिया गया है।",
      `मैं परियोजना में स्थापित पौध, सिंचाई प्रणाली, infrastructure/सहायक संरचना, फेंसिंग तथा अन्य स्वीकृत परिसंपत्तियों के उचित उपयोग, सुरक्षा एवं रख-रखाव की जिम्मेदारी ${genderText("निभाऊँगा", "निभाऊँगी", "निभाऊँगा/निभाऊँगी")}।`,
      `असत्य/भ्रामक/नियम-विरुद्ध जानकारी पाए जाने पर नियमानुसार आवेदन निरस्त, राजसहायता की वसूली तथा आवश्यक विभागीय/कानूनी कार्यवाही ${genderText("स्वीकार्य होगा", "स्वीकार्य होगी", "स्वीकार्य होगा/होगी")}।`,
      "मैंने यह शपथ-पत्र बिना दबाव, भय अथवा प्रलोभन के अपनी स्वतंत्र इच्छा से दिया है।",
      "यह कि आवेदन में दी गई भूमि, क्षेत्रफल, खसरा/गाटा, खाता/खतौनी, बैंक विवरण, उद्यान कार्ड तथा अन्य जानकारी सत्य एवं सही है।",
      "यह कि प्राकृतिक आपदा, जंगली जानवरों, मौसमजनित क्षति अथवा अन्य व्यावहारिक नुकसान की स्थिति में विभाग की जिम्मेदारी योजना के लागू नियमों तक ही सीमित होगी।",
    ];
    const clauses = [...commonOpening, ...commonClosing.slice(0, 2), ...schemeClauses, ...commonClosing.slice(2)];
    const landRowsHtml = landRows.filter(row => row.rel && (row.name || row.area)).map((row, i) =>
      `<tr><td>${i + 1}</td><td>${esc(row.rel === "सहखातेदार" ? "सह-खातेदार" : row.rel)}</td><td>${esc(row.name || "—")}</td><td>${esc(row.father || "—")}</td><td>${esc(row.village || "—")}</td><td>${esc(row.khata || "—")}</td><td>${esc(row.khasra || "—")}</td><td class="money">${num(row.area).toFixed(4)}</td></tr>`).join("");
    const affidavitLandTable = `<table><thead><tr><th>क्र.</th><th>भूमि किसकी</th><th>नाम</th><th>पिता/पति</th><th>ग्राम</th><th>खाता</th><th>खसरा/गाटा</th><th>प्रस्तावित भूमि (हे०)</th></tr></thead><tbody>${landRowsHtml}</tbody><tfoot><tr><th colspan="7">कुल प्रस्तावित क्षेत्रफल</th><th>${totalHa} हे०</th></tr></tfoot></table>`;
    const affHtml = `<article class="aff-doc"><div class="doc-title">${esc(m.name)}</div><div class="doc-subtitle">लाभार्थी स्व-घोषणा एवं शपथ-पत्र — ${coMode ? "स्वयं + सह-खातेदार" : "केवल स्वयं की भूमि"}</div>
      <p>मैं श्री/श्रीमती ${esc(form.name)}, पुत्र/पुत्री/पत्नी श्री ${esc(form.father)}, निवासी ${esc(address)}, उत्तराखण्ड, सत्यनिष्ठा से शपथपूर्वक निम्नलिखित घोषणा ${genderText("करता", "करती", "करता/करती")} हूँ कि—</p>
      <ol>${clauses.map(clause => `<li>${clause}</li>`).join("")}</ol><h3>भूमि एवं ${coMode ? "सह-खातेदार " : ""}विवरण</h3>${affidavitLandTable}
      <div class="sig"><div>स्थान: ____________________<br>दिनांक: ____________________</div><div>शपथकर्ता/कृषक<br><b>${esc(form.name)}</b><br>हस्ताक्षर/अंगूठा ____________________</div></div>
      <p class="aff-note">स्टाम्प/नोटरी/शपथ आयुक्त संबंधी औपचारिकता संबंधित विभाग/लागू नियम के अनुसार पूरी की जाए।</p></article>`;

    const consentHtml = co.length ? co.map((r, idx) => {
      const coGender = (male, female, other = male) => r.gender === "महिला" ? female : r.gender === "अन्य" ? other : male;
      return `<article class="aff-doc ${idx ? "page-break-doc" : ""}"><div class="doc-title">${esc(m.name)} हेतु</div><div class="doc-subtitle">सह-खातेदार का सहमति एवं अनापत्ति पत्र</div>
      <p>मैं श्री/श्रीमती <b>${esc(r.name)}</b>, पुत्र/पुत्री/पत्नी श्री <b>${esc(r.father)}</b>, निवासी <b>${esc(r.village || form.village)}</b>, आवेदक से संबंध <b>${esc(r.rel === "सहखातेदार" ? "सह-खातेदार" : r.rel)}</b> हूँ। मैं निम्नलिखित सहमति प्रदान ${coGender("करता", "करती", "करता/करती")} हूँ कि—</p>
      <ol><li>मेरी भूमि का विवरण खाता संख्या <b>${esc(r.khata)}</b>, खसरा/गाटा संख्या <b>${esc(r.khasra)}</b>, कुल/प्रस्तावित क्षेत्रफल <b>${num(r.area).toFixed(4)} हे०</b> है।</li>
      <li>मैं अपनी भूमि में से <b>${num(r.area).toFixed(4)} हे०</b> क्षेत्रफल को श्री/श्रीमती <b>${esc(form.name)}</b> द्वारा ${esc(m.name)} योजना के आवेदन में सम्मिलित करने की सहमति ${coGender("देता", "देती", "देता/देती")} हूँ।</li>
      <li>मुझे उक्त भूमि पर प्रस्तावित उद्यान स्थापना एवं स्वीकृत कार्य किए जाने पर कोई आपत्ति नहीं है।</li>
      <li>मुझे योजना, प्रस्तावित कार्य तथा पात्रता के अनुसार राजसहायता के आवेदक के सत्यापित बैंक खाते में DBT के माध्यम से प्राप्त होने की जानकारी है और मुझे इस पर कोई आपत्ति नहीं है।</li>
      <li>मैं यह सहमति अपनी स्वतंत्र इच्छा से ${coGender("देता", "देती", "देता/देती")} हूँ और प्रस्तावित भूमि के उपयोग के संबंध में जानबूझकर अनावश्यक बाधा उत्पन्न नहीं ${coGender("करूँगा", "करूँगी", "करूँगा/करूँगी")}।</li></ol>
      <h3>सह-खातेदार का विवरण</h3><table><tbody><tr><th>नाम</th><td>${esc(r.name)}</td></tr><tr><th>पिता/पति</th><td>${esc(r.father)}</td></tr><tr><th>आवेदक से संबंध</th><td><b>${esc(r.rel === "सहखातेदार" ? "सह-खातेदार" : r.rel)}</b></td></tr><tr><th>लिंग</th><td>${esc(r.gender || "पुरुष")}</td></tr><tr><th>ग्राम</th><td>${esc(r.village || form.village)}</td></tr><tr><th>खाता संख्या</th><td>${esc(r.khata)}</td></tr><tr><th>खसरा/गाटा संख्या</th><td>${esc(r.khasra)}</td></tr><tr><th>सम्मिलित भूमि</th><td>${num(r.area).toFixed(4)} हे०</td></tr><tr><th>मोबाइल</th><td>________________</td></tr><tr><th>पहचान दस्तावेज</th><td>________________</td></tr></tbody></table>
      <div class="sig"><div>स्थान: ____________________<br>दिनांक: ____________________</div><div>सह-खातेदार<br><b>${esc(r.name)}</b><br>हस्ताक्षर/अंगूठा ____________________</div></div></article>`;
    }).join("") : `<div class="aff-doc"><div class="doc-title">सह-खातेदार का सहमति एवं अनापत्ति पत्र</div><p>इस आवेदन में कोई सह-खातेदार दर्ज नहीं है।</p></div>`;

    setHtmlOutputs(prev => ({ ...prev, aff: affHtml, consent: consentHtml }));
    return true;
  };

  const buildAnudan = () => {
    if (!valid()) return false;
    const m = MASTER.kiwi, n = derivedNali();
    const pct = m.subsidy(n, form.beneficiary);
    const entries = voucherRows.filter(row => row.some(value => String(value || "").trim() !== ""));
    const total = entries.reduce((sum, row) => sum + num(row[3]), 0);
    const subsidy = total * pct / 100;
    const farmer = total - subsidy;
    const recipients = Array.from(new Set(entries.map(row => row[4] === "फर्म" ? row[5] : form.name).filter(Boolean))).join(", ") || "संबंधित बिल/वाउचर अनुसार";
    const rows = entries.map((row, i) => {
      const amount = num(row[3]), grant = amount * pct / 100;
      return `<tr><td>${i + 1}</td><td>${esc(row[0] || "Infrastructure स्थापना")}</td><td>${esc(row[1] || "—")}${row[2] ? `<br><span>बिल/वाउचर नं. ${esc(row[2])}</span>` : ""}</td><td class="money">${money(amount)}</td><td class="money">${money(grant)}</td><td class="money">${money(amount - grant)}</td><td>${esc(row[4] === "फर्म" ? row[5] : form.name)}</td></tr>`;
    }).join("");
    const anudanHtml = `<div class="anudan-form">
      <div class="af-head">जिला योजना वर्ष 2026-27</div>
      <div class="af-title">${esc(m.name)} अन्तर्गत राजसहायता देयक</div>
      <div class="af-meta">
        <div><b>नाम कृषक :</b> ${esc(form.name)}</div><div><b>पिता का नाम :</b> ${esc(form.father)}</div>
        <div><b>ग्राम :</b> ${esc(form.village)}</div><div><b>विकास खण्ड :</b> ${esc(form.block)}</div>
        <div><b>आधार संख्या :</b> ${esc(form.aadhaar || "—")}</div><div><b>मो० नं० :</b> ${esc(form.mobile)}</div>
        <div><b>उद्यान का क्षेत्रफल (हेक्टेयर में) :</b> ${hectare().toFixed(2)}</div><div><b>आवेदन संख्या :</b> ${esc(form.appno || "—")}</div>
      </div>
      <div class="af-bank"><h4>बैंक खाता विवरण</h4><div class="af-bank-grid"><div><b>खाता धारक :</b> ${esc(form.bankHolder || form.name || "—")}</div><div><b>बैंक :</b> ${esc(form.bankName || "—")}</div><div><b>शाखा :</b> ${esc(form.bankBranch || "—")}</div><div><b>खाता संख्या :</b> ${esc(form.bankAccount || "—")}</div><div><b>IFSC :</b> ${esc(form.bankIfsc || "—")}</div><div><b>खाता प्रकार :</b> ${esc(form.bankType || "—")}</div></div></div>
      <div><b>देयक सारणी</b></div>
      <table><thead><tr><th>क्र० सं०</th><th>निरीक्षण / भुगतान चरण</th><th>कार्य का विवरण</th><th>देयक की कुल धनराशि (₹)</th><th>राजसहायता हेतु धनराशि (₹)</th><th>कृषक द्वारा वहन की गयी धनराशि (₹)</th><th>जिसे भुगतान किया जाना है का विवरण</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="7">कोई बिल/वाउचर नहीं जोड़ा गया है।</td></tr>'}</tbody>
      <tfoot><tr class="af-total"><td colspan="3">कुल योग</td><td class="money">${money(total)}</td><td class="money">${money(subsidy)}</td><td class="money">${money(farmer)}</td><td>${esc(recipients)}</td></tr></tfoot></table>
      <p class="af-para">संलग्न-</p><p class="af-para">प्रमाणित किया जाता है कि मेरे द्वारा ${esc(m.name)} स्थापना कार्यों पर उक्तानुसार धनराशि व्यय की गई है। कृषक अंश की धनराशि कुल ₹ <b>${money(farmer)}</b> मेरे द्वारा भुगतान कर दी गयी है। अतः राजसहायता की ${pct}% की धनराशि ₹ <b>${money(subsidy)}</b> का भुगतान संलग्न देयक अनुसार सम्बन्धितों को करने की कृपा कीजिएगा।</p>
      <div class="af-sign"><div>हस्ताक्षर कृषक : ____________________<br>नाम (अक्षरों में) : <b>${esc(form.name)}</b></div></div>
      <div class="af-inspect"><div class="af-inspect-title">निरीक्षण</div><p>प्रमाणित किया जाता है कि मेरे द्वारा ${esc(m.name)} स्थापना कार्य का निरीक्षण कर लिया गया है। अतः देयक राजसहायता की ${pct}% की धनराशि ₹ <b>${money(subsidy)}</b> संलग्न देयक अनुसार सम्बन्धितों को कृषक के अनुरोध पर सत्यापित कर संस्तुति सहित भुगतान हेतु अग्रसारित।</p><div class="af-footer-sign">हस्ताक्षर प्रभारी : ____________________</div></div>
    </div>`;
    setHtmlOutputs(prev => ({ ...prev, anudan: anudanHtml }));
    return true;
  };

  // -------------- Print Handlers --------------
  // body पर छपने वाले class लगाने के बाद ही खोलने से पहले जाँच लेते हैं कि
  // चुना गया दस्तावेज़ DOM में सचमुच मौजूद है — नहीं तो PDF खाली आता है।
  const triggerPrint = (className, targetIds) => {
    document.body.classList.add(className);
    window.setTimeout(() => {
      const ids = targetIds && targetIds.length ? targetIds : [];
      const missing = ids.filter((id) => {
        const el = document.getElementById(id);
        return !el || !el.textContent.trim();
      });
      if (!ids.length) {
        clearPrintClasses();
        alert('पहले कम से कम एक दस्तावेज़ चुनें।');
        return;
      }
      if (missing.length) {
        clearPrintClasses();
        alert('चुना गया दस्तावेज़ तैयार नहीं है — पहले "मानक बनाएँ / दस्तावेज़ तैयार करें" दबाएँ।');
        return;
      }
      window.print();
    }, 250);
  };

  const handlePrint = (type) => {
    if (!valid()) { alert('पहले आवेदन की आवश्यक जानकारी सही करें।'); return; }
    clearPrintClasses();
    if (['app', 'project', 'selected'].includes(type) && !generate()) return;
    if (['affidavit', 'consent', 'all', 'selected'].includes(type) && !buildAffidavit()) return;
    if (['anudan', 'selected'].includes(type) && !buildAnudan()) return;

    const cls = {
      app: 'print-app', project: 'print-project', affidavit: 'print-affidavit',
      consent: 'print-consent', all: 'print-affidavit-all', anudan: 'print-anudan', selected: 'print-selected'
    }[type];
    if (!cls) return;

    let targetIds = PRINT_SECTIONS[type] || [];
    if (type === 'selected') {
      clearPrintClasses();
      document.body.classList.add('print-sel-application', 'print-sel-project', 'print-sel-affidavit', 'print-sel-consent', 'print-sel-anudan');
      if (!printCheckboxes.app) document.body.classList.remove('print-sel-application');
      if (!printCheckboxes.project) document.body.classList.remove('print-sel-project');
      if (!printCheckboxes.aff) document.body.classList.remove('print-sel-affidavit');
      if (!printCheckboxes.consent) document.body.classList.remove('print-sel-consent');
      if (!printCheckboxes.anudan) document.body.classList.remove('print-sel-anudan');
      let hasSelectedDocument = false;
      [['app', printCheckboxes.app], ['project', printCheckboxes.project], ['affidavit', printCheckboxes.aff], ['consent', printCheckboxes.consent], ['anudan', printCheckboxes.anudan]].forEach(([key, selected]) => {
        if (selected && hasSelectedDocument && key !== 'app') document.body.classList.add(`print-break-${key}`);
        if (selected) hasSelectedDocument = true;
      });
      targetIds = Object.keys(SELECTED_SECTIONS)
        .filter((k) => printCheckboxes[k])
        .map((k) => SELECTED_SECTIONS[k]);
    }
    triggerPrint(cls, targetIds);
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

  const syncDocUrls = record => {
    const documents = record?.document_details || {};
    setDocUrls(DOC_FIELDS.reduce((acc, field) => ({ ...acc, [field.key]: docMediaUrl(documents[field.key]) }), {}));
  };

  const resetDocState = () => {
    setDocFiles({});
    setDocRemoved({});
    setDocUrls(createEmptyDocUrls());
    setDocInputTick(tick => tick + 1);
  };

  const handleDocFileChange = (key, file) => {
    if (!file) return;
    if (file.size > MAX_DOC_BYTES) {
      setApiMessage(`"${file.name}" 5 MB से बड़ी है — अधिकतम 5 MB की फाइल चुनें।`);
      setDocInputTick(tick => tick + 1);
      return;
    }
    setDocFiles(previous => ({ ...previous, [key]: file }));
    setDocRemoved(previous => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const clearDocField = key => {
    setDocFiles(previous => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
    setDocRemoved(previous => (docUrls[key] ? { ...previous, [key]: true } : previous));
    setDocUrls(previous => ({ ...previous, [key]: "" }));
    setDocInputTick(tick => tick + 1);
  };

  const pendingDocKeys = () => Object.keys(docRemoved).filter(key => docRemoved[key]);

  const saveDraft = () => {
    localStorage.setItem("kiwiApp", JSON.stringify({ form, landRows, voucherRows }));
    alert("आवेदन Draft सुरक्षित हो गया।");
  };

  const loadDraft = () => {
    const o = JSON.parse(localStorage.getItem("kiwiApp") || "null");
    if (o) {
      setForm(o.form);
      setLandRows(o.landRows);
      setVoucherRows(o.voucherRows || [["", "", "", "", "", ""]]);
      alert("आवेदन Draft लोड हो गया।");
    } else {
      alert("कोई Draft उपलब्ध नहीं है।");
    }
  };

  const getApiError = (data, response) => {
    if (typeof data === "string") return data;
    return data?.detail || data?.error || data?.message || `अनुरोध विफल (status ${response.status})`;
  };

  const fetchRegistrations = async (centerName = registration.center) => {
    const url = `${API_KIWI}?center_name=${encodeURIComponent(centerName)}`;
    const response = await apiFetch(url);
    if (response.status === 404) return [];
    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(getApiError(data, response));
    return recordList(data);
  };

  const loadRegistrations = useCallback(async (centerName = registration.center) => {
    setRegistrationsLoading(true);
    try {
      const records = await fetchRegistrations(centerName);
      setRegisteredRows(records);
      setApiMessage("");
    } catch (error) {
      setRegisteredRows([]);
      setApiMessage(`सूची लोड नहीं हो सकी: ${error.message || "अज्ञात त्रुटि"}`);
    } finally {
      setRegistrationsLoading(false);
    }
  }, [registration.center]);

  useEffect(() => {
    loadRegistrations(registration.center);
  }, [loadRegistrations, registration.center]);

  const registerFarmer = async event => {
    event.preventDefault();
    if (!registration.name.trim()) {
      setApiMessage("कृषक का नाम भरना अनिवार्य है।");
      return;
    }
    if (!/^\d{10}$/.test(registration.mobile.trim())) {
      setApiMessage("10 अंक का सही मोबाइल नंबर भरें।");
      return;
    }
    try {
      setSavingStage("register");
      const response = await apiFetch(API_KIWI, {
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
      const blankForm = createKiwiForm();
      setForm({ ...blankForm, name: registration.name.trim(), mobile: registration.mobile.trim(), center: registration.center, appno: newFormId });
      setLandRows(createKiwiLandRows());
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

  const applyApiRecord = record => {
    const personal = recordPersonal(record);
    const documents = record?.document_details || {};
    const id = recordFormId(record);
    const farmerType = personal.farmer_type || "व्यक्तिगत कृषक";
    const bankType = personal.bank_account_type || "Savings";
    setForm({
      ...createKiwiForm(),
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
      bankType: bankType === "Current" ? "चालू खाता" : bankType === "Other" ? "अन्य" : "बचत खाता",
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
    setLandRows(land.length ? land.map(row => ({
      rel: row[0] || "", name: row[1] || "", father: row[2] || "", gender: row[3] || "पुरुष",
      village: row[4] || "", khata: row[5] || "", khasra: row[6] || "", area: row[7] || "",
    })) : createKiwiLandRows());
    setVoucherRows(documents.anudan_voucher?.length ? documents.anudan_voucher.map(row => [...row]) : [["", "", "", "", "", ""]]);
    setDocFiles({});
    setDocRemoved({});
    setDocInputTick(tick => tick + 1);
    syncDocUrls(record);
    setFormId(id);
    setSaveStates({});
  };

  const openRegisteredForm = async formIdToOpen => {
    try {
      setSavingStage("loading");
      let records = registeredRows;
      if (!records.some(record => recordFormId(record) === formIdToOpen)) {
        records = await fetchRegistrations(registration.center);
        setRegisteredRows(records);
      }
      const record = records.find(item => recordFormId(item) === formIdToOpen);
      if (!record) throw new Error(`फॉर्म ${formIdToOpen} सूची में नहीं मिला।`);
      applyApiRecord(record);
      setActivePage("filling");
      setApiMessage(`फॉर्म ${formIdToOpen} सर्वर से लोड हुआ।`);
      window.scrollTo(0, 0);
    } catch (error) {
      setApiMessage(`फॉर्म लोड नहीं हो सका: ${error.message || "अज्ञात त्रुटि"}`);
    } finally {
      setSavingStage("");
    }
  };

  const saveSteps = (activeFormId = formId) => [
    { key: "personal", label: "आवेदक विवरण", payload: {
      form_id: activeFormId, farmer_name: form.name, father_husband_name: form.father, gender: form.gender,
      udyan_card_no: form.udyan, mobile: form.mobile, aadhaar: form.aadhaar, district: form.district,
      block: form.block, center: form.center, village: form.village, post: form.post,
      farmer_type: form.beneficiary === "group" ? "समूह" : "व्यक्तिगत कृषक", remarks: form.remarks,
    } },
    { key: "land", label: "भूमि विवरण", payload: {
      form_id: activeFormId,
      land_work_details: landRows.filter(row => row.rel || row.name || row.father || row.village || row.khata || row.khasra || row.area)
        .map(row => [row.rel, row.name, row.father, row.gender, row.village, row.khata, row.khasra, row.area]),
    } },
    { key: "bank", label: "बैंक विवरण", acceptsFiles: true, payload: {
      form_id: activeFormId, bank_holder_name: form.bankHolder, bank_name: form.bankName,
      bank_branch: form.bankBranch, bank_account_number: form.bankAccount, bank_ifsc: form.bankIfsc,
      bank_account_type: form.bankType === "चालू खाता" ? "Current" : form.bankType === "अन्य" ? "Other" : "Savings",
    } },
    { key: "work", label: "कार्य निष्पादन", payload: {
      form_id: activeFormId, work_mode: form.workMode === "self" ? "स्वयं" : "फर्म",
      firm_name: form.firmName, firm_registration_no: form.firmReg, work_remark: form.workRemark,
    } },
    { key: "documents", label: "दस्तावेज", documentsStep: true, acceptsFiles: true, payload: { form_id: activeFormId } },
    { key: "declarations", label: "घोषणाएँ", payload: {
      form_id: activeFormId, declaration_no_waterlogging: form.declWater,
      declaration_irrigation_available: form.declIrrigation, declaration_previous_benefit: form.declPrevious,
      declaration_land_correct: form.declLand, declaration_inspection_consent: form.declInspection,
      declaration_farmer_share: form.declShare,
    } },
    { key: "vouchers", label: "अनुदान व्यय", payload: {
      form_id: activeFormId,
      anudan_voucher: voucherRows.filter(row => row.some(value => String(value || "").trim() !== "")),
    } },
  ];

  const buildMultipartBody = step => {
    const formData = new FormData();
    Object.entries(step.payload).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      formData.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
    });
    DOC_FIELDS.forEach((field) => {
      const file = docFiles[field.key];
      if (file) formData.append(field.key, file, file.name || field.label);
    });
    pendingDocKeys().forEach(key => formData.append(key, ""));
    return formData;
  };

  const hasDocChanges = () => DOC_FIELDS.some(field => docFiles[field.key]) || pendingDocKeys().length > 0;

  const putStage = async step => {
    const options = { method: "PUT" };
    if (step.acceptsFiles && hasDocChanges()) {
      options.body = buildMultipartBody(step);
    } else {
      options.headers = { "Content-Type": "application/json" };
      options.body = JSON.stringify(step.payload);
    }
    const response = await apiFetch(API_KIWI, options);
    const data = await readApiResponse(response);
    if (!response.ok) throw new Error(getApiError(data, response));
    return data;
  };

  const refreshDocUrls = async activeFormId => {
    if (!activeFormId) return;
    try {
      const records = await fetchRegistrations(registration.center);
      setRegisteredRows(records);
      const record = records.find(item => recordFormId(item) === activeFormId);
      if (record) syncDocUrls(record);
    } catch {
      setApiMessage("फाइलें सहेजी गईं, पर सूची ताज़ा नहीं हो सकी।");
    }
  };

  const saveOneStage = async key => {
    if (savingStage) return;
    const step = saveSteps().find(item => item.key === key);
    if (!step) return;
    if (!formId) {
      setApiMessage("पहले कृषक पंजीकरण करें या पंजीकृत फॉर्म खोलें — PUT के लिए फॉर्म आईडी आवश्यक है।");
      setSaveStates(previous => ({ ...previous, [key]: "फॉर्म आईडी नहीं है" }));
      return;
    }
    setSavingStage(key);
    setSaveStates(previous => ({ ...previous, [key]: "सहेजा जा रहा है…" }));
    try {
      const uploadedDocs = step.acceptsFiles && hasDocChanges();
      await putStage(step);
      setSaveStates(previous => ({ ...previous, [key]: "सहेजा गया" }));
      setApiMessage(uploadedDocs ? `${step.label} सहेजा गया — फाइलें अपलोड हो गईं (${formId})` : `${step.label} सफलतापूर्वक सहेजा गया — ${formId}`);
      if (uploadedDocs) {
        resetDocState();
        await refreshDocUrls(formId);
      }
    } catch (error) {
      setSaveStates(previous => ({ ...previous, [key]: `विफल: ${error.message || "त्रुटि"}` }));
      setApiMessage(`${step.label} सहेजा नहीं जा सका: ${error.message || "अज्ञात त्रुटि"}`);
    } finally {
      setSavingStage("");
    }
  };

  const saveAllStages = async () => {
    if (!formId) {
      setApiMessage("पहले कृषक पंजीकरण करें या पंजीकृत फॉर्म खोलें — PUT के लिए फॉर्म आईडी आवश्यक है।");
      return;
    }
    if (savingStage) return;
    let completed = 0;
    setSavingStage("all");
    for (const step of saveSteps()) {
      setSaveStates(previous => ({ ...previous, [step.key]: "सहेजा जा रहा है…" }));
      try {
        const uploadedDocs = step.acceptsFiles && hasDocChanges();
        await putStage(step);
        completed += 1;
        setSaveStates(previous => ({ ...previous, [step.key]: "सहेजा गया" }));
        if (uploadedDocs) {
          resetDocState();
          await refreshDocUrls(formId);
        }
      } catch (error) {
        setSaveStates(previous => ({ ...previous, [step.key]: `विफल: ${error.message || "त्रुटि"}` }));
        setApiMessage(`${completed} / 7 चरण सहेजे गए। ${step.label}: ${error.message || "अज्ञात त्रुटि"}`);
        setSavingStage("");
        return;
      }
    }
    setApiMessage(`सभी 7 चरण सफलतापूर्वक सहेजे गए — ${formId}`);
    setSavingStage("");
  };

  const deleteRegisteredForm = async id => {
    if (!window.confirm(`फॉर्म ${id} को स्थायी रूप से हटाएँ?`)) return;
    try {
      setSavingStage("delete");
      const response = await apiFetch(API_KIWI, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_ids: [id] }),
      });
      const data = await readApiResponse(response);
      if (!response.ok) throw new Error(getApiError(data, response));
      if (formId === id) {
        setFormId("");
        setForm(createKiwiForm());
        setLandRows(createKiwiLandRows());
        setVoucherRows([["", "", "", "", "", ""]]);
        setActivePage("register");
        resetDocState();
      }
      setApiMessage(`फॉर्म ${id} हटा दिया गया।`);
      await loadRegistrations(registration.center);
    } catch (error) {
      setApiMessage(`फॉर्म हटाया नहीं जा सका: ${error.message || "अज्ञात त्रुटि"}`);
    } finally {
      setSavingStage("");
    }
  };

  const startNewApplication = () => {
    setForm(createKiwiForm());
    setLandRows(createKiwiLandRows());
    setVoucherRows([["", "", "", "", "", ""]]);
    setFormId("");
    setSaveStates({});
    resetDocState();
    setActivePage("register");
    setWorkflowStep(0);
    setApiMessage("");
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
  const saveStepControl = (key, label) => (
    <div className="save-step-control noprint">
      <button type="button" className="btn secondary" onClick={() => saveOneStage(key)} disabled={Boolean(savingStage)}>
        {savingStage === key ? `सहेजा जा रहा है: ${label}…` : `सहेजें — ${label}`}
      </button>
      {saveStates[key] && <span className="save-step-status" role="status">{saveStates[key]}</span>}
      <span className="save-step-hint">PUT · {formId || "फॉर्म आईडी आवश्यक"}</span>
    </div>
  );
  const pendingDocCount = DOC_FIELDS.filter(field => docFiles[field.key]).length + pendingDocKeys().length;
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
          onChange={event => {
            handleDocFileChange(field.key, event.target.files && event.target.files[0]);
            event.target.value = "";
          }}
        />
        <div className="doc-field-state">
          {markedForRemoval ? <span className="doc-pending">यह दस्तावेज सहेजते ही सर्वर से हट जाएगा।</span> : null}
          {!markedForRemoval && pending ? <span className="doc-pending">नई फाइल चुनी गई: {pending.name}</span> : null}
          {!markedForRemoval && !pending && savedUrl ? <span className="doc-saved">सर्वर पर सहेजी गई फाइल उपलब्ध है।</span> : null}
          {!markedForRemoval && !pending && !savedUrl ? <span className="hint">JPG / PNG / PDF (अधिकतम 5 MB)</span> : null}
        </div>
        <div className="doc-field-actions">
          {savedUrl ? <a className="btn gold" href={savedUrl} target="_blank" rel="noopener noreferrer">👁 फाइल देखें</a> : null}
          {pending || savedUrl || markedForRemoval ? (
            <button type="button" className="btn danger" onClick={() => clearDocField(field.key)} disabled={Boolean(savingStage)}>
              हटाएँ
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  const handleVoucherChange = (rowIndex, columnIndex, value) => {
    setVoucherRows(previous => previous.map((row, index) => index === rowIndex
      ? row.map((cell, cellIndex) => cellIndex === columnIndex ? value : cell)
      : row));
  };
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
          <div className="card noprint kiwi-page-tabs">
            <div className="tabs">
              <button type="button" className={`tab ${activePage === "register" ? "active" : ""}`} onClick={() => setActivePage("register")}>कृषक पंजीकरण</button>
              <button type="button" className={`tab ${activePage === "filling" ? "active" : ""}`} onClick={() => { setActivePage("filling"); if (!formId) setApiMessage("सहेजने के लिए पहले पंजीकरण करें या कोई फॉर्म खोलें।"); }}>प्रपत्र भरना {formId ? `· ${formId}` : ""}</button>
            </div>
            {activePage === "filling" && <div className="note"><b>चयनित फॉर्म:</b> {formId || "फॉर्म आईडी उपलब्ध नहीं"} · सभी चरण Kiwi किसान API पर सहेजें।</div>}
          </div>
          {apiMessage && <div className={`api-message ${apiMessage.includes("विफल") || apiMessage.includes("नहीं") ? "error" : "success"}`} role="status">{apiMessage}</div>}
          {activePage === "register" ? (
            <section className="card noprint registration-screen">
              <h2>कीवी कृषक पंजीकरण</h2>
              <p className="card-intro">पहले किसान का पंजीकरण करें। सर्वर से मिली फॉर्म आईडी पर आवेदन के बाकी चरण सहेजें।</p>
              <form className="grid" onSubmit={registerFarmer}>
                <div className="field"><label htmlFor="kiwi-reg-name">कृषक का नाम<span className="req">*</span></label><input id="kiwi-reg-name" value={registration.name} onChange={event => setRegistration({ ...registration, name: event.target.value })} required /></div>
                <div className="field"><label htmlFor="kiwi-reg-mobile">मोबाइल नंबर<span className="req">*</span></label><input id="kiwi-reg-mobile" inputMode="numeric" maxLength={10} value={registration.mobile} onChange={event => setRegistration({ ...registration, mobile: event.target.value })} required /></div>
                <div className="field"><label htmlFor="kiwi-reg-center">केंद्र<span className="req">*</span></label><select id="kiwi-reg-center" value={registration.center} onChange={event => setRegistration({ ...registration, center: event.target.value })}>{CENTERS.map(center => <option key={center} value={center}>{center}</option>)}</select></div>
                <div className="field"><button className="btn" type="submit" disabled={Boolean(savingStage)}>{savingStage === "register" ? "पंजीकरण हो रहा है…" : "पंजीकरण करें"}</button></div>
              </form>
              <div className="registration-list-head"><div><h3>पंजीकृत कीवी कृषक</h3><span className="small">केंद्र: {registration.center}{registeredRows.length ? ` · ${registeredRows.length} फॉर्म` : ""}</span></div><button type="button" className="btn secondary" onClick={() => loadRegistrations(registration.center)} disabled={Boolean(savingStage) || registrationsLoading}>{registrationsLoading ? "लोड हो रहा है…" : "सूची ताज़ा करें"}</button></div>
              <div className="table-wrap"><table><thead><tr><th>क्र०</th><th>फॉर्म आईडी</th><th>कृषक का नाम</th><th>मोबाइल</th><th>केंद्र</th><th>भूमि (हे०)</th><th>स्थिति</th><th>क्रिया</th></tr></thead><tbody>
                {registeredRows.length ? registeredRows.map((record, index) => {
                  const personal = recordPersonal(record), id = recordFormId(record);
                  const land = personal.land_work_details || [];
                  const landArea = land.reduce((sum, row) => sum + num(Array.isArray(row) ? row[7] : row?.area), 0);
                  const docs = record?.document_details || {};
                  const filled = Boolean(personal.father_husband_name || personal.bank_account_number || land.length || docs.anudan_voucher?.length);
                  return <tr key={id || index} className={id === formId ? "sel" : ""}>
                    <td className="qty">{index + 1}</td><td><b>{id || "—"}</b></td><td>{personal.farmer_name || "—"}</td><td>{personal.mobile || "—"}</td><td>{personal.center_name || "—"}</td><td className="qty">{landArea ? landArea.toFixed(2) : "—"}</td><td><span className={`reg-status ${filled ? "ok" : "wait"}`}>{filled ? "भरा गया" : "पंजीकृत (रिक्त)"}</span></td>
                    <td><div className="registration-actions"><button type="button" className="btn secondary" onClick={() => openRegisteredForm(id)} disabled={Boolean(savingStage)}>फॉर्म खोलें / संपादित करें</button><button type="button" className="btn danger" onClick={() => deleteRegisteredForm(id)} disabled={Boolean(savingStage)}>हटाएँ</button></div></td>
                  </tr>;
                }) : <tr><td colSpan="8">{registrationsLoading ? "लोड हो रहा है…" : "इस केंद्र के लिए कोई पंजीकरण नहीं मिला।"}</td></tr>}
              </tbody></table></div>
            </section>
          ) : (
          <>
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
              <button type="button" className="btn secondary" onClick={startNewApplication}>🆕 नया आवेदन</button>
              <button type="button" className="btn gold" onClick={() => goToStep(6)}>💰 अनुदान पर जाएँ</button>
            </div>
          </div>

          <section className="card noprint api-save-panel">
            <div className="registration-list-head"><div><h3>सर्वर पर सहेजें</h3><span className="small">फॉर्म आईडी: {formId}</span></div>
              <button type="button" className="btn" onClick={saveAllStages} disabled={Boolean(savingStage)}>{savingStage === "all" ? "सभी चरण सहेजे जा रहे हैं…" : "सभी 7 चरण सहेजें"}</button>
            </div>
            <div className="save-stage-list">{saveSteps().map(step => <button key={step.key} type="button" className="btn secondary" onClick={() => saveOneStage(step.key)} disabled={Boolean(savingStage)}>{step.label}{saveStates[step.key] ? ` · ${saveStates[step.key]}` : " · सहेजें"}</button>)}</div>
          </section>

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
            {saveStepControl("personal", "आवेदक विवरण")}

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
                        <td data-label="नाम (खतौनी)">
                          <input placeholder="नाम" value={r.name} readOnly={i === 0} disabled={i !== 0 && !r.rel} onChange={e => handleLandChange(i, 'name', e.target.value)} />
                          {i !== 0 && <select className="land-gender-select" aria-label={`लिंग — भूमि पंक्ति ${i + 1}`} value={r.gender || "पुरुष"} disabled={!r.rel} onChange={e => handleLandChange(i, 'gender', e.target.value)}>
                            <option value="पुरुष">पुरुष</option><option value="महिला">महिला</option><option value="अन्य">अन्य</option>
                          </select>}
                        </td>
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
            {saveStepControl("land", "भूमि विवरण")}

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
                <div className="field full">{docFieldInput(DOC_FIELDS[3], "b-doc")}</div>
              </div>
            </div>
            {saveStepControl("bank", "बैंक विवरण")}

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
            {saveStepControl("work", "कार्य निष्पादन")}

            {/* Documents */}
            <div className={`inner-card ${anchorCls("wf-docs")}`} id={`${ID_PREFIX}wf-docs`}>
              <h3>आवश्यक दस्तावेज</h3>
              <p className="card-intro">प्रत्येक दस्तावेज की फाइल चुनें — चुनी गई फाइल का नाम यहाँ दिखेगा। "सहेजें — दस्तावेज" दबाते ही फाइल PUT (multipart) अपलोड होगी और सर्वर से लौटे URL पर "फाइल देखें" बटन मिलेगा।</p>
              <div className="grid">
                {DOC_FIELDS.map(field => docFieldInput(field, `d-${field.key}`))}
              </div>
              <div className="doc-summary">
                चयनित नई फाइलें: <b>{DOC_FIELDS.filter(field => docFiles[field.key]).length}</b> · हटाने हेतु चिन्हित: <b>{pendingDocKeys().length}</b> · सर्वर पर सहेजी गई: <b>{DOC_FIELDS.filter(field => docUrls[field.key]).length} / {DOC_FIELDS.length}</b>
                {pendingDocCount ? <span className="doc-summary-warn"> — सहेजें बटन दबाने के बाद ही सर्वर पर अपलोड/हटाने की क्रिया होगी।</span> : null}
              </div>
            </div>
            {saveStepControl("documents", "दस्तावेज")}

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
            {saveStepControl("declarations", "घोषणाएँ")}

            <div className="inner-card">
              <h3>अनुदान बिल / वाउचर</h3>
              <p className="card-intro">प्रत्येक वाउचर की जानकारी इसी क्रम में Kiwi API पर सहेजी जाएगी।</p>
              <div className="table-wrap"><table className="voucher-table"><thead><tr><th>चरण</th><th>कार्य / Component</th><th>बिल संख्या</th><th>राशि</th><th>भुगतान किसे</th><th>फर्म / नाम</th><th>क्रिया</th></tr></thead><tbody>
                {voucherRows.map((row, rowIndex) => <tr key={`voucher-${rowIndex}`}>
                  {row.map((value, columnIndex) => <td key={`cell-${columnIndex}`}><input aria-label={["चरण", "कार्य / Component", "बिल संख्या", "राशि", "भुगतान किसे", "फर्म / नाम"][columnIndex]} value={value} onChange={event => handleVoucherChange(rowIndex, columnIndex, event.target.value)} /></td>)}
                  <td><button type="button" className="btn danger" onClick={() => setVoucherRows(previous => previous.length > 1 ? previous.filter((_, index) => index !== rowIndex) : [["", "", "", "", "", ""]])}>हटाएँ</button></td>
                </tr>)}
              </tbody></table></div>
              <button type="button" className="btn secondary" onClick={() => setVoucherRows(previous => [...previous, ["", "", "", "", "", ""]])}>＋ वाउचर जोड़ें</button>
            </div>
            {saveStepControl("vouchers", "अनुदान व्यय")}

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
          {htmlOutputs.app && <section id="applicationPrint" className="card hidden print-doc" dangerouslySetInnerHTML={{ __html: htmlOutputs.app }} />}
          {htmlOutputs.report && <section id="report" className="card hidden print-doc" dangerouslySetInnerHTML={{ __html: htmlOutputs.report }} />}
          {htmlOutputs.aff && <section id="affidavitPrint" className="card hidden print-doc" dangerouslySetInnerHTML={{ __html: htmlOutputs.aff }} />}
          {htmlOutputs.consent && <section id="consentPrint" className="card hidden print-doc" dangerouslySetInnerHTML={{ __html: htmlOutputs.consent }} />}
          {htmlOutputs.anudan && <section id="anudanPrint" className="card hidden print-doc" dangerouslySetInnerHTML={{ __html: htmlOutputs.anudan }} />}
          </>
          )}

        </main>

        <div className="footer noprint">Kiwi Farmer Application &amp; Project Standard System</div>
      </div>

      {activePage === "filling" && <>
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
            <button type="button" className="side-action" onClick={startNewApplication}>🆕 नया आवेदन शुरू करें</button>
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
      </>}
    </div>
  );
};

export default KiwiFruits;