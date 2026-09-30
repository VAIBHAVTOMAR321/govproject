import React, { useEffect, useLayoutEffect, useState } from "react";
import "../kishanavedan/DragfruitsAndKiwi.css";

const ID_PREFIX = "dragon-";

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
  { id: "work", label: "⚙ कार्य" },
  { id: "view", label: "👁 देखें" },
  { id: "print", label: "🖨 प्रिंट" },
  { id: "anudan", label: "💰 अनुदान" },
  { id: "demo", label: "🧪 Demo" },
  { id: "steps", label: "🧭 चरण" },
];

const CENTERS = [
  "कोटद्वार", "किनगोड़िखाल", "चौखाल", "धुमाकोट", "बीरोंखाल", "हल्दूखाल", "किल्वोंखाल",
  "चेलूसैंण", "जयहरीखाल", "जेठागांव", "देवियोंखाल", "सिलोगी", "सिसल्ड़ी", "पौखाल",
  "सतपुली", "संगलाकोटी", "देवराजखाल", "पोखड़ा", "वेदीखाल", "विथ्याणी", "गंगाभोगपुर",
  "दिउली", "दुगड्डा", "सेंधीखाल",
];

const RELATIONS = ["सहखातेदार", "भाई", "पुत्र", "पिता", "पत्नी", "अन्य"];

const yesNo = (label, id, required) => (
  <div className="field" key={id}>
    <label htmlFor={id}>
      {label}
      {required && <span className="req">*</span>}
    </label>
    <select id={id} defaultValue="">
      <option value="">-- चुनें --</option>
      <option value="हाँ">हाँ</option>
      <option value="नहीं">नहीं</option>
    </select>
  </div>
);

const DragfruitsAndKiwi = () => {
  const [activeSideTab, setActiveSideTab] = useState("view");
  const [workflowStep, setWorkflowStep] = useState(0);
  const [sideOpen, setSideOpen] = useState(false);
  const [flashAnchor, setFlashAnchor] = useState(null);
  const [headerH, setHeaderH] = useState(0);
  const [footerH, setFooterH] = useState(0);

  // The app shell renders a fixed top navbar (.Dash-header) and a fixed footer
  // (.copyright-footer). Measure both so this page can pad itself clear of them
  // instead of relying on a hard-coded offset.
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
    <div
      className="drag-fruits-root"
      style={{ "--app-header-h": `${headerH}px`, "--app-footer-h": `${footerH}px` }}
    >
      {/* Backdrop for the mobile/tablet drawer */}
      <button
        type="button"
        aria-label="पैनल बंद करें"
        className={`side-backdrop ${sideOpen ? "open" : ""}`}
        onClick={() => setSideOpen(false)}
      />

      {/* Main content column */}
      <div className="drag-content">
        {/* Header */}
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
              <span>🟢 स्वचालित मानक</span>
              <span>🟡 चरणबद्ध अनुदान</span>
              <span>🔵 प्रिंट-रेडी</span>
            </div>
          </div>
        </header>

        <main className="wrap">
          {/* Tabs Card */}
          <div className="card noprint">
            <div className="tabs">
              <button type="button" className="tab active">🐉 ड्रैगन फ्रूट</button>
            </div>
            <div className="note">
              <b>महत्वपूर्ण:</b> किसान के अंतिम मानक पत्र में प्रति इकाई Rate नहीं दिखाया जाएगा।
              Master Standard के आधार पर अंदर से गणना होगी और किसान को Component-wise कुल लागत
              दिखाई जाएगी।
            </div>
          </div>

          {/* Workflow Card */}
          <div className="workflow-card noprint">
            <div className="workflow-head">
              <div>
                <div className="workflow-title">🧭 आवेदन से अनुदान तक — Step-by-Step</div>
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
              <span style={{ width: `${((workflowStep + 1) / APP_STEPS.length) * 100}%` }} />
            </div>
            <div className="workflow-steps">
              {APP_STEPS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className={`workflow-step ${i === workflowStep ? "active" : ""} ${
                    i < workflowStep ? "done" : ""
                  }`}
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
                onClick={() => goToStep(Math.min(APP_STEPS.length - 1, workflowStep + 1))}
              >
                {workflowStep === APP_STEPS.length - 1 ? "✓ अंतिम समीक्षा" : "अगला चरण →"}
              </button>
              <button type="button" className="btn secondary">🆕 नया आवेदन</button>
              <button type="button" className="btn gold">💰 अनुदान पर जाएँ</button>
            </div>
          </div>

          {/* Application Form Section */}
          <section
            className={`card noprint ${anchorCls("wf-basic")}`}
            id={`${ID_PREFIX}wf-basic`}
          >
            <h2>
              <span className="idx">1</span> कृषक का आवेदन
            </h2>
            <p className="card-intro">
              किसान अपने वास्तविक प्रस्तावित क्षेत्रफल के अनुसार आवेदन भरे। इसी क्षेत्रफल से नीचे
              पूरा व्यक्तिगत परियोजना मानक स्वतः बनेगा।
            </p>

            <div className="grid">
              <div className="field">
                <label htmlFor="f-name">कृषक का नाम<span className="req">*</span></label>
                <input id="f-name" placeholder="पूरा नाम" />
              </div>
              <div className="field">
                <label htmlFor="f-father">पिता / पति का नाम<span className="req">*</span></label>
                <input id="f-father" placeholder="पिता / पति का नाम" />
              </div>
              <div className="field">
                <label htmlFor="f-gender">लिंग</label>
                <select id="f-gender" defaultValue="पुरुष">
                  <option>पुरुष</option>
                  <option>महिला</option>
                  <option>अन्य</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-hortcard">उद्यान कार्ड संख्या</label>
                <input id="f-hortcard" inputMode="numeric" placeholder="वैकल्पिक" />
              </div>
              <div className="field">
                <label htmlFor="f-mobile">मोबाइल नम्बर<span className="req">*</span></label>
                <input id="f-mobile" inputMode="numeric" maxLength={10} placeholder="10 अंक" />
              </div>
              <div className="field">
                <label htmlFor="f-aadhaar">आधार संख्या</label>
                <input id="f-aadhaar" inputMode="numeric" maxLength={12} placeholder="XXXX XXXX 1234" />
              </div>
              <div className="field">
                <label htmlFor="f-district">जनपद<span className="req">*</span></label>
                <input id="f-district" placeholder="जनपद का नाम" />
              </div>
              <div className="field">
                <label htmlFor="f-block">विकासखण्ड<span className="req">*</span></label>
                <input id="f-block" placeholder="विकासखण्ड का नाम" />
              </div>
              <div className="field">
                <label htmlFor="f-center">उद्यान सचल दल केंद्र<span className="req">*</span></label>
                <select id="f-center" defaultValue="">
                  <option value="">-- केंद्र चुनें --</option>
                  {CENTERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-village">ग्राम<span className="req">*</span></label>
                <input id="f-village" placeholder="ग्राम का नाम" />
              </div>
              <div className="field">
                <label htmlFor="f-post">पोस्ट</label>
                <input id="f-post" placeholder="पोस्ट ऑफिस" />
              </div>
              <div className="field">
                <label htmlFor="f-beneficiary">लाभार्थी का प्रकार</label>
                <select id="f-beneficiary" defaultValue="individual">
                  <option value="individual">व्यक्तिगत कृषक</option>
                  <option value="group">समूह</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-appno">आवेदन संख्या</label>
                <input id="f-appno" readOnly placeholder="स्वतः जारी" />
                <span className="hint">Draft सुरक्षित करने पर स्वतः बनेगी।</span>
              </div>
              <div className="field full">
                <label htmlFor="f-remark">भूमि / परियोजना संबंधी टिप्पणी</label>
                <textarea id="f-remark" placeholder="यदि कोई विशेष बात हो तो यहाँ लिखें" />
              </div>
            </div>

            {/* Land Table */}
            <div
              className={`inner-card ${anchorCls("wf-land")}`}
              id={`${ID_PREFIX}wf-land`}
            >
              <h3>भूमि एवं कार्य का विवरण</h3>
              <p className="card-intro">
                <b>स्वयं</b> वाली पहली पंक्ति किसान की ऊपर भरी गई जानकारी से स्वतः भरेगी। यदि
                प्रस्तावित भूमि में सहखातेदार / अन्य खातेदार की भूमि शामिल है तो नीचे की पंक्ति में
                संबंध चुनकर उसका विवरण एवं क्षेत्रफल भरें।
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
                    <tr>
                      <td className="qty" data-label="क्रमांक">1</td>
                      <td data-label="भूमि किसकी">
                        <select disabled aria-label="स्वयं">
                          <option value="स्वयं">स्वयं</option>
                        </select>
                      </td>
                      <td data-label="नाम (खतौनी)">
                        <input placeholder="कृषक का नाम" readOnly />
                      </td>
                      <td data-label="पिता का नाम">
                        <input placeholder="पिता / पति का नाम" readOnly />
                      </td>
                      <td data-label="ग्राम"><input placeholder="ग्राम" readOnly /></td>
                      <td data-label="खाता सं०"><input placeholder="खाता सं०" /></td>
                      <td data-label="खसरा / खतौनी"><input placeholder="खसरा / खतौनी" /></td>
                      <td data-label="क्षेत्रफल (हे०)">
                        <input className="land-area" type="number" min="0" step="0.0001" placeholder="हे०" />
                      </td>
                    </tr>
                    {[2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        <td className="qty" data-label="क्रमांक">{i}</td>
                        <td data-label="संबंध">
                          <select defaultValue="">
                            <option value="">— चयन करें —</option>
                            {RELATIONS.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                        <td data-label="नाम (खतौनी)">
                          <input placeholder="नाम" disabled />
                          <select disabled title="लिंग" aria-label="लिंग" className="land-gender-select">
                            <option value="पुरुष">पुरुष</option>
                            <option value="महिला">महिला</option>
                            <option value="अन्य">अन्य</option>
                          </select>
                        </td>
                        <td data-label="पिता का नाम"><input placeholder="पिता का नाम" disabled /></td>
                        <td data-label="ग्राम"><input placeholder="ग्राम" disabled /></td>
                        <td data-label="खाता सं०"><input placeholder="खाता सं०" disabled /></td>
                        <td data-label="खसरा / खतौनी"><input placeholder="खसरा / खतौनी" disabled /></td>
                        <td data-label="क्षेत्रफल (हे०)">
                          <input className="land-area" type="number" min="0" step="0.0001" placeholder="हे०" disabled />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="summary" style={{ marginBottom: 0 }}>
                <div className="metric"><span>प्रस्तावित क्षेत्रफल (नाली)</span><b>0.00 नाली</b></div>
                <div className="metric"><span>कुल भूमि क्षेत्रफल</span><b>0.00 हे०</b></div>
                <div className="metric"><span>क्षेत्रफल (हेक्टेयर)</span><b>0.00 हे०</b></div>
                <div className="metric"><span>स्थिति</span><b>अपूर्ण</b></div>
              </div>
              <div className="err" />
            </div>

            {/* Bank Details */}
            <div
              className={`inner-card ${anchorCls("wf-bank")}`}
              id={`${ID_PREFIX}wf-bank`}
            >
              <h3>बैंक खाता विवरण</h3>
              <p className="card-intro">अनुदान / राजसहायता भुगतान हेतु किसान के बैंक खाते की जानकारी भरें।</p>
              <div className="grid">
                <div className="field">
                  <label htmlFor="b-holder">खाता धारक का नाम<span className="req">*</span></label>
                  <input id="b-holder" placeholder="बैंक पासबुक के अनुसार" />
                </div>
                <div className="field">
                  <label htmlFor="b-bank">बैंक का नाम<span className="req">*</span></label>
                  <input id="b-bank" placeholder="बैंक का नाम" />
                </div>
                <div className="field">
                  <label htmlFor="b-branch">शाखा का नाम<span className="req">*</span></label>
                  <input id="b-branch" placeholder="शाखा" />
                </div>
                <div className="field">
                  <label htmlFor="b-acct">बैंक खाता संख्या<span className="req">*</span></label>
                  <input id="b-acct" inputMode="numeric" placeholder="खाता संख्या" />
                </div>
                <div className="field">
                  <label htmlFor="b-ifsc">IFSC Code<span className="req">*</span></label>
                  <input id="b-ifsc" maxLength={11} className="ifsc-input" placeholder="ABCD0123456" />
                </div>
                <div className="field">
                  <label htmlFor="b-type">खाता प्रकार</label>
                  <select id="b-type" defaultValue="बचत खाता">
                    <option>बचत खाता</option>
                    <option>चालू खाता</option>
                    <option>अन्य</option>
                  </select>
                </div>
                <div className="field full">
                  <label htmlFor="b-doc">बैंक पासबुक / cancelled cheque</label>
                  <input id="b-doc" type="file" accept="image/*,.pdf" />
                  <span className="hint">यदि आवश्यक हो तो JPG / PNG / PDF (अधिकतम 5 MB)।</span>
                </div>
              </div>
            </div>

            {/* Work Execution */}
            <div className="inner-card">
              <h3>कार्य निष्पादन का विकल्प</h3>
              <div className="grid">
                <div className="field">
                  <label htmlFor="w-mode">कार्य किसके द्वारा कराया जाएगा<span className="req">*</span></label>
                  <select id="w-mode" defaultValue="firm">
                    <option value="firm">विभागीय पंजीकृत / Empanelled Firm</option>
                    <option value="self">कृषक द्वारा स्वयं</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="w-firm">Firm का नाम</label>
                  <input id="w-firm" placeholder="यदि लागू हो" />
                </div>
                <div className="field">
                  <label htmlFor="w-reg">Firm Registration No.</label>
                  <input id="w-reg" placeholder="यदि लागू हो" />
                </div>
                <div className="field full">
                  <label htmlFor="w-remark">कार्य / भुगतान से संबंधित टिप्पणी</label>
                  <textarea id="w-remark" placeholder="विशेष निर्देश यदि कोई हों" />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div
              className={`inner-card ${anchorCls("wf-docs")}`}
              id={`${ID_PREFIX}wf-docs`}
            >
              <h3>आवश्यक दस्तावेज</h3>
              <p className="card-intro">प्रत्येक दस्तावेज का प्रारूप चुनें — फाइल नाम यहाँ दिखाई देगी।</p>
              <div className="grid">
                <div className="field">
                  <label htmlFor="d-land">भूमि अभिलेख / खतौनी</label>
                  <input id="d-land" type="file" accept="image/*,.pdf" />
                </div>
                <div className="field">
                  <label htmlFor="d-id">आधार / पहचान</label>
                  <input id="d-id" type="file" accept="image/*,.pdf" />
                </div>
                <div className="field">
                  <label htmlFor="d-card">उद्यान कार्ड</label>
                  <input id="d-card" type="file" accept="image/*,.pdf" />
                </div>
                <div className="field">
                  <label htmlFor="d-cheque">बैंक पासबुक / cancelled cheque</label>
                  <input id="d-cheque" type="file" accept="image/*,.pdf" />
                </div>
                <div className="field">
                  <label htmlFor="d-map">भूमि नक्शा / अन्य अभिलेख</label>
                  <input id="d-map" type="file" accept="image/*,.pdf" />
                </div>
                <div className="field">
                  <label htmlFor="d-other">अन्य दस्तावेज</label>
                  <input id="d-other" type="file" accept="image/*,.pdf" />
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div
              className={`inner-card ${anchorCls("wf-standard")}`}
              id={`${ID_PREFIX}wf-standard`}
            >
              <h3>पात्रता एवं किसान घोषणा</h3>
              <p className="card-intro">आवेदन स्वीकृति हेतु निम्न सभी बिंदुओं का सही उत्तर दें।</p>
              <div className="grid">
                {yesNo("भूमि में जलभराव नहीं है", "dcl-1", true)}
                {yesNo("सिंचाई सुविधा उपलब्ध है", "dcl-2", true)}
                {yesNo("पूर्व में इसी योजना का लाभ लिया है?", "dcl-3", true)}
                {yesNo("भूमि / अभिलेख सही हैं", "dcl-4", true)}
                {yesNo("स्थलीय निरीक्षण हेतु सहमति", "dcl-5", true)}
                {yesNo("कृषक अंश वहन करने की सहमति", "dcl-6", true)}
              </div>
            </div>

            {/* Process */}
            <div
              className={`inner-card ${anchorCls("wf-affidavit")}`}
              id={`${ID_PREFIX}wf-affidavit`}
            >
              <h3>निरीक्षण एवं अनुदान प्रक्रिया</h3>
              <div className="stage-grid">
                <div className="stage">
                  <b>चरण 1 — Infrastructure Verification</b>
                  <span className="small">निर्धारित infrastructure पूर्ण होने पर स्थलीय / संयुक्त निरीक्षण एवं सत्यापन।</span>
                </div>
                <div className="stage">
                  <b>चरण 2 — 90% पौध जीवितता</b>
                  <span className="small">द्वितीय निरीक्षण में पौधों की कम से कम 90% जीवितता का सत्यापन।</span>
                </div>
                <div className="stage">
                  <b>चरण 3 — उत्पादन / फल सत्यापन</b>
                  <span className="small">तृतीय निरीक्षण में लागू योजना के अनुसार फल / गुणवत्ता / मात्रा का सत्यापन।</span>
                </div>
              </div>
              <p className="card-intro" style={{ marginTop: "9px", marginBottom: 0 }}>
                <b>पौध अनुदान:</b> लागू योजना / स्वीकृति के अनुसार चरणबद्ध भुगतान (70% + 20% + 10%)।
              </p>
            </div>

            <div className="err" />
            <div
              className={`btns ${anchorCls("wf-grant")}`}
              id={`${ID_PREFIX}wf-grant`}
            >
              <button type="button" className="btn">✓ आवेदन से किसान-विशिष्ट मानक बनाएं</button>
              <button type="button" className="btn secondary">💾 Draft सुरक्षित करें</button>
              <button type="button" className="btn secondary">↶ Draft लोड करें</button>
              <button type="button" className="btn gold">🖨️ आवेदन पत्र Print</button>
              <button type="button" className="btn gold">🖨️ पूर्ण परियोजना मानक Print</button>
              <button type="button" className="btn">📜 शपथ-पत्र तैयार करें</button>
              <button type="button" className="btn gold">🖨️ शपथ-पत्र Print</button>
              <button type="button" className="btn gold">🖨️ सहमति / NOC Print</button>
              <button type="button" className="btn secondary">📑 सभी शपथ-पत्र / सहमति Print</button>
              <button type="button" className="btn">💰 अनुदान देयक तैयार करें</button>
              <button type="button" className="btn gold">🖨️ अनुदान देयक Print</button>
            </div>

            <div
              className={`print-select ${anchorCls("wf-review")}`}
              id={`${ID_PREFIX}wf-review`}
            >
              <h3>🖨️ चयनित दस्तावेज एक साथ Print करें</h3>
              <div className="small">
                आवेदन पत्र में संलग्न दस्तावेज सूची + घोषणा तथा प्रभारी की आख्या स्वतः शामिल हैं।
              </div>
              <div className="print-options">
                <label className="print-option"><input type="checkbox" defaultChecked /> <span>आवेदन पत्र</span></label>
                <label className="print-option"><input type="checkbox" defaultChecked /> <span>पूर्ण परियोजना मानक</span></label>
                <label className="print-option"><input type="checkbox" defaultChecked /> <span>मुख्य शपथ-पत्र / स्व-घोषणा</span></label>
                <label className="print-option"><input type="checkbox" defaultChecked /> <span>सह-खातेदार सहमति / NOC</span></label>
                <label className="print-option"><input type="checkbox" /> <span>अनुदान देयक / भुगतान प्रपत्र</span></label>
              </div>
              <div className="aff-actions">
                <button type="button" className="btn">🖨️ चयनित सभी दस्तावेज Print करें</button>
                <button type="button" className="btn secondary">☑ सभी चुनें</button>
                <button type="button" className="btn secondary">☐ सभी हटाएँ</button>
              </div>
            </div>

            <div className="demo-tools">
              <b>🧪 Demo Testing — Affidavit</b>
              <div className="card-intro" style={{ margin: "5px 0 0" }}>
                नीचे से demo data लगाकर स्वयं की भूमि और स्वयं + सह-खातेदार दोनों affidavit तुरंत test करें।
              </div>
              <div className="demo-row">
                <button type="button" className="btn secondary">Dragon Demo — केवल स्वयं</button>
                <button type="button" className="btn secondary">Dragon Demo — सह-खातेदार</button>
              </div>
            </div>
          </section>
        </main>

        <div className="footer noprint">Dragon Fruit Farmer Application &amp; Project Standard System</div>
      </div>

      {/* Mobile / tablet drawer toggle */}
      <button
        type="button"
        className="side-toggle"
        aria-expanded={sideOpen}
        onClick={() => setSideOpen((v) => !v)}
      >
        ☰ दस्तावेज विकल्प
      </button>

      {/* Side Panel */}
      <aside className={`side-tabs ${sideOpen ? "open" : ""}`} aria-label="दस्तावेज विकल्प">
        <button type="button" className="side-close" aria-label="बंद करें" onClick={() => setSideOpen(false)}>
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

        <div className={`side-pane ${activeSideTab === "work" ? "active" : ""}`}>
          <h4>मुख्य कार्य</h4>
          <div className="side-group">
            <div className="side-group-title">आवेदन एवं मानक</div>
            <button type="button" className="side-action">🆕 नया आवेदन शुरू करें</button>
            <button type="button" className="side-action">✓ आवेदन से किसान-विशिष्ट मानक बनाएं</button>
            <button type="button" className="side-action">💾 Draft सुरक्षित करें</button>
            <button type="button" className="side-action">↶ Draft लोड करें</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">शपथ-पत्र</div>
            <button type="button" className="side-action">📜 शपथ-पत्र तैयार करें</button>
            <button type="button" className="side-action">🤝 सहमति / NOC तैयार करें</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">अनुदान</div>
            <button type="button" className="side-action">💰 अनुदान देयक तैयार करें</button>
          </div>
        </div>

        <div className={`side-pane ${activeSideTab === "view" ? "active" : ""}`}>
          <h4>दस्तावेज / फॉर्म देखें</h4>
          <div className="side-group">
            <div className="side-group-title">आवेदन एवं मानक</div>
            <button type="button" className="side-action">📄 आवेदन पत्र देखें</button>
            <button type="button" className="side-action">📋 पूर्ण परियोजना मानक देखें</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">शपथ-पत्र / सहमति</div>
            <button type="button" className="side-action">📜 शपथ-पत्र तैयार / देखें</button>
            <button type="button" className="side-action">🤝 सहमति / NOC देखें</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">अनुदान</div>
            <button type="button" className="side-action">💰 अनुदान देयक फॉर्म खोलें</button>
            <button type="button" className="side-action">🧾 तैयार अनुदान देयक देखें</button>
          </div>
        </div>

        <div className={`side-pane ${activeSideTab === "print" ? "active" : ""}`}>
          <h4>प्रिंट विकल्प</h4>
          <div className="side-group">
            <div className="side-group-title">अलग-अलग प्रिंट</div>
            <button type="button" className="side-action gold">🖨 आवेदन पत्र Print</button>
            <button type="button" className="side-action gold">🖨 पूर्ण परियोजना मानक Print</button>
            <button type="button" className="side-action gold">🖨 मुख्य शपथ-पत्र Print</button>
            <button type="button" className="side-action gold">🖨 सहमति / NOC Print</button>
            <button type="button" className="side-action gold">🖨 सभी शपथ-पत्र / NOC Print</button>
            <button type="button" className="side-action gold">🖨 अनुदान देयक Print</button>
          </div>
          <div className="side-group">
            <div className="side-group-title">चयनित दस्तावेज एक साथ</div>
            <div className="side-mini">☑ आवेदन पत्र चुनने पर संलग्न दस्तावेज सूची + घोषणा तथा प्रभारी की आख्या भी शामिल होंगी।</div>
            <label className="side-check"><input type="checkbox" defaultChecked /> आवेदन पत्र</label>
            <label className="side-check"><input type="checkbox" defaultChecked /> पूर्ण परियोजना मानक</label>
            <label className="side-check"><input type="checkbox" defaultChecked /> मुख्य शपथ-पत्र</label>
            <label className="side-check"><input type="checkbox" defaultChecked /> सह-खातेदार सहमति / NOC</label>
            <label className="side-check"><input type="checkbox" /> अनुदान देयक</label>
            <button type="button" className="side-action gold">🖨 चयनित सभी दस्तावेज Print</button>
            <button type="button" className="side-action">☑ सभी चुनें</button>
            <button type="button" className="side-action">☐ सभी हटाएँ</button>
          </div>
        </div>

        <div className={`side-pane ${activeSideTab === "anudan" ? "active" : ""}`}>
          <h4>अनुदान देयक</h4>
          <div className="side-group">
            <div className="side-group-title">अनुदान कार्य</div>
            <button type="button" className="side-action">🆕 नया अनुदान देयक शुरू करें</button>
            <button type="button" className="side-action">💰 अनुदान फॉर्म खोलें</button>
            <button type="button" className="side-action">🧪 अनुदान Demo भरें</button>
            <button type="button" className="side-action">＋ बिल / वाउचर जोड़ें</button>
            <button type="button" className="side-action">✓ अनुदान देयक बनाएं</button>
            <button type="button" className="side-action gold">🖨 अनुदान देयक Print</button>
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
              <div><b>चरण 1 — आधार / चरण</b><span>Inspection stage और project component चुनें</span></div>
            </button>
            <button type="button" className="side-step">
              <span className="num">2</span>
              <div><b>चरण 2 — Bill / Voucher</b><span>Voucher, राशि और भुगतान पाने वाला भरें</span></div>
            </button>
            <button type="button" className="side-step">
              <span className="num">3</span>
              <div><b>चरण 3 — गणना / समीक्षा</b><span>कुल देयक, राजसहायता और कृषक अंश देखें</span></div>
            </button>
            <button type="button" className="side-step">
              <span className="num">4</span>
              <div><b>चरण 4 — देयक / Print</b><span>अनुदान देयक तैयार और print करें</span></div>
            </button>
          </div>
        </div>

        <div className={`side-pane ${activeSideTab === "demo" ? "active" : ""}`}>
          <h4>Demo Testing</h4>
          <div className="side-group">
            <div className="side-group-title">Affidavit Demo</div>
            <div className="side-mini">Demo data लगाकर स्वयं की भूमि और स्वयं + सह-खातेदार दोनों affidavit तुरंत test करें।</div>
            <button type="button" className="side-action">🐉 Dragon — केवल स्वयं</button>
            <button type="button" className="side-action">🐉 Dragon — सह-खातेदार</button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default DragfruitsAndKiwi;
