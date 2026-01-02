import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import UKSasan from "../../assets/images/UkSasan.png"
import "../../assets/css/topnavbar.css"

function DashBoardHeader() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary Dash-header" fixed="top">
      <Container fluid className=''>
        <Navbar.Brand href="#home">
          <div className='dash-img'>
          <img src={UKSasan} className='img-fluid'></img>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="MainDashboard">डैशबोर्ड</Nav.Link>
             <NavDropdown title="डेटा एंट्री" id="basic-nav-dropdown">
              <NavDropdown.Item href="Registration">सप्लायर डेटा एंट्री</NavDropdown.Item>
              <NavDropdown.Item href="KrishiRegistration">
              कृषि डेटा एंट्री
              </NavDropdown.Item>
                
            </NavDropdown>
            <NavDropdown title="बिल" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">बिलिंग</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
              Billing
              </NavDropdown.Item>
               <NavDropdown.Item href="#action/3.2">
              AllBills
              </NavDropdown.Item>
              
            </NavDropdown>
            <Nav.Link href="/MPR">एमपीआर</Nav.Link>
             <Nav.Link href="/AddEditComponent">घटक जोड़ें/संपादित करें</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default DashBoardHeader;