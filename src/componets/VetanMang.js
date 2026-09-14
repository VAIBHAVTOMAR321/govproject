import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/vetan.css";

const API_URL = 'https://mahadevaaya.com/govbillingsystem/backend/api/salary-attendance-reports/';

// Default headers for the dynamic table (Text Headings)
const TABLE_HEADERS = [
  "क्र.", "नाम", "पदनाम", "वर्ग", "दिनांक (शुरू)", "दिनांक (अंत)",
  "छुट्टी (शुरू)", "छुट्टी (अंत)", "उपस्थिति", "अवैतनिक",
  "कुल दिन", "शेष", "वित्तीय वर्ष", "टिप्पणी / कार्य विवरण"
];

// Marathi Month Options for Dropdown
const MONTH_OPTIONS = [
  "जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून",
  "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"
];

// Financial Year Options
const FINANCIAL_YEAR_OPTIONS = ["2024-25", "2025-26", "2026-27", "2027-28"];

// Helper to extract center name
const getCenterNameFromUser = (authUser) => {
  if (!authUser) return "";
  const candidates = [
    authUser.center_name, authUser.centerName, authUser.username, authUser.name,
    authUser.center?.center_name, authUser.center?.name, authUser.profile?.center_name
  ];
  const direct = candidates.find(v => v !== null && v !== undefined && String(v).trim() !== "");
  return direct ? String(direct).trim() : "";
};

function VetanMang() {
  const { user } = useAuth();
  const centerName = getCenterNameFromUser(user);

  const [formData, setFormData] = useState({
    center_name: centerName || '',
    month: '',
    financial_year: '2026-27',
    letter_number: '',
    report_date: '',
    subject: 'वेतन मांग पत्र एवं उपस्थिति सूचना',
    report_data: []
  });

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showFormModal, setShowFormModal] = useState(false);

  const openAddModal = () => {
    setShowFormModal(true);
  };

  const closeAddModal = () => {
    setShowFormModal(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (centerName) {
      setFormData(prev => prev.center_name === centerName ? prev : { ...prev, center_name: centerName });
    }
  }, [centerName]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Network response was not ok");

      const result = await response.json();
      if (result.success) {
        setReports(result.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setMessage({ text: 'रिपोर्ट लाने में त्रुटि हुई।', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleReportDataChange = (rowIndex, colIndex, value) => {
    const updatedReportData = [...formData.report_data];
    updatedReportData[rowIndex][colIndex] = value;
    setFormData({ ...formData, report_data: updatedReportData });
  };

  const addRow = () => {
    const newRow = Array(14).fill('');
    setFormData({ ...formData, report_data: [...formData.report_data, newRow] });
  };

  const removeRow = (rowIndex) => {
    const updatedReportData = formData.report_data.filter((_, index) => index !== rowIndex);
    setFormData({ ...formData, report_data: updatedReportData });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    const cleanedReportData = formData.report_data.filter(row =>
      row.some(cell => cell && cell.trim() !== '')
    );

    const payload = { ...formData, report_data: cleanedReportData };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.success) {
        setMessage({ text: 'वेतन मांग पत्र सफलतापूर्वक सहेजा गया।', type: 'success' });
        setFormData({
          center_name: centerName || '',
          month: '',
          financial_year: '2026-27',
          letter_number: '',
          report_date: '',
          subject: 'वेतन मांग पत्र एवं उपस्थिति सूचना',
          report_data: []
        });
        fetchReports();
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (error) {
      console.error("Error posting report:", error);
      setMessage({ text: 'सबमिशन में त्रुटि हुई। कृपया पुनः प्रयास करें।', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Share all reports data
  const handleShareAll = async () => {
    if (!reports.length) {
      alert('कोई रिपोर्ट उपलब्ध नहीं है।');
      return;
    }

    const shareText = reports.map((report, idx) =>
      `${idx + 1}. केंद्र: ${report.center_name} | माह: ${report.month} | वर्ष: ${report.financial_year} | दिनांक: ${report.report_date} | विषय: ${report.subject}\n` +
      `   पत्र संख्या: ${report.letter_number}\n` +
      `   डेटा:\n${report.report_data.map(row => `   ${row.join(' | ')}`).join('\n')}`
    ).join('\n\n');

    const fullText = `वेतन मांग पत्र एवं उपस्थिति सूचना\nकुल रिपोर्ट: ${reports.length}\n\n${shareText}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'वेतन मांग पत्र रिपोर्ट',
          text: fullText
        });
      } catch (error) {
        console.log('Sharing failed', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(fullText);
        alert('सभी रिपोर्ट का विवरण क्लिपबोर्ड पर कॉपी कर दिया गया है!');
      } catch (error) {
        console.error('Copy failed', error);
        alert('शेयर करने में त्रुटि हुई।');
      }
    }
  };

  // Print entire table
  const handlePrintAll = () => {
    if (!reports.length) {
      alert('कोई रिपोर्ट उपलब्ध नहीं है।');
      return;
    }

    const tableRows = reports.map(report =>
      report.report_data.map(row =>
        `<tr><td>${report.center_name}</td><td>${report.month}</td><td>${report.financial_year}</td><td>${report.report_date}</td>${row.map(cell => `<td>${cell || ''}</td>`).join('')}</tr>`
      ).join('')
    ).join('');

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
      <head>
        <title>वेतन मांग पत्र - सभी रिपोर्ट</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #2c3e50; }
          h1, h2 { color: #1a5276; text-align: center; margin-bottom: 5px; }
          .header-info { margin-bottom: 20px; border-bottom: 2px solid #1a5276; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #1a5276; color: white; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <div class="header-info">
          <h1>वेतन मांग पत्र एवं उपस्थिति सूचना</h1>
          <h2>सभी सहेजी गई रिपोर्ट - कुल: ${reports.length}</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>केंद्र</th>
              <th>माह</th>
              <th>वित्तीय वर्ष</th>
              <th>रिपोर्ट दिनांक</th>
              ${TABLE_HEADERS.map(h => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <Container fluid className="px-3" style={{ paddingTop: '60px' }}>
      <Row className="mb-3">
        <Col>
          <div
            className="p-3 rounded shadow-sm"
            style={{ backgroundColor: '#1a5276', color: 'white' }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0 fw-bold">वेतन मांग पत्र एवं उपस्थिति सूचना</h5>
                <small className="opacity-75">{centerName}</small>
              </div>
              <Button
                variant="light"
                size="sm"
                onClick={openAddModal}
                className="fw-bold"
              >
                + नई रिपोर्ट दर्ज करें
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {message.text && showFormModal === false && (
        <Row className="mb-3">
          <Col>
            <Alert variant={message.type === 'success' ? 'success' : 'danger'}>
              {message.text}
            </Alert>
          </Col>
        </Row>
      )}

      {showFormModal && (
        <div className="vm-modal-overlay">
          <div className="vm-modal">
            <div className="vm-modal-header">
              <h2>नई रिपोर्ट दर्ज करें (Add New Report)</h2>
              <button type="button" className="vm-modal-close" onClick={closeAddModal}>×</button>
            </div>

            {message.text && (
              <div className={`vm-alert ${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="vm-grid-2">
                <div className="vm-input-group">
                  <label>केंद्र का नाम (Center Name)</label>
                  <input type="text" name="center_name" value={formData.center_name} readOnly className="vm-readonly-input" />
                </div>

                <div className="vm-input-group">
                  <label>माह (Month) <span className="vm-required">*</span></label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    required
                    className="vm-select-input"
                  >
                    <option value="">-- माह निवडा --</option>
                    {MONTH_OPTIONS.map((month, idx) => (
                      <option key={idx} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <div className="vm-input-group">
                  <label>वित्तीय वर्ष (Financial Year) <span className="vm-required">*</span></label>
                  <select
                    name="financial_year"
                    value={formData.financial_year}
                    onChange={handleInputChange}
                    required
                    className="vm-select-input"
                  >
                    {FINANCIAL_YEAR_OPTIONS.map((year, idx) => (
                      <option key={idx} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="vm-input-group">
                  <label>पत्र संख्या (Letter Number) <span className="vm-required">*</span></label>
                  <input type="text" name="letter_number" value={formData.letter_number} onChange={handleInputChange} required />
                </div>

                <div className="vm-input-group">
                  <label>रिपोर्ट दिनांक (Report Date) <span className="vm-required">*</span></label>
                  <input type="date" name="report_date" value={formData.report_date} onChange={handleInputChange} required />
                </div>

                <div className="vm-input-group vm-full-width">
                  <label>विषय (Subject) <span className="vm-required">*</span></label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="vm-table-container">
                <div className="vm-table-header-bar">
                  <h3>कर्मचारी विवरण (Employee Details)</h3>
                  <button type="button" className="vm-btn vm-btn-secondary" onClick={addRow}>+ पंक्ति जोड़ें (Add Row)</button>
                </div>

                <div className="vm-table-scroll">
                  <table className="vm-data-table">
                    <thead>
                      <tr>
                        {TABLE_HEADERS.map((header, idx) => <th key={idx}>{header}</th>)}
                        <th className="vm-action-col">कार्य (Action)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.report_data.length === 0 ? (
                        <tr>
                          <td colSpan={TABLE_HEADERS.length + 1} className="vm-empty-row">
                            कृपया डेटा जोड़ने के लिए "पंक्ति जोड़ें" पर क्लिक करें
                          </td>
                        </tr>
                      ) : (
                        formData.report_data.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx}>
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => handleReportDataChange(rIdx, cIdx, e.target.value)}
                                />
                              </td>
                            ))}
                            <td className="vm-action-col">
                              <button type="button" className="vm-btn-danger" onClick={() => removeRow(rIdx)}>
                                हटाएं
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="vm-form-actions">
                <button type="button" className="vm-btn vm-btn-cancel" onClick={closeAddModal}>
                  रद्द करें
                </button>
                <button type="submit" className="vm-btn vm-btn-primary" disabled={isLoading}>
                  {isLoading ? 'सहेजा जा रहा है...' : 'रिपोर्ट सहेजें (Save Report)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GET Data Section */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header
              className="py-2"
              style={{ backgroundColor: '#0d9488', color: 'white' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-bold">सहेजी गई रिपोर्ट्स (Saved Reports)</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    variant="light"
                    size="sm"
                    onClick={fetchReports}
                    disabled={isLoading}
                    className="fw-bold"
                  >
                    {isLoading ? 'लोड हो रहा है...' : 'रिफ्रेश करें'}
                  </Button>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={handleShareAll}
                    disabled={!reports.length}
                    className="fw-bold"
                  >
                    शेयर करें
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handlePrintAll}
                    disabled={!reports.length}
                    className="fw-bold"
                  >
                    प्रिंट करें
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {isLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" style={{ color: '#0d9488' }} />
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  कोई रिपोर्ट उपलब्ध नहीं है।
                </div>
              ) : (
                <div className="table-responsive">
                  <Table bordered striped hover responsive className="mb-0 table-sm">
                    <thead className="table-light">
                      <tr>
                        <th className="text-center" style={{ width: '50px' }}>क्र.</th>
                        <th>केंद्र</th>
                        <th>माह</th>
                        <th>वित्तीय वर्ष</th>
                        <th>रिपोर्ट दिनांक</th>
                        {TABLE_HEADERS.map((header, idx) => <th key={idx}>{header}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) =>
                        report.report_data.map((row, rIdx) => (
                          <tr key={`${report.id}-${rIdx}`}>
                            <td className="text-center text-muted">{rIdx + 1}</td>
                            <td className="text-nowrap">{report.center_name}</td>
                            <td className="text-nowrap">{report.month}</td>
                            <td className="text-nowrap">{report.financial_year}</td>
                            <td className="text-nowrap">{report.report_date}</td>
                            {row.map((cell, cIdx) => <td key={cIdx}>{cell}</td>)}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default VetanMang;