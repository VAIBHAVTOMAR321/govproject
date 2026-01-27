import React, { useState, useEffect, useMemo, useRef } from "react";
import { Container, Spinner, Alert, Row, Col, Card, Form, Button, Modal, Dropdown, ButtonGroup } from "react-bootstrap";
import Select from "react-select";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import "../../assets/css/dashboard.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import Footer from "../footer/Footer";
import { FaClipboardList, FaRupeeSign, FaHandHoldingUsd, FaChartLine, FaCalendarAlt, FaFilter, FaChartBar, FaChartPie, FaFilePdf, FaFileExcel, FaDownload, FaEye } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// Hindi translations
const translations = {
  home: "होम",
  welcomeMessage: "DHO कोटद्वार बिलिंग प्रणाली में आपका स्वागत है",
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

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Date filter states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);
  
  // Filter states - now arrays for multiple selection
  const [selectedSchemes, setSelectedSchemes] = useState([]);
  const [selectedInvestments, setSelectedInvestments] = useState([]);

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

  // Format number to Indian currency format
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(num);
  };

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
          subsidy: 0
        };
      }
      investmentData[investment].subsidy += parseFloat(item.amount_of_subsidy) || 0;
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

    const totals = {};
    investments.forEach(inv => {
      totals[inv] = schemes.reduce((sum, sch) => sum + (investmentSchemeData[inv][sch] || 0), 0);
    });
    const grandTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);

    return { investments, schemes, data: investmentSchemeData, totals, grandTotal };
  }, [filteredData]);

  // Sub-investment table data (Sub-investment-wise Scheme breakdown)
  const subCombinedTableData = useMemo(() => {
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
    const grandTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);

    return { subInvestments, schemes, data, totals, grandTotal };
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
    const { schemeWise, investmentWise } = getReportData();
    const { investments, schemes, data, totals, grandTotal } = getCombinedData();
    const { subInvestments, schemes: subSchemes, data: subData, totals: subTotals, grandTotal: subGrandTotal } = getSubCombinedData();
    const mainInvestmentSubsidy = getMainInvestmentSubsidyData();
    const currentDate = new Date().toLocaleDateString('hi-IN');
    
    // Create HTML content for PDF
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

        <!-- Scheme-wise Section -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h2 style="color: #28a745; font-size: 16px; border-bottom: 2px solid #28a745; padding-bottom: 5px; margin-bottom: 10px;">योजना-वार विवरण</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #28a745, #34ce57);">
                <th style="border: 1px solid #ddd; padding: 8px; color: white; text-align: left;">योजना</th>
                <th style="border: 1px solid #ddd; padding: 8px; color: white; text-align: center;">रिकॉर्ड</th>
                <th style="border: 1px solid #ddd; padding: 8px; color: white; text-align: center;">मात्रा</th>
                <th style="border: 1px solid #ddd; padding: 8px; color: white; text-align: center;">किसान हिस्सेदारी</th>
                <th style="border: 1px solid #ddd; padding: 8px; color: white; text-align: center;">सब्सिडी</th>
                <th style="border: 1px solid #ddd; padding: 8px; color: white; text-align: center;">कुल राशि</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(schemeWise).map(([name, data], idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                  <td style="border: 1px solid #ddd; padding: 8px; font-weight: 500;">${name}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${data.count}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${data.quantity.toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">₹${data.farmerShare.toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">₹${data.subsidy.toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">₹${data.total.toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Investment-wise Section -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h2 style="color: #6610f2; font-size: 16px; border-bottom: 2px solid #6610f2; padding-bottom: 5px; margin-bottom: 10px;">उपनिवेश-वार विवरण</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #6610f2, #8540f5);">
                <th style="border: 1px solid #ddd; padding: 6px; color: white; text-align: left;">उपनिवेश</th>
                <th style="border: 1px solid #ddd; padding: 6px; color: white; text-align: center;">रिकॉर्ड</th>
                <th style="border: 1px solid #ddd; padding: 6px; color: white; text-align: center;">मात्रा</th>
                <th style="border: 1px solid #ddd; padding: 6px; color: white; text-align: center;">किसान हिस्सेदारी</th>
                <th style="border: 1px solid #ddd; padding: 6px; color: white; text-align: center;">सब्सिडी</th>
                <th style="border: 1px solid #ddd; padding: 6px; color: white; text-align: center;">कुल राशि</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(investmentWise)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([name, data], idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                  <td style="border: 1px solid #ddd; padding: 6px; font-size: 8px;">${name}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${data.count}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${data.quantity.toFixed(2)}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">₹${data.farmerShare.toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">₹${data.subsidy.toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: bold;">₹${data.total.toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Sub-investment Scheme Section -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h2 style="color: #ffc107; font-size: 16px; border-bottom: 2px solid #ffc107; padding-bottom: 5px; margin-bottom: 10px;">उपनिवेश - योजना सब्सिडी तुलना</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 8px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #ffc107, #ffca2c);">
                <th style="border: 1px solid #ddd; padding: 4px; color: black; text-align: left;">उपनिवेश</th>
                ${subSchemes.map(scheme => `<th style="border: 1px solid #ddd; padding: 4px; color: black; text-align: center;">${scheme}</th>`).join('')}
                <th style="border: 1px solid #ddd; padding: 4px; color: black; text-align: center;">कुल</th>
              </tr>
            </thead>
            <tbody>
              ${subInvestments.map(subInvestment => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 4px; font-weight: 500;">${subInvestment}</td>
                  ${subSchemes.map(scheme => `<td style="border: 1px solid #ddd; padding: 4px; text-align: center;">₹${(subData[subInvestment][scheme] || 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>`).join('')}
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-weight: bold;">₹${subTotals[subInvestment].toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight: 700; background-color: #f1f5f9;">
                <td style="border: 1px solid #ddd; padding: 4px; font-weight: bold;">कुल</td>
                ${subSchemes.map(scheme => `<td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-weight: bold;">₹${subInvestments.reduce((sum, subInv) => sum + (subData[subInv][scheme] || 0), 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>`).join('')}
                <td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-weight: bold;">₹${subGrandTotal.toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Main Investment Subsidy Section -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h2 style="color: #17a2b8; font-size: 16px; border-bottom: 2px solid #17a2b8; padding-bottom: 5px; margin-bottom: 10px;">निवेश के अनुसार सब्सिडी राशि</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #17a2b8, #20c997);">
                <th style="border: 1px solid #ddd; padding: 6px; color: white; text-align: left;">निवेश</th>
                <th style="border: 1px solid #ddd; padding: 6px; color: white; text-align: center;">रिकॉर्ड</th>
                <th style="border: 1px solid #ddd; padding: 6px; color: white; text-align: center;">सब्सिडी राशि</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(mainInvestmentSubsidy)
                .sort((a, b) => b[1].subsidy - a[1].subsidy)
                .map(([name, data], idx) => `
                <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
                  <td style="border: 1px solid #ddd; padding: 6px; font-size: 8px;">${name}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center;">${data.count}</td>
                  <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: bold;">₹${data.subsidy.toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight: 700; background-color: #f1f5f9;">
                <td style="border: 1px solid #ddd; padding: 6px; font-weight: bold;">कुल</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: bold;">${Object.values(mainInvestmentSubsidy).reduce((sum, data) => sum + data.count, 0)}</td>
                <td style="border: 1px solid #ddd; padding: 6px; text-align: center; font-weight: bold;">₹${Object.values(mainInvestmentSubsidy).reduce((sum, data) => sum + data.subsidy, 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Combined Investment-Scheme Section -->
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h2 style="color: #6f42c1; font-size: 16px; border-bottom: 2px solid #6f42c1; padding-bottom: 5px; margin-bottom: 10px;">निवेश - योजना सब्सिडी तुलना</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 8px;">
            <thead>
              <tr style="background: linear-gradient(135deg, #6f42c1, #8540f5);">
                <th style="border: 1px solid #ddd; padding: 4px; color: white; text-align: left;">निवेश</th>
                ${schemes.map(scheme => `<th style="border: 1px solid #ddd; padding: 4px; color: white; text-align: center;">${scheme}</th>`).join('')}
                <th style="border: 1px solid #ddd; padding: 4px; color: white; text-align: center;">कुल</th>
              </tr>
            </thead>
            <tbody>
              ${investments.map(investment => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 4px; font-weight: 500;">${investment}</td>
                  ${schemes.map(scheme => `<td style="border: 1px solid #ddd; padding: 4px; text-align: center;">₹${(data[investment][scheme] || 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>`).join('')}
                  <td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-weight: bold;">₹${totals[investment].toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="font-weight: 700; background-color: #f1f5f9;">
                <td style="border: 1px solid #ddd; padding: 4px; font-weight: bold;">कुल</td>
                ${schemes.map(scheme => `<td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-weight: bold;">₹${investments.reduce((sum, inv) => sum + (data[inv][scheme] || 0), 0).toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>`).join('')}
                <td style="border: 1px solid #ddd; padding: 4px; text-align: center; font-weight: bold;">₹${grandTotal.toLocaleString('hi-IN', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>

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

    // Scheme-wise Sheet
    const schemeHeaders = ['योजना', 'रिकॉर्ड संख्या', 'आवंटित मात्रा', 'किसान हिस्सेदारी', 'सब्सिडी', 'कुल राशि'];
    const schemeRows = Object.entries(schemeWise).map(([name, data]) => [
      name, data.count, data.quantity.toFixed(2), data.farmerShare.toFixed(2), data.subsidy.toFixed(2), data.total.toFixed(2)
    ]);
    const schemeWs = XLSX.utils.aoa_to_sheet([schemeHeaders, ...schemeRows]);
    schemeWs['!cols'] = [{ wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, schemeWs, 'योजना-वार');

    // Investment-wise Sheet
    const investmentHeaders = ['उपनिवेश', 'रिकॉर्ड संख्या', 'आवंटित मात्रा', 'किसान हिस्सेदारी', 'सब्सिडी', 'कुल राशि'];
    const investmentRows = Object.entries(investmentWise)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([name, data]) => [
        name, data.count, data.quantity.toFixed(2), data.farmerShare.toFixed(2), data.subsidy.toFixed(2), data.total.toFixed(2)
      ]);
    const investmentWs = XLSX.utils.aoa_to_sheet([investmentHeaders, ...investmentRows]);
    investmentWs['!cols'] = [{ wch: 35 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, investmentWs, 'उपनिवेश-वार');

    // Sub-investment Scheme Sheet
    const subCombinedHeaders = ['उपनिवेश', ...subSchemes, 'कुल'];
    const subCombinedRows = subInvestments.map(subInvestment => [
      subInvestment,
      ...subSchemes.map(scheme => (subData[subInvestment][scheme] || 0).toFixed(2)),
      subTotals[subInvestment].toFixed(2)
    ]);
    // Add total row
    subCombinedRows.push([
      'कुल',
      ...subSchemes.map(scheme => subInvestments.reduce((sum, subInv) => sum + (subData[subInv][scheme] || 0), 0).toFixed(2)),
      subGrandTotal.toFixed(2)
    ]);
    const subCombinedWs = XLSX.utils.aoa_to_sheet([subCombinedHeaders, ...subCombinedRows]);
    subCombinedWs['!cols'] = [{ wch: 30 }, ...subSchemes.map(() => ({ wch: 15 })), { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, subCombinedWs, 'उपनिवेश - योजना सब्सिडी');

    // Main Investment Subsidy Sheet
    const mainInvestmentHeaders = ['निवेश', 'रिकॉर्ड संख्या', 'सब्सिडी राशि'];
    const mainInvestmentRows = Object.entries(mainInvestmentSubsidy)
      .sort((a, b) => b[1].subsidy - a[1].subsidy)
      .map(([name, data]) => [
        name, data.count, data.subsidy.toFixed(2)
      ]);
    // Add total row
    const totalCount = Object.values(mainInvestmentSubsidy).reduce((sum, data) => sum + data.count, 0);
    const totalSubsidy = Object.values(mainInvestmentSubsidy).reduce((sum, data) => sum + data.subsidy, 0);
    mainInvestmentRows.push(['कुल', totalCount, totalSubsidy.toFixed(2)]);
    const mainInvestmentWs = XLSX.utils.aoa_to_sheet([mainInvestmentHeaders, ...mainInvestmentRows]);
    mainInvestmentWs['!cols'] = [{ wch: 35 }, { wch: 12 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, mainInvestmentWs, 'निवेश सब्सिडी');

    // Combined Investment-Scheme Sheet
    const combinedHeaders = ['निवेश', ...schemes, 'कुल'];
    const combinedRows = investments.map(investment => [
      investment,
      ...schemes.map(scheme => (data[investment][scheme] || 0).toFixed(2)),
      totals[investment].toFixed(2)
    ]);
    // Add total row
    combinedRows.push([
      'कुल',
      ...schemes.map(scheme => investments.reduce((sum, inv) => sum + (data[inv][scheme] || 0), 0).toFixed(2)),
      grandTotal.toFixed(2)
    ]);
    const combinedWs = XLSX.utils.aoa_to_sheet([combinedHeaders, ...combinedRows]);
    combinedWs['!cols'] = [{ wch: 30 }, ...schemes.map(() => ({ wch: 15 })), { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, combinedWs, 'निवेश - योजना सब्सिडी');

    // Detailed Data Sheet
    const detailHeaders = ['क्र.सं.', 'योजना', 'उपनिवेश', 'निवेश', 'बिल तिथि', 'आवंटित मात्रा', 'किसान हिस्सेदारी', 'सब्सिडी', 'कुल राशि'];
    const detailRows = filteredData.map((item, idx) => [
      idx + 1,
      item.scheme_name || '',
      item.sub_investment_name || '',
      item.investment_name || '',
      item.bill_date || '',
      parseFloat(item.allocated_quantity) || 0,
      parseFloat(item.amount_of_farmer_share) || 0,
      parseFloat(item.amount_of_subsidy) || 0,
      parseFloat(item.total_amount) || 0
    ]);
    const detailWs = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailRows]);
    detailWs['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 30 }, { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, detailWs, 'विस्तृत डेटा');

    if (action === 'download') {
      XLSX.writeFile(wb, `DHO_रिपोर्ट_${currentDate.replace(/\//g, '-')}.xlsx`);
    } else {
      // For view, download and open
      XLSX.writeFile(wb, `DHO_रिपोर्ट_${currentDate.replace(/\//g, '-')}.xlsx`);
      alert('एक्सेल फ़ाइल डाउनलोड हो गई है। कृपया इसे खोलें।');
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

          <Container fluid className="dashboard-body">
            {/* Welcome Section */}
            <div className="home-welcome-section text-center mb-4">
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
                              variant="primary" 
                              size="sm"
                              onClick={handleApplyDateFilter}
                              disabled={!startDate && !endDate}
                              className="apply-filter-btn-sm"
                            >
                              <FaFilter className="me-1" />
                              {translations.applyFilter}
                            </Button>
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={handleClearDateFilter}
                              disabled={!isDateFilterApplied && !startDate && !endDate}
                              className="clear-filter-btn-sm"
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
                    <div className="graphs-section-title mb-3">
                      <h4 className="text-primary">
                        <FaChartBar className="me-2" />
                        डेटा विश्लेषण ग्राफ़
                      </h4>
                      <p className="text-muted small mb-0">चयनित फ़िल्टर के आधार पर ग्राफ़ प्रदर्शित</p>
                    </div>

                    {/* Row 1: Scheme-wise Charts */}
                    <Row className="mb-4">
                      <Col lg={7} md={12} className="mb-3">
                        <Card className="chart-card h-100">
                          <Card.Header className="chart-card-header">
                            <h6 className="mb-0">
                              <FaChartBar className="me-2" />
                              {translations.graphsByScheme} - {translations.amountComparison}
                            </h6>
                          </Card.Header>
                          <Card.Body>
                            <div className="chart-container" style={{ height: '280px' }}>
                              {schemeChartData.bar.labels.length > 0 ? (
                                <Bar data={schemeChartData.bar} options={barChartOptions} />
                              ) : (
                                <div className="no-data-message">कोई डेटा उपलब्ध नहीं</div>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col lg={5} md={12} className="mb-3">
                        <Card className="chart-card h-100">
                          <Card.Header className="chart-card-header">
                            <h6 className="mb-0">
                              <FaChartPie className="me-2" />
                              {translations.schemeWiseDistribution}
                            </h6>
                          </Card.Header>
                          <Card.Body>
                            <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                              {schemeChartData.pie.labels.length > 0 ? (
                                <div className="table-responsive">
                                  <table className="table table-sm table-striped mb-0" style={{ fontSize: '0.85rem' }}>
                                    <thead style={{ backgroundColor: '#194e8b', color: 'white' }}>
                                      <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th>योजना</th>
                                        <th className="text-end">सब्सिडी</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {schemeChartData.pie.labels.map((label, idx) => {
                                        const subsidy = (schemeChartData.rawData && schemeChartData.rawData[label] && schemeChartData.rawData[label].subsidy) || 0;
                                        return (
                                          <tr key={label}>
                                            <td>{idx + 1}</td>
                                            <td style={{ whiteSpace: 'nowrap', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</td>
                                            <td className="text-end">{formatCurrency(subsidy)}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                    <tfoot>
                                      <tr style={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>
                                        <td colSpan={2}>कुल</td>
                                        <td className="text-end">
                                          {formatCurrency(Object.values(schemeChartData.rawData || {}).reduce((s, v) => s + ((v && v.subsidy) || 0), 0))}
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
                        </Card>
                      </Col>
                    </Row>

                    {/* Row 2: उपनिवेश (Investment) - Pie Chart with Table */}
                    <Card className="chart-card mb-4">
                      <Card.Header className="chart-card-header bg-success-gradient">
                        <h6 className="mb-0 text-white">
                          <FaChartPie className="me-2" />
                          {translations.graphsByInvestment} - {translations.amountComparison}
                          <span className="badge bg-light text-dark ms-2" style={{fontSize: '0.7rem'}}>
                            {investmentChartData.itemCount} उपनिवेश
                          </span>
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col lg={6} md={12} className="mb-3">
                            <div className="chart-container" style={{ height: '450px' }}>
                              {investmentChartData.doughnut.labels.length > 0 ? (
                                <Pie data={investmentChartData.doughnut} options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      display: false
                                    },
                                    tooltip: {
                                      callbacks: {
                                        title: (context) => {
                                          return investmentChartData.doughnut.fullLabels[context[0].dataIndex];
                                        },
                                        label: (context) => {
                                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                          const percentage = ((context.raw / total) * 100).toFixed(1);
                                          return `कुल राशि: ${formatCurrency(context.raw)} (${percentage}%)`;
                                        }
                                      }
                                    }
                                  }
                                }} />
                              ) : (
                                <div className="no-data-message">कोई डेटा उपलब्ध नहीं</div>
                              )}
                            </div>
                          </Col>
                          <Col lg={6} md={12}>
                            <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                              {investmentChartData.doughnut && investmentChartData.doughnut.fullLabels && investmentChartData.doughnut.fullLabels.length > 0 ? (
                                <div className="table-responsive">
                                  <table className="table table-sm table-striped mb-0" style={{ fontSize: '0.85rem' }}>
                                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#28a745', color: 'white' }}>
                                      <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th>उपनिवेश नाम</th>
                                        <th className="text-end">कुल राशि</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {investmentChartData.doughnut.fullLabels.map((label, idx) => {
                                        const total = (investmentChartData.rawData && investmentChartData.rawData[label] && investmentChartData.rawData[label].total) || 0;
                                        return (
                                          <tr key={label}>
                                            <td>{idx + 1}</td>
                                            <td title={label} style={{ fontSize: '0.85rem' }}>{label}</td>
                                            <td className="text-end">{formatCurrency(total)}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                    <tfoot>
                                      <tr style={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>
                                        <td colSpan={2}>कुल</td>
                                        <td className="text-end">
                                          {formatCurrency(Object.values(investmentChartData.rawData || {}).reduce((s, v) => s + ((v && v.total) || 0), 0))}
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
                    </Card>

                    {/* Row 2.5: उपनिवेश - योजना सब्सिडी तुलना */}
                    <Card className="chart-card mb-4">
                      <Card.Header className="chart-card-header bg-warning-gradient">
                        <h6 className="mb-0 text-white">
                          <FaChartPie className="me-2" />
                          उपनिवेश - योजना सब्सिडी तुलना
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col lg={6} md={12} className="mb-3">
                            <div className="chart-container" style={{ height: '400px' }}>
                              {subCombinedTableData.subInvestments.length > 0 ? (
                                <Pie
                                  data={{
                                    labels: subCombinedTableData.subInvestments,
                                    datasets: [{
                                      data: subCombinedTableData.subInvestments.map(subInv => subCombinedTableData.totals[subInv]),
                                      backgroundColor: subCombinedTableData.subInvestments.map((_, idx) => `hsl(${(idx * 360) / subCombinedTableData.subInvestments.length}, 70%, 50%)`),
                                      borderColor: subCombinedTableData.subInvestments.map((_, idx) => `hsl(${(idx * 360) / subCombinedTableData.subInvestments.length}, 70%, 30%)`),
                                      borderWidth: 1
                                    }]
                                  }}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: {
                                        display: false
                                      },
                                      tooltip: {
                                        callbacks: {
                                          label: (context) => {
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            const percentage = ((context.raw / total) * 100).toFixed(1);
                                            return `सब्सिडी: ${formatCurrency(context.raw)} (${percentage}%)`;
                                          }
                                        }
                                      }
                                    }
                                  }}
                                />
                              ) : (
                                <div className="no-data-message">कोई डेटा उपलब्ध नहीं</div>
                              )}
                            </div>
                          </Col>
                          <Col lg={6} md={12}>
                            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                              {subCombinedTableData.subInvestments.length > 0 ? (
                                <div className="table-responsive">
                                  <table className="table table-sm table-striped mb-0" style={{ fontSize: '0.75rem', minWidth: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#ffc107', color: 'black' }}>
                                      <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th style={{ minWidth: '120px' }}>उपनिवेश</th>
                                        {subCombinedTableData.schemes.map(scheme => (
                                          <th key={scheme} className="text-end" style={{ minWidth: '80px' }}>{scheme}</th>
                                        ))}
                                        <th className="text-end" style={{ minWidth: '80px' }}>कुल</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {subCombinedTableData.subInvestments.map((subInvestment, idx) => (
                                        <tr key={subInvestment}>
                                          <td>{idx + 1}</td>
                                          <td style={{ whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={subInvestment}>
                                            {subInvestment}
                                          </td>
                                          {subCombinedTableData.schemes.map(scheme => (
                                            <td key={scheme} className="text-end">
                                              {formatCurrency(subCombinedTableData.data[subInvestment][scheme] || 0)}
                                            </td>
                                          ))}
                                          <td className="text-end font-weight-bold">
                                            {formatCurrency(subCombinedTableData.totals[subInvestment])}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr style={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>
                                        <td colSpan={2}>कुल</td>
                                        {subCombinedTableData.schemes.map(scheme => (
                                          <td key={scheme} className="text-end">
                                            {formatCurrency(subCombinedTableData.subInvestments.reduce((sum, subInv) => sum + (subCombinedTableData.data[subInv][scheme] || 0), 0))}
                                          </td>
                                        ))}
                                        <td className="text-end">
                                          {formatCurrency(subCombinedTableData.grandTotal)}
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
                    </Card>

                    {/* Row 2.75: निवेश (Main Investment) - Pie Chart with Subsidy Table */}
                    <Card className="chart-card mb-4">
                      <Card.Header className="chart-card-header bg-info-gradient">
                        <h6 className="mb-0 text-white">
                          <FaChartPie className="me-2" />
                          निवेश के अनुसार ग्राफ़ - सब्सिडी राशि
                          <span className="badge bg-light text-dark ms-2" style={{fontSize: '0.7rem'}}>
                            {investmentSubsidyChartData.itemCount} निवेश
                          </span>
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col lg={6} md={12} className="mb-3">
                            <div className="chart-container" style={{ height: '450px' }}>
                              {investmentSubsidyChartData.doughnut.labels.length > 0 ? (
                                <Pie data={investmentSubsidyChartData.doughnut} options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      display: false
                                    },
                                    tooltip: {
                                      callbacks: {
                                        title: (context) => {
                                          return investmentSubsidyChartData.doughnut.fullLabels[context[0].dataIndex];
                                        },
                                        label: (context) => {
                                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                          const percentage = ((context.raw / total) * 100).toFixed(1);
                                          return `सब्सिडी राशि: ${formatCurrency(context.raw)} (${percentage}%)`;
                                        }
                                      }
                                    }
                                  }
                                }} />
                              ) : (
                                <div className="no-data-message">कोई डेटा उपलब्ध नहीं</div>
                              )}
                            </div>
                          </Col>
                          <Col lg={6} md={12}>
                            <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                              {investmentSubsidyChartData.doughnut && investmentSubsidyChartData.doughnut.fullLabels && investmentSubsidyChartData.doughnut.fullLabels.length > 0 ? (
                                <div className="table-responsive">
                                  <table className="table table-sm table-striped mb-0" style={{ fontSize: '0.85rem' }}>
                                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#17a2b8', color: 'white' }}>
                                      <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th>निवेश नाम</th>
                                        <th className="text-end">सब्सिडी राशि</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {investmentSubsidyChartData.doughnut.fullLabels.map((label, idx) => {
                                        const subsidy = (investmentSubsidyChartData.rawData && investmentSubsidyChartData.rawData[label] && investmentSubsidyChartData.rawData[label].subsidy) || 0;
                                        return (
                                          <tr key={label}>
                                            <td>{idx + 1}</td>
                                            <td title={label} style={{ fontSize: '0.85rem' }}>{label}</td>
                                            <td className="text-end">{formatCurrency(subsidy)}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                    <tfoot>
                                      <tr style={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>
                                        <td colSpan={2}>कुल</td>
                                        <td className="text-end">
                                          {formatCurrency(Object.values(investmentSubsidyChartData.rawData || {}).reduce((s, v) => s + ((v && v.subsidy) || 0), 0))}
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
                    </Card>

                    {/* Row 3: निवेश - योजना सब्सिडी तुलना */}
                    <Card className="chart-card mb-4">
                      <Card.Header className="chart-card-header bg-combined-gradient">
                        <h6 className="mb-0 text-white">
                          <FaChartPie className="me-2" />
                          निवेश - योजना सब्सिडी तुलना
                        </h6>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col lg={6} md={12} className="mb-3">
                            <div className="chart-container" style={{ height: '400px' }}>
                              {combinedChartData.labels.length > 0 ? (
                                <Pie
                                  data={combinedChartData}
                                  options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                      legend: {
                                        display: false
                                      },
                                      tooltip: {
                                        callbacks: {
                                          label: (context) => {
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            const percentage = ((context.raw / total) * 100).toFixed(1);
                                            return `सब्सिडी: ${formatCurrency(context.raw)} (${percentage}%)`;
                                          }
                                        }
                                      }
                                    }
                                  }}
                                />
                              ) : (
                                <div className="no-data-message">कोई डेटा उपलब्ध नहीं</div>
                              )}
                            </div>
                          </Col>
                          <Col lg={6} md={12}>
                            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                              {combinedTableData.investments.length > 0 ? (
                                <div className="table-responsive">
                                  <table className="table table-sm table-striped mb-0" style={{ fontSize: '0.75rem', minWidth: '100%' }}>
                                    <thead style={{ position: 'sticky', top: 0, backgroundColor: '#6f42c1', color: 'white' }}>
                                      <tr>
                                        <th style={{ width: '40px' }}>#</th>
                                        <th style={{ minWidth: '120px' }}>निवेश</th>
                                        {combinedTableData.schemes.map(scheme => (
                                          <th key={scheme} className="text-end" style={{ minWidth: '80px' }}>{scheme}</th>
                                        ))}
                                        <th className="text-end" style={{ minWidth: '80px' }}>कुल</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {combinedTableData.investments.map((investment, idx) => (
                                        <tr key={investment}>
                                          <td>{idx + 1}</td>
                                          <td style={{ whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={investment}>
                                            {investment}
                                          </td>
                                          {combinedTableData.schemes.map(scheme => (
                                            <td key={scheme} className="text-end">
                                              {formatCurrency(combinedTableData.data[investment][scheme] || 0)}
                                            </td>
                                          ))}
                                          <td className="text-end font-weight-bold">
                                            {formatCurrency(combinedTableData.totals[investment])}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr style={{ fontWeight: 700, backgroundColor: '#f1f5f9' }}>
                                        <td colSpan={2}>कुल</td>
                                        {combinedTableData.schemes.map(scheme => (
                                          <td key={scheme} className="text-end">
                                            {formatCurrency(combinedTableData.investments.reduce((sum, inv) => sum + (combinedTableData.data[inv][scheme] || 0), 0))}
                                          </td>
                                        ))}
                                        <td className="text-end">
                                          {formatCurrency(combinedTableData.grandTotal)}
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
                    </Card>
                  </>
                )}
              </>
            )}
          </Container>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;