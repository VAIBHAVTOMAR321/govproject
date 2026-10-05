import React, { useMemo, useState } from "react";
import "./KishanBeej.css";
import {
  allocationTotals,
  allocations,
  centres,
  distributionExamples,
  distributionHeaders,
  projectCostPerHectare,
  schemeName,
  standardHeaders,
  standards,
} from "./KishanBeejData";

const stages = [
  {
    title: "किस्म-वार मानक",
    shortTitle: "मानक",
    description:
      "प्रति हेक्टेयर बीज मात्रा, लागत के घटक, राजसहायता और कृषक अंश — Excel की मूल मानक तालिका।",
  },
  {
    title: "केन्द्र-वार कुल आवंटन",
    shortTitle: "आवंटन",
    description:
      "हर केन्द्र और बीज किस्म के लिए स्वीकृत ग्राम; दाईं ओर दिए योग Excel की किस्म-वार कुल मात्रा हैं।",
  },
  {
    title: "किसान-वार बीज वितरण",
    shortTitle: "वितरण",
    description:
      "केन्द्र, किस्म और क्षेत्रफल भरें। प्रति हेक्टेयर मानक से बीज, लागत, सहायता और आवंटन-सीमा की गणना करें।",
  },
];

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const amount = (value, digits = 2) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const money = (value) => `₹${amount(value)}`;
const asNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

function dateLabel(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).split("-");
  return year && month && day ? `${day}-${month}-${year}` : value;
}

function fromWorkbookRow(row, index) {
  return {
    number: asNumber(row[0]) || index + 1,
    date: row[1] || "",
    centre: row[2] || "",
    variety: row[3] || "",
    farmer: row[4] || "",
    father: row[5] || "",
    village: row[6] || "",
    area: asNumber(row[7]),
    seedGrams: asNumber(row[8]),
    preparationShare: asNumber(row[9]),
    seedSubsidy: asNumber(row[10]),
    compostShare: asNumber(row[11]),
    plantingShare: asNumber(row[12]),
    projectCost: asNumber(row[13]),
    totalSubsidy: asNumber(row[14]),
    farmerShare: asNumber(row[15]),
    allocationStatus: row[16] || "",
    scheme: row[17] || schemeName,
    signature: row[18] || "",
    isExample: true,
  };
}

function calculateDistribution(form, previousRecords) {
  const standard = standards.find((row) => row[1] === form.variety);
  const area = asNumber(form.area);
  if (!standard || !form.centre || area <= 0) return null;

  const seedGrams = asNumber(standard[4]) * area;
  const allocated = asNumber(
    allocations.find(([centre, variety]) => centre === form.centre && variety === form.variety)?.[2]
  );
  const alreadyDistributed = previousRecords
    .filter((record) => record.centre === form.centre && record.variety === form.variety)
    .reduce((sum, record) => sum + asNumber(record.seedGrams), 0);
  const projectedDistribution = alreadyDistributed + seedGrams;
  const allocationStatus =
    allocated <= 0
      ? "आवंटन उपलब्ध नहीं"
      : projectedDistribution <= allocated + 0.000001
        ? "सीमा के भीतर"
        : "सीमा से अधिक";

  return {
    standard,
    allocated,
    alreadyDistributed,
    projectedDistribution,
    remaining: allocated - projectedDistribution,
    allocationStatus,
    seedGrams,
    preparationShare: asNumber(standard[11]) * area,
    seedSubsidy: asNumber(standard[12]) * area,
    compostShare: asNumber(standard[15]) * area,
    plantingShare: asNumber(standard[18]) * area,
    projectCost: asNumber(standard[19]) * area,
    totalSubsidy: asNumber(standard[20]) * area,
    farmerShare: asNumber(standard[21]) * area,
  };
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`kb-field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value, detail, tone = "" }) {
  return (
    <div className={`kb-metric ${tone}`}>
      <span className="kb-metric-label">{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}

function StaticTable({ headers, rows, className = "", renderCell }) {
  return (
    <div className={`kb-table-scroll ${className}`}>
      <table className="kb-table">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={`${header}-${index}`} scope="col" title={header}>
                {header || "—"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((value, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>
                  {renderCell ? renderCell(value, cellIndex, rowIndex) : value ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function entryAsColumns(record, index) {
  return [
    record.number || index + 1,
    dateLabel(record.date),
    record.centre,
    record.variety,
    record.farmer,
    record.father,
    record.village,
    record.area,
    record.seedGrams,
    record.preparationShare,
    record.seedSubsidy,
    record.compostShare,
    record.plantingShare,
    record.projectCost,
    record.totalSubsidy,
    record.farmerShare,
    record.allocationStatus,
    record.scheme,
    record.signature,
  ];
}

export default function KishanBeej() {
  const [activeStage, setActiveStage] = useState(0);
  const [allocationSearch, setAllocationSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    date: today(),
    centre: "",
    variety: "",
    farmer: "",
    father: "",
    village: "",
    area: "",
    signature: "नहीं",
  });
  const [records, setRecords] = useState(() =>
    distributionExamples.map((row, index) => fromWorkbookRow(row, index))
  );

  const allocationByCentre = useMemo(() => {
    const map = new Map();
    allocations.forEach(([centre, variety, grams]) => {
      if (!map.has(centre)) map.set(centre, new Map());
      map.get(centre).set(variety, grams);
    });
    return map;
  }, []);

  const filteredCentres = useMemo(
    () => centres.filter((centre) => centre.includes(allocationSearch.trim())),
    [allocationSearch]
  );

  const preview = useMemo(
    () => calculateDistribution(form, records),
    [form, records]
  );

  const distributedCount = records.length;
  const distributedSeed = records.reduce((sum, record) => sum + asNumber(record.seedGrams), 0);
  const standardVarieties = standards.map((row) => row[1]);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setNotice("");
  }

  function addDistribution() {
    if (!form.date || !form.centre || !form.variety || !form.farmer.trim() || !form.area) {
      setNotice("प्रविष्टि जोड़ने के लिए दिनांक, केन्द्र, किस्म, कृषक का नाम और क्षेत्रफल भरें।");
      return;
    }
    if (!preview) {
      setNotice("कृपया शून्य से अधिक क्षेत्रफल भरें।");
      return;
    }

    const nextNumber = records.reduce((max, record) => Math.max(max, record.number || 0), 0) + 1;
    setRecords((current) => [
      ...current,
      {
        number: nextNumber,
        date: form.date,
        centre: form.centre,
        variety: form.variety,
        farmer: form.farmer.trim(),
        father: form.father.trim(),
        village: form.village.trim(),
        area: asNumber(form.area),
        seedGrams: preview.seedGrams,
        preparationShare: preview.preparationShare,
        seedSubsidy: preview.seedSubsidy,
        compostShare: preview.compostShare,
        plantingShare: preview.plantingShare,
        projectCost: preview.projectCost,
        totalSubsidy: preview.totalSubsidy,
        farmerShare: preview.farmerShare,
        allocationStatus: preview.allocationStatus,
        scheme: schemeName,
        signature: form.signature,
        isExample: false,
      },
    ]);
    setNotice(
      preview.allocationStatus === "सीमा से अधिक"
        ? "डेमो प्रविष्टि जुड़ी। ध्यान दें: इस केन्द्र-किस्म का आवंटन पार हो गया है।"
        : "डेमो प्रविष्टि इस सत्र में जुड़ गई; यह सर्वर पर सुरक्षित नहीं होती।"
    );
    setForm({
      date: today(),
      centre: "",
      variety: "",
      farmer: "",
      father: "",
      village: "",
      area: "",
      signature: "नहीं",
    });
  }

  function renderStandardCell(value, columnIndex) {
    if (value == null || value === "") return "—";
    if (columnIndex === 22) {
      return <span className="kb-status kb-status-ok">{value}</span>;
    }
    if (typeof value === "number") return amount(value, columnIndex === 0 ? 0 : 2);
    return value;
  }

  function renderDistributionCell(value, columnIndex) {
    if (value == null || value === "") return "—";
    if (columnIndex === 16) {
      const tone = value === "सीमा के भीतर" ? "kb-status-ok" : "kb-status-warning";
      return <span className={`kb-status ${tone}`}>{value}</span>;
    }
    if (columnIndex === 7 || columnIndex === 8) return amount(value, 2);
    if (columnIndex >= 9 && columnIndex <= 15) return money(value);
    return value;
  }

  const standardRows = standards;
  const allocationRows = filteredCentres.map((centre) => [
    centre,
    ...standardVarieties.map((variety) => allocationByCentre.get(centre)?.get(variety) ?? "—"),
  ]);
  const distributionRows = records.map(entryAsColumns);
  const currentStage = stages[activeStage];

  return (
    <div className="kb-app">
      <header className="kb-header">
        <div className="kb-brand">
          <div className="kb-brand-mark" aria-hidden="true">बीज</div>
          <div>
            <span className="kb-eyebrow">उद्यान विशेषज्ञ कार्यालय · कोटद्वार गढ़वाल</span>
            <h1>किसान बीज वितरण</h1>
            <p>{schemeName} · Excel आधारित अध्ययन प्रवाह</p>
          </div>
        </div>
        <span className="kb-demo-badge"><i /> स्थिर डेमो · सर्वर से जुड़ा नहीं</span>
      </header>

      <main className="kb-main">
        <section className="kb-intro">
          <div>
            <span className="kb-kicker">कार्यप्रवाह · 03 चरण</span>
            <h2>मानक से किसान वितरण तक</h2>
            <p>
              Excel शीट के क्रम और गणना को समझने के लिए तैयार किया गया स्थिर नमूना।
              डेमो में जोड़ी गई प्रविष्टियाँ केवल इसी सत्र में रहेंगी।
            </p>
          </div>
          <div className="kb-intro-stats">
            <div><strong>{standards.length}</strong><span>बीज किस्में</span></div>
            <div><strong>{centres.length}</strong><span>वितरण केन्द्र</span></div>
            <div><strong>{distributedCount}</strong><span>वितरण प्रविष्टियाँ</span></div>
          </div>
        </section>

        <nav className="kb-step-nav" aria-label="बीज वितरण कार्यप्रवाह" role="tablist">
          {stages.map((stage, index) => (
            <button
              key={stage.shortTitle}
              className={`kb-step ${activeStage === index ? "is-active" : ""} ${
                activeStage > index ? "is-done" : ""
              }`}
              type="button"
              role="tab"
              aria-selected={activeStage === index}
              onClick={() => {
                setActiveStage(index);
                setNotice("");
              }}
            >
              <span className="kb-step-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="kb-step-text">
                <strong>{stage.shortTitle}</strong>
                <small>{stage.title}</small>
              </span>
              {index < stages.length - 1 && <span className="kb-step-connector" aria-hidden="true" />}
            </button>
          ))}
        </nav>

        <section className="kb-stage-heading" role="tabpanel">
          <div className="kb-stage-number">0{activeStage + 1}</div>
          <div className="kb-stage-copy">
            <span className="kb-kicker">{schemeName}</span>
            <h2>{currentStage.title}</h2>
            <p>{currentStage.description}</p>
          </div>
          <div className="kb-stage-progress">
            <span>चरण {activeStage + 1} / {stages.length}</span>
            <div><i style={{ width: `${((activeStage + 1) / stages.length) * 100}%` }} /></div>
          </div>
        </section>

        {activeStage === 0 && (
          <section className="kb-panel" aria-label="किस्म-वार मानक">
            <div className="kb-metrics">
              <Metric label="मानक परियोजना लागत" value={money(projectCostPerHectare)} detail="रुपये प्रति हेक्टेयर" />
              <Metric label="अधिकतम राजसहायता" value={money(standards[0]?.[20])} detail="रुपये प्रति हेक्टेयर" tone="green" />
              <Metric label="बीज किस्में" value={standards.length} detail="Excel में दर्ज मानक" />
              <Metric label="मानक तालिका के स्तम्भ" value={standardHeaders.length} detail="क्रमांक से केन्द्र सूची तक" tone="gold" />
            </div>
            <div className="kb-card">
              <div className="kb-card-heading">
                <div>
                  <span className="kb-kicker">शीट 01 · मानक</span>
                  <h3>बीज किस्म-वार लागत एवं मात्रा</h3>
                </div>
                <span className="kb-count">{standards.length} किस्में</span>
              </div>
              <p className="kb-table-hint">
                मूल Excel के सभी 25 स्तम्भ शामिल हैं। पूरी तालिका देखने के लिए नीचे क्षैतिज स्क्रोल करें।
              </p>
              <StaticTable
                headers={standardHeaders}
                rows={standardRows}
                className="kb-wide-table"
                renderCell={renderStandardCell}
              />
              <div className="kb-note">
                <span className="kb-note-mark">i</span>
                <span>
                  लागत और मात्रा प्रति हेक्टेयर हैं। वितरण चरण में प्रत्येक मान को प्रविष्ट क्षेत्रफल से गुणा किया जाता है।
                  योजना शीर्षक: <strong>{schemeName}</strong>
                </span>
              </div>
            </div>
          </section>
        )}

        {activeStage === 1 && (
          <section className="kb-panel" aria-label="केन्द्र-वार कुल आवंटन">
            <div className="kb-metrics">
              <Metric label="वितरण केन्द्र" value={centres.length} detail="आवंटन शीट से" />
              <Metric label="बीज किस्में" value={standardVarieties.length} detail="शीट के कुल योग में" tone="green" />
              <Metric label="आवंटन प्रविष्टियाँ" value={allocations.length} detail="ग्राम में दर्ज" tone="gold" />
              <Metric label="अब तक का नमूना वितरण" value={`${amount(distributedSeed)} ग्राम`} detail={`${distributedCount} किसान प्रविष्टि`} />
            </div>
            <div className="kb-card">
              <div className="kb-card-heading kb-card-heading-wrap">
                <div>
                  <span className="kb-kicker">शीट 02 · केन्द्र-वार कुल आवंटन</span>
                  <h3>केन्द्र और किस्म के अनुसार स्वीकृत मात्रा</h3>
                </div>
                <Field label="केन्द्र खोजें" className="kb-search-field">
                  <input
                    type="search"
                    value={allocationSearch}
                    onChange={(event) => setAllocationSearch(event.target.value)}
                    placeholder="केन्द्र का नाम"
                  />
                </Field>
              </div>
              <p className="kb-table-hint">
                प्रत्येक सेल ग्राम में आवंटित मात्रा है। खाली सेल का अर्थ है कि उस केन्द्र-किस्म के लिए Excel में मात्रा दर्ज नहीं है।
              </p>
              <StaticTable
                headers={["उद्यान सचल दल केन्द्र", ...standardVarieties]}
                rows={allocationRows}
                className="kb-wide-table kb-allocation-table"
                renderCell={(value, columnIndex) =>
                  columnIndex > 0 && typeof value === "number" ? amount(value, 0) : value
                }
              />
              <div className="kb-allocation-totals">
                <div className="kb-card-heading">
                  <div>
                    <span className="kb-kicker">Excel के कुल योग</span>
                    <h3>किस्म-वार कुल आवंटित मात्रा</h3>
                  </div>
                  <span className="kb-unit-label">ग्राम</span>
                </div>
                <div className="kb-total-grid">
                  {allocationTotals.map(([variety, grams]) => (
                    <div className="kb-total-item" key={variety}>
                      <span>{variety}</span>
                      <strong>{amount(grams, 0)} <small>ग्राम</small></strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {activeStage === 2 && (
          <section className="kb-panel" aria-label="किसान-वार बीज वितरण">
            <div className="kb-metrics">
              <Metric label="वितरण प्रविष्टियाँ" value={distributedCount} detail="Excel का नमूना और सत्र की प्रविष्टियाँ" />
              <Metric label="कुल वितरित बीज" value={`${amount(distributedSeed)} ग्राम`} detail="क्षेत्रफल × बीज मात्रा" tone="green" />
              <Metric label="परियोजना लागत" value={money(preview?.projectCost || 0)} detail="वर्तमान प्रविष्टि का अनुमान" tone="gold" />
              <Metric label="कृषक अंश" value={money(preview?.farmerShare || 0)} detail="वर्तमान प्रविष्टि का अनुमान" />
            </div>

            <div className="kb-card">
              <div className="kb-card-heading">
                <div>
                  <span className="kb-kicker">शीट 03 · किसान-वार वितरण</span>
                  <h3>नई वितरण प्रविष्टि</h3>
                </div>
                <span className="kb-local-label">केवल स्थानीय डेमो</span>
              </div>

              <div className="kb-form-grid">
                <Field label="वितरण दिनांक" className="kb-col-2">
                  <input type="date" value={form.date} onChange={(event) => updateForm("date", event.target.value)} />
                </Field>
                <Field label="उद्यान सचल दल केन्द्र">
                  <select value={form.centre} onChange={(event) => updateForm("centre", event.target.value)}>
                    <option value="">केन्द्र चुनें</option>
                    {centres.map((centre) => <option key={centre} value={centre}>{centre}</option>)}
                  </select>
                </Field>
                <Field label="बीज किस्म">
                  <select value={form.variety} onChange={(event) => updateForm("variety", event.target.value)}>
                    <option value="">किस्म चुनें</option>
                    {standards.map((row) => <option key={row[1]} value={row[1]}>{row[1]}</option>)}
                  </select>
                </Field>
                <Field label="कृषक का नाम">
                  <input value={form.farmer} onChange={(event) => updateForm("farmer", event.target.value)} placeholder="पूरा नाम" />
                </Field>
                <Field label="पिता / पति का नाम">
                  <input value={form.father} onChange={(event) => updateForm("father", event.target.value)} placeholder="पूरा नाम" />
                </Field>
                <Field label="ग्राम">
                  <input value={form.village} onChange={(event) => updateForm("village", event.target.value)} placeholder="ग्राम का नाम" />
                </Field>
                <Field label="क्षेत्रफल (हेक्टेयर)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.area}
                    onChange={(event) => updateForm("area", event.target.value)}
                    placeholder="जैसे 0.40"
                  />
                </Field>
                <Field label="कृषक हस्ताक्षर">
                  <select value={form.signature} onChange={(event) => updateForm("signature", event.target.value)}>
                    <option value="नहीं">प्राप्त नहीं</option>
                    <option value="हाँ">प्राप्त</option>
                  </select>
                </Field>
              </div>

              {preview ? (
                <div className={`kb-calculation ${preview.allocationStatus === "सीमा के भीतर" ? "is-ok" : "is-warning"}`}>
                  <div className="kb-calculation-heading">
                    <div>
                      <span className="kb-kicker">Excel सूत्रों के अनुसार अनुमान</span>
                      <h4>{form.variety} · {amount(form.area, 2)} हेक्टेयर</h4>
                    </div>
                    <span className={`kb-status ${preview.allocationStatus === "सीमा के भीतर" ? "kb-status-ok" : "kb-status-warning"}`}>
                      {preview.allocationStatus}
                    </span>
                  </div>
                  <div className="kb-calc-grid">
                    <div><span>वितरित बीज</span><strong>{amount(preview.seedGrams)} ग्राम</strong></div>
                    <div><span>खेत तैयारी एवं पौधशाला · कृषक अंश</span><strong>{money(preview.preparationShare)}</strong></div>
                    <div><span>बीज कीमत · राजसहायता</span><strong>{money(preview.seedSubsidy)}</strong></div>
                    <div><span>गोबर एवं कम्पोस्ट · कृषक अंश</span><strong>{money(preview.compostShare)}</strong></div>
                    <div><span>रोपण, सिंचाई एवं स्टेकिंग · कृषक अंश</span><strong>{money(preview.plantingShare)}</strong></div>
                    <div className="kb-calc-total"><span>कुल परियोजना लागत</span><strong>{money(preview.projectCost)}</strong></div>
                    <div><span>कुल राजसहायता</span><strong>{money(preview.totalSubsidy)}</strong></div>
                    <div><span>कुल कृषक अंश</span><strong>{money(preview.farmerShare)}</strong></div>
                  </div>
                  <div className="kb-allocation-check">
                    <span>केन्द्र-किस्म आवंटन: <strong>{amount(preview.allocated, 0)} ग्राम</strong></span>
                    <span>पहले वितरित: <strong>{amount(preview.alreadyDistributed)} ग्राम</strong></span>
                    <span>इस प्रविष्टि के बाद शेष: <strong>{amount(preview.remaining)} ग्राम</strong></span>
                  </div>
                </div>
              ) : (
                <div className="kb-empty-preview">
                  <span>↗</span>
                  केन्द्र, किस्म और शून्य से अधिक क्षेत्रफल भरने पर Excel की लागत-गणना यहाँ दिखेगी।
                </div>
              )}

              <div className="kb-form-actions">
                <button className="kb-primary-button" type="button" onClick={addDistribution}>
                  <span aria-hidden="true">＋</span> डेमो रजिस्टर में जोड़ें
                </button>
                <span className="kb-session-hint">प्रविष्टि ब्राउज़र रीफ़्रेश करने पर हट जाएगी।</span>
              </div>
              {notice && <div className="kb-notice" role="status">{notice}</div>}
            </div>

            <div className="kb-card">
              <div className="kb-card-heading">
                <div>
                  <span className="kb-kicker">किसान-वार अभिलेख</span>
                  <h3>वितरण तालिका · {distributionRows.length} प्रविष्टि</h3>
                </div>
                <span className="kb-count">{distributionHeaders.length} स्तम्भ</span>
              </div>
              <p className="kb-table-hint">
                मूल Excel के सभी वितरण स्तम्भ शामिल हैं; गणना वाले स्तम्भ चुनी गई किस्म के मानक और क्षेत्रफल से बनते हैं।
              </p>
              <StaticTable
                headers={distributionHeaders}
                rows={distributionRows}
                className="kb-wide-table kb-distribution-table"
                renderCell={renderDistributionCell}
              />
            </div>
          </section>
        )}

        <div className="kb-stage-controls">
          <button
            type="button"
            className="kb-secondary-button"
            onClick={() => {
              setActiveStage((stage) => Math.max(0, stage - 1));
              setNotice("");
            }}
            disabled={activeStage === 0}
          >
            ← पिछला चरण
          </button>
          <span>कार्यप्रवाह: मानक <b>→</b> आवंटन <b>→</b> वितरण</span>
          <button
            type="button"
            className="kb-primary-button"
            onClick={() => {
              setActiveStage((stage) => Math.min(stages.length - 1, stage + 1));
              setNotice("");
            }}
            disabled={activeStage === stages.length - 1}
          >
            अगला चरण →
          </button>
        </div>
      </main>

      <footer className="kb-footer">
        <span>{schemeName}</span>
        <span>स्थिर अध्ययन डेमो · सर्वर पर कोई डेटा नहीं भेजा जाता</span>
      </footer>
    </div>
  );
}
