import React, { useEffect, useMemo, useState } from "react";
import "./KishanBeej.css";

const API = "/api/kishan-beej";

const today = () =>
  new Date().toISOString().slice(0, 10);

const money = (x) =>
  "₹" +
  Number(x || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const n = (x, d = 2) =>
  Number(x || 0).toLocaleString("en-IN", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const gm = (x) => n(x, 2);

const dmy = (s) =>
  s
    ? String(s).split("-").reverse().join("-")
    : "";

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp(
      "(^|; )" +
        name.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        ) +
        "=([^;]*)"
    )
  );

  return match
    ? decodeURIComponent(match[1])
    : "";
}

async function jsonResponse(response) {
  const text = await response.text();

  let data = {};

  try {
    data = text
      ? JSON.parse(text)
      : {};
  } catch {
    throw new Error(
      `Server ने JSON के बजाय HTML/अन्य response दिया (${response.status}).`
    );
  }

  if (!response.ok) {
    let message =
      data?.detail ||
      data?.error ||
      "";

    if (!message) {
      message = Object.values(data || {})
        .flat()
        .join(" ");
    }

    throw new Error(
      message ||
        `Request failed (${response.status})`
    );
  }

  return data;
}

async function apiFetch(
  path,
  options = {}
) {
  const method = (
    options.method || "GET"
  ).toUpperCase();

  const headers = {
    ...(options.headers || {}),
  };

  if (
    options.body &&
    !headers["Content-Type"]
  ) {
    headers["Content-Type"] =
      "application/json";
  }

  if (
    !["GET", "HEAD", "OPTIONS"].includes(
      method
    )
  ) {
    const csrf =
      getCookie("csrftoken");

    if (csrf) {
      headers["X-CSRFToken"] =
        csrf;
    }
  }

  const response = await fetch(
    `${API}${path}`,
    {
      ...options,
      method,
      headers,
      credentials: "include",
    }
  );

  return jsonResponse(response);
}

const emptyForm = () => ({
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
  note: "",
});

const emptyAllot = () => ({
  date: today(),
  centre: "",
  variety: "",
  qty: "",
  source: "",
});

const emptyPurchase = () => ({
  date: today(),
  variety: "",
  qty: "",
  rate: "",
  supplier: "",
  ref: "",
});

function standardObject(s) {
  return {
    ...s,

    item1: {
      label: s.item1_label,
      unit: s.item1_unit,
      qty: Number(s.item1_qty),
      rate: Number(s.item1_rate),
    },

    item2: {
      label: s.item2_label,
      unit: s.item2_unit,
      qty: Number(s.item2_qty),
      rate: Number(s.item2_rate),
    },

    item3: {
      label: s.item3_label,
      unit: s.item3_unit,
      qty: Number(s.item3_qty),
      rate: Number(s.item3_rate),
    },

    item4: {
      label: s.item4_label,
      unit: s.item4_unit,
      qty: Number(s.item4_qty),
      rate: Number(s.item4_rate),
    },
  };
}

/*
 * SAME CALCULATION AS ORIGINAL HTML
 *
 * item amount = qty × rate
 *
 * total =
 * item1 + item2 + item3 + item4
 *
 * subsidy = item2
 *
 * farmer = item1 + item3 + item4
 *
 * seed gram/hectare =
 * item2 quantity × 1000
 */
function totals(c) {
  const t1 =
    Number(c.item1?.qty || 0) *
    Number(c.item1?.rate || 0);

  const t2 =
    Number(c.item2?.qty || 0) *
    Number(c.item2?.rate || 0);

  const t3 =
    Number(c.item3?.qty || 0) *
    Number(c.item3?.rate || 0);

  const t4 =
    Number(c.item4?.qty || 0) *
    Number(c.item4?.rate || 0);

  return {
    t1,
    t2,
    t3,
    t4,

    total:
      t1 +
      t2 +
      t3 +
      t4,

    subsidy: t2,

    farmer:
      t1 +
      t3 +
      t4,

    gmha:
      Number(c.item2?.qty || 0) *
      1000,
  };
}

function Field({
  label,
  required = false,
  children,
}) {
  return (
    <div>
      <label>
        {label}{" "}
        {required && (
          <span className="r">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  state = "",
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
  stock,
}) {
  if (!calc) {
    return (
      <div
        className="note"
        style={{
          marginTop: 12,
        }}
      >
        क्षेत्रफल भरते ही यहाँ
        पूरी गणना और केन्द्र का
        शेष स्टॉक दिखेगा।
      </div>
    );
  }

  const left =
    Number(stock || 0) -
    Number(calc.seed_gm || 0);

  return (
    <div
      className={`note ${
        left < 0
          ? "bad"
          : "ok"
      }`}
      style={{
        marginTop: 12,
      }}
    >
      बीज{" "}
      <b>
        {gm(calc.seed_gm)}
        ग्राम
      </b>{" "}
      · कुल लागत{" "}
      <b>
        {money(calc.total)}
      </b>{" "}
      (राजसहायता{" "}
      {money(calc.subsidy)}
      {" "}+ कृषक अंश{" "}
      {money(calc.farmer)}
      )
      <br />

      मद-1{" "}
      {n(calc.i1.qty)}
      {" / "}
      {money(calc.i1.amt)}

      {" · "}

      मद-2{" "}
      {gm(calc.seed_gm)}
      ग्राम /{" "}
      {money(calc.i2.amt)}

      {" · "}

      मद-3{" "}
      {n(calc.i3.qty)}
      {" / "}
      {money(calc.i3.amt)}

      {" · "}

      मद-4{" "}
      {n(calc.i4.qty)}
      {" / "}
      {money(calc.i4.amt)}

      {centre && (
        <>
          <br />

          <b>
            {left < 0
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

export default function KishanBeej() {
  const [tab, setTab] =
    useState("home");

  const [stockTab, setStockTab] =
    useState("ledger");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [data, setData] =
    useState({
      master: null,
      centres: [],
      varieties: [],
      standards: [],
      purchases: [],
      allocations: [],
      entries: [],
    });

  const [form, setForm] =
    useState(emptyForm);

  const [allotForm, setAllotForm] =
    useState(emptyAllot);

  const [
    purchaseForm,
    setPurchaseForm,
  ] = useState(emptyPurchase);

  const [filters, setFilters] =
    useState({
      centre: "",
      variety: "",
      search: "",
    });

  const [stockSearch, setStockSearch] =
    useState("");

  const [allotFilter, setAllotFilter] =
    useState("");

  const [
    masterDraft,
    setMasterDraft,
  ] = useState(null);

  const [
    openStandard,
    setOpenStandard,
  ] = useState({});

  async function load() {
    setLoading(true);
    setError("");

    try {
      const result =
        await apiFetch(
          "/bootstrap/"
        );

      setData(result);
      setMasterDraft(
        result.master
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const centres =
    data.centres || [];

  const varieties =
    data.varieties || [];

  const standards =
    data.standards || [];

  const purchases =
    data.purchases || [];

  const allocations =
    data.allocations || [];

  const entries =
    data.entries || [];

  const master =
    data.master || {
      purchase_limit: 250000,
      project_cost: 60000,
      max_subsidy: 30000,
      farmer_share: 30000,
    };

  const names =
    varieties.map(
      (v) => v.name
    );

  const varietyById =
    Object.fromEntries(
      varieties.map(
        (v) => [
          v.id,
          v,
        ]
      )
    );

  const standardByVariety =
    Object.fromEntries(
      standards.map(
        (s) => [
          s.variety,
          standardObject(s),
        ]
      )
    );

  /*
   * =============================
   * STOCK CALCULATIONS
   * =============================
   */

  const purchAmt = (
    varietyId
  ) =>
    purchases
      .filter(
        (p) =>
          Number(p.variety) ===
          Number(varietyId)
      )
      .reduce(
        (sum, p) =>
          sum +
          Number(
            p.amount || 0
          ),
        0
      );

  const purchGm = (
    varietyId
  ) =>
    purchases
      .filter(
        (p) =>
          Number(p.variety) ===
          Number(varietyId)
      )
      .reduce(
        (sum, p) =>
          sum +
          Number(
            p.qty_kg || 0
          ) *
            1000,
        0
      );

  const allotGm = (
    varietyId
  ) =>
    allocations
      .filter(
        (a) =>
          Number(a.variety) ===
          Number(varietyId)
      )
      .reduce(
        (sum, a) =>
          sum +
          Number(
            a.qty_gm || 0
          ),
        0
      );

  const centralLeft = (
    varietyId
  ) =>
    purchGm(varietyId) -
    allotGm(varietyId);

  const opening = (
    centreId,
    varietyId
  ) =>
    allocations
      .filter(
        (a) =>
          Number(a.centre) ===
            Number(centreId) &&
          Number(a.variety) ===
            Number(varietyId)
      )
      .reduce(
        (sum, a) =>
          sum +
          Number(
            a.qty_gm || 0
          ),
        0
      );

  const issued = (
    centreId,
    varietyId
  ) =>
    entries
      .filter(
        (e) =>
          Number(e.centre) ===
            Number(centreId) &&
          Number(e.variety) ===
            Number(varietyId)
      )
      .reduce(
        (sum, e) =>
          sum +
          Number(
            e.seed_gm || 0
          ),
        0
      );

  const gmha = (
    varietyId
  ) =>
    Number(
      standardByVariety[
        Number(varietyId)
      ]?.item2?.qty || 0
    ) * 1000;

  const centreVarieties = (
    centreId
  ) =>
    names.filter((name) => {
      const v =
        varieties.find(
          (x) =>
            x.name === name
        );

      return (
        v &&
        opening(
          centreId,
          v.id
        ) > 0
      );
    });

  /*
   * =============================
   * DISTRIBUTION LIVE CALCULATION
   * =============================
   */

  const selectedStandard =
    form.variety
      ? standardByVariety[
          Number(form.variety)
        ]
      : null;

  const calcEntry =
    useMemo(() => {
      const area =
        Number(form.area);

      if (
        !selectedStandard ||
        !area ||
        area <= 0
      ) {
        return null;
      }

      const t =
        totals(
          selectedStandard
        );

      return {
        area,

        seed_gm:
          area *
          t.gmha,

        i1: {
          qty:
            area *
            selectedStandard
              .item1.qty,

          amt:
            area *
            t.t1,
        },

        i2: {
          qty:
            area *
            selectedStandard
              .item2.qty,

          amt:
            area *
            t.t2,
        },

        i3: {
          qty:
            area *
            selectedStandard
              .item3.qty,

          amt:
            area *
            t.t3,
        },

        i4: {
          qty:
            area *
            selectedStandard
              .item4.qty,

          amt:
            area *
            t.t4,
        },

        subsidy:
          area *
          t.subsidy,

        farmer:
          area *
          t.farmer,

        total:
          area *
          t.total,
      };
    }, [
      form.area,
      form.variety,
      standards,
    ]);

  /*
   * =============================
   * ALLOCATION CALCULATION
   * =============================
   */

  const allotCalc =
    useMemo(() => {
      const qty =
        Number(
          allotForm.qty
        );

      const standard =
        standardByVariety[
          Number(
            allotForm.variety
          )
        ];

      if (
        !standard ||
        !qty ||
        qty <= 0
      ) {
        return null;
      }

      const area =
        qty /
        (Number(
          standard.item2.qty
        ) * 1000);

      return {
        gmv: qty,

        area,

        project:
          area *
          Number(
            master.project_cost
          ),

        subsidy:
          area *
          Number(
            master.max_subsidy
          ),

        farmer:
          area *
          Number(
            master.farmer_share
          ),
      };
    }, [
      allotForm.qty,
      allotForm.variety,
      standards,
      master,
    ]);

  /*
   * =============================
   * PURCHASE CALCULATION
   * =============================
   */

  const purchaseCalc =
    useMemo(() => {
      const qty =
        Number(
          purchaseForm.qty
        );

      const rate =
        Number(
          purchaseForm.rate
        );

      if (
        !purchaseForm.variety ||
        !qty ||
        !rate
      ) {
        return null;
      }

      const total =
        qty * rate;

      const done =
        purchAmt(
          Number(
            purchaseForm.variety
          )
        );

      const left =
        Number(
          master.purchase_limit
        ) - done;

      return {
        total,
        done,
        left,

        after:
          done + total,

        remaining:
          left - total,
      };
    }, [
      purchaseForm,
      purchases,
      master,
    ]);

  /*
   * =============================
   * LEDGER
   * =============================
   */

  const ledgerRows =
    useMemo(() => {
      const result = [];

      centres.forEach(
        (centre) => {
          varieties.forEach(
            (variety) => {
              const received =
                opening(
                  centre.id,
                  variety.id
                );

              const distributed =
                issued(
                  centre.id,
                  variety.id
                );

              if (
                received ||
                distributed
              ) {
                result.push({
                  centre:
                    centre.name,

                  centreId:
                    centre.id,

                  variety:
                    variety.name,

                  varietyId:
                    variety.id,

                  opening:
                    received,

                  issued:
                    distributed,

                  balance:
                    received -
                    distributed,

                  farmers:
                    entries.filter(
                      (e) =>
                        Number(
                          e.centre
                        ) ===
                          Number(
                            centre.id
                          ) &&
                        Number(
                          e.variety
                        ) ===
                          Number(
                            variety.id
                          )
                    ).length,
                });
              }
            }
          );
        }
      );

      const q =
        stockSearch
          .trim()
          .toLowerCase();

      if (!q) {
        return result;
      }

      return result.filter(
        (r) =>
          `${r.centre}${r.variety}`
            .toLowerCase()
            .includes(q)
      );
    }, [
      centres,
      varieties,
      allocations,
      entries,
      stockSearch,
    ]);

  /*
   * =============================
   * DISTRIBUTION FILTER
   * =============================
   */

  const filteredEntries =
    entries.filter((e) => {
      return (
        (
          !filters.centre ||
          Number(e.centre) ===
            Number(
              filters.centre
            )
        ) &&
        (
          !filters.variety ||
          Number(e.variety) ===
            Number(
              filters.variety
            )
        ) &&
        (
          !filters.search ||
          `${e.name}${e.village || ""}${e.father || ""}`
            .toLowerCase()
            .includes(
              filters.search
                .toLowerCase()
            )
        )
      );
    });

  /*
   * =============================
   * AUDIT
   * =============================
   */

  const auditChecks =
    useMemo(() => {
      const over =
        ledgerRows.filter(
          (r) =>
            r.balance < 0
        );

      const noSign =
        entries.filter(
          (e) =>
            e.sign1 !==
              "हाँ" ||
            e.sign2 !==
              "हाँ"
        );

      const badManak =
        standards.filter(
          (s) =>
            Math.abs(
              Number(
                s.total
              ) -
                Number(
                  master.project_cost
                )
            ) >= 0.5
        );

      const overAll =
        varieties.filter(
          (v) =>
            centralLeft(
              v.id
            ) < -0.5
        );

      const atLimit =
        varieties.filter(
          (v) =>
            Number(
              master.purchase_limit
            ) -
              purchAmt(
                v.id
              ) <=
              0.5 &&
            purchAmt(
              v.id
            ) > 0
        );

      const subsidy =
        entries.reduce(
          (sum, e) =>
            sum +
            Number(
              e.subsidy || 0
            ),
          0
        );

      const farmer =
        entries.reduce(
          (sum, e) =>
            sum +
            Number(
              e.farmer || 0
            ),
          0
        );

      const total =
        entries.reduce(
          (sum, e) =>
            sum +
            Number(
              e.total || 0
            ),
          0
        );

      return [
        {
          ok:
            !over.length,

          t: over.length
            ? `${over.length} केन्द्र-किस्म संयोजन में स्टॉक से अधिक वितरण — स्टॉक टैब में लाल पंक्तियाँ देखें।`
            : "किसी भी केन्द्र में स्टॉक से अधिक वितरण नहीं हुआ।",
        },

        {
          ok:
            !noSign.length,

          t: noSign.length
            ? `${noSign.length} प्रविष्टियों में कृषक/वितरक हस्ताक्षर बाकी हैं।`
            : "सभी प्रविष्टियों में दोनों हस्ताक्षर पूर्ण हैं।",
        },

        {
          ok:
            !badManak.length,

          t: badManak.length
            ? `${badManak
                .map(
                  (s) =>
                    s.variety_name
                )
                .join(
                  ", "
                )} — इनका मानक ₹${n(
                master.project_cost,
                0
              )}/है0 से भिन्न है, मानक टैब में जाँचें।`
            : `सभी ${standards.length} किस्मों का मानक ₹${n(
                master.project_cost,
                0
              )}/है0 से पूरा मेल खाता है।`,
        },

        {
          ok:
            !overAll.length,

          t: overAll.length
            ? `${overAll
                .map(
                  (v) =>
                    v.name
                )
                .join(
                  ", "
                )} — इनका केन्द्र-आवंटन कुल खरीद से अधिक है।`
            : "किसी किस्म का आवंटन उसकी खरीदी मात्रा से अधिक नहीं है।",
        },

        {
          ok:
            Math.abs(
              subsidy +
                farmer -
                total
            ) < 0.5,

          t: `कुल राजसहायता ${money(
            subsidy
          )} + कृषक अंश ${money(
            farmer
          )} = कुल परियोजना निवेश ${money(
            total
          )} — मिलान सही।`,
        },

        {
          ok: true,

          t: atLimit.length
            ? `${atLimit
                .map(
                  (v) =>
                    v.name
                )
                .join(
                  ", "
                )} — इनकी क्रय सीमा ${money(
                master.purchase_limit
              )} समाप्त, आगे खरीद स्वीकार नहीं होगी।`
            : "किसी भी किस्म की क्रय सीमा अभी समाप्त नहीं हुई है।",
        },

        {
          ok: true,

          t: "कृषक अंश नकद वितरित राशि नहीं, केवल अभिलेखीय स्व-अंशदान मूल्य है।",
        },
      ];
    }, [
      ledgerRows,
      entries,
      standards,
      master,
      varieties,
      purchases,
    ]);

  /*
   * =============================
   * REPORT
   * =============================
   */

  const reportRows =
    varieties.map(
      (v) => {
        const purchase =
          purchAmt(v.id);

        const remaining =
          Math.max(
            0,
            Number(
              master.purchase_limit
            ) -
              purchase
          );

        const allocated =
          allotGm(v.id);

        const central =
          centralLeft(
            v.id
          );

        const distributed =
          entries
            .filter(
              (e) =>
                Number(
                  e.variety
                ) ===
                Number(v.id)
            )
            .reduce(
              (sum, e) =>
                sum +
                Number(
                  e.seed_gm ||
                    0
                ),
              0
            );

        const area =
          allocated /
          (
            gmha(v.id) ||
            1
          );

        return {
          v,

          purchase,

          remaining,

          allocated,

          central,

          distributed,

          area,

          project:
            area *
            Number(
              master.project_cost
            ),

          count:
            entries.filter(
              (e) =>
                Number(
                  e.variety
                ) ===
                Number(v.id)
            ).length,

          purchaseGm:
            purchGm(v.id),
        };
      }
    );

  function setFormValue(
    key,
    value
  ) {
    setForm((previous) => {
      const next = {
        ...previous,
        [key]: value,
      };

      if (
        key ===
        "centre"
      ) {
        const allowed =
          centreVarieties(
            Number(value)
          );

        const currentName =
          varietyById[
            Number(
              previous.variety
            )
          ]?.name;

        if (
          previous.variety &&
          !allowed.includes(
            currentName
          )
        ) {
          next.variety = "";
        }
      }

      return next;
    });
  }

  /*
   * =============================
   * ADD DISTRIBUTION
   * =============================
   */

  async function addEntry() {
    if (
      !form.date ||
      !form.centre ||
      !form.variety ||
      !form.area ||
      !form.name.trim()
    ) {
      setMessage(
        "दिनांक, केन्द्र, किस्म, कृषक का नाम एवं क्षेत्रफल — पाँचों भरना ज़रूरी है।"
      );

      return;
    }

    try {
      const result =
        await apiFetch(
          "/distributions/",
          {
            method:
              "POST",

            body:
              JSON.stringify({
                date:
                  form.date,

                centre:
                  Number(
                    form.centre
                  ),

                variety:
                  Number(
                    form.variety
                  ),

                area:
                  Number(
                    form.area
                  ),

                name:
                  form.name.trim(),

                father:
                  form.father.trim(),

                village:
                  form.village.trim(),

                mobile:
                  form.mobile.trim(),

                sign1:
                  form.sign1,

                sign2:
                  form.sign2,

                note:
                  form.note.trim(),
              }),
          }
        );

      await load();

      setForm(
        emptyForm()
      );

      setMessage(
        `✓ जुड़ गया — ${result.name}, ${result.centre_name}, ${result.variety_name}, ${gm(
          result.seed_gm
        )} ग्राम।`
      );
    } catch (e) {
      setMessage(
        `✘ ${e.message}`
      );
    }
  }

  /*
   * =============================
   * ADD PURCHASE
   * =============================
   */

  async function addPurchase() {
    const qty =
      Number(
        purchaseForm.qty
      );

    const rate =
      Number(
        purchaseForm.rate
      );

    if (
      !purchaseForm.date ||
      !purchaseForm.variety ||
      !qty ||
      !rate
    ) {
      setMessage(
        "दिनांक, किस्म, मात्रा व दर भरें।"
      );

      return;
    }

    try {
      const result =
        await apiFetch(
          "/purchases/",
          {
            method:
              "POST",

            body:
              JSON.stringify({
                date:
                  purchaseForm.date,

                variety:
                  Number(
                    purchaseForm.variety
                  ),

                qty_kg:
                  qty,

                rate:
                  rate,

                supplier:
                  purchaseForm.supplier.trim(),

                ref:
                  purchaseForm.ref.trim(),
              }),
          }
        );

      await load();

      setPurchaseForm(
        emptyPurchase()
      );

      setMessage(
        `✓ क्रय जुड़ा — ${result.variety_name}, ${n(
          result.qty_kg,
          3
        )} किग्रा0 = ${money(
          result.amount
        )}।`
      );
    } catch (e) {
      setMessage(
        `✘ ${e.message}`
      );
    }
  }

  /*
   * =============================
   * ADD ALLOCATION
   * =============================
   */

  async function addAllocation() {
    if (
      !allotForm.date ||
      !allotForm.centre ||
      !allotForm.variety ||
      !Number(
        allotForm.qty
      )
    ) {
      setMessage(
        "दिनांक, केन्द्र, किस्म व मात्रा भरें।"
      );

      return;
    }

    try {
      const result =
        await apiFetch(
          "/allocations/",
          {
            method:
              "POST",

            body:
              JSON.stringify({
                date:
                  allotForm.date,

                centre:
                  Number(
                    allotForm.centre
                  ),

                variety:
                  Number(
                    allotForm.variety
                  ),

                qty_gm:
                  Number(
                    allotForm.qty
                  ),

                source:
                  allotForm.source.trim(),
              }),
          }
        );

      await load();

      setAllotForm(
        emptyAllot()
      );

      setMessage(
        `✓ ${result.centre_name} को ${result.variety_name} की ${gm(
          result.qty_gm
        )} ग्राम आवंटित।`
      );
    } catch (e) {
      setMessage(
        `✘ ${e.message}`
      );
    }
  }

  /*
   * =============================
   * DELETE
   * =============================
   */

  async function deleteItem(
    type,
    id,
    label
  ) {
    if (
      !window.confirm(
        `क्या ${label} हटाना है? यह वापस नहीं आएगा।`
      )
    ) {
      return;
    }

    try {
      await apiFetch(
        `/${type}/${id}/`,
        {
          method:
            "DELETE",
        }
      );

      await load();
    } catch (e) {
      setMessage(
        `✘ ${e.message}`
      );
    }
  }

  /*
   * =============================
   * MASTER SAVE
   * =============================
   */

  async function saveMaster() {
    try {
      const result =
        await apiFetch(
          "/master/",
          {
            method:
              "PUT",

            body:
              JSON.stringify({
                purchase_limit:
                  Number(
                    masterDraft.purchase_limit
                  ),

                project_cost:
                  Number(
                    masterDraft.project_cost
                  ),

                max_subsidy:
                  Number(
                    masterDraft.max_subsidy
                  ),

                farmer_share:
                  Number(
                    masterDraft.farmer_share
                  ),
              }),
          }
        );

      setData((previous) => ({
        ...previous,
        master:
          result,
      }));

      setMasterDraft(
        result
      );

      setMessage(
        "✓ सुरक्षित।"
      );
    } catch (e) {
      setMessage(
        `✘ ${e.message}`
      );
    }
  }

  async function resetMaster() {
    if (
      !window.confirm(
        "मूल मूल्यों पर लौटाएँ?"
      )
    ) {
      return;
    }

    try {
      const result =
        await apiFetch(
          "/master/",
          {
            method:
              "PUT",

            body:
              JSON.stringify({
                purchase_limit:
                  250000,

                project_cost:
                  60000,

                max_subsidy:
                  30000,

                farmer_share:
                  30000,
              }),
          }
        );

      setData((previous) => ({
        ...previous,
        master:
          result,
      }));

      setMasterDraft(
        result
      );

      setMessage(
        "✓ मूल मूल्य सुरक्षित हो गए।"
      );
    } catch (e) {
      setMessage(
        `✘ ${e.message}`
      );
    }
  }

  /*
   * =============================
   * STANDARD SAVE
   * =============================
   */

  async function saveStandard(
    standard
  ) {
    try {
      await apiFetch(
        `/standards/${standard.id}/`,
        {
          method:
            "PUT",

          body:
            JSON.stringify({
              variety:
                Number(
                  standard.variety
                ),

              item1_label:
                standard.item1_label,

              item1_unit:
                standard.item1_unit,

              item1_qty:
                Number(
                  standard.item1_qty
                ),

              item1_rate:
                Number(
                  standard.item1_rate
                ),

              item2_label:
                standard.item2_label,

              item2_unit:
                standard.item2_unit,

              item2_qty:
                Number(
                  standard.item2_qty
                ),

              item2_rate:
                Number(
                  standard.item2_rate
                ),

              item3_label:
                standard.item3_label,

              item3_unit:
                standard.item3_unit,

              item3_qty:
                Number(
                  standard.item3_qty
                ),

              item3_rate:
                Number(
                  standard.item3_rate
                ),

              item4_label:
                standard.item4_label,

              item4_unit:
                standard.item4_unit,

              item4_qty:
                Number(
                  standard.item4_qty
                ),

              item4_rate:
                Number(
                  standard.item4_rate
                ),
            }),
        }
      );

      await load();

      setMessage(
        "✓ मानक सुरक्षित।"
      );
    } catch (e) {
      setMessage(
        `✘ ${e.message}`
      );
    }
  }

  /*
   * =============================
   * RESET ALL STANDARDS
   * =============================
   */

  async function resetAllStandards() {
    if (
      !window.confirm(
        "सभी किस्मों के मानक मूल स्थिति पर लौटाएँ? पुरानी वितरण प्रविष्टियाँ नहीं बदलेंगी।"
      )
    ) {
      return;
    }

    try {
      for (
        const standard of standards
      ) {
        const variety =
          varietyById[
            Number(
              standard.variety
            )
          ];

        const rate =
          Number(
            variety?.default_rate ||
              standard.item2_rate
          );

        await apiFetch(
          `/standards/${standard.id}/`,
          {
            method:
              "PUT",

            body:
              JSON.stringify({
                variety:
                  Number(
                    standard.variety
                  ),

                item1_label:
                  "खेत तैयारी + पौधशाला प्रबन्धन (कृषक अंश)",

                item1_unit:
                  "हैक्टेयर-तुल्य",

                item1_qty:
                  1,

                item1_rate:
                  8700,

                item2_label:
                  "बीज की कीमत (राजसहायता)",

                item2_unit:
                  "किग्रा0",

                item2_qty:
                  30000 /
                  rate,

                item2_rate:
                  rate,

                item3_label:
                  "गोबर/कम्पोस्ट खाद (कृषक अंश)",

                item3_unit:
                  "कुन्तल",

                item3_qty:
                  100,

                item3_rate:
                  150,

                item4_label:
                  "रोपण/सिंचाई/स्टेकिंग आदि (कृषक अंश)",

                item4_unit:
                  "श्रमिक/अन्य",

                item4_qty:
                  20,

                item4_rate:
                  315,
              }),
          }
        );
      }

      await load();

      setMessage(
        "✓ सभी मानक मूल स्थिति पर लौट गए।"
      );
    } catch (e) {
      setMessage(
        `✘ ${e.message}`
      );
    }
  }

  /*
   * =============================
   * CSV
   * =============================
   */

  function downloadCsv(
    filename,
    headers,
    rows
  ) {
    const content =
      "\uFEFF" +
      [
        headers,
        ...rows,
      ]
        .map((row) =>
          row
            .map(
              (value) =>
                `"${String(
                  value ?? ""
                ).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(",")
        )
        .join("\r\n");

    const blob =
      new Blob(
        [content],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `${filename}-${today()}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );
  }

  /*
   * =============================
   * PRINT
   * =============================
   */

  function printHtml(
    html,
    title
  ) {
    const css =
      new URL(
        "./KishanBeej.css",
        import.meta.url
      ).href;

    const win =
      window.open(
        "",
        "_blank",
        "width=1200,height=800"
      );

    if (!win) {
      return;
    }

    win.document.write(`
      <!doctype html>

      <html lang="hi">

      <head>

        <meta charset="utf-8">

        <title>
          ${title}
        </title>

        <link
          rel="stylesheet"
          href="${css}"
        >

      </head>

      <body>

        <div id="printarea">

          ${html}

        </div>

        <script>
          window.onload = () => {
            setTimeout(
              () => window.print(),
              250
            );
          };
        <\/script>

      </body>

      </html>
    `);

    win.document.close();
  }

  function printRegister(
    list = filteredEntries,
    title =
      "किसान बीज वितरण रजिस्टर"
  ) {
    if (!list.length) {
      alert(
        "कोई प्रविष्टि नहीं।"
      );

      return;
    }

    const rows =
      list
        .map(
          (e, i) => `
            <tr>

              <td>
                ${i + 1}
              </td>

              <td>
                ${dmy(e.date)}
              </td>

              <td>
                ${e.centre_name}
              </td>

              <td>
                ${e.variety_name}
              </td>

              <td>
                ${e.name}
              </td>

              <td>
                ${e.village || ""}
              </td>

              <td>
                ${n(
                  e.area,
                  3
                )}
              </td>

              <td>
                ${n(
                  e.item1_qty
                )}
                /
                ${money(
                  e.item1_amount
                )}
              </td>

              <td>
                ${gm(
                  e.seed_gm
                )}
                /
                ${money(
                  e.item2_amount
                )}
              </td>

              <td>
                ${n(
                  e.item3_qty
                )}
                /
                ${money(
                  e.item3_amount
                )}
              </td>

              <td>
                ${n(
                  e.item4_qty
                )}
                /
                ${money(
                  e.item4_amount
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

              <td
                class="sg"
              ></td>

            </tr>
          `
        )
        .join("");

    printHtml(
      `
        <h2>
          ${title}
        </h2>

        <p class="pm">
          उद्यान विशेषज्ञ कार्यालय ·
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
              </th>

              <th>
                मद1
                मात्रा/राशि
              </th>

              <th>
                बीज
                ग्राम/राशि
              </th>

              <th>
                मद3
                मात्रा/राशि
              </th>

              <th>
                मद4
                मात्रा/राशि
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
                हस्ताक्षर/
                अंगूठा
              </th>

            </tr>

          </thead>

          <tbody>

            ${rows}

          </tbody>

        </table>

        <p class="pm">

          हस्ताक्षर उद्यान सचल दल
          .....................................

          &nbsp;&nbsp;&nbsp;

          हस्ताक्षर केन्द्र प्रभारी
          .....................................

        </p>
      `,
      title
    );
  }

  /*
   * =============================
   * LOADING
   * =============================
   */

  if (loading) {
    return (
      <div className="kishan-beej-app">

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

        <main>

          <div className="card">

            <div className="note">

              डेटा सर्वर से
              लोड हो रहा है...

            </div>

          </div>

        </main>

      </div>
    );
  }

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
            [
              "home",
              "🏠",
              "होम",
            ],

            [
              "entry",
              "✍️",
              "वितरण",
            ],

            [
              "stock",
              "📦",
              "स्टॉक",
            ],

            [
              "manak",
              "⚙️",
              "मानक",
            ],

            [
              "report",
              "📊",
              "रिपोर्ट",
            ],
          ].map(
            ([id, icon, label]) => (
              <button
                key={id}
                className={
                  tab === id
                    ? "on"
                    : ""
                }
                onClick={() => {
                  setTab(id);

                  window.scrollTo({
                    top: 0,
                    behavior:
                      "smooth",
                  });
                }}
              >

                <span className="ic">
                  {icon}
                </span>

                {label}

              </button>
            )
          )}

        </div>

      </nav>

      {error && (
        <main>

          <div className="note bad">

            ✘ {error}

            <button
              className="btn b2 sm"
              style={{
                marginLeft: 10,
              }}
              onClick={load}
            >
              फिर प्रयास करें
            </button>

          </div>

        </main>
      )}

      {message && (
        <main>

          <div
            className={`note ${
              message.startsWith(
                "✓"
              )
                ? "ok"
                : "bad"
            }`}
          >
            {message}
          </div>

        </main>
      )}

      <main>

        {/* =================================================
            HOME
        ================================================= */}

        {tab === "home" && (
          <section className="panel on">

            <h2>
              एक नज़र में स्थिति
            </h2>

            <p className="sub">
              नीचे पूरी योजना की
              जीवंत स्थिति है। कोई
              भी संख्या लाल दिखे तो
              उसी टैब में जाकर जाँच
              करें।
            </p>

            <div className="kpis">

              <Kpi
                label="कुल क्रय राशि"
                value={money(
                  purchases.reduce(
                    (s, p) =>
                      s +
                      Number(
                        p.amount || 0
                      ),
                    0
                  )
                )}
                sub={`सभी ${varieties.length} किस्में`}
              />

              <Kpi
                label="किसानों को वितरित"
                value={`${gm(
                  entries.reduce(
                    (s, e) =>
                      s +
                      Number(
                        e.seed_gm ||
                          0
                      ),
                    0
                  )
                )} ग्राम`}
                sub={`${entries.length} प्रविष्टियाँ`}
              />

              <Kpi
                label="केन्द्रों में शेष"
                value={`${gm(
                  ledgerRows.reduce(
                    (s, r) =>
                      s +
                      r.balance,
                    0
                  )
                )} ग्राम`}
                sub={`प्राप्त ${n(
                  ledgerRows.reduce(
                    (s, r) =>
                      s +
                      r.opening,
                    0
                  ),
                  0
                )} ग्राम में से`}
                state={
                  ledgerRows.reduce(
                    (s, r) =>
                      s +
                      r.balance,
                    0
                  ) < 0
                    ? "bad"
                    : "ok"
                }
              />

              <Kpi
                label="ध्यान देने योग्य"
                value={
                  auditChecks.filter(
                    (c) =>
                      !c.ok
                  ).length
                }
                sub={`${ledgerRows.filter(
                  (r) =>
                    r.balance < 0
                ).length} अधिक-वितरण, ${entries.filter(
                  (e) =>
                    e.sign1 !==
                      "हाँ" ||
                    e.sign2 !==
                      "हाँ"
                ).length} हस्ताक्षर बाकी`}
                state={
                  auditChecks.some(
                    (c) =>
                      !c.ok
                  )
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
                काम का क्रम —
                बस इतना ही
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
                    — रोज़ का असली काम।
                    केन्द्र, किस्म,
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

        {/* =================================================
            DISTRIBUTION
        ================================================= */}

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

                <Field
                  label="दिनांक"
                  required
                >
                  <input
                    type="date"
                    className="need"
                    value={
                      form.date
                    }
                    onChange={(e) =>
                      setFormValue(
                        "date",
                        e.target.value
                      )
                    }
                  />
                </Field>

                <Field
                  label="उ0स0द0 केन्द्र"
                  required
                >
                  <select
                    className="need"
                    value={
                      form.centre
                    }
                    onChange={(e) =>
                      setFormValue(
                        "centre",
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      — केन्द्र चुनें —
                    </option>

                    {centres.map(
                      (c) => (
                        <option
                          key={c.id}
                          value={c.id}
                        >
                          {c.name}
                        </option>
                      )
                    )}

                  </select>
                </Field>

                <Field
                  label="किस्म"
                  required
                >
                  <select
                    className="need"
                    value={
                      form.variety
                    }
                    onChange={(e) =>
                      setFormValue(
                        "variety",
                        e.target.value
                      )
                    }
                  >

                    <option value="">
                      —
                      {form.centre
                        ? "किस्म चुनें"
                        : "पहले केन्द्र चुनें"}
                      —
                    </option>

                    {(
                      form.centre
                        ? centreVarieties(
                            Number(
                              form.centre
                            )
                          )
                        : names
                    ).map(
                      (name) => {
                        const v =
                          varieties.find(
                            (x) =>
                              x.name ===
                              name
                          );

                        return v ? (
                          <option
                            key={v.id}
                            value={v.id}
                          >
                            {v.name}
                          </option>
                        ) : null;
                      }
                    )}

                  </select>
                </Field>

                <Field
                  label="क्षेत्रफल (है0)"
                  required
                >
                  <input
                    type="number"
                    className="need"
                    step="0.001"
                    min="0.001"
                    placeholder="जैसे 0.200"
                    value={
                      form.area
                    }
                    onChange={(e) =>
                      setFormValue(
                        "area",
                        e.target.value
                      )
                    }
                  />
                </Field>

              </div>

              <div
                className="grid g4"
                style={{
                  marginTop: 10,
                }}
              >

                <Field
                  label="कृषक का नाम"
                  required
                >
                  <input
                    value={
                      form.name
                    }
                    placeholder="श्री ..."
                    onChange={(e) =>
                      setFormValue(
                        "name",
                        e.target.value
                      )
                    }
                  />
                </Field>

                <Field
                  label="पिता/पति का नाम"
                >
                  <input
                    value={
                      form.father
                    }
                    onChange={(e) =>
                      setFormValue(
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
                      setFormValue(
                        "village",
                        e.target.value
                      )
                    }
                  />
                </Field>

                <Field
                  label="मोबाइल नं0"
                >
                  <input
                    type="tel"
                    value={
                      form.mobile
                    }
                    onChange={(e) =>
                      setFormValue(
                        "mobile",
                        e.target.value
                      )
                    }
                  />
                </Field>

              </div>

              <div
                className="grid g3"
                style={{
                  marginTop: 10,
                }}
              >

                <Field
                  label="कृषक हस्ताक्षर/अंगूठा"
                >
                  <select
                    value={
                      form.sign1
                    }
                    onChange={(e) =>
                      setFormValue(
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

                <Field
                  label="वितरक हस्ताक्षर"
                >
                  <select
                    value={
                      form.sign2
                    }
                    onChange={(e) =>
                      setFormValue(
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

                <Field
                  label="टिप्पणी"
                >
                  <input
                    value={
                      form.note
                    }
                    onChange={(e) =>
                      setFormValue(
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
                  centres.find(
                    (c) =>
                      Number(
                        c.id
                      ) ===
                      Number(
                        form.centre
                      )
                  )?.name
                }
                stock={
                  form.centre &&
                  form.variety
                    ? opening(
                        Number(
                          form.centre
                        ),
                        Number(
                          form.variety
                        )
                      ) -
                      issued(
                        Number(
                          form.centre
                        ),
                        Number(
                          form.variety
                        )
                      )
                    : 0
                }
              />

              <div
                className="row"
                style={{
                  marginTop: 12,
                }}
              >

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
                    setForm(
                      emptyForm()
                    )
                  }
                >
                  साफ़ करें
                </button>

              </div>

            </div>

            <div className="card noprint">

              <div className="grid g3">

                <Field
                  label="केन्द्र से छाँटें"
                >
                  <select
                    value={
                      filters.centre
                    }
                    onChange={(e) =>
                      setFilters(
                        (p) => ({
                          ...p,
                          centre:
                            e.target.value,
                          variety:
                            "",
                        })
                      )
                    }
                  >

                    <option value="">
                      सभी केन्द्र
                    </option>

                    {centres.map(
                      (c) => (
                        <option
                          key={c.id}
                          value={c.id}
                        >
                          {c.name}
                        </option>
                      )
                    )}

                  </select>
                </Field>

                <Field
                  label="किस्म से छाँटें"
                >
                  <select
                    value={
                      filters.variety
                    }
                    onChange={(e) =>
                      setFilters(
                        (p) => ({
                          ...p,
                          variety:
                            e.target.value,
                        })
                      )
                    }
                  >

                    <option value="">
                      सभी किस्में
                    </option>

                    {varieties.map(
                      (v) => (
                        <option
                          key={v.id}
                          value={v.id}
                        >
                          {v.name}
                        </option>
                      )
                    )}

                  </select>
                </Field>

                <Field
                  label="नाम/ग्राम से खोजें"
                >
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
                            e.target.value,
                        })
                      )
                    }
                  />
                </Field>

              </div>

              <div
                className="row end"
                style={{
                  marginTop: 12,
                }}
              >

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
                          "टिप्पणी",
                        ],

                        filteredEntries.map(
                          (
                            e,
                            i
                          ) => [
                            i + 1,
                            dmy(
                              e.date
                            ),
                            e.centre_name,
                            e.variety_name,
                            e.name,
                            e.father,
                            e.village,
                            e.mobile,
                            e.area,
                            e.item1_qty,
                            e.item1_amount,
                            e.seed_gm,
                            e.item2_amount,
                            e.item3_qty,
                            e.item3_amount,
                            e.item4_qty,
                            e.item4_amount,
                            e.total,
                            e.subsidy,
                            e.farmer,
                            e.sign1,
                            e.sign2,
                            e.note,
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
                        <th>
                          क्र0
                        </th>

                        <th>
                          दिनांक
                        </th>

                        <th>
                          केन्द्र
                        </th>

                        <th>
                          किस्म
                        </th>

                        <th>
                          कृषक का नाम
                        </th>

                        <th>
                          ग्राम
                        </th>

                        <th>
                          क्षे0फ0
                        </th>

                        <th>
                          मद1
                          मात्रा/राशि
                        </th>

                        <th>
                          बीज
                          ग्राम/राशि
                        </th>

                        <th>
                          मद3
                          मात्रा/राशि
                        </th>

                        <th>
                          मद4
                          मात्रा/राशि
                        </th>

                        <th>
                          कुल
                        </th>

                        <th>
                          राजसहायता
                        </th>

                        <th>
                          कृषक अंश
                        </th>

                        <th>
                          हस्ताक्षर
                        </th>

                        <th>
                          क्रिया
                        </th>
                      </tr>

                    </thead>

                    <tbody>

                      {filteredEntries.map(
                        (
                          e,
                          i
                        ) => (
                          <tr
                            key={
                              e.id
                            }
                          >

                            <td>
                              {i + 1}
                            </td>

                            <td>
                              {dmy(
                                e.date
                              )}
                            </td>

                            <td>
                              {
                                e.centre_name
                              }
                            </td>

                            <td>
                              {
                                e.variety_name
                              }
                            </td>

                            <td>
                              {e.name}
                            </td>

                            <td>
                              {
                                e.village
                              }
                            </td>

                            <td>
                              {n(
                                e.area,
                                3
                              )}
                            </td>

                            <td>
                              {n(
                                e.item1_qty
                              )}
                              {" / "}
                              {money(
                                e.item1_amount
                              )}
                            </td>

                            <td>
                              {gm(
                                e.seed_gm
                              )}
                              {" / "}
                              {money(
                                e.item2_amount
                              )}
                            </td>

                            <td>
                              {n(
                                e.item3_qty
                              )}
                              {" / "}
                              {money(
                                e.item3_amount
                              )}
                            </td>

                            <td>
                              {n(
                                e.item4_qty
                              )}
                              {" / "}
                              {money(
                                e.item4_amount
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
                                onClick={() =>
                                  deleteItem(
                                    "distributions",
                                    e.id,
                                    `"${e.name}" की प्रविष्टि`
                                  )
                                }
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

        {/* =================================================
            STOCK
        ================================================= */}

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
                  "केन्द्रवार शेष",
                ],

                [
                  "allot",
                  "केन्द्र आवंटन",
                ],

                [
                  "purchase",
                  "बीज क्रय",
                ],
              ].map(
                ([id, label]) => (
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
                    {label}
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
                          e.target.value
                        )
                      }
                      placeholder="केन्द्र या किस्म खोजें..."
                      style={{
                        maxWidth: 280,
                      }}
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

                          <th>
                            क्र0
                          </th>

                          <th>
                            केन्द्र
                          </th>

                          <th>
                            किस्म
                          </th>

                          <th>
                            प्राप्त
                            (ग्राम)
                          </th>

                          <th>
                            वितरित
                            (ग्राम)
                          </th>

                          <th>
                            शेष
                            (ग्राम)
                          </th>

                          <th>
                            स्थिति
                          </th>

                          <th>
                            किसान
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {ledgerRows.map(
                          (
                            row,
                            index
                          ) => (
                            <tr
                              key={`${row.centreId}-${row.varietyId}`}
                            >

                              <td>
                                {index +
                                  1}
                              </td>

                              <td>
                                {
                                  row.centre
                                }
                              </td>

                              <td>
                                {
                                  row.variety
                                }
                              </td>

                              <td>
                                {n(
                                  row.opening,
                                  0
                                )}
                              </td>

                              <td>
                                {gm(
                                  row.issued
                                )}
                              </td>

                              <td
                                className={
                                  row.balance <
                                  0
                                    ? "neg"
                                    : ""
                                }
                              >
                                {gm(
                                  row.balance
                                )}
                              </td>

                              <td>

                                {row.balance <
                                0 ? (
                                  <span className="tag bad">
                                    अधिक-वितरण
                                  </span>
                                ) : row.balance ===
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
                                  row.farmers
                                }
                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                      <tfoot>

                        <tr>

                          <td colSpan="3">
                            कुल योग
                          </td>

                          <td>
                            {n(
                              ledgerRows.reduce(
                                (s, r) =>
                                  s +
                                  r.opening,
                                0
                              ),
                              0
                            )}
                          </td>

                          <td>
                            {gm(
                              ledgerRows.reduce(
                                (s, r) =>
                                  s +
                                  r.issued,
                                0
                              )
                            )}
                          </td>

                          <td>
                            {gm(
                              ledgerRows.reduce(
                                (s, r) =>
                                  s +
                                  r.balance,
                                0
                              )
                            )}
                          </td>

                          <td colSpan="2"></td>

                        </tr>

                      </tfoot>

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

                    <Field
                      label="दिनांक"
                      required
                    >
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
                                e.target.value,
                            })
                          )
                        }
                      />
                    </Field>

                    <Field
                      label="केन्द्र"
                      required
                    >
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
                                e.target.value,
                            })
                          )
                        }
                      >

                        <option value="">
                          — केन्द्र चुनें —
                        </option>

                        {centres.map(
                          (c) => (
                            <option
                              key={c.id}
                              value={c.id}
                            >
                              {c.name}
                            </option>
                          )
                        )}

                      </select>
                    </Field>

                    <Field
                      label="किस्म"
                      required
                    >
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
                                e.target.value,
                            })
                          )
                        }
                      >

                        <option value="">
                          — किस्म चुनें —
                        </option>

                        {varieties.map(
                          (v) => (
                            <option
                              key={v.id}
                              value={v.id}
                            >
                              {v.name}
                            </option>
                          )
                        )}

                      </select>
                    </Field>

                    <Field
                      label="मात्रा (ग्राम)"
                      required
                    >
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
                                e.target.value,
                            })
                          )
                        }
                      />
                    </Field>

                  </div>

                  <div
                    className="grid g3"
                    style={{
                      marginTop: 10,
                    }}
                  >

                    <Field
                      label="क्षेत्रफल — स्वतः (है0)"
                    >
                      <input
                        readOnly
                        value={
                          allotCalc
                            ? `${n(
                                allotCalc.area,
                                4
                              )} है0`
                            : ""
                        }
                      />
                    </Field>

                    <Field
                      label="परियोजना लागत — स्वतः (₹)"
                    >
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

                    <Field
                      label="स्रोत/देयक सं0"
                    >
                      <input
                        value={
                          allotForm.source
                        }
                        onChange={(e) =>
                          setAllotForm(
                            (p) => ({
                              ...p,
                              source:
                                e.target.value,
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
                          Number(
                            allotForm.variety
                          )
                        ) +
                          0.01
                          ? "bad"
                          : "ok"
                      }`}
                      style={{
                        marginTop: 12,
                      }}
                    >

                      {allotCalc.gmv >
                      centralLeft(
                        Number(
                          allotForm.variety
                        )
                      ) +
                        0.01
                        ? `केन्द्रीय स्टॉक कम — ${
                            varietyById[
                              Number(
                                allotForm.variety
                              )
                            ]?.name
                          } का शेष केवल ${gm(
                            centralLeft(
                              Number(
                                allotForm.variety
                              )
                            )
                          )} ग्राम है।`
                        : `ठीक है — क्षेत्रफल ${n(
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
                              Number(
                                allotForm.variety
                              )
                            ) -
                              allotCalc.gmv
                          )} ग्राम।`}

                    </div>
                  )}

                  <div
                    className="row"
                    style={{
                      marginTop: 12,
                    }}
                  >

                    <button
                      className="btn b1"
                      onClick={
                        addAllocation
                      }
                    >
                      आवंटन जोड़ें
                    </button>

                  </div>

                </div>

                <div className="card noprint">

                  <div className="row end">

                    <select
                      value={
                        allotFilter
                      }
                      onChange={(e) =>
                        setAllotFilter(
                          e.target.value
                        )
                      }
                      style={{
                        maxWidth: 280,
                      }}
                    >

                      <option value="">
                        सभी केन्द्र
                      </option>

                      {centres.map(
                        (c) => (
                          <option
                            key={c.id}
                            value={c.id}
                          >
                            {c.name}
                          </option>
                        )
                      )}

                    </select>

                    <button
                      className="btn b2 sm"
                      onClick={() =>
                        downloadCsv(
                          "केन्द्र-आवंटन",

                          [
                            "क्र0",
                            "दिनांक",
                            "केन्द्र",
                            "किस्म",
                            "मात्रा(ग्राम)",
                            "क्षे0फ0(है0)",
                            "परियोजना लागत",
                            "राजसहायता",
                            "कृषक अंश",
                            "स्रोत",
                          ],

                          allocations
                            .filter(
                              (a) =>
                                !allotFilter ||
                                Number(
                                  a.centre
                                ) ===
                                  Number(
                                    allotFilter
                                  )
                            )
                            .map(
                              (
                                a,
                                i
                              ) => [
                                i + 1,
                                dmy(
                                  a.date
                                ),
                                a.centre_name,
                                a.variety_name,
                                a.qty_gm,
                                a.area,
                                a.project_cost,
                                a.subsidy,
                                a.farmer_share,
                                a.source,
                              ]
                            )
                        )
                      }
                    >
                      ⬇ CSV
                    </button>

                  </div>

                </div>

                <div className="card table-card">

                  <div className="tw">

                    <table>

                      <thead>

                        <tr>

                          <th>
                            क्र0
                          </th>

                          <th>
                            दिनांक
                          </th>

                          <th>
                            केन्द्र
                          </th>

                          <th>
                            किस्म
                          </th>

                          <th>
                            मात्रा
                            (ग्राम)
                          </th>

                          <th>
                            क्षे0फ0
                            (है0)
                          </th>

                          <th>
                            परियोजना
                            लागत (₹)
                          </th>

                          <th>
                            राजसहायता
                            (₹)
                          </th>

                          <th>
                            कृषक अंश
                            (₹)
                          </th>

                          <th>
                            स्रोत
                          </th>

                          <th>
                            क्रिया
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {allocations
                          .filter(
                            (a) =>
                              !allotFilter ||
                              Number(
                                a.centre
                              ) ===
                                Number(
                                  allotFilter
                                )
                          )
                          .map(
                            (
                              a,
                              i
                            ) => (
                              <tr
                                key={
                                  a.id
                                }
                              >

                                <td>
                                  {i + 1}
                                </td>

                                <td>
                                  {dmy(
                                    a.date
                                  )}
                                </td>

                                <td>
                                  {
                                    a.centre_name
                                  }
                                </td>

                                <td>
                                  {
                                    a.variety_name
                                  }
                                </td>

                                <td>
                                  {gm(
                                    a.qty_gm
                                  )}
                                </td>

                                <td>
                                  {n(
                                    a.area,
                                    4
                                  )}
                                </td>

                                <td>
                                  {money(
                                    a.project_cost
                                  )}
                                </td>

                                <td>
                                  {money(
                                    a.subsidy
                                  )}
                                </td>

                                <td>
                                  {money(
                                    a.farmer_share
                                  )}
                                </td>

                                <td>
                                  {
                                    a.source
                                  }
                                </td>

                                <td>
                                  <button
                                    className="btn b3 sm"
                                    onClick={() =>
                                      deleteItem(
                                        "allocations",
                                        a.id,
                                        `आवंटन ${a.centre_name}`
                                      )
                                    }
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

                    <Field
                      label="दिनांक"
                      required
                    >
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
                                e.target.value,
                            })
                          )
                        }
                      />
                    </Field>

                    <Field
                      label="किस्म"
                      required
                    >
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
                                e.target.value,
                            })
                          )
                        }
                      >

                        <option value="">
                          — किस्म चुनें —
                        </option>

                        {varieties.map(
                          (v) => (
                            <option
                              key={v.id}
                              value={v.id}
                            >
                              {v.name}
                            </option>
                          )
                        )}

                      </select>
                    </Field>

                    <Field
                      label="मात्रा (किग्रा0)"
                      required
                    >
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
                                e.target.value,
                            })
                          )
                        }
                      />
                    </Field>

                    <Field
                      label="दर (₹/किग्रा0)"
                      required
                    >
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
                                e.target.value,
                            })
                          )
                        }
                      />
                    </Field>

                  </div>

                  <div
                    className="grid g3"
                    style={{
                      marginTop: 10,
                    }}
                  >

                    <Field
                      label="कुल राशि — स्वतः (₹)"
                    >
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

                    <Field
                      label="आपूर्तिकर्ता"
                    >
                      <input
                        value={
                          purchaseForm.supplier
                        }
                        onChange={(e) =>
                          setPurchaseForm(
                            (p) => ({
                              ...p,
                              supplier:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </Field>

                    <Field
                      label="देयक सं0"
                    >
                      <input
                        value={
                          purchaseForm.ref
                        }
                        onChange={(e) =>
                          setPurchaseForm(
                            (p) => ({
                              ...p,
                              ref:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </Field>

                  </div>

                  <div
                    className={`note ${
                      purchaseCalc &&
                      purchaseCalc.total >
                        purchaseCalc.left +
                          0.01
                        ? "bad"
                        : "ok"
                    }`}
                    style={{
                      marginTop: 12,
                    }}
                  >

                    {purchaseCalc
                      ? purchaseCalc.total >
                        purchaseCalc.left +
                          0.01
                        ? `सीमा पार — ${
                            varietyById[
                              Number(
                                purchaseForm.variety
                              )
                            ]?.name
                          } की शेष क्रय क्षमता केवल ${money(
                            purchaseCalc.left
                          )} है। यह प्रविष्टि स्वीकार नहीं होगी।`
                        : `ठीक है — इसके बाद ${
                            varietyById[
                              Number(
                                purchaseForm.variety
                              )
                            ]?.name
                          } की कुल खरीद ${money(
                            purchaseCalc.after
                          )} होगी, शेष क्षमता ${money(
                            purchaseCalc.remaining
                          )}।`
                      : "किस्म, मात्रा व दर भरते ही क्रय सीमा की स्थिति दिखेगी।"}

                  </div>

                  <div
                    className="row"
                    style={{
                      marginTop: 12,
                    }}
                  >

                    <button
                      className="btn b1"
                      onClick={
                        addPurchase
                      }
                    >
                      क्रय जोड़ें
                    </button>

                  </div>

                </div>

                <div className="card noprint">

                  <div className="row end">

                    <span className="tag n">
                      {
                        purchases.length
                      }{" "}
                      क्रय प्रविष्टियाँ
                    </span>

                    <button
                      className="btn b2 sm"
                      onClick={() =>
                        downloadCsv(
                          "बीज-क्रय",

                          [
                            "क्र0",
                            "दिनांक",
                            "किस्म",
                            "आपूर्तिकर्ता",
                            "मात्रा",
                            "इकाई",
                            "दर",
                            "कुल राशि",
                            "देयक सं0",
                          ],

                          purchases.map(
                            (
                              p,
                              i
                            ) => [
                              i + 1,
                              dmy(
                                p.date
                              ),
                              p.variety_name,
                              p.supplier,
                              p.qty_kg,
                              "kg",
                              p.rate,
                              p.amount,
                              p.ref,
                            ]
                          )
                        )
                      }
                    >
                      ⬇ CSV
                    </button>

                  </div>

                </div>

                <div className="card table-card">

                  <div className="tw">

                    <table>

                      <thead>

                        <tr>

                          <th>
                            क्र0
                          </th>

                          <th>
                            दिनांक
                          </th>

                          <th>
                            किस्म
                          </th>

                          <th>
                            आपूर्तिकर्ता
                          </th>

                          <th>
                            मात्रा
                          </th>

                          <th>
                            दर (₹)
                          </th>

                          <th>
                            कुल राशि
                            (₹)
                          </th>

                          <th>
                            शेष क्रय
                            क्षमता (₹)
                          </th>

                          <th>
                            देयक सं0
                          </th>

                          <th>
                            क्रिया
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {purchases.map(
                          (
                            p,
                            i
                          ) => (
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
                                  p.variety_name
                                }
                              </td>

                              <td>
                                {
                                  p.supplier
                                }
                              </td>

                              <td>
                                {n(
                                  p.qty_kg,
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

                              <td
                                className={
                                  Number(
                                    p.remaining_capacity
                                  ) <=
                                  0.5
                                    ? "neg"
                                    : ""
                                }
                              >
                                {money(
                                  p.remaining_capacity
                                )}
                              </td>

                              <td>
                                {
                                  p.ref
                                }
                              </td>

                              <td>
                                <button
                                  className="btn b3 sm"
                                  onClick={() =>
                                    deleteItem(
                                      "purchases",
                                      p.id,
                                      `क्रय ${p.variety_name}`
                                    )
                                  }
                                >
                                  हटाएँ
                                </button>
                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                      <tfoot>

                        <tr>

                          <td colSpan="6">
                            कुल योग
                          </td>

                          <td>
                            {money(
                              purchases.reduce(
                                (s, p) =>
                                  s +
                                  Number(
                                    p.amount ||
                                      0
                                  ),
                                0
                              )
                            )}
                          </td>

                          <td colSpan="3"></td>

                        </tr>

                      </tfoot>

                    </table>

                  </div>

                </div>

              </>
            )}

          </section>
        )}

        {/* =================================================
            MANAK
        ================================================= */}

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
              प्रविष्टियों पर लागू होगा —
              पुरानी प्रविष्टियाँ अपने
              समय का मानक सुरक्षित
              रखती हैं।
            </p>

            <div className="card">

              <h3>
                चार मूल मूल्य
              </h3>

              <div className="grid g4">

                {[
                  [
                    "purchase_limit",
                    "क्रय सीमा प्रति किस्म (₹)",
                  ],

                  [
                    "project_cost",
                    "परियोजना लागत (₹/है0)",
                  ],

                  [
                    "max_subsidy",
                    "अधिकतम राजसहायता (₹/है0)",
                  ],

                  [
                    "farmer_share",
                    "कृषक अंश (₹/है0)",
                  ],
                ].map(
                  ([key, label]) => (
                    <Field
                      key={key}
                      label={label}
                    >
                      <input
                        type="number"
                        value={
                          masterDraft?.[
                            key
                          ] ??
                          ""
                        }
                        onChange={(e) =>
                          setMasterDraft(
                            (p) => ({
                              ...p,
                              [key]:
                                e.target.value,
                            })
                          )
                        }
                      />
                    </Field>
                  )
                )}

              </div>

              <div
                className={`note ${
                  Math.abs(
                    Number(
                      masterDraft?.max_subsidy ||
                        0
                    ) +
                      Number(
                        masterDraft?.farmer_share ||
                          0
                      ) -
                      Number(
                        masterDraft?.project_cost ||
                          0
                      )
                  ) < 0.5
                    ? "ok"
                    : "bad"
                }`}
                style={{
                  marginTop: 12,
                }}
              >

                {Math.abs(
                  Number(
                    masterDraft?.max_subsidy ||
                      0
                  ) +
                    Number(
                      masterDraft?.farmer_share ||
                        0
                    ) -
                    Number(
                      masterDraft?.project_cost ||
                        0
                    )
                ) < 0.5
                  ? `जाँच सही — राजसहायता ${money(
                      masterDraft?.max_subsidy
                    )} + कृषक अंश ${money(
                      masterDraft?.farmer_share
                    )} = परियोजना लागत ${money(
                      masterDraft?.project_cost
                    )} ✔`
                  : `मेल नहीं — ${money(
                      masterDraft?.max_subsidy
                    )} + ${money(
                      masterDraft?.farmer_share
                    )} = ${money(
                      Number(
                        masterDraft?.max_subsidy ||
                          0
                      ) +
                        Number(
                          masterDraft?.farmer_share ||
                            0
                        )
                    )}, जबकि परियोजना लागत ${money(
                      masterDraft?.project_cost
                    )} है ✘`}

              </div>

              <div
                className="row"
                style={{
                  marginTop: 12,
                }}
              >

                <button
                  className="btn b1"
                  onClick={
                    saveMaster
                  }
                >
                  सुरक्षित करें
                </button>

                <button
                  className="btn b2"
                  onClick={
                    resetMaster
                  }
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

              <p
                className="sub"
                style={{
                  marginBottom: 10,
                }}
              >
                जिस किस्म को खोलना हो
                उस पर टैप करें। मात्रा या
                दर बदलते ही राशि और जाँच
                अपने आप बदल जाएगी।
              </p>

              {standards.map(
                (standard) => {
                  const c =
                    standardObject(
                      standard
                    );

                  const t =
                    totals(c);

                  const okTotal =
                    Math.abs(
                      t.total -
                        Number(
                          master.project_cost
                        )
                    ) < 0.5;

                  const okSubsidy =
                    Math.abs(
                      t.subsidy -
                        Number(
                          master.max_subsidy
                        )
                    ) < 0.5;

                  return (
                    <details
                      key={
                        standard.id
                      }
                      open={
                        !!openStandard[
                          standard.id
                        ]
                      }
                      onToggle={(e) =>
                        setOpenStandard(
                          (p) => ({
                            ...p,
                            [standard.id]:
                              e.currentTarget
                                .open,
                          })
                        )
                      }
                    >

                      <summary>

                        {
                          standard.variety_name
                        }

                        <span
                          className={`tag ${
                            okTotal &&
                            okSubsidy
                              ? "ok"
                              : "bad"
                          }`}
                        >
                          {okTotal &&
                          okSubsidy
                            ? "✔ मानक सही"
                            : "✘ जाँचें"}
                        </span>

                        <span className="tag n">
                          {gm(
                            t.gmha
                          )}
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

                          <table
                            style={{
                              minWidth:
                                520,
                            }}
                          >

                            <thead>

                              <tr>

                                <th>
                                  मद
                                </th>

                                <th>
                                  इकाई
                                </th>

                                <th>
                                  मात्रा
                                </th>

                                <th>
                                  दर (₹)
                                </th>

                                <th>
                                  राशि (₹)
                                </th>

                              </tr>

                            </thead>

                            <tbody>

                              {[
                                1,
                                2,
                                3,
                                4,
                              ].map(
                                (itemNo) => (
                                  <tr
                                    key={
                                      itemNo
                                    }
                                  >

                                    <td className="l">
                                      {
                                        standard[
                                          `item${itemNo}_label`
                                        ]
                                      }
                                    </td>

                                    <td>
                                      {
                                        standard[
                                          `item${itemNo}_unit`
                                        ]
                                      }
                                    </td>

                                    <td>

                                      <input
                                        type="number"
                                        step="0.0001"
                                        value={
                                          standard[
                                            `item${itemNo}_qty`
                                          ]
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          setData(
                                            (
                                              previous
                                            ) => ({
                                              ...previous,

                                              standards:
                                                previous.standards.map(
                                                  (
                                                    x
                                                  ) =>
                                                    x.id ===
                                                    standard.id
                                                      ? {
                                                          ...x,

                                                          [`item${itemNo}_qty`]:
                                                            e
                                                              .target
                                                              .value,
                                                        }
                                                      : x
                                                ),
                                            })
                                          )
                                        }
                                      />

                                    </td>

                                    <td>

                                      <input
                                        type="number"
                                        step="0.01"
                                        value={
                                          standard[
                                            `item${itemNo}_rate`
                                          ]
                                        }
                                        onChange={(
                                          e
                                        ) =>
                                          setData(
                                            (
                                              previous
                                            ) => ({
                                              ...previous,

                                              standards:
                                                previous.standards.map(
                                                  (
                                                    x
                                                  ) =>
                                                    x.id ===
                                                    standard.id
                                                      ? {
                                                          ...x,

                                                          [`item${itemNo}_rate`]:
                                                            e
                                                              .target
                                                              .value,
                                                        }
                                                      : x
                                                ),
                                            })
                                          )
                                        }
                                      />

                                    </td>

                                    <td>
                                      {money(
                                        Number(
                                          standard[
                                            `item${itemNo}_qty`
                                          ]
                                        ) *
                                          Number(
                                            standard[
                                              `item${itemNo}_rate`
                                            ]
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
                            okTotal &&
                            okSubsidy
                              ? "ok"
                              : "bad"
                          }`}
                          style={{
                            marginTop: 10,
                          }}
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
                          {okTotal &&
                          okSubsidy
                            ? "— मानक सही ✔"
                            : "— मानक से भिन्न ✘"}
                        </div>

                        <button
                          className="btn b1 sm"
                          style={{
                            marginTop: 10,
                          }}
                          onClick={() =>
                            saveStandard(
                              standard
                            )
                          }
                        >
                          सुरक्षित करें
                        </button>

                      </div>

                    </details>
                  );
                }
              )}

              <div
                className="row"
                style={{
                  marginTop: 10,
                }}
              >

                <button
                  className="btn b2 sm"
                  onClick={
                    resetAllStandards
                  }
                >
                  सभी मानक मूल स्थिति
                  पर लौटाएँ
                </button>

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            REPORT
        ================================================= */}

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
                  🖨 पूरा रजिस्टर
                  छापें
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

                      ${reportRows
                        .map(
                          (r) => `
                            <p>
                              <b>
                                ${r.v.name}
                              </b>
                              —
                              कुल क्रय:
                              ${money(
                                r.purchase
                              )},
                              आवंटित:
                              ${gm(
                                r.allocated
                              )} ग्राम,
                              केन्द्रीय शेष:
                              ${gm(
                                r.central
                              )} ग्राम,
                              किसानों को:
                              ${gm(
                                r.distributed
                              )} ग्राम,
                              क्षेत्रफल:
                              ${n(
                                r.area,
                                4
                              )} है0,
                              परियोजना लागत:
                              ${money(
                                r.project
                              )}
                            </p>
                          `
                        )
                        .join("")}
                      `,
                      "किस्मवार सारांश"
                    )
                  }
                >
                  🖨 किस्मवार
                  सारांश छापें
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
                        "टिप्पणी",
                      ],

                      entries.map(
                        (
                          e,
                          i
                        ) => [
                          i + 1,
                          dmy(
                            e.date
                          ),
                          e.centre_name,
                          e.variety_name,
                          e.name,
                          e.father,
                          e.village,
                          e.mobile,
                          e.area,
                          e.item1_qty,
                          e.item1_amount,
                          e.seed_gm,
                          e.item2_amount,
                          e.item3_qty,
                          e.item3_amount,
                          e.item4_qty,
                          e.item4_amount,
                          e.total,
                          e.subsidy,
                          e.farmer,
                          e.sign1,
                          e.sign2,
                          e.note,
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

            <div className="card table-card">

              <div className="tw">

                <table>

                  <thead>

                    <tr>

                      <th>
                        किस्म
                      </th>

                      <th>
                        कुल क्रय
                        (₹)
                      </th>

                      <th>
                        शेष क्रय
                        क्षमता (₹)
                      </th>

                      <th>
                        क्रय मात्रा
                        (ग्राम)
                      </th>

                      <th>
                        केन्द्रों को
                        आवंटित
                      </th>

                      <th>
                        केन्द्रीय
                        शेष
                      </th>

                      <th>
                        किसानों को
                        वितरित
                      </th>

                      <th>
                        क्षेत्रफल
                        (है0)
                      </th>

                      <th>
                        परियोजना
                        लागत (₹)
                      </th>

                      <th>
                        किसान
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {reportRows.map(
                      (row) => (
                        <tr
                          key={
                            row.v.id
                          }
                        >

                          <td className="l">
                            {
                              row.v.name
                            }
                          </td>

                          <td>
                            {money(
                              row.purchase
                            )}
                          </td>

                          <td
                            className={
                              row.remaining <=
                              0.5
                                ? "neg"
                                : ""
                            }
                          >
                            {money(
                              row.remaining
                            )}
                          </td>

                          <td>
                            {gm(
                              row.purchaseGm
                            )}
                          </td>

                          <td>
                            {gm(
                              row.allocated
                            )}
                          </td>

                          <td
                            className={
                              row.central <
                              0
                                ? "neg"
                                : ""
                            }
                          >
                            {gm(
                              row.central
                            )}
                          </td>

                          <td>
                            {gm(
                              row.distributed
                            )}
                          </td>

                          <td>
                            {n(
                              row.area,
                              4
                            )}
                          </td>

                          <td>
                            {money(
                              row.project
                            )}
                          </td>

                          <td>
                            {
                              row.count
                            }
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
                              s +
                              r.purchase,
                            0
                          )
                        )}
                      </td>

                      <td>
                        {money(
                          reportRows.reduce(
                            (s, r) =>
                              s +
                              r.remaining,
                            0
                          )
                        )}
                      </td>

                      <td>
                        {gm(
                          reportRows.reduce(
                            (s, r) =>
                              s +
                              r.purchaseGm,
                            0
                          )
                        )}
                      </td>

                      <td>
                        {gm(
                          reportRows.reduce(
                            (s, r) =>
                              s +
                              r.allocated,
                            0
                          )
                        )}
                      </td>

                      <td>
                        {gm(
                          reportRows.reduce(
                            (s, r) =>
                              s +
                              r.central,
                            0
                          )
                        )}
                      </td>

                      <td>
                        {gm(
                          entries.reduce(
                            (s, e) =>
                              s +
                              Number(
                                e.seed_gm ||
                                  0
                              ),
                            0
                          )
                        )}
                      </td>

                      <td>
                        {n(
                          reportRows.reduce(
                            (s, r) =>
                              s +
                              r.area,
                            0
                          ),
                          4
                        )}
                      </td>

                      <td>
                        {money(
                          reportRows.reduce(
                            (s, r) =>
                              s +
                              r.project,
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
                  (check, i) => (
                    <li key={i}>

                      <span
                        className={`i ${
                          check.ok
                            ? "ok"
                            : "bad"
                        }`}
                      >
                        {check.ok
                          ? "✔"
                          : "✘"}
                      </span>

                      <span>
                        {check.t}
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

        किसान बीज वितरण —
        सरल प्रणाली ·
        जिला कार्ययोजना 2026-27 ·
        उद्यान विशेषज्ञ कार्यालय,
        कोटद्वार गढ़वाल

        <br />

        डेटा सर्वर पर सुरक्षित रहता है —
        नियमित CSV निर्यात व छपी प्रति
        अवश्य रखें।

      </footer>

    </div>
  );
}