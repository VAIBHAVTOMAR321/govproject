import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./KishanBeej.css";

const API = {
  manak:
    "https://mahadevaaya.com/govbillingsystem/backend/api/kishan-beej-manak/",
  schemes: "https://mahadevaaya.com/govbillingsystem/backend/api/beej-yojan/",
  avantan:
    "https://mahadevaaya.com/govbillingsystem/backend/api/kishan-beej-avantan/",
  vitran:
    "https://mahadevaaya.com/govbillingsystem/backend/api/kishan-beej-vitaran/",
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
    ["caste_category", "जाति श्रेणी (सामान्य जाति / अनुसूचित जाति)", "text"],
    [
      "approved_seed_rate_per_kg",
      "स्वीकृत बीज दर (रुपये प्रति किलोग्राम)",
      "number",
    ],
    [
      "seed_quantity_grams_per_hectare",
      "बीज की मात्रा (ग्राम प्रति हेक्टेयर)",
      "number",
    ],
    [
      "hectare_equivalent_preparation_quantity",
      "खेत तैयारी हेतु हैक्टेयर-तुल्य मात्रा",
      "number",
    ],
    ["field_preparation_rate", "खेत तैयारी हेतु दर (रुपये)", "number"],
    [
      "field_preparation_amount",
      "खेत तैयारी की राशि (रुपये प्रति हेक्टेयर)",
      "number",
    ],
    [
      "nursery_management_worker_quantity",
      "पौधशाला प्रबन्धन हेतु श्रमिक मात्रा",
      "number",
    ],
    ["nursery_management_rate", "पौधशाला प्रबन्धन हेतु दर (रुपये)", "number"],
    [
      "nursery_management_amount",
      "पौधशाला प्रबन्धन की राशि (रुपये प्रति हेक्टेयर)",
      "number",
    ],
    [
      "total_field_preparation_nursery_management_farmer_share",
      "खेत तैयारी एवं पौधशाला प्रबन्धन की कुल राशि — कृषक अंश (रुपये प्रति हेक्टेयर)",
      "number",
    ],
    [
      "seed_cost_subsidy_amount_per_hectare",
      "बीज की कीमत की राशि — राजसहायता (रुपये प्रति हेक्टेयर)",
      "number",
    ],
    [
      "cow_dung_compost_quantity_quintal_per_hectare",
      "गोबर एवं कम्पोस्ट खाद की मात्रा (कुन्तल प्रति हेक्टेयर)",
      "number",
    ],
    ["cow_dung_compost_rate", "गोबर एवं कम्पोस्ट खाद की दर (रुपये)", "number"],
    [
      "cow_dung_compost_farmer_share_per_hectare",
      "गोबर एवं कम्पोस्ट खाद की राशि — कृषक अंश (रुपये प्रति हेक्टेयर)",
      "number",
    ],
    [
      "planting_irrigation_staking_quantity",
      "पौध रोपण, सिंचाई एवं स्टेकिंग की मात्रा (श्रमिक अथवा अन्य)",
      "number",
    ],
    [
      "planting_irrigation_staking_rate",
      "पौध रोपण, सिंचाई एवं स्टेकिंग की दर (रुपये)",
      "number",
    ],
    [
      "planting_irrigation_staking_farmer_share_per_hectare",
      "पौध रोपण, सिंचाई एवं स्टेकिंग की राशि — कृषक अंश (रुपये प्रति हेक्टेयर)",
      "number",
    ],
    [
      "total_project_cost_per_hectare",
      "कुल परियोजना लागत (रुपये प्रति हेक्टेयर)",
      "number",
    ],
    [
      "total_subsidy_amount_per_hectare",
      "कुल राजसहायता की राशि (रुपये प्रति हेक्टेयर)",
      "number",
    ],
    [
      "total_farmer_share_per_hectare",
      "कुल कृषक अंश की राशि (रुपये प्रति हेक्टेयर)",
      "number",
    ],
    ["standard_check", "मानक जाँच", "text"],
    ["scheme_name", "योजना का नाम", "text"],
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

// Exact writable fields supported by /api/kishan-beej-manak/.
// center_name is intentionally excluded because it is no longer part of the Manak API.
const MANAK_API_FIELDS = [
  "seed_variety_name",
  "caste_category",
  "approved_seed_rate_per_kg",
  "seed_quantity_grams_per_hectare",
  "hectare_equivalent_preparation_quantity",
  "field_preparation_rate",
  "field_preparation_amount",
  "nursery_management_worker_quantity",
  "nursery_management_rate",
  "nursery_management_amount",
  "total_field_preparation_nursery_management_farmer_share",
  "seed_cost_subsidy_amount_per_hectare",
  "cow_dung_compost_quantity_quintal_per_hectare",
  "cow_dung_compost_rate",
  "cow_dung_compost_farmer_share_per_hectare",
  "planting_irrigation_staking_quantity",
  "planting_irrigation_staking_rate",
  "planting_irrigation_staking_farmer_share_per_hectare",
  "total_project_cost_per_hectare",
  "total_subsidy_amount_per_hectare",
  "total_farmer_share_per_hectare",
  "standard_check",
  "scheme_name",
];
const MANAK_NUMERIC_FIELDS = new Set(
  MANAK_API_FIELDS.filter(
    (key) =>
      ![
        "seed_variety_name",
        "caste_category",
        "standard_check",
        "scheme_name",
      ].includes(key),
  ),
);

function buildManakPayload(values) {
  const calculated = calculateManak(values);
  return Object.fromEntries(
    MANAK_API_FIELDS.map((key) => {
      const value = calculated[key];
      // The API examples use decimal strings for numeric values.
      const normalized = MANAK_NUMERIC_FIELDS.has(key)
        ? fixed2(numericValue(value))
        : String(value ?? "").trim();
      return [key, normalized];
    }),
  );
}

const currentFinancialYear = () => {
  const now = new Date();
  const startYear =
    now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
};
const blank = (key) => ({
  ...Object.fromEntries((fields[key] || []).map(([name]) => [name, ""])),
  ...(key === "avantan" ? { financial_year: currentFinancialYear() } : {}),
});

/* Manak formula chain: input fields are yellow; calculated fields are read-only. */
// Formula fields from the workbook are read-only; yellow cells remain editable.
const MANAK_CALCULATED_FIELDS = new Set([
  "seed_quantity_grams_per_hectare", // E = MAX_SUBSIDY / D * 1000
  "field_preparation_amount", // H = F * G
  "nursery_management_amount", // K = I * J
  "total_field_preparation_nursery_management_farmer_share", // L = H + K
  "seed_cost_subsidy_amount_per_hectare", // M = MAX_SUBSIDY
  "cow_dung_compost_farmer_share_per_hectare", // P = N * O
  "planting_irrigation_staking_farmer_share_per_hectare", // S = Q * R
  "total_project_cost_per_hectare", // T = L + M + P + S
  "total_subsidy_amount_per_hectare", // U = M
  "total_farmer_share_per_hectare", // V = L + P + S
]);
const MANAK_MAX_SUBSIDY = 30000;
const MANAK_SECTIONS = [
  {
    id: "identity",
    number: "01",
    title: "बीज और योजना की जानकारी",
    fields: [
      "seed_variety_name",
      "caste_category",
      "scheme_name",
      "standard_check",
    ],
  },
  {
    id: "seed",
    number: "02",
    title: "बीज दर और अनुदान",
    
    fields: ["approved_seed_rate_per_kg", "seed_quantity_grams_per_hectare"],
  },
  {
    id: "preparation",
    number: "03",
    title: "खेत तैयारी और पौधशाला",
    
    fields: [
      "hectare_equivalent_preparation_quantity",
      "field_preparation_rate",
      "field_preparation_amount",
      "nursery_management_worker_quantity",
      "nursery_management_rate",
      "nursery_management_amount",
      "total_field_preparation_nursery_management_farmer_share",
      "seed_cost_subsidy_amount_per_hectare",
    ],
  },
  {
    id: "compost",
    number: "04",
    title: "गोबर खाद",
    fields: [
      "cow_dung_compost_quantity_quintal_per_hectare",
      "cow_dung_compost_rate",
      "cow_dung_compost_farmer_share_per_hectare",
    ],
  },
  {
    id: "planting",
    number: "05",
    title: "रोपण, सिंचाई और स्टेकिंग",
    fields: [
      "planting_irrigation_staking_quantity",
      "planting_irrigation_staking_rate",
      "planting_irrigation_staking_farmer_share_per_hectare",
    ],
  },
  {
    id: "summary",
    number: "06",
    title: "कुल लागत का सारांश",
    fields: [
      "total_project_cost_per_hectare",
      "total_subsidy_amount_per_hectare",
      "total_farmer_share_per_hectare",
    ],
  },
];
const MANAK_FIELD_LABELS = Object.fromEntries(
  fields.manak.map(([key, label]) => [key, label]),
);

const numericValue = (value) => {
  const number = Number(value);
  return value === "" ||
    value === null ||
    value === undefined ||
    !Number.isFinite(number)
    ? 0
    : number;
};
const fixed2 = (value) =>
  (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2);

function calculateManak(values) {
  const result = { ...values };
  const has = (key) =>
    result[key] !== "" && result[key] !== null && result[key] !== undefined;
  const number = (key) => numericValue(result[key]);
  const hasSeedRate =
    has("approved_seed_rate_per_kg") && number("approved_seed_rate_per_kg") > 0;

  // Excel E = MAX_SUBSIDY / D * 1000. Show zero until a valid rate is entered.
  const seedQuantity = hasSeedRate
    ? (MANAK_MAX_SUBSIDY / number("approved_seed_rate_per_kg")) * 1000
    : 0;
  const fieldReady =
    has("hectare_equivalent_preparation_quantity") &&
    has("field_preparation_rate");
  const nurseryReady =
    has("nursery_management_worker_quantity") && has("nursery_management_rate");
  const compostReady =
    has("cow_dung_compost_quantity_quintal_per_hectare") &&
    has("cow_dung_compost_rate");
  const plantingReady =
    has("planting_irrigation_staking_quantity") &&
    has("planting_irrigation_staking_rate");

  // Excel H = F*G; K = I*J; L = H+K; M = MAX_SUBSIDY.
  const fieldAmount = fieldReady
    ? number("hectare_equivalent_preparation_quantity") *
      number("field_preparation_rate")
    : 0;
  const nurseryAmount = nurseryReady
    ? number("nursery_management_worker_quantity") *
      number("nursery_management_rate")
    : 0;
  const preparationShare = fieldAmount + nurseryAmount;
  // Excel column M is =MAX_SUBSIDY, independent of the approved seed rate in column D.
  const subsidy = MANAK_MAX_SUBSIDY;

  // Excel P = N*O; S = Q*R; T = L+M+P+S; U = M; V = L+P+S.
  const compostShare = compostReady
    ? number("cow_dung_compost_quantity_quintal_per_hectare") *
      number("cow_dung_compost_rate")
    : 0;
  const plantingShare = plantingReady
    ? number("planting_irrigation_staking_quantity") *
      number("planting_irrigation_staking_rate")
    : 0;
  result.seed_quantity_grams_per_hectare = fixed2(seedQuantity);
  result.field_preparation_amount = fixed2(fieldAmount);
  result.nursery_management_amount = fixed2(nurseryAmount);
  result.total_field_preparation_nursery_management_farmer_share =
    fixed2(preparationShare);
  result.seed_cost_subsidy_amount_per_hectare = fixed2(subsidy);
  result.cow_dung_compost_farmer_share_per_hectare = fixed2(compostShare);
  result.planting_irrigation_staking_farmer_share_per_hectare =
    fixed2(plantingShare);
  result.total_project_cost_per_hectare = fixed2(
    subsidy + preparationShare + compostShare + plantingShare,
  );
  result.total_subsidy_amount_per_hectare = fixed2(subsidy);
  result.total_farmer_share_per_hectare = fixed2(
    preparationShare + compostShare + plantingShare,
  );
  return result;
}
const getToken = () => {
  // Update this key if your login stores the access token under another name.
  return (
    localStorage.getItem("access_token") || localStorage.getItem("token") || ""
  );
};
const headers = (json = false) => {
  const token = getToken();
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...headers(Boolean(options.body)), ...(options.headers || {}) },
  });
  const raw = await response.text();
  let payload = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = raw;
  }
  if (!response.ok) {
    const message =
      payload?.detail ||
      payload?.message ||
      payload?.error ||
      payload?.errors ||
      payload ||
      `Request failed (${response.status})`;
    const readableMessage =
      typeof message === "string" ? message : JSON.stringify(message);
    throw new Error(
      `${response.status} ${response.statusText || "Request failed"}: ${readableMessage}`,
    );
  }
  return payload;
}

function asList(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys)
    if (Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`kb-field ${className}`.trim()}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function DataTable({
  rows,
  columns,
  selectedIds,
  onToggle,
  showSelection = false,
}) {
  if (!rows.length)
    return <div className="kb-empty">कोई रिकॉर्ड उपलब्ध नहीं है।</div>;
  return (
    <div className="kb-table-scroll">
      <table className="kb-table kb-api-table">
        <thead>
          <tr>
            {showSelection && (
              <th>
                <span>चुनें</span>
              </th>
            )}
            {columns.map(([key, label]) => (
              <th key={key}>{label}</th>
            ))}
            {showSelection && <th>कार्रवाई</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id ?? JSON.stringify(row)}>
              {showSelection && (
                <td>
                  <input
                    aria-label={`रिकॉर्ड ${row.id} चुनें`}
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={() => onToggle(row.id)}
                  />
                </td>
              )}
              {columns.map(([key]) => (
                <td key={key}>
                  {row[key] === null ||
                  row[key] === undefined ||
                  row[key] === ""
                    ? "—"
                    : String(row[key])}
                </td>
              ))}
              {showSelection && (
                <td>
                  <button
                    className="kb-small-button"
                    type="button"
                    onClick={() => onToggle(row.id, true)}
                  >
                    संपादित करें
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
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
  const [form, setForm] = useState(calculateManak(blank("manak")));
  const [editingId, setEditingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [schemes, setSchemes] = useState([]);
  const [schemeModal, setSchemeModal] = useState("");
  const [schemeName, setSchemeName] = useState("");
  const [schemeEditingId, setSchemeEditingId] = useState(null);
  const [schemeSaving, setSchemeSaving] = useState(false);
  const [schemeError, setSchemeError] = useState("");
  const [schemeNotice, setSchemeNotice] = useState("");

  const loadSchemes = useCallback(async () => {
    const data = await request(API.schemes);
    setSchemes(asList(data, ["results", "data", "schemes", "yojnas"]));
  }, []);

  const loadManak = useCallback(async () => {
    const data = await request(API.manak, { method: "GET" });
    // Keep the Manak UI aligned with the API schema; center_name is not a Manak field.
    setManak(
      asList(data, ["results", "data", "manak", "kishan_beej_manak"]).map(
        (row) => {
          const { center_name, ...withoutCenter } = row || {};
          return withoutCenter;
        },
      ),
    );
  }, []);
  const loadAvantan = useCallback(async () => {
    const data = await request(API.avantan);
    setAvantan(
      asList(data, ["results", "data", "avantan", "kishan_beej_avantan"]),
    );
  }, []);
  const loadVitran = useCallback(async () => {
    const data = await request(API.vitran);
    setVitran(
      asList(data, ["results", "data", "vitran", "kishan_beej_vitaran"]),
    );
  }, []);
  const loadCentres = useCallback(async () => {
    const data = await request(API.centres);
    setCentres(asList(data, ["centers", "centres"]));
  }, []);

  const refreshActive = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (active === "manak") await Promise.all([loadManak(), loadSchemes()]);
      if (active === "avantan")
        await Promise.all([loadAvantan(), loadManak(), loadCentres()]);
      if (active === "vitran") await loadVitran();
    } catch (e) {
      setError(e.message || "डेटा लोड नहीं हो सका।");
    } finally {
      setLoading(false);
    }
  }, [active, loadAvantan, loadCentres, loadManak, loadVitran, loadSchemes]);

  useEffect(() => {
    refreshActive();
  }, [refreshActive]);

  useEffect(() => {
    setForm(
      active === "manak"
        ? calculateManak(blank("manak"))
        : blank(active === "vitran" ? "avantan" : active),
    );
    setEditingId(null);
    setSelectedIds([]);
    setNotice("");
    setError("");
    setSearch("");
  }, [active]);

  const currentRows =
    active === "manak" ? manak : active === "avantan" ? avantan : vitran;
  const columns = useMemo(() => {
    const keys =
      active === "manak"
        ? fields.manak.map(([key, label]) => [key, label])
        : active === "avantan"
          ? [
              ["id", "ID"],
              ...fields.avantan.map(([key, label]) => [key, label]),
            ]
          : [
              ["id", "ID"],
              ["distribution_date", "वितरण दिनांक"],
              ["center_name", "केन्द्र"],
              ["seed_variety_name", "बीज किस्म"],
              ["farmer_name", "कृषक का नाम"],
              ["father_husband_name", "पिता / पति का नाम"],
              ["village", "ग्राम"],
              ["area_hectare", "क्षेत्रफल (हेक्टेयर)"],
              ["distributed_seed_quantity_grams", "वितरित बीज (ग्राम)"],
              [
                "field_preparation_nursery_management_farmer_share",
                "खेत तैयारी एवं पौधशाला कृषक अंश",
              ],
              ["seed_cost_subsidy_amount", "बीज अनुदान"],
              ["cow_dung_compost_farmer_share", "गोबर खाद कृषक अंश"],
              [
                "planting_irrigation_staking_farmer_share",
                "रोपण/सिंचाई/स्टेकिंग कृषक अंश",
              ],
              ["total_project_cost", "कुल परियोजना लागत"],
              ["total_subsidy_amount", "कुल अनुदान"],
              ["total_farmer_share", "कुल कृषक अंश"],
              ["allocation_limit_check", "आवंटन सीमा जाँच"],
              ["scheme_name", "योजना"],
              ["farmer_signature", "कृषक हस्ताक्षर"],
              ["created_at", "बनाया गया"],
              ["updated_at", "अपडेट किया गया"],
            ];
    return keys.filter(([key]) =>
      currentRows.some((row) => Object.prototype.hasOwnProperty.call(row, key)),
    );
  }, [active, currentRows]);

  const filteredRows = currentRows.filter((row) =>
    Object.values(row).some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(search.toLowerCase().trim()),
    ),
  );
  const varietyOptions = [
    ...new Set(manak.map((item) => item.seed_variety_name).filter(Boolean)),
  ];

  function toggleSelected(id, edit = false) {
    if (edit) {
      const row = currentRows.find((item) => item.id === id);
      if (!row) return;
      setEditingId(id);
      const rowForm = {
        ...blank(active),
        ...Object.fromEntries(
          (fields[active] || []).map(([key]) => [key, row[key] ?? ""]),
        ),
      };
      setForm(active === "manak" ? calculateManak(rowForm) : rowForm);
      setNotice("");
      setError("");
      document
        .querySelector(".kb-form-card")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setSelectedIds((old) =>
      old.includes(id) ? old.filter((value) => value !== id) : [...old, id],
    );
  }

  async function saveRecord(event) {
    event.preventDefault();
    if (active === "vitran") return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const formToSave = active === "manak" ? calculateManak(form) : form;
      // Manak uses its documented schema exactly: POST = fields only; PUT = id + fields.
      // Do not send center_name; the backend no longer supports that field.
      const payload =
        active === "manak"
          ? buildManakPayload(formToSave)
          : Object.fromEntries(
              (fields[active] || []).map(([key]) => [
                key,
                formToSave[key] ?? "",
              ]),
            );
      const url = API[active];
      const requestBody = editingId ? { id: editingId, ...payload } : payload;
      await request(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (active === "manak") await loadManak();
      else await Promise.all([loadAvantan(), loadManak(), loadCentres()]);
      setForm(
        active === "manak" ? calculateManak(blank("manak")) : blank(active),
      );
      setEditingId(null);
      setSelectedIds([]);
      setNotice(
        editingId ? "रिकॉर्ड अपडेट हो गया।" : "रिकॉर्ड सफलतापूर्वक जोड़ा गया।",
      );
    } catch (e) {
      setError(e.message || "रिकॉर्ड सेव नहीं हो सका।");
    } finally {
      setSaving(false);
    }
  }

  async function deleteSelected() {
    if (!selectedIds.length) {
      setNotice("डिलीट करने के लिए पहले रिकॉर्ड चुनें।");
      return;
    }
    if (!window.confirm(`चयनित ${selectedIds.length} रिकॉर्ड डिलीट करें?`))
      return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await request(API[active], {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ ids: selectedIds }),
      });
      setSelectedIds([]);
      if (active === "manak") {
        await loadManak();
        await loadAvantan();
      } else await loadAvantan();
      setNotice("चयनित रिकॉर्ड डिलीट हो गए।");
    } catch (e) {
      setError(e.message || "रिकॉर्ड डिलीट नहीं हो सके।");
    } finally {
      setSaving(false);
    }
  }

  async function saveScheme(event) {
    event.preventDefault();
    const name = schemeName.trim();
    if (!name) {
      setSchemeError("कृपया योजना का नाम भरें।");
      return;
    }
    setSchemeSaving(true);
    setSchemeError("");
    setSchemeNotice("");
    try {
      await request(API.schemes, {
        method: schemeEditingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(schemeEditingId ? { id: schemeEditingId, scheme_name: name } : { scheme_name: name }),
      });
      await loadSchemes();
      setSchemeName("");
      setSchemeEditingId(null);
      setSchemeModal("view");
      setSchemeNotice(schemeEditingId ? "योजना अपडेट हो गई।" : "योजना जोड़ दी गई।");
    } catch (e) {
      setSchemeError(e.message || "योजना सेव नहीं हो सकी।");
    } finally {
      setSchemeSaving(false);
    }
  }

  async function deleteScheme(id) {
    if (!window.confirm("क्या आप इस योजना को डिलीट करना चाहते हैं?")) return;
    setSchemeSaving(true);
    setSchemeError("");
    try {
      await request(API.schemes, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
      await loadSchemes();
      setSchemeNotice("योजना डिलीट हो गई।");
      if (String(form.scheme_name) === String(schemes.find((item) => item.id === id)?.scheme_name)) {
        setForm((old) => ({ ...old, scheme_name: "" }));
      }
    } catch (e) {
      setSchemeError(e.message || "योजना डिलीट नहीं हो सकी।");
    } finally {
      setSchemeSaving(false);
    }
  }

  const renderField = ([key, label, type]) => (
    <Field
      key={key}
      label={label}
      className={
        active === "manak"
          ? MANAK_CALCULATED_FIELDS.has(key)
            ? "kb-calculated-wrap"
            : "kb-user-input-field"
          : ""
      }
    >
      {active === "manak" && key === "scheme_name" ? (
        <select
          required
          value={form[key] ?? ""}
          onChange={(e) => setForm((old) => ({ ...old, [key]: e.target.value }))}
        >
          <option value="">योजना चुनें</option>
          {schemes.map((scheme) => (
            <option key={scheme.id} value={scheme.scheme_name}>{scheme.scheme_name}</option>
          ))}
        </select>
      ) : type === "center" ? (
        <select
          required
          value={form[key] ?? ""}
          onChange={(e) =>
            setForm((old) => ({ ...old, [key]: e.target.value }))
          }
        >
          <option value="">केन्द्र चुनें</option>
          {centres.map((centre) => (
            <option key={centre} value={centre}>
              {centre}
            </option>
          ))}
        </select>
      ) : type === "variety" ? (
        <select
          required
          value={form[key] ?? ""}
          onChange={(e) => {
            const variety = e.target.value;
            const selectedManak = manak.find(
              (item) => item.seed_variety_name === variety,
            );
            setForm((old) => ({
              ...old,
              [key]: variety,
              scheme_name: selectedManak?.scheme_name ?? "",
              standard_check: selectedManak?.standard_check ?? "",
              financial_year: currentFinancialYear(),
            }));
          }}
        >
          <option value="">बीज किस्म चुनें</option>
          {varietyOptions.map((variety) => (
            <option key={variety} value={variety}>
              {variety}
            </option>
          ))}
        </select>
      ) : (
        <input
          required={
            active === "manak"
              ? !MANAK_CALCULATED_FIELDS.has(key)
              : [
                  "seed_variety_name",
                  "center_name",
                  "approved_quantity",
                ].includes(key)
          }
          type={type === "number" ? "number" : "text"}
          step={type === "number" ? "any" : undefined}
          value={
            form[key] ??
            (active === "manak" && MANAK_CALCULATED_FIELDS.has(key)
              ? "0.00"
              : "")
          }
          disabled={
            (active === "avantan" &&
              ["scheme_name", "standard_check", "financial_year"].includes(
                key,
              )) ||
            (active === "manak" && MANAK_CALCULATED_FIELDS.has(key))
          }
          className={
            active === "manak" && MANAK_CALCULATED_FIELDS.has(key)
              ? "kb-calculated-field"
              : undefined
          }
          onChange={(e) =>
            setForm((old) => {
              const updated = { ...old, [key]: e.target.value };
              return active === "manak" ? calculateManak(updated) : updated;
            })
          }
          placeholder={label}
        />
      )}
      
      
    </Field>
  );

  return (
    <div className="kb-app">
      <header className="kb-header">
        <div className="kb-brand">
          <div className="kb-brand-mark">बीज</div>
          <div>
            <span className="kb-eyebrow">उद्यान विभाग</span>
            <h1>किसान बीज प्रबंधन</h1>
            <p>मानक · आवंटन · वितरण</p>
          </div>
        </div>
      </header>
      <main className="kb-main">
        <section className="kb-intro">
          <div>
            <span className="kb-kicker">डेटा प्रबंधन</span>
            <h2>किसान बीज रिकॉर्ड</h2>
            
          </div>
          <div className="kb-intro-stats">
            <div>
              <strong>{manak.length}</strong>
              <span>मानक</span>
            </div>
            <div>
              <strong>{avantan.length}</strong>
              <span>आवंटन</span>
            </div>
            <div>
              <strong>{vitran.length}</strong>
              <span>वितरण</span>
            </div>
          </div>
        </section>
        <nav
          className="kb-step-nav kb-api-tabs"
          role="tablist"
          aria-label="किसान बीज टैब"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active === tab.key}
              className={`kb-step ${active === tab.key ? "is-active" : ""}`}
              onClick={() => setActive(tab.key)}
            >
              <span className="kb-step-number">0{index + 1}</span>
              <span className="kb-step-text">
                <strong>{tab.label}</strong>
                <small>{tab.title}</small>
              </span>
            </button>
          ))}
        </nav>
        <section className="kb-stage-heading">
          <div className="kb-stage-number">
            {String(tabs.findIndex((tab) => tab.key === active) + 1).padStart(
              2,
              "0",
            )}
          </div>
          <div className="kb-stage-copy">
            <h2>{tabs.find((tab) => tab.key === active)?.title}</h2>
           
          </div>
          {active === "manak" && (
            <div className="kb-scheme-toolbar">
              <button className="kb-primary-button" type="button" onClick={() => {
                setSchemeName(""); setSchemeEditingId(null); setSchemeError(""); setSchemeNotice(""); setSchemeModal("add");
              }}>＋ योजना जोड़ें</button>
              <button className="kb-secondary-button" type="button" onClick={() => {
                setSchemeError(""); setSchemeNotice(""); setSchemeEditingId(null); setSchemeName(""); setSchemeModal("view");
              }}>योजना देखें ({schemes.length})</button>
            </div>
          )}
          <button
            className="kb-secondary-button"
            type="button"
            onClick={refreshActive}
            disabled={loading}
          >
            {loading ? "लोड हो रहा है…" : "↻ रीफ्रेश"}
          </button>
        </section>
        {active !== "vitran" && (
          <section className="kb-card kb-form-card">
            <div className="kb-card-heading">
              <div>
                <span className="kb-kicker">
                  {editingId ? `रिकॉर्ड #${editingId}` : "नई प्रविष्टि"}
                </span>
                <h3>
                  {editingId
                    ? "रिकॉर्ड संपादित करें"
                    : `${tabs.find((tab) => tab.key === active)?.label} जोड़ें`}
                </h3>
              </div>
              {editingId && (
                <button
                  className="kb-secondary-button"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(
                      active === "manak"
                        ? calculateManak(blank("manak"))
                        : blank(active),
                    );
                  }}
                >
                  रद्द करें
                </button>
              )}
            </div>
            <form onSubmit={saveRecord}>
              {active === "manak" ? (
                <>
                  <div className="kb-manak-guide">
                    <div>
                     
                    </div>
                    <div className="kb-field-legend">
                      <span>
                        <i className="kb-legend-yellow" /> भरना है
                      </span>
                      <span>
                        <i className="kb-legend-green" /> स्वयं भरा जायेगा 
                      </span>
                    </div>
                  </div>
                  {MANAK_SECTIONS.map((section) => (
                    <section
                      className={`kb-manak-section kb-manak-${section.id}`}
                      key={section.id}
                    >
                      <div className="kb-manak-section-heading">
                        <span className="kb-manak-section-number">
                          {section.number}
                        </span>
                        <div>
                          <h4>{section.title}</h4>
                          <p>{section.description}</p>
                        </div>
                      </div>
                      <div className="kb-form-grid">
                        {section.fields.map((key) =>
                          renderField([
                            key,
                            MANAK_FIELD_LABELS[key],
                            fields.manak.find((item) => item[0] === key)?.[2] ||
                              "text",
                          ]),
                        )}
                      </div>
                    </section>
                  ))}
                </>
              ) : (
                <div className="kb-form-grid">
                  {(fields[active] || []).map(renderField)}
                </div>
              )}
              <div className="kb-form-actions">
                <button
                  className="kb-primary-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "सेव हो रहा है…"
                    : editingId
                      ? "अपडेट करें"
                      : "रिकॉर्ड जोड़ें"}
                </button>
                <span className="kb-session-hint">डेटा API पर सेव होगा।</span>
              </div>
            </form>
          </section>
        )}
        <section className="kb-card">
          <div className="kb-card-heading kb-card-heading-wrap">
            <div>
              <h3>
                {tabs.find((tab) => tab.key === active)?.label} सूची ·{" "}
                {filteredRows.length} रिकॉर्ड
              </h3>
            </div>
            <Field label="खोजें">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="रिकॉर्ड में खोजें…"
              />
            </Field>
          </div>
          {active !== "vitran" && (
            <div className="kb-table-actions">
              <label className="kb-select-all">
                <input
                  type="checkbox"
                  checked={
                    filteredRows.length > 0 &&
                    filteredRows.every((row) => selectedIds.includes(row.id))
                  }
                  onChange={(e) =>
                    setSelectedIds(
                      e.target.checked
                        ? [
                            ...new Set([
                              ...selectedIds,
                              ...filteredRows.map((row) => row.id),
                            ]),
                          ]
                        : selectedIds.filter(
                            (id) => !filteredRows.some((row) => row.id === id),
                          ),
                    )
                  }
                />{" "}
                सभी चुनें
              </label>
              <button
                className="kb-danger-button"
                type="button"
                disabled={saving || !selectedIds.length}
                onClick={deleteSelected}
              >
                चयनित डिलीट करें ({selectedIds.length})
              </button>
            </div>
          )}
          {loading ? (
            <div className="kb-empty">API से डेटा लोड हो रहा है…</div>
          ) : (
            <DataTable
              rows={filteredRows}
              columns={columns}
              showSelection={active !== "vitran"}
              selectedIds={selectedIds}
              onToggle={toggleSelected}
            />
          )}
        </section>
        {error && (
          <div className="kb-alert kb-alert-error" role="alert">
            {error}
          </div>
        )}
        {notice && (
          <div className="kb-alert" role="status">
            {notice}
          </div>
        )}
        {/* {active === "vitran" && (
          <div className="kb-note">
            <span className="kb-note-mark">i</span>
            <span>
              वितरण API के लिए अभी GET सूची जोड़ी गई है। POST, PUT और DELETE के
              लिए API contract मिलने पर जोड़े जा सकते हैं।
            </span>
          </div>
        )} */}
      </main>
      {schemeModal && (
        <div className="kb-modal-backdrop" role="presentation" onMouseDown={(e) => {
          if (e.target === e.currentTarget) setSchemeModal("");
        }}>
          <section className="kb-scheme-modal" role="dialog" aria-modal="true" aria-labelledby="kb-scheme-modal-title">
            <div className="kb-card-heading">
              <div>
                <span className="kb-kicker">योजना प्रबंधन</span>
                <h3 id="kb-scheme-modal-title">{schemeModal === "add" ? (schemeEditingId ? "योजना संपादित करें" : "नई योजना जोड़ें") : "उपलब्ध योजनाएँ"}</h3>
              </div>
              <button className="kb-secondary-button" type="button" onClick={() => setSchemeModal("")}>बंद करें ✕</button>
            </div>
            {schemeModal === "add" ? (
              <form onSubmit={saveScheme}>
                <Field label="योजना का नाम">
                  <input autoFocus required value={schemeName} onChange={(e) => setSchemeName(e.target.value)} placeholder="योजना का नाम लिखें" />
                </Field>
                <div className="kb-form-actions">
                  <button className="kb-primary-button" type="submit" disabled={schemeSaving}>{schemeSaving ? "सेव हो रहा है…" : schemeEditingId ? "अपडेट करें" : "योजना सेव करें"}</button>
                  <button className="kb-secondary-button" type="button" onClick={() => { setSchemeModal("view"); setSchemeEditingId(null); setSchemeName(""); }}>योजना सूची</button>
                </div>
              </form>
            ) : (
              <div className="kb-scheme-list">
                {schemes.length ? schemes.map((scheme) => (
                  <div className="kb-scheme-row" key={scheme.id}>
                    <div><strong>{scheme.scheme_name}</strong><small>ID: {scheme.id}</small></div>
                    <div className="kb-scheme-actions">
                      <button className="kb-small-button" type="button" onClick={() => { setSchemeName(scheme.scheme_name || ""); setSchemeEditingId(scheme.id); setSchemeError(""); setSchemeModal("add"); }}>संपादित करें</button>
                      <button className="kb-danger-button" type="button" disabled={schemeSaving} onClick={() => deleteScheme(scheme.id)}>डिलीट</button>
                    </div>
                  </div>
                )) : <div className="kb-empty">अभी कोई योजना उपलब्ध नहीं है।</div>}
                <div className="kb-form-actions"><button className="kb-primary-button" type="button" onClick={() => { setSchemeName(""); setSchemeEditingId(null); setSchemeError(""); setSchemeModal("add"); }}>＋ नई योजना जोड़ें</button></div>
              </div>
            )}
            {schemeError && <div className="kb-alert kb-alert-error" role="alert">{schemeError}</div>}
            {schemeNotice && <div className="kb-alert" role="status">{schemeNotice}</div>}
          </section>
        </div>
      )}
      <footer className="kb-footer">
        <span>किसान बीज प्रबंधन</span>
        <span>मानक, आवंटन और वितरण के लिए अलग API</span>
      </footer>
    </div>
  );
}
