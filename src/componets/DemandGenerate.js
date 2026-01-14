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
  const [disabledItems, setDisabledItems] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    if (!centerData.isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [centerData.isLoggedIn, navigate]);

  // Fetch billing data first
  useEffect(() => {
    if (centerData.centerId) {
      fetchBillingData();
    }
  }, [centerData.centerId]);

  // Fetch submitted demands after billing data is loaded
  useEffect(() => {
    if (dataLoaded && filteredData.length > 0) {
      fetchSubmittedDemands();
    }
  }, [dataLoaded, filteredData]);

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
      setDataLoaded(true);
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError('डेटा लाने में त्रुटि। कृपया बाद में पुन: प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmittedDemands = async () => {
    try {
      const response = await fetch('https://mahadevaaya.com/govbillingsystem/backend/api/demand-generation/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch submitted demands');
      }
      
      const data = await response.json();
      
      // Filter demands for the current center
      const centerDemands = data.filter(demand => demand.center_id === centerData.centerId);
      
      // Initialize quantities object with 0 for all items
      const initialQuantities = {};
      const initialDisabledItems = {};
      
      filteredData.forEach(investment => {
        investment.sub_investments.forEach(subInvestment => {
          const key = `${investment.investment_name}-${subInvestment.sub_investment_name}`;
          initialQuantities[key] = 0;
          initialDisabledItems[key] = false;
        });
      });
      
      // Update quantities and disabled items for submitted demands
      centerDemands.forEach(demand => {
        demand.demand_list.forEach(item => {
          const productName = item[0];
          const quantity = parseFloat(item[1]) || 0;
          
          // Find the sub-investment for this product
          filteredData.forEach(investment => {
            const subInvestment = investment.sub_investments.find(
              sub => sub.sub_investment_name === productName
            );
            
            if (subInvestment) {
              const key = `${investment.investment_name}-${productName}`;
              initialQuantities[key] = quantity;
              initialDisabledItems[key] = true;
            }
          });
        });
      });
      
      setQuantities(initialQuantities);
      setDisabledItems(initialDisabledItems);
      
      // Calculate total amount
      let total = 0;
      filteredData.forEach(investment => {
        investment.sub_investments.forEach(subInvestment => {
          const quantityKey = `${investment.investment_name}-${subInvestment.sub_investment_name}`;
          total += (initialQuantities[quantityKey] || 0) * subInvestment.rate;
        });
      });
      setTotalAmount(total);
      
    } catch (err) {
      console.error('Error fetching submitted demands:', err);
      setError('पहले से सबमिट किए गए डिमांड लाने में त्रुटि।');
    }
  };

  const handleQuantityChange = (investmentName, subInvestmentName, rate, value) => {
    const key = `${investmentName}-${subInvestmentName}`;
    
    // Skip if this item is disabled
    if (disabledItems[key]) {
      return;
    }
    
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
        
        // Only include items that are not disabled and have a quantity > 0
        if (quantity > 0 && !disabledItems[quantityKey]) {
          demandList.push([subInvestment.sub_investment_name, quantity.toString()]);
        }
      });
    });
    
    if (demandList.length === 0) {
      setError('कृपया कम से कम एक नए उत्पाद के लिए मात्रा दर्ज करें।');
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
      
      // Refresh submitted demands after successful submission
      await fetchSubmittedDemands();
      
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
                            const isDisabled = disabledItems[quantityKey] || false;
                            
                            return (
                              <tr key={`${index}-${subIndex}`} className={isDisabled ? 'table-secondary' : ''}>
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
                                    disabled={isDisabled}
                                  />
                                  {isDisabled && (
                                    <Form.Text className="text-muted">
                                      पहले से सबमिट किया गया
                                    </Form.Text>
                                  )}
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