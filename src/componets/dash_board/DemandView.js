import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Spinner, Badge, Modal, FormCheck } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCenter } from '../all_login/CenterContext';
import { useAuth } from '../../context/AuthContext';
import DashBoardHeader from './DashBoardHeader';
import { RiFileExcelLine, RiFilePdfLine, RiAddLine, RiDeleteBinLine, RiEyeLine } from 'react-icons/ri';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

const DemandView = () => {
  const navigate = useNavigate();
  const { centerData, clearCenter } = useCenter();
  const { logout } = useAuth();
  const [demandData, setDemandData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [tablesForExport, setTablesForExport] = useState({
    pdf: [],
    excel: [],
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState('pdf');
  const [tableName, setTableName] = useState('');
  const [currentTableForExport, setCurrentTableForExport] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewType, setPreviewType] = useState('pdf');
 
  
  // Fetch demand data
  useEffect(() => {
    fetchDemandData();
  }, []);
 
  const fetchDemandData = async () => {
    setIsLoading(true);
    setError('');
   
    try {
      const response = await fetch('https://mahadevaaya.com/govbillingsystem/backend/api/demand-generation/');
     
      if (!response.ok) {
        throw new Error('Failed to fetch demand data');
      }
     
      const data = await response.json();
      setDemandData(data);
      setFilteredData(data);
     
      // Extract unique centers for filter
      const uniqueCenters = [...new Set(data.map(item => item.center_name))];
      setCenters(uniqueCenters);
    } catch (err) {
      console.error('Error fetching demand data:', err);
      setError('डेटा लाने में त्रुटि। कृपया बाद में पुन: प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleCenterFilter = (centerName) => {
    setSelectedCenter(centerName);
    if (centerName === '') {
      setFilteredData(demandData);
    } else {
      setFilteredData(demandData.filter(item => item.center_name === centerName));
    }
  };
 
  const handleLogout = () => {
    clearCenter();
    logout();
    navigate('/', { replace: true });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const addTableToExport = (type) => {
    const formattedData = filteredData.map((demand) => ({
      'केंद्र नाम': demand.center_name,
      'तिथि': formatDate(demand.created_at),
      'उत्पाद और मात्रा': demand.demand_list
        .map((item) => `${item[0]}: ${item[1]}`)
        .join(', '),
    }));

    const currentTable = {
      heading: `डिमांड व्यू - ${centerData.centerName}`,
      data: formattedData,
      columns: ['केंद्र नाम', 'तिथि', 'उत्पाद और मात्रा'],
    };
    setCurrentTableForExport(currentTable);
    setExportType(type);
    setShowExportModal(true);
  };

  const confirmAddTable = () => {
    if (!currentTableForExport) return;

    const newTable = {
      id: Date.now(),
      name: tableName || `Table ${tablesForExport[exportType].length + 1}`,
      heading: currentTableForExport.heading,
      data: currentTableForExport.data,
      columns: currentTableForExport.columns,
      addedAt: new Date().toLocaleString(),
    };
    setTablesForExport((prev) => ({
      ...prev,
      [exportType]: [...prev[exportType], newTable],
    }));
    setShowExportModal(false);
    setTableName('');
    setCurrentTableForExport(null);
  };

  const removeTableFromExport = (type, tableId) => {
    setTablesForExport((prev) => ({
      ...prev,
      [type]: prev[type].filter((table) => table.id !== tableId),
    }));
  };

  const generatePDFPreview = () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '16px' }}>
          निर्यातित टेबल रिपोर्ट
        </h1>
        {tablesForExport.pdf.map((table, index) => (
          <div key={table.id} style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
            <h2 style={{ marginBottom: '10px', fontSize: '14px' }}>
              {index + 1}. {table.heading}
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#2980b9', color: 'white' }}>
                  <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', fontSize: '11px' }}>
                    S.No.
                  </th>
                  {table.columns.map((col) => (
                    <th key={col} style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', fontSize: '11px' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '10px' }}>
                      {rowIndex + 1}
                    </td>
                    {table.columns.map((col) => (
                      <td key={col} style={{ border: '1px solid #ddd', padding: '6px', fontSize: '10px' }}>
                        {row[col] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const generateExcelPreview = () => {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '16px' }}>
          Excel शीट्स पूर्वालोकन
        </h3>
        {tablesForExport.excel.map((table, index) => (
          <div key={table.id} style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', pageBreakInside: 'avoid' }}>
            <h4 style={{ marginBottom: '10px', color: '#2980b9', fontSize: '14px' }}>
              शीट {index + 1}: {table.name}
            </h4>
            <h5 style={{ marginBottom: '10px', fontSize: '13px' }}>
              {table.heading}
            </h5>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', fontWeight: 'bold', fontSize: '11px' }}>
                    S.No.
                  </th>
                  {table.columns.map((col) => (
                    <th key={col} style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'left', fontWeight: 'bold', fontSize: '11px' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td style={{ border: '1px solid #ddd', padding: '6px', fontSize: '10px' }}>
                      {rowIndex + 1}
                    </td>
                    {table.columns.map((col) => (
                      <td key={col} style={{ border: '1px solid #ddd', padding: '6px', fontSize: '10px' }}>
                        {row[col] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const generatePDF = () => {
    try {
      let htmlContent = `
        <div style="font-family: Arial, sans-serif; font-size: 10px; padding: 15px;">
          <h1 style="text-align: center; margin-bottom: 15px; font-size: 14px;">निर्यातित टेबल रिपोर्ट</h1>
      `;

      tablesForExport.pdf.forEach((table, index) => {
        htmlContent += `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h2 style="margin-top: 15px; margin-bottom: 8px; font-size: 12px;">${index + 1}. ${table.heading}</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px;">
              <thead>
                <tr style="background-color: #2980b9; color: white;">
                  <th style="border: 1px solid #ddd; padding: 5px; text-align: left; font-size: 9px;">S.No.</th>
                  ${table.columns.map((col) => `<th style="border: 1px solid #ddd; padding: 5px; text-align: left; font-size: 9px;">${col}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
        `;

        table.data.forEach((row, rowIndex) => {
          htmlContent += '<tr>';
          htmlContent += `<td style="border: 1px solid #ddd; padding: 5px; font-size: 8px;">${rowIndex + 1}</td>`;
          table.columns.forEach((col) => {
            htmlContent += `<td style="border: 1px solid #ddd; padding: 5px; font-size: 8px;">${row[col] || ''}</td>`;
          });
          htmlContent += '</tr>';
        });

        htmlContent += `
              </tbody>
            </table>
          </div>
        `;
      });

      htmlContent += '</div>';

      const options = {
        margin: [8, 8, 8, 8],
        filename: 'exported-tables.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 1.8,
          useCORS: true,
          letterRendering: true,
          logging: false,
          windowWidth: 1200,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'landscape',
          compress: true,
        },
      };

      html2pdf().set(options).from(htmlContent).save().catch((error) => {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF: ' + error.message);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const generateExcel = () => {
    const workbook = XLSX.utils.book_new();

    tablesForExport.excel.forEach((table, index) => {
      const tableDataArray = [
        [table.heading],
        [],
        ['S.No.', ...table.columns],
        ...table.data.map((row, rowIndex) => [
          rowIndex + 1,
          ...table.columns.map((col) => row[col] || ''),
        ]),
      ];

      const sheetName = table.name.substring(0, 31);
      const worksheet = XLSX.utils.aoa_to_sheet(tableDataArray);

      const colWidths = table.columns.map(() => ({ wch: 15 }));
      worksheet['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, 'exported-tables.xlsx');
  };
 
  const ExportSection = () => (
    <div className={`export-section mb-3 mt-2 p-3 border rounded bg-light`}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">
          <RiFilePdfLine /> निर्यात विकल्प
        </h6>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="danger"
            size="sm"
            onClick={() => addTableToExport('pdf')}
            className="d-flex align-items-center pdf-add-btn gap-1"
          >
            <RiFilePdfLine /> इस टेबल को PDF में जोड़ें
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => addTableToExport('excel')}
            className="d-flex align-items-center exel-add-btn gap-1"
          >
            <RiFileExcelLine /> इस टेबल को Excel में जोड़ें
          </Button>
        </div>
      </div>

      {(tablesForExport.pdf.length > 0 || tablesForExport.excel.length > 0) && (
        <div className="mt-3">
          <Row className="g-3">
            {tablesForExport.pdf.length > 0 && (
              <Col lg={tablesForExport.excel.length > 0 ? 6 : 12} md={12} sm={12}>
                <div className="selected-tables-card p-3 border rounded bg-white h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-danger small">
                      <RiFilePdfLine /> PDF ({tablesForExport.pdf.length})
                    </span>
                    <div className="d-flex gap-2">
                      <Button
                        className="pdf-add-btn"
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setPreviewType('pdf');
                          setShowPreviewModal(true);
                        }}
                      >
                        <RiEyeLine /> पूर्वावलोकन
                      </Button>
                      <Button
                        className="pdf-add-btn"
                        variant="outline-danger"
                        size="sm"
                        onClick={generatePDF}
                      >
                        डाउनलोड
                      </Button>
                    </div>
                  </div>

                  <div className="table-list">
                    {tablesForExport.pdf.map((table, idx) => (
                      <div key={table.id} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                        <span className="small text-truncate">
                          {idx + 1}. {table.name}
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => removeTableFromExport('pdf', table.id)}
                        >
                          <RiDeleteBinLine />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            )}

            {tablesForExport.excel.length > 0 && (
              <Col lg={tablesForExport.pdf.length > 0 ? 6 : 12} md={12} sm={12}>
                <div className="selected-tables-card p-3 border rounded bg-white h-100 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-success small">
                      <RiFileExcelLine /> Excel ({tablesForExport.excel.length})
                    </span>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-success"
                        className="pdf-add-btn"
                        size="sm"
                        onClick={() => {
                          setPreviewType('excel');
                          setShowPreviewModal(true);
                        }}
                      >
                        <RiEyeLine /> पूर्वावलोकन
                      </Button>
                      <Button
                        variant="outline-success"
                        className="pdf-add-btn"
                        size="sm"
                        onClick={generateExcel}
                      >
                        डाउनलोड
                      </Button>
                    </div>
                  </div>

                  <div className="table-list">
                    {tablesForExport.excel.map((table, idx) => (
                      <div key={table.id} className="d-flex justify-content-between align-items-center py-1 border-bottom">
                        <span className="small text-truncate">
                          {idx + 1}. {table.name}
                        </span>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger p-0"
                          onClick={() => removeTableFromExport('excel', table.id)}
                        >
                          <RiDeleteBinLine />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </div>
      )}
    </div>
  );

  const PreviewModal = () => (
    <Modal
      show={showPreviewModal}
      onHide={() => setShowPreviewModal(false)}
      size="xl"
      centered
    >
      <Modal.Header closeButton className="modal-header-style">
        <div>
          {previewType === 'pdf' ? 'PDF पूर्वावलोकन' : 'Excel पूर्वावलोकन'}
        </div>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflow: 'auto' }}>
        {previewType === 'pdf' ? generatePDFPreview() : generateExcelPreview()}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
          बंद करें
        </Button>
        <Button
          variant={previewType === 'pdf' ? 'danger' : 'success'}
          onClick={() => {
            setShowPreviewModal(false);
            previewType === 'pdf' ? generatePDF() : generateExcel();
          }}
        >
          डाउनलोड करें
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
    <DashBoardHeader />
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>डिमांड व्यू - {centerData.centerName}</h2>
            <Button variant="danger" onClick={handleLogout}>लॉगआउट</Button>
          </div>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">डिमांड रिकॉर्ड्स</h5>
              <Form.Group className="mb-0" controlId="centerFilter">
                <Form.Select
                  value={selectedCenter}
                  onChange={(e) => handleCenterFilter(e.target.value)}
                  style={{ width: '200px' }}
                >
                  <option value="">सभी केंद्र</option>
                  {centers.map((center, index) => (
                    <option key={index} value={center}>{center}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Card.Header>
            <Card.Body>
              <ExportSection />
              {isLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">लोड हो रहा है...</span>
                  </Spinner>
                </div>
              ) : (
                <>
                  {filteredData.length > 0 ? (
                    <Table striped bordered hover responsive size="sm">
                      <thead>
                        <tr>
                          
                          <th>केंद्र नाम</th>
                          <th>तिथि</th>
                          <th>उत्पाद और मात्रा</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((demand, index) => (
                          <tr key={demand.id}>
                            
                            <td>{demand.center_name}</td>
                            <td>{formatDate(demand.created_at)}</td>
                            <td>
                              <Table striped bordered hover responsive size="sm">
                                <thead>
                                  <tr>
                                    <th>उत्पाद</th>
                                    <th>मात्रा</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {demand.demand_list.map((item, itemIndex) => (
                                    <tr key={itemIndex}>
                                      <td>{item[0]}</td>
                                      <td>{item[1]}</td>
                                    </tr>
                                  ))}
                                  <tr>
                                    <td><strong>Total</strong></td>
                                    <td><strong>{demand.demand_list.reduce((total, item) => total + parseInt(item[1]), 0)}</strong></td>
                                  </tr>
                                </tbody>
                              </Table>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p>कोई डिमांड रिकॉर्ड नहीं मिला</p>
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>

    <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
      <Modal.Header closeButton className="modal-header-style">
        <div>
          {exportType === 'pdf' ? 'PDF में जोड़ें' : 'Excel में जोड़ें'}
        </div>
      </Modal.Header>
      <Modal.Body>
        <Form.Group>
          <Form.Label>टेबल का नाम</Form.Label>
          <Form.Control
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="टेबल का नाम दर्ज करें"
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setShowExportModal(false)}
          className="remove-btn"
        >
          रद्द करें
        </Button>
        <Button
          variant={exportType === 'pdf' ? 'danger' : 'success'}
          className="add-btn"
          onClick={confirmAddTable}
        >
          जोड़ें
        </Button>
      </Modal.Footer>
    </Modal>

    <PreviewModal />
    </>
  );
};

export default DemandView