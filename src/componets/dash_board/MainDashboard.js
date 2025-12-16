import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Spinner, Alert, Row, Col, Card, Button, ListGroup, Pagination, Badge, Accordion, Table } from "react-bootstrap";
import { FaFileExcel, FaFilePdf, FaArrowLeft, FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import Footer from "../footer/Footer";

const API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/";

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

// Component for expandable section
const ExpandableSection = ({ title, count, totalAmount, children, defaultExpanded = false, level = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    
    const getIndentStyle = () => {
        switch(level) {
            case 0: return { marginLeft: '0px' };
            case 1: return { marginLeft: '20px' };
            case 2: return { marginLeft: '40px' };
            case 3: return { marginLeft: '60px' };
            default: return { marginLeft: '0px' };
        }
    };
    
    return (
        <div className="expandable-section mb-3" style={getIndentStyle()}>
            <div 
                className="expandable-header d-flex justify-content-between align-items-center p-2 bg-light rounded"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ cursor: 'pointer' }}
            >
                <div className="d-flex align-items-center">
                    {isExpanded ? <FaChevronDown className="me-2" /> : <FaChevronRight className="me-2" />}
                    <h5 className="mb-0">{title}</h5>
                    {count > 0 && <Badge bg="primary" className="ms-2">{count}</Badge>}
                </div>
                <div className="d-flex align-items-center">
                    <span className="me-2 fw-bold">{formatCurrency(totalAmount)}</span>
                </div>
            </div>
            {isExpanded && (
                <div className="expandable-content p-3">
                    {children}
                </div>
            )}
        </div>
    );
};

const MainDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // State for API data, loading, and errors
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for managing multiple active filters from ANY category
  const [activeFilters, setActiveFilters] = useState({}); 
  
  // State to control which category's filter buttons are being shown
  const [filterCategory, setFilterCategory] = useState(null); 
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State for expanded investment rows
  const [expandedInvestments, setExpandedInvestments] = useState({});

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const billingResponse = await fetch(API_URL);
        if (!billingResponse.ok) {
          throw new Error(`HTTP error! status: ${billingResponse.status}`);
        }
        const billingJson = await billingResponse.json();
        setBillingData(billingJson);
        
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
  }, [activeFilters]);

  const getFieldIcon = (field) => {
    const icons = {
        center_name: '🏢',
        component: '📦',
        investment_name: '💼',
        unit: '📏',
        source_of_receipt: '💰',
        scheme_name: '📋'
    };
    return icons[field] || '📊';
  };

  // --- useMemo for processing data for cards and table ---
  const { categoryCardsData, filteredTableData, tableTotals, paginatedData, totalPages, hierarchicalData, investmentSummaryData } = useMemo(() => {
    if (!billingData || billingData.length === 0) {
        return { 
            categoryCardsData: [], 
            filteredTableData: [], 
            tableTotals: { allocated: 0, updated: 0 },
            paginatedData: [],
            totalPages: 0,
            hierarchicalData: null,
            investmentSummaryData: []
        };
    }

    // --- 1. Calculate Data for Category Filter Cards ---
    const fieldsToCardify = ['center_name', 'component', 'investment_name', 'unit', 'source_of_receipt', 'scheme_name'];
    const categoryCards = fieldsToCardify.map(field => {
        const uniqueValues = [...new Set(billingData.map(item => item[field]))].sort(); // Sort values
        return { 
            key: field, 
            title: formatFieldTitle(field), 
            count: uniqueValues.length,
            icon: getFieldIcon(field),
            values: uniqueValues
        };
    });
    
    // --- 2. Filter Data for Table based on ALL activeFilters from ANY category
    let filtered = billingData;
    // This loop applies every active filter, regardless of its category
    Object.keys(activeFilters).forEach(category => {
        const values = activeFilters[category];
        if (values && values.length > 0) {
            filtered = filtered.filter(item => values.includes(item[category]));
        }
    });
    
    // --- 2.1 Create hierarchical data structure ---
    let hierarchical = null;
    
    if (Object.keys(activeFilters).length > 0) {
        // Determine the primary filter (first one in the activeFilters object)
        const primaryFilterKey = Object.keys(activeFilters)[0];
        
        // Group by primary filter
        const groupedByPrimary = {};
        filtered.forEach(item => {
            const primaryValue = item[primaryFilterKey];
            if (!groupedByPrimary[primaryValue]) {
                groupedByPrimary[primaryValue] = {
                    name: primaryValue,
                    totalAllocated: 0,
                    totalUpdated: 0,
                    items: []
                };
            }
            
            const allocatedAmount = parseFloat(item.allocated_quantity) * parseFloat(item.rate);
            const updatedAmount = parseFloat(item.updated_quantity) * parseFloat(item.rate);
            
            groupedByPrimary[primaryValue].totalAllocated += allocatedAmount;
            groupedByPrimary[primaryValue].totalUpdated += updatedAmount;
            groupedByPrimary[primaryValue].items.push(item);
        });
        
        // For each primary group, group by center_name
        Object.keys(groupedByPrimary).forEach(primaryValue => {
            const primaryGroup = groupedByPrimary[primaryValue];
            const centers = {};
            
            primaryGroup.items.forEach(item => {
                const centerName = item.center_name;
                if (!centers[centerName]) {
                    centers[centerName] = {
                        name: centerName,
                        totalAllocated: 0,
                        totalUpdated: 0,
                        items: []
                    };
                }
                
                const allocatedAmount = parseFloat(item.allocated_quantity) * parseFloat(item.rate);
                const updatedAmount = parseFloat(item.updated_quantity) * parseFloat(item.rate);
                
                centers[centerName].totalAllocated += allocatedAmount;
                centers[centerName].totalUpdated += updatedAmount;
                centers[centerName].items.push(item);
            });
            
            // For each center, group by unit
            Object.keys(centers).forEach(centerName => {
                const center = centers[centerName];
                const units = {};
                
                center.items.forEach(item => {
                    const unit = item.unit;
                    if (!units[unit]) {
                        units[unit] = {
                            name: unit,
                            totalAllocated: 0,
                            totalUpdated: 0,
                            items: []
                        };
                    }
                    
                    const allocatedAmount = parseFloat(item.allocated_quantity) * parseFloat(item.rate);
                    const updatedAmount = parseFloat(item.updated_quantity) * parseFloat(item.rate);
                    
                    units[unit].totalAllocated += allocatedAmount;
                    units[unit].totalUpdated += updatedAmount;
                    units[unit].items.push(item);
                });
                
                // For each unit, group by component (firm)
                Object.keys(units).forEach(unitName => {
                    const unit = units[unitName];
                    const components = {};
                    
                    unit.items.forEach(item => {
                        const component = item.component;
                        if (!components[component]) {
                            components[component] = {
                                name: component,
                                totalAllocated: 0,
                                totalUpdated: 0,
                                items: []
                            };
                        }
                        
                        const allocatedAmount = parseFloat(item.allocated_quantity) * parseFloat(item.rate);
                        const updatedAmount = parseFloat(item.updated_quantity) * parseFloat(item.rate);
                        
                        components[component].totalAllocated += allocatedAmount;
                        components[component].totalUpdated += updatedAmount;
                        components[component].items.push(item);
                    });
                    
                    unit.components = components;
                });
                
                center.units = units;
            });
            
            primaryGroup.centers = centers;
        });
        
        hierarchical = {
            primaryFilter: primaryFilterKey,
            groups: groupedByPrimary
        };
    }
    
    // --- 2.2 Create investment summary data based on filters ---
    let investmentSummary = {};
    
    // Determine grouping field based on active filters
    // Default to center_name initially, then use first selected filter
    let groupingField = 'center_name'; // Default grouping by center (केंद्र)
    
    if (Object.keys(activeFilters).length > 0) {
        // Use the first active filter as the grouping field
        groupingField = Object.keys(activeFilters)[0];
    }
    
    // Group filtered data by the selected grouping field
    filtered.forEach(item => {
        const groupValue = item[groupingField];
        if (!investmentSummary[groupValue]) {
            investmentSummary[groupValue] = {
                group_name: groupValue,
                group_field: groupingField,
                investment_names: new Set(),
                center_names: new Set(),
                components: new Set(),
                units: new Set(),
                sources: new Set(),
                schemes: new Set(),
                totalAllocated: 0,
                totalUpdated: 0,
                items: []
            };
        }
        
        const allocatedAmount = parseFloat(item.allocated_quantity) * parseFloat(item.rate);
        const updatedAmount = parseFloat(item.updated_quantity) * parseFloat(item.rate);
        
        // Only add to sets if it's not the grouping field
        if (groupingField !== 'investment_name') {
            investmentSummary[groupValue].investment_names.add(item.investment_name);
        }
        if (groupingField !== 'center_name') {
            investmentSummary[groupValue].center_names.add(item.center_name);
        }
        if (groupingField !== 'component') {
            investmentSummary[groupValue].components.add(item.component);
        }
        if (groupingField !== 'unit') {
            investmentSummary[groupValue].units.add(item.unit);
        }
        if (groupingField !== 'source_of_receipt') {
            investmentSummary[groupValue].sources.add(item.source_of_receipt);
        }
        if (groupingField !== 'scheme_name') {
            investmentSummary[groupValue].schemes.add(item.scheme_name);
        }
        
        investmentSummary[groupValue].totalAllocated += allocatedAmount;
        investmentSummary[groupValue].totalUpdated += updatedAmount;
        investmentSummary[groupValue].items.push(item);
    });
    
    // Convert sets to comma-separated strings and create array
    const investmentSummaryArray = Object.values(investmentSummary).map(item => ({
        ...item,
        investment_names: Array.from(item.investment_names).join(', '),
        center_names: Array.from(item.center_names).join(', '),
        components: Array.from(item.components).join(', '),
        units: Array.from(item.units).join(', '),
        sources: Array.from(item.sources).join(', '),
        schemes: Array.from(item.schemes).join(', ')
    }));
    
    // --- 3. Calculate Totals for the Filtered Table ---
    const totals = filtered.reduce((acc, item) => {
        acc.allocated += parseFloat(item.allocated_quantity) * parseFloat(item.rate);
        acc.updated += parseFloat(item.updated_quantity) * parseFloat(item.rate);
        return acc;
    }, { allocated: 0, updated: 0 });
    
    // --- 4. Paginate the filtered data ---
    const totalPagesCount = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    return {
        categoryCardsData: categoryCards,
        filteredTableData: filtered,
        tableTotals: totals,
        paginatedData: paginated,
        totalPages: totalPagesCount,
        hierarchicalData: hierarchical,
        investmentSummaryData: investmentSummaryArray
    };

  }, [billingData, activeFilters, currentPage, itemsPerPage]);

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
  
  const downloadInvestmentSummaryExcel = (data, filename) => {
    try {
      const excelData = data.map((item, index) => {
        const row = {
            'क्र.सं.': index + 1,
            [formatFieldTitle(item.group_field)]: item.group_name
        };
        
        // Only include columns that are not the grouping field
        if (item.group_field !== 'investment_name') {
            row['निवेश का नाम'] = item.investment_names;
        }
        if (item.group_field !== 'center_name') {
            row['केंद्र का नाम'] = item.center_names;
        }
        if (item.group_field !== 'component') {
            row['घटक'] = item.components;
        }
        if (item.group_field !== 'unit') {
            row['इकाई'] = item.units;
        }
        
        row['आवंटित राशि'] = item.totalAllocated.toFixed(2);
        row['अपडेट की गई राशि'] = item.totalUpdated.toFixed(2);
        
        if (item.group_field !== 'source_of_receipt') {
            row['स्रोत'] = item.sources;
        }
        if (item.group_field !== 'scheme_name') {
            row['योजना'] = item.schemes;
        }
        
        return row;
      });
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "Grouped Summary");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
      console.error("Error generating Excel file:", e);
      setError("Excel file generation failed. Please try again.");
    }
  };
  
  const downloadPdf = (data, filename) => {
    try {
      const filterInfoText = Object.keys(activeFilters).map(cat => 
        `${formatFieldTitle(cat)}: ${activeFilters[cat].join(', ')}`
      ).join(' | ');

      const tableHtml = `
        <html>
          <head>
            <title>बिलिंग विवरण</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; }
              p { text-align: center; font-weight: bold; }
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
            ${filterInfoText ? `<p>फ़िल्टर: ${filterInfoText}</p>` : ''}
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
  
  const downloadInvestmentSummaryPdf = (data, filename) => {
    try {
      const filterInfoText = Object.keys(activeFilters).map(cat => 
        `${formatFieldTitle(cat)}: ${activeFilters[cat].join(', ')}`
      ).join(' | ');

      // Dynamically create table headers based on grouping field
      const getTableHeaders = () => {
        if (data.length === 0) return ['समूह', 'निवेश का नाम', 'केंद्र का नाम', 'घटक', 'इकाई', 'आवंटित राशि', 'अपडेट की गई राशि', 'स्रोत', 'योजना'];
        
        const groupField = data[0].group_field;
        const headers = ['क्र.सं.', formatFieldTitle(groupField)];
        
        if (groupField !== 'investment_name') headers.push('निवेश का नाम');
        if (groupField !== 'center_name') headers.push('केंद्र का नाम');
        if (groupField !== 'component') headers.push('घटक');
        if (groupField !== 'unit') headers.push('इकाई');
        headers.push('आवंटित राशि', 'अपडेट की गई राशि');
        if (groupField !== 'source_of_receipt') headers.push('स्रोत');
        if (groupField !== 'scheme_name') headers.push('योजना');
        
        return headers;
      };

      const headers = getTableHeaders();
      
      const tableHtml = `
        <html>
          <head>
            <title>समूह विवरण</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; }
              p { text-align: center; font-weight: bold; }
              table { border-collapse: collapse; width: 100%; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .summary { margin-top: 20px; font-weight: bold; }
              .expandable-row { cursor: pointer; }
              @media print {
                .no-print { display: none; }
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <h1>समूह विवरण</h1>
            ${filterInfoText ? `<p>फ़िल्टर: ${filterInfoText}</p>` : ''}
            <table>
              <thead>
                <tr>
                  ${headers.map(h => `<th>${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map((item, index) => {
                  const getTableRow = () => {
                    const cells = [
                        `<td>${index + 1}</td>`,
                        `<td>${item.group_name}</td>`
                    ];
                    
                    if (item.group_field !== 'investment_name') cells.push(`<td>${item.investment_names}</td>`);
                    if (item.group_field !== 'center_name') cells.push(`<td>${item.center_names}</td>`);
                    if (item.group_field !== 'component') cells.push(`<td>${item.components}</td>`);
                    if (item.group_field !== 'unit') cells.push(`<td>${item.units}</td>`);
                    cells.push(`<td>${formatCurrency(item.totalAllocated)}</td>`);
                    cells.push(`<td>${formatCurrency(item.totalUpdated)}</td>`);
                    if (item.group_field !== 'source_of_receipt') cells.push(`<td>${item.sources}</td>`);
                    if (item.group_field !== 'scheme_name') cells.push(`<td>${item.schemes}</td>`);
                    
                    return `<tr class="expandable-row">${cells.join('')}</tr>`;
                  };
                  
                  return getTableRow();
                }).join('')}
              </tbody>
              <tfoot>
                <tr class="summary">
                  <td colspan="${headers.length - 3}">कुल</td>
                  <td>${formatCurrency(tableTotals.allocated)}</td>
                  <td colspan="1"></td>
                  <td>${formatCurrency(tableTotals.updated)}</td>
                  <td colspan="${headers.length - 7}"></td>
                </tr>
              </tfoot>
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
      console.error("Error generating PDF:", e);
      setError("PDF generation failed. Please try again.");
    }
  };

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  
  // Handler for clicking category cards
  const handleCategoryCardClick = (key) => {
    // Find the card with the clicked key to get its values
    const card = categoryCardsData.find(c => c.key === key);
    if (card && card.values.length > 0) {
        // Set the filter category to show the buttons
        setFilterCategory(key);
        
        // If this category doesn't have active filters yet, set the first value as default
        if (!activeFilters[key] || activeFilters[key].length === 0) {
            // Set the filter with only the first value for this category
            setActiveFilters(prev => ({ ...prev, [key]: [card.values[0]] }));
        }
    }
  };

  // Handler for clicking filter buttons
  const handleFilterButtonClick = (category, value) => {
    setActiveFilters(prev => {
        const currentValues = prev[category] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        
        if (newValues.length === 0) {
            const newFilters = { ...prev };
            delete newFilters[category];
            return newFilters;
        }

        return { ...prev, [category]: newValues };
    });
  };
  
  const clearAllFilters = () => {
    setActiveFilters({});
    setFilterCategory(null);
  };
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Toggle investment row expansion
  const toggleInvestmentExpansion = (groupValue) => {
    setExpandedInvestments(prev => ({
        ...prev,
        [groupValue]: !prev[groupValue]
    }));
  };

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

  const paginationItems = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  if (startPage > 1) {
    paginationItems.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
    if (startPage > 2) {
      paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }
  }
  
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
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
    }
    paginationItems.push(<Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>{totalPages}</Pagination.Item>);
  }

  // Render hierarchical view if filters are active
  const renderHierarchicalView = () => {
    if (!hierarchicalData) return null;
    
    const { primaryFilter, groups } = hierarchicalData;
    
    return (
        <div className="hierarchical-view">
            {Object.keys(groups).map(groupKey => {
                const group = groups[groupKey];
                return (
                    <ExpandableSection 
                        key={groupKey}
                        title={`${formatFieldTitle(primaryFilter)}: ${group.name}`}
                        count={Object.keys(group.centers || {}).length}
                        totalAmount={group.totalAllocated}
                        defaultExpanded={true}
                        level={0}
                    >
                        {Object.keys(group.centers || {}).map(centerKey => {
                            const center = group.centers[centerKey];
                            return (
                                <ExpandableSection 
                                    key={centerKey}
                                    title={`केंद्र: ${center.name}`}
                                    count={Object.keys(center.units || {}).length}
                                    totalAmount={center.totalAllocated}
                                    level={1}
                                >
                                    {Object.keys(center.units || {}).map(unitKey => {
                                        const unit = center.units[unitKey];
                                        return (
                                            <ExpandableSection 
                                                key={unitKey}
                                                title={`इकाई: ${unit.name}`}
                                                count={Object.keys(unit.components || {}).length}
                                                totalAmount={unit.totalAllocated}
                                                level={2}
                                            >
                                                {Object.keys(unit.components || {}).map(componentKey => {
                                                    const component = unit.components[componentKey];
                                                    return (
                                                        <ExpandableSection 
                                                            key={componentKey}
                                                            title={`घटक: ${component.name}`}
                                                            count={component.items.length}
                                                            totalAmount={component.totalAllocated}
                                                            level={3}
                                                        >
                                                            <Table striped bordered hover responsive className="small-fonts">
                                                                <thead>
                                                                    <tr>
                                                                        <th>क्र.सं.</th>
                                                                        <th>निवेश का नाम</th>
                                                                        <th>आवंटित मात्रा</th>
                                                                        <th>दर</th>
                                                                        <th>आवंटित राशि</th>
                                                                        <th>अपडेट की गई मात्रा</th>
                                                                        <th>अपडेट की गई राशि</th>
                                                                        <th>स्रोत</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {component.items.map((item, index) => {
                                                                        const allocatedAmount = (parseFloat(item.allocated_quantity) * parseFloat(item.rate)).toFixed(2);
                                                                        const updatedAmount = (parseFloat(item.updated_quantity) * parseFloat(item.rate)).toFixed(2);
                                                                        return (
                                                                            <tr key={index}>
                                                                                <td>{index + 1}</td>
                                                                                <td>{item.investment_name}</td>
                                                                                <td>{item.allocated_quantity}</td>
                                                                                <td>{item.rate}</td>
                                                                                <td>{allocatedAmount}</td>
                                                                                <td>{item.updated_quantity}</td>
                                                                                <td>{updatedAmount}</td>
                                                                                <td>{item.source_of_receipt}</td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                                <tfoot>
                                                                    <tr className="font-weight-bold">
                                                                        <td colSpan="4">कुल</td>
                                                                        <td>{formatCurrency(component.totalAllocated)}</td>
                                                                        <td colSpan="1"></td>
                                                                        <td>{formatCurrency(component.totalUpdated)}</td>
                                                                        <td colSpan="1"></td>
                                                                    </tr>
                                                                </tfoot>
                                                            </Table>
                                                        </ExpandableSection>
                                                    );
                                                })}
                                            </ExpandableSection>
                                        );
                                    })}
                                </ExpandableSection>
                            );
                        })}
                    </ExpandableSection>
                );
            })}
        </div>
    );
  };

  // Helper to render filter buttons for a category
  const renderFilterButtons = (category) => {
    const card = categoryCardsData.find(c => c.key === category);
    if (!card) return null;
    
    return card.values.map((value) => (
        <Col key={value} xs="auto" className="mb-2">
            <Button 
                variant={(activeFilters[category] || []).includes(value) ? "primary" : "outline-secondary"}
                size="sm"
                className="filter-button"
                onClick={() => handleFilterButtonClick(category, value)}
            >
                {value}
            </Button>
        </Col>
    ));
  };

  return (
    <>
      <div className="dashboard-container">
        <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content">
         <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <Container fluid className="dashboard-body">
            <h1 className="page-title small-fonts">डैशबोर्ड</h1>

            {/* Category Filter Cards Section */}
            <div className="category-cards-container mb-4">
                <Row className="g-3">
                    {categoryCardsData.map((card) => (
                        <Col key={card.key} xs={6} md={3}>
                            <Card 
                                className={`high-level-summary-card text-center h-100 ${activeFilters[card.key] ? 'active' : ''}`}
                                onClick={() => handleCategoryCardClick(card.key)}
                            >
                                <Card.Body>
                                    <div className="card-icon">{card.icon}</div>
                                    <Card.Title className="small-fonts">{card.title}</Card.Title>
                                    <Card.Text className="summary-value small-fonts">{card.count} प्रकार</Card.Text>
                                    {activeFilters[card.key] && (
                                        <Badge bg="success" pill>{activeFilters[card.key].length} चयनित</Badge>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Filter Buttons Section - Shows directly when a card is clicked */}
            {filterCategory && (
                <div className="filter-buttons-container mb-4 p-3 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0 small-fonts">{formatFieldTitle(filterCategory)} का चयन करें</h5>
                        <Button variant="outline-secondary" size="sm" onClick={() => setFilterCategory(null)}>
                            <FaTimes className="me-1" /> बंद करें
                        </Button>
                    </div>
                    <Row className="g-1 align-items-center">
                        {renderFilterButtons(filterCategory)}
                    </Row>
                </div>
            )}

            {/* Active Filters Section */}
            {Object.keys(activeFilters).length > 0 && (
                <div className="active-filters-container mb-4 p-2 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 small-fonts">लागू फ़िल्टर:</h6>
                        <Button variant="danger" size="sm" onClick={clearAllFilters}>
                            <FaTimes className="me-1" /> सभी फ़िल्टर हटाएं
                        </Button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        {Object.keys(activeFilters).map((categoryKey) => (
                            <div key={categoryKey} className="filter-category">
                                <strong>{formatFieldTitle(categoryKey)}:</strong>
                                <div className="d-flex flex-wrap gap-1 mt-1">
                                    {activeFilters[categoryKey].map((value) => (
                                        <Badge 
                                            key={value} 
                                            bg="primary" 
                                            pill 
                                            className="filter-badge"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                const newValues = activeFilters[categoryKey].filter(v => v !== value);
                                                if (newValues.length === 0) {
                                                    const newFilters = { ...activeFilters };
                                                    delete newFilters[categoryKey];
                                                    setActiveFilters(newFilters);
                                                } else {
                                                    setActiveFilters(prev => ({ ...prev, [categoryKey]: newValues }));
                                                }
                                            }}
                                        >
                                            {value} <FaTimes style={{ fontSize: '0.6em' }} />
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Billing Items Table - Always show table with filtered data */}
            <div className="billing-table-container">
              <h2 className="dynamic-table-heading small-fonts">
                बिलिंग विवरण
                <span className="heading-totals">
                    (कुल आवंटित: {formatCurrency(tableTotals.allocated)}, कुल अपडेट किया गया: {formatCurrency(tableTotals.updated)})
                </span>
                {Object.keys(activeFilters).length > 0 && (
                    <span className="heading-filter-info">
                        - <strong>
                            {Object.keys(activeFilters).map(cat => `${formatFieldTitle(cat)}: ${activeFilters[cat].join(', ')}`).join(' | ')}
                        </strong>
                    </span>
                )}
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
                            {Object.keys(activeFilters).length > 0 ? 'चयनित फ़िल्टर के लिए कोई वस्तु नहीं मिली.' : 'कोई डेटा उपलब्ध नहीं है।'}
                        </Alert>
                    )}
                  </div>
                </div>
              </Row>
            </div>

            {/* Grouped Summary Table - Initially shows by center (केंद्र) */}
            {filteredTableData.length > 0 && (
                <div className="grouped-summary-container mt-4">
                    <h2 className="dynamic-table-heading small-fonts">
                        {investmentSummaryData.length > 0 ? formatFieldTitle(investmentSummaryData[0].group_field) : 'समूह'} विवरण
                        <span className="heading-totals">
                            (कुल आवंटित: {formatCurrency(tableTotals.allocated)}, कुल अपडेट किया गया: {formatCurrency(tableTotals.updated)})
                        </span>
                    </h2>
                    
                    <div className="d-flex justify-content-end mb-2">
                      <Button 
                        variant="outline-success" 
                        size="sm" 
                        onClick={() => downloadInvestmentSummaryExcel(investmentSummaryData, `Grouped_Summary_${new Date().toISOString().slice(0, 10)}`)}
                        className="me-2"
                      >
                        <FaFileExcel className="me-1" />Excel
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => downloadInvestmentSummaryPdf(investmentSummaryData, `Grouped_Summary_${new Date().toISOString().slice(0, 10)}`)}
                      >
                        <FaFilePdf className="me-1" />
                        PDF
                      </Button>
                    </div>
                    
                    <table className="responsive-table small-fonts">
                      <thead>
                        <tr>
                          <th>क्र.सं.</th>
                          <th>{investmentSummaryData.length > 0 ? formatFieldTitle(investmentSummaryData[0].group_field) : 'समूह'}</th>
                          {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'investment_name' && <th>निवेश का नाम</th>}
                          {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'center_name' && <th>केंद्र का नाम</th>}
                          {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'component' && <th>घटक</th>}
                          {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'unit' && <th>इकाई</th>}
                          <th>आवंटित राशि</th>
                          <th>अपडेट की गई राशि</th>
                          {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'source_of_receipt' && <th>स्रोत</th>}
                          {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'scheme_name' && <th>योजना</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {investmentSummaryData.map((item, index) => (
                            <React.Fragment key={index}>
                                <tr 
                                    className="grouped-summary-row" 
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleInvestmentExpansion(item.group_name)}
                                >
                                    <td>{index + 1}</td>
                                    <td>{item.group_name}</td>
                                    {item.group_field !== 'investment_name' && <td>{item.investment_names}</td>}
                                    {item.group_field !== 'center_name' && <td>{item.center_names}</td>}
                                    {item.group_field !== 'component' && <td>{item.components}</td>}
                                    {item.group_field !== 'unit' && <td>{item.units}</td>}
                                    <td>{formatCurrency(item.totalAllocated)}</td>
                                    <td>{formatCurrency(item.totalUpdated)}</td>
                                    {item.group_field !== 'source_of_receipt' && <td>{item.sources}</td>}
                                    {item.group_field !== 'scheme_name' && <td>{item.schemes}</td>}
                                </tr>
                                {expandedInvestments[item.group_name] && (
                                    <tr>
                                        <td colSpan="12">
                                            <div className="p-3">
                                                <h5 className="mb-3">{item.group_name} - विस्तृत विवरण</h5>
                                                <div className="d-flex justify-content-end mb-2">
                                                  <Button 
                                                    variant="outline-success" 
                                                    size="sm" 
                                                    onClick={() => downloadExcel(item.items, `${item.group_name}_Details_${new Date().toISOString().slice(0, 10)}`)}
                                                    className="me-2"
                                                  >
                                                    <FaFileExcel className="me-1" />Excel
                                                  </Button>
                                                  <Button 
                                                    variant="outline-danger" 
                                                    size="sm" 
                                                    onClick={() => downloadPdf(item.items, `${item.group_name}_Details_${new Date().toISOString().slice(0, 10)}`)}
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
                                                        {item.items.map((detailItem, detailIndex) => {
                                                            const allocatedAmount = (parseFloat(detailItem.allocated_quantity) * parseFloat(detailItem.rate)).toFixed(2);
                                                            const updatedAmount = (parseFloat(detailItem.updated_quantity) * parseFloat(detailItem.rate)).toFixed(2);
                                                            return (
                                                                <tr key={detailIndex}>
                                                                    <td>{detailIndex + 1}</td>
                                                                    <td>{detailItem.center_name}</td>
                                                                    <td>{detailItem.component}</td>
                                                                    <td>{detailItem.investment_name}</td>
                                                                    <td>{detailItem.unit}</td>
                                                                    <td>{detailItem.allocated_quantity}</td>
                                                                    <td>{detailItem.rate}</td>
                                                                    <td>{allocatedAmount}</td>
                                                                    <td>{detailItem.updated_quantity}</td>
                                                                    <td>{updatedAmount}</td>
                                                                    <td>{detailItem.source_of_receipt}</td>
                                                                    <td>{detailItem.scheme_name}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-weight-bold">
                            <td colSpan="6">कुल</td>
                            <td>{formatCurrency(tableTotals.allocated)}</td>
                            <td colSpan="1"></td>
                            <td>{formatCurrency(tableTotals.updated)}</td>
                            <td colSpan="2"></td>
                        </tr>
                      </tfoot>
                    </table>
                </div>
            )}

            {/* Hierarchical View Section - Show when filters are active */}
            {Object.keys(activeFilters).length > 0 && (
                <div className="hierarchical-view-container mt-4">
                    <h2 className="dynamic-table-heading small-fonts mb-3">
                        विस्तृत दृश्य
                        <span className="heading-totals">
                            (कुल आवंटित: {formatCurrency(tableTotals.allocated)}, कुल अपडेट किया गया: {formatCurrency(tableTotals.updated)})
                        </span>
                    </h2>
                    
                    <div className="d-flex justify-content-end mb-2">
                      <Button 
                        variant="outline-success" 
                        size="sm" 
                        onClick={() => downloadExcel(filteredTableData, `Hierarchical_Billing_Data_${new Date().toISOString().slice(0, 10)}`)}
                        className="me-2"
                      >
                        <FaFileExcel className="me-1" />Excel
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => downloadPdf(filteredTableData, `Hierarchical_Billing_Data_${new Date().toISOString().slice(0, 10)}`)}
                      >
                        <FaFilePdf className="me-1" />
                        PDF
                      </Button>
                    </div>
                    
                    {renderHierarchicalView()}
                </div>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default MainDashboard;