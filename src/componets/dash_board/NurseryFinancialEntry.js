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
import { FaFileExcel, FaFilePdf, FaSync } from "react-icons/fa";
import { RiFilePdfLine, RiFileExcelLine, RiDeleteBinLine } from "react-icons/ri";
import axios from "axios";
import * as XLSX from "xlsx";
import Select from "react-select";
import "../../assets/css/registration.css";
import { useAuth } from "../../context/AuthContext";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";

// API URL
const NURSERY_FINANCIAL_API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/nursery-financial/";

// Table columns
const nurseryFinancialTableColumns = [
  { key: "nursery_name", label: "नर्सरी का नाम" },
  { key: "standard_item", label: "मानक आइटम" },
  { key: "allocated_amount", label: "धनराशि" },
  { key: "spent_amount", label: "व्यय राशि" },
  { key: "description", label: "विवरण" },
  { key: "registration_date", label: "पंजीकरण तिथि" },
];

// Column mapping for data access
const nurseryFinancialColumnMapping = {
  sno: { header: "क्र.सं.", accessor: (item, index) => index + 1 },
  nursery_name: {
    header: "नर्सरी का नाम",
    accessor: (item) => item.nursery_name,
  },
  standard_item: {
    header: "मानक आइटम",
    accessor: (item) => item.standard_item,
  },
  allocated_amount: {
    header: "धनराशि",
    accessor: (item) => parseFloat(item.allocated_amount) || 0,
  },
  spent_amount: {
    header: "व्यय राशि",
    accessor: (item) => parseFloat(item.spent_amount) || 0,
  },
  description: {
    header: "विवरण",
    accessor: (item) => item.description || "",
  },
  registration_date: {
    header: "पंजीकरण तिथि",
    accessor: (item) => {
      if (!item.registration_date) return "";
      const date = new Date(item.registration_date);
      return date.toLocaleDateString("hi-IN");
    },
  },
};

// Hindi translations for form
const translations = {
  pageTitle: "नर्सरी वित्तीय प्रविष्टि",
  nurseryName: "नर्सरी का नाम",
  standardItem: "मानक आइटम",
  allocatedAmount: "धनराशि",
  spentAmount: "व्यय राशि",
  description: "विवरण",
  registrationDate: "पंजीकरण तिथि",
  fromDate: "से तिथि",
  toDate: "तक तिथि",
  submitButton: "जमा करें",
  submitting: "जमा कर रहे हैं...",
  successMessage: "नर्सरी वित्तीय डेटा सफलतापूर्वक जोड़ा गया!",
  updateSuccessMessage: "नर्सरी वित्तीय डेटा सफलतापूर्वक अपडेट किया गया!",
  bulkUpload: "बल्क अपलोड (Excel)",
  uploadFile: "फाइल चुनें",
  uploadButton: "अपलोड करें",
  required: "यह फ़ील्ड आवश्यक है",
  selectOption: "चुनें",
  genericError: "प्रस्तुत करते समय एक त्रुटि हुई। कृपया बाद में पुन: प्रयास करें।",
  showing: "दिखा रहे हैं",
  to: "से",
  of: "का",
  entries: "प्रविष्टियां",
  page: "पृष्ठ",
  itemsPerPage: "प्रति पृष्ठ आइटम",
};

// Helper function to get financial year dates (April 1 to March 31)
const getFinancialYearDates = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed: January = 0, April = 3, March = 2
  
  let fromDate, toDate;
  
  if (currentMonth >= 3) {
    // April (month 3) onwards: FY is April of current year to March of next year
    fromDate = new Date(currentYear, 3, 1); // April 1 of current year
    toDate = new Date(currentYear + 1, 2, 31); // March 31 of next year
  } else {
    // January, February, March: FY is April of previous year to March of current year
    fromDate = new Date(currentYear - 1, 3, 1); // April 1 of previous year
    toDate = new Date(currentYear, 2, 31); // March 31 of current year
  }
  
  return {
    from_date: fromDate.toISOString().split('T')[0],
    to_date: toDate.toISOString().split('T')[0],
  };
};

const NurseryFinancialEntry = () => {
  const { user } = useAuth();
  const isAdmin = user && user.loginType === "admin";
  
  // Column Selection Component
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

  // Form state for single entry
  // State for form fields in "other" mode (text input instead of dropdown)
  const [otherMode, setOtherMode] = useState({
    nursery_name: false,
    standard_item: false,
  });

  const [formData, setFormData] = useState({
    nursery_name: "",
    standard_item: "",
    allocated_amount: "",
    spent_amount: "",
    description: "",
    registration_date: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [nurseryFinancialItems, setNurseryFinancialItems] = useState([]);
  const [allNurseryFinancialItems, setAllNurseryFinancialItems] = useState([]);
  const [excelFile, setExcelFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [uploadSuccessCount, setUploadSuccessCount] = useState(0);
  const fileInputRef = useRef(null);
  const [selectedColumns, setSelectedColumns] = useState(
    nurseryFinancialTableColumns.map((col) => col.key)
  );
  const [isLoading, setIsLoading] = useState(true);

  // State for filters
  const [filters, setFilters] = useState({
    from_date: "",
    to_date: "",
    nursery_name: [],
    standard_item: [],
  });

  // State for filter options (unique values from API)
  const [filterOptions, setFilterOptions] = useState({
    nursery_name: [],
    standard_item: [],
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [editingRowId, setEditingRowId] = useState(null);
  const [editingValues, setEditingValues] = useState({});

  // Fetch data on component mount and set default financial year filters
  useEffect(() => {
    const financialYearDates = getFinancialYearDates();
    setFilters({
      from_date: financialYearDates.from_date,
      to_date: financialYearDates.to_date,
      nursery_name: [],
      standard_item: [],
    });
    fetchNurseryFinancialItems();
  }, []);

  // Reset to page 1 when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [nurseryFinancialItems]);

  // Populate filter options from all items
  useEffect(() => {
    if (allNurseryFinancialItems.length > 0) {
      setFilterOptions({
        nursery_name: [
          ...new Set(
            allNurseryFinancialItems.map((item) => item.nursery_name).filter(Boolean)
          ),
        ].sort(),
        standard_item: [
          ...new Set(
            allNurseryFinancialItems.map((item) => item.standard_item).filter(Boolean)
          ),
        ].sort(),
      });
    }
  }, [allNurseryFinancialItems]);

  // Apply local filtering when filters change
  useEffect(() => {
    // Only apply filters when both dates are selected
    if (filters.from_date && filters.to_date) {
      const filtered = allNurseryFinancialItems.filter((item) => {
        // Date range filter
        const itemDate = new Date(item.registration_date);
        const fromDate = new Date(filters.from_date);
        const toDate = new Date(filters.to_date);
        toDate.setHours(23, 59, 59, 999); // Set to end of day
        
        if (itemDate < fromDate || itemDate > toDate) {
          return false;
        }
        
        // Other filters
        for (const key in filters) {
          if (key === "from_date" || key === "to_date") {
            continue;
          }
          if (filters[key].length > 0 && !filters[key].includes(item[key])) {
            return false;
          }
        }
        
        return true;
      });
      setNurseryFinancialItems(filtered);
    } else {
      // If no date range selected, show empty data
      setNurseryFinancialItems([]);
    }
  }, [filters, allNurseryFinancialItems]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Fetch nursery financial items data
  const fetchNurseryFinancialItems = async (appliedFilters = {}) => {
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
        }
      });
      const response = await axios.get(NURSERY_FINANCIAL_API_URL, { params });
      const data =
        response.data && response.data.data
          ? response.data.data
          : response.data;
      const items = Array.isArray(data) ? data : [];
      setNurseryFinancialItems(items);
      if (Object.keys(params).length === 0) {
        setAllNurseryFinancialItems(items);
      }
    } catch (error) {
      console.error("Error fetching nursery financial items:", error);
      setApiError("डेटा लोड करने में त्रुटि हुई।");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all filters and reset to financial year
  const clearFilters = () => {
    const financialYearDates = getFinancialYearDates();
    setFilters({
      from_date: financialYearDates.from_date,
      to_date: financialYearDates.to_date,
      nursery_name: [],
      standard_item: [],
    });
  };

  // Filtered items
  const filteredItems = nurseryFinancialItems;

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

      // Add total row
      const totalRow = {};
      totalRow["क्र.सं."] = "कुल";
      selectedColumns.forEach((col) => {
        if (col === "nursery_name" || col === "standard_item") {
          const uniqueValues = new Set(data.map(item => columnMapping[col].accessor(item, 0)));
          totalRow[columnMapping[col].header] = uniqueValues.size;
        } else if (col === "allocated_amount" || col === "spent_amount") {
          const sum = data.reduce((total, item) => {
            const value = parseFloat(columnMapping[col].accessor(item, 0)) || 0;
            return total + value;
          }, 0);
          totalRow[columnMapping[col].header] = sum.toFixed(2);
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
      setApiError("Excel file generation failed. Please try again.");
    }
  };

  // Download sample Excel template
  const downloadSampleTemplate = () => {
    try {
      const sampleData = [
        {
          "नर्सरी का नाम": "राजकीय उद्यान चमेठा",
          "मानक आइटम": "06 – मजदूरी",
          "धनराशि": "5000.00",
          "व्यय राशि": "1000.00",
          "विवरण": "note typing detail",
          "पंजीकरण तिथि": new Date().toISOString().split('T')[0],
        },
      ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(sampleData);

      const colWidths = [
        { wch: 25 }, // नर्सरी का नाम
        { wch: 20 }, // मानक आइटम
        { wch: 15 }, // धनराशि
        { wch: 15 }, // व्यय राशि
        { wch: 20 }, // विवरण
        { wch: 12 }, // पंजीकरण तिथि
      ];
      ws["!cols"] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, "SampleTemplate");
      XLSX.writeFile(wb, `NurseryFinancialEntry_Template.xlsx`);
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

      // Add total row
      const totalCells = `<td><strong>कुल</strong></td>${selectedColumns
        .map((col) => {
          if (col === "nursery_name" || col === "standard_item") {
            const uniqueValues = new Set(data.map(item => columnMapping[col].accessor(item, 0)));
            return `<td><strong>${uniqueValues.size}</strong></td>`;
          } else if (col === "allocated_amount" || col === "spent_amount") {
            const sum = data.reduce((total, item) => {
              const value = parseFloat(columnMapping[col].accessor(item, 0)) || 0;
              return total + value;
            }, 0);
            return `<td><strong>${sum.toFixed(2)}</strong></td>`;
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
    } catch (e) {
      console.error("Error generating PDF:", e);
      setApiError("PDF generation failed. Please try again.");
    }
  };

  // Refresh function
  const handleRefresh = () => {
    fetchNurseryFinancialItems();
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
      nursery_name: item.nursery_name || "",
      standard_item: item.standard_item || "",
      allocated_amount: item.allocated_amount || "",
      spent_amount: item.spent_amount || "",
      description: item.description || "",
      registration_date: item.registration_date || new Date().toISOString().split('T')[0],
    });
    setApiError(null);
    setApiResponse(null);
  };

  // Handle save edit
  const handleSave = async (item) => {
    try {
      const payload = {
        id: item.id,
        nursery_name: editingValues.nursery_name,
        standard_item: editingValues.standard_item,
        allocated_amount: parseFloat(editingValues.allocated_amount) || 0,
        spent_amount: parseFloat(editingValues.spent_amount) || 0,
        description: editingValues.description || "",
        registration_date: editingValues.registration_date,
      };
      const response = await axios.put(NURSERY_FINANCIAL_API_URL, payload);
      setAllNurseryFinancialItems((prev) =>
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
        const response = await axios.delete(NURSERY_FINANCIAL_API_URL, {
          data: { id: item.id }
        });
        setAllNurseryFinancialItems((prev) => prev.filter((i) => i.id !== item.id));
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

  // Validate a single row of data (for bulk upload)
  const validateRow = (rowData, rowIndex) => {
    const errors = [];
    
    if (!rowData.nursery_name || !rowData.nursery_name.toString().trim()) {
      errors.push(`Row ${rowIndex}: नर्सरी का नाम आवश्यक है`);
    }
    if (!rowData.standard_item || !rowData.standard_item.toString().trim()) {
      errors.push(`Row ${rowIndex}: मानक आइटम आवश्यक है`);
    }
    if (rowData.allocated_amount === "" || rowData.allocated_amount === null || rowData.allocated_amount === undefined) {
      errors.push(`Row ${rowIndex}: धनराशि आवश्यक है`);
    } else if (isNaN(parseFloat(rowData.allocated_amount))) {
      errors.push(`Row ${rowIndex}: धनराशि एक संख्या होनी चाहिए`);
    }
    if (rowData.spent_amount === "" || rowData.spent_amount === null || rowData.spent_amount === undefined) {
      errors.push(`Row ${rowIndex}: व्यय राशि आवश्यक है`);
    } else if (isNaN(parseFloat(rowData.spent_amount))) {
      errors.push(`Row ${rowIndex}: व्यय राशि एक संख्या होनी चाहिए`);
    }
    if (!rowData.registration_date || !rowData.registration_date.toString().trim()) {
      errors.push(`Row ${rowIndex}: पंजीकरण तिथि आवश्यक है`);
    }
    
    return errors;
  };

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
    setUploadProgress(0);
    setUploadErrors([]);
    setUploadSuccessCount(0);

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
            setApiError("Excel फाइल में कोई डेटा नहीं है");
            setIsUploading(false);
            return;
          }

          const dataRows = jsonData.slice(1);
          const headers = jsonData[0];

          const headerMapping = {};
          headers.forEach((header, index) => {
            if (header) {
              headerMapping[header.toString().trim().toLowerCase()] = index;
            }
          });

          // Parse all rows
          const parsedRows = dataRows.map((row, rowIndex) => {
            return {
              nursery_name: (row[headerMapping["नर्सरी का नाम"]] || row[headerMapping["nursery_name"]] || "").toString().trim(),
              standard_item: (row[headerMapping["मानक आइटम"]] || row[headerMapping["standard_item"]] || "").toString().trim(),
              allocated_amount: parseFloat(row[headerMapping["धनराशि"]] || row[headerMapping["allocated_amount"]] || 0),
              spent_amount: parseFloat(row[headerMapping["व्यय राशि"]] || row[headerMapping["spent_amount"]] || 0),
              description: (row[headerMapping["विवरण"]] || row[headerMapping["description"]] || "").toString().trim(),
              registration_date: row[headerMapping["पंजीकरण तिथि"]] || row[headerMapping["registration_date"]] || new Date().toISOString().split('T')[0],
              rowIndex: rowIndex + 2,
            };
          });

          // Validate all rows first
          const allErrors = [];
          const validRows = [];

          parsedRows.forEach((rowData) => {
            const rowErrors = validateRow(rowData, rowData.rowIndex);
            if (rowErrors.length > 0) {
              allErrors.push(...rowErrors);
            } else {
              validRows.push(rowData);
            }
          });

          if (validRows.length === 0) {
            const errorMessage = `कोई मान्य डेटा नहीं मिला:\n${allErrors.slice(0, 5).join("\n")}${allErrors.length > 5 ? `\n... और ${allErrors.length - 5} अन्य त्रुटियां` : ""}`;
            setApiError(errorMessage);
            setUploadErrors(allErrors);
            setIsUploading(false);
            return;
          }

          setUploadTotal(validRows.length);
          setUploadSuccessCount(0);
          setUploadErrors(allErrors);

          // Process rows individually
          let successCount = 0;
          const failedIndices = [];
          
          for (let i = 0; i < validRows.length; i++) {
            try {
              const rowData = validRows[i];
              const { rowIndex, ...payload } = rowData;
              
              const response = await axios.post(NURSERY_FINANCIAL_API_URL, payload);

              if (response.status === 200 || response.status === 201) {
                successCount++;
                setAllNurseryFinancialItems((prev) => [payload, ...prev]);
              } else {
                failedIndices.push(rowIndex);
              }
            } catch (error) {
              const rowIndex = validRows[i].rowIndex;
              const errorMsg = error.response?.data?.message || 
                             error.response?.data?.error || 
                             error.message || 
                             "Upload failed";
              
              allErrors.push(`Row ${rowIndex}: ${errorMsg}`);
              failedIndices.push(rowIndex);
            }

            // Update progress
            const progress = Math.round(((i + 1) / validRows.length) * 100);
            setUploadProgress(progress);
          }

          setExcelFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          // Generate final response message
          const totalErrors = allErrors.length;
          if (successCount > 0 && totalErrors === 0) {
            setApiResponse({
              message: `✅ सफलता! ${successCount} रिकॉर्ड सफलतापूर्वक अपलोड किए गए।`,
            });
          } else if (successCount > 0 && totalErrors > 0) {
            const errorMsg = `⚠️ आंशिक अपलोड: ${successCount} सफल, ${totalErrors} विफल।\n\nविफल रिकॉर्ड:\n${allErrors.slice(0, 10).join("\n")}${totalErrors > 10 ? `\n... और ${totalErrors - 10} अन्य त्रुटियां` : ""}`;
            setApiError(errorMsg);
          } else if (totalErrors > 0) {
            const errorMsg = `❌ अपलोड विफल: सभी रिकॉर्ड विफल रहे।\n\nत्रुटियां:\n${allErrors.slice(0, 10).join("\n")}${totalErrors > 10 ? `\n... और ${totalErrors - 10} अन्य त्रुटियां` : ""}`;
            setApiError(errorMsg);
          }
        } catch (parseError) {
          console.error("Error parsing Excel file:", parseError);
          setApiError(`Excel फाइल पार्सिंग में त्रुटि: ${parseError.message}`);
        }
      };
      reader.readAsArrayBuffer(excelFile);
    } catch (error) {
      console.error("Error reading file:", error);
      setApiError(`फाइल पढ़ने में त्रुटि: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear otherMode only when selecting an existing option from the dropdown (not when typing in text input)
    if (name === "nursery_name" && value !== "अन्य" && otherMode.nursery_name && e.target.tagName === "SELECT") {
      setOtherMode(prev => ({ ...prev, nursery_name: false }));
    }
    
    // Same for standard_item
    if (name === "standard_item" && value !== "अन्य" && otherMode.standard_item && e.target.tagName === "SELECT") {
      setOtherMode(prev => ({ ...prev, standard_item: false }));
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
      const payload = {
        nursery_name: formData.nursery_name,
        standard_item: formData.standard_item,
        allocated_amount: parseFloat(formData.allocated_amount),
        spent_amount: parseFloat(formData.spent_amount),
        description: formData.description || "",
        registration_date: formData.registration_date,
      };

      const response = await axios.post(NURSERY_FINANCIAL_API_URL, payload);

      const responseData =
        response.data && response.data.data
          ? response.data.data
          : response.data;
      setApiResponse(responseData);

      setFormData({
        nursery_name: "",
        standard_item: "",
        allocated_amount: "",
        spent_amount: "",
        description: "",
        registration_date: new Date().toISOString().split('T')[0],
      });

      setAllNurseryFinancialItems((prev) => [payload, ...prev]);
    } catch (error) {
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
    if (!formData.nursery_name.trim())
      newErrors.nursery_name = `${translations.nurseryName} ${translations.required}`;
    if (!formData.standard_item.trim())
      newErrors.standard_item = `${translations.standardItem} ${translations.required}`;
    if (!formData.allocated_amount.trim())
      newErrors.allocated_amount = `${translations.allocatedAmount} ${translations.required}`;
    if (!formData.spent_amount.trim())
      newErrors.spent_amount = `${translations.spentAmount} ${translations.required}`;
    if (!formData.registration_date.trim())
      newErrors.registration_date = `${translations.registrationDate} ${translations.required}`;
    return newErrors;
  };

  // Generate pagination items
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

  return (
    <div>
      {isAdmin && <DashBoardHeader />}
      <Container fluid className={isAdmin ? "p-4" : "p-0"} style={isAdmin ? {} : { marginTop: "70px", paddingTop: "15px" }}>
        <Row className={isAdmin ? "left-top" : "w-100 m-0"}>
          <Col lg={12} md={12} sm={12} className={isAdmin ? "p-0" : "p-3"}>
            <Container fluid className={isAdmin ? "dashboard-body-main bg-home" : "dashboard-body-main bg-home"} style={isAdmin ? {} : { paddingTop: "10px" }}>
              <h1 className="page-title">{translations.pageTitle}</h1>

              {/* Progress Bar Section - Displayed at top during upload */}
              {isUploading && uploadTotal > 0 && (
                <Row className="mb-4">
                  <Col xs={12}>
                    <div className="p-3 border rounded bg-light">
                      <div className="mb-3">
                        <h6 className="small-fonts mb-3">📊 अपलोड प्रगति विवरण</h6>
                        <div className="d-flex justify-content-around mb-3">
                          <div className="text-center">
                            <small className="text-dark fw-bold d-block mb-2">✅ पूर्ण</small>
                            <span className="badge bg-success" style={{ fontSize: "14px", padding: "8px 12px" }}>
                              {Math.round((uploadProgress / 100) * uploadTotal)}
                            </span>
                          </div>
                          <div className="text-center">
                            <small className="text-dark fw-bold d-block mb-2">⏳ शेष</small>
                            <span className="badge bg-warning text-dark" style={{ fontSize: "14px", padding: "8px 12px" }}>
                              {uploadTotal - Math.round((uploadProgress / 100) * uploadTotal)}
                            </span>
                          </div>
                          <div className="text-center">
                            <small className="text-dark fw-bold d-block mb-2">📁 कुल</small>
                            <span className="badge bg-primary" style={{ fontSize: "14px", padding: "8px 12px" }}>
                              {uploadTotal}
                            </span>
                          </div>
                          <div className="text-center">
                            <small className="text-dark fw-bold d-block mb-2">⚡ प्रगति</small>
                            <span className="badge bg-info text-white" style={{ fontSize: "14px", padding: "8px 12px" }}>
                              {uploadProgress}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="progress" style={{ height: "30px" }}>
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                          role="progressbar"
                          style={{ width: `${uploadProgress}%` }}
                          aria-valuenow={uploadProgress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          <small className="fw-bold text-white">{uploadProgress}%</small>
                        </div>
                      </div>
                      <small className="text-muted mt-2 d-block text-center">
                        {uploadProgress > 0 && uploadProgress < 100
                          ? `${Math.round((uploadProgress / 100) * uploadTotal)}/${uploadTotal} रिकॉर्ड अपलोड किए जा रहे हैं...`
                          : "तैयारी..."}
                      </small>
                    </div>
                  </Col>
                </Row>
              )}

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
                  <div className="w-100">
                    <Button
                      variant="secondary"
                      onClick={handleBulkUpload}
                      disabled={!excelFile || isUploading}
                      className="compact-submit-btn w-100"
                    >
                      {isUploading
                        ? `अपलोड हो रहा है... ${uploadProgress}%`
                        : translations.uploadButton}
                    </Button>
                  </div>
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
                  <div style={{ whiteSpace: "pre-wrap" }}>{apiResponse.message}</div>
                </Alert>
              )}
              {apiError && (
                <Alert variant="danger" className="small-fonts">
                  <div style={{ whiteSpace: "pre-wrap", maxHeight: "300px", overflowY: "auto" }}>
                    {apiError}
                  </div>
                </Alert>
              )}
              {uploadErrors.length > 0 && !isUploading && (
                <Alert variant="warning" className="small-fonts">
                  <strong>📋 विस्तृत त्रुटि लॉग ({uploadErrors.length} समस्याएं):</strong>
                  <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "10px" }}>
                    {uploadErrors.map((error, idx) => (
                      <div key={idx} style={{ marginBottom: "5px", fontSize: "12px" }}>
                        • {error}
                      </div>
                    ))}
                  </div>
                </Alert>
              )}

              {/* Excel Upload Instructions */}
              <Alert variant="info" className="small-fonts mb-3">
                <strong>Excel अपलोड निर्देश:</strong>
                <ul className="mb-0">
                  <li>कृपया सही फॉर्मेट में Excel फाइल अपलोड करें</li>
                  <li>
                    <strong>अनिवार्य फ़ील्ड:</strong> नर्सरी का नाम, मानक आइटम, धनराशि, व्यय राशि, पंजीकरण तिथि
                  </li>
                  <li>धनराशि और व्यय राशि संख्यात्मक होनी चाहिए</li>
                  <li>डाउनलोड टेम्पलेट बटन का उपयोग करें सही फॉर्मेट के लिए</li>
                </ul>
              </Alert>

              {/* Entry Form Section */}
              <Form
                onSubmit={handleSubmit}
                className="registration-form compact-form"
              >
                <Row>
                  <Col xs={12} sm={6} md={4}>
                    <Form.Group className="mb-2" controlId="nursery_name">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.nurseryName}
                      </Form.Label>
                      {otherMode.nursery_name ? (
                        <div className="d-flex">
                          <Form.Control
                            type="text"
                            name="nursery_name"
                            value={formData.nursery_name}
                            onChange={handleChange}
                            isInvalid={!!errors.nursery_name}
                            className="compact-input"
                            placeholder="नर्सरी का नाम दर्ज करें"
                            autoFocus
                          />
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              setOtherMode(prev => ({ ...prev, nursery_name: false }));
                              setFormData(prev => ({ ...prev, nursery_name: "" }));
                            }}
                            className="ms-1"
                            title="वापस सूची में जाएं"
                          >
                            ↺
                          </Button>
                        </div>
                      ) : (
                        <Form.Select
                          name="nursery_name"
                          value={formData.nursery_name}
                          onChange={(e) => {
                            if (e.target.value === "अन्य") {
                              setOtherMode(prev => ({ ...prev, nursery_name: true }));
                              setFormData(prev => ({ ...prev, nursery_name: "" }));
                            } else {
                              handleChange(e);
                            }
                          }}
                          isInvalid={!!errors.nursery_name}
                          className="compact-input"
                        >
                          <option value="">{translations.selectOption}</option>
                          {filterOptions.nursery_name.map((item, index) => (
                            <option key={index} value={item}>
                              {item}
                            </option>
                          ))}
                          <option value="अन्य">अन्य (नया जोड़ें)</option>
                        </Form.Select>
                      )}
                      <Form.Control.Feedback type="invalid">
                        {errors.nursery_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <Form.Group className="mb-2" controlId="standard_item">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.standardItem}
                      </Form.Label>
                      {otherMode.standard_item ? (
                        <div className="d-flex">
                          <Form.Control
                            type="text"
                            name="standard_item"
                            value={formData.standard_item}
                            onChange={handleChange}
                            isInvalid={!!errors.standard_item}
                            className="compact-input"
                            placeholder="मानक आइटम दर्ज करें"
                            autoFocus
                          />
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => setOtherMode(prev => ({ ...prev, standard_item: false }))}
                            className="ms-1"
                            title="वापस सूची में जाएं"
                          >
                            ↺
                          </Button>
                        </div>
                      ) : (
                        <Form.Select
                          name="standard_item"
                          value={formData.standard_item}
                          onChange={(e) => {
                            if (e.target.value === "अन्य") {
                              setOtherMode(prev => ({ ...prev, standard_item: true }));
                              setFormData(prev => ({ ...prev, standard_item: "" }));
                            } else {
                              handleChange(e);
                            }
                          }}
                          isInvalid={!!errors.standard_item}
                          className="compact-input"
                        >
                          <option value="">{translations.selectOption}</option>
                          {filterOptions.standard_item.map((item, index) => (
                            <option key={index} value={item}>
                              {item}
                            </option>
                          ))}
                          <option value="अन्य">अन्य (नया जोड़ें)</option>
                        </Form.Select>
                      )}
                      <Form.Control.Feedback type="invalid">
                        {errors.standard_item}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <Form.Group className="mb-2" controlId="registration_date">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.registrationDate}
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="registration_date"
                        value={formData.registration_date}
                        onChange={handleChange}
                        isInvalid={!!errors.registration_date}
                        className="compact-input"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.registration_date}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={6} md={4}>
                    <Form.Group className="mb-2" controlId="allocated_amount">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.allocatedAmount}
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="allocated_amount"
                        value={formData.allocated_amount}
                        onChange={handleChange}
                        isInvalid={!!errors.allocated_amount}
                        className="compact-input"
                        placeholder="धनराशि दर्ज करें"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.allocated_amount}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={4}>
                    <Form.Group className="mb-2" controlId="spent_amount">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.spentAmount}
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="spent_amount"
                        value={formData.spent_amount}
                        onChange={handleChange}
                        isInvalid={!!errors.spent_amount}
                        className="compact-input"
                        placeholder="व्यय राशि दर्ज करें"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.spent_amount}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={4} className="d-flex align-items-center">
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
                <Row>
                  <Col xs={12} sm={6} md={8}>
                    <Form.Group className="mb-2" controlId="description">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.description}
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="compact-input"
                        placeholder="विवरण (वैकल्पिक)"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>

              {/* Table Section */}
              <div className="billing-table-section mt-4">
                <div className="pdf-button-section">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      {nurseryFinancialItems.length > 0 && (
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
                                  `NurseryFinancialEntry_${new Date()
                                    .toISOString()
                                    .slice(0, 10)}`,
                                  nurseryFinancialColumnMapping,
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
                                  `NurseryFinancialEntry_${new Date()
                                    .toISOString()
                                    .slice(0, 10)}`,
                                  nurseryFinancialColumnMapping,
                                  selectedColumns,
                                  "नर्सरी वित्तीय प्रविष्टि डेटा"
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
                </div>

                {/* Column Selection Section */}
                {true && (
                  <ColumnSelection
                    columns={nurseryFinancialTableColumns}
                    selectedColumns={selectedColumns}
                    setSelectedColumns={setSelectedColumns}
                    title="कॉलम चुनें"
                  />
                )}

                {/* Table info with pagination details */}
                {filters.from_date && filters.to_date && filteredItems.length > 0 && (
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

                {/* Multi-Filter Section */}
                {true && (
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
                            {translations.fromDate}
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={filters.from_date}
                            onChange={(e) => setFilters(prev => ({ ...prev, from_date: e.target.value }))}
                            className="compact-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small-fonts fw-bold">
                            {translations.toDate}
                          </Form.Label>
                          <Form.Control
                            type="date"
                            value={filters.to_date}
                            onChange={(e) => setFilters(prev => ({ ...prev, to_date: e.target.value }))}
                            className="compact-input"
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12} sm={6} md={3}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small-fonts fw-bold">
                            {translations.nurseryName}
                          </Form.Label>
                          <Select
                            isMulti
                            name="nursery_name"
                            value={filters.nursery_name.map((val) => ({
                              value: val,
                              label: val,
                            }))}
                            onChange={(selected) => {
                              setFilters((prev) => ({
                                ...prev,
                                nursery_name: selected
                                  ? selected.map((s) => s.value)
                                  : [],
                              }));
                            }}
                            options={filterOptions.nursery_name.map((option) => ({
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
                            {translations.standardItem}
                          </Form.Label>
                          <Select
                            isMulti
                            name="standard_item"
                            value={filters.standard_item.map((val) => ({
                              value: val,
                              label: val,
                            }))}
                            onChange={(selected) => {
                              setFilters((prev) => ({
                                ...prev,
                                standard_item: selected
                                  ? selected.map((s) => s.value)
                                  : [],
                              }));
                            }}
                            options={filterOptions.standard_item.map((option) => ({
                              value: option,
                              label: option,
                            }))}
                            className="compact-input"
                            placeholder="चुनें"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Table is only visible when date range is selected */}
                {!filters.from_date || !filters.to_date ? (
                  <Alert variant="info" className="text-center">
                    कृपया तिथि रेंज चुनें ताकि डेटा दिखाई दे
                  </Alert>
                ) : isLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">लोड हो रहा है...</span>
                    </div>
                    <p className="mt-2 small-fonts">डेटा लोड हो रहा है...</p>
                  </div>
                ) : nurseryFinancialItems.length === 0 ? (
                  <Alert variant="info" className="text-center">
                    कोई नर्सरी वित्तीय डेटा उपलब्ध नहीं है।
                  </Alert>
                ) : (
                  <>
                    <Table striped bordered hover className="registration-form">
                      <thead className="table-light">
                        <tr>
                          <th>क्र.सं.</th>
                          {selectedColumns.includes("nursery_name") && (
                            <th>{translations.nurseryName}</th>
                          )}
                          {selectedColumns.includes("standard_item") && (
                            <th>{translations.standardItem}</th>
                          )}
                          {selectedColumns.includes("allocated_amount") && (
                            <th>{translations.allocatedAmount}</th>
                          )}
                          {selectedColumns.includes("spent_amount") && (
                            <th>{translations.spentAmount}</th>
                          )}
                          {selectedColumns.includes("description") && (
                            <th>{translations.description}</th>
                          )}
                          {selectedColumns.includes("registration_date") && (
                            <th>{translations.registrationDate}</th>
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
                              {selectedColumns.includes("nursery_name") && (
                                <td>
                                  {editingRowId === item.id ? (
                                    <Form.Control
                                      type="text"
                                      value={editingValues.nursery_name}
                                      onChange={(e) =>
                                        setEditingValues((prev) => ({
                                          ...prev,
                                          nursery_name: e.target.value,
                                        }))
                                      }
                                      size="sm"
                                    />
                                  ) : (
                                    item.nursery_name
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("standard_item") && (
                                <td>
                                  {editingRowId === item.id ? (
                                    <Form.Select
                                      value={editingValues.standard_item}
                                      onChange={(e) =>
                                        setEditingValues((prev) => ({
                                          ...prev,
                                          standard_item: e.target.value,
                                        }))
                                      }
                                      size="sm"
                                    >
                                      <option value="">चुनें</option>
                                      {filterOptions.standard_item.map((opt, idx) => (
                                        <option key={idx} value={opt}>
                                          {opt}
                                        </option>
                                      ))}
                                    </Form.Select>
                                  ) : (
                                    item.standard_item
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("allocated_amount") && (
                                <td>
                                  {editingRowId === item.id ? (
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      value={editingValues.allocated_amount}
                                      onChange={(e) =>
                                        setEditingValues((prev) => ({
                                          ...prev,
                                          allocated_amount: e.target.value,
                                        }))
                                      }
                                      size="sm"
                                    />
                                  ) : (
                                    parseFloat(item.allocated_amount).toFixed(2)
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("spent_amount") && (
                                <td>
                                  {editingRowId === item.id ? (
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      value={editingValues.spent_amount}
                                      onChange={(e) =>
                                        setEditingValues((prev) => ({
                                          ...prev,
                                          spent_amount: e.target.value,
                                        }))
                                      }
                                      size="sm"
                                    />
                                  ) : (
                                    parseFloat(item.spent_amount).toFixed(2)
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("description") && (
                                <td>
                                  {editingRowId === item.id ? (
                                    <Form.Control
                                      as="textarea"
                                      rows={1}
                                      value={editingValues.description}
                                      onChange={(e) =>
                                        setEditingValues((prev) => ({
                                          ...prev,
                                          description: e.target.value,
                                        }))
                                      }
                                      size="sm"
                                    />
                                  ) : (
                                    item.description || "-"
                                  )}
                                </td>
                              )}
                              {selectedColumns.includes("registration_date") && (
                                <td>
                                  {editingRowId === item.id ? (
                                    <Form.Control
                                      type="date"
                                      value={editingValues.registration_date}
                                      onChange={(e) =>
                                        setEditingValues((prev) => ({
                                          ...prev,
                                          registration_date: e.target.value,
                                        }))
                                      }
                                      size="sm"
                                    />
                                  ) : (
                                    item.registration_date ? new Date(item.registration_date).toLocaleDateString("hi-IN") : "-"
                                  )}
                                </td>
                              )}
                              <td>
                                {editingRowId === item.id ? (
                                  <div className="d-flex gap-1">
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      onClick={() => handleSave(item)}
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
                                  </div>
                                ) : (
                                  <div className="d-flex gap-1">
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => handleEdit(item)}
                                    >
                                      संपादित करें
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => handleDelete(item)}
                                    >
                                      <RiDeleteBinLine />
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        {/* Total Row */}
                        {currentPage === Math.ceil(filteredItems.length / itemsPerPage) && filteredItems.length > 0 && (
                          <tr style={{ backgroundColor: "#e8e8e8", fontWeight: "bold" }}>
                            <td><strong>कुल</strong></td>
                            {selectedColumns.includes("nursery_name") && (
                              <td>
                                <strong>{new Set(filteredItems.map(item => item.nursery_name)).size}</strong>
                              </td>
                            )}
                            {selectedColumns.includes("standard_item") && (
                              <td>
                                <strong>{new Set(filteredItems.map(item => item.standard_item)).size}</strong>
                              </td>
                            )}
                            {selectedColumns.includes("allocated_amount") && (
                              <td>
                                <strong>
                                  {filteredItems.reduce((total, item) => {
                                    const value = parseFloat(item.allocated_amount) || 0;
                                    return total + value;
                                  }, 0).toFixed(2)}
                                </strong>
                              </td>
                            )}
                            {selectedColumns.includes("spent_amount") && (
                              <td>
                                <strong>
                                  {filteredItems.reduce((total, item) => {
                                    const value = parseFloat(item.spent_amount) || 0;
                                    return total + value;
                                  }, 0).toFixed(2)}
                                </strong>
                              </td>
                            )}
                            {selectedColumns.includes("description") && (
                              <td></td>
                            )}
                            {selectedColumns.includes("registration_date") && (
                              <td></td>
                            )}
                            <td></td>
                          </tr>
                        )}
                      </tbody>
                    </Table>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-3">
                        <Pagination>
                          <Pagination.Prev
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          />
                          {paginationItems}
                          <Pagination.Next
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
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

export default NurseryFinancialEntry;
