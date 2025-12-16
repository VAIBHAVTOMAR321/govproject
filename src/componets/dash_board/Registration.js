import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container, Form, Button, Alert, Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import * as XLSX from 'xlsx'; 
import "../../assets/css/registration.css";
import "../../assets/css/dashboard.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";

// Hindi translations for form
const translations = {
  pageTitle: "बिलिंग आइटम जोड़ें",
  pageTitleSingle: "बिलिंग आइटम जोड़ें",
  pageTitleExcel: "एक्सेल से बिलिंग आइटम जोड़ें",
  centerName: "केंद्र का नाम",
  component: "घटक",
  investmentName: "निवेश का नाम",
  unit: "इकाई",
  allocatedQuantity: "आवंटित मात्रा",
  rate: "दर",
  sourceOfReceipt: "रसीद का स्रोत",
  schemeName: "योजना का नाम",
  submitButton: "आइटम जोड़ें",
  uploading: "अपलोड हो रहा है...",
  submitting: "जमा कर रहे हैं...",
  successMessage: "बिलिंग आइटम सफलतापूर्वक जोड़ा गया!",
  excelSuccessMessage: "एक्सेल डेटा सफलतापूर्वक अपलोड किया गया!",
  // Validation messages
  required: "यह फ़ील्ड आवश्यक है",
  invalidNumber: "कृपया एक वैध संख्या दर्ज करें",
  genericError: "प्रस्तुत करते समय एक त्रुटि हुई। कृपया बाद में पुन: प्रयास करें।",
  excelInstructions: "निर्देश: कृपया सुनिश्चित करें कि आपकी एक्सेल फ़ाइल में निम्नलिखित हेडर हैं: center_name, component, investment_name, unit, allocated_quantity, rate, source_of_receipt, scheme_name। ये हेडर अंग्रेजी में होने चाहिए।",
  selectOption: "चुनें"
};

const Registration = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Form state for single entry
  const [formData, setFormData] = useState({
    center_name: "",
    component: "",
    investment_name: "",
    unit: "",
    allocated_quantity: "",
    rate: "",
    source_of_receipt: "",
    scheme_name: ""
  });
  
  // State for dropdown options
  const [centerOptions, setCenterOptions] = useState([]);
  const [componentOptions, setComponentOptions] = useState([]);
  const [investmentOptions, setInvestmentOptions] = useState([]);
  const [schemeOptions, setSchemeOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  
  // State for Excel upload
  const [excelData, setExcelData] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
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
        
        // Fetch billing data for center names
        const billingResponse = await axios.get('https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/');
        const centers = [...new Set(billingResponse.data.map(item => item.center_name))];
        setCenterOptions(centers);
        
        // Fetch component data
        const componentResponse = await axios.get('https://mahadevaaya.com/govbillingsystem/backend/api/component-list/');
        const components = [...new Set(componentResponse.data.map(item => item.component))];
        const investments = [...new Set(componentResponse.data.map(item => item.investment_name))];
        const units = [...new Set(componentResponse.data.map(item => item.unit))];
        
        setComponentOptions(components);
        setInvestmentOptions(investments);
        setUnitOptions(units);
        
        // Fetch scheme data
        const schemeResponse = await axios.get('https://mahadevaaya.com/govbillingsystem/backend/api/scheme-list/');
        const schemes = schemeResponse.data.map(item => item.scheme_name);
        setSchemeOptions(schemes);
        
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
        setApiError("ड्रॉपडाउन विकल्प लाने में त्रुटि। कृपया पेज रीफ्रेश करें।");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
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
      const response = await axios.post('https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/', formData);
      setApiResponse(response.data);
      setFormData({
        center_name: "", 
        component: "", 
        investment_name: "", 
        unit: "", 
        allocated_quantity: "", 
        rate: "", 
        source_of_receipt: "",
        scheme_name: ""
      });
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
      axios.post('https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/', item)
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
    if (!formData.center_name.trim()) newErrors.center_name = `${translations.centerName} ${translations.required}`;
    if (!formData.component.trim()) newErrors.component = `${translations.component} ${translations.required}`;
    if (!formData.investment_name.trim()) newErrors.investment_name = `${translations.investmentName} ${translations.required}`;
    if (!formData.unit.trim()) newErrors.unit = `${translations.unit} ${translations.required}`;
    if (!formData.allocated_quantity.trim()) newErrors.allocated_quantity = `${translations.allocatedQuantity} ${translations.required}`;
    if (!formData.rate.trim()) newErrors.rate = `${translations.rate} ${translations.required}`;
    if (!formData.source_of_receipt.trim()) newErrors.source_of_receipt = `${translations.sourceOfReceipt} ${translations.required}`;
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
          <Card className="p-3">
            <h2 className="section-title small-fonts">{translations.pageTitleSingle}</h2>
            {loadingOptions ? (
              <div className="d-flex justify-content-center my-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <Form onSubmit={handleSubmit} className="registration-form">
                <Row>
                  <Col md={6}>
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
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="component">
                      <Form.Label className="small-fonts">{translations.component}</Form.Label>
                      <Form.Select 
                        name="component" 
                        value={formData.component} 
                        onChange={handleChange} 
                        isInvalid={!!errors.component}
                      >
                        <option value="">{translations.selectOption}</option>
                        {componentOptions.map((component, index) => (
                          <option key={index} value={component}>{component}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.component}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="investment_name">
                      <Form.Label className="small-fonts">{translations.investmentName}</Form.Label>
                      <Form.Select 
                        name="investment_name" 
                        value={formData.investment_name} 
                        onChange={handleChange} 
                        isInvalid={!!errors.investment_name}
                      >
                        <option value="">{translations.selectOption}</option>
                        {investmentOptions.map((investment, index) => (
                          <option key={index} value={investment}>{investment}</option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">{errors.investment_name}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
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
                </Row>
                <Row>
                  <Col md={6}>
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
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="allocated_quantity">
                      <Form.Label className="small-fonts">{translations.allocatedQuantity}</Form.Label>
                      <Form.Control type="text" name="allocated_quantity" value={formData.allocated_quantity} onChange={handleChange} isInvalid={!!errors.allocated_quantity} />
                      <Form.Control.Feedback type="invalid">{errors.allocated_quantity}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="rate">
                      <Form.Label className="small-fonts">{translations.rate}</Form.Label>
                      <Form.Control type="text" name="rate" value={formData.rate} onChange={handleChange} isInvalid={!!errors.rate} />
                      <Form.Control.Feedback type="invalid">{errors.rate}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="source_of_receipt">
                      <Form.Label className="small-fonts">{translations.sourceOfReceipt}</Form.Label>
                      <Form.Control as="textarea" rows={3} name="source_of_receipt" value={formData.source_of_receipt} onChange={handleChange} isInvalid={!!errors.source_of_receipt} />
                      <Form.Control.Feedback type="invalid">{errors.source_of_receipt}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit" disabled={isSubmitting} className="mt-3">
                  {isSubmitting ? translations.submitting : translations.submitButton}
                </Button>
              </Form>
            )}
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default Registration;