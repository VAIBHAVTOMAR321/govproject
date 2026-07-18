import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Container,
  Spinner,
  Alert,
  Row,
  Col,
  Button,
  FormGroup,
  FormLabel,
  Form,
  FormCheck,
  Collapse,
  Badge,
  Pagination,
  ProgressBar,
  Modal,
} from "react-bootstrap";
import Select from "react-select";
import * as XLSX from "xlsx";
import { FaDownload } from "react-icons/fa";
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import Footer from "../footer/Footer";

// API URLs
const GET_REPORTS_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/report-billing-items/";
const UPDATE_REPORT_STATUS_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/update-billing-item/";
const UPDATE_BILLING_REPORT_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/billing-report/update/";
const BASE_URL = "https://mahadevaaya.com/govbillingsystem/backend";

// Custom styles for react-select components
const customSelectStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
    "&:hover": { borderColor: "#3b82f6" },
    minHeight: "32px",
    fontSize: "14px",
  }),
  menu: (baseStyles) => ({
    ...baseStyles,
    zIndex: 9999,
    position: "absolute",
    fontSize: "14px",
  }),
  menuList: (baseStyles) => ({
    ...baseStyles,
    maxHeight: "200px",
    overflowY: "auto",
    fontSize: "14px",
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
  allBills: "सभी बिल रिपोर्ट",
  filters: "फिल्टर",
  clearAllFilters: "सभी फिल्टर हटाएं",
  centerName: "केंद्र का नाम",
  sno: "क्र.सं.",
  reportId: "बिल संख्या",
  billId: "बिल संख्या",
  reportDate: "रिपोर्ट दिनांक",
  status: "स्थिति",
  download: "डाउनलोड",
  viewDetails: "विवरण देखें",
  loading: "लोड हो रहा है...",
  noReportsFound: "कोई बिल रिपोर्ट नहीं मिली।",
  noMatchingReports: "चयनित फिल्टर से मेल खाने वाली कोई रिपोर्ट नहीं मिली।",
  allCenters: "सभी केंद्र",
  fetchError: "डेटा लाने में विफल। कृपया बाद में पुन: प्रयास करें।",
  networkError: "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।",
  serverError: "सर्वर त्रुटि। कृपया बाद में पुन: प्रयास करें।",
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
  nivesh: "निवेश",
  subniveshName: "उप-निवेश का नाम",
  unit: "इकाई",
  allocatedQuantity: "आवंटित मात्रा",
  rate: "दर",
  updatedQuantity: "अपडेट की गई मात्रा",
  buyAmount: "कुल राशि",
  schemeName: "योजना का नाम",
  totalItems: "कुल आइटम",
  showing: "दिखा रहे हैं",
  to: "से",
  of: "का",
  entries: "प्रविष्टियां",
  itemsPerPage: "प्रति पृष्ठ आइटम:",
  details: "विवरण",
  viewReceipt: "रसीद देखें",
  receipt: "रसीद",
  downloadBill: "बिल डाउनलोड करें",
  downloadCancelledBill: "रद्द किए गए बिल डाउनलोड करें",
  quantityLeft: "बची हुई मात्रा",
  allotedRashi: "आवंटित राशि",
  soldRashi: "बेची गई राशि",
  cutQuantity: "कट मात्रा",
  totalBill: "कुल बिल",
  billingDate: "बिलिंग दिनांक",
  edit: "संपादित करें",
  save: "सहेजें",
  cancel: "रद्द करें",
  editBillDetails: "बिल विवरण संपादित करें",
  changeBillNumber: "बिल संख्या बदलें",
  editing: "संपादन...",
  updateSuccess: "बिल विवरण सफलतापूर्वक अपडेट किए गए।",
  updateError: "बिल विवरण अपडेट करने में विफल। कृपया बाद में पुन: प्रयास करें।",
  oldBillNumber: "पुरानी बिल संख्या",
  newBillNumber: "नई बिल संख्या",
  downloadSelectedBills: "चयनित बिल डाउनलोड करें",
  selectedBills: "चयनित बिल",
  clearSelection: "चयन हटाएं",
  selectAllOnPage: "इस पृष्ठ के सभी चुनें",
  downloadingBills: "बिल डाउनलोड हो रहे हैं...",
  allBillsDownloaded: "सभी चयनित बिल सफलतापूर्वक डाउनलोड हुए।",
  someBillsFailed: "में विफल",
  allBillsFailed: "सभी बिल डाउनलोड करने में विफल। कृपया बाद में पुन: प्रयास करें।",
  noPdfAvailable: "PDF उपलब्ध नहीं",
  fetching: "ला रहे हैं",
  ofWord: "में से",
  creatingZip: "ZIP फ़ाइल बनाई जा रही है...",
  downloadComplete: "डाउनलोड पूर्ण!",
  bill: "बिल",
  bills: "बिल",
  openedInTabs: "ब्राउज़र टैब में खोले गए (ब्राउज़र ने ऑटो-डाउनलोड ब्लॉक किया हो सकता है)",
};

// Available columns for component download
const availableComponentColumns = [
  { key: "reportId", label: translations.reportId },
  { key: "nivesh", label: translations.nivesh },
  { key: "subnivesh_name", label: translations.subniveshName },
  { key: "unit", label: translations.unit },
  { key: "allocated_quantity", label: translations.allocatedQuantity },
  { key: "rate", label: translations.rate },
  { key: "updated_quantity", label: translations.updatedQuantity },
  { key: "buyAmount", label: translations.buyAmount },
  { key: "scheme_name", label: translations.schemeName },
];

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("hi-IN");
};

// Calculation functions
const calculateQuantityLeft = (allocated, updated, cut) => {
  return (
    (parseFloat(allocated) || 0) -
    (parseFloat(updated) || 0) -
    (parseFloat(cut) || 0)
  );
};

const calculateAllocatedAmount = (allocated, rate) => {
  return (parseFloat(allocated) || 0) * (parseFloat(rate) || 0);
};

const calculateAmount = (updated, rate) => {
  return (parseFloat(updated) || 0) * (parseFloat(rate) || 0);
};

const calculateTotalBill = (cut, rate) => {
  return (parseFloat(cut) || 0) * (parseFloat(rate) || 0);
};

// Column mapping for component data access
const columnMapping = {
  reportId: {
    header: translations.reportId,
    accessor: (item, billReportId) =>
      billReportId || item.bill_report_id || item.report_id || "",
  },
  nivesh: {
    header: translations.nivesh,
    accessor: (item) => item.investment_name,
  },
  subnivesh_name: {
    header: translations.subniveshName,
    accessor: (item) => item.sub_investment_name,
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
  buyAmount: {
    header: translations.buyAmount,
    accessor: (item) => item.sold_amount,
  },
  total_bill: {
    header: translations.totalBill,
    accessor: (item) => calculateTotalBill(item.cut_quantity, item.rate),
  },
  billing_date: {
    header: translations.billingDate,
    accessor: (item) => item.billing_date,
  },
};

// Helper to calculate report sold amount from component_data
const calculateReportSoldAmount = (item) => {
  return (
    item.component_data?.reduce(
      (sum, comp) => sum + (parseFloat(comp.sold_amount) || 0),
      0
    ) || 0
  );
};

// Column mapping for reports table display
const reportsColumnMapping = {
  sno: {
    header: translations.sno,
    accessor: (item, index, currentPageVal, itemsPerPageVal) =>
      (currentPageVal - 1) * itemsPerPageVal + index + 1,
  },
  reportId: {
    header: translations.reportId,
    accessor: (item) => item.bill_report_id,
  },
  centerName: {
    header: translations.centerName,
    accessor: (item) => item.center_name,
  },
  reportDate: {
    header: translations.reportDate,
    accessor: (item) => formatDate(item.billing_date),
  },
  status: {
    header: translations.status,
    accessor: (item) =>
      item.status === "accepted"
        ? translations.accepted
        : item.status === "cancelled"
        ? translations.cancelled
        : item.status,
  },
  totalItems: {
    header: translations.totalItems,
    accessor: (item) => item.component_data?.length || 0,
  },
  buyAmount: {
    header: translations.buyAmount,
    accessor: (item) => calculateReportSoldAmount(item),
  },
};

/**
 * Comprehensive PDF path finder.
 * Checks many possible field names on the item AND inside component_data.
 * Logs the first item's keys to browser console for debugging.
 */
let _debugLogged = false;
const getBillPdfPath = (item) => {
  if (!item) return null;

  // Debug: log the first item's keys so you can see the exact field names
  if (!_debugLogged) {
    _debugLogged = true;
    console.log(
      "%c[AllBills Debug] First bill item keys:",
      "color: blue; font-weight: bold;",
      Object.keys(item)
    );
    console.log(
      "%c[AllBills Debug] First bill item full data:",
      "color: blue; font-weight: bold;",
      item
    );
    if (item.component_data && item.component_data.length > 0) {
      console.log(
        "%c[AllBills Debug] First component_data keys:",
        "color: green; font-weight: bold;",
        Object.keys(item.component_data[0])
      );
      console.log(
        "%c[AllBills Debug] First component_data full data:",
        "color: green; font-weight: bold;",
        item.component_data[0]
      );
    }
  }

  // All possible field names where the PDF path might be stored
  const pathFields = [
    "receipt_path",
    "pdf_path",
    "bill_pdf_path",
    "file_path",
    "bill_pdf",
    "pdf",
    "receipt",
    "document_path",
    "document",
    "bill_file",
    "receipt_url",
    "pdf_url",
    "download_url",
    "bill_path",
    "report_path",
    "file",
    "path",
    "receipt_file",
    "pdf_file",
    "bill_document",
    "generated_pdf",
    "bill_receipt",
    "report_pdf",
    "invoice_path",
    "invoice_pdf",
  ];

  // Check direct fields on the item
  for (const field of pathFields) {
    if (
      item[field] &&
      typeof item[field] === "string" &&
      item[field].trim() !== "" &&
      item[field].trim() !== "null" &&
      item[field].trim() !== "undefined"
    ) {
      return item[field];
    }
  }

  // Check nested inside component_data[0]
  if (item.component_data && item.component_data.length > 0) {
    const comp = item.component_data[0];
    for (const field of pathFields) {
      if (
        comp[field] &&
        typeof comp[field] === "string" &&
        comp[field].trim() !== "" &&
        comp[field].trim() !== "null" &&
        comp[field].trim() !== "undefined"
      ) {
        return comp[field];
      }
    }
  }

  // Check if any field value looks like a URL or file path (ends with .pdf)
  for (const key of Object.keys(item)) {
    const val = item[key];
    if (
      typeof val === "string" &&
      val.trim() !== "" &&
      (val.endsWith(".pdf") ||
        val.includes("/media/") ||
        val.includes("/uploads/") ||
        val.includes("/receipt") ||
        val.includes("/bill"))
    ) {
      return val;
    }
  }

  return null;
};

/**
 * Build the full URL for a bill PDF, normalizing path slashes.
 */
const buildBillPdfUrl = (path) => {
  if (!path) return null;
  // If path is already a full URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Avoid double slashes
  if (path.startsWith("/")) {
    return `${BASE_URL}${path}`;
  }
  return `${BASE_URL}/${path}`;
};

const AllBills = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // API data state
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Multi-bill PDF download state
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [lastDownloadType, setLastDownloadType] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [downloadPhase, setDownloadPhase] = useState("");

  // Multi-selection state
  const [selectedBillIds, setSelectedBillIds] = useState(() => new Set());
  const selectAllCheckboxRef = useRef(null);

  // Status update state
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reportToCancel, setReportToCancel] = useState(null);
  const [billIdToCancel, setBillIdToCancel] = useState(null);

  // Expanded reports state
  const [expandedReports, setExpandedReports] = useState({});

  // Filter state
  const [filters, setFilters] = useState({
    center_name: [],
    bill_id: [],
    status: [],
    dateFrom: "",
    dateTo: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Component column selection state
  const [selectedComponentColumns, setSelectedComponentColumns] = useState(
    availableComponentColumns.map((col) => col.key)
  );

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);
  const [editData, setEditData] = useState({
    old_bill_report_id: "",
    new_bill_report_id: "",
    billing_date: "",
    multiple_bills: [],
    changeNewBillNumber: false,
  });
  const [editingStatus, setEditingStatus] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState(null);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ─── Device detection ───
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

  // ─── Fetch data ───
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

  // ─── Filter options ───
  const filterOptions = useMemo(() => {
    if (!reportsData || reportsData.length === 0) {
      return { center_name: [], bill_id: [], status: [] };
    }
    return {
      center_name: [
        ...new Set(reportsData.map((item) => item.center_name)),
      ].map((name) => ({ value: name, label: name })),
      bill_id: [
        ...new Set(reportsData.map((item) => item.bill_report_id)),
      ].map((id) => ({ value: id, label: id })),
      status: [...new Set(reportsData.map((item) => item.status))].map(
        (status) => ({
          value: status,
          label:
            status === "accepted"
              ? translations.accepted
              : status === "cancelled"
              ? translations.cancelled
              : status,
        })
      ),
    };
  }, [reportsData]);

  // ─── Filtered data ───
  const filteredData = useMemo(() => {
    return reportsData.filter((item) => {
      const matchesCenter =
        filters.center_name.length === 0 ||
        filters.center_name.some((c) => c.value === item.center_name);
      const matchesBillId =
        filters.bill_id.length === 0 ||
        filters.bill_id.some((b) => b.value === item.bill_report_id);
      const matchesStatus =
        filters.status.length === 0 ||
        filters.status.some((s) => s.value === item.status);
      const itemDate = new Date(item.billing_date);
      const matchesDateFrom =
        !filters.dateFrom || itemDate >= new Date(filters.dateFrom);
      const matchesDateTo =
        !filters.dateTo || itemDate <= new Date(filters.dateTo + "T23:59:59");
      return (
        matchesCenter &&
        matchesBillId &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [reportsData, filters]);

  // ─── Pagination ───
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedReportsData = filteredData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // ─── Selection state for current page ───
  const currentPageBillIds = useMemo(
    () => paginatedReportsData.map((item) => item.id),
    [paginatedReportsData]
  );

  const allCurrentPageSelected = useMemo(
    () =>
      currentPageBillIds.length > 0 &&
      currentPageBillIds.every((id) => selectedBillIds.has(id)),
    [currentPageBillIds, selectedBillIds]
  );

  const someCurrentPageSelected = useMemo(
    () =>
      currentPageBillIds.some((id) => selectedBillIds.has(id)) &&
      !allCurrentPageSelected,
    [currentPageBillIds, selectedBillIds, allCurrentPageSelected]
  );

  const totalSelectedCount = selectedBillIds.size;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someCurrentPageSelected;
    }
  }, [someCurrentPageSelected]);

  const toggleSidebar = useCallback(
    () => setSidebarOpen((prev) => !prev),
    []
  );

  // ─── Filter handlers ───
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({
      center_name: [],
      bill_id: [],
      status: [],
      dateFrom: "",
      dateTo: "",
    });
  };

  // ─── Selection handlers ───
  const toggleSelectAll = useCallback(() => {
    setSelectedBillIds((prev) => {
      const next = new Set(prev);
      if (allCurrentPageSelected) {
        currentPageBillIds.forEach((id) => next.delete(id));
      } else {
        currentPageBillIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [allCurrentPageSelected, currentPageBillIds]);

  const toggleSelectBill = useCallback((id) => {
    setSelectedBillIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedBillIds(new Set());
  }, []);

  // ─── Toggle report details ───
  const toggleReportDetails = (reportId) => {
    setExpandedReports((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }));
  };

  // ─── Download: multiple selected bill PDFs ───
  const downloadSelectedBills = async () => {
    const selectedItems = reportsData.filter((item) =>
      selectedBillIds.has(item.id)
    );

    if (selectedItems.length === 0) return;

    setDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(false);
    setDownloadPhase("fetching");
    setDownloadProgress({ current: 0, total: selectedItems.length });

    let successCount = 0;
    let failCount = 0;
    const failedBillIds = [];

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      const pdfPath = getBillPdfPath(item);
      const billLabel = item.bill_report_id || `bill_${item.id}`;

      if (!pdfPath) {
        failCount++;
        failedBillIds.push(billLabel);
        console.warn(
          `[AllBills] No PDF path found for bill ${billLabel}.`
        );
        setDownloadProgress((prev) => ({ ...prev, current: i + 1 }));
        continue;
      }

      const url = buildBillPdfUrl(pdfPath);
      console.log(`[AllBills] Downloading bill ${billLabel} from: ${url}`);

      try {
        // Create an anchor element to trigger the download.
        // This method is less likely to be blocked by CORS for simple downloads.
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${billLabel}.pdf`; // This attribute suggests a filename and prompts a download.
        anchor.target = "_blank"; // Fallback to open in a new tab if the browser blocks the download.

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        successCount++;
      } catch (fetchErr) {
        console.warn(
          `[AllBills] Fetch/download failed for ${billLabel}: ${fetchErr.message}.`
        );
        failCount++;
        failedBillIds.push(billLabel);
      }

      setDownloadProgress((prev) => ({ ...prev, current: i + 1 }));
    }

    // Phase 3: Result
    setDownloadPhase("complete");
    setDownloading(false);
    setDownloadProgress(null);

    if (failCount === 0) {
      setDownloadSuccess(true);
      setLastDownloadType("bills");
    } else if (successCount > 0) {
      setDownloadError(
        `${successCount} बिल डाउनलोड हुए, ${failCount} विफल (${failedBillIds
          .slice(0, 5)
          .join(", ")}${failedBillIds.length > 5 ? "..." : ""})`
      );
    } else {
      setDownloadError(
        `${translations.allBillsFailed} (${failedBillIds
          .slice(0, 5)
          .join(", ")}${failedBillIds.length > 5 ? "..." : ""})। कृपया ब्राउज़र कंसोल (F12) चेक करें और "AllBills Debug" लॉग देखें।`
      );
    }

    setSelectedBillIds(new Set());

    setTimeout(() => {
      setDownloadSuccess(false);
      setDownloadError(null);
      setDownloadPhase("");
    }, 8000);
  };

  // ─── View receipt (existing single-bill logic) ───
  const viewReceipt = (receiptPath) => {
    if (!receiptPath) {
      console.warn("[AllBills] viewReceipt called with no path.");
      return;
    }
    const fullUrl = buildBillPdfUrl(receiptPath);
    const filename = receiptPath.split("/").pop() || "bill.pdf";

    // Create a temporary anchor element to trigger the download
    const anchor = document.createElement("a");
    anchor.href = fullUrl;
    anchor.download = filename; // This attribute tells the browser to download the file
    anchor.target = "_blank"; // Fallback to open in a new tab if download is blocked

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  // ─── Status update ───
  const handleStatusUpdate = async () => {
    try {
      setUpdatingStatus(reportToCancel);
      setStatusUpdateError(null);
      setStatusUpdateSuccess(false);

      const payload = {
        bill_report_id: billIdToCancel,
        status: "cancelled",
      };

      const response = await fetch(UPDATE_REPORT_STATUS_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, details: ${errorText}`
        );
      }

      await response.json();

      setReportsData((prevData) =>
        prevData.map((item) =>
          item.id === reportToCancel ? { ...item, status: "cancelled" } : item
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

  const confirmCancelReport = (reportId, billId) => {
    setReportToCancel(reportId);
    setBillIdToCancel(billId);
    setShowConfirmDialog(true);
  };

  const cancelConfirmation = () => {
    setShowConfirmDialog(false);
    setReportToCancel(null);
    setBillIdToCancel(null);
  };

  // ─── Edit modal ───
  const openEditModal = (item) => {
    setCurrentEditItem(item);
    setEditingReportId(item.id);
    setEditData({
      old_bill_report_id: item.bill_report_id,
      new_bill_report_id: item.bill_report_id,
      billing_date: item.billing_date,
      multiple_bills: item.component_data.map((comp) => ({
        bill_id: comp.bill_id,
        allocated_quantity: parseFloat(comp.allocated_quantity),
        rate: parseFloat(comp.rate),
        updated_quantity: parseFloat(comp.updated_quantity),
      })),
      changeNewBillNumber: false,
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingReportId(null);
    setCurrentEditItem(null);
    setEditData({
      old_bill_report_id: "",
      new_bill_report_id: "",
      billing_date: "",
      multiple_bills: [],
      changeNewBillNumber: false,
    });
    setEditError(null);
  };

  const handleEditDataChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBillQuantityChange = (billId, newQuantity) => {
    setEditData((prev) => ({
      ...prev,
      multiple_bills: prev.multiple_bills.map((bill) =>
        bill.bill_id === billId
          ? { ...bill, updated_quantity: parseFloat(newQuantity) || 0 }
          : bill
      ),
    }));
  };

  const handleSubmitEdit = async () => {
    try {
      setEditingStatus(true);
      setEditError(null);

      const payload = {
        old_bill_report_id: editData.old_bill_report_id,
        billing_date: editData.billing_date,
        multiple_bills: editData.multiple_bills.map((bill) => ({
          bill_id: bill.bill_id,
          updated_quantity: bill.updated_quantity,
          allocated_quantity: bill.allocated_quantity,
          rate: bill.rate,
        })),
      };

      if (
        editData.changeNewBillNumber &&
        editData.new_bill_report_id !== editData.old_bill_report_id
      ) {
        payload.new_bill_report_id = editData.new_bill_report_id;
      }

      const response = await fetch(UPDATE_BILLING_REPORT_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();

      setReportsData((prevData) =>
        prevData.map((item) => {
          if (item.id === editingReportId) {
            return {
              ...item,
              bill_report_id: editData.changeNewBillNumber
                ? editData.new_bill_report_id
                : item.bill_report_id,
              billing_date: editData.billing_date,
              component_data: item.component_data.map((comp) => {
                const updatedBill = editData.multiple_bills.find(
                  (b) => b.bill_id === comp.bill_id
                );
                return updatedBill
                  ? {
                      ...comp,
                      allocated_quantity: updatedBill.allocated_quantity,
                      rate: updatedBill.rate,
                      updated_quantity: updatedBill.updated_quantity,
                      sold_amount: (
                        parseFloat(updatedBill.updated_quantity) *
                        parseFloat(updatedBill.rate)
                      ).toFixed(2),
                    }
                  : comp;
              }),
            };
          }
          return item;
        })
      );

      setShowSuccessModal(true);
      closeEditModal();
    } catch (e) {
      setEditError(e.message || translations.updateError);
    } finally {
      setEditingStatus(false);
    }
  };

  // ─── Component-level Excel download ───
  const downloadExcelComponent = (componentData, filename, billReportId) => {
    try {
      const excelData = componentData.map((item) => {
        const row = {};
        selectedComponentColumns.forEach((col) => {
          row[columnMapping[col].header] = columnMapping[col].accessor(
            item,
            billReportId
          );
        });
        return row;
      });

      const totals = componentData.reduce(
        (acc, comp) => {
          if (selectedComponentColumns.includes("allocatedQuantity"))
            acc.allocated += parseFloat(comp.allocated_quantity) || 0;
          if (selectedComponentColumns.includes("rate"))
            acc.rate += parseFloat(comp.rate) || 0;
          if (selectedComponentColumns.includes("updatedQuantity"))
            acc.updated += parseFloat(comp.updated_quantity) || 0;
          if (selectedComponentColumns.includes("buyAmount"))
            acc.buy += parseFloat(comp.sold_amount) || 0;
          return acc;
        },
        { allocated: 0, rate: 0, updated: 0, buy: 0 }
      );

      if (
        selectedComponentColumns.some((col) =>
          [
            "allocatedQuantity",
            "rate",
            "updatedQuantity",
            "buyAmount",
          ].includes(col)
        )
      ) {
        const totalRow = {};
        selectedComponentColumns.forEach((col) => {
          if (col === "reportId")
            totalRow[columnMapping[col].header] = "Total";
          else if (col === "allocatedQuantity")
            totalRow[columnMapping[col].header] = totals.allocated;
          else if (col === "rate")
            totalRow[columnMapping[col].header] = totals.rate;
          else if (col === "updatedQuantity")
            totalRow[columnMapping[col].header] = totals.updated;
          else if (col === "buyAmount")
            totalRow[columnMapping[col].header] = totals.buy;
          else totalRow[columnMapping[col].header] = "";
        });
        excelData.push(totalRow);
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "Components");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
      console.error("Excel download error:", e);
    }
  };

  // ─── Component-level PDF download ───
  const downloadPdfComponent = (
    componentData,
    filename,
    centerName,
    billReportId
  ) => {
    try {
      const headers = selectedComponentColumns
        .map((col) => `<th>${columnMapping[col].header}</th>`)
        .join("");
      const rows = componentData
        .map((item) => {
          const cells = selectedComponentColumns
            .map(
              (col) =>
                `<td>${columnMapping[col].accessor(item, billReportId)}</td>`
            )
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");

      const totals = componentData.reduce(
        (acc, comp) => {
          if (selectedComponentColumns.includes("allocatedQuantity"))
            acc.allocated += parseFloat(comp.allocated_quantity) || 0;
          if (selectedComponentColumns.includes("rate"))
            acc.rate += parseFloat(comp.rate) || 0;
          if (selectedComponentColumns.includes("updatedQuantity"))
            acc.updated += parseFloat(comp.updated_quantity) || 0;
          if (selectedComponentColumns.includes("buyAmount"))
            acc.buy += parseFloat(comp.sold_amount) || 0;
          return acc;
        },
        { allocated: 0, rate: 0, updated: 0, buy: 0 }
      );

      let totalRow = "";
      if (
        selectedComponentColumns.some((col) =>
          [
            "allocatedQuantity",
            "rate",
            "updatedQuantity",
            "buyAmount",
          ].includes(col)
        )
      ) {
        const totalCells = selectedComponentColumns
          .map((col) => {
            if (col === "reportId")
              return "<td><strong>Total</strong></td>";
            else if (col === "allocatedQuantity")
              return `<td><strong>${totals.allocated}</strong></td>`;
            else if (col === "rate")
              return `<td><strong>${totals.rate}</strong></td>`;
            else if (col === "updatedQuantity")
              return `<td><strong>${totals.updated}</strong></td>`;
            else if (col === "buyAmount")
              return `<td><strong>${totals.buy}</strong></td>`;
            else return "<td></td>";
          })
          .join("");
        totalRow = `<tr>${totalCells}</tr>`;
      }

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
            <h2>${centerName}</h2>
            <table>
              <tr>${headers}</tr>
              ${rows}
              ${totalRow}
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
      console.error("PDF download error:", e);
    }
  };

  // ─── Pagination ───
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginationItems = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(
    1,
    currentPage - Math.floor(maxVisiblePages / 2)
  );
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
      paginationItems.push(
        <Pagination.Ellipsis key="end-ellipsis" disabled />
      );
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

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "accepted":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "secondary";
    }
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════

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
                <h1 className="page-title small-fonts">
                  {translations.allBills}
                </h1>

                {downloadSuccess && (
                  <Alert
                    variant="success"
                    dismissible
                    onClose={() => setDownloadSuccess(false)}
                  >
                    {lastDownloadType === "bills_fallback"
                      ? `${translations.allBillsDownloaded} (${translations.openedInTabs})`
                      : translations.allBillsDownloaded}
                  </Alert>
                )}

                {statusUpdateSuccess && (
                  <Alert
                    variant="success"
                    dismissible
                    onClose={() => setStatusUpdateSuccess(false)}
                  >
                    {translations.statusUpdateSuccess}
                  </Alert>
                )}

                {downloadError && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setDownloadError(null)}
                  >
                    {downloadError}
                  </Alert>
                )}

                {statusUpdateError && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setStatusUpdateError(null)}
                  >
                    {translations.error}: {statusUpdateError}
                  </Alert>
                )}

                {editSuccess && (
                  <Alert
                    variant="success"
                    dismissible
                    onClose={() => setEditSuccess(false)}
                  >
                    {translations.updateSuccess}
                  </Alert>
                )}

                {editError && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setEditError(null)}
                  >
                    {translations.error}: {editError}
                  </Alert>
                )}

                {/* ─── Filters Section ─── */}
                <div className="filter-section mb-4 p-3 border rounded bg-light">
                  <Row className="mb-3">
                    <Col
                      md={12}
                      className="d-flex justify-content-between align-items-center main-table"
                    >
                      <h5 className="mb-0">{translations.filters}</h5>
                      {(filters.center_name.length > 0 ||
                        filters.bill_id.length > 0 ||
                        filters.status.length > 0 ||
                        filters.dateFrom ||
                        filters.dateTo) && (
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
                    <Col xs={12} sm={6} md={3} className="mb-2">
                      <FormGroup>
                        <FormLabel className="form-label">
                          {translations.centerName}
                        </FormLabel>
                        <Select
                          value={filters.center_name}
                          onChange={(value) =>
                            handleFilterChange("center_name", value)
                          }
                          options={filterOptions.center_name}
                          isMulti
                          isClearable
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
                        <FormLabel className="form-label">
                          {translations.billId}
                        </FormLabel>
                        <Select
                          value={filters.bill_id}
                          onChange={(value) =>
                            handleFilterChange("bill_id", value)
                          }
                          options={filterOptions.bill_id}
                          isMulti
                          isClearable
                          placeholder="बिल संख्या"
                          styles={customSelectStyles}
                          className="compact-input small-fonts filter-dropdown"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      </FormGroup>
                    </Col>

                    <Col xs={12} sm={6} md={3} className="mb-2">
                      <FormGroup>
                        <FormLabel className="form-label">
                          {translations.status}
                        </FormLabel>
                        <Select
                          value={filters.status}
                          onChange={(value) =>
                            handleFilterChange("status", value)
                          }
                          options={filterOptions.status}
                          isMulti
                          isClearable
                          placeholder="स्थिति"
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
                        <FormLabel className="form-label">From Date</FormLabel>
                        <input
                          type="date"
                          className="form-control compact-input small-fonts"
                          value={filters.dateFrom}
                          onChange={(e) =>
                            handleFilterChange("dateFrom", e.target.value)
                          }
                        />
                      </FormGroup>
                    </Col>

                    <Col xs={12} sm={6} md={3} className="mb-2">
                      <FormGroup>
                        <FormLabel className="form-label">To Date</FormLabel>
                        <input
                          type="date"
                          className="form-control compact-input small-fonts"
                          value={filters.dateTo}
                          onChange={(e) =>
                            handleFilterChange("dateTo", e.target.value)
                          }
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                </div>

                {/* ─── Reports Section ─── */}
                <div className="reports-container">
                  <Row className="mt-3">
                    <div className="col-md-12">
                      <div className="table-wrapper">
                        {filteredData.length > 0 ? (
                          <>
                            <div className="table-info mb-2">
                              <Row className="align-items-center">
                                <Col
                                  xs={12}
                                  md={6}
                                  className="d-flex align-items-center flex-wrap gap-2 mb-2 mb-md-0"
                                >
                                  <span className="small-fonts">
                                    {translations.showing}{" "}
                                    {indexOfFirstItem + 1} {translations.to}{" "}
                                    {Math.min(
                                      indexOfLastItem,
                                      filteredData.length
                                    )}{" "}
                                    {translations.of} {filteredData.length}{" "}
                                    {translations.entries}
                                  </span>
                                  <span className="small-fonts me-2">
                                    {translations.itemsPerPage}
                                  </span>
                                  <Badge bg="primary">{itemsPerPage}</Badge>
                                </Col>

                                <Col
                                  xs={12}
                                  md={6}
                                  className="d-flex align-items-center justify-content-md-end flex-wrap gap-2"
                                >
                                  {totalSelectedCount > 0 && (
                                    <div className="d-flex align-items-center gap-2 me-2">
                                      <Badge bg="info" pill>
                                        {totalSelectedCount}{" "}
                                        {totalSelectedCount === 1
                                          ? translations.bill
                                          : translations.bills}{" "}
                                        {translations.selectedBills}
                                      </Badge>
                                      <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={clearSelection}
                                        className="small-fonts"
                                        disabled={downloading}
                                      >
                                        {translations.clearSelection}
                                      </Button>
                                    </div>
                                  )}

                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={downloadSelectedBills}
                                    disabled={
                                      totalSelectedCount === 0 || downloading
                                    }
                                    className="small-fonts d-flex align-items-center gap-1"
                                  >
                                    {downloading ? (
                                      <>
                                        <Spinner
                                          animation="border"
                                          size="sm"
                                          role="status"
                                        />
                                        <span className="ms-1">
                                          {downloadPhase === "fetching"
                                            ? `${translations.fetching} ${downloadProgress?.current || 0}/${downloadProgress?.total || 0}...`
                                            : downloadPhase === "creatingZip"
                                            ? translations.creatingZip
                                            : translations.downloadingBills}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <FaDownload />
                                        <span>
                                          {translations.downloadSelectedBills}
                                        </span>
                                        {totalSelectedCount > 0 && (
                                          <Badge
                                            bg="light"
                                            text="dark"
                                            pill
                                            className="ms-1"
                                          >
                                            {totalSelectedCount}
                                          </Badge>
                                        )}
                                      </>
                                    )}
                                  </Button>
                                </Col>
                              </Row>

                              {downloading && downloadProgress && (
                                <Row className="mt-2">
                                  <Col xs={12}>
                                    <ProgressBar
                                      now={
                                        downloadProgress.total > 0
                                          ? (downloadProgress.current /
                                              downloadProgress.total) *
                                            100
                                          : 0
                                      }
                                      variant={
                                        downloadPhase === "creatingZip"
                                          ? "warning"
                                          : "primary"
                                      }
                                      style={{ height: "6px" }}
                                      animated
                                    />
                                    <small className="text-muted small-fonts mt-1 d-block">
                                      {downloadPhase === "fetching" &&
                                        `${translations.fetching} ${downloadProgress.current} ${translations.ofWord} ${downloadProgress.total} ${translations.bills}...`}
                                      {downloadPhase === "creatingZip" &&
                                        translations.creatingZip}
                                      {downloadPhase === "complete" &&
                                        translations.downloadComplete}
                                    </small>
                                  </Col>
                                </Row>
                              )}
                            </div>

                            <div className="table-responsive">
                              <table className="table table-bordered table-hover table-striped small-fonts">
                                <thead className="table-light">
                                  <tr>
                                    <th
                                      style={{
                                        width: "40px",
                                        textAlign: "center",
                                        verticalAlign: "middle",
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        ref={selectAllCheckboxRef}
                                        checked={allCurrentPageSelected}
                                        onChange={toggleSelectAll}
                                        title={
                                          allCurrentPageSelected
                                            ? translations.clearAllFilters
                                            : translations.selectAllOnPage
                                        }
                                        style={{
                                          cursor: "pointer",
                                          width: "16px",
                                          height: "16px",
                                        }}
                                      />
                                    </th>
                                    <th>{translations.sno}</th>
                                    <th>{translations.reportId}</th>
                                    <th>{translations.centerName}</th>
                                    <th>{translations.reportDate}</th>
                                    <th>{translations.status}</th>
                                    <th>{translations.totalItems}</th>
                                    <th>{translations.buyAmount}</th>
                                    <th
                                      style={{
                                        minWidth: "200px",
                                        textAlign: "center",
                                      }}
                                    >
                                      {translations.details} /{" "}
                                      {translations.download}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {paginatedReportsData.map((item, index) => {
                                    const isExpanded =
                                      expandedReports[item.id] || false;
                                    const isSelected = selectedBillIds.has(
                                      item.id
                                    );
                                    const pdfPath = getBillPdfPath(item);

                                    return (
                                      <React.Fragment key={item.id}>
                                        <tr
                                          className={
                                            isSelected ? "table-primary" : ""
                                          }
                                        >
                                          <td
                                            style={{
                                              textAlign: "center",
                                              verticalAlign: "middle",
                                            }}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={isSelected}
                                              onChange={() =>
                                                toggleSelectBill(item.id)
                                              }
                                              style={{
                                                cursor: "pointer",
                                                width: "16px",
                                                height: "16px",
                                              }}
                                            />
                                          </td>
                                          <td>
                                            {reportsColumnMapping.sno.accessor(
                                              item,
                                              index,
                                              currentPage,
                                              itemsPerPage
                                            )}
                                          </td>
                                          <td>
                                            <strong>
                                              {item.bill_report_id}
                                            </strong>
                                          </td>
                                          <td>{item.center_name}</td>
                                          <td>
                                            {formatDate(item.billing_date)}
                                          </td>
                                          <td>
                                            <Badge
                                              variant={getStatusBadgeVariant(
                                                item.status
                                              )}
                                            >
                                              {item.status === "accepted"
                                                ? translations.accepted
                                                : item.status === "cancelled"
                                                ? translations.cancelled
                                                : item.status}
                                            </Badge>
                                          </td>
                                          <td>
                                            {item.component_data?.length || 0}
                                          </td>
                                          <td>
                                            {calculateReportSoldAmount(item)}
                                          </td>
                                          <td>
                                            <div className="d-flex flex-wrap gap-1 justify-content-center">
                                              <Button
                                                variant="outline-info"
                                                size="sm"
                                                onClick={() =>
                                                  toggleReportDetails(item.id)
                                                }
                                                className="small-fonts"
                                                title={
                                                  translations.viewDetails
                                                }
                                              >
                                                {isExpanded ? "▲" : "▼"}
                                              </Button>

                                              {pdfPath ? (
                                                <Button
                                                  variant="outline-success"
                                                  size="sm"
                                                  onClick={() =>
                                                    viewReceipt(pdfPath)
                                                  }
                                                  className="small-fonts"
                                                  title={
                                                    item.status === "cancelled"
                                                      ? translations.downloadCancelledBill
                                                      : translations.downloadBill
                                                  }
                                                >
                                                  <FaDownload className="me-1" />
                                                  {translations.download}
                                                </Button>
                                              ) : (
                                                <Badge
                                                  bg="secondary"
                                                  className="small-fonts"
                                                  title="PDF path not found in API response"
                                                >
                                                  {translations.noPdfAvailable}
                                                </Badge>
                                              )}

                                              <Button
                                                variant="outline-warning"
                                                size="sm"
                                                onClick={() =>
                                                  openEditModal(item)
                                                }
                                                className="small-fonts"
                                                title={translations.edit}
                                              >
                                                {translations.edit}
                                              </Button>

                                              {item.status === "accepted" && (
                                                <Button
                                                  variant="outline-danger"
                                                  size="sm"
                                                  onClick={() =>
                                                    confirmCancelReport(
                                                      item.id,
                                                      item.bill_report_id
                                                    )
                                                  }
                                                  className="small-fonts"
                                                  disabled={
                                                    updatingStatus === item.id
                                                  }
                                                  title={
                                                    translations.cancelReport
                                                  }
                                                >
                                                  {updatingStatus === item.id
                                                    ? "..."
                                                    : translations.cancel}
                                                </Button>
                                              )}
                                            </div>
                                          </td>
                                        </tr>

                                        <tr>
                                          <td
                                            colSpan={9}
                                            className="p-0"
                                            style={{
                                              borderBottom: isExpanded
                                                ? "1px solid #dee2e6"
                                                : "none",
                                            }}
                                          >
                                            <Collapse in={isExpanded}>
                                              <div className="p-3 bg-light">
                                                <Row className="mb-2 align-items-center">
                                                  <Col
                                                    md={6}
                                                    className="small-fonts"
                                                  >
                                                    <strong>
                                                      {item.center_name} —{" "}
                                                      {item.bill_report_id}
                                                    </strong>
                                                  </Col>
                                                  <Col
                                                    md={6}
                                                    className="text-end"
                                                  >
                                                    <Button
                                                      variant="outline-success"
                                                      size="sm"
                                                      className="me-1 small-fonts"
                                                      onClick={() =>
                                                        downloadExcelComponent(
                                                          item.component_data,
                                                          `${item.bill_report_id}_components`,
                                                          item.bill_report_id
                                                        )
                                                      }
                                                    >
                                                      Excel
                                                    </Button>
                                                    <Button
                                                      variant="outline-danger"
                                                      size="sm"
                                                      className="small-fonts"
                                                      onClick={() =>
                                                        downloadPdfComponent(
                                                          item.component_data,
                                                          `${item.bill_report_id}_components`,
                                                          item.center_name,
                                                          item.bill_report_id
                                                        )
                                                      }
                                                    >
                                                      PDF
                                                    </Button>
                                                  </Col>
                                                </Row>

                                                <div className="table-responsive">
                                                  <table className="table table-bordered table-sm small-fonts mb-0">
                                                    <thead className="table-light">
                                                      <tr>
                                                        <th>
                                                          {
                                                            translations.reportId
                                                          }
                                                        </th>
                                                        <th>
                                                          {translations.nivesh}
                                                        </th>
                                                        <th>
                                                          {
                                                            translations.subniveshName
                                                          }
                                                        </th>
                                                        <th>
                                                          {translations.unit}
                                                        </th>
                                                        <th>
                                                          {
                                                            translations.allocatedQuantity
                                                          }
                                                        </th>
                                                        <th>
                                                          {translations.rate}
                                                        </th>
                                                        <th>
                                                          {
                                                            translations.updatedQuantity
                                                          }
                                                        </th>
                                                        <th>
                                                          {
                                                            translations.quantityLeft
                                                          }
                                                        </th>
                                                        <th>
                                                          {
                                                            translations.allotedRashi
                                                          }
                                                        </th>
                                                        <th>
                                                          {
                                                            translations.soldRashi
                                                          }
                                                        </th>
                                                        <th>
                                                          {
                                                            translations.cutQuantity
                                                          }
                                                        </th>
                                                        <th>
                                                          {
                                                            translations.totalBill
                                                          }
                                                        </th>
                                                        <th>
                                                          {
                                                            translations.buyAmount
                                                          }
                                                        </th>
                                                        <th>
                                                          {
                                                            translations.billingDate
                                                          }
                                                        </th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {item.component_data?.map(
                                                        (comp, compIdx) => (
                                                          <tr key={compIdx}>
                                                            <td>
                                                              {
                                                                item.bill_report_id
                                                              }
                                                            </td>
                                                            <td>
                                                              {
                                                                comp.investment_name
                                                              }
                                                            </td>
                                                            <td>
                                                              {
                                                                comp.sub_investment_name
                                                              }
                                                            </td>
                                                            <td>
                                                              {comp.unit}
                                                            </td>
                                                            <td>
                                                              {
                                                                comp.allocated_quantity
                                                              }
                                                            </td>
                                                            <td>
                                                              {comp.rate}
                                                            </td>
                                                            <td>
                                                              {
                                                                comp.updated_quantity
                                                              }
                                                            </td>
                                                            <td>
                                                              {calculateQuantityLeft(
                                                                comp.allocated_quantity,
                                                                comp.updated_quantity,
                                                                comp.cut_quantity
                                                              )}
                                                            </td>
                                                            <td>
                                                              {calculateAllocatedAmount(
                                                                comp.allocated_quantity,
                                                                comp.rate
                                                              )}
                                                            </td>
                                                            <td>
                                                              {calculateAmount(
                                                                comp.updated_quantity,
                                                                comp.rate
                                                              )}
                                                            </td>
                                                            <td>
                                                              {
                                                                comp.cut_quantity
                                                              }
                                                            </td>
                                                            <td>
                                                              {calculateTotalBill(
                                                                comp.cut_quantity,
                                                                comp.rate
                                                              )}
                                                            </td>
                                                            <td>
                                                              {
                                                                comp.sold_amount
                                                              }
                                                            </td>
                                                            <td>
                                                              {comp.billing_date
                                                                ? formatDate(
                                                                    comp.billing_date
                                                                  )
                                                                : "N/A"}
                                                            </td>
                                                          </tr>
                                                        )
                                                      )}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </div>
                                            </Collapse>
                                          </td>
                                        </tr>
                                      </React.Fragment>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {totalPages > 1 && (
                              <div className="d-flex justify-content-center mt-3">
                                <Pagination>
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
                        ) : (
                          <div className="text-center py-5">
                            <p className="text-muted">
                              {translations.noMatchingReports}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Row>
                </div>
              </Container>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ─── Cancel Confirmation Modal ─── */}
      <Modal
        show={showConfirmDialog}
        onHide={cancelConfirmation}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title className="small-fonts">
            {translations.cancelReport}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="small-fonts">
          <p>{translations.confirmCancel}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={cancelConfirmation}
            disabled={updatingStatus !== null}
          >
            {translations.no}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleStatusUpdate}
            disabled={updatingStatus !== null}
          >
            {updatingStatus !== null ? (
              <Spinner animation="border" size="sm" />
            ) : (
              translations.yes
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ─── Edit Bill Modal ─── */}
      <Modal show={showEditModal} onHide={closeEditModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="small-fonts">
            {translations.editBillDetails}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="small-fonts">
          {editError && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setEditError(null)}
            >
              {editError}
            </Alert>
          )}

          <Row className="mb-3">
            <Col md={6}>
              <FormGroup>
                <FormLabel>{translations.oldBillNumber}</FormLabel>
                <Form.Control
                  type="text"
                  value={editData.old_bill_report_id}
                  disabled
                  className="small-fonts"
                />
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <FormCheck
                  type="checkbox"
                  label={translations.changeBillNumber}
                  checked={editData.changeNewBillNumber}
                  onChange={(e) =>
                    handleEditDataChange(
                      "changeNewBillNumber",
                      e.target.checked
                    )
                  }
                  className="mb-2 small-fonts"
                />
                {editData.changeNewBillNumber && (
                  <Form.Control
                    type="text"
                    value={editData.new_bill_report_id}
                    onChange={(e) =>
                      handleEditDataChange(
                        "new_bill_report_id",
                        e.target.value
                      )
                    }
                    className="small-fonts"
                    placeholder={translations.newBillNumber}
                  />
                )}
              </FormGroup>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <FormGroup>
                <FormLabel>{translations.billingDate}</FormLabel>
                <Form.Control
                  type="date"
                  value={editData.billing_date}
                  onChange={(e) =>
                    handleEditDataChange("billing_date", e.target.value)
                  }
                  className="small-fonts"
                />
              </FormGroup>
            </Col>
          </Row>

          <h6 className="mt-3 mb-2">
            {translations.nivesh} {translations.details}
          </h6>
          <div className="table-responsive">
            <table className="table table-bordered table-sm small-fonts">
              <thead className="table-light">
                <tr>
                  <th>{translations.nivesh}</th>
                  <th>{translations.allocatedQuantity}</th>
                  <th>{translations.rate}</th>
                  <th>{translations.updatedQuantity}</th>
                </tr>
              </thead>
              <tbody>
                {editData.multiple_bills.map((bill) => (
                  <tr key={bill.bill_id}>
                    <td>{bill.bill_id}</td>
                    <td>{bill.allocated_quantity}</td>
                    <td>{bill.rate}</td>
                    <td>
                      <Form.Control
                        type="number"
                        value={bill.updated_quantity}
                        onChange={(e) =>
                          handleBillQuantityChange(
                            bill.bill_id,
                            e.target.value
                          )
                        }
                        className="small-fonts"
                        min="0"
                        max={bill.allocated_quantity}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={closeEditModal}
            disabled={editingStatus}
          >
            {translations.cancel}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmitEdit}
            disabled={editingStatus}
          >
            {editingStatus ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                {translations.editing}
              </>
            ) : (
              translations.save
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ─── Success Modal ─── */}
      <Modal
        show={showSuccessModal}
        onHide={() => setShowSuccessModal(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title className="small-fonts text-success">
            ✓ {translations.updateSuccess}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="small-fonts text-center">
          <p>{translations.updateSuccess}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowSuccessModal(false)}
          >
            {translations.save}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
};

export default AllBills;