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
  sourceOfReceipt: "प्राप्ति का स्रोत",
  schemeName: "योजना का नाम",
  vikasKhandName: "विकास खंड का नाम",
  vidhanSabhaName: "विधानसभा का नाम",
  selectOption: "चुनें",
};

const MainDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
                    variant="outline-secondary"
                    size="sm"
                    onClick={clearFilters}
                  >
                    सभी फिल्टर हटाएं
                  </Button>
                </div>
                <Row>
                  <Col xs={12} sm={6} md={3}>
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
                        onChange={(selected) => {
                          setFilters((prev) => ({
                            ...prev,
                            center_name: selected
                              ? selected.map((s) => s.value)
                              : [],
                          }));
                        }}
                        options={filterOptions.center_name.map((option) => ({
                          value: option,
                          label: option,
                        }))}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                    <Col xs={12} sm={6} md={3}>
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
                        onChange={(selected) => {
                          setFilters((prev) => ({
                            ...prev,
                            vikas_khand_name: selected
                              ? selected.map((s) => s.value)
                              : [],
                          }));
                        }}
                        options={filterOptions.vikas_khand_name.map(
                          (option) => ({ value: option, label: option })
                        )}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
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
                        onChange={(selected) => {
                          setFilters((prev) => ({
                            ...prev,
                            vidhan_sabha_name: selected
                              ? selected.map((s) => s.value)
                              : [],
                          }));
                        }}
                        options={filterOptions.vidhan_sabha_name.map(
                          (option) => ({ value: option, label: option })
                        )}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
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
                        onChange={(selected) => {
                          setFilters((prev) => ({
                            ...prev,
                            component: selected
                              ? selected.map((s) => s.value)
                              : [],
                          }));
                        }}
                        options={filterOptions.component.map((option) => ({
                          value: option,
                          label: option,
                        }))}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
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
                        onChange={(selected) => {
                          setFilters((prev) => ({
                            ...prev,
                            investment_name: selected
                              ? selected.map((s) => s.value)
                              : [],
                          }));
                        }}
                        options={filterOptions.investment_name.map(
                          (option) => ({ value: option, label: option })
                        )}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                      <Col xs={12} sm={6} md={3}>
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
                        onChange={(selected) => {
                          setFilters((prev) => ({
                            ...prev,
                            sub_investment_name: selected
                              ? selected.map((s) => s.value)
                              : [],
                          }));
                        }}
                        options={filterOptions.sub_investment_name.map(
                          (option) => ({ value: option, label: option })
                        )}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
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
                        onChange={(selected) => {
                          setFilters((prev) => ({
                            ...prev,
                            source_of_receipt: selected
                              ? selected.map((s) => s.value)
                              : [],
                          }));
                        }}
                        options={filterOptions.source_of_receipt.map((option) => ({
                          value: option,
                          label: option,
                        }))}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
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
                        onChange={(selected) => {
                          setFilters((prev) => ({
                            ...prev,
                            scheme_name: selected
                              ? selected.map((s) => s.value)
                              : [],
                          }));
                        }}
                        options={filterOptions.scheme_name.map((option) => ({
                          value: option,
                          label: option,
                        }))}
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
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <td>3</td>
          <td colSpan={2}>Larry the Bird</td>
          <td>@twitter</td>
        </tr>
      </tbody>
    </Table>
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
