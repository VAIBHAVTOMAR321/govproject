import React, { useState, useEffect } from "react";
import { Container, Row, Col, Tabs, Tab, Badge, Card, Button, Spinner, Modal, Table } from "react-bootstrap";
import axios from "axios";
import "../../assets/css/registration.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import "../../assets/css/MainDashBoard.css"
import VivranSummaryModal from "./VivranSummaryModal";

// BarChart Component
const BarChart = ({ data }) => {
  const [tooltip, setTooltip] = React.useState({ show: false, x: 0, y: 0, name: '', value: 0 });

  if (!data || data.length === 0) return null;

  // Calculate maximum value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  // SVG dimensions
  const width = 300;
  const height = 150;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  
  // Bar spacing - improved calculation
  const totalBarSpace = chartWidth;
  const numBars = data.length;
  const barWidth = Math.max(20, totalBarSpace / (numBars * 1.5)); // Minimum width of 20px
  const barPadding = (totalBarSpace - (numBars * barWidth)) / (numBars - 1) || 10;
  
  // Colors for bars
  const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#17a2b8', '#e83e8c', '#fd7e14'];
  
  // Generate bars with tooltips
  const bars = data.map((item, index) => {
    const x = margin.left + index * (barWidth + barPadding);
    const y = margin.top + chartHeight - (item.value / maxValue) * chartHeight;
    const height = (item.value / maxValue) * chartHeight;
    const color = colors[index % colors.length];
    
    return (
      <g key={index}>
        {/* Invisible hover area for tooltip */}
        <rect
          x={x - 5}
          y={margin.top}
          width={barWidth + 10}
          height={chartHeight}
          fill="transparent"
          onMouseEnter={(e) => {
            const containerRect = e.currentTarget.closest('.bar-chart-container').getBoundingClientRect();
            const svgRect = e.currentTarget.closest('svg').getBoundingClientRect();
            
            // Position tooltip in center of graph section
            const tooltipX = (containerRect.width / 2) - 60; // Center horizontally (120px width / 2)
            const tooltipY = (containerRect.height / 2) - 30; // Center vertically (60px height / 2)
            
            setTooltip({
              show: true,
              x: tooltipX,
              y: tooltipY,
              name: item.name,
              value: item.value
            });
          }}
          onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
        />
        {/* Actual bar */}
        <rect
          x={x}
          y={y}
          width={barWidth}
          height={Math.max(2, height)} // Minimum height of 2px
          fill={color}
          rx="2"
          onMouseEnter={(e) => {
            const containerRect = e.currentTarget.closest('.bar-chart-container').getBoundingClientRect();
            const svgRect = e.currentTarget.closest('svg').getBoundingClientRect();
            
            // Position tooltip in center of graph section
            const tooltipX = (containerRect.width / 2) - 60; // Center horizontally (120px width / 2)
            const tooltipY = (containerRect.height / 2) - 30; // Center vertically (60px height / 2)
            
            setTooltip({
              show: true,
              x: tooltipX,
              y: tooltipY,
              name: item.name,
              value: item.value
            });
          }}
          onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
        />
      </g>
    );
  });

  return (
    <div className="bar-chart-container">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background */}
        <rect width="100%" height="100%" fill="#f8f9fa" rx="4" />
        
        {/* Axes */}
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#6c757d" strokeWidth="2" />
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#6c757d" strokeWidth="2" />
        
        {/* Y-axis labels */}
        <text x={15} y={margin.top} textAnchor="start" fontSize="10" fill="#6c757d">Max: {maxValue}</text>
        <text x={15} y={height - margin.bottom} textAnchor="start" fontSize="10" fill="#6c757d">Min: {minValue}</text>
        
        {/* Bars */}
        {bars}
      </svg>
      
      {/* Tooltip */}
      {tooltip.show && (
        <div className="bar-chart-tooltip">
          <div><strong>{tooltip.name}</strong></div>
          <div>मात्रा: {tooltip.value}</div>
        </div>
      )}
    </div>
  );
};

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
  const [graphData, setGraphData] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalGraphData, setModalGraphData] = useState([]);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [modalSelectedBadge, setModalSelectedBadge] = useState('');
  
  // State for VivranSummaryModal
  const [showVivranModal, setShowVivranModal] = useState(false);
  const [vivranGroupData, setVivranGroupData] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([
    'sno', 'center_name', 'vidhan_sabha_name', 'vikas_khand_name', 'component', 'investment_name', 'unit',
    'allocated_quantity', 'rate', 'allocated_amount', 'updated_quantity',
    'updated_amount', 'source_of_receipt', 'scheme_name'
  ]);
  
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
    let graphDataArray = [];
    
    switch (filterType) {
      case 'kendra':
        // Get unique center names
        filtered = Array.from(new Set(data.map(item => item.center_name).filter(name => name && name.trim())));
        
        // Calculate total allocated quantity for each center
        const centerTotals = {};
        data.forEach(item => {
          if (item.center_name && item.center_name.trim() && item.allocated_quantity) {
            const quantity = parseFloat(item.allocated_quantity) || 0;
            centerTotals[item.center_name] = (centerTotals[item.center_name] || 0) + quantity;
          }
        });
        
        graphDataArray = Object.entries(centerTotals).map(([name, total]) => ({
          name: name,
          value: total
        }));
        break;
        
      case 'vidhanSabha':
        // Get unique vidhan sabha names
        filtered = Array.from(new Set(data.map(item => item.vidhan_sabha_name).filter(name => name && name.trim())));
        
        // Calculate total allocated quantity for each vidhan sabha
        const vidhanSabhaTotals = {};
        data.forEach(item => {
          if (item.vidhan_sabha_name && item.vidhan_sabha_name.trim() && item.allocated_quantity) {
            const quantity = parseFloat(item.allocated_quantity) || 0;
            vidhanSabhaTotals[item.vidhan_sabha_name] = (vidhanSabhaTotals[item.vidhan_sabha_name] || 0) + quantity;
          }
        });
        
        graphDataArray = Object.entries(vidhanSabhaTotals).map(([name, total]) => ({
          name: name,
          value: total
        }));
        break;
        
      case 'vikasKhand':
        // Get unique vikas khand names
        filtered = Array.from(new Set(data.map(item => item.vikas_khand_name).filter(name => name && name.trim())));
        
        // Calculate total allocated quantity for each vikas khand
        const vikasKhandTotals = {};
        data.forEach(item => {
          if (item.vikas_khand_name && item.vikas_khand_name.trim() && item.allocated_quantity) {
            const quantity = parseFloat(item.allocated_quantity) || 0;
            vikasKhandTotals[item.vikas_khand_name] = (vikasKhandTotals[item.vikas_khand_name] || 0) + quantity;
          }
        });
        
        graphDataArray = Object.entries(vikasKhandTotals).map(([name, total]) => ({
          name: name,
          value: total
        }));
        break;
        
      default:
        filtered = [];
        graphDataArray = [];
    }
    
    setFilteredData(filtered);
    setGraphData(graphDataArray);
  };

  // Handle badge click to show VivranSummaryModal
  const handleBadgeClick = (badgeName) => {
    if (!selectedFilter || !badgeName) return;

    // Add to selected badges if not already selected
    if (!selectedBadges.includes(badgeName)) {
      setSelectedBadges([...selectedBadges, badgeName]);
    }
    
    // Set the clicked badge as the modal selected one
    setModalSelectedBadge(badgeName);

    let filteredItems = [];
    let groupField = '';
    let groupName = '';
    let allOptions = [];

    switch (selectedFilter) {
      case 'kendra':
        // Filter items for specific center
        filteredItems = billingData.filter(item => item.center_name === badgeName);
        groupField = 'center_name';
        groupName = badgeName;
        allOptions = [...new Set(billingData.map(item => item.center_name))].filter(Boolean).sort();
        break;

      case 'vidhanSabha':
        // Filter items for specific vidhan sabha
        filteredItems = billingData.filter(item => item.vidhan_sabha_name === badgeName);
        groupField = 'vidhan_sabha_name';
        groupName = badgeName;
        allOptions = [...new Set(billingData.map(item => item.vidhan_sabha_name))].filter(Boolean).sort();
        break;

      case 'vikasKhand':
        // Filter items for specific vikas khand
        filteredItems = billingData.filter(item => item.vikas_khand_name === badgeName);
        groupField = 'vikas_khand_name';
        groupName = badgeName;
        allOptions = [...new Set(billingData.map(item => item.vikas_khand_name))].filter(Boolean).sort();
        break;

      default:
        filteredItems = [];
    }

    // Create group data for VivranSummaryModal
    const groupData = {
      group_name: groupName,
      group_field: groupField,
      items: billingData,  // Pass all billing data to allow filtering across all
      allOptions: allOptions
    };

    setVivranGroupData(groupData);
    setShowVivranModal(true);
  };

  // Handle accordion badge selection in VivranSummaryModal
  const handleModalBadgeSelect = (badgeName) => {
    setModalSelectedBadge(badgeName);

    let filteredItems = [];
    let groupField = '';
    let groupName = '';

    switch (selectedFilter) {
      case 'kendra':
        // Filter items for specific center
        filteredItems = billingData.filter(item => item.center_name === badgeName);
        groupField = 'center_name';
        groupName = badgeName;
        break;
        
      case 'vidhanSabha':
        // Filter items for specific vidhan sabha
        filteredItems = billingData.filter(item => item.vidhan_sabha_name === badgeName);
        groupField = 'vidhan_sabha_name';
        groupName = badgeName;
        break;
        
      case 'vikasKhand':
        // Filter items for specific vikas khand
        filteredItems = billingData.filter(item => item.vikas_khand_name === badgeName);
        groupField = 'vikas_khand_name';
        groupName = badgeName;
        break;
        
      default:
        filteredItems = [];
    }

    // Create group data for VivranSummaryModal
    const groupData = {
      group_name: groupName,
      group_field: groupField,
      items: filteredItems
    };

    setVivranGroupData(groupData);
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
                    <Col lg={8} md={8} sm={12}>
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
                                  className="m-1 badge-large clickable-badge"
                                  onClick={() => handleBadgeClick(item)}
                                  style={{ cursor: 'pointer' }}
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
                    
                    <Col lg={4} md={4} sm={12}>
                      <Card>
                        <Card.Header>
                          <h6>Line Graph</h6>
                        </Card.Header>
                        <Card.Body>
                          {/* Dynamic bar graph based on selected data */}
                          <div className="graph-placeholder">
                            <p className="text-muted text-center">
                              {selectedFilter === 'kendra' && 'केंद्र मात्रा (Kendra Matra)'}
                              {selectedFilter === 'vidhanSabha' && 'विधानसभा मात्रा (Vidhan Sabha Matra)'}
                              {selectedFilter === 'vikasKhand' && 'विकासखंड मात्रा (Vikas Khand Matra)'}
                            </p>
                            <div className="graph-skeleton">
                              {graphData.length > 0 ? (
                                <BarChart data={graphData} />
                              ) : (
                                <div className="text-center text-muted">No data available</div>
                              )}
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

      {/* Vivran Summary Modal */}
      <VivranSummaryModal
        show={showVivranModal}
        onHide={() => setShowVivranModal(false)}
        groupData={vivranGroupData}
        selectedColumns={selectedColumns}
        setSelectedColumns={setSelectedColumns}
      />
    </div>
  );
};

export default MainDashboard;