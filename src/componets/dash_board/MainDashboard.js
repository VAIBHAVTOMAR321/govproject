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
             main dashboard
             
            </Container>
          </Col>
        </Row>

       
      </Container>

      {/* Add custom styles for the grid layout */}
    
    </div>
  );
};

export default MainDashboard;
