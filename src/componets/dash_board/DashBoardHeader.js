import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import UKSasan from "../../assets/images/UkSasan.png"
import "../../assets/css/topnavbar.css"
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function DashBoardHeader() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleKendraPasswordReset = () => {
    navigate('/kendra-password-reset');
  };

  const handleDemandView = () => {
    // Make sure this path matches exactly with your route definition
    navigate('/DemandView');
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary Dash-header" fixed="top">
      <Container fluid className=''>
        <Navbar.Brand href="#home">
          <div className='dash-img d-flex justify-content-between mx-2'>
            <Link to="/MainDashboard" ><img src={UKSasan} className='img-fluid'></img></Link>
            <p>DHO Kotdwar</p>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/MainDashboard">डैशबोर्ड</Nav.Link>
            <NavDropdown title="डेटा एंट्री" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/Registration">सप्लायर डेटा एंट्री</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/KrishiRegistration">
                कृषि डेटा एंट्री
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="बिल" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} to="/Billing">
                Billing
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/AllBills">
                AllBills
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="डिमांड" id="demand-nav-dropdown">
              <NavDropdown.Item as={Link} to="/DemandView">
                डिमांड देखें
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/MPR">एमपीआर</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            <NavDropdown title="खाता" id="account-nav-dropdown" align="end">
              <NavDropdown.Item onClick={handleKendraPasswordReset}>
                केंद्र पासवर्ड रीसेट
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                लॉगआउट
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default DashBoardHeader;