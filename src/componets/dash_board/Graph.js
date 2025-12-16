import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Container, Row, Col, Form, Button, Spinner, Alert, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
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
  sourceOfReceipt: "रसीद का स्रोत",
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
  allUnits: "सभी इकाइयाँ", // Corrected spelling
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
  itemsByScheme: "योजना के अनुसार आइटम",
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
  // New translations for comparison filters
  dataView: "डेटा दृश्य",
  allocatedData: "आवंटित डेटा",
  soldData: "बेचा गया डेटा",
  remainingData: "शेष डेटा",
  comparisonData: "तुलनात्मक डेटा",
  workingItems: "कार्यशील आइटम्स (शेष मात्रा > 0)",
  showComparison: "आवंटित बनाम बेचा गया दिखाएं",
  allocatedVsSold: "आवंटित बनाम बेचा गया",
  remainingItems: "शेष आइटम्स",
  
  // More specific quantity labels
  allocatedQuantityLabel: "आवंटित मात्रा (इकाइयों में)",
  soldQuantityLabel: "बेची गई मात्रा (इकाइयों में)",
  remainingQuantityLabel: "शेष मात्रा (इकाइयों में)",
  
  // More specific value labels
  allocatedValueLabel: "आवंटित मूल्य (₹ में)",
  soldValueLabel: "बिक्री मूल्य (₹ में)",
  remainingValueLabel: "शेष मूल्य (₹ में)",
  
  // Chart specific labels
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
  
  // Unit labels for scaling
  inUnits: "(इकाइयों में)",
  inThousands: "(हजारों में)",
  inLakhs: "(लाखों में)",
  inCrores: "(करोड़ों में)",
  inRupees: "(₹ में)",
  inThousandsRupees: "(हजार ₹ में)",
  inLakhsRupees: "(लाख ₹ में)",
  inCroresRupees: "(करोड़ ₹ में)"
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

// Custom Pie Chart Component with Hover Tooltips and 100% case handling
const PieChart = ({ data, title, dataType }) => {
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
        
        {/* 
          CHANGE: Conditionally render legend and percentage distribution.
          If it's a full circle (one item), this information is redundant.
        */}
        {!isFullCircle && (
          <div className="">
            <Row>
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100; // Calculate percentage here
                const scaledValue = item.value * scaleFactor;
                return (
                  <Col md={6} key={item.name} className="mb-2">
                    <div className="legend-item">
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
        )}
      </Card.Body>
    </Card>
  );
};

// Custom Comparison Bar Chart Component
const ComparisonBarChart = ({ data, title }) => {
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
  const chartHeight = 300;
  const chartWidth = 800;
  const margin = { top: 20, right: 20, bottom: 60, left: 40 };
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
            {[0, 0.25, 0.5, 0.75, 1].map(tick => {
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
              const actualBarWidth = Math.min((groupWidth - barSpacing * 2) / 3, 15);
              
              const allocatedHeight = (item.allocated / maxValue) * innerHeight;
              const soldHeight = (item.sold / maxValue) * innerHeight;
              const remainingHeight = (item.remaining / maxValue) * innerHeight;
              
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
                    />
                  </OverlayTrigger>
                  
                  {/* X-axis label */}
                  <text
                    x={x}
                    y={innerHeight + margin.top + 20}
                    textAnchor="middle"
                    fontSize="12"
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
              <text x={20} y={12} fontSize="12">आवंटित मात्रा</text>
              
              <rect x={0} y={20} width={15} height={15} fill={colors.sold} />
              <text x={20} y={32} fontSize="12">बेची गई मात्रा</text>
              
              <rect x={0} y={40} width={15} height={15} fill={colors.remaining} />
              <text x={20} y={52} fontSize="12">शेष मात्रा</text>
            </g>
          </svg>
        </div>
      </Card.Body>
    </Card>
  );
};

// New Simple Bar Chart Component for filtered data
const SimpleBarChart = ({ data, title, dataType }) => {
  if (!data || data.length === 0) return null;

  const colors = [
    '#2C3E50', '#34495E', '#1F618D', '#27AE60', 
    '#16A085', '#F39C12', '#E74C3C', '#7F8C8D',
    '#28a745', '#17a2b8', '#6c757d', '#fd7e14'
  ];

  const maxValue = Math.max(...data.map(item => item.value));
  const { value: scaledMaxValue, unit: displayUnit } = formatNumberWithUnit(maxValue, dataType === 'value');
  const scaleFactor = scaledMaxValue / maxValue;
  
  const chartHeight = 300;
  const chartWidth = 800;
  const margin = { top: 20, right: 20, bottom: 60, left: 40 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;
  const barWidth = Math.min(innerWidth / data.length * 0.7, 40);

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
            {[0, 0.25, 0.5, 0.75, 1].map(tick => {
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
              const x = margin.left + (index * (innerWidth / data.length)) + (innerWidth / data.length - barWidth) / 2;
              const barHeight = (item.value / maxValue) * innerHeight;
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
                    />
                  </OverlayTrigger>
                  
                  {/* X-axis label */}
                  <text
                    x={x + barWidth / 2}
                    y={innerHeight + margin.top + 20}
                    textAnchor="middle"
                    fontSize="12"
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
                  <div className="legend-item">
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

const Graph = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setErrorType] = useState("");
  const [activeTab, setActiveTab] = useState("overall");
  
  // Filter states - reordered to put scheme before component
  const [centerFilter, setCenterFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [schemeFilter, setSchemeFilter] = useState(""); // Moved before component
  const [componentFilter, setComponentFilter] = useState(""); // Moved after scheme
  const [investmentFilter, setInvestmentFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  
  // New filter states for comparison
  const [dataViewFilter, setDataViewFilter] = useState("allocated"); // allocated, sold, remaining, comparison
  const [dataTypeFilter, setDataTypeFilter] = useState("quantity"); // quantity, value
  const [showWorkingItemsOnly, setShowWorkingItemsOnly] = useState(false); // Filter for items with remaining quantity > 0
  
  // State to track if graph should be generated based on filters
  const [generateFromFilters, setGenerateFromFilters] = useState(false);
  
  // State to store previously applied filters
  const [savedFilters, setSavedFilters] = useState({
    center: "",
    source: "",
    scheme: "", // Added scheme
    component: "",
    investment: "",
    unit: ""
  });

  // Extract unique values for each filter with cascading logic - updated order
  const uniqueCenters = useMemo(() => {
    if (!billingData.length) return [];
    const centers = [...new Set(billingData.map(item => item.center_name))];
    return centers.filter(Boolean).sort();
  }, [billingData]);

  const uniqueSources = useMemo(() => {
    if (!billingData.length) return [];
    let filteredData = billingData;
    if (centerFilter) {
      filteredData = filteredData.filter(item => item.center_name === centerFilter);
    }
    const sources = [...new Set(filteredData.map(item => item.source_of_receipt))];
    return sources.filter(Boolean).sort();
  }, [billingData, centerFilter]);

  // Changed order: scheme now comes before component
  const uniqueSchemes = useMemo(() => {
    if (!billingData.length) return [];
    let filteredData = billingData;
    if (centerFilter) filteredData = filteredData.filter(item => item.center_name === centerFilter);
    if (sourceFilter) filteredData = filteredData.filter(item => item.source_of_receipt === sourceFilter);
    const schemes = [...new Set(filteredData.map(item => item.scheme_name))];
    return schemes.filter(Boolean).sort();
  }, [billingData, centerFilter, sourceFilter]);

  const uniqueComponents = useMemo(() => {
    if (!billingData.length) return [];
    let filteredData = billingData;
    if (centerFilter) filteredData = filteredData.filter(item => item.center_name === centerFilter);
    if (sourceFilter) filteredData = filteredData.filter(item => item.source_of_receipt === sourceFilter);
    if (schemeFilter) filteredData = filteredData.filter(item => item.scheme_name === schemeFilter); // Now depends on scheme
    const components = [...new Set(filteredData.map(item => item.component))];
    return components.filter(Boolean).sort();
  }, [billingData, centerFilter, sourceFilter, schemeFilter]);

  const uniqueInvestments = useMemo(() => {
    if (!billingData.length) return [];
    let filteredData = billingData;
    if (centerFilter) filteredData = filteredData.filter(item => item.center_name === centerFilter);
    if (sourceFilter) filteredData = filteredData.filter(item => item.source_of_receipt === sourceFilter);
    if (schemeFilter) filteredData = filteredData.filter(item => item.scheme_name === schemeFilter);
    if (componentFilter) filteredData = filteredData.filter(item => item.component === componentFilter);
    const investments = [...new Set(filteredData.map(item => item.investment_name))];
    return investments.filter(Boolean).sort();
  }, [billingData, centerFilter, sourceFilter, schemeFilter, componentFilter]);

  const uniqueUnits = useMemo(() => {
    if (!billingData.length) return [];
    let filteredData = billingData;
    if (centerFilter) filteredData = filteredData.filter(item => item.center_name === centerFilter);
    if (sourceFilter) filteredData = filteredData.filter(item => item.source_of_receipt === sourceFilter);
    if (schemeFilter) filteredData = filteredData.filter(item => item.scheme_name === schemeFilter);
    if (componentFilter) filteredData = filteredData.filter(item => item.component === componentFilter);
    if (investmentFilter) filteredData = filteredData.filter(item => item.investment_name === investmentFilter);
    const units = [...new Set(filteredData.map(item => item.unit))];
    return units.filter(Boolean).sort();
  }, [billingData, centerFilter, sourceFilter, schemeFilter, componentFilter, investmentFilter]);

  // Filter data based on all selected filters - updated to include scheme
  const filteredData = useMemo(() => {
    let data = billingData.filter(item => {
      return (
        (!centerFilter || item.center_name === centerFilter) &&
        (!sourceFilter || item.source_of_receipt === sourceFilter) &&
        (!schemeFilter || item.scheme_name === schemeFilter) && // Added scheme filter
        (!componentFilter || item.component === componentFilter) &&
        (!investmentFilter || item.investment_name === investmentFilter) &&
        (!unitFilter || item.unit === unitFilter)
      );
    });
    
    // Filter for working items (remaining quantity > 0) if requested
    if (showWorkingItemsOnly) {
      data = data.filter(item => {
        const allocated = parseFloat(item.allocated_quantity) || 0;
        const sold = parseFloat(item.updated_quantity) || 0;
        return (allocated - sold) > 0;
      });
    }
    
    return data;
  }, [billingData, centerFilter, sourceFilter, schemeFilter, componentFilter, investmentFilter, unitFilter, showWorkingItemsOnly]);

  // Calculate summary statistics based on active tab and data view
  const summaryStats = useMemo(() => {
    const dataToUse = generateFromFilters ? filteredData : billingData;
    
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
  }, [billingData, filteredData, generateFromFilters]);

  // Prepare data for charts based on active tab and data view
  const getChartData = useMemo(() => {
    const dataToUse = generateFromFilters ? filteredData : billingData;
    if (!dataToUse.length) return { sourceData: [], centerData: [], componentData: [], investmentData: [], unitData: [], schemeData: [], comparisonData: [] };
    
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
            remainingValue: 0
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
      });
      
      // Transform data based on view type
      if (dataViewFilter === "comparison") {
        return Object.entries(data).map(([key, values]) => ({
          name: key,
          allocated: values.allocated,
          sold: values.sold,
          remaining: values.remaining
        })).sort((a, b) => b.allocated - a.allocated);
      } else {
        const valueField = dataViewFilter === "allocated" ? 
          (dataTypeFilter === "quantity" ? "allocated" : "allocatedValue") : 
          dataViewFilter === "sold" ? 
          (dataTypeFilter === "quantity" ? "sold" : "soldValue") : 
          (dataTypeFilter === "quantity" ? "remaining" : "remainingValue");
        
        return Object.entries(data).map(([key, values]) => ({
          name: key,
          value: values[valueField]
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
  }, [billingData, filteredData, generateFromFilters, dataViewFilter, dataTypeFilter]);

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

  // Apply saved filters when switching to filtered tab
  useEffect(() => {
    if (activeTab === "filtered" && generateFromFilters) {
      setCenterFilter(savedFilters.center);
      setSourceFilter(savedFilters.source);
      setSchemeFilter(savedFilters.scheme); // Added scheme
      setComponentFilter(savedFilters.component);
      setInvestmentFilter(savedFilters.investment);
      setUnitFilter(savedFilters.unit);
    }
  }, [activeTab, generateFromFilters, savedFilters]);

  // Fetch billing data
  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setLoading(true);
        setError(null);
        setErrorType("");
        
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

  const retryFetch = () => {
    // This is a simple retry, you could add more sophisticated logic
    window.location.reload();
  };

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'center':
        setCenterFilter(value);
        setSourceFilter("");
        setSchemeFilter(""); // Added scheme
        setComponentFilter("");
        setInvestmentFilter("");
        setUnitFilter("");
        break;
      case 'source':
        setSourceFilter(value);
        setSchemeFilter(""); // Added scheme
        setComponentFilter("");
        setInvestmentFilter("");
        setUnitFilter("");
        break;
      case 'scheme': // Added new case for scheme
        setSchemeFilter(value);
        setComponentFilter("");
        setInvestmentFilter("");
        setUnitFilter("");
        break;
      case 'component':
        setComponentFilter(value);
        setInvestmentFilter("");
        setUnitFilter("");
        break;
      case 'investment':
        setInvestmentFilter(value);
        setUnitFilter("");
        break;
      case 'unit':
        setUnitFilter(value);
        break;
      default:
        break;
    }
  };

  const clearAllFilters = () => {
    setCenterFilter("");
    setSourceFilter("");
    setSchemeFilter(""); // Added scheme
    setComponentFilter("");
    setInvestmentFilter("");
    setUnitFilter("");
    setGenerateFromFilters(false);
    setSavedFilters({ center: "", source: "", scheme: "", component: "", investment: "", unit: "" }); // Added scheme
    setShowWorkingItemsOnly(false);
  };

  const generateGraphFromFilters = () => {
    setSavedFilters({
      center: centerFilter, 
      source: sourceFilter, 
      scheme: schemeFilter, // Added scheme
      component: componentFilter,
      investment: investmentFilter, 
      unit: unitFilter
    });
    setGenerateFromFilters(true);
    setActiveTab("filtered");
  };

  const hasActiveFilters = centerFilter || sourceFilter || schemeFilter || componentFilter || investmentFilter || unitFilter; // Added scheme

  // Determine whether to show pie charts or bar charts
  const showPieCharts = !generateFromFilters; // Show pie charts until filters are applied

  return (
    <div className="dashboard-container">
      <LeftNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isMobile={isMobile} isTablet={isTablet} />
      <div className="main-content">
        <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Container fluid className="dashboard-body">
          <h1 className="page-title small-fonts">{translations.graphs}</h1>

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

          <div className="filter-section mt-3 mb-3">
            <Row className="mb-3">
              <Col md={12} className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 small-fonts">{translations.filters} {generateFromFilters && <span className="badge bg-info ms-2 small-fonts">{translations.filtersApplied}</span>}</h5>
                <div>
                  {hasActiveFilters && <Button variant="outline-primary" size="sm" onClick={generateGraphFromFilters} className="small-fonts me-2">{translations.generateGraph}</Button>}
                  <Button variant="outline-secondary" size="sm" onClick={clearAllFilters} className="small-fonts">{translations.clearAllFilters}</Button>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Group controlId="centerFilter">
                  <Form.Label className="small-fonts">{translations.centerName}:</Form.Label>
                  <Form.Select value={centerFilter} onChange={(e) => handleFilterChange('center', e.target.value)} className="filter-dropdown small-fonts">
                    <option value="">{translations.allCenters}</option>
                    {uniqueCenters.map(center => <option key={center} value={center}>{center}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group controlId="sourceFilter">
                  <Form.Label className="small-fonts">{translations.sourceOfReceipt}:</Form.Label>
                  <Form.Select value={sourceFilter} onChange={(e) => handleFilterChange('source', e.target.value)} className="filter-dropdown small-fonts" disabled={!centerFilter}>
                    <option value="">{centerFilter ? translations.allSources : translations.selectCenterFirst}</option>
                    {centerFilter && uniqueSources.map(source => <option key={source} value={source}>{source}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group controlId="schemeFilter">
                  <Form.Label className="small-fonts">{translations.schemeName}:</Form.Label>
                  <Form.Select value={schemeFilter} onChange={(e) => handleFilterChange('scheme', e.target.value)} className="filter-dropdown small-fonts" disabled={!sourceFilter}>
                    <option value="">{sourceFilter ? translations.allSchemes : translations.selectSourceFirst}</option>
                    {sourceFilter && uniqueSchemes.map(scheme => <option key={scheme} value={scheme}>{scheme}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Group controlId="componentFilter">
                  <Form.Label className="small-fonts">{translations.component}:</Form.Label>
                  <Form.Select value={componentFilter} onChange={(e) => handleFilterChange('component', e.target.value)} className="filter-dropdown small-fonts" disabled={!schemeFilter}>
                    <option value="">{schemeFilter ? translations.allComponents : translations.selectSchemeFirst}</option>
                    {schemeFilter && uniqueComponents.map(component => <option key={component} value={component}>{component}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group controlId="investmentFilter">
                  <Form.Label className="small-fonts">{translations.investmentName}:</Form.Label>
                  <Form.Select value={investmentFilter} onChange={(e) => handleFilterChange('investment', e.target.value)} className="filter-dropdown small-fonts" disabled={!componentFilter}>
                    <option value="">{componentFilter ? translations.allInvestments : translations.selectComponentFirst}</option>
                    {componentFilter && uniqueInvestments.map(investment => <option key={investment} value={investment}>{investment}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group controlId="unitFilter">
                  <Form.Label className="small-fonts">{translations.unit}:</Form.Label>
                  <Form.Select value={unitFilter} onChange={(e) => handleFilterChange('unit', e.target.value)} className="filter-dropdown small-fonts" disabled={!investmentFilter}>
                    <option value="">{investmentFilter ? translations.allUnits : translations.selectInvestmentFirst}</option>
                    {investmentFilter && uniqueUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Group controlId="dataViewFilter">
                  <Form.Label className="small-fonts">{translations.dataView}:</Form.Label>
                  <Form.Select value={dataViewFilter} onChange={(e) => setDataViewFilter(e.target.value)} className="filter-dropdown small-fonts">
                    <option value="allocated">{translations.allocatedData}</option>
                    <option value="sold">{translations.soldData}</option>
                    <option value="remaining">{translations.remainingData}</option>
                    <option value="comparison">{translations.comparisonData}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
                <Form.Group controlId="dataTypeFilter">
                  <Form.Label className="small-fonts">डेटा प्रकार:</Form.Label>
                  <Form.Select value={dataTypeFilter} onChange={(e) => setDataTypeFilter(e.target.value)} className="filter-dropdown small-fonts" disabled={dataViewFilter === "comparison"}>
                    <option value="quantity">मात्रा</option>
                    <option value="value">मूल्य</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="mb-3">
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
                {hasActiveFilters && <div className="filter-info small-fonts">{translations.showingItems} {filteredData.length} {translations.of} {billingData.length} {translations.items}</div>}
              </Col>
            </Row>
          </div>
          
          {loading ? <div className="text-center my-5"><Spinner animation="border" role="status"><span className="visually-hidden">{translations.loading}</span></Spinner></div> : error ? (
            <Alert variant="danger" className="small-fonts">{error}<div className="mt-2"><Button variant="outline-danger" size="sm" onClick={retryFetch}>{translations.retry}</Button></div></Alert>
          ) : (
            <>
              {billingData.length > 0 ? (
                <>
                  {showPieCharts ? (
                    // Show pie charts by default (until filters are applied)
                    <>
                      {dataViewFilter === "comparison" ? (
                        <Row className="chart-container mt-4">
                          <Col md={12} className="mb-4">
                            <ComparisonBarChart 
                              data={getChartData.comparisonData} 
                              title={translations.allocatedVsSold} 
                            />
                          </Col>
                        </Row>
                      ) : (
                        <>
                          <Row className="chart-container mt-4">
                            <Col md={6} className="mb-4">
                              <PieChart 
                                data={getChartData.centerData} 
                                title={dataViewFilter === "allocated" ? 
                                  (dataTypeFilter === "quantity" ? translations.allocatedItemsByCenter : translations.allocatedValueBySource) :
                                  dataViewFilter === "sold" ? 
                                  (dataTypeFilter === "quantity" ? translations.soldItemsByCenter : translations.soldValueBySource) :
                                  (dataTypeFilter === "quantity" ? translations.remainingItemsByCenter : translations.remainingValueBySource)
                                }
                                dataType={dataTypeFilter}
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
                              />
                            </Col>
                          </Row>
                          <Row className="chart-container">
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
                              />
                            </Col>
                          </Row>
                          <Row className="chart-container">
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
                              />
                            </Col>
                          </Row>
                        </>
                      )}
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
                              />
                            </Col>
                          </Row>
                          <Row className="chart-container">
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
                              />
                            </Col>
                          </Row>
                          <Row className="chart-container">
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
                              />
                            </Col>
                          </Row>
                        </>
                      )}
                    </>
                  )}
                </>
              ) : (
                <Alert variant="info" className="small-fonts">{hasActiveFilters ? translations.noMatchingItems : translations.noItemsFound}</Alert>
              )}
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Graph;