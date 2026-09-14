import React, { useState, useEffect } from 'react';
import { Container, Spinner, Alert, Row, Col, Card, Form, Button, Modal, Table } from 'react-bootstrap';
import DashBoardHeader from './DashBoardHeader';
import LeftNav from './LeftNav';
import Footer from '../footer/Footer';
import { FaClipboardList, FaPlus, FaEdit, FaTrashAlt, FaSave, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import '../../assets/css/dashboard.css';

const API_BASE_URL = 'https://mahadevaaya.com/govbillingsystem/backend/api/salary-attendance-reports/';

const MONTH_OPTIONS = [
  "जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून",
  "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"
];

const FINANCIAL_YEAR_OPTIONS = ["2024-25", "2025-26", "2026-27", "2027-28"];

const AdminVetanMang = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  
  // Default empty form data
  const initialFormData = {
    center_name: '',
    month: '',
    financial_year: '',
    letter_number: '',
    report_date: '',
    subject: '',
    report_data: []
  };

  const [formData, setFormData] = useState(initialFormData);

  // Check device width (Same as your Dashboard code)
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Fetch all reports (GET)
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_BASE_URL, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const responseData = await response.json();
      setReports(Array.isArray(responseData.data) ? responseData.data : []);
    } catch (err) {
      setError("रिपोर्ट लोड करने में त्रुटि। कृपया पुनः प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Handle standard input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle 2D Array report_data changes
  const handleReportDataChange = (rowIndex, colIndex, value) => {
    const newData = [...formData.report_data];
    if (!newData[rowIndex]) newData[rowIndex] = [];
    newData[rowIndex][colIndex] = value;
    setFormData(prev => ({ ...prev, report_data: newData }));
  };

  const addReportRow = () => {
    setFormData(prev => ({
      ...prev,
      report_data: [...prev.report_data, Array(14).fill('')] // 14 columns based on your JSON
    }));
  };

  const removeReportRow = (rowIndex) => {
    setFormData(prev => ({
      ...prev,
      report_data: prev.report_data.filter((_, index) => index !== rowIndex)
    }));
  };

  // Open Modal for Add or Edit
  const handleOpenModal = (report = null) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        center_name: report.center_name || '',
        month: report.month || '',
        financial_year: report.financial_year || '',
        letter_number: report.letter_number || '',
        report_date: report.report_date || '',
        subject: report.subject || '',
        report_data: report.report_data || []
      });
    } else {
      setEditingReport(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  // Save (POST / PUT)
  const handleSaveReport = async () => {
    const method = editingReport ? 'PUT' : 'POST';
    const url = editingReport ? `${API_BASE_URL}${editingReport.id}/` : API_BASE_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save data');
      
      setShowModal(false);
      fetchReports(); // Refresh list
    } catch (err) {
      alert('डेटा सेव करने में त्रुटि हुई।');
    }
  };

  // Delete (DELETE)
  const handleDeleteReport = async (id) => {
    if (!window.confirm('क्या आप वाकई इस रिपोर्ट को हटाना चाहते हैं?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}${id}/`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok && response.status !== 204) throw new Error('Failed to delete');
      
      fetchReports(); // Refresh list
    } catch (err) {
      alert('डिलीट करने में त्रुटि हुई।');
    }
  };

  // Table Headers for report_data
  const reportColumns = [
    "क्र.सं.", "नाम", "पदनाम", "वेतन प्रकार", "प्रारंभ तिथि", "तिथि तक", "पुनः प्रारंभ", "पुनः तिथि तक", 
    "छुट्टी", "विशेष कारण", "उपस्थिति", "विशेष कारण", "कुल", "कार्य विवरण"
  ];

  return (
    <>
      <div className="dashboard-container professional-dashboard">
        <LeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        <div className="main-content professional-main-content">
          <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <Container fluid className="dashboard-body bg-home professional-dashboard-body">
            
            {/* Welcome Section - Same Theme */}
            <div className="home-welcome-section professional-welcome d-flex justify-content-between text-center mb-4">
              <h1 className="home-title">वेतन मांग एवं उपस्थिति प्रबंधन</h1>
              <p className="home-subtitle">DHO कोटद्वार उद्यान विभाग डिजिटल प्लेटफॉर्म में आपका स्वागत है</p>
            </div>

            {/* Export Card Style Header for consistency */}
            <Card className="report-export-card professional-export-card mb-4">
              <Card.Body className="py-2">
                <Row className="align-items-center">
                  <Col md={6} className="mb-2 mb-md-0">
                    <div className="d-flex align-items-center">
                      <FaClipboardList className="text-primary me-2" />
                      <span className="report-title" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                        वेतन मांग पत्र एवं उपस्थिति सूचना
                      </span>
                      <span className="badge bg-info ms-2" style={{ fontSize: '0.7rem' }}>
                        {reports.length} रिपोर्ट्स
                      </span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                      <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
                        <FaPlus className="me-1" /> नई रिपोर्ट जोड़ें
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Loading & Error States - Same Theme */}
            {loading ? (
              <div className="text-center my-5">
                <Spinner animation="border" role="status" variant="primary">
                  <span className="visually-hidden">लोड हो रहा है...</span>
                </Spinner>
                <p className="mt-3">लोड हो रहा है...</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="text-center">
                {error}
                <div className="mt-2">
                  <button className="btn btn-outline-danger btn-sm" onClick={fetchReports}>
                    पुनः प्रयास करें
                  </button>
                </div>
              </Alert>
            ) : (
              
              /* Dynamic Report Section & Table Theme */
              <section className="dynamic-report-section" style={{ marginTop: "0", paddingTop: "0" }}>
                <div className="dynamic-report-heading" style={{ marginTop: "0", marginBottom: "8px", paddingTop: "4px", paddingBottom: "4px" }}>
                  <h4 style={{ margin: 0 }}><FaClipboardList className="me-2" />सभी वेतन एवं उपस्थिति रिपोर्ट्स</h4>
                </div>

                <div className="dynamic-report-content professional-report-content">
                  <div className="dynamic-report-panel">
                    <div className="dynamic-report-table-scroll" style={{ width: '100%', overflowX: 'auto' }}>
                      <table className="dynamic-report-table" style={{ width: '100%', minWidth: '900px', tableLayout: 'auto' }}>
                        <thead>
                          <tr>
                            <th>क्रम संख्या</th>
                            <th>केंद्र का नाम</th>
                            <th>माह</th>
                            <th>वित्तीय वर्ष</th>
                            <th>पत्र संख्या</th>
                            <th>रिपोर्ट तिथि</th>
                            <th>विषय</th>
                            <th>कार्य (Action)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.length > 0 ? reports.map((report, index) => (
                            <tr key={report.id}>
                              <td>{index + 1}</td>
                              <td>{report.center_name}</td>
                              <td>{report.month}</td>
                              <td>{report.financial_year}</td>
                              <td style={{ maxWidth: '250px', whiteSpace: 'normal' }}>{report.letter_number}</td>
                              <td>
                                <FaCalendarAlt className="me-1" />
                                {new Date(report.report_date).toLocaleDateString('hi-IN')}
                              </td>
                              <td style={{ maxWidth: '300px', whiteSpace: 'normal' }}>{report.subject}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button variant="warning" size="sm" onClick={() => handleOpenModal(report)}>
                                    <FaEdit />
                                  </Button>
              
                                </div>
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan="8" className="dynamic-report-empty text-center p-4">
                                कोई डेटा नहीं — कृपया नई रिपोर्ट जोड़ें।
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </Container>
        </div>
      </div>
      
      <Footer />

      {/* Add/Edit Modal - Using Bootstrap Theme */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered scrollable>
        <Modal.Header closeButton style={{ backgroundColor: '#194e8b', color: 'white' }}>
          <Modal.Title style={{ fontSize: '1rem' }}>
            <FaClipboardList className="me-2" />
            {editingReport ? 'रिपोर्ट एडिट करें' : 'नई वेतन/उपस्थिति रिपोर्ट जोड़ें'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="filter-label-sm">केंद्र का नाम</Form.Label>
                  <Form.Control
                    type="text"
                    name="center_name"
                    value={formData.center_name}
                    onChange={handleInputChange}
                    placeholder="जैसे: बीरोंखाल"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="filter-label-sm">माह</Form.Label>
                  <Form.Select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                  >
                    <option value="">-- माह निवडा --</option>
                    {MONTH_OPTIONS.map((month, idx) => (
                      <option key={idx} value={month}>{month}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="filter-label-sm">वित्तीय वर्ष</Form.Label>
                  <Form.Select
                    name="financial_year"
                    value={formData.financial_year}
                    onChange={handleInputChange}
                  >
                    {FINANCIAL_YEAR_OPTIONS.map((year, idx) => (
                      <option key={idx} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="filter-label-sm">पत्र संख्या</Form.Label>
                  <Form.Control
                    type="text"
                    name="letter_number"
                    value={formData.letter_number}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="filter-label-sm">रिपोर्ट तिथि</Form.Label>
                  <Form.Control
                    type="date"
                    name="report_date"
                    value={formData.report_date}
                    onChange={handleInputChange}
                    className="date-input-sm"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="filter-label-sm">विषय</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              {/* 2D Array Data Table Editor */}
              <Col md={12} className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="dynamic-report-subtitle m-0">कर्मचारी उपस्थिति विवरण (report_data)</h6>
                  <Button variant="success" size="sm" onClick={addReportRow}>
                    <FaPlus className="me-1" /> पंक्ति जोड़ें
                  </Button>
                </div>
                
                <div className="dynamic-report-table-scroll matrix-scroll" style={{ width: '100%', overflowX: 'auto' }}>
                  <table className="dynamic-report-table matrix-table" style={{ minWidth: '1800px', tableLayout: 'auto' }}>
                    <thead>
                      <tr>
                        {reportColumns.map((col, idx) => (
                          <th key={idx} style={{ minWidth: '120px' }}>{col}</th>
                        ))}
                        <th>हटाएं</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.report_data.length > 0 ? (
                        formData.report_data.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {reportColumns.map((_, colIndex) => (
                              <td key={colIndex}>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  value={row[colIndex] || ''}
                                  onChange={(e) => handleReportDataChange(rowIndex, colIndex, e.target.value)}
                                  style={{ minWidth: '100px' }}
                                />
                              </td>
                            ))}
                            <td>
                              <Button variant="outline-danger" size="sm" onClick={() => removeReportRow(rowIndex)}>
                                <FaTimes />
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={reportColumns.length + 1} className="dynamic-report-empty text-center">
                            कोई कर्मचारी डेटा नहीं। कृपया "पंक्ति जोड़ें" पर क्लिक करें।
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
            <FaTimes className="me-1" /> बंद करें
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveReport}>
            <FaSave className="me-1" /> {editingReport ? 'अपडेट करें' : 'सेव करें'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}; 

export default AdminVetanMang;