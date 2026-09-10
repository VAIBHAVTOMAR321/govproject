import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaFileAlt, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel,
  FaDownload, FaExternalLinkAlt, FaSearch, FaTimes, FaEdit,
  FaTrash, FaPlus, FaUpload, FaLink, FaClipboardList
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "./GetViewLibrary.css";

const LIBRARY_API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/library";
const CENTER_LINKS_API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/center-links";
const DETAILS_API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/center-link-details-bycenter";
const MEDIA_BASE_URL = "https://mahadevaaya.com/govbillingsystem/backend";

const getToken = () => localStorage.getItem("access_token") || localStorage.getItem("token");
const getHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/*
 * AuthContext stores the logged-in center like:
 *
 * {
 *   user_id: "CENT-001",
 *   role: "center",
 *   username: "कोटद्वार",
 *   loginType: "demand"
 * }
 *
 * Therefore, for the Center page the center name is taken
 * directly from user.username.
 */
const getCenterNameFromUser = (user) => {
  if (!user) return "";

  // Your AuthContext stores the center login as:
  // { user_id: "CENT-001", role: "center", username: "कोटद्वार", loginType: "demand" }
  // Therefore username is the exact center name used by the API.
  if (user.username !== null && user.username !== undefined) {
    const username = String(user.username).trim();

    if (username !== "") {
      return username;
    }
  }

  // Fallbacks in case another center login response is used later.
  const values = [
    user.center_name,
    user.centerName,
    user.centre_name,
    user.centreName,
    typeof user.center === "string" ? user.center : user.center?.name,
    user.center?.center_name,
    user.center?.centerName,
    typeof user.centre === "string" ? user.centre : user.centre?.name,
    user.centre?.center_name,
    user.centre?.centerName,
    user.profile?.center_name,
    user.profile?.centerName,
    user.profile?.centre_name,
    user.profile?.centreName,
    typeof user.profile?.center === "string"
      ? user.profile.center
      : user.profile?.center?.name,
    typeof user.profile?.centre === "string"
      ? user.profile.centre
      : user.profile?.centre?.name,
    user.data?.center_name,
    user.data?.centerName,
    user.data?.centre_name,
    user.data?.centreName,
    typeof user.data?.center === "string"
      ? user.data.center
      : user.data?.center?.name,
    typeof user.data?.centre === "string"
      ? user.data.centre
      : user.data?.centre?.name,
  ];

  const found = values.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  );

  return found ? String(found).trim() : "";
};

const getArray = (response) => {
  const d = response?.data;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  return [];
};

const getError = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  error?.response?.data?.error ||
  fallback;

const getFileUrl = (file) => {
  if (!file) return null;
  const value = String(file);
  return /^https?:\/\//i.test(value)
    ? value
    : `${MEDIA_BASE_URL}/${value.replace(/^\/+/, "")}`;
};

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
};

const getFileIcon = (file) => {
  if (!file) return <FaFileAlt />;
  const ext = String(file).split("?")[0].split(".").pop().toLowerCase();
  if (ext === "pdf") return <FaFilePdf />;
  if (["jpg","jpeg","png","webp","gif"].includes(ext)) return <FaFileImage />;
  if (["doc","docx"].includes(ext)) return <FaFileWord />;
  if (["xls","xlsx","csv"].includes(ext)) return <FaFileExcel />;
  return <FaFileAlt />;
};

const GetViewLibrary = () => {
  const { user } = useAuth();
  const centerName = useMemo(() => getCenterNameFromUser(user), [user]);

  const [activeTab, setActiveTab] = useState("documents");

  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");

  const [centerLinks, setCenterLinks] = useState([]);
  const [details, setDetails] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");
  const [requestSearch, setRequestSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    center_link: "",
    center_name: "",
    img: null,
    remark: ""
  });

  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    setDocumentsError("");
    try {
      const response = await axios.get(`${LIBRARY_API_URL}/documents/`, { headers: getHeaders() });
      setDocuments(getArray(response));
    } catch (error) {
      console.error(error);
      setDocumentsError(getError(error, "Failed to fetch documents"));
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  /*
   * Fetch ADMIN REQUESTS separately from CENTER RESPONSES.
   *
   * IMPORTANT:
   * The center-links API returns:
   * {
   *   success: true,
   *   data: [
   *     {
   *       id: 2,
   *       center_names: ["कोटद्वार", ...],
   *       link: "...",
   *       description: "..."
   *     }
   *   ]
   * }
   *
   * If the details API fails, we MUST NOT clear centerLinks.
   * Otherwise an error in the second API makes the Admin Request
   * list disappear even though the first API succeeded.
   */
  const fetchRequests = async () => {
    if (!centerName) {
      setCenterLinks([]);
      setDetails([]);
      setRequestsError("Logged-in center name is not available in AuthContext.");
      return;
    }

    setRequestsLoading(true);
    setRequestsError("");

    // 1. GET requests sent by Admin to this logged-in center.
    try {
      const requestResponse = await axios.get(
        `${CENTER_LINKS_API_URL}/?center_name=${encodeURIComponent(centerName)}`,
        {
          headers: getHeaders(),
        }
      );

      console.log("CENTER-LINKS API:", requestResponse.data);

      const requestList = Array.isArray(requestResponse?.data?.data)
        ? requestResponse.data.data
        : [];

      setCenterLinks(requestList);
    } catch (error) {
      console.error("Center-links API error:", error);
      setCenterLinks([]);
      setRequestsError(
        getError(error, "Failed to fetch admin requests.")
      );
    }

    // 2. GET responses already submitted by this center.
    // This is intentionally separate so a details API error
    // cannot remove the Admin requests fetched above.
    try {
      const detailResponse = await axios.get(
        `${DETAILS_API_URL}/?center_name=${encodeURIComponent(centerName)}`,
        {
          headers: getHeaders(),
        }
      );

      console.log("CENTER-LINK-DETAILS API:", detailResponse.data);

      const detailList = Array.isArray(detailResponse?.data?.details)
        ? detailResponse.data.details
        : [];

      setDetails(detailList);
    } catch (error) {
      console.error("Center-link-details API error:", error);
      setDetails([]);

      // Only show this error if the Admin request API did not
      // already produce an error.
      setRequestsError((currentError) =>
        currentError ||
        getError(error, "Unable to fetch submitted center responses.")
      );
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);
  useEffect(() => {
    if (activeTab === "requests") fetchRequests();
  }, [activeTab, centerName]);

  const openAdd = (request) => {
    if (!request?.id) {
      alert("Admin request ID is not available.");
      return;
    }
    setEditingDetail(null);
    setForm({
      center_link: String(request.id),
      center_name: centerName,
      img: null,
      remark: ""
    });
    setShowModal(true);
  };

  const openEdit = (detail) => {
    if (!detail?.id) return;
    const linkId = typeof detail.center_link === "object"
      ? detail.center_link?.id
      : detail.center_link;
    setEditingDetail(detail);
    setForm({
      center_link: linkId ? String(linkId) : "",
      center_name: centerName,
      img: null,
      remark: detail.remark || ""
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingDetail(null);
    setForm({ center_link: "", center_name: centerName || "", img: null, remark: "" });
  };

  const changeForm = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({ ...prev, [name]: name === "img" ? (files?.[0] || null) : value }));
  };

  const saveRequirement = async (e) => {
    e.preventDefault();

    if (!centerName) {
      alert("Center name is not available.");
      return;
    }
    if (!form.center_link) {
      alert("Admin request ID is required.");
      return;
    }
    if (!form.remark.trim()) {
      alert("Remark is required.");
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append("center_link", String(form.center_link));
      data.append("center_name", centerName);
      data.append("remark", form.remark.trim());
      if (form.img) data.append("img", form.img);

      const response = editingDetail?.id
        ? await axios.put(`${DETAILS_API_URL}/${editingDetail.id}/`, data, {
            headers: { ...getHeaders(), "Content-Type": "multipart/form-data" }
          })
        : await axios.post(`${DETAILS_API_URL}/`, data, {
            headers: { ...getHeaders(), "Content-Type": "multipart/form-data" }
          });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(response?.data?.message || "Unable to save requirement.");
      }

      alert(editingDetail ? "Requirement updated successfully." : "Requirement submitted successfully.");
      closeModal();
      await fetchRequests();
    } catch (error) {
      console.error(error);
      alert(getError(error, "Unable to save requirement."));
    } finally {
      setSaving(false);
    }
  };

  const deleteRequirement = async (detail) => {
    if (!detail?.id) return;
    if (!window.confirm("Are you sure you want to delete this submitted requirement?")) return;

    try {
      await axios.delete(`${DETAILS_API_URL}/${detail.id}/`, { headers: getHeaders() });
      alert("Requirement deleted successfully.");
      await fetchRequests();
    } catch (error) {
      console.error(error);
      alert(getError(error, "Unable to delete requirement."));
    }
  };

  const filteredDocuments = documents.filter(doc =>
    String(doc?.title || "").toLowerCase().includes(documentSearch.toLowerCase())
  );

  const filteredRequests = centerLinks.filter(request => {
    const q = requestSearch.toLowerCase();
    const names = Array.isArray(request?.center_names)
      ? request.center_names.join(" ")
      : String(request?.center_names || "");
    return (
      String(request?.description || "").toLowerCase().includes(q) ||
      String(request?.link || "").toLowerCase().includes(q) ||
      names.toLowerCase().includes(q)
    );
  });

  const getDetailsForRequest = (requestId) =>
    details.filter(detail => {
      const id = typeof detail?.center_link === "object"
        ? detail.center_link?.id
        : detail?.center_link;
      return String(id) === String(requestId);
    });

  return (
    <div className="gvl-container">
      <div className="gvl-header">
        <div>
          <h1>{activeTab === "documents" ? "Library Documents" : "Admin Requests"}</h1>
          <p>
            {activeTab === "documents"
              ? "View and access all uploaded documents"
              : centerName
                ? `Requests sent by Admin for ${centerName}`
                : "Requests sent by Admin"}
          </p>
        </div>
        {activeTab === "requests" && centerName && (
          <div className="gvl-center-badge">
            <span>Center</span><strong>{centerName}</strong>
          </div>
        )}
      </div>

      <div className="gvl-tabs">
        <button className={`gvl-tab ${activeTab === "documents" ? "active" : ""}`} onClick={() => setActiveTab("documents")}>
          <FaFileAlt /> Library Documents
        </button>
        <button className={`gvl-tab ${activeTab === "requests" ? "active" : ""}`} onClick={() => setActiveTab("requests")}>
          <FaClipboardList /> Admin Requests
        </button>
      </div>

      {activeTab === "documents" && (
        <>
          <div className="gvl-search-wrapper">
            <FaSearch />
            <input placeholder="Search documents by title..." value={documentSearch} onChange={e => setDocumentSearch(e.target.value)} />
          </div>
          {documentsError && <div className="gvl-error">{documentsError}</div>}
          {documentsLoading ? <div className="gvl-loading">Loading documents...</div> :
            filteredDocuments.length === 0 ? (
              <div className="gvl-empty"><FaFileAlt /><h3>No Documents Found</h3><p>Upload documents from the Library System to view them here.</p></div>
            ) : (
              <div className="gvl-table-wrapper">
                <table className="gvl-table">
                  <thead><tr><th>S.No.</th><th>Title</th><th>Description</th><th>File</th><th>Action</th></tr></thead>
                  <tbody>
                    {filteredDocuments.map((doc, index) => {
                      const raw = doc?.file || doc?.file_url || "";
                      const url = getFileUrl(raw);
                      return (
                        <tr key={doc.id || index}>
                          <td>{index + 1}</td>
                          <td><strong>{doc?.title || "-"}</strong></td>
                          <td>{doc?.description || "-"}</td>
                          <td><div className="gvl-file-cell"><span className="gvl-file-icon">{getFileIcon(raw)}</span><span className="gvl-file-name">{raw ? String(raw).split("/").pop() : "-"}</span></div></td>
                          <td>{url && <div className="gvl-actions">
                            <a href={url} target="_blank" rel="noopener noreferrer" className="gvl-action-btn view" title="View / Download"><FaExternalLinkAlt /></a>
                            <a href={url} download className="gvl-action-btn download" title="Download"><FaDownload /></a>
                          </div>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </>
      )}

      {activeTab === "requests" && (
        !centerName ? <div className="gvl-error">Center name could not be found in AuthContext.</div> :
        <>
          <div className="gvl-search-wrapper">
            <FaSearch />
            <input placeholder="Search admin requests..." value={requestSearch} onChange={e => setRequestSearch(e.target.value)} />
          </div>
          {requestsError && <div className="gvl-error">{requestsError}</div>}
          {requestsLoading ? <div className="gvl-loading">Loading admin requests...</div> :
            filteredRequests.length === 0 ? (
              <div className="gvl-empty"><FaClipboardList /><h3>No Admin Requests Found</h3><p>No request has been sent to <strong>{centerName}</strong>.</p></div>
            ) : (
              <div className="gvl-request-list">
                {filteredRequests.map((request, index) => {
                  const submitted = getDetailsForRequest(request.id);
                  return (
                    <div className="gvl-request-card" key={request.id || index}>
                      <div className="gvl-request-card-header">
                        <div className="gvl-request-number">{index + 1}</div>
                        <div className="gvl-request-title">
                          <h3>Admin Request #{request.id}</h3>
                          <p>{request.description || "Admin has sent a request to your center."}</p>
                        </div>
                        <div className={`gvl-request-status ${submitted.length > 0 ? "responded" : ""}`}>
                          {submitted.length > 0 ? "Responded" : "Pending"}
                        </div>
                      </div>

                      <div className="gvl-request-body">
                        <div className="gvl-request-info-grid">
                          <div className="gvl-info-item"><span>Center</span><strong>{centerName}</strong></div>
                          <div className="gvl-info-item"><span>Admin Link</span>
                            {request.link ? <a href={request.link} target="_blank" rel="noopener noreferrer" className="gvl-request-link"><FaLink /> Open Link</a> : <strong>-</strong>}
                          </div>
                          <div className="gvl-info-item"><span>Assigned Centers</span><strong>{Array.isArray(request.center_names) ? request.center_names.join(", ") : request.center_names || "-"}</strong></div>
                        </div>

                        <div className="gvl-submission-section">
                          <div className="gvl-section-heading">
                            <div><h4>Center Requirement / Response</h4><p>Submit your requirement against this admin request.</p></div>
                            {submitted.length === 0 && (
                              <button
                                className="gvl-submit-btn"
                                onClick={() => openAdd(request)}
                              >
                                <FaPlus /> Submit Requirement
                              </button>
                            )}
                          </div>

                          {submitted.length === 0 ? <div className="gvl-no-submission">No response submitted yet.</div> :
                            <div className="gvl-submission-table-wrapper">
                              <table className="gvl-submission-table">
                                <thead><tr><th>S.No.</th><th>Center Name</th><th>Remark</th><th>Image</th><th>Action</th></tr></thead>
                                <tbody>
                                  {submitted.map((detail, i) => {
                                    const img = getFileUrl(detail?.img);
                                    return (
                                      <tr key={detail.id || i}>
                                        <td>{i + 1}</td>
                                        <td><strong>{detail?.center_name || centerName}</strong></td>
                                        <td>{detail?.remark || "-"}</td>
                                        <td>{img ? <a href={img} target="_blank" rel="noopener noreferrer" className="gvl-image-link"><FaFileImage /> View Image</a> : <span className="gvl-muted">No image</span>}</td>
                                        <td><div className="gvl-actions">
                                          <button className="gvl-action-btn edit" onClick={() => openEdit(detail)} title="Edit"><FaEdit /></button>
                                          <button className="gvl-action-btn delete" onClick={() => deleteRequirement(detail)} title="Delete"><FaTrash /></button>
                                        </div></td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </>
      )}

      {showModal && (
        <div className="gvl-modal-overlay">
          <div className="gvl-modal">
            <div className="gvl-modal-header">
              <div><h2>{editingDetail ? "Edit Requirement" : "Submit Requirement"}</h2><p>Respond to the requirement sent by Admin.</p></div>
              <button className="gvl-modal-close" onClick={closeModal} disabled={saving}><FaTimes /></button>
            </div>

            <form className="gvl-form" onSubmit={saveRequirement}>
              <div className="gvl-form-group">
                <label>Admin Request ID <span>*</span></label>
                <input type="text" value={form.center_link} disabled readOnly />
                <small>This is the ID of the request sent by Admin.</small>
              </div>

              <div className="gvl-form-group">
                <label>Center Name <span>*</span></label>
                <input type="text" value={centerName} disabled readOnly />
                <small>Center name is automatically taken from AuthContext and cannot be changed.</small>
              </div>

              <div className="gvl-form-group">
                <label>Image</label>
                <div className="gvl-file-input-wrapper"><FaUpload /><input type="file" name="img" accept="image/*" onChange={changeForm} /></div>
                {form.img && <div className="gvl-selected-file">Selected: <strong>{form.img.name}</strong></div>}
              </div>

              <div className="gvl-form-group">
                <label>Remark <span>*</span></label>
                <textarea name="remark" rows="5" value={form.remark} onChange={changeForm} placeholder="Enter your requirement / response..." disabled={saving} />
              </div>

              <div className="gvl-modal-footer">
                <button type="button" className="gvl-cancel-btn" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="gvl-submit-btn" disabled={saving}>
                  {saving ? "Saving..." : editingDetail ? <><FaEdit /> Update Requirement</> : <><FaPlus /> Submit Requirement</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetViewLibrary;
