import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Alert,
  Spinner,
  InputGroup
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCenter } from './all_login/CenterContext';
import { useAuth } from '../context/AuthContext';
import { RiAddLine } from 'react-icons/ri';

const DemandGenerate = () => {
  const navigate = useNavigate();
  const { centerData, clearCenter } = useCenter();
  const { logout } = useAuth();

  const [demands, setDemands] = useState([]);
  const [centerDemands, setCenterDemands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [centerLoading, setCenterLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for inline editing
  const [editingId, setEditingId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* 🔐 Auth check */
  useEffect(() => {
    if (!centerData.isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [centerData.isLoggedIn, navigate]);

  /* 📥 GET demand-generation */
  const fetchDemands = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        'https://mahadevaaya.com/govbillingsystem/backend/api/demand-generation/'
      );
      if (!res.ok) throw new Error();

      const data = await res.json();
      setDemands(data);
    } catch {
      setError('डिमांड लाने में त्रुटि');
    } finally {
      setLoading(false);
    }
  };

  /* 📥 GET demand-by-center */
  const fetchCenterDemands = async () => {
    setCenterLoading(true);
    try {
      const res = await fetch(
        'https://mahadevaaya.com/govbillingsystem/backend/api/demand-by-center/'
      );
      if (!res.ok) throw new Error();

      const data = await res.json();
      setCenterDemands(data);
    } catch {
      console.error('सेंटर डिमांड लाने में त्रुटि');
    } finally {
      setCenterLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
    fetchCenterDemands();
  }, []);

  /* 📤 POST demand-by-center */
  const handleSaveDemand = async (demandId) => {
    if (!editingQuantity || parseFloat(editingQuantity) <= 0) {
      setError('कृपया सही मात्रा दर्ज करें');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    const payload = {
      demand_id: demandId,
      center_name: centerData.centerName,
      demanded_quantity: parseFloat(editingQuantity)
    };

    try {
      const url = 'https://mahadevaaya.com/govbillingsystem/backend/api/demand-by-center/';
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();

      setSuccess('डिमांड सफलतापूर्वक सेव की गई');
      setEditingId(null);
      setEditingQuantity('');
      
      // Refresh the center demands after successful save
      await fetchCenterDemands();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('डिमांड सेव करने में त्रुटि');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* 🚪 Logout */
  const handleLogout = () => {
    clearCenter();
    logout();
    navigate('/', { replace: true });
  };

  // Function to get demanded quantity for a specific demand_id
  const getDemandedQuantity = (demandId) => {
    const centerDemand = centerDemands.find(
      cd => cd.demand_id === demandId && cd.center_name === centerData.centerName
    );
    return centerDemand ? centerDemand.demanded_quantity : null;
  };

  // Start editing a demand
  const startEditing = (demandId) => {
    setEditingId(demandId);
    setEditingQuantity('');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditingQuantity('');
  };

  // Calculate demanded amount (rate * demanded quantity)
  const calculateDemandedAmount = (rate, demandedQuantity) => {
    if (!rate || !demandedQuantity) return 0;
    return (parseFloat(rate) * parseFloat(demandedQuantity)).toFixed(2);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-3">
        <Col className="d-flex justify-content-between align-items-center">
          <h4>डिमांड जनरेशन - {centerData.centerName}</h4>
          <Button variant="danger" onClick={handleLogout}>लॉगआउट</Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* 📋 Demand List */}
      <Row>
        <Col>
          <Card>
            <Card.Header>सभी डिमांड</Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center"><Spinner animation="border" /></div>
              ) : (
                <Table bordered striped hover responsive>
                  <thead>
                    <tr>
                      <th>Demand ID</th>
                      <th>उपनिवेश</th>
                      <th>आवंटित मात्रा</th>
                      <th>दर</th>
                      <th>राशि</th>
                      <th>मांगी गई मात्रा</th>
                      <th>कूल राशि</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demands.length > 0 ? (
                      demands.map(d => {
                        const demandedQty = getDemandedQuantity(d.demand_id);
                        const isEditing = editingId === d.demand_id;
                        
                        return (
                          <tr key={d.id}>
                            <td>{d.demand_id}</td>
                            <td>{d.sub_investment_name}</td>
                            <td>{d.allocated_quantity}</td>
                            <td>{d.rate}</td>
                            <td>{d.amount}</td>
                            <td>
                              {isEditing ? (
                                <div className="d-flex align-items-center">
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={editingQuantity}
                                    onChange={(e) => setEditingQuantity(e.target.value)}
                                    placeholder="मात्रा दर्ज करें"
                                    className="me-2"
                                  />
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleSaveDemand(d.demand_id)}
                                    disabled={isSubmitting}
                                  >
                                    {isSubmitting ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      <>सबमिट <RiAddLine /></>
                                    )}
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={cancelEditing}
                                    className="ms-1"
                                  >
                                    रद्द करें
                                  </Button>
                                </div>
                              ) : (
                                <div className="d-flex align-items-center">
                                  {demandedQty ? (
                                    <span className="text-success fw-bold">{demandedQty}</span>
                                  ) : (
                                    <>
                                      <span className="text-muted me-2">-</span>
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => startEditing(d.demand_id)}
                                      >
                                        <RiAddLine />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                            </td>
                            <td>
                              {demandedQty ? (
                                <span className="text-info fw-bold">
                                  {calculateDemandedAmount(d.rate, demandedQty)}
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">कोई डाटा नहीं</td>
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