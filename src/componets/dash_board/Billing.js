import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Spinner,
  Alert,
  Row,
  Col,
  Form,
  Button,
  FormGroup,
  FormLabel,
  Pagination,
} from "react-bootstrap";
import Select from "react-select";
import * as XLSX from "xlsx";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import Footer from "../footer/Footer";

// API URLs - separate for fetching and updating
const GET_API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/";
const UPDATE_API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/update-billing-item/";

// Custom styles for react-select components to match dashboard styling
const customSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
    "&:hover": {
      borderColor: "#3b82f6",
    },
    minHeight: "32px", // Smaller height for compact layout
    fontSize: "14px", // Match small-fonts
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    zIndex: 9999, // Ensure it's above all other elements
    position: "absolute", // Explicitly set position
    fontSize: "14px",
  }),
  menuList: (baseStyles) => ({
    ...baseStyles,
    maxHeight: "200px", // Show approximately 4-5 items before scrolling
    overflowY: "auto",
    fontSize: "14px",
  }),
  multiValue: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: "#e5e7eb",
  }),
  multiValueLabel: (baseStyles) => ({
    ...baseStyles,
    color: "#1f2937",
    fontSize: "12px",
  }),
  multiValueRemove: (baseStyles) => ({
    ...baseStyles,
    color: "#6b7280",
    "&:hover": {
      backgroundColor: "#d1d5db",
      color: "#1f2937",
    },
  }),
  placeholder: (baseStyles) => ({
    ...baseStyles,
    color: "#6b7280",
    fontSize: "14px",
  }),
};

  // Hindi translations
const translations = {
  dashboard: "डैशबोर्ड",
  billingItems: "बिलिंग आइटम्स",
  filters: "फिल्टर",
  clearAllFilters: "सभी फिल्टर हटाएं",
  centerName: "केंद्र का नाम",
  nivesh: "निवेश",
  subniveshName: "उप-निवेश का नाम",
  unit: "इकाई",
  sourceOfReceipt: "सप्लायर",
  allocatedQuantity: "आवंटित मात्रा",
  rate: "दर",
  sno: "क्र.सं.",
  id: "आईडी",
  loading: "लोड हो रहा है...",
  noItemsFound: "कोई बिलिंग आइटम नहीं मिला।",
  noMatchingItems: "चयनित फिल्टर से मेल खाने वाली कोई आइटम नहीं मिली।",
  noDataAvailable: "कोई बिलिंग आइटम डेटा उपलब्ध नहीं है।",
  showing: "दिखा रहे हैं",
  to: "से",
  of: "का",
  entries: "प्रविष्टियां",
  page: "पृष्ठ",
  previous: "पिछला",
  next: "अगला",
  itemsPerPage: "प्रति पृष्ठ आइटम:",
  allCenters: "सभी केंद्र",
  allNivesh: "सभी निवेश",
  allSubnivesh: "सभी उप-निवेश",
  allUnits: "सभी इकाइयां",
  allSources: "सभी स्रोत",
  allSchemes: "सभी योजनाएं",
  schemeName: "योजना का नाम",
  selectSourceFirst: "पहले स्रोत चुनें",
  selectCenterFirst: "पहले केंद्र चुनें",
  selectNiveshFirst: "पहले निवेश चुनें",
  selectSubniveshFirst: "पहले उप-निवेश चुनें",
  selectUnitFirst: "पहले इकाई चुनें",
  fetchError: "डेटा लाने में विफल। कृपया बाद में पुन: प्रयास करें।",
  networkError: "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।",
  serverError: "सर्वर त्रुटि। कृपया बाद में पुन: प्रयास करें।",
  dataError: "डेटा प्रोसेस करने में त्रुटि।",
  retry: "पुनः प्रयास करें",
  filterSeparator: " > ",
  billId: "बिल संख्या",
  updatedQuantity: "अपडेट की गई मात्रा",
  cutQuantity: "कटी हुई मात्रा",
  quantityLeft: "शेष मात्रा",
  submitUpdates: "अपडेट सबमिट करें",
  billing: "बिलिंग",
  billingDataUpdated: "बिलिंग डेटा सफलतापूर्वक अपडेट किया गया!",
  error: "त्रुटि",
  noItemsUpdated: "कोई आइटम अपडेट नहीं की गई।",
  cannotCutMore: "आइटम के लिए उपलब्ध मात्रा से अधिक नहीं काटा जा सकता",
  // New translations for the modified columns
  soldRashi: "बेची राशि",
  allotedRashi: "आवंटित राशि",
  totalBill: "कुल बिल", // New translation for total bill column
  billingDate: "बिलिंग तारीख", // New translation for billing date column
  selectColumns: "कॉलम चुनें",
  for: "के लिए",
  // Date range filter translations
  fromDate: "तारीख से (कब से)",
  toDate: "तारीख तक (कब तक)",
  selectDateRange: "तारीख की सीमा चुनें",
  pleaseSelectDateRange: "कृपया तारीख की सीमा चुनें ताकि डेटा दिखाई दे",
};

// Available columns for download
const availableColumns = [
  { key: "sno", label: "क्र.सं." },
  { key: "center_name", label: translations.centerName },
  { key: "source_of_receipt", label: translations.sourceOfReceipt },
  { key: "nivesh", label: translations.nivesh },
  { key: "subnivesh_name", label: translations.subniveshName },
  { key: "scheme_name", label: translations.schemeName },
  { key: "unit", label: translations.unit },
  { key: "allocated_quantity", label: translations.allocatedQuantity },
  { key: "updated_quantity", label: translations.updatedQuantity },
  { key: "quantity_left", label: translations.quantityLeft },
  { key: "alloted_rashi", label: translations.allotedRashi },
  { key: "sold_rashi", label: translations.soldRashi },
  { key: "cut_quantity", label: translations.cutQuantity },
  { key: "rate", label: translations.rate },
  { key: "total_bill", label: translations.totalBill },
  { key: "billing_date", label: translations.billingDate },
];

const Billing = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for API data, loading, and errors
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for user ID mapping from source of receipt
  const [sourceUserMap, setSourceUserMap] = useState({});

  // State for tracking which items have been modified
  const [modifiedItems, setModifiedItems] = useState({});

  // State for selected columns for download
  const [selectedColumns, setSelectedColumns] = useState(
    availableColumns.map((col) => col.key)
  );

  // State for form submission
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // State for filtering with multi-select for all fields
  const [filters, setFilters] = useState({
    center_name: [], // Multi-select
    source_of_receipt: [], // Multi-select
    nivesh: [], // Multi-select
    subnivesh_name: [], // Multi-select
    scheme_name: [], // Multi-select
  });

  // State for date range filter
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Column mapping for data access
  const columnMapping = {
    sno: {
      header: "क्र.सं.",
      accessor: (item, index, currentPage, itemsPerPage) =>
        (currentPage - 1) * itemsPerPage + index + 1,
    },
    center_name: {
      header: translations.centerName,
      accessor: (item) => item.center_name,
    },
    source_of_receipt: {
      header: translations.sourceOfReceipt,
      accessor: (item) => item.source_of_receipt,
    },
    nivesh: {
      header: translations.nivesh,
      accessor: (item) => item.investment_name, // Using investment_name from API
    },
    subnivesh_name: {
      header: translations.subniveshName,
      accessor: (item) => item.sub_investment_name, // Using sub_investment_name from API
    },
    scheme_name: {
      header: translations.schemeName,
      accessor: (item) => item.scheme_name,
    },
    unit: { header: translations.unit, accessor: (item) => item.unit },
    allocated_quantity: {
      header: translations.allocatedQuantity,
      accessor: (item) => item.allocated_quantity,
    },
    updated_quantity: {
      header: translations.updatedQuantity,
      accessor: (item) => item.updated_quantity,
    },
    quantity_left: {
      header: translations.quantityLeft,
      accessor: (item) =>
        calculateQuantityLeft(
          item.allocated_quantity,
          item.updated_quantity,
          item.cut_quantity
        ),
    },
    alloted_rashi: {
      header: translations.allotedRashi,
      accessor: (item) =>
        calculateAllocatedAmount(item.allocated_quantity, item.rate),
    },
    sold_rashi: {
      header: translations.soldRashi,
      accessor: (item) => calculateAmount(item.updated_quantity, item.rate),
    },
    cut_quantity: {
      header: translations.cutQuantity,
      accessor: (item) => item.cut_quantity,
    },
    rate: { header: translations.rate, accessor: (item) => item.rate },
    total_bill: {
      header: translations.totalBill,
      accessor: (item) => calculateTotalBill(item.cut_quantity, item.rate),
    },
    billing_date: {
      header: translations.billingDate,
      accessor: (item) => item.billing_date,
    },
  };

  // useEffect for fetching data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(GET_API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Create a mapping of source_of_receipt to user_id
        const sourceMapping = {};
        data.forEach((item) => {
          if (item.source_of_receipt && item.user_id) {
            sourceMapping[item.source_of_receipt] = item.user_id;
          }
        });
        setSourceUserMap(sourceMapping);

        // Initialize cut_quantity and billing_date for each item
        // Set billing_date as empty string to prevent default selection
        // Users should manually select billing date when needed
        const initializedData = data.map((item) => {
          return {
            ...item,
            cut_quantity: "",
            billing_date: "", // Always start with empty billing date
            bill_report_id: "",
          };
        });
        setBillingData(initializedData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, fromDate, toDate]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!billingData || billingData.length === 0) {
      return {
        center_name: [],
        source_of_receipt: [],
        nivesh: [],
        subnivesh_name: [],
        scheme_name: [],
      };
    }

    return {
      center_name: [
        { value: "select_all", label: "सभी चुनें" },
        ...[...new Set(billingData.map((item) => item.center_name))].map(
          (name) => ({ value: name, label: name })
        ),
      ],
      source_of_receipt: [
        { value: "select_all", label: "सभी चुनें" },
        ...[...new Set(billingData.map((item) => item.source_of_receipt))].map(
          (name) => ({ value: name, label: name })
        ),
      ],
      nivesh: [
        { value: "select_all", label: "सभी चुनें" },
        ...[...new Set(billingData.map((item) => item.investment_name))].map(
          (name) => ({ value: name, label: name })
        ),
      ],
      subnivesh_name: [
        { value: "select_all", label: "सभी चुनें" },
        ...[...new Set(billingData.map((item) => item.sub_investment_name))].map(
          (name) => ({ value: name, label: name })
        ),
      ],
      scheme_name: [
        { value: "select_all", label: "सभी चुनें" },
        ...[...new Set(billingData.map((item) => item.scheme_name))].map(
          (name) => ({ value: name, label: name })
        ),
      ],
    };
  }, [billingData]);

  // Filter data based on selected filters and date range
  const filteredData = useMemo(() => {
    return billingData.filter((item) => {
      const matchesCenter =
        filters.center_name.length === 0 ||
        filters.center_name.some((c) => c.value === item.center_name);
      const matchesSource =
        filters.source_of_receipt.length === 0 ||
        filters.source_of_receipt.some(
          (s) => s.value === item.source_of_receipt
        );
      const matchesScheme =
        filters.scheme_name.length === 0 ||
        filters.scheme_name.some((scheme) => scheme.value === item.scheme_name);
      const matchesNivesh =
        filters.nivesh.length === 0 ||
        filters.nivesh.some((n) => n.value === item.investment_name);
      const matchesSubnivesh =
        filters.subnivesh_name.length === 0 ||
        filters.subnivesh_name.some(
          (sub) => sub.value === item.sub_investment_name
        );

      // Date range filter
      let matchesDateRange = true;
      if (fromDate || toDate) {
        const itemDate = item.bill_date ? new Date(item.bill_date) : null;
        if (itemDate && !isNaN(itemDate.getTime())) {
          if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            if (itemDate < from) {
              matchesDateRange = false;
            }
          }
          if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            if (itemDate > to) {
              matchesDateRange = false;
            }
          }
        } else {
          // If item doesn't have a valid bill_date, exclude it when date filter is applied
          matchesDateRange = false;
        }
      }

      return (
        matchesCenter &&
        matchesSource &&
        matchesScheme &&
        matchesNivesh &&
        matchesSubnivesh &&
        matchesDateRange
      );
    });
  }, [billingData, filters, fromDate, toDate]);

  // Calculate paginated data based on filtered data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedBillingData = filteredData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);

  // Convert table data to Excel format and download
  const downloadExcel = (data, filename) => {
    try {
      // Prepare data for Excel export based on selected columns
      const excelData = data.map((item, index) => {
        const row = {};
        selectedColumns.forEach((col) => {
          row[columnMapping[col].header] = columnMapping[col].accessor(
            item,
            index,
            currentPage,
            itemsPerPage
          );
        });
        return row;
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "BillingItems");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
      console.error("Error generating Excel file:", e);
    }
  };

  // Convert table data to PDF format and download
  const downloadPdf = (data, filename) => {
    try {
      // Create headers and rows based on selected columns
      const headers = selectedColumns
        .map((col) => `<th>${columnMapping[col].header}</th>`)
        .join("");
      const rows = data
        .map((item, index) => {
          const cells = selectedColumns
            .map(
              (col) =>
                `<td>${columnMapping[col].accessor(
                  item,
                  index,
                  currentPage,
                  itemsPerPage
                )}</td>`
            )
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");

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
            <h2>${translations.billingItems}</h2>
            <table>
              <tr>${headers}</tr>
              ${rows}
            </table>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      printWindow.document.write(tableHtml);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } catch (e) {
      console.error("Error generating PDF:", e);
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    if (value && value.some((v) => v.value === "select_all")) {
      // Select all options except 'select_all'
      const allOptions = filterOptions[filterName].filter(
        (opt) => opt.value !== "select_all"
      );
      setFilters((prev) => ({
        ...prev,
        [filterName]: allOptions,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [filterName]: value,
      }));
    }
  };

  // Handle cut quantity change
  const handleCutQuantityChange = (id, value) => {
    // Ensure value is a non-negative number
    const numValue = Math.max(0, parseFloat(value) || 0);

    // Get the item to check allocated quantity
    const item = billingData.find((item) => item.id === id);
    const allocatedNum = parseFloat(item.allocated_quantity) || 0;
    const updatedNum = parseFloat(item.updated_quantity) || 0;

    // Calculate the maximum allowed cut quantity
    const maxCut = allocatedNum - updatedNum;

    // Validate that the cut quantity doesn't exceed the available quantity
    if (numValue > maxCut) {
      setSubmitError(
        `${translations.cannotCutMore} (${maxCut}) ${translations.for} ${item.bill_id}`
      );
      return;
    }

    setBillingData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, cut_quantity: numValue } : item
      )
    );

    // Track that this item has been modified
    setModifiedItems((prev) => ({ ...prev, [id]: true }));
  };

  // Handle billing date change
  const handleBillingDateChange = (id, value) => {
    // Ensure the date is in YYYY-MM-DD format
    let formattedDate = value;
    if (value && value.length > 0) {
      // If the value is already in YYYY-MM-DD format, keep it
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        formattedDate = value;
      } else {
        // Try to parse and format the date
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split("T")[0];
        }
      }
    }

    setBillingData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, billing_date: formattedDate } : item
      )
    );

    // Track that this item has been modified
    setModifiedItems((prev) => ({ ...prev, [id]: true }));
  };

  // Handle bill_report_id change
  const handleBillReportIdChange = (id, value) => {
    const trimmed = value ? value.toString().trim() : "";
    setBillingData((prevData) =>
      prevData.map((item) => (item.id === id ? { ...item, bill_report_id: trimmed } : item))
    );

    // Track that this item has been modified
    setModifiedItems((prev) => ({ ...prev, [id]: true }));
  };

  // Calculate quantity left
  const calculateQuantityLeft = (allocated, updated, cut) => {
    const allocatedNum = parseFloat(allocated) || 0;
    const updatedNum = parseFloat(updated) || 0;
    const cutNum = parseFloat(cut) || 0;
    return (allocatedNum - updatedNum - cutNum).toFixed(2);
  };

  // Calculate amount
  const calculateAmount = (quantity, rate) => {
    const qty = parseFloat(quantity) || 0;
    const r = parseFloat(rate) || 0;
    return (qty * r).toFixed(2);
  };

  // Calculate allocated amount (allocated quantity * rate)
  const calculateAllocatedAmount = (allocatedQuantity, rate) => {
    const qty = parseFloat(allocatedQuantity) || 0;
    const r = parseFloat(rate) || 0;
    return (qty * r).toFixed(2);
  };

  // Calculate total bill (cut quantity * rate)
  const calculateTotalBill = (cutQuantity, rate) => {
    const qty = parseFloat(cutQuantity) || 0;
    const r = parseFloat(rate) || 0;
    return (qty * r).toFixed(2);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get only the items that have been modified
    const updatedItems = billingData.filter(
      (item) => modifiedItems[item.id] && item.cut_quantity > 0
    );

    if (updatedItems.length === 0) {
      setSubmitError(translations.noItemsUpdated);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // Check if all items have billing dates selected
      const itemsWithoutDate = updatedItems.filter(
        (item) => !item.billing_date
      );
      if (itemsWithoutDate.length > 0) {
        setSubmitError(
          `Please select billing date for all items. Missing dates for ${itemsWithoutDate.length} item(s).`
        );
        return;
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const itemsWithInvalidDate = updatedItems.filter(
        (item) => !dateRegex.test(item.billing_date)
      );
      if (itemsWithInvalidDate.length > 0) {
        setSubmitError(
          `Invalid date format found. All dates must be in YYYY-MM-DD format. Please check ${itemsWithInvalidDate.length} item(s).`
        );
        return;
      }

      // Group items by center_id and billing_date (send center_id instead of user_id)
      const itemsByCenterAndDate = {};
      updatedItems.forEach((item) => {
        const centerId = item.center_id;
        const billingDate = item.billing_date;

        if (!centerId) {
          console.warn(`No center_id found for item id: ${item.id}`);
          return;
        }

        // Create composite key for center_id + billing_date
        const compositeKey = `${centerId}_${billingDate}`;

        if (!itemsByCenterAndDate[compositeKey]) {
          itemsByCenterAndDate[compositeKey] = {
            center_id: centerId,
            billing_date: billingDate,
            bill_report_id: item.bill_report_id || "",
            items: [],
          };
        }
        itemsByCenterAndDate[compositeKey].items.push(item);
      });

      // Ensure bill_report_id is provided for all updated items
      const itemsWithoutReportId = updatedItems.filter(
        (item) => !item.bill_report_id || item.bill_report_id.toString().trim() === ""
      );
      if (itemsWithoutReportId.length > 0) {
        setSubmitError(
          `Please enter Bill Report ID for all modified items. Missing for ${itemsWithoutReportId.length} item(s).`
        );
        return;
      }

      // Create separate payloads for each center and billing date combination
      const payloads = Object.keys(itemsByCenterAndDate).map((compositeKey) => {
        const group = itemsByCenterAndDate[compositeKey];
        const multiple_bills = group.items.map((item) => {
          const existingUpdated = parseFloat(item.updated_quantity) || 0;
          const newCut = parseFloat(item.cut_quantity) || 0;
          const totalUpdated = (existingUpdated + newCut).toString();
          return [item.bill_id, totalUpdated];
        });

        return {
          bill_report_id: group.bill_report_id || "",
          center_id: group.center_id,
          billing_date: group.billing_date,
          multiple_bills: multiple_bills,
        };
      });

      // Log the payloads for debugging
      console.log(
        "Submitting payloads:",
        JSON.stringify({ data: payloads }, null, 2)
      );

      // Send POST request with the array of billing data
      const response = await fetch(UPDATE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ data: payloads }),
      });

      // Try to get response text for debugging
      let responseText;
      try {
        responseText = await response.text();
        console.log("Response text:", responseText);
      } catch (e) {
        console.error("Error reading response text:", e);
      }

      // Try to parse as JSON if possible
      let responseData;
      try {
        if (responseText) {
          responseData = JSON.parse(responseText);
          console.log("Parsed response data:", responseData);
        }
      } catch (e) {
        console.error("Error parsing response as JSON:", e);
      }

      if (!response.ok) {
        // Log more details about the failed request
        console.error("Request failed with status:", response.status);
        console.error("Status text:", response.statusText);
        console.error("Response body:", responseText);

        // Create a more detailed error message
        const errorMessage =
          responseData?.message ||
          responseData?.error ||
          `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      setSubmitSuccess(true);
      // Clear modified items after successful submission
      setModifiedItems({});

      // Refresh data from the GET API
      const refreshResponse = await fetch(GET_API_URL);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();

        // Update the source user mapping with new data
        const sourceMapping = {};
        data.forEach((item) => {
          if (item.source_of_receipt && item.user_id) {
            sourceMapping[item.source_of_receipt] = item.user_id;
          }
        });
        setSourceUserMap(sourceMapping);

        // Initialize cut_quantity and billing_date for each item
        // Set billing_date as empty string to prevent default selection
        // Users should manually select billing date when needed
        const initializedData = data.map((item) => {
          return {
            ...item,
            cut_quantity: "",
            billing_date: "", // Always start with empty billing date
          };
        });
        setBillingData(initializedData);
      }
    } catch (e) {
      console.error("Submit error:", e);
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      center_name: [],
      source_of_receipt: [],
      nivesh: [],
      subnivesh_name: [],
      scheme_name: [],
    });
    setFromDate("");
    setToDate("");
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
    paginationItems.push(
      <Pagination.Item
        key={totalPages}
        onClick={() => handlePageChange(totalPages)}
      >
        {totalPages}
      </Pagination.Item>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <div className="dashboard-container">
        <LeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />
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
        <LeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />
        <div className="main-content">
          <Container fluid className="dashboard-body">
            <Alert variant="danger">
              {translations.error}: {error}
            </Alert>
          </Container>
        </div>
      </div>
    );
  }

  // Get the current user_id based on selected source
  const currentUserId =
    filters.source_of_receipt.length > 0
      ? sourceUserMap[filters.source_of_receipt[0].value] || "Not available"
      : "Select a source to see user ID";

  return (
    <>
      <div>
        <Container fluid className="p-4">
          <Row>
            <Col lg={12} md={12} sm={12}>
              <DashBoardHeader />
            </Col>
          </Row>

          <Row className="left-top">
            <Col lg={12} md={12} sm={10}>
              <Container fluid className="dashboard-body-main bg-home">
                <h1 className="page-title small-fonts">{translations.billing}</h1>

                {submitSuccess && (
                  <Alert
                    variant="success"
                    dismissible
                    onClose={() => setSubmitSuccess(false)}
                  >
                    {translations.billingDataUpdated}
                  </Alert>
                )}

                {submitError && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setSubmitError(null)}
                  >
                    {translations.error}: {submitError}
                  </Alert>
                )}

                {/* Filters Section */}
                <div className="filter-section mb-4 p-3 border rounded bg-light">
                  <Row className="mb-3">
                    <Col
                      md={12}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <h5 className="mb-0 small-fonts">{translations.filters}</h5>
                      {(filters.center_name.length > 0 ||
                        filters.source_of_receipt.length > 0 ||
                        filters.nivesh.length > 0 ||
                        filters.subnivesh_name.length > 0 ||
                        filters.scheme_name.length > 0 ||
                        fromDate ||
                        toDate) && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={clearFilters}
                          className="small-fonts"
                        >
                          {translations.clearAllFilters}
                        </Button>
                      )}
                    </Col>
                  </Row>

                  <Row>
                    {/* Date Range Filters */}
                    <Col xs={12} sm={6} md={3} className="mb-2">
                      <FormGroup>
                        <FormLabel className="small-fonts fw-bold">
                          {translations.fromDate}
                        </FormLabel>
                        <Form.Control
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="small-fonts compact-input"
                        />
                      </FormGroup>
                    </Col>

                    <Col xs={12} sm={6} md={3} className="mb-2">
                      <FormGroup>
                        <FormLabel className="small-fonts fw-bold">
                          {translations.toDate}
                        </FormLabel>
                        <Form.Control
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="small-fonts compact-input"
                        />
                      </FormGroup>
                    </Col>
                    <Col xs={12} sm={6} md={3} className="mb-2">
                      <FormGroup>
                        <FormLabel className="small-fonts fw-bold">
                          {translations.centerName}
                        </FormLabel>
                        <Select
                          value={filters.center_name}
                          onChange={(value) =>
                            handleFilterChange("center_name", value)
                          }
                          options={filterOptions.center_name}
                          isMulti={true}
                          isClearable={true}
                          placeholder={translations.allCenters}
                          styles={customSelectStyles}
                          className="compact-input small-fonts filter-dropdown"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      </FormGroup>
                    </Col>

                    <Col xs={12} sm={6} md={3} className="mb-2">
                      <FormGroup>
                        <FormLabel className="small-fonts fw-bold">
                          {translations.sourceOfReceipt}
                        </FormLabel>
                        <Select
                          value={filters.source_of_receipt}
                          onChange={(value) =>
                            handleFilterChange("source_of_receipt", value)
                          }
                          options={filterOptions.source_of_receipt}
                          isMulti={true}
                          isClearable={true}
                          placeholder={translations.allSources}
                          styles={customSelectStyles}
                          className="compact-input small-fonts filter-dropdown"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      </FormGroup>
                    </Col>

                    <Col xs={12} sm={6} md={3} className="mb-2">
                      <FormGroup>
                        <FormLabel className="small-fonts fw-bold">
                          {translations.schemeName}
                        </FormLabel>
                        <Select
                          value={filters.scheme_name}
                          onChange={(value) =>
                            handleFilterChange("scheme_name", value)
                          }
                          options={filterOptions.scheme_name}
                          isClearable={true}
                          isMulti={true}
                          placeholder={translations.allSchemes}
                          styles={customSelectStyles}
                          className="compact-input small-fonts filter-dropdown"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      </FormGroup>
                    </Col>

                    <Col xs={12} sm={6} md={3} className="mb-2">
                      <FormGroup>
                        <FormLabel className="small-fonts fw-bold">
                          {translations.nivesh}
                        </FormLabel>
                        <Select
                          value={filters.nivesh}
                          onChange={(value) =>
                            handleFilterChange("nivesh", value)
                          }
                          options={filterOptions.nivesh}
                          isClearable={true}
                          isMulti={true}
                          placeholder={translations.allNivesh}
                          styles={customSelectStyles}
                          className="compact-input small-fonts filter-dropdown"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col xs={12} sm={6} md={3} className="mb-2">
                      <FormGroup>
                        <FormLabel className="small-fonts fw-bold">
                          {translations.subniveshName}
                        </FormLabel>
                        <Select
                          value={filters.subnivesh_name}
                          onChange={(value) =>
                            handleFilterChange("subnivesh_name", value)
                          }
                          options={filterOptions.subnivesh_name}
                          isClearable={true}
                          isMulti={true}
                          placeholder={translations.allSubnivesh}
                          styles={customSelectStyles}
                          className="compact-input small-fonts filter-dropdown"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      </FormGroup>
                    </Col>

                    
                  </Row>
                </div>
                <div>
                  <Form onSubmit={handleSubmit}>
                    <div className="billing-table-container">
                      <Row className="mt-3">
                        <div className="col-md-12">
                          <div className="table-wrapper">
                            {/* Show message if no date range is selected */}
                            {!fromDate && !toDate ? (
                              <Alert variant="info" className="text-center">
                                <h5>{translations.selectDateRange}</h5>
                                <p className="mb-0">{translations.pleaseSelectDateRange}</p>
                              </Alert>
                            ) : filteredData.length > 0 ? (
                              <>
                                <div className="d-flex justify-content-end mb-2">
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() =>
                                      downloadExcel(
                                        filteredData,
                                        `BillingItems_${
                                          new Date().toISOString().split("T")[0]
                                        }`
                                      )
                                    }
                                    className="me-2"
                                  >
                                    <FaFileExcel className="me-1" />
                                    Excel
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() =>
                                      downloadPdf(
                                        filteredData,
                                        `BillingItems_${
                                          new Date().toISOString().split("T")[0]
                                        }`
                                      )
                                    }
                                  >
                                    <FaFilePdf className="me-1" />
                                    PDF
                                  </Button>
                                </div>
                                <div className="table-info mb-2 d-flex justify-content-between align-items-center">
                                  <span className="small-fonts">
                                    {translations.showing} {indexOfFirstItem + 1}{" "}
                                    {translations.to}{" "}
                                    {Math.min(indexOfLastItem, filteredData.length)}{" "}
                                    {translations.of} {filteredData.length}{" "}
                                    {translations.entries}
                                  </span>
                                  <div className="d-flex align-items-center">
                                    <span className="small-fonts me-2">
                                      {translations.itemsPerPage}
                                    </span>
                                    <span className="badge bg-primary">
                                      {itemsPerPage}
                                    </span>
                                  </div>
                                </div>

                                {/* Column Selection Section */}
                                <div className="column-selection mb-3 p-3 border rounded bg-light">
                                  <h6 className="small-fonts mb-3">
                                    {translations.selectColumns}
                                  </h6>
                                  <Row>
                                    <Col>
                                      <div className="d-flex flex-wrap">
                                        {availableColumns.map((col) => (
                                          <div
                                            key={col.key}
                                            className="form-check me-3 mb-2"
                                          >
                                            <input
                                              type="checkbox"
                                              id={`col-${col.key}`}
                                              checked={selectedColumns.includes(
                                                col.key
                                              )}
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  setSelectedColumns([
                                                    ...selectedColumns,
                                                    col.key,
                                                  ]);
                                                } else {
                                                  setSelectedColumns(
                                                    selectedColumns.filter(
                                                      (c) => c !== col.key
                                                    )
                                                  );
                                                }
                                              }}
                                              className="form-check-input"
                                            />
                                            <label
                                              className="form-check-label small-fonts ms-1"
                                              htmlFor={`col-${col.key}`}
                                            >
                                              {col.label}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                    </Col>
                                  </Row>
                                </div>

                                <table className="responsive-table small-fonts">
                                  <thead>
                                    <tr>
                                      <th>{translations.sno}</th>
                                      <th>{translations.centerName}</th>
                                      <th>{translations.sourceOfReceipt}</th>
                                      <th>{translations.nivesh}</th>
                                      <th>{translations.subniveshName}</th>
                                      <th>{translations.schemeName}</th>
                                      <th>{translations.unit}</th>
                                      <th>{translations.allocatedQuantity}</th>
                                      <th>{translations.updatedQuantity}</th>
                                      <th>{translations.quantityLeft}</th>
                                      <th>{translations.allotedRashi}</th>
                                      <th>{translations.soldRashi}</th>
                                      <th>{translations.cutQuantity}</th>
                                      <th>{translations.rate}</th>
                                      <th>{translations.totalBill}</th>
                                      <th>{translations.billId}</th>
                                      <th>{translations.billingDate}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {paginatedBillingData.map((item, index) => {
                                      const allocatedAmount =
                                        calculateAllocatedAmount(
                                          item.allocated_quantity,
                                          item.rate
                                        );
                                      const soldAmount = calculateAmount(
                                        item.updated_quantity,
                                        item.rate
                                      );
                                      const quantityLeft = calculateQuantityLeft(
                                        item.allocated_quantity,
                                        item.updated_quantity,
                                        item.cut_quantity
                                      );
                                      const maxCut =
                                        (parseFloat(item.allocated_quantity) || 0) -
                                        (parseFloat(item.updated_quantity) || 0);
                                      const totalBill = calculateTotalBill(
                                        item.cut_quantity,
                                        item.rate
                                      );

                                      return (
                                        <tr key={item.id}>
                                          <td data-label={translations.sno}>
                                            {indexOfFirstItem + index + 1}
                                          </td>
                                          <td data-label={translations.centerName}>
                                            {item.center_name}
                                          </td>
                                          <td
                                            data-label={
                                              translations.sourceOfReceipt
                                            }
                                          >
                                            {item.source_of_receipt}
                                          </td>
                                          <td data-label={translations.nivesh}>
                                            {item.investment_name}
                                          </td>
                                          <td
                                            data-label={translations.subniveshName}
                                          >
                                            {item.sub_investment_name}
                                          </td>
                                          <td data-label={translations.schemeName}>
                                            {item.scheme_name}
                                          </td>
                                          <td data-label={translations.unit}>
                                            {item.unit}
                                          </td>
                                          <td
                                            data-label={
                                              translations.allocatedQuantity
                                            }
                                          >
                                            {item.allocated_quantity}
                                          </td>
                                          <td
                                            data-label={
                                              translations.updatedQuantity
                                            }
                                          >
                                            {item.updated_quantity}
                                          </td>
                                          <td
                                            data-label={translations.quantityLeft}
                                          >
                                            {quantityLeft}
                                          </td>
                                          <td
                                            data-label={translations.allotedRashi}
                                          >
                                            {allocatedAmount}
                                          </td>
                                          <td data-label={translations.soldRashi}>
                                            {soldAmount}
                                          </td>
                                          <td data-label={translations.cutQuantity}>
                                            <Form.Control
                                              type="number"
                                              min="0"
                                              max={maxCut}
                                              step="0.01"
                                              value={item.cut_quantity || ""}
                                              onChange={(e) =>
                                                handleCutQuantityChange(
                                                  item.id,
                                                  e.target.value
                                                )
                                              }
                                              className={`small-fonts ${
                                                modifiedItems[item.id]
                                                  ? "border-warning"
                                                  : ""
                                              }`}
                                            />
                                          </td>
                                          <td data-label={translations.rate}>
                                            {item.rate}
                                          </td>
                                          <td data-label={translations.totalBill}>
                                            <Form.Control
                                              type="text"
                                              value={totalBill}
                                              disabled
                                              className="bg-light small-fonts"
                                            />
                                          </td>
                                          <td data-label={translations.billId}>
                                            <Form.Control
                                              type="text"
                                              value={item.bill_report_id || ""}
                                              onChange={(e) =>
                                                handleBillReportIdChange(
                                                  item.id,
                                                  e.target.value
                                                )
                                              }
                                              className={`small-fonts ${
                                                modifiedItems[item.id]
                                                  ? "border-warning"
                                                  : ""
                                              }`}
                                            />
                                          </td>
                                          <td data-label={translations.billingDate}>
                                            <Form.Control
                                              type="date"
                                              value={item.billing_date || ""}
                                              onChange={(e) =>
                                                handleBillingDateChange(
                                                  item.id,
                                                  e.target.value
                                                )
                                              }
                                              className={`small-fonts ${
                                                modifiedItems[item.id]
                                                  ? "border-warning"
                                                  : ""
                                              }`}
                                            />
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>

                                {totalPages > 1 && (
                                  <div className="mt-2">
                                    <div className="small-fonts mb-3 text-center">
                                      {translations.page} {currentPage}{" "}
                                      {translations.of} {totalPages}
                                    </div>
                                    <Pagination className="d-flex justify-content-center">
                                      <Pagination.Prev
                                        disabled={currentPage === 1}
                                        onClick={() =>
                                          handlePageChange(currentPage - 1)
                                        }
                                      />
                                      {paginationItems}
                                      <Pagination.Next
                                        disabled={currentPage === totalPages}
                                        onClick={() =>
                                          handlePageChange(currentPage + 1)
                                        }
                                      />
                                    </Pagination>
                                  </div>
                                )}
                              </>
                            ) : fromDate || toDate ? (
                              <Alert variant="info">
                                {translations.noMatchingItems}
                              </Alert>
                            ) : null}
                          </div>
                        </div>
                      </Row>

                      <div className="d-flex justify-content-end mt-3">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={
                            submitting || Object.keys(modifiedItems).length === 0
                          }
                        >
                          {submitting ? (
                            <Spinner as="span" animation="border" size="sm" />
                          ) : null}
                          {translations.submitUpdates}
                        </Button>
                      </div>
                    </div>
                  </Form>
                </div>
              </Container>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Billing;