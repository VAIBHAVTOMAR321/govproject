import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Form, Button, Alert, Row, Col, Card } from "react-bootstrap";
import { FaFileExcel, FaFilePdf } from 'react-icons/fa';
import axios from "axios";
import * as XLSX from 'xlsx';
import "../../assets/css/registration.css";
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";

// Hindi translations for form
const translations = {
  pageTitle: "लाभार्थी पंजीकरण",
  pageTitleSingle: "लाभार्थी पंजीकरण करें",
  pageTitleExcel: "एक्सेल से लाभार्थी पंजीकरण करें",
  farmerName: "किसान का नाम",
  fatherName: "पिता का नाम",
  address: "पता",
  blockName: "ब्लॉक का नाम",
  assemblyName: "विधानसभा का नाम",
  centerName: "केंद्र का नाम",
  suppliedItemName: "आपूर्ति किए गए आइटम का नाम",
  unit: "इकाई",
  quantity: "मात्रा",
  rate: "दर",
  amount: "राशि",
  aadhaarNumber: "आधार संख्या",
  bankAccountNumber: "बैंक खाता संख्या",
  ifscCode: "IFSC कोड",
  mobileNumber: "मोबाइल नंबर",
  category: "श्रेणी",
  schemeName: "योजना का नाम",
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
  total: "कुल"
};

// Available columns for Beneficiaries table
const beneficiariesColumns = [
  { key: 'sno', label: 'क्र.सं.' },
  { key: 'farmer_name', label: 'किसान का नाम' },
  { key: 'father_name', label: 'पिता का नाम' },
  { key: 'address', label: 'पता' },
  { key: 'block_name', label: 'ब्लॉक का नाम' },
  { key: 'assembly_name', label: 'विधानसभा का नाम' },
  { key: 'center_name', label: 'केंद्र का नाम' },
  { key: 'supplied_item_name', label: 'आपूर्ति किए गए आइटम का नाम' },
  { key: 'unit', label: 'इकाई' },
  { key: 'quantity', label: 'मात्रा' },
  { key: 'rate', label: 'दर' },
  { key: 'amount', label: 'राशि' },
  { key: 'aadhaar_number', label: 'आधार संख्या' },
  { key: 'bank_account_number', label: 'बैंक खाता संख्या' },
  { key: 'ifsc_code', label: 'IFSC कोड' },
  { key: 'mobile_number', label: 'मोबाइल नंबर' },
  { key: 'category', label: 'श्रेणी' },
  { key: 'scheme_name', label: 'योजना का नाम' }
];

// Column mapping for Beneficiaries table
const beneficiariesColumnMapping = {
  sno: { header: 'क्र.सं.', accessor: (item, index) => index + 1 },
  farmer_name: { header: 'किसान का नाम', accessor: (item) => item.farmer_name },
  father_name: { header: 'पिता का नाम', accessor: (item) => item.father_name },
  address: { header: 'पता', accessor: (item) => item.address },
  block_name: { header: 'ब्लॉक का नाम', accessor: (item) => item.block_name },
  assembly_name: { header: 'विधानसभा का नाम', accessor: (item) => item.assembly_name },
  center_name: { header: 'केंद्र का नाम', accessor: (item) => item.center_name },
  supplied_item_name: { header: 'आपूर्ति किए गए आइटम का नाम', accessor: (item) => item.supplied_item_name },
  unit: { header: 'इकाई', accessor: (item) => item.unit },
  quantity: { header: 'मात्रा', accessor: (item) => item.quantity },
  rate: { header: 'दर', accessor: (item) => item.rate },
  amount: { header: 'राशि', accessor: (item) => item.amount },
  aadhaar_number: { header: 'आधार संख्या', accessor: (item) => item.aadhaar_number },
  bank_account_number: { header: 'बैंक खाता संख्या', accessor: (item) => item.bank_account_number },
  ifsc_code: { header: 'IFSC कोड', accessor: (item) => item.ifsc_code },
  mobile_number: { header: 'मोबाइल नंबर', accessor: (item) => item.mobile_number },
  category: { header: 'श्रेणी', accessor: (item) => item.category },
  scheme_name: { header: 'योजना का नाम', accessor: (item) => item.scheme_name }
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

// Download Excel function
const downloadExcel = (data, filename, columnMapping, selectedColumns) => {
  try {
    // Prepare data for Excel export based on selected columns
    const excelData = data.map((item, index) => {
      const row = {};
      selectedColumns.forEach(col => {
        row[columnMapping[col].header] = columnMapping[col].accessor(item, index);
      });
      return row;
    });

    // Add totals row
    const totalsRow = {};
    selectedColumns.forEach(col => {
      if (col === 'sno') {
        totalsRow[columnMapping[col].header] = translations.total;
      } else {
        totalsRow[columnMapping[col].header] = "";
      }
    });
    excelData.push(totalsRow);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = selectedColumns.map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;

    // Style the totals row
    if (excelData.length > 0) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      const totalsRowNum = range.e.r; // Last row
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
  }
};

// Download PDF function
const downloadPdf = (data, filename, columnMapping, selectedColumns, title) => {
  try {
    // Create headers and rows based on selected columns
    const headers = selectedColumns.map(col => `<th>${columnMapping[col].header}</th>`).join('');
    const rows = data.map((item, index) => {
      const cells = selectedColumns.map(col => `<td>${columnMapping[col].accessor(item, index)}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    // Create totals row
    const totalsCells = selectedColumns.map(col => {
      if (col === 'sno') {
        return `<td>${translations.total}</td>`;
      } else {
        return `<td></td>`;
      }
    }).join('');
    const totalsRow = `<tr style="background-color: #e3f2fd; font-weight: bold;">${totalsCells}</tr>`;

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
              .no-print { display: none; }
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

    // Wait for content to load before printing
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    };
  } catch (e) {
    console.error("Error generating PDF:", e);
  }
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
    amount: "",
    aadhaar_number: "",
    bank_account_number: "",
    ifsc_code: "",
    mobile_number: "",
    category: "",
    scheme_name: ""
  });
  
  // State for dropdown options
  const [centerOptions, setCenterOptions] = useState([]);
  const [blockOptions, setBlockOptions] = useState([]);
  const [assemblyOptions, setAssemblyOptions] = useState([]);
  const [suppliedItemOptions, setSuppliedItemOptions] = useState([]);
  const [schemeOptions, setSchemeOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  
  // State for Excel upload
  const [excelData, setExcelData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [beneficiariesData, setBeneficiariesData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState(beneficiariesColumns.map(col => col.key));
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

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

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);

        // Fetch beneficiaries data for options
        const beneficiariesResponse = await axios.get('https://mahadevaaya.com/govbillingsystem/backend/api/beneficiaries-registration/');
        const data = Array.isArray(beneficiariesResponse.data.data) ? beneficiariesResponse.data.data : [];

        const centers = [...new Set(data.map(item => item.center_name))].filter(Boolean);
        const blocks = [...new Set(data.map(item => item.block_name))].filter(Boolean);
        const assemblies = [...new Set(data.map(item => item.assembly_name))].filter(Boolean);
        const suppliedItems = [...new Set(data.map(item => item.supplied_item_name))].filter(Boolean);
        const schemes = [...new Set(data.map(item => item.scheme_name))].filter(Boolean);
        const units = [...new Set(data.map(item => item.unit))].filter(Boolean);
        const categories = [...new Set(data.map(item => item.category))].filter(Boolean);

        setCenterOptions(centers);
        setBlockOptions(blocks);
        setAssemblyOptions(assemblies);
        setSuppliedItemOptions(suppliedItems);
        setSchemeOptions(schemes);
        setUnitOptions(units);
        setCategoryOptions(categories);

      } catch (error) {
        console.error("Error fetching dropdown options:", error);
        setApiError("ड्रॉपडाउन विकल्प लाने में त्रुटि। कृपया पेज रीफ्रेश करें।");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  // Fetch beneficiaries data for table
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const response = await axios.get('https://mahadevaaya.com/govbillingsystem/backend/api/beneficiaries-registration/');
        setBeneficiariesData(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error("Error fetching beneficiaries data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  // Handle form field changes for single entry
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
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
      const response = await axios.post('https://mahadevaaya.com/govbillingsystem/backend/api/beneficiaries-registration/', formData);
      setApiResponse(response.data);
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
        amount: "",
        aadhaar_number: "",
        bank_account_number: "",
        ifsc_code: "",
        mobile_number: "",
        category: "",
        scheme_name: ""
      });
      // Refresh the table data
      const refreshResponse = await axios.get('https://mahadevaaya.com/govbillingsystem/backend/api/beneficiaries-registration/');
      setBeneficiariesData(Array.isArray(refreshResponse.data.data) ? refreshResponse.data.data : []);
    } catch (error) {
      setApiError(error.response?.data?.message || translations.genericError);
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

    const requests = excelData.map(item =>
      axios.post('https://mahadevaaya.com/govbillingsystem/backend/api/beneficiaries-registration/', item)
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
      // Refresh the table data
      const refreshResponse = await axios.get('https://mahadevaaya.com/govbillingsystem/backend/api/beneficiaries-registration/');
      setBeneficiariesData(Array.isArray(refreshResponse.data.data) ? refreshResponse.data.data : []);
    } catch (error) {
      setApiError(translations.genericError);
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
    if (!formData.amount.trim()) newErrors.amount = `${translations.amount} ${translations.required}`;
    if (!formData.aadhaar_number.trim()) newErrors.aadhaar_number = `${translations.aadhaarNumber} ${translations.required}`;
    if (!formData.bank_account_number.trim()) newErrors.bank_account_number = `${translations.bankAccountNumber} ${translations.required}`;
    if (!formData.ifsc_code.trim()) newErrors.ifsc_code = `${translations.ifscCode} ${translations.required}`;
    if (!formData.mobile_number.trim()) newErrors.mobile_number = `${translations.mobileNumber} ${translations.required}`;
    if (!formData.category.trim()) newErrors.category = `${translations.category} ${translations.required}`;
    if (!formData.scheme_name.trim()) newErrors.scheme_name = `${translations.schemeName} ${translations.required}`;
    return newErrors;
  };

  return (
    <div className="dashboard-container">
      <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
      <div className="main-content">
        <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Container fluid className="dashboard-body">
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
          {loadingOptions ? (
            <div className="d-flex justify-content-center my-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <Form onSubmit={handleSubmit} className="registration-form">
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="farmer_name">
                      <Form.Label className="small-fonts">{translations.farmerName}</Form.Label>
                      <Form.Control type="text" name="farmer_name" value={formData.farmer_name} onChange={handleChange} isInvalid={!!errors.farmer_name} />
                      <Form.Control.Feedback type="invalid">{errors.farmer_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="father_name">
                      <Form.Label className="small-fonts">{translations.fatherName}</Form.Label>
                      <Form.Control type="text" name="father_name" value={formData.father_name} onChange={handleChange} isInvalid={!!errors.father_name} />
                      <Form.Control.Feedback type="invalid">{errors.father_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="address">
                      <Form.Label className="small-fonts">{translations.address}</Form.Label>
                      <Form.Control type="text" name="address" value={formData.address} onChange={handleChange} isInvalid={!!errors.address} />
                      <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="block_name">
                      <Form.Label className="small-fonts">{translations.blockName}</Form.Label>
                      <Form.Select
                        name="block_name"
                        value={formData.block_name}
                        onChange={handleChange}
                        isInvalid={!!errors.block_name}
                      >
                        <option value="">{translations.selectOption}</option>
                        {blockOptions.map((block, index) => (
                          <option key={index} value={block}>{block}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.block_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="assembly_name">
                      <Form.Label className="small-fonts">{translations.assemblyName}</Form.Label>
                      <Form.Select
                        name="assembly_name"
                        value={formData.assembly_name}
                        onChange={handleChange}
                        isInvalid={!!errors.assembly_name}
                      >
                        <option value="">{translations.selectOption}</option>
                        {assemblyOptions.map((assembly, index) => (
                          <option key={index} value={assembly}>{assembly}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.assembly_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="center_name">
                      <Form.Label className="small-fonts">{translations.centerName}</Form.Label>
                      <Form.Select
                        name="center_name"
                        value={formData.center_name}
                        onChange={handleChange}
                        isInvalid={!!errors.center_name}
                      >
                        <option value="">{translations.selectOption}</option>
                        {centerOptions.map((center, index) => (
                          <option key={index} value={center}>{center}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.center_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="supplied_item_name">
                      <Form.Label className="small-fonts">{translations.suppliedItemName}</Form.Label>
                      <Form.Select
                        name="supplied_item_name"
                        value={formData.supplied_item_name}
                        onChange={handleChange}
                        isInvalid={!!errors.supplied_item_name}
                      >
                        <option value="">{translations.selectOption}</option>
                        {suppliedItemOptions.map((item, index) => (
                          <option key={index} value={item}>{item}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.supplied_item_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="unit">
                      <Form.Label className="small-fonts">{translations.unit}</Form.Label>
                      <Form.Select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        isInvalid={!!errors.unit}
                      >
                        <option value="">{translations.selectOption}</option>
                        {unitOptions.map((unit, index) => (
                          <option key={index} value={unit}>{unit}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.unit}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="quantity">
                      <Form.Label className="small-fonts">{translations.quantity}</Form.Label>
                      <Form.Control type="text" name="quantity" value={formData.quantity} onChange={handleChange} isInvalid={!!errors.quantity} />
                      <Form.Control.Feedback type="invalid">{errors.quantity}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="rate">
                      <Form.Label className="small-fonts">{translations.rate}</Form.Label>
                      <Form.Control type="text" name="rate" value={formData.rate} onChange={handleChange} isInvalid={!!errors.rate} />
                      <Form.Control.Feedback type="invalid">{errors.rate}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="amount">
                      <Form.Label className="small-fonts">{translations.amount}</Form.Label>
                      <Form.Control type="text" name="amount" value={formData.amount} onChange={handleChange} isInvalid={!!errors.amount} />
                      <Form.Control.Feedback type="invalid">{errors.amount}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="aadhaar_number">
                      <Form.Label className="small-fonts">{translations.aadhaarNumber}</Form.Label>
                      <Form.Control type="text" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} isInvalid={!!errors.aadhaar_number} />
                      <Form.Control.Feedback type="invalid">{errors.aadhaar_number}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="bank_account_number">
                      <Form.Label className="small-fonts">{translations.bankAccountNumber}</Form.Label>
                      <Form.Control type="text" name="bank_account_number" value={formData.bank_account_number} onChange={handleChange} isInvalid={!!errors.bank_account_number} />
                      <Form.Control.Feedback type="invalid">{errors.bank_account_number}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="ifsc_code">
                      <Form.Label className="small-fonts">{translations.ifscCode}</Form.Label>
                      <Form.Control type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} isInvalid={!!errors.ifsc_code} />
                      <Form.Control.Feedback type="invalid">{errors.ifsc_code}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="mobile_number">
                      <Form.Label className="small-fonts">{translations.mobileNumber}</Form.Label>
                      <Form.Control type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} isInvalid={!!errors.mobile_number} />
                      <Form.Control.Feedback type="invalid">{errors.mobile_number}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="category">
                      <Form.Label className="small-fonts">{translations.category}</Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        isInvalid={!!errors.category}
                      >
                        <option value="">{translations.selectOption}</option>
                        {categoryOptions.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId="scheme_name">
                      <Form.Label className="small-fonts">{translations.schemeName}</Form.Label>
                      <Form.Select
                        name="scheme_name"
                        value={formData.scheme_name}
                        onChange={handleChange}
                        isInvalid={!!errors.scheme_name}
                      >
                        <option value="">{translations.selectOption}</option>
                        {schemeOptions.map((scheme, index) => (
                          <option key={index} value={scheme}>{scheme}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.scheme_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Button variant="primary" type="submit" disabled={isSubmitting} className="mt-4">
                      {isSubmitting ? translations.submitting : translations.submitButton}
                    </Button>
                  </Col>
                </Row>
              </Form>
            )}

            {/* Beneficiaries Table */}
            <Card className="mt-4">
              <Card.Header>
                <h6 className="mb-0">पंजीकृत लाभार्थी</h6>
              </Card.Header>
              <Card.Body className="p-0">
                {loadingData ? (
                  <div className="d-flex justify-content-center my-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <ColumnSelection
                      columns={beneficiariesColumns}
                      selectedColumns={selectedColumns}
                      setSelectedColumns={setSelectedColumns}
                      title={translations.selectColumns}
                    />

                    <div className="d-flex justify-content-end mb-2">
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => downloadExcel(beneficiariesData, `Beneficiaries_${new Date().toISOString().slice(0, 10)}`, beneficiariesColumnMapping, selectedColumns)}
                        className="me-2"
                      >
                        <FaFileExcel className="me-1" />Excel
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => downloadPdf(beneficiariesData, `Beneficiaries_${new Date().toISOString().slice(0, 10)}`, beneficiariesColumnMapping, selectedColumns, "पंजीकृत लाभार्थी")}
                      >
                        <FaFilePdf className="me-1" />
                        PDF
                      </Button>
                    </div>

                    <div className="table-wrapper">
                      <table className="responsive-table small-fonts">
                        <thead className="table-light">
                          <tr>
                            {selectedColumns.map(col => (
                              <th key={col}>{beneficiariesColumnMapping[col].header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {beneficiariesData.map((item, index) => (
                            <tr key={item.id || index}>
                              {selectedColumns.map(col => (
                                <td key={col} data-label={beneficiariesColumnMapping[col].header}>
                                  {beneficiariesColumnMapping[col].accessor(item, index)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-primary fw-bold">
                          <tr>
                            {selectedColumns.map(col => {
                              if (col === 'sno') {
                                return <td key={col} className="text-end">{translations.total}</td>;
                              } else {
                                return <td key={col}></td>;
                              }
                            })}
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
        </Container>
      </div>
    </div>
  );
};

export default Registration;