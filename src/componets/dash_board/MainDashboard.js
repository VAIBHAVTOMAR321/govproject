import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Spinner, Alert, Row, Col, Card, Button, ListGroup, Pagination } from "react-bootstrap";
import { FaFileExcel, FaFilePdf } from 'react-icons/fa'; // Add this import
import * as XLSX from 'xlsx'; // Add this import
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import Footer from "../footer/Footer";

const API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/";
const COMPONENT_API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/component-list/";

// Helper function to format numbers as currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
};

// Helper to convert field key to a readable title (Hindi)
const formatFieldTitle = (fieldKey) => {
    const titles = {
        center_name: 'केंद्र का नाम',
        component: 'घटक',
        investment_name: 'निवेश का नाम',
        unit: 'इकाई',
        source_of_receipt: 'प्राप्ति का स्रोत',
        scheme_name: 'योजना का नाम'
    };
    return titles[fieldKey] || fieldKey;
};

// Hindi translations for pagination
const paginationTranslations = {
    showing: "दिखा रहे हैं",
    to: "से",
    of: "का",
    entries: "प्रविष्टियां",
    page: "पृष्ठ",
    itemsPerPage: "प्रति पृष्ठ आइटम:"
};

const MainDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // State for API data, loading, and errors
  const [billingData, setBillingData] = useState([]);
  const [componentData, setComponentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for filtering
  const [selectedCategory, setSelectedCategory] = useState(null); // e.g., 'center_name'
  const [selectedValue, setSelectedValue] = useState(null);       // e.g., 'Center A'
  
  // State for showing the unique items list
  const [showUniqueItemsList, setShowUniqueItemsList] = useState(false);
  const [itemsListType, setItemsListType] = useState(''); // 'component' or 'investment'
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

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

  // --- useEffect for fetching data from the APIs ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch billing data
        const billingResponse = await fetch(API_URL);
        if (!billingResponse.ok) {
          throw new Error(`HTTP error! status: ${billingResponse.status}`);
        }
        const billingJson = await billingResponse.json();
        setBillingData(billingJson);
        
        // Fetch component data
        const componentResponse = await fetch(COMPONENT_API_URL);
        if (!componentResponse.ok) {
          throw new Error(`HTTP error! status: ${componentResponse.status}`);
        }
        const componentJson = await componentResponse.json();
        setComponentData(componentJson);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedValue]);

  // --- useMemo for processing data for cards and table ---
  const { summaryCardsData, categoryCardsData, subFilterOptions, filteredTableData, tableTotals, uniqueItemsList, paginatedData, totalPages } = useMemo(() => {
    if (!billingData || billingData.length === 0) {
        return { 
            summaryCardsData: [], 
            categoryCardsData: [], 
            subFilterOptions: [],
            filteredTableData: [], 
            tableTotals: { allocated: 0, updated: 0 },
            uniqueItemsList: [],
            paginatedData: [],
            totalPages: 0
        };
    }

    // --- 1. Calculate High-Level Summary Data ---
    const totalAllocatedMoney = billingData.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
    const totalUpdatedMoney = billingData.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
    const totalUniqueCenters = new Set(billingData.map(item => item.center_name));
    
    // Calculate unique components and investments from componentData
    const uniqueComponents = new Set();
    const uniqueInvestments = new Set();
    
    componentData.forEach(item => {
      if (item.component) uniqueComponents.add(item.component);
      if (item.investment_name) uniqueInvestments.add(item.investment_name);
    });

    const summaryCards = [
        { title: 'कुल आवंटित धन', value: formatCurrency(totalAllocatedMoney), icon: '💰' },
        { title: 'कुल बेचा/अपडेट किया गया धन', value: formatCurrency(totalUpdatedMoney), icon: '💸' },
        { title: 'कुल घटक', value: uniqueComponents.size, icon: '📦', isClickable: true, type: 'component' },
        { title: 'कुल निवेश', value: uniqueInvestments.size, icon: '💼', isClickable: true, type: 'investment' },
        { title: 'कुल केंद्र', value: totalUniqueCenters.size, icon: '🏢' },
    ];

    // --- 2. Calculate Data for Category Filter Cards ---
    const fieldsToCardify = ['center_name', 'component', 'investment_name', 'unit', 'source_of_receipt', 'scheme_name'];
    const categoryCards = fieldsToCardify.map(field => {
        const uniqueValues = [...new Set(billingData.map(item => item[field]))];
        return { key: field, title: formatFieldTitle(field), count: uniqueValues.length };
    });

    // --- 3. Generate Sub-Filter Options ---
    let options = [];
    if (selectedCategory) {
        options = [...new Set(billingData.map(item => item[selectedCategory]))];
    }

    // --- 4. Filter Data for the Table ---
    let filtered = billingData;
    if (selectedCategory) {
        filtered = filtered.filter(item => item[selectedCategory] === (selectedValue || item[selectedCategory]));
    }
    
    // --- 5. Calculate Totals for the Filtered Table ---
    const totals = filtered.reduce((acc, item) => {
        acc.allocated += parseFloat(item.allocated_quantity) * parseFloat(item.rate);
        acc.updated += parseFloat(item.updated_quantity) * parseFloat(item.rate);
        return acc;
    }, { allocated: 0, updated: 0 });
    
    // --- 6. Paginate the filtered data ---
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    // --- 7. Generate unique items list based on type ---
    let uniqueItems = [];
    if (itemsListType === 'component') {
      uniqueItems = Array.from(uniqueComponents);
    } else if (itemsListType === 'investment') {
      uniqueItems = Array.from(uniqueInvestments);
    }

    return {
        summaryCardsData: summaryCards,
        categoryCardsData: categoryCards,
        subFilterOptions: options,
        filteredTableData: filtered,
        tableTotals: totals,
        uniqueItemsList: uniqueItems,
        paginatedData: paginated,
        totalPages: totalPages
    };

  }, [billingData, componentData, selectedCategory, selectedValue, currentPage, itemsPerPage, itemsListType]);

  // Add the download functions from MPR component
  // Convert table data to Excel format and download
  const downloadExcel = (data, filename) => {
    try {
      const excelData = data.map((item, index) => ({
        'क्र.सं.': (currentPage - 1) * itemsPerPage + index + 1,
        'केंद्र का नाम': item.center_name,
        'घटक': item.component,
        'निवेश का नाम': item.investment_name,
        'इकाई': item.unit,
        'आवंटित मात्रा': item.allocated_quantity,
        'दर': item.rate,
        'आवंटित राशि': (parseFloat(item.allocated_quantity) * parseFloat(item.rate)).toFixed(2),
        'अपडेट की गई मात्रा': item.updated_quantity,
        'अपडेट की गई राशि': (parseFloat(item.updated_quantity) * parseFloat(item.rate)).toFixed(2),
        'स्रोत': item.source_of_receipt,
        'योजना': item.scheme_name
      }));
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "Billing Data");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
      console.error("Error generating Excel file:", e);
      setError("Excel file generation failed. Please try again.");
    }
  };
  
  // Convert table data to PDF format and download
  const downloadPdf = (data, filename) => {
    try {
      const tableHtml = `
        <html>
          <head>
            <title>बिलिंग विवरण</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .summary { margin-top: 20px; font-weight: bold; }
              @media print {
                .no-print { display: none; }
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <h1>बिलिंग विवरण</h1>
            ${selectedCategory ? `<p>फ़िल्टर: <strong>${formatFieldTitle(selectedCategory)}</strong> ${selectedValue ? `-> <strong>${selectedValue}</strong>` : ''}</p>` : ''}
            <table>
              <thead>
                <tr>
                  <th>क्र.सं.</th>
                  <th>केंद्र का नाम</th>
                  <th>घटक</th>
                  <th>निवेश का नाम</th>
                  <th>इकाई</th>
                  <th>आवंटित मात्रा</th>
                  <th>दर</th>
                  <th>आवंटित राशि</th>
                  <th>अपडेट की गई मात्रा</th>
                  <th>अपडेट की गई राशि</th>
                  <th>स्रोत</th>
                  <th>योजना</th>
                </tr>
              </thead>
              <tbody>
                ${data.map((item, index) => {
                  const allocatedAmount = (parseFloat(item.allocated_quantity) * parseFloat(item.rate)).toFixed(2);
                  const updatedAmount = (parseFloat(item.updated_quantity) * parseFloat(item.rate)).toFixed(2);
                  return `
                    <tr>
                      <td>${(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>${item.center_name}</td>
                      <td>${item.component}</td>
                      <td>${item.investment_name}</td>
                      <td>${item.unit}</td>
                      <td>${item.allocated_quantity}</td>
                      <td>${item.rate}</td>
                      <td>${allocatedAmount}</td>
                      <td>${item.updated_quantity}</td>
                      <td>${updatedAmount}</td>
                      <td>${item.source_of_receipt}</td>
                      <td>${item.scheme_name}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
              <tfoot>
                <tr class="summary">
                  <td colspan="7">कुल</td>
                  <td>${formatCurrency(tableTotals.allocated)}</td>
                  <td colspan="1"></td>
                  <td>${formatCurrency(tableTotals.updated)}</td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
            <div class="no-print">
              <button onclick="window.print()">Print PDF</button>
            </div>
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
      console.error("Error generating PDF:", e);
      setError("PDF generation failed. Please try again.");
    }
  };

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  
  const handleCategoryCardClick = (key) => {
    if (selectedCategory === key) {
        setSelectedCategory(null);
        setSelectedValue(null);
    } else {
        setSelectedCategory(key);
        setSelectedValue(null);
    }
  };

  const handleSubFilterClick = (value) => {
    if (selectedValue === value) {
        setSelectedValue(null);
    } else {
        setSelectedValue(value);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedValue(null);
  };
  
  const handleShowUniqueItems = (type) => {
      setItemsListType(type);
      setShowUniqueItemsList(true);
  };

  const handleBackToDashboard = () => {
      setShowUniqueItemsList(false);
  };
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // --- Render Logic ---
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

  if (error) {
    return (
        <div className="dashboard-container">
            <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
            <div className="main-content">
                <Container fluid className="dashboard-body">
                    <Alert variant="danger">Error: {error}</Alert>
                </Container>
            </div>
        </div>
    );
  }

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
        <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content">
         <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <Container fluid className="dashboard-body">
            <h1 className="page-title small-fonts">डैशबोर्ड</h1>

            {/* High-Level Summary Cards Section */}
            <Row className="g-3 mb-4">
                {summaryCardsData.map((card, index) => (
                    <Col key={index} xs={6} md={3}>
                        <Card 
                            className={`high-level-summary-card text-center h-100 ${card.isClickable ? 'cursor-pointer' : ''}`}
                            onClick={card.isClickable ? () => handleShowUniqueItems(card.type) : undefined}
                        >
                            <Card.Body>
                                <div className="card-icon">{card.icon}</div>
                                <Card.Title className="small-fonts">{card.title}</Card.Title>
                                <Card.Text className="summary-value small-fonts">{card.value}</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {showUniqueItemsList ? (
                <div className="unique-items-list-container">
                    <Button variant="secondary" size="sm" onClick={handleBackToDashboard} className="mb-3">
                        वापस जाएं
                    </Button>
                    <h4>{itemsListType === 'component' ? 'कुल अद्वितीय घटकों की सूची' : 'कुल अद्वितीय निवेशों की सूची'}</h4>
                    <ListGroup>
                        {uniqueItemsList.map((item, index) => (
                            <ListGroup.Item key={index}>{item}</ListGroup.Item>
                        ))}
                    </ListGroup>
                </div>
            ) : (
                <>
                    {/* Category Filter Cards Section */}
                    <div className="category-cards-container mb-4">
                        <h5 className="mb-3">श्रेणी के अनुसार फ़िल्टर करें</h5>
                        <Row className="g-3">
                            {categoryCardsData.map((card) => (
                                <Col key={card.key} xs={6} sm={4} md={3} lg={2}>
                                    <Card 
                                        className={`dashboard-summary-card text-center h-100 ${selectedCategory === card.key ? 'active' : ''}`}
                                        onClick={() => handleCategoryCardClick(card.key)}
                                    >
                                        <Card.Body>
                                            <Card.Title className="small-fonts">{card.title}</Card.Title>
                                            <Card.Text className="total-money small-fonts">{card.count} प्रकार</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    {/* Sub-Filter Buttons Section */}
                    {selectedCategory && (
                        <div className="sub-filter-container mb-4 p-2 border rounded bg-light">
                            <h6 className="mb-2 small-fonts">{formatFieldTitle(selectedCategory)} के अनुसार फ़िल्टर करें:</h6>
                            <Row className="g-1 align-items-center">
                                {subFilterOptions.map((option) => (
                                    <Col key={option} xs="auto">
                                        <Button 
                                            variant={selectedValue === option ? "primary" : "outline-secondary"}
                                            size="sm"
                                            className="sub-filter-btn-sm small-fonts"
                                            onClick={() => handleSubFilterClick(option)}
                                        >
                                            {option}
                                        </Button>
                                    </Col>
                                ))}
                                <Col xs="auto">
                                    <Button variant="primary" size="sm" className="small-fonts" onClick={clearAllFilters}>
                                        सभी फ़िल्टर हटाएं
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {/* Billing Items Table */}
                    <div className="billing-table-container">
                      <h2 className="dynamic-table-heading small-fonts">
                        बिलिंग विवरण
                        <span className="heading-totals">
                            (कुल आवंटित: {formatCurrency(tableTotals.allocated)}, कुल अपडेट किया गया: {formatCurrency(tableTotals.updated)})
                        </span>
                        {selectedCategory && <span className="heading-filter-info"> - <strong>{formatFieldTitle(selectedCategory)}</strong></span>}
                        {selectedValue && <span className="heading-filter-info"> - <strong>{selectedValue}</strong></span>}
                      </h2>
                      
                      <Row className="mt-3">
                        <div className="col-md-12">
                          <div className="table-wrapper">
                            {filteredTableData.length > 0 ? (
                                <>
                                    <div className="table-info mb-2 d-flex justify-content-between align-items-center">
                                        <span className="small-fonts">
                                            {paginationTranslations.showing} {((currentPage - 1) * itemsPerPage) + 1} {paginationTranslations.to} {Math.min(currentPage * itemsPerPage, filteredTableData.length)} {paginationTranslations.of} {filteredTableData.length} {paginationTranslations.entries}
                                        </span>
                                        <div className="d-flex align-items-center">
                                            <span className="small-fonts me-2">{paginationTranslations.itemsPerPage}</span>
                                            <span className="badge bg-primary">{itemsPerPage}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Add download buttons here */}
                                    <div className="d-flex justify-content-end mb-2">
                                      <Button 
                                        variant="outline-success" 
                                        size="sm" 
                                        onClick={() => downloadExcel(filteredTableData, `Billing_Data_${new Date().toISOString().slice(0, 10)}`)}
                                        className="me-2"
                                      >
                                        <FaFileExcel className="me-1" />Excel
                                        
                                      </Button>
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm" 
                                        onClick={() => downloadPdf(filteredTableData, `Billing_Data_${new Date().toISOString().slice(0, 10)}`)}
                                      >
                                        <FaFilePdf className="me-1" />
                                        PDF
                                      </Button>
                                    </div>
                                    
                                    <table className="responsive-table small-fonts">
                                      <thead>
                                        <tr>
                                          <th>क्र.सं.</th>
                                          <th>केंद्र का नाम</th>
                                          <th>घटक</th>
                                          <th>निवेश का नाम</th>
                                          <th>इकाई</th>
                                          <th>आवंटित मात्रा</th>
                                          <th>दर</th>
                                          <th>आवंटित राशि</th>
                                          <th>अपडेट की गई मात्रा</th>
                                          <th>अपडेट की गई राशि</th>
                                          <th>स्रोत</th>
                                          <th>योजना</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {paginatedData.map((item, index) => {
                                            const allocatedAmount = (parseFloat(item.allocated_quantity) * parseFloat(item.rate)).toFixed(2);
                                            const updatedAmount = (parseFloat(item.updated_quantity) * parseFloat(item.rate)).toFixed(2);
                                            return (
                                            <tr key={item.id}>
                                                <td data-label="क्र.सं.">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td data-label="केंद्र का नाम">{item.center_name}</td>
                                                <td data-label="घटक">{item.component}</td>
                                                <td data-label="निवेश का नाम">{item.investment_name}</td>
                                                <td data-label="इकाई">{item.unit}</td>
                                                <td data-label="आवंटित मात्रा">{item.allocated_quantity}</td>
                                                <td data-label="दर">{item.rate}</td>
                                                <td data-label="आवंटित राशि">{allocatedAmount}</td>
                                                <td data-label="अपडेट की गई मात्रा">{item.updated_quantity}</td>
                                                <td data-label="अपडेट की गई राशि">{updatedAmount}</td>
                                                <td data-label="स्रोत">{item.source_of_receipt}</td>
                                                <td data-label="योजना">{item.scheme_name}</td>
                                            </tr>
                                            );
                                        })}
                                      </tbody>
                                      <tfoot>
                                        <tr className="font-weight-bold">
                                            <td colSpan="7">कुल</td>
                                            <td>{formatCurrency(tableTotals.allocated)}</td>
                                            <td colSpan="1"></td>
                                            <td>{formatCurrency(tableTotals.updated)}</td>
                                            <td colSpan="2"></td>
                                        </tr>
                                      </tfoot>
                                    </table>
                                    
                                    {totalPages > 1 && (
                                        <div className=" mt-2">
                                            <div className="small-fonts mb-3 text-center">
                                                {paginationTranslations.page} {currentPage} {paginationTranslations.of} {totalPages}
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
                                    {selectedCategory ? `चयनित फ़िल्टर के लिए कोई वस्तु नहीं मिली: ${selectedValue || 'सभी'}.` : 'विस्तृत विवरण देखने के लिए कृपया ऊपर एक श्रेणी कार्ड चुनें।'}
                                </Alert>
                            )}
                          </div>
                        </div>
                      </Row>
                    </div>
                </>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default MainDashboard;