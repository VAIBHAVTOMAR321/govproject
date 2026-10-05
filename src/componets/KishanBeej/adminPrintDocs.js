// Admin print preview — single entry point.
// Returns the printable documents for a scheme in exactly the order, wording and
// page-break arrangement used by the matching farmer-facing component:
//   kisan  → src/componets/kishanavedan/KisanAavedanPortal.js
//   vermi  → src/componets/kishanavedan/KisanAvedan.js
//   dragon → src/componets/kishanavedan/DragfruitsAndKiwi.js
//   kiwi   → src/componets/kishanavedan/KiwiFruits.js

import { buildFencingDocuments, normalizeFenceMap } from "./adminPrintFencing";
import { buildVermiDocuments } from "./adminPrintVermi";
import { buildDragonDocuments, buildKiwiDocuments } from "./adminPrintOrchard";

export const FENCING_LAND_DETAILS_API =
  "https://mahadevaaya.com/govbillingsystem/backend/api/fencing-land-details/";

// Mirrors the "प्रिंट" side tab of DragfruitsAndKiwi.js / KiwiFruits.js and the
// sub-document navigation of the two portal components.
export const SCHEME_PRINT_LABELS = {
  kisan: ["फेंसिंग आवेदन पत्र", "व्यय विवरण", "देयक प्रपत्र"],
  vermi: ["आवेदन पत्र", "शपथ-पत्र", "व्यय विवरण", "देयक प्रपत्र"],
  dragon: ["आवेदन", "प्रोजेक्ट", "शपथ-पत्र", "सहमति पत्र", "अनुदान"],
  kiwi: ["आवेदन", "प्रोजेक्ट", "शपथ-पत्र", "सहमति पत्र", "अनुदान"],
};

export const DEFAULT_PRINT_SELECTION = {
  kisan: { application: true, work: false, bill: true },
  vermi: { application: true, affidavit: false, work: false, bill: true },
  dragon: { application: true, project: true, affidavit: false, consent: false, anudan: false },
  kiwi: { application: true, project: true, affidavit: false, consent: false, anudan: false },
};

export const buildPrintDocuments = (schemeType, application, fenceMapRows, centerName) => {
  const raw = {
    ...application.raw,
    formId: application.form_id,
  };

  switch (schemeType) {
    case "kisan":
      return buildFencingDocuments(raw, normalizeFenceMap(fenceMapRows), centerName);
    case "vermi":
      return buildVermiDocuments(raw);
    case "dragon":
      return buildDragonDocuments(raw);
    case "kiwi":
      return buildKiwiDocuments(raw);
    default:
      return [];
  }
};
