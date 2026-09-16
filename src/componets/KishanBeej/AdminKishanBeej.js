import React, { useState, useEffect } from 'react';
import './AdminKishanBeej.css'; // Ensure this CSS file is created

function AdminKishanBeej() {
  const [data, setData] = useState({ kisan: [], kiwi: [], dragon: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtering states
  const [activeTab, setActiveTab] = useState('kisan');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State for Modal
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://mahadevaaya.com/govbillingsystem/backend/api/all-kisan-applications/');
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      
      if (result.status && result.data) {
        setData({
          kisan: processCategoryData(result.data.kisan, 'kisan'),
          kiwi: processCategoryData(result.data.kiwi, 'kiwi'),
          dragon: processCategoryData(result.data.dragon, 'dragon')
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processCategoryData = (categoryData, type) => {
    if (!categoryData) return [];
    
    const personalKey = type === 'kisan' ? 'personal_land' : 'personal';
    const planKey = type === 'kisan' ? 'plan_technical_bank' : 'plan_land_bank';

    const personalMap = {};
    categoryData[personalKey]?.forEach(p => personalMap[p.form_id] = p);

    const planMap = {};
    categoryData[planKey]?.forEach(p => planMap[p.form_id] = p);

    const docMap = {};
    categoryData.documents?.forEach(d => docMap[d.form_id] = d);

    const formIds = new Set([
      ...Object.keys(personalMap),
      ...Object.keys(planMap),
      ...Object.keys(docMap)
    ]);

    return Array.from(formIds).map(formId => {
      const personal = personalMap[formId] || {};
      const plan = planMap[formId] || {};
      const docs = docMap[formId] || {};

      const isComplete = personal.name && plan.total_land && docs.declaration_accepted;

      return {
        form_id: formId,
        name: personal.name || '-',
        mobile: personal.mobile || '-',
        father: personal.father || '-',
        district: personal.district || '-',
        block: personal.block || '-',
        scheme: plan.plan_scheme || (type === 'kisan' ? personal.plan_scheme : '-') || '-',
        created_at: personal.created_at || plan.created_at || docs.created_at,
        isComplete,
        raw: { personal, plan, docs }
      };
    });
  };

  // Function to handle tab switching and resetting filters
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery(''); // Reset search
    setStatusFilter('all'); // Reset status filter
  };

  const getFilteredData = () => {
    let filtered = data[activeTab] || [];

    if (statusFilter === 'completed') {
      filtered = filtered.filter(item => item.isComplete);
    } else if (statusFilter === 'pending') {
      filtered = filtered.filter(item => !item.isComplete);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(q) ||
        item.form_id.toLowerCase().includes(q) ||
        item.mobile.includes(q) ||
        (item.father && item.father.toLowerCase().includes(q)) ||
        (item.district && item.district.toLowerCase().includes(q))
      );
    }

    return filtered;
  };

  const filteredData = getFilteredData();

  const openModal = (item) => setModalData(item);
  const closeModal = () => setModalData(null);

  if (loading) return (
    <div className="loading-screen">
      <div className="loader-spinner"></div>
      <p>Loading Applications...</p>
    </div>
  );
  
  if (error) return <div className="admin-error">Error: {error}</div>;

  return (
    <>
      <div className="admin-kishan-container">
        <div className="header-section">
          <h2>Kishan Avedan Admin Panel</h2>
          <p>Manage and review farmer subsidy applications</p>
        </div>

        {/* Unified Controls Bar - 1 Row Layout */}
        <div className="admin-controls-bar">
          <div className="admin-tabs">
            {['kisan', 'kiwi', 'dragon'].map(tab => (
              <button 
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`} 
                onClick={() => handleTabChange(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} 
               
              </button>
            ))}
          </div>

          <div className="admin-filters">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search Name, Form ID, Mobile..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-select"
            >
              <option value="all">All Applications</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Form ID</th>
                <th>Applicant Name</th>
                <th>Father's Name</th>
                <th>Mobile</th>
                <th>District</th>
                <th>Scheme</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    <div className="no-data-content">
                      <span>📋</span>
                      <p>No applications found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.form_id} className="data-row">
                    <td className="form-id-cell">{item.form_id}</td>
                    <td className="name-cell">{item.name}</td>
                    <td>{item.father}</td>
                    <td>{item.mobile}</td>
                    <td>{item.district}</td>
                    <td className="scheme-cell" title={item.scheme}>{item.scheme}</td>
                    <td>
                      <span className={`status-badge ${item.isComplete ? 'completed' : 'pending'}`}>
                        <span className="status-dot"></span>
                        {item.isComplete ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button className="view-btn" onClick={() => openModal(item)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Component - Rendered outside the main container */}
      {modalData && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{modalData.name}'s Application</h3>
                <span className="modal-form-id">{modalData.form_id}</span>
              </div>
              <button className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* Personal Details */}
              <div className="modal-section">
                <h4><span className="section-icon">👤</span> Personal Details</h4>
                <div className="details-grid">
                  <div className="detail-item"><span>Gender:</span> {modalData.raw.personal.gender || '-'}</div>
                  <div className="detail-item"><span>Father's Name:</span> {modalData.raw.personal.father || '-'}</div>
                  <div className="detail-item"><span>Udyan Card:</span> {modalData.raw.personal.udyan_card || '-'}</div>
                  <div className="detail-item"><span>Category:</span> {modalData.raw.personal.category || '-'}</div>
                  <div className="detail-item"><span>Village:</span> {modalData.raw.personal.village || '-'}</div>
                  <div className="detail-item"><span>Post:</span> {modalData.raw.personal.post || '-'}</div>
                  <div className="detail-item"><span>Block:</span> {modalData.raw.personal.block || '-'}</div>
                  <div className="detail-item"><span>District:</span> {modalData.raw.personal.district || '-'}</div>
                  <div className="detail-item"><span>Mobile:</span> {modalData.raw.personal.mobile || '-'}</div>
                  <div className="detail-item"><span>Aadhaar:</span> {modalData.raw.personal.aadhaar || '-'}</div>
                </div>
              </div>

              {/* Plan & Bank Details */}
              <div className="modal-section">
                <h4><span className="section-icon">🗺️</span> Plan & Bank Details</h4>
                <div className="details-grid">
                  <div className="detail-item"><span>Total Land:</span> {modalData.raw.plan.total_land || '-'}</div>
                  <div className="detail-item"><span>Proposed Area:</span> {modalData.raw.plan.proposed_area || '-'}</div>
                  <div className="detail-item"><span>Latitude:</span> {modalData.raw.plan.latitude || '-'}</div>
                  <div className="detail-item"><span>Longitude:</span> {modalData.raw.plan.longitude || '-'}</div>
                  <div className="detail-item"><span>Bank Name:</span> {modalData.raw.plan.bank_name || '-'}</div>
                  <div className="detail-item"><span>Branch:</span> {modalData.raw.plan.branch || '-'}</div>
                  <div className="detail-item"><span>Account:</span> {modalData.raw.plan.account || '-'}</div>
                  <div className="detail-item"><span>IFSC:</span> {modalData.raw.plan.ifsc || '-'}</div>
                </div>
              </div>

              {/* Documents & Declaration */}
              <div className="modal-section">
                <h4><span className="section-icon">📄</span> Documents & Declaration</h4>
                <div className="details-grid">
                  <div className="detail-item"><span>Execution Type:</span> {modalData.raw.docs.execution || '-'}</div>
                  <div className="detail-item"><span>Firm Name:</span> {modalData.raw.docs.firm_name || '-'}</div>
                  <div className="detail-item"><span>Place:</span> {modalData.raw.docs.place || '-'}</div>
                  <div className="detail-item"><span>Application Date:</span> {modalData.raw.docs.application_date || '-'}</div>
                  <div className="detail-item">
                    <span>Declaration Accepted:</span> 
                    <span className={`bool-badge ${modalData.raw.docs.declaration_accepted ? 'yes' : 'no'}`}>
                      {modalData.raw.docs.declaration_accepted ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
                <div className="documents-list">
                  <strong>Submitted Documents:</strong>
                  {modalData.raw.docs.documents?.length > 0 ? (
                    <ul>
                      {modalData.raw.docs.documents.map((doc, idx) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-docs">None uploaded</p>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-cancel-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminKishanBeej;