import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaFileAlt, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaDownload, FaExternalLinkAlt, FaSearch } from "react-icons/fa";
import "./GetViewLibrary.css";

const API_BASE_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/library";

const getToken = () => localStorage.getItem("access_token") || localStorage.getItem("token");

const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getFileIcon = (fileUrl) => {
  if (!fileUrl) return <FaFileAlt />;
  const extension = fileUrl.split(".").pop().toLowerCase();
  if (extension === "pdf") return <FaFilePdf />;
  if (["jpg", "jpeg", "png", "webp"].includes(extension)) return <FaFileImage />;
  if (["doc", "docx"].includes(extension)) return <FaFileWord />;
  if (["xls", "xlsx", "csv"].includes(extension)) return <FaFileExcel />;
  return <FaFileAlt />;
};

const GetViewLibrary = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/documents/`, {
        headers: getHeaders(),
      });
      if (response.data.status) {
        setDocuments(response.data.data || []);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(err.response?.data?.message || "Failed to fetch documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter((doc) =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileUrl = (doc) => {
    if (!doc.file) return null;
    if (doc.file.startsWith("http")) return doc.file;
    return `https://mahadevaaya.com/govbillingsystem/backend/${doc.file}`;
  };

  return (
    <div className="gvl-container">
      <div className="gvl-header">
        <div>
          <h1>Library Documents</h1>
          <p>View and access all uploaded documents</p>
        </div>
      </div>

      <div className="gvl-search-wrapper">
        <FaSearch />
        <input
          type="text"
          placeholder="Search documents by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <div className="gvl-error">{error}</div>}

      {loading ? (
        <div className="gvl-loading">Loading documents...</div>
      ) : filteredDocuments.length === 0 ? (
        <div className="gvl-empty">
          <FaFileAlt />
          <h3>No Documents Found</h3>
          <p>Upload documents from the Library System to view them here.</p>
        </div>
      ) : (
        <div className="gvl-table-wrapper">
          <table className="gvl-table">
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Title</th>
                <th>Description</th>
                <th>File</th>
               
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc, index) => {
                const fileUrl = getFileUrl(doc);
                return (
                  <tr key={doc.id}>
                    <td>{index + 1}</td>
                    <td>{doc.title}</td>
                    <td>{doc.description || "-"}</td>
                    <td>
                      <div className="gvl-file-cell">
                        <span className="gvl-file-icon">{getFileIcon(doc.file)}</span>
                        <span className="gvl-file-name" title={doc.file}>
                          {doc.file ? doc.file.split("/").pop() : "-"}
                        </span>
                      </div>
                    </td>
                   
                  
                    <td>
                      {fileUrl && (
                        <div className="gvl-actions">
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gvl-action-btn view"
                            title="View / Download"
                          >
                            <FaExternalLinkAlt />
                          </a>
                          <a
                            href={fileUrl}
                            download
                            className="gvl-action-btn download"
                            title="Download"
                          >
                            <FaDownload />
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GetViewLibrary;
