import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFolder,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaFileAlt,
  FaPlus,
  FaUpload,
  FaEye,
  FaDownload,
  FaTrash,
  FaArrowLeft,
  FaSearch,
  FaTimes,
  FaEdit,
} from "react-icons/fa";

import "./LibrarySystem.css";


const API_BASE_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/library";

const MEDIA_BASE_URL = "https://mahadevaaya.com/govbillingsystem/backend";


const LibrarySystem = () => {

  // =====================================================
  // STATES
  // =====================================================

  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState(null);

  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [categoryLoading, setCategoryLoading] =
    useState(false);

  const [showCategoryModal, setShowCategoryModal] =
    useState(false);

  const [showUploadModal, setShowUploadModal] =
    useState(false);

  const [previewDocument, setPreviewDocument] =
    useState(null);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editingDocument, setEditingDocument] =
    useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    file: null,
  });

  const [searchTerm, setSearchTerm] =
    useState("");

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  const [documentForm, setDocumentForm] = useState({
    title: "",
    description: "",
    file: null,
  });


  // =====================================================
  // TOKEN
  // =====================================================

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token")
    );
  };


  // =====================================================
  // AXIOS CONFIG
  // =====================================================

  const getHeaders = () => {

    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
    };
  };


  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories = async () => {

    try {

      setCategoryLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/categories/`,
        {
          headers: getHeaders(),
        }
      );

      if (response.data.status) {

        const activeCategories = (response.data.data || []).filter((category) => category.is_active === true);

        setCategories(activeCategories);

      } else {

        setCategories([]);

      }

    } catch (error) {

      console.error(
        "Category fetch error:",
        error
      );

      alert(
        "Unable to load library categories."
      );

      setCategories([]);

    } finally {

      setCategoryLoading(false);

    }
  };


  // =====================================================
  // FETCH DOCUMENTS
  // =====================================================

  const fetchDocuments = async (categoryId) => {

    try {

      setLoading(true);

      const response = await axios.get(
        `${API_BASE_URL}/documents/?category=${categoryId}`,
        {
          headers: getHeaders(),
        }
      );

      if (response.data.status) {

        const activeDocs = (response.data.data || []).filter((doc) => doc.is_active === true).map((doc) => ({
          ...doc,
          file_url: doc.file ? `${MEDIA_BASE_URL}${doc.file}` : null,
        }));

        setDocuments(activeDocs);

      } else {

        setDocuments([]);

      }

    } catch (error) {

      console.error(
        "Document fetch error:",
        error
      );

      alert(
        "Unable to load documents."
      );

      setDocuments([]);

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchCategories();

  }, []);


  // =====================================================
  // OPEN CATEGORY
  // =====================================================

  const handleOpenCategory = (category) => {

    setSelectedCategory(category);

    if (category.documents && category.documents.length > 0) {

      const activeDocuments = category.documents.filter((doc) => doc.is_active === true).map((doc) => ({

        ...doc,

        file_url: doc.file ? `${MEDIA_BASE_URL}${doc.file}` : null,

      }));

      setDocuments(activeDocuments);

    } else {

      setDocuments([]);

    }

  };


  // =====================================================
  // BACK TO CATEGORIES
  // =====================================================

  const handleBack = () => {

    setSelectedCategory(null);

    setDocuments([]);

    setSearchTerm("");

  };


  // =====================================================
  // CATEGORY FORM
  // =====================================================

  const handleCategoryChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setCategoryForm({
      ...categoryForm,
      [name]: value,
    });
  };


  // =====================================================
  // CREATE CATEGORY
  // =====================================================

  const handleCreateCategory = async (e) => {

    e.preventDefault();

    if (!categoryForm.name.trim()) {

      alert("Category name is required.");

      return;

    }

    try {

      const response = await axios.post(
        `${API_BASE_URL}/categories/`,
        categoryForm,
        {
          headers: {
            ...getHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status) {

        alert(
          "Category created successfully."
        );

        setShowCategoryModal(false);

        setCategoryForm({
          name: "",
          description: "",
        });

        fetchCategories();

      }

    } catch (error) {

      console.error(
        "Category create error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to create category."
      );

    }
  };


  // =====================================================
  // DOCUMENT FORM
  // =====================================================

  const handleDocumentChange = (e) => {

    const {
      name,
      value,
      files
    } = e.target;

    if (name === "file") {

      setDocumentForm({
        ...documentForm,
        file: files[0],
      });

    } else {

      setDocumentForm({
        ...documentForm,
        [name]: value,
      });

    }
  };


  // =====================================================
  // UPLOAD DOCUMENT
  // =====================================================

  const handleUploadDocument = async (e) => {

    e.preventDefault();

    if (!documentForm.title.trim()) {

      alert("Document title is required.");

      return;

    }

    if (!documentForm.file) {

      alert("Please select a document.");

      return;

    }

    if (!selectedCategory) {

      alert("Please select a category.");

      return;

    }

    try {

      const formData = new FormData();

      formData.append(
        "category",
        selectedCategory.id
      );

      formData.append(
        "title",
        documentForm.title
      );

      formData.append(
        "description",
        documentForm.description
      );

      formData.append(
        "file",
        documentForm.file
      );

      formData.append(
        "is_active",
        "true"
      );


      const response = await axios.post(
        `${API_BASE_URL}/documents/`,
        formData,
        {
          headers: {
            ...getHeaders(),
            "Content-Type":
              "multipart/form-data",
          },
        }
      );


      if (response.data.status) {

        alert(
          "Document uploaded successfully."
        );

        setShowUploadModal(false);

        setDocumentForm({
          title: "",
          description: "",
          file: null,
        });

        fetchDocuments(
          selectedCategory.id
        );

        fetchCategories();

      }

    } catch (error) {

      console.error(
        "Document upload error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to upload document."
      );

    }
  };


  // =====================================================
  // DELETE DOCUMENT
  // =====================================================

  const handleDeleteDocument = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmDelete) {
      return;
    }

    try {

      const response = await axios.delete(
        `${API_BASE_URL}/documents/${id}/`,
        {
          headers: getHeaders(),
        }
      );

      if (response.data.status) {

        alert(
          "Document deleted successfully."
        );

        fetchDocuments(
          selectedCategory.id
        );

        fetchCategories();

      }

    } catch (error) {

      console.error(
        "Delete document error:",
        error
      );

      alert(
        "Unable to delete document."
      );

    }
  };


  // =====================================================
  // EDIT DOCUMENT
  // =====================================================

  const handleOpenEditModal = (document) => {

    setEditingDocument(document);

    setEditForm({
      title: document.title,
      description: document.description || "",
      file: null,
    });

    setShowEditModal(true);

  };


  const handleCloseEditModal = () => {

    setShowEditModal(false);

    setEditingDocument(null);

    setEditForm({
      title: "",
      description: "",
      file: null,
    });

  };


  const handleEditChange = (e) => {

    const {
      name,
      value,
      files
    } = e.target;

    if (name === "file") {

      setEditForm({
        ...editForm,
        file: files[0],
      });

    } else {

      setEditForm({
        ...editForm,
        [name]: value,
      });

    }
  };


  const handleUpdateDocument = async (e) => {

    e.preventDefault();

    if (!editForm.title.trim()) {

      alert("Document title is required.");

      return;

    }

    if (!editingDocument) {

      return;

    }

    try {

      const formData = new FormData();

      formData.append(
        "title",
        editForm.title
      );

      formData.append(
        "description",
        editForm.description
      );

      if (editForm.file) {

        formData.append(
          "file",
          editForm.file
        );

      }

      formData.append(
        "is_active",
        "true"
      );

      const response = await axios.put(
        `${API_BASE_URL}/documents/${editingDocument.id}/`,
        formData,
        {
          headers: {
            ...getHeaders(),
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      if (response.data.status) {

        alert(
          "Document updated successfully."
        );

        handleCloseEditModal();

        if (selectedCategory) {

          fetchDocuments(
            selectedCategory.id
          );

        }

        fetchCategories();

      }

    } catch (error) {

      console.error(
        "Document update error:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to update document."
      );

    }
  };


  // =====================================================
  // FILE ICON
  // =====================================================

  const getFileIcon = (fileUrl) => {

    if (!fileUrl) {
      return <FaFileAlt />;
    }

    const extension =
      fileUrl
        .split(".")
        .pop()
        .toLowerCase();

    if (extension === "pdf") {

      return <FaFilePdf />;

    }

    if (
      ["jpg", "jpeg", "png", "webp"].includes(
        extension
      )
    ) {

      return <FaFileImage />;

    }

    if (
      ["doc", "docx"].includes(
        extension
      )
    ) {

      return <FaFileWord />;

    }

    if (
      ["xls", "xlsx", "csv"].includes(
        extension
      )
    ) {

      return <FaFileExcel />;

    }

    return <FaFileAlt />;
  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };


  // =====================================================
  // FILTER CATEGORIES
  // =====================================================

  const filteredCategories =
    categories.filter((category) =>
      category.name
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );


  // =====================================================
  // FILTER DOCUMENTS
  // =====================================================

  const filteredDocuments =
    documents.filter((document) =>
      document.title
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="library-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="library-header">

        <div className="library-header-left">

          {selectedCategory && (

            <button
              className="library-back-btn"
              onClick={handleBack}
            >
              <FaArrowLeft />
            </button>

          )}

          <div>

            <h1>

              {selectedCategory
                ? selectedCategory.name
                : "Document Library"}

            </h1>

            <p>

              {selectedCategory
                ? "Manage documents in this category"
                : "Centralized document management system"}

            </p>

          </div>

        </div>


        {!selectedCategory && (

          <button
            className="library-primary-btn"
            onClick={() =>
              setShowCategoryModal(true)
            }
          >

            <FaPlus />

            Add Category

          </button>

        )}

        {selectedCategory && (

          <button
            className="library-primary-btn"
            onClick={() =>
              setShowUploadModal(true)
            }
          >

            <FaUpload />

            Upload Document

          </button>

        )}

      </div>


      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="library-search-wrapper">

        <FaSearch />

        <input
          type="text"
          placeholder={
            selectedCategory
              ? "Search documents..."
              : "Search categories..."
          }
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

      </div>


      {/* =================================================
          CATEGORY VIEW
      ================================================= */}

      {!selectedCategory && (

        <div>

          {categoryLoading ? (

            <div className="library-loading">
              Loading categories...
            </div>

          ) : filteredCategories.length === 0 ? (

            <div className="library-empty">

              <FaFolder />

              <h3>
                No Categories Found
              </h3>

              <p>
                Create your first library category.
              </p>

            </div>

          ) : (

            <div className="library-category-grid">

              {filteredCategories.map(
                (category) => (

                  <div
                    className="library-category-card"
                    key={category.id}
                    onClick={() =>
                      handleOpenCategory(
                        category
                      )
                    }
                  >

                    <div className="library-folder-icon">

                      <FaFolder />

                    </div>


                    <div className="library-category-content">

                      <h3>
                        {category.name}
                      </h3>

                      <p>

                        {category.description ||
                          "No description available"}

                      </p>

                    </div>


                    <div className="library-category-footer">

                      <span>

                        {category.document_count || 0}

                        {" "}

                        {category.document_count === 1
                          ? "Document"
                          : "Documents"}

                      </span>

                      <span>
                        {formatDate(
                          category.created_at
                        )}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      )}


      {/* =================================================
          DOCUMENT VIEW
      ================================================= */}

      {selectedCategory && (

        <div>

          {loading ? (

            <div className="library-loading">
              Loading documents...
            </div>

          ) : filteredDocuments.length === 0 ? (

            <div className="library-empty">

              <FaFileAlt />

              <h3>
                No Documents Found
              </h3>

              <p>
                Upload a document to this category.
              </p>

              <button
                className="library-primary-btn"
                onClick={() =>
                  setShowUploadModal(true)
                }
              >

                <FaUpload />

                Upload Document

              </button>

            </div>

          ) : (

            <div className="library-document-list">

              {filteredDocuments.map(
                (document) => (

                  <div
                    className="library-document-card"
                    key={document.id}
                  >

                    <div className="library-document-icon">

                      {getFileIcon(
                        document.file_url
                      )}

                    </div>


                    <div className="library-document-info">

                      <h3>
                        {document.title}
                      </h3>

                      <p>

                        {document.description ||
                          "No description available"}

                      </p>

                      <div className="library-document-meta">

                        <span>
                          Uploaded by:{" "}
                          {document.uploaded_by_name ||
                            "Admin"}
                        </span>

                        <span>
                          {formatDate(
                            document.created_at
                          )}
                        </span>

                      </div>

                    </div>


                    <div className="library-document-actions">

                      <button
                        className="library-icon-btn view"
                        title="View"
                        onClick={() =>
                          setPreviewDocument(
                            document
                          )
                        }
                      >
                        <FaEye />
                      </button>


                      <button
                        className="library-icon-btn edit"
                        title="Edit"
                        onClick={() =>
                          handleOpenEditModal(
                            document
                          )
                        }
                      >
                        <FaEdit />
                      </button>


                      <a
                        className="library-icon-btn download"
                        title="Download"
                        href={
                          document.file_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaDownload />
                      </a>


                      <button
                        className="library-icon-btn delete"
                        title="Delete"
                        onClick={() =>
                          handleDeleteDocument(
                            document.id
                          )
                        }
                      >
                        <FaTrash />
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      )}


      {/* =================================================
          CATEGORY MODAL
      ================================================= */}

      {showCategoryModal && (

        <div className="library-modal-overlay">

          <div className="library-modal">

            <div className="library-modal-header">

              <h2>
                Add New Category
              </h2>

              <button
                onClick={() =>
                  setShowCategoryModal(false)
                }
              >
                <FaTimes />
              </button>

            </div>


            <form
              onSubmit={
                handleCreateCategory
              }
            >

              <div className="library-form-group">

                <label>
                  Category Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter category name"
                  value={
                    categoryForm.name
                  }
                  onChange={
                    handleCategoryChange
                  }
                />

              </div>


              <div className="library-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Enter category description"
                  rows="4"
                  value={
                    categoryForm.description
                  }
                  onChange={
                    handleCategoryChange
                  }
                />

              </div>


              <div className="library-modal-footer">

                <button
                  type="button"
                  className="library-cancel-btn"
                  onClick={() =>
                    setShowCategoryModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="library-primary-btn"
                >
                  <FaPlus />
                  Create Category
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          UPLOAD MODAL
      ================================================= */}

      {showUploadModal && (

        <div className="library-modal-overlay">

          <div className="library-modal">

            <div className="library-modal-header">

              <div>

                <h2>
                  Upload Document
                </h2>

                <p>
                  Category:{" "}
                  <strong>
                    {selectedCategory?.name}
                  </strong>
                </p>

              </div>

              <button
                onClick={() =>
                  setShowUploadModal(false)
                }
              >
                <FaTimes />
              </button>

            </div>


            <form
              onSubmit={
                handleUploadDocument
              }
            >

              <div className="library-form-group">

                <label>
                  Document Title
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter document title"
                  value={
                    documentForm.title
                  }
                  onChange={
                    handleDocumentChange
                  }
                />

              </div>


              <div className="library-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Enter document description"
                  rows="3"
                  value={
                    documentForm.description
                  }
                  onChange={
                    handleDocumentChange
                  }
                />

              </div>


              <div className="library-form-group">

                <label>
                  Select Document
                  <span>*</span>
                </label>

                <div className="library-file-upload">

                  <FaUpload />

                  <input
                    type="file"
                    name="file"
                    accept=".pdf,.png,.jpeg,.jpg,.doc,.docx"
                    onChange={
                      handleDocumentChange
                    }
                  />

                  {documentForm.file && (

                    <p>
                      Selected:{" "}
                      <strong>
                        {documentForm.file.name}
                      </strong>
                    </p>

                  )}

                </div>

              </div>


              <div className="library-modal-footer">

                <button
                  type="button"
                  className="library-cancel-btn"
                  onClick={() =>
                    setShowUploadModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="library-primary-btn"
                >

                  <FaUpload />

                  Upload Document

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          EDIT MODAL
      ================================================= */}

      {showEditModal && editingDocument && (

        <div className="library-modal-overlay">

          <div className="library-modal">

            <div className="library-modal-header">

              <div>

                <h2>
                  Edit Document
                </h2>

                <p>
                  Category:{" "}
                  <strong>
                    {selectedCategory?.name}
                  </strong>
                </p>

              </div>

              <button
                onClick={
                  handleCloseEditModal
                }
              >
                <FaTimes />
              </button>

            </div>


            <form
              onSubmit={
                handleUpdateDocument
              }
            >

              <div className="library-form-group">

                <label>
                  Document Title
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter document title"
                  value={
                    editForm.title
                  }
                  onChange={
                    handleEditChange
                  }
                />

              </div>


              <div className="library-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Enter document description"
                  rows="3"
                  value={
                    editForm.description
                  }
                  onChange={
                    handleEditChange
                  }
                />

              </div>


              <div className="library-form-group">

                <label>
                  Replace Document
                </label>

                <div className="library-file-upload">

                  <FaUpload />

                  <input
                    type="file"
                    name="file"
                    accept=".pdf,.png,.jpeg,.jpg,.doc,.docx"
                    onChange={
                      handleEditChange
                    }
                  />

                  {editForm.file && (

                    <p>
                      Selected:{" "}
                      <strong>
                        {editForm.file.name}
                      </strong>
                    </p>

                  )}

                </div>

              </div>


              <div className="library-modal-footer">

                <button
                  type="button"
                  className="library-cancel-btn"
                  onClick={
                    handleCloseEditModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="library-primary-btn"
                >

                  <FaEdit />

                  Update Document

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          DOCUMENT PREVIEW
      ================================================= */}

      {previewDocument && (

        <div className="library-modal-overlay">

          <div className="library-preview-modal">

            <div className="library-modal-header">

              <div>

                <h2>
                  {previewDocument.title}
                </h2>

                <p>
                  {previewDocument.description}
                </p>

              </div>

              <button
                onClick={() =>
                  setPreviewDocument(null)
                }
              >
                <FaTimes />
              </button>

            </div>


            <div className="library-preview-content">

              {previewDocument.file_url
                ?.toLowerCase()
                .endsWith(".pdf") ? (

                <iframe
                  src={
                    previewDocument.file_url
                  }
                  title={
                    previewDocument.title
                  }
                  className="library-pdf-viewer"
                />

              ) : [".jpg", ".jpeg", ".png", ".webp"].some((ext) =>
                previewDocument.file_url?.toLowerCase().endsWith(ext)
              ) ? (

                <img
                  src={
                    previewDocument.file_url
                  }
                  alt={
                    previewDocument.title
                  }
                  className="library-image-preview"
                />

              ) : (

                <div className="library-preview-other">

                  <div className="library-preview-icon">

                    {getFileIcon(
                      previewDocument.file_url
                    )}

                  </div>

                  <h3>
                    Preview not available
                  </h3>

                  <p>
                    This file type cannot be previewed
                    directly.
                  </p>

                  <a
                    href={
                      previewDocument.file_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="library-primary-btn"
                  >

                    <FaDownload />

                    Open / Download File

                  </a>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </div>

  );
};


export default LibrarySystem;