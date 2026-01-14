import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCenter } from './all_login/CenterContext';
import { useAuth } from '../context/AuthContext';

const DemandGenerate = () => {
  const navigate = useNavigate();
  const { centerData, clearCenter } = useCenter(); // Use CenterContext
  const { logout } = useAuth(); // Use AuthContext to logout
  const [billingData, setBillingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantities, setQuantities] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);

  // Check if user is logged in
  useEffect(() => {
    if (!centerData.isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [centerData.isLoggedIn, navigate]);

  // Fetch billing data
  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch billing data');
      }
      
      const data = await response.json();
      setBillingData(data);
      
      // Process data to get unique investment names with their sub-investments
      const uniqueInvestments = {};
      data.forEach(item => {
        if (!uniqueInvestments[item.investment_name]) {
          uniqueInvestments[item.investment_name] = [];
        }
        
        // Check if sub-investment already exists for this investment
        const subInvestmentExists = uniqueInvestments[item.investment_name].some(
          subItem => subItem.sub_investment_name === item.sub_investment_name
        );
        
        if (!subInvestmentExists) {
          uniqueInvestments[item.investment_name].push({
            sub_investment_name: item.sub_investment_name,
            rate: parseFloat(item.rate),
            unit: item.unit
          });
        }
      });
      
      // Convert to array format for rendering
      const processedData = Object.keys(uniqueInvestments).map(investmentName => ({
        investment_name: investmentName,
        sub_investments: uniqueInvestments[investmentName]
      }));
      
      setFilteredData(processedData);
      
      // Initialize quantities object
      const initialQuantities = {};
      processedData.forEach(investment => {
        investment.sub_investments.forEach(subInvestment => {
          initialQuantities[`${investment.investment_name}-${subInvestment.sub_investment_name}`] = 0;
        });
      });
      setQuantities(initialQuantities);
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError('डेटा लाने में त्रुटि। कृपया बाद में पुन: प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (investmentName, subInvestmentName, rate, value) => {
    const key = `${investmentName}-${subInvestmentName}`;
    const newQuantities = { ...quantities, [key]: parseFloat(value) || 0 };
    setQuantities(newQuantities);
    
    // Calculate total amount
    let total = 0;
    filteredData.forEach(investment => {
      investment.sub_investments.forEach(subInvestment => {
        const quantityKey = `${investment.investment_name}-${subInvestment.sub_investment_name}`;
        total += (newQuantities[quantityKey] || 0) * subInvestment.rate;
      });
    });
    setTotalAmount(total);
  };

  const handleSubmit = async () => {
    // Prepare demand list in the required format: [["product 1","5454"]]
    const demandList = [];
    filteredData.forEach(investment => {
      investment.sub_investments.forEach(subInvestment => {
        const quantityKey = `${investment.investment_name}-${subInvestment.sub_investment_name}`;
        const quantity = quantities[quantityKey] || 0;
        if (quantity > 0) {
          // Using sub_investment_name as the product name
          demandList.push([subInvestment.sub_investment_name, quantity.toString()]);
        }
      });
    });
    
    if (demandList.length === 0) {
      setError('कृपया कम से कम एक उत्पाद के लिए मात्रा दर्ज करें।');
      return;
    }
    
    try {
      const requestData = {
        center_id: centerData.centerId,
        center_name: centerData.centerName,
        demand_list: demandList
      };
      
      const response = await fetch('https://mahadevaaya.com/govbillingsystem/backend/api/demand-generation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit demand');
      }
      
      // Reset quantities
      const resetQuantities = {};
      filteredData.forEach(investment => {
        investment.sub_investments.forEach(subInvestment => {
          resetQuantities[`${investment.investment_name}-${subInvestment.sub_investment_name}`] = 0;
        });
      });
      setQuantities(resetQuantities);
      setTotalAmount(0);
      
      alert('डिमांड सफलतापूर्वक सबमिट की गई!');
    } catch (err) {
      console.error('Error submitting demand:', err);
      setError('डिमांड सबमिट करने में त्रुटि। कृपया बाद में पुन: प्रयास करें।');
    }
  };

  const handleLogout = () => {
    // Clear both center data and authentication state
    clearCenter(); // Clear context data
    logout(); // Clear authentication state
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
              <h5 className="mb-0">डिमांड जनरेशन</h5>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                disabled={totalAmount === 0}
              >
                सबमिट करें
              </Button>
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
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>उपनिवेश नाम</th>
                        <th>(Sub-investment)</th>
                        <th>मात्रा (Quantity)</th>
                        <th>दर (Rate)</th>
                        <th>योग (Total)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length > 0 ? (
                        filteredData.map((investment, index) => (
                          investment.sub_investments.map((subInvestment, subIndex) => {
                            const quantityKey = `${investment.investment_name}-${subInvestment.sub_investment_name}`;
                            const quantity = quantities[quantityKey] || 0;
                            const total = quantity * subInvestment.rate;
                            
                            return (
                              <tr key={`${index}-${subIndex}`}>
                                {subIndex === 0 && (
                                  <td rowSpan={investment.sub_investments.length}>
                                    {investment.investment_name}
                                  </td>
                                )}
                                <td>{subInvestment.sub_investment_name}</td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(
                                      investment.investment_name, 
                                      subInvestment.sub_investment_name, 
                                      subInvestment.rate, 
                                      e.target.value
                                    )}
                                  />
                                </td>
                                <td>{subInvestment.rate}</td>
                                <td>{total.toFixed(2)}</td>
                              </tr>
                            );
                          })
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">कोई डेटा नहीं मिला</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="text-end fw-bold">कुल योग (Total):</td>
                        <td className="fw-bold">{totalAmount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DemandGenerate;