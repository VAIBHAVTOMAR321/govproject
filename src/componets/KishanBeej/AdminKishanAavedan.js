import React, { useEffect, useState } from 'react';
import './AdminKishanBeej.css';

const API_BASE = 'https://mahadevaaya.com/govbillingsystem/backend/api';
const FILE_BASE = 'https://mahadevaaya.com/govbillingsystem';

const SCHEMES = {
  kisan: { name: 'फेंसिंग', english: 'Fencing', endpoint: 'fencing-kisan' },
  kiwi: { name: 'कीवी उद्यान स्थापना', english: 'Kiwi Orchard Establishment', endpoint: 'kiwi-kishan-avedan' },
  dragon: { name: 'ड्रैगन फ्रूट (कमलम)', english: 'Dragon Fruit (Kamalam)', endpoint: 'dragon-fruit-kisan' },
  vermi: { name: 'वर्मी कम्पोस्ट', english: 'Vermicompost', endpoint: 'vermicompost-kisan' },
};

const SCHEME_TYPES = Object.keys(SCHEMES);

const LABELS = {
  center_name: 'केंद्र / कार्यालय',
  scheme_name: 'योजना',
  full_name: 'कृषक का नाम',
  farmer_name: 'कृषक का नाम',
  father_name: 'पिता / पति का नाम',
  father_husband_name: 'पिता / पति का नाम',
  gender: 'लिंग',
  garden_card: 'उद्यान कार्ड संख्या',
  horticulture_card: 'उद्यान कार्ड संख्या / दस्तावेज़',
  udyan_card_no: 'उद्यान कार्ड संख्या',
  plants_no: 'पौधों की संख्या',
  village: 'ग्राम',
  post: 'पोस्ट',
  block: 'विकासखंड',
  tehsil: 'तहसील',
  dist: 'जनपद',
  district: 'जनपद',
  mob: 'मोबाइल नंबर',
  mobile: 'मोबाइल नंबर',
  aadhar: 'आधार संख्या',
  aadhaar: 'आधार संख्या',
  category: 'श्रेणी',
  farmer_category: 'कृषक श्रेणी',
  farmer_type: 'कृषक का प्रकार',
  fencing_material: 'फेंसिंग सामग्री',
  subsidy_rate: 'राजसहायता दर (%)',
  bank_holder_name: 'खाताधारक का नाम',
  bank_name: 'बैंक का नाम',
  branch: 'बैंक शाखा',
  bank_branch: 'बैंक शाखा',
  account: 'बैंक खाता संख्या',
  bank_account_number: 'बैंक खाता संख्या',
  ifsc: 'IFSC कोड',
  bank_ifsc: 'IFSC कोड',
  bank_account_type: 'खाता प्रकार',
  proposed_area: 'प्रस्तावित क्षेत्रफल (हेक्टेयर)',
  land_nali: 'भूमि (नाली)',
  area_hectare: 'क्षेत्रफल (हेक्टेयर)',
  permissible_length_meter: 'अनुमन्य लंबाई (मीटर)',
  number_of_poles: 'खंभों की संख्या',
  total_cost: 'कुल लागत (₹)',
  subsidy_80_percent: '80% राजसहायता (₹)',
  subsidy_50_percent: '50% राजसहायता (₹)',
  selected_subsidy_rate: 'चयनित राजसहायता दर (%)',
  payable_subsidy: 'देय राजसहायता (₹)',
  unit_cost_per_hectare: 'प्रति हेक्टेयर इकाई लागत (₹)',
  additional_max_limit: 'अतिरिक्त अधिकतम सीमा (₹)',
  standard_cost: 'मानक लागत (₹)',
  maximum_subsidy: 'अधिकतम राजसहायता (₹)',
  mb_valuation_amount: 'एम.बी. मूल्यांकन राशि (₹)',
  direct_mb_amount: 'प्रत्यक्ष एम.बी. राशि (₹)',
  measured_actual_length: 'मापी गई वास्तविक लंबाई (मीटर)',
  site_verified_actual_length: 'स्थल सत्यापित लंबाई (मीटर)',
  payable_date: 'देयक दिनांक',
  date: 'दिनांक',
  place: 'स्थान',
  remarks: 'टिप्पणी',
  work_mode: 'कार्य का माध्यम',
  firm_name: 'फर्म का नाम',
  firm_registration_no: 'फर्म पंजीकरण संख्या',
  work_remark: 'कार्य संबंधी टिप्पणी',
  bank_proof: 'बैंक प्रमाण',
  land_record_khatauni: 'खतौनी / भूमि अभिलेख',
  aadhaar_identity: 'आधार पहचान पत्र',
  bank_passbook_cancelled_cheque: 'बैंक पासबुक / रद्द चेक',
  land_map_other_record: 'भूमि नक्शा / अन्य अभिलेख',
  other_document: 'अन्य दस्तावेज',
  declaration_no_waterlogging: 'जलभराव नहीं होने की घोषणा',
  declaration_irrigation_available: 'सिंचाई सुविधा की घोषणा',
  declaration_previous_benefit: 'पूर्व लाभ संबंधी घोषणा',
  declaration_land_correct: 'भूमि विवरण सही होने की घोषणा',
  declaration_inspection_consent: 'निरीक्षण सहमति',
  declaration_farmer_share: 'कृषक अंश संबंधी सहमति',
  material_total: 'सामग्री कुल (₹)',
  footing_total: 'नींव कुल (₹)',
  labour_total: 'मजदूरी कुल (₹)',
  other_total: 'अन्य कुल (₹)',
  photo: 'कृषक का फोटो',
};

const ARRAY_LABELS = {
  farmer_details: {
    title: 'किसान / भूमि विवरण',
    columns: ['कृषक का नाम', 'पिता / पति का नाम', 'ग्राम', 'खाता संख्या', 'आधार संख्या', 'क्षेत्रफल (नाली)', 'क्षेत्रफल (हेक्टेयर)'],
  },
  land_work_details: {
    title: 'भूमि एवं कार्य विवरण',
    columns: ['भूमि का प्रकार', 'कृषक का नाम', 'पिता / पति का नाम', 'लिंग', 'ग्राम', 'खाता संख्या', 'खसरा / गाटा संख्या', 'क्षेत्रफल (हेक्टेयर)'],
  },
  crop_details: { title: 'फसल विवरण', columns: ['फसल', 'क्षेत्रफल (हेक्टेयर)'] },
  vermi_expenses: { title: 'वर्मी कम्पोस्ट व्यय', columns: ['कार्य / सामग्री', 'राशि (₹)'] },
  anudan_voucher: { title: 'अनुदान / बिल विवरण', columns: ['कार्य का नाम', 'सामग्री / मद', 'बिल संख्या', 'राशि (₹)', 'क्रय माध्यम', 'फर्म / व्यक्ति'] },
  material_expenses: { title: 'सामग्री व्यय', columns: ['सामग्री', 'मात्रा', 'इकाई', 'दर', 'राशि (₹)', 'फर्म / विक्रेता', 'विवरण'] },
  footing_expenses: { title: 'नींव / सामग्री व्यय', columns: ['कार्य / सामग्री', 'मात्रा', 'इकाई', 'दर', 'राशि (₹)', 'फर्म / विक्रेता'] },
  labour_expenses: { title: 'मजदूरी व्यय', columns: ['कार्य / सामग्री', 'मात्रा', 'इकाई', 'दर', 'राशि (₹)'] },
  other_expenses: { title: 'अन्य व्यय', columns: ['कार्य / सामग्री', 'मात्रा', 'इकाई', 'दर', 'राशि (₹)', 'फर्म / व्यक्ति', 'ग्राम', 'मोबाइल'] },
};

const HIDDEN_KEYS = new Set(['id', 'form_id', 'created_at', 'updated_at']);
const labelFor = (key) => LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'हाँ' : 'नहीं';
  if (Array.isArray(value)) return value.map((item) => Array.isArray(item) ? item.join(' / ') : item).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};
const scalarEntries = (record) => Object.entries(record || {})
  .filter(([key, value]) => !HIDDEN_KEYS.has(key) && !Array.isArray(value) && value !== null && value !== undefined && value !== '');
const arrayEntries = (record) => Object.entries(record || {})
  .filter(([key, value]) => !HIDDEN_KEYS.has(key) && Array.isArray(value) && value.length > 0);

function DataFields({ record }) {
  const entries = scalarEntries(record);
  if (!entries.length) return <p className="admin-print-empty">इस अनुभाग में कोई विवरण उपलब्ध नहीं है।</p>;
  return (
    <table className="print-table"><tbody>
      {entries.map(([key, value]) => {
        const fileUrl = typeof value === 'string' && value.startsWith('/media/') ? `${FILE_BASE}${value}` : null;
        return (
          <tr key={key}>
            <td className="print-key">{labelFor(key)}</td>
            <td>{fileUrl
              ? <a href={fileUrl} target="_blank" rel="noreferrer">{value.split('/').pop()}</a>
              : displayValue(value)}</td>
          </tr>
        );
      })}
    </tbody></table>
  );
}

function DataArray({ field, rows }) {
  const config = ARRAY_LABELS[field] || { title: labelFor(field), columns: [] };
  const maxColumns = Math.max(...rows.map((row) => Array.isArray(row) ? row.length : 1));
  return (
    <section className="print-section print-avoid-break">
      <h2>{config.title}</h2>
      <table className="print-table print-array-table">
        <thead><tr>{Array.from({ length: maxColumns }, (_, index) => (
          <th key={index}>{config.columns[index] || `विवरण ${index + 1}`}</th>
        ))}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => {
          const cells = Array.isArray(row) ? row : [row];
          return <tr key={`${field}-${rowIndex}`}>{Array.from({ length: maxColumns }, (_, index) => (
            <td key={index}>{displayValue(cells[index])}</td>
          ))}</tr>;
        })}</tbody>
      </table>
    </section>
  );
}

const PROJECT_COMPONENTS = {
  kiwi: [
    ['भूमि विकास', 'सम्पूर्ण परियोजना क्षेत्र हेतु', 'भूमि समतलीकरण, सफाई, जुताई, ढलान के अनुसार मेड़बंदी तथा 6 मीटर × 4 मीटर की रोपण दूरी के अनुसार स्थल का layout/रेखांकन।', 60000],
    ['गड्ढा खुदान एवं भराई', '167 मुख्य गड्ढे प्रति 20 नाली', 'गड्ढे का आकार 1 मीटर × 1 मीटर × 1 मीटर। प्रति गड्ढा 30 किलोग्राम कम्पोस्ट मिलाकर भराई तथा भूमि सतह से 0.30 मीटर ऊँचाई तक भराव।', 50000],
    ['टपक सिंचाई एवं जल संचयन प्रणाली', '1 पूर्ण सेट', 'फर्टिगेशन सहित वाटर टैंक, पम्प, बाईपास वाल्व, फिल्टर, वेंचुरी इंजेक्टर, प्रेशर गेज, NRV, मेन/सब-मेन लाइन, कंट्रोल वाल्व, एयर रिलीज वाल्व, फ्लश वाल्व तथा ड्रिपर/इमीटर्स।', 64000],
    ['ट्रेलिस (T-Bar) सिस्टम', '167 मुख्य पौध स्थान प्रति 20 नाली', 'T-Bar मोटाई 6 mm, कुल ऊँचाई 2.5 मीटर (2.0 मीटर ऊपर + 0.5 मीटर गहराई), arm चौड़ाई 2.0 मीटर, T-Bar दूरी 6 मीटर और 4 mm galvanized wire।', 600000],
    ['GI चेन लिंक्ड फेंसिंग', '200 + 4 × नाली मीटर', 'गैल्वेनाइज्ड GI chain-linked fencing, लोहे के खम्भों सहित; स्वीकृत क्षेत्रफल की area-wise table के अनुसार।', 295000],
    ['खेती के औजार', '1 मानक सेट', 'सेकेटियर, pruning shear, sprayer आदि आवश्यक औद्यानिक/कृषि औजार।', 10000],
    ['पौध संरक्षण रसायन / विकास नियामक / उर्वरक', 'प्रथम वर्ष की मानक आवश्यकता', 'प्रथम वर्ष हेतु आवश्यक मात्रा में पौध संरक्षण रसायन, growth regulators तथा उर्वरक।', 15000],
    ['विविध लागत', '1 मानक प्रावधान', 'गेट, बोर्ड तथा कटाई उपरान्त प्रबंधन हेतु plastic crates, corrugated fibre boxes आदि।', 32000],
    ['रोपण सामग्री', '167 मुख्य + 41 अतिरिक्त पौधे प्रति 20 नाली', 'उच्च गुणवत्तायुक्त कीवी पौधे; कुल पौधों में 9 मादा : 1 नर अनुपात। अतिरिक्त पौधे replacement हेतु सुरक्षित रखे जाएंगे।', 58000],
  ],
  dragon: [
    ['भूमि रेखांकन एवं अन्य तैयारी', 'सम्पूर्ण परियोजना क्षेत्र हेतु', 'भूमि समतलीकरण, जुताई, निराई-गुड़ाई, ढलान अनुसार मेड़बंदी तथा स्थल का layout। पिल्लर से पिल्लर 2.0 मीटर एवं लाइन से लाइन 3.0 मीटर।', 12000],
    ['गड्ढा खुदान/भरान, बंड, खाद एवं उर्वरक प्रबंधन', '666 पिल्लर प्रति 20 नाली; 4 गड्ढे प्रति पिल्लर', 'गड्ढे का आकार 0.20 × 0.20 × 0.20 मीटर, भराई 0.30 मीटर तक। प्रति गड्ढा 2–3 किलोग्राम कम्पोस्ट एवं 50 ग्राम SSP।', 90000],
    ['ड्रिप सिंचाई प्रणाली एवं फर्टिगेशन', '1 पूर्ण सेट', 'PMKSY मानकों के अनुसार वाटर टैंक, पम्प, फिल्टर, वेंचुरी इंजेक्टर, मुख्य/उप-मुख्य लाइन, लैटरल एवं ड्रिपर; प्रति पिल्लर कम से कम 4 ड्रिपर।', 44000],
    ['RCC पिल्लर सिस्टम + कंक्रीट रिंग', '666 पिल्लर प्रति 20 नाली', 'RCC पिल्लर लंबाई 2.30 मीटर, लगभग 5×5 इंच; 1.80 मीटर भूमि से ऊपर, 0.50 मीटर अंदर। शीर्ष पर 2 फीट व्यास, 2 इंच मोटी रिंग।', 265000],
    ['GI चेन लिंक्ड फेंसिंग', '200 + 4 × नाली मीटर', '1.8 मीटर ऊँची GI chain-linked जाली, 2.5 mm तार, 4×4 इंच मेश; खम्भे 3 मीटर दूरी पर और 10–12 फीट प्रवेश द्वार।', 175000],
    ['उर्वरक एवं पौध रक्षा रसायन', 'प्रथम वर्ष की मानक आवश्यकता', 'प्रथम वर्ष हेतु आवश्यक नाइट्रोजन, फास्फोरस, पोटाश, कीटनाशक/फफूंदनाशक तथा आवश्यक स्प्रे।', 10000],
    ['रोपण सामग्री', 'प्रति पिल्लर 4 पौधे', 'चारों दिशाओं में प्रति पिल्लर 4 स्वस्थ, रोगमुक्त पौधे; कुल पौधे पिल्लर संख्या × 4।', 200000],
  ],
};

const PROJECT_INSTRUCTIONS = {
  kiwi: [
    '6 मीटर × 4 मीटर रोपण दूरी के अनुसार स्थल का layout तैयार करें।',
    'मुख्य गड्ढे निर्धारित आकार में तैयार कर 30 किग्रा कम्पोस्ट के साथ भरें।',
    'कुल पौधों में 9 मादा : 1 नर अनुपात बनाए रखें; अतिरिक्त पौधों को replacement हेतु सुरक्षित रखें।',
    'T-Bar trellis निर्धारित ऊँचाई, arm width, spacing और galvanized wire specification के अनुसार स्थापित करें।',
    'पूर्ण drip/fertigation system, GI chain-link fencing, औजार और प्रथम वर्ष के inputs मानक अनुसार रखें।',
  ],
  dragon: [
    'निर्धारित 2.0 मीटर × 3.0 मीटर layout के अनुसार खेत का रेखांकन करें।',
    'प्रत्येक पिल्लर के आधार पर 4 गड्ढे निर्धारित आकार और खाद/उर्वरक के साथ तैयार करें।',
    'निर्धारित संख्या में RCC पिल्लर लगाकर शीर्ष पर निर्धारित कंक्रीट रिंग स्थापित करें।',
    'प्रत्येक पिल्लर पर 4 पौधों की रोपण व्यवस्था करें।',
    'PMKSY मानकों के अनुसार ड्रिप एवं फर्टिगेशन तथा निर्धारित specification की GI chain-link fencing स्थापित करें।',
  ],
};

const projectArea = (application) => {
  const personal = application.raw.personal;
  const landRows = personal.land_work_details || [];
  const rowsTotal = landRows.reduce((total, row) => total + Number(row?.[7] || 0), 0);
  return Number(personal.proposed_area || personal.area_hectare || rowsTotal || 0);
};
const moneyText = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function DocumentPage({ title, children }) {
  return (
    <section className="admin-form-page">
      <h2 className="admin-form-page-title">{title}</h2>
      {children}
    </section>
  );
}

function RecordFields({ title, record }) {
  return (
    <>
      <h3 className="admin-form-section-title">{title}</h3>
      <DataFields record={record} />
    </>
  );
}

function RecordArrays({ record }) {
  return arrayEntries(record).map(([field, rows]) => <DataArray key={field} field={field} rows={rows} />);
}

function ProjectStandardPage({ application }) {
  const type = application.schemeType;
  const areaHa = projectArea(application);
  const nali = areaHa * 50;
  const factor = nali / 20;
  const rows = PROJECT_COMPONENTS[type].map(([name, quantity, specification, baseCost], index) => {
    let calculatedQuantity = quantity;
    if (type === 'kiwi' && index === 1) calculatedQuantity = `${Math.round(167 * factor)} मुख्य गड्ढे`;
    if (type === 'kiwi' && index === 3) calculatedQuantity = `${Math.round(167 * factor)} T-Bar`;
    if (type === 'kiwi' && index === 4) calculatedQuantity = `${Math.round(200 + 4 * nali)} मीटर`;
    if (type === 'kiwi' && index === 8) calculatedQuantity = `${Math.round(208 * factor)} पौधे (9 मादा : 1 नर)`;
    if (type === 'dragon' && index === 1) calculatedQuantity = `${Math.round(666 * factor)} पिल्लर / ${Math.round(2664 * factor)} गड्ढे`;
    if (type === 'dragon' && index === 3) calculatedQuantity = `${Math.round(666 * factor)} पिल्लर`;
    if (type === 'dragon' && index === 4) calculatedQuantity = `${Math.round(200 + 4 * nali)} मीटर`;
    if (type === 'dragon' && index === 6) calculatedQuantity = `${Math.round(2664 * factor)} पौधे`;
    return { name, quantity: calculatedQuantity, specification, cost: baseCost * factor };
  });
  const totalCost = rows.reduce((total, row) => total + row.cost, 0);
  const rate = type === 'dragon' ? (nali <= 50 ? 80 : 50) : (nali <= (application.raw.personal.farmer_type?.includes('समूह') ? 250 : 50) ? 70 : 50);
  const farmerShare = totalCost * (100 - rate) / 100;
  const subsidy = totalCost * rate / 100;
  return (
    <DocumentPage title="पूर्ण परियोजना मानक एवं कार्य-विवरण">
      <p className="admin-form-note">{SCHEMES[type].name} के लिए आवेदन में दर्ज क्षेत्रफल के आधार पर।</p>
      <table className="print-table print-array-table">
        <thead><tr><th>क्र.</th><th>कार्य / Component</th><th>तकनीकी Specification</th><th>Quantity</th><th>मानक लागत</th></tr></thead>
        <tbody>{rows.map((row, index) => (
          <tr key={row.name}><td>{index + 1}</td><td>{row.name}</td><td>{row.specification}</td><td>{row.quantity}</td><td>{moneyText(row.cost)}</td></tr>
        ))}</tbody>
      </table>
      <RecordFields title="क्षेत्रफल एवं अनुदान सारांश" record={{
        'प्रस्तावित क्षेत्रफल (हेक्टेयर)': areaHa,
        'प्रस्तावित क्षेत्रफल (नाली)': nali,
        'कुल परियोजना लागत': moneyText(totalCost),
        'देय अनुदान दर': `${rate}%`,
        'देय अनुदान': moneyText(subsidy),
        'कृषक अंश': moneyText(farmerShare),
      }} />
      <h3 className="admin-form-section-title">किसान द्वारा किए जाने वाले कार्य एवं तकनीकी निर्देश</h3>
      <ol className="admin-form-list">{PROJECT_INSTRUCTIONS[type].map((item) => <li key={item}>{item}</li>)}</ol>
      <p className="admin-form-note">कार्य, मात्रा एवं भुगतान का अंतिम सत्यापन विभागीय स्थलीय निरीक्षण के अधीन होगा।</p>
    </DocumentPage>
  );
}

function AffidavitPage({ application }) {
  const { personal, expenses } = application.raw;
  const type = application.schemeType;
  if (type === 'vermi') {
    const name = personal.full_name || '…………';
    const father = personal.father_name || '…………';
    const village = personal.village || '…………';
    const subsidyRate = Number(expenses.subsidy_rate || 75);
    const standardCost = Number(expenses.standard_cost || 33333);
    const subsidyAmount = Number(expenses.maximum_subsidy || Math.round(standardCost * subsidyRate / 100));
    return (
      <DocumentPage title="शपथ-पत्र (वर्मी कम्पोस्ट यूनिट निर्माण हेतु)">
        <p>मैं <b>{name}</b> पुत्र / पुत्री / पत्नी श्री <b>{father}</b>, निवासी ग्राम <b>{village}</b>, डाकघर <b>{displayValue(personal.post)}</b>, तहसील <b>{displayValue(personal.tehsil)}</b>, जनपद <b>{displayValue(personal.dist)}</b>, उद्यान कार्ड संख्या <b>{displayValue(personal.horticulture_card)}</b> शपथपूर्वक कथन करता / करती हूँ कि—</p>
        <ol className="admin-form-list">
          <li>मेरा नाम, पता एवं आवेदन के अन्य व्यक्तिगत विवरण सत्य एवं सही हैं।</li>
          <li>मेरे द्वारा राज्य सेक्टर योजनान्तर्गत वर्मी कम्पोस्ट यूनिट निर्माण हेतु उद्यान विभाग में आवेदन किया गया है।</li>
          <li>जिस भूमि पर इकाई का निर्माण किया गया है, वह मेरे वैधानिक स्वामित्व एवं वास्तविक कब्जे में है। ग्राम: {village}; खाता संख्या: {displayValue(personal.khasra)}।</li>
          <li>वर्मी कम्पोस्ट यूनिट का निर्धारित आकार 10 फीट × 8 फीट × 2.5 फीट है।</li>
          <li>API अभिलेखानुसार मानक लागत {moneyText(standardCost)}, राजसहायता दर {subsidyRate}% तथा अधिकतम राजसहायता {moneyText(subsidyAmount)} है।</li>
          <li>उक्त यूनिट हेतु किसी अन्य सरकारी विभाग / योजना से दोहरा अनुदान प्राप्त नहीं किया गया है।</li>
          <li>प्रस्तुत दस्तावेज, भूमि अभिलेख, बैंक विवरण, बिल / वाउचर एवं अन्य जानकारी सत्य है।</li>
          <li>यूनिट का निर्माण विभागीय तकनीकी मानकों के अनुरूप है; रख-रखाव एवं संचालन की जिम्मेदारी मेरी होगी।</li>
          <li>असत्य जानकारी पाए जाने पर आवेदन / राजसहायता निरस्त होने तथा राशि वसूली की कार्यवाही स्वीकार होगी।</li>
        </ol>
        <p>स्थान: {displayValue(personal.place)}　 दिनांक: {displayValue(personal.date)}</p>
        <div className="admin-signature">शपथकर्ता: {name}<br />मोबाइल: {displayValue(personal.mob)}<br />हस्ताक्षर: ____________________</div>
      </DocumentPage>
    );
  }
  const coOwners = (personal.land_work_details || []).filter((row) => Array.isArray(row) && row[0] && !String(row[0]).includes('स्वयं'));
  const hectares = projectArea(application);
  return (
    <DocumentPage title={`${SCHEMES[type].name} — लाभार्थी स्व-घोषणा एवं शपथ-पत्र`}>
      <p>मैं श्री/श्रीमती <b>{displayValue(personal.farmer_name)}</b>, पुत्र/पुत्री/पत्नी श्री <b>{displayValue(personal.father_husband_name)}</b>, निवासी {[
        personal.village, personal.post, personal.block, personal.district, 'उत्तराखण्ड',
      ].filter(Boolean).join(', ')}, सत्यनिष्ठा से घोषणा करता / करती हूँ कि—</p>
      <ol className="admin-form-list">
        <li>मेरे द्वारा कुल {hectares.toFixed(4)} हे० भूमि {coOwners.length ? 'स्वयं तथा सह-खातेदार की भूमि सहित' : 'स्वयं की भूमि'} प्रस्तावित की गई है; भूमि अभिलेख में दिए गए खाता, खसरा/गाटा एवं क्षेत्रफल सही हैं।</li>
        {coOwners.length > 0 && <li>सह-खातेदारों ने अपनी भूमि योजना में सम्मिलित करने हेतु स्वतंत्र सहमति एवं अनापत्ति दी है; सहमति-पत्र संलग्न हैं।</li>}
        <li>प्रस्तावित भूमि मेरे वैध स्वामित्व / अधिकार एवं वास्तविक कब्जे में है तथा विभागीय निरीक्षण के लिए उपलब्ध रहेगी।</li>
        <li>मैं {SCHEMES[type].name} हेतु आवेदन कर रहा/रही हूँ और योजना के लागू तकनीकी मानकों, कार्य मात्रा एवं विभागीय निर्देशों का पालन करूँगा/करूँगी।</li>
        <li>आवेदन में दी गई जानकारी एवं संलग्न दस्तावेज सत्य हैं; असत्य पाए जाने पर विभागीय कार्यवाही स्वीकार होगी।</li>
        <li>देय कृषक अंश एवं अनुमन्य लागत से अधिक व्यय, जहाँ लागू हो, मैं स्वयं वहन करूँगा/करूँगी।</li>
      </ol>
      <RecordFields title="आवेदक / बैंक विवरण" record={personal} />
      <p>स्थान: {displayValue(personal.place)}　 दिनांक: {displayValue(personal.date)}</p>
      <div className="admin-signature">आवेदक का नाम: {displayValue(personal.farmer_name)}<br />हस्ताक्षर: ____________________</div>
    </DocumentPage>
  );
}

function ConsentPage({ application }) {
  const { personal } = application.raw;
  const coOwners = (personal.land_work_details || []).filter((row) => Array.isArray(row) && row[0] && !String(row[0]).includes('स्वयं'));
  return (
    <DocumentPage title="सह-खातेदार सहमति एवं अनापत्ति पत्र">
      {coOwners.length === 0
        ? <p>इस आवेदन में कोई सह-खातेदार भूमि दर्ज नहीं है।</p>
        : coOwners.map((row, index) => (
          <section className="admin-consent-record" key={`co-owner-${index}`}>
            <p>मैं श्री/श्रीमती <b>{displayValue(row[1])}</b>, पिता / पति <b>{displayValue(row[2])}</b>, ग्राम <b>{displayValue(row[4])}</b>, आवेदक से संबंध <b>{displayValue(row[0])}</b>, अपनी भूमि को <b>{displayValue(personal.farmer_name)}</b> के {SCHEMES[application.schemeType].name} आवेदन में सम्मिलित करने की सहमति देता/देती हूँ। प्रस्तावित भूमि विवरण के अनुसार सही है और योजना कार्य / विभागीय निरीक्षण पर मुझे कोई आपत्ति नहीं है।</p>
            <RecordFields title={`सह-खातेदार ${index + 1} का विवरण`} record={{
              name: row[1], father_name: row[2], gender: row[3], village: row[4],
              account_number: row[5], khasra: row[6], proposed_area: `${row[7] || '—'} हे०`,
            }} />
            <div className="admin-signature">स्थान: ____________________　 दिनांक: ____________________<br />सह-खातेदार हस्ताक्षर: ____________________</div>
          </section>
        ))}
    </DocumentPage>
  );
}

function GrantPage({ application }) {
  const { personal, expenses, documents } = application.raw;
  const vouchers = documents.anudan_voucher || [];
  const vermiRows = expenses.vermi_expenses || [];
  const isFencing = application.schemeType === 'kisan';
  const grantRows = application.schemeType === 'vermi' ? vermiRows : vouchers;
  const total = isFencing
    ? Number(expenses.total_cost || expenses.direct_mb_amount || 0)
    : grantRows.reduce((sum, row) => sum + Number(Array.isArray(row) ? row[application.schemeType === 'vermi' ? 1 : 3] || 0 : 0), 0);
  const rate = Number(expenses.selected_subsidy_rate || expenses.subsidy_rate || personal.subsidy_rate || (application.schemeType === 'dragon' ? (projectArea(application) * 50 <= 50 ? 80 : 50) : 70));
  const subsidy = application.schemeType === 'vermi'
    ? Number(expenses.maximum_subsidy || Math.min(total, Number(expenses.mb_valuation_amount || total), Number(expenses.standard_cost || 33333)) * rate / 100)
    : isFencing ? Number(expenses.payable_subsidy || total * rate / 100) : total * rate / 100;
  const grantRecord = application.schemeType === 'vermi'
    ? {
      'बिल / वाउचर के अनुसार कुल व्यय': moneyText(total),
      'एम.बी. मूल्यांकन राशि': moneyText(expenses.mb_valuation_amount),
      'मानक लागत': moneyText(expenses.standard_cost || 33333),
      'राजसहायता दर': `${rate}%`,
      'देय राजसहायता': moneyText(subsidy),
      'कृषक अंश': moneyText(Math.max(0, total - subsidy)),
    }
    : {
      farmer_name: personal.farmer_name,
      father_husband_name: personal.father_husband_name,
      village: personal.village,
      block: personal.block,
      aadhaar: personal.aadhaar,
      mobile: personal.mobile,
      bank_holder_name: personal.bank_holder_name || personal.farmer_name,
      bank_name: personal.bank_name,
      bank_branch: personal.bank_branch,
      bank_account_number: personal.bank_account_number,
      bank_ifsc: personal.bank_ifsc,
      bank_account_type: personal.bank_account_type,
    };
  return (
    <DocumentPage title={application.schemeType === 'vermi' ? 'वर्मी कम्पोस्ट इकाई — राजसहायता देयक प्रपत्र' : `${SCHEMES[application.schemeType].name} अन्तर्गत राजसहायता देयक`}>
      {isFencing && <RecordFields title="देयक में प्रयुक्त व्यय एवं सत्यापन विवरण" record={expenses} />}
      {!isFencing && application.schemeType !== 'vermi' && <RecordFields title="कृषक एवं बैंक खाता विवरण" record={grantRecord} />}
      {application.schemeType === 'vermi' && <RecordFields title="राजसहायता गणना — API में उपलब्ध मान" record={grantRecord} />}
      {application.schemeType === 'vermi' && <DataArray field="vermi_expenses" rows={vermiRows} />}
      {!isFencing && application.schemeType !== 'vermi' && <DataArray field="anudan_voucher" rows={vouchers} />}
      <RecordFields title="देयक गणना" record={{
        'बिल / व्यय कुल': moneyText(total),
        'राजसहायता दर': `${rate}%`,
        'राजसहायता राशि': moneyText(subsidy),
        'कृषक अंश / शेष राशि': moneyText(Math.max(0, total - subsidy)),
      }} />
      <p className="admin-form-note">संलग्न: API में उपलब्ध बिल / वाउचर, एम.बी. मूल्यांकन एवं दस्तावेज़ विवरण। भुगतान की अंतिम स्वीकृति विभागीय सत्यापन के अधीन है।</p>
      <div className="admin-signature">कृषक हस्ताक्षर: ____________________<br />प्रभारी हस्ताक्षर: ____________________</div>
    </DocumentPage>
  );
}

function WorkPage({ application }) {
  const { personal, expenses } = application.raw;
  const expenseArrays = arrayEntries(expenses);
  return (
    <DocumentPage title="व्यय विवरण / कार्य-विवरण">
      <p className="admin-form-note">{SCHEMES[application.schemeType].name} में दर्ज कार्य, सामग्री एवं व्यय विवरण।</p>
      <RecordFields title="कृषक एवं भूमि संदर्भ" record={{
        form_id: application.form_id,
        farmer_name: personal.full_name || personal.farmer_name,
        village: personal.village,
        proposed_area: personal.proposed_area || expenses.area_hectare,
        land_nali: expenses.land_nali,
        permissible_length_meter: expenses.permissible_length_meter,
        number_of_poles: expenses.number_of_poles,
      }} />
      {expenseArrays.length
        ? expenseArrays.map(([field, rows]) => <DataArray key={field} field={field} rows={rows} />)
        : <DataFields record={expenses} />}
      <RecordFields title="व्यय का योग एवं सत्यापन" record={expenses} />
    </DocumentPage>
  );
}

function AdminPrintableApplication({ application }) {
  const { personal, documents } = application.raw;
  const type = application.schemeType;
  return (
    <div className="print-document print-document-preview">
      <div className="print-page">
        <div className="print-app-no">आवेदन क्रमांक: {displayValue(application.form_id)}</div>
        <h1 className="print-title">{SCHEMES[type].name} — संपूर्ण आवेदन एवं देयक प्रपत्र</h1>
        <div className="print-department">उद्यान एवं खाद्य प्रसंस्करण विभाग · वित्तीय वर्ष 2026-27</div>
        <DocumentPage title="कृषक आवेदन पत्र">
          <RecordFields title="आवेदक का विवरण" record={personal} />
          <RecordArrays record={personal} />
          {Object.keys(documents).length > 0 && <RecordFields title="संलग्न दस्तावेज़ एवं घोषणाएँ" record={Object.fromEntries(Object.entries(documents).filter(([key]) => key !== 'anudan_voucher'))} />}
          <RecordArrays record={Object.fromEntries(Object.entries(documents).filter(([key]) => key !== 'anudan_voucher'))} />
          <div className="admin-signature">दिनांक: {displayValue(personal.date)}　 स्थान: {displayValue(personal.place)}<br />आवेदक हस्ताक्षर: ____________________</div>
        </DocumentPage>
        {type === 'kisan' && <WorkPage application={application} />}
        {type === 'vermi' && <AffidavitPage application={application} />}
        {(type === 'kiwi' || type === 'dragon') && <ProjectStandardPage application={application} />}
        {(type === 'kiwi' || type === 'dragon') && <AffidavitPage application={application} />}
        {(type === 'kiwi' || type === 'dragon') && <ConsentPage application={application} />}
        {type === 'vermi' && <WorkPage application={application} />}
        <GrantPage application={application} />
        <DocumentPage title="प्रभारी की आख्या">
          <p>स्थलीय निरीक्षण एवं विभागीय परीक्षण के उपरांत आख्या अंकित की जाएगी।</p>
          <div className="admin-signature">निरीक्षण दिनांक: ____________________<br />हस्ताक्षर प्रभारी: ____________________</div>
        </DocumentPage>
      </div>
    </div>
  );
}

function normalizeRecord(record, schemeType) {
  const personal = record?.personal_details || {};
  const expenses = record?.expense_details || {};
  const documents = record?.document_details || {};
  const formId = record?.form_id || personal.form_id || expenses.form_id || documents.form_id || '—';
  return {
    form_id: formId,
    schemeType,
    name: personal.full_name || personal.farmer_name || personal.name || '-',
    father: personal.father_name || personal.father_husband_name || '-',
    village: personal.village || '-',
    district: personal.dist || personal.district || '-',
    mobile: personal.mob || personal.mobile || '-',
    created_at: personal.created_at || '',
    isComplete: Object.keys(expenses).length > 0 || Object.keys(documents).length > 0,
    raw: { personal, expenses, documents },
  };
}

async function fetchSchemeApplications(type, signal) {
  const response = await fetch(`${API_BASE}/${SCHEMES[type].endpoint}/`, { signal });
  if (!response.ok) {
    throw new Error(`${SCHEMES[type].name}: HTTP ${response.status} ${response.statusText}`);
  }
  const result = await response.json();
  const records = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : null;
  if (!records) throw new Error(`${SCHEMES[type].name}: API response is not an application list.`);
  return records.map((record) => normalizeRecord(record, type));
}

function AdminKishanAavedan() {
  const [data, setData] = useState({ kisan: [], kiwi: [], dragon: [], vermi: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('kisan');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingApplication, setViewingApplication] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const loadApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.all(SCHEME_TYPES.map((type) => fetchSchemeApplications(type, controller.signal)));
        setData(Object.fromEntries(SCHEME_TYPES.map((type, index) => [type, results[index]])));
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'आवेदन लोड नहीं हो सके।');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadApplications();
    return () => controller.abort();
  }, []);

  const getFilteredData = () => {
    let filtered = data[activeTab] || [];
    if (statusFilter === 'completed') filtered = filtered.filter((item) => item.isComplete);
    if (statusFilter === 'pending') filtered = filtered.filter((item) => !item.isComplete);
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((item) => [
        item.name, item.form_id, item.mobile, item.father, item.district, SCHEMES[item.schemeType].name,
      ].some((value) => String(value || '').toLowerCase().includes(query)));
    }
    return filtered;
  };

  const openApplicationView = (item) => {
    setViewingApplication(item);
    document.body.classList.add('admin-application-view-open');
  };
  const closeApplicationView = () => {
    setViewingApplication(null);
    document.body.classList.remove('admin-application-view-open');
  };

  const printApplication = () => {
    if (!viewingApplication) return;
    const documentNode = document.querySelector('.print-document-preview');
    if (!documentNode) {
      window.alert('प्रिंट के लिए आवेदन तैयार नहीं है। कृपया पुनः प्रयास करें।');
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`<!doctype html><html><head><meta charset="UTF-8"><title>कृषक आवेदन</title>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        * { box-sizing: border-box; }
        body { font-family: "Noto Sans Devanagari","Nirmala UI","Mangal","Segoe UI",sans-serif; color:#111; font-size:10pt; line-height:1.45; }
        .print-page { width:100%; }
        .print-app-no { font-size:10pt; font-weight:700; text-align:right; }
        .print-title { margin:5mm 0 1mm; text-align:center; font-size:16pt; }
        .print-department { text-align:center; font-weight:700; margin-bottom:6mm; }
        .print-section { margin:5mm 0; }
        .print-section h2 { margin:0 0 2mm; padding-bottom:1mm; border-bottom:1px solid #555; font-size:12pt; }
        .print-table { width:100%; border-collapse:collapse; table-layout:fixed; }
        .print-table th,.print-table td { border:1px solid #666; padding:2mm; vertical-align:top; overflow-wrap:anywhere; }
        .print-table th { background:#eee; }
        .print-table .print-key { width:36%; background:#f2f2f2; font-weight:700; }
        .print-array-table { font-size:8pt; }
        .admin-form-page { margin-top:8mm; padding-top:5mm; border-top:1px solid #555; }
        .admin-form-page + .admin-form-page { break-before:page; page-break-before:always; }
        .admin-form-page-title { margin:0 0 5mm; text-align:center; font-size:15pt; }
        .admin-form-section-title { margin:5mm 0 2mm; font-size:11pt; }
        .admin-form-list { padding-left:7mm; }
        .admin-form-list li { margin:2mm 0; }
        .admin-form-note { margin:3mm 0; font-size:9pt; }
        .admin-signature { margin-top:8mm; text-align:right; line-height:2; }
        .admin-consent-record + .admin-consent-record { break-before:page; page-break-before:always; }
        .print-signatures { display:flex; justify-content:space-between; gap:12mm; margin-top:12mm; }
        .print-signatures > div:last-child { text-align:right; }
        .print-officer { margin-top:10mm; padding-top:4mm; border-top:1px solid #555; }
        .print-officer p { margin:2mm 0 8mm; }
        .print-avoid-break { break-inside:avoid; page-break-inside:avoid; }
        .admin-print-empty { color:#555; }
        a { color:#111; text-decoration:none; }
      </style></head><body>${documentNode.cloneNode(true).outerHTML}</body></html>`);
    iframeDoc.close();
    const iframeWindow = iframe.contentWindow;
    const cleanup = () => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    };
    iframeWindow.addEventListener('afterprint', cleanup, { once: true });
    setTimeout(() => {
      iframeWindow.focus();
      iframeWindow.print();
      setTimeout(cleanup, 30000);
    }, 250);
  };

  useEffect(() => () => {
    document.body.classList.remove('admin-application-view-open');
  }, []);

  if (loading) {
    return <div className="loading-screen"><div className="loader-spinner"></div><p>Loading Applications...</p></div>;
  }
  if (error) return <div className="admin-error">Error: {error}</div>;

  const filteredData = getFilteredData();

  return (
    <>
      <div className="admin-kishan-container">
        <div className="header-section">
          <h2>Kishan Avedan Admin Panel</h2>
          <p>Manage and review farmer subsidy applications</p>
        </div>
        <div className="admin-controls-bar">
          <div className="admin-tabs">
            {SCHEME_TYPES.map((tab) => (
              <button key={tab} type="button" className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => {
                setActiveTab(tab);
                setSearchQuery('');
                setStatusFilter('all');
              }}>
                {SCHEMES[tab].name}<span className="admin-tab-count">{data[tab].length}</span>
              </button>
            ))}
          </div>
          <div className="admin-filters">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search Name, Form ID, Mobile..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="search-input" />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="status-select">
              <option value="all">All Applications</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead><tr>
              <th>Form ID</th><th>Scheme</th><th>Applicant Name</th><th>Father's Name</th>
              <th>Village</th><th>District</th><th>Mobile</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr><td colSpan="9" className="no-data"><div className="no-data-content"><span>📋</span><p>No applications found matching your criteria.</p></div></td></tr>
              ) : filteredData.map((item, index) => (
                <tr key={`${item.schemeType}-${item.form_id}-${index}`} className="data-row">
                  <td className="form-id-cell">{item.form_id}</td>
                  <td className="scheme-cell"><strong>{SCHEMES[item.schemeType].name}</strong><small>{SCHEMES[item.schemeType].english}</small></td>
                  <td className="name-cell">{item.name}</td><td>{item.father}</td><td>{item.village}</td>
                  <td>{item.district}</td><td>{item.mobile}</td>
                  <td><span className={`status-badge ${item.isComplete ? 'completed' : 'pending'}`}><span className="status-dot"></span>{item.isComplete ? 'Completed' : 'Pending'}</span></td>
                  <td className="action-cell"><button type="button" className="view-btn" onClick={() => openApplicationView(item)}>देखें</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {viewingApplication && (
        <div className="application-preview-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeApplicationView();
        }}>
          <div className="application-preview-modal" role="dialog" aria-modal="true" aria-label="आवेदन पूर्वावलोकन">
            <div className="preview-modal-head">
              <div className="preview-heading-copy">
                <span className="preview-eyebrow">पूर्ण आवेदन • प्रिंट पूर्वावलोकन</span>
                <h2>{SCHEMES[viewingApplication.schemeType].name}</h2>
                <span>आवेदन क्रमांक: {viewingApplication.form_id}</span>
              </div>
              <div className="preview-modal-actions">
                <button type="button" className="preview-print-btn" onClick={printApplication}>🖨 प्रिंट / PDF</button>
                <button type="button" className="preview-close" onClick={closeApplicationView} aria-label="बंद करें">×</button>
              </div>
            </div>
            <div className="preview-modal-body"><AdminPrintableApplication application={viewingApplication} /></div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminKishanAavedan;
