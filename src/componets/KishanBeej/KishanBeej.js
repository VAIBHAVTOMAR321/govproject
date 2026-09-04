import React, { useEffect, useMemo, useState } from "react";
import "./KishanBeej.css";

/*
 * किसान बीज वितरण — सरल प्रणाली
 * React version of the supplied HTML reference.
 *
 * Features:
 * - किसान वितरण
 * - बीज क्रय
 * - केन्द्रवार आवंटन
 * - स्टॉक लेजर
 * - किस्मवार मानक
 * - लाइव गणना
 * - ऑडिट जाँच
 * - रिपोर्ट
 * - CSV Export
 * - A4 Print
 *
 * Data is currently stored in localStorage.
 */

const RAW = {
  centres: [
    "किनगोड़ीखाल",
    "धुमाकोट",
    "हल्दूखाल",
    "किल्वोखाल",
    "देवियोखाल",
    "जेठागांव",
    "बीरोंखाल",
    "वेदीखाल",
    "चौखाल",
    "जयहरीखाल",
    "सिसल्ड़ी",
    "सेंधीखाल",
    "संगलाकोटी",
    "देवराजखाल",
    "पोखड़ा",
    "विथ्याणी",
    "दिउली",
    "गंगाभोगपुर",
    "चेलूसैण",
    "सिलोगी",
    "सतपुली",
    "कोटद्वार",
    "दुगड्डा",
    "पौखाल"
  ],

  varieties: [
    {
      name: "ब्रोकली Rock 001",
      jati: "सा0जाति",
      rate: 95600
    },
    {
      name: "बैंगन BSHB-33 (Navin)",
      jati: "अनु0जाति",
      rate: 14400
    },
    {
      name: "टमाटर BSHT-10 (Amol)",
      jati: "सा0जाति",
      rate: 87450
    },
    {
      name: "टमाटर Sindhu",
      jati: "सा0जाति",
      rate: 98000
    },
    {
      name: "शिमला मिर्च BSCH-888 (Indu)",
      jati: "सा0जाति",
      rate: 99000
    },
    {
      name: "शिमला मिर्च Alaska",
      jati: "सा0जाति",
      rate: 125000
    },
    {
      name: "बंदगोभी BSCB-01 (Coral)",
      jati: "सा0जाति",
      rate: 58400
    },
    {
      name: "बंदगोभी Bajwa60",
      jati: "सा0जाति",
      rate: 47900
    },
    {
      name: "फूलगोभी BSCF-11 (Mansi)",
      jati: "अनु0जाति",
      rate: 59500
    },
    {
      name: "फूलगोभी AZCL-900",
      jati: "सा0जाति",
      rate: 57200
    }
  ],

  allot: {
    "ब्रोकली Rock 001": [
      40, 40, 40, 40, 40, 40,
      40, 40, 40, 40, 40, 40,
      40, 40, 40, 40, 40, 40,
      40, 40, 40, 80, 40, 40
    ],

    "बैंगन BSHB-33 (Navin)": [
      500, 500, 500, 500, 500, 500,
      500, 500, 500, 200, 200, 200,
      500, 500, 500, 500, 200, 400,
      500, 500, 500, 500, 500, 500
    ],

    "टमाटर BSHT-10 (Amol)": [
      240, 240, 240, 240, 240, 240,
      240, 240, 240, 200, 200, 240,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0
    ],

    "टमाटर Sindhu": [
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      200, 200, 200, 200, 200, 200,
      200, 200, 200, 350, 200, 200
    ],

    "शिमला मिर्च BSCH-888 (Indu)": [
      320, 200, 200, 200, 200, 200,
      200, 200, 200, 200, 200, 200,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0
    ],

    "शिमला मिर्च Alaska": [
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      160, 160, 160, 160, 160, 160,
      160, 160, 160, 240, 160, 160
    ],

    "बंदगोभी BSCB-01 (Coral)": [
      350, 350, 430, 350, 350, 350,
      350, 350, 350, 350, 350, 350,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0
    ],

    "बंदगोभी Bajwa60": [
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      420, 420, 420, 420, 420, 420,
      420, 420, 420, 420, 590, 420
    ],

    "फूलगोभी BSCF-11 (Mansi)": [
      440, 460, 330, 330, 330, 330,
      330, 330, 330, 330, 330, 330,
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0
    ],

    "फूलगोभी AZCL-900": [
      0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0,
      330, 330, 330, 330, 330, 330,
      330, 330, 330, 630, 440, 330
    ]
  }
};

const PURCHASE_SEED = [
  [
    "टमाटर BSHT-10 (Amol)",
    "2026-05-15",
    "Anishree Traders",
    87450,
    2.8,
    "देयक सं0 90"
  ],
  [
    "टमाटर Sindhu",
    "2026-05-15",
    "Devbhoomi Farming Solutions",
    98000,
    2.55,
    "देयक सं0 86"
  ],
  [
    "ब्रोकली Rock 001",
    "2026-05-15",
    "Devbhoomi Farming Solutions",
    95600,
    1.0,
    "देयक सं0 113"
  ],
  [
    "बैंगन BSHB-33 (Navin)",
    "2026-05-15",
    "Devbhoomi Farming Solutions",
    14400,
    10.7,
    "देयक सं0 113"
  ],
  [
    "शिमला मिर्च BSCH-888 (Indu)",
    "2026-05-15",
    "NIRVANA IRRIGATION",
    99000,
    2.52,
    "देयक सं0 65"
  ],
  [
    "शिमला मिर्च Alaska",
    "2026-05-15",
    "Anishree Traders",
    125000,
    2.0,
    "देयक सं0 81"
  ],
  [
    "फूलगोभी AZCL-900",
    "2026-05-22",
    "NIRVANA IRRIGATION",
    57200,
    4.37,
    "देयक सं0 116"
  ],
  [
    "फूलगोभी BSCF-11 (Mansi)",
    "2026-05-22",
    "Devbhoomi Farming Solutions",
    59500,
    4.2,
    "देयक सं0 182"
  ],
  [
    "बंदगोभी Bajwa60",
    "2026-05-22",
    "Anishree Traders",
    47900,
    5.21,
    "देयक सं0 138"
  ],
  [
    "बंदगोभी BSCB-01 (Coral)",
    "2026-05-22",
    "NIRVANA IRRIGATION",
    58400,
    4.28,
    "देयक सं0 177"
  ]
];

const CENTRES = RAW.centres;
const VARS = RAW.varieties;
const NAMES = VARS.map((v) => v.name);

const STORAGE = {
  master: "kishan-beej-master",
  manak: "kishan-beej-manak",
  purchases: "kishan-beej-purchases",
  receipts: "kishan-beej-receipts",
  entries: "kishan-beej-entries"
};

const today = () => {
  return new Date().toISOString().slice(0, 10);
};

const money = (x) =>
  "₹" +
  Number(x || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

const num = (x, d = 2) =>
  Number(x || 0).toLocaleString("en-IN", {
    minimumFractionDigits: d,
    maximumFractionDigits: d
  });

const gm = (x) => num(x, 2);

const dmy = (s) =>
  s ? String(s).split("-").reverse().join("-") : "";

const uid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const defMaster = () => ({
  purchaseLimit: 250000,
  projectCost: 60000,
  maxSubsidy: 30000,
  farmerShare: 30000
});

function defManak() {
  const out = {};

  VARS.forEach((v) => {
    out[v.name] = {
      jati: v.jati,

      item1: {
        label:
          "खेत तैयारी + पौधशाला प्रबन्धन (कृषक अंश)",
        unit: "हैक्टेयर-तुल्य",
        qty: 1,
        rate: 8700
      },

      item2: {
        label: "बीज की कीमत (राजसहायता)",
        unit: "किग्रा0",
        qty: 30000 / v.rate,
        rate: v.rate
      },

      item3: {
        label: "गोबर/कम्पोस्ट खाद (कृषक अंश)",
        unit: "कुन्तल",
        qty: 100,
        rate: 150
      },

      item4: {
        label:
          "रोपण/सिंचाई/स्टेकिंग आदि (कृषक अंश)",
        unit: "श्रमिक/अन्य",
        qty: 20,
        rate: 315
      }
    };
  });

  return out;
}

const defPurchases = () =>
  PURCHASE_SEED.map(
    (
      [variety, date, supplier, rate, qty, ref],
      i
    ) => ({
      id: uid(),
      serial: i + 1,
      date,
      variety,
      supplier,
      qty,
      unit: "kg",
      rate,
      amount: qty * rate,
      ref
    })
  );

function defReceipts() {
  const out = [];
  let serial = 1;

  CENTRES.forEach((centre, i) => {
    VARS.forEach((v) => {
      const qty =
        RAW.allot[v.name]?.[i] || 0;

      if (qty > 0) {
        out.push({
          id: uid(),
          serial: serial++,
          date: "2026-06-01",
          centre,
          variety: v.name,
          qty,
          source:
            "आवंटन पत्र जिला यो0-सब्जी/2026-27"
        });
      }
    });
  });

  return out;
}

function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);

    return raw
      ? JSON.parse(raw)
      : fallback();
  } catch {
    return fallback();
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch {}
}

const amount = (item) =>
  Number(item?.qty || 0) *
  Number(item?.rate || 0);

function totals(c) {
  const t1 = amount(c.item1);
  const t2 = amount(c.item2);
  const t3 = amount(c.item3);
  const t4 = amount(c.item4);

  return {
    t1,
    t2,
    t3,
    t4,
    total: t1 + t2 + t3 + t4,
    subsidy: t2,
    farmer: t1 + t3 + t4,
    gmha:
      Number(c.item2.qty || 0) * 1000
  };
}

const escapeCsv = (value) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function KishanBeej() {
  const [tab, setTab] = useState("home");

  const [stockTab, setStockTab] =
    useState("ledger");

  const [master, setMaster] = useState(() =>
    readStore(
      STORAGE.master,
      defMaster
    )
  );

  const [manak, setManak] = useState(() =>
    readStore(
      STORAGE.manak,
      defManak
    )
  );

  const [purchases, setPurchases] =
    useState(() =>
      readStore(
        STORAGE.purchases,
        defPurchases
      )
    );

  const [receipts, setReceipts] =
    useState(() =>
      readStore(
        STORAGE.receipts,
        defReceipts
      )
    );

  const [entries, setEntries] =
    useState(() =>
      readStore(
        STORAGE.entries,
        () => []
      )
    );

  const [form, setForm] = useState({
    date: today(),
    centre: "",
    variety: "",
    area: "",
    name: "",
    father: "",
    village: "",
    mobile: "",
    sign1: "नहीं",
    sign2: "नहीं",
    note: ""
  });

  const [filters, setFilters] =
    useState({
      centre: "",
      variety: "",
      search: ""
    });

  const [stockSearch, setStockSearch] =
    useState("");

  const [allotForm, setAllotForm] =
    useState({
      date: today(),
      centre: "",
      variety: "",
      qty: "",
      source: ""
    });

  const [purchaseForm, setPurchaseForm] =
    useState({
      date: today(),
      variety: "",
      qty: "",
      rate: "",
      supplier: "",
      ref: ""
    });

  const [masterDraft, setMasterDraft] =
    useState(master);

  const [message, setMessage] =
    useState("");

  const [expanded, setExpanded] =
    useState({});

  useEffect(() => {
    writeStore(
      STORAGE.master,
      master
    );
  }, [master]);

  useEffect(() => {
    writeStore(
      STORAGE.manak,
      manak
    );
  }, [manak]);

  useEffect(() => {
    writeStore(
      STORAGE.purchases,
      purchases
    );
  }, [purchases]);

  useEffect(() => {
    writeStore(
      STORAGE.receipts,
      receipts
    );
  }, [receipts]);

  useEffect(() => {
    writeStore(
      STORAGE.entries,
      entries
    );
  }, [entries]);

  const purchAmt = (v) =>
    purchases
      .filter((p) => p.variety === v)
      .reduce(
        (s, p) =>
          s + Number(p.amount || 0),
        0
      );

  const purchGm = (v) =>
    purchases
      .filter((p) => p.variety === v)
      .reduce(
        (s, p) =>
          s +
          (p.unit === "kg"
            ? Number(p.qty || 0) * 1000
            : Number(p.qty || 0)),
        0
      );

  const allotGm = (v) =>
    receipts
      .filter((r) => r.variety === v)
      .reduce(
        (s, r) =>
          s + Number(r.qty || 0),
        0
      );

  const centralLeft = (v) =>
    purchGm(v) - allotGm(v);

  const opening = (c, v) =>
    receipts
      .filter(
        (r) =>
          r.centre === c &&
          r.variety === v
      )
      .reduce(
        (s, r) =>
          s + Number(r.qty || 0),
        0
      );

  const issued = (c, v) =>
    entries
      .filter(
        (e) =>
          e.centre === c &&
          e.variety === v
      )
      .reduce(
        (s, e) =>
          s + Number(e.seed_gm || 0),
        0
      );

  const remPower = (v) =>
    Math.max(
      0,
      master.purchaseLimit -
        purchAmt(v)
    );

  const gmha = (v) =>
    Number(
      manak[v]?.item2?.qty || 0
    ) * 1000;

  const centreVarieties = (centre) =>
    centre
      ? NAMES.filter(
          (v) =>
            opening(centre, v) > 0
        )
      : NAMES;

  /*
   * Live farmer distribution calculation
   */
  const calcEntry = useMemo(() => {
    const a = parseFloat(form.area);

    const c = manak[form.variety];

    if (
      !form.variety ||
      !a ||
      a <= 0 ||
      !c
    ) {
      return null;
    }

    const t = totals(c);

    return {
      variety: form.variety,

      area: a,

      seed_gm:
        a *
        c.item2.qty *
        1000,

      i1: {
        qty:
          a *
          c.item1.qty,

        amt:
          a *
          t.t1
      },

      i2: {
        qty:
          a *
          c.item2.qty,

        amt:
          a *
          t.t2
      },

      i3: {
        qty:
          a *
          c.item3.qty,

        amt:
          a *
          t.t3
      },

      i4: {
        qty:
          a *
          c.item4.qty,

        amt:
          a *
          t.t4
      },

      subsidy:
        a * t.subsidy,

      farmer:
        a * t.farmer,

      total:
        a * t.total,

      snap: JSON.parse(
        JSON.stringify(c)
      )
    };
  }, [
    form.area,
    form.variety,
    manak
  ]);

  /*
   * Live allocation calculation
   */
  const allotCalc = useMemo(() => {
    const q =
      parseFloat(allotForm.qty);

    const v =
      allotForm.variety;

    if (
      !v ||
      !q ||
      q <= 0
    ) {
      return null;
    }

    const area =
      q / gmha(v);

    return {
      variety: v,

      gmv: q,

      area,

      project:
        area *
        master.projectCost,

      subsidy:
        area *
        master.maxSubsidy,

      farmer:
        area *
        master.farmerShare
    };
  }, [
    allotForm.qty,
    allotForm.variety,
    master,
    manak
  ]);

  /*
   * Live purchase calculation
   */
  const purchaseCalc =
    useMemo(() => {
      const q =
        parseFloat(
          purchaseForm.qty
        );

      const r =
        parseFloat(
          purchaseForm.rate
        );

      if (
        !purchaseForm.variety ||
        !q ||
        !r
      ) {
        return null;
      }

      const total = q * r;

      const done =
        purchAmt(
          purchaseForm.variety
        );

      const left =
        master.purchaseLimit -
        done;

      return {
        total,
        done,
        left,
        after:
          done + total,
        remaining:
          left - total
      };
    }, [
      purchaseForm,
      purchases,
      master
    ]);

  const filteredEntries =
    entries.filter((e) =>
      (!filters.centre ||
        e.centre ===
          filters.centre) &&
      (!filters.variety ||
        e.variety ===
          filters.variety) &&
      (!filters.search ||
        `${e.name || ""}${
          e.village || ""
        }${e.father || ""}`
          .toLowerCase()
          .includes(
            filters.search.toLowerCase()
          ))
    );

  /*
   * Centre stock ledger
   */
  const ledgerRows = useMemo(() => {
    const out = [];

    CENTRES.forEach((c) => {
      NAMES.forEach((v) => {
        const o = opening(c, v);
        const i = issued(c, v);

        if (o || i) {
          out.push({
            centre: c,
            variety: v,
            opening: o,
            issued: i,
            balance: o - i,
            farmers:
              entries.filter(
                (e) =>
                  e.centre === c &&
                  e.variety === v
              ).length
          });
        }
      });
    });

    return out.filter(
      (r) =>
        !stockSearch ||
        `${r.centre}${r.variety}`
          .toLowerCase()
          .includes(
            stockSearch.toLowerCase()
          )
    );
  }, [
    receipts,
    entries,
    stockSearch
  ]);

  /*
   * Audit checks
   */
  const auditChecks = useMemo(() => {
    const over =
      ledgerRows.filter(
        (r) => r.balance < 0
      );

    const nosign =
      entries.filter(
        (e) =>
          e.sign1 !== "हाँ" ||
          e.sign2 !== "हाँ"
      );

    const badManak =
      NAMES.filter(
        (v) =>
          Math.abs(
            totals(manak[v]).total -
              master.projectCost
          ) >= 0.5
      );

    const overAll =
      NAMES.filter(
        (v) =>
          centralLeft(v) < -0.5
      );

    const atLimit =
      NAMES.filter(
        (v) =>
          remPower(v) <= 0.5 &&
          purchAmt(v) > 0
      );

    const S =
      entries.reduce(
        (s, e) =>
          s + Number(e.subsidy || 0),
        0
      );

    const F =
      entries.reduce(
        (s, e) =>
          s + Number(e.farmer || 0),
        0
      );

    const T =
      entries.reduce(
        (s, e) =>
          s + Number(e.total || 0),
        0
      );

    return [
      {
        ok: !over.length,
        t: over.length
          ? `${over.length} केन्द्र-किस्म संयोजन में स्टॉक से अधिक वितरण — स्टॉक टैब में लाल पंक्तियाँ देखें।`
          : "किसी भी केन्द्र में स्टॉक से अधिक वितरण नहीं हुआ।"
      },

      {
        ok: !nosign.length,
        t: nosign.length
          ? `${nosign.length} प्रविष्टियों में कृषक/वितरक हस्ताक्षर बाकी हैं।`
          : "सभी प्रविष्टियों में दोनों हस्ताक्षर पूर्ण हैं।"
      },

      {
        ok: !badManak.length,
        t: badManak.length
          ? `${badManak.join(
              ", "
            )} — इनका मानक ₹${num(
              master.projectCost,
              0
            )}/है0 से भिन्न है, मानक टैब में जाँचें।`
          : `सभी 10 किस्मों का मानक ₹${num(
              master.projectCost,
              0
            )}/है0 से पूरा मेल खाता है।`
      },

      {
        ok: !overAll.length,
        t: overAll.length
          ? `${overAll.join(
              ", "
            )} — इनका केन्द्र-आवंटन कुल खरीद से अधिक है।`
          : "किसी किस्म का आवंटन उसकी खरीदी मात्रा से अधिक नहीं है।"
      },

      {
        ok:
          Math.abs(
            S + F - T
          ) < 0.5,

        t: `कुल राजसहायता ${money(
          S
        )} + कृषक अंश ${money(
          F
        )} = कुल परियोजना निवेश ${money(
          T
        )} — मिलान सही।`
      },

      {
        ok: true,

        t: atLimit.length
          ? `${atLimit.join(
              ", "
            )} — इनकी क्रय सीमा ${money(
              master.purchaseLimit
            )} समाप्त, आगे खरीद स्वीकार नहीं होगी।`
          : "किसी भी किस्म की क्रय सीमा अभी समाप्त नहीं हुई है।"
      },

      {
        ok: true,

        t: "कृषक अंश नकद वितरित राशि नहीं, केवल अभिलेखीय स्व-अंशदान मूल्य है।"
      }
    ];
  }, [
    ledgerRows,
    entries,
    manak,
    master,
    purchases
  ]);

  /*
   * Variety report
   */
  const reportRows =
    NAMES.map((v) => {
      const pa = purchAmt(v);

      const rp = remPower(v);

      const ag = allotGm(v);

      const cl =
        centralLeft(v);

      const dist =
        CENTRES.reduce(
          (s, c) =>
            s + issued(c, v),
          0
        );

      const area =
        ag / gmha(v);

      const proj =
        area *
        master.projectCost;

      return {
        v,
        pa,
        rp,
        ag,
        cl,
        dist,
        area,
        proj,

        count:
          entries.filter(
            (e) =>
              e.variety === v
          ).length,

        pkg: purchGm(v)
      };
    });

  function setF(key, value) {
    setForm((prev) => {
      const next = {
        ...prev,
        [key]: value
      };

      if (key === "centre") {
        next.variety =
          centreVarieties(
            value
          ).includes(
            prev.variety
          )
            ? prev.variety
            : "";
      }

      return next;
    });
  }

  /*
   * Add farmer distribution entry
   */
  function addEntry() {
    if (
      !form.date ||
      !form.centre ||
      !calcEntry ||
      !form.name.trim()
    ) {
      setMessage(
        "दिनांक, केन्द्र, किस्म, कृषक का नाम एवं क्षेत्रफल — पाँचों भरना ज़रूरी है।"
      );

      return;
    }

    const left =
      opening(
        form.centre,
        calcEntry.variety
      ) -
      issued(
        form.centre,
        calcEntry.variety
      ) -
      calcEntry.seed_gm;

    if (
      left < 0 &&
      !window.confirm(
        `${form.centre} में ${calcEntry.variety} का स्टॉक कम पड़ रहा है (${gm(
          left
        )} ग्राम ऋणात्मक)। फिर भी दर्ज करें?`
      )
    ) {
      return;
    }

    const e = {
      id: uid(),

      serial:
        entries.length + 1,

      ...form,

      name:
        form.name.trim(),

      father:
        form.father.trim(),

      village:
        form.village.trim(),

      mobile:
        form.mobile.trim(),

      note:
        form.note.trim(),

      area:
        calcEntry.area,

      seed_gm:
        calcEntry.seed_gm,

      i1:
        calcEntry.i1,

      i2:
        calcEntry.i2,

      i3:
        calcEntry.i3,

      i4:
        calcEntry.i4,

      subsidy:
        calcEntry.subsidy,

      farmer:
        calcEntry.farmer,

      total:
        calcEntry.total,

      manakSnapshot:
        calcEntry.snap
    };

    setEntries((prev) => [
      ...prev,
      e
    ]);

    setForm((prev) => ({
      ...prev,

      name: "",
      father: "",
      village: "",
      mobile: "",
      area: "",
      note: "",
      sign1: "नहीं",
      sign2: "नहीं"
    }));

    setMessage(
      `✓ जुड़ गया — ${e.name}, ${e.centre}, ${e.variety}, ${gm(
        e.seed_gm
      )} ग्राम।`
    );

    setTimeout(
      () => setMessage(""),
      5000
    );
  }

  /*
   * Add purchase
   */
  function addPurchase() {
    const {
      date,
      variety,
      qty,
      rate,
      supplier,
      ref
    } = purchaseForm;

    const q =
      parseFloat(qty);

    const r =
      parseFloat(rate);

    const a = q * r;

    if (
      !date ||
      !variety ||
      !q ||
      !r
    ) {
      setMessage(
        "दिनांक, किस्म, मात्रा व दर भरें।"
      );

      return;
    }

    if (
      a >
      master.purchaseLimit -
        purchAmt(variety) +
        0.01
    ) {
      setMessage(
        `अस्वीकृत — ${variety} की क्रय सीमा पार हो जाएगी।`
      );

      return;
    }

    setPurchases((prev) => [
      ...prev,

      {
        id: uid(),

        serial:
          prev.length + 1,

        date,

        variety,

        supplier,

        qty: q,

        unit: "kg",

        rate: r,

        amount: a,

        ref
      }
    ]);

    setPurchaseForm(
      (prev) => ({
        ...prev,

        qty: "",
        rate: "",
        supplier: "",
        ref: ""
      })
    );

    setMessage(
      `✓ क्रय जुड़ा — ${variety}, ${num(
        q,
        3
      )} किग्रा0 = ${money(a)}।`
    );

    setTimeout(
      () => setMessage(""),
      5000
    );
  }

  /*
   * Add centre allocation
   */
  function addAllot() {
    const k = allotCalc;

    if (
      !allotForm.date ||
      !allotForm.centre ||
      !k
    ) {
      setMessage(
        "दिनांक, केन्द्र, किस्म व मात्रा भरें।"
      );

      return;
    }

    if (
      k.gmv >
      centralLeft(k.variety) +
        0.01
    ) {
      setMessage(
        `अस्वीकृत — केन्द्रीय शेष स्टॉक केवल ${gm(
          centralLeft(
            k.variety
          )
        )} ग्राम है।`
      );

      return;
    }

    setReceipts((prev) => [
      ...prev,

      {
        id: uid(),

        serial:
          prev.length + 1,

        date:
          allotForm.date,

        centre:
          allotForm.centre,

        variety:
          k.variety,

        qty:
          k.gmv,

        area:
          k.area,

        project:
          k.project,

        subsidy:
          k.subsidy,

        farmer:
          k.farmer,

        source:
          allotForm.source
      }
    ]);

    setAllotForm(
      (prev) => ({
        ...prev,

        qty: "",
        source: ""
      })
    );

    setMessage(
      `✓ ${allotForm.centre} को ${allotForm.variety} की ${gm(
        k.gmv
      )} ग्राम आवंटित।`
    );

    setTimeout(
      () => setMessage(""),
      5000
    );
  }

  /*
   * CSV export
   */
  function downloadCsv(
    name,
    headers,
    rows
  ) {
    const content =
      "\uFEFF" +
      [
        headers,
        ...rows
      ]
        .map((row) =>
          row
            .map(escapeCsv)
            .join(",")
        )
        .join("\r\n");

    const a =
      document.createElement(
        "a"
      );

    a.href =
      URL.createObjectURL(
        new Blob(
          [content],
          {
            type:
              "text/csv;charset=utf-8"
          }
        )
      );

    a.download =
      `${name}-${today()}.csv`;

    document.body.appendChild(a);

    a.click();

    a.remove();

    setTimeout(
      () =>
        URL.revokeObjectURL(
          a.href
        ),
      1000
    );
  }

  /*
   * A4 print helper
   */
  function printHtml(html) {
    const w =
      window.open(
        "",
        "_blank",
        "width=1200,height=800"
      );

    if (!w) {
      window.print();
      return;
    }

    w.document.write(`
      <!doctype html>

      <html lang="hi">

      <head>
        <meta charset="utf-8">

        <title>
          किसान बीज वितरण
        </title>

        <link
          rel="stylesheet"
          href="${window.location.origin}/src/KishanBeej/KishanBeej.css"
        >
      </head>

      <body>

        <div class="print-page">
          ${html}
        </div>

        <script>
          window.onload = () =>
            setTimeout(
              () => window.print(),
              250
            );
        <\/script>

      </body>

      </html>
    `);

    w.document.close();
  }

  /*
   * Print register
   */
  function printRegister(
    list = filteredEntries,
    title = "किसान बीज वितरण रजिस्टर"
  ) {
    if (!list.length) {
      alert(
        "छापने के लिए कोई प्रविष्टि नहीं है।"
      );

      return;
    }

    const rows =
      list
        .map(
          (e, i) => `
            <tr>

              <td>${i + 1}</td>

              <td>
                ${dmy(e.date)}
              </td>

              <td>
                ${e.centre}
              </td>

              <td>
                ${e.variety}
              </td>

              <td>
                ${e.name}
              </td>

              <td>
                ${e.village || ""}
              </td>

              <td>
                ${num(e.area, 3)}
              </td>

              <td>
                ${num(
                  e.i1.qty,
                  2
                )}
                /
                ${money(
                  e.i1.amt
                )}
              </td>

              <td>
                ${gm(
                  e.seed_gm
                )}
                /
                ${money(
                  e.i2.amt
                )}
              </td>

              <td>
                ${num(
                  e.i3.qty,
                  2
                )}
                /
                ${money(
                  e.i3.amt
                )}
              </td>

              <td>
                ${num(
                  e.i4.qty,
                  2
                )}
                /
                ${money(
                  e.i4.amt
                )}
              </td>

              <td>
                ${money(
                  e.total
                )}
              </td>

              <td>
                ${money(
                  e.subsidy
                )}
              </td>

              <td>
                ${money(
                  e.farmer
                )}
              </td>

              <td class="signature-cell">
              </td>

            </tr>
          `
        )
        .join("");

    printHtml(`
      <h2>
        ${title}
      </h2>

      <p class="pm">
        उद्यान सचल दल कार्यालय,
        कोटद्वार गढ़वाल ·
        जिला कार्ययोजना 2026-27 ·
        छपाई दिनांक
        ${dmy(today())}
      </p>

      <table>

        <thead>

          <tr>

            <th>क्र0</th>

            <th>दिनांक</th>

            <th>केन्द्र</th>

            <th>किस्म</th>

            <th>कृषक का नाम</th>

            <th>ग्राम</th>

            <th>
              क्षे0फ0
              <br />
              (है0)
            </th>

            <th>
              खेत तैयारी +
              पौधशाला प्रबन्धन
              <br />
              मात्रा / राशि
            </th>

            <th>
              बीज
              <br />
              ग्राम / राशि
            </th>

            <th>
              गोबर/कम्पोस्ट खाद
              <br />
              मात्रा / राशि
            </th>

            <th>
              रोपण/सिंचाई/
              स्टेकिंग आदि
              <br />
              मात्रा / राशि
            </th>

            <th>
              कुल लागत
            </th>

            <th>
              राजसहायता
            </th>

            <th>
              कृषक अंश
            </th>

            <th>
              कृषक
              हस्ताक्षर/अंगूठा
            </th>

          </tr>

        </thead>

        <tbody>
          ${rows}
        </tbody>

      </table>

      <p class="pm signline">
        हस्ताक्षर उद्यान सचल दल
        .....................................
        &nbsp;&nbsp;&nbsp;&nbsp;
        हस्ताक्षर केन्द्र प्रभारी
        .....................................
      </p>
    `);
  }

  function updateManak(
    v,
    key,
    field,
    value
  ) {
    setManak((prev) => ({
      ...prev,

      [v]: {
        ...prev[v],

        [key]: {
          ...prev[v][key],

          [field]:
            Number(value) || 0
        }
      }
    }));
  }

  const received =
    ledgerRows.reduce(
      (s, r) =>
        s + r.opening,
      0
    );

  const distributed =
    ledgerRows.reduce(
      (s, r) =>
        s + r.issued,
      0
    );

  const purchaseTotal =
    purchases.reduce(
      (s, p) =>
        s +
        Number(
          p.amount || 0
        ),
      0
    );

  const overCount =
    ledgerRows.filter(
      (r) =>
        r.balance < 0
    ).length;

  const noSign =
    entries.filter(
      (e) =>
        e.sign1 !== "हाँ" ||
        e.sign2 !== "हाँ"
    ).length;

  return (
    <div className="kishan-beej-app">

      {/* HEADER */}

      <header>

        <div className="in">

          <div className="eyebrow">
            उद्यान विशेषज्ञ कार्यालय ·
            कोटद्वार गढ़वाल
          </div>

          <h1>
            किसान बीज वितरण —
            सरल प्रणाली
          </h1>

          <p>
            जिला कार्ययोजना 2026-27 ·
            क्षेत्रफल विस्तार सब्जी योजना ·
            क्रय → आवंटन → वितरण,
            सब स्वतः जुड़ा
          </p>

        </div>

      </header>

      {/* NAVIGATION */}

      <nav>

        <div className="in">

          {[
            ["home", "🏠", "होम"],
            ["entry", "✍️", "वितरण"],
            ["stock", "📦", "स्टॉक"],
            ["manak", "⚙️", "मानक"],
            ["report", "📊", "रिपोर्ट"]
          ].map(
            ([id, ic, label]) => (
              <button
                key={id}
                className={
                  tab === id
                    ? "on"
                    : ""
                }
                onClick={() =>
                  setTab(id)
                }
              >
                <span className="ic">
                  {ic}
                </span>

                {label}
              </button>
            )
          )}

        </div>

      </nav>

      <main>

        {/* HOME */}

        {tab === "home" && (
          <section className="panel on">

            <h2>
              एक नज़र में स्थिति
            </h2>

            <p className="sub">
              नीचे पूरी योजना की जीवंत
              स्थिति है। कोई भी संख्या
              लाल दिखे तो उसी टैब में
              जाकर जाँच करें।
            </p>

            <div className="kpis">

              <Kpi
                label="कुल क्रय राशि"
                value={money(
                  purchaseTotal
                )}
                sub="सभी 10 किस्में"
              />

              <Kpi
                label="किसानों को वितरित"
                value={`${gm(
                  distributed
                )} ग्राम`}
                sub={`${entries.length} प्रविष्टियाँ`}
              />

              <Kpi
                label="केन्द्रों में शेष"
                value={`${gm(
                  received -
                    distributed
                )} ग्राम`}
                sub={`प्राप्त ${num(
                  received,
                  0
                )} ग्राम में से`}
                state={
                  received -
                    distributed <
                  0
                    ? "bad"
                    : "ok"
                }
              />

              <Kpi
                label="ध्यान देने योग्य"
                value={
                  overCount +
                  noSign
                }
                sub={`${overCount} अधिक-वितरण, ${noSign} हस्ताक्षर बाकी`}
                state={
                  overCount +
                    noSign
                    ? "bad"
                    : "ok"
                }
              />

            </div>

            <div className="card">

              <h3>
                ज़रूरी जाँच
              </h3>

              <ul className="chk">

                {auditChecks
                  .slice(0, 5)
                  .map(
                    (c, i) => (
                      <li key={i}>

                        <span
                          className={`i ${
                            c.ok
                              ? "ok"
                              : "bad"
                          }`}
                        >
                          {c.ok
                            ? "✔"
                            : "✘"}
                        </span>

                        <span>
                          {c.t}
                        </span>

                      </li>
                    )
                  )}

              </ul>

            </div>

            <div className="card">

              <h3>
                काम का क्रम — बस
                इतना ही
              </h3>

              <ul className="chk">

                <li>
                  <span className="i ok">
                    1
                  </span>

                  <span>
                    <b>
                      मानक टैब
                    </b>{" "}
                    — एक बार जाँच लें
                    कि हर किस्म का कुल
                    ₹60,000/है0
                    (राजसहायता ₹30,000
                    + कृषक अंश ₹30,000)
                    से मेल खाता है।
                  </span>
                </li>

                <li>
                  <span className="i ok">
                    2
                  </span>

                  <span>
                    <b>
                      स्टॉक टैब
                    </b>{" "}
                    — बीज की खरीद और
                    केन्द्रों को आवंटन
                    यहीं दर्ज होता है।
                  </span>
                </li>

                <li>
                  <span className="i ok">
                    3
                  </span>

                  <span>
                    <b>
                      वितरण टैब
                    </b>{" "}
                    — केन्द्र, किस्म,
                    किसान का नाम और
                    क्षेत्रफल भरें —
                    बाक़ी सब अपने आप।
                  </span>
                </li>

                <li>
                  <span className="i ok">
                    4
                  </span>

                  <span>
                    <b>
                      रिपोर्ट टैब
                    </b>{" "}
                    — छपाई व CSV।
                  </span>
                </li>

              </ul>

            </div>

          </section>
        )}

        {/* DISTRIBUTION */}

        {tab === "entry" && (
          <section className="panel on">

            <h2>
              किसान को बीज वितरण
            </h2>

            <p className="sub">
              केवल{" "}
              <b>
                केन्द्र, किस्म,
                किसान का नाम और
                क्षेत्रफल
              </b>{" "}
              भरना है — बीज की
              मात्रा, चारों मद और
              राशि अपने आप निकल
              आएँगी।
            </p>

            <div className="card noprint">

              <h3>
                नई प्रविष्टि
              </h3>

              <div className="grid g4">

                <Field label="दिनांक *">
                  <input
                    type="date"
                    className="need"
                    value={form.date}
                    onChange={(e) =>
                      setF(
                        "date",
                        e.target.value
                      )
                    }
                  />
                </Field>

                <Field label="उ0स0द0 केन्द्र *">
                  <select
                    className="need"
                    value={form.centre}
                    onChange={(e) =>
                      setF(
                        "centre",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      — केन्द्र चुनें —
                    </option>

                    {CENTRES.map(
                      (c) => (
                        <option
                          key={c}
                        >
                          {c}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="किस्म *">
                  <select
                    className="need"
                    value={form.variety}
                    onChange={(e) =>
                      setF(
                        "variety",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      — किस्म चुनें —
                    </option>

                    {centreVarieties(
                      form.centre
                    ).map(
                      (v) => (
                        <option
                          key={v}
                        >
                          {v}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="क्षेत्रफल (है0) *">
                  <input
                    type="number"
                    className="need"
                    step="0.001"
                    min="0.001"
                    placeholder="जैसे 0.200"
                    value={form.area}
                    onChange={(e) =>
                      setF(
                        "area",
                        e.target.value
                      )
                    }
                  />
                </Field>

              </div>

              <div className="grid g4 mt10">

                <Field label="कृषक का नाम *">
                  <input
                    value={form.name}
                    placeholder="श्री ..."
                    onChange={(e) =>
                      setF(
                        "name",
                        e.target.value
                      )
                    }
                  />
                </Field>

                <Field label="पिता/पति का नाम">
                  <input
                    value={
                      form.father
                    }
                    onChange={(e) =>
                      setF(
                        "father",
                        e.target.value
                      )
                    }
                  />
                </Field>

                <Field label="ग्राम">
                  <input
                    value={
                      form.village
                    }
                    onChange={(e) =>
                      setF(
                        "village",
                        e.target.value
                      )
                    }
                  />
                </Field>

                <Field label="मोबाइल नं0">
                  <input
                    type="tel"
                    value={
                      form.mobile
                    }
                    onChange={(e) =>
                      setF(
                        "mobile",
                        e.target.value
                      )
                    }
                  />
                </Field>

              </div>

              <div className="grid g3 mt10">

                <Field label="कृषक हस्ताक्षर/अंगूठा">
                  <select
                    value={
                      form.sign1
                    }
                    onChange={(e) =>
                      setF(
                        "sign1",
                        e.target.value
                      )
                    }
                  >
                    <option>
                      नहीं
                    </option>

                    <option>
                      हाँ
                    </option>
                  </select>
                </Field>

                <Field label="वितरक हस्ताक्षर">
                  <select
                    value={
                      form.sign2
                    }
                    onChange={(e) =>
                      setF(
                        "sign2",
                        e.target.value
                      )
                    }
                  >
                    <option>
                      नहीं
                    </option>

                    <option>
                      हाँ
                    </option>
                  </select>
                </Field>

                <Field label="टिप्पणी">
                  <input
                    value={
                      form.note
                    }
                    onChange={(e) =>
                      setF(
                        "note",
                        e.target.value
                      )
                    }
                  />
                </Field>

              </div>

              <EntryPreview
                calc={calcEntry}
                centre={
                  form.centre
                }
                opening={
                  opening
                }
                issued={
                  issued
                }
              />

              <div className="row mt12">

                <button
                  className="btn b1"
                  onClick={
                    addEntry
                  }
                >
                  ✓ रजिस्टर में
                  जोड़ें
                </button>

                <button
                  className="btn b2"
                  onClick={() =>
                    setForm({
                      date: today(),
                      centre: "",
                      variety: "",
                      area: "",
                      name: "",
                      father: "",
                      village: "",
                      mobile: "",
                      sign1: "नहीं",
                      sign2: "नहीं",
                      note: ""
                    })
                  }
                >
                  साफ़ करें
                </button>

              </div>

              {message && (
                <div
                  className={`note ${
                    message.startsWith(
                      "✓"
                    )
                      ? "ok"
                      : "bad"
                  } mt10`}
                >
                  {message}
                </div>
              )}

            </div>

            <div className="card noprint">

              <div className="grid g3">

                <Field label="केन्द्र से छाँटें">
                  <select
                    value={
                      filters.centre
                    }
                    onChange={(e) =>
                      setFilters(
                        (p) => ({
                          ...p,
                          centre:
                            e.target
                              .value,
                          variety:
                            ""
                        })
                      )
                    }
                  >
                    <option value="">
                      सभी केन्द्र
                    </option>

                    {CENTRES.map(
                      (c) => (
                        <option
                          key={c}
                        >
                          {c}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="किस्म से छाँटें">
                  <select
                    value={
                      filters.variety
                    }
                    onChange={(e) =>
                      setFilters(
                        (p) => ({
                          ...p,
                          variety:
                            e.target
                              .value
                        })
                      )
                    }
                  >
                    <option value="">
                      सभी किस्में
                    </option>

                    {centreVarieties(
                      filters.centre
                    ).map(
                      (v) => (
                        <option
                          key={v}
                        >
                          {v}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="नाम/ग्राम से खोजें">
                  <input
                    placeholder="टाइप करें..."
                    value={
                      filters.search
                    }
                    onChange={(e) =>
                      setFilters(
                        (p) => ({
                          ...p,
                          search:
                            e.target
                              .value
                        })
                      )
                    }
                  />
                </Field>

              </div>

              <div className="row end mt12">

                <span className="tag n">
                  {
                    filteredEntries.length
                  }{" "}
                  प्रविष्टियाँ
                </span>

                <div className="row">

                  <button
                    className="btn b2 sm"
                    onClick={() =>
                      printRegister()
                    }
                  >
                    🖨 छापें (A4)
                  </button>

                  <button
                    className="btn b2 sm"
                    onClick={() =>
                      downloadCsv(
                        "वितरण-रजिस्टर",
                        [
                          "क्र0",
                          "दिनांक",
                          "केन्द्र",
                          "किस्म",
                          "कृषक का नाम",
                          "पिता/पति",
                          "ग्राम",
                          "मोबाइल",
                          "क्षे0फ0(है0)",
                          "मद1 मात्रा",
                          "मद1 राशि",
                          "बीज ग्राम",
                          "बीज राशि",
                          "मद3 मात्रा",
                          "मद3 राशि",
                          "मद4 मात्रा",
                          "मद4 राशि",
                          "कुल लागत",
                          "राजसहायता",
                          "कृषक अंश",
                          "कृषक हस्ताक्षर",
                          "वितरक हस्ताक्षर",
                          "टिप्पणी"
                        ],

                        filteredEntries.map(
                          (e, i) => [
                            i + 1,
                            dmy(e.date),
                            e.centre,
                            e.variety,
                            e.name,
                            e.father,
                            e.village,
                            e.mobile,
                            e.area,
                            e.i1.qty,
                            e.i1.amt,
                            e.seed_gm,
                            e.i2.amt,
                            e.i3.qty,
                            e.i3.amt,
                            e.i4.qty,
                            e.i4.amt,
                            e.total,
                            e.subsidy,
                            e.farmer,
                            e.sign1,
                            e.sign2,
                            e.note
                          ]
                        )
                      )
                    }
                  >
                    ⬇ CSV
                  </button>

                </div>

              </div>

            </div>

            <div className="card table-card">

              {filteredEntries.length ? (
                <div className="tw">

                  <table>

                    <thead>

                      <tr>

                        <th>क्र0</th>
                        <th>दिनांक</th>
                        <th>केन्द्र</th>
                        <th>किस्म</th>
                        <th>कृषक का नाम</th>
                        <th>ग्राम</th>
                        <th>क्षे0फ0</th>
                        <th>मद1 मात्रा/राशि</th>
                        <th>बीज ग्राम/राशि</th>
                        <th>मद3 मात्रा/राशि</th>
                        <th>मद4 मात्रा/राशि</th>
                        <th>कुल</th>
                        <th>राजसहायता</th>
                        <th>कृषक अंश</th>
                        <th>हस्ताक्षर</th>
                        <th>क्रिया</th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredEntries.map(
                        (e, i) => (
                          <tr key={e.id}>

                            <td>
                              {i + 1}
                            </td>

                            <td>
                              {dmy(
                                e.date
                              )}
                            </td>

                            <td>
                              {e.centre}
                            </td>

                            <td>
                              {e.variety}
                            </td>

                            <td>
                              {e.name}
                            </td>

                            <td>
                              {e.village}
                            </td>

                            <td>
                              {num(
                                e.area,
                                3
                              )}
                            </td>

                            <td>
                              {num(
                                e.i1.qty,
                                2
                              )}{" "}
                              /{" "}
                              {money(
                                e.i1.amt
                              )}
                            </td>

                            <td>
                              {gm(
                                e.seed_gm
                              )}{" "}
                              /{" "}
                              {money(
                                e.i2.amt
                              )}
                            </td>

                            <td>
                              {num(
                                e.i3.qty,
                                2
                              )}{" "}
                              /{" "}
                              {money(
                                e.i3.amt
                              )}
                            </td>

                            <td>
                              {num(
                                e.i4.qty,
                                2
                              )}{" "}
                              /{" "}
                              {money(
                                e.i4.amt
                              )}
                            </td>

                            <td>
                              {money(
                                e.total
                              )}
                            </td>

                            <td>
                              {money(
                                e.subsidy
                              )}
                            </td>

                            <td>
                              {money(
                                e.farmer
                              )}
                            </td>

                            <td>
                              {e.sign1 ===
                                "हाँ" &&
                              e.sign2 ===
                                "हाँ" ? (
                                <span className="tag ok">
                                  पूर्ण
                                </span>
                              ) : (
                                <span className="tag bad">
                                  अपूर्ण
                                </span>
                              )}
                            </td>

                            <td>

                              <button
                                className="btn b3 sm"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `क्या "${e.name}" की प्रविष्टि हटानी है?`
                                    )
                                  ) {
                                    setEntries(
                                      (prev) =>
                                        prev.filter(
                                          (x) =>
                                            x.id !==
                                            e.id
                                        )
                                    );
                                  }
                                }}
                              >
                                हटाएँ
                              </button>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              ) : (
                <div className="empty">
                  अभी कोई प्रविष्टि
                  नहीं। ऊपर फ़ॉर्म से
                  पहला वितरण दर्ज करें।
                </div>
              )}

            </div>

          </section>
        )}

        {/* STOCK */}

        {tab === "stock" && (
          <section className="panel on">

            <h2>
              बीज स्टॉक
            </h2>

            <p className="sub">
              खरीद → केन्द्रों को
              आवंटन → केन्द्र का
              शेष। तीनों एक ही
              जगह; नीचे बटन से भाग
              बदलें।
            </p>

            <div className="seg">

              {[
                [
                  "ledger",
                  "केन्द्रवार शेष"
                ],
                [
                  "allot",
                  "केन्द्र आवंटन"
                ],
                [
                  "purchase",
                  "बीज क्रय"
                ]
              ].map(
                ([id, l]) => (
                  <button
                    key={id}
                    className={
                      stockTab === id
                        ? "on"
                        : ""
                    }
                    onClick={() =>
                      setStockTab(id)
                    }
                  >
                    {l}
                  </button>
                )
              )}

            </div>

            {/* LEDGER */}

            {stockTab ===
              "ledger" && (
              <>
                <div className="card noprint">

                  <div className="row end">

                    <input
                      value={
                        stockSearch
                      }
                      onChange={(e) =>
                        setStockSearch(
                          e.target
                            .value
                        )
                      }
                      placeholder="केन्द्र या किस्म खोजें..."
                      className="short-input"
                    />

                    <span className="tag n">
                      {
                        ledgerRows.length
                      }{" "}
                      संयोजन
                    </span>

                  </div>

                </div>

                <div className="card table-card">

                  <div className="tw">

                    <table>

                      <thead>

                        <tr>

                          <th>क्र0</th>
                          <th>केन्द्र</th>
                          <th>किस्म</th>
                          <th>प्राप्त (ग्राम)</th>
                          <th>वितरित (ग्राम)</th>
                          <th>शेष (ग्राम)</th>
                          <th>स्थिति</th>
                          <th>किसान</th>

                        </tr>

                      </thead>

                      <tbody>

                        {ledgerRows.map(
                          (r, i) => (
                            <tr
                              key={`${r.centre}-${r.variety}`}
                            >

                              <td>
                                {i + 1}
                              </td>

                              <td>
                                {r.centre}
                              </td>

                              <td>
                                {r.variety}
                              </td>

                              <td>
                                {num(
                                  r.opening,
                                  0
                                )}
                              </td>

                              <td>
                                {gm(
                                  r.issued
                                )}
                              </td>

                              <td
                                className={
                                  r.balance <
                                  0
                                    ? "neg"
                                    : ""
                                }
                              >
                                {gm(
                                  r.balance
                                )}
                              </td>

                              <td>

                                {r.balance <
                                0 ? (
                                  <span className="tag bad">
                                    अधिक-वितरण
                                  </span>
                                ) : r.balance ===
                                  0 ? (
                                  <span className="tag n">
                                    समाप्त
                                  </span>
                                ) : (
                                  <span className="tag ok">
                                    सामान्य
                                  </span>
                                )}

                              </td>

                              <td>
                                {
                                  r.farmers
                                }
                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>
              </>
            )}

            {/* ALLOCATION */}

            {stockTab ===
              "allot" && (
              <>

                <div className="card noprint">

                  <h3>
                    नया आवंटन
                    (केन्द्रीय स्टॉक से)
                  </h3>

                  <div className="grid g4">

                    <Field label="दिनांक *">
                      <input
                        type="date"
                        className="need"
                        value={
                          allotForm.date
                        }
                        onChange={(e) =>
                          setAllotForm(
                            (p) => ({
                              ...p,
                              date:
                                e.target
                                  .value
                            })
                          )
                        }
                      />
                    </Field>

                    <Field label="केन्द्र *">
                      <select
                        className="need"
                        value={
                          allotForm.centre
                        }
                        onChange={(e) =>
                          setAllotForm(
                            (p) => ({
                              ...p,
                              centre:
                                e.target
                                  .value
                            })
                          )
                        }
                      >
                        <option value="">
                          — केन्द्र चुनें —
                        </option>

                        {CENTRES.map(
                          (c) => (
                            <option
                              key={c}
                            >
                              {c}
                            </option>
                          )
                        )}
                      </select>
                    </Field>

                    <Field label="किस्म *">
                      <select
                        className="need"
                        value={
                          allotForm.variety
                        }
                        onChange={(e) =>
                          setAllotForm(
                            (p) => ({
                              ...p,
                              variety:
                                e.target
                                  .value
                            })
                          )
                        }
                      >
                        <option value="">
                          — किस्म चुनें —
                        </option>

                        {NAMES.map(
                          (v) => (
                            <option
                              key={v}
                            >
                              {v}
                            </option>
                          )
                        )}
                      </select>
                    </Field>

                    <Field label="मात्रा (ग्राम) *">
                      <input
                        type="number"
                        className="need"
                        step="0.001"
                        min="0.001"
                        value={
                          allotForm.qty
                        }
                        onChange={(e) =>
                          setAllotForm(
                            (p) => ({
                              ...p,
                              qty:
                                e.target
                                  .value
                            })
                          )
                        }
                      />
                    </Field>

                  </div>

                  <div className="grid g3 mt10">

                    <Field label="क्षेत्रफल — स्वतः (है0)">
                      <input
                        readOnly
                        value={
                          allotCalc
                            ? `${num(
                                allotCalc.area,
                                4
                              )} है0`
                            : ""
                        }
                      />
                    </Field>

                    <Field label="परियोजना लागत — स्वतः (₹)">
                      <input
                        readOnly
                        value={
                          allotCalc
                            ? money(
                                allotCalc.project
                              )
                            : ""
                        }
                      />
                    </Field>

                    <Field label="स्रोत/देयक सं0">
                      <input
                        value={
                          allotForm.source
                        }
                        onChange={(e) =>
                          setAllotForm(
                            (p) => ({
                              ...p,
                              source:
                                e.target
                                  .value
                            })
                          )
                        }
                        placeholder="आवंटन पत्र सं0..."
                      />
                    </Field>

                  </div>

                  {allotCalc && (
                    <div
                      className={`note ${
                        allotCalc.gmv >
                        centralLeft(
                          allotCalc.variety
                        ) +
                          0.01
                          ? "bad"
                          : "ok"
                      } mt12`}
                    >
                      {allotCalc.gmv >
                      centralLeft(
                        allotCalc.variety
                      ) +
                        0.01
                        ? `केन्द्रीय स्टॉक कम — ${allotCalc.variety} का शेष केवल ${gm(
                            centralLeft(
                              allotCalc.variety
                            )
                          )} ग्राम है।`
                        : `ठीक है — क्षेत्रफल ${num(
                            allotCalc.area,
                            4
                          )} है0, लागत ${money(
                            allotCalc.project
                          )} (राजसहायता ${money(
                            allotCalc.subsidy
                          )} + कृषक अंश ${money(
                            allotCalc.farmer
                          )})। इसके बाद केन्द्रीय शेष ${gm(
                            centralLeft(
                              allotCalc.variety
                            ) -
                              allotCalc.gmv
                          )} ग्राम।`}
                    </div>
                  )}

                  <button
                    className="btn b1 mt12"
                    onClick={
                      addAllot
                    }
                  >
                    आवंटन जोड़ें
                  </button>

                </div>

                <div className="card table-card">

                  <div className="tw">

                    <table>

                      <thead>

                        <tr>
                          <th>क्र0</th>
                          <th>दिनांक</th>
                          <th>केन्द्र</th>
                          <th>किस्म</th>
                          <th>मात्रा (ग्राम)</th>
                          <th>क्षे0फ0</th>
                          <th>परियोजना लागत</th>
                          <th>राजसहायता</th>
                          <th>कृषक अंश</th>
                          <th>स्रोत</th>
                        </tr>

                      </thead>

                      <tbody>

                        {receipts.map(
                          (r, i) => {
                            const a =
                              r.area !=
                              null
                                ? r.area
                                : r.qty /
                                  gmha(
                                    r.variety
                                  );

                            return (
                              <tr
                                key={
                                  r.id
                                }
                              >

                                <td>
                                  {i + 1}
                                </td>

                                <td>
                                  {dmy(
                                    r.date
                                  )}
                                </td>

                                <td>
                                  {
                                    r.centre
                                  }
                                </td>

                                <td>
                                  {
                                    r.variety
                                  }
                                </td>

                                <td>
                                  {gm(
                                    r.qty
                                  )}
                                </td>

                                <td>
                                  {num(
                                    a,
                                    4
                                  )}
                                </td>

                                <td>
                                  {money(
                                    a *
                                      master.projectCost
                                  )}
                                </td>

                                <td>
                                  {money(
                                    a *
                                      master.maxSubsidy
                                  )}
                                </td>

                                <td>
                                  {money(
                                    a *
                                      master.farmerShare
                                  )}
                                </td>

                                <td>
                                  {
                                    r.source
                                  }
                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

              </>
            )}

            {/* PURCHASE */}

            {stockTab ===
              "purchase" && (
              <>

                <div className="card noprint">

                  <h3>
                    नई क्रय प्रविष्टि
                  </h3>

                  <div className="grid g4">

                    <Field label="दिनांक *">
                      <input
                        type="date"
                        className="need"
                        value={
                          purchaseForm.date
                        }
                        onChange={(e) =>
                          setPurchaseForm(
                            (p) => ({
                              ...p,
                              date:
                                e.target
                                  .value
                            })
                          )
                        }
                      />
                    </Field>

                    <Field label="किस्म *">
                      <select
                        className="need"
                        value={
                          purchaseForm.variety
                        }
                        onChange={(e) =>
                          setPurchaseForm(
                            (p) => ({
                              ...p,
                              variety:
                                e.target
                                  .value
                            })
                          )
                        }
                      >
                        <option value="">
                          — किस्म चुनें —
                        </option>

                        {NAMES.map(
                          (v) => (
                            <option
                              key={v}
                            >
                              {v}
                            </option>
                          )
                        )}
                      </select>
                    </Field>

                    <Field label="मात्रा (किग्रा0) *">
                      <input
                        type="number"
                        className="need"
                        step="0.001"
                        min="0.001"
                        value={
                          purchaseForm.qty
                        }
                        onChange={(e) =>
                          setPurchaseForm(
                            (p) => ({
                              ...p,
                              qty:
                                e.target
                                  .value
                            })
                          )
                        }
                      />
                    </Field>

                    <Field label="दर (₹/किग्रा0) *">
                      <input
                        type="number"
                        className="need"
                        step="0.01"
                        min="0.01"
                        value={
                          purchaseForm.rate
                        }
                        onChange={(e) =>
                          setPurchaseForm(
                            (p) => ({
                              ...p,
                              rate:
                                e.target
                                  .value
                            })
                          )
                        }
                      />
                    </Field>

                  </div>

                  <div className="grid g3 mt10">

                    <Field label="कुल राशि — स्वतः (₹)">
                      <input
                        readOnly
                        value={
                          purchaseCalc
                            ? money(
                                purchaseCalc.total
                              )
                            : ""
                        }
                      />
                    </Field>

                    <Field label="आपूर्तिकर्ता">
                      <input
                        value={
                          purchaseForm.supplier
                        }
                        onChange={(e) =>
                          setPurchaseForm(
                            (p) => ({
                              ...p,
                              supplier:
                                e.target
                                  .value
                            })
                          )
                        }
                      />
                    </Field>

                    <Field label="देयक सं0">
                      <input
                        value={
                          purchaseForm.ref
                        }
                        onChange={(e) =>
                          setPurchaseForm(
                            (p) => ({
                              ...p,
                              ref:
                                e.target
                                  .value
                            })
                          )
                        }
                      />
                    </Field>

                  </div>

                  {purchaseCalc && (
                    <div
                      className={`note ${
                        purchaseCalc.total >
                        purchaseCalc.left +
                          0.01
                          ? "bad"
                          : "ok"
                      } mt12`}
                    >
                      {purchaseCalc.total >
                      purchaseCalc.left +
                        0.01
                        ? `सीमा पार — ${purchaseForm.variety} की शेष क्रय क्षमता केवल ${money(
                            purchaseCalc.left
                          )} है।`
                        : `ठीक है — इसके बाद ${purchaseForm.variety} की कुल खरीद ${money(
                            purchaseCalc.after
                          )} होगी, शेष क्षमता ${money(
                            purchaseCalc.remaining
                          )}।`}
                    </div>
                  )}

                  <button
                    className="btn b1 mt12"
                    onClick={
                      addPurchase
                    }
                  >
                    क्रय जोड़ें
                  </button>

                </div>

                <div className="card table-card">

                  <div className="tw">

                    <table>

                      <thead>

                        <tr>
                          <th>क्र0</th>
                          <th>दिनांक</th>
                          <th>किस्म</th>
                          <th>आपूर्तिकर्ता</th>
                          <th>मात्रा</th>
                          <th>दर</th>
                          <th>कुल राशि</th>
                          <th>शेष क्रय क्षमता</th>
                          <th>देयक सं0</th>
                        </tr>

                      </thead>

                      <tbody>

                        {purchases.map(
                          (p, i) => (
                            <tr
                              key={
                                p.id
                              }
                            >

                              <td>
                                {i + 1}
                              </td>

                              <td>
                                {dmy(
                                  p.date
                                )}
                              </td>

                              <td>
                                {
                                  p.variety
                                }
                              </td>

                              <td>
                                {
                                  p.supplier
                                }
                              </td>

                              <td>
                                {num(
                                  p.qty,
                                  3
                                )}{" "}
                                किग्रा0
                              </td>

                              <td>
                                {money(
                                  p.rate
                                )}
                              </td>

                              <td>
                                {money(
                                  p.amount
                                )}
                              </td>

                              <td>
                                {money(
                                  remPower(
                                    p.variety
                                  )
                                )}
                              </td>

                              <td>
                                {p.ref}
                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                </div>

              </>
            )}

          </section>
        )}

        {/* MANAK */}

        {tab === "manak" && (
          <section className="panel on">

            <h2>
              मानक एवं मूल सेटिंग्स
            </h2>

            <p className="sub">
              एक बार जाँच लें, फिर
              छूने की ज़रूरत नहीं। यहाँ
              किया बदलाव केवल{" "}
              <b>
                आगे
              </b>{" "}
              जोड़ी जाने वाली
              प्रविष्टियों पर लागू होगा
              — पुरानी प्रविष्टियाँ अपने
              समय का मानक सुरक्षित
              रखती हैं।
            </p>

            <div className="card">

              <h3>
                चार मूल मूल्य
              </h3>

              <div className="grid g4">

                <Field label="क्रय सीमा प्रति किस्म (₹)">
                  <input
                    type="number"
                    value={
                      masterDraft.purchaseLimit
                    }
                    onChange={(e) =>
                      setMasterDraft(
                        {
                          ...masterDraft,
                          purchaseLimit:
                            +e.target
                              .value
                        }
                      )
                    }
                  />
                </Field>

                <Field label="परियोजना लागत (₹/है0)">
                  <input
                    type="number"
                    value={
                      masterDraft.projectCost
                    }
                    onChange={(e) =>
                      setMasterDraft(
                        {
                          ...masterDraft,
                          projectCost:
                            +e.target
                              .value
                        }
                      )
                    }
                  />
                </Field>

                <Field label="अधिकतम राजसहायता (₹/है0)">
                  <input
                    type="number"
                    value={
                      masterDraft.maxSubsidy
                    }
                    onChange={(e) =>
                      setMasterDraft(
                        {
                          ...masterDraft,
                          maxSubsidy:
                            +e.target
                              .value
                        }
                      )
                    }
                  />
                </Field>

                <Field label="कृषक अंश (₹/है0)">
                  <input
                    type="number"
                    value={
                      masterDraft.farmerShare
                    }
                    onChange={(e) =>
                      setMasterDraft(
                        {
                          ...masterDraft,
                          farmerShare:
                            +e.target
                              .value
                        }
                      )
                    }
                  />
                </Field>

              </div>

              <div
                className={`note ${
                  Math.abs(
                    masterDraft.maxSubsidy +
                      masterDraft.farmerShare -
                      masterDraft.projectCost
                  ) < 0.5
                    ? "ok"
                    : "bad"
                } mt12`}
              >
                {Math.abs(
                  masterDraft.maxSubsidy +
                    masterDraft.farmerShare -
                    masterDraft.projectCost
                ) < 0.5
                  ? `जाँच सही — राजसहायता ${money(
                      masterDraft.maxSubsidy
                    )} + कृषक अंश ${money(
                      masterDraft.farmerShare
                    )} = परियोजना लागत ${money(
                      masterDraft.projectCost
                    )} ✔`
                  : `मेल नहीं — ${money(
                      masterDraft.maxSubsidy
                    )} + ${money(
                      masterDraft.farmerShare
                    )} = ${money(
                      masterDraft.maxSubsidy +
                        masterDraft.farmerShare
                    )}, जबकि परियोजना लागत ${money(
                      masterDraft.projectCost
                    )} है ✘`}
              </div>

              <div className="row mt12">

                <button
                  className="btn b1"
                  onClick={() => {
                    setMaster(
                      masterDraft
                    );

                    setMessage(
                      "✓ सुरक्षित।"
                    );
                  }}
                >
                  सुरक्षित करें
                </button>

                <button
                  className="btn b2"
                  onClick={() => {
                    const d =
                      defMaster();

                    setMasterDraft(
                      d
                    );

                    setMaster(d);
                  }}
                >
                  मूल मूल्यों पर
                  लौटाएँ
                </button>

              </div>

            </div>

            <div className="card">

              <h3>
                किस्मवार मानक
              </h3>

              <p className="sub">
                जिस किस्म को खोलना हो
                उस पर टैप करें। मात्रा या
                दर बदलते ही राशि और जाँच
                अपने आप बदल जाएगी।
              </p>

              {NAMES.map((v) => {
                const c =
                  manak[v];

                const t =
                  totals(c);

                const okT =
                  Math.abs(
                    t.total -
                      master.projectCost
                  ) < 0.5;

                const okS =
                  Math.abs(
                    t.subsidy -
                      master.maxSubsidy
                  ) < 0.5;

                return (
                  <details
                    key={v}
                    open={
                      !!expanded[v]
                    }
                    onToggle={(e) =>
                      setExpanded(
                        (p) => ({
                          ...p,
                          [v]:
                            e.currentTarget
                              .open
                        })
                      )
                    }
                  >

                    <summary>

                      {v}

                      <span
                        className={`tag ${
                          okT && okS
                            ? "ok"
                            : "bad"
                        }`}
                      >
                        {okT && okS
                          ? "✔ मानक सही"
                          : "✘ जाँचें"}
                      </span>

                      <span className="tag n">
                        {gm(
                          t.gmha
                        )}{" "}
                        ग्राम/है0
                      </span>

                      <span className="tag n">
                        {money(
                          t.total
                        )}
                        /है0
                      </span>

                    </summary>

                    <div className="dbody">

                      <div className="tw">

                        <table>

                          <thead>

                            <tr>
                              <th>मद</th>
                              <th>इकाई</th>
                              <th>मात्रा</th>
                              <th>दर (₹)</th>
                              <th>राशि (₹)</th>
                            </tr>

                          </thead>

                          <tbody>

                            {[
                              "item1",
                              "item2",
                              "item3",
                              "item4"
                            ].map(
                              (k) => (
                                <tr
                                  key={k}
                                >

                                  <td className="l">
                                    {
                                      c[k]
                                        .label
                                    }
                                  </td>

                                  <td>
                                    {
                                      c[k]
                                        .unit
                                    }
                                  </td>

                                  <td>
                                    <input
                                      type="number"
                                      step="0.0001"
                                      value={
                                        c[k]
                                          .qty
                                      }
                                      onChange={(e) =>
                                        updateManak(
                                          v,
                                          k,
                                          "qty",
                                          e
                                            .target
                                            .value
                                        )
                                      }
                                    />
                                  </td>

                                  <td>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={
                                        c[k]
                                          .rate
                                      }
                                      onChange={(e) =>
                                        updateManak(
                                          v,
                                          k,
                                          "rate",
                                          e
                                            .target
                                            .value
                                        )
                                      }
                                    />
                                  </td>

                                  <td>
                                    {money(
                                      amount(
                                        c[k]
                                      )
                                    )}
                                  </td>

                                </tr>
                              )
                            )}

                          </tbody>

                          <tfoot>

                            <tr>

                              <td colSpan="4">
                                कुल
                              </td>

                              <td>
                                {money(
                                  t.total
                                )}
                              </td>

                            </tr>

                          </tfoot>

                        </table>

                      </div>

                      <div
                        className={`note ${
                          okT && okS
                            ? "ok"
                            : "bad"
                        } mt10`}
                      >
                        राजसहायता{" "}
                        {money(
                          t.subsidy
                        )}{" "}
                        + कृषक अंश{" "}
                        {money(
                          t.farmer
                        )}{" "}
                        ={" "}
                        {money(
                          t.total
                        )}{" "}
                        {okT && okS
                          ? "— मानक सही ✔"
                          : "— मानक से भिन्न ✘"}
                      </div>

                    </div>

                  </details>
                );
              })}

              <button
                className="btn b2 sm mt10"
                onClick={() =>
                  setManak(
                    defManak()
                  )
                }
              >
                सभी मानक मूल स्थिति
                पर लौटाएँ
              </button>

            </div>

          </section>
        )}

        {/* REPORT */}

        {tab === "report" && (
          <section className="panel on">

            <h2>
              रिपोर्ट, छपाई एवं ऑडिट
            </h2>

            <p className="sub">
              किस्मवार पूरी तस्वीर और
              सत्यापन सूची। छपी प्रति पर
              हस्ताक्षर करवाकर फाइल में
              रखना ही भौतिक साक्ष्य है।
            </p>

            <div className="card noprint">

              <div className="row">

                <button
                  className="btn b2 sm"
                  onClick={() =>
                    printRegister(
                      entries,
                      "किसान बीज वितरण रजिस्टर — समस्त केन्द्र"
                    )
                  }
                >
                  🖨 पूरा रजिस्टर छापें
                </button>

                <button
                  className="btn b2 sm"
                  onClick={() =>
                    printHtml(
                      `
                      <h2>
                        किस्मवार सारांश
                      </h2>

                      <p class="pm">
                        छपाई दिनांक
                        ${dmy(
                          today()
                        )}
                      </p>

                      ${
                        document.querySelector(
                          ".report-table"
                        )?.outerHTML ||
                        ""
                      }
                      `
                    )
                  }
                >
                  🖨 किस्मवार सारांश
                  छापें
                </button>

                <button
                  className="btn b2 sm"
                  onClick={() =>
                    downloadCsv(
                      "वितरण-रजिस्टर-पूर्ण",
                      [
                        "क्र0",
                        "दिनांक",
                        "केन्द्र",
                        "किस्म",
                        "कृषक का नाम",
                        "पिता/पति",
                        "ग्राम",
                        "मोबाइल",
                        "क्षे0फ0(है0)",
                        "मद1 मात्रा",
                        "मद1 राशि",
                        "बीज ग्राम",
                        "बीज राशि",
                        "मद3 मात्रा",
                        "मद3 राशि",
                        "मद4 मात्रा",
                        "मद4 राशि",
                        "कुल लागत",
                        "राजसहायता",
                        "कृषक अंश",
                        "कृषक हस्ताक्षर",
                        "वितरक हस्ताक्षर",
                        "टिप्पणी"
                      ],

                      entries.map(
                        (e, i) => [
                          i + 1,
                          dmy(e.date),
                          e.centre,
                          e.variety,
                          e.name,
                          e.father,
                          e.village,
                          e.mobile,
                          e.area,
                          e.i1.qty,
                          e.i1.amt,
                          e.seed_gm,
                          e.i2.amt,
                          e.i3.qty,
                          e.i3.amt,
                          e.i4.qty,
                          e.i4.amt,
                          e.total,
                          e.subsidy,
                          e.farmer,
                          e.sign1,
                          e.sign2,
                          e.note
                        ]
                      )
                    )
                  }
                >
                  ⬇ पूरा रजिस्टर
                  CSV
                </button>

              </div>

            </div>

            <div className="card table-card report-table">

              <div className="tw">

                <table>

                  <thead>

                    <tr>
                      <th>किस्म</th>
                      <th>कुल क्रय (₹)</th>
                      <th>शेष क्रय क्षमता (₹)</th>
                      <th>क्रय मात्रा (ग्राम)</th>
                      <th>केन्द्रों को आवंटित</th>
                      <th>केन्द्रीय शेष</th>
                      <th>किसानों को वितरित</th>
                      <th>क्षेत्रफल (है0)</th>
                      <th>परियोजना लागत (₹)</th>
                      <th>किसान</th>
                    </tr>

                  </thead>

                  <tbody>

                    {reportRows.map(
                      (r) => (
                        <tr
                          key={r.v}
                        >

                          <td>
                            {r.v}
                          </td>

                          <td>
                            {money(
                              r.pa
                            )}
                          </td>

                          <td
                            className={
                              r.rp <=
                              0.5
                                ? "neg"
                                : ""
                            }
                          >
                            {money(
                              r.rp
                            )}
                          </td>

                          <td>
                            {gm(
                              r.pkg
                            )}
                          </td>

                          <td>
                            {gm(
                              r.ag
                            )}
                          </td>

                          <td
                            className={
                              r.cl < 0
                                ? "neg"
                                : ""
                            }
                          >
                            {gm(
                              r.cl
                            )}
                          </td>

                          <td>
                            {gm(
                              r.dist
                            )}
                          </td>

                          <td>
                            {num(
                              r.area,
                              4
                            )}
                          </td>

                          <td>
                            {money(
                              r.proj
                            )}
                          </td>

                          <td>
                            {r.count}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                  <tfoot>

                    <tr>

                      <td>
                        कुल योग
                      </td>

                      <td>
                        {money(
                          reportRows.reduce(
                            (s, r) =>
                              s + r.pa,
                            0
                          )
                        )}
                      </td>

                      <td>
                        {money(
                          reportRows.reduce(
                            (s, r) =>
                              s + r.rp,
                            0
                          )
                        )}
                      </td>

                      <td></td>

                      <td>
                        {gm(
                          reportRows.reduce(
                            (s, r) =>
                              s + r.ag,
                            0
                          )
                        )}
                      </td>

                      <td>
                        {gm(
                          reportRows.reduce(
                            (s, r) =>
                              s + r.cl,
                            0
                          )
                        )}
                      </td>

                      <td>
                        {gm(
                          distributed
                        )}
                      </td>

                      <td>
                        {num(
                          reportRows.reduce(
                            (s, r) =>
                              s + r.area,
                            0
                          ),
                          4
                        )}
                      </td>

                      <td>
                        {money(
                          reportRows.reduce(
                            (s, r) =>
                              s + r.proj,
                            0
                          )
                        )}
                      </td>

                      <td>
                        {
                          entries.length
                        }
                      </td>

                    </tr>

                  </tfoot>

                </table>

              </div>

            </div>

            <div className="card">

              <h3>
                ऑडिट जाँच सूची
              </h3>

              <ul className="chk">

                {auditChecks.map(
                  (c, i) => (
                    <li key={i}>

                      <span
                        className={`i ${
                          c.ok
                            ? "ok"
                            : "bad"
                        }`}
                      >
                        {c.ok
                          ? "✔"
                          : "✘"}
                      </span>

                      <span>
                        {c.t}
                      </span>

                    </li>
                  )
                )}

              </ul>

            </div>

          </section>
        )}

      </main>

      <footer>
        किसान बीज वितरण — सरल प्रणाली ·
        जिला कार्ययोजना 2026-27 ·
        उद्यान विशेषज्ञ कार्यालय,
        कोटद्वार गढ़वाल
        <br />
        डेटा इसी ब्राउज़र में सुरक्षित
        रहता है — नियमित CSV निर्यात
        व छपी प्रति अवश्य रखें।
      </footer>

    </div>
  );
}


/* =========================================================
   REUSABLE COMPONENTS
   ========================================================= */

function Field({
  label,
  children
}) {
  return (
    <div>
      <label>
        {label}
      </label>

      {children}
    </div>
  );
}


function Kpi({
  label,
  value,
  sub,
  state = ""
}) {
  return (
    <div
      className={`kpi ${state}`}
    >
      <div className="l">
        {label}
      </div>

      <div className="v">
        {value}
      </div>

      <div className="s">
        {sub}
      </div>
    </div>
  );
}


function EntryPreview({
  calc,
  centre,
  opening,
  issued
}) {
  if (!calc) {
    return (
      <div className="note mt12">
        क्षेत्रफल भरते ही यहाँ
        पूरी गणना और केन्द्र का
        शेष स्टॉक दिखेगा।
      </div>
    );
  }

  const left =
    centre
      ? opening(
          centre,
          calc.variety
        ) -
        issued(
          centre,
          calc.variety
        ) -
        calc.seed_gm
      : 0;

  const bad = left < 0;

  return (
    <div
      className={`note ${
        bad
          ? "bad"
          : "ok"
      } mt12`}
    >
      बीज{" "}
      <b>
        {gm(
          calc.seed_gm
        )}{" "}
        ग्राम
      </b>{" "}
      · कुल लागत{" "}
      <b>
        {money(
          calc.total
        )}
      </b>{" "}
      (राजसहायता{" "}
      {money(
        calc.subsidy
      )}{" "}
      + कृषक अंश{" "}
      {money(
        calc.farmer
      )}
      )
      <br />

      मद-1{" "}
      {num(
        calc.i1.qty,
        2
      )}{" "}
      /{" "}
      {money(
        calc.i1.amt
      )}{" "}

      · मद-2{" "}
      {gm(
        calc.seed_gm
      )}{" "}
      ग्राम /{" "}
      {money(
        calc.i2.amt
      )}{" "}

      · मद-3{" "}
      {num(
        calc.i3.qty,
        2
      )}{" "}
      /{" "}
      {money(
        calc.i3.amt
      )}{" "}

      · मद-4{" "}
      {num(
        calc.i4.qty,
        2
      )}{" "}
      /{" "}
      {money(
        calc.i4.amt
      )}

      {centre && (
        <>
          <br />

          <b>
            {bad
              ? `चेतावनी — इसके बाद ${centre} में बैलेंस ऋणात्मक (${gm(
                  left
                )} ग्राम) हो जाएगा।`
              : `${centre} में इसके बाद शेष रहेगा: ${gm(
                  left
                )} ग्राम`}
          </b>
        </>
      )}
    </div>
  );
}