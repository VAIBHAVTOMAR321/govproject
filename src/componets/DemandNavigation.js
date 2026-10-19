import React, { useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import UKSasan from "../assets/images/UkSasan.png";
import "../assets/css/topnavbar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCenter } from "./all_login/CenterContext";

const DemandNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { clearCenter } = useCenter();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    clearCenter();
    logout();
    navigate("/", { replace: true });
    setExpanded(false);
  };

  const go = (path) => {
    navigate(path);
    setExpanded(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar expand="lg" className="bg-body-tertiary Dash-header" fixed="top" expanded={expanded} onToggle={setExpanded}>
      <Container fluid>
        <Navbar.Brand href="#home">
          <div className="dash-img d-flex justify-content-between mx-2">
            <img src={UKSasan} className="img-fluid" alt="UK Sasan" />
            <p>CENTER PANEL</p>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* Standalone Link */}
            <Nav.Link
              active={isActive("/DemandGenerate")}
              onClick={() => go("/DemandGenerate")}
              style={{
                fontWeight: isActive("/DemandGenerate") ? "bold" : "normal",
              }}
            >
              डिमांड जनरेशन
            </Nav.Link>

            {/* First Dropdown: एंट्री */}
            <NavDropdown
              title="एंट्री"
              id="entry-nav-dropdown"
              style={{
                fontWeight:
                  isActive("/DemandGenerate/CenterwiseEntry") ||
                  isActive("/DemandGenerate/KrishiwiseEntry")
                    ? "bold"
                    : "normal",
              }}
            >
              <NavDropdown.Item
                active={isActive("/DemandGenerate/CenterwiseEntry")}
                onClick={() => go("/DemandGenerate/CenterwiseEntry")}
                style={{
                  fontWeight: isActive("/DemandGenerate/CenterwiseEntry")
                    ? "bold"
                    : "normal",
                }}
              >
                सेंटरवाइज एंट्री
              </NavDropdown.Item>
              <NavDropdown.Item
                active={isActive("/DemandGenerate/KrishiwiseEntry")}
                onClick={() => go("/DemandGenerate/KrishiwiseEntry")}
                style={{
                  fontWeight: isActive("/DemandGenerate/KrishiwiseEntry")
                    ? "bold"
                    : "normal",
                }}
              >
                कृषिवाइज एंट्री
              </NavDropdown.Item>
            </NavDropdown>

            {/* Second Dropdown: सेवाएं (Services) */}
            <NavDropdown
              title="सेवाएं"
              id="services-nav-dropdown"
              style={{
                fontWeight:
                  isActive("/CenterUdyanBill") ||
                  isActive("/GetViewLibrary") ||
                  isActive("/MonthAttendance") ||
                  isActive("/VetanMang")
                    ? "bold"
                    : "normal",
              }}
            >
               <NavDropdown.Item
                active={isActive("/GetViewLibrary")}
                onClick={() => go("/VirtanKishanBeej")}
                style={{
                  fontWeight: isActive("/VirtanKishanBeej") ? "bold" : "normal",
                }}
              >
                वितरन किसान बीज
              </NavDropdown.Item>
              <NavDropdown.Item
                active={isActive("/CenterUdyanBill")}
                onClick={() => go("/CenterUdyanBill")}
                style={{
                  fontWeight: isActive("/CenterUdyanBill") ? "bold" : "normal",
                }}
              >
                उद्यान बिल
              </NavDropdown.Item>
              <NavDropdown.Item
                active={isActive("/GetViewLibrary")}
                onClick={() => go("/GetViewLibrary")}
                style={{
                  fontWeight: isActive("/GetViewLibrary") ? "bold" : "normal",
                }}
              >
                लाइब्रेरी
              </NavDropdown.Item>
            
              <NavDropdown.Item
                active={isActive("/VetanMang")}
                onClick={() => go("/VetanMang")}
                style={{
                  fontWeight: isActive("/VetanMang") ? "bold" : "normal",
                }}
              >
                वेतन मांग पत्र
              </NavDropdown.Item>
            </NavDropdown>

            {/* New Dropdown: किसान आवेदन (KisanAvedan) */}
            <NavDropdown
              title="किसान आवेदन"
              id="kisanavedan-nav-dropdown"
              style={{
                fontWeight:
                  isActive("/KisanAvedan") ||
                  isActive("/KisanAavedanPortal")
                    ? "bold"
                    : "normal",
              }}
            >
              <NavDropdown.Item
                active={isActive("/KisanAvedan")}
                onClick={() => go("/KisanAvedan")}
                style={{
                  fontWeight: isActive("/KisanAvedan") ? "bold" : "normal",
                }}
              >
                वर्मी (Vermi)
              </NavDropdown.Item>
              <NavDropdown.Item
                active={isActive("/KisanAavedanPortal")}
                onClick={() => go("/KisanAavedanPortal")}
                style={{
                  fontWeight: isActive("/KisanAavedanPortal") ? "bold" : "normal",
                }}
              >
                फेंसिंग (Fencing)
              </NavDropdown.Item>
                <NavDropdown.Item
                active={isActive("/DragfruitsAndKiwi")}
                onClick={() => go("/DragfruitsAndKiwi")}
                style={{
                  fontWeight: isActive("/DragfruitsAndKiwi") ? "bold" : "normal",
                }}
              >
              ड्रैगन फ्रूट (Dragonfruit)
              </NavDropdown.Item>
                <NavDropdown.Item
                active={isActive("/KiwiFruits")}
                onClick={() => go("/KiwiFruits")}
                style={{
                  fontWeight: isActive("/KiwiFruits") ? "bold" : "normal",
                }}
              >
               कीवी (Kiwi)
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>

          {/* Account Dropdown */}
          <Nav className="ms-auto">
            <NavDropdown title="खाता" id="account-nav-dropdown" align="end">
              <NavDropdown.Item onClick={handleLogout}>लॉगआउट</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default DemandNavigation;