import React, { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import Select from "react-select";
import "../../assets/css/registration.css";
import DashBoardHeader from "./DashBoardHeader";
import "../../assets/css/MainDashBoard.css";

// Static options for form fields
const centerOptions = [
  "किनगोड़िखाल",
  "हल्दूखाल",
  "धुमाकोट",
  "सिसल्ड़ी",
  "सेंधीखाल",
  "जयहरीखाल",
  "जेठागांव",
  "देवियोंखाल",
  "किल्वोंखाल",
  "बीरोंखाल",
  "वेदीखाल",
  "पोखड़ा",
  "संगलाकोटी",
  "देवराजखाल",
  "चौखाल",
  "गंगाभोगपुर",
  "दिउली",
  "दुगड्डा",
  "बिथ्याणी",
  "चैलूसैंण",
  "सिलोगी",
  "कोटद्वार",
  "सतपुली",
  "पौखाल",
];
const componentOptions = ["सीमेंट", "स्टील", "बालू", "पत्थर", "ईंट"];
const investmentOptions = [
  "भवन निर्माण",
  "सड़क निर्माण",
  "पुल निर्माण",
  "कुआँ निर्माण",
];
const sourceOptions = ["PWD", "PMGSY", "NREGA"];
const schemeOptions = ["MGNREGA", "PMKSY", "DDUGJY"];
const vikasKhandOptions = [
  "नैनीडांडा",
  "बीरोंखाल",
  "यमकेश्वर",
  "दुगड्डा",
  "पौड़ी",
  "द्वारीखाल",
  "जयहरीखाल",
  "रिखणीखाल",
  "नगर निगम कोटद्वार",
];
const vidhanSabhaOptions = [
  "लैन्सडाउन",
  "यमकेश्वर",
  "चौबट्टाखाल",
  "कोटद्वार",
  "श्रीनगर",
];

// Hindi translations for form
const translations = {
  pageTitle: "डैशबोर्ड",
  centerName: "केंद्र का नाम",
  component: "घटक",
  investmentName: "निवेश का नाम",
  sourceOfReceipt: "प्राप्ति का स्रोत",
  schemeName: "योजना का नाम",
  vikasKhandName: "विकास खंड का नाम",
  vidhanSabhaName: "विधानसभा का नाम",
  selectOption: "चुनें",
};

const MainDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // State for filters
  const [filters, setFilters] = useState({
    center_name: [],
    component: [],
    investment_name: [],
    source_of_receipt: [],
    scheme_name: [],
    vikas_khand_name: [],
    vidhan_sabha_name: [],
  });

  // State for filter options (using static options)
  const [filterOptions, setFilterOptions] = useState({
    center_name: centerOptions,
    component: componentOptions,
    investment_name: investmentOptions,
    source_of_receipt: sourceOptions,
    scheme_name: schemeOptions,
    vikas_khand_name: vikasKhandOptions,
    vidhan_sabha_name: vidhanSabhaOptions,
  });

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      center_name: [],
      component: [],
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
              <h1 className="page-title small-fonts">
                {translations.pageTitle}
              </h1>

              {/* Multi-Filter Section */}
              <div className="filter-section mb-3 p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="small-fonts mb-0">फिल्टर</h6>
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
                      <Form.Label className="small-fonts fw-bold">
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
                      <Form.Label className="small-fonts fw-bold">
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
                      <Form.Label className="small-fonts fw-bold">
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
                      <Form.Label className="small-fonts fw-bold">
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
                        options={[
                          ...new Set([
                            ...filterOptions.source_of_receipt,
                            ...sourceOptions,
                          ]),
                        ].map((option) => ({ value: option, label: option }))}
                        className="compact-input"
                        placeholder="चुनें"
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={3}>
                    <Form.Group className="mb-2">
                      <Form.Label className="small-fonts fw-bold">
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
                        options={[
                          ...new Set([
                            ...filterOptions.scheme_name,
                            ...schemeOptions,
                          ]),
                        ].map((option) => ({
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
                      <Form.Label className="small-fonts fw-bold">
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
                      <Form.Label className="small-fonts fw-bold">
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
                </Row>
              </div>
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default MainDashboard;
