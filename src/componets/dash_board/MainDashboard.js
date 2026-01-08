import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Tabs,
  Tab,
  Badge,
  Card,
  Button,
  Spinner,
  Modal,
  Table,
} from "react-bootstrap";
import axios from "axios";
import "../../assets/css/registration.css";
import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";
import "../../assets/css/MainDashBoard.css";


// BarChart Component
const BarChart = ({ data }) => {
  const [tooltip, setTooltip] = React.useState({
    show: false,
    x: 0,
    y: 0,
    name: "",
    value: 0,
  });

  if (!data || data.length === 0) return null;

  // Calculate maximum value for scaling
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));

  // SVG dimensions
  const width = 300;
  const height = 150;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Bar spacing - improved calculation
  const totalBarSpace = chartWidth;
  const numBars = data.length;
  const barWidth = Math.min(40, Math.max(15, totalBarSpace / (numBars * 1.5))); // Max 40px, min 15px
  const barPadding = (totalBarSpace - numBars * barWidth) / (numBars - 1) || 10;

  // Colors for bars
  const colors = [
    "#007bff",
    "#28a745",
    "#ffc107",
    "#dc3545",
    "#6f42c1",
    "#17a2b8",
    "#e83e8c",
    "#fd7e14",
  ];

  // Generate bars with tooltips
  const bars = data.map((item, index) => {
    const x = numBars === 1
      ? margin.left + (totalBarSpace - barWidth) / 2
      : margin.left + index * (barWidth + barPadding);
    const y = margin.top + chartHeight - (item.value / maxValue) * chartHeight;
    const height = (item.value / maxValue) * chartHeight;
    const color = colors[index % colors.length];

    return (
      <g key={index}>
        {/* Invisible hover area for tooltip */}
        <rect
          x={x - 5}
          y={margin.top}
          width={barWidth + 10}
          height={chartHeight}
          fill="transparent"
          onMouseEnter={(e) => {
            const containerRect = e.currentTarget
              .closest(".bar-chart-container")
              .getBoundingClientRect();
            const svgRect = e.currentTarget
              .closest("svg")
              .getBoundingClientRect();

            // Position tooltip in center of graph section
            const tooltipX = containerRect.width / 2 - 60; // Center horizontally (120px width / 2)
            const tooltipY = containerRect.height / 2 - 30; // Center vertically (60px height / 2)

            setTooltip({
              show: true,
              x: tooltipX,
              y: tooltipY,
              name: item.name,
              value: item.value,
            });
          }}
          onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
        />
        {/* Actual bar */}
        <rect
          x={x}
          y={y}
          width={barWidth}
          height={Math.max(2, height)} // Minimum height of 2px
          fill={color}
          rx="2"
          onMouseEnter={(e) => {
            const containerRect = e.currentTarget
              .closest(".bar-chart-container")
              .getBoundingClientRect();
            const svgRect = e.currentTarget
              .closest("svg")
              .getBoundingClientRect();

            // Position tooltip in center of graph section
            const tooltipX = containerRect.width / 2 - 60; // Center horizontally (120px width / 2)
            const tooltipY = containerRect.height / 2 - 30; // Center vertically (60px height / 2)

            setTooltip({
              show: true,
              x: tooltipX,
              y: tooltipY,
              name: item.name,
              value: item.value,
            });
          }}
          onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
        />
      </g>
    );
  });

  return (
    <div className="bar-chart-container">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background */}
        <rect width="100%" height="100%" fill="#f8f9fa" rx="4" />

        {/* Axes */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="#6c757d"
          strokeWidth="2"
        />
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="#6c757d"
          strokeWidth="2"
        />

        {/* Y-axis labels */}
        <text
          x={15}
          y={margin.top}
          textAnchor="start"
          fontSize="10"
          fill="#6c757d"
        >
          Max: {maxValue}
        </text>
        <text
          x={15}
          y={height - margin.bottom}
          textAnchor="start"
          fontSize="10"
          fill="#6c757d"
        >
          Min: {minValue}
        </text>

        {/* Bars */}
        {bars}
      </svg>

      {/* Tooltip */}
      {tooltip.show && (
        <div className="bar-chart-tooltip">
          <div>
            <strong>{tooltip.name}</strong>
          </div>
          <div>मात्रा: {tooltip.value}</div>
        </div>
      )}
    </div>
  );
};

const MainDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);


  // State to control the active tab
  

  // API data state


  // Filtered data state


  // State for VivranSummaryModal

 

  // State for multiselect centers
 







  return (
    <div>
      <Container fluid className="p-4">
        <Row>
          <Col lg={12} md={12} sm={12}>
            <DashBoardHeader
           
            />
          </Col>
        </Row>

        <Row className="left-top">
         

          <Col lg={12} md={12} sm={12}>
            <Container fluid className="dashboard-body-main">
            <h1 className="page-title small-fonts">{translations.pageTitle}</h1>

            {/* Bulk Upload Section */}
            <Row className="mb-3">
              <Col xs={12} md={6}>
                <Form.Group controlId="excelFile">
                  <Form.Label className="small-fonts fw-bold">
                    {translations.bulkUpload}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="compact-input"
                    ref={fileInputRef}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={3} className="d-flex align-items-end">
                <Button
                  variant="secondary"
                  onClick={handleBulkUpload}
                  disabled={!excelFile || isUploading}
                  className="compact-submit-btn w-100"
                >
                  {isUploading
                    ? "अपलोड हो रहा है..."
                    : translations.uploadButton}
                </Button>
              </Col>
              <Col xs={12} md={3} className="d-flex align-items-end">
                <Button
                  variant="info"
                  onClick={downloadSampleTemplate}
                  disabled={isUploading}
                  className="compact-submit-btn w-100"
                >
                  डाउनलोड टेम्पलेट
                </Button>
              </Col>
            </Row>

            {apiResponse && (
              <Alert variant="success" className="small-fonts">
                {translations.successMessage}
              </Alert>
            )}
            {apiError && (
              <Alert variant="danger" className="small-fonts">
                {apiError}
              </Alert>
            )}

            {/* Excel Upload Instructions */}
            <Alert variant="info" className="small-fonts mb-3">
              <strong>Excel अपलोड निर्देश:</strong>
              <ul className="mb-0">
                <li>कृपया सही फॉर्मेट में Excel फाइल अपलोड करें</li>
                <li>
                  अनिवार्य फ़ील्ड: केंद्र का नाम, घटक, निवेश का नाम, इकाई,
                  आवंटित मात्रा, दर, प्राप्ति का स्रोत, योजना का नाम,उप-निवेश का
                  नाम, विकास खंड का नाम, विधानसभा का नाम
                </li>
                <li>आवंटित मात्रा और दर संख्यात्मक होनी चाहिए</li>
                <li>डाउनलोड टेम्पलेट बटन का उपयोग करें सही फॉर्मेट के लिए</li>
              </ul>
            </Alert>

            {/* Center Selection - Always visible */}
            <Form.Group className="mb-3" controlId="center_selection">
              <Form.Label className="small-fonts fw-bold">
                {translations.centerName}
              </Form.Label>
              <Form.Select
                name="center_name"
                value={formData.center_name}
                onChange={handleChange}
                isInvalid={!!errors.center_name}
                className="compact-input"
              >
                <option value="">{translations.selectOption}</option>
                {centerOptions.map((center, index) => (
                  <option key={index} value={center}>
                    {center}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.center_name}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Billing Form Section - Only show when center is selected */}
            {formData.center_name && (
              <Form
                onSubmit={handleSubmit}
                className="registration-form compact-form"
              >
                <Row>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="component">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.component}
                      </Form.Label>
                      <Form.Select
                        name="component"
                        value={formData.component}
                        onChange={handleChange}
                        isInvalid={!!errors.component}
                        className="compact-input"
                        disabled={isLoadingFilters}
                      >
                        <option value="">{translations.selectOption}</option>
                        {formOptions.component.map((comp, index) => (
                          <option key={index} value={comp}>
                            {comp}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.component}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="investment_name">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.investmentName}
                      </Form.Label>
                      <Form.Select
                        name="investment_name"
                        value={formData.investment_name}
                        onChange={handleChange}
                        isInvalid={!!errors.investment_name}
                        className="compact-input"
                        disabled={isLoadingFilters}
                      >
                        <option value="">{translations.selectOption}</option>
                        {formOptions.investment_name.map((inv, index) => (
                          <option key={index} value={inv}>
                            {inv}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.investment_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group
                      className="mb-2"
                      controlId="sub_investment_name"
                    >
                      <Form.Label className="small-fonts fw-bold">
                        {translations.subInvestmentName}
                      </Form.Label>
                      <Form.Select
                        name="sub_investment_name"
                        value={formData.sub_investment_name}
                        onChange={handleChange}
                        isInvalid={!!errors.sub_investment_name}
                        className="compact-input"
                        disabled={isLoadingFilters}
                      >
                        <option value="">{translations.selectOption}</option>
                        {filterOptions.sub_investment_name.map(
                          (subInv, index) => (
                            <option key={index} value={subInv}>
                              {subInv}
                            </option>
                          )
                        )}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.sub_investment_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="unit">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.unit}
                      </Form.Label>
                      <Form.Select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        isInvalid={!!errors.unit}
                        className="compact-input"
                        disabled={isLoadingFilters}
                      >
                        <option value="">{translations.selectOption}</option>
                        {filterOptions.unit.map((unit, index) => (
                          <option key={index} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.unit}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="allocated_quantity">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.allocatedQuantity}
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="allocated_quantity"
                        value={formData.allocated_quantity}
                        onChange={handleChange}
                        isInvalid={!!errors.allocated_quantity}
                        className="compact-input"
                        placeholder="आवंटित मात्रा दर्ज करें"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.allocated_quantity}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="rate">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.rate}
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="rate"
                        value={formData.rate}
                        onChange={handleChange}
                        isInvalid={!!errors.rate}
                        className="compact-input"
                        placeholder="दर दर्ज करें"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.rate}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="source_of_receipt">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.sourceOfReceipt}
                      </Form.Label>
                      <Form.Select
                        name="source_of_receipt"
                        value={formData.source_of_receipt}
                        onChange={handleChange}
                        isInvalid={!!errors.source_of_receipt}
                        className="compact-input"
                        disabled={isLoadingFilters}
                      >
                        <option value="">{translations.selectOption}</option>
                        {[
                          ...new Set([
                            ...filterOptions.source_of_receipt,
                            ...sourceOptions,
                          ]),
                        ].map((source, index) => (
                          <option key={index} value={source}>
                            {source}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.source_of_receipt}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="scheme_name">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.schemeName}
                      </Form.Label>
                      <Form.Select
                        name="scheme_name"
                        value={formData.scheme_name}
                        onChange={handleChange}
                        isInvalid={!!errors.scheme_name}
                        className="compact-input"
                        disabled={isLoadingFilters}
                      >
                        <option value="">{translations.selectOption}</option>
                        {[
                          ...new Set([
                            ...filterOptions.scheme_name,
                            ...schemeOptions,
                          ]),
                        ].map((scheme, index) => (
                          <option key={index} value={scheme}>
                            {scheme}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.scheme_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="vikas_khand_name">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.vikasKhandName}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="vikas_khand_name"
                        value={formData.vikas_khand_name}
                        onChange={handleChange}
                        isInvalid={!!errors.vikas_khand_name}
                        className="compact-input"
                        disabled
                        placeholder={
                          isFetchingVikasKhand ? "लोड हो रहा है..." : ""
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.vikas_khand_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} sm={6} md={2}>
                    <Form.Group className="mb-2" controlId="vidhan_sabha_name">
                      <Form.Label className="small-fonts fw-bold">
                        {translations.vidhanSabhaName}
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="vidhan_sabha_name"
                        value={formData.vidhan_sabha_name}
                        onChange={handleChange}
                        isInvalid={!!errors.vidhan_sabha_name}
                        className="compact-input"
                        disabled
                        placeholder={
                          isFetchingVikasKhand ? "लोड हो रहा है..." : ""
                        }
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.vidhan_sabha_name}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col
                    xs={12}
                    sm={6}
                    md={4}
                    className="d-flex align-items-center"
                  >
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                      className="compact-submit-btn w-100"
                    >
                      {isSubmitting
                        ? translations.submitting
                        : translations.submitButton}
                    </Button>
                  </Col>
                </Row>
              </Form>
            )}
            {/* Table Section */}
            <div className="billing-table-section mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="small-fonts mb-0">बिलिंग आइटम डेटा</h3>
                <div className="d-flex align-items-center">
                  {billingItems.length > 0 && (
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id="tooltip-refresh">रीफ्रेश करें</Tooltip>
                      }
                    >
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="me-2"
                      >
                        <FaSync
                          className={`me-1 ${isLoading ? "fa-spin" : ""}`}
                        />
                        रीफ्रेश
                      </Button>
                    </OverlayTrigger>
                  )}
                  {filteredItems.length > 0 && (
                    <>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-excel">
                            Excel डाउनलोड करें
                          </Tooltip>
                        }
                      >
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() =>
                            downloadExcel(
                              filteredItems,
                              `Billing_Items_${new Date()
                                .toISOString()
                                .slice(0, 10)}`,
                              billingTableColumnMapping,
                              selectedColumns
                            )
                          }
                          className="me-2"
                        >
                          <FaFileExcel className="me-1" />
                          Excel
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-pdf">PDF डाउनलोड करें</Tooltip>
                        }
                      >
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() =>
                            downloadPdf(
                              filteredItems,
                              `Billing_Items_${new Date()
                                .toISOString()
                                .slice(0, 10)}`,
                              billingTableColumnMapping,
                              selectedColumns,
                              "बिलिंग आइटम डेटा"
                            )
                          }
                        >
                          <FaFilePdf className="me-1" />
                          PDF
                        </Button>
                      </OverlayTrigger>
                    </>
                  )}
                </div>
              </div>

              {/* Table info with pagination details */}
              {filteredItems.length > 0 && (
                <div className="table-info mb-2 d-flex justify-content-between align-items-center">
                  <span className="small-fonts">
                    {translations.showing}{" "}
                    {(currentPage - 1) * itemsPerPage + 1} {translations.to}{" "}
                    {Math.min(currentPage * itemsPerPage, filteredItems.length)}{" "}
                    {translations.of} {filteredItems.length}{" "}
                    {translations.entries}
                  </span>
                  <div className="d-flex align-items-center">
                    <span className="small-fonts me-2">
                      {translations.itemsPerPage}
                    </span>
                    <span className="badge bg-primary">{itemsPerPage}</span>
                  </div>
                </div>
              )}

              {/* Column Selection Section */}
              {billingItems.length > 0 && (
                <ColumnSelection
                  columns={billingTableColumns}
                  selectedColumns={selectedColumns}
                  setSelectedColumns={setSelectedColumns}
                  title="कॉलम चुनें"
                />
              )}

              {/* Multi-Filter Section */}
              {billingItems.length > 0 && (
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
                    {/* Added date range filters */}
                    <Col xs={12} sm={6} md={3}>
                      <Form.Group className="mb-2">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.startDate}
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="start_date"
                          value={filters.start_date}
                          onChange={handleFilterChange}
                          className="compact-input"
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12} sm={6} md={3}>
                      <Form.Group className="mb-2">
                        <Form.Label className="small-fonts fw-bold">
                          {translations.endDate}
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="end_date"
                          value={filters.end_date}
                          onChange={handleFilterChange}
                          className="compact-input"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              )}

              {isLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">लोड हो रहा है...</span>
                  </div>
                  <p className="mt-2 small-fonts">डेटा लोड हो रहा है...</p>
                </div>
              ) : billingItems.length === 0 ? (
                <Alert variant="info" className="text-center">
                  कोई बिलिंग आइटम डेटा उपलब्ध नहीं है।
                </Alert>
              ) : (
                <>
                  <Table striped bordered hover className="registration-form">
                    <thead className="table-light">
                      <tr>
                        <th>क्र.सं.</th>
                        {selectedColumns.includes("center_name") && (
                          <th>{translations.centerName}</th>
                        )}
                        {selectedColumns.includes("component") && (
                          <th>{translations.component}</th>
                        )}
                        {selectedColumns.includes("investment_name") && (
                          <th>{translations.investmentName}</th>
                        )}
                        {selectedColumns.includes("sub_investment_name") && (
                          <th>{translations.subInvestmentName}</th>
                        )}
                        {selectedColumns.includes("unit") && (
                          <th>{translations.unit}</th>
                        )}
                        {selectedColumns.includes("allocated_quantity") && (
                          <th>{translations.allocatedQuantity}</th>
                        )}
                        {selectedColumns.includes("rate") && (
                          <th>{translations.rate}</th>
                        )}
                        {selectedColumns.includes("source_of_receipt") && (
                          <th>{translations.sourceOfReceipt}</th>
                        )}
                        {selectedColumns.includes("scheme_name") && (
                          <th>{translations.schemeName}</th>
                        )}
                        {selectedColumns.includes("vikas_khand_name") && (
                          <th>{translations.vikasKhandName}</th>
                        )}
                        {selectedColumns.includes("vidhan_sabha_name") && (
                          <th>{translations.vidhanSabhaName}</th>
                        )}
                        {selectedColumns.includes("created_at") && (
                          <th>{billingTableColumnMapping.created_at.header}</th>
                        )}
                        <th>कार्रवाई</th>
                      </tr>
                    </thead>
                    <tbody className="tbl-body">
                      {filteredItems
                        .slice(
                          (currentPage - 1) * itemsPerPage,
                          currentPage * itemsPerPage
                        )
                        .map((item, index) => (
                          <tr key={item.id || index}>
                            <td>
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            {selectedColumns.includes("center_name") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.center_name}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        center_name: value,
                                        vikas_khand_name: "",
                                        vidhan_sabha_name: "",
                                      }));
                                      if (value) {
                                        fetchVikasKhandData(value);
                                      }
                                    }}
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {centerOptions.map((center, index) => (
                                      <option key={index} value={center}>
                                        {center}
                                      </option>
                                    ))}
                                  </Form.Select>
                                ) : (
                                  item.center_name
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("component") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.component}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        component: value,
                                        investment_name: "",
                                        sub_investment_name: "",
                                        unit: "",
                                      }));
                                      if (value) {
                                        fetchFormFilters(value);
                                      }
                                    }}
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {filterOptions.component.map(
                                      (comp, index) => (
                                        <option key={index} value={comp}>
                                          {comp}
                                        </option>
                                      )
                                    )}
                                  </Form.Select>
                                ) : (
                                  item.component
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("investment_name") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.investment_name}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        investment_name: value,
                                        sub_investment_name: "",
                                        unit: "",
                                      }));
                                      if (value) {
                                        fetchFormFilters("", value);
                                      }
                                    }}
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {filterOptions.investment_name.map(
                                      (inv, index) => (
                                        <option key={index} value={inv}>
                                          {inv}
                                        </option>
                                      )
                                    )}
                                  </Form.Select>
                                ) : (
                                  item.investment_name
                                )}
                              </td>
                            )}
                            {selectedColumns.includes(
                              "sub_investment_name"
                            ) && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.sub_investment_name}
                                    onChange={(e) =>
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        sub_investment_name: e.target.value,
                                      }))
                                    }
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {filterOptions.sub_investment_name.map(
                                      (subInv, index) => (
                                        <option key={index} value={subInv}>
                                          {subInv}
                                        </option>
                                      )
                                    )}
                                  </Form.Select>
                                ) : (
                                  item.sub_investment_name
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("unit") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.unit}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        unit: value,
                                      }));
                                    }}
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {formOptions.unit.map((unit, index) => (
                                      <option key={index} value={unit}>
                                        {unit}
                                      </option>
                                    ))}
                                  </Form.Select>
                                ) : (
                                  item.unit
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("allocated_quantity") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Control
                                    type="number"
                                    value={editingValues.allocated_quantity}
                                    onChange={(e) =>
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        allocated_quantity: e.target.value,
                                      }))
                                    }
                                    size="sm"
                                  />
                                ) : (
                                  item.allocated_quantity
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("rate") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    value={editingValues.rate}
                                    onChange={(e) =>
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        rate: e.target.value,
                                      }))
                                    }
                                    size="sm"
                                  />
                                ) : (
                                  item.rate
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("source_of_receipt") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.source_of_receipt}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        source_of_receipt: value,
                                      }));
                                    }}
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {[
                                      ...new Set([
                                        ...filterOptions.source_of_receipt,
                                        ...sourceOptions,
                                      ]),
                                    ].map((source, index) => (
                                      <option key={index} value={source}>
                                        {source}
                                      </option>
                                    ))}
                                  </Form.Select>
                                ) : (
                                  item.source_of_receipt
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("scheme_name") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.scheme_name}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        scheme_name: value,
                                      }));
                                    }}
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {[
                                      ...new Set([
                                        ...filterOptions.scheme_name,
                                        ...schemeOptions,
                                      ]),
                                    ].map((scheme, index) => (
                                      <option key={index} value={scheme}>
                                        {scheme}
                                      </option>
                                    ))}
                                  </Form.Select>
                                ) : (
                                  item.scheme_name
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("vikas_khand_name") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.vikas_khand_name}
                                    onChange={(e) =>
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        vikas_khand_name: e.target.value,
                                      }))
                                    }
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {filterOptions.vikas_khand_name.map(
                                      (vikas, index) => (
                                        <option key={index} value={vikas}>
                                          {vikas}
                                        </option>
                                      )
                                    )}
                                  </Form.Select>
                                ) : (
                                  item.vikas_khand_name
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("vidhan_sabha_name") && (
                              <td>
                                {editingRowId === item.id ? (
                                  <Form.Select
                                    value={editingValues.vidhan_sabha_name}
                                    onChange={(e) =>
                                      setEditingValues((prev) => ({
                                        ...prev,
                                        vidhan_sabha_name: e.target.value,
                                      }))
                                    }
                                    size="sm"
                                  >
                                    <option value="">चुनें</option>
                                    {filterOptions.vidhan_sabha_name.map(
                                      (vidhan, index) => (
                                        <option key={index} value={vidhan}>
                                          {vidhan}
                                        </option>
                                      )
                                    )}
                                  </Form.Select>
                                ) : (
                                  item.vidhan_sabha_name
                                )}
                              </td>
                            )}
                            {selectedColumns.includes("created_at") && (
                              <td>
                                {billingTableColumnMapping.created_at.accessor(
                                  item
                                )}
                              </td>
                            )}
                            <td>
                              {editingRowId === item.id ? (
                                <>
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => handleSave(item)}
                                    className="me-1"
                                  >
                                    सहेजें
                                  </Button>
                                  <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={handleCancel}
                                  >
                                    रद्द करें
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleEdit(item)}
                                    className="me-1 gov-edit-btn"
                                  >
                                    संपादित करें
                                  </Button>
                                  <Button
                                    className="gov-delete-btn"
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDelete(item)}
                                  >
                                    हटाएं
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>

                  {/* Pagination controls */}
                  {filteredItems.length > itemsPerPage && (
                    <div className="mt-3">
                      <div className="small-fonts mb-3 text-center">
                        {translations.page} {currentPage} {translations.of}{" "}
                        {totalPages}
                      </div>
                      <Pagination className="d-flex justify-content-center">
                        <Pagination.Prev
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        />
                        {paginationItems}
                        <Pagination.Next
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </div>
          </Container>
          </Col>
        </Row>

       
      </Container>

      {/* Add custom styles for the grid layout */}
    
    </div>
  );
};

export default MainDashboard;
