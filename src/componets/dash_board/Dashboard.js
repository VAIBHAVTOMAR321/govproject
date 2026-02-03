import React, { useState, useEffect, useMemo, useRef } from "react";
import { Container, Spinner, Alert, Row, Col, Card, Form, Button, Modal, Dropdown, ButtonGroup, Accordion, Collapse } from "react-bootstrap";
import Select from "react-select";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import "../../assets/css/dashboard.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import Footer from "../footer/Footer";
import { FaClipboardList, FaRupeeSign, FaHandHoldingUsd, FaChartLine, FaCalendarAlt, FaFilter, FaChartBar, FaChartPie, FaFilePdf, FaFileExcel, FaDownload, FaEye, FaTable, FaInfoCircle } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// Hindi translations
const translations = {
  home: "Home",
  welcomeMessage: "DHO कोटद्वार उद्यान विभाग डिजिटल प्लेटफॉर्म में आपका स्वागत है",
  selectScheme: "योजना चुनें",
  selectInvestment: "उपनिवेश चुनें",
  allSchemes: "सभी योजनाएं",
  allInvestments: "सभी उपनिवेश",
  allocatedQuantity: "आवंटित मात्रा",
  farmerShareAmount: "किसान की हिस्सेदारी की राशि",
  subsidyAmount: "सब्सिडी की राशि",
  totalAmount: "कुल राशि",
  loading: "लोड हो रहा है...",
  networkError: "नेटवर्क त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।",
  serverError: "सर्वर त्रुटि। कृपया बाद में पुन: प्रयास करें।",
  dataError: "डेटा प्रोसेस करने में त्रुटि।",
  retry: "पुनः प्रयास करें",
  overviewTitle: "समग्र डेटा अवलोकन",
  filterByScheme: "योजना के अनुसार फ़िल्टर करें (एक या अधिक चुनें)",
  filterByInvestment: "उपनिवेश के अनुसार फ़िल्टर करें (एक या अधिक चुनें)",
  totalRecords: "कुल रिकॉर्ड",
  selectSchemeFirst: "पहले योजना चुनें",
  selectPlaceholder: "चुनें...",
  noOptions: "कोई विकल्प उपलब्ध नहीं",
  startDate: "प्रारंभ तिथि",
  endDate: "समाप्ति तिथि",
  applyFilter: "फ़िल्टर लागू करें",
  clearFilter: "फ़िल्टर हटाएं",
  dateFilter: "तिथि के अनुसार फ़िल्टर",
  dateRangeSelected: "चयनित तिथि सीमा",
  graphsByScheme: "योजना के अनुसार ग्राफ़",
  graphsByInvestment: "उपनिवेश के अनुसार ग्राफ़",
  combinedGraph: "संयुक्त ग्राफ़",
  amountComparison: "राशि तुलना",
  schemeWiseDistribution: "योजना-वार वितरण",
  investmentWiseDistribution: "उपनिवेश-वार वितरण"
};

// Custom styles for react-select
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? '#194e8b' : '#e0e0e0',
    borderWidth: '1px',
    borderRadius: '6px',
    padding: '2px',
    minHeight: '36px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(25, 78, 139, 0.15)' : 'none',
    '&:hover': {
      borderColor: '#194e8b'
    }
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '0 6px'
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#194e8b',
    borderRadius: '3px',
    margin: '2px'
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#ffffff',
    fontSize: '0.75rem',
    padding: '1px 4px'
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#ffffff',
    padding: '0 2px',
    '&:hover': {
      backgroundColor: '#0d3a6b',
      color: '#ffffff'
    }
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6c757d',
    fontSize: '0.8rem'
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#194e8b' : state.isFocused ? '#e8f0f8' : '#ffffff',
    color: state.isSelected ? '#ffffff' : '#333333',
    fontSize: '0.8rem',
    padding: '8px 12px',
    '&:active': {
      backgroundColor: '#194e8b'
    }
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999
  })
};

// Top-level: label map for all views
const rashiColumnLabelExcel = {
  farmerShare: 'किसान की हिस्सेदारी',
  subsidy: 'सब्सिडी राशि',
  total: 'कुल राशि'
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // राशि filter state
  const [selectedRashi, setSelectedRashi] = useState('subsidy');
  const rashiOptions = [
    { value: 'farmerShare', label: 'किसान की हिस्सेदारी की राशि' },
    { value: 'subsidy', label: 'सब्सिडी की राशि' },
    { value: 'total', label: 'कुल राशि' }
  ];

  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);
  
  // Filter states - now arrays for multiple selection
  const [selectedSchemes, setSelectedSchemes] = useState([]);
  const [selectedInvestments, setSelectedInvestments] = useState([]);

  // Track open collapsible tables by key
  const [openCollapses, setOpenCollapses] = useState([]);

  // State for scheme table filter
  const [selectedTableSchemes, setSelectedTableSchemes] = useState([]);

  // State for vidhan sabha table filters
  const [selectedVidhanSabhas, setSelectedVidhanSabhas] = useState([]);
  const [selectedVidhanSchemes, setSelectedVidhanSchemes] = useState([]);

  // State for center table filters
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [selectedCenterSchemes, setSelectedCenterSchemes] = useState([]);

  // State for sub-investment table filters
  const [selectedSubInvestments, setSelectedSubInvestments] = useState([]);
  const [selectedSubInvestmentSchemes, setSelectedSubInvestmentSchemes] = useState([]);

  // State for investment table filters
  const [selectedMainInvestments, setSelectedMainInvestments] = useState([]);
  const [selectedMainInvestmentSchemes, setSelectedMainInvestmentSchemes] = useState([]);

  // Toggle collapsible handler
  const toggleCollapse = (key) => {
    setOpenCollapses(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // Excel preview state
  const [excelPreviewData, setExcelPreviewData] = useState(null);
  const [showExcelPreview, setShowExcelPreview] = useState(false);

  // Filter data by date range first
  const dateFilteredData = useMemo(() => {
    if (!isDateFilterApplied || (!appliedStartDate && !appliedEndDate)) {
      return billingData;
    }
    
    return billingData.filter(item => {
      const itemDate = new Date(item.bill_date);
      const start = appliedStartDate ? new Date(appliedStartDate) : null;
      const end = appliedEndDate ? new Date(appliedEndDate) : null;
      
      if (start && end) {
        return itemDate >= start && itemDate <= end;
      } else if (start) {
        return itemDate >= start;
      } else if (end) {
        return itemDate <= end;
      }
      return true;
    });
  }, [billingData, appliedStartDate, appliedEndDate, isDateFilterApplied]);

  // Extract unique schemes as options for react-select (from date filtered data)
  const schemeOptions = useMemo(() => {
    if (!dateFilteredData.length) return [];
    let filteredData = dateFilteredData;
    
    // Filter by selected investments if any are selected
    if (selectedInvestments.length > 0) {
      const investmentValues = selectedInvestments.map(i => i.value);
      filteredData = filteredData.filter(item => investmentValues.includes(item.sub_investment_name));
    }
    
    const schemes = [...new Set(filteredData.map(item => item.scheme_name))];
    return schemes.filter(Boolean).sort().map(scheme => ({
      value: scheme,
      label: scheme
    }));
  }, [dateFilteredData, selectedInvestments]);

  // Extract unique investments as options for react-select (from date filtered data)
  const investmentOptions = useMemo(() => {
    if (!dateFilteredData.length) return [];
    let filteredData = dateFilteredData;
    
    // Filter by selected schemes if any are selected
    if (selectedSchemes.length > 0) {
      const schemeValues = selectedSchemes.map(s => s.value);
      filteredData = filteredData.filter(item => schemeValues.includes(item.scheme_name));
    }
    
    const investments = [...new Set(filteredData.map(item => item.sub_investment_name))];
    return investments.filter(Boolean).sort().map(investment => ({
      value: investment,
      label: investment
    }));
  }, [dateFilteredData, selectedSchemes]);

  // Filter data based on multiple selections (schemes and investments)
  const filteredData = useMemo(() => {
    return dateFilteredData.filter(item => {
      const schemeMatch = selectedSchemes.length === 0 || 
        selectedSchemes.some(s => s.value === item.scheme_name);
      const investmentMatch = selectedInvestments.length === 0 || 
        selectedInvestments.some(i => i.value === item.sub_investment_name);
      
      return schemeMatch && investmentMatch;
    });
  }, [dateFilteredData, selectedSchemes, selectedInvestments]);

  // Calculate aggregated statistics
  const aggregatedStats = useMemo(() => {
    const stats = {
      totalRecords: filteredData.length,
      allocatedQuantity: 0,
      farmerShareAmount: 0,
      subsidyAmount: 0,
      totalAmount: 0
    };

    filteredData.forEach(item => {
      stats.allocatedQuantity += parseFloat(item.allocated_quantity) || 0;
      stats.farmerShareAmount += parseFloat(item.amount_of_farmer_share) || 0;
      stats.subsidyAmount += parseFloat(item.amount_of_subsidy) || 0;
      stats.totalAmount += parseFloat(item.total_amount) || 0;
    });

    return stats;
  }, [filteredData]);

  // Chart data for Center-wise analysis (केंद्र)
  const centerChartData = useMemo(() => {
    const centerData = {};
    filteredData.forEach(item => {
      const center = item.center_name || 'अन्य';
      if (!centerData[center]) {
        centerData[center] = { farmerShare: 0, subsidy: 0, total: 0, quantity: 0 };
      }
      centerData[center].farmerShare += parseFloat(item.amount_of_farmer_share) || 0;
      centerData[center].subsidy += parseFloat(item.amount_of_subsidy) || 0;
      centerData[center].total += parseFloat(item.total_amount) || 0;
      centerData[center].quantity += parseFloat(item.allocated_quantity) || 0;
    });

    const sortedEntries = Object.entries(centerData).sort((a, b) => b[1].total - a[1].total);
    const labels = sortedEntries.map(([key]) => key);
    const truncated = labels.map(l => l.length > 20 ? l.substring(0, 18) + '...' : l);

    const baseColors = [
      'rgba(40, 167, 69, 0.8)', 'rgba(25, 78, 139, 0.8)', 'rgba(253, 126, 20, 0.8)',
      'rgba(102, 16, 242, 0.8)', 'rgba(220, 53, 69, 0.8)', 'rgba(32, 201, 151, 0.8)'
    ];
    const colors = labels.map((_, i) => baseColors[i % baseColors.length]);

    return {
      doughnut: {
        labels: truncated,
        fullLabels: labels,
        datasets: [{
          data: sortedEntries.map(([, val]) => val.total),
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.8', '1')),
          borderWidth: 1
        }]
      },
      rawData: centerData,
      itemCount: labels.length
    };
  }, [filteredData]);

  // Chart data for Vidhan Sabha-wise analysis (विधानसभा)
  const vidhanChartData = useMemo(() => {
    const vidhanData = {};
    filteredData.forEach(item => {
      const vidhan = item.vidhan_sabha_name || item.vidhanasabha || 'अन्य';
      if (!vidhanData[vidhan]) {
        vidhanData[vidhan] = { farmerShare: 0, subsidy: 0, total: 0, quantity: 0 };
      }
      vidhanData[vidhan].farmerShare += parseFloat(item.amount_of_farmer_share) || 0;
      vidhanData[vidhan].subsidy += parseFloat(item.amount_of_subsidy) || 0;
      vidhanData[vidhan].total += parseFloat(item.total_amount) || 0;
      vidhanData[vidhan].quantity += parseFloat(item.allocated_quantity) || 0;
    });

    const sortedEntries = Object.entries(vidhanData).sort((a, b) => b[1].total - a[1].total);
    const fullLabels = sortedEntries.map(([key]) => key);
    const truncatedLabels = fullLabels.map(l => l.length > 20 ? l.substring(0, 18) + '...' : l);

    // generate colors
    const baseColors = [
      'rgba(40, 167, 69, 0.8)', 'rgba(25, 78, 139, 0.8)', 'rgba(253, 126, 20, 0.8)',
      'rgba(102, 16, 242, 0.8)', 'rgba(220, 53, 69, 0.8)', 'rgba(32, 201, 151, 0.8)',
      'rgba(255, 193, 7, 0.8)', 'rgba(23, 162, 184, 0.8)', 'rgba(108, 117, 125, 0.8)'
    ];
    const colors = fullLabels.map((_, i) => baseColors[i % baseColors.length]);

    const limitedFull = fullLabels.slice(0, 50);
    const limitedTruncated = truncatedLabels.slice(0, 50);

    return {
      doughnut: {
        labels: limitedTruncated,
        fullLabels: limitedFull,
        datasets: [{
          data: limitedFull.map(l => (vidhanData[l] && vidhanData[l].total) || 0),
          backgroundColor: colors.slice(0, limitedFull.length),
          borderColor: colors.slice(0, limitedFull.length).map(c => c.replace('0.8', '1')),
          borderWidth: 1
        }]
      },
      rawData: vidhanData,
      itemCount: fullLabels.length
    };
  }, [filteredData]);

  // Format number to Indian currency format
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(num);
  };

  // Collapse graphs section cards initially and toggle on header click
  useEffect(() => {
    const container = document.getElementById('graphsSection');
    if (!container) return;
    const cards = Array.from(container.querySelectorAll('.chart-card'));
    cards.forEach(card => {
      const header = card.querySelector('.chart-card-header');
      const body = card.querySelector('.card-body');
      if (header && body) {
        body.style.display = 'none';
        header.style.cursor = 'pointer';
        const toggle = () => {
          body.style.display = (body.style.display === 'none') ? '' : 'none';
        };
        header.addEventListener('click', toggle);
        // store for cleanup
        header.__toggle = toggle;
      }
    });

    return () => {
      cards.forEach(card => {
        const header = card.querySelector('.chart-card-header');
        if (header && header.__toggle) header.removeEventListener('click', header.__toggle);
      });
    };
  }, [filteredData]);

  // Reorder chart-cards inside graphsSection into a hierarchical order
  useEffect(() => {
    const container = document.getElementById('graphsSection');
    if (!container) return;
    const cardNodes = Array.from(container.querySelectorAll('.chart-card'));
    const order = [
      'योजना-वार', // scheme summary
      'योजना-वार कुल सब्सिडी तुलना',
      'उपनिवेश',
      'उपनिवेश - योजना',
      'निवेश',
      'केंद्र के अनुसार',
      'केंद्र के अनुसार योजना-वार',
      'विधानसभा के अनुसार',
      'विधानसभा के अनुसार योजना-वार'
    ];

    const getRank = (card) => {
      const hdr = card.querySelector('.chart-card-header h6');
      const text = hdr ? hdr.textContent.trim() : '';
      for (let i = 0; i < order.length; i++) {
        if (text.includes(order[i]) || text.startsWith(order[i])) return i;
      }
      return order.length + 1;
    };

    cardNodes.sort((a, b) => getRank(a) - getRank(b));
    cardNodes.forEach(node => container.appendChild(node));
  }, [filteredData]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Chart data for scheme-wise analysis
  const schemeChartData = useMemo(() => {
    const schemeData = {};
    filteredData.forEach(item => {
      const scheme = item.scheme_name || 'अन्य';
      if (!schemeData[scheme]) {
        schemeData[scheme] = {
          farmerShare: 0,
          subsidy: 0,
          total: 0,
          quantity: 0
        };
      }
      schemeData[scheme].farmerShare += parseFloat(item.amount_of_farmer_share) || 0;
      schemeData[scheme].subsidy += parseFloat(item.amount_of_subsidy) || 0;
      schemeData[scheme].total += parseFloat(item.total_amount) || 0;
      schemeData[scheme].quantity += parseFloat(item.allocated_quantity) || 0;
    });

    const labels = Object.keys(schemeData);
    const colors = [
      'rgba(25, 78, 139, 0.8)', 'rgba(40, 167, 69, 0.8)', 'rgba(255, 193, 7, 0.8)',
      'rgba(220, 53, 69, 0.8)', 'rgba(23, 162, 184, 0.8)', 'rgba(108, 117, 125, 0.8)',
      'rgba(102, 16, 242, 0.8)', 'rgba(253, 126, 20, 0.8)', 'rgba(32, 201, 151, 0.8)'
    ];

    return {
      bar: {
        labels,
        datasets: [
          {
            label: translations.farmerShareAmount,
            data: labels.map(l => schemeData[l].farmerShare),
            backgroundColor: 'rgba(255, 193, 7, 0.7)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 1
          },
          {
            label: translations.subsidyAmount,
            data: labels.map(l => schemeData[l].subsidy),
            backgroundColor: 'rgba(23, 162, 184, 0.7)',
            borderColor: 'rgba(23, 162, 184, 1)',
            borderWidth: 1
          }
        ]
      },
      pie: {
        labels,
        datasets: [{
          data: labels.map(l => schemeData[l].total),
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(c => c.replace('0.8', '1')),
          borderWidth: 2
        }]
      },
      rawData: schemeData
    };
  }, [filteredData]);

  // Chart data for investment-wise analysis (उपनिवेश)
  const investmentChartData = useMemo(() => {
    const investmentData = {};
    filteredData.forEach(item => {
      const investment = item.sub_investment_name || 'अन्य';
      if (!investmentData[investment]) {
        investmentData[investment] = {
          farmerShare: 0,
          subsidy: 0,
          total: 0,
          quantity: 0
        };
      }
      investmentData[investment].farmerShare += parseFloat(item.amount_of_farmer_share) || 0;
      investmentData[investment].subsidy += parseFloat(item.amount_of_subsidy) || 0;
      investmentData[investment].total += parseFloat(item.total_amount) || 0;
      investmentData[investment].quantity += parseFloat(item.allocated_quantity) || 0;
    });

    // Sort by total amount descending for better visibility
    const sortedEntries = Object.entries(investmentData)
      .sort((a, b) => b[1].total - a[1].total);
    
    const labels = sortedEntries.map(([key]) => key);
    const truncatedLabels = labels.map(l => l.length > 20 ? l.substring(0, 18) + '...' : l);
    
    // Generate more colors for many items
    const baseColors = [
      'rgba(40, 167, 69, 0.8)', 'rgba(25, 78, 139, 0.8)', 'rgba(253, 126, 20, 0.8)',
      'rgba(102, 16, 242, 0.8)', 'rgba(220, 53, 69, 0.8)', 'rgba(32, 201, 151, 0.8)',
      'rgba(255, 193, 7, 0.8)', 'rgba(23, 162, 184, 0.8)', 'rgba(108, 117, 125, 0.8)',
      'rgba(0, 123, 255, 0.8)', 'rgba(111, 66, 193, 0.8)', 'rgba(253, 51, 114, 0.8)',
      'rgba(0, 200, 150, 0.8)', 'rgba(255, 120, 100, 0.8)', 'rgba(80, 180, 220, 0.8)',
      'rgba(180, 100, 200, 0.8)', 'rgba(100, 200, 100, 0.8)', 'rgba(255, 160, 50, 0.8)'
    ];
    const colors = labels.map((_, i) => baseColors[i % baseColors.length]);

    return {
      bar: {
        labels: truncatedLabels,
        fullLabels: labels, // Keep full labels for tooltips
        datasets: [
          {
            label: translations.farmerShareAmount,
            data: sortedEntries.map(([, val]) => val.farmerShare),
            backgroundColor: 'rgba(255, 193, 7, 0.7)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 1
          },
          {
            label: translations.subsidyAmount,
            data: sortedEntries.map(([, val]) => val.subsidy),
            backgroundColor: 'rgba(23, 162, 184, 0.7)',
            borderColor: 'rgba(23, 162, 184, 1)',
            borderWidth: 1
          }
        ]
      },
      doughnut: {
        labels: truncatedLabels,
        fullLabels: labels,
        datasets: [{
          data: sortedEntries.map(([, val]) => val.total),
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.8', '1')),
          borderWidth: 1
        }]
      },
      rawData: investmentData,
      itemCount: labels.length
    };
  }, [filteredData]);

  // Chart data for main investment-wise subsidy analysis
  const investmentSubsidyChartData = useMemo(() => {
    const investmentData = {};
    filteredData.forEach(item => {
      const investment = item.investment_name || 'अन्य';
      if (!investmentData[investment]) {
        investmentData[investment] = {
          subsidy: 0,
          quantity: 0
        };
      }
      investmentData[investment].subsidy += parseFloat(item.amount_of_subsidy) || 0;
      investmentData[investment].quantity += parseFloat(item.allocated_quantity) || 0;
    });

    const labels = Object.keys(investmentData).sort((a, b) => investmentData[b].subsidy - investmentData[a].subsidy);
    const truncatedLabels = labels.map(label => label.length > 15 ? label.substring(0, 15) + '...' : label);

    // Generate colors for the chart
    const baseColors = [
      'rgba(40, 167, 69, 0.8)', 'rgba(25, 78, 139, 0.8)', 'rgba(253, 126, 20, 0.8)',
      'rgba(102, 16, 242, 0.8)', 'rgba(220, 53, 69, 0.8)', 'rgba(32, 201, 151, 0.8)',
      'rgba(255, 193, 7, 0.8)', 'rgba(23, 162, 184, 0.8)', 'rgba(108, 117, 125, 0.8)',
      'rgba(0, 123, 255, 0.8)', 'rgba(111, 66, 193, 0.8)', 'rgba(253, 51, 114, 0.8)',
      'rgba(0, 200, 150, 0.8)', 'rgba(255, 120, 100, 0.8)', 'rgba(80, 180, 220, 0.8)',
      'rgba(180, 100, 200, 0.8)', 'rgba(100, 200, 100, 0.8)', 'rgba(255, 160, 50, 0.8)'
    ];
    const colors = labels.map((_, i) => baseColors[i % baseColors.length]);

    const data = labels.map(label => investmentData[label].subsidy);

    return {
      doughnut: {
        labels: truncatedLabels,
        fullLabels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map(c => c.replace('0.8', '1')),
          borderWidth: 1
        }]
      },
      rawData: investmentData,
      itemCount: labels.length
    };
  }, [filteredData]);

  // Combined table data (Investment-wise Scheme breakdown)
  const combinedTableData = useMemo(() => {
    // Build investment -> scheme -> { subsidy, farmerShare, total, quantity }
    const investmentSchemeData = {};
    filteredData.forEach(item => {
      const investment = item.investment_name || 'अन्य';
      const scheme = item.scheme_name || 'अन्य';
      const subsidy = parseFloat(item.amount_of_subsidy) || 0;
      const farmerShare = parseFloat(item.amount_of_farmer_share) || 0;
      const total = parseFloat(item.total_amount) || 0;
      const qty = parseFloat(item.allocated_quantity) || 0;
      if (!investmentSchemeData[investment]) investmentSchemeData[investment] = {};
      if (!investmentSchemeData[investment][scheme]) investmentSchemeData[investment][scheme] = { subsidy: 0, farmerShare: 0, total: 0, quantity: 0 };
      investmentSchemeData[investment][scheme].subsidy += subsidy;
      investmentSchemeData[investment][scheme].farmerShare += farmerShare;
      investmentSchemeData[investment][scheme].total += total;
      investmentSchemeData[investment][scheme].quantity += qty;
    });

    const investments = Object.keys(investmentSchemeData).sort();
    const allSchemes = new Set();
    investments.forEach(inv => {
      Object.keys(investmentSchemeData[inv]).forEach(sch => allSchemes.add(sch));
    });
    const schemes = Array.from(allSchemes).sort();

    const totals = {};
    const quantities = {};
    investments.forEach(inv => {
      totals[inv] = schemes.reduce((sum, sch) => sum + ((investmentSchemeData[inv][sch] && investmentSchemeData[inv][sch].subsidy) || 0), 0);
      quantities[inv] = schemes.reduce((sum, sch) => sum + ((investmentSchemeData[inv][sch] && investmentSchemeData[inv][sch].quantity) || 0), 0);
    });
    const grandTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);
    const grandQuantity = Object.values(quantities).reduce((sum, val) => sum + val, 0);

    return { investments, schemes, data: investmentSchemeData, totals, quantities, grandTotal, grandQuantity };
  }, [filteredData]);

  // Sub-investment table data (Sub-investment-wise Scheme breakdown)
  const subCombinedTableData = useMemo(() => {
    const subInvestmentSchemeData = {};
    filteredData.forEach(item => {
      const subInvestment = item.sub_investment_name || 'अन्य';
      const scheme = item.scheme_name || 'अन्य';
      const subsidy = parseFloat(item.amount_of_subsidy) || 0;
      const farmerShare = parseFloat(item.amount_of_farmer_share) || 0;
      const total = parseFloat(item.total_amount) || 0;
      const qty = parseFloat(item.allocated_quantity) || 0;
      if (!subInvestmentSchemeData[subInvestment]) subInvestmentSchemeData[subInvestment] = {};
      if (!subInvestmentSchemeData[subInvestment][scheme]) subInvestmentSchemeData[subInvestment][scheme] = { subsidy: 0, farmerShare: 0, total: 0, quantity: 0 };
      subInvestmentSchemeData[subInvestment][scheme].subsidy += subsidy;
      subInvestmentSchemeData[subInvestment][scheme].farmerShare += farmerShare;
      subInvestmentSchemeData[subInvestment][scheme].total += total;
      subInvestmentSchemeData[subInvestment][scheme].quantity += qty;
    });

    const subInvestments = Object.keys(subInvestmentSchemeData).sort();
    const allSchemes = new Set();
    subInvestments.forEach(subInv => {
      Object.keys(subInvestmentSchemeData[subInv]).forEach(sch => allSchemes.add(sch));
    });
    const schemes = Array.from(allSchemes).sort();

    const data = subInvestmentSchemeData;
    const totals = {};
    const quantities = {};
    subInvestments.forEach(subInv => {
      totals[subInv] = schemes.reduce((sum, sch) => sum + ((data[subInv][sch] && data[subInv][sch].subsidy) || 0), 0);
      quantities[subInv] = schemes.reduce((sum, sch) => sum + ((data[subInv][sch] && data[subInv][sch].quantity) || 0), 0);
    });
    const grandTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);
    const grandQuantity = Object.values(quantities).reduce((sum, val) => sum + val, 0);

    return { subInvestments, schemes, data, totals, quantities, grandTotal, grandQuantity };
  }, [filteredData]);

  // Vidhan Sabha table data (Vidhan Sabha - Scheme breakdown)
  const vidhanCombinedTableData = useMemo(() => {
    const vidhanSchemeData = {};
    const vidhanQuantities = {};
    filteredData.forEach(item => {
      const vidhan = item.vidhan_sabha_name || 'अन्य';
      const scheme = item.scheme_name || 'अन्य';
      const subsidy = parseFloat(item.amount_of_subsidy) || 0;
      const farmerShare = parseFloat(item.amount_of_farmer_share) || 0;
      const total = parseFloat(item.total_amount) || 0;
      const qty = parseFloat(item.allocated_quantity) || 0;
      if (!vidhanSchemeData[vidhan]) vidhanSchemeData[vidhan] = {};
      if (!vidhanSchemeData[vidhan][scheme]) vidhanSchemeData[vidhan][scheme] = { subsidy: 0, farmerShare: 0, total: 0, quantity: 0 };
      vidhanSchemeData[vidhan][scheme].subsidy += subsidy;
      vidhanSchemeData[vidhan][scheme].farmerShare += farmerShare;
      vidhanSchemeData[vidhan][scheme].total += total;
      vidhanSchemeData[vidhan][scheme].quantity += qty;
      if (!vidhanQuantities[vidhan]) vidhanQuantities[vidhan] = 0;
      vidhanQuantities[vidhan] += qty;
    });

    const vidhans = Object.keys(vidhanSchemeData).sort();
    const allSchemes = new Set();
    vidhans.forEach(v => Object.keys(vidhanSchemeData[v]).forEach(s => allSchemes.add(s)));
    const schemes = Array.from(allSchemes).sort();

    const totals = {};
    const quantities = {};
    vidhans.forEach(v => {
      totals[v] = schemes.reduce((sum, sch) => sum + ((vidhanSchemeData[v][sch] && vidhanSchemeData[v][sch].subsidy) || 0), 0);
      quantities[v] = vidhanQuantities[v] || 0;
    });
    const grandTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);
    const grandQuantity = Object.values(quantities).reduce((sum, val) => sum + val, 0);

    return { vidhans, schemes, data: vidhanSchemeData, totals, grandTotal, quantities, grandQuantity };
  }, [filteredData]);

    // Center (Kendra) table data (Center - Scheme breakdown)
    const centerCombinedTableData = useMemo(() => {
      const centerSchemeData = {};
      const centerQuantities = {};
      filteredData.forEach(item => {
        const center = item.center_name || 'अन्य';
        const scheme = item.scheme_name || 'अन्य';
        const subsidy = parseFloat(item.amount_of_subsidy) || 0;
        const farmerShare = parseFloat(item.amount_of_farmer_share) || 0;
        const total = parseFloat(item.total_amount) || 0;
        const qty = parseFloat(item.allocated_quantity) || 0;
        if (!centerSchemeData[center]) centerSchemeData[center] = {};
        if (!centerSchemeData[center][scheme]) centerSchemeData[center][scheme] = { subsidy: 0, farmerShare: 0, total: 0, quantity: 0 };
        centerSchemeData[center][scheme].subsidy += subsidy;
        centerSchemeData[center][scheme].farmerShare += farmerShare;
        centerSchemeData[center][scheme].total += total;
        centerSchemeData[center][scheme].quantity += qty;
        if (!centerQuantities[center]) centerQuantities[center] = 0;
        centerQuantities[center] += qty;
      });

      const centers = Object.keys(centerSchemeData).sort();
      const allSchemes = new Set();
      centers.forEach(c => Object.keys(centerSchemeData[c]).forEach(s => allSchemes.add(s)));
      const schemes = Array.from(allSchemes).sort();

      const totals = {};
      const quantities = {};
      centers.forEach(c => {
        totals[c] = schemes.reduce((sum, sch) => sum + ((centerSchemeData[c][sch] && centerSchemeData[c][sch].subsidy) || 0), 0);
        quantities[c] = centerQuantities[c] || 0;
      });
      const grandTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);
      const grandQuantity = Object.values(quantities).reduce((sum, val) => sum + val, 0);

      return { centers, schemes, data: centerSchemeData, totals, grandTotal, quantities, grandQuantity };
    }, [filteredData]);

  // Combined chart data for pie chart (subsidy per investment)
  const combinedChartData = useMemo(() => {
    const colors = [
      'rgba(102, 16, 242, 0.8)', 'rgba(25, 78, 139, 0.8)', 'rgba(40, 167, 69, 0.8)',
      'rgba(253, 126, 20, 0.8)', 'rgba(220, 53, 69, 0.8)', 'rgba(23, 162, 184, 0.8)',
      'rgba(255, 193, 7, 0.8)', 'rgba(32, 201, 151, 0.8)', 'rgba(111, 66, 193, 0.8)',
      'rgba(253, 51, 114, 0.8)'
    ];

    return {
      labels: combinedTableData.investments.slice(0, 10), // Top 10 investments
      datasets: [{
        data: combinedTableData.investments.slice(0, 10).map(inv => combinedTableData.totals[inv]),
        backgroundColor: colors.slice(0, combinedTableData.investments.length),
        borderColor: colors.slice(0, combinedTableData.investments.length).map(c => c.replace('0.8', '1')),
        borderWidth: 2
      }]
    };
  }, [combinedTableData]);

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 11 },
          padding: 10
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 10 },
          callback: (value) => {
            if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
            if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
            return `₹${value}`;
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 9 },
          padding: 4,
          boxWidth: 10,
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 1,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            // Show full label in tooltip
            const chart = context[0].chart;
            const fullLabels = chart.data.fullLabels || chart.data.labels;
            return fullLabels[context[0].dataIndex];
          },
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `राशि: ${formatCurrency(context.raw)} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Special options for doughnut with many items - show top 15 only
  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%',
    plugins: {
      legend: {
        display: false // Hide legend, we'll show a custom table below
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const chart = context[0].chart;
            const fullLabels = chart.data.fullLabels || chart.data.labels;
            return fullLabels[context[0].dataIndex];
          },
          label: (context) => {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `कुल राशि: ${formatCurrency(context.raw)} (${percentage}%)`;
          }
        }
      }
    }
  };

  const horizontalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 11 },
          padding: 10
        }
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const chart = context[0].chart;
            const fullLabels = chart.data.fullLabels || chart.data.labels;
            return fullLabels[context[0].dataIndex];
          },
          label: (context) => {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          font: { size: 10 },
          callback: (value) => {
            if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
            if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
            return `₹${value}`;
          }
        }
      },
      y: {
        ticks: {
          font: { size: 8 }
        }
      }
    }
  };

  // Bar chart options specifically for उपनिवेश (handles many items)
  const investmentBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // Horizontal bars for better readability with many items
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 11, weight: 'bold' },
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            const chart = context[0].chart;
            const fullLabels = chart.data.fullLabels || chart.data.labels;
            return fullLabels[context[0].dataIndex];
          },
          label: (context) => {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.05)'
        },
        ticks: {
          font: { size: 10 },
          callback: (value) => {
            if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
            if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
            return `₹${value}`;
          }
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: { size: 10 },
          autoSkip: false,
          padding: 5
        }
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 20
      }
    }
  };

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
          setError(translations.networkError);
        } else if (err.message.includes('HTTP error')) {
          setError(translations.serverError);
        } else {
          setError(translations.dataError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  // Handle apply date filter
  const handleApplyDateFilter = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setIsDateFilterApplied(true);
    // Reset scheme and investment selections when date filter changes
    setSelectedSchemes([]);
    setSelectedInvestments([]);
  };

  // Handle clear date filter
  const handleClearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    setIsDateFilterApplied(false);
    setSelectedSchemes([]);
    setSelectedInvestments([]);
  };

  // Handle scheme filter change
  const handleSchemeChange = (selected) => {
    setSelectedSchemes(selected || []);
  };

  // Handle investment filter change
  const handleInvestmentChange = (selected) => {
    setSelectedInvestments(selected || []);
  };

  // Function to retry fetching data
  const retryFetch = () => {
    window.location.reload();
  };

  // State for PDF preview modal
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');

  // Get filter status text for report
  const getFilterStatusText = () => {
    const filters = [];
    if (isDateFilterApplied && (appliedStartDate || appliedEndDate)) {
      filters.push(`तिथि: ${formatDate(appliedStartDate) || 'N/A'} से ${formatDate(appliedEndDate) || 'N/A'}`);
    }
    if (selectedSchemes.length > 0) {
      filters.push(`योजना: ${selectedSchemes.map(s => s.label).join(', ')}`);
    }
    if (selectedInvestments.length > 0) {
      filters.push(`उपनिवेश: ${selectedInvestments.map(i => i.label).join(', ')}`);
    }
    return filters.length > 0 ? filters.join(' | ') : 'सभी डेटा (कोई फ़िल्टर नहीं)';
  };

  // Prepare report data based on filtered data
  const getReportData = () => {
    // Group by scheme and investment
    const schemeWise = {};
    const investmentWise = {};
    
    filteredData.forEach(item => {
      // Scheme-wise aggregation
      const scheme = item.scheme_name || 'अन्य';
      if (!schemeWise[scheme]) {
        schemeWise[scheme] = { quantity: 0, farmerShare: 0, subsidy: 0, total: 0, count: 0 };
      }
      schemeWise[scheme].quantity += parseFloat(item.allocated_quantity) || 0;
      schemeWise[scheme].farmerShare += parseFloat(item.amount_of_farmer_share) || 0;
      schemeWise[scheme].subsidy += parseFloat(item.amount_of_subsidy) || 0;
      schemeWise[scheme].total += parseFloat(item.total_amount) || 0;
      schemeWise[scheme].count += 1;

      // Investment-wise aggregation
      const investment = item.sub_investment_name || 'अन्य';
      if (!investmentWise[investment]) {
        investmentWise[investment] = { quantity: 0, farmerShare: 0, subsidy: 0, total: 0, count: 0 };
      }
      investmentWise[investment].quantity += parseFloat(item.allocated_quantity) || 0;
      investmentWise[investment].farmerShare += parseFloat(item.amount_of_farmer_share) || 0;
      investmentWise[investment].subsidy += parseFloat(item.amount_of_subsidy) || 0;
      investmentWise[investment].total += parseFloat(item.total_amount) || 0;
      investmentWise[investment].count += 1;
    });

    return { schemeWise, investmentWise };
  };

  // Prepare main investment subsidy data
  const getMainInvestmentSubsidyData = () => {
    const mainInvestmentSubsidy = {};
    filteredData.forEach(item => {
      const investment = item.investment_name || 'अन्य';
      if (!mainInvestmentSubsidy[investment]) {
        mainInvestmentSubsidy[investment] = { subsidy: 0, count: 0 };
      }
      mainInvestmentSubsidy[investment].subsidy += parseFloat(item.amount_of_subsidy) || 0;
      mainInvestmentSubsidy[investment].count += 1;
    });
    return mainInvestmentSubsidy;
  };

  // Prepare combined data (Investment-wise Scheme breakdown)
  const getCombinedData = () => {
    const investmentSchemeData = {};
    filteredData.forEach(item => {
      const investment = item.investment_name || 'अन्य';
      const scheme = item.scheme_name || 'अन्य';
      const subsidy = parseFloat(item.amount_of_subsidy) || 0;
      if (!investmentSchemeData[investment]) investmentSchemeData[investment] = {};
      if (!investmentSchemeData[investment][scheme]) investmentSchemeData[investment][scheme] = 0;
      investmentSchemeData[investment][scheme] += subsidy;
    });

    const investments = Object.keys(investmentSchemeData).sort();
    const allSchemes = new Set();
    investments.forEach(inv => {
      Object.keys(investmentSchemeData[inv]).forEach(sch => allSchemes.add(sch));
    });
    const schemes = Array.from(allSchemes).sort();

    const data = investmentSchemeData;
    const totals = {};
    investments.forEach(inv => {
      totals[inv] = schemes.reduce((sum, sch) => sum + (data[inv][sch] || 0), 0);
    });
    const grandTotal = investments.reduce((sum, inv) => sum + totals[inv], 0);

    return { investments, schemes, data, totals, grandTotal };
  };

  // Prepare sub-combined data (Sub-investment-wise Scheme breakdown)
  const getSubCombinedData = () => {
    const subInvestmentSchemeData = {};
    filteredData.forEach(item => {
      const subInvestment = item.sub_investment_name || 'अन्य';
      const scheme = item.scheme_name || 'अन्य';
      const subsidy = parseFloat(item.amount_of_subsidy) || 0;
      if (!subInvestmentSchemeData[subInvestment]) subInvestmentSchemeData[subInvestment] = {};
      if (!subInvestmentSchemeData[subInvestment][scheme]) subInvestmentSchemeData[subInvestment][scheme] = 0;
      subInvestmentSchemeData[subInvestment][scheme] += subsidy;
    });

    const subInvestments = Object.keys(subInvestmentSchemeData).sort();
    const allSchemes = new Set();
    subInvestments.forEach(subInv => {
      Object.keys(subInvestmentSchemeData[subInv]).forEach(sch => allSchemes.add(sch));
    });
    const schemes = Array.from(allSchemes).sort();

    const data = subInvestmentSchemeData;
    const totals = {};
    subInvestments.forEach(subInv => {
      totals[subInv] = schemes.reduce((sum, sch) => sum + (data[subInv][sch] || 0), 0);
    });
    const grandTotal = subInvestments.reduce((sum, subInv) => sum + totals[subInv], 0);

    return { subInvestments, schemes, data, totals, grandTotal };
  };

  // Generate PDF Report using html2pdf for proper Hindi support
  const generatePDF = (action = 'download') => {
    // Use UI aggregations so PDF mirrors the collapsible tables
    const schemeData = schemeChartData && schemeChartData.rawData ? schemeChartData.rawData : {};
    const investmentData = investmentChartData && investmentChartData.rawData ? investmentChartData.rawData : {};
    const combined = combinedTableData || { investments: [], schemes: [], data: {}, totals: {}, quantities: {}, grandTotal: 0, grandQuantity: 0 };
    const subCombined = subCombinedTableData || { subInvestments: [], schemes: [], data: {}, totals: {}, quantities: {}, grandTotal: 0, grandQuantity: 0 };
    const centerCombined = centerCombinedTableData || { centers: [], schemes: [], data: {}, totals: {}, quantities: {}, grandTotal: 0, grandQuantity: 0 };
    const vidhanCombined = vidhanCombinedTableData || { vidhans: [], schemes: [], data: {}, totals: {}, quantities: {}, grandTotal: 0, grandQuantity: 0 };
    const mainInvestmentSubsidy = getMainInvestmentSubsidyData();
    const currentDate = new Date().toLocaleDateString('hi-IN');

    // Create HTML content for PDF (only include open collapsible tables)
    const pdfContent = `
      <style>
        @page {
          margin: 15mm 10mm 15mm 10mm;
          size: A4;
        }
        
        /* Prevent headings from breaking across pages */
        h1, h2 {
          page-break-after: avoid;
          page-break-inside: avoid;
          margin-top: 20px !important;
          margin-bottom: 10px !important;
        }
        
        /* Prevent table headers from breaking */
        thead {
          page-break-inside: avoid;
        }
        
        /* Allow table rows to break but prefer not to */
        tbody tr {
          page-break-inside: avoid;
        }
        
        /* Ensure sections don't break awkwardly */
        div[style*="margin-bottom"] {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        
        /* Force page breaks before major sections if needed */
        div[style*="margin-bottom"]:nth-child(n+3) {
          page-break-before: auto;
        }
        
        /* Keep table headers with their tables */
        table {
          page-break-inside: auto;
        }
        
        /* Prevent table headers from being orphaned */
        thead {
          page-break-after: avoid;
        }
        
        /* Allow table body to break but keep rows together when possible */
        tbody {
          page-break-inside: auto;
        }
        
        /* Prevent single rows at bottom of page */
        tbody tr:last-child {
          page-break-inside: avoid;
        }
        
        /* Ensure table captions/headings stay with their tables */
        h2 + table {
          page-break-before: avoid;
        }
      </style>
      <div style="font-family: 'Noto Sans Devanagari', 'Mangal', Arial, sans-serif; padding: 20px; color: #333;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 3px solid #194e8b; padding-bottom: 15px; margin-bottom: 20px; page-break-inside: avoid;">
          <h1 style="color: #194e8b; font-size: 24px; margin: 0;">DHO कोटद्वार बिलिंग रिपोर्ट</h1>
          <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">रिपोर्ट तिथि: ${currentDate}</p>
          <p style="color: #888; font-size: 11px; margin: 3px 0 0 0;">फ़िल्टर: ${getFilterStatusText()}</p>
        </div>

        <!-- Summary Section -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h2 style="color: #194e8b; font-size: 16px; border-bottom: 2px solid #28a745; padding-bottom: 5px; margin-bottom: 10px;">सारांश</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #194e8b, #2d6cb5);">
                <th style="border: 1px solid #ddd; padding: 10px; color: white; text-align: center;">कुल रिकॉर्ड</th>
                <th style="border: 1px solid #ddd; padding: 10px; color: white; text-align: center;">आवंटित मात्रा</th>
                <th style="border: 1px solid #ddd; padding: 10px; color: white; text-align: center;">किसान हिस्सेदारी</th>
                <th style="border: 1px solid #ddd; padding: 10px; color: white; text-align: center;">सब्सिडी</th>
                <th style="border: 1px solid #ddd; padding: 10px; color: white; text-align: center;">कुल राशि</th>
              </tr>
            </thead>
            <tbody>
              <tr style="background: #f8f9fa;">
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold;">${aggregatedStats.totalRecords}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${aggregatedStats.allocatedQuantity.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center; color: #28a745;">₹${aggregatedStats.farmerShareAmount.toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center; color: #6610f2;">₹${aggregatedStats.subsidyAmount.toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: center; font-weight: bold; color: #194e8b;">₹${aggregatedStats.totalAmount.toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>

         <!-- Scheme-wise Section (from UI aggregations) -->
         ${openCollapses.includes('scheme') ? `
         <div style="margin-bottom: 20px; page-break-inside: avoid;">
           <h2 style="color: #194e8b; font-size: 15px; border-bottom: 2px solid #194e8b; padding-bottom: 5px; margin-bottom: 8px;">योजना-वार कुल सब्सिडी तुलना</h2>
           <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
             <thead>
               <tr style="background: linear-gradient(135deg, #194e8b, #2d6cb5); color: white;">
                 <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">#</th>
                 <th style="border: 1px solid #ddd; padding: 6px; text-align: left;">योजना</th>
                 <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">आवंटित मात्रा</th>
                 <th style="border: 1px solid #ddd; padding: 6px; text-align: center;">${rashiOptions.find(opt => opt.value === selectedRashi)?.label || 'कुल राशि'}</th>
               </tr>
             </thead>
             <tbody>
               ${Object.entries(schemeData)
                 .filter(([label]) => selectedTableSchemes.length === 0 || selectedTableSchemes.some(s => s.value === label))
                 .sort((a,b)=> ((b[1][selectedRashi]||0)-(a[1][selectedRashi]||0)))
                 .map(([name, val], idx) => `
                 <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                   <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${idx+1}</td>
                   <td style="border: 1px solid #ddd; padding: 6px;">${name}</td>
                   <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${((val && val.quantity) || 0).toFixed(2)}</td>
                   <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">₹${((val && val[selectedRashi]) || 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                 </tr>
               `).join('')}
             </tbody>
             <tfoot>
               <tr style="font-weight:700; background:#f1f5f9;">
                 <td colSpan="2" style="border:1px solid #ddd; padding:6px;">कुल</td>
                 <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(Object.entries(schemeData || {})
                   .filter(([label]) => selectedTableSchemes.length === 0 || selectedTableSchemes.some(s => s.value === label))
                   .reduce((s,[_, v])=> s + ((v && v.quantity) || 0),0)).toFixed(2)}</td>
                 <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(Object.entries(schemeData || {})
                   .filter(([label]) => selectedTableSchemes.length === 0 || selectedTableSchemes.some(s => s.value === label))
                   .reduce((s,[_, v])=> s + ((v && v[selectedRashi]) || 0),0)).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
               </tr>
             </tfoot>
           </table>
         </div>
         ` : ''}

        <!-- Investment-wise Section (from UI aggregations) -->
        ${openCollapses.includes('investment') ? `
        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <h2 style="color: #194e8b; font-size: 15px; border-bottom: 2px solid #194e8b; padding-bottom: 5px; margin-bottom: 8px;">उपनिवेश के अनुसार - कुल सब्सिडी तुलना</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #194e8b, #2d6cb5); color: white;">
                <th style="border:1px solid #ddd; padding:6px;">#</th>
                <th style="border:1px solid #ddd; padding:6px; text-align:left;">उपनिवेश</th>
                <th style="border:1px solid #ddd; padding:6px; text-align:right;">आवंटित मात्रा</th>
                <th style="border:1px solid #ddd; padding:6px; text-align:right;">${rashiOptions.find(opt => opt.value === selectedRashi)?.label || 'कुल राशि'}</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(investmentData).sort((a,b)=> ((b[1][selectedRashi]||0)-(a[1][selectedRashi]||0))).map(([name,val], idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                  <td style="border:1px solid #ddd; padding:6px; text-align:center;">${idx+1}</td>
                  <td style="border:1px solid #ddd; padding:6px;">${name}</td>
                  <td style="border:1px solid #ddd; padding:6px; text-align:right;">${((val && val.quantity) || 0).toFixed(2)}</td>
                  <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${((val && val[selectedRashi]) || 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight:700; background:#f1f5f9;">
                <td colSpan="2" style="border:1px solid #ddd; padding:6px;">कुल</td>
                <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(Object.values(investmentData||{}).reduce((s,v)=> s + ((v && v.quantity) || 0),0)).toFixed(2)}</td>
                <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(Object.values(investmentData||{}).reduce((s,v)=> s + ((v && v[selectedRashi]) || 0),0)).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ` : ''}

         <!-- Sub-investment Scheme Section (matrix with मात्रा + selectedRashi) -->
         ${openCollapses.includes('subInvestment') ? `
         <div style="margin-bottom: 20px; page-break-inside: avoid;">
           <h2 style="color: #194e8b; font-size: 15px; border-bottom: 2px solid #194e8b; padding-bottom: 5px; margin-bottom: 8px;">उपनिवेश - योजना तुलना</h2>
           <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
             <thead>
               <tr style="background: linear-gradient(135deg, #194e8b, #2d6cb5); color: white;">
                 <th style="border:1px solid #ddd; padding:6px;">#</th>
                 <th style="border:1px solid #ddd; padding:6px; text-align:left;">उपनिवेश</th>
                 ${subCombined.schemes.filter(s => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(selected => selected.value === s)).map(s => `<th style="border:1px solid #ddd; padding:6px; text-align:center;" colspan="2">${s}</th>`).join('')}
                 <th style="border:1px solid #ddd; padding:6px; text-align:center;" colspan="2">कुल</th>
               </tr>
               <tr style="background:#e9eef8;">
                 <th></th>
                 <th></th>
                 ${subCombined.schemes.filter(s => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(selected => selected.value === s)).map(() => `<th style="border:1px solid #ddd; padding:6px; text-align:right;">मात्रा</th><th style="border:1px solid #ddd; padding:6px; text-align:right;">${rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>`).join('')}
                 <th style="border:1px solid #ddd; padding:6px; text-align:right;">मात्रा</th><th style="border:1px solid #ddd; padding:6px; text-align:right;">कुल ${rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>
               </tr>
             </thead>
             <tbody>
               ${subCombined.subInvestments.filter(subInv => selectedSubInvestments.length === 0 || selectedSubInvestments.some(selected => selected.value === subInv)).map((subInv, idx) => `
                 <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                   <td style="border:1px solid #ddd; padding:6px; text-align:center;">${idx+1}</td>
                   <td style="border:1px solid #ddd; padding:6px;">${subInv}</td>
                   ${subCombined.schemes.filter(s => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(selected => selected.value === s)).map(s => `
                     <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(((subCombined.data[subInv] && subCombined.data[subInv][s]) && subCombined.data[subInv][s].quantity) || 0).toFixed(2)}</td>
                     <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(((subCombined.data[subInv] && subCombined.data[subInv][s]) && subCombined.data[subInv][s][selectedRashi]) || 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                   `).join('')}
                   <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(subCombined.schemes.filter(s => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(selected => selected.value === s)).reduce((sum, s) => sum + (((subCombined.data[subInv] && subCombined.data[subInv][s]) && subCombined.data[subInv][s].quantity) || 0), 0)).toFixed(2)}</td>
                   <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(subCombined.schemes.filter(s => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(selected => selected.value === s)).reduce((sum, s) => sum + (((subCombined.data[subInv] && subCombined.data[subInv][s]) && subCombined.data[subInv][s][selectedRashi]) || 0), 0)).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                 </tr>
               `).join('')}
             </tbody>
             <tfoot>
               <tr style="font-weight:700; background:#f1f5f9;">
                 <td colSpan="2" style="border:1px solid #ddd; padding:6px;">कुल</td>
                 ${subCombined.schemes.filter(s => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(selected => selected.value === s)).map(s => `
                   <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(subCombined.subInvestments.filter(subInv => selectedSubInvestments.length === 0 || selectedSubInvestments.some(selected => selected.value === subInv)).reduce((sum, si) => sum + (((subCombined.data[si] && subCombined.data[si][s]) && subCombined.data[si][s].quantity) || 0),0)).toFixed(2)}</td>
                   <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(subCombined.subInvestments.filter(subInv => selectedSubInvestments.length === 0 || selectedSubInvestments.some(selected => selected.value === subInv)).reduce((sum, si) => sum + (((subCombined.data[si] && subCombined.data[si][s]) && subCombined.data[si][s][selectedRashi]) || 0),0)).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                 `).join('')}
                 <td style="border:1px solid #ddd; padding:6px; text-align:right;">${subCombined.subInvestments.filter(subInv => selectedSubInvestments.length === 0 || selectedSubInvestments.some(selected => selected.value === subInv)).reduce((sum, subInv) => sum + subCombined.schemes.filter(s => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(selected => selected.value === s)).reduce((schemeSum, s) => schemeSum + (((subCombined.data[subInv] && subCombined.data[subInv][s]) && subCombined.data[subInv][s].quantity) || 0), 0), 0).toFixed(2)}</td>
                 <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${subCombined.subInvestments.filter(subInv => selectedSubInvestments.length === 0 || selectedSubInvestments.some(selected => selected.value === subInv)).reduce((sum, subInv) => sum + subCombined.schemes.filter(s => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(selected => selected.value === s)).reduce((schemeSum, s) => schemeSum + (((subCombined.data[subInv] && subCombined.data[subInv][s]) && subCombined.data[subInv][s][selectedRashi]) || 0), 0), 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
               </tr>
             </tfoot>
           </table>
         </div>
         ` : ''}

        <!-- Center-wise Subsidy Comparison Table -->
        ${openCollapses.includes('center') ? `
        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <h2 style="color: #194e8b; font-size: 15px; border-bottom: 2px solid #194e8b; padding-bottom: 5px; margin-bottom: 8px;">केंद्र के अनुसार राशि तुलना</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #194e8b, #2d6cb5); color: white;">
                <th style="border:1px solid #ddd; padding:6px;">#</th>
                <th style="border:1px solid #ddd; padding:6px; text-align:left;">केंद्र</th>
                <th style="border:1px solid #ddd; padding:6px; text-align:right;">आवंटित मात्रा</th>
                <th style="border:1px solid #ddd; padding:6px; text-align:right;">${rashiOptions.find(opt => opt.value === selectedRashi)?.label || 'कुल राशि'}</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(centerChartData.rawData).sort((a,b)=> ((b[1][selectedRashi]||0)-(a[1][selectedRashi]||0))).map(([name, val], idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                  <td style="border:1px solid #ddd; padding:6px; text-align:center;">${idx+1}</td>
                  <td style="border:1px solid #ddd; padding:6px;">${name}</td>
                  <td style="border:1px solid #ddd; padding:6px; text-align:right;">${((val && val.quantity) || 0).toFixed(2)}</td>
                  <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${((val && val[selectedRashi]) || 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight:700; background:#f1f5f9;">
                <td colSpan="2" style="border:1px solid #ddd; padding:6px;">कुल</td>
                <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(Object.values(centerChartData.rawData || {}).reduce((s,v)=> s + ((v && v.quantity) || 0),0)).toFixed(2)}</td>
                <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(Object.values(centerChartData.rawData || {}).reduce((s,v)=> s + ((v && v[selectedRashi]) || 0),0)).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ` : ''}

         <!-- Center-Scheme Combined Section (matrix with मात्रा + selectedRashi) -->
         ${openCollapses.includes('centerCombined') ? `
         <div style="margin-bottom: 20px; page-break-inside: avoid;">
           <h2 style="color: #194e8b; font-size: 15px; border-bottom: 2px solid #194e8b; padding-bottom: 5px; margin-bottom: 8px;">केंद्र के अनुसार योजना-वार तुलना</h2>
           <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
             <thead>
               <tr style="background: linear-gradient(135deg, #194e8b, #2d6cb5); color: white;">
                 <th style="border:1px solid #ddd; padding:6px;">#</th>
                 <th style="border:1px solid #ddd; padding:6px; text-align:left;">केंद्र</th>
                 ${centerCombined.schemes.filter(s => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(selected => selected.value === s)).map(s => `<th style="border:1px solid #ddd; padding:6px; text-align:center;" colspan="2">${s}</th>`).join('')}
                 <th style="border:1px solid #ddd; padding:6px; text-align:center;" colspan="2">कुल</th>
               </tr>
               <tr style="background:#e9eef8;">
                 <th></th>
                 <th></th>
                 ${centerCombined.schemes.filter(s => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(selected => selected.value === s)).map(() => `<th style="border:1px solid #ddd; padding:6px; text-align:right;">मात्रा</th><th style="border:1px solid #ddd; padding:6px; text-align:right;">${rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>`).join('')}
                 <th style="border:1px solid #ddd; padding:6px; text-align:right;">मात्रा</th><th style="border:1px solid #ddd; padding:6px; text-align:right;">कुल ${rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>
               </tr>
             </thead>
             <tbody>
               ${centerCombined.centers.filter(c => selectedCenters.length === 0 || selectedCenters.some(selected => selected.value === c)).map((c, idx) => `
                 <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                   <td style="border:1px solid #ddd; padding:6px; text-align:center;">${idx+1}</td>
                   <td style="border:1px solid #ddd; padding:6px;">${c}</td>
                   ${centerCombined.schemes.filter(s => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(selected => selected.value === s)).map(s => `
                     <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(((centerCombined.data[c] && centerCombined.data[c][s]) && centerCombined.data[c][s].quantity) || 0).toFixed(2)}</td>
                     <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(((centerCombined.data[c] && centerCombined.data[c][s]) && centerCombined.data[c][s][selectedRashi]) || 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                   `).join('')}
                   <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(centerCombined.schemes.filter(s => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(selected => selected.value === s)).reduce((sum, s) => sum + (((centerCombined.data[c] && centerCombined.data[c][s]) && centerCombined.data[c][s].quantity) || 0), 0)).toFixed(2)}</td>
                   <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(centerCombined.schemes.filter(s => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(selected => selected.value === s)).reduce((sum, s) => sum + (((centerCombined.data[c] && centerCombined.data[c][s]) && centerCombined.data[c][s][selectedRashi]) || 0), 0)).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                 </tr>
               `).join('')}
             </tbody>
             <tfoot>
               <tr style="font-weight:700; background:#f1f5f9;">
                 <td colSpan="2" style="border:1px solid #ddd; padding:6px;">कुल</td>
                 ${centerCombined.schemes.filter(s => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(selected => selected.value === s)).map(s => `
                   <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(centerCombined.centers.filter(c => selectedCenters.length === 0 || selectedCenters.some(selected => selected.value === c)).reduce((sum, c) => sum + (((centerCombined.data[c] && centerCombined.data[c][s]) && centerCombined.data[c][s].quantity) || 0),0)).toFixed(2)}</td>
                   <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(centerCombined.centers.filter(c => selectedCenters.length === 0 || selectedCenters.some(selected => selected.value === c)).reduce((sum, c) => sum + (((centerCombined.data[c] && centerCombined.data[c][s]) && centerCombined.data[c][s][selectedRashi]) || 0),0)).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                 `).join('')}
                 <td style="border:1px solid #ddd; padding:6px; text-align:right;">${centerCombined.centers.filter(c => selectedCenters.length === 0 || selectedCenters.some(selected => selected.value === c)).reduce((sum, c) => sum + centerCombined.schemes.filter(s => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(selected => selected.value === s)).reduce((schemeSum, s) => schemeSum + (((centerCombined.data[c] && centerCombined.data[c][s]) && centerCombined.data[c][s].quantity) || 0), 0), 0).toFixed(2)}</td>
                 <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${centerCombined.centers.filter(c => selectedCenters.length === 0 || selectedCenters.some(selected => selected.value === c)).reduce((sum, c) => sum + centerCombined.schemes.filter(s => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(selected => selected.value === s)).reduce((schemeSum, s) => schemeSum + (((centerCombined.data[c] && centerCombined.data[c][s]) && centerCombined.data[c][s][selectedRashi]) || 0), 0), 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
               </tr>
             </tfoot>
           </table>
         </div>
         ` : ''}

        <!-- Vidhan Sabha-wise Subsidy Comparison Table -->
        ${openCollapses.includes('vidhan') ? `
        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <h2 style="color: #194e8b; font-size: 15px; border-bottom: 2px solid #194e8b; padding-bottom: 5px; margin-bottom: 8px;">विधानसभा के अनुसार राशि तुलना</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #194e8b, #2d6cb5); color: white;">
                <th style="border:1px solid #ddd; padding:6px;">#</th>
                <th style="border:1px solid #ddd; padding:6px; text-align:left;">विधानसभा</th>
                <th style="border:1px solid #ddd; padding:6px; text-align:right;">आवंटित मात्रा</th>
                <th style="border:1px solid #ddd; padding:6px; text-align:right;">${rashiOptions.find(opt => opt.value === selectedRashi)?.label || 'कुल राशि'}</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(vidhanChartData.rawData).sort((a,b)=> ((b[1][selectedRashi]||0)-(a[1][selectedRashi]||0))).map(([name, val], idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                  <td style="border:1px solid #ddd; padding:6px; text-align:center;">${idx+1}</td>
                  <td style="border:1px solid #ddd; padding:6px;">${name}</td>
                  <td style="border:1px solid #ddd; padding:6px; text-align:right;">${((val && val.quantity) || 0).toFixed(2)}</td>
                  <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${((val && val[selectedRashi]) || 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight:700; background:#f1f5f9;">
                <td colSpan="2" style="border:1px solid #ddd; padding:6px;">कुल</td>
                <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(Object.values(vidhanChartData.rawData || {}).reduce((s,v)=> s + ((v && v.quantity) || 0),0)).toFixed(2)}</td>
                <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(Object.values(vidhanChartData.rawData || {}).reduce((s,v)=> s + ((v && v[selectedRashi]) || 0),0)).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        ` : ''}

         <!-- Vidhan Sabha Section (from UI aggregations) -->
         ${openCollapses.includes('vidhanCombined') ? `
         <div style="margin-bottom: 20px; page-break-inside: avoid;">
           <h2 style="color: #194e8b; font-size: 15px; border-bottom: 2px solid #194e8b; padding-bottom: 5px; margin-bottom: 8px;">विधानसभा के अनुसार - योजना-वार तुलना</h2>
           <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
             <thead>
               <tr style="background: linear-gradient(135deg, #194e8b, #2d6cb5); color: white;">
                 <th style="border:1px solid #ddd; padding:6px;">#</th>
                 <th style="border:1px solid #ddd; padding:6px; text-align:left;">विधानसभा</th>
                 ${vidhanCombined.schemes.filter(s => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(selected => selected.value === s)).map(s => `<th style="border:1px solid #ddd; padding:6px; text-align:center;" colspan="2">${s}</th>`).join('')}
                 <th style="border:1px solid #ddd; padding:6px; text-align:center;" colspan="2">कुल</th>
               </tr>
               <tr style="background:#e9eef8;">
                 <th></th>
                 <th></th>
                 ${vidhanCombined.schemes.filter(s => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(selected => selected.value === s)).map(() => `<th style="border:1px solid #ddd; padding:6px; text-align:right;">मात्रा</th><th style="border:1px solid #ddd; padding:6px; text-align:right;">${rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>`).join('')}
                 <th style="border:1px solid #ddd; padding:6px; text-align:right;">मात्रा</th><th style="border:1px solid #ddd; padding:6px; text-align:right;">कुल ${rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>
               </tr>
             </thead>
             <tbody>
               ${vidhanCombined.vidhans.filter(v => selectedVidhanSabhas.length === 0 || selectedVidhanSabhas.some(selected => selected.value === v)).map((v, idx) => `
                 <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                   <td style="border:1px solid #ddd; padding:6px; text-align:center;">${idx+1}</td>
                   <td style="border:1px solid #ddd; padding:6px;">${v}</td>
                   ${vidhanCombined.schemes.filter(s => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(selected => selected.value === s)).map(s => `
                     <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(((vidhanCombined.data[v] && vidhanCombined.data[v][s]) && vidhanCombined.data[v][s].quantity) || 0).toFixed(2)}</td>
                     <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(((vidhanCombined.data[v] && vidhanCombined.data[v][s]) && vidhanCombined.data[v][s][selectedRashi]) || 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                   `).join('')}
                   <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(vidhanCombined.schemes.filter(s => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(selected => selected.value === s)).reduce((sum, s) => sum + (((vidhanCombined.data[v] && vidhanCombined.data[v][s]) && vidhanCombined.data[v][s].quantity) || 0), 0)).toFixed(2)}</td>
                   <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(vidhanCombined.schemes.filter(s => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(selected => selected.value === s)).reduce((sum, s) => sum + (((vidhanCombined.data[v] && vidhanCombined.data[v][s]) && vidhanCombined.data[v][s][selectedRashi]) || 0), 0)).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                 </tr>
               `).join('')}
             </tbody>
             <tfoot>
               <tr style="font-weight:700; background:#f1f5f9;">
                 <td colSpan="2" style="border:1px solid #ddd; padding:6px;">कुल</td>
                 ${vidhanCombined.schemes.filter(s => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(selected => selected.value === s)).map(s => `
                   <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(vidhanCombined.vidhans.filter(v => selectedVidhanSabhas.length === 0 || selectedVidhanSabhas.some(selected => selected.value === v)).reduce((sum, v) => sum + (((vidhanCombined.data[v][s] && vidhanCombined.data[v][s].quantity) || 0)), 0)).toFixed(2)}</td>
                   <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(vidhanCombined.vidhans.filter(v => selectedVidhanSabhas.length === 0 || selectedVidhanSabhas.some(selected => selected.value === v)).reduce((sum, v) => sum + (((vidhanCombined.data[v][s] && vidhanCombined.data[v][s][selectedRashi]) || 0)), 0)).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                 `).join('')}
                 <td style="border:1px solid #ddd; padding:6px; text-align:right;">${vidhanCombined.vidhans.filter(v => selectedVidhanSabhas.length === 0 || selectedVidhanSabhas.some(selected => selected.value === v)).reduce((sum, v) => sum + vidhanCombined.schemes.filter(s => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(selected => selected.value === s)).reduce((schemeSum, s) => schemeSum + (((vidhanCombined.data[v] && vidhanCombined.data[v][s]) && vidhanCombined.data[v][s].quantity) || 0), 0), 0).toFixed(2)}</td>
                 <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${vidhanCombined.vidhans.filter(v => selectedVidhanSabhas.length === 0 || selectedVidhanSabhas.some(selected => selected.value === v)).reduce((sum, v) => sum + vidhanCombined.schemes.filter(s => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(selected => selected.value === s)).reduce((schemeSum, s) => schemeSum + (((vidhanCombined.data[v] && vidhanCombined.data[v][s]) && vidhanCombined.data[v][s][selectedRashi]) || 0), 0), 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
               </tr>
             </tfoot>
           </table>
         </div>
         ` : ''}

         <!-- Main Investment Subsidy Section (match UI: name, quantity, subsidy) -->
         ${openCollapses.includes('mainInvestment') ? `
         <div style="margin-bottom: 25px; page-break-inside: avoid;">
           <h2 style="color: #17a2b8; font-size: 16px; border-bottom: 2px solid #17a2b8; padding-bottom: 5px; margin-bottom: 10px;">निवेश के अनुसार ग्राफ़ - ${rashiColumnLabelExcel[selectedRashi]}</h2>
           <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
             <thead>
               <tr style="background: linear-gradient(135deg, #17a2b8, #20c997);">
                 <th style="border: 1px solid #ddd; padding: 6px; color: white; text-align: left;">#</th>
                 <th style="border: 1px solid #ddd; padding: 6px; color: white; text-align: left;">निवेश नाम</th>
                 <th style="border: 1px solid #ddd; padding: 6px; color: white; text-align: right;">आवंटित मात्रा</th>
                 <th style="border: 1px solid #ddd; padding: 6px; color: white; text-align: right;">${rashiColumnLabelExcel[selectedRashi]}</th>
               </tr>
             </thead>
             <tbody>
               ${Object.entries(investmentChartData.rawData)
                 .filter(([name]) => selectedInvestments.length === 0 || selectedInvestments.some(selected => selected.value === name))
                 .sort((a,b)=> ((b[1][selectedRashi]||0)-(a[1][selectedRashi]||0))).map(([name, val], idx) => `
                 <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                   <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${idx + 1}</td>
                   <td style="border: 1px solid #ddd; padding: 6px; font-size: 8px;">${name}</td>
                   <td style="border: 1px solid #ddd; padding: 6px; text-align: right;">${((val && val.quantity) || 0).toFixed(2)}</td>
                   <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-weight: bold;">₹${((val && val[selectedRashi]) || 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                 </tr>
               `).join('')}
             </tbody>
             <tfoot>
               <tr style="font-weight: 700; background-color: #f1f5f9;">
                 <td style="border: 1px solid #ddd; padding: 6px; font-weight: bold;">कुल</td>
                 <td style="border: 1px solid #ddd; padding: 6px;"></td>
                 <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-weight: bold;">${(Object.entries(investmentChartData.rawData || {})
                   .filter(([name]) => selectedInvestments.length === 0 || selectedInvestments.some(selected => selected.value === name))
                   .reduce((s,[_, v])=> s + ((v && v.quantity) || 0),0)).toFixed(2)}</td>
                 <td style="border: 1px solid #ddd; padding: 6px; text-align: right; font-weight: bold;">₹${(Object.entries(investmentChartData.rawData || {})
                   .filter(([name]) => selectedInvestments.length === 0 || selectedInvestments.some(selected => selected.value === name))
                   .reduce((s,[_, v])=> s + ((v && v[selectedRashi]) || 0),0)).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
               </tr>
             </tfoot>
           </table>
         </div>
         ` : ''}

          <!-- Combined Investment-Scheme Section (matrix with मात्रा + सब्सिडी) -->
          ${openCollapses.includes('investmentCombined') ? `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h2 style="color: #194e8b; font-size: 15px; border-bottom: 2px solid #194e8b; padding-bottom: 5px; margin-bottom: 8px;">निवेश - योजना तुलना</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
              <thead>
                <tr style="background: linear-gradient(135deg, #194e8b, #2d6cb5); color: white;">
                  <th style="border:1px solid #ddd; padding:6px;">#</th>
                  <th style="border:1px solid #ddd; padding:6px; text-align:left;">निवेश</th>
                  ${combined.schemes.filter(s => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(selected => selected.value === s)).map(s => `<th style="border:1px solid #ddd; padding:6px; text-align:center;" colspan="2">${s}</th>`).join('')}
                  <th style="border:1px solid #ddd; padding:6px; text-align:center;" colspan="2">कुल</th>
                </tr>
                <tr style="background:#e9eef8;">
                  <th></th>
                  <th></th>
                  ${combined.schemes.filter(s => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(selected => selected.value === s)).map(() => `<th style="border:1px solid #ddd; padding:6px; text-align:right;">मात्रा</th><th style="border:1px solid #ddd; padding:6px; text-align:right;">${rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>`).join('')}
                  <th style="border:1px solid #ddd; padding:6px; text-align:right;">मात्रा</th><th style="border:1px solid #ddd; padding:6px; text-align:right;">कुल ${rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>
                </tr>
              </thead>
              <tbody>
                ${combined.investments.filter(inv => selectedMainInvestments.length === 0 || selectedMainInvestments.some(selected => selected.value === inv)).map((inv, idx) => `
                  <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                    <td style="border:1px solid #ddd; padding:6px; text-align:center;">${idx+1}</td>
                    <td style="border:1px solid #ddd; padding:6px;">${inv}</td>
                    ${combined.schemes.filter(s => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(selected => selected.value === s)).map(s => `
                      <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(((combined.data[inv] && combined.data[inv][s]) && combined.data[inv][s].quantity) || 0).toFixed(2)}</td>
                      <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(((combined.data[inv] && combined.data[inv][s]) && combined.data[inv][s][selectedRashi]) || 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                    `).join('')}
                    <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(combined.schemes.filter(s => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(selected => selected.value === s)).reduce((sum, s) => sum + (((combined.data[inv] && combined.data[inv][s]) && combined.data[inv][s].quantity) || 0), 0)).toFixed(2)}</td>
                    <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(combined.schemes.filter(s => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(selected => selected.value === s)).reduce((sum, s) => sum + (((combined.data[inv] && combined.data[inv][s]) && combined.data[inv][s][selectedRashi]) || 0), 0)).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="font-weight:700; background:#f1f5f9;">
                  <td colSpan="2" style="border:1px solid #ddd; padding:6px;">कुल</td>
                  ${combined.schemes.filter(s => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(selected => selected.value === s)).map(s => `
                    <td style="border:1px solid #ddd; padding:6px; text-align:right;">${(combined.investments.filter(inv => selectedMainInvestments.length === 0 || selectedMainInvestments.some(selected => selected.value === inv)).reduce((sum, inv) => sum + (((combined.data[inv] && combined.data[inv][s]) && combined.data[inv][s].quantity) || 0),0)).toFixed(2)}</td>
                    <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${(combined.investments.filter(inv => selectedMainInvestments.length === 0 || selectedMainInvestments.some(selected => selected.value === inv)).reduce((sum, inv) => sum + (((combined.data[inv] && combined.data[inv][s]) && combined.data[inv][s][selectedRashi]) || 0),0)).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                  `).join('')}
                  <td style="border:1px solid #ddd; padding:6px; text-align:right;">${combined.investments.filter(inv => selectedMainInvestments.length === 0 || selectedMainInvestments.some(selected => selected.value === inv)).reduce((sum, inv) => sum + combined.schemes.filter(s => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(selected => selected.value === s)).reduce((schemeSum, s) => schemeSum + (((combined.data[inv] && combined.data[inv][s]) && combined.data[inv][s].quantity) || 0), 0), 0).toFixed(2)}</td>
                  <td style="border:1px solid #ddd; padding:6px; text-align:right;">₹${combined.investments.filter(inv => selectedMainInvestments.length === 0 || selectedMainInvestments.some(selected => selected.value === inv)).reduce((sum, inv) => sum + combined.schemes.filter(s => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(selected => selected.value === s)).reduce((schemeSum, s) => schemeSum + (((combined.data[inv] && combined.data[inv][s]) && combined.data[inv][s][selectedRashi]) || 0), 0), 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          ` : ''}

        <!-- Footer -->
        <div style="text-align: center; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; color: #888; font-size: 9px;">
          <p>DHO कोटद्वार बिलिंग प्रणाली | रिपोर्ट जनरेट तिथि: ${currentDate}</p>
        </div>
      </div>
    `;

    // Create a temporary element
    const element = document.createElement('div');
    element.innerHTML = pdfContent;
    document.body.appendChild(element);

    const opt = {
      margin: [15, 10, 15, 10],
      filename: `DHO_रिपोर्ट_${currentDate.replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
        precision: 16,
        userUnit: 1.0
      },
      pagebreak: { 
        mode: ['css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: ['h1', 'h2', 'thead', 'tr']
      }
    };

    if (action === 'download') {
      html2pdf().set(opt).from(element).save().then(() => {
        document.body.removeChild(element);
      });
    } else {
      html2pdf().set(opt).from(element).outputPdf('blob').then((pdfBlob) => {
        document.body.removeChild(element);
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfPreviewUrl(pdfUrl);
        setShowPdfPreview(true);
      });
    }
  };

  // Generate Excel Report
  const generateExcel = (action = 'download') => {
    const { schemeWise, investmentWise } = getReportData();
    const { investments, schemes, data, totals, grandTotal } = getCombinedData();
    const { subInvestments, schemes: subSchemes, data: subData, totals: subTotals, grandTotal: subGrandTotal } = getSubCombinedData();
    const mainInvestmentSubsidy = getMainInvestmentSubsidyData();
    const currentDate = new Date().toLocaleDateString('hi-IN');
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Summary Sheet
    const summaryData = [
      ['DHO कोटद्वार बिलिंग रिपोर्ट'],
      [`रिपोर्ट तिथि: ${currentDate}`],
      [`फ़िल्टर: ${getFilterStatusText()}`],
      [],
      ['सारांश'],
      ['कुल रिकॉर्ड', 'आवंटित मात्रा', 'किसान हिस्सेदारी', 'सब्सिडी', 'कुल राशि'],
      [
        aggregatedStats.totalRecords,
        aggregatedStats.allocatedQuantity.toFixed(2),
        aggregatedStats.farmerShareAmount.toFixed(2),
        aggregatedStats.subsidyAmount.toFixed(2),
        aggregatedStats.totalAmount.toFixed(2)
      ]
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'सारांश');

    // Top-level: label map for all views
    const rashiColumnLabelExcel = {
      farmerShare: 'किसान की हिस्सेदारी',
      subsidy: 'सब्सिडी राशि',
      total: 'कुल राशि'
    };
    // Scheme-wise Sheet (use UI aggregation order)
    if (openCollapses.includes('scheme')) {
    const schemeData = schemeChartData && schemeChartData.rawData ? schemeChartData.rawData : {};
    const schemeHeaders = ['#', 'योजना', 'आवंटित मात्रा', rashiColumnLabelExcel[selectedRashi]];
    const schemeRows = Object.entries(schemeData)
      .filter(([label]) => selectedTableSchemes.length === 0 || selectedTableSchemes.some(s => s.value === label))
      .sort((a,b)=> ((b[1][selectedRashi]||0)-(a[1][selectedRashi]||0)))
      .map(([name, val], idx) => [
        idx + 1, name, ((val && val.quantity) || 0).toFixed(2), ((val && val[selectedRashi]) || 0).toFixed(2)
      ]);
    const schemeWs = XLSX.utils.aoa_to_sheet([schemeHeaders, ...schemeRows]);
    schemeWs['!cols'] = [{ wch: 6 }, { wch: 40 }, { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, schemeWs, 'योजना-वार');
    }

    // Investment-wise Sheet (from UI aggregation)
    if (openCollapses.includes('investment')) {
    const invData = investmentChartData && investmentChartData.rawData ? investmentChartData.rawData : {};
    const investmentHeaders = ['#', 'उपनिवेश', 'आवंटित मात्रा', rashiColumnLabelExcel[selectedRashi]];
    const investmentRows = Object.entries(invData).sort((a,b)=> ((b[1][selectedRashi]||0)-(a[1][selectedRashi]||0))).map(([name, val], idx) => [
      idx + 1, name, ((val && val.quantity) || 0).toFixed(2), ((val && val[selectedRashi]) || 0).toFixed(2)
    ]);
    const investmentWs = XLSX.utils.aoa_to_sheet([investmentHeaders, ...investmentRows]);
    investmentWs['!cols'] = [{ wch: 6 }, { wch: 40 }, { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, investmentWs, 'उपनिवेश-वार');
    }

    // Sub-investment Scheme Sheet (flattened columns: for each scheme show मात्रा and selectedRashi)
    if (openCollapses.includes('subInvestment')) {
    const sub = subCombinedTableData || { subInvestments: [], schemes: [], data: {}, totals: {}, quantities: {}, grandTotal: 0, grandQuantity: 0 };
    const filteredSchemes = sub.schemes.filter(scheme => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(s => s.value === scheme));
    const filteredSubInvestments = sub.subInvestments.filter(subInv => selectedSubInvestments.length === 0 || selectedSubInvestments.some(s => s.value === subInv));
    const subHeaders = ['#', 'उपनिवेश', ...filteredSchemes.flatMap(s => [`${s} - मात्रा`, `${s} - ${rashiColumnLabelExcel[selectedRashi]}`]), 'कुल मात्रा', `कुल ${rashiColumnLabelExcel[selectedRashi]}`];
    const subRows = filteredSubInvestments.map((si, idx) => [
      idx + 1,
      si,
      ...filteredSchemes.flatMap(s => [((sub.data[si] && sub.data[si][s] && sub.data[si][s].quantity) || 0).toFixed(2), ((sub.data[si] && sub.data[si][s] && sub.data[si][s][selectedRashi]) || 0).toFixed(2)]),
      (filteredSchemes.reduce((sum, s) => sum + (((sub.data[si] && sub.data[si][s]) && sub.data[si][s].quantity) || 0), 0)).toFixed(2),
      (filteredSchemes.reduce((sum, s) => sum + (((sub.data[si] && sub.data[si][s]) && sub.data[si][s][selectedRashi]) || 0), 0)).toFixed(2)
    ]);
    subRows.push([
      'कुल',
      '',
      ...filteredSchemes.flatMap(s => [
        (filteredSubInvestments.reduce((sum, si) => sum + (((sub.data[si] && sub.data[si][s]) && sub.data[si][s].quantity) || 0), 0)).toFixed(2),
        (filteredSubInvestments.reduce((sum, si) => sum + (((sub.data[si] && sub.data[si][s]) && sub.data[si][s][selectedRashi]) || 0), 0)).toFixed(2)
      ]),
      (filteredSubInvestments.reduce((sum, si) => sum + filteredSchemes.reduce((schemeSum, s) => schemeSum + (((sub.data[si] && sub.data[si][s]) && sub.data[si][s].quantity) || 0), 0), 0)).toFixed(2),
      (filteredSubInvestments.reduce((sum, si) => sum + filteredSchemes.reduce((schemeSum, s) => schemeSum + (((sub.data[si] && sub.data[si][s]) && sub.data[si][s][selectedRashi]) || 0), 0), 0)).toFixed(2)
    ]);
    const subCombinedWs = XLSX.utils.aoa_to_sheet([subHeaders, ...subRows]);
    subCombinedWs['!cols'] = [{ wch: 6 }, { wch: 30 }, ...filteredSchemes.flatMap(() => [{ wch: 12 }, { wch: 15 }]), { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, subCombinedWs, 'उपनिवेश - योजना');
    }

    // Main Investment Subsidy Sheet (match UI: name, quantity, subsidy)
    if (openCollapses.includes('mainInvestment')) {
    const mainInvestmentHeaders = ['#', 'निवेश नाम', 'आवंटित मात्रा', rashiColumnLabelExcel[selectedRashi]];
    const mainInvestmentRows = Object.entries(investmentChartData.rawData)
      .sort((a, b) => ((b[1][selectedRashi] || 0) - (a[1][selectedRashi] || 0)))
      .map(([name, val], idx) => [
        idx + 1,
        name,
        ((val && val.quantity) || 0).toFixed(2),
        ((val && val[selectedRashi]) || 0).toFixed(2)
      ]);
    mainInvestmentRows.push([
      'कुल',
      '',
      (Object.values(investmentChartData.rawData || {}).reduce((s,v)=> s + ((v && v.quantity) || 0),0)).toFixed(2),
      (Object.values(investmentChartData.rawData || {}).reduce((s,v)=> s + ((v && v[selectedRashi]) || 0),0)).toFixed(2)
    ]);
    const mainInvestmentWs = XLSX.utils.aoa_to_sheet([mainInvestmentHeaders, ...mainInvestmentRows]);
    mainInvestmentWs['!cols'] = [{ wch: 6 }, { wch: 40 }, { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, mainInvestmentWs, 'निवेश सब्सिडी');
    }

    // Center (Kendra) Sheet (matrix flattened: for each scheme show मात्रा + selectedRashi)
    if (openCollapses.includes('centerCombined')) {
    const center = centerCombinedTableData || { centers: [], schemes: [], data: {}, totals: {}, quantities: {}, grandTotal: 0, grandQuantity: 0 };
    const filteredSchemes = center.schemes.filter(scheme => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(s => s.value === scheme));
    const filteredCenters = center.centers.filter(center => selectedCenters.length === 0 || selectedCenters.some(c => c.value === center));
    const centerHeaders = ['#', 'केंद्र', ...filteredSchemes.flatMap(s => [`${s} - मात्रा`, `${s} - ${rashiColumnLabelExcel[selectedRashi]}`]), 'कुल मात्रा', `कुल ${rashiColumnLabelExcel[selectedRashi]}`];
    const centerRows = filteredCenters.map((c, idx) => [
      idx + 1,
      c,
      ...filteredSchemes.flatMap(s => [((center.data[c] && center.data[c][s] && center.data[c][s].quantity) || 0).toFixed(2), ((center.data[c] && center.data[c][s] && center.data[c][s][selectedRashi]) || 0).toFixed(2)]),
      (filteredSchemes.reduce((sum, s) => sum + (((center.data[c] && center.data[c][s]) && center.data[c][s].quantity) || 0), 0)).toFixed(2),
      (filteredSchemes.reduce((sum, s) => sum + (((center.data[c] && center.data[c][s]) && center.data[c][s][selectedRashi]) || 0), 0)).toFixed(2)
    ]);
    centerRows.push([
      'कुल',
      '',
      ...filteredSchemes.flatMap(s => [
        (filteredCenters.reduce((sum, c) => sum + (((center.data[c] && center.data[c][s]) && center.data[c][s].quantity) || 0),0)).toFixed(2),
        (filteredCenters.reduce((sum, c) => sum + (((center.data[c] && center.data[c][s]) && center.data[c][s][selectedRashi]) || 0),0)).toFixed(2)
      ]),
      (filteredCenters.reduce((sum, c) => sum + filteredSchemes.reduce((schemeSum, s) => schemeSum + (((center.data[c] && center.data[c][s]) && center.data[c][s].quantity) || 0), 0), 0)).toFixed(2),
      (filteredCenters.reduce((sum, c) => sum + filteredSchemes.reduce((schemeSum, s) => schemeSum + (((center.data[c] && center.data[c][s]) && center.data[c][s][selectedRashi]) || 0), 0), 0)).toFixed(2)
    ]);
    const centerWs = XLSX.utils.aoa_to_sheet([centerHeaders, ...centerRows]);
    centerWs['!cols'] = [{ wch: 6 }, { wch: 30 }, ...filteredSchemes.flatMap(() => [{ wch: 12 }, { wch: 15 }]), { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, centerWs, 'केंद्र - योजना');
    }

    // Vidhan Sabha Sheet (matrix flattened: for each scheme show मात्रा + selectedRashi)
    if (openCollapses.includes('vidhanCombined')) {
    const vidhan = vidhanCombinedTableData || { vidhans: [], schemes: [], data: {}, totals: {}, quantities: {}, grandTotal: 0, grandQuantity: 0 };
    const filteredSchemes = vidhan.schemes.filter(scheme => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(s => s.value === scheme));
    const filteredVidhans = vidhan.vidhans.filter(vidhan => selectedVidhanSabhas.length === 0 || selectedVidhanSabhas.some(v => v.value === vidhan));
    const vidhanHeaders = ['#', 'विधानसभा', ...filteredSchemes.flatMap(s => [`${s} - मात्रा`, `${s} - ${rashiColumnLabelExcel[selectedRashi]}`]), 'कुल मात्रा', `कुल ${rashiColumnLabelExcel[selectedRashi]}`];
    const vidhanRows = filteredVidhans.map((v, idx) => [
      idx + 1,
      v,
      ...filteredSchemes.flatMap(s => [((vidhan.data[v] && vidhan.data[v][s] && vidhan.data[v][s].quantity) || 0).toFixed(2), ((vidhan.data[v] && vidhan.data[v][s] && vidhan.data[v][s][selectedRashi]) || 0).toFixed(2)]),
      (filteredSchemes.reduce((sum, s) => sum + (((vidhan.data[v] && vidhan.data[v][s]) && vidhan.data[v][s].quantity) || 0), 0)).toFixed(2),
      (filteredSchemes.reduce((sum, s) => sum + (((vidhan.data[v] && vidhan.data[v][s]) && vidhan.data[v][s][selectedRashi]) || 0), 0)).toFixed(2)
    ]);
    vidhanRows.push([
      'कुल',
      '',
      ...filteredSchemes.flatMap(s => [
        (filteredVidhans.reduce((sum, v) => sum + (((vidhan.data[v] && vidhan.data[v][s]) && vidhan.data[v][s].quantity) || 0),0)).toFixed(2),
        (filteredVidhans.reduce((sum, v) => sum + (((vidhan.data[v] && vidhan.data[v][s]) && vidhan.data[v][s][selectedRashi]) || 0),0)).toFixed(2)
      ]),
      (filteredVidhans.reduce((sum, v) => sum + filteredSchemes.reduce((schemeSum, s) => schemeSum + (((vidhan.data[v] && vidhan.data[v][s]) && vidhan.data[v][s].quantity) || 0), 0), 0)).toFixed(2),
      (filteredVidhans.reduce((sum, v) => sum + filteredSchemes.reduce((schemeSum, s) => schemeSum + (((vidhan.data[v] && vidhan.data[v][s]) && vidhan.data[v][s][selectedRashi]) || 0), 0), 0)).toFixed(2)
    ]);
    const vidhanWs = XLSX.utils.aoa_to_sheet([vidhanHeaders, ...vidhanRows]);
    vidhanWs['!cols'] = [{ wch: 6 }, { wch: 30 }, ...filteredSchemes.flatMap(() => [{ wch: 12 }, { wch: 15 }]), { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, vidhanWs, 'विधानसभा - योजना');
    }

    // Combined Investment-Scheme Sheet (matrix with मात्रा + selectedRashi flattened)
    if (openCollapses.includes('investmentCombined')) {
    const comb = combinedTableData || { investments: [], schemes: [], data: {}, totals: {}, quantities: {}, grandTotal: 0, grandQuantity: 0 };
    const filteredSchemes = comb.schemes.filter(scheme => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(s => s.value === scheme));
    const filteredInvestments = comb.investments.filter(inv => selectedMainInvestments.length === 0 || selectedMainInvestments.some(s => s.value === inv));
    const combinedHeaders = ['#', 'निवेश', ...filteredSchemes.flatMap(s => [`${s} - मात्रा`, `${s} - ${rashiColumnLabelExcel[selectedRashi]}`]), 'कुल मात्रा', `कुल ${rashiColumnLabelExcel[selectedRashi]}`];
    const combinedRows = filteredInvestments.map((inv, idx) => [
      idx + 1,
      inv,
      ...filteredSchemes.flatMap(s => [((comb.data[inv] && comb.data[inv][s] && comb.data[inv][s].quantity) || 0).toFixed(2), ((comb.data[inv] && comb.data[inv][s] && comb.data[inv][s][selectedRashi]) || 0).toFixed(2)]),
      (filteredSchemes.reduce((sum, s) => sum + (((comb.data[inv] && comb.data[inv][s]) && comb.data[inv][s].quantity) || 0), 0)).toFixed(2),
      (filteredSchemes.reduce((sum, s) => sum + (((comb.data[inv] && comb.data[inv][s]) && comb.data[inv][s][selectedRashi]) || 0), 0)).toFixed(2)
    ]);
    combinedRows.push([
      'कुल', '',
      ...filteredSchemes.flatMap(s => [
        (filteredInvestments.reduce((sum, inv) => sum + (((comb.data[inv] && comb.data[inv][s]) && comb.data[inv][s].quantity) || 0),0)).toFixed(2),
        (filteredInvestments.reduce((sum, inv) => sum + (((comb.data[inv] && comb.data[inv][s]) && comb.data[inv][s][selectedRashi]) || 0),0)).toFixed(2)
      ]),
      (filteredInvestments.reduce((sum, inv) => sum + filteredSchemes.reduce((schemeSum, s) => schemeSum + (((comb.data[inv] && comb.data[inv][s]) && comb.data[inv][s].quantity) || 0), 0), 0)).toFixed(2),
      (filteredInvestments.reduce((sum, inv) => sum + filteredSchemes.reduce((schemeSum, s) => schemeSum + (((comb.data[inv] && comb.data[inv][s]) && comb.data[inv][s][selectedRashi]) || 0), 0), 0)).toFixed(2)
    ]);
    const combinedWs = XLSX.utils.aoa_to_sheet([combinedHeaders, ...combinedRows]);
    combinedWs['!cols'] = [{ wch: 6 }, { wch: 30 }, ...filteredSchemes.flatMap(() => [{ wch: 12 }, { wch: 15 }]), { wch: 15 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, combinedWs, 'निवेश - योजना');
    }

    if (action === 'download') {
      XLSX.writeFile(wb, `DHO_रिपोर्ट_${currentDate.replace(/\//g, '-')}.xlsx`);
    } else {
      // For view, display preview modal with sheet data
      const sheetData = {};
      wb.SheetNames.forEach(sheetName => {
        sheetData[sheetName] = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1 });
      });
      setExcelPreviewData({ sheets: sheetData, filename: `DHO_रिपोर्ट_${currentDate.replace(/\//g, '-')}.xlsx` });
      setShowExcelPreview(true);
    }
  };

  return (
    <>
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <LeftNav
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
          isTablet={isTablet}
        />

        {/* Main Content */}
        <div className="main-content">
          <DashBoardHeader sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          <Container fluid className="dashboard-body bg-home">
            {/* Welcome Section */}
            <div className="home-welcome-section d-flex justify-content-between text-center mb-4">
              <h1 className="home-title">{translations.home}</h1>
              <p className="home-subtitle">{translations.welcomeMessage}</p>
            </div>

            {/* Report Export Buttons */}
            {!loading && !error && (
              <Card className="report-export-card mb-4">
                <Card.Body className="py-2">
                  <Row className="align-items-center">
                    <Col md={6} className="mb-2 mb-md-0">
                      <div className="d-flex align-items-center">
                        <FaClipboardList className="text-primary me-2" />
                        <span className="report-title" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                          रिपोर्ट निर्यात करें
                        </span>
                        <span className="badge bg-info ms-2" style={{ fontSize: '0.7rem' }}>
                          {filteredData.length} रिकॉर्ड
                        </span>
                        {(isDateFilterApplied || selectedSchemes.length > 0 || selectedInvestments.length > 0) && (
                          <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.65rem' }}>
                            फ़िल्टर्ड डेटा
                          </span>
                        )}
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                        {/* PDF Options */}
                        <Dropdown as={ButtonGroup} size="sm">
                          <Button variant="danger" size="sm" onClick={() => generatePDF('download')}>
                            <FaFilePdf className="me-1" /> PDF
                          </Button>
                          <Dropdown.Toggle split variant="danger" size="sm" />
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => generatePDF('view')}>
                              <FaEye className="me-2" /> देखें (View)
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => generatePDF('download')}>
                              <FaDownload className="me-2" /> डाउनलोड (Download)
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>

                        {/* Excel Options */}
                        <Dropdown as={ButtonGroup} size="sm">
                          <Button variant="success" size="sm" onClick={() => generateExcel('download')}>
                            <FaFileExcel className="me-1" /> Excel
                          </Button>
                          <Dropdown.Toggle split variant="success" size="sm" />
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => generateExcel('view')}>
                              <FaEye className="me-2" /> देखें (View)
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => generateExcel('download')}>
                              <FaDownload className="me-2" /> डाउनलोड (Download)
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* PDF Preview Modal */}
            <Modal show={showPdfPreview} onHide={() => { setShowPdfPreview(false); URL.revokeObjectURL(pdfPreviewUrl); }} size="xl" centered>
              <Modal.Header closeButton style={{ backgroundColor: '#dc3545', color: 'white' }}>
                <Modal.Title style={{ fontSize: '1rem' }}>
                  <FaFilePdf className="me-2" /> PDF रिपोर्ट प्रीव्यू
                </Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ padding: 0, height: '75vh' }}>
                <iframe src={pdfPreviewUrl} width="100%" height="100%" title="PDF Preview" style={{ border: 'none' }} />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" size="sm" onClick={() => { setShowPdfPreview(false); URL.revokeObjectURL(pdfPreviewUrl); }}>
                  बंद करें
                </Button>
                <Button variant="danger" size="sm" onClick={() => generatePDF('download')}>
                  <FaDownload className="me-1" /> डाउनलोड करें
                </Button>
              </Modal.Footer>
            </Modal>

            {loading ? (
              <div className="text-center my-5">
                <Spinner animation="border" role="status" variant="primary">
                  <span className="visually-hidden">{translations.loading}</span>
                </Spinner>
                <p className="mt-3">{translations.loading}</p>
              </div>
            ) : error ? (
              <Alert variant="danger" className="text-center">
                {error}
                <div className="mt-2">
                  <button className="btn btn-outline-danger btn-sm" onClick={retryFetch}>
                    {translations.retry}
                  </button>
                </div>
              </Alert>
            ) : (
              <>
                {/* Filter Section */}
                <Card className="filter-card mb-4">
                  <Card.Header className="filter-card-header">
                    <h5 className="mb-0">
                      <FaClipboardList className="me-2" />
                      {translations.overviewTitle}
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {/* Date Filter Section */}
                    <div className="date-filter-section-compact mb-3">
                      <h6 className="filter-section-title-sm mb-2">
                        <FaCalendarAlt className="me-1" />
                        {translations.dateFilter}
                      </h6>
                      <Row className="align-items-end g-2">
                        <Col lg={3} md={4} sm={6} className="mb-2">
                          <Form.Group controlId="startDate">
                            <Form.Label className="filter-label-sm">
                              {translations.startDate}
                            </Form.Label>
                            <Form.Control
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="date-input-sm"
                              size="sm"
                            />
                          </Form.Group>
                        </Col>
                        <Col lg={3} md={4} sm={6} className="mb-2">
                          <Form.Group controlId="endDate">
                            <Form.Label className="filter-label-sm">
                              {translations.endDate}
                            </Form.Label>
                            <Form.Control
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="date-input-sm"
                              size="sm"
                              min={startDate}
                            />
                          </Form.Group>
                        </Col>
                        <Col lg={6} md={4} sm={12} className="mb-2">
                          <div className="d-flex gap-2 flex-wrap">
                            <Button 
                             
                             
                              onClick={handleApplyDateFilter}
                              disabled={!startDate && !endDate}
                              className="btn-filter-submit"
                            >
                              <FaFilter className="me-1" />
                              {translations.applyFilter}
                            </Button>
                            <Button 
                            
                              onClick={handleClearDateFilter}
                              disabled={!isDateFilterApplied && !startDate && !endDate}
                              className="clear-btn-primary"
                            >
                              {translations.clearFilter}
                            </Button>
                            {/* Applied Date Filter Display */}
                            {isDateFilterApplied && (appliedStartDate || appliedEndDate) && (
                              <span className="badge bg-success d-flex align-items-center" style={{fontSize: '0.7rem'}}>
                                <FaCalendarAlt className="me-1" />
                                {formatDate(appliedStartDate)} - {formatDate(appliedEndDate)}
                              </span>
                            )}
                          </div>
                        </Col>
                      </Row>
                    </div>

                    <hr className="filter-divider-sm" />

                    {/* Scheme and Investment Filters */}
                    <Row>
                      <Col md={6} className="mb-2">
                        <label className="filter-label-sm">
                          {translations.filterByScheme}
                        </label>
                        <Select
                          isMulti
                          options={schemeOptions}
                          value={selectedSchemes}
                          onChange={handleSchemeChange}
                          placeholder={translations.selectPlaceholder}
                          noOptionsMessage={() => translations.noOptions}
                          styles={customSelectStyles}
                          closeMenuOnSelect={false}
                          isClearable
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      </Col>
                      
                      <Col md={6} className="mb-2">
                        <label className="filter-label-sm">
                          {translations.filterByInvestment}
                        </label>
                        <Select
                          isMulti
                          options={investmentOptions}
                          value={selectedInvestments}
                          onChange={handleInvestmentChange}
                          placeholder={translations.selectPlaceholder}
                          noOptionsMessage={() => translations.noOptions}
                          styles={customSelectStyles}
                          closeMenuOnSelect={false}
                          isClearable
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                        />
                      </Col>
                    </Row>
                    
                    {/* Selected Filters Display */}
                    {(selectedSchemes.length > 0 || selectedInvestments.length > 0) && (
                      <div className="selected-filters-display mt-2">
                        <small className="text-muted" style={{fontSize: '0.75rem'}}>
                          चयनित: {selectedSchemes.length} योजना, {selectedInvestments.length} उपनिवेश
                        </small>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* Statistics Cards */}
                <Row className="stats-row mb-4">
                  {/* Total Records Card */}
                  <Col lg={3} md={6} className="mb-3">
                    <Card className="stat-card stat-card-records">
                      <Card.Body>
                        <div className="stat-icon-wrapper bg-primary-light">
                          <FaClipboardList className="stat-icon text-primary" />
                        </div>
                        <div className="stat-content">
                          <h6 className="stat-label">{translations.totalRecords}</h6>
                          <h3 className="stat-value">{formatNumber(aggregatedStats.totalRecords)}</h3>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Allocated Quantity Card */}
                  <Col lg={3} md={6} className="mb-3">
                    <Card className="stat-card stat-card-quantity">
                      <Card.Body>
                        <div className="stat-icon-wrapper bg-success-light">
                          <FaChartLine className="stat-icon text-success" />
                        </div>
                        <div className="stat-content">
                          <h6 className="stat-label">{translations.allocatedQuantity}</h6>
                          <h3 className="stat-value">{formatNumber(aggregatedStats.allocatedQuantity.toFixed(2))}</h3>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Farmer Share Amount Card */}
                  <Col lg={3} md={6} className="mb-3">
                    <Card className="stat-card stat-card-farmer">
                      <Card.Body>
                        <div className="stat-icon-wrapper bg-warning-light">
                          <FaHandHoldingUsd className="stat-icon text-warning" />
                        </div>
                        <div className="stat-content">
                          <h6 className="stat-label">{translations.farmerShareAmount}</h6>
                          <h3 className="stat-value">{formatCurrency(aggregatedStats.farmerShareAmount)}</h3>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Subsidy Amount Card */}
                  <Col lg={3} md={6} className="mb-3">
                    <Card className="stat-card stat-card-subsidy">
                      <Card.Body>
                        <div className="stat-icon-wrapper bg-info-light">
                          <FaRupeeSign className="stat-icon text-info" />
                        </div>
                        <div className="stat-content">
                          <h6 className="stat-label">{translations.subsidyAmount}</h6>
                          <h3 className="stat-value">{formatCurrency(aggregatedStats.subsidyAmount)}</h3>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Total Amount Highlight Card */}
                <Row className="mb-4">
                  <Col>
                    <Card className="total-amount-card">
                      <Card.Body className="text-center">
                        <h5 className="total-label">{translations.totalAmount}</h5>
                        <h2 className="total-value">{formatCurrency(aggregatedStats.totalAmount)}</h2>
                        <div className="total-breakdown">
                          <span className="breakdown-item">
                            <span className="breakdown-label">{translations.farmerShareAmount}:</span>
                            <span className="breakdown-value farmer">{formatCurrency(aggregatedStats.farmerShareAmount)}</span>
                          </span>
                          <span className="breakdown-separator">+</span>
                          <span className="breakdown-item">
                            <span className="breakdown-label">{translations.subsidyAmount}:</span>
                            <span className="breakdown-value subsidy">{formatCurrency(aggregatedStats.subsidyAmount)}</span>
                          </span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Summary Table */}
                <Card className="summary-table-card mb-4">
                  <Card.Header className="summary-card-header">
                    <h5 className="mb-0">विस्तृत सारांश</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="table-responsive">
                      <table className="table table-bordered summary-table">
                        <thead>
                          <tr>
                            <th>{translations.allocatedQuantity}</th>
                            <th>{translations.farmerShareAmount}</th>
                            <th>{translations.subsidyAmount}</th>
                            <th>{translations.totalAmount}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="text-center">
                              <strong>{formatNumber(aggregatedStats.allocatedQuantity.toFixed(2))}</strong>
                            </td>
                            <td className="text-center text-warning">
                              <strong>{formatCurrency(aggregatedStats.farmerShareAmount)}</strong>
                            </td>
                            <td className="text-center text-info">
                              <strong>{formatCurrency(aggregatedStats.subsidyAmount)}</strong>
                            </td>
                            <td className="text-center text-success">
                              <strong>{formatCurrency(aggregatedStats.totalAmount)}</strong>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </Card.Body>
                </Card>

                {/* ==================== GRAPHS SECTION ==================== */}
                {filteredData.length > 0 && (
                  <>
                    {/* Section Title */}
                    <div className="graphs-section-title d-flex justify-content-between mb-3">
                      <h4 className="text-primary">
                        <FaChartBar className="me-2" />
                        डेटा विश्लेषण
                      </h4>
                      <p className=" small mb-0">चयनित फ़िल्टर के आधार पर डेटा प्रदर्शित</p>
                    </div>
                    {/* राशि filter dropdown */}
                    <Card className="mb-3" style={{ border: '2px solid #194e8b', backgroundColor: '#f8f9fa' }}>
                      <Card.Body className="py-2">
                        <Row className="align-items-center">
                          <Col md={3}>
                            <Form.Label htmlFor="rashiFilter" className="mb-0" style={{ fontWeight: 600, color: '#194e8b', fontSize: '0.9rem' }}>
                              <FaFilter className="me-1" />
                              राशि फ़िल्टर चुनें:
                            </Form.Label>
                          </Col>
                          <Col md={4}>
                            <Form.Select
                              id="rashiFilter"
                              value={selectedRashi}
                              onChange={e => setSelectedRashi(e.target.value)}
                              style={{ fontSize: '13px', fontWeight: 600, borderColor: '#194e8b', borderWidth: '2px' }}
                            >
                              {rashiOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </Form.Select>
                          </Col>
                          <Col md={5}>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                              <FaInfoCircle className="me-1" />
                              यह फ़िल्टर नीचे दी गई सभी तालिकाओं पर लागू होता है
                            </small>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                    <div id="graphsSection">

                    {/* Scheme-wise summary (recreated on top) */}
                    <Card className="chart-card mb-4">
                      <Card.Header 
                        className="chart-card-header bg-primary-gradient" 
                        onClick={() => toggleCollapse('scheme')}
                        style={{ cursor: 'pointer' }}
                      >
                        <h6 className="mb-0 text-white">
                          <FaTable className="me-2" />
                          योजना-वार कुल सब्सिडी तुलना
                          <span className="float-end">{openCollapses.includes('scheme') ? '▼' : '▶'}</span>
                        </h6>
                      </Card.Header>
                      <Collapse in={openCollapses.includes('scheme')}>
                        <div>
                      <Card.Body>
                        {/* Scheme Filter */}
                        <div className="mb-3" style={{ maxWidth: '500px' }}>
                          <Form.Label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                            <FaFilter className="me-1" /> योजनाओं का चयन करें:
                          </Form.Label>
                          <div className="d-flex gap-2 mb-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                const allSchemes = Object.keys(schemeChartData.rawData || {}).map(scheme => ({
                                  value: scheme,
                                  label: scheme
                                }));
                                setSelectedTableSchemes(allSchemes);
                              }}
                              style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                            >
                              सभी चुनें
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => setSelectedTableSchemes([])}
                              style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                            >
                              साफ़ करें
                            </Button>
                          </div>
                          <Select
                            isMulti
                            options={Object.keys(schemeChartData.rawData || {}).map(scheme => ({
                              value: scheme,
                              label: scheme
                            }))}
                            value={selectedTableSchemes}
                            onChange={setSelectedTableSchemes}
                            placeholder="सभी योजनाएं"
                            styles={customSelectStyles}
                            closeMenuOnSelect={false}
                            isClearable
                          />
                        </div>

                        <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                          {schemeChartData && schemeChartData.rawData && Object.keys(schemeChartData.rawData).length > 0 ? (
                            <div className="table-responsive">
                              <table className="table table-sm table-striped mb-0" style={{ fontSize: '0.85rem' }}>
                                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#343a40', color: 'white' }} className="table-th-heading">
                                  <tr>
                                    <th style={{ width: '40px' }}>#</th>
                                    <th>योजना</th>
                                    <th className="text-end">आवंटित मात्रा</th>
                                    <th className="text-end">{rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>
                                  </tr>
                                </thead>
                                 <tbody>
                                  {Object.entries(schemeChartData.rawData)
                                    .filter(([label]) => selectedTableSchemes.length === 0 || selectedTableSchemes.some(s => s.value === label))
                                    .sort((a,b)=> ((b[1][selectedRashi]||0) - (a[1][selectedRashi]||0)))
                                    .map(([label, val], idx) => (
                                    <tr key={label}>
                                      <td>{idx+1}</td>
                                      <td title={label} style={{ whiteSpace: 'nowrap', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</td>
                                      <td className="text-end">{((val && val.quantity) || 0).toFixed(2)}</td>
                                      <td className="text-end">{formatCurrency((val && val[selectedRashi]) || 0)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr style={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>
                                    <td colSpan={2}>कुल</td>
                                    <td className="text-end">{(Object.entries(schemeChartData.rawData || {})
                                      .filter(([label]) => selectedTableSchemes.length === 0 || selectedTableSchemes.some(s => s.value === label))
                                      .reduce((s, [_, v]) => s + ((v && v.quantity) || 0), 0)).toFixed(2)}</td>
                                    <td className="text-end">{formatCurrency(Object.entries(schemeChartData.rawData || {})
                                      .filter(([label]) => selectedTableSchemes.length === 0 || selectedTableSchemes.some(s => s.value === label))
                                      .reduce((s, [_, v]) => s + ((v && v[selectedRashi]) || 0), 0))}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          ) : (
                            <div className="no-data-message">कोई डेटा उपलब्ध नहीं</div>
                          )}
                        </div>
                      </Card.Body>
                        </div>
                      </Collapse>
                    </Card>





                    {/* Row: केंद्र योजना-वार तालिका (Center - Yojna-wise) */}
                    <Card className="chart-card mb-4">
                      <Card.Header 
                        onClick={() => toggleCollapse('centerCombined')} 
                        style={{cursor: 'pointer'}} 
                        className="chart-card-header bg-primary-gradient"
                      >
                        <h6 className="mb-0 text-white">
                          <FaTable className="me-2" />
                          केंद्र के अनुसार योजना-वार तुलना
                          <span className="float-end">
                            {openCollapses.includes('centerCombined') ? '▼' : '▶'}
                          </span>
                        </h6>
                      </Card.Header>
                       <Collapse in={openCollapses.includes('centerCombined')}>
                        <div>
                      <Card.Body>
                        {/* Center and Scheme Filters */}
                        <div className="mb-3 d-flex gap-3 flex-wrap">
                          <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                            <Form.Label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                              <FaFilter className="me-1" /> केंद्र:
                            </Form.Label>
                            <div className="d-flex gap-2 mb-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  const allCenters = centerCombinedTableData.centers.map(center => ({
                                    value: center,
                                    label: center
                                  }));
                                  setSelectedCenters(allCenters);
                                }}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                सभी चुनें
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setSelectedCenters([])}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                साफ़ करें
                              </Button>
                            </div>
                            <Select
                              isMulti
                              options={centerCombinedTableData.centers.map(center => ({
                                value: center,
                                label: center
                              }))}
                              value={selectedCenters}
                              onChange={setSelectedCenters}
                              placeholder="सभी केंद्र"
                              styles={customSelectStyles}
                              closeMenuOnSelect={false}
                              isClearable
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                            <Form.Label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                              <FaFilter className="me-1" /> योजनाएं:
                            </Form.Label>
                            <div className="d-flex gap-2 mb-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  const allSchemes = centerCombinedTableData.schemes.map(scheme => ({
                                    value: scheme,
                                    label: scheme
                                  }));
                                  setSelectedCenterSchemes(allSchemes);
                                }}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                सभी चुनें
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setSelectedCenterSchemes([])}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                साफ़ करें
                              </Button>
                            </div>
                            <Select
                              isMulti
                              options={centerCombinedTableData.schemes.map(scheme => ({
                                value: scheme,
                                label: scheme
                              }))}
                              value={selectedCenterSchemes}
                              onChange={setSelectedCenterSchemes}
                              placeholder="सभी योजनाएं"
                              styles={customSelectStyles}
                              closeMenuOnSelect={false}
                              isClearable
                            />
                          </div>
                        </div>

                        <div style={{ maxHeight: '420px', overflow: 'auto' }}>
                          {centerCombinedTableData.centers && centerCombinedTableData.centers.length > 0 ? (
                            <div className="table-responsive">
                              <table className="table table-sm table-striped mb-0" style={{ fontSize: '0.75rem', minWidth: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#6c757d', color: 'white' }} >
                                  <tr>
                                    <th style={{ width: '40px' }}>#</th>
                                    <th style={{ minWidth: '120px' }}>केंद्र</th>
                                    {centerCombinedTableData.schemes
                                      .filter(scheme => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(s => s.value === scheme))
                                      .map(scheme => (
                                      <th key={scheme} className="text-center" colSpan={2} style={{ minWidth: '160px' }}>{scheme}</th>
                                    ))}
                                    <th className="text-center" colSpan={2} style={{ minWidth: '160px' }}>कुल</th>
                                  </tr>
                                  <tr>
                                    <th></th>
                                    <th></th>
                                    {centerCombinedTableData.schemes
                                      .filter(scheme => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(s => s.value === scheme))
                                      .map(scheme => (
                                      <>
                                        <th key={scheme + '_qty'} className="text-end" style={{ minWidth: '80px' }}>आवंटित मात्रा</th>
                                        <th key={scheme + '_sub'} className="text-end" style={{ minWidth: '80px' }}>{rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>
                                      </>
                                    ))}
                                    <th className="text-end" style={{ minWidth: '80px' }}>आवंटित मात्रा</th>
                                    <th className="text-end" style={{ minWidth: '80px' }}>कुल {rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {centerCombinedTableData.centers
                                    .filter(center => selectedCenters.length === 0 || selectedCenters.some(c => c.value === center))
                                    .map((center, idx) => (
                                    <tr key={center}>
                                      <td>{idx + 1}</td>
                                      <td style={{ whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={center}>
                                        {center}
                                      </td>
                                      {centerCombinedTableData.schemes
                                        .filter(scheme => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(s => s.value === scheme))
                                        .map(scheme => (
                                        <>
                                          <td key={scheme + '_qty'} className="text-end">{((centerCombinedTableData.data[center][scheme] && centerCombinedTableData.data[center][scheme].quantity) || 0).toFixed(2)}</td>
                                          <td key={scheme + '_sub'} className="text-end">{formatCurrency((centerCombinedTableData.data[center][scheme] && centerCombinedTableData.data[center][scheme][selectedRashi]) || 0)}</td>
                                        </>
                                      ))}
                                      <td className="text-end">{(centerCombinedTableData.schemes
                                        .filter(scheme => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(s => s.value === scheme))
                                        .reduce((sum, scheme) => sum + ((centerCombinedTableData.data[center][scheme] && centerCombinedTableData.data[center][scheme].quantity) || 0), 0)).toFixed(2)}</td>
                                      <td className="text-end font-weight-bold">
                                        {formatCurrency(centerCombinedTableData.schemes
                                          .filter(scheme => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(s => s.value === scheme))
                                          .reduce((sum, scheme) => sum + ((centerCombinedTableData.data[center][scheme] && centerCombinedTableData.data[center][scheme][selectedRashi]) || 0), 0))}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr style={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>
                                    <td colSpan={2}>कुल</td>
                                    {centerCombinedTableData.schemes
                                      .filter(scheme => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(s => s.value === scheme))
                                      .map(scheme => (
                                      <>
                                        <td key={scheme + '_qty_foot'} className="text-end">{(centerCombinedTableData.centers
                                          .filter(center => selectedCenters.length === 0 || selectedCenters.some(c => c.value === center))
                                          .reduce((sum, c) => sum + ((centerCombinedTableData.data[c][scheme] && centerCombinedTableData.data[c][scheme].quantity) || 0), 0)).toFixed(2)}</td>
                                        <td key={scheme + '_sub_foot'} className="text-end">{formatCurrency(centerCombinedTableData.centers
                                          .filter(center => selectedCenters.length === 0 || selectedCenters.some(c => c.value === center))
                                          .reduce((sum, c) => sum + ((centerCombinedTableData.data[c][scheme] && centerCombinedTableData.data[c][scheme][selectedRashi]) || 0), 0))}</td>
                                      </>
                                    ))}
                                    <td className="text-end">{(centerCombinedTableData.centers
                                      .filter(center => selectedCenters.length === 0 || selectedCenters.some(c => c.value === center))
                                      .reduce((sum, center) => sum + centerCombinedTableData.schemes.filter(s => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(scheme => scheme.value === s)).reduce((schemeSum, s) => schemeSum + ((centerCombinedTableData.data[center] && centerCombinedTableData.data[center][s] && centerCombinedTableData.data[center][s].quantity) || 0), 0), 0)).toFixed(2)}</td>
                                    <td className="text-end">
                                      {formatCurrency(centerCombinedTableData.centers
                                        .filter(center => selectedCenters.length === 0 || selectedCenters.some(c => c.value === center))
                                        .reduce((sum, center) => sum + centerCombinedTableData.schemes.filter(s => selectedCenterSchemes.length === 0 || selectedCenterSchemes.some(scheme => scheme.value === s)).reduce((schemeSum, s) => schemeSum + ((centerCombinedTableData.data[center] && centerCombinedTableData.data[center][s] && centerCombinedTableData.data[center][s][selectedRashi]) || 0), 0), 0))}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          ) : (
                            <div className="no-data-message">कोई डेटा उपलब्ध नहीं</div>
                          )}
                        </div>
                      </Card.Body>
                        </div>
                      </Collapse>
                    </Card>
                    {/* Row: विधानसभा योजना-वार तालिका (Vidhan Sabha - Yojna-wise) */}
                    <Card className="chart-card mb-4">
                      <Card.Header 
                        onClick={() => toggleCollapse('vidhanCombined')} 
                        style={{cursor: 'pointer'}} 
                        className="chart-card-header bg-primary-gradient"
                      >
                        <h6 className="mb-0 text-white">
                          <FaTable className="me-2" />
                          विधानसभा के अनुसार योजना-वार तुलना
                          <span className="float-end">
                            {openCollapses.includes('vidhanCombined') ? '▼' : '▶'}
                          </span>
                        </h6>
                      </Card.Header>
                       <Collapse in={openCollapses.includes('vidhanCombined')}>
                        <div>
                      <Card.Body>
                        {/* Vidhan Sabha and Scheme Filters */}
                        <div className="mb-3 d-flex gap-3 flex-wrap">
                          <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                            <Form.Label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                              <FaFilter className="me-1" /> विधानसभा:
                            </Form.Label>
                            <div className="d-flex gap-2 mb-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  const allVidhanSabhas = vidhanCombinedTableData.vidhans.map(vidhan => ({
                                    value: vidhan,
                                    label: vidhan
                                  }));
                                  setSelectedVidhanSabhas(allVidhanSabhas);
                                }}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                सभी चुनें
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setSelectedVidhanSabhas([])}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                साफ़ करें
                              </Button>
                            </div>
                            <Select
                              isMulti
                              options={vidhanCombinedTableData.vidhans.map(vidhan => ({
                                value: vidhan,
                                label: vidhan
                              }))}
                              value={selectedVidhanSabhas}
                              onChange={setSelectedVidhanSabhas}
                              placeholder="सभी विधानसभाएं"
                              styles={customSelectStyles}
                              closeMenuOnSelect={false}
                              isClearable
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                            <Form.Label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                              <FaFilter className="me-1" /> योजनाएं:
                            </Form.Label>
                            <div className="d-flex gap-2 mb-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  const allSchemes = vidhanCombinedTableData.schemes.map(scheme => ({
                                    value: scheme,
                                    label: scheme
                                  }));
                                  setSelectedVidhanSchemes(allSchemes);
                                }}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                सभी चुनें
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setSelectedVidhanSchemes([])}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                साफ़ करें
                              </Button>
                            </div>
                            <Select
                              isMulti
                              options={vidhanCombinedTableData.schemes.map(scheme => ({
                                value: scheme,
                                label: scheme
                              }))}
                              value={selectedVidhanSchemes}
                              onChange={setSelectedVidhanSchemes}
                              placeholder="सभी योजनाएं"
                              styles={customSelectStyles}
                              closeMenuOnSelect={false}
                              isClearable
                            />
                          </div>
                        </div>

                        <Row>
                          <Col lg={12} md={12}>
                            <div style={{ maxHeight: '420px', overflow: 'auto' }}>
                              {vidhanCombinedTableData.vidhans && vidhanCombinedTableData.vidhans.length > 0 ? (
                                <div className="table-responsive">
                                  <table className="table table-sm table-striped mb-0" style={{ fontSize: '0.75rem', minWidth: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#6c757d', color: 'white' }}>
                                      <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th style={{ minWidth: '120px' }}>विधानसभा</th>
                                        {vidhanCombinedTableData.schemes
                                          .filter(scheme => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(s => s.value === scheme))
                                          .map(scheme => (
                                          <th key={scheme} className="text-center" colSpan={2} style={{ minWidth: '160px' }}>{scheme}</th>
                                        ))}
                                        <th className="text-center" colSpan={2} style={{ minWidth: '160px' }}>कुल</th>
                                      </tr>
                                      <tr>
                                        <th style={{ width: '40px' }}></th>
                                        <th></th>
                                        {vidhanCombinedTableData.schemes
                                          .filter(scheme => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(s => s.value === scheme))
                                          .map(scheme => (
                                          <>
                                            <th key={scheme + '_qty'} className="text-end" style={{ minWidth: '80px' }}>आवंटित मात्रा</th>
                                            <th key={scheme + '_sub'} className="text-end" style={{ minWidth: '80px' }}>{rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>
                                          </>
                                        ))}
                                        <th className="text-end" style={{ minWidth: '80px' }}>आवंटित मात्रा</th>
                                        <th className="text-end" style={{ minWidth: '80px' }}>कुल {rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {vidhanCombinedTableData.vidhans
                                        .filter(vidhan => selectedVidhanSabhas.length === 0 || selectedVidhanSabhas.some(v => v.value === vidhan))
                                        .map((vidhan, idx) => (
                                        <tr key={vidhan}>
                                          <td>{idx + 1}</td>
                                          <td style={{ whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={vidhan}>
                                            {vidhan}
                                          </td>
                                          {vidhanCombinedTableData.schemes
                                            .filter(scheme => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(s => s.value === scheme))
                                            .map(scheme => (
                                            <>
                                              <td key={scheme + '_qty'} className="text-end">{((vidhanCombinedTableData.data[vidhan][scheme] && vidhanCombinedTableData.data[vidhan][scheme].quantity) || 0).toFixed(2)}</td>
                                              <td key={scheme + '_sub'} className="text-end">{formatCurrency((vidhanCombinedTableData.data[vidhan][scheme] && vidhanCombinedTableData.data[vidhan][scheme][selectedRashi]) || 0)}</td>
                                            </>
                                          ))}
                                          <td className="text-end">{(vidhanCombinedTableData.schemes
                                            .filter(scheme => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(s => s.value === scheme))
                                            .reduce((sum, scheme) => sum + ((vidhanCombinedTableData.data[vidhan][scheme] && vidhanCombinedTableData.data[vidhan][scheme].quantity) || 0), 0)).toFixed(2)}</td>
                                          <td className="text-end font-weight-bold">
                                            {formatCurrency(vidhanCombinedTableData.schemes
                                              .filter(scheme => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(s => s.value === scheme))
                                              .reduce((sum, scheme) => sum + ((vidhanCombinedTableData.data[vidhan][scheme] && vidhanCombinedTableData.data[vidhan][scheme][selectedRashi]) || 0), 0))}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr style={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>
                                        <td colSpan={2}>कुल</td>
                                        {vidhanCombinedTableData.schemes
                                          .filter(scheme => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(s => s.value === scheme))
                                          .map(scheme => (
                                          <>
                                            <td key={scheme + '_qty_foot'} className="text-end">{(vidhanCombinedTableData.vidhans
                                              .filter(vidhan => selectedVidhanSabhas.length === 0 || selectedVidhanSabhas.some(v => v.value === vidhan))
                                              .reduce((sum, v) => sum + ((vidhanCombinedTableData.data[v][scheme] && vidhanCombinedTableData.data[v][scheme].quantity) || 0), 0)).toFixed(2)}</td>
                                            <td key={scheme + '_sub_foot'} className="text-end">{formatCurrency(vidhanCombinedTableData.vidhans
                                              .filter(vidhan => selectedVidhanSabhas.length === 0 || selectedVidhanSabhas.some(v => v.value === vidhan))
                                              .reduce((sum, v) => sum + ((vidhanCombinedTableData.data[v][scheme] && vidhanCombinedTableData.data[v][scheme][selectedRashi]) || 0), 0))}</td>
                                          </>
                                        ))}
                                        <td className="text-end">{(vidhanCombinedTableData.vidhans
                                          .filter(vidhan => selectedVidhanSabhas.length === 0 || selectedVidhanSabhas.some(v => v.value === vidhan))
                                          .reduce((sum, vidhan) => sum + vidhanCombinedTableData.schemes.filter(s => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(scheme => scheme.value === s)).reduce((schemeSum, s) => schemeSum + ((vidhanCombinedTableData.data[vidhan] && vidhanCombinedTableData.data[vidhan][s] && vidhanCombinedTableData.data[vidhan][s].quantity) || 0), 0), 0)).toFixed(2)}</td>
                                        <td className="text-end">
                                          {formatCurrency(vidhanCombinedTableData.vidhans
                                            .filter(vidhan => selectedVidhanSabhas.length === 0 || selectedVidhanSabhas.some(v => v.value === vidhan))
                                            .reduce((sum, vidhan) => sum + vidhanCombinedTableData.schemes.filter(s => selectedVidhanSchemes.length === 0 || selectedVidhanSchemes.some(scheme => scheme.value === s)).reduce((schemeSum, s) => schemeSum + ((vidhanCombinedTableData.data[vidhan] && vidhanCombinedTableData.data[vidhan][s] && vidhanCombinedTableData.data[vidhan][s][selectedRashi]) || 0), 0), 0))}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              ) : (
                                <div className="no-data-message">कोई डेटा उपलब्ध नहीं</div>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                        </div>
                      </Collapse>
                    </Card>


                    {/* Row 2.5: उपनिवेश - योजना सब्सिडी तुलना */}
                    <Card className="chart-card mb-4">
                      <Card.Header 
                        onClick={() => toggleCollapse('subInvestment')} 
                        style={{cursor: 'pointer'}} 
                        className="chart-card-header bg-primary-gradient"
                      >
                        <h6 className="mb-0 text-white">
                          <FaChartPie className="me-2" />
                          उपनिवेश - योजना सब्सिडी तुलना
                          <span className="float-end">
                            {openCollapses.includes('subInvestment') ? '▼' : '▶'}
                          </span>
                        </h6>
                      </Card.Header>
                       <Collapse in={openCollapses.includes('subInvestment')}>
                        <div>
                      <Card.Body>
                        {/* Sub-investment and Scheme Filters */}
                        <div className="mb-3 d-flex gap-3 flex-wrap">
                          <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                            <Form.Label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                              <FaFilter className="me-1" /> उपनिवेश:
                            </Form.Label>
                            <div className="d-flex gap-2 mb-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  const allSubInvestments = subCombinedTableData.subInvestments.map(subInv => ({
                                    value: subInv,
                                    label: subInv
                                  }));
                                  setSelectedSubInvestments(allSubInvestments);
                                }}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                सभी चुनें
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setSelectedSubInvestments([])}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                साफ़ करें
                              </Button>
                            </div>
                            <Select
                              isMulti
                              options={subCombinedTableData.subInvestments.map(subInv => ({
                                value: subInv,
                                label: subInv
                              }))}
                              value={selectedSubInvestments}
                              onChange={setSelectedSubInvestments}
                              placeholder="सभी उपनिवेश"
                              styles={customSelectStyles}
                              closeMenuOnSelect={false}
                              isClearable
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                            <Form.Label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                              <FaFilter className="me-1" /> योजनाएं:
                            </Form.Label>
                            <div className="d-flex gap-2 mb-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  const allSchemes = subCombinedTableData.schemes.map(scheme => ({
                                    value: scheme,
                                    label: scheme
                                  }));
                                  setSelectedSubInvestmentSchemes(allSchemes);
                                }}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                सभी चुनें
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setSelectedSubInvestmentSchemes([])}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                साफ़ करें
                              </Button>
                            </div>
                            <Select
                              isMulti
                              options={subCombinedTableData.schemes.map(scheme => ({
                                value: scheme,
                                label: scheme
                              }))}
                              value={selectedSubInvestmentSchemes}
                              onChange={setSelectedSubInvestmentSchemes}
                              placeholder="सभी योजनाएं"
                              styles={customSelectStyles}
                              closeMenuOnSelect={false}
                              isClearable
                            />
                          </div>
                        </div>

                        <Row>
                          <Col lg={12} md={12}>
                            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                              {subCombinedTableData.subInvestments.length > 0 ? (
                                <div className="table-responsive">
                                  <table className="table table-sm table-striped mb-0" style={{ fontSize: '0.75rem', minWidth: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#ffc107', color: 'black' }} >
                                      <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th style={{ minWidth: '120px' }}>उपनिवेश</th>
                                        {subCombinedTableData.schemes
                                          .filter(scheme => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(s => s.value === scheme))
                                          .map(scheme => (
                                          <th key={scheme} className="text-center" colSpan={2} style={{ minWidth: '160px' }}>{scheme}</th>
                                        ))}
                                        <th className="text-center" colSpan={2} style={{ minWidth: '160px' }}>कुल</th>
                                      </tr>
                                      <tr>
                                        <th style={{ width: '40px' }}></th>
                                        <th></th>
                                        {subCombinedTableData.schemes
                                          .filter(scheme => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(s => s.value === scheme))
                                          .map(scheme => (
                                          <>
                                            <th key={scheme + '_qty'} className="text-end" style={{ minWidth: '80px' }}>आवंटित मात्रा</th>
                                            <th key={scheme + '_sub'} className="text-end" style={{ minWidth: '80px' }}>{rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>
                                          </>
                                        ))}
                                        <th className="text-end" style={{ minWidth: '80px' }}>आवंटित मात्रा</th>
                                        <th className="text-end" style={{ minWidth: '80px' }}>कुल {rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {subCombinedTableData.subInvestments
                                        .filter(subInvestment => selectedSubInvestments.length === 0 || selectedSubInvestments.some(s => s.value === subInvestment))
                                        .map((subInvestment, idx) => (
                                        <tr key={subInvestment}>
                                          <td>{idx + 1}</td>
                                          <td style={{ whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={subInvestment}>
                                            {subInvestment}
                                          </td>
                                          {subCombinedTableData.schemes
                                            .filter(scheme => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(s => s.value === scheme))
                                            .map(scheme => (
                                            <>
                                              <td key={scheme + '_qty'} className="text-end">{((subCombinedTableData.data[subInvestment][scheme] && subCombinedTableData.data[subInvestment][scheme].quantity) || 0).toFixed(2)}</td>
                                              <td key={scheme + '_sub'} className="text-end">{formatCurrency((subCombinedTableData.data[subInvestment][scheme] && subCombinedTableData.data[subInvestment][scheme][selectedRashi]) || 0)}</td>
                                            </>
                                          ))}
                                          <td className="text-end">{(subCombinedTableData.schemes
                                            .filter(scheme => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(s => s.value === scheme))
                                            .reduce((sum, scheme) => sum + ((subCombinedTableData.data[subInvestment][scheme] && subCombinedTableData.data[subInvestment][scheme].quantity) || 0), 0)).toFixed(2)}</td>
                                          <td className="text-end font-weight-bold">
                                            {formatCurrency(subCombinedTableData.schemes
                                              .filter(scheme => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(s => s.value === scheme))
                                              .reduce((sum, scheme) => sum + ((subCombinedTableData.data[subInvestment][scheme] && subCombinedTableData.data[subInvestment][scheme][selectedRashi]) || 0), 0))}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr style={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>
                                        <td colSpan={2}>कुल</td>
                                        {subCombinedTableData.schemes
                                          .filter(scheme => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(s => s.value === scheme))
                                          .map(scheme => (
                                          <>
                                            <td key={scheme + '_qty_foot'} className="text-end">{(subCombinedTableData.subInvestments
                                              .filter(subInvestment => selectedSubInvestments.length === 0 || selectedSubInvestments.some(s => s.value === subInvestment))
                                              .reduce((sum, subInv) => sum + ((subCombinedTableData.data[subInv][scheme] && subCombinedTableData.data[subInv][scheme].quantity) || 0), 0)).toFixed(2)}</td>
                                            <td key={scheme + '_sub_foot'} className="text-end">{formatCurrency(subCombinedTableData.subInvestments
                                              .filter(subInvestment => selectedSubInvestments.length === 0 || selectedSubInvestments.some(s => s.value === subInvestment))
                                              .reduce((sum, subInv) => sum + ((subCombinedTableData.data[subInv][scheme] && subCombinedTableData.data[subInv][scheme][selectedRashi]) || 0), 0))}</td>
                                          </>
                                        ))}
                                        <td className="text-end">{(subCombinedTableData.subInvestments
                                          .filter(subInvestment => selectedSubInvestments.length === 0 || selectedSubInvestments.some(s => s.value === subInvestment))
                                          .reduce((sum, subInv) => sum + subCombinedTableData.schemes.filter(s => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(scheme => scheme.value === s)).reduce((schemeSum, s) => schemeSum + ((subCombinedTableData.data[subInv] && subCombinedTableData.data[subInv][s] && subCombinedTableData.data[subInv][s].quantity) || 0), 0), 0)).toFixed(2)}</td>
                                        <td className="text-end">
                                          {formatCurrency(subCombinedTableData.subInvestments
                                            .filter(subInvestment => selectedSubInvestments.length === 0 || selectedSubInvestments.some(s => s.value === subInvestment))
                                            .reduce((sum, subInv) => sum + subCombinedTableData.schemes.filter(s => selectedSubInvestmentSchemes.length === 0 || selectedSubInvestmentSchemes.some(scheme => scheme.value === s)).reduce((schemeSum, s) => schemeSum + ((subCombinedTableData.data[subInv] && subCombinedTableData.data[subInv][s] && subCombinedTableData.data[subInv][s][selectedRashi]) || 0), 0), 0))}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              ) : (
                                <div className="no-data-message">कोई डेटा उपलब्ध नहीं</div>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                        </div>
                      </Collapse>
                    </Card>



                    {/* Row 3: निवेश - योजना सब्सिडी तुलना */}
                    <Card className="chart-card mb-4">
                      <Card.Header 
                        onClick={() => toggleCollapse('investmentCombined')} 
                        style={{cursor: 'pointer'}} 
                        className="chart-card-header bg-primary-gradient"
                      >
                        <h6 className="mb-0 text-white">
                          <FaChartPie className="me-2" />
                          निवेश - योजना सब्सिडी तुलना
                          <span className="float-end">
                            {openCollapses.includes('investmentCombined') ? '▼' : '▶'}
                          </span>
                        </h6>
                      </Card.Header>
                       <Collapse in={openCollapses.includes('investmentCombined')}>
                        <div>
                      <Card.Body>
                        {/* Investment and Scheme Filters */}
                        <div className="mb-3 d-flex gap-3 flex-wrap">
                          <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                            <Form.Label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                              <FaFilter className="me-1" /> निवेश:
                            </Form.Label>
                            <div className="d-flex gap-2 mb-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  const allInvestments = combinedTableData.investments.map(inv => ({
                                    value: inv,
                                    label: inv
                                  }));
                                  setSelectedMainInvestments(allInvestments);
                                }}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                सभी चुनें
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setSelectedMainInvestments([])}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                साफ़ करें
                              </Button>
                            </div>
                            <Select
                              isMulti
                              options={combinedTableData.investments.map(inv => ({
                                value: inv,
                                label: inv
                              }))}
                              value={selectedMainInvestments}
                              onChange={setSelectedMainInvestments}
                              placeholder="सभी निवेश"
                              styles={customSelectStyles}
                              closeMenuOnSelect={false}
                              isClearable
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: '200px', maxWidth: '300px' }}>
                            <Form.Label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                              <FaFilter className="me-1" /> योजनाएं:
                            </Form.Label>
                            <div className="d-flex gap-2 mb-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                  const allSchemes = combinedTableData.schemes.map(scheme => ({
                                    value: scheme,
                                    label: scheme
                                  }));
                                  setSelectedMainInvestmentSchemes(allSchemes);
                                }}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                सभी चुनें
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => setSelectedMainInvestmentSchemes([])}
                                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                              >
                                साफ़ करें
                              </Button>
                            </div>
                            <Select
                              isMulti
                              options={combinedTableData.schemes.map(scheme => ({
                                value: scheme,
                                label: scheme
                              }))}
                              value={selectedMainInvestmentSchemes}
                              onChange={setSelectedMainInvestmentSchemes}
                              placeholder="सभी योजनाएं"
                              styles={customSelectStyles}
                              closeMenuOnSelect={false}
                              isClearable
                            />
                          </div>
                        </div>

                        <Row>
                          <Col lg={12} md={12}>
                            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                              {combinedTableData.investments.length > 0 ? (
                                <div className="table-responsive">
                                  <table className="table table-sm table-striped mb-0" style={{ fontSize: '0.75rem', minWidth: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#6f42c1', color: 'white' }}>
                                      <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th style={{ minWidth: '120px' }}>निवेश</th>
                                        {combinedTableData.schemes
                                          .filter(scheme => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(s => s.value === scheme))
                                          .map(scheme => (
                                          <th key={scheme} className="text-center" colSpan={2} style={{ minWidth: '160px' }}>{scheme}</th>
                                        ))}
                                        <th className="text-center" colSpan={2} style={{ minWidth: '160px' }}>कुल</th>
                                      </tr>
                                      <tr>
                                        <th style={{ width: '40px' }}></th>
                                        <th></th>
                                        {combinedTableData.schemes
                                          .filter(scheme => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(s => s.value === scheme))
                                          .map(scheme => (
                                          <>
                                            <th key={scheme + '_qty'} className="text-end" style={{ minWidth: '80px' }}>आवंटित मात्रा</th>
                                            <th key={scheme + '_sub'} className="text-end" style={{ minWidth: '80px' }}>{rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>
                                          </>
                                        ))}
                                        <th className="text-end" style={{ minWidth: '80px' }}>आवंटित मात्रा</th>
                                        <th className="text-end" style={{ minWidth: '80px' }}>कुल {rashiOptions.find(opt => opt.value === selectedRashi)?.label}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {combinedTableData.investments
                                        .filter(investment => selectedMainInvestments.length === 0 || selectedMainInvestments.some(s => s.value === investment))
                                        .map((investment, idx) => (
                                        <tr key={investment}>
                                          <td>{idx + 1}</td>
                                          <td style={{ whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={investment}>
                                            {investment}
                                          </td>
                                          {combinedTableData.schemes
                                            .filter(scheme => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(s => s.value === scheme))
                                            .map(scheme => (
                                            <>
                                              <td key={scheme + '_qty'} className="text-end">{((combinedTableData.data[investment][scheme] && combinedTableData.data[investment][scheme].quantity) || 0).toFixed(2)}</td>
                                              <td key={scheme + '_sub'} className="text-end">{formatCurrency((combinedTableData.data[investment][scheme] && combinedTableData.data[investment][scheme][selectedRashi]) || 0)}</td>
                                            </>
                                          ))}
                                          <td className="text-end">{(combinedTableData.schemes
                                            .filter(scheme => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(s => s.value === scheme))
                                            .reduce((sum, scheme) => sum + ((combinedTableData.data[investment][scheme] && combinedTableData.data[investment][scheme].quantity) || 0), 0)).toFixed(2)}</td>
                                          <td className="text-end font-weight-bold">
                                            {formatCurrency(combinedTableData.schemes
                                              .filter(scheme => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(s => s.value === scheme))
                                              .reduce((sum, scheme) => sum + ((combinedTableData.data[investment][scheme] && combinedTableData.data[investment][scheme][selectedRashi]) || 0), 0))}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr style={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>
                                        <td colSpan={2}>कुल</td>
                                        {combinedTableData.schemes
                                          .filter(scheme => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(s => s.value === scheme))
                                          .map(scheme => (
                                          <>
                                            <td key={scheme + '_qty_foot'} className="text-end">{(combinedTableData.investments
                                              .filter(investment => selectedMainInvestments.length === 0 || selectedMainInvestments.some(s => s.value === investment))
                                              .reduce((sum, inv) => sum + ((combinedTableData.data[inv][scheme] && combinedTableData.data[inv][scheme].quantity) || 0), 0)).toFixed(2)}</td>
                                            <td key={scheme + '_sub_foot'} className="text-end">{formatCurrency(combinedTableData.investments
                                              .filter(investment => selectedMainInvestments.length === 0 || selectedMainInvestments.some(s => s.value === investment))
                                              .reduce((sum, inv) => sum + ((combinedTableData.data[inv][scheme] && combinedTableData.data[inv][scheme][selectedRashi]) || 0), 0))}</td>
                                          </>
                                        ))}
                                        <td className="text-end">{(combinedTableData.investments
                                          .filter(investment => selectedMainInvestments.length === 0 || selectedMainInvestments.some(s => s.value === investment))
                                          .reduce((sum, inv) => sum + combinedTableData.schemes.filter(s => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(scheme => scheme.value === s)).reduce((schemeSum, s) => schemeSum + ((combinedTableData.data[inv] && combinedTableData.data[inv][s] && combinedTableData.data[inv][s].quantity) || 0), 0), 0)).toFixed(2)}</td>
                                        <td className="text-end">
                                          {formatCurrency(combinedTableData.investments
                                            .filter(investment => selectedMainInvestments.length === 0 || selectedMainInvestments.some(s => s.value === investment))
                                            .reduce((sum, inv) => sum + combinedTableData.schemes.filter(s => selectedMainInvestmentSchemes.length === 0 || selectedMainInvestmentSchemes.some(scheme => scheme.value === s)).reduce((schemeSum, s) => schemeSum + ((combinedTableData.data[inv] && combinedTableData.data[inv][s] && combinedTableData.data[inv][s][selectedRashi]) || 0), 0), 0))}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              ) : (
                                <div className="no-data-message">कोई डेटा उपलब्ध नहीं</div>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                        </div>
                      </Collapse>
                    </Card>
                    </div>
                  </>
                )}
              </>
            )}
          </Container>
        </div>
      </div>
      <Footer />

      {/* Excel Preview Modal */}
      <Modal show={showExcelPreview} onHide={() => setShowExcelPreview(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>एक्सेल प्रिव्यू - {excelPreviewData?.filename}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {excelPreviewData && (
            <div>
              {Object.entries(excelPreviewData.sheets).map(([sheetName, rows]) => (
                <div key={sheetName} className="mb-4">
                  <h6 style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                    📄 {sheetName}
                  </h6>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse', 
                      fontSize: '0.85rem',
                      border: '1px solid #ddd'
                    }}>
                      <tbody>
                        {rows.slice(0, 50).map((row, rowIdx) => (
                          <tr key={`${sheetName}-row-${rowIdx}`} style={{ 
                            backgroundColor: rowIdx === 0 ? '#194e8b' : (rowIdx % 2 === 0 ? '#ffffff' : '#f8f9fa'),
                            borderBottom: '1px solid #ddd'
                          }}>
                            {row.map((cell, cellIdx) => (
                              <td 
                                key={`${sheetName}-cell-${rowIdx}-${cellIdx}`}
                                style={{ 
                                  padding: '8px', 
                                  border: '1px solid #ddd',
                                  color: rowIdx === 0 ? 'white' : 'black',
                                  fontWeight: rowIdx === 0 ? 'bold' : 'normal'
                                }}
                              >
                                {cell !== null && cell !== undefined ? String(cell) : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {rows.length > 50 && (
                    <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '10px' }}>
                      ... और भी {rows.length - 50} पंक्तियाँ हैं। डाउनलोड करने के लिए "डाउनलोड" बटन का उपयोग करें।
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="success" 
            onClick={() => {
              setShowExcelPreview(false);
              generateExcel('download');
            }}
          >
            <FaDownload className="me-2" />
            डाउनलोड
          </Button>
          <Button variant="secondary" onClick={() => setShowExcelPreview(false)}>
            बंद करें
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Dashboard;