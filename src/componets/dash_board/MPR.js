import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Form, Button, Alert, Row, Col, Card, Spinner, Badge, Pagination, Collapse } from "react-bootstrap";
import Select from 'react-select';
import axios from "axios";
import * as XLSX from 'xlsx';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import "../../assets/css/registration.css";
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";

// API URLs
const YEARLY_DATA_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/";
const MONTHLY_DATA_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/report-billing-items/";

// Hindi translations
const translations = {
  pageTitle: "मासिक प्रगति रिपोर्ट (MPR)",
  filters: "फिल्टर",
  centerName: "केंद्र का नाम",
  sourceOfReceipt: "रसीद का स्रोत",
  month: "महीना",
  year: "वर्ष",
  viewReport: "रिपोर्ट देखें",
  loading: "लोड हो रहा है...",
  noDataFound: "कोई डेटा नहीं मिला।",
  clearAllFilters: "सभी फिल्टर हटाएं",
  sno: "क्र.सं.",
  reportId: "रिपोर्ट आईडी",
  component: "घटक",
  investmentName: "निवेश का नाम",
  unit: "इकाई",
  allocatedQuantity: "आवंटित मात्रा",
  updatedQuantity: "अपडेट की गई मात्रा",
  rate: "दर",
  buyAmount: "खरीद राशि",
  soldAmount: "बेची गई राशि",
  totalAmount: "कुल राशि",
  monthlyProgress: "मासिक प्रगति",
  yearlyProgress: "वार्षिक प्रगति",
  comparison: "तुलना",
  acceptReport: "रिपोर्ट स्वीकार करें",
  rejectReport: "रिपोर्ट अस्वीकार करें",
  status: "स्थिति",
  pending: "लंबित",
  accepted: "स्वीकृत",
  cancelled: "रद्द",
  allCenters: "सभी केंद्र",
  allSources: "सभी स्रोत",
  total: "कुल",
  showing: "दिखा रहे हैं",
  to: "से",
  of: "का",
  entries: "प्रविष्टियां",
  page: "पृष्ठ",
  itemsPerPage: "प्रति पृष्ठ आइटम:",
  error: "त्रुटि",
  fetchError: "डेटा लाने में विफल। कृपया बाद में पुन: प्रयास करें।",
  statusUpdateSuccess: "रिपोर्ट स्थिति सफलतापूर्वक अपडेट की गई।",
  statusUpdateError: "रिपोर्ट स्थिति अपडेट करने में त्रुटि। कृपया बाद में पुन: प्रयास करें।",
  confirmAccept: "क्या आप वाकई इस रिपोर्ट को स्वीकार करना चाहते हैं?",
  confirmReject: "क्या आप वाकई इस रिपोर्ट को अस्वीकार करना चाहते हैं?",
  yes: "हाँ",
  no: "नहीं",
  percentage: "प्रतिशत",
  progressPercentage: "प्रगति प्रतिशत",
  viewDetails: "विवरण देखें",
  viewReceipt: "रसीद देखें",
  schemeName: "योजना का नाम",
  totalItems: "कुल आइटम"
};

// Month options for dropdown
const monthOptions = [
  { value: 1, label: "जनवरी" },
  { value: 2, label: "फरवरी" },
  { value: 3, label: "मार्च" },
  { value: 4, label: "अप्रैल" },
  { value: 5, label: "मई" },
  { value: 6, label: "जून" },
  { value: 7, label: "जुलाई" },
  { value: 8, label: "अगस्त" },
  { value: 9, label: "सितंबर" },
  { value: 10, label: "अक्टूबर" },
  { value: 11, label: "नवंबर" },
  { value: 12, label: "दिसंबर" }
];

// Custom styles for react-select components
const customSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
    '&:hover': {
      borderColor: '#3b82f6',
    },
    minHeight: '38px',
    fontSize: '14px',
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    zIndex: 9999,
    position: 'absolute',
    fontSize: '14px',
  }),
  menuList: (baseStyles) => ({
    ...baseStyles,
    maxHeight: '200px',
    overflowY: 'auto',
    fontSize: '14px',
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: '#6b7280',
    fontSize: '14px',
  }),
};

const MPR = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // State for filters
  const [filters, setFilters] = useState({
    center_name: null,
    source_of_receipt: null,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  
  // State for data
  const [yearlyData, setYearlyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State for status update
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reportToUpdate, setReportToUpdate] = useState(null);
  const [updateAction, setUpdateAction] = useState(null); // 'accept' or 'reject'
  
  // State for tracking which reports are expanded
  const [expandedReports, setExpandedReports] = useState({});

  // Check device width
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchData();
  }, [filters]);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  // Fetch yearly and monthly data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch yearly data
      const yearlyResponse = await axios.get(YEARLY_DATA_URL);
      let filteredYearlyData = yearlyResponse.data;
      
      // Apply filters to yearly data
      if (filters.center_name) {
        filteredYearlyData = filteredYearlyData.filter(item => item.center_name === filters.center_name.value);
      }
      if (filters.source_of_receipt) {
        filteredYearlyData = filteredYearlyData.filter(item => item.source_of_receipt === filters.source_of_receipt.value);
      }
      
      // Calculate total amount for each item
      filteredYearlyData = filteredYearlyData.map(item => ({
        ...item,
        total_amount: parseFloat(item.allocated_quantity) * parseFloat(item.rate)
      }));
      
      setYearlyData(filteredYearlyData);
      
      // Fetch monthly data
      let monthlyUrl = `${MONTHLY_DATA_URL}?year=${filters.year}&month=${filters.month}`;
      
      // Add center_id or user_id filter if selected
      if (filters.center_name) {
        // Find center_id from yearly data
        const center = filteredYearlyData.find(item => item.center_name === filters.center_name.value);
        if (center) {
          monthlyUrl += `&center_id=${center.center_id}`;
        }
      }
      
      const monthlyResponse = await axios.get(monthlyUrl);
      let filteredMonthlyData = monthlyResponse.data;
      
      // Apply filters to monthly data if not already applied via API
      if (filters.source_of_receipt && !filters.center_name) {
        filteredMonthlyData = filteredMonthlyData.filter(item => item.source_of_receipt === filters.source_of_receipt.value);
      }
      
      // Calculate total amount for each report and component
      filteredMonthlyData = filteredMonthlyData.map(report => {
        const componentData = report.component_data.map(component => ({
          ...component,
          total_amount: parseFloat(component.allocated_quantity) * parseFloat(component.rate)
        }));
        
        const reportTotal = componentData.reduce((sum, component) => sum + component.total_amount, 0);
        
        return {
          ...report,
          component_data: componentData,
          total_amount: reportTotal
        };
      });
      
      setMonthlyData(filteredMonthlyData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      center_name: null,
      source_of_receipt: null,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    });
  };
  
  // Convert table data to Excel format and download
  const downloadExcel = (data, filename) => {
    try {
      const excelData = data.map(item => ({
        [translations.reportId]: item.id,
        [translations.centerName]: item.center_name,
        [translations.sourceOfReceipt]: item.source_of_receipt,
        [translations.totalItems]: item.component_data ? item.component_data.length : 0,
        [translations.totalAmount]: item.total_amount
      }));
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "MPR");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
    }
  };
  
  // Convert table data to PDF format and download
  const downloadPdf = (data, filename) => {
    try {
      const tableHtml = `
        <html>
          <head>
            <style>
              table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
            </style>
          </head>
          <body>
            <h2>${translations.monthlyProgressReport}</h2>
            <table>
              <tr>
                <th>${translations.reportId}</th>
                <th>${translations.centerName}</th>
                <th>${translations.sourceOfReceipt}</th>
                <th>${translations.totalItems}</th>
                <th>${translations.totalAmount}</th>
              </tr>
              ${data.map(item => `
                <tr>
                  <td>${item.id}</td>
                  <td>${item.center_name}</td>
                  <td>${item.source_of_receipt}</td>
                  <td>${item.component_data ? item.component_data.length : 0}</td>
                  <td>${item.total_amount}</td>
                </tr>
              `).join('')}
            </table>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(tableHtml);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } catch (e) {
    }
  };
  
  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!yearlyData || yearlyData.length === 0) {
      return {
        center_name: [],
        source_of_receipt: []
      };
    }

    return {
      center_name: [...new Set(yearlyData.map(item => item.center_name))].map(name => ({ value: name, label: name })),
      source_of_receipt: filters.center_name 
        ? [...new Set(yearlyData.filter(item => item.center_name === filters.center_name.value)
            .map(item => item.source_of_receipt))].map(name => ({ value: name, label: name }))
        : [...new Set(yearlyData.map(item => item.source_of_receipt))].map(name => ({ value: name, label: name }))
    };
  }, [yearlyData, filters]);
  
  // Calculate paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = monthlyData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(monthlyData.length / itemsPerPage);
  
  // Function to handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Build pagination items
  const paginationItems = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  // Add first page and ellipsis if needed
  if (startPage > 1) {
    paginationItems.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
    if (startPage > 2) {
      paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }
  }
  
  // Add page numbers
  for (let number = startPage; number <= endPage; number++) {
    paginationItems.push(
      <Pagination.Item 
        key={number} 
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }
  
  // Add ellipsis and last page if needed
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
    }
    paginationItems.push(<Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>{totalPages}</Pagination.Item>);
  }
  
  // Get status badge variant based on status
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'warning';
    }
  };
  
  // Calculate total amounts
  const yearlyTotal = yearlyData.reduce((sum, item) => sum + item.total_amount, 0);
  const monthlyTotal = monthlyData.reduce((sum, item) => sum + item.total_amount, 0);
  const progressPercentage = yearlyTotal > 0 ? (monthlyTotal / yearlyTotal * 100).toFixed(2) : 0;
  
  // Toggle report details
  const toggleReportDetails = (reportId) => {
    setExpandedReports(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };
  
  // Handle report status update
  const handleStatusUpdate = async () => {
    try {
      setUpdatingStatus(reportToUpdate.id);
      setStatusUpdateError(null);
      setStatusUpdateSuccess(false);
      
      // Create payload for API request
      const payload = {
        bill_report_id: reportToUpdate.bill_report_id,
        status: updateAction
      };
      
      // Use PUT method to update status
      await axios.put(YEARLY_DATA_URL, payload);
      
      // Update local state to reflect the status change
      setMonthlyData(prevData => 
        prevData.map(item => 
          item.id === reportToUpdate.id ? { ...item, status: updateAction } : item
        )
      );
      
      setStatusUpdateSuccess(true);
      setShowConfirmDialog(false);
      setReportToUpdate(null);
      setUpdateAction(null);
    } catch (e) {
      setStatusUpdateError(e.message);
    } finally {
      setUpdatingStatus(null);
    }
  };
  
  // Show confirmation dialog before updating status
  const confirmStatusUpdate = (report, action) => {
    setReportToUpdate(report);
    setUpdateAction(action);
    setShowConfirmDialog(true);
  };
  
  // Cancel confirmation dialog
  const cancelConfirmation = () => {
    setShowConfirmDialog(false);
    setReportToUpdate(null);
    setUpdateAction(null);
  };
  
  // View receipt file
  const viewReceipt = (receiptPath) => {
    if (receiptPath) {
      const fullUrl = `https://mahadevaaya.com/govbillingsystem/backend${receiptPath}`;
      window.open(fullUrl, '_blank');
    }
  };

  // Render loading state
  if (loading && yearlyData.length === 0 && monthlyData.length === 0) {
    return (
        <div className="dashboard-container">
            <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
            <div className="main-content d-flex justify-content-center align-items-center">
                <Spinner animation="border" />
            </div>
        </div>
    );
  }

  // Render error state
  if (error && yearlyData.length === 0 && monthlyData.length === 0) {
    return (
        <div className="dashboard-container">
            <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
            <div className="main-content">
                <Container fluid className="dashboard-body">
                    <Alert variant="danger">{translations.error}: {error}</Alert>
                </Container>
            </div>
        </div>
    );
  }

  return (
    <>
      <div className="dashboard-container">
        <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content">
          <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <Container fluid className="dashboard-body">
            <h1 className="page-title small-fonts">{translations.pageTitle}</h1>
            
            {statusUpdateSuccess && (
              <Alert variant="success" dismissible onClose={() => setStatusUpdateSuccess(false)}>
                {translations.statusUpdateSuccess}
              </Alert>
            )}
            
            {statusUpdateError && (
              <Alert variant="danger" dismissible onClose={() => setStatusUpdateError(null)}>
                {translations.error}: {statusUpdateError}
              </Alert>
            )}
            
            {/* Filters Section */}
            <Card className="mb-4 p-3">
              <Row className="mb-3">
                <Col md={12} className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 small-fonts">{translations.filters}</h5>
                  <Button variant="outline-secondary" size="sm" onClick={clearFilters} className="small-fonts">
                    {translations.clearAllFilters}
                  </Button>
                </Col>
              </Row>
              
              <Row>
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label className="small-fonts">{translations.centerName}</Form.Label>
                    <Select
                      value={filters.center_name}
                      onChange={(value) => handleFilterChange('center_name', value)}
                      options={filterOptions.center_name}
                      isClearable
                      placeholder={translations.allCenters}
                      styles={customSelectStyles}
                      className="small-fonts filter-dropdown"
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label className="small-fonts">{translations.sourceOfReceipt}</Form.Label>
                    <Select
                      value={filters.source_of_receipt}
                      onChange={(value) => handleFilterChange('source_of_receipt', value)}
                      options={filterOptions.source_of_receipt}
                      isClearable
                      placeholder={filters.center_name ? translations.allSources : translations.selectCenterFirst}
                      styles={customSelectStyles}
                      className="small-fonts filter-dropdown"
                      isDisabled={!filters.center_name}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label className="small-fonts">{translations.month}</Form.Label>
                    <Select
                      value={monthOptions.find(option => option.value === filters.month)}
                      onChange={(value) => handleFilterChange('month', value ? value.value : null)}
                      options={monthOptions}
                      styles={customSelectStyles}
                      className="small-fonts filter-dropdown"
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3} className="mb-3">
                  <Form.Group>
                    <Form.Label className="small-fonts">{translations.year}</Form.Label>
                    <Form.Control 
                      type="number" 
                      value={filters.year}
                      onChange={(e) => handleFilterChange('year', parseInt(e.target.value))}
                      min="2020"
                      max="2030"
                      className="small-fonts"
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={12} className="d-flex justify-content-end">
                  <Button 
                    variant="primary" 
                    onClick={fetchData}
                    disabled={loading}
                    className="small-fonts"
                  >
                    {loading ? <Spinner as="span" animation="border" size="sm" /> : null}
                    {translations.viewReport}
                  </Button>
                </Col>
              </Row>
            </Card>
            
            {/* Summary Cards */}
            <Row className="mb-4">
              <Col md={4}>
                <Card className="summary-card">
                  <Card.Body>
                    <Card.Title className="small-fonts">{translations.yearlyProgress}</Card.Title>
                    <Card.Text className="display-6 small-fonts">₹{yearlyTotal.toFixed(2)}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="summary-card">
                  <Card.Body>
                    <Card.Title className="small-fonts">{translations.monthlyProgress}</Card.Title>
                    <Card.Text className="display-6 small-fonts">₹{monthlyTotal.toFixed(2)}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="summary-card">
                  <Card.Body>
                    <Card.Title className="small-fonts">{translations.progressPercentage}</Card.Title>
                    <Card.Text className="display-6 small-fonts">{progressPercentage}%</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            {/* Monthly Report Table - Using AllBills table structure */}
            <Card className="p-3">
              <h2 className="section-title small-fonts mb-3">{translations.monthlyProgress} - {monthOptions.find(m => m.value === filters.month)?.label} {filters.year}</h2>
              
              {monthlyData.length > 0 ? (
                <>
                  <div className="table-info mb-2 d-flex justify-content-between align-items-center">
                    <span className="small-fonts">
                      {translations.showing} {indexOfFirstItem + 1} {translations.to} {Math.min(indexOfLastItem, monthlyData.length)} {translations.of} {monthlyData.length} {translations.entries}
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="small-fonts me-2">{translations.itemsPerPage}</span>
                      <span className="badge bg-primary">{itemsPerPage}</span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mb-2">
                    <Button 
                      variant="outline-success" 
                      size="sm" 
                      onClick={() => downloadExcel(monthlyData, `MPR_${filters.month}_${filters.year}`)}
                      className="me-2"
                    >
                      <FaFileExcel className="me-1" />Excel
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => downloadPdf(monthlyData, `MPR_${filters.month}_${filters.year}`)}
                    >
                      <FaFilePdf className="me-1" />PDF
                    </Button>
                  </div>
                  <div className="table-wrapper">
                    <table className="responsive-table small-fonts">
                      <thead>
                        <tr>
                          <th>{translations.sno}</th>
                          <th>{translations.reportId}</th>
                          <th>{translations.centerName}</th>
                          <th>{translations.sourceOfReceipt}</th>
                          <th>{translations.reportDate}</th>
                          <th>{translations.status}</th>
                          <th>{translations.totalItems}</th>
                          <th>{translations.viewDetails}</th>
                          <th>{translations.viewReceipt}</th>
                          <th>क्रियाएं</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedData.map((item, index) => (
                          <React.Fragment key={item.id}>
                            <tr>
                              <td data-label={translations.sno}>{indexOfFirstItem + index + 1}</td>
                              <td data-label={translations.reportId}>{item.bill_report_id || '-'}</td>
                              <td data-label={translations.centerName}>{item.center_name}</td>
                              <td data-label={translations.sourceOfReceipt}>{item.source_of_receipt}</td>
                              <td data-label={translations.reportDate}>{new Date(item.created_at).toLocaleDateString('hi-IN')}</td>
                              <td data-label={translations.status}>
                                <Badge bg={getStatusBadgeVariant(item.status)}>
                                  {item.status === 'accepted' ? translations.accepted : 
                                   item.status === 'cancelled' ? translations.cancelled : 
                                   translations.pending}
                                </Badge>
                              </td>
                              <td data-label={translations.totalItems}>
                                <Badge bg="info">{item.component_data ? item.component_data.length : 0}</Badge>
                              </td>
                              <td data-label={translations.viewDetails}>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  onClick={() => toggleReportDetails(item.id)}
                                  disabled={!item.component_data || item.component_data.length === 0}
                                  className="small-fonts"
                                >
                                  {translations.viewDetails}
                                </Button>
                              </td>
                              <td data-label={translations.viewReceipt}>
                                {item.recipt_file ? (
                                  <Button 
                                    variant="outline-success" 
                                    size="sm" 
                                    onClick={() => viewReceipt(item.recipt_file)}
                                    className="small-fonts"
                                  >
                                    {translations.viewReceipt}
                                  </Button>
                                ) : (
                                  <span>-</span>
                                )}
                              </td>
                              <td data-label="क्रियाएं">
                                {item.status === 'pending' && (
                                  <div className="d-flex gap-2">
                                    <Button 
                                      variant="success" 
                                      size="sm"
                                      onClick={() => confirmStatusUpdate(item, 'accepted')}
                                      disabled={updatingStatus === item.id}
                                      className="small-fonts"
                                    >
                                      {updatingStatus === item.id ? 
                                        <Spinner as="span" animation="border" size="sm" /> : null}
                                      {translations.acceptReport}
                                    </Button>
                                    <Button 
                                      variant="danger" 
                                      size="sm"
                                      onClick={() => confirmStatusUpdate(item, 'cancelled')}
                                      disabled={updatingStatus === item.id}
                                      className="small-fonts"
                                    >
                                      {updatingStatus === item.id ? 
                                        <Spinner as="span" animation="border" size="sm" /> : null}
                                      {translations.rejectReport}
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td colSpan="10" className="p-0">
                                <Collapse in={expandedReports[item.id]}>
                                  <div className="p-3 bg-light">
                                    <h5 className="mb-3">{translations.component}</h5>
                                    {item.component_data && item.component_data.length > 0 ? (
                                      <table className="table table-sm table-bordered">
                                        <thead>
                                          <tr>
                                            <th>{translations.reportId}</th>
                                            <th>{translations.component}</th>
                                            <th>{translations.investmentName}</th>
                                            <th>{translations.unit}</th>
                                            <th>{translations.allocatedQuantity}</th>
                                            <th>{translations.updatedQuantity}</th>
                                            <th>{translations.rate}</th>
                                            <th>{translations.buyAmount}</th>
                                            <th>{translations.soldAmount}</th>
                                            <th>{translations.schemeName}</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {item.component_data.map((component, compIndex) => (
                                            <tr key={compIndex}>
                                              <td>{item.bill_report_id}</td>
                                              <td>{component.component}</td>
                                              <td>{component.investment_name}</td>
                                              <td>{component.unit}</td>
                                              <td>{component.allocated_quantity}</td>
                                              <td>{component.updated_quantity || '-'}</td>
                                              <td>₹{component.rate}</td>
                                              <td>₹{component.buy_amount}</td>
                                              <td>₹{component.sold_amount}</td>
                                              <td>{component.scheme_name}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    ) : (
                                      <Alert variant="info">No component data available</Alert>
                                    )}
                                  </div>
                                </Collapse>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="6" className="text-end fw-bold">{translations.total}</td>
                          <td>₹{monthlyTotal.toFixed(2)}</td>
                          <td colSpan="3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="mt-2">
                      <div className="small-fonts mb-3 text-center">
                        {translations.page} {currentPage} {translations.of} {totalPages}
                      </div>
                      <Pagination className="d-flex justify-content-center">
                        <Pagination.Prev 
                          disabled={currentPage === 1} 
                          onClick={() => handlePageChange(currentPage - 1)}
                        />
                        {paginationItems}
                        <Pagination.Next 
                          disabled={currentPage === totalPages} 
                          onClick={() => handlePageChange(currentPage + 1)}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <Alert variant="info">
                  {translations.noDataFound}
                </Alert>
              )}
            </Card>
          </Container>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="confirmation-dialog-overlay">
          <div className="confirmation-dialog">
            <div className="confirmation-dialog-content">
              <h5>
                {updateAction === 'accepted' ? translations.confirmAccept : translations.confirmReject}
              </h5>
              <div className="confirmation-dialog-buttons">
                <Button 
                  variant={updateAction === 'accepted' ? 'success' : 'danger'} 
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus === reportToUpdate?.id}
                >
                  {updatingStatus === reportToUpdate?.id ? 
                    <Spinner as="span" animation="border" size="sm" /> : null}
                  {translations.yes}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={cancelConfirmation}
                >
                  {translations.no}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MPR;