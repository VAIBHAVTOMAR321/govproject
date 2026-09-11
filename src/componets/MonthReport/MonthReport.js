import React, { useEffect, useMemo, useRef, useState } from "react";
import ExcelJS from "exceljs";
import "./MonthReport.css";
const API_URL = "https://mahadevaaya.com/govbillingsystem/backend/api/month-reports/";
const REPORT_FILE_BASE_URL = "https://mahadevaaya.com/govbillingsystem/backend/media/month_reports/";
const MEDIA_BASE_URL ="https://mahadevaaya.com/govbillingsystem/backend";
const MAX_FILE_SIZE = 25 * 1024 * 1024;

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

const financialYears = [
  "2029-2030",
  "2028-2029",
  "2027-2028",
  "2026-2027",
  "2026-27",
  "2025-26",
  "2024-25",
  "2023-2024",
  "2023-24",
  "2022-23",
  "2021-22",
  "2020-21",
];

const uid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getMonthName = (value) =>
  months.find((m) => m.value === String(value))?.label || "";

const formatSize = (bytes) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const normalizeColor = (value) => {
  if (!value) return null;

  let color = value;

  if (typeof color === "object") {
    color = color.argb || color.rgb || color.indexed || color.theme || null;
  }

  if (typeof color !== "string") return null;

  color = color.replace("#", "").trim();

  if (/^[0-9a-fA-F]{8}$/.test(color)) {
    color = color.slice(2);
  }

  if (/^[0-9a-fA-F]{6}$/.test(color)) {
    return `#${color}`;
  }

  return null;
};

const getFillColor = (cell) => {
  const fill = cell.fill;

  if (!fill || fill.type === "none") return null;

  return (
    normalizeColor(fill.fgColor) ||
    normalizeColor(fill.bgColor) ||
    null
  );
};

const getBorderStyle = (side) => {
  if (!side) return "none";

  const styles = {
    thin: "1px solid",
    medium: "2px solid",
    thick: "3px solid",
    double: "3px double",
    dotted: "1px dotted",
    dashed: "1px dashed",
    hair: "1px solid",
  };

  return styles[side.style] || "1px solid";
};

const getBorderColor = (side) =>
  normalizeColor(side?.color) || "#b7b7b7";

const getPrimitiveCellValue = (cell) => {
  if (!cell) return "";

  const value = cell.value;

  if (value === null || value === undefined) return "";

  if (value instanceof Date) {
    return value.toLocaleDateString("en-IN");
  }

  if (typeof value === "object") {
    if (value.richText) {
      return value.richText.map((x) => x.text || "").join("");
    }

    if (value.text !== undefined) return String(value.text);

    if (value.result !== undefined && value.result !== null) {
      return value.result;
    }

    return "";
  }

  return value;
};

const splitFormulaParts = (formula, operator) => {
  const parts = [];
  let current = "";
  let depth = 0;
  let quoted = false;

  for (let i = 0; i < formula.length; i += 1) {
    const ch = formula[i];

    if (ch === '"') {
      quoted = !quoted;
      current += ch;
      continue;
    }

    if (!quoted) {
      if (ch === "(") depth += 1;
      if (ch === ")") depth -= 1;

      if (ch === operator && depth === 0) {
        parts.push(current.trim());
        current = "";
        continue;
      }
    }

    current += ch;
  }

  parts.push(current.trim());
  return parts;
};

const parseSheetCellReference = (token, activeWorksheet) => {
  const trimmed = token.trim();

  // Sheet-qualified reference, e.g. '📝 DATA ENTRY'!F8
  const qualified = trimmed.match(
    /^'(.*?)'!\$?([A-Z]{1,3})\$?(\d+)$/i
  );

  if (qualified) {
    return {
      worksheetName: qualified[1],
      address: `${qualified[2].toUpperCase()}${qualified[3]}`,
    };
  }

  // Unquoted sheet-qualified reference.
  const qualifiedPlain = trimmed.match(
    /^([^!]+)!\$?([A-Z]{1,3})\$?(\d+)$/i
  );

  if (qualifiedPlain) {
    return {
      worksheetName: qualifiedPlain[1],
      address: `${qualifiedPlain[2].toUpperCase()}${qualifiedPlain[3]}`,
    };
  }

  // Local worksheet reference, e.g. D43.
  const local = trimmed.match(/^\$?([A-Z]{1,3})\$?(\d+)$/i);

  if (local) {
    return {
      worksheetName: activeWorksheet?.name,
      address: `${local[1].toUpperCase()}${local[2]}`,
    };
  }

  return null;
};

const evaluateFormulaValue = (
  workbook,
  activeWorksheet,
  formula,
  visited = new Set()
) => {
  if (!workbook || !activeWorksheet || typeof formula !== "string") {
    return undefined;
  }

  let expression = formula.trim();
  if (expression.startsWith("=")) expression = expression.slice(1).trim();

  // Excel string literal.
  if (
    expression.length >= 2 &&
    expression.startsWith('"') &&
    expression.endsWith('"')
  ) {
    return expression.slice(1, -1).replace(/""/g, '"');
  }

  // Handle Excel's concatenation operator first. This is used by the
  // workbook for headings such as D3 & " | ...".
  const concatParts = splitFormulaParts(expression, "&");
  if (concatParts.length > 1) {
    const values = concatParts.map((part) =>
      evaluateFormulaValue(workbook, activeWorksheet, part, visited)
    );

    if (values.some((value) => value === undefined)) return undefined;
    return values.map((value) => String(value ?? "")).join("");
  }

  // SUM(range) and SUM(a,b,c) - enough for the workbook's total rows.
  const sumMatch = expression.match(/^SUM\((.*)\)$/i);
  if (sumMatch) {
    const args = splitFormulaParts(sumMatch[1], ",");
    let total = 0;

    for (const arg of args) {
      const range = arg.match(
        /^(?:(?:'(.*?)')|([^!]+))?!?\$?([A-Z]{1,3})\$?(\d+):\$?([A-Z]{1,3})\$?(\d+)$/i
      );

      if (range) {
        const sheetName = range[1] || range[2] || activeWorksheet.name;
        const target = workbook.getWorksheet(sheetName);
        if (!target) return undefined;

        const startRow = Number(range[4]);
        const endRow = Number(range[6]);
        const startCol = target.getColumn(range[3]).number;
        const endCol = target.getColumn(range[5]).number;

        for (let r = Math.min(startRow, endRow); r <= Math.max(startRow, endRow); r += 1) {
          for (let c = Math.min(startCol, endCol); c <= Math.max(startCol, endCol); c += 1) {
            const value = evaluateCellValue(
              workbook,
              target,
              target.getCell(r, c),
              visited
            );
            if (typeof value === "number" && Number.isFinite(value)) {
              total += value;
            }
          }
        }
      } else {
        const value = evaluateFormulaValue(
          workbook,
          activeWorksheet,
          arg,
          visited
        );
        if (typeof value === "number" && Number.isFinite(value)) {
          total += value;
        }
      }
    }

    return total;
  }

  // Direct cell reference.
  const reference = parseSheetCellReference(expression, activeWorksheet);
  if (reference) {
    const target = workbook.getWorksheet(reference.worksheetName);
    if (!target) return undefined;

    return evaluateCellValue(
      workbook,
      target,
      target.getCell(reference.address),
      visited
    );
  }

  // Simple arithmetic expressions used by the workbook, e.g.
  // D43+G43+I43+K43+M43 or D8+F8+H8+J8+L8.
  const arithmeticParts = [];
  let current = "";
  let depth = 0;
  let quoted = false;

  for (let i = 0; i < expression.length; i += 1) {
    const ch = expression[i];
    if (ch === '"') quoted = !quoted;

    if (!quoted) {
      if (ch === "(") depth += 1;
      if (ch === ")") depth -= 1;

      if ((ch === "+" || ch === "-" || ch === "*" || ch === "/") && depth === 0) {
        arithmeticParts.push(current.trim());
        arithmeticParts.push(ch);
        current = "";
        continue;
      }
    }

    current += ch;
  }
  arithmeticParts.push(current.trim());

  if (arithmeticParts.length > 1) {
    const values = [];

    for (const part of arithmeticParts) {
      if (["+", "-", "*", "/"].includes(part)) {
        values.push(part);
        continue;
      }

      const numericReference = parseSheetCellReference(part, activeWorksheet);
      if (numericReference) {
        const target = workbook.getWorksheet(numericReference.worksheetName);
        if (!target) return undefined;
        const value = evaluateCellValue(
          workbook,
          target,
          target.getCell(numericReference.address),
          visited
        );
        if (typeof value !== "number") return undefined;
        values.push(value);
        continue;
      }

      const numberValue = Number(part);
      if (!Number.isNaN(numberValue)) {
        values.push(numberValue);
        continue;
      }

      return undefined;
    }

    let result = values[0];
    for (let i = 1; i < values.length; i += 2) {
      const operator = values[i];
      const right = values[i + 1];
      if (operator === "+") result += right;
      if (operator === "-") result -= right;
      if (operator === "*") result *= right;
      if (operator === "/") result /= right;
    }
    return result;
  }

  const numeric = Number(expression);
  if (!Number.isNaN(numeric)) return numeric;

  return undefined;
};

const evaluateCellValue = (workbook, worksheet, cell, visited = new Set()) => {
  if (!cell) return "";

  const value = cell.value;
  if (value === null || value === undefined) return "";

  if (typeof value === "object" && value.formula !== undefined) {
    const key = `${worksheet.name}!${cell.address}`;
    if (visited.has(key)) return value.result ?? "";

    const nextVisited = new Set(visited);
    nextVisited.add(key);

    const calculated = evaluateFormulaValue(
      workbook,
      worksheet,
      `=${value.formula}`,
      nextVisited
    );

    if (calculated !== undefined) return calculated;
    if (value.result !== undefined && value.result !== null) return value.result;
    return "";
  }

  return getPrimitiveCellValue(cell);
};

const cellToText = (cell, workbook = null, worksheet = null) => {
  if (!cell) return "";

  if (workbook && worksheet) {
    const value = evaluateCellValue(workbook, worksheet, cell);
    if (value instanceof Date) return value.toLocaleDateString("en-IN");
    return value === null || value === undefined ? "" : String(value);
  }

  return String(getPrimitiveCellValue(cell) ?? "");
};

const cellToRawValue = (cell) => {
  if (!cell) return "";

  if (
    cell.value &&
    typeof cell.value === "object" &&
    cell.value.formula !== undefined
  ) {
    return `=${cell.value.formula}`;
  }

  return cell.value ?? "";
};

const getCellStyle = (cell, isSelected = false) => {
  const alignment = cell.alignment || {};
  const font = cell.font || {};

  return {
    backgroundColor: getFillColor(cell) || "#ffffff",
    color: normalizeColor(font.color) || "#000000",
    fontFamily: font.name || "Calibri, Arial, sans-serif",
    fontSize: `${font.size || 11}pt`,
    fontWeight: font.bold ? 700 : 400,
    fontStyle: font.italic ? "italic" : "normal",
    textDecoration:
      [
        font.underline ? "underline" : "",
        font.strike ? "line-through" : "",
      ]
        .filter(Boolean)
        .join(" ") || "none",
    textAlign:
      alignment.horizontal === "center"
        ? "center"
        : alignment.horizontal === "right"
        ? "right"
        : "left",
    verticalAlign:
      alignment.vertical === "top"
        ? "top"
        : alignment.vertical === "bottom"
        ? "bottom"
        : "middle",
    whiteSpace: alignment.wrapText ? "pre-wrap" : "pre-wrap",
    borderTop: `${getBorderStyle(cell.border?.top)} ${getBorderColor(
      cell.border?.top
    )}`,
    borderRight: `${getBorderStyle(cell.border?.right)} ${getBorderColor(
      cell.border?.right
    )}`,
    borderBottom: `${getBorderStyle(
      cell.border?.bottom
    )} ${getBorderColor(cell.border?.bottom)}`,
    borderLeft: `${getBorderStyle(cell.border?.left)} ${getBorderColor(
      cell.border?.left
    )}`,
    padding: "3px 5px",
    outline: isSelected ? "2px solid #217346" : "none",
    outlineOffset: "-2px",
  };
};

const columnNumber = (letters) => {
  let result = 0;

  for (const char of String(letters).toUpperCase()) {
    result = result * 26 + char.charCodeAt(0) - 64;
  }

  return result;
};

const columnLetter = (number) => {
  let result = "";
  let n = number;

  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }

  return result;
};

const parseMerge = (range) => {
  const [start, end] = String(range).split(":");

  const a = start?.match(/^([A-Z]+)(\d+)$/i);
  const b = end?.match(/^([A-Z]+)(\d+)$/i);

  if (!a || !b) return null;

  return {
    startRow: Number(a[2]),
    endRow: Number(b[2]),
    startCol: columnNumber(a[1]),
    endCol: columnNumber(b[1]),
  };
};

const createMergeMap = (worksheet) => {
  const map = new Map();
  const merges = worksheet.model?.merges || [];

  merges.forEach((range) => {
    const merge = parseMerge(range);
    if (!merge) return;

    for (let row = merge.startRow; row <= merge.endRow; row += 1) {
      for (
        let col = merge.startCol;
        col <= merge.endCol;
        col += 1
      ) {
        map.set(`${row}:${col}`, {
          ...merge,
          isMaster:
            row === merge.startRow && col === merge.startCol,
          rowSpan: merge.endRow - merge.startRow + 1,
          colSpan: merge.endCol - merge.startCol + 1,
        });
      }
    }
  });

  return map;
};

const getCookie = (name) => {
  const cookies = document.cookie ? document.cookie.split(";") : [];

  for (const item of cookies) {
    const [key, ...valueParts] = item.trim().split("=");
    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return "";
};

const apiFetch = async (url, options = {}) => {
  const method = String(options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});

  /*
    No credentials: "include"
    No withCredentials
    No Authorization header
    No automatic CSRF header
  */
  const response = await fetch(url, {
    ...options,
    method,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const data = await response.json();
      message = data?.detail || data?.error || data?.message || message;
    } catch {
      // Keep the HTTP status message when the API does not return JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response;
};

/*
  This helper is retained for displaying/keeping the API file path.
  View/Edit does NOT fetch this media URL directly.
*/
const getMediaUrl = (path) => {
  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${window.location.origin}${
    path.startsWith("/") ? "" : "/"
  }${path}`;
};

const normalizeApiReport = (item) => ({
  id: item.id,
  month: String(item.month ?? ""),
  financialYear: item.financial_year ?? "",
  monthReport: item.month_report ?? "",
  fileName:
    String(item.month_report || "").split("/").pop() ||
    "MPR.xlsx",
  fileSize: Number(item.file_size || item.size || 0),
  createdAt: item.created_at || "",
  updatedAt:
    item.updated_at || item.created_at || "",
  file: null,
  apiData: item,
});

const getReportsFromResponse = (data) => {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
    ? data.results
    : data
    ? [data]
    : [];

  return list.map(normalizeApiReport);
};

/*
  Load the XLSX through Django's API instead of directly from /media/.

  For report ID 8:
    GET https://mahadevaaya.com/govbillingsystem/backend/api/month-reports/8/file/

  This avoids the CORS error caused by:
    https://mahadevaaya.com/govbillingsystem/backend/media/...
*/
const fetchReportFile = async (report) => {
  if (!report?.id) {
    throw new Error(
      "Report ID is missing. The Excel file cannot be opened."
    );
  }

  const fileUrl = `${API_URL}${report.id}/`;

  console.log(
    "Fetching Excel workbook through Django:",
    fileUrl
  );

  const response = await fetch(fileUrl, {
    method: "GET",
    headers: {
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,*/*",
    },
  });

  if (!response.ok) {
    let message =
      `Unable to load Excel file (${response.status} ${response.statusText}).`;

    try {
      const data = await response.json();

      message =
        data?.error ||
        data?.detail ||
        data?.message ||
        message;
    } catch {
      // Backend response was not JSON.
    }

    throw new Error(message);
  }

  const contentType =
    response.headers.get("content-type") || "";

  const blob = await response.blob();

  if (!blob || blob.size === 0) {
    throw new Error(
      "The backend returned an empty Excel file (0 KB). Please verify the physical XLSX file on the Django server."
    );
  }

  if (
    contentType.includes("text/html") ||
    contentType.includes("application/json")
  ) {
    throw new Error(
      "The file endpoint did not return an Excel workbook. Check the Django /file/ endpoint."
    );
  }

  const fileName =
    report.fileName &&
    report.fileName.toLowerCase().endsWith(".xlsx")
      ? report.fileName
      : "MPR.xlsx";

  return new File([blob], fileName, {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    lastModified: Date.now(),
  });
};

const uploadReport = async ({ month, financialYear, file }) => {
  const formData = new FormData();
  formData.append("month", String(month));
  formData.append("financial_year", String(financialYear));
  formData.append("month_report", file);

  return apiFetch(API_URL, {
    method: "POST",
    body: formData,
  });
};

const updateReportFile = async ({
  id,
  month,
  financialYear,
  file,
}) => {
  if (!id) {
    throw new Error("Month report ID is missing.");
  }

  if (!file || !file.size) {
    throw new Error("The edited Excel file is empty.");
  }

  /*
    Exact backend endpoint:

    PUT
    https://mahadevaaya.com/govbillingsystem/backend/api/month-reports/{id}/

    Example:
    https://mahadevaaya.com/govbillingsystem/backend/api/month-reports/8/
  */
  const formData = new FormData();

  formData.append("month", String(month ?? ""));
  formData.append(
    "financial_year",
    String(financialYear ?? "")
  );

  formData.append(
    "month_report",
    file,
    file.name || "MPR.xlsx"
  );

  /*
    Do not set Content-Type manually.
    The browser creates the multipart boundary.
  */
  return apiFetch(`${API_URL}${id}/`, {
    method: "PUT",
    body: formData,
  });
};

const deleteReportFromApi = async (id) => {
  await apiFetch(`${API_URL}${id}/`, {
    method: "DELETE",
  });
};

const workbookFromFile = async (file) => {
  if (!file) {
    throw new Error("No Excel file was received.");
  }

  if (!file.size) {
    throw new Error(
      "The Excel file is empty (0 KB). Check the Django media file."
    );
  }

  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();

  try {
    await workbook.xlsx.load(buffer);
  } catch (error) {
    console.error("ExcelJS load error:", error);

    throw new Error(
      "The server returned a file, but it is not a valid .xlsx workbook."
    );
  }

  if (!workbook.worksheets.length) {
    throw new Error(
      "The Excel workbook contains no worksheets."
    );
  }

  return workbook;
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const ExcelEditor = ({ report, onClose, onSaved }) => {
  const [workbook, setWorkbook] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [selectedCell, setSelectedCell] = useState(null);
  const [formulaText, setFormulaText] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const formulaRef = useRef(null);

  const currentWorksheet = workbook?.worksheets?.[activeSheetIndex];

  const rebuildSheetView = (book = workbook) => {
    if (!book) return;

    setSheets(
      book.worksheets.map((worksheet) => {
        const mergeMap = createMergeMap(worksheet);
        const rowCount = Math.max(worksheet.rowCount || 1, 1);
        const colCount = Math.max(worksheet.columnCount || 1, 1);

        const columns = Array.from({ length: colCount }, (_, i) => {
          const column = worksheet.getColumn(i + 1);

          return {
            number: i + 1,
            letter: columnLetter(i + 1),
            width: Number(column.width) || 10,
            hidden: Boolean(column.hidden),
          };
        });

        const rows = Array.from({ length: rowCount }, (_, i) => {
          const rowNumber = i + 1;
          const row = worksheet.getRow(rowNumber);

          return {
            number: rowNumber,
            height: Number(row.height) || 18,
            hidden: Boolean(row.hidden),
            cells: Array.from({ length: colCount }, (_, j) => {
              const colNumber = j + 1;
              const cell = worksheet.getCell(
                rowNumber,
                colNumber
              );
              const merge = mergeMap.get(
                `${rowNumber}:${colNumber}`
              );

              return {
                row: rowNumber,
                col: colNumber,
                value: cellToText(cell, book, worksheet),
                style: getCellStyle(
                  cell,
                  selectedCell?.row === rowNumber &&
                    selectedCell?.col === colNumber
                ),
                merge,
              };
            }),
          };
        });

        return {
          name: worksheet.name,
          rows,
          columns,
        };
      })
    );
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const book = await workbookFromFile(report.file);

        if (cancelled) return;

        setWorkbook(book);
        setActiveSheetIndex(0);
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            err?.message || "Excel file could not be opened."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [report.file]);

  useEffect(() => {
    if (workbook) rebuildSheetView(workbook);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workbook, activeSheetIndex, selectedCell]);

  const selectCell = (row, col) => {
    if (!currentWorksheet) return;

    const cell = currentWorksheet.getCell(row, col);
    const value = cellToRawValue(cell);

    setSelectedCell({ row, col });
    setFormulaText(value === null || value === undefined ? "" : String(value));
    setStatus(
      `${columnLetter(col)}${row} selected`
    );
  };

  const commitFormulaBar = () => {
    if (!currentWorksheet || !selectedCell) return;

    const cell = currentWorksheet.getCell(
      selectedCell.row,
      selectedCell.col
    );

    const value = formulaText;

    /*
      ExcelJS formula values need an object.
      This stores formulas so Excel can calculate them when
      the edited workbook is opened in Excel.
    */
    if (value.trim().startsWith("=")) {
      cell.value = {
        formula: value.trim().slice(1),
      };
    } else {
      cell.value = value;
    }

    setDirty(true);
    setStatus("Cell updated");
    rebuildSheetView(workbook);
  };

  const commitCell = (row, col, value) => {
    if (!currentWorksheet) return;

    const cell = currentWorksheet.getCell(row, col);

    if (typeof value === "string" && value.trim().startsWith("=")) {
      cell.value = {
        formula: value.trim().slice(1),
      };
    } else {
      cell.value = value;
    }

    setDirty(true);
    setStatus("Cell updated");
    rebuildSheetView(workbook);
  };

  const handleCellKeyDown = (event, row, col) => {
    if (event.key === "Enter") {
      event.preventDefault();

      commitCell(row, col, event.currentTarget.textContent || "");

      const nextRow = row + 1;
      if (nextRow <= (currentWorksheet?.rowCount || nextRow)) {
        setTimeout(() => selectCell(nextRow, col), 0);
      }

      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();

      commitCell(row, col, event.currentTarget.textContent || "");

      setTimeout(() => selectCell(row, col + 1), 0);
    }

    if (event.key === "Escape") {
      event.currentTarget.textContent =
        cellToText(currentWorksheet?.getCell(row, col), workbook, currentWorksheet);
      event.currentTarget.blur();
    }
  };

  const saveChanges = async () => {
    if (!workbook || !report) return;

    try {
      setSaving(true);
      setError("");
      setStatus("Preparing Excel file...");

      const buffer = await workbook.xlsx.writeBuffer();

      const newFile = new File([buffer], report.fileName, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        lastModified: Date.now(),
      });

      setStatus("Uploading edited Excel file to server...");

      const responseData = await updateReportFile({
        id: report.id,
        month: report.month,
        financialYear: report.financialYear,
        file: newFile,
      });

      const apiReport = responseData
        ? getReportsFromResponse(responseData)[0]
        : null;

      const updatedReport = {
        ...report,
        ...(apiReport || {}),
        id: report.id,
        month: report.month,
        financialYear: report.financialYear,
        file: newFile,
        fileName: apiReport?.fileName || report.fileName,
        fileSize: newFile.size,
        updatedAt: apiReport?.updatedAt || new Date().toISOString(),
        monthReport: apiReport?.monthReport || report.monthReport,
      };

      setDirty(false);
      setStatus("Changes saved successfully. Server file replaced.");

      onSaved(updatedReport);
    } catch (err) {
      console.error("Save Excel error:", err);
      setError(
        err?.message || "Unable to upload the edited Excel file to the server."
      );
    } finally {
      setSaving(false);
    }
  };

  const downloadCurrent = async () => {
    if (!workbook) return;

    try {
      const buffer = await workbook.xlsx.writeBuffer();

      downloadBlob(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        report.fileName
      );
    } catch (err) {
      setError("Unable to download the edited Excel file.");
    }
  };

  const currentView = sheets[activeSheetIndex];

  return (
    <div className="excel-editor-overlay">
      <div className="excel-editor-window">
        {/* Excel title/ribbon header */}
        <div className="excel-top-header">
          <div className="excel-title-left">
            <div className="excel-logo">X</div>

            <div className="excel-document-name">
              <strong>{report.fileName}</strong>
              <span>
                {dirty
                  ? "Unsaved changes"
                  : "Editing in browser"}
              </span>
            </div>
          </div>

          <div className="excel-top-actions">
            <button
              type="button"
              className="excel-save-button"
              onClick={saveChanges}
              disabled={!dirty || saving}
            >
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>

            <button
              type="button"
              className="excel-download-button"
              onClick={downloadCurrent}
              disabled={!workbook}
            >
              ⬇ Download
            </button>

            <button
              type="button"
              className="excel-close-button"
              onClick={() => {
                if (
                  dirty &&
                  !window.confirm(
                    "You have unsaved changes. Close without saving?"
                  )
                ) {
                  return;
                }

                onClose();
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Excel-like ribbon */}
        <div className="excel-ribbon">
          <div className="excel-ribbon-group">
            <button
              type="button"
              onClick={() => formulaRef.current?.focus()}
            >
              fx
            </button>

            <span className="excel-ribbon-label">Formula</span>
          </div>

          <div className="excel-ribbon-divider" />

          <div className="excel-ribbon-info">
            <span>
              {selectedCell
                ? `${columnLetter(selectedCell.col)}${selectedCell.row}`
                : "Select a cell"}
            </span>

            <span>
              {currentWorksheet?.name || ""}
            </span>
          </div>

          <div className="excel-ribbon-status">
            {status || "Ready"}
          </div>
        </div>

        {/* Formula bar */}
        <div className="excel-formula-row">
          <div className="excel-name-box">
            {selectedCell
              ? `${columnLetter(selectedCell.col)}${selectedCell.row}`
              : ""}
          </div>

          <div className="excel-formula-label">fx</div>

          <input
            ref={formulaRef}
            className="excel-formula-input"
            value={formulaText}
            onChange={(e) => setFormulaText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitFormulaBar();
              }
            }}
            placeholder="Select a cell to edit its value or formula"
          />
        </div>

        {error && (
          <div className="excel-editor-error">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="excel-editor-loading">
            <div className="excel-spinner" />
            <h3>Opening Excel workbook...</h3>
            <p>Loading sheets, merged cells and formatting.</p>
          </div>
        ) : (
          <>
            {/* Worksheet */}
            <div className="excel-workspace">
              <div className="excel-grid-scroll">
                {currentView && (
                  <table className="excel-edit-grid">
                    <colgroup>
                      <col className="excel-row-number-column" />

                      {currentView.columns.map((column) => (
                        <col
                          key={column.number}
                          style={{
                            width: `${Math.max(
                              35,
                              column.width * 7
                            )}px`,
                          }}
                        />
                      ))}
                    </colgroup>

                    <thead>
                      <tr>
                        <th className="excel-corner-cell" />

                        {currentView.columns.map((column) => (
                          <th
                            key={column.number}
                            className="excel-column-header"
                            style={{
                              display: column.hidden
                                ? "none"
                                : "table-cell",
                            }}
                          >
                            {column.letter}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {currentView.rows.map((row) => (
                        <tr
                          key={row.number}
                          style={{
                            height: `${Math.max(
                              18,
                              row.height
                            )}px`,
                            display: row.hidden
                              ? "none"
                              : "table-row",
                          }}
                        >
                          <th className="excel-row-header">
                            {row.number}
                          </th>

                          {row.cells.map((cell) => {
                            if (
                              cell.merge &&
                              !cell.merge.isMaster
                            ) {
                              return null;
                            }

                            const isSelected =
                              selectedCell?.row === cell.row &&
                              selectedCell?.col === cell.col;

                            return (
                              <td
                                key={`${cell.row}-${cell.col}`}
                                rowSpan={
                                  cell.merge?.rowSpan || 1
                                }
                                colSpan={
                                  cell.merge?.colSpan || 1
                                }
                                style={getCellStyle(
                                  currentWorksheet.getCell(
                                    cell.row,
                                    cell.col
                                  ),
                                  isSelected
                                )}
                                className={
                                  isSelected
                                    ? "excel-edit-cell selected"
                                    : "excel-edit-cell"
                                }
                                onClick={() =>
                                  selectCell(
                                    cell.row,
                                    cell.col
                                  )
                                }
                                onDoubleClick={(event) => {
                                  event.currentTarget.focus();
                                }}
                                contentEditable
                                suppressContentEditableWarning
                                spellCheck={false}
                                onFocus={() =>
                                  selectCell(
                                    cell.row,
                                    cell.col
                                  )
                                }
                                onBlur={(event) => {
                                  commitCell(
                                    cell.row,
                                    cell.col,
                                    event.currentTarget.textContent ||
                                      ""
                                  );
                                }}
                                onKeyDown={(event) =>
                                  handleCellKeyDown(
                                    event,
                                    cell.row,
                                    cell.col
                                  )
                                }
                              >
                                {cell.value}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Sheet tabs */}
            <div className="excel-bottom-bar">
              <div className="excel-sheet-controls">
                <button
                  type="button"
                  title="First sheet"
                  onClick={() => setActiveSheetIndex(0)}
                >
                  ◀
                </button>

                <button
                  type="button"
                  title="Previous sheet"
                  onClick={() =>
                    setActiveSheetIndex((i) =>
                      Math.max(0, i - 1)
                    )
                  }
                >
                  ‹
                </button>

                <button
                  type="button"
                  title="Next sheet"
                  onClick={() =>
                    setActiveSheetIndex((i) =>
                      Math.min(sheets.length - 1, i + 1)
                    )
                  }
                >
                  ›
                </button>

                <button
                  type="button"
                  title="Last sheet"
                  onClick={() =>
                    setActiveSheetIndex(
                      Math.max(0, sheets.length - 1)
                    )
                  }
                >
                  ▶
                </button>
              </div>

              <div className="excel-sheet-tabs">
                {sheets.map((sheet, index) => (
                  <button
                    type="button"
                    key={`${sheet.name}-${index}`}
                    className={
                      index === activeSheetIndex
                        ? "excel-sheet-tab active"
                        : "excel-sheet-tab"
                    }
                    onClick={() =>
                      setActiveSheetIndex(index)
                    }
                  >
                    {sheet.name}
                  </button>
                ))}
              </div>

              <div className="excel-zoom">
                100%
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const MonthReport = () => {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const [month, setMonth] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch(API_URL);
      const apiReports = getReportsFromResponse(data);

      setReports(apiReports);
    } catch (err) {
      console.error("Load MPR reports error:", err);
      setError(err?.message || "Unable to load MPR reports from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const currentMonthYear = useMemo(() => {
    if (!month || !financialYear) return "";
    return `${getMonthName(month)}-${financialYear}`;
  }, [month, financialYear]);

  const resetForm = () => {
    setMonth("");
    setFinancialYear("");
    setSelectedFile(null);
    setEditingReport(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openAdd = () => {
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setError("");
  };

  const validateFile = (file) => {
    if (!file) {
      setError("Please select an Excel file.");
      return false;
    }

    const extension = file.name.toLowerCase().split(".").pop();

    if (extension !== "xlsx") {
      setError(
        "Only .xlsx Excel files are supported for editing."
      );
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Maximum Excel file size is 25 MB.");
      return false;
    }

    return true;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (validateFile(file)) {
      setSelectedFile(file);
    } else {
      event.target.value = "";
      setSelectedFile(null);
    }
  };

  const saveNewReport = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!month) {
      setError("Please select Month.");
      return;
    }

    if (!financialYear) {
      setError("Please select Financial Year.");
      return;
    }

    if (!validateFile(selectedFile)) return;

    try {
      await workbookFromFile(selectedFile);

      setLoading(true);

      const responseData = await uploadReport({
        month,
        financialYear,
        file: selectedFile,
      });

      const uploaded = getReportsFromResponse(responseData)[0];

      if (uploaded) {
        setReports((previous) => [uploaded, ...previous]);
      } else {
        // Some APIs return 201 with no useful object. Refresh the list so
        // the server remains the source of truth.
        await loadReports();
      }

      setSuccess("MPR Excel report uploaded successfully to the server.");
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Upload MPR error:", err);
      setError(
        err?.message || "The selected Excel file could not be uploaded."
      );
    } finally {
      setLoading(false);
    }
  };

  const openReport = async (report) => {
    try {
      setError("");
      setSuccess("");

      /*
        Fetch the workbook from Django and pass the bytes to ExcelJS.
        Nothing is opened in Microsoft Excel and nothing is downloaded
        when the user clicks View / Edit.
      */
      const file = await fetchReportFile(report);

      setEditingReport({
        ...report,
        file,
        fileSize: file.size,
      });

      setShowEditor(true);
    } catch (err) {
      console.error("Open MPR error:", err);

      setError(
        err?.message ||
          "Unable to open the Excel report in the browser."
      );
    }
  };

  const handleEditorSaved = (updatedReport) => {
    setReports((previous) =>
      previous.map((item) =>
        item.id === updatedReport.id
          ? updatedReport
          : item
      )
    );

    setEditingReport(updatedReport);
    setSuccess(
      `${updatedReport.fileName} was replaced with the edited Excel file.`
    );
  };

  const deleteReport = async (id) => {
    const confirmed = window.confirm(
      "क्या आप इस MPR Excel report को delete करना चाहते हैं?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await deleteReportFromApi(id);

      setReports((previous) =>
        previous.filter((item) => item.id !== id)
      );

      setSuccess("MPR Excel report deleted successfully from the server.");
    } catch (err) {
      console.error("Delete MPR error:", err);
      setError(err?.message || "Unable to delete the report from the server.");
    }
  };

  return (
    <div className="month-report-page">
      <div className="month-report-container">
        <div className="month-report-header">
          <div>
            <h2>Monthly Progress Report</h2>
            <p>
              Upload, view and edit your Excel MPR directly in the
              browser.
            </p>
          </div>

          <button
            type="button"
            className="mpr-add-btn"
            onClick={openAdd}
          >
            + Add MPR Report
          </button>
        </div>

        {success && (
          <div className="mpr-alert mpr-success">
            {success}

            <button
              type="button"
              onClick={() => setSuccess("")}
            >
              ×
            </button>
          </div>
        )}

        {error && !showModal && (
          <div className="mpr-alert mpr-error">
            {error}

            <button
              type="button"
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        <div className="mpr-table-card">
          <div className="mpr-table-header">
            <div>
              <h3>MPR Reports</h3>
              <p>
                Reports are loaded and stored through the Month Reports API.
              </p>
            </div>

            <div className="mpr-static-badge">
              LIVE API + EXCEL EDITOR
            </div>
          </div>

          {loading ? (
            <div className="mpr-empty">
              <div className="mpr-loading-small" />
              <p>Loading MPR reports from server...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="mpr-empty">
              <div className="mpr-empty-icon">📊</div>

              <h4>No MPR Reports Uploaded</h4>

              <p>
                Upload an .xlsx workbook. It will be stored on the server,
                then you can open it, edit cells and save the edited workbook.
              </p>

              <button
                type="button"
                className="mpr-empty-btn"
                onClick={openAdd}
              >
                + Upload Excel Report
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
                    <th>MPR Excel File</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report, index) => (
                    <tr key={report.id}>
                      <td>{index + 1}</td>

                      <td>
                        <span className="mpr-month-badge">
                          {getMonthName(report.month)}
                        </span>
                      </td>

                      <td>{report.financialYear}</td>

                      <td>
                        <div className="mpr-file-cell">
                          <div className="mpr-file-icon">X</div>

                          <div>
                            <strong>{report.fileName}</strong>

                            <small>
                              {formatSize(report.fileSize)}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        {new Date(
                          report.updatedAt ||
                            report.createdAt
                        ).toLocaleString("en-IN")}
                      </td>

                      <td>
                        <div className="mpr-actions">
                          <button
                            type="button"
                            className="mpr-view-btn"
                            onClick={() =>
                              openReport(report)
                            }
                          >
                            👁 View / Edit
                          </button>

                          <button
                            type="button"
                            className="mpr-delete-btn"
                            onClick={() =>
                              deleteReport(report.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="mpr-modal-overlay">
          <div className="mpr-modal">
            <div className="mpr-modal-header">
              <div>
                <h3>Add MPR Report</h3>
                <p>
                  Select the month, financial year and Excel file.
                </p>
              </div>

              <button
                type="button"
                className="mpr-close-btn"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={saveNewReport}>
              <div className="mpr-modal-body">
                <div className="mpr-form-group">
                  <label>
                    Month <span>*</span>
                  </label>

                  <select
                    value={month}
                    onChange={(e) =>
                      setMonth(e.target.value)
                    }
                  >
                    <option value="">
                      Select Month
                    </option>

                    {months.map((item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mpr-form-group">
                  <label>
                    Financial Year <span>*</span>
                  </label>

                  <select
                    value={financialYear}
                    onChange={(e) =>
                      setFinancialYear(e.target.value)
                    }
                  >
                    <option value="">
                      Select Financial Year
                    </option>

                    {financialYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mpr-form-group">
                  <label>
                    MPR Excel Report <span>*</span>
                  </label>

                  <div className="mpr-upload-box">
                    <div className="mpr-upload-icon">
                      📊
                    </div>

                    <h4>
                      Select Excel workbook
                    </h4>

                    <p>
                      .xlsx files only • Maximum 25 MB
                    </p>

                    <label className="mpr-browse-btn">
                      Browse Excel File

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={handleFileChange}
                        hidden
                      />
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="mpr-selected-file">
                      <div className="mpr-selected-file-left">
                        <div className="mpr-file-icon">
                          X
                        </div>

                        <div>
                          <strong>
                            {selectedFile.name}
                          </strong>

                          <small>
                            {formatSize(
                              selectedFile.size
                            )}
                          </small>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedFile(null)
                        }
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mpr-modal-error">
                    {error}
                  </div>
                )}
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
                >
                  Upload & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditor && editingReport && (
        <ExcelEditor
          report={editingReport}
          onClose={() => {
            setShowEditor(false);
            setEditingReport(null);
          }}
          onSaved={handleEditorSaved}
        />
      )}
    </div>
  );
};

export default MonthReport;
