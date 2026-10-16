import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./KishanBeej.css";

const API = {
  manak: "https://mahadevaaya.com/govbillingsystem/backend/api/kishan-beej-manak/",
  avantan: "https://mahadevaaya.com/govbillingsystem/backend/api/kishan-beej-avantan/",
  vitran: "https://mahadevaaya.com/govbillingsystem/backend/api/kishan-beej-vitaran/",
  centres: "https://mahadevaaya.com/govbillingsystem/backend/api/centers-dho/",
};

const tabs = [
  { key: "manak", label: "मानक", title: "किसान बीज मानक" },
  { key: "avantan", label: "आवंटन", title: "किसान बीज आवंटन" },
  { key: "vitran", label: "वितरण", title: "किसान बीज वितरण" },
];

const fields = {
  manak: [
    ["seed_variety_name", "बीज किस्म का नाम", "text"],
    ["caste_category", "जाति श्रेणी", "text"],
    ["approved_seed_rate_per_kg", "स्वीकृत बीज दर प्रति किग्रा", "number"],
    ["seed_quantity_grams_per_hectare", "बीज मात्रा ग्राम प्रति हेक्टेयर", "number"],
    ["hectare_equivalent_preparation_quantity", "हेक्टेयर समतुल्य तैयारी मात्रा", "number"],
    ["field_preparation_rate", "खेत तैयारी दर", "number"],
    ["field_preparation_amount", "खेत तैयारी राशि", "number"],
    ["nursery_management_worker_quantity", "पौधशाला प्रबंधन श्रमिक मात्रा", "number"],
    ["nursery_management_rate", "पौधशाला प्रबंधन दर", "number"],
    ["nursery_management_amount", "पौधशाला प्रबंधन राशि", "number"],
    ["total_field_preparation_nursery_management_farmer_share", "खेत तैयारी एवं पौधशाला कृषक अंश", "number"],
    ["seed_cost_subsidy_amount_per_hectare", "बीज लागत अनुदान प्रति हेक्टेयर", "number"],
    ["cow_dung_compost_quantity_quintal_per_hectare", "गोबर खाद मात्रा क्विंटल प्रति हेक्टेयर", "number"],
    ["cow_dung_compost_rate", "गोबर खाद दर", "number"],
    ["cow_dung_compost_farmer_share_per_hectare", "गोबर खाद कृषक अंश प्रति हेक्टेयर", "number"],
    ["planting_irrigation_staking_quantity", "रोपण सिंचाई स्टेकिंग मात्रा", "number"],
    ["planting_irrigation_staking_rate", "रोपण सिंचाई स्टेकिंग दर", "number"],
    ["planting_irrigation_staking_farmer_share_per_hectare", "रोपण सिंचाई स्टेकिंग कृषक अंश प्रति हेक्टेयर", "number"],
    ["total_project_cost_per_hectare", "कुल परियोजना लागत प्रति हेक्टेयर", "number"],
    ["total_subsidy_amount_per_hectare", "कुल अनुदान प्रति हेक्टेयर", "number"],
    ["total_farmer_share_per_hectare", "कुल कृषक अंश प्रति हेक्टेयर", "number"],
    ["standard_check", "मानक जाँच", "text"],
    ["scheme_name", "योजना का नाम", "text"],
    ["center_name", "केन्द्र का नाम", "text"],
  ],
  avantan: [
    ["center_name", "केन्द्र का नाम", "center"],
    ["seed_variety_name", "बीज किस्म", "variety"],
    ["approved_quantity", "स्वीकृत मात्रा", "number"],
    ["financial_year", "वित्तीय वर्ष", "text"],
    ["scheme_name", "योजना का नाम", "text"],
    ["standard_check", "मानक जाँच", "text"],
  ],
};

const currentFinancialYear = () => {
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};
const blank = (key) => ({
  ...Object.fromEntries((fields[key] || []).map(([name]) => [name, ""])),
  ...(key === "avantan" ? { financial_year: currentFinancialYear() } : {}),
});
const getToken = () => {
  // Update this key if your login stores the access token under another name.
  return localStorage.getItem("access_token") || localStorage.getItem("token") || "";
};
const headers = (json = false) => {
  const token = getToken();
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...headers(Boolean(options.body)), ...(options.headers || {}) } });
  const raw = await response.text();
  let payload = null;
  try { payload = raw ? JSON.parse(raw) : null; } catch { payload = raw; }
  if (!response.ok) {
    const message = payload?.detail || payload?.message || payload?.error || `Request failed (${response.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return payload;
}

function asList(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function Field({ label, children }) {
  return <label className="kb-field"><span>{label}</span>{children}</label>;
}

function DataTable({ rows, columns, selectedIds, onToggle, showSelection = false }) {
  if (!rows.length) return <div className="kb-empty">कोई रिकॉर्ड उपलब्ध नहीं है।</div>;
  return (
    <div className="kb-table-scroll">
      <table className="kb-table kb-api-table">
        <thead><tr>
          {showSelection && <th><span>चुनें</span></th>}
          {columns.map(([key, label]) => <th key={key}>{label}</th>)}
          {showSelection && <th>कार्रवाई</th>}
        </tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id ?? JSON.stringify(row)}>
          {showSelection && <td><input aria-label={`रिकॉर्ड ${row.id} चुनें`} type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => onToggle(row.id)} /></td>}
          {columns.map(([key]) => <td key={key}>{row[key] === null || row[key] === undefined || row[key] === "" ? "—" : String(row[key])}</td>)}
          {showSelection && <td><button className="kb-small-button" type="button" onClick={() => onToggle(row.id, true)}>संपादित करें</button></td>}
        </tr>)}</tbody>
      </table>
    </div>
  );
}

export default function KishanBeej() {
  const [active, setActive] = useState("manak");
  const [manak, setManak] = useState([]);
  const [avantan, setAvantan] = useState([]);
  const [vitran, setVitran] = useState([]);
  const [centres, setCentres] = useState([]);
  const [form, setForm] = useState(blank("manak"));
  const [editingId, setEditingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadManak = useCallback(async () => {
    const data = await request(API.manak);
    setManak(asList(data, ["results", "data", "manak", "kishan_beej_manak"]));
  }, []);
  const loadAvantan = useCallback(async () => {
    const data = await request(API.avantan);
    setAvantan(asList(data, ["results", "data", "avantan", "kishan_beej_avantan"]));
  }, []);
  const loadVitran = useCallback(async () => {
    const data = await request(API.vitran);
    setVitran(asList(data, ["results", "data", "vitran", "kishan_beej_vitaran"]));
  }, []);
  const loadCentres = useCallback(async () => {
    const data = await request(API.centres);
    setCentres(asList(data, ["centers", "centres"]));
  }, []);

  const refreshActive = useCallback(async () => {
    setLoading(true); setError("");
    try {
      if (active === "manak") await loadManak();
      if (active === "avantan") await Promise.all([loadAvantan(), loadManak(), loadCentres()]);
      if (active === "vitran") await loadVitran();
    } catch (e) { setError(e.message || "डेटा लोड नहीं हो सका।"); }
    finally { setLoading(false); }
  }, [active, loadAvantan, loadCentres, loadManak, loadVitran]);

  useEffect(() => { refreshActive(); }, [refreshActive]);

  useEffect(() => {
    setForm(blank(active === "vitran" ? "avantan" : active));
    setEditingId(null); setSelectedIds([]); setNotice(""); setError(""); setSearch("");
  }, [active]);

  const currentRows = active === "manak" ? manak : active === "avantan" ? avantan : vitran;
  const columns = useMemo(() => {
    const keys = active === "manak" ? fields.manak.map(([key, label]) => [key, label])
      : active === "avantan" ? [["id", "ID"], ...fields.avantan.map(([key, label]) => [key, label])]
      : [["id", "ID"], ["distribution_date", "वितरण दिनांक"], ["center_name", "केन्द्र"], ["seed_variety_name", "बीज किस्म"], ["farmer_name", "कृषक का नाम"], ["father_husband_name", "पिता / पति का नाम"], ["village", "ग्राम"], ["area_hectare", "क्षेत्रफल (हेक्टेयर)"], ["distributed_seed_quantity_grams", "वितरित बीज (ग्राम)"], ["field_preparation_nursery_management_farmer_share", "खेत तैयारी एवं पौधशाला कृषक अंश"], ["seed_cost_subsidy_amount", "बीज अनुदान"], ["cow_dung_compost_farmer_share", "गोबर खाद कृषक अंश"], ["planting_irrigation_staking_farmer_share", "रोपण/सिंचाई/स्टेकिंग कृषक अंश"], ["total_project_cost", "कुल परियोजना लागत"], ["total_subsidy_amount", "कुल अनुदान"], ["total_farmer_share", "कुल कृषक अंश"], ["allocation_limit_check", "आवंटन सीमा जाँच"], ["scheme_name", "योजना"], ["farmer_signature", "कृषक हस्ताक्षर"], ["created_at", "बनाया गया"], ["updated_at", "अपडेट किया गया"]];
    return keys.filter(([key]) => currentRows.some((row) => Object.prototype.hasOwnProperty.call(row, key)));
  }, [active, currentRows]);

  const filteredRows = currentRows.filter((row) => Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(search.toLowerCase().trim())));
  const varietyOptions = [...new Set(manak.map((item) => item.seed_variety_name).filter(Boolean))];

  function toggleSelected(id, edit = false) {
    if (edit) {
      const row = currentRows.find((item) => item.id === id);
      if (!row) return;
      setEditingId(id);
      setForm({ ...blank(active), ...Object.fromEntries((fields[active] || []).map(([key]) => [key, row[key] ?? ""])) });
      setNotice(""); setError("");
      document.querySelector(".kb-form-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setSelectedIds((old) => old.includes(id) ? old.filter((value) => value !== id) : [...old, id]);
  }

  async function saveRecord(event) {
    event.preventDefault();
    if (active === "vitran") return;
    setSaving(true); setError(""); setNotice("");
    try {
      const payload = Object.fromEntries((fields[active] || []).map(([key]) => [key, form[key] ?? ""]));
      const url = API[active];
      await request(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      if (active === "manak") await loadManak();
      else await Promise.all([loadAvantan(), loadManak(), loadCentres()]);
      setForm(blank(active)); setEditingId(null); setSelectedIds([]);
      setNotice(editingId ? "रिकॉर्ड अपडेट हो गया।" : "रिकॉर्ड सफलतापूर्वक जोड़ा गया।");
    } catch (e) { setError(e.message || "रिकॉर्ड सेव नहीं हो सका।"); }
    finally { setSaving(false); }
  }

  async function deleteSelected() {
    if (!selectedIds.length) { setNotice("डिलीट करने के लिए पहले रिकॉर्ड चुनें।"); return; }
    if (!window.confirm(`चयनित ${selectedIds.length} रिकॉर्ड डिलीट करें?`)) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await request(API[active], { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selectedIds }) });
      setSelectedIds([]);
      if (active === "manak") { await loadManak(); await loadAvantan(); }
      else await loadAvantan();
      setNotice("चयनित रिकॉर्ड डिलीट हो गए।");
    } catch (e) { setError(e.message || "रिकॉर्ड डिलीट नहीं हो सके।"); }
    finally { setSaving(false); }
  }

  return <div className="kb-app">
    <header className="kb-header"><div className="kb-brand"><div className="kb-brand-mark">बीज</div><div><span className="kb-eyebrow">उद्यान विभाग</span><h1>किसान बीज प्रबंधन</h1><p>मानक · आवंटन · वितरण</p></div></div><span className="kb-api-badge"><i /> API से जुड़ा</span></header>
    <main className="kb-main">
      <section className="kb-intro"><div><span className="kb-kicker">डेटा प्रबंधन</span><h2>किसान बीज रिकॉर्ड</h2><p>प्रत्येक टैब अपने API से डेटा लोड करता है। मानक और आवंटन में जोड़ना, संपादित करना और हटाना उपलब्ध है। वितरण अभी दिए गए GET API से दिखाया जाता है।</p></div><div className="kb-intro-stats"><div><strong>{manak.length}</strong><span>मानक</span></div><div><strong>{avantan.length}</strong><span>आवंटन</span></div><div><strong>{vitran.length}</strong><span>वितरण</span></div></div></section>
      <nav className="kb-step-nav kb-api-tabs" role="tablist" aria-label="किसान बीज टैब">{tabs.map((tab, index) => <button key={tab.key} type="button" role="tab" aria-selected={active === tab.key} className={`kb-step ${active === tab.key ? "is-active" : ""}`} onClick={() => setActive(tab.key)}><span className="kb-step-number">0{index + 1}</span><span className="kb-step-text"><strong>{tab.label}</strong><small>{tab.title}</small></span></button>)}</nav>
      <section className="kb-stage-heading"><div className="kb-stage-number">{String(tabs.findIndex((tab) => tab.key === active) + 1).padStart(2, "0")}</div><div className="kb-stage-copy"><span className="kb-kicker">लाइव API डेटा</span><h2>{tabs.find((tab) => tab.key === active)?.title}</h2><p>{active === "manak" ? "बीज किस्म और प्रति हेक्टेयर लागत/अनुदान के मानक प्रबंधित करें।" : active === "avantan" ? "केन्द्र और बीज किस्म मानक API से चुनें और स्वीकृत मात्रा दर्ज करें।" : "वितरण API से प्राप्त रिकॉर्ड तालिका में दिखाए जाते हैं।"}</p></div><button className="kb-secondary-button" type="button" onClick={refreshActive} disabled={loading}>{loading ? "लोड हो रहा है…" : "↻ रीफ्रेश"}</button></section>
      {active !== "vitran" && <section className="kb-card kb-form-card"><div className="kb-card-heading"><div><span className="kb-kicker">{editingId ? `रिकॉर्ड #${editingId}` : "नई प्रविष्टि"}</span><h3>{editingId ? "रिकॉर्ड संपादित करें" : `${tabs.find((tab) => tab.key === active)?.label} जोड़ें`}</h3></div>{editingId && <button className="kb-secondary-button" type="button" onClick={() => { setEditingId(null); setForm(blank(active)); }}>रद्द करें</button>}</div>
        <form onSubmit={saveRecord}><div className="kb-form-grid">{(fields[active] || []).map(([key, label, type]) => <Field key={key} label={label}>{type === "center" ? <select required value={form[key] ?? ""} onChange={(e) => setForm((old) => ({ ...old, [key]: e.target.value }))}><option value="">केन्द्र चुनें</option>{centres.map((centre) => <option key={centre} value={centre}>{centre}</option>)}</select> : type === "variety" ? <select required value={form[key] ?? ""} onChange={(e) => {
          const variety = e.target.value;
          const selectedManak = manak.find((item) => item.seed_variety_name === variety);
          setForm((old) => ({
            ...old,
            [key]: variety,
            scheme_name: selectedManak?.scheme_name ?? "",
            standard_check: selectedManak?.standard_check ?? "",
            financial_year: currentFinancialYear(),
          }));
        }}><option value="">बीज किस्म चुनें</option>{varietyOptions.map((variety) => <option key={variety} value={variety}>{variety}</option>)}</select> : <input required={["seed_variety_name", "center_name", "approved_quantity"].includes(key)} type={type === "number" ? "number" : "text"} step={type === "number" ? "any" : undefined} value={form[key] ?? ""} disabled={active === "avantan" && ["scheme_name", "standard_check", "financial_year"].includes(key)} onChange={(e) => setForm((old) => ({ ...old, [key]: e.target.value }))} placeholder={label} />}</Field>)}</div><div className="kb-form-actions"><button className="kb-primary-button" type="submit" disabled={saving}>{saving ? "सेव हो रहा है…" : editingId ? "अपडेट करें" : "रिकॉर्ड जोड़ें"}</button><span className="kb-session-hint">डेटा API पर सेव होगा।</span></div></form>
      </section>}
      <section className="kb-card"><div className="kb-card-heading kb-card-heading-wrap"><div><span className="kb-kicker">API रिकॉर्ड</span><h3>{tabs.find((tab) => tab.key === active)?.label} सूची · {filteredRows.length} रिकॉर्ड</h3></div><Field label="खोजें" ><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="रिकॉर्ड में खोजें…" /></Field></div>
        {active !== "vitran" && <div className="kb-table-actions"><label className="kb-select-all"><input type="checkbox" checked={filteredRows.length > 0 && filteredRows.every((row) => selectedIds.includes(row.id))} onChange={(e) => setSelectedIds(e.target.checked ? [...new Set([...selectedIds, ...filteredRows.map((row) => row.id)])] : selectedIds.filter((id) => !filteredRows.some((row) => row.id === id)))} /> सभी चुनें</label><button className="kb-danger-button" type="button" disabled={saving || !selectedIds.length} onClick={deleteSelected}>चयनित डिलीट करें ({selectedIds.length})</button></div>}
        {loading ? <div className="kb-empty">API से डेटा लोड हो रहा है…</div> : <DataTable rows={filteredRows} columns={columns} showSelection={active !== "vitran"} selectedIds={selectedIds} onToggle={toggleSelected} />}
      </section>
      {error && <div className="kb-alert kb-alert-error" role="alert">{error}</div>}
      {notice && <div className="kb-alert" role="status">{notice}</div>}
      {active === "vitran" && <div className="kb-note"><span className="kb-note-mark">i</span><span>वितरण API के लिए अभी GET सूची जोड़ी गई है। POST, PUT और DELETE के लिए API contract मिलने पर जोड़े जा सकते हैं।</span></div>}
    </main>
    <footer className="kb-footer"><span>किसान बीज प्रबंधन</span><span>मानक, आवंटन और वितरण के लिए अलग API</span></footer>
  </div>;
}
