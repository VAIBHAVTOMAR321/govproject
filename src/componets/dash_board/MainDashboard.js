import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Table } from "react-bootstrap";
import Select from "react-select";
import "../../assets/css/registration.css";
import DashBoardHeader from "./DashBoardHeader";
import "../../assets/css/MainDashBoard.css";

const API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/billing-items/";

// Hindi translations for form
const translations = {
  pageTitle: "डैशबोर्ड",
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

const MainDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

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

  // Pagination logic
  const totalPages = Math.ceil(tableData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = tableData.slice(startIndex, endIndex);

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
                {translations.pageTitle}
              </h1>

              {/* Multi-Filter Section */}
              <div className="filter-section mb-3 p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="form-label mb-0">फिल्टर</h6>
                  <Button
                    className="clear-btn-primary"
                    variant="outline-secondary"
                    size="sm"
                    onClick={clearFilters}
                  >
                    सभी फिल्टर हटाएं
                  </Button>
                </div>
                <Row>
                  <Col>
                    <Form.Group className="mb-2">
                      <Form.Label className="form-label fw-bold">
                        {translations.centerName}
                      </Form.Label>
                      <Select
                        isMulti
                        name="center_name"
                        value={filters.center_name.map((val) => ({
                          value: val,
                          label: val,
                        }))}
                        onChange={(selected) => handleSelectChange("center_name", selected)}
                        options={getOptionsWithAll(filterOptions.center_name)}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                    <Col>
                    <Form.Group className="mb-2">
                      <Form.Label className="form-label fw-bold">
                        {translations.vikasKhandName}
                      </Form.Label>
                      <Select
                        isMulti
                        name="vikas_khand_name"
                        value={filters.vikas_khand_name.map((val) => ({
                          value: val,
                          label: val,
                        }))}
                        onChange={(selected) => handleSelectChange("vikas_khand_name", selected)}
                        options={getOptionsWithAll(filterOptions.vikas_khand_name)}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-2">
                      <Form.Label className="form-label fw-bold">
                        {translations.vidhanSabhaName}
                      </Form.Label>
                      <Select
                        isMulti
                        name="vidhan_sabha_name"
                        value={filters.vidhan_sabha_name.map((val) => ({
                          value: val,
                          label: val,
                        }))}
                        onChange={(selected) => handleSelectChange("vidhan_sabha_name", selected)}
                        options={getOptionsWithAll(filterOptions.vidhan_sabha_name)}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-2">
                      <Form.Label className="form-label fw-bold">
                        {translations.component}
                      </Form.Label>
                      <Select
                        isMulti
                        name="component"
                        value={filters.component.map((val) => ({
                          value: val,
                          label: val,
                        }))}
                        onChange={(selected) => handleSelectChange("component", selected)}
                        options={getOptionsWithAll(filterOptions.component)}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-2">
                      <Form.Label className="form-label fw-bold">
                        {translations.investmentName}
                      </Form.Label>
                      <Select
                        isMulti
                        name="investment_name"
                        value={filters.investment_name.map((val) => ({
                          value: val,
                          label: val,
                        }))}
                        onChange={(selected) => handleSelectChange("investment_name", selected)}
                        options={getOptionsWithAll(filterOptions.investment_name)}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                      <Col>
                    <Form.Group className="mb-2">
                      <Form.Label className="form-label fw-bold">
                        {translations.subInvestmentName}
                      </Form.Label>
                      <Select
                        isMulti
                        name="sub_investment_name"
                        value={filters.sub_investment_name.map((val) => ({
                          value: val,
                          label: val,
                        }))}
                        onChange={(selected) => handleSelectChange("sub_investment_name", selected)}
                        options={getOptionsWithAll(filterOptions.sub_investment_name)}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-2">
                      <Form.Label className="form-label fw-bold">
                        {translations.sourceOfReceipt}
                      </Form.Label>
                      <Select
                        isMulti
                        name="source_of_receipt"
                        value={filters.source_of_receipt.map((val) => ({
                          value: val,
                          label: val,
                        }))}
                        onChange={(selected) => handleSelectChange("source_of_receipt", selected)}
                        options={getOptionsWithAll(filterOptions.source_of_receipt)}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                  <Col>
                    <Form.Group className="mb-2">
                      <Form.Label className="form-label fw-bold">
                        {translations.schemeName}
                      </Form.Label>
                      <Select
                        isMulti
                        name="scheme_name"
                        value={filters.scheme_name.map((val) => ({
                          value: val,
                          label: val,
                        }))}
                        onChange={(selected) => handleSelectChange("scheme_name", selected)}
                        options={getOptionsWithAll(filterOptions.scheme_name)}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                
                </Row>
              </div>
               <Row>
           <Col lg={3} md={3} sm={12}>
            {/* Placeholder for Dashboard Graphs/Charts */}
            <div className="dashboard-graphs p-3 border rounded bg-white">
         check box 
            </div>
          </Col>
          <Col lg={9} md={9} sm={12}>
            {/* Placeholder for Dashboard Graphs/Charts */}
            <div className="dashboard-graphs p-3 border rounded bg-white">
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
            <td>{item.center_name}</td>
            <td>{item.vidhan_sabha_name}</td>
            <td>{item.vikas_khand_name}</td>
            <td>{item.scheme_name}</td>
            <td>{item.source_of_receipt}</td>
            <td>{item.component}</td>
            <td>{item.investment_name}</td>
            <td>{item.sub_investment_name || '-'}</td>
            <td>{item.allocated_quantity}</td>
            <td>{item.rate}</td>
          </tr>
        ))}
      </tbody>
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
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainDashboard;
