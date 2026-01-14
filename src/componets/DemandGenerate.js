import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCenter } from './all_login/CenterContext';

const DemandGenerate = () => {
  const navigate = useNavigate();
  const { centerData, clearCenter } = useCenter(); // Use CenterContext instead of localStorage
  const [demandData, setDemandData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    item_name: '',
    quantity: '',
    unit: '',
    purpose: '',
    demand_date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  });

  // Check if user is logged in
  useEffect(() => {
    if (!centerData.isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [centerData.isLoggedIn, navigate]);

  // Fetch demand data when centerId is available
  useEffect(() => {
    if (centerData.centerId) {
      fetchDemandData();
    }
  }, [centerData.centerId]);

  const fetchDemandData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`https://mahadevaaya.com/govbillingsystem/backend/api/demand/${centerData.centerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch demand data');
      }
      
      const data = await response.json();
      setDemandData(data);
    } catch (err) {
      console.error('Error fetching demand data:', err);
      setError('डेटा लाने में त्रुटि। कृपया बाद में पुन: प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://mahadevaaya.com/govbillingsystem/backend/api/demand/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          center_id: centerData.centerId,
          ...formData
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit demand');
      }
      
      // Reset form and refresh data
      setFormData({
        item_name: '',
        quantity: '',
        unit: '',
        purpose: '',
        demand_date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false);
      fetchDemandData();
    } catch (err) {
      console.error('Error submitting demand:', err);
      setError('डिमांड सबमिट करने में त्रुटि। कृपया बाद में पुन: प्रयास करें।');
    }
  };

  const handleLogout = () => {
    clearCenter(); // Clear context data
    navigate('/', { replace: true });
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>डिमांड जनरेट - {centerData.centerName}</h2>
            <Button variant="danger" onClick={handleLogout}>लॉगआउट</Button>
          </div>
        </Col>
      </Row>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">डिमांड रिकॉर्ड्स</h5>
              <Button 
                variant="primary" 
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? 'फॉर्म छिपाएं' : 'नई डिमांड जोड़ें'}
              </Button>
            </Card.Header>
            <Card.Body>
              {showForm && (
                <Form onSubmit={handleSubmit} className="mb-4">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>आइटम का नाम</Form.Label>
                        <Form.Control
                          type="text"
                          name="item_name"
                          value={formData.item_name}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>मात्रा</Form.Label>
                        <Form.Control
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>इकाई</Form.Label>
                        <Form.Control
                          type="text"
                          name="unit"
                          value={formData.unit}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>उद्देश्य</Form.Label>
                        <Form.Control
                          type="text"
                          name="purpose"
                          value={formData.purpose}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>डिमांड दिनांक</Form.Label>
                        <Form.Control
                          type="date"
                          name="demand_date"
                          value={formData.demand_date}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="text-end">
                    <Button variant="secondary" className="me-2" onClick={() => setShowForm(false)}>
                      रद्द करें
                    </Button>
                    <Button type="submit" variant="primary">
                      सबमिट करें
                    </Button>
                  </div>
                </Form>
              )}
              
              {isLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">लोड हो रहा है...</span>
                  </Spinner>
                </div>
              ) : (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>आइटम का नाम</th>
                      <th>मात्रा</th>
                      <th>इकाई</th>
                      <th>उद्देश्य</th>
                      <th>डिमांड दिनांक</th>
                      <th>स्थिति</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandData.length > 0 ? (
                      demandData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.item_name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unit}</td>
                          <td>{item.purpose}</td>
                          <td>{new Date(item.demand_date).toLocaleDateString('hi-IN')}</td>
                          <td>
                            <span className={`badge bg-${item.status === 'approved' ? 'success' : item.status === 'pending' ? 'warning' : 'danger'}`}>
                              {item.status === 'approved' ? 'स्वीकृत' : item.status === 'pending' ? 'लंबित' : 'अस्वीकृत'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">कोई डिमांड रिकॉर्ड नहीं मिला</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DemandGenerate;