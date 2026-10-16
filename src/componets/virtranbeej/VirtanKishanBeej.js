import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useCenter } from "../all_login/CenterContext";
import "../KishanBeej/KishanBeej.css";

const API = {
  avantan: "https://mahadevaaya.com/govbillingsystem/backend/api/kishan-beej-avantan/",
  vitran: "https://mahadevaaya.com/govbillingsystem/backend/api/kishan-beej-vitaran/",
};

const tabs = [
  { key: "avantan", label: "आवंटन", title: "किसान बीज आवंटन" },
  { key: "vitran", label: "वितरण", title: "किसान बीज वितरण" },
];

const distributionFields = [
  ["distribution_date", "वितरण दिनांक", "date"],
  ["seed_variety_name", "बीज किस्म", "variety"],
  ["farmer_name", "कृषक का नाम", "text"],
  ["father_husband_name", "पिता / पति का नाम", "text"],
  ["village", "ग्राम", "text"],
  ["area_hectare", "क्षेत्रफल (हेक्टेयर)", "number"],
  ["distributed_seed_quantity_grams", "वितरित बीज (ग्राम)", "number"],
  ["field_preparation_nursery_management_farmer_share", "खेत तैयारी एवं पौधशाला कृषक अंश", "number"],
  ["seed_cost_subsidy_amount", "बीज अनुदान राशि", "number"],
  ["cow_dung_compost_farmer_share", "गोबर खाद कृषक अंश", "number"],
  ["planting_irrigation_staking_farmer_share", "रोपण / सिंचाई / स्टेकिंग कृषक अंश", "number"],
  ["total_project_cost", "कुल परियोजना लागत", "number"],
  ["total_subsidy_amount", "कुल अनुदान", "number"],
  ["total_farmer_share", "कुल कृषक अंश", "number"],
  ["allocation_limit_check", "आवंटन सीमा जाँच", "text"],
  ["scheme_name", "योजना", "scheme"],
  ["farmer_signature", "कृषक हस्ताक्षर", "text"],
];

const avantanColumns = [
  ["id", "ID"],
  ["center_name", "केन्द्र"],
  ["seed_variety_name", "बीज किस्म"],
  ["approved_quantity", "स्वीकृत मात्रा"],
  ["financial_year", "वित्तीय वर्ष"],
  ["scheme_name", "योजना"],
  ["standard_check", "मानक जाँच"],
];

const vitranColumns = [
  ["id", "ID"],
  ["distribution_date", "वितरण दिनांक"],
  ["seed_variety_name", "बीज किस्म"],
  ["farmer_name", "कृषक का नाम"],
  ["father_husband_name", "पिता / पति का नाम"],
  ["village", "ग्राम"],
  ["area_hectare", "क्षेत्रफल (हेक्टेयर)"],
  ["distributed_seed_quantity_grams", "वितरित बीज (ग्राम)"],
  ["field_preparation_nursery_management_farmer_share", "खेत तैयारी एवं पौधशाला कृषक अंश"],
  ["seed_cost_subsidy_amount", "बीज अनुदान"],
  ["cow_dung_compost_farmer_share", "गोबर खाद कृषक अंश"],
  ["planting_irrigation_staking_farmer_share", "रोपण / सिंचाई / स्टेकिंग कृषक अंश"],
  ["total_project_cost", "कुल परियोजना लागत"],
  ["total_subsidy_amount", "कुल अनुदान"],
  ["total_farmer_share", "कुल कृषक अंश"],
  ["allocation_limit_check", "आवंटन सीमा जाँच"],
  ["scheme_name", "योजना"],
  ["farmer_signature", "कृषक हस्ताक्षर"],
];

const today = () => new Date().toISOString().slice(0, 10);
const blankDistribution = () => Object.fromEntries(
  distributionFields.map(([key]) => [key, key === "distribution_date" ? today() : ""]),
);
const getToken = () => localStorage.getItem("access_token") || localStorage.getItem("token") || "";

async function request(url, options = {}) {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  let payload = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = raw;
  }
  if (!response.ok) {
    const message = payload?.detail || payload?.message || payload?.error || `Request failed (${response.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return payload;
}

function asList(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ["results", "data", "avantan", "vitran", "kishan_beej_avantan", "kishan_beej_vitaran"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function Field({ label, children }) {
  return <label className="kb-field"><span>{label}</span>{children}</label>;
}

function DataTable({ rows, columns, selectedIds, onToggle, onEdit }) {
  if (!rows.length) return <div className="kb-empty">कोई रिकॉर्ड उपलब्ध नहीं है।</div>;
  return (
    <div className="kb-table-scroll">
      <table className="kb-table kb-api-table">
        <thead><tr>
          <th><span>चुनें</span></th>
          {columns.map(([key, label]) => <th key={key}>{label}</th>)}
          <th>कार्रवाई</th>
        </tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id}>
          <td><input aria-label={`रिकॉर्ड ${row.id} चुनें`} type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => onToggle(row.id)} /></td>
          {columns.map(([key]) => <td key={key}>{row[key] === null || row[key] === undefined || row[key] === "" ? "—" : String(row[key])}</td>)}
          <td><button className="kb-small-button" type="button" onClick={() => onEdit(row)}>संपादित करें</button></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}

export default function VirtanKishanBeej() {
  const { centerData } = useCenter();
  const centerName = String(centerData?.centerName || "").trim();
  const [active, setActive] = useState("avantan");
  const [avantan, setAvantan] = useState([]);
  const [vitran, setVitran] = useState([]);
  const [form, setForm] = useState(blankDistribution);
  const [editingId, setEditingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadAvantan = useCallback(async () => {
    const query = new URLSearchParams({ center_name: centerName });
    const data = await request(`${API.avantan}?${query.toString()}`);
    setAvantan(asList(data).filter((row) => String(row.center_name || "").trim() === centerName));
  }, [centerName]);

  const loadVitran = useCallback(async () => {
    const query = new URLSearchParams({ center_name: centerName });
    const data = await request(`${API.vitran}?${query.toString()}`);
    setVitran(asList(data).filter((row) => String(row.center_name || "").trim() === centerName));
  }, [centerName]);

  const refreshActive = useCallback(async () => {
    if (!centerName) return;
    setLoading(true);
    setError("");
    try {
      if (active === "avantan") await loadAvantan();
      else await Promise.all([loadAvantan(), loadVitran()]);
    } catch (requestError) {
      setError(requestError.message || "डेटा लोड नहीं हो सका।");
    } finally {
      setLoading(false);
    }
  }, [active, centerName, loadAvantan, loadVitran]);

  useEffect(() => {
    setAvantan([]);
    setVitran([]);
    setSelectedIds([]);
    setEditingId(null);
    setForm(blankDistribution());
  }, [centerName]);

  useEffect(() => {
    refreshActive();
  }, [refreshActive]);

  useEffect(() => {
    setForm(blankDistribution());
    setEditingId(null);
    setSelectedIds([]);
    setNotice("");
    setError("");
    setSearch("");
  }, [active]);

  const currentRows = active === "avantan" ? avantan : vitran;
  const columns = active === "avantan" ? avantanColumns : vitranColumns;
  const filteredRows = useMemo(() => currentRows.filter((row) =>
    Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(search.toLowerCase().trim())),
  ), [currentRows, search]);
  const varietyOptions = [...new Set(avantan.map((row) => row.seed_variety_name).filter(Boolean))];

  function startEditing(row) {
    setEditingId(row.id);
    setForm({
      ...blankDistribution(),
      ...Object.fromEntries(distributionFields.map(([key]) => [key, row[key] ?? ""])),
    });
    setNotice("");
    setError("");
    document.querySelector(".kb-form-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveDistribution(event) {
    event.preventDefault();
    if (!centerName) {
      setError("लॉग-इन केन्द्र उपलब्ध नहीं है। कृपया केन्द्र खाते से लॉग-इन करें।");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        ...Object.fromEntries(distributionFields.map(([key]) => [key, form[key] ?? ""])),
        center_name: centerName,
      };
      await request(API.vitran, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      await loadVitran();
      setForm(blankDistribution());
      setEditingId(null);
      setSelectedIds([]);
      setNotice(editingId ? "रिकॉर्ड अपडेट हो गया।" : "रिकॉर्ड सफलतापूर्वक जोड़ा गया।");
    } catch (requestError) {
      setError(requestError.message || "रिकॉर्ड सेव नहीं हो सका।");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSelected() {
    if (!selectedIds.length) {
      setNotice("डिलीट करने के लिए पहले रिकॉर्ड चुनें।");
      return;
    }
    if (!window.confirm(`चयनित ${selectedIds.length} रिकॉर्ड डिलीट करें?`)) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const ownIds = selectedIds.filter((id) => vitran.some((row) => row.id === id));
      if (ownIds.length) {
        await request(`${API.vitran}?${new URLSearchParams({ center_name: centerName }).toString()}`, {
          method: "DELETE",
          body: JSON.stringify({ ids: ownIds }),
        });
      }
      setSelectedIds([]);
      await loadVitran();
      setNotice("चयनित रिकॉर्ड डिलीट हो गए।");
    } catch (requestError) {
      setError(requestError.message || "रिकॉर्ड डिलीट नहीं हो सके।");
    } finally {
      setSaving(false);
    }
  }

  return <div className="kb-app">
    <header className="kb-header">
      <div className="kb-brand"><div className="kb-brand-mark">बीज</div><div><span className="kb-eyebrow">उद्यान विभाग</span><h1>वितरण किसान बीज</h1><p>आवंटन · वितरण</p></div></div>
      <span className="kb-api-badge"><i /> API से जुड़ा</span>
    </header>
    <main className="kb-main">
      <section className="kb-intro">
        <div><span className="kb-kicker">केन्द्र डेटा प्रबंधन</span><h2>{centerName || "केन्द्र लॉग-इन आवश्यक"}</h2><p>आवंटन केवल देखने के लिए है। वितरण रिकॉर्ड इसी लॉग-इन केन्द्र के लिए जोड़े, संपादित और हटाए जा सकते हैं।</p></div>
        <div className="kb-intro-stats"><div><strong>{avantan.length}</strong><span>आवंटन</span></div><div><strong>{vitran.length}</strong><span>वितरण</span></div></div>
      </section>
      <nav className="kb-step-nav kb-api-tabs" role="tablist" aria-label="किसान बीज टैब">
        {tabs.map((tab, index) => <button key={tab.key} type="button" role="tab" aria-selected={active === tab.key} className={`kb-step ${active === tab.key ? "is-active" : ""}`} onClick={() => setActive(tab.key)}><span className="kb-step-number">0{index + 1}</span><span className="kb-step-text"><strong>{tab.label}</strong><small>{tab.title}</small></span></button>)}
      </nav>
      <section className="kb-stage-heading">
        <div className="kb-stage-number">{active === "avantan" ? "01" : "02"}</div>
        <div className="kb-stage-copy"><span className="kb-kicker">लाइव API डेटा</span><h2>{tabs.find((tab) => tab.key === active)?.title}</h2><p>{active === "avantan" ? "आपके लॉग-इन केन्द्र के स्वीकृत बीज आवंटन।" : "आपके केन्द्र के वितरण रिकॉर्ड प्रबंधित करें।"}</p></div>
        <button className="kb-secondary-button" type="button" onClick={refreshActive} disabled={loading || !centerName}>{loading ? "लोड हो रहा है…" : "↻ रीफ्रेश"}</button>
      </section>
      {!centerName && <div className="kb-alert kb-alert-error" role="alert">लॉग-इन केन्द्र की जानकारी नहीं मिली। कृपया केन्द्र खाते से लॉग-इन करें।</div>}
      {active === "vitran" && <section className="kb-card kb-form-card">
        <div className="kb-card-heading"><div><span className="kb-kicker">{editingId ? `रिकॉर्ड #${editingId}` : "नई प्रविष्टि"}</span><h3>{editingId ? "वितरण संपादित करें" : "वितरण रिकॉर्ड जोड़ें"}</h3></div>{editingId && <button className="kb-secondary-button" type="button" onClick={() => { setEditingId(null); setForm(blankDistribution()); }}>रद्द करें</button>}</div>
        <form onSubmit={saveDistribution}>
          <div className="kb-form-grid">
            <Field label="केन्द्र"><input value={centerName} disabled /></Field>
            {distributionFields.map(([key, label, type]) => <Field key={key} label={label}>
              {type === "variety" ? <select required value={form[key] ?? ""} onChange={(event) => {
                const selectedAllocation = avantan.find((row) => row.seed_variety_name === event.target.value);
                setForm((old) => ({ ...old, seed_variety_name: event.target.value, scheme_name: selectedAllocation?.scheme_name || "" }));
              }}>
                <option value="">आवंटित बीज किस्म चुनें</option>
                {form.seed_variety_name && !varietyOptions.includes(form.seed_variety_name) && <option value={form.seed_variety_name}>{form.seed_variety_name}</option>}
                {varietyOptions.map((variety) => <option key={variety} value={variety}>{variety}</option>)}
              </select> : type === "scheme" ? <input value={form[key] ?? ""} readOnly placeholder="बीज किस्म चुनें" /> : <input required type={type} step={type === "number" ? "any" : undefined} min={type === "number" ? "0" : undefined} value={form[key] ?? ""} onChange={(event) => setForm((old) => ({ ...old, [key]: event.target.value }))} placeholder={label} />}
            </Field>)}
          </div>
          <div className="kb-form-actions"><button className="kb-primary-button" type="submit" disabled={saving || !centerName || !varietyOptions.length}>{saving ? "सेव हो रहा है…" : editingId ? "अपडेट करें" : "रिकॉर्ड जोड़ें"}</button><span className="kb-session-hint">रिकॉर्ड केवल {centerName || "लॉग-इन केन्द्र"} के लिए सेव होगा।</span></div>
        </form>
      </section>}
      <section className="kb-card">
        <div className="kb-card-heading kb-card-heading-wrap"><div><span className="kb-kicker">API रिकॉर्ड</span><h3>{tabs.find((tab) => tab.key === active)?.label} सूची · {filteredRows.length} रिकॉर्ड</h3></div><Field label="खोजें"><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="रिकॉर्ड में खोजें…" /></Field></div>
        {active === "vitran" && <div className="kb-table-actions"><label className="kb-select-all"><input type="checkbox" checked={filteredRows.length > 0 && filteredRows.every((row) => selectedIds.includes(row.id))} onChange={(event) => setSelectedIds(event.target.checked ? [...new Set([...selectedIds, ...filteredRows.map((row) => row.id)])] : selectedIds.filter((id) => !filteredRows.some((row) => row.id === id)))} /> सभी चुनें</label><button className="kb-danger-button" type="button" disabled={saving || !selectedIds.length} onClick={deleteSelected}>चयनित डिलीट करें ({selectedIds.length})</button></div>}
        {loading ? <div className="kb-empty">API से डेटा लोड हो रहा है…</div> : active === "avantan" ? (
          avantan.length ? <div className="kb-table-scroll"><table className="kb-table kb-api-table"><thead><tr>{avantanColumns.map(([key, label]) => <th key={key}>{label}</th>)}</tr></thead><tbody>{filteredRows.map((row) => <tr key={row.id}>{avantanColumns.map(([key]) => <td key={key}>{row[key] === null || row[key] === undefined || row[key] === "" ? "—" : String(row[key])}</td>)}</tr>)}</tbody></table></div> : <div className="kb-empty">कोई रिकॉर्ड उपलब्ध नहीं है।</div>
        ) : <DataTable rows={filteredRows} columns={vitranColumns} selectedIds={selectedIds} onToggle={(id) => setSelectedIds((old) => old.includes(id) ? old.filter((value) => value !== id) : [...old, id])} onEdit={startEditing} />}
      </section>
      {error && <div className="kb-alert kb-alert-error" role="alert">{error}</div>}
      {notice && <div className="kb-alert" role="status">{notice}</div>}
      {active === "vitran" && !varietyOptions.length && centerName && <div className="kb-note"><span className="kb-note-mark">i</span><span>इस केन्द्र के लिए आवंटन उपलब्ध होने के बाद ही वितरण रिकॉर्ड जोड़ा जा सकेगा।</span></div>}
    </main>
    <footer className="kb-footer"><span>वितरण किसान बीज</span><span>लॉग-इन केन्द्र के आवंटन और वितरण रिकॉर्ड</span></footer>
  </div>;
}
