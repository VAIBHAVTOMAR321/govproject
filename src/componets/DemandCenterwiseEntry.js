import React, { useState, useEffect } from "react";
import {
  Container,
  Alert,
  Table,
  Spinner,
  Pagination,
  Button,
  Form,
  Row,
  Col
} from "react-bootstrap";
import axios from "axios";
import DemandNavigation from "./DemandNavigation";
import { useCenter } from "./all_login/CenterContext";
import * as XLSX from "xlsx";
import html2pdf from "html2pdf.js";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import Select from "react-select";

// API URL
const BILLING_API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/";

// Available columns for the table (excluding sno which is always shown)
const billingTableColumns = [
  { key: "scheme_name", label: "योजना का नाम" },
  { key: "investment_name", label: "निवेश का नाम" },
  { key: "sub_investment_name", label: "उप-निवेश का नाम" },
  { key: "unit", label: "इकाई" },
  { key: "allocated_quantity", label: "आवंटित मात्रा" },
  { key: "rate", label: "दर" },
  { key: "amount_of_farmer_share", label: "किसान का हिस्सा" },
  { key: "amount_of_subsidy", label: "सब्सिडी राशि" },
  { key: "total_amount", label: "कुल राशि" },
  { key: "bill_date", label: "पंजीकरण तिथि" },
];

// Column mapping for data access
const billingTableColumnMapping = {
  sno: { header: "क्र.सं.", accessor: (item, index) => index + 1 },
  center_name: {
    header: "केंद्र का नाम",
    accessor: (item) => item.center_name,
  },
  vidhan_sabha_name: {
    header: "विधानसभा का नाम",
    accessor: (item) => item.vidhan_sabha_name,
  },
  vikas_khand_name: {
    header: "विकास खंड का नाम",
    accessor: (item) => item.vikas_khand_name,
  },
  scheme_name: { header: "योजना का नाम", accessor: (item) => item.scheme_name },
  ikai: { header: "इकाई  ", accessor: (item) => item.ikai || "" },
  source_of_receipt: {
    header: "सप्लायर",
    accessor: (item) => item.source_of_receipt,
  },
  investment_name: {
    header: "निवेश का नाम",
    accessor: (item) => item.investment_name,
  },
  sub_investment_name: {
    header: "उप-निवेश का नाम",
    accessor: (item) => item.sub_investment_name,
  },
  unit: { header: "इकाई", accessor: (item) => item.unit },
  allocated_quantity: {
    header: "आवंटित मात्रा",
    accessor: (item) => item.allocated_quantity,
  },
  rate: { header: "दर", accessor: (item) => item.rate },
  amount_of_farmer_share: {
    header: "किसान का हिस्सा",
    accessor: (item) => item.amount_of_farmer_share || 0,
  },
  amount_of_subsidy: {
    header: "सब्सिडी राशि",
    accessor: (item) => item.amount_of_subsidy || 0,
  },
  total_amount: {
    header: "कुल राशि",
    accessor: (item) => item.total_amount || 0,
  },
  bill_date: {
    header: "पंजीकरण तिथि",
    accessor: (item) => {
      if (!item.bill_date) return "";
      const date = new Date(item.bill_date);
      return date.toLocaleDateString("hi-IN");
    },
  },
};

// Helper function to calculate financial year dates (April 1 to March 31)
const getFinancialYearDates = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  let fromDate, toDate;
  
  // If current month is April (3) or later, FY is current year April to next year March
  // If current month is before April (Jan-Mar), FY is previous year April to current year March
  if (currentMonth >= 3) {
    fromDate = new Date(currentYear, 3, 1); // April 1 of current year
    toDate = new Date(currentYear + 1, 2, 31); // March 31 of next year
  } else {
    fromDate = new Date(currentYear - 1, 3, 1); // April 1 of previous year
    toDate = new Date(currentYear, 2, 31); // March 31 of current year
  }
  
  return {
    fromDate: fromDate.toISOString().split('T')[0],
    toDate: toDate.toISOString().split('T')[0],
  };
};

const DemandCenterwiseEntry = () => {
  const { centerData } = useCenter();
  
  // Reusable Column Selection Component
  const ColumnSelection = ({
    columns,
    selectedColumns,
    setSelectedColumns,
    title,
  }) => {
    const handleColumnToggle = (columnKey) => {
      if (selectedColumns.includes(columnKey)) {
        setSelectedColumns(selectedColumns.filter((col) => col !== columnKey));
      } else {
        setSelectedColumns([...selectedColumns, columnKey]);
      }
    };

    const handleSelectAll = () => {
      setSelectedColumns(columns.map((col) => col.key));
    };

    const handleDeselectAll = () => {
      setSelectedColumns([]);
    };

    return (
      <div className="column-selection mb-3 p-3 border rounded bg-light">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="small-fonts mb-0">{title}</h6>
          <div>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleSelectAll}
              className="me-2"
            >
              सभी चुनें
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleDeselectAll}
            >
              सभी हटाएं
            </Button>
          </div>
        </div>
        <Row>
          <Col>
            <div className="d-flex flex-wrap">
              {columns.map((col) => (
                <Form.Check
                  key={col.key}
                  type="checkbox"
                  id={`col-${col.key}`}
                  checked={selectedColumns.includes(col.key)}
                  onChange={() => handleColumnToggle(col.key)}
                  className="me-3 mb-2"
                  label={<span className="small-fonts">{col.label}</span>}
                />
              ))}
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  const [selectedColumns, setSelectedColumns] = useState(
    billingTableColumns.map((col) => col.key)
  );
  
  const [billingItems, setBillingItems] = useState([]);
  const [filteredBillingItems, setFilteredBillingItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [centerDetails, setCenterDetails] = useState({
    center_name: "",
    vidhan_sabha_name: "",
    vikas_khand_name: "",
  });
  
  // State for filters
  const [dateRange, setDateRange] = useState({
    fromDate: "",
    toDate: ""
  });
  const [selectedInvestments, setSelectedInvestments] = useState([]);
  const [selectedSubInvestments, setSelectedSubInvestments] = useState([]);
  const [selectedSchemes, setSelectedSchemes] = useState([]);
  const [investmentOptions, setInvestmentOptions] = useState([]);
  const [subInvestmentOptions, setSubInvestmentOptions] = useState([]);
  const [schemeOptions, setSchemeOptions] = useState([]);
  const [tableVisible, setTableVisible] = useState(false);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch billing items data
  const fetchBillingItems = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const response = await axios.get(BILLING_API_URL);
      const data =
        response.data && response.data.data
          ? response.data.data
          : response.data;
      const items = Array.isArray(data) ? data : [];
      
      console.log("Fetched billing items:", items);
      console.log("Center data from context:", centerData);
      
      // Check all center names in API response
      const allCenterNames = items.map(item => item.center_name);
      console.log("All center names in API response:", allCenterNames);
      
      // Filter items by center name client-side with robust comparison
      const filteredItems = items.filter(item => {
        const apiCenterName = item.center_name ? item.center_name.trim().normalize('NFKD') : '';
        const contextCenterName = centerData.centerName ? centerData.centerName.trim().normalize('NFKD') : '';
        
        console.log("Comparing:", apiCenterName, "vs", contextCenterName);
        
        return apiCenterName === contextCenterName;
      });
      
      console.log("Filtered billing items:", filteredItems);
      
      setBillingItems(filteredItems);
      
      // Set center details from first item
      if (filteredItems.length > 0) {
        const firstItem = filteredItems[0];
        setCenterDetails({
          center_name: firstItem.center_name,
          vidhan_sabha_name: firstItem.vidhan_sabha_name,
          vikas_khand_name: firstItem.vikas_khand_name,
        });
      }
      
      // Extract unique investment, sub-investment and scheme options
      const investments = [...new Set(filteredItems.map(item => item.investment_name))].filter(Boolean);
      const schemes = [...new Set(filteredItems.map(item => item.scheme_name))].filter(Boolean);
      setInvestmentOptions(investments);
      setSchemeOptions(schemes);
      
    } catch (error) {
      console.error("Error fetching billing items:", error);
      setApiError("डेटा लोड करने में त्रुटि हुई।");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date range change
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply date range filter and show table
  const applyDateRangeFilter = () => {
    if (!dateRange.fromDate || !dateRange.toDate) {
      alert("कृपया तारीख सीमा चुनें");
      return;
    }

    const startDate = new Date(dateRange.fromDate);
    const endDate = new Date(dateRange.toDate);
    endDate.setHours(23, 59, 59, 999);

    const filtered = billingItems.filter(item => {
      if (!item.bill_date) return false;
      const itemDate = new Date(item.bill_date);
      return itemDate >= startDate && itemDate <= endDate;
    });

    setFilteredBillingItems(filtered);
    setTableVisible(true);

    // Update investment, sub-investment and scheme options based on date range
    const investments = [...new Set(filtered.map(item => item.investment_name))].filter(Boolean);
    const subInvestments = [...new Set(filtered.map(item => item.sub_investment_name))].filter(Boolean);
    const schemes = [...new Set(filtered.map(item => item.scheme_name))].filter(Boolean);
    setInvestmentOptions(investments);
    setSubInvestmentOptions(subInvestments);
    setSchemeOptions(schemes);
    setSelectedInvestments([]);
    setSelectedSubInvestments([]);
    setSelectedSchemes([]);
  };

  // Handle investment change (react-select)
  const handleInvestmentChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map(opt => opt.value);
    setSelectedInvestments(selectedValues);

    // If investment is selected, automatically select its sub-investments
    if (selectedValues.length > 0) {
      const investmentSubInvestments = [];
      selectedValues.forEach(investment => {
        const subInvestments = [...new Set(filteredBillingItems.filter(item => item.investment_name === investment).map(item => item.sub_investment_name))].filter(Boolean);
        investmentSubInvestments.push(...subInvestments);
      });
      const uniqueSubInvestments = [...new Set(investmentSubInvestments)];
      setSelectedSubInvestments(prev => {
        const newSubInvestments = [...new Set([...prev, ...uniqueSubInvestments])];
        return newSubInvestments;
      });
    } else {
      setSelectedSubInvestments([]);
    }
  };

  // Handle sub-investment change (react-select)
  const handleSubInvestmentChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map(opt => opt.value);
    setSelectedSubInvestments(selectedValues);

    // If sub-investment is selected, automatically select its investment
    if (selectedValues.length > 0) {
      const subInvestmentInvestments = [];
      selectedValues.forEach(subInvestment => {
        const item = filteredBillingItems.find(item => item.sub_investment_name === subInvestment);
        if (item && !subInvestmentInvestments.includes(item.investment_name)) {
          subInvestmentInvestments.push(item.investment_name);
        }
      });
      const uniqueInvestments = [...new Set(subInvestmentInvestments)];
      setSelectedInvestments(prev => {
        const newInvestments = [...new Set([...prev, ...uniqueInvestments])];
        return newInvestments;
      });
    }
  };

  // Handle scheme change (react-select)
  const handleSchemeChange = (selectedOptions) => {
    const selectedValues = selectedOptions.map(opt => opt.value);
    setSelectedSchemes(selectedValues);
  };

  // Apply filters to the table data
  const getFilteredData = () => {
    let data = filteredBillingItems;

    if (selectedInvestments.length > 0) {
      data = data.filter(item => selectedInvestments.includes(item.investment_name));
    }

    if (selectedSubInvestments.length > 0) {
      data = data.filter(item => selectedSubInvestments.includes(item.sub_investment_name));
    }

    if (selectedSchemes.length > 0) {
      data = data.filter(item => selectedSchemes.includes(item.scheme_name));
    }

    return data;
  };

  // Initialize component and set financial year dates by default
  useEffect(() => {
    const { fromDate, toDate } = getFinancialYearDates();
    setDateRange({
      fromDate,
      toDate
    });
    fetchBillingItems();
  }, []);

  // Auto-apply financial year filter when data is loaded
  useEffect(() => {
    if (billingItems.length > 0 && dateRange.fromDate && dateRange.toDate && !tableVisible) {
      applyDateRangeFilter();
    }
  }, [billingItems]);

  // Re-apply date range filter when date range changes while table is visible
  useEffect(() => {
    if (tableVisible && billingItems.length > 0 && dateRange.fromDate && dateRange.toDate) {
      applyDateRangeFilter();
    }
  }, [dateRange.fromDate, dateRange.toDate, tableVisible]);

  // Pagination logic
  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Download Excel function
  const downloadExcel = (data, filename, columnMapping, selectedColumns) => {
    try {
      const excelData = data.map((item, index) => {
        const row = {};
        row["क्र.सं."] = index + 1;
        selectedColumns.forEach((col) => {
          row[columnMapping[col].header] = columnMapping[col].accessor(
            item,
            index
          );
        });
        return row;
      });

      const totalRow = {};
      totalRow["क्र.सं."] = "कुल";
      selectedColumns.forEach((col) => {
        if (col === "investment_name" || col === "sub_investment_name" || col === "unit" || col === "scheme_name") {
          const uniqueValues = new Set(data.map(item => columnMapping[col].accessor(item, 0)));
          totalRow[columnMapping[col].header] = uniqueValues.size;
        } else if (col === "allocated_quantity" || col === "amount_of_farmer_share" ||
                   col === "amount_of_subsidy" || col === "total_amount") {
          const sum = data.reduce((total, item) => {
            const value = parseFloat(columnMapping[col].accessor(item, 0)) || 0;
            return total + value;
          }, 0);
          totalRow[columnMapping[col].header] = sum;
        } else if (col === "rate") {
          // Do not show total for rate column
          totalRow[columnMapping[col].header] = "";
        } else {
          totalRow[columnMapping[col].header] = "";
        }
      });
      excelData.push(totalRow);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      const colWidths = selectedColumns.map(() => ({ wch: 15 }));
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
      console.error("Error generating Excel file:", e);
    }
  };

  // Download PDF function
  const downloadPdf = (
    data,
    filename,
    columnMapping,
    selectedColumns,
    title
  ) => {
    try {
      const headers = `<th>क्र.सं.</th>${selectedColumns
        .map((col) => `<th>${columnMapping[col].header}</th>`)
        .join("")}`;
      
      const rows = data
        .map((item, index) => {
          const cells = `<td>${index + 1}</td>${selectedColumns
            .map(
              (col) => `<td>${columnMapping[col].accessor(item, index)}</td>`
            )
            .join("")}`;
          return `<tr>${cells}</tr>`;
        })
        .join("");

      const totalCells = `<td><strong>कुल</strong></td>${selectedColumns
        .map((col) => {
          if (col === "investment_name" || col === "sub_investment_name" || col === "unit" || col === "scheme_name") {
            const uniqueValues = new Set(data.map(item => columnMapping[col].accessor(item, 0)));
            return `<td><strong>${uniqueValues.size}</strong></td>`;
          } else if (col === "allocated_quantity" || col === "amount_of_farmer_share" ||
                     col === "amount_of_subsidy" || col === "total_amount") {
            const sum = data.reduce((total, item) => {
              const value = parseFloat(columnMapping[col].accessor(item, 0)) || 0;
              return total + value;
            }, 0);
            return `<td><strong>${sum.toFixed(2)}</strong></td>`;
          } else if (col === "rate") {
            // Do not show total for rate column
            return `<td></td>`;
          } else {
            return `<td></td>`;
          }
        })
        .join("")}`;
      const totalRow = `<tr class="table-total-row">${totalCells}</tr>`;

      const tableHtml = `
        <html>
          <head>
            <title>${title}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap');
              body {
                font-family: 'Noto Sans', Arial, sans-serif;
                margin: 20px;
                direction: ltr;
              }
              h1 {
                text-align: center;
                font-size: 24px;
                margin-bottom: 30px;
                font-weight: bold;
              }
              .print-button {
                display: block;
                margin: 0 auto 20px auto;
                padding: 10px 20px;
                background-color: #007bff;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
              }
              .print-button:hover {
                background-color: #0056b3;
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin-top: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
                font-size: 14px;
              }
              th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              @media print {
                .no-print { display: none; }
                body { margin: 0; }
                h1 { font-size: 20px; }
                th, td { font-size: 12px; }
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <button class="print-button no-print" onclick="window.print()">प्रिंट करें</button>
            <table>
              <thead>
                <tr>${headers}</tr>
              </thead>
              <tbody>
                ${rows}
                ${totalRow}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(tableHtml);
      printWindow.document.close();

      printWindow.onload = function () {
        // PDF is now open for preview
      };
    } catch (e) {
      console.error("Error generating PDF:", e);
    }
  };

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <Pagination.First key="first" onClick={() => setCurrentPage(1)} />
      );
      items.push(<Pagination.Ellipsis key="ellipsis1" />);
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      items.push(<Pagination.Ellipsis key="ellipsis2" />);
      items.push(
        <Pagination.Last key="last" onClick={() => setCurrentPage(totalPages)} />
      );
    }

    return items;
  };

  return (
    <Container fluid className="px-3" style={{ paddingTop: '60px' }}>
      <div className="mb-3">
        <DemandNavigation />
      </div>
      
      {/* Professional Header Section */}
      <div className="text-black rounded-top mb-2" >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0 fw-bold">{centerData.centerName} - सेंटरवाइज एंट्री</h4>
          </div>
        </div>
      </div>
      
      {apiError && <Alert variant="danger" className="mb-3">{apiError}</Alert>}
      
      {isLoading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted small">डेटा लोड हो रहा है...</p>
        </div>
      )}
      
      {/* No data message when no billing items available for the center */}
      {!isLoading && billingItems.length === 0 && (
        <Alert variant="info" className="text-center">
          इस केंद्र के लिए कोई बिलिंग आइटम डेटा उपलब्ध नहीं है।
        </Alert>
      )}
      
      {!isLoading && billingItems.length > 0 && (
        <>
          {/* Center Details Cards - Shown First */}
          <Row className="g-2 mb-3">
            <Col xs={12} md={4}>
              <div className="border rounded p-3 bg-white shadow-sm">
                <small className="text-muted d-block">केंद्र का नाम</small>
                <strong className="text-primary h6">{centerDetails.center_name}</strong>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="border rounded p-3 bg-white shadow-sm">
                <small className="text-muted d-block">विधानसभा</small>
                <strong className="h6">{centerDetails.vidhan_sabha_name}</strong>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <div className="border rounded p-3 bg-white shadow-sm">
                <small className="text-muted d-block">विकास खंड</small>
                <strong className="h6">{centerDetails.vikas_khand_name}</strong>
              </div>
            </Col>
          </Row>

          {/* Summary Cards Section */}
          <Row className="g-2 mb-3">
            <Col xs={6} md={3}>
              <div className="border rounded p-3 bg-primary text-white shadow-sm">
                <div className="d-flex align-items-center">
                  <div className="me-2" style={{fontSize: '24px'}}>📋</div>
                  <div>
                    <div className="h4 mb-0 fw-bold">{billingItems.length}</div>
                    <small>कुल रिकॉर्ड</small>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="border rounded p-3 bg-success text-white shadow-sm">
                <div className="d-flex align-items-center">
                  <div className="me-2" style={{fontSize: '24px'}}>💰</div>
                  <div>
                    <div className="h6 mb-0 fw-bold">₹{filteredData.reduce((acc, item) => (parseFloat(item.total_amount) || 0) + acc, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    <small>कुल राशि</small>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="border rounded p-3 bg-info text-white shadow-sm">
                <div className="d-flex align-items-center">
                  <div className="me-2" style={{fontSize: '24px'}}>🏛️</div>
                  <div>
                    <div className="h6 mb-0 fw-bold">₹{filteredData.reduce((acc, item) => (parseFloat(item.amount_of_subsidy) || 0) + acc, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    <small>सब्सिडी राशि</small>
                  </div>
                </div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="border rounded p-3 bg-warning text-white shadow-sm">
                <div className="d-flex align-items-center">
                  <div className="me-2" style={{fontSize: '24px'}}>👨‍🌾</div>
                  <div>
                    <div className="h6 mb-0 fw-bold">₹{filteredData.reduce((acc, item) => (parseFloat(item.amount_of_farmer_share) || 0) + acc, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    <small>किसान हिस्सा</small>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          
          <Row className="g-2 mb-3">
            <Col xs={6} md={3}>
              <div className="border rounded p-2 bg-light shadow-sm">
                <small className="text-muted d-block">योजनाएं</small>
                <strong className="text-primary">{new Set(filteredData.map(i => i.scheme_name)).size}</strong>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="border rounded p-2 bg-light shadow-sm">
                <small className="text-muted d-block">निवेश</small>
                <strong className="text-success">{new Set(filteredData.map(i => i.investment_name)).size}</strong>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="border rounded p-2 bg-light shadow-sm">
                <small className="text-muted d-block">उप-निवेश</small>
                <strong className="text-info">{new Set(filteredData.map(i => i.sub_investment_name)).size}</strong>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="border rounded p-2 bg-light shadow-sm">
                <small className="text-muted d-block">कुल मात्रा</small>
                <strong className="text-warning">{filteredData.reduce((acc, item) => (parseFloat(item.allocated_quantity) || 0) + acc, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong>
              </div>
            </Col>
          </Row>
        </>
      )}

      {/* Date Range Filter */}
      {!isLoading && billingItems.length > 0 && !tableVisible && (
        <div className="mb-3 p-3 border rounded bg-white shadow-sm">
          <h6 className="mb-3 text-muted"><span className="text-warning me-2">📅</span>तारीख सीमा चुनें:</h6>
          <Row className="align-items-end g-2">
            <Col md={5} xs={12}>
              <Form.Group controlId="fromDate">
                <Form.Label className="small text-muted mb-1">से</Form.Label>
                <Form.Control
                  type="date"
                  name="fromDate"
                  value={dateRange.fromDate}
                  onChange={handleDateRangeChange}
                  required
                  size="sm"
                />
              </Form.Group>
            </Col>
            <Col md={5} xs={12}>
              <Form.Group controlId="toDate">
                <Form.Label className="small text-muted mb-1">तक</Form.Label>
                <Form.Control
                  type="date"
                  name="toDate"
                  value={dateRange.toDate}
                  onChange={handleDateRangeChange}
                  required
                  size="sm"
                />
              </Form.Group>
            </Col>
            <Col md={2} xs={12}>
              <Button
                variant="primary"
                onClick={applyDateRangeFilter}
                className="w-100 btn-sm"
                size="sm"
              >
                <span className="text-primary me-1">🔍</span> दिखाएं
              </Button>
            </Col>
          </Row>
        </div>
      )}

      {/* Filters and Table */}
      {tableVisible && (
        <>
          <div className="mb-3 p-3 border rounded bg-white shadow-sm">
            <h6 className="mb-3 text-muted"><span className="text-info me-2">⚙️</span>फिल्टर्स:</h6>
            <Row className="g-2">
              <Col md={3} xs={6}>
                <Form.Group controlId="fromDate">
                  <Form.Label className="small text-muted mb-1">कब से</Form.Label>
                  <Form.Control
                    type="date"
                    name="fromDate"
                    value={dateRange.fromDate}
                    onChange={handleDateRangeChange}
                    size="sm"
                  />
                </Form.Group>
              </Col>
              <Col md={3} xs={6}>
                <Form.Group controlId="toDate">
                  <Form.Label className="small text-muted mb-1">कब तक</Form.Label>
                  <Form.Control
                    type="date"
                    name="toDate"
                    value={dateRange.toDate}
                    onChange={handleDateRangeChange}
                    size="sm"
                  />
                </Form.Group>
              </Col>
              <Col md={2} xs={6}>
                <Form.Group controlId="investmentName">
                  <Form.Label className="small text-muted mb-1">निवेश</Form.Label>
                  <Select
                    isMulti
                    value={investmentOptions.filter(opt => selectedInvestments.includes(opt)).map(opt => ({ value: opt, label: opt }))}
                    options={investmentOptions.map(opt => ({ value: opt, label: opt }))}
                    onChange={handleInvestmentChange}
                    placeholder="चुनें"
                    classNamePrefix="react-select"
                    styles={{ fontSize: '12px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={2} xs={6}>
                <Form.Group controlId="subInvestmentName">
                  <Form.Label className="small text-muted mb-1">उप-निवेश</Form.Label>
                  <Select
                    isMulti
                    value={subInvestmentOptions.filter(opt => selectedSubInvestments.includes(opt)).map(opt => ({ value: opt, label: opt }))}
                    options={subInvestmentOptions.map(opt => ({ value: opt, label: opt }))}
                    onChange={handleSubInvestmentChange}
                    placeholder="चुनें"
                    classNamePrefix="react-select"
                  />
                </Form.Group>
              </Col>
              <Col md={2} xs={6}>
                <Form.Group controlId="schemeName">
                  <Form.Label className="small text-muted mb-1">योजना</Form.Label>
                  <Select
                    isMulti
                    value={schemeOptions.filter(opt => selectedSchemes.includes(opt)).map(opt => ({ value: opt, label: opt }))}
                    options={schemeOptions.map(opt => ({ value: opt, label: opt }))}
                    onChange={handleSchemeChange}
                    placeholder="चुनें"
                    classNamePrefix="react-select"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="mb-3 p-2 border rounded bg-light">
            <Row className="align-items-center">
              <Col md={6}>
                <h6 className="mb-0 text-muted"><span className="text-secondary me-2">📊</span>स्तंभ चयन</h6>
              </Col>
              <Col md={6} className="text-end">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setSelectedColumns(billingTableColumns.map((col) => col.key))}
                  className="me-1"
                >
                  सभी
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setSelectedColumns([])}
                >
                  हटाएं
                </Button>
              </Col>
            </Row>
            <div className="d-flex flex-wrap mt-2">
              {billingTableColumns.map((col) => (
                <Form.Check
                  key={col.key}
                  type="checkbox"
                  id={`col-${col.key}`}
                  checked={selectedColumns.includes(col.key)}
                  onChange={() => {
                    if (selectedColumns.includes(col.key)) {
                      setSelectedColumns(selectedColumns.filter((c) => c !== col.key));
                    } else {
                      setSelectedColumns([...selectedColumns, col.key]);
                    }
                  }}
                  className="me-2 mb-1"
                  label={<span className="small">{col.label}</span>}
                />
              ))}
            </div>
          </div>

          <div className="mb-3 d-flex gap-2 flex-wrap">
            <Button
              variant="success"
              size="sm"
              onClick={() => downloadExcel(filteredData, "CenterwiseEntry", billingTableColumnMapping, selectedColumns)}
              className="d-flex align-items-center gap-1"
            >
              <FaFileExcel /> Excel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => downloadPdf(filteredData, "CenterwiseEntry", billingTableColumnMapping, selectedColumns, `${centerData.centerName} - सेंटरवाइज एंट्री`)}
              className="d-flex align-items-center gap-1"
            >
              <FaFilePdf /> PDF
            </Button>
          </div>
          
          <div className="table-responsive border rounded">
            <Table striped bordered hover className="mb-0 table-sm">
              <thead className="table-dark">
                <tr>
                  <th className="text-center" style={{width: '50px'}}>क्र.सं.</th>
                  {billingTableColumns.filter(col => selectedColumns.includes(col.key)).map((col) => (
                    <th key={col.key} className="text-nowrap">{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="text-center text-muted">
                      {indexOfFirstItem + index + 1}
                    </td>
                    {billingTableColumns.filter(col => selectedColumns.includes(col.key)).map((col) => (
                      <td key={col.key} className="text-nowrap">
                        {billingTableColumnMapping[col.key].accessor(item, index)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <td className="text-center"><strong>कुल</strong></td>
                  {billingTableColumns.filter(col => selectedColumns.includes(col.key)).map((col) => {
                    if (col.key === "amount_of_farmer_share" || col.key === "amount_of_subsidy" || col.key === "total_amount" || col.key === "allocated_quantity") {
                      const sum = filteredData.reduce((acc, item) => {
                        const value = parseFloat(item[col.key]) || 0;
                        return acc + value;
                      }, 0);
                      return (
                        <td key={col.key} className="text-nowrap">
                          <strong>{sum.toFixed(2)}</strong>
                        </td>
                      );
                    } else if (col.key === "investment_name" || col.key === "sub_investment_name" || col.key === "unit" || col.key === "scheme_name") {
                      const uniqueValues = new Set(filteredData.map(item => item[col.key])).size;
                      return (
                        <td key={col.key}>
                          <strong>{uniqueValues}</strong>
                        </td>
                      );
                    } else if (col.key === "rate") {
                      return <td key={col.key}></td>;
                    } else {
                      return <td key={col.key}></td>;
                    }
                  })}
                </tr>
              </tfoot>
            </Table>
          </div>
          
          {/* Pagination controls */}
          {filteredData.length > itemsPerPage && (
            <div className="mt-3">
              <div className="small text-muted mb-2 text-center">
                पृष्ठ {currentPage} का {totalPages} | कुल {filteredData.length} रिकॉर्ड
              </div>
              <Pagination className="d-flex justify-content-center mb-0">
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                />
                {getPaginationItems()}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* No data message when table is visible but no data matches filters */}
      {tableVisible && filteredData.length === 0 && (
        <Alert variant="warning" className="text-center mb-0">
          <span className="text-warning me-2">⚠️</span>कोई बिलिंग आइटम डेटा उपलब्ध नहीं है।
        </Alert>
      )}
    </Container>
  );
};

export default DemandCenterwiseEntry;