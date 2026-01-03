import React, { useState, useMemo, useEffect } from "react";
import { Modal, Row, Col, Card, Button, Table, Badge, Collapse, Container, Form } from "react-bootstrap";
import { FaTimes, FaChevronDown, FaChevronUp, FaBuilding, FaGavel, FaMapMarkerAlt, FaPuzzlePiece, FaPiggyBank, FaLayerGroup, FaTags, FaChartBar, FaEye, FaList, FaFileExcel, FaFilePdf, FaDownload, FaPrint } from "react-icons/fa";
import * as XLSX from 'xlsx';
import "../../assets/css/dashboard.css";
import "../../assets/css/table.css";

// Function to generate distinct colors for centers
const generateCenterColors = (count) => {
  const colors = [];
  const hueStep = 360 / count;
  
  for (let i = 0; i < count; i++) {
    const hue = i * hueStep;
    const saturation = 70;
    const lightness = 85;
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  
  return colors;
};

// Function to get contrasting text color
const getContrastColor = (bgColor) => {
  return "#333";
};

const TableDetailsModal = ({ show, onHide, tableData, centerName }) => {

  // Enhanced Export functions with comprehensive relational summaries
  // Export specific section data to Excel with detailed breakdown
  const exportSectionToExcel = (sectionType, breakdownData = null) => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Only export detailed breakdown data (vivran) if available
      if (breakdownData && breakdownData.length > 0) {
        const detailWs = XLSX.utils.json_to_sheet(breakdownData);
        XLSX.utils.book_append_sheet(wb, detailWs, "Detailed Breakdown");
      } else {
        // If no breakdown data, show message
        const emptyData = [{'Message': 'कोई विस्तृत विवरण उपलब्ध नहीं - कृपया कार्ड खोलें'}];
        const emptyWs = XLSX.utils.json_to_sheet(emptyData);
        XLSX.utils.book_append_sheet(wb, emptyWs, "Information");
      }
      
      // Export file
      const fileName = `${centerName || 'data'}_${sectionType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      console.log('Section Excel export successful:', fileName);
    } catch (error) {
      console.error('Error exporting section to Excel:', error);
      alert('सेक्शन एक्सेल निर्यात में त्रुटि हुई। कृपया फिर से प्रयास करें।');
    }
  };

  // Export specific section data to PDF
  const exportSectionToPDF = (sectionType, sectionData) => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      
      // Generate HTML content for the specific section
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${centerName} - ${sectionType} रिपोर्ट</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #2c3e50; text-align: center; }
            h2 { color: #3498db; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { text-align: center; margin-bottom: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #7f8c8d; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${centerName}</h1>
            <h2>${sectionType} रिपोर्ट</h2>
            <p>${new Date().toLocaleDateString('hi-IN')}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                ${Object.keys(sectionData[0] || {}).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${sectionData.map(item => `
                <tr>
                  ${Object.values(item).map(value => `<td>${value}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>रिपोर्ट तैयार की गई: ${new Date().toLocaleString('hi-IN')}</p>
            <p>कुल ${sectionData.length} रिकॉर्ड का विश्लेषण</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load and then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
      };
      
    } catch (error) {
      console.error('Error exporting section to PDF:', error);
      alert('सेक्शन पीडीएफ निर्यात में त्रुटि हुई। कृपया फिर से प्रयास करें।');
    }
  };

  // New function to open PDF view in a new tab
  const openPDFView = () => {
    try {
      // Create a new window for the PDF view
      const pdfViewWindow = window.open('', '_blank');
      
      // Generate comprehensive HTML content for PDF view
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${centerName} - PDF व्यू</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              line-height: 1.4;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 20px;
            }
            .center-name {
              font-size: 28px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 10px;
            }
            .date {
              color: #7f8c8d;
              font-size: 14px;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background-color: #007bff;
              color: white;
              border: none;
              padding: 10px 15px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              z-index: 1000;
            }
            .print-button:hover {
              background-color: #0056b3;
            }
            .executive-summary {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .summary-card {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              border-left: 4px solid #007bff;
            }
            .summary-number {
              font-size: 20px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 5px;
            }
            .summary-label {
              font-size: 11px;
              color: #7f8c8d;
              text-transform: uppercase;
            }
            .section {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              border-bottom: 2px solid #bdc3c7;
              padding-bottom: 8px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            }
            .section-title::before {
              content: '▶';
              margin-right: 10px;
              color: #3498db;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 10px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .data-table th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            .data-table td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              text-align: left;
            }
            .data-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .data-table tr:hover {
              background-color: #e3f2fd;
            }
            .highlight {
              background-color: #e8f5e8;
              font-weight: bold;
            }
            .total-row {
              background: linear-gradient(135deg, #ff7b7b 0%, #ff6b6b 100%) !important;
              color: white;
              font-weight: bold;
            }
            .financial-summary {
              background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
            }
            .financial-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              text-align: center;
            }
            .financial-item h3 {
              margin: 0;
              font-size: 24px;
            }
            .financial-item p {
              margin: 5px 0 0 0;
              font-size: 12px;
              opacity: 0.9;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
              border-top: 2px solid #bdc3c7;
              padding-top: 20px;
            }
            .scheme-location {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 5px;
              padding: 15px;
              margin: 15px 0;
            }
            .component-breakdown {
              background: #d1ecf1;
              border: 1px solid #bee5eb;
              border-radius: 5px;
              padding: 15px;
              margin: 15px 0;
            }
            .page-break {
              page-break-before: always;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .section { page-break-inside: avoid; }
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">
            <i class="fa fa-print"></i> Print
          </button>
          
          <div class="header">
            <div class="center-name">${centerName}</div>
            <div class="date">संपूर्ण विवरण रिपोर्ट - ${new Date().toLocaleDateString('hi-IN')}</div>
          </div>
          
          <!-- Executive Summary -->
          <div class="executive-summary">
            <h2 style="margin-top: 0; text-align: center;">कार्यकारी सारांश</h2>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-number">${tableData.length}</div>
                <div class="summary-label">कुल रिकॉर्ड</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${uniqueVidhanSabhas.length}</div>
                <div class="summary-label">विधानसभा</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${uniqueVikasKhands.length}</div>
                <div class="summary-label">विकासखंड</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${uniqueSchemes.length}</div>
                <div class="summary-label">योजनाएं</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${uniqueComponents.length}</div>
                <div class="summary-label">घटक</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${uniqueSources.length}</div>
                <div class="summary-label">स्रोत</div>
              </div>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="financial-summary">
            <h2 style="margin-top: 0; text-align: center;">वित्तीय सारांश</h2>
            <div class="financial-grid">
              <div class="financial-item">
                <h3>${formatCurrency(totals.totalAllocated)}</h3>
                <p>कुल आवंटित राशि</p>
              </div>
              <div class="financial-item">
                <h3>${formatCurrency(totals.totalUpdated)}</h3>
                <p>कुल वितरण राशि</p>
              </div>
              <div class="financial-item">
                <h3>${formatCurrency(totals.totalRemaining)}</h3>
                <p>कुल शेष राशि</p>
              </div>
            </div>
          </div>

          <!-- Main Data Table -->
          <div class="section">
            <div class="section-title">मुख्य डेटा तालिका</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>विधानसभा</th>
                  <th>विकासखंड</th>
                  <th>योजना</th>
                  <th>घटक</th>
                  <th>आवंटित मात्रा</th>
                  <th>दर</th>
                  <th>आवंटित राशि</th>
                  <th>वितरण मात्रा</th>
                  <th>वितरण राशि</th>
                  <th>शेष राशि</th>
                </tr>
              </thead>
              <tbody>
                ${tableData.map(item => {
                  const allocated = parseFloat(item.allocated_quantity || 0) * parseFloat(item.rate || 0);
                  const sold = parseFloat(item.updated_quantity || 0) * parseFloat(item.rate || 0);
                  const remaining = allocated - sold;
                  return `
                    <tr>
                      <td>${item.vidhan_sabha_name || ''}</td>
                      <td>${item.vikas_khand_name || ''}</td>
                      <td>${item.scheme_name || ''}</td>
                      <td>${item.component || ''}</td>
                      <td>${parseFloat(item.allocated_quantity || 0).toFixed(2)}</td>
                      <td>${formatCurrency(parseFloat(item.rate || 0))}</td>
                      <td>${formatCurrency(allocated)}</td>
                      <td>${parseFloat(item.updated_quantity || 0).toFixed(2)}</td>
                      <td>${formatCurrency(sold)}</td>
                      <td class="highlight">${formatCurrency(remaining)}</td>
                    </tr>
                  `;
                }).join('')}
                <tr class="total-row">
                  <td colspan="6"><strong>कुल योग</strong></td>
                  <td><strong>${formatCurrency(totals.totalAllocated)}</strong></td>
                  <td></td>
                  <td><strong>${formatCurrency(totals.totalUpdated)}</strong></td>
                  <td class="highlight"><strong>${formatCurrency(totals.totalRemaining)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p><strong>रिपोर्ट तैयार की गई:</strong> ${new Date().toLocaleString('hi-IN')}</p>
            <p><strong>कुल ${tableData.length} रिकॉर्ड का विश्लेषण</strong></p>
            <p>यह रिपोर्ट ${centerName} के लिए तैयार की गई है</p>
          </div>
        </body>
        </html>
      `;
      
      pdfViewWindow.document.write(htmlContent);
      pdfViewWindow.document.close();
      
    } catch (error) {
      console.error('Error opening PDF view:', error);
      alert('PDF व्यू खोलने में त्रुटि हुई। कृपया फिर से प्रयास करें।');
    }
  };

  // PDF view for Places section
  const openPlacesPDFView = () => {
    try {
      // Create a new window for the PDF view
      const pdfViewWindow = window.open('', '_blank');
      
      // Generate HTML content for the Places section
      const placesData = uniqueVikasKhands.map(location => {
        const locationItems = tableData.filter(item => item.vikas_khand_name === location);
        const allocated = locationItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
        const sold = locationItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
        const remaining = allocated - sold;
        const vidhanSabha = locationItems[0]?.vidhan_sabha_name || '';
        
        return {
          'विकासखंड': location,
          'विधानसभा': vidhanSabha,
          'रिकॉर्ड संख्या': locationItems.length,
          'आवंटित राशि': formatCurrency(allocated),
          'वितरण राशि': formatCurrency(sold),
          'शेष राशि': formatCurrency(remaining),
          'वितरण प्रतिशत': allocated > 0 ? ((sold / allocated) * 100).toFixed(2) + '%' : '0%'
        };
      });
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${centerName} - विकासखंड विवरण</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              line-height: 1.4;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 20px;
            }
            .center-name {
              font-size: 28px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 10px;
            }
            .date {
              color: #7f8c8d;
              font-size: 14px;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background-color: #007bff;
              color: white;
              border: none;
              padding: 10px 15px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              z-index: 1000;
            }
            .print-button:hover {
              background-color: #0056b3;
            }
            .section {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              border-bottom: 2px solid #bdc3c7;
              padding-bottom: 8px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            }
            .section-title::before {
              content: '▶';
              margin-right: 10px;
              color: #3498db;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 10px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .data-table th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            .data-table td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              text-align: left;
            }
            .data-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .data-table tr:hover {
              background-color: #e3f2fd;
            }
            .highlight {
              background-color: #e8f5e8;
              font-weight: bold;
            }
            .total-row {
              background: linear-gradient(135deg, #ff7b7b 0%, #ff6b6b 100%) !important;
              color: white;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
              border-top: 2px solid #bdc3c7;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .section { page-break-inside: avoid; }
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">
            <i class="fa fa-print"></i> Print
          </button>
          
          <div class="header">
            <div class="center-name">${centerName}</div>
            <div class="date">विकासखंड विवरण रिपोर्ट - ${new Date().toLocaleDateString('hi-IN')}</div>
          </div>
          
          <div class="section">
            <div class="section-title">विकासखंड विवरण</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>विकासखंड</th>
                  <th>विधानसभा</th>
                  <th>रिकॉर्ड संख्या</th>
                  <th>आवंटित राशि</th>
                  <th>वितरण राशि</th>
                  <th>शेष राशि</th>
                  <th>वितरण प्रतिशत</th>
                </tr>
              </thead>
              <tbody>
                ${placesData.map(item => `
                  <tr>
                    <td>${item['विकासखंड']}</td>
                    <td>${item['विधानसभा']}</td>
                    <td>${item['रिकॉर्ड संख्या']}</td>
                    <td>${item['आवंटित राशि']}</td>
                    <td>${item['वितरण राशि']}</td>
                    <td class="highlight">${item['शेष राशि']}</td>
                    <td>${item['वितरण प्रतिशत']}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p><strong>रिपोर्ट तैयार की गई:</strong> ${new Date().toLocaleString('hi-IN')}</p>
            <p><strong>कुल ${placesData.length} विकासखंड का विश्लेषण</strong></p>
            <p>यह रिपोर्ट ${centerName} के लिए तैयार की गई है</p>
          </div>
        </body>
        </html>
      `;
      
      pdfViewWindow.document.write(htmlContent);
      pdfViewWindow.document.close();
      
    } catch (error) {
      console.error('Error opening Places PDF view:', error);
      alert('विकासखंड PDF व्यू खोलने में त्रुटि हुई। कृपया फिर से प्रयास करें।');
    }
  };

  // PDF view for Allocation section
  const openAllocationPDFView = () => {
    try {
      // Create a new window for the PDF view
      const pdfViewWindow = window.open('', '_blank');
      
      // Generate HTML content for the Allocation section
      const allocationData = [];
      
      // Add scheme-wise allocation data
      uniqueSchemes.forEach(scheme => {
        const schemeItems = tableData.filter(item => item.scheme_name === scheme);
        const allocated = schemeItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
        const sold = schemeItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
        const remaining = allocated - sold;
        
        allocationData.push({
          'प्रकार': 'योजना',
          'नाम': scheme,
          'रिकॉर्ड संख्या': schemeItems.length,
          'आवंटित राशि': formatCurrency(allocated),
          'वितरण राशि': formatCurrency(sold),
          'शेष राशि': formatCurrency(remaining),
          'वितरण प्रतिशत': allocated > 0 ? ((sold / allocated) * 100).toFixed(2) + '%' : '0%'
        });
      });
      
      // Add component-wise allocation data
      uniqueComponents.forEach(component => {
        const componentItems = tableData.filter(item => item.component === component);
        const allocated = componentItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
        const sold = componentItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
        const remaining = allocated - sold;
        
        allocationData.push({
          'प्रकार': 'घटक',
          'नाम': component,
          'रिकॉर्ड संख्या': componentItems.length,
          'आवंटित राशि': formatCurrency(allocated),
          'वितरण राशि': formatCurrency(sold),
          'शेष राशि': formatCurrency(remaining),
          'वितरण प्रतिशत': allocated > 0 ? ((sold / allocated) * 100).toFixed(2) + '%' : '0%'
        });
      });
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${centerName} - आवंटन विवरण</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              line-height: 1.4;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 20px;
            }
            .center-name {
              font-size: 28px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 10px;
            }
            .date {
              color: #7f8c8d;
              font-size: 14px;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background-color: #007bff;
              color: white;
              border: none;
              padding: 10px 15px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              z-index: 1000;
            }
            .print-button:hover {
              background-color: #0056b3;
            }
            .section {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              border-bottom: 2px solid #bdc3c7;
              padding-bottom: 8px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            }
            .section-title::before {
              content: '▶';
              margin-right: 10px;
              color: #3498db;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 10px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .data-table th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            .data-table td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              text-align: left;
            }
            .data-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .data-table tr:hover {
              background-color: #e3f2fd;
            }
            .highlight {
              background-color: #e8f5e8;
              font-weight: bold;
            }
            .total-row {
              background: linear-gradient(135deg, #ff7b7b 0%, #ff6b6b 100%) !important;
              color: white;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
              border-top: 2px solid #bdc3c7;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .section { page-break-inside: avoid; }
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">
            <i class="fa fa-print"></i> Print
          </button>
          
          <div class="header">
            <div class="center-name">${centerName}</div>
            <div class="date">आवंटन विवरण रिपोर्ट - ${new Date().toLocaleDateString('hi-IN')}</div>
          </div>
          
          <div class="section">
            <div class="section-title">आवंटन विवरण</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>प्रकार</th>
                  <th>नाम</th>
                  <th>रिकॉर्ड संख्या</th>
                  <th>आवंटित राशि</th>
                  <th>वितरण राशि</th>
                  <th>शेष राशि</th>
                  <th>वितरण प्रतिशत</th>
                </tr>
              </thead>
              <tbody>
                ${allocationData.map(item => `
                  <tr>
                    <td>${item['प्रकार']}</td>
                    <td>${item['नाम']}</td>
                    <td>${item['रिकॉर्ड संख्या']}</td>
                    <td>${item['आवंटित राशि']}</td>
                    <td>${item['वितरण राशि']}</td>
                    <td class="highlight">${item['शेष राशि']}</td>
                    <td>${item['वितरण प्रतिशत']}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p><strong>रिपोर्ट तैयार की गई:</strong> ${new Date().toLocaleString('hi-IN')}</p>
            <p><strong>कुल ${allocationData.length} आइटम का विश्लेषण</strong></p>
            <p>यह रिपोर्ट ${centerName} के लिए तैयार की गई है</p>
          </div>
        </body>
        </html>
      `;
      
      pdfViewWindow.document.write(htmlContent);
      pdfViewWindow.document.close();
      
    } catch (error) {
      console.error('Error opening Allocation PDF view:', error);
      alert('आवंटन PDF व्यू खोलने में त्रुटि हुई। कृपया फिर से प्रयास करें।');
    }
  };

  // PDF view for Sales section
  const openSalesPDFView = () => {
    try {
      // Create a new window for the PDF view
      const pdfViewWindow = window.open('', '_blank');
      
      // Generate HTML content for the Sales section
      const salesData = [];
      
      // Add scheme-wise sales data
      uniqueSchemes.forEach(scheme => {
        const schemeItems = tableData.filter(item => item.scheme_name === scheme);
        const allocated = schemeItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
        const sold = schemeItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
        const remaining = allocated - sold;
        
        salesData.push({
          'प्रकार': 'योजना',
          'नाम': scheme,
          'रिकॉर्ड संख्या': schemeItems.length,
          'आवंटित राशि': formatCurrency(allocated),
          'वितरण राशि': formatCurrency(sold),
          'शेष राशि': formatCurrency(remaining),
          'वितरण प्रतिशत': allocated > 0 ? ((sold / allocated) * 100).toFixed(2) + '%' : '0%'
        });
      });
      
      // Add component-wise sales data
      uniqueComponents.forEach(component => {
        const componentItems = tableData.filter(item => item.component === component);
        const allocated = componentItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
        const sold = componentItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
        const remaining = allocated - sold;
        
        salesData.push({
          'प्रकार': 'घटक',
          'नाम': component,
          'रिकॉर्ड संख्या': componentItems.length,
          'आवंटित राशि': formatCurrency(allocated),
          'वितरण राशि': formatCurrency(sold),
          'शेष राशि': formatCurrency(remaining),
          'वितरण प्रतिशत': allocated > 0 ? ((sold / allocated) * 100).toFixed(2) + '%' : '0%'
        });
      });
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${centerName} - वितरण विवरण</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              line-height: 1.4;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 20px;
            }
            .center-name {
              font-size: 28px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 10px;
            }
            .date {
              color: #7f8c8d;
              font-size: 14px;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background-color: #007bff;
              color: white;
              border: none;
              padding: 10px 15px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              z-index: 1000;
            }
            .print-button:hover {
              background-color: #0056b3;
            }
            .section {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              border-bottom: 2px solid #bdc3c7;
              padding-bottom: 8px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            }
            .section-title::before {
              content: '▶';
              margin-right: 10px;
              color: #3498db;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 10px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .data-table th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            .data-table td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              text-align: left;
            }
            .data-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .data-table tr:hover {
              background-color: #e3f2fd;
            }
            .highlight {
              background-color: #e8f5e8;
              font-weight: bold;
            }
            .total-row {
              background: linear-gradient(135deg, #ff7b7b 0%, #ff6b6b 100%) !important;
              color: white;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
              border-top: 2px solid #bdc3c7;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .section { page-break-inside: avoid; }
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">
            <i class="fa fa-print"></i> Print
          </button>
          
          <div class="header">
            <div class="center-name">${centerName}</div>
            <div class="date">वितरण विवरण रिपोर्ट - ${new Date().toLocaleDateString('hi-IN')}</div>
          </div>
          
          <div class="section">
            <div class="section-title">वितरण विवरण</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>प्रकार</th>
                  <th>नाम</th>
                  <th>रिकॉर्ड संख्या</th>
                  <th>आवंटित राशि</th>
                  <th>वितरण राशि</th>
                  <th>शेष राशि</th>
                  <th>वितरण प्रतिशत</th>
                </tr>
              </thead>
              <tbody>
                ${salesData.map(item => `
                  <tr>
                    <td>${item['प्रकार']}</td>
                    <td>${item['नाम']}</td>
                    <td>${item['रिकॉर्ड संख्या']}</td>
                    <td>${item['आवंटित राशि']}</td>
                    <td>${item['वितरण राशि']}</td>
                    <td class="highlight">${item['शेष राशि']}</td>
                    <td>${item['वितरण प्रतिशत']}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p><strong>रिपोर्ट तैयार की गई:</strong> ${new Date().toLocaleString('hi-IN')}</p>
            <p><strong>कुल ${salesData.length} आइटम का विश्लेषण</strong></p>
            <p>यह रिपोर्ट ${centerName} के लिए तैयार की गई है</p>
          </div>
        </body>
        </html>
      `;
      
      pdfViewWindow.document.write(htmlContent);
      pdfViewWindow.document.close();
      
    } catch (error) {
      console.error('Error opening Sales PDF view:', error);
      alert('वितरण PDF व्यू खोलने में त्रुटि हुई। कृपया फिर से प्रयास करें।');
    }
  };

  // PDF view for Remaining section
  const openRemainingPDFView = () => {
    try {
      // Create a new window for the PDF view
      const pdfViewWindow = window.open('', '_blank');
      
      // Generate HTML content for the Remaining section
      const remainingData = [];
      
      // Add scheme-wise remaining data
      uniqueSchemes.forEach(scheme => {
        const schemeItems = tableData.filter(item => item.scheme_name === scheme);
        const allocated = schemeItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
        const sold = schemeItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
        const remaining = allocated - sold;
        
        remainingData.push({
          'प्रकार': 'योजना',
          'नाम': scheme,
          'रिकॉर्ड संख्या': schemeItems.length,
          'आवंटित राशि': formatCurrency(allocated),
          'वितरण राशि': formatCurrency(sold),
          'शेष राशि': formatCurrency(remaining),
          'वितरण प्रतिशत': allocated > 0 ? ((sold / allocated) * 100).toFixed(2) + '%' : '0%'
        });
      });
      
      // Add component-wise remaining data
      uniqueComponents.forEach(component => {
        const componentItems = tableData.filter(item => item.component === component);
        const allocated = componentItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
        const sold = componentItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
        const remaining = allocated - sold;
        
        remainingData.push({
          'प्रकार': 'घटक',
          'नाम': component,
          'रिकॉर्ड संख्या': componentItems.length,
          'आवंटित राशि': formatCurrency(allocated),
          'वितरण राशि': formatCurrency(sold),
          'शेष राशि': formatCurrency(remaining),
          'वितरण प्रतिशत': allocated > 0 ? ((sold / allocated) * 100).toFixed(2) + '%' : '0%'
        });
      });
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${centerName} - शेष राशि विवरण</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              line-height: 1.4;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 20px;
            }
            .center-name {
              font-size: 28px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 10px;
            }
            .date {
              color: #7f8c8d;
              font-size: 14px;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background-color: #007bff;
              color: white;
              border: none;
              padding: 10px 15px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              z-index: 1000;
            }
            .print-button:hover {
              background-color: #0056b3;
            }
            .section {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              border-bottom: 2px solid #bdc3c7;
              padding-bottom: 8px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            }
            .section-title::before {
              content: '▶';
              margin-right: 10px;
              color: #3498db;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 10px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .data-table th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            .data-table td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              text-align: left;
            }
            .data-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .data-table tr:hover {
              background-color: #e3f2fd;
            }
            .highlight {
              background-color: #e8f5e8;
              font-weight: bold;
            }
            .total-row {
              background: linear-gradient(135deg, #ff7b7b 0%, #ff6b6b 100%) !important;
              color: white;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
              border-top: 2px solid #bdc3c7;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .section { page-break-inside: avoid; }
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">
            <i class="fa fa-print"></i> Print
          </button>
          
          <div class="header">
            <div class="center-name">${centerName}</div>
            <div class="date">शेष राशि विवरण रिपोर्ट - ${new Date().toLocaleDateString('hi-IN')}</div>
          </div>
          
          <div class="section">
            <div class="section-title">शेष राशि विवरण</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>प्रकार</th>
                  <th>नाम</th>
                  <th>रिकॉर्ड संख्या</th>
                  <th>आवंटित राशि</th>
                  <th>वितरण राशि</th>
                  <th>शेष राशि</th>
                  <th>वितरण प्रतिशत</th>
                </tr>
              </thead>
              <tbody>
                ${remainingData.map(item => `
                  <tr>
                    <td>${item['प्रकार']}</td>
                    <td>${item['नाम']}</td>
                    <td>${item['रिकॉर्ड संख्या']}</td>
                    <td>${item['आवंटित राशि']}</td>
                    <td>${item['वितरण राशि']}</td>
                    <td class="highlight">${item['शेष राशि']}</td>
                    <td>${item['वितरण प्रतिशत']}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p><strong>रिपोर्ट तैयार की गई:</strong> ${new Date().toLocaleString('hi-IN')}</p>
            <p><strong>कुल ${remainingData.length} आइटम का विश्लेषण</strong></p>
            <p>यह रिपोर्ट ${centerName} के लिए तैयार की गई है</p>
          </div>
        </body>
        </html>
      `;
      
      pdfViewWindow.document.write(htmlContent);
      pdfViewWindow.document.close();
      
    } catch (error) {
      console.error('Error opening Remaining PDF view:', error);
      alert('शेष राशि PDF व्यू खोलने में त्रुटि हुई। कृपया फिर से प्रयास करें।');
    }
  };

  // PDF view for Hierarchy section
  const openHierarchyPDFView = () => {
    try {
      // Create a new window for the PDF view
      const pdfViewWindow = window.open('', '_blank');
      
      // Generate HTML content for the Hierarchy section
      const hierarchyData = [];
      
      // Add Vidhan Sabha to Vikas Khand mapping
      Object.entries(hierarchicalData).forEach(([vidhanSabha, data]) => {
        data.vikasKhands.forEach(vikasKhand => {
          hierarchyData.push({
            'विधानसभा': vidhanSabha,
            'विकासखंड': vikasKhand,
            'प्रकार': 'स्थान'
          });
        });
        
        // Add Scheme to Investment mapping
        data.schemes.forEach(scheme => {
          const schemeInvestments = data.schemeInvestments[scheme] || [];
          schemeInvestments.forEach(investment => {
            hierarchyData.push({
              'विधानसभा': vidhanSabha,
              'योजना': scheme,
              'निवेश': investment,
              'प्रकार': 'योजना'
            });
          });
        });
      });
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${centerName} - पदानुक्रमिक संरचना</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              line-height: 1.4;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 20px;
            }
            .center-name {
              font-size: 28px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 10px;
            }
            .date {
              color: #7f8c8d;
              font-size: 14px;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background-color: #007bff;
              color: white;
              border: none;
              padding: 10px 15px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              z-index: 1000;
            }
            .print-button:hover {
              background-color: #0056b3;
            }
            .section {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              border-bottom: 2px solid #bdc3c7;
              padding-bottom: 8px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            }
            .section-title::before {
              content: '▶';
              margin-right: 10px;
              color: #3498db;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 10px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .data-table th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            .data-table td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              text-align: left;
            }
            .data-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .data-table tr:hover {
              background-color: #e3f2fd;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
              border-top: 2px solid #bdc3c7;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .section { page-break-inside: avoid; }
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">
            <i class="fa fa-print"></i> Print
          </button>
          
          <div class="header">
            <div class="center-name">${centerName}</div>
            <div class="date">पदानुक्रमिक संरचना रिपोर्ट - ${new Date().toLocaleDateString('hi-IN')}</div>
          </div>
          
          <div class="section">
            <div class="section-title">पदानुक्रमिक संरचना</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>विधानसभा</th>
                  <th>विकासखंड</th>
                  <th>योजना</th>
                  <th>निवेश</th>
                  <th>प्रकार</th>
                </tr>
              </thead>
              <tbody>
                ${hierarchyData.map(item => `
                  <tr>
                    <td>${item['विधानसभा']}</td>
                    <td>${item['विकासखंड'] || ''}</td>
                    <td>${item['योजना'] || ''}</td>
                    <td>${item['निवेश'] || ''}</td>
                    <td>${item['प्रकार']}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p><strong>रिपोर्ट तैयार की गई:</strong> ${new Date().toLocaleString('hi-IN')}</p>
            <p><strong>कुल ${hierarchyData.length} रिकॉर्ड का विश्लेषण</strong></p>
            <p>यह रिपोर्ट ${centerName} के लिए तैयार की गई है</p>
          </div>
        </body>
        </html>
      `;
      
      pdfViewWindow.document.write(htmlContent);
      pdfViewWindow.document.close();
      
    } catch (error) {
      console.error('Error opening Hierarchy PDF view:', error);
      alert('पदानुक्रमिक संरचना PDF व्यू खोलने में त्रुटि हुई। कृपया फिर से प्रयास करें।');
    }
  };

  // PDF view for Filter section
  const openFilterPDFView = () => {
    try {
      // Create a new window for the PDF view
      const pdfViewWindow = window.open('', '_blank');
      
      // Generate HTML content for the Filter section
      const filterData = [];
      
      // Add filtered schemes data
      if (selectedSchemes.size > 0) {
        selectedSchemes.forEach(scheme => {
          const schemeItems = tableData.filter(item => selectedSchemes.has(item.scheme_name));
          const allocated = schemeItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
          const sold = schemeItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
          const remaining = allocated - sold;
          
          filterData.push({
            'प्रकार': 'योजना',
            'नाम': scheme,
            'रिकॉर्ड संख्या': schemeItems.length,
            'आवंटित राशि': formatCurrency(allocated),
            'वितरण राशि': formatCurrency(sold),
            'शेष राशि': formatCurrency(remaining),
            'वितरण प्रतिशत': allocated > 0 ? ((sold / allocated) * 100).toFixed(2) + '%' : '0%'
          });
        });
      }
      
      // Add filtered components data
      if (selectedComponents.size > 0) {
        selectedComponents.forEach(component => {
          const componentItems = tableData.filter(item => selectedComponents.has(item.component));
          const allocated = componentItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
          const sold = componentItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
          const remaining = allocated - sold;
          
          filterData.push({
            'प्रकार': 'घटक',
            'नाम': component,
            'रिकॉर्ड संख्या': componentItems.length,
            'आवंटित राशि': formatCurrency(allocated),
            'वितरण राशि': formatCurrency(sold),
            'शेष राशि': formatCurrency(remaining),
            'वितरण प्रतिशत': allocated > 0 ? ((sold / allocated) * 100).toFixed(2) + '%' : '0%'
          });
        });
      }
      
      // If no filters selected, show all data
      if (filterData.length === 0) {
        filterData.push({
          'प्रकार': 'सूचना',
          'नाम': 'कोई फ़िल्टर नहीं चुना गया',
          'रिकॉर्ड संख्या': tableData.length,
          'आवंटित राशि': formatCurrency(totals.totalAllocated),
          'वितरण राशि': formatCurrency(totals.totalUpdated),
          'शेष राशि': formatCurrency(totals.totalRemaining),
          'वितरण प्रतिशत': totals.totalAllocated > 0 ? ((totals.totalUpdated / totals.totalAllocated) * 100).toFixed(2) + '%' : '0%'
        });
      }
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${centerName} - फ़िल्टर विवरण</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              line-height: 1.4;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 20px;
            }
            .center-name {
              font-size: 28px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 10px;
            }
            .date {
              color: #7f8c8d;
              font-size: 14px;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background-color: #007bff;
              color: white;
              border: none;
              padding: 10px 15px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              z-index: 1000;
            }
            .print-button:hover {
              background-color: #0056b3;
            }
            .section {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              border-bottom: 2px solid #bdc3c7;
              padding-bottom: 8px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            }
            .section-title::before {
              content: '▶';
              margin-right: 10px;
              color: #3498db;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 10px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .data-table th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            .data-table td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              text-align: left;
            }
            .data-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .data-table tr:hover {
              background-color: #e3f2fd;
            }
            .highlight {
              background-color: #e8f5e8;
              font-weight: bold;
            }
            .total-row {
              background: linear-gradient(135deg, #ff7b7b 0%, #ff6b6b 100%) !important;
              color: white;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
              border-top: 2px solid #bdc3c7;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .section { page-break-inside: avoid; }
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">
            <i class="fa fa-print"></i> Print
          </button>
          
          <div class="header">
            <div class="center-name">${centerName}</div>
            <div class="date">फ़िल्टर विवरण रिपोर्ट - ${new Date().toLocaleDateString('hi-IN')}</div>
          </div>
          
          <div class="section">
            <div class="section-title">फ़िल्टर विवरण</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>प्रकार</th>
                  <th>नाम</th>
                  <th>रिकॉर्ड संख्या</th>
                  <th>आवंटित राशि</th>
                  <th>वितरण राशि</th>
                  <th>शेष राशि</th>
                  <th>वितरण प्रतिशत</th>
                </tr>
              </thead>
              <tbody>
                ${filterData.map(item => `
                  <tr>
                    <td>${item['प्रकार']}</td>
                    <td>${item['नाम']}</td>
                    <td>${item['रिकॉर्ड संख्या']}</td>
                    <td>${item['आवंटित राशि']}</td>
                    <td>${item['वितरण राशि']}</td>
                    <td class="highlight">${item['शेष राशि']}</td>
                    <td>${item['वितरण प्रतिशत']}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p><strong>रिपोर्ट तैयार की गई:</strong> ${new Date().toLocaleString('hi-IN')}</p>
            <p><strong>कुल ${filterData.length} आइटम का विश्लेषण</strong></p>
            <p>यह रिपोर्ट ${centerName} के लिए तैयार की गई है</p>
          </div>
        </body>
        </html>
      `;
      
      pdfViewWindow.document.write(htmlContent);
      pdfViewWindow.document.close();
      
    } catch (error) {
      console.error('Error opening Filter PDF view:', error);
      alert('फ़िल्टर PDF व्यू खोलने में त्रुटि हुई। कृपया फिर से प्रयास करें।');
    }
  };

  // PDF view for Sources section
  const openSourcesPDFView = () => {
    try {
      // Create a new window for the PDF view
      const pdfViewWindow = window.open('', '_blank');
      
      // Generate HTML content for the Sources section
      const sourcesData = [];
      
      // Add sources data
      if (selectedSources.size > 0) {
        selectedSources.forEach(source => {
          const sourceItems = tableData.filter(item => selectedSources.has(item.source_of_receipt));
          const allocated = sourceItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
          const sold = sourceItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
          const remaining = allocated - sold;
          
          sourcesData.push({
            'स्रोत': source,
            'रिकॉर्ड संख्या': sourceItems.length,
            'आवंटित राशि': formatCurrency(allocated),
            'वितरण राशि': formatCurrency(sold),
            'शेष राशि': formatCurrency(remaining),
            'वितरण प्रतिशत': allocated > 0 ? ((sold / allocated) * 100).toFixed(2) + '%' : '0%'
          });
        });
      } else {
        // If no sources selected, show all sources data
        uniqueSources.forEach(source => {
          const sourceItems = tableData.filter(item => item.source_of_receipt === source);
          const allocated = sourceItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
          const sold = sourceItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
          const remaining = allocated - sold;
          
          sourcesData.push({
            'स्रोत': source,
            'रिकॉर्ड संख्या': sourceItems.length,
            'आवंटित राशि': formatCurrency(allocated),
            'वितरण राशि': formatCurrency(sold),
            'शेष राशि': formatCurrency(remaining),
            'वितरण प्रतिशत': allocated > 0 ? ((sold / allocated) * 100).toFixed(2) + '%' : '0%'
          });
        });
      }
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${centerName} - स्रोत विवरण</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              line-height: 1.4;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 20px;
            }
            .center-name {
              font-size: 28px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 10px;
            }
            .date {
              color: #7f8c8d;
              font-size: 14px;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              background-color: #007bff;
              color: white;
              border: none;
              padding: 10px 15px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
              display: flex;
              align-items: center;
              gap: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
              z-index: 1000;
            }
            .print-button:hover {
              background-color: #0056b3;
            }
            .section {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              border-bottom: 2px solid #bdc3c7;
              padding-bottom: 8px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            }
            .section-title::before {
              content: '▶';
              margin-right: 10px;
              color: #3498db;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 10px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .data-table th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            .data-table td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              text-align: left;
            }
            .data-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .data-table tr:hover {
              background-color: #e3f2fd;
            }
            .highlight {
              background-color: #e8f5e8;
              font-weight: bold;
            }
            .total-row {
              background: linear-gradient(135deg, #ff7b7b 0%, #ff6b6b 100%) !important;
              color: white;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
              border-top: 2px solid #bdc3c7;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .section { page-break-inside: avoid; }
              .print-button { display: none; }
            }
          </style>
        </head>
        <body>
          <button class="print-button no-print" onclick="window.print()">
            <i class="fa fa-print"></i> Print
          </button>
          
          <div class="header">
            <div class="center-name">${centerName}</div>
            <div class="date">स्रोत विवरण रिपोर्ट - ${new Date().toLocaleDateString('hi-IN')}</div>
          </div>
          
          <div class="section">
            <div class="section-title">स्रोत विवरण</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>स्रोत</th>
                  <th>रिकॉर्ड संख्या</th>
                  <th>आवंटित राशि</th>
                  <th>वितरण राशि</th>
                  <th>शेष राशि</th>
                  <th>वितरण प्रतिशत</th>
                </tr>
              </thead>
              <tbody>
                ${sourcesData.map(item => `
                  <tr>
                    <td>${item['स्रोत']}</td>
                    <td>${item['रिकॉर्ड संख्या']}</td>
                    <td>${item['आवंटित राशि']}</td>
                    <td>${item['वितरण राशि']}</td>
                    <td class="highlight">${item['शेष राशि']}</td>
                    <td>${item['वितरण प्रतिशत']}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p><strong>रिपोर्ट तैयार की गई:</strong> ${new Date().toLocaleString('hi-IN')}</p>
            <p><strong>कुल ${sourcesData.length} स्रोत का विश्लेषण</strong></p>
            <p>यह रिपोर्ट ${centerName} के लिए तैयार की गई है</p>
          </div>
        </body>
        </html>
      `;
      
      pdfViewWindow.document.write(htmlContent);
      pdfViewWindow.document.close();
      
    } catch (error) {
      console.error('Error opening Sources PDF view:', error);
      alert('स्रोत PDF व्यू खोलने में त्रुटि हुई। कृपया फिर से प्रयास करें।');
    }
  };

  const exportToExcel = () => {
    try {
      // Enhanced component descriptions
      const getComponentDescription = (component) => {
        const descriptions = {
          'कृषक प्रशिक्षण': 'किसानों को आधुनिक कृषि तकनीकों का प्रशिक्षण',
          'बीज वितरण': 'उन्नत किस्म के बीजों का वितरण किसानों को',
          'उपकरण सब्सिडी': 'कृषि उपकरणों पर सब्सिडी या अनुदान',
          'सिंचाई सुविधा': 'सिंचाई के लिए पाइपलाइन, बोरवेल आदि',
          'मार्केटिंग सपोर्ट': 'फसल की वितरण के लिए बाजार सहायता',
          'पशुपालन सहायता': 'पशुपालन के लिए अनुदान और सहायता',
          'मशीनरी': 'कृषि मशीनरी और उपकरण',
          'केंचुवीकम्पोस्ट': 'जैविक खाद बनाने के लिए केंचुआ',
          'बायोफर्टिलाइजर': 'जैविक उर्वरक और कीटनाशक',
          'रसायन उर्वरक': 'रासायनिक खाद और कीटनाशक',
          'सोलर सिस्टम': 'सौर ऊर्जा प्रणाली स्थापना',
          'ड्रिप सिंचाई': 'बूंद-बूंद सिंचाई प्रणाली'
        };
        return descriptions[component] || 'विकास कार्यक्रम का मुख्य घटक';
      };

      // Enhanced scheme descriptions
      const getSchemeDescription = (scheme) => {
        const descriptions = {
          'कृषक कल्याण योजना': 'किसानों के समग्र विकास और कल्याण के लिए',
          'सरकारी कृषि योजना': 'सरकार द्वारा संचालित कृषि विकास कार्यक्रम',
          'राष्ट्रीय कृषि विकास योजना': 'राष्ट्रीय स्तर पर कृषि उत्पादकता बढ़ाने के लिए',
          'प्रधानमंत्री फसल बीमा योजना': 'फसल के जोखिम से बचाव के लिए',
          'किसान पेंशन योजना': 'किसानों के वृद्धावस्था सुरक्षा के लिए',
          'मृदा स्वास्थ्य कार्ड योजना': 'मिट्टी की गुणवत्ता जांच और सुधार के लिए'
        };
        return descriptions[scheme] || 'सरकारी विकास कार्यक्रम';
      };

      // Enhanced geographical analysis
      const getGeographicalAnalysis = () => {
        const geoAnalysis = [];
        
        // Analyze each scheme's geographical presence
        uniqueSchemes.forEach(scheme => {
          const schemeItems = tableData.filter(item => item.scheme_name === scheme);
          const vidhanSabhas = [...new Set(schemeItems.map(item => item.vidhan_sabha_name))].filter(Boolean);
          const vikasKhands = [...new Set(schemeItems.map(item => item.vikas_khand_name))].filter(Boolean);
          const centers = [...new Set(schemeItems.map(item => item.center_name))].filter(Boolean);
          
          geoAnalysis.push({
            'योजना': scheme,
            'योजना विवरण': getSchemeDescription(scheme),
            'कुल रिकॉर्ड': schemeItems.length,
            'शामिल विधानसभाएं': vidhanSabhas.join(', '),
            'विधानसभाओं की संख्या': vidhanSabhas.length,
            'शामिल विकासखंड': vikasKhands.join(', '),
            'विकासखंडों की संख्या': vikasKhands.length,
            'शामिल केंद्र': centers.join(', '),
            'केंद्रों की संख्या': centers.length,
            'आवंटित राशि': formatCurrency(schemeItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0)),
            'वितरण राशि': formatCurrency(schemeItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0)),
            'शेष राशि': formatCurrency(schemeItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0) - schemeItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0)),
            'प्रभावशीलता प्रतिशत': ((schemeItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0) / schemeItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 1)) * 100).toFixed(2),
            'भौगोलिक कवरेज': vidhanSabhas.length > 0 ? 'व्यापक' : 'सीमित'
          });
        });
        
        return geoAnalysis;
      };

      // Enhanced component analysis with relational data
      const getComponentAnalysis = () => {
        const componentAnalysis = [];
        
        uniqueComponents.forEach(component => {
          const componentItems = tableData.filter(item => item.component === component);
          const schemes = [...new Set(componentItems.map(item => item.scheme_name))].filter(Boolean);
          const investments = [...new Set(componentItems.map(item => item.investment_name))].filter(Boolean);
          const sources = [...new Set(componentItems.map(item => item.source_of_receipt))].filter(Boolean);
          const vidhanSabhas = [...new Set(componentItems.map(item => item.vidhan_sabha_name))].filter(Boolean);
          const vikasKhands = [...new Set(componentItems.map(item => item.vikas_khand_name))].filter(Boolean);
          
          componentAnalysis.push({
            'घटक': component,
            'घटक विवरण': getComponentDescription(component),
            'कुल रिकॉर्ड': componentItems.length,
            'संबंधित योजनाएं': schemes.join(', '),
            'योजनाओं की संख्या': schemes.length,
            'संबंधित निवेश': investments.join(', '),
            'निवेशों की संख्या': investments.length,
            'स्रोत': sources.join(', '),
            'स्रोतों की संख्या': sources.length,
            'शामिल विधानसभाएं': vidhanSabhas.join(', '),
            'विधानसभाओं की संख्या': vidhanSabhas.length,
            'शामिल विकासखंड': vikasKhands.join(', '),
            'विकासखंडों की संख्या': vikasKhands.length,
            'आवंटित राशि': formatCurrency(componentItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0)),
            'वितरण राशि': formatCurrency(componentItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0)),
            'शेष राशि': formatCurrency(componentItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0) - componentItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0)),
            'प्रभावशीलता प्रतिशत': ((componentItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0) / componentItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 1)) * 100).toFixed(2)
          });
        });
        
        return componentAnalysis;
      };

      // Comprehensive relational matrix
      const getRelationalMatrix = () => {
        const matrix = [];
        
        uniqueSchemes.forEach(scheme => {
          const schemeItems = tableData.filter(item => item.scheme_name === scheme);
          const schemeComponents = [...new Set(schemeItems.map(item => item.component))].filter(Boolean);
          const schemeInvestments = [...new Set(schemeItems.map(item => item.investment_name))].filter(Boolean);
          const schemeSources = [...new Set(schemeItems.map(item => item.source_of_receipt))].filter(Boolean);
          const schemeVidhanSabhas = [...new Set(schemeItems.map(item => item.vidhan_sabha_name))].filter(Boolean);
          const schemeVikasKhands = [...new Set(schemeItems.map(item => item.vikas_khand_name))].filter(Boolean);
          
          matrix.push({
            'योजना': scheme,
            'योजना विवरण': getSchemeDescription(scheme),
            'घटक': schemeComponents.join(', '),
            'निवेश': schemeInvestments.join(', '),
            'स्रोत': schemeSources.join(', '),
            'विधानसभाएं': schemeVidhanSabhas.join(', '),
            'विकासखंड': schemeVikasKhands.join(', '),
            'कुल मात्रा': schemeItems.reduce((sum, item) => sum + parseFloat(item.allocated_quantity || 0), 0).toFixed(2),
            'वितरण मात्रा': schemeItems.reduce((sum, item) => sum + parseFloat(item.updated_quantity || 0), 0).toFixed(2),
            'कुल राशि': formatCurrency(schemeItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0)),
            'वितरण राशि': formatCurrency(schemeItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0)),
            'शेष राशि': formatCurrency(schemeItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0) - schemeItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0))
          });
        });
        
        return matrix;
      };

      // Prepare main data for Excel export with enhanced information
      const excelData = tableData.map(item => ({
        'क्र.सं.': '', // Will be filled by Excel
        'विधानसभा': item.vidhan_sabha_name || '',
        'विकासखंड': item.vikas_khand_name || '',
        'केंद्र': item.center_name || '',
        'योजना': item.scheme_name || '',
        'योजना विवरण': getSchemeDescription(item.scheme_name || ''),
        'स्रोत': item.source_of_receipt || '',
        'घटक': item.component || '',
        'घटक विवरण': getComponentDescription(item.component || ''),
        'निवेश': item.investment_name || '',
        'आवंटित मात्रा': parseFloat(item.allocated_quantity || 0),
        'दर': parseFloat(item.rate || 0),
        'आवंटित राशि': parseFloat(item.allocated_quantity || 0) * parseFloat(item.rate || 0),
        'वितरण मात्रा': parseFloat(item.updated_quantity || 0),
        'वितरण राशि': parseFloat(item.updated_quantity || 0) * parseFloat(item.rate || 0),
        'शेष मात्रा': parseFloat(item.allocated_quantity || 0) - parseFloat(item.updated_quantity || 0),
        'शेष राशि': (parseFloat(item.allocated_quantity || 0) - parseFloat(item.updated_quantity || 0)) * parseFloat(item.rate || 0),
        'वितरण प्रतिशत': ((parseFloat(item.updated_quantity || 0) / parseFloat(item.allocated_quantity || 1)) * 100).toFixed(2),
        'स्थिति': parseFloat(item.allocated_quantity || 0) - parseFloat(item.updated_quantity || 0) > 0 ? 'सक्रिय' : 'पूर्ण'
      }));

      // Create workbook
      const wb = XLSX.utils.book_new();
      
      // 1. Executive Summary Sheet
      const executiveSummary = [
        ['कार्यकारी सारांश', ''],
        ['रिपोर्ट तिथि', new Date().toLocaleDateString('hi-IN')],
        ['केंद्र का नाम', centerName || 'सभी केंद्र'],
        ['कुल रिकॉर्ड', tableData.length],
        ['', ''],
        ['भौगोलिक विवरण', ''],
        ['विधानसभाओं की संख्या', uniqueVidhanSabhas.length],
        ['विकासखंडों की संख्या', uniqueVikasKhands.length],
        ['केंद्रों की संख्या', new Set(tableData.map(item => item.center_name)).size],
        ['', ''],
        ['योजना विवरण', ''],
        ['योजनाओं की कुल संख्या', uniqueSchemes.length],
        ['घटकों की कुल संख्या', uniqueComponents.length],
        ['निवेशों की कुल संख्या', uniqueInvestments.length],
        ['स्रोतों की कुल संख्या', uniqueSources.length],
        ['', ''],
        ['वित्तीय सारांश (रुपयों में)', ''],
        ['कुल आवंटित राशि', formatCurrency(totals.totalAllocated)],
        ['कुल वितरण राशि', formatCurrency(totals.totalUpdated)],
        ['कुल शेष राशि', formatCurrency(totals.totalRemaining)],
        ['वितरण प्रतिशत', `${((totals.totalUpdated / totals.totalAllocated) * 100).toFixed(2)}%`],
        ['बची हुई राशि प्रतिशत', `${((totals.totalRemaining / totals.totalAllocated) * 100).toFixed(2)}%`]
      ];
      
      const executiveSheet = XLSX.utils.aoa_to_sheet(executiveSummary);
      XLSX.utils.book_append_sheet(wb, executiveSheet, "कार्यकारी सारांश");
      
      // 2. Main data sheet with serial numbers
      const mainDataWithSerial = excelData.map((row, index) => ({
        ...row,
        'क्र.सं.': index + 1
      }));
      
      const mainSheet = XLSX.utils.json_to_sheet(mainDataWithSerial);
      XLSX.utils.book_append_sheet(wb, mainSheet, "मुख्य डेटा");
      
      // 3. Comprehensive Summary data
      const summaryData = [
        ['संपूर्ण सारांश', ''],
        ['रिकॉर्ड विवरण', 'मान'],
        ['कुल रिकॉर्ड', tableData.length],
        ['विधानसभाओं की संख्या', uniqueVidhanSabhas.length],
        ['विकासखंडों की संख्या', uniqueVikasKhands.length],
        ['योजनाओं की संख्या', uniqueSchemes.length],
        ['निवेशों की संख्या', uniqueInvestments.length],
        ['घटकों की संख्या', uniqueComponents.length],
        ['स्रोतों की संख्या', uniqueSources.length],
        ['', ''],
        ['वित्तीय विवरण (रुपयों में)', ''],
        ['कुल आवंटित राशि', formatCurrency(totals.totalAllocated)],
        ['कुल वितरण राशि', formatCurrency(totals.totalUpdated)],
        ['कुल शेष राशि', formatCurrency(totals.totalRemaining)],
        ['वितरण दर', `${((totals.totalUpdated / totals.totalAllocated) * 100).toFixed(2)}%`],
        ['प्रभावशीलता', totals.totalAllocated > 0 ? 'उत्कृष्ट' : 'मूल्यांकन आवश्यक']
      ];
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summarySheet, "संपूर्ण सारांश");
      
      // 4. Detailed Scheme-wise breakdown
      const schemeDetails = uniqueSchemes.map(scheme => {
        const schemeItems = tableData.filter(item => item.scheme_name === scheme);
        const allocated = schemeItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
        const sold = schemeItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
        const remaining = allocated - sold;
        const vidhanSabhas = [...new Set(schemeItems.map(item => item.vidhan_sabha_name))].filter(Boolean);
        const vikasKhands = [...new Set(schemeItems.map(item => item.vikas_khand_name))].filter(Boolean);
        const components = [...new Set(schemeItems.map(item => item.component))].filter(Boolean);
        
        return {
          'योजना': scheme,
          'रिकॉर्ड संख्या': schemeItems.length,
          'आवंटित राशि': formatCurrency(allocated),
          'वितरण राशि': formatCurrency(sold),
          'शेष राशि': formatCurrency(remaining),
          'वितरण प्रतिशत': `${((sold / allocated) * 100).toFixed(2)}%`,
          'शामिल विधानसभाएं': vidhanSabhas.join(', '),
          'शामिल विकासखंड': vikasKhands.join(', '),
          'शामिल घटक': components.join(', ')
        };
      });
      
      const schemeSheet = XLSX.utils.json_to_sheet(schemeDetails);
      XLSX.utils.book_append_sheet(wb, schemeSheet, "योजना विवरण");
      
      // 5. Component-wise breakdown
      const componentDetails = uniqueComponents.map(component => {
        const componentItems = tableData.filter(item => item.component === component);
        const allocated = componentItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
        const sold = componentItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
        const remaining = allocated - sold;
        const schemes = [...new Set(componentItems.map(item => item.scheme_name))].filter(Boolean);
        const investments = [...new Set(componentItems.map(item => item.investment_name))].filter(Boolean);
        
        return {
          'घटक': component,
          'रिकॉर्ड संख्या': componentItems.length,
          'आवंटित राशि': formatCurrency(allocated),
          'वितरण राशि': formatCurrency(sold),
          'शेष राशि': formatCurrency(remaining),
          'वितरण प्रतिशत': `${((sold / allocated) * 100).toFixed(2)}%`,
          'शामिल योजनाएं': schemes.join(', '),
          'शामिल निवेश': investments.join(', ')
        };
      });
      
      const componentSheet = XLSX.utils.json_to_sheet(componentDetails);
      XLSX.utils.book_append_sheet(wb, componentSheet, "घटक विवरण");
      
      // 6. Location-wise breakdown
      const locationDetails = uniqueVikasKhands.map(location => {
        const locationItems = tableData.filter(item => item.vikas_khand_name === location);
        const allocated = locationItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
        const sold = locationItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
        const remaining = allocated - sold;
        const vidhanSabha = locationItems[0]?.vidhan_sabha_name || '';
        const centers = [...new Set(locationItems.map(item => item.center_name))].filter(Boolean);
        const schemes = [...new Set(locationItems.map(item => item.scheme_name))].filter(Boolean);
        
        return {
          'विकासखंड': location,
          'विधानसभा': vidhanSabha,
          'शामिल केंद्र': centers.join(', '),
          'रिकॉर्ड संख्या': locationItems.length,
          'आवंटित राशि': formatCurrency(allocated),
          'वितरण राशि': formatCurrency(sold),
          'शेष राशि': formatCurrency(remaining),
          'वितरण प्रतिशत': `${((sold / allocated) * 100).toFixed(2)}%`,
          'शामिल योजनाएं': schemes.join(', ')
        };
      });
      
      const locationSheet = XLSX.utils.json_to_sheet(locationDetails);
      XLSX.utils.book_append_sheet(wb, locationSheet, "स्थान विवरण");
      
      // 7. Source-wise breakdown
      const sourceDetails = uniqueSources.map(source => {
        const sourceItems = tableData.filter(item => item.source_of_receipt === source);
        const allocated = sourceItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
        const sold = sourceItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
        const remaining = allocated - sold;
        
        return {
          'स्रोत': source,
          'रिकॉर्ड संख्या': sourceItems.length,
          'आवंटित राशि': formatCurrency(allocated),
          'वितरण राशि': formatCurrency(sold),
          'शेष राशि': formatCurrency(remaining),
          'वितरण प्रतिशत': `${((sold / allocated) * 100).toFixed(2)}%`
        };
      });
      
      const sourceSheet = XLSX.utils.json_to_sheet(sourceDetails);
      XLSX.utils.book_append_sheet(wb, sourceSheet, "स्रोत विवरण");
      
      // 8. Investment-wise breakdown
      const investmentDetails = uniqueInvestments.map(investment => {
        const investmentItems = tableData.filter(item => item.investment_name === investment);
        const allocated = investmentItems.reduce((sum, item) => sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
        const sold = investmentItems.reduce((sum, item) => sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
        const remaining = allocated - sold;
        
        return {
          'निवेश': investment,
          'रिकॉर्ड संख्या': investmentItems.length,
          'आवंटित राशि': formatCurrency(allocated),
          'वितरण राशि': formatCurrency(sold),
          'शेष राशि': formatCurrency(remaining),
          'वितरण प्रतिशत': `${((sold / allocated) * 100).toFixed(2)}%`
        };
      });
      
      const investmentSheet = XLSX.utils.json_to_sheet(investmentDetails);
      XLSX.utils.book_append_sheet(wb, investmentSheet, "निवेश विवरण");
      
      // Export file
      const fileName = `${centerName || 'data'}_संपूर्ण_रिपोर्ट_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      console.log('Excel export successful:', fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('एक्सेल निर्यात में त्रुटि हुई। कृपया फिर से प्रयास करें।');
    }
  };

  const exportToPDF = () => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
       
      // Generate comprehensive HTML content for PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${centerName} - संपूर्ण रिपोर्ट</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 20px;
              line-height: 1.4;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2c3e50;
              padding-bottom: 20px;
            }
            .center-name {
              font-size: 28px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 10px;
            }
            .date {
              color: #7f8c8d;
              font-size: 14px;
            }
            .executive-summary {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .summary-card {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              border-left: 4px solid #007bff;
            }
            .summary-number {
              font-size: 20px;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 5px;
            }
            .summary-label {
              font-size: 11px;
              color: #7f8c8d;
              text-transform: uppercase;
            }
            .section {
              margin: 30px 0;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #2c3e50;
              border-bottom: 2px solid #bdc3c7;
              padding-bottom: 8px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
            }
            .section-title::before {
              content: '▶';
              margin-right: 10px;
              color: #3498db;
            }
            .data-table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 10px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .data-table th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 8px;
              text-align: left;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            .data-table td {
              padding: 10px 8px;
              border: 1px solid #ddd;
              text-align: left;
            }
            .data-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .data-table tr:hover {
              background-color: #e3f2fd;
            }
            .highlight {
              background-color: #e8f5e8;
              font-weight: bold;
            }
            .total-row {
              background: linear-gradient(135deg, #ff7b7b 0%, #ff6b6b 100%) !important;
              color: white;
              font-weight: bold;
            }
            .financial-summary {
              background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
            }
            .financial-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              text-align: center;
            }
            .financial-item h3 {
              margin: 0;
              font-size: 24px;
            }
            .financial-item p {
              margin: 5px 0 0 0;
              font-size: 12px;
              opacity: 0.9;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #7f8c8d;
              border-top: 2px solid #bdc3c7;
              padding-top: 20px;
            }
            .scheme-location {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 5px;
              padding: 15px;
              margin: 15px 0;
            }
            .component-breakdown {
              background: #d1ecf1;
              border: 1px solid #bee5eb;
              border-radius: 5px;
              padding: 15px;
              margin: 15px 0;
            }
            .page-break {
              page-break-before: always;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="center-name">${centerName}</div>
            <div class="date">संपूर्ण विवरण रिपोर्ट - ${new Date().toLocaleDateString('hi-IN')}</div>
          </div>
          
          <!-- Executive Summary -->
          <div class="executive-summary">
            <h2 style="margin-top: 0; text-align: center;">कार्यकारी सारांश</h2>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-number">${tableData.length}</div>
                <div class="summary-label">कुल रिकॉर्ड</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${uniqueVidhanSabhas.length}</div>
                <div class="summary-label">विधानसभा</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${uniqueVikasKhands.length}</div>
                <div class="summary-label">विकासखंड</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${uniqueSchemes.length}</div>
                <div class="summary-label">योजनाएं</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${uniqueComponents.length}</div>
                <div class="summary-label">घटक</div>
              </div>
              <div class="summary-card">
                <div class="summary-number">${uniqueSources.length}</div>
                <div class="summary-label">स्रोत</div>
              </div>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="financial-summary">
            <h2 style="margin-top: 0; text-align: center;">वित्तीय सारांश</h2>
            <div class="financial-grid">
              <div class="financial-item">
                <h3>${formatCurrency(totals.totalAllocated)}</h3>
                <p>कुल आवंटित राशि</p>
              </div>
              <div class="financial-item">
                <h3>${formatCurrency(totals.totalUpdated)}</h3>
                <p>कुल वितरण राशि</p>
              </div>
              <div class="financial-item">
                <h3>${formatCurrency(totals.totalRemaining)}</h3>
                <p>कुल शेष राशि</p>
              </div>
            </div>
          </div>

          <!-- Main Data Table -->
          <div class="section">
            <div class="section-title">मुख्य डेटा तालिका</div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>विधानसभा</th>
                  <th>विकासखंड</th>
                  <th>योजना</th>
                  <th>घटक</th>
                  <th>आवंटित मात्रा</th>
                  <th>दर</th>
                  <th>आवंटित राशि</th>
                  <th>वितरण मात्रा</th>
                  <th>वितरण राशि</th>
                  <th>शेष राशि</th>
                </tr>
              </thead>
              <tbody>
                ${tableData.map(item => {
                  const allocated = parseFloat(item.allocated_quantity || 0) * parseFloat(item.rate || 0);
                  const sold = parseFloat(item.updated_quantity || 0) * parseFloat(item.rate || 0);
                  const remaining = allocated - sold;
                  return `
                    <tr>
                      <td>${item.vidhan_sabha_name || ''}</td>
                      <td>${item.vikas_khand_name || ''}</td>
                      <td>${item.scheme_name || ''}</td>
                      <td>${item.component || ''}</td>
                      <td>${parseFloat(item.allocated_quantity || 0).toFixed(2)}</td>
                      <td>${formatCurrency(parseFloat(item.rate || 0))}</td>
                      <td>${formatCurrency(allocated)}</td>
                      <td>${parseFloat(item.updated_quantity || 0).toFixed(2)}</td>
                      <td>${formatCurrency(sold)}</td>
                      <td class="highlight">${formatCurrency(remaining)}</td>
                    </tr>
                  `;
                }).join('')}
                <tr class="total-row">
                  <td colspan="6"><strong>कुल योग</strong></td>
                  <td><strong>${formatCurrency(totals.totalAllocated)}</strong></td>
                  <td></td>
                  <td><strong>${formatCurrency(totals.totalUpdated)}</strong></td>
                  <td class="highlight"><strong>${formatCurrency(totals.totalRemaining)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="footer">
            <p><strong>रिपोर्ट तैयार की गई:</strong> ${new Date().toLocaleString('hi-IN')}</p>
            <p><strong>कुल ${tableData.length} रिकॉर्ड का विश्लेषण</strong></p>
            <p>यह रिपोर्ट ${centerName} के लिए तैयार की गई है</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load and then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
      };
      
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('पीडीएफ निर्यात में त्रुटि हुई। कृपया फिर से प्रयास करें।');
    }
  };
  // Default state for collapsed sections
  const defaultCollapsedSections = {
    hierarchy: true,   // All accordions - closed by default
    schemes: true,
    investments: true,
    filter: true,      // All accordions - closed by default
    sources: true,
    places: true,
    allocation: true,
    sales: true,
    remaining: true
  };

  const [collapsedSections, setCollapsedSections] = useState(defaultCollapsedSections);

  // Reset collapsed sections when modal is opened
  useEffect(() => {
    if (show) {
      setCollapsedSections(defaultCollapsedSections);
      
      // Simple tooltip initialization
      const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipElements.forEach(element => {
        // Tooltips are handled by Bootstrap
      });
    }
  }, [show]);

  // State for detailed breakdowns within each section
  const [allocationDetails, setAllocationDetails] = useState([]);
  const [salesDetails, setSalesDetails] = useState([]);
  const [remainingDetails, setRemainingDetails] = useState([]);

  // Initialize tooltips when modal opens
  useEffect(() => {
    if (show) {
      // Simple tooltip initialization using native HTML title attribute
      const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipElements.forEach(element => {
        // The title attribute is already set, so tooltips should work with native browser tooltips
        // For better styling, we can enhance them with CSS
      });
    }
  }, [show]);

  // Function to get detailed tooltip data for a specific item
  const getTooltipData = (itemType, itemValue, filteredData) => {
    const relevantData = filteredData.filter(item => {
      switch(itemType) {
        case 'scheme': return item.scheme_name === itemValue;
        case 'investment': return item.investment_name === itemValue;
        case 'component': return item.component === itemValue;
        case 'source': return item.source_of_receipt === itemValue;
        case 'vidhanSabha': return item.vidhan_sabha_name === itemValue;
        case 'vikasKhand': return item.vikas_khand_name === itemValue;
        default: return false;
      }
    });

    if (relevantData.length === 0) return null;

    // Calculate totals for the item
    const totalAllocated = relevantData.reduce((sum, item) =>
      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
    const totalUpdated = relevantData.reduce((sum, item) =>
      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
    const totalRemaining = totalAllocated - totalUpdated;

    // Get unique locations
    const uniqueVidhanSabhas = [...new Set(relevantData.map(item => item.vidhan_sabha_name))].filter(Boolean);
    const uniqueVikasKhands = [...new Set(relevantData.map(item => item.vikas_khand_name))].filter(Boolean);

    return {
      count: relevantData.length,
      totalAllocated,
      totalUpdated,
      totalRemaining,
      uniqueVidhanSabhas,
      uniqueVikasKhands,
      allocatedQuantity: relevantData.reduce((sum, item) => sum + parseFloat(item.allocated_quantity || 0), 0),
      updatedQuantity: relevantData.reduce((sum, item) => sum + parseFloat(item.updated_quantity || 0), 0),
      rate: relevantData[0]?.rate || 0
    };
  };

  // Format currency for tooltips
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format quantity with units
  const formatQuantity = (quantity) => {
    return parseFloat(quantity || 0).toFixed(2);
  };

  // Generate tooltip content
  const getTooltipContent = (itemType, itemValue, tooltipData, allData) => {
    if (!tooltipData) return '';

    const locations = tooltipData.uniqueVidhanSabhas.length > 0
      ? tooltipData.uniqueVidhanSabhas.join(', ')
      : 'N/A';

    const vikasKhands = tooltipData.uniqueVikasKhands.length > 0
      ? tooltipData.uniqueVikasKhands.join(', ')
      : 'N/A';

    // Get related items based on type
    let relatedInfo = '';
    if (itemType === 'scheme') {
      const relatedComponents = [...new Set(allData.filter(item => item.scheme_name === itemValue).map(item => item.component))].filter(Boolean);
      const relatedSources = [...new Set(allData.filter(item => item.scheme_name === itemValue).map(item => item.source_of_receipt))].filter(Boolean);
      relatedInfo = `घटक: ${relatedComponents.join(', ')}\nस्रोत: ${relatedSources.join(', ')}`;
    } else if (itemType === 'component') {
      const relatedSchemes = [...new Set(allData.filter(item => item.component === itemValue).map(item => item.scheme_name))].filter(Boolean);
      const relatedSources = [...new Set(allData.filter(item => item.component === itemValue).map(item => item.source_of_receipt))].filter(Boolean);
      relatedInfo = `योजनाएं: ${relatedSchemes.join(', ')}\nस्रोत: ${relatedSources.join(', ')}`;
    } else if (itemType === 'source') {
      const relatedSchemes = [...new Set(allData.filter(item => item.source_of_receipt === itemValue).map(item => item.scheme_name))].filter(Boolean);
      const relatedComponents = [...new Set(allData.filter(item => item.source_of_receipt === itemValue).map(item => item.component))].filter(Boolean);
      relatedInfo = `योजनाएं: ${relatedSchemes.join(', ')}\nघटक: ${relatedComponents.join(', ')}`;
    } else if (itemType === 'investment') {
      const relatedSchemes = [...new Set(allData.filter(item => item.investment_name === itemValue).map(item => item.scheme_name))].filter(Boolean);
      const relatedComponents = [...new Set(allData.filter(item => item.investment_name === itemValue).map(item => item.component))].filter(Boolean);
      relatedInfo = `योजनाएं: ${relatedSchemes.join(', ')}\nघटक: ${relatedComponents.join(', ')}`;
    }

    return `${itemValue} (${itemType.toUpperCase()})
रिकॉर्ड: ${tooltipData.count}
आवंटित मात्रा: ${formatQuantity(tooltipData.allocatedQuantity)}
वितरण मात्रा: ${formatQuantity(tooltipData.updatedQuantity)}
दर: ${formatCurrency(tooltipData.rate)}
आवंटित: ${formatCurrency(tooltipData.totalAllocated)}
बेचा गया: ${formatCurrency(tooltipData.totalUpdated)}
शेष: ${formatCurrency(tooltipData.totalRemaining)}
 ${relatedInfo}
विधानसभा: ${locations}
विकासखंड: ${vikasKhands}`;
  };

  // Multi-select state for filtering
  const [selectedSchemes, setSelectedSchemes] = useState(new Set());
  const [selectedComponents, setSelectedComponents] = useState(new Set());
  const [selectedSources, setSelectedSources] = useState(new Set());

  // State for scheme collapse within hierarchy section
  const [collapsedSchemes, setCollapsedSchemes] = useState(new Set());

  // State for selected vikas khand in places section
  const [selectedVikasKhand, setSelectedVikasKhand] = useState(null);

  // Get unique values for each category
  const uniqueVidhanSabhas = useMemo(() => {
    return [...new Set(tableData.map(item => item.vidhan_sabha_name))].filter(Boolean).sort();
  }, [tableData]);

  const uniqueVikasKhands = useMemo(() => {
    return [...new Set(tableData.map(item => item.vikas_khand_name))].filter(Boolean).sort();
  }, [tableData]);

  const uniqueSchemes = useMemo(() => {
    return [...new Set(tableData.map(item => item.scheme_name))].filter(Boolean).sort();
  }, [tableData]);

  const uniqueInvestments = useMemo(() => {
    return [...new Set(tableData.map(item => item.investment_name))].filter(Boolean).sort();
  }, [tableData]);

  const uniqueComponents = useMemo(() => {
    return [...new Set(tableData.map(item => item.component))].filter(Boolean).sort();
  }, [tableData]);

  const uniqueSources = useMemo(() => {
    return [...new Set(tableData.map(item => item.source_of_receipt))].filter(Boolean).sort();
  }, [tableData]);

  // Create hierarchical structure for better visualization
  const hierarchicalData = useMemo(() => {
    const hierarchy = {};
    
    tableData.forEach(item => {
      const vidhanSabha = item.vidhan_sabha_name;
      const vikasKhand = item.vikas_khand_name;
      const scheme = item.scheme_name;
      const investment = item.investment_name;
      const component = item.component;
      const source = item.source_of_receipt;

      if (!hierarchy[vidhanSabha]) {
        hierarchy[vidhanSabha] = {
          vikasKhands: new Set(),
          schemes: new Set(),
          investments: new Set(),
          components: new Set(),
          sources: new Set(),
          schemeInvestments: {} // New: Map schemes to their specific investments
        };
      }

      if (vikasKhand) hierarchy[vidhanSabha].vikasKhands.add(vikasKhand);
      if (scheme) {
        hierarchy[vidhanSabha].schemes.add(scheme);
        // Map scheme to its specific investments
        if (!hierarchy[vidhanSabha].schemeInvestments[scheme]) {
          hierarchy[vidhanSabha].schemeInvestments[scheme] = new Set();
        }
        if (investment) hierarchy[vidhanSabha].schemeInvestments[scheme].add(investment);
      }
      if (investment) hierarchy[vidhanSabha].investments.add(investment);
      if (component) hierarchy[vidhanSabha].components.add(component);
      if (source) hierarchy[vidhanSabha].sources.add(source);
    });

    // Convert Sets to sorted arrays and schemeInvestments to arrays
    Object.keys(hierarchy).forEach(key => {
      hierarchy[key] = {
        vikasKhands: Array.from(hierarchy[key].vikasKhands).sort(),
        schemes: Array.from(hierarchy[key].schemes).sort(),
        investments: Array.from(hierarchy[key].investments).sort(),
        components: Array.from(hierarchy[key].components).sort(),
        sources: Array.from(hierarchy[key].sources).sort(),
        schemeInvestments: Object.fromEntries(
          Object.entries(hierarchy[key].schemeInvestments).map(([scheme, investments]) => [
            scheme,
            Array.from(investments).sort()
          ])
        )
      };
    });

    return hierarchy;
  }, [tableData]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalAllocated = tableData.reduce((sum, item) =>
      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
    const totalUpdated = tableData.reduce((sum, item) =>
      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
    const totalRemaining = totalAllocated - totalUpdated;

    return {
      totalAllocated,
      totalUpdated,
      totalRemaining,
      placesCount: uniqueVikasKhands.length, // Use unique places count instead of total records
      recordsCount: tableData.length // Keep total records for reference
    };
  }, [tableData, uniqueVikasKhands]);


  // Toggle collapse section with auto-scroll
  const toggleCollapse = (section) => {
    setCollapsedSections(prev => {
      const newState = {
        ...prev,
        [section]: !prev[section]
      };
      
      // If the section is being opened (was collapsed, now expanded)
      if (prev[section] === true) {
        // Small delay to allow the collapse animation to complete
        setTimeout(() => {
          const element = document.getElementById(`${section}-section`);
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 100);
      }
      
      return newState;
    });
  };

  // Toggle scheme selection
  const toggleScheme = (scheme) => {
    setSelectedSchemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scheme)) {
        newSet.delete(scheme);
      } else {
        newSet.add(scheme);
      }
      return newSet;
    });
  };

  // Toggle component selection
  const toggleComponent = (component) => {
    setSelectedComponents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(component)) {
        newSet.delete(component);
      } else {
        newSet.add(component);
      }
      return newSet;
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedSchemes(new Set());
    setSelectedComponents(new Set());
    setSelectedSources(new Set());
  };

  // Toggle scheme collapse in hierarchy section
  const toggleSchemeCollapse = (schemeKey) => {
    setCollapsedSchemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(schemeKey)) {
        newSet.delete(schemeKey);
      } else {
        newSet.add(schemeKey);
      }
      return newSet;
    });
  };

  // Toggle source selection
  const toggleSource = (source) => {
    setSelectedSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(source)) {
        newSet.delete(source);
      } else {
        newSet.add(source);
      }
      return newSet;
    });
  };

  // Clear source selections
  const clearSourceSelections = () => {
    setSelectedSources(new Set());
  };

  // Handle scheme/component detail clicks
  const showAllocationDetails = (item, itemType) => {
    setAllocationDetails(prev => {
      const exists = prev.find(d => d.selectedItem === item && d.itemType === itemType);
      if (exists) {
        return prev.filter(d => !(d.selectedItem === item && d.itemType === itemType));
      } else {
        // Bring this item to the top by putting it first in the array
        const filtered = prev.filter(d => !(d.selectedItem === item && d.itemType === itemType));
        return [{ selectedItem: item, itemType }, ...filtered];
      }
    });
  };

  const showSalesDetails = (item, itemType) => {
    setSalesDetails(prev => {
      const exists = prev.find(d => d.selectedItem === item && d.itemType === itemType);
      if (exists) {
        return prev.filter(d => !(d.selectedItem === item && d.itemType === itemType));
      } else {
        return [...prev, { selectedItem: item, itemType }];
      }
    });
  };

  const showRemainingDetails = (item, itemType) => {
    setRemainingDetails(prev => {
      const exists = prev.find(d => d.selectedItem === item && d.itemType === itemType);
      if (exists) {
        return prev.filter(d => !(d.selectedItem === item && d.itemType === itemType));
      } else {
        return [...prev, { selectedItem: item, itemType }];
      }
    });
  };

  const closeAllocationDetails = (item, itemType) => {
    setAllocationDetails(prev => prev.filter(d => !(d.selectedItem === item && d.itemType === itemType)));
  };

  const closeSalesDetails = (item, itemType) => {
    setSalesDetails(prev => prev.filter(d => !(d.selectedItem === item && d.itemType === itemType)));
  };

  const closeRemainingDetails = (item, itemType) => {
    setRemainingDetails(prev => prev.filter(d => !(d.selectedItem === item && d.itemType === itemType)));
  };

  // Render detailed breakdown for a specific section
  const renderSectionBreakdown = (details, sectionType, closeFunction) => {
    if (!details.selectedItem) return null;

    const itemName = details.selectedItem;
    const filterKey = details.itemType === 'scheme' ? 'scheme_name' : 'component';
    const itemData = tableData.filter(item => item[filterKey] === itemName);

    const getTitle = () => {
      const typeLabel = details.itemType === 'scheme' ? 'योजना' : 'घटक';
      switch(sectionType) {
        case 'allocation': return `${typeLabel} आवंटन विवरण: ${itemName}`;
        case 'sales': return `${typeLabel}वितरण: ${itemName}`;
        case 'remaining': return `${typeLabel} शेष राशि विवरण: ${itemName}`;
        default: return `${itemName} विवरण`;
      }
    };

    return (
      <div className="mt-2 p-2 border rounded bg-light">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0 text-primary">{getTitle()}</h6>
          <Button variant="outline-secondary" size="sm" onClick={closeFunction}>
            <FaTimes />
          </Button>
        </div>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>घटक</th>
              <th>निवेश</th>
              <th>मात्रा</th>
              <th>दर</th>
              <th>आवंटित</th>
            </tr>
          </thead>
          <tbody>
            {itemData.map((record, index) => {
              const allocated = parseFloat(record.allocated_quantity || 0) * parseFloat(record.rate || 0);
              return (
                <tr key={index}>
                  <td>{record.component || 'N/A'}</td>
                  <td>{record.investment_name || 'N/A'}</td>
                  <td>{parseFloat(record.allocated_quantity || 0).toFixed(2)}</td>
                  <td>₹{parseFloat(record.rate || 0).toFixed(2)}</td>
                  <td>₹{allocated.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  };

  // Get filtered data based on selections for scheme/component filter
  const getFilteredData = () => {
    let filteredData = tableData;
    
    if (selectedSchemes.size > 0) {
      filteredData = filteredData.filter(item => selectedSchemes.has(item.scheme_name));
    }
    
    if (selectedComponents.size > 0) {
      filteredData = filteredData.filter(item => selectedComponents.has(item.component));
    }
    
    return filteredData;
  };

  // Get filtered data based on selections for source filter
  const getSourceFilteredData = () => {
    let filteredData = tableData;
    
    if (selectedSources.size > 0) {
      filteredData = filteredData.filter(item => selectedSources.has(item.source_of_receipt));
    }
    
    return filteredData;
  };

  // Get unique values for scheme/component filtered data
  const filteredData = useMemo(() => getFilteredData(), [tableData, selectedSchemes, selectedComponents]);
  
  const filteredUniqueSchemes = useMemo(() => {
    return [...new Set(filteredData.map(item => item.scheme_name))].filter(Boolean).sort();
  }, [filteredData]);

  const filteredUniqueInvestments = useMemo(() => {
    return [...new Set(filteredData.map(item => item.investment_name))].filter(Boolean).sort();
  }, [filteredData]);

  const filteredUniqueComponents = useMemo(() => {
    return [...new Set(filteredData.map(item => item.component))].filter(Boolean).sort();
  }, [filteredData]);

  const filteredUniqueSources = useMemo(() => {
    return [...new Set(filteredData.map(item => item.source_of_receipt))].filter(Boolean).sort();
  }, [filteredData]);

  // Get unique values for source filtered data
  const sourceFilteredData = useMemo(() => getSourceFilteredData(), [tableData, selectedSources]);
  
  const sourceFilteredUniqueSchemes = useMemo(() => {
    return [...new Set(sourceFilteredData.map(item => item.scheme_name))].filter(Boolean).sort();
  }, [sourceFilteredData]);

  const sourceFilteredUniqueInvestments = useMemo(() => {
    return [...new Set(sourceFilteredData.map(item => item.investment_name))].filter(Boolean).sort();
  }, [sourceFilteredData]);

  const sourceFilteredUniqueComponents = useMemo(() => {
    return [...new Set(sourceFilteredData.map(item => item.component))].filter(Boolean).sort();
  }, [sourceFilteredData]);

  const sourceFilteredUniqueSources = useMemo(() => {
    return [...new Set(sourceFilteredData.map(item => item.source_of_receipt))].filter(Boolean).sort();
  }, [sourceFilteredData]);

  // Source filtered totals
  const sourceFilteredTotals = useMemo(() => {
    const totalAllocated = sourceFilteredData.reduce((sum, item) =>
      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
    const totalUpdated = sourceFilteredData.reduce((sum, item) =>
      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
    const totalRemaining = totalAllocated - totalUpdated;
    
    return {
      totalAllocated,
      totalUpdated,
      totalRemaining,
      placesCount: sourceFilteredData.length
    };
  }, [sourceFilteredData]);

  const filteredTotals = useMemo(() => {
    const totalAllocated = filteredData.reduce((sum, item) =>
      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
    const totalUpdated = filteredData.reduce((sum, item) =>
      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
    const totalRemaining = totalAllocated - totalUpdated;
    
    return {
      totalAllocated,
      totalUpdated,
      totalRemaining,
      placesCount: filteredData.length
    };
  }, [filteredData]);

  // Get color for the center
  const centerColor = useMemo(() => {
    const colors = generateCenterColors(1);
    return colors[0];
  }, []);

  const textColor = getContrastColor(centerColor);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="table-details-modal compact-modal-cards"
      dialogClassName="modal-90w"
    >
      <Modal.Header closeButton onClick={onHide} className="modal-title">
        <div className="d-flex justify-content-between align-items-center w-100">
          <Modal.Title>{centerName}</Modal.Title>
          <div className="d-flex gap-2">
            <Button className="exel-file"
              variant="outline-success"
              size="sm"
              onClick={exportToExcel}
              title="Excel में निर्यात करें"
            >
              <FaFileExcel className="me-1 exel-file" />
              Excel
            </Button>
            <Button className="pdf-file"
              variant="outline-danger"
              size="sm"
              onClick={openPDFView}
              title="PDF व्यू खोलें"
            >
              <FaFilePdf className="me-1 pdf-file" />
              PDF View
            </Button>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body>
        {/* Summary Statistics Cards - Always Visible at Top */}
        <Card className="mb-3">
          <Card.Header className="fillter-heading">
            <h6 className="mb-0"><FaChartBar className="me-2" /> सारांश आँकड़े</h6>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={2}>
                <div
                  className="text-center summary-card border rounded clickable-card"
                  onClick={() => toggleCollapse('hierarchy')}
                  style={{ cursor: 'pointer' }}
                  title="क्लिक करें: विधानसभा और विकासखंड देखें"
                >
                  <FaGavel size={16} className="text-primary mb-1" />
                  <h5 className="text-primary mb-1">{uniqueVidhanSabhas.length}</h5>
                  <small className="text-muted">विधानसभा</small>
                </div>
              </Col>
              <Col md={2}>
                <div
                  className="text-center summary-card border rounded clickable-card"
                  onClick={() => toggleCollapse('hierarchy')}
                  style={{ cursor: 'pointer' }}
                  title="क्लिक करें: विकासखंड और विधानसभा देखें"
                >
                  <FaMapMarkerAlt size={16} className="text-success mb-1" />
                  <h5 className="text-success mb-1">{uniqueVikasKhands.length}</h5>
                  <small className="text-muted">विकासखंड</small>
                </div>
              </Col>
              <Col md={2}>
                <div
                  className="text-center summary-card border rounded clickable-card"
                  onClick={() => toggleCollapse('filter')}
                  style={{ cursor: 'pointer' }}
                  title="क्लिक करें: योजनाएं और निवेश देखें"
                >
                  <FaPiggyBank size={16} className="text-info mb-1" />
                  <h5 className="text-info mb-1">{uniqueSchemes.length}</h5>
                  <small className="text-muted">योजनाएं</small>
                </div>
              </Col>
              <Col md={2}>
                <div
                  className="text-center summary-card border rounded clickable-card"
                  onClick={() => toggleCollapse('filter')}
                  style={{ cursor: 'pointer' }}
                  title="क्लिक करें: निवेश और योजनाएं देखें"
                >
                  <FaPuzzlePiece size={16} className="text-warning mb-1" />
                  <h5 className="text-warning mb-1">{uniqueInvestments.length}</h5>
                  <small className="text-muted">निवेश</small>
                </div>
              </Col>
              <Col md={2}>
                <div
                  className="text-center summary-card border rounded clickable-card"
                  onClick={() => toggleCollapse('filter')}
                  style={{ cursor: 'pointer' }}
                  title="क्लिक करें: घटक और योजनाएं देखें"
                >
                  <FaLayerGroup size={16} className="text-secondary mb-1" />
                  <h5 className="text-secondary mb-1">{uniqueComponents.length}</h5>
                  <small className="text-muted">घटक</small>
                </div>
              </Col>
              <Col md={2}>
                <div
                  className="text-center summary-card border rounded clickable-card"
                  onClick={() => toggleCollapse('sources')}
                  style={{ cursor: 'pointer' }}
                  title="क्लिक करें: स्रोत और योजनाएं देखें"
                >
                  <FaTags size={16} className="text-dark mb-1" />
                  <h5 className="text-dark mb-1">{uniqueSources.length}</h5>
                  <small className="text-muted">स्रोत</small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Center Information Header */}
        <Card className="mb-3" style={{ backgroundColor: centerColor, border: '1px solid rgba(0,0,0,0.125)' }}>
          <Card.Header style={{ backgroundColor: centerColor, color: textColor, borderBottom: '1px solid rgba(0,0,0,0.125)' }}>
            <Row>
              <Col md={6}>
                <div className="modal-card-title">{centerName}</div>
              </Col>
              <Col md={6} className="text-end">
                <div className="d-flex flex-row align-items-end">
                  <span
                    className="badge bg-light text-dark mb-1 clickable-badge"
                    title={`विकासखंड: ${totals.placesCount} - इस केंद्र में शामिल अद्वितीय विकासखंड | कुल रिकॉर्ड: ${totals.recordsCount} | क्लिक करें विवरण देखने के लिए`}
                    data-bs-toggle="tooltip"
                    data-bs-placement="left"
                    onClick={() => toggleCollapse('places')}
                    style={{ cursor: 'pointer' }}
                  >
                    विकासखंड: {totals.placesCount}
                  </span>
                  <span
                    className="badge bg-light text-dark mb-1 clickable-badge"
                    title={`कुल आवंटित राशि: ${formatCurrency(totals.totalAllocated)} - सभी मदों के लिए आवंटित धनराशि | क्लिक करें विवरण देखने के लिए`}
                    data-bs-toggle="tooltip"
                    data-bs-placement="left"
                    onClick={() => toggleCollapse('allocation')}
                    style={{ cursor: 'pointer' }}
                  >
                    कुल आवंटित: {formatCurrency(totals.totalAllocated)}
                  </span>
                  <span
                    className="badge bg-light text-dark mb-1 clickable-badge"
                    title={`कुल वितरण राशि: ${formatCurrency(totals.totalUpdated)} - अब तक वितरण धनराशि | क्लिक करें विवरण देखने के लिए`}
                    data-bs-toggle="tooltip"
                    data-bs-placement="left"
                    onClick={() => toggleCollapse('sales')}
                    style={{ cursor: 'pointer' }}
                  >
                    कुल बेचा गया: {formatCurrency(totals.totalUpdated)}
                  </span>
                  <span
                    className="badge bg-light text-dark clickable-badge"
                    title={`शेष राशि: ${formatCurrency(totals.totalRemaining)} - अभी भी बेचने के लिए शेष धनराशि | क्लिक करें विवरण देखने के लिए`}
                    data-bs-toggle="tooltip"
                    data-bs-placement="left"
                    onClick={() => toggleCollapse('remaining')}
                    style={{ cursor: 'pointer' }}
                  >
                    शेष राशि: {formatCurrency(totals.totalRemaining)}
                  </span>
                </div>
              </Col>
            </Row>
          </Card.Header>
        </Card>

        {/* Places Breakdown Section */}
        <Card className="mb-3" id="places-section">
          <Card.Header
            onClick={() => toggleCollapse('places')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaBuilding className="me-2" /> विकासखंड</span>
            <div className="d-flex align-items-center gap-2">
              {collapsedSections.places ? <FaChevronDown /> : <FaChevronUp />}
              <Button className="pdf-file"
                variant="outline-success"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const placesData = uniqueVikasKhands.map(location => ({
                    'विकासखंड': location,
                    'कुल रिकॉर्ड': tableData.filter(item => item.vikas_khand_name === location).length
                  }));
                  exportSectionToExcel('स्थान_विवरण', placesData);
                }}
                title="स्थान Excel में निर्यात"
              >
                <FaFileExcel className="exel-file"/>
              </Button>
              <Button className="pdf-file"
                variant="outline-danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const placesData = uniqueVikasKhands.map(location => ({
                    'विकासखंड': location,
                    'कुल रिकॉर्ड': tableData.filter(item => item.vikas_khand_name === location).length
                  }));
                  exportSectionToPDF('स्थान_विवरण', placesData);
                }}
                title="स्थान PDF में निर्यात"
              >
                <FaFilePdf  />
              </Button>
              <Button className="pdf-file"
                variant="outline-info"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openPlacesPDFView();
                }}
                title="स्थान PDF व्यू खोलें"
              >
                <FaEye  />
              </Button>
            </div>
          </Card.Header>
          <Collapse in={!collapsedSections.places}>
            <Card.Body>
              <div className="text-center mb-2">
                <h6 className="text-primary fw-bold">विकासखंड: {uniqueVikasKhands.length}</h6>
              </div>
              <div className="places-grid">
                {uniqueVikasKhands.map((vikasKhand, index) => (
                  <Badge
                    key={index}
                    bg={selectedVikasKhand === vikasKhand ? "success" : "primary"}
                    className="me-2 mb-2 p-2 clickable-badge"
                    style={{ fontSize: '14px', cursor: 'pointer' }}
                    onClick={() => setSelectedVikasKhand(selectedVikasKhand === vikasKhand ? null : vikasKhand)}
                    title={selectedVikasKhand === vikasKhand ? "क्लिक करें तालिका बंद करने के लिए" : "क्लिक करें तालिका देखने के लिए"}
                  >
                    {vikasKhand}
                    {selectedVikasKhand === vikasKhand && <span className="ms-1">✓</span>}
                  </Badge>
                ))}
              </div>

              {/* Vikas Khand Details Table */}
              {selectedVikasKhand && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="text-success fw-bold mb-0">{selectedVikasKhand} - विवरण</h6>
                    <Button variant="outline-secondary" size="sm" onClick={() => setSelectedVikasKhand(null)}>
                      <FaTimes />
                    </Button>
                  </div>
                  <Table striped bordered hover size="sm" className="vikas-khand-table">
                    <thead>
                      <tr>
                        <th>घटक</th>
                        <th>निवेश</th>
                        <th>मात्रा</th>
                        <th>दर</th>
                        <th>आवंटित</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData
                        .filter(item => item.vikas_khand_name === selectedVikasKhand)
                        .map((item, index) => {
                          const allocated = parseFloat(item.allocated_quantity) * parseFloat(item.rate);
                          return (
                            <tr key={index}>
                              <td>{item.component || 'N/A'}</td>
                              <td>{item.investment_name || 'N/A'}</td>
                              <td>{parseFloat(item.allocated_quantity || 0).toFixed(2)}</td>
                              <td>₹{parseFloat(item.rate || 0).toFixed(2)}</td>
                              <td>₹{allocated.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Collapse>
        </Card>

        {/* Allocation Breakdown Section */}
        <Card className="mb-3" id="allocation-section">
          <Card.Header
            onClick={() => toggleCollapse('allocation')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaPiggyBank className="me-2" /> आवंटन विवरण</span>
            <div className="d-flex align-items-center gap-2">
              {collapsedSections.allocation ? <FaChevronDown /> : <FaChevronUp />}
              <Button className="pdf-file"
                variant="outline-success"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  
                  // Include detailed breakdown data only
                  const breakdownData = [];
                  allocationDetails.forEach(detail => {
                    if (detail.selectedItem) {
                      const itemName = detail.selectedItem;
                      const filterKey = detail.itemType === 'scheme' ? 'scheme_name' : 'component';
                      const itemData = tableData.filter(item => item[filterKey] === itemName);
                      
                      itemData.forEach(record => {
                        breakdownData.push({
                          'योजना/घटक': itemName,
                          'विधानसभा': record.vidhan_sabha_name,
                          'विकासखंड': record.vikas_khand_name,
                          'स्रोत': record.source_of_receipt,
                          'निवेश': record.investment_name,
                          'घटक': record.component,
                          'मात्रा': record.allocated_quantity,
                          'दर': record.rate,
                          'आवंटित राशि': formatCurrency(parseFloat(record.allocated_quantity) * parseFloat(record.rate))
                        });
                      });
                    }
                  });
                  
                  exportSectionToExcel('आवंटन_विवरण', breakdownData);
                }}
                title="आवंटन Excel में निर्यात (विस्तृत विवरण)"
              >
                <FaFileExcel />
              </Button>
              <Button className="pdf-file"
                variant="outline-danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  
                  // Include detailed breakdown data only for PDF
                  const breakdownData = [];
                  allocationDetails.forEach(detail => {
                    if (detail.selectedItem) {
                      const itemName = detail.selectedItem;
                      const filterKey = detail.itemType === 'scheme' ? 'scheme_name' : 'component';
                      const itemData = tableData.filter(item => item[filterKey] === itemName);
                      
                      itemData.forEach(record => {
                        breakdownData.push({
                          'योजना/घटक': itemName,
                          'विधानसभा': record.vidhan_sabha_name,
                          'विकासखंड': record.vikas_khand_name,
                          'स्रोत': record.source_of_receipt,
                          'निवेश': record.investment_name,
                          'घटक': record.component,
                          'मात्रा': record.allocated_quantity,
                          'दर': record.rate,
                          'आवंटित राशि': formatCurrency(parseFloat(record.allocated_quantity) * parseFloat(record.rate))
                        });
                      });
                    }
                  });
                  
                  exportSectionToPDF('आवंटन_विवरण', breakdownData);
                }}
                title="आवंटन PDF में निर्यात (विस्तृत विवरण)"
              >
                <FaFilePdf />
              </Button>
              <Button className="pdf-file"
                variant="outline-info"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openAllocationPDFView();
                }}
                title="आवंटन PDF व्यू खोलें"
              >
                <FaEye  />
              </Button>
            </div>
          </Card.Header>
          <Collapse in={!collapsedSections.allocation}>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6 className="text-info fw-bold mb-2">योजना अनुसार आवंटन</h6>
                  {uniqueSchemes.map((scheme, index) => {
                    const schemeData = tableData.filter(item => item.scheme_name === scheme);
                    const totalAllocated = schemeData.reduce((sum, item) =>
                      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
                    const isSelected = allocationDetails.some(d => d.selectedItem === scheme && d.itemType === 'scheme');
                    return (
                      <div
                        key={index}
                        className={`mb-2 p-2 border rounded clickable-detail-item compact-detail-item ${isSelected ? 'selected-detail' : ''}`}
                        onClick={() => showAllocationDetails(scheme, 'scheme')}
                        style={{ cursor: 'pointer' }}
                        title="क्लिक करें विस्तृत आवंटन विवरण देखने के लिए"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{scheme}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-info">{formatCurrency(totalAllocated)}</span>
                          </div>
                        </div>
                        <small className="text-muted">{schemeData.length} रिकॉर्ड</small>
                      </div>
                    );
                  })}
                </Col>
                <Col md={6}>
                  <h6 className="text-warning fw-bold mb-2">घटक अनुसार आवंटन</h6>
                  {uniqueComponents.map((component, index) => {
                    const componentData = tableData.filter(item => item.component === component);
                    const totalAllocated = componentData.reduce((sum, item) =>
                      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
                    const isSelected = allocationDetails.some(d => d.selectedItem === component && d.itemType === 'component');
                    return (
                      <div
                        key={index}
                        className={`mb-2 p-2 border rounded clickable-detail-item compact-detail-item ${isSelected ? 'selected-detail' : ''}`}
                        onClick={() => showAllocationDetails(component, 'component')}
                        style={{ cursor: 'pointer' }}
                        title="क्लिक करें विस्तृत आवंटन विवरण देखने के लिए"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{component}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-warning">{formatCurrency(totalAllocated)}</span>
                          </div>
                        </div>
                        <small className="text-muted">{componentData.length} रिकॉर्ड</small>
                      </div>
                    );
                  })}
                </Col>
              </Row>
              {allocationDetails.map(detail => renderSectionBreakdown(detail, 'allocation', () => closeAllocationDetails(detail.selectedItem, detail.itemType)))}
            </Card.Body>
          </Collapse>
        </Card>

        {/* Sales Breakdown Section */}
        <Card className="mb-3" id="sales-section">
          <Card.Header
            onClick={() => toggleCollapse('sales')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaChartBar className="me-2" />वितरण</span>
            <div className="d-flex align-items-center gap-2">
              {collapsedSections.sales ? <FaChevronDown /> : <FaChevronUp />}
              <Button className="exel-file"
                variant="outline-success"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  
                  // Include detailed breakdown data only
                  const breakdownData = [];
                  salesDetails.forEach(detail => {
                    if (detail.selectedItem) {
                      const itemName = detail.selectedItem;
                      const filterKey = detail.itemType === 'scheme' ? 'scheme_name' : 'component';
                      const itemData = tableData.filter(item => item[filterKey] === itemName);
                      
                      itemData.forEach(record => {
                        breakdownData.push({
                          'योजना/घटक': itemName,
                          'विधानसभा': record.vidhan_sabha_name,
                          'विकासखंड': record.vikas_khand_name,
                          'स्रोत': record.source_of_receipt,
                          'निवेश': record.investment_name,
                          'घटक': record.component,
                          'वितरण मात्रा': record.updated_quantity,
                          'दर': record.rate,
                          'वितरण राशि': formatCurrency(parseFloat(record.updated_quantity) * parseFloat(record.rate))
                        });
                      });
                    }
                  });
                  
                  exportSectionToExcel('वितरण_विवरण', breakdownData);
                }}
                title="वितरण Excel में निर्यात (विस्तृत विवरण)"
              >
                <FaFileExcel />
              </Button>
              <Button className="pdf-file"
                variant="outline-danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  
                  // Include detailed breakdown data only for PDF
                  const breakdownData = [];
                  salesDetails.forEach(detail => {
                    if (detail.selectedItem) {
                      const itemName = detail.selectedItem;
                      const filterKey = detail.itemType === 'scheme' ? 'scheme_name' : 'component';
                      const itemData = tableData.filter(item => item[filterKey] === itemName);
                      
                      itemData.forEach(record => {
                        breakdownData.push({
                          'योजना/घटक': itemName,
                          'विधानसभा': record.vidhan_sabha_name,
                          'विकासखंड': record.vikas_khand_name,
                          'स्रोत': record.source_of_receipt,
                          'निवेश': record.investment_name,
                          'घटक': record.component,
                          'वितरण मात्रा': record.updated_quantity,
                          'दर': record.rate,
                          'वितरण राशि': formatCurrency(parseFloat(record.updated_quantity) * parseFloat(record.rate))
                        });
                      });
                    }
                  });
                  
                  exportSectionToPDF('वितरण_विवरण', breakdownData);
                }}
                title="वितरण PDF में निर्यात (विस्तृत विवरण)"
              >
                <FaFilePdf />
              </Button>
              <Button className="pdf-file"
                variant="outline-info"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openSalesPDFView();
                }}
                title="वितरण PDF व्यू खोलें"
              >
                <FaEye  />
              </Button>
            </div>
          </Card.Header>
          <Collapse in={!collapsedSections.sales}>
            <Card.Body>
              <div className="text-center mb-2">
                <div className="alert alert-warning">
                  <h6>कुल वितरण राशि: {formatCurrency(totals.totalUpdated)}</h6>
                  <p className="mb-0">वर्तमान में कोई वितरण रिकॉर्ड नहीं है</p>
                </div>
              </div>
              <Row>
                <Col md={6}>
                  <h6 className="text-secondary fw-bold mb-2">योजना अनुसार वितरण</h6>
                  {uniqueSchemes.map((scheme, index) => {
                    const schemeData = tableData.filter(item => item.scheme_name === scheme);
                    const totalSold = schemeData.reduce((sum, item) =>
                      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
                    const isSelected = salesDetails.some(d => d.selectedItem === scheme && d.itemType === 'scheme');
                    return (
                      <div
                        key={index}
                        className={`mb-2 p-2 border rounded clickable-detail-item compact-detail-item ${isSelected ? 'selected-detail' : ''}`}
                        onClick={() => showSalesDetails(scheme, 'scheme')}
                        style={{ cursor: 'pointer' }}
                        title="क्लिक करें विस्तृत वितरणदेखने के लिए"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{scheme}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-secondary">{formatCurrency(totalSold)}</span>
                          </div>
                        </div>
                        <small className="text-muted">{schemeData.length} रिकॉर्ड</small>
                      </div>
                    );
                  })}
                </Col>
                <Col md={6}>
                  <h6 className="text-dark fw-bold mb-2">घटक अनुसार वितरण</h6>
                  {uniqueComponents.map((component, index) => {
                    const componentData = tableData.filter(item => item.component === component);
                    const totalSold = componentData.reduce((sum, item) =>
                      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
                    const isSelected = salesDetails.some(d => d.selectedItem === component && d.itemType === 'component');
                    return (
                      <div
                        key={index}
                        className={`mb-2 p-2 border rounded clickable-detail-item compact-detail-item ${isSelected ? 'selected-detail' : ''}`}
                        onClick={() => showSalesDetails(component, 'component')}
                        style={{ cursor: 'pointer' }}
                        title="क्लिक करें विस्तृत वितरण देखने के लिए"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{component}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-dark">{formatCurrency(totalSold)}</span>
                          </div>
                        </div>
                        <small className="text-muted">{componentData.length} रिकॉर्ड</small>
                      </div>
                    );
                  })}
                </Col>
              </Row>
              {salesDetails.map(detail => renderSectionBreakdown(detail, 'sales', () => closeSalesDetails(detail.selectedItem, detail.itemType)))}
            </Card.Body>
          </Collapse>
        </Card>

        {/* Remaining Amount Breakdown Section */}
        <Card className="mb-3" id="remaining-section">
          <Card.Header
            onClick={() => toggleCollapse('remaining')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaLayerGroup className="me-2" /> शेष राशि विवरण</span>
            <div className="d-flex align-items-center gap-2">
              {collapsedSections.remaining ? <FaChevronDown /> : <FaChevronUp />}
              <Button className="exel-file"
                variant="outline-success"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  
                  // Include detailed breakdown data only
                  const breakdownData = [];
                  remainingDetails.forEach(detail => {
                    if (detail.selectedItem) {
                      const itemName = detail.selectedItem;
                      const filterKey = detail.itemType === 'scheme' ? 'scheme_name' : 'component';
                      const itemData = tableData.filter(item => item[filterKey] === itemName);
                      
                      itemData.forEach(record => {
                        const allocated = parseFloat(record.allocated_quantity) * parseFloat(record.rate);
                        const sold = parseFloat(record.updated_quantity) * parseFloat(record.rate);
                        const remaining = allocated - sold;
                        
                        breakdownData.push({
                          'योजना/घटक': itemName,
                          'विधानसभा': record.vidhan_sabha_name,
                          'विकासखंड': record.vikas_khand_name,
                          'स्रोत': record.source_of_receipt,
                          'निवेश': record.investment_name,
                          'घटक': record.component,
                          'आवंटित': formatCurrency(allocated),
                          'बेचा गया': formatCurrency(sold),
                          'शेष राशि': formatCurrency(remaining)
                        });
                      });
                    }
                  });
                  
                  exportSectionToExcel('शेष_राशि_विवरण', breakdownData);
                }}
                title="शेष राशि Excel में निर्यात (विस्तृत विवरण)"
              >
                <FaFileExcel />
              </Button>
              <Button className="exel-file"
                variant="outline-danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  
                  // Include detailed breakdown data only for PDF
                  const breakdownData = [];
                  remainingDetails.forEach(detail => {
                    if (detail.selectedItem) {
                      const itemName = detail.selectedItem;
                      const filterKey = detail.itemType === 'scheme' ? 'scheme_name' : 'component';
                      const itemData = tableData.filter(item => item[filterKey] === itemName);
                      
                      itemData.forEach(record => {
                        const allocated = parseFloat(record.allocated_quantity) * parseFloat(record.rate);
                        const sold = parseFloat(record.updated_quantity) * parseFloat(record.rate);
                        const remaining = allocated - sold;
                        
                        breakdownData.push({
                          'योजना/घटक': itemName,
                          'विधानसभा': record.vidhan_sabha_name,
                          'विकासखंड': record.vikas_khand_name,
                          'स्रोत': record.source_of_receipt,
                          'निवेश': record.investment_name,
                          'घटक': record.component,
                          'आवंटित': formatCurrency(allocated),
                          'बेचा गया': formatCurrency(sold),
                          'शेष राशि': formatCurrency(remaining)
                        });
                      });
                    }
                  });
                  
                  exportSectionToPDF('शेष_राशि_विवरण', breakdownData);
                }}
                title="शेष राशि PDF में निर्यात (विस्तृत विवरण)"
              >
                <FaFilePdf />
              </Button>
              <Button className="pdf-file"
                variant="outline-info"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openRemainingPDFView();
                }}
                title="शेष राशि PDF व्यू खोलें"
              >
                <FaEye  />
              </Button>
            </div>
          </Card.Header>
          <Collapse in={!collapsedSections.remaining}>
            <Card.Body>
              <div className="text-center mb-2">
                <div className="alert alert-success">
                  <h6>कुल शेष राशि: {formatCurrency(totals.totalRemaining)}</h6>
                  <p className="mb-0">बेचने के लिए उपलब्ध राशि</p>
                </div>
              </div>
              <Row>
                <Col md={6}>
                  <h6 className="text-primary fw-bold mb-2">योजना अनुसार शेष</h6>
                  {uniqueSchemes.map((scheme, index) => {
                    const schemeData = tableData.filter(item => item.scheme_name === scheme);
                    const totalAllocated = schemeData.reduce((sum, item) =>
                      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
                    const totalSold = schemeData.reduce((sum, item) =>
                      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
                    const remaining = totalAllocated - totalSold;
                    const isSelected = remainingDetails.some(d => d.selectedItem === scheme && d.itemType === 'scheme');
                    return (
                      <div
                        key={index}
                        className={`mb-2 p-2 border rounded clickable-detail-item compact-detail-item ${isSelected ? 'selected-detail' : ''}`}
                        onClick={() => showRemainingDetails(scheme, 'scheme')}
                        style={{ cursor: 'pointer' }}
                        title="क्लिक करें विस्तृत शेष राशि विवरण देखने के लिए"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{scheme}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-primary">{formatCurrency(remaining)}</span>
                          </div>
                        </div>
                        <small className="text-muted single-line-data">
                          <span className="data-item">आवंटित: <strong>{formatCurrency(totalAllocated)}</strong></span>
                          <span className="separator">|</span>
                          <span className="data-item">बेचा: <strong>{formatCurrency(totalSold)}</strong></span>
                        </small>
                      </div>
                    );
                  })}
                </Col>
                <Col md={6}>
                  <h6 className="text-info fw-bold mb-2">घटक अनुसार शेष</h6>
                  {uniqueComponents.map((component, index) => {
                    const componentData = tableData.filter(item => item.component === component);
                    const totalAllocated = componentData.reduce((sum, item) =>
                      sum + (parseFloat(item.allocated_quantity) * parseFloat(item.rate)), 0);
                    const totalSold = componentData.reduce((sum, item) =>
                      sum + (parseFloat(item.updated_quantity) * parseFloat(item.rate)), 0);
                    const remaining = totalAllocated - totalSold;
                    const isSelected = remainingDetails.some(d => d.selectedItem === component && d.itemType === 'component');
                    return (
                      <div
                        key={index}
                        className={`mb-2 p-2 border rounded clickable-detail-item compact-detail-item ${isSelected ? 'selected-detail' : ''}`}
                        onClick={() => showRemainingDetails(component, 'component')}
                        style={{ cursor: 'pointer' }}
                        title="क्लिक करें विस्तृत शेष राशि विवरण देखने के लिए"
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-bold">{component}</span>
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-info">{formatCurrency(remaining)}</span>
                          </div>
                        </div>
                        <small className="text-muted single-line-data">
                          <span className="data-item">आवंटित: <strong>{formatCurrency(totalAllocated)}</strong></span>
                          <span className="separator">|</span>
                          <span className="data-item">बेचा: <strong>{formatCurrency(totalSold)}</strong></span>
                        </small>
                      </div>
                    );
                  })}
                </Col>
              </Row>
              {remainingDetails.map(detail => renderSectionBreakdown(detail, 'remaining', () => closeRemainingDetails(detail.selectedItem, detail.itemType)))}
            </Card.Body>
          </Collapse>
        </Card>


        {/* Hierarchical Structure Section */}
        <Card className="mb-3" id="hierarchy-section">
          <Card.Header
            onClick={() => toggleCollapse('hierarchy')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaList className="me-2" /> पदानुक्रमिक संरचना</span>
            <div className="d-flex align-items-center gap-2">
              {collapsedSections.hierarchy ? <FaChevronDown /> : <FaChevronUp />}
              <Button className="exel-file"
                variant="outline-success"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const hierarchyData = [];
                  Object.entries(hierarchicalData).forEach(([vidhanSabha, data]) => {
                    data.schemes.forEach(scheme => {
                      const schemeInvestments = data.schemeInvestments[scheme] || [];
                      schemeInvestments.forEach(investment => {
                        hierarchyData.push({
                          'विधानसभा': vidhanSabha,
                          'योजना': scheme,
                          'निवेश': investment
                        });
                      });
                    });
                  });
                  exportSectionToExcel('पदानुक्रमिक_संरचना', hierarchyData);
                }}
                title="पदानुक्रमिक संरचना Excel में निर्यात"
              >
                <FaFileExcel />
              </Button>
              <Button className="pdf-file"
                variant="outline-danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const hierarchyData = [];
                  Object.entries(hierarchicalData).forEach(([vidhanSabha, data]) => {
                    data.schemes.forEach(scheme => {
                      const schemeInvestments = data.schemeInvestments[scheme] || [];
                      schemeInvestments.forEach(investment => {
                        hierarchyData.push({
                          'विधानसभा': vidhanSabha,
                          'योजना': scheme,
                          'निवेश': investment
                        });
                      });
                    });
                  });
                  exportSectionToPDF('पदानुक्रमिक_संरचना', hierarchyData);
                }}
                title="पदानुक्रमिक संरचना PDF में निर्यात"
              >
                <FaFilePdf />
              </Button>
              <Button className="pdf-file"
                variant="outline-info"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openHierarchyPDFView();
                }}
                title="पदानुक्रमिक संरचना PDF व्यू खोलें"
              >
                <FaEye  />
              </Button>
            </div>
          </Card.Header>
          <Collapse in={!collapsedSections.hierarchy}>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="hierarchy-section">
                    <h6 className="text-primary fw-bold mb-2">विधानसभा → विकासखंड</h6>
                    {Object.entries(hierarchicalData).map(([vidhanSabha, data]) => (
                      <div key={vidhanSabha} className="mb-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">{vidhanSabha}</span>
                          <span className="badge bg-light text-dark">{data.vikasKhands.length}</span>
                        </div>
                        <div className="compact-badges">
                          {data.vikasKhands.map((vikasKhand, index) => {
                            const tooltipData = getTooltipData('vikasKhand', vikasKhand, tableData);
                            const tooltipContent = getTooltipContent('vikasKhand', vikasKhand, tooltipData, tableData);
                            
                            return (
                              <Badge
                                key={index}
                                bg="light"
                                text="dark"
                                className="me-1 small"
                                title={tooltipContent}
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                              >
                                {vikasKhand}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="hierarchy-section">
                    <h6 className="text-success fw-bold mb-2">योजनाएं → निवेश</h6>
                    {Object.entries(hierarchicalData).map(([vidhanSabha, data]) => (
                      <div key={vidhanSabha} className="mb-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-bold">{vidhanSabha}</span>
                          <span className="badge bg-light text-dark">{data.schemes.length}</span>
                        </div>
                        <div className="compact-list">
                          {data.schemes.map((scheme, index) => {
                            const schemeKey = `${vidhanSabha}-${scheme}`;
                            const isCollapsed = collapsedSchemes.has(schemeKey);
                            const schemeInvestments = data.schemeInvestments[scheme] || [];
                            
                            return (
                              <div key={index} className="compact-item">
                                <div
                                  className="scheme-header"
                                  onClick={() => toggleSchemeCollapse(schemeKey)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <span className="scheme-name">{scheme}</span>
                                  <span className="investment-count">({schemeInvestments.length})</span>
                                  <span className="collapse-indicator">
                                    {isCollapsed ? '▼' : '▶'}
                                  </span>
                                </div>
                                <div className={`investment-badges ${isCollapsed ? 'show' : 'hide'}`}>
                                  {schemeInvestments.map((investment, invIndex) => {
                                    const tooltipData = getTooltipData('investment', investment, tableData);
                                    const tooltipContent = getTooltipContent('investment', investment, tooltipData, tableData);
                                    
                                    return (
                                      <Badge
                                        key={invIndex}
                                        bg="light"
                                        text="dark"
                                        className="me-1 small"
                                        title={tooltipContent}
                                        data-bs-toggle="tooltip"
                                        data-bs-placement="top"
                                      >
                                        {investment}
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Collapse>
        </Card>

        {/* Multi-Select Filtering Section */}
        <Card className="mb-3" id="filter-section">
          <Card.Header
            onClick={() => toggleCollapse('filter')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaPiggyBank className="me-2" /> योजनाएं और निवेश फ़िल्टर</span>
            <div className="d-flex align-items-center gap-2">
              {collapsedSections.filter ? <FaChevronDown /> : <FaChevronUp />}
              <Button className="pdf-file"
                variant="outline-info"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openFilterPDFView();
                }}
                title="फ़िल्टर PDF व्यू खोलें"
              >
                <FaEye  />
              </Button>
            </div>
          </Card.Header>
          <Collapse in={!collapsedSections.filter}>
            <Card.Body>
              <Row>
                {/* Left Side: Selection Panel */}
                <Col md={6}>
                  <div className="selection-panel">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">फ़िल्टर विकल्प</h6>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={clearSelections}
                        disabled={selectedSchemes.size === 0 && selectedComponents.size === 0}
                      >
                        सभी हटाएं
                      </Button>
                    </div>
                    
                    {/* Schemes Selection */}
                    <div className="mb-3">
                      <h6 className="fw-bold mb-2 text-info">सभी योजनाएं ({uniqueSchemes.length})</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {uniqueSchemes.map((scheme, index) => {
                          const tooltipData = getTooltipData('scheme', scheme, tableData);
                          const tooltipContent = getTooltipContent('scheme', scheme, tooltipData, tableData);
                          
                          return (
                            <Badge
                              key={index}
                              bg={selectedSchemes.has(scheme) ? "info" : "light"}
                              text={selectedSchemes.has(scheme) ? "dark" : "dark"}
                              className="p-2 selectable-badge"
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleScheme(scheme)}
                              title={selectedSchemes.has(scheme) ? "हटाएं" : "चुनें"}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                            >
                              {scheme}
                              {selectedSchemes.has(scheme) && <span className="ms-1">✓</span>}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Components Selection */}
                    <div>
                      <h6 className="fw-bold mb-2 text-secondary">घटक ({uniqueComponents.length})</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {uniqueComponents.map((component, index) => {
                          const tooltipData = getTooltipData('component', component, tableData);
                          const tooltipContent = getTooltipContent('component', component, tooltipData, tableData);
                          
                          return (
                            <Badge
                              key={index}
                              bg={selectedComponents.has(component) ? "secondary" : "light"}
                              text={selectedComponents.has(component) ? "light" : "dark"}
                              className="p-2 selectable-badge"
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleComponent(component)}
                              title={selectedComponents.has(component) ? "हटाएं" : "चुनें"}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                            >
                              {component}
                              {selectedComponents.has(component) && <span className="ms-1">✓</span>}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Right Side: Filtered Results */}
                <Col md={6}>
                  <div className="results-panel">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">फ़िल्टर्ड परिणाम</h6>
                      <div className="text-end">
                        <small className="text-muted">
                          चयनित: {selectedSchemes.size + selectedComponents.size}
                        </small>
                      </div>
                    </div>

                    {/* Filtered Summary */}
                    <div className="mb-3">
                      <div className="bg-light p-2 rounded">
                        <div className="row text-center">
                          <div className="col-4">
                            <div className="fw-bold text-info">{filteredData.length}</div>
                            <small className="text-muted">रिकॉर्ड</small>
                          </div>
                          <div className="col-4">
                            <div className="fw-bold text-success">{formatCurrency(filteredTotals.totalAllocated)}</div>
                            <small className="text-muted">आवंटित</small>
                          </div>
                          <div className="col-4">
                            <div className="fw-bold text-warning">{formatCurrency(filteredTotals.totalUpdated)}</div>
                            <small className="text-muted">बेचा गया</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Filtered Categories Grid */}
                    <div className="filtered-categories-grid">
                      {/* Filtered Schemes */}
                      {filteredUniqueSchemes.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaPiggyBank className="me-1 text-info" />
                            <h6 className="fw-bold mb-1 text-info">योजनाएं ({filteredUniqueSchemes.length})</h6>
                          </div>
                          <div className="category-content">
                            {filteredUniqueSchemes.map((scheme, index) => {
                              const tooltipData = getTooltipData('scheme', scheme, filteredData);
                              const tooltipContent = getTooltipContent('scheme', scheme, tooltipData, filteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-info text-white"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {scheme}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Filtered Investments */}
                      {filteredUniqueInvestments.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaPuzzlePiece className="me-1 text-warning" />
                            <h6 className="fw-bold mb-1 text-warning">निवेश ({filteredUniqueInvestments.length})</h6>
                          </div>
                          <div className="category-content">
                            {filteredUniqueInvestments.map((investment, index) => {
                              const tooltipData = getTooltipData('investment', investment, filteredData);
                              const tooltipContent = getTooltipContent('investment', investment, tooltipData, filteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-warning text-dark"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {investment}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Filtered Components */}
                      {filteredUniqueComponents.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaLayerGroup className="me-1 text-secondary" />
                            <h6 className="fw-bold mb-1 text-secondary">घटक ({filteredUniqueComponents.length})</h6>
                          </div>
                          <div className="category-content">
                            {filteredUniqueComponents.map((component, index) => {
                              const tooltipData = getTooltipData('component', component, filteredData);
                              const tooltipContent = getTooltipContent('component', component, tooltipData, filteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-secondary text-light"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {component}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Filtered Sources */}
                      {filteredUniqueSources.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaTags className="me-1 text-dark" />
                            <h6 className="fw-bold mb-1 text-dark">स्रोत ({filteredUniqueSources.length})</h6>
                          </div>
                          <div className="category-content">
                            {filteredUniqueSources.map((source, index) => {
                              const tooltipData = getTooltipData('source', source, filteredData);
                              const tooltipContent = getTooltipContent('source', source, tooltipData, filteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-dark text-light"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {source}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* No Selection Message */}
                    {selectedSchemes.size === 0 && selectedComponents.size === 0 && (
                      <div className="text-center text-muted py-4">
                        <FaPiggyBank size={32} className="mb-2" />
                        <div>कोई फ़िल्टर नहीं चुना गया</div>
                        <small>योजनाएं या घटक चुनें ताकि परिणाम दिखाई दें</small>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Collapse>
        </Card>

        {/* Source Filtering Section */}
        <Card className="mb-3" id="sources-section">
          <Card.Header
            onClick={() => toggleCollapse('sources')}
            style={{ cursor: "pointer" }}
            className="d-flex justify-content-between align-items-center accordin-header"
          >
            <span><FaTags className="me-2" /> स्रोत फ़िल्टर</span>
            <div className="d-flex align-items-center gap-2">
              {collapsedSections.sources ? <FaChevronDown /> : <FaChevronUp />}
              <Button className="pdf-file"
                variant="outline-info"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openSourcesPDFView();
                }}
                title="स्रोत PDF व्यू खोलें"
              >
                <FaEye  />
              </Button>
            </div>
          </Card.Header>
          <Collapse in={!collapsedSections.sources}>
            <Card.Body>
              <Row>
                {/* Left Side: Source Selection Panel */}
                <Col md={6}>
                  <div className="selection-panel">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">स्रोत चयन</h6>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={clearSourceSelections}
                        disabled={selectedSources.size === 0}
                      >
                        सभी हटाएं
                      </Button>
                    </div>
                    
                    {/* Sources Selection */}
                    <div>
                      <h6 className="fw-bold mb-2 text-dark">सभी स्रोत ({uniqueSources.length})</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {uniqueSources.map((source, index) => {
                          const tooltipData = getTooltipData('source', source, tableData);
                          const tooltipContent = getTooltipContent('source', source, tooltipData, tableData);
                          
                          return (
                            <Badge
                              key={index}
                              bg={selectedSources.has(source) ? "dark" : "light"}
                              text={selectedSources.has(source) ? "light" : "dark"}
                              className="p-2 selectable-badge"
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleSource(source)}
                              title={selectedSources.has(source) ? "हटाएं" : "चुनें"}
                              data-bs-toggle="tooltip"
                              data-bs-placement="top"
                            >
                              {source}
                              {selectedSources.has(source) && <span className="ms-1">✓</span>}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Right Side: Source Filtered Results */}
                <Col md={6}>
                  <div className="results-panel">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0">स्रोत आधारित परिणाम</h6>
                      <div className="text-end">
                        <small className="text-muted">
                          चयनित: {selectedSources.size}
                        </small>
                      </div>
                    </div>

                    {/* Source Filtered Summary */}
                    <div className="mb-3">
                      <div className="bg-light p-2 rounded">
                        <div className="row text-center">
                          <div className="col-4">
                            <div className="fw-bold text-info">{sourceFilteredData.length}</div>
                            <small className="text-muted">रिकॉर्ड</small>
                          </div>
                          <div className="col-4">
                            <div className="fw-bold text-success">{formatCurrency(sourceFilteredTotals.totalAllocated)}</div>
                            <small className="text-muted">आवंटित</small>
                          </div>
                          <div className="col-4">
                            <div className="fw-bold text-warning">{formatCurrency(sourceFilteredTotals.totalUpdated)}</div>
                            <small className="text-muted">बेचा गया</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Source Filtered Categories Grid */}
                    <div className="filtered-categories-grid">
                      {/* Filtered Schemes */}
                      {sourceFilteredUniqueSchemes.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaPiggyBank className="me-1 text-info" />
                            <h6 className="fw-bold mb-1 text-info">योजनाएं ({sourceFilteredUniqueSchemes.length})</h6>
                          </div>
                          <div className="category-content">
                            {sourceFilteredUniqueSchemes.map((scheme, index) => {
                              const tooltipData = getTooltipData('scheme', scheme, sourceFilteredData);
                              const tooltipContent = getTooltipContent('scheme', scheme, tooltipData, sourceFilteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-info text-white"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {scheme}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Filtered Investments */}
                      {sourceFilteredUniqueInvestments.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaPuzzlePiece className="me-1 text-warning" />
                            <h6 className="fw-bold mb-1 text-warning">निवेश ({sourceFilteredUniqueInvestments.length})</h6>
                          </div>
                          <div className="category-content">
                            {sourceFilteredUniqueInvestments.map((investment, index) => {
                              const tooltipData = getTooltipData('investment', investment, sourceFilteredData);
                              const tooltipContent = getTooltipContent('investment', investment, tooltipData, sourceFilteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-warning text-dark"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {investment}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Filtered Components */}
                      {sourceFilteredUniqueComponents.length > 0 && (
                        <div className="category-section">
                          <div className="category-header">
                            <FaLayerGroup className="me-1 text-secondary" />
                            <h6 className="fw-bold mb-1 text-secondary">घटक ({sourceFilteredUniqueComponents.length})</h6>
                          </div>
                          <div className="category-content">
                            {sourceFilteredUniqueComponents.map((component, index) => {
                              const tooltipData = getTooltipData('component', component, sourceFilteredData);
                              const tooltipContent = getTooltipContent('component', component, tooltipData, sourceFilteredData);
                              
                              return (
                                <div key={index} className="category-item">
                                  <span
                                    className="category-badge bg-secondary text-light"
                                    title={tooltipContent}
                                    data-bs-toggle="tooltip"
                                    data-bs-placement="top"
                                  >
                                    {component}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* No Selection Message */}
                    {selectedSources.size === 0 && (
                      <div className="text-center text-muted py-4">
                        <FaTags size={32} className="mb-2" />
                        <div>कोई स्रोत नहीं चुना गया</div>
                        <small>स्रोत चुनें ताकि परिणाम दिखाई दें</small>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Collapse>
        </Card>
      </Modal.Body>
    </Modal>
  );
};

export default TableDetailsModal;