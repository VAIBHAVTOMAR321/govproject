import React, { useEffect, useMemo, useState } from "react";
import "./UdyanBill.css";

/* =========================================================
   DEFAULT CROP STANDARDS
   Based on reference Udyan Bill 2026-27
========================================================= */

const DEFAULT_STANDARDS = [
  {
    name: "कागजी नींबू (पॉलीबैग)",
    sp: "6 × 6 मी0",
    plants: 278,
    pRate: 30,
    pitRate: 65,
    manRate: 150,
    manQty: 90.6,
    manAuto: true,
    stdTotal: 40000,
    stdSub: 20000,
  },
  {
    name: "कागजी नींबू",
    sp: "6 × 6 मी0",
    plants: 278,
    pRate: 20,
    pitRate: 65,
    manRate: 150,
    manQty: 109.13,
    manAuto: true,
    stdTotal: 40000,
    stdSub: 20000,
  },
  {
    name: "माल्टा",
    sp: "6 × 6 मी0",
    plants: 278,
    pRate: 60,
    pitRate: 65,
    manRate: 150,
    manQty: 35,
    manAuto: true,
    stdTotal: 40000,
    stdSub: 20000,
  },
  {
    name: "लीची गूटी",
    sp: "8 × 6 मी0",
    plants: 208,
    pRate: 60,
    pitRate: 65,
    manRate: 150,
    manQty: 93.33,
    manAuto: true,
    stdTotal: 40000,
    stdSub: 20000,
  },
  {
    name: "आम कलमी",
    sp: "8 × 8 मी0",
    plants: 156,
    pRate: 60,
    pitRate: 65,
    manRate: 150,
    manQty: 136.67,
    manAuto: true,
    stdTotal: 40000,
    stdSub: 20000,
  },
];

/* =========================================================
   HINDI NUMBER TO WORDS
========================================================= */

const HINDI_NUMBERS = [
  "शून्य",
  "एक",
  "दो",
  "तीन",
  "चार",
  "पाँच",
  "छह",
  "सात",
  "आठ",
  "नौ",
  "दस",
  "ग्यारह",
  "बारह",
  "तेरह",
  "चौदह",
  "पन्द्रह",
  "सोलह",
  "सत्रह",
  "अठारह",
  "उन्नीस",
  "बीस",
  "इक्कीस",
  "बाईस",
  "तेईस",
  "चौबीस",
  "पच्चीस",
  "छब्बीस",
  "सत्ताईस",
  "अट्ठाईस",
  "उनतीस",
  "तीस",
  "इकतीस",
  "बत्तीस",
  "तैंतीस",
  "चौंतीस",
  "पैंतीस",
  "छत्तीस",
  "सैंतीस",
  "अड़तीस",
  "उनतालीस",
  "चालीस",
  "इकतालीस",
  "बयालीस",
  "तैंतालीस",
  "चवालीस",
  "पैंतालीस",
  "छियालीस",
  "सैंतालीस",
  "अड़तालीस",
  "उनचास",
  "पचास",
  "इक्यावन",
  "बावन",
  "तिरपन",
  "चौवन",
  "पचपन",
  "छप्पन",
  "सत्तावन",
  "अट्ठावन",
  "उनसठ",
  "साठ",
  "इकसठ",
  "बासठ",
  "तिरसठ",
  "चौंसठ",
  "पैंसठ",
  "सड़सठ",
  "अड़सठ",
  "उनहत्तर",
  "सत्तर",
  "इकहत्तर",
  "बहत्तर",
  "तिहत्तर",
  "चौहत्तर",
  "पचहत्तर",
  "छिहत्तर",
  "सतहत्तर",
  "अठहत्तर",
  "उन्यासी",
  "अस्सी",
  "इक्यासी",
  "बयासी",
  "तिरासी",
  "चौरासी",
  "पचासी",
  "छियासी",
  "सत्तासी",
  "अट्ठासी",
  "नवासी",
  "नब्बे",
  "इक्यानवे",
  "बानवे",
  "तिरानवे",
  "चौरानवे",
  "पचानवे",
  "छियानवे",
  "सत्तानवे",
  "अट्ठानवे",
  "निन्यानवे",
];

function under100(n) {
  return HINDI_NUMBERS[n] || "";
}

function under1000(n) {
  const h = Math.floor(n / 100);
  const rest = n % 100;

  let result = "";

  if (h) {
    result += `${under100(h)} सौ `;
  }

  if (rest) {
    result += under100(rest);
  }

  return result.trim();
}

function numberToHindiWords(value) {
  let n = Math.round(Number(value) || 0);

  if (n === 0) return "शून्य";

  let result = "";

  const crore = Math.floor(n / 10000000);
  n %= 10000000;

  const lakh = Math.floor(n / 100000);
  n %= 100000;

  const thousand = Math.floor(n / 1000);
  n %= 1000;

  if (crore) {
    result += `${under1000(crore)} करोड़ `;
  }

  if (lakh) {
    result += `${under1000(lakh)} लाख `;
  }

  if (thousand) {
    result += `${under1000(thousand)} हजार `;
  }

  if (n) {
    result += under1000(n);
  }

  return result.trim();
}

function amountToWords(value) {
  const amount = Number(value) || 0;

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let result = `${numberToHindiWords(rupees)} रुपये`;

  if (paise > 0) {
    result += ` ${numberToHindiWords(paise)} पैसे`;
  }

  return `${result} मात्र`;
}

/* =========================================================
   HELPERS
========================================================= */

function roundValue(value, decimals = 2) {
  const factor = Math.pow(10, decimals);

  return Math.round((Number(value) || 0) * factor) / factor;
}

function formatAmount(value, decimals = 2) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* =========================================================
   COMPONENT
========================================================= */

export default function UdyanBill() {
  const [standards, setStandards] = useState(DEFAULT_STANDARDS);

  const [cropIndex, setCropIndex] = useState(0);

  const [area, setArea] = useState("1.00");

  const [plants, setPlants] = useState("");

  const [plantManual, setPlantManual] = useState(false);

  const [basis, setBasis] = useState("area");

  const [rounding, setRounding] = useState(2);

  const [year, setYear] = useState("2026-27");

  const [showVoucher2, setShowVoucher2] = useState(false);

  const [showStandardPage, setShowStandardPage] = useState(false);

  const [form, setForm] = useState({
    jati: "",
    mad: "",
    kname: "",
    kfath: "",
    kdob: "",
    kgram: "",
    kend: "",
    b1: "",
    a1: "",
    i1: "",
    b2: "",
    a2: "",
    i2: "",
    aadhar: "",
    mob: "",
    pan: "",
    sname: "",
    sfath: "",
    sgram: "",
    lname: "",
    lfath: "",
    lgram: "",
  });

  const crop = standards[cropIndex] || standards[0];

  /* =========================================================
     AREA
  ========================================================= */

  const numericArea = Math.max(
    0,
    parseFloat(String(area).replace(/[^0-9.]/g, "")) || 0
  );

  /* =========================================================
     PER HECTARE CALCULATION
  ========================================================= */

  const perHa = useMemo(() => {
    if (!crop) return {};

    const plantTotal = crop.plants * crop.pRate;

    const pitTotal = crop.plants * crop.pitRate;

    let manureTotal;

    let manureQty;

    if (crop.manAuto) {
      manureTotal = roundValue(
        crop.stdTotal - plantTotal - pitTotal,
        2
      );

      if (!Number.isFinite(manureTotal) || manureTotal < 0) {
        manureTotal = 0;
      }

      manureQty = roundValue(
        manureTotal / crop.manRate,
        2
      );
    } else {
      manureQty = Math.max(
        0,
        Number(crop.manQty) || 0
      );

      manureTotal = roundValue(
        manureQty * crop.manRate,
        2
      );
    }

    const plantSubsidy = plantTotal;

    let manureSubsidy = roundValue(
      crop.stdSub - plantSubsidy,
      2
    );

    manureSubsidy = Math.max(
      0,
      Math.min(manureSubsidy, manureTotal)
    );

    const manureFarmer =
      roundValue(manureTotal - manureSubsidy, 2);

    const pitFarmer = pitTotal;

    const total =
      plantTotal +
      pitTotal +
      manureTotal;

    const subsidy =
      plantSubsidy +
      manureSubsidy;

    const farmer =
      pitFarmer +
      manureFarmer;

    return {
      plantTotal,
      plantSubsidy,

      pitTotal,
      pitSubsidy: 0,
      pitFarmer,

      manureTotal,
      manureQty,
      manureSubsidy,
      manureFarmer,

      total,
      subsidy,
      farmer,
    };
  }, [crop]);

  /* =========================================================
     MAIN CALCULATION
  ========================================================= */

  const calculation = useMemo(() => {
    if (!crop) return {};

    const autoPlants = Math.round(
      crop.plants * numericArea
    );

    const finalPlants =
      plantManual && plants
        ? Math.max(1, parseInt(plants, 10) || 1)
        : autoPlants;

    let plantTotal;
    let pitTotal;
    let manureTotal;

    if (basis === "plant") {
      plantTotal = roundValue(
        finalPlants * crop.pRate,
        rounding
      );

      pitTotal = roundValue(
        finalPlants * crop.pitRate,
        rounding
      );

      manureTotal = roundValue(
        crop.stdTotal * numericArea -
          plantTotal -
          pitTotal,
        rounding
      );

      if (manureTotal < 0) {
        manureTotal = 0;
      }
    } else {
      plantTotal = roundValue(
        perHa.plantTotal * numericArea,
        rounding
      );

      pitTotal = roundValue(
        perHa.pitTotal * numericArea,
        rounding
      );

      manureTotal = roundValue(
        perHa.manureTotal * numericArea,
        rounding
      );
    }

    const manureQty = roundValue(
      manureTotal / crop.manRate,
      2
    );

    const plantSubsidy = plantTotal;

    const pitSubsidy = 0;

    const pitFarmer = pitTotal;

    let manureSubsidy = roundValue(
      crop.stdSub * numericArea -
        plantSubsidy,
      rounding
    );

    manureSubsidy = Math.max(
      0,
      Math.min(manureSubsidy, manureTotal)
    );

    const manureFarmer = roundValue(
      manureTotal - manureSubsidy,
      rounding
    );

    const billTotal = roundValue(
      manureTotal + pitTotal,
      rounding
    );

    const billSubsidy = roundValue(
      manureSubsidy + pitSubsidy,
      rounding
    );

    const billFarmer = roundValue(
      manureFarmer + pitFarmer,
      rounding
    );

    const grandTotal = roundValue(
      billTotal + plantTotal,
      rounding
    );

    const grandSubsidy = roundValue(
      billSubsidy + plantSubsidy,
      rounding
    );

    const expectedTotal = roundValue(
      crop.stdTotal * numericArea,
      rounding
    );

    const expectedSubsidy = roundValue(
      crop.stdSub * numericArea,
      rounding
    );

    const expectedFarmer = roundValue(
      expectedTotal - expectedSubsidy,
      rounding
    );

    const totalDifference = roundValue(
      grandTotal - expectedTotal,
      rounding
    );

    const subsidyDifference = roundValue(
      grandSubsidy - expectedSubsidy,
      rounding
    );

    const farmerDifference = roundValue(
      billFarmer - expectedFarmer,
      rounding
    );

    const matched =
      Math.abs(totalDifference) < 1.01 &&
      Math.abs(subsidyDifference) < 1.01 &&
      Math.abs(farmerDifference) < 1.01;

    return {
      plants: finalPlants,

      plantTotal,
      plantSubsidy,

      pitTotal,
      pitSubsidy,
      pitFarmer,

      manureQty,
      manureTotal,
      manureSubsidy,
      manureFarmer,

      billTotal,
      billSubsidy,
      billFarmer,

      grandTotal,
      grandSubsidy,

      expectedTotal,
      expectedSubsidy,
      expectedFarmer,

      totalDifference,
      subsidyDifference,
      farmerDifference,

      matched,
    };
  }, [
    crop,
    numericArea,
    plants,
    plantManual,
    basis,
    rounding,
    perHa,
  ]);

  /* =========================================================
     AUTO PLANT UPDATE
  ========================================================= */

  useEffect(() => {
    if (!plantManual && crop) {
      setPlants(
        Math.round(crop.plants * numericArea).toString()
      );
    }
  }, [cropIndex, numericArea, crop, plantManual]);

  /* =========================================================
     FORM SYNC
  ========================================================= */

  function updateForm(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  /* =========================================================
     STANDARD EDITOR
  ========================================================= */

  function updateStandard(index, key, value) {
    setStandards((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (
          [
            "plants",
            "pRate",
            "pitRate",
            "manRate",
            "manQty",
            "stdTotal",
            "stdSub",
          ].includes(key)
        ) {
          return {
            ...item,
            [key]: Number(value) || 0,
          };
        }

        return {
          ...item,
          [key]: value,
        };
      })
    );
  }

  function toggleManureAuto(index, checked) {
    setStandards((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              manAuto: checked,
            }
          : item
      )
    );
  }

  function addCrop() {
    setStandards((prev) => [
      ...prev,
      {
        name: "नई फसल",
        sp: "6 × 6 मी0",
        plants: 278,
        pRate: 30,
        pitRate: 65,
        manRate: 150,
        manQty: 0,
        manAuto: true,
        stdTotal: 40000,
        stdSub: 20000,
      },
    ]);
  }

  function deleteCrop(index) {
    if (standards.length <= 1) {
      alert("कम से कम एक फसल रहनी चाहिए।");
      return;
    }

    const deletedName = standards[index].name;

    if (!window.confirm(`${deletedName} का मानक हटाएँ?`)) {
      return;
    }

    setStandards((prev) =>
      prev.filter((_, i) => i !== index)
    );

    if (cropIndex >= standards.length - 1) {
      setCropIndex(0);
    }
  }

  function resetStandards() {
    if (
      !window.confirm(
        "सभी मानक मूल मानक पर लौटाए जाएँ?"
      )
    ) {
      return;
    }

    setStandards(
      JSON.parse(JSON.stringify(DEFAULT_STANDARDS))
    );

    setCropIndex(0);
  }

  /* =========================================================
     JSON EXPORT
  ========================================================= */

  function downloadStandards() {
    const blob = new Blob(
      [JSON.stringify(standards, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "udyan_manak.json";

    a.click();

    URL.revokeObjectURL(url);
  }

  /* =========================================================
     JSON IMPORT
  ========================================================= */

  function importStandards(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        if (!Array.isArray(imported) || !imported.length) {
          throw new Error("Invalid");
        }

        const normalized = imported.map((item) => ({
          ...item,
          manAuto:
            item.manAuto === undefined
              ? true
              : item.manAuto,
          stdTotal:
            item.stdTotal === undefined
              ? 40000
              : item.stdTotal,
          stdSub:
            item.stdSub === undefined
              ? 20000
              : item.stdSub,
        }));

        setStandards(normalized);
        setCropIndex(0);

        alert("मानक फाइल सफलतापूर्वक लागू कर दी गई।");
      } catch {
        alert("मानक फाइल पढ़ी नहीं जा सकी।");
      }
    };

    reader.readAsText(file);

    event.target.value = "";
  }

  /* =========================================================
     PRINT
  ========================================================= */

  function handlePrint() {
    window.print();
  }

  /* =========================================================
     RESET FORM
  ========================================================= */

  function resetForm() {
    if (
      !window.confirm(
        "भरी गई सभी सूचनाएँ मिटा दी जाएँ?"
      )
    ) {
      return;
    }

    setForm({
      jati: "",
      mad: "",
      kname: "",
      kfath: "",
      kdob: "",
      kgram: "",
      kend: "",
      b1: "",
      a1: "",
      i1: "",
      b2: "",
      a2: "",
      i2: "",
      aadhar: "",
      mob: "",
      pan: "",
      sname: "",
      sfath: "",
      sgram: "",
      lname: "",
      lfath: "",
      lgram: "",
    });

    setArea("1.00");
    setPlantManual(false);
    setPlants("");
  }

  /* =========================================================
     STANDARD ROW CALCULATION
  ========================================================= */

  function standardCalculation(item) {
    const plantTotal =
      item.plants * item.pRate;

    const pitTotal =
      item.plants * item.pitRate;

    let manureTotal;
    let manureQty;

    if (item.manAuto) {
      manureTotal = Math.max(
        0,
        roundValue(
          item.stdTotal -
            plantTotal -
            pitTotal,
          2
        )
      );

      manureQty = roundValue(
        manureTotal / item.manRate,
        2
      );
    } else {
      manureQty = Math.max(
        0,
        Number(item.manQty) || 0
      );

      manureTotal = roundValue(
        manureQty * item.manRate,
        2
      );
    }

    const plantSubsidy = plantTotal;

    let manureSubsidy =
      item.stdSub - plantSubsidy;

    manureSubsidy = Math.max(
      0,
      Math.min(manureSubsidy, manureTotal)
    );

    const farmer =
      pitTotal +
      (manureTotal - manureSubsidy);

    return {
      plantTotal,
      pitTotal,
      manureTotal,
      manureQty,
      total:
        plantTotal +
        pitTotal +
        manureTotal,
      subsidy:
        plantSubsidy +
        manureSubsidy,
      farmer,
    };
  }

  return (
    <div className="udyan-app">

      {/* =====================================================
          CONTROL PANEL
      ===================================================== */}

      <section className="udyan-control-panel">

        <div className="udyan-header">
          <div>
            <h1>
              उद्यान बिल एवं कृषक अंश वाउचर
            </h1>

            <p>
              स्वतः गणना प्रपत्र — वर्ष {year}
            </p>
          </div>
        </div>

        <div className="udyan-input-grid">

          <div className="udyan-field">
            <label>फल पौध</label>

            <select
              value={cropIndex}
              onChange={(e) =>
                setCropIndex(
                  Number(e.target.value)
                )
              }
            >
              {standards.map(
                (item, index) => (
                  <option
                    value={index}
                    key={index}
                  >
                    {item.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="udyan-field">
            <label>
              क्षेत्रफल है0
            </label>

            <input
              type="number"
              min="0"
              step="0.001"
              value={area}
              onChange={(e) =>
                setArea(e.target.value)
              }
            />
          </div>

          <div className="udyan-field">
            <label>
              पौध संख्या
            </label>

            <input
              type="number"
              min="1"
              value={plants}
              onChange={(e) => {
                setPlants(e.target.value);
                setPlantManual(true);
              }}
            />

            <small>
              स्वतः:{" "}
              {Math.round(
                crop.plants * numericArea
              )}
            </small>
          </div>

          <div className="udyan-field">
            <label>
              गणना का आधार
            </label>

            <select
              value={basis}
              onChange={(e) =>
                setBasis(e.target.value)
              }
            >
              <option value="area">
                क्षेत्रफल के अनुपात में
              </option>

              <option value="plant">
                वास्तविक पौध संख्या के अनुसार
              </option>
            </select>
          </div>

          <div className="udyan-field">
            <label>राशि</label>

            <select
              value={rounding}
              onChange={(e) =>
                setRounding(
                  Number(e.target.value)
                )
              }
            >
              <option value="2">
                पैसे सहित
              </option>

              <option value="0">
                पूर्णांक रुपये
              </option>
            </select>
          </div>

          <div className="udyan-field">
            <label>वर्ष</label>

            <input
              value={year}
              onChange={(e) =>
                setYear(e.target.value)
              }
            />
          </div>

          <div className="udyan-field">
            <label>
              वाउचर सं0-2
            </label>

            <select
              value={showVoucher2 ? "yes" : "no"}
              onChange={(e) =>
                setShowVoucher2(
                  e.target.value === "yes"
                )
              }
            >
              <option value="no">
                राजसहायता 0 होने पर हटाएँ
              </option>

              <option value="yes">
                हमेशा दिखाएँ
              </option>
            </select>
          </div>

        </div>

        {/* =================================================
            ACTION BUTTONS
        ================================================= */}

        <div className="udyan-actions">

          <button
            className="primary-btn"
            onClick={handlePrint}
          >
            🖨 प्रिंट / PDF
          </button>

          <button
            className="secondary-btn"
            onClick={() =>
              setShowStandardPage(
                !showStandardPage
              )
            }
          >
            {showStandardPage
              ? "मानक पृष्ठ हटाएँ"
              : "मानक पृष्ठ जोड़ें"}
          </button>

          <button
            className="danger-btn"
            onClick={resetForm}
          >
            रीसेट
          </button>

        </div>

        {/* =================================================
            CALCULATION SUMMARY
        ================================================= */}

        <div
          className={`udyan-tally ${
            calculation.matched
              ? "success"
              : "error"
          }`}
        >
          {calculation.matched ? (
            <>
              ✓ लेखा मिलान सही
              <span>
                महायोग ₹
                {formatAmount(
                  calculation.grandTotal,
                  rounding
                )}
              </span>

              <span>
                कुल राजसहायता ₹
                {formatAmount(
                  calculation.grandSubsidy,
                  rounding
                )}
              </span>

              <span>
                कृषक अंश ₹
                {formatAmount(
                  calculation.billFarmer,
                  rounding
                )}
              </span>
            </>
          ) : (
            <>
              ⚠ मानक से अन्तर
              <span>
                महायोग अन्तर ₹
                {formatAmount(
                  calculation.totalDifference,
                  rounding
                )}
              </span>

              <span>
                राजसहायता अन्तर ₹
                {formatAmount(
                  calculation.subsidyDifference,
                  rounding
                )}
              </span>

              <span>
                कृषक अंश अन्तर ₹
                {formatAmount(
                  calculation.farmerDifference,
                  rounding
                )}
              </span>
            </>
          )}
        </div>

        {/* =================================================
            NORMS EDITOR
        ================================================= */}

        <details className="udyan-norms">
          <summary>
            मानक तालिका — फसलवार सम्पादन योग्य
          </summary>

          <p className="norms-help">
            पीले खानों में मानक बदलें। सभी
            गणनाएँ स्वतः अपडेट होंगी।
          </p>

          {standards.map(
            (item, index) => {
              const result =
                standardCalculation(item);

              const matched =
                Math.abs(
                  result.total -
                    item.stdTotal
                ) < 0.51;

              return (
                <div
                  className="norm-card"
                  key={index}
                >

                  <div className="norm-card-header">

                    <span>
                      {index + 1}.
                    </span>

                    <input
                      value={item.name}
                      onChange={(e) =>
                        updateStandard(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                    />

                    <label>दूरी</label>

                    <input
                      value={item.sp}
                      onChange={(e) =>
                        updateStandard(
                          index,
                          "sp",
                          e.target.value
                        )
                      }
                    />

                    <label>
                      मानक महायोग
                    </label>

                    <input
                      type="number"
                      value={item.stdTotal}
                      onChange={(e) =>
                        updateStandard(
                          index,
                          "stdTotal",
                          e.target.value
                        )
                      }
                    />

                    <label>
                      देय राजसहायता
                    </label>

                    <input
                      type="number"
                      value={item.stdSub}
                      onChange={(e) =>
                        updateStandard(
                          index,
                          "stdSub",
                          e.target.value
                        )
                      }
                    />

                    <span
                      className={
                        matched
                          ? "norm-ok"
                          : "norm-error"
                      }
                    >
                      {matched
                        ? "मिलान सही ✓"
                        : "अन्तर"}
                    </span>

                    <button
                      className="small-danger"
                      onClick={() =>
                        deleteCrop(index)
                      }
                    >
                      हटाएँ
                    </button>

                  </div>

                  <div className="norm-table-wrapper">

                    <table className="norm-table">

                      <thead>
                        <tr>
                          <th>क्र0</th>
                          <th>कार्य / मद</th>
                          <th>मात्रा</th>
                          <th>दर</th>
                          <th>कुल व्यय</th>
                          <th>राजसहायता</th>
                          <th>कृषक अंश</th>
                        </tr>
                      </thead>

                      <tbody>

                        <tr>
                          <td>1</td>

                          <td>
                            फल पौध की लागत
                          </td>

                          <td>
                            <input
                              type="number"
                              value={item.plants}
                              onChange={(e) =>
                                updateStandard(
                                  index,
                                  "plants",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              value={item.pRate}
                              onChange={(e) =>
                                updateStandard(
                                  index,
                                  "pRate",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            {formatAmount(
                              result.plantTotal
                            )}
                          </td>

                          <td>
                            {formatAmount(
                              result.plantTotal
                            )}
                          </td>

                          <td>0.00</td>
                        </tr>

                        <tr>
                          <td>2</td>

                          <td>
                            गड्ढा खुदान, भरान,
                            पौध रोपण
                          </td>

                          <td>
                            {item.plants}
                          </td>

                          <td>
                            <input
                              type="number"
                              value={item.pitRate}
                              onChange={(e) =>
                                updateStandard(
                                  index,
                                  "pitRate",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            {formatAmount(
                              result.pitTotal
                            )}
                          </td>

                          <td>0.00</td>

                          <td>
                            {formatAmount(
                              result.pitTotal
                            )}
                          </td>
                        </tr>

                        <tr>
                          <td>3</td>

                          <td>
                            गोबर खाद/जैविक एवं
                            वर्मी कम्पोस्ट/पोषक
                            तत्व/पौध सुरक्षा/
                            रोपण सिंचाई

                            <label className="auto-check">
                              <input
                                type="checkbox"
                                checked={
                                  item.manAuto
                                }
                                onChange={(e) =>
                                  toggleManureAuto(
                                    index,
                                    e.target.checked
                                  )
                                }
                              />

                              मात्रा स्वतः
                            </label>
                          </td>

                          <td>
                            <input
                              type="number"
                              disabled={
                                item.manAuto
                              }
                              value={
                                item.manAuto
                                  ? result.manureQty
                                  : item.manQty
                              }
                              onChange={(e) =>
                                updateStandard(
                                  index,
                                  "manQty",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              value={
                                item.manRate
                              }
                              onChange={(e) =>
                                updateStandard(
                                  index,
                                  "manRate",
                                  e.target.value
                                )
                              }
                            />
                          </td>

                          <td>
                            {formatAmount(
                              result.manureTotal
                            )}
                          </td>

                          <td>
                            {formatAmount(
                              Math.max(
                                0,
                                item.stdSub -
                                  result.plantTotal
                              )
                            )}
                          </td>

                          <td>
                            {formatAmount(
                              result.manureTotal -
                                Math.max(
                                  0,
                                  item.stdSub -
                                    result.plantTotal
                                )
                            )}
                          </td>
                        </tr>

                        <tr className="norm-total">
                          <td colSpan="4">
                            योग :-
                          </td>

                          <td>
                            {formatAmount(
                              result.total
                            )}
                          </td>

                          <td>
                            {formatAmount(
                              result.subsidy
                            )}
                          </td>

                          <td>
                            {formatAmount(
                              result.farmer
                            )}
                          </td>
                        </tr>

                      </tbody>

                    </table>

                  </div>

                </div>
              );
            }
          )}

          <div className="norm-actions">

            <button
              className="secondary-btn"
              onClick={addCrop}
            >
              + नई फसल जोड़ें
            </button>

            <button
              className="secondary-btn"
              onClick={downloadStandards}
            >
              मानक JSON डाउनलोड
            </button>

            <label className="file-btn">
              मानक JSON खोलें

              <input
                type="file"
                accept=".json,application/json"
                onChange={importStandards}
                hidden
              />
            </label>

            <button
              className="danger-btn"
              onClick={resetStandards}
            >
              मूल मानक पर लौटें
            </button>

          </div>
        </details>

      </section>

      {/* =====================================================
          DOCUMENT
      ===================================================== */}

      <main className="udyan-document">

        {/* ===================================================
            PAGE 1 — BILL
        =================================================== */}

        <section className="udyan-page">

          <div className="document-copy">
            कोषागार प्रति
          </div>

          <h3 className="document-center">
            कार्यालय उद्यान विशेषज्ञ,
            कोटद्वार गढ़वाल
          </h3>

          <h2 className="document-title">
            जिला योजनान्तर्गत उद्यान स्थापना —
            वर्ष {year} (बिल)
          </h2>

          <div className="document-row">
            जाति
            <input
              value={form.jati}
              onChange={(e) =>
                updateForm(
                  "jati",
                  e.target.value
                )
              }
            />

            मद

            <input
              value={form.mad}
              onChange={(e) =>
                updateForm(
                  "mad",
                  e.target.value
                )
              }
            />
          </div>

          <div className="document-row">
            नाम कृषक

            <input
              value={form.kname}
              onChange={(e) =>
                updateForm(
                  "kname",
                  e.target.value
                )
              }
            />

            पिता/पति का नाम

            <input
              value={form.kfath}
              onChange={(e) =>
                updateForm(
                  "kfath",
                  e.target.value
                )
              }
            />
          </div>

          <div className="document-row">

            जन्म तिथि

            <input
              value={form.kdob}
              onChange={(e) =>
                updateForm(
                  "kdob",
                  e.target.value
                )
              }
            />

            ग्राम

            <input
              value={form.kgram}
              onChange={(e) =>
                updateForm(
                  "kgram",
                  e.target.value
                )
              }
            />

            उद्यान सचल दल केन्द्र

            <input
              value={form.kend}
              onChange={(e) =>
                updateForm(
                  "kend",
                  e.target.value
                )
              }
            />

          </div>

          <div className="document-row">

            रोपित पौधों की संख्या

            <strong>
              {calculation.plants}
            </strong>

            क्षेत्रफल है0

            <strong>
              {Number(numericArea).toFixed(2)}
            </strong>

            फल पौध का नाम

            <strong>
              {crop.name}
            </strong>

            दूरी

            <strong>
              {crop.sp}
            </strong>

          </div>

          <div className="document-row">

            (1) बैंक का नाम व शाखा

            <input
              value={form.b1}
              onChange={(e) =>
                updateForm(
                  "b1",
                  e.target.value
                )
              }
            />

            खाता संख्या

            <input
              value={form.a1}
              onChange={(e) =>
                updateForm(
                  "a1",
                  e.target.value
                )
              }
            />

          </div>

          <div className="document-row">

            आई0एफ0एस0सी0 कोड

            <input
              value={form.i1}
              onChange={(e) =>
                updateForm(
                  "i1",
                  e.target.value
                )
              }
            />

          </div>

          <div className="document-row">

            (2) बैंक का नाम व शाखा

            <input
              value={form.b2}
              onChange={(e) =>
                updateForm(
                  "b2",
                  e.target.value
                )
              }
            />

            खाता संख्या

            <input
              value={form.a2}
              onChange={(e) =>
                updateForm(
                  "a2",
                  e.target.value
                )
              }
            />

          </div>

          <div className="document-row">

            आई0एफ0एस0सी0 कोड

            <input
              value={form.i2}
              onChange={(e) =>
                updateForm(
                  "i2",
                  e.target.value
                )
              }
            />

          </div>

          <div className="document-row">

            आधार कार्ड सं0

            <input
              value={form.aadhar}
              onChange={(e) =>
                updateForm(
                  "aadhar",
                  e.target.value
                )
              }
            />

          </div>

          <div className="document-row">

            मोबाइल नम्बर

            <input
              value={form.mob}
              onChange={(e) =>
                updateForm(
                  "mob",
                  e.target.value
                )
              }
            />

            पैन नम्बर

            <input
              value={form.pan}
              onChange={(e) =>
                updateForm(
                  "pan",
                  e.target.value
                )
              }
            />

          </div>

          {/* BILL TABLE */}

          <table className="bill-table">

            <thead>
              <tr>
                <th rowSpan="2">
                  क्र0<br />सं0
                </th>

                <th rowSpan="2">
                  कार्य/मद का विवरण
                </th>

                <th rowSpan="2">
                  मात्रा/सं0
                </th>

                <th colSpan="3">
                  व्यय का विवरण
                </th>
              </tr>

              <tr>
                <th>कुल व्यय</th>
                <th>देय राजसहायता</th>
                <th>कृषक अंश</th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td>1</td>

                <td>
                  गोबर खाद/जैविक एवं वर्मी
                  कम्पोस्ट/अन्य पोषक तत्व/
                  पौध सुरक्षा/रोपण सिंचाई
                </td>

                <td>
                  {calculation.manureQty}
                  {" "}कु0
                </td>

                <td>
                  ₹
                  {formatAmount(
                    calculation.manureTotal,
                    rounding
                  )}
                </td>

                <td>
                  ₹
                  {formatAmount(
                    calculation.manureSubsidy,
                    rounding
                  )}
                </td>

                <td>
                  ₹
                  {formatAmount(
                    calculation.manureFarmer,
                    rounding
                  )}
                </td>
              </tr>

              <tr>
                <td>2</td>

                <td>
                  गड्ढा खुदान, भरान,
                  पौध रोपण (1×1×1 मी0)
                </td>

                <td>
                  {calculation.plants}
                  {" "}गड्ढा
                </td>

                <td>
                  ₹
                  {formatAmount(
                    calculation.pitTotal,
                    rounding
                  )}
                </td>

                <td>₹0.00</td>

                <td>
                  ₹
                  {formatAmount(
                    calculation.pitFarmer,
                    rounding
                  )}
                </td>
              </tr>

              <tr className="total-row">
                <td colSpan="3">
                  योग :-
                </td>

                <td>
                  ₹
                  {formatAmount(
                    calculation.billTotal,
                    rounding
                  )}
                </td>

                <td>
                  ₹
                  {formatAmount(
                    calculation.billSubsidy,
                    rounding
                  )}
                </td>

                <td>
                  ₹
                  {formatAmount(
                    calculation.billFarmer,
                    rounding
                  )}
                </td>
              </tr>

              <tr>
                <td>—</td>

                <td>
                  फल पौध की लागत
                  ({crop.sp}) @ ₹
                  {crop.pRate} प्रति पौध —
                  विभाग द्वारा पौध के रूप में
                  आपूर्ति
                </td>

                <td>
                  {calculation.plants}
                </td>

                <td>
                  ₹
                  {formatAmount(
                    calculation.plantTotal,
                    rounding
                  )}
                </td>

                <td>
                  ₹
                  {formatAmount(
                    calculation.plantSubsidy,
                    rounding
                  )}
                </td>

                <td>₹0.00</td>
              </tr>

              <tr className="grand-total-row">

                <td colSpan="3">
                  महायोग (मानकानुसार) :-
                </td>

                <td>
                  ₹
                  {formatAmount(
                    calculation.grandTotal,
                    rounding
                  )}
                </td>

                <td>
                  ₹
                  {formatAmount(
                    calculation.grandSubsidy,
                    rounding
                  )}
                </td>

                <td>
                  ₹
                  {formatAmount(
                    calculation.billFarmer,
                    rounding
                  )}
                </td>

              </tr>

            </tbody>

          </table>

          <div className="document-paragraph">

            प्रमाणित किया जाता है कि मेरे द्वारा{" "}
            <strong>
              {numericArea.toFixed(2)}
            </strong>{" "}
            है0 क्षेत्रफल में{" "}
            <strong>{crop.name}</strong>{" "}
            उद्यान लगाने हेतु मु0 रु0{" "}
            <strong>
              {formatAmount(
                calculation.billTotal,
                rounding
              )}
            </strong>{" "}
            (
            {amountToWords(
              calculation.billTotal
            )}
            ) की धनराशि का कुल व्यय किया गया है,
            अतः कार्य योजना के अनुसार क्र0 सं0 1
            व 2 की धनराशि मु0 रु0{" "}
            <strong>
              {formatAmount(
                calculation.billSubsidy,
                rounding
              )}
            </strong>{" "}
            (
            {amountToWords(
              calculation.billSubsidy
            )}
            ) राजसहायता का भुगतान मुझे करने
            की कृपा करेंगे।

          </div>

          <div className="signature-block">

            हस्ताक्षर कृषक
            <input />

            <br />

            कृषक का नाम
            <strong>{form.kname}</strong>

            <br />

            पिता/पति का नाम
            <strong>{form.kfath}</strong>

            <br />

            ग्राम
            <strong>{form.kgram}</strong>

          </div>

          <div className="document-paragraph">

            प्रमाणित किया जाता है कि कृषक द्वारा
            उक्तानुसार{" "}
            <strong>
              {numericArea.toFixed(2)}
            </strong>{" "}
            है0 उद्यान लगाने हेतु{" "}
            <strong>
              {calculation.plants}
            </strong>{" "}
            पौधों का रोपण किया गया है, जिसका
            मेरे द्वारा स्थलीय सत्यापन कर दिया
            गया है। अतः कृषक को योजना अनुसार
            मु0 रु0{" "}
            <strong>
              {formatAmount(
                calculation.billSubsidy,
                rounding
              )}
            </strong>{" "}
            का अनुदान भुगतान करने की संस्तुति
            की जाती है।

          </div>

          <div className="official-sign">
            प्रभारी
            <br />
            उद्यान सचल दल
            <br />
            केन्द्र {form.kend}
          </div>

        </section>

        {/* ===================================================
            PAGE 2 — VOUCHER 1
        =================================================== */}

        <section className="udyan-page">

          <h2 className="document-title">
            कृषक अंश वाउचर सं0 - 1
          </h2>

          <h3 className="document-center">
            गोबर खाद/जैविक एवं वर्मी कम्पोस्ट/
            अन्य पोषक तत्व आदि
          </h3>

          <div className="document-center">
            फल पौध :{" "}
            <strong>{crop.name}</strong>
            {" | "}
            क्षेत्रफल :{" "}
            <strong>
              {numericArea.toFixed(2)}
            </strong>{" "}
            है0
            {" | "}
            वर्ष : {year}
          </div>

          <div className="voucher-text">

            मु0 रु0{" "}
            <strong>
              {formatAmount(
                calculation.manureTotal,
                rounding
              )}
            </strong>{" "}
            (
            {amountToWords(
              calculation.manureTotal
            )}
            ) बावत गोबर खाद/जैविक एवं वर्मी
            कम्पोस्ट/अन्य पोषक तत्व आदि का
            भुगतान रु0{" "}
            <strong>
              {formatAmount(
                calculation.manureTotal,
                rounding
              )}
            </strong>{" "}
            श्री{" "}
            <strong>{form.kname}</strong>{" "}
            पुत्र श्री{" "}
            <strong>{form.kfath}</strong>{" "}
            ग्राम{" "}
            <strong>{form.kgram}</strong>{" "}
            से नगद प्राप्त किया।

          </div>

          <div className="signature-block">

            हस्ताक्षर आपूर्ति कर्ता
            <input />

            <br />

            आपूर्ति कर्ता का नाम
            <input
              value={form.sname}
              onChange={(e) =>
                updateForm(
                  "sname",
                  e.target.value
                )
              }
            />

            <br />

            पिता/पति का नाम
            <input
              value={form.sfath}
              onChange={(e) =>
                updateForm(
                  "sfath",
                  e.target.value
                )
              }
            />

            <br />

            ग्राम
            <input
              value={form.sgram}
              onChange={(e) =>
                updateForm(
                  "sgram",
                  e.target.value
                )
              }
            />

          </div>

          <div className="voucher-text">

            प्रमाणित किया जाता है कि मेरे द्वारा
            श्री{" "}
            <strong>{form.sname}</strong>{" "}
            पुत्र श्री{" "}
            <strong>{form.sfath}</strong>{" "}
            ग्राम{" "}
            <strong>{form.sgram}</strong>{" "}
            को{" "}
            <strong>
              {numericArea.toFixed(2)}
            </strong>{" "}
            है0 में गोबर खाद/जैविक एवं वर्मी
            कम्पोस्ट/अन्य पोषक तत्व आदि हेतु
            मु0 रु0{" "}
            <strong>
              {formatAmount(
                calculation.manureTotal,
                rounding
              )}
            </strong>{" "}
            का नगद भुगतान किया गया है।

            अतः राजसहायता का भुगतान रु0{" "}
            <strong>
              {formatAmount(
                calculation.manureSubsidy,
                rounding
              )}
            </strong>{" "}
            मुझे करने की कृपा कीजियेगा।

          </div>

          <div className="signature-block">

            हस्ताक्षर कृषक
            <input />

            <br />

            कृषक का नाम
            <strong>{form.kname}</strong>

            <br />

            पिता/पति का नाम
            <strong>{form.kfath}</strong>

            <br />

            ग्राम
            <strong>{form.kgram}</strong>

          </div>

          <div className="voucher-text">

            प्रमाणित किया जाता है कि कृषक श्री{" "}
            <strong>{form.kname}</strong>{" "}
            पुत्र श्री{" "}
            <strong>{form.kfath}</strong>{" "}
            ग्राम{" "}
            <strong>{form.kgram}</strong>{" "}
            द्वारा{" "}
            <strong>
              {calculation.manureQty}
            </strong>{" "}
            कु0 गोबर खाद/जैविक एवं वर्मी
            कम्पोस्ट/अन्य पोषक तत्व आदि का
            कार्य किया गया है, जिसका स्थलीय
            सत्यापन मेरे द्वारा कर दिया गया है।
            अतः राजसहायता रु0{" "}
            <strong>
              {formatAmount(
                calculation.manureSubsidy,
                rounding
              )}
            </strong>{" "}
            का भुगतान करने की संस्तुति की जाती है।

          </div>

          <div className="official-sign">
            प्रभारी
            <br />
            उद्यान सचल दल
            <br />
            केन्द्र {form.kend}
          </div>

        </section>

        {/* ===================================================
            PAGE 3 — VOUCHER 2
        =================================================== */}

        {(showVoucher2 ||
          calculation.pitSubsidy > 0) && (
          <section className="udyan-page">

            <h2 className="document-title">
              कृषक अंश वाउचर सं0 - 2
            </h2>

            <h3 className="document-center">
              गड्ढा खुदान, भरान, पौध रोपण
              (1×1×1 मी0)
            </h3>

            <div className="document-center">
              फल पौध : {crop.name}
              {" | "}
              क्षेत्रफल :{" "}
              {numericArea.toFixed(2)}
              {" | "}
              वर्ष : {year}
            </div>

            <div className="voucher-text">

              मु0 रु0{" "}
              <strong>
                {formatAmount(
                  calculation.pitTotal,
                  rounding
                )}
              </strong>{" "}
              (
              {amountToWords(
                calculation.pitTotal
              )}
              ) बावत गड्ढा खुदान, भरान,
              पौध रोपण का भुगतान रु0{" "}
              <strong>
                {formatAmount(
                  calculation.pitTotal,
                  rounding
                )}
              </strong>{" "}
              श्री {form.kname} पुत्र श्री{" "}
              {form.kfath} ग्राम {form.kgram}
              से नगद प्राप्त किया।

            </div>

            <div className="signature-block">

              हस्ताक्षर श्रमिक
              <input />

              <br />

              श्रमिक का नाम
              <input
                value={form.lname}
                onChange={(e) =>
                  updateForm(
                    "lname",
                    e.target.value
                  )
                }
              />

              <br />

              पिता/पति का नाम
              <input
                value={form.lfath}
                onChange={(e) =>
                  updateForm(
                    "lfath",
                    e.target.value
                  )
                }
              />

              <br />

              ग्राम
              <input
                value={form.lgram}
                onChange={(e) =>
                  updateForm(
                    "lgram",
                    e.target.value
                  )
                }
              />

            </div>

            <div className="voucher-text">

              प्रमाणित किया जाता है कि मेरे द्वारा
              श्री {form.lname} पुत्र श्री{" "}
              {form.lfath} ग्राम {form.lgram}
              को {numericArea.toFixed(2)} है0 में
              गड्ढा खुदान, भरान, पौध रोपण हेतु
              मु0 रु0{" "}
              <strong>
                {formatAmount(
                  calculation.pitTotal,
                  rounding
                )}
              </strong>{" "}
              का नगद भुगतान किया गया है।

            </div>

            <div className="signature-block">

              हस्ताक्षर कृषक
              <input />

              <br />

              कृषक का नाम
              <strong>{form.kname}</strong>

              <br />

              पिता/पति का नाम
              <strong>{form.kfath}</strong>

              <br />

              ग्राम
              <strong>{form.kgram}</strong>

            </div>

            <div className="voucher-text">

              प्रमाणित किया जाता है कि कृषक श्री{" "}
              {form.kname} पुत्र श्री{" "}
              {form.kfath} ग्राम{" "}
              {form.kgram} द्वारा{" "}
              <strong>
                {calculation.plants}
              </strong>{" "}
              गड्ढा खुदान, भरान, पौध रोपण का
              कार्य किया गया है, जिसका स्थलीय
              सत्यापन मेरे द्वारा कर दिया गया है।

            </div>

            <div className="official-sign">
              प्रभारी
              <br />
              उद्यान सचल दल
              <br />
              केन्द्र {form.kend}
            </div>

          </section>
        )}

        {/* ===================================================
            STANDARD PAGE
        =================================================== */}

        {showStandardPage && (
          <section className="udyan-page">

            <h3 className="document-center">
              कार्यालय उद्यान विशेषज्ञ,
              कोटद्वार गढ़वाल
            </h3>

            <h2 className="document-title">
              जिला योजनान्तर्गत व्यक्तिगत
              उद्यानीकरण हेतु वर्षाकालीन
              फलपौध — संशोधित मानक
            </h2>

            {standards.map(
              (item, index) => {
                const result =
                  standardCalculation(item);

                return (
                  <div
                    className="standard-print-section"
                    key={index}
                  >

                    <h3>
                      {item.name}
                      {" — "}
                      क्षेत्रफल विस्तार हेतु
                      मानक
                    </h3>

                    <table className="standard-print-table">

                      <thead>
                        <tr>
                          <th>क्र0</th>
                          <th>कार्य/मद</th>
                          <th>मात्रा</th>
                          <th>दर</th>
                          <th>कुल व्यय</th>
                          <th>राजसहायता</th>
                          <th>कृषक अंश</th>
                        </tr>
                      </thead>

                      <tbody>

                        <tr>
                          <td>1</td>
                          <td>
                            फल पौध की लागत
                          </td>
                          <td>
                            {item.plants}
                          </td>
                          <td>
                            {item.pRate}
                          </td>
                          <td>
                            {formatAmount(
                              result.plantTotal
                            )}
                          </td>
                          <td>
                            {formatAmount(
                              result.plantTotal
                            )}
                          </td>
                          <td>0.00</td>
                        </tr>

                        <tr>
                          <td>2</td>
                          <td>
                            गड्ढा खुदान, भरान,
                            पौध रोपण
                          </td>
                          <td>
                            {item.plants}
                          </td>
                          <td>
                            {item.pitRate}
                          </td>
                          <td>
                            {formatAmount(
                              result.pitTotal
                            )}
                          </td>
                          <td>0.00</td>
                          <td>
                            {formatAmount(
                              result.pitTotal
                            )}
                          </td>
                        </tr>

                        <tr>
                          <td>3</td>
                          <td>
                            गोबर खाद/जैविक एवं
                            वर्मी कम्पोस्ट/
                            पोषक तत्व/
                            पौध सुरक्षा/
                            रोपण सिंचाई
                          </td>
                          <td>
                            {result.manureQty}
                          </td>
                          <td>
                            {item.manRate}
                          </td>
                          <td>
                            {formatAmount(
                              result.manureTotal
                            )}
                          </td>
                          <td>
                            {formatAmount(
                              Math.max(
                                0,
                                item.stdSub -
                                  result.plantTotal
                              )
                            )}
                          </td>
                          <td>
                            {formatAmount(
                              result.manureTotal -
                                Math.max(
                                  0,
                                  item.stdSub -
                                    result.plantTotal
                                )
                            )}
                          </td>
                        </tr>

                        <tr className="total-row">
                          <td colSpan="4">
                            योग :-
                          </td>

                          <td>
                            {formatAmount(
                              result.total
                            )}
                          </td>

                          <td>
                            {formatAmount(
                              result.subsidy
                            )}
                          </td>

                          <td>
                            {formatAmount(
                              result.farmer
                            )}
                          </td>
                        </tr>

                      </tbody>

                    </table>

                  </div>
                );
              }
            )}

          </section>
        )}

      </main>
    </div>
  );
}

