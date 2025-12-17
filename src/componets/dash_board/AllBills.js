import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Spinner, Alert, Row, Col, Button, FormGroup, FormLabel, Form, Collapse, Badge, Pagination } from "react-bootstrap";
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import Footer from "../footer/Footer";

// API URLs
const GET_REPORTS_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/report-billing-items/";
const UPDATE_REPORT_STATUS_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/update-billing-item/";
const BASE_URL = "https://mahadevaaya.com/govbillingsystem/backend";

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
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: '#6b7280',
    fontSize: '14px',
  }),
};

// Hindi translations
const translations = {
  dashboard: "डैशबोर्ड",
  allBills: "सभी बिल रिपोर्ट",
  filters: "फिल्टर",
  clearAllFilters: "सभी फिल्टर हटाएं",
  centerName: "केंद्र का नाम",
  sourceOfReceipt: "रसीद का स्रोत",
  sno: "क्र.सं.",
  reportId: "रिपोर्ट आईडी",
  billId: "बिल आईडी", // Updated to show in Hindi
  reportDate: "रिपोर्ट दिनांक",
  status: "स्थिति",
  download: "डाउनलोड",
  viewDetails: "विवरण देखें",
  loading: "लोड हो रहा है...",
  noReportsFound: "कोई बिल रिपोर्ट नहीं मिली।",
  noMatchingReports: "चयनित फिल्टर से मेल खाने वाली कोई रिपोर्ट नहीं मिली।",
  allCenters: "सभी केंद्र",
  allSources: "सभी स्रोत",
  selectCenterFirst: "पहले केंद्र चुनें",
  fetchError: "डेटा लाने में विफल। कृपया बाद में पुन: प्रयास करें।",
  networkError: "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।",
  serverError: "सर्वर त्रुटि। कृपया बाद में पुन: प्रयास करें।",
  dataError: "डेटा प्रोसेस करने में त्रुटि।",
  retry: "पुनः प्रयास करें",
  error: "त्रुटि",
  downloadError: "रिपोर्ट डाउनलोड करने में त्रुटि। कृपया बाद में पुन: प्रयास करें।",
  downloadSuccess: "रिपोर्ट सफलतापूर्वक डाउनलोड की गई।",
  statusUpdateSuccess: "रिपोर्ट स्थिति सफलतापूर्वक अपडेट की गई।",
  statusUpdateError: "रिपोर्ट स्थिति अपडेट करने में त्रुटि। कृपया बाद में पुन: प्रयास करें।",
  cancelReport: "रिपोर्ट रद्द करें",
  confirmCancel: "क्या आप वाकई इस रिपोर्ट को रद्द करना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।",
  yes: "हाँ",
  no: "नहीं",
  accepted: "स्वीकृत",
  cancelled: "रद्द",
  component: "घटक", // Changed from "घटक विवरण" to just "घटक"
  investmentName: "निवेश का नाम",
  unit: "इकाई",
  allocatedQuantity: "आवंटित मात्रा",
  rate: "दर",
  updatedQuantity: "अपडेट की गई मात्रा",
  buyAmount: "खरीद राशि",
  soldAmount: "बेची गई राशि",
  schemeName: "योजना का नाम",
  totalItems: "कुल आइटम",
  // Pagination translations
  showing: "दिखा रहे हैं",
  to: "से",
  of: "का",
  entries: "प्रविष्टियां",
  page: "पृष्ठ",
  itemsPerPage: "प्रति पृष्ठ आइटम:",
  details: "विवरण",
  // New translations for download options
  downloadExcel: "एक्सेल डाउनलोड करें",
  downloadPdf: "पीडीएफ डाउनलोड करें",
  downloadOptions: "डाउनलोड विकल्प",
  selectReports: "रिपोर्ट चुनें",
  allReports: "सभी रिपोर्टें",
  excelDownloadError: "एक्सेल डाउनलोड करने में त्रुटि। कृपया बाद में पुन: प्रयास करें।",
  pdfDownloadError: "पीडीएफ डाउनलोड करने में त्रुटि। कृपया बाद में पुन: प्रयास करें।",
  excelDownloadSuccess: "एक्सेल फाइल सफलतापूर्वक डाउनलोड की गई।",
  pdfDownloadSuccess: "पीडीएफ फाइल सफलतापूर्वक डाउनलोड की गई।",
  viewReceipt: "रसीद देखें",
  receipt: "रसीद",
  downloadBill: "बिल डाउनलोड करें",
  downloadCancelledBill: "रद्द किए गए बिल डाउनलोड करें",
  selectColumns: "कॉलम चुनें"
};

// Available columns for download
const availableColumns = [
  { key: 'reportId', label: translations.reportId },
  { key: 'centerName', label: translations.centerName },
  { key: 'sourceOfReceipt', label: translations.sourceOfReceipt },
  { key: 'reportDate', label: translations.reportDate },
  { key: 'status', label: translations.status },
  { key: 'totalItems', label: translations.totalItems }
];

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('hi-IN');
};

// Column mapping for data access
const columnMapping = {
  reportId: { header: translations.reportId, accessor: (item) => item.bill_report_id },
  centerName: { header: translations.centerName, accessor: (item) => item.center_name },
  sourceOfReceipt: { header: translations.sourceOfReceipt, accessor: (item) => item.source_of_receipt },
  reportDate: { header: translations.reportDate, accessor: (item) => formatDate(item.created_at) },
  status: { header: translations.status, accessor: (item) => item.status === 'accepted' ? translations.accepted : item.status === 'cancelled' ? translations.cancelled : item.status },
  totalItems: { header: translations.totalItems, accessor: (item) => item.component_data.length }
};

const AllBills = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // State for API data, loading, and errors
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for form submission
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [lastDownloadType, setLastDownloadType] = useState(null); // Track the last download type
  
  // State for status update
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reportToCancel, setReportToCancel] = useState(null);
  const [billIdToCancel, setBillIdToCancel] = useState(null); // State to track bill_id for cancellation
  
  // State for tracking which reports are expanded
  const [expandedReports, setExpandedReports] = useState({});
  
  // State for filtering
  const [filters, setFilters] = useState({
    center_name: [],
    source_of_receipt: [],
    bill_id: [],
    status: [],
    dateFrom: '',
    dateTo: ''
  });
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State for bulk download options
  const [selectedReports, setSelectedReports] = useState([]); // For bulk download

  // State for column selection
  const [selectedColumns, setSelectedColumns] = useState(availableColumns.map(col => col.key));
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
  // useEffect for fetching data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(GET_REPORTS_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReportsData(data);
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
  }, [filters]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!reportsData || reportsData.length === 0) {
      return {
        center_name: [],
        source_of_receipt: [],
        bill_id: [],
        status: []
      };
    }

    return {
      center_name: [...new Set(reportsData.map(item => item.center_name))].map(name => ({ value: name, label: name })),
      source_of_receipt: [...new Set(reportsData.map(item => item.source_of_receipt))].map(name => ({ value: name, label: name })),
      bill_id: [...new Set(reportsData.map(item => item.bill_report_id))].map(id => ({ value: id, label: id })),
      status: [...new Set(reportsData.map(item => item.status))].map(status => ({
        value: status,
        label: status === 'accepted' ? translations.accepted : status === 'cancelled' ? translations.cancelled : status
      }))
    };
  }, [reportsData]);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return reportsData.filter(item => {
      const matchesCenter = filters.center_name.length === 0 || filters.center_name.some(c => c.value === item.center_name);
      const matchesSource = filters.source_of_receipt.length === 0 || filters.source_of_receipt.some(s => s.value === item.source_of_receipt);
      const matchesBillId = filters.bill_id.length === 0 || filters.bill_id.some(b => b.value === item.bill_report_id);
      const matchesStatus = filters.status.length === 0 || filters.status.some(s => s.value === item.status);
      const itemDate = new Date(item.created_at);
      const matchesDateFrom = !filters.dateFrom || itemDate >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || itemDate <= new Date(filters.dateTo + 'T23:59:59');
      return matchesCenter && matchesSource && matchesBillId && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [reportsData, filters]);
  
  // Calculate paginated data based on filtered data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedReportsData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  
  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  // Toggle report details
  const toggleReportDetails = (reportId) => {
    setExpandedReports(prev => ({
      ...prev,
      [reportId]: !prev[reportId]
    }));
  };
  
  // Convert table data to Excel format and download
  const downloadExcel = (data, filename) => {
    try {
      // Prepare data for Excel export based on selected columns
      const excelData = data.map(item => {
        const row = {};
        selectedColumns.forEach(col => {
          row[columnMapping[col].header] = columnMapping[col].accessor(item);
        });
        return row;
      });

      // Create a new workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "Reports");

      // Save the file
      XLSX.writeFile(wb, `${filename}.xlsx`);
      setDownloadSuccess(true);
      setLastDownloadType('excel');
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      setDownloadError(translations.excelDownloadError);
      setTimeout(() => setDownloadError(null), 3000);
    }
  };
  
  // Convert table data to PDF format and download
  const downloadPdf = (data, filename) => {
    try {
      // Create headers and rows based on selected columns
      const headers = selectedColumns.map(col => `<th>${columnMapping[col].header}</th>`).join('');
      const rows = data.map(item => {
        const cells = selectedColumns.map(col => `<td>${columnMapping[col].accessor(item)}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');

      // Create a simple HTML table for PDF
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
            <h2>${translations.allBills}</h2>
            <table>
              <tr>${headers}</tr>
              ${rows}
            </table>
          </body>
        </html>
      `;

      // Create a new window and print
      const printWindow = window.open('', '_blank');
      printWindow.document.write(tableHtml);
      printWindow.document.close();

      // Wait for the content to load, then trigger print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      setDownloadSuccess(true);
      setLastDownloadType('pdf');
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      setDownloadError(translations.pdfDownloadError);
      setTimeout(() => setDownloadError(null), 3000);
    }
  };
  
  // Convert component data to Excel format and download
  const downloadExcelComponent = (componentData, filename) => {
    try {
      const excelData = componentData.map(item => ({
        [translations.reportId]: item.report_id || '',
        [translations.component]: item.component,
        [translations.investmentName]: item.investment_name,
        [translations.unit]: item.unit,
        [translations.allocatedQuantity]: item.allocated_quantity,
        [translations.rate]: item.rate,
        [translations.updatedQuantity]: item.updated_quantity,
        [translations.buyAmount]: item.buy_amount,
        [translations.soldAmount]: item.sold_amount,
        [translations.schemeName]: item.scheme_name
      }));

      // Calculate totals
      const totals = componentData.reduce((acc, comp) => {
        acc.allocated += parseFloat(comp.allocated_quantity) || 0;
        acc.rate += parseFloat(comp.rate) || 0;
        acc.updated += parseFloat(comp.updated_quantity) || 0;
        acc.buy += parseFloat(comp.buy_amount) || 0;
        acc.sold += parseFloat(comp.sold_amount) || 0;
        return acc;
      }, { allocated: 0, rate: 0, updated: 0, buy: 0, sold: 0 });

      // Add total row
      excelData.push({
        [translations.reportId]: 'Total',
        [translations.component]: '',
        [translations.investmentName]: '',
        [translations.unit]: '',
        [translations.allocatedQuantity]: totals.allocated,
        [translations.rate]: totals.rate,
        [translations.updatedQuantity]: totals.updated,
        [translations.buyAmount]: totals.buy,
        [translations.soldAmount]: totals.sold,
        [translations.schemeName]: ''
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "Components");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
    }
  };
  
  // Convert component data to PDF format and download
  const downloadPdfComponent = (componentData, filename) => {
    try {
      // Calculate totals
      const totals = componentData.reduce((acc, comp) => {
        acc.allocated += parseFloat(comp.allocated_quantity) || 0;
        acc.rate += parseFloat(comp.rate) || 0;
        acc.updated += parseFloat(comp.updated_quantity) || 0;
        acc.buy += parseFloat(comp.buy_amount) || 0;
        acc.sold += parseFloat(comp.sold_amount) || 0;
        return acc;
      }, { allocated: 0, rate: 0, updated: 0, buy: 0, sold: 0 });

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
            <h2>${translations.component}</h2>
            <table>
              <tr>
                <th>${translations.reportId}</th>
                <th>${translations.component}</th>
                <th>${translations.investmentName}</th>
                <th>${translations.unit}</th>
                <th>${translations.allocatedQuantity}</th>
                <th>${translations.rate}</th>
                <th>${translations.updatedQuantity}</th>
                <th>${translations.buyAmount}</th>
                <th>${translations.soldAmount}</th>
                <th>${translations.schemeName}</th>
              </tr>
              ${componentData.map(item => `
                <tr>
                  <td>${item.report_id || ''}</td>
                  <td>${item.component}</td>
                  <td>${item.investment_name}</td>
                  <td>${item.unit}</td>
                  <td>${item.allocated_quantity}</td>
                  <td>${item.rate}</td>
                  <td>${item.updated_quantity}</td>
                  <td>${item.buy_amount}</td>
                  <td>${item.sold_amount}</td>
                  <td>${item.scheme_name}</td>
                </tr>
              `).join('')}
              <tr>
                <td><strong>Total</strong></td>
                <td></td>
                <td></td>
                <td></td>
                <td><strong>${totals.allocated}</strong></td>
                <td><strong>${totals.rate}</strong></td>
                <td><strong>${totals.updated}</strong></td>
                <td><strong>${totals.buy}</strong></td>
                <td><strong>${totals.sold}</strong></td>
                <td></td>
              </tr>
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
  
  // Handle bulk download
  const handleBulkDownload = (type) => {
    try {
      setDownloading(true);
      setDownloadError(null);
      setDownloadSuccess(false);
      
      // Get reports to download (selected or all visible)
      const reportsToDownload = selectedReports.length > 0 
        ? filteredData.filter(item => selectedReports.includes(item.id))
        : filteredData; // Use all visible reports if none selected
      
      // Create filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      const filename = `Reports_${currentDate}`;
      
      // Download based on type
      if (type === 'excel') {
        downloadExcel(reportsToDownload, filename);
      } else {
        downloadPdf(reportsToDownload, filename);
      }
      
      // Clear selection after download
      setSelectedReports([]);
    } catch (e) {
      setDownloadError(e.message);
      setTimeout(() => setDownloadError(null), 3000);
    } finally {
      setDownloading(false);
    }
  };
  
  // Handle report status update
  const handleStatusUpdate = async () => {
    try {
      setUpdatingStatus(reportToCancel);
      setStatusUpdateError(null);
      setStatusUpdateSuccess(false);
      
      // Create payload for the API request
      const payload = {
        bill_report_id: billIdToCancel, // Use bill_report_id instead of bill_id
        status: 'cancelled'
      };
      
      // Use PUT method instead of POST
      const response = await fetch(UPDATE_REPORT_STATUS_URL, {
        method: 'PUT', // Changed from POST to PUT
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        // Try to get more detailed error information
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }
      
       await response.json();
      
      // Update local state to reflect the status change
      setReportsData(prevData => 
        prevData.map(item => 
          item.id === reportToCancel ? { ...item, status: 'cancelled' } : item
        )
      );
      
      setStatusUpdateSuccess(true);
      setShowConfirmDialog(false);
      setReportToCancel(null);
      setBillIdToCancel(null);
    } catch (e) {
      setStatusUpdateError(e.message);
    } finally {
      setUpdatingStatus(null);
    }
  };
  
  // Show confirmation dialog before cancelling
  const confirmCancelReport = (reportId, billId) => {
    setReportToCancel(reportId);
    setBillIdToCancel(billId); // Store bill_id for cancellation
    setShowConfirmDialog(true);
  };
  
  // Cancel confirmation dialog
  const cancelConfirmation = () => {
    setShowConfirmDialog(false);
    setReportToCancel(null);
    setBillIdToCancel(null);
  };

  // View receipt file - Updated to use correct base URL
  const viewReceipt = (receiptPath) => {
    // Construct full URL using base URL and receipt path
    const fullUrl = `${BASE_URL}${receiptPath}`;
    // Open receipt file in a new tab
    window.open(fullUrl, '_blank');
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      center_name: [],
      source_of_receipt: [],
      bill_id: [],
      status: [],
      dateFrom: '',
      dateTo: ''
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

  
  // Get status badge variant based on status
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

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

  return (
    <>
      <div className="dashboard-container">
        <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content">
          <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <Container fluid className="dashboard-body">
            <h1 className="page-title small-fonts">{translations.allBills}</h1>
            
            {downloadSuccess && (
              <Alert variant="success" dismissible onClose={() => setDownloadSuccess(false)}>
                {lastDownloadType === 'excel' ? translations.excelDownloadSuccess : 
                 lastDownloadType === 'pdf' ? translations.pdfDownloadSuccess :
                 lastDownloadType === 'cancelledBill' ? translations.downloadSuccess :
                 translations.downloadSuccess}
              </Alert>
            )}
            
            {statusUpdateSuccess && (
              <Alert variant="success" dismissible onClose={() => setStatusUpdateSuccess(false)}>
                {translations.statusUpdateSuccess}
              </Alert>
            )}
            
            {downloadError && (
              <Alert variant="danger" dismissible onClose={() => setDownloadError(null)}>
                {translations.error}: {downloadError}
              </Alert>
            )}
            
            {statusUpdateError && (
              <Alert variant="danger" dismissible onClose={() => setStatusUpdateError(null)}>
                {translations.error}: {statusUpdateError}
              </Alert>
            )}
            
            {/* Filters Section */}
            <div className="filter-section mb-4 p-3 border rounded bg-light">
              <Row className="mb-3">
                <Col md={12} className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 small-fonts">{translations.filters}</h5>
                  {(filters.center_name.length > 0 || filters.source_of_receipt.length > 0 || filters.bill_id.length > 0 || filters.status.length > 0 || filters.dateFrom || filters.dateTo) && (
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
                      isMulti
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
                      isMulti
                      isClearable
                      placeholder={translations.allSources}
                      styles={customSelectStyles}
                      className="small-fonts filter-dropdown"
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </FormGroup>
                </Col>

                <Col md={4} className="mb-3">
                  <FormGroup>
                    <FormLabel className="small-fonts">{translations.billId}</FormLabel>
                    <Select
                      value={filters.bill_id}
                      onChange={(value) => handleFilterChange('bill_id', value)}
                      options={filterOptions.bill_id}
                      isMulti
                      isClearable
                      placeholder="बिल आईडी"
                      styles={customSelectStyles}
                      className="small-fonts filter-dropdown"
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col md={4} className="mb-3">
                  <FormGroup>
                    <FormLabel className="small-fonts">{translations.status}</FormLabel>
                    <Select
                      value={filters.status}
                      onChange={(value) => handleFilterChange('status', value)}
                      options={filterOptions.status}
                      isMulti
                      isClearable
                      placeholder="स्थिति"
                      styles={customSelectStyles}
                      className="small-fonts filter-dropdown"
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </FormGroup>
                </Col>

                <Col md={4} className="mb-3">
                  <FormGroup>
                    <FormLabel className="small-fonts">From Date</FormLabel>
                    <input
                      type="date"
                      className="form-control small-fonts"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    />
                  </FormGroup>
                </Col>

                <Col md={4} className="mb-3">
                  <FormGroup>
                    <FormLabel className="small-fonts">To Date</FormLabel>
                    <input
                      type="date"
                      className="form-control small-fonts"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </div>

            {/* Column Selection Section */}
            <div className="column-selection mb-4 p-3 border rounded bg-light">
              <h5 className="small-fonts mb-3">{translations.selectColumns}</h5>
              <Row>
                <Col>
                  <div className="d-flex flex-wrap">
                    {availableColumns.map(col => (
                      <Form.Check
                        type="checkbox"
                        id={col.key}
                        label={col.label}
                        checked={selectedColumns.includes(col.key)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedColumns([...selectedColumns, col.key]);
                          } else {
                            setSelectedColumns(selectedColumns.filter(c => c !== col.key));
                          }
                        }}
                        className="me-3 small-fonts"
                      />
                    ))}
                  </div>
                </Col>
              </Row>
            </div>

            {/* Reports Section */}
            <div className="reports-container">
              <Row className="mt-3">
                <div className="col-md-12">
                  <div className="table-wrapper">
                    {filteredData.length > 0 ? (
                      <>
                        <div className="table-info mb-2 d-flex justify-content-between align-items-center">
                          <span className="small-fonts">
                            {translations.showing} {indexOfFirstItem + 1} {translations.to} {Math.min(indexOfLastItem, filteredData.length)} {translations.of} {filteredData.length} {translations.entries}
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
                            onClick={() => handleBulkDownload('excel')}
                            disabled={downloading}
                            className="me-2"
                          >
                            <FaFileExcel className="me-1" />Excel
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleBulkDownload('pdf')}
                            disabled={downloading}
                          >
                            <FaFilePdf className="me-1" />PDF
                          </Button>
                        </div>
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
                              <th>{translations.receipt}</th>
                              <th>{translations.cancelReport}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedReportsData.map((item, index) => (
                              <React.Fragment key={item.id}>
                                <tr>
                                  <td data-label={translations.sno}>{indexOfFirstItem + index + 1}</td>
                                  <td data-label={translations.reportId}>{item.bill_report_id}</td>
                                  <td data-label={translations.centerName}>{item.center_name}</td>
                                  <td data-label={translations.sourceOfReceipt}>{item.source_of_receipt}</td>
                                  <td data-label={translations.reportDate}>{formatDate(item.created_at)}</td>
                                  <td data-label={translations.status}>
                                    <Badge bg={getStatusBadgeVariant(item.status)}>
                                      {item.status === 'accepted' ? translations.accepted : 
                                       item.status === 'cancelled' ? translations.cancelled : item.status}
                                    </Badge>
                                  </td>
                                  <td data-label={translations.totalItems}>
                                    <Badge bg="info">{item.component_data.length}</Badge>
                                  </td>
                                  <td data-label={translations.viewDetails}>
                                    <Button 
                                      variant="outline-primary" 
                                      size="sm" 
                                      onClick={() => toggleReportDetails(item.id)}
                                      className="small-fonts"
                                    >
                                      {translations.viewDetails}
                                    </Button>
                                  </td>
                                  <td data-label={translations.receipt}>
                                    <Button 
                                      variant="outline-success" 
                                      size="sm" 
                                      onClick={() => viewReceipt(item.recipt_file)}
                                      className="small-fonts"
                                    >
                                      {translations.viewReceipt}
                                    </Button>
                                  </td>
                                  <td data-label={translations.cancelReport}>
                                    {item.status === 'accepted' && (
                                      <Button 
                                        variant="danger" 
                                        size="sm" 
                                        onClick={() => confirmCancelReport(item.id, item.bill_report_id)} // Send bill_report_id instead of component bill_id
                                        disabled={updatingStatus === item.id}
                                        className="small-fonts"
                                      >
                                        {updatingStatus === item.id ? 
                                          <Spinner as="span" animation="border" size="sm" /> : null}
                                        {translations.cancelReport}
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                                <tr>
                                  <td colSpan="10" className="p-0">
                                    <Collapse in={expandedReports[item.id]}>
                                      <div className="p-3 bg-light">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                          <h5 className="mb-0">{translations.component}</h5>
                                          <div>
                                            <Button 
                                              variant="outline-success" 
                                              size="sm" 
                                              onClick={() => downloadExcelComponent(item.component_data, `Component_${item.bill_report_id}`)}
                                              className="me-2"
                                            >
                                              <FaFileExcel className="me-1" />Excel
                                            </Button>
                                            <Button 
                                              variant="outline-danger" 
                                              size="sm" 
                                              onClick={() => downloadPdfComponent(item.component_data, `Component_${item.bill_report_id}`)}
                                            >
                                              <FaFilePdf className="me-1" />PDF
                                            </Button>
                                          </div>
                                        </div>
                                        {item.component_data.length > 0 ? (() => {
                                          const totals = item.component_data.reduce((acc, comp) => {
                                            acc.allocated += parseFloat(comp.allocated_quantity) || 0;
                                            acc.rate += parseFloat(comp.rate) || 0;
                                            acc.updated += parseFloat(comp.updated_quantity) || 0;
                                            acc.buy += parseFloat(comp.buy_amount) || 0;
                                            acc.sold += parseFloat(comp.sold_amount) || 0;
                                            return acc;
                                          }, { allocated: 0, rate: 0, updated: 0, buy: 0, sold: 0 });

                                          return (
                                            <table className="table table-sm table-bordered">
                                              <thead>
                                                <tr>
                                                  <th>{translations.reportId}</th>
                                                  <th>{translations.component}</th>
                                                  <th>{translations.investmentName}</th>
                                                  <th>{translations.unit}</th>
                                                  <th>{translations.allocatedQuantity}</th>
                                                  <th>{translations.rate}</th>
                                                  <th>{translations.updatedQuantity}</th>
                                                  <th>{translations.buyAmount}</th>
                                                  <th>{translations.soldAmount}</th>
                                                  <th>{translations.schemeName}</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {item.component_data.map((component, compIndex) => (
                                                  <tr key={compIndex}>
                                                    <td>{item.bill_report_id}</td> {/* Use parent item's bill_report_id */}
                                                    <td>{component.component}</td>
                                                    <td>{component.investment_name}</td>
                                                    <td>{component.unit}</td>
                                                    <td>{component.allocated_quantity}</td>
                                                    <td>{component.rate}</td>
                                                    <td>{component.updated_quantity}</td>
                                                    <td>{component.buy_amount}</td>
                                                    <td>{component.sold_amount}</td>
                                                    <td>{component.scheme_name}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                              <tfoot>
                                                <tr>
                                                  <td colSpan="4"><strong>Total</strong></td>
                                                  <td><strong>{totals.allocated}</strong></td>
                                                  <td><strong>{totals.rate}</strong></td>
                                                  <td><strong>{totals.updated}</strong></td>
                                                  <td><strong>{totals.buy}</strong></td>
                                                  <td><strong>{totals.sold}</strong></td>
                                                  <td></td>
                                                </tr>
                                              </tfoot>
                                            </table>
                                          );
                                        })() : (
                                          <Alert variant="info">No component data available</Alert>
                                        )}
                                      </div>
                                    </Collapse>
                                  </td>
                                </tr>
                              </React.Fragment>
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
                      <Alert variant="info">
                        {translations.noMatchingReports}
                      </Alert>
                    )}
                  </div>
                </div>
              </Row>
            </div>
          </Container>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="confirmation-dialog-overlay">
          <div className="confirmation-dialog">
            <div className="confirmation-dialog-content">
              <h5>{translations.confirmCancel}</h5>
              <div className="confirmation-dialog-buttons">
                <Button 
                  variant="danger" 
                  onClick={handleStatusUpdate}
                  disabled={updatingStatus === reportToCancel}
                >
                  {updatingStatus === reportToCancel ? 
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

export default AllBills;
