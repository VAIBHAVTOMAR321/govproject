import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { FaClipboardList, FaFileAlt } from 'react-icons/fa';
import DashBoardHeader from './DashBoardHeader';
import LeftNav from './LeftNav';
import Footer from '../footer/Footer';
import '../../assets/css/dashboard.css';

const API_URL = 'https://mahadevaaya.com/govbillingsystem/backend/api/month-attendance-reports/';

function AdminMonthAttendance() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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

  useEffect(() => {
    fetchReports();
  }, []);

  // GET Request
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();

      if (Array.isArray(result)) {
        setReports(result);
      } else if (Array.isArray(result.data)) {
        setReports(result.data);
      } else if (result.data && Array.isArray(result.data.results)) {
        setReports(result.data.results);
      } else if (result.results) {
        setReports(result.results);
      } else if (result.data) {
        setReports([result.data]);
      } else {
        setReports([]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      setMessage({ text: 'रिपोर्ट लाने में त्रुटि हुई।', type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  const getFileUrl = (filePath) => {
    if (!filePath) return '#';
    if (filePath.startsWith('http')) return filePath;
    return `https://mahadevaaya.com/govbillingsystem/backend/${filePath}`;
  };

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
            <div className="home-welcome-section professional-welcome d-flex justify-content-between text-center mb-4">
              <h1 className="home-title">मासिक उपस्थिति प्रबंधन</h1>
              <p className="home-subtitle">DHO कोटद्वार उद्यान विभाग डिजिटल प्लेटफॉर्म में आपका स्वागत है</p>
            </div>

            <Card className="report-export-card professional-export-card mb-4">
              <Card.Body className="py-2">
                <Row className="align-items-center">
                  <Col md={12}>
                    <div className="d-flex align-items-center">
                      <FaClipboardList className="text-primary me-2" />
                      <span className="report-title" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                        मासिक उपस्थिति रिपोर्ट
                      </span>
                      <span className="badge bg-info ms-2" style={{ fontSize: '0.7rem' }}>
                        {reports.length} रिपोर्ट्स
                      </span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {message.text && (
              <Alert variant={message.type === 'success' ? 'success' : 'danger'} className="demand-center-alert">
                {message.text}
              </Alert>
            )}

            {isLoading ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">डेटा लोड हो रहा है...</p>
              </div>
            ) : reports.length === 0 ? (
              <Alert variant="info" className="demand-center-empty">
                <strong>कोई रिपोर्ट उपलब्ध नहीं है।</strong>
              </Alert>
            ) : (
              <section className="dynamic-report-section" style={{ marginTop: "0", paddingTop: "0" }}>
                <div className="dynamic-report-content professional-report-content">
                  <div className="dynamic-report-panel">
                    <div className="dynamic-report-table-scroll" style={{ width: '100%', overflowX: 'auto' }}>
                      <table className="dynamic-report-table" style={{ width: '100%', minWidth: '800px', tableLayout: 'auto' }}>
                        <thead>
                          <tr>
                            <th>क्रम संख्या</th>
                            <th>केंद्र का नाम</th>
                            <th>माह</th>
                            <th>वित्तीय वर्ष</th>
                            <th>उपस्थिति फाइल</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.map((report, index) => (
                            <tr key={report.id || index}>
                              <td>{index + 1}</td>
                              <td>{report.center_name}</td>
                              <td>{report.month}</td>
                              <td>{report.financial_year}</td>
                              <td>
                                {report.month_attendance ? (
                                  <a
                                    href={getFileUrl(report.month_attendance)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-primary btn-sm"
                                  >
                                    <FaFileAlt className="me-1" /> देखें/डाउनलोड
                                  </a>
                                ) : (
                                  <span className="text-muted">फाइल उपलब्ध नहीं</span>
                                )}
                              </td>
                            </tr>
                          ))}
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
    </>
  );
}

export default AdminMonthAttendance;