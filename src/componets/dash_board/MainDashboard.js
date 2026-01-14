import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Table,
  FormCheck,
  Modal,
} from "react-bootstrap";
import Select from "react-select";
import "../../assets/css/registration.css";
import DashBoardHeader from "./DashBoardHeader";
import { BiFilter } from "react-icons/bi";
import {
  RiFilter2Line,
  RiFileExcelLine,
  RiFilePdfLine,
  RiAddLine,
  RiDeleteBinLine,
  RiEyeLine,
} from "react-icons/ri";
import "../../assets/css/MainDashBoard.css";
import { IoMdRefresh } from "react-icons/io";
import * as XLSX from "xlsx";
import html2pdf from "html2pdf.js";

const API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/";

// Hindi translations for form
const translations = {
  pageTitle: "मुख्य डैशबोर्ड",
  centerName: "केंद्र का नाम",
  investmentName: "निवेश का नाम",
  subInvestmentName: "उप-निवेश का नाम",
  sourceOfReceipt: "सप्लायर",
  schemeName: "योजना का नाम",
  vikasKhandName: "विकास खंड का नाम",
  vidhanSabhaName: "विधानसभा का नाम",
  selectOption: "चुनें",
};

// Define the table column order
const tableColumnOrder = [
  "center_name",
  "vidhan_sabha_name",
  "vikas_khand_name",
  "scheme_name",
  "source_of_receipt",
  "investment_name",
  "sub_investment_name",
  "allocated_quantity",
  "amount_of_farmer_share",
  "amount_of_subsidy",
  "total_amount"
];

// Column definitions
const columnDefs = {
  center_name: { label: translations.centerName, key: "center_name" },
  vidhan_sabha_name: {
    label: translations.vidhanSabhaName,
    key: "vidhan_sabha_name",
  },
  vikas_khand_name: {
    label: translations.vikasKhandName,
    key: "vikas_khand_name",
  },
  scheme_name: { label: translations.schemeName, key: "scheme_name" },
  source_of_receipt: {
    label: translations.sourceOfReceipt,
    key: "source_of_receipt",
  },
  investment_name: {
    label: translations.investmentName,
    key: "investment_name",
  },
  sub_investment_name: {
    label: translations.subInvestmentName,
    key: "sub_investment_name",
  },
  unit: { label: "इकाई", key: "unit", hidden: true },
  allocated_quantity: { label: "आवंटित मात्रा", key: "allocated_quantity" },
  rate: { label: "दर", key: "rate", hidden: true },
  amount_of_farmer_share: { label: "किसान की हिस्सेदारी की राशि", key: "amount_of_farmer_share" },
  amount_of_subsidy: { label: "सब्सिडी की राशि", key: "amount_of_subsidy" },
  total_amount: { label: "कुल राशि", key: "total_amount" },
};

const MainDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);
  const itemsPerPage = 50;
  const isTableFiltered = filteredTableData.length !== tableData.length;

  // State for filters
  const [filters, setFilters] = useState({
    center_name: [],
    sub_investment_name: [],
    investment_name: [],
    source_of_receipt: [],
    scheme_name: [],
    vikas_khand_name: [],
    vidhan_sabha_name: [],
    unit: [], // Keep for filtering but not display
  });

  // State for dropdown visibility
  const [dropdownOpen, setDropdownOpen] = useState({
    center_name: false,
    sub_investment_name: false,
    investment_name: false,
    source_of_receipt: false,
    scheme_name: false,
    vikas_khand_name: false,
    vidhan_sabha_name: false,
    unit: false, // Keep for filtering but not display
  });

  // State for filter options (populated from API)
  const [filterOptions, setFilterOptions] = useState({
    center_name: [],
    sub_investment_name: [],
    investment_name: [],
    source_of_receipt: [],
    scheme_name: [],
    vikas_khand_name: [],
    vidhan_sabha_name: [],
    unit: [], // Keep for filtering but not display
  });

  // State for detailed view
  const [view, setView] = useState("main");
  const [selectedItem, setSelectedItem] = useState(null);

  const [detailedDropdownOpen, setDetailedDropdownOpen] = useState({});
  const [filterStack, setFilterStack] = useState([]);
  const [selectedTotalColumn, setSelectedTotalColumn] = useState(null);
  const [tablesForExport, setTablesForExport] = useState({
    pdf: [],
    excel: [],
  });
  const [showDetailed, setShowDetailed] = useState(false);
  const [additionalTables, setAdditionalTables] = useState([]);
  const [additionalTableFilters, setAdditionalTableFilters] = useState({});
  const [additionalTableColumnFilters, setAdditionalTableColumnFilters] = useState({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState("pdf");
  const [tableName, setTableName] = useState("");
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [currentTableForExport, setCurrentTableForExport] = useState(null);
  const [showTableSelectionModal, setShowTableSelectionModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewType, setPreviewType] = useState("pdf");

  // Fetch data from API and populate filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extract unique values for each filter field
        const uniqueOptions = {
          center_name: [
            ...new Set(data.map((item) => item.center_name).filter(Boolean)),
          ],
          sub_investment_name: [
            ...new Set(
              data.map((item) => item.sub_investment_name).filter(Boolean)
            ),
          ],
          investment_name: [
            ...new Set(
              data.map((item) => item.investment_name).filter(Boolean)
            ),
          ],
          source_of_receipt: [
            ...new Set(
              data.map((item) => item.source_of_receipt).filter(Boolean)
            ),
          ],
          scheme_name: [
            ...new Set(data.map((item) => item.scheme_name).filter(Boolean)),
          ],
          vikas_khand_name: [
            ...new Set(
              data.map((item) => item.vikas_khand_name).filter(Boolean)
            ),
          ],
          vidhan_sabha_name: [
            ...new Set(
              data.map((item) => item.vidhan_sabha_name).filter(Boolean)
            ),
          ],
          unit: [
            ...new Set(
              data.map((item) => item.unit).filter(Boolean)
            ),
          ],
        };

        setTableData(data);
        setFilteredTableData(data);
        setFilterOptions((prev) => ({
          ...prev,
          ...uniqueOptions,
        }));

        setError(null);
      } catch (err) {
        console.error("Error fetching filter options:", err);
        setError("फ़िल्टर विकल्प लोड करने में विफल।");
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters = {
      center_name: [],
      sub_investment_name: [],
      investment_name: [],
      source_of_receipt: [],
      scheme_name: [],
      vikas_khand_name: [],
      vidhan_sabha_name: [],
      unit: [], // Keep for filtering but not display
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    setIsFilterApplied(false);
    setView("main");
    setFilterStack([]);
    setSelectedItem(null);
    setShowDetailed(false);
    setAdditionalTables([]);

    // Refresh table with all data
    setFilteredTableData(tableData);
    // Ensure the summary heading updates immediately
    checkIfTopFiltersApplied();
  };

  // Check if filters are applied from top filtering
  const checkIfTopFiltersApplied = () => {
    const hasFilters = Object.values(filters).some(filter => filter.length > 0);
    setIsFilterApplied(hasFilters);
  };

  // Handle cell click for detailed view
  const handleCellClick = (column, value) => {
    setSelectedItem({ column, value });

    // Get all unique values for this column from filtered data
    const allValues = [
      ...new Set(filteredTableData.map((item) => item[column]).filter(Boolean)),
    ];

    // Create checked object with all values initialized to false
    // Then set the clicked value to true
    const checked = {};
    allValues.forEach((val) => {
      checked[val] = false;
    });
    checked[value] = true;

    // Set up filter stack with this column's filter
    // Check if a filter for this column already exists
    const existingFilterIndex = filterStack.findIndex(
      (filter) => filter.column === column
    );

    if (existingFilterIndex >= 0) {
      // Filter for this column already exists, update it
      setFilterStack((prev) => {
        const newStack = [...prev];
        newStack[existingFilterIndex] = { column, checked };
        return newStack;
      });
    } else {
      // No filter for this column exists, create new one
      const newFilter = { column, checked };
      setFilterStack((prev) => [...prev, newFilter]);
    }

    setView("detail");
    setShowDetailed(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredTableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredTableData.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Helper to add "सभी चुनें" option to select
  const getOptionsWithAll = (options) => [
    { value: "ALL", label: "सभी चुनें" },
    ...options.map((option) => ({ value: option, label: option })),
  ];

  // Handle select change with "सभी चुनें" option
  const handleSelectChange = (name, selected) => {
    if (selected && selected.some((s) => s.value === "ALL")) {
      // If "सभी चुनें" is selected, set filter to all options
      setFilters((prev) => {
        const newFilters = {
          ...prev,
          [name]: filterOptions[name] || [],
        };
        // Immediately apply filters for better UX
        applyFilters();
        return newFilters;
      });
    } else {
      setFilters((prev) => {
        const newFilters = {
          ...prev,
          [name]: selected ? selected.map((s) => s.value) : [],
        };
        // Immediately apply filters for better UX
        applyFilters();
        return newFilters;
      });
    }
  };

  // Toggle dropdown visibility
  const toggleDropdown = (name) => {
    setDropdownOpen((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Toggle detailed dropdown
  const toggleDetailedDropdown = (filterIndex) => {
    setDetailedDropdownOpen((prev) => ({
      ...prev,
      [filterIndex]: !prev[filterIndex],
    }));
  };

  // Handle detailed checkbox change
  const handleDetailedCheckboxChange = (filterIndex, val) => {
    // Ensure filterIndex is treated as a string
    const filterIndexStr = String(filterIndex);

    if (filterIndexStr.startsWith("additional_")) {
      // Handle additional table filters
      const tableIndex = parseInt(filterIndexStr.split("_")[1]);
      setAdditionalTables((prev) => {
        const newTables = [...prev];
        const table = newTables[tableIndex];
        const columnKey = Object.keys(columnDefs).find(
          (k) => columnDefs[k].label === table.columns[0]
        );
        if (!columnKey) return prev;

        // Get all unique values for this column from the currently filtered data
        const currentFilteredData = tableData.filter((item) => {
          for (let filter of filterStack) {
            if (!filter.checked[item[filter.column]]) return false;
          }
          return true;
        });

        const allValues = [
          ...new Set(
            currentFilteredData.map((item) => item[columnKey]).filter(Boolean)
          ),
        ];

        // Create a checked object with all values initialized to false
        const checked = {};
        allValues.forEach((val) => {
          checked[val] = table.data.some(row => row[table.columns[0]] === val);
        });

        if (val === "SELECT_ALL") {
          const allSelected = Object.values(checked).every(Boolean);
          // Toggle: if all are selected, deselect all; otherwise select all
          allValues.forEach((v) => (checked[v] = !allSelected));
        } else {
          checked[val] = !checked[val];
        }

        // Update the table data based on the new checked values
        const newData = currentFilteredData.filter((item) => checked[item[columnKey]]);
        const summary = generateSummary(newData, columnKey);
        newTables[tableIndex] = {
          ...table,
          data: summary.data,
          columns: summary.columns,
          columnKey: summary.columnKey,
        };

        return newTables;
      });
    } else {
      // Handle filter stack changes
      setFilterStack((prev) => {
        const newStack = prev.map((filter, idx) => {
          if (idx !== filterIndex) return filter;

          // Calculate currentFilteredData for this filter
          const currentFilteredData = tableData.filter((item) => {
            for (let i = 0; i < prev.length; i++) {
              if (i === filterIndex) continue;
              const f = prev[i];
              if (!f.checked[item[f.column]]) return false;
            }
            return true;
          });

          const allValues = [...new Set(currentFilteredData.map((item) => item[filter.column]).filter(Boolean))];

          // Create newChecked with only current allValues, preserving previous selections if available
          const newChecked = {};
          allValues.forEach((v) => {
            newChecked[v] = filter.checked[v] || false;
          });

          if (val === "SELECT_ALL") {
            const currentlyAllSelected = allValues.every((k) => newChecked[k]);
            // Toggle: if all are selected, deselect all; otherwise select all
            allValues.forEach((k) => (newChecked[k] = !currentlyAllSelected));
          } else {
            newChecked[val] = !newChecked[val];
          }

          return { ...filter, checked: newChecked };
        });
        return newStack;
      });
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest(".dropdown")) {
      setDropdownOpen({
        center_name: false,
        sub_investment_name: false,
        investment_name: false,
        source_of_receipt: false,
        scheme_name: false,
        vikas_khand_name: false,
        vidhan_sabha_name: false,
        unit: false, // Keep for filtering but not display
      });
    }
  };

  // Add event listener for clicking outside
  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Handle checkbox change in dropdown
  const handleCheckboxChange = (name, value) => {
    if (value === "SELECT_ALL") {
      // Toggle select all
      setFilters((prev) => {
        const allOptions = filterOptions[name] || [];
        const currentValues = prev[name] || [];
        const areAllSelected = allOptions.every((option) =>
          currentValues.includes(option)
        );
        const newFilters = {
          ...prev,
          [name]: areAllSelected ? [] : allOptions,
        };
        // Immediately apply filters for better UX
        applyFilters();
        return newFilters;
      });
    } else {
      setFilters((prev) => {
        const currentValues = prev[name] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        const newFilters = { ...prev, [name]: newValues };
        // Immediately apply filters for better UX
        applyFilters();
        return newFilters;
      });
    }
  };

  // Apply filters
  const applyFilters = () => {
    setIsApplyingFilters(true);
    const filteredData = tableData.filter((item) => {
      return (
        (filters.center_name.length === 0 ||
          filters.center_name.includes(item.center_name)) &&
        (filters.vikas_khand_name.length === 0 ||
          filters.vikas_khand_name.includes(item.vikas_khand_name)) &&
        (filters.vidhan_sabha_name.length === 0 ||
          filters.vidhan_sabha_name.includes(item.vidhan_sabha_name)) &&
        (filters.investment_name.length === 0 ||
          filters.investment_name.includes(item.investment_name)) &&
        (filters.sub_investment_name.length === 0 ||
          filters.sub_investment_name.includes(item.sub_investment_name)) &&
        (filters.source_of_receipt.length === 0 ||
          filters.source_of_receipt.includes(item.source_of_receipt)) &&
        (filters.scheme_name.length === 0 ||
          filters.scheme_name.includes(item.scheme_name)) &&
        (filters.unit.length === 0 || // Keep for filtering but not display
          filters.unit.includes(item.unit))
      );
    });
    setFilteredTableData(filteredData);
    setCurrentPage(1);
    checkIfTopFiltersApplied();
    setIsApplyingFilters(false);
  };

  // Apply filters whenever the filters state changes
  useEffect(() => {
    applyFilters();
  }, [filters]);

  // Real-time filter update effect - ensures immediate response to filter changes
  useEffect(() => {
    // This effect will trigger immediately when any filter changes
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [filters.center_name, filters.sub_investment_name,
      filters.investment_name, filters.source_of_receipt, filters.scheme_name,
      filters.vikas_khand_name, filters.vidhan_sabha_name, filters.unit]);

  // Generate summary data for a given data and column
  const generateSummary = (data, column) => {
    const uniqueValues = [...new Set(data.map(item => item[column]).filter(Boolean))];
    const summaryData = uniqueValues.map(value => {
      const dataForValue = data.filter(item => item[column] === value);
      return {
        [columnDefs[column]?.label]: value,
        "कुल रिकॉर्ड": dataForValue.length,
        ...Object.fromEntries(
          Object.keys(columnDefs)
            .filter(
              (col) =>
                col !== column &&
                col !== "allocated_quantity" &&
                col !== "rate" && // Keep for calculations but not display
                col !== "amount_of_farmer_share" &&
                col !== "amount_of_subsidy" &&
                col !== "total_amount" &&
                !columnDefs[col].hidden // Exclude hidden columns
            )
            .map((col) => [
              columnDefs[col].label,
              new Set(dataForValue.map((item) => item[col])).size,
            ])
        ),
        "कुल आवंटित मात्रा": dataForValue
          .reduce(
            (sum, item) => sum + (parseFloat(item.allocated_quantity) || 0),
            0
          )
          .toFixed(2),
        "कुल किसान की हिस्सेदारी": dataForValue
          .reduce((sum, item) => sum + (parseFloat(item.amount_of_farmer_share) || 0), 0)
          .toFixed(2),
        "कुल सब्सिडी": dataForValue
          .reduce((sum, item) => sum + (parseFloat(item.amount_of_subsidy) || 0), 0)
          .toFixed(2),
        "कुल राशि": dataForValue
          .reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0)
          .toFixed(2),
      };
    });
    
    // Create columns in the specified order
    const visibleColumns = Object.keys(columnDefs)
      .filter(col => !columnDefs[col].hidden)
      .filter(col => col !== column && col !== "allocated_quantity" && col !== "rate" && 
              col !== "amount_of_farmer_share" && col !== "amount_of_subsidy" && col !== "total_amount")
      .sort((a, b) => tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b))
      .map(key => columnDefs[key].label);
    
    const columns = [
      columnDefs[column]?.label,
      "कुल रिकॉर्ड",
      ...visibleColumns,
      "कुल आवंटित मात्रा",
      "कुल किसान की हिस्सेदारी",
      "कुल सब्सिडी",
      "कुल राशि",
    ];
    
    return { data: summaryData, columns, columnKey: column };
  };

  // Generate dynamic summary heading based on applied filters
  const getSummaryHeading = () => {
    const activeFilters = Object.entries(filters).filter(
      ([key, values]) => values.length > 0
    );

    if (activeFilters.length === 0) {
      return translations.pageTitle;
    }

    const filterLabels = {
      center_name: translations.centerName,
      investment_name: translations.investmentName,
      sub_investment_name: translations.subInvestmentName,
      source_of_receipt: translations.sourceOfReceipt,
      scheme_name: translations.schemeName,
      vikas_khand_name: translations.vikasKhandName,
      vidhan_sabha_name: translations.vidhanSabhaName,
    };

    const filterText = activeFilters
      .map(
        ([key, values]) =>
          `${filterLabels[key]}: ${
            values.length === 1 ? values[0] : `${values.length} selected`
          }`
      )
      .join(" | ");

    return `${translations.pageTitle} (${filterText})`;
  };

  // Go back one step in filter stack
  const goBack = () => {
    if (filterStack.length > 1) {
      setFilterStack((prev) => prev.slice(0, -1));
    } else {
      setView("main");
      setFilterStack([]);
      setSelectedItem(null);
    }
    setShowDetailed(false);
    setAdditionalTables([]);
  };

  // Get current table data with totals for export
  const getCurrentTableData = () => {
    if (view === "main") {
      // Calculate totals for the main table
      const totals = {
        "केंद्र का नाम": new Set(filteredTableData.map(item => item.center_name)).size,
        "विधानसभा": new Set(filteredTableData.map(item => item.vidhan_sabha_name)).size,
        "विकास खंड": new Set(filteredTableData.map(item => item.vikas_khand_name)).size,
        "योजना": new Set(filteredTableData.map(item => item.scheme_name)).size,
        "सप्लायर": new Set(filteredTableData.map(item => item.source_of_receipt)).size,
        "निवेश": new Set(filteredTableData.map(item => item.investment_name)).size,
        "उप-निवेश": new Set(filteredTableData.map(item => item.sub_investment_name)).size,
        "आवंटित मात्रा": filteredTableData.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) || 0), 0).toFixed(2),
        "किसान की हिस्सेदारी की राशि": filteredTableData.reduce((sum, item) => sum + (parseFloat(item.amount_of_farmer_share) || 0), 0).toFixed(2),
        "सब्सिडी की राशि": filteredTableData.reduce((sum, item) => sum + (parseFloat(item.amount_of_subsidy) || 0), 0).toFixed(2),
        "कुल राशि": filteredTableData.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0).toFixed(2)
      };
      
      // Also include totals for all column labels to ensure consistency
      Object.keys(columnDefs).forEach(col => {
        const label = columnDefs[col].label;
        if (!totals[label] && !columnDefs[col].hidden) {
          if (col === "allocated_quantity" || col === "rate" || col === "amount_of_farmer_share" || col === "amount_of_subsidy" || col === "total_amount") {
            totals[label] = filteredTableData.reduce((sum, item) => sum + (parseFloat(item[col]) || 0), 0).toFixed(2);
          } else {
            totals[label] = new Set(filteredTableData.map(item => item[col])).size;
          }
        }
      });

      // Create columns in the specified order
      const visibleColumns = Object.keys(columnDefs)
        .filter(col => !columnDefs[col].hidden)
        .sort((a, b) => tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b))
        .map(key => columnDefs[key].label);

      return {
        heading: getSummaryHeading(),
        data: filteredTableData,
        columns: visibleColumns,
        totals: totals
      };
    } else {
      const filteredData = tableData.filter((item) => {
        for (let filter of filterStack) {
          if (!filter.checked[item[filter.column]]) return false;
        }
        return true;
      });
      const currentFilter = filterStack[filterStack.length - 1];
      const checkedValues = Object.keys(currentFilter.checked).filter(
        (val) => currentFilter.checked[val]
      );

      if (showDetailed && checkedValues.length === 1) {
        // Calculate totals for detailed view
        const totals = {};
        Object.keys(columnDefs).forEach(col => {
          if (col !== currentFilter.column && !columnDefs[col].hidden) {
            if (col === "allocated_quantity" || col === "rate" || col === "amount_of_farmer_share" || col === "amount_of_subsidy" || col === "total_amount") {
              totals[columnDefs[col].label] = filteredData.reduce((sum, item) => sum + (parseFloat(item[col]) || 0), 0).toFixed(2);
            } else {
              totals[columnDefs[col].label] = new Set(filteredData.map(item => item[col])).size;
            }
          }
        });

        // Create columns in the specified order
        const visibleColumns = Object.keys(columnDefs)
          .filter(col => col !== currentFilter.column && !columnDefs[col].hidden)
          .sort((a, b) => tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b))
          .map(key => columnDefs[key].label);

        return {
          heading: selectedItem?.value || "Detail View",
          data: filteredData,
          columns: visibleColumns,
          totals: totals
        };
      } else {
        // Summary table
        const summaryData = checkedValues.map((checkedValue) => {
          const tableDataForValue = filteredData.filter(
            (item) => item[currentFilter.column] === checkedValue
          );
          
          // Create a row with columns in the specified order
          const row = {
            [columnDefs[currentFilter.column]?.label]: checkedValue,
            "कुल रिकॉर्ड": tableDataForValue.length,
          };
          
          // Add other columns in the specified order
          tableColumnOrder.forEach(col => {
            if (col !== currentFilter.column && col !== "allocated_quantity" && col !== "rate" && 
                col !== "amount_of_farmer_share" && col !== "amount_of_subsidy" && col !== "total_amount" && !columnDefs[col].hidden) {
              row[columnDefs[col].label] = new Set(tableDataForValue.map((item) => item[col])).size;
            }
          });
          
          // Add monetary columns at the end
          row["कुल आवंटित मात्रा"] = tableDataForValue
            .reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) || 0), 0)
            .toFixed(2);
          row["कुल किसान की हिस्सेदारी"] = tableDataForValue
            .reduce((sum, item) => sum + (parseFloat(item.amount_of_farmer_share) || 0), 0)
            .toFixed(2);
          row["कुल सब्सिडी"] = tableDataForValue
            .reduce((sum, item) => sum + (parseFloat(item.amount_of_subsidy) || 0), 0)
            .toFixed(2);
          row["कुल राशि"] = tableDataForValue
            .reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0)
            .toFixed(2);
            
          return row;
        });

        // Calculate totals for summary view
        const totals = {};
        totals[columnDefs[currentFilter.column]?.label] = checkedValues.length;
        totals["कुल रिकॉर्ड"] = checkedValues.reduce((sum, checkedValue) => {
          const tableDataForValue = filteredData.filter(item => item[currentFilter.column] === checkedValue);
          return sum + tableDataForValue.length;
        }, 0);

        // Add other columns in the specified order
        tableColumnOrder.forEach(col => {
          if (col !== currentFilter.column && col !== "allocated_quantity" && col !== "rate" && 
              col !== "amount_of_farmer_share" && col !== "amount_of_subsidy" && col !== "total_amount" && !columnDefs[col].hidden) {
            totals[columnDefs[col].label] = new Set(filteredData.map(item => item[col])).size;
          }
        });

        // Add monetary columns at the end
        totals["कुल आवंटित मात्रा"] = checkedValues
          .reduce((sum, checkedValue) => {
            const tableDataForValue = filteredData.filter(item => item[currentFilter.column] === checkedValue);
            return sum + tableDataForValue.reduce((s, item) => s + (parseFloat(item.allocated_quantity) || 0), 0);
          }, 0)
          .toFixed(2);

        totals["कुल किसान की हिस्सेदारी"] = checkedValues
          .reduce((sum, checkedValue) => {
            const tableDataForValue = filteredData.filter(item => item[currentFilter.column] === checkedValue);
            return sum + tableDataForValue.reduce((s, item) => s + (parseFloat(item.amount_of_farmer_share) || 0), 0);
          }, 0)
          .toFixed(2);

        totals["कुल सब्सिडी"] = checkedValues
          .reduce((sum, checkedValue) => {
            const tableDataForValue = filteredData.filter(item => item[currentFilter.column] === checkedValue);
            return sum + tableDataForValue.reduce((s, item) => s + (parseFloat(item.amount_of_subsidy) || 0), 0);
          }, 0)
          .toFixed(2);

        totals["कुल राशि"] = checkedValues
          .reduce((sum, checkedValue) => {
            const tableDataForValue = filteredData.filter(item => item[currentFilter.column] === checkedValue);
            return sum + tableDataForValue.reduce((s, item) => s + (parseFloat(item.total_amount) || 0), 0);
          }, 0)
          .toFixed(2);

        // Create columns in the specified order
        const visibleColumns = [
          columnDefs[currentFilter.column]?.label,
          "कुल रिकॉर्ड",
          ...tableColumnOrder.filter(col => 
            col !== currentFilter.column && 
            col !== "allocated_quantity" && 
            col !== "rate" && 
            col !== "amount_of_farmer_share" && 
            col !== "amount_of_subsidy" && 
            col !== "total_amount" && 
            !columnDefs[col].hidden
          ).map(key => columnDefs[key].label),
          "कुल आवंटित मात्रा",
          "कुल किसान की हिस्सेदारी",
          "कुल सब्सिडी",
          "कुल राशि",
        ];

        return {
          heading: `${columnDefs[currentFilter.column]?.label || "Summary"} (${
            checkedValues.length
          } items)`,
          data: summaryData,
          columns: visibleColumns,
          totals: totals
        };
      }
    }
  };

  // Add current table to export list
  const addTableToExport = (type) => {
    const currentTable = getCurrentTableData();
    const defaultName = `Table ${tablesForExport[type].length + 1}`;
    setTableName(defaultName);
    setExportType(type);
    setCurrentTableForExport(currentTable);
    setShowExportModal(true);
  };

  // Add additional table to export list
  const addAdditionalTableToExport = (table, type, index) => {
    // Calculate visible columns
    const visibleDynamicColumns = additionalTableColumnFilters[index] || (table.isAllocationTable ? table.columns.slice(1, -1) : table.columns.slice(2, -2));
    const visibleColumns = table.isAllocationTable ? [table.columns[0], ...visibleDynamicColumns, "कुल"] : [table.columns[0], "कुल रिकॉर्ड", ...visibleDynamicColumns, "कुल आवंटित मात्रा", "कुल किसान की हिस्सेदारी", "कुल सब्सिडी", "कुल राशि"];

    // Calculate totals for additional table
    const filteredTableData = table.data.filter((row) => {
      const rowValue = row[table.columns[0]];
      // Apply filters if they exist
      return true; // Assuming additional tables are already filtered
    });

    const totals = {};
    visibleColumns.forEach(col => {
      if (col === table.columns[0]) {
        totals[col] = filteredTableData.length;
      } else if (col === "कुल रिकॉर्ड") {
        totals[col] = filteredTableData.reduce((sum, row) => sum + row["कुल रिकॉर्ड"], 0);
      } else if (col === "कुल आवंटित मात्रा") {
        totals[col] = filteredTableData.reduce((sum, row) => sum + parseFloat(row["कुल आवंटित मात्रा"] || 0), 0).toFixed(2);
      } else if (col === "कुल किसान की हिस्सेदारी") {
        totals[col] = filteredTableData.reduce((sum, row) => sum + parseFloat(row["कुल किसान की हिस्सेदारी"] || 0), 0).toFixed(2);
      } else if (col === "कुल सब्सिडी") {
        totals[col] = filteredTableData.reduce((sum, row) => sum + parseFloat(row["कुल सब्सिडी"] || 0), 0).toFixed(2);
      } else if (col === "कुल राशि") {
        totals[col] = filteredTableData.reduce((sum, row) => sum + parseFloat(row["कुल राशि"] || 0), 0).toFixed(2);
      } else if (col === "कुल") {
        // For allocation table total
        totals[col] = filteredTableData.reduce((sum, row) => sum + visibleDynamicColumns.reduce((s, c) => s + parseFloat(row[c] || 0), 0), 0).toFixed(2);
      } else {
        // Dynamic columns
        totals[col] = new Set(filteredTableData.flatMap(row =>
          tableData.filter(item => item[table.columnKey] === row[table.columns[0]])
            .map(item => item[Object.keys(columnDefs).find(k => columnDefs[k].label === col)])
        )).size;
      }
    });

    const defaultName = `Table ${tablesForExport[type].length + 1}`;
    setTableName(defaultName);
    setExportType(type);
    setCurrentTableForExport({
      ...table,
      columns: visibleColumns,
      totals: totals
    });
    setShowTableSelectionModal(true);
  };

  // Confirm add table
  const confirmAddTable = () => {
    if (!currentTableForExport) return;
    
    const newTable = {
      id: Date.now(),
      name: tableName || `Table ${tablesForExport[exportType].length + 1}`,
      heading: currentTableForExport.heading,
      data: currentTableForExport.data,
      columns: currentTableForExport.columns,
      totals: currentTableForExport.totals || {},
      addedAt: new Date().toLocaleString(),
    };
    setTablesForExport((prev) => ({
      ...prev,
      [exportType]: [...prev[exportType], newTable],
    }));
    setShowExportModal(false);
    setTableName("");
    setCurrentTableForExport(null);
  };

  // Remove table from export list
  const removeTableFromExport = (type, tableId) => {
    setTablesForExport((prev) => ({
      ...prev,
      [type]: prev[type].filter((table) => table.id !== tableId),
    }));
  };

  // Generate PDF preview
  const generatePDFPreview = () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '16px' }}>निर्यातित टेबल रिपोर्ट</h1>
        {tablesForExport.pdf.map((table, index) => (
          <div key={table.id} style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
            <h2 style={{ marginBottom: '10px', fontSize: '14px' }}>{index + 1}. {table.heading}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#2980b9', color: 'white' }}>
                  <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', fontSize: '11px' }}>S.No.</th>
                  {table.columns.map(col => (
                    <th key={col} style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', fontSize: '11px' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '10px' }}>{row[table.columns[0]] === "कुल" ? "" : rowIndex + 1}</td>
                    {table.columns.map((col) => {
                      let cellValue = '';
                      if (typeof row === "object" && row !== null) {
                        if (row.hasOwnProperty(col)) {
                          cellValue = row[col] || "";
                        } else {
                          // Find the key for this label
                          const key = Object.keys(columnDefs).find(
                            (k) => columnDefs[k].label === col
                          );
                          if (key) {
                            cellValue = row[key] || "";
                          }
                        }
                      } else {
                        cellValue = row;
                      }
                      return <td key={col} style={{ border: '1px solid #ddd', padding: '6px', fontSize: '10px' }}>{cellValue}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
              {(() => {
                const hasTotalRow = table.data.length > 0 && table.data[table.data.length - 1][table.columns[0]] === "कुल";
                return !hasTotalRow && (
                  <tfoot>
                    <tr style={{ backgroundColor: '#f2f2f2', fontWeight: 'bold' }}>
                      <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '10px' }}>कुल:</td>
                      {table.columns.map((col) => {
                        // Use pre-calculated totals if available
                        const totalValue = table.totals && table.totals[col] !== undefined
                          ? table.totals[col]
                          : calculateColumnTotal(table.data, col, columnDefs);

                        return <td key={col} style={{ border: '1px solid #ddd', padding: '6px', fontSize: '10px' }}>{totalValue}</td>;
                      })}
                    </tr>
                  </tfoot>
                );
              })()}
            </table>
          </div>
        ))}
      </div>
    );
  };

  // Generate Excel preview
  const generateExcelPreview = () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '16px' }}>Excel शीट्स पूर्वालोकन</h3>
        {tablesForExport.excel.map((table, index) => (
          <div key={table.id} style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', pageBreakInside: 'avoid' }}>
            <h4 style={{ marginBottom: '10px', color: '#2980b9', fontSize: '14px' }}>शीट {index + 1}: {table.name}</h4>
            <h5 style={{ marginBottom: '10px', fontSize: '13px' }}>{table.heading}</h5>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', fontWeight: 'bold', fontSize: '11px' }}>S.No.</th>
                  {table.columns.map(col => (
                    <th key={col} style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', fontWeight: 'bold', fontSize: '11px' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '10px' }}>{row[table.columns[0]] === "कुल" ? "" : rowIndex + 1}</td>
                    {table.columns.map((col) => {
                      let cellValue = '';
                      if (typeof row === "object" && row !== null) {
                        if (row.hasOwnProperty(col)) {
                          cellValue = row[col] || "";
                        } else {
                          // Find the key for this label
                          const key = Object.keys(columnDefs).find(
                            (k) => columnDefs[k].label === col
                          );
                          if (key) {
                            cellValue = row[key] || "";
                          }
                        }
                      } else {
                        cellValue = row;
                      }
                      return <td key={col} style={{ border: '1px solid #ddd', padding: '6px', fontSize: '10px' }}>{cellValue}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
              {(() => {
                const hasTotalRow = table.data.length > 0 && table.data[table.data.length - 1][table.columns[0]] === "कुल";
                return !hasTotalRow && (
                  <tfoot>
                    <tr style={{ backgroundColor: '#f2f2f2', fontWeight: 'bold' }}>
                      <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '10px' }}>कुल:</td>
                      {table.columns.map((col) => {
                        // Use pre-calculated totals if available
                        const totalValue = table.totals && table.totals[col] !== undefined
                          ? table.totals[col]
                          : calculateColumnTotal(table.data, col, columnDefs);

                        return <td key={col} style={{ border: '1px solid #ddd', padding: '6px', fontSize: '10px' }}>{totalValue}</td>;
                      })}
                    </tr>
                  </tfoot>
                );
              })()}
            </table>
          </div>
        ))}
      </div>
    );
  };

  // Helper function to calculate column totals (fallback)
  const calculateColumnTotal = (tableData, column, columnDefs) => {
    if (column === 'कुल रिकॉर्ड') {
      return tableData.reduce((sum, row) => sum + (row[column] || 0), 0);
    } else if (column === 'कुल आवंटित मात्रा' || column === 'कुल किसान की हिस्सेदारी' || column === 'कुल सब्सिडी' || column === 'कुल राशि') {
      return tableData.reduce((sum, row) => sum + parseFloat(row[column] || 0), 0).toFixed(2);
    } else {
      // For other columns, count unique values
      const uniqueValues = new Set();
      tableData.forEach(row => {
        let value = '';
        if (row.hasOwnProperty(column)) {
          value = row[column];
        } else {
          // Find the key for this label
          const key = Object.keys(columnDefs).find(
            (k) => columnDefs[k].label === column
          );
          if (key) {
            value = row[key];
          }
        }
        if (value) uniqueValues.add(value);
      });
      return uniqueValues.size;
    }
  };

  // Generate PDF
  const generatePDF = () => {
    try {
      // Create HTML content
      let htmlContent = `
        <div style="font-family: Arial, sans-serif; font-size: 10px; padding: 15px;">
          <h1 style="text-align: center; margin-bottom: 15px; font-size: 14px;">निर्यातित टेबल रिपोर्ट</h1>
      `;

      tablesForExport.pdf.forEach((table, index) => {
        htmlContent += `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h2 style="margin-top: 15px; margin-bottom: 8px; font-size: 12px;">${index + 1}. ${table.heading}</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px;">
              <thead>
                <tr style="background-color: #2980b9; color: white;">
                  <th style="border: 1px solid #ddd; padding: 5px; text-align: left; font-size: 9px;">S.No.</th>
                  ${table.columns.map(col => `<th style="border: 1px solid #ddd; padding: 5px; text-align: left; font-size: 9px;">${col}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
        `;

        table.data.forEach((row, rowIndex) => {
          htmlContent += '<tr>';
          htmlContent += `<td style="border: 1px solid #ddd; padding: 5px; font-size: 8px;">${row[table.columns[0]] === "कुल" ? "" : rowIndex + 1}</td>`;
          table.columns.forEach((col) => {
            let cellValue = '';
            if (typeof row === "object" && row !== null) {
              if (row.hasOwnProperty(col)) {
                cellValue = row[col] || "";
              } else {
                // Find the key for this label
                const key = Object.keys(columnDefs).find(
                  (k) => columnDefs[k].label === col
                );
                if (key) {
                  cellValue = row[key] || "";
                }
              }
            } else {
              cellValue = row;
            }
            htmlContent += `<td style="border: 1px solid #ddd; padding: 5px; font-size: 8px;">${cellValue}</td>`;
          });
          htmlContent += '</tr>';
        });

        // Add footer row with totals only if the table doesn't already have a total row
        const hasTotalRow = table.data.length > 0 && table.data[table.data.length - 1][table.columns[0]] === "कुल";
        if (!hasTotalRow) {
          htmlContent += `
              </tbody>
              <tfoot>
                <tr style="background-color: #f2f2f2; font-weight: bold;">
                  <td style="border: 1px solid #ddd; padding: 5px; font-size: 8px;">कुल:</td>
          `;

          table.columns.forEach((col) => {
            // Use pre-calculated totals if available
            const totalValue = table.totals && table.totals[col] !== undefined
              ? table.totals[col]
              : calculateColumnTotal(table.data, col, columnDefs);

            htmlContent += `<td style="border: 1px solid #ddd; padding: 5px; font-size: 8px;">${totalValue}</td>`;
          });

          htmlContent += `
                </tr>
              </tfoot>
            </table>
          </div>
        `;
        } else {
          htmlContent += `
              </tbody>
            </table>
          </div>
        `;
        }
      });

      htmlContent += '</div>';

      // Configure html2pdf options
      const options = {
        margin: [8, 8, 8, 8],
        filename: 'exported-tables.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 1.8, 
          useCORS: true, 
          letterRendering: true,
          logging: false,
          windowWidth: 1200
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape',
          compress: true
        }
      };

      // Generate and download PDF from HTML string
      html2pdf().set(options).from(htmlContent).save().catch((error) => {
        console.error("Error generating PDF:", error);
        alert("Error generating PDF: " + error.message);
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF: " + error.message);
    }
  };

  // Generate Excel
  const generateExcel = () => {
    const workbook = XLSX.utils.book_new();

    tablesForExport.excel.forEach((table, index) => {
      // Prepare data for this table
      let tableDataArray = [
        [table.heading], // Title
        [], // Empty row
        ["S.No.", ...table.columns], // Headers
        ...table.data.map((row, rowIndex) =>
          [row[table.columns[0]] === "कुल" ? "" : rowIndex + 1, ...table.columns.map((col) => {
            if (typeof row === "object" && row !== null) {
              if (row.hasOwnProperty(col)) {
                return row[col] || "";
              } else {
                // Find the key for this label
                const key = Object.keys(columnDefs).find(
                  (k) => columnDefs[k].label === col
                );
                if (key) {
                  return row[key] || "";
                } else {
                  return "";
                }
              }
            }
            return row;
          })]
        ),
      ];

      // Add totals row only if the table doesn't already have a total row
      const hasTotalRow = table.data.length > 0 && table.data[table.data.length - 1][table.columns[0]] === "कुल";
      if (!hasTotalRow) {
        // Calculate totals for each column using pre-calculated values
        const totalsRow = ["कुल:"];
        table.columns.forEach((col) => {
          const totalValue = table.totals && table.totals[col] !== undefined
            ? table.totals[col]
            : calculateColumnTotal(table.data, col, columnDefs);
          totalsRow.push(totalValue);
        });

        // Add empty row and totals row
        tableDataArray.push([], totalsRow);
      }

      const sheetName = table.name.substring(0, 31); // Excel sheet name limit

      // Check if sheet already exists in workbook
      if (workbook.SheetNames.includes(sheetName)) {
        // Append data to existing sheet
        const existingSheet = workbook.Sheets[sheetName];

        // Get the range of the existing sheet to find where to append
        const existingRange = XLSX.utils.decode_range(
          existingSheet["!ref"] || "A1"
        );
        const startRow = existingRange.e.r + 2; // Add 2 rows gap (1 for empty row, 1 for new data)

        // Add empty row before new data
        const emptyRow = {};
        for (let col = 0; col < table.columns.length + 1; col++) {
          emptyRow[XLSX.utils.encode_col(col) + (startRow + 1)] = {
            t: "s",
            v: "",
          };
        }

        // Add new data starting from the row after empty row
        tableDataArray.forEach((rowData, rowIndex) => {
          const currentRow = startRow + 2 + rowIndex;
          rowData.forEach((cellData, colIndex) => {
            const cellRef = XLSX.utils.encode_col(colIndex) + currentRow;
            existingSheet[cellRef] = {
              t: typeof cellData === "number" ? "n" : "s",
              v: cellData,
            };
          });
        });

        // Update the sheet range
        const newEndRow = startRow + 2 + tableDataArray.length - 1;
        existingSheet["!ref"] = XLSX.utils.encode_range({
          s: { c: 0, r: 0 },
          e: { c: table.columns.length, r: newEndRow },
        });

        // Update column widths if needed
        if (!existingSheet["!cols"]) {
          const colWidths = table.columns.map(() => ({ wch: 15 }));
          existingSheet["!cols"] = colWidths;
        }
      } else {
        // Create new sheet
        const worksheet = XLSX.utils.aoa_to_sheet(tableDataArray);

        // Set column widths
        const colWidths = table.columns.map(() => ({ wch: 15 }));
        worksheet["!cols"] = colWidths;

        // Add sheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    });

    XLSX.writeFile(workbook, "exported-tables.xlsx");
  };

  // Export Section Component
  const ExportSection = () => (
    <div
      className={`export-section mb-3 mt-2 p-3 border rounded bg-light ${
        isFilterApplied ? "mt-2" : ""
      }`}
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">
          <RiFilePdfLine /> निर्यात विकल्प
        </h6>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="danger"
            size="sm"
            onClick={() => addTableToExport("pdf")}
            className="d-flex align-items-center pdf-add-btn gap-1"
          >
            <RiFilePdfLine /> इस टेबल को PDF में जोड़ें
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => addTableToExport("excel")}
            className="d-flex align-items-center exel-add-btn gap-1"
          >
            <RiFileExcelLine /> इस टेबल को Excel में जोड़ें
          </Button>
        </div>
      </div>

      {/* Selected Tables Display */}
      {(tablesForExport.pdf.length > 0 || tablesForExport.excel.length > 0) && (
        <div className="mt-3">
          <Row className="g-3">
            {/* PDF COLUMN */}
            {tablesForExport.pdf.length > 0 && (
              <Col
                lg={tablesForExport.excel.length > 0 ? 6 : 12}
                md={12}
                sm={12}
              >
                <div className="selected-tables-card p-3 border rounded bg-white h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-danger small">
                      <RiFilePdfLine /> PDF ({tablesForExport.pdf.length})
                    </span>
                    <div className="d-flex gap-2">
                      <Button
                        className="pdf-add-btn"
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setPreviewType("pdf");
                          setShowPreviewModal(true);
                        }}
                      >
                        <RiEyeLine /> पूर्वावलोकन
                      </Button>
                      <Button
                        className="pdf-add-btn"
                        variant="outline-danger"
                        size="sm"
                        onClick={generatePDF}
                      >
                        डाउनलोड
                      </Button>
                    </div>
                  </div>

                  <div className="table-list">
                    {tablesForExport.pdf.map((table, idx) => (
                      <div
                        key={table.id}
                        className="d-flex justify-content-between align-items-center py-1 border-bottom"
                      >
                        <span className="small text-truncate">
                          {idx + 1}. {table.name}
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => removeTableFromExport("pdf", table.id)}
                        >
                          <RiDeleteBinLine />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            )}

            {/* EXCEL COLUMN */}
            {tablesForExport.excel.length > 0 && (
              <Col lg={tablesForExport.pdf.length > 0 ? 6 : 12} md={12} sm={12}>
                <div className="selected-tables-card p-3 border rounded bg-white h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-success small">
                      <RiFileExcelLine /> Excel ({tablesForExport.excel.length})
                    </span>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-success"
                        className="pdf-add-btn"
                        size="sm"
                        onClick={() => {
                          setPreviewType("excel");
                          setShowPreviewModal(true);
                        }}
                      >
                        <RiEyeLine /> पूर्वालोकन
                      </Button>
                      <Button
                        variant="outline-success"
                        className="pdf-add-btn"
                        size="sm"
                        onClick={generateExcel}
                      >
                        डाउनलोड
                      </Button>
                    </div>
                  </div>

                  <div className="table-list">
                    {tablesForExport.excel.map((table, idx) => (
                      <div
                        key={table.id}
                        className="d-flex justify-content-between align-items-center py-1 border-bottom"
                      >
                        <span className="small text-truncate">
                          {idx + 1}. {table.name}
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() =>
                            removeTableFromExport("excel", table.id)
                          }
                        >
                          <RiDeleteBinLine />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </div>
      )}
    </div>
  );

  // Handle clicking on a value in the summary table to add a new filter
  const handleSummaryValueClick = (column, value) => {
    // Get all unique values for this column from the currently filtered data
    const currentFilteredData = tableData.filter((item) => {
      for (let filter of filterStack) {
        if (!filter.checked[item[filter.column]]) return false;
      }
      return true;
    });
    
    const allValues = [
      ...new Set(currentFilteredData.map((item) => item[column]).filter(Boolean)),
    ];
  
    // Create checked object with all values initialized to false
    // Then set the clicked value to true
    const checked = {};
    allValues.forEach((val) => {
      checked[val] = false;
    });
    checked[value] = true;
  
    // Add this filter to the stack
    setFilterStack((prev) => [...prev, { column, checked }]);
    setShowDetailed(false);
  };

  // Initialize filters for additional tables
  useEffect(() => {
    if (additionalTables.length > 0) {
      const initialFilters = {};
      const initialColumnFilters = {};
      additionalTables.forEach((table, index) => {
        initialFilters[index] = {
          allSelected: true,
          selectedValues: table.data.map((row) => row[table.columns[0]]),
        };
        // Initialize column filters - all columns visible except first and last for allocation, first/last two for summary
        const filterableColumns = table.isAllocationTable ? table.columns.slice(1, -1) : table.columns.slice(2, -2);
        initialColumnFilters[index] = filterableColumns;
      });
      setAdditionalTableFilters(initialFilters);
      setAdditionalTableColumnFilters(initialColumnFilters);
    }
  }, [additionalTables]);

  // Generate detailed breakdown table for clicked entries
  const generateDetailedBreakdownTable = (clickedValues, columnKey) => {
    // Get the current filtered data based on the filter stack
    const currentFilteredData = tableData.filter((item) => {
      for (let filter of filterStack) {
        if (!filter.checked[item[filter.column]]) return false;
      }
      return true;
    });

    // Get all unique values for the first column (same as summary table)
    const firstColumnValues = [...new Set(currentFilteredData.map(item => item[columnKey]).filter(Boolean))];

    // Create the new table structure
    const newTableData = [];

    // For each value in the first column, create a row with allocation data for each clicked value
    firstColumnValues.forEach(firstColValue => {
      const rowData = {
        [columnDefs[columnKey]?.label]: firstColValue,
      };

      // Add allocation data for each clicked value
      clickedValues.forEach(clickedValue => {
        // Filter data for this specific combination
        const filteredForCombination = currentFilteredData.filter(item => {
          return item[columnKey] === firstColValue &&
                 item[filterStack[filterStack.length - 1].column] === clickedValue;
        });

        // Calculate total allocated quantity for this combination
        const totalAllocated = filteredForCombination.reduce(
          (sum, item) => sum + (parseFloat(item.allocated_quantity) || 0),
          0
        ).toFixed(2);

        rowData[clickedValue] = totalAllocated;
      });

      newTableData.push(rowData);
    });

    // Create columns for the new table
    const newColumns = [
      columnDefs[columnKey]?.label,
      ...clickedValues,
    ];

    return {
      heading: `विस्तृत आवंटन - ${columnDefs[columnKey]?.label}`,
      data: newTableData,
      columns: newColumns,
      columnKey: columnKey,
      isBreakdownTable: true
    };
  };

  // Generate allocation table for clicked column entries - MODIFIED TO REMOVE UNWANTED COLUMNS AND ADD TOTALS
  const generateAllocationTable = (clickedColumn, checkedValue, firstColumnKey) => {
  // Get the current filtered data based on the filter stack
  const currentFilteredData = tableData.filter((item) => {
    for (let filter of filterStack) {
      if (!filter.checked[item[filter.column]]) return false;
    }
    return true;
  });

    // Get unique values for the first column (dynamic based on the clicked column)
const firstColumnValues = [...new Set(currentFilteredData.map(item => item[firstColumnKey]).filter(Boolean))];
    // Get unique values for the clicked column (entries)
  const clickedColumnValues = [...new Set(currentFilteredData.map(item => item[clickedColumn]).filter(Boolean))];

    // Create the new table structure
     const newTableData = [];
  const columnTotals = {}; // For calculating column totals

    // For each value in the first column, create a row with allocation data for each clicked column value
   firstColumnValues.forEach(firstColValue => {
    const rowData = {
      [columnDefs[firstColumnKey]?.label]: firstColValue,
    };

      let rowTotal = 0; // For calculating row total

      // Add allocation data for each clicked column value
      clickedColumnValues.forEach(clickedColValue => {
      // Filter data for this specific combination
      const filteredForCombination = currentFilteredData.filter(item => {
        return item[firstColumnKey] === firstColValue &&
               item[clickedColumn] === clickedColValue;
      });

        // Calculate total allocated quantity for this combination
        const totalAllocated = filteredForCombination.reduce(
        (sum, item) => sum + (parseFloat(item.allocated_quantity) || 0),
        0
      ).toFixed(2);

        rowData[clickedColValue] = totalAllocated;
      rowTotal += parseFloat(totalAllocated);

        // Calculate column total
       if (!columnTotals[clickedColValue]) {
        columnTotals[clickedColValue] = 0;
      }
      columnTotals[clickedColValue] += parseFloat(totalAllocated);
    });

      // Add row total
       rowData["कुल"] = rowTotal.toFixed(2);
    newTableData.push(rowData);
  });

    // Add total row
    const totalRow = { [columnDefs[firstColumnKey]?.label]: "कुल" };
  let grandTotal = 0;

  clickedColumnValues.forEach(clickedColValue => {
    totalRow[clickedColValue] = (columnTotals[clickedColValue] || 0).toFixed(2);
    grandTotal += columnTotals[clickedColValue] || 0;
  });

  totalRow["कुल"] = grandTotal.toFixed(2);
  newTableData.push(totalRow);

    // Create columns for the new table
    const newColumns = [
    columnDefs[firstColumnKey]?.label,
    ...clickedColumnValues,
    "कुल"
  ];

  return {
    heading: `आवंटन विवरण - ${columnDefs[firstColumnKey]?.label} द्वारा ${columnDefs[clickedColumn]?.label}`,
    data: newTableData,
    columns: newColumns,
    columnKey: firstColumnKey,
    isAllocationTable: true
  };
};

  // Handle adding a table to an existing sheet
  const handleAddToExistingSheet = (type, existingTableId) => {
    if (!currentTableForExport) return;
    
    // Find the existing table
    const existingTable = tablesForExport[type].find(t => t.id === existingTableId);
    if (!existingTable) return;
    
    // Create a new table with the same name as the existing table
    const newTable = {
      id: Date.now(),
      name: existingTable.name,
      heading: currentTableForExport.heading,
      data: currentTableForExport.data,
      columns: currentTableForExport.columns,
      totals: currentTableForExport.totals || {},
      addedAt: new Date().toLocaleString(),
      addToExistingSheet: true,
      existingSheetId: existingTableId,
    };
    
    setTablesForExport((prev) => ({
      ...prev,
      [type]: [...prev[type], newTable],
    }));
    
    setShowTableSelectionModal(false);
    setCurrentTableForExport(null);
  };

  // Table Selection Modal Component
  const TableSelectionModal = () => (
    <Modal show={showTableSelectionModal} onHide={() => setShowTableSelectionModal(false)}>
      <Modal.Header closeButton className="modal-header-style">
        <div>
          {exportType === "pdf" ? "PDF में जोड़ें" : "Excel में जोड़ें"}
        </div>
      </Modal.Header>
      <Modal.Body>
        <p>कृपया चुनें कि आप इस टेबल को किस शीट में जोड़ना चाहते हैं:</p>
        <div className="d-grid gap-2">
          <Button 
            variant="primary" 
            onClick={() => {
              setTableName(`Table ${tablesForExport[exportType].length + 1}`);
              confirmAddTable();
            }}
          >
            नई शीट बनाएं
          </Button>
          {tablesForExport[exportType].length > 0 && (
            <>
              <p className="mt-3 mb-2">या मौजूदा शीट में जोड़ें:</p>
              {tablesForExport[exportType].map((table) => (
                <Button 
                  key={table.id}
                  variant="outline-primary" 
                  onClick={() => handleAddToExistingSheet(exportType, table.id)}
                >
                  {table.name}
                </Button>
              ))}
            </>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShowTableSelectionModal(false)}
          className="remove-btn"
        >
          रद्द करें
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Preview Modal Component
  const PreviewModal = () => (
    <Modal 
      show={showPreviewModal} 
      onHide={() => setShowPreviewModal(false)}
      size="xl"
      centered
    >
      <Modal.Header closeButton className="modal-header-style">
        <div>
          {previewType === "pdf" ? "PDF पूर्वालोकन" : "Excel पूर्वालोकन"}
        </div>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflow: 'auto' }}>
        {previewType === "pdf" ? generatePDFPreview() : generateExcelPreview()}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShowPreviewModal(false)}
        >
          बंद करें
        </Button>
        <Button
          variant={previewType === "pdf" ? "danger" : "success"}
          onClick={() => {
            setShowPreviewModal(false);
            previewType === "pdf" ? generatePDF() : generateExcel();
          }}
        >
          डाउनलोड करें
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Handle additional table filter change
  const handleAdditionalTableFilterChange = (tableIndex, value) => {
  setAdditionalTableFilters((prev) => {
    const currentFilter = prev[tableIndex] || { allSelected: true, selectedValues: [] };
    const table = additionalTables[tableIndex];
    const allValues = table.data.map((row) => row[table.columns[0]]);

    let newSelectedValues;

    if (value === "SELECT_ALL") {
      // Toggle select all
      newSelectedValues = currentFilter.allSelected ? [] : allValues;
    } else {
      // Toggle individual value
      newSelectedValues = currentFilter.selectedValues.includes(value)
        ? currentFilter.selectedValues.filter((v) => v !== value)
        : [...currentFilter.selectedValues, value];
    }

    const newFilter = {
      allSelected: newSelectedValues.length === allValues.length,
      selectedValues: newSelectedValues,
    };

    // Update the table data based on the new filter
    setAdditionalTables((prevTables) => {
      const newTables = [...prevTables];
      const tableData = newTables[tableIndex];

      // Get the original data (before any filtering)
      const originalData = tableData.originalData || tableData.data;

      // Store the original data if not already stored
      if (!tableData.originalData) {
        tableData.originalData = [...tableData.data];
      }

      // Filter the data based on the new selection
      const filteredData = originalData.filter((row) => {
        const rowValue = row[tableData.columns[0]];
        return newFilter.allSelected || newFilter.selectedValues.includes(rowValue);
      });

      // Update the table with the filtered data
      newTables[tableIndex] = {
        ...tableData,
        data: filteredData,
      };

      return newTables;
    });

    return {
      ...prev,
      [tableIndex]: newFilter,
    };
  });
};

  // Handle additional table column filter change
  const handleAdditionalTableColumnFilterChange = (tableIndex, columnName) => {
    setAdditionalTableColumnFilters((prev) => {
      const table = additionalTables[tableIndex];
      const allColumns = table.isAllocationTable ? table.columns.slice(1) : table.columns.slice(2, -2);
      const currentVisibleColumns = prev[tableIndex] || allColumns;
      let newVisibleColumns;

      if (columnName === "SELECT_ALL") {
        newVisibleColumns = currentVisibleColumns.length === allColumns.length ? [] : allColumns;
      } else {
        if (currentVisibleColumns.includes(columnName)) {
          newVisibleColumns = currentVisibleColumns.filter((col) => col !== columnName);
        } else {
          // Add in original order
          newVisibleColumns = allColumns.filter((col) => col === columnName || currentVisibleColumns.includes(col));
        }
      }

      return {
        ...prev,
        [tableIndex]: newVisibleColumns,
      };
    });
  };

  // Handle clicking on "कुल" (Total) to generate a table with unique values
  const handleTotalClick = (columnKey) => {
    // Get the current filtered data based on the filter stack
    const currentFilteredData = tableData.filter((item) => {
      for (let filter of filterStack) {
        if (!filter.checked[item[filter.column]]) return false;
      }
      return true;
    });
    
    // Generate unique values for the selected column
    const uniqueValues = [...new Set(currentFilteredData.map(item => item[columnKey]).filter(Boolean))];
    
    // Create summary data for each unique value
    const summaryData = uniqueValues.map(value => {
      const dataForValue = currentFilteredData.filter(item => item[columnKey] === value);
      
      // Create a row with columns in the specified order
      const row = {
        [columnDefs[columnKey]?.label]: value,
        "कुल रिकॉर्ड": dataForValue.length,
      };
      
      // Add other columns in the specified order
      tableColumnOrder.forEach(col => {
        if (col !== columnKey && col !== "allocated_quantity" && col !== "rate" && 
            col !== "amount_of_farmer_share" && col !== "amount_of_subsidy" && col !== "total_amount" && !columnDefs[col].hidden) {
          row[columnDefs[col].label] = new Set(dataForValue.map(item => item[col])).size;
        }
      });
      
      // Add monetary columns at the end
      row["कुल आवंटित मात्रा"] = dataForValue
        .reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) || 0), 0)
        .toFixed(2);
      row["कुल किसान की हिस्सेदारी"] = dataForValue
        .reduce((sum, item) => sum + (parseFloat(item.amount_of_farmer_share) || 0), 0)
        .toFixed(2);
      row["कुल सब्सिडी"] = dataForValue
        .reduce((sum, item) => sum + (parseFloat(item.amount_of_subsidy) || 0), 0)
        .toFixed(2);
      row["कुल राशि"] = dataForValue
        .reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0)
        .toFixed(2);
        
      return row;
    });
    
    // Create columns in the specified order
    const visibleColumns = [
      columnDefs[columnKey]?.label,
      "कुल रिकॉर्ड",
      ...tableColumnOrder.filter(col => 
        col !== columnKey && 
        col !== "allocated_quantity" && 
        col !== "rate" && 
        col !== "amount_of_farmer_share" && 
        col !== "amount_of_subsidy" && 
        col !== "total_amount" && 
        !columnDefs[col].hidden
      ).map(key => columnDefs[key].label),
      "कुल आवंटित मात्रा",
      "कुल किसान की हिस्सेदारी",
      "कुल सब्सिडी",
      "कुल राशि",
    ];
    
    // Add this table to additional tables
    const newTable = {
      heading: `${columnDefs[columnKey]?.label} - विस्तृत विवरण`,
      data: summaryData,
      columns: visibleColumns,
      columnKey: columnKey,
    };
    
    setAdditionalTables(prev => [newTable, ...prev]);
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
          <Col lg={12} md={12} sm={12}>
            <Container fluid className="dashboard-body-main">
              {/* <h1 className="page-title form-label">{getSummaryHeading()}</h1> */}

              {/* Multi-Filter Section */}
              {view === "main" && (
                <div className="filter-section mb-3 p-3 border rounded bg-light dashboard-graphs">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">
                      <i className="fltr-icon">
                        <RiFilter2Line />
                      </i>
                      फिल्टर
                      {isApplyingFilters && (
                        <span className="ms-2 text-muted small">
                          <i className="fas fa-spinner fa-spin"></i> अपडेट हो रहा है...
                        </span>
                      )}
                    </h6>
                    <div className="d-flex gap-2">
                      <Button
                        variant="primary"
                        className="btn-filter-submit"
                        size="sm"
                        onClick={applyFilters}
                        disabled={isApplyingFilters}
                      >
                        <i className="fltr-icon">
                          <BiFilter />
                        </i>{" "}
                        फिल्टर लागू करें
                      </Button>
                      <Button
                        className="clear-btn-primary"
                        variant="outline-secondary"
                        size="sm"
                        onClick={clearFilters}
                        disabled={isApplyingFilters}
                      >
                        <i className="fltr-icon">
                          <IoMdRefresh />
                        </i>{" "}
                        सभी फिल्टर हटाएं
                      </Button>
                    </div>
                  </div>
                  {/* Filter Summary */}
                  {isFilterApplied && (
                    <div className="filter-summary mb-2 p-2 bg-white border rounded">
                      <small className="text-muted">
                        <strong>फ़िल्टर लागू:</strong>{" "}
                        {Object.entries(filters)
                          .filter(([key, values]) => values.length > 0)
                          .map(([key, values]) =>
                            `${columnDefs[key]?.label}: ${values.length} selected`
                          )
                          .join(" | ")}
                        <span className="ms-3">
                          <strong>परिणाम:</strong>{" "}
                          <span className="badge bg-primary">{filteredTableData.length}</span>{" "}
                          रिकॉर्ड
                        </span>
                      </small>
                    </div>
                  )}
                  <Row>
                    <Col>
                      <Form.Group className="mb-2">
                        <Form.Label className="form-label fw-bold">
                          {translations.centerName}
                        </Form.Label>
                        <div className="dropdown">
                          <button
                            className="btn btn-secondary dropdown-toggle drop-option-custom"
                            type="button"
                            onClick={() =>
                              view === "main" && toggleDropdown("center_name")
                            }
                          >
                            {filters.center_name.length === 0
                              ? translations.selectOption
                              : `${filters.center_name.length} selected`}
                          </button>
                          {dropdownOpen.center_name && (
                            <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', zIndex: 1000 }}>
                              <div
                                key="select_all_center"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected = filterOptions.center_name.length > 0 &&
                                    filters.center_name.length === filterOptions.center_name.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`center_name_SELECT_ALL`}
                                      label={allSelected ? "सभी हटाएं" : "सभी चुनें"}
                                      checked={allSelected}
                                      onChange={() =>
                                        handleCheckboxChange(
                                          "center_name",
                                          "SELECT_ALL"
                                        )
                                      }
                                    />
                                  );
                                })()}
                              </div>
                              {filterOptions.center_name.map((option) => (
                                <div key={option} className="dropdown-item">
                                  <FormCheck
                                    className="check-box"
                                    type="checkbox"
                                    id={`center_name_${option}`}
                                    label={option}
                                    checked={filters.center_name.includes(
                                      option
                                    )}
                                    onChange={() =>
                                      handleCheckboxChange(
                                        "center_name",
                                        option
                                      )
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-2">
                        <Form.Label className="form-label fw-bold">
                          {translations.vikasKhandName}
                        </Form.Label>
                        <div className="dropdown">
                          <button
                            className="btn btn-secondary dropdown-toggle drop-option-custom"
                            type="button"
                            onClick={() =>
                              view === "main" &&
                              toggleDropdown("vikas_khand_name")
                            }
                          >
                            {filters.vikas_khand_name.length === 0
                              ? translations.selectOption
                              : `${filters.vikas_khand_name.length} selected`}
                          </button>
                          {dropdownOpen.vikas_khand_name && (
                            <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', zIndex: 1000 }}>
                              <div
                                key="select_all_vikas"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected = filterOptions.vikas_khand_name.length > 0 &&
                                    filters.vikas_khand_name.length === filterOptions.vikas_khand_name.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`vikas_khand_name_SELECT_ALL`}
                                      label={allSelected ? "सभी हटाएं" : "सभी चुनें"}
                                      checked={allSelected}
                                      onChange={() =>
                                        handleCheckboxChange(
                                          "vikas_khand_name",
                                          "SELECT_ALL"
                                        )
                                      }
                                    />
                                  );
                                })()}
                              </div>
                              {filterOptions.vikas_khand_name.map((option) => (
                                <div key={option} className="dropdown-item">
                                  <FormCheck
                                    className="check-box"
                                    type="checkbox"
                                    id={`vikas_khand_name_${option}`}
                                    label={option}
                                    checked={filters.vikas_khand_name.includes(
                                      option
                                    )}
                                    onChange={() =>
                                      handleCheckboxChange(
                                        "vikas_khand_name",
                                        option
                                      )
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-2">
                        <Form.Label className="form-label fw-bold">
                          {translations.vidhanSabhaName}
                        </Form.Label>
                        <div className="dropdown">
                          <button
                            className="btn btn-secondary dropdown-toggle drop-option-custom "
                            type="button"
                            onClick={() =>
                              view === "main" &&
                              toggleDropdown("vidhan_sabha_name")
                            }
                          >
                            {filters.vidhan_sabha_name.length === 0
                              ? translations.selectOption
                              : `${filters.vidhan_sabha_name.length} selected`}
                          </button>
                          {dropdownOpen.vidhan_sabha_name && (
                            <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', zIndex: 1000 }}>
                              <div
                                key="select_all_vidhan"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected = filterOptions.vidhan_sabha_name.length > 0 &&
                                    filters.vidhan_sabha_name.length === filterOptions.vidhan_sabha_name.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`vidhan_sabha_name_SELECT_ALL`}
                                      label={allSelected ? "सभी हटाएं" : "सभी चुनें"}
                                      checked={allSelected}
                                      onChange={() =>
                                        handleCheckboxChange(
                                          "vidhan_sabha_name",
                                          "SELECT_ALL"
                                        )
                                      }
                                    />
                                  );
                                })()}
                              </div>
                              {filterOptions.vidhan_sabha_name.map((option) => (
                                <div key={option} className="dropdown-item">
                                  <FormCheck
                                    className="check-box"
                                    type="checkbox"
                                    id={`vidhan_sabha_name_${option}`}
                                    label={option}
                                    checked={filters.vidhan_sabha_name.includes(
                                      option
                                    )}
                                    onChange={() =>
                                      handleCheckboxChange(
                                        "vidhan_sabha_name",
                                        option
                                      )
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-2">
                        <Form.Label className="form-label fw-bold">
                          {translations.investmentName}
                        </Form.Label>
                        <div className="dropdown">
                          <button
                            className="btn btn-secondary dropdown-toggle drop-option-custom"
                            type="button"
                            onClick={() =>
                              view === "main" &&
                              toggleDropdown("investment_name")
                            }
                          >
                            {filters.investment_name.length === 0
                              ? translations.selectOption
                              : `${filters.investment_name.length} selected`}
                          </button>
                          {dropdownOpen.investment_name && (
                            <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', zIndex: 1000 }}>
                              <div
                                key="select_all_investment"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected = filterOptions.investment_name.length > 0 &&
                                    filters.investment_name.length === filterOptions.investment_name.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`investment_name_SELECT_ALL`}
                                      label={allSelected ? "सभी हटाएं" : "सभी चुनें"}
                                      checked={allSelected}
                                      onChange={() =>
                                        handleCheckboxChange(
                                          "investment_name",
                                          "SELECT_ALL"
                                        )
                                      }
                                    />
                                  );
                                })()}
                              </div>
                              {filterOptions.investment_name.map((option) => (
                                <div key={option} className="dropdown-item">
                                  <FormCheck
                                    className="check-box"
                                    type="checkbox"
                                    id={`investment_name_${option}`}
                                    label={option}
                                    checked={filters.investment_name.includes(
                                      option
                                    )}
                                    onChange={() =>
                                      handleCheckboxChange(
                                        "investment_name",
                                        option
                                      )
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-2">
                        <Form.Label className="form-label fw-bold">
                          {translations.subInvestmentName}
                        </Form.Label>
                        <div className="dropdown">
                          <button
                            className="btn btn-secondary dropdown-toggle drop-option-custom"
                            type="button"
                            onClick={() =>
                              view === "main" &&
                              toggleDropdown("sub_investment_name")
                            }
                          >
                            {filters.sub_investment_name.length === 0
                              ? translations.selectOption
                              : `${filters.sub_investment_name.length} selected`}
                          </button>
                          {dropdownOpen.sub_investment_name && (
                            <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', zIndex: 1000 }}>
                              <div
                                key="select_all_sub_investment"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected = filterOptions.sub_investment_name.length > 0 &&
                                    filters.sub_investment_name.length === filterOptions.sub_investment_name.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`sub_investment_name_SELECT_ALL`}
                                      label={allSelected ? "सभी हटाएं" : "सभी चुनें"}
                                      checked={allSelected}
                                      onChange={() =>
                                        handleCheckboxChange(
                                          "sub_investment_name",
                                          "SELECT_ALL"
                                        )
                                      }
                                    />
                                  );
                                })()}
                              </div>
                              {filterOptions.sub_investment_name.map(
                                (option) => (
                                  <div key={option} className="dropdown-item">
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`sub_investment_name_${option}`}
                                      label={option}
                                      checked={filters.sub_investment_name.includes(
                                        option
                                      )}
                                      onChange={() =>
                                        handleCheckboxChange(
                                          "sub_investment_name",
                                          option
                                        )
                                      }
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-2">
                        <Form.Label className="form-label fw-bold">
                          {translations.sourceOfReceipt}
                        </Form.Label>
                        <div className="dropdown">
                          <button
                            className="btn btn-secondary dropdown-toggle drop-option-custom"
                            type="button"
                            onClick={() =>
                              view === "main" &&
                              toggleDropdown("source_of_receipt")
                            }
                          >
                            {filters.source_of_receipt.length === 0
                              ? translations.selectOption
                              : `${filters.source_of_receipt.length} selected`}
                          </button>
                          {dropdownOpen.source_of_receipt && (
                            <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', zIndex: 1000 }}>
                              <div
                                key="select_all_source"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected = filterOptions.source_of_receipt.length > 0 &&
                                    filters.source_of_receipt.length === filterOptions.source_of_receipt.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`source_of_receipt_SELECT_ALL`}
                                      label={allSelected ? "सभी हटाएं" : "सभी चुनें"}
                                      checked={allSelected}
                                      onChange={() =>
                                        handleCheckboxChange(
                                          "source_of_receipt",
                                          "SELECT_ALL"
                                        )
                                      }
                                    />
                                  );
                                })()}
                              </div>
                              {filterOptions.source_of_receipt.map((option) => (
                                <div key={option} className="dropdown-item">
                                  <FormCheck
                                    className="check-box"
                                    type="checkbox"
                                    id={`source_of_receipt_${option}`}
                                    label={option}
                                    checked={filters.source_of_receipt.includes(
                                      option
                                    )}
                                    onChange={() =>
                                      handleCheckboxChange(
                                        "source_of_receipt",
                                        option
                                      )
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                    <Col>
                      <Form.Group className="mb-2">
                        <Form.Label className="form-label fw-bold">
                          {translations.schemeName}
                        </Form.Label>
                        <div className="dropdown">
                          <button
                            className="btn btn-secondary dropdown-toggle drop-option-custom"
                            type="button"
                            onClick={() =>
                              view === "main" && toggleDropdown("scheme_name")
                            }
                          >
                            {filters.scheme_name.length === 0
                              ? translations.selectOption
                              : `${filters.scheme_name.length} selected`}
                          </button>
                          {dropdownOpen.scheme_name && (
                            <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', zIndex: 1000 }}>
                              <div
                                key="select_all_scheme"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected = filterOptions.scheme_name.length > 0 &&
                                    filters.scheme_name.length === filterOptions.scheme_name.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`scheme_name_SELECT_ALL`}
                                      label={allSelected ? "सभी हटाएं" : "सभी चुनें"}
                                      checked={allSelected}
                                      onChange={() =>
                                        handleCheckboxChange(
                                          "scheme_name",
                                          "SELECT_ALL"
                                        )
                                      }
                                    />
                                  );
                                })()}
                              </div>
                              {filterOptions.scheme_name.map((option) => (
                                <div key={option} className="dropdown-item">
                                  <FormCheck
                                    className="check-box"
                                    type="checkbox"
                                    id={`scheme_name_${option}`}
                                    label={option}
                                    checked={filters.scheme_name.includes(
                                      option
                                    )}
                                    onChange={() =>
                                      handleCheckboxChange(
                                        "scheme_name",
                                        option
                                      )
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              )}
              {view === "main" ? (
                <Row>
                  <Col lg={isFilterApplied ? 12 : 12} md={12} sm={12}>
                    {/* Placeholder for Dashboard Graphs/Charts */}
                    <div className="dashboard-graphs p-3 border rounded bg-white">
                      <ExportSection />
                      {isApplyingFilters && (
                        <div className="text-center py-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 text-muted">डेटा अपडेट हो रहा है...</p>
                        </div>
                      )}
                      {!isApplyingFilters && (
                        <Table
                          striped
                          bordered
                          hover
                          className="table-thead-style"
                        >
                          <thead className="table-thead">
                            <tr>
                              <th>S.No.</th>
                              {tableColumnOrder
                                .filter(col => !columnDefs[col].hidden)
                                .map((col) => (
                                  <th key={col}>{columnDefs[col].label}</th>
                                ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentPageData.map((item, index) => (
                              <tr key={item.id || index}>
                                <td>{startIndex + index + 1}</td>
                                {tableColumnOrder
                                  .filter(col => !columnDefs[col].hidden)
                                  .map((col) => (
                                    <td
                                      key={col}
                                      style={{
                                        cursor: isFilterApplied ? "default" : "pointer",
                                        color: isFilterApplied ? "black" : "blue"
                                      }}
                                      onClick={() => {
                                        if (!isFilterApplied) {
                                          handleCellClick(
                                            col,
                                            item[col]
                                          );
                                        }
                                      }}
                                    >
                                      {item[col] || "-"}
                                    </td>
                                  ))}
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td style={{ fontWeight: "bold" }}>कुल:</td>
                              {tableColumnOrder
                                .filter(col => !columnDefs[col].hidden)
                                .map((col) => (
                                  <td
                                    key={col}
                                    style={{
                                      fontWeight: "bold",
                                      cursor: col !== "allocated_quantity" && col !== "amount_of_farmer_share" && col !== "amount_of_subsidy" && col !== "total_amount" ? "pointer" : "default",
                                      color: col !== "allocated_quantity" && col !== "amount_of_farmer_share" && col !== "amount_of_subsidy" && col !== "total_amount" ? "blue" : "black",
                                      textDecoration: col !== "allocated_quantity" && col !== "amount_of_farmer_share" && col !== "amount_of_subsidy" && col !== "total_amount" ? "underline" : "none"
                                    }}
                                    onClick={() => {
                                      if (col !== "allocated_quantity" && col !== "amount_of_farmer_share" && col !== "amount_of_subsidy" && col !== "total_amount") {
                                        handleTotalClick(col);
                                      }
                                    }}
                                  >
                                    {col === "allocated_quantity" || col === "amount_of_farmer_share" || col === "amount_of_subsidy" || col === "total_amount"
                                      ? filteredTableData
                                          .reduce(
                                            (sum, item) =>
                                              sum + (parseFloat(item[col]) || 0),
                                            0
                                          )
                                          .toFixed(2)
                                      : new Set(
                                          filteredTableData.map(
                                            (item) => item[col]
                                          )
                                        ).size}
                                  </td>
                                ))}
                            </tr>
                          </tfoot>
                        </Table>
                        
                        )}
                        {!isApplyingFilters && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <span className="text-muted page-info">
                            Page {currentPage} / {totalPages} (Total{" "}
                            {tableData.length} items)
                          </span>
                          <div>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="me-2"
                              onClick={() => goToPage(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              {"<"}
                            </Button>
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              return (
                                <Button
                                  key={pageNum}
                                  variant={
                                    currentPage === pageNum
                                      ? "primary"
                                      : "outline-secondary"
                                  }
                                  size="sm"
                                  className="me-1"
                                  onClick={() => goToPage(pageNum)}
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="ms-2"
                              onClick={() => goToPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              {">"}
                            </Button>
                          </div>
                        </div>
                        )}
                  </div>
                </Col>
              </Row>
            ) : (
                <Row>
                  <Col lg={3} md={3} sm={12}>
                    <div className="dashboard-graphs p-3 border rounded bg-white">
                      {filterStack
                        .slice()
                        .reverse()
                        .map((filter, index) => {
                          const filterIndex = filterStack.length - 1 - index;
                          // Get all unique values from filtered data for this column
                          // Sort: selected values first, then unselected
                          const currentFilteredData = tableData.filter((item) => {
                            // Apply all filters except the current one
                            for (let i = 0; i < filterStack.length; i++) {
                              if (i === filterIndex) continue;
                              const f = filterStack[i];
                              if (!f.checked[item[f.column]]) return false;
                            }
                            return true;
                          });
                          
                          const allValues = [
                            ...new Set(
                              currentFilteredData
                                .map((item) => item[filter.column])
                                .filter(Boolean)
                            ),
                          ];
                          const selectedValues = allValues
                            .filter((val) => filter.checked[val])
                            .sort();
                          const unselectedValues = allValues
                            .filter((val) => !filter.checked[val])
                            .sort();
                          const sortedValues = [
                            ...selectedValues,
                            ...unselectedValues,
                          ];
                          return (
                            <Form.Group key={filterIndex} className="mb-2">
                              <Form.Label className="form-label fw-bold">
                                {columnDefs[filter.column]?.label} चुनें
                              </Form.Label>
                              <div className="dropdown">
                                <button
                                  className="btn btn-secondary dropdown-toggle drop-option"
                                  type="button"
                                  onClick={() =>
                                    toggleDetailedDropdown(filterIndex)
                                  }
                                >
                                  {
                                    Object.values(filter.checked).filter(
                                      Boolean
                                    ).length
                                  }{" "}
                                  selected
                                </button>
                                {detailedDropdownOpen[filterIndex] && (
                                  <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', zIndex: 1000 }}>
                                    <div
                                      key="select_all"
                                      className="dropdown-item"
                                    >
                                      <FormCheck
                                        className="check-box"
                                        type="checkbox"
                                        id={`select_all_${filterIndex}`}
                                        label={
                                          Object.values(filter.checked).every(
                                            Boolean
                                          )
                                            ? "सभी हटाएं"
                                            : "सभी चुनें"
                                        }
                                        checked={Object.values(
                                          filter.checked
                                        ).every(Boolean)}
                                        onChange={() =>
                                          handleDetailedCheckboxChange(
                                            filterIndex,
                                            "SELECT_ALL"
                                          )
                                        }
                                      />
                                    </div>
                                    {sortedValues.map((val) => (
                                      <div key={val} className="dropdown-item">
                                        <FormCheck
                                          className="check-box"
                                          type="checkbox"
                                          id={`${filterIndex}_${val}`}
                                          label={val}
                                          checked={filter.checked[val] || false}
                                          onChange={() =>
                                            handleDetailedCheckboxChange(
                                              filterIndex,
                                              val
                                            )
                                          }
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Form.Group>
                          );
                        })}
                    </div>
                  </Col>
                  <Col lg={9} md={9} sm={12}>
                    <div className="dashboard-graphs p-3 border rounded bg-white">
                      {(() => {
                        const filteredData = tableData.filter((item) => {
                          for (let filter of filterStack) {
                            if (!filter.checked[item[filter.column]])
                              return false;
                          }
                          return true;
                        });
                        const currentFilter =
                          filterStack[filterStack.length - 1];
                        const checkedValues = Object.keys(
                          currentFilter.checked
                        ).filter((val) => currentFilter.checked[val]);

                        const appliedFilters = filterStack
                          .map((filter) => {
                            const selected = Object.keys(filter.checked).filter(
                              (val) => filter.checked[val]
                            );
                            return `${
                              columnDefs[filter.column]?.label
                            }: ${selected.join(", ")}`;
                          })
                          .join(" | ");

                        return (
                          <div>
                            <div className="back-btn d-flex justify-content-between align-items-center">
                              <div className="d-flex gap-2">
                                <Button
                                  variant="secondary"
                                  className="back-btn-style"
                                  size="sm"
                                  onClick={goBack}
                                >
                                  वापस जाएं
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => {
                                    setView("main");
                                    setFilterStack([]);
                                    setSelectedItem(null);
                                    setShowDetailed(false);
                                    clearFilters();
                                    setAdditionalTables([]);
                                  }}
                                >
                                 डैशबोर्ड
                                </Button>
                              </div>
                              <h5 className="mb-0">
                                {appliedFilters || selectedItem.value}
                              </h5>
                            </div>
                            {(() => {
                              if (showDetailed && checkedValues.length === 1) {
                                return (
                                  <div>
                                    <ExportSection />
                                    <Table
                                      striped
                                      bordered
                                      hover
                                      className="table-thead-style"
                                    >
                                      <thead className="table-thead">
                                        <tr>
                                          <th>S.No.</th>
                                          {tableColumnOrder
                                            .filter(col => col !== currentFilter.column && !columnDefs[col].hidden)
                                            .sort((a, b) => tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b))
                                            .map((col) => (
                                              <th key={col}>
                                                {columnDefs[col].label}
                                              </th>
                                            ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {filteredData.map((item, index) => (
                                          <tr key={item.id || index}>
                                            <td>{index + 1}</td>
                                            {tableColumnOrder
                                              .filter(col => col !== currentFilter.column && !columnDefs[col].hidden)
                                              .sort((a, b) => tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b))
                                              .map((col) => (
                                                <td
                                                  key={col}
                                                  style={{
                                                    cursor:
                                                      col !==
                                                        "allocated_quantity" &&
                                                      col !== "amount_of_farmer_share" &&
                                                      col !== "amount_of_subsidy" &&
                                                      col !== "total_amount"
                                                        ? "pointer"
                                                        : "default",
                                                    color:
                                                      col !==
                                                        "allocated_quantity" &&
                                                      col !== "amount_of_farmer_share" &&
                                                      col !== "amount_of_subsidy" &&
                                                      col !== "total_amount"
                                                        ? "blue"
                                                        : "black",
                                                  }}
                                                  onClick={
                                                    col !==
                                                      "allocated_quantity" &&
                                                    col !== "amount_of_farmer_share" &&
                                                    col !== "amount_of_subsidy" &&
                                                    col !== "total_amount"
                                                      ? () =>
                                                          handleSummaryValueClick(
                                                            col,
                                                            item[col]
                                                          )
                                                      : undefined
                                                  }
                                                >
                                                  {col ===
                                                    "allocated_quantity" ||
                                                  col === "amount_of_farmer_share" ||
                                                  col === "amount_of_subsidy" ||
                                                  col === "total_amount"
                                                    ? (
                                                        parseFloat(item[col]) ||
                                                        0
                                                      ).toFixed(2)
                                                    : item[col] || "-"}
                                                </td>
                                              ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                      <tfoot>
                                        <tr>
                                          <td style={{ fontWeight: "bold" }}>
                                            कुल:
                                          </td>
                                          {tableColumnOrder
                                            .filter(col => col !== currentFilter.column && !columnDefs[col].hidden)
                                            .sort((a, b) => tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b))
                                            .map((col) => (
                                              <td
                                                key={col}
                                                style={{ 
                                                  fontWeight: "bold",
                                                  cursor: col !== "allocated_quantity" && col !== "amount_of_farmer_share" && col !== "amount_of_subsidy" && col !== "total_amount" ? "pointer" : "default",
                                                  color: col !== "allocated_quantity" && col !== "amount_of_farmer_share" && col !== "amount_of_subsidy" && col !== "total_amount" ? "blue" : "black",
                                                  textDecoration: col !== "allocated_quantity" && col !== "amount_of_farmer_share" && col !== "amount_of_subsidy" && col !== "total_amount" ? "underline" : "none"
                                                }}
                                                onClick={
                                                  col !== "allocated_quantity" && col !== "amount_of_farmer_share" && col !== "amount_of_subsidy" && col !== "total_amount"
                                                    ? () => handleTotalClick(col)
                                                    : undefined
                                                }
                                              >
                                                {col === "allocated_quantity" ||
                                                col === "amount_of_farmer_share" ||
                                                col === "amount_of_subsidy" ||
                                                col === "total_amount"
                                                  ? filteredData
                                                      .reduce(
                                                        (sum, item) =>
                                                          sum +
                                                          (parseFloat(
                                                            item[col]
                                                          ) || 0),
                                                        0
                                                      )
                                                      .toFixed(2)
                                                  : new Set(
                                                      filteredData.map(
                                                        (item) => item[col]
                                                      )
                                                    ).size}
                                              </td>
                                            ))}
                                        </tr>
                                      </tfoot>
                                    </Table>
                                  </div>
                                );
                              } else {
                                return (
                                  <div>
                                    <ExportSection />
                                    <Table
                                      striped
                                      bordered
                                      hover
                                      className="table-thead-style"
                                    >
                                      <thead className="table-thead">
                                        <tr>
                                          <th>
                                            {columnDefs[currentFilter.column]
                                              ?.label || "Value"}
                                          </th>
                                          <th>कुल रिकॉर्ड</th>
                                          {tableColumnOrder
                                            .filter(col => col !== currentFilter.column && !columnDefs[col].hidden)
                                            .sort((a, b) => tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b))
                                            .map((col) => (
                                              <th key={col}>
                                                {columnDefs[col].label}
                                              </th>
                                            ))}
                                          <th>कुल आवंटित मात्रा</th>
                                          <th>कुल किसान की हिस्सेदारी</th>
                                          <th>कुल सब्सिडी</th>
                                          <th>कुल राशि</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {checkedValues.map((checkedValue) => {
                                          const tableDataForValue =
                                            filteredData.filter(
                                              (item) =>
                                                item[currentFilter.column] ===
                                                checkedValue
                                            );
                                          return (
                                            <tr key={checkedValue}>
                                              <td
                                                style={{
                                                  cursor: "pointer",
                                                  color: "blue",
                                                  fontWeight: "bold",
                                                }}
                                                onClick={() => {
                                                  // Generate detailed breakdown table for this clicked value
                                                  const breakdownTable = generateDetailedBreakdownTable(
                                                    [checkedValue],
                                                    currentFilter.column
                                                  );
                                                  // Generate allocation table showing allocation for selected entries
                                                  // Use the clicked column as the first column instead of hardcoded 'scheme_name'
                                                  const allocationTable = generateAllocationTable(currentFilter.column, checkedValue, currentFilter.column);
                                                  setAdditionalTables(prev => [allocationTable, breakdownTable, ...prev]);
                                                }}
                                              >
                                                {checkedValue}
                                              </td>
                                              <td
                                                style={{
                                                  cursor: "pointer",
                                                  color: "blue",
                                                  fontWeight: "bold",
                                                }}
                                                onClick={() => {
                                                  // Create a new filter stack with only this value selected
                                                  const newFilterStack = filterStack.slice(0, -1);
                                                  const newChecked = {};
                                                  newChecked[checkedValue] = true;
                                                  newFilterStack.push({
                                                    column: currentFilter.column,
                                                    checked: newChecked
                                                  });
                                                  setFilterStack(newFilterStack);
                                                  setShowDetailed(true);
                                                }}
                                              >
                                                {tableDataForValue.length}
                                              </td>
                                              {tableColumnOrder
                                                .filter(col => col !== currentFilter.column && !columnDefs[col].hidden)
                                                .sort((a, b) => tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b))
                                                .map((col) => (
                                                  <td
                                                    key={col}
                                                    style={{
                                                      cursor: "pointer",
                                                      color: "blue",
                                                      fontWeight: "bold",
                                                    }}
                                                    onClick={() => {
                                                      const summary = generateSummary(tableDataForValue, col);
                                                      // Generate allocation table with the clicked column as the first column
                                                      const allocationTable = generateAllocationTable(col, checkedValue, currentFilter.column);
                                                      setAdditionalTables(prev => [allocationTable, { heading: checkedValue, data: summary.data, columns: summary.columns, columnKey: col }, ...prev]);
                                                    }}
                                                  >
                                                    {
                                                      new Set(
                                                        tableDataForValue.map(
                                                          (item) => item[col]
                                                        )
                                                      ).size
                                                    }
                                                  </td>
                                                ))}
                                              <td>
                                                {tableDataForValue
                                                  .reduce(
                                                    (sum, item) =>
                                                      sum +
                                                      (parseFloat(
                                                        item.allocated_quantity
                                                      ) || 0),
                                                    0
                                                  )
                                                  .toFixed(2)}
                                              </td>
                                              <td>
                                                {tableDataForValue
                                                  .reduce(
                                                    (sum, item) =>
                                                      sum +
                                                      (parseFloat(item.amount_of_farmer_share) ||
                                                        0),
                                                    0
                                                  )
                                                  .toFixed(2)}
                                              </td>
                                              <td>
                                                {tableDataForValue
                                                  .reduce(
                                                    (sum, item) =>
                                                      sum +
                                                      (parseFloat(item.amount_of_subsidy) ||
                                                        0),
                                                    0
                                                  )
                                                  .toFixed(2)}
                                              </td>
                                              <td>
                                                {tableDataForValue
                                                  .reduce(
                                                    (sum, item) =>
                                                      sum +
                                                      (parseFloat(item.total_amount) ||
                                                        0),
                                                    0
                                                  )
                                                  .toFixed(2)}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                      <tfoot>
                                        <tr>
                                          <td style={{ fontWeight: "bold" }}>
                                            कुल:
                                          </td>
                                          <td style={{ fontWeight: "bold" }}>
                                            {checkedValues.reduce(
                                              (sum, checkedValue) => {
                                                const tableDataForValue =
                                                  filteredData.filter(
                                                    (item) =>
                                                      item[
                                                        currentFilter.column
                                                      ] === checkedValue
                                                  );
                                                return (
                                                  sum + tableDataForValue.length
                                                );
                                              },
                                              0
                                            )}
                                          </td>
                                          {tableColumnOrder
                                            .filter(col => col !== currentFilter.column && !columnDefs[col].hidden)
                                            .sort((a, b) => tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b))
                                            .map((col) => (
                                              <td
                                                key={col}
                                                style={{ 
                                                  fontWeight: "bold",
                                                  cursor: "pointer",
                                                  color: "blue",
                                                  textDecoration: "underline"
                                                }}
                                                onClick={() => handleTotalClick(col)}
                                              >
                                                {
                                                  new Set(
                                                    filteredData.map(
                                                      (item) => item[col]
                                                    )
                                                  ).size
                                                }
                                              </td>
                                            ))}
                                          <td style={{ fontWeight: "bold" }}>
                                            {checkedValues
                                              .reduce((sum, checkedValue) => {
                                                const tableDataForValue =
                                                  filteredData.filter(
                                                    (item) =>
                                                      item[
                                                        currentFilter.column
                                                      ] === checkedValue
                                                  );
                                                return (
                                                  sum +
                                                  tableDataForValue.reduce(
                                                    (s, item) =>
                                                      s +
                                                      (parseFloat(
                                                        item.allocated_quantity
                                                      ) || 0),
                                                    0
                                                  )
                                                );
                                              }, 0)
                                              .toFixed(2)}
                                          </td>
                                          <td style={{ fontWeight: "bold" }}>
                                            {checkedValues
                                              .reduce((sum, checkedValue) => {
                                                const tableDataForValue =
                                                  filteredData.filter(
                                                    (item) =>
                                                      item[
                                                        currentFilter.column
                                                      ] === checkedValue
                                                  );
                                                return (
                                                  sum +
                                                  tableDataForValue.reduce(
                                                    (s, item) =>
                                                      s +
                                                      (parseFloat(item.amount_of_farmer_share) ||
                                                        0),
                                                    0
                                                  )
                                                );
                                              }, 0)
                                              .toFixed(2)}
                                          </td>
                                          <td style={{ fontWeight: "bold" }}>
                                            {checkedValues
                                              .reduce((sum, checkedValue) => {
                                                const tableDataForValue =
                                                  filteredData.filter(
                                                    (item) =>
                                                      item[
                                                        currentFilter.column
                                                      ] === checkedValue
                                                  );
                                                return (
                                                  sum +
                                                  tableDataForValue.reduce(
                                                    (s, item) =>
                                                      s +
                                                      (parseFloat(item.amount_of_subsidy) ||
                                                        0),
                                                    0
                                                  )
                                                );
                                              }, 0)
                                              .toFixed(2)}
                                          </td>
                                          <td style={{ fontWeight: "bold" }}>
                                            {checkedValues
                                              .reduce((sum, checkedValue) => {
                                                const tableDataForValue =
                                                  filteredData.filter(
                                                    (item) =>
                                                      item[
                                                        currentFilter.column
                                                      ] === checkedValue
                                                  );
                                                return (
                                                  sum +
                                                  tableDataForValue.reduce(
                                                    (s, item) =>
                                                      s +
                                                      (parseFloat(item.total_amount) ||
                                                        0),
                                                    0
                                                  )
                                                );
                                              }, 0)
                                              .toFixed(2)}
                                          </td>
                                        </tr>
                                      </tfoot>
                                    </Table>
     {/* Replace the additional tables rendering section with this updated version: */}
{additionalTables.map((table, index) => (
  <div key={index} className="mt-4">
  <div className="d-flex justify-content-between align-items-center mb-3">
    <div className="d-flex align-items-center gap-2 table-heading ">
      <h5 className="mb-0">{table.heading}</h5>
      <div className="dropdown">
        <button
          className="btn btn-secondary dropdown-toggle drop-option"
          type="button"
          onClick={() => {
            const filterIndex = `additional_${index}`;
            toggleDetailedDropdown(filterIndex);
          }}
        >
          <BiFilter /> Filter
        </button>
        {detailedDropdownOpen[`additional_${index}`] && (
          <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', zIndex: 1000 }}>
            <div className="dropdown-item">
              <FormCheck
                className="check-box"
                type="checkbox"
                id={`select_all_additional_${index}`}
                label={
                  additionalTableFilters[index]?.allSelected
                    ? "सभी हटाएं"
                    : "सभी चुनें"
                }
                checked={additionalTableFilters[index]?.allSelected || false}
                onChange={() =>
                  handleAdditionalTableFilterChange(index, "SELECT_ALL")
                }
              />
            </div>
            {(table.originalData || table.data).map((row) => {
              const rowValue = row[table.columns[0]];
              const isChecked = additionalTableFilters[index]?.selectedValues?.includes(rowValue) || false;
              return (
                <div key={rowValue} className="dropdown-item">
                  <FormCheck
                    className="check-box"
                    type="checkbox"
                    id={`additional_${index}_${rowValue}`}
                    label={rowValue}
                    checked={isChecked}
                    onChange={() =>
                      handleAdditionalTableFilterChange(index, rowValue)
                    }
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="dropdown">
        <button
          className="btn btn-secondary dropdown-toggle drop-option"
          type="button"
          onClick={() => {
            const filterIndex = `column_${index}`;
            toggleDetailedDropdown(filterIndex);
          }}
        >
          <BiFilter /> Column Filter
        </button>
        {detailedDropdownOpen[`column_${index}`] && (
          <div className="dropdown-menu show" style={{ position: 'absolute', top: '100%', zIndex: 1000 }}>
            <div className="dropdown-item">
              <FormCheck
                className="check-box"
                type="checkbox"
                id={`select_all_columns_${index}`}
                label={
                  (additionalTableColumnFilters[index]?.length || 0) === (table.isAllocationTable ? table.columns.slice(1, -1).length : table.columns.slice(2, -2).length)
                    ? "सभी हटाएं"
                    : "सभी चुनें"
                }
                checked={(additionalTableColumnFilters[index]?.length || 0) === (table.isAllocationTable ? table.columns.slice(1, -1).length : table.columns.slice(2, -2).length)}
                onChange={() =>
                  handleAdditionalTableColumnFilterChange(index, "SELECT_ALL")
                }
              />
            </div>
            {(table.isAllocationTable ? table.columns.slice(1, -1) : table.columns.slice(2, -2)).map((col) => (
              <div key={col} className="dropdown-item">
                <FormCheck
                  className="check-box"
                  type="checkbox"
                  id={`column_${index}_${col}`}
                  label={col}
                  checked={additionalTableColumnFilters[index]?.includes(col) || false}
                  onChange={() =>
                    handleAdditionalTableColumnFilterChange(index, col)
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
      <div className="d-flex gap-2">
        <Button
          variant="danger"
          size="sm"
          onClick={() => addAdditionalTableToExport(table, "pdf", index)}
          className="d-flex align-items-center pdf-add-btn gap-1"
        >
          <RiFilePdfLine /> PDF में जोड़ें
        </Button>
        <Button
          variant="success"
          size="sm"
          onClick={() => addAdditionalTableToExport(table, "excel", index)}
          className="d-flex align-items-center exel-add-btn gap-1"
        >
          <RiFileExcelLine /> Excel में जोड़ें
        </Button>
        <Button
          variant="link"
          size="sm"
          className="text-danger p-0"
          onClick={() => setAdditionalTables(prev => prev.filter((_, i) => i !== index))}
        >
          <RiDeleteBinLine />
        </Button>
      </div>
    </div>
    <div className="table-responsive" style={{ overflowX: 'auto' }}>
      <Table
        striped
        bordered
        hover
        className="table-thead-style"
      >
        <thead className="table-thead">
          <tr>
            {(() => {
              const visibleDynamicColumns = additionalTableColumnFilters[index] || (table.isAllocationTable ? table.columns.slice(1, -1) : table.columns.slice(2, -2));
              const visibleColumns = table.isAllocationTable ? [table.columns[0], ...visibleDynamicColumns, "कुल"] : [table.columns[0], "कुल रिकॉर्ड", ...visibleDynamicColumns, "कुल आवंटित मात्रा", "कुल किसान की हिस्सेदारी", "कुल सब्सिडी", "कुल राशि"];
              return visibleColumns.map((col, idx) => (
                <th key={idx}>{col}</th>
              ));
            })()}
          </tr>
        </thead>
        <tbody>
          {(() => {
            const visibleDynamicColumns = additionalTableColumnFilters[index] || (table.isAllocationTable ? table.columns.slice(1) : table.columns.slice(2, -2));
            return table.data
              .filter(row => row[table.columns[0]] !== "कुल") // Filter out any existing total row
              .map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td
                  style={{
                    cursor: "pointer",
                    color: "blue",
                    fontWeight: "bold",
                  }}
                  onClick={() => {
                    // Add a new filter to the stack with this value
                    handleSummaryValueClick(table.columnKey, row[table.columns[0]]);
                  }}
                >
                  {row[table.columns[0]]}
                </td>
                {table.isAllocationTable ? (
                  // For allocation tables, show visible dynamic columns
                  <>
                    {visibleDynamicColumns.map((col, colIdx) => (
                      <td key={colIdx}>
                        {row[col] || "0"}
                      </td>
                    ))}
                    <td>{visibleDynamicColumns.reduce((sum, col) => sum + parseFloat(row[col] || 0), 0).toFixed(2)}</td>
                  </>
                ) : (
                  <>
                    <td
                      style={{
                        cursor: "pointer",
                        color: "blue",
                        fontWeight: "bold",
                      }}
                      onClick={() => {
                        // Add a new filter to the stack with this value and show detailed view
                        handleSummaryValueClick(table.columnKey, row[table.columns[0]]);
                        setShowDetailed(true);
                      }}
                    >
                      {row["कुल रिकॉर्ड"]}
                    </td>
                    {visibleDynamicColumns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        style={{
                          cursor: "pointer",
                          color: "blue",
                          fontWeight: "bold",
                        }}
                        onClick={() => {
                          // Find the column key for this label
                          const colKey = Object.keys(columnDefs).find(
                            (k) => columnDefs[k].label === col
                          );
                          if (colKey) {
                            // Get the data for this value
                            const currentFilteredData = tableData.filter((item) => {
                              for (let filter of filterStack) {
                                if (!filter.checked[item[filter.column]]) return false;
                              }
                              return item[table.columnKey] === row[table.columns[0]];
                            });

                            // Generate a new summary table
                            const summary = generateSummary(currentFilteredData, colKey);
                            // Generate allocation table with the clicked column as the first column
                            const allocationTable = generateAllocationTable(colKey, row[table.columns[0]], table.columnKey);
                            setAdditionalTables(prev => [allocationTable, {
                              heading: `${row[table.columns[0]]} - ${col}`,
                              data: summary.data,
                              columns: summary.columns,
                              columnKey: colKey
                            }, ...prev]);
                          }
                        }}
                      >
                        {row[col]}
                      </td>
                    ))}
                    <td>{row["कुल आवंटित मात्रा"]}</td>
                    <td>{row["कुल किसान की हिस्सेदारी"]}</td>
                    <td>{row["कुल सब्सिडी"]}</td>
                    <td>{row["कुल राशि"]}</td>
                  </>
                )}
              </tr>
            ));
          })()}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#f2f2f2', fontWeight: 'bold' }}>
            {(() => {
              const visibleDynamicColumns = additionalTableColumnFilters[index] || (table.isAllocationTable ? table.columns.slice(1) : table.columns.slice(2, -2));
              const filteredData = table.data.filter(row => row[table.columns[0]] !== "कुल");
              return table.isAllocationTable ? (
                <>
                  <td>कुल:</td>
                  {visibleDynamicColumns.map((col, idx) => (
                    <td key={idx}>
                      {filteredData.reduce((sum, row) => sum + parseFloat(row[col] || 0), 0).toFixed(2)}
                    </td>
                  ))}
                  <td>
                    {filteredData.reduce((sum, row) => sum + visibleDynamicColumns.reduce((s, col) => s + parseFloat(row[col] || 0), 0), 0).toFixed(2)}
                  </td>
                </>
              ) : (
                <>
                  <td>कुल:</td>
                  <td>
                    {filteredData.reduce((sum, row) => sum + row["कुल रिकॉर्ड"], 0)}
                  </td>
                  {visibleDynamicColumns.map((col, idx) => (
                    <td key={idx}>
                      {new Set(
                        filteredData.flatMap(row =>
                          tableData.filter(item => item[table.columnKey] === row[table.columns[0]])
                            .map(item => item[Object.keys(columnDefs).find(k => columnDefs[k].label === col)])
                        )
                      ).size}
                    </td>
                  ))}
                  <td>
                    {filteredData.reduce((sum, row) => sum + parseFloat(row["कुल आवंटित मात्रा"] || 0), 0).toFixed(2)}
                  </td>
                  <td>
                    {filteredData.reduce((sum, row) => sum + parseFloat(row["कुल किसान की हिस्सेदारी"] || 0), 0).toFixed(2)}
                  </td>
                  <td>
                    {filteredData.reduce((sum, row) => sum + parseFloat(row["कुल सब्सिडी"] || 0), 0).toFixed(2)}
                  </td>
                  <td>
                    {filteredData.reduce((sum, row) => sum + parseFloat(row["कुल राशि"] || 0), 0).toFixed(2)}
                  </td>
                </>
              );
            })()}
          </tr>
        </tfoot>
      </Table>
    </div>
  </div>
))}
                                    {selectedTotalColumn && (
                                      <div className="mt-4">
                                        <h6>
                                          Summary for{" "}
                                          {
                                            columnDefs[selectedTotalColumn]
                                              .label
                                          }
                                        </h6>
                                        <Button
                                          variant="secondary"
                                          size="sm"
                                          onClick={() =>
                                            setSelectedTotalColumn(null)
                                          }
                                        >
                                          Close
                                        </Button>
                                        <Table
                                          striped
                                          bordered
                                          hover
                                          className="table-thead-style mt-2"
                                        >
                                          <thead className="table-thead">
                                            <tr>
                                              <th>
                                                {
                                                  columnDefs[
                                                    selectedTotalColumn
                                                  ].label
                                                }
                                              </th>
                                              <th>Number of Records</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {[
                                              ...new Set(
                                                filteredData.map(
                                                  (item) =>
                                                    item[selectedTotalColumn]
                                                )
                                              ),
                                            ].map((value) => {
                                              const count = filteredData.filter(
                                                (item) =>
                                                  item[selectedTotalColumn] ===
                                                  value
                                              ).length;
                                              return (
                                                <tr key={value}>
                                                  <td>{value || "-"}</td>
                                                  <td>{count}</td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </Table>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        );
                      })()}
                    </div>
                  </Col>
                </Row>
              )}
            </Container>
          </Col>
        </Row>
      </Container>

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
        <Modal.Header closeButton className="modal-header-style">
          <div>
            {exportType === "pdf" ? "PDF में जोड़ें" : "Excel में जोड़ें"}
          </div>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>टेबल का नाम</Form.Label>
            <Form.Control
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="टेबल का नाम दर्ज करें"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowExportModal(false)}
            className="remove-btn"
          >
            रद्द करें
          </Button>
          <Button
            variant={exportType === "pdf" ? "danger" : "success"}
            className="add-btn"
            onClick={confirmAddTable}
          >
            जोड़ें
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Table Selection Modal */}
      <TableSelectionModal />
      
      {/* Preview Modal */}
      <PreviewModal />
    </div>
  );
};

export default MainDashboard;