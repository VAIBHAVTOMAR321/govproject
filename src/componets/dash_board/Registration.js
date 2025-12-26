import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Row, Col, Table } from "react-bootstrap";
import axios from "axios";
import "../../assets/css/registration.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";

// API URL
const REGISTRATION_API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/beneficiaries-registration/";

// Static options for form fields
const blockOptions = ["नैनीडांडा", "बीरोंखाल", "यमकेश्वर", "दुगड्डा", "पौड़ी", "द्वारीखाल", "जयहरीखाल", "रिखणीखाल", "नगर निगम कोटद्वार"];
const assemblyOptions = ["लैन्सडाउन", "यमकेश्वर", "चौबट्टाखाल", "कोटद्वार", "श्रीनगर"];
const categoryOptions = ["SC", "General/Unreserved", "ST"];
const schemeOptions = ["जिला योजना", "PKVY", "HMNEH", "Other"];
const unitOptions = ["kgs", "quintal", "gram", "number", "liter"];
const centerOptions = ["किंगोडीखाल", "किल्लीखाल", "कोटद्वार", "गंगाभोगपुर", "चैबेसिंग", "सिलोली", "चौबटल", "जयरिखाल", "जेगांव", "दिउली", "दुगड्डा", "देवराजखाल", "देलियाखाल", "धुमाकोट", "पौड़ी", "पैथाल", "बियाणी", "बीरोंखाल", "वेदीखाल", "सांगलकोटी", "सतपुली", "रिसाल्डी", "सैंधिखाल", "हल्दुखाल"];

// Hindi translations for form
const translations = {
  pageTitle: "लाभार्थी पंजीकरण",
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
  submitting: "जमा कर रहे हैं...",
  successMessage: "लाभार्थी सफलतापूर्वक पंजीकृत किया गया!",
  required: "यह फ़ील्ड आवश्यक है",
  selectOption: "चुनें",
  genericError: "प्रस्तुत करते समय एक त्रुटि हुई। कृपया बाद में पुन: प्रयास करें।"
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
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);

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

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  // Handle form field changes
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

  // Handle form submission
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
      // Prepare payload to match API requirements
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
  
  // Form validation
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

  return (
    <div className="dashboard-container">
      <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
      <div className="main-content">
        <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Container fluid className="dashboard-body" style={{ overflowX: 'hidden' }}>
          <h1 className="page-title small-fonts">{translations.pageTitle}</h1>
          
          {apiResponse && <Alert variant="success" className="small-fonts">{translations.successMessage}</Alert>}
          {apiError && <Alert variant="danger" className="small-fonts">{apiError}</Alert>}
<Row>
  
  <Col xs={12} sm={6} md={12} className="registration-form">
                <Form.Group className="mb-2" controlId="farmer_name">
                  <Form.Label className="small-fonts fw-bold">{translations.farmerName}</Form.Label>
                  <Form.Control type="file" name="farmer_name" value={formData.farmer_name} onChange={handleChange} isInvalid={!!errors.farmer_name} className="compact-input" placeholder="कृषक का नाम दर्ज करें" />
                  <Form.Control.Feedback type="invalid">{errors.farmer_name}</Form.Control.Feedback>
                </Form.Group>
              </Col>

</Row>
          {/* Registration Form Section */}
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
            <Table striped bordered hover className="registration-form">
      <thead className="table-regi">
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td colSpan={2}>Larry the Bird</td>
          <td>@twitter</td>
        </tr>
      </tbody>
    </Table>
        </Container>
      </div>
    </div>
  );
};

export default Registration;