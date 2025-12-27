import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col, Table, Tabs, Tab } from "react-bootstrap";
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
  
  // Form state for single entry
  const [formData, setFormData] = useState({
    farmer_name: "",
    father_name: "",
    address: "",
    block_name: "",
    assembly_name: "",
    center_name: "",
    supplied_item_name: "",
    unit: "",
    quantity: "",
    rate: "",
    amount: 0,
    aadhaar_number: "",
    bank_account_number: "",
    ifsc_code: "",
    mobile_number: "",
    category: "",
    scheme_name: ""
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
                  <Col lg={3} md={6} sm={12} className="mb-3">
                    <div className="gov-card-body card-gradient-1">
                      <div className="gov-card-inner">
                        <div className="gov-icon">
                          <i className="bi bi-bar-chart-fill"></i>
                          <p>Total Records</p>
                        </div>
                        <div className="gov-text">
                          <h2>120</h2>
                        </div>
                      </div>
                    </div>
                  </Col>
                 
                </Row>
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