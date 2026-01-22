import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Alert, Spinner, Badge, Modal, FormCheck, Dropdown } from 'react-bootstrap';
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
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [upniveshOptions, setUpniveshOptions] = useState([]);
  const [selectedUpnivesh, setSelectedUpnivesh] = useState([]);
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
      
      // Sort data: items with values come first, items with blank upnivesh name and ikai come last
      const sortedData = data.sort((a, b) => {
        // Check if demand_list has items with non-empty names
        const aHasValidItems = a.demand_list.some(item => item[0] && item[0].trim() !== '');
        const bHasValidItems = b.demand_list.some(item => item[0] && item[0].trim() !== '');
        
        if (aHasValidItems && !bHasValidItems) return -1;
        if (!aHasValidItems && bHasValidItems) return 1;
        return 0;
      });
      
      setDemandData(sortedData);
      setFilteredData(sortedData);
     
      // Extract unique centers for filter
      const uniqueCenters = [...new Set(data.map(item => item.center_name))];
      console.log('Unique centers:', uniqueCenters); // Debug log
      setCenters(uniqueCenters);
    } catch (err) {
      console.error('Error fetching demand data:', err);
      setError('डेटा लाने में त्रुटि। कृपया बाद में पुन: प्रयास करें।');
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleCenterFilter = (centerName, isChecked) => {
    if (isChecked) {
      // Add center to selected centers
      setSelectedCenters([...selectedCenters, centerName]);
    } else {
      // Remove center from selected centers
      setSelectedCenters(selectedCenters.filter(center => center !== centerName));
    }
  };
  
  // Apply filter when selected centers change
  useEffect(() => {
    // Compute available upnivesh options based on selected centers (or all if none selected)
    const relevant = selectedCenters.length === 0
      ? demandData
      : demandData.filter(item => selectedCenters.includes(item.center_name));

    const allUpnivesh = new Set();
    relevant.forEach(demand => {
      if (Array.isArray(demand.demand_list)) {
        demand.demand_list.forEach(item => {
          if (item && item[0]) allUpnivesh.add(item[0]);
        });
      }
    });
    setUpniveshOptions(Array.from(allUpnivesh));

    // Now filter the data to include only centers and upnivesh selection
    let filtered = relevant.map(d => ({ ...d }));

    if (selectedUpnivesh.length > 0) {
      filtered = filtered
        .map(d => ({
          ...d,
          demand_list: Array.isArray(d.demand_list)
            ? d.demand_list.filter(item => selectedUpnivesh.includes(item[0]))
            : []
        }))
        .filter(d => d.demand_list && d.demand_list.length > 0);
    }

    setFilteredData(filtered);
  }, [selectedCenters, selectedUpnivesh, demandData]);
 
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
      'उत्पाद और मात्रा': demand.demand_list
        .map((item) => {
          // Handle both old format [product, quantity] and new format [product, quantity, unit]
          if (item.length >= 3) {
            return `${item[0]}: ${item[1]} ${item[2]}`;
          } else {
            return `${item[0]}: ${item[1]}`;
          }
        })
        .join(', '),
    }));

    const currentTable = {
      heading: `डिमांड व्यू - ${centerData.centerName}`,
      data: formattedData,
      columns: ['केंद्र नाम', 'उत्पाद और मात्रा'],
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
                        <RiEyeLine /> पूर्वालोकन
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
                        <RiEyeLine /> पूर्वालोकन
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
          {previewType === 'pdf' ? 'PDF पूर्वालोकन' : 'Excel पूर्वालोकन'}
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

  const upnDropdownRef = useRef(null);
  const [upnDropdownOpen, setUpnDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutsideUpn = (event) => {
      if (upnDropdownRef.current && !upnDropdownRef.current.contains(event.target)) {
        setUpnDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideUpn);
    return () => document.removeEventListener('mousedown', handleClickOutsideUpn);
  }, []);

  const CenterFilterDropdown = () => (
    <div ref={dropdownRef} className="sabhi-chune position-relative d-flex">
      <Button 
         className="w-100 text-start d-flex justify-content-between align-items-center"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {selectedCenters.length === 0 ? 'सभी केंद्र' : `${selectedCenters.length} केंद्र चयनित`}
        <span>▼</span>
      </Button>
      {dropdownOpen && (
        <div className="position-absolute bg-black border rounded shadow-sm p-2 mt-1 w-100" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
          <Form.Check 
            type="checkbox" 
            label="सभी केंद्र" 
            checked={selectedCenters.length === 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedCenters([]);
              }
            }}
            className="mb-2"
          />
          {centers.length > 0 ? (
            centers.map((center, index) => (
              <Form.Check 
                key={index}
                type="checkbox" 
                label={center} 
                checked={selectedCenters.includes(center)}
                onChange={(e) => handleCenterFilter(center, e.target.checked)}
                className="mb-1"
              />
            ))
          ) : (
            <div className="text-muted text-center py-2">कोई केंद्र उपलब्ध नहीं</div>
          )}
        </div>
      )}
    </div>
  );

  const UpniveshFilterDropdown = () => (
    <div ref={upnDropdownRef} className="sabhi-chune position-relative ms-2">
      <Button
        className="w-100 text-start d-flex justify-content-between align-items-center"
        onClick={() => setUpnDropdownOpen(s => !s)}
      >
        {selectedUpnivesh.length === 0 ? 'सभी उप-निवेश' : `${selectedUpnivesh.length} चुने गए`}
        <span>▼</span>
      </Button>
      {upnDropdownOpen && (
        <div className="position-absolute bg-black border rounded shadow-sm p-2 mt-1 w-100" style={{ zIndex: 1000, maxHeight: '220px', overflowY: 'auto' }}>
          {upniveshOptions.length > 0 ? (
            upniveshOptions.map((u, idx) => (
              <Form.Check
                key={idx}
                type="checkbox"
                label={`${u}`}
                checked={selectedUpnivesh.includes(u)}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setSelectedUpnivesh(prev => isChecked ? [...prev, u] : prev.filter(x=>x!==u));
                }}
                className="mb-1 text-white"
              />
            ))
          ) : (
            <div className="text-muted text-center py-2">कोई उप-निवेश उपलब्ध नहीं</div>
          )}
          <div className="mt-2 d-flex justify-content-between">
            <Button size="sm" variant="outline-secondary" onClick={()=>setSelectedUpnivesh([])}>सभी हटाएं</Button>
            <Button size="sm" variant="outline-secondary" onClick={()=>setSelectedUpnivesh(upniveshOptions)}>सभी चुनें</Button>
          </div>
        </div>
      )}
    </div>
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
              <Form.Group className="mb-0" controlId="centerFilter" style={{ width: '420px', display: 'flex', gap: '8px' }}>
                <div style={{ width: '200px' }}><CenterFilterDropdown /></div>
                <div style={{ width: '200px' }}><UpniveshFilterDropdown /></div>
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
                          <th>उप-निवेश और मात्रा</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((demand, index) => (
                          <tr key={demand.id}>
                            <td>{demand.center_name}</td>
                            <td>
                              <Table striped bordered hover responsive size="sm">
                                <thead>
                                  <tr>
                                    <th>उप-निवेश</th>
                                    <th>मात्रा</th>
                                    <th>इकाई</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {demand.demand_list.map((item, itemIndex) => (
                                    <tr key={itemIndex}>
                                      <td>{item[0]}</td>
                                      <td>{item[1]}</td>
                                      <td>{item[2] || '-'}</td>
                                    </tr>
                                  ))}
                                  <tr>
                                    <td><strong>कुल</strong></td>
                                    <td><strong>{demand.demand_list.reduce((total, item) => total + parseInt(item[1]), 0)}</strong></td>
                                    <td>-</td>
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

export default DemandView;