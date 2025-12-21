import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Spinner, Alert, Row, Col, Card, Button, ListGroup, Pagination, Badge, Accordion, Table, Form } from "react-bootstrap";
import { FaFileExcel, FaFilePdf, FaArrowLeft, FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import { ImOffice } from "react-icons/im";
import { GrServices } from "react-icons/gr";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { FaRegLightbulb } from "react-icons/fa";
import { BsFillDiagram3Fill } from "react-icons/bs";
import { GrCubes } from "react-icons/gr";
const API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/";

// Helper function to format numbers as currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper to convert field key to a readable title (Hindi)
const formatFieldTitle = (fieldKey) => {
  const titles = {
    center_name: 'केंद्र का नाम',
    component: 'घटक',
    investment_name: 'निवेश का नाम',
    unit: 'इकाई',
    source_of_receipt: 'प्राप्ति का स्रोत',
    scheme_name: 'योजना का नाम',
    // Additional mappings for better Hindi representation
    allocated_quantity: 'आवंटित मात्रा',
    rate: 'दर',
    allocated_amount: 'आवंटित राशि',
    updated_quantity: 'अपडेट की गई मात्रा',
    updated_amount: 'अपडेट की गई राशि',
    totalAllocatedQuantity: 'कुल आवंटित मात्रा',
    totalAllocated: 'कुल आवंटित राशि',
    totalUpdated: 'कुल अपडेट राशि',
    sources: 'स्रोत',
    schemes: 'योजनाएं',
    investment_names: 'निवेश के नाम',
    center_names: 'केंद्रों के नाम',
    components: 'घटक',
    units: 'इकाइयां',
    group_name: 'समूह का नाम'
  };
  return titles[fieldKey] || fieldKey;
};

// Hindi translations for pagination and common terms
const paginationTranslations = {
  showing: "दिखा रहे हैं",
  to: "से",
  of: "का",
  entries: "प्रविष्टियां",
  page: "पृष्ठ",
  itemsPerPage: "प्रति पृष्ठ आइटम:",
  selectColumns: "कॉलम चुनें",
  total: "कुल",
  details: "विवरण",
  summary: "सारांश",
  billing: "बिलिंग",
  data: "डेटा",
  amount: "राशि",
  quantity: "मात्रा"
};

// Available columns for different tables
const mainTableColumns = [
  { key: 'sno', label: 'क्र.सं.' },
  { key: 'center_name', label: 'केंद्र का नाम' },
  { key: 'component', label: 'घटक' },
  { key: 'investment_name', label: 'निवेश का नाम' },
  { key: 'unit', label: 'इकाई' },
  { key: 'allocated_quantity', label: 'आवंटित मात्रा' },
  { key: 'rate', label: 'दर' },
  { key: 'allocated_amount', label: 'आवंटित राशि' },
  { key: 'updated_quantity', label: 'अपडेट की गई मात्रा' },
  { key: 'updated_amount', label: 'अपडेट की गई राशि' },
  { key: 'source_of_receipt', label: 'स्रोत' },
  { key: 'scheme_name', label: 'योजना' }
];

const groupedSummaryColumns = [
  { key: 'sno', label: 'क्र.सं.' },
  { key: 'group_name', label: 'समूह' },
  { key: 'investment_names', label: 'निवेश का नाम' },
  { key: 'center_names', label: 'केंद्र का नाम' },
  { key: 'components', label: 'घटक' },
  { key: 'units', label: 'इकाई' },
  { key: 'totalAllocatedQuantity', label: 'आवंटित मात्रा' },
  { key: 'totalAllocated', label: 'आवंटित राशि' },
  { key: 'totalUpdated', label: 'अपडेट की गई राशि' },
  { key: 'sources', label: 'स्रोत' },
  { key: 'schemes', label: 'योजना' }
];

const componentDetailColumns = [
  { key: 'sno', label: 'क्र.सं.' },
  { key: 'center_name', label: 'केंद्र का नाम' },
  { key: 'component', label: 'घटक' },
  { key: 'investment_name', label: 'निवेश का नाम' },
  { key: 'unit', label: 'इकाई' },
  { key: 'allocated_quantity', label: 'आवंटित मात्रा' },
  { key: 'rate', label: 'दर' },
  { key: 'allocated_amount', label: 'आवंटित राशि' },
  { key: 'updated_quantity', label: 'अपडेट की गई मात्रा' },
  { key: 'updated_amount', label: 'अपडेट की गई राशि' },
  { key: 'source_of_receipt', label: 'स्रोत' },
  { key: 'scheme_name', label: 'योजना' }
];

// Column mapping for data access
const mainTableColumnMapping = {
  sno: { header: 'क्र.सं.', accessor: (item, index, currentPage, itemsPerPage) => (currentPage - 1) * itemsPerPage + index + 1 },
  center_name: { header: 'केंद्र का नाम', accessor: (item) => item.center_name },
  component: { header: 'घटक', accessor: (item) => item.component },
  investment_name: { header: 'निवेश का नाम', accessor: (item) => item.investment_name },
  unit: { header: 'इकाई', accessor: (item) => item.unit },
  allocated_quantity: { header: 'आवंटित मात्रा', accessor: (item) => item.allocated_quantity },
  rate: { header: 'दर', accessor: (item) => item.rate },
  allocated_amount: { header: 'आवंटित राशि', accessor: (item) => (parseFloat(item.allocated_quantity) * parseFloat(item.rate)).toFixed(2) },
  updated_quantity: { header: 'अपडेट की गई मात्रा', accessor: (item) => item.updated_quantity },
  updated_amount: { header: 'अपडेट की गई राशि', accessor: (item) => (parseFloat(item.updated_quantity) * parseFloat(item.rate)).toFixed(2) },
  source_of_receipt: { header: 'स्रोत', accessor: (item) => item.source_of_receipt },
  scheme_name: { header: 'योजना', accessor: (item) => item.scheme_name }
};

const groupedSummaryColumnMapping = {
  sno: { header: 'क्र.सं.', accessor: (item, index) => index + 1 },
  group_name: { header: 'समूह', accessor: (item) => item.group_name },
  investment_names: { header: 'निवेश का नाम', accessor: (item) => item.investment_names },
  center_names: { header: 'केंद्र का नाम', accessor: (item) => item.center_names },
  components: { header: 'घटक', accessor: (item) => item.components },
  units: { header: 'इकाई', accessor: (item) => item.units },
  totalAllocatedQuantity: { header: 'आवंटित मात्रा', accessor: (item) => item.totalAllocatedQuantity.toFixed(2) },
  totalAllocated: { header: 'आवंटित राशि', accessor: (item) => formatCurrency(item.totalAllocated) },
  totalUpdated: { header: 'अपडेट की गई राशि', accessor: (item) => formatCurrency(item.totalUpdated) },
  sources: { header: 'स्रोत', accessor: (item) => item.sources },
  schemes: { header: 'योजना', accessor: (item) => item.schemes }
};

const componentDetailColumnMapping = {
  sno: { header: 'क्र.सं.', accessor: (item, index) => index + 1 },
  center_name: { header: 'केंद्र का नाम', accessor: (item) => item.center_name },
  component: { header: 'घटक', accessor: (item) => item.component },
  investment_name: { header: 'निवेश का नाम', accessor: (item) => item.investment_name },
  unit: { header: 'इकाई', accessor: (item) => item.unit },
  allocated_quantity: { header: 'आवंटित मात्रा', accessor: (item) => item.allocated_quantity },
  rate: { header: 'दर', accessor: (item) => item.rate },
  allocated_amount: { header: 'आवंटित राशि', accessor: (item) => (parseFloat(item.allocated_quantity) * parseFloat(item.rate)).toFixed(2) },
  updated_quantity: { header: 'अपडेट की गई मात्रा', accessor: (item) => item.updated_quantity },
  updated_amount: { header: 'अपडेट की गई राशि', accessor: (item) => (parseFloat(item.updated_quantity) * parseFloat(item.rate)).toFixed(2) },
  source_of_receipt: { header: 'स्रोत', accessor: (item) => item.source_of_receipt },
  scheme_name: { header: 'योजना', accessor: (item) => item.scheme_name }
};

// Reusable Column Selection Component
const ColumnSelection = ({ columns, selectedColumns, setSelectedColumns, title }) => {
  const handleColumnToggle = (columnKey) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter(col => col !== columnKey));
    } else {
      setSelectedColumns([...selectedColumns, columnKey]);
    }
  };

  const handleSelectAll = () => {
    setSelectedColumns(columns.map(col => col.key));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  return (
    <div className="column-selection mb-3 p-3 border rounded bg-light">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="small-fonts mb-0">{title}</h6>
        <div>
          <Button variant="outline-secondary" size="sm" onClick={handleSelectAll} className="me-2">
            सभी चुनें
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={handleDeselectAll}>
            सभी हटाएं
          </Button>
        </div>
      </div>
      <Row>
        <Col>
          <div className="d-flex flex-wrap">
            {columns.map(col => (
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

// Component for expandable section
const ExpandableSection = ({ title, count, totalAmount, children, defaultExpanded = false, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getIndentStyle = () => {
    switch (level) {
      case 0: return { marginLeft: '0px' };
      case 1: return { marginLeft: '20px' };
      case 2: return { marginLeft: '40px' };
      case 3: return { marginLeft: '60px' };
      default: return { marginLeft: '0px' };
    }
  };

  return (
    <div className="expandable-section mb-3" style={getIndentStyle()}>
      <div
        className="expandable-header d-flex justify-content-between align-items-center p-2 bg-light rounded"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex align-items-center">
          {isExpanded ? <FaChevronDown className="me-2" /> : <FaChevronRight className="me-2" />}
          <h5 className="mb-0">{title}</h5>
          {count > 0 && <Badge bg="primary" className="ms-2">{count}</Badge>}
        </div>
        <div className="d-flex align-items-center">
          <span className="me-2 fw-bold">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
      {isExpanded && (
        <div className="expandable-content p-3">
          {children}
        </div>
      )}
    </div>
  );
};

const MainDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // State for API data, loading, and errors
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for managing multiple active filters from ANY category
  const [activeFilters, setActiveFilters] = useState({});

  // State to control which category's filter buttons are being shown
  const [filterCategory, setFilterCategory] = useState(null);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State for expanded investment rows
  const [expandedInvestments, setExpandedInvestments] = useState({});

  // State for additional filter when clicking on specific item in expanded row
  const [expandedRowFilter, setExpandedRowFilter] = useState({});

  // State for selected columns for different tables
  const [mainTableSelectedColumns, setMainTableSelectedColumns] = useState(mainTableColumns.map(col => col.key));
  const [groupedSummarySelectedColumns, setGroupedSummarySelectedColumns] = useState(groupedSummaryColumns.map(col => col.key));
  const [componentDetailSelectedColumns, setComponentDetailSelectedColumns] = useState(componentDetailColumns.map(col => col.key));

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const billingResponse = await fetch(API_URL);
        if (!billingResponse.ok) {
          throw new Error(`HTTP error! status: ${billingResponse.status}`);
        }
        const billingJson = await billingResponse.json();
        setBillingData(billingJson);

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
  }, [activeFilters]);
 
  const getFieldIcon = (field) => {
    const icons = {
      center_name: <ImOffice />, // Return as React component
      component: <GrServices />,
      investment_name: <RiMoneyRupeeCircleLine />,
      unit: <GrCubes />,
      source_of_receipt: <FaRegLightbulb />,
      scheme_name: <BsFillDiagram3Fill />
    };
    return icons[field];
  };

  // --- useMemo for processing data for cards and table ---
  const { categoryCardsData, filteredTableData, tableTotals, paginatedData, totalPages, hierarchicalData, investmentSummaryData } = useMemo(() => {
    if (!billingData || billingData.length === 0) {
      return {
        categoryCardsData: [],
        filteredTableData: [],
        tableTotals: { allocated: 0, updated: 0, allocatedQuantity: 0, updatedQuantity: 0 },
        paginatedData: [],
        totalPages: 0,
        hierarchicalData: null,
        investmentSummaryData: []
      };
    }

    // --- 1. Calculate Data for Category Filter Cards ---
    const fieldsToCardify = ['center_name', 'component', 'investment_name', 'unit', 'source_of_receipt', 'scheme_name'];
    const categoryCards = fieldsToCardify.map(field => {
      const uniqueValues = [...new Set(billingData.map(item => item[field]))].sort(); // Sort values
      return {
        key: field,
        title: formatFieldTitle(field),
        count: uniqueValues.length,
        icon: getFieldIcon(field),
        values: uniqueValues
      };
    });

    // --- 2. Filter Data for Table based on ALL activeFilters from ANY category ---
    let filtered = billingData;
    // This loop applies every active filter, regardless of its category
    Object.keys(activeFilters).forEach(category => {
      const values = activeFilters[category];
      if (values && values.length > 0) {
        filtered = filtered.filter(item => values.includes(item[category]));
      }
    });

    // --- 2.1 Create hierarchical data structure ---
    let hierarchical = null;

    if (Object.keys(activeFilters).length > 0) {
      // Determine the primary filter (first one in the activeFilters object)
      const primaryFilterKey = Object.keys(activeFilters)[0];

      // Group by primary filter
      const groupedByPrimary = {};
      filtered.forEach(item => {
        const primaryValue = item[primaryFilterKey];
        if (!groupedByPrimary[primaryValue]) {
          groupedByPrimary[primaryValue] = {
            name: primaryValue,
            totalAllocated: 0,
            totalUpdated: 0,
            items: []
          };
        }

        const allocatedAmount = parseFloat(item.allocated_quantity) * parseFloat(item.rate);
        const updatedAmount = parseFloat(item.updated_quantity) * parseFloat(item.rate);

        groupedByPrimary[primaryValue].totalAllocated += allocatedAmount;
        groupedByPrimary[primaryValue].totalUpdated += updatedAmount;
        groupedByPrimary[primaryValue].items.push(item);
      });

      // For each primary group, group by center_name
      Object.keys(groupedByPrimary).forEach(primaryValue => {
        const primaryGroup = groupedByPrimary[primaryValue];
        const centers = {};

        primaryGroup.items.forEach(item => {
          const centerName = item.center_name;
          if (!centers[centerName]) {
            centers[centerName] = {
              name: centerName,
              totalAllocated: 0,
              totalUpdated: 0,
              items: []
            };
          }

          const allocatedAmount = parseFloat(item.allocated_quantity) * parseFloat(item.rate);
          const updatedAmount = parseFloat(item.updated_quantity) * parseFloat(item.rate);

          centers[centerName].totalAllocated += allocatedAmount;
          centers[centerName].totalUpdated += updatedAmount;
          centers[centerName].items.push(item);
        });

        // For each center, group by unit
        Object.keys(centers).forEach(centerName => {
          const center = centers[centerName];
          const units = {};

          center.items.forEach(item => {
            const unit = item.unit;
            if (!units[unit]) {
              units[unit] = {
                name: unit,
                totalAllocated: 0,
                totalUpdated: 0,
                items: []
              };
            }

            const allocatedAmount = parseFloat(item.allocated_quantity) * parseFloat(item.rate);
            const updatedAmount = parseFloat(item.updated_quantity) * parseFloat(item.rate);

            units[unit].totalAllocated += allocatedAmount;
            units[unit].totalUpdated += updatedAmount;
            units[unit].items.push(item);
          });

          // For each unit, group by component (firm)
          Object.keys(units).forEach(unitName => {
            const unit = units[unitName];
            const components = {};

            unit.items.forEach(item => {
              const component = item.component;
              if (!components[component]) {
                components[component] = {
                  name: component,
                  totalAllocated: 0,
                  totalUpdated: 0,
                  items: []
                };
              }

              const allocatedAmount = parseFloat(item.allocated_quantity) * parseFloat(item.rate);
              const updatedAmount = parseFloat(item.updated_quantity) * parseFloat(item.rate);

              components[component].totalAllocated += allocatedAmount;
              components[component].totalUpdated += updatedAmount;
              components[component].items.push(item);
            });

            unit.components = components;
          });

          center.units = units;
        });

        primaryGroup.centers = centers;
      });

      hierarchical = {
        primaryFilter: primaryFilterKey,
        groups: groupedByPrimary
      };
    }

    // --- 2.2 Create investment summary data based on filters ---
    let investmentSummary = {};

    // Determine grouping field based on active filters
    // Default to center_name initially, then use first selected filter
    let groupingField = 'center_name'; // Default grouping by center (केंद्र)

    if (Object.keys(activeFilters).length > 0) {
      // Use the first active filter as the grouping field
      groupingField = Object.keys(activeFilters)[0];
    }

    // Group filtered data by the selected grouping field
    filtered.forEach(item => {
      const groupValue = item[groupingField];
      if (!investmentSummary[groupValue]) {
        investmentSummary[groupValue] = {
          group_name: groupValue,
          group_field: groupingField,
          investment_names: new Set(),
          center_names: new Set(),
          components: new Set(),
          units: new Set(),
          sources: new Set(),
          schemes: new Set(),
          totalAllocated: 0,
          totalUpdated: 0,
          totalAllocatedQuantity: 0,
          items: []
        };
      }

      const allocatedAmount = parseFloat(item.allocated_quantity) * parseFloat(item.rate);
      const updatedAmount = parseFloat(item.updated_quantity) * parseFloat(item.rate);

      // Only add to sets if it's not the grouping field
      if (groupingField !== 'investment_name') {
        investmentSummary[groupValue].investment_names.add(item.investment_name);
      }
      if (groupingField !== 'center_name') {
        investmentSummary[groupValue].center_names.add(item.center_name);
      }
      if (groupingField !== 'component') {
        investmentSummary[groupValue].components.add(item.component);
      }
      if (groupingField !== 'unit') {
        investmentSummary[groupValue].units.add(item.unit);
      }
      if (groupingField !== 'source_of_receipt') {
        investmentSummary[groupValue].sources.add(item.source_of_receipt);
      }
      if (groupingField !== 'scheme_name') {
        investmentSummary[groupValue].schemes.add(item.scheme_name);
      }

      investmentSummary[groupValue].totalAllocated += allocatedAmount;
      investmentSummary[groupValue].totalUpdated += updatedAmount;
      investmentSummary[groupValue].totalAllocatedQuantity += parseFloat(item.allocated_quantity);
      investmentSummary[groupValue].items.push(item);
    });

    // Convert sets to comma-separated strings and create array
    const investmentSummaryArray = Object.values(investmentSummary).map(item => ({
      ...item,
      investment_names: Array.from(item.investment_names).join(', '),
      center_names: Array.from(item.center_names).join(', '),
      components: Array.from(item.components).join(', '),
      units: Array.from(item.units).join(', '),
      sources: Array.from(item.sources).join(', '),
      schemes: Array.from(item.schemes).join(', ')
    }));

    // --- 3. Calculate Totals for the Filtered Table ---
    const totals = filtered.reduce((acc, item) => {
      acc.allocated += parseFloat(item.allocated_quantity) * parseFloat(item.rate);
      acc.updated += parseFloat(item.updated_quantity) * parseFloat(item.rate);
      acc.allocatedQuantity += parseFloat(item.allocated_quantity || 0);
      acc.updatedQuantity += parseFloat(item.updated_quantity || 0);
      return acc;
    }, { allocated: 0, updated: 0, allocatedQuantity: 0, updatedQuantity: 0 });

    // --- 4. Paginate filtered data ---
    const totalPagesCount = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

    return {
      categoryCardsData: categoryCards,
      filteredTableData: filtered,
      tableTotals: totals,
      paginatedData: paginated,
      totalPages: totalPagesCount,
      hierarchicalData: hierarchical,
      investmentSummaryData: investmentSummaryArray
    };

  }, [billingData, activeFilters, currentPage, itemsPerPage]);

  // Generic download Excel function that works with any table
  const downloadExcel = (data, filename, columnMapping, selectedColumns, totals = null) => {
    try {
      // Prepare data for Excel export based on selected columns
      const excelData = data.map((item, index) => {
        const row = {};
        selectedColumns.forEach(col => {
          row[columnMapping[col].header] = columnMapping[col].accessor(item, index, currentPage, itemsPerPage);
        });
        return row;
      });

      // Add totals row if provided
      if (totals) {
        const totalsRow = {};

        // Iterate through selected columns in order to maintain alignment
        selectedColumns.forEach(col => {
          if (col === 'sno') {
            totalsRow[columnMapping[col].header] = paginationTranslations.total;
          } else if (col === 'center_name' || col === 'component' || col === 'investment_name' ||
            col === 'unit' || col === 'source_of_receipt' || col === 'scheme_name' ||
            col === 'investment_names' || col === 'center_names' || col === 'components' ||
            col === 'units' || col === 'sources' || col === 'schemes' || col === 'group_name') {
            totalsRow[columnMapping[col].header] = "";
          } else if (col === 'rate') {
            totalsRow[columnMapping[col].header] = "-";
          } else if (col === 'allocated_quantity') {
            totalsRow[columnMapping[col].header] = totals.allocatedQuantity.toFixed(2);
          } else if (col === 'allocated_amount') {
            totalsRow[columnMapping[col].header] = formatCurrency(totals.allocated);
          } else if (col === 'updated_quantity') {
            totalsRow[columnMapping[col].header] = totals.updatedQuantity.toFixed(2);
          } else if (col === 'updated_amount') {
            totalsRow[columnMapping[col].header] = formatCurrency(totals.updated);
          } else if (col === 'totalAllocatedQuantity') {
            totalsRow[columnMapping[col].header] = totals.allocatedQuantity.toFixed(2);
          } else if (col === 'totalAllocated') {
            totalsRow[columnMapping[col].header] = formatCurrency(totals.allocated);
          } else if (col === 'totalUpdated') {
            totalsRow[columnMapping[col].header] = formatCurrency(totals.updated);
          }
        });

        excelData.push(totalsRow);
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = selectedColumns.map(() => ({ wch: 15 }));
      ws['!cols'] = colWidths;

      // Style the totals row
      if (totals) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        const totalsRowNum = range.e.r; // Last row
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: totalsRowNum, c: C });
          if (!ws[cellAddress]) continue;
          ws[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "FFFFAA00" } }
          };
        }
      }

      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
      console.error("Error generating Excel file:", e);
      setError("Excel file generation failed. Please try again.");
    }
  };

  // Specialized function for investment summary Excel
  const downloadInvestmentSummaryExcel = (data, filename) => {
    try {
      const excelData = data.map((item, index) => {
        const row = {
          'क्र.सं.': index + 1,
          [formatFieldTitle(item.group_field)]: item.group_name
        };

        // Only include columns that are not the grouping field and are selected
        if (item.group_field !== 'investment_name' && groupedSummarySelectedColumns.includes('investment_names')) {
          row['निवेश का नाम'] = item.investment_names;
        }
        if (item.group_field !== 'center_name' && groupedSummarySelectedColumns.includes('center_names')) {
          row['केंद्र का नाम'] = item.center_names;
        }
        if (item.group_field !== 'component' && groupedSummarySelectedColumns.includes('components')) {
          row['घटक'] = item.components;
        }
        if (item.group_field !== 'unit' && groupedSummarySelectedColumns.includes('units')) {
          row['इकाई'] = item.units;
        }

        if (groupedSummarySelectedColumns.includes('totalAllocatedQuantity')) {
          row['आवंटित मात्रा'] = item.totalAllocatedQuantity.toFixed(2);
        }
        if (groupedSummarySelectedColumns.includes('totalAllocated')) {
          row['आवंटित राशि'] = item.totalAllocated.toFixed(2);
        }
        if (groupedSummarySelectedColumns.includes('totalUpdated')) {
          row['अपडेट की गई राशि'] = item.totalUpdated.toFixed(2);
        }

        if (item.group_field !== 'source_of_receipt' && groupedSummarySelectedColumns.includes('sources')) {
          row['स्रोत'] = item.sources;
        }
        if (item.group_field !== 'scheme_name' && groupedSummarySelectedColumns.includes('schemes')) {
          row['योजना'] = item.schemes;
        }

        return row;
      });

      // Add totals row
      const totalsRow = {};

      // Determine headers based on grouping field and selected columns
      if (data.length > 0) {
        const groupField = data[0].group_field;

        totalsRow['क्र.सं.'] = paginationTranslations.total;
        totalsRow[formatFieldTitle(groupField)] = "";

        if (groupField !== 'investment_name' && groupedSummarySelectedColumns.includes('investment_names')) {
          totalsRow['निवेश का नाम'] = "";
        }
        if (groupField !== 'center_name' && groupedSummarySelectedColumns.includes('center_names')) {
          totalsRow['केंद्र का नाम'] = "";
        }
        if (groupField !== 'component' && groupedSummarySelectedColumns.includes('components')) {
          totalsRow['घटक'] = "";
        }
        if (groupField !== 'unit' && groupedSummarySelectedColumns.includes('units')) {
          totalsRow['इकाई'] = "";
        }

        if (groupedSummarySelectedColumns.includes('totalAllocatedQuantity')) {
          totalsRow['आवंटित मात्रा'] = tableTotals.allocatedQuantity.toFixed(2);
        }
        if (groupedSummarySelectedColumns.includes('totalAllocated')) {
          totalsRow['आवंटित राशि'] = tableTotals.allocated.toFixed(2);
        }
        if (groupedSummarySelectedColumns.includes('totalUpdated')) {
          totalsRow['अपडेट की गई राशि'] = tableTotals.updated.toFixed(2);
        }

        if (groupField !== 'source_of_receipt' && groupedSummarySelectedColumns.includes('sources')) {
          totalsRow['स्रोत'] = "";
        }
        if (groupField !== 'scheme_name' && groupedSummarySelectedColumns.includes('schemes')) {
          totalsRow['योजना'] = "";
        }
      }

      excelData.push(totalsRow);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Style the totals row
      const range = XLSX.utils.decode_range(ws['!ref']);
      const totalsRowNum = range.e.r; // Last row
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: totalsRowNum, c: C });
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "FFFFAA00" } }
        };
      }

      XLSX.utils.book_append_sheet(wb, ws, "Grouped Summary");
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (e) {
      console.error("Error generating Excel file:", e);
      setError("Excel file generation failed. Please try again.");
    }
  };

  // Generic download PDF function that works with any table
  const downloadPdf = (data, filename, columnMapping, selectedColumns, title, totals = null) => {
    try {
      // Create headers and rows based on selected columns
      const headers = selectedColumns.map(col => `<th>${columnMapping[col].header}</th>`).join('');
      const rows = data.map((item, index) => {
        const cells = selectedColumns.map(col => `<td>${columnMapping[col].accessor(item, index, currentPage, itemsPerPage)}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');

      // Create totals row if provided
      let totalsRow = '';
      if (totals) {
        const totalsCells = selectedColumns.map(col => {
          if (col === 'sno') {
            return `<td>${paginationTranslations.total}</td>`;
          } else if (col === 'center_name' || col === 'component' || col === 'investment_name' ||
            col === 'unit' || col === 'source_of_receipt' || col === 'scheme_name' ||
            col === 'investment_names' || col === 'center_names' || col === 'components' ||
            col === 'units' || col === 'sources' || col === 'schemes' || col === 'group_name') {
            return `<td></td>`;
          } else if (col === 'rate') {
            return `<td>-</td>`;
          } else if (col === 'allocated_quantity') {
            return `<td>${totals.allocatedQuantity.toFixed(2)}</td>`;
          } else if (col === 'allocated_amount') {
            return `<td>${formatCurrency(totals.allocated)}</td>`;
          } else if (col === 'updated_quantity') {
            return `<td>${totals.updatedQuantity.toFixed(2)}</td>`;
          } else if (col === 'updated_amount') {
            return `<td>${formatCurrency(totals.updated)}</td>`;
          } else if (col === 'totalAllocatedQuantity') {
            return `<td>${totals.allocatedQuantity.toFixed(2)}</td>`;
          } else if (col === 'totalAllocated') {
            return `<td>${formatCurrency(totals.allocated)}</td>`;
          } else if (col === 'totalUpdated') {
            return `<td>${formatCurrency(totals.updated)}</td>`;
          }
          return `<td></td>`;
        }).join('');

        totalsRow = `<tr class="totals-row">${totalsCells}</tr>`;
      }

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
              p { text-align: center; font-weight: bold; }
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
              .totals-row { 
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
                ${totalsRow}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(tableHtml);
      printWindow.document.close();

      // Wait for the content to load before printing
      printWindow.onload = function () {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000); // Increased timeout to ensure content is fully loaded
      };
    } catch (e) {
      console.error("Error generating PDF:", e);
      setError("PDF generation failed. Please try again.");
    }
  };

  // Specialized function for investment summary PDF
  const downloadInvestmentSummaryPdf = (data, filename) => {
    try {
      // Dynamically create table headers based on grouping field and selected columns
      const getTableHeaders = () => {
        if (data.length === 0) return ['समूह', 'निवेश का नाम', 'केंद्र का नाम', 'घटक', 'इकाई', 'आवंटित राशि', 'अपडेट की गई राशि', 'स्रोत', 'योजना'];

        const groupField = data[0].group_field;
        const headers = ['क्र.सं.', formatFieldTitle(groupField)];

        if (groupField !== 'investment_name' && groupedSummarySelectedColumns.includes('investment_names')) headers.push('निवेश का नाम');
        if (groupField !== 'center_name' && groupedSummarySelectedColumns.includes('center_names')) headers.push('केंद्र का नाम');
        if (groupField !== 'component' && groupedSummarySelectedColumns.includes('components')) headers.push('घटक');
        if (groupField !== 'unit' && groupedSummarySelectedColumns.includes('units')) headers.push('इकाई');
        if (groupedSummarySelectedColumns.includes('totalAllocatedQuantity')) headers.push('आवंटित मात्रा');
        if (groupedSummarySelectedColumns.includes('totalAllocated')) headers.push('आवंटित राशि');
        if (groupedSummarySelectedColumns.includes('totalUpdated')) headers.push('अपडेट की गई राशि');
        if (groupField !== 'source_of_receipt' && groupedSummarySelectedColumns.includes('sources')) headers.push('स्रोत');
        if (groupField !== 'scheme_name' && groupedSummarySelectedColumns.includes('schemes')) headers.push('योजना');

        return headers;
      };

      const headers = getTableHeaders();

      const tableHtml = `
        <html>
          <head>
            <title>समूह विवरण</title>
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
              p { text-align: center; font-weight: bold; }
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
              .totals-row { 
                background-color: #f2f2f2; 
                font-weight: bold;
              }
              .expandable-row { cursor: pointer; }
              @media print {
                .no-print { display: none; }
                body { margin: 0; }
                h1 { font-size: 20px; }
                th, td { font-size: 12px; }
              }
            </style>
          </head>
          <body>
            <h1>समूह विवरण</h1>
            <table>
              <thead>
                <tr>
                  ${headers.map(h => `<th>${h}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map((item, index) => {
        const getTableRow = () => {
          const cells = [
            `<td>${index + 1}</td>`,
            `<td>${item.group_name}</td>`
          ];

          if (item.group_field !== 'investment_name' && groupedSummarySelectedColumns.includes('investment_names')) cells.push(`<td>${item.investment_names}</td>`);
          if (item.group_field !== 'center_name' && groupedSummarySelectedColumns.includes('center_names')) cells.push(`<td>${item.center_names}</td>`);
          if (item.group_field !== 'component' && groupedSummarySelectedColumns.includes('components')) cells.push(`<td>${item.components}</td>`);
          if (item.group_field !== 'unit' && groupedSummarySelectedColumns.includes('units')) cells.push(`<td>${item.units}</td>`);
          if (groupedSummarySelectedColumns.includes('totalAllocatedQuantity')) cells.push(`<td>${item.totalAllocatedQuantity.toFixed(2)}</td>`);
          if (groupedSummarySelectedColumns.includes('totalAllocated')) cells.push(`<td>${formatCurrency(item.totalAllocated)}</td>`);
          if (groupedSummarySelectedColumns.includes('totalUpdated')) cells.push(`<td>${formatCurrency(item.totalUpdated)}</td>`);
          if (item.group_field !== 'source_of_receipt' && groupedSummarySelectedColumns.includes('sources')) cells.push(`<td>${item.sources}</td>`);
          if (item.group_field !== 'scheme_name' && groupedSummarySelectedColumns.includes('schemes')) cells.push(`<td>${item.schemes}</td>`);

          return `<tr class="expandable-row">${cells.join('')}</tr>`;
        };

        return getTableRow();
      }).join('')}
                <!-- Totals row directly after data -->
                <tr class="totals-row">
                  ${data.length > 0 ? (() => {
          const groupField = data[0].group_field;
          const cells = [
            `<td>${paginationTranslations.total}</td>`,
            `<td></td>`
          ];

          if (groupField !== 'investment_name' && groupedSummarySelectedColumns.includes('investment_names')) cells.push(`<td></td>`);
          if (groupField !== 'center_name' && groupedSummarySelectedColumns.includes('center_names')) cells.push(`<td></td>`);
          if (groupField !== 'component' && groupedSummarySelectedColumns.includes('components')) cells.push(`<td></td>`);
          if (groupField !== 'unit' && groupedSummarySelectedColumns.includes('units')) cells.push(`<td></td>`);
          if (groupedSummarySelectedColumns.includes('totalAllocatedQuantity')) cells.push(`<td>${tableTotals.allocatedQuantity.toFixed(2)}</td>`);
          if (groupedSummarySelectedColumns.includes('totalAllocated')) cells.push(`<td>${formatCurrency(tableTotals.allocated)}</td>`);
          if (groupedSummarySelectedColumns.includes('totalUpdated')) cells.push(`<td>${formatCurrency(tableTotals.updated)}</td>`);
          if (groupField !== 'source_of_receipt' && groupedSummarySelectedColumns.includes('sources')) cells.push(`<td></td>`);
          if (groupField !== 'scheme_name' && groupedSummarySelectedColumns.includes('schemes')) cells.push(`<td></td>`);

          return cells.join('');
        })() : ''}
                </tr>
              </tbody>
            </table>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(tableHtml);
      printWindow.document.close();

      // Wait for the content to load before printing
      printWindow.onload = function () {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000); // Increased timeout to ensure content is fully loaded
      };
    } catch (e) {
      console.error("Error generating PDF:", e);
      setError("PDF generation failed. Please try again.");
    }
  };

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  // Handler for clicking category cards
  const handleCategoryCardClick = (key) => {
    // Find the card with the clicked key to get its values
    const card = categoryCardsData.find(c => c.key === key);
    if (card && card.values.length > 0) {
      // Set the filter category to show buttons
      setFilterCategory(key);

      // If this category doesn't have active filters yet, set the first value as default
      if (!activeFilters[key] || activeFilters[key].length === 0) {
        // Set the filter with only the first value for this category
        setActiveFilters(prev => ({ ...prev, [key]: [card.values[0]] }));
      }
    }
  };

  // Handler for clicking filter buttons
  const handleFilterButtonClick = (category, value) => {
    setActiveFilters(prev => {
      const currentValues = prev[category] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      if (newValues.length === 0) {
        const newFilters = { ...prev };
        delete newFilters[category];
        return newFilters;
      }

      return { ...prev, [category]: newValues };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setFilterCategory(null);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Toggle investment row expansion
  const toggleInvestmentExpansion = (groupValue) => {
    setExpandedInvestments(prev => ({
      ...prev,
      [groupValue]: !prev[groupValue]
    }));
    // Clear any filter when toggling
    if (expandedInvestments[groupValue]) {
      setExpandedRowFilter(prev => {
        const newFilters = { ...prev };
        delete newFilters[groupValue];
        return newFilters;
      });
    }
  };

  // Handle click on a specific item value to filter expanded data
  const handleItemClick = (groupValue, filterField, filterValue, e) => {
    e.stopPropagation(); // Prevent row toggle

    // If already expanded, just update the filter
    if (!expandedInvestments[groupValue]) {
      setExpandedInvestments(prev => ({ ...prev, [groupValue]: true }));
    }

    // Set or toggle the filter
    setExpandedRowFilter(prev => {
      const currentFilter = prev[groupValue] || {};
      if (currentFilter.field === filterField && currentFilter.value === filterValue) {
        // Clear filter if clicking same item
        const newFilters = { ...prev };
        delete newFilters[groupValue];
        return newFilters;
      }
      return { ...prev, [groupValue]: { field: filterField, value: filterValue } };
    });
  };

  // Get filtered items for expanded row based on any additional filter
  const getFilteredExpandedItems = (groupValue, items) => {
    const filter = expandedRowFilter[groupValue];
    if (!filter) return items;
    return items.filter(item => item[filter.field] === filter.value);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content d-flex justify-content-center align-items-center">
          <Spinner animation="border" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content">
          <Container fluid className="dashboard-body">
            <Alert variant="danger">Error: {error}</Alert>
          </Container>
        </div>
      </div>
    );
  }

  const paginationItems = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    paginationItems.push(<Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>);
    if (startPage > 2) {
      paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
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
    paginationItems.push(<Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>{totalPages}</Pagination.Item>);
  }

  // Render hierarchical view if filters are active
  const renderHierarchicalView = () => {
    if (!hierarchicalData) return null;

    const { primaryFilter, groups } = hierarchicalData;

    return (
      <div className="hierarchical-view">
        {Object.keys(groups).map(groupKey => {
          const group = groups[groupKey];
          return (
            <ExpandableSection
              key={groupKey}
              title={`${formatFieldTitle(primaryFilter)}: ${group.name}`}
              count={Object.keys(group.centers || {}).length}
              totalAmount={group.totalAllocated}
              defaultExpanded={true}
              level={0}
            >
              {Object.keys(group.centers || {}).map(centerKey => {
                const center = group.centers[centerKey];
                return (
                  <ExpandableSection
                    key={centerKey}
                    title={`केंद्र: ${center.name}`}
                    count={Object.keys(center.units || {}).length}
                    totalAmount={center.totalAllocated}
                    level={1}
                  >
                    {Object.keys(center.units || {}).map(unitKey => {
                      const unit = center.units[unitKey];
                      return (
                        <ExpandableSection
                          key={unitKey}
                          title={`इकाई: ${unit.name}`}
                          count={Object.keys(unit.components || {}).length}
                          totalAmount={unit.totalAllocated}
                          level={2}
                        >
                          {Object.keys(unit.components || {}).map(componentKey => {
                            const component = unit.components[componentKey];
                            return (
                              <ExpandableSection
                                key={componentKey}
                                title={`घटक: ${component.name}`}
                                count={component.items.length}
                                totalAmount={component.totalAllocated}
                                level={3}
                              >
                                <div className="mb-3">
                                  <ColumnSelection
                                    columns={componentDetailColumns}
                                    selectedColumns={componentDetailSelectedColumns}
                                    setSelectedColumns={setComponentDetailSelectedColumns}
                                    title="कॉलम चुनें"
                                  />
                                  <div className="d-flex justify-content-end mb-2">
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      onClick={() => downloadExcel(component.items, `Component_${component.name}_${new Date().toISOString().slice(0, 10)}`, componentDetailColumnMapping, componentDetailSelectedColumns, {
                                        allocated: component.totalAllocated,
                                        updated: component.totalUpdated,
                                        allocatedQuantity: component.items.reduce((sum, item) => sum + parseFloat(item.allocated_quantity || 0), 0),
                                        updatedQuantity: component.items.reduce((sum, item) => sum + parseFloat(item.updated_quantity || 0), 0)
                                      })}
                                      className="me-2"
                                    >
                                      <FaFileExcel className="me-1" />Excel
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => downloadPdf(component.items, `Component_${component.name}_${new Date().toISOString().slice(0, 10)}`, componentDetailColumnMapping, componentDetailSelectedColumns, `${component.name} विवरण`, {
                                        allocated: component.totalAllocated,
                                        updated: component.totalUpdated,
                                        allocatedQuantity: component.items.reduce((sum, item) => sum + parseFloat(item.allocated_quantity || 0), 0),
                                        updatedQuantity: component.items.reduce((sum, item) => sum + parseFloat(item.updated_quantity || 0), 0)
                                      })}
                                    >
                                      <FaFilePdf className="me-1" />
                                      PDF
                                    </Button>
                                  </div>
                                </div>
                                <Table striped bordered hover responsive className="small-fonts">
                                  <thead>
                                    <tr>
                                      {componentDetailSelectedColumns.includes('sno') && <th>क्र.सं.</th>}
                                      {componentDetailSelectedColumns.includes('center_name') && <th>केंद्र का नाम</th>}
                                      {componentDetailSelectedColumns.includes('component') && <th>घटक</th>}
                                      {componentDetailSelectedColumns.includes('investment_name') && <th>निवेश का नाम</th>}
                                      {componentDetailSelectedColumns.includes('unit') && <th>इकाई</th>}
                                      {componentDetailSelectedColumns.includes('allocated_quantity') && <th>आवंटित मात्रा</th>}
                                      {componentDetailSelectedColumns.includes('rate') && <th>दर</th>}
                                      {componentDetailSelectedColumns.includes('allocated_amount') && <th>आवंटित राशि</th>}
                                      {componentDetailSelectedColumns.includes('updated_quantity') && <th>अपडेट की गई मात्रा</th>}
                                      {componentDetailSelectedColumns.includes('updated_amount') && <th>अपडेट की गई राशि</th>}
                                      {componentDetailSelectedColumns.includes('source_of_receipt') && <th>स्रोत</th>}
                                      {componentDetailSelectedColumns.includes('scheme_name') && <th>योजना</th>}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {component.items.map((item, index) => {
                                      const allocatedAmount = (parseFloat(item.allocated_quantity) * parseFloat(item.rate)).toFixed(2);
                                      const updatedAmount = (parseFloat(item.updated_quantity) * parseFloat(item.rate)).toFixed(2);
                                      return (
                                        <tr key={index}>
                                          {componentDetailSelectedColumns.includes('sno') && <td>{index + 1}</td>}
                                          {componentDetailSelectedColumns.includes('center_name') && <td>{item.center_name}</td>}
                                          {componentDetailSelectedColumns.includes('component') && <td>{item.component}</td>}
                                          {componentDetailSelectedColumns.includes('investment_name') && <td>{item.investment_name}</td>}
                                          {componentDetailSelectedColumns.includes('unit') && <td>{item.unit}</td>}
                                          {componentDetailSelectedColumns.includes('allocated_quantity') && <td>{item.allocated_quantity}</td>}
                                          {componentDetailSelectedColumns.includes('rate') && <td>{item.rate}</td>}
                                          {componentDetailSelectedColumns.includes('allocated_amount') && <td>{allocatedAmount}</td>}
                                          {componentDetailSelectedColumns.includes('updated_quantity') && <td>{item.updated_quantity}</td>}
                                          {componentDetailSelectedColumns.includes('updated_amount') && <td>{updatedAmount}</td>}
                                          {componentDetailSelectedColumns.includes('source_of_receipt') && <td>{item.source_of_receipt}</td>}
                                          {componentDetailSelectedColumns.includes('scheme_name') && <td>{item.scheme_name}</td>}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                  <tfoot>
                                    <tr className="font-weight-bold">
                                      {componentDetailSelectedColumns.includes('sno') && <td>{paginationTranslations.total}</td>}
                                      {componentDetailSelectedColumns.includes('center_name') && <td></td>}
                                      {componentDetailSelectedColumns.includes('component') && <td></td>}
                                      {componentDetailSelectedColumns.includes('investment_name') && <td></td>}
                                      {componentDetailSelectedColumns.includes('unit') && <td></td>}
                                      {componentDetailSelectedColumns.includes('allocated_quantity') && <td>{component.items.reduce((sum, item) => sum + parseFloat(item.allocated_quantity || 0), 0).toFixed(2)}</td>}
                                      {componentDetailSelectedColumns.includes('rate') && <td></td>}
                                      {componentDetailSelectedColumns.includes('allocated_amount') && <td>{formatCurrency(component.totalAllocated)}</td>}
                                      {componentDetailSelectedColumns.includes('updated_quantity') && <td>{component.items.reduce((sum, item) => sum + parseFloat(item.updated_quantity || 0), 0).toFixed(2)}</td>}
                                      {componentDetailSelectedColumns.includes('updated_amount') && <td>{formatCurrency(component.totalUpdated)}</td>}
                                      {componentDetailSelectedColumns.includes('source_of_receipt') && <td></td>}
                                      {componentDetailSelectedColumns.includes('scheme_name') && <td></td>}
                                    </tr>
                                  </tfoot>
                                </Table>
                              </ExpandableSection>
                            );
                          })}
                        </ExpandableSection>
                      );
                    })}
                  </ExpandableSection>
                );
              })}
            </ExpandableSection>
          );
        })}
      </div>
    );
  };

  // Helper to render filter buttons for a category
  const renderFilterButtons = (category) => {
    const card = categoryCardsData.find(c => c.key === category);
    if (!card) return null;

    const allSelected = (activeFilters[category] || []).length === card.values.length;

    return (
      <>
        <Col xs="auto" className="mb-2">
          <Button
            variant={allSelected ? "primary" : "outline-secondary"}
            size="sm"
            className="filter-button"
            onClick={() => {
              if (allSelected) {
                // Deselect all
                setActiveFilters(prev => {
                  const newFilters = { ...prev };
                  delete newFilters[category];
                  return newFilters;
                });
              } else {
                // Select all
                setActiveFilters(prev => ({ ...prev, [category]: card.values }));
              }
            }}
          >
            सभी चुनें
          </Button>
        </Col>
        {card.values.map((value) => (
          <Col key={value} xs="auto" className="mb-2">
            <Button
              variant={(activeFilters[category] || []).includes(value) ? "primary" : "outline-secondary"}
              size="sm"
              className="filter-button"
              onClick={() => handleFilterButtonClick(category, value)}
            >
              {value}
            </Button>
          </Col>
        ))}
      </>
    );
  };

  return (
    <>
      <div className="dashboard-container">
        <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content">
          <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <Container fluid className="dashboard-body">
            <h1 className="page-title small-fonts">डैशबोर्ड</h1>

            {/* Category Filter Cards Section */}
            <div className="category-cards-container mb-4">
              <Row className="g-3">
                {categoryCardsData.map((card) => (
                  <div className="col">
<div className="card radius-10 border-start border-0 border-4 border-info" key={card.key} onClick={() => handleCategoryCardClick(card.key)} style={{ cursor: 'pointer' }}>                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div>
                            <p className="mb-0 text-secondary">{card.title}</p>
                            <h4 className="my-1 text-info">{card.count} प्रकार</h4>
                            {activeFilters[card.key] && (
                              <Badge bg="success" pill>{activeFilters[card.key].length} चयनित</Badge>
                            )}
                          </div>
                          <div className="widgets-icons-2 rounded-circle bg-gradient-blues text-white ms-auto"><i className="bx bxs-cart">{card.icon}</i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>



                ))}
              </Row>
            </div>

            {/* Filter Buttons Section - Shows directly when a card is clicked */}
            <div className="d-flex flex-column flex-md-row gap-3">
              {/* Filter Buttons Section - Shows directly when a card is clicked */}
              {filterCategory && (
                <div className="filter-buttons-container mb-4 p-3 border rounded bg-light col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 small-fonts">{formatFieldTitle(filterCategory)} का चयन करें</h5>
                    <Button variant="outline-secondary" size="sm" onClick={() => setFilterCategory(null)}>
                      <FaTimes className="me-1" /> बंद करें
                    </Button>
                  </div>
                  <Row className="g-1 align-items-center">
                    {renderFilterButtons(filterCategory)}
                  </Row>
                </div>
              )}

              {/* Active Filters Section */}
              {Object.keys(activeFilters).length > 0 && (
                <div className="active-filters-container mb-4 p-2 border rounded bg-light col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0 small-fonts">लागू फ़िल्टर:</h6>
                    <Button variant="danger" size="sm" onClick={clearAllFilters}>
                      <FaTimes className="me-1" /> सभी फ़िल्टर हटाएं
                    </Button>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {Object.keys(activeFilters).map((categoryKey) => (
                      <div key={categoryKey} className="filter-category">
                        <strong>{formatFieldTitle(categoryKey)}:</strong>
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {activeFilters[categoryKey].map((value) => (
                            <Badge
                              key={value}
                              bg="primary"
                              pill
                              className="filter-badge"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                const newValues = activeFilters[categoryKey].filter(v => v !== value);
                                if (newValues.length === 0) {
                                  const newFilters = { ...activeFilters };
                                  delete newFilters[categoryKey];
                                  setActiveFilters(newFilters);
                                } else {
                                  setActiveFilters(prev => ({ ...prev, [categoryKey]: newValues }));
                                }
                              }}
                            >
                              {value} <FaTimes style={{ fontSize: '0.6em' }} />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Billing Items Table - Only show when no filters are applied */}
            {Object.keys(activeFilters).length === 0 && (
              <div className="billing-table-container">
                <h2 className="dynamic-table-heading small-fonts">
                  कुल विवरण
                  <span className="heading-totals">
                    (कुल आवंटित मात्रा: {tableTotals.allocatedQuantity.toFixed(2)}, कुल आवंटित: {formatCurrency(tableTotals.allocated)}, कुल अपडेट मात्रा: {tableTotals.updatedQuantity.toFixed(2)}, कुल अपडेट किया गया: {formatCurrency(tableTotals.updated)})
                  </span>
                  {Object.keys(activeFilters).length > 0 && (
                    <span className="heading-filter-info">
                      - <strong>
                        {Object.keys(activeFilters).map(cat => `${formatFieldTitle(cat)}: ${activeFilters[cat].join(', ')}`).join(' | ')}
                      </strong>
                    </span>
                  )}
                </h2>

                <Row className="mt-3">
                  <div className="col-md-12">
                    <div className="table-wrapper">
                      {filteredTableData.length > 0 ? (
                        <>
                          <div className="table-info mb-2 d-flex justify-content-between align-items-center">
                            <span className="small-fonts">
                              {paginationTranslations.showing} {((currentPage - 1) * itemsPerPage) + 1} {paginationTranslations.to} {Math.min(currentPage * itemsPerPage, filteredTableData.length)} {paginationTranslations.of} {filteredTableData.length} {paginationTranslations.entries}
                            </span>
                            <div className="d-flex align-items-center">
                              <span className="small-fonts me-2">{paginationTranslations.itemsPerPage}</span>
                              <span className="badge bg-primary">{itemsPerPage}</span>
                            </div>
                          </div>

                          {/* Column Selection Section for Main Table */}
                          <ColumnSelection
                            columns={mainTableColumns}
                            selectedColumns={mainTableSelectedColumns}
                            setSelectedColumns={setMainTableSelectedColumns}
                            title="कॉलम चुनें"
                          />

                          <div className="d-flex justify-content-end mb-2">
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => downloadExcel(filteredTableData, `Billing_Data_${new Date().toISOString().slice(0, 10)}`, mainTableColumnMapping, mainTableSelectedColumns, tableTotals)}
                              className="me-2"
                            >
                              <FaFileExcel className="me-1" />Excel
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => downloadPdf(filteredTableData, `Billing_Data_${new Date().toISOString().slice(0, 10)}`, mainTableColumnMapping, mainTableSelectedColumns, "कुल विवरण", tableTotals)}
                            >
                              <FaFilePdf className="me-1" />
                              PDF
                            </Button>
                          </div>

                          <table className="responsive-table small-fonts">
                            <thead>
                              <tr>
                                {mainTableSelectedColumns.includes('sno') && <th>क्र.सं.</th>}
                                {mainTableSelectedColumns.includes('center_name') && <th>केंद्र का नाम</th>}
                                {mainTableSelectedColumns.includes('component') && <th>घटक</th>}
                                {mainTableSelectedColumns.includes('investment_name') && <th>निवेश का नाम</th>}
                                {mainTableSelectedColumns.includes('unit') && <th>इकाई</th>}
                                {mainTableSelectedColumns.includes('allocated_quantity') && <th>आवंटित मात्रा</th>}
                                {mainTableSelectedColumns.includes('rate') && <th>दर</th>}
                                {mainTableSelectedColumns.includes('allocated_amount') && <th>आवंटित राशि</th>}
                                {mainTableSelectedColumns.includes('updated_quantity') && <th>अपडेट की गई मात्रा</th>}
                                {mainTableSelectedColumns.includes('updated_amount') && <th>अपडेट की गई राशि</th>}
                                {mainTableSelectedColumns.includes('source_of_receipt') && <th>स्रोत</th>}
                                {mainTableSelectedColumns.includes('scheme_name') && <th>योजना</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedData.map((item, index) => {
                                const allocatedAmount = (parseFloat(item.allocated_quantity) * parseFloat(item.rate)).toFixed(2);
                                const updatedAmount = (parseFloat(item.updated_quantity) * parseFloat(item.rate)).toFixed(2);
                                return (
                                  <tr key={item.id}>
                                    {mainTableSelectedColumns.includes('sno') && <td data-label="क्र.सं.">{(currentPage - 1) * itemsPerPage + index + 1}</td>}
                                    {mainTableSelectedColumns.includes('center_name') && <td data-label="केंद्र का नाम">{item.center_name}</td>}
                                    {mainTableSelectedColumns.includes('component') && <td data-label="घटक">{item.component}</td>}
                                    {mainTableSelectedColumns.includes('investment_name') && <td data-label="निवेश का नाम">{item.investment_name}</td>}
                                    {mainTableSelectedColumns.includes('unit') && <td data-label="इकाई">{item.unit}</td>}
                                    {mainTableSelectedColumns.includes('allocated_quantity') && <td data-label="आवंटित मात्रा">{item.allocated_quantity}</td>}
                                    {mainTableSelectedColumns.includes('rate') && <td data-label="दर">{item.rate}</td>}
                                    {mainTableSelectedColumns.includes('allocated_amount') && <td data-label="आवंटित राशि">{allocatedAmount}</td>}
                                    {mainTableSelectedColumns.includes('updated_quantity') && <td data-label="अपडेट की गई मात्रा">{item.updated_quantity}</td>}
                                    {mainTableSelectedColumns.includes('updated_amount') && <td data-label="अपडेट की गई राशि">{updatedAmount}</td>}
                                    {mainTableSelectedColumns.includes('source_of_receipt') && <td data-label="स्रोत">{item.source_of_receipt}</td>}
                                    {mainTableSelectedColumns.includes('scheme_name') && <td data-label="योजना">{item.scheme_name}</td>}
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="font-weight-bold">
                                {mainTableSelectedColumns.includes('sno') && <td>{paginationTranslations.total}</td>}
                                {mainTableSelectedColumns.includes('center_name') && <td></td>}
                                {mainTableSelectedColumns.includes('component') && <td></td>}
                                {mainTableSelectedColumns.includes('investment_name') && <td></td>}
                                {mainTableSelectedColumns.includes('unit') && <td></td>}
                                {mainTableSelectedColumns.includes('allocated_quantity') && <td>{tableTotals.allocatedQuantity.toFixed(2)}</td>}
                                {mainTableSelectedColumns.includes('rate') && <td></td>}
                                {mainTableSelectedColumns.includes('allocated_amount') && <td>{formatCurrency(tableTotals.allocated)}</td>}
                                {mainTableSelectedColumns.includes('updated_quantity') && <td>{tableTotals.updatedQuantity.toFixed(2)}</td>}
                                {mainTableSelectedColumns.includes('updated_amount') && <td>{formatCurrency(tableTotals.updated)}</td>}
                                {mainTableSelectedColumns.includes('source_of_receipt') && <td></td>}
                                {mainTableSelectedColumns.includes('scheme_name') && <td></td>}
                              </tr>
                            </tfoot>
                          </table>

                          {totalPages > 1 && (
                            <div className=" mt-2">
                              <div className="small-fonts mb-3 text-center">
                                {paginationTranslations.page} {currentPage} {paginationTranslations.of} {totalPages}
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
                      ) : (
                        <Alert variant="info">
                          {Object.keys(activeFilters).length > 0 ? 'चयनित फ़िल्टर के लिए कोई वस्तु नहीं मिली.' : 'कोई डेटा उपलब्ध नहीं है।'}
                        </Alert>
                      )}
                    </div>
                  </div>
                </Row>
              </div>
            )}

            {/* Grouped Summary Table - Initially shows by center (केंद्र) */}
            {filteredTableData.length > 0 && (
              <div className="grouped-summary-container mt-4">
                <h2 className="dynamic-table-heading small-fonts">
                  {investmentSummaryData.length > 0 ? formatFieldTitle(investmentSummaryData[0].group_field) : 'समूह'} विवरण
                  <span className="heading-totals">
                    (कुल आवंटित: {formatCurrency(tableTotals.allocated)}, कुल अपडेट किया गया: {formatCurrency(tableTotals.updated)})
                  </span>
                </h2>

                {/* Column Selection Section for Grouped Summary Table */}
                <ColumnSelection
                  columns={groupedSummaryColumns}
                  selectedColumns={groupedSummarySelectedColumns}
                  setSelectedColumns={setGroupedSummarySelectedColumns}
                  title="समूह विवरण के लिए कॉलम चुनें"
                />

                <div className="d-flex justify-content-end mb-2">
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => downloadInvestmentSummaryExcel(investmentSummaryData, `Grouped_Summary_${new Date().toISOString().slice(0, 10)}`)}
                    className="me-2"
                  >
                    <FaFileExcel className="me-1" />Excel
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => downloadInvestmentSummaryPdf(investmentSummaryData, `Grouped_Summary_${new Date().toISOString().slice(0, 10)}`)}
                  >
                    <FaFilePdf className="me-1" />
                    PDF
                  </Button>
                </div>

                <table className="responsive-table small-fonts">
                  <thead>
                    <tr>
                      {groupedSummarySelectedColumns.includes('sno') && <th>क्र.सं.</th>}
                      {groupedSummarySelectedColumns.includes('group_name') && <th>{investmentSummaryData.length > 0 ? formatFieldTitle(investmentSummaryData[0].group_field) : 'समूह'}</th>}
                      {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'investment_name' && groupedSummarySelectedColumns.includes('investment_names') && <th>निवेश का नाम</th>}
                      {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'center_name' && groupedSummarySelectedColumns.includes('center_names') && <th>केंद्र का नाम</th>}
                      {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'component' && groupedSummarySelectedColumns.includes('components') && <th>घटक</th>}
                      {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'unit' && groupedSummarySelectedColumns.includes('units') && <th>इकाई</th>}
                      {groupedSummarySelectedColumns.includes('totalAllocatedQuantity') && <th>आवंटित मात्रा</th>}
                      {groupedSummarySelectedColumns.includes('totalAllocated') && <th>आवंटित राशि</th>}
                      {groupedSummarySelectedColumns.includes('totalUpdated') && <th>अपडेट की गई राशि</th>}
                      {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'source_of_receipt' && groupedSummarySelectedColumns.includes('sources') && <th>स्रोत</th>}
                      {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'scheme_name' && groupedSummarySelectedColumns.includes('schemes') && <th>योजना</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {investmentSummaryData.map((item, index) => (
                      <React.Fragment key={index}>
                        <tr
                          className="grouped-summary-row"
                          style={{ cursor: 'pointer' }}
                          onClick={() => toggleInvestmentExpansion(item.group_name)}
                        >
                          {groupedSummarySelectedColumns.includes('sno') && <td>{index + 1}</td>}
                          {groupedSummarySelectedColumns.includes('group_name') && <td>{item.group_name}</td>}
                          {item.group_field !== 'investment_name' && groupedSummarySelectedColumns.includes('investment_names') && (
                            <td>
                              {item.investment_names.split(', ').map((name, i) => (
                                <Badge
                                  key={i}
                                  bg={expandedRowFilter[item.group_name]?.field === 'investment_name' && expandedRowFilter[item.group_name]?.value === name ? 'success' : 'secondary'}
                                  className="me-1 mb-1"
                                  style={{ cursor: 'pointer' }}
                                  onClick={(e) => handleItemClick(item.group_name, 'investment_name', name, e)}
                                >
                                  {name}
                                </Badge>
                              ))}
                            </td>
                          )}
                          {item.group_field !== 'center_name' && groupedSummarySelectedColumns.includes('center_names') && (
                            <td>
                              {item.center_names.split(', ').map((name, i) => (
                                <Badge
                                  key={i}
                                  bg={expandedRowFilter[item.group_name]?.field === 'center_name' && expandedRowFilter[item.group_name]?.value === name ? 'success' : 'secondary'}
                                  className="me-1 mb-1"
                                  style={{ cursor: 'pointer' }}
                                  onClick={(e) => handleItemClick(item.group_name, 'center_name', name, e)}
                                >
                                  {name}
                                </Badge>
                              ))}
                            </td>
                          )}
                          {item.group_field !== 'component' && groupedSummarySelectedColumns.includes('components') && (
                            <td>
                              {item.components.split(', ').map((name, i) => (
                                <Badge
                                  key={i}
                                  bg={expandedRowFilter[item.group_name]?.field === 'component' && expandedRowFilter[item.group_name]?.value === name ? 'success' : 'secondary'}
                                  className="me-1 mb-1"
                                  style={{ cursor: 'pointer' }}
                                  onClick={(e) => handleItemClick(item.group_name, 'component', name, e)}
                                >
                                  {name}
                                </Badge>
                              ))}
                            </td>
                          )}
                          {item.group_field !== 'unit' && groupedSummarySelectedColumns.includes('units') && (
                            <td>
                              {item.units.split(', ').map((name, i) => (
                                <Badge
                                  key={i}
                                  bg={expandedRowFilter[item.group_name]?.field === 'unit' && expandedRowFilter[item.group_name]?.value === name ? 'success' : 'secondary'}
                                  className="me-1 mb-1"
                                  style={{ cursor: 'pointer' }}
                                  onClick={(e) => handleItemClick(item.group_name, 'unit', name, e)}
                                >
                                  {name}
                                </Badge>
                              ))}
                            </td>
                          )}
                          {groupedSummarySelectedColumns.includes('totalAllocatedQuantity') && <td>{item.totalAllocatedQuantity.toFixed(2)}</td>}
                          {groupedSummarySelectedColumns.includes('totalAllocated') && <td>{formatCurrency(item.totalAllocated)}</td>}
                          {groupedSummarySelectedColumns.includes('totalUpdated') && <td>{formatCurrency(item.totalUpdated)}</td>}
                          {item.group_field !== 'source_of_receipt' && groupedSummarySelectedColumns.includes('sources') && (
                            <td>
                              {item.sources.split(', ').map((name, i) => (
                                <Badge
                                  key={i}
                                  bg={expandedRowFilter[item.group_name]?.field === 'source_of_receipt' && expandedRowFilter[item.group_name]?.value === name ? 'success' : 'secondary'}
                                  className="me-1 mb-1"
                                  style={{ cursor: 'pointer' }}
                                  onClick={(e) => handleItemClick(item.group_name, 'source_of_receipt', name, e)}
                                >
                                  {name}
                                </Badge>
                              ))}
                            </td>
                          )}
                          {item.group_field !== 'scheme_name' && groupedSummarySelectedColumns.includes('schemes') && (
                            <td>
                              {item.schemes.split(', ').map((name, i) => (
                                <Badge
                                  key={i}
                                  bg={expandedRowFilter[item.group_name]?.field === 'scheme_name' && expandedRowFilter[item.group_name]?.value === name ? 'success' : 'secondary'}
                                  className="me-1 mb-1"
                                  style={{ cursor: 'pointer' }}
                                  onClick={(e) => handleItemClick(item.group_name, 'scheme_name', name, e)}
                                >
                                  {name}
                                </Badge>
                              ))}
                            </td>
                          )}
                        </tr>
                        {expandedInvestments[item.group_name] && (
                          <tr>
                            <td colSpan="12">
                              <div className="p-3">
                                <h5 className="mb-3">
                                  {item.group_name} - {paginationTranslations.details}
                                  {expandedRowFilter[item.group_name] && (
                                    <Badge bg="info" className="ms-2">
                                      {formatFieldTitle(expandedRowFilter[item.group_name].field)}: {expandedRowFilter[item.group_name].value}
                                      <FaTimes
                                        className="ms-1"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setExpandedRowFilter(prev => {
                                          const newFilters = { ...prev };
                                          delete newFilters[item.group_name];
                                          return newFilters;
                                        })}
                                      />
                                    </Badge>
                                  )}
                                </h5>

                                {/* Column Selection Section for Component Details */}
                                <ColumnSelection
                                  columns={componentDetailColumns}
                                  selectedColumns={componentDetailSelectedColumns}
                                  setSelectedColumns={setComponentDetailSelectedColumns}
                                  title="घटक विवरण के लिए कॉलम चुनें"
                                />

                                <div className="d-flex justify-content-end mb-2">
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => {
                                      const filteredItems = getFilteredExpandedItems(item.group_name, item.items);
                                      downloadExcel(filteredItems, `${item.group_name}_Details_${new Date().toISOString().slice(0, 10)}`, componentDetailColumnMapping, componentDetailSelectedColumns, {
                                        allocated: filteredItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity || 0) * parseFloat(item.rate || 0)), 0),
                                        updated: filteredItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity || 0) * parseFloat(item.rate || 0)), 0),
                                        allocatedQuantity: filteredItems.reduce((sum, item) => sum + parseFloat(item.allocated_quantity || 0), 0),
                                        updatedQuantity: filteredItems.reduce((sum, item) => sum + parseFloat(item.updated_quantity || 0), 0)
                                      });
                                    }}
                                    className="me-2"
                                  >
                                    <FaFileExcel className="me-1" />Excel
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                      const filteredItems = getFilteredExpandedItems(item.group_name, item.items);
                                      downloadPdf(filteredItems, `${item.group_name}_Details_${new Date().toISOString().slice(0, 10)}`, componentDetailColumnMapping, componentDetailSelectedColumns, `${item.group_name} विवरण`, {
                                        allocated: filteredItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity || 0) * parseFloat(item.rate || 0)), 0),
                                        updated: filteredItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity || 0) * parseFloat(item.rate || 0)), 0),
                                        allocatedQuantity: filteredItems.reduce((sum, item) => sum + parseFloat(item.allocated_quantity || 0), 0),
                                        updatedQuantity: filteredItems.reduce((sum, item) => sum + parseFloat(item.updated_quantity || 0), 0)
                                      });
                                    }}
                                  >
                                    <FaFilePdf className="me-1" />
                                    PDF
                                  </Button>
                                </div>
                                <table className="responsive-table small-fonts">
                                  <thead>
                                    <tr>
                                      {componentDetailSelectedColumns.includes('sno') && <th>क्र.सं.</th>}
                                      {componentDetailSelectedColumns.includes('center_name') && <th>केंद्र का नाम</th>}
                                      {componentDetailSelectedColumns.includes('component') && <th>घटक</th>}
                                      {componentDetailSelectedColumns.includes('investment_name') && <th>निवेश का नाम</th>}
                                      {componentDetailSelectedColumns.includes('unit') && <th>इकाई</th>}
                                      {componentDetailSelectedColumns.includes('allocated_quantity') && <th>आवंटित मात्रा</th>}
                                      {componentDetailSelectedColumns.includes('rate') && <th>दर</th>}
                                      {componentDetailSelectedColumns.includes('allocated_amount') && <th>आवंटित राशि</th>}
                                      {componentDetailSelectedColumns.includes('updated_quantity') && <th>अपडेट की गई मात्रा</th>}
                                      {componentDetailSelectedColumns.includes('updated_amount') && <th>अपडेट की गई राशि</th>}
                                      {componentDetailSelectedColumns.includes('source_of_receipt') && <th>स्रोत</th>}
                                      {componentDetailSelectedColumns.includes('scheme_name') && <th>योजना</th>}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getFilteredExpandedItems(item.group_name, item.items).map((detailItem, detailIndex) => {
                                      const allocatedAmount = (parseFloat(detailItem.allocated_quantity) * parseFloat(detailItem.rate)).toFixed(2);
                                      const updatedAmount = (parseFloat(detailItem.updated_quantity) * parseFloat(detailItem.rate)).toFixed(2);
                                      return (
                                        <tr key={detailIndex}>
                                          {componentDetailSelectedColumns.includes('sno') && <td>{detailIndex + 1}</td>}
                                          {componentDetailSelectedColumns.includes('center_name') && <td>{detailItem.center_name}</td>}
                                          {componentDetailSelectedColumns.includes('component') && <td>{detailItem.component}</td>}
                                          {componentDetailSelectedColumns.includes('investment_name') && <td>{detailItem.investment_name}</td>}
                                          {componentDetailSelectedColumns.includes('unit') && <td>{detailItem.unit}</td>}
                                          {componentDetailSelectedColumns.includes('allocated_quantity') && <td>{detailItem.allocated_quantity}</td>}
                                          {componentDetailSelectedColumns.includes('rate') && <td>{detailItem.rate}</td>}
                                          {componentDetailSelectedColumns.includes('allocated_amount') && <td>{allocatedAmount}</td>}
                                          {componentDetailSelectedColumns.includes('updated_quantity') && <td>{detailItem.updated_quantity}</td>}
                                          {componentDetailSelectedColumns.includes('updated_amount') && <td>{updatedAmount}</td>}
                                          {componentDetailSelectedColumns.includes('source_of_receipt') && <td>{detailItem.source_of_receipt}</td>}
                                          {componentDetailSelectedColumns.includes('scheme_name') && <td>{detailItem.scheme_name}</td>}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                  <tfoot>
                                    <tr className="font-weight-bold">
                                      {componentDetailSelectedColumns.includes('sno') && <td>{paginationTranslations.total}</td>}
                                      {componentDetailSelectedColumns.includes('center_name') && <td></td>}
                                      {componentDetailSelectedColumns.includes('component') && <td></td>}
                                      {componentDetailSelectedColumns.includes('investment_name') && <td></td>}
                                      {componentDetailSelectedColumns.includes('unit') && <td></td>}
                                      {componentDetailSelectedColumns.includes('allocated_quantity') && <td>{getFilteredExpandedItems(item.group_name, item.items).reduce((sum, i) => sum + parseFloat(i.allocated_quantity || 0), 0).toFixed(2)}</td>}
                                      {componentDetailSelectedColumns.includes('rate') && <td></td>}
                                      {componentDetailSelectedColumns.includes('allocated_amount') && <td>{formatCurrency(getFilteredExpandedItems(item.group_name, item.items).reduce((sum, i) => sum + (parseFloat(i.allocated_quantity || 0) * parseFloat(i.rate || 0)), 0))}</td>}
                                      {componentDetailSelectedColumns.includes('updated_quantity') && <td>{getFilteredExpandedItems(item.group_name, item.items).reduce((sum, i) => sum + parseFloat(i.updated_quantity || 0), 0).toFixed(2)}</td>}
                                      {componentDetailSelectedColumns.includes('updated_amount') && <td>{formatCurrency(getFilteredExpandedItems(item.group_name, item.items).reduce((sum, i) => sum + (parseFloat(i.updated_quantity || 0) * parseFloat(i.rate || 0)), 0))}</td>}
                                      {componentDetailSelectedColumns.includes('source_of_receipt') && <td></td>}
                                      {componentDetailSelectedColumns.includes('scheme_name') && <td></td>}
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-weight-bold">
                      {groupedSummarySelectedColumns.includes('sno') ? <td>{paginationTranslations.total}</td> : (groupedSummarySelectedColumns.includes('group_name') ? <td>{paginationTranslations.total}</td> : null)}
                      {groupedSummarySelectedColumns.includes('sno') && groupedSummarySelectedColumns.includes('group_name') && <td></td>}
                      {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'investment_name' && groupedSummarySelectedColumns.includes('investment_names') && <td></td>}
                      {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'center_name' && groupedSummarySelectedColumns.includes('center_names') && <td></td>}
                      {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'component' && groupedSummarySelectedColumns.includes('components') && <td></td>}
                      {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'unit' && groupedSummarySelectedColumns.includes('units') && <td></td>}
                      {groupedSummarySelectedColumns.includes('totalAllocatedQuantity') && <td>{tableTotals.allocatedQuantity.toFixed(2)}</td>}
                      {groupedSummarySelectedColumns.includes('totalAllocated') && <td>{formatCurrency(tableTotals.allocated)}</td>}
                      {groupedSummarySelectedColumns.includes('totalUpdated') && <td>{formatCurrency(tableTotals.updated)}</td>}
                      {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'source_of_receipt' && groupedSummarySelectedColumns.includes('sources') && <td></td>}
                      {investmentSummaryData.length > 0 && investmentSummaryData[0].group_field !== 'scheme_name' && groupedSummarySelectedColumns.includes('schemes') && <td></td>}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Hierarchical View Section - Show when filters are active */}
            {Object.keys(activeFilters).length > 0 && (
              <div className="hierarchical-view-container mt-4">
                <h2 className="dynamic-table-heading small-fonts mb-3">
                  विस्तृत दृश्य
                  <span className="heading-totals">
                    (कुल आवंटित: {formatCurrency(tableTotals.allocated)}, कुल अपडेट किया गया: {formatCurrency(tableTotals.updated)})
                  </span>
                </h2>

                <div className="d-flex justify-content-end mb-2">
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => downloadExcel(filteredTableData, `Hierarchical_Billing_Data_${new Date().toISOString().slice(0, 10)}`, mainTableColumnMapping, mainTableSelectedColumns, tableTotals)}
                    className="me-2"
                  >
                    <FaFileExcel className="me-1" />Excel
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => downloadPdf(filteredTableData, `Hierarchical_Billing_Data_${new Date().toISOString().slice(0, 10)}`, mainTableColumnMapping, mainTableSelectedColumns, "विस्तृत दृश्य", tableTotals)}
                  >
                    <FaFilePdf className="me-1" />
                    PDF
                  </Button>
                </div>

                {renderHierarchicalView()}
              </div>
            )}
          </Container>
        </div>
      </div>
    </>
  );
};

export default MainDashboard;