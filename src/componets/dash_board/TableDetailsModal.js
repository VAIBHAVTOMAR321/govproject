import React, { useState, useMemo, useEffect } from "react";
import { Modal, Row, Col, Card, Button, Table, Badge, Collapse, Container, Form } from "react-bootstrap";
import { FaTimes, FaChevronDown, FaChevronUp, FaBuilding, FaGavel, FaMapMarkerAlt, FaPuzzlePiece, FaPiggyBank, FaLayerGroup, FaTags, FaChartBar, FaEye, FaList } from "react-icons/fa";
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";

// Function to generate distinct colors for centers
const generateCenterColors = (count) => {
  const colors = [];
  const hueStep = 360 / count;
  
  for (let i = 0; i < count; i++) {
    const hue = i * hueStep;
    const saturation = 70;
    const lightness = 85;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  
  return colors;
};

// Function to get contrasting text color
const getContrastColor = (bgColor) => {
  return "#333";
};

const TableDetailsModal = ({ show, onHide, tableData, centerName }) => {
  const [collapsedSections, setCollapsedSections] = useState({
    hierarchy: true,
    schemes: true,
    investments: true,
    filter: true,
    sources: true,
    places: true,
    allocation: true,
    sales: true,
    remaining: true
  });

  // Set initial selected kendra when modal opens
  useEffect(() => {
    if (show) {
      // Simple tooltip initialization
      const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipElements.forEach(element => {
        // Tooltips are handled by Bootstrap
      });
    }
  }, [show]);

  // State for detailed breakdowns within each section
  const [allocationDetails, setAllocationDetails] = useState([]);
  const [salesDetails, setSalesDetails] = useState([]);
  const [remainingDetails, setRemainingDetails] = useState([]);

  // Initialize tooltips when modal opens
  useEffect(() => {
    if (show) {
      // Simple tooltip initialization using native HTML title attribute
      const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipElements.forEach(element => {
        // The title attribute is already set, so tooltips should work with native browser tooltips
        // For better styling, we can enhance them with CSS
      });
    }
  }, [show]);

  // Function to get detailed tooltip data for a specific item
  const getTooltipData = (itemType, itemValue, filteredData) => {
    const relevantData = filteredData.filter(item => {
      switch(itemType) {
        case 'scheme': return item.scheme_name === itemValue;
        case 'investment': return item.investment_name === itemValue;
        case 'component': return item.component === itemValue;
        case 'source': return item.source_of_receipt === itemValue;
        case 'vidhanSabha': return item.vidhan_sabha_name === itemValue;
        case 'vikasKhand': return item.vikas_khand_name === itemValue;
        default: return false;
      }
    });

    if (relevantData.length === 0) return null;

    // Calculate totals for the item
    const totalAllocated = relevantData.reduce((sum, item) =>
      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
    const totalUpdated = relevantData.reduce((sum, item) =>
      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
    const totalRemaining = totalAllocated - totalUpdated;

    // Get unique locations
    const uniqueVidhanSabhas = [...new Set(relevantData.map(item => item.vidhan_sabha_name))].filter(Boolean);
    const uniqueVikasKhands = [...new Set(relevantData.map(item => item.vikas_khand_name))].filter(Boolean);

    return {
      count: relevantData.length,
      totalAllocated,
      totalUpdated,
      totalRemaining,
      uniqueVidhanSabhas,
      uniqueVikasKhands,
      allocatedQuantity: relevantData.reduce((sum, item) => sum + parseFloat(item.allocated_quantity || 0), 0),
      updatedQuantity: relevantData.reduce((sum, item) => sum + parseFloat(item.updated_quantity || 0), 0),
      rate: relevantData[0]?.rate || 0
    };
  };

  // Format currency for tooltips
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format quantity with units
  const formatQuantity = (quantity) => {
    return parseFloat(quantity || 0).toFixed(2);
  };

  // Generate tooltip content
  const getTooltipContent = (itemType, itemValue, tooltipData, allData) => {
    if (!tooltipData) return '';

    const locations = tooltipData.uniqueVidhanSabhas.length > 0
      ? tooltipData.uniqueVidhanSabhas.join(', ')
      : 'N/A';

    const vikasKhands = tooltipData.uniqueVikasKhands.length > 0
      ? tooltipData.uniqueVikasKhands.join(', ')
      : 'N/A';

    // Get related items based on type
    let relatedInfo = '';
    if (itemType === 'scheme') {
      const relatedComponents = [...new Set(allData.filter(item => item.scheme_name === itemValue).map(item => item.component))].filter(Boolean);
      const relatedSources = [...new Set(allData.filter(item => item.scheme_name === itemValue).map(item => item.source_of_receipt))].filter(Boolean);
      relatedInfo = `घटक: ${relatedComponents.join(', ')}\nस्रोत: ${relatedSources.join(', ')}`;
    } else if (itemType === 'component') {
      const relatedSchemes = [...new Set(allData.filter(item => item.component === itemValue).map(item => item.scheme_name))].filter(Boolean);
      const relatedSources = [...new Set(allData.filter(item => item.component === itemValue).map(item => item.source_of_receipt))].filter(Boolean);
      relatedInfo = `योजनाएं: ${relatedSchemes.join(', ')}\nस्रोत: ${relatedSources.join(', ')}`;
    } else if (itemType === 'source') {
      const relatedSchemes = [...new Set(allData.filter(item => item.source_of_receipt === itemValue).map(item => item.scheme_name))].filter(Boolean);
      const relatedComponents = [...new Set(allData.filter(item => item.source_of_receipt === itemValue).map(item => item.component))].filter(Boolean);
      relatedInfo = `योजनाएं: ${relatedSchemes.join(', ')}\nघटक: ${relatedComponents.join(', ')}`;
    } else if (itemType === 'investment') {
      const relatedSchemes = [...new Set(allData.filter(item => item.investment_name === itemValue).map(item => item.scheme_name))].filter(Boolean);
      const relatedComponents = [...new Set(allData.filter(item => item.investment_name === itemValue).map(item => item.component))].filter(Boolean);
      relatedInfo = `योजनाएं: ${relatedSchemes.join(', ')}\nघटक: ${relatedComponents.join(', ')}`;
    }

    return `${itemValue} (${itemType.toUpperCase()})
रिकॉर्ड: ${tooltipData.count}
आवंटित मात्रा: ${formatQuantity(tooltipData.allocatedQuantity)}
बेची गई मात्रा: ${formatQuantity(tooltipData.updatedQuantity)}
दर: ${formatCurrency(tooltipData.rate)}
आवंटित: ${formatCurrency(tooltipData.totalAllocated)}
बेचा गया: ${formatCurrency(tooltipData.totalUpdated)}
शेष: ${formatCurrency(tooltipData.totalRemaining)}
${relatedInfo}
विधानसभा: ${locations}
विकासखंड: ${vikasKhands}`;
  };

  // Multi-select state for filtering
  const [selectedSchemes, setSelectedSchemes] = useState(new Set());
  const [selectedComponents, setSelectedComponents] = useState(new Set());
  const [selectedSources, setSelectedSources] = useState(new Set());

  // State for scheme collapse within hierarchy section
  const [collapsedSchemes, setCollapsedSchemes] = useState(new Set());

  // Get unique values for each category
  const uniqueVidhanSabhas = useMemo(() => {
    return [...new Set(tableData.map(item => item.vidhan_sabha_name))].filter(Boolean).sort();
  }, [tableData]);

  const uniqueVikasKhands = useMemo(() => {
    return [...new Set(tableData.map(item => item.vikas_khand_name))].filter(Boolean).sort();
  }, [tableData]);

  const uniqueSchemes = useMemo(() => {
    return [...new Set(tableData.map(item => item.scheme_name))].filter(Boolean).sort();
  }, [tableData]);

  const uniqueInvestments = useMemo(() => {
    return [...new Set(tableData.map(item => item.investment_name))].filter(Boolean).sort();
  }, [tableData]);

  const uniqueComponents = useMemo(() => {
    return [...new Set(tableData.map(item => item.component))].filter(Boolean).sort();
  }, [tableData]);

  const uniqueSources = useMemo(() => {
    return [...new Set(tableData.map(item => item.source_of_receipt))].filter(Boolean).sort();
  }, [tableData]);

  // Create hierarchical structure for better visualization
  const hierarchicalData = useMemo(() => {
    const hierarchy = {};
    
    tableData.forEach(item => {
      const vidhanSabha = item.vidhan_sabha_name;
      const vikasKhand = item.vikas_khand_name;
      const scheme = item.scheme_name;
      const investment = item.investment_name;
      const component = item.component;
      const source = item.source_of_receipt;

      if (!hierarchy[vidhanSabha]) {
        hierarchy[vidhanSabha] = {
          vikasKhands: new Set(),
          schemes: new Set(),
          investments: new Set(),
          components: new Set(),
          sources: new Set(),
          schemeInvestments: {} // New: Map schemes to their specific investments
        };
      }

      if (vikasKhand) hierarchy[vidhanSabha].vikasKhands.add(vikasKhand);
      if (scheme) {
        hierarchy[vidhanSabha].schemes.add(scheme);
        // Map scheme to its specific investments
        if (!hierarchy[vidhanSabha].schemeInvestments[scheme]) {
          hierarchy[vidhanSabha].schemeInvestments[scheme] = new Set();
        }
        if (investment) hierarchy[vidhanSabha].schemeInvestments[scheme].add(investment);
      }
      if (investment) hierarchy[vidhanSabha].investments.add(investment);
      if (component) hierarchy[vidhanSabha].components.add(component);
      if (source) hierarchy[vidhanSabha].sources.add(source);
    });

    // Convert Sets to sorted arrays and schemeInvestments to arrays
    Object.keys(hierarchy).forEach(key => {
      hierarchy[key] = {
        vikasKhands: Array.from(hierarchy[key].vikasKhands).sort(),
        schemes: Array.from(hierarchy[key].schemes).sort(),
        investments: Array.from(hierarchy[key].investments).sort(),
        components: Array.from(hierarchy[key].components).sort(),
        sources: Array.from(hierarchy[key].sources).sort(),
        schemeInvestments: Object.fromEntries(
          Object.entries(hierarchy[key].schemeInvestments).map(([scheme, investments]) => [
            scheme,
            Array.from(investments).sort()
          ])
        )
      };
    });

    return hierarchy;
  }, [tableData]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalAllocated = tableData.reduce((sum, item) =>
      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
    const totalUpdated = tableData.reduce((sum, item) =>
      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
    const totalRemaining = totalAllocated - totalUpdated;

    return {
      totalAllocated,
      totalUpdated,
      totalRemaining,
      placesCount: uniqueVikasKhands.length, // Use unique places count instead of total records
      recordsCount: tableData.length // Keep total records for reference
    };
  }, [tableData, uniqueVikasKhands]);


  // Toggle collapse section with auto-scroll
  const toggleCollapse = (section) => {
    setCollapsedSections(prev => {
      const newState = {
        ...prev,
        [section]: !prev[section]
      };
      
      // If the section is being opened (was collapsed, now expanded)
      if (prev[section] === true) {
        // Small delay to allow the collapse animation to complete
        setTimeout(() => {
          const element = document.getElementById(`${section}-section`);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 100);
      }
      
      return newState;
    });
  };

  // Toggle scheme selection
  const toggleScheme = (scheme) => {
    setSelectedSchemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scheme)) {
        newSet.delete(scheme);
      } else {
        newSet.add(scheme);
      }
      return newSet;
    });
  };

  // Toggle component selection
  const toggleComponent = (component) => {
    setSelectedComponents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(component)) {
        newSet.delete(component);
      } else {
        newSet.add(component);
      }
      return newSet;
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedSchemes(new Set());
    setSelectedComponents(new Set());
    setSelectedSources(new Set());
  };

  // Toggle scheme collapse in hierarchy section
  const toggleSchemeCollapse = (schemeKey) => {
    setCollapsedSchemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(schemeKey)) {
        newSet.delete(schemeKey);
      } else {
        newSet.add(schemeKey);
      }
      return newSet;
    });
  };

  // Toggle source selection
  const toggleSource = (source) => {
    setSelectedSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(source)) {
        newSet.delete(source);
      } else {
        newSet.add(source);
      }
      return newSet;
    });
  };

  // Clear source selections
  const clearSourceSelections = () => {
    setSelectedSources(new Set());
  };

  // Handle scheme/component detail clicks
  const showAllocationDetails = (item, itemType) => {
    setAllocationDetails(prev => {
      const exists = prev.find(d => d.selectedItem === item && d.itemType === itemType);
      if (exists) {
        return prev.filter(d => !(d.selectedItem === item && d.itemType === itemType));
      } else {
        return [...prev, { selectedItem: item, itemType }];
      }
    });
  };

  const showSalesDetails = (item, itemType) => {
    setSalesDetails(prev => {
      const exists = prev.find(d => d.selectedItem === item && d.itemType === itemType);
      if (exists) {
        return prev.filter(d => !(d.selectedItem === item && d.itemType === itemType));
      } else {
        return [...prev, { selectedItem: item, itemType }];
      }
    });
  };

  const showRemainingDetails = (item, itemType) => {
    setRemainingDetails(prev => {
      const exists = prev.find(d => d.selectedItem === item && d.itemType === itemType);
      if (exists) {
        return prev.filter(d => !(d.selectedItem === item && d.itemType === itemType));
      } else {
        return [...prev, { selectedItem: item, itemType }];
      }
    });
  };

  const closeAllocationDetails = (item, itemType) => {
    setAllocationDetails(prev => prev.filter(d => !(d.selectedItem === item && d.itemType === itemType)));
  };

  const closeSalesDetails = (item, itemType) => {
    setSalesDetails(prev => prev.filter(d => !(d.selectedItem === item && d.itemType === itemType)));
  };

  const closeRemainingDetails = (item, itemType) => {
    setRemainingDetails(prev => prev.filter(d => !(d.selectedItem === item && d.itemType === itemType)));
  };

  // Render detailed breakdown for a specific section
  const renderSectionBreakdown = (details, sectionType, closeFunction) => {
    if (!details.selectedItem) return null;

    const itemName = details.selectedItem;
    const filterKey = details.itemType === 'scheme' ? 'scheme_name' : 'component';
    const itemData = tableData.filter(item => item[filterKey] === itemName);

    const breakdown = itemData.reduce((acc, item) => {
      const vidhanSabha = item.vidhan_sabha_name;
      const vikasKhand = item.vikas_khand_name;
      const source = item.source_of_receipt;

      if (!acc[vidhanSabha]) {
        acc[vidhanSabha] = {};
      }
      if (!acc[vidhanSabha][vikasKhand]) {
        acc[vidhanSabha][vikasKhand] = {};
      }
      if (!acc[vidhanSabha][vikasKhand][source]) {
        acc[vidhanSabha][vikasKhand][source] = [];
      }
      acc[vidhanSabha][vikasKhand][source].push(item);
      return acc;
    }, {});

    const getTitle = () => {
      const typeLabel = details.itemType === 'scheme' ? 'योजना' : 'घटक';
      switch(sectionType) {
        case 'allocation': return `${typeLabel} आवंटन विवरण: ${itemName}`;
        case 'sales': return `${typeLabel} बिक्री विवरण: ${itemName}`;
        case 'remaining': return `${typeLabel} शेष राशि विवरण: ${itemName}`;
        default: return `${itemName} विवरण`;
      }
    };

    return (
      <div className="mt-2 p-2 border rounded bg-light compact-breakdown">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 text-primary">{getTitle()}</h6>
          <Button variant="outline-secondary" size="sm" onClick={closeFunction}>
            <FaTimes />
          </Button>
        </div>
        <div className="breakdown-content compact-breakdown-content">
          {Object.entries(breakdown).map(([vidhanSabha, vikasKhands]) => (
            <div key={vidhanSabha} className="mb-2">
              <h6 className="text-success fw-bold mb-2">{vidhanSabha}</h6>
              {Object.entries(vikasKhands).map(([vikasKhand, sources]) => (
                <div key={vikasKhand} className="mb-2 ms-2">
                  <div className="fw-bold text-info mb-1">{vikasKhand}</div>
                  {Object.entries(sources).map(([source, records]) => (
                    <div key={source} className="mb-1 ms-2 p-1 border rounded bg-white compact-source-card">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold text-dark">{source}</span>
                        <div className="d-flex align-items-center gap-2">
                          <small className="text-muted">{records.length} रिकॉर्ड</small>
                          <div className="btn-group btn-group-sm" role="group">
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="compact-action-btn"
                              title="आवंटन देखें"
                            >
                              <FaEye size={10} />
                            </Button>
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              className="compact-action-btn"
                              title="बिक्री देखें"
                            >
                              <FaChartBar size={10} />
                            </Button>
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              className="compact-action-btn"
                              title="विवरण देखें"
                            >
                              <FaList size={10} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="compact-data-line">
                        {records.map((record, index) => {
                          const allocated = parseFloat(record.allocated_quantity) * parseFloat(record.rate);
                          const sold = parseFloat(record.updated_quantity) * parseFloat(record.rate);
                          const remaining = allocated - sold;

                          return (
                            <div key={index} className="small text-muted mb-0 single-line-data">
                              <>
                                <span className="data-item">
                                  मात्रा: <strong>{record.allocated_quantity}</strong>
                                </span>
                                <span className="separator">|</span>
                                <span className="data-item">
                                  दर: <strong>₹{record.rate}</strong>
                                </span>
                                {sectionType === 'allocation' && (
                                  <>
                                    <span className="separator">|</span>
                                    <span className="data-item text-primary">
                                      आवंटित: <strong>₹{allocated.toFixed(2)}</strong>
                                    </span>
                                  </>
                                )}
                                {sectionType === 'sales' && (
                                  <>
                                    <span className="separator">|</span>
                                    <span className="data-item text-success">
                                      बेचा गया: <strong>₹{sold.toFixed(2)}</strong>
                                    </span>
                                  </>
                                )}
                                {sectionType === 'remaining' && (
                                  <>
                                    <span className="separator">|</span>
                                    <span className="data-item text-info">
                                      शेष: <strong>₹{remaining.toFixed(2)}</strong>
                                    </span>
                                  </>
                                )}
                              </>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get filtered data based on selections for scheme/component filter
  const getFilteredData = () => {
    let filteredData = tableData;
    
    if (selectedSchemes.size > 0) {
      filteredData = filteredData.filter(item => selectedSchemes.has(item.scheme_name));
    }
    
    if (selectedComponents.size > 0) {
      filteredData = filteredData.filter(item => selectedComponents.has(item.component));
    }
    
    return filteredData;
  };

  // Get filtered data based on selections for source filter
  const getSourceFilteredData = () => {
    let filteredData = tableData;
    
    if (selectedSources.size > 0) {
      filteredData = filteredData.filter(item => selectedSources.has(item.source_of_receipt));
    }
    
    return filteredData;
  };

  // Get unique values for scheme/component filtered data
  const filteredData = useMemo(() => getFilteredData(), [tableData, selectedSchemes, selectedComponents]);
  
  const filteredUniqueSchemes = useMemo(() => {
    return [...new Set(filteredData.map(item => item.scheme_name))].filter(Boolean).sort();
  }, [filteredData]);

  const filteredUniqueInvestments = useMemo(() => {
    return [...new Set(filteredData.map(item => item.investment_name))].filter(Boolean).sort();
  }, [filteredData]);

  const filteredUniqueComponents = useMemo(() => {
    return [...new Set(filteredData.map(item => item.component))].filter(Boolean).sort();
  }, [filteredData]);

  const filteredUniqueSources = useMemo(() => {
    return [...new Set(filteredData.map(item => item.source_of_receipt))].filter(Boolean).sort();
  }, [filteredData]);

  // Get unique values for source filtered data
  const sourceFilteredData = useMemo(() => getSourceFilteredData(), [tableData, selectedSources]);
  
  const sourceFilteredUniqueSchemes = useMemo(() => {
    return [...new Set(sourceFilteredData.map(item => item.scheme_name))].filter(Boolean).sort();
  }, [sourceFilteredData]);

  const sourceFilteredUniqueInvestments = useMemo(() => {
    return [...new Set(sourceFilteredData.map(item => item.investment_name))].filter(Boolean).sort();
  }, [sourceFilteredData]);

  const sourceFilteredUniqueComponents = useMemo(() => {
    return [...new Set(sourceFilteredData.map(item => item.component))].filter(Boolean).sort();
  }, [sourceFilteredData]);

  const sourceFilteredUniqueSources = useMemo(() => {
    return [...new Set(sourceFilteredData.map(item => item.source_of_receipt))].filter(Boolean).sort();
  }, [sourceFilteredData]);

  // Source filtered totals
  const sourceFilteredTotals = useMemo(() => {
    const totalAllocated = sourceFilteredData.reduce((sum, item) =>
      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
    const totalUpdated = sourceFilteredData.reduce((sum, item) =>
      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
    const totalRemaining = totalAllocated - totalUpdated;
    
    return {
      totalAllocated,
      totalUpdated,
      totalRemaining,
      placesCount: sourceFilteredData.length
    };
  }, [sourceFilteredData]);

  const filteredTotals = useMemo(() => {
    const totalAllocated = filteredData.reduce((sum, item) =>
      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
    const totalUpdated = filteredData.reduce((sum, item) =>
      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
    const totalRemaining = totalAllocated - totalUpdated;
    
    return {
      totalAllocated,
      totalUpdated,
      totalRemaining,
      placesCount: filteredData.length
    };
  }, [filteredData]);

  // Get color for the center
  const centerColor = useMemo(() => {
    const colors = generateCenterColors(1);
    return colors[0];
  }, []);

  const textColor = getContrastColor(centerColor);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="table-details-modal compact-modal-cards"
      dialogClassName="modal-90w"
    >
      <Modal.Header closeButton onClick={onHide} className="modal-title">
        <Modal.Title>{centerName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Summary Statistics Cards - Always Visible at Top */}
        <Card className="mb-3">
          <Card.Header className="fillter-heading">
            <h6 className="mb-0"><FaChartBar className="me-2" /> सारांश आँकड़े</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={2}>
                <div
                  className="text-center summary-card border rounded clickable-card"
                  onClick={() => toggleCollapse('hierarchy')}
                  style={{ cursor: 'pointer' }}
                  title="क्लिक करें: विधानसभा और विकासखंड देखें"
                >
                  
                  <h5 className="text-primary mb-1"><FaGavel size={16} className="text-primary mb-1 mx-1" />{uniqueVidhanSabhas.length}</h5>
                  <small className="text-muted">विधानसभा</small>
                </div>
              </Col>
              <Col md={2}>
                <div
                  className="text-center summary-card border rounded clickable-card"
                  onClick={() => toggleCollapse('hierarchy')}
                  style={{ cursor: 'pointer' }}
                  title="क्लिक करें: विकासखंड और विधानसभा देखें"
                >
                  
                  <h5 className="text-success mb-1"><FaMapMarkerAlt size={16} className="text-success mb-1 mx-1" />{uniqueVikasKhands.length}</h5>
                  <small className="text-muted">विकासखंड</small>
                </div>
              </Col>
              <Col md={2}>
                <div
                  className="text-center summary-card border rounded clickable-card"
                  onClick={() => toggleCollapse('filter')}
                  style={{ cursor: 'pointer' }}
                  title="क्लिक करें: योजनाएं और निवेश देखें"
                >
                  
                  <h5 className="text-info mb-1"><FaPiggyBank size={16} className="text-info mb-1 mx-1" />{uniqueSchemes.length}</h5>
                  <small className="text-muted">योजनाएं</small>
                </div>
              </Col>
              <Col md={2}>
                <div
                  className="text-center summary-card border rounded clickable-card"
                  onClick={() => toggleCollapse('filter')}
                  style={{ cursor: 'pointer' }}
                  title="क्लिक करें: निवेश और योजनाएं देखें"
                >
                  
                  <h5 className="text-warning mb-1"><FaPuzzlePiece size={16} className="text-warning mb-1 mx-1" />{uniqueInvestments.length}</h5>
                  <small className="text-muted">निवेश</small>
                </div>
              </Col>
              <Col md={2}>
                <div
                  className="text-center summary-card border rounded clickable-card"
                  onClick={() => toggleCollapse('filter')}
                  style={{ cursor: 'pointer' }}
                  title="क्लिक करें: घटक और योजनाएं देखें"
                >
                  
                  <h5 className="text-secondary mb-1"><FaLayerGroup size={16} className="text-secondary mb-1 mx-1" />{uniqueComponents.length}</h5>
                  <small className="text-muted">घटक</small>
                </div>
              </Col>
              <Col md={2}>
                <div
                  className="text-center summary-card border rounded clickable-card"
                  onClick={() => toggleCollapse('sources')}
                  style={{ cursor: 'pointer' }}
                  title="क्लिक करें: स्रोत और योजनाएं देखें"
                >
                 <div>
                  <h5 className="text-dark mb-1"> <FaTags size={16} className="text-dark mb-1 mx-1" />{uniqueSources.length}</h5></div>
                  <small className="text-muted">स्रोत</small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Center Information Header */}
        <Card className="mb-3" style={{ backgroundColor: centerColor, border: '1px solid rgba(0,0,0,0.125)' }}>
          <Card.Header style={{ backgroundColor: centerColor, color: textColor, borderBottom: '1px solid rgba(0,0,0,0.125)' }}>
            <Row>
              <Col md={6}>
                <div className="mb-0 modal-card-title ">{centerName}</div>
              </Col>
              <Col md={6} className="text-end">
                <div className="d-flex flex-row align-items-end">
                  <span
                    className="badge bg-light text-dark mb-1 clickable-badge"
                    title={`कुल स्थान: ${totals.placesCount} - इस केंद्र में शामिल अद्वितीय विकासखंड | कुल रिकॉर्ड: ${totals.recordsCount} | क्लिक करें विवरण देखने के लिए`}
                    data-bs-toggle="tooltip"
                    data-bs-placement="left"
                    onClick={() => toggleCollapse('places')}
                    style={{ cursor: 'pointer' }}
                  >
                    कुल स्थान: {totals.placesCount}
                  </span>
                  <span
                    className="badge bg-light text-dark mb-1 clickable-badge"
                    title={`कुल आवंटित राशि: ${formatCurrency(totals.totalAllocated)} - सभी मदों के लिए आवंटित धनराशि | क्लिक करें विवरण देखने के लिए`}
                    data-bs-toggle="tooltip"
                    data-bs-placement="left"
                    onClick={() => toggleCollapse('allocation')}
                    style={{ cursor: 'pointer' }}
                  >
                    कुल आवंटित: {formatCurrency(totals.totalAllocated)}
                  </span>
                  <span
                    className="badge bg-light text-dark mb-1 clickable-badge"
                    title={`कुल बेची गई राशि: ${formatCurrency(totals.totalUpdated)} - अब तक बेची गई धनराशि | क्लिक करें विवरण देखने के लिए`}
                    data-bs-toggle="tooltip"
                    data-bs-placement="left"
                    onClick={() => toggleCollapse('sales')}
                    style={{ cursor: 'pointer' }}
                  >
                    कुल बेचा गया: {formatCurrency(totals.totalUpdated)}
                  </span>
                  <span
                    className="badge bg-light text-dark clickable-badge"
                    title={`शेष राशि: ${formatCurrency(totals.totalRemaining)} - अभी भी बेचने के लिए शेष धनराशि | क्लिक करें विवरण देखने के लिए`}
                    data-bs-toggle="tooltip"
                    data-bs-placement="left"
                    onClick={() => toggleCollapse('remaining')}
                    style={{ cursor: 'pointer' }}
                  >
                    शेष राशि: {formatCurrency(totals.totalRemaining)}
                  </span>
                </div>
              </Col>
            </Row>
          </Card.Header>
        </Card>

        {/* Places Breakdown Section */}
        <Card className="mb-3" id="places-section">
          <Card.Header
            onClick={() => toggleCollapse('places')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaBuilding className="me-2" /> स्थान विवरण</span>
            {collapsedSections.places ? <FaChevronDown /> : <FaChevronUp />}
          </Card.Header>
          <Collapse in={!collapsedSections.places}>
            <Card.Body>
              <div className="text-center mb-2">
                <h6 className="text-primary fw-bold">कुल स्थान: {uniqueVikasKhands.length}</h6>
              </div>
              <div className="places-grid">
                {uniqueVikasKhands.map((vikasKhand, index) => (
                  <Badge
                    key={index}
                    bg="primary"
                    className="me-2 mb-2 p-2"
                    style={{ fontSize: '14px' }}
                  >
                    {vikasKhand}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Collapse>
        </Card>

        {/* Allocation Breakdown Section */}
        <Card className="mb-3" id="allocation-section">
          <Card.Header
            onClick={() => toggleCollapse('allocation')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaPiggyBank className="me-2" /> आवंटन विवरण</span>
            {collapsedSections.allocation ? <FaChevronDown /> : <FaChevronUp />}
          </Card.Header>
          <Collapse in={!collapsedSections.allocation}>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6 className="text-info fw-bold mb-2">योजना अनुसार आवंटन</h6>
                  {uniqueSchemes.map((scheme, index) => {
                    const schemeData = tableData.filter(item => item.scheme_name === scheme);
                    const totalAllocated = schemeData.reduce((sum, item) =>
                      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
                    const isSelected = allocationDetails.some(d => d.selectedItem === scheme && d.itemType === 'scheme');
                    return (
                      <div
                        key={index}
                        className={`mb-2 p-2 border rounded clickable-detail-item compact-detail-item ${isSelected ? 'selected-detail' : ''}`}
                        onClick={() => showAllocationDetails(scheme, 'scheme')}
                        style={{ cursor: 'pointer' }}
                        title="क्लिक करें विस्तृत आवंटन विवरण देखने के लिए"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{scheme}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-info">{formatCurrency(totalAllocated)}</span>
                            <div className="btn-group btn-group-sm" role="group">
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="compact-action-btn"
                                title="आवंटन देखें"
                              >
                                <FaEye size={10} />
                              </Button>
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                className="compact-action-btn"
                                title="विवरण देखें"
                              >
                                <FaList size={10} />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <small className="text-muted">{schemeData.length} रिकॉर्ड</small>
                      </div>
                    );
                  })}
                </Col>
                <Col md={6}>
                  <h6 className="text-warning fw-bold mb-2">घटक अनुसार आवंटन</h6>
                  {uniqueComponents.map((component, index) => {
                    const componentData = tableData.filter(item => item.component === component);
                    const totalAllocated = componentData.reduce((sum, item) =>
                      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
                    const isSelected = allocationDetails.some(d => d.selectedItem === component && d.itemType === 'component');
                    return (
                      <div
                        key={index}
                        className={`mb-2 p-2 border rounded clickable-detail-item compact-detail-item ${isSelected ? 'selected-detail' : ''}`}
                        onClick={() => showAllocationDetails(component, 'component')}
                        style={{ cursor: 'pointer' }}
                        title="क्लिक करें विस्तृत आवंटन विवरण देखने के लिए"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{component}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-warning">{formatCurrency(totalAllocated)}</span>
                            <div className="btn-group btn-group-sm" role="group">
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="compact-action-btn"
                                title="आवंटन देखें"
                              >
                                <FaEye size={10} />
                              </Button>
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                className="compact-action-btn"
                                title="विवरण देखें"
                              >
                                <FaList size={10} />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <small className="text-muted">{componentData.length} रिकॉर्ड</small>
                      </div>
                    );
                  })}
                </Col>
              </Row>
              {allocationDetails.map(detail => renderSectionBreakdown(detail, 'allocation', () => closeAllocationDetails(detail.selectedItem, detail.itemType)))}
            </Card.Body>
          </Collapse>
        </Card>

        {/* Sales Breakdown Section */}
        <Card className="mb-3" id="sales-section">
          <Card.Header
            onClick={() => toggleCollapse('sales')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaChartBar className="me-2" /> बिक्री विवरण</span>
            {collapsedSections.sales ? <FaChevronDown /> : <FaChevronUp />}
          </Card.Header>
          <Collapse in={!collapsedSections.sales}>
            <Card.Body>
              <div className="text-center mb-2">
                <div className="alert alert-warning">
                  <h6>कुल बेची गई राशि: {formatCurrency(totals.totalUpdated)}</h6>
                  <p className="mb-0">वर्तमान में कोई बिक्री रिकॉर्ड नहीं है</p>
                </div>
              </div>
              <Row>
                <Col md={6}>
                  <h6 className="text-secondary fw-bold mb-2">योजना अनुसार बिक्री</h6>
                  {uniqueSchemes.map((scheme, index) => {
                    const schemeData = tableData.filter(item => item.scheme_name === scheme);
                    const totalSold = schemeData.reduce((sum, item) =>
                      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
                    const isSelected = salesDetails.some(d => d.selectedItem === scheme && d.itemType === 'scheme');
                    return (
                      <div
                        key={index}
                        className={`mb-2 p-2 border rounded clickable-detail-item compact-detail-item ${isSelected ? 'selected-detail' : ''}`}
                        onClick={() => showSalesDetails(scheme, 'scheme')}
                        style={{ cursor: 'pointer' }}
                        title="क्लिक करें विस्तृत बिक्री विवरण देखने के लिए"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{scheme}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-secondary">{formatCurrency(totalSold)}</span>
                            <div className="btn-group btn-group-sm" role="group">
                              <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                className="compact-action-btn"
                                title="बिक्री देखें"
                              >
                                <FaChartBar size={10} />
                              </Button>
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                className="compact-action-btn"
                                title="विवरण देखें"
                              >
                                <FaList size={10} />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <small className="text-muted">{schemeData.length} रिकॉर्ड</small>
                      </div>
                    );
                  })}
                </Col>
                <Col md={6}>
                  <h6 className="text-dark fw-bold mb-2">घटक अनुसार बिक्री</h6>
                  {uniqueComponents.map((component, index) => {
                    const componentData = tableData.filter(item => item.component === component);
                    const totalSold = componentData.reduce((sum, item) =>
                      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
                    const isSelected = salesDetails.some(d => d.selectedItem === component && d.itemType === 'component');
                    return (
                      <div
                        key={index}
                        className={`mb-2 p-2 border rounded clickable-detail-item compact-detail-item ${isSelected ? 'selected-detail' : ''}`}
                        onClick={() => showSalesDetails(component, 'component')}
                        style={{ cursor: 'pointer' }}
                        title="क्लिक करें विस्तृत बिक्री विवरण देखने के लिए"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{component}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-dark">{formatCurrency(totalSold)}</span>
                            <div className="btn-group btn-group-sm" role="group">
                              <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                className="compact-action-btn"
                                title="बिक्री देखें"
                              >
                                <FaChartBar size={10} />
                              </Button>
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                className="compact-action-btn"
                                title="विवरण देखें"
                              >
                                <FaList size={10} />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <small className="text-muted">{componentData.length} रिकॉर्ड</small>
                      </div>
                    );
                  })}
                </Col>
              </Row>
              {salesDetails.map(detail => renderSectionBreakdown(detail, 'sales', () => closeSalesDetails(detail.selectedItem, detail.itemType)))}
            </Card.Body>
          </Collapse>
        </Card>

        {/* Remaining Amount Breakdown Section */}
        <Card className="mb-3" id="remaining-section">
          <Card.Header
            onClick={() => toggleCollapse('remaining')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaLayerGroup className="me-2" /> शेष राशि विवरण</span>
            {collapsedSections.remaining ? <FaChevronDown /> : <FaChevronUp />}
          </Card.Header>
          <Collapse in={!collapsedSections.remaining}>
            <Card.Body>
              <div className="text-center mb-2">
                <div className="alert alert-success">
                  <h6>कुल शेष राशि: {formatCurrency(totals.totalRemaining)}</h6>
                  <p className="mb-0">बेचने के लिए उपलब्ध राशि</p>
                </div>
              </div>
              <Row>
                <Col md={6}>
                  <h6 className="text-primary fw-bold mb-2">योजना अनुसार शेष</h6>
                  {uniqueSchemes.map((scheme, index) => {
                    const schemeData = tableData.filter(item => item.scheme_name === scheme);
                    const totalAllocated = schemeData.reduce((sum, item) =>
                      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
                    const totalSold = schemeData.reduce((sum, item) =>
                      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
                    const remaining = totalAllocated - totalSold;
                    const isSelected = remainingDetails.some(d => d.selectedItem === scheme && d.itemType === 'scheme');
                    return (
                      <div
                        key={index}
                        className={`mb-2 p-2 border rounded clickable-detail-item compact-detail-item ${isSelected ? 'selected-detail' : ''}`}
                        onClick={() => showRemainingDetails(scheme, 'scheme')}
                        style={{ cursor: 'pointer' }}
                        title="क्लिक करें विस्तृत शेष राशि विवरण देखने के लिए"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{scheme}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary">{formatCurrency(remaining)}</span>
                            <div className="btn-group btn-group-sm" role="group">
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="compact-action-btn"
                                title="शेष राशि देखें"
                              >
                                <FaLayerGroup size={10} />
                              </Button>
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                className="compact-action-btn"
                                title="विवरण देखें"
                              >
                                <FaList size={10} />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <small className="text-muted single-line-data">
                          <span className="data-item">आवंटित: <strong>{formatCurrency(totalAllocated)}</strong></span>
                          <span className="separator">|</span>
                          <span className="data-item">बेचा: <strong>{formatCurrency(totalSold)}</strong></span>
                        </small>
                      </div>
                    );
                  })}
                </Col>
                <Col md={6}>
                  <h6 className="text-info fw-bold mb-2">घटक अनुसार शेष</h6>
                  {uniqueComponents.map((component, index) => {
                    const componentData = tableData.filter(item => item.component === component);
                    const totalAllocated = componentData.reduce((sum, item) =>
                      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
                    const totalSold = componentData.reduce((sum, item) =>
                      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
                    const remaining = totalAllocated - totalSold;
                    const isSelected = remainingDetails.some(d => d.selectedItem === component && d.itemType === 'component');
                    return (
                      <div
                        key={index}
                        className={`mb-2 p-2 border rounded clickable-detail-item compact-detail-item ${isSelected ? 'selected-detail' : ''}`}
                        onClick={() => showRemainingDetails(component, 'component')}
                        style={{ cursor: 'pointer' }}
                        title="क्लिक करें विस्तृत शेष राशि विवरण देखने के लिए"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{component}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-info">{formatCurrency(remaining)}</span>
                            <div className="btn-group btn-group-sm" role="group">
                              <Button 
                                variant="outline-info" 
                                size="sm" 
                                className="compact-action-btn"
                                title="शेष राशि देखें"
                              >
                                <FaLayerGroup size={10} />
                              </Button>
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                className="compact-action-btn"
                                title="विवरण देखें"
                              >
                                <FaList size={10} />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <small className="text-muted single-line-data">
                          <span className="data-item">आवंटित: <strong>{formatCurrency(totalAllocated)}</strong></span>
                          <span className="separator">|</span>
                          <span className="data-item">बेचा: <strong>{formatCurrency(totalSold)}</strong></span>
                        </small>
                      </div>
                    );
                  })}
                </Col>
              </Row>
              {remainingDetails.map(detail => renderSectionBreakdown(detail, 'remaining', () => closeRemainingDetails(detail.selectedItem, detail.itemType)))}
            </Card.Body>
          </Collapse>
        </Card>


        {/* Hierarchical Structure Section */}
        <Card className="mb-3" id="hierarchy-section">
          <Card.Header
            onClick={() => toggleCollapse('hierarchy')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaList className="me-2" /> पदानुक्रमिक संरचना</span>
            {collapsedSections.hierarchy ? <FaChevronDown /> : <FaChevronUp />}
          </Card.Header>
          <Collapse in={!collapsedSections.hierarchy}>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="hierarchy-section">
                    <h6 className="text-primary fw-bold mb-2">विधानसभा → विकासखंड</h6>
                    {Object.entries(hierarchicalData).map(([vidhanSabha, data]) => (
                      <div key={vidhanSabha} className="mb-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">{vidhanSabha}</span>
                          <span className="badge bg-light text-dark">{data.vikasKhands.length}</span>
                        </div>
                        <div className="compact-badges">
                          {data.vikasKhands.map((vikasKhand, index) => {
                            const tooltipData = getTooltipData('vikasKhand', vikasKhand, tableData);
                            const tooltipContent = getTooltipContent('vikasKhand', vikasKhand, tooltipData, tableData);
                            
                            return (
                              <Badge
                                key={index}
                                bg="light"
                                text="dark"
                                className="me-1 small"
                                title={tooltipContent}
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                              >
                                {vikasKhand}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="hierarchy-section">
                    <h6 className="text-success fw-bold mb-2">योजनाएं → निवेश</h6>
                    {Object.entries(hierarchicalData).map(([vidhanSabha, data]) => (
                      <div key={vidhanSabha} className="mb-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">{vidhanSabha}</span>
                          <span className="badge bg-light text-dark">{data.schemes.length}</span>
                        </div>
                        <div className="compact-list">
                          {data.schemes.map((scheme, index) => {
                            const schemeKey = `${vidhanSabha}-${scheme}`;
                            const isCollapsed = collapsedSchemes.has(schemeKey);
                            const schemeInvestments = data.schemeInvestments[scheme] || [];
                            
                            return (
                              <div key={index} className="compact-item">
                                <div
                                  className="scheme-header"
                                  onClick={() => toggleSchemeCollapse(schemeKey)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <span className="scheme-name">{scheme}</span>
                                  <span className="investment-count">({schemeInvestments.length})</span>
                                  <span className="collapse-indicator">
                                    {isCollapsed ? '▼' : '▶'}
                                  </span>
                                </div>
                                <div className={`investment-badges ${isCollapsed ? 'show' : 'hide'}`}>
                                  {schemeInvestments.map((investment, invIndex) => {
                                    const tooltipData = getTooltipData('investment', investment, tableData);
                                    const tooltipContent = getTooltipContent('investment', investment, tooltipData, tableData);
                                    
                                    return (
                                      <Badge
                                        key={invIndex}
                                        bg="light"
                                        text="dark"
                                        className="me-1 small"
                                        title={tooltipContent}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                      >
                                        {investment}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Collapse>
        </Card>

        {/* Multi-Select Filtering Section */}
        <Card className="mb-3" id="filter-section">
          <Card.Header
            onClick={() => toggleCollapse('filter')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaPiggyBank className="me-2" /> योजनाएं और निवेश फ़िल्टर</span>
            {collapsedSections.filter ? <FaChevronDown /> : <FaChevronUp />}
          </Card.Header>
          <Collapse in={!collapsedSections.filter}>
            <Card.Body>
              <Row>
                {/* Left Side: Selection Panel */}
                <Col md={6}>
                  <div className="selection-panel">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">फ़िल्टर विकल्प</h6>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={clearSelections}
                        disabled={selectedSchemes.size === 0 && selectedComponents.size === 0}
                      >
                        सभी हटाएं
                      </Button>
                    </div>
                    
                    {/* Schemes Selection */}
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2 text-info">सभी योजनाएं ({uniqueSchemes.length})</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {uniqueSchemes.map((scheme, index) => {
                          const tooltipData = getTooltipData('scheme', scheme, tableData);
                          const tooltipContent = getTooltipContent('scheme', scheme, tooltipData, tableData);
                          
                          return (
                            <Badge
                              key={index}
                              bg={selectedSchemes.has(scheme) ? "info" : "light"}
                              text={selectedSchemes.has(scheme) ? "dark" : "dark"}
                              className="p-2 selectable-badge"
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleScheme(scheme)}
                              title={selectedSchemes.has(scheme) ? "हटाएं" : "चुनें"}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                            >
                              {scheme}
                              {selectedSchemes.has(scheme) && <span className="ms-1">✓</span>}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Components Selection */}
                    <div>
                      <h6 className="fw-bold mb-2 text-secondary">घटक ({uniqueComponents.length})</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {uniqueComponents.map((component, index) => {
                          const tooltipData = getTooltipData('component', component, tableData);
                          const tooltipContent = getTooltipContent('component', component, tooltipData, tableData);
                          
                          return (
                            <Badge
                              key={index}
                              bg={selectedComponents.has(component) ? "secondary" : "light"}
                              text={selectedComponents.has(component) ? "light" : "dark"}
                              className="p-2 selectable-badge"
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleComponent(component)}
                              title={selectedComponents.has(component) ? "हटाएं" : "चुनें"}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                            >
                              {component}
                              {selectedComponents.has(component) && <span className="ms-1">✓</span>}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Right Side: Filtered Results */}
                <Col md={6}>
                  <div className="results-panel">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">फ़िल्टर्ड परिणाम</h6>
                      <div className="text-end">
                        <small className="text-muted">
                          चयनित: {selectedSchemes.size + selectedComponents.size}
                        </small>
                      </div>
                    </div>

                    {/* Filtered Summary */}
                    <div className="mb-3">
                      <div className="bg-light p-2 rounded">
                        <div className="row text-center">
                          <div className="col-4">
                            <div className="fw-bold text-info">{filteredData.length}</div>
                            <small className="text-muted">रिकॉर्ड</small>
                          </div>
                          <div className="col-4">
                            <div className="fw-bold text-success">{formatCurrency(filteredTotals.totalAllocated)}</div>
                            <small className="text-muted">आवंटित</small>
                          </div>
                          <div className="col-4">
                            <div className="fw-bold text-warning">{formatCurrency(filteredTotals.totalUpdated)}</div>
                            <small className="text-muted">बेचा गया</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Filtered Categories Grid */}
                    <div className="filtered-categories-grid">
                      {/* Filtered Schemes */}
                      {filteredUniqueSchemes.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaPiggyBank className="me-1 text-info" />
                            <h6 className="fw-bold mb-1 text-info">योजनाएं ({filteredUniqueSchemes.length})</h6>
                          </div>
                          <div className="category-content">
                            {filteredUniqueSchemes.map((scheme, index) => {
                              const tooltipData = getTooltipData('scheme', scheme, filteredData);
                              const tooltipContent = getTooltipContent('scheme', scheme, tooltipData, filteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-info text-white"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {scheme}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Filtered Investments */}
                      {filteredUniqueInvestments.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaPuzzlePiece className="me-1 text-warning" />
                            <h6 className="fw-bold mb-1 text-warning">निवेश ({filteredUniqueInvestments.length})</h6>
                          </div>
                          <div className="category-content">
                            {filteredUniqueInvestments.map((investment, index) => {
                              const tooltipData = getTooltipData('investment', investment, filteredData);
                              const tooltipContent = getTooltipContent('investment', investment, tooltipData, filteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-warning text-dark"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {investment}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Filtered Components */}
                      {filteredUniqueComponents.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaLayerGroup className="me-1 text-secondary" />
                            <h6 className="fw-bold mb-1 text-secondary">घटक ({filteredUniqueComponents.length})</h6>
                          </div>
                          <div className="category-content">
                            {filteredUniqueComponents.map((component, index) => {
                              const tooltipData = getTooltipData('component', component, filteredData);
                              const tooltipContent = getTooltipContent('component', component, tooltipData, filteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-secondary text-light"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {component}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Filtered Sources */}
                      {filteredUniqueSources.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaTags className="me-1 text-dark" />
                            <h6 className="fw-bold mb-1 text-dark">स्रोत ({filteredUniqueSources.length})</h6>
                          </div>
                          <div className="category-content">
                            {filteredUniqueSources.map((source, index) => {
                              const tooltipData = getTooltipData('source', source, filteredData);
                              const tooltipContent = getTooltipContent('source', source, tooltipData, filteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-dark text-light"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {source}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* No Selection Message */}
                    {selectedSchemes.size === 0 && selectedComponents.size === 0 && (
                      <div className="text-center text-muted py-4">
                        <FaPiggyBank size={32} className="mb-2" />
                        <div>कोई फ़िल्टर नहीं चुना गया</div>
                        <small>योजनाएं या घटक चुनें ताकि परिणाम दिखाई दें</small>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Collapse>
        </Card>

        {/* Source Filtering Section */}
        <Card className="mb-3" id="sources-section">
          <Card.Header
            onClick={() => toggleCollapse('sources')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaTags className="me-2" /> स्रोत फ़िल्टर</span>
            {collapsedSections.sources ? <FaChevronDown /> : <FaChevronUp />}
          </Card.Header>
          <Collapse in={!collapsedSections.sources}>
            <Card.Body>
              <Row>
                {/* Left Side: Source Selection Panel */}
                <Col md={6}>
                  <div className="selection-panel">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">स्रोत चयन</h6>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={clearSourceSelections}
                        disabled={selectedSources.size === 0}
                      >
                        सभी हटाएं
                      </Button>
                    </div>
                    
                    {/* Sources Selection */}
                    <div>
                      <h6 className="fw-bold mb-2 text-dark">सभी स्रोत ({uniqueSources.length})</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {uniqueSources.map((source, index) => {
                          const tooltipData = getTooltipData('source', source, tableData);
                          const tooltipContent = getTooltipContent('source', source, tooltipData, tableData);
                          
                          return (
                            <Badge
                              key={index}
                              bg={selectedSources.has(source) ? "dark" : "light"}
                              text={selectedSources.has(source) ? "light" : "dark"}
                              className="p-2 selectable-badge"
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleSource(source)}
                              title={selectedSources.has(source) ? "हटाएं" : "चुनें"}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                            >
                              {source}
                              {selectedSources.has(source) && <span className="ms-1">✓</span>}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Right Side: Source Filtered Results */}
                <Col md={6}>
                  <div className="results-panel">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">स्रोत आधारित परिणाम</h6>
                      <div className="text-end">
                        <small className="text-muted">
                          चयनित: {selectedSources.size}
                        </small>
                      </div>
                    </div>

                    {/* Source Filtered Summary */}
                    <div className="mb-3">
                      <div className="bg-light p-2 rounded">
                        <div className="row text-center">
                          <div className="col-4">
                            <div className="fw-bold text-info">{sourceFilteredData.length}</div>
                            <small className="text-muted">रिकॉर्ड</small>
                          </div>
                          <div className="col-4">
                            <div className="fw-bold text-success">{formatCurrency(sourceFilteredTotals.totalAllocated)}</div>
                            <small className="text-muted">आवंटित</small>
                          </div>
                          <div className="col-4">
                            <div className="fw-bold text-warning">{formatCurrency(sourceFilteredTotals.totalUpdated)}</div>
                            <small className="text-muted">बेचा गया</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Source Filtered Categories Grid */}
                    <div className="filtered-categories-grid">
                      {/* Filtered Schemes */}
                      {sourceFilteredUniqueSchemes.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaPiggyBank className="me-1 text-info" />
                            <h6 className="fw-bold mb-1 text-info">योजनाएं ({sourceFilteredUniqueSchemes.length})</h6>
                          </div>
                          <div className="category-content">
                            {sourceFilteredUniqueSchemes.map((scheme, index) => {
                              const tooltipData = getTooltipData('scheme', scheme, sourceFilteredData);
                              const tooltipContent = getTooltipContent('scheme', scheme, tooltipData, sourceFilteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-info text-white"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {scheme}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Filtered Investments */}
                      {sourceFilteredUniqueInvestments.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaPuzzlePiece className="me-1 text-warning" />
                            <h6 className="fw-bold mb-1 text-warning">निवेश ({sourceFilteredUniqueInvestments.length})</h6>
                          </div>
                          <div className="category-content">
                            {sourceFilteredUniqueInvestments.map((investment, index) => {
                              const tooltipData = getTooltipData('investment', investment, sourceFilteredData);
                              const tooltipContent = getTooltipContent('investment', investment, tooltipData, sourceFilteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-warning text-dark"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {investment}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Filtered Components */}
                      {sourceFilteredUniqueComponents.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaLayerGroup className="me-1 text-secondary" />
                            <h6 className="fw-bold mb-1 text-secondary">घटक ({sourceFilteredUniqueComponents.length})</h6>
                          </div>
                          <div className="category-content">
                            {sourceFilteredUniqueComponents.map((component, index) => {
                              const tooltipData = getTooltipData('component', component, sourceFilteredData);
                              const tooltipContent = getTooltipContent('component', component, tooltipData, sourceFilteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-secondary text-light"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {component}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* No Selection Message */}
                    {selectedSources.size === 0 && (
                      <div className="text-center text-muted py-4">
                        <FaTags size={32} className="mb-2" />
                        <div>कोई स्रोत नहीं चुना गया</div>
                        <small>स्रोत चुनें ताकि परिणाम दिखाई दें</small>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Collapse>
        </Card>
      </Modal.Body>
    </Modal>
  );
};

export default TableDetailsModal;