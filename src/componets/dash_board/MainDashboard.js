import React, { useState, useEffect } from "react";
import { Container, Row, Col, Tabs, Tab, Badge, Card, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import "../../assets/css/registration.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import "../../assets/css/MainDashBoard.css"

const MainDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // State to control the active tab
  const [activeTab, setActiveTab] = useState("records");
  
  // API data state
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Filtered data state
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  
  // Counts for each category
  const [counts, setCounts] = useState({
    kendra: 0,
    vidhanSabha: 0,
    vikasKhand: 0
  });

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

  // Fetch billing data from API
  const fetchBillingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/");
      setBillingData(response.data);
      calculateCounts(response.data);
    } catch (err) {
      setError("Failed to fetch billing data");
      console.error("Error fetching billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate counts for each category
  const calculateCounts = (data) => {
    const uniqueKendra = new Set(data.map(item => item.center_name).filter(name => name));
    const uniqueVidhanSabha = new Set(data.map(item => item.vidhan_sabha_name).filter(name => name));
    const uniqueVikasKhand = new Set(data.map(item => item.vikas_khand_name).filter(name => name));
    
    setCounts({
      kendra: uniqueKendra.size,
      vidhanSabha: uniqueVidhanSabha.size,
      vikasKhand: uniqueVikasKhand.size
    });
  };

  // Handle card click to show filtered data
  const handleCardClick = async (filterType) => {
    if (selectedFilter === filterType) {
      setSelectedFilter(null);
      setFilteredData([]);
      return;
    }

    setSelectedFilter(filterType);
    
    // If data is already loaded, filter it
    if (billingData.length > 0) {
      filterData(filterType, billingData);
    } else {
      // If no data loaded, fetch it first
      setLoading(true);
      try {
        const response = await axios.get("https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/");
        setBillingData(response.data);
        filterData(filterType, response.data);
      } catch (err) {
        setError("Failed to fetch billing data");
        console.error("Error fetching billing data:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Filter data based on selected type
  const filterData = (filterType, data) => {
    let filtered = [];
    
    switch (filterType) {
      case 'kendra':
        filtered = Array.from(new Set(data.map(item => item.center_name).filter(name => name && name.trim())));
        break;
      case 'vidhanSabha':
        filtered = Array.from(new Set(data.map(item => item.vidhan_sabha_name).filter(name => name && name.trim())));
        break;
      case 'vikasKhand':
        filtered = Array.from(new Set(data.map(item => item.vikas_khand_name).filter(name => name && name.trim())));
        break;
      default:
        filtered = [];
    }
    
    setFilteredData(filtered);
  };

  // Load data on component mount
  useEffect(() => {
    fetchBillingData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  return (
    <div>
      <Row>
        <Col lg={12} md={12} sm={12}>
          <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </Col>
      </Row>
      
      <Row className="left-top">
        <Col lg={2} md={2} sm={12}>
          <LeftNav />
        </Col>
        
        <Col lg={10} md={12} sm={10}>
          <Container fluid className="dashboard-body-main">
            
            {/* TABS SECTION */}
            <Tabs
              id="dashboard-tabs"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              className="mb-4 custom-tabs"
            >
              {/* FIRST TAB: RECORDS */}
              <Tab eventKey="records" title="Records">
                <Row>
                  {/* Kendra Card */}
                  <Col lg={4} md={6} sm={12} className="mb-3">
                    <Card 
                      className="gov-card-body card-gradient-1 clickable-card"
                      onClick={() => handleCardClick('kendra')}
                    >
                      <Card.Body className="gov-card-inner">
                        <div className="gov-icon">
                          <i className="bi bi-building"></i>
                          <p>केंद्र (Kendra)</p>
                        </div>
                        <div className="gov-text">
                          <h2>{counts.kendra}</h2>
                          <span className="card-trend">
                            {selectedFilter === 'kendra' ? 'Showing Details' : 'Click to View'}
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Vidhan Sabha Card */}
                  <Col lg={4} md={6} sm={12} className="mb-3">
                    <Card 
                      className="gov-card-body card-gradient-2 clickable-card"
                      onClick={() => handleCardClick('vidhanSabha')}
                    >
                      <Card.Body className="gov-card-inner">
                        <div className="gov-icon">
                          <i className="bi bi-people"></i>
                          <p>विधानसभा (Vidhan Sabha)</p>
                        </div>
                        <div className="gov-text">
                          <h2>{counts.vidhanSabha}</h2>
                          <span className="card-trend">
                            {selectedFilter === 'vidhanSabha' ? 'Showing Details' : 'Click to View'}
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Vikas Khand Card */}
                  <Col lg={4} md={6} sm={12} className="mb-3">
                    <Card 
                      className="gov-card-body card-gradient-3 clickable-card"
                      onClick={() => handleCardClick('vikasKhand')}
                    >
                      <Card.Body className="gov-card-inner">
                        <div className="gov-icon">
                          <i className="bi bi-globe"></i>
                          <p>विकासखंड (Vikas Khand)</p>
                        </div>
                        <div className="gov-text">
                          <h2>{counts.vikasKhand}</h2>
                          <span className="card-trend">
                            {selectedFilter === 'vikasKhand' ? 'Showing Details' : 'Click to View'}
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Detailed View Section */}
                {selectedFilter && (
                  <Row className="mt-4">
                    <Col lg={9} md={8} sm={12}>
                      <Card>
                        <Card.Header>
                          <h5>
                            {selectedFilter === 'kendra' && 'केंद्र (Kendra) Details'}
                            {selectedFilter === 'vidhanSabha' && 'विधानसभा (Vidhan Sabha) Details'}
                            {selectedFilter === 'vikasKhand' && 'विकासखंड (Vikas Khand) Details'}
                          </h5>
                        </Card.Header>
                        <Card.Body>
                          {loading && selectedFilter ? (
                            <div className="text-center">
                              <Spinner animation="border" />
                              <p className="mt-2">Loading {selectedFilter} data...</p>
                            </div>
                          ) : error ? (
                            <div className="alert alert-danger">{error}</div>
                          ) : filteredData.length > 0 ? (
                            <div className="badges-container">
                              {filteredData.map((item, index) => (
                                <Badge 
                                  key={index} 
                                  bg="primary" 
                                  className="m-1 badge-large"
                                >
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted">No data available for this category.</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                    
                    <Col lg={3} md={4} sm={12}>
                      <Card>
                        <Card.Header>
                          <h6>Line Graph</h6>
                        </Card.Header>
                        <Card.Body>
                          {/* Placeholder for line graph */}
                          <div className="graph-placeholder">
                            <p className="text-muted text-center">Graph will be displayed here</p>
                            <div className="graph-skeleton">
                              {/* Simple SVG line graph placeholder */}
                              <svg width="100%" height="150" viewBox="0 0 300 150">
                                <rect width="100%" height="100%" fill="#f8f9fa" rx="4" />
                                <polyline 
                                  points="20,130 60,80 100,100 140,60 180,90 220,40 260,70 300,50" 
                                  fill="none" 
                                  stroke="#007bff" 
                                  strokeWidth="2"
                                />
                                <circle cx="20" cy="130" r="3" fill="#007bff" />
                                <circle cx="60" cy="80" r="3" fill="#007bff" />
                                <circle cx="100" cy="100" r="3" fill="#007bff" />
                                <circle cx="140" cy="60" r="3" fill="#007bff" />
                                <circle cx="180" cy="90" r="3" fill="#007bff" />
                                <circle cx="220" cy="40" r="3" fill="#007bff" />
                                <circle cx="260" cy="70" r="3" fill="#007bff" />
                                <circle cx="300" cy="50" r="3" fill="#007bff" />
                              </svg>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                )}
              </Tab>

              {/* SECOND TAB: ANALYTICS */}
              <Tab eventKey="analytics" title="Analytics">
                <Row>
                  <Col lg={3} md={6} sm={12} className="mb-3">
                    <div className="gov-card-body card-gradient-5">
                      <div className="gov-card-inner">
                        <div className="gov-icon">
                          <i className="bi bi-currency-rupee"></i>
                          <p>Total Revenue</p>
                        </div>
                        <div className="gov-text">
                          <h2>₹1.2L</h2>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          </Container>
        </Col>
      </Row>
    </div>
  );
};

export default MainDashboard;