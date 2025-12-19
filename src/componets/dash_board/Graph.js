import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Row, Col, Form, Button, Spinner, Alert, Card, OverlayTrigger, Tooltip, Badge, Table, Pagination, Collapse } from "react-bootstrap";
import { FaArrowLeft, FaTimes, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";
import "../../assets/css/graph.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";

// Hindi translations
const translations = {
  dashboard: "डैशबोर्ड",
  graphs: "ग्राफ़",
  filters: "फिल्टर",
  clearAllFilters: "सभी फिल्टर हटाएं",
  centerName: "केंद्र का नाम",
  component: "घटक",
  investmentName: "निवेश का नाम",
  unit: "इकाई",
  sourceOfReceipt: "प्राप्ति का स्रोत",
  allocatedQuantity: "आवंटित मात्रा",
  updatedQuantity: "बेची गई मात्रा",
  remainingQuantity: "शेष मात्रा",
  rate: "दर",
  amount: "राशि",
  loading: "लोड हो रहा है...",
  noItemsFound: "कोई बिलिंग आइटम नहीं मिला।",
  noMatchingItems: "चयनित फिल्टर से मेल खाने वाली कोई आइटम नहीं मिली।",
  showingItems: "दिखा रहे हैं",
  of: "की",
  items: "आइटम्स",
  page: "पृष्ठ",
  previous: "पिछला",
  next: "अगला",
  allCenters: "सभी केंद्र",
  allComponents: "सभी घटक",
  allInvestments: "सभी निवेश",
  allUnits: "सभी इकाइयाँ",
  allSources: "सभी स्रोत",
  allSchemes: "सभी योजनाएं",
  schemeName: "योजना का नाम",
  selectSourceFirst: "पहले स्रोत चुनें",
  selectCenterFirst: "पहले केंद्र चुनें",
  selectSchemeFirst: "पहले योजना चुनें",
  selectComponentFirst: "पहले घटक चुनें",
  selectInvestmentFirst: "पहले निवेश चुनें",
  selectUnitFirst: "पहले इकाई चुनें",
  generateGraph: "ग्राफ उत्पन्न करें",
  fetchError: "डेटा लाने में विफल। कृपया बाद में पुन: प्रयास करें।",
  networkError: "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।",
  serverError: "सर्वर त्रुटि। कृपया बाद में पुन: प्रयास करें।",
  dataError: "डेटा प्रोसेस करने में त्रुटि।",
  retry: "पुनः प्रयास करें",
  totalAllocated: "कुल आवंटित मात्रा",
  totalSold: "कुल बेची गई मात्रा",
  totalRemaining: "कुल शेष मात्रा",
  totalValue: "कुल मूल्य",
  totalSoldValue: "कुल बिक्री मूल्य",
  totalRemainingValue: "कुल शेष मूल्य",
  itemsBySource: "स्रोत के अनुसार आइटम",
  itemsByCenter: "केंद्र के अनुसार आइटम",
  itemsByComponent: "घटक के अनुसार आइटम",
  quantityDistribution: "मात्रा वितरण",
  valueDistribution: "मूल्य वितरण",
  filterBy: "फिल्टर द्वारा",
  overallData: "समग्र डेटा",
  filteredData: "फिल्टर किया गया डेटा",
  filtersApplied: "फिल्टर लागू हैं",
  source: "स्रोत",
  center: "केंद्र",
  component: "घटक",
  investment: "निवेश",
  unit: "इकाई",
  scheme: "योजना",
  quantity: "मात्रा",
  value: "मूल्य",
  percentage: "प्रतिशत",
  allDataBelongsTo: "सभी डेटा का संबंध है:",
  dataView: "डेटा दृश्य",
  allocatedData: "आवंटित डेटा",
  soldData: "बेचा गया डेटा",
  remainingData: "शेष डेटा",
  comparisonData: "तुलनात्मक डेटा",
  workingItems: "कार्यशील आइटम्स (शेष मात्रा > 0)",
  showComparison: "आवंटित बनाम बेचा गया दिखाएं",
  allocatedVsSold: "आवंटित बनाम बेचा गया",
  remainingItems: "शेष आइटम्स",
  allocatedQuantityLabel: "आवंटित मात्रा (इकाइयों में)",
  soldQuantityLabel: "बेची गई मात्रा (इकाइयों में)",
  remainingQuantityLabel: "शेष मात्रा (इकाइयों में)",
  allocatedValueLabel: "आवंटित मूल्य (₹ में)",
  soldValueLabel: "बिक्री मूल्य (₹ में)",
  remainingValueLabel: "शेष मूल्य (₹ में)",
  allocatedItemsByCenter: "केंद्र के अनुसार आवंटित मात्रा",
  soldItemsByCenter: "केंद्र के अनुसार बेची गई मात्रा",
  remainingItemsByCenter: "केंद्र के अनुसार शेष मात्रा",
  allocatedItemsBySource: "स्रोत के अनुसार आवंटित मात्रा",
  soldItemsBySource: "स्रोत के अनुसार बेची गई मात्रा",
  remainingItemsBySource: "स्रोत के अनुसार शेष मात्रा",
  allocatedItemsByComponent: "घटक के अनुसार आवंटित मात्रा",
  soldItemsByComponent: "घटक के अनुसार बेची गई मात्रा",
  remainingItemsByComponent: "घटक के अनुसार शेष मात्रा",
  allocatedItemsByScheme: "योजना के अनुसार आवंटित मात्रा",
  soldItemsByScheme: "योजना के अनुसार बेची गई मात्रा",
  remainingItemsByScheme: "योजना के अनुसार शेष मात्रा",
  allocatedValueBySource: "स्रोत के अनुसार आवंटित मूल्य",
  soldValueBySource: "स्रोत के अनुसार बिक्री मूल्य",
  remainingValueBySource: "स्रोत के अनुसार शेष मूल्य",
  inUnits: "(इकाइयों में)",
  inThousands: "(हजारों में)",
  inLakhs: "(लाखों में)",
  inCrores: "(करोड़ों में)",
  inRupees: "(₹ में)",
  inThousandsRupees: "(हजार ₹ में)",
  inLakhsRupees: "(लाख ₹ में)",
  inCroresRupees: "(करोड़ ₹ में)",
  activeFilters: "सक्रिय फ़िल्टर",
  removeFilter: "फ़िल्टर हटाएं",
  backToGraph: "ग्राफ पर वापस जाएं",
  detailsFor: "के लिए विवरण",
  noDataForFilter: "इस फ़िल्टर के लिए कोई डेटा नहीं",
  selectMultiple: "एकाधिक चयन करें",
  clearFilter: "फ़िल्टर साफ़ करें",
  srNo: "क्र.सं.",
  allocatedAmount: "आवंटित राशि",
  soldQuantity: "बेची गई मात्रा",
  soldAmount: "बिक्री राशि",
  remainingAmount: "शेष राशि",
  downloadExcel: "Excel",
  downloadPdf: "PDF",
  showing: "दिखा रहे हैं",
  to: "से",
  entries: "प्रविष्टियां",
  selectColumns: "कॉलम चुनें",
  selectAll: "सभी चुनें",
  deselectAll: "सभी हटाएं",
  total: "कुल"
};

// Function to format large numbers with appropriate units
const formatNumberWithUnit = (value, isCurrency = false) => {
  if (value === 0) return { value: 0, unit: isCurrency ? translations.inRupees : translations.inUnits };
  
  const absValue = Math.abs(value);
  let unit = isCurrency ? translations.inRupees : translations.inUnits;
  let formattedValue = value;
  
  if (absValue >= 10000000) { // 1 Crore or more
    formattedValue = value / 10000000;
    unit = isCurrency ? translations.inCroresRupees : translations.inCrores;
  } else if (absValue >= 100000) { // 1 Lakh or more
    formattedValue = value / 100000;
    unit = isCurrency ? translations.inLakhsRupees : translations.inLakhs;
  } else if (absValue >= 1000) { // 1 Thousand or more
    formattedValue = value / 1000;
    unit = isCurrency ? translations.inThousandsRupees : translations.inThousands;
  }
  
  return {
    value: formattedValue,
    unit: unit
  };
};

// Function to format number for display
const formatNumber = (value, decimals = 2) => {
  return parseFloat(value).toFixed(decimals);
};

// Function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Available columns for DetailView table
const detailViewColumns = [
  { key: 'srNo', label: translations.srNo },
  { key: 'centerName', label: translations.centerName },
  { key: 'component', label: translations.component },
  { key: 'investmentName', label: translations.investmentName },
  { key: 'unit', label: translations.unit },
  { key: 'allocatedQuantity', label: translations.allocatedQuantity },
  { key: 'rate', label: translations.rate },
  { key: 'allocatedAmount', label: translations.allocatedAmount },
  { key: 'soldQuantity', label: translations.soldQuantity },
  { key: 'soldAmount', label: translations.soldAmount },
  { key: 'remainingQuantity', label: translations.remainingQuantity },
  { key: 'remainingAmount', label: translations.remainingAmount },
  { key: 'source', label: translations.source },
  { key: 'scheme', label: translations.schemeName }
];

// Column mapping for DetailView table
const detailViewColumnMapping = {
  srNo: { header: translations.srNo, accessor: (item, index, currentPage, itemsPerPage) => (currentPage - 1) * itemsPerPage + index + 1 },
  centerName: { header: translations.centerName, accessor: (item) => item.center_name },
  component: { header: translations.component, accessor: (item) => item.component },
  investmentName: { header: translations.investmentName, accessor: (item) => item.investment_name },
  unit: { header: translations.unit, accessor: (item) => item.unit },
  allocatedQuantity: { header: translations.allocatedQuantity, accessor: (item) => item.allocated_quantity },
  rate: { header: translations.rate, accessor: (item) => item.rate },
  allocatedAmount: { header: translations.allocatedAmount, accessor: (item) => formatCurrency(parseFloat(item.allocated_quantity) * parseFloat(item.rate)) },
  soldQuantity: { header: translations.soldQuantity, accessor: (item) => item.updated_quantity },
  soldAmount: { header: translations.soldAmount, accessor: (item) => formatCurrency(parseFloat(item.updated_quantity) * parseFloat(item.rate)) },
  remainingQuantity: { header: translations.remainingQuantity, accessor: (item) => (parseFloat(item.allocated_quantity) - parseFloat(item.updated_quantity)).toFixed(2) },
  remainingAmount: { header: translations.remainingAmount, accessor: (item) => formatCurrency((parseFloat(item.allocated_quantity) - parseFloat(item.updated_quantity)) * parseFloat(item.rate)) },
  source: { header: translations.source, accessor: (item) => item.source_of_receipt },
  scheme: { header: translations.scheme, accessor: (item) => item.scheme_name }
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
            {translations.selectAll}
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={handleDeselectAll}>
            {translations.deselectAll}
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

// Custom Pie Chart Component with Hover Tooltips and 100% case handling
const PieChart = ({ data, title, dataType, onBarClick, chartType }) => {
  if (!data || data.length === 0) return null;

  const colors = [
    '#2C3E50', '#34495E', '#1F618D', '#27AE60', 
    '#16A085', '#F39C12', '#E74C3C', '#7F8C8D',
    '#28a745', '#17a2b8', '#6c757d', '#fd7e14'
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const isFullCircle = data.length === 1;
  const centerX = 150;
  const centerY = 150;
  const radius = 100;

  // Determine appropriate unit based on maximum value
  const maxValue = Math.max(...data.map(item => item.value));
  const { value: scaledMaxValue, unit: displayUnit } = formatNumberWithUnit(maxValue, dataType === 'value');
  const scaleFactor = scaledMaxValue / maxValue;

  let currentAngle = -90; // Start from top

  const createPieSlice = (startAngle, endAngle, color, label, value, percentage) => {
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
    
    const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    const tooltip = (
      <Tooltip id={`tooltip-${label.replace(/\s+/g, '-').toLowerCase()}`}>
        <strong>{label}</strong><br/>
        {dataType === 'quantity' ? 
          `मात्रा: ${formatNumber(value)} (${percentage.toFixed(1)}%)` : 
          `मूल्य: ₹${formatNumber(value)} (${percentage.toFixed(1)}%)`
        }
      </Tooltip>
    );

    return (
      <OverlayTrigger
        key={label}
        placement="top"
        overlay={tooltip}
      >
        <path
          d={pathData}
          fill={color}
          stroke={isFullCircle ? '#333' : '#fff'} // Darker stroke for full circle
          strokeWidth={isFullCircle ? 3 : 2} // Wider stroke for full circle
          className="pie-slice"
          style={{ cursor: 'pointer' }}
          onClick={() => onBarClick && onBarClick(label, value, null, chartType)}
        />
      </OverlayTrigger>
    );
  };

  const pieSlices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const sliceColor = colors[index % colors.length];
    
    const slice = createPieSlice(
      startAngle, 
      endAngle, 
      sliceColor, 
      item.name, 
      item.value, 
      percentage
    );
    
    currentAngle = endAngle;
    return slice;
  });

  return (
    <Card className="pie-chart-card">
      <Card.Header className="small-fonts text-center">{title}</Card.Header>
      <Card.Body className="text-center">
        {isFullCircle && (
          <Alert variant="info" className="small-fonts mt-2 mb-3">
            {translations.allDataBelongsTo} <strong>{data[0].name}</strong>
          </Alert>
        )}
        <div className="pie-chart-container">
            <svg width="400" height="400" viewBox="0 0 300 300">
            {pieSlices}
          </svg>
        </div>
        
        {!isFullCircle && (
          <div className="">
            <Row>
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const scaledValue = item.value * scaleFactor;
                return (
                  <Col md={6} key={item.name} className="mb-2">
                    <div className="legend-item" onClick={() => onBarClick && onBarClick(item.name, item.value, null, chartType)} style={{ cursor: 'pointer' }}>
                      <div
                        className="legend-color-box"
                        style={{
                          backgroundColor: colors[index % colors.length],
                          cursor: 'pointer'
                        }}
                        onClick={() => onBarClick && onBarClick(item.name, item.value, null, chartType)}
                      />
                      <span className="small-fonts">
                        {item.name}: {dataType === 'quantity' ? 
                          `${formatNumber(scaledValue)} ${displayUnit} (${percentage.toFixed(1)}%)` : 
                          `₹${formatNumber(scaledValue)} ${displayUnit} (${percentage.toFixed(1)}%)`
                        }
                      </span>
                    </div>
                  </Col>
                );
              })}
            </Row>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Custom Comparison Bar Chart Component
const ComparisonBarChart = ({ data, title, onBarClick }) => {
  if (!data || data.length === 0) return null;

  const colors = {
    allocated: '#2C3E50',
    sold: '#E74C3C',
    remaining: '#27AE60'
  };

  const maxValue = Math.max(...data.map(item => Math.max(item.allocated, item.sold, item.remaining)));
  const { value: scaledMaxValue, unit: displayUnit } = formatNumberWithUnit(maxValue, false);
  const scaleFactor = scaledMaxValue / maxValue;
  
  const barWidth = 30;
  const chartHeight = 450;
  const chartWidth = 600;
  const margin = { top: 20, right: 20, bottom: 80, left: 50 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const tooltip = (label, type, value) => (
    <Tooltip id={`tooltip-${label.replace(/\s+/g, '-').toLowerCase()}-${type}`}>
      <strong>{label}</strong><br/>
      {type === "आवंटित" ? `आवंटित मात्रा: ${formatNumber(value)} इकाइयाँ` :
       type === "बेचा गया" ? `बेची गई मात्रा: ${formatNumber(value)} इकाइयाँ` :
       `शेष मात्रा: ${formatNumber(value)} इकाइयाँ`}
    </Tooltip>
  );

  return (
    <Card className="comparison-chart-card">
      <Card.Header className="small-fonts text-center">{title}</Card.Header>
      <Card.Body className="text-center">
        <div className="comparison-chart-container">
          <svg width={chartWidth} height={chartHeight} style={{ maxWidth: '100%', height: 'auto' }}>
            {/* Y-axis */}
            <line x1={margin.left} y1={margin.top} x2={margin.left} y2={innerHeight + margin.top} stroke="#333" />
            
            {/* X-axis */}
            <line x1={margin.left} y1={innerHeight + margin.top} x2={innerWidth + margin.left} y2={innerHeight + margin.top} stroke="#333" />
            
            {/* Y-axis labels */}
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map(tick => {
              const y = innerHeight + margin.top - (tick * innerHeight);
              const value = formatNumber(tick * scaledMaxValue);
              return (
                <g key={tick}>
                  <line x1={margin.left - 5} y1={y} x2={margin.left} y2={y} stroke="#333" />
                  <text x={margin.left - 10} y={y + 5} textAnchor="end" fontSize="12">{value}</text>
                </g>
              );
            })}
            
            {/* Y-axis unit label */}
            <text x={10} y={margin.top} textAnchor="start" fontSize="10" transform={`rotate(-90, 10, ${margin.top})`}>
              {displayUnit}
            </text>
            
            {/* Bars and X-axis labels */}
            {data.map((item, index) => {
              const x = margin.left + (index * (innerWidth / data.length)) + (innerWidth / data.length) / 2;
              const groupWidth = innerWidth / data.length;
              const barSpacing = 5;
              const actualBarWidth = Math.min((innerWidth / data.length * 0.95) / 3, 10);
              
              const allocatedHeight = Math.max(5, (item.allocated / maxValue) * innerHeight);
              const soldHeight = Math.max(5, (item.sold / maxValue) * innerHeight);
              const remainingHeight = Math.max(5, (item.remaining / maxValue) * innerHeight);
              
              const allocatedY = innerHeight + margin.top - allocatedHeight;
              const soldY = innerHeight + margin.top - soldHeight;
              const remainingY = innerHeight + margin.top - remainingHeight;
              
              return (
                <g key={item.name}>
                  {/* Allocated bar */}
                  <OverlayTrigger
                    placement="top"
                    overlay={tooltip(item.name, "आवंटित", item.allocated)}
                  >
                    <rect
                      x={x - actualBarWidth - barSpacing}
                      y={allocatedY}
                      width={actualBarWidth}
                      height={allocatedHeight}
                      fill={colors.allocated}
                      className="bar-chart-bar"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onBarClick && onBarClick(item.name, item.allocated, 'allocated')}
                    />
                  </OverlayTrigger>
                  
                  {/* Sold bar */}
                  <OverlayTrigger
                    placement="top"
                    overlay={tooltip(item.name, "बेचा गया", item.sold)}
                  >
                    <rect
                      x={x}
                      y={soldY}
                      width={actualBarWidth}
                      height={soldHeight}
                      fill={colors.sold}
                      className="bar-chart-bar"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onBarClick && onBarClick(item.name, item.sold, 'sold')}
                    />
                  </OverlayTrigger>
                  
                  {/* Remaining bar */}
                  <OverlayTrigger
                    placement="top"
                    overlay={tooltip(item.name, "शेष", item.remaining)}
                  >
                    <rect
                      x={x + actualBarWidth + barSpacing}
                      y={remainingY}
                      width={actualBarWidth}
                      height={remainingHeight}
                      fill={colors.remaining}
                      className="bar-chart-bar"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onBarClick && onBarClick(item.name, item.remaining, 'remaining')}
                    />
                  </OverlayTrigger>
                  
                  {/* X-axis label */}
                  <text
                  x={x}
                  y={innerHeight + margin.top + 20}
                  textAnchor="middle"
                  fontSize="14"
                  transform={`rotate(-45, ${x}, ${innerHeight + margin.top + 20})`}
                  >
                  {item.name}
                  </text>
                </g>
              );
            })}
            
            {/* Legend */}
            <g transform={`translate(${chartWidth - 150}, 20)`}>
              <rect x={0} y={0} width={15} height={15} fill={colors.allocated} />
              <text x={20} y={12} fontSize="14">आवंटित मात्रा</text>
              
              <rect x={0} y={20} width={15} height={15} fill={colors.sold} />
              <text x={20} y={32} fontSize="14">बेची गई मात्रा</text>
              
              <rect x={0} y={40} width={15} height={15} fill={colors.remaining} />
              <text x={20} y={52} fontSize="14">शेष मात्रा</text>
            </g>
          </svg>
        </div>
      </Card.Body>
    </Card>
  );
};

// Simple Bar Chart Component
const SimpleBarChart = ({ data, title, dataType, onBarClick, chartType }) => {
  if (!data || data.length === 0) return null;

  const colors = [
    '#2C3E50', '#34495E', '#1F618D', '#27AE60',
    '#16A085', '#F39C12', '#E74C3C', '#7F8C8D',
    '#28a745', '#17a2b8', '#6c757d', '#fd7e14'
  ];

  const maxValue = Math.max(...data.map(item => item.value));
  const { value: scaledMaxValue, unit: displayUnit } = formatNumberWithUnit(maxValue, dataType === 'value');
  const scaleFactor = scaledMaxValue / maxValue;

  const chartHeight = 450;
  const chartWidth = 600;
  const margin = { top: 20, right: 20, bottom: 80, left: 50 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;
  const barWidth = Math.max(5, innerWidth / data.length * 0.95);

  const tooltip = (label, value) => (
    <Tooltip id={`tooltip-${label.replace(/\s+/g, '-').toLowerCase()}`}>
      <strong>{label}</strong><br/>
      {dataType === 'quantity' ? 
        `मात्रा: ${formatNumber(value)}` : 
        `मूल्य: ₹${formatNumber(value)}`
      }
    </Tooltip>
  );

  return (
    <Card className="bar-chart-card">
      <Card.Header className="small-fonts text-center">{title}</Card.Header>
      <Card.Body className="text-center">
        <div className="bar-chart-container">
          <svg width={chartWidth} height={chartHeight} style={{ maxWidth: '100%', height: 'auto' }}>
            {/* Y-axis */}
            <line x1={margin.left} y1={margin.top} x2={margin.left} y2={innerHeight + margin.top} stroke="#333" />
            
            {/* X-axis */}
            <line x1={margin.left} y1={innerHeight + margin.top} x2={innerWidth + margin.left} y2={innerHeight + margin.top} stroke="#333" />
            
            {/* Y-axis labels */}
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map(tick => {
              const y = innerHeight + margin.top - (tick * innerHeight);
              const value = formatNumber(tick * scaledMaxValue);
              return (
                <g key={tick}>
                  <line x1={margin.left - 5} y1={y} x2={margin.left} y2={y} stroke="#333" />
                  <text x={margin.left - 10} y={y + 5} textAnchor="end" fontSize="14">{value}</text>
                </g>
              );
            })}
            
            {/* Y-axis unit label */}
            <text x={10} y={margin.top} textAnchor="start" fontSize="12" transform={`rotate(-90, 10, ${margin.top})`}>
              {displayUnit}
            </text>
            
            {/* Bars and X-axis labels */}
            {data.map((item, index) => {
              const x = margin.left + (index * (innerWidth / data.length)) + (innerWidth / data.length - barWidth) / 2;
              const barHeight = Math.max(5, (item.value / maxValue) * innerHeight);
              const y = innerHeight + margin.top - barHeight;
              
              return (
                <g key={item.name}>
                  {/* Bar */}
                  <OverlayTrigger
                    placement="top"
                    overlay={tooltip(item.name, item.value)}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={colors[index % colors.length]}
                      className="bar-chart-bar"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onBarClick && onBarClick(item.name, item.value, null, chartType)}
                    />
                  </OverlayTrigger>
                  
                  {/* X-axis label */}
                  <text
                  x={x + barWidth / 2}
                  y={innerHeight + margin.top + 20}
                  textAnchor="middle"
                  fontSize="14"
                  transform={`rotate(-45, ${x + barWidth / 2}, ${innerHeight + margin.top + 20})`}
                  >
                  {item.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="mt-3">
          <Row>
            {data.map((item, index) => {
              const percentage = (item.value / data.reduce((sum, i) => sum + i.value, 0)) * 100;
              const scaledValue = item.value * scaleFactor;
              return (
                <Col md={6} key={item.name} className="mb-2">
                  <div className="legend-item" onClick={() => onBarClick && onBarClick(item.name, item.value, null, chartType)} style={{ cursor: 'pointer' }}>
                    <div 
                      className="legend-color-box"
                      style={{
                        backgroundColor: colors[index % colors.length],
                      }}
                    />
                    <span className="small-fonts">
                      {item.name}: {dataType === 'quantity' ? 
                        `${formatNumber(scaledValue)} ${displayUnit} (${percentage.toFixed(1)}%)` : 
                        `₹${formatNumber(scaledValue)} ${displayUnit} (${percentage.toFixed(1)}%)`
                      }
                    </span>
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

// Custom Summary Card Component
const SummaryCard = ({ title, value, unit, icon, color }) => (
  <Card className="summary-card h-100">
    <Card.Body className="d-flex flex-column align-items-center justify-content-center">
      <div className="summary-icon mb-3">
        <div 
          className="d-flex align-items-center justify-content-center"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: color,
          }}
        >
          <i className={`fas ${icon} text-white fa-lg`}></i>
        </div>
      </div>
      <div className="summary-details text-center">
        <h4>{value}</h4>
        <p className="small-fonts">{unit}</p>
      </div>
    </Card.Body>
  </Card>
);

// Detail View Component for showing details when a bar is clicked
const DetailView = ({ title, data, onBack, dataType, filterType, selectedColumns, setSelectedColumns }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [localSelectedColumns, setLocalSelectedColumns] = useState(selectedColumns || detailViewColumns.map(col => col.key));
  
  // Use local state if selectedColumns is not provided
  const effectiveSelectedColumns = selectedColumns || localSelectedColumns;
  const effectiveSetSelectedColumns = setSelectedColumns || setLocalSelectedColumns;
  
  // Filter data based on filterType
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // If filterType is 'sold', only show items that have been sold
    if (filterType === 'sold') {
      return data.filter(item => parseFloat(item.updated_quantity) > 0);
    }
    
    // If filterType is 'remaining', only show items with remaining quantity
    if (filterType === 'remaining') {
      return data.filter(item => {
        const allocated = parseFloat(item.allocated_quantity) || 0;
        const sold = parseFloat(item.updated_quantity) || 0;
        return (allocated - sold) > 0;
      });
    }
    
    // For 'allocated' or any other type, show all items
    return data;
  }, [data, filterType]);
  
  // Calculate totals
  const totals = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        allocated: 0,
        allocatedValue: 0,
        sold: 0,
        soldValue: 0,
        remaining: 0,
        remainingValue: 0
      };
    }
    
    return filteredData.reduce((acc, item) => {
      const allocated = parseFloat(item.allocated_quantity) || 0;
      const sold = parseFloat(item.updated_quantity) || 0;
      const remaining = allocated - sold;
      const rate = parseFloat(item.rate) || 0;
      
      acc.allocated += allocated;
      acc.allocatedValue += allocated * rate;
      acc.sold += sold;
      acc.soldValue += sold * rate;
      acc.remaining += remaining;
      acc.remainingValue += remaining * rate;
      
      return acc;
    }, {
      allocated: 0,
      allocatedValue: 0,
      sold: 0,
      soldValue: 0,
      remaining: 0,
      remainingValue: 0
    });
  }, [filteredData]);
  
  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
 // In the DetailView component, modify the downloadExcel function:

const downloadExcel = () => {
  try {
    // Use all filtered data for Excel export, not just paginated data
    const excelData = filteredData.map((item, index) => {
      const row = {};
      effectiveSelectedColumns.forEach(col => {
        // Use the same accessor as in the table to ensure consistency
        row[detailViewColumnMapping[col].header] = detailViewColumnMapping[col].accessor(item, index + 1, 1, filteredData.length);
      });
      return row;
    });
    
    // Add totals row at the end (directly after data)
    const totalsRow = {};
    
    // Iterate through selected columns in order to maintain alignment
    effectiveSelectedColumns.forEach(col => {
      if (col === 'srNo') {
        totalsRow[detailViewColumnMapping[col].header] = translations.total || "कुल";
      } else if (col === 'centerName' || col === 'component' || col === 'investmentName' || 
                 col === 'unit' || col === 'source' || col === 'scheme') {
        totalsRow[detailViewColumnMapping[col].header] = "";
      } else if (col === 'rate') {
        totalsRow[detailViewColumnMapping[col].header] = "-";
      } else if (col === 'allocatedQuantity') {
        totalsRow[detailViewColumnMapping[col].header] = totals.allocated.toFixed(2);
      } else if (col === 'allocatedAmount') {
        totalsRow[detailViewColumnMapping[col].header] = formatCurrency(totals.allocatedValue);
      } else if (col === 'soldQuantity') {
        totalsRow[detailViewColumnMapping[col].header] = totals.sold.toFixed(2);
      } else if (col === 'soldAmount') {
        totalsRow[detailViewColumnMapping[col].header] = formatCurrency(totals.soldValue);
      } else if (col === 'remainingQuantity') {
        totalsRow[detailViewColumnMapping[col].header] = totals.remaining.toFixed(2);
      } else if (col === 'remainingAmount') {
        totalsRow[detailViewColumnMapping[col].header] = formatCurrency(totals.remainingValue);
      }
    });
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([...excelData, totalsRow]);
    
    // Set column widths
    const colWidths = effectiveSelectedColumns.map(() => ({ wch: 15 }));
    ws['!cols'] = colWidths;
    
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
    
    XLSX.utils.book_append_sheet(wb, ws, "Details");
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  } catch (e) {
    console.error("Error generating Excel file:", e);
  }
};

// And modify the downloadPdf function:

const downloadPdf = () => {
  try {
    // Use all filtered data for PDF export, not just paginated data
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
              <tr>
                ${effectiveSelectedColumns.map(col => `<th>${detailViewColumnMapping[col].header}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((item, index) => {
                // Calculate values using the same logic as the table
                const allocated = parseFloat(item.allocated_quantity) || 0;
                const sold = parseFloat(item.updated_quantity) || 0;
                const remaining = allocated - sold;
                const rate = parseFloat(item.rate) || 0;
                const allocatedValue = allocated * rate;
                const soldValue = sold * rate;
                const remainingValue = remaining * rate;
                
                return `
                  <tr>
                    ${effectiveSelectedColumns.map(col => {
                      if (col === 'srNo') {
                        return `<td>${detailViewColumnMapping.srNo.accessor(item, index + 1, 1, filteredData.length)}</td>`;
                      } else if (col === 'centerName') {
                        return `<td>${detailViewColumnMapping.centerName.accessor(item)}</td>`;
                      } else if (col === 'component') {
                        return `<td>${detailViewColumnMapping.component.accessor(item)}</td>`;
                      } else if (col === 'investmentName') {
                        return `<td>${detailViewColumnMapping.investmentName.accessor(item)}</td>`;
                      } else if (col === 'unit') {
                        return `<td>${detailViewColumnMapping.unit.accessor(item)}</td>`;
                      } else if (col === 'allocatedQuantity') {
                        return `<td>${detailViewColumnMapping.allocatedQuantity.accessor(item)}</td>`;
                      } else if (col === 'rate') {
                        return `<td>${detailViewColumnMapping.rate.accessor(item)}</td>`;
                      } else if (col === 'allocatedAmount') {
                        return `<td>${detailViewColumnMapping.allocatedAmount.accessor(item)}</td>`;
                      } else if (col === 'soldQuantity') {
                        return `<td>${detailViewColumnMapping.soldQuantity.accessor(item)}</td>`;
                      } else if (col === 'soldAmount') {
                        return `<td>${detailViewColumnMapping.soldAmount.accessor(item)}</td>`;
                      } else if (col === 'remainingQuantity') {
                        return `<td>${detailViewColumnMapping.remainingQuantity.accessor(item)}</td>`;
                      } else if (col === 'remainingAmount') {
                        return `<td>${detailViewColumnMapping.remainingAmount.accessor(item)}</td>`;
                      } else if (col === 'source') {
                        return `<td>${detailViewColumnMapping.source.accessor(item)}</td>`;
                      } else if (col === 'scheme') {
                        return `<td>${detailViewColumnMapping.scheme.accessor(item)}</td>`;
                      }
                      return `<td></td>`;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
              <!-- Totals row directly after data -->
              <tr class="totals-row">
                ${effectiveSelectedColumns.map(col => {
                  if (col === 'srNo') {
                    return `<td>${translations.total || "कुल"}</td>`;
                  } else if (col === 'centerName' || col === 'component' || col === 'investmentName' || 
                             col === 'unit' || col === 'source' || col === 'scheme') {
                    return `<td></td>`;
                  } else if (col === 'rate') {
                    return `<td>-</td>`;
                  } else if (col === 'allocatedQuantity') {
                    return `<td>${totals.allocated.toFixed(2)}</td>`;
                  } else if (col === 'allocatedAmount') {
                    return `<td>${formatCurrency(totals.allocatedValue)}</td>`;
                  } else if (col === 'soldQuantity') {
                    return `<td>${totals.sold.toFixed(2)}</td>`;
                  } else if (col === 'soldAmount') {
                    return `<td>${formatCurrency(totals.soldValue)}</td>`;
                  } else if (col === 'remainingQuantity') {
                    return `<td>${totals.remaining.toFixed(2)}</td>`;
                  } else if (col === 'remainingAmount') {
                    return `<td>${formatCurrency(totals.remainingValue)}</td>`;
                  }
                  return `<td></td>`;
                }).join('')}
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
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000); // Increased timeout to ensure content is fully loaded
    };
  } catch (e) {
    console.error("Error generating PDF:", e);
  }
};
  
  // Toggle row expansion
  const toggleRowExpansion = (index) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index);
    } else {
      newExpandedRows.add(index);
    }
    setExpandedRows(newExpandedRows);
  };

  // Pagination controls
  const paginationItems = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  if (startPage > 1) {
    paginationItems.push(<Pagination.Item key={1} onClick={() => setCurrentPage(1)}>1</Pagination.Item>);
    if (startPage > 2) {
      paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }
  }
  
  for (let number = startPage; number <= endPage; number++) {
    paginationItems.push(
      <Pagination.Item 
        key={number} 
        active={number === currentPage}
        onClick={() => setCurrentPage(number)}
      >
        {number}
      </Pagination.Item>
    );
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
    }
    paginationItems.push(<Pagination.Item key={totalPages} onClick={() => setCurrentPage(totalPages)}>{totalPages}</Pagination.Item>);
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <Card className="detail-view-card">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">{title}</h5>
          <Button variant="outline-secondary" size="sm" onClick={onBack}>
            <FaArrowLeft className="me-1" /> {translations.backToGraph}
          </Button>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">{translations.noDataForFilter}</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="detail-view-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{title}</h5>
        <div className="d-flex gap-2">
          <Button variant="outline-success" size="sm" onClick={downloadExcel}>
            <FaFileExcel className="me-1" /> {translations.downloadExcel}
          </Button>
          <Button variant="outline-danger" size="sm" onClick={downloadPdf}>
            <FaFilePdf className="me-1" /> {translations.downloadPdf}
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={onBack}>
            <FaArrowLeft className="me-1" /> {translations.backToGraph}
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="table-info mb-2 d-flex justify-content-between align-items-center">
          <span className="small-fonts">
            {translations.showing} {startIndex + 1} {translations.to} {Math.min(endIndex, filteredData.length)} {translations.of} {filteredData.length} {translations.entries}
          </span>
          <span className="small-fonts">
            {translations.page} {currentPage} {translations.of} {totalPages}
          </span>
        </div>
        
        {/* Column Selection for Detail View */}
        <ColumnSelection
          columns={detailViewColumns}
          selectedColumns={effectiveSelectedColumns}
          setSelectedColumns={effectiveSetSelectedColumns}
          title={translations.selectColumns}
        />
        
        <div className="table-responsive">
           <table className="responsive-table small-fonts">
             <thead>
               <tr>
                 {effectiveSelectedColumns.includes('srNo') && <th>{translations.srNo}</th>}
                 {effectiveSelectedColumns.includes('centerName') && <th>{translations.centerName}</th>}
                 {effectiveSelectedColumns.includes('component') && <th>{translations.component}</th>}
                 {effectiveSelectedColumns.includes('investmentName') && <th>{translations.investmentName}</th>}
                 {effectiveSelectedColumns.includes('unit') && <th>{translations.unit}</th>}
                 {effectiveSelectedColumns.includes('allocatedQuantity') && <th>{translations.allocatedQuantity}</th>}
                 {effectiveSelectedColumns.includes('rate') && <th>{translations.rate}</th>}
                 {effectiveSelectedColumns.includes('allocatedAmount') && <th>{translations.allocatedAmount}</th>}
                 {effectiveSelectedColumns.includes('soldQuantity') && <th>{translations.soldQuantity}</th>}
                 {effectiveSelectedColumns.includes('soldAmount') && <th>{translations.soldAmount}</th>}
                 {effectiveSelectedColumns.includes('remainingQuantity') && <th>{translations.remainingQuantity}</th>}
                 {effectiveSelectedColumns.includes('remainingAmount') && <th>{translations.remainingAmount}</th>}
                 {effectiveSelectedColumns.includes('source') && <th>{translations.source}</th>}
                 {effectiveSelectedColumns.includes('scheme') && <th>{translations.scheme}</th>}
               </tr>
             </thead>
             <tbody>
               {paginatedData.map((item, index) => {
                 const allocated = parseFloat(item.allocated_quantity) || 0;
                 const sold = parseFloat(item.updated_quantity) || 0;
                 const remaining = allocated - sold;
                 const rate = parseFloat(item.rate) || 0;
                 const allocatedValue = allocated * rate;
                 const soldValue = sold * rate;
                 const remainingValue = remaining * rate;
                 const isExpanded = expandedRows.has(startIndex + index);

                 return (
                   <React.Fragment key={startIndex + index}>
                     <tr
                           onClick={() => toggleRowExpansion(startIndex + index)}
                           style={{ cursor: 'pointer' }}
                           className={isExpanded ? 'table-active' : ''}
                     >
                       {effectiveSelectedColumns.includes('srNo') && <td data-label={translations.srNo}>
                         {isExpanded ? '▼' : '▶'} {startIndex + index + 1}
                       </td>}
                       {effectiveSelectedColumns.includes('centerName') && <td data-label={translations.centerName}>{item.center_name}</td>}
                       {effectiveSelectedColumns.includes('component') && <td data-label={translations.component}>{item.component}</td>}
                       {effectiveSelectedColumns.includes('investmentName') && <td data-label={translations.investmentName}>{item.investment_name}</td>}
                       {effectiveSelectedColumns.includes('unit') && <td data-label={translations.unit}>{item.unit}</td>}
                       {effectiveSelectedColumns.includes('allocatedQuantity') && <td data-label={translations.allocatedQuantity}>{allocated.toFixed(2)}</td>}
                       {effectiveSelectedColumns.includes('rate') && <td data-label={translations.rate}>{rate.toFixed(2)}</td>}
                       {effectiveSelectedColumns.includes('allocatedAmount') && <td data-label={translations.allocatedAmount}>{formatCurrency(allocatedValue)}</td>}
                       {effectiveSelectedColumns.includes('soldQuantity') && <td data-label={translations.soldQuantity}>{sold.toFixed(2)}</td>}
                       {effectiveSelectedColumns.includes('soldAmount') && <td data-label={translations.soldAmount}>{formatCurrency(soldValue)}</td>}
                       {effectiveSelectedColumns.includes('remainingQuantity') && <td data-label={translations.remainingQuantity}>{remaining.toFixed(2)}</td>}
                       {effectiveSelectedColumns.includes('remainingAmount') && <td data-label={translations.remainingAmount}>{formatCurrency(remainingValue)}</td>}
                       {effectiveSelectedColumns.includes('source') && <td data-label={translations.source}>{item.source_of_receipt}</td>}
                       {effectiveSelectedColumns.includes('scheme') && <td data-label={translations.scheme}>{item.scheme_name}</td>}
                     </tr>
                     {isExpanded && (
                       <tr className="expanded-row">
                         <td colSpan={effectiveSelectedColumns.length} className="p-3 bg-light">
                           <div className="row">
                             <div className="col-md-6">
                               <h6>विवरण:</h6>
                               <p><strong>केंद्र:</strong> {item.center_name}</p>
                               <p><strong>घटक:</strong> {item.component}</p>
                               <p><strong>निवेश:</strong> {item.investment_name}</p>
                               <p><strong>इकाई:</strong> {item.unit}</p>
                               <p><strong>स्रोत:</strong> {item.source_of_receipt}</p>
                               <p><strong>योजना:</strong> {item.scheme_name}</p>
                             </div>
                             <div className="col-md-6">
                               <h6>वित्तीय सारांश:</h6>
                               <p><strong>आवंटित मात्रा:</strong> {allocated.toFixed(2)} {item.unit}</p>
                               <p><strong>दर:</strong> ₹{rate.toFixed(2)}</p>
                               <p><strong>आवंटित मूल्य:</strong> {formatCurrency(allocatedValue)}</p>
                               <p><strong>बेची गई मात्रा:</strong> {sold.toFixed(2)} {item.unit}</p>
                               <p><strong>बिक्री मूल्य:</strong> {formatCurrency(soldValue)}</p>
                               <p><strong>शेष मात्रा:</strong> {remaining.toFixed(2)} {item.unit}</p>
                               <p><strong>शेष मूल्य:</strong> {formatCurrency(remainingValue)}</p>
                             </div>
                           </div>
                         </td>
                       </tr>
                     )}
                   </React.Fragment>
                 );
               })}
             </tbody>
             <tfoot>
               {/* First row: Column labels and totals */}
               <tr className="font-weight-bold">
                 {/* For each column, show either the label or the total */}
                 {effectiveSelectedColumns.includes('srNo') && 
                   <td>{translations.total || "कुल"}</td>
                 }
                 {effectiveSelectedColumns.includes('centerName') && 
                   <td></td>
                 }
                 {effectiveSelectedColumns.includes('component') && 
                   <td></td>
                 }
                 {effectiveSelectedColumns.includes('investmentName') && 
                   <td></td>
                 }
                 {effectiveSelectedColumns.includes('unit') && 
                   <td></td>
                 }
                 {effectiveSelectedColumns.includes('allocatedQuantity') && 
                   <td>{totals.allocated.toFixed(2)}</td>
                 }
                 {effectiveSelectedColumns.includes('rate') && 
                   <td>-</td>
                 }
                 {effectiveSelectedColumns.includes('allocatedAmount') && 
                   <td>{formatCurrency(totals.allocatedValue)}</td>
                 }
                 {effectiveSelectedColumns.includes('soldQuantity') && 
                   <td>{totals.sold.toFixed(2)}</td>
                 }
                 {effectiveSelectedColumns.includes('soldAmount') && 
                   <td>{formatCurrency(totals.soldValue)}</td>
                 }
                 {effectiveSelectedColumns.includes('remainingQuantity') && 
                   <td>{totals.remaining.toFixed(2)}</td>
                 }
                 {effectiveSelectedColumns.includes('remainingAmount') && 
                   <td>{formatCurrency(totals.remainingValue)}</td>
                 }
                 {effectiveSelectedColumns.includes('source') && 
                   <td></td>
                 }
                 {effectiveSelectedColumns.includes('scheme') && 
                   <td></td>
                 }
               </tr>
               
             </tfoot>
           </table>
         </div>
        
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-3">
            <Pagination>
              <Pagination.Prev 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(currentPage - 1)}
              />
              {paginationItems}
              <Pagination.Next 
                disabled={currentPage === totalPages} 
                onClick={() => setCurrentPage(currentPage + 1)}
              />
            </Pagination>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

const Graph = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setErrorType] = useState("");
  const [activeTab, setActiveTab] = useState("overall");

  // State for multi-filtering
  const [activeFilters, setActiveFilters] = useState({});
  const [filterCategory, setFilterCategory] = useState(null);

  // State for detail view
  const [showDetailView, setShowDetailView] = useState(false);
  const [detailViewData, setDetailViewData] = useState({
    title: "",
    data: [],
    dataType: "",
    filterType: ""
  });

  // State for bills view (when sold filter is active)
  const [showBillsView, setShowBillsView] = useState(false);
  const [billsViewData, setBillsViewData] = useState({
    title: "",
    data: [],
    category: "",
    categoryValue: ""
  });
  
  // State for bills data and loading
  const [billsData, setBillsData] = useState([]);
  const [billsLoading, setBillsLoading] = useState(false);

  // New filter states for comparison
  const [dataViewFilter, setDataViewFilter] = useState("allocated"); // allocated, sold, remaining, comparison
  const [dataTypeFilter, setDataTypeFilter] = useState("quantity"); // quantity, value
  const [showWorkingItemsOnly, setShowWorkingItemsOnly] = useState(false); // Filter for items with remaining quantity > 0
  const [chartType, setChartType] = useState("pie"); // pie, bar, line, area, scatter, radar

  // State for selected columns for DetailView
  const [selectedDetailColumns, setSelectedDetailColumns] = useState(detailViewColumns.map(col => col.key));

  // State for bills filtering and pagination
  const [billsFilters, setBillsFilters] = useState({
    center_name: [],
    source_of_receipt: [],
    bill_id: [],
    status: [],
    dateFrom: '',
    dateTo: ''
  });
  const [billsCurrentPage, setBillsCurrentPage] = useState(1);
  const [billsItemsPerPage] = useState(10);
  const [billsExpandedReports, setBillsExpandedReports] = useState({});
  const [billsSelectedColumns, setBillsSelectedColumns] = useState([
    'reportId', 'centerName', 'sourceOfReceipt', 'reportDate', 'status', 'totalItems', 'buyAmount'
  ]);
  const [billsSelectedComponentColumns, setBillsSelectedComponentColumns] = useState([
    'reportId', 'component', 'investment_name', 'unit', 'allocated_quantity', 'rate', 'updated_quantity', 'buyAmount', 'scheme_name'
  ]);

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

  // Fetch billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/");
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setBillingData(data);
      } catch (err) {
        
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
          setErrorType("network");
          setError(translations.networkError);
        } else if (err.message.includes('HTTP error')) {
          setErrorType("server");
          setError(translations.serverError);
        } else {
          setErrorType("data");
          setError(translations.dataError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  // Fetch bills data when bills view is needed
  useEffect(() => {
    if (showBillsView && billsData.length === 0) {
      const fetchBillsData = async () => {
        try {
          setBillsLoading(true);
          const response = await fetch("https://mahadevaaya.com/govbillingsystem/backend/api/report-billing-items/");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setBillsData(data);
        } catch (e) {
          console.error('Error fetching bills data:', e);
        } finally {
          setBillsLoading(false);
        }
      };

      fetchBillsData();
    }
  }, [showBillsView, billsData.length]);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Helper function to calculate report totals from component_data
  const calculateReportBuyAmount = (item) => {
    return item.component_data?.reduce((sum, comp) => sum + (parseFloat(comp.buy_amount) || 0), 0) || 0;
  };

  // Helper function to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN');
  };

  // Get filtered bills data based on category and value
  const getFilteredBillsData = () => {
    if (!billsViewData.category || !billsViewData.categoryValue) {
      return billsData;
    }

    return billsData.filter(item => {
      // Filter based on the category and value
      switch (billsViewData.category) {
        case 'center_name':
          return item.center_name === billsViewData.categoryValue;
        case 'source_of_receipt':
          return item.source_of_receipt === billsViewData.categoryValue;
        case 'component':
          return item.component_data?.some(comp => comp.component === billsViewData.categoryValue);
        case 'investment_name':
          return item.component_data?.some(comp => comp.investment_name === billsViewData.categoryValue);
        case 'scheme_name':
          return item.component_data?.some(comp => comp.scheme_name === billsViewData.categoryValue);
        case 'unit':
          return item.component_data?.some(comp => comp.unit === billsViewData.categoryValue);
        default:
          return true;
      }
    });
  };

  // Handler for clicking category cards
  const handleCategoryCardClick = (category) => {
    setFilterCategory(category);
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

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({});
    setFilterCategory(null);
    setShowWorkingItemsOnly(false);
  };

  // Handler for clicking on a graph bar
  const handleBarClick = (name, value, type = null, chartType = null) => {
    // If sold filter is active, show bills view instead of detail view
    if (dataViewFilter === 'sold') {
      setBillsViewData({
        title: `${name} - बेचे गए आइटम्स के बिल`,
        category: chartType || 'center_name',
        categoryValue: name
      });
      setShowBillsView(true);
      return;
    }

    // Find the data for the clicked bar
    let chartData = [];
    
    // Determine which chart data to use based on chart type
    if (chartType === 'comparison') {
      chartData = getChartData.comparisonData;
    } else if (chartType === 'center_name') {
      chartData = getChartData.centerData;
    } else if (chartType === 'source_of_receipt') {
      chartData = getChartData.sourceData;
    } else if (chartType === 'scheme_name') {
      chartData = getChartData.schemeData;
    } else if (chartType === 'component') {
      chartData = getChartData.componentData;
    } else if (chartType === 'investment_name') {
      chartData = getChartData.investmentData;
    } else if (chartType === 'unit') {
      chartData = getChartData.unitData;
    } else {
      // Default to center data
      chartData = getChartData.centerData;
    }

    // Find the clicked item in the chart data
    const clickedItem = chartData.find(item => item.name === name);

    if (clickedItem && clickedItem.items) {
      // Set the detail view data
      setDetailViewData({
        title: ` ${name} ${translations.detailsFor}`,
        data: clickedItem.items,
        dataType: dataTypeFilter,
        filterType: type || dataViewFilter // Use type if provided, otherwise use dataViewFilter
      });

      // Show the detail view
      setShowDetailView(true);
    }
  };

  // Check if there are active filters
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  // Determine whether to show pie charts or bar charts
  const showPieCharts = !hasActiveFilters; // Show pie charts when no filters, bar charts when filters applied

  // Extract unique values for each filter
  const uniqueCenters = useMemo(() => {
    if (!billingData.length) return [];
    const centers = [...new Set(billingData.map(item => item.center_name))];
    return centers.filter(Boolean).sort();
  }, [billingData]);

  const uniqueSources = useMemo(() => {
    if (!billingData.length) return [];
    const sources = [...new Set(billingData.map(item => item.source_of_receipt))];
    return sources.filter(Boolean).sort();
  }, [billingData]);

  const uniqueSchemes = useMemo(() => {
    if (!billingData.length) return [];
    const schemes = [...new Set(billingData.map(item => item.scheme_name))];
    return schemes.filter(Boolean).sort();
  }, [billingData]);

  const uniqueComponents = useMemo(() => {
    if (!billingData.length) return [];
    const components = [...new Set(billingData.map(item => item.component))];
    return components.filter(Boolean).sort();
  }, [billingData]);

  const uniqueInvestments = useMemo(() => {
    if (!billingData.length) return [];
    const investments = [...new Set(billingData.map(item => item.investment_name))];
    return investments.filter(Boolean).sort();
  }, [billingData]);

  const uniqueUnits = useMemo(() => {
    if (!billingData.length) return [];
    const units = [...new Set(billingData.map(item => item.unit))];
    return units.filter(Boolean).sort();
  }, [billingData]);

  // Prepare data for charts based on filtered data
  const getChartData = useMemo(() => {
    const dataToUse = billingData.filter(item => {
      // Apply multi-filters
      const multiFilters = Object.keys(activeFilters).every(category => {
        const values = activeFilters[category];
        if (!values || values.length === 0) return true;
        return values.includes(item[category]);
      });

      // Filter for working items (remaining quantity > 0) if requested
      if (showWorkingItemsOnly) {
        const allocated = parseFloat(item.allocated_quantity) || 0;
        const sold = parseFloat(item.updated_quantity) || 0;
        return (allocated - sold) > 0;
      }

      return multiFilters;
    });

    // Helper function to create data based on view type
    const createData = (groupByField) => {
      const data = {};
      
      dataToUse.forEach(item => {
        const key = item[groupByField] || 'Unknown';
        if (!data[key]) {
          data[key] = {
            allocated: 0,
            sold: 0,
            remaining: 0,
            allocatedValue: 0,
            soldValue: 0,
            remainingValue: 0,
            items: [] // Store items for detail view
          };
        }
        
        const allocated = parseFloat(item.allocated_quantity) || 0;
        const sold = parseFloat(item.updated_quantity) || 0;
        const remaining = allocated - sold;
        const rate = parseFloat(item.rate) || 0;
        
        data[key].allocated += allocated;
        data[key].sold += sold;
        data[key].remaining += remaining;
        data[key].allocatedValue += allocated * rate;
        data[key].soldValue += sold * rate;
        data[key].remainingValue += remaining * rate;
        
        // Store the item for detail view
        data[key].items.push(item);
      });
      
      // Transform data based on view type
      if (dataViewFilter === "comparison") {
        return Object.entries(data).map(([key, values]) => ({
          name: key,
          allocated: values.allocated,
          sold: values.sold,
          remaining: values.remaining,
          items: values.items // Store items for detail view
        })).sort((a, b) => b.allocated - a.allocated);
      } else {
        const valueField = dataViewFilter === "allocated" ?
          (dataTypeFilter === "quantity" ? "allocated" : "allocatedValue") :
          dataViewFilter === "sold" ?
          (dataTypeFilter === "quantity" ? "sold" : "soldValue") :
          (dataTypeFilter === "quantity" ? "remaining" : "remainingValue");
        
        return Object.entries(data).map(([key, values]) => ({
          name: key,
          value: values[valueField],
          items: values.items // Store items for detail view
        })).sort((a, b) => b.value - a.value);
      }
    };
    
    return {
      sourceData: createData('source_of_receipt'),
      centerData: createData('center_name'),
      componentData: createData('component'),
      investmentData: createData('investment_name'),
      unitData: createData('unit'),
      schemeData: createData('scheme_name'),
      comparisonData: createData('center_name') // Use center for comparison chart
    };
  }, [billingData, activeFilters, showWorkingItemsOnly, dataViewFilter, dataTypeFilter]);

  // Calculate summary statistics based on filtered data
  const summaryStats = useMemo(() => {
    const dataToUse = billingData.filter(item => {
      // Apply multi-filters
      const multiFilters = Object.keys(activeFilters).every(category => {
        const values = activeFilters[category];
        if (!values || values.length === 0) return true;
        return values.includes(item[category]);
      });

      // Filter for working items (remaining quantity > 0) if requested
      if (showWorkingItemsOnly) {
        const allocated = parseFloat(item.allocated_quantity) || 0;
        const sold = parseFloat(item.updated_quantity) || 0;
        return (allocated - sold) > 0;
      }

      return multiFilters;
    });

    if (!dataToUse.length) {
      return { 
        totalAllocated: 0, 
        totalSold: 0, 
        totalRemaining: 0,
        totalAllocatedValue: 0, 
        totalSoldValue: 0, 
        totalRemainingValue: 0,
        totalItems: 0 
      };
    }
    
    const totalAllocated = dataToUse.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) || 0), 0);
    const totalSold = dataToUse.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) || 0), 0);
    const totalRemaining = totalAllocated - totalSold;
    
    const totalAllocatedValue = dataToUse.reduce((sum, item) => {
      const qty = parseFloat(item.allocated_quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + (qty * rate);
    }, 0);
    
    const totalSoldValue = dataToUse.reduce((sum, item) => {
      const qty = parseFloat(item.updated_quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + (qty * rate);
    }, 0);
    
    const totalRemainingValue = totalAllocatedValue - totalSoldValue;
    
    return {
      totalAllocated: totalAllocated.toFixed(2),
      totalSold: totalSold.toFixed(2),
      totalRemaining: totalRemaining.toFixed(2),
      totalAllocatedValue: totalAllocatedValue.toFixed(2),
      totalSoldValue: totalSoldValue.toFixed(2),
      totalRemainingValue: totalRemainingValue.toFixed(2),
      totalItems: dataToUse.length
    };
  }, [billingData, activeFilters, showWorkingItemsOnly]);

  // Helper to render filter buttons for a category
  const renderFilterButtons = (category) => {
    let values = [];
    
    // Get the values for the selected category
    if (category === 'center_name') {
      values = uniqueCenters;
    } else if (category === 'source_of_receipt') {
      values = uniqueSources;
    } else if (category === 'scheme_name') {
      values = uniqueSchemes;
    } else if (category === 'component') {
      values = uniqueComponents;
    } else if (category === 'investment_name') {
      values = uniqueInvestments;
    } else if (category === 'unit') {
      values = uniqueUnits;
    }
    
    return values.map((value) => (
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
    ));
  };

  // Bills View Component for showing bills when sold filter is active
  const BillsView = ({ title, onBack, category, categoryValue }) => {
    const filteredBillsData = getFilteredBillsData();
    const [billsExpandedReportsLocal, setBillsExpandedReportsLocal] = useState({});
    const [currentPageLocal, setCurrentPageLocal] = useState(1);
    const [localBillsSelectedColumns, setLocalBillsSelectedColumns] = useState([
      'reportId', 'centerName', 'sourceOfReceipt', 'reportDate', 'status', 'totalItems', 'buyAmount'
    ]);
    
    // Use local state if billsSelectedColumns is not provided
    const effectiveBillsSelectedColumns = localBillsSelectedColumns;
    
    const indexOfLastItem = currentPageLocal * billsItemsPerPage;
    const indexOfFirstItem = indexOfLastItem - billsItemsPerPage;
    const paginatedBillsData = filteredBillsData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredBillsData.length / billsItemsPerPage);

    const toggleReportDetails = (reportId) => {
      setBillsExpandedReportsLocal(prev => ({
        ...prev,
        [reportId]: !prev[reportId]
      }));
    };

    // Excel download function
    const downloadExcel = () => {
      try {
        // Prepare data for Excel export based on selected columns
        const excelData = filteredBillsData.map(item => {
          const row = {};
          effectiveBillsSelectedColumns.forEach(col => {
            switch (col) {
              case 'reportId':
                row['रिपोर्ट आईडी'] = item.bill_report_id;
                break;
              case 'centerName':
                row['केंद्र का नाम'] = item.center_name;
                break;
              case 'sourceOfReceipt':
                row['प्राप्ति का स्रोत'] = item.source_of_receipt;
                break;
              case 'reportDate':
                row['रिपोर्ट दिनांक'] = formatDate(item.billing_date);
                break;
              case 'status':
                row['स्थिति'] = item.status === 'accepted' ? 'स्वीकृत' : 
                               item.status === 'cancelled' ? 'रद्द' : item.status;
                break;
              case 'totalItems':
                row['कुल आइटम'] = item.component_data.length;
                break;
              case 'buyAmount':
                row['खरीद राशि'] = item.component_data?.reduce((sum, comp) => sum + (parseFloat(comp.buy_amount) || 0), 0);
                break;
            }
          });
          return row;
        });

        // Calculate totals
        const totalItems = filteredBillsData.reduce((sum, item) => sum + (item.component_data?.length || 0), 0);
        const totalBuyAmount = filteredBillsData.reduce((sum, item) => sum + calculateReportBuyAmount(item), 0);
        
        // Add total row
        const totalRow = {};
        effectiveBillsSelectedColumns.forEach(col => {
          if (col === 'reportId') {
            totalRow['रिपोर्ट आईडी'] = 'कुल';
          } else if (col === 'totalItems') {
            totalRow['कुल आइटम'] = totalItems;
          } else if (col === 'buyAmount') {
            totalRow['खरीद राशि'] = totalBuyAmount;
          } else {
            totalRow[col === 'centerName' ? 'केंद्र का नाम' : 
                   col === 'sourceOfReceipt' ? 'प्राप्ति का स्रोत' :
                   col === 'reportDate' ? 'रिपोर्ट दिनांक' :
                   col === 'status' ? 'स्थिति' : ''] = '';
          }
        });
        excelData.push(totalRow);

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, "Bills");
        XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      } catch (e) {
        console.error("Error generating Excel file:", e);
      }
    };

    // PDF download function
    const downloadPdf = () => {
      try {
        // Create headers and rows based on selected columns
        const headers = effectiveBillsSelectedColumns.map(col => {
          switch (col) {
            case 'reportId': return '<th>रिपोर्ट आईडी</th>';
            case 'centerName': return '<th>केंद्र का नाम</th>';
            case 'sourceOfReceipt': return '<th>प्राप्ति का स्रोत</th>';
            case 'reportDate': return '<th>रिपोर्ट दिनांक</th>';
            case 'status': return '<th>स्थिति</th>';
            case 'totalItems': return '<th>कुल आइटम</th>';
            case 'buyAmount': return '<th>खरीद राशि</th>';
            default: return '';
          }
        }).join('');

        const rows = filteredBillsData.map(item => {
          const cells = effectiveBillsSelectedColumns.map(col => {
            switch (col) {
              case 'reportId': return `<td>${item.bill_report_id}</td>`;
              case 'centerName': return `<td>${item.center_name}</td>`;
              case 'sourceOfReceipt': return `<td>${item.source_of_receipt}</td>`;
              case 'reportDate': return `<td>${formatDate(item.billing_date)}</td>`;
              case 'status': return `<td>${item.status === 'accepted' ? 'स्वीकृत' : 
                                           item.status === 'cancelled' ? 'रद्द' : item.status}</td>`;
              case 'totalItems': return `<td>${item.component_data.length}</td>`;
              case 'buyAmount': return `<td>${item.component_data?.reduce((sum, comp) => sum + (parseFloat(comp.buy_amount) || 0), 0)}</td>`;
              default: return '<td></td>';
            }
          }).join('');
          return `<tr>${cells}</tr>`;
        }).join('');

        // Calculate totals
        const totalItems = filteredBillsData.reduce((sum, item) => sum + (item.component_data?.length || 0), 0);
        const totalBuyAmount = filteredBillsData.reduce((sum, item) => sum + calculateReportBuyAmount(item), 0);
        
        // Create total row
        const totalCells = effectiveBillsSelectedColumns.map(col => {
          if (col === 'reportId') return '<td><strong>कुल</strong></td>';
          else if (col === 'totalItems') return `<td><strong>${totalItems}</strong></td>`;
          else if (col === 'buyAmount') return `<td><strong>${totalBuyAmount}</strong></td>`;
          else return '<td></td>';
        }).join('');
        const totalRow = `<tr>${totalCells}</tr>`;

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
              <h2>${title}</h2>
              <table>
                <tr>${headers}</tr>
                ${rows}
                ${totalRow}
              </table>
            </body>
          </html>
        `;

        const printWindow = window.open('', '_blank');
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

    // Component Excel download function
    const downloadComponentExcel = (componentData, reportId) => {
      try {
        const excelData = componentData.map(item => {
          const row = {};
          billsSelectedComponentColumns.forEach(col => {
            switch (col) {
              case 'reportId':
                row['रिपोर्ट आईडी'] = item.bill_report_id || reportId;
                break;
              case 'component':
                row['घटक'] = item.component;
                break;
              case 'investment_name':
                row['निवेश का नाम'] = item.investment_name;
                break;
              case 'unit':
                row['इकाई'] = item.unit;
                break;
              case 'allocated_quantity':
                row['आवंटित मात्रा'] = item.allocated_quantity;
                break;
              case 'rate':
                row['दर'] = item.rate;
                break;
              case 'updated_quantity':
                row['अपडेट की गई मात्रा'] = item.updated_quantity;
                break;
              case 'buyAmount':
                row['खरीद राशि'] = item.buy_amount;
                break;
              case 'scheme_name':
                row['योजना का नाम'] = item.scheme_name;
                break;
            }
          });
          return row;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, "Components");
        XLSX.writeFile(wb, `Components_${reportId}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      } catch (e) {
        console.error("Error generating component Excel file:", e);
      }
    };

    // Component PDF download function
    const downloadComponentPdf = (componentData, reportId) => {
      try {
        const headers = billsSelectedComponentColumns.map(col => {
          switch (col) {
            case 'reportId': return '<th>रिपोर्ट आईडी</th>';
            case 'component': return '<th>घटक</th>';
            case 'investment_name': return '<th>निवेश का नाम</th>';
            case 'unit': return '<th>इकाई</th>';
            case 'allocated_quantity': return '<th>आवंटित मात्रा</th>';
            case 'rate': return '<th>दर</th>';
            case 'updated_quantity': return '<th>अपडेट की गई मात्रा</th>';
            case 'buyAmount': return '<th>खरीद राशि</th>';
            case 'scheme_name': return '<th>योजना का नाम</th>';
            default: return '';
          }
        }).join('');

        const rows = componentData.map(item => {
          const cells = billsSelectedComponentColumns.map(col => {
            switch (col) {
              case 'reportId': return `<td>${item.bill_report_id || reportId}</td>`;
              case 'component': return `<td>${item.component}</td>`;
              case 'investment_name': return `<td>${item.investment_name}</td>`;
              case 'unit': return `<td>${item.unit}</td>`;
              case 'allocated_quantity': return `<td>${item.allocated_quantity}</td>`;
              case 'rate': return `<td>${item.rate}</td>`;
              case 'updated_quantity': return `<td>${item.updated_quantity}</td>`;
              case 'buyAmount': return `<td>${item.buy_amount}</td>`;
              case 'scheme_name': return `<td>${item.scheme_name}</td>`;
              default: return '<td></td>';
            }
          }).join('');
          return `<tr>${cells}</tr>`;
        }).join('');

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
              <h2>घटक विवरण - ${reportId}</h2>
              <table>
                <tr>${headers}</tr>
                ${rows}
              </table>
            </body>
          </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(tableHtml);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      } catch (e) {
        console.error("Error generating component PDF:", e);
      }
    };

    const getStatusBadgeVariant = (status) => {
      switch (status) {
        case 'accepted':
          return 'success';
        case 'cancelled':
          return 'danger';
        default:
          return 'secondary';
      }
    };

    // Build pagination items
    const paginationItems = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPageLocal - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      paginationItems.push(<Pagination.Item key={1} onClick={() => setCurrentPageLocal(1)}>1</Pagination.Item>);
      if (startPage > 2) {
        paginationItems.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
      }
    }
    
    for (let number = startPage; number <= endPage; number++) {
      paginationItems.push(
        <Pagination.Item 
          key={number} 
          active={number === currentPageLocal}
          onClick={() => setCurrentPageLocal(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationItems.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      }
      paginationItems.push(<Pagination.Item key={totalPages} onClick={() => setCurrentPageLocal(totalPages)}>{totalPages}</Pagination.Item>);
    }

    if (billsLoading) {
      return (
        <div className="dashboard-container">
          <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
          <div className="main-content">
            <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <Container fluid className="dashboard-body">
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                <Spinner animation="border" />
              </div>
            </Container>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-container">
        <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content">
          <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <Container fluid className="dashboard-body">
            <Card className="detail-view-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{title}</h5>
                <div className="d-flex gap-2">
                  <Button variant="outline-success" size="sm" onClick={downloadExcel}>
                    <FaFileExcel className="me-1" /> {translations.downloadExcel}
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={downloadPdf}>
                    <FaFilePdf className="me-1" /> {translations.downloadPdf}
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={onBack}>
                    <FaArrowLeft className="me-1" /> {translations.backToGraph}
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="table-info mb-2 d-flex justify-content-between align-items-center">
                  <span className="small-fonts">
                    {translations.showing} {indexOfFirstItem + 1} {translations.to} {Math.min(indexOfLastItem, filteredBillsData.length)} {translations.of} {filteredBillsData.length} {translations.entries}
                  </span>
                  <span className="small-fonts">
                    {translations.page} {currentPageLocal} {translations.of} {totalPages}
                  </span>
                </div>
                
                {/* Column Selection Section */}
                <div className="column-selection mb-4 p-3 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="small-fonts mb-0">{translations.selectColumns}</h5>
                    <div>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={() => setLocalBillsSelectedColumns(['reportId', 'centerName', 'sourceOfReceipt', 'reportDate', 'status', 'totalItems', 'buyAmount'])}
                        className="me-2 small-fonts"
                      >
                        {translations.selectAll}
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        onClick={() => setLocalBillsSelectedColumns([])}
                        className="small-fonts"
                      >
                        {translations.deselectAll}
                      </Button>
                    </div>
                  </div>
                  <Row>
                    <Col>
                      <div className="d-flex flex-wrap">
                        <Form.Check
                          type="checkbox"
                          id="col-reportId"
                          label="रिपोर्ट आईडी"
                          checked={effectiveBillsSelectedColumns.includes('reportId')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalBillsSelectedColumns([...effectiveBillsSelectedColumns, 'reportId']);
                            } else {
                              setLocalBillsSelectedColumns(effectiveBillsSelectedColumns.filter(c => c !== 'reportId'));
                            }
                          }}
                          className="me-3 small-fonts"
                        />
                        <Form.Check
                          type="checkbox"
                          id="col-centerName"
                          label="केंद्र का नाम"
                          checked={effectiveBillsSelectedColumns.includes('centerName')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalBillsSelectedColumns([...effectiveBillsSelectedColumns, 'centerName']);
                            } else {
                              setLocalBillsSelectedColumns(effectiveBillsSelectedColumns.filter(c => c !== 'centerName'));
                            }
                          }}
                          className="me-3 small-fonts"
                        />
                        <Form.Check
                          type="checkbox"
                          id="col-sourceOfReceipt"
                          label="प्राप्ति का स्रोत"
                          checked={effectiveBillsSelectedColumns.includes('sourceOfReceipt')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalBillsSelectedColumns([...effectiveBillsSelectedColumns, 'sourceOfReceipt']);
                            } else {
                              setLocalBillsSelectedColumns(effectiveBillsSelectedColumns.filter(c => c !== 'sourceOfReceipt'));
                            }
                          }}
                          className="me-3 small-fonts"
                        />
                        <Form.Check
                          type="checkbox"
                          id="col-reportDate"
                          label="रिपोर्ट दिनांक"
                          checked={effectiveBillsSelectedColumns.includes('reportDate')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalBillsSelectedColumns([...effectiveBillsSelectedColumns, 'reportDate']);
                            } else {
                              setLocalBillsSelectedColumns(effectiveBillsSelectedColumns.filter(c => c !== 'reportDate'));
                            }
                          }}
                          className="me-3 small-fonts"
                        />
                        <Form.Check
                          type="checkbox"
                          id="col-status"
                          label="स्थिति"
                          checked={effectiveBillsSelectedColumns.includes('status')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalBillsSelectedColumns([...effectiveBillsSelectedColumns, 'status']);
                            } else {
                              setLocalBillsSelectedColumns(effectiveBillsSelectedColumns.filter(c => c !== 'status'));
                            }
                          }}
                          className="me-3 small-fonts"
                        />
                        <Form.Check
                          type="checkbox"
                          id="col-totalItems"
                          label="कुल आइटम"
                          checked={effectiveBillsSelectedColumns.includes('totalItems')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalBillsSelectedColumns([...effectiveBillsSelectedColumns, 'totalItems']);
                            } else {
                              setLocalBillsSelectedColumns(effectiveBillsSelectedColumns.filter(c => c !== 'totalItems'));
                            }
                          }}
                          className="me-3 small-fonts"
                        />
                        <Form.Check
                          type="checkbox"
                          id="col-buyAmount"
                          label="खरीद राशि"
                          checked={effectiveBillsSelectedColumns.includes('buyAmount')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalBillsSelectedColumns([...effectiveBillsSelectedColumns, 'buyAmount']);
                            } else {
                              setLocalBillsSelectedColumns(effectiveBillsSelectedColumns.filter(c => c !== 'buyAmount'));
                            }
                          }}
                          className="me-3 small-fonts"
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
                
                {filteredBillsData.length > 0 ? (
                  <>
                    <div className="table-responsive">
                      <table className="responsive-table small-fonts">
                        <thead>
                          <tr>
                            <th>क्र.सं.</th>
                            {effectiveBillsSelectedColumns.includes('reportId') && <th>रिपोर्ट आईडी</th>}
                            {effectiveBillsSelectedColumns.includes('centerName') && <th>केंद्र का नाम</th>}
                            {effectiveBillsSelectedColumns.includes('sourceOfReceipt') && <th>प्राप्ति का स्रोत</th>}
                            {effectiveBillsSelectedColumns.includes('reportDate') && <th>रिपोर्ट दिनांक</th>}
                            {effectiveBillsSelectedColumns.includes('status') && <th>स्थिति</th>}
                            {effectiveBillsSelectedColumns.includes('totalItems') && <th>कुल आइटम</th>}
                            {effectiveBillsSelectedColumns.includes('buyAmount') && <th>खरीद राशि</th>}
                            <th>विवरण देखें</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedBillsData.map((item, index) => (
                            <React.Fragment key={item.id}>
                              <tr>
                                <td data-label="क्र.सं.">{indexOfFirstItem + index + 1}</td>
                                {effectiveBillsSelectedColumns.includes('reportId') && <td data-label="रिपोर्ट आईडी">{item.bill_report_id}</td>}
                                {effectiveBillsSelectedColumns.includes('centerName') && <td data-label="केंद्र का नाम">{item.center_name}</td>}
                                {effectiveBillsSelectedColumns.includes('sourceOfReceipt') && <td data-label="प्राप्ति का स्रोत">{item.source_of_receipt}</td>}
                                {effectiveBillsSelectedColumns.includes('reportDate') && <td data-label="रिपोर्ट दिनांक">{formatDate(item.billing_date)}</td>}
                                {effectiveBillsSelectedColumns.includes('status') && <td data-label="स्थिति">
                                  <Badge bg={getStatusBadgeVariant(item.status)}>
                                    {item.status === 'accepted' ? 'स्वीकृत' : 
                                     item.status === 'cancelled' ? 'रद्द' : item.status}
                                  </Badge>
                                </td>}
                                {effectiveBillsSelectedColumns.includes('totalItems') && <td data-label="कुल आइटम">
                                  <Badge bg="info">{item.component_data.length}</Badge>
                                </td>}
                                {effectiveBillsSelectedColumns.includes('buyAmount') && <td data-label="खरीद राशि">
                                  {item.component_data?.reduce((sum, comp) => sum + (parseFloat(comp.buy_amount) || 0), 0)}
                                </td>}
                                <td data-label="विवरण देखें">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    onClick={() => toggleReportDetails(item.id)}
                                    className="small-fonts"
                                  >
                                    विवरण देखें
                                  </Button>
                                </td>
                              </tr>
                              <tr>
                                <td colSpan={effectiveBillsSelectedColumns.length + 2} className="p-0">
                                  <Collapse in={billsExpandedReportsLocal[item.id]}>
                                    <div className="p-3 bg-light">
                                      <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">घटक विवरण</h5>
                                        <div>
                                          <div className="column-selection mb-2">
                                            <h6 className="small-fonts mb-2">कॉलम चुनें</h6>
                                            <div className="d-flex flex-wrap">
                                              <Form.Check
                                                type="checkbox"
                                                id="comp-reportId"
                                                label="रिपोर्ट आईडी"
                                                checked={billsSelectedComponentColumns.includes('reportId')}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setBillsSelectedComponentColumns([...billsSelectedComponentColumns, 'reportId']);
                                                  } else {
                                                    setBillsSelectedComponentColumns(billsSelectedComponentColumns.filter(c => c !== 'reportId'));
                                                  }
                                                }}
                                                className="me-3 small-fonts"
                                              />
                                              <Form.Check
                                                type="checkbox"
                                                id="comp-component"
                                                label="घटक"
                                                checked={billsSelectedComponentColumns.includes('component')}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setBillsSelectedComponentColumns([...billsSelectedComponentColumns, 'component']);
                                                  } else {
                                                    setBillsSelectedComponentColumns(billsSelectedComponentColumns.filter(c => c !== 'component'));
                                                  }
                                                }}
                                                className="me-3 small-fonts"
                                              />
                                              <Form.Check
                                                type="checkbox"
                                                id="comp-investment_name"
                                                label="निवेश का नाम"
                                                checked={billsSelectedComponentColumns.includes('investment_name')}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setBillsSelectedComponentColumns([...billsSelectedComponentColumns, 'investment_name']);
                                                  } else {
                                                    setBillsSelectedComponentColumns(billsSelectedComponentColumns.filter(c => c !== 'investment_name'));
                                                  }
                                                }}
                                                className="me-3 small-fonts"
                                              />
                                              <Form.Check
                                                type="checkbox"
                                                id="comp-unit"
                                                label="इकाई"
                                                checked={billsSelectedComponentColumns.includes('unit')}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setBillsSelectedComponentColumns([...billsSelectedComponentColumns, 'unit']);
                                                  } else {
                                                    setBillsSelectedComponentColumns(billsSelectedComponentColumns.filter(c => c !== 'unit'));
                                                  }
                                                }}
                                                className="me-3 small-fonts"
                                              />
                                              <Form.Check
                                                type="checkbox"
                                                id="comp-allocated_quantity"
                                                label="आवंटित मात्रा"
                                                checked={billsSelectedComponentColumns.includes('allocated_quantity')}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setBillsSelectedComponentColumns([...billsSelectedComponentColumns, 'allocated_quantity']);
                                                  } else {
                                                    setBillsSelectedComponentColumns(billsSelectedComponentColumns.filter(c => c !== 'allocated_quantity'));
                                                  }
                                                }}
                                                className="me-3 small-fonts"
                                              />
                                              <Form.Check
                                                type="checkbox"
                                                id="comp-rate"
                                                label="दर"
                                                checked={billsSelectedComponentColumns.includes('rate')}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setBillsSelectedComponentColumns([...billsSelectedComponentColumns, 'rate']);
                                                  } else {
                                                    setBillsSelectedComponentColumns(billsSelectedComponentColumns.filter(c => c !== 'rate'));
                                                  }
                                                }}
                                                className="me-3 small-fonts"
                                              />
                                              <Form.Check
                                                type="checkbox"
                                                id="comp-updated_quantity"
                                                label="अपडेट की गई मात्रा"
                                                checked={billsSelectedComponentColumns.includes('updated_quantity')}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setBillsSelectedComponentColumns([...billsSelectedComponentColumns, 'updated_quantity']);
                                                  } else {
                                                    setBillsSelectedComponentColumns(billsSelectedComponentColumns.filter(c => c !== 'updated_quantity'));
                                                  }
                                                }}
                                                className="me-3 small-fonts"
                                              />
                                              <Form.Check
                                                type="checkbox"
                                                id="comp-buyAmount"
                                                label="खरीद राशि"
                                                checked={billsSelectedComponentColumns.includes('buyAmount')}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setBillsSelectedComponentColumns([...billsSelectedComponentColumns, 'buyAmount']);
                                                  } else {
                                                    setBillsSelectedComponentColumns(billsSelectedComponentColumns.filter(c => c !== 'buyAmount'));
                                                  }
                                                }}
                                                className="me-3 small-fonts"
                                              />
                                              <Form.Check
                                                type="checkbox"
                                                id="comp-scheme_name"
                                                label="योजना का नाम"
                                                checked={billsSelectedComponentColumns.includes('scheme_name')}
                                                onChange={(e) => {
                                                  if (e.target.checked) {
                                                    setBillsSelectedComponentColumns([...billsSelectedComponentColumns, 'scheme_name']);
                                                  } else {
                                                    setBillsSelectedComponentColumns(billsSelectedComponentColumns.filter(c => c !== 'scheme_name'));
                                                  }
                                                }}
                                                className="me-3 small-fonts"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      {item.component_data.length > 0 ? (
                                        <table className="table table-sm table-bordered">
                                          <thead>
                                            <tr>
                                              {billsSelectedComponentColumns.includes('reportId') && <th>रिपोर्ट आईडी</th>}
                                              {billsSelectedComponentColumns.includes('component') && <th>घटक</th>}
                                              {billsSelectedComponentColumns.includes('investment_name') && <th>निवेश का नाम</th>}
                                              {billsSelectedComponentColumns.includes('unit') && <th>इकाई</th>}
                                              {billsSelectedComponentColumns.includes('allocated_quantity') && <th>आवंटित मात्रा</th>}
                                              {billsSelectedComponentColumns.includes('rate') && <th>दर</th>}
                                              {billsSelectedComponentColumns.includes('updated_quantity') && <th>अपडेट की गई मात्रा</th>}
                                              {billsSelectedComponentColumns.includes('buyAmount') && <th>खरीद राशि</th>}
                                              {billsSelectedComponentColumns.includes('scheme_name') && <th>योजना का नाम</th>}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {item.component_data.map((component, compIndex) => (
                                              <tr key={compIndex}>
                                                {billsSelectedComponentColumns.includes('reportId') && <td>{item.bill_report_id}</td>}
                                                {billsSelectedComponentColumns.includes('component') && <td>{component.component}</td>}
                                                {billsSelectedComponentColumns.includes('investment_name') && <td>{component.investment_name}</td>}
                                                {billsSelectedComponentColumns.includes('unit') && <td>{component.unit}</td>}
                                                {billsSelectedComponentColumns.includes('allocated_quantity') && <td>{component.allocated_quantity}</td>}
                                                {billsSelectedComponentColumns.includes('rate') && <td>{component.rate}</td>}
                                                {billsSelectedComponentColumns.includes('updated_quantity') && <td>{component.updated_quantity}</td>}
                                                {billsSelectedComponentColumns.includes('buyAmount') && <td>{component.buy_amount}</td>}
                                                {billsSelectedComponentColumns.includes('scheme_name') && <td>{component.scheme_name}</td>}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      ) : (
                                        <Alert variant="info">कोई घटक डेटा उपलब्ध नहीं</Alert>
                                      )}
                                    </div>
                                  </Collapse>
                                </td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-3">
                        <Pagination>
                          <Pagination.Prev 
                            disabled={currentPageLocal === 1} 
                            onClick={() => setCurrentPageLocal(currentPageLocal - 1)}
                          />
                          {paginationItems}
                          <Pagination.Next 
                            disabled={currentPageLocal === totalPages} 
                            onClick={() => setCurrentPageLocal(currentPageLocal + 1)}
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                ) : (
                  <Alert variant="info">इस चयन के लिए कोई बिल नहीं मिला।</Alert>
                )}
              </Card.Body>
            </Card>
          </Container>
        </div>
      </div>
    );
  };

  // If showing bills view, render it instead of graph
  if (showBillsView) {
    return (
      <BillsView 
        title={billsViewData.title}
        onBack={() => {
          setShowBillsView(false);
          setBillsViewData({ title: "", data: [], category: "", categoryValue: "" });
        }}
        category={billsViewData.category}
        categoryValue={billsViewData.categoryValue}
      />
    );
  }

  // If showing detail view, render it instead of graph
  if (showDetailView) {
    return (
      <div className="dashboard-container">
        <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
        <div className="main-content">
          <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <Container fluid className="dashboard-body">
            <DetailView 
              title={detailViewData.title} 
              data={detailViewData.data} 
              onBack={() => setShowDetailView(false)}
              dataType={detailViewData.dataType}
              filterType={detailViewData.filterType}
              selectedColumns={selectedDetailColumns}
              setSelectedColumns={setSelectedDetailColumns}
            />
          </Container>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
      <div className="main-content">
        <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Container fluid className="dashboard-body">
          <h1 className="page-title small-fonts">{translations.graphs}</h1>

          {/* Summary Cards */}
          <Row className="summary-cards mb-4">
            <Col md={2}>
              <SummaryCard 
                    title={translations.totalAllocated} 
                    value={summaryStats.totalAllocated} 
                    unit={translations.allocatedQuantityLabel} 
                    icon="fa-cubes" 
                    color="#2C3E50" 
              />
            </Col>
            <Col md={2}>
              <SummaryCard 
                    title={translations.totalSold} 
                    value={summaryStats.totalSold} 
                    unit={translations.soldQuantityLabel} 
                    icon="fa-shopping-cart" 
                    color="#E74C3C" 
              />
            </Col>
            <Col md={2}>
              <SummaryCard 
                    title={translations.totalRemaining} 
                    value={summaryStats.totalRemaining} 
                    unit={translations.remainingQuantityLabel} 
                    icon="fa-box" 
                    color="#27AE60" 
              />
            </Col>
            <Col md={2}>
              <SummaryCard 
                    title={translations.totalValue} 
                    value={`₹${summaryStats.totalAllocatedValue}`} 
                    unit={translations.allocatedValueLabel} 
                    icon="fa-rupee-sign" 
                    color="#28a745" 
              />
            </Col>
            <Col md={2}>
              <SummaryCard 
                    title={translations.totalSoldValue} 
                    value={`₹${summaryStats.totalSoldValue}`} 
                    unit={translations.soldValueLabel} 
                    icon="fa-money-bill-wave" 
                    color="#F39C12" 
              />
            </Col>
            <Col md={2}>
              <SummaryCard 
                    title={translations.totalRemainingValue} 
                    value={`₹${summaryStats.totalRemainingValue}`} 
                    unit={translations.remainingValueLabel} 
                    icon="fa-piggy-bank" 
                    color="#3498DB" 
              />
            </Col>
          </Row>

          {/* Filter Section */}
          <div className="filter-section mt-3 mb-3 p-3 border rounded bg-light">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 small-fonts">{translations.filters} {hasActiveFilters && <span className="badge bg-info ms-2 small-fonts">{translations.filtersApplied}</span>}</h5>
              <Button variant="outline-secondary" size="sm" onClick={clearAllFilters} className="small-fonts">{translations.clearAllFilters}</Button>
            </div>
            
            {/* Multi-filter category cards */}
            <Row className="g-3 mb-3">
              <Col xs={6} md={2}>
                <Card 
                      className={`high-level-summary-card text-center h-100 ${activeFilters['center_name'] ? 'active' : ''}`}
                      onClick={() => handleCategoryCardClick('center_name')}
                >
                  <Card.Body>
                        <div className="card-icon">🏢</div>
                        <Card.Title className="small-fonts">{translations.centerName}</Card.Title>
                        <Card.Text className="summary-value small-fonts">{getChartData.centerData.length} प्रकार</Card.Text>
                        {activeFilters['center_name'] && (
                          <Badge bg="success" pill>{activeFilters['center_name'].length} चयनित</Badge>
                        )}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={2}>
                <Card 
                      className={`high-level-summary-card text-center h-100 ${activeFilters['source_of_receipt'] ? 'active' : ''}`}
                      onClick={() => handleCategoryCardClick('source_of_receipt')}
                >
                  <Card.Body>
                        <div className="card-icon">💰</div>
                        <Card.Title className="small-fonts">{translations.sourceOfReceipt}</Card.Title>
                        <Card.Text className="summary-value small-fonts">{getChartData.sourceData.length} प्रकार</Card.Text>
                        {activeFilters['source_of_receipt'] && (
                          <Badge bg="success" pill>{activeFilters['source_of_receipt'].length} चयनित</Badge>
                        )}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={2}>
                <Card 
                      className={`high-level-summary-card text-center h-100 ${activeFilters['scheme_name'] ? 'active' : ''}`}
                      onClick={() => handleCategoryCardClick('scheme_name')}
                >
                  <Card.Body>
                        <div className="card-icon">📋</div>
                        <Card.Title className="small-fonts">{translations.schemeName}</Card.Title>
                        <Card.Text className="summary-value small-fonts">{getChartData.schemeData.length} प्रकार</Card.Text>
                        {activeFilters['scheme_name'] && (
                          <Badge bg="success" pill>{activeFilters['scheme_name'].length} चयनित</Badge>
                        )}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={2}>
                <Card 
                      className={`high-level-summary-card text-center h-100 ${activeFilters['component'] ? 'active' : ''}`}
                      onClick={() => handleCategoryCardClick('component')}
                >
                  <Card.Body>
                        <div className="card-icon">📦</div>
                        <Card.Title className="small-fonts">{translations.component}</Card.Title>
                        <Card.Text className="summary-value small-fonts">{getChartData.componentData.length} प्रकार</Card.Text>
                        {activeFilters['component'] && (
                          <Badge bg="success" pill>{activeFilters['component'].length} चयनित</Badge>
                        )}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={2}>
                <Card 
                      className={`high-level-summary-card text-center h-100 ${activeFilters['investment_name'] ? 'active' : ''}`}
                      onClick={() => handleCategoryCardClick('investment_name')}
                >
                  <Card.Body>
                        <div className="card-icon">💼</div>
                        <Card.Title className="small-fonts">{translations.investmentName}</Card.Title>
                        <Card.Text className="summary-value small-fonts">{getChartData.investmentData.length} प्रकार</Card.Text>
                        {activeFilters['investment_name'] && (
                          <Badge bg="success" pill>{activeFilters['investment_name'].length} चयनित</Badge>
                        )}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={2}>
                <Card 
                      className={`high-level-summary-card text-center h-100 ${activeFilters['unit'] ? 'active' : ''}`}
                      onClick={() => handleCategoryCardClick('unit')}
                >
                  <Card.Body>
                        <div className="card-icon">📏</div>
                        <Card.Title className="small-fonts">{translations.unit}</Card.Title>
                        <Card.Text className="summary-value small-fonts">{getChartData.unitData.length} प्रकार</Card.Text>
                        {activeFilters['unit'] && (
                          <Badge bg="success" pill>{activeFilters['unit'].length} चयनित</Badge>
                        )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Filter Buttons Section - Shows directly when a card is clicked */}
            {filterCategory && (
              <div className="filter-buttons-container mb-4 p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 small-fonts">
                    {filterCategory === 'center_name' ? translations.centerName :
                     filterCategory === 'source_of_receipt' ? translations.sourceOfReceipt :
                     filterCategory === 'scheme_name' ? translations.schemeName :
                     filterCategory === 'component' ? translations.component :
                     filterCategory === 'investment_name' ? translations.investmentName :
                     filterCategory === 'unit' ? translations.unit : filterCategory} 
                    का चयन करें
                  </h5>
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
              <div className="active-filters-container mb-4 p-2 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0 small-fonts">{translations.activeFilters}:</h6>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {Object.keys(activeFilters).map((categoryKey) => (
                    <div key={categoryKey} className="filter-category">
                      <strong>
                        {categoryKey === 'center_name' ? translations.centerName :
                         categoryKey === 'source_of_receipt' ? translations.sourceOfReceipt :
                         categoryKey === 'scheme_name' ? translations.schemeName :
                         categoryKey === 'component' ? translations.component :
                         categoryKey === 'investment_name' ? translations.investmentName :
                         categoryKey === 'unit' ? translations.unit : categoryKey}:
                      </strong>
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
        
          <Row>
            <Col md={3} className="mb-3">
              <Form.Group controlId="dataViewFilter">
                <Form.Label className="small-fonts">{translations.dataView}:</Form.Label>
                <Form.Select value={dataViewFilter} onChange={(e) => setDataViewFilter(e.target.value)} className="filter-dropdown small-fonts" disabled={dataViewFilter === "comparison"}>
                  <option value="allocated">{translations.allocatedData}</option>
                  <option value="sold">{translations.soldData}</option>
                  <option value="remaining">{translations.remainingData}</option>
                  <option value="comparison">{translations.comparisonData}</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="mb-3">
              <Form.Group controlId="dataTypeFilter">
                <Form.Label className="small-fonts">{translations.quantity}:</Form.Label>
                <Form.Select value={dataTypeFilter} onChange={(e) => setDataTypeFilter(e.target.value)} className="filter-dropdown small-fonts" disabled={dataViewFilter === "comparison"}>
                  <option value="quantity">मात्रा</option>
                  <option value="value">मूल्य</option>
                </Form.Select>
              </Form.Group>
            </Col>
            {/* <Col md={3} className="mb-3">
              <Form.Group controlId="chartTypeFilter">
                <Form.Label className="small-fonts">{translations.filterBy}:</Form.Label>
                <Form.Select value={chartType} onChange={(e) => setChartType(e.target.value)} className="filter-dropdown small-fonts">
                  <option value="pie">पाई चार्ट</option>
                  <option value="bar">बार चार्ट</option>
                  <option value="line">लाइन चार्ट</option>
                  <option value="area">एरिया चार्ट</option>
                  <option value="scatter">स्कैटर प्लॉट</option>
                  <option value="radar">राडार चार्ट</option>
                </Form.Select>
              </Form.Group>
            </Col> */}
            <Col md={3} className="mb-3">
              <Form.Group controlId="showWorkingItemsOnly">
                <Form.Check
                  type="checkbox"
                  label={translations.workingItems}
                  checked={showWorkingItemsOnly}
                  onChange={(e) => setShowWorkingItemsOnly(e.target.checked)}
                  className="small-fonts mt-4"
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12} className="mb-3 d-flex align-items-end">
              {hasActiveFilters && <div className="filter-info small-fonts">{translations.showingItems} {getChartData.centerData.length} {translations.of} {billingData.length} {translations.items}</div>}
            </Col>
          </Row>
        
          {/* Tab Navigation */}
          <Row className="mb-3">
            <Col md={12}>
              <ul className="nav nav-tabs">
                <li className={`nav-item ${activeTab === "overall" ? "active" : ""}`}>
                  {/* <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("overall") }}>{translations.overallData}</a> */}
                </li>
                <li className={`nav-item ${activeTab === "comparison" ? "active" : ""}`}>
                  {/* <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab("comparison") }}>{translations.comparisonData}</a> */}
                </li>
              </ul>
            </Col>
          </Row>

          {/* Tab Content */}
          {activeTab === "overall" && (
            <>
              {showPieCharts ? (
                // Show pie charts by default (until filters are applied)
                <>
                  <Row className="chart-container mt-4">
                    <Col md={6} className="mb-4">
                      <PieChart
                        data={getChartData.centerData}
                        title={translations.allocatedItemsByCenter}
                        dataType={dataTypeFilter}
                        onBarClick={handleBarClick}
                        chartType="center_name"
                      />
                    </Col>
                    <Col md={6} className="mb-4">
                      <PieChart
                        data={getChartData.sourceData}
                        title={dataViewFilter === "allocated" ?
                          (dataTypeFilter === "quantity" ? translations.allocatedItemsBySource : translations.allocatedValueBySource) :
                          dataViewFilter === "sold" ?
                            (dataTypeFilter === "quantity" ? translations.soldItemsBySource : translations.soldValueBySource) :
                            (dataTypeFilter === "quantity" ? translations.remainingItemsBySource : translations.remainingValueBySource)
                        }
                        dataType={dataTypeFilter}
                        onBarClick={handleBarClick}
                        chartType="source_of_receipt"
                      />
                    </Col>
                    <Col md={6} className="mb-4">
                      <PieChart
                        data={getChartData.schemeData}
                        title={dataViewFilter === "allocated" ?
                          (dataTypeFilter === "quantity" ? translations.allocatedItemsByScheme : translations.allocatedValueBySource) :
                            dataViewFilter === "sold" ?
                            (dataTypeFilter === "quantity" ? translations.soldItemsByScheme : translations.soldValueBySource) :
                            (dataTypeFilter === "quantity" ? translations.remainingItemsByScheme : translations.remainingValueBySource)
                        }
                        dataType={dataTypeFilter}
                        onBarClick={handleBarClick}
                        chartType="scheme_name"
                      />
                    </Col>
                    <Col md={6} className="mb-4">
                      <PieChart
                        data={getChartData.componentData}
                        title={dataViewFilter === "allocated" ?
                          (dataTypeFilter === "quantity" ? translations.allocatedItemsByComponent : translations.allocatedValueBySource) :
                            dataViewFilter === "sold" ?
                            (dataTypeFilter === "quantity" ? translations.soldItemsByComponent : translations.soldValueBySource) :
                            (dataTypeFilter === "quantity" ? translations.remainingItemsByComponent : translations.remainingValueBySource)
                        }
                        dataType={dataTypeFilter}
                        onBarClick={handleBarClick}
                        chartType="component"
                      />
                    </Col>
                    <Col md={6} className="mb-4">
                      <PieChart
                        data={getChartData.investmentData}
                        title={dataViewFilter === "allocated" ?
                          (dataTypeFilter === "quantity" ? `${translations.itemsByComponent} (${translations.investment})` : `${translations.valueDistribution} (${translations.investment})`) :
                            dataViewFilter === "sold" ?
                            (dataTypeFilter === "quantity" ? `${translations.itemsByComponent} (${translations.investment})` : `${translations.valueDistribution} (${translations.investment})`) :
                            (dataTypeFilter === "quantity" ? `${translations.itemsByComponent} (${translations.investment})` : `${translations.valueDistribution} (${translations.investment})`)
                        }
                        dataType={dataTypeFilter}
                        onBarClick={handleBarClick}
                        chartType="investment_name"
                      />
                    </Col>
                    <Col md={6} className="mb-4">
                      <PieChart
                        data={getChartData.unitData}
                        title={dataViewFilter === "allocated" ?
                          (dataTypeFilter === "quantity" ? `${translations.itemsByComponent} (${translations.unit})` : `${translations.valueDistribution} (${translations.unit})`) :
                            dataViewFilter === "sold" ?
                            (dataTypeFilter === "quantity" ? `${translations.itemsByComponent} (${translations.unit})` : `${translations.valueDistribution} (${translations.unit})`) :
                            (dataTypeFilter === "quantity" ? `${translations.itemsByComponent} (${translations.unit})` : `${translations.valueDistribution} (${translations.unit})`)
                        }
                        dataType={dataTypeFilter}
                        onBarClick={handleBarClick}
                        chartType="unit"
                      />
                    </Col>
                  </Row>
                </>
              ) : (
                // Show bar charts after filters are applied
                <>
                  {dataViewFilter === "comparison" ? (
                    <Row className="chart-container mt-4">
                      <Col md={12} className="mb-4">
                        <ComparisonBarChart 
                          data={getChartData.comparisonData} 
                          title={translations.allocatedVsSold} 
                          onBarClick={handleBarClick}
                        />
                      </Col>
                    </Row>
                  ) : (
                    <>
                      <Row className="chart-container mt-4">
                        <Col md={6} className="mb-4">
                          <SimpleBarChart
                            data={getChartData.centerData}
                            title={dataViewFilter === "allocated" ?
                              (dataTypeFilter === "quantity" ? translations.allocatedItemsByCenter : translations.allocatedValueBySource) :
                              dataViewFilter === "sold" ?
                                (dataTypeFilter === "quantity" ? translations.soldItemsByCenter : translations.soldValueBySource) :
                                (dataTypeFilter === "quantity" ? translations.remainingItemsByCenter : translations.remainingValueBySource)
                            }
                            dataType={dataTypeFilter}
                            onBarClick={(name, value) => handleBarClick(name, value, null, 'center_name')}
                            chartType="center_name"
                          />
                        </Col>
                        <Col md={6} className="mb-4">
                          <SimpleBarChart
                            data={getChartData.sourceData}
                            title={dataViewFilter === "allocated" ?
                              (dataTypeFilter === "quantity" ? translations.allocatedItemsBySource : translations.allocatedValueBySource) :
                              dataViewFilter === "sold" ?
                                (dataTypeFilter === "quantity" ? translations.soldItemsBySource : translations.soldValueBySource) :
                                (dataTypeFilter === "quantity" ? translations.remainingItemsBySource : translations.remainingValueBySource)
                            }
                            dataType={dataTypeFilter}
                            onBarClick={(name, value) => handleBarClick(name, value, null, 'source_of_receipt')}
                            chartType="source_of_receipt"
                          />
                        </Col>
                        <Col md={6} className="mb-4">
                          <SimpleBarChart
                            data={getChartData.schemeData}
                            title={dataViewFilter === "allocated" ?
                              (dataTypeFilter === "quantity" ? translations.allocatedItemsByScheme : translations.allocatedValueBySource) :
                                dataViewFilter === "sold" ?
                                    (dataTypeFilter === "quantity" ? translations.soldItemsByScheme : translations.soldValueBySource) :
                                    (dataTypeFilter === "quantity" ? translations.remainingItemsByScheme : translations.remainingValueBySource)
                            }
                            dataType={dataTypeFilter}
                            onBarClick={(name, value) => handleBarClick(name, value, null, 'scheme_name')}
                            chartType="scheme_name"
                          />
                        </Col>
                        <Col md={6} className="mb-4">
                          <SimpleBarChart
                            data={getChartData.componentData}
                            title={dataViewFilter === "allocated" ?
                              (dataTypeFilter === "quantity" ? translations.allocatedItemsByComponent : translations.allocatedValueBySource) :
                                dataViewFilter === "sold" ?
                                    (dataTypeFilter === "quantity" ? translations.soldItemsByComponent : translations.soldValueBySource) :
                                    (dataTypeFilter === "quantity" ? translations.remainingItemsByComponent : translations.remainingValueBySource)
                            }
                            dataType={dataTypeFilter}
                            onBarClick={(name, value) => handleBarClick(name, value, null, 'component')}
                            chartType="component"
                          />
                        </Col>
                        <Col md={6} className="mb-4">
                          <SimpleBarChart
                            data={getChartData.investmentData}
                            title={dataViewFilter === "allocated" ?
                              (dataTypeFilter === "quantity" ? `${translations.itemsByComponent} (${translations.investment})` : `${translations.valueDistribution} (${translations.investment})`) :
                                dataViewFilter === "sold" ?
                                    (dataTypeFilter === "quantity" ? `${translations.itemsByComponent} (${translations.investment})` : `${translations.valueDistribution} (${translations.investment})`) :
                                    (dataTypeFilter === "quantity" ? `${translations.itemsByComponent} (${translations.investment})` : `${translations.valueDistribution} (${translations.investment})`)
                            }
                            dataType={dataTypeFilter}
                            onBarClick={(name, value) => handleBarClick(name, value, null, 'investment_name')}
                            chartType="investment_name"
                          />
                        </Col>
                        <Col md={6} className="mb-4">
                          <SimpleBarChart
                            data={getChartData.unitData}
                            title={dataViewFilter === "allocated" ?
                              (dataTypeFilter === "quantity" ? `${translations.itemsByComponent} (${translations.unit})` : `${translations.valueDistribution} (${translations.unit})`) :
                                dataViewFilter === "sold" ?
                                    (dataTypeFilter === "quantity" ? `${translations.itemsByComponent} (${translations.unit})` : `${translations.valueDistribution} (${translations.unit})`) :
                                    (dataTypeFilter === "quantity" ? `${translations.itemsByComponent} (${translations.unit})` : `${translations.valueDistribution} (${translations.unit})`)
                            }
                            dataType={dataTypeFilter}
                            onBarClick={(name, value) => handleBarClick(name, value, null, 'unit')}
                            chartType="unit"
                          />
                        </Col>
                      </Row>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Graph;