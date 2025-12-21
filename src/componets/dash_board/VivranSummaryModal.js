import React, { useState, useMemo, useEffect } from "react";
import { Modal, Row, Col, Card, Button, Table, Badge, Collapse, Form } from "react-bootstrap";
import { FaTimes, FaFileExcel, FaFilePdf, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";

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

// Available columns for the modal table
const modalTableColumns = [
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

const VivranSummaryModal = ({ show, onHide, groupData, selectedColumns, setSelectedColumns }) => {
  const [activeFilters, setActiveFilters] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({
    center_name: true,
    investment_name: true,
    component: true,
    source_of_receipt: true,
    scheme_name: true
  });
  const [showOnlySold, setShowOnlySold] = useState(false);
  const [showOnlyAllocated, setShowOnlyAllocated] = useState(false);
  const [showOnlyRemaining, setShowOnlyRemaining] = useState(false);

  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Filtered items based on active filters
  const filteredItems = useMemo(() => {
    if (!groupData || !groupData.items) return [];
    let filtered = groupData.items;
    Object.keys(activeFilters).forEach(category => {
      const values = activeFilters[category];
      if (values && values.length > 0) {
        filtered = filtered.filter(item => values.includes(item[category]));
      }
    });
    if (showOnlySold) {
      filtered = filtered.filter(item => parseFloat(item.updated_quantity) > 0);
    }
    if (showOnlyAllocated) {
      filtered = filtered.filter(item => parseFloat(item.allocated_quantity) > 0);
    }
    if (showOnlyRemaining) {
      filtered = filtered.filter(item => parseFloat(item.allocated_quantity) > parseFloat(item.updated_quantity));
    }
    return filtered;
  }, [groupData, activeFilters, showOnlySold, showOnlyAllocated, showOnlyRemaining]);

  // Calculate summary info from filtered items
  const totalAllocated = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + parseFloat(item.allocated_quantity) * parseFloat(item.rate), 0);
  }, [filteredItems]);

  const totalUpdated = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + parseFloat(item.updated_quantity) * parseFloat(item.rate), 0);
  }, [filteredItems]);

  const totalRemaining = totalAllocated - totalUpdated;
  const placesCount = filteredItems.length;

  // Get unique values for filters from all items
  const uniqueCenters = useMemo(() => {
    return [...new Set((groupData?.items || []).map(item => item.center_name))].filter(Boolean).sort();
  }, [groupData]);

  const uniqueInvestments = useMemo(() => {
    return [...new Set((groupData?.items || []).map(item => item.investment_name))].filter(Boolean).sort();
  }, [groupData]);

  const uniqueComponents = useMemo(() => {
    return [...new Set((groupData?.items || []).map(item => item.component))].filter(Boolean).sort();
  }, [groupData]);

  const uniqueSources = useMemo(() => {
    return [...new Set((groupData?.items || []).map(item => item.source_of_receipt))].filter(Boolean).sort();
  }, [groupData]);

  const uniqueSchemes = useMemo(() => {
    return [...new Set((groupData?.items || []).map(item => item.scheme_name))].filter(Boolean).sort();
  }, [groupData]);

  // Set initial filters based on groupData if from badge click
  useEffect(() => {
    if (groupData && groupData.group_field) {
      setActiveFilters({
        [groupData.group_field]: [groupData.group_name]
      });
    }
  }, [groupData]);

  // Data for comparison chart
  const chartData = useMemo(() => {
    const data = {};
    filteredItems.forEach(item => {
      const key = item.center_name; // Group by center for chart
      if (!data[key]) {
        data[key] = { allocated: 0, sold: 0, remaining: 0 };
      }
      const allocated = parseFloat(item.allocated_quantity) || 0;
      const sold = parseFloat(item.updated_quantity) || 0;
      const remaining = allocated - sold;
      data[key].allocated += allocated;
      data[key].sold += sold;
      data[key].remaining += remaining;
    });
    return Object.entries(data).map(([name, values]) => ({ name, ...values }));
  }, [filteredItems]);

  // Handle filter changes
  const handleFilterChange = (category, value) => {
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

  // Handle bar click in graph
  const handleBarClick = (name, value, type) => {
    // Reset all
    setShowOnlySold(false);
    setShowOnlyAllocated(false);
    setShowOnlyRemaining(false);
    if (type === 'sold') {
      setShowOnlySold(true);
    } else if (type === 'allocated') {
      setShowOnlyAllocated(true);
    } else if (type === 'remaining') {
      setShowOnlyRemaining(true);
    }
    // Filter by center
    setActiveFilters(prev => ({ ...prev, center_name: [name] }));
  };

  // Toggle collapse section
  const toggleCollapse = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({});
  };

  // Comparison Bar Chart Component
  const ComparisonBarChart = ({ data, title, onBarClick }) => {
    if (!data || data.length === 0) return null;

    const colors = {
      allocated: '#2C3E50',
      sold: '#E74C3C',
      remaining: '#27AE60'
    };

    const maxValue = Math.max(...data.map(item => Math.max(item.allocated, item.sold, item.remaining)));
    const scaleFactor = maxValue > 0 ? 100 / maxValue : 1;

    const barWidth = 20;
    const chartHeight = 400;
    const chartWidth = Math.max(600, data.length * 60);
    const margin = { top: 20, right: 20, bottom: 80, left: 50 };
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    return (
      <Card className="comparison-chart-card">
        <Card.Header className="small-fonts text-center">{title}</Card.Header>
        <Card.Body className="text-center">
          <div className="comparison-chart-container">
            <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMinYMin meet">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map(tick => {
                const y = innerHeight + margin.top - (tick * innerHeight);
                return (
                  <line key={`grid-${tick}`} x1={margin.left} y1={y} x2={innerWidth + margin.left} y2={y} stroke="#e0e0e0" strokeWidth="1" />
                );
              })}

              {/* Y-axis */}
              <line x1={margin.left} y1={margin.top} x2={margin.left} y2={innerHeight + margin.top} stroke="#333" strokeWidth="2" />

              {/* X-axis */}
              <line x1={margin.left} y1={innerHeight + margin.top} x2={innerWidth + margin.left} y2={innerHeight + margin.top} stroke="#333" strokeWidth="2" />

              {/* X-axis ticks */}
              {data.map((item, index) => {
                const x = margin.left + (index * (innerWidth / data.length)) + (innerWidth / data.length) / 2;
                return (
                  <g key={`x-tick-${index}`}>
                    <line x1={x} y1={innerHeight + margin.top} x2={x} y2={innerHeight + margin.top + 5} stroke="#333" strokeWidth="2" />
                  </g>
                );
              })}

              {/* Y-axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map(tick => {
                const y = innerHeight + margin.top - (tick * innerHeight);
                const value = (tick * maxValue).toFixed(0);
                return (
                  <g key={tick}>
                    <line x1={margin.left - 5} y1={y} x2={margin.left} y2={y} stroke="#333" strokeWidth="2" />
                    <text x={margin.left - 10} y={y + 5} textAnchor="end" fontSize="12">{value}</text>
                  </g>
                );
              })}

              {/* Y-axis unit label */}
              <text x={10} y={margin.top} textAnchor="start" fontSize="10" transform={`rotate(-90, 10, ${margin.top})`}>
                मात्रा
              </text>

              {/* Bars and X-axis labels */}
              {data.map((item, index) => {
                const x = margin.left + (index * (innerWidth / data.length)) + (innerWidth / data.length) / 2;
                const groupWidth = innerWidth / data.length;
                const barSpacing = 5;
                const actualBarWidth = Math.min((innerWidth / data.length * 0.95) / 3, 10);

                const allocatedHeight = maxValue > 0 ? (item.allocated / maxValue) * innerHeight : 0;
                const soldHeight = maxValue > 0 ? (item.sold / maxValue) * innerHeight : 0;
                const remainingHeight = maxValue > 0 ? (item.remaining / maxValue) * innerHeight : 0;

                const allocatedY = innerHeight + margin.top - allocatedHeight;
                const soldY = innerHeight + margin.top - soldHeight;
                const remainingY = innerHeight + margin.top - remainingHeight;

                return (
                  <g key={item.name}>
                    {/* Allocated bar */}
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
                    <text x={x - actualBarWidth - barSpacing + actualBarWidth / 2} y={allocatedY - 5} textAnchor="middle" fontSize="10" fill={colors.allocated} style={{ cursor: 'pointer' }} onClick={() => onBarClick && onBarClick(item.name, item.allocated, 'allocated')}>
                      {item.allocated.toFixed(0)}
                    </text>

                    {/* Sold bar */}
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
                    <text x={x + actualBarWidth / 2} y={soldY - 5} textAnchor="middle" fontSize="10" fill={colors.sold} style={{ cursor: 'pointer' }} onClick={() => onBarClick && onBarClick(item.name, item.sold, 'sold')}>
                      {item.sold.toFixed(0)}
                    </text>

                    {/* Remaining bar */}
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
                    <text x={x + actualBarWidth + barSpacing + actualBarWidth / 2} y={remainingY - 5} textAnchor="middle" fontSize="10" fill={colors.remaining} style={{ cursor: 'pointer' }} onClick={() => onBarClick && onBarClick(item.name, item.remaining, 'remaining')}>
                      {item.remaining.toFixed(0)}
                    </text>

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
              <g transform={`translate(${chartWidth - 120}, 20)`}>
                <rect x={0} y={0} width={12} height={12} fill={colors.allocated} />
                <text x={15} y={10} fontSize="12">आवंटित</text>

                <rect x={0} y={15} width={12} height={12} fill={colors.sold} />
                <text x={15} y={25} fontSize="12">बेचा गया</text>

                <rect x={0} y={30} width={12} height={12} fill={colors.remaining} />
                <text x={15} y={40} fontSize="12">शेष</text>
              </g>
            </svg>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const downloadExcel = () => {
    try {
      const excelData = filteredItems.map((item, index) => {
        const row = {};
        selectedColumns.forEach(col => {
          switch (col) {
            case 'sno':
              row['क्र.सं.'] = index + 1;
              break;
            case 'center_name':
              row['केंद्र का नाम'] = item.center_name;
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
            case 'allocated_amount':
              row['आवंटित राशि'] = formatCurrency(parseFloat(item.allocated_quantity) * parseFloat(item.rate));
              break;
            case 'updated_quantity':
              row['अपडेट की गई मात्रा'] = item.updated_quantity;
              break;
            case 'updated_amount':
              row['अपडेट की गई राशि'] = formatCurrency(parseFloat(item.updated_quantity) * parseFloat(item.rate));
              break;
            case 'source_of_receipt':
              row['स्रोत'] = item.source_of_receipt;
              break;
            case 'scheme_name':
              row['योजना'] = item.scheme_name;
              break;
          }
        });
        return row;
      });

      // Add totals row
      const totalsRow = {};
      selectedColumns.forEach(col => {
        if (col === 'sno') {
          totalsRow['क्र.सं.'] = 'कुल';
        } else if (col === 'center_name' || col === 'component' || col === 'investment_name' ||
                   col === 'unit' || col === 'source_of_receipt' || col === 'scheme_name') {
          totalsRow[col === 'center_name' ? 'केंद्र का नाम' :
                   col === 'component' ? 'घटक' :
                   col === 'investment_name' ? 'निवेश का नाम' :
                   col === 'unit' ? 'इकाई' :
                   col === 'source_of_receipt' ? 'स्रोत' : 'योजना'] = '';
        } else if (col === 'rate') {
          totalsRow['दर'] = '-';
        } else if (col === 'allocated_quantity') {
          totalsRow['आवंटित मात्रा'] = filteredItems.reduce((sum, item) => sum + parseFloat(item.allocated_quantity || 0), 0).toFixed(2);
        } else if (col === 'allocated_amount') {
          totalsRow['आवंटित राशि'] = formatCurrency(totalAllocated);
        } else if (col === 'updated_quantity') {
          totalsRow['अपडेट की गई मात्रा'] = filteredItems.reduce((sum, item) => sum + parseFloat(item.updated_quantity || 0), 0).toFixed(2);
        } else if (col === 'updated_amount') {
          totalsRow['अपडेट की गई राशि'] = formatCurrency(totalUpdated);
        }
      });
      excelData.push(totalsRow);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "विवरण");
      XLSX.writeFile(wb, `${groupData.group_name}_विवरण.xlsx`);
    } catch (e) {
      // Error generating Excel file
    }
  };

  const downloadPdf = () => {
    try {
      const headers = selectedColumns.map(col => {
        switch (col) {
          case 'sno': return '<th>क्र.सं.</th>';
          case 'center_name': return '<th>केंद्र का नाम</th>';
          case 'component': return '<th>घटक</th>';
          case 'investment_name': return '<th>निवेश का नाम</th>';
          case 'unit': return '<th>इकाई</th>';
          case 'allocated_quantity': return '<th>आवंटित मात्रा</th>';
          case 'rate': return '<th>दर</th>';
          case 'allocated_amount': return '<th>आवंटित राशि</th>';
          case 'updated_quantity': return '<th>अपडेट की गई मात्रा</th>';
          case 'updated_amount': return '<th>अपडेट की गई राशि</th>';
          case 'source_of_receipt': return '<th>स्रोत</th>';
          case 'scheme_name': return '<th>योजना</th>';
          default: return '';
        }
      }).join('');

      const rows = filteredItems.map((item, index) => {
        const cells = selectedColumns.map(col => {
          switch (col) {
            case 'sno': return `<td>${index + 1}</td>`;
            case 'center_name': return `<td>${item.center_name}</td>`;
            case 'component': return `<td>${item.component}</td>`;
            case 'investment_name': return `<td>${item.investment_name}</td>`;
            case 'unit': return `<td>${item.unit}</td>`;
            case 'allocated_quantity': return `<td>${item.allocated_quantity}</td>`;
            case 'rate': return `<td>${item.rate}</td>`;
            case 'allocated_amount': return `<td>${formatCurrency(parseFloat(item.allocated_quantity) * parseFloat(item.rate))}</td>`;
            case 'updated_quantity': return `<td>${item.updated_quantity}</td>`;
            case 'updated_amount': return `<td>${formatCurrency(parseFloat(item.updated_quantity) * parseFloat(item.rate))}</td>`;
            case 'source_of_receipt': return `<td>${item.source_of_receipt}</td>`;
            case 'scheme_name': return `<td>${item.scheme_name}</td>`;
            default: return '<td></td>';
          }
        }).join('');
        return `<tr>${cells}</tr>`;
      }).join('');

      // Totals row
      const totalsCells = selectedColumns.map(col => {
        if (col === 'sno') return '<td><strong>कुल</strong></td>';
        else if (col === 'center_name' || col === 'component' || col === 'investment_name' ||
                 col === 'unit' || col === 'source_of_receipt' || col === 'scheme_name') return '<td></td>';
        else if (col === 'rate') return '<td>-</td>';
        else if (col === 'allocated_quantity') return `<td><strong>${filteredItems.reduce((sum, item) => sum + parseFloat(item.allocated_quantity || 0), 0).toFixed(2)}</strong></td>`;
        else if (col === 'allocated_amount') return `<td><strong>${formatCurrency(totalAllocated)}</strong></td>`;
        else if (col === 'updated_quantity') return `<td><strong>${filteredItems.reduce((sum, item) => sum + parseFloat(item.updated_quantity || 0), 0).toFixed(2)}</strong></td>`;
        else if (col === 'updated_amount') return `<td><strong>${formatCurrency(totalUpdated)}</strong></td>`;
        return '<td></td>';
      }).join('');
      const totalsRow = `<tr>${totalsCells}</tr>`;

      const tableHtml = `
        <html>
          <head>
            <title>${groupData.group_name} विवरण</title>
            <meta charset="UTF-8">
            <style>
              table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
            </style>
          </head>
          <body>
            <h2>${groupData.group_name} विवरण</h2>
            <table>
              <tr>${headers}</tr>
              ${rows}
              ${totalsRow}
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
      // Error generating PDF
    }
  };

  // Return null if groupData is not available
  if (!groupData) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="vivran-summary-modal"
    >
      <Modal.Header closeButton onClick={onHide}>
        <Modal.Title>{groupData.group_name} - विवरण</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Info Section on Top */}
        <Card className="mb-3">
          <Card.Body className="py-2">
            <Row className="text-center">
              <Col md={4}>
                <h6 className="mb-1">आवंटित राशि</h6>
                <p className="mb-0 fw-bold">{formatCurrency(totalAllocated)}</p>
              </Col>
              <Col md={4}>
                <h6 className="mb-1">शेष राशि</h6>
                <p className="mb-0 text-success fw-bold">{formatCurrency(totalRemaining)}</p>
              </Col>
              <Col md={4}>
                <h6 className="mb-1">बेची गई राशि</h6>
                <p className="mb-0 text-warning fw-bold">{formatCurrency(totalUpdated)}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Collapsible Filters Section */}
        <Card className="mb-3">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">फिल्टर</h6>
              <Button variant="outline-secondary" size="sm" onClick={clearAllFilters}>
                सभी फिल्टर हटाएं
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Card className="mb-2">
                  <Card.Header
                    onClick={() => toggleCollapse('center_name')}
                    style={{ cursor: 'pointer' }}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>केंद्र का नाम ({uniqueCenters.length})</span>
                    {collapsedSections.center_name ? <FaChevronDown /> : <FaChevronUp />}
                  </Card.Header>
                  <Collapse in={!collapsedSections.center_name}>
                    <Card.Body>
                      <Row className="g-1 align-items-center">
                        {uniqueCenters.map((value) => (
                          <Col key={value} xs="auto" className="mb-2">
                            <Button
                              variant={(activeFilters.center_name || []).includes(value) ? "primary" : "outline-secondary"}
                              size="sm"
                              className="filter-button"
                              onClick={() => handleFilterChange('center_name', value)}
                            >
                              {value}
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Collapse>
                </Card>

                <Card className="mb-2">
                  <Card.Header
                    onClick={() => toggleCollapse('investment_name')}
                    style={{ cursor: 'pointer' }}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>निवेश का नाम ({uniqueInvestments.length})</span>
                    {collapsedSections.investment_name ? <FaChevronDown /> : <FaChevronUp />}
                  </Card.Header>
                  <Collapse in={!collapsedSections.investment_name}>
                    <Card.Body>
                      <Row className="g-1 align-items-center">
                        {uniqueInvestments.map((value) => (
                          <Col key={value} xs="auto" className="mb-2">
                            <Button
                              variant={(activeFilters.investment_name || []).includes(value) ? "primary" : "outline-secondary"}
                              size="sm"
                              className="filter-button"
                              onClick={() => handleFilterChange('investment_name', value)}
                            >
                              {value}
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Collapse>
                </Card>

                <Card className="mb-2">
                  <Card.Header
                    onClick={() => toggleCollapse('component')}
                    style={{ cursor: 'pointer' }}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>घटक ({uniqueComponents.length})</span>
                    {collapsedSections.component ? <FaChevronDown /> : <FaChevronUp />}
                  </Card.Header>
                  <Collapse in={!collapsedSections.component}>
                    <Card.Body>
                      <Row className="g-1 align-items-center">
                        {uniqueComponents.map((value) => (
                          <Col key={value} xs="auto" className="mb-2">
                            <Button
                              variant={(activeFilters.component || []).includes(value) ? "primary" : "outline-secondary"}
                              size="sm"
                              className="filter-button"
                              onClick={() => handleFilterChange('component', value)}
                            >
                              {value}
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Collapse>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="mb-2">
                  <Card.Header
                    onClick={() => toggleCollapse('source_of_receipt')}
                    style={{ cursor: 'pointer' }}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>स्रोत ({uniqueSources.length})</span>
                    {collapsedSections.source_of_receipt ? <FaChevronDown /> : <FaChevronUp />}
                  </Card.Header>
                  <Collapse in={!collapsedSections.source_of_receipt}>
                    <Card.Body>
                      <Row className="g-1 align-items-center">
                        {uniqueSources.map((value) => (
                          <Col key={value} xs="auto" className="mb-2">
                            <Button
                              variant={(activeFilters.source_of_receipt || []).includes(value) ? "primary" : "outline-secondary"}
                              size="sm"
                              className="filter-button"
                              onClick={() => handleFilterChange('source_of_receipt', value)}
                            >
                              {value}
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Collapse>
                </Card>

                <Card className="mb-2">
                  <Card.Header
                    onClick={() => toggleCollapse('scheme_name')}
                    style={{ cursor: 'pointer' }}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>योजना ({uniqueSchemes.length})</span>
                    {collapsedSections.scheme_name ? <FaChevronDown /> : <FaChevronUp />}
                  </Card.Header>
                  <Collapse in={!collapsedSections.scheme_name}>
                    <Card.Body>
                      <Row className="g-1 align-items-center">
                        {uniqueSchemes.map((value) => (
                          <Col key={value} xs="auto" className="mb-2">
                            <Button
                              variant={(activeFilters.scheme_name || []).includes(value) ? "primary" : "outline-secondary"}
                              size="sm"
                              className="filter-button"
                              onClick={() => handleFilterChange('scheme_name', value)}
                            >
                              {value}
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Collapse>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Table Section */}
        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">विवरण तालिका</h6>
            <div>
              <Button variant="outline-success" size="sm" onClick={downloadExcel} className="me-2">
                <FaFileExcel /> Excel
              </Button>
              <Button variant="outline-danger" size="sm" onClick={downloadPdf}>
                <FaFilePdf /> PDF
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {/* Column Selection Section */}
            <ColumnSelection
              columns={modalTableColumns}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
              title="कॉलम चुनें"
            />
            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table className="responsive-table small-fonts">
                <thead className="table-light">
                  <tr>
                    {selectedColumns.includes('sno') && <th>क्र.सं.</th>}
                    {selectedColumns.includes('center_name') && <th>केंद्र का नाम</th>}
                    {selectedColumns.includes('component') && <th>घटक</th>}
                    {selectedColumns.includes('investment_name') && <th>निवेश का नाम</th>}
                    {selectedColumns.includes('unit') && <th>इकाई</th>}
                    {selectedColumns.includes('allocated_quantity') && <th>आवंटित मात्रा</th>}
                    {selectedColumns.includes('rate') && <th>दर</th>}
                    {selectedColumns.includes('allocated_amount') && <th>आवंटित राशि</th>}
                    {selectedColumns.includes('updated_quantity') && <th>अपडेट की गई मात्रा</th>}
                    {selectedColumns.includes('updated_amount') && <th>अपडेट की गई राशि</th>}
                    {selectedColumns.includes('source_of_receipt') && <th>स्रोत</th>}
                    {selectedColumns.includes('scheme_name') && <th>योजना</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, index) => {
                    const allocatedAmount = (parseFloat(item.allocated_quantity) * parseFloat(item.rate)).toFixed(2);
                    const updatedAmount = (parseFloat(item.updated_quantity) * parseFloat(item.rate)).toFixed(2);
                    return (
                      <tr key={index}>
                        {selectedColumns.includes('sno') && <td data-label="क्र.सं.">{index + 1}</td>}
                        {selectedColumns.includes('center_name') && <td data-label="केंद्र का नाम">{item.center_name}</td>}
                        {selectedColumns.includes('component') && <td data-label="घटक">{item.component}</td>}
                        {selectedColumns.includes('investment_name') && <td data-label="निवेश का नाम">{item.investment_name}</td>}
                        {selectedColumns.includes('unit') && <td data-label="इकाई">{item.unit}</td>}
                        {selectedColumns.includes('allocated_quantity') && <td data-label="आवंटित मात्रा">{item.allocated_quantity}</td>}
                        {selectedColumns.includes('rate') && <td data-label="दर">{item.rate}</td>}
                        {selectedColumns.includes('allocated_amount') && <td data-label="आवंटित राशि">{allocatedAmount}</td>}
                        {selectedColumns.includes('updated_quantity') && <td data-label="अपडेट की गई मात्रा">{item.updated_quantity}</td>}
                        {selectedColumns.includes('updated_amount') && <td data-label="अपडेट की गई राशि">{updatedAmount}</td>}
                        {selectedColumns.includes('source_of_receipt') && <td data-label="स्रोत">{item.source_of_receipt}</td>}
                        {selectedColumns.includes('scheme_name') && <td data-label="योजना">{item.scheme_name}</td>}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="font-weight-bold">
                    {selectedColumns.includes('sno') && <td>कुल</td>}
                    {selectedColumns.includes('center_name') && <td></td>}
                    {selectedColumns.includes('component') && <td></td>}
                    {selectedColumns.includes('investment_name') && <td></td>}
                    {selectedColumns.includes('unit') && <td></td>}
                    {selectedColumns.includes('allocated_quantity') && <td>{filteredItems.reduce((sum, item) => sum + parseFloat(item.allocated_quantity || 0), 0).toFixed(2)}</td>}
                    {selectedColumns.includes('rate') && <td></td>}
                    {selectedColumns.includes('allocated_amount') && <td>{formatCurrency(totalAllocated)}</td>}
                    {selectedColumns.includes('updated_quantity') && <td>{filteredItems.reduce((sum, item) => sum + parseFloat(item.updated_quantity || 0), 0).toFixed(2)}</td>}
                    {selectedColumns.includes('updated_amount') && <td>{formatCurrency(totalUpdated)}</td>}
                    {selectedColumns.includes('source_of_receipt') && <td></td>}
                    {selectedColumns.includes('scheme_name') && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card.Body>
        </Card>

        {/* Graph Section */}
        <Card>
          <Card.Header>
            <h6 className="mb-0">विवरण ग्राफ</h6>
          </Card.Header>
          <Card.Body>
            <div style={{ overflowX: 'auto' }}>
              <ComparisonBarChart data={chartData} title="आवंटित बनाम बेचा गया" onBarClick={handleBarClick} />
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
    </Modal>
  );
};

export default VivranSummaryModal;