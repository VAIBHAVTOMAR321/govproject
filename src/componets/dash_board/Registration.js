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
} from "react-bootstrap";
import { FaFileExcel, FaFilePdf, FaTimes, FaSync } from "react-icons/fa";
import axios from "axios";
import * as XLSX from "xlsx";
import Select from "react-select";
import "../../assets/css/registration.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";

// API URLs
const BILLING_API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/";
const VIKAS_KHAND_API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/get-vikas-khand-by-center/";
const FORM_FILTERS_API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/billing-form-filters/";

// Static options for form fields
const centerOptions = [
  "किनगोड़िखाल",
  "हल्दूखाल",
  "धुमाकोट",
  "सिसल्ड़ी",
  "सेंधीखाल",
  "जयहरीखाल",
  "जेठागांव",
  "देवियोंखाल",
  "किल्वोंखाल",
  "बीरोंखाल",
  "वेदीखाल",
  "पोखड़ा",
  "संगलाकोटी",
  "देवराजखाल",
  "चौखाल",
  "गंगाभोगपुर",
  "दिउली",
  "दुगड्डा",
  "बिथ्याणी",
  "चैलूसैंण",
  "सिलोगी",
  "कोटद्वार",
  "सतपुली",
  "पौखाल",
];
const componentOptions = ["सीमेंट", "स्टील", "बालू", "पत्थर", "ईंट"];
const investmentOptions = [
  "भवन निर्माण",
  "सड़क निर्माण",
  "पुल निर्माण",
  "कुआँ निर्माण",
];
const unitOptions = ["बैग", "क्विंटल", "किलोग्राम", "नंबर", "लीटर"];
const sourceOptions = ["PWD", "PMGSY", "NREGA"];
const schemeOptions = ["MGNREGA", "PMKSY", "DDUGJY"];
const vikasKhandOptions = [
  "नैनीडांडा",
  "बीरोंखाल",
  "यमकेश्वर",
  "दुगड्डा",
  "पौड़ी",
  "द्वारीखाल",
  "जयहरीखाल",
  "रिखणीखाल",
  "नगर निगम कोटद्वार",
];
const vidhanSabhaOptions = [
  "लैन्सडाउन",
  "यमकेश्वर",
  "चौबट्टाखाल",
  "कोटद्वार",
  "श्रीनगर",
];

// Available columns for the table (excluding sno which is always shown)
const billingTableColumns = [
  { key: "center_name", label: "केंद्र का नाम" },
  { key: "component", label: "घटक" },
  { key: "investment_name", label: "निवेश का नाम" },
  { key: "sub_investment_name", label: "उप-निवेश का नाम" },
  { key: "unit", label: "इकाई" },
  { key: "allocated_quantity", label: "आवंटित मात्रा" },
  { key: "rate", label: "दर" },
  { key: "source_of_receipt", label: "प्राप्ति का स्रोत" },
  { key: "scheme_name", label: "योजना का नाम" },
  { key: "vikas_khand_name", label: "विकास खंड का नाम" },
  { key: "vidhan_sabha_name", label: "विधानसभा का नाम" },
];

// Column mapping for data access
const billingTableColumnMapping = {
  sno: { header: "क्र.सं.", accessor: (item, index) => index + 1 },
  center_name: {
    header: "केंद्र का नाम",
    accessor: (item) => item.center_name,
  },
  component: { header: "घटक", accessor: (item) => item.component },
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
  source_of_receipt: {
    header: "प्राप्ति का स्रोत",
    accessor: (item) => item.source_of_receipt,
  },
  scheme_name: { header: "योजना का नाम", accessor: (item) => item.scheme_name },
  vikas_khand_name: {
    header: "विकास खंड का नाम",
    accessor: (item) => item.vikas_khand_name,
  },
  vidhan_sabha_name: {
    header: "विधानसभा का नाम",
    accessor: (item) => item.vidhan_sabha_name,
  },
};

// Hindi translations for form
const translations = {
  pageTitle: "बिलिंग आइटम",
  centerName: "केंद्र का नाम",
  component: "घटक",
  investmentName: "निवेश का नाम",
  subInvestmentName: "उप-निवेश का नाम",
  unit: "इकाई",
  allocatedQuantity: "आवंटित मात्रा",
  rate: "दर",
  sourceOfReceipt: "प्राप्ति का स्रोत",
  schemeName: "योजना का नाम",
  vikasKhandName: "विकास खंड का नाम",
  vidhanSabhaName: "विधानसभा का नाम",
  submitButton: "जमा करें",
  submitting: "जमा कर रहे हैं...",
  successMessage: "बिलिंग आइटम सफलतापूर्वक जोड़ा गया!",
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
};

const Registration = () => {
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
    center_name: "",
    component: "",
    investment_name: "",
    sub_investment_name: "",
    unit: "",
    allocated_quantity: "",
    rate: "",
    source_of_receipt: "",
    scheme_name: "",
    vikas_khand_name: "",
    vidhan_sabha_name: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [billingItems, setBillingItems] = useState([]);
  const [allBillingItems, setAllBillingItems] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedColumns, setSelectedColumns] = useState(
    billingTableColumns.map((col) => col.key)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [vikasKhandData, setVikasKhandData] = useState(null);
  const [isFetchingVikasKhand, setIsFetchingVikasKhand] = useState(false);

  // State for filters
  const [filters, setFilters] = useState({
    center_name: [],
    component: [],
    investment_name: [],
    source_of_receipt: [],
    scheme_name: [],
    vikas_khand_name: [],
    vidhan_sabha_name: [],
  });

  // State for filter options (unique values from API)
  const [filterOptions, setFilterOptions] = useState({
    center_name: [],
    component: [],
    investment_name: [],
    sub_investment_name: [],
    unit: [],
    source_of_receipt: [],
    scheme_name: [],
    vikas_khand_name: [],
    vidhan_sabha_name: [],
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Dynamic form options
  const [formOptions, setFormOptions] = useState({
    component: [],
    investment_name: [],
    sub_investment_name: [],
    unit: ["Number", "meter", "Square meter", "kg", "बैग"], // Default unit options from API
    source_of_receipt: sourceOptions,
    scheme_name: schemeOptions,
  });

  // Dynamic edit options
  const [editOptions, setEditOptions] = useState({
    component: [],
    investment_name: [],
    sub_investment_name: [],
    unit: ["Number", "meter", "Square meter", "kg", "बैग"], // Default unit options from API
    source_of_receipt: sourceOptions,
    scheme_name: schemeOptions,
  });

  // Removed otherMode and editingOtherMode states - all fields are now always dropdowns

  const [isLoadingFilters, setIsLoadingFilters] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingValues, setEditingValues] = useState({});

  // Fetch billing items data
  const fetchBillingItems = async (appliedFilters = {}) => {
    try {
      setIsLoading(true);
      setApiError(null);
      const params = {};
      Object.keys(appliedFilters).forEach((key) => {
        if (
          Array.isArray(appliedFilters[key]) &&
          appliedFilters[key].length > 0
        ) {
          params[key] = appliedFilters[key];
        } else if (
          appliedFilters[key] &&
          typeof appliedFilters[key] === "string" &&
          appliedFilters[key].trim()
        ) {
          params[key] = appliedFilters[key];
        }
      });
      const response = await axios.get(BILLING_API_URL, { params });
      const data =
        response.data && response.data.data
          ? response.data.data
          : response.data;
      const items = Array.isArray(data) ? data : [];
      setBillingItems(items);
      if (Object.keys(params).length === 0) {
        setAllBillingItems(items);
      }
    } catch (error) {
      console.error("Error fetching billing items:", error);
      setApiError("डेटा लोड करने में त्रुटि हुई।");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch vikas khand data based on center
  const fetchVikasKhandData = async (centerName) => {
    if (!centerName) {
      setVikasKhandData(null);
      setFormData((prev) => ({
        ...prev,
        vikas_khand_name: "",
        vidhan_sabha_name: "",
      }));
      return;
    }

    try {
      setIsFetchingVikasKhand(true);
      console.log("Fetching vikas khand for center:", centerName);
      const response = await axios.get(
        `${VIKAS_KHAND_API_URL}?center_name=${encodeURIComponent(centerName)}`
      );
      console.log("Raw response:", response);
      const data = response.data;
      console.log("Parsed data:", data);

      // Handle different response structures
      let vikasData = null;
      if (Array.isArray(data) && data.length > 0) {
        vikasData = data[0];
      } else if (data && typeof data === "object" && data.vikas_khand_name) {
        vikasData = data;
      }

      console.log("Extracted vikas data:", vikasData);

      if (vikasData) {
        setVikasKhandData(vikasData);
        // Update form data immediately
        setFormData((prev) => ({
          ...prev,
          vikas_khand_name: vikasData.vikas_khand_name || "",
          vidhan_sabha_name: vikasData.vidhan_sabha_name || "",
        }));
        // Update editing values if editing
        if (editingRowId) {
          setEditingValues((prev) => ({
            ...prev,
            vikas_khand_name: vikasData.vikas_khand_name || "",
            vidhan_sabha_name: vikasData.vidhan_sabha_name || "",
          }));
        }
        console.log("Form data updated with:", vikasData);
      } else {
        setVikasKhandData(null);
        setFormData((prev) => ({
          ...prev,
          vikas_khand_name: "",
          vidhan_sabha_name: "",
        }));
        if (editingRowId) {
          setEditingValues((prev) => ({
            ...prev,
            vikas_khand_name: "",
            vidhan_sabha_name: "",
          }));
        }
        console.log("No vikas data found, cleared form");
      }
    } catch (error) {
      console.error("Error fetching vikas khand data:", error);
      setVikasKhandData(null);
      setFormData((prev) => ({
        ...prev,
        vikas_khand_name: "",
        vidhan_sabha_name: "",
      }));
      if (editingRowId) {
        setEditingValues((prev) => ({
          ...prev,
          vikas_khand_name: "",
          vidhan_sabha_name: "",
        }));
      }
    } finally {
      setIsFetchingVikasKhand(false);
    }
  };

  // Fetch form filters
  const fetchFormFilters = async (
    component = "",
    investmentName = "",
    subInvestmentName = ""
  ) => {
    try {
      setIsLoadingFilters(true);
      let url = FORM_FILTERS_API_URL;
      const params = [];
      if (component) params.push(`component=${encodeURIComponent(component)}`);
      if (investmentName)
        params.push(`investment_name=${encodeURIComponent(investmentName)}`);
      if (subInvestmentName)
        params.push(
          `sub_investment_name=${encodeURIComponent(subInvestmentName)}`
        );
      if (params.length > 0) url += "?" + params.join("&");

      console.log("Fetching filters from:", url);
      const response = await axios.get(url);
      const data = response.data;
      console.log("API response:", data);

      setFormOptions((prev) => ({
        ...prev,
        component:
          data.level === "component" ? data.data || [] : prev.component,
        investment_name:
          data.level === "investment_name"
            ? data.data || []
            : prev.investment_name,
        sub_investment_name:
          data.level === "sub_investment_name"
            ? data.data || []
            : prev.sub_investment_name,
        unit: data.unit || prev.unit,
        source_of_receipt: data.source_of_receipt || prev.source_of_receipt,
        scheme_name: data.scheme_name || prev.scheme_name,
      }));
    } catch (error) {
      console.error("Error fetching form filters:", error);
    } finally {
      setIsLoadingFilters(false);
    }
  };

  // Fetch edit options
  const fetchEditOptions = async (
    component = "",
    investmentName = "",
    subInvestmentName = ""
  ) => {
    try {
      let url = FORM_FILTERS_API_URL;
      const params = [];
      if (component) params.push(`component=${encodeURIComponent(component)}`);
      if (investmentName)
        params.push(`investment_name=${encodeURIComponent(investmentName)}`);
      if (subInvestmentName)
        params.push(
          `sub_investment_name=${encodeURIComponent(subInvestmentName)}`
        );
      if (params.length > 0) url += "?" + params.join("&");

      const response = await axios.get(url);
      const data = response.data;

      setEditOptions((prev) => ({
        ...prev,
        component:
          data.level === "component" ? data.data || [] : prev.component,
        investment_name:
          data.level === "investment_name"
            ? data.data || []
            : prev.investment_name,
        sub_investment_name:
          data.level === "sub_investment_name"
            ? data.data || []
            : prev.sub_investment_name,
        unit: data.unit || prev.unit,
        source_of_receipt: data.source_of_receipt || prev.source_of_receipt,
        scheme_name: data.scheme_name || prev.scheme_name,
      }));
    } catch (error) {
      console.error("Error fetching edit filters:", error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchBillingItems();
    fetchFormFilters();
  }, []);

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [billingItems]);

  // Populate filter options from all billing items
  useEffect(() => {
    if (allBillingItems.length > 0) {
      setFilterOptions({
        center_name: [
          ...new Set(
            allBillingItems.map((item) => item.center_name).filter(Boolean)
          ),
        ],
        component: [
          ...new Set(
            allBillingItems.map((item) => item.component).filter(Boolean)
          ),
        ],
        investment_name: [
          ...new Set(
            allBillingItems.map((item) => item.investment_name).filter(Boolean)
          ),
        ],
        sub_investment_name: [
          ...new Set(
            allBillingItems
              .map((item) => item.sub_investment_name)
              .filter(Boolean)
          ),
        ],
        unit: [
          ...new Set(allBillingItems.map((item) => item.unit).filter(Boolean)),
        ],
        source_of_receipt: [
          ...new Set(
            allBillingItems
              .map((item) => item.source_of_receipt)
              .filter(Boolean)
          ),
        ],
        scheme_name: [
          ...new Set(
            allBillingItems.map((item) => item.scheme_name).filter(Boolean)
          ),
        ],
        vikas_khand_name: [
          ...new Set(
            allBillingItems.map((item) => item.vikas_khand_name).filter(Boolean)
          ),
        ],
        vidhan_sabha_name: [
          ...new Set(
            allBillingItems
              .map((item) => item.vidhan_sabha_name)
              .filter(Boolean)
          ),
        ],
      });
    }
  }, [allBillingItems]);

  // Apply local filtering when filters change
  useEffect(() => {
    const hasFilters = Object.keys(filters).some((key) =>
      Array.isArray(filters[key])
        ? filters[key].length > 0
        : filters[key].trim()
    );
    if (hasFilters) {
      const filtered = allBillingItems.filter((item) => {
        for (const key in filters) {
          if (filters[key].length > 0 && !filters[key].includes(item[key])) {
            return false;
          }
        }
        return true;
      });
      setBillingItems(filtered);
    } else {
      setBillingItems(allBillingItems);
    }
  }, [filters, allBillingItems]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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
      center_name: [],
      component: [],
      investment_name: [],
      source_of_receipt: [],
      scheme_name: [],
      vikas_khand_name: [],
      vidhan_sabha_name: [],
    });
  };

  // Filtered items (now from API)
  const filteredItems = billingItems;

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

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

      // Set column widths
      const colWidths = selectedColumns.map(() => ({ wch: 15 }));
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
      console.error("Error generating Excel file:", e);
      setApiError("Excel file generation failed. Please try again.");
    }
  };

  // Download sample Excel template
  const downloadSampleTemplate = () => {
    try {
      const sampleData = [
        {
          "केंद्र का नाम": "किनगोड़िखाल",
          घटक: "सीमेंट",
          "निवेश का नाम": "भवन निर्माण",
          "उप-निवेश का नाम": "नया भवन",
          इकाई: "बैग",
          "आवंटित मात्रा": 100,
          दर: 450.5,
          "प्राप्ति का स्रोत": "PWD",
          "योजना का नाम": "MGNREGA",
          "विकास खंड का नाम": "नैनीडांडा",
          "विधानसभा का नाम": "लैन्सडाउन",
        },
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(sampleData);

      // Set column widths
      const colWidths = [
        { wch: 20 }, // केंद्र का नाम
        { wch: 15 }, // घटक
        { wch: 20 }, // निवेश का नाम
        { wch: 20 }, // उप-निवेश का नाम
        { wch: 10 }, // इकाई
        { wch: 15 }, // आवंटित मात्रा
        { wch: 10 }, // दर
        { wch: 15 }, // प्राप्ति का स्रोत
        { wch: 15 }, // योजना का नाम
        { wch: 20 }, // विकास खंड का नाम
        { wch: 20 }, // विधानसभा का नाम
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "SampleTemplate");
      XLSX.writeFile(wb, `Billing_Items_Template.xlsx`);
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

      // Wait for the content to load before printing
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
    fetchBillingItems();
    setApiResponse(null);
    setApiError(null);
    clearFilters();
    setEditingRowId(null);
    setEditingValues({});
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingRowId(item.id);
    setEditingValues({
      center_name: item.center_name || "",
      component: item.component || "",
      investment_name: item.investment_name || "",
      sub_investment_name: item.sub_investment_name || "",
      unit: item.unit || "",
      allocated_quantity: item.allocated_quantity || "",
      rate: item.rate || "",
      source_of_receipt: item.source_of_receipt || "",
      scheme_name: item.scheme_name || "",
      vikas_khand_name: item.vikas_khand_name || "",
      vidhan_sabha_name: item.vidhan_sabha_name || "",
    });
    // Fetch options based on current values
    if (item.investment_name) {
      fetchFormFilters("", item.investment_name);
    }
    setApiError(null);
    setApiResponse(null);
  };

  // Handle save edit
  const handleSave = async (item) => {
    try {
      const payload = {
        bill_id: item.bill_id,
        center_name: editingValues.center_name,
        component: editingValues.component,
        investment_name: editingValues.investment_name,
        sub_investment_name: editingValues.sub_investment_name,
        unit: editingValues.unit,
        allocated_quantity: parseInt(editingValues.allocated_quantity) || 0,
        rate: parseFloat(editingValues.rate) || 0,
        source_of_receipt: editingValues.source_of_receipt,
        scheme_name: editingValues.scheme_name,
        vikas_khand_name: editingValues.vikas_khand_name,
        vidhan_sabha_name: editingValues.vidhan_sabha_name,
      };
      const response = await axios.put(BILLING_API_URL, payload);
      setAllBillingItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, ...payload } : i))
      );
      setEditingRowId(null);
      setEditingValues({});
      setApiResponse({ message: "आइटम सफलतापूर्वक अपडेट किया गया!" });
    } catch (error) {
      console.error("Error updating item:", error);
      setApiError("आइटम अपडेट करने में त्रुटि हुई।");
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditingRowId(null);
    setEditingValues({});
  };

  // Handle delete
  const handleDelete = async (item) => {
    if (window.confirm("क्या आप इस आइटम को हटाना चाहते हैं?")) {
      try {
        const response = await axios.delete(BILLING_API_URL, {
          data: { bill_id: item.bill_id },
        });
        setAllBillingItems((prev) => prev.filter((i) => i.id !== item.id));
        setApiResponse({ message: "आइटम सफलतापूर्वक हटा दिया गया!" });
      } catch (error) {
        console.error("Error deleting item:", error);
        setApiError("आइटम हटाने में त्रुटि हुई।");
      }
    }
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate pagination items similar to MainDashboard.js
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
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

  // Handle bulk upload
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

          // Parse data using header mapping
          const payloads = dataRows.map((row) => ({
            center_name:
              row[headerMapping["केंद्र का नाम"]] ||
              row[headerMapping["center_name"]] ||
              "",
            component:
              row[headerMapping["घटक"]] ||
              row[headerMapping["component"]] ||
              "",
            investment_name:
              row[headerMapping["निवेश का नाम"]] ||
              row[headerMapping["investment_name"]] ||
              "",
            sub_investment_name:
              row[headerMapping["उप-निवेश का नाम"]] ||
              row[headerMapping["sub_investment_name"]] ||
              "",
            unit:
              row[headerMapping["इकाई"]] || row[headerMapping["unit"]] || "",
            allocated_quantity: parseInt(
              row[headerMapping["आवंटित मात्रा"]] ||
                row[headerMapping["allocated_quantity"]] ||
                0
            ),
            rate: parseFloat(
              row[headerMapping["दर"]] || row[headerMapping["rate"]] || 0
            ),
            source_of_receipt:
              row[headerMapping["प्राप्ति का स्रोत"]] ||
              row[headerMapping["source_of_receipt"]] ||
              "",
            scheme_name:
              row[headerMapping["योजना का नाम"]] ||
              row[headerMapping["scheme_name"]] ||
              "",
            vikas_khand_name:
              row[headerMapping["विकास खंड का नाम"]] ||
              row[headerMapping["vikas_khand_name"]] ||
              "",
            vidhan_sabha_name:
              row[headerMapping["विधानसभा का नाम"]] ||
              row[headerMapping["vidhan_sabha_name"]] ||
              "",
          }));

          let successfulUploads = 0;
          const failedItems = [];

          for (let i = 0; i < payloads.length; i++) {
            try {
              const payload = payloads[i];
              const response = await axios.post(BILLING_API_URL, payload);

              if (response.status === 200 || response.status === 201) {
                setAllBillingItems((prev) => [payload, ...prev]);
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

    // Handle cascading dropdowns
    if (name === "component" && value) {
      // Reset dependent fields
      updatedFormData.investment_name = "";
      updatedFormData.sub_investment_name = "";
      updatedFormData.unit = "";
      // Fetch investment options
      fetchFormFilters(value);
    } else if (name === "investment_name" && value) {
      // Reset dependent fields
      updatedFormData.sub_investment_name = "";
      updatedFormData.unit = "";
      // Fetch options based on investment_name
      fetchFormFilters("", value);
    } else if (
      name === "sub_investment_name" &&
      value &&
      formData.component &&
      formData.investment_name
    ) {
      // Sub-investment changed, no need to reset unit as it's independent
      // Could fetch sub-investment specific data if needed, but unit is independent
    }

    // If center changes, fetch vikas khand data and auto-fill all fields with default values
    if (name === "center_name") {
      if (value) {
        fetchVikasKhandData(value);
        // Auto-fill all fields with default values
        updatedFormData.component = "सीमेंट";
        updatedFormData.investment_name = "भवन निर्माण";
        updatedFormData.sub_investment_name = "नया भवन";
        updatedFormData.unit = "बैग";
        updatedFormData.allocated_quantity = "100";
        updatedFormData.rate = "450.5";
        updatedFormData.source_of_receipt = "PWD";
        updatedFormData.scheme_name = "MGNREGA";
      } else {
        setVikasKhandData(null);
        updatedFormData.vikas_khand_name = "";
        updatedFormData.vidhan_sabha_name = "";
        // Clear all fields
        updatedFormData.component = "";
        updatedFormData.investment_name = "";
        updatedFormData.sub_investment_name = "";
        updatedFormData.unit = "";
        updatedFormData.allocated_quantity = "";
        updatedFormData.rate = "";
        updatedFormData.source_of_receipt = "";
        updatedFormData.scheme_name = "";
      }
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
      // Create new item
      const payload = {
        center_name: formData.center_name,
        component: formData.component,
        investment_name: formData.investment_name,
        sub_investment_name: formData.sub_investment_name,
        unit: formData.unit,
        allocated_quantity: parseInt(formData.allocated_quantity),
        rate: parseFloat(formData.rate),
        source_of_receipt: formData.source_of_receipt,
        scheme_name: formData.scheme_name,
        vikas_khand_name: formData.vikas_khand_name,
        vidhan_sabha_name: formData.vidhan_sabha_name,
      };

      const response = await axios.post(BILLING_API_URL, payload);

      // Handle both possible response structures
      const responseData =
        response.data && response.data.data
          ? response.data.data
          : response.data;
      setApiResponse(responseData);

      // Reset form after successful submission
      setFormData({
        center_name: "",
        component: "",
        investment_name: "",
        sub_investment_name: "",
        unit: "",
        allocated_quantity: "",
        rate: "",
        source_of_receipt: "",
        scheme_name: "",
        vikas_khand_name: "",
        vidhan_sabha_name: "",
      });

      // Clear vikas khand data
      setVikasKhandData(null);

      // Add to table
      setAllBillingItems((prev) => [payload, ...prev]);
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
    if (!formData.center_name.trim())
      newErrors.center_name = `${translations.centerName} ${translations.required}`;
    if (!formData.component.trim())
      newErrors.component = `${translations.component} ${translations.required}`;
    if (!formData.investment_name.trim())
      newErrors.investment_name = `${translations.investmentName} ${translations.required}`;
    if (!formData.unit.trim())
      newErrors.unit = `${translations.unit} ${translations.required}`;
    if (!formData.allocated_quantity.trim())
      newErrors.allocated_quantity = `${translations.allocatedQuantity} ${translations.required}`;
    if (!formData.rate.trim())
      newErrors.rate = `${translations.rate} ${translations.required}`;
    if (!formData.source_of_receipt.trim())
      newErrors.source_of_receipt = `${translations.sourceOfReceipt} ${translations.required}`;
    if (!formData.scheme_name.trim())
      newErrors.scheme_name = `${translations.schemeName} ${translations.required}`;
    if (!formData.vikas_khand_name.trim())
      newErrors.vikas_khand_name = `${translations.vikasKhandName} ${translations.required}`;
    if (!formData.vidhan_sabha_name.trim())
      newErrors.vidhan_sabha_name = `${translations.vidhanSabhaName} ${translations.required}`;
    return newErrors;
  };

  return (
    <div className="dashboard-container">
      <Row>
        <Col lg={12} md={12} sm={12}>
          <DashBoardHeader />
        </Col>
      </Row>

      <Row className="left-top">
        <Col lg={2} md={2} sm={12}>
          <LeftNav />
        </Col>

        <Col lg={10} md={12} sm={10}>
          <Container fluid className="dashboard-body-main">
            <h1 className="page-title small-fonts">{translations.pageTitle}</h1>

            {/* Bulk Upload Section */}
            <Row className="mb-3">
              <Col xs={12} md={6}>
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
                  अनिवार्य फ़ील्ड: केंद्र का नाम, घटक, निवेश का नाम, इकाई,
                  आवंटित मात्रा, दर, प्राप्ति का स्रोत, योजना का नाम,उप-निवेश का
                  नाम, विकास खंड का नाम, विधानसभा का नाम
                </li>
                <li>आवंटित मात्रा और दर संख्यात्मक होने चाहिए</li>
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

            {/* Billing Form Section - Only show when center is selected */}
            {formData.center_name && (
              <Form
                onSubmit={handleSubmit}
                className="registration-form compact-form"
              >
                <Row>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="component">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.component}
                      </Form.Label>
                      <Form.Select
                        name="component"
                        value={formData.component}
                        onChange={handleChange}
                        isInvalid={!!errors.component}
                        className="compact-input"
                        disabled={isLoadingFilters}
                      >
                        <option value="">{translations.selectOption}</option>
                        {formOptions.component.map((comp, index) => (
                          <option key={index} value={comp}>
                            {comp}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.component}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="investment_name">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.investmentName}
                      </Form.Label>
                      <Form.Select
                        name="investment_name"
                        value={formData.investment_name}
                        onChange={handleChange}
                        isInvalid={!!errors.investment_name}
                        className="compact-input"
                        disabled={isLoadingFilters}
                      >
                        <option value="">{translations.selectOption}</option>
                        {formOptions.investment_name.map((inv, index) => (
                          <option key={index} value={inv}>
                            {inv}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.investment_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group
                      className="mb-2"
                      controlId="sub_investment_name"
                    >
                      <Form.Label className="small-fonts fw-bold">
                        {translations.subInvestmentName}
                      </Form.Label>
                      <Form.Select
                        name="sub_investment_name"
                        value={formData.sub_investment_name}
                        onChange={handleChange}
                        isInvalid={!!errors.sub_investment_name}
                        className="compact-input"
                        disabled={isLoadingFilters}
                      >
                        <option value="">{translations.selectOption}</option>
                        {filterOptions.sub_investment_name.map(
                          (subInv, index) => (
                            <option key={index} value={subInv}>
                              {subInv}
                            </option>
                          )
                        )}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.sub_investment_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="unit">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.unit}
                      </Form.Label>
                      <Form.Select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        isInvalid={!!errors.unit}
                        className="compact-input"
                        disabled={isLoadingFilters}
                      >
                        <option value="">{translations.selectOption}</option>
                        {filterOptions.unit.map((unit, index) => (
                          <option key={index} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.unit}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="allocated_quantity">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.allocatedQuantity}
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="allocated_quantity"
                        value={formData.allocated_quantity}
                        onChange={handleChange}
                        isInvalid={!!errors.allocated_quantity}
                        className="compact-input"
                        placeholder="आवंटित मात्रा दर्ज करें"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.allocated_quantity}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
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
                </Row>
                <Row>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="source_of_receipt">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.sourceOfReceipt}
                      </Form.Label>
                      <Form.Select
                        name="source_of_receipt"
                        value={formData.source_of_receipt}
                        onChange={handleChange}
                        isInvalid={!!errors.source_of_receipt}
                        className="compact-input"
                        disabled={isLoadingFilters}
                      >
                        <option value="">{translations.selectOption}</option>
                        {[
                          ...new Set([
                            ...filterOptions.source_of_receipt,
                            ...sourceOptions,
                          ]),
                        ].map((source, index) => (
                          <option key={index} value={source}>
                            {source}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.source_of_receipt}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="scheme_name">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.schemeName}
                      </Form.Label>
                      <Form.Select
                        name="scheme_name"
                        value={formData.scheme_name}
                        onChange={handleChange}
                        isInvalid={!!errors.scheme_name}
                        className="compact-input"
                        disabled={isLoadingFilters}
                      >
                        <option value="">{translations.selectOption}</option>
                        {[
                          ...new Set([
                            ...filterOptions.scheme_name,
                            ...schemeOptions,
                          ]),
                        ].map((scheme, index) => (
                          <option key={index} value={scheme}>
                            {scheme}
                          </option>
                        ))}
                      </Form.Select>
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
            {/* Table Section */}
            <div className="billing-table-section mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="small-fonts mb-0">बिलिंग आइटम डेटा</h3>
                <div className="d-flex align-items-center">
                  {billingItems.length > 0 && (
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
                  )}
                  {filteredItems.length > 0 && (
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
                              filteredItems,
                              `Billing_Items_${new Date()
                                .toISOString()
                                .slice(0, 10)}`,
                              billingTableColumnMapping,
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
                              filteredItems,
                              `Billing_Items_${new Date()
                                .toISOString()
                                .slice(0, 10)}`,
                              billingTableColumnMapping,
                              selectedColumns,
                              "बिलिंग आइटम डेटा"
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
              {filteredItems.length > 0 && (
                <div className="table-info mb-2 d-flex justify-content-between align-items-center">
                  <span className="small-fonts">
                    {translations.showing}{" "}
                    {(currentPage - 1) * itemsPerPage + 1} {translations.to}{" "}
                    {Math.min(currentPage * itemsPerPage, filteredItems.length)}{" "}
                    {translations.of} {filteredItems.length}{" "}
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
              {billingItems.length > 0 && (
                <ColumnSelection
                  columns={billingTableColumns}
                  selectedColumns={selectedColumns}
                  setSelectedColumns={setSelectedColumns}
                  title="कॉलम चुनें"
                />
              )}

              {/* Multi-Filter Section */}
              {billingItems.length > 0 && (
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
                          {translations.component}
                        </Form.Label>
                        <Select
                          isMulti
                          name="component"
                          value={filters.component.map((val) => ({
                            value: val,
                            label: val,
                          }))}
                          onChange={(selected) => {
                            setFilters((prev) => ({
                              ...prev,
                              component: selected
                                ? selected.map((s) => s.value)
                                : [],
                            }));
                          }}
                          options={filterOptions.component.map((option) => ({
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
                          {translations.investmentName}
                        </Form.Label>
                        <Select
                          isMulti
                          name="investment_name"
                          value={filters.investment_name.map((val) => ({
                            value: val,
                            label: val,
                          }))}
                          onChange={(selected) => {
                            setFilters((prev) => ({
                              ...prev,
                              investment_name: selected
                                ? selected.map((s) => s.value)
                                : [],
                            }));
                          }}
                          options={filterOptions.investment_name.map(
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
                          {translations.sourceOfReceipt}
                        </Form.Label>
                        <Select
                          isMulti
                          name="source_of_receipt"
                          value={filters.source_of_receipt.map((val) => ({
                            value: val,
                            label: val,
                          }))}
                          onChange={(selected) => {
                            setFilters((prev) => ({
                              ...prev,
                              source_of_receipt: selected
                                ? selected.map((s) => s.value)
                                : [],
                            }));
                          }}
                          options={[
                            ...new Set([
                              ...filterOptions.source_of_receipt,
                              ...sourceOptions,
                            ]),
                          ].map((option) => ({ value: option, label: option }))}
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
                          options={[
                            ...new Set([
                              ...filterOptions.scheme_name,
                              ...schemeOptions,
                            ]),
                          ].map((option) => ({
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
              ) : billingItems.length === 0 ? (
                <Alert variant="info" className="text-center">
                  कोई बिलिंग आइटम डेटा उपलब्ध नहीं है।
                </Alert>
              ) : (
                <>
                  <Table striped bordered hover className="registration-form">
                    <thead className="table-light">
                      <tr>
                        <th>क्र.सं.</th>
                        {selectedColumns.includes("center_name") && (
                          <th>{translations.centerName}</th>
                        )}
                        {selectedColumns.includes("component") && (
                          <th>{translations.component}</th>
                        )}
                        {selectedColumns.includes("investment_name") && (
                          <th>{translations.investmentName}</th>
                        )}
                        {selectedColumns.includes("sub_investment_name") && (
                          <th>{translations.subInvestmentName}</th>
                        )}
                        {selectedColumns.includes("unit") && (
                          <th>{translations.unit}</th>
                        )}
                        {selectedColumns.includes("allocated_quantity") && (
                          <th>{translations.allocatedQuantity}</th>
                        )}
                        {selectedColumns.includes("rate") && (
                          <th>{translations.rate}</th>
                        )}
                        {selectedColumns.includes("source_of_receipt") && (
                          <th>{translations.sourceOfReceipt}</th>
                        )}
                        {selectedColumns.includes("scheme_name") && (
                          <th>{translations.schemeName}</th>
                        )}
                        {selectedColumns.includes("vikas_khand_name") && (
                          <th>{translations.vikasKhandName}</th>
                        )}
                        {selectedColumns.includes("vidhan_sabha_name") && (
                          <th>{translations.vidhanSabhaName}</th>
                        )}
                        <th>कार्रवाई</th>
                      </tr>
                    </thead>
                    <tbody className="tbl-body">
                      {filteredItems
                        .slice(
                          (currentPage - 1) * itemsPerPage,
                          currentPage * itemsPerPage
                        )
                        .map((item, index) => (
                          <tr key={item.id || index}>
                            <td>
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            {selectedColumns.includes("center_name") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.center_name}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        center_name: value,
                                        vikas_khand_name: "",
                                        vidhan_sabha_name: "",
                                      }));
                                      if (value) {
                                        fetchVikasKhandData(value);
                                      }
                                    }}
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
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
                            {selectedColumns.includes("component") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.component}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        component: value,
                                        investment_name: "",
                                        sub_investment_name: "",
                                        unit: "",
                                      }));
                                      if (value) {
                                        fetchFormFilters(value);
                                      }
                                    }}
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {filterOptions.component.map(
                                      (comp, index) => (
                                        <option key={index} value={comp}>
                                          {comp}
                                        </option>
                                      )
                                    )}
                                  </Form.Select>
                                ) : (
                                  item.component
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("investment_name") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.investment_name}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        investment_name: value,
                                        sub_investment_name: "",
                                        unit: "",
                                      }));
                                      if (value) {
                                        fetchFormFilters("", value);
                                      }
                                    }}
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {filterOptions.investment_name.map(
                                      (inv, index) => (
                                        <option key={index} value={inv}>
                                          {inv}
                                        </option>
                                      )
                                    )}
                                  </Form.Select>
                                ) : (
                                  item.investment_name
                                )}
                              </td>
                            )}
                            {selectedColumns.includes(
                              "sub_investment_name"
                            ) && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.sub_investment_name}
                                    onChange={(e) =>
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        sub_investment_name: e.target.value,
                                      }))
                                    }
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {filterOptions.sub_investment_name.map(
                                      (subInv, index) => (
                                        <option key={index} value={subInv}>
                                          {subInv}
                                        </option>
                                      )
                                    )}
                                  </Form.Select>
                                ) : (
                                  item.sub_investment_name
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("unit") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.unit}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        unit: value,
                                      }));
                                    }}
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {formOptions.unit.map((unit, index) => (
                                      <option key={index} value={unit}>
                                        {unit}
                                      </option>
                                    ))}
                                  </Form.Select>
                                ) : (
                                  item.unit
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("allocated_quantity") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Control
                                    type="number"
                                    value={editingValues.allocated_quantity}
                                    onChange={(e) =>
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        allocated_quantity: e.target.value,
                                      }))
                                    }
                                    size="sm"
                                  />
                                ) : (
                                  item.allocated_quantity
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("rate") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={editingValues.rate}
                                    onChange={(e) =>
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        rate: e.target.value,
                                      }))
                                    }
                                    size="sm"
                                  />
                                ) : (
                                  item.rate
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("source_of_receipt") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.source_of_receipt}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        source_of_receipt: value,
                                      }));
                                    }}
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {[
                                      ...new Set([
                                        ...filterOptions.source_of_receipt,
                                        ...sourceOptions,
                                      ]),
                                    ].map((source, index) => (
                                      <option key={index} value={source}>
                                        {source}
                                      </option>
                                    ))}
                                  </Form.Select>
                                ) : (
                                  item.source_of_receipt
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("scheme_name") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.scheme_name}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        scheme_name: value,
                                      }));
                                    }}
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {[
                                      ...new Set([
                                        ...filterOptions.scheme_name,
                                        ...schemeOptions,
                                      ]),
                                    ].map((scheme, index) => (
                                      <option key={index} value={scheme}>
                                        {scheme}
                                      </option>
                                    ))}
                                  </Form.Select>
                                ) : (
                                  item.scheme_name
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("vikas_khand_name") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.vikas_khand_name}
                                    onChange={(e) =>
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        vikas_khand_name: e.target.value,
                                      }))
                                    }
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {filterOptions.vikas_khand_name.map(
                                      (vikas, index) => (
                                        <option key={index} value={vikas}>
                                          {vikas}
                                        </option>
                                      )
                                    )}
                                  </Form.Select>
                                ) : (
                                  item.vikas_khand_name
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("vidhan_sabha_name") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.vidhan_sabha_name}
                                    onChange={(e) =>
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        vidhan_sabha_name: e.target.value,
                                      }))
                                    }
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {filterOptions.vidhan_sabha_name.map(
                                      (vidhan, index) => (
                                        <option key={index} value={vidhan}>
                                          {vidhan}
                                        </option>
                                      )
                                    )}
                                  </Form.Select>
                                ) : (
                                  item.vidhan_sabha_name
                                )}
                              </td>
                            )}
                            <td>
                              {editingRowId === item.id ? (
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
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>

                  {/* Pagination controls */}
                  {filteredItems.length > itemsPerPage && (
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
    </div>
  );
};

export default Registration;
