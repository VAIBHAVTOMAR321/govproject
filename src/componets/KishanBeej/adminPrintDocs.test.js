import { buildPrintDocuments } from './adminPrintDocs';

const kisanRecord = {
  form_id: 'FK-1001',
  raw: {
    personal: {
      full_name: 'राम सिंह', father_name: 'श्याम सिंह', gender: 'पुरुष', village: 'खडोखा',
      post: 'कोटद्वार', block: 'कोटद्वार', dist: 'पौड़ी गढ़वाल', mob: '9999999999',
      aadhar: '123456789012', category: 'general', farmer_category: 'small farmer',
      scheme_name: 'जिला योजना', bank_name: 'SBI', branch: 'Kotdwara', account: '1234567890',
      ifsc: 'SBIN0001234', garden_card: 'UDY-1', plants_no: '220', date: '2026-01-01',
      place: 'कोटद्वार', fencing_material: 'Chain Link',
      farmer_details: [
        ['स्वयं', 'राम सिंह', 'श्याम सिंह', 'खडोखा', 'खाता-1', '123456789012', '0.5'],
        ['पिता', 'श्याम सिंह', 'हरि सिंह', 'खडोखा', 'खाता-1', '123456789013', '0.5'],
      ],
    },
    expenses: {
      subsidy_rate: '80', unit_cost_per_hectare: '200000', additional_max_limit: '300000',
      measured_actual_length: '600', direct_mb_amount: '110000',
      site_verified_actual_length: '600', payable_date: '2026-02-02',
      material_expenses: [['चेनलिंक जाली', '100', 'मीटर', '500', '50000', 'आपूर्तिकर्ता', 'बिल-1']],
      footing_expenses: [['सीमेंट', '50', 'बोरी', '900', '45000', 'आपूर्तिकर्ता']],
      labour_expenses: [['खुदान एवं स्थापना', '0', '', '0', '30000']],
      other_expenses: [['वाहन व्यय', 'राम', 'खडोखा', '4567890123', '10000']],
    },
    documents: {},
  },
};

const vermiRecord = {
  form_id: 'VM-77',
  raw: {
    personal: {
      full_name: 'सुनीता देवी', father_husband_name: 'राम दास', gender: 'female',
      village: 'ढाबा', post: 'कोटद्वार', tehsil: 'कोटद्वार', block: 'कोटद्वार',
      dist: 'पौड़ी गढ़वाल', mob: '8888888888', aadhar: '222222222222',
      horticulture_card: 'UDY-9', khasra: 'खाता-2', bank_name: 'PNB', branch: 'ढाबा',
      bank_account_number: '9999', bank_ifsc: 'PNB0001', proposed_area: '0.10',
      date: '2026-01-05', place: 'ढाबा', officer: 'प्रभारी', designation: 'प्रभारी, केन्द्र',
      crop_details: [['आलू', '0.05'], ['टमाटर', '0.05']],
    },
    expenses: {
      standard_cost: '33333', subsidy_rate: '75', maximum_subsidy: '24998',
      mb_valuation_amount: '30000',
      vermi_expenses: [['ईंट', '8000'], ['सीमेंट', '7000'], ['चिनाई मजदूरी', '12000']],
    },
    documents: {},
  },
};

const orchardRecord = (name) => ({
  form_id: `OR-9${name.length}`,
  raw: {
    personal: {
      farmer_name: 'सुरेश कुमार', father_husband_name: 'महेश कुमार', gender: 'पुरुष',
      mobile: '9777777777', aadhaar: '555555555555', udyan_card_no: 'UDY-5',
      district: 'पौड़ी गढ़वाल', block: 'कोटद्वार', center_name: 'कोटद्वार',
      village: 'मण्डियाल', post: 'कोटद्वार', farmer_type: 'व्यक्तिगत कृषक',
      bank_holder_name: 'सुरेश कुमार', bank_name: 'SBI', bank_branch: 'Kotdwara',
      bank_account_number: '3003003003', bank_ifsc: 'SBIN0009999', bank_account_type: 'Savings',
      land_work_details: [
        ['स्वयं', 'सुरेश कुमार', 'महेश कुमार', 'पुरुष', 'मण्डियाल', 'खाता-1', '123/1', '0.40'],
        ['सहखातेदार', 'रेखा देवी', 'महेश कुमार', 'महिला', 'मण्डियाल', 'खाता-1', '123/1', '0.40'],
      ],
    },
    expenses: {},
    documents: {
      anudan_voucher: [
        ['चरण 1', 'मानक स्थापना', 'बिल-1', '60000', '', 'फर्म-ए'],
        ['चरण 2', 'पौध सामग्री', 'बिल-2', '40000', 'सुरेश कुमार', ''],
      ],
    },
  },
});

describe('admin print documents', () => {
  ['kisan', 'vermi', 'dragon', 'kiwi'].forEach((schemeType) => {
    it(`builds ${schemeType} documents without throwing`, () => {
      const raw =
        schemeType === 'kisan' ? kisanRecord
          : schemeType === 'vermi' ? vermiRecord
            : orchardRecord(schemeType);
      const documents = buildPrintDocuments(schemeType, { ...raw, form_id: raw.form_id, schemeType }, null);
      expect(documents.length).toBeGreaterThan(0);
      documents.forEach((doc) => {
        expect(typeof doc.html).toBe('string');
        expect(doc.html.length).toBeGreaterThan(200);
        expect(doc.html).not.toMatch(/undefined/);
        expect(doc.html).not.toMatch(/NaN/);
      });
    });
  });

  it('fencing joint-land affidavit uses the joint wording', () => {
    const documents = buildPrintDocuments('kisan', { ...kisanRecord, schemeType: 'kisan' }, null, 'उद्यान केंद्र कोटद्वार');
    expect(documents[0].html).toContain('शपथ-पत्र');
    expect(documents[0].html).toContain('संयुक्त भूमि / सह-खातेदार');
    expect(documents[0].html).toContain('सह-खातेदार का सहमति एवं अनापत्ति पत्र');
    expect(documents[0].html).toContain('चेनलिंक फेंसिंग घेराबड़');
    // KisanAavedanPortal.js → centerLine(): लॉग-इन केंद्र का नाम, सभी हस्ताक्षर ब्लॉक में
    expect(documents[0].html.match(/स्थान : उद्यान केंद्र कोटद्वार/g)).toHaveLength(2);
    expect(documents[0].html).toContain('प्रभारी, उद्यान सचल दल केन्द्र :</b> <span class="auto">उद्यान केंद्र कोटद्वार');
    expect(documents[2].html).toContain('value="उद्यान केंद्र कोटद्वार"');
  });

  it('fencing falls back to the dotted placeholder when no centre is logged in', () => {
    const documents = buildPrintDocuments('kisan', { ...kisanRecord, schemeType: 'kisan' }, null, '');
    expect(documents[0].html).toContain('स्थान : ……………………');
    expect(documents[2].html).toContain('value="……………………"');
  });

  it('fencing work document keeps the standards card and section cards', () => {
    const documents = buildPrintDocuments('kisan', { ...kisanRecord, schemeType: 'kisan' }, null, '');
    expect(documents[1].html).toContain('राजसहायता के मानक');
    expect(documents[1].html).toContain('प्रपत्र पर नहीं छपेंगे — यहीं से अपडेट करें');
    expect(documents[1].html).toContain('इकाई लागत ₹ प्रति हेक्टेयर');
    expect(documents[1].html).toContain('अ · सामग्री');
    expect(documents[1].html).toContain('कुल व्यय');
  });

  it('fencing solo-land affidavit uses the beneficiary self-declaration wording', () => {
    const solo = {
      ...kisanRecord,
      raw: {
        ...kisanRecord.raw,
        personal: { ...kisanRecord.raw.personal, farmer_details: [kisanRecord.raw.personal.farmer_details[0]] },
      },
    };
    const documents = buildPrintDocuments('kisan', { ...solo, schemeType: 'kisan' }, null, '');
    expect(documents[0].html).toContain('लाभार्थी स्व-घोषणा एवं शपथ-पत्र');
    expect(documents[0].html).toContain('चेनलिंक फेंसिंग की घेरबाड़');
  });

  it('vermi work document keeps only the section card and the help note', () => {
    const documents = buildPrintDocuments('vermi', { ...vermiRecord, schemeType: 'vermi' }, null, '');
    expect(documents[2].html).toContain('वर्मी कम्पोस्ट इकाई — सामग्री एवं व्यय');
    expect(documents[2].html).toContain('कार्य / सामग्री: ईंट, सीमेंट');
    expect(documents[2].html).not.toContain('उपलब्ध विकल्प');
    expect(documents[2].html).not.toContain('फसल विकल्प');
  });

  it('kiwi uses its own subsidy wording', () => {
    const documents = buildPrintDocuments('kiwi', { ...orchardRecord('kiwi'), schemeType: 'kiwi' }, null);
    expect(documents[0].html).toContain('कीवी उद्यान स्थापना — आवेदन पत्र');
    expect(documents[1].html).toContain('देय अनुदान / राजसहायता');
  });

  it('dragon uses its own subsidy wording and scheme clauses', () => {
    const documents = buildPrintDocuments('dragon', { ...orchardRecord('dragon'), schemeType: 'dragon' }, null);
    expect(documents[1].html).toContain('देय अनुदान (');
    expect(documents[2].html).toContain('ड्रैगन फ्रूट (कमलम)');
    expect(documents[2].html).not.toContain('उत्तराखण्ड कीवी नीति');
  });
});
