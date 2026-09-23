
import React, { useEffect, useRef } from "react";
import "./kisan-aavedan-portal.css"; // Make sure this points to the updated CSS file

const HTML_BODY = `
<div class="shell">
  <aside class="rail noprint">
    <h1>अनुदान देयक प्रपत्र</h1>
    <p class="sub">कार्यालय — उद्यान विशेषज्ञ, कोटद्वार (गढ़वाल)<br/>वित्तीय वर्ष 2026-27</p>
    <div class="grp">योजना</div>
    <div style="margin:0 16px 4px">
      <select id="scheme">
        <option value="fencing">चेनलिंक फेंसिंग / घेरबाड़</option>
      </select>
    </div>
    <div class="grp">प्रपत्र</div>
    <nav id="nav"></nav>
    <div class="grp">फाइल</div>
    <div class="tools">
      <button id="bSave">सहेजें</button>
      <button id="bOpen">खोलें</button>
      <button id="bPrint">प्रिंट</button>
      <button id="bNew">नया</button>
    </div>
    <input accept=".json" hidden="" id="fileIn" type="file"/>
  </aside>
  <main>
    <section class="view" data-v="application">
      <h2 class="head">आवेदन पत्र</h2>
      <p class="lead" id="appLead"></p>
      <div id="applicationOut"></div>
    </section>
    <section class="view on" data-v="work">
      <h2 class="head">व्यय विवरण</h2>
      <p class="lead" id="workLead"></p>
      <div class="card" id="standardsCard">
        <div class="cap">
          <i></i><span id="standardsTitle">राजसहायता के मानक</span>
          <small>प्रपत्र पर नहीं छपेंगे — यहीं से अपडेट करें</small>
        </div>
        <div class="pad" id="standardsBody"></div>
      </div>
      <div id="workBody"></div>
    </section>
    <section class="view" data-v="bill">
      <h2 class="head">देयक प्रपत्र</h2>
      <p class="lead" id="billLead"></p>
      <div id="billOut"></div>
    </section>
  </main>
</div>
<div hidden="" id="datalists"></div>
<div class="strip noprint" id="bottomStrip">
  <div class="cell"><div class="k">बिल का कुल योग</div><div class="v num" id="sBill">₹ 0</div></div>
  <div class="cell"><div class="k">एम०बी० मूल्यांकन</div><div class="v num" id="sMb">—</div></div>
  <div class="cell pay"><div class="k">देय राजसहायता <span id="sRate"></span></div><div class="v num" id="sSub">₹ 0</div></div>
  <div class="cell"><div class="k">कृषक द्वारा वहन</div><div class="v num" id="sOwn">₹ 0</div></div>
  <div class="msg" id="sMsg"></div>
  <button class="go" id="bGo">देयक देखें</button>
</div>
`;

const HTML_LOGIC = `
"use strict";
const num  = v => { const n = parseFloat(String(v==null?"":v).replace(/[^0-9.\\-]/g,"")); return isNaN(n)?0:n; };
const fmt0 = n => "₹ " + Math.round(Number(n)||0).toLocaleString("en-IN");
const fmtN = n => (Number(n)||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
const esc  = s => String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&quot;"}[c]));

const ONE=["","एक","दो","तीन","चार","पाँच","छह","सात","आठ","नौ","दस","ग्यारह","बारह","तेरह","चौदह","पन्द्रह","सोलह","सत्रह","अठारह","उन्नीस","बीस","इक्कीस","बाईस","तेईस","चौबीस","पच्चीस","छब्बीस","सत्ताईस","अट्ठाईस","उनतीस","तीस","इकतीस","बत्तीस","तैंतीस","चौंतीस","पैंतीस","छत्तीस","सैंतीस","अड़तीस","उनतालीस","चालीस","इकतालीस","बयालीस","तैंतालीस","चवालीस","पैंतालीस","छियालीस","सैंतीस","अड़तालीस","उनचास","पचास","इक्यावन","बावन","तिरेपन","चौवन","पचपन","छप्पन","सत्तावन","अट्ठावन","उनसठ","साठ","इकसठ","बासठ","तिरेसठ","चौंसठ","पैंसठ","छियासठ","सड़सठ","अड़सठ","उनहत्तर","सत्तर","इकहत्तर","बहत्तर","तिहत्तर","चौहत्तर","पचहत्तर","छिहत्तर","सतहत्तर","अठहत्तर","उन्यासी","अस्सी","इक्यासी","बयासी","तिरासी","चौरासी","पचासी","छियासी","सत्तासी","अट्ठासी","नवासी","नब्बे","इक्यानवे","बानवे","तिरानवे","चौरानवे","पंचानवे","छियानवे","सत्तानवे","अट्ठानवे","निन्यानवे"];
const three = n => { const s=Math.floor(n/100), r=n%100; let o = s?ONE[s]+" सौ":""; if(r) o+=(o?" ":"")+ONE[r]; return o; };
function words(v){
  const n = Math.round(Math.abs(num(v))); if(!n) return "शून्य";
  const cr=Math.floor(n/10000000), lk=Math.floor(n%10000000/100000), th=Math.floor(n%100000/1000), hn=n%1000;
  const o=[]; if(cr)o.push(three(cr)+" करोड़"); if(lk)o.push(three(lk)+" लाख");
  if(th)o.push(three(th)+" हजार"); if(hn)o.push(three(hn));
  return o.join(" ");
}

const LISTS = {
  material:["चेनलिंक जाली (10 गेज)","चेनलिंक जाली (12 गेज)","कंटीले तार (बार्बड वायर)","एंगल आयरन 35×35×5 मि०मी०","एंगल आयरन 40×40×5 मि०मी०","एंगल आयरन 50×50×5 मि०मी०","लोहे के खम्बे","नटबोल्ट","बाइंडिंग वायर","लोहे का गेट","पेंट / प्राइमर"],
  footing:["सीमेंट","रेत","बजरी","रेत बजरी","ईंट","पत्थर","सरिया"],
  unit:["मीटर","नग","किग्रा","बोरी","घन मीटर","ट्रॉली","फीट","क्विंटल"],
  work:["गड्ढा खुदान","खम्बों की स्थापना","चेनलिंक जाली लगाना","कंटीले तार लगाना","गेट लगाना","फेंसिंग कार्य","अन्य श्रमिक कार्य"],
  other:["फोटोग्राफी / जियो टैग फोटोग्राफ","ढुलाई","लोडिंग / अनलोडिंग","मजदूरी","अन्य व्यय"]
};
const DL = {dlMaterial:"material", dlFooting:"footing", dlUnit:"unit", dlWork:"work", dlOther:"other"};

const COLS = {
  material:{amt:r=>num(r.amt),c:[["item","किस कार्य / सामग्री का बिल है",0,0,"dlMaterial"],["sup","आपूर्तिकर्ता / फर्म"],["bill","बिल सं०"],["amt","बिल राशि (₹)",0,"n"]]},
  footing:{amt:r=>num(r.amt),c:[["item","किस कार्य / सामग्री का बिल है",0,0,"dlFooting"],["sup","आपूर्तिकर्ता / फर्म"],["amt","बिल राशि (₹)",0,"n"]]},
  labour:{amt:r=>num(r.amt),c:[["work","कार्य का विवरण",0,0,"dlWork"],["amt","भुगतान राशि (₹)",0,"n"]]},
  other:{amt:r=>num(r.amt),c:[["item","विवरण",0,0,"dlOther"],["name","प्राप्तकर्ता का नाम"],["vil","ग्राम"],["aad","आधार सं०"],["amt","राशि (₹)",0,"n"]]}
};
const sum = k => (S[k]||[]).reduce((a,r)=>a+COLS[k].amt(r),0);

const SECTIONS = {
  fencing:[["material","अ · सामग्री","चेनलिंग / कंटीले वायर, एंगल आयरन, नटबोल्ट आदि → देयक पंक्ति 1"],["footing","ब · फुटिंग सामग्री","सीमेंट, रेत, बजरी → देयक पंक्ति 2"],["labour","स · श्रमिक कार्य","→ देयक पंक्ति 3"],["other","अन्य","→ देयक पंक्ति 4"]]
};

const blank = () => ({
  scheme:"fencing",
  lists: JSON.parse(JSON.stringify(LISTS)),
  norm:{fRate:80, fCap:"", fCostHa:200000},
  f:{name:"",father:"",village:"",post:"",block:"",dist:"",mob:"",aadhar:"",khasra:"",bank:"",branch:"",acct:"",ifsc:"",cat:"सामान्य",farmerCat:"सीमांत",gardenCard:"",plants:"",irrigation:"उपलब्ध",fenceStandardCost:"",planType:"जिला योजना", fenceMaterial:"चेनलिंक जाली", gender:"पुरुष",nali:"",area:"",fenceLen:"",poles:"",mbNo:"", verifiedLen:"260",mbLen:"",mbRate:"",mbAmt:"", date:new Date().toISOString().slice(0,10), place:"", officer:"", desig:""},
  landRows:[{relation:"स्वयं",name:"",father:"",khasra:"",aadhaar:"",hec:"0.40"},{relation:"भाई",name:"",father:"",khasra:"",aadhaar:"",hec:""},{relation:"पुत्र",name:"",father:"",khasra:"",aadhaar:"",hec:""},{relation:"पिता",name:"",father:"",khasra:"",aadhaar:"",hec:""},{relation:"अन्य",name:"",father:"",khasra:"",aadhaar:"",hec:""}],
  material:[{}], footing:[{}], labour:[{}], other:[{}]
});
let S = blank();
const KEY = "anudan_form_v3";
const save = () => { try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} };

function mbValue(){
  const direct = num(S.f.mbAmt);
  if(direct>0) return direct;
  const l=num(S.f.mbLen), r=num(S.f.mbRate);
  return (l>0 && r>0) ? l*r : 0;
}
function calc(){
  const parts = [
      ["सामग्री — चेनलिंग / कंटीले वायर, एंगल आयरन, नटबोल्ट आदि", sum("material")],
      ["फुटिंग सामग्री — सीमेंट, रेत, बजरी", sum("footing")],
      ["श्रमिक कार्य — गड्ढा खुदान, खम्बों की स्थापना, चेनलिंक / कंटीले वायर लगाना, गेट लगाना आदि", sum("labour")],
      ["अन्य", sum("other")]
    ];
  const bill = parts.reduce((a,p)=>a+p[1],0);
  const rate = num(S.norm.fRate)/100;
  const cap  = num(S.norm.fCap);
  let mb=0, base=0, bases=[], hec=0, allowedLen=0, verifiedLen=0, ratio=1, actualArea=0, standardCost=0, shortfall=0;
  mb = mbValue();
  const app = applicationData();
  hec = app.allowedArea ? app.totalHec : 0;
  const std = app.allowedArea ? fenceStandard(hec) : null;
  allowedLen = std ? std.len : 0;
  verifiedLen = num(S.f.verifiedLen);
  ratio = (allowedLen>0 && verifiedLen>0) ? (verifiedLen/allowedLen) : 1;
  actualArea = hec * ratio;
  const costHa = num(S.norm.fCostHa)||200000;
  standardCost = actualArea>0 ? Math.round(actualArea*costHa) : 0;
  shortfall = Math.max(0, allowedLen - verifiedLen);
  if(bill>0) bases.push({key:"bill",label:"बिल / वाउचर के अनुसार कुल व्यय",val:bill});
  if(mb>0) bases.push({key:"mb",label:"एम०बी० मूल्यांकन धनराशि",val:mb});
  if(standardCost>0) bases.push({key:"standard",label:"मानक लागत (क्षेत्रफल × ₹2,00,000)",val:standardCost});
  base = bases.length ? Math.min(...bases.map(b=>b.val)) : 0;
  let sub = Math.round(base*rate);
  const capped = cap>0 && sub>cap;
  if(capped) sub = cap;
  const eff = bill ? sub/bill : 0;
  const rows=[]; let run=0;
  parts.forEach((p,i)=>{
    const s = (i<parts.length-1) ? Math.round(p[1]*eff) : Math.max(0, sub-run);
    run += s;
    rows.push({name:p[0], amt:p[1], sub:s, own:p[1]-s});
  });
  return {bill, mb, base, bases, rate, sub, own:bill-sub, cap, capped, over: mb>0 && bill>0 && bill>mb,hec, allowedLen, verifiedLen, mbLen:num(S.f.mbLen), ratio, actualArea, standardCost, shortfall, rows};
}

function tableHTML(k){
  const cfg=COLS[k];
  let h='<table class="expense-table"><thead><tr><th style="width:38px">क्र०</th>';
  cfg.c.forEach(c=>h+=\`<th>\${c[1]}</th>\`);
  h+='</tr></thead><tbody>';
  S[k].forEach((r,i)=>{
    h+=\`<tr><td class="n">\${i+1}</td>\`;
    cfg.c.forEach(c=>{
      if(c[0]==="_amt"){ h+=\`<td class="calc num">\${fmtN(cfg.amt(r))}</td>\`; return; }
      h+=\`<td><input data-row="\${k}" data-i="\${i}" data-k="\${c[0]}" value="\${esc(r[c[0]]||"")}"\`+ (c[4]?\` list="\${c[4]}"\`:"") + (c[3]==="n"?' inputmode="decimal"':"") + \`></td>\`;
    });
    h+=\`<td><button class="rm" data-del="\${k}" data-i="\${i}" title="पंक्ति हटाएँ">×</button></td></tr>\`;
  });
  const ai = cfg.c.findIndex(c=>c[0]==="_amt"||c[0]==="amt");
  h+=\`<tr class="tot"><td colspan="\${ai+1}" style="text-align:right">योग</td><td class="calc num" data-tot="\${k}">\${fmtN(sum(k))}</td>\`;
  for(let j=ai+1;j<cfg.c.length;j++) h+="<td></td>";
  h+='</tr></tbody></table>';
  h+=\`<button class="addrow" data-add="\${k}">+ पंक्ति जोड़ें</button>\`;
  return h;
}
function buildLists(){
  document.getElementById("datalists").innerHTML =
    Object.keys(DL).map(i=>\`<datalist id="\${i}">\`+(S.lists[DL[i]]||[]).map(v=>\`<option value="\${esc(v)}">\`).join("")+"</datalist>").join("");
}

function buildNav(){
  const nav=document.getElementById("nav"); if(!nav) return;
  nav.innerHTML='<a data-go="application">आवेदन पत्र</a><a class="on" data-go="work">व्यय विवरण</a><a data-go="bill">देयक प्रपत्र</a>';
}

function toggleStrip(){
  const strip=document.getElementById("bottomStrip");
  if(!strip) return;
  strip.style.display = "";
}

function buildStandards(){
  const body=document.getElementById("standardsBody");
  const title=document.getElementById("standardsTitle");
  if(!body) return;
  title.textContent="फेंसिंग राजसहायता के मानक";
  body.innerHTML=\`<div class="grid"><div><label class="f">फेंसिंग राजसहायता दर (%)</label><select data-norm="fRate"><option value="50">50%</option><option value="80">80%</option></select></div><div><label class="f">इकाई लागत ₹ प्रति हेक्टेयर</label><input data-norm="fCostHa" inputmode="decimal" placeholder="2,00,000"></div><div><label class="f">अतिरिक्त अधिकतम सीमा ₹ (वैकल्पिक)</label><input data-norm="fCap" inputmode="decimal" placeholder="खाली = कोई अलग सीमा नहीं"></div></div><p class="lead" style="margin:12px 0 0">विभागीय मानक: इकाई लागत ₹2,00,000 प्रति हेक्टेयर। राजसहायता तीन आधारों — बिल / वाउचर का योग, एम०बी० मूल्यांकन, तथा मानक लागत — इनमें से जो न्यूनतम हो, उस पर देय होगी।</p>\`;
  body.querySelectorAll("[data-norm]").forEach(el=>el.value=S.norm[el.dataset.norm]);
}
function buildWork(){
  buildStandards();
  document.getElementById("workLead").textContent = "बिल एवं वाउचर के अनुसार पूरा व्यय भरें। हर अनुभाग का योग अपने आप देयक की सम्बंधित पंक्ति में चला जाएगा।";
  document.getElementById("workBody").innerHTML = SECTIONS.fencing.map(([k,t,n])=>
    \`<div class="card"><div class="cap"><i></i>\${t}<small>\${n}</small></div><div class="pad">\${tableHTML(k)}</div></div>\`).join("");
  buildLists();
  document.querySelectorAll("[data-norm]").forEach(el=>el.value = S.norm[el.dataset.norm]);
}

const FENCE_AREA_MAP = [
  {nali:10,hec:0.20,len:240,poles:81},{nali:15,hec:0.30,len:260,poles:87},{nali:20,hec:0.40,len:280,poles:94},{nali:25,hec:0.50,len:300,poles:101},{nali:30,hec:0.60,len:320,poles:107},{nali:35,hec:0.70,len:340,poles:114},{nali:40,hec:0.80,len:360,poles:121},{nali:45,hec:0.90,len:380,poles:127},{nali:50,hec:1.00,len:400,poles:134},{nali:60,hec:1.20,len:440,poles:147},{nali:70,hec:1.40,len:480,poles:161},{nali:80,hec:1.60,len:520,poles:174},{nali:90,hec:1.80,len:560,poles:187},{nali:100,hec:2.00,len:600,poles:201}
];
const ALLOWED_FENCE_HEC = FENCE_AREA_MAP.map(x=>x.hec);
function fenceStandard(hec){ const h = Math.round(num(hec)*100)/100; if(h<=0) return null; return FENCE_AREA_MAP.find(x=>Math.abs(x.hec-h)<0.0001) || null; }
function isAllowedFenceHec(hec){ const h = Math.round(num(hec)*100)/100; return ALLOWED_FENCE_HEC.some(x=>Math.abs(x-h)<0.0001); }
function fenceMaterialName(){ return S.f.fenceMaterial==="कंटीले तार" ? "कंटीले तार (बार्बड वायर)" : "चेनलिंक जाली"; }
const LANG_FIELDS=["planType","gender","fenceMaterial"];
function rebuildDocs(){ if(cur==="application" && document.getElementById("applicationOut")) buildApplication(); if(cur==="bill" && document.getElementById("billOut")) buildBill(); save(); }
function isFemale(){ return (S.f.gender||"पुरुष")==="महिला"; }
function G(m,f){ return isFemale()?f:m; }
function applicantWord(){ return G("आवेदक","आवेदिका"); }
function beneficiaryWord(){ return G("लाभार्थी","लाभार्थिनी"); }
function fenceHeading(){ return S.f.fenceMaterial==="कंटीले तार" ? "कंटीले तार" : "चेनलिंक फेंसिंग"; }
function fenceKaamPhrase(){ return S.f.fenceMaterial==="कंटीले तार" ? "कंटीले तार की घेरबाड़" : "चेनलिंक फेंसिंग की घेरबाड़"; }
function applicationData(){
  const totalHec = Math.round((S.landRows||[]).reduce((a,r)=>a+num(r.hec),0)*100)/100;
  const exact = fenceStandard(totalHec);
  const totalNali = exact ? exact.nali : 0;
  const plants = num(S.f.plants);
  const area = totalHec;
  const allowedArea = isAllowedFenceHec(totalHec);
  const eligible = !!S.f.gardenCard && plants>0 && allowedArea && (plants/area)>=100;
  return {totalHec, totalNali, exact, plants, area, allowedArea, eligible, minPlants:area*100};
}
function affidavitHasCoSharers(d){ const rows=S.landRows||[]; const ownHec=num(rows[0]?.hec); const totalHec=num(d?.totalHec); return totalHec > ownHec + 0.000001; }
function affHec(v){ const n=num(v); return n>0 ? n.toFixed(2) : "…………"; }
function affNali(v){ const n=num(v); return n>0 ? n.toFixed(2).replace(/\\.00$/,"") : "…………"; }

function buildFencingApplication(){
  const d=applicationData();
  const rate=num(S.norm.fRate);
  const standard = (d.allowedArea && d.totalHec>0) ? Math.round(d.totalHec*(num(S.norm.fCostHa)||200000)) : 0;
  const subsidy=standard>0 ? Math.round(standard*rate/100) : 0;
  const status = !S.f.gardenCard ? \`<div class="appbad"><b>फेंसिंग पात्रता:</b> अयोग्य — उद्यान कार्ड संख्या अनिवार्य है।</div>\` : d.plants<=0 ? \`<div class="appbad"><b>फेंसिंग पात्रता:</b> अयोग्य — पौधों की संख्या भरना अनिवार्य है।</div>\` : d.area<=0 ? \`<div class="appbad"><b>फेंसिंग पात्रता:</b> पहले भूमि का क्षेत्रफल चुनें।</div>\` : !d.allowedArea ? \`<div class="appbad"><b>आवेदन स्थिति:</b> कुल क्षेत्रफल निर्धारित मैपिंग की स्वीकृत श्रेणी से मेल नहीं खाता।</div>\` : d.plants/d.area<100 ? \`<div class="appbad"><b>फेंसिंग पात्रता:</b> अयोग्य — न्यूनतम 100 पौधे प्रति हे० आवश्यक हैं।</div>\` : \`<div class="appok"><b>फेंसिंग पात्रता:</b> पात्र — न्यूनतम 100 पौधे प्रति हे० की शर्त पूरी है।</div>\`;
  document.getElementById("applicationOut").innerHTML=\`<div class="appdoc"><div style="text-align:center;font-size:11.5px;color:#65746B;margin:2px 0 4px">उद्यान विभाग · वित्तीय वर्ष 2026-27</div><h3 style="text-decoration:underline">\${esc(S.f.planType||"जिला योजना")} अन्तर्गत \${fenceHeading()} हेतु</h3><h4 style="color:var(--ink);font-size:16px;font-weight:600">कृषक आवेदन पत्र</h4><div class="appnote"><b>योजना:</b><select data-f="planType" style="margin-left:8px;padding:3px"><option>जिला योजना</option><option>राज्य सेक्टर योजना</option></select><span style="margin-left:18px"><b>लिंग:</b></span><select data-f="gender" style="margin-left:8px;padding:3px"><option value="पुरुष">पुरुष</option><option value="महिला">महिला</option></select><span style="margin-left:18px"><b>फेंसिंग सामग्री:</b></span><select data-f="fenceMaterial" style="margin-left:8px;padding:3px"><option value="चेनलिंक जाली">चेनलिंक जाली</option><option value="कंटीले तार">कंटीले तार</option></select><span style="margin-left:18px"><b>फेंसिंग राजसहायता दर:</b></span><select data-f="fRate" id="appRate" style="margin-left:8px;padding:3px"><option value="50">50%</option><option value="80">80%</option></select></div><h5>उद्यान कार्ड विवरण</h5><table class="landtable infoTable"><tbody><tr><td class="flabel">उद्यान कार्ड संख्या</td><td><input data-f="gardenCard" value="\${esc(S.f.gardenCard||"")}"></td></tr><tr><td class="flabel">फल पौधों की संख्या</td><td><input data-f="plants" inputmode="numeric" value="\${esc(S.f.plants||"")}"></td></tr></tbody></table><div id="fenceEligibility">\${status}</div><h5>1. \${applicantWord()} का विवरण</h5><table class="landtable infoTable"><tbody><tr><td class="flabel">\${beneficiaryWord()} / \${applicantWord()} का नाम</td><td><input data-f="name" value="\${esc(S.f.name||"")}"></td></tr><tr><td class="flabel">पिता / पति का नाम</td><td><input data-f="father" value="\${esc(S.f.father||"")}"></td></tr><tr><td class="flabel">ग्राम</td><td><input data-f="village" value="\${esc(S.f.village||"")}"></td></tr><tr><td class="flabel">पोस्ट ऑफिस</td><td><input data-f="post" value="\${esc(S.f.post||"")}"></td></tr><tr><td class="flabel">विकास खण्ड</td><td><input data-f="block" value="\${esc(S.f.block||"")}"></td></tr><tr><td class="flabel">जनपद</td><td><input data-f="dist" value="\${esc(S.f.dist||"")}"></td></tr><tr><td class="flabel">मोबाइल</td><td><input data-f="mob" value="\${esc(S.f.mob||"")}"></td></tr><tr><td class="flabel">आधार संख्या</td><td><input data-f="aadhar" value="\${esc(S.f.aadhar||"")}"></td></tr><tr><td class="flabel">वर्ग</td><td><select data-f="cat"><option>सामान्य</option><option>OBC</option><option>SC</option><option>ST</option><option>महिला</option></select></td></tr><tr><td class="flabel">कृषक श्रेणी</td><td><select data-f="farmerCat"><option>सीमांत</option><option>लघु</option><option>अन्य</option></select></td></tr></tbody></table><h5>2. बैंक विवरण (DBT हेतु)</h5><table class="landtable infoTable"><tbody><tr><td class="flabel">बैंक</td><td><input data-f="bank" value="\${esc(S.f.bank||"")}"></td></tr><tr><td class="flabel">शाखा</td><td><input data-f="branch" value="\${esc(S.f.branch||"")}"></td></tr><tr><td class="flabel">खाता संख्या</td><td><input data-f="acct" value="\${esc(S.f.acct||"")}"></td></tr><tr><td class="flabel">IFSC</td><td><input data-f="ifsc" value="\${esc(S.f.ifsc||"")}"></td></tr></tbody></table><h5>3. भूमि एवं कार्य का विवरण</h5><table class="landtable"><thead><tr><th style="width:42px">क्र.</th><th style="width:110px">भूमि किसकी</th><th>नाम (खतौनी अनुसार)</th><th>पिता का नाम</th><th style="width:120px">ग्राम</th><th style="width:120px">खसरा</th><th style="width:125px">आधार संख्या</th><th style="width:110px">क्षेत्रफल (हे०)</th><th class="noprint" style="width:46px">क्रिया</th></tr></thead><tbody>\${(S.landRows||[]).map((r,i)=>\`<tr><td style="text-align:center">\${i+1}</td><td><input data-land="\${i}" data-k="relation" value="\${esc(r.relation||"")}" placeholder="भूमि किसकी"></td><td>\${i===0?\`<input class="landSelfName" value="\${esc(S.f.name||"")}" placeholder="नाम" readonly tabindex="-1">\`:\`<input data-land="\${i}" data-k="name" value="\${esc(r.name||"")}" placeholder="नाम">\`}</td><td>\${i===0?\`<input class="landSelfFather" value="\${esc(S.f.father||"")}" placeholder="पिता" readonly tabindex="-1">\`:\`<input data-land="\${i}" data-k="father" value="\${esc(r.father||"")}" placeholder="पिता">\`}</td><td><input class="landVil" value="\${esc(S.f.village||"")}" placeholder="ग्राम" readonly tabindex="-1"></td><td><input data-land="\${i}" data-k="khasra" value="\${esc(r.khasra||"")}" placeholder="खसरा"></td><td>\${i===0?\`<input class="landSelfAadhaar" value="\${esc(S.f.aadhar||"")}" placeholder="आधार" readonly tabindex="-1">\`:\`<input data-land="\${i}" data-k="aadhaar" value="\${esc(r.aadhaar||"")}" inputmode="numeric" maxlength="12" placeholder="आधार">\`}</td><td><input data-land="\${i}" data-k="hec" inputmode="decimal" value="\${esc(r.hec||"")}" placeholder="हे०"></td><td class="noprint" style="text-align:center">\${i===0?"":\`<button type="button" class="land-remove" data-land-del="\${i}" title="हटाएँ">×</button>\`}</td></tr>\`).join("")}<tr class="tot"><td colspan="7" style="text-align:right">प्रस्तावित भूमि का कुल क्षेत्रफल (हे०)</td><td class="calc">\${fmtN(d.totalHec)}</td><td class="noprint"></td></tr></tbody></table><div class="noprint land-row-actions"><button type="button" class="addrow" id="addLandRow">+ पंक्ति जोड़ें</button></div><h5>4. सारांश — क्षेत्रफल, फेंसिंग एवं राजसहायता</h5><table><thead><tr><th>क्षेत्रफल (हे०)</th><th>अनुमन्य लम्बाई (मी०)</th><th>खम्बे</th><th>लागत (₹)</th><th>राजसहायता</th></tr></thead><tbody><tr><td style="text-align:center" id="sumHec">\${d.allowedArea?d.totalHec.toFixed(2):"—"}</td><td style="text-align:center" id="sumLen">\${d.exact?d.exact.len:"—"}</td><td style="text-align:center" id="sumPoles">\${d.exact?d.exact.poles:"—"}</td><td style="text-align:right" id="sumCost">\${fmt0(standard)}</td><td style="text-align:right" id="sumSubsidy">\${fmt0(subsidy)}</td></tr></tbody></table><h5>5. घोषणा</h5><div class="appnote">उपर्युक्त सभी विवरण सत्य हैं। मुझे पूर्व में अन्य योजना से अनुदान नहीं मिला।</div><div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:22px;gap:20px"><div style="flex:0 0 auto"><div style="display:flex;gap:6px;align-items:baseline"><b>दिनांक :</b><input class="ln sm" type="date" data-f="date"></div><div style="display:flex;gap:6px;align-items:baseline;margin-top:8px"><b>स्थान :</b><input class="ln sm" data-f="place"></div></div><div style="text-align:center;min-width:240px;border-top:1px solid #16281E;padding-top:5px">हस्ताक्षर \${G("कृषक","कृषिका")}<br><span class="auto" id="appCertName">\${esc(S.f.name||"")}</span></div></div></div>\${buildFencingAffidavitInfoPreview(d)}\${buildFencingAffidavit(d)}\`;
  document.querySelectorAll("#applicationOut [data-f]").forEach(el=>{ if(el.dataset.f==="fRate") el.value=S.norm.fRate; else if(S.f[el.dataset.f]!==undefined) el.value=S.f[el.dataset.f]; });
  const rr=document.getElementById("appRate"); if(rr) rr.value=S.norm.fRate;
  updateApplicationDerived();
}

function buildFencingAffidavitInfoPreview(d){
  const f=S.f||{};
  const value=(v)=>esc(String(v||"").trim()||"…………");
  const total=d.allowedArea ? Number(d.totalHec).toFixed(2) : "…………";
  const type=affidavitHasCoSharers(d) ? "संयुक्त भूमि / सह-खातेदार वाला शपथ-पत्र" : "सामान्य शपथ-पत्र";
  return \`<div class="aff-preview noprint"><div class="aff-preview-title">शपथ-पत्र हेतु स्वतः भरने वाली जानकारी — \${type}</div><div class="aff-preview-grid"><div class="aff-preview-item"><span class="aff-preview-label">नाम</span><span class="aff-preview-value">\${value(f.name)}</span></div><div class="aff-preview-item"><span class="aff-preview-label">पिता / पति का नाम</span><span class="aff-preview-value">\${value(f.father)}</span></div><div class="aff-preview-item"><span class="aff-preview-label">ग्राम</span><span class="aff-preview-value">\${value(f.village)}</span></div><div class="aff-preview-item"><span class="aff-preview-label">डाकघर</span><span class="aff-preview-value">\${value(f.post)}</span></div><div class="aff-preview-item"><span class="aff-preview-label">विकास खण्ड</span><span class="aff-preview-value">\${value(f.block)}</span></div><div class="aff-preview-item"><span class="aff-preview-label">जनपद</span><span class="aff-preview-value">\${value(f.dist)}</span></div><div class="aff-preview-item"><span class="aff-preview-label">उद्यान कार्ड संख्या</span><span class="aff-preview-value">\${value(f.gardenCard)}</span></div><div class="aff-preview-item"><span class="aff-preview-label">कुल प्रस्तावित क्षेत्रफल</span><span class="aff-preview-value">\${total} हे०</span></div></div></div>\`;
}

function buildFencingAffidavit(d){
  const f=S.f||{};
  const joint=affidavitHasCoSharers(d);
  const total=affHec(d.totalHec);
  const totalNali=affNali(d.totalNali);
  const first=(S.landRows&&S.landRows[0])||{};
  const coRows=(S.landRows||[]).slice(1).filter(r=>num(r.hec)>0||String(r.name||"").trim()||String(r.relation||"").trim());
  const plan=esc(f.planType||"जिला योजना");
  const name=esc(f.name||"…………");
  const father=esc(f.father||"…………");
  const village=esc(f.village||"…………");
  const post=esc(f.post||"…………");
  const dist=esc(f.dist||"…………");
  const card=esc(f.gardenCard||"…………");
  const khasra=esc(first.khasra||"…………");
  const block=esc(f.block||"…………");
  if(!joint){
    return \`<div class="affidavit-doc aff-page-break"><div class="aff-head"><div class="aff-kicker">उद्यान विभाग · वित्तीय वर्ष 2026-27</div><div class="aff-title">शपथ-पत्र</div><div class="aff-sub">(\${plan} अन्तर्गत \${fenceHeading()} घेराबड़ कार्य हेतु)</div><div class="aff-line"></div></div><div class="aff-meta"><div><span>नाम</span><b>\${name}</b></div><div><span>पिता / पति का नाम</span><b>\${father}</b></div><div><span>ग्राम</span><b>\${village}</b></div><div><span>डाकघर</span><b>\${post}</b></div><div><span>विकास खण्ड</span><b>\${block}</b></div><div><span>जनपद</span><b>\${dist}</b></div><div><span>उद्यान कार्ड</span><b>\${card}</b></div><div><span>खसरा (स्वयं)</span><b>\${khasra}</b></div></div><div class="aff-intro">मैं <b>\${name}</b> \${G("पुत्र","पुत्री")} <b>\${father}</b>, निवासी ग्राम <b>\${village}</b>, जनपद <b>\${dist}</b>, शपथपूर्वक कथन \${G("करता","करती")} हूँ कि:</div><div class="aff-item">1. मेरा नाम, पता एवं अन्य व्यक्तिगत विवरण पूर्णतः सत्य हैं।</div><div class="aff-item">2. मैंने उद्यान विभाग, कोटद्वार में विधिवत आवेदन किया है।</div><div class="aff-item">3. इससे पूर्व मैंने इस कार्य हेतु किसी अन्य योजना से अनुदान नहीं प्राप्त किया है।</div><div class="aff-item">4. भूमि मेरे वैधानिक स्वामित्व में है।</div><table class="aff-land"><thead><tr><th>ग्राम</th><th>खसरा</th><th>कुल क्षेत्रफल (हे०)</th><th>कुल क्षेत्रफल (नाली)</th></tr></thead><tbody><tr><td>\${village}</td><td>\${khasra}</td><td class="right">\${total}</td><td class="right">\${totalNali}</td></tr></tbody></table><div class="aff-item">5. भूमि विवाद रहित है।</div><div class="aff-item">6. कार्य विभागीय मानकों के अनुरूप ही कराया जाएगा।</div><div class="aff-decl">मैं यह शपथ-पत्र स्वेच्छा से सत्यनिष्ठा के साथ दे रहा / रही हूँ।</div><div class="aff-sign"><div class="box">स्थान: \${village}<br>दिनांक: \${esc(f.date||"…………")}</div><div class="box line">\${G("शपथकर्ता","शपथकर्त्री")} के हस्ताक्षर<br>\${name}</div></div></div>\`;
  }
  const coTable=coRows.length ? coRows.map((r,i)=>\`<tr><td style="text-align:center">\${i+1}</td><td>\${esc(r.name||"…………")}</td><td>\${esc(r.relation||"…………")}</td><td>\${esc(r.khasra||"…………")}</td><td>\${esc(r.aadhaar||"…………")}</td><td class="right">\${affHec(r.hec)}</td></tr>\`).join("") : \`<tr><td colspan="6" style="text-align:center">कोई सह-खातेदार विवरण उपलब्ध नहीं</td></tr>\`;
  return \`<div class="affidavit-doc aff-page-break"><div class="aff-head"><div class="aff-kicker">उद्यान विभाग · वित्तीय वर्ष 2026-27</div><div class="aff-title">शपथ-पत्र</div><div class="aff-sub">(\${fenceHeading()} घेराबड़ कार्य हेतु — संयुक्त भूमि / सह-खातेदार)</div><div class="aff-line"></div></div><div class="aff-meta"><div><span>नाम</span><b>\${name}</b></div><div><span>पिता / पति का नाम</span><b>\${father}</b></div><div><span>ग्राम</span><b>\${village}</b></div><div><span>डाकघर</span><b>\${post}</b></div><div><span>विकास खण्ड</span><b>\${block}</b></div><div><span>जनपद</span><b>\${dist}</b></div><div><span>उद्यान कार्ड</span><b>\${card}</b></div><div><span>कुल प्रस्तावित क्षेत्रफल</span><b>\${total} हे० (\${totalNali} नाली)</b></div></div><table class="aff-land"><thead><tr><th>क्र०</th><th>सह-खातेदार</th><th>\${applicantWord()} से संबंध</th><th>खसरा</th><th>आधार</th><th>क्षेत्रफल (हे०)</th></tr></thead><tbody><tr><td style="text-align:center">स्वयं</td><td>\${name}</td><td>स्वयं</td><td>\${khasra}</td><td>\${esc(f.aadhar||"…………")}</td><td class="right">\${affHec(first.hec)}</td></tr>\${coTable}<tr><td colspan="4" style="text-align:right"><b>कुल प्रस्तावित क्षेत्रफल</b></td><td class="right"><b>\${total}</b></td></tr></tbody></table><div class="aff-decl">मैं यह शपथ-पत्र स्वेच्छा से सत्यनिष्ठा के साथ दे रहा / रही हूँ।</div><div class="aff-sign"><div class="box">स्थान: \${village}<br>दिनांक: \${esc(f.date||"…………")}</div><div class="box line">\${G("शपथकर्ता","शपथकर्त्री")} के हस्ताक्षर<br>\${name}</div></div></div>\`;
}

function updateApplicationDerived(){
  if(cur!=="application" || !document.getElementById("applicationOut")) return;
  const d=applicationData();
  const rate=num(S.norm.fRate);
  const standard = d.totalHec>0 ? Math.round(d.totalHec*(num(S.norm.fCostHa)||200000)) : 0;
  const subsidy=standard>0 ? Math.round(standard*rate/100) : 0;
  const set=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=v;};
  const ownAad = document.querySelector("#applicationOut .landSelfAadhaar"); if(ownAad) ownAad.value = S.f.aadhar || "";
  const h3=document.querySelector("#applicationOut h3"); if(h3) h3.textContent = (S.f.planType||"जिला योजना")+" अन्तर्गत "+fenceHeading()+" हेतु";
  const totalCell=document.querySelector("#applicationOut .landtable .tot .calc"); if(totalCell) totalCell.textContent=fmtN(d.totalHec);
  document.querySelectorAll("#applicationOut .landVil").forEach(el=>{ el.value = S.f.village||""; });
  document.querySelectorAll("#applicationOut .landSelfName").forEach(el=>{ el.value = S.f.name||""; });
  document.querySelectorAll("#applicationOut .landSelfFather").forEach(el=>{ el.value = S.f.father||""; });
  set("sumHec", d.totalHec>0?d.totalHec.toFixed(2):"—"); set("sumLen", d.exact?d.exact.len:"—"); set("sumPoles", d.exact?d.exact.poles:"—"); set("sumCost", fmt0(standard)); set("sumSubsidy", fmt0(subsidy)); set("appCertName", S.f.name||"");
}

function buildApplication(){
  document.querySelector('[data-v="application"] .head').textContent = "फेंसिंग आवेदन पत्र";
  document.getElementById("appLead").textContent = fenceHeading()+" / घेरबाड़ के लिए आवेदन पत्र।";
  buildFencingApplication();
}

function buildAffidavit(){}

const L = (lab,k,cls="") => \`<div class="r"><b>\${lab}</b><input class="ln \${cls}" data-f="\${k}" value="\${esc(S.f[k]||"")}"></div>\`;
const LR = (lab,k) => \`<div class="r"><b>\${lab}</b><span class="auto">\${esc(S.f[k]||"…………")}</span></div>\`;

function buildFencingBill(){
  const c = calc();
  const schemeName = S.f.planType || "—";
  const title = \`\${fenceHeading()} / घेरबाड़ — राजसहायता देयक\`;
  const kaam = fenceKaamPhrase();
  const planLabel = S.f.planType || "जिला योजना";
  let tbl = \`<table><thead><tr><th style="width:44px">क्र०</th><th>कार्य का विवरण</th><th style="width:116px">कुल धनराशि</th><th style="width:138px">राजसहायता</th><th style="width:128px">कृषक द्वारा वहन</th><th style="width:88px">अभ्युक्ति</th></tr></thead><tbody>\`;
  c.rows.forEach((r,i)=>{ tbl+=\`<tr><td style="text-align:center">\${i+1}</td><td>\${esc(r.name)}</td><td class="calc num" id="r\${i}a"></td><td class="calc num" id="r\${i}s"></td><td class="calc num" id="r\${i}o"></td><td></td></tr>\`; });
  tbl+=\`<tr class="tot"><td colspan="2" style="text-align:right">योग</td><td class="calc num" id="tA"></td><td class="calc num" id="tS"></td><td class="calc num" id="tO"></td><td></td></tr></tbody></table>\`;
  document.getElementById("billOut").innerHTML = \`<div class="doc bill-doc"><div class="bill-header"><div class="bill-kicker">उद्यान विभाग · राजसहायता प्रपत्र</div><h3 class="bill-title">\${title}</h3><div class="bill-rule"></div><div class="bill-meta"><div><span>योजना</span><b>\${schemeName}</b></div><div><span>कार्यालय</span><b>उद्यान विशेषज्ञ, कोटद्वार (गढ़वाल)</b></div><div><span>वित्तीय वर्ष</span><b>2026-27</b></div></div></div><div class="serial-layout"><div class="serial-section"><div class="serial-title">1. कृषक का विवरण</div><div class="kv">\${LR("नाम कृषक:","name")}\${LR("पिता / पति:","father")}\${LR("ग्राम:","village")}\${LR("पोस्ट ऑफिस:","post")}\${LR("विकास खण्ड:","block")}\${LR("जनपद:","dist")}\${LR("आधार:","aadhar")}\${LR("मोबाइल:","mob")}<div class="r"><b>वर्ग:</b><span class="auto">\${esc(S.f.cat||"…………")}</span><b>· दर:</b><span class="auto" id="oRate"></span></div></div></div><div class="serial-section"><div class="serial-title">2. बैंक विवरण</div><div class="kv">\${LR("बैंक:","bank")}\${LR("शाखा:","branch")}\${LR("खाता संख्या:","acct")}\${LR("IFSC:","ifsc")}</div></div><div class="serial-section"><div class="serial-title">3. फेंसिंग एवं भूमि का विवरण</div><div class="kv"><div class="r"><b>फेंसिंग सामग्री:</b><span class="auto">\${esc(fenceMaterialName())}</span></div><div class="r"><b>प्रस्तावित भूमि:</b><span class="auto" id="oArea">…………</span></div><div class="r"><b>अनुमन्य लम्बाई:</b><span class="auto" id="oFenceLen">…………</span> मी०</div><div class="r"><b>अनुमन्य खम्बे:</b><span class="auto" id="oPoles">…………</span> नग</div></div></div><div class="serial-section"><div class="serial-title">4. एम०बी० मूल्यांकन</div><div class="kv"><div class="r"><b>मापी लम्बाई:</b><input class="ln rt sm" data-f="mbLen" inputmode="decimal" value="\${esc(S.f.mbLen||"")}"><b> मी०</b></div><div class="r"><b>अथवा एम०बी० धनराशि:</b><input class="ln rt sm" data-f="mbAmt" inputmode="decimal"><b> ₹</b></div><div class="r"><b>एम०बी० धनराशि:</b><span class="auto" id="oMb"></span></div></div></div><div class="serial-section"><div class="serial-title">5. स्थलीय सत्यापन</div><div class="kv"><div class="r"><b>अनुमन्य लम्बाई:</b><span class="auto" id="oAllowed"></span> मी०</div><div class="r"><b>सत्यापित लम्बाई:</b><input class="ln rt sm" data-f="verifiedLen" inputmode="decimal"><b> मी०</b></div><div class="r"><b>कमी:</b><span class="auto" id="oShort"></span> मी०</div><div class="r"><b>वास्तविक क्षेत्रफल:</b><span class="auto" id="oActualArea"></span> हे०</div><div class="r"><b>मानक लागत:</b><span class="auto" id="oStdCost"></span></div></div></div></div><div class="bill-table-heading"><div class="bill-table-title">कृषक द्वारा प्रस्तुत कार्य एवं व्यय का विवरण</div><div class="bill-table-subtitle">प्रस्तुत बिल / वाउचर के आधार पर</div></div>\${tbl}<div id="oFlag"></div><div class="xbox"><div class="xh">राजसहायता की गणना — तीनों में से न्यूनतम</div><table><tbody><tr><td>बिल / वाउचर के अनुसार कुल व्यय</td><td class="v" id="xBill"></td></tr><tr><td>एम०बी० मूल्यांकन धनराशि</td><td class="v" id="xMb"></td></tr><tr><td>मानक लागत (वास्तविक क्षेत्रफल × ₹2,00,000)</td><td class="v" id="xStdCost"></td></tr><tr><td>राजसहायता हेतु स्वीकार्य आधार — न्यूनतम</td><td class="v" id="xBase"></td></tr><tr><td>लागू राजसहायता दर</td><td class="v" id="xRate"></td></tr><tr class="hi"><td><b>देय राजसहायता धनराशि</b></td><td class="v" id="xSub"></td></tr><tr><td>कृषक द्वारा वहन की गयी धनराशि</td><td class="v" id="xOwn"></td></tr></tbody></table></div><p style="margin:10px 0 0"><b>संलग्न:</b> बिल वाउचर, एम०बी०, जियो टैग फोटोग्राफ आदि।</p><div class="decl">प्रमाणित किया जाता है कि मेरे द्वारा \${planLabel} अन्तर्गत \${kaam} पर उक्तानुसार धनराशि व्यय की गई है। अतः राजसहायता की धनराशि <span class="blank" id="oSub1"></span> (<span id="oWords1"></span> रुपये मात्र) का भुगतान मुझे करने की कृपा कीजिएगा।</div><div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:22px;gap:20px"><div style="flex:0 0 auto"><div style="display:flex;gap:6px;align-items:baseline"><b>दिनांक:</b><input class="ln sm" type="date" data-f="date"></div><div style="display:flex;gap:6px;align-items:baseline;margin-top:8px"><b>स्थान:</b><input class="ln sm" data-f="place"></div></div><div style="text-align:center;min-width:240px;border-top:1px solid #16281E;padding-top:5px">हस्ताक्षर \${G("कृषक","कृषिका")}<br><span class="auto" id="oName"></span></div></div></div>\`;
  document.querySelectorAll("#billOut [data-f]").forEach(el=>{ if(S.f[el.dataset.f]!==undefined) el.value = S.f[el.dataset.f]; });
  refresh();
}

function buildBill(){
  document.querySelector('[data-v="bill"] .head').textContent = "देयक प्रपत्र";
  document.getElementById("billLead").textContent = "सीधे प्रपत्र पर ही भरें।";
  buildFencingBill();
}

const set = (id,v) => { const el=document.getElementById(id); if(el) el.innerHTML=v; };
function refresh(){
  const c = calc();
  c.rows.forEach((r,i)=>{ set("r"+i+"a",fmtN(r.amt)); set("r"+i+"s",fmtN(r.sub)); set("r"+i+"o",fmtN(r.own)); });
  set("tA",fmtN(c.bill)); set("tS",fmtN(c.sub)); set("tO",fmtN(c.own));
  set("oRate",(c.rate*100).toFixed(0)+"%");
  const m = fenceStandard(c.hec);
  set("oArea", c.hec>0 ? c.hec.toFixed(2) : "…………");
  set("oFenceLen", m ? fmtN(m.len).replace(/\\.00$/,"") : "…………");
  set("oPoles", m ? fmtN(m.poles).replace(/\\.00$/,"") : "…………");
  set("oMb", c.mb ? fmt0(c.mb) : "—");
  set("oAllowed", c.allowedLen ? fmtN(c.allowedLen).replace(/\\.00$/,"") : "…………");
  set("oShort", c.shortfall>0 ? fmtN(c.shortfall).replace(/\\.00$/,"") : "0");
  set("oActualArea", c.actualArea>0 ? Number(c.actualArea).toFixed(2) : "…………");
  set("oStdCost", c.standardCost ? fmt0(c.standardCost) : "—");
  set("xBill", c.bill?fmt0(c.bill):"—"); set("xMb", c.mb?fmt0(c.mb):"—"); set("xStdCost", c.standardCost ? fmt0(c.standardCost) : "—");
  set("xBase",fmt0(c.base)); set("xRate",(c.rate*100).toFixed(0)+"%"); set("xSub",fmt0(c.sub)); set("xOwn",fmt0(c.own));
  set("oSub1",fmt0(c.sub)); set("oWords1",words(c.sub)); set("oName", esc(S.f.name)||"…………");
  document.getElementById("sBill").textContent = fmt0(c.bill);
  document.getElementById("sMb").textContent = c.mb?fmt0(c.mb):"—";
  document.getElementById("sSub").textContent = fmt0(c.sub);
  document.getElementById("sOwn").textContent = fmt0(c.own);
  document.getElementById("sRate").textContent = c.bill?\`(\${(c.rate*100).toFixed(0)}%)\`:"";
  const msg=document.getElementById("sMsg");
  msg.className = "msg" + (c.over?" bad":"");
  msg.textContent = !c.bill ? "व्यय विवरण भरना प्रारम्भ करें" : c.over ? \`बिल एम०बी० से \${fmt0(c.bill-c.mb)} अधिक\` : \`राजसहायता शब्दों में: \${words(c.sub)} रुपये मात्र\`;
  save();
}
function refreshWorkTotals(){ document.querySelectorAll("#workBody table").forEach(tb=>{ const t = tb.querySelector("[data-tot]"); if(!t) return; const k = t.dataset.tot, cfg = COLS[k]; tb.querySelectorAll("tbody tr").forEach((tr,i)=>{ if(i<(S[k]||[]).length){ const cell=tr.querySelector("td.calc"); if(cell) cell.textContent=fmtN(cfg.amt(S[k][i])); } }); t.textContent = fmtN(sum(k)); }); refresh(); }

let cur="work";
function show(v){
  cur=v;
  document.querySelectorAll(".view").forEach(s=>{ s.classList.toggle("on", s.dataset.v===v); s.classList.remove("print-target"); });
  document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("on", a.dataset.go===v));
  if(v==="application"){ buildApplication(); }
  else if(v==="affidavit"){ buildAffidavit(); }
  else if(v==="work"){ buildWork(); refresh(); }
  else if(v==="bill"){ buildBill(); }
  window.scrollTo(0,0);
}

document.addEventListener("input", e=>{
  const t=e.target;
  if(t.id==="scheme") return; 
  if(t.dataset && t.dataset.land){
    const i=+t.dataset.land, k=t.dataset.k;
    if(!S.landRows) S.landRows=[{relation:"स्वयं"},{relation:"भाई"},{relation:"पुत्र"},{relation:"पिता"},{relation:"अन्य"}];
    if(["relation","hec","name","father","khasra","aadhaar"].includes(k)) S.landRows[i][k]=t.value;
    updateApplicationDerived(); save(); return;
  }
  if(t.dataset && t.dataset.f){
    S.f[t.dataset.f]=t.value; save();
    refresh();
    if(cur==="application") updateApplicationDerived();
    return;
  }
  if(t.dataset && t.dataset.norm){ S.norm[t.dataset.norm]=t.value; save(); refresh(); }
  else if(t.dataset && t.dataset.row){ S[t.dataset.row][+t.dataset.i][t.dataset.k]=t.value; refreshWorkTotals(); }
});

document.addEventListener("change", e=>{
  const t=e.target;
  if(t.id==="scheme"){ return; } 
  if(t.dataset && t.dataset.f){
    S.f[t.dataset.f]=t.value; save();
    if(LANG_FIELDS.includes(t.dataset.f)){ rebuildDocs(); save(); }
    else if(cur==="application") updateApplicationDerived();
    refresh();
    return;
  }
  if(t.id==="appRate"){ S.norm.fRate=t.value; save(); refresh(); if(cur==="application") updateApplicationDerived(); return; }
  if(t.dataset && t.dataset.land){
    const i=+t.dataset.land, k=t.dataset.k;
    if(!S.landRows) S.landRows=[]; if(!S.landRows[i]) S.landRows[i]={relation:"",hec:"",aadhaar:""};
    S.landRows[i][k]=t.value;
    if(cur==="application") buildApplication(); save(); return;
  }
  const listId = t.getAttribute && t.getAttribute("list");
  if(listId && DL[listId] && t.value.trim() && !S.lists[DL[listId]].includes(t.value.trim())){
    S.lists[DL[listId]].push(t.value.trim()); buildLists(); save();
  }
});

document.addEventListener("click", e=>{
  const b=e.target.closest("[data-add],[data-del],[data-go],[data-land-del],#addLandRow");
  if(!b) return;
  if(b.id==="addLandRow"){ if(!S.landRows) S.landRows=[]; S.landRows.push({relation:"अन्य",name:"",father:"",khasra:"",aadhaar:"",hec:""}); buildApplication(); save(); return; }
  if(b.dataset.landDel!==undefined){ const i=+b.dataset.landDel; if(i>0 && S.landRows && i<S.landRows.length){ S.landRows.splice(i,1); buildApplication(); save(); } return; }
  if(b.dataset.add){ S[b.dataset.add].push({}); buildWork(); refresh(); }
  else if(b.dataset.del){ const k=b.dataset.del; S[k].splice(+b.dataset.i,1); if(!S[k].length) S[k].push({}); buildWork(); refresh(); }
  else if(b.dataset.go){ show(b.dataset.go); }
});

document.getElementById("bGo").onclick = ()=>show("bill");
document.getElementById("bPrint").onclick = ()=>{
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("print-target"));
  const target=document.querySelector(\`.view[data-v="\${cur}"]\`);
  if(target){ target.classList.add("print-target"); window.print(); }
};
document.getElementById("bNew").onclick = ()=>{ if(confirm("सारी प्रविष्टि मिट जाएगी। नया प्रपत्र खोलें?")){ S=blank(); document.getElementById("scheme").value=S.scheme; buildNav(); toggleStrip(); show("work"); } };
document.getElementById("bSave").onclick = ()=>{ const nm=(S.f.name||"कृषक").replace(/\\s+/g,"_"); const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:"application/json"})); a.download=\`अनुदान_\${nm}.json\`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); };
document.getElementById("bOpen").onclick = ()=>document.getElementById("fileIn").click();
document.getElementById("fileIn").onchange = e=>{ const fl=e.target.files[0]; if(!fl) return; const r=new FileReader(); r.onload=()=>{ try{ S=Object.assign(blank(), JSON.parse(r.result)); document.getElementById("scheme").value=S.scheme; buildNav(); toggleStrip(); show("work"); } catch(err){ alert("यह फाइल पढ़ी नहीं जा सकी।"); } }; r.readAsText(fl); e.target.value=""; };

try{
  const r=localStorage.getItem(KEY);
  if(r){
    S=Object.assign(blank(), JSON.parse(r));
    S.landRows=(S.landRows||[]).map(x=>({relation:x.relation||"",name:x.name||"",father:x.father||"",khasra:x.khasra||"",hec:(x.hec!==undefined?x.hec:"")}));
    while(S.landRows.length<5) S.landRows.push({relation:"",name:"",father:"",khasra:"",hec:""});
    if(S.landRows.length>5) S.landRows=S.landRows.slice(0,5);
  }
}catch(e){}
document.getElementById("scheme").value = S.scheme;
buildNav();
toggleStrip();
show("work");
`;

export default function KisanAavedanPortal() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.innerHTML = HTML_BODY;

    try {
      const run = new Function("document", "window", HTML_LOGIC);
      run(document, window);
    } catch (error) {
      console.error("Kisan Aavedan Portal initialization failed:", error);
      const target = root.querySelector("main") || root;
      const box = document.createElement("div");
      box.style.cssText = "margin:20px;padding:14px;border:1px solid #d8b4b4;background:#fff5f5;color:#7f1d1d;font-family:Segoe UI,sans-serif;";
      box.innerHTML = "<b>पोर्टल लोड नहीं हो सका।</b><br/>कृपया browser console में error देखें।";
      target.prepend(box);
    }

    return () => {
      root.innerHTML = "";
    };
  }, []);

  return <div ref={rootRef} className="kisan-html-react-root" />;
}
