import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Container, Form, Button, Alert, Row, Col, Card, Spinner, Badge, Pagination } from "react-bootstrap";
import { FaFileExcel, FaFilePdf, FaTimes } from 'react-icons/fa';
import { ImOffice } from "react-icons/im";
import { GrServices } from "react-icons/gr";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { FaRegLightbulb } from "react-icons/fa";
import { BsFillDiagram3Fill } from "react-icons/bs";
import { GrCubes } from "react-icons/gr";
import axios from "axios";
import * as XLSX from 'xlsx';
import "../../assets/css/registration.css";
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";

// API URLs
const REGISTRATION_API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/beneficiaries-registration/";
const BILLING_ITEMS_API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/";

// Column mappings for table
const tableColumnMapping = {
  sno: { header: 'क्र.सं.', accessor: (item, index, currentPage, itemsPerPage) => (currentPage - 1) * itemsPerPage + index + 1 },
  farmerName: { header: 'कृषक का नाम', accessor: (item) => item.farmer_name },
  fatherName: { header: 'पिता का नाम', accessor: (item) => item.father_name },
  address: { header: 'पता/ग्राम', accessor: (item) => item.address },
  blockName: { header: 'विकास खंड', accessor: (item) => item.block_name },
  assemblyName: { header: 'विधानसभा', accessor: (item) => item.assembly_name },
  centerName: { header: 'केंद्र', accessor: (item) => item.center_name },
  suppliedItemName: { header: 'प्रदत्त सामग्री', accessor: (item) => item.supplied_item_name },
  unit: { header: 'इकाई', accessor: (item) => item.unit },
  quantity: { header: 'मात्रा', accessor: (item) => item.quantity },
  rate: { header: 'दर', accessor: (item) => `₹${item.rate}` },
  amount: { header: 'राशि', accessor: (item) => `₹${item.amount}` },
  aadhaarNumber: { header: 'आधार नंबर', accessor: (item) => item.aadhaar_number },
  bankAccountNumber: { header: 'बैंक खाता', accessor: (item) => item.bank_account_number },
  ifscCode: { header: 'IFSC कोड', accessor: (item) => item.ifsc_code },
  mobileNumber: { header: 'मोबाइल नंबर', accessor: (item) => item.mobile_number },
  category: { header: 'श्रेणी', accessor: (item) => item.category },
  schemeName: { header: 'योजना', accessor: (item) => item.scheme_name }
};

// Available columns for table
const availableColumns = [
  { key: 'sno', label: 'क्र.सं.' },
  { key: 'farmerName', label: 'कृषक का नाम' },
  { key: 'fatherName', label: 'पिता का नाम' },
  { key: 'address', label: 'पता/ग्राम' },
  { key: 'blockName', label: 'विकास खंड' },
  { key: 'assemblyName', label: 'विधानसभा' },
  { key: 'centerName', label: 'केंद्र' },
  { key: 'suppliedItemName', label: 'प्रदत्त सामग्री' },
  { key: 'unit', label: 'इकाई' },
  { key: 'quantity', label: 'मात्रा' },
  { key: 'rate', label: 'दर' },
  { key: 'amount', label: 'राशि' },
  { key: 'aadhaarNumber', label: 'आधार नंबर' },
  { key: 'bankAccountNumber', label: 'बैंक खाता' },
  { key: 'ifscCode', label: 'IFSC कोड' },
  { key: 'mobileNumber', label: 'मोबाइल नंबर' },
  { key: 'category', label: 'श्रेणी' },
  { key: 'schemeName', label: 'योजना' }
];

// Field mappings for cards
const fieldMappings = {
  block_name: { title: 'विकास खंड', icon: <ImOffice /> },
  assembly_name: { title: 'विधानसभा', icon: <GrServices /> },
  center_name: { title: 'केंद्र', icon: <RiMoneyRupeeCircleLine /> },
  unit: { title: 'इकाई', icon: <GrCubes /> },
  category: { title: 'श्रेणी', icon: <FaRegLightbulb /> },
  scheme_name: { title: 'योजना', icon: <BsFillDiagram3Fill /> }
};

// Static options for filter cards
const blockOptions = ["नैनीडांडा", "बीरोंखाल", "यमकेश्वर", "दुगड्डा", "पौड़ी", "द्वारीखाल", "जयहरीखाल", "रिखणीखाल", "नगर निगम कोटद्वार"];
const assemblyOptions = ["लैन्सडाउन", "यमकेश्वर", "चौबट्टाखाल", "कोटद्वार", "श्रीनगर"];
const categoryOptions = ["SC", "General/Unreserved", "ST"];
const schemeOptions = ["जिला योजना", "PKVY", "HMNEH", "Other"];
const unitOptions = ["kgs", "quintal", "gram", "number", "liter"];
const centerOptions = ["किंगोडीखाल", "किल्लीखाल", "कोटद्वार", "गंगाभोगपुर", "चैबेसिंग", "सिलोली", "चौबटल", "जयरिखाल", "जेगांव", "दिउली", "दुगड्डा", "देवराजखाल", "देलियाखाल", "धुमाकोट", "पौड़ी", "पैथाल", "बियाणी", "बीरोंखाल", "वेदीखाल", "सांगलकोटी", "सतपुली", "रिसाल्डी", "सैंधिखाल", "हल्दुखाल"];

const filterOptions = {
  block_name: blockOptions,
  assembly_name: assemblyOptions,
  center_name: centerOptions,
  unit: unitOptions,
  category: categoryOptions,
  scheme_name: schemeOptions
};

// Reusable Column Selection Component
const ColumnSelection = ({ columns, selectedColumns, setSelectedColumns, title }) => {
  const handleColumnToggle = (columnKey) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter(col => col !== columnKey));
    } else {
      setSelectedColumns([...selectedColumns, columnKey]);
    }
  };

  const handleSelectAll = () => {
    setSelectedColumns(columns.map(col => col.key));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  return (
    <div className="column-selection mb-3 p-3 border rounded bg-light">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="small-fonts mb-0">{title}</h6>
        <div>
          <Button variant="outline-secondary" size="sm" onClick={handleSelectAll} className="me-2">
            सभी चुनें
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={handleDeselectAll}>
            सभी हटाएं
          </Button>
        </div>
      </div>
      <Row>
        <Col>
          <div className="d-flex flex-wrap">
            {columns.map(col => (
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

// Hindi translations for form
const translations = {
  pageTitle: "लाभार्थी पंजीकरण",
  pageTitleSingle: "लाभार्थी पंजीकरण करें",
  pageTitleExcel: "एक्सेल से लाभार्थी पंजीकरण करें",
  pageTitleList: "पंजीकृत लाभार्थियों की सूची",
  farmerName: "कृषक का नाम",
  fatherName: "पिता का नाम",
  address: "पता/ग्राम",
  blockName: "विकास खंड का नाम चुनें",
  assemblyName: "विधानसभा का नाम चुनें",
  centerName: "केंद्र चुनें",
  suppliedItemName: "प्रदत्त सामग्री का नाम",
  unit: "इकाई चुनें",
  quantity: "मात्रा",
  rate: "दर",
  amount: "राशि",
  aadhaarNumber: "आधार नंबर",
  bankAccountNumber: "बैंक खाता नंबर",
  ifscCode: "IFSC code",
  mobileNumber: "मोबाइल नंबर",
  category: "श्रेणी चुनें",
  schemeName: "योजना चुनें",
  submitButton: "पंजीकरण करें",
  uploading: "अपलोड हो रहा है...",
  submitting: "जमा कर रहे हैं...",
  successMessage: "लाभार्थी सफलतापूर्वक पंजीकृत किया गया!",
  excelSuccessMessage: "एक्सेल डेटा सफलतापूर्वक अपलोड किया गया!",
  // Validation messages
  required: "यह फ़ील्ड आवश्यक है",
  invalidNumber: "कृपया एक वैध संख्या दर्ज करें",
  genericError: "प्रस्तुत करते समय एक त्रुटि हुई। कृपया बाद में पुन: प्रयास करें।",
  excelInstructions: "निर्देश: कृपया सुनिश्चित करें कि आपकी एक्सेल फ़ाइल में निम्नलिखित हेडर हैं: center_name, component, investment_name, unit, allocated_quantity, rate, source_of_receipt, scheme_name। ये हेडर अंग्रेजी में होने चाहिए।",
  selectOption: "चुनें",
  selectColumns: "कॉलम चुनें",
  total: "कुल",
  selectAll: "सभी चुनें",
  deselectAll: "सभी हटाएं",
  noDataFound: "कोई डेटा नहीं मिला।",
  showing: "दिखा रहे हैं",
  to: "से",
  of: "का",
  entries: "प्रविष्टियां",
  page: "पृष्ठ",
  itemsPerPage: "प्रति पृष्ठ आइटम:",
  loading: "लोड हो रहा है...",
  error: "त्रुटि",
  fetchError: "डेटा लाने में विफल। कृपया बाद में पुन: प्रयास करें।",
  networkError: "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।",
  serverError: "सर्वर त्रुटि। कृपया बाद में पुन: प्रयास करें।",
  retry: "पुनः प्रयास करें",
  clearAllFilters: "सभी फिल्टर हटाएं"
};

const Registration = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Form state for single entry
  const [formData, setFormData] = useState({
    farmer_name: "",
    father_name: "",
    address: "",
    block_name: "",
    assembly_name: "",
    center_name: "",
    supplied_item_name: "",
    unit: "",
    quantity: "",
    rate: "",
    amount: 0,
    aadhaar_number: "",
    bank_account_number: "",
    ifsc_code: "",
    mobile_number: "",
    category: "",
    scheme_name: ""
  });
  
  // State for Excel upload
  const [excelData, setExcelData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);

  const fileInputRef = useRef(null);

  // State for table data
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableError, setTableError] = useState(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State for selected columns
  const [selectedColumns, setSelectedColumns] = useState(availableColumns.map(col => col.key));
  
  // State for filters
  const [activeFilters, setActiveFilters] = useState({});

  // State for search terms
  const [searchTerms, setSearchTerms] = useState({
    farmerName: '',
    fatherName: '',
    suppliedItemName: '',
    mobileNumber: '',
    aadhaarNumber: ''
  });

  // State to control which category's filter buttons are being shown
  const [filterCategory, setFilterCategory] = useState(null);

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

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  // Fetch registrations data
  const fetchRegistrations = async () => {
    setLoading(true);
    setTableError(null);

    try {
      const response = await axios.get(REGISTRATION_API_URL);
      // API returns {success: true, data: [...]} structure
      const data = response.data && response.data.data ? response.data.data : [];
      setRegistrations(Array.isArray(data) ? data : []);
    } catch (e) {
      setTableError(e.message);
      setRegistrations([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Generic download Excel function
  const downloadExcel = (data, filename, columnMapping, selectedColumns, includeTotals = true) => {
    try {
      const excelData = data.map((item, index) => {
        const row = {};
        selectedColumns.forEach(col => {
          row[columnMapping[col].header] = columnMapping[col].accessor(item, index, currentPage, itemsPerPage);
        });
        return row;
      });
      
      // Calculate totals if includeTotals is true
      if (includeTotals && Array.isArray(data) && data.length > 0) {
        const totals = data.filter(item => item).reduce((acc, item) => {
          acc.totalQuantity += parseFloat(item.quantity || 0);
          acc.totalAmount += parseFloat(item.amount || 0);
          return acc;
        }, { totalQuantity: 0, totalAmount: 0 });
        
        const totalsRow = {};
        selectedColumns.forEach(col => {
          if (col === 'sno') {
            totalsRow[columnMapping[col].header] = "कुल";
          } else if (col === 'quantity') {
            totalsRow[columnMapping[col].header] = totals.totalQuantity.toFixed(2);
          } else if (col === 'amount') {
            totalsRow[columnMapping[col].header] = `₹${totals.totalAmount.toFixed(2)}`;
          } else if (col === 'farmerName' || col === 'fatherName' || col === 'address' || 
                     col === 'blockName' || col === 'assemblyName' || col === 'centerName' ||
                     col === 'suppliedItemName' || col === 'unit' || col === 'aadhaarNumber' ||
                     col === 'bankAccountNumber' || col === 'ifscCode' || col === 'mobileNumber' ||
                     col === 'category' || col === 'schemeName' || col === 'rate') {
            totalsRow[columnMapping[col].header] = "";
          }
        });
        
        excelData.push(totalsRow);
      }
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      const colWidths = selectedColumns.map(() => ({ wch: 15 }));
      ws['!cols'] = colWidths;
      
      if (includeTotals && excelData.length > 0) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        const totalsRowNum = range.e.r;
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: totalsRowNum, c: C });
          if (!ws[cellAddress]) continue;
          ws[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "FFFFAA00" } }
          };
        }
      }
      
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
      console.error("Error generating Excel file:", e);
      setTableError("Excel file generation failed. Please try again.");
    }
  };

  // Generic download PDF function
  const downloadPdf = (data, filename, selectedColumns, title, includeTotals = true) => {
    try {
      const headers = selectedColumns.map(col => `<th>${tableColumnMapping[col].header}</th>`).join('');
      const rows = data.map((item, index) => {
        const cells = selectedColumns.map(col => `<td>${tableColumnMapping[col].accessor(item, index, currentPage, itemsPerPage)}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      
      let totalsRow = '';
      if (includeTotals && Array.isArray(data) && data.length > 0) {
        const totals = data.filter(item => item).reduce((acc, item) => {
          acc.totalQuantity += parseFloat(item.quantity || 0);
          acc.totalAmount += parseFloat(item.amount || 0);
          return acc;
        }, { totalQuantity: 0, totalAmount: 0 });
        
        const totalsCells = selectedColumns.map(col => {
          if (col === 'sno') {
            return `<td class="text-end fw-bold">कुल</td>`;
          } else if (col === 'quantity') {
            return `<td>${totals.totalQuantity.toFixed(2)}</td>`;
          } else if (col === 'amount') {
            return `<td class="fw-bold">₹${totals.totalAmount.toFixed(2)}</td>`;
          } else if (col === 'farmerName' || col === 'fatherName' || col === 'address' || 
                     col === 'blockName' || col === 'assemblyName' || col === 'centerName' ||
                     col === 'suppliedItemName' || col === 'unit' || col === 'aadhaarNumber' ||
                     col === 'bankAccountNumber' || col === 'ifscCode' || col === 'mobileNumber' ||
                     col === 'category' || col === 'schemeName' || col === 'rate') {
            return `<td></td>`;
          }
          return `<td></td>`;
        }).join('');
        
        totalsRow = `<tr style="background-color: #e3f2fd; font-weight: bold;">${totalsCells}</tr>`;
      }

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
                body { margin: 0; }
                h1 { font-size: 20px; }
                th, td { font-size: 12px; }
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <table>
              <thead>
                <tr>${headers}</tr>
              </thead>
              <tbody>
                ${rows}
                ${totalsRow}
              </tbody>
            </table>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(tableHtml);
      printWindow.document.close();
      
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
      };
    } catch (e) {
      console.error("Error generating PDF:", e);
      setTableError("PDF generation failed. Please try again.");
    }
  };

  // Calculate filtered data
  const filteredRegistrations = useMemo(() => {
    if (!Array.isArray(registrations)) {
      return [];
    }

    let filtered = [...registrations];

    // Apply filters from activeFilters
    Object.keys(activeFilters).forEach(category => {
      const values = activeFilters[category];
      if (values && values.length > 0) {
        filtered = filtered.filter(item => item && item[category] && values.includes(item[category]));
      }
    });

    // Apply search filters
    if (searchTerms.farmerName) {
      filtered = filtered.filter(item => item && item.farmer_name && item.farmer_name.toLowerCase().includes(searchTerms.farmerName.toLowerCase()));
    }
    if (searchTerms.fatherName) {
      filtered = filtered.filter(item => item && item.father_name && item.father_name.toLowerCase().includes(searchTerms.fatherName.toLowerCase()));
    }
    if (searchTerms.suppliedItemName) {
      filtered = filtered.filter(item => item && item.supplied_item_name && item.supplied_item_name.toLowerCase().includes(searchTerms.suppliedItemName.toLowerCase()));
    }
    if (searchTerms.mobileNumber) {
      filtered = filtered.filter(item => item && item.mobile_number && item.mobile_number.includes(searchTerms.mobileNumber));
    }
    if (searchTerms.aadhaarNumber) {
      filtered = filtered.filter(item => item && item.aadhaar_number && item.aadhaar_number.includes(searchTerms.aadhaarNumber));
    }

    return filtered;
  }, [registrations, activeFilters, searchTerms]);

  // Calculate paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedData = filteredRegistrations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

  // Handle page change
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

  // Clear filters
  const clearAllFilters = () => {
    setActiveFilters({});
    setFilterCategory(null);
  };

  // Handler for clicking category cards
  const handleCategoryCardClick = (key) => {
    const cardValues = filterOptions[key] || [];
    if (cardValues.length > 0) {
      setFilterCategory(key);

      // If this category doesn't have active filters yet, set first value as default
      if (!activeFilters[key] || activeFilters[key].length === 0) {
        setActiveFilters(prev => ({ ...prev, [key]: [cardValues[0]] }));
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

  // Helper to render filter buttons for a category
  const renderFilterButtons = (category) => {
    const cardValues = filterOptions[category] || [];
    if (cardValues.length === 0) return null;

    const allSelected = (activeFilters[category] || []).length === cardValues.length;

    return (
      <>
        <Col xs="auto" className="mb-2">
          <Button
            variant={allSelected ? "primary" : "outline-secondary"}
            size="sm"
            className="filter-button"
            onClick={() => {
              if (allSelected) {
                // Deselect all
                setActiveFilters(prev => {
                  const newFilters = { ...prev };
                  delete newFilters[category];
                  return newFilters;
                });
              } else {
                // Select all
                setActiveFilters(prev => ({ ...prev, [category]: cardValues }));
              }
            }}
          >
            सभी चुनें
          </Button>
        </Col>
        {cardValues.map((value) => (
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
        ))}
      </>
    );
  };

  // Handle form field changes for single entry
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = {
      ...formData,
      [name]: value
    };

    // Auto-calculate amount when quantity or rate changes
    if (name === 'quantity' || name === 'rate') {
      const quantity = name === 'quantity' ? parseFloat(value) || 0 : parseFloat(formData.quantity) || 0;
      const rate = name === 'rate' ? parseFloat(value) || 0 : parseFloat(formData.rate) || 0;
      updatedFormData.amount = (quantity * rate).toFixed(2);
    }

    setFormData(updatedFormData);

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Handle Excel file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (data.length < 2) {
        alert("एक्सेल फ़ाइल में केवल हेडर हैं। कृपया डेटा जोड़ें।");
        return;
      }

      // Headers must be in English as per API requirements
      const requiredHeaders = [
        'center_name',
        'component',
        'investment_name',
        'unit',
        'allocated_quantity',
        'rate',
        'source_of_receipt',
        'scheme_name'
      ];
      
      const headers = data[0];
      
      // Check if all required headers are present
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        alert(`एक्सेल फ़ाइल में निम्नलिखित आवश्यक हेडर गायब हैं: ${missingHeaders.join(', ')}। कृपया सुनिश्चित करें कि सभी हेडर अंग्रेजी में हैं और सही ढंग से लिखे गए हैं।`);
        return;
      }
      
      const rows = data.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      }).filter(row => row.center_name); // Filter out rows that don't have a center name

      if (rows.length === 0) {
        alert("डेटा को पार्स नहीं किया जा सका। कृपया सुनिश्चित करें कि आपकी एक्सेल फ़ाइल में ऊपर दिए गए हेडर (अंग्रेजी में) हैं।");
        return;
      }

      setExcelData(rows);
      setUploadResults(null); // Clear previous results
    };
    reader.readAsBinaryString(file);
  };
  
  // Handle form submission for single entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    setApiError(null);
    setApiResponse(null);
    
    try {
      // Prepare the payload to match API requirements
      const payload = {
        farmer_name: formData.farmer_name,
        father_name: formData.father_name,
        address: formData.address,
        block_name: formData.block_name,
        assembly_name: formData.assembly_name,
        center_name: formData.center_name,
        supplied_item_name: formData.supplied_item_name,
        unit: formData.unit,
        quantity: formData.quantity,
        rate: formData.rate,
        amount: formData.amount.toString(),
        aadhaar_number: formData.aadhaar_number,
        bank_account_number: formData.bank_account_number,
        ifsc_code: formData.ifsc_code,
        mobile_number: formData.mobile_number,
        category: formData.category,
        scheme_name: formData.scheme_name
      };
      
      const response = await axios.post(REGISTRATION_API_URL, payload);
      
      // Handle both possible response structures
      const responseData = response.data && response.data.data ? response.data.data : response.data;
      setApiResponse(responseData);
      
      // Reset form after successful submission
      setFormData({
        farmer_name: "",
        father_name: "",
        address: "",
        block_name: "",
        assembly_name: "",
        center_name: "",
        supplied_item_name: "",
        unit: "",
        quantity: "",
        rate: "",
        amount: 0,
        aadhaar_number: "",
        bank_account_number: "",
        ifsc_code: "",
        mobile_number: "",
        category: "",
        scheme_name: ""
      });
      
      // Refresh table data after successful submission
      fetchRegistrations();
    } catch (error) {
      // Handle different error response formats
      let errorMessage = translations.genericError;
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 400) {
          errorMessage = "डेटा में त्रुटि। कृपया सभी आवश्यक फ़ील्ड भरें।";
        } else if (error.response.status === 500) {
          errorMessage = "सर्वर त्रुटि। कृपया बाद में प्रयास करें।";
        }
      } else if (error.request) {
        errorMessage = "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।";
      }
      setApiError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submission for Excel data
  const handleExcelSubmit = async () => {
    if (excelData.length === 0) {
      alert("कृपया पहले एक्सेल फ़ाइल चुनें।");
      return;
    }

    setIsUploading(true);
    setApiError(null);
    setApiResponse(null);
    setUploadResults(null);

    // Map Excel data to billing items API format
    const formattedData = excelData.map(item => ({
      center_name: item.center_name,
      component: item.component,
      investment_name: item.investment_name,
      unit: item.unit,
      allocated_quantity: item.allocated_quantity,
      rate: item.rate,
      source_of_receipt: item.source_of_receipt,
      scheme_name: item.scheme_name
    }));

    const requests = formattedData.map(item =>
      axios.post(BILLING_ITEMS_API_URL, item)
    );

    try {
      const results = await Promise.allSettled(requests);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.length - successful;

      setUploadResults({
        total: results.length,
        successful,
        failed
      });

      // Note: Not refreshing registrations as this is for billing items
    } catch (error) {
      setApiError("Excel अपलोड में त्रुटि: " + (error.response?.data?.message || error.message || translations.genericError));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Clear file input
      }
      setExcelData([]); // Clear parsed data
    }
  };
  
  // Form validation for single entry
  const validateForm = () => {
    const newErrors = {};
    if (!formData.farmer_name.trim()) newErrors.farmer_name = `${translations.farmerName} ${translations.required}`;
    if (!formData.father_name.trim()) newErrors.father_name = `${translations.fatherName} ${translations.required}`;
    if (!formData.address.trim()) newErrors.address = `${translations.address} ${translations.required}`;
    if (!formData.block_name.trim()) newErrors.block_name = `${translations.blockName} ${translations.required}`;
    if (!formData.assembly_name.trim()) newErrors.assembly_name = `${translations.assemblyName} ${translations.required}`;
    if (!formData.center_name.trim()) newErrors.center_name = `${translations.centerName} ${translations.required}`;
    if (!formData.supplied_item_name.trim()) newErrors.supplied_item_name = `${translations.suppliedItemName} ${translations.required}`;
    if (!formData.unit.trim()) newErrors.unit = `${translations.unit} ${translations.required}`;
    if (!formData.quantity.trim()) newErrors.quantity = `${translations.quantity} ${translations.required}`;
    if (!formData.rate.trim()) newErrors.rate = `${translations.rate} ${translations.required}`;
    // Amount is auto-calculated, so no need to validate as required
    if (!formData.aadhaar_number.trim()) newErrors.aadhaar_number = `${translations.aadhaarNumber} ${translations.required}`;
    if (!formData.bank_account_number.trim()) newErrors.bank_account_number = `${translations.bankAccountNumber} ${translations.required}`;
    if (!formData.ifsc_code.trim()) newErrors.ifsc_code = `${translations.ifscCode} ${translations.required}`;
    if (!formData.mobile_number.trim()) newErrors.mobile_number = `${translations.mobileNumber} ${translations.required}`;
    if (!formData.category.trim()) newErrors.category = `${translations.category} ${translations.required}`;
    if (!formData.scheme_name.trim()) newErrors.scheme_name = `${translations.schemeName} ${translations.required}`;
    return newErrors;
  };

  // Render loading state for table
  if (loading && registrations.length === 0) {
    return (
      <div className="dashboard-container">
        <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content d-flex justify-content-center align-items-center">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  // Render error state for table
  if (tableError && registrations.length === 0) {
    return (
      <div className="dashboard-container">
        <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content">
          <Container fluid className="dashboard-body">
            <Alert variant="danger">{translations.error}: {tableError}</Alert>
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
      <div className="main-content">
        <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Container fluid className="dashboard-body" style={{ overflowX: 'hidden' }}>
          <h1 className="page-title small-fonts">{translations.pageTitle}</h1>
          
          {apiResponse && <Alert variant="success" className="small-fonts">{translations.successMessage}</Alert>}
          {apiError && <Alert variant="danger" className="small-fonts">{apiError}</Alert>}
          {uploadResults && (
            <Alert variant="info" className="small-fonts">
              <strong>अपलोड परिणाम:</strong><br/>
              कुल: {uploadResults.total}, सफल: {uploadResults.successful}, असफल: {uploadResults.failed}
            </Alert>
          )}

          {/* Excel Upload Section */}
          <Card className="mb-4 p-3">
            <h2 className="section-title small-fonts">{translations.pageTitleExcel}</h2>
            <p className="small-fonts text-muted">{translations.excelInstructions}</p>
            <Form.Group>
              <Form.Control type="file" accept=".xlsx, .xls" onChange={handleFileChange} ref={fileInputRef} />
            </Form.Group>
            <Button 
              variant="success" 
              onClick={handleExcelSubmit} 
              disabled={isUploading || excelData.length === 0} 
              className="mt-2"
            >
              {isUploading ? translations.uploading : `${excelData.length} आइटम्स जोड़ें`}
            </Button>
          </Card>

          <hr />

          {/* Single Entry Form Section */}
          <h2 className="section-title small-fonts mb-4">{translations.pageTitleSingle}</h2>
            <Form onSubmit={handleSubmit} className="registration-form compact-form">
                <Row>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="farmer_name">
                      <Form.Label className="small-fonts fw-bold">{translations.farmerName}</Form.Label>
                      <Form.Control type="text" name="farmer_name" value={formData.farmer_name} onChange={handleChange} isInvalid={!!errors.farmer_name} className="compact-input" placeholder="कृषक का नाम दर्ज करें" />
                      <Form.Control.Feedback type="invalid">{errors.farmer_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="father_name">
                      <Form.Label className="small-fonts fw-bold">{translations.fatherName}</Form.Label>
                      <Form.Control type="text" name="father_name" value={formData.father_name} onChange={handleChange} isInvalid={!!errors.father_name} className="compact-input" placeholder="पिता का नाम दर्ज करें" />
                      <Form.Control.Feedback type="invalid">{errors.father_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="address">
                      <Form.Label className="small-fonts fw-bold">{translations.address}</Form.Label>
                      <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} isInvalid={!!errors.address} className="compact-input" placeholder="पता/ग्राम दर्ज करें" />
                      <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="block_name">
                      <Form.Label className="small-fonts fw-bold">{translations.blockName}</Form.Label>
                      <Form.Select
                        name="block_name"
                        value={formData.block_name}
                        onChange={handleChange}
                        isInvalid={!!errors.block_name}
                        className="compact-input"
                      >
                        <option value="">{translations.selectOption}</option>
                        {blockOptions.map((block, index) => (
                          <option key={index} value={block}>{block}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.block_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="assembly_name">
                      <Form.Label className="small-fonts fw-bold">{translations.assemblyName}</Form.Label>
                      <Form.Select
                        name="assembly_name"
                        value={formData.assembly_name}
                        onChange={handleChange}
                        isInvalid={!!errors.assembly_name}
                        className="compact-input"
                      >
                        <option value="">{translations.selectOption}</option>
                        {assemblyOptions.map((assembly, index) => (
                          <option key={index} value={assembly}>{assembly}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.assembly_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="center_name">
                      <Form.Label className="small-fonts fw-bold">{translations.centerName}</Form.Label>
                      <Form.Select
                        name="center_name"
                        value={formData.center_name}
                        onChange={handleChange}
                        isInvalid={!!errors.center_name}
                        className="compact-input"
                      >
                        <option value="">{translations.selectOption}</option>
                        {centerOptions.map((center, index) => (
                          <option key={index} value={center}>{center}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.center_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="supplied_item_name">
                      <Form.Label className="small-fonts fw-bold">{translations.suppliedItemName}</Form.Label>
                      <Form.Control type="text" name="supplied_item_name" value={formData.supplied_item_name} onChange={handleChange} isInvalid={!!errors.supplied_item_name} className="compact-input" placeholder="प्रदत्त सामग्री का नाम दर्ज करें" />
                      <Form.Control.Feedback type="invalid">{errors.supplied_item_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="unit">
                      <Form.Label className="small-fonts fw-bold">{translations.unit}</Form.Label>
                      <Form.Select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        isInvalid={!!errors.unit}
                        className="compact-input"
                      >
                        <option value="">{translations.selectOption}</option>
                        {unitOptions.map((unit, index) => (
                          <option key={index} value={unit}>{unit}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.unit}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="quantity">
                      <Form.Label className="small-fonts fw-bold">{translations.quantity}</Form.Label>
                      <Form.Control type="number" name="quantity" value={formData.quantity} onChange={handleChange} isInvalid={!!errors.quantity} className="compact-input" placeholder="मात्रा दर्ज करें" />
                      <Form.Control.Feedback type="invalid">{errors.quantity}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="rate">
                      <Form.Label className="small-fonts fw-bold">{translations.rate}</Form.Label>
                      <Form.Control type="number" name="rate" value={formData.rate} onChange={handleChange} isInvalid={!!errors.rate} className="compact-input" placeholder="दर दर्ज करें" />
                      <Form.Control.Feedback type="invalid">{errors.rate}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="amount">
                      <Form.Label className="small-fonts fw-bold">{translations.amount}</Form.Label>
                      <Form.Control type="number" name="amount" value={formData.amount} onChange={handleChange} isInvalid={!!errors.amount} className="compact-input" placeholder="राशि दर्ज करें" disabled />
                      <Form.Control.Feedback type="invalid">{errors.amount}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="aadhaar_number">
                      <Form.Label className="small-fonts fw-bold">{translations.aadhaarNumber}</Form.Label>
                      <Form.Control type="text" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} isInvalid={!!errors.aadhaar_number} className="compact-input" placeholder="आधार नंबर दर्ज करें" />
                      <Form.Control.Feedback type="invalid">{errors.aadhaar_number}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="bank_account_number">
                      <Form.Label className="small-fonts fw-bold">{translations.bankAccountNumber}</Form.Label>
                      <Form.Control type="text" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} isInvalid={!!errors.bank_account_number} className="compact-input" placeholder="बैंक खाता नंबर दर्ज करें" />
                      <Form.Control.Feedback type="invalid">{errors.bank_account_number}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="ifsc_code">
                      <Form.Label className="small-fonts fw-bold">{translations.ifscCode}</Form.Label>
                      <Form.Control type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} isInvalid={!!errors.ifsc_code} className="compact-input" placeholder="IFSC कोड दर्ज करें" />
                      <Form.Control.Feedback type="invalid">{errors.ifsc_code}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="mobile_number">
                      <Form.Label className="small-fonts fw-bold">{translations.mobileNumber}</Form.Label>
                      <Form.Control type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} isInvalid={!!errors.mobile_number} className="compact-input" placeholder="मोबाइल नंबर दर्ज करें" />
                      <Form.Control.Feedback type="invalid">{errors.mobile_number}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="category">
                      <Form.Label className="small-fonts fw-bold">{translations.category}</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        isInvalid={!!errors.category}
                        className="compact-input"
                      >
                        <option value="">{translations.selectOption}</option>
                        {categoryOptions.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2" controlId="scheme_name">
                      <Form.Label className="small-fonts fw-bold">{translations.schemeName}</Form.Label>
                      <Form.Select
                        name="scheme_name"
                        value={formData.scheme_name}
                        onChange={handleChange}
                        isInvalid={!!errors.scheme_name}
                        className="compact-input"
                      >
                        <option value="">{translations.selectOption}</option>
                        {schemeOptions.map((scheme, index) => (
                          <option key={index} value={scheme}>{scheme}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.scheme_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3} className="d-flex align-items-center mt-3">
                    <Button variant="primary" type="submit" disabled={isSubmitting} className="compact-submit-btn w-100">
                      {isSubmitting ? translations.submitting : translations.submitButton}
                    </Button>
                  </Col>
                </Row>
              </Form>

          <hr />

          {/* Table Section */}
          <h2 className="section-title small-fonts mb-4">{translations.pageTitleList}</h2>

          {tableError && (
            <Alert variant="danger" className="small-fonts">
              {translations.error}: {tableError}
            </Alert>
          )}

          {registrations.length > 0 ? (
            <>
              {/* Filter Cards Section */}
              <div className="category-cards-container mb-4">
                <Row className="g-3">
                  {Object.keys(fieldMappings).map((key) => (
                    <div className="col" key={key}>
                      <div 
                        className="card radius-10 border-start border-0 border-4 border-info" 
                        onClick={() => handleCategoryCardClick(key)} 
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="card-body">
                          <div className="d-flex align-items-center">
                            <div>
                              <p className="mb-0 text-secondary">{fieldMappings[key].title}</p>
                              <h4 className="my-1 text-info">{filterOptions[key]?.length || 0} प्रकार</h4>
                              {activeFilters[key] && (
                                <Badge className="success-txt" pill>{activeFilters[key].length} चयनित</Badge>
                              )}
                            </div>
                            <div className="widgets-icons-2 rounded-circle bg-gradient-blues text-white ms-auto">
                              {fieldMappings[key].icon}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </Row>
              </div>

              {/* Filter Buttons Section */}
              <div className="d-flex flex-column flex-md-row gap-3">
                {filterCategory && (
                  <div className="filter-buttons-container mb-4 p-3 border rounded bg-light col-md-6">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0 small-fonts">{fieldMappings[filterCategory].title} का चयन करें</h5>
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
                  <div className="active-filters-container mb-4 p-2 border rounded bg-light col-md-6">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0 small-fonts">लागू फ़िल्टर:</h6>
                      <Button variant="danger" size="sm" onClick={clearAllFilters}>
                        <FaTimes className="me-1" /> {translations.clearAllFilters}
                      </Button>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {Object.keys(activeFilters).map((categoryKey) => (
                        <div key={categoryKey} className="filter-category">
                          <strong>{fieldMappings[categoryKey].title}:</strong>
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
              </div>

              {/* Search Section */}
              <Card className="mb-4 p-3">
                <h5 className="small-fonts mb-3">खोजें</h5>
                <Row>
                  <Col md={2} className="mb-3">
                    <Form.Group>
                      <Form.Label className="small-fonts">{translations.farmerName}</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="कृषक का नाम दर्ज करें"
                        value={searchTerms.farmerName}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, farmerName: e.target.value }))}
                        className="compact-input small-fonts"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="mb-3">
                    <Form.Group>
                      <Form.Label className="small-fonts">{translations.fatherName}</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="पिता का नाम दर्ज करें"
                        value={searchTerms.fatherName}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, fatherName: e.target.value }))}
                        className="compact-input small-fonts"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="mb-3">
                    <Form.Group>
                      <Form.Label className="small-fonts">{translations.suppliedItemName}</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="प्रदत्त सामग्री का नाम दर्ज करें"
                        value={searchTerms.suppliedItemName}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, suppliedItemName: e.target.value }))}
                        className="compact-input small-fonts"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="mb-3">
                    <Form.Group>
                      <Form.Label className="small-fonts">{translations.mobileNumber}</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="मोबाइल नंबर दर्ज करें"
                        value={searchTerms.mobileNumber}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, mobileNumber: e.target.value }))}
                        className="compact-input small-fonts"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="mb-3">
                    <Form.Group>
                      <Form.Label className="small-fonts">{translations.aadhaarNumber}</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="आधार नंबर दर्ज करें"
                        value={searchTerms.aadhaarNumber}
                        onChange={(e) => setSearchTerms(prev => ({ ...prev, aadhaarNumber: e.target.value }))}
                        className="compact-input small-fonts"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="mb-3 d-flex align-items-end">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setSearchTerms({ farmerName: '', fatherName: '', suppliedItemName: '', mobileNumber: '', aadhaarNumber: '' })}
                      className="w-100 small-fonts"
                    >
                      खोज साफ करें
                    </Button>
                  </Col>
                </Row>
              </Card>

              <Card className="p-3">
                <div className="table-info mb-2 d-flex justify-content-between align-items-center">
                  <span className="small-fonts">
                    {translations.showing} {indexOfFirstItem + 1} {translations.to} {Math.min(indexOfLastItem, filteredRegistrations.length)} {translations.of} {filteredRegistrations.length} {translations.entries}
                  </span>
                  <div className="d-flex align-items-center">
                    <span className="small-fonts me-2">{translations.itemsPerPage}</span>
                    <span className="badge bg-primary">{itemsPerPage}</span>
                  </div>
                </div>

                {/* Column Selection Section */}
                <ColumnSelection
                  columns={availableColumns}
                  selectedColumns={selectedColumns}
                  setSelectedColumns={setSelectedColumns}
                  title={translations.selectColumns}
                />

                <div className="d-flex justify-content-end mb-2">
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => downloadExcel(
                      filteredRegistrations,
                      `Beneficiaries_Registration_${new Date().toISOString().slice(0, 10)}`,
                      tableColumnMapping,
                      selectedColumns,
                      true
                    )}
                    className="me-2"
                  >
                    <FaFileExcel className="me-1" />Excel
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => downloadPdf(filteredRegistrations, `Beneficiaries_Registration_${new Date().toISOString().slice(0, 10)}`, selectedColumns, "लाभार्थी पंजीकरण सूची")}
                  >
                    <FaFilePdf className="me-1" />PDF
                  </Button>
                </div>

                <div className="table-responsive">
                  <table className="responsive-table small-fonts">
                    <thead>
                      <tr>
                        {selectedColumns.map(col => (
                          <th key={col}>{tableColumnMapping[col].header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((item, index) => (
                        <tr key={index}>
                          {selectedColumns.map(col => (
                            <td key={col} data-label={tableColumnMapping[col].header}>
                              {tableColumnMapping[col].accessor(item, index, currentPage, itemsPerPage)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-primary fw-bold">
                        {selectedColumns.map(col => {
                          if (col === 'sno') {
                            return <td key={col} className="text-end">{translations.total}</td>;
                          } else if (col === 'quantity') {
                            return <td key={col}>{filteredRegistrations.filter(item => item && item.quantity).reduce((sum, item) => sum + parseFloat(item.quantity || 0), 0).toFixed(2)}</td>;
                          } else if (col === 'amount') {
                            return <td key={col}>₹{filteredRegistrations.filter(item => item && item.amount).reduce((sum, item) => sum + parseFloat(item.amount || 0), 0).toFixed(2)}</td>;
                          } else {
                            return <td key={col}></td>;
                          }
                        })}
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
              </Card>
            </>
          ) : (
            <Alert variant="info">
              {translations.noDataFound}
            </Alert>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Registration;