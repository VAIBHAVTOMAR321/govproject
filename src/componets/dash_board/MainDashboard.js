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
  Dropdown,
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
  RiRepeatLine,
} from "react-icons/ri";
import "../../assets/css/MainDashBoard.css";
import { IoMdRefresh } from "react-icons/io";
import * as XLSX from "xlsx";
import html2pdf from "html2pdf.js";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import Chart from "chart.js/auto";

const API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/";

// Hindi translations for form
const translations = {
  pageTitle: "मुख्य डैशबोर्ड",
  centerName: "केंद्र",
  investmentName: "निवेश",
  subInvestmentName: "उप-निवेश",
  sourceOfReceipt: "सप्लायर",
  schemeName: "योजना ",
  vikasKhandName: "विकास खंड",
  vidhanSabhaName: "विधानसभा",
  selectOption: "चुनें",
};

// Define the table column order
const tableColumnOrder = [
  "vikas_khand_name",
  "center_name",
  "vidhan_sabha_name",
  "scheme_name",
  "source_of_receipt",
  "investment_name",
  "sub_investment_name",
  "allocated_quantity",
  "amount_of_farmer_share",
  "amount_of_subsidy",
  "total_amount",
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
  bill_date: { label: "लाभार्थी पंजीकरण तिथि", key: "bill_date", hidden: true },
  allocated_quantity: { label: "आवंटित मात्रा", key: "allocated_quantity" },
  rate: { label: "दर", key: "rate", hidden: true },
  amount_of_farmer_share: {
    label: "किसान की हिस्सेदारी की राशि",
    key: "amount_of_farmer_share",
  },
  amount_of_subsidy: { label: "सब्सिडी की राशि", key: "amount_of_subsidy" },
  total_amount: { label: "कुल राशि", key: "total_amount" },
};

// Reusable Column Filter Component
const ColumnFilter = ({
  tableId,
  columns,
  selectedColumns,
  onColumnToggle,
  onToggleAll,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <Dropdown
      show={dropdownOpen}
      onToggle={(isOpen) => setDropdownOpen(isOpen)}
    >
      <Dropdown.Toggle
        variant="outline-secondary"
        size="sm"
        id="column-filter-dropdown"
        className="column-filter-toggle"
      >
        <BiFilter /> Columns ({selectedColumns.length}/{columns.length})
      </Dropdown.Toggle>

      <Dropdown.Menu className="column-filter-menu">
        <div className="p-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
          <FormCheck
            type="checkbox"
            id={`select-all-columns-${tableId}`}
            label={
              selectedColumns.length === columns.length
                ? "Deselect All"
                : "Select All"
            }
            checked={selectedColumns.length === columns.length}
            onChange={() => onToggleAll()}
            className="mb-2"
          />
          {columns.map((column) => (
            <FormCheck
              key={column}
              type="checkbox"
              id={`column-${tableId}-${column}`}
              label={column}
              checked={selectedColumns.includes(column)}
              onChange={() => onColumnToggle(column)}
              className="mb-1"
            />
          ))}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

// Function to generate summary table for विकासखंड और केंद्र
// This groups data into: vikasKhand -> centers -> schemes -> investments -> subInvestments
const generateVikasKhandSummary = (data) => {
  if (!data || data.length === 0) return [];

  // Structure: vikasKhand -> center -> scheme -> { investmentsMap: { investmentName: Set(subInvestments) } }
  const groupedByVikasKhand = {};

  data.forEach((item) => {
    const vikasKhand = item.vikas_khand_name || "अनजान";
    const center = item.center_name || "अनजान";
    const scheme = item.scheme_name || "अनिर्दिष्ट योजना";
    const investment = item.investment_name || "अनिर्दिष्ट निवेश";
    const subInvestment = item.sub_investment_name || null;

    if (!groupedByVikasKhand[vikasKhand]) groupedByVikasKhand[vikasKhand] = {};
    if (!groupedByVikasKhand[vikasKhand][center]) groupedByVikasKhand[vikasKhand][center] = {};
    if (!groupedByVikasKhand[vikasKhand][center][scheme]) {
      groupedByVikasKhand[vikasKhand][center][scheme] = { investmentsMap: {} };
    }

    const investmentsMap = groupedByVikasKhand[vikasKhand][center][scheme].investmentsMap;
    if (!investmentsMap[investment]) investmentsMap[investment] = new Set();
    if (subInvestment) investmentsMap[investment].add(subInvestment);
  });

  // Convert to array format suitable for rendering where each investment contains its subInvestments
  return Object.entries(groupedByVikasKhand).map(([vikasKhand, centersObj]) => ({
    vikasKhand,
    centers: Object.entries(centersObj).map(([centerName, schemesObj]) => ({
      centerName,
      schemes: Object.entries(schemesObj).map(([schemeName, schemeObj]) => ({
        schemeName,
        investments: Object.entries(schemeObj.investmentsMap || {}).map(([investmentName, subSet]) => ({
          investmentName,
          subInvestments: Array.from(subSet),
        })),
      })),
    })),
  }));
};

// Function to render the summary table (shows scheme -> investments per center)
// NOTE: This render function has been removed as per user request.
// The generateVikasKhandSummary logic is kept for use in other summary tables.
const renderVikasKhandSummaryTable = (summaryData) => {
  // This function is now disabled - UI removed but logic preserved in generateVikasKhandSummary
  return null;
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

  // State for date range filter
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);

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
  const [additionalTableColumnFilters, setAdditionalTableColumnFilters] =
    useState({});
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState("pdf");
  const [tableName, setTableName] = useState("");
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [currentTableForExport, setCurrentTableForExport] = useState(null);
  const [showTableSelectionModal, setShowTableSelectionModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewType, setPreviewType] = useState("pdf");
  const [isRotated, setIsRotated] = useState([]);

  // Add state to track navigation history for proper back button functionality
  const [navigationHistory, setNavigationHistory] = useState([]);

  // Add state for column filters for different tables
  const [tableColumnFilters, setTableColumnFilters] = useState({
    main: [],
    summary: [],
    detail: [],
    additional: {},
  });

  // Add state for graph visualization
  const [graphType, setGraphType] = useState("bar"); // bar, pie, doughnut
  const [graphColumn, setGraphColumn] = useState("center_name");
  
  // State to track currently displayed table for graph synchronization
  const [currentDisplayedTable, setCurrentDisplayedTable] = useState({
    type: "main", // main, summary, detail, breakdown
    data: [],
    columns: [],
  });

  // State for summary table total breakdown filter
  // Options: center_name, vidhan_sabha_name, vikas_khand_name, scheme_name, investment_name, sub_investment_name
  const [summaryTotalBreakdownColumn, setSummaryTotalBreakdownColumn] = useState("");

  // State for report generation
  const [reportDateStart, setReportDateStart] = useState('');
  const [reportDateEnd, setReportDateEnd] = useState('');
  const [reportType, setReportType] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMultiSelectOptions, setReportMultiSelectOptions] = useState([]);
  const [selectedReportValues, setSelectedReportValues] = useState([]);

  // State for Vidhan Sabha table grouping
  const [vidhanSabhaGrouping, setVidhanSabhaGrouping] = useState('vidhan_sabha_name');

  // State for Vidhan Sabha table column type
  const [vidhanSabhaColumnType, setVidhanSabhaColumnType] = useState('investment_name');

  // State for Vidhan Sabha table scheme filter
  const [vidhanSabhaSchemeFilter, setVidhanSabhaSchemeFilter] = useState([]);

  // Function to generate breakdown data for totals columns based on selected grouping
  const generateTotalBreakdown = (data, groupByColumn) => {
    if (!data || data.length === 0) return [];
    
    // Group data by the selected column
    const grouped = {};
    data.forEach((item) => {
      const groupKey = item[groupByColumn] || "अज्ञात";
      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          groupName: groupKey,
          investments: {},
          totals: {
            allocated_quantity: 0,
            amount_of_farmer_share: 0,
            amount_of_subsidy: 0,
            total_amount: 0,
          },
        };
      }
      
      // Track investments and sub-investments
      const invName = item.investment_name || "अज्ञात निवेश";
      const subInvName = item.sub_investment_name || "अज्ञात उप-निवेश";
      const unit = item.unit || "";
      
      if (!grouped[groupKey].investments[invName]) {
        grouped[groupKey].investments[invName] = {
          name: invName,
          unit: unit,
          subInvestments: {},
          totals: {
            allocated_quantity: 0,
            amount_of_farmer_share: 0,
            amount_of_subsidy: 0,
            total_amount: 0,
          },
        };
      }
      
      if (!grouped[groupKey].investments[invName].subInvestments[subInvName]) {
        grouped[groupKey].investments[invName].subInvestments[subInvName] = {
          name: subInvName,
          unit: unit,
          totals: {
            allocated_quantity: 0,
            amount_of_farmer_share: 0,
            amount_of_subsidy: 0,
            total_amount: 0,
          },
        };
      }
      
      // Parse allocated quantity
      const parseQty = (qty) => {
        if (typeof qty === "string" && qty.includes(" / ")) {
          return parseFloat(qty.split(" / ")[0]) || 0;
        }
        return parseFloat(qty) || 0;
      };
      
      const qty = parseQty(item.allocated_quantity);
      const farmerShare = parseFloat(item.amount_of_farmer_share) || 0;
      const subsidy = parseFloat(item.amount_of_subsidy) || 0;
      const total = parseFloat(item.total_amount) || 0;
      
      // Add to group totals
      grouped[groupKey].totals.allocated_quantity += qty;
      grouped[groupKey].totals.amount_of_farmer_share += farmerShare;
      grouped[groupKey].totals.amount_of_subsidy += subsidy;
      grouped[groupKey].totals.total_amount += total;
      
      // Add to investment totals
      grouped[groupKey].investments[invName].totals.allocated_quantity += qty;
      grouped[groupKey].investments[invName].totals.amount_of_farmer_share += farmerShare;
      grouped[groupKey].investments[invName].totals.amount_of_subsidy += subsidy;
      grouped[groupKey].investments[invName].totals.total_amount += total;
      
      // Add to sub-investment totals
      grouped[groupKey].investments[invName].subInvestments[subInvName].totals.allocated_quantity += qty;
      grouped[groupKey].investments[invName].subInvestments[subInvName].totals.amount_of_farmer_share += farmerShare;
      grouped[groupKey].investments[invName].subInvestments[subInvName].totals.amount_of_subsidy += subsidy;
      grouped[groupKey].investments[invName].subInvestments[subInvName].totals.total_amount += total;
      
      // Update unit if found
      if (!grouped[groupKey].investments[invName].unit && unit) {
        grouped[groupKey].investments[invName].unit = unit;
      }
      if (!grouped[groupKey].investments[invName].subInvestments[subInvName].unit && unit) {
        grouped[groupKey].investments[invName].subInvestments[subInvName].unit = unit;
      }
    });
    
    // Convert to array format
    return Object.values(grouped).map((group) => ({
      ...group,
      investments: Object.values(group.investments).map((inv) => ({
        ...inv,
        subInvestments: Object.values(inv.subInvestments),
      })),
    }));
  };

  // Calculate dynamic chart width based on number of data points
  const calculateChartWidth = () => {
    const chartData = generateChartData();
    if (!chartData || !chartData.labels) return "100%";
    
    const numItems = chartData.labels.length;
    
    // For bar charts, allocate width based on number of items
    if (graphType === "bar") {
      // Minimum width for each bar + padding
      const minWidthPerItem = 60; // pixels
      const calculatedWidth = Math.max(numItems * minWidthPerItem, 300);
      return `${calculatedWidth}px`;
    } else if (graphType === "pie" || graphType === "doughnut") {
      // For pie and doughnut charts, also enable scrolling with many segments
      const minWidthPerItem = 50; // pixels per segment
      const calculatedWidth = Math.max(numItems * minWidthPerItem, 300);
      return `${calculatedWidth}px`;
    }
    
    // Default fallback
    return "100%";
  };

  // Initialize main table column filters
  useEffect(() => {
    const visibleColumns = tableColumnOrder
      .filter((col) => !columnDefs[col].hidden)
      .map((col) => columnDefs[col].label);

    setTableColumnFilters((prev) => ({
      ...prev,
      main: visibleColumns,
      summary: visibleColumns,
      detail: visibleColumns,
    }));
  }, []);

  // Initialize column filters for additional tables when they are created
  useEffect(() => {
    if (additionalTables.length > 0) {
      const newAdditionalFilters = { ...tableColumnFilters.additional };
      const newAdditionalColumnFilters = { ...additionalTableColumnFilters };

      additionalTables.forEach((table, index) => {
        // Always initialize with all valid columns when table is created
        const validColumns = table.columns.filter(
          (col) => col && col.trim() !== ""
        );
        newAdditionalFilters[index] = validColumns;
        
        // Initialize additionalTableColumnFilters with all columns selected (including summary columns)
        // Only filter out hidden columns like _dar, _farmer, _subsidy
        if (table.isAllocationTable && !newAdditionalColumnFilters[index]) {
          const dynamicCols = table.columns.slice(1).filter(col => 
            !col.endsWith("_dar") &&
            !col.endsWith("_farmer") &&
            !col.endsWith("_subsidy")
          );
          newAdditionalColumnFilters[index] = dynamicCols;
        }
      });

      setTableColumnFilters((prev) => ({
        ...prev,
        additional: newAdditionalFilters,
      }));
      
      setAdditionalTableColumnFilters(newAdditionalColumnFilters);
    }
  }, [additionalTables]);

  // Initialize summary table column filters when view changes to detail
  useEffect(() => {
    if (view === "detail" && !showDetailed) {
      const currentFilter = filterStack[filterStack.length - 1];
      if (currentFilter) {
        const allSummaryColumns = [
          columnDefs[currentFilter.column]?.label,
          ...tableColumnOrder
            .filter((col) => !columnDefs[col].hidden)
            .filter(
              (col) =>
                col !== currentFilter.column &&
                col !== "allocated_quantity" &&
                col !== "rate" &&
                col !== "amount_of_farmer_share" &&
                col !== "amount_of_subsidy" &&
                col !== "total_amount" &&
                col !== "source_of_receipt" // Exclude सप्लायर column
            )
            .sort(
              (a, b) =>
                tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b)
            )
            .map((key) => columnDefs[key].label),
          "आवंटित मात्रा",
          "कृषक धनराशि",
          "सब्सिडी धनराशि",
          "कुल राशि",
        ].filter((col) => col && col.trim() !== ""); // Filter out empty columns

        setTableColumnFilters((prev) => ({
          ...prev,
          summary: allSummaryColumns,
          detail: allSummaryColumns,
        }));
      }
    }
  }, [view, showDetailed, filterStack]);

  // Add this state to track which columns are expanded to show values instead of counts
  const [expandedColumns, setExpandedColumns] = useState({});

  // Remember removed column positions so they can be restored to same place
  const [removedColumnPositions, setRemovedColumnPositions] = useState({
    main: {},
    summary: {},
    detail: {},
    additional: {},
  });

  // Add state for main summary table expanded columns
  const [mainSummaryExpandedColumns, setMainSummaryExpandedColumns] = useState(
    {}
  );

  // Summary header column value filters (per-column selected values)
  const [summaryColumnValueFilters, setSummaryColumnValueFilters] = useState({});
  const [summaryHeaderFilterOpen, setSummaryHeaderFilterOpen] = useState({});

  const toggleSummaryHeaderDropdown = (columnKey) => {
    setSummaryHeaderFilterOpen((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const setSummaryHeaderSelectAll = (columnKey, values) => {
    setSummaryColumnValueFilters((prev) => ({
      ...prev,
      [columnKey]: [...values],
    }));
  };

  const clearSummaryHeaderSelection = (columnKey) => {
    setSummaryColumnValueFilters((prev) => ({
      ...prev,
      [columnKey]: [],
    }));
  };

  const toggleSummaryHeaderValue = (columnKey, value) => {
    setSummaryColumnValueFilters((prev) => {
      const current = prev[columnKey] || [];
      const exists = current.includes(value);
      const next = exists ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [columnKey]: next };
    });
  };

  // Add state for allocation table toggles between dar and matra
  const [allocationTableToggles, setAllocationTableToggles] = useState({});

  // Add this function to toggle dar/matra for a specific table
  const toggleAllocationTableDisplay = (tableIndex, type) => {
    // type is 'dar', 'matra' or 'ikai'
    setAllocationTableToggles((prev) => {
      const prevObj = prev[tableIndex] || { dar: false, matra: false, ikai: false };
      return {
        ...prev,
        [tableIndex]: { ...prevObj, [type]: !prevObj[type] },
      };
    });
  };

  // Add this function to get unique values for a column
  const getUniqueValuesForColumn = (data, columnKey) => {
    return [...new Set(data.map((item) => item[columnKey]).filter(Boolean))];
  };

  // Add this function to toggle between count and values for a column
  const toggleColumnExpansion = (tableIndex, columnKey) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [`${tableIndex}_${columnKey}`]: !prev[`${tableIndex}_${columnKey}`],
    }));
  };

  // Add a function to toggle column expansion in the main summary table
  const toggleMainSummaryColumnExpansion = (columnKey) => {
    setMainSummaryExpandedColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Apply header filters to a dataset of rows for summary table
  const applySummaryHeaderFilters = (rows) => {
    if (!rows || rows.length === 0) return [];
    const entries = Object.entries(summaryColumnValueFilters || {});
    if (entries.length === 0) return rows;
    return rows.filter((row) => {
      for (const [col, selectedVals] of entries) {
        const sel = selectedVals || [];
        if (sel.length > 0) {
          if (!sel.includes(row[col])) return false;
        }
      }
      return true;
    });
  };

  // Initialize summary header filters to 'all selected' for each column
  useEffect(() => {
    const baseData =
      filteredTableData && filteredTableData.length > 0
        ? filteredTableData
        : tableData;

    const currentFilter = filterStack[filterStack.length - 1];
    if (!currentFilter) return;

    // For the first column, get all possible values from baseData (not filtered by current filter)
    // This ensures all values are available when reselecting
    const allValuesForFirstColumn = [
      ...new Set(
        baseData
          .filter((item) => {
            // Apply all filters EXCEPT the current (last) filter
            for (let i = 0; i < filterStack.length - 1; i++) {
              const f = filterStack[i];
              if (!f.checked[item[f.column]]) return false;
            }
            return true;
          })
          .map((item) => item[currentFilter.column])
          .filter(Boolean)
      ),
    ];

    // For other columns, use data filtered by all filters including current
    const currentFilteredData = baseData.filter((item) => {
      for (let filter of filterStack) {
        if (!filter.checked[item[filter.column]]) return false;
      }
      return true;
    });

    // Summary columns: first column + other visible non-amount columns
    const summaryKeys = [
      currentFilter.column,
      ...tableColumnOrder
        .filter((col) => col !== currentFilter.column && !columnDefs[col].hidden)
        .filter(
          (col) =>
            col !== "allocated_quantity" &&
            col !== "rate" &&
            col !== "amount_of_farmer_share" &&
            col !== "amount_of_subsidy" &&
            col !== "total_amount"
        ),
    ];

    setSummaryColumnValueFilters((prev) => {
      const next = { ...prev };
      for (const col of summaryKeys) {
        // For the first column (currentFilter.column), always sync with the left filter's checked values
        // This ensures that when a value is reselected in the left filter, it appears in the summary table
        if (col === currentFilter.column) {
          // Get all values that are currently checked in the left filter
          const checkedValuesFromFilter = Object.keys(currentFilter.checked).filter(
            (val) => currentFilter.checked[val]
          );
          // Use allValuesForFirstColumn which includes all possible values (not filtered by current filter)
          next[col] = checkedValuesFromFilter.filter((v) => allValuesForFirstColumn.includes(v));
        } else {
          const allVals = getUniqueValuesForColumn(currentFilteredData, col);
          if (!Array.isArray(next[col]) || next[col].length === 0) {
            next[col] = [...allVals];
          } else {
            // Keep user selection but trim to existing values
            next[col] = next[col].filter((v) => allVals.includes(v));
          }
        }
      }
      return next;
    });
  }, [filterStack, tableColumnFilters.summary, tableData, filteredTableData]);

  // Add a function to get unique values for a column in the main summary table
  const getMainSummaryUniqueValues = (columnKey, rowValue) => {
    // Get the current filtered data based on the filter stack
      const baseData =
        filteredTableData && filteredTableData.length > 0
          ? filteredTableData
          : tableData;

      const currentFilteredData = baseData.filter((item) => {
      for (let filter of filterStack) {
        if (!filter.checked[item[filter.column]]) return false;
      }
      return true;
    });

    // If rowValue is null, get all unique values from the entire filtered data
    if (rowValue === null) {
      const headerFilteredAll = applySummaryHeaderFilters(currentFilteredData);
      return [
        ...new Set(
          headerFilteredAll.map((item) => item[columnKey]).filter(Boolean)
        ),
      ];
    }

    // Determine current filter (if any) and filter data for the specific row value
    const currentFilter = filterStack[filterStack.length - 1];
    let rowSpecificData = currentFilteredData.filter((item) => {
      if (!currentFilter || !currentFilter.column) return true;
      return item[currentFilter.column] === rowValue;
    });
    rowSpecificData = applySummaryHeaderFilters(rowSpecificData);

    // Get unique values for the column
    return [
      ...new Set(
        rowSpecificData.map((item) => item[columnKey]).filter(Boolean)
      ),
    ];
  };

  // Function to get unique values with their matra sum for sub_investment_name and investment_name columns
  const getUniqueValuesWithMatra = (columnKey, rowValue) => {
    // Get the current filtered data based on the filter stack
    const baseData =
      filteredTableData && filteredTableData.length > 0
        ? filteredTableData
        : tableData;

    const currentFilteredData = baseData.filter((item) => {
      for (let filter of filterStack) {
        if (!filter.checked[item[filter.column]]) return false;
      }
      return true;
    });

    // Get the current filter
    const currentFilter = filterStack[filterStack.length - 1];

    // Filter data for the specific row value
    let rowSpecificData;
    if (rowValue === null) {
      rowSpecificData = currentFilteredData;
    } else {
      rowSpecificData = currentFilteredData.filter(
        (item) => item[currentFilter.column] === rowValue
      );
    }
    rowSpecificData = applySummaryHeaderFilters(rowSpecificData);

    // Group by the column value and sum the allocated_quantity and collect unit
    const groupedData = {};
    rowSpecificData.forEach((item) => {
      const key = item[columnKey];
      if (key) {
        if (!groupedData[key]) {
          groupedData[key] = { matra: 0, unit: "" };
        }
        // Parse allocated_quantity - handle string with " / " separator
        let qty = item.allocated_quantity;
        if (typeof qty === "string" && qty.includes(" / ")) {
          qty = parseFloat(qty.split(" / ")[0]) || 0;
        } else {
          qty = parseFloat(qty) || 0;
        }
        groupedData[key].matra += qty;
        if (!groupedData[key].unit) {
          const u = getUnitFromItem(item);
          if (u) groupedData[key].unit = u;
        }
      }
    });

    // Convert to array of objects with name, matra and unit (and a display string)
    return Object.entries(groupedData).map(([name, info]) => ({
      name,
      matra: info.matra.toFixed(2),
      unit: info.unit || "",
      display: `${name}${info.unit ? ` (${info.unit})` : ""}${info.matra ? ` (${info.matra.toFixed(2)})` : ""}`,
    }));
  };

  // Function to get उप-निवेश grouped by निवेश with their matra
  const getSubInvestmentGroupedByInvestment = (rowValue) => {
    // Get the current filtered data based on the filter stack
    const baseData =
      filteredTableData && filteredTableData.length > 0
        ? filteredTableData
        : tableData;

    const currentFilteredData = baseData.filter((item) => {
      for (let filter of filterStack) {
        if (!filter.checked[item[filter.column]]) return false;
      }
      return true;
    });

    // Get the current filter
    const currentFilter = filterStack[filterStack.length - 1];

    // Filter data for the specific row value
    let rowSpecificData;
    if (rowValue === null) {
      rowSpecificData = currentFilteredData;
    } else {
      rowSpecificData = currentFilteredData.filter(
        (item) => item[currentFilter.column] === rowValue
      );
    }
    rowSpecificData = applySummaryHeaderFilters(rowSpecificData);

    // Group by investment_name first, then by sub_investment_name
    const groupedData = {};
    rowSpecificData.forEach((item) => {
      const investmentName = item.investment_name;
      const subInvestmentName = item.sub_investment_name;
      
      if (investmentName && subInvestmentName) {
        if (!groupedData[investmentName]) {
          groupedData[investmentName] = {};
        }
        if (!groupedData[investmentName][subInvestmentName]) {
          groupedData[investmentName][subInvestmentName] = { matra: 0, unit: "" };
        }
        // Parse allocated_quantity - handle string with " / " separator
        let qty = item.allocated_quantity;
        if (typeof qty === "string" && qty.includes(" / ")) {
          qty = parseFloat(qty.split(" / ")[0]) || 0;
        } else {
          qty = parseFloat(qty) || 0;
        }
        groupedData[investmentName][subInvestmentName].matra += qty;
        if (!groupedData[investmentName][subInvestmentName].unit) {
          const u = getUnitFromItem(item);
          if (u) groupedData[investmentName][subInvestmentName].unit = u;
        }
      }
    });

    // Convert to hierarchical structure with unit only at investment level
    return Object.entries(groupedData).map(([investmentName, subInvestments]) => {
      // Collect unit from first sub-investment (display at investment level only)
      let investmentUnit = "";
      for (const [, info] of Object.entries(subInvestments)) {
        if (info.unit) {
          investmentUnit = info.unit;
          break;
        }
      }

      return {
        investmentName,
        unit: investmentUnit, // Unit stored at investment level
        subInvestments: Object.entries(subInvestments).map(([name, info]) => ({
          name,
          matra: info.matra.toFixed(2),
          // display sub_investment without unit (unit shown only at investment level)
          display: `${name} (${info.matra.toFixed(2)})`,
        })),
      };
    });
  };

  // Totals helper: उप-निवेश grouped by निवेश with unit at both levels
  const getSubInvestmentGroupedByInvestmentWithUnit = (rowValue) => {
    const baseData =
      filteredTableData && filteredTableData.length > 0
        ? filteredTableData
        : tableData;

    const currentFilteredData = baseData.filter((item) => {
      for (let filter of filterStack) {
        if (!filter.checked[item[filter.column]]) return false;
      }
      return true;
    });

    const currentFilter = filterStack[filterStack.length - 1];

    let rowSpecificData;
    if (rowValue === null) {
      rowSpecificData = currentFilteredData;
    } else {
      rowSpecificData = currentFilteredData.filter(
        (item) => item[currentFilter.column] === rowValue
      );
    }

    const parseQty = (qty) => {
      if (typeof qty === "string" && qty.includes(" / ")) {
        return parseFloat(qty.split(" / ")[0]) || 0;
      }
      return parseFloat(qty) || 0;
    };

    const groupedData = {};
    rowSpecificData.forEach((item) => {
      const investmentName = item.investment_name;
      const subInvestmentName = item.sub_investment_name;
      if (!investmentName || !subInvestmentName) return;

      if (!groupedData[investmentName]) {
        groupedData[investmentName] = { matra: 0, unit: "", subs: {} };
      }
      if (!groupedData[investmentName].subs[subInvestmentName]) {
        groupedData[investmentName].subs[subInvestmentName] = { matra: 0, unit: "" };
      }

      const qty = parseQty(item.allocated_quantity);
      groupedData[investmentName].matra += qty;
      groupedData[investmentName].subs[subInvestmentName].matra += qty;

      // Set investment-level unit
      if (!groupedData[investmentName].unit) {
        const uInv = getUnitFromItem(item);
        if (uInv) groupedData[investmentName].unit = uInv;
      }
      // Set sub-investment-level unit
      if (!groupedData[investmentName].subs[subInvestmentName].unit) {
        const uSub = getUnitFromItem(item);
        if (uSub) groupedData[investmentName].subs[subInvestmentName].unit = uSub;
      }
    });

    return Object.entries(groupedData).map(([investmentName, info]) => ({
      investmentName,
      unit: info.unit || "",
      matra: info.matra.toFixed(2),
      subInvestments: Object.entries(info.subs).map(([name, sInfo]) => ({
        name,
        unit: sInfo.unit || "",
        matra: sInfo.matra.toFixed(2),
      })),
    }));
  };

  // Function to get योजना -> निवेश (unit/matra) -> उप-निवेश hierarchy
  const getSchemeInvestmentHierarchy = (rowValue) => {
    // Get the current filtered data based on the filter stack
    const baseData =
      filteredTableData && filteredTableData.length > 0
        ? filteredTableData
        : tableData;

    const currentFilteredData = baseData.filter((item) => {
      for (let filter of filterStack) {
        if (!filter.checked[item[filter.column]]) return false;
      }
      return true;
    });

    // Get the current filter
    const currentFilter = filterStack[filterStack.length - 1];

    // Filter data for the specific row value
    let rowSpecificData;
    if (rowValue === null) {
      rowSpecificData = currentFilteredData;
    } else {
      rowSpecificData = currentFilteredData.filter(
        (item) => item[currentFilter.column] === rowValue
      );
    }
    rowSpecificData = applySummaryHeaderFilters(rowSpecificData);

    // Helper to parse quantity safely (handles "x / y" strings)
    const parseQty = (qty) => {
      if (typeof qty === "string" && qty.includes(" / ")) {
        return parseFloat(qty.split(" / ")[0]) || 0;
      }
      return parseFloat(qty) || 0;
    };

    // Group by scheme_name -> investment_name -> sub_investment_name
    const grouped = {};
    rowSpecificData.forEach((item) => {
      const scheme = item.scheme_name;
      const investment = item.investment_name;
      const subInvestment = item.sub_investment_name;
      if (!scheme || !investment || !subInvestment) return;

      if (!grouped[scheme]) grouped[scheme] = {};
      if (!grouped[scheme][investment]) {
        grouped[scheme][investment] = { matra: 0, unit: "", subs: {} };
      }
      if (!grouped[scheme][investment].subs[subInvestment]) {
        grouped[scheme][investment].subs[subInvestment] = { matra: 0 };
      }

      const qty = parseQty(item.allocated_quantity);
      grouped[scheme][investment].matra += qty;
      grouped[scheme][investment].subs[subInvestment].matra += qty;
      // Set unit at investment level once available
      if (!grouped[scheme][investment].unit) {
        const u = getUnitFromItem(item);
        if (u) grouped[scheme][investment].unit = u;
      }
    });

    // Convert to render-friendly structure
    return Object.entries(grouped).map(([schemeName, investments]) => ({
      schemeName,
      investments: Object.entries(investments).map(([invName, info]) => ({
        investmentName: invName,
        unit: info.unit || "",
        matra: info.matra.toFixed(2),
        subInvestments: Object.entries(info.subs).map(([subName, subInfo]) => ({
          name: subName,
          matra: subInfo.matra.toFixed(2),
        })),
      })),
    }));
  };

  // Scheme totals: योजना -> निवेश (unit/matra) -> उप-निवेश (unit/matra)
  const getSchemeInvestmentHierarchyWithUnit = (rowValue) => {
    const baseData =
      filteredTableData && filteredTableData.length > 0
        ? filteredTableData
        : tableData;

    const currentFilteredData = baseData.filter((item) => {
      for (let filter of filterStack) {
        if (!filter.checked[item[filter.column]]) return false;
      }
      return true;
    });

    const currentFilter = filterStack[filterStack.length - 1];

    let rowSpecificData;
    if (rowValue === null) {
      rowSpecificData = currentFilteredData;
    } else {
      rowSpecificData = currentFilteredData.filter(
        (item) => item[currentFilter.column] === rowValue
      );
    }
    rowSpecificData = applySummaryHeaderFilters(rowSpecificData);

    const parseQty = (qty) => {
      if (typeof qty === "string" && qty.includes(" / ")) {
        return parseFloat(qty.split(" / ")[0]) || 0;
      }
      return parseFloat(qty) || 0;
    };

    const grouped = {};
    rowSpecificData.forEach((item) => {
      const scheme = item.scheme_name;
      const investment = item.investment_name;
      const subInvestment = item.sub_investment_name;
      if (!scheme || !investment || !subInvestment) return;

      if (!grouped[scheme]) grouped[scheme] = {};
      if (!grouped[scheme][investment]) {
        grouped[scheme][investment] = { matra: 0, unit: "", subs: {} };
      }
      if (!grouped[scheme][investment].subs[subInvestment]) {
        grouped[scheme][investment].subs[subInvestment] = { matra: 0, unit: "" };
      }

      const qty = parseQty(item.allocated_quantity);
      grouped[scheme][investment].matra += qty;
      grouped[scheme][investment].subs[subInvestment].matra += qty;
      // Units
      if (!grouped[scheme][investment].unit) {
        const uInv = getUnitFromItem(item);
        if (uInv) grouped[scheme][investment].unit = uInv;
      }
      if (!grouped[scheme][investment].subs[subInvestment].unit) {
        const uSub = getUnitFromItem(item);
        if (uSub) grouped[scheme][investment].subs[subInvestment].unit = uSub;
      }
    });

    return Object.entries(grouped).map(([schemeName, investments]) => ({
      schemeName,
      investments: Object.entries(investments).map(([invName, info]) => ({
        investmentName: invName,
        unit: info.unit || "",
        matra: info.matra.toFixed(2),
        subInvestments: Object.entries(info.subs).map(([subName, sInfo]) => ({
          name: subName,
          unit: sInfo.unit || "",
          matra: sInfo.matra.toFixed(2),
        })),
      })),
    }));
  };

  // Generic: group by a column -> investment (unit/matra) -> sub-investment (matra)
  const getColumnInvestmentHierarchy = (rowValue, groupColKey) => {
    // Current filtered data based on filter stack
    const baseData =
      filteredTableData && filteredTableData.length > 0
        ? filteredTableData
        : tableData;

    const currentFilteredData = baseData.filter((item) => {
      for (let filter of filterStack) {
        if (!filter.checked[item[filter.column]]) return false;
      }
      return true;
    });

    const currentFilter = filterStack[filterStack.length - 1];

    let rowSpecificData;
    if (rowValue === null) {
      rowSpecificData = currentFilteredData;
    } else {
      rowSpecificData = currentFilteredData.filter(
        (item) => item[currentFilter.column] === rowValue
      );
    }
    rowSpecificData = applySummaryHeaderFilters(rowSpecificData);

    const parseQty = (qty) => {
      if (typeof qty === "string" && qty.includes(" / ")) {
        return parseFloat(qty.split(" / ")[0]) || 0;
      }
      return parseFloat(qty) || 0;
    };

    const grouped = {};
    rowSpecificData.forEach((item) => {
      const groupVal = item[groupColKey];
      const investment = item.investment_name;
      const subInvestment = item.sub_investment_name;
      if (!groupVal || !investment || !subInvestment) return;

      if (!grouped[groupVal]) grouped[groupVal] = {};
      if (!grouped[groupVal][investment]) {
        grouped[groupVal][investment] = { matra: 0, unit: "", subs: {} };
      }
      if (!grouped[groupVal][investment].subs[subInvestment]) {
        grouped[groupVal][investment].subs[subInvestment] = { matra: 0 };
      }

      const qty = parseQty(item.allocated_quantity);
      grouped[groupVal][investment].matra += qty;
      grouped[groupVal][investment].subs[subInvestment].matra += qty;
      if (!grouped[groupVal][investment].unit) {
        const u = getUnitFromItem(item);
        if (u) grouped[groupVal][investment].unit = u;
      }
    });

    return Object.entries(grouped).map(([groupValue, investments]) => ({
      groupValue,
      investments: Object.entries(investments).map(([invName, info]) => ({
        investmentName: invName,
        unit: info.unit || "",
        matra: info.matra.toFixed(2),
        subInvestments: Object.entries(info.subs).map(([subName, subInfo]) => ({
          name: subName,
          matra: subInfo.matra.toFixed(2),
        })),
      })),
    }));
  };

  // Function to handle column filter changes
  const handleMainTableColumnToggle = (column) => {
    setTableColumnFilters((prev) => {
      const currentSelected = prev.main;
      let newSelected;

      if (currentSelected.includes(column)) {
        // remember removed position
        const idx = currentSelected.indexOf(column);
        setRemovedColumnPositions((rp) => ({
          ...rp,
          main: { ...(rp.main || {}), [column]: idx },
        }));
        newSelected = currentSelected.filter((col) => col !== column);
      } else {
        // restore to previous position if available
        const prevPos = removedColumnPositions.main?.[column];
        if (prevPos !== undefined && prevPos >= 0) {
          newSelected = [...currentSelected];
          const insertAt = Math.min(prevPos, newSelected.length);
          newSelected.splice(insertAt, 0, column);
          // remove stored position
          setRemovedColumnPositions((rp) => {
            const copy = { ...(rp.main || {}) };
            delete copy[column];
            return { ...rp, main: copy };
          });
        } else {
          // fallback: insert according to tableColumnOrder
          const allCols = tableColumnOrder
            .filter((colKey) => !columnDefs[colKey].hidden)
            .map((k) => columnDefs[k].label);
          const insertIndex = allCols.indexOf(column);
          if (insertIndex === -1) newSelected = [...currentSelected, column];
          else {
            // find proper place among currently selected using allCols order
            const before = allCols.slice(0, insertIndex);
            let pos = currentSelected.length;
            for (let i = before.length - 1; i >= 0; i--) {
              const b = before[i];
              const p = currentSelected.indexOf(b);
              if (p !== -1) {
                pos = p + 1;
                break;
              }
            }
            newSelected = [...currentSelected];
            newSelected.splice(pos, 0, column);
          }
        }
      }

      return {
        ...prev,
        main: newSelected,
      };
    });
  };

  // Function to toggle all columns for main table
  const handleMainTableToggleAllColumns = () => {
    setTableColumnFilters((prev) => {
      const allColumns = tableColumnOrder
        .filter((col) => !columnDefs[col].hidden)
        .map((col) => columnDefs[col].label);

      const currentSelected = prev.main;
      let newSelected;

      if (currentSelected.length === allColumns.length) {
        // store current positions before clearing
        setRemovedColumnPositions((rp) => ({
          ...rp,
          main: currentSelected.reduce((acc, col, i) => {
            acc[col] = i;
            return acc;
          }, {}),
        }));
        newSelected = [];
      } else {
        // selecting all -> clear remembered positions
        setRemovedColumnPositions((rp) => ({ ...rp, main: {} }));
        newSelected = allColumns;
      }

      return {
        ...prev,
        main: newSelected,
      };
    });
  };

  // Function to handle column filter changes for summary table
  const handleSummaryTableColumnToggle = (column) => {
    setTableColumnFilters((prev) => {
      const currentSelected = prev.summary || [];
      let newSelected;

      if (currentSelected.includes(column)) {
        const idx = currentSelected.indexOf(column);
        setRemovedColumnPositions((rp) => ({
          ...rp,
          summary: { ...(rp.summary || {}), [column]: idx },
        }));
        newSelected = currentSelected.filter((col) => col !== column);
      } else {
        const prevPos = removedColumnPositions.summary?.[column];
        if (prevPos !== undefined && prevPos >= 0) {
          newSelected = [...currentSelected];
          const insertAt = Math.min(prevPos, newSelected.length);
          newSelected.splice(insertAt, 0, column);
          setRemovedColumnPositions((rp) => {
            const copy = { ...(rp.summary || {}) };
            delete copy[column];
            return { ...rp, summary: copy };
          });
        } else {
          newSelected = [...currentSelected, column];
        }
      }

      return {
        ...prev,
        summary: newSelected,
      };
    });
  };

  // Function to toggle all columns for summary table
  const handleSummaryTableToggleAllColumns = () => {
    setTableColumnFilters((prev) => {
      const allColumns = [
        ...tableColumnOrder
          .filter((col) => !columnDefs[col].hidden)
          .filter(
            (col) =>
              col !== "allocated_quantity" &&
              col !== "rate" &&
              col !== "amount_of_farmer_share" &&
              col !== "amount_of_subsidy" &&
              col !== "total_amount" &&
              col !== "source_of_receipt" // Exclude सप्लायर column
          )
          .sort(
            (a, b) => tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b)
          )
          .map((key) => columnDefs[key].label),
        "आवंटित मात्रा",
        "कृषक धनराशि",
        "सब्सिडी धनराशि",
        "कुल राशि",
      ];

      const currentSelected = prev.summary || [];
      let newSelected;

      if (currentSelected.length === allColumns.length) {
        setRemovedColumnPositions((rp) => ({
          ...rp,
          summary: currentSelected.reduce((acc, col, i) => {
            acc[col] = i;
            return acc;
          }, {}),
        }));
        newSelected = [];
      } else {
        setRemovedColumnPositions((rp) => ({ ...rp, summary: {} }));
        newSelected = allColumns;
      }

      return {
        ...prev,
        summary: newSelected,
      };
    });
  };

  // Function to handle column filter changes for detail table
  const handleDetailTableColumnToggle = (column) => {
    setTableColumnFilters((prev) => {
      const currentSelected = prev.detail || [];
      let newSelected;

      if (currentSelected.includes(column)) {
        const idx = currentSelected.indexOf(column);
        setRemovedColumnPositions((rp) => ({
          ...rp,
          detail: { ...(rp.detail || {}), [column]: idx },
        }));
        newSelected = currentSelected.filter((col) => col !== column);
      } else {
        const prevPos = removedColumnPositions.detail?.[column];
        if (prevPos !== undefined && prevPos >= 0) {
          newSelected = [...currentSelected];
          const insertAt = Math.min(prevPos, newSelected.length);
          newSelected.splice(insertAt, 0, column);
          setRemovedColumnPositions((rp) => {
            const copy = { ...(rp.detail || {}) };
            delete copy[column];
            return { ...rp, detail: copy };
          });
        } else {
          newSelected = [...currentSelected, column];
        }
      }

      return {
        ...prev,
        detail: newSelected,
      };
    });
  };

  // Function to toggle all columns for detail table
  const handleDetailTableToggleAllColumns = () => {
    setTableColumnFilters((prev) => {
      const allColumns = tableColumnOrder
        .filter((col) => !columnDefs[col].hidden)
        .sort(
          (a, b) => tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b)
        )
        .map((key) => columnDefs[key].label);

      const currentSelected = prev.detail || [];
      let newSelected;

      if (currentSelected.length === allColumns.length) {
        setRemovedColumnPositions((rp) => ({
          ...rp,
          detail: currentSelected.reduce((acc, col, i) => {
            acc[col] = i;
            return acc;
          }, {}),
        }));
        newSelected = [];
      } else {
        setRemovedColumnPositions((rp) => ({ ...rp, detail: {} }));
        newSelected = allColumns;
      }

      return {
        ...prev,
        detail: newSelected,
      };
    });
  };

  // Function to handle column filter changes for additional tables
  const handleAdditionalTableColumnToggle = (tableIndex, column) => {
    setTableColumnFilters((prev) => {
      const newAdditionalFilters = { ...prev.additional };
      const currentSelected = newAdditionalFilters[tableIndex] || [];
      let newSelected;

      if (currentSelected.includes(column)) {
        const idx = currentSelected.indexOf(column);
        setRemovedColumnPositions((rp) => ({
          ...rp,
          additional: {
            ...(rp.additional || {}),
            [tableIndex]: { ...((rp.additional || {})[tableIndex] || {}), [column]: idx },
          },
        }));
        newSelected = currentSelected.filter((col) => col !== column);
      } else {
        const prevPos = (removedColumnPositions.additional || {})[tableIndex]?.[column];
        if (prevPos !== undefined && prevPos >= 0) {
          newSelected = [...currentSelected];
          const insertAt = Math.min(prevPos, newSelected.length);
          newSelected.splice(insertAt, 0, column);
          setRemovedColumnPositions((rp) => {
            const copy = { ...(rp.additional || {}) };
            copy[tableIndex] = { ...(copy[tableIndex] || {}) };
            delete copy[tableIndex][column];
            return { ...rp, additional: copy };
          });
        } else {
          newSelected = [...currentSelected, column];
        }
      }

      newAdditionalFilters[tableIndex] = newSelected;

      return {
        ...prev,
        additional: newAdditionalFilters,
      };
    });
  };

  // Function to toggle all columns for additional tables
  const handleAdditionalTableToggleAllColumns = (tableIndex, allColumns) => {
    setTableColumnFilters((prev) => {
      const newAdditionalFilters = { ...prev.additional };
      const currentSelected = newAdditionalFilters[tableIndex] || [];
      let newSelected;

      if (currentSelected.length === allColumns.length) {
        // store positions
        setRemovedColumnPositions((rp) => ({
          ...rp,
          additional: {
            ...(rp.additional || {}),
            [tableIndex]: currentSelected.reduce((acc, col, i) => {
              acc[col] = i;
              return acc;
            }, {}),
          },
        }));
        newSelected = [];
      } else {
        // clear stored positions for this table index
        setRemovedColumnPositions((rp) => ({
          ...rp,
          additional: { ...(rp.additional || {}), [tableIndex]: {} },
        }));
        newSelected = allColumns;
      }

      newAdditionalFilters[tableIndex] = newSelected;

      return {
        ...prev,
        additional: newAdditionalFilters,
      };
    });
  };

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
          unit: [...new Set(data.map((item) => item.unit).filter(Boolean))],
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
    setMainSummaryExpandedColumns({});
    setNavigationHistory([]);

    // Refresh table with all data
    setFilteredTableData(tableData);
    // Ensure the summary heading updates immediately
    checkIfTopFiltersApplied();
  };

  // Check if filters are applied from top filtering
  const checkIfTopFiltersApplied = () => {
    const hasFilters = Object.values(filters).some(
      (filter) => filter.length > 0
    );
    setIsFilterApplied(hasFilters);
  };

  // Handle cell click for detailed view
  const handleCellClick = (column, value) => {
    // Add to navigation history
    setNavigationHistory((prev) => [
      ...prev,
      {
        view,
        filterStack: [...filterStack],
        additionalTables: [...additionalTables],
      },
    ]);

    setSelectedItem({ column, value });

    // Get all unique values for this column from filtered data
    const allValues = [
      ...new Set(filteredTableData.map((item) => item[column]).filter(Boolean)),
    ];

    // Create checked object with all values initialized to true so that
    // the summary table initially shows all entries for this column
    const checked = {};
    allValues.forEach((val) => {
      checked[val] = true;
    });

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
    setAdditionalTables([]);
  };

  // Handle generate report
  const handleGenerateReport = () => {
    if (!reportDateStart || !reportDateEnd || !reportType) {
      alert('कृपया सभी फ़ील्ड भरें');
      return;
    }
    // Filter data by date range
    const filteredByDate = tableData.filter(item => {
      const itemDate = new Date(item.bill_date);
      const start = new Date(reportDateStart);
      const end = new Date(reportDateEnd);
      return itemDate >= start && itemDate <= end;
    });
    // Get unique values for reportType
    const uniqueValues = [...new Set(filteredByDate.map(item => item[reportType]).filter(Boolean))];
    setReportMultiSelectOptions(uniqueValues);
    setSelectedReportValues([]);
    setShowReportModal(true);
  };

  // Confirm report generation
  const confirmReportGeneration = () => {
    if (selectedReportValues.length === 0) {
      alert('कृपया कम से कम एक विकल्प चुनें');
      return;
    }
    // Set filters
    setFilters(prev => ({ ...prev, [reportType]: selectedReportValues }));
    // Create checked object with selected values true
    const checked = {};
    selectedReportValues.forEach(val => checked[val] = true);
    // Set filterStack
    const newFilter = { column: reportType, checked };
    setFilterStack([newFilter]);
    // Set view to detail
    setSelectedItem({ column: reportType, value: selectedReportValues.join(', ') });
    setView("detail");
    setShowReportModal(false);
    // Apply filters
    applyFilters();
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
        const baseData =
          filteredTableData && filteredTableData.length > 0
            ? filteredTableData
            : tableData;

        const currentFilteredData = baseData.filter((item) => {
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
          checked[val] = table.data.some(
            (row) => row[table.columns[0]] === val
          );
        });

        if (val === "SELECT_ALL") {
          const allSelected = Object.values(checked).every(Boolean);
          // Toggle: if all are selected, deselect all; otherwise select all
          allValues.forEach((v) => (checked[v] = !allSelected));
        } else {
          checked[val] = !checked[val];
        }

        // Update the table data based on the new checked values
        const newData = currentFilteredData.filter(
          (item) => checked[item[columnKey]]
        );
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
          const baseData =
            filteredTableData && filteredTableData.length > 0
              ? filteredTableData
              : tableData;

          const currentFilteredData = baseData.filter((item) => {
            for (let i = 0; i < prev.length; i++) {
              if (i === filterIndex) continue;
              const f = prev[i];
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

          // Create newChecked starting from the current filter.checked state
          // This preserves previous selections properly
          const newChecked = { ...filter.checked };
          
          // Ensure all current values exist in newChecked
          allValues.forEach((v) => {
            if (newChecked[v] === undefined) {
              newChecked[v] = false;
            }
          });

          if (val === "SELECT_ALL") {
            const currentlyAllSelected = allValues.every((k) => newChecked[k]);
            // Toggle: if all are selected, deselect all; otherwise select all
            allValues.forEach((k) => (newChecked[k] = !currentlyAllSelected));
          } else {
            // Simply toggle the value - this ensures reselection works
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

  // Apply filters (with date range)
  const applyFilters = () => {
    setIsApplyingFilters(true);
    let filteredData = tableData.filter((item) => {
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

    // Date filter logic
    if (dateFilter.start && dateFilter.end) {
      filteredData = filteredData.filter((item) => {
        if (!item.bill_date) return false;
        const itemDate = new Date(item.bill_date);
        const startDate = new Date(dateFilter.start);
        const endDate = new Date(dateFilter.end);
        return itemDate >= startDate && itemDate <= endDate;
      });
      setIsDateFilterApplied(true);
    } else {
      setIsDateFilterApplied(false);
    }

    setFilteredTableData(filteredData);
    setCurrentPage(1);
    checkIfTopFiltersApplied();
    setIsApplyingFilters(false);
  };

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
  }, [
    filters.center_name,
    filters.sub_investment_name,
    filters.investment_name,
    filters.source_of_receipt,
    filters.scheme_name,
    filters.vikas_khand_name,
    filters.vidhan_sabha_name,
    filters.unit,
  ]);

  // Update graph when main table data changes
  useEffect(() => {
    if (view === "main" && filteredTableData.length > 0) {
      setCurrentDisplayedTable({
        type: "main",
        data: filteredTableData,
        columns: tableColumnOrder.filter((col) => !columnDefs[col].hidden),
      });
      // Reset graph column to default if not in available columns
      if (graphColumn && !Object.keys(columnDefs).includes(graphColumn)) {
        setGraphColumn("center_name");
      }
    }
  }, [filteredTableData, view]);

  // Update graph when filterStack changes (detail view)
  useEffect(() => {
    if (view === "detail" && filterStack.length > 0) {
      // Use filteredTableData as base to respect top-level filters
      const baseData =
        filteredTableData && filteredTableData.length > 0
          ? filteredTableData
          : tableData;

      const filteredData = baseData.filter((item) => {
        for (let filter of filterStack) {
          if (!filter.checked[item[filter.column]]) return false;
        }
        return true;
      });
      
      if (filteredData.length > 0) {
        const currentFilter = filterStack[filterStack.length - 1];
        const availableColumns = Object.keys(columnDefs)
          .filter((col) => col !== currentFilter.column && !columnDefs[col].hidden);
        
        setCurrentDisplayedTable({
          type: "detail",
          data: filteredData,
          columns: availableColumns,
        });
        
        // Set graph column to first available column
        if (availableColumns.length > 0) {
          setGraphColumn(availableColumns[0]);
        }
      }
    }
  }, [filterStack, tableData, filteredTableData, view]);

  // Generate summary data for a given data and column
  const generateSummary = (data, column) => {
    const uniqueValues = [
      ...new Set(data.map((item) => item[column]).filter(Boolean)),
    ];
    const summaryData = uniqueValues.map((value) => {
      const dataForValue = data.filter((item) => item[column] === value);
      return {
        [columnDefs[column]?.label]: value,
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
                !columnDefs[col].hidden && // Exclude hidden columns
                col !== "source_of_receipt" // Exclude सप्लायर column
            )
            .map((col) => {
              // If summary is grouped by scheme, show investments list instead of count
              if (column === "scheme_name" && col === "investment_name") {
                const investments = [
                  ...new Set(
                    dataForValue
                      .map((item) => item[col])
                      .filter(Boolean)
                  ),
                ];
                return [columnDefs[col].label, investments.length > 0 ? investments.join("\n") : "—"];
              }

              return [columnDefs[col].label, new Set(dataForValue.map((item) => item[col])).size];
            })
        ),
        "आवंटित मात्रा": dataForValue
          .reduce(
            (sum, item) => sum + (parseFloat(item.allocated_quantity) || 0),
            0
          )
          .toFixed(2),
        "कृषक धनराशि": dataForValue
          .reduce(
            (sum, item) => sum + (parseFloat(item.amount_of_farmer_share) || 0),
            0
          )
          .toFixed(2),
        "सब्सिडी धनराशि": dataForValue
          .reduce(
            (sum, item) => sum + (parseFloat(item.amount_of_subsidy) || 0),
            0
          )
          .toFixed(2),
        "कुल राशि": dataForValue
          .reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0)
          .toFixed(2),
      };
    });

    // Add total row
    const totalRow = {
      [columnDefs[column]?.label]: "कुल",
    };

    // Add totals for monetary columns
    totalRow["आवंटित मात्रा"] = summaryData
      .reduce((sum, row) => sum + (parseFloat(row["आवंटित मात्रा"]) || 0), 0)
      .toFixed(2);
    totalRow["कृषक धनराशि"] = summaryData
      .reduce((sum, row) => sum + (parseFloat(row["कृषक धनराशि"]) || 0), 0)
      .toFixed(2);
    totalRow["सब्सिडी धनराशि"] = summaryData
      .reduce((sum, row) => sum + (parseFloat(row["सब्सिडी धनराशि"]) || 0), 0)
      .toFixed(2);
    totalRow["कुल राशि"] = summaryData
      .reduce((sum, row) => sum + (parseFloat(row["कुल राशि"]) || 0), 0)
      .toFixed(2);

    // Add counts for other columns
    Object.keys(columnDefs)
      .filter((col) => !columnDefs[col].hidden)
      .filter(
        (col) =>
          col !== column &&
          col !== "allocated_quantity" &&
          col !== "rate" &&
          col !== "amount_of_farmer_share" &&
          col !== "amount_of_subsidy" &&
          col !== "total_amount" &&
          col !== "source_of_receipt" // Exclude सप्लायर column
      )
      .forEach((col) => {
        const allValues = data.map((item) => item[col]).filter(Boolean);
        totalRow[columnDefs[col].label] = new Set(allValues).size;
      });

    summaryData.push(totalRow);

    // Create columns in the specified order - excluding individual monetary columns
    const visibleColumns = Object.keys(columnDefs)
      .filter((col) => !columnDefs[col].hidden)
      .filter(
        (col) =>
          col !== column &&
          col !== "allocated_quantity" &&
          col !== "rate" &&
          col !== "amount_of_farmer_share" &&
          col !== "amount_of_subsidy" &&
          col !== "total_amount"
      )
      .sort((a, b) => tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b))
      .map((key) => columnDefs[key].label);

    // Filter out सप्लायर (source_of_receipt) from visibleColumns
    const filteredVisibleColumns = visibleColumns.filter(col => col !== translations.sourceOfReceipt);

    const columns = [
      columnDefs[column]?.label,
      ...filteredVisibleColumns,
      "आवंटित मात्रा",
      "कृषक धनराशि",
      "सब्सिडी धनराशि",
      "कुल राशि",
    ];

    return { data: summaryData, columns, columnKey: column };
  };

  // Generate Vidhan Sabha Investment table
  const generateVidhanSabhaInvestmentTable = (data, grouping = 'vidhan_sabha_name', columnType = 'investment_name') => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    const groupLabel = grouping === 'center_name' ? 'केंद्र' : grouping === 'vidhan_sabha_name' ? 'विधानसभा' : 'विकास खंड';
    const groups = [...new Set(data.map(item => item[grouping]).filter(Boolean))].sort();

    const dynamicColumns = [...new Set(data.map(item => `${item.scheme_name} - ${item[columnType]}`).filter(Boolean))].sort();

    const rows = groups.map(group => {
      const row = { [groupLabel]: group };
      dynamicColumns.forEach(col => {
        const [scheme, val] = col.split(' - ');
        const sum = data
          .filter(item => item[grouping] === group && item.scheme_name === scheme && item[columnType] === val)
          .reduce((acc, item) => acc + (parseFloat(item.allocated_quantity) || 0), 0);
        row[col] = sum.toFixed(2);
      });
      // Add total columns
      const groupData = data.filter(item => item[grouping] === group);
      row['आवंटित मात्रा'] = groupData.reduce((acc, item) => acc + (parseFloat(item.allocated_quantity) || 0), 0).toFixed(2);
      row['कृषक धनराशि'] = groupData.reduce((acc, item) => acc + (parseFloat(item.amount_of_farmer_share) || 0), 0).toFixed(2);
      row['सब्सिडी धनराशि'] = groupData.reduce((acc, item) => acc + (parseFloat(item.amount_of_subsidy) || 0), 0).toFixed(2);
      row['कुल राशि'] = groupData.reduce((acc, item) => acc + (parseFloat(item.total_amount) || 0), 0).toFixed(2);
      return row;
    });

    // Add total row
    const totalRow = { [groupLabel]: 'कुल' };
    dynamicColumns.forEach(col => {
      totalRow[col] = rows.reduce((sum, row) => sum + (parseFloat(row[col]) || 0), 0).toFixed(2);
    });
    totalRow['आवंटित मात्रा'] = rows.reduce((sum, row) => sum + (parseFloat(row['आवंटित मात्रा']) || 0), 0).toFixed(2);
    totalRow['कृषक धनराशि'] = rows.reduce((sum, row) => sum + (parseFloat(row['कृषक धनराशि']) || 0), 0).toFixed(2);
    totalRow['सब्सिडी धनराशि'] = rows.reduce((sum, row) => sum + (parseFloat(row['सब्सिडी धनराशि']) || 0), 0).toFixed(2);
    totalRow['कुल राशि'] = rows.reduce((sum, row) => sum + (parseFloat(row['कुल राशि']) || 0), 0).toFixed(2);
    rows.push(totalRow);

    const columns = [groupLabel, ...dynamicColumns, 'आवंटित मात्रा', 'कृषक धनराशि', 'सब्सिडी धनराशि', 'कुल राशि'];

    return { columns, data: rows };
  };

  // Generate Vidhan Sabha Investment table when summary is shown
  useEffect(() => {
    if (isFilterApplied && filteredTableData && filteredTableData.length > 0) {
      const schemeFilteredData = vidhanSabhaSchemeFilter.length > 0 ? filteredTableData.filter(item => vidhanSabhaSchemeFilter.includes(item.scheme_name)) : filteredTableData;
      const table = generateVidhanSabhaInvestmentTable(schemeFilteredData, vidhanSabhaGrouping, vidhanSabhaColumnType);
      if (table) {
        const groupLabel = vidhanSabhaGrouping === 'center_name' ? 'केंद्र' : vidhanSabhaGrouping === 'vidhan_sabha_name' ? 'विधानसभा' : 'विकास खंड';
        const columnLabel = vidhanSabhaColumnType === 'investment_name' ? 'निवेश' : 'उप-निवेश';
        const heading = `${groupLabel} ${columnLabel} तालिका`;
        setAdditionalTables(prev => {
          const existingIndex = prev.findIndex(t => t.type === 'vidhanSabhaInvestment');
          const tableIndex = existingIndex !== -1 ? existingIndex : prev.length;
          if (existingIndex !== -1) {
            // Update existing
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], heading, columns: table.columns, data: table.data, isRotated: isRotated[tableIndex] || false };
            return updated;
          } else {
            // Add new
            return [...prev, {
              type: 'vidhanSabhaInvestment',
              heading,
              columns: table.columns,
              data: table.data,
              isAllocationTable: false,
              isRotated: isRotated[tableIndex] || false
            }];
          }
        });
      }
    } else {
      // Remove if no filters
      setAdditionalTables(prev => prev.filter(t => t.type !== 'vidhanSabhaInvestment'));
    }
  }, [isFilterApplied, filteredTableData, vidhanSabhaGrouping, vidhanSabhaColumnType, vidhanSabhaSchemeFilter]);

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

  // Go back one step in filter stack or navigation history
  const goBack = () => {
    // If we have additional tables, remove the last one
    if (additionalTables.length > 0) {
      setAdditionalTables((prev) => prev.slice(0, -1));
      return;
    }

    // If we're in detailed view, go back to summary view
    if (showDetailed) {
      setShowDetailed(false);
      return;
    }

    // If we have navigation history, go back to the previous state
    if (navigationHistory.length > 0) {
      const previousState = navigationHistory[navigationHistory.length - 1];
      setView(previousState.view);
      setFilterStack(previousState.filterStack);
      setAdditionalTables(previousState.additionalTables);
      setNavigationHistory((prev) => prev.slice(0, -1));
      // If returning to main view, reset date filters
      if (previousState.view === "main") {
        setDateFilter({ start: '', end: '' });
        setIsDateFilterApplied(false);
        // Reset report generation states
        setReportDateStart('');
        setReportDateEnd('');
        setReportType('');
        setSelectedReportValues([]);
        setShowReportModal(false);
      }
      return;
    }

    // If we have filters in the stack, remove the last one
    if (filterStack.length > 1) {
      setFilterStack((prev) => prev.slice(0, -1));
    } else {
      // Otherwise, go back to main view
      setView("main");
      setFilterStack([]);
      setSelectedItem(null);
      // Reset date filters
      setDateFilter({ start: '', end: '' });
      setIsDateFilterApplied(false);
      // Reset report generation states
      setReportDateStart('');
      setReportDateEnd('');
      setReportType('');
      setSelectedReportValues([]);
      setShowReportModal(false);
    }
    setShowDetailed(false);
  };

  // Generate chart data based on selected column and type
  const generateChartData = () => {
    // Use current displayed table data
    let dataToVisualize = currentDisplayedTable.data && currentDisplayedTable.data.length > 0 
      ? currentDisplayedTable.data 
      : (view === "main" ? filteredTableData : tableData);
    
    if (dataToVisualize.length === 0) {
      return null;
    }

    // Try to find the column key - first check if graphColumn is a key, then check labels
    let columnKey = graphColumn;
    if (!Object.keys(columnDefs).includes(graphColumn)) {
      // graphColumn might be a label, try to find its key
      columnKey = Object.keys(columnDefs).find(
        (key) => columnDefs[key].label === graphColumn
      ) || graphColumn;
    }

    const dataMap = {};
    const detailsMap = {}; // Store comprehensive details for tooltip
    
    dataToVisualize.forEach((item) => {
      // For summary/detail tables, the column might be the label directly
      let value = item[columnKey];
      
      if (value === undefined && currentDisplayedTable.type !== "main") {
        // Try to find the value using the label as key for summary tables
        value = item[graphColumn];
      }
      
      if (value !== undefined && value !== null && value !== "") {
        dataMap[value] = (dataMap[value] || 0) + 1;
        
        // Collect comprehensive details for tooltip
        if (!detailsMap[value]) {
          detailsMap[value] = {
            totalMatra: 0,
            totalDar: 0,
            totalFarmerShare: 0,
            totalSubsidy: 0,
            totalAmount: 0,
            count: 0,
            items: [],
            maxMatra: 0,
            minMatra: Infinity,
            maxDar: 0,
            minDar: Infinity
          };
        }
        
        const matra = item.allocated_quantity ? parseFloat(item.allocated_quantity) : 0;
        const dar = item.rate ? parseFloat(item.rate) : 0;
        const farmerShare = item.amount_of_farmer_share ? parseFloat(item.amount_of_farmer_share) : 0;
        const subsidy = item.amount_of_subsidy ? parseFloat(item.amount_of_subsidy) : 0;
        const totalAmount = item.total_amount ? parseFloat(item.total_amount) : 0;
        
        detailsMap[value].totalMatra += matra;
        detailsMap[value].totalDar += dar;
        detailsMap[value].totalFarmerShare += farmerShare;
        detailsMap[value].totalSubsidy += subsidy;
        detailsMap[value].totalAmount += totalAmount;
        detailsMap[value].count += 1;
        
        // Track min/max values
        detailsMap[value].maxMatra = Math.max(detailsMap[value].maxMatra, matra);
        detailsMap[value].minMatra = Math.min(detailsMap[value].minMatra, matra);
        detailsMap[value].maxDar = Math.max(detailsMap[value].maxDar, dar);
        detailsMap[value].minDar = Math.min(detailsMap[value].minDar, dar);
        
        detailsMap[value].items.push({
          matra: matra,
          dar: dar,
          farmerShare: farmerShare,
          subsidy: subsidy,
          amount: totalAmount
        });
      }
    });

    const labels = Object.keys(dataMap);
    const counts = Object.values(dataMap);
    const totalRecords = counts.reduce((sum, count) => sum + count, 0);

    if (labels.length === 0) {
      return null;
    }

    // Generate colors with gradient
    const colors = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#FF6384",
      "#C9CBCF",
      "#4BC0C0",
      "#FF6384",
    ];
    const backgroundColors = labels.map((_, i) => colors[i % colors.length]);

    // Store metadata for tooltip usage
    const chartDataWithMetadata = {
      labels: labels,
      counts: counts,
      totalRecords: totalRecords,
      columnLabel: columnDefs[columnKey]?.label || graphColumn,
      columnKey: columnKey,
      detailsMap: detailsMap,
    };

    if (graphType === "bar") {
      return {
        labels: labels,
        datasets: [
          {
            label: `${columnDefs[columnKey]?.label || graphColumn} - रिकॉर्ड की संख्या`,
            data: counts,
            backgroundColor: backgroundColors,
            borderColor: backgroundColors.map((color) => color.replace("0.6", "1")),
            borderWidth: 1,
            borderRadius: 4,
            metadata: chartDataWithMetadata,
          },
        ],
      };
    } else if (graphType === "pie") {
      return {
        labels: labels,
        datasets: [
          {
            data: counts,
            backgroundColor: backgroundColors,
            borderColor: "#fff",
            borderWidth: 2,
            metadata: chartDataWithMetadata,
          },
        ],
      };
    } else if (graphType === "doughnut") {
      return {
        labels: labels,
        datasets: [
          {
            data: counts,
            backgroundColor: backgroundColors,
            borderColor: "#fff",
            borderWidth: 2,
            metadata: chartDataWithMetadata,
          },
        ],
      };
    }

    return null;
  };

  // Custom external tooltip for better scrolling and visibility
  const [tooltipState, setTooltipState] = useState({ visible: false, content: [], position: { x: 0, y: 0 } });

  // Chart options configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: graphType === "bar" ? "bottom" : "right",
        labels: {
          boxWidth: 12,
          font: { size: 10 },
          maxWidth: 200,
          padding: 10,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        padding: 14,
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 10 },
        bodySpacing: 6,
        borderColor: "#fff",
        borderWidth: 2,
        cornerRadius: 6,
        displayColors: false,
        maxWidth: 500,
        callbacks: {
          title: function (context) {
            if (context.length > 0) {
              const label = context[0].label || "डेटा";
              return `📊 ${label}`;
            }
            return "";
          },
          label: function (context) {
            const count = context.parsed.y || context.parsed;
            const metadata = context.dataset.metadata;
            const label = context.label;
            
            if (metadata && metadata.detailsMap && metadata.detailsMap[label]) {
              const details = metadata.detailsMap[label];
              const percentage = ((count / metadata.totalRecords) * 100).toFixed(1);
              const avgMatra = (details.totalMatra / details.count).toFixed(2);
              const avgDar = (details.totalDar / details.count).toFixed(2);
              const avgFarmerShare = (details.totalFarmerShare / details.count).toFixed(2);
              const avgSubsidy = (details.totalSubsidy / details.count).toFixed(2);
              const avgTotalAmount = (details.totalAmount / details.count).toFixed(2);
              
              return [
                "📋 रिकॉर्ड जानकारी (Record Info)",
                `🔢 कुल रिकॉर्ड: ${count}`,
                `📈 प्रतिशत: ${percentage}%`,
                `📌 कुल डेटा: ${metadata.totalRecords}`,
                "📦 मात्रा (दर) विवरण (Quantity)",
                `📏 कुल मात्रा: ${details.totalMatra.toFixed(2)}`,
                `📏 औसत मात्रा: ${avgMatra}`,
                // `📏 अधिकतम मात्रा: ${details.maxMatra.toFixed(2)}`,
                // `📏 न्यूनतम मात्रा: ${details.minMatra === Infinity ? '0.00' : details.minMatra.toFixed(2)}`,
                "💰 दर विवरण (Rate Details)",
                `💵 कुल दर: ${details.totalDar.toFixed(2)}`,
                `💵 औसत दर: ${avgDar}`,
                // `💵 अधिकतम दर: ${details.maxDar.toFixed(2)}`,
                // `💵 न्यूनतम दर: ${details.minDar === Infinity ? '0.00' : details.minDar.toFixed(2)}`,
                "💳 राशि विवरण (Amount Details)",
                `👨‍🌾 किसान हिस्सेदारी: ${details.totalFarmerShare.toFixed(2)}`,
                // `👨‍🌾 औसत किसान हिस्सेदारी: ${avgFarmerShare}`,
                `🏦 कुल सब्सिडी: ${details.totalSubsidy.toFixed(2)}`,
                // `🏦 औसत सब्सिडी: ${avgSubsidy}`,
                `💰 कुल राशि: ${details.totalAmount.toFixed(2)}`,
                // `💰 औसत राशि: ${avgTotalAmount}`,
              ];
            }
            return `🔢 रिकॉर्ड: ${count}`;
          },
        },
      },
      filler: {
        propagate: true,
      },
    },
    indexAxis: graphType === "bar" ? "x" : undefined,
    scales: graphType === "bar" ? {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "रिकॉर्ड की संख्या",
          font: { size: 12, weight: "bold" },
        },
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        title: {
          display: true,
          text: columnDefs[graphColumn]?.label || graphColumn,
          font: { size: 12, weight: "bold" },
        },
        ticks: {
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 0,
        },
      },
    } : undefined,
    layout: {
      padding: {
        right: graphType === "bar" ? 20 : 0,
        bottom: graphType === "bar" ? 40 : 0,
      },
    },
  };

  // Get current table data with totals for export
  const getCurrentTableData = () => {
    if (view === "main") {
      // Calculate totals for the main table
      const totals = {
        "केंद्र का नाम": new Set(
          filteredTableData.map((item) => item.center_name)
        ).size,
        विधानसभा: new Set(
          filteredTableData.map((item) => item.vidhan_sabha_name)
        ).size,
        "विकास खंड": new Set(
          filteredTableData.map((item) => item.vikas_khand_name)
        ).size,
        योजना: new Set(filteredTableData.map((item) => item.scheme_name)).size,
        सप्लायर: new Set(
          filteredTableData.map((item) => item.source_of_receipt)
        ).size,
        निवेश: new Set(filteredTableData.map((item) => item.investment_name))
          .size,
        "उप-निवेश": new Set(
          filteredTableData.map((item) => item.sub_investment_name)
        ).size,
        "आवंटित मात्रा": filteredTableData
          .reduce(
            (sum, item) => sum + (parseFloat(item.allocated_quantity) || 0),
            0
          )
          .toFixed(2),
        "किसान की हिस्सेदारी की राशि": filteredTableData
          .reduce(
            (sum, item) => sum + (parseFloat(item.amount_of_farmer_share) || 0),
            0
          )
          .toFixed(2),
        "सब्सिडी की राशि": filteredTableData
          .reduce(
            (sum, item) => sum + (parseFloat(item.amount_of_subsidy) || 0),
            0
          )
          .toFixed(2),
        "कुल राशि": filteredTableData
          .reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0)
          .toFixed(2),
      };

      // Also include totals for all column labels to ensure consistency
      Object.keys(columnDefs).forEach((col) => {
        const label = columnDefs[col].label;
        if (!totals[label] && !columnDefs[col].hidden) {
          if (
            col === "allocated_quantity" ||
            col === "rate" ||
            col === "amount_of_farmer_share" ||
            col === "amount_of_subsidy" ||
            col === "total_amount"
          ) {
            totals[label] = filteredTableData
              .reduce((sum, item) => sum + (parseFloat(item[col]) || 0), 0)
              .toFixed(2);
          } else {
            totals[label] = new Set(
              filteredTableData.map((item) => item[col])
            ).size;
          }
        }
      });

      // Use the selected columns from the column filter
      const visibleColumns = tableColumnFilters.main;

      return {
        heading: getSummaryHeading(),
        data: filteredTableData,
        columns: visibleColumns,
        totals: totals,
      };
    } else if (view === "detail" && !showDetailed) {
      // Summary table view - Export with breakdown format matching the table display
      const baseData =
        filteredTableData && filteredTableData.length > 0
          ? filteredTableData
          : tableData;

      const filteredData = baseData.filter((item) => {
        for (let filter of filterStack) {
          if (!filter.checked[item[filter.column]]) return false;
        }
        return true;
      });
      const currentFilter = filterStack[filterStack.length - 1];
      const checkedValues = Object.keys(currentFilter.checked).filter(
        (val) => currentFilter.checked[val]
      );

      // Helper function to format breakdown for export (hierarchical format)
      const formatBreakdownForExport = (breakdown, valueField) => {
        const lines = [];
        breakdown.forEach((group) => {
          // Group level
          const groupValue = valueField === "name" ? group.groupName : ((group.totals[valueField] || 0).toFixed(2));
          lines.push(groupValue);
          // Investment level
          group.investments.forEach((inv) => {
            const invValue = valueField === "name" 
              ? `  ├─ ${inv.name}`
              : `  ├─ ${(inv.totals[valueField] || 0).toFixed(2)}${inv.unit ? ` (${inv.unit})` : ""}`;
            lines.push(invValue);
            // Sub-investment level
            inv.subInvestments.forEach((sub, idx) => {
              const isLast = idx === inv.subInvestments.length - 1;
              const prefix = isLast ? "  │  └─ " : "  │  ├─ ";
              const subValue = valueField === "name"
                ? `${prefix}${sub.name}`
                : `${prefix}${(sub.totals[valueField] || 0).toFixed(2)}${sub.unit ? ` (${sub.unit})` : ""}`;
              lines.push(subValue);
            });
          });
        });
        return lines.join("\n");
      };

      // Modified to include expanded values with breakdown format
      const summaryData = [];

      // For each checked value, create a row
      checkedValues.forEach((checkedValue) => {
        const tableDataForValue = filteredData.filter(
          (item) => item[currentFilter.column] === checkedValue
        );
        // Apply summary header filters to this row's data
        const filteredRowData = applySummaryHeaderFilters(tableDataForValue);

        // Generate breakdown for this row
        const breakdown = generateTotalBreakdown(filteredRowData, summaryTotalBreakdownColumn);

        // Create a row with columns in the specified order
        const row = {
          [columnDefs[currentFilter.column]?.label]: checkedValue,
          "कुल रिकॉर्ड": filteredRowData.length,
        };

        // Add other columns in the specified order
        tableColumnOrder.forEach((col) => {
          if (
            col !== currentFilter.column &&
            col !== "allocated_quantity" &&
            col !== "rate" &&
            col !== "amount_of_farmer_share" &&
            col !== "amount_of_subsidy" &&
            col !== "total_amount" &&
            !columnDefs[col].hidden
          ) {
            // If this is the selected breakdown column, use breakdown format
            if (col === summaryTotalBreakdownColumn) {
              row[columnDefs[col].label] = formatBreakdownForExport(breakdown, "name");
            } else if (mainSummaryExpandedColumns[col]) {
              // For other expanded columns, show unique values
              const uniqueValues = [...new Set(filteredRowData.map((item) => item[col]).filter(Boolean))];
              row[columnDefs[col].label] = uniqueValues.join("\n");
            } else {
              // Show the filtered values as a list
              const uniqueValues = [...new Set(filteredRowData.map((item) => item[col]).filter(Boolean))];
              row[columnDefs[col].label] = uniqueValues.join("\n");
            }
          }
        });

        // Add monetary columns with breakdown format
        row["आवंटित मात्रा"] = formatBreakdownForExport(breakdown, "allocated_quantity");
        row["कृषक धनराशि"] = formatBreakdownForExport(breakdown, "amount_of_farmer_share");
        row["सब्सिडी धनराशि"] = formatBreakdownForExport(breakdown, "amount_of_subsidy");
        row["कुल राशि"] = formatBreakdownForExport(breakdown, "total_amount");

        summaryData.push(row);
      });

      // Create a total row with breakdown format
      const totalRowData = applySummaryHeaderFilters(
        checkedValues.flatMap((checkedValue) =>
          filteredData.filter((item) => item[currentFilter.column] === checkedValue)
        )
      );

      // Generate breakdown for totals
      const totalBreakdown = generateTotalBreakdown(totalRowData, summaryTotalBreakdownColumn);

      // Calculate grand totals
      const grandTotals = {
        allocated_quantity: totalRowData.reduce((sum, item) => {
          const qtyVal = typeof item.allocated_quantity === "string" && item.allocated_quantity.includes(" / ")
            ? parseFloat(item.allocated_quantity.split(" / ")[0]) || 0
            : parseFloat(item.allocated_quantity) || 0;
          return sum + qtyVal;
        }, 0),
        amount_of_farmer_share: totalRowData.reduce((sum, item) => sum + (parseFloat(item.amount_of_farmer_share) || 0), 0),
        amount_of_subsidy: totalRowData.reduce((sum, item) => sum + (parseFloat(item.amount_of_subsidy) || 0), 0),
        total_amount: totalRowData.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0),
      };

      const totalRow = {};
      totalRow[columnDefs[currentFilter.column]?.label] = "कुल";
      totalRow["कुल रिकॉर्ड"] = totalRowData.length;

      // Add other columns with breakdown format for selected column
      tableColumnOrder.forEach((col) => {
        if (
          col !== currentFilter.column &&
          col !== "allocated_quantity" &&
          col !== "rate" &&
          col !== "amount_of_farmer_share" &&
          col !== "amount_of_subsidy" &&
          col !== "total_amount" &&
          !columnDefs[col].hidden
        ) {
          if (col === summaryTotalBreakdownColumn) {
            // Add "कुल: X [column name]" header and breakdown
            const headerLine = `कुल: ${totalBreakdown.length} ${columnDefs[col]?.label || col}`;
            totalRow[columnDefs[col].label] = headerLine + "\n" + formatBreakdownForExport(totalBreakdown, "name");
          } else if (mainSummaryExpandedColumns[col]) {
            const uniqueValues = [...new Set(totalRowData.map((item) => item[col]).filter(Boolean))];
            totalRow[columnDefs[col].label] = uniqueValues.join("\n");
          } else {
            totalRow[columnDefs[col].label] = new Set(totalRowData.map((item) => item[col])).size;
          }
        }
      });

      // Add monetary columns with breakdown format for totals
      totalRow["आवंटित मात्रा"] = `कुल: ${grandTotals.allocated_quantity.toFixed(2)}\n` + formatBreakdownForExport(totalBreakdown, "allocated_quantity");
      totalRow["कृषक धनराशि"] = `कुल: ${grandTotals.amount_of_farmer_share.toFixed(2)}\n` + formatBreakdownForExport(totalBreakdown, "amount_of_farmer_share");
      totalRow["सब्सिडी धनराशि"] = `कुल: ${grandTotals.amount_of_subsidy.toFixed(2)}\n` + formatBreakdownForExport(totalBreakdown, "amount_of_subsidy");
      totalRow["कुल राशि"] = `कुल: ${grandTotals.total_amount.toFixed(2)}\n` + formatBreakdownForExport(totalBreakdown, "total_amount");

      // Add total row to summary data
      summaryData.push(totalRow);

      // Use the selected columns from the column filter
      const visibleColumns =
        tableColumnFilters.summary.length > 0
          ? tableColumnFilters.summary
          : [
              columnDefs[currentFilter.column]?.label,
              "कुल रिकॉर्ड",
              ...tableColumnOrder
                .filter(
                  (col) =>
                    col !== currentFilter.column &&
                    col !== "allocated_quantity" &&
                    col !== "rate" &&
                    col !== "amount_of_farmer_share" &&
                    col !== "amount_of_subsidy" &&
                    col !== "total_amount" &&
                    !columnDefs[col].hidden
                )
                .map((key) => columnDefs[key].label),
              "आवंटित मात्रा",
              "कृषक धनराशि",
              "सब्सिडी धनराशि",
              "कुल राशि",
            ];

      return {
        heading: `${columnDefs[currentFilter.column]?.label || "Summary"} (${
          checkedValues.length
        } items)`,
        data: summaryData,
        columns: visibleColumns,
        totals: {}, // We're including totals in the data itself
      };
    } else {
      // Detailed view
      const baseData =
        filteredTableData && filteredTableData.length > 0
          ? filteredTableData
          : tableData;

      const filteredData = baseData.filter((item) => {
        for (let filter of filterStack) {
          if (!filter.checked[item[filter.column]]) return false;
        }
        return true;
      });
      const currentFilter = filterStack[filterStack.length - 1];
      const checkedValues = Object.keys(currentFilter.checked).filter(
        (val) => currentFilter.checked[val]
      );

      // Calculate totals for detailed view
      const totals = {};
      Object.keys(columnDefs).forEach((col) => {
        if (col !== currentFilter.column && !columnDefs[col].hidden) {
          if (
            col === "allocated_quantity" ||
            col === "rate" ||
            col === "amount_of_farmer_share" ||
            col === "amount_of_subsidy" ||
            col === "total_amount"
          ) {
            totals[columnDefs[col].label] = filteredData
              .reduce((sum, item) => sum + (parseFloat(item[col]) || 0), 0)
              .toFixed(2);
          } else {
            totals[columnDefs[col].label] = new Set(
              filteredData.map((item) => item[col])
            ).size;
          }
        }
      });

      // Use the selected columns from the column filter
      const visibleColumns =
        tableColumnFilters.detail.length > 0
          ? tableColumnFilters.detail
          : Object.keys(columnDefs)
              .filter(
                (col) => col !== currentFilter.column && !columnDefs[col].hidden
              )
              .filter(
                (col) =>
                  col !== "allocated_quantity" &&
                  col !== "rate" &&
                  col !== "amount_of_farmer_share" &&
                  col !== "amount_of_subsidy" &&
                  col !== "total_amount"
              )
              .sort(
                (a, b) =>
                  tableColumnOrder.indexOf(a) - tableColumnOrder.indexOf(b)
              )
              .map((key) => columnDefs[key].label);

      return {
        heading: selectedItem?.value || "Detail View",
        data: filteredData,
        columns: visibleColumns,
        totals: totals,
      };
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
    const visibleColumns =
      tableColumnFilters.additional[index] || table.columns;

    // Get the current toggle state for this table
    const showDar = table.isAllocationTable && allocationTableToggles[index]?.dar;
    const showMatra = table.isAllocationTable && allocationTableToggles[index]?.matra;
    const showIkai = table.isAllocationTable && allocationTableToggles[index]?.ikai;

    // Create a modified data array with expanded values if needed
    const modifiedData = table.data.map((row) => {
  const newRow = { ...row };

  // Check if any columns are expanded and replace counts with values
  if (!table.isAllocationTable) {
    visibleColumns.forEach((col) => {
      const isExpanded = expandedColumns[`${index}_${col}`];
      const columnKey = Object.keys(columnDefs).find(
        (k) => columnDefs[k].label === col
      );

      if (isExpanded && columnKey) {
        // Get the current filtered data for this row
        const currentFilteredData = tableData.filter((item) => {
          for (let filter of filterStack) {
            if (!filter.checked[item[filter.column]]) return false;
          }
          return item[table.columnKey] === row[table.columns[0]];
        });

        // Special handling for sub_investment_name - group by investment_name
        if (columnKey === "sub_investment_name") {
          const groupedData = {};
          currentFilteredData.forEach((item) => {
            const investmentName = item.investment_name;
            const subInvestmentName = item.sub_investment_name;
            
            if (investmentName && subInvestmentName) {
              if (!groupedData[investmentName]) {
                groupedData[investmentName] = {};
              }
              if (!groupedData[investmentName][subInvestmentName]) {
                groupedData[investmentName][subInvestmentName] = 0;
              }
              let qty = item.allocated_quantity;
              if (typeof qty === "string" && qty.includes(" / ")) {
                qty = parseFloat(qty.split(" / ")[0]) || 0;
              } else {
                qty = parseFloat(qty) || 0;
              }
              groupedData[investmentName][subInvestmentName] += qty;
            }
          });

          // Format as hierarchical text with **bold** markers
          const formattedLines = [];
          Object.entries(groupedData).forEach(([investmentName, subInvestments]) => {
            formattedLines.push(`**${investmentName}**`);
            Object.entries(subInvestments).forEach(([name, matra]) => {
              formattedLines.push(`  • ${name} (${matra.toFixed(2)})`);
            });
          });
          newRow[col] = formattedLines.join("\n");
        } else if (columnKey === "investment_name") {
          // Special handling for investment_name - show with unit and matra
          const groupedInvestments = {};
          currentFilteredData.forEach((item) => {
            const investmentName = item.investment_name;
            if (investmentName) {
              if (!groupedInvestments[investmentName]) {
                groupedInvestments[investmentName] = { matra: 0, unit: "" };
              }
              let qty = item.allocated_quantity;
              if (typeof qty === "string" && qty.includes(" / ")) {
                qty = parseFloat(qty.split(" / ")[0]) || 0;
              } else {
                qty = parseFloat(qty) || 0;
              }
              groupedInvestments[investmentName].matra += qty;
              if (!groupedInvestments[investmentName].unit) {
                const u = getUnitFromItem(item);
                if (u) groupedInvestments[investmentName].unit = u;
              }
            }
          });
          newRow[col] = Object.entries(groupedInvestments)
            .map(([name, info]) => {
              const display = info.unit 
                ? `**${name} (${info.unit})**`
                : `**${name}**`;
              return info.matra ? `${display} (${info.matra.toFixed(2)})` : display;
            })
            .join("\n");
        } else {
          // Get unique values for this column
          const uniqueValues = getUniqueValuesForColumn(
            currentFilteredData,
            columnKey
          );

          // Replace the count with the joined values (one per line)
          newRow[col] = uniqueValues.join("\n");
        }
      }
    });
  } else {
    // For allocation tables, apply the dar/matra toggle
    visibleColumns.forEach((col) => {
      // If this is the first column (row label), keep as-is
      if (col === table.columns[0]) return;

      // Handle columns that are aggregate totals (start with 'कुल' or new names) separately
      if (col.startsWith("कुल") || col === "आवंटित मात्रा" || col === "कृषक धनराशि" || col === "सब्सिडी धनराशि") {
        // Use the explicit total keys placed on the rows: "आवंटित मात्रा", "कृषक धनराशि", "सब्सिडी धनराशि", "कुल राशि"
        const matraVal = parseFloat(row["आवंटित मात्रा"] || 0).toFixed(2);
        const darVal = parseFloat(row["कुल राशि"] || 0).toFixed(2);
        if (showMatra && showDar) newRow[col] = `${matraVal} / ${darVal}`;
        else if (showDar) newRow[col] = darVal;
        else newRow[col] = matraVal;
        return;
      }

      // Dynamic columns (the clicked values) have matra, ikai and _dar variants
      let matraVal = row[col];
      let darVal = row[`${col}_dar`];
      let ikaiVal = row[`${col}_ikai`] || row[`${col}_unit`] || "";

      // If matraVal already contains "/" it's been formatted, extract the first number
      if (matraVal !== undefined && String(matraVal).includes(" / ")) {
        const parts = String(matraVal).split(" / ");
        matraVal = parts[0];
        if (darVal === undefined) darVal = parts[1] || parts[0];
        if (!ikaiVal && parts.length === 3) ikaiVal = parts[1];
      } else {
        matraVal = matraVal !== undefined ? String(matraVal) : "0";
      }

      if (darVal === undefined) {
        darVal = matraVal;
      } else if (String(darVal).includes(" / ")) {
        darVal = String(darVal).split(" / ")[1] || String(darVal).split(" / ")[0];
      } else {
        darVal = String(darVal);
      }

      ikaiVal = ikaiVal !== undefined && ikaiVal !== null ? String(ikaiVal) : "";

      // If ikai/unit is missing on the row, try to derive it from underlying items
      if ((!ikaiVal || ikaiVal === "") && table && table.isAllocationTable) {
        const derivedUnit = findUnitForRowCol(row, col, table);
        if (derivedUnit) {
          ikaiVal = String(derivedUnit);
          // Persist it on the newRow so totals/exports can pick it up
          newRow[`${col}_ikai`] = ikaiVal;
        }
      }

      newRow[col] = formatAllocationValue(matraVal, ikaiVal, darVal, showMatra, showIkai, showDar);
    });
  }

  return newRow;
});

    // Calculate totals for additional table
    const filteredTableData = modifiedData.filter((row) => {
      const rowValue = row[table.columns[0]];
      // Apply filters if they exist
      return true; // Assuming additional tables are already filtered
    });

    const totals = {};
    // Determine visible dynamic columns (clicked values) for allocation tables
    const visibleDynamicColsExport = visibleColumns.filter((c) => c !== table.columns[0] && !c.startsWith("कुल") && c !== "आवंटित मात्रा" && c !== "कृषक धनराशि" && c !== "सब्सिडी धनराशि");

    visibleColumns.forEach((col) => {
      if (col === table.columns[0]) {
        totals[col] = filteredTableData.length;
      } else if (col === "कुल रिकॉर्ड") {
        totals[col] = filteredTableData.reduce(
          (sum, row) => sum + row["कुल रिकॉर्ड"],
          0
        );
      } else if (col === "आवंटित मात्रा") {
        if (table.isAllocationTable) {
          const matraTotal = filteredTableData
            .reduce(
              (sum, row) =>
                sum +
                visibleDynamicColsExport.reduce((s, c) => s + parseFloat(row[c] || 0), 0),
              0
            )
            .toFixed(2);
          const darTotal = filteredTableData
            .reduce(
              (sum, row) =>
                sum +
                visibleDynamicColsExport.reduce((s, c) => s + parseFloat(row[`${c}_dar`] || 0), 0),
              0
            )
            .toFixed(2);
          const ikaiTotal = filteredTableData
            .reduce(
              (sum, row) =>
                sum +
                visibleDynamicColsExport.reduce((s, c) => s + parseFloat(row[`${c}_ikai`] || row[`${c}_unit`] || 0), 0),
              0
            )
            .toFixed(2);
          const showDarFlag = allocationTableToggles[index]?.dar ?? table.showDar ?? false;
          const showMatraFlag = allocationTableToggles[index]?.matra ?? table.showMatra ?? false;
          const showIkaiFlag = allocationTableToggles[index]?.ikai ?? table.showIkai ?? false;
          totals[col] = formatAllocationValue(matraTotal, ikaiTotal, darTotal, showMatraFlag, showIkaiFlag, showDarFlag);
        } else {
          totals[col] = filteredTableData
            .reduce(
              (sum, row) => sum + parseFloat(row["आवंटित मात्रा"] || 0),
              0
            )
            .toFixed(2);
        }
      } else if (col === "कृषक धनराशि") {
        if (table.isAllocationTable) {
          totals[col] = filteredTableData
            .reduce(
              (sum, row) => sum + visibleDynamicColsExport.reduce((s, c) => s + parseFloat(row[`${c}_farmer`] || 0), 0),
              0
            )
            .toFixed(2);
        } else {
          totals[col] = filteredTableData
            .reduce(
              (sum, row) => sum + parseFloat(row["कृषक धनराशि"] || 0),
              0
            )
            .toFixed(2);
        }
      } else if (col === "सब्सिडी धनराशि") {
        if (table.isAllocationTable) {
          totals[col] = filteredTableData
            .reduce(
              (sum, row) => sum + visibleDynamicColsExport.reduce((s, c) => s + parseFloat(row[`${c}_subsidy`] || 0), 0),
              0
            )
            .toFixed(2);
        } else {
          totals[col] = filteredTableData
            .reduce((sum, row) => sum + parseFloat(row["सब्सिडी धनराशि"] || 0), 0)
            .toFixed(2);
        }
      } else if (col === "कुल राशि") {
        if (table.isAllocationTable) {
          totals[col] = filteredTableData
            .reduce(
              (sum, row) => sum + visibleDynamicColsExport.reduce((s, c) => s + parseFloat(row[`${c}_dar`] || 0), 0),
              0
            )
            .toFixed(2);
        } else {
          totals[col] = filteredTableData
            .reduce((sum, row) => sum + parseFloat(row["कुल राशि"] || 0), 0)
            .toFixed(2);
        }
     } else {
        // Dynamic columns
        const isExpanded = expandedColumns[`${index}_${col}`];
        const columnKey = Object.keys(columnDefs).find(
          (k) => columnDefs[k].label === col
        );

        if (isExpanded && columnKey) {
          // Get all unique values for this column from the entire filtered data
          const currentFilteredData = tableData.filter((item) => {
            for (let filter of filterStack) {
              if (!filter.checked[item[filter.column]]) return false;
            }
            return true;
          });

          // Special handling for sub_investment_name - group by investment_name
          if (columnKey === "sub_investment_name") {
            const groupedData = {};
            currentFilteredData.forEach((item) => {
              const investmentName = item.investment_name;
              const subInvestmentName = item.sub_investment_name;
              
              if (investmentName && subInvestmentName) {
                if (!groupedData[investmentName]) {
                  groupedData[investmentName] = {};
                }
                if (!groupedData[investmentName][subInvestmentName]) {
                  groupedData[investmentName][subInvestmentName] = 0;
                }
                let qty = item.allocated_quantity;
                if (typeof qty === "string" && qty.includes(" / ")) {
                  qty = parseFloat(qty.split(" / ")[0]) || 0;
                } else {
                  qty = parseFloat(qty) || 0;
                }
                groupedData[investmentName][subInvestmentName] += qty;
              }
            });

            // Format as hierarchical text with **bold** markers
            const formattedLines = [];
            Object.entries(groupedData).forEach(([investmentName, subInvestments]) => {
              formattedLines.push(`**${investmentName}**`);
              Object.entries(subInvestments).forEach(([name, matra]) => {
                formattedLines.push(`  • ${name} (${matra.toFixed(2)})`);
              });
            });
            totals[col] = formattedLines.join("\n");
          } else if (columnKey === "investment_name") {
            // Special handling for investment_name - show with unit and matra
            const groupedInvestments = {};
            currentFilteredData.forEach((item) => {
              const investmentName = item.investment_name;
              if (investmentName) {
                if (!groupedInvestments[investmentName]) {
                  groupedInvestments[investmentName] = { matra: 0, unit: "" };
                }
                let qty = item.allocated_quantity;
                if (typeof qty === "string" && qty.includes(" / ")) {
                  qty = parseFloat(qty.split(" / ")[0]) || 0;
                } else {
                  qty = parseFloat(qty) || 0;
                }
                groupedInvestments[investmentName].matra += qty;
                if (!groupedInvestments[investmentName].unit) {
                  const u = getUnitFromItem(item);
                  if (u) groupedInvestments[investmentName].unit = u;
                }
              }
            });
            totals[col] = Object.entries(groupedInvestments)
              .map(([name, info]) => {
                const display = info.unit 
                  ? `**${name} (${info.unit})**`
                  : `**${name}**`;
                return info.matra ? `${display} (${info.matra.toFixed(2)})` : display;
              })
              .join("\n");
          } else {
            // Get unique values for this column
            const uniqueValues = getUniqueValuesForColumn(
              currentFilteredData,
              columnKey
            );

            // Use the joined values for the total (one per line)
            totals[col] = uniqueValues.join("\n");
          }
        } else {
          // Otherwise, count unique values
          totals[col] = new Set(
            filteredTableData.flatMap((row) =>
              tableData
                .filter(
                  (item) => item[table.columnKey] === row[table.columns[0]]
                )
                .map(
                  (item) =>
                    item[
                      Object.keys(columnDefs).find(
                        (k) => columnDefs[k].label === col
                      )
                    ]
                )
            )
          ).size;
        }
      }
    });

    const defaultName = `Table ${tablesForExport[type].length + 1}`;
    setTableName(defaultName);
    setExportType(type);
    
    // When rotated, include summary columns (आवंटित मात्रा, etc.) in visibleClickedCols for export
    const summaryColsForExport = visibleColumns.filter((c) => (c.startsWith("कुल") || c === "आवंटित मात्रा" || c === "कृषक धनराशि" || c === "सब्सिडी धनराशि") && c !== "कुल रिकॉर्ड");
    const visibleClickedColsForExport = isRotated[index] 
      ? [...visibleDynamicColsExport, ...summaryColsForExport]
      : visibleDynamicColsExport;
    
    // For rotated tables, the row headers (first column values) become column headers in transposed view
    // Get the visible row names from the data (excluding the "कुल" total row)
    const visibleRowNames = modifiedData
      .filter((row) => row[table.columns[0]] !== "कुल")
      .map((row) => row[table.columns[0]]);
    
    // For rotated tables, we need to pass raw (unformatted) data to transposeTableForRotation
    // because it will apply its own formatting. Using modifiedData would cause double-formatting.
    const rawDataForRotation = table.data.filter((row) => {
      const rowValue = row[table.columns[0]];
      // Apply the same row filter as modifiedData
      return rowValue !== "कुल" ? visibleRowNames.includes(rowValue) : true;
    });
    // Augment rawDataForRotation with derived ikai values for dynamic columns so
    // transpose and export logic can pick up units even if per-row `${col}_ikai`
    // keys were not originally present.
    // Use previously computed visibleDynamicColsExport to augment raw rows
    const augmentedRawData = rawDataForRotation.map((r) => {
      const newR = { ...r };
      visibleDynamicColsExport.forEach((c) => {
        const existing = newR[`${c}_ikai`] || newR[`${c}_unit`] || "";
        if (!existing) {
          const derived = findUnitForRowCol(newR, c, table);
          if (derived) newR[`${c}_ikai`] = derived;
        }
      });
      return newR;
    });
    
    setCurrentTableForExport({
      ...table,
      data: modifiedData,
      // Store raw data for rotation (transposeTableForRotation will use this)
      rawData: augmentedRawData,
      columns: visibleColumns,
      totals: totals,
      isAllocationTable: table.isAllocationTable,
      showDar: showDar, // Store the dar toggle
      showMatra: showMatra, // Store the matra toggle
      showIkai: showIkai, // Store the ikai toggle
      isRotated: isRotated[index] || false,
      // Export-time visibility: which original rows (headers) are visible (become columns when transposed)
      visibleTransposed: [table.columns[0], ...visibleRowNames, "कुल"],
      // Which clicked/dynamic columns are visible (become rows when transposed)
      visibleClickedCols: visibleClickedColsForExport,
    });
    setShowTableSelectionModal(true);
  };

  // Helper function to get rotation status for a table
  const getTableRotationStatus = () => {
    if (currentTableForExport && additionalTables.length > 0) {
      const tableIndex = additionalTables.findIndex(
        (t) => t.heading === currentTableForExport.heading
      );
      return tableIndex !== -1 ? isRotated[tableIndex] || false : false;
    }
    return false;
  };

  // Helper function to transpose table data for rotated tables
  const transposeTableForRotation = (table) => {
    const transposedRows = [];
    const firstColLabel = table.columns[0];
    
    // Use rawData if available (unformatted data for proper calculation)
    // Otherwise fall back to table.data
    const sourceData = table.rawData || table.data;

    // Determine which original rows (headers) are visible when transposed
    const rowHeaders = (table.visibleTransposed && table.visibleTransposed.length > 0)
      ? table.visibleTransposed.filter((c) => c !== firstColLabel && c !== "कुल")
      : sourceData.filter((row) => row[firstColLabel] !== "कुल").map((row) => row[firstColLabel]);

    // Determine which clicked/dynamic columns are visible (these will become rows)
    // Include summary columns (आवंटित मात्रा, etc.) as rows in transposed view
    const allClickedCols = (table.visibleClickedCols && table.visibleClickedCols.length > 0)
      ? table.visibleClickedCols
      : table.columns.slice(1).filter((col) => {
          if (!table.isAllocationTable) return true;
          return !(col.endsWith("_dar") || col.endsWith("_farmer") || col.endsWith("_subsidy"));
        });

    // Separate dynamic columns from summary columns
    const dynamicCols = allClickedCols.filter(col => !col.startsWith("कुल") && col !== "आवंटित मात्रा" && col !== "कृषक धनराशि" && col !== "सब्सिडी धनराशि");
    const summaryColsToInclude = allClickedCols.filter(col => col.startsWith("कुल") || col === "आवंटित मात्रा" || col === "कृषक धनराशि" || col === "सब्सिडी धनराशि");

    // For each visible dynamic column, create a transposed row
    dynamicCols.forEach((col) => {
      const newRow = { [firstColLabel]: col };

      // For each visible original row header, populate cell
      rowHeaders.forEach((rh) => {
        const dataRow = sourceData.find((r) => r[firstColLabel] === rh);
        if (!dataRow) {
          newRow[rh] = "";
          return;
        }

        if (table.isAllocationTable) {
          const matraValRaw = resolveCellValue(dataRow, col);
          const darValRaw = resolveCellValue(dataRow, `${col}_dar`);
          const ikaiValRaw = resolveCellValue(dataRow, `${col}_ikai`) || resolveCellValue(dataRow, `${col}_unit`) || "";
          const matraVal = matraValRaw !== "" ? String(matraValRaw) : "0";
          const darVal = darValRaw !== "" ? String(darValRaw) : matraVal;
          const ikaiVal = ikaiValRaw !== "" ? String(ikaiValRaw) : "";
          newRow[rh] = formatAllocationValue(matraVal, ikaiVal, darVal, table.showMatra, table.showIkai, table.showDar);
        } else {
          newRow[rh] = resolveCellValue(dataRow, col) || "";
        }
      });

      // Compute total for this clicked column across visible rowHeaders
      if (rowHeaders.length > 0) {
        if (table.isAllocationTable) {
          const matraTotal = rowHeaders.reduce((s, rh) => {
            const r = sourceData.find((rr) => rr[firstColLabel] === rh);
            return s + parseFloat(resolveCellValue(r, col) || 0);
          }, 0).toFixed(2);
          const darTotal = rowHeaders.reduce((s, rh) => {
            const r = sourceData.find((rr) => rr[firstColLabel] === rh);
            return s + parseFloat(resolveCellValue(r, `${col}_dar`) || 0);
          }, 0).toFixed(2);
          const ikaiTotal = rowHeaders.reduce((s, rh) => {
            const r = sourceData.find((rr) => rr[firstColLabel] === rh);
            return s + parseFloat(resolveCellValue(r, `${col}_ikai`) || resolveCellValue(r, `${col}_unit`) || 0);
          }, 0).toFixed(2);
          newRow["कुल"] = formatAllocationValue(matraTotal, ikaiTotal, darTotal, table.showMatra, table.showIkai, table.showDar);
        } else {
          const totalVal = rowHeaders.reduce((s, rh) => {
            const r = sourceData.find((rr) => rr[firstColLabel] === rh);
            return s + parseFloat(resolveCellValue(r, col) || 0);
          }, 0).toFixed(2);
          newRow["कुल"] = totalVal;
        }
      }

      transposedRows.push(newRow);
    });

    // Add summary columns as rows (आवंटित मात्रा, कृषक धनराशि, सब्सिडी धनराशि, कुल राशि)
    if (table.isAllocationTable && summaryColsToInclude.length > 0) {
      summaryColsToInclude.forEach((summaryCol) => {
        // Determine the display label for summary columns based on matra/dar toggle
        let displayLabel = summaryCol;
        if (summaryCol === "आवंटित मात्रा") {
          if (table.showMatra && table.showDar) displayLabel = "आवंटित मात्रा/दर";
          else if (table.showDar) displayLabel = "आवंटित दर";
          else displayLabel = "आवंटित मात्रा";
        }
        
        const newRow = { [firstColLabel]: displayLabel };
        
        // For each visible original row header, calculate the summary value
        rowHeaders.forEach((rh) => {
          const dataRow = sourceData.find((r) => r[firstColLabel] === rh);
          if (!dataRow) {
            newRow[rh] = "0";
            return;
          }

          // Calculate summary value based on dynamicCols (same logic as display)
            if (summaryCol === "आवंटित मात्रा") {
              const matraTotal = dynamicCols.reduce((s, c) => s + parseFloat(resolveCellValue(dataRow, c) || 0), 0).toFixed(2);
              const darTotal = dynamicCols.reduce((s, c) => s + parseFloat(resolveCellValue(dataRow, `${c}_dar`) || 0), 0).toFixed(2);
              const ikaiTotal = dynamicCols.reduce((s, c) => s + parseFloat(resolveCellValue(dataRow, `${c}_ikai`) || resolveCellValue(dataRow, `${c}_unit`) || 0), 0).toFixed(2);
              newRow[rh] = formatAllocationValue(matraTotal, ikaiTotal, darTotal, table.showMatra, table.showIkai, table.showDar);
            } else if (summaryCol === "कृषक धनराशि") {
              newRow[rh] = dynamicCols.reduce((s, c) => s + parseFloat(resolveCellValue(dataRow, `${c}_farmer`) || 0), 0).toFixed(2);
            } else if (summaryCol === "सब्सिडी धनराशि") {
              newRow[rh] = dynamicCols.reduce((s, c) => s + parseFloat(resolveCellValue(dataRow, `${c}_subsidy`) || 0), 0).toFixed(2);
            } else if (summaryCol === "कुल राशि") {
              newRow[rh] = dynamicCols.reduce((s, c) => s + parseFloat(resolveCellValue(dataRow, `${c}_dar`) || 0), 0).toFixed(2);
            } else {
              newRow[rh] = resolveCellValue(dataRow, summaryCol) !== undefined ? String(resolveCellValue(dataRow, summaryCol)) : "0";
            }
        });

        // Calculate total for summary column (grand total across all rows)
        if (summaryCol === "आवंटित मात्रा") {
          const matraTotal = rowHeaders.reduce((s, rh) => {
            const r = sourceData.find((rr) => rr[firstColLabel] === rh);
            return s + dynamicCols.reduce((rs, c) => rs + parseFloat(resolveCellValue(r, c) || 0), 0);
          }, 0).toFixed(2);
          const darTotal = rowHeaders.reduce((s, rh) => {
            const r = sourceData.find((rr) => rr[firstColLabel] === rh);
            return s + dynamicCols.reduce((rs, c) => rs + parseFloat(resolveCellValue(r, `${c}_dar`) || 0), 0);
          }, 0).toFixed(2);
          if (table.showMatra && table.showDar) newRow["कुल"] = `${matraTotal} / ${darTotal}`;
          else if (table.showDar) newRow["कुल"] = darTotal;
          else newRow["कुल"] = matraTotal;
        } else if (summaryCol === "कृषक धनराशि") {
          newRow["कुल"] = rowHeaders.reduce((s, rh) => {
            const r = sourceData.find((rr) => rr[firstColLabel] === rh);
            return s + dynamicCols.reduce((rs, c) => rs + parseFloat(resolveCellValue(r, `${c}_farmer`) || 0), 0);
          }, 0).toFixed(2);
        } else if (summaryCol === "सब्सिडी धनराशि") {
          newRow["कुल"] = rowHeaders.reduce((s, rh) => {
            const r = sourceData.find((rr) => rr[firstColLabel] === rh);
            return s + dynamicCols.reduce((rs, c) => rs + parseFloat(resolveCellValue(r, `${c}_subsidy`) || 0), 0), 0;
          }, 0).toFixed(2);
        } else if (summaryCol === "कुल राशि") {
          newRow["कुल"] = rowHeaders.reduce((s, rh) => {
            const r = sourceData.find((rr) => rr[firstColLabel] === rh);
            return s + dynamicCols.reduce((rs, c) => rs + parseFloat(resolveCellValue(r, `${c}_dar`) || 0), 0);
          }, 0).toFixed(2);
        } else {
          const total = rowHeaders.reduce((s, rh) => {
            const r = sourceData.find((rr) => rr[firstColLabel] === rh);
            return s + parseFloat(resolveCellValue(r, summaryCol) || 0);
          }, 0).toFixed(2);
          newRow["कुल"] = total;
        }

        transposedRows.push(newRow);
      });
    }

    // Build totals row: for each visible rowHeader, sum over dynamicCols (not summary cols)
    const totalsRow = { [firstColLabel]: "कुल" };
    // For each visible original row header, compute sum across dynamicCols
    rowHeaders.forEach((rh) => {
      if (table.isAllocationTable) {
        const matraSum = dynamicCols.reduce((s, c) => {
          const r = sourceData.find((rr) => rr[firstColLabel] === rh);
          return s + parseFloat(resolveCellValue(r, c) || 0);
        }, 0).toFixed(2);
        const darSum = dynamicCols.reduce((s, c) => {
          const r = sourceData.find((rr) => rr[firstColLabel] === rh);
          return s + parseFloat(resolveCellValue(r, `${c}_dar`) || 0);
        }, 0).toFixed(2);
        if (table.showMatra && table.showDar) totalsRow[rh] = `${matraSum} / ${darSum}`;
        else if (table.showDar) totalsRow[rh] = darSum;
        else totalsRow[rh] = matraSum;
      } else {
        const sumVal = dynamicCols.reduce((s, c) => {
          const r = sourceData.find((rr) => rr[firstColLabel] === rh);
          return s + parseFloat(resolveCellValue(r, c) || 0);
        }, 0).toFixed(2);
        totalsRow[rh] = sumVal;
      }
    });

    // For the transposed 'कुल' column (grand total across all), compute sums
    if (table.isAllocationTable) {
      const grandMatra = dynamicCols.reduce((s, c) => {
        return s + rowHeaders.reduce((ss, rh) => {
          const r = sourceData.find((rr) => rr[firstColLabel] === rh);
          return ss + parseFloat(resolveCellValue(r, c) || 0);
        }, 0);
      }, 0).toFixed(2);
      const grandDar = dynamicCols.reduce((s, c) => {
        return s + rowHeaders.reduce((ss, rh) => {
          const r = sourceData.find((rr) => rr[firstColLabel] === rh);
          return ss + parseFloat(resolveCellValue(r, `${c}_dar`) || 0);
        }, 0);
      }, 0).toFixed(2);
      if (table.showMatra && table.showDar) totalsRow["कुल"] = `${grandMatra} / ${grandDar}`;
      else if (table.showDar) totalsRow["कुल"] = grandDar;
      else totalsRow["कुल"] = grandMatra;
    } else {
      const grand = dynamicCols.reduce((s, c) => {
        return s + rowHeaders.reduce((ss, rh) => {
          const r = sourceData.find((rr) => rr[firstColLabel] === rh);
          return ss + parseFloat(resolveCellValue(r, c) || 0);
        }, 0);
      }, 0).toFixed(2);
      totalsRow["कुल"] = grand;
    }

    // Append totals row only if there is any data AND it's not an allocation table
    // For allocation tables, the "कुल" column already shows row totals, so we skip the bottom totals row
    const hasAny = rowHeaders.length > 0 && (dynamicCols.length > 0 || summaryColsToInclude.length > 0);
    if (hasAny && !table.isAllocationTable) transposedRows.push(totalsRow);

    const newColumns = [firstColLabel, ...rowHeaders, "कुल"];

    return {
      ...table,
      data: transposedRows,
      columns: newColumns,
    };
  };

  // Confirm add table
  const confirmAddTable = () => {
    if (!currentTableForExport) return;

    const newTable = {
      id: Date.now(),
      name: tableName || `Table ${tablesForExport[exportType].length + 1}`,
      heading: currentTableForExport.heading,
      data: currentTableForExport.data,
      // Store raw data for rotation (used by transposeTableForRotation to avoid double-formatting)
      rawData: currentTableForExport.rawData,
      columns: currentTableForExport.columns,
      totals: currentTableForExport.totals || {},
      addedAt: new Date().toLocaleString(),
      // Prefer the rotation flag from the current table preview (set when user clicked add),
      // otherwise fallback to lookup by additionalTables index
      isRotated: currentTableForExport?.isRotated ?? getTableRotationStatus(),
      isAllocationTable: currentTableForExport.isAllocationTable,
      showDar: currentTableForExport.showDar, // Store the dar toggle
      showMatra: currentTableForExport.showMatra, // Store the matra toggle
      showIkai: currentTableForExport.showIkai,
      isSummary: currentTableForExport.isSummary !== false, // Mark as summary unless marked as additional
      // Pass visibility info for rotation
      visibleTransposed: currentTableForExport.visibleTransposed,
      visibleClickedCols: currentTableForExport.visibleClickedCols,
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

  // Helper to robustly resolve a cell value from a row given a column label
  const resolveCellValue = (row, col) => {
    if (row == null) return "";
    // If primitive row (string/number), return it
    if (typeof row !== "object") return row;

    // Direct property match
    if (Object.prototype.hasOwnProperty.call(row, col)) return row[col] ?? "";

    const normalizedCol = String(col).trim();

    // Exact match ignoring surrounding whitespace
    for (const k of Object.keys(row)) {
      if (String(k).trim() === normalizedCol) return row[k] ?? "";
    }

    // Try matching by removing parenthesis part from column label
    const withoutParen = normalizedCol.replace(/\s*\(.+?\)\s*$/, "").trim();
    if (withoutParen && withoutParen !== normalizedCol) {
      for (const k of Object.keys(row)) {
        if (String(k).trim() === withoutParen) return row[k] ?? "";
        if (String(k).includes(withoutParen)) return row[k] ?? "";
      }
    }

    // Try partial / substring matches (useful when keys differ slightly)
    for (const k of Object.keys(row)) {
      if (String(k).includes(normalizedCol) || normalizedCol.includes(String(k))) {
        return row[k] ?? "";
      }
    }

    // Fallback: if this column maps to a known key in columnDefs, return that
    const key = Object.keys(columnDefs).find((k) => columnDefs[k].label === col);
    if (key && Object.prototype.hasOwnProperty.call(row, key)) return row[key] ?? "";

    return "";
  };

  // Format allocation display string including matra, ikai (unit) and dar based on toggles
  const formatAllocationValue = (matra, ikai, dar, showMatra, showIkai, showDar) => {
    const m = (matra === undefined || matra === null || String(matra).trim() === "") ? "0" : String(matra);
    const i = (ikai === undefined || ikai === null || String(ikai).trim() === "") ? "" : String(ikai);
    const d = (dar === undefined || dar === null || String(dar).trim() === "") ? "0" : String(dar);

    if (showMatra && showIkai && showDar) return `${m} / ${i || ""} / ${d}`;
    if (showMatra && showIkai) return `${m} / ${i || ""}`;
    if (showIkai && showDar) return `${i || ""} / ${d}`;
    if (showMatra && showDar) return `${m} / ${d}`;
    if (showIkai) return `${i || ""}`;
    if (showDar) return `${d}`;
    return `${m}`;
  };

  // Try to detect a unit (ikai) string from a data item using common field names
  const getUnitFromItem = (item) => {
    if (!item || typeof item !== "object") return "";
    const candidates = [
      "ikai",
      "unit",
      "unit_of_measure",
      "investment_ikai",
      "investment_unit",
      "sub_investment_unit",
      "measure",
    ];
    for (const c of candidates) {
      if (item[c]) return item[c];
    }
    return "";
  };

  // Try to derive a unit (ikai) for a given table row and dynamic column by
  // scanning the underlying dataset for an item that matches the row header
  // and has a field equal to the column label. This is a best-effort
  // fallback when per-column `${col}_ikai` keys are not present on the row.
  const findUnitForRowCol = (row, colLabel, table) => {
    try {
      const rowHeaderKey = table.columns && table.columns[0];
      const rowHeaderVal = row && row[rowHeaderKey];
      if (!rowHeaderVal) return "";

      // Search the global tableData for an item that belongs to this row
      // and contains a property whose value matches the column label.
      for (const item of tableData) {
        // Ensure this item belongs to the same row (by first column value)
        if (item[table.columnKey] !== rowHeaderVal) continue;

        // If any property equals the column label, return its unit
        for (const k of Object.keys(item)) {
          try {
            if (item[k] === colLabel || String(item[k]) === String(colLabel)) {
              const u = getUnitFromItem(item);
              if (u) return u;
            }
          } catch (e) {
            // ignore coercion problems
          }
        }
      }
    } catch (e) {
      // swallow errors and return empty
    }
    return "";
  };

  // Generate PDF preview
  const generatePDFPreview = () => {
    return (
      <div
        style={{
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
        }}
      >
        <style>{`
          /* Prevent rows or cells from splitting across PDF pages */
          table { page-break-inside: avoid; break-inside: avoid; }
          thead { display: table-header-group }
          tfoot { display: table-row-group }
          tr { page-break-inside: avoid; break-inside: avoid; }
          td, th { page-break-inside: avoid; break-inside: avoid; }
          .table-container { page-break-inside: avoid; break-inside: avoid; }
        `}</style>
        <h1
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "16px",
          }}
        >
          निर्यातित टेबल रिपोर्ट
        </h1>
        {tablesForExport.pdf.map((table, index) => {
          // Transpose table if it's rotated
          const displayTable = table.isRotated
            ? transposeTableForRotation(table)
            : table;

          return (
            <div
              key={table.id}
              style={{ marginBottom: "30px", pageBreakInside: "avoid" }}
            >
              <h2 style={{ marginBottom: "10px", fontSize: "14px" }}>
                {index + 1}. {displayTable.heading}
              </h2>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "20px",
                  fontSize: "12px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#2980b9", color: "white" }}>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "6px",
                        textAlign: "left",
                        fontSize: "12px",
                      }}
                    >
                      S.No.
                    </th>
                    {displayTable.columns.map((col) => (
                      <th
                        key={col}
                        style={{
                          border: "1px solid #ddd",
                          padding: "6px",
                          textAlign: "left",
                          fontSize: "12px",
                        }}
                      >
                        {getDynamicColumnHeader(col, table.showMatra, table.showDar, table.isAllocationTable, table.showIkai)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayTable.data.map((row, rowIndex) => {
                    const isTotalRow = row[displayTable.columns[0]] === "कुल";
                    return (
                      <tr key={rowIndex} style={isTotalRow ? { fontWeight: "bold" } : {}}>
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "6px",
                            fontSize: "10px",
                          }}
                        >
                          {isTotalRow ? "" : rowIndex + 1}
                        </td>
                        {displayTable.columns.map((col) => {
                          let cellValue = resolveCellValue(row, col);
                          // Fallback for investment/sub-investment expanded totals: compute unique lists
                          if (
                            (cellValue === "" || cellValue === null) &&
                            typeof col === "string"
                          ) {
                            const colKey = Object.keys(columnDefs).find(
                              (k) => columnDefs[k].label === col
                            );
                            if (colKey === "investment_name") {
                              const vals = getUniqueValuesWithMatra("investment_name", null);
                              cellValue = vals.map((v) => v.display).join("\n");
                            } else if (colKey === "sub_investment_name") {
                              const grouped = getSubInvestmentGroupedByInvestment(null);
                              const formatted = [];
                              grouped.forEach((group) => {
                                // Show investment name with unit (if present) as bold heading
                                const investmentDisplay = group.unit 
                                  ? `**${group.investmentName} (${group.unit})**`
                                  : `**${group.investmentName}**`;
                                formatted.push(investmentDisplay);
                                group.subInvestments.forEach((item) => {
                                  formatted.push(`  • ${item.display}`);
                                });
                              });
                              cellValue = formatted.join("\n");
                            }
                          }
                          // Check if value contains newlines (hierarchical format)
                          const hasMultipleLines = typeof cellValue === "string" && cellValue.includes("\n");
                          return (
                            <td
                              key={col}
                              style={{
                                border: "1px solid #ddd",
                                padding: "6px",
                                fontSize: "10px",
                                whiteSpace: hasMultipleLines ? "pre-wrap" : "normal",
                                verticalAlign: "top",
                              }}
                            >
                              {cellValue}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
                {(() => {
                  const hasTotalRow =
                    displayTable.data.length > 0 &&
                    displayTable.data[displayTable.data.length - 1][
                      displayTable.columns[0]
                    ] === "कुल";
                  // Check if this is a rotated table (कुल is in columns)
                  const isRotatedWithTotal = displayTable.columns.includes("कुल");
                  
                  return (
                    !hasTotalRow && !isRotatedWithTotal && (
                      <tfoot>
                        <tr
                          style={{
                            backgroundColor: "#f2f2f2",
                            fontWeight: "bold",
                          }}
                        >
                          <td
                            style={{
                              border: "1px solid #ddd",
                              padding: "6px",
                              fontSize: "10px",
                            }}
                          >
                            कुल:
                          </td>
                          {displayTable.columns.map((col) => {
                            // Use pre-calculated totals if available
                            const totalValue =
                              displayTable.totals &&
                              displayTable.totals[col] !== undefined
                                ? displayTable.totals[col]
                                : calculateColumnTotal(
                                    displayTable.data,
                                    col,
                                    columnDefs
                                  );

                            return (
                              <td
                                key={col}
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "6px",
                                  fontSize: "10px",
                                }}
                              >
                                {totalValue}
                              </td>
                            );
                          })}
                        </tr>
                      </tfoot>
                    )
                  );
                })()}
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  // Generate Excel preview
  const generateExcelPreview = () => {
    return (
      <div
        style={{
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
        }}
      >
        <style>{`
          /* Prevent rows from visually splitting in print preview */
          table { page-break-inside: avoid; break-inside: avoid; }
          tr { page-break-inside: avoid; break-inside: avoid; }
          td, th { page-break-inside: avoid; break-inside: avoid; }
          thead { display: table-header-group }
          tfoot { display: table-row-group }
        `}</style>
        <h3
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "16px",
          }}
        >
          Excel शीट्स पूर्वालोकन
        </h3>
        {tablesForExport.excel.map((table, index) => {
          // Transpose table if it's rotated
          const displayTable = table.isRotated
            ? transposeTableForRotation(table)
            : table;

          return (
            <div
              key={table.id}
              style={{
                marginBottom: "30px",
                border: "1px solid #ddd",
                padding: "15px",
                pageBreakInside: "avoid",
              }}
            >
              <h4
                style={{
                  marginBottom: "10px",
                  color: "#2980b9",
                  fontSize: "14px",
                }}
              >
                शीट {index + 1}: {displayTable.name}
              </h4>
              <h5 style={{ marginBottom: "10px", fontSize: "13px" }}>
                {displayTable.heading}
              </h5>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "10px",
                  fontSize: "12px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f2f2f2" }}>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "6px",
                        textAlign: "left",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    >
                      S.No.
                    </th>
                    {displayTable.columns.map((col) => (
                      <th
                        key={col}
                        style={{
                          border: "1px solid #ddd",
                          padding: "6px",
                          textAlign: "left",
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        {getDynamicColumnHeader(col, table.showMatra, table.showDar, table.isAllocationTable, table.showIkai)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayTable.data.map((row, rowIndex) => {
                    const isTotalRow = row[displayTable.columns[0]] === "कुल";
                    return (
                      <tr key={rowIndex} style={isTotalRow ? { fontWeight: "bold" } : {}}>
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "6px",
                            fontSize: "10px",
                          }}
                        >
                          {isTotalRow ? "" : rowIndex + 1}
                        </td>
                        {displayTable.columns.map((col) => {
                          const cellValue = resolveCellValue(row, col);
                          // Check if value contains newlines (hierarchical format)
                          const hasMultipleLines = typeof cellValue === "string" && cellValue.includes("\n");
                          return (
                            <td
                              key={col}
                              style={{
                                border: "1px solid #ddd",
                                padding: "6px",
                                fontSize: "10px",
                                whiteSpace: hasMultipleLines ? "pre-wrap" : "normal",
                                verticalAlign: "top",
                              }}
                            >
                              {cellValue}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
                {(() => {
                  const hasTotalRow =
                    displayTable.data.length > 0 &&
                    displayTable.data[displayTable.data.length - 1][
                      displayTable.columns[0]
                    ] === "कुल";
                  // Check if this is a rotated table (कुल is in columns)
                  const isRotatedWithTotal = displayTable.columns.includes("कुल");
                  
                  return (
                    !hasTotalRow && !isRotatedWithTotal && (
                      <tfoot>
                        <tr
                          style={{
                            backgroundColor: "#f2f2f2",
                            fontWeight: "bold",
                          }}
                        >
                          <td
                            style={{
                              border: "1px solid #ddd",
                              padding: "6px",
                              fontSize: "10px",
                            }}
                          >
                            कुल:
                          </td>
                          {displayTable.columns.map((col) => {
                            // Use pre-calculated totals if available
                            const totalValue =
                              displayTable.totals &&
                              displayTable.totals[col] !== undefined
                                ? displayTable.totals[col]
                                : calculateColumnTotal(
                                    displayTable.data,
                                    col,
                                    columnDefs
                                  );

                            return (
                              <td
                                key={col}
                                style={{
                                  border: "1px solid #ddd",
                                  padding: "6px",
                                  fontSize: "10px",
                                }}
                              >
                                {totalValue}
                              </td>
                            );
                          })}
                        </tr>
                      </tfoot>
                    )
                  );
                })()}
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  // Helper function to get dynamic column header based on matra/dar toggle
  const getDynamicColumnHeader = (col, showMatra, showDar, isAllocationTable, showIkai) => {
    if (!isAllocationTable || col !== "आवंटित मात्रा") return col;
    // Build header based on which toggles are active
    if (showMatra && showIkai && showDar) return "आवंटित मात्रा/इकाई/दर";
    if (showMatra && showIkai) return "आवंटित मात्रा/इकाई";
    if (showIkai && showDar) return "इकाई/दर";
    if (showMatra && showDar) return "आवंटित मात्रा/दर";
    if (showIkai) return "इकाई";
    if (showDar) return "आवंटित दर";
    return "आवंटित मात्रा";
  };

  // Helper function to calculate column totals (fallback)
  const calculateColumnTotal = (tableData, column, columnDefs) => {
    if (column === "कुल रिकॉर्ड") {
      return tableData.reduce((sum, row) => sum + (row[column] || 0), 0);
    } else if (
      column === "आवंटित मात्रा" ||
      column === "कृषक धनराशि" ||
      column === "सब्सिडी धनराशि" ||
      column === "कुल राशि"
    ) {
      return tableData
        .reduce((sum, row) => sum + parseFloat(row[column] || 0), 0)
        .toFixed(2);
    } else {
      // For other columns, count unique values
      const uniqueValues = new Set();
      tableData.forEach((row) => {
        let value = "";
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
        // Transpose table if it's rotated
        const displayTable = table.isRotated
          ? transposeTableForRotation(table)
          : table;

        htmlContent += `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h2 style="margin-top: 15px; margin-bottom: 8px; font-size: 12px;">${
              index + 1
            }. ${displayTable.heading}</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px;">
              <thead>
                <tr style="background-color: #2980b9; color: white;">
                  <th style="border: 1px solid #ddd; padding: 5px; text-align: left; font-size: 9px;">S.No.</th>
                  ${displayTable.columns
                    .map(
                      (col) =>
                        `<th style="border: 1px solid #ddd; padding: 5px; text-align: left; font-size: 9px;">${getDynamicColumnHeader(col, table.showMatra, table.showDar, table.isAllocationTable)}</th>`
                    )
                    .join("")}
                </tr>
              </thead>
              <tbody>
        `;

          // Insert CSS at top of each table block to help html2pdf avoid splitting rows
          if (index === 0) {
            // inject a global style block at top of the content
            htmlContent = htmlContent.replace(
              '<div style="font-family: Arial, sans-serif; font-size: 10px; padding: 15px;">',
              '<div style="font-family: Arial, sans-serif; font-size: 10px; padding: 15px;">\n<style>table{page-break-inside:avoid;break-inside:avoid;} thead{display:table-header-group;} tfoot{display:table-row-group;} tr{page-break-inside:avoid;break-inside:avoid;} td,th{page-break-inside:avoid;break-inside:avoid;}</style>'
            );
          }

        // Include all rows from the display table (including any appended 'कुल' row)
        const dataToProcess = displayTable.data;
        
        dataToProcess.forEach((row, rowIndex) => {
          const isTotalRow = row[displayTable.columns[0]] === "कुल";
          htmlContent += `<tr${isTotalRow ? ' style="font-weight: bold;"' : ''}>`;
          htmlContent += `<td style="border: 1px solid #ddd; padding: 5px; font-size: 8px;">${
            isTotalRow ? "" : rowIndex + 1
          }</td>`;
            displayTable.columns.forEach((col) => {
            let cellValue = resolveCellValue(row, col);
            // Fallback for investment/sub-investment expanded totals in HTML/pdf generation
            if ((cellValue === "" || cellValue === null) && typeof col === "string") {
              const colKey = Object.keys(columnDefs).find((k) => columnDefs[k].label === col);
              if (colKey === "investment_name") {
                const vals = getUniqueValuesWithMatra("investment_name", null);
                cellValue = vals.map((v) => {
                  const display = v.unit 
                    ? `**${v.name} (${v.unit})**`
                    : `**${v.name}**`;
                  return v.matra ? `${display} (${v.matra})` : display;
                }).join("\n");
              } else if (colKey === "sub_investment_name") {
                const grouped = getSubInvestmentGroupedByInvestment(null);
                const formatted = [];
                grouped.forEach((group) => {
                  const investmentDisplay = group.unit 
                    ? `**${group.investmentName} (${group.unit})**`
                    : `**${group.investmentName}**`;
                  formatted.push(investmentDisplay);
                  group.subInvestments.forEach((item) => {
                    formatted.push(`  • ${item.name} (${item.matra})`);
                  });
                });
                cellValue = formatted.join("\n");
              }
            }
            // Convert newlines to <br/> for PDF display
            if (typeof cellValue === "string") {
              cellValue = cellValue.replace(/\n/g, "<br/>");
              // Convert **text** to bold for PDF
              cellValue = cellValue.replace(/\*\*(.+?)\*\*/g, '<strong style="background-color: #e9ecef; padding: 2px 4px; border-radius: 3px;">$1</strong>');
            }
            htmlContent += `<td style="border: 1px solid #ddd; padding: 5px; font-size: 8px;">${cellValue}</td>`;
          });
          htmlContent += "</tr>";
        });

        // Add footer row with totals only if the table doesn't already have a total row
        // For rotated summary tables, "कुल" is a column name, not a data row, so don't add footer
        const hasTotalRowInData =
          displayTable.data.length > 0 &&
          displayTable.data[displayTable.data.length - 1][
            displayTable.columns[0]
          ] === "कुल";
        const hasKulAsColumn = displayTable.columns.includes("कुल") && table.isSummary;
        
        if (!hasTotalRowInData && !hasKulAsColumn) {
          htmlContent += `
              </tbody>
              <tfoot>
                <tr style="background-color: #f2f2f2; font-weight: bold;">
                  <td style="border: 1px solid #ddd; padding: 5px; font-size: 8px;">कुल:</td>
          `;

          displayTable.columns.forEach((col) => {
            // Use pre-calculated totals if available
            let totalValue =
              displayTable.totals && displayTable.totals[col] !== undefined
                ? displayTable.totals[col]
                : calculateColumnTotal(displayTable.data, col, columnDefs);

            // Convert newlines to <br/> for PDF display
            if (typeof totalValue === "string") {
              totalValue = totalValue.replace(/\n/g, "<br/>");
              // Convert **text** to bold for PDF
              totalValue = totalValue.replace(/\*\*(.+?)\*\*/g, '<strong style="background-color: #e9ecef; padding: 2px 4px; border-radius: 3px;">$1</strong>');
            }

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

      htmlContent += "</div>";

      // Use landscape orientation for all PDFs with rotated tables, otherwise portrait
      const hasRotatedTable = tablesForExport.pdf.some((t) => t.isRotated);

      // Configure html2pdf options
      const options = {
        margin: [8, 8, 8, 8],
        filename: "exported-tables.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 1.8,
          useCORS: true,
          letterRendering: true,
          logging: false,
          windowWidth: hasRotatedTable ? 1400 : 1200,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: hasRotatedTable ? "landscape" : "portrait",
          compress: true,
        },
      };

      // Generate and download PDF from HTML string
      html2pdf()
        .set(options)
        .from(htmlContent)
        .save()
        .catch((error) => {
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
      // Transpose table if it's rotated
      const displayTable = table.isRotated
        ? transposeTableForRotation(table)
        : table;

      // Prepare data for this table
      // Include all rows from the display table (including any appended 'कुल' row)
      const dataToProcess = displayTable.data;
      
      // Transform column headers with dynamic naming based on matra/dar toggle
      const transformedColumns = displayTable.columns.map((col) =>
        getDynamicColumnHeader(col, table.showMatra, table.showDar, table.isAllocationTable, table.showIkai)
      );
      
      // Helper function to format cell value for Excel (convert **text** to [text] and • to proper format)
      const formatCellForExcel = (value) => {
        if (typeof value !== "string") return value;
        // Convert **text** to [text] for Excel (bold marker)
        let formatted = value.replace(/\*\*(.+?)\*\*/g, '[$1]');
        // Keep • bullet points and newlines as they are - Excel handles them well
        return formatted;
      };

      let tableDataArray = [
        [displayTable.heading], // Title
        [], // Empty row
        ["S.No.", ...transformedColumns], // Headers
          ...dataToProcess.map((row, rowIndex) => [
          row[displayTable.columns[0]] === "कुल" ? "" : rowIndex + 1,
          ...displayTable.columns.map((col) => {
            let cellValue = resolveCellValue(row, col);
            // Fallback for investment/sub-investment expanded totals in Excel
            if ((cellValue === "" || cellValue === null) && typeof col === "string") {
              const colKey = Object.keys(columnDefs).find((k) => columnDefs[k].label === col);
              if (colKey === "investment_name") {
                const vals = getUniqueValuesWithMatra("investment_name", null);
                cellValue = vals.map((v) => {
                  const display = v.unit 
                    ? `**${v.name} (${v.unit})**`
                    : `**${v.name}**`;
                  return v.matra ? `${display} (${v.matra})` : display;
                }).join("\n");
              } else if (colKey === "sub_investment_name") {
                const grouped = getSubInvestmentGroupedByInvestment(null);
                const formatted = [];
                grouped.forEach((group) => {
                  const investmentDisplay = group.unit 
                    ? `**${group.investmentName} (${group.unit})**`
                    : `**${group.investmentName}**`;
                  formatted.push(investmentDisplay);
                  group.subInvestments.forEach((item) => {
                    formatted.push(`  • ${item.name} (${item.matra})`);
                  });
                });
                cellValue = formatted.join("\n");
              }
            }
            return formatCellForExcel(cellValue);
          }),
        ]),
      ];

      // Add totals row only if the table doesn't already have a total row
      // For rotated summary tables, "कुल" is a column name, not a data row, so don't add footer
      const hasTotalRowInData =
        displayTable.data.length > 0 &&
        displayTable.data[displayTable.data.length - 1][
          displayTable.columns[0]
        ] === "कुल";
      const hasKulAsColumn = displayTable.columns.includes("कुल") && table.isSummary;
      
      if (!hasTotalRowInData && !hasKulAsColumn) {
        // Calculate totals for each column using pre-calculated values
        const totalsRow = ["कुल:"];
        displayTable.columns.forEach((col) => {
          let totalValue =
            displayTable.totals && displayTable.totals[col] !== undefined
              ? displayTable.totals[col]
              : calculateColumnTotal(displayTable.data, col, columnDefs);
          // Format total value for Excel
          totalsRow.push(formatCellForExcel(totalValue));
        });

        // Add empty row and totals row
        tableDataArray.push([], totalsRow);
      }

      const sheetName = displayTable.name.substring(0, 31); // Excel sheet name limit

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
        for (let col = 0; col < displayTable.columns.length + 1; col++) {
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
          e: { c: displayTable.columns.length, r: newEndRow },
        });

        // Update column widths if needed
        if (!existingSheet["!cols"]) {
          const colWidths = displayTable.columns.map(() => ({ wch: 15 }));
          existingSheet["!cols"] = colWidths;
        }
      } else {
        // Create new sheet
        const worksheet = XLSX.utils.aoa_to_sheet(tableDataArray);

        // Set column widths
        const colWidths = displayTable.columns.map(() => ({ wch: 15 }));
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
                        <RiEyeLine /> पूर्वालोकन
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



  // Initialize filters for additional tables
  useEffect(() => {
    if (additionalTables.length > 0) {
      const initialFilters = {};
      additionalTables.forEach((table, index) => {
        // Filter out "कुल" row from the selected values
        const allRowValues = table.data
          .filter(row => row[table.columns[0]] !== "कुल")
          .map((row) => row[table.columns[0]]);
        initialFilters[index] = {
          allSelected: true,
          selectedValues: allRowValues,
        };
      });
      setAdditionalTableFilters(initialFilters);
    }
  }, [additionalTables]);

  // Generate detailed breakdown table for clicked entries
  const generateDetailedBreakdownTable = (clickedValues, columnKey) => {
    // Get the current filtered data based on the filter stack
    const baseData =
      filteredTableData && filteredTableData.length > 0
        ? filteredTableData
        : tableData;

    const currentFilteredData = baseData.filter((item) => {
      for (let filter of filterStack) {
        if (!filter.checked[item[filter.column]]) return false;
      }
      return true;
    });

    // If only one row is selected, show only that row's data (not grouped by columnKey)
    if (clickedValues.length === 1) {
      const selectedValue = clickedValues[0];
      const filteredRows = currentFilteredData.filter(
        (item) => item[columnKey] === selectedValue
      );
      // Choose columns to show (exclude the clicked column)
      const showColumns = Object.keys(columnDefs)
        .filter(
          (col) =>
            col !== columnKey &&
            !columnDefs[col].hidden &&
            col !== "allocated_quantity" &&
            col !== "rate" &&
            col !== "amount_of_farmer_share" &&
            col !== "amount_of_subsidy" &&
            col !== "total_amount"
        )
        .map((col) => columnDefs[col].label);

      // Build table data: one row per filtered item
      const newTableData = filteredRows.map((item, idx) => {
        const row = { SNo: idx + 1 };
        showColumns.forEach((label) => {
          const colKey = Object.keys(columnDefs).find(
            (k) => columnDefs[k].label === label
          );
          row[label] = item[colKey];
        });
        return row;
      });

      // Add total row with unique count for each column
      const totalRow = { SNo: "कुल" };
      showColumns.forEach((label) => {
        totalRow[label] = new Set(newTableData.map((row) => row[label])).size;
      });
      newTableData.push(totalRow);

      return {
        heading: `${selectedValue}`,
        data: newTableData,
        columns: ["SNo", ...showColumns],
        columnKey: columnKey,
        isBreakdownTable: true,
      };
    }

    // Default: previous behavior for multiple values
    // ...existing code...
    // Get all unique values for the first column (same as summary table)
    const firstColumnValues = [
      ...new Set(
        currentFilteredData.map((item) => item[columnKey]).filter(Boolean)
      ),
    ];

    // Create the new table structure
    const newTableData = [];

    // For each value in the first column, create a row with allocation data for each clicked value
    firstColumnValues.forEach((firstColValue) => {
      const rowData = {
        [columnDefs[columnKey]?.label]: firstColValue,
      };

      // Add allocation data for each clicked value
      clickedValues.forEach((clickedValue) => {
        // Filter data for this specific combination
        const filteredForCombination = currentFilteredData.filter((item) => {
          return (
            item[columnKey] === firstColValue &&
            item[filterStack[filterStack.length - 1].column] === clickedValue
          );
        });

        // Calculate total allocated quantity for this combination
        const totalAllocated = filteredForCombination
          .reduce(
            (sum, item) => sum + (parseFloat(item.allocated_quantity) || 0),
            0
          )
          .toFixed(2);

        rowData[clickedValue] = totalAllocated;
      });

      newTableData.push(rowData);
    });

    // Create columns for the new table
    const newColumns = [columnDefs[columnKey]?.label, ...clickedValues];

    // Add total row with unique count for each column
    const totalRow = {};
    totalRow[columnDefs[columnKey]?.label] = "कुल";
    newColumns.forEach((col) => {
      if (col === columnDefs[columnKey]?.label) return;
      // Unique count for each column (clicked value)
      totalRow[col] = new Set(newTableData.map((row) => row[col])).size;
    });
    newTableData.push(totalRow);

    return {
      heading: columnDefs[columnKey]?.label || `Summary Table`,
      data: newTableData,
      columns: newColumns,
      columnKey: columnKey,
      isBreakdownTable: true,
    };
  };

  // Generate allocation table for clicked column entries - FIXED TO PREVENT DUPLICATE "कुल" COLUMN
  const generateAllocationTable = (
    clickedColumn,
    checkedValue,
    firstColumnKey
  ) => {
    // Get the current filtered data based on the filter stack
    const baseData =
      filteredTableData && filteredTableData.length > 0
        ? filteredTableData
        : tableData;

    const currentFilteredData = baseData.filter((item) => {
      for (let filter of filterStack) {
        if (!filter.checked[item[filter.column]]) return false;
      }
      return true;
    });

    // Get unique values for the first column (dynamic based on the clicked column)
    const firstColumnValues = [
      ...new Set(
        currentFilteredData.map((item) => item[firstColumnKey]).filter(Boolean)
      ),
    ];
    // Get unique values for the clicked column (entries)
    const clickedColumnValues = [
      ...new Set(
        currentFilteredData.map((item) => item[clickedColumn]).filter(Boolean)
      ),
    ];

    // Create the new table structure
    const newTableData = [];
    const columnTotals = {}; // For calculating column totals (matra)
    const columnDarTotals = {}; // For calculating column dar totals
    const columnFarmerTotals = {}; // For calculating total farmer share per column
    const columnSubsidyTotals = {}; // For calculating total subsidy per column

    // For each value in the first column, create a row with allocation data for each clicked column value
    firstColumnValues.forEach((firstColValue) => {
      const rowData = {
        [columnDefs[firstColumnKey]?.label]: firstColValue,
      };

      let rowTotal = 0; // For calculating row total (matra)
      let rowDarTotal = 0; // For calculating row dar total
      let rowFarmerTotal = 0; // For calculating row farmer share total
      let rowSubsidyTotal = 0; // For calculating row subsidy total

      // Add allocation data for each clicked column value
      clickedColumnValues.forEach((clickedColValue) => {
        // Filter data for this specific combination
        const filteredForCombination = currentFilteredData.filter((item) => {
          return (
            item[firstColumnKey] === firstColValue &&
            item[clickedColumn] === clickedColValue
          );
        });

        // Calculate total allocated quantity (matra) for this combination
        const totalAllocated = filteredForCombination
          .reduce(
            (sum, item) => sum + (parseFloat(item.allocated_quantity) || 0),
            0
          )
          .toFixed(2);

        // Calculate total amount (dar) for this combination
        const totalAmount = filteredForCombination
          .reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0)
          .toFixed(2);

        // Calculate total farmer share and subsidy for this combination
        const totalFarmerShare = filteredForCombination
          .reduce(
            (sum, item) => sum + (parseFloat(item.amount_of_farmer_share) || 0),
            0
          )
          .toFixed(2);

        const totalSubsidy = filteredForCombination
          .reduce(
            (sum, item) => sum + (parseFloat(item.amount_of_subsidy) || 0),
            0
          )
          .toFixed(2);

        rowData[clickedColValue] = totalAllocated;
        rowData[`${clickedColValue}_dar`] = totalAmount;
        // Store farmer share and subsidy per clicked column internally (not shown as separate columns by default)
        rowData[`${clickedColValue}_farmer`] = totalFarmerShare;
        rowData[`${clickedColValue}_subsidy`] = totalSubsidy;

        rowTotal += parseFloat(totalAllocated);
        rowDarTotal += parseFloat(totalAmount);
        rowFarmerTotal += parseFloat(totalFarmerShare);
        rowSubsidyTotal += parseFloat(totalSubsidy);

        // Calculate column totals
        if (!columnTotals[clickedColValue]) {
          columnTotals[clickedColValue] = 0;
          columnDarTotals[clickedColValue] = 0;
          columnFarmerTotals[clickedColValue] = 0;
          columnSubsidyTotals[clickedColValue] = 0;
        }
        columnTotals[clickedColValue] += parseFloat(totalAllocated);
        columnDarTotals[clickedColValue] += parseFloat(totalAmount);
        columnFarmerTotals[clickedColValue] += parseFloat(totalFarmerShare);
        columnSubsidyTotals[clickedColValue] += parseFloat(totalSubsidy);
      });

      // Add row totals in requested sequence:
      // "आवंटित मात्रा", "कृषक धनराशि", "सब्सिडी धनराशि", "कुल राशि"
      rowData["आवंटित मात्रा"] = rowTotal.toFixed(2);
      rowData["कृषक धनराशि"] = rowFarmerTotal.toFixed(2);
      rowData["सब्सिडी धनराशि"] = rowSubsidyTotal.toFixed(2);
      rowData["कुल राशि"] = rowDarTotal.toFixed(2);
      newTableData.push(rowData);
    });

    // Add total row
    const totalRow = { [columnDefs[firstColumnKey]?.label]: "कुल" };
    let grandTotal = 0;
    let grandDarTotal = 0;
    let grandFarmerTotal = 0;
    let grandSubsidyTotal = 0;

    clickedColumnValues.forEach((clickedColValue) => {
      totalRow[clickedColValue] = (columnTotals[clickedColValue] || 0).toFixed(
        2
      );
      totalRow[`${clickedColValue}_dar`] = (
        columnDarTotals[clickedColValue] || 0
      ).toFixed(2);
      grandTotal += columnTotals[clickedColValue] || 0;
      grandDarTotal += columnDarTotals[clickedColValue] || 0;
      grandFarmerTotal += columnFarmerTotals[clickedColValue] || 0;
      grandSubsidyTotal += columnSubsidyTotals[clickedColValue] || 0;
    });

    totalRow["आवंटित मात्रा"] = grandTotal.toFixed(2);
    totalRow["कृषक धनराशि"] = grandFarmerTotal.toFixed(2);
    totalRow["सब्सिडी धनराशि"] = grandSubsidyTotal.toFixed(2);
    totalRow["कुल राशि"] = grandDarTotal.toFixed(2);
    newTableData.push(totalRow);

    // Create columns for the new table - FIXED: Only add "कुल" once
    const newColumns = [
      columnDefs[firstColumnKey]?.label,
      ...clickedColumnValues,
      "आवंटित मात्रा",
      "कृषक धनराशि",
      "सब्सिडी धनराशि",
      "कुल राशि",
    ];

    return {
      heading: `आवंटन विवरण - ${columnDefs[firstColumnKey]?.label} द्वारा ${columnDefs[clickedColumn]?.label}`,
      data: newTableData,
      columns: newColumns,
      columnKey: firstColumnKey,
      isAllocationTable: true,
    };
  };

  // Handle adding a table to an existing sheet
  const handleAddToExistingSheet = (type, existingTableId) => {
    if (!currentTableForExport) return;

    // Find the existing table
    const existingTable = tablesForExport[type].find(
      (t) => t.id === existingTableId
    );
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
      isAllocationTable: currentTableForExport.isAllocationTable,
      showDar: currentTableForExport.showDar, // Store the dar toggle
      showMatra: currentTableForExport.showMatra, // Store the matra toggle
      isRotated: currentTableForExport?.isRotated || false,
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
    <Modal
      show={showTableSelectionModal}
      onHide={() => setShowTableSelectionModal(false)}
    >
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
      <Modal.Body style={{ maxHeight: "70vh", overflow: "auto" }}>
        {previewType === "pdf" ? generatePDFPreview() : generateExcelPreview()}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
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

  // Report Modal Component
  const ReportModal = () => (
    <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>विकल्प चुनें</Modal.Title>
      </Modal.Header>
      <Modal.Body onClick={(e) => e.stopPropagation()}>
        <Form.Group>
          <Form.Label>{columnDefs[reportType]?.label || reportType} चुनें</Form.Label>
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              isMulti
              options={[
                { value: "ALL", label: "सभी चुनें" },
                ...reportMultiSelectOptions.map(val => ({ value: val, label: val }))
              ]}
              value={selectedReportValues.map(val => ({ value: val, label: val }))}
              onChange={(selected) => {
                const selectedValues = selected ? selected.map(s => s.value) : [];
                if (selectedValues.includes("ALL")) {
                  // If "ALL" is selected, select all options
                  setSelectedReportValues(reportMultiSelectOptions);
                } else {
                  // Remove "ALL" from selection and set the rest
                  setSelectedReportValues(selectedValues.filter(val => val !== "ALL"));
                }
              }}
              placeholder="विकल्प चुनें"
            />
          </div>
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowReportModal(false)}>रद्द करें</Button>
        <Button variant="primary" onClick={confirmReportGeneration}>ठीक है</Button>
      </Modal.Footer>
    </Modal>
  );

  // Handle additional table filter change
  const handleAdditionalTableFilterChange = (tableIndex, value) => {
    setAdditionalTableFilters((prev) => {
      const currentFilter = prev[tableIndex] || {
        allSelected: true,
        selectedValues: [],
      };
      const table = additionalTables[tableIndex];
      // Exclude "कुल" row from all values
      const allValues = table.data
        .filter(row => row[table.columns[0]] !== "कुल")
        .map((row) => row[table.columns[0]]);

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

        // Filter the data based on the new selection (keep "कुल" row always)
        const filteredData = originalData.filter((row) => {
          const rowValue = row[tableData.columns[0]];
          // Always keep the "कुल" row
          if (rowValue === "कुल") return true;
          return (
            newFilter.allSelected || newFilter.selectedValues.includes(rowValue)
          );
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
      // For allocation tables, include dynamic columns AND summary columns (but not hidden columns like _dar, _farmer, _subsidy)
      const allColumns = table.isAllocationTable
        ? table.columns.slice(1).filter(col => 
            !col.endsWith("_dar") &&
            !col.endsWith("_farmer") &&
            !col.endsWith("_subsidy")
          )
        : table.columns.slice(2, -4);
      const currentVisibleColumns = prev[tableIndex] || allColumns;
      let newVisibleColumns;

      if (columnName === "SELECT_ALL") {
        newVisibleColumns =
          currentVisibleColumns.length === allColumns.length ? [] : allColumns;
      } else {
        if (currentVisibleColumns.includes(columnName)) {
          newVisibleColumns = currentVisibleColumns.filter(
            (col) => col !== columnName
          );
        } else {
          // Add in original order
          newVisibleColumns = allColumns.filter(
            (col) => col === columnName || currentVisibleColumns.includes(col)
          );
        }
      }

      return {
        ...prev,
        [tableIndex]: newVisibleColumns,
      };
    });
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
              {/* Report Generation Section */}
              {view === "main" && (
                <div className="report-generation-section mb-3 p-3 border rounded bg-light">
                  <h6 className="fw-bold">रिपोर्ट जनरेट करें</h6>
                  <Row>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>दिनांक से</Form.Label>
                        <Form.Control
                          type="date"
                          value={reportDateStart}
                          onChange={(e) => setReportDateStart(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>दिनांक तक</Form.Label>
                        <Form.Control
                          type="date"
                          value={reportDateEnd}
                          onChange={(e) => setReportDateEnd(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>रिपोर्ट प्रकार</Form.Label>
                        <Form.Select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                          <option value="">चुनें</option>
                          <option value="center_name">केंद्र</option>
                          <option value="vidhan_sabha_name">विधानसभा</option>
                          <option value="vikas_khand_name">विकास खंड</option>
                          <option value="scheme_name">योजना</option>
                          <option value="investment_name">निवेश</option>
                          <option value="sub_investment_name">उप-निवेश</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Button
                        onClick={handleGenerateReport}
                        className="mt-4"
                        disabled={!reportDateStart || !reportDateEnd || !reportType}
                      >
                        रिपोर्ट जनरेट करें
                      </Button>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Date Range Filter Section (above main table) */}
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
                          <i className="fas fa-spinner fa-spin"></i> अपडेट हो
                          रहा है...
                        </span>
                      )}
                    </h6>
                    <div className="d-flex gap-2">
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
                  {/* Date Range Filter UI */}
                  <div className="date-range-filter mb-3 p-2 bg-white border rounded d-flex align-items-center gap-3">
                    <span className="fw-bold">दिनांक से</span>
                    <input
                      type="date"
                      className="form-control"
                      style={{ maxWidth: 180 }}
                      value={dateFilter.start}
                      onChange={e => setDateFilter(df => ({ ...df, start: e.target.value }))}
                    />
                    <span className="fw-bold">दिनांक तक</span>
                    <input
                      type="date"
                      className="form-control"
                      style={{ maxWidth: 180 }}
                      value={dateFilter.end}
                      onChange={e => setDateFilter(df => ({ ...df, end: e.target.value }))}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      className="ms-2"
                      onClick={applyFilters}
                      disabled={!(dateFilter.start && dateFilter.end) || isApplyingFilters}
                    >
                      <BiFilter /> लागू करें
                    </Button>
                    {isDateFilterApplied && (
                      <span className="badge bg-success ms-2">दिनांक फ़िल्टर लागू</span>
                    )}
                  </div>
                  {/* Filter Summary */}
                  {isFilterApplied && (
                    <div className="filter-summary mb-2 p-2 bg-white border rounded">
                      <small className="text-muted">
                        <strong>फ़िल्टर लागू:</strong>{" "}
                        {Object.entries(filters)
                          .filter(([key, values]) => values.length > 0)
                          .map(
                            ([key, values]) =>
                              `${columnDefs[key]?.label}: ${values.length} selected`
                          )
                          .join(" | ")}
                        <span className="ms-3">
                          <strong>परिणाम:</strong>{" "}
                          <span className="badge bg-primary">
                            {filteredTableData.length}
                          </span>{" "}
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
                            <div
                              className="dropdown-menu show"
                              style={{
                                position: "absolute",
                                top: "100%",
                                zIndex: 1000,
                                maxHeight: "250px",
                                overflowY: "auto",
                              }}
                            >
                              <div
                                key="select_all_center"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected =
                                    filterOptions.center_name.length > 0 &&
                                    filters.center_name.length ===
                                      filterOptions.center_name.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`center_name_SELECT_ALL`}
                                      label={
                                        allSelected ? "सभी हटाएं" : "सभी चुनें"
                                      }
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
                            <div
                              className="dropdown-menu show"
                              style={{
                                position: "absolute",
                                top: "100%",
                                zIndex: 1000,
                                maxHeight: "250px",
                                overflowY: "auto",
                              }}
                            >
                              <div
                                key="select_all_vikas"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected =
                                    filterOptions.vikas_khand_name.length > 0 &&
                                    filters.vikas_khand_name.length ===
                                      filterOptions.vikas_khand_name.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`vikas_khand_name_SELECT_ALL`}
                                      label={
                                        allSelected ? "सभी हटाएं" : "सभी चुनें"
                                      }
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
                            <div
                              className="dropdown-menu show"
                              style={{
                                position: "absolute",
                                top: "100%",
                                zIndex: 1000,
                                maxHeight: "250px",
                                overflowY: "auto",
                              }}
                            >
                              <div
                                key="select_all_vidhan"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected =
                                    filterOptions.vidhan_sabha_name.length >
                                      0 &&
                                    filters.vidhan_sabha_name.length ===
                                      filterOptions.vidhan_sabha_name.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`vidhan_sabha_name_SELECT_ALL`}
                                      label={
                                        allSelected ? "सभी हटाएं" : "सभी चुनें"
                                      }
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
                            <div
                              className="dropdown-menu show"
                              style={{
                                position: "absolute",
                                top: "100%",
                                zIndex: 1000,
                                maxHeight: "250px",
                                overflowY: "auto",
                              }}
                            >
                              <div
                                key="select_all_investment"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected =
                                    filterOptions.investment_name.length > 0 &&
                                    filters.investment_name.length ===
                                      filterOptions.investment_name.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`investment_name_SELECT_ALL`}
                                      label={
                                        allSelected ? "सभी हटाएं" : "सभी चुनें"
                                      }
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
                            <div
                              className="dropdown-menu show"
                              style={{
                                position: "absolute",
                                top: "100%",
                                zIndex: 1000,
                                maxHeight: "250px",
                                overflowY: "auto",
                              }}
                            >
                              <div
                                key="select_all_sub_investment"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected =
                                    filterOptions.sub_investment_name.length >
                                      0 &&
                                    filters.sub_investment_name.length ===
                                      filterOptions.sub_investment_name.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`sub_investment_name_SELECT_ALL`}
                                      label={
                                        allSelected ? "सभी हटाएं" : "सभी चुनें"
                                      }
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
                            <div
                              className="dropdown-menu show"
                              style={{
                                position: "absolute",
                                top: "100%",
                                zIndex: 1000,
                                maxHeight: "250px",
                                overflowY: "auto",
                              }}
                            >
                              <div
                                key="select_all_source"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected =
                                    filterOptions.source_of_receipt.length >
                                      0 &&
                                    filters.source_of_receipt.length ===
                                      filterOptions.source_of_receipt.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`source_of_receipt_SELECT_ALL`}
                                      label={
                                        allSelected ? "सभी हटाएं" : "सभी चुनें"
                                      }
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
                            <div
                              className="dropdown-menu show"
                              style={{
                                position: "absolute",
                                top: "100%",
                                zIndex: 1000,
                                maxHeight: "250px",
                                overflowY: "auto",
                              }}
                            >
                              <div
                                key="select_all_scheme"
                                className="dropdown-item"
                              >
                                {(() => {
                                  const allSelected =
                                    filterOptions.scheme_name.length > 0 &&
                                    filters.scheme_name.length ===
                                      filterOptions.scheme_name.length;
                                  return (
                                    <FormCheck
                                      className="check-box"
                                      type="checkbox"
                                      id={`scheme_name_SELECT_ALL`}
                                      label={
                                        allSelected ? "सभी हटाएं" : "सभी चुनें"
                                      }
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
                                      <div className="d-flex gap-2 justify-content-end mt-2">

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
                      </div>
                </div>
              )}

              {view === "main" ? (
                <Row>
                  <Col lg={isFilterApplied ? 12 : 12} md={12} sm={12}>
                    {/* Placeholder for Dashboard Graphs/Charts */}
                    <div className="dashboard-graphs p-3 border rounded bg-white">
                      <ExportSection />
                      
                      {/* Vikas Khand Summary Table removed as per request */}
                      {isApplyingFilters && (
                        <div className="text-center py-3">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mt-2 text-muted">
                            डेटा अपडेट हो रहा है...
                          </p>
                        </div>
                      )}
                      {!isApplyingFilters && (
                        <>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="mb-0">Main Table</h5>
                            <ColumnFilter
                              tableId="main"
                              columns={tableColumnOrder
                                .filter((col) => !columnDefs[col].hidden)
                                .map((col) => columnDefs[col].label)}
                              selectedColumns={tableColumnFilters.main}
                              onColumnToggle={handleMainTableColumnToggle}
                              onToggleAll={handleMainTableToggleAllColumns}
                            />
                          </div>
                          <div
                            className="table-responsive"
                            style={{ overflowX: "auto", maxHeight: "60vh", overflowY: "auto" }}
                          >
                            <Table
                              striped
                              bordered
                              hover
                              className="table-thead-style"
                            >
                            <thead className="table-thead">
                              <tr>
                                <th>S.No.</th>
                                {(() => {
                                  // Build main table columns: start from normal visible columns,
                                  // insert 'unit' after 'scheme_name' and append 'bill_date'
                                  const baseCols = tableColumnOrder.filter(
                                    (col) => !columnDefs[col].hidden
                                  );
                                  const cols = [...baseCols];
                                  const schemeIdx = cols.indexOf("scheme_name");
                                  if (schemeIdx !== -1 && !cols.includes("unit")) {
                                    cols.splice(schemeIdx + 1, 0, "unit");
                                  }
                                  if (!cols.includes("bill_date")) {
                                    cols.push("bill_date");
                                  }

                                  return cols
                                    .filter((col) =>
                                      tableColumnFilters.main.includes(
                                        columnDefs[col]?.label
                                      ) ||
                                      // Always include these two in main table regardless of column filter
                                      col === "unit" ||
                                      col === "bill_date"
                                    )
                                    .map((col) => (
                                      <th key={col}>{columnDefs[col]?.label || col}</th>
                                    ));
                                })()}
                              </tr>
                            </thead>
                            <tbody>
                              {currentPageData.map((item, index) => (
                                <tr key={item.id || index}>
                                  <td>{startIndex + index + 1}</td>
                                  {(() => {
                                    const baseCols = tableColumnOrder.filter(
                                      (col) => !columnDefs[col].hidden
                                    );
                                    const cols = [...baseCols];
                                    const schemeIdx = cols.indexOf("scheme_name");
                                    if (schemeIdx !== -1 && !cols.includes("unit")) {
                                      cols.splice(schemeIdx + 1, 0, "unit");
                                    }
                                    if (!cols.includes("bill_date")) {
                                      cols.push("bill_date");
                                    }

                                    return cols
                                      .filter((col) =>
                                        tableColumnFilters.main.includes(
                                          columnDefs[col]?.label
                                        ) ||
                                        col === "unit" ||
                                        col === "bill_date"
                                      )
                                      .map((col) => {
                                        const isSpecial =
                                          col === "unit" ||
                                          col === "bill_date";
                                        return (
                                          <td
                                            key={col}
                                            style={{
                                              cursor: "default",
                                              color: "black",
                                            }}
                                          >
                                            {col === "unit"
                                              ? // Prefer explicit unit field or try helper
                                                item.unit || getUnitFromItem(item) || "-"
                                              : item[col] || "-"}
                                          </td>
                                        );
                                      });
                                  })()}
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td style={{ fontWeight: "bold" }}>कुल:</td>
                                  {(() => {
                                    const baseCols = tableColumnOrder.filter(
                                      (col) => !columnDefs[col].hidden
                                    );
                                    const cols = [...baseCols];
                                    const schemeIdx = cols.indexOf("scheme_name");
                                    if (schemeIdx !== -1 && !cols.includes("unit")) {
                                      cols.splice(schemeIdx + 1, 0, "unit");
                                    }
                                    if (!cols.includes("bill_date")) {
                                      cols.push("bill_date");
                                    }

                                    return cols
                                      .filter((col) =>
                                        tableColumnFilters.main.includes(
                                          columnDefs[col]?.label
                                        ) ||
                                        col === "unit" ||
                                        col === "bill_date"
                                      )
                                      .map((col) => {
                                        const isNumeric =
                                          col === "allocated_quantity" ||
                                          col === "amount_of_farmer_share" ||
                                          col === "amount_of_subsidy" ||
                                          col === "total_amount";
                                        const isSpecial =
                                          col === "unit" ||
                                          col === "bill_date";

                                        return (
                                          <td
                                            key={col}
                                            style={{
                                              fontWeight: "bold",
                                              cursor: "default",
                                              color: "black",
                                              textDecoration: "none",
                                            }}
                                          >
                                            {isNumeric
                                              ? filteredTableData
                                                  .reduce(
                                                    (sum, item) =>
                                                      sum +
                                                      (parseFloat(item[col]) || 0),
                                                    0
                                                  )
                                                  .toFixed(2)
                                              : col === "unit"
                                              ? (() => {
                                                  const uniqueUnits = new Set(filteredTableData.map(row => row.unit).filter(Boolean));
                                                  return uniqueUnits.size;
                                                })()
                                              : isSpecial
                                              ? "-"
                                              : new Set(
                                                  filteredTableData.map(
                                                    (item) => item[col]
                                                  )
                                                ).size}
                                          </td>
                                        );
                                      });
                                  })()}
                              </tr>
                            </tfoot>
                            </Table>
                          </div>
                        </>
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
                          // Use filteredTableData as base to respect top-level filters
                          const baseData =
                            filteredTableData && filteredTableData.length > 0
                              ? filteredTableData
                              : tableData;

                          const currentFilteredData = baseData.filter(
                            (item) => {
                              // Apply all filters except the current one
                              for (let i = 0; i < filterStack.length; i++) {
                                if (i === filterIndex) continue;
                                const f = filterStack[i];
                                if (!f.checked[item[f.column]]) return false;
                              }
                              return true;
                            }
                          );

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
                                  <div
                                    className="dropdown-menu show"
                                    style={{
                                      position: "absolute",
                                      top: "100%",
                                      zIndex: 1000,
                                      maxHeight: "250px",
                                      overflowY: "auto",
                                    }}
                                  >
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
                      
                      {/* Graph Visualization Section */}
                      <div className="graph-visualization-section">
                        <h6>डेटा विज़ुअलाइज़ेशन</h6>
                        
                        {/* Graph Type Selector */}
                        <div className="mb-3 graph-type-selector">
                          <Button
                            size="sm"
                            variant={graphType === "bar" ? "primary" : "outline-primary"}
                            onClick={() => setGraphType("bar")}
                          >
                            📊 बार ग्राफ
                          </Button>
                          <Button
                            size="sm"
                            variant={graphType === "pie" ? "success" : "outline-success"}
                            onClick={() => setGraphType("pie")}
                          >
                            🥧 पाई चार्ट
                          </Button>
                          <Button
                            size="sm"
                            variant={graphType === "doughnut" ? "warning" : "outline-warning"}
                            onClick={() => setGraphType("doughnut")}
                          >
                            🍩 डोनट चार्ट
                          </Button>
                        </div>

                        {/* Graph Column Selector */}
                        <div className="mb-3 graph-column-selector">
                          <Form.Label className="form-label fw-bold small mb-2">
                            📋 दिखाने के लिए कॉलम चुनें
                          </Form.Label>
                          <Form.Select
                            size="sm"
                            value={graphColumn}
                            onChange={(e) => setGraphColumn(e.target.value)}
                          >
                            {/* Show all available columns, mark selected ones from main table */}
                            {[
                              { key: "center_name", label: columnDefs.center_name.label },
                              { key: "vidhan_sabha_name", label: columnDefs.vidhan_sabha_name.label },
                              { key: "vikas_khand_name", label: columnDefs.vikas_khand_name.label },
                              { key: "scheme_name", label: columnDefs.scheme_name.label },
                              { key: "source_of_receipt", label: columnDefs.source_of_receipt.label },
                              { key: "investment_name", label: columnDefs.investment_name.label },
                              { key: "sub_investment_name", label: columnDefs.sub_investment_name.label },
                              { key: "allocated_quantity", label: columnDefs.allocated_quantity.label },
                              { key: "amount_of_farmer_share", label: columnDefs.amount_of_farmer_share.label },
                              { key: "amount_of_subsidy", label: columnDefs.amount_of_subsidy.label },
                              { key: "total_amount", label: columnDefs.total_amount.label },
                            ].map((col) => {
                              const isSelected = tableColumnFilters.main && tableColumnFilters.main.includes(col.key);
                              return (
                                <option key={col.key} value={col.key}>
                                  {isSelected ? "✓ " : ""}{col.label}
                                </option>
                              );
                            })}
                          </Form.Select>
                        </div>

                        {/* Chart Rendering with Scrolling */}
                        <div className="chart-scroll-wrapper">
                          <div 
                            className="chart-container"
                            style={{ width: calculateChartWidth() }}
                          >
                            {generateChartData() ? (
                              graphType === "bar" ? (
                                <Bar data={generateChartData()} options={chartOptions} />
                              ) : graphType === "pie" ? (
                                <Pie data={generateChartData()} options={chartOptions} />
                              ) : (
                                <Doughnut data={generateChartData()} options={chartOptions} />
                              )
                            ) : (
                              <div className="chart-no-data">
                                <p>📊 डेटा उपलब्ध नहीं है</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col lg={9} md={9} sm={12}>
                    <div className="dashboard-graphs p-3 border rounded bg-white">
                      {(() => {
                        // Use filteredTableData as base to respect top-level filters
                        const baseData =
                          filteredTableData && filteredTableData.length > 0
                            ? filteredTableData
                            : tableData;

                        const filteredData = baseData.filter((item) => {
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
                                    setNavigationHistory([]);
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
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <h5 className="mb-0">Detail Table</h5>
                                      <ColumnFilter
                                        tableId="detail"
                                        columns={tableColumnOrder
                                          .filter(
                                            (col) =>
                                              col !== currentFilter.column &&
                                              !columnDefs[col].hidden
                                          )
                                          .sort(
                                            (a, b) =>
                                              tableColumnOrder.indexOf(a) -
                                              tableColumnOrder.indexOf(b)
                                          )
                                          .map((key) => columnDefs[key].label)}
                                        selectedColumns={
                                          tableColumnFilters.detail
                                        }
                                        onColumnToggle={
                                          handleDetailTableColumnToggle
                                        }
                                        onToggleAll={
                                          handleDetailTableToggleAllColumns
                                        }
                                      />
                                    </div>
                                    <div
                                      className="table-responsive"
                                      style={{ overflowX: "auto", maxHeight: "60vh", overflowY: "auto" }}
                                    >
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
                                            .filter(
                                              (col) =>
                                                col !==
                                                  currentFilter.column &&
                                                !columnDefs[col].hidden
                                            )
                                            .filter((col) =>
                                              tableColumnFilters.detail.includes(
                                                columnDefs[col].label
                                              )
                                            )
                                            .sort(
                                              (a, b) =>
                                                tableColumnOrder.indexOf(a) -
                                                tableColumnOrder.indexOf(b)
                                            )
                                            .map((col) => (
                                              <th key={col}>
                                                {columnDefs[col].label}
                                              </th>
                                            ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {currentPageData.map((item, index) => (
                                          <tr key={item.id || index}>
                                            <td>{startIndex + index + 1}</td>
                                            {tableColumnOrder
                                              .filter(
                                                (col) =>
                                                  col !== currentFilter.column &&
                                                  !columnDefs[col].hidden
                                              )
                                              .filter((col) =>
                                                tableColumnFilters.detail.includes(
                                                  columnDefs[col].label
                                                )
                                              )
                                              .sort(
                                                (a, b) =>
                                                  tableColumnOrder.indexOf(a) -
                                                  tableColumnOrder.indexOf(b)
                                              )
                                              .map((col) => (
                                                <td key={col}>
                                                  {col === "allocated_quantity" ||
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
                                          <td style={{ fontWeight: "bold" }}>कुल:</td>
                                          {tableColumnOrder
                                            .filter(
                                              (col) =>
                                                col !== currentFilter.column &&
                                                !columnDefs[col].hidden
                                            )
                                            .filter((col) =>
                                              tableColumnFilters.detail.includes(
                                                columnDefs[col].label
                                              )
                                            )
                                            .sort(
                                              (a, b) =>
                                                tableColumnOrder.indexOf(a) -
                                                tableColumnOrder.indexOf(b)
                                            )
                                            .map((col) => {
                                              let value;
                                              if (
                                                col === "allocated_quantity" ||
                                                col === "amount_of_farmer_share" ||
                                                col === "amount_of_subsidy" ||
                                                col === "total_amount"
                                              ) {
                                                value = filteredData
                                                  .reduce(
                                                    (sum, item) =>
                                                      sum +
                                                      (parseFloat(item[col]) || 0),
                                                    0
                                                  )
                                                  .toFixed(2);
                                              } else {
                                                value = new Set(
                                                  filteredData.map((item) => item[col])
                                                ).size;
                                              }
                                              return (
                                                <td key={col} style={{ fontWeight: "bold" }}>{value}</td>
                                              );
                                            })}
                                        </tr>
                                      </tfoot>
                                      </Table>
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <div>
                                    <ExportSection />
                                    {/* Total Breakdown Filter for Summary Table */}
                                    <div className="mb-3 p-2 border rounded bg-light">
                                      <div className="d-flex align-items-center gap-3 flex-wrap">
                                        <span className="fw-bold small">
                                          <BiFilter /> कुल का विवरण देखें:
                                        </span>
                                        <Form.Select
                                          size="sm"
                                          style={{ width: "auto", minWidth: "180px" }}
                                          value={summaryTotalBreakdownColumn}
                                          onChange={(e) => setSummaryTotalBreakdownColumn(e.target.value)}
                                        >
                                          <option value="">कुल मात्र (केवल कुल)</option>
                                          <option value="center_name">केंद्र</option>
                                          <option value="vidhan_sabha_name">विधानसभा</option>
                                          <option value="vikas_khand_name">विकास खंड</option>
                                          <option value="scheme_name">योजना</option>
                                          <option value="investment_name">निवेश</option>
                                          <option value="sub_investment_name">उप-निवेश</option>
                                        </Form.Select>
                                        <span className="text-muted small">
                                          (कुल मात्रा और राशि दिखाएं)
                                        </span>
                                      </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                      <h5 className="mb-0">
                                        {columnDefs[currentFilter.column]?.label || "Summary Table"}
                                      </h5>
                                      <div className="d-flex gap-2">
                                        <Button
                                          variant="outline-primary"
                                          size="sm"
                                          onClick={() => {
                                            // Toggle all columns
                                            const expandableColumns = tableColumnOrder
                                              .filter(
                                                (col) =>
                                                  col !==
                                                    currentFilter.column &&
                                                  !columnDefs[col].hidden
                                              )
                                              .filter(
                                                (col) =>
                                                  col !==
                                                    "allocated_quantity" &&
                                                  col !== "rate" &&
                                                  col !==
                                                    "amount_of_farmer_share" &&
                                                  col !==
                                                    "amount_of_subsidy" &&
                                                  col !== "total_amount"
                                              );

                                            // Check if all expandable columns are currently expanded
                                            const allExpanded = expandableColumns.every(
                                              (col) => mainSummaryExpandedColumns[col] === true
                                            );

                                            const newExpandedState = {};
                                            expandableColumns.forEach((col) => {
                                              newExpandedState[col] = !allExpanded;
                                            });
                                            setMainSummaryExpandedColumns(
                                              newExpandedState
                                            );
                                          }}
                                        >
                                          {(() => {
                                            const expandableColumns = tableColumnOrder
                                              .filter(
                                                (col) =>
                                                  col !==
                                                    currentFilter.column &&
                                                  !columnDefs[col].hidden
                                              )
                                              .filter(
                                                (col) =>
                                                  col !==
                                                    "allocated_quantity" &&
                                                  col !== "rate" &&
                                                  col !==
                                                    "amount_of_farmer_share" &&
                                                  col !==
                                                    "amount_of_subsidy" &&
                                                  col !== "total_amount"
                                              );
                                            const allExpanded = expandableColumns.every(
                                              (col) => mainSummaryExpandedColumns[col] === true
                                            );
                                            return allExpanded ? "Hide All Values" : "Show All Values";
                                          })()}
                                        </Button>
                                        <ColumnFilter
                                          tableId="summary"
                                          columns={[
                                            ...tableColumnOrder
                                              .filter(
                                                (col) =>
                                                  col !==
                                                    currentFilter.column &&
                                                  !columnDefs[col].hidden
                                              )
                                              .filter(
                                                (col) =>
                                                  col !==
                                                    "allocated_quantity" &&
                                                  col !== "rate" &&
                                                  col !==
                                                    "amount_of_farmer_share" &&
                                                  col !==
                                                    "amount_of_subsidy" &&
                                                  col !== "total_amount" &&
                                                  col !== "source_of_receipt" // Exclude सप्लायर column
                                              )
                                              .sort(
                                                (a, b) =>
                                                  tableColumnOrder.indexOf(a) -
                                                  tableColumnOrder.indexOf(b)
                                              )
                                              .map(
                                                (key) => columnDefs[key].label
                                              ),
                                            "आवंटित मात्रा",
                                            "कृषक धनराशि",
                                            "सब्सिडी धनराशि",
                                            "कुल राशि",
                                          ]}
                                          selectedColumns={
                                            tableColumnFilters.summary
                                          }
                                          onColumnToggle={
                                            handleSummaryTableColumnToggle
                                          }
                                          onToggleAll={
                                            handleSummaryTableToggleAllColumns
                                          }
                                        />
                                      </div>
                                    </div>
                                    <div
                                      className="table-responsive"
                                      style={{ overflowX: "auto", maxHeight: "60vh", overflowY: "auto" }}
                                    >
                                      <Table
                                        striped
                                        bordered
                                        hover
                                        className="table-thead-style"
                                      >
                                      <thead className="table-thead">
                                        <tr>
                                          <th style={{ position: "relative" }}>
                                            {columnDefs[currentFilter.column]?.label || "Value"}
                                            {/* No filter icon or dropdown for the first column in summary table */}
                                          </th>
                                          {tableColumnOrder
                                            .filter(
                                              (col) =>
                                                col !== currentFilter.column &&
                                                !columnDefs[col].hidden &&
                                                col !== "source_of_receipt" // Exclude सप्लायर column
                                            )
                                            .filter(
                                              (col) =>
                                                col !== "allocated_quantity" &&
                                                col !== "rate" &&
                                                col !==
                                                  "amount_of_farmer_share" &&
                                                col !== "amount_of_subsidy" &&
                                                col !== "total_amount" &&
                                                col !== "source_of_receipt" // Exclude सप्लायर column
                                            )
                                            .sort(
                                              (a, b) =>
                                                tableColumnOrder.indexOf(a) -
                                                tableColumnOrder.indexOf(b)
                                            )
                                            .filter((col) =>
                                              tableColumnFilters.summary.includes(
                                                columnDefs[col].label
                                              )
                                            )
                                            .map((col) => (
                                              <th
                                                key={col}
                                                style={{ position: "relative" }}
                                              >
                                                {columnDefs[col].label}
                                                <Button
                                                  variant="link"
                                                  size="sm"
                                                  className="p-0 ms-1"
                                                  style={{
                                                    fontSize: "10px",
                                                    textDecoration: "underline",
                                                  }}
                                                  onClick={() =>
                                                    toggleMainSummaryColumnExpansion(
                                                      col
                                                    )
                                                  }
                                                >
                                                  {mainSummaryExpandedColumns[
                                                    col
                                                  ]
                                                    ? "Hide"
                                                    : "Show"}
                                                </Button>
                                                {/* Only show filter icon and dropdown for columns other than the first column */}
                                                {col !== currentFilter.column && (
                                                  <>
                                                    <Button
                                                      variant="link"
                                                      size="sm"
                                                      className="p-0 ms-1"
                                                      onClick={() => toggleSummaryHeaderDropdown(col)}
                                                    >
                                                      <BiFilter />
                                                    </Button>
                                                    {summaryHeaderFilterOpen[col] && (
                                                      <div
                                                        className="dropdown-menu show"
                                                        style={{ position: "absolute", top: "100%", zIndex: 1000, padding: "6px", minWidth: "220px" }}
                                                      >
                                                        {(() => {
                                                          const allValues = getUniqueValuesForColumn(filteredData, col);
                                                          const selected = summaryColumnValueFilters[col] || [];
                                                          const allSelected = selected.length === allValues.length && allValues.length > 0;
                                                          return (
                                                            <>
                                                              <div className="dropdown-item">
                                                                <FormCheck
                                                                  className="check-box"
                                                                  type="checkbox"
                                                                  id={`select_all_summary_${col}`}
                                                                  label={allSelected ? "सभी हटाएं" : "सभी चुनें"}
                                                                  checked={allSelected}
                                                                  onChange={() => {
                                                                    if (allSelected) {
                                                                      clearSummaryHeaderSelection(col);
                                                                    } else {
                                                                      setSummaryHeaderSelectAll(col, allValues);
                                                                    }
                                                                  }}
                                                                />
                                                              </div>
                                                              {allValues.map((val) => (
                                                                <div key={val} className="dropdown-item">
                                                                  <FormCheck
                                                                    className="check-box"
                                                                    type="checkbox"
                                                                    id={`summary_${col}_${val}`}
                                                                    label={String(val)}
                                                                    checked={selected.includes(val)}
                                                                    onChange={() => toggleSummaryHeaderValue(col, val)}
                                                                  />
                                                                </div>
                                                              ))}
                                                            </>
                                                          );
                                                        })()}
                                                      </div>
                                                    )}
                                                  </>
                                                )}
                                              </th>
                                            ))}
                                          {tableColumnFilters.summary.includes(
                                            "आवंटित मात्रा"
                                          ) && <th>आवंटित मात्रा</th>}
                                          {tableColumnFilters.summary.includes(
                                            "कृषक धनराशि"
                                          ) && <th>कृषक धनराशि</th>}
                                          {tableColumnFilters.summary.includes(
                                            "सब्सिडी धनराशि"
                                          ) && <th>सब्सिडी धनराशि</th>}
                                          {tableColumnFilters.summary.includes(
                                            "कुल राशि"
                                          ) && <th>कुल राशि</th>}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {(() => {
                                          // Apply header filters to determine which checked values to show
                                          // For the first column (currentFilter.column), we should NOT filter based on summaryColumnValueFilters
                                          // because the left filter already controls which values are shown
                                          // We only filter based on other column filters
                                          
                                          // Get data filtered by all filters EXCEPT the current filter for checking available values
                                          const dataForAvailableValues = baseData.filter((item) => {
                                            for (let i = 0; i < filterStack.length - 1; i++) {
                                              const f = filterStack[i];
                                              if (!f.checked[item[f.column]]) return false;
                                            }
                                            return true;
                                          });
                                          
                                          const displayCheckedValues = checkedValues.filter((checkedValue) => {
                                            // Check if this value exists in the available data (filtered by other filters, not current)
                                            const rowsForValue = dataForAvailableValues.filter(
                                              (item) => item[currentFilter.column] === checkedValue
                                            );
                                            // If no rows exist for this value at all, don't show it
                                            if (rowsForValue.length === 0) return false;
                                            
                                            // Apply other column filters (NOT the first column - that's controlled by left filter)
                                            for (const [col, selectedVals] of Object.entries(summaryColumnValueFilters)) {
                                              // Skip the first column - it's controlled by the left filter dropdown
                                              if (col === currentFilter.column) continue;
                                              const sel = selectedVals || [];
                                              // If a column has empty selection, hide all rows
                                              if (Array.isArray(sel) && sel.length === 0) return false;
                                              if (sel.length > 0) {
                                                const match = rowsForValue.some((row) => sel.includes(row[col]));
                                                if (!match) return false;
                                              }
                                            }
                                            return true;
                                          });

                                          return displayCheckedValues.map((checkedValue) => {
                                          const tableDataForValueBase = filteredData.filter(
                                              (item) => item[currentFilter.column] === checkedValue
                                            );
                                          const tableDataForValue = applySummaryHeaderFilters(tableDataForValueBase);
                                          return (
                                            <tr key={checkedValue}>
                                              <td>
                                                {checkedValue}
                                              </td>
                                              {tableColumnFilters.summary.includes(
                                                "कुल रिकॉर्ड"
                                              ) && (
                                                <td>
                                                  {tableDataForValue.length}
                                                </td>
                                              )}
                                              {tableColumnOrder
                                                .filter(
                                                  (col) =>
                                                    col !==
                                                      currentFilter.column &&
                                                    !columnDefs[col].hidden
                                                )
                                                .filter(
                                                  (col) =>
                                                    col !== "allocated_quantity" &&
                                                    col !== "rate" &&
                                                    col !== "amount_of_farmer_share" &&
                                                    col !== "amount_of_subsidy" &&
                                                    col !== "total_amount"
                                                )
                                                .sort(
                                                  (a, b) =>
                                                    tableColumnOrder.indexOf(
                                                      a
                                                    ) -
                                                    tableColumnOrder.indexOf(b)
                                                )
                                                .filter((col) =>
                                                  tableColumnFilters.summary.includes(
                                                    columnDefs[col].label
                                                  )
                                                )
                                                .map((col) => {
                                                  const isExpanded =
                                                    mainSummaryExpandedColumns[
                                                      col
                                                    ];

                                                  // Precompute grouping/height structures from the full cell dataset
                                                  // so all columns use the same alignment baseline.
                                                  const groupsByVikasCommon = {};
                                                  const centerToSchemesCommon = {};
                                                  const centerSchemeToInvestmentsCommon = {};
                                                  tableDataForValue.forEach((it) => {
                                                    const vk = it.vikas_khand_name || "अज्ञात";
                                                    const cn = it.center_name || "अज्ञात केंद्र";
                                                    const sch = it.scheme_name || null;
                                                    const inv = it.investment_name || null;

                                                    if (!groupsByVikasCommon[vk]) groupsByVikasCommon[vk] = new Set();
                                                    if (cn) groupsByVikasCommon[vk].add(cn);

                                                    if (!centerToSchemesCommon[cn]) centerToSchemesCommon[cn] = new Set();
                                                    if (sch) centerToSchemesCommon[cn].add(sch);

                                                    if (!centerSchemeToInvestmentsCommon[cn]) centerSchemeToInvestmentsCommon[cn] = {};
                                                    if (sch && !centerSchemeToInvestmentsCommon[cn][sch]) centerSchemeToInvestmentsCommon[cn][sch] = new Set();
                                                    if (inv) centerSchemeToInvestmentsCommon[cn][sch].add(inv);
                                                  });

                                                  const vikasOrderCommon = Object.keys(groupsByVikasCommon).sort();

                                                  const _lineHeight = 22;
                                                  const _verticalPadding = 12;
                                                  const _interBorder = 1;
                                                  const perCenterHeightCommon = {};
                                                  // Build sub-investment mapping for height calculation
                                                  const centerSchemeToSubInvestmentsCommon = {};
                                                  tableDataForValue.forEach((item) => {
                                                    const cn = item.center_name || "अज्ञात केंद्र";
                                                    const s = item.scheme_name || null;
                                                    const inv = item.investment_name || null;
                                                    const sub = item.sub_investment_name;
                                                    if (!centerSchemeToSubInvestmentsCommon[cn]) centerSchemeToSubInvestmentsCommon[cn] = {};
                                                    if (s && !centerSchemeToSubInvestmentsCommon[cn][s]) centerSchemeToSubInvestmentsCommon[cn][s] = {};
                                                    if (inv && sub) {
                                                      if (!centerSchemeToSubInvestmentsCommon[cn][s][inv]) centerSchemeToSubInvestmentsCommon[cn][s][inv] = new Set();
                                                      centerSchemeToSubInvestmentsCommon[cn][s][inv].add(sub);
                                                    }
                                                  });
                                                  vikasOrderCommon.forEach((vk) => {
                                                    const centers = Array.from(groupsByVikasCommon[vk] || []).sort();
                                                    centers.forEach((cn) => {
                                                      const schemesSet = centerToSchemesCommon[cn] || new Set();
                                                      const schemesCount = schemesSet.size;
                                                      // compute number of investment rows for this center (sum of investments across schemes)
                                                      let investmentsCount = 0;
                                                      let subInvestmentsCount = 0;
                                                      schemesSet.forEach((s) => {
                                                        const invSet = (centerSchemeToInvestmentsCommon[cn] && centerSchemeToInvestmentsCommon[cn][s]) || new Set();
                                                        investmentsCount += invSet.size || 0;
                                                        invSet.forEach((inv) => {
                                                          const subSet = (centerSchemeToSubInvestmentsCommon[cn] && centerSchemeToSubInvestmentsCommon[cn][s] && centerSchemeToSubInvestmentsCommon[cn][s][inv]) || new Set();
                                                          subInvestmentsCount += subSet.size || 0;
                                                        });
                                                      });
                                                      const rowsNeededForSchemes = Math.max(1, schemesCount);
                                                      const rowsNeededForInvestments = Math.max(1, investmentsCount);
                                                      const rowsNeededForSubInvestments = Math.max(1, subInvestmentsCount);
                                                      const rowsNeeded = Math.max(rowsNeededForSchemes, rowsNeededForInvestments, rowsNeededForSubInvestments);
                                                      perCenterHeightCommon[cn] = Math.max(rowsNeeded * _lineHeight + _verticalPadding + (rowsNeeded - 1) * _interBorder, _lineHeight + _verticalPadding);
                                                    });
                                                  });

                                                  const groupTotalHeightCommon = (vk) => {
                                                    const centers = Array.from(groupsByVikasCommon[vk] || []).sort();
                                                    return centers.reduce((sum, cn) => sum + (perCenterHeightCommon[cn] || (_lineHeight + _verticalPadding)), 0);
                                                  };

                                                  if (isExpanded) {
                                                    // Always apply summary header filters to the data for this cell
                                                    // so deselected values are removed from every row immediately
                                                    let cellData = filteredData.filter(
                                                      (item) => item[currentFilter.column] === checkedValue
                                                    );
                                                    cellData = applySummaryHeaderFilters(cellData);

                                                    // SPECIAL: If this column is the selected breakdown column, show names in same format as value columns
                                                    if (col === summaryTotalBreakdownColumn) {
                                                      const breakdown = generateTotalBreakdown(tableDataForValue, summaryTotalBreakdownColumn);
                                                      return (
                                                        <td key={col} style={{ maxWidth: "350px", verticalAlign: "top" }}>
                                                          <div>
                                                            {breakdown.map((group, gIdx) => (
                                                              <div key={gIdx} style={{ marginBottom: "10px" }}>
                                                                <div style={{ fontSize: "12px", fontWeight: "bold", backgroundColor: "#f1f3f5", padding: "4px 6px", borderRadius: "3px", color: "#343a40" }}>
                                                                  {group.groupName}
                                                                </div>
                                                                {group.investments.map((inv, iIdx) => (
                                                                  <div key={iIdx} style={{ marginTop: "6px" }}>
                                                                    <div style={{ fontSize: "12px", fontWeight: 500, padding: "2px 6px 2px 12px" }}>
                                                                      {inv.name}
                                                                    </div>
                                                                    {inv.subInvestments.map((sub, sIdx) => (
                                                                      <div key={sIdx} style={{ fontSize: "10px", borderBottom: "1px dotted #ccc", padding: "2px 6px 2px 22px" }}>
                                                                        {sub.name}
                                                                      </div>
                                                                    ))}
                                                                  </div>
                                                                ))}
                                                              </div>
                                                            ))}
                                                          </div>
                                                        </td>
                                                      );
                                                    }

                                                    // योजना column: show hierarchy -> योजना -> निवेश -> उप-निवेश (names only, no matra/dar)
                                                    if (col === "scheme_name") {
                                                      // Reuse common grouping structures so scheme column aligns
                                                      const groupsByVikasForSchemes = groupsByVikasCommon;
                                                      const vikasOrderForSchemes = vikasOrderCommon;

                                                      // Render similar structure as center column: centers grouped by vikas
                                                      return (
                                                        <td key={col} style={{ maxWidth: "520px", padding: '0px', verticalAlign: "top" }}>
                                                          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                                            {vikasOrderForSchemes.map((vk, vi) => {
                                                              const centers = Array.from(groupsByVikasForSchemes[vk] || []).sort();
                                                              const groupHeight = groupTotalHeightCommon(vk);

                                                              return (
                                                                <div key={`${vk}-schemes-${vi}`} style={{ paddingTop: 0, borderTop: vi === 0 ? 'none' : '2px solid #333', marginTop: 0 }}>
                                                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '6px 8px', background: '#fff', minHeight: `${groupHeight}px`, boxSizing: 'border-box', justifyContent: 'flex-start' }}>
                                                                      {centers.map((cn, ci) => {
                                                                      const schemes = Array.from(centerToSchemesCommon[cn] || []).sort();
                                                                      return (
                                                                          <div key={`${vk}-${cn}-${ci}`} style={{ padding: '4px 0', borderBottom: ci < centers.length - 1 ? '1px solid #eee' : 'none', fontSize: '12px', wordBreak: 'break-word' }}>
                                                                          {schemes.length > 0 ? (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                                                               {schemes.map((s, si) => {
                                                                                 const invs = Array.from((centerSchemeToInvestmentsCommon[cn] && centerSchemeToInvestmentsCommon[cn][s]) || []);
                                                                                 // Calculate total sub-investment count for this scheme
                                                                                 let subInvestmentsCount = 0;
                                                                                 invs.forEach((inv) => {
                                                                                   const subSet = (centerSchemeToSubInvestmentsCommon[cn] && centerSchemeToSubInvestmentsCommon[cn][s] && centerSchemeToSubInvestmentsCommon[cn][s][inv]) || new Set();
                                                                                   subInvestmentsCount += subSet.size;
                                                                                 });
                                                                                   if (invs.length > 0) {
                                                                                     // Show the scheme name once, then add blanks for alignment
                                                                                     return (
                                                                                       <div key={`scheme-block-${s}-${si}`} style={{ display: 'flex', flexDirection: 'column' }}>
                                                                                          <div key={`scheme-${s}-${si}`} style={{ padding: '2px 0', fontSize: '12px' }}>{s}</div>
                                                                                          {Array(subInvestmentsCount - 1).fill(0).map((_, inIdx) => (
                                                                                            <div key={`${s}-blank-${inIdx}`} style={{ padding: '2px 0', fontSize: '12px' }}>&nbsp;</div>
                                                                                          ))}
                                                                                         <div style={{ borderTop: '1px solid #e9ecef', margin: '6px 0' }} />
                                                                                       </div>
                                                                                     );
                                                                                   }
                                                                                   return (
                                                                                     <div key={`${s}-none`} style={{ padding: '2px 0', fontSize: '12px' }}>{s}</div>
                                                                                   );
                                                                               })}
                                                                            </div>
                                                                          ) : (
                                                                            <div style={{ color: '#666' }}>—</div>
                                                                          )}
                                                                        </div>
                                                                      );
                                                                    })}
                                                                  </div>
                                                                </div>
                                                              );
                                                            })}
                                                          </div>
                                                        </td>
                                                      );
                                                    }
                                                    // For vikas_khand_name, vidhan_sabha_name, center_name, source_of_receipt:
                                                    // show groups per value -> investment -> sub-investment (names only, no matra/dar)
                                                    if (
                                                      col === "vikas_khand_name" ||
                                                      col === "vidhan_sabha_name" ||
                                                      col === "center_name" ||
                                                      col === "source_of_receipt"
                                                    ) {
                                                        // Use precomputed grouping and heights so columns align
                                                        const groupsByVikas = groupsByVikasCommon;
                                                        const centerToSchemes = centerToSchemesCommon;
                                                        const perCenterHeight = perCenterHeightCommon;
                                                        const vikasOrder = vikasOrderCommon;
                                                        const groupTotalHeight = groupTotalHeightCommon;

                                                         if (col === "vidhan_sabha_name") {
                                                          // Render vidhan_sabha names grouped by value, with bold separator between groups
                                                          // Get unique vidhan_sabha values for this row
                                                          const vidhanSabhaValues = [...new Set(tableDataForValue.map((item) => item.vidhan_sabha_name).filter(Boolean))].sort();
                                                          
                                                          // Calculate total height for all vidhan sabha groups
                                                          const totalHeight = vidhanSabhaValues.reduce((sum, vs) => {
                                                            const centers = [...new Set(tableDataForValue.filter((item) => item.vidhan_sabha_name === vs).map((item) => item.center_name).filter(Boolean))];
                                                            return sum + centers.reduce((s, cn) => s + (perCenterHeight[cn] || (_lineHeight + _verticalPadding)), 0);
                                                          }, 0);
                                                          
                                                          return (
                                                            <td key={col} style={{ maxWidth: "260px", padding: 0, verticalAlign: "top" }}>
                                                              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                                                {vidhanSabhaValues.map((vs, i) => {
                                                                  const centers = [...new Set(tableDataForValue.filter((item) => item.vidhan_sabha_name === vs).map((item) => item.center_name).filter(Boolean))].sort();
                                                                  const groupHeight = centers.reduce((sum, cn) => sum + (perCenterHeight[cn] || (_lineHeight + _verticalPadding)), 0);
                                                                  
                                                                  return (
                                                                    <div key={vs} style={{ paddingTop: 0, marginTop: 0 }}>
                                                                      <div style={{
                                                                        padding: '6px 8px',
                                                                        fontWeight: '700',
                                                                        borderTop: i === 0 ? 'none' : '2px solid #333',
                                                                        background: '#fff',
                                                                        wordBreak: 'break-word',
                                                                        minHeight: `${groupHeight}px`,
                                                                        display: 'flex',
                                                                        alignItems: 'flex-start',
                                                                        boxSizing: 'border-box',
                                                                        margin: 0
                                                                      }}>
                                                                        {vs}
                                                                      </div>
                                                                    </div>
                                                                  );
                                                                })}
                                                              </div>
                                                            </td>
                                                          );
                                                        }

                                                        if (col === "vikas_khand_name") {
                                                          // Render vikas_khand names (bold), stacked and aligned to center groups
                                                          return (
                                                            <td key={col} style={{ maxWidth: "260px", padding: 0, verticalAlign: "top" }}>
                                                              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                                                {vikasOrder.map((vk, i) => (
                                                                  <div key={vk} style={{ paddingTop: 0, marginTop: 0 }}>
                                                                    <div style={{
                                                                      padding: '6px 8px',
                                                                      fontWeight: '700',
                                                                      borderTop: i === 0 ? 'none' : '2px solid #333',
                                                                      background: '#fff',
                                                                      wordBreak: 'break-word',
                                                                      minHeight: `${groupTotalHeight(vk)}px`,
                                                                      display: 'flex',
                                                                      alignItems: 'flex-start',
                                                                      boxSizing: 'border-box',
                                                                      margin: 0
                                                                    }}>
                                                                      {vk}
                                                                    </div>
                                                                  </div>
                                                                ))}
                                                              </div>
                                                            </td>
                                                          );
                                                        }

                                                        if (col === "center_name") {
                                                          // Render centers grouped by vikas_khand, with a bold separator between groups
                                                          return (
                                                            <td key={col} style={{ maxWidth: "520px", padding: 0, verticalAlign: "top" }}>
                                                              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                                                {vikasOrder.map((vk, i) => {
                                                                  const centers = Array.from(groupsByVikas[vk] || []);
                                                                  return (
                                                                    <div key={`${vk}-${i}`} style={{ paddingTop: 0, marginTop: 0 }}>
                                                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '6px 8px', background: '#fff', minHeight: `${groupTotalHeight(vk)}px`, justifyContent: 'flex-start', boxSizing: 'border-box', borderTop: i === 0 ? 'none' : '2px solid #333' }}>
                                                                        {centers.length > 0 ? centers.map((cn, ci) => (
                                                                          <div key={cn + ci} style={{ minHeight: `${perCenterHeight[cn] || (_lineHeight + _verticalPadding)}px`, padding: '4px 0', borderBottom: ci < centers.length - 1 ? '1px solid #eee' : 'none', fontSize: '12px', wordBreak: 'break-word', display: 'flex', alignItems: 'flex-start' }}>
                                                                            <div style={{ width: '100%' }}>{cn}</div>
                                                                          </div>
                                                                        )) : (
                                                                          <div style={{ padding: '4px 0', fontSize: '12px', color: '#666' }}>—</div>
                                                                        )}
                                                                      </div>
                                                                    </div>
                                                                  );
                                                                })}
                                                              </div>
                                                            </td>
                                                          );
                                                        }

                                                        if (col === "scheme_name") {
                                                          // Render schemes grouped by center, using same per-center heights
                                                            return (
                                                            <td key={col} style={{ maxWidth: "420px", padding: 0, verticalAlign: "top" }}>
                                                              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                                                  {vikasOrder.map((vk, i) => {
                                                                    const centers = Array.from(groupsByVikas[vk] || []).sort();
                                                                  return (
                                                                    <div key={`scheme-${vk}-${i}`} style={{ paddingTop: 0, marginTop: 0 }}>
                                                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '6px 8px', background: '#fff', minHeight: `${groupTotalHeight(vk)}px`, boxSizing: 'border-box', justifyContent: 'flex-start', borderTop: i === 0 ? 'none' : '2px solid #333' }}>
                                                                          {centers.length > 0 ? centers.map((cn, ci) => {
                                                                            const schemes = Array.from(centerToSchemes[cn] || []).sort();
                                                                          return (
                                                                            <div key={cn + ci} style={{ minHeight: `${perCenterHeight[cn] || (_lineHeight + _verticalPadding)}px`, padding: '4px 0', borderBottom: ci < centers.length - 1 ? '1px solid #eee' : 'none', fontSize: '12px', wordBreak: 'break-word', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                                                              {schemes.length > 0 ? schemes.map((s, si) => {
                                                                                const invs = Array.from((centerSchemeToInvestmentsCommon[cn] && centerSchemeToInvestmentsCommon[cn][s]) || []);
                                                                                if (invs.length > 0) {
                                                                                  // Show the scheme name once and a subtle separator after its block
                                                                                  return (
                                                                                    <div key={`scheme-block-${s}-${si}`} style={{ display: 'flex', flexDirection: 'column' }}>
                                                                                      <div key={`scheme-${s}-${si}`} style={{ padding: '2px 0', fontSize: '12px' }}>{s}</div>
                                                                                      {invs.slice(1).map((inv, inIdx) => (
                                                                                        <div key={`${s}-blank-${inIdx}`} style={{ padding: '2px 0', fontSize: '12px' }}>&nbsp;</div>
                                                                                      ))}
                                                                                      <div style={{ borderTop: '1px solid #eee', margin: '6px 0' }} />
                                                                                    </div>
                                                                                  );
                                                                                }
                                                                                return (
                                                                                  <div key={`${s}-none`} style={{ padding: '2px 0', fontSize: '12px' }}>{s}</div>
                                                                                );
                                                                              }) : (
                                                                                <div style={{ color: '#666' }}>—</div>
                                                                              )}
                                                                            </div>
                                                                          );
                                                                        }) : (
                                                                          <div style={{ padding: '4px 0', fontSize: '12px', color: '#666' }}>—</div>
                                                                        )}
                                                                      </div>
                                                                    </div>
                                                                  );
                                                                })}
                                                              </div>
                                                            </td>
                                                          );
                                                        }

                                                      // Default behavior for other columns
                                                      const groupedData = getColumnInvestmentHierarchy(checkedValue, col);
                                                      // Only show groups present in cellData
                                                      const allowedGroups = new Set(cellData.map((item) => item[col]));
                                                      return (
                                                        <td key={col} style={{ maxWidth: "350px" }}>
                                                          <div>
                                                            {groupedData
                                                              .filter((group) => allowedGroups.has(group.groupValue))
                                                              .map((group, groupIdx) => (
                                                                <div key={groupIdx} style={{ marginBottom: "8px" }}>
                                                                  <div style={{ fontSize: "12px", fontWeight: "bold", backgroundColor: "#e9ecef", padding: "4px 6px", borderRadius: "3px", color: "#495057" }}>{group.groupValue}</div>
                                                                  {group.investments.map((invItem, iIdx) => (
                                                                    <div key={iIdx} style={{ marginTop: "6px" }}>
                                                                      <div style={{ fontSize: "12px", fontWeight: 500, padding: "2px 6px 2px 12px" }}>
                                                                        <span>{invItem.investmentName}</span>
                                                                      </div>
                                                                      {invItem.subInvestments.map((subItem, subIdx) => (
                                                                        <div key={subIdx} style={{ fontSize: "10px", borderBottom: "1px dotted #ccc", padding: "2px 6px 2px 22px" }}>
                                                                          <span>{subItem.name}</span>
                                                                        </div>
                                                                      ))}
                                                                      {/* subtle separator after each scheme's investment block */}
                                                                      <div style={{ borderTop: '1px solid #f2f2f2', margin: '6px 0' }} />
                                                                    </div>
                                                                  ))}
                                                                </div>
                                                              ))}
                                                          </div>
                                                        </td>
                                                      );
                                                    }
                                                     // For sub_investment_name, show comma-separated sub-investments aligned with investment column
                                                    if (col === "sub_investment_name") {
                                                      // Use precomputed grouping/height structures (same as investment column)
                                                      const groupsByVikas = groupsByVikasCommon;
                                                      const centerToSchemes = centerToSchemesCommon;
                                                      const centerSchemeToInvestments = centerSchemeToInvestmentsCommon;
                                                      const centerSchemeToSubInvestments = centerSchemeToSubInvestmentsCommon;
                                                      const vikasOrder = vikasOrderCommon;
                                                      const perCenterHeight = perCenterHeightCommon;

                                                      return (
                                                        <td key={col} style={{ maxWidth: "300px", padding: 0, verticalAlign: "top" }}>
                                                          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                                            {vikasOrder.map((vk, i) => {
                                                              const centers = Array.from(groupsByVikas[vk] || []).sort();
                                                              return (
                                                                <div key={`sub-${vk}-${i}`} style={{ paddingTop: 0, marginTop: 0 }}>
                                                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '6px 8px', background: '#fff', minHeight: `${centers.reduce((sum, cn) => sum + (perCenterHeight[cn] || (_lineHeight + _verticalPadding)), 0)}px`, boxSizing: 'border-box', justifyContent: 'flex-start', borderTop: i === 0 ? 'none' : '2px solid #333' }}>
                                                                    {centers.length > 0 ? centers.map((cn, ci) => {
                                                                      const schemes = Array.from(centerToSchemes[cn] || []).sort();
                                                                      return (
                                                                        <div key={cn + ci} style={{ minHeight: `${perCenterHeight[cn] || (_lineHeight + _verticalPadding)}px`, padding: '4px 0', borderBottom: ci < centers.length - 1 ? '1px solid #eee' : 'none', fontSize: '12px', wordBreak: 'break-word', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                                                          {schemes.length > 0 ? schemes.map((s, si) => (
                                                                            <div key={`${s}-${si}`} style={{ padding: '2px 0', fontSize: '12px' }}>
                                                                              {Array.from((centerSchemeToInvestments[cn] && centerSchemeToInvestments[cn][s]) || []).length > 0 ? (
                                                                                <div>
                                                                                  {Array.from((centerSchemeToInvestments[cn] && centerSchemeToInvestments[cn][s]) || []).map((inv, inIdx) => {
                                                                                    const subInvestments = centerSchemeToSubInvestments[cn]?.[s]?.[inv];
                                                                                    const subInvArray = subInvestments ? Array.from(subInvestments).sort() : [];
                                                                                    return (
                                                                                      <div key={inIdx}>
                                                                                        {subInvArray.length > 0 ? (
                                                                                          subInvArray.map((sub, subIdx) => (
                                                                                            <div key={subIdx} style={{ padding: '1px 0', fontSize: '12px' }}>{sub}</div>
                                                                                          ))
                                                                                        ) : (
                                                                                          <div style={{ padding: '1px 0', fontSize: '12px', color: '#666' }}>—</div>
                                                                                        )}
                                                                                      </div>
                                                                                    );
                                                                                  })}
                                                                                </div>
                                                                              ) : (
                                                                                <div style={{ color: '#666' }}>—</div>
                                                                              )}
                                                                              <div style={{ borderTop: '1px solid #f2f2f2', margin: '6px 0' }} />
                                                                            </div>
                                                                          )) : (
                                                                            <div style={{ color: '#666' }}>—</div>
                                                                          )}
                                                                        </div>
                                                                      );
                                                                    }) : (
                                                                      <div style={{ padding: '4px 0', fontSize: '12px', color: '#666' }}>—</div>
                                                                    )}
                                                                  </div>
                                                                </div>
                                                              );
                                                            })}
                                                          </div>
                                                        </td>
                                                      );
                                                    }
                                                    // For investment_name, show names only (no matra/dar)
                                                    if (col === "investment_name") {
                                                      // Use precomputed grouping/height structures
                                                      const groupsByVikas = groupsByVikasCommon;
                                                      const centerToSchemes = centerToSchemesCommon;
                                                      const centerSchemeToInvestments = centerSchemeToInvestmentsCommon;
                                                      const vikasOrder = vikasOrderCommon;
                                                      const perCenterHeight = perCenterHeightCommon;

                                                      return (
                                                        <td key={col} style={{ maxWidth: "420px", padding: 0, verticalAlign: "top" }}>
                                                          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                                            {vikasOrder.map((vk, i) => {
                                                              const centers = Array.from(groupsByVikas[vk] || []).sort();
                                                              return (
                                                                <div key={`inv-${vk}-${i}`} style={{ paddingTop: 0, marginTop: 0 }}>
                                                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '6px 8px', background: '#fff', minHeight: `${centers.reduce((sum, cn) => sum + (perCenterHeight[cn] || (_lineHeight + _verticalPadding)), 0)}px`, boxSizing: 'border-box', justifyContent: 'flex-start', borderTop: i === 0 ? 'none' : '2px solid #333' }}>
                                                                    {centers.length > 0 ? centers.map((cn, ci) => {
                                                                      const schemes = Array.from(centerToSchemes[cn] || []).sort();
                                                                      return (
                                                                        <div key={cn + ci} style={{ minHeight: `${perCenterHeight[cn] || (_lineHeight + _verticalPadding)}px`, padding: '4px 0', borderBottom: ci < centers.length - 1 ? '1px solid #eee' : 'none', fontSize: '12px', wordBreak: 'break-word', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                                                          {schemes.length > 0 ? schemes.map((s, si) => (
                                                                            <div key={`${s}-${si}`} style={{ padding: '2px 0', fontSize: '12px' }}>
                                                                              {Array.from((centerSchemeToInvestments[cn] && centerSchemeToInvestments[cn][s]) || []).length > 0 ? (
                                                                                <div>
                                                                                   {Array.from((centerSchemeToInvestments[cn] && centerSchemeToInvestments[cn][s]) || []).map((inv, inIdx) => {
                                                                                     const subInvestments = centerSchemeToSubInvestmentsCommon[cn]?.[s]?.[inv];
                                                                                     const subInvArray = subInvestments ? Array.from(subInvestments).sort() : [];
                                                                                     return (
                                                                                       <div key={inIdx} style={{ display: 'flex', flexDirection: 'column' }}>
                                                                                         <div style={{ padding: '1px 0', fontSize: '12px' }}>{inv}</div>
                                                                                         {subInvArray.slice(1).map((sub, subIdx) => (
                                                                                           <div key={`${inv}-sub-blank-${subIdx}`} style={{ padding: '1px 0', fontSize: '12px' }}>&nbsp;</div>
                                                                                         ))}
                                                                                       </div>
                                                                                     );
                                                                                   })}
                                                                                </div>
                                                                              ) : (
                                                                                <div style={{ color: '#666' }}>—</div>
                                                                              )}
                                                                              <div style={{ borderTop: '1px solid #f2f2f2', margin: '6px 0' }} />
                                                                            </div>
                                                                          )) : (
                                                                            <div style={{ color: '#666' }}>—</div>
                                                                          )}
                                                                        </div>
                                                                      );
                                                                    }) : (
                                                                      <div style={{ padding: '4px 0', fontSize: '12px', color: '#666' }}>—</div>
                                                                    )}
                                                                  </div>
                                                                </div>
                                                              );
                                                            })}
                                                          </div>
                                                        </td>
                                                      );
                                                    }
                                                    // For all other expanded columns, show only values present in cellData
                                                    const uniqueValues = [
                                                      ...new Set(cellData.map((item) => item[col]).filter(Boolean)),
                                                    ];
                                                    return (
                                                      <td key={col} style={{ maxWidth: "200px" }}>
                                                        <div>
                                                          {uniqueValues.map((val, valIdx) => (
                                                            <div key={valIdx} style={{ fontSize: "12px" }}>{val}</div>
                                                          ))}
                                                        </div>
                                                      </td>
                                                    );
                                                    } else {
                                                      // If investment column, render investments vertically aligned to schemes
                                                      if (col === "investment_name") {
                                                        // Reuse common grouping/height structures computed above so non-expanded
                                                        // investment column aligns with the scheme and center columns.
                                                        const groupsByVikas = groupsByVikasCommon;
                                                        const centerToSchemes = centerToSchemesCommon;
                                                        const centerSchemeToInvestments = centerSchemeToInvestmentsCommon;
                                                        const vikasOrder = vikasOrderCommon;
                                                        const perCenterHeight = perCenterHeightCommon;

                                                        return (
                                                          <td key={col} style={{ maxWidth: "420px", padding: 0, verticalAlign: "top" }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                                              {vikasOrder.map((vk, i) => {
                                                                const centers = Array.from(groupsByVikas[vk] || []).sort();
                                                                return (
                                                                  <div key={`inv-nonexp-${vk}-${i}`} style={{ paddingTop: 0, marginTop: 0 }}>
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '6px 8px', background: '#fff', minHeight: `${centers.reduce((sum, cn) => sum + (perCenterHeight[cn] || (_lineHeight + _verticalPadding)), 0)}px`, boxSizing: 'border-box', justifyContent: 'flex-start', borderTop: i === 0 ? 'none' : '2px solid #333' }}>
                                                                      {centers.length > 0 ? centers.map((cn, ci) => {
                                                                        const schemes = Array.from(centerToSchemes[cn] || []).sort();
                                                                        return (
                                                                          <div key={cn + ci} style={{ minHeight: `${perCenterHeight[cn] || (_lineHeight + _verticalPadding)}px`, padding: '4px 0', borderBottom: ci < centers.length - 1 ? '1px solid #eee' : 'none', fontSize: '12px', wordBreak: 'break-word', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                                                                            {schemes.length > 0 ? schemes.map((s, si) => (
                                                                              <div key={`${s}-${si}`} style={{ padding: '2px 0', fontSize: '12px' }}>
                                                                                {Array.from((centerSchemeToInvestments[cn] && centerSchemeToInvestments[cn][s]) || []).length > 0 ? (
                                                                                  <div>
                                                                                   {Array.from((centerSchemeToInvestments[cn] && centerSchemeToInvestments[cn][s]) || []).map((inv, inIdx) => {
                                                                                     const subInvestments = centerSchemeToSubInvestmentsCommon[cn]?.[s]?.[inv];
                                                                                     const subInvArray = subInvestments ? Array.from(subInvestments).sort() : [];
                                                                                     return (
                                                                                       <div key={inIdx} style={{ display: 'flex', flexDirection: 'column' }}>
                                                                                         <div style={{ padding: '1px 0', fontSize: '12px' }}>{inv}</div>
                                                                                         {subInvArray.slice(1).map((sub, subIdx) => (
                                                                                           <div key={`${inv}-sub-blank-${subIdx}`} style={{ padding: '1px 0', fontSize: '12px' }}>&nbsp;</div>
                                                                                         ))}
                                                                                       </div>
                                                                                     );
                                                                                   })}
                                                                                    </div>
                                                                                ) : (
                                                                                  <div style={{ color: '#666' }}>—</div>
                                                                                )}
                                                                              </div>
                                                                            )) : (
                                                                              <div style={{ color: '#666' }}>—</div>
                                                                            )}
                                                                          </div>
                                                                        );
                                                                      }) : (
                                                                        <div style={{ padding: '4px 0', fontSize: '12px', color: '#666' }}>—</div>
                                                                      )}
                                                                    </div>
                                                                  </div>
                                                                );
                                                              })}
                                                            </div>
                                                          </td>
                                                        );
                                                      }

                                                      return (
                                                        <td key={col}>
                                                          {new Set(tableDataForValue.map((item) => item[col])).size}
                                                        </td>
                                                      );
                                                    }
                                                 })}
                                              {/* Breakdown Column - Shows matra/values line by line matching group column */}
                                              {tableColumnFilters.summary.includes(
                                                "आवंटित मात्रा"
                                              ) && (
                                                <td style={{ maxWidth: "200px", verticalAlign: "top" }}>
                                                  {(() => {
                                                    const breakdown = generateTotalBreakdown(tableDataForValue, summaryTotalBreakdownColumn);
                                                    const totalQty = tableDataForValue
                                                      .reduce((sum, item) => {
                                                        const qtyVal =
                                                          typeof item.allocated_quantity === "string" && item.allocated_quantity.includes(" / ")
                                                            ? parseFloat(item.allocated_quantity.split(" / ")[0]) || 0
                                                            : parseFloat(item.allocated_quantity) || 0;
                                                        return sum + qtyVal;
                                                      }, 0)
                                                      .toFixed(2);
                                                    
                                                    return (
                                                      <div>
                                                        {breakdown.map((group, gIdx) => (
                                                          <div key={gIdx} style={{ marginBottom: "10px" }}>
                                                            <div style={{ fontSize: "12px", fontWeight: "bold", backgroundColor: "#f1f3f5", padding: "4px 6px", borderRadius: "3px", color: "#343a40" }}>
                                                              {group.totals.allocated_quantity.toFixed(2)}
                                                            </div>
                                                            {group.investments.map((inv, iIdx) => (
                                                              <div key={iIdx} style={{ marginTop: "6px" }}>
                                                                <div style={{ fontSize: "12px", fontWeight: 500, padding: "2px 6px 2px 12px" }}>
                                                                  {inv.totals.allocated_quantity.toFixed(2)}{inv.unit && ` (${inv.unit})`}
                                                                </div>
                                                                {inv.subInvestments.map((sub, sIdx) => (
                                                                  <div key={sIdx} style={{ fontSize: "10px", borderBottom: "1px dotted #ccc", padding: "2px 6px 2px 22px" }}>
                                                                    {sub.totals.allocated_quantity.toFixed(2)}{sub.unit && ` (${sub.unit})`}
                                                                  </div>
                                                                ))}
                                                              </div>
                                                            ))}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    );
                                                  })()}
                                                </td>
                                              )}
                                              {tableColumnFilters.summary.includes(
                                                "कृषक धनराशि"
                                              ) && (
                                                <td style={{ maxWidth: "200px", verticalAlign: "top" }}>
                                                  {(() => {
                                                    const breakdown = generateTotalBreakdown(tableDataForValue, summaryTotalBreakdownColumn);
                                                    const totalAmt = tableDataForValue
                                                      .reduce(
                                                        (sum, item) =>
                                                          sum +
                                                          (parseFloat(item.amount_of_farmer_share) || 0),
                                                        0
                                                      )
                                                      .toFixed(2);
                                                    
                                                    return (
                                                      <div>
                                                        {breakdown.map((group, gIdx) => (
                                                          <div key={gIdx} style={{ marginBottom: "10px" }}>
                                                            <div style={{ fontSize: "12px", fontWeight: "bold", backgroundColor: "#f1f3f5", padding: "4px 6px", borderRadius: "3px", color: "#343a40" }}>
                                                              {group.totals.amount_of_farmer_share.toFixed(2)}
                                                            </div>
                                                            {group.investments.map((inv, iIdx) => (
                                                              <div key={iIdx} style={{ marginTop: "6px" }}>
                                                                <div style={{ fontSize: "12px", fontWeight: 500, padding: "2px 6px 2px 12px" }}>
                                                                  {inv.totals.amount_of_farmer_share.toFixed(2)}
                                                                </div>
                                                                {inv.subInvestments.map((sub, sIdx) => (
                                                                  <div key={sIdx} style={{ fontSize: "10px", borderBottom: "1px dotted #ccc", padding: "2px 6px 2px 22px" }}>
                                                                    {sub.totals.amount_of_farmer_share.toFixed(2)}
                                                                  </div>
                                                                ))}
                                                              </div>
                                                            ))}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    );
                                                  })()}
                                                </td>
                                              )}
                                              {tableColumnFilters.summary.includes(
                                                "सब्सिडी धनराशि"
                                              ) && (
                                                <td style={{ maxWidth: "200px", verticalAlign: "top" }}>
                                                  {(() => {
                                                    const breakdown = generateTotalBreakdown(tableDataForValue, summaryTotalBreakdownColumn);
                                                    const totalAmt = tableDataForValue
                                                      .reduce(
                                                        (sum, item) =>
                                                          sum +
                                                          (parseFloat(item.amount_of_subsidy) || 0),
                                                        0
                                                      )
                                                      .toFixed(2);
                                                    
                                                    return (
                                                      <div>
                                                        {breakdown.map((group, gIdx) => (
                                                          <div key={gIdx} style={{ marginBottom: "10px" }}>
                                                            <div style={{ fontSize: "12px", fontWeight: "bold", backgroundColor: "#f1f3f5", padding: "4px 6px", borderRadius: "3px", color: "#343a40" }}>
                                                              {group.totals.amount_of_subsidy.toFixed(2)}
                                                            </div>
                                                            {group.investments.map((inv, iIdx) => (
                                                              <div key={iIdx} style={{ marginTop: "6px" }}>
                                                                <div style={{ fontSize: "12px", fontWeight: 500, padding: "2px 6px 2px 12px" }}>
                                                                  {inv.totals.amount_of_subsidy.toFixed(2)}
                                                                </div>
                                                                {inv.subInvestments.map((sub, sIdx) => (
                                                                  <div key={sIdx} style={{ fontSize: "10px", borderBottom: "1px dotted #ccc", padding: "2px 6px 2px 22px" }}>
                                                                    {sub.totals.amount_of_subsidy.toFixed(2)}
                                                                  </div>
                                                                ))}
                                                              </div>
                                                            ))}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    );
                                                  })()}
                                                </td>
                                              )}
                                              {tableColumnFilters.summary.includes(
                                                "कुल राशि"
                                              ) && (
                                                <td style={{ maxWidth: "200px", verticalAlign: "top" }}>
                                                  {(() => {
                                                    const breakdown = generateTotalBreakdown(tableDataForValue, summaryTotalBreakdownColumn);
                                                    const totalAmt = tableDataForValue
                                                      .reduce(
                                                        (sum, item) =>
                                                          sum +
                                                          (parseFloat(item.total_amount) || 0),
                                                        0
                                                      )
                                                      .toFixed(2);
                                                    
                                                    return (
                                                      <div>
                                                        {breakdown.map((group, gIdx) => (
                                                          <div key={gIdx} style={{ marginBottom: "10px" }}>
                                                            <div style={{ fontSize: "12px", fontWeight: "bold", backgroundColor: "#f1f3f5", padding: "4px 6px", borderRadius: "3px", color: "#343a40" }}>
                                                              {group.totals.total_amount.toFixed(2)}
                                                            </div>
                                                            {group.investments.map((inv, iIdx) => (
                                                              <div key={iIdx} style={{ marginTop: "6px" }}>
                                                                <div style={{ fontSize: "12px", fontWeight: 500, padding: "2px 6px 2px 12px" }}>
                                                                  {inv.totals.total_amount.toFixed(2)}
                                                                </div>
                                                                {inv.subInvestments.map((sub, sIdx) => (
                                                                  <div key={sIdx} style={{ fontSize: "10px", borderBottom: "1px dotted #ccc", padding: "2px 6px 2px 22px" }}>
                                                                    {sub.totals.total_amount.toFixed(2)}
                                                                  </div>
                                                                ))}
                                                              </div>
                                                            ))}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    );
                                                  })()}
                                                </td>
                                              )}
                                            </tr>
                                          );
                                          });
                                        })()}
                                      </tbody>
                                      <tfoot>
                                        <tr>
                                          <td style={{ fontWeight: "bold" }}>
                                            कुल:
                                          </td>
                                          {tableColumnFilters.summary.includes(
                                            "कुल रिकॉर्ड"
                                          ) && (
                                            <td style={{ fontWeight: "bold" }}>
                                              {(() => {
                                                const anyEmptySelection = Object.values(summaryColumnValueFilters || {}).some((arr) => Array.isArray(arr) && arr.length === 0);
                                                const displayCheckedValues = (() => {
                                                  if (anyEmptySelection) return [];
                                                  return checkedValues.filter((checkedValue) => {
                                                    const rowsForValue = filteredData.filter(
                                                      (item) => item[currentFilter.column] === checkedValue
                                                    );
                                                    const selfSelected = summaryColumnValueFilters[currentFilter.column] || [];
                                                    if (selfSelected.length > 0 && !selfSelected.includes(checkedValue)) {
                                                      return false;
                                                    }
                                                    for (const [col, selectedVals] of Object.entries(summaryColumnValueFilters)) {
                                                      if (col === currentFilter.column) continue;
                                                      const sel = selectedVals || [];
                                                      if (sel.length > 0) {
                                                        const match = rowsForValue.some((row) => sel.includes(row[col]));
                                                        if (!match) return false;
                                                      }
                                                    }
                                                    return true;
                                                  });
                                                })();
                                                return displayCheckedValues.reduce(
                                                (sum, checkedValue) => {
                                                  const tableDataForValue =
                                                    filteredData.filter(
                                                      (item) =>
                                                        item[
                                                          currentFilter.column
                                                        ] === checkedValue
                                                    );
                                                  return (
                                                    sum +
                                                    tableDataForValue.length
                                                  );
                                                },
                                                0
                                              );
                                              })()}
                                            </td>
                                          )}
                                          {tableColumnOrder
                                            .filter(
                                              (col) =>
                                                col !== currentFilter.column &&
                                                    !columnDefs[col].hidden
                                            )
                                            .filter(
                                              (col) =>
                                                col !== "allocated_quantity" &&
                                                col !== "rate" &&
                                                col !==
                                                  "amount_of_farmer_share" &&
                                                col !== "amount_of_subsidy" &&
                                                col !== "total_amount"
                                            )
                                            .sort(
                                              (a, b) =>
                                                tableColumnOrder.indexOf(a) -
                                                tableColumnOrder.indexOf(b)
                                            )
                                            .filter((col) =>
                                              tableColumnFilters.summary.includes(
                                                columnDefs[col].label
                                              )
                                            )
                                            .map((col) => {
                                              const isExpanded =
                                                mainSummaryExpandedColumns[col];

                                              if (isExpanded) {
                                                // SPECIAL: If this column is the selected breakdown column, show names in same format as value columns
                                                if (col === summaryTotalBreakdownColumn) {
                                                  // Build header-filtered dataset across all visible groups
                                                  const displayCheckedValues = (() => {
                                                    const checkedValues = Object.keys(currentFilter.checked).filter((val) => currentFilter.checked[val]);
                                                    return checkedValues.filter((checkedValue) => {
                                                      const rowsForValue = filteredData.filter((item) => item[currentFilter.column] === checkedValue);
                                                      const selfSelected = summaryColumnValueFilters[currentFilter.column] || [];
                                                      if (selfSelected.length > 0 && !selfSelected.includes(checkedValue)) {
                                                        return false;
                                                      }
                                                      for (const [k, selectedVals] of Object.entries(summaryColumnValueFilters)) {
                                                        if (k === currentFilter.column) continue;
                                                        const sel = selectedVals || [];
                                                        if (sel.length > 0) {
                                                          const match = rowsForValue.some((row) => sel.includes(row[k]));
                                                          if (!match) return false;
                                                        }
                                                      }
                                                      return true;
                                                    });
                                                  })();
                                                  const headerFilteredAll = applySummaryHeaderFilters(filteredData).filter((row) => displayCheckedValues.includes(row[currentFilter.column]));
                                                  const breakdown = generateTotalBreakdown(headerFilteredAll, summaryTotalBreakdownColumn);
                                                  const totalCount = breakdown.length;
                                                  return (
                                                    <td key={col} style={{ maxWidth: "420px", verticalAlign: "top" }}>
                                                      <div>
                                                        <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "6px", padding: "3px 6px", backgroundColor: "#e7f1ff", borderRadius: "3px" }}>
                                                          कुल: {totalCount} {columnDefs[col]?.label || col}
                                                        </div>
                                                        <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                                                          {breakdown.map((group, gIdx) => (
                                                            <div key={gIdx} style={{ marginBottom: "10px" }}>
                                                              <div style={{ fontSize: "12px", fontWeight: "bold", backgroundColor: "#f1f3f5", padding: "4px 6px", borderRadius: "3px", color: "#343a40" }}>
                                                                {group.groupName}
                                                              </div>
                                                              {group.investments.map((inv, iIdx) => (
                                                                        <div key={iIdx} style={{ marginTop: "6px" }}>
                                                                      <div style={{ fontSize: "12px", fontWeight: 500, padding: "2px 6px 2px 12px" }}>
                                                                      {inv.name}
                                                                    </div>
                                                                  {inv.subInvestments.map((sub, sIdx) => (
                                                                    <div key={sIdx} style={{ fontSize: "10px", borderBottom: "1px dotted #ccc", padding: "2px 6px 2px 22px" }}>
                                                                      {sub.name}
                                                                    </div>
                                                                  ))}
                                                                </div>
                                                              ))}
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    </td>
                                                  );
                                                }
                                                // Totals row expanded for योजना: show all schemes inline (names only, no matra/dar)
                                                if (col === "scheme_name") {
                                                  // Build header-filtered dataset across all visible groups
                                                  const displayCheckedValues = (() => {
                                                    const checkedValues = Object.keys(currentFilter.checked).filter((val) => currentFilter.checked[val]);
                                                    return checkedValues.filter((checkedValue) => {
                                                      const rowsForValue = filteredData.filter((item) => item[currentFilter.column] === checkedValue);
                                                      const selfSelected = summaryColumnValueFilters[currentFilter.column] || [];
                                                      if (selfSelected.length > 0 && !selfSelected.includes(checkedValue)) {
                                                        return false;
                                                      }
                                                      for (const [k, selectedVals] of Object.entries(summaryColumnValueFilters)) {
                                                        if (k === currentFilter.column) continue;
                                                        const sel = selectedVals || [];
                                                        if (sel.length > 0) {
                                                          const match = rowsForValue.some((row) => sel.includes(row[k]));
                                                          if (!match) return false;
                                                        }
                                                      }
                                                      return true;
                                                    });
                                                  })();
                                                  const headerFilteredAll = applySummaryHeaderFilters(filteredData).filter((row) => displayCheckedValues.includes(row[currentFilter.column]));
                                                  const allSchemes = [...new Set(headerFilteredAll.map((item) => item.scheme_name).filter(Boolean))];
                                                  // Group scheme -> investment -> sub-investment (names only)
                                                  const grouped = {};
                                                  headerFilteredAll.forEach((item) => {
                                                    const scheme = item.scheme_name;
                                                    const investment = item.investment_name;
                                                    const subInvestment = item.sub_investment_name;
                                                    if (!scheme || !investment || !subInvestment) return;
                                                    if (!grouped[scheme]) grouped[scheme] = {};
                                                    if (!grouped[scheme][investment]) {
                                                      grouped[scheme][investment] = { subs: new Set() };
                                                    }
                                                    grouped[scheme][investment].subs.add(subInvestment);
                                                  });
                                                  const schemeTotals = Object.entries(grouped).map(([schemeName, investments]) => ({
                                                    schemeName,
                                                    investments: Object.entries(investments).map(([invName, info]) => ({
                                                      investmentName: invName,
                                                      subInvestments: [...info.subs].map((subName) => ({ name: subName })),
                                                    })),
                                                  }));
                                                  return (
                                                    <td key={col} style={{ maxWidth: "420px" }}>
                                                      <div style={{ fontSize: "12px", marginBottom: "6px" }}>
                                                        <span style={{ fontWeight: 600 }}>सभी:</span> {allSchemes.join(", ") || "-"}
                                                      </div>
                                                      <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                                                        {schemeTotals.map((schemeItem, sIdx) => (
                                                          <div key={sIdx} style={{ marginBottom: "10px" }}>
                                                            <div
                                                              style={{
                                                                fontSize: "12px",
                                                                fontWeight: "bold",
                                                                backgroundColor: "#f1f3f5",
                                                                padding: "4px 6px",
                                                                borderRadius: "3px",
                                                                color: "#343a40",
                                                              }}
                                                            >
                                                              {schemeItem.schemeName}
                                                            </div>
                                                            {schemeItem.investments.map((invItem, iIdx) => (
                                                              <div key={iIdx} style={{ marginTop: "6px" }}>
                                                                <div
                                                                  style={{
                                                                    fontSize: "12px",
                                                                    fontWeight: 500,
                                                                    padding: "2px 6px 2px 12px",
                                                                  }}
                                                                >
                                                                  <span>{invItem.investmentName}</span>
                                                                </div>
                                                                {invItem.subInvestments.map((subItem, subIdx) => (
                                                                  <div
                                                                    key={subIdx}
                                                                    style={{
                                                                      fontSize: "10px",
                                                                      borderBottom: "1px dotted #ccc",
                                                                      padding: "2px 6px 2px 22px",
                                                                    }}
                                                                  >
                                                                    <span>{subItem.name}</span>
                                                                  </div>
                                                                ))}
                                                              </div>
                                                            ))}
                                                            <div style={{ borderTop: '1px solid #f2f2f2', marginTop: 8 }} />
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </td>
                                                  );
                                                }
                                                // Totals row expanded for center/vikas/vidhan/supplier: show all values (names only, no matra/dar)
                                                if (
                                                  col === "center_name" ||
                                                  col === "vikas_khand_name" ||
                                                  col === "vidhan_sabha_name" ||
                                                  col === "source_of_receipt"
                                                ) {
                                                  // Build header-filtered dataset across all visible groups
                                                  const displayCheckedValues = (() => {
                                                    const checkedValues = Object.keys(currentFilter.checked).filter((val) => currentFilter.checked[val]);
                                                    return checkedValues.filter((checkedValue) => {
                                                      const rowsForValue = filteredData.filter((item) => item[currentFilter.column] === checkedValue);
                                                      const selfSelected = summaryColumnValueFilters[currentFilter.column] || [];
                                                      if (selfSelected.length > 0 && !selfSelected.includes(checkedValue)) {
                                                        return false;
                                                      }
                                                      for (const [k, selectedVals] of Object.entries(summaryColumnValueFilters)) {
                                                        if (k === currentFilter.column) continue;
                                                        const sel = selectedVals || [];
                                                        if (sel.length > 0) {
                                                          const match = rowsForValue.some((row) => sel.includes(row[k]));
                                                          if (!match) return false;
                                                        }
                                                      }
                                                      return true;
                                                    });
                                                  })();
                                                  const headerFilteredAll = applySummaryHeaderFilters(filteredData).filter((row) => displayCheckedValues.includes(row[currentFilter.column]));
                                                  const allValues = [...new Set(headerFilteredAll.map((item) => item[col]).filter(Boolean))];
                                                  // Group by investment -> sub-investment (names only, no matra/dar)
                                                  const invGrouped = {};
                                                  headerFilteredAll.forEach((item) => {
                                                    const inv = item.investment_name;
                                                    const sub = item.sub_investment_name;
                                                    if (!inv || !sub) return;
                                                    if (!invGrouped[inv]) invGrouped[inv] = { subs: new Set() };
                                                    invGrouped[inv].subs.add(sub);
                                                  });
                                                  const groupedTotals = Object.entries(invGrouped).map(([invName, info]) => ({
                                                    investmentName: invName,
                                                    subInvestments: [...info.subs].map((subName) => ({ name: subName })),
                                                  }));
                                                  return (
                                                    <td key={col} style={{ maxWidth: "400px" }}>
                                                      <div style={{ fontSize: "12px", marginBottom: "6px" }}>
                                                        <span style={{ fontWeight: 600 }}>सभी:</span> {allValues.join(", ") || "-"}
                                                      </div>
                                                      <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                                                        {groupedTotals.map((invItem, iIdx) => (
                                                          <div key={iIdx} style={{ marginTop: "6px" }}>
                                                            <div
                                                              style={{
                                                                fontSize: "12px",
                                                                fontWeight: 500,
                                                                padding: "2px 6px 2px 12px",
                                                              }}
                                                            >
                                                              <span>{invItem.investmentName}</span>
                                                            </div>
                                                            {invItem.subInvestments.map((subItem, subIdx) => (
                                                              <div
                                                                key={subIdx}
                                                                style={{
                                                                  fontSize: "10px",
                                                                  borderBottom: "1px dotted #ccc",
                                                                  padding: "2px 6px 2px 22px",
                                                                }}
                                                              >
                                                                <span>{subItem.name}</span>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </td>
                                                  );
                                                }
                                                // For sub_investment_name, show comma-separated sub-investments aligned with investment column
                                                if (col === "sub_investment_name") {
                                                  // Build header-filtered dataset across all visible groups
                                                  const displayCheckedValues = (() => {
                                                    const checkedValues = Object.keys(currentFilter.checked).filter((val) => currentFilter.checked[val]);
                                                    return checkedValues.filter((checkedValue) => {
                                                      const rowsForValue = filteredData.filter((item) => item[currentFilter.column] === checkedValue);
                                                      const selfSelected = summaryColumnValueFilters[currentFilter.column] || [];
                                                      if (selfSelected.length > 0 && !selfSelected.includes(checkedValue)) {
                                                        return false;
                                                      }
                                                      for (const [k, selectedVals] of Object.entries(summaryColumnValueFilters)) {
                                                        if (k === currentFilter.column) continue;
                                                        const sel = selectedVals || [];
                                                        if (sel.length > 0) {
                                                          const match = rowsForValue.some((row) => sel.includes(row[k]));
                                                          if (!match) return false;
                                                        }
                                                      }
                                                      return true;
                                                    });
                                                  })();
                                                  const headerFilteredAll = applySummaryHeaderFilters(filteredData).filter((row) => displayCheckedValues.includes(row[currentFilter.column]));
                                                  
                                                  // Build investment -> sub-investment mapping
                                                  const invToSubInvestments = {};
                                                  headerFilteredAll.forEach((item) => {
                                                    const inv = item.investment_name;
                                                    const sub = item.sub_investment_name;
                                                    if (!inv || !sub) return;
                                                    if (!invToSubInvestments[inv]) invToSubInvestments[inv] = new Set();
                                                    invToSubInvestments[inv].add(sub);
                                                  });
                                                  
                                                  // Get unique investments and show sub-investments one below the other
                                                  const uniqueInvestments = [...new Set(headerFilteredAll.map((item) => item.investment_name).filter(Boolean))];
                                                  const allSubInvestments = uniqueInvestments.map((inv) => ({
                                                    investment: inv,
                                                    subInvestments: invToSubInvestments[inv] ? Array.from(invToSubInvestments[inv]).sort() : [],
                                                  }));
                                                  
                                                  return (
                                                    <td
                                                      key={col}
                                                      style={{
                                                        maxWidth: "300px",
                                                      }}
                                                    >
                                                      <div
                                                        style={{
                                                          maxHeight: "200px",
                                                          overflowY: "auto",
                                                        }}
                                                      >
                                                        {allSubInvestments.map((group, groupIdx) => (
                                                          <div key={groupIdx}>
                                                            {group.subInvestments.map((sub, subIdx) => (
                                                              <div
                                                                key={subIdx}
                                                                style={{
                                                                  fontSize: "10px",
                                                                  borderBottom: subIdx < group.subInvestments.length - 1 ? "1px solid #ddd" : "none",
                                                                  padding: "2px 5px",
                                                                }}
                                                              >
                                                                <span>{sub}</span>
                                                              </div>
                                                            ))}
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </td>
                                                  );
                                                }
                                                
                                                // For investment_name, show names only (no matra/dar)
                                                if (col === "investment_name") {
                                                  // Build header-filtered dataset across all visible groups
                                                  const displayCheckedValues = (() => {
                                                    const checkedValues = Object.keys(currentFilter.checked).filter((val) => currentFilter.checked[val]);
                                                    return checkedValues.filter((checkedValue) => {
                                                      const rowsForValue = filteredData.filter((item) => item[currentFilter.column] === checkedValue);
                                                      const selfSelected = summaryColumnValueFilters[currentFilter.column] || [];
                                                      if (selfSelected.length > 0 && !selfSelected.includes(checkedValue)) {
                                                        return false;
                                                      }
                                                      for (const [k, selectedVals] of Object.entries(summaryColumnValueFilters)) {
                                                        if (k === currentFilter.column) continue;
                                                        const sel = selectedVals || [];
                                                        if (sel.length > 0) {
                                                          const match = rowsForValue.some((row) => sel.includes(row[k]));
                                                          if (!match) return false;
                                                        }
                                                      }
                                                      return true;
                                                    });
                                                  })();
                                                  const headerFilteredAll = applySummaryHeaderFilters(filteredData).filter((row) => displayCheckedValues.includes(row[currentFilter.column]));
                                                  // Get unique investment names only
                                                  const uniqueInvestments = [...new Set(headerFilteredAll.map((item) => item[col]).filter(Boolean))];
                                                  return (
                                                    <td
                                                      key={col}
                                                      style={{
                                                        maxWidth: "250px",
                                                      }}
                                                    >
                                                      <div
                                                        style={{
                                                          maxHeight: "150px",
                                                          overflowY: "auto",
                                                        }}
                                                      >
                                                        {uniqueInvestments.map(
                                                          (name, valIdx) => (
                                                            <div
                                                              key={valIdx}
                                                              style={{
                                                                fontSize: "12px",
                                                                borderBottom: "1px dotted #ccc",
                                                                padding: "2px 0",
                                                              }}
                                                            >
                                                              <span style={{ fontWeight: "500" }}>{name}</span>
                                                            </div>
                                                          )
                                                        )}
                                                      </div>
                                                    </td>
                                                  );
                                                }
                                                
                                                // Get all unique values for this column from the entire filtered data
                                                const uniqueValues =
                                                  getMainSummaryUniqueValues(
                                                    col,
                                                    null
                                                  );

                                                return (
                                                  <td
                                                    key={col}
                                                    style={{
                                                      maxWidth: "200px",
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        maxHeight: "100px",
                                                        overflowY: "auto",
                                                      }}
                                                    >
                                                      {uniqueValues.map(
                                                        (val, valIdx) => (
                                                          <div
                                                            key={valIdx}
                                                            style={{
                                                              fontSize: "12px",
                                                            }}
                                                          >
                                                            {val}
                                                          </div>
                                                        )
                                                      )}
                                                    </div>
                                                  </td>
                                                );
                                              } else {
                                                return (
                                                  <td key={col}>
                                                    {(() => {
                                                      // Apply header filters and restrict to displayCheckedValues groups
                                                      const displayCheckedValues = (() => {
                                                        const checkedValues = Object.keys(currentFilter.checked).filter((val) => currentFilter.checked[val]);
                                                        return checkedValues.filter((checkedValue) => {
                                                          const rowsForValue = filteredData.filter((item) => item[currentFilter.column] === checkedValue);
                                                          const selfSelected = summaryColumnValueFilters[currentFilter.column] || [];
                                                          if (selfSelected.length > 0 && !selfSelected.includes(checkedValue)) {
                                                            return false;
                                                          }
                                                          for (const [k, selectedVals] of Object.entries(summaryColumnValueFilters)) {
                                                            if (k === currentFilter.column) continue;
                                                            const sel = selectedVals || [];
                                                            if (sel.length > 0) {
                                                              const match = rowsForValue.some((row) => sel.includes(row[k]));
                                                              if (!match) return false;
                                                            }
                                                          }
                                                          return true;
                                                        });
                                                      })();
                                                      const headerFiltered = applySummaryHeaderFilters(filteredData).filter((row) => displayCheckedValues.includes(row[currentFilter.column]));
                                                      return new Set(headerFiltered.map((item) => item[col])).size;
                                                    })()}
                                                  </td>
                                                );
                                              }
                                            })}

                                          {tableColumnFilters.summary.includes(
                                            "आवंटित मात्रा"
                                          ) && (
                                            <td style={{ fontWeight: "bold", verticalAlign: "top", maxWidth: "200px" }}>
                                              {(() => {
                                                const anyEmptySelection = Object.values(summaryColumnValueFilters || {}).some((arr) => Array.isArray(arr) && arr.length === 0);
                                                const displayCheckedValues = (() => {
                                                  if (anyEmptySelection) return [];
                                                  return checkedValues.filter((checkedValue) => {
                                                    const rowsForValue = filteredData.filter(
                                                      (item) => item[currentFilter.column] === checkedValue
                                                    );
                                                    const selfSelected = summaryColumnValueFilters[currentFilter.column] || [];
                                                    if (selfSelected.length > 0 && !selfSelected.includes(checkedValue)) {
                                                      return false;
                                                    }
                                                    for (const [col, selectedVals] of Object.entries(summaryColumnValueFilters)) {
                                                      if (col === currentFilter.column) continue;
                                                      const sel = selectedVals || [];
                                                      if (sel.length > 0) {
                                                        const match = rowsForValue.some((row) => sel.includes(row[col]));
                                                        if (!match) return false;
                                                      }
                                                    }
                                                    return true;
                                                  });
                                                })();
                                                const headerFilteredAll = applySummaryHeaderFilters(filteredData).filter((row) => displayCheckedValues.includes(row[currentFilter.column]));
                                                const grandTotal = headerFilteredAll.reduce((sum, item) => {
                                                  const qtyVal = typeof item.allocated_quantity === "string" && item.allocated_quantity.includes(" / ")
                                                    ? parseFloat(item.allocated_quantity.split(" / ")[0]) || 0
                                                    : parseFloat(item.allocated_quantity) || 0;
                                                  return sum + qtyVal;
                                                }, 0).toFixed(2);
                                                const breakdown = generateTotalBreakdown(headerFilteredAll, summaryTotalBreakdownColumn);
                                                return (
                                                  <div>
                                                    <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "6px", padding: "3px 6px", backgroundColor: "#e7f1ff", borderRadius: "3px" }}>
                                                      कुल: {grandTotal}
                                                    </div>
                                                    <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                                                      {breakdown.map((group, gIdx) => (
                                                        <div key={gIdx} style={{ marginBottom: "10px" }}>
                                                                <div style={{ fontSize: "12px", fontWeight: "bold", backgroundColor: "#f1f3f5", padding: "4px 6px", borderRadius: "3px", color: "#343a40" }}>
                                                              {group.totals.allocated_quantity.toFixed(2)}
                                                            </div>
                                                            {group.investments.map((inv, iIdx) => (
                                                              <div key={iIdx} style={{ marginTop: "6px" }}>
                                                                <div style={{ fontSize: "12px", fontWeight: 500, padding: "2px 6px 2px 12px" }}>
                                                                  {inv.totals.allocated_quantity.toFixed(2)}{inv.unit && ` (${inv.unit})`}
                                                                </div>
                                                              {inv.subInvestments.map((sub, sIdx) => (
                                                                <div key={sIdx} style={{ fontSize: "10px", borderBottom: "1px dotted #ccc", padding: "2px 6px 2px 22px" }}>
                                                                  {sub.totals.allocated_quantity.toFixed(2)}{sub.unit && ` (${sub.unit})`}
                                                                </div>
                                                              ))}
                                                            </div>
                                                          ))}
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                );
                                              })()}
                                            </td>
                                          )}
                                          {tableColumnFilters.summary.includes(
                                            "कृषक धनराशि"
                                          ) && (
                                            <td style={{ fontWeight: "bold", verticalAlign: "top", maxWidth: "200px" }}>
                                              {(() => {
                                                const displayCheckedValues = (() => {
                                                  return checkedValues.filter((checkedValue) => {
                                                    const rowsForValue = filteredData.filter(
                                                      (item) => item[currentFilter.column] === checkedValue
                                                    );
                                                    const selfSelected = summaryColumnValueFilters[currentFilter.column] || [];
                                                    if (selfSelected.length > 0 && !selfSelected.includes(checkedValue)) {
                                                      return false;
                                                    }
                                                    for (const [col, selectedVals] of Object.entries(summaryColumnValueFilters)) {
                                                      if (col === currentFilter.column) continue;
                                                      const sel = selectedVals || [];
                                                      if (sel.length > 0) {
                                                        const match = rowsForValue.some((row) => sel.includes(row[col]));
                                                        if (!match) return false;
                                                      }
                                                    }
                                                    return true;
                                                  });
                                                })();
                                                const headerFilteredAll = applySummaryHeaderFilters(filteredData).filter((row) => displayCheckedValues.includes(row[currentFilter.column]));
                                                const grandTotal = headerFilteredAll.reduce((sum, item) => sum + (parseFloat(item.amount_of_farmer_share) || 0), 0).toFixed(2);
                                                const breakdown = generateTotalBreakdown(headerFilteredAll, summaryTotalBreakdownColumn);
                                                return (
                                                  <div>
                                                    <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "6px", padding: "3px 6px", backgroundColor: "#e7f1ff", borderRadius: "3px" }}>
                                                      कुल: {grandTotal}
                                                    </div>
                                                    <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                                                      {breakdown.map((group, gIdx) => (
                                                        <div key={gIdx} style={{ marginBottom: "10px" }}>
                                                              <div style={{ fontSize: "12px", fontWeight: "bold", backgroundColor: "#f1f3f5", padding: "4px 6px", borderRadius: "3px", color: "#343a40" }}>
                                                            {group.totals.amount_of_farmer_share.toFixed(2)}
                                                          </div>
                                                          {group.investments.map((inv, iIdx) => (
                                                            <div key={iIdx} style={{ marginTop: "6px" }}>
                                                              <div style={{ fontSize: "12px", fontWeight: 500, padding: "2px 6px 2px 12px" }}>
                                                                {inv.totals.amount_of_farmer_share.toFixed(2)}
                                                              </div>
                                                              {inv.subInvestments.map((sub, sIdx) => (
                                                                <div key={sIdx} style={{ fontSize: "10px", borderBottom: "1px dotted #ccc", padding: "2px 6px 2px 22px" }}>
                                                                  {sub.totals.amount_of_farmer_share.toFixed(2)}
                                                                </div>
                                                              ))}
                                                            </div>
                                                          ))}
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                );
                                              })()}
                                            </td>
                                          )}
                                          {tableColumnFilters.summary.includes(
                                            "सब्सिडी धनराशि"
                                          ) && (
                                            <td style={{ fontWeight: "bold", verticalAlign: "top", maxWidth: "200px" }}>
                                              {(() => {
                                                const displayCheckedValues = (() => {
                                                  return checkedValues.filter((checkedValue) => {
                                                    const rowsForValue = filteredData.filter(
                                                      (item) => item[currentFilter.column] === checkedValue
                                                    );
                                                    const selfSelected = summaryColumnValueFilters[currentFilter.column] || [];
                                                    if (selfSelected.length > 0 && !selfSelected.includes(checkedValue)) {
                                                      return false;
                                                    }
                                                    for (const [col, selectedVals] of Object.entries(summaryColumnValueFilters)) {
                                                      if (col === currentFilter.column) continue;
                                                      const sel = selectedVals || [];
                                                      if (sel.length > 0) {
                                                        const match = rowsForValue.some((row) => sel.includes(row[col]));
                                                        if (!match) return false;
                                                      }
                                                    }
                                                    return true;
                                                  });
                                                })();
                                                const headerFilteredAll = applySummaryHeaderFilters(filteredData).filter((row) => displayCheckedValues.includes(row[currentFilter.column]));
                                                const grandTotal = headerFilteredAll.reduce((sum, item) => sum + (parseFloat(item.amount_of_subsidy) || 0), 0).toFixed(2);
                                                const breakdown = generateTotalBreakdown(headerFilteredAll, summaryTotalBreakdownColumn);
                                                return (
                                                  <div>
                                                    <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "6px", padding: "3px 6px", backgroundColor: "#e7f1ff", borderRadius: "3px" }}>
                                                      कुल: {grandTotal}
                                                    </div>
                                                    <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                                                      {breakdown.map((group, gIdx) => (
                                                        <div key={gIdx} style={{ marginBottom: "10px" }}>
                                                              <div style={{ fontSize: "12px", fontWeight: "bold", backgroundColor: "#f1f3f5", padding: "4px 6px", borderRadius: "3px", color: "#343a40" }}>
                                                            {group.totals.amount_of_subsidy.toFixed(2)}
                                                          </div>
                                                          {group.investments.map((inv, iIdx) => (
                                                            <div key={iIdx} style={{ marginTop: "6px" }}>
                                                              <div style={{ fontSize: "12px", fontWeight: 500, padding: "2px 6px 2px 12px" }}>
                                                                {inv.totals.amount_of_subsidy.toFixed(2)}
                                                              </div>
                                                              {inv.subInvestments.map((sub, sIdx) => (
                                                                <div key={sIdx} style={{ fontSize: "10px", borderBottom: "1px dotted #ccc", padding: "2px 6px 2px 22px" }}>
                                                                  {sub.totals.amount_of_subsidy.toFixed(2)}
                                                                </div>
                                                              ))}
                                                            </div>
                                                          ))}
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                );
                                              })()}
                                            </td>
                                          )}
                                          {tableColumnFilters.summary.includes(
                                            "कुल राशि"
                                          ) && (
                                            <td style={{ fontWeight: "bold", verticalAlign: "top", maxWidth: "200px" }}>
                                              {(() => {
                                                const displayCheckedValues = (() => {
                                                  return checkedValues.filter((checkedValue) => {
                                                    const rowsForValue = filteredData.filter(
                                                      (item) => item[currentFilter.column] === checkedValue
                                                    );
                                                    const selfSelected = summaryColumnValueFilters[currentFilter.column] || [];
                                                    if (selfSelected.length > 0 && !selfSelected.includes(checkedValue)) {
                                                      return false;
                                                    }
                                                    for (const [col, selectedVals] of Object.entries(summaryColumnValueFilters)) {
                                                      if (col === currentFilter.column) continue;
                                                      const sel = selectedVals || [];
                                                      if (sel.length > 0) {
                                                        const match = rowsForValue.some((row) => sel.includes(row[col]));
                                                        if (!match) return false;
                                                      }
                                                    }
                                                    return true;
                                                  });
                                                })();
                                                const headerFilteredAll = applySummaryHeaderFilters(filteredData).filter((row) => displayCheckedValues.includes(row[currentFilter.column]));
                                                const grandTotal = headerFilteredAll.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0).toFixed(2);
                                                const breakdown = generateTotalBreakdown(headerFilteredAll, summaryTotalBreakdownColumn);
                                                return (
                                                  <div>
                                                    <div style={{ fontSize: "13px", fontWeight: "bold", marginBottom: "6px", padding: "3px 6px", backgroundColor: "#e7f1ff", borderRadius: "3px" }}>
                                                      कुल: {grandTotal}
                                                    </div>
                                                    <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                                                      {breakdown.map((group, gIdx) => (
                                                        <div key={gIdx} style={{ marginBottom: "10px" }}>
                                                              <div style={{ fontSize: "12px", fontWeight: "bold", backgroundColor: "#f1f3f5", padding: "4px 6px", borderRadius: "3px", color: "#343a40" }}>
                                                            {group.totals.total_amount.toFixed(2)}
                                                          </div>
                                                          {group.investments.map((inv, iIdx) => (
                                                            <div key={iIdx} style={{ marginTop: "6px" }}>
                                                              <div style={{ fontSize: "12px", fontWeight: 500, padding: "2px 6px 2px 12px" }}>
                                                                {inv.totals.total_amount.toFixed(2)}
                                                              </div>
                                                              {inv.subInvestments.map((sub, sIdx) => (
                                                                <div key={sIdx} style={{ fontSize: "10px", borderBottom: "1px dotted #ccc", padding: "2px 6px 2px 22px" }}>
                                                                  {sub.totals.total_amount.toFixed(2)}
                                                                </div>
                                                              ))}
                                                            </div>
                                                          ))}
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                );
                                              })()}
                                            </td>
                                          )}
                                        </tr>
                                      </tfoot>
                                      </Table>
                                    </div>
                                    {/* Replace the additional tables rendering section with this updated version: */}
                                    {additionalTables.map((table, index) => (
                                      <div key={index} className="mt-4">
                                        {/* Scheme filter for Vidhan Sabha Investment Table */}
                                        {table.type === 'vidhanSabhaInvestment' && (
                                          <div className="mb-3">
                                            <Form.Group>
                                              <Form.Label>योजना चुनें</Form.Label>
                                              <Select
                                                isMulti
                                                options={filteredTableData ? [...new Set(filteredTableData.map(item => item.scheme_name).filter(Boolean))].map(scheme => ({ value: scheme, label: scheme })) : []}
                                                value={vidhanSabhaSchemeFilter.map(scheme => ({ value: scheme, label: scheme }))}
                                                onChange={(selected) => setVidhanSabhaSchemeFilter(selected ? selected.map(s => s.value) : [])}
                                                placeholder="योजना चुनें"
                                              />
                                            </Form.Group>
                                          </div>
                                        )}
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                          <div className="d-flex align-items-center gap-2 table-heading">
                                            <h5 className="mb-0">
                                              {table.heading}
                                            </h5>
                                            {table.type === 'vidhanSabhaInvestment' && vidhanSabhaSchemeFilter.length > 0 && (
                                              <div className="mt-1">
                                                <small className="text-muted">चयनित योजनाएं: {vidhanSabhaSchemeFilter.join(', ')}</small>
                                              </div>
                                            )}
                                            {table.isAllocationTable && (
                                              <small className="text-muted ms-2">
                                                ({(() => {
                                                  const mat = allocationTableToggles[index]?.matra;
                                                  const ika = allocationTableToggles[index]?.ikai;
                                                  if (mat && ika) return "मात्रा/इकाई";
                                                  if (ika) return "इकाई";
                                                  if (mat) return "मात्रा";
                                                  return "";
                                                })()})
                                              </small>
                                            )}
                                            {/* Grouping selector for Vidhan Sabha Investment Table */}
                                            {table.type === 'vidhanSabhaInvestment' && (
                                              <div className="ms-3 d-flex gap-2">
                                                <Form.Select
                                                  size="sm"
                                                  value={vidhanSabhaGrouping}
                                                  onChange={(e) => setVidhanSabhaGrouping(e.target.value)}
                                                  style={{ minWidth: '150px' }}
                                                >
                                                  <option value="center_name">केंद्र</option>
                                                  <option value="vidhan_sabha_name">विधानसभा</option>
                                                  <option value="vikas_khand_name">विकास खंड</option>
                                                </Form.Select>
                                                <Form.Select
                                                  size="sm"
                                                  value={vidhanSabhaColumnType}
                                                  onChange={(e) => setVidhanSabhaColumnType(e.target.value)}
                                                  style={{ minWidth: '150px' }}
                                                >
                                                  <option value="investment_name">निवेश</option>
                                                  <option value="sub_investment_name">उप-निवेश</option>
                                                </Form.Select>
                                              </div>
                                            )}
                                            {table.type === 'vidhanSabhaInvestment' && (
                                              <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                  setIsRotated((prev) => {
                                                    const newArr = [...prev];
                                                    newArr[index] = !newArr[index];
                                                    return newArr;
                                                  })
                                                }
                                              >
                                                <RiRepeatLine /> Rotate
                                              </Button>
                                            )}
                                            {/* Add toggle button for allocation tables */}
                                            {table.isAllocationTable && (
                                              <>
                                                <Button
                                                  variant={allocationTableToggles[index]?.matra ? "primary" : "outline-primary"}
                                                  size="sm"
                                                  onClick={() => toggleAllocationTableDisplay(index, "matra")}
                                                >
                                                  मात्रा
                                                </Button>
                                                <Button
                                                  variant={allocationTableToggles[index]?.ikai ? "primary" : "outline-primary"}
                                                  size="sm"
                                                  className="ms-1"
                                                  onClick={() => toggleAllocationTableDisplay(index, "ikai")}
                                                >
                                                  इकाई
                                                </Button>
                                              </>
                                            )}
                                            {/* Hide Filter dropdown when table is rotated */}
                                            {!isRotated[index] && (
                                            <div className="dropdown">
                                              <button
                                                className="btn btn-secondary dropdown-toggle drop-option"
                                                type="button"
                                                onClick={() => {
                                                  const filterIndex = `additional_${index}`;
                                                  toggleDetailedDropdown(
                                                    filterIndex
                                                  );
                                                }}
                                              >
                                                <BiFilter /> Filter
                                              </button>
                                              {detailedDropdownOpen[
                                                `additional_${index}`
                                              ] && (
                                                <div
                                                  className="dropdown-menu show"
                                                  style={{
                                                    position: "absolute",
                                                    top: "100%",
                                                    zIndex: 1000,
                                                    maxHeight: "250px",
                                                    overflowY: "auto",
                                                  }}
                                                >
                                                  <div className="dropdown-item">
                                                    <FormCheck
                                                      className="check-box"
                                                      type="checkbox"
                                                      id={`select_all_additional_${index}`}
                                                      label={
                                                        // When rotated, use additionalTableColumnFilters counts if present
                                                        (isRotated[index]
                                                          ? (() => {
                                                              const allCols = table.columns.slice(1).filter(col => 
                                                                !(table.isAllocationTable && col.endsWith("_dar")) &&
                                                                !(table.isAllocationTable && col.endsWith("_farmer")) &&
                                                                !(table.isAllocationTable && col.endsWith("_subsidy"))
                                                              );
                                                              return (additionalTableColumnFilters[index] && additionalTableColumnFilters[index].length === allCols.length) ? "सभी हटाएं" : "सभी चुनें";
                                                            })()
                                                          : (additionalTableFilters[index]?.allSelected ? "सभी हटाएं" : "सभी चुनें"))
                                                      }
                                                      checked={
                                                        isRotated[index]
                                                          ? (() => {
                                                              const allCols = table.columns.slice(1).filter(col => 
                                                                !(table.isAllocationTable && col.endsWith("_dar")) &&
                                                                !(table.isAllocationTable && col.endsWith("_farmer")) &&
                                                                !(table.isAllocationTable && col.endsWith("_subsidy"))
                                                              );
                                                              return additionalTableColumnFilters[index] ? additionalTableColumnFilters[index].length === allCols.length : true;
                                                            })()
                                                          : (additionalTableFilters[index]?.allSelected || false)
                                                      }
                                                      onChange={() => {
                                                        if (isRotated[index]) {
                                                          // Toggle all rows (which are original columns.slice(1)) via additionalTableColumnFilters
                                                          handleAdditionalTableColumnFilterChange(index, "SELECT_ALL");
                                                        } else {
                                                          handleAdditionalTableFilterChange(index, "SELECT_ALL");
                                                        }
                                                      }}
                                                    />
                                                  </div>
                                                  {(() => {
                                                    if (isRotated[index]) {
                                                      // When rotated, list the original column keys (these become rows in rotated view)
                                                      // Include summary columns like "आवंटित मात्रा", "कृषक धनराशि", etc.
                                                      // Only filter out hidden columns like _dar, _farmer, _subsidy
                                                      const values = table.columns.slice(1).filter(col => 
                                                        !(table.isAllocationTable && col.endsWith("_dar")) &&
                                                        !(table.isAllocationTable && col.endsWith("_farmer")) &&
                                                        !(table.isAllocationTable && col.endsWith("_subsidy"))
                                                      );
                                                      return values.map((val) => {
                                                        const isChecked = additionalTableColumnFilters[index]
                                                          ? additionalTableColumnFilters[index].includes(val)
                                                          : true;
                                                        return (
                                                          <div key={val} className="dropdown-item">
                                                            <FormCheck
                                                              className="check-box"
                                                              type="checkbox"
                                                              id={`additional_${index}_${val}`}
                                                              label={val}
                                                              checked={isChecked}
                                                              onChange={() => handleAdditionalTableColumnFilterChange(index, val)}
                                                            />
                                                          </div>
                                                        );
                                                      });
                                                    } else {
                                                      // Not rotated: behave as before (list first-column row values)
                                                      // Filter out "कुल" row from the list
                                                      const rows = (table.originalData || table.data).filter(row => row[table.columns[0]] !== "कुल");
                                                      return rows.map((row) => {
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
                                                              onChange={() => handleAdditionalTableFilterChange(index, rowValue)}
                                                            />
                                                          </div>
                                                        );
                                                      });
                                                    }
                                                  })()}
                                                </div>
                                              )}
                                            </div>
                                            )}
                                            {/* Hide ColumnFilter when table is rotated */}
                                            {!isRotated[index] && (
                                            <>
                                            {(() => {
                                              const isTableRotated = isRotated[index] || false;
                                              let columnsForFilter = table.columns;
                                              if (isTableRotated) {
                                                // Use originalData to get all rows, then apply row filter
                                                const sourceData = table.originalData || table.data;
                                                const allRowValues = sourceData
                                                  .filter((row) => row[table.columns[0]] !== "कुल")
                                                  .map((row) => row[table.columns[0]]);
                                                
                                                // Apply additionalTableFilters (row selection before rotation)
                                                const selectedRowValues = additionalTableFilters[index]?.selectedValues || allRowValues;
                                                const visibleRowValues = allRowValues.filter(val => selectedRowValues.includes(val));
                                                
                                                columnsForFilter = [table.columns[0], ...visibleRowValues, "कुल"];
                                              }

                                              return (
                                                <ColumnFilter
                                                  tableId={`additional_${index}`}
                                                  columns={columnsForFilter}
                                                  selectedColumns={
                                                    tableColumnFilters.additional[index] || columnsForFilter
                                                  }
                                                  onColumnToggle={(column) =>
                                                    handleAdditionalTableColumnToggle(index, column)
                                                  }
                                                  onToggleAll={() =>
                                                    handleAdditionalTableToggleAllColumns(index, columnsForFilter)
                                                  }
                                                />
                                              );
                                            })()}
                                            </>
                                            )}
                                            {table.isAllocationTable && (
                                              <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() =>
                                                  setIsRotated((prev) => {
                                                    const newArr = [...prev];
                                                    newArr[index] = !newArr[index];
                                                    return newArr;
                                                  })
                                                }
                                              >
                                                <RiRepeatLine /> Rotate
                                              </Button>
                                            )}
                                          </div>
                                          <div className="d-flex gap-2">
                                            <Button
                                              variant="danger"
                                              size="sm"
                                              onClick={() =>
                                                addAdditionalTableToExport(
                                                  table,
                                                  "pdf",
                                                  index
                                                )
                                              }
                                              className="d-flex align-items-center pdf-add-btn gap-1"
                                            >
                                              <RiFilePdfLine /> PDF में जोड़ें
                                            </Button>
                                            <Button
                                              variant="success"
                                              size="sm"
                                              onClick={() =>
                                                addAdditionalTableToExport(
                                                  table,
                                                  "excel",
                                                  index
                                                )
                                              }
                                              className="d-flex align-items-center exel-add-btn gap-1"
                                            >
                                              <RiFileExcelLine /> Excel में
                                              जोड़ें
                                            </Button>
                                            <Button
                                              variant="link"
                                              size="sm"
                                              className="text-danger p-0"
                                              onClick={() =>
                                                setAdditionalTables((prev) =>
                                                  prev.filter(
                                                    (_, i) => i !== index
                                                  )
                                                )
                                              }
                                            >
                                              <RiDeleteBinLine />
                                            </Button>
                                          </div>
                                        </div>
                                        <div
                                          className="table-responsive"
                                          style={{ overflowX: "auto" }}
                                        >
                                          <Table
                                            striped
                                            bordered
                                            hover
                                            className="table-thead-style"
                                          >
                                            <thead className="table-thead">
                                              <tr>
                                                {(() => {
                                                  const isTableRotated =
                                                    isRotated[index] || false;
                                                  if (isTableRotated) {
                                                    // Use table.data directly (already filtered by row filter before rotation)
                                                    const filteredData = table.data.filter((row) => row[table.columns[0]] !== "कुल");
                                                    
                                                    // Get visible row values from the already filtered data
                                                    const visibleRowValues = filteredData.map((row) => row[table.columns[0]]);

                                                    // Build transposed table columns from the visible data
                                                    const transposedTableColumns = [table.columns[0], ...visibleRowValues, "कुल"];

                                                    // All transposed columns are visible (no filtering after rotation)
                                                    const visibleTransposed = transposedTableColumns;

                                                    return visibleTransposed.map((col, idx) => (
                                                      <th key={idx}>
                                                        {(() => {
                                                          if (!table.isAllocationTable || col !== "आवंटित मात्रा") return col;
                                                          const darSel = allocationTableToggles[index]?.dar;
                                                          const matraSel = allocationTableToggles[index]?.matra;
                                                          const ikaiSel = allocationTableToggles[index]?.ikai;
                                                          if (matraSel && ikaiSel && darSel) return "आवंटित मात्रा/इकाई/दर";
                                                          if (matraSel && ikaiSel) return "आवंटित मात्रा/इकाई";
                                                          if (ikaiSel && darSel) return "इकाई/दर";
                                                          if (matraSel && darSel) return "आवंटित मात्रा/दर";
                                                          if (ikaiSel) return "इकाई";
                                                          if (darSel) return "आवंटित दर";
                                                          return "आवंटित मात्रा";
                                                        })()}
                                                      </th>
                                                    ));
                                                  } else {
                                                    const visibleColumns =
                                                      tableColumnFilters
                                                        .additional[index] ||
                                                      table.columns;
                                                    return visibleColumns.map(
                                                      (col, idx) => (
                                                        <th key={idx}>
                                                          {(() => {
                                                            if (!table.isAllocationTable || col !== "आवंटित मात्रा") return col;
                                                            const darSel = allocationTableToggles[index]?.dar;
                                                            const matraSel = allocationTableToggles[index]?.matra;
                                                            const ikaiSel = allocationTableToggles[index]?.ikai;
                                                            if (matraSel && ikaiSel && darSel) return "आवंटित मात्रा/इकाई/दर";
                                                            if (matraSel && ikaiSel) return "आवंटित मात्रा/इकाई";
                                                            if (ikaiSel && darSel) return "इकाई/दर";
                                                            if (matraSel && darSel) return "आवंटित मात्रा/दर";
                                                            if (ikaiSel) return "इकाई";
                                                            if (darSel) return "आवंटित दर";
                                                            return "आवंटित मात्रा";
                                                          })()}
                                                          {!table.isAllocationTable &&
                                                            table.type !== 'vidhanSabhaInvestment' &&
                                                            col !==
                                                              table
                                                                .columns[0] &&
                                                            col !==
                                                              "कुल रिकॉर्ड" &&
                                                            col !==
                                                              "आवंटित मात्रा" &&
                                                            col !==
                                                              "कृषक धनराशि" &&
                                                            col !==
                                                              "सब्सिडी धनराशि" &&
                                                            col !==
                                                              "कुल राशि" && (
                                                              <Button
                                                                variant="link"
                                                                size="sm"
                                                                className="p-0 ms-1"
                                                                style={{
                                                                  fontSize:
                                                                    "10px",
                                                                  textDecoration:
                                                                    "underline",
                                                                }}
                                                                onClick={() =>
                                                                  toggleColumnExpansion(
                                                                    index,
                                                                    col
                                                                  )
                                                                }
                                                              >
                                                                {expandedColumns[
                                                                  `${index}_${col}`
                                                                ]
                                                                  ? "Hide"
                                                                  : "Show"}
                                                              </Button>
                                                            )}
                                                        </th>
                                                      )
                                                    );
                                                  }
                                                })()}
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {(() => {
                                                const isTableRotated =
                                                  isRotated[index] || false;
                                                const showDar = table.isAllocationTable && allocationTableToggles[index]?.dar;
                                                const showMatra = table.isAllocationTable && allocationTableToggles[index]?.matra;
                                                const showIkai = table.isAllocationTable && allocationTableToggles[index]?.ikai;

                                                if (isTableRotated) {
                                                  // Rotated table code with dar/matra toggle support
                                                  // Use table.data directly (already filtered by row filter before rotation)
                                                  const filteredData = table.data.filter((r) => r[table.columns[0]] !== "कुल");

                                                  // Get visible row values from the already filtered data
                                                  const visibleRowValues = filteredData.map((r) => r[table.columns[0]]);

                                                  // Build transposed table columns from the visible data
                                                  const transposedTableColumns = [table.columns[0], ...visibleRowValues, "कुल"];

                                                  // Get visible columns from tableColumnFilters (columns visible before rotation)
                                                  const visibleTransposed = transposedTableColumns;

                                                  // Get visible dynamic columns (columns that were visible before rotation, excluding summary columns)
                                                  const allClickedCols = table.columns.slice(1).filter((col) => 
                                                    !(table.isAllocationTable && col.endsWith("_dar")) &&
                                                    !(table.isAllocationTable && col.endsWith("_farmer")) &&
                                                    !(table.isAllocationTable && col.endsWith("_subsidy"))
                                                  );
                                                  
                                                  // Only show columns that were visible in the original table (from tableColumnFilters)
                                                  const visibleColumnsBeforeRotation = tableColumnFilters.additional[index] || table.columns;
                                                  const visibleClickedCols = allClickedCols.filter((col) => 
                                                    visibleColumnsBeforeRotation.includes(col)
                                                  );
                                                  
                                                  // Get the visible dynamic columns (non-summary columns) for calculating summary values
                                                  const visibleDynamicCols = visibleClickedCols.filter(col => !col.startsWith("कुल") && col !== "आवंटित मात्रा" && col !== "कृषक धनराशि" && col !== "सब्सिडी धनराशि");

                                                  const transposedData = visibleClickedCols.map((col) => {
                                                    const row = { [table.columns[0]]: col };
                                                    
                                                    // Check if this is a summary column
                                                    const isSummaryCol = col.startsWith("कुल") || col === "आवंटित मात्रा" || col === "कृषक धनराशि" || col === "सब्सिडी धनराशि";

                                                    // For each visible transposed column (i.e., visible original rows), map value
                                                    visibleTransposed.forEach((newCol) => {
                                                      if (newCol === table.columns[0] || newCol === "कुल") return; // skip header label and total placeholder
                                                      const dataRow = filteredData.find((r) => r[table.columns[0]] === newCol);
                                                      if (!dataRow) return;

                                                      if (table.isAllocationTable) {
                                                        if (isSummaryCol) {
                                                          // For summary columns, calculate the value based on visible dynamic columns
                                                          // Same calculation as in non-rotated table
                                                          if (col === "आवंटित मात्रा") {
                                                            const matraTotal = visibleDynamicCols.reduce((s, c) => s + parseFloat(dataRow[c] || 0), 0).toFixed(2);
                                                            const darTotal = visibleDynamicCols.reduce((s, c) => s + parseFloat(dataRow[`${c}_dar`] || 0), 0).toFixed(2);
                                                            if (showMatra && showDar) row[newCol] = `${matraTotal} / ${darTotal}`;
                                                            else if (showDar) row[newCol] = darTotal;
                                                            else row[newCol] = matraTotal;
                                                          } else if (col === "कृषक धनराशि") {
                                                            row[newCol] = visibleDynamicCols.reduce((s, c) => s + parseFloat(dataRow[`${c}_farmer`] || 0), 0).toFixed(2);
                                                          } else if (col === "सब्सिडी धनराशि") {
                                                            row[newCol] = visibleDynamicCols.reduce((s, c) => s + parseFloat(dataRow[`${c}_subsidy`] || 0), 0).toFixed(2);
                                                          } else if (col === "कुल राशि") {
                                                            row[newCol] = visibleDynamicCols.reduce((s, c) => s + parseFloat(dataRow[`${c}_dar`] || 0), 0).toFixed(2);
                                                          } else {
                                                            row[newCol] = dataRow[col] !== undefined ? String(dataRow[col]) : "0";
                                                          }
                                                        } else {
                                                          // Get raw numeric values - avoid double formatting if value already contains "/"
                                                          let matraVal = dataRow[col];
                                                          let darVal = dataRow[`${col}_dar`];
                                                          let ikaiVal = dataRow[`${col}_ikai`] || dataRow[`${col}_unit`] || "";

                                                          // If matraVal already contains "/" it's been formatted, extract the first number
                                                          if (matraVal !== undefined && String(matraVal).includes(" / ")) {
                                                            const parts = String(matraVal).split(" / ");
                                                            matraVal = parts[0];
                                                            if (darVal === undefined) darVal = parts[1] || parts[0];
                                                            if (!ikaiVal && parts.length === 3) ikaiVal = parts[1];
                                                          } else {
                                                            matraVal = matraVal !== undefined ? String(matraVal) : "0";
                                                          }

                                                          // If darVal is undefined, use raw dar value or fallback
                                                          if (darVal !== undefined) {
                                                            if (String(darVal).includes(" / ")) {
                                                              darVal = String(darVal).split(" / ")[1] || String(darVal).split(" / ")[0];
                                                            } else {
                                                              darVal = String(darVal);
                                                            }
                                                          } else {
                                                            darVal = matraVal;
                                                          }

                                                          // Try deriving ikai if missing
                                                          if ((!ikaiVal || ikaiVal === "") && table) {
                                                            ikaiVal = findUnitForRowCol(dataRow, col, table) || "";
                                                          }

                                                          row[newCol] = formatAllocationValue(matraVal, ikaiVal, darVal, showMatra, showIkai, showDar);
                                                        }
                                                      } else {
                                                        row[newCol] = dataRow[col] || "";
                                                      }
                                                    });

                                                    // Add total column (कुल) - sum over all visible rows in the rotated table
                                                        if (visibleTransposed.includes("कुल")) {
                                                      // sum only over visible rows (which are now columns in rotated view)
                                                      // filteredData already contains only the visible rows
                                                        if (table.isAllocationTable) {
                                                        if (isSummaryCol) {
                                                          // For summary columns, sum the calculated summary values across all rows
                                                            if (col === "आवंटित मात्रा") {
                                                            const matraTotal = filteredData.reduce((s, r) => {
                                                              return s + visibleDynamicCols.reduce((rs, c) => rs + parseFloat(r[c] || 0), 0);
                                                            }, 0).toFixed(2);
                                                            const darTotal = filteredData.reduce((s, r) => {
                                                              return s + visibleDynamicCols.reduce((rs, c) => rs + parseFloat(r[`${c}_dar`] || 0), 0);
                                                            }, 0).toFixed(2);
                                                            const ikaiTotal = filteredData.reduce((s, r) => {
                                                              return s + visibleDynamicCols.reduce((rs, c) => rs + parseFloat(r[`${c}_ikai`] || r[`${c}_unit`] || 0), 0);
                                                            }, 0).toFixed(2);
                                                            row["कुल"] = formatAllocationValue(matraTotal, ikaiTotal, darTotal, showMatra, showIkai, showDar);
                                                          } else if (col === "कृषक धनराशि") {
                                                            row["कुल"] = filteredData.reduce((s, r) => {
                                                              return s + visibleDynamicCols.reduce((rs, c) => rs + parseFloat(r[`${c}_farmer`] || 0), 0);
                                                            }, 0).toFixed(2);
                                                          } else if (col === "सब्सिडी धनराशि") {
                                                            row["कुल"] = filteredData.reduce((s, r) => {
                                                              return s + visibleDynamicCols.reduce((rs, c) => rs + parseFloat(r[`${c}_subsidy`] || 0), 0);
                                                            }, 0).toFixed(2);
                                                          } else if (col === "कुल राशि") {
                                                            row["कुल"] = filteredData.reduce((s, r) => {
                                                              return s + visibleDynamicCols.reduce((rs, c) => rs + parseFloat(r[`${c}_dar`] || 0), 0);
                                                            }, 0).toFixed(2);
                                                          } else {
                                                            const total = filteredData.reduce((s, r) => s + (parseFloat(r[col]) || 0), 0).toFixed(2);
                                                            row["कुल"] = total;
                                                          }
                                                        } else {
                                                          // Calculate totals - extract raw numeric values if already formatted
                                                          const matraTotal = filteredData.reduce((s, r) => {
                                                            let val = r[col];
                                                            if (val !== undefined && String(val).includes(" / ")) {
                                                              val = String(val).split(" / ")[0];
                                                            }
                                                            return s + (parseFloat(val) || 0);
                                                          }, 0).toFixed(2);
                                                          const darTotal = filteredData.reduce((s, r) => {
                                                            let val = r[`${col}_dar`];
                                                            if (val === undefined) {
                                                              // Try to get from formatted value
                                                              let mainVal = r[col];
                                                              if (mainVal !== undefined && String(mainVal).includes(" / ")) {
                                                                val = String(mainVal).split(" / ")[1] || String(mainVal).split(" / ")[0];
                                                              } else {
                                                                val = mainVal;
                                                              }
                                                            } else if (String(val).includes(" / ")) {
                                                              val = String(val).split(" / ")[1] || String(val).split(" / ")[0];
                                                            }
                                                            return s + (parseFloat(val) || 0);
                                                          }, 0).toFixed(2);
                                                          if (showMatra && showDar) row["कुल"] = `${matraTotal} / ${darTotal}`;
                                                          else if (showDar) row["कुल"] = darTotal;
                                                          else row["कुल"] = matraTotal;
                                                        }
                                                      } else {
                                                        const totalVal = filteredData.reduce((s, r) => s + (parseFloat(r[col]) || 0), 0).toFixed(2);
                                                        row["कुल"] = totalVal;
                                                      }
                                                    }

                                                    return row;
                                                  });
                                                  return transposedData.map((row, rowIndex) => (
                                                    <tr key={rowIndex}>
                                                      {(visibleTransposed || []).map((col, colIdx) => (
                                                        <td key={colIdx}>
                                                          {col === table.columns[0] 
                                                            ? getDynamicColumnHeader(row[col], showMatra, showDar, table.isAllocationTable)
                                                            : (row[col] !== undefined ? row[col] : "")}
                                                        </td>
                                                      ))}
                                                    </tr>
                                                  ));
                                                } else {
                                                  const visibleColumns =
                                                    tableColumnFilters
                                                      .additional[index] ||
                                                    table.columns;
                                                  // When rendering non-rotated allocation tables, compute per-row totals from currently visible dynamic columns
                                                  const visibleDynamicCols = (tableColumnFilters.additional[index] && tableColumnFilters.additional[index].length > 0)
                                                    ? tableColumnFilters.additional[index].filter((c) => c !== table.columns[0] && !c.startsWith("कुल") && c !== "आवंटित मात्रा" && c !== "कृषक धनराशि" && c !== "सब्सिडी धनराशि")
                                                    : table.columns.filter((c) => c !== table.columns[0] && !c.startsWith("कुल") && c !== "आवंटित मात्रा" && c !== "कृषक धनराशि" && c !== "सब्सिडी धनराशि");

                                                  return table.data
                                                    .filter((row) => table.type === 'vidhanSabhaInvestment' || row[table.columns[0]] !== "कुल")
                                                    .map((row, rowIndex) => (
                                                      <tr 
                                                        key={rowIndex} 
                                                        style={row[table.columns[0]] === "कुल" ? { fontWeight: "bold", backgroundColor: "#f2f2f2" } : {}}
                                                      >
                                                        {visibleColumns.includes(table.columns[0]) && (
                                                          <td>
                                                            {row[table.columns[0]]}
                                                          </td>
                                                        )}
                                                        {table.isAllocationTable ? (
                                                          // For allocation tables, show matra, dar or both separated by '/'
                                                          <>
                                                            {visibleDynamicCols.map((col, colIdx) => (
                                                              <td key={colIdx}>
                                                                {(() => {
                                                                  // Extract raw numeric values - avoid double formatting
                                                                  let matraVal = row[col];
                                                                  let darVal = row[`${col}_dar`];
                                                                  let ikaiVal = row[`${col}_ikai`] || row[`${col}_unit`] || "";
                                                                  
                                                                  // If matraVal already contains "/" it's been formatted, extract the first number
                                                                  if (matraVal !== undefined && String(matraVal).includes(" / ")) {
                                                                    const parts = String(matraVal).split(" / ");
                                                                    matraVal = parts[0];
                                                                    if (darVal === undefined) darVal = parts[1] || parts[0];
                                                                    if (!ikaiVal && parts.length === 3) ikaiVal = parts[1];
                                                                  } else {
                                                                    matraVal = matraVal !== undefined ? String(matraVal) : "0";
                                                                  }
                                                                  
                                                                  if (darVal === undefined) {
                                                                    darVal = matraVal;
                                                                  } else if (String(darVal).includes(" / ")) {
                                                                    darVal = String(darVal).split(" / ")[1] || String(darVal).split(" / ")[0];
                                                                  } else {
                                                                    darVal = String(darVal);
                                                                  }
                                                                  
                                                                  // Try deriving ikai if missing
                                                                  if ((!ikaiVal || ikaiVal === "") && table) {
                                                                    ikaiVal = findUnitForRowCol(row, col, table) || "";
                                                                  }
                                                                  
                                                                  return formatAllocationValue(matraVal, ikaiVal, darVal, showMatra, showIkai, showDar);
                                                                })()}
                                                              </td>
                                                            ))}

                                                            {visibleColumns.includes("आवंटित मात्रा") && (
                                                              <td>
                                                                {(() => {
                                                                  // Compute row total from visible dynamic cols - extract raw values
                                                                  const matraTotal = visibleDynamicCols.reduce((s, col) => {
                                                                    let val = row[col];
                                                                    if (val !== undefined && String(val).includes(" / ")) {
                                                                      val = String(val).split(" / ")[0];
                                                                    }
                                                                    return s + parseFloat(val || 0);
                                                                  }, 0).toFixed(2);
                                                                  const darTotal = visibleDynamicCols.reduce((s, col) => {
                                                                    let val = row[`${col}_dar`];
                                                                    if (val === undefined) {
                                                                      let mainVal = row[col];
                                                                      if (mainVal !== undefined && String(mainVal).includes(" / ")) {
                                                                        val = String(mainVal).split(" / ")[1] || String(mainVal).split(" / ")[0];
                                                                      } else {
                                                                        val = mainVal;
                                                                      }
                                                                    }
                                                                    return s + parseFloat(val || 0);
                                                                  }, 0).toFixed(2);
                                                                  const ikaiTotal = visibleDynamicCols.reduce((s, col) => {
                                                                    return s + parseFloat(row[`${col}_ikai`] || row[`${col}_unit`] || 0);
                                                                  }, 0).toFixed(2);
                                                                  return formatAllocationValue(matraTotal, ikaiTotal, darTotal, showMatra, showIkai, showDar);
                                                                })()}
                                                              </td>
                                                            )}

                                                            {visibleColumns.includes("कृषक धनराशि") && (
                                                              <td>
                                                                {(() => visibleDynamicCols.reduce((s, col) => s + parseFloat(row[`${col}_farmer`] || 0), 0).toFixed(2))()}
                                                              </td>
                                                            )}

                                                            {visibleColumns.includes("सब्सिडी धनराशि") && (
                                                              <td>
                                                                {(() => visibleDynamicCols.reduce((s, col) => s + parseFloat(row[`${col}_subsidy`] || 0), 0).toFixed(2))()}
                                                              </td>
                                                            )}

                                                            {visibleColumns.includes("कुल राशि") && (
                                                              <td>
                                                                {(() => visibleDynamicCols.reduce((s, col) => s + parseFloat(row[`${col}_dar`] || 0), 0).toFixed(2))()}
                                                              </td>
                                                            )}
                                                          </>
                                                        ) : (
                                                          <>
                                                            {visibleColumns
                                                              .filter(
                                                                (col) =>
                                                                  col !==
                                                                    table
                                                                      .columns[0] &&
                                                                  col !==
                                                                    "कुल रिकॉर्ड" &&
                                                                  col !==
                                                                    "आवंटित मात्रा" &&
                                                                  col !==
                                                                    "कृषक धनराशि" &&
                                                                  col !==
                                                                    "सब्सिडी धनराशि" &&
                                                                  col !==
                                                                    "कुल राशि"
                                                              )
                                                              .map(
                                                                (
                                                                  col,
                                                                  colIdx
                                                                ) => {
                                                                  // Check if this column is expanded to show values instead of count
                                                                  const isExpanded =
                                                                    expandedColumns[
                                                                      `${index}_${col}`
                                                                    ];
                                                                  const columnKey =
                                                                    Object.keys(
                                                                      columnDefs
                                                                    ).find(
                                                                      (k) =>
                                                                        columnDefs[
                                                                          k
                                                                        ]
                                                                          .label ===
                                                                        col
                                                                    );

                                                                  if (
                                                                    isExpanded &&
                                                                    columnKey
                                                                  ) {
                                                                    // Get the current filtered data for this row
                                                                    const currentFilteredData =
                                                                      tableData.filter(
                                                                        (
                                                                          item
                                                                        ) => {
                                                                          for (let filter of filterStack) {
                                                                            if (
                                                                              !filter
                                                                                .checked[
                                                                                item[
                                                                                  filter
                                                                                    .column
                                                                                ]
                                                                              ]
                                                                            )
                                                                              return false;
                                                                          }
                                                                          return (
                                                                            item[
                                                                              table
                                                                                .columnKey
                                                                            ] ===
                                                                            row[
                                                                              table
                                                                                .columns[0]
                                                                            ]
                                                                          );
                                                                        }
                                                                      );

                                                                    // Special handling for उप-निवेश column - group by निवेश
                                                                    if (columnKey === "sub_investment_name") {
                                                                      // Group by investment_name first, then by sub_investment_name
                                                                      const groupedData = {};
                                                                      currentFilteredData.forEach((item) => {
                                                                        const investmentName = item.investment_name;
                                                                        const subInvestmentName = item.sub_investment_name;
                                                                        
                                                                        if (investmentName && subInvestmentName) {
                                                                          if (!groupedData[investmentName]) {
                                                                            groupedData[investmentName] = { subs: {}, unit: "" };
                                                                          }
                                                                          if (!groupedData[investmentName].subs[subInvestmentName]) {
                                                                            groupedData[investmentName].subs[subInvestmentName] = 0;
                                                                          }
                                                                          let qty = item.allocated_quantity;
                                                                          if (typeof qty === "string" && qty.includes(" / ")) {
                                                                            qty = parseFloat(qty.split(" / ")[0]) || 0;
                                                                          } else {
                                                                            qty = parseFloat(qty) || 0;
                                                                          }
                                                                          groupedData[investmentName].subs[subInvestmentName] += qty;
                                                                          // Collect unit once per investment
                                                                          if (!groupedData[investmentName].unit) {
                                                                            const u = getUnitFromItem(item);
                                                                            if (u) groupedData[investmentName].unit = u;
                                                                          }
                                                                        }
                                                                      });

                                                                      // Convert to hierarchical structure with unit at investment level only
                                                                      const hierarchicalData = Object.entries(groupedData).map(([investmentName, data]) => ({
                                                                        investmentName,
                                                                        unit: data.unit,
                                                                        subInvestments: Object.entries(data.subs).map(([name, matra]) => ({
                                                                          name,
                                                                          matra: matra.toFixed(2),
                                                                        })),
                                                                      }));

                                                                      return (
                                                                        <td
                                                                          key={colIdx}
                                                                          style={{
                                                                            maxWidth: "300px",
                                                                          }}
                                                                        >
                                                                          <div
                                                                            style={{
                                                                              maxHeight: "200px",
                                                                              overflowY: "auto",
                                                                            }}
                                                                          >
                                                                            {hierarchicalData.map((group, groupIdx) => (
                                                                              <div key={groupIdx} style={{ marginBottom: "8px" }}>
                                                                                <div
                                                                                  style={{
                                                                                    fontSize: "12px",
                                                                                    fontWeight: "bold",
                                                                                    backgroundColor: "#e9ecef",
                                                                                    padding: "3px 5px",
                                                                                    borderRadius: "3px",
                                                                                    color: "#495057",
                                                                                  }}
                                                                                >
                                                                                  {group.investmentName}
                                                                                  {group.unit && !String(group.investmentName).includes(`(${group.unit})`) && (
                                                                                    <span style={{ marginLeft: "5px", color: "#666" }}>({group.unit})</span>
                                                                                  )}
                                                                                </div>
                                                                                {group.subInvestments.map((sub, subIdx) => (
                                                                                  <div
                                                                                    key={subIdx}
                                                                                    style={{
                                                                                      fontSize: "10px",
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      borderBottom: "1px dotted #ccc",
                                                                                      padding: "2px 5px 2px 15px",
                                                                                    }}
                                                                                  >
                                                                                    <span>{sub.name}</span>
                                                                                    <span style={{ color: "#007bff", marginLeft: "8px" }}>
                                                                                      ({sub.matra})
                                                                                    </span>
                                                                                  </div>
                                                                                ))}
                                                                              </div>
                                                                            ))}
                                                                          </div>
                                                                        </td>
                                                                      );
                                                                    }

                                                                    // Special handling for निवेश column - show with matra
                                                                    if (columnKey === "investment_name") {
                                                                      // Group by investment_name and sum matra from currentFilteredData
                                                                      const groupedData = {};
                                                                      currentFilteredData.forEach((item) => {
                                                                        const key = item.investment_name;
                                                                        if (key) {
                                                                          if (!groupedData[key]) {
                                                                            groupedData[key] = 0;
                                                                          }
                                                                          let qty = item.allocated_quantity;
                                                                          if (typeof qty === "string" && qty.includes(" / ")) {
                                                                            qty = parseFloat(qty.split(" / ")[0]) || 0;
                                                                          } else {
                                                                            qty = parseFloat(qty) || 0;
                                                                          }
                                                                          groupedData[key] += qty;
                                                                        }
                                                                      });
                                                                      const valuesWithMatra = Object.entries(groupedData).map(([name, matra]) => ({
                                                                        name,
                                                                        matra: matra.toFixed(2),
                                                                      }));
                                                                      return (
                                                                        <td
                                                                          key={colIdx}
                                                                          style={{
                                                                            maxWidth: "250px",
                                                                          }}
                                                                        >
                                                                          <div
                                                                            style={{
                                                                              maxHeight: "150px",
                                                                              overflowY: "auto",
                                                                            }}
                                                                          >
                                                                            {valuesWithMatra.map((item, valIdx) => (
                                                                              <div
                                                                                key={valIdx}
                                                                                style={{
                                                                                  fontSize: "12px",
                                                                                  display: "flex",
                                                                                  justifyContent: "space-between",
                                                                                  borderBottom: "1px dotted #ccc",
                                                                                  padding: "2px 0",
                                                                                }}
                                                                              >
                                                                                <span style={{ fontWeight: "500" }}>
                                                                                  {item.name}
                                                                                  {(() => {
                                                                                    const match = currentFilteredData.find((it) => it.investment_name === item.name);
                                                                                    const u = match ? (match["unit"] || match["investment_unit"] || getUnitFromItem(match)) : null;
                                                                                    return u && !String(item.name).includes(`(${u})`) ? (
                                                                                      <span style={{ marginLeft: "6px", color: "#666" }}>({u})</span>
                                                                                    ) : null;
                                                                                  })()}
                                                                                </span>
                                                                                <span style={{ color: "#007bff", marginLeft: "8px" }}>({item.matra})</span>
                                                                              </div>
                                                                            ))}
                                                                          </div>
                                                                        </td>
                                                                      );
                                                                    }

                                                                    // Get unique values for this column (default behavior)
                                                                    const uniqueValues =
                                                                      getUniqueValuesForColumn(
                                                                        currentFilteredData,
                                                                        columnKey
                                                                      );

                                                                    return (
                                                                      <td
                                                                        key={colIdx}
                                                                        style={{
                                                                          maxWidth: "200px",
                                                                          height: "100%", // Ensure cell takes full height
                                                                        }}
                                                                      >
                                                                        <div
                                                                          style={{
                                                                            height: "100%",
                                                                            display: "flex",
                                                                            flexDirection: "column",
                                                                            justifyContent: "space-between", // Evenly space centers
                                                                            maxHeight: "150px",
                                                                            overflowY: "auto",
                                                                          }}
                                                                        >
                                                                          {uniqueValues.map((val, valIdx) => (
                                                                            <div
                                                                              key={valIdx}
                                                                              style={{
                                                                                fontSize: "12px",
                                                                                padding: "4px 0",
                                                                                borderBottom: valIdx < uniqueValues.length - 1 ? "1px solid #eee" : "none", // Separator between centers
                                                                                flex: 1, // Each center takes equal height
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                              }}
                                                                            >
                                                                              {val}
                                                                            </div>
                                                                          ))}
                                                                        </div>
                                                                      </td>
                                                                    );
                                                                  } else {
                                                                    // For Vidhan Sabha Investment Table, don't make cells clickable
                                                                    if (table.type === 'vidhanSabhaInvestment') {
                                                                      return (
                                                                        <td key={colIdx}>
                                                                          {row[col]}
                                                                        </td>
                                                                      );
                                                                    }
                                                                    return (
                                                                      <td
                                                                        key={
                                                                          colIdx
                                                                        }
                                                                        style={{
                                                                          cursor:
                                                                            "pointer",
                                                                          color:
                                                                            "blue",
                                                                          fontWeight:
                                                                            "bold",
                                                                        }}
                                                                        onClick={() => {
                                                                          // Add to navigation history
                                                                          setNavigationHistory(
                                                                            (
                                                                              prev
                                                                            ) => [
                                                                              ...prev,
                                                                              {
                                                                                view,
                                                                                filterStack:
                                                                                  [
                                                                                    ...filterStack,
                                                                                  ],
                                                                                additionalTables:
                                                                                  [
                                                                                    ...additionalTables,
                                                                                  ],
                                                                              },
                                                                            ]
                                                                          );

                                                                          // Find the column key for this label
                                                                          const colKey =
                                                                            Object.keys(
                                                                              columnDefs
                                                                            ).find(
                                                                              (
                                                                                k
                                                                              ) =>
                                                                                columnDefs[
                                                                                  k
                                                                                ]
                                                                                  .label ===
                                                                                col
                                                                            );
                                                                          if (
                                                                            colKey
                                                                          ) {
                                                                            // Get the data for this value
                                                                            const currentFilteredData =
                                                                              tableData.filter(
                                                                                (
                                                                                  item
                                                                                ) => {
                                                                                  for (let filter of filterStack) {
                                                                                    if (
                                                                                      !filter
                                                                                        .checked[
                                                                                        item[
                                                                                          filter
                                                                                            .column
                                                                                        ]
                                                                                      ]
                                                                                    )
                                                                                      return false;
                                                                                  }
                                                                                  return (
                                                                                    item[
                                                                                      table
                                                                                        .columnKey
                                                                                    ] ===
                                                                                    row[
                                                                                      table
                                                                                        .columns[0]
                                                                                    ]
                                                                                  );
                                                                                }
                                                                              );

                                                                            // Generate a new summary table
                                                                            const summary =
                                                                              generateSummary(
                                                                                currentFilteredData,
                                                                                colKey
                                                                              );
                                                                            // Generate allocation table with the clicked column as the first column
                                                                            const allocationTable =
                                                                              generateAllocationTable(
                                                                                colKey,
                                                                                row[
                                                                                  table
                                                                                    .columns[0]
                                                                                ],
                                                                                table.columnKey
                                                                              );
                                                                            setAdditionalTables(
                                                                              (
                                                                                prev
                                                                              ) => [
                                                                                allocationTable,
                                                                                {
                                                                                  heading: `${
                                                                                    row[
                                                                                      table
                                                                                        .columns[0]
                                                                                    ]
                                                                                  } - ${col}`,
                                                                                  data: summary.data,
                                                                                  columns:
                                                                                    summary.columns,
                                                                                  columnKey:
                                                                                    colKey,
                                                                                },
                                                                                ...prev,
                                                                              ]
                                                                            );
                                                                          }
                                                                        }}
                                                                      >
                                                                        {
                                                                          row[
                                                                            col
                                                                          ]
                                                                        }
                                                                      </td>
                                                                    );
                                                                  }
                                                                }
                                                              )}
                                                            {visibleColumns.includes(
                                                              "आवंटित मात्रा"
                                                            ) && (
                                                              <td>
                                                                {
                                                                  row[
                                                                    "आवंटित मात्रा"
                                                                  ]
                                                                }
                                                              </td>
                                                            )}
                                                            {visibleColumns.includes(
                                                              "कृषक धनराशि"
                                                            ) && (
                                                              <td>
                                                                {
                                                                  row[
                                                                    "कृषक धनराशि"
                                                                  ]
                                                                }
                                                              </td>
                                                            )}
                                                            {visibleColumns.includes(
                                                              "सब्सिडी धनराशि"
                                                            ) && (
                                                              <td>
                                                                {
                                                                  row[
                                                                    "सब्सिडी धनराशि"
                                                                  ]
                                                                }
                                                              </td>
                                                            )}
                                                            {visibleColumns.includes(
                                                              "कुल राशि"
                                                            ) && (
                                                              <td>
                                                                {
                                                                  row[
                                                                    "कुल राशि"
                                                                  ]
                                                                }
                                                              </td>
                                                            )}
                                                          </>
                                                        )}
                                                      </tr>
                                                    ));
                                                }
                                              })()}
                                            </tbody>
                                            {(() => {
                                              const isTableRotated =
                                                isRotated[index] || false;
                                              const showDar = table.isAllocationTable && allocationTableToggles[index]?.dar;
                                              const showMatra = table.isAllocationTable && allocationTableToggles[index]?.matra;
                                              const showIkai = table.isAllocationTable && allocationTableToggles[index]?.ikai;
                                              return (
                                                !isTableRotated && table.type !== 'vidhanSabhaInvestment' && (
                                                  <tfoot>
                                                    <tr
                                                      style={{
                                                        backgroundColor:
                                                          "#f2f2f2",
                                                        fontWeight: "bold",
                                                      }}
                                                    >
                                                      {(() => {
                                                        const visibleColumns =
                                                          tableColumnFilters
                                                            .additional[
                                                            index
                                                          ] || table.columns;
                                                        const filteredData =
                                                          table.data.filter(
                                                            (row) =>
                                                              row[
                                                                table.columns[0]
                                                              ] !== "कुल"
                                                          );
                                                        const detectedUnitRow = filteredData.find(r => r.unit || r.investment_unit || r[`${table.columns[0]}_unit`]);
                                                        const detectedUnit = detectedUnitRow ? (detectedUnitRow.unit || detectedUnitRow.investment_unit || getUnitFromItem(detectedUnitRow)) : "";
                                                        return table.isAllocationTable ? (
                                                          <>
                                                            {visibleColumns.includes(
                                                              table.columns[0]
                                                            ) && <td>{`कुल${detectedUnit ? ` (${detectedUnit})` : ""}:`}</td>}
                                                              {visibleColumns
                                                                .filter(
                                                                  (col) =>
                                                                    col !== table.columns[0] &&
                                                                    !col.startsWith("कुल") &&
                                                                    col !== "आवंटित मात्रा" &&
                                                                    col !== "कृषक धनराशि" &&
                                                                    col !== "सब्सिडी धनराशि"
                                                                )
                                                                .map((col, idx) => (
                                                                  <td key={idx}>
                                                                    {(() => {
                                                                      const matraTotal = filteredData
                                                                        .reduce(
                                                                          (sum, row) => sum + parseFloat(row[col] || 0),
                                                                          0
                                                                        )
                                                                        .toFixed(2);
                                                                      const darTotal = filteredData
                                                                        .reduce(
                                                                          (sum, row) => sum + parseFloat(row[`${col}_dar`] || 0),
                                                                          0
                                                                        )
                                                                        .toFixed(2);
                                                                      const ikaiTotal = filteredData
                                                                        .reduce(
                                                                          (sum, row) => sum + parseFloat(row[`${col}_ikai`] || row[`${col}_unit`] || 0),
                                                                          0
                                                                        )
                                                                        .toFixed(2);
                                                                      return formatAllocationValue(matraTotal, ikaiTotal, darTotal, showMatra, showIkai, showDar);
                                                                    })()}
                                                                  </td>
                                                                ))}

                                                              {(() => {
                                                                // Compute grand totals from visible dynamic columns
                                                                const visibleDynamic = (tableColumnFilters.additional[index] && tableColumnFilters.additional[index].length > 0)
                                                                  ? tableColumnFilters.additional[index].filter((c) => c !== table.columns[0] && !c.startsWith("कुल") && c !== "आवंटित मात्रा" && c !== "कृषक धनराशि" && c !== "सब्सिडी धनराशि")
                                                                  : table.columns.filter((c) => c !== table.columns[0] && !c.startsWith("कुल") && c !== "आवंटित मात्रा" && c !== "कृषक धनराशि" && c !== "सब्सिडी धनराशि");

                                                                return (
                                                                  <>
                                                                    {visibleColumns.includes("आवंटित मात्रा") && (
                                                                      <td>
                                                                        {(() => {
                                                                          const matraSum = filteredData.reduce((s, r) => s + visibleDynamic.reduce((sr, col) => sr + parseFloat(r[col] || 0), 0), 0).toFixed(2);
                                                                          const darSum = filteredData.reduce((s, r) => s + visibleDynamic.reduce((sr, col) => sr + parseFloat(r[`${col}_dar`] || 0), 0), 0).toFixed(2);
                                                                          const ikaiSum = filteredData.reduce((s, r) => s + visibleDynamic.reduce((sr, col) => sr + parseFloat(r[`${col}_ikai`] || r[`${col}_unit`] || 0), 0), 0).toFixed(2);
                                                                          return formatAllocationValue(matraSum, ikaiSum, darSum, showMatra, showIkai, showDar);
                                                                        })()}
                                                                      </td>
                                                                    )}

                                                                    {visibleColumns.includes("कृषक धनराशि") && (
                                                                      <td>
                                                                        {filteredData.reduce((s, r) => s + visibleDynamic.reduce((sr, col) => sr + parseFloat(r[`${col}_farmer`] || 0), 0), 0).toFixed(2)}
                                                                      </td>
                                                                    )}

                                                                    {visibleColumns.includes("सब्सिडी धनराशि") && (
                                                                      <td>
                                                                        {filteredData.reduce((s, r) => s + visibleDynamic.reduce((sr, col) => sr + parseFloat(r[`${col}_subsidy`] || 0), 0), 0).toFixed(2)}
                                                                      </td>
                                                                    )}

                                                                    {visibleColumns.includes("कुल राशि") && (
                                                                      <td>
                                                                        {filteredData.reduce((s, r) => s + visibleDynamic.reduce((sr, col) => sr + parseFloat(r[`${col}_dar`] || 0), 0), 0).toFixed(2)}
                                                                      </td>
                                                                    )}
                                                                  </>
                                                                );
                                                              })()}
                                                          </>
                                                        ) : (
                                                          <>
                                                            {visibleColumns.includes(
                                                              table.columns[0]
                                                            ) && <td>{`कुल${detectedUnit ? ` (${detectedUnit})` : ""}:`}</td>}
                                                            {visibleColumns
                                                              .filter(
                                                                (col) =>
                                                                  col !==
                                                                    table
                                                                      .columns[0] &&
                                                                  col !==
                                                                    "कुल रिकॉर्ड" &&
                                                                  col !==
                                                                    "आवंटित मात्रा" &&
                                                                  col !==
                                                                    "कृषक धनराशि" &&
                                                                  col !==
                                                                    "सब्सिडी धनराशि" &&
                                                                  col !==
                                                                    "कुल राशि"
                                                              )
                                                              .map(
                                                                (col, idx) => {
                                                                  // Check if this column is expanded to show values instead of count
                                                                  const isExpanded =
                                                                    expandedColumns[
                                                                      `${index}_${col}`
                                                                    ];
                                                                  const columnKey =
                                                                    Object.keys(
                                                                      columnDefs
                                                                    ).find(
                                                                      (k) =>
                                                                        columnDefs[
                                                                          k
                                                                        ]
                                                                          .label ===
                                                                        col
                                                                    );

                                                                  if (
                                                                    isExpanded &&
                                                                    columnKey
                                                                  ) {
                                                                    // Get all unique values for this column from the entire filtered data
                                                                    const currentFilteredData =
                                                                      tableData.filter(
                                                                        (
                                                                          item
                                                                        ) => {
                                                                          for (let filter of filterStack) {
                                                                            if (
                                                                              !filter
                                                                                .checked[
                                                                                item[
                                                                                  filter
                                                                                    .column
                                                                                ]
                                                                              ]
                                                                            )
                                                                              return false;
                                                                          }
                                                                          return true;
                                                                        }
                                                                      );

                                                                    // Special handling for उप-निवेश column - group by निवेश
                                                                    if (columnKey === "sub_investment_name") {
                                                                      // Group by investment_name first, then by sub_investment_name
                                                                      const groupedData = {};
                                                                      currentFilteredData.forEach((item) => {
                                                                        const investmentName = item.investment_name;
                                                                        const subInvestmentName = item.sub_investment_name;
                                                                        
                                                                        if (investmentName && subInvestmentName) {
                                                                          if (!groupedData[investmentName]) {
                                                                            groupedData[investmentName] = { subs: {}, unit: "" };
                                                                          }
                                                                          if (!groupedData[investmentName].subs[subInvestmentName]) {
                                                                            groupedData[investmentName].subs[subInvestmentName] = 0;
                                                                          }
                                                                          let qty = item.allocated_quantity;
                                                                          if (typeof qty === "string" && qty.includes(" / ")) {
                                                                            qty = parseFloat(qty.split(" / ")[0]) || 0;
                                                                          } else {
                                                                            qty = parseFloat(qty) || 0;
                                                                          }
                                                                          groupedData[investmentName].subs[subInvestmentName] += qty;
                                                                          // Collect unit at investment level
                                                                          if (!groupedData[investmentName].unit) {
                                                                            const u = getUnitFromItem(item);
                                                                            if (u) groupedData[investmentName].unit = u;
                                                                          }
                                                                        }
                                                                      });

                                                                      // Convert to hierarchical structure
                                                                      const hierarchicalData = Object.entries(groupedData).map(([investmentName, data]) => ({
                                                                        investmentName,
                                                                        unit: data.unit,
                                                                        subInvestments: Object.entries(data.subs).map(([name, matra]) => ({
                                                                          name,
                                                                          matra: matra.toFixed(2),
                                                                        })),
                                                                      }));

                                                                      return (
                                                                        <td
                                                                          key={idx}
                                                                          style={{
                                                                            maxWidth: "300px",
                                                                          }}
                                                                        >
                                                                          <div
                                                                            style={{
                                                                              maxHeight: "200px",
                                                                              overflowY: "auto",
                                                                            }}
                                                                          >
                                                                            {hierarchicalData.map((group, groupIdx) => (
                                                                              <div key={groupIdx} style={{ marginBottom: "8px" }}>
                                                                                <div
                                                                                  style={{
                                                                                    fontSize: "12px",
                                                                                    fontWeight: "bold",
                                                                                    backgroundColor: "#e9ecef",
                                                                                    padding: "3px 5px",
                                                                                    borderRadius: "3px",
                                                                                    color: "#495057",
                                                                                  }}
                                                                                >
                                                                                  {group.investmentName}
                                                                                  {group.unit && !String(group.investmentName).includes(`(${group.unit})`) && (
                                                                                    <span style={{ marginLeft: "5px", color: "#666" }}>({group.unit})</span>
                                                                                  )}
                                                                                </div>
                                                                                {group.subInvestments.map((sub, subIdx) => (
                                                                                  <div
                                                                                    key={subIdx}
                                                                                    style={{
                                                                                      fontSize: "10px",
                                                                                      display: "flex",
                                                                                      justifyContent: "space-between",
                                                                                      borderBottom: "1px dotted #ccc",
                                                                                      padding: "2px 5px 2px 15px",
                                                                                    }}
                                                                                  >
                                                                                    <span>{sub.name}</span>
                                                                                    <span style={{ color: "#007bff", marginLeft: "8px" }}>
                                                                                      ({sub.matra})
                                                                                    </span>
                                                                                  </div>
                                                                                ))}
                                                                              </div>
                                                                            ))}
                                                                          </div>
                                                                        </td>
                                                                      );
                                                                    }

                                                                    // Special handling for निवेश column - show with matra
                                                                    if (columnKey === "investment_name") {
                                                                      // Group by investment_name and sum matra; collect unit
                                                                      const groupedInvestments = {};
                                                                      currentFilteredData.forEach((item) => {
                                                                        const investmentName = item.investment_name;
                                                                        if (investmentName) {
                                                                          if (!groupedInvestments[investmentName]) {
                                                                            groupedInvestments[investmentName] = { matra: 0, unit: "" };
                                                                          }
                                                                          let qty = item.allocated_quantity;
                                                                          if (typeof qty === "string" && qty.includes(" / ")) {
                                                                            qty = parseFloat(qty.split(" / ")[0]) || 0;
                                                                          } else {
                                                                            qty = parseFloat(qty) || 0;
                                                                          }
                                                                          groupedInvestments[investmentName].matra += qty;
                                                                          if (!groupedInvestments[investmentName].unit) {
                                                                            const u = getUnitFromItem(item);
                                                                            if (u) groupedInvestments[investmentName].unit = u;
                                                                          }
                                                                        }
                                                                      });
                                                                      const investmentValues = Object.entries(groupedInvestments).map(([name, info]) => ({
                                                                        name,
                                                                        matra: info.matra.toFixed(2),
                                                                        unit: info.unit || "",
                                                                      }));
                                                                      return (
                                                                        <td
                                                                          key={idx}
                                                                          style={{
                                                                            maxWidth: "250px",
                                                                          }}
                                                                        >
                                                                          <div
                                                                            style={{
                                                                              maxHeight: "150px",
                                                                              overflowY: "auto",
                                                                            }}
                                                                          >
                                                                            {investmentValues.map((item, valIdx) => (
                                                                              <div
                                                                                key={valIdx}
                                                                                style={{
                                                                                  fontSize: "12px",
                                                                                  display: "flex",
                                                                                  justifyContent: "space-between",
                                                                                  borderBottom: "1px dotted #ccc",
                                                                                  padding: "2px 0",
                                                                                }}
                                                                              >
                                                                                <span style={{ fontWeight: "500" }}>
                                                                                  {item.name}
                                                                                  {item.unit && !String(item.name).includes(`(${item.unit})`) && (
                                                                                    <span style={{ marginLeft: "6px", color: "#666" }}>({item.unit})</span>
                                                                                  )}
                                                                                </span>
                                                                                <span style={{ color: "#007bff", marginLeft: "8px" }}>({item.matra})</span>
                                                                              </div>
                                                                            ))}
                                                                          </div>
                                                                        </td>
                                                                      );
                                                                    }

                                                                    // Get unique values for this column
                                                                    const uniqueValues =
                                                                      getUniqueValuesForColumn(
                                                                        currentFilteredData,
                                                                        columnKey
                                                                      );

                                                                    return (
                                                                      <td
                                                                        key={idx}
                                                                        style={{
                                                                          maxWidth: "200px",
                                                                          height: "100%", // Ensure cell takes full height
                                                                        }}
                                                                      >
                                                                        <div
                                                                          style={{
                                                                            height: "100%",
                                                                            display: "flex",
                                                                            flexDirection: "column",
                                                                            justifyContent: "space-between", // Evenly space centers
                                                                            maxHeight: "150px",
                                                                            overflowY: "auto",
                                                                          }}
                                                                        >
                                                                          {uniqueValues.map((val, valIdx) => (
                                                                            <div
                                                                              key={valIdx}
                                                                              style={{
                                                                                fontSize: "12px",
                                                                                padding: "4px 0",
                                                                                borderBottom: valIdx < uniqueValues.length - 1 ? "1px solid #eee" : "none", // Separator between centers
                                                                                flex: 1, // Each center takes equal height
                                                                                display: "flex",
                                                                                alignItems: "center",
                                                                              }}
                                                                            >
                                                                              {val}
                                                                            </div>
                                                                          ))}
                                                                        </div>
                                                                      </td>
                                                                    );
                                                                  } else {
                                                                    return (
                                                                      <td
                                                                        key={
                                                                          idx
                                                                        }
                                                                      >
                                                                        {
                                                                          new Set(
                                                                            filteredData.flatMap(
                                                                              (
                                                                                row
                                                                              ) =>
                                                                                tableData
                                                                                  .filter(
                                                                                    (
                                                                                      item
                                                                                    ) =>
                                                                                      item[
                                                                                        table
                                                                                          .columnKey
                                                                                      ] ===
                                                                                      row[
                                                                                        table
                                                                                          .columns[0]
                                                                                      ]
                                                                                  )
                                                                                  .map(
                                                                                    (
                                                                                      item
                                                                                    ) =>
                                                                                      item[
                                                                                        Object.keys(
                                                                                          columnDefs
                                                                                        ).find(
                                                                                          (
                                                                                            k
                                                                                          ) =>
                                                                                            columnDefs[
                                                                                              k
                                                                                            ]
                                                                                              .label ===
                                                                                            col
                                                                                        )
                                                                                      ]
                                                                                  )
                                                                            )
                                                                          ).size
                                                                        }
                                                                      </td>
                                                                    );
                                                                  }
                                                                }
                                                              )}
                                                            {visibleColumns.includes(
                                                              "आवंटित मात्रा"
                                                            ) && (
                                                              <td>
                                                                {filteredData
                                                                  .reduce(
                                                                    (
                                                                      sum,
                                                                      row
                                                                    ) =>
                                                                      sum +
                                                                      parseFloat(
                                                                        row[
                                                                          "आवंटित मात्रा"
                                                                        ] || 0
                                                                      ),
                                                                    0
                                                                  )
                                                                  .toFixed(2)}
                                                              </td>
                                                            )}
                                                            {visibleColumns.includes(
                                                              "कृषक धनराशि"
                                                            ) && (
                                                              <td>
                                                                {filteredData
                                                                  .reduce(
                                                                    (
                                                                      sum,
                                                                      row
                                                                    ) =>
                                                                      sum +
                                                                      parseFloat(
                                                                        row[
                                                                          "कृषक धनराशि"
                                                                        ] || 0
                                                                      ),
                                                                    0
                                                                  )
                                                                  .toFixed(2)}
                                                              </td>
                                                            )}
                                                            {visibleColumns.includes(
                                                              "सब्सिडी धनराशि"
                                                            ) && (
                                                              <td>
                                                                {filteredData
                                                                  .reduce(
                                                                    (
                                                                      sum,
                                                                      row
                                                                    ) =>
                                                                      sum +
                                                                      parseFloat(
                                                                        row[
                                                                          "सब्सिडी धनराशि"
                                                                        ] || 0
                                                                      ),
                                                                    0
                                                                  )
                                                                  .toFixed(2)}
                                                              </td>
                                                            )}
                                                            {visibleColumns.includes(
                                                              "कुल राशि"
                                                            ) && (
                                                              <td>
                                                                {filteredData
                                                                  .reduce(
                                                                    (
                                                                      sum,
                                                                      row
                                                                    ) =>
                                                                      sum +
                                                                      parseFloat(
                                                                        row[
                                                                          "कुल राशि"
                                                                        ] || 0
                                                                      ),
                                                                    0
                                                                  )
                                                                  .toFixed(2)}
                                                              </td>
                                                            )}
                                                          </>
                                                        );
                                                      })()}
                                                    </tr>
                                                  </tfoot>
                                                )
                                              );
                                            })()}
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
                                        <div
                                          className="table-responsive"
                                          style={{ overflowX: "auto", maxHeight: "60vh", overflowY: "auto" }}
                                        >
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

      {/* Report Modal */}
      <ReportModal />
    </div>
  );
};

export default MainDashboard;