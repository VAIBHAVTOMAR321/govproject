import React, { useEffect, useState } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom"; 
import { useAuth } from "../../context/AuthContext"; 
import UkSasan from "../../assets/images/UkSasan.png"
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaChartBar,
  FaUserPlus,
  FaFileInvoice,
  FaFileInvoiceDollar,
  FaListAlt,
  FaClipboardList,
  FaPuzzlePiece,
  
} from "react-icons/fa";
import { FaFilter  } from "react-icons/fa6";
import "../../assets/css/dashboard.css";

const LeftNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet }) => {
  const { logout } = useAuth(); // 3. GET THE logout FUNCTION FROM CONTEXT
  const navigate = useNavigate(); // 4. GET THE navigate FUNCTION
  const [userRole, ] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  // 5. CREATE A SINGLE, CENTRALIZED LOGOUT HANDLER
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    {
      icon: <FaTachometerAlt />,
      label: "डैशबोर्ड",
      path: "/MainDashboard",
      active: true,
    },
    {
      icon: <FaUserPlus />,
      label: "पंजीकरण",
      path: "/Registration",
    },
    // {
    //   icon: <FaFilter  />,
    //   label: "फिल्टर",
    //   path: "/Dashboard",
    // },
    //  {
    //   icon: <FaChartBar />,
    //   label: "ग्राफ / पंजीकरण",
    //   submenu: [
    //     {
    //       label: "ग्राफ",
    //       path: "/Graph",
    //       icon: <FaChartBar />,
    //     },
    //     {
    //       label: "पंजीकरण",
    //       path: "/Registration",
    //       icon: <FaUserPlus />,
    //     },
    //   ],
    // },
    
    {
      icon: <FaFileInvoiceDollar />,
      label: "बिल",
      submenu: [
        {
          label: "बिलिंग",
          path: "/Billing",
          icon: <FaFileInvoice />,
        },
        {
          label: "सभी बिल",
          path: "/AllBills",
          icon: <FaListAlt />,
        },
      ],
    },
    {
      icon: <FaClipboardList />,
      label: "एमपीआर",
      path: "/MPR",
      
    },
    {
      icon: <FaPuzzlePiece />,
      label: "घटक जोड़ें/संपादित करें",
      path: "/AddEditComponent",
      
    },
   
  ];

  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  }, [isMobile, isTablet, setSidebarOpen]);

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo ">
            <span className="logo-text"><img src={UkSasan} alt="text" className="uk-logo"></img></span>
            {sidebarOpen && <p>उद्यान एंव खाद्य प्रसंस्करण विभाग, उत्तराखण्ड
कार्यालय-उद्यान विशेषज्ञ कोटद्वार गढ़वाल</p>}
            </div>
          </div>
        </div>

        <Nav className="sidebar-nav flex-column">
          {menuItems
            .filter(item =>
              item.allowedRoles ? item.allowedRoles.includes(userRole) : true
            )
            .map((item, index) => (
              <div key={index}>
                {item.submenu ? (
                  <Nav.Link
                    className={`nav-item ${item.active ? "active" : ""}`}
                    onClick={() => toggleSubmenu(index)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.label}</span>
                    <span className="submenu-arrow">
                      {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                  </Nav.Link>
                ) : (
                  <Link
                    to={item.path}
                    className={`nav-item nav-link ${item.active ? "active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.label}</span>
                  </Link>
                )}

                {item.submenu && (
                  <Collapse in={openSubmenu === index}>
                    <div className="submenu-container">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className="submenu-item nav-link"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="submenu-icon">{subItem.icon}</span>
                          <span className="nav-text br-text-sub">{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  </Collapse>
                )}
              </div>
            ))}
        </Nav>

        {/* --- UPDATED DESKTOP LOGOUT --- */}
        <div className="sidebar-footer">
          <Nav.Link
            className="nav-item logout-btn"
            onClick={handleLogout} // Use the centralized handler
          >
            <span className="nav-icon">
              <FaSignOutAlt />
            </span>
            <span className="nav-text">लॉगआउट</span>
          </Nav.Link>
        </div>
      </div>

      {/* Mobile / Tablet Sidebar (Offcanvas) */}
      <Offcanvas
        show={(isMobile || isTablet) && sidebarOpen}
        onHide={() => setSidebarOpen(false)}
        className="mobile-sidebar"
        placement="start"
        backdrop={true}
        scroll={false}
        enforceFocus={false}
      >
        <Offcanvas.Header closeButton className="br-offcanvas-header">
          <Offcanvas.Title className="br-off-title">मेनू</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="br-offcanvas">
          <Nav className="flex-column">
            {menuItems.map((item, index) => (
              <div key={index}>
                {item.submenu ? (
                  <Nav.Link
                    className={`nav-item ${item.active ? "active" : ""}`}
                    onClick={() => toggleSubmenu(index)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text br-nav-text-mob">{item.label}</span>
                    <span className="submenu-arrow">
                      {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                  </Nav.Link>
                ) : (
                  <Link
                    to={item.path}
                    className={`nav-item nav-link ${item.active ? "active" : ""}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text br-nav-text-mob">{item.label}</span>
                  </Link>
                )}

                {item.submenu && (
                  <Collapse in={openSubmenu === index}>
                    <div className="submenu-container">
                      {item.submenu.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          className="submenu-item nav-link"
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="submenu-icon">{subItem.icon}</span>
                          <span className="nav-text">{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  </Collapse>
                )}
              </div>
            ))}
          </Nav>

          {/* --- ADDED MOBILE/TABLET LOGOUT --- */}
          <div className="offcanvas-footer mt-auto">
             <Nav.Link
                className="nav-item logout-btn"
                onClick={handleLogout} // Use the same centralized handler
              >
                <span className="nav-icon">
                  <FaSignOutAlt />
                </span>
                <span className="nav-text">लॉगआउट</span>
              </Nav.Link>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default LeftNav;