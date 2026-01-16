import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Table,
  OverlayTrigger,
  Tooltip,
  Spinner,
  Pagination,
  Modal,
} from "react-bootstrap";
import { FaFileExcel, FaFilePdf, FaTimes, FaSync } from "react-icons/fa";
import axios from "axios";
import * as XLSX from "xlsx";
import Select from "react-select";
import "../../assets/css/registration.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";

// API URLs
const BENEFICIARIES_API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/beneficiaries-registration/";
const VIKAS_KHAND_API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/get-vikas-khand-by-center/";
const FORM_FILTERS_API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/beneficiaries-registration/";

// Updated center options with exact names from your list
const centerOptions = [
  "कोटद्वार",
  "किनगोड़िखाल",
  "चौखाल",
  "धुमाकोट",
  "बीरोंखाल",
  "हल्दूखाल",
  "किल्वोंखाल",
  "चेलूसैंण",
  "जयहरीखाल",
  "जेठागांव",
  "देवियोंखाल",
  "सिलोगी",
  "सिसल्ड़ी",
  "पौखाल",
  "सतपुली",
  "संगलाकोटी",
  "देवराजखाल",
  "पोखड़ा",
  "वेदीखाल",
  "विथ्याणी",
  "गंगाभोगपुर",
  "दिउली",
  "दुगड्डा",
  "सेंधीखाल"
];

// Static options for form fields
const staticCategoryOptions = [
  "सामान्य",
  "अनुसूचित जाति",
  "अनुसूचित जनजाति",
  "अन्य पिछड़ा वर्ग",
];

const staticUnitOptions = ["नग", "किलोग्राम", "लीटर", "मीटर", "बैग"];

// Available columns for table (excluding sno which is always shown)
// Reordered according to the requested sequence
const beneficiariesTableColumns = [
  { key: "center_name", label: "केंद्र का नाम" },
  { key: "vidhan_sabha_name", label: "विधानसभा का नाम" },
  { key: "vikas_khand_name", label: "विकास खंड का नाम" },
  { key: "scheme_name", label: "योजना का नाम" },
  { key: "supplied_item_name", label: "आपूर्ति की गई वस्तु का नाम" },
  { key: "farmer_name", label: "किसान का नाम" },
  { key: "father_name", label: "पिता का नाम" },
  { key: "category", label: "श्रेणी" },
  { key: "address", label: "पता" },
  { key: "mobile_number", label: "मोबाइल नंबर" },
  { key: "aadhaar_number", label: "आधार नंबर" },
  { key: "bank_account_number", label: "बैंक खाता नंबर" },
  { key: "ifsc_code", label: "IFSC कोड" },
  { key: "unit", label: "इकाई" },
  { key: "quantity", label: "मात्रा" },
  { key: "rate", label: "दर" },
  { key: "amount", label: "राशि" },
];

// Column mapping for data access - Reordered to match the new sequence
const beneficiariesTableColumnMapping = {
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
  supplied_item_name: {
    header: "आपूर्ति की गई वस्तु का नाम",
    accessor: (item) => item.supplied_item_name,
  },
  farmer_name: { header: "किसान का नाम", accessor: (item) => item.farmer_name },
  father_name: { header: "पिता का नाम", accessor: (item) => item.father_name },
  category: { header: "श्रेणी", accessor: (item) => item.category },
  address: { header: "पता", accessor: (item) => item.address },
  mobile_number: {
    header: "मोबाइल नंबर",
    accessor: (item) => item.mobile_number,
  },
  aadhaar_number: {
    header: "आधार नंबर",
    accessor: (item) => item.aadhaar_number,
  },
  bank_account_number: {
    header: "बैंक खाता नंबर",
    accessor: (item) => item.bank_account_number,
  },
  ifsc_code: { header: "IFSC कोड", accessor: (item) => item.ifsc_code },
  unit: { header: "इकाई", accessor: (item) => item.unit },
  quantity: { header: "मात्रा", accessor: (item) => item.quantity },
  rate: { header: "दर", accessor: (item) => item.rate },
  amount: { header: "राशि", accessor: (item) => item.amount },
};

// Hindi translations for form
const translations = {
  pageTitle: "लाभार्थी पंजीकरण",
  farmerName: "किसान का नाम",
  fatherName: "पिता का नाम",
  address: "पता",
  centerName: "केंद्र का नाम",
  suppliedItemName: "आपूर्ति की गई वस्तु का नाम",
  unit: "इकाई",
  quantity: "मात्रा",
  rate: "दर",
  amount: "राशि",
  aadhaarNumber: "आधार नंबर",
  bankAccountNumber: "बैंक खाता नंबर",
  ifscCode: "IFSC कोड",
  mobileNumber: "मोबाइल नंबर",
  category: "श्रेणी",
  schemeName: "योजना का नाम",
  vikasKhandName: "विकास खंड का नाम",
  vidhanSabhaName: "विधानसभा का नाम",
  startDate: "प्रारंभ तिथि",
  endDate: "अंतिम तिथि",
  submitButton: "जमा करें",
  submitting: "जमा कर रहे हैं...",
  successMessage: "लाभार्थी सफलतापूर्वक जोड़ा गया!",
  bulkUpload: "बल्क अपलोड (Excel)",
  uploadFile: "फाइल चुनें",
  uploadButton: "अपलोड करें",
  required: "यह फ़ील्ड आवश्यक है",
  selectOption: "चुनें",
  genericError:
    "प्रस्तुत करते समय एक त्रुटि हुई। कृपया बाद में पुन: प्रयास करें।",
  showing: "दिखा रहे हैं",
  to: "से",
  of: "का",
  entries: "प्रविष्टियां",
  page: "पृष्ठ",
  itemsPerPage: "प्रति पृष्ठ आइटम",
  editBeneficiary: "लाभार्थी संपादित करें",
  saveChanges: "परिवर्तन सहेजें",
  cancel: "रद्द करें",
};

const KrishiRegistration = () => {
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

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Form state for single entry
  const [formData, setFormData] = useState({
    farmer_name: "",
    father_name: "",
    address: "",
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
    scheme_name: "",
    vikas_khand_name: "",
    vidhan_sabha_name: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [allBeneficiaries, setAllBeneficiaries] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedColumns, setSelectedColumns] = useState(
    beneficiariesTableColumns.map((col) => col.key)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [vikasKhandData, setVikasKhandData] = useState(null);
  const [isFetchingVikasKhand, setIsFetchingVikasKhand] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Dynamic form options - initialized with static values
  const [formOptions, setFormOptions] = useState({
    supplied_item_name: [],
    unit: staticUnitOptions,
    category: staticCategoryOptions,
    scheme_name: [],
  });

  // Track which fields are in "Other" mode (text input instead of dropdown)
  const [otherMode, setOtherMode] = useState({
    supplied_item_name: false,
    unit: false,
    category: false,
    scheme_name: false,
  });

  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // State for inline editing
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const [editingOtherMode, setEditingOtherMode] = useState({
    supplied_item_name: false,
    unit: false,
    category: false,
    scheme_name: false,
  });
  const [editingVikasKhandData, setEditingVikasKhandData] = useState(null);

  // State for filters
  const [filters, setFilters] = useState({
    farmer_name: [],
    center_name: [],
    supplied_item_name: [],
    category: [],
    scheme_name: [],
    vikas_khand_name: [],
    vidhan_sabha_name: [],
    start_date: "",
    end_date: "",
  });

  // State for filter options (unique values from API)
  const [filterOptions, setFilterOptions] = useState({
    farmer_name: [],
    center_name: [],
    supplied_item_name: [],
    category: [],
    scheme_name: [],
    vikas_khand_name: [],
    vidhan_sabha_name: [],
  });

  // Function to merge static options with dynamic options from API
  const mergeStaticAndDynamicOptions = (staticOptions, dynamicOptions, existingData) => {
    // Create a Set to store unique values
    const mergedOptions = new Set(staticOptions);
    
    // Add dynamic options from API
    if (dynamicOptions && Array.isArray(dynamicOptions)) {
      dynamicOptions.forEach(option => {
        if (option && typeof option === 'string') {
          mergedOptions.add(option);
        }
      });
    }
    
    // Add existing values from table data
    if (existingData && Array.isArray(existingData)) {
      existingData.forEach(item => {
        if (item && typeof item === 'string') {
          mergedOptions.add(item);
        }
      });
    }
    
    // Convert Set back to Array and sort
    return Array.from(mergedOptions).sort();
  };

  // Check device width

  // Fetch beneficiaries data
  const fetchBeneficiaries = async () => {
    try {
      setIsLoading(true);
      setApiError(null);
      const response = await axios.get(BENEFICIARIES_API_URL);
      const data =
        response.data && response.data.data
          ? response.data.data
          : response.data;
      const items = Array.isArray(data) ? data : [];
      setBeneficiaries(items);
      setAllBeneficiaries(items);
      
      // Update form options with existing data
      updateFormOptionsWithExistingData(items);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      setApiError("डेटा लोड करने में त्रुटि हुई।");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update form options with existing data from table
  const updateFormOptionsWithExistingData = (data) => {
    if (!data || !Array.isArray(data)) return;
    
    // Extract unique values from existing data
    const suppliedItems = [...new Set(data.map(item => item.supplied_item_name).filter(Boolean))];
    const units = [...new Set(data.map(item => item.unit).filter(Boolean))];
    const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
    const schemes = [...new Set(data.map(item => item.scheme_name).filter(Boolean))];
    
    // Update form options with merged static and dynamic values
    setFormOptions(prev => ({
      ...prev,
      supplied_item_name: mergeStaticAndDynamicOptions([], suppliedItems, []),
      unit: mergeStaticAndDynamicOptions(staticUnitOptions, units, []),
      category: mergeStaticAndDynamicOptions(staticCategoryOptions, categories, []),
      scheme_name: mergeStaticAndDynamicOptions([], schemes, []),
    }));
  };

  // Improved fetch vikas khand data function
  const fetchVikasKhandData = async (centerName, isEditMode = false) => {
    if (!centerName) {
      // Clear the relevant fields if no center is selected
      if (isEditMode) {
        setEditingVikasKhandData(null);
        setEditingValues(prev => ({
          ...prev,
          vikas_khand_name: "",
          vidhan_sabha_name: ""
        }));
      } else {
        setVikasKhandData(null);
        setFormData(prev => ({
          ...prev,
          vikas_khand_name: "",
          vidhan_sabha_name: ""
        }));
      }
      return;
    }

    try {
      if (isEditMode) {
        setIsFetchingVikasKhand(true);
      }
      
      // Log the exact center name being sent
      console.log("Fetching vikas khand for center:", centerName);
      
      const response = await axios.get(
        `${VIKAS_KHAND_API_URL}?center_name=${encodeURIComponent(centerName)}`
      );
      
      console.log("API response status:", response.status);
      console.log("API response data:", response.data);
      
      // Handle different response structures
      let vikasData = null;
      
      if (Array.isArray(response.data)) {
        if (response.data.length > 0) {
          vikasData = response.data[0];
        }
      } else if (response.data && typeof response.data === "object") {
        if (response.data.vikas_khand_name || response.data.vidhan_sabha_name) {
          vikasData = response.data;
        } else if (response.data.data && response.data.data.vikas_khand_name) {
          vikasData = response.data.data;
        }
      }
      
      if (vikasData) {
        if (isEditMode) {
          setEditingVikasKhandData(vikasData);
          setEditingValues(prev => ({
            ...prev,
            vikas_khand_name: vikasData.vikas_khand_name || "",
            vidhan_sabha_name: vikasData.vidhan_sabha_name || ""
          }));
        } else {
          setVikasKhandData(vikasData);
          setFormData(prev => ({
            ...prev,
            vikas_khand_name: vikasData.vikas_khand_name || "",
            vidhan_sabha_name: vikasData.vidhan_sabha_name || ""
          }));
        }
        console.log("Successfully fetched vikas khand data:", vikasData);
      } else {
        console.warn("No vikas khand data found for center:", centerName);
        // Clear fields when no data is found
        if (isEditMode) {
          setEditingVikasKhandData(null);
          setEditingValues(prev => ({
            ...prev,
            vikas_khand_name: "",
            vidhan_sabha_name: ""
          }));
        } else {
          setVikasKhandData(null);
          setFormData(prev => ({
            ...prev,
            vikas_khand_name: "",
            vidhan_sabha_name: ""
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching vikas khand data:", error);
      // Show user-friendly error message
      if (isEditMode) {
        setApiError(`Failed to fetch Vikas Khand data: ${error.message}`);
      } else {
        setApiError(`Failed to fetch Vikas Khand data: ${error.message}`);
      }
      
      // Clear fields on error
      if (isEditMode) {
        setEditingVikasKhandData(null);
        setEditingValues(prev => ({
          ...prev,
          vikas_khand_name: "",
          vidhan_sabha_name: ""
        }));
      } else {
        setVikasKhandData(null);
        setFormData(prev => ({
          ...prev,
          vikas_khand_name: "",
          vidhan_sabha_name: ""
        }));
      }
    } finally {
      if (isEditMode) {
        setIsFetchingVikasKhand(false);
      }
    }
  };

  // Function to manually refresh Vikas Khand data
  const refreshVikasKhandData = () => {
    if (formData.center_name) {
      fetchVikasKhandData(formData.center_name);
    }
  };

  // Function to manually refresh form options
  const refreshFormOptions = () => {
    if (formData.center_name) {
      fetchFormFilters("", "", formData.center_name);
    } else {
      fetchFormFilters();
    }
  };

  // Updated fetch form filters function to accept center_name parameter
  const fetchFormFilters = async (suppliedItemName = "", category = "", centerName = "") => {
    try {
      setIsLoadingFilters(true);
      let url = FORM_FILTERS_API_URL;
      const params = [];
      
      // Add center_name parameter if provided
      if (centerName) {
        params.push(`center_name=${encodeURIComponent(centerName)}`);
      }
      
      if (suppliedItemName)
        params.push(
          `supplied_item_name=${encodeURIComponent(suppliedItemName)}`
        );
      if (category) params.push(`category=${encodeURIComponent(category)}`);
      if (params.length > 0) url += "?" + params.join("&");

      console.log("Fetching filters from:", url);
      const response = await axios.get(url);
      const data = response.data;
      console.log("API response:", data);

      // Get existing data from beneficiaries
      const existingData = allBeneficiaries.filter(item => 
        !centerName || item.center_name === centerName
      );
      
      // Extract dynamic options from API response
      let dynamicSuppliedItems = [];
      let dynamicUnits = [];
      let dynamicCategories = [];
      let dynamicSchemes = [];
      
      // Handle different response structures
      if (data && typeof data === 'object') {
        if (data.success && data.data) {
          // If response has success and data properties
          if (Array.isArray(data.data)) {
            // If data.data is an array, extract values from each item
            data.data.forEach(item => {
              if (item.supplied_item_name) dynamicSuppliedItems.push(item.supplied_item_name);
              if (item.unit) dynamicUnits.push(item.unit);
              if (item.category) dynamicCategories.push(item.category);
              if (item.scheme_name) dynamicSchemes.push(item.scheme_name);
            });
          } else {
            // If data.data is an object, extract values directly
            dynamicSuppliedItems = data.data.supplied_item_name || [];
            dynamicUnits = data.data.unit || [];
            dynamicCategories = data.data.category || [];
            dynamicSchemes = data.data.scheme_name || [];
          }
        } else if (Array.isArray(data)) {
          // If response is an array, extract values directly
          data.forEach(item => {
            if (item.supplied_item_name || item.name) dynamicSuppliedItems.push(item.supplied_item_name || item.name);
            if (item.unit) dynamicUnits.push(item.unit);
            if (item.category) dynamicCategories.push(item.category);
            if (item.scheme_name || item.name) dynamicSchemes.push(item.scheme_name || item.name);
          });
        } else {
          // If response is an object, extract values from properties
          dynamicSuppliedItems = data.supplied_item_name || [];
          dynamicUnits = data.unit || [];
          dynamicCategories = data.category || [];
          dynamicSchemes = data.scheme_name || [];
        }
      }
      
      console.log("Dynamic options extracted:", {
        suppliedItems: dynamicSuppliedItems,
        units: dynamicUnits,
        categories: dynamicCategories,
        schemes: dynamicSchemes
      });
      
      // Update form options with merged static and dynamic values
      setFormOptions((prev) => ({
        ...prev,
        supplied_item_name: mergeStaticAndDynamicOptions(
          [], 
          dynamicSuppliedItems, 
          existingData.map(item => item.supplied_item_name).filter(Boolean)
        ),
        unit: mergeStaticAndDynamicOptions(
          staticUnitOptions, 
          dynamicUnits, 
          existingData.map(item => item.unit).filter(Boolean)
        ),
        category: mergeStaticAndDynamicOptions(
          staticCategoryOptions, 
          dynamicCategories, 
          existingData.map(item => item.category).filter(Boolean)
        ),
        scheme_name: mergeStaticAndDynamicOptions(
          [], 
          dynamicSchemes, 
          existingData.map(item => item.scheme_name).filter(Boolean)
        ),
      }));
    } catch (error) {
      console.error("Error fetching form filters:", error);
      setApiError(`Failed to fetch form options: ${error.message}`);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  // Add a new function to fetch supplied items for a center
  const fetchSuppliedItemsForCenter = async (centerName) => {
    if (!centerName) return;
    
    try {
      setIsLoadingFilters(true);
      console.log("Fetching supplied items for center:", centerName);
      
      // Try different API endpoints
      let response;
      try {
        // First try with the existing endpoint
        response = await axios.get(
          `${FORM_FILTERS_API_URL}?center_name=${encodeURIComponent(centerName)}`
        );
      } catch (error) {
        console.log("Failed with existing endpoint, trying alternative...");
        // Try an alternative endpoint
        response = await axios.get(
          `${FORM_FILTERS_API_URL}supplied-items/?center_name=${encodeURIComponent(centerName)}`
        );
      }
      
      console.log("Supplied items response:", response.data);
      
      // Get existing data from beneficiaries for this center
      const existingData = allBeneficiaries.filter(item => item.center_name === centerName);
      
      // Extract the supplied items from the response
      let suppliedItems = [];
      if (response.data && response.data.success && response.data.data) {
        if (Array.isArray(response.data.data)) {
          response.data.data.forEach(item => {
            if (item.supplied_item_name || item.name) suppliedItems.push(item.supplied_item_name || item.name);
          });
        } else {
          suppliedItems = response.data.data.supplied_item_name || [];
        }
      } else if (response.data && Array.isArray(response.data)) {
        response.data.forEach(item => {
          if (item.name || item.supplied_item_name) suppliedItems.push(item.name || item.supplied_item_name);
        });
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        response.data.data.forEach(item => {
          if (item.name || item.supplied_item_name) suppliedItems.push(item.name || item.supplied_item_name);
        });
      }
      
      // Update form options with merged static and dynamic values
      setFormOptions(prev => ({
        ...prev,
        supplied_item_name: mergeStaticAndDynamicOptions(
          [], 
          suppliedItems, 
          existingData.map(item => item.supplied_item_name).filter(Boolean)
        )
      }));
      
      console.log("Updated supplied items:", formOptions.supplied_item_name);
    } catch (error) {
      console.error("Error fetching supplied items for center:", error);
      setApiError(`Failed to fetch supplied items: ${error.message}`);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchBeneficiaries();
    fetchFormFilters();
  }, []);

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [beneficiaries]);

  // Fetch filters when center changes
  useEffect(() => {
    if (formData.center_name) {
      fetchFormFilters("", "", formData.center_name);
    }
  }, [formData.center_name]);

  // Populate filter options from all beneficiaries
  useEffect(() => {
    if (allBeneficiaries.length > 0) {
      setFilterOptions({
        farmer_name: [
          ...new Set(
            allBeneficiaries.map((item) => item.farmer_name).filter(Boolean)
          ),
        ],
        center_name: [
          ...new Set(
            allBeneficiaries.map((item) => item.center_name).filter(Boolean)
          ),
        ],
        supplied_item_name: [
          ...new Set(
            allBeneficiaries
              .map((item) => item.supplied_item_name)
              .filter(Boolean)
          ),
        ],
        category: [
          ...new Set(
            allBeneficiaries.map((item) => item.category).filter(Boolean)
          ),
        ],
        scheme_name: [
          ...new Set(
            allBeneficiaries.map((item) => item.scheme_name).filter(Boolean)
          ),
        ],
        vikas_khand_name: [
          ...new Set(
            allBeneficiaries
              .map((item) => item.vikas_khand_name)
              .filter(Boolean)
          ),
        ],
        vidhan_sabha_name: [
          ...new Set(
            allBeneficiaries
              .map((item) => item.vidhan_sabha_name)
              .filter(Boolean)
          ),
        ],
      });
    }
  }, [allBeneficiaries]);

  // Apply local filtering when filters change
  useEffect(() => {
    const hasFilters = Object.keys(filters).some((key) =>
      Array.isArray(filters[key])
        ? filters[key].length > 0
        : filters[key].trim()
    );
    if (hasFilters) {
      const filtered = allBeneficiaries.filter((item) => {
        // Check all other filters
        for (const key in filters) {
          if (key === "start_date" || key === "end_date") continue; // Skip date filters for now
          if (filters[key].length > 0 && !filters[key].includes(item[key])) {
            return false;
          }
        }

        // Check date range filters
        if (filters.start_date || filters.end_date) {
          if (!item.created_at) return false; // Skip if no date field

          const itemDate = new Date(item.created_at);
          const startDate = filters.start_date
            ? new Date(filters.start_date)
            : null;
          const endDate = filters.end_date ? new Date(filters.end_date) : null;

          // Set end date to end of day for inclusive comparison
          if (endDate) {
            endDate.setHours(23, 59, 59, 999);
          }

          if (startDate && itemDate < startDate) return false;
          if (endDate && itemDate > endDate) return false;
        }

        return true;
      });
      setBeneficiaries(filtered);
    } else {
      setBeneficiaries(allBeneficiaries);
    }
  }, [filters, allBeneficiaries]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      farmer_name: [],
      center_name: [],
      supplied_item_name: [],
      category: [],
      scheme_name: [],
      vikas_khand_name: [],
      vidhan_sabha_name: [],
      start_date: "",
      end_date: "",
    });
  };

  // Download Excel function
  const downloadExcel = (data, filename, columnMapping, selectedColumns) => {
    try {
      // Prepare data for Excel export based on selected columns
      const excelData = data.map((item, index) => {
        const row = {};
        selectedColumns.forEach((col) => {
          row[columnMapping[col].header] = columnMapping[col].accessor(
            item,
            index
          );
        });
        return row;
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths based on the new column order
      const colWidths = [
        { wch: 20 }, // केंद्र का नाम
        { wch: 20 }, // विधानसभा का नाम
        { wch: 20 }, // विकास खंड का नाम
        { wch: 20 }, // योजना का नाम
        { wch: 30 }, // आपूर्ति की गई वस्तु का नाम
        { wch: 20 }, // किसान का नाम
        { wch: 20 }, // पिता का नाम
        { wch: 15 }, // श्रेणी
        { wch: 40 }, // पता
        { wch: 15 }, // मोबाइल नंबर
        { wch: 15 }, // आधार नंबर
        { wch: 20 }, // बैंक खाता नंबर
        { wch: 15 }, // IFSC कोड
        { wch: 10 }, // इकाई
        { wch: 10 }, // मात्रा
        { wch: 10 }, // दर
        { wch: 10 }, // राशि
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
      console.error("Error generating Excel file:", e);
      setApiError("Excel file generation failed. Please try again.");
    }
  };

  // Download sample Excel template - Updated to match the new column order
  const downloadSampleTemplate = () => {
    try {
      const sampleData = [
        {
          "केंद्र का नाम": "कोटद्वार",
          "विधानसभा का नाम": "कोटद्वार",
          "विकास खंड का नाम": "कोटद्वार",
          "योजना का नाम": "MGNREGA",
          "आपूर्ति की गई वस्तु का नाम": "बीज",
          "किसान का नाम": "रामेश कुमार",
          "पिता का नाम": "सुरेश कुमार",
          "श्रेणी": "सामान्य",
          "पता": "ग्राम रामपुर, पोस्ट रामपुर, जिला सीतापुर, उत्तर प्रदेश",
          "मोबाइल नंबर": "9876543210",
          "आधार नंबर": "123456789012",
          "बैंक खाता नंबर": "12345678901234",
          "IFSC कोड": "SBIN0001234",
          "इकाई": "नग",
          "मात्रा": 50,
          "दर": 25,
          "राशि": 1250,
        },
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(sampleData);

      // Set column widths based on the new column order
      const colWidths = [
        { wch: 20 }, // केंद्र का नाम
        { wch: 20 }, // विधानसभा का नाम
        { wch: 20 }, // विकास खंड का नाम
        { wch: 20 }, // योजना का नाम
        { wch: 30 }, // आपूर्ति की गई वस्तु का नाम
        { wch: 20 }, // किसान का नाम
        { wch: 20 }, // पिता का नाम
        { wch: 15 }, // श्रेणी
        { wch: 40 }, // पता
        { wch: 15 }, // मोबाइल नंबर
        { wch: 15 }, // आधार नंबर
        { wch: 20 }, // बैंक खाता नंबर
        { wch: 15 }, // IFSC कोड
        { wch: 10 }, // इकाई
        { wch: 10 }, // मात्रा
        { wch: 10 }, // दर
        { wch: 10 }, // राशि
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "SampleTemplate");
      XLSX.writeFile(wb, `Beneficiaries_Registration_Template.xlsx`);
    } catch (e) {
      console.error("Error generating sample template:", e);
      setApiError("Sample template generation failed. Please try again.");
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
      // Create headers and rows based on selected columns
      const headers = selectedColumns
        .map((col) => `<th>${columnMapping[col].header}</th>`)
        .join("");
      const rows = data
        .map((item, index) => {
          const cells = selectedColumns
            .map(
              (col) => `<td>${columnMapping[col].accessor(item, index)}</td>`
            )
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");

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
              </tbody>
            </table>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(tableHtml);
      printWindow.document.close();

      // Wait for content to load before printing
      printWindow.onload = function () {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
      };
    } catch (e) {
      console.error("Error generating PDF:", e);
      setApiError("PDF generation failed. Please try again.");
    }
  };

  // Refresh function
  const handleRefresh = () => {
    fetchBeneficiaries();
    setApiResponse(null);
    setApiError(null);
    clearFilters();
    setOtherMode({
      supplied_item_name: false,
      unit: false,
      category: false,
      scheme_name: false,
    });
    setEditingRowId(null);
    setEditingValues({});
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle inline edit
  const handleEdit = (item) => {
    setEditingRowId(item.beneficiary_id);
    setEditingValues({
      farmer_name: item.farmer_name || "",
      father_name: item.father_name || "",
      address: item.address || "",
      center_name: item.center_name || "",
      supplied_item_name: item.supplied_item_name || "",
      unit: item.unit || "",
      quantity: item.quantity || "",
      rate: item.rate || "",
      amount: item.amount || "",
      aadhaar_number: item.aadhaar_number || "",
      bank_account_number: item.bank_account_number || "",
      ifsc_code: item.ifsc_code || "",
      mobile_number: item.mobile_number || "",
      category: item.category || "",
      scheme_name: item.scheme_name || "",
      vikas_khand_name: item.vikas_khand_name || "",
      vidhan_sabha_name: item.vidhan_sabha_name || "",
    });

    // Fetch vikas khand data for this center if available
    if (item.center_name) {
      fetchVikasKhandData(item.center_name, true);
    }

    setApiError(null);
    setApiResponse(null);
  };

  // Handle edit form field changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    let updatedValues = {
      ...editingValues,
      [name]: value,
    };

    // Handle "Other" selection - switch to text input mode
    if (value === "Other") {
      setEditingOtherMode((prev) => ({
        ...prev,
        [name]: true,
      }));
      updatedValues[name] = ""; // Clear the value
    } else {
      // If not "Other", ensure we're in dropdown mode (unless already in other mode)
      if (!editingOtherMode[name]) {
        setEditingOtherMode((prev) => ({
          ...prev,
          [name]: false,
        }));

        // Handle cascading dropdowns only when not in other mode
        if (name === "supplied_item_name" && value) {
          // Reset dependent fields
          updatedValues.unit = "";
          updatedValues.category = "";
          updatedValues.scheme_name = "";
          setEditingOtherMode((prev) => ({
            ...prev,
            unit: false,
            category: false,
            scheme_name: false,
          }));
          // Fetch unit options with center_name
          fetchFormFilters(value, "", editingValues.center_name);
        } else if (
          name === "category" &&
          value &&
          editingValues.supplied_item_name
        ) {
          // Reset dependent fields
          updatedValues.scheme_name = "";
          setEditingOtherMode((prev) => ({
            ...prev,
            scheme_name: false,
          }));
          // Fetch scheme options with center_name
          fetchFormFilters(editingValues.supplied_item_name, value, editingValues.center_name);
        }

        // If center changes, fetch vikas khand data and reset related fields
        if (name === "center_name") {
          if (value) {
            fetchVikasKhandData(value, true);
            // Fetch supplied item options for this center
            fetchSuppliedItemsForCenter(value);
          } else {
            setEditingVikasKhandData(null);
            updatedValues.vikas_khand_name = "";
            updatedValues.vidhan_sabha_name = "";
            // Reset form options to defaults
            fetchFormFilters();
          }
        }
      }
      // If in other mode, just update the value without triggering cascading
    }

    // Auto-calculate amount when quantity and rate change
    if (name === "quantity" || name === "rate") {
      const quantity = parseFloat(value) || 0;
      const rate =
        parseFloat(name === "quantity" ? editingValues.rate : value) || 0;
      updatedValues.amount = (quantity * rate).toString();
    }

    setEditingValues(updatedValues);
  };

// Handle save edit - UPDATED VERSION
const handleSave = async (item) => {
  try {
    // Prepare payload with the required fields
    const payload = {
      beneficiary_id: item.beneficiary_id,
      farmer_name: editingValues.farmer_name,
      father_name: editingValues.father_name,
      address: editingValues.address,
      center_name: editingValues.center_name,
      supplied_item_name: editingValues.supplied_item_name,
      unit: editingValues.unit,
      quantity: parseInt(editingValues.quantity) || 0,
      rate: parseFloat(editingValues.rate) || 0,
      amount: parseFloat(editingValues.amount) || 0,
      aadhaar_number: editingValues.aadhaar_number,
      bank_account_number: editingValues.bank_account_number,
      ifsc_code: editingValues.ifsc_code,
      mobile_number: editingValues.mobile_number,
      category: editingValues.category,
      scheme_name: editingValues.scheme_name,
      vikas_khand_name: editingValues.vikas_khand_name,
      vidhan_sabha_name: editingValues.vidhan_sabha_name,
    };
    
    // Make the PUT request to update the beneficiary
    const response = await axios.put(BENEFICIARIES_API_URL, payload);
    
    // Check if the response is successful (status 200-299)
    if (response.status >= 200 && response.status < 300) {
      // Update the item in the local state
      setAllBeneficiaries((prev) =>
        prev.map((i) =>
          i.beneficiary_id === item.beneficiary_id ? { ...i, ...payload } : i
        )
      );
      setEditingRowId(null);
      setEditingValues({});
      setApiResponse({ message: "लाभार्थी सफलतापूर्वक अपडेट किया गया!" });
    } else {
      // Handle unexpected response status
      setApiError(`अप्रत्याशित प्रतिक्रिया स्थिति: ${response.status}`);
    }
  } catch (error) {
    console.error("Error updating item:", error);
    // Check if it's a network error or server error
    if (error.response) {
      setApiError(`सर्वर त्रुटि: ${error.response.status} - ${error.response.data?.message || "अज्ञात त्रुटि"}`);
    } else if (error.request) {
      setApiError("नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।");
    } else {
      setApiError("लाभार्थी अपडेट करने में त्रुटि हुई।");
    }
  }
};

  // Handle cancel edit
  const handleCancel = () => {
    setEditingRowId(null);
    setEditingValues({});
    setEditingOtherMode({
      supplied_item_name: false,
      unit: false,
      category: false,
      scheme_name: false,
    });
  };

// Handle delete
const handleDelete = async (item) => {
  if (window.confirm("क्या आप इस लाभार्थी को हटाना चाहते हैं?")) {
    try {
      // Prepare payload with beneficiary_id
      const payload = {
        beneficiary_id: item.beneficiary_id
      };
      
      // Send DELETE request with payload in the body
      const response = await axios.delete(BENEFICIARIES_API_URL, { data: payload });
      
      // Check if the response is successful (status 200-299)
      if (response.status >= 200 && response.status < 300) {
        // Remove the item from the local state
        setAllBeneficiaries((prev) =>
          prev.filter((i) => i.beneficiary_id !== item.beneficiary_id)
        );
        setApiResponse({ message: "लाभार्थी सफलतापूर्वक हटा दिया गया!" });
      } else {
        // Handle unexpected response status
        setApiError(`अप्रत्याशित प्रतिक्रिया स्थिति: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      // Check if it's a network error or server error
      if (error.response) {
        setApiError(`सर्वर त्रुटि: ${error.response.status} - ${error.response.data?.message || "अज्ञात त्रुटि"}`);
      } else if (error.request) {
        setApiError("नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।");
      } else {
        setApiError("लाभार्थी हटाने में त्रुटि हुई।");
      }
    }
  }
};

  // Generate pagination items similar to MainDashboard.js
  const totalPages = Math.ceil(beneficiaries.length / itemsPerPage);
  const paginationItems = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    paginationItems.push(
      <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
        1
      </Pagination.Item>
    );
    if (startPage > 2) {
      paginationItems.push(
        <Pagination.Ellipsis key="start-ellipsis" disabled />
      );
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
    paginationItems.push(
      <Pagination.Item
        key={totalPages}
        onClick={() => handlePageChange(totalPages)}
      >
        {totalPages}
      </Pagination.Item>
    );
  }

  // Handle file change
  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  // Handle bulk upload - Updated to match the new column order
  const handleBulkUpload = async () => {
    if (!excelFile) return;

    setIsUploading(true);
    setApiError(null);
    setApiResponse(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length <= 1) {
            setApiError("Excel file contains no data");
            setIsUploading(false);
            return;
          }

          // Skip header row and parse data
          const dataRows = jsonData.slice(1);
          const headers = jsonData[0];

          // Create a mapping from header names to column indices
          const headerMapping = {};
          headers.forEach((header, index) => {
            if (header) {
              headerMapping[header.trim().toLowerCase()] = index;
            }
          });

          // Parse data using header mapping - Updated to match the new column order
          const payloads = dataRows.map((row) => ({
            center_name:
              row[headerMapping["केंद्र का नाम"]] ||
              row[headerMapping["center_name"]] ||
              "",
            vidhan_sabha_name:
              row[headerMapping["विधानसभा का नाम"]] ||
              row[headerMapping["vidhan_sabha_name"]] ||
              "",
            vikas_khand_name:
              row[headerMapping["विकास खंड का नाम"]] ||
              row[headerMapping["vikas_khand_name"]] ||
              "",
            scheme_name:
              row[headerMapping["योजना का नाम"]] ||
              row[headerMapping["scheme_name"]] ||
              "",
            supplied_item_name:
              row[headerMapping["आपूर्ति की गई वस्तु का नाम"]] ||
              row[headerMapping["supplied_item_name"]] ||
              "",
            farmer_name:
              row[headerMapping["किसान का नाम"]] ||
              row[headerMapping["farmer_name"]] ||
              "",
            father_name:
              row[headerMapping["पिता का नाम"]] ||
              row[headerMapping["father_name"]] ||
              "",
            category:
              row[headerMapping["श्रेणी"]] ||
              row[headerMapping["category"]] ||
              "",
            address:
              row[headerMapping["पता"]] || row[headerMapping["address"]] || "",
            mobile_number:
              row[headerMapping["मोबाइल नंबर"]] ||
              row[headerMapping["mobile_number"]] ||
              "",
            aadhaar_number:
              row[headerMapping["आधार नंबर"]] ||
              row[headerMapping["aadhaar_number"]] ||
              "",
            bank_account_number:
              row[headerMapping["बैंक खाता नंबर"]] ||
              row[headerMapping["bank_account_number"]] ||
              "",
            ifsc_code:
              row[headerMapping["ifsc कोड"]] ||
              row[headerMapping["ifsc_code"]] ||
              "",
            unit:
              row[headerMapping["इकाई"]] || row[headerMapping["unit"]] || "",
            quantity: parseInt(
              row[headerMapping["मात्रा"]] ||
                row[headerMapping["quantity"]] ||
                0
            ),
            rate: parseFloat(
              row[headerMapping["दर"]] || row[headerMapping["rate"]] || 0
            ),
            amount: parseFloat(
              row[headerMapping["राशि"]] || row[headerMapping["amount"]] || 0
            ),
          }));

          let successfulUploads = 0;
          const failedItems = [];

          for (let i = 0; i < payloads.length; i++) {
            try {
              const payload = payloads[i];
              const response = await axios.post(BENEFICIARIES_API_URL, payload);

              if (response.status === 200 || response.status === 201) {
                setAllBeneficiaries((prev) => [payload, ...prev]);
                successfulUploads++;
              } else {
                failedItems.push({
                  index: i + 1,
                  reason: `Server error: ${response.status}`,
                });
              }
            } catch (error) {
              failedItems.push({
                index: i + 1,
                reason: error.response?.data?.message || "Upload failed",
              });
            }
          }

          // Reset file input
          setExcelFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          if (failedItems.length > 0) {
            setApiError(
              `${successfulUploads} items uploaded successfully, ${failedItems.length} items failed.`
            );
          } else {
            setApiResponse({
              message: `${successfulUploads} items uploaded successfully`,
            });
          }
        } catch (parseError) {
          console.error("Error parsing Excel file:", parseError);
          setApiError("Error parsing Excel file: " + parseError.message);
        }
      };
      reader.readAsArrayBuffer(excelFile);
    } catch (error) {
      console.error("Error reading file:", error);
      setApiError("Error reading file: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = {
      ...formData,
      [name]: value,
    };

    // Handle "Other" selection - switch to text input mode
    if (value === "Other") {
      setOtherMode((prev) => ({
        ...prev,
        [name]: true,
      }));
      updatedFormData[name] = ""; // Clear the value
    } else {
      // If not "Other", ensure we're in dropdown mode (unless already in other mode)
      if (!otherMode[name]) {
        setOtherMode((prev) => ({
          ...prev,
          [name]: false,
        }));

        // Handle cascading dropdowns only when not in other mode
        if (name === "supplied_item_name" && value) {
          // Reset dependent fields
          updatedFormData.unit = "";
          updatedFormData.category = "";
          updatedFormData.scheme_name = "";
          setOtherMode((prev) => ({
            ...prev,
            unit: false,
            category: false,
            scheme_name: false,
          }));
          // Fetch unit options with center_name
          fetchFormFilters(value, "", formData.center_name);
        } else if (
          name === "category" &&
          value &&
          formData.supplied_item_name
        ) {
          // Reset dependent fields
          updatedFormData.scheme_name = "";
          setOtherMode((prev) => ({
            ...prev,
            scheme_name: false,
          }));
          // Fetch scheme options with center_name
          fetchFormFilters(formData.supplied_item_name, value, formData.center_name);
        }

        // If center changes, fetch vikas khand data and reset related fields
        if (name === "center_name") {
          if (value) {
            fetchVikasKhandData(value);
            // Fetch supplied item options for this center
            fetchSuppliedItemsForCenter(value);
          } else {
            setVikasKhandData(null);
            updatedFormData.vikas_khand_name = "";
            updatedFormData.vidhan_sabha_name = "";
            // Reset form options to defaults
            fetchFormFilters();
          }
        }
      }
      // If in other mode, just update the value without triggering cascading
    }

    // Auto-calculate amount when quantity and rate change
    if (name === "quantity" || name === "rate") {
      const quantity = parseFloat(value) || 0;
      const rate = parseFloat(name === "quantity" ? formData.rate : value) || 0;
      updatedFormData.amount = (quantity * rate).toString();
    }

    setFormData(updatedFormData);

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
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
        center_name: formData.center_name,
        supplied_item_name: formData.supplied_item_name,
        unit: formData.unit,
        quantity: parseInt(formData.quantity),
        rate: parseFloat(formData.rate),
        amount: parseFloat(formData.amount),
        aadhaar_number: formData.aadhaar_number,
        bank_account_number: formData.bank_account_number,
        ifsc_code: formData.ifsc_code,
        mobile_number: formData.mobile_number,
        category: formData.category,
        scheme_name: formData.scheme_name,
        vikas_khand_name: formData.vikas_khand_name,
        vidhan_sabha_name: formData.vidhan_sabha_name,
      };

      const response = await axios.post(BENEFICIARIES_API_URL, payload);

      // Handle both possible response structures
      const responseData =
        response.data && response.data.data
          ? response.data.data
          : response.data;
      setApiResponse(responseData);

      // Reset form after successful submission
      setFormData({
        farmer_name: "",
        father_name: "",
        address: "",
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
        scheme_name: "",
        vikas_khand_name: "",
        vidhan_sabha_name: "",
      });

      // Clear vikas khand data and other mode
      setVikasKhandData(null);
      setOtherMode({
        supplied_item_name: false,
        unit: false,
        category: false,
        scheme_name: false,
      });

      // Add to table
      setAllBeneficiaries((prev) => [payload, ...prev]);
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
    // For single form entry, require essential fields
    if (!formData.center_name.trim())
      newErrors.center_name = `${translations.centerName} ${translations.required}`;
    if (!formData.supplied_item_name.trim())
      newErrors.supplied_item_name = `${translations.suppliedItemName} ${translations.required}`;
    if (!formData.unit.trim())
      newErrors.unit = `${translations.unit} ${translations.required}`;
    if (!formData.quantity.trim())
      newErrors.quantity = `${translations.quantity} ${translations.required}`;
    if (!formData.rate.trim())
      newErrors.rate = `${translations.rate} ${translations.required}`;
    if (!formData.amount.trim())
      newErrors.amount = `${translations.amount} ${translations.required}`;
    if (!formData.category.trim())
      newErrors.category = `${translations.category} ${translations.required}`;
    if (!formData.scheme_name.trim())
      newErrors.scheme_name = `${translations.schemeName} ${translations.required}`;
    // Optional fields for single entry (but still validate if provided)
    if (formData.farmer_name && !formData.farmer_name.trim())
      newErrors.farmer_name = `${translations.farmerName} ${translations.required}`;
    if (formData.father_name && !formData.father_name.trim())
      newErrors.father_name = `${translations.fatherName} ${translations.required}`;
    if (formData.address && !formData.address.trim())
      newErrors.address = `${translations.address} ${translations.required}`;
    if (formData.aadhaar_number && !formData.aadhaar_number.trim())
      newErrors.aadhaar_number = `${translations.aadhaarNumber} ${translations.required}`;
    if (formData.bank_account_number && !formData.bank_account_number.trim())
      newErrors.bank_account_number = `${translations.bankAccountNumber} ${translations.required}`;
    if (formData.ifsc_code && !formData.ifsc_code.trim())
      newErrors.ifsc_code = `${translations.ifscCode} ${translations.required}`;
    if (formData.mobile_number && !formData.mobile_number.trim())
      newErrors.mobile_number = `${translations.mobileNumber} ${translations.required}`;
    if (!formData.vikas_khand_name.trim())
      newErrors.vikas_khand_name = `${translations.vikasKhandName} ${translations.required}`;
    if (!formData.vidhan_sabha_name.trim())
      newErrors.vidhan_sabha_name = `${translations.vidhanSabhaName} ${translations.required}`;
    return newErrors;
  };

  return (
    <div>
      <Container fluid className="p-4">
        <Row>
          <Col lg={12} md={12} sm={12}>
            <DashBoardHeader />
          </Col>
        </Row>

        <Row className="left-top">
          {/* <Col lg={2} md={2} sm={12}>
            <LeftNav />
          </Col> */}

          <Col lg={12} md={12} sm={12}>
            <Container fluid className="dashboard-body-main">
              <h1 className="page-title small-fonts">{translations.pageTitle}</h1>

              {/* Bulk Upload Section */}
              <Row className="mb-3">
                <Col xs={12} md={6} lg={12}>
                  <Form.Group controlId="excelFile">
                    <Form.Label className="small-fonts fw-bold">
                      {translations.bulkUpload}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="compact-input"
                      ref={fileInputRef}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={3} className="d-flex align-items-end">
                  <Button
                    variant="secondary"
                    onClick={handleBulkUpload}
                    disabled={!excelFile || isUploading}
                    className="compact-submit-btn w-100"
                  >
                    {isUploading
                      ? "अपलोड हो रहा है..."
                      : translations.uploadButton}
                  </Button>
                </Col>
                <Col xs={12} md={3} className="d-flex align-items-end">
                  <Button
                    variant="info"
                    onClick={downloadSampleTemplate}
                    disabled={isUploading}
                    className="compact-submit-btn w-100"
                  >
                    डाउनलोड टेम्पलेट
                  </Button>
                </Col>
              </Row>

              {apiResponse && (
                <Alert variant="success" className="small-fonts">
                  {translations.successMessage}
                </Alert>
              )}
              {apiError && (
                <Alert variant="danger" className="small-fonts">
                  {apiError}
                </Alert>
              )}

              {/* Excel Upload Instructions */}
              <Alert variant="info" className="small-fonts mb-3">
                <strong>Excel अपलोड निर्देश:</strong>
                <ul className="mb-0">
                  <li>कृपया सही फॉर्मेट में Excel फाइल अपलोड करें</li>
                  <li>
                    अनिवार्य फ़ील्ड: केंद्र का नाम, विधानसभा का नाम, विकास खंड का नाम, योजना का नाम, 
                    आपूर्ति की गई वस्तु का नाम, किसान का नाम, पिता का नाम, श्रेणी, पता, मोबाइल नंबर, 
                    आधार नंबर, बैंक खाता नंबर, IFSC कोड, इकाई, मात्रा, दर, राशि
                  </li>
                  <li>मात्रा, दर और राशि संख्यात्मक होनी चाहिए</li>
                  <li>डाउनलोड टेम्पलेट बटन का उपयोग करें सही फॉर्मेट के लिए</li>
                </ul>
              </Alert>

              {/* Center Selection - Always visible */}
              <Form.Group className="mb-3" controlId="center_selection">
                <Form.Label className="small-fonts fw-bold">
                  {translations.centerName}
                </Form.Label>
                <Form.Select
                  name="center_name"
                  value={formData.center_name}
                  onChange={handleChange}
                  isInvalid={!!errors.center_name}
                  className="compact-input"
                >
                  <option value="">{translations.selectOption}</option>
                  {centerOptions.map((center, index) => (
                    <option key={index} value={center}>
                      {center}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.center_name}
                </Form.Control.Feedback>
              </Form.Group>

           

              {/* Beneficiaries Form Section - Only show when center is selected */}
              {formData.center_name && (
                <Form
                  onSubmit={handleSubmit}
                  className="registration-form compact-form"
                >
                  <Row>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="farmer_name">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.farmerName}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="farmer_name"
                          value={formData.farmer_name}
                          onChange={handleChange}
                          isInvalid={!!errors.farmer_name}
                          className="compact-input"
                          placeholder="किसान का नाम दर्ज करें"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.farmer_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="father_name">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.fatherName}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="father_name"
                          value={formData.father_name}
                          onChange={handleChange}
                          isInvalid={!!errors.father_name}
                          className="compact-input"
                          placeholder="पिता का नाम दर्ज करें"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.father_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="address">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.address}
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          isInvalid={!!errors.address}
                          className="compact-input"
                          placeholder="पता दर्ज करें"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.address}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="supplied_item_name">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.suppliedItemName}
                        </Form.Label>
                        {otherMode.supplied_item_name ? (
                          <div className="d-flex">
                            <Form.Control
                              type="text"
                              name="supplied_item_name"
                              value={formData.supplied_item_name}
                              onChange={handleChange}
                              isInvalid={!!errors.supplied_item_name}
                              className="compact-input"
                              placeholder="आपूर्ति की गई वस्तु का नाम दर्ज करें"
                            />
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="ms-1"
                              onClick={() => {
                                setOtherMode((prev) => ({
                                  ...prev,
                                  supplied_item_name: false,
                                }));
                                setFormData((prev) => ({
                                  ...prev,
                                  supplied_item_name: "",
                                }));
                                // Refetch options
                                fetchFormFilters("", "", formData.center_name);
                              }}
                              title="विकल्प दिखाएं"
                            >
                              ↺
                            </Button>
                          </div>
                        ) : (
                          <Form.Select
                            name="supplied_item_name"
                            value={formData.supplied_item_name}
                            onChange={handleChange}
                            isInvalid={!!errors.supplied_item_name}
                            className="compact-input"
                            disabled={isLoadingFilters}
                          >
                            <option value="">{translations.selectOption}</option>
                            {formOptions.supplied_item_name.map((item, index) => (
                              <option key={index} value={item}>
                                {item}
                              </option>
                            ))}
                            <option value="Other">अन्य</option>
                          </Form.Select>
                        )}
                        <Form.Control.Feedback type="invalid">
                          {errors.supplied_item_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="unit">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.unit}
                        </Form.Label>
                        {otherMode.unit ? (
                          <div className="d-flex">
                            <Form.Control
                              type="text"
                              name="unit"
                              value={formData.unit}
                              onChange={handleChange}
                              isInvalid={!!errors.unit}
                              className="compact-input"
                              placeholder="इकाई दर्ज करें"
                            />
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="ms-1"
                              onClick={() => {
                                setOtherMode((prev) => ({
                                  ...prev,
                                  unit: false,
                                }));
                                setFormData((prev) => ({ ...prev, unit: "" }));
                                // Refetch base options
                                fetchFormFilters("", "", formData.center_name);
                              }}
                              title="विकल्प दिखाएं"
                            >
                              ↺
                            </Button>
                          </div>
                        ) : (
                          <Form.Select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            isInvalid={!!errors.unit}
                            className="compact-input"
                            disabled={isLoadingFilters}
                          >
                            <option value="">{translations.selectOption}</option>
                            {formOptions.unit.map((unit, index) => (
                              <option key={index} value={unit}>
                                {unit}
                              </option>
                            ))}
                            <option value="Other">अन्य</option>
                          </Form.Select>
                        )}
                        <Form.Control.Feedback type="invalid">
                          {errors.unit}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="quantity">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.quantity}
                        </Form.Label>
                        <Form.Control
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleChange}
                          isInvalid={!!errors.quantity}
                          className="compact-input"
                          placeholder="मात्रा दर्ज करें"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.quantity}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="rate">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.rate}
                        </Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="rate"
                          value={formData.rate}
                          onChange={handleChange}
                          isInvalid={!!errors.rate}
                          className="compact-input"
                          placeholder="दर दर्ज करें"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.rate}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="amount">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.amount}
                        </Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          isInvalid={!!errors.amount}
                          className="compact-input"
                          placeholder="राशि दर्ज करें"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.amount}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="aadhaar_number">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.aadhaarNumber}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="aadhaar_number"
                          value={formData.aadhaar_number}
                          onChange={handleChange}
                          isInvalid={!!errors.aadhaar_number}
                          className="compact-input"
                          placeholder="आधार नंबर दर्ज करें"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.aadhaar_number}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group
                        className="mb-2"
                        controlId="bank_account_number"
                      >
                        <Form.Label className="small-fonts fw-bold">
                          {translations.bankAccountNumber}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="bank_account_number"
                          value={formData.bank_account_number}
                          onChange={handleChange}
                          isInvalid={!!errors.bank_account_number}
                          className="compact-input"
                          placeholder="बैंक खाता नंबर दर्ज करें"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.bank_account_number}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="ifsc_code">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.ifscCode}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="ifsc_code"
                          value={formData.ifsc_code}
                          onChange={handleChange}
                          isInvalid={!!errors.ifsc_code}
                          className="compact-input"
                          placeholder="IFSC कोड दर्ज करें"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.ifsc_code}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="mobile_number">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.mobileNumber}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="mobile_number"
                          value={formData.mobile_number}
                          onChange={handleChange}
                          isInvalid={!!errors.mobile_number}
                          className="compact-input"
                          placeholder="मोबाइल नंबर दर्ज करें"
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.mobile_number}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="category">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.category}
                        </Form.Label>
                        {otherMode.category ? (
                          <div className="d-flex">
                            <Form.Control
                              type="text"
                              name="category"
                              value={formData.category}
                              onChange={handleChange}
                              isInvalid={!!errors.category}
                              className="compact-input"
                              placeholder="श्रेणी दर्ज करें"
                            />
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="ms-1"
                              onClick={() => {
                                setOtherMode((prev) => ({
                                  ...prev,
                                  category: false,
                                }));
                                setFormData((prev) => ({
                                  ...prev,
                                  category: "",
                                }));
                                // Refetch base options
                                fetchFormFilters("", "", formData.center_name);
                              }}
                              title="विकल्प दिखाएं"
                            >
                              ↺
                            </Button>
                          </div>
                        ) : (
                          <Form.Select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            isInvalid={!!errors.category}
                            className="compact-input"
                            disabled={isLoadingFilters}
                          >
                            <option value="">{translations.selectOption}</option>
                            {formOptions.category.map((cat, index) => (
                              <option key={index} value={cat}>
                                {cat}
                              </option>
                            ))}
                            <option value="Other">अन्य</option>
                          </Form.Select>
                        )}
                        <Form.Control.Feedback type="invalid">
                          {errors.category}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="scheme_name">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.schemeName}
                        </Form.Label>
                        {otherMode.scheme_name ? (
                          <div className="d-flex">
                            <Form.Control
                              type="text"
                              name="scheme_name"
                              value={formData.scheme_name}
                              onChange={handleChange}
                              isInvalid={!!errors.scheme_name}
                              className="compact-input"
                              placeholder="योजना का नाम दर्ज करें"
                            />
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="ms-1"
                              onClick={() => {
                                setOtherMode((prev) => ({
                                  ...prev,
                                  scheme_name: false,
                                }));
                                setFormData((prev) => ({
                                  ...prev,
                                  scheme_name: "",
                                }));
                                // Refetch base options
                                fetchFormFilters("", "", formData.center_name);
                              }}
                              title="विकल्प दिखाएं"
                            >
                              ↺
                            </Button>
                          </div>
                        ) : (
                          <Form.Select
                            name="scheme_name"
                            value={formData.scheme_name}
                            onChange={handleChange}
                            isInvalid={!!errors.scheme_name}
                            className="compact-input"
                            disabled={isLoadingFilters}
                          >
                            <option value="">{translations.selectOption}</option>
                            {formOptions.scheme_name.map((scheme, index) => (
                              <option key={index} value={scheme}>
                                {scheme}
                              </option>
                            ))}
                            <option value="Other">अन्य</option>
                          </Form.Select>
                        )}
                        <Form.Control.Feedback type="invalid">
                          {errors.scheme_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="vikas_khand_name">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.vikasKhandName}
                        </Form.Label>
                        <div className="d-flex">
                          <Form.Control
                            type="text"
                            name="vikas_khand_name"
                            value={formData.vikas_khand_name}
                            onChange={handleChange}
                            isInvalid={!!errors.vikas_khand_name}
                            className="compact-input"
                            disabled
                            placeholder={
                              isFetchingVikasKhand ? "लोड हो रहा है..." : ""
                            }
                          />
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            onClick={refreshVikasKhandData}
                            disabled={!formData.center_name || isFetchingVikasKhand}
                            className="ms-1"
                            title="Refresh Vikas Khand Data"
                          >
                            <FaSync className={isFetchingVikasKhand ? "fa-spin" : ""} />
                          </Button>
                        </div>
                        <Form.Control.Feedback type="invalid">
                          {errors.vikas_khand_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={2}>
                      <Form.Group className="mb-2" controlId="vidhan_sabha_name">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.vidhanSabhaName}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="vidhan_sabha_name"
                          value={formData.vidhan_sabha_name}
                          onChange={handleChange}
                          isInvalid={!!errors.vidhan_sabha_name}
                          className="compact-input"
                          disabled
                          placeholder={
                            isFetchingVikasKhand ? "लोड हो रहा है..." : ""
                          }
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.vidhan_sabha_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col
                      xs={12}
                      sm={6}
                      md={4}
                      className="d-flex align-items-center"
                    >
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                        className="compact-submit-btn w-100"
                      >
                        {isSubmitting
                          ? translations.submitting
                          : translations.submitButton}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}

              {/* Refresh Form Options Button */}
              {formData.center_name && (
                <div className="d-flex justify-content-end mb-3">
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={refreshFormOptions}
                    disabled={isLoadingFilters}
                    className="me-2"
                    title="Refresh Form Options"
                  >
                    <FaSync className={isLoadingFilters ? "fa-spin" : ""} />
                    Refresh Options
                  </Button>
                </div>
              )}

              {/* Table Section */}
              <div className="billing-table-section mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="small-fonts mb-0">लाभार्थी डेटा</h3>
                  <div className="d-flex align-items-center">
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="tooltip-refresh">रीफ्रेश करें</Tooltip>
                      }
                    >
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="me-2"
                      >
                        <FaSync
                          className={`me-1 ${isLoading ? "fa-spin" : ""}`}
                        />
                        रीफ्रेश
                      </Button>
                    </OverlayTrigger>
                    {beneficiaries.length > 0 && (
                      <>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-excel">
                              Excel डाउनलोड करें
                            </Tooltip>
                          }
                        >
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() =>
                              downloadExcel(
                                beneficiaries,
                                `Beneficiaries_${new Date()
                                  .toISOString()
                                  .slice(0, 10)}`,
                                beneficiariesTableColumnMapping,
                                selectedColumns
                              )
                            }
                            className="me-2"
                          >
                            <FaFileExcel className="me-1" />
                            Excel
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tooltip-pdf">PDF डाउनलोड करें</Tooltip>
                          }
                        >
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() =>
                              downloadPdf(
                                beneficiaries,
                                `Beneficiaries_${new Date()
                                  .toISOString()
                                  .slice(0, 10)}`,
                                beneficiariesTableColumnMapping,
                                selectedColumns,
                                "लाभार्थी डेटा"
                              )
                            }
                          >
                            <FaFilePdf className="me-1" />
                            PDF
                          </Button>
                        </OverlayTrigger>
                      </>
                    )}
                  </div>
                </div>

                {/* Table info with pagination details */}
                {beneficiaries.length > 0 && (
                  <div className="table-info mb-2 d-flex justify-content-between align-items-center">
                    <span className="small-fonts">
                      {translations.showing}{" "}
                      {(currentPage - 1) * itemsPerPage + 1} {translations.to}{" "}
                      {Math.min(currentPage * itemsPerPage, beneficiaries.length)}{" "}
                      {translations.of} {beneficiaries.length}{" "}
                      {translations.entries}
                    </span>
                    <div className="d-flex align-items-center">
                      <span className="small-fonts me-2">
                        {translations.itemsPerPage}
                      </span>
                      <span className="badge bg-primary">{itemsPerPage}</span>
                    </div>
                  </div>
                )}

                {/* Column Selection Section */}
                {beneficiaries.length > 0 && (
                  <ColumnSelection
                    columns={beneficiariesTableColumns}
                    selectedColumns={selectedColumns}
                    setSelectedColumns={setSelectedColumns}
                    title="कॉलम चुनें"
                  />
                )}

                {/* Multi-Filter Section */}
                {beneficiaries.length > 0 && (
                  <div className="filter-section mb-3 p-3 border rounded bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="small-fonts mb-0">फिल्टर</h6>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={clearFilters}
                      >
                        सभी फिल्टर हटाएं
                      </Button>
                    </div>
                    <Row>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small-fonts fw-bold">
                            {translations.farmerName}
                          </Form.Label>
                          <Select
                            isMulti
                            name="farmer_name"
                            value={filters.farmer_name.map((val) => ({
                              value: val,
                              label: val,
                            }))}
                            onChange={(selected) => {
                              setFilters((prev) => ({
                                ...prev,
                                farmer_name: selected
                                  ? selected.map((s) => s.value)
                                  : [],
                              }));
                            }}
                            options={filterOptions.farmer_name.map((option) => ({
                              value: option,
                              label: option,
                            }))}
                            className="compact-input"
                            placeholder="चुनें"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small-fonts fw-bold">
                            {translations.centerName}
                          </Form.Label>
                          <Select
                            isMulti
                            name="center_name"
                            value={filters.center_name.map((val) => ({
                              value: val,
                              label: val,
                            }))}
                            onChange={(selected) => {
                              setFilters((prev) => ({
                                ...prev,
                                center_name: selected
                                  ? selected.map((s) => s.value)
                                  : [],
                              }));
                            }}
                            options={filterOptions.center_name.map((option) => ({
                              value: option,
                              label: option,
                            }))}
                            className="compact-input"
                            placeholder="चुनें"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small-fonts fw-bold">
                            {translations.suppliedItemName}
                          </Form.Label>
                          <Select
                            isMulti
                            name="supplied_item_name"
                            value={filters.supplied_item_name.map((val) => ({
                              value: val,
                              label: val,
                            }))}
                            onChange={(selected) => {
                              setFilters((prev) => ({
                                ...prev,
                                supplied_item_name: selected
                                  ? selected.map((s) => s.value)
                                  : [],
                              }));
                            }}
                            options={filterOptions.supplied_item_name.map(
                              (option) => ({ value: option, label: option })
                            )}
                            className="compact-input"
                            placeholder="चुनें"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small-fonts fw-bold">
                            {translations.category}
                          </Form.Label>
                          <Select
                            isMulti
                            name="category"
                            value={filters.category.map((val) => ({
                              value: val,
                              label: val,
                            }))}
                            onChange={(selected) => {
                              setFilters((prev) => ({
                                ...prev,
                                category: selected
                                  ? selected.map((s) => s.value)
                                  : [],
                              }));
                            }}
                            options={filterOptions.category.map((option) => ({
                              value: option,
                              label: option,
                            }))}
                            className="compact-input"
                            placeholder="चुनें"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small-fonts fw-bold">
                            {translations.schemeName}
                          </Form.Label>
                          <Select
                            isMulti
                            name="scheme_name"
                            value={filters.scheme_name.map((val) => ({
                              value: val,
                              label: val,
                            }))}
                            onChange={(selected) => {
                              setFilters((prev) => ({
                                ...prev,
                                scheme_name: selected
                                  ? selected.map((s) => s.value)
                                  : [],
                              }));
                            }}
                            options={filterOptions.scheme_name.map((option) => ({
                              value: option,
                              label: option,
                            }))}
                            className="compact-input"
                            placeholder="चुनें"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small-fonts fw-bold">
                            {translations.vikasKhandName}
                          </Form.Label>
                          <Select
                            isMulti
                            name="vikas_khand_name"
                            value={filters.vikas_khand_name.map((val) => ({
                              value: val,
                              label: val,
                            }))}
                            onChange={(selected) => {
                              setFilters((prev) => ({
                                ...prev,
                                vikas_khand_name: selected
                                  ? selected.map((s) => s.value)
                                  : [],
                              }));
                            }}
                            options={filterOptions.vikas_khand_name.map(
                              (option) => ({ value: option, label: option })
                            )}
                            className="compact-input"
                            placeholder="चुनें"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small-fonts fw-bold">
                            {translations.vidhanSabhaName}
                          </Form.Label>
                          <Select
                            isMulti
                            name="vidhan_sabha_name"
                            value={filters.vidhan_sabha_name.map((val) => ({
                              value: val,
                              label: val,
                            }))}
                            onChange={(selected) => {
                              setFilters((prev) => ({
                                ...prev,
                                vidhan_sabha_name: selected
                                  ? selected.map((s) => s.value)
                                  : [],
                              }));
                            }}
                            options={filterOptions.vidhan_sabha_name.map(
                              (option) => ({ value: option, label: option })
                            )}
                            className="compact-input"
                            placeholder="चुनें"
                          />
                        </Form.Group>
                      </Col>
                      {/* Added date range filters */}
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small-fonts fw-bold">
                            {translations.startDate}
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="start_date"
                            value={filters.start_date}
                            onChange={handleFilterChange}
                            className="compact-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small-fonts fw-bold">
                            {translations.endDate}
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="end_date"
                            value={filters.end_date}
                            onChange={handleFilterChange}
                            className="compact-input"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">लोड हो रहा है...</span>
                    </div>
                    <p className="mt-2 small-fonts">डेटा लोड हो रहा है...</p>
                  </div>
                ) : beneficiaries.length === 0 ? (
                  <Alert variant="info" className="text-center">
                    कोई लाभार्थी डेटा उपलब्ध नहीं है।
                  </Alert>
                ) : (
                  <>
                    <Table striped bordered hover className="registration-form">
                      <thead className="table-light">
                        <tr>
                          <th>क्र.सं.</th>
                          {/* Updated column order to match the requested sequence */}
                          {selectedColumns.includes("center_name") && (
                            <th>{translations.centerName}</th>
                          )}
                          {selectedColumns.includes("vidhan_sabha_name") && (
                            <th>{translations.vidhanSabhaName}</th>
                          )}
                          {selectedColumns.includes("vikas_khand_name") && (
                            <th>{translations.vikasKhandName}</th>
                          )}
                          {selectedColumns.includes("scheme_name") && (
                            <th>{translations.schemeName}</th>
                          )}
                          {selectedColumns.includes("supplied_item_name") && (
                            <th>{translations.suppliedItemName}</th>
                          )}
                          {selectedColumns.includes("farmer_name") && (
                            <th>{translations.farmerName}</th>
                          )}
                          {selectedColumns.includes("father_name") && (
                            <th>{translations.fatherName}</th>
                          )}
                          {selectedColumns.includes("category") && (
                            <th>{translations.category}</th>
                          )}
                          {selectedColumns.includes("address") && (
                            <th>{translations.address}</th>
                          )}
                          {selectedColumns.includes("mobile_number") && (
                            <th>{translations.mobileNumber}</th>
                          )}
                          {selectedColumns.includes("aadhaar_number") && (
                            <th>{translations.aadhaarNumber}</th>
                          )}
                          {selectedColumns.includes("bank_account_number") && (
                            <th>{translations.bankAccountNumber}</th>
                          )}
                          {selectedColumns.includes("ifsc_code") && (
                            <th>{translations.ifscCode}</th>
                          )}
                          {selectedColumns.includes("unit") && (
                            <th>{translations.unit}</th>
                          )}
                          {selectedColumns.includes("quantity") && (
                            <th>{translations.quantity}</th>
                          )}
                          {selectedColumns.includes("rate") && (
                            <th>{translations.rate}</th>
                          )}
                          {selectedColumns.includes("amount") && (
                            <th>{translations.amount}</th>
                          )}
                          <th>कार्रवाई</th>
                        </tr>
                      </thead>
                      <tbody className="tbl-body">
                        {beneficiaries
                          .slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage
                          )
                          .map((item, index) => (
                            <tr key={item.beneficiary_id || index}>
                              <td>
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>
                              {/* Updated column order to match the requested sequence */}
                              {selectedColumns.includes("center_name") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    <Form.Select
                                      name="center_name"
                                      value={editingValues.center_name}
                                      onChange={handleEditChange}
                                      size="sm"
                                    >
                                      <option value="">
                                        {translations.selectOption}
                                      </option>
                                      {centerOptions.map((center, index) => (
                                        <option key={index} value={center}>
                                          {center}
                                        </option>
                                      ))}
                                    </Form.Select>
                                  ) : (
                                    item.center_name
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("vidhan_sabha_name") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    <Form.Control
                                      type="text"
                                      name="vidhan_sabha_name"
                                      value={editingValues.vidhan_sabha_name}
                                      onChange={handleEditChange}
                                      size="sm"
                                      disabled
                                    />
                                  ) : (
                                    item.vidhan_sabha_name
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("vikas_khand_name") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    <Form.Control
                                      type="text"
                                      name="vikas_khand_name"
                                      value={editingValues.vikas_khand_name}
                                      onChange={handleEditChange}
                                      size="sm"
                                      disabled
                                    />
                                  ) : (
                                    item.vikas_khand_name
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("scheme_name") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    editingOtherMode.scheme_name ? (
                                      <div className="d-flex">
                                        <Form.Control
                                          type="text"
                                          name="scheme_name"
                                          value={editingValues.scheme_name}
                                          onChange={handleEditChange}
                                          size="sm"
                                        />
                                        <Button
                                          variant="outline-secondary"
                                          size="sm"
                                          className="ms-1"
                                          onClick={() => {
                                            setEditingOtherMode((prev) => ({
                                              ...prev,
                                              scheme_name: false,
                                            }));
                                            setEditingValues((prev) => ({
                                              ...prev,
                                              scheme_name: "",
                                            }));
                                            // Refetch base options
                                            fetchFormFilters("", "", editingValues.center_name);
                                          }}
                                          title="विकल्प दिखाएं"
                                        >
                                          ↺
                                        </Button>
                                      </div>
                                    ) : (
                                      <Form.Select
                                        name="scheme_name"
                                        value={editingValues.scheme_name}
                                        onChange={handleEditChange}
                                        size="sm"
                                      >
                                        <option value="">
                                          {translations.selectOption}
                                        </option>
                                        {formOptions.scheme_name.map(
                                          (scheme, index) => (
                                            <option key={index} value={scheme}>
                                              {scheme}
                                            </option>
                                          )
                                        )}
                                        <option value="Other">अन्य</option>
                                      </Form.Select>
                                    )
                                  ) : (
                                    item.scheme_name
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("supplied_item_name") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    editingOtherMode.supplied_item_name ? (
                                      <div className="d-flex">
                                        <Form.Control
                                          type="text"
                                          name="supplied_item_name"
                                          value={editingValues.supplied_item_name}
                                          onChange={handleEditChange}
                                          size="sm"
                                        />
                                        <Button
                                          variant="outline-secondary"
                                          size="sm"
                                          className="ms-1"
                                          onClick={() => {
                                            setEditingOtherMode((prev) => ({
                                              ...prev,
                                              supplied_item_name: false,
                                            }));
                                            setEditingValues((prev) => ({
                                              ...prev,
                                              supplied_item_name: "",
                                            }));
                                            // Refetch options
                                            fetchFormFilters("", "", editingValues.center_name);
                                          }}
                                          title="विकल्प दिखाएं"
                                        >
                                          ↺
                                        </Button>
                                      </div>
                                    ) : (
                                      <Form.Select
                                        name="supplied_item_name"
                                        value={editingValues.supplied_item_name}
                                        onChange={handleEditChange}
                                        size="sm"
                                      >
                                        <option value="">
                                          {translations.selectOption}
                                        </option>
                                        {formOptions.supplied_item_name.map(
                                          (item, index) => (
                                            <option key={index} value={item}>
                                              {item}
                                            </option>
                                          )
                                        )}
                                        <option value="Other">अन्य</option>
                                      </Form.Select>
                                    )
                                  ) : (
                                    item.supplied_item_name
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("farmer_name") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    <Form.Control
                                      type="text"
                                      name="farmer_name"
                                      value={editingValues.farmer_name}
                                      onChange={handleEditChange}
                                      size="sm"
                                    />
                                  ) : (
                                    item.farmer_name
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("father_name") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    <Form.Control
                                      type="text"
                                      name="father_name"
                                      value={editingValues.father_name}
                                      onChange={handleEditChange}
                                      size="sm"
                                    />
                                  ) : (
                                    item.father_name
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("category") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    editingOtherMode.category ? (
                                      <div className="d-flex">
                                        <Form.Control
                                          type="text"
                                          name="category"
                                          value={editingValues.category}
                                          onChange={handleEditChange}
                                          size="sm"
                                        />
                                        <Button
                                          variant="outline-secondary"
                                          size="sm"
                                          className="ms-1"
                                          onClick={() => {
                                            setEditingOtherMode((prev) => ({
                                              ...prev,
                                              category: false,
                                            }));
                                            setEditingValues((prev) => ({
                                              ...prev,
                                              category: "",
                                            }));
                                            // Refetch base options
                                            fetchFormFilters("", "", editingValues.center_name);
                                          }}
                                          title="विकल्प दिखाएं"
                                        >
                                          ↺
                                        </Button>
                                      </div>
                                    ) : (
                                      <Form.Select
                                        name="category"
                                        value={editingValues.category}
                                        onChange={handleEditChange}
                                        size="sm"
                                      >
                                        <option value="">
                                          {translations.selectOption}
                                        </option>
                                        {formOptions.category.map(
                                          (cat, index) => (
                                            <option key={index} value={cat}>
                                              {cat}
                                            </option>
                                          )
                                        )}
                                        <option value="Other">अन्य</option>
                                      </Form.Select>
                                    )
                                  ) : (
                                    item.category
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("address") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    <Form.Control
                                      as="textarea"
                                      rows={2}
                                      name="address"
                                      value={editingValues.address}
                                      onChange={handleEditChange}
                                      size="sm"
                                    />
                                  ) : (
                                    item.address
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("mobile_number") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    <Form.Control
                                      type="text"
                                      name="mobile_number"
                                      value={editingValues.mobile_number}
                                      onChange={handleEditChange}
                                      size="sm"
                                    />
                                  ) : (
                                    item.mobile_number
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("aadhaar_number") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    <Form.Control
                                      type="text"
                                      name="aadhaar_number"
                                      value={editingValues.aadhaar_number}
                                      onChange={handleEditChange}
                                      size="sm"
                                    />
                                  ) : (
                                    item.aadhaar_number
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes(
                                "bank_account_number"
                              ) && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    <Form.Control
                                      type="text"
                                      name="bank_account_number"
                                      value={editingValues.bank_account_number}
                                      onChange={handleEditChange}
                                      size="sm"
                                    />
                                  ) : (
                                    item.bank_account_number
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("ifsc_code") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    <Form.Control
                                      type="text"
                                      name="ifsc_code"
                                      value={editingValues.ifsc_code}
                                      onChange={handleEditChange}
                                      size="sm"
                                    />
                                  ) : (
                                    item.ifsc_code
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("unit") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    editingOtherMode.unit ? (
                                      <div className="d-flex">
                                        <Form.Control
                                          type="text"
                                          name="unit"
                                          value={editingValues.unit}
                                          onChange={handleEditChange}
                                          size="sm"
                                        />
                                        <Button
                                          variant="outline-secondary"
                                          size="sm"
                                          className="ms-1"
                                          onClick={() => {
                                            setEditingOtherMode((prev) => ({
                                              ...prev,
                                              unit: false,
                                            }));
                                            setEditingValues((prev) => ({
                                              ...prev,
                                              unit: "",
                                            }));
                                            // Refetch base options
                                            fetchFormFilters("", "", editingValues.center_name);
                                          }}
                                          title="विकल्प दिखाएं"
                                        >
                                          ↺
                                        </Button>
                                      </div>
                                    ) : (
                                      <Form.Select
                                        name="unit"
                                        value={editingValues.unit}
                                        onChange={handleEditChange}
                                        size="sm"
                                      >
                                        <option value="">
                                          {translations.selectOption}
                                        </option>
                                        {formOptions.unit.map((unit, index) => (
                                          <option key={index} value={unit}>
                                            {unit}
                                          </option>
                                        ))}
                                        <option value="Other">अन्य</option>
                                      </Form.Select>
                                    )
                                  ) : (
                                    item.unit
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("quantity") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    <Form.Control
                                      type="number"
                                      name="quantity"
                                      value={editingValues.quantity}
                                      onChange={handleEditChange}
                                      size="sm"
                                    />
                                  ) : (
                                    item.quantity
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("rate") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      name="rate"
                                      value={editingValues.rate}
                                      onChange={handleEditChange}
                                      size="sm"
                                    />
                                  ) : (
                                    item.rate
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("amount") && (
                                <td>
                                  {editingRowId === item.beneficiary_id ? (
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      name="amount"
                                      value={editingValues.amount}
                                      onChange={handleEditChange}
                                      size="sm"
                                    />
                                  ) : (
                                    item.amount
                                  )}
                                </td>
                              )}
                              <td>
                                {editingRowId === item.beneficiary_id ? (
                                  <>
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      onClick={() => handleSave(item)}
                                      className="me-1"
                                    >
                                      सहेजें
                                    </Button>
                                    <Button
                                      variant="outline-secondary"
                                      size="sm"
                                      onClick={handleCancel}
                                    >
                                      रद्द करें
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                  <div className="d-flex justify-content-between">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => handleEdit(item)}
                                      className="me-1 gov-edit-btn"
                                    >
                                      संपादित करें
                                    </Button>
                                    <Button
                                      className="gov-delete-btn"
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleDelete(item)}
                                    >
                                      हटाएं
                                    </Button>
                                    </div>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>

                    {/* Pagination controls */}
                    {beneficiaries.length > itemsPerPage && (
                      <div className="mt-3">
                        <div className="small-fonts mb-3 text-center">
                          {translations.page} {currentPage} {translations.of}{" "}
                          {totalPages}
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
                )}
              </div>
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default KrishiRegistration;