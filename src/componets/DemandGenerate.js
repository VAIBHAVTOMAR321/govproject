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
import DemandNavigation from './DemandNavigation';

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
  const [validationError, setValidationError] = useState('');
  const [editingDemandByCenter, setEditingDemandByCenter] = useState(null); // For editing existing center demands

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

  // Custom onChange handler for real-time validation
  const handleDemandedQuantityChange = (e, maxQuantity) => {
    const value = parseFloat(e.target.value) || 0;
    const maxQty = parseFloat(maxQuantity) || 0;

    if (value > maxQty) {
      setValidationError(`मांगी गई मात्रा (${value}) DHO, कोटद्वार का कुल लक्ष्य (${maxQty}) से अधिक नहीं हो सकती`);
      return;
    }

    setValidationError('');
    setEditingQuantity(e.target.value);
  };

  /* 📤 POST demand-by-center */
  const handleSaveDemand = async (demandId, allocatedQuantity) => {
    if (!editingQuantity || parseFloat(editingQuantity) <= 0) {
      setValidationError('कृपया सही मात्रा दर्ज करें');
      return;
    }

    // Validate that demanded quantity is less than allocated quantity
    if (parseFloat(editingQuantity) > parseFloat(allocatedQuantity)) {
      setValidationError(`मांगी गई मात्रा DHO, कोटद्वार का कुल लक्ष्य (${allocatedQuantity}) से कम होनी चाहिए`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    setValidationError('');

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

  /* � PUT demand-by-center - Edit existing demand */
  const handleEditDemand = async (demandBycenterId, allocatedQuantity) => {
    if (!editingQuantity || parseFloat(editingQuantity) <= 0) {
      setValidationError('कृपया सही मात्रा दर्ज करें');
      return;
    }

    // Validate that demanded quantity is less than allocated quantity
    if (parseFloat(editingQuantity) > parseFloat(allocatedQuantity)) {
      setValidationError(`मांगी गई मात्रा DHO, कोटद्वार का कुल लक्ष्य (${allocatedQuantity}) से कम होनी चाहिए`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    setValidationError('');

    const payload = {
      id: demandBycenterId,
      demanded_quantity: parseFloat(editingQuantity)
    };

    try {
      const url = 'https://mahadevaaya.com/govbillingsystem/backend/api/demand-by-center/';
      
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();

      setSuccess('डिमांड सफलतापूर्वक अपडेट की गई');
      setEditingDemandByCenter(null);
      setEditingQuantity('');
      
      // Refresh the center demands after successful save
      await fetchCenterDemands();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('डिमांड अपडेट करने में त्रुटि');
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

  // Function to get the full demand-by-center record
  const getDemandBycentRecord = (demandId) => {
    return centerDemands.find(
      cd => cd.demand_id === demandId && cd.center_name === centerData.centerName
    );
  };

  // Start editing a demand
  const startEditing = (demandId) => {
    setEditingId(demandId);
    setEditingQuantity('');
    setValidationError('');
  };

  // Start editing an existing demand-by-center record
  const startEditingDemandByCenter = (record) => {
    setEditingDemandByCenter(record.id);
    setEditingQuantity(record.demanded_quantity);
    setValidationError('');
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditingQuantity('');
    setValidationError('');
    setEditingDemandByCenter(null);
  };

  // Calculate demanded amount (rate * demanded quantity)
  const calculateDemandedAmount = (rate, demandedQuantity) => {
    if (!rate || !demandedQuantity) return 0;
    return (parseFloat(rate) * parseFloat(demandedQuantity)).toFixed(2);
  };

  return (
    <Container fluid className="py-4">
      <DemandNavigation />
      <Row className="mb-3">
        <Col>
          <h4>डिमांड जनरेशन - {centerData.centerName}</h4>
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
                      <th>S.No.</th>
                      <th>उपनिवेश</th>
                      <th>DHO, कोटद्वार का कुल लक्ष्य</th>
                      <th>दर</th>
                      <th>राशि</th>
                      <th>मांगी गई मात्रा</th>
                      <th>कूल राशि</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demands.length > 0 ? (
                      demands.map((d, index) => {
                        const demandedQty = getDemandedQuantity(d.demand_id);
                        const isEditing = editingId === d.demand_id;
                        
                        // Calculate the temporary amount while editing
                        const tempAmount = isEditing && editingQuantity 
                          ? calculateDemandedAmount(d.rate, editingQuantity) 
                          : null;
                        
                        return (
                          <tr key={d.id}>
                            <td>{index + 1}</td>
                            <td>{d.sub_investment_name}</td>
                            <td>{d.allocated_quantity}</td>
                            <td>{d.rate}</td>
                            <td>{d.amount}</td>
                            <td>
                              {isEditing ? (
                                <div>
                                  <div className="d-flex align-items-center mb-2">
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      value={editingQuantity}
                                      onChange={(e) => handleDemandedQuantityChange(e, d.allocated_quantity)}
                                      placeholder="मात्रा दर्ज करें"
                                      className="me-2"
                                      isInvalid={!!validationError}
                                      max={d.allocated_quantity}
                                    />
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleSaveDemand(d.demand_id, d.allocated_quantity)}
                                      disabled={isSubmitting || !!validationError}
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
                                  {validationError && (
                                    <Form.Control.Feedback type="invalid" className="d-block">
                                      {validationError}
                                    </Form.Control.Feedback>
                                  )}
                                  <Form.Text className="text-muted">
                                    अधिकतम अनुमत मात्रा: {d.allocated_quantity}
                                  </Form.Text>
                                </div>
                              ) : (
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                  {demandedQty ? (
                                    <>
                                      {editingDemandByCenter === getDemandBycentRecord(d.demand_id)?.id ? (
                                        <div className="d-flex align-items-center gap-2 flex-wrap w-100">
                                          <Form.Control
                                            type="number"
                                            step="0.01"
                                            value={editingQuantity}
                                            onChange={(e) => handleDemandedQuantityChange(e, d.allocated_quantity)}
                                            placeholder="मात्रा दर्ज करें"
                                            isInvalid={!!validationError}
                                            max={d.allocated_quantity}
                                            style={{ width: '120px' }}
                                          />
                                          <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => handleEditDemand(getDemandBycentRecord(d.demand_id).id, d.allocated_quantity)}
                                            disabled={isSubmitting || !!validationError}
                                          >
                                            {isSubmitting ? <Spinner animation="border" size="sm" /> : '✓'}
                                          </Button>
                                          <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={cancelEditing}
                                          >
                                            ✕
                                          </Button>
                                          {validationError && (
                                            <Form.Control.Feedback type="invalid" className="d-block w-100">
                                              {validationError}
                                            </Form.Control.Feedback>
                                          )}
                                        </div>
                                      ) : (
                                        <>
                                          <span className="text-success fw-bold">{demandedQty}</span>
                                          <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => startEditingDemandByCenter(getDemandBycentRecord(d.demand_id))}
                                            title="संपादित करें"
                                          >
                                            ✎
                                          </Button>
                                        </>
                                      )}
                                    </>
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
                              {isEditing && tempAmount ? (
                                <span className="text-primary fw-bold">
                                  {tempAmount}
                                </span>
                              ) : demandedQty ? (
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