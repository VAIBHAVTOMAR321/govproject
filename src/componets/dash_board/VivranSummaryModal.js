import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Modal,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Collapse,
  Form,
  Tab,
  Tabs,
} from "react-bootstrap";
import { MdOutlineCheck } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";

import {
  FaTimes,
  FaFileExcel,
  FaFilePdf,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import TableDetailsModal from "./TableDetailsModal";
import * as XLSX from "xlsx";
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";

// Function to generate distinct colors for centers
const generateCenterColors = (count) => {
  const colors = [];
  const hueStep = 360 / count;

  for (let i = 0; i < count; i++) {
    // Use HSL color space for better distribution
    const hue = i * hueStep;
    // Use high saturation and lightness to ensure visibility
    const saturation = 70;
    const lightness = 85;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }

  return colors;
};

// Function to get contrasting text color
const getContrastColor = (bgColor) => {
  // This is a simplified version - for production use, you might want a more robust solution
  // For light backgrounds, return dark text
  return "#333";
};

// Reusable Column Selection Component
const ColumnSelection = ({
  columns,
  selectedColumns,
  setSelectedColumns,
  title,
}) => {
  const handleColumnToggle = (columnKey) => {
    if (selectedColumns.includes(columnKey)) {
      setSelectedColumns(selectedColumns.filter((col) => col !== columnKey));
    } else {
      setSelectedColumns([...selectedColumns, columnKey]);
    }
  };

  const handleSelectAll = () => {
    setSelectedColumns(columns.map((col) => col.key));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  return (
    <div className="column-selection mb-3 p-3 border rounded bg-light">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="small-fonts mb-0">{title}</h6>
        <div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleSelectAll}
            className="me-2 fillter-add-btn"
          >
            <i className="delete-icon">
              <MdOutlineCheck />{" "}
            </i>{" "}
            सभी चुनें
          </Button>
          <Button
            variant="outline-secondary"
            className="fillter-remove-btn"
            size="sm"
            onClick={handleDeselectAll}
          >
            <i className="delete-icon">
              {" "}
              <RiDeleteBin6Line />
            </i>{" "}
            सभी हटाएं
          </Button>
        </div>
      </div>
      <Row>
        <Col>
          <div className="d-flex flex-wrap">
            {columns.map((col) => (
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
  { key: "center_name", label: "केंद्र का नाम" },
  { key: "vidhan_sabha_name", label: "विधानसभा का नाम" },
  { key: "vikas_khand_name", label: "विकासखंड का नाम" },
  { key: "component", label: "घटक" },
  { key: "investment_name", label: "निवेश का नाम" },
  { key: "sub_investment_name", label: "उप-निवेश का नाम" },
  { key: "allocated_quantity", label: "आवंटित मात्रा" },
  { key: "rate", label: "दर" },
  { key: "allocated_amount", label: "आवंटित राशि" },
  { key: "updated_quantity", label: "अपडेट की गई मात्रा" },
  { key: "updated_amount", label: "अपडेट की गई राशि" },
  { key: "source_of_receipt", label: "सप्लायर" },
  { key: "scheme_name", label: "योजना" },
];

// Hierarchical Filter Component
const HierarchicalFilter = ({
  title,
  items,
  activeFilters,
  onFilterChange,
  hierarchyData,
  hierarchyType,
  collapsed,
  onToggleCollapse,
}) => {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const buttonRefs = useRef({});

  const toggleItemExpansion = (item) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  // Drag selection handlers
  const handleMouseDown = (e) => {
    if (
      ["center_name", "vidhan_sabha_name", "vikas_khand_name"].includes(
        hierarchyType
      )
    ) {
      const rect = e.currentTarget.getBoundingClientRect();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setDragEnd({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (
      isDragging &&
      ["center_name", "vidhan_sabha_name", "vikas_khand_name"].includes(
        hierarchyType
      )
    ) {
      const rect = e.currentTarget.getBoundingClientRect();
      setDragEnd({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Replace the handleMouseUp function in the HierarchicalFilter component with this version
  const handleMouseUp = () => {
    if (
      isDragging &&
      ["center_name", "vidhan_sabha_name", "vikas_khand_name"].includes(
        hierarchyType
      )
    ) {
      // Calculate drag distance to distinguish between click and drag
      const dragDistance = Math.sqrt(
        Math.pow(dragEnd.x - dragStart.x, 2) +
          Math.pow(dragEnd.y - dragStart.y, 2)
      );

      // If the drag distance is less than 5 pixels, treat it as a click, not a drag
      if (dragDistance < 5) {
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
        return;
      }

      // Calculate which buttons are within the selection rectangle
      const selectedItems = [];
      const minX = Math.min(dragStart.x, dragEnd.x);
      const maxX = Math.max(dragStart.x, dragEnd.x);
      const minY = Math.min(dragStart.y, dragEnd.y);
      const maxY = Math.max(dragStart.y, dragEnd.y);

      Object.entries(buttonRefs.current).forEach(([value, ref]) => {
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const buttonRect = {
            left: rect.left - ref.parentElement.getBoundingClientRect().left,
            top: rect.top - ref.parentElement.getBoundingClientRect().top,
            right: rect.right - ref.parentElement.getBoundingClientRect().left,
            bottom: rect.bottom - ref.parentElement.getBoundingClientRect().top,
          };

          // Check if button overlaps with selection rectangle
          if (
            buttonRect.left < maxX &&
            buttonRect.right > minX &&
            buttonRect.top < maxY &&
            buttonRect.bottom > minY
          ) {
            selectedItems.push(value);
          }
        }
      });

      // Toggle selection for all selected items
      selectedItems.forEach((value) => {
        onFilterChange(hierarchyType, value);
      });

      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
    }
  };

  const getHierarchyDisplay = (item, type) => {
    switch (type) {
      case "center_name":
        const vidhanSabhas = hierarchyData.centerToVidhanSabha
          ? hierarchyData.centerToVidhanSabha[item] || []
          : [];
        const vikasKhands = hierarchyData.centerToVikasKhand[item] || [];
        return {
          primary: item,
          secondary: vidhanSabhas.length > 0 ? vidhanSabhas : vikasKhands,
          secondaryLabel: vidhanSabhas.length > 0 ? "विधानसभा" : "विकासखंड",
        };
      case "vidhan_sabha_name":
        const centersForVidhan = hierarchyData.vidhanSabhaToCenters[item] || [];
        const vikasKhandsForVidhan = hierarchyData.vidhanSabhaToVikasKhand
          ? hierarchyData.vidhanSabhaToVikasKhand[item] || []
          : [];
        return {
          primary: item,
          secondary:
            centersForVidhan.length > 0
              ? centersForVidhan
              : vikasKhandsForVidhan,
          secondaryLabel: centersForVidhan.length > 0 ? "केंद्र" : "विकासखंड",
        };
      case "vikas_khand_name":
        const centersForVikas = hierarchyData.vikasKhandToCenters[item] || [];
        const vidhanSabhasForVikas = hierarchyData.vikasKhandToVidhanSabha
          ? hierarchyData.vikasKhandToVidhanSabha[item] || []
          : [];
        return {
          primary: item,
          secondary:
            centersForVikas.length > 0 ? centersForVikas : vidhanSabhasForVikas,
          secondaryLabel: centersForVikas.length > 0 ? "केंद्र" : "विधानसभा",
        };
      case "scheme_name":
        return {
          primary: item,
          secondary: hierarchyData.schemeToCenters[item] || [],
          secondaryLabel: "केंद्र",
        };
      case "investment_name":
        return {
          primary: item,
          secondary: hierarchyData.investmentToCenters[item] || [],
          secondaryLabel: "केंद्र",
        };
      case "component":
        return {
          primary: item,
          secondary: hierarchyData.componentToCenters[item] || [],
          secondaryLabel: "केंद्र",
        };
      case "source_of_receipt":
        return {
          primary: item,
          secondary: hierarchyData.sourceToCenters[item] || [],
          secondaryLabel: "केंद्र",
        };
      default:
        return { primary: item, secondary: [], secondaryLabel: "" };
    }
  };

  // For kendra (center_name), use the original flat button layout
  if (hierarchyType === "center_name") {
    return (
      <Card className="mb-2">
        <Card.Header
          onClick={onToggleCollapse}
          style={{ cursor: "pointer" }}
          className="d-flex justify-content-between align-items-center"
        >
          <span>
            {title} ({items.length})
          </span>
          {collapsed ? <FaChevronDown /> : <FaChevronUp />}
        </Card.Header>
        <Collapse in={!collapsed}>
          <Card.Body>
            <div
              className="position-relative"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ userSelect: "none" }}
            >
              <Row className="g-1 align-items-center">
                {items.map((value) => (
                  <Col key={value} xs="auto" className="mb-2">
                    <Button
                      ref={(el) => (buttonRefs.current[value] = el)}
                      variant={
                        (activeFilters.center_name || []).includes(value)
                          ? "primary"
                          : "outline-secondary"
                      }
                      size="sm"
                      className="filter-button"
                      onClick={() => onFilterChange("center_name", value)}
                    >
                      {value}
                    </Button>
                  </Col>
                ))}
              </Row>
              {/* Selection rectangle overlay */}
              {isDragging && dragStart && dragEnd && (
                <div
                  style={{
                    position: "absolute",
                    left: Math.min(dragStart.x, dragEnd.x),
                    top: Math.min(dragStart.y, dragEnd.y),
                    width: Math.abs(dragEnd.x - dragStart.x),
                    height: Math.abs(dragEnd.y - dragStart.y),
                    backgroundColor: "rgba(0, 123, 255, 0.2)",
                    border: "2px dashed #007bff",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />
              )}
            </div>
          </Card.Body>
        </Collapse>
      </Card>
    );
  }

  // For other types, use hierarchical display
  return (
    <Card className="mb-2">
      <Card.Header
        onClick={onToggleCollapse}
        style={{ cursor: "pointer" }}
        className="d-flex justify-content-between align-items-center"
      >
        <span>
          {title} ({items.length})
        </span>
        {collapsed ? <FaChevronDown /> : <FaChevronUp />}
      </Card.Header>
      <Collapse in={!collapsed}>
        <Card.Body>
          {/* For vidhan_sabha_name, show vidhan_sabhas with their kendras */}
          {hierarchyType === "vidhan_sabha_name" ? (
            (() => {
              // Get selected kendras
              const selectedKendras = Object.entries(
                hierarchyData.centerToVidhanSabha || {}
              )
                .filter(([kendra]) => {
                  // If centers are selected, only show kendras that are selected
                  if (
                    activeFilters.center_name &&
                    activeFilters.center_name.length > 0
                  ) {
                    return activeFilters.center_name.includes(kendra);
                  }
                  return true;
                })
                .map(([kendra]) => kendra);

              if (selectedKendras.length === 0) return null;

              // Create mapping of vidhan_sabha to kendras
              const vidhanSabhaToKendras = {};
              selectedKendras.forEach((kendra) => {
                const kendrasVidhanSabhas =
                  hierarchyData.centerToVidhanSabha[kendra] || [];
                kendrasVidhanSabhas.forEach((vidhanSabha) => {
                  if (!vidhanSabhaToKendras[vidhanSabha]) {
                    vidhanSabhaToKendras[vidhanSabha] = [];
                  }
                  vidhanSabhaToKendras[vidhanSabha].push(kendra);
                });
              });

              // Get unique vidhan_sabhas sorted by name
              const uniqueVidhanSabhas =
                Object.keys(vidhanSabhaToKendras).sort();

              if (uniqueVidhanSabhas.length === 0) return null;

              return (
                <div
                  className="position-relative mb-3"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ userSelect: "none" }}
                >
                  {uniqueVidhanSabhas.map((vidhanSabha) => {
                    const isSelected =
                      activeFilters[hierarchyType] &&
                      activeFilters[hierarchyType].includes(vidhanSabha);

                    const kendrasForThisVidhanSabha =
                      vidhanSabhaToKendras[vidhanSabha];

                    return (
                      <div key={vidhanSabha} className="mb-3">
                        <h6 className="small-fonts">
                          {kendrasForThisVidhanSabha.join(", ")}
                        </h6>
                        <Row className="g-1 align-items-center">
                          <Col xs="auto" className="mb-2">
                            <Button
                              ref={(el) =>
                                (buttonRefs.current[vidhanSabha] = el)
                              }
                              variant={
                                isSelected ? "primary" : "outline-secondary"
                              }
                              size="sm"
                              className="filter-button"
                              onClick={() =>
                                onFilterChange(hierarchyType, vidhanSabha)
                              }
                            >
                              {vidhanSabha}
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    );
                  })}
                  {/* Selection rectangle overlay */}
                  {isDragging && dragStart && dragEnd && (
                    <div
                      style={{
                        position: "absolute",
                        left: Math.min(dragStart.x, dragEnd.x),
                        top: Math.min(dragStart.y, dragEnd.y),
                        width: Math.abs(dragEnd.x - dragStart.x),
                        height: Math.abs(dragEnd.y - dragStart.y),
                        backgroundColor: "rgba(0, 123, 255, 0.2)",
                        border: "2px dashed #007bff",
                        pointerEvents: "none",
                        zIndex: 10,
                      }}
                    />
                  )}
                </div>
              );
            })()
          ) : hierarchyType === "vikas_khand_name" ? (
            // For vikas_khand_name, show vikas_khonds with their kendras
            (() => {
              // Get selected kendras based on center_name OR vidhan_sabha_name filters
              const selectedKendras = Object.entries(
                hierarchyData.centerToVidhanSabha || {}
              )
                .filter(([kendra]) => {
                  // If centers are selected, only show kendras that are selected
                  if (
                    activeFilters.center_name &&
                    activeFilters.center_name.length > 0
                  ) {
                    if (!activeFilters.center_name.includes(kendra)) {
                      return false;
                    }
                  }

                  // If vidhan_sabha filters are active, only show kendras that belong to selected vidhan_sabhas
                  if (
                    activeFilters.vidhan_sabha_name &&
                    Object.keys(activeFilters.vidhan_sabha_name).length > 0
                  ) {
                    const kendraVidhanSabhas =
                      hierarchyData.centerToVidhanSabha[kendra] || [];
                    return kendraVidhanSabhas.some((vidhanSabha) => {
                      // Check if this vidhanSabha is selected for this kendra or any other kendra
                      return Object.entries(
                        activeFilters.vidhan_sabha_name
                      ).some(([filterKendra, filterValues]) => {
                        if (filterKendra === kendra) {
                          return filterValues.includes(vidhanSabha);
                        }
                        // Also check if this vidhanSabha is selected for any kendra that belongs to it
                        return filterValues.includes(vidhanSabha);
                      });
                    });
                  }

                  return true;
                })
                .map(([kendra]) => kendra);

              if (selectedKendras.length === 0) return null;

              // Create mapping of vikas_khand to kendras
              const vikasKhandToKendras = {};
              selectedKendras.forEach((kendra) => {
                const kendrasVikasKhands =
                  hierarchyData.centerToVikasKhand[kendra] || [];
                kendrasVikasKhands.forEach((vikasKhand) => {
                  if (!vikasKhandToKendras[vikasKhand]) {
                    vikasKhandToKendras[vikasKhand] = [];
                  }
                  vikasKhandToKendras[vikasKhand].push(kendra);
                });
              });

              // Get unique vikas_khonds sorted by name
              const uniqueVikasKhands = Object.keys(vikasKhandToKendras).sort();

              if (uniqueVikasKhands.length === 0) return null;

              return (
                <div
                  className="position-relative mb-3"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  style={{ userSelect: "none" }}
                >
                  {uniqueVikasKhands.map((vikasKhand) => {
                    const isSelected =
                      activeFilters[hierarchyType] &&
                      activeFilters[hierarchyType].includes(vikasKhand);

                    const kendrasForThisVikasKhand =
                      vikasKhandToKendras[vikasKhand];

                    return (
                      <div key={vikasKhand} className="mb-3">
                        <h6 className="small-fonts">
                          {kendrasForThisVikasKhand.join(", ")}
                        </h6>
                        <Row className="g-1 align-items-center">
                          <Col xs="auto" className="mb-2">
                            <Button
                              ref={(el) =>
                                (buttonRefs.current[vikasKhand] = el)
                              }
                              variant={
                                isSelected ? "primary" : "outline-secondary"
                              }
                              size="sm"
                              className="filter-button"
                              onClick={() =>
                                onFilterChange(hierarchyType, vikasKhand)
                              }
                            >
                              {vikasKhand}
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    );
                  })}
                  {/* Selection rectangle overlay */}
                  {isDragging && dragStart && dragEnd && (
                    <div
                      style={{
                        position: "absolute",
                        left: Math.min(dragStart.x, dragEnd.x),
                        top: Math.min(dragStart.y, dragEnd.y),
                        width: Math.abs(dragEnd.x - dragStart.x),
                        height: Math.abs(dragEnd.y - dragStart.y),
                        backgroundColor: "rgba(0, 123, 255, 0.2)",
                        border: "2px dashed #007bff",
                        pointerEvents: "none",
                        zIndex: 10,
                      }}
                    />
                  )}
                </div>
              );
            })()
          ) : (
            <Row className="g-2">
              {items.map((item) => {
                const hierarchy = getHierarchyDisplay(item, hierarchyType);
                const isSelected =
                  activeFilters[hierarchyType] &&
                  activeFilters[hierarchyType].includes(item);
                const isExpanded = expandedItems.has(item);

                return (
                  <Col key={item} xs={12} className="mb-2">
                    <div className="border rounded p-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <Button
                          variant={isSelected ? "primary" : "outline-secondary"}
                          size="sm"
                          className="filter-button me-2"
                          onClick={() => onFilterChange(hierarchyType, item)}
                        >
                          {hierarchy.primary}
                        </Button>
                        {hierarchy.secondary.length > 0 && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => toggleItemExpansion(item)}
                            className="p-0 text-decoration-none"
                          >
                            {isExpanded ? (
                              <FaChevronUp size={12} />
                            ) : (
                              <FaChevronDown size={12} />
                            )}
                            <small className="ms-1">
                              {hierarchy.secondaryLabel} (
                              {hierarchy.secondary.length})
                            </small>
                          </Button>
                        )}
                      </div>
                      {isExpanded && hierarchy.secondary.length > 0 && (
                        <div className="ms-3 mt-2">
                          <small className="text-muted fw-bold">
                            {hierarchy.secondaryLabel}:
                          </small>
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {hierarchy.secondary.map((subItem) => (
                              <Badge
                                key={subItem}
                                bg="light"
                                text="dark"
                                className="small"
                              >
                                {subItem}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}
        </Card.Body>
      </Collapse>
    </Card>
  );
};

const VivranSummaryModal = ({
  show,
  onHide,
  groupData,
  selectedColumns,
  setSelectedColumns,
}) => {
  const [activeFilters, setActiveFilters] = useState({});
  const [showTableDetailsModal, setShowTableDetailsModal] = useState(false);
  const [tableDetailsData, setTableDetailsData] = useState([]);
  const [tableDetailsCenterName, setTableDetailsCenterName] = useState("");
  const [selectedCombinedKendra, setSelectedCombinedKendra] = useState([]);
  const [collapsedSections, setCollapsedSections] = useState({
    center_name: true,
    vidhan_sabha_name: true,
    vikas_khand_name: true,
    investment_name: true,
    sub_investment_name: true,
    component: true,
    source_of_receipt: true,
    scheme_name: true,
    financial_summary: false,
  });
  const [showOnlySold, setShowOnlySold] = useState(false);
  const [showOnlyAllocated, setShowOnlyAllocated] = useState(false);
  const [showOnlyRemaining, setShowOnlyRemaining] = useState(false);

  // Format currency function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Filtered items based on active filters
  const filteredItems = useMemo(() => {
    if (!groupData || !groupData.items) return [];
    let filtered = groupData.items;

    // Apply all filters
    Object.keys(activeFilters).forEach((category) => {
      const perKendraCategories = [
        "scheme_name",
        "component",
        "investment_name",
        "sub_investment_name",
        "source_of_receipt",
      ];
      if (perKendraCategories.includes(category)) {
        // For per-kendra categories
        if (
          activeFilters[category] &&
          Object.keys(activeFilters[category]).length > 0
        ) {
          filtered = filtered.filter((item) => {
            const kendraFilters = activeFilters[category][item.center_name];
            return kendraFilters && kendraFilters.includes(item[category]);
          });
        }
      } else {
        // For other categories
        if (activeFilters[category] && activeFilters[category].length > 0) {
          filtered = filtered.filter((item) =>
            activeFilters[category].includes(item[category])
          );
        }
      }
    });

    if (showOnlySold) {
      filtered = filtered.filter(
        (item) => parseFloat(item.updated_quantity) > 0
      );
    }
    if (showOnlyAllocated) {
      filtered = filtered.filter(
        (item) => parseFloat(item.allocated_quantity) > 0
      );
    }
    if (showOnlyRemaining) {
      filtered = filtered.filter(
        (item) =>
          parseFloat(item.allocated_quantity) >
          parseFloat(item.updated_quantity)
      );
    }
    return filtered;
  }, [
    groupData,
    activeFilters,
    showOnlySold,
    showOnlyAllocated,
    showOnlyRemaining,
  ]);

  // Calculate summary info from filtered items
  const totalAllocated = useMemo(() => {
    return filteredItems.reduce(
      (sum, item) =>
        sum + parseFloat(item.allocated_quantity) * parseFloat(item.rate),
      0
    );
  }, [filteredItems]);

  const totalUpdated = useMemo(() => {
    return filteredItems.reduce(
      (sum, item) =>
        sum + parseFloat(item.updated_quantity) * parseFloat(item.rate),
      0
    );
  }, [filteredItems]);

  const totalRemaining = totalAllocated - totalUpdated;
  const placesCount = filteredItems.length;

  // Filtered data for table
  const tableData = useMemo(() => {
    if (selectedCombinedKendra.length === 0) {
      return filteredItems;
    }
    return filteredItems.filter((item) =>
      selectedCombinedKendra.includes(item.center_name)
    );
  }, [filteredItems, selectedCombinedKendra]);

  // Calculate totals for table
  const tableTotalAllocated = useMemo(() => {
    return tableData.reduce(
      (sum, item) =>
        sum + parseFloat(item.allocated_quantity) * parseFloat(item.rate),
      0
    );
  }, [tableData]);

  const tableTotalUpdated = useMemo(() => {
    return tableData.reduce(
      (sum, item) =>
        sum + parseFloat(item.updated_quantity) * parseFloat(item.rate),
      0
    );
  }, [tableData]);

  // Get ALL options for each card type - these will show all possible options
  const allCenters = useMemo(() => {
    return [
      ...new Set((groupData?.items || []).map((item) => item.center_name)),
    ]
      .filter(Boolean)
      .sort();
  }, [groupData]);

  const allVidhanSabha = useMemo(() => {
    return [
      ...new Set(
        (groupData?.items || []).map((item) => item.vidhan_sabha_name)
      ),
    ]
      .filter(Boolean)
      .sort();
  }, [groupData]);

  const allVikasKhand = useMemo(() => {
    return [
      ...new Set((groupData?.items || []).map((item) => item.vikas_khand_name)),
    ]
      .filter(Boolean)
      .sort();
  }, [groupData]);

  // Get unique values from filtered items (for when not the selected type)
  const uniqueCenters = useMemo(() => {
    let centers = [];

    // Check if vidhan_sabha filters are active
    const hasVidhanSabhaFilters =
      activeFilters.vidhan_sabha_name &&
      activeFilters.vidhan_sabha_name.length > 0;

    // Check if vikas_khand filters are active
    const hasVikasKhandFilters =
      activeFilters.vikas_khand_name &&
      activeFilters.vikas_khand_name.length > 0;

    if (hasVidhanSabhaFilters || hasVikasKhandFilters) {
      const selectedVidhanSabhas = new Set();
      const selectedVikasKhands = new Set();

      // Collect selected vidhan_sabhas if filter is active
      if (hasVidhanSabhaFilters) {
        activeFilters.vidhan_sabha_name.forEach((vidhanSabha) =>
          selectedVidhanSabhas.add(vidhanSabha)
        );
      }

      // Collect selected vikas_khands if filter is active
      if (hasVikasKhandFilters) {
        activeFilters.vikas_khand_name.forEach((vikasKhand) =>
          selectedVikasKhands.add(vikasKhand)
        );
      }

      // Get centers that belong to selected vidhan_sabhas OR vikas_khands
      centers = [
        ...new Set(
          (groupData?.items || [])
            .filter((item) => {
              // Check if vidhan_sabha matches selected ones
              const matchesVidhanSabha =
                !hasVidhanSabhaFilters ||
                selectedVidhanSabhas.has(item.vidhan_sabha_name);
              // Check if vikas_khand matches selected ones
              const matchesVikasKhand =
                !hasVikasKhandFilters ||
                selectedVikasKhands.has(item.vikas_khand_name);
              return matchesVidhanSabha && matchesVikasKhand;
            })
            .map((item) => item.center_name)
        ),
      ];
    } else {
      // Otherwise, get centers from filtered items
      centers = [...new Set(filteredItems.map((item) => item.center_name))];
    }

    return centers.filter(Boolean).sort();
  }, [
    filteredItems,
    activeFilters.vidhan_sabha_name,
    activeFilters.vikas_khand_name,
    groupData,
  ]);

  const uniqueVidhanSabha = useMemo(() => {
    return [
      ...new Set(
        (groupData?.items || []).map((item) => item.vidhan_sabha_name)
      ),
    ]
      .filter(Boolean)
      .sort();
  }, [groupData]);

  const uniqueVikasKhand = useMemo(() => {
    return [
      ...new Set((groupData?.items || []).map((item) => item.vikas_khand_name)),
    ]
      .filter(Boolean)
      .sort();
  }, [groupData]);

  const centerToVidhanSabha = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.center_name && item.vidhan_sabha_name) {
        if (!mapping[item.center_name]) {
          mapping[item.center_name] = new Set();
        }
        mapping[item.center_name].add(item.vidhan_sabha_name);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const centerToVikasKhand = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.center_name && item.vikas_khand_name) {
        if (!mapping[item.center_name]) {
          mapping[item.center_name] = new Set();
        }
        mapping[item.center_name].add(item.vikas_khand_name);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const vidhanSabhaToVikasKhand = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.vidhan_sabha_name && item.vikas_khand_name) {
        if (!mapping[item.vidhan_sabha_name]) {
          mapping[item.vidhan_sabha_name] = new Set();
        }
        mapping[item.vidhan_sabha_name].add(item.vikas_khand_name);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const vikasKhandToCenters = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.vikas_khand_name && item.center_name) {
        if (!mapping[item.vikas_khand_name]) {
          mapping[item.vikas_khand_name] = new Set();
        }
        mapping[item.vikas_khand_name].add(item.center_name);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const vikasKhandToVidhanSabha = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.vikas_khand_name && item.vidhan_sabha_name) {
        if (!mapping[item.vikas_khand_name]) {
          mapping[item.vikas_khand_name] = new Set();
        }
        mapping[item.vikas_khand_name].add(item.vidhan_sabha_name);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const vidhanSabhaToCenters = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.vidhan_sabha_name && item.center_name) {
        if (!mapping[item.vidhan_sabha_name]) {
          mapping[item.vidhan_sabha_name] = new Set();
        }
        mapping[item.vidhan_sabha_name].add(item.center_name);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const schemeToCenters = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.scheme_name && item.center_name) {
        if (!mapping[item.scheme_name]) {
          mapping[item.scheme_name] = new Set();
        }
        mapping[item.scheme_name].add(item.center_name);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const investmentToCenters = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.investment_name && item.center_name) {
        if (!mapping[item.investment_name]) {
          mapping[item.investment_name] = new Set();
        }
        mapping[item.investment_name].add(item.center_name);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const componentToCenters = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.component && item.center_name) {
        if (!mapping[item.component]) {
          mapping[item.component] = new Set();
        }
        mapping[item.component].add(item.center_name);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const sourceToCenters = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.source_of_receipt && item.center_name) {
        if (!mapping[item.source_of_receipt]) {
          mapping[item.source_of_receipt] = new Set();
        }
        mapping[item.source_of_receipt].add(item.center_name);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const allInvestments = useMemo(() => {
    return [
      ...new Set((groupData?.items || []).map((item) => item.investment_name)),
    ]
      .filter(Boolean)
      .sort();
  }, [groupData]);

  const kendraToInvestments = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.center_name && item.investment_name) {
        if (!mapping[item.center_name]) {
          mapping[item.center_name] = new Set();
        }
        mapping[item.center_name].add(item.investment_name);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const uniqueInvestments = useMemo(() => {
    const allInvestments = new Set();
    // If centers are selected, only include investments from selected centers
    const centersToShow =
      activeFilters.center_name && activeFilters.center_name.length > 0
        ? activeFilters.center_name
        : allCenters;

    centersToShow.forEach((kendra) => {
      const investments = kendraToInvestments[kendra] || [];
      investments.forEach((inv) => allInvestments.add(inv));
    });
    return Array.from(allInvestments).filter(Boolean).sort();
  }, [kendraToInvestments, allCenters, activeFilters.center_name]);

  const kendraToSubInvestments = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.center_name && item.sub_investment_name) {
        if (!mapping[item.center_name]) {
          mapping[item.center_name] = new Set();
        }
        mapping[item.center_name].add(item.sub_investment_name);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const uniqueSubInvestments = useMemo(() => {
    const allSubInvestments = new Set();
    // If centers are selected, only include sub investments from selected centers
    const centersToShow =
      activeFilters.center_name && activeFilters.center_name.length > 0
        ? activeFilters.center_name
        : allCenters;

    centersToShow.forEach((kendra) => {
      const subInvestments = kendraToSubInvestments[kendra] || [];
      subInvestments.forEach((subInv) => allSubInvestments.add(subInv));
    });
    return Array.from(allSubInvestments).filter(Boolean).sort();
  }, [kendraToSubInvestments, allCenters, activeFilters.center_name]);

  const allComponents = useMemo(() => {
    return [...new Set((groupData?.items || []).map((item) => item.component))]
      .filter(Boolean)
      .sort();
  }, [groupData]);

  const kendraToComponents = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.center_name && item.component) {
        if (!mapping[item.center_name]) {
          mapping[item.center_name] = new Set();
        }
        mapping[item.center_name].add(item.component);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const uniqueComponents = useMemo(() => {
    const allComponents = new Set();
    // If centers are selected, only include components from selected centers
    const centersToShow =
      activeFilters.center_name && activeFilters.center_name.length > 0
        ? activeFilters.center_name
        : allCenters;

    centersToShow.forEach((kendra) => {
      const components = kendraToComponents[kendra] || [];
      components.forEach((comp) => allComponents.add(comp));
    });
    return Array.from(allComponents).filter(Boolean).sort();
  }, [kendraToComponents, allCenters, activeFilters.center_name]);

  const allSources = useMemo(() => {
    return [
      ...new Set(
        (groupData?.items || []).map((item) => item.source_of_receipt)
      ),
    ]
      .filter(Boolean)
      .sort();
  }, [groupData]);

  const kendraToSources = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.center_name && item.source_of_receipt) {
        if (!mapping[item.center_name]) {
          mapping[item.center_name] = new Set();
        }
        mapping[item.center_name].add(item.source_of_receipt);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const uniqueSources = useMemo(() => {
    const allSources = new Set();
    // If centers are selected, only include sources from selected centers
    const centersToShow =
      activeFilters.center_name && activeFilters.center_name.length > 0
        ? activeFilters.center_name
        : allCenters;

    centersToShow.forEach((kendra) => {
      const sources = kendraToSources[kendra] || [];
      sources.forEach((source) => allSources.add(source));
    });
    return Array.from(allSources).filter(Boolean).sort();
  }, [kendraToSources, allCenters, activeFilters.center_name]);

  const allSchemes = useMemo(() => {
    return [
      ...new Set((groupData?.items || []).map((item) => item.scheme_name)),
    ]
      .filter(Boolean)
      .sort();
  }, [groupData]);

  const kendraToSchemes = useMemo(() => {
    const mapping = {};
    (groupData?.items || []).forEach((item) => {
      if (item.center_name && item.scheme_name) {
        if (!mapping[item.center_name]) {
          mapping[item.center_name] = new Set();
        }
        mapping[item.center_name].add(item.scheme_name);
      }
    });
    // Convert Sets to sorted arrays
    Object.keys(mapping).forEach((key) => {
      mapping[key] = Array.from(mapping[key]).sort();
    });
    return mapping;
  }, [groupData]);

  const uniqueSchemes = useMemo(() => {
    const allSchemes = new Set();
    // If centers are selected, only include schemes from selected centers
    const centersToShow =
      activeFilters.center_name && activeFilters.center_name.length > 0
        ? activeFilters.center_name
        : allCenters;

    centersToShow.forEach((kendra) => {
      const schemes = kendraToSchemes[kendra] || [];
      schemes.forEach((scheme) => allSchemes.add(scheme));
    });
    return Array.from(allSchemes).filter(Boolean).sort();
  }, [kendraToSchemes, allCenters, activeFilters.center_name]);

  // Generate colors for each center
  const centerColors = useMemo(() => {
    const centerCount = allCenters.length;
    return generateCenterColors(centerCount);
  }, [allCenters]);

  // Get color for a specific center
  const getCenterColor = (centerName) => {
    const index = allCenters.indexOf(centerName);
    return index !== -1 ? centerColors[index] : "#f8f9fa";
  };

  // Set initial filters and collapsed sections based on groupData if from badge click
  useEffect(() => {
    if (
      groupData &&
      groupData.group_field &&
      groupData.selectedItems &&
      groupData.selectedItems.length > 0
    ) {
      let newActiveFilters = {};

      if (groupData.group_field === "center_name") {
        // For center_name, use simple array format
        newActiveFilters = {
          center_name: groupData.selectedItems,
        };
      } else {
        // For all other types, use simple array format
        newActiveFilters[groupData.group_field] = groupData.selectedItems;
      }

      setActiveFilters(newActiveFilters);

      // Close all filter sections and open only the relevant one
      setCollapsedSections((prev) => {
        const newState = {
          ...prev,
          center_name: true,
          vidhan_sabha_name: true,
          vikas_khand_name: true,
          investment_name: true,
          sub_investment_name: true,
          component: true,
          source_of_receipt: true,
          scheme_name: true,
          financial_summary: false, // Keep financial summary open
        };

        // Open only the section for the selected group type
        if (groupData.group_field === "center_name") {
          newState.center_name = false;
        } else if (groupData.group_field === "vidhan_sabha_name") {
          newState.vidhan_sabha_name = false;
        } else if (groupData.group_field === "vikas_khand_name") {
          newState.vikas_khand_name = false;
        } else if (groupData.group_field === "investment_name") {
          newState.investment_name = false;
        } else if (groupData.group_field === "sub_investment_name") {
          newState.sub_investment_name = false;
        } else if (groupData.group_field === "component") {
          newState.component = false;
        } else if (groupData.group_field === "source_of_receipt") {
          newState.source_of_receipt = false;
        } else if (groupData.group_field === "scheme_name") {
          newState.scheme_name = false;
        }

        return newState;
      });
    }
  }, [groupData, centerToVidhanSabha, centerToVikasKhand]);

  // Reset filters and collapsed sections when modal is closed
  useEffect(() => {
    if (!show) {
      setActiveFilters({});
      setSelectedCombinedKendra([]);
      setShowOnlySold(false);
      setShowOnlyAllocated(false);
      setShowOnlyRemaining(false);
      setCollapsedSections({
        center_name: true,
        vidhan_sabha_name: true,
        vikas_khand_name: true,
        investment_name: true,
        sub_investment_name: true,
        component: true,
        source_of_receipt: true,
        scheme_name: true,
        financial_summary: false,
      });
    }
  }, [show]);

  // Data for comparison chart
  const chartData = useMemo(() => {
    const data = {};
    filteredItems.forEach((item) => {
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

  // Data for pie chart
  const pieChartData = useMemo(() => {
    return [
      { name: "आवंटित", value: totalAllocated, color: "#2C3E50" },
      { name: "वितरण", value: totalUpdated, color: "#E74C3C" },
      { name: "शेष", value: totalRemaining, color: "#27AE60" },
    ];
  }, [totalAllocated, totalUpdated, totalRemaining]);

  // Handle pie chart click
  const handlePieClick = (item) => {
    // Reset all filters
    setShowOnlySold(false);
    setShowOnlyAllocated(false);
    setShowOnlyRemaining(false);

    // Set specific filter based on pie slice clicked
    if (item.name === "वितरण") {
      setShowOnlySold(true);
    } else if (item.name === "आवंटित") {
      setShowOnlyAllocated(true);
    } else if (item.name === "शेष") {
      setShowOnlyRemaining(true);
    }
  };

  // Handle table row click to show TableDetailsModal
  const handleTableRowClick = () => {
    // Get all selected kendras from selectedCombinedKendra
    const selectedKendras = selectedCombinedKendra.length > 0 
      ? selectedCombinedKendra 
      : (uniqueCenters.length > 0 ? uniqueCenters : allCenters);
    
    // Filter data for all selected kendras
    const allSelectedKendrasData = filteredItems.filter((item) =>
      selectedKendras.includes(item.center_name)
    );
    
    setTableDetailsData(allSelectedKendrasData);
    setTableDetailsCenterName("चयनित केंद्रों का विस्तृत विवरण");
    setShowTableDetailsModal(true);
  };

  // Handle filter changes
  const handleFilterChange = (category, value, kendra = null) => {
    console.log("Filter change:", {
      category,
      value,
      kendra,
      currentFilters: activeFilters,
    });

    // Categories that are per-kendra: scheme_name, component, investment_name, sub_investment_name, source_of_receipt
    const perKendraCategories = [
      "scheme_name",
      "component",
      "investment_name",
      "sub_investment_name",
      "source_of_receipt",
    ];

    if (perKendraCategories.includes(category)) {
      // For per-kendra categories, store as { [kendra]: [values] }
      setActiveFilters((prev) => {
        const current = prev[category] || {};
        const kendraValues = current[kendra] || [];
        const newKendraValues = kendraValues.includes(value)
          ? kendraValues.filter((v) => v !== value)
          : [...kendraValues, value];

        const newCategory = { ...current };
        if (newKendraValues.length === 0) {
          delete newCategory[kendra];
        } else {
          newCategory[kendra] = newKendraValues;
        }

        if (Object.keys(newCategory).length === 0) {
          const newFilters = { ...prev };
          delete newFilters[category];
          return newFilters;
        }

        return { ...prev, [category]: newCategory };
      });
    } else {
      // For other categories (center_name, vidhan_sabha_name, vikas_khand_name), keep as array
      setActiveFilters((prev) => {
        const currentValues = prev[category] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];

        if (newValues.length === 0) {
          const newFilters = { ...prev };
          delete newFilters[category];
          return newFilters;
        }

        return { ...prev, [category]: newValues };
      });
    }
  };

  // Handle bar click in graph
  const handleBarClick = (name, value, type) => {
    // Reset all
    setShowOnlySold(false);
    setShowOnlyAllocated(false);
    setShowOnlyRemaining(false);
    if (type === "sold") {
      setShowOnlySold(true);
    } else if (type === "allocated") {
      setShowOnlyAllocated(true);
    } else if (type === "remaining") {
      setShowOnlyRemaining(true);
    }
    // Filter by center
    setActiveFilters((prev) => ({ ...prev, center_name: [name] }));
  };

  // Toggle collapse section
  const toggleCollapse = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({});
  };

  // Comparison Bar Chart Component
  const ComparisonBarChart = ({ data, title, onBarClick }) => {
    // Local tooltip state for this chart instance - must be called before any early returns
    const [tooltip, setTooltip] = useState({
      visible: false,
      x: 0,
      y: 0,
      data: null,
    });

    if (!data || data.length === 0) return null;

    // Tooltip Component
    const ChartTooltip = ({ tooltip }) => {
      if (!tooltip.visible || !tooltip.data) return null;

      // Check if tooltip would be hidden above viewport
      const isAboveViewport = tooltip.y < 50;

      return (
        <div
          className={`chart-tooltip ${
            isAboveViewport ? "tooltip-below" : "tooltip-above"
          }`}
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <div>
            <strong>{tooltip.data.name}</strong>
          </div>
          <div>आवंटित: {tooltip.data.allocated.toFixed(0)}</div>
          <div>वितरण: {tooltip.data.sold.toFixed(0)}</div>
          <div>शेष: {tooltip.data.remaining.toFixed(0)}</div>
        </div>
      );
    };

    const colors = {
      allocated: "#2C3E50",
      sold: "#E74C3C",
      remaining: "#27AE60",
    };

    const maxValue = Math.max(
      ...data.map((item) => Math.max(item.allocated, item.sold, item.remaining))
    );
    const scaleFactor = maxValue > 0 ? 100 / maxValue : 1;

    const barWidth = 20;
    const chartHeight = 200;
    const chartWidth = Math.max(600, data.length * 60);
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    // Tooltip handlers
    const handleMouseEnter = (event, item) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const containerRect = event.currentTarget
        .closest(".comparison-chart-container")
        .getBoundingClientRect();
      setTooltip({
        visible: true,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top,
        data: item,
      });
    };

    const handleMouseMove = (event) => {
      const containerRect = event.currentTarget
        .closest(".comparison-chart-container")
        .getBoundingClientRect();
      setTooltip((prev) => ({
        ...prev,
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top - 10,
      }));
    };

    const handleMouseLeave = () => {
      setTooltip((prev) => ({ ...prev, visible: false }));
    };

    return (
      <Card className="comparison-chart-card">
        <Card.Header className="small-fonts text-center">{title}</Card.Header>
        <Card.Body
          className="text-center position-relative"
          style={{ overflow: "visible" }}
        >
          <div
            className="comparison-chart-container"
            style={{ position: "relative" }}
          >
            <svg
              width="100%"
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="xMinYMin meet"
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                const y = innerHeight + margin.top - tick * innerHeight;
                return (
                  <line
                    key={`grid-${tick}`}
                    x1={margin.left}
                    y1={y}
                    x2={innerWidth + margin.left}
                    y2={y}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Y-axis */}
              <line
                x1={margin.left}
                y1={margin.top}
                x2={margin.left}
                y2={innerHeight + margin.top}
                stroke="#333"
                strokeWidth="2"
              />

              {/* X-axis */}
              <line
                x1={margin.left}
                y1={innerHeight + margin.top}
                x2={innerWidth + margin.left}
                y2={innerHeight + margin.top}
                stroke="#333"
                strokeWidth="2"
              />

              {/* X-axis ticks */}
              {data.map((item, index) => {
                const x =
                  margin.left +
                  index * (innerWidth / data.length) +
                  innerWidth / data.length / 2;
                return (
                  <g key={`x-tick-${index}`}>
                    <line
                      x1={x}
                      y1={innerHeight + margin.top}
                      x2={x}
                      y2={innerHeight + margin.top + 5}
                      stroke="#333"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}

              {/* Y-axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                const y = innerHeight + margin.top - tick * innerHeight;
                const value = (tick * maxValue).toFixed(0);
                return (
                  <g key={tick}>
                    <line
                      x1={margin.left - 5}
                      y1={y}
                      x2={margin.left}
                      y2={y}
                      stroke="#333"
                      strokeWidth="2"
                    />
                    <text
                      x={margin.left - 10}
                      y={y + 5}
                      textAnchor="end"
                      fontSize="12"
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* Y-axis unit label */}
              <text
                x={10}
                y={margin.top}
                textAnchor="start"
                fontSize="10"
                transform={`rotate(-90, 10, ${margin.top})`}
              >
                मात्रा
              </text>

              {/* Bars and X-axis labels */}
              {data.map((item, index) => {
                const x =
                  margin.left +
                  index * (innerWidth / data.length) +
                  innerWidth / data.length / 2;
                const groupWidth = innerWidth / data.length;
                const barSpacing = 5;
                const actualBarWidth = Math.min(
                  ((innerWidth / data.length) * 0.95) / 3,
                  10
                );

                const allocatedHeight =
                  maxValue > 0 ? (item.allocated / maxValue) * innerHeight : 0;
                const soldHeight =
                  maxValue > 0 ? (item.sold / maxValue) * innerHeight : 0;
                const remainingHeight =
                  maxValue > 0 ? (item.remaining / maxValue) * innerHeight : 0;

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
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        onBarClick &&
                        onBarClick(item.name, item.allocated, "allocated")
                      }
                      onMouseEnter={(e) => handleMouseEnter(e, item)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    />
                    <text
                      x={x - actualBarWidth - barSpacing + actualBarWidth / 2}
                      y={allocatedY - 5}
                      textAnchor="middle"
                      fontSize="10"
                      fill={colors.allocated}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        onBarClick &&
                        onBarClick(item.name, item.allocated, "allocated")
                      }
                    >
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
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        onBarClick && onBarClick(item.name, item.sold, "sold")
                      }
                      onMouseEnter={(e) => handleMouseEnter(e, item)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    />
                    <text
                      x={x + actualBarWidth / 2}
                      y={soldY - 5}
                      textAnchor="middle"
                      fontSize="10"
                      fill={colors.sold}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        onBarClick && onBarClick(item.name, item.sold, "sold")
                      }
                    >
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
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        onBarClick &&
                        onBarClick(item.name, item.remaining, "remaining")
                      }
                      onMouseEnter={(e) => handleMouseEnter(e, item)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    />
                    <text
                      x={x + actualBarWidth + barSpacing + actualBarWidth / 2}
                      y={remainingY - 5}
                      textAnchor="middle"
                      fontSize="10"
                      fill={colors.remaining}
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        onBarClick &&
                        onBarClick(item.name, item.remaining, "remaining")
                      }
                    >
                      {item.remaining.toFixed(0)}
                    </text>

                    {/* X-axis label */}
                    <text
                      x={x}
                      y={innerHeight + margin.top + 15}
                      textAnchor="middle"
                      fontSize="10"
                      transform={`rotate(-45, ${x}, ${
                        innerHeight + margin.top + 15
                      })`}
                    >
                      {item.name}
                    </text>
                  </g>
                );
              })}

              {/* Legend */}
              <g transform={`translate(${chartWidth - 120}, 20)`}>
                <rect
                  x={0}
                  y={0}
                  width={12}
                  height={12}
                  fill={colors.allocated}
                />
                <text x={15} y={10} fontSize="12">
                  आवंटित
                </text>

                <rect x={0} y={15} width={12} height={12} fill={colors.sold} />
                <text x={15} y={25} fontSize="12">
                  वितरण
                </text>

                <rect
                  x={0}
                  y={30}
                  width={12}
                  height={12}
                  fill={colors.remaining}
                />
                <text x={15} y={40} fontSize="12">
                  शेष
                </text>
              </g>
            </svg>
          </div>
          <ChartTooltip tooltip={tooltip} />
        </Card.Body>
      </Card>
    );
  };

  // Pie Chart Component
  const PieChart = ({ data, title, onPieClick }) => {
    // Local tooltip state for this chart instance
    const [tooltip, setTooltip] = useState({
      visible: false,
      x: 0,
      y: 0,
      data: null,
    });

    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    // Tooltip Component
    const ChartTooltip = ({ tooltip }) => {
      if (!tooltip.visible || !tooltip.data) return null;

      // Check if tooltip would be hidden above viewport
      const isAboveViewport = tooltip.y < 50;

      return (
        <div
          className={`chart-tooltip ${
            isAboveViewport ? "tooltip-below" : "tooltip-above"
          }`}
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <div>
            <strong>{tooltip.data.name}</strong>
          </div>
          <div>मूल्य: {tooltip.data.value.toFixed(0)}</div>
          <div>प्रतिशत: {((tooltip.data.value / total) * 100).toFixed(1)}%</div>
        </div>
      );
    };

    // Tooltip handlers
    const handleMouseEnter = (event, item) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const containerRect = event.currentTarget
        .closest(".comparison-chart-container")
        .getBoundingClientRect();
      setTooltip({
        visible: true,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top,
        data: item,
      });
    };

    const handleMouseMove = (event) => {
      const containerRect = event.currentTarget
        .closest(".comparison-chart-container")
        .getBoundingClientRect();
      setTooltip((prev) => ({
        ...prev,
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top - 10,
      }));
    };

    const handleMouseLeave = () => {
      setTooltip((prev) => ({ ...prev, visible: false }));
    };

    let cumulativeAngle = 0;

    return (
      <Card className="comparison-chart-card">
        <Card.Header className="small-fonts text-center">{title}</Card.Header>
        <Card.Body
          className="text-center position-relative"
          style={{ overflow: "visible" }}
        >
          <div
            className="comparison-chart-container"
            style={{ position: "relative" }}
          >
            <svg width="400" height="200" viewBox="0 0 400 200">
              {data.map((item, index) => {
                const angle = (item.value / total) * 360;
                const startAngle = cumulativeAngle;
                const endAngle = cumulativeAngle + angle;
                cumulativeAngle = endAngle;

                const x1 =
                  centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                const y1 =
                  centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                const x2 =
                  centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                const y2 =
                  centerY + radius * Math.sin((endAngle * Math.PI) / 180);

                const largeArcFlag = angle > 180 ? 1 : 0;
                const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color}
                    style={{ cursor: "pointer" }}
                    onClick={() => onPieClick && onPieClick(item)}
                    onMouseEnter={(e) => handleMouseEnter(e, item)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })}
              {/* Legend in top right */}
              {data.map((item, index) => {
                const percentage =
                  total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
                return (
                  <g key={`legend-${index}`}>
                    <rect
                      x={200}
                      y={10 + index * 15}
                      width={8}
                      height={8}
                      fill={item.color}
                    />
                    <text x={215} y={18 + index * 15} fontSize="10" fill="#333">
                      {item.name}: {item.value.toFixed(0)} ({percentage}%)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <ChartTooltip tooltip={tooltip} />
        </Card.Body>
      </Card>
    );
  };

  const downloadExcel = (data, key) => {
    try {
      const excelData = data.map((item, index) => {
        const row = {};
        row["क्रम संख्या"] = index + 1;
        selectedColumns.forEach((col) => {
          switch (col) {
            case "center_name":
              row["केंद्र का नाम"] = item.center_name;
              break;
            case "vidhan_sabha_name":
              row["विधानसभा का नाम"] = item.vidhan_sabha_name;
              break;
            case "vikas_khand_name":
              row["विकासखंड का नाम"] = item.vikas_khand_name;
              break;
            case "component":
              row["घटक"] = item.component;
              break;
            case "investment_name":
              row["निवेश का नाम"] = item.investment_name;
              break;
            case "sub_investment_name":
              row["उप-निवेश का नाम"] = item.sub_investment_name;
              break;
            case "allocated_quantity":
              row["आवंटित मात्रा"] = item.allocated_quantity;
              break;
            case "rate":
              row["दर"] = item.rate;
              break;
            case "allocated_amount":
              row["आवंटित राशि"] = formatCurrency(
                parseFloat(item.allocated_quantity) * parseFloat(item.rate)
              );
              break;
            case "updated_quantity":
              row["अपडेट की गई मात्रा"] = item.updated_quantity;
              break;
            case "updated_amount":
              row["अपडेट की गई राशि"] = formatCurrency(
                parseFloat(item.updated_quantity) * parseFloat(item.rate)
              );
              break;
            case "source_of_receipt":
              row["स्रोत"] = item.source_of_receipt;
              break;
            case "scheme_name":
              row["योजना"] = item.scheme_name;
              break;
          }
        });
        return row;
      });

      // Add totals row
      const totalsRow = {};
      totalsRow["क्रम संख्या"] = "";
      selectedColumns.forEach((col) => {
        if (
          col === "center_name" ||
          col === "component" ||
          col === "investment_name" ||
          col === "sub_investment_name" ||
          col === "source_of_receipt" ||
          col === "scheme_name"
        ) {
          totalsRow[
            col === "center_name"
              ? "केंद्र का नाम"
              : col === "component"
              ? "घटक"
              : col === "investment_name"
              ? "निवेश का नाम"
              : col === "sub_investment_name"
              ? "उप-निवेश का नाम"
              : col === "unit"
              ? "इकाई"
              : col === "source_of_receipt"
              ? "स्रोत"
              : "योजना"
          ] = "";
        } else if (col === "rate") {
          totalsRow["दर"] = "-";
        } else if (col === "allocated_quantity") {
          totalsRow["आवंटित मात्रा"] = data
            .reduce(
              (sum, item) => sum + parseFloat(item.allocated_quantity || 0),
              0
            )
            .toFixed(2);
        } else if (col === "allocated_amount") {
          totalsRow["आवंटित राशि"] = formatCurrency(
            data.reduce(
              (sum, item) =>
                sum +
                parseFloat(item.allocated_quantity) * parseFloat(item.rate),
              0
            )
          );
        } else if (col === "updated_quantity") {
          totalsRow["अपडेट की गई मात्रा"] = data
            .reduce(
              (sum, item) => sum + parseFloat(item.updated_quantity || 0),
              0
            )
            .toFixed(2);
        } else if (col === "updated_amount") {
          totalsRow["अपडेट की गई राशि"] = formatCurrency(
            data.reduce(
              (sum, item) =>
                sum + parseFloat(item.updated_quantity) * parseFloat(item.rate),
              0
            )
          );
        }
      });
      excelData.push(totalsRow);

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "विवरण");
      XLSX.writeFile(wb, `${key}_विवरण.xlsx`);
    } catch (e) {
      // Error generating Excel file
    }
  };

  const downloadPdf = (data, key) => {
    try {
      const headers =
        "<th>क्रम संख्या</th>" +
        selectedColumns
          .map((col) => {
            switch (col) {
              case "center_name":
                return "<th>केंद्र का नाम</th>";
              case "vidhan_sabha_name":
                return "<th>विधानसभा का नाम</th>";
              case "vikas_khand_name":
                return "<th>विकासखंड का नाम</th>";
              case "component":
                return "<th>घटक</th>";
              case "investment_name":
                return "<th>निवेश का नाम</th>";
              case "sub_investment_name":
                return "<th>उप-निवेश का नाम</th>";
              case "allocated_quantity":
                return "<th>आवंटित मात्रा</th>";
              case "rate":
                return "<th>दर</th>";
              case "allocated_amount":
                return "<th>आवंटित राशि</th>";
              case "updated_quantity":
                return "<th>अपडेट की गई मात्रा</th>";
              case "updated_amount":
                return "<th>अपडेट की गई राशि</th>";
              case "source_of_receipt":
                return "<th>सप्लायर</th>";
              case "scheme_name":
                return "<th>योजना</th>";
              default:
                return "";
            }
          })
          .filter((header) => header !== "")
          .join("");

      const rows = data
        .map((item, index) => {
          const cells =
            `<td>${index + 1}</td>` +
            selectedColumns
              .map((col) => {
                switch (col) {
                  case "center_name":
                    return `<td>${item.center_name || ""}</td>`;
                  case "vidhan_sabha_name":
                    return `<td>${item.vidhan_sabha_name || ""}</td>`;
                  case "vikas_khand_name":
                    return `<td>${item.vikas_khand_name || ""}</td>`;
                  case "component":
                    return `<td>${item.component || ""}</td>`;
                  case "investment_name":
                    return `<td>${item.investment_name || ""}</td>`;
                  case "sub_investment_name":
                    return `<td>${item.sub_investment_name || ""}</td>`;
                  case "allocated_quantity":
                    return `<td>${item.allocated_quantity || ""}</td>`;
                  case "rate":
                    return `<td>${item.rate || ""}</td>`;
                  case "allocated_amount":
                    return `<td>${formatCurrency(
                      parseFloat(item.allocated_quantity) *
                        parseFloat(item.rate)
                    )}</td>`;
                  case "updated_quantity":
                    return `<td>${item.updated_quantity || ""}</td>`;
                  case "updated_amount":
                    return `<td>${formatCurrency(
                      parseFloat(item.updated_quantity) * parseFloat(item.rate)
                    )}</td>`;
                  case "source_of_receipt":
                    return `<td>${item.source_of_receipt || ""}</td>`;
                  case "scheme_name":
                    return `<td>${item.scheme_name || ""}</td>`;
                  default:
                    return "";
                }
              })
              .filter((cell) => cell !== "")
              .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("");

      // Totals row
      const totalsCells =
        "<td></td>" +
        selectedColumns
          .map((col) => {
            if (col === "center_name") return "<td><strong>कुल</strong></td>";
            else if (
              col === "vidhan_sabha_name" ||
              col === "vikas_khand_name" ||
              col === "component" ||
              col === "investment_name" ||
              col === "source_of_receipt" ||
              col === "scheme_name"
            )
              return "";
            else if (col === "rate") return "<td>-</td>";
            else if (col === "allocated_quantity")
              return `<td><strong>${data
                .reduce(
                  (sum, item) => sum + parseFloat(item.allocated_quantity || 0),
                  0
                )
                .toFixed(2)}</strong></td>`;
            else if (col === "allocated_amount")
              return `<td><strong>${formatCurrency(
                data.reduce(
                  (sum, item) =>
                    sum +
                    parseFloat(item.allocated_quantity) * parseFloat(item.rate),
                  0
                )
              )}</strong></td>`;
            else if (col === "updated_quantity")
              return `<td><strong>${data
                .reduce(
                  (sum, item) => sum + parseFloat(item.updated_quantity || 0),
                  0
                )
                .toFixed(2)}</strong></td>`;
            else if (col === "updated_amount")
              return `<td><strong>${formatCurrency(
                data.reduce(
                  (sum, item) =>
                    sum +
                    parseFloat(item.updated_quantity) * parseFloat(item.rate),
                  0
                )
              )}</strong></td>`;
            return "";
          })
          .filter((cell) => cell !== "")
          .join("");
      const totalsRow = `<tr>${totalsCells}</tr>`;

      const tableHtml = `
        <html>
          <head>
            <title>${key} विवरण</title>
            <meta charset="UTF-8">
            <style>
              table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              body { margin: 20px; display: flex; flex-direction: column; }
              h2 { text-align: center;font-size:16px; }
              .print-btn { background-color: #007bff; color: white; border: none; padding: 10px 20px; font-size: 10px; cursor: pointer; margin-bottom: 20px; align-self: flex-end; }
              .print-btn:hover { background-color: #0056b3; }
            </style>
          </head>
          <body>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h2 style="margin: 0;">${key} विवरण</h2>
              <button class="print-btn" onclick="window.print()">Filtered विवरण प्रिंट करें</button>
            </div>
            <table>
              <tr>${headers}</tr>
              ${rows}
              ${totalsRow}
            </table>
          </body>
        </html>
      `;

      // Create a blob from the HTML string
      const blob = new Blob([tableHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      // Open the blob URL in a new tab
      const newTab = window.open(url, "_blank");

      // Optionally, revoke the URL after some time to free memory
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000); // Revoke after 10 seconds
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
      className="vivran-summary-modal "
    >
      <Modal.Header closeButton onClick={onHide} className="modal-title">
        <Modal.Title>{groupData.group_name} - विवरण</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Collapsible Filters and Charts Section */}
        <Card className="mb-3">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center fillter-heading">
              <h6 className="mb-0">फिल्टर और ग्राफ</h6>
              <Button
                variant="outline-secondary fillter-remove-btn"
                size="sm"
                onClick={clearAllFilters}
              >
                <i className="delete-icon">
                  <RiDeleteBin6Line />
                </i>{" "}
                सभी फिल्टर हटाएं
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                {/* Left Column: Center, Vikas Khand, Vidhan Sabha */}
                <HierarchicalFilter
                  title="केंद्र का नाम"
                  items={
                    groupData?.group_field === "center_name"
                      ? groupData.allOptions || allCenters
                      : uniqueCenters
                  }
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  hierarchyData={{
                    centerToVidhanSabha,
                    centerToVikasKhand,
                    vidhanSabhaToVikasKhand,
                    vikasKhandToCenters,
                    vikasKhandToVidhanSabha,
                    vidhanSabhaToCenters,
                    schemeToCenters,
                    investmentToCenters,
                    componentToCenters,
                    sourceToCenters,
                  }}
                  hierarchyType="center_name"
                  collapsed={collapsedSections.center_name}
                  onToggleCollapse={() => toggleCollapse("center_name")}
                />
                <HierarchicalFilter
                  title="विकासखंड का नाम"
                  items={
                    groupData?.group_field === "vikas_khand_name"
                      ? groupData.allOptions || allVikasKhand
                      : uniqueVikasKhand
                  }
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  hierarchyData={{
                    centerToVidhanSabha,
                    centerToVikasKhand,
                    vidhanSabhaToVikasKhand,
                    vikasKhandToCenters,
                    vikasKhandToVidhanSabha,
                    vidhanSabhaToCenters,
                    schemeToCenters,
                    investmentToCenters,
                    componentToCenters,
                    sourceToCenters,
                  }}
                  hierarchyType="vikas_khand_name"
                  collapsed={collapsedSections.vikas_khand_name}
                  onToggleCollapse={() => toggleCollapse("vikas_khand_name")}
                />
                <HierarchicalFilter
                  title="विधानसभा का नाम"
                  items={
                    groupData?.group_field === "vidhan_sabha_name"
                      ? groupData.allOptions || allVidhanSabha
                      : uniqueVidhanSabha
                  }
                  activeFilters={activeFilters}
                  onFilterChange={handleFilterChange}
                  hierarchyData={{
                    centerToVidhanSabha,
                    centerToVikasKhand,
                    vidhanSabhaToVikasKhand,
                    vikasKhandToCenters,
                    vikasKhandToVidhanSabha,
                    vidhanSabhaToCenters,
                    schemeToCenters,
                    investmentToCenters,
                    componentToCenters,
                    sourceToCenters,
                  }}
                  hierarchyType="vidhan_sabha_name"
                  collapsed={collapsedSections.vidhan_sabha_name}
                  onToggleCollapse={() => toggleCollapse("vidhan_sabha_name")}
                />
              </Col>
              <Col md={6}>
                {/* Right Column: Yojana, Ghatak, Nivesh, Sarut, Financial Summary */}
                <Card className="mb-2">
                  <Card.Header
                    onClick={() => toggleCollapse("scheme_name")}
                    style={{ cursor: "pointer" }}
                    className="d-flex justify-content-between align-items-center accordin-header"
                  >
                    <span>योजना ({uniqueSchemes.length})</span>
                    {collapsedSections.scheme_name ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronUp />
                    )}
                  </Card.Header>
                  <Collapse in={!collapsedSections.scheme_name}>
                    <Card.Body>
                      {Object.entries(kendraToSchemes)
                        .filter(([kendra]) => {
                          if (
                            activeFilters.center_name &&
                            activeFilters.center_name.length > 0
                          ) {
                            if (!activeFilters.center_name.includes(kendra)) {
                              return false;
                            }
                          }
                          if (
                            activeFilters.vidhan_sabha_name &&
                            activeFilters.vidhan_sabha_name.length > 0
                          ) {
                            const kendraVidhanSabhas =
                              centerToVidhanSabha[kendra] || [];
                            return kendraVidhanSabhas.some((vidhanSabha) =>
                              activeFilters.vidhan_sabha_name.includes(
                                vidhanSabha
                              )
                            );
                          }
                          if (
                            activeFilters.scheme_name &&
                            activeFilters.scheme_name[kendra] &&
                            activeFilters.scheme_name[kendra].length > 0
                          ) {
                            const kendraSchemes = kendraToSchemes[kendra] || [];
                            if (
                              !kendraSchemes.some((scheme) =>
                                activeFilters.scheme_name[kendra].includes(
                                  scheme
                                )
                              )
                            ) {
                              return false;
                            }
                          }
                          if (
                            activeFilters.component &&
                            activeFilters.component[kendra] &&
                            activeFilters.component[kendra].length > 0
                          ) {
                            const kendraComponents =
                              kendraToComponents[kendra] || [];
                            if (
                              !kendraComponents.some((component) =>
                                activeFilters.component[kendra].includes(
                                  component
                                )
                              )
                            ) {
                              return false;
                            }
                          }
                          if (
                            activeFilters.investment_name &&
                            activeFilters.investment_name[kendra] &&
                            activeFilters.investment_name[kendra].length > 0
                          ) {
                            const kendraInvestments =
                              kendraToInvestments[kendra] || [];
                            if (
                              !kendraInvestments.some((investment) =>
                                activeFilters.investment_name[kendra].includes(
                                  investment
                                )
                              )
                            ) {
                              return false;
                            }
                          }
                          if (
                            activeFilters.source_of_receipt &&
                            activeFilters.source_of_receipt.length > 0
                          ) {
                            const kendraSources = kendraToSources[kendra] || [];
                            if (
                              !kendraSources.some((source) =>
                                activeFilters.source_of_receipt.includes(source)
                              )
                            ) {
                              return false;
                            }
                          }
                          return true;
                        })
                        .map(
                          ([kendra, schemes]) =>
                            schemes.length > 0 && (
                              <div key={kendra} className="mb-3">
                                <h6 className="small-fonts">{kendra}</h6>
                                <Row className="g-1 align-items-center">
                                  {schemes.map((scheme) => (
                                    <Col
                                      key={`${kendra}-${scheme}`}
                                      xs="auto"
                                      className="mb-2"
                                    >
                                      <Button
                                        variant={
                                          activeFilters.scheme_name &&
                                          activeFilters.scheme_name[kendra] &&
                                          activeFilters.scheme_name[
                                            kendra
                                          ].includes(scheme)
                                            ? "primary"
                                            : "outline-secondary"
                                        }
                                        size="sm"
                                        className="filter-button"
                                        onClick={() =>
                                          handleFilterChange(
                                            "scheme_name",
                                            scheme,
                                            kendra
                                          )
                                        }
                                      >
                                        {scheme}
                                      </Button>
                                    </Col>
                                  ))}
                                </Row>
                              </div>
                            )
                        )}
                    </Card.Body>
                  </Collapse>
                </Card>
                <Card className="mb-2">
                  <Card.Header
                    onClick={() => toggleCollapse("component")}
                    style={{ cursor: "pointer" }}
                    className="d-flex justify-content-between align-items-center accordin-header"
                  >
                    <span>घटक ({uniqueComponents.length})</span>
                    {collapsedSections.component ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronUp />
                    )}
                  </Card.Header>
                  <Collapse in={!collapsedSections.component}>
                    <Card.Body>
                      {Object.entries(kendraToComponents)
                        .filter(([kendra]) => {
                          if (
                            activeFilters.center_name &&
                            activeFilters.center_name.length > 0
                          ) {
                            return activeFilters.center_name.includes(kendra);
                          }
                          if (
                            activeFilters.scheme_name &&
                            activeFilters.scheme_name.length > 0
                          ) {
                            const kendraSchemes = kendraToSchemes[kendra] || [];
                            if (
                              !kendraSchemes.some((scheme) =>
                                activeFilters.scheme_name.includes(scheme)
                              )
                            ) {
                              return false;
                            }
                          }
                          if (
                            activeFilters.investment_name &&
                            activeFilters.investment_name.length > 0
                          ) {
                            const kendraInvestments =
                              kendraToInvestments[kendra] || [];
                            if (
                              !kendraInvestments.some((investment) =>
                                activeFilters.investment_name.includes(
                                  investment
                                )
                              )
                            ) {
                              return false;
                            }
                          }
                          return true;
                        })
                        .map(
                          ([kendra, components]) =>
                            components.length > 0 && (
                              <div key={kendra} className="mb-3">
                                <h6 className="small-fonts">{kendra}</h6>
                                <Row className="g-1 align-items-center">
                                  {components
                                    .filter((component) => {
                                      let valid = true;
                                      if (
                                        activeFilters.source_of_receipt &&
                                        activeFilters.source_of_receipt[kendra]
                                      ) {
                                        valid =
                                          valid &&
                                          groupData.items.some(
                                            (item) =>
                                              item.center_name === kendra &&
                                              item.component === component &&
                                              activeFilters.source_of_receipt[
                                                kendra
                                              ].includes(item.source_of_receipt)
                                          );
                                      }
                                      if (
                                        activeFilters.scheme_name &&
                                        activeFilters.scheme_name[kendra]
                                      ) {
                                        valid =
                                          valid &&
                                          groupData.items.some(
                                            (item) =>
                                              item.center_name === kendra &&
                                              item.component === component &&
                                              activeFilters.scheme_name[
                                                kendra
                                              ].includes(item.scheme_name)
                                          );
                                      }
                                      if (
                                        activeFilters.investment_name &&
                                        activeFilters.investment_name[kendra]
                                      ) {
                                        valid =
                                          valid &&
                                          groupData.items.some(
                                            (item) =>
                                              item.center_name === kendra &&
                                              item.component === component &&
                                              activeFilters.investment_name[
                                                kendra
                                              ].includes(item.investment_name)
                                          );
                                      }
                                      return valid;
                                    })
                                    .map((component) => (
                                      <Col
                                        key={component}
                                        xs="auto"
                                        className="mb-2"
                                      >
                                        <Button
                                          variant={
                                            activeFilters.component &&
                                            activeFilters.component[kendra] &&
                                            activeFilters.component[
                                              kendra
                                            ].includes(component)
                                              ? "primary"
                                              : "outline-secondary"
                                          }
                                          size="sm"
                                          className="filter-button"
                                          onClick={() =>
                                            handleFilterChange(
                                              "component",
                                              component,
                                              kendra
                                            )
                                          }
                                        >
                                          {component}
                                        </Button>
                                      </Col>
                                    ))}
                                </Row>
                              </div>
                            )
                        )}
                    </Card.Body>
                  </Collapse>
                </Card>
                <Card className="mb-2">
                  <Card.Header
                    onClick={() => toggleCollapse("investment_name")}
                    style={{ cursor: "pointer" }}
                    className="d-flex justify-content-between align-items-center accordin-header"
                  >
                    <span>निवेश का नाम ({uniqueInvestments.length})</span>
                    {collapsedSections.investment_name ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronUp />
                    )}
                  </Card.Header>
                  <Collapse in={!collapsedSections.investment_name}>
                    <Card.Body>
                      {Object.entries(kendraToInvestments)
                        .filter(([kendra]) => {
                          if (
                            activeFilters.center_name &&
                            activeFilters.center_name.length > 0
                          ) {
                            return activeFilters.center_name.includes(kendra);
                          }
                          if (
                            activeFilters.scheme_name &&
                            activeFilters.scheme_name[kendra] &&
                            activeFilters.scheme_name[kendra].length > 0
                          ) {
                            const kendraSchemes = kendraToSchemes[kendra] || [];
                            if (
                              !kendraSchemes.some((scheme) =>
                                activeFilters.scheme_name[kendra].includes(
                                  scheme
                                )
                              )
                            ) {
                              return false;
                            }
                          }
                          if (
                            activeFilters.component &&
                            activeFilters.component[kendra] &&
                            activeFilters.component[kendra].length > 0
                          ) {
                            const kendraComponents =
                              kendraToComponents[kendra] || [];
                            if (
                              !kendraComponents.some((component) =>
                                activeFilters.component[kendra].includes(
                                  component
                                )
                              )
                            ) {
                              return false;
                            }
                          }
                          return true;
                        })
                        .map(
                          ([kendra, investments]) =>
                            investments.length > 0 && (
                              <div key={kendra} className="mb-3">
                                <h6 className="small-fonts">{kendra}</h6>
                                <Row className="g-1 align-items-center">
                                  {investments
                                    .filter((investment) => {
                                      let valid = true;
                                      if (
                                        activeFilters.component &&
                                        activeFilters.component[kendra]
                                      ) {
                                        valid =
                                          valid &&
                                          groupData.items.some(
                                            (item) =>
                                              item.center_name === kendra &&
                                              item.investment_name ===
                                                investment &&
                                              activeFilters.component[
                                                kendra
                                              ].includes(item.component)
                                          );
                                      }
                                      if (
                                        activeFilters.scheme_name &&
                                        activeFilters.scheme_name[kendra]
                                      ) {
                                        valid =
                                          valid &&
                                          groupData.items.some(
                                            (item) =>
                                              item.center_name === kendra &&
                                              item.investment_name ===
                                                investment &&
                                              activeFilters.scheme_name[
                                                kendra
                                              ].includes(item.scheme_name)
                                          );
                                      }
                                      if (
                                        activeFilters.source_of_receipt &&
                                        activeFilters.source_of_receipt[kendra]
                                      ) {
                                        valid =
                                          valid &&
                                          groupData.items.some(
                                            (item) =>
                                              item.center_name === kendra &&
                                              item.investment_name ===
                                                investment &&
                                              activeFilters.source_of_receipt[
                                                kendra
                                              ].includes(item.source_of_receipt)
                                          );
                                      }
                                      return valid;
                                    })
                                    .map((investment) => (
                                      <Col
                                        key={investment}
                                        xs="auto"
                                        className="mb-2"
                                      >
                                        <Button
                                          variant={
                                            activeFilters.investment_name &&
                                            activeFilters.investment_name[
                                              kendra
                                            ] &&
                                            activeFilters.investment_name[
                                              kendra
                                            ].includes(investment)
                                              ? "primary"
                                              : "outline-secondary"
                                          }
                                          size="sm"
                                          className="filter-button"
                                          onClick={() =>
                                            handleFilterChange(
                                              "investment_name",
                                              investment,
                                              kendra
                                            )
                                          }
                                        >
                                          {investment}
                                        </Button>
                                      </Col>
                                    ))}
                                </Row>
                              </div>
                            )
                        )}
                    </Card.Body>
                  </Collapse>
                </Card>
                <Card className="mb-2">
                  <Card.Header
                    onClick={() => toggleCollapse("sub_investment_name")}
                    style={{ cursor: "pointer" }}
                    className="d-flex justify-content-between align-items-center accordin-header"
                  >
                    <span>उप-निवेश का नाम ({uniqueSubInvestments.length})</span>
                    {collapsedSections.sub_investment_name ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronUp />
                    )}
                  </Card.Header>
                  <Collapse in={!collapsedSections.sub_investment_name}>
                    <Card.Body>
                      {Object.entries(kendraToSubInvestments)
                        .filter(([kendra]) => {
                          if (
                            activeFilters.center_name &&
                            activeFilters.center_name.length > 0
                          ) {
                            return activeFilters.center_name.includes(kendra);
                          }
                          if (
                            activeFilters.scheme_name &&
                            activeFilters.scheme_name[kendra] &&
                            activeFilters.scheme_name[kendra].length > 0
                          ) {
                            const kendraSchemes = kendraToSchemes[kendra] || [];
                            if (
                              !kendraSchemes.some((scheme) =>
                                activeFilters.scheme_name[kendra].includes(
                                  scheme
                                )
                              )
                            ) {
                              return false;
                            }
                          }
                          if (
                            activeFilters.component &&
                            activeFilters.component[kendra] &&
                            activeFilters.component[kendra].length > 0
                          ) {
                            const kendraComponents =
                              kendraToComponents[kendra] || [];
                            if (
                              !kendraComponents.some((component) =>
                                activeFilters.component[kendra].includes(
                                  component
                                )
                              )
                            ) {
                              return false;
                            }
                          }
                          if (
                            activeFilters.investment_name &&
                            activeFilters.investment_name[kendra] &&
                            activeFilters.investment_name[kendra].length > 0
                          ) {
                            const kendraInvestments =
                              kendraToInvestments[kendra] || [];
                            if (
                              !kendraInvestments.some((investment) =>
                                activeFilters.investment_name[kendra].includes(
                                  investment
                                )
                              )
                            ) {
                              return false;
                            }
                          }
                          return true;
                        })
                        .map(
                          ([kendra, subInvestments]) =>
                            subInvestments.length > 0 && (
                              <div key={kendra} className="mb-3">
                                <h6 className="small-fonts">{kendra}</h6>
                                <Row className="g-1 align-items-center">
                                  {subInvestments
                                    .filter((subInvestment) => {
                                      let valid = true;
                                      if (
                                        activeFilters.component &&
                                        activeFilters.component[kendra]
                                      ) {
                                        valid =
                                          valid &&
                                          groupData.items.some(
                                            (item) =>
                                              item.center_name === kendra &&
                                              item.sub_investment_name ===
                                                subInvestment &&
                                              activeFilters.component[
                                                kendra
                                              ].includes(item.component)
                                          );
                                      }
                                      if (
                                        activeFilters.scheme_name &&
                                        activeFilters.scheme_name[kendra]
                                      ) {
                                        valid =
                                          valid &&
                                          groupData.items.some(
                                            (item) =>
                                              item.center_name === kendra &&
                                              item.sub_investment_name ===
                                                subInvestment &&
                                              activeFilters.scheme_name[
                                                kendra
                                              ].includes(item.scheme_name)
                                          );
                                      }
                                      if (
                                        activeFilters.investment_name &&
                                        activeFilters.investment_name[kendra]
                                      ) {
                                        valid =
                                          valid &&
                                          groupData.items.some(
                                            (item) =>
                                              item.center_name === kendra &&
                                              item.sub_investment_name ===
                                                subInvestment &&
                                              activeFilters.investment_name[
                                                kendra
                                              ].includes(item.investment_name)
                                          );
                                      }
                                      if (
                                        activeFilters.source_of_receipt &&
                                        activeFilters.source_of_receipt[kendra]
                                      ) {
                                        valid =
                                          valid &&
                                          groupData.items.some(
                                            (item) =>
                                              item.center_name === kendra &&
                                              item.sub_investment_name ===
                                                subInvestment &&
                                              activeFilters.source_of_receipt[
                                                kendra
                                              ].includes(item.source_of_receipt)
                                          );
                                      }
                                      return valid;
                                    })
                                    .map((subInvestment) => (
                                      <Col
                                        key={subInvestment}
                                        xs="auto"
                                        className="mb-2"
                                      >
                                        <Button
                                          variant={
                                            activeFilters.sub_investment_name &&
                                            activeFilters.sub_investment_name[
                                              kendra
                                            ] &&
                                            activeFilters.sub_investment_name[
                                              kendra
                                            ].includes(subInvestment)
                                              ? "primary"
                                              : "outline-secondary"
                                          }
                                          size="sm"
                                          className="filter-button"
                                          onClick={() =>
                                            handleFilterChange(
                                              "sub_investment_name",
                                              subInvestment,
                                              kendra
                                            )
                                          }
                                        >
                                          {subInvestment}
                                        </Button>
                                      </Col>
                                    ))}
                                </Row>
                              </div>
                            )
                        )}
                    </Card.Body>
                  </Collapse>
                </Card>
                <Card className="mb-2">
                  <Card.Header
                    onClick={() => toggleCollapse("source_of_receipt")}
                    style={{ cursor: "pointer" }}
                    className="d-flex justify-content-between align-items-center accordin-header"
                  >
                    <span>सप्लायर ({uniqueSources.length})</span>
                    {collapsedSections.source_of_receipt ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronUp />
                    )}
                  </Card.Header>
                  <Collapse in={!collapsedSections.source_of_receipt}>
                    <Card.Body>
                      {Object.entries(kendraToSources)
                        .filter(([kendra]) => {
                          if (
                            activeFilters.center_name &&
                            activeFilters.center_name.length > 0
                          ) {
                            if (!activeFilters.center_name.includes(kendra)) {
                              return false;
                            }
                          }
                          if (
                            activeFilters.vidhan_sabha_name &&
                            Object.keys(activeFilters.vidhan_sabha_name)
                              .length > 0
                          ) {
                            const kendraVidhanSabhas =
                              centerToVidhanSabha[kendra] || [];
                            return kendraVidhanSabhas.some((vidhanSabha) => {
                              return Object.entries(
                                activeFilters.vidhan_sabha_name
                              ).some(([filterKendra, filterValues]) => {
                                if (filterKendra === kendra) {
                                  return filterValues.includes(vidhanSabha);
                                }
                                return filterValues.includes(vidhanSabha);
                              });
                            });
                          }
                          if (
                            activeFilters.component &&
                            activeFilters.component[kendra] &&
                            activeFilters.component[kendra].length > 0
                          ) {
                            const kendraComponents =
                              kendraToComponents[kendra] || [];
                            if (
                              !kendraComponents.some((component) =>
                                activeFilters.component[kendra].includes(
                                  component
                                )
                              )
                            ) {
                              return false;
                            }
                          }
                          if (
                            activeFilters.investment_name &&
                            activeFilters.investment_name[kendra] &&
                            activeFilters.investment_name[kendra].length > 0
                          ) {
                            const kendraInvestments =
                              kendraToInvestments[kendra] || [];
                            if (
                              !kendraInvestments.some((investment) =>
                                activeFilters.investment_name[kendra].includes(
                                  investment
                                )
                              )
                            ) {
                              return false;
                            }
                          }
                          return true;
                        })
                        .map(
                          ([kendra, sources]) =>
                            sources.length > 0 && (
                              <div key={kendra} className="mb-3">
                                <h6 className="small-fonts">{kendra}</h6>
                                <Row className="g-1 align-items-center">
                                  {sources
                                    .filter((source) => {
                                      let valid = true;
                                      if (
                                        activeFilters.scheme_name &&
                                        activeFilters.scheme_name[kendra]
                                      ) {
                                        valid =
                                          valid &&
                                          groupData.items.some(
                                            (item) =>
                                              item.center_name === kendra &&
                                              item.source_of_receipt ===
                                                source &&
                                              activeFilters.scheme_name[
                                                kendra
                                              ].includes(item.scheme_name)
                                          );
                                      }
                                      if (
                                        activeFilters.component &&
                                        activeFilters.component[kendra]
                                      ) {
                                        valid =
                                          valid &&
                                          groupData.items.some(
                                            (item) =>
                                              item.center_name === kendra &&
                                              item.source_of_receipt ===
                                                source &&
                                              activeFilters.component[
                                                kendra
                                              ].includes(item.component)
                                          );
                                      }
                                      if (
                                        activeFilters.investment_name &&
                                        activeFilters.investment_name[kendra]
                                      ) {
                                        valid =
                                          valid &&
                                          groupData.items.some(
                                            (item) =>
                                              item.center_name === kendra &&
                                              item.source_of_receipt ===
                                                source &&
                                              activeFilters.investment_name[
                                                kendra
                                              ].includes(item.investment_name)
                                          );
                                      }
                                      return valid;
                                    })
                                    .map((source) => (
                                      <Col
                                        key={source}
                                        xs="auto"
                                        className="mb-2"
                                      >
                                        <Button
                                          variant={
                                            activeFilters.source_of_receipt &&
                                            activeFilters.source_of_receipt[
                                              kendra
                                            ] &&
                                            activeFilters.source_of_receipt[
                                              kendra
                                            ].includes(source)
                                              ? "primary"
                                              : "outline-secondary"
                                          }
                                          size="sm"
                                          className="filter-button"
                                          onClick={() =>
                                            handleFilterChange(
                                              "source_of_receipt",
                                              source,
                                              kendra
                                            )
                                          }
                                        >
                                          {source}
                                        </Button>
                                      </Col>
                                    ))}
                                </Row>
                              </div>
                            )
                        )}
                    </Card.Body>
                  </Collapse>
                </Card>
                {/* Financial Summary Section */}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Kendra Selection Filter for Combined Table */}
        <Card className="mb-3">
          <Card.Body className="py-2">
            <Row className="align-items-center">
              <Col md={12}>
                <Form.Label className="mb-2 fw-bold">
                  केंद्र चुनें (संपूर्ण विवरण तालिका के लिए):
                </Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {(() => {
                    // Show only kendras that are selected in the kendra filter above
                    const kendrasToShow =
                      activeFilters.center_name &&
                      activeFilters.center_name.length > 0
                        ? activeFilters.center_name
                        : uniqueCenters;

                    return (
                      <>
                        <Form.Check
                          type="checkbox"
                          name="combined-table-kendra"
                          id="combined-all-kendra"
                          label="सभी चुनें"
                          checked={
                            selectedCombinedKendra.length ===
                            kendrasToShow.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCombinedKendra(kendrasToShow);
                            } else {
                              setSelectedCombinedKendra([]);
                            }
                          }}
                        />
                        {kendrasToShow.map((kendra) => (
                          <Form.Check
                            key={kendra}
                            type="checkbox"
                            name="combined-table-kendra"
                            id={`combined-kendra-${kendra}`}
                            label={kendra}
                            checked={selectedCombinedKendra.includes(kendra)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCombinedKendra((prev) => [
                                  ...prev,
                                  kendra,
                                ]);
                              } else {
                                setSelectedCombinedKendra((prev) =>
                                  prev.filter((k) => k !== kendra)
                                );
                              }
                            }}
                          />
                        ))}
                      </>
                    );
                  })()}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Combined Table Section */}
        <Card className="mb-3">
          <Card.Header className=" teanle-heading">
            <h6 className="mb-0">संपूर्ण विवरण तालिका</h6>
            <div>
              <Button
                variant="outline-success"
                size="sm"
                onClick={() => downloadExcel(tableData, "Filtered")}
                className="me-2 fillter-exel-btn"
              >
                <i className="delete-icon">
                  {" "}
                  <FaFileExcel />
                </i>{" "}
                Excel
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => downloadPdf(tableData, "Filtered")}
                className="fillter-pdf-btn"
              >
                <i className="delete-icon">
                  {" "}
                  <FaFilePdf />
                </i>{" "}
                View
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
            <div
              className="table-responsive"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              <table className="responsive-table small-fonts">
                <thead
                  className="table-light"
                  style={{ position: "sticky", top: 0, zIndex: 1 }}
                >
                  <tr>
                    <th>क्रम संख्या</th>
                    {selectedColumns.includes("center_name") && (
                      <th>केंद्र का नाम</th>
                    )}
                    {selectedColumns.includes("vidhan_sabha_name") && (
                      <th>विधानसभा का नाम</th>
                    )}
                    {selectedColumns.includes("vikas_khand_name") && (
                      <th>विकासखंड का नाम</th>
                    )}
                    {selectedColumns.includes("component") && <th>घटक</th>}
                    {selectedColumns.includes("investment_name") && (
                      <th>निवेश का नाम</th>
                    )}
                    {selectedColumns.includes("sub_investment_name") && (
                      <th>उप-निवेश का नाम</th>
                    )}
                    {selectedColumns.includes("allocated_quantity") && (
                      <th>आवंटित मात्रा</th>
                    )}
                    {selectedColumns.includes("rate") && <th>दर</th>}
                    {selectedColumns.includes("allocated_amount") && (
                      <th>आवंटित राशि</th>
                    )}
                    {selectedColumns.includes("updated_quantity") && (
                      <th>अपडेट की गई मात्रा</th>
                    )}
                    {selectedColumns.includes("updated_amount") && (
                      <th>अपडेट की गई राशि</th>
                    )}
                    {selectedColumns.includes("source_of_receipt") && (
                      <th>सप्लायर</th>
                    )}
                    {selectedColumns.includes("scheme_name") && <th>योजना</th>}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((item, index) => {
                    const allocatedAmount = (
                      parseFloat(item.allocated_quantity) *
                      parseFloat(item.rate)
                    ).toFixed(2);
                    const updatedAmount = (
                      parseFloat(item.updated_quantity) * parseFloat(item.rate)
                    ).toFixed(2);
                    return (
                      <tr
                        key={index}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleTableRowClick()}
                      >
                        <td data-label="क्रम संख्या">{index + 1}</td>
                        {selectedColumns.includes("center_name") && (
                          <td data-label="केंद्र का नाम">{item.center_name}</td>
                        )}
                        {selectedColumns.includes("vidhan_sabha_name") && (
                          <td data-label="विधानसभा का नाम">
                            {item.vidhan_sabha_name}
                          </td>
                        )}
                        {selectedColumns.includes("vikas_khand_name") && (
                          <td data-label="विकासखंड का नाम">
                            {item.vikas_khand_name}
                          </td>
                        )}
                        {selectedColumns.includes("component") && (
                          <td data-label="घटक">{item.component}</td>
                        )}
                        {selectedColumns.includes("investment_name") && (
                          <td data-label="निवेश का नाम">
                            {item.investment_name}
                          </td>
                        )}
                        {selectedColumns.includes("sub_investment_name") && (
                          <td data-label="उप-निवेश का नाम">
                            {item.sub_investment_name}
                          </td>
                        )}
                        {selectedColumns.includes("allocated_quantity") && (
                          <td data-label="आवंटित मात्रा">
                            {item.allocated_quantity}
                          </td>
                        )}
                        {selectedColumns.includes("rate") && (
                          <td data-label="दर">{item.rate}</td>
                        )}
                        {selectedColumns.includes("allocated_amount") && (
                          <td data-label="आवंटित राशि">{allocatedAmount}</td>
                        )}
                        {selectedColumns.includes("updated_quantity") && (
                          <td data-label="अपडेट की गई मात्रा">
                            {item.updated_quantity}
                          </td>
                        )}
                        {selectedColumns.includes("updated_amount") && (
                          <td data-label="अपडेट की गई राशि">{updatedAmount}</td>
                        )}
                        {selectedColumns.includes("source_of_receipt") && (
                          <td data-label="सप्लायर">{item.source_of_receipt}</td>
                        )}
                        {selectedColumns.includes("scheme_name") && (
                          <td data-label="योजना">{item.scheme_name}</td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="font-weight-bold">
                    <td></td>
                    {selectedColumns.includes("center_name") && <td>कुल</td>}
                    {selectedColumns.includes("vidhan_sabha_name") && <td></td>}
                    {selectedColumns.includes("vikas_khand_name") && <td></td>}
                    {selectedColumns.includes("component") && <td></td>}
                    {selectedColumns.includes("investment_name") && <td></td>}
                    {selectedColumns.includes("allocated_quantity") && (
                      <td>
                        {tableData
                          .reduce(
                            (sum, item) =>
                              sum + parseFloat(item.allocated_quantity || 0),
                            0
                          )
                          .toFixed(2)}
                      </td>
                    )}
                    {selectedColumns.includes("rate") && <td></td>}
                    {selectedColumns.includes("allocated_amount") && (
                      <td>{formatCurrency(tableTotalAllocated)}</td>
                    )}
                    {selectedColumns.includes("updated_quantity") && (
                      <td>
                        {tableData
                          .reduce(
                            (sum, item) =>
                              sum + parseFloat(item.updated_quantity || 0),
                            0
                          )
                          .toFixed(2)}
                      </td>
                    )}
                    {selectedColumns.includes("updated_amount") && (
                      <td>{formatCurrency(tableTotalUpdated)}</td>
                    )}
                    {selectedColumns.includes("source_of_receipt") && <td></td>}
                    {selectedColumns.includes("scheme_name") && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card.Body>
        </Card>
        <Card className="mb-2">
          <Card.Body>
            <h6 className="mb-3 fw-bold">वित्तीय सारांश</h6>

            <Row className="text-center g-2">
              <Col md={4}>
                <div className="p-2 border rounded amount-box">
                  <h6 className="mb-1 small-fonts">आवंटित राशि</h6>
                  <p className="mb-0 fw-bold small">
                    {formatCurrency(totalAllocated)}
                  </p>
                </div>
              </Col>

              <Col md={4}>
                <div className="p-2 border rounded amount-box">
                  <h6 className="mb-1 small-fonts">शेष राशि</h6>
                  <p className="mb-0 text-success fw-bold small">
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
              </Col>

              <Col md={4}>
                <div className="p-2 border rounded amount-box">
                  <h6 className="mb-1 small-fonts">वितरण राशि</h6>
                  <p className="mb-0 text-warning fw-bold small">
                    {formatCurrency(totalUpdated)}
                  </p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Graph Section */}
        <Card>
          <Card.Header className="fillter-heading">
            <h6 className="mb-0">विवरण ग्राफ</h6>
          </Card.Header>
          <Card.Body
            className="text-center position-relative"
            style={{ overflow: "visible" }}
          >
            <Tabs
              defaultActiveKey="bar"
              id="graph-tabs-bottom"
              className="mb-3 custom-tabs"
            >
              <Tab eventKey="bar" title="बार ग्राफ">
                <div style={{ overflowX: "auto" }}>
                  <ComparisonBarChart
                    data={chartData}
                    title="आवंटित बनाम वितरण"
                    onBarClick={handleBarClick}
                  />
                </div>
              </Tab>

              <Tab eventKey="pie" title="पाई चार्ट">
                <PieChart
                  data={pieChartData}
                  title="विवरण पाई चार्ट"
                  onPieClick={handlePieClick}
                />
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </Modal.Body>

      {/* Table Details Modal */}
      <TableDetailsModal
        show={showTableDetailsModal}
        onHide={() => setShowTableDetailsModal(false)}
        tableData={tableDetailsData}
        centerName={tableDetailsCenterName}
      />
    </Modal>
  );
};

export default VivranSummaryModal;
