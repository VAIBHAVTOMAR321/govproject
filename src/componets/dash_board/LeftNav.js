import React, { useState } from "react";
import { Card, Form, Button, Collapse } from "react-bootstrap";
import "../../assets/css/dashboard.css";
import "../../assets/css/LeftNav.css";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";

const LeftNav = ({ onApply }) => {
  const [filters, setFilters] = useState({
    year: [],
    sector: [],
    block: [],
    village: [],
  });
  
  // State to manage the open/closed state of each filter section
  const [openSections, setOpenSections] = useState({
    year: true,
    sector: true,
    block: true,
    village: true,
  });

  const handleChange = (e) => {
    const { name, options } = e.target;
    const values = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);

    setFilters(prev => ({
      ...prev,
      [name]: values
    }));
  };

  // Function to toggle a specific section
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleApply = () => {
    onApply(filters);
  };

  return (
    <Card className="filter-sidebar shadow-sm">
      <Card.Body>
        <h5 className="filter-title mb-4">Filters</h5>

        {/* YEAR COLLAPSIBLE SECTION */}
        <Card className="mb-3 filter-section-card">
          <Card.Header 
            className="d-flex justify-content-between align-items-center card-header-main"
            onClick={() => toggleSection('year')}
            style={{ cursor: 'pointer' }}
          >
            <Form.Label className="mb-0 fw-bold gov-form-label">Year</Form.Label>
            <span>{openSections.year ? <FaAngleUp /> : <FaAngleDown />}</span>
          </Card.Header>
          <Collapse in={openSections.year}>
            <Card.Body className="pt-0">
              <Form.Select
                name="year"
                multiple
                className="filter-select"
                onChange={handleChange}
              >
                <option>2023-24</option>
                <option>2024-25</option>
                <option>2025-26</option>
              </Form.Select>
            </Card.Body>
          </Collapse>
        </Card>

        {/* SECTOR COLLAPSIBLE SECTION */}
        <Card className="mb-3 filter-section-card">
          <Card.Header 
            className="d-flex justify-content-between align-items-center card-header-main"
            onClick={() => toggleSection('sector')}
            style={{ cursor: 'pointer' }}
          >
            <Form.Label className="mb-0 fw-bold  gov-form-label">Sector</Form.Label>
            <span>{openSections.sector ? <FaAngleUp /> : <FaAngleDown />}</span>
          </Card.Header>
          <Collapse in={openSections.sector}>
            <Card.Body className="pt-0">
              <Form.Select
                name="sector"
                multiple
                className="filter-select"
                onChange={handleChange}
              >
                <option>Agriculture</option>
                <option>Horticulture</option>
                <option>Food Processing</option>
              </Form.Select>
            </Card.Body>
          </Collapse>
        </Card>

        {/* DEVELOPMENT BLOCK COLLAPSIBLE SECTION */}
        <Card className="mb-3 filter-section-card">
          <Card.Header 
            className="d-flex justify-content-between align-items-center card-header-main"
            onClick={() => toggleSection('block')}
            style={{ cursor: 'pointer' }}
          >
            <Form.Label className="mb-0 fw-bold gov-form-label">Development Block</Form.Label>
            <span>{openSections.block ? <FaAngleUp /> : <FaAngleDown />}</span>
          </Card.Header>
          <Collapse in={openSections.block}>
            <Card.Body className="pt-0">
              <Form.Select
                name="block"
                multiple
                className="filter-select"
                onChange={handleChange}
              >
                <option>Kotdwar</option>
                <option>Dugadda</option>
                <option>Yamkeshwar</option>
              </Form.Select>
            </Card.Body>
          </Collapse>
        </Card>

        {/* VILLAGE COLLAPSIBLE SECTION */}
        <Card className="mb-4 filter-section-card">
          <Card.Header 
            className="d-flex justify-content-between align-items-center card-header-main"
            onClick={() => toggleSection('village')}
            style={{ cursor: 'pointer' }}
          >
            <Form.Label className="mb-0 fw-bold gov-form-label">Village</Form.Label>
            <span>{openSections.village ? <FaAngleUp /> : <FaAngleDown />}</span>
          </Card.Header>
          <Collapse in={openSections.village}>
            <Card.Body className="pt-0">
              <Form.Select
                name="village"
                multiple
                className="filter-select"
                onChange={handleChange}
              >
                <option>Village 1</option>
                <option>Village 2</option>
                <option>Village 3</option>
              </Form.Select>
            </Card.Body>
          </Collapse>
        </Card>

        
      </Card.Body>
    </Card>
  );
};

export default LeftNav;