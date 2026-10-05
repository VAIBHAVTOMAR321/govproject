// Admin print preview — shared formatting helpers.
// Kept byte-for-byte equivalent to the helpers used inside the respective
// farmer-facing components so that the admin preview prints the same text.

export const num = (value) => {
  const parsed = parseFloat(String(value == null ? "" : value).replace(/[^0-9.-]/g, ""));
  return isNaN(parsed) ? 0 : parsed;
};

export const esc = (value) =>
  String(value == null ? "" : value).replace(/[&<>"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  })[character]);

export const fmt0 = (value) => "₹ " + Math.round(Number(value) || 0).toLocaleString("en-IN");

export const fmtN = (value) =>
  (Number(value) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const money = (value) => "₹" + Math.round(value).toLocaleString("en-IN");

export const dropZero = (value) => fmtN(value).replace(/\.00$/, "");

const ONE = ["", "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ", "दस", "ग्यारह", "बारह", "तेरह", "चौदह", "पन्द्रह", "सोलह", "सत्रह", "अठारह", "उन्नीस", "बीस", "इक्कीस", "बाईस", "तेईस", "चौबीस", "पच्चीस", "छब्बीस", "सत्ताईस", "अट्ठाईस", "उनतीस", "तीस", "इकतीस", "बत्तीस", "तैंतीस", "चौंतीस", "पैंतीस", "छत्तीस", "सैंतीस", "अड़तीस", "उनतालीस", "चालीस", "इकतालीस", "बयालीस", "तैंतालीस", "चवालीस", "पैंतालीस", "छियालीस", "सैंतालीस", "अड़तालीस", "उनचास", "पचास", "इक्यावन", "बावन", "तिरेपन", "चौवन", "पचपन", "छप्पन", "सत्तावन", "अट्ठावन", "उनसठ", "साठ", "इकसठ", "बासठ", "तिरेसठ", "चौंसठ", "पैंसठ", "छियासठ", "सड़सठ", "अड़सठ", "उनहत्तर", "सत्तर", "इकहत्तर", "बहत्तर", "तिहत्तर", "चौहत्तर", "पचहत्तर", "छिहत्तर", "सतहत्तर", "अठहत्तर", "उन्यासी", "अस्सी", "इक्यासी", "बयासी", "तिरासी", "चौरासी", "पचासी", "छियासी", "सत्तासी", "अट्ठासी", "नवासी", "नब्बे", "इक्यानवे", "बानवे", "तिरानवे", "चौरानवे", "पंचानवे", "छियानवे", "सत्तानवे", "अट्ठानवे", "निन्यानवे"];

const three = (value) => {
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  let output = hundreds ? ONE[hundreds] + " सौ" : "";
  if (rest) output += (output ? " " : "") + ONE[rest];
  return output;
};

export const words = (value) => {
  const rounded = Math.round(Math.abs(num(value)));
  if (!rounded) return "शून्य";
  const crore = Math.floor(rounded / 10000000);
  const lakh = Math.floor((rounded % 10000000) / 100000);
  const thousand = Math.floor((rounded % 100000) / 1000);
  const hundred = rounded % 1000;
  const parts = [];
  if (crore) parts.push(three(crore) + " करोड़");
  if (lakh) parts.push(three(lakh) + " लाख");
  if (thousand) parts.push(three(thousand) + " हजार");
  if (hundred) parts.push(three(hundred));
  return parts.join(" ");
};

// `<input readonly>` reproduces the exact look (and print output) of the
// editable fields in the farmer-facing forms.
export const roField = (value, extra = "") =>
  `<input readonly tabindex="-1"${extra} value="${esc(value)}">`;
export const roSelect = (value, options, extra = "") =>
  `<select${extra}>${options
    .map((option) => `<option${option === value ? " selected" : ""}>${esc(option)}</option>`)
    .join("")}</select>`;
