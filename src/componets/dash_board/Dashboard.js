import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Spinner, Alert, Row, Col, Form, Button, Pagination } from "react-bootstrap";
import * as XLSX from 'xlsx';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import Footer from "../footer/Footer";

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
  amount: "राशि",
  sno: "क्र.सं.",
  id: "आईडी",
  loading: "लोड हो रहा है...",
  noItemsFound: "कोई बिलिंग आइटम नहीं मिला।",
  noMatchingItems: "चयनित फिल्टर से मेल खाने वाली कोई आइटम नहीं मिली।",
  showingItems: "दिखा रहे हैं",
  of: "की",
  items: "आइटम्स",
  page: "पृष्ठ",
  previous: "पिछला",
  next: "अगला",
  allCenters: "सभी केंद्र",
  allComponents: "सभी घटक",
  allInvestments: "सभी निवेश",
  allUnits: "सभी इकाइयां",
  allSources: "सभी स्रोत",
  allSchemes: "सभी योजनाएं", // Added for scheme_name
  schemeName: "योजना का नाम", // Added for scheme_name
  selectSourceFirst: "पहले स्रोत चुनें",
  selectCenterFirst: "पहले केंद्र चुनें",
  selectSchemeFirst: "पहले योजना चुनें", // Added for scheme_name
  selectComponentFirst: "पहले घटक चुनें",
  selectInvestmentFirst: "पहले निवेश चुनें",
  selectUnitFirst: "पहले इकाई चुनें", // Added for scheme_name
  fetchError: "डेटा लाने में विफल। कृपया बाद में पुन: प्रयास करें।",
  networkError: "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।",
  serverError: "सर्वर त्रुटि। कृपया बाद में पुन: प्रयास करें।",
  dataError: "डेटा प्रोसेस करने में त्रुटि।",
  retry: "पुनः प्रयास करें",
  // New translations for dynamic heading
  filterSeparator: " > ",
  itemsPerPage: "प्रति पृष्ठ आइटम:"
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setErrorType] = useState("");
  
  // Filter states - Center is now first filter
  const [centerFilter, setCenterFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [schemeFilter, setSchemeFilter] = useState(""); // Moved up before component
  const [componentFilter, setComponentFilter] = useState("");
  const [investmentFilter, setInvestmentFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Changed from 30 to 50 to match the first component

  // Extract unique values for each filter with cascading logic
  const uniqueCenters = useMemo(() => {
    if (!billingData.length) return [];
    const centers = [...new Set(billingData.map(item => item.center_name))];
    return centers.filter(Boolean).sort();
  }, [billingData]);

  const uniqueSources = useMemo(() => {
    if (!billingData.length) return [];
    let filteredData = billingData;
    if (centerFilter) {
      filteredData = filteredData.filter(item => item.center_name === centerFilter);
    }
    const sources = [...new Set(filteredData.map(item => item.source_of_receipt))];
    return sources.filter(Boolean).sort();
  }, [billingData, centerFilter]);

  // Updated to only depend on center and source filters
  const uniqueSchemes = useMemo(() => {
    if (!billingData.length) return [];
    let filteredData = billingData;
    if (centerFilter) filteredData = filteredData.filter(item => item.center_name === centerFilter);
    if (sourceFilter) filteredData = filteredData.filter(item => item.source_of_receipt === sourceFilter);
    const schemes = [...new Set(filteredData.map(item => item.scheme_name))];
    return schemes.filter(Boolean).sort();
  }, [billingData, centerFilter, sourceFilter]);

  // Updated to also depend on schemeFilter
  const uniqueComponents = useMemo(() => {
    if (!billingData.length) return [];
    let filteredData = billingData;
    if (centerFilter) filteredData = filteredData.filter(item => item.center_name === centerFilter);
    if (sourceFilter) filteredData = filteredData.filter(item => item.source_of_receipt === sourceFilter);
    if (schemeFilter) filteredData = filteredData.filter(item => item.scheme_name === schemeFilter);
    const components = [...new Set(filteredData.map(item => item.component))];
    return components.filter(Boolean).sort();
  }, [billingData, centerFilter, sourceFilter, schemeFilter]);

  // Updated to also depend on schemeFilter
  const uniqueInvestments = useMemo(() => {
    if (!billingData.length) return [];
    let filteredData = billingData;
    if (centerFilter) filteredData = filteredData.filter(item => item.center_name === centerFilter);
    if (sourceFilter) filteredData = filteredData.filter(item => item.source_of_receipt === sourceFilter);
    if (schemeFilter) filteredData = filteredData.filter(item => item.scheme_name === schemeFilter);
    if (componentFilter) filteredData = filteredData.filter(item => item.component === componentFilter);
    const investments = [...new Set(filteredData.map(item => item.investment_name))];
    return investments.filter(Boolean).sort();
  }, [billingData, centerFilter, sourceFilter, schemeFilter, componentFilter]);

  // Updated to also depend on schemeFilter
  const uniqueUnits = useMemo(() => {
    if (!billingData.length) return [];
    let filteredData = billingData;
    if (centerFilter) filteredData = filteredData.filter(item => item.center_name === centerFilter);
    if (sourceFilter) filteredData = filteredData.filter(item => item.source_of_receipt === sourceFilter);
    if (schemeFilter) filteredData = filteredData.filter(item => item.scheme_name === schemeFilter);
    if (componentFilter) filteredData = filteredData.filter(item => item.component === componentFilter);
    if (investmentFilter) filteredData = filteredData.filter(item => item.investment_name === investmentFilter);
    const units = [...new Set(filteredData.map(item => item.unit))];
    return units.filter(Boolean).sort();
  }, [billingData, centerFilter, sourceFilter, schemeFilter, componentFilter, investmentFilter]);

  // Filter data based on all selected filters
  const filteredData = useMemo(() => {
    return billingData.filter(item => {
      return (
        (!centerFilter || item.center_name === centerFilter) &&
        (!sourceFilter || item.source_of_receipt === sourceFilter) &&
        (!schemeFilter || item.scheme_name === schemeFilter) && // Moved up before component
        (!componentFilter || item.component === componentFilter) &&
        (!investmentFilter || item.investment_name === investmentFilter) &&
        (!unitFilter || item.unit === unitFilter)
      );
    });
  }, [billingData, centerFilter, sourceFilter, schemeFilter, componentFilter, investmentFilter, unitFilter]);

  // Calculate paginated data based on filtered data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedBillingData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Dynamic heading for table section
  const dynamicTableHeading = useMemo(() => {
    let heading = translations.billingItems;
    const appliedFilters = [];

    if (centerFilter) appliedFilters.push(`${translations.centerName}: ${centerFilter}`);
    if (sourceFilter) appliedFilters.push(`${translations.sourceOfReceipt}: ${sourceFilter}`);
    if (schemeFilter) appliedFilters.push(`${translations.schemeName}: ${schemeFilter}`); // Moved up before component
    if (componentFilter) appliedFilters.push(`${translations.component}: ${componentFilter}`);
    if (investmentFilter) appliedFilters.push(`${translations.investmentName}: ${investmentFilter}`);
    if (unitFilter) appliedFilters.push(`${translations.unit}: ${unitFilter}`);
    
    if (appliedFilters.length > 0) {
      heading += `: ` + appliedFilters.join(` ${translations.filterSeparator} `);
    }
    
    return heading;
  }, [centerFilter, sourceFilter, schemeFilter, componentFilter, investmentFilter, unitFilter, translations]);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [centerFilter, sourceFilter, schemeFilter, componentFilter, investmentFilter, unitFilter]);

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

  // Fetch billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        setError(null);
        setErrorType("");
        
        const response = await fetch("https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/");
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setBillingData(data);
      } catch (err) {
        
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          setErrorType("network");
          setError(translations.networkError);
        } else if (err.message.includes('HTTP error')) {
          setErrorType("server");
          setError(translations.serverError);
        } else {
          setErrorType("data");
          setError(translations.dataError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  // Function to retry fetching data
  const retryFetch = () => {
    window.location.reload();
  };

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  
  // Convert table data to Excel format and download
  const downloadExcel = (data, filename) => {
    try {
      const excelData = data.map(item => ({
        [translations.sno]: '',
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
            <h2>${dynamicTableHeading}</h2>
            <table>
              <tr>
                <th>${translations.sno}</th>
                <th>${translations.centerName}</th>
                <th>${translations.sourceOfReceipt}</th>
                <th>${translations.component}</th>
                <th>${translations.investmentName}</th>
                <th>${translations.schemeName}</th>
                <th>${translations.unit}</th>
                <th>${translations.allocatedQuantity}</th>
                <th>${translations.rate}</th>
              </tr>
              ${data.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
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

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'center':
        setCenterFilter(value);
        setSourceFilter("");
        setSchemeFilter("");
        setComponentFilter("");
        setInvestmentFilter("");
        setUnitFilter("");
        break;
      case 'source':
        setSourceFilter(value);
        setSchemeFilter("");
        setComponentFilter("");
        setInvestmentFilter("");
        setUnitFilter("");
        break;
      case 'scheme': // Added for scheme_name
        setSchemeFilter(value);
        setComponentFilter("");
        setInvestmentFilter("");
        setUnitFilter("");
        break;
      case 'component':
        setComponentFilter(value);
        setInvestmentFilter("");
        setUnitFilter("");
        break;
      case 'investment':
        setInvestmentFilter(value);
        setUnitFilter("");
        break;
      case 'unit':
        setUnitFilter(value);
        break;
      default:
        break;
    }
  };

  const clearAllFilters = () => {
    setCenterFilter("");
    setSourceFilter("");
    setSchemeFilter("");
    setComponentFilter("");
    setInvestmentFilter("");
    setUnitFilter("");
  };

  const hasActiveFilters = centerFilter || sourceFilter || schemeFilter || componentFilter || investmentFilter || unitFilter;

  // Function to calculate amount
  const calculateAmount = (quantity, rate) => {
    const qty = parseFloat(quantity) || 0;
    const r = parseFloat(rate) || 0;
    return (qty * r).toFixed(2);
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

  return (
    <>
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <LeftNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content">
        <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <Container fluid className="dashboard-body">
          {/* Static Main Page Title */}
          <h1 className="page-title small-fonts">{translations.dashboard}</h1>

          {/* Billing Items Table */}
          <div className="billing-table-container">
            {/* Filter Section */}
            <div className="filter-section">
              <Row className="mb-3">
                <Col md={12} className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 small-fonts">{translations.filters}</h5>
                  {hasActiveFilters && (
                    <Button variant="outline-secondary" size="sm" onClick={clearAllFilters} className="small-fonts">
                      {translations.clearAllFilters}
                    </Button>
                  )}
                </Col>
              </Row>
              
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Group controlId="centerFilter">
                    <Form.Label className="small-fonts">{translations.centerName}:</Form.Label>
                    <Form.Select 
                      value={centerFilter} 
                      onChange={(e) => handleFilterChange('center', e.target.value)}
                      className="filter-dropdown small-fonts"
                    >
                      <option value="">{translations.allCenters}</option>
                      {uniqueCenters.map(center => (
                        <option key={center} value={center}>{center}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={4} className="mb-3">
                  <Form.Group controlId="sourceFilter">
                    <Form.Label className="small-fonts">{translations.sourceOfReceipt}:</Form.Label>
                    <Form.Select 
                      value={sourceFilter} 
                      onChange={(e) => handleFilterChange('source', e.target.value)}
                      className="filter-dropdown small-fonts"
                      disabled={!centerFilter}
                    >
                      <option value="">
                        {centerFilter ? translations.allSources : translations.selectCenterFirst}
                      </option>
                      {centerFilter && uniqueSources.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={4} className="mb-3">
                  <Form.Group controlId="schemeFilter">
                    <Form.Label className="small-fonts">{translations.schemeName}:</Form.Label>
                    <Form.Select 
                      value={schemeFilter} 
                      onChange={(e) => handleFilterChange('scheme', e.target.value)}
                      className="filter-dropdown small-fonts"
                      disabled={!sourceFilter}
                    >
                      <option value="">
                        {sourceFilter ? translations.allSchemes : translations.selectSourceFirst}
                      </option>
                      {sourceFilter && uniqueSchemes.map(scheme => (
                        <option key={scheme} value={scheme}>{scheme}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={4} className="mb-3">
                  <Form.Group controlId="componentFilter">
                    <Form.Label className="small-fonts">{translations.component}:</Form.Label>
                    <Form.Select 
                      value={componentFilter} 
                      onChange={(e) => handleFilterChange('component', e.target.value)}
                      className="filter-dropdown small-fonts"
                      disabled={!schemeFilter}
                    >
                      <option value="">
                        {schemeFilter ? translations.allComponents : translations.selectSchemeFirst}
                      </option>
                      {schemeFilter && uniqueComponents.map(component => (
                        <option key={component} value={component}>{component}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={4} className="mb-3">
                  <Form.Group controlId="investmentFilter">
                    <Form.Label className="small-fonts">{translations.investmentName}:</Form.Label>
                    <Form.Select 
                      value={investmentFilter} 
                      onChange={(e) => handleFilterChange('investment', e.target.value)}
                      className="filter-dropdown small-fonts"
                      disabled={!componentFilter}
                    >
                      <option value="">
                        {componentFilter ? translations.allInvestments : translations.selectComponentFirst}
                      </option>
                      {componentFilter && uniqueInvestments.map(investment => (
                        <option key={investment} value={investment}>{investment}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={4} className="mb-3">
                  <Form.Group controlId="unitFilter">
                    <Form.Label className="small-fonts">{translations.unit}:</Form.Label>
                    <Form.Select 
                      value={unitFilter} 
                      onChange={(e) => handleFilterChange('unit', e.target.value)}
                      className="filter-dropdown small-fonts"
                      disabled={!investmentFilter}
                    >
                      <option value="">
                        {investmentFilter ? translations.allUnits : translations.selectInvestmentFirst}
                      </option>
                      {investmentFilter && uniqueUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>
            
            {/* Dynamic Heading Above Table */}
            <h2 className="dynamic-table-heading small-fonts">{dynamicTableHeading}</h2>
            
            {loading ? (
              <div className="text-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">{translations.loading}</span>
                </Spinner>
              </div>
            ) : error ? (
              <Alert variant="danger" className="small-fonts">
                {error}
                <div className="mt-2">
                  <Button variant="outline-danger" size="sm" onClick={retryFetch}>
                    {translations.retry}
                  </Button>
                </div>
              </Alert>
            ) : (
              <>
                <Row className="mt-3">
                  <div className="col-md-12">
                    <div className="table-wrapper">
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
                      {filteredData.length > 0 ? (
                        <>
                          <div className="table-info mb-2 d-flex justify-content-between align-items-center">
                            <span className="small-fonts">
                              {translations.showingItems} {indexOfFirstItem + 1} {translations.to} {Math.min(indexOfLastItem, filteredData.length)} {translations.of} {filteredData.length} {translations.items}
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
                                <th>{translations.id}</th>
                                <th>{translations.centerName}</th>
                                <th>{translations.component}</th>
                                <th>{translations.investmentName}</th>
                                <th>{translations.unit}</th>
                                <th>{translations.allocatedQuantity}</th>
                                <th>{translations.rate}</th>
                                <th>{translations.amount}</th>
                                <th>{translations.sourceOfReceipt}</th>
                                <th>{translations.schemeName}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedBillingData.map((item, index) => (
                                <tr key={item.id}>
                                  <td data-label={translations.sno}>{indexOfFirstItem + index + 1}</td>
                                  <td data-label={translations.id}>{item.id}</td>
                                  <td data-label={translations.centerName}>{item.center_name}</td>
                                  <td data-label={translations.component}>{item.component}</td>
                                  <td data-label={translations.investmentName}>{item.investment_name}</td>
                                  <td data-label={translations.unit}>{item.unit}</td>
                                  <td data-label={translations.allocatedQuantity}>{item.allocated_quantity}</td>
                                  <td data-label={translations.rate}>{item.rate}</td>
                                  <td data-label={translations.amount}>{calculateAmount(item.allocated_quantity, item.rate)}</td>
                                  <td data-label={translations.sourceOfReceipt}>{item.source_of_receipt}</td>
                                  <td data-label={translations.schemeName}>{item.scheme_name}</td>
                                </tr>
                              ))}
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
                        <Alert variant="info" className="small-fonts">
                          {hasActiveFilters ? translations.noMatchingItems : translations.noItemsFound}
                        </Alert>
                      )}
                    </div>
                  </div>
                </Row>
              </>
            )}
          </div>
        </Container>
      </div>
      
    </div>
    <Footer />
    </>
  );
};

export default Dashboard;