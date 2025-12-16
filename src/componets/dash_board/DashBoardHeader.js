import React from "react";
import { Button, Dropdown } from "react-bootstrap";
import { FaBars, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import OIP from "../../assets/images/OIP.jpg";
import UkSasan from "../../assets/images/UkSasan.png";

function DashBoardHeader({ toggleSidebar, sidebarOpen }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="dashboard-header d-flex align-items-center justify-content-between p-2">
      <div className="d-flex align-items-center">
        <Button variant="light" onClick={toggleSidebar}>
          <FaBars />
        </Button>

        <div className="d-flex align-items-center ms-2">
            
          <img src={UkSasan} alt="logo" style={{ width: 50, marginRight: 5 }} />
        
          <img src={OIP} alt="logo" style={{ width: 50, marginRight: 10 }} />

          {/*  SHOW DASHBOARD TEXT ONLY WHEN SIDEBAR IS CLOSED */}
          {!sidebarOpen && (
            <p className="mb-0 govt-text">
              उद्यान एंव खाद्य प्रसंस्करण विभाग, उत्तराखण्ड
              <br />
              कार्यालय-उद्यान विशेषज्ञ कोटद्वार गढ़वाल
            </p>
          )}
        </div>
      </div>

      <Dropdown align="end">
        <Dropdown.Toggle variant="light">ADMIN</Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={handleLogout}>
            <FaSignOutAlt className="me-2" /> लॉगआउट करें
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </header>
  );
}

export default DashBoardHeader;
