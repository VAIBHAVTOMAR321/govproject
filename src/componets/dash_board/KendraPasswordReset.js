import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const KendraPasswordReset = () => {
  const navigate = useNavigate();
  const [kendraList, setKendraList] = useState([]);
  const [selectedKendraId, setSelectedKendraId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // Fetch kendra list on component mount
  useEffect(() => {
    const fetchKendraList = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await axios.get('https://mahadevaaya.com/govbillingsystem/backend/api/reguser-list/');
        setKendraList(response.data);
        setFetching(false);
      } catch (error) {
        console.error('Error fetching kendra list:', error);
        setMessage({ 
          type: 'danger', 
          text: 'Failed to fetch kendra list. Please try again.' 
        });
        setFetching(false);
      }
    };

    fetchKendraList();
  }, []);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedKendraId) {
      newErrors.kendra = 'Please select a kendra';
    }
    
    if (!newPassword) {
      newErrors.password = 'Please enter a new password';
    } else if (newPassword.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Replace with your actual API endpoint
      const response = await axios.put('https://mahadevaaya.com/govbillingsystem/backend/api/center-password-change/', {
        user_id: selectedKendraId,
        password: newPassword
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Password reset successfully!' 
      });
      
      // Reset form
      setSelectedKendraId('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      
      // Optional: Navigate back after successful reset
      // setTimeout(() => navigate('/MainDashboard'), 2000);
      
    } catch (error) {
      console.error('Error resetting password:', error);
      setMessage({ 
        type: 'danger', 
        text: error.response?.data?.message || 'Failed to reset password. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">केंद्र पासवर्ड रीसेट</h4>
            </div>
            <div className="card-body">
              {message.text && (
                <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
                  {message.text}
                </Alert>
              )}
              
              {fetching ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="kendraSelect">
                    <Form.Label>केंद्र चुनें (Select Kendra)</Form.Label>
                    <Form.Select
                      value={selectedKendraId}
                      onChange={(e) => setSelectedKendraId(e.target.value)}
                      isInvalid={!!errors.kendra}
                    >
                      <option value="">-- केंद्र चुनें --</option>
                      {kendraList.map((kendra) => (
                        <option key={kendra.user_id} value={kendra.user_id}>
                          {kendra.username} 
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.kendra}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3" controlId="newPassword">
                    <Form.Label>नया पासवर्ड (New Password)</Form.Label>
                    <Form.Control
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      isInvalid={!!errors.password}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-3" controlId="confirmPassword">
                    <Form.Label>पासवर्ड की पुष्टि करें (Confirm Password)</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      isInvalid={!!errors.confirmPassword}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                          <span className="visually-hidden">Loading...</span>
                        </>
                      ) : (
                        'पासवर्ड रीसेट करें (Reset Password)'
                      )}
                    </Button>
                  </div>
                </Form>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default KendraPasswordReset;