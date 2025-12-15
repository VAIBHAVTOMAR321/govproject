import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Spinner, Alert, Row, Col,Form, Button, FormGroup, FormLabel, Pagination } from "react-bootstrap";
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import Footer from "../footer/Footer";

// API URLs - separate for fetching and updating
const GET_API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/";
const UPDATE_API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/update-billing-item/";

// Custom styles for react-select components to match dashboard styling
const customSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
    '&:hover': {
      borderColor: '#3b82f6',
    },
    minHeight: '38px', // Match height of Form.Select
    fontSize: '14px', // Match small-fonts
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    zIndex: 9999, // Ensure it's above all other elements
    position: 'absolute', // Explicitly set position
    fontSize: '14px',
  }),
  menuList: (baseStyles) => ({
    ...baseStyles,
    maxHeight: '200px', // Show approximately 4-5 items before scrolling
    overflowY: 'auto',
    fontSize: '14px',
  }),
  multiValue: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: '#e5e7eb',
  }),
  multiValueLabel: (baseStyles) => ({
    ...baseStyles,
    color: '#1f2937',
    fontSize: '12px',
  }),
  multiValueRemove: (baseStyles) => ({
    ...baseStyles,
    color: '#6b7280',
    '&:hover': {
      backgroundColor: '#d1d5db',
      color: '#1f2937',
    },
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: '#6b7280',
    fontSize: '14px',
  }),
};

// Hindi translations
const translations = {
  dashboard: "डैशबोर्ड",
  billingItems: "बिलिंग आइटम्स",
  filters: "फिल्टर",
  clearAllFilters: "सभी फिल्टर हटाएं",
  centerName: "केंद्र का नाम",
  component: "घटक",
  investmentName: "निवेश का नाम",
  unit: "इकाई",
  sourceOfReceipt: "रसीद का स्रोत",
  allocatedQuantity: "आवंटित मात्रा",
  rate: "दर",
  sno: "क्र.सं.",
  id: "आईडी",
  loading: "लोड हो रहा है...",
  noItemsFound: "कोई बिलिंग आइटम नहीं मिला।",
  noMatchingItems: "चयनित फिल्टर से मेल खाने वाली कोई आइटम नहीं मिली।",
  showing: "दिखा रहे हैं",
  to: "से",
  of: "का",
  entries: "प्रविष्टियां",
  page: "पृष्ठ",
  previous: "पिछला",
  next: "अगला",
  itemsPerPage: "प्रति पृष्ठ आइटम:",
  allCenters: "सभी केंद्र",
  allComponents: "सभी घटक",
  allInvestments: "सभी निवेश",
  allUnits: "सभी इकाइयां",
  allSources: "सभी स्रोत",
  allSchemes: "सभी योजनाएं",
  schemeName: "योजना का नाम",
  selectSourceFirst: "पहले स्रोत चुनें",
  selectCenterFirst: "पहले केंद्र चुनें",
  selectComponentFirst: "पहले घटक चुनें",
  selectInvestmentFirst: "पहले निवेश चुनें",
  selectUnitFirst: "पहले इकाई चुनें",
  fetchError: "डेटा लाने में विफल। कृपया बाद में पुन: प्रयास करें।",
  networkError: "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।",
  serverError: "सर्वर त्रुटि। कृपया बाद में पुन: प्रयास करें।",
  dataError: "डेटा प्रोसेस करने में त्रुटि।",
  retry: "पुनः प्रयास करें",
  filterSeparator: " > ",
  billId: "बिल आईडी",
  updatedQuantity: "अपडेट की गई मात्रा",
  cutQuantity: "कटी हुई मात्रा",
  quantityLeft: "शेष मात्रा",
  submitUpdates: "अपडेट सबमिट करें",
  billing: "बिलिंग",
  billingDataUpdated: "बिलिंग डेटा सफलतापूर्वक अपडेट किया गया!",
  error: "त्रुटि",
  noItemsUpdated: "कोई आइटम अपडेट नहीं की गई।",
  cannotCutMore: "आइटम के लिए उपलब्ध मात्रा से अधिक नहीं काटा जा सकता",
  // New translations for the modified columns
  soldRashi: "बेची राशि",
  allotedRashi: "आवंटित राशि",
  totalBill: "कुल बिल" // New translation for total bill column
};

const Billing = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // State for API data, loading, and errors
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for user ID mapping from source of receipt
  const [sourceUserMap, setSourceUserMap] = useState({});
  
  // State for tracking which items have been modified
  const [modifiedItems, setModifiedItems] = useState({});
  
  // State for form submission
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  // State for filtering with multi-select for component, investment, and scheme
  const [filters, setFilters] = useState({
    center_name: null,
    source_of_receipt: null,
    component: [], // Multi-select
    investment_name: [], // Multi-select
    scheme_name: [] // Multi-select
  });
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  // useEffect for fetching data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(GET_API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Create a mapping of source_of_receipt to user_id
        const sourceMapping = {};
        data.forEach(item => {
          if (item.source_of_receipt && item.user_id) {
            sourceMapping[item.source_of_receipt] = item.user_id;
          }
        });
        setSourceUserMap(sourceMapping);
        
        // Initialize cut_quantity for each item
        const initializedData = data.map(item => ({
          ...item,
          cut_quantity: ''
        }));
        setBillingData(initializedData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
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
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Get unique values for filters with sequential logic
  const filterOptions = useMemo(() => {
    if (!billingData || billingData.length === 0) {
      return {
        center_name: [],
        source_of_receipt: [],
        component: [],
        investment_name: [],
        scheme_name: []
      };
    }

    // Base data filtered by already selected filters
    let baseFilteredData = billingData;
    
    // Filter by center_name if selected
    if (filters.center_name) {
      baseFilteredData = baseFilteredData.filter(item => item.center_name === filters.center_name.value);
    }
    
    // Filter by source_of_receipt if selected
    if (filters.source_of_receipt) {
      baseFilteredData = baseFilteredData.filter(item => item.source_of_receipt === filters.source_of_receipt.value);
    }
    
    // Filter by scheme_name if selected
    if (filters.scheme_name && filters.scheme_name.length > 0) {
      baseFilteredData = baseFilteredData.filter(item => 
        filters.scheme_name.some(scheme => scheme.value === item.scheme_name)
      );
    }
    
    // Filter by component if selected
    if (filters.component && filters.component.length > 0) {
      baseFilteredData = baseFilteredData.filter(item => 
        filters.component.some(comp => comp.value === item.component)
      );
    }
    
    // Filter by investment_name if selected
    if (filters.investment_name && filters.investment_name.length > 0) {
      baseFilteredData = baseFilteredData.filter(item => 
        filters.investment_name.some(inv => inv.value === item.investment_name)
      );
    }

    return {
      center_name: [...new Set(billingData.map(item => item.center_name))].map(name => ({ value: name, label: name })),
      source_of_receipt: filters.center_name 
        ? [...new Set(billingData.filter(item => item.center_name === filters.center_name.value)
            .map(item => item.source_of_receipt))].map(name => ({ value: name, label: name }))
        : [...new Set(billingData.map(item => item.source_of_receipt))].map(name => ({ value: name, label: name })),
      component: filters.center_name && filters.source_of_receipt
        ? [...new Set(billingData.filter(item => 
            item.center_name === filters.center_name.value && 
            item.source_of_receipt === filters.source_of_receipt.value)
            .map(item => item.component))].map(name => ({ value: name, label: name }))
        : filters.center_name
        ? [...new Set(billingData.filter(item => item.center_name === filters.center_name.value)
            .map(item => item.component))].map(name => ({ value: name, label: name }))
        : [...new Set(billingData.map(item => item.component))].map(name => ({ value: name, label: name })),
      investment_name: filters.center_name && filters.source_of_receipt && (filters.component.length > 0)
        ? [...new Set(billingData.filter(item => 
            item.center_name === filters.center_name.value && 
            item.source_of_receipt === filters.source_of_receipt.value &&
            filters.component.some(comp => comp.value === item.component))
            .map(item => item.investment_name))].map(name => ({ value: name, label: name }))
        : filters.center_name && filters.source_of_receipt
        ? [...new Set(billingData.filter(item => 
            item.center_name === filters.center_name.value && 
            item.source_of_receipt === filters.source_of_receipt.value)
            .map(item => item.investment_name))].map(name => ({ value: name, label: name }))
        : [...new Set(billingData.map(item => item.investment_name))].map(name => ({ value: name, label: name })),
      scheme_name: filters.center_name
        ? [...new Set(billingData.filter(item => item.center_name === filters.center_name.value)
            .map(item => item.scheme_name))].map(name => ({ value: name, label: name }))
        : [...new Set(billingData.map(item => item.scheme_name))].map(name => ({ value: name, label: name }))
    };
  }, [billingData, filters]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return billingData.filter(item => {
      return (
        (!filters.center_name || item.center_name === filters.center_name.value) &&
        (!filters.source_of_receipt || item.source_of_receipt === filters.source_of_receipt.value) &&
        (!filters.scheme_name || filters.scheme_name.length === 0 || filters.scheme_name.some(scheme => scheme.value === item.scheme_name)) &&
        (!filters.component || filters.component.length === 0 || filters.component.some(comp => comp.value === item.component)) &&
        (!filters.investment_name || filters.investment_name.length === 0 || filters.investment_name.some(inv => inv.value === item.investment_name))
      );
    });
  }, [billingData, filters]);
  
  // Calculate paginated data based on filtered data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedBillingData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  
  // Convert table data to Excel format and download
  const downloadExcel = (data, filename) => {
    try {
      const excelData = data.map(item => ({
        [translations.id]: item.id,
        [translations.centerName]: item.center_name,
        [translations.sourceOfReceipt]: item.source_of_receipt,
        [translations.component]: item.component,
        [translations.investmentName]: item.investment_name,
        [translations.schemeName]: item.scheme_name,
        [translations.unit]: item.unit,
        [translations.allocatedQuantity]: item.allocated_quantity,
        [translations.rate]: item.rate
      }));
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "BillingItems");
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
            <h2>${translations.billingItems}</h2>
            <table>
              <tr>
                <th>${translations.id}</th>
                <th>${translations.centerName}</th>
                <th>${translations.sourceOfReceipt}</th>
                <th>${translations.component}</th>
                <th>${translations.investmentName}</th>
                <th>${translations.schemeName}</th>
                <th>${translations.unit}</th>
                <th>${translations.allocatedQuantity}</th>
                <th>${translations.rate}</th>
              </tr>
              ${data.map(item => `
                <tr>
                  <td>${item.id}</td>
                  <td>${item.center_name}</td>
                  <td>${item.source_of_receipt}</td>
                  <td>${item.component}</td>
                  <td>${item.investment_name}</td>
                  <td>${item.scheme_name}</td>
                  <td>${item.unit}</td>
                  <td>${item.allocated_quantity}</td>
                  <td>${item.rate}</td>
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
  
  // Handle filter changes with multi-select support
  const handleFilterChange = (filterName, value) => {
    // Reset dependent filters when a filter changes
    if (filterName === 'center_name') {
      setFilters({
        center_name: value,
        source_of_receipt: null,
        component: [],
        investment_name: [],
        scheme_name: []
      });
    } else if (filterName === 'source_of_receipt') {
      setFilters(prev => ({
        ...prev,
        source_of_receipt: value,
        component: [],
        investment_name: [],
        scheme_name: [] // Reset scheme_name as it might be dependent
      }));
    } else if (filterName === 'component') {
      setFilters(prev => ({
        ...prev,
        component: value,
        investment_name: [] // Reset investment_name as it's dependent on component
      }));
    } else {
      // For scheme_name and investment_name, just update the value
      setFilters(prev => ({
        ...prev,
        [filterName]: value
      }));
    }
  };
  
  // Handle cut quantity change
  const handleCutQuantityChange = (id, value) => {
    // Ensure value is a non-negative number
    const numValue = Math.max(0, parseFloat(value) || 0);
    
    // Get the item to check allocated quantity
    const item = billingData.find(item => item.id === id);
    const allocatedNum = parseFloat(item.allocated_quantity) || 0;
    const updatedNum = parseFloat(item.updated_quantity) || 0;
    
    // Calculate the maximum allowed cut quantity
    const maxCut = allocatedNum - updatedNum;
    
    // Validate that the cut quantity doesn't exceed the available quantity
    if (numValue > maxCut) {
      setSubmitError(`${translations.cannotCutMore} (${maxCut}) ${translations.for} ${item.bill_id}`);
      return;
    }
    
    setBillingData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, cut_quantity: numValue } : item
      )
    );
    
    // Track that this item has been modified
    setModifiedItems(prev => ({ ...prev, [id]: true }));
  };
  
  // Calculate quantity left
  const calculateQuantityLeft = (allocated, updated, cut) => {
    const allocatedNum = parseFloat(allocated) || 0;
    const updatedNum = parseFloat(updated) || 0;
    const cutNum = parseFloat(cut) || 0;
    return (allocatedNum - updatedNum - cutNum).toFixed(2);
  };
  
  // Calculate amount
  const calculateAmount = (quantity, rate) => {
    const qty = parseFloat(quantity) || 0;
    const r = parseFloat(rate) || 0;
    return (qty * r).toFixed(2);
  };
  
  // Calculate allocated amount (allocated quantity * rate)
  const calculateAllocatedAmount = (allocatedQuantity, rate) => {
    const qty = parseFloat(allocatedQuantity) || 0;
    const r = parseFloat(rate) || 0;
    return (qty * r).toFixed(2);
  };
  
  // Calculate total bill (cut quantity * rate)
  const calculateTotalBill = (cutQuantity, rate) => {
    const qty = parseFloat(cutQuantity) || 0;
    const r = parseFloat(rate) || 0;
    return (qty * r).toFixed(2);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get only the items that have been modified
    const updatedItems = billingData.filter(item => modifiedItems[item.id] && item.cut_quantity > 0);
    
    if (updatedItems.length === 0) {
      setSubmitError(translations.noItemsUpdated);
      return;
    }
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      
      // Create payload in the required format - array of arrays
      // Each inner array contains [bill_id, updated_quantity + cut_quantity]
      const multiple_bills = updatedItems.map(item => {
        const existingUpdated = parseFloat(item.updated_quantity) || 0;
        const newCut = parseFloat(item.cut_quantity) || 0;
        const totalUpdated = (existingUpdated + newCut).toString();
        
        return [
          item.bill_id,
          totalUpdated
        ];
      });
      
      // Get the user_id based on the selected source_of_receipt
      // If a source is selected in filters, use that; otherwise use the first item's source
      let selectedSource = filters.source_of_receipt?.value;
      if (!selectedSource && updatedItems.length > 0) {
        selectedSource = updatedItems[0].source_of_receipt;
      }
      
      const userId = sourceUserMap[selectedSource] || "USR-001"; // Fallback to default if not found
      
      const payload = {
        user_id: userId, // Use the user_id mapped from source_of_receipt
        multiple_bills
      };
      
      
      // Use the update API URL with POST method
      const response = await fetch(UPDATE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setSubmitSuccess(true);
      // Clear modified items after successful submission
      setModifiedItems({});
      
      // Refresh data from the GET API
      const refreshResponse = await fetch(GET_API_URL);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        
        // Update the source user mapping with new data
        const sourceMapping = {};
        data.forEach(item => {
          if (item.source_of_receipt && item.user_id) {
            sourceMapping[item.source_of_receipt] = item.user_id;
          }
        });
        setSourceUserMap(sourceMapping);
        
        // Initialize cut_quantity for each item
        const initializedData = data.map(item => ({
          ...item,
          cut_quantity: ''
        }));
        setBillingData(initializedData);
      }
      
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      center_name: null,
      source_of_receipt: null,
      component: [],
      investment_name: [],
      scheme_name: []
    });
  };
  
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

  // Render loading state
  if (loading) {
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
  if (error) {
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

  // Get the current user_id based on selected source
  const currentUserId = filters.source_of_receipt?.value 
    ? sourceUserMap[filters.source_of_receipt.value] || "Not available"
    : "Select a source to see user ID";

  return (
    <>
      <div className="dashboard-container">
        <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content">
          <DashBoardHeader toggleSidebar={toggleSidebar} />
          <Container fluid className="dashboard-body">
            <h1 className="page-title small-fonts">{translations.billing}</h1>
            
            {submitSuccess && (
              <Alert variant="success" dismissible onClose={() => setSubmitSuccess(false)}>
                {translations.billingDataUpdated}
              </Alert>
            )}
            
            {submitError && (
              <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
                {translations.error}: {submitError}
              </Alert>
            )}
            
            {/* Filters Section */}
            <div className="filter-section mb-4 p-3 border rounded bg-light">
              <Row className="mb-3">
                <Col md={12} className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 small-fonts">{translations.filters}</h5>
                  {(filters.center_name || filters.source_of_receipt || filters.component.length > 0 || filters.investment_name.length > 0 || filters.scheme_name.length > 0) && (
                    <Button variant="outline-secondary" size="sm" onClick={clearFilters} className="small-fonts">
                      {translations.clearAllFilters}
                    </Button>
                  )}
                </Col>
              </Row>
              
              <Row>
                <Col md={4} className="mb-3">
                  <FormGroup>
                    <FormLabel className="small-fonts">{translations.centerName}</FormLabel>
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
                  </FormGroup>
                </Col>
                
                <Col md={4} className="mb-3">
                  <FormGroup>
                    <FormLabel className="small-fonts">{translations.sourceOfReceipt}</FormLabel>
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
                  </FormGroup>
                  {filters.source_of_receipt && (
                    <Form.Text className="text-muted">
                    </Form.Text>
                  )}
                </Col>
                
                <Col md={4} className="mb-3">
                  <FormGroup>
                    <FormLabel className="small-fonts">{translations.schemeName}</FormLabel>
                    <Select
                      value={filters.scheme_name}
                      onChange={(value) => handleFilterChange('scheme_name', value)}
                      options={filterOptions.scheme_name}
                      isClearable
                      isMulti // Multi-select
                      placeholder={translations.allSchemes}
                      styles={customSelectStyles}
                      className="small-fonts filter-dropdown"
                      isDisabled={!filters.center_name}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </FormGroup>
                </Col>
              </Row>
              
              <Row>
                <Col md={6} className="mb-3">
                  <FormGroup>
                    <FormLabel className="small-fonts">{translations.component}</FormLabel>
                    <Select
                      value={filters.component}
                      onChange={(value) => handleFilterChange('component', value)}
                      options={filterOptions.component}
                      isClearable
                      isMulti // Multi-select
                      placeholder={filters.center_name && filters.source_of_receipt ? translations.allComponents : translations.selectSourceFirst}
                      styles={customSelectStyles}
                      className="small-fonts filter-dropdown"
                      isDisabled={!filters.center_name || !filters.source_of_receipt}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </FormGroup>
                </Col>
                
                <Col md={6} className="mb-3">
                  <FormGroup>
                    <FormLabel className="small-fonts">{translations.investmentName}</FormLabel>
                    <Select
                      value={filters.investment_name}
                      onChange={(value) => handleFilterChange('investment_name', value)}
                      options={filterOptions.investment_name}
                      isClearable
                      isMulti // Multi-select
                      placeholder={filters.center_name && filters.source_of_receipt && filters.component.length > 0 ? translations.allInvestments : translations.selectComponentFirst}
                      styles={customSelectStyles}
                      className="small-fonts filter-dropdown"
                      isDisabled={!filters.center_name || !filters.source_of_receipt || filters.component.length === 0}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </FormGroup>
                </Col>
              </Row>
            </div>
            <div>
            <Form onSubmit={handleSubmit}>
              <div className="billing-table-container">
                <Row className="mt-3">
                  <div className="col-md-12">
                    <div className="table-wrapper">
                      {filteredData.length > 0 ? (
                        <>
                          <div className="d-flex justify-content-end mb-2">
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              onClick={() => downloadExcel(filteredData, `BillingItems_${new Date().toISOString().split('T')[0]}`)}
                              className="me-2"
                            >
                              <FaFileExcel className="me-1" />Excel
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              onClick={() => downloadPdf(filteredData, `BillingItems_${new Date().toISOString().split('T')[0]}`)}
                            >
                              <FaFilePdf className="me-1" />PDF
                            </Button>
                          </div>
                          <div className="table-info mb-2 d-flex justify-content-between align-items-center">
                            <span className="small-fonts">
                              {translations.showing} {indexOfFirstItem + 1} {translations.to} {Math.min(indexOfLastItem, filteredData.length)} {translations.of} {filteredData.length} {translations.entries}
                            </span>
                            <div className="d-flex align-items-center">
                              <span className="small-fonts me-2">{translations.itemsPerPage}</span>
                              <span className="badge bg-primary">{itemsPerPage}</span>
                            </div>
                          </div>
                          <table className="responsive-table small-fonts">
                            <thead>
                              <tr>
                                <th>{translations.sno}</th>
                                <th>{translations.centerName}</th>
                                <th>{translations.sourceOfReceipt}</th>
                                <th>{translations.component}</th>
                                <th>{translations.investmentName}</th>
                                <th>{translations.schemeName}</th>
                                <th>{translations.unit}</th>
                                <th>{translations.allocatedQuantity}</th>
                                <th>{translations.updatedQuantity}</th>
                                <th>{translations.quantityLeft}</th>
                                <th>{translations.allotedRashi}</th>
                                <th>{translations.soldRashi}</th>
                                <th>{translations.cutQuantity}</th>
                                <th>{translations.rate}</th>
                                <th>{translations.totalBill}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedBillingData.map((item, index) => {
                                const allocatedAmount = calculateAllocatedAmount(item.allocated_quantity, item.rate);
                                const soldAmount = calculateAmount(item.updated_quantity, item.rate);
                                const quantityLeft = calculateQuantityLeft(item.allocated_quantity, item.updated_quantity, item.cut_quantity);
                                const maxCut = (parseFloat(item.allocated_quantity) || 0) - (parseFloat(item.updated_quantity) || 0);
                                const totalBill = calculateTotalBill(item.cut_quantity, item.rate);
                                
                                return (
                                  <tr key={item.id}>
                                    <td data-label={translations.sno}>{indexOfFirstItem + index + 1}</td>
                                    <td data-label={translations.centerName}>{item.center_name}</td>
                                    <td data-label={translations.sourceOfReceipt}>{item.source_of_receipt}</td>
                                    <td data-label={translations.component}>{item.component}</td>
                                    <td data-label={translations.investmentName}>{item.investment_name}</td>
                                    <td data-label={translations.schemeName}>{item.scheme_name}</td>
                                    <td data-label={translations.unit}>{item.unit}</td>
                                    <td data-label={translations.allocatedQuantity}>{item.allocated_quantity}</td>
                                    <td data-label={translations.updatedQuantity}>{item.updated_quantity}</td>
                                    <td data-label={translations.quantityLeft}>{quantityLeft}</td>
                                    <td data-label={translations.allotedRashi}>{allocatedAmount}</td>
                                    <td data-label={translations.soldRashi}>{soldAmount}</td>
                                    <td data-label={translations.cutQuantity}>
                                      <Form.Control
                                        type="number"
                                        min="0"
                                        max={maxCut}
                                        step="0.01"
                                        value={item.cut_quantity || ''}
                                        onChange={(e) => handleCutQuantityChange(item.id, e.target.value)}
                                        className={`small-fonts ${modifiedItems[item.id] ? 'border-warning' : ''}`}
                                      />
                                    </td>
                                    <td data-label={translations.rate}>{item.rate}</td>
                                    <td data-label={translations.totalBill}>
                                      <Form.Control
                                        type="text"
                                        value={totalBill}
                                        disabled
                                        className="bg-light small-fonts"
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                          
                          {totalPages > 1 && (
                            <div className=" mt-2">
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
                          {translations.noMatchingItems}
                        </Alert>
                      )}
                    </div>
                  </div>
                </Row>
                
                <div className="d-flex justify-content-end mt-3">
                  <Button variant="primary" type="submit" disabled={submitting || Object.keys(modifiedItems).length === 0}>
                    {submitting ? <Spinner as="span" animation="border" size="sm" /> : null}
                    {translations.submitUpdates}
                  </Button>
                </div>
              </div>
            </Form>
            </div>
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Billing;