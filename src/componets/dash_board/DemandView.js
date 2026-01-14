import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCenter } from '../all_login/CenterContext';
import { useAuth } from '../../context/AuthContext';
import DashBoardHeader from './DashBoardHeader';

const DemandView = () => {
  const navigate = useNavigate();
  const { centerData, clearCenter } = useCenter();
  const { logout } = useAuth();
  const [demandData, setDemandData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
 
  
  // Fetch demand data
  useEffect(() => {
    fetchDemandData();
  }, []);
 
  const fetchDemandData = async () => {
    setIsLoading(true);
    setError('');
   
    try {
      const response = await fetch('https://mahadevaaya.com/govbillingsystem/backend/api/demand-generation/');
     
      if (!response.ok) {
        throw new Error('Failed to fetch demand data');
      }
     
      const data = await response.json();
      setDemandData(data);
      setFilteredData(data);
     
      // Extract unique centers for filter
      const uniqueCenters = [...new Set(data.map(item => item.center_name))];
      setCenters(uniqueCenters);
    } catch (err) {
      console.error('Error fetching demand data:', err);
      setError('डेटा लाने में त्रुटि। कृपया बाद में पुन: प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleCenterFilter = (centerName) => {
    setSelectedCenter(centerName);
    if (centerName === '') {
      setFilteredData(demandData);
    } else {
      setFilteredData(demandData.filter(item => item.center_name === centerName));
    }
  };
 
  const handleLogout = () => {
    clearCenter();
    logout();
    navigate('/', { replace: true });
  };
 
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
 
  return (
    <>
    <DashBoardHeader />
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>डिमांड व्यू - {centerData.centerName}</h2>
            <Button variant="danger" onClick={handleLogout}>लॉगआउट</Button>
          </div>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">डिमांड रिकॉर्ड्स</h5>
              <Form.Group className="mb-0" controlId="centerFilter">
                <Form.Select
                  value={selectedCenter}
                  onChange={(e) => handleCenterFilter(e.target.value)}
                  style={{ width: '200px' }}
                >
                  <option value="">सभी केंद्र</option>
                  {centers.map((center, index) => (
                    <option key={index} value={center}>{center}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Card.Header>
            <Card.Body>
              {isLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">लोड हो रहा है...</span>
                  </Spinner>
                </div>
              ) : (
                <>
                  {filteredData.length > 0 ? (
                    <Table striped bordered hover responsive size="sm">
                      <thead>
                        <tr>
                         
                          <th>केंद्र नाम</th>
                          <th>तिथि</th>
                          <th>उत्पाद और मात्रा</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((demand, index) => (
                          <tr key={demand.id}>
                           
                            <td>{demand.center_name}</td>
                            <td>{formatDate(demand.created_at)}</td>
                            <td>
                              <Table striped bordered hover responsive size="sm">
                                <thead>
                                  <tr>
                                    <th>उत्पाद</th>
                                    <th>मात्रा</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {demand.demand_list.map((item, itemIndex) => (
                                    <tr key={itemIndex}>
                                      <td>{item[0]}</td>
                                      <td>{item[1]}</td>
                                    </tr>
                                  ))}
                                  <tr>
                                    <td><strong>Total</strong></td>
                                    <td><strong>{demand.demand_list.reduce((total, item) => total + parseInt(item[1]), 0)}</strong></td>
                                  </tr>
                                </tbody>
                              </Table>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p>कोई डिमांड रिकॉर्ड नहीं मिला</p>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
    </>
  );
};

export default DemandView