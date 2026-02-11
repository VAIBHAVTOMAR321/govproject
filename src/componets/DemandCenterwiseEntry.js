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

const DemandCenterwiseEntry = () => {
  const { centerData } = useCenter();
  
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
  const [investmentOptions, setInvestmentOptions] = useState([]);
  const [subInvestmentOptions, setSubInvestmentOptions] = useState([]);
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
      
      // Extract unique investment and sub-investment options
      const investments = [...new Set(filteredItems.map(item => item.investment_name))].filter(Boolean);
      setInvestmentOptions(investments);
      
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

    // Update investment and sub-investment options based on date range
    const investments = [...new Set(filtered.map(item => item.investment_name))].filter(Boolean);
    const subInvestments = [...new Set(filtered.map(item => item.sub_investment_name))].filter(Boolean);
    setInvestmentOptions(investments);
    setSubInvestmentOptions(subInvestments);
    setSelectedInvestments([]);
    setSelectedSubInvestments([]);
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

  // Apply filters to the table data
  const getFilteredData = () => {
    let data = filteredBillingItems;

    if (selectedInvestments.length > 0) {
      data = data.filter(item => selectedInvestments.includes(item.investment_name));
    }

    if (selectedSubInvestments.length > 0) {
      data = data.filter(item => selectedSubInvestments.includes(item.sub_investment_name));
    }

    return data;
  };

  // Initialize component
  useEffect(() => {
    fetchBillingItems();
  }, []);

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
        if (col === "investment_name" || col === "sub_investment_name" || col === "unit") {
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
          if (col === "investment_name" || col === "sub_investment_name" || col === "unit") {
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
    <Container fluid className="py-4">
      <DemandNavigation />
      <h4 className="mb-4">{centerData.centerName} - सेंटरवाइज एंट्री</h4>
      
      {apiError && <Alert variant="danger">{apiError}</Alert>}
      
      {!isLoading && billingItems.length > 0 && (
        <div className="mb-4">
          <h5>सेंटर विवरण:</h5>
          <div className="d-flex gap-4 flex-wrap">
            <div className="d-flex flex-column">
              <span className="fw-bold">केंद्र का नाम:</span>
              <span>{centerDetails.center_name}</span>
            </div>
            <div className="d-flex flex-column">
              <span className="fw-bold">विधानसभा का नाम:</span>
              <span>{centerDetails.vidhan_sabha_name}</span>
            </div>
            <div className="d-flex flex-column">
              <span className="fw-bold">विकास खंड का नाम:</span>
              <span>{centerDetails.vikas_khand_name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      {!isLoading && billingItems.length > 0 && !tableVisible && (
        <div className="mb-4 p-4 border rounded bg-light">
          <h5 className="mb-3">तारीख सीमा चुनें:</h5>
          <Row className="align-items-end">
            <Col md={4} className="mb-3">
              <Form.Group controlId="fromDate">
                <Form.Label>से</Form.Label>
                <Form.Control
                  type="date"
                  name="fromDate"
                  value={dateRange.fromDate}
                  onChange={handleDateRangeChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Form.Group controlId="toDate">
                <Form.Label>तक</Form.Label>
                <Form.Control
                  type="date"
                  name="toDate"
                  value={dateRange.toDate}
                  onChange={handleDateRangeChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4} className="mb-3">
              <Button
                variant="primary"
                onClick={applyDateRangeFilter}
                className="w-100"
              >
                डेटा दिखाएं
              </Button>
            </Col>
          </Row>
        </div>
      )}

      {/* Filters and Table */}
      {tableVisible && (
        <>
          <div className="mb-4 p-4 border rounded bg-light">
            <h5 className="mb-3">फिल्टर्स:</h5>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group controlId="investmentName">
                  <Form.Label>निवेश का नाम</Form.Label>
                  <Select
                    isMulti
                    value={investmentOptions.filter(opt => selectedInvestments.includes(opt)).map(opt => ({ value: opt, label: opt }))}
                    options={investmentOptions.map(opt => ({ value: opt, label: opt }))}
                    onChange={handleInvestmentChange}
                    placeholder="निवेश का नाम चुनें"
                    className="mb-2"
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="mb-3">
                <Form.Group controlId="subInvestmentName">
                  <Form.Label>उप-निवेश का नाम</Form.Label>
                  <Select
                    isMulti
                    value={subInvestmentOptions.filter(opt => selectedSubInvestments.includes(opt)).map(opt => ({ value: opt, label: opt }))}
                    options={subInvestmentOptions.map(opt => ({ value: opt, label: opt }))}
                    onChange={handleSubInvestmentChange}
                    placeholder="उप-निवेश का नाम चुनें"
                    className="mb-2"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          <div className="mb-3 d-flex gap-2">
            <Button
              variant="success"
              onClick={() => downloadExcel(filteredData, "CenterwiseEntry", billingTableColumnMapping, billingTableColumns.map(col => col.key))}
              className="d-flex align-items-center gap-2"
            >
              <FaFileExcel /> Excel डाउनलोड करें
            </Button>
            <Button
              variant="danger"
              onClick={() => downloadPdf(filteredData, "CenterwiseEntry", billingTableColumnMapping, billingTableColumns.map(col => col.key), `${centerData.centerName} - सेंटरवाइज एंट्री`)}
              className="d-flex align-items-center gap-2"
            >
              <FaFilePdf /> PDF डाउनलोड करें
            </Button>
          </div>
          
          <Table striped bordered hover className="registration-form">
            <thead className="table-light">
              <tr>
                <th>क्र.सं.</th>
                {billingTableColumns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="tbl-body">
              {currentItems.map((item, index) => (
                <tr key={item.id || index}>
                  <td>
                    {indexOfFirstItem + index + 1}
                  </td>
                  {billingTableColumns.map((col) => (
                    <td key={col.key}>
                      {billingTableColumnMapping[col.key].accessor(item, index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="table-total-row">
                <td><strong>कुल</strong></td>
                 {billingTableColumns.map((col) => {
                  if (col.key === "amount_of_farmer_share" || col.key === "amount_of_subsidy" || col.key === "total_amount" || col.key === "allocated_quantity") {
                    const sum = filteredData.reduce((acc, item) => {
                      const value = parseFloat(item[col.key]) || 0;
                      return acc + value;
                    }, 0);
                    return (
                      <td key={col.key}>
                        <strong>{sum.toFixed(2)}</strong>
                      </td>
                    );
                  } else if (col.key === "investment_name" || col.key === "sub_investment_name" || col.key === "unit") {
                    const uniqueValues = new Set(filteredData.map(item => item[col.key])).size;
                    return (
                      <td key={col.key}>
                        <strong>{uniqueValues}</strong>
                      </td>
                    );
                  } else if (col.key === "rate") {
                    // Do not show total for rate column
                    return <td key={col.key}></td>;
                  } else {
                    return <td key={col.key}></td>;
                  }
                })}
              </tr>
            </tfoot>
          </Table>
          
          {/* Pagination controls */}
          {filteredData.length > itemsPerPage && (
            <div className="mt-3">
              <div className="small-fonts mb-3 text-center">
                पृष्ठ {currentPage} का {totalPages}
              </div>
              <Pagination className="d-flex justify-content-center">
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
        <Alert variant="info" className="text-center">
          कोई बिलिंग आइटम डेटा उपलब्ध नहीं है।
        </Alert>
      )}
    </Container>
  );
};

export default DemandCenterwiseEntry;