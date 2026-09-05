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
  const scheme = schemeId ? SCHEMES[schemeId] : null;
  const calc = useMemo(
    () =>
      scheme ? calculate(scheme, data) : { nali: 0, rows: [], cost: null },
    [scheme, data],
  );
  const appNo = useMemo(
    () =>
      scheme
        ? `${scheme.code}/${new Date().getFullYear()}/${String(Date.now()).slice(-6)}`
        : "",
    [schemeId],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem("udyan-aavedan:draft");
      if (raw) {
        const d = JSON.parse(raw);
        if (d.schemeId && SCHEMES[d.schemeId]) {
          setSchemeId(d.schemeId);
          setStep(d.step || 0);
          setData(d.data || initialData);
        }
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (schemeId) {
      try {
        localStorage.setItem(
          "udyan-aavedan:draft",
          JSON.stringify({ schemeId, step, data }),
        );
      } catch {}
    }
  }, [schemeId, step, data]);
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
  const print = () => {
    // Mark the document as printing before opening the browser print dialog.
    // This avoids a race where Chrome captures the DOM while the print-only
    // A4 sheet is still hidden by the normal-screen CSS.
    document.body.classList.add("kisan-printing");

    const cleanup = () => {
      document.body.classList.remove("kisan-printing");
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup);

    // Give React/browser layout one frame to apply the print state.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.print();
      });
    });
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
        <div className="actions">
          <div className="save-line">विवरण इसी डिवाइस पर सुरक्षित</div>
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
              <button className="btn" onClick={print}>
                प्रिंट / PDF
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
