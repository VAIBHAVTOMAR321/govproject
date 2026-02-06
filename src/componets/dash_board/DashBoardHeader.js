import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import UKSasan from "../../assets/images/UkSasan.png"
import "../../assets/css/topnavbar.css"
import { Link, useNavigate, useLocation } from 'react-router-dom'; // 1. Import useLocation
import { useAuth } from '../../context/AuthContext';

function DashBoardHeader() {
  const navigate = useNavigate();
  const location = useLocation(); // 2. Get the current location
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleKendraPasswordReset = () => {
    navigate('/KendraPasswordReset');
  };

  const handleDemandView = () => {
    navigate('/DemandView', { replace: true });
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary Dash-header" fixed="top">
      <Container fluid className=''>
        <Navbar.Brand href="#home">
          <div className='dash-img d-flex justify-content-between mx-2'>
            <Link to="/Dashboard" ><img src={UKSasan} className='img-fluid'></img></Link>
            <p>DHO Kotdwar</p>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* 3. Add the 'active' prop */}
            <Nav.Link as={Link} to="/Dashboard" active={location.pathname === '/Dashboard'}>होम</Nav.Link>
            <Nav.Link as={Link} to="/MainDashboard" active={location.pathname === '/MainDashboard'}>डैशबोर्ड</Nav.Link>
            
            {/* 4. For dropdowns, check if the current path is one of its children */}
            <NavDropdown 
              title="डेटा एंट्री" 
              id="basic-nav-dropdown"
              active={location.pathname === '/Registration' || location.pathname === '/KrishiRegistration'}
            >
              <NavDropdown.Item as={Link} to="/Registration" active={location.pathname === '/Registration'}>
                केंद्रवार एंट्री
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/KrishiRegistration" active={location.pathname === '/KrishiRegistration'}>
                कृषि डेटा एंट्री
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown 
              title="बिल" 
              id="bill-nav-dropdown"
              active={location.pathname === '/Billing' || location.pathname === '/AllBills'}
            >
              <NavDropdown.Item as={Link} to="/Billing" active={location.pathname === '/Billing'}>
                Billing
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/AllBills" active={location.pathname === '/AllBills'}>
                AllBills
              </NavDropdown.Item>
            </NavDropdown>

            <NavDropdown 
              title="डिमांड" 
              id="demand-nav-dropdown"
              active={location.pathname === '/DemandView'}
            >
              <NavDropdown.Item as={Link} to="/DemandView" active={location.pathname === '/DemandView'}>
                डिमांड देखें
              </NavDropdown.Item>
            </NavDropdown>
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