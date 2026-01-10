import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Table, FormCheck, Modal } from "react-bootstrap";
import Select from "react-select";
import "../../assets/css/registration.css";
import DashBoardHeader from "./DashBoardHeader";
import { BiFilter } from "react-icons/bi";
import { RiFilter2Line, RiFileExcelLine, RiFilePdfLine, RiAddLine, RiDeleteBinLine, RiEyeLine } from "react-icons/ri";
import "../../assets/css/MainDashBoard.css";
import { IoMdRefresh } from "react-icons/io";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/";

// Hindi translations for form
const translations = {
  pageTitle: "मुख्य डैशबोर्ड",
  centerName: "केंद्र का नाम",
  component: "घटक",
  investmentName: "निवेश का नाम",
  subInvestmentName: "उप-निवेश का नाम",
  sourceOfReceipt: "सप्लायर",
  schemeName: "योजना का नाम",
  vikasKhandName: "विकास खंड का नाम",
  vidhanSabhaName: "विधानसभा का नाम",
  selectOption: "चुनें",
};

// Column definitions
const columnDefs = {
  center_name: { label: translations.centerName, key: 'center_name' },
  vidhan_sabha_name: { label: translations.vidhanSabhaName, key: 'vidhan_sabha_name' },
  vikas_khand_name: { label: translations.vikasKhandName, key: 'vikas_khand_name' },
  scheme_name: { label: translations.schemeName, key: 'scheme_name' },
  source_of_receipt: { label: translations.sourceOfReceipt, key: 'source_of_receipt' },
  component: { label: translations.component, key: 'component' },
  investment_name: { label: translations.investmentName, key: 'investment_name' },
  sub_investment_name: { label: translations.subInvestmentName, key: 'sub_investment_name' },
  allocated_quantity: { label: 'आवंटित मात्रा', key: 'allocated_quantity' },
  rate: { label: 'दर', key: 'rate' },
};

const MainDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
const isTableFiltered =
  filteredTableData.length !== tableData.length;

  // State for filters
  const [filters, setFilters] = useState({
    center_name: [],
    component: [],
    sub_investment_name: [],
    investment_name: [],
    source_of_receipt: [],
    scheme_name: [],
    vikas_khand_name: [],
    vidhan_sabha_name: [],
  });

  // State for dropdown visibility
  const [dropdownOpen, setDropdownOpen] = useState({
    center_name: false,
    component: false,
    sub_investment_name: false,
    investment_name: false,
    source_of_receipt: false,
    scheme_name: false,
    vikas_khand_name: false,
    vidhan_sabha_name: false,
  });

  // State for filter options (populated from API)
  const [filterOptions, setFilterOptions] = useState({
    center_name: [],
    component: [],
    sub_investment_name: [],
    investment_name: [],
    source_of_receipt: [],
    scheme_name: [],
    vikas_khand_name: [],
    vidhan_sabha_name: [],
  });

  // State for detailed view
  const [view, setView] = useState('main');
  const [selectedItem, setSelectedItem] = useState(null);

  const [detailedDropdownOpen, setDetailedDropdownOpen] = useState(false);
  const [filterStack, setFilterStack] = useState([]);
  const [selectedTotalColumn, setSelectedTotalColumn] = useState(null);
  const [tablesForExport, setTablesForExport] = useState({
    pdf: [],
    excel: []
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('pdf');
  const [tableName, setTableName] = useState('');
  const [showDetailed, setShowDetailed] = useState(false);

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
          center_name: [...new Set(data.map(item => item.center_name).filter(Boolean))],
          component: [...new Set(data.map(item => item.component).filter(Boolean))],
          sub_investment_name: [...new Set(data.map(item => item.sub_investment_name).filter(Boolean))],
          investment_name: [...new Set(data.map(item => item.investment_name).filter(Boolean))],
          source_of_receipt: [...new Set(data.map(item => item.source_of_receipt).filter(Boolean))],
          scheme_name: [...new Set(data.map(item => item.scheme_name).filter(Boolean))],
          vikas_khand_name: [...new Set(data.map(item => item.vikas_khand_name).filter(Boolean))],
          vidhan_sabha_name: [...new Set(data.map(item => item.vidhan_sabha_name).filter(Boolean))],
        };

        setTableData(data);
        setFilteredTableData(data);
        setFilterOptions(prev => ({
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
    setFilters({
      center_name: [],
      component: [],
      sub_investment_name: [],
      investment_name: [],
      source_of_receipt: [],
      scheme_name: [],
      vikas_khand_name: [],
      vidhan_sabha_name: [],
    });
    setCurrentPage(1);
  };
const [isFilterApplied, setIsFilterApplied] = useState(false);
  // Handle cell click for detailed view
  const handleCellClick = (column, value) => {
    setSelectedItem({ column, value });
    
    // Get all unique values for this column from filtered data
    const allValues = [...new Set(filteredTableData.map(item => item[column]).filter(Boolean))];
    
    // Create checked object with all values initialized to false
    // Then set the clicked value to true
    const checked = {};
    allValues.forEach(val => {
      checked[val] = false;
    });
    checked[value] = true;
    
    // Set up filter stack with this column's filter
    // Check if a filter for this column already exists
    const existingFilterIndex = filterStack.findIndex(filter => filter.column === column);
    
    if (existingFilterIndex >= 0) {
      // Filter for this column already exists, update it
      setFilterStack(prev => {
        const newStack = [...prev];
        newStack[existingFilterIndex] = { column, checked };
        return newStack;
      });
    } else {
      // No filter for this column exists, create new one
      const newFilter = { column, checked };
      setFilterStack(prev => [...prev, newFilter]);
    }
    
    setView('detail');
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
    ...options.map((option) => ({ value: option, label: option }))
  ];
  
  // Handle select change with "सभी चुनें" option
  const handleSelectChange = (name, selected) => {
    if (selected && selected.some((s) => s.value === "ALL")) {
      // If "सभी चुनें" is selected, set filter to all options
      setFilters((prev) => ({
        ...prev,
        [name]: filterOptions[name] || [],
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: selected ? selected.map((s) => s.value) : [],
      }));
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
  const toggleDetailedDropdown = () => {
    setDetailedDropdownOpen(!detailedDropdownOpen);
  };

  // Handle detailed checkbox change
  const handleDetailedCheckboxChange = (filterIndex, val) => {
    setFilterStack(prev => {
      const newStack = prev.map((filter, idx) => {
        if (idx !== filterIndex) return filter;
          
        // Create a proper copy of the filter object
        const newFilter = { ...filter, checked: { ...filter.checked } };
        
        if (val === "SELECT_ALL") {
          const allValues = Object.keys(newFilter.checked);
          const currentlyAllSelected = allValues.every(k => newFilter.checked[k]);
          // Toggle: if all are selected, deselect all; otherwise select all
          allValues.forEach(k => newFilter.checked[k] = !currentlyAllSelected);
        } else {
          newFilter.checked[val] = !newFilter.checked[val];
        }
          
        return newFilter;
      });
      return newStack;
    });
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest('.dropdown')) {
      setDropdownOpen({
        center_name: false,
        component: false,
        sub_investment_name: false,
        investment_name: false,
        source_of_receipt: false,
        scheme_name: false,
        vikas_khand_name: false,
        vidhan_sabha_name: false,
      });
    }
  };

  // Add event listener for clicking outside
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle checkbox change in dropdown
  const handleCheckboxChange = (name, value) => {
    if (value === "SELECT_ALL") {
      // Toggle select all
      setFilters((prev) => {
        const allOptions = filterOptions[name] || [];
        const currentValues = prev[name] || [];
        const areAllSelected = allOptions.every(option => currentValues.includes(option));
        return {
          ...prev,
          [name]: areAllSelected ? [] : allOptions
        };
      });
    } else {
      setFilters((prev) => {
        const currentValues = prev[name] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        return { ...prev, [name]: newValues };
      });
      // Apply filters immediately after checkbox change
      applyFilters();
    }
  };
const isSingleCard =
  (tablesForExport.pdf.length > 0 && tablesForExport.excel.length === 0) ||
  (tablesForExport.excel.length > 0 && tablesForExport.pdf.length === 0);
  // Apply filters
  const applyFilters = () => {
    const filteredData = tableData.filter((item) => {
      return (
        (filters.center_name.length === 0 || filters.center_name.includes(item.center_name)) &&
        (filters.vikas_khand_name.length === 0 || filters.vikas_khand_name.includes(item.vikas_khand_name)) &&
        (filters.vidhan_sabha_name.length === 0 || filters.vidhan_sabha_name.includes(item.vidhan_sabha_name)) &&
        (filters.component.length === 0 || filters.component.includes(item.component)) &&
        (filters.investment_name.length === 0 || filters.investment_name.includes(item.investment_name)) &&
        (filters.sub_investment_name.length === 0 || filters.sub_investment_name.includes(item.sub_investment_name)) &&
        (filters.source_of_receipt.length === 0 || filters.source_of_receipt.includes(item.source_of_receipt)) &&
        (filters.scheme_name.length === 0 || filters.scheme_name.includes(item.scheme_name))
      );
    });
    setFilteredTableData(filteredData);
    setCurrentPage(1);
  };

  // Generate dynamic summary heading based on applied filters
  const getSummaryHeading = () => {
    const activeFilters = Object.entries(filters).filter(([key, values]) => values.length > 0);
    
    if (activeFilters.length === 0) {
      return translations.pageTitle;
    }
    
    const filterLabels = {
      center_name: translations.centerName,
      component: translations.component,
      investment_name: translations.investmentName,
      sub_investment_name: translations.subInvestmentName,
      source_of_receipt: translations.sourceOfReceipt,
      scheme_name: translations.schemeName,
      vikas_khand_name: translations.vikasKhandName,
      vidhan_sabha_name: translations.vidhanSabhaName,
    };
    
    const filterText = activeFilters
      .map(([key, values]) => `${filterLabels[key]}: ${values.length === 1 ? values[0] : `${values.length} selected`}`)
      .join(' | ');
    
    return `${translations.pageTitle} (${filterText})`;
  };

  // Go back one step in filter stack
  const goBack = () => {
    if (filterStack.length > 1) {
      setFilterStack(prev => prev.slice(0, -1));
    } else {
      setView('main');
      setFilterStack([]);
      setSelectedItem(null);
    }
    setShowDetailed(false);
  };

  // Get current table data based on view
  const getCurrentTableData = () => {
    if (view === 'main') {
      return {
        heading: getSummaryHeading(),
        data: filteredTableData,
        columns: Object.keys(columnDefs)
      };
    } else {
      const filteredData = tableData.filter(item => {
        for (let filter of filterStack) {
          if (!filter.checked[item[filter.column]]) return false;
        }
        return true;
      });
      const currentFilter = filterStack[filterStack.length - 1];
      const checkedValues = Object.keys(currentFilter.checked).filter(val => currentFilter.checked[val]);

      if (showDetailed && checkedValues.length === 1) {
        return {
          heading: selectedItem?.value || 'Detail View',
          data: filteredData,
          columns: Object.keys(columnDefs).filter(col => col !== currentFilter.column)
        };
      } else {
        // Summary table
        const summaryData = checkedValues.map(checkedValue => {
          const tableDataForValue = filteredData.filter(item => item[currentFilter.column] === checkedValue);
          return {
            [columnDefs[currentFilter.column]?.label]: checkedValue,
            'Total Items': tableDataForValue.length,
            'कुल आवंटित मात्रा': tableDataForValue.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) || 0), 0).toFixed(2),
            'कुल दर': tableDataForValue.reduce((sum, item) => sum + (parseFloat(item.rate) || 0), 0).toFixed(2)
          };
        });
        return {
          heading: `${columnDefs[currentFilter.column]?.label || 'Summary'} (${checkedValues.length} items)`,
          data: summaryData,
          columns: [columnDefs[currentFilter.column]?.label, 'Total Items', 'कुल आवंटित मात्रा', 'कुल दर']
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
    setShowExportModal(true);
  };

  // Confirm add table
  const confirmAddTable = () => {
    const currentTable = getCurrentTableData();
    const newTable = {
      id: Date.now(),
      name: tableName || `Table ${tablesForExport[exportType].length + 1}`,
      heading: currentTable.heading,
      data: currentTable.data,
      columns: currentTable.columns,
      addedAt: new Date().toLocaleString()
    };
    setTablesForExport(prev => ({
      ...prev,
      [exportType]: [...prev[exportType], newTable]
    }));
    setShowExportModal(false);
    setTableName('');
  };

  // Remove table from export list
  const removeTableFromExport = (type, tableId) => {
    setTablesForExport(prev => ({
      ...prev,
      [type]: prev[type].filter(table => table.id !== tableId)
    }));
  };

  // Generate PDF
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Check if autoTable is available
      if (typeof doc.autoTable !== 'function') {
        console.error('jspdf-autotable plugin not loaded. Trying to load...');
        // Try to load jspdf-autotable dynamically
        import('jspdf-autotable').then(() => {
          console.log('jspdf-autotable loaded dynamically');
          // Retry PDF generation after loading
          setTimeout(() => generatePDF(), 100);
        }).catch(err => {
          console.error('Failed to load jspdf-autotable:', err);
          alert('Failed to load PDF functionality. Please restart the application.');
        });
        return;
      }
      
      // Add title
      doc.setFontSize(18);
      doc.text('Exported Tables Report', 14, 22);
      
      let yPos = 30;
      
      tablesForExport.pdf.forEach((table, index) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        // Table heading
        doc.setFontSize(14);
        doc.text(`${index + 1}. ${table.heading}`, 14, yPos);
        yPos += 8;
        
        // Prepare data for autoTable
        const tableData = table.data.map((row, idx) => {
          return table.columns.map(col => {
            if (typeof row === 'object' && row !== null) {
              return row[col] || '';
            }
            return row;
          });
        });
        
        // Add table
        doc.autoTable({
          startY: yPos,
          head: [table.columns],
          body: tableData,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [41, 128, 185] },
          margin: { top: 20 }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
      });
      
      doc.save('exported-tables.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  // Generate Excel
  const generateExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    tablesForExport.excel.forEach((table, index) => {
      // Prepare data for this table
      const tableDataArray = [
        [table.heading], // Title
        [], // Empty row
        table.columns, // Headers
        ...table.data.map(row => table.columns.map(col => {
          if (typeof row === 'object' && row !== null) {
            return row[col] || '';
          }
          return row;
        }))
      ];
      
      const sheetName = table.name.substring(0, 31); // Excel sheet name limit
      
      // Check if sheet already exists in workbook
      if (workbook.SheetNames.includes(sheetName)) {
        // Append data to existing sheet
        const existingSheet = workbook.Sheets[sheetName];
        
        // Get the range of the existing sheet to find where to append
        const existingRange = XLSX.utils.decode_range(existingSheet['!ref'] || 'A1');
        const startRow = existingRange.e.r + 2; // Add 2 rows gap (1 for empty row, 1 for new data)
        
        // Add empty row before new data
        const emptyRow = {};
        for (let col = 0; col < table.columns.length; col++) {
          emptyRow[XLSX.utils.encode_col(col) + (startRow + 1)] = { t: 's', v: '' };
        }
        
        // Add new data starting from the row after empty row
        tableDataArray.forEach((rowData, rowIndex) => {
          const currentRow = startRow + 2 + rowIndex;
          rowData.forEach((cellData, colIndex) => {
            const cellRef = XLSX.utils.encode_col(colIndex) + currentRow;
            existingSheet[cellRef] = { t: typeof cellData === 'number' ? 'n' : 's', v: cellData };
          });
        });
        
        // Update the sheet range
        const newEndRow = startRow + 2 + tableDataArray.length - 1;
        existingSheet['!ref'] = XLSX.utils.encode_range({
          s: { c: 0, r: 0 },
          e: { c: table.columns.length - 1, r: newEndRow }
        });
        
        // Update column widths if needed
        if (!existingSheet['!cols']) {
          const colWidths = table.columns.map(() => ({ wch: 15 }));
          existingSheet['!cols'] = colWidths;
        }
      } else {
        // Create new sheet
        const worksheet = XLSX.utils.aoa_to_sheet(tableDataArray);
        
        // Set column widths
        const colWidths = table.columns.map(() => ({ wch: 15 }));
        worksheet['!cols'] = colWidths;
        
        // Add sheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    });
    
    XLSX.writeFile(workbook, 'exported-tables.xlsx');
  };

  // Export Section Component
  const ExportSection = () => (
    
    <div  className={`export-section mb-3 mt-2 p-3 border rounded bg-light ${
    isFilterApplied ? "mt-2" : ""
  }`}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">
          <RiFilePdfLine /> निर्यात विकल्प
        </h6>
          <div className="d-flex gap-2 flex-wrap">
        <Button
          variant="danger" 
          size="sm"
          onClick={() => addTableToExport('pdf')}
          className="d-flex align-items-center pdf-add-btn gap-1"
        >
          <RiFilePdfLine /> इस टेबल को PDF में जोड़ें
        </Button>
        <Button
          variant="success"
          size="sm"
          onClick={() => addTableToExport('excel')}
          className="d-flex align-items-center exel-add-btn gap-1"
        >
          <RiFileExcelLine /> इस टेबल को Excel में जोड़ें
        </Button>
      </div>
      </div>
    
      
      {/* Selected Tables Display */}
    {(tablesForExport.pdf.length > 0 || tablesForExport.excel.length > 0) && (
  <div className="mt-3">
    {/* <h6 className="mb-2">चयनित टेबल:</h6> */}

   <Row className="g-3">
  {/* PDF COLUMN */}
  {tablesForExport.pdf.length > 0 && (
    <Col
      lg={
        tablesForExport.excel.length > 0
          ? 6
          : 12
      }
      md={12}
      sm={12}
    >
      <div className="selected-tables-card p-3 border rounded bg-white h-100 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold text-danger small">
            <RiFilePdfLine /> PDF ({tablesForExport.pdf.length})
          </span>
          <Button className="pdf-add-btn"
            variant="outline-danger"
            size="sm"
            onClick={generatePDF}
          >
            डाउनलोड
          </Button>
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
                onClick={() =>
                  removeTableFromExport("pdf", table.id)
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

  {/* EXCEL COLUMN */}
  {tablesForExport.excel.length > 0 && (
    <Col
      lg={
        tablesForExport.pdf.length > 0
          ? 6
          : 12
      }
      md={12}
      sm={12}
    >
      <div className="selected-tables-card p-3 border rounded bg-white h-100 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold text-success small">
            <RiFileExcelLine /> Excel ({tablesForExport.excel.length})
          </span>
          <Button
            variant="outline-success" className="pdf-add-btn"
            size="sm"
            onClick={generateExcel}
          >
            डाउनलोड
          </Button>
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
              <h1 className="page-title form-label">
                {getSummaryHeading()}
              </h1>

              {/* Multi-Filter Section */}
              <div className="filter-section mb-3 p-3 border rounded bg-light dashboard-graphs">
              <div className="d-flex justify-content-between align-items-center mb-2">
<h6 className="mb-0">
<i className="fltr-icon"><RiFilter2Line /></i>फिल्टर
</h6>
<div className="d-flex gap-2">
<Button
      variant="primary"
      className="btn-filter-submit"
      size="sm"
      onClick={applyFilters}
>
<i className="fltr-icon"><BiFilter /></i> फिल्टर लागू करें
</Button>
<Button
      className="clear-btn-primary"
      variant="outline-secondary"
      size="sm"
      onClick={clearFilters}
>
<i className="fltr-icon"><IoMdRefresh /></i> सभी फिल्टर हटाएं
</Button>
</div>
</div>
                <Row>
                  <Col>
                    <Form.Group className="mb-2">
                      <Form.Label className="form-label fw-bold">
                        {translations.centerName}
                      </Form.Label>
                      <div className="dropdown">
                        <button
                          className="btn btn-secondary dropdown-toggle drop-option"
                          type="button"
                          onClick={() => toggleDropdown("center_name")}
                        >
                          {filters.center_name.length === 0 ? translations.selectOption : `${filters.center_name.length} selected`}
                        </button>
                        {dropdownOpen.center_name && (
                          <div className="dropdown-menu show">
                            <div key="select_all_center" className="dropdown-item">
                              <FormCheck className="check-box"
                                type="checkbox"
                                id={`center_name_SELECT_ALL`}
                                label="सभी चुनें"
                                checked={filterOptions.center_name.length > 0 && filters.center_name.length === filterOptions.center_name.length}
                                onChange={() => handleCheckboxChange("center_name", "SELECT_ALL")}
                              />
                            </div>
                            {filterOptions.center_name.map((option) => (
                              <div key={option} className="dropdown-item">
                                <FormCheck className="check-box"
                                  type="checkbox"
                                  id={`center_name_${option}`}
                                  label={option}
                                  checked={filters.center_name.includes(option)}
                                  onChange={() => handleCheckboxChange("center_name", option)}
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
                          className="btn btn-secondary dropdown-toggle drop-option"
                          type="button"
                          onClick={() => toggleDropdown("vikas_khand_name")}
                        >
                          {filters.vikas_khand_name.length === 0 ? translations.selectOption : `${filters.vikas_khand_name.length} selected`}
                        </button>
                        {dropdownOpen.vikas_khand_name && (
                          <div className="dropdown-menu show">
                            <div key="select_all_vikas" className="dropdown-item">
                              <FormCheck className="check-box"
                                type="checkbox"
                                id={`vikas_khand_name_SELECT_ALL`}
                                label="सभी चुनें"
                                checked={filterOptions.vikas_khand_name.length > 0 && filters.vikas_khand_name.length === filterOptions.vikas_khand_name.length}
                                onChange={() => handleCheckboxChange("vikas_khand_name", "SELECT_ALL")}
                              />
                            </div>
                            {filterOptions.vikas_khand_name.map((option) => (
                              <div key={option} className="dropdown-item">
                                <FormCheck className="check-box"
                                  type="checkbox"
                                  id={`vikas_khand_name_${option}`}
                                  label={option}
                                  checked={filters.vikas_khand_name.includes(option)}
                                  onChange={() => handleCheckboxChange("vikas_khand_name", option)}
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
                          className="btn btn-secondary dropdown-toggle drop-option"
                          type="button"
                          onClick={() => toggleDropdown("vidhan_sabha_name")}
                        >
                          {filters.vidhan_sabha_name.length === 0 ? translations.selectOption : `${filters.vidhan_sabha_name.length} selected`}
                        </button>
                        {dropdownOpen.vidhan_sabha_name && (
                          <div className="dropdown-menu show">
                            <div key="select_all_vidhan" className="dropdown-item">
                              <FormCheck className="check-box"
                                type="checkbox"
                                id={`vidhan_sabha_name_SELECT_ALL`}
                                label="सभी चुनें"
                                checked={filterOptions.vidhan_sabha_name.length > 0 && filters.vidhan_sabha_name.length === filterOptions.vidhan_sabha_name.length}
                                onChange={() => handleCheckboxChange("vidhan_sabha_name", "SELECT_ALL")}
                              />
                            </div>
                            {filterOptions.vidhan_sabha_name.map((option) => (
                              <div key={option} className="dropdown-item">
                                <FormCheck className="check-box"
                                  type="checkbox"
                                  id={`vidhan_sabha_name_${option}`}
                                  label={option}
                                  checked={filters.vidhan_sabha_name.includes(option)}
                                  onChange={() => handleCheckboxChange("vidhan_sabha_name", option)}
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
                        {translations.component}
                      </Form.Label>
                      <div className="dropdown">
                        <button
                          className="btn btn-secondary dropdown-toggle drop-option"
                          type="button"
                          onClick={() => toggleDropdown("component")}
                        >
                          {filters.component.length === 0 ? translations.selectOption : `${filters.component.length} selected`}
                        </button>
                        {dropdownOpen.component && (
                          <div className="dropdown-menu show">
                            <div key="select_all_component" className="dropdown-item">
                              <FormCheck className="check-box"
                                type="checkbox"
                                id={`component_SELECT_ALL`}
                                label="सभी चुनें"
                                checked={filterOptions.component.length > 0 && filters.component.length === filterOptions.component.length}
                                onChange={() => handleCheckboxChange("component", "SELECT_ALL")}
                              />
                            </div>
                            {filterOptions.component.map((option) => (
                              <div key={option} className="dropdown-item">
                                <FormCheck className="check-box"
                                  type="checkbox"
                                  id={`component_${option}`}
                                  label={option}
                                  checked={filters.component.includes(option)}
                                  onChange={() => handleCheckboxChange("component", option)}
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
                          className="btn btn-secondary dropdown-toggle drop-option"
                          type="button"
                          onClick={() => toggleDropdown("investment_name")}
                        >
                          {filters.investment_name.length === 0 ? translations.selectOption : `${filters.investment_name.length} selected`}
                        </button>
                        {dropdownOpen.investment_name && (
                          <div className="dropdown-menu show">
                            <div key="select_all_investment" className="dropdown-item">
                              <FormCheck className="check-box"
                                type="checkbox"
                                id={`investment_name_SELECT_ALL`}
                                label="सभी चुनें"
                                checked={filterOptions.investment_name.length > 0 && filters.investment_name.length === filterOptions.investment_name.length}
                                onChange={() => handleCheckboxChange("investment_name", "SELECT_ALL")}
                              />
                            </div>
                            {filterOptions.investment_name.map((option) => (
                              <div key={option} className="dropdown-item">
                                <FormCheck className="check-box"
                                  type="checkbox"
                                  id={`investment_name_${option}`}
                                  label={option}
                                  checked={filters.investment_name.includes(option)}
                                  onChange={() => handleCheckboxChange("investment_name", option)}
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
                          className="btn btn-secondary dropdown-toggle drop-option"
                          type="button"
                          onClick={() => toggleDropdown("sub_investment_name")}
                        >
                          {filters.sub_investment_name.length === 0 ? translations.selectOption : `${filters.sub_investment_name.length} selected`}
                        </button>
                        {dropdownOpen.sub_investment_name && (
                          <div className="dropdown-menu show">
                            <div key="select_all_sub_investment" className="dropdown-item">
                              <FormCheck className="check-box"
                                type="checkbox"
                                id={`sub_investment_name_SELECT_ALL`}
                                label="सभी चुनें"
                                checked={filterOptions.sub_investment_name.length > 0 && filters.sub_investment_name.length === filterOptions.sub_investment_name.length}
                                onChange={() => handleCheckboxChange("sub_investment_name", "SELECT_ALL")}
                              />
                            </div>
                            {filterOptions.sub_investment_name.map((option) => (
                              <div key={option} className="dropdown-item">
                                <FormCheck className="check-box"
                                  type="checkbox"
                                  id={`sub_investment_name_${option}`}
                                  label={option}
                                  checked={filters.sub_investment_name.includes(option)}
                                  onChange={() => handleCheckboxChange("sub_investment_name", option)}
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
                        {translations.sourceOfReceipt}
                      </Form.Label>
                      <div className="dropdown">
                        <button
                          className="btn btn-secondary dropdown-toggle drop-option"
                          type="button"
                          onClick={() => toggleDropdown("source_of_receipt")}
                        >
                          {filters.source_of_receipt.length === 0 ? translations.selectOption : `${filters.source_of_receipt.length} selected`}
                        </button>
                        {dropdownOpen.source_of_receipt && (
                          <div className="dropdown-menu show">
                            <div key="select_all_source" className="dropdown-item">
                              <FormCheck className="check-box"  
                                type="checkbox"
                                id={`source_of_receipt_SELECT_ALL`}
                                label="सभी चुनें"
                                checked={filterOptions.source_of_receipt.length > 0 && filters.source_of_receipt.length === filterOptions.source_of_receipt.length}
                                onChange={() => handleCheckboxChange("source_of_receipt", "SELECT_ALL")}
                              />
                            </div>
                            {filterOptions.source_of_receipt.map((option) => (
                              <div key={option} className="dropdown-item">
                                <FormCheck className="check-box"
                                  type="checkbox"
                                  id={`source_of_receipt_${option}`}
                                  label={option}
                                  checked={filters.source_of_receipt.includes(option)}
                                  onChange={() => handleCheckboxChange("source_of_receipt", option)}
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
                          className="btn btn-secondary dropdown-toggle drop-option"
                          type="button"
                          onClick={() => toggleDropdown("scheme_name")}
                        >
                          {filters.scheme_name.length === 0 ? translations.selectOption : `${filters.scheme_name.length} selected`}
                        </button>
                        {dropdownOpen.scheme_name && (
                          <div className="dropdown-menu show">
                            <div key="select_all_scheme" className="dropdown-item">
                              <FormCheck className="check-box"
                                type="checkbox"
                                id={`scheme_name_SELECT_ALL`}
                                label="सभी चुनें"
                                checked={filterOptions.scheme_name.length > 0 && filters.scheme_name.length === filterOptions.scheme_name.length}
                                onChange={() => handleCheckboxChange("scheme_name", "SELECT_ALL")}
                              />
                            </div>
                            {filterOptions.scheme_name.map((option) => (
                              <div key={option} className="dropdown-item">
                                <FormCheck className="check-box"
                                  type="checkbox"
                                  id={`scheme_name_${option}`}
                                  label={option}
                                  checked={filters.scheme_name.includes(option)}
                                  onChange={() => handleCheckboxChange("scheme_name", option)}
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
              {view === 'main' ? (
                <Row>
          
        <Col  lg={isFilterApplied ? 9 : 12}
  md={12}
  sm={12}>
          {/* Placeholder for Dashboard Graphs/Charts */}
          <div className="dashboard-graphs p-3 border rounded bg-white">
            <ExportSection />
            <Table striped bordered hover className="table-thead-style">
     <thead className="table-thead">
       <tr>
         <th>S.No.</th>
         <th>केंद्र का नाम</th>
         <th>विधानसभा</th>
         <th>विकास खंड</th>
         <th>योजना</th>
         <th>सप्लायर</th>
         <th>घटक</th>
         <th>निवेश</th>
         <th>उप-निवेश</th>
         <th>आवंटित मात्रा</th>
         <th>दर</th>
       </tr>
     </thead>
     <tbody>
       {currentPageData.map((item, index) => (
         <tr key={item.id || index}>
           <td>{startIndex + index + 1}</td>
           <td style={{cursor: 'pointer', color: 'blue'}} onClick={() => handleCellClick('center_name', item.center_name)}>{item.center_name}</td>
           <td style={{cursor: 'pointer', color: 'blue'}} onClick={() => handleCellClick('vidhan_sabha_name', item.vidhan_sabha_name)}>{item.vidhan_sabha_name}</td>
           <td style={{cursor: 'pointer', color: 'blue'}} onClick={() => handleCellClick('vikas_khand_name', item.vikas_khand_name)}>{item.vikas_khand_name}</td>
           <td style={{cursor: 'pointer', color: 'blue'}} onClick={() => handleCellClick('scheme_name', item.scheme_name)}>{item.scheme_name}</td>
           <td style={{cursor: 'pointer', color: 'blue'}} onClick={() => handleCellClick('source_of_receipt', item.source_of_receipt)}>{item.source_of_receipt}</td>
           <td style={{cursor: 'pointer', color: 'blue'}} onClick={() => handleCellClick('component', item.component)}>{item.component}</td>
           <td style={{cursor: 'pointer', color: 'blue'}} onClick={() => handleCellClick('investment_name', item.investment_name)}>{item.investment_name}</td>
           <td style={{cursor: 'pointer', color: 'blue'}} onClick={() => handleCellClick('sub_investment_name', item.sub_investment_name || '-')} >{item.sub_investment_name || '-'}</td>
           <td>{item.allocated_quantity}</td>
           <td>{item.rate}</td>
         </tr>
       ))}
     </tbody>
     <tfoot>
       <tr>
         <td style={{fontWeight: 'bold'}}>कुल:</td>
         <td style={{fontWeight: 'bold'}}>{new Set(filteredTableData.map(item => item.center_name)).size}</td>
         <td style={{fontWeight: 'bold'}}>{new Set(filteredTableData.map(item => item.vidhan_sabha_name)).size}</td>
         <td style={{fontWeight: 'bold'}}>{new Set(filteredTableData.map(item => item.vikas_khand_name)).size}</td>
         <td style={{fontWeight: 'bold'}}>{new Set(filteredTableData.map(item => item.scheme_name)).size}</td>
         <td style={{fontWeight: 'bold'}}>{new Set(filteredTableData.map(item => item.source_of_receipt)).size}</td>
         <td style={{fontWeight: 'bold'}}>{new Set(filteredTableData.map(item => item.component)).size}</td>
         <td style={{fontWeight: 'bold'}}>{new Set(filteredTableData.map(item => item.investment_name)).size}</td>
         <td style={{fontWeight: 'bold'}}>{new Set(filteredTableData.map(item => item.sub_investment_name)).size}</td>
         <td style={{fontWeight: 'bold'}}>{filteredTableData.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) || 0), 0).toFixed(2)}</td>
         <td style={{fontWeight: 'bold'}}>{filteredTableData.reduce((sum, item) => sum + (parseFloat(item.rate) || 0), 0).toFixed(2)}</td>
       </tr>
     </tfoot>
   </Table>

   {/* Pagination */}
   <div className="d-flex justify-content-between align-items-center mt-3">
     <span className="text-muted">
       Page {currentPage} / {totalPages} (Total {tableData.length} items)
     </span>
     <div>
       <Button
         variant="outline-secondary"
         size="sm"
         className="me-2"
         onClick={() => goToPage(currentPage - 1)}
         disabled={currentPage === 1}
       >
         {'<'}
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
             variant={currentPage === pageNum ? "primary" : "outline-secondary"}
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
         {'>'}
       </Button>
     </div>
   </div>
          </div>
        </Col>
        </Row>
             ) : (
               <Row>
         <Col lg={3} md={3} sm={12}>
          <div className="dashboard-graphs p-3 border rounded bg-white">
            {filterStack.slice().reverse().map((filter, index) => {
              const filterIndex = filterStack.length - 1 - index;
              // Get all unique values from filtered data for this column
              // Sort: selected values first, then unselected
              const allValues = [...new Set(filteredTableData.map(item => item[filter.column]).filter(Boolean))];
              const selectedValues = allValues.filter(val => filter.checked[val]).sort();
              const unselectedValues = allValues.filter(val => !filter.checked[val]).sort();
              const sortedValues = [...selectedValues, ...unselectedValues];
              return (
                <Form.Group key={filterIndex} className="mb-2">
                  <Form.Label className="form-label fw-bold">{columnDefs[filter.column]?.label} चुनें</Form.Label>
                  <div className="dropdown">
                    <button
                      className="btn btn-secondary dropdown-toggle drop-option"
                      type="button"
                      onClick={() => setDetailedDropdownOpen(prev => ({ ...prev, [filterIndex]: !prev[filterIndex] }))}
                    >
                      {Object.values(filter.checked).filter(Boolean).length} selected
                    </button>
                    {detailedDropdownOpen[filterIndex] && (
                      <div className="dropdown-menu show">
                        <div key="select_all" className="dropdown-item">
                          <FormCheck className="check-box"
                            type="checkbox"
                            id={`select_all_${filterIndex}`}
                            label={Object.values(filter.checked).every(Boolean) ? "सभी हटाएं" : "सभी चुनें"}
                            checked={Object.values(filter.checked).every(Boolean)}
                            onChange={() => handleDetailedCheckboxChange(filterIndex, "SELECT_ALL")}
                          />
                        </div>
                        {sortedValues.map((val) => (
                          <div key={val} className="dropdown-item">
                            <FormCheck className="check-box"
                              type="checkbox"
                              id={`${filterIndex}_${val}`}
                              label={val}
                              checked={filter.checked[val] || false}
                              onChange={() => handleDetailedCheckboxChange(filterIndex, val)}
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
            <div className="back-btn d-flex justify-content-between">
            <Button variant="secondary" className="back-btn-style" size="sm" onClick={goBack}>वापस जाएं</Button>
               <h5>{selectedItem.value}</h5>
            </div>
            {(() => {
              const filteredData = tableData.filter(item => {
                for (let filter of filterStack) {
                  if (!filter.checked[item[filter.column]]) return false;
                }
                return true;
              });
              const currentFilter = filterStack[filterStack.length - 1];
              const checkedValues = Object.keys(currentFilter.checked).filter(val => currentFilter.checked[val]);

              if (showDetailed && checkedValues.length === 1) {
                return (
                  <div>

                    <ExportSection />
                    <Table striped bordered hover className="table-thead-style">
                      <thead className="table-thead">
                        <tr>
                          <th>S.No.</th>
                          {Object.keys(columnDefs).filter(col => col !== currentFilter.column).map(col => (
                            <th key={col}>{columnDefs[col].label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item, index) => (
                          <tr key={item.id || index}>
                            <td>{index + 1}</td>
                            {Object.keys(columnDefs).filter(col => col !== currentFilter.column).map(col => (
                              <td key={col} style={{cursor: col !== 'allocated_quantity' && col !== 'rate' ? 'pointer' : 'default', color: col !== 'allocated_quantity' && col !== 'rate' ? 'blue' : 'black'}} onClick={col !== 'allocated_quantity' && col !== 'rate' ? () => handleCellClick(col, item[col]) : undefined}>
                                {col === 'allocated_quantity' || col === 'rate' ? (parseFloat(item[col]) || 0).toFixed(2) : item[col] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td style={{fontWeight: 'bold'}}>कुल:</td>
                          {Object.keys(columnDefs).filter(col => col !== currentFilter.column).map(col => (
                            <td key={col} style={{fontWeight: 'bold'}}>
                              {col === 'allocated_quantity' || col === 'rate' ? (
                                filteredData.reduce((sum, item) => sum + (parseFloat(item[col]) || 0), 0).toFixed(2)
                              ) : (
                                new Set(filteredData.map(item => item[col])).size
                              )}
                            </td>
                          ))}
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                );
              } else {
                const dynamicSummaryHeading = `${columnDefs[currentFilter.column]?.label || 'Summary'} (${checkedValues.length} items selected)`;
                return (
                  <div className="back-btn mt-1">
                    <h5>{dynamicSummaryHeading}</h5>
                    <ExportSection />
                    <Table striped bordered hover className="table-thead-style">
                      <thead className="table-thead">
                        <tr>
                          <th>{columnDefs[currentFilter.column]?.label || 'Value'}</th>
                          <th>Total Items</th>
                          {Object.keys(columnDefs).filter(col => col !== currentFilter.column && col !== 'allocated_quantity' && col !== 'rate').map(col => (
                            <th key={col}>{columnDefs[col].label}</th>
                          ))}
                          <th>कुल आवंटित मात्रा</th>
                          <th>कुल दर</th>
                        </tr>
                      </thead>
                      <tbody>
                        {checkedValues.map(checkedValue => {
                          const tableDataForValue = filteredData.filter(item => item[currentFilter.column] === checkedValue);
                          return (
                            <tr key={checkedValue}>
                              <td style={{cursor: 'pointer', color: 'blue', fontWeight: 'bold'}} onClick={() => {
                                setShowDetailed(false);
                                setFilterStack(prev => {
                                  const newStack = [...prev];
                                  newStack[newStack.length - 1].checked = { [checkedValue]: true };
                                  return newStack;
                                });
                              }}>{checkedValue}</td>
                              <td style={{cursor: 'pointer', color: 'blue', fontWeight: 'bold'}} onClick={() => {
                                setShowDetailed(true);
                                setFilterStack(prev => {
                                  const newStack = [...prev];
                                  newStack[newStack.length - 1].checked = { [checkedValue]: true };
                                  return newStack;
                                });
                              }}>{tableDataForValue.length}</td>
                              {Object.keys(columnDefs).filter(col => col !== currentFilter.column && col !== 'allocated_quantity' && col !== 'rate').map(col => (
                                <td style={{cursor: 'pointer', color: 'blue', fontWeight: 'bold'}} onClick={() => {
                                  // Filter by this column value
                                  const uniqueValues = [...new Set(tableDataForValue.map(item => item[col]))].filter(Boolean);
                                  setFilterStack(prev => {
                                    const newStack = [...prev];
                                    const existingFilterIndex = newStack.findIndex(f => f.column === col);
                                    if (existingFilterIndex >= 0) {
                                      // Add to existing filter
                                      const checked = {};
                                      uniqueValues.forEach(val => {
                                        checked[val] = true;
                                      });
                                      newStack[existingFilterIndex] = { ...newStack[existingFilterIndex], checked };
                                    } else {
                                      // Create new filter
                                      const checked = {};
                                      uniqueValues.forEach(val => {
                                        checked[val] = true;
                                      });
                                      newStack.push({ column: col, checked });
                                    }
                                    return newStack;
                                  });
                                }}>{new Set(tableDataForValue.map(item => item[col])).size}</td>
                              ))}
                              <td>{tableDataForValue.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) || 0), 0).toFixed(2)}</td>
                              <td>{tableDataForValue.reduce((sum, item) => sum + (parseFloat(item.rate) || 0), 0).toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td style={{fontWeight: 'bold'}}>कुल:</td>
                          <td style={{fontWeight: 'bold'}}>{checkedValues.reduce((sum, checkedValue) => {
                            const tableDataForValue = filteredData.filter(item => item[currentFilter.column] === checkedValue);
                            return sum + tableDataForValue.length;
                          }, 0)}</td>
                          {Object.keys(columnDefs).filter(col => col !== currentFilter.column && col !== 'allocated_quantity' && col !== 'rate').map(col => (
                            <td key={col} style={{fontWeight: 'bold'}}>
                              {new Set(filteredData.map(item => item[col])).size}
                            </td>
                          ))}
                          <td style={{fontWeight: 'bold'}}>
                            {checkedValues.reduce((sum, checkedValue) => {
                              const tableDataForValue = filteredData.filter(item => item[currentFilter.column] === checkedValue);
                              return sum + tableDataForValue.reduce((s, item) => s + (parseFloat(item.allocated_quantity) || 0), 0);
                            }, 0).toFixed(2)}
                          </td>
                          <td style={{fontWeight: 'bold'}}>
                            {checkedValues.reduce((sum, checkedValue) => {
                              const tableDataForValue = filteredData.filter(item => item[currentFilter.column] === checkedValue);
                              return sum + tableDataForValue.reduce((s, item) => s + (parseFloat(item.rate) || 0), 0);
                            }, 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </Table>
                    {selectedTotalColumn && (
                      <div className="mt-4">
                        <h6>Summary for {columnDefs[selectedTotalColumn].label}</h6>
                        <Button variant="secondary" size="sm" onClick={() => setSelectedTotalColumn(null)}>Close</Button>
                        <Table striped bordered hover className="table-thead-style mt-2">
                          <thead className="table-thead">
                            <tr>
                              <th>{columnDefs[selectedTotalColumn].label}</th>
                              <th>Number of Records</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...new Set(filteredData.map(item => item[selectedTotalColumn]))].map(value => {
                              const count = filteredData.filter(item => item[selectedTotalColumn] === value).length;
                              return (
                                <tr key={value}>
                                  <td>{value || '-'}</td>
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
            {exportType === 'pdf' ? 'PDF में जोड़ें' : 'Excel में जोड़ें'}
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
          <Button variant="secondary" onClick={() => setShowExportModal(false)} className="remove-btn">
            रद्द करें
          </Button>
          <Button 
            variant={exportType === 'pdf' ? 'danger' : 'success'}  className="add-btn"
            onClick={confirmAddTable}
          >
            जोड़ें
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );

};

export default MainDashboard;
