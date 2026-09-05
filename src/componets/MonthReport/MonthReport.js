import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MonthReport.css";

const API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/month-reports/";

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const MonthReport = () => {
  const [reports, setReports] = useState([]);

  const [formData, setFormData] = useState({
    month: "",
    financial_year: "",
    month_report: null,
  });

  const [editingId, setEditingId] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // GET ALL MONTH REPORTS
  // GET /api/month-reports/
  // =====================================================
  const fetchMonthReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API_URL);

      console.log("Month Reports:", response.data);

      if (Array.isArray(response.data)) {
        setReports(response.data);
      } else if (Array.isArray(response.data.results)) {
        setReports(response.data.results);
      } else if (Array.isArray(response.data.data)) {
        setReports(response.data.data);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error("GET Error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Month reports fetch करने में समस्या हुई।"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthReports();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE FILE
  // =====================================================
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setFormData((prev) => ({
        ...prev,
        month_report: null,
      }));
      return;
    }

    if (file.type !== "application/pdf") {
      setError("केवल PDF file upload करें।");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("PDF file 10 MB से कम होनी चाहिए।");
      e.target.value = "";
      return;
    }

    setError("");

    setFormData((prev) => ({
      ...prev,
      month_report: file,
    }));
  };

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================
  const handleAdd = () => {
    setEditingId(null);

    setFormData({
      month: "",
      financial_year: "",
      month_report: null,
    });

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // GET /api/month-reports/{id}/
  // =====================================================
  const handleEdit = async (id) => {
    try {
      setError("");

      const response = await axios.get(`${API_URL}${id}/`);

      const report = response.data;

      setEditingId(id);

      setFormData({
        month: String(report.month || ""),
        financial_year: report.financial_year || "",
        month_report: null,
      });

      setShowModal(true);
    } catch (err) {
      console.error("Single GET Error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Report details fetch करने में समस्या हुई।"
      );
    }
  };

  // =====================================================
  // VALIDATION
  // =====================================================
  const validateForm = () => {
    if (!formData.month) {
      setError("Month select करना आवश्यक है।");
      return false;
    }

    if (!formData.financial_year.trim()) {
      setError("Financial Year डालना आवश्यक है।");
      return false;
    }

    return true;
  };

  // =====================================================
  // POST / PUT
  // =====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = new FormData();

      data.append("month", formData.month);
      data.append("financial_year", formData.financial_year);

      // File is optional
      if (formData.month_report) {
        data.append("month_report", formData.month_report);
      }

      // =================================================
      // UPDATE
      // PUT /api/month-reports/{id}/
      // =================================================
      if (editingId) {
        await axios.put(`${API_URL}${editingId}/`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setSuccess("MPR report successfully updated.");
      }

      // =================================================
      // CREATE
      // POST /api/month-reports/
      // =================================================
      else {
        await axios.post(API_URL, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setSuccess("MPR report successfully added.");
      }

      setShowModal(false);

      setFormData({
        month: "",
        financial_year: "",
        month_report: null,
      });

      setEditingId(null);

      await fetchMonthReports();
    } catch (err) {
      console.error("POST/PUT Error:", err);

      const backendErrors = err.response?.data?.errors;

      if (backendErrors) {
        setError(JSON.stringify(backendErrors));
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "MPR save करने में समस्या हुई।"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE
  // DELETE /api/month-reports/{id}/
  // =====================================================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "क्या आप इस MPR report को delete करना चाहते हैं?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await axios.delete(`${API_URL}${id}/`);

      setSuccess("MPR report successfully deleted.");

      await fetchMonthReports();
    } catch (err) {
      console.error("DELETE Error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "MPR delete करने में समस्या हुई।"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // MONTH NAME
  // =====================================================
  const getMonthName = (month) => {
    const found = months.find(
      (item) => item.value === String(month)
    );

    return found ? found.label : "-";
  };

  // =====================================================
  // FILE URL
  // =====================================================
  const getFileUrl = (report) => {
    return (
      report.month_report ||
      report.month_report_url ||
      report.file ||
      report.file_url ||
      null
    );
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================
  const closeModal = () => {
    if (loading) return;

    setShowModal(false);

    setEditingId(null);

    setFormData({
      month: "",
      financial_year: "",
      month_report: null,
    });

    setError("");
  };

  return (
    <div className="month-report-page">
      <div className="month-report-container">

        {/* ================= HEADER ================= */}

        <div className="month-report-header">
          <div>
            <h2>Monthly Progress Report</h2>
            <p>MPR Report Management</p>
          </div>

          <button
            className="mpr-add-btn"
            onClick={handleAdd}
          >
            + Add MPR
          </button>
        </div>

        {/* ================= SUCCESS ================= */}

        {success && (
          <div className="mpr-alert mpr-success">
            {success}

            <button
              onClick={() => setSuccess("")}
            >
              ×
            </button>
          </div>
        )}

        {/* ================= ERROR ================= */}

        {error && (
          <div className="mpr-alert mpr-error">
            {error}

            <button
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {/* ================= TABLE ================= */}

        <div className="mpr-table-card">

          <div className="mpr-table-header">
            <h3>MPR Reports</h3>

            <button
              className="mpr-refresh-btn"
              onClick={fetchMonthReports}
              disabled={loading}
            >
              ↻ Refresh
            </button>
          </div>

          {loading && reports.length === 0 ? (
            <div className="mpr-loading">
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="mpr-empty">
              <div className="mpr-empty-icon">
                📄
              </div>

              <h4>No MPR Reports Found</h4>

              <p>
                अभी तक कोई Monthly Progress Report उपलब्ध नहीं है।
              </p>

              <button
                className="mpr-empty-btn"
                onClick={handleAdd}
              >
                + Add MPR
              </button>
            </div>
          ) : (
            <div className="mpr-table-wrapper">

              <table className="mpr-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>Month</th>
                    <th>Financial Year</th>
                    <th>MPR Report</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {reports.map((report, index) => {

                    const fileUrl = getFileUrl(report);

                    return (
                      <tr key={report.id}>

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          <span className="mpr-month">
                            {getMonthName(report.month)}
                          </span>
                        </td>

                        <td>
                          {report.financial_year || "-"}
                        </td>

                        <td>

                          {fileUrl ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mpr-pdf-link"
                            >
                              📄 View PDF
                            </a>
                          ) : (
                            <span className="mpr-no-file">
                              No PDF
                            </span>
                          )}

                        </td>

                        <td>

                          <div className="mpr-actions">

                            <button
                              className="mpr-edit-btn"
                              onClick={() =>
                                handleEdit(report.id)
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="mpr-delete-btn"
                              onClick={() =>
                                handleDelete(report.id)
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

      {/* ================= MODAL ================= */}

      {showModal && (

        <div className="mpr-modal-overlay">

          <div className="mpr-modal">

            <div className="mpr-modal-header">

              <div>
                <h3>
                  {editingId
                    ? "Update MPR Report"
                    : "Add MPR Report"}
                </h3>

                <p>
                  MPR details enter करें
                </p>
              </div>

              <button
                className="mpr-close-btn"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="mpr-modal-body">

                {/* MONTH */}

                <div className="mpr-form-group">

                  <label>
                    Month <span>*</span>
                  </label>

                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Month
                    </option>

                    {months.map((month) => (
                      <option
                        key={month.value}
                        value={month.value}
                      >
                        {month.label}
                      </option>
                    ))}

                  </select>

                </div>

                {/* FINANCIAL YEAR */}

                <div className="mpr-form-group">

                  <label>
                    Financial Year <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="financial_year"
                    value={formData.financial_year}
                    onChange={handleChange}
                    placeholder="2026-27"
                  />

                </div>

                {/* PDF */}

                <div className="mpr-form-group">

                  <label>
                    MPR Report
                    <small> (Optional)</small>
                  </label>

                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                  />

                  <small className="mpr-help">
                    केवल PDF file upload करें। Maximum size 10 MB.
                  </small>

                </div>

              </div>

              <div className="mpr-modal-footer">

                <button
                  type="button"
                  className="mpr-cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="mpr-submit-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingId
                    ? "Update MPR"
                    : "Save MPR"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default MonthReport;