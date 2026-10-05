import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminKishanBeej.css';
import { buildPrintDocuments, DEFAULT_PRINT_SELECTION, FENCING_LAND_DETAILS_API, SCHEME_PRINT_LABELS } from './adminPrintDocs';
import { ADMIN_PRINT_CSS } from './adminPrintStyle';

const API_BASE = 'https://mahadevaaya.com/govbillingsystem/backend/api';

// KisanAavedanPortal.js → getCenterNameFromUser(): लॉग-इन केंद्र का नाम।
// फेंसिंग आवेदन/शपथ-पत्र/देयक के "स्थान" पंक्ति में यही नाम आता है।
const getCenterNameFromUser = (authUser) => {
  if (!authUser) return '';
  const candidates = [
    authUser.center_name, authUser.centerName, authUser.username, authUser.name,
    authUser.center?.center_name, authUser.center?.name, authUser.profile?.center_name,
  ];
  const direct = candidates.find((value) => value !== null && value !== undefined && String(value).trim() !== '');
  return direct ? String(direct).trim() : '';
};

const SCHEMES = {
  kisan: { name: 'फेंसिंग', english: 'Fencing', endpoint: 'fencing-kisan' },
  kiwi: { name: 'कीवी उद्यान स्थापना', english: 'Kiwi Orchard Establishment', endpoint: 'kiwi-kishan-avedan' },
  dragon: { name: 'ड्रैगन फ्रूट (कमलम)', english: 'Dragon Fruit (Kamalam)', endpoint: 'dragon-fruit-kisan' },
  vermi: { name: 'वर्मी कम्पोस्ट', english: 'Vermicompost', endpoint: 'vermicompost-kisan' },
};

const SCHEME_TYPES = Object.keys(SCHEMES);

function normalizeRecord(record, schemeType) {
  const personal = record?.personal_details || {};
  const expenses = record?.expense_details || {};
  const documents = record?.document_details || {};
  const formId = record?.form_id || personal.form_id || expenses.form_id || documents.form_id || '—';
  return {
    form_id: formId,
    schemeType,
    name: personal.full_name || personal.farmer_name || personal.name || '-',
    father: personal.father_name || personal.father_husband_name || '-',
    village: personal.village || '-',
    district: personal.dist || personal.district || '-',
    mobile: personal.mob || personal.mobile || '-',
    created_at: personal.created_at || '',
    isComplete: Object.keys(expenses).length > 0 || Object.keys(documents).length > 0,
    raw: { personal, expenses, documents, mb_details: record?.mb_details || null },
  };
}

async function fetchSchemeApplications(type, signal) {
  const response = await fetch(`${API_BASE}/${SCHEMES[type].endpoint}/`, { signal });
  if (!response.ok) {
    throw new Error(`${SCHEMES[type].name}: HTTP ${response.status} ${response.statusText}`);
  }
  const result = await response.json();
  const records = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : null;
  if (!records) throw new Error(`${SCHEMES[type].name}: API response is not an application list.`);
  return records.map((record) => normalizeRecord(record, type));
}

// फेंसिंग मानक (अनुमन्य लम्बाई / खम्बे) — वही endpoint जो KisanAavedanPortal.js
// और DragfruitsAndKiwi.js/KiwiFruits.js (mapping) उपयोग करते हैं।
async function fetchFencingStandards(signal) {
  try {
    const response = await fetch(FENCING_LAND_DETAILS_API, { signal });
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : null;
  } catch {
    return null;
  }
}

function AdminPrintPreview({ application, documents, selection, onToggle, onToggleAll, activeDoc, onSelectDoc, onPrint, onClose }) {
  const tabs = SCHEME_PRINT_LABELS[application.schemeType] || [];
  const selectedCount = documents.filter((doc) => selection[doc.id]).length;

  return (
    <>
      <div className="preview-modal-head">
        <div className="preview-heading-copy">
          <span className="preview-eyebrow">पूर्ण आवेदन • प्रिंट पूर्वावलोकन</span>
          <h2>{SCHEMES[application.schemeType].name}</h2>
          <span>आवेदन क्रमांक: {application.form_id}</span>
        </div>
        <div className="preview-modal-actions">
          <button type="button" className="admin-print-doc-btn" onClick={onToggleAll}>
            {selectedCount === documents.length ? 'सभी हटाएँ' : 'सभी चुनें'}
          </button>
          <button type="button" className="preview-print-btn" onClick={onPrint}>
            🖨 प्रिंट / PDF
          </button>
          <button type="button" className="preview-close" onClick={onClose} aria-label="बंद करें">×</button>
        </div>
      </div>

      <div className="admin-print-toolbar">
        <div className="admin-print-tabs" role="tablist" aria-label="दस्तावेज़">
          {documents.map((doc, index) => (
            <button
              key={doc.id}
              type="button"
              role="tab"
              aria-selected={activeDoc === doc.id}
              className={`admin-print-tab ${activeDoc === doc.id ? 'active' : ''}`}
              onClick={() => onSelectDoc(doc.id)}
            >
              {tabs[index] || doc.label}
            </button>
          ))}
        </div>
        <div className="admin-print-checks">
          <span className="admin-print-checks-label">प्रिंट में शामिल करें:</span>
          {documents.map((doc) => (
            <label key={doc.id} className={`admin-print-check ${selection[doc.id] ? 'on' : ''}`}>
              <input type="checkbox" checked={!!selection[doc.id]} onChange={() => onToggle(doc.id)} />
              {doc.label}
            </label>
          ))}
        </div>
      </div>

      <div className="preview-modal-body">
        <style>{ADMIN_PRINT_CSS}</style>
        <div className="admin-print-sheet">
          {documents.map((doc) => (
            <section
              key={doc.id}
              className={`scheme-doc ${application.schemeType === 'dragon' || application.schemeType === 'kiwi' ? 'print-doc' : ''} ${activeDoc === doc.id ? 'active' : ''}`}
              style={activeDoc === doc.id ? undefined : { display: 'none' }}
              dangerouslySetInnerHTML={{ __html: doc.html }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function AdminKishanAavedan() {
  const { user } = useAuth();
  const centerName = useMemo(() => getCenterNameFromUser(user), [user]);
  const [data, setData] = useState({ kisan: [], kiwi: [], dragon: [], vermi: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('kisan');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingApplication, setViewingApplication] = useState(null);
  const [fenceStandards, setFenceStandards] = useState(null);
  const [printSelection, setPrintSelection] = useState(DEFAULT_PRINT_SELECTION);
  const [activeDoc, setActiveDoc] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(SCHEME_TYPES.map((type) => fetchSchemeApplications(type, controller.signal)));
        setData(Object.fromEntries(SCHEME_TYPES.map((type, index) => [type, results[index]])));
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'आवेदन लोड नहीं हो सके।');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadApplications();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchFencingStandards(controller.signal).then((rows) => {
      if (!controller.signal.aborted && rows) setFenceStandards(rows);
    });
    return () => controller.abort();
  }, []);

  const getFilteredData = () => {
    let filtered = data[activeTab] || [];
    if (statusFilter === 'completed') filtered = filtered.filter((item) => item.isComplete);
    if (statusFilter === 'pending') filtered = filtered.filter((item) => !item.isComplete);
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((item) => [
        item.name, item.form_id, item.mobile, item.father, item.district, SCHEMES[item.schemeType].name,
      ].some((value) => String(value || '').toLowerCase().includes(query)));
    }
    return filtered;
  };

  const documents = useMemo(
    () => (viewingApplication ? buildPrintDocuments(viewingApplication.schemeType, viewingApplication, fenceStandards, centerName) : []),
    [viewingApplication, fenceStandards, centerName],
  );

  const selection = viewingApplication ? printSelection[viewingApplication.schemeType] || {} : {};

  const openApplicationView = (item) => {
    const docs = buildPrintDocuments(item.schemeType, item, fenceStandards, centerName);
    setActiveDoc(docs[0]?.id || null);
    setViewingApplication(item);
    document.body.classList.add('admin-application-view-open');
  };
  const closeApplicationView = () => {
    setViewingApplication(null);
    document.body.classList.remove('admin-application-view-open');
  };

  const toggleDoc = (docId) => {
    if (!viewingApplication) return;
    const type = viewingApplication.schemeType;
    setPrintSelection((previous) => ({
      ...previous,
      [type]: { ...(previous[type] || {}), [docId]: !(previous[type] || {})[docId] },
    }));
  };

  const toggleAllDocs = () => {
    if (!viewingApplication) return;
    const type = viewingApplication.schemeType;
    const allSelected = documents.every((doc) => selection[doc.id]);
    const next = {};
    documents.forEach((doc) => { next[doc.id] = !allSelected; });
    setPrintSelection((previous) => ({ ...previous, [type]: next }));
  };

  const printSelectedDocuments = () => {
    const chosen = documents.filter((doc) => selection[doc.id]);
    if (!chosen.length) {
      window.alert('पहले कम से कम एक दस्तावेज़ चुनें।');
      return;
    }
    const body = chosen
      .map((doc, index) => {
        const orchardClass = viewingApplication.schemeType === 'dragon' || viewingApplication.schemeType === 'kiwi' ? ' print-doc' : '';
        return `<section class="scheme-doc${orchardClass}${index ? ' page-break-doc' : ''}">${doc.html}</section>`;
      })
      .join('');
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`<!doctype html><html lang="hi"><head><meta charset="UTF-8"><title>प्रिंट</title><style>${ADMIN_PRINT_CSS}</style></head><body><div class="admin-print-sheet">${body}</div></body></html>`);
    iframeDoc.close();
    const iframeWindow = iframe.contentWindow;
    const cleanup = () => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    };
    iframeWindow.addEventListener('afterprint', cleanup, { once: true });
    setTimeout(() => {
      iframeWindow.focus();
      iframeWindow.print();
      setTimeout(cleanup, 30000);
    }, 250);
  };

  useEffect(() => () => {
    document.body.classList.remove('admin-application-view-open');
  }, []);

  if (loading) {
    return <div className="loading-screen"><div className="loader-spinner"></div><p>Loading Applications...</p></div>;
  }
  if (error) return <div className="admin-error">Error: {error}</div>;

  const filteredData = getFilteredData();

  return (
    <>
      <div className="admin-kishan-container">
        <div className="header-section">
          <h2>Kishan Avedan Admin Panel</h2>
          <p>Manage and review farmer subsidy applications</p>
        </div>
        <div className="admin-controls-bar">
          <div className="admin-tabs">
            {SCHEME_TYPES.map((tab) => (
              <button key={tab} type="button" className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => {
                setActiveTab(tab);
                setSearchQuery('');
                setStatusFilter('all');
              }}>
                {SCHEMES[tab].name}<span className="admin-tab-count">{data[tab].length}</span>
              </button>
            ))}
          </div>
          <div className="admin-filters">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search Name, Form ID, Mobile..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="search-input" />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="status-select">
              <option value="all">All Applications</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead><tr>
              <th>Form ID</th><th>Scheme</th><th>Applicant Name</th><th>Father's Name</th>
              <th>Village</th><th>District</th><th>Mobile</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan="9" className="no-data"><div className="no-data-content"><span>📋</span><p>No applications found matching your criteria.</p></div></td></tr>
              ) : filteredData.map((item, index) => (
                <tr key={`${item.schemeType}-${item.form_id}-${index}`} className="data-row">
                  <td className="form-id-cell">{item.form_id}</td>
                  <td className="scheme-cell"><strong>{SCHEMES[item.schemeType].name}</strong><small>{SCHEMES[item.schemeType].english}</small></td>
                  <td className="name-cell">{item.name}</td><td>{item.father}</td><td>{item.village}</td>
                  <td>{item.district}</td><td>{item.mobile}</td>
                  <td><span className={`status-badge ${item.isComplete ? 'completed' : 'pending'}`}><span className="status-dot"></span>{item.isComplete ? 'Completed' : 'Pending'}</span></td>
                  <td className="action-cell"><button type="button" className="view-btn" onClick={() => openApplicationView(item)}>देखें</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {viewingApplication && (
        <div className="application-preview-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeApplicationView();
        }}>
          <div className="application-preview-modal" role="dialog" aria-modal="true" aria-label="आवेदन पूर्वावलोकन">
            <AdminPrintPreview
              application={viewingApplication}
              documents={documents}
              selection={selection}
              onToggle={toggleDoc}
              onToggleAll={toggleAllDocs}
              activeDoc={activeDoc}
              onSelectDoc={setActiveDoc}
              onPrint={printSelectedDocuments}
              onClose={closeApplicationView}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default AdminKishanAavedan;
