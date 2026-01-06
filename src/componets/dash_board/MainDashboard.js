import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Tabs,
  Tab,
  Badge,
  Card,
  Button,
  Spinner,
  Modal,
  Table,
} from "react-bootstrap";
import axios from "axios";
import "../../assets/css/registration.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import "../../assets/css/MainDashBoard.css";
import VivranSummaryModal from "./VivranSummaryModal";

// BarChart Component
const BarChart = ({ data }) => {
  const [tooltip, setTooltip] = React.useState({
    show: false,
    x: 0,
    y: 0,
    name: "",
    value: 0,
  });

  if (!data || data.length === 0) return null;

  // Calculate maximum value for scaling
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));

  // SVG dimensions
  const width = 300;
  const height = 150;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Bar spacing - improved calculation
  const totalBarSpace = chartWidth;
  const numBars = data.length;
  const barWidth = Math.min(40, Math.max(15, totalBarSpace / (numBars * 1.5))); // Max 40px, min 15px
  const barPadding = (totalBarSpace - numBars * barWidth) / (numBars - 1) || 10;

  // Colors for bars
  const colors = [
    "#007bff",
    "#28a745",
    "#ffc107",
    "#dc3545",
    "#6f42c1",
    "#17a2b8",
    "#e83e8c",
    "#fd7e14",
  ];

  // Generate bars with tooltips
  const bars = data.map((item, index) => {
    const x = numBars === 1
      ? margin.left + (totalBarSpace - barWidth) / 2
      : margin.left + index * (barWidth + barPadding);
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
            const containerRect = e.currentTarget
              .closest(".bar-chart-container")
              .getBoundingClientRect();
            const svgRect = e.currentTarget
              .closest("svg")
              .getBoundingClientRect();

            // Position tooltip in center of graph section
            const tooltipX = containerRect.width / 2 - 60; // Center horizontally (120px width / 2)
            const tooltipY = containerRect.height / 2 - 30; // Center vertically (60px height / 2)

            setTooltip({
              show: true,
              x: tooltipX,
              y: tooltipY,
              name: item.name,
              value: item.value,
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
            const containerRect = e.currentTarget
              .closest(".bar-chart-container")
              .getBoundingClientRect();
            const svgRect = e.currentTarget
              .closest("svg")
              .getBoundingClientRect();

            // Position tooltip in center of graph section
            const tooltipX = containerRect.width / 2 - 60; // Center horizontally (120px width / 2)
            const tooltipY = containerRect.height / 2 - 30; // Center vertically (60px height / 2)

            setTooltip({
              show: true,
              x: tooltipX,
              y: tooltipY,
              name: item.name,
              value: item.value,
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
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="#6c757d"
          strokeWidth="2"
        />
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="#6c757d"
          strokeWidth="2"
        />

        {/* Y-axis labels */}
        <text
          x={15}
          y={margin.top}
          textAnchor="start"
          fontSize="10"
          fill="#6c757d"
        >
          Max: {maxValue}
        </text>
        <text
          x={15}
          y={height - margin.bottom}
          textAnchor="start"
          fontSize="10"
          fill="#6c757d"
        >
          Min: {minValue}
        </text>

        {/* Bars */}
        {bars}
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <div className="bar-chart-tooltip">
          <div>
            <strong>{tooltip.name}</strong>
          </div>
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
  const [modalTitle, setModalTitle] = useState("");
  const [modalGraphData, setModalGraphData] = useState([]);
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [modalSelectedBadge, setModalSelectedBadge] = useState("");

  // State for VivranSummaryModal
  const [showVivranModal, setShowVivranModal] = useState(false);
  const [vivranGroupData, setVivranGroupData] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([
    "center_name",
    "vidhan_sabha_name",
    "vikas_khand_name",
    "component",
    "investment_name",
    "sub_investment_name",
    "allocated_quantity",
    "rate",
    "allocated_amount",
    "updated_quantity",
    "updated_amount",
    "source_of_receipt",
    "scheme_name",
  ]);

  // State for multiselect centers
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [availableCenters, setAvailableCenters] = useState([]);

  // Counts for each category
  const [counts, setCounts] = useState({
    kendra: 0,
    vidhanSabha: 0,
    vikasKhand: 0,
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
      const response = await axios.get(
        "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/"
      );
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
    const uniqueKendra = new Set(
      data.map((item) => item.center_name).filter((name) => name)
    );
    const uniqueVidhanSabha = new Set(
      data.map((item) => item.vidhan_sabha_name).filter((name) => name)
    );
    const uniqueVikasKhand = new Set(
      data.map((item) => item.vikas_khand_name).filter((name) => name)
    );

    setCounts({
      kendra: uniqueKendra.size,
      vidhanSabha: uniqueVidhanSabha.size,
      vikasKhand: uniqueVikasKhand.size,
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
        const response = await axios.get(
          "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/"
        );
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
      case "kendra":
        // Get unique center names
        filtered = Array.from(
          new Set(
            data
              .map((item) => item.center_name)
              .filter((name) => name && name.trim())
          )
        );

        // Set available centers
        setAvailableCenters(filtered);
        setSelectedCenters([]); // Reset selected centers
        break;

      case "vidhanSabha":
        // Get unique vidhan sabha names
        filtered = Array.from(
          new Set(
            data
              .map((item) => item.vidhan_sabha_name)
              .filter((name) => name && name.trim())
          )
        );

        // Set available centers
        setAvailableCenters(filtered);
        setSelectedCenters([]); // Reset selected centers
        break;

      case "vikasKhand":
        // Get unique vikas khand names
        filtered = Array.from(
          new Set(
            data
              .map((item) => item.vikas_khand_name)
              .filter((name) => name && name.trim())
          )
        );

        // Set available centers
        setAvailableCenters(filtered);
        setSelectedCenters([]); // Reset selected centers
        break;

      default:
        filtered = [];
    }

    setFilteredData(filtered);
  };

  // Handle selected centers to show VivranSummaryModal
  const handleSelectedCenters = (centers) => {
    if (!selectedFilter || !centers || centers.length === 0) return;

    let filteredItems = [];
    let groupField = "";
    let groupName = "";
    let allOptions = [];

    switch (selectedFilter) {
      case "kendra":
        // Filter items for selected centers
        filteredItems = billingData.filter((item) =>
          centers.includes(item.center_name)
        );
        groupField = "center_name";
        groupName = centers.length === 1 ? centers[0] : "Selected Centers";
        allOptions = [...new Set(billingData.map((item) => item.center_name))]
          .filter(Boolean)
          .sort();
        break;

      case "vidhanSabha":
        // Filter items for selected vidhan sabhas
        filteredItems = billingData.filter((item) =>
          centers.includes(item.vidhan_sabha_name)
        );
        groupField = "vidhan_sabha_name";
        groupName =
          centers.length === 1 ? centers[0] : "Selected Vidhan Sabhas";
        allOptions = [
          ...new Set(billingData.map((item) => item.vidhan_sabha_name)),
        ]
          .filter(Boolean)
          .sort();
        break;

      case "vikasKhand":
        // Filter items for selected vikas khands
        filteredItems = billingData.filter((item) =>
          centers.includes(item.vikas_khand_name)
        );
        groupField = "vikas_khand_name";
        groupName = centers.length === 1 ? centers[0] : "Selected Vikas Khands";
        allOptions = [
          ...new Set(billingData.map((item) => item.vikas_khand_name)),
        ]
          .filter(Boolean)
          .sort();
        break;

      default:
        filteredItems = [];
    }

    // Create group data for VivranSummaryModal
    const groupData = {
      group_name: groupName,
      group_field: groupField,
      items: billingData, // Pass all billing data to allow filtering across all
      allOptions: allOptions,
      selectedItems: centers, // Pass selected items (centers, vidhan sabhas, or vikas khands)
      availableCenters: availableCenters,
      selectedCenters: centers,
    };

    setVivranGroupData(groupData);
    setShowVivranModal(true);
  };

  // Handle accordion badge selection in VivranSummaryModal
  const handleModalBadgeSelect = (badgeName) => {
    setModalSelectedBadge(badgeName);

    let filteredItems = [];
    let groupField = "";
    let groupName = "";

    switch (selectedFilter) {
      case "kendra":
        // Filter items for specific center
        filteredItems = billingData.filter(
          (item) => item.center_name === badgeName
        );
        groupField = "center_name";
        groupName = badgeName;
        break;

      case "vidhanSabha":
        // Filter items for specific vidhan sabha
        filteredItems = billingData.filter(
          (item) => item.vidhan_sabha_name === badgeName
        );
        groupField = "vidhan_sabha_name";
        groupName = badgeName;
        break;

      case "vikasKhand":
        // Filter items for specific vikas khand
        filteredItems = billingData.filter(
          (item) => item.vikas_khand_name === badgeName
        );
        groupField = "vikas_khand_name";
        groupName = badgeName;
        break;

      default:
        filteredItems = [];
    }

    // Create group data for VivranSummaryModal
    const groupData = {
      group_name: groupName,
      group_field: groupField,
      items: filteredItems,
    };

    setVivranGroupData(groupData);
  };

  // Load data on component mount
  useEffect(() => {
    fetchBillingData();
  }, []);

  // Update graph data when selectedCenters changes
  useEffect(() => {
    if (selectedFilter && billingData.length > 0) {
      let dataToUse = billingData;
      if (selectedCenters.length > 0) {
        // Filter based on selectedFilter type
        switch (selectedFilter) {
          case "kendra":
            dataToUse = billingData.filter(item => selectedCenters.includes(item.center_name));
            break;
          case "vidhanSabha":
            dataToUse = billingData.filter(item => selectedCenters.includes(item.vidhan_sabha_name));
            break;
          case "vikasKhand":
            dataToUse = billingData.filter(item => selectedCenters.includes(item.vikas_khand_name));
            break;
        }
      }

      // Calculate graph data from filtered data
      let graphDataArray = [];
      switch (selectedFilter) {
        case "kendra":
          const centerTotals = {};
          dataToUse.forEach((item) => {
            if (item.center_name && item.allocated_quantity) {
              const quantity = parseFloat(item.allocated_quantity) || 0;
              centerTotals[item.center_name] = (centerTotals[item.center_name] || 0) + quantity;
            }
          });
          graphDataArray = Object.entries(centerTotals).map(([name, total]) => ({ name, value: total }));
          break;

        case "vidhanSabha":
          const vidhanSabhaTotals = {};
          dataToUse.forEach((item) => {
            if (item.vidhan_sabha_name && item.allocated_quantity) {
              const quantity = parseFloat(item.allocated_quantity) || 0;
              vidhanSabhaTotals[item.vidhan_sabha_name] = (vidhanSabhaTotals[item.vidhan_sabha_name] || 0) + quantity;
            }
          });
          graphDataArray = Object.entries(vidhanSabhaTotals).map(([name, total]) => ({ name, value: total }));
          break;

        case "vikasKhand":
          const vikasKhandTotals = {};
          dataToUse.forEach((item) => {
            if (item.vikas_khand_name && item.allocated_quantity) {
              const quantity = parseFloat(item.allocated_quantity) || 0;
              vikasKhandTotals[item.vikas_khand_name] = (vikasKhandTotals[item.vikas_khand_name] || 0) + quantity;
            }
          });
          graphDataArray = Object.entries(vikasKhandTotals).map(([name, total]) => ({ name, value: total }));
          break;
      }

      setGraphData(graphDataArray);
    }
  }, [selectedFilter, billingData, selectedCenters]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Toggle center selection between available and selected
  const toggleCenterSelection = (center) => {
    if (selectedCenters.includes(center)) {
      // Move from selected to available
      setSelectedCenters(selectedCenters.filter((c) => c !== center));
      setAvailableCenters([...availableCenters, center].sort());
    } else {
      // Move from available to selected
      setAvailableCenters(availableCenters.filter((c) => c !== center));
      setSelectedCenters([...selectedCenters, center].sort());
    }
  };

  return (
    <div>
      <Container fluid className="p-4">
        <Row>
          <Col lg={12} md={12} sm={12}>
            <DashBoardHeader
              sidebarOpen={sidebarOpen}
              toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
          </Col>
        </Row>

        <Row className="left-top">
          {/* <Col lg={2} md={2} sm={12}>
            <LeftNav />
          </Col> */}

          <Col lg={12} md={12} sm={12}>
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
                        onClick={() => handleCardClick("kendra")}
                      >
                        <Card.Body className="gov-card-inner">
                          <div className="gov-icon">
                            <i className="bi bi-building"></i>
                            <p>केंद्र (Kendra)</p>
                            
                          </div>
                          <div className="gov-text">
                            <h2>{counts.kendra}</h2>
                            <span className="card-trend">
                              {selectedFilter === "kendra"
                                ? "Showing Details"
                                : "Click to View"}
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Vidhan Sabha Card */}
                    <Col lg={4} md={6} sm={12} className="mb-3">
                      <Card
                        className="gov-card-body card-gradient-2 clickable-card"
                        onClick={() => handleCardClick("vidhanSabha")}
                      >
                        <Card.Body className="gov-card-inner">
                          <div className="gov-icon">
                            <i className="bi bi-people"></i>
                            <p>विधानसभा (Vidhan Sabha)</p>
                          </div>
                          <div className="gov-text">
                            <h2>{counts.vidhanSabha}</h2>
                            <span className="card-trend">
                              {selectedFilter === "vidhanSabha"
                                ? "Showing Details"
                                : "Click to View"}
                            </span>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    {/* Vikas Khand Card */}
                    <Col lg={4} md={6} sm={12} className="mb-3">
                      <Card
                        className="gov-card-body card-gradient-3 clickable-card"
                        onClick={() => handleCardClick("vikasKhand")}
                      >
                        <Card.Body className="gov-card-inner">
                          <div className="gov-icon">
                            <i className="bi bi-globe"></i>
                            <p>विकासखंड (Vikas Khand)</p>
                          </div>
                          <div className="gov-text">
                            <h2>{counts.vikasKhand}</h2>
                            <span className="card-trend">
                              {selectedFilter === "vikasKhand"
                                ? "Showing Details"
                                : "Click to View"}
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
                          <Card.Header className="d-flex justify-content-between dashborad-card-header">

                            <h5>
                              {selectedFilter === "kendra" &&
                                "केंद्र (Kendra) Details"}
                              {selectedFilter === "vidhanSabha" &&
                                "विधानसभा (Vidhan Sabha) Details"}
                              {selectedFilter === "vikasKhand" &&
                                "विकासखंड (Vikas Khand) Details"}
                            </h5>

                                  <Button
                                    variant="success" className="view-details-btn"
                                    onClick={() =>
                                      handleSelectedCenters(selectedCenters)
                                    }
                                    disabled={selectedCenters.length === 0}
                                  >
                                   चयनित
                                  </Button>
                              
                          </Card.Header>
                          <Card.Body>
                            {loading && selectedFilter ? (
                              <div className="text-center">
                                <Spinner animation="border" />
                                <p className="mt-2">
                                  Loading {selectedFilter} data...
                                </p>
                              </div>
                            ) : error ? (
                              <div className="alert alert-danger">{error}</div>
                            ) : selectedFilter ? (
                              <div className="multiselect-container">
                              <Row>
  {availableCenters.length > 0 && (
    <Col md={6} className="unselected-details">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">
          उपलब्ध{" "}
          {selectedFilter === "kendra"
            ? "Centers"
            : selectedFilter === "vidhanSabha"
            ? "Vidhan Sabhas"
            : "Vikas Khands"}
        </h6>
        <Badge pill bg="transparent" text="primary" className="border border-primary">
          {availableCenters.length}
        </Badge>
      </div>
      <div className="mb-2">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => {
            setSelectedCenters([...selectedCenters, ...availableCenters]);
            setAvailableCenters([]);
          }}
        >
          सभी चुनें
        </Button>
      </div>
      <div className="multiselect-grid">
        {availableCenters.map((center, index) => (
          <div
            key={index}
            className="multiselect-item-grid"
            onClick={() => toggleCenterSelection(center)}
            style={{ cursor: "pointer" }}
          >
            {center}
          </div>
        ))}
      </div>
    </Col>
  )}

  <Col md={availableCenters.length > 0 ? 6 : 12} className="selected-details">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h6 className="mb-0">
        चयनित{" "}
        {selectedFilter === "kendra"
          ? "Centers"
          : selectedFilter === "vidhanSabha"
          ? "Vidhan Sabhas"
          : "Vikas Khands"}
      </h6>
      <Badge pill bg="transparent" text="primary" className="border border-primary">
        {selectedCenters.length}
      </Badge>
    </div>
    {selectedCenters.length > 0 && (
      <div className="mb-2">
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => {
            setAvailableCenters([...availableCenters, ...selectedCenters].sort());
            setSelectedCenters([]);
          }}
        >
          सभी हटाएं
        </Button>
      </div>
    )}
    <div className="multiselect-grid">
      {selectedCenters.map((center, index) => (
        <div
          key={index}
          className="multiselect-item-grid selected"
          onClick={() => toggleCenterSelection(center)}
          style={{ cursor: "pointer" }}
        >
          {center}
        </div>
      ))}
    </div>
  </Col>
</Row>
                              
                              </div>
                            ) : (
                              <p className="text-muted">
                                No data available for this category.
                              </p>
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
                                {selectedFilter === "kendra" &&
                                  "केंद्र मात्रा (Kendra Matra)"}
                                {selectedFilter === "vidhanSabha" &&
                                  "विधानसभा मात्रा (Vidhan Sabha Matra)"}
                                {selectedFilter === "vikasKhand" &&
                                  "विकासखंड मात्रा (Vikas Khand Matra)"}
                              </p>
                              <div className="graph-skeleton">
                                {graphData.length > 0 ? (
                                  <BarChart data={graphData} />
                                ) : (
                                  <div className="text-center text-muted">
                                    No data available
                                  </div>
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
      </Container>

      {/* Add custom styles for the grid layout */}
      <style jsx>{`
        .multiselect-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;

          padding: 10px;
          border: 1px solid #e9ecef;
          border-radius: 4px;
        }

      

        .multiselect-item-grid:hover {
          background-color: #e9ecef;
          transform: translateY(-2px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .multiselect-item-grid.selected {
          background-color: #007bff;
          color: white;
          border-color: #0056b3;
        }

        .multiselect-item-grid.selected:hover {
          background-color: #0069d9;
        }
      `}</style>
    </div>
  );
};

export default MainDashboard;
