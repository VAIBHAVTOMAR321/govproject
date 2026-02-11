import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Table,
  OverlayTrigger,
  Tooltip,
  Spinner,
  Pagination,
  Modal,
  Dropdown,
  FormCheck,
} from "react-bootstrap";
import { FaFileExcel, FaFilePdf, FaTimes, FaSync } from "react-icons/fa";
import { RiFilePdfLine, RiFileExcelLine, RiEyeLine, RiDeleteBinLine } from "react-icons/ri";
import axios from "axios";
import * as XLSX from "xlsx";
import html2pdf from "html2pdf.js";
import Select from "react-select";
import "../../assets/css/registration.css";

import DashBoardHeader from "./DashBoardHeader";
import LeftNav from "./LeftNav";

// API URLs
const NURSERY_PHYSICAL_API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/nursery-physical/";
const CENTERS_API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/centers/";

// Hindi translations for form
const translations = {
  pageTitle: "नर्सरी भौतिक प्रविष्टि",
  centerName: "केंद्र का नाम",
  nurseryName: "नर्सरी का नाम",
  plantType: "पौधे का प्रकार",
  plantCount: "पौधों की संख्या",
  areaInHectares: "क्षेत्रफल (हेक्टेयर)",
  irrigationSource: "सिंचाई का स्रोत",
  status: "स्थिति",
  remarks: "टिप्पणी",
  entryDate: "प्रविष्टि तिथि",
  submitButton: "जमा करें",
  submitting: "जमा कर रहे हैं...",
  successMessage: "नर्सरी भौतिक डेटा सफलतापूर्वक जोड़ा गया!",
  bulkUpload: "बल्क अपलोड (Excel)",
  uploadFile: "फाइल चुनें",
  uploadButton: "अपलोड करें",
  required: "यह फ़ील्ड आवश्यक है",
  selectOption: "चुनें",
  genericError: "प्रस्तुत करते समय एक त्रुटि हुई। कृपया बाद में पुन: प्रयास करें।",
  showing: "दिखा रहे हैं",
  to: "से",
  of: "का",
  entries: "प्रविष्टियां",
  page: "पृष्ठ",
  itemsPerPage: "प्रति पृष्ठ आइटम",
};

// Table columns
const tableColumns = [
  { key: "sno", label: "क्र.सं." },
  { key: "center_name", label: "केंद्र का नाम" },
  { key: "nursery_name", label: "नर्सरी का नाम" },
  { key: "plant_type", label: "पौधे का प्रकार" },
  { key: "plant_count", label: "पौधों की संख्या" },
  { key: "area_in_hectares", label: "क्षेत्रफल (हेक्टेयर)" },
  { key: "irrigation_source", label: "सिंचाई का स्रोत" },
  { key: "status", label: "स्थिति" },
  { key: "remarks", label: "टिप्पणी" },
  { key: "entry_date", label: "प्रविष्टि तिथि" },
];

// Plant type options
const plantTypeOptions = [
  "फलदार पौधे",
  "सब्जी के पौधे",
  "औषधीय पौधे",
  "वृक्ष पौधे",
  "फूलों के पौधे",
  "अन्य",
];

// Irrigation source options
const irrigationSourceOptions = [
  "नहर",
  "नलकूप",
  "कुआं",
  "तालाब",
  "बारिश",
  "अन्य",
];

// Status options
const statusOptions = [
  "सक्रिय",
  "निष्क्रिय",
  "रखरखाव में",
  "बंद",
];

const NurseryPhysicalEntry = () => {
  // State for form data
  const [formData, setFormData] = useState({
    center_name: "",
    nursery_name: "",
    plant_type: "",
    plant_count: "",
    area_in_hectares: "",
    irrigation_source: "",
    status: "सक्रिय",
    remarks: "",
    entry_date: new Date().toISOString().split("T")[0],
  });

  // State for centers
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State for table data
  const [tableData, setTableData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for column selection
  const [selectedColumns, setSelectedColumns] = useState(
    tableColumns.map((col) => col.key)
  );

  // Fetch centers on component mount
  useEffect(() => {
    fetchCenters();
    fetchTableData();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await axios.get(CENTERS_API_URL);
      if (response.data && response.data.data) {
        setCenters(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching centers:", err);
    }
  };

  const fetchTableData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(NURSERY_PHYSICAL_API_URL);
      if (response.data && response.data.data) {
        setTableData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching table data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(NURSERY_PHYSICAL_API_URL, formData);
      if (response.data && response.data.success) {
        setSuccess(translations.successMessage);
        setFormData({
          center_name: "",
          nursery_name: "",
          plant_type: "",
          plant_count: "",
          area_in_hectares: "",
          irrigation_source: "",
          status: "सक्रिय",
          remarks: "",
          entry_date: new Date().toISOString().split("T")[0],
        });
        fetchTableData();
      } else {
        setError(response.data?.message || translations.genericError);
      }
    } catch (err) {
      setError(translations.genericError);
      console.error("Error submitting form:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("क्या आप इस रिकॉर्ड को हटाना चाहते हैं?")) return;

    try {
      const response = await axios.delete(`${NURSERY_PHYSICAL_API_URL}${id}/`);
      if (response.data && response.data.success) {
        fetchTableData();
      }
    } catch (err) {
      console.error("Error deleting record:", err);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Column selection component
  const ColumnSelection = () => {
    const handleColumnToggle = (columnKey) => {
      if (selectedColumns.includes(columnKey)) {
        setSelectedColumns(selectedColumns.filter((col) => col !== columnKey));
      } else {
        setSelectedColumns([...selectedColumns, columnKey]);
      }
    };

    const handleSelectAll = () => {
      setSelectedColumns(tableColumns.map((col) => col.key));
    };

    const handleDeselectAll = () => {
      setSelectedColumns(["sno"]);
    };

    return (
      <div className="column-selection-dropdown">
        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" size="sm">
            Columns
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleSelectAll}>Select All</Dropdown.Item>
            <Dropdown.Item onClick={handleDeselectAll}>Deselect All</Dropdown.Item>
            <Dropdown.Divider />
            {tableColumns.map((col) => (
              <Dropdown.Item key={col.key} onClick={() => handleColumnToggle(col.key)}>
                <FormCheck
                  type="checkbox"
                  checked={selectedColumns.includes(col.key)}
                  onChange={() => {}}
                  label={col.label}
                />
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  };

  return (
    <>
      <DashBoardHeader />
      <Container fluid>
        <Row>
          <Col lg={2} className="p-0">
            <LeftNav />
          </Col>
          <Col lg={10} className="p-3">
            <div className="registration-container">
              <h2 className="mb-4">{translations.pageTitle}</h2>

              {/* Success/Error Messages */}
              {success && (
                <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
                  {success}
                </Alert>
              )}
              {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  {error}
                </Alert>
              )}

              {/* Entry Form */}
              <div className="form-container mb-4 p-3 border rounded bg-light">
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col lg={4} md={6} sm={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>{translations.centerName} *</Form.Label>
                        <Form.Select
                          name="center_name"
                          value={formData.center_name}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">{translations.selectOption}</option>
                          {centers.map((center) => (
                            <option key={center.id} value={center.center_name}>
                              {center.center_name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col lg={4} md={6} sm={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>{translations.nurseryName} *</Form.Label>
                        <Form.Control
                          type="text"
                          name="nursery_name"
                          value={formData.nursery_name}
                          onChange={handleInputChange}
                          placeholder="नर्सरी का नाम दर्ज करें"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col lg={4} md={6} sm={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>{translations.plantType} *</Form.Label>
                        <Form.Select
                          name="plant_type"
                          value={formData.plant_type}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">{translations.selectOption}</option>
                          {plantTypeOptions.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col lg={4} md={6} sm={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>{translations.plantCount} *</Form.Label>
                        <Form.Control
                          type="number"
                          name="plant_count"
                          value={formData.plant_count}
                          onChange={handleInputChange}
                          placeholder="पौधों की संख्या दर्ज करें"
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col lg={4} md={6} sm={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>{translations.areaInHectares}</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="area_in_hectares"
                          value={formData.area_in_hectares}
                          onChange={handleInputChange}
                          placeholder="क्षेत्रफल दर्ज करें"
                        />
                      </Form.Group>
                    </Col>

                    <Col lg={4} md={6} sm={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>{translations.irrigationSource}</Form.Label>
                        <Form.Select
                          name="irrigation_source"
                          value={formData.irrigation_source}
                          onChange={handleInputChange}
                        >
                          <option value="">{translations.selectOption}</option>
                          {irrigationSourceOptions.map((source) => (
                            <option key={source} value={source}>
                              {source}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col lg={4} md={6} sm={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>{translations.status}</Form.Label>
                        <Form.Select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col lg={4} md={6} sm={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>{translations.entryDate}</Form.Label>
                        <Form.Control
                          type="date"
                          name="entry_date"
                          value={formData.entry_date}
                          onChange={handleInputChange}
                        />
                      </Form.Group>
                    </Col>

                    <Col lg={4} md={6} sm={12} className="mb-3">
                      <Form.Group>
                        <Form.Label>{translations.remarks}</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={1}
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleInputChange}
                          placeholder="टिप्पणी (वैकल्पिक)"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? translations.submitting : translations.submitButton}
                    </Button>
                  </div>
                </Form>
              </div>

              {/* Data Table */}
              <div className="table-container p-3 border rounded bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>दर्ज किए गए रिकॉर्ड</h5>
                  <div className="d-flex gap-2">
                    <ColumnSelection />
                    <Button variant="outline-success" size="sm">
                      <RiFileExcelLine /> Excel
                    </Button>
                    <Button variant="outline-danger" size="sm">
                      <RiFilePdfLine /> PDF
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <Table striped bordered hover>
                        <thead className="table-dark">
                          <tr>
                            {tableColumns
                              .filter((col) => selectedColumns.includes(col.key))
                              .map((col) => (
                                <th key={col.key}>{col.label}</th>
                              ))}
                            <th>कार्रवाई</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                              <tr key={item.id || index}>
                                {tableColumns
                                  .filter((col) => selectedColumns.includes(col.key))
                                  .map((col) => (
                                    <td key={col.key}>
                                      {col.key === "sno"
                                        ? indexOfFirstItem + index + 1
                                        : item[col.key] || "-"}
                                    </td>
                                  ))}
                                <td>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    <RiDeleteBinLine />
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={selectedColumns.length + 1}
                                className="text-center"
                              >
                                कोई डेटा उपलब्ध नहीं
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <span>
                          {translations.showing} {indexOfFirstItem + 1} {translations.to}{" "}
                          {Math.min(indexOfLastItem, tableData.length)} {translations.of}{" "}
                          {tableData.length} {translations.entries}
                        </span>
                        <Pagination>
                          <Pagination.Prev
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          />
                          {[...Array(totalPages)].map((_, i) => (
                            <Pagination.Item
                              key={i + 1}
                              active={i + 1 === currentPage}
                              onClick={() => handlePageChange(i + 1)}
                            >
                              {i + 1}
                            </Pagination.Item>
                          ))}
                          <Pagination.Next
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default NurseryPhysicalEntry;
