import React from "react";
import { Container, Row, Col, Button, Dropdown } from "react-bootstrap";
import { FaBars, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import OIP from "../../assets/images/OIP.jpg";
import UkSasan from "../../assets/images/UkSasan.png"

// Add sidebarOpen to the props being destructured
function DashBoardHeader({ toggleSidebar, sidebarOpen }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="dashboard-header">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="auto">
            <Button variant="light" className="sidebar-toggle" onClick={toggleSidebar}>
              <FaBars />
            </Button>
          </Col>
          <Col>
          <div className="logo-container">
            <div className="logo ">
              <span className="logo-text"><img src={UkSasan} alt="text" className="uk-logo"></img></span>
            <span className="logo-text"><img src={OIP} alt="text" className="uk-logo"></img></span>
            {sidebarOpen && <p>उद्यान एंव खाद्य प्रसंस्करण विभाग, उत्तराखण्ड
कार्यालय-उद्यान विशेषज्ञ कोटद्वार गढ़वाल</p>}
            </div>
          </div>
          </Col>
          <Col xs="auto">
            <div className="header-actions">
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-basic">
                  ADMIN
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> लॉगआउट करें
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
        </Row>
      </Container>
    </header>
  );
}

export default DashBoardHeader;