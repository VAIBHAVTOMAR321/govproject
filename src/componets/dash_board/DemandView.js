import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Spinner, Modal, InputGroup, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCenter } from '../all_login/CenterContext';
import { useAuth } from '../../context/AuthContext';
import DashBoardHeader from './DashBoardHeader';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiSaveLine, RiCloseLine, RiEyeLine, RiSearchLine, RiFileDownloadLine, RiFileExcel2Line, RiFilePdfLine } from 'react-icons/ri';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

const DemandView = () => {
  const navigate = useNavigate();
  const { centerData, clearCenter } = useCenter();
  const { logout } = useAuth();
  
  // State for data
  const [centerDemands, setCenterDemands] = useState([]);
  const [centerLoading, setCenterLoading] = useState(false);
  const [centerError, setCenterError] = useState('');
  const [demands, setDemands] = useState([]);
  const [filteredDemands, setFilteredDemands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentDemand, setCurrentDemand] = useState(null);
  
  // State for forms
  const [formData, setFormData] = useState({
    sub_investment_name: '',
    allocated_quantity: '',
    rate: '',
    unit: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for center demands filters
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [selectedSubInvestments, setSelectedSubInvestments] = useState([]);
  
  // Ref for table elements
  const demandsTableRef = useRef(null);
  const centerDemandsTableRef = useRef(null);
  
  // Fetch all demands on component mount
  useEffect(() => {
    fetchDemands();
    fetchDemandByCenter();
  }, []);
  
  const fetchDemandByCenter = async () => {
    setCenterLoading(true);
    setCenterError('');

    try {
      const response = await fetch(
        'https://mahadevaaya.com/govbillingsystem/backend/api/demand-by-center/'
      );

      if (!response.ok) {
        throw new Error('Failed to fetch center demands');
      }

      const data = await response.json();
      setCenterDemands(data);
    } catch (err) {
      console.error(err);
      setCenterError('सेंटर डिमांड लाने में त्रुटि');
    } finally {
      setCenterLoading(false);
    }
  };

  // Filter demands based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDemands(demands);
    } else {
      const filtered = demands.filter(demand => 
        demand.demand_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        demand.sub_investment_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDemands(filtered);
    }
  }, [searchTerm, demands]);

  // Get unique centers and sub-investments for filters
  const uniqueCenters = Array.from(new Set(centerDemands.map(item => item.center_name))).filter(Boolean);
  const uniqueSubInvestments = Array.from(new Set(centerDemands.map(item => item?.demand?.sub_investment_name))).filter(Boolean);

  // Filter center demands based on selected filters
  const filteredCenterDemands = centerDemands.filter(item => {
    const matchesCenter = selectedCenters.length === 0 || selectedCenters.includes(item.center_name);
    const matchesSubInvestment = selectedSubInvestments.length === 0 || selectedSubInvestments.includes(item?.demand?.sub_investment_name);
    return matchesCenter && matchesSubInvestment;
  });
  
  // GET: Fetch all demands
  const fetchDemands = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://mahadevaaya.com/govbillingsystem/backend/api/demand-generation/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch demands');
      }
      
      const data = await response.json();
      setDemands(data);
      setFilteredDemands(data);
    } catch (err) {
      console.error('Error fetching demands:', err);
      setError('डेटा लाने में त्रुटि। कृपया बाद में पुन: प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };
  
  // POST: Create new demand
  const handleAddDemand = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate form data
      if (!formData.sub_investment_name || !formData.allocated_quantity || !formData.rate) {
        setError('सभी फ़ील्ड भरना अनिवार्य है');
        setIsSubmitting(false);
        return;
      }
      
      const payload = {
        sub_investment_name: formData.sub_investment_name,
        allocated_quantity: parseFloat(formData.allocated_quantity),
        rate: parseFloat(formData.rate),
        unit: formData.unit
      };
      
      const response = await fetch('https://mahadevaaya.com/govbillingsystem/backend/api/demand-generation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create demand');
      }
      
      // Reset form and close modal
      setFormData({
        sub_investment_name: '',
        allocated_quantity: '',
        rate: '',
        unit: ''
      });
      setShowAddModal(false);
      setSuccess('डिमांड सफलतापूर्वक बनाई गई!');
      
      // Refresh data
      await fetchDemands();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating demand:', err);
      setError(err.message || 'डिमांड बनाने में त्रुटि। कृपया बाद में पुन: प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // PUT: Update existing demand
  const handleUpdateDemand = async () => {
    if (!currentDemand) return;
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate form data
      if (!formData.sub_investment_name || !formData.allocated_quantity || !formData.rate) {
        setError('सभी फ़ील्ड भरना अनिवार्य है');
        setIsSubmitting(false);
        return;
      }
      
      const payload = {
        demand_id: currentDemand.demand_id, // Add demand_id from currentDemand
        sub_investment_name: formData.sub_investment_name,
        allocated_quantity: parseFloat(formData.allocated_quantity),
        rate: parseFloat(formData.rate),
        unit: formData.unit 
      };
      
      // Update URL to include the demand ID in the path
      const response = await fetch(`https://mahadevaaya.com/govbillingsystem/backend/api/demand-generation/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update demand');
      }
      
      // Reset form and close modal
      setFormData({
        sub_investment_name: '',
        allocated_quantity: '',
        rate: '',
        unit: ''
      });
      setShowEditModal(false);
      setCurrentDemand(null);
      setSuccess('डिमांड सफलतापूर्वक अपडेट की गई!');
      
      // Refresh data
      await fetchDemands();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating demand:', err);
      setError(err.message || 'डिमांड अपडेट करने में त्रुटि। कृपया बाद में पुन: प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // DELETE: Remove demand
  const handleDeleteDemand = async () => {
    if (!currentDemand) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `https://mahadevaaya.com/govbillingsystem/backend/api/demand-generation/`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            demand_id: currentDemand.demand_id, // IMPORTANT
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete demand');
      }

      setShowDeleteModal(false);
      setCurrentDemand(null);
      setSuccess('डिमांड सफलतापूर्वक हटा दी गई!');

      await fetchDemands();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting demand:', err);
      setError(err.message || 'डिमांड हटाने में त्रुटि। कृपया बाद में पुन: प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Open edit modal with current demand data
  const openEditModal = (demand) => {
    setCurrentDemand(demand);
    setFormData({
      sub_investment_name: demand.sub_investment_name,
      allocated_quantity: demand.allocated_quantity,
      rate: demand.rate,
      unit: demand.unit || ''  
    });
    setShowEditModal(true);
  };
  
  // Open view modal
  const openViewModal = (demand) => {
    setCurrentDemand(demand);
    setShowViewModal(true);
  };
  
  // Open delete confirmation modal
  const openDeleteModal = (demand) => {
    setCurrentDemand(demand);
    setShowDeleteModal(true);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Reset form when modal is closed
  const handleCloseModal = (modalType) => {
    if (modalType === 'add') {
      setShowAddModal(false);
    } else if (modalType === 'edit') {
      setShowEditModal(false);
      setCurrentDemand(null);
    } else if (modalType === 'delete') {
      setShowDeleteModal(false);
      setCurrentDemand(null);
    } else if (modalType === 'view') {
      setShowViewModal(false);
      setCurrentDemand(null);
    }
    
    setFormData({
      sub_investment_name: '',
      allocated_quantity: '',
      rate: '',
      unit: ''
    });
    setError('');
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle logout
  const handleLogout = () => {
    clearCenter();
    logout();
    navigate('/', { replace: true });
  };
  
  // Export demands table to Excel
  const exportDemandsToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredDemands.map(demand => ({
      'उप निवेश नाम': demand.sub_investment_name,
      'आवंटित मात्रा': demand.allocated_quantity,
      'इकाई': demand.unit,
      'दर': demand.rate,
      'कुल राशि': demand.amount || (demand.allocated_quantity * demand.rate)
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "डिमांड रिकॉर्ड्स");
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create a blob
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `डिमांड_रिकॉर्ड्स_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Export center demands table to Excel
  const exportCenterDemandsToExcel = () => {
    // Prepare data for export
    const exportData = [];
    let totalAmount = 0;
    
    centerDemands.forEach(item => {
      const amount = item.demanded_quantity * (item?.demand?.rate || 0);
      totalAmount += amount;
      exportData.push({
        'सेंटर नाम': item.center_name,
        'उप-निवेश नाम': item?.demand?.sub_investment_name,
        'इकाई': item?.demand?.unit,
        'मांगी गई मात्रा': item.demanded_quantity,
        'दर': item?.demand?.rate,
        'कुल राशि': amount
      });
    });
    
    // Add total row
    exportData.push({
      'सेंटर नाम': 'कुल',
      'उप-निवेश नाम': '',
      'इकाई': '',
      'मांगी गई मात्रा': '',
      'दर': '',
      'कुल राशि': totalAmount
    });
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "सेंटर अनुसार डिमांड");
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create a blob
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `सेंटर_डिमांड_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export demands table to PDF
  const exportDemandsToPDF = () => {
    const element = demandsTableRef.current;
    if (!element) return;

    // Hide action column before generating PDF
    const actionColumns = element.querySelectorAll('th:nth-child(5), td:nth-child(5)');
    actionColumns.forEach(col => col.style.display = 'none');

    // Create a wrapper element with proper table styling for PDF
    const wrapper = document.createElement('div');
    wrapper.style.padding = '20px';
    wrapper.style.fontFamily = 'Arial, sans-serif';
    
    // Add table title
    const title = document.createElement('h3');
    title.textContent = 'डिमांड रिकॉर्ड्स';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    wrapper.appendChild(title);

    // Clone the table with styles
    const tableClone = element.cloneNode(true);
    
    // Ensure table has proper borders
    const table = tableClone.querySelector('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    
    // Style all cells
    const allCells = table.querySelectorAll('th, td');
    allCells.forEach(cell => {
      cell.style.border = '1px solid #000';
      cell.style.padding = '8px';
      cell.style.textAlign = 'left';
    });
    
    // Style table headers
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
      header.style.backgroundColor = '#f0f0f0';
      header.style.fontWeight = 'bold';
      header.style.textAlign = 'center';
    });

    wrapper.appendChild(tableClone);

    const opt = {
      margin: 10,
      filename: `डिमांड_रिकॉर्ड्स_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(wrapper).save().then(() => {
      // Show action column again
      actionColumns.forEach(col => col.style.display = 'table-cell');
    });
  };

  // Export center demands table to PDF
  const exportCenterDemandsToPDF = () => {
    const element = centerDemandsTableRef.current;
    if (!element) return;

    // Create a wrapper element with proper table styling for PDF
    const wrapper = document.createElement('div');
    wrapper.style.padding = '20px';
    wrapper.style.fontFamily = 'Arial, sans-serif';
    
    // Add table title
    const title = document.createElement('h3');
    title.textContent = 'सेंटर अनुसार डिमांड';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    wrapper.appendChild(title);

    // Clone the table with styles
    const tableClone = element.cloneNode(true);
    
    // Ensure table has proper borders
    const table = tableClone.querySelector('table');
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    
    // Style all cells
    const allCells = table.querySelectorAll('th, td');
    allCells.forEach(cell => {
      cell.style.border = '1px solid #000';
      cell.style.padding = '8px';
      cell.style.textAlign = 'left';
    });
    
    // Style table headers
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
      header.style.backgroundColor = '#f0f0f0';
      header.style.fontWeight = 'bold';
      header.style.textAlign = 'center';
    });

    wrapper.appendChild(tableClone);

    const opt = {
      margin: 10,
      filename: `सेंटर_डिमांड_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(wrapper).save();
  };
  
  return (
    <>
      <DashBoardHeader />
      <Container fluid className="py-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2>डिमांड प्रबंधन</h2>
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                  <RiAddLine /> नई डिमांड जोड़ें
                </Button>
                <Button variant="danger" onClick={handleLogout}>लॉगआउट</Button>
              </div>
            </div>
          </Col>
        </Row>
        
        {/* Success and Error Messages */}
        {success && <Alert variant="success" className="mb-3">{success}</Alert>}
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
        
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">डिमांड रिकॉर्ड्स</h5>
                <div className="d-flex gap-2">
                  <InputGroup style={{ width: '300px' }}>
                    <InputGroup.Text>
                      <RiSearchLine />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="उप-निवेश खोजें..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                  <Button variant="outline-success" style={{backgroundColor: '#28a745', color: 'white'}} onClick={exportDemandsToExcel}>
                    <RiFileExcel2Line /> Excel निर्यात करें
                  </Button>
                  <Button variant="outline-danger" style={{backgroundColor: '#dc3545', color: 'white'}} onClick={exportDemandsToPDF}>
                    <RiFilePdfLine /> PDF निर्यात करें
                  </Button>
                </div>
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
                    {filteredDemands.length > 0 ? (
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }} ref={demandsTableRef}>
                        <Table striped bordered hover responsive className="mb-0">
                          <thead>
                            <tr>
                              <th>उप निवेश नाम</th>
                              <th>आवंटित मात्रा</th>
                              <th>इकाई</th>
                              <th>दर</th>
                              <th>कार्यवाही</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDemands.map((demand) => (
                              <tr key={demand.id}>
                                <td>{demand.sub_investment_name}</td>
                                <td>{demand.allocated_quantity}</td>
                                <td>{demand.unit}</td>
                                <td>{demand.rate}</td>
                                <td>
                                  <div className="d-flex gap-1">
                                    <Button 
                                      variant="outline-info" 
                                      size="sm" 
                                      onClick={() => openViewModal(demand)}
                                      title="देखें"
                                    >
                                      <RiEyeLine />
                                    </Button>
                                    <Button 
                                      variant="outline-primary" 
                                      size="sm" 
                                      onClick={() => openEditModal(demand)}
                                      title="संपादित करें"
                                    >
                                      <RiEditLine />
                                    </Button>
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm" 
                                      onClick={() => openDeleteModal(demand)}
                                      title="हटाएं"
                                    >
                                      <RiDeleteBinLine />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
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
        
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">सेंटर अनुसार डिमांड</h5>
                <div className="d-flex gap-2">
                  <Button variant="outline-success"style={{backgroundColor: '#28a745', color: 'white'}} onClick={exportCenterDemandsToExcel}>
                    <RiFileExcel2Line /> Excel निर्यात करें
                  </Button>
                  <Button variant="outline-danger" style={{backgroundColor: '#dc3545', color: 'white'}} onClick={exportCenterDemandsToPDF}>
                    <RiFilePdfLine /> PDF निर्यात करें
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {/* Filters */}
                <div className="mb-4">
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="centerFilter">
                        <Form.Label>केंद्र फ़िल्टर</Form.Label>
                        <Form.Select
                          multiple
                          value={selectedCenters}
                          onChange={(e) => setSelectedCenters([...e.target.selectedOptions].map(option => option.value))}
                          style={{ height: '120px' }}
                        >
                          {uniqueCenters.map(center => (
                            <option key={center} value={center}>
                              {center}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="subInvestmentFilter">
                        <Form.Label>उप-निवेश फ़िल्टर</Form.Label>
                        <Form.Select
                          multiple
                          value={selectedSubInvestments}
                          onChange={(e) => setSelectedSubInvestments([...e.target.selectedOptions].map(option => option.value))}
                          style={{ height: '120px' }}
                        >
                          {uniqueSubInvestments.map(subInvestment => (
                            <option key={subInvestment} value={subInvestment}>
                              {subInvestment}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  {/* Clear Filters Button */}
                  <div className="mt-3 text-center">
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setSelectedCenters([]);
                        setSelectedSubInvestments([]);
                      }}
                    >
                      फ़िल्टर साफ़ करें
                    </Button>
                  </div>
                </div>

                {centerLoading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" />
                  </div>
                ) : centerError ? (
                  <Alert variant="danger">{centerError}</Alert>
                ) : filteredCenterDemands?.length > 0 ? (
                  <div style={{ maxHeight: '450px', overflowY: 'auto' }} ref={centerDemandsTableRef}>
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>सेंटर नाम</th>
                          <th>उप-निवेश नाम</th>
                          <th>इकाई</th>
                          <th>मांगी गई मात्रा</th>
                          <th>दर</th>
                          <th>कुल राशि</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(
                          filteredCenterDemands.reduce((acc, item) => {
                            if (!acc[item.center_name]) acc[item.center_name] = [];
                            acc[item.center_name].push(item);
                            return acc;
                          }, {})
                        ).map((centerItems) =>
                          centerItems.map((item, idx) => (
                            <tr key={item.id}>
                              {idx === 0 && (
                                <td rowSpan={centerItems.length}>
                                  {item.center_name || '-'}
                                </td>
                              )}
                              <td>{item?.demand?.sub_investment_name || '-'}</td>
                              <td>{item?.demand?.unit || '-'}</td>
                              <td>{item.demanded_quantity ?? '-'}</td>
                              <td>{item?.demand?.rate ?? '-'}</td>
                              <td>{(item.demanded_quantity * (item?.demand?.rate || 0)).toFixed(2)}</td>
                            </tr>
                          ))
                        )}
                        {/* Total Row */}
                        <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                          <td colSpan={3}>कुल</td>
                          <td>{(filteredCenterDemands.reduce((sum, item) => sum + parseFloat(item.demanded_quantity || 0), 0)).toFixed(2)}</td>
                          <td></td>
                          <td>{(filteredCenterDemands.reduce((sum, item) => sum + (parseFloat(item.demanded_quantity || 0) * parseFloat(item?.demand?.rate || 0)), 0)).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p>कोई रिकॉर्ड उपलब्ध नहीं</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      {/* Add Demand Modal */}
      <Modal show={showAddModal} onHide={() => handleCloseModal('add')}>
        <Modal.Header closeButton>
          <Modal.Title>नई डिमांड जोड़ें</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>उप-निवेश नाम <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="sub_investment_name"
                value={formData.sub_investment_name}
                onChange={handleInputChange}
                placeholder="जैसे: आलू-1, सोलर पैनल स्थापना"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>इकाई <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                placeholder="Kg / Quintal / Nos"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>आवंटित मात्रा <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="allocated_quantity"
                value={formData.allocated_quantity}
                onChange={handleInputChange}
                placeholder="जैसे: 120.50"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>दर <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                placeholder="जैसे: 45000.00"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleCloseModal('add')}>
            रद्द करें
          </Button>
          <Button variant="primary" onClick={handleAddDemand} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" />
                <span className="ms-2">जोड़ा जा रहा है...</span>
              </>
            ) : (
              <>
                <RiSaveLine /> जोड़ें
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Demand Modal */}
      <Modal show={showEditModal} onHide={() => handleCloseModal('edit')}>
        <Modal.Header closeButton>
          <Modal.Title>डिमांड संपादित करें</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>उप-निवेश नाम <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="sub_investment_name"
                value={formData.sub_investment_name}
                onChange={handleInputChange}
                placeholder="जैसे: आलू-1, सोलर पैनल स्थापना"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>इकाई <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                placeholder="Kg / Quintal / Nos"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>आवंटित मात्रा <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="allocated_quantity"
                value={formData.allocated_quantity}
                onChange={handleInputChange}
                placeholder="जैसे: 120.50"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>दर <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                placeholder="जैसे: 45000.00"
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleCloseModal('edit')}>
            रद्द करें
          </Button>
          <Button variant="primary" onClick={handleUpdateDemand} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" />
                <span className="ms-2">अपडेट हो रहा है...</span>
              </>
            ) : (
              <>
                <RiSaveLine /> अपडेट करें
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* View Demand Modal */}
      <Modal show={showViewModal} onHide={() => handleCloseModal('view')} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>डिमांड विवरण</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentDemand && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>उप-निवेश नाम:</strong> {currentDemand.sub_investment_name}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>आवंटित मात्रा:</strong> {currentDemand.allocated_quantity}
                </Col>
                <Col md={6}>
                  <strong>इकाई:</strong> {currentDemand.unit}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>दर:</strong> {currentDemand.rate}
                </Col>
                <Col md={6}>
                  <strong>कुल राशि:</strong> {currentDemand.amount?.toLocaleString('hi-IN') || 0}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleCloseModal('view')}>
            बंद करें
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => handleCloseModal('delete')}>
        <Modal.Header closeButton>
          <Modal.Title>डिमांड हटाने की पुष्टि</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <p>क्या आप वाकई इस डिमांड को हटाना चाहते हैं?</p>
          {currentDemand && (
            <div className="border rounded p-3 bg-light">
              <p><strong>उप-निवेश नाम:</strong> {currentDemand.sub_investment_name}</p>
              <p><strong>आवंटित मात्रा:</strong> {currentDemand.allocated_quantity}</p>
              <p><strong>इकाई:</strong> {currentDemand.unit}</p>
              <p><strong>दर:</strong> {currentDemand.rate}</p>
            </div>
          )}
          <p className="text-danger mt-3">
            <strong>चेतावनी:</strong> यह कार्रवाई पूर्ववत नहीं की जा सकती है।
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => handleCloseModal('delete')}>
            रद्द करें
          </Button>
          <Button variant="danger" onClick={handleDeleteDemand} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" />
                <span className="ms-2">हटाया जा रहा है...</span>
              </>
            ) : (
              <>
                <RiDeleteBinLine /> हटाएं
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DemandView;