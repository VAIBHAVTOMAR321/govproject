import React, { useEffect, useMemo, useState } from "react";
import "./UdyanBill.css";

/*
|--------------------------------------------------------------------------
| API BASE
|--------------------------------------------------------------------------
| Change this only if your Django API is hosted on another base URL.
*/
const API_BASE = "/api/udyan";


/*
|--------------------------------------------------------------------------
| CSRF HELPER
|--------------------------------------------------------------------------
*/
const getCookie = (name) => {
    const cookies = document.cookie ? document.cookie.split("; ") : [];

    const cookie = cookies.find((row) =>
        row.startsWith(`${name}=`)
    );

    return cookie
        ? decodeURIComponent(cookie.substring(name.length + 1))
        : "";
};


/*
|--------------------------------------------------------------------------
| API HELPER
|--------------------------------------------------------------------------
*/
const apiFetch = async (url, options = {}) => {
    const method = (options.method || "GET").toUpperCase();

    const headers = {
        ...(options.headers || {}),
    };

    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        headers["X-CSRFToken"] = getCookie("csrftoken");
    }

    const response = await fetch(url, {
        ...options,
        method,
        headers,
        credentials: "include",
    });

    return response;
};


/*
|--------------------------------------------------------------------------
| EMPTY STANDARD
|--------------------------------------------------------------------------
*/
const emptyStandard = {
    financial_year: "",
    crop_name: "",
    spacing: "",
    plants_per_hectare: "",
    plant_rate: "",
    pit_rate: "",
    manure_rate: "",
    manure_quantity: "",
    standard_total: "",
    standard_subsidy: "",
    is_active: true,
};


/*
|--------------------------------------------------------------------------
| EMPTY BILL
|--------------------------------------------------------------------------
*/
const emptyBill = {
    financial_year: "2026-27",

    crop: "",

    area: "",
    plants: "",

    calculation_basis: "area",
    rounding: "paise",

    caste: "",
    scheme_name: "",

    farmer_name: "",
    father_husband_name: "",
    date_of_birth: "",

    village: "",
    center: "",

    bank_name_1: "",
    bank_name_2: "",
    account_number: "",
    ifsc_code: "",

    aadhaar_number: "",
    mobile_number: "",
    pan_number: "",

    supplier_name: "",
    supplier_mobile: "",
    supplier_address: "",

    labour_name: "",
    labour_mobile: "",
    labour_address: "",

    voucher_2: true,
};


/*
|--------------------------------------------------------------------------
| NUMBER HELPER
|--------------------------------------------------------------------------
*/
const numberValue = (value) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
};


/*
|--------------------------------------------------------------------------
| ROUNDING
|--------------------------------------------------------------------------
*/
const roundMoney = (value, rounding) => {
    if (rounding === "whole") {
        return Math.round(value);
    }

    return Math.round(value * 100) / 100;
};


/*
|--------------------------------------------------------------------------
| FORMAT MONEY
|--------------------------------------------------------------------------
*/
const formatMoney = (value, rounding = "paise") => {
    const amount = roundMoney(numberValue(value), rounding);

    return new Intl.NumberFormat("en-IN", {
        minimumFractionDigits: rounding === "whole" ? 0 : 2,
        maximumFractionDigits: rounding === "whole" ? 0 : 2,
    }).format(amount);
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/
const UdyanBill = () => {

    /*
    |--------------------------------------------------------------------------
    | MAIN STATE
    |--------------------------------------------------------------------------
    */
    const [financialYear, setFinancialYear] = useState("2026-27");

    const [bill, setBill] = useState(emptyBill);

    const [standards, setStandards] = useState([]);

    const [selectedCropId, setSelectedCropId] = useState("");

    const [loadingStandards, setLoadingStandards] = useState(false);

    const [savingBill, setSavingBill] = useState(false);

    const [activePage, setActivePage] = useState("bill");

    const [savedBill, setSavedBill] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | STANDARD MODAL
    |--------------------------------------------------------------------------
    */
    const [showStandardModal, setShowStandardModal] = useState(false);

    const [editingStandard, setEditingStandard] = useState(null);

    const [standardForm, setStandardForm] = useState({
        ...emptyStandard,
        financial_year: financialYear,
    });

    const [savingStandard, setSavingStandard] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | MESSAGE
    |--------------------------------------------------------------------------
    */
    const [message, setMessage] = useState({
        type: "",
        text: "",
    });


    /*
    |--------------------------------------------------------------------------
    | LOAD STANDARDS
    |--------------------------------------------------------------------------
    */
    const loadStandards = async () => {

        setLoadingStandards(true);

        try {
            const response = await apiFetch(
                `${API_BASE}/crop-standards/?financial_year=${encodeURIComponent(
                    financialYear
                )}`,
                {
                    method: "GET",
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load crop standards.");
            }

            const data = await response.json();

            const list = Array.isArray(data)
                ? data
                : data.results || [];

            setStandards(list);

            /*
            |--------------------------------------------------------------------------
            | If currently selected crop no longer exists,
            | clear it.
            |--------------------------------------------------------------------------
            */
            if (
                selectedCropId &&
                !list.some(
                    (item) =>
                        String(item.id) ===
                        String(selectedCropId)
                )
            ) {
                setSelectedCropId("");
            }

        } catch (error) {
            console.error(error);

            setMessage({
                type: "error",
                text: "Crop standards could not be loaded.",
            });

        } finally {
            setLoadingStandards(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | LOAD WHEN YEAR CHANGES
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        loadStandards();

        setSelectedCropId("");

        setBill((previous) => ({
            ...previous,
            financial_year: financialYear,
            crop: "",
        }));
    }, [financialYear]);


    /*
    |--------------------------------------------------------------------------
    | SELECTED STANDARD
    |--------------------------------------------------------------------------
    */
    const selectedStandard = useMemo(() => {

        return standards.find(
            (standard) =>
                String(standard.id) ===
                String(selectedCropId)
        ) || null;

    }, [standards, selectedCropId]);


    /*
    |--------------------------------------------------------------------------
    | UPDATE BILL FIELD
    |--------------------------------------------------------------------------
    */
    const updateBill = (field, value) => {

        setBill((previous) => ({
            ...previous,
            [field]: value,
        }));
    };


    /*
    |--------------------------------------------------------------------------
    | CROP CHANGE
    |--------------------------------------------------------------------------
    */
    const handleCropChange = (event) => {

        const cropId = event.target.value;

        setSelectedCropId(cropId);

        setBill((previous) => ({
            ...previous,
            crop: cropId,
        }));

    };


    /*
    |--------------------------------------------------------------------------
    | CALCULATE PLANTS
    |--------------------------------------------------------------------------
    */
    const calculatedPlants = useMemo(() => {

        if (!selectedStandard) {
            return numberValue(bill.plants);
        }

        if (bill.calculation_basis === "area") {

            const area = numberValue(bill.area);

            return Math.round(
                area *
                numberValue(
                    selectedStandard.plants_per_hectare
                )
            );
        }

        return numberValue(bill.plants);

    }, [
        bill.area,
        bill.plants,
        bill.calculation_basis,
        selectedStandard,
    ]);


    /*
    |--------------------------------------------------------------------------
    | CALCULATIONS
    |--------------------------------------------------------------------------
    */
    const calculations = useMemo(() => {

        if (!selectedStandard) {
            return {
                plants: 0,
                plantTotal: 0,
                pitTotal: 0,
                manureTotal: 0,
                manureQuantity: 0,
                plantSubsidy: 0,
                manureSubsidy: 0,
                grandTotal: 0,
                grandSubsidy: 0,
                farmerContribution: 0,
            };
        }

        const plants = calculatedPlants;

        const plantRate = numberValue(
            selectedStandard.plant_rate
        );

        const pitRate = numberValue(
            selectedStandard.pit_rate
        );

        const manureRate = numberValue(
            selectedStandard.manure_rate
        );

        const standardTotal = numberValue(
            selectedStandard.standard_total
        );

        const standardSubsidy = numberValue(
            selectedStandard.standard_subsidy
        );


        /*
        |--------------------------------------------------------------------------
        | Plant Total
        |--------------------------------------------------------------------------
        */
        const plantTotal = plants * plantRate;


        /*
        |--------------------------------------------------------------------------
        | Pit Total
        |--------------------------------------------------------------------------
        */
        const pitTotal = plants * pitRate;


        /*
        |--------------------------------------------------------------------------
        | Manure Total
        |--------------------------------------------------------------------------
        */
        const manureTotal = Math.max(
            0,
            standardTotal - plantRate * plants - pitRate * plants
        );


        /*
        |--------------------------------------------------------------------------
        | Manure Quantity
        |--------------------------------------------------------------------------
        */
        const manureQuantity =
            manureRate > 0
                ? manureTotal / manureRate
                : 0;


        /*
        |--------------------------------------------------------------------------
        | Plant Subsidy
        |--------------------------------------------------------------------------
        */
        const plantSubsidy = Math.min(
            plantTotal,
            standardSubsidy
        );


        /*
        |--------------------------------------------------------------------------
        | Manure Subsidy
        |--------------------------------------------------------------------------
        */
        const manureSubsidy = Math.min(
            Math.max(
                0,
                standardSubsidy - plantSubsidy
            ),
            manureTotal
        );


        /*
        |--------------------------------------------------------------------------
        | Grand Total
        |--------------------------------------------------------------------------
        */
        const grandTotal =
            plantTotal +
            pitTotal +
            manureTotal;


        /*
        |--------------------------------------------------------------------------
        | Grand Subsidy
        |--------------------------------------------------------------------------
        */
        const grandSubsidy =
            plantSubsidy +
            manureSubsidy;


        /*
        |--------------------------------------------------------------------------
        | Farmer Contribution
        |--------------------------------------------------------------------------
        */
        const farmerContribution =
            grandTotal -
            grandSubsidy;


        return {
            plants: roundMoney(
                plants,
                bill.rounding
            ),

            plantTotal: roundMoney(
                plantTotal,
                bill.rounding
            ),

            pitTotal: roundMoney(
                pitTotal,
                bill.rounding
            ),

            manureTotal: roundMoney(
                manureTotal,
                bill.rounding
            ),

            manureQuantity: roundMoney(
                manureQuantity,
                bill.rounding
            ),

            plantSubsidy: roundMoney(
                plantSubsidy,
                bill.rounding
            ),

            manureSubsidy: roundMoney(
                manureSubsidy,
                bill.rounding
            ),

            grandTotal: roundMoney(
                grandTotal,
                bill.rounding
            ),

            grandSubsidy: roundMoney(
                grandSubsidy,
                bill.rounding
            ),

            farmerContribution: roundMoney(
                farmerContribution,
                bill.rounding
            ),
        };

    }, [
        selectedStandard,
        calculatedPlants,
        bill.rounding,
    ]);


    /*
    |--------------------------------------------------------------------------
    | OPEN ADD STANDARD
    |--------------------------------------------------------------------------
    */
    const openAddStandard = () => {

        setEditingStandard(null);

        setStandardForm({
            ...emptyStandard,
            financial_year: financialYear,
        });

        setShowStandardModal(true);
    };


    /*
    |--------------------------------------------------------------------------
    | OPEN EDIT STANDARD
    |--------------------------------------------------------------------------
    */
    const openEditStandard = (standard) => {

        setEditingStandard(standard);

        setStandardForm({
            financial_year:
                standard.financial_year || financialYear,

            crop_name:
                standard.crop_name || "",

            spacing:
                standard.spacing || "",

            plants_per_hectare:
                standard.plants_per_hectare ?? "",

            plant_rate:
                standard.plant_rate ?? "",

            pit_rate:
                standard.pit_rate ?? "",

            manure_rate:
                standard.manure_rate ?? "",

            manure_quantity:
                standard.manure_quantity ?? "",

            standard_total:
                standard.standard_total ?? "",

            standard_subsidy:
                standard.standard_subsidy ?? "",

            is_active:
                standard.is_active !== false,
        });

        setShowStandardModal(true);
    };


    /*
    |--------------------------------------------------------------------------
    | CLOSE STANDARD MODAL
    |--------------------------------------------------------------------------
    */
    const closeStandardModal = () => {

        setShowStandardModal(false);

        setEditingStandard(null);

        setStandardForm({
            ...emptyStandard,
            financial_year: financialYear,
        });
    };


    /*
    |--------------------------------------------------------------------------
    | UPDATE STANDARD FORM
    |--------------------------------------------------------------------------
    */
    const updateStandardForm = (field, value) => {

        setStandardForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };


    /*
    |--------------------------------------------------------------------------
    | SAVE STANDARD
    |--------------------------------------------------------------------------
    */
    const saveStandard = async () => {

        if (!standardForm.financial_year.trim()) {
            alert("Please enter financial year.");
            return;
        }

        if (!standardForm.crop_name.trim()) {
            alert("Please enter crop name.");
            return;
        }

        if (!standardForm.spacing.trim()) {
            alert("Please enter spacing.");
            return;
        }

        if (
            standardForm.standard_total === "" ||
            numberValue(standardForm.standard_total) < 0
        ) {
            alert("Please enter a valid standard total.");
            return;
        }

        if (
            numberValue(standardForm.standard_subsidy) >
            numberValue(standardForm.standard_total)
        ) {
            alert(
                "Subsidy cannot be greater than standard total."
            );
            return;
        }


        setSavingStandard(true);

        const isEditing = Boolean(editingStandard);

        const url = isEditing
            ? `${API_BASE}/crop-standards/${editingStandard.id}/`
            : `${API_BASE}/crop-standards/`;

        const method = isEditing ? "PUT" : "POST";


        const payload = {
            financial_year:
                standardForm.financial_year.trim(),

            crop_name:
                standardForm.crop_name.trim(),

            spacing:
                standardForm.spacing.trim(),

            plants_per_hectare:
                numberValue(
                    standardForm.plants_per_hectare
                ),

            plant_rate:
                numberValue(
                    standardForm.plant_rate
                ),

            pit_rate:
                numberValue(
                    standardForm.pit_rate
                ),

            manure_rate:
                numberValue(
                    standardForm.manure_rate
                ),

            manure_quantity:
                numberValue(
                    standardForm.manure_quantity
                ),

            standard_total:
                numberValue(
                    standardForm.standard_total
                ),

            standard_subsidy:
                numberValue(
                    standardForm.standard_subsidy
                ),

            is_active:
                Boolean(standardForm.is_active),
        };


        try {

            const response = await apiFetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });


            const data = await response.json().catch(
                () => ({})
            );


            if (!response.ok) {

                console.error(data);

                const backendMessage =
                    data?.detail ||
                    data?.error ||
                    Object.values(data || {})
                        .flat()
                        .join(" ");

                throw new Error(
                    backendMessage ||
                    "Unable to save standard."
                );
            }


            closeStandardModal();

            await loadStandards();

            setMessage({
                type: "success",
                text: isEditing
                    ? "Crop standard updated successfully."
                    : "Crop standard added successfully.",
            });

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Unable to save crop standard."
            );

        } finally {

            setSavingStandard(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | DELETE STANDARD
    |--------------------------------------------------------------------------
    */
    const deleteStandard = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this crop standard?"
        );

        if (!confirmed) {
            return;
        }


        try {

            const response = await apiFetch(
                `${API_BASE}/crop-standards/${id}/`,
                {
                    method: "DELETE",
                }
            );


            if (!response.ok) {

                const data = await response.json().catch(
                    () => ({})
                );

                throw new Error(
                    data?.detail ||
                    "Unable to delete standard."
                );
            }


            if (
                String(selectedCropId) ===
                String(id)
            ) {
                setSelectedCropId("");

                setBill((previous) => ({
                    ...previous,
                    crop: "",
                }));
            }


            await loadStandards();

            setMessage({
                type: "success",
                text: "Crop standard deleted successfully.",
            });

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Unable to delete standard."
            );
        }
    };


    /*
    |--------------------------------------------------------------------------
    | SAVE BILL
    |--------------------------------------------------------------------------
    */
    const saveBill = async () => {

        if (!selectedStandard) {
            alert("Please select a crop.");
            return;
        }

        if (!bill.financial_year) {
            alert("Please select financial year.");
            return;
        }

        if (!bill.farmer_name.trim()) {
            alert("Please enter farmer name.");
            return;
        }


        setSavingBill(true);


        const payload = {
            ...bill,

            crop: Number(selectedCropId),

            financial_year:
                bill.financial_year,

            area:
                numberValue(bill.area),

            plants:
                calculations.plants,

            calculation_basis:
                bill.calculation_basis,

            rounding:
                bill.rounding,

            plant_total:
                calculations.plantTotal,

            pit_total:
                calculations.pitTotal,

            manure_quantity:
                calculations.manureQuantity,

            manure_total:
                calculations.manureTotal,

            plant_subsidy:
                calculations.plantSubsidy,

            pit_subsidy:
                0,

            manure_subsidy:
                calculations.manureSubsidy,

            farmer_contribution:
                calculations.farmerContribution,

            grand_total:
                calculations.grandTotal,

            grand_subsidy:
                calculations.grandSubsidy,
        };


        try {

            const response = await apiFetch(
                `${API_BASE}/bills/`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(payload),
                }
            );


            const data = await response.json().catch(
                () => ({})
            );


            if (!response.ok) {

                console.error(data);

                const backendMessage =
                    data?.detail ||
                    data?.error ||
                    Object.values(data || {})
                        .flat()
                        .join(" ");

                throw new Error(
                    backendMessage ||
                    "Unable to save bill."
                );
            }


            setSavedBill(data);

            setMessage({
                type: "success",
                text: "Bill saved successfully.",
            });

        } catch (error) {

            console.error(error);

            alert(
                error.message ||
                "Unable to save bill."
            );

        } finally {

            setSavingBill(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | RESET BILL
    |--------------------------------------------------------------------------
    */
    const resetBill = () => {

        setBill({
            ...emptyBill,
            financial_year: financialYear,
        });

        setSelectedCropId("");

        setSavedBill(null);

        setMessage({
            type: "",
            text: "",
        });
    };


    /*
    |--------------------------------------------------------------------------
    | PRINT
    |--------------------------------------------------------------------------
    */
    const handlePrint = () => {
        window.print();
    };


    /*
    |--------------------------------------------------------------------------
    | INPUT COMPONENT
    |--------------------------------------------------------------------------
    */
    const InputField = ({
        label,
        field,
        type = "text",
        placeholder = "",
    }) => (
        <div className="udyan-form-group">

            <label>
                {label}
            </label>

            <input
                type={type}
                value={bill[field] ?? ""}
                placeholder={placeholder}
                onChange={(event) =>
                    updateBill(
                        field,
                        event.target.value
                    )
                }
            />

        </div>
    );


    /*
    |--------------------------------------------------------------------------
    | STANDARD MANAGEMENT
    |--------------------------------------------------------------------------
    */
    const renderStandards = () => (
        <section className="udyan-card standards-card">

            <div className="standards-header">

                <div>
                    <h2>
                        Crop Standards
                    </h2>

                    <p>
                        Add and manage crop-wise
                        standards for {financialYear}.
                    </p>
                </div>

                <button
                    type="button"
                    className="udyan-btn primary"
                    onClick={openAddStandard}
                >
                    + Add Standard
                </button>

            </div>


            {loadingStandards ? (
                <div className="empty-state">
                    Loading crop standards...
                </div>
            ) : standards.length === 0 ? (

                <div className="empty-state">

                    <div className="empty-icon">
                        +
                    </div>

                    <h3>
                        No crop standards added
                    </h3>

                    <p>
                        The reference crops are not
                        predefined. Add your first
                        crop standard manually.
                    </p>

                    <button
                        type="button"
                        className="udyan-btn primary"
                        onClick={openAddStandard}
                    >
                        Add First Standard
                    </button>

                </div>

            ) : (

                <div className="standards-table-wrapper">

                    <table className="standards-table">

                        <thead>
                            <tr>
                                <th>Crop</th>
                                <th>Year</th>
                                <th>Spacing</th>
                                <th>Plants / Ha</th>
                                <th>Plant Rate</th>
                                <th>Pit Rate</th>
                                <th>Manure Rate</th>
                                <th>Manure Qty</th>
                                <th>Total</th>
                                <th>Subsidy</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {standards.map(
                                (standard) => (

                                    <tr
                                        key={
                                            standard.id
                                        }
                                    >

                                        <td>
                                            <strong>
                                                {
                                                    standard.crop_name
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {
                                                standard.financial_year
                                            }
                                        </td>

                                        <td>
                                            {
                                                standard.spacing
                                            }
                                        </td>

                                        <td>
                                            {
                                                standard.plants_per_hectare
                                            }
                                        </td>

                                        <td>
                                            ₹
                                            {
                                                standard.plant_rate
                                            }
                                        </td>

                                        <td>
                                            ₹
                                            {
                                                standard.pit_rate
                                            }
                                        </td>

                                        <td>
                                            ₹
                                            {
                                                standard.manure_rate
                                            }
                                        </td>

                                        <td>
                                            {
                                                standard.manure_quantity
                                            }
                                        </td>

                                        <td>
                                            ₹
                                            {
                                                standard.standard_total
                                            }
                                        </td>

                                        <td>
                                            ₹
                                            {
                                                standard.standard_subsidy
                                            }
                                        </td>

                                        <td>

                                            <div className="standard-actions">

                                                <button
                                                    type="button"
                                                    className="table-action edit"
                                                    onClick={() =>
                                                        openEditStandard(
                                                            standard
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="table-action delete"
                                                    onClick={() =>
                                                        deleteStandard(
                                                            standard.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </section>
    );


    /*
    |--------------------------------------------------------------------------
    | BILL FORM
    |--------------------------------------------------------------------------
    */
    const renderBill = () => (
        <>

            <section className="udyan-card">

                <div className="section-heading">
                    <div>
                        <span className="section-number">
                            01
                        </span>

                        <div>
                            <h2>
                                Crop & Calculation
                            </h2>

                            <p>
                                Select the crop standard
                                created by the user.
                            </p>
                        </div>
                    </div>
                </div>


                <div className="udyan-form-grid">

                    <div className="udyan-form-group">

                        <label>
                            Financial Year
                        </label>

                        <select
                            value={financialYear}
                            onChange={(event) =>
                                setFinancialYear(
                                    event.target.value
                                )
                            }
                        >
                            <option value="2026-27">
                                2026-27
                            </option>

                            <option value="2027-28">
                                2027-28
                            </option>

                            <option value="2028-29">
                                2028-29
                            </option>
                        </select>

                    </div>


                    <div className="udyan-form-group">

                        <label>
                            Crop
                        </label>

                        <select
                            value={selectedCropId}
                            onChange={
                                handleCropChange
                            }
                        >

                            <option value="">
                                Select Crop
                            </option>

                            {standards.map(
                                (standard) => (

                                    <option
                                        key={
                                            standard.id
                                        }
                                        value={
                                            standard.id
                                        }
                                    >
                                        {
                                            standard.crop_name
                                        }
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    <div className="udyan-form-group">

                        <label>
                            Calculation Basis
                        </label>

                        <select
                            value={
                                bill.calculation_basis
                            }
                            onChange={(event) =>
                                updateBill(
                                    "calculation_basis",
                                    event.target.value
                                )
                            }
                        >

                            <option value="area">
                                Area Based
                            </option>

                            <option value="plant">
                                Actual Plant Based
                            </option>

                        </select>

                    </div>


                    <InputField
                        label="Area (Hectare)"
                        field="area"
                        type="number"
                        placeholder="Enter area"
                    />


                    <div className="udyan-form-group">

                        <label>
                            Plants
                        </label>

                        <input
                            type="number"
                            value={
                                bill.calculation_basis ===
                                "area"
                                    ? calculatedPlants
                                    : bill.plants
                            }
                            disabled={
                                bill.calculation_basis ===
                                "area"
                            }
                            onChange={(event) =>
                                updateBill(
                                    "plants",
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    <div className="udyan-form-group">

                        <label>
                            Rounding
                        </label>

                        <select
                            value={bill.rounding}
                            onChange={(event) =>
                                updateBill(
                                    "rounding",
                                    event.target.value
                                )
                            }
                        >

                            <option value="paise">
                                Rupees + Paise
                            </option>

                            <option value="whole">
                                Whole Rupees
                            </option>

                        </select>

                    </div>

                </div>


                {selectedStandard && (

                    <div className="selected-standard-box">

                        <div>
                            <span>
                                Selected Standard
                            </span>

                            <strong>
                                {
                                    selectedStandard.crop_name
                                }
                            </strong>
                        </div>

                        <div>
                            <span>
                                Spacing
                            </span>

                            <strong>
                                {
                                    selectedStandard.spacing
                                }
                            </strong>
                        </div>

                        <div>
                            <span>
                                Plants / Ha
                            </span>

                            <strong>
                                {
                                    selectedStandard.plants_per_hectare
                                }
                            </strong>
                        </div>

                        <div>
                            <span>
                                Standard Total
                            </span>

                            <strong>
                                ₹
                                {formatMoney(
                                    selectedStandard.standard_total,
                                    bill.rounding
                                )}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Standard Subsidy
                            </span>

                            <strong>
                                ₹
                                {formatMoney(
                                    selectedStandard.standard_subsidy,
                                    bill.rounding
                                )}
                            </strong>
                        </div>

                    </div>

                )}

            </section>


            <section className="udyan-card">

                <div className="section-heading">

                    <div>

                        <span className="section-number">
                            02
                        </span>

                        <div>

                            <h2>
                                Farmer Details
                            </h2>

                            <p>
                                Enter farmer and scheme
                                information.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="udyan-form-grid">

                    <InputField
                        label="Caste"
                        field="caste"
                    />

                    <InputField
                        label="Scheme / Mad"
                        field="scheme_name"
                    />

                    <InputField
                        label="Farmer Name"
                        field="farmer_name"
                    />

                    <InputField
                        label="Father / Husband Name"
                        field="father_husband_name"
                    />

                    <InputField
                        label="Date of Birth"
                        field="date_of_birth"
                        type="date"
                    />

                    <InputField
                        label="Village"
                        field="village"
                    />

                    <InputField
                        label="Center"
                        field="center"
                    />

                    <InputField
                        label="Mobile Number"
                        field="mobile_number"
                    />

                    <InputField
                        label="Aadhaar Number"
                        field="aadhaar_number"
                    />

                    <InputField
                        label="PAN Number"
                        field="pan_number"
                    />

                </div>

            </section>


            <section className="udyan-card">

                <div className="section-heading">

                    <div>

                        <span className="section-number">
                            03
                        </span>

                        <div>

                            <h2>
                                Bank Details
                            </h2>

                            <p>
                                Enter farmer bank account
                                information.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="udyan-form-grid">

                    <InputField
                        label="Bank Name 1"
                        field="bank_name_1"
                    />

                    <InputField
                        label="Bank Name 2"
                        field="bank_name_2"
                    />

                    <InputField
                        label="Account Number"
                        field="account_number"
                    />

                    <InputField
                        label="IFSC Code"
                        field="ifsc_code"
                    />

                </div>

            </section>


            <section className="udyan-card">

                <div className="section-heading">

                    <div>

                        <span className="section-number">
                            04
                        </span>

                        <div>

                            <h2>
                                Supplier Details
                            </h2>

                            <p>
                                Enter supplier information.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="udyan-form-grid">

                    <InputField
                        label="Supplier Name"
                        field="supplier_name"
                    />

                    <InputField
                        label="Supplier Mobile"
                        field="supplier_mobile"
                    />

                    <div className="udyan-form-group full-width">

                        <label>
                            Supplier Address
                        </label>

                        <textarea
                            value={
                                bill.supplier_address
                            }
                            onChange={(event) =>
                                updateBill(
                                    "supplier_address",
                                    event.target.value
                                )
                            }
                            rows="3"
                        />

                    </div>

                </div>

            </section>


            <section className="udyan-card">

                <div className="section-heading">

                    <div>

                        <span className="section-number">
                            05
                        </span>

                        <div>

                            <h2>
                                Labour Details
                            </h2>

                            <p>
                                Enter labour information.
                            </p>

                        </div>

                    </div>

                </div>


                <div className="udyan-form-grid">

                    <InputField
                        label="Labour Name"
                        field="labour_name"
                    />

                    <InputField
                        label="Labour Mobile"
                        field="labour_mobile"
                    />

                    <div className="udyan-form-group full-width">

                        <label>
                            Labour Address
                        </label>

                        <textarea
                            value={
                                bill.labour_address
                            }
                            onChange={(event) =>
                                updateBill(
                                    "labour_address",
                                    event.target.value
                                )
                            }
                            rows="3"
                        />

                    </div>

                </div>

            </section>


            <section className="udyan-card calculation-card">

                <div className="section-heading">

                    <div>

                        <span className="section-number">
                            06
                        </span>

                        <div>

                            <h2>
                                Bill Calculation
                            </h2>

                            <p>
                                Calculated automatically
                                from the selected database
                                standard.
                            </p>

                        </div>

                    </div>

                </div>


                {!selectedStandard ? (

                    <div className="calculation-empty">
                        Select a crop to view calculations.
                    </div>

                ) : (

                    <div className="calculation-table-wrapper">

                        <table className="calculation-table">

                            <thead>
                                <tr>
                                    <th>
                                        Work / Item
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Total Expenditure
                                    </th>

                                    <th>
                                        Subsidy
                                    </th>

                                    <th>
                                        Farmer Contribution
                                    </th>
                                </tr>
                            </thead>

                            <tbody>

                                <tr>

                                    <td>
                                        Plant Material
                                    </td>

                                    <td>
                                        {
                                            calculations.plants
                                        }
                                    </td>

                                    <td>
                                        ₹
                                        {formatMoney(
                                            calculations.plantTotal,
                                            bill.rounding
                                        )}
                                    </td>

                                    <td>
                                        ₹
                                        {formatMoney(
                                            calculations.plantSubsidy,
                                            bill.rounding
                                        )}
                                    </td>

                                    <td>
                                        ₹
                                        {formatMoney(
                                            Math.max(
                                                0,
                                                calculations.plantTotal -
                                                calculations.plantSubsidy
                                            ),
                                            bill.rounding
                                        )}
                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        Pit / Digging
                                    </td>

                                    <td>
                                        {
                                            calculations.plants
                                        }
                                    </td>

                                    <td>
                                        ₹
                                        {formatMoney(
                                            calculations.pitTotal,
                                            bill.rounding
                                        )}
                                    </td>

                                    <td>
                                        ₹0
                                    </td>

                                    <td>
                                        ₹
                                        {formatMoney(
                                            calculations.pitTotal,
                                            bill.rounding
                                        )}
                                    </td>

                                </tr>


                                <tr>

                                    <td>
                                        Manure
                                    </td>

                                    <td>
                                        {
                                            calculations.manureQuantity
                                        }
                                    </td>

                                    <td>
                                        ₹
                                        {formatMoney(
                                            calculations.manureTotal,
                                            bill.rounding
                                        )}
                                    </td>

                                    <td>
                                        ₹
                                        {formatMoney(
                                            calculations.manureSubsidy,
                                            bill.rounding
                                        )}
                                    </td>

                                    <td>
                                        ₹
                                        {formatMoney(
                                            Math.max(
                                                0,
                                                calculations.manureTotal -
                                                calculations.manureSubsidy
                                            ),
                                            bill.rounding
                                        )}
                                    </td>

                                </tr>

                            </tbody>


                            <tfoot>

                                <tr>

                                    <th>
                                        Grand Total
                                    </th>

                                    <th>
                                        —
                                    </th>

                                    <th>
                                        ₹
                                        {formatMoney(
                                            calculations.grandTotal,
                                            bill.rounding
                                        )}
                                    </th>

                                    <th>
                                        ₹
                                        {formatMoney(
                                            calculations.grandSubsidy,
                                            bill.rounding
                                        )}
                                    </th>

                                    <th>
                                        ₹
                                        {formatMoney(
                                            calculations.farmerContribution,
                                            bill.rounding
                                        )}
                                    </th>

                                </tr>

                            </tfoot>

                        </table>

                    </div>

                )}

            </section>


            <section className="udyan-card voucher-options">

                <div className="voucher-option">

                    <div>

                        <strong>
                            Voucher 2
                        </strong>

                        <span>
                            Generate the second voucher
                            page with the bill.
                        </span>

                    </div>

                    <label className="switch">

                        <input
                            type="checkbox"
                            checked={bill.voucher_2}
                            onChange={(event) =>
                                updateBill(
                                    "voucher_2",
                                    event.target.checked
                                )
                            }
                        />

                        <span className="slider" />

                    </label>

                </div>

            </section>


            <div className="udyan-actions">

                <button
                    type="button"
                    className="udyan-btn secondary"
                    onClick={resetBill}
                >
                    Reset
                </button>

                <button
                    type="button"
                    className="udyan-btn secondary"
                    onClick={handlePrint}
                >
                    Print / PDF
                </button>

                <button
                    type="button"
                    className="udyan-btn primary"
                    onClick={saveBill}
                    disabled={savingBill}
                >
                    {savingBill
                        ? "Saving..."
                        : "Save Bill"}
                </button>

            </div>

        </>
    );


    /*
    |--------------------------------------------------------------------------
    | PRINT BILL
    |--------------------------------------------------------------------------
    */
    const renderPrintableBill = () => {

        if (!selectedStandard) {
            return null;
        }

        return (
            <div className="print-document">

                <div className="print-page">

                    <div className="print-header">

                        <h1>
                            उद्यान विभाग
                        </h1>

                        <h2>
                            बिल एवं कृषक अंश वाउचर
                        </h2>

                        <p>
                            वित्तीय वर्ष {bill.financial_year}
                        </p>

                    </div>


                    <div className="print-info-grid">

                        <div>
                            <strong>
                                कृषक का नाम
                            </strong>

                            <span>
                                {bill.farmer_name || "—"}
                            </span>
                        </div>

                        <div>
                            <strong>
                                पिता / पति का नाम
                            </strong>

                            <span>
                                {
                                    bill.father_husband_name ||
                                    "—"
                                }
                            </span>
                        </div>

                        <div>
                            <strong>
                                ग्राम
                            </strong>

                            <span>
                                {bill.village || "—"}
                            </span>
                        </div>

                        <div>
                            <strong>
                                केन्द्र
                            </strong>

                            <span>
                                {bill.center || "—"}
                            </span>
                        </div>

                        <div>
                            <strong>
                                फसल
                            </strong>

                            <span>
                                {
                                    selectedStandard.crop_name
                                }
                            </span>
                        </div>

                        <div>
                            <strong>
                                क्षेत्रफल
                            </strong>

                            <span>
                                {bill.area || "0"} हे.
                            </span>
                        </div>

                    </div>


                    <table className="print-table">

                        <thead>

                            <tr>
                                <th>
                                    क्र.
                                </th>

                                <th>
                                    कार्य / सामग्री
                                </th>

                                <th>
                                    मात्रा
                                </th>

                                <th>
                                    कुल व्यय
                                </th>

                                <th>
                                    अनुदान
                                </th>

                                <th>
                                    कृषक अंश
                                </th>
                            </tr>

                        </thead>

                        <tbody>

                            <tr>
                                <td>1</td>

                                <td>
                                    पौध सामग्री
                                </td>

                                <td>
                                    {calculations.plants}
                                </td>

                                <td>
                                    ₹
                                    {formatMoney(
                                        calculations.plantTotal,
                                        bill.rounding
                                    )}
                                </td>

                                <td>
                                    ₹
                                    {formatMoney(
                                        calculations.plantSubsidy,
                                        bill.rounding
                                    )}
                                </td>

                                <td>
                                    ₹
                                    {formatMoney(
                                        Math.max(
                                            0,
                                            calculations.plantTotal -
                                            calculations.plantSubsidy
                                        ),
                                        bill.rounding
                                    )}
                                </td>
                            </tr>


                            <tr>
                                <td>2</td>

                                <td>
                                    गड्ढा खुदाई
                                </td>

                                <td>
                                    {calculations.plants}
                                </td>

                                <td>
                                    ₹
                                    {formatMoney(
                                        calculations.pitTotal,
                                        bill.rounding
                                    )}
                                </td>

                                <td>
                                    ₹0
                                </td>

                                <td>
                                    ₹
                                    {formatMoney(
                                        calculations.pitTotal,
                                        bill.rounding
                                    )}
                                </td>
                            </tr>


                            <tr>
                                <td>3</td>

                                <td>
                                    खाद / Manure
                                </td>

                                <td>
                                    {
                                        calculations.manureQuantity
                                    }
                                </td>

                                <td>
                                    ₹
                                    {formatMoney(
                                        calculations.manureTotal,
                                        bill.rounding
                                    )}
                                </td>

                                <td>
                                    ₹
                                    {formatMoney(
                                        calculations.manureSubsidy,
                                        bill.rounding
                                    )}
                                </td>

                                <td>
                                    ₹
                                    {formatMoney(
                                        Math.max(
                                            0,
                                            calculations.manureTotal -
                                            calculations.manureSubsidy
                                        ),
                                        bill.rounding
                                    )}
                                </td>
                            </tr>

                        </tbody>


                        <tfoot>

                            <tr>

                                <th
                                    colSpan="3"
                                >
                                    कुल
                                </th>

                                <th>
                                    ₹
                                    {formatMoney(
                                        calculations.grandTotal,
                                        bill.rounding
                                    )}
                                </th>

                                <th>
                                    ₹
                                    {formatMoney(
                                        calculations.grandSubsidy,
                                        bill.rounding
                                    )}
                                </th>

                                <th>
                                    ₹
                                    {formatMoney(
                                        calculations.farmerContribution,
                                        bill.rounding
                                    )}
                                </th>

                            </tr>

                        </tfoot>

                    </table>


                    <div className="signature-grid">

                        <div>
                            <span>
                                कृषक के हस्ताक्षर
                            </span>
                        </div>

                        <div>
                            <span>
                                आपूर्तिकर्ता के हस्ताक्षर
                            </span>
                        </div>

                        <div>
                            <span>
                                अधिकारी के हस्ताक्षर
                            </span>
                        </div>

                    </div>

                </div>

            </div>
        );
    };


    /*
    |--------------------------------------------------------------------------
    | MAIN RENDER
    |--------------------------------------------------------------------------
    */
    return (
        <div className="udyan-page">

            <header className="udyan-header">

                <div className="udyan-header-content">

                    <div>

                        <div className="udyan-eyebrow">
                            UDYAN DEPARTMENT
                        </div>

                        <h1>
                            Bill & Farmer Contribution
                        </h1>

                        <p>
                            Dynamic Crop Standard and
                            Voucher Management
                        </p>

                    </div>


                    <div className="header-year">

                        <span>
                            Financial Year
                        </span>

                        <strong>
                            {financialYear}
                        </strong>

                    </div>

                </div>

            </header>


            <nav className="udyan-tabs">

                <button
                    type="button"
                    className={
                        activePage === "bill"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActivePage("bill")
                    }
                >
                    Bill Generator
                </button>

                <button
                    type="button"
                    className={
                        activePage === "standards"
                            ? "active"
                            : ""
                    }
                    onClick={() =>
                        setActivePage("standards")
                    }
                >
                    Crop Standards
                </button>

            </nav>


            <main className="udyan-container">

                {message.text && (
                    <div
                        className={`udyan-message ${message.type}`}
                    >
                        {message.text}

                        <button
                            type="button"
                            onClick={() =>
                                setMessage({
                                    type: "",
                                    text: "",
                                })
                            }
                        >
                            ×
                        </button>
                    </div>
                )}


                {activePage === "standards" ? (

                    renderStandards()

                ) : (

                    <>
                        {renderBill()}

                        {renderPrintableBill()}
                    </>

                )}

            </main>


            {showStandardModal && (

                <div
                    className="standard-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeStandardModal();
                        }

                    }}
                >

                    <div className="standard-modal">

                        <div className="standard-modal-header">

                            <div>

                                <span>
                                    CROP STANDARD
                                </span>

                                <h2>
                                    {editingStandard
                                        ? "Edit Crop Standard"
                                        : "Add Crop Standard"}
                                </h2>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    closeStandardModal
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="standard-modal-body">

                            <div className="standard-form-grid">

                                <div className="udyan-form-group">

                                    <label>
                                        Financial Year *
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            standardForm.financial_year
                                        }
                                        placeholder="2026-27"
                                        onChange={(event) =>
                                            updateStandardForm(
                                                "financial_year",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="udyan-form-group">

                                    <label>
                                        Crop Name *
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            standardForm.crop_name
                                        }
                                        placeholder="Enter crop name"
                                        onChange={(event) =>
                                            updateStandardForm(
                                                "crop_name",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="udyan-form-group">

                                    <label>
                                        Spacing *
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            standardForm.spacing
                                        }
                                        placeholder="Example: 6 × 6 मी0"
                                        onChange={(event) =>
                                            updateStandardForm(
                                                "spacing",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="udyan-form-group">

                                    <label>
                                        Plants Per Hectare *
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            standardForm.plants_per_hectare
                                        }
                                        onChange={(event) =>
                                            updateStandardForm(
                                                "plants_per_hectare",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="udyan-form-group">

                                    <label>
                                        Plant Rate *
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            standardForm.plant_rate
                                        }
                                        onChange={(event) =>
                                            updateStandardForm(
                                                "plant_rate",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="udyan-form-group">

                                    <label>
                                        Pit Rate *
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            standardForm.pit_rate
                                        }
                                        onChange={(event) =>
                                            updateStandardForm(
                                                "pit_rate",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="udyan-form-group">

                                    <label>
                                        Manure Rate *
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            standardForm.manure_rate
                                        }
                                        onChange={(event) =>
                                            updateStandardForm(
                                                "manure_rate",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="udyan-form-group">

                                    <label>
                                        Manure Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            standardForm.manure_quantity
                                        }
                                        onChange={(event) =>
                                            updateStandardForm(
                                                "manure_quantity",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="udyan-form-group">

                                    <label>
                                        Standard Total *
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            standardForm.standard_total
                                        }
                                        onChange={(event) =>
                                            updateStandardForm(
                                                "standard_total",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="udyan-form-group">

                                    <label>
                                        Standard Subsidy *
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={
                                            standardForm.standard_subsidy
                                        }
                                        onChange={(event) =>
                                            updateStandardForm(
                                                "standard_subsidy",
                                                event.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div className="standard-active-field">

                                    <label className="checkbox-label">

                                        <input
                                            type="checkbox"
                                            checked={
                                                standardForm.is_active
                                            }
                                            onChange={(event) =>
                                                updateStandardForm(
                                                    "is_active",
                                                    event.target.checked
                                                )
                                            }
                                        />

                                        <span>
                                            Active Standard
                                        </span>

                                    </label>

                                </div>

                            </div>


                            <div className="standard-calculation-note">

                                <strong>
                                    Note:
                                </strong>

                                <span>
                                    These values are entered
                                    by the user and stored in
                                    the database. No predefined
                                    crop standards are used.
                                </span>

                            </div>

                        </div>


                        <div className="standard-modal-footer">

                            <button
                                type="button"
                                className="udyan-btn secondary"
                                onClick={
                                    closeStandardModal
                                }
                                disabled={
                                    savingStandard
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="udyan-btn primary"
                                onClick={saveStandard}
                                disabled={
                                    savingStandard
                                }
                            >
                                {savingStandard
                                    ? "Saving..."
                                    : editingStandard
                                    ? "Update Standard"
                                    : "Save Standard"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default UdyanBill;