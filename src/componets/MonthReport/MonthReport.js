
import React, { useEffect, useMemo, useRef, useState } from "react";
import ExcelJS from "exceljs";
import "./MonthReport.css";

const API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/month-reports/";

const YOJANA_API_URL =
  "https://mahadevaaya.com/govbillingsystem/backend/api/yojana-budget-report/";

const MEDIA_BASE_URL = "https://mahadevaaya.com/govbillingsystem/backend";
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

/* =========================================================
   YOJANA BUDGET REPORT — Helpers & API
   ========================================================= */

const round2 = (n) => {
  const num = Number(n) || 0;
  return Math.round(num * 100) / 100;
};

const formatYojanaVal = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "0.00";
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const emptyFormRow = () => ({
  id: null,
  yojana: "",
  budget: "",
  released_amount: "",
  expenditure: "",
});

const computeYojanaPayload = (row) => {
  const budget = round2(row.budget);
  const released = round2(row.released_amount);
  const expenditure = round2(row.expenditure);
  return {
    yojana: String(row.yojana || "").trim(),
    budget,
    released_amount: released,
    expenditure,
    expenditure_balance_released: round2(released - expenditure),
    expenditure_balance_budget: round2(budget - expenditure),
    release_percentage: budget > 0 ? round2((released / budget) * 100) : 0,
    expenditure_percentage_budget: budget > 0 ? round2((expenditure / budget) * 100) : 0,
    expenditure_percentage_released: released > 0 ? round2((expenditure / released) * 100) : 0,
  };
};

const fetchYojanaReports = async () => {
  return apiFetch(YOJANA_API_URL);
};

const createYojanaReport = async (payload) => {
  return apiFetch(YOJANA_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

const updateYojanaReport = async (payload) => {
  return apiFetch(YOJANA_API_URL, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

const deleteYojanaReports = async (ids) => {
  return apiFetch(YOJANA_API_URL, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: ids }),
  });
};

/* =========================================================
   EXCEL HELPERS (unchanged)
   ========================================================= */

const normalizeColor = (value) => {
  if (!value) return null;
  let color = value;
  if (typeof color === "object") {
    color = color.argb || color.rgb || color.indexed || color.theme || null;
  }
  if (typeof color !== "string") return null;
  color = color.replace("#", "").trim();
  if (/^[0-9a-fA-F]{8}$/.test(color)) color = color.slice(2);
  if (/^[0-9a-fA-F]{6}$/.test(color)) return `#${color}`;
  return null;
};

const getFillColor = (cell) => {
  const fill = cell.fill;
  if (!fill || fill.type === "none") return null;
  return normalizeColor(fill.fgColor) || normalizeColor(fill.bgColor) || null;
};

const getBorderStyle = (side) => {
  if (!side) return "none";
  const styles = {
    thin: "1px solid", medium: "2px solid", thick: "3px solid",
    double: "3px double", dotted: "1px dotted", dashed: "1px dashed", hair: "1px solid",
  };
  return styles[side.style] || "1px solid";
};

const getBorderColor = (side) => normalizeColor(side?.color) || "#b7b7b7";

const excelValueToText = (value) => {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toLocaleDateString("en-IN");
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (typeof value === "object") {
    if (Array.isArray(value.richText)) return value.richText.map((item) => excelValueToText(item?.text)).join("");
    if (value.text !== undefined) return excelValueToText(value.text);
    if (value.result !== undefined && value.result !== null) return excelValueToText(value.result);
    if (value.error !== undefined) return String(value.error);
    try {
      const json = JSON.stringify(value);
      if (json && json !== "{}") return json;
    } catch {}
  }
  return "";
};

const getPrimitiveCellValue = (cell) => {
  if (!cell) return "";
  return excelValueToText(cell.value);
};

const formatEditorNumber = (value, cell) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value ?? "");
  if (cell?.column?.number === 1 && Number.isInteger(number)) return String(number);
  return number.toLocaleString("en-IN", { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formulaHasMeaningfulInput = (workbook, worksheet, formula, visited = new Set()) => {
  if (!workbook || !worksheet || typeof formula !== "string") return false;
  const expression = formula.replace(/^=/, "");
  const references = [];
  const rangePattern = /(?:(?:'([^']+)'|([A-Za-z0-9\u0900-\u097F _📊-]+))!)?\$?([A-Z]{1,3})\$?(\d+):\$?([A-Z]{1,3})\$?(\d+)/gi;
  let match;
  while ((match = rangePattern.exec(expression))) references.push(match[0]);
  const singlePattern = /(?:(?:'([^']+)'|([A-Za-z0-9\u0900-\u097F _📊-]+))!)?\$?([A-Z]{1,3})\$?(\d+)/gi;
  while ((match = singlePattern.exec(expression))) {
    const full = match[0];
    if (!references.some((range) => range.includes(full))) references.push(full);
  }
  if (!references.length) return /[A-Z]+\s*\(/i.test(expression) ? false : /[0-9]/.test(expression);
  for (const reference of references) {
    const range = parseFormulaRange(reference, worksheet);
    if (range) {
      const target = workbook.getWorksheet(range.worksheetName);
      if (!target) continue;
      const minRow = Math.min(range.startRow, range.endRow), maxRow = Math.max(range.startRow, range.endRow);
      const minCol = Math.min(range.startCol, range.endCol), maxCol = Math.max(range.startCol, range.endCol);
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const refCell = target.getCell(row, col);
          const raw = refCell.value;
          if (raw === null || raw === undefined || raw === "") continue;
          if (raw && typeof raw === "object" && raw.formula !== undefined) {
            const key = `${target.name}!${refCell.address}`;
            if (!visited.has(key) && formulaHasMeaningfulInput(workbook, target, raw.formula, new Set([...visited, key]))) return true;
          } else return true;
        }
      }
      continue;
    }
    const ref = parseSheetCellReference(reference, worksheet);
    if (!ref) continue;
    const target = workbook.getWorksheet(ref.worksheetName);
    if (!target) continue;
    const refCell = target.getCell(ref.address);
    const raw = refCell.value;
    if (raw === null || raw === undefined || raw === "") continue;
    if (raw && typeof raw === "object" && raw.formula !== undefined) {
      const key = `${target.name}!${refCell.address}`;
      if (!visited.has(key) && formulaHasMeaningfulInput(workbook, target, raw.formula, new Set([...visited, key]))) return true;
    } else return true;
  }
  return false;
};

const getCellDisplayText = (cell, workbook = null, worksheet = null) => {
  if (!cell) return "";
  const raw = cell.value;
  if (raw === null || raw === undefined || raw === "") return "";
  if (workbook && worksheet && typeof raw === "object" && raw.formula !== undefined) {
    const value = evaluateCellValue(workbook, worksheet, cell);
    if (value === 0 && !formulaHasMeaningfulInput(workbook, worksheet, raw.formula)) return "";
    if (value !== undefined && value !== null && value !== "") {
      return typeof value === "number" ? formatEditorNumber(value, cell) : excelValueToText(value);
    }
  }
  if (typeof raw === "number" && Number.isFinite(raw)) return formatEditorNumber(raw, cell);
  try {
    if (typeof cell.text === "string" && cell.text.length > 0) return cell.text;
  } catch {}
  return excelValueToText(raw);
};

const splitFormulaParts = (formula, operator) => {
  const parts = [];
  let current = "", depth = 0, quoted = false;
  for (let i = 0; i < formula.length; i++) {
    const ch = formula[i];
    if (ch === '"') { quoted = !quoted; current += ch; continue; }
    if (!quoted) {
      if (ch === "(") depth += 1;
      if (ch === ")") depth -= 1;
      if (ch === operator && depth === 0) { parts.push(current.trim()); current = ""; continue; }
    }
    current += ch;
  }
  parts.push(current.trim());
  return parts;
};

const normalizeFormulaText = (value) => String(value ?? "").replace(/[\u00A0\u202F]/g, " ").trim();

const parseSheetCellReference = (token, activeWorksheet) => {
  const trimmed = normalizeFormulaText(token).replace(/^=/, "");
  const qualified = trimmed.match(/^'(.*?)'!\$?([A-Z]{1,3})\$?(\d+)$/i);
  if (qualified) return { worksheetName: qualified[1], address: `${qualified[2].toUpperCase()}${qualified[3]}` };
  const qualifiedPlain = trimmed.match(/^([^!]+)!\$?([A-Z]{1,3})\$?(\d+)$/i);
  if (qualifiedPlain) return { worksheetName: qualifiedPlain[1], address: `${qualifiedPlain[2].toUpperCase()}${qualifiedPlain[3]}` };
  const local = trimmed.match(/^\$?([A-Z]{1,3})\$?(\d+)$/i);
  if (local) return { worksheetName: activeWorksheet?.name, address: `${local[1].toUpperCase()}${local[2]}` };
  return null;
};

const parseFormulaRange = (token, activeWorksheet) => {
  const trimmed = normalizeFormulaText(token).replace(/^=/, "");
  const match = trimmed.match(/^(?:'(.*?)'|([^!]+))?!?\$?([A-Z]{1,3})\$?(\d+):\$?([A-Z]{1,3})\$?(\d+)$/i);
  if (!match) return null;
  const worksheetName = match[1] || match[2] || activeWorksheet?.name;
  const target = activeWorksheet?.workbook?.getWorksheet?.(worksheetName);
  return { worksheetName, startCol: columnNumber(match[3]), startRow: Number(match[4]), endCol: columnNumber(match[5]), endRow: Number(match[6]), target };
};

const toFormulaNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (value === null || value === undefined || value === "") return 0;
  const cleaned = String(value).replace(/₹/g, "").replace(/,/g, "").replace(/%/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const formulaValueIsBlank = (value) => value === null || value === undefined || String(value).trim() === "";

const compareFormulaValues = (left, right, operator) => {
  const ln = Number(left), rn = Number(right);
  const bothNumbers = left !== "" && right !== "" && Number.isFinite(ln) && Number.isFinite(rn);
  const a = bothNumbers ? ln : String(left ?? "").toLowerCase();
  const b = bothNumbers ? rn : String(right ?? "").toLowerCase();
  if (operator === "=") return a === b;
  if (operator === "<>") return a !== b;
  if (operator === ">") return a > b;
  if (operator === "<") return a < b;
  if (operator === ">=") return a >= b;
  if (operator === "<=") return a <= b;
  return false;
};

const splitComparison = (expression) => {
  let quoted = false, depth = 0;
  for (let i = 0; i < expression.length; i++) {
    const ch = expression[i];
    if (ch === '"') quoted = !quoted;
    if (quoted) continue;
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (depth !== 0) continue;
    const two = expression.slice(i, i + 2);
    if ([">=", "<=", "<>"].includes(two)) return [expression.slice(0, i).trim(), two, expression.slice(i + 2).trim()];
    if (["=", ">", "<"].includes(ch)) return [expression.slice(0, i).trim(), ch, expression.slice(i + 1).trim()];
  }
  return null;
};

const getRangeValues = (workbook, activeWorksheet, token, visited = new Set()) => {
  const range = parseFormulaRange(token, activeWorksheet);
  if (!range) return null;
  const target = workbook.getWorksheet(range.worksheetName);
  if (!target) return null;
  const values = [];
  const minRow = Math.min(range.startRow, range.endRow), maxRow = Math.max(range.startRow, range.endRow);
  const minCol = Math.min(range.startCol, range.endCol), maxCol = Math.max(range.startCol, range.endCol);
  for (let r = minRow; r <= maxRow; r++)
    for (let c = minCol; c <= maxCol; c++)
      values.push(evaluateCellValue(workbook, target, target.getCell(r, c), visited));
  return values;
};

const evaluateFunction = (workbook, activeWorksheet, name, args, visited) => {
  const fn = String(name).toUpperCase();
  if (fn === "IF") {
    const condition = evaluateFormulaValue(workbook, activeWorksheet, args[0] || "", visited);
    const result = condition ? args[1] : args[2];
    return result === undefined ? "" : evaluateFormulaValue(workbook, activeWorksheet, result, visited);
  }
  if (["SUM", "AVERAGE", "MIN", "MAX", "COUNT", "COUNTA"].includes(fn)) {
    const values = [];
    for (const arg of args) {
      const rangeValues = getRangeValues(workbook, activeWorksheet, arg, visited);
      if (rangeValues) values.push(...rangeValues);
      else values.push(evaluateFormulaValue(workbook, activeWorksheet, arg, visited));
    }
    if (fn === "COUNTA") return values.filter((v) => !formulaValueIsBlank(v)).length;
    if (fn === "COUNT") return values.filter((v) => Number.isFinite(Number(v))).length;
    const numbers = values.map(toFormulaNumber).filter((v) => Number.isFinite(v));
    if (fn === "SUM") return numbers.reduce((a, b) => a + b, 0);
    if (fn === "AVERAGE") return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
    if (fn === "MIN") return numbers.length ? Math.min(...numbers) : 0;
    if (fn === "MAX") return numbers.length ? Math.max(...numbers) : 0;
  }
  if (fn === "ROUND" || fn === "ROUNDUP" || fn === "ROUNDDOWN") {
    const number = toFormulaNumber(evaluateFormulaValue(workbook, activeWorksheet, args[0] || "0", visited));
    const digits = Math.trunc(toFormulaNumber(evaluateFormulaValue(workbook, activeWorksheet, args[1] || "0", visited)));
    const factor = Math.pow(10, digits);
    if (fn === "ROUND") return Math.round(number * factor) / factor;
    if (fn === "ROUNDUP") return Math.sign(number) * Math.ceil(Math.abs(number) * factor) / factor;
    return Math.sign(number) * Math.floor(Math.abs(number) * factor) / factor;
  }
  if (fn === "ABS") return Math.abs(toFormulaNumber(evaluateFormulaValue(workbook, activeWorksheet, args[0] || "0", visited)));
  if (fn === "AND") return args.every((arg) => Boolean(evaluateFormulaValue(workbook, activeWorksheet, arg, visited)));
  if (fn === "OR") return args.some((arg) => Boolean(evaluateFormulaValue(workbook, activeWorksheet, arg, visited)));
  if (fn === "NOT") return !Boolean(evaluateFormulaValue(workbook, activeWorksheet, args[0] || "", visited));
  if (fn === "SUBTOTAL") {
    const functionNumber = Math.trunc(toFormulaNumber(evaluateFormulaValue(workbook, activeWorksheet, args[0] || "9", visited)));
    const values = [];
    for (const arg of args.slice(1)) {
      const rangeValues = getRangeValues(workbook, activeWorksheet, arg, visited);
      values.push(...(rangeValues || [evaluateFormulaValue(workbook, activeWorksheet, arg, visited)]));
    }
    if ([1, 101].includes(functionNumber)) { const n = values.map(toFormulaNumber); return n.length ? n.reduce((s, v) => s + v, 0) / n.length : 0; }
    if ([2, 102].includes(functionNumber)) return values.filter((v) => Number.isFinite(Number(v))).length;
    if ([3, 103].includes(functionNumber)) return values.filter((v) => !formulaValueIsBlank(v)).length;
    return values.reduce((s, v) => s + toFormulaNumber(v), 0);
  }
  if (fn === "SUMIF" || fn === "SUMIFS") {
    if (fn === "SUMIF") {
      const criteriaValues = getRangeValues(workbook, activeWorksheet, args[0], visited) || [];
      const criteria = evaluateFormulaValue(workbook, activeWorksheet, args[1] || "", visited);
      const sumValues = getRangeValues(workbook, activeWorksheet, args[2] || args[0], visited) || [];
      let total = 0;
      criteriaValues.forEach((value, index) => { if (compareFormulaValues(value, criteria, "=")) total += toFormulaNumber(sumValues[index]); });
      return total;
    }
    const sumValues = getRangeValues(workbook, activeWorksheet, args[args.length - 1], visited) || [];
    let total = 0;
    const pairs = Math.floor((args.length - 1) / 2);
    const criteriaRanges = [];
    for (let i = 0; i < pairs; i++) criteriaRanges.push({ values: getRangeValues(workbook, activeWorksheet, args[i * 2], visited) || [], criteria: evaluateFormulaValue(workbook, activeWorksheet, args[i * 2 + 1], visited) });
    for (let index = 0; index < sumValues.length; index++) {
      if (criteriaRanges.every((pair) => compareFormulaValues(pair.values[index], pair.criteria, "="))) total += toFormulaNumber(sumValues[index]);
    }
    return total;
  }
  return undefined;
};

const evaluateFormulaValue = (workbook, activeWorksheet, formula, visited = new Set()) => {
  if (!workbook || !activeWorksheet || typeof formula !== "string") return undefined;
  let expression = normalizeFormulaText(formula);
  if (expression.startsWith("=")) expression = expression.slice(1).trim();
  if (!expression) return "";
  if (expression.length >= 2 && expression.startsWith('"') && expression.endsWith('"')) return expression.slice(1, -1).replace(/""/g, '"');
  if (/^TRUE$/i.test(expression)) return true;
  if (/^FALSE$/i.test(expression)) return false;
  if (/^-?(?:\d+(?:\.\d*)?|\.\d+)%$/.test(expression)) return Number(expression.slice(0, -1)) / 100;
  const comparison = splitComparison(expression);
  if (comparison) {
    const left = evaluateFormulaValue(workbook, activeWorksheet, comparison[0], visited);
    const right = evaluateFormulaValue(workbook, activeWorksheet, comparison[2], visited);
    return compareFormulaValues(left, right, comparison[1]);
  }
  const concatParts = splitFormulaParts(expression, "&");
  if (concatParts.length > 1) return concatParts.map((p) => evaluateFormulaValue(workbook, activeWorksheet, p, visited)).map((v) => String(v ?? "")).join("");
  const fnMatch = expression.match(/^([A-Z_][A-Z0-9_.]*)\((.*)\)$/i);
  if (fnMatch) {
    const args = splitFormulaParts(fnMatch[2], ",");
    return evaluateFunction(workbook, activeWorksheet, fnMatch[1], args, visited);
  }
  if (expression.startsWith("(") && expression.endsWith(")")) return evaluateFormulaValue(workbook, activeWorksheet, expression.slice(1, -1), visited);
  const reference = parseSheetCellReference(expression, activeWorksheet);
  if (reference) {
    const target = workbook.getWorksheet(reference.worksheetName);
    if (!target) return undefined;
    return evaluateCellValue(workbook, target, target.getCell(reference.address), visited);
  }
  const arithmeticTokens = [];
  let current = "", depth = 0, quoted = false;
  for (let i = 0; i < expression.length; i++) {
    const ch = expression[i];
    if (ch === '"') quoted = !quoted;
    if (!quoted) {
      if (ch === "(") depth += 1;
      if (ch === ")") depth -= 1;
      if (depth === 0 && ["+", "-", "*", "/"].includes(ch) && i > 0) { arithmeticTokens.push(current.trim(), ch); current = ""; continue; }
    }
    current += ch;
  }
  arithmeticTokens.push(current.trim());
  if (arithmeticTokens.length > 1) {
    const values = [];
    for (const token of arithmeticTokens) {
      if (["+", "-", "*", "/"].includes(token)) { values.push(token); continue; }
      values.push(evaluateFormulaValue(workbook, activeWorksheet, token, visited));
    }
    for (let i = 1; i < values.length - 1; i += 2) {
      if (values[i] === "*" || values[i] === "/") {
        const left = toFormulaNumber(values[i - 1]), right = toFormulaNumber(values[i + 1]);
        values.splice(i - 1, 3, values[i] === "*" ? left * right : right === 0 ? 0 : left / right);
        i -= 2;
      }
    }
    let result = toFormulaNumber(values[0]);
    for (let i = 1; i < values.length; i += 2) {
      const right = toFormulaNumber(values[i + 1]);
      if (values[i] === "+") result += right;
      if (values[i] === "-") result -= right;
    }
    return result;
  }
  const numeric = Number(expression.replace(/,/g, ""));
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
    const calculated = evaluateFormulaValue(workbook, worksheet, `=${value.formula}`, nextVisited);
    if (calculated !== undefined) return calculated;
    if (value.result !== undefined && value.result !== null) return value.result;
    return "";
  }
  return getPrimitiveCellValue(cell);
};

const setCalculatedCellValue = (cell, result) => {
  const current = cell?.value;
  if (current && typeof current === "object" && current.formula !== undefined) cell.value = { formula: current.formula, result };
  else cell.value = result;
};

const findMprWorksheet = (workbook) =>
  workbook?.getWorksheet("📊 MPR REPORT") ||
  workbook?.worksheets?.find((ws) => String(ws.name || "").toLowerCase().includes("mpr report")) || null;

const findRowContaining = (worksheet, matcher, startRow = 1) => {
  for (let rowNumber = startRow; rowNumber <= worksheet.rowCount; rowNumber++) {
    for (let colNumber = 1; colNumber <= worksheet.columnCount; colNumber++) {
      const value = normalizeFormulaText(excelValueToText(worksheet.getCell(rowNumber, colNumber).value)).toLowerCase();
      if (matcher(value)) return rowNumber;
    }
  }
  return 0;
};

const refreshMprStructuredTotals = (workbook) => {
  const worksheet = findMprWorksheet(workbook);
  if (!worksheet) return;
  const headerRow = findRowContaining(worksheet, (v) => v.includes("मद का नाम") || v === "item" || v.includes("item name"));
  const totalRow = findRowContaining(worksheet, (v) => v.includes("ग्रैण्ड योग") || v.includes("grand total"));
  if (!headerRow || !totalRow || totalRow <= headerRow + 1) return;
  const dataStartRow = headerRow + 2;
  const totalValues = [];
  for (let colNumber = 1; colNumber <= worksheet.columnCount; colNumber++) {
    if (colNumber <= 3) { totalValues[colNumber] = null; continue; }
    let total = 0;
    for (let rowNumber = dataStartRow; rowNumber < totalRow; rowNumber++) total += toFormulaNumber(evaluateCellValue(workbook, worksheet, worksheet.getCell(rowNumber, colNumber)));
    let hasSourceValue = false;
    for (let rowNumber = dataStartRow; rowNumber < totalRow; rowNumber++) {
      const sourceValue = worksheet.getCell(rowNumber, colNumber).value;
      if (sourceValue !== null && sourceValue !== undefined && sourceValue !== "") { hasSourceValue = true; break; }
    }
    totalValues[colNumber] = hasSourceValue ? total : null;
    if (hasSourceValue) setCalculatedCellValue(worksheet.getCell(totalRow, colNumber), total);
  }
  const summaryTitleRow = findRowContaining(worksheet, (v) => v.includes("योजना-वार वित्तीय सारांश") || v.includes("scheme-wise financial summary"), totalRow + 1);
  if (!summaryTitleRow) return;
  const summaryHeaderRow = summaryTitleRow + 1;
  const summaryValueRow = summaryHeaderRow + 1;
  const groupHeaderRow = headerRow, subHeaderRow = headerRow + 1;
  let currentGroup = "";
  const financialColumns = new Map();
  for (let colNumber = 4; colNumber <= worksheet.columnCount; colNumber++) {
    const groupText = normalizeFormulaText(excelValueToText(worksheet.getCell(groupHeaderRow, colNumber).value)).toLowerCase();
    if (groupText) currentGroup = groupText;
    const subHeaderText = normalizeFormulaText(excelValueToText(worksheet.getCell(subHeaderRow, colNumber).value)).toLowerCase();
    if (currentGroup && subHeaderText.includes("वित्तीय")) financialColumns.set(currentGroup, colNumber);
  }
  for (let colNumber = 1; colNumber <= worksheet.columnCount; colNumber++) {
    const summaryName = normalizeFormulaText(excelValueToText(worksheet.getCell(summaryHeaderRow, colNumber).value)).toLowerCase();
    if (!summaryName) continue;
    const matchingGroup = [...financialColumns.keys()].find((group) => summaryName.includes(group) || group.includes(summaryName.replace(/\(total\)/g, "").trim()));
    const financialColumn = matchingGroup ? financialColumns.get(matchingGroup) : summaryName.includes("कुल") || summaryName.includes("total") ? worksheet.columnCount : null;
    if (financialColumn && totalValues[financialColumn] !== null) setCalculatedCellValue(worksheet.getCell(summaryValueRow, colNumber), totalValues[financialColumn]);
  }
};

const recalculateWorkbookFormulas = (workbook) => {
  if (!workbook) return;
  for (let pass = 0; pass < 4; pass++) {
    workbook.worksheets.forEach((ws) => {
      ws.eachRow((row) => {
        row.eachCell((cell) => {
          const value = cell.value;
          if (value && typeof value === "object" && value.formula !== undefined) {
            const result = evaluateCellValue(workbook, ws, cell);
            if (result !== undefined) cell.value = { formula: value.formula, result };
          }
        });
      });
    });
  }
  refreshMprStructuredTotals(workbook);
};

const cellToText = (cell, workbook = null, worksheet = null) => {
  if (!cell) return "";
  const displayText = getCellDisplayText(cell, workbook, worksheet);
  if (displayText !== null && displayText !== undefined) return String(displayText);
  if (workbook && worksheet) return excelValueToText(evaluateCellValue(workbook, worksheet, cell));
  return excelValueToText(cell.value);
};

const cellToRawValue = (cell) => {
  if (!cell) return "";
  const value = cell.value;
  if (value && typeof value === "object" && value.formula !== undefined) return `=${value.formula}`;
  return excelValueToText(value);
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
    textDecoration: [font.underline ? "underline" : "", font.strike ? "line-through" : ""].filter(Boolean).join(" ") || "none",
    textAlign: alignment.horizontal === "center" ? "center" : alignment.horizontal === "right" ? "right" : "left",
    verticalAlign: alignment.vertical === "top" ? "top" : alignment.vertical === "bottom" ? "bottom" : "middle",
    whiteSpace: "pre-wrap",
    borderTop: `${getBorderStyle(cell.border?.top)} ${getBorderColor(cell.border?.top)}`,
    borderRight: `${getBorderStyle(cell.border?.right)} ${getBorderColor(cell.border?.right)}`,
    borderBottom: `${getBorderStyle(cell.border?.bottom)} ${getBorderColor(cell.border?.bottom)}`,
    borderLeft: `${getBorderStyle(cell.border?.left)} ${getBorderColor(cell.border?.left)}`,
    padding: "3px 5px",
    outline: isSelected ? "2px solid #217346" : "none",
    outlineOffset: "-2px",
  };
};

const columnNumber = (letters) => {
  let result = 0;
  for (const char of String(letters).toUpperCase()) result = result * 26 + char.charCodeAt(0) - 64;
  return result;
};

const columnLetter = (number) => {
  let result = "", n = number;
  while (n > 0) { const rem = (n - 1) % 26; result = String.fromCharCode(65 + rem) + result; n = Math.floor((n - 1) / 26); }
  return result;
};

const parseMerge = (range) => {
  const [start, end] = String(range).split(":");
  const a = start?.match(/^([A-Z]+)(\d+)$/i);
  const b = end?.match(/^([A-Z]+)(\d+)$/i);
  if (!a || !b) return null;
  return { startRow: Number(a[2]), endRow: Number(b[2]), startCol: columnNumber(a[1]), endCol: columnNumber(b[1]) };
};

const createMergeMap = (worksheet) => {
  const map = new Map();
  const merges = worksheet.model?.merges || [];
  merges.forEach((range) => {
    const merge = parseMerge(range);
    if (!merge) return;
    for (let row = merge.startRow; row <= merge.endRow; row++) {
      for (let col = merge.startCol; col <= merge.endCol; col++) {
        map.set(`${row}:${col}`, { ...merge, isMaster: row === merge.startRow && col === merge.startCol, rowSpan: merge.endRow - merge.startRow + 1, colSpan: merge.endCol - merge.startCol + 1 });
      }
    }
  });
  return map;
};

const getCookie = (name) => {
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const item of cookies) {
    const [key, ...valueParts] = item.trim().split("=");
    if (key === name) return decodeURIComponent(valueParts.join("="));
  }
  return "";
};

const apiFetch = async (url, options = {}) => {
  const method = String(options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  const response = await fetch(url, { ...options, method, headers });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const data = await response.json(); message = data?.detail || data?.error || data?.message || message; } catch {}
    throw new Error(message);
  }
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  return response;
};

const getMediaUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${MEDIA_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const normalizeApiReport = (item) => ({
  id: item.id,
  month: String(item.month ?? ""),
  financialYear: item.financial_year ?? "",
  monthReport: item.month_report ?? "",
  fileName: String(item.month_report || "").split("/").pop() || "MPR.xlsx",
  fileSize: Number(item.file_size || item.size || 0),
  createdAt: item.created_at || "",
  updatedAt: item.updated_at || item.created_at || "",
  file: null,
  apiData: item,
});

const getReportsFromResponse = (data) => {
  const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : data ? [data] : [];
  return list.map(normalizeApiReport);
};

const fetchReportFile = async (report) => {
  if (!report?.id) throw new Error("Report ID is missing.");
  const fileUrl = `${API_URL}${report.id}/`;
  const response = await fetch(fileUrl, {
    method: "GET",
    headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/octet-stream,*/*" },
  });
  if (!response.ok) {
    let message = `Unable to load Excel file (${response.status})`;
    try { const data = await response.json(); message = data?.error || data?.detail || data?.message || message; } catch {}
    throw new Error(message);
  }
  const blob = await response.blob();
  if (!blob || blob.size === 0) throw new Error("The Django file API returned an empty Excel file (0 KB).");
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("text/html") || contentType.includes("application/json")) {
    const text = await blob.text();
    throw new Error(text || "The Django file API did not return an Excel workbook.");
  }
  return new File([blob], report.fileName || "MPR.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", lastModified: Date.now() });
};

const uploadReport = async ({ month, financialYear, file }) => {
  const formData = new FormData();
  formData.append("month", String(month));
  formData.append("financial_year", String(financialYear));
  formData.append("month_report", file);
  return apiFetch(API_URL, { method: "POST", body: formData });
};

const updateReportFile = async ({ id, month, financialYear, file }) => {
  if (!id) throw new Error("Month report ID is missing.");
  if (!file || !file.size) throw new Error("The edited Excel file is empty.");
  const formData = new FormData();
  formData.append("month", String(month ?? ""));
  formData.append("financial_year", String(financialYear ?? ""));
  formData.append("month_report", file, file.name || "MPR.xlsx");
  return apiFetch(`${API_URL}${id}/`, { method: "PUT", body: formData });
};

const deleteReportFromApi = async (id) => {
  await apiFetch(`${API_URL}${id}/`, { method: "DELETE" });
};

const workbookFromFile = async (file) => {
  if (!file) throw new Error("No Excel file was supplied.");
  if (!file.size) throw new Error("The Excel file is empty (0 bytes).");
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  try { await workbook.xlsx.load(buffer); } catch (error) { throw new Error("The server returned a file, but it is not a valid .xlsx workbook."); }
  if (!workbook.worksheets.length) throw new Error("The Excel workbook contains no worksheets.");
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

/* =========================================================
   EXCEL EDITOR (unchanged)
   ========================================================= */

const ExcelEditor = ({ report, onClose, onSaved }) => {
  const [workbook, setWorkbook] = useState(null);
  const [worksheet, setWorksheet] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [formulaText, setFormulaText] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [activeSheetName, setActiveSheetName] = useState("");
  const formulaRef = useRef(null);
  const editingOriginalRef = useRef("");

  const getInitialWorksheet = (book) => {
    if (!book) return null;
    return book.getWorksheet("📝 DATA ENTRY") || book.worksheets.find((ws) => String(ws.name || "").toLowerCase().includes("data entry")) || book.getWorksheet("📊 MPR REPORT") || book.worksheets.find((ws) => String(ws.name || "").toLowerCase().includes("mpr report")) || book.worksheets[0] || null;
  };

  const selectWorksheet = (sheetName) => {
    if (!workbook || !sheetName) return;
    const nextWorksheet = workbook.getWorksheet(sheetName);
    if (!nextWorksheet) return;
    recalculateWorkbookFormulas(workbook);
    setWorksheet(nextWorksheet);
    setActiveSheetName(nextWorksheet.name);
    setSelectedCell(null);
    setFormulaText("");
    setStatus(`Viewing ${nextWorksheet.name} — formulas are up to date`);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const book = await workbookFromFile(report.file);
        recalculateWorkbookFormulas(book);
        if (book.calculation) { book.calculation.fullCalcOnLoad = true; book.calculation.forceFullCalc = true; book.calculation.calcOnSave = true; book.calculation.calcMode = "auto"; }
        const initialWorksheet = getInitialWorksheet(book);
        if (!initialWorksheet) throw new Error("The selected Excel file does not contain any worksheet.");
        if (!cancelled) { setWorkbook(book); setWorksheet(initialWorksheet); setActiveSheetName(initialWorksheet.name); setStatus(`Editing ${report.fileName} — ${initialWorksheet.name}`); }
      } catch (err) {
        if (!cancelled) setError(err?.message || "Excel file could not be opened.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [report.file, report.fileName]);

  const rowCount = Math.max(worksheet?.rowCount || 1, 1);
  const colCount = Math.max(worksheet?.columnCount || 1, 1);
  const mergeMap = useMemo(() => (worksheet ? createMergeMap(worksheet) : new Map()), [worksheet]);

  const selectCell = (row, col) => {
    if (!worksheet) return;
    const cell = worksheet.getCell(row, col);
    setSelectedCell({ row, col });
    const rawValue = String(cellToRawValue(cell) ?? "");
    editingOriginalRef.current = rawValue;
    setFormulaText(rawValue);
    setStatus(`${columnLetter(col)}${row} selected`);
  };

  const commitValue = (row, col, value) => {
    if (!workbook || !worksheet) return;
    const cell = worksheet.getCell(row, col);
    const nextValue = String(value ?? "");
    const isFormulaCell = cell.value && typeof cell.value === "object" && cell.value.formula !== undefined;
    if (isFormulaCell) {
      const typed = nextValue.trim();
      const currentFormula = `=${cell.value.formula}`.trim();
      if (typed === currentFormula) return;
      return;
    }
    const trimmed = nextValue.trim();
    if (trimmed === "") cell.value = null;
    else if (trimmed.startsWith("=")) cell.value = { formula: trimmed.slice(1) };
    else if (/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(trimmed.replace(/,/g, ""))) cell.value = Number(trimmed.replace(/,/g, ""));
    else cell.value = nextValue;
    recalculateWorkbookFormulas(workbook);
    if (workbook.calculation) { workbook.calculation.fullCalcOnLoad = true; workbook.calculation.forceFullCalc = true; workbook.calculation.calcOnSave = true; workbook.calculation.calcMode = "auto"; }
    setDirty(true);
    setStatus(`${columnLetter(col)}${row} updated — all dependent formulas recalculated`);
  };

  const commitFormulaBar = () => {
    if (!selectedCell) return;
    commitValue(selectedCell.row, selectedCell.col, formulaText);
  };

  const saveChanges = async () => {
    if (!workbook || !report) return;
    try {
      setSaving(true);
      setError("");
      setStatus("Recalculating formulas before save...");
      recalculateWorkbookFormulas(workbook);
      if (workbook.calculation) { workbook.calculation.fullCalcOnLoad = true; workbook.calculation.forceFullCalc = true; workbook.calculation.calcOnSave = true; workbook.calculation.calcMode = "auto"; }
      const buffer = await workbook.xlsx.writeBuffer();
      const newFile = new File([buffer], report.fileName, { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", lastModified: Date.now() });
      setStatus("Uploading edited Excel file...");
      const responseData = await updateReportFile({ id: report.id, month: report.month, financialYear: report.financialYear, file: newFile });
      const apiReport = responseData ? getReportsFromResponse(responseData)[0] : null;
      const updatedReport = { ...report, ...(apiReport || {}), id: report.id, month: report.month, financialYear: report.financialYear, file: newFile, fileName: apiReport?.fileName || report.fileName, fileSize: newFile.size, updatedAt: apiReport?.updatedAt || new Date().toISOString(), monthReport: apiReport?.monthReport || report.monthReport };
      setDirty(false);
      setStatus("Changes saved successfully.");
      onSaved(updatedReport);
    } catch (err) {
      setError(err?.message || "Unable to save the edited Excel file.");
    } finally {
      setSaving(false);
    }
  };

  const downloadCurrent = async () => {
    if (!workbook) return;
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), report.fileName);
    } catch {
      setError("Unable to download the Excel file.");
    }
  };

  return (
    <div className="excel-editor-overlay">
      <div className="excel-editor-window">
        <div className="excel-top-header">
          <div className="excel-title-left">
            <div className="excel-logo">X</div>
            <div className="excel-document-name">
              <strong>{report.fileName}</strong>
              <span>{dirty ? "Unsaved changes" : `Excel workbook — ${activeSheetName || "Ready"}`}</span>
            </div>
          </div>
          <div className="excel-top-actions">
            <button type="button" className="excel-save-button" onClick={saveChanges} disabled={!dirty || saving}>
              {saving ? "Saving..." : "💾 Save Changes"}
            </button>
            <button type="button" className="excel-download-button" onClick={downloadCurrent} disabled={!workbook}>⬇ Download</button>
            <button type="button" className="excel-close-button" onClick={() => { if (dirty && !window.confirm("You have unsaved changes. Close without saving?")) return; onClose(); }}>✕</button>
          </div>
        </div>
        <div className="excel-ribbon">
          <div className="excel-ribbon-group">
            <button type="button" onClick={() => formulaRef.current?.focus()}>fx</button>
            <span className="excel-ribbon-label">Formula</span>
          </div>
          <div className="excel-ribbon-divider" />
          <div className="excel-ribbon-info">
            <span>{selectedCell ? `${columnLetter(selectedCell.col)}${selectedCell.row}` : "Select a cell"}</span>
            <span>📄 {activeSheetName || worksheet?.name || "Sheet"}</span>
          </div>
          <div className="excel-ribbon-status">{status || "Ready"}</div>
        </div>
        <div className="excel-formula-row">
          <div className="excel-name-box">{selectedCell ? `${columnLetter(selectedCell.col)}${selectedCell.row}` : ""}</div>
          <div className="excel-formula-label">fx</div>
          <input ref={formulaRef} className="excel-formula-input" value={formulaText} onChange={(e) => setFormulaText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitFormulaBar(); } }} placeholder="Select a cell to edit its value or formula" />
        </div>
        {error && (
          <div className="excel-editor-error">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>×</button>
          </div>
        )}
        {loading ? (
          <div className="excel-editor-loading">
            <div className="excel-spinner" />
            <h3>Opening Excel Workbook...</h3>
            <p>Loading DATA ENTRY, formulas, MPR REPORT and dashboard sheets.</p>
          </div>
        ) : (
          <div className="excel-workspace">
            <div className="excel-grid-scroll">
              <table className="excel-edit-grid">
                <colgroup>
                  <col className="excel-row-number-column" />
                  {Array.from({ length: colCount }, (_, i) => (<col key={i + 1} style={{ width: `${Math.max(35, (worksheet.getColumn(i + 1).width || 10) * 7)}px` }} />))}
                </colgroup>
                <thead>
                  <tr>
                    <th className="excel-corner-cell" />
                    {Array.from({ length: colCount }, (_, i) => {
                      const column = worksheet.getColumn(i + 1);
                      return (<th key={i + 1} className="excel-column-header" style={{ display: column.hidden ? "none" : "table-cell" }}>{columnLetter(i + 1)}</th>);
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: rowCount }, (_, r) => {
                    const rowNumber = r + 1;
                    const row = worksheet.getRow(rowNumber);
                    return (
                      <tr key={rowNumber} style={{ height: `${Math.max(18, row.height || 18)}px`, display: row.hidden ? "none" : "table-row" }}>
                        <th className="excel-row-header">{rowNumber}</th>
                        {Array.from({ length: colCount }, (_, c) => {
                          const colNumber = c + 1;
                          const cell = worksheet.getCell(rowNumber, colNumber);
                          const merge = mergeMap.get(`${rowNumber}:${colNumber}`);
                          if (merge && !merge.isMaster) return null;
                          const selected = selectedCell?.row === rowNumber && selectedCell?.col === colNumber;
                          return (
                            <td key={`${rowNumber}-${colNumber}`} rowSpan={merge?.rowSpan || 1} colSpan={merge?.colSpan || 1} style={getCellStyle(cell, selected)} className={selected ? "excel-edit-cell selected" : "excel-edit-cell"} onClick={() => selectCell(rowNumber, colNumber)} contentEditable={!(typeof cell.value === "object" && cell.value?.formula !== undefined)} suppressContentEditableWarning spellCheck={false} onFocus={() => selectCell(rowNumber, colNumber)} onBlur={(event) => { const isFormulaCell = cell.value && typeof cell.value === "object" && cell.value.formula !== undefined; if (!isFormulaCell) commitValue(rowNumber, colNumber, event.currentTarget.textContent || ""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); event.currentTarget.blur(); setTimeout(() => selectCell(rowNumber + 1, colNumber), 0); } if (event.key === "Tab") { event.preventDefault(); event.currentTarget.blur(); setTimeout(() => selectCell(rowNumber, colNumber + 1), 0); } }}>
                              {cellToText(cell, workbook, worksheet)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="excel-bottom-bar">
              <div className="excel-sheet-controls" />
              <div className="excel-sheet-tabs">
                {workbook?.worksheets?.map((sheet) => {
                  const isActive = sheet.name === activeSheetName;
                  return (
                    <button key={sheet.name} type="button" className={`excel-sheet-tab ${isActive ? "active" : ""}`} onClick={() => selectWorksheet(sheet.name)} title={`Open ${sheet.name}`}>
                      {String(sheet.name).includes("DATA ENTRY") ? "📝 DATA ENTRY" : String(sheet.name).includes("MPR REPORT") ? "📊 MPR REPORT" : String(sheet.name).includes("DASHBOARD") ? "📈 DASHBOARD" : sheet.name}
                    </button>
                  );
                })}
              </div>
              <div className="excel-zoom">100%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   DASHBOARD TAB — New API-driven form-to-summary flow
   ========================================================= */

const DashboardTab = ({ report }) => {
  const [yojanaData, setYojanaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formRows, setFormRows] = useState([emptyFormRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [showViewForm, setShowViewForm] = useState(false);
  const [viewRows, setViewRows] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchYojanaReports();
      setYojanaData(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err) {
      setError(err?.message || "योजना बजट डेटा लोड करने में असमर्थ।");
      setYojanaData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFillForm = () => {
    setFormRows([emptyFormRow()]);
    setFormError("");
    setShowForm(true);
  };

  const addRow = () => {
    setFormRows((prev) => [...prev, emptyFormRow()]);
  };

  const removeRow = (index) => {
    if (formRows.length <= 1) return;
    setFormRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRow = (index, field, value) => {
    setFormRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const handleSubmit = async () => {
    setFormError("");
    for (let i = 0; i < formRows.length; i++) {
      const row = formRows[i];
      if (!String(row.yojana || "").trim()) {
        setFormError(`पंक्ति ${i + 1}: कृपया योजना का नाम दर्ज करें।`);
        return;
      }
    }
    try {
      setSubmitting(true);
      for (const row of formRows) {
        const payload = computeYojanaPayload(row);
        await createYojanaReport(payload);
      }
      setShowForm(false);
      setFormRows([emptyFormRow()]);
      await loadData();
    } catch (err) {
      setFormError(err?.message || "सबमिशन विफल। कृपया पुनः प्रयास करें।");
    } finally {
      setSubmitting(false);
    }
  };

  const openViewForm = () => {
    setViewRows(yojanaData.map(item => ({
      id: item.id,
      yojana: item.yojana || "",
      budget: item.budget || "",
      released_amount: item.released_amount || "",
      expenditure: item.expenditure || ""
    })));
    setFormError("");
    setShowViewForm(true);
  };

  const addViewRow = () => {
    setViewRows((prev) => [...prev, emptyFormRow()]);
  };

  const updateViewRow = (index, field, value) => {
    setViewRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const handleViewSubmit = async () => {
    setFormError("");
    for (let i = 0; i < viewRows.length; i++) {
      const row = viewRows[i];
      if (!String(row.yojana || "").trim()) {
        setFormError(`पंक्ति ${i + 1}: कृपया योजना का नाम दर्ज करें।`);
        return;
      }
    }
    try {
      setSubmitting(true);
      for (const row of viewRows) {
        const payload = computeYojanaPayload(row);
        if (row.id) {
          await updateYojanaReport({ id: row.id, ...payload });
        } else {
          await createYojanaReport(payload);
        }
      }
      setShowViewForm(false);
      await loadData();
    } catch (err) {
      setFormError(err?.message || "सबमिशन विफल। कृपया पुनः प्रयास करें।");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDelete = async (index, id) => {
    if (!id) {
      setViewRows(prev => prev.filter((_, i) => i !== index));
      return;
    }
    if (!window.confirm("क्या आप इस योजना डेटा को हटाना चाहते हैं?")) return;
    try {
      setFormError("");
      await deleteYojanaReports([id]);
      setViewRows(prev => prev.filter((r, i) => i !== index));
      await loadData();
    } catch (err) {
      setFormError(err?.message || "डिलीट विफल।");
    }
  };

  const totals = yojanaData.reduce(
    (acc, item) => {
      acc.budget += Number(item.budget || 0);
      acc.released += Number(item.released_amount || 0);
      acc.expenditure += Number(item.expenditure || 0);
      acc.balReleased += Number(item.expenditure_balance_released || 0);
      acc.balBudget += Number(item.expenditure_balance_budget || 0);
      return acc;
    },
    { budget: 0, released: 0, expenditure: 0, balReleased: 0, balBudget: 0 }
  );

  const financialYear = report?.financialYear || "2026-27";

  const cards = [
    { label: "कुल बजट", value: totals.budget },
    { label: "कुल अवमुक्त", value: totals.released },
    { label: "कुल खर्च", value: totals.expenditure },
    { label: "अवमुक्त में खर्च शेष", value: totals.balReleased },
    { label: "बजट में खर्च शेष", value: totals.balBudget },
  ];

  if (loading) {
    return (
      <div className="mpr-dashboard-loading">
        <div className="mpr-loading-small" />
        <p>योजना बजट डेटा लोड हो रहा है...</p>
      </div>
    );
  }

  return (
    <div className="mpr-dashboard-page">
      {/* Title header */}
      <div className="mpr-dashboard-title">
        समस्त योजनाओं का वित्तीय सारांश — वर्ष {financialYear}
        <span>MPR विभाग • वित्तीय रिपोर्ट</span>
      </div>

      {error && (
        <div style={{ padding: "16px", textAlign: "center", color: "#b42318", background: "#fff5f5", fontSize: "13px" }}>
          {error}
        </div>
      )}

      {/* Empty state — no data, show Fill Form button */}
      {yojanaData.length === 0 && !showForm ? (
        <div style={{ padding: "60px 20px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
          <h4 style={{ margin: "0 0 8px", color: "#374151", fontSize: "16px" }}>कोई योजना बजट डेटा नहीं मिला</h4>
          <p style={{ margin: "0 0 20px", color: "#7b8794", fontSize: "13px" }}>
            नया डेटा दर्ज करने के लिए "Fill Form" पर क्लिक करें।
          </p>
          <button type="button" className="mpr-empty-btn" onClick={handleFillForm}>
            + Fill Form
          </button>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mpr-dashboard-summary-grid" style={{ "--mpr-card-columns": 5 }}>
            {cards.map((card, i) => (
              <div key={i} className="mpr-dashboard-summary-card">
                <div className="mpr-dashboard-card-label">{card.label}</div>
                <div className="mpr-dashboard-card-value">{formatYojanaVal(card.value)}</div>
                <div className="mpr-dashboard-card-unit">रुपये</div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="mpr-dashboard-table-card">
            <div className="mpr-dashboard-table-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>योजना-वार तुलना — वित्तीय वर्ष {financialYear}</span>
              <button type="button" className="mpr-empty-btn" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={openViewForm}>
                View Form
              </button>
            </div>
            <div className="mpr-dashboard-table-scroll" style={{ overflowX: "auto" }}>
              <table className="mpr-dashboard-table" style={{ minWidth: "1050px" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "center" }}>क्र.सं.</th>
                    <th>योजना</th>
                    <th style={{ textAlign: "right" }}>बजट</th>
                    <th style={{ textAlign: "right" }}>अवमुक्त</th>
                    <th style={{ textAlign: "right" }}>खर्च हुआ</th>
                    <th style={{ textAlign: "right" }}>खर्च शेष (अवमुक्त में से)</th>
                    <th style={{ textAlign: "right" }}>खर्च शेष (बजट में से)</th>
                  </tr>
                </thead>
                <tbody>
                  {yojanaData.map((item, index) => (
                    <tr key={item.id || index}>
                      <td style={{ textAlign: "center" }}>{index + 1}</td>
                      <td>{item.yojana || "—"}</td>
                      <td style={{ textAlign: "right" }}>{formatYojanaVal(item.budget)}</td>
                      <td style={{ textAlign: "right" }}>{formatYojanaVal(item.released_amount)}</td>
                      <td style={{ textAlign: "right" }}>{formatYojanaVal(item.expenditure)}</td>
                      <td style={{ textAlign: "right" }}>{formatYojanaVal(item.expenditure_balance_released)}</td>
                      <td style={{ textAlign: "right" }}>{formatYojanaVal(item.expenditure_balance_budget)}</td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr style={{ background: "#d5f5e3", fontWeight: "800" }}>
                    <td style={{ textAlign: "center" }}>—</td>
                    <td>कुल योग</td>
                    <td style={{ textAlign: "right" }}>{formatYojanaVal(totals.budget)}</td>
                    <td style={{ textAlign: "right" }}>{formatYojanaVal(totals.released)}</td>
                    <td style={{ textAlign: "right" }}>{formatYojanaVal(totals.expenditure)}</td>
                    <td style={{ textAlign: "right" }}>{formatYojanaVal(totals.balReleased)}</td>
                    <td style={{ textAlign: "right" }}>{formatYojanaVal(totals.balBudget)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ===== Fill Form Modal ===== */}
      {showForm && (
        <div className="mpr-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="mpr-modal" style={{ maxWidth: "1180px" }}>
            <div className="mpr-modal-header">
              <div>
                <h3>योजना बजट रिपोर्ट दर्ज करें</h3>
                <p>वित्तीय वर्ष {financialYear} • नई पंक्तियाँ जोड़ें और सबमिट करें</p>
              </div>
              <button type="button" className="mpr-close-btn" onClick={() => !submitting && setShowForm(false)} disabled={submitting}>×</button>
            </div>
            <div className="mpr-modal-body" style={{ padding: "16px" }}>
              {formError && (
                <div className="mpr-modal-error" style={{ marginBottom: "12px" }}>{formError}</div>
              )}
              <div style={{ overflowX: "auto" }}>
                <table className="mpr-yojana-form-table" style={{ minWidth: "980px" }}>
                  <thead>
<tr>
                       <th style={{ width: "40px" }}>क्रम</th>
                       <th style={{ minWidth: "140px" }}>योजना</th>
                       <th style={{ width: "110px" }}>बजट</th>
                       <th style={{ width: "110px" }}>अवमुक्त</th>
                       <th style={{ width: "110px" }}>खर्च हुआ</th>
                       <th style={{ width: "100px" }}>शेष (अवमुक्त)</th>
                       <th style={{ width: "100px" }}>शेष (बजट)</th>
                       <th style={{ width: "50px" }}>✕</th>
                     </tr>
                   </thead>
                   <tbody>
                     {formRows.map((row, index) => {
                       const calc = computeYojanaPayload(row);
                       return (
                         <tr key={index}>
                           <td className="mpr-yojana-form-serial">{index + 1}</td>
                           <td>
                             <input type="text" value={row.yojana} onChange={(e) => updateRow(index, "yojana", e.target.value)} placeholder="योजना का नाम" />
                           </td>
                           <td>
                             <input type="number" step="0.01" value={row.budget} onChange={(e) => updateRow(index, "budget", e.target.value)} placeholder="0.00" />
                           </td>
                           <td>
                             <input type="number" step="0.01" value={row.released_amount} onChange={(e) => updateRow(index, "released_amount", e.target.value)} placeholder="0.00" />
                           </td>
                           <td>
                             <input type="number" step="0.01" value={row.expenditure} onChange={(e) => updateRow(index, "expenditure", e.target.value)} placeholder="0.00" />
                           </td>
                           <td className="mpr-yojana-form-calc">{formatYojanaVal(calc.expenditure_balance_released)}</td>
                           <td className="mpr-yojana-form-calc">{formatYojanaVal(calc.expenditure_balance_budget)}</td>
                           <td className="mpr-yojana-form-remove">
                             <button type="button" onClick={() => removeRow(index)} disabled={formRows.length <= 1}>✕</button>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                </table>
              </div>
              <button type="button" className="mpr-yojana-add-row-btn" onClick={addRow}>+ Add Row</button>
            </div>
            <div className="mpr-modal-footer">
              <button type="button" className="mpr-cancel-btn" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</button>
              <button type="button" className="mpr-submit-btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== View Form Modal ===== */}
      {showViewForm && (
        <div className="mpr-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="mpr-modal" style={{ maxWidth: "1180px" }}>
            <div className="mpr-modal-header">
              <div>
                <h3>योजना बजट रिपोर्ट देखें और संपादित करें</h3>
                <p>वित्तीय वर्ष {financialYear} • डेटा संपादित करें या हटाएँ</p>
              </div>
              <button type="button" className="mpr-close-btn" onClick={() => !submitting && setShowViewForm(false)} disabled={submitting}>×</button>
            </div>
            <div className="mpr-modal-body" style={{ padding: "16px" }}>
              {formError && (
                <div className="mpr-modal-error" style={{ marginBottom: "12px" }}>{formError}</div>
              )}
              <div style={{ overflowX: "auto" }}>
                <table className="mpr-yojana-form-table" style={{ minWidth: "980px" }}>
                  <thead>
<tr>
                       <th style={{ width: "40px" }}>क्रम</th>
                       <th style={{ minWidth: "140px" }}>योजना</th>
                       <th style={{ width: "110px" }}>बजट</th>
                       <th style={{ width: "110px" }}>अवमुक्त</th>
                       <th style={{ width: "110px" }}>खर्च हुआ</th>
                       <th style={{ width: "100px" }}>शेष (अवमुक्त)</th>
                       <th style={{ width: "100px" }}>शेष (बजट)</th>
                       <th style={{ width: "50px" }}>✕</th>
                     </tr>
                   </thead>
                   <tbody>
                     {viewRows.map((row, index) => {
                       const calc = computeYojanaPayload(row);
                       return (
                         <tr key={row.id || `new-${index}`}>
                           <td className="mpr-yojana-form-serial">{index + 1}</td>
                           <td>
                             <input type="text" value={row.yojana} onChange={(e) => updateViewRow(index, "yojana", e.target.value)} placeholder="योजना का नाम" />
                           </td>
                           <td>
                             <input type="number" step="0.01" value={row.budget} onChange={(e) => updateViewRow(index, "budget", e.target.value)} placeholder="0.00" />
                           </td>
                           <td>
                             <input type="number" step="0.01" value={row.released_amount} onChange={(e) => updateViewRow(index, "released_amount", e.target.value)} placeholder="0.00" />
                           </td>
                           <td>
                             <input type="number" step="0.01" value={row.expenditure} onChange={(e) => updateViewRow(index, "expenditure", e.target.value)} placeholder="0.00" />
                           </td>
                           <td className="mpr-yojana-form-calc">{formatYojanaVal(calc.expenditure_balance_released)}</td>
                           <td className="mpr-yojana-form-calc">{formatYojanaVal(calc.expenditure_balance_budget)}</td>
                           <td className="mpr-yojana-form-remove">
                             <button type="button" onClick={() => handleViewDelete(index, row.id)}>✕</button>
                           </td>
                         </tr>
                       );
                     })}
                     {/* Total row for View Form */}
                     <tr style={{ background: "#d5f5e3", fontWeight: "800" }}>
                       <td className="mpr-yojana-form-serial">—</td>
                       <td>कुल योग</td>
                       <td className="mpr-yojana-form-calc">{formatYojanaVal(viewRows.reduce((s, r) => s + round2(r.budget), 0))}</td>
                       <td className="mpr-yojana-form-calc">{formatYojanaVal(viewRows.reduce((s, r) => s + round2(r.released_amount), 0))}</td>
                       <td className="mpr-yojana-form-calc">{formatYojanaVal(viewRows.reduce((s, r) => s + round2(r.expenditure), 0))}</td>
                       <td className="mpr-yojana-form-calc">{formatYojanaVal(viewRows.reduce((s, r) => s + round2(round2(r.released_amount) - round2(r.expenditure)), 0))}</td>
                       <td className="mpr-yojana-form-calc">{formatYojanaVal(viewRows.reduce((s, r) => s + round2(round2(r.budget) - round2(r.expenditure)), 0))}</td>
                       <td />
                     </tr>
                   </tbody>
                </table>
              </div>
              <button type="button" className="mpr-yojana-add-row-btn" onClick={addViewRow}>+ Add New Row</button>
            </div>
            <div className="mpr-modal-footer">
              <button type="button" className="mpr-cancel-btn" onClick={() => setShowViewForm(false)} disabled={submitting}>Cancel</button>
              <button type="button" className="mpr-submit-btn" onClick={handleViewSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   MONTH REPORT (Main Component)
   ========================================================= */

const MonthReport = () => {
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  const [month, setMonth] = useState("");
  const [financialYear, setFinancialYear] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
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
      setSelectedReport(null);
    } catch (err) {
      setError(err?.message || "Unable to load MPR reports from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredReports = useMemo(
    () =>
      reports.filter(
        (item) =>
          (!monthFilter || String(item.month) === String(monthFilter)) &&
          (!yearFilter || String(item.financialYear) === String(yearFilter))
      ),
    [reports, monthFilter, yearFilter]
  );

  const uniqueYears = useMemo(
    () => [...new Set(reports.map((item) => item.financialYear).filter(Boolean))],
    [reports]
  );

  const dashboardReports = useMemo(() => {
    if (monthFilter || yearFilter) return filteredReports;
    const currentMonth = String(new Date().getMonth() + 1);
    return reports.filter((item) => String(item.month) === currentMonth);
  }, [reports, filteredReports, monthFilter, yearFilter]);

  useEffect(() => {
    if (activeTab !== "dashboard") return;
    if (selectedReport) return;
    if (!dashboardReports.length) {
      setSelectedReport(null);
      return;
    }
    setSelectedReport(dashboardReports[0]);
  }, [activeTab, dashboardReports, selectedReport?.id]);

  const selectReport = (event) => {
    const id = event.target.value;
    if (!id) {
      setSelectedReport(null);
      return;
    }
    const report = reports.find((item) => String(item.id) === String(id));
    if (!report) return;
    setSelectedReport(report);
  };

  const resetForm = () => {
    setMonth("");
    setFinancialYear("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      setError("Only .xlsx Excel files are supported.");
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
    if (validateFile(file)) setSelectedFile(file);
    else {
      event.target.value = "";
      setSelectedFile(null);
    }
  };

  const saveNewReport = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!month) return setError("Please select Month.");
    if (!financialYear) return setError("Please select Financial Year.");
    if (!validateFile(selectedFile)) return;
    try {
      await workbookFromFile(selectedFile);
      setLoading(true);
      await uploadReport({ month, financialYear, file: selectedFile });
      await loadReports();
      setSuccess("MPR Excel report uploaded successfully to the server.");
      setShowModal(false);
      resetForm();
    } catch (err) {
      setError(err?.message || "The selected Excel file could not be uploaded.");
    } finally {
      setLoading(false);
    }
  };

  const openReport = async (report) => {
    try {
      setError("");
      setSuccess("");
      const file = await fetchReportFile(report);
      setEditingReport({ ...report, file, fileSize: file.size });
      setShowEditor(true);
    } catch (err) {
      setError(err?.message || "Unable to open the Excel report.");
    }
  };

  const handleEditorSaved = async (updatedReport) => {
    setReports((previous) =>
      previous.map((item) => (item.id === updatedReport.id ? updatedReport : item))
    );
    setSelectedReport(updatedReport);
    setSuccess(`${updatedReport.fileName} was replaced with the edited Excel file.`);
  };

  const deleteReport = async (id) => {
    if (!window.confirm("क्या आप इस MPR Excel report को delete करना चाहते हैं?")) return;
    try {
      setError("");
      await deleteReportFromApi(id);
      setReports((previous) => previous.filter((item) => item.id !== id));
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
      setSuccess("MPR Excel report deleted successfully from the server.");
    } catch (err) {
      setError(err?.message || "Unable to delete the report from the server.");
    }
  };

  return (
    <div className="month-report-page">
      <style>{`
        .mpr-module-card {
          background: #fff;
          border: 1px solid #dfe5ea;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,.05);
        }
        .mpr-module-toolbar {
          display:flex; justify-content:space-between; align-items:center; gap:16px;
          flex-wrap:wrap; padding:10px 14px; background:#f7f9fb; border-bottom:1px solid #dfe5ea;
        }
        .mpr-main-tabs { display:flex; gap:0; }
        .mpr-main-tab {
          border:1px solid #cfd8df; border-bottom:3px solid transparent; background:#edf1f4;
          color:#23415f; padding:10px 20px; cursor:pointer; font-weight:700; font-size:14px;
        }
        .mpr-main-tab:first-child { border-radius:5px 0 0 5px; }
        .mpr-main-tab:last-child { border-radius:0 5px 5px 0; }
        .mpr-main-tab.active { background:#1a5276; color:#fff; border-color:#1a5276; }
        .mpr-file-filters { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .mpr-file-filters select {
          min-width:145px; height:36px; padding:0 9px; border:1px solid #c9d3dc; border-radius:5px;
          background:#fff; color:#243b53; font-size:13px; outline:none;
        }
        .mpr-file-filters select:last-child { min-width:330px; }
        .mpr-file-filters select:focus { border-color:#1a5276; box-shadow:0 0 0 2px rgba(26,82,118,.1); }
        .mpr-dashboard-wrapper { background:#fff; }
        .mpr-dashboard-page { width:100%; padding:0; background:#fff; color:#1b2631; font-family:Arial,sans-serif; }
        .mpr-dashboard-title { background:#1a5276; color:#fff; text-align:center; padding:11px 14px 8px; border-bottom:1px solid #154360; font-weight:700; font-size:18px; }
        .mpr-dashboard-title span { display:block; margin-top:4px; font-size:12px; font-weight:600; color:#eaf5fb; }
        .mpr-dashboard-summary-grid { display:grid; grid-template-columns:repeat(var(--mpr-card-columns, 5),minmax(0,1fr)); gap:0; border-bottom:1px solid #cbd5dc; }
        .mpr-dashboard-summary-card { min-width:0; min-height:102px; padding:13px 8px 10px; text-align:center; background:#f8f9fa; border-right:1px solid #cbd5dc; }
        .mpr-dashboard-summary-card:last-child { border-right:0; }
        .mpr-dashboard-summary-card.main-total { background:#d5f5e3; }
        .mpr-dashboard-card-label { color:#1a5276; font-size:12px; font-weight:700; min-height:32px; display:flex; align-items:center; justify-content:center; }
        .mpr-dashboard-card-value { margin-top:6px; font-size:20px; font-weight:800; color:#1b2631; }
        .mpr-dashboard-summary-card.main-total .mpr-dashboard-card-value { color:#1e8449; }
        .mpr-dashboard-card-unit { margin-top:4px; font-size:10px; color:#596a79; }
        .mpr-dashboard-table-card { margin:16px; border:1px solid #d7dee4; }
        .mpr-dashboard-table-title { background:#1a5276; color:#fff; padding:8px 12px; font-size:13px; font-weight:700; }
        .mpr-dashboard-table-scroll { overflow-x:auto; }
        .mpr-dashboard-table { width:100%; border-collapse:collapse; font-size:13px; }
        .mpr-dashboard-table th { background:#154360; color:#fff; padding:8px 10px; text-align:left; border:1px solid #fff; }
        .mpr-dashboard-table td { padding:8px 10px; border:1px solid #d7dee4; }
        .mpr-dashboard-table tbody tr:nth-child(even) { background:#f8f9fa; }
        .mpr-dashboard-loading { padding:70px 20px; text-align:center; color:#5d7083; }
        .mpr-dashboard-error { padding:45px 20px; text-align:center; color:#b42318; background:#fff5f5; }
        /* Yojana form styles */
        .mpr-yojana-form-table { width:100%; border-collapse:collapse; font-size:12px; }
        .mpr-yojana-form-table th { background:#154360; color:#fff; padding:8px 6px; text-align:center; border:1px solid #fff; font-size:11px; white-space:nowrap; }
        .mpr-yojana-form-table td { padding:5px 6px; border:1px solid #d7dee4; }
        .mpr-yojana-form-table input { width:100%; padding:5px 6px; border:1px solid #d1d5db; border-radius:4px; font-size:12px; box-sizing:border-box; outline:none; }
        .mpr-yojana-form-table input:focus { border-color:#0b5cab; }
        .mpr-yojana-form-calc { text-align:right; font-weight:600; color:#4b5563; white-space:nowrap; }
        .mpr-yojana-form-serial { text-align:center; color:#7b8794; font-weight:600; }
        .mpr-yojana-form-remove { text-align:center; }
        .mpr-yojana-form-remove button { border:0; background:transparent; color:#be123c; cursor:pointer; font-size:16px; padding:4px; }
        .mpr-yojana-form-remove button:disabled { color:#ccc; cursor:not-allowed; }
        .mpr-yojana-add-row-btn { padding:8px 14px; border:1px dashed #0b5cab; border-radius:5px; background:#f0f7ff; color:#0b5cab; cursor:pointer; font-size:12px; font-weight:600; margin-top:10px; }
        .mpr-yojana-add-row-btn:hover { background:#e0efff; }
        @media (max-width:1100px) { .mpr-dashboard-summary-grid { grid-template-columns:repeat(4,minmax(0,1fr)) !important; } .mpr-dashboard-summary-card { border-bottom:1px solid #cbd5dc; } .mpr-file-filters select:last-child { min-width:260px; } }
        @media (max-width:700px) { .mpr-dashboard-summary-grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; } .mpr-main-tabs { width:100%; } .mpr-main-tab { flex:1; padding:9px 10px; } .mpr-file-filters { width:100%; } .mpr-file-filters select, .mpr-file-filters select:last-child { min-width:100%; width:100%; } .mpr-dashboard-card-value { font-size:17px; } .mpr-dashboard-table-card { margin:10px; } }
      `}</style>
      <div className="month-report-container">
        <div className="month-report-header">
          <div>
            <h2>Monthly Progress Report</h2>
            <p>Upload, view and edit your Excel MPR directly in the browser.</p>
          </div>
          <button type="button" className="mpr-add-btn" onClick={openAdd}>
            + Add MPR Report
          </button>
        </div>

        {success && (
          <div className="mpr-alert mpr-success">
            {success}
            <button type="button" onClick={() => setSuccess("")}>×</button>
          </div>
        )}

        {error && !showModal && !showEditor && (
          <div className="mpr-alert mpr-error">
            {error}
            <button type="button" onClick={() => setError("")}>×</button>
          </div>
        )}

        <div className="mpr-module-card">
          <div className="mpr-module-toolbar">
            <div className="mpr-main-tabs">
              <button
                type="button"
                className={activeTab === "dashboard" ? "mpr-main-tab active" : "mpr-main-tab"}
                onClick={() => setActiveTab("dashboard")}
              >
                📈 Dashboard
              </button>
              <button
                type="button"
                className={activeTab === "mpr" ? "mpr-main-tab active" : "mpr-main-tab"}
                onClick={() => setActiveTab("mpr")}
              >
                📊 MPR Report
              </button>
            </div>

            {activeTab === "mpr" && (
              <div className="mpr-file-filters">
                <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                  <option value="">Select Month</option>
                  {months.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>

                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                  <option value="">Select Financial Year</option>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                <select
                  value={selectedReport?.id || ""}
                  onChange={selectReport}
                  disabled={!filteredReports.length}
                >
                  <option value="">Select MPR Excel File</option>
                  {filteredReports.map((item) => (
                    <option key={item.id} value={item.id}>
                      {getMonthName(item.month)} — {item.financialYear} — {item.fileName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {activeTab === "dashboard" ? (
            <div className="mpr-dashboard-wrapper">
              <DashboardTab report={selectedReport} />
            </div>
          ) : (
            <div className="mpr-table-wrapper">
              {loading ? (
                <div className="mpr-empty">
                  <div className="mpr-loading-small" />
                  <p>Loading MPR reports from server...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="mpr-empty">
                  <div className="mpr-empty-icon">📊</div>
                  <h4>No MPR Reports Uploaded</h4>
                  <p>Upload an .xlsx workbook to create the MPR report.</p>
                  <button type="button" className="mpr-empty-btn" onClick={openAdd}>
                    + Upload Excel Report
                  </button>
                </div>
              ) : (
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
                    {filteredReports.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                        <td><span className="mpr-month-badge">{getMonthName(item.month)}</span></td>
                        <td>{item.financialYear}</td>
                        <td>
                          <div className="mpr-file-cell">
                            <div className="mpr-file-icon">X</div>
                            <div>
                              <strong>{item.fileName}</strong>
                              <small>{formatSize(item.fileSize)}</small>
                            </div>
                          </div>
                        </td>
                        <td>{new Date(item.updatedAt || item.createdAt).toLocaleString("en-IN")}</td>
                        <td>
                          <div className="mpr-actions">
                            <button type="button" className="mpr-view-btn" onClick={() => openReport(item)}>
                              👁 View / Edit
                            </button>
                            <button type="button" className="mpr-delete-btn" onClick={() => deleteReport(item.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                <p>Select the month, financial year and Excel file.</p>
              </div>
              <button type="button" className="mpr-close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={saveNewReport}>
              <div className="mpr-modal-body">
                <div className="mpr-form-group">
                  <label>Month <span>*</span></label>
                  <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option value="">Select Month</option>
                    {months.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                </div>
                <div className="mpr-form-group">
                  <label>Financial Year <span>*</span></label>
                  <select value={financialYear} onChange={(e) => setFinancialYear(e.target.value)}>
                    <option value="">Select Financial Year</option>
                    {financialYears.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>
                <div className="mpr-form-group">
                  <label>Excel File <span>*</span></label>
                  <input ref={fileInputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileChange} />
                  {selectedFile && <small>{selectedFile.name} · {formatSize(selectedFile.size)}</small>}
                </div>
                {error && <div className="mpr-modal-error">{error}</div>}
              </div>
              <div className="mpr-modal-footer">
                <button type="button" className="mpr-cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="mpr-submit-btn">Upload & Save</button>
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
          onSaved={async (updated) => {
            await handleEditorSaved(updated);
            setShowEditor(false);
            setEditingReport(null);
          }}
        />
      )}
    </div>
  );
};

export default MonthReport;
