import React, { useEffect, useRef } from "react";
import "./kisan-aavedan-portal.css";

const HTML_BODY = `
<div class="shell">
  <header class="topbar noprint">
    <div class="topbar-brand">
      <h1>अनुदान देयक प्रपत्र</h1>
      <p class="sub">कार्यालय — उद्यान विशेषज्ञ, कोटद्वार (गढ़वाल) · वित्तीय वर्ष 2026-27</p>
    </div>
    <div class="topbar-scheme">
      <span class="tk">वर्मी कम्पोस्ट इकाई</span>
    </div>
  </header>
  <nav id="nav" class="tabs noprint">
    <a data-tab="register" class="on">उपयोगकर्ता पंजीकरण</a>
    <a data-tab="filling">प्रपत्र भरना</a>
    <button type="button" class="tabs-preview" id="bPreview">प्रिंट पूर्वावलोकन</button>
  </nav>
  <main>
    <section class="view on" data-v="register">
      <h2 class="head">उपयोगकर्ता पंजीकरण</h2>
      <p class="lead">पहले कृषक का पंजीकरण करें — इससे फॉर्म आईडी बन जाएगी। उसी फॉर्म आईडी पर आगे आवेदन, व्यय विवरण एवं देयक प्रपत्र भरा जाता है।</p>
      <div class="card">
        <div class="cap"><i></i>नया पंजीकरण<small>POST — फॉर्म आईडी स्वतः बनेगी</small></div>
        <div class="pad">
          <form id="regForm" class="grid" autocomplete="off">
            <div><label class="f">कृषक का नाम</label><input id="regName" placeholder="पूरा नाम"></div>
            <div><label class="f">मोबाइल नंबर</label><input id="regMob" inputmode="numeric" maxlength="10" placeholder="10 अंक"></div>
            <div><label class="f">ग्राम</label><input id="regVillage" placeholder="ग्राम का नाम"></div>
            <div><label class="f">जनपद</label><input id="regDist" placeholder="जनपद का नाम"></div>
            <div class="reg-actions">
              <button type="submit" class="addrow solid">पंजीकरण करें</button>
              <button type="button" class="addrow" id="regRefresh">सूची ताज़ा करें</button>
            </div>
          </form>
        </div>
      </div>
      <div class="card">
        <div class="cap"><i></i>पंजीकृत कृषक एवं फॉर्म<small id="regCount"></small></div>
        <div class="pad">
          <div class="table-scroll">
            <table class="reg-table">
              <thead><tr>
                <th style="width:48px">क्र०</th><th>फॉर्म आईडी</th><th>कृषक का नाम</th><th>मोबाइल</th>
                <th>ग्राम</th><th>जनपद</th><th>स्थिति</th>
                <th style="width:160px">क्रिया</th>
              </tr></thead>
              <tbody id="regRows"><tr><td colspan="8" class="empty">लोड हो रहा है…</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
    <section class="view" data-v="filling">
      <div class="subtabs noprint" id="subnav">
        <a data-go="application" class="on">आवेदन पत्र</a>
        <a data-go="affidavit">शपथ-पत्र</a>
        <a data-go="work">व्यय विवरण</a>
        <a data-go="bill">देयक प्रपत्र</a>
      </div>
      <section class="view on" data-v="application">
        <h2 class="head">आवेदन पत्र</h2>
        <p class="lead" id="appLead"></p>
        <div id="applicationOut"></div>
      </section>
      <section class="view" data-v="affidavit">
        <h2 class="head">शपथ-पत्र</h2>
        <p class="lead" id="affLead"></p>
        <div id="affidavitOut"></div>
      </section>
      <section class="view" data-v="work">
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
    </section>
  </main>
</div>
<div hidden id="datalists"></div>
<div class="strip noprint" id="bottomStrip">
  <div class="cell"><div class="k">बिल का कुल योग</div><div class="v num" id="sBill">₹ 0</div></div>
  <div class="cell"><div class="k">एम०बी० मूल्यांकन</div><div class="v num" id="sMb">—</div></div>
  <div class="cell pay"><div class="k">देय राजसहायता <span id="sRate"></span></div><div class="v num" id="sSub">₹ 0</div></div>
  <div class="cell"><div class="k">कृषक द्वारा वहन</div><div class="v num" id="sOwn">₹ 0</div></div>
  <div class="msg" id="sMsg"></div>
  <button class="go" id="bGo">देयक देखें</button>
</div>
<div class="pv-overlay noprint" id="pvOverlay" hidden>
  <div class="pv-box" role="dialog" aria-modal="true" aria-label="प्रिंट पूर्वावलोकन">
    <div class="pv-head">
      <span class="pv-title" id="pvTitle">प्रिंट पूर्वावलोकन</span>
      <span class="pv-actions">
        <button type="button" class="pv-btn" id="pvPrint">प्रिंट करें</button>
        <button type="button" class="pv-btn close" id="pvClose">बंद करें</button>
      </span>
    </div>
    <div class="pv-body" id="pvBody"></div>
  </div>
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
  vermiMaterial:["ईंट","सीमेंट","रेत","बजरी","चिनाई मजदूरी","प्लास्टर कार्य","केंचुए (वर्म कल्चर)","गोबर / जैविक अपशिष्ट","छाया हेतु शेड / तिरपाल","अन्य"]
};
const DL = {dlVermi:"vermiMaterial"};

const COLS = {
  vermi:{amt:r=>num(r.amt),c:[["item","कार्य / सामग्री का विवरण",0,0,"dlVermi"],["amt","बिल राशि (₹)",0,"n"]]}
};
const sum = k => (S[k]||[]).reduce((a,r)=>a+COLS[k].amt(r),0);

const SECTIONS = {
  vermicompost:[["vermi","वर्मी कम्पोस्ट इकाई — सामग्री एवं व्यय","ईंट, सीमेंट, रेत, बजरी, चिनाई, केंचुए, गोबर आदि"]]
};

/* ★ CHANGED: gender default from "पुरुष" to "" so "चुनें" shows by default ★ */
const blank = () => ({
  scheme:"vermicompost",
  lists: JSON.parse(JSON.stringify(LISTS)),
  norm:{ vRate:75, vCap:24998, vStdCost:33333 },
  f:{name:"",father:"",village:"",post:"",block:"",dist:"",mob:"",aadhar:"",khasra:"",bank:"",branch:"",acct:"",ifsc:"",cat:"सामान्य",farmerCat:"सीमांत",hortiCard:"",tehsil:"",proposedArea:"",irrigation:"उपलब्ध", gender:"",mbAmt:"", date:new Date().toISOString().slice(0,10), place:"", officer:"", desig:""},
  vermi:[{}], vcrops:[{name:"",area:""}]
});
let S = blank();
const KEY = "anudan_form_v3";
const save = () => { try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} };

function mbValue(){
  const direct = num(S.f.mbAmt);
  return direct;
}
function calc(){
  const parts = [
      ["वर्मी कम्पोस्ट इकाई निर्माण कार्य", sum("vermi")]
    ];
  const bill = parts.reduce((a,p)=>a+p[1],0);
  const rate = num(S.norm.vRate)/100;
  const cap  = num(S.norm.vCap);
  let mb=0, base=0, bases=[], standardCost=0, shortfall=0;
  mb = mbValue();
  standardCost = num(S.norm.vStdCost)||33333;
  if(bill>0) bases.push({key:"bill",label:"बिल / वाउचर के अनुसार कुल व्यय",val:bill});
  if(mb>0) bases.push({key:"mb",label:"एम०बी० मूल्यांकन धनराशि",val:mb});
  if(standardCost>0) bases.push({key:"standard",label:"मानक लागत (10 फीट × 8 फीट × 2.5 फीट)",val:standardCost});
  base = bases.length ? Math.min(...bases.map(b=>b.val)) : 0;
  shortfall = Math.max(0, standardCost - base);
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
  return { bill, mb, base, bases, rate, sub, own:bill-sub, cap, capped, standardCost, shortfall, rows };
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
  nav.innerHTML='<a data-tab="register" class="on">उपयोगकर्ता पंजीकरण</a><a data-tab="filling">प्रपत्र भरना</a><button type="button" class="tabs-preview" id="bPreview">प्रिंट पूर्वावलोकन</button>';
}

function toggleStrip(){
  const strip=document.getElementById("bottomStrip");
  if(!strip) return;
  strip.style.display = "none";
}

function buildStandards(){
  const body=document.getElementById("standardsBody");
  const title=document.getElementById("standardsTitle");
  if(!body) return;
  title.textContent="वर्मी कम्पोस्ट राजसहायता के मानक";
  body.innerHTML=\`<div class="grid"><div><label class="f">वर्मी कम्पोस्ट राजसहायता दर (%)</label><select data-norm="vRate"><option value="75">75%</option></select></div><div><label class="f">मानक लागत ₹ (10 फीट × 8 फीट × 2.5 फीट)</label><input data-norm="vStdCost" inputmode="decimal" placeholder="33,333"></div><div><label class="f">अधिकतम अनुदान सीमा ₹</label><input data-norm="vCap" inputmode="decimal" placeholder="24,998"></div></div><p class="lead" style="margin:12px 0 0">विभागीय मानक: एक इकाई (10 फीट × 8 फीट × 2.5 फीट) हेतु निर्धारित ₹33,333। राजसहायता तीन आधारों — बिल / वाउचर का योग, एम०बी० मूल्यांकन, तथा मानक लागत — इनमें से जो न्यूनतम हो, उस पर देय होगी।</p>\`;
  body.querySelectorAll("[data-norm]").forEach(el=>el.value=S.norm[el.dataset.norm]);
}
function buildWork(){
  buildStandards();
  document.getElementById("workLead").textContent = "वर्मी कम्पोस्ट इकाई निर्माण पर हुआ पूरा व्यय भरें। हर पंक्ति में पहले कार्य / विवरण चुनें, फिर उसी के सामने बिल राशि डालें।";
  document.getElementById("workBody").innerHTML = SECTIONS.vermicompost.map(([k,t,n])=>
    \`<div class="card"><div class="cap"><i></i>\${t}<small>\${n}</small></div><div class="pad">\${tableHTML(k)}</div></div>\`).join("")
    + \`<div class="note">कार्य / सामग्री: ईंट, सीमेंट, रेत, बजरी, चिनाई मजदूरी, प्लास्टर कार्य, केंचुए (वर्म कल्चर), गोबर / जैविक अपशिष्ट, छाया हेतु शेड / तिरपाल एवं अन्य।</div>\`;
  buildLists();
  document.querySelectorAll("[data-norm]").forEach(el=>el.value = S.norm[el.dataset.norm]);
}

function rebuildDocs(){ 
  const activeView = cur==="filling" ? subCur : cur;
  if(activeView==="application" && document.getElementById("applicationOut")) buildApplication(); 
  if(activeView==="bill" && document.getElementById("billOut")) buildBill(); 
  if(activeView==="affidavit" && document.getElementById("affidavitOut")) buildAffidavit(); 
  save(); 
}
function isFemale(){ return (S.f.gender||"")==="महिला"; }
function G(m,f){ return isFemale()?f:m; }

function buildVermiApplication(){
  const f=S.f||{};
  const rate=num(S.norm.vRate)||75;
  const stdCost=num(S.norm.vStdCost)||33333;
  const maxSub=num(S.norm.vCap)||24998;
  const subsidy=Math.min(Math.round(stdCost*rate/100),maxSub);
  const farmerShare=stdCost-subsidy;
  let cropHTML=(S.vcrops||[]).map((r,i)=>'<tr><td>'+(i+1)+'</td><td><input list="cropOptions" data-vc="'+i+'" data-k="name" value="'+esc(r.name||"")+'" placeholder="फसल का नाम"></td><td><input data-vc="'+i+'" data-k="area" value="'+esc(r.area||"")+'" inputmode="decimal"></td><td class="noprint"><button class="btn" data-vcdel="'+i+'">×</button></td></tr>').join("");
  /* ★ Structure matches HTML file: .appdoc > .st + .grid2 + .field + table + .declaration-box + .note ★ */
  document.getElementById("applicationOut").innerHTML=\`<div class="appdoc"><div style="text-align:center;font-size:11.5px;color:#65746B;margin:2px 0 4px">उद्यान विभाग · वित्तीय वर्ष 2026-27</div><h3 style="text-decoration:underline">राज्य सेक्टर योजना अन्तर्गत वर्मी कम्पोस्ट इकाई हेतु</h3><h4 style="color:var(--ink);font-size:16px;font-weight:600">कृषक आवेदन पत्र</h4><div class="st">आवेदक का विवरण</div><div class="grid2"><div class="field"><label>कृषक का नाम</label><input data-f="name" value="\${esc(f.name||"")}"></div><div class="field"><label>पिता / पति का नाम</label><input data-f="father" value="\${esc(f.father||"")}"></div><div class="field"><label>ग्राम</label><input data-f="village" value="\${esc(f.village||"")}"></div><div class="field"><label>डाकघर</label><input data-f="post" value="\${esc(f.post||"")}"></div><div class="field"><label>तहसील</label><input data-f="tehsil" value="\${esc(f.tehsil||"")}" placeholder="तहसील का नाम"></div><div class="field"><label>जनपद</label><input data-f="dist" value="\${esc(f.dist||"")}"></div><div class="field"><label>उद्यान कार्ड संख्या</label><input data-f="hortiCard" value="\${esc(f.hortiCard||"")}"></div><div class="field"><label>मोबाइल नं.</label><input data-f="mob" inputmode="numeric" value="\${esc(f.mob||"")}"></div><div class="field"><label>आधार संख्या</label><input data-f="aadhar" inputmode="numeric" maxlength="12" value="\${esc(f.aadhar||"")}"></div><div class="field"><label>खाता / खतौनी संख्या</label><input data-f="khasra" value="\${esc(f.khasra||"")}"></div><div class="field"><label>लिंग</label><select data-f="gender"><option value="">चुनें</option><option value="पुरुष">पुरुष</option><option value="महिला">महिला</option></select></div></div><div class="st">भूमि का विवरण</div><div class="grid2"><div class="field"><label>भूमि का क्षेत्रफल (हे०)</label><input data-f="proposedArea" inputmode="decimal" value="\${esc(f.proposedArea||"")}" placeholder="हे० में क्षेत्रफल"></div></div><div class="st">कृषक की खेती का विवरण</div><table><thead><tr><th style="width:55px">क्र०</th><th>फसल / बागवानी फसल का नाम</th><th>क्षेत्रफल (हे०)</th><th class="noprint" style="width:70px">क्रिया</th></tr></thead><tbody>\${cropHTML}</tbody></table><div class="noprint" style="margin-top:8px"><button class="btn" id="addCropBtn">+ फसल जोड़ें</button></div><div class="st">बैंक विवरण</div><div class="grid2"><div class="field"><label>विकासखण्ड</label><input data-f="block" value="\${esc(f.block||"")}"></div><div class="field"><label>बैंक का नाम</label><input data-f="bank" value="\${esc(f.bank||"")}"></div><div class="field"><label>शाखा</label><input data-f="branch" value="\${esc(f.branch||"")}"></div><div class="field"><label>बैंक खाता संख्या</label><input data-f="acct" inputmode="numeric" value="\${esc(f.acct||"")}"></div><div class="field"><label>IFSC कोड</label><input data-f="ifsc" value="\${esc(f.ifsc||"")}"></div></div><div class="st">स्थान एवं दिनांक</div><div class="grid2"><div class="field"><label>स्थान</label><input data-f="place" value="\${esc(f.place||"")}" placeholder="स्थान का नाम"></div><div class="field"><label>दिनांक</label><input data-f="date" value="\${esc(f.date||"")}" placeholder="दिन/माह/वर्ष"></div></div><div class="st">7. घोषणा</div><div class="declaration-box"><p>उपर्युक्त सभी विवरण मेरी जानकारी में पूर्णतः सत्य हैं। मुझे पूर्व में किसी भी सरकारी योजना से वर्मी कम्पोस्ट यूनिट हेतु अनुदान प्राप्त नहीं हुआ है। यूनिट की स्थापना व रखरखाव विभागीय दिशा-निर्देशों के अनुसार मेरी जिम्मेदारी होगी।</p><div class="farmer-signature"><div>कृषक का नाम : <strong id="app_farmer_name">\${esc(f.name||"…………")}</strong></div><div>कृषक के हस्ताक्षर : ______________________________</div></div></div><div class="st">संलग्न दस्तावेज</div><div class="note">1. खाता-खतौनी की प्रति — 6 माह से अधिक पुरानी नहीं हो।<br>2. आधार कार्ड की प्रति।<br>3. उद्यान कार्ड की प्रति।<br>4. बैंक खाते का विवरण / बैंक पासबुक की प्रति।<br>5. ₹10 का नोटरीकृत शपथ-पत्र।</div><div class="st">8. प्रभारी की आख्या</div><div class="declaration-box prabhari-box"><p>प्रमाणित किया जाता है कि कृषक द्वारा प्रस्तुत आवेदन, भूमि अभिलेख एवं अन्य संबंधित अभिलेखों का परीक्षण कर लिया गया है। आवेदन में अंकित विवरण एवं प्रस्तुत अभिलेख सही पाए गए हैं। अतः कृषक आवेदन <strong>उद्यान विशेषज्ञ, कोटद्वार महोदय की सेवा में वर्क ऑर्डर जारी करने हेतु संस्तुति सहित अग्रसारित</strong> है।</p><p style="margin-top:24px;"><strong>प्रभारी, उद्यान सचल दल केन्द्र</strong><br><strong>केन्द्र का नाम :</strong> ________________________________________________________________</p></div></div>\`;
  document.querySelectorAll("#applicationOut [data-f]").forEach(el=>{ if(S.f[el.dataset.f]!==undefined) el.value=S.f[el.dataset.f]; });
  let dl=document.getElementById("cropOptions");
  if(!dl){dl=document.createElement("datalist");dl.id="cropOptions";document.body.appendChild(dl);}
  dl.innerHTML=["गेहूँ","धान","मक्का","मंडुवा","झंगोरा","दालें","सब्जियाँ","आलू","टमाटर","मिर्च","फूल","सेब","नाशपाती","कीवी","अमरूद","आम","अखरोट","अन्य"].map(x=>\`<option value="\${esc(x)}">\`).join("");
}

function buildVermiAffidavit(){
  const f=S.f||{};
  const stdCost=num(S.norm.vStdCost)||33333;
  const rate=num(S.norm.vRate)||75;
  const maxSub=num(S.norm.vCap)||24998;
  const subsidy=Math.min(Math.round(stdCost*rate/100),maxSub);
  const farmerShare=stdCost-subsidy;
  const name=esc(f.name||"…………"),father=esc(f.father||"…………"),village=esc(f.village||"…………"),post=esc(f.post||"…………"),tehsil=esc(f.tehsil||"…………"),dist=esc(f.dist||"…………"),horti=esc(f.hortiCard||"…………"),khasra=esc(f.khasra||"…………");
  document.getElementById("affidavitOut").innerHTML=\`<div class="affidavit-doc"><div class="aff-head"><div class="aff-kicker">उद्यान विभाग · वित्तीय वर्ष 2026-27</div><div class="aff-title">शपथ-पत्र</div><div class="aff-sub">(वर्मी कम्पोस्ट यूनिट निर्माण हेतु)</div><div class="aff-line"></div></div><div class="aff-meta"><div><span>नाम</span><b>\${name}</b></div><div><span>पिता / पति का नाम</span><b>\${father}</b></div><div><span>ग्राम</span><b>\${village}</b></div><div><span>डाकघर</span><b>\${post}</b></div><div><span>तहसील</span><b>\${tehsil}</b></div><div><span>जनपद</span><b>\${dist}</b></div><div><span>उद्यान कार्ड संख्या</span><b>\${horti}</b></div><div><span>खाता / खतौनी संख्या</span><b>\${khasra}</b></div></div><div class="aff-intro">मैं <b>\${name}</b> \${G("पुत्र","पुत्री")} <b>\${father}</b>, निवासी ग्राम <b>\${village}</b>, डाकघर <b>\${post}</b>, तहसील <b>\${tehsil}</b>, जनपद <b>\${dist}</b>, उद्यान कार्ड (कृषक पहचान) संख्या <b>\${horti}</b>, शपथपूर्वक कथन \${G("करता","करती")} हूँ कि—</div><div class="aff-item">1. मेरा नाम, पता एवं अन्य व्यक्तिगत विवरण उपर्युक्त अनुसार पूर्णतः सत्य, सही एवं प्रामाणिक हैं।</div><div class="aff-item">2. मेरे द्वारा राज्य सेक्टर योजनान्तर्गत <b>वर्मी कम्पोस्ट यूनिट निर्माण हेतु</b> उद्यान विभाग में विधिवत आवेदन किया गया है।</div><div class="aff-item">3. जिस भूमि पर वर्मी कम्पोस्ट यूनिट का निर्माण किया गया है, वह भूमि मेरे वैधानिक स्वामित्व एवं वास्तविक कब्जे में है। ग्राम: <b>\${village}</b> · खाता संख्या: <b>\${khasra}</b></div><div class="aff-item">4. मेरे द्वारा उक्त भूमि पर विभागीय मानकों के अनुसार <b>10 फीट × 8 फीट × 2.5 फीट आकार की पक्की वर्मी कम्पोस्ट यूनिट</b> का निर्माण किया गया है।</div><div class="aff-item">5. उक्त वर्मी कम्पोस्ट यूनिट की प्रो-रेटा लागत <b>₹\${stdCost.toLocaleString("en-IN")}/-</b>, देय \${rate}% राजसहायता <b>₹\${subsidy.toLocaleString("en-IN")}/-</b> तथा कृषक का \${100-rate}% अंशदान <b>₹\${farmerShare.toLocaleString("en-IN")}/-</b> है।</div><div class="aff-item">6. इससे पूर्व मेरे द्वारा उक्त यूनिट हेतु किसी अन्य सरकारी विभाग / संस्था / योजना से कोई अनुदान प्राप्त नहीं किया गया है।</div><div class="aff-item">7. मेरे द्वारा प्रस्तुत समस्त दस्तावेज, भूमि अभिलेख, बैंक विवरण, बिल / वाउचर एवं अन्य जानकारी सत्य एवं सही है।</div><div class="aff-item">8. यूनिट का निर्माण विभागीय तकनीकी मानकों एवं दिशा-निर्देशों के अनुरूप किया गया है। भिन्नता पाए जाने पर उसकी जिम्मेदारी मेरी होगी।</div><div class="aff-item">9. यूनिट के रख-रखाव, सफाई, संचालन, केंचुओं की देखभाल एवं नमी बनाए रखने की जिम्मेदारी मेरी होगी।</div><div class="aff-item">10. कोई जानकारी असत्य या भ्रामक पाए जाने पर विभाग को आवेदन / राजसहायता निरस्त करने तथा प्राप्त राशि की वसूली करने का अधिकार होगा।</div><div class="aff-item">11. मैं योजना की निर्धारित शर्तों एवं विभागीय दिशा-निर्देशों से सहमत हूँ।</div><div class="aff-decl">मैं यह शपथ-पत्र पूर्ण होश-हवास में, बिना किसी दबाव, प्रलोभन अथवा भय के, अपनी स्वेच्छा से सत्यनिष्ठा के साथ दे रहा / रही हूँ।</div><div class="aff-sign"><div class="box">स्थान: \${esc(f.place||"…………")}<br>दिनांक: \${esc(f.date||"…………")}</div><div class="box line">\${G("शपथकर्ता","शपथकर्त्री")} के हस्ताक्षर<br>\${name}<br>मोबाइल: \${esc(f.mob||"…………")}</div></div></div>\`;
}

function updateApplicationDerived(){
  if(cur!=="application" || !document.getElementById("applicationOut")) return;
  const fn=document.getElementById("app_farmer_name"); if(fn)fn.textContent=S.f.name||"…………";
}

function buildApplication(){
  document.querySelector('[data-v="application"] .head').textContent = "वर्मी कम्पोस्ट आवेदन पत्र";
  document.getElementById("appLead").textContent = "वर्मी कम्पोस्ट इकाई निर्माण हेतु आवेदन पत्र।";
  buildVermiApplication();
}

function buildAffidavit(){
  document.querySelector('[data-v="affidavit"] .head').textContent = "शपथ-पत्र";
  document.getElementById("affLead").textContent = "वर्मी कम्पोस्ट यूनिट निर्माण हेतु शपथ-पत्र।";
  buildVermiAffidavit();
}

const LR = (lab,k) => \`<div class="r"><b>\${lab}</b><span class="auto">\${esc(S.f[k]||"…………")}</span></div>\`;

function buildVermiBill(){
  const c=calc();
  const stdCost=num(S.norm.vStdCost)||33333;
  const maxSub=num(S.norm.vCap)||24998;
  const rate=num(S.norm.vRate)||75;
  let tbl=\`<table><thead><tr><th style="width:44px">क्र०</th><th>कार्य / सामग्री</th><th style="width:140px" class="num">बिल राशि (₹)</th></tr></thead><tbody>\`;
  c.rows.forEach((r,i)=>{ tbl+=\`<tr><td style="text-align:center">\${i+1}</td><td>\${esc(r.name)}</td><td class="calc num" id="r\${i}a"></td></tr>\`; });
  tbl+=\`<tr class="tot"><td colspan="2" style="text-align:right">योग</td><td class="calc num" id="tA"></td></tr></tbody></table>\`;
  document.getElementById("billOut").innerHTML=\`<div class="doc bill-doc"><div class="bill-header"><div class="bill-kicker">उद्यान विभाग · राजसहायता प्रपत्र</div><h3 class="bill-title">वर्मी कम्पोस्ट इकाई — राजसहायता देयक</h3><div class="bill-rule"></div><div class="bill-meta"><div><span>योजना</span><b>राज्य सेक्टर योजना</b></div><div><span>कार्यालय</span><b>उद्यान विशेषज्ञ, कोटद्वार (गढ़वाल)</b></div><div><span>वित्तीय वर्ष</span><b>2026-27</b></div></div></div><div class="serial-layout"><div class="serial-section"><div class="serial-title">एम०बी० मूल्यांकन</div><div class="kv"><div class="r"><b>एम०बी० मूल्यांकन धनराशि (₹):</b><input class="ln rt sm" data-f="mbAmt" inputmode="decimal"></div></div></div><div class="serial-section"><div class="serial-title">1. कृषक का विवरण</div><div class="kv">\${LR("नाम कृषक:","name")}\${LR("पिता / पति:","father")}\${LR("ग्राम:","village")}\${LR("विकास खण्ड:","block")}\${LR("जनपद:","dist")}\${LR("आधार:","aadhar")}\${LR("मोबाइल:","mob")}</div></div><div class="serial-section"><div class="serial-title">2. बैंक विवरण</div><div class="kv">\${LR("बैंक:","bank")}\${LR("शाखा:","branch")}\${LR("खाता संख्या:","acct")}\${LR("IFSC:","ifsc")}</div></div><div class="serial-section"><div class="serial-title">3. इकाई का विवरण</div><div class="kv"><div class="r"><b>यूनिट का आकार:</b><span class="auto">10 फीट × 8 फीट × 2.5 फीट (पक्की संरचना)</span></div><div class="r"><b>मानक लागत:</b><span class="auto">₹ \${stdCost.toLocaleString("en-IN")}</span></div><div class="r"><b>राजसहायता दर:</b><span class="auto">\${rate}%</span></div></div></div></div><div class="bill-table-heading"><div class="bill-table-title">कृषक द्वारा प्रस्तुत कार्य एवं व्यय का विवरण</div><div class="bill-table-subtitle">प्रस्तुत बिल / वाउचर के आधार पर</div></div>\${tbl}<div class="xbox"><div class="xh">राजसहायता की गणना — तीनों में से न्यूनतम</div><table><tbody><tr><td>बिल / वाउचर के अनुसार कुल व्यय</td><td class="v" id="xBill"></td></tr><tr><td>एम०बी० मूल्यांकन धनराशि</td><td class="v" id="xMb"></td></tr><tr><td>मानक लागत (10 फीट × 8 फीट × 2.5 फीट)</td><td class="v" id="xStdCost"></td></tr><tr class="hi"><td><b>राजसहायता हेतु स्वीकार्य आधार — उपरोक्त में से न्यूनतम</b></td><td class="v" id="xBase"></td></tr><tr><td>लागू राजसहायता दर</td><td class="v" id="xRate"></td></tr><tr class="hi"><td><b>देय राजसहायता धनराशि</b></td><td class="v" id="xSub"></td></tr><tr><td>कृषक अंश (आधार × शेष दर — मानक अनुसार)</td><td class="v" id="xShare"></td></tr><tr><td>मानक की अधिकतम अनुदान सीमा (मानक लागत × दर)</td><td class="v" id="xMax"></td></tr><tr><td>मानक से कम हुई लागत (कमी के कारण)</td><td class="v" id="xShort"></td></tr><tr><td>कृषक द्वारा वहन की गयी वास्तविक धनराशि (बिल − राजसहायता)</td><td class="v" id="xOwn"></td></tr></tbody></table></div><div class="note-box"><div class="note-title">महत्वपूर्ण नोट — वर्मी कम्पोस्ट इकाई की गणना</div>• मानक लागत: एक इकाई (10 फीट × 8 फीट × 2.5 फीट) हेतु निर्धारित ₹\${stdCost.toLocaleString("en-IN")}।<br>• देय आधार: बिल / वाउचर राशि, एम०बी० मूल्यांकन धनराशि एवं मानक लागत — इनमें से न्यूनतम राशि (<span id="xBase2"></span>)।<br>• कृषक अंश: आधार राशि पर लागू शेष दर (\${100-rate}%) के अनुसार।<br>• कृषक द्वारा वहन की गयी वास्तविक धनराशि: बिल राशि में से देय राजसहायता घटाकर।</div><p style="margin:10px 0 0"><b>संलग्न:</b> बिल / वाउचर, एम०बी० (मापपुस्तिका), जियो टैग कलर फोटोग्राफ, कृषक का शपथ-पत्र आदि।</p><div class="decl">प्रमाणित किया जाता है कि मेरे द्वारा राज्य सेक्टर योजना अन्तर्गत वर्मी कम्पोस्ट इकाई के निर्माण पर उक्तानुसार धनराशि व्यय की गई है। अतः राजसहायता की धनराशि <span class="blank" id="oSub1"></span> (<span id="oWords1"></span> रुपये मात्र) का भुगतान मुझे करने की कृपा कीजिएगा।</div><div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:22px;gap:20px"><div style="flex:0 0 auto"><div style="display:flex;gap:6px;align-items:baseline"><b>दिनांक:</b><input class="ln sm" type="date" data-f="date"></div><div style="display:flex;gap:6px;align-items:baseline;margin-top:8px"><b>स्थान:</b><input class="ln sm" data-f="place"></div></div><div style="text-align:center;min-width:240px;border-top:1px solid #16281E;padding-top:5px">हस्ताक्षर \${G("कृषक","कृषिका")}<br><span class="auto" id="oName"></span></div></div></div>\`;
  document.querySelectorAll("#billOut [data-f]").forEach(el=>{ if(S.f[el.dataset.f]!==undefined) el.value = S.f[el.dataset.f]; });
  refresh();
}

function buildBill(){
  document.querySelector('[data-v="bill"] .head').textContent = "देयक प्रपत्र";
  document.getElementById("billLead").textContent = "वर्मी कम्पोस्ट इकाई — राजसहायता देयक प्रपत्र।";
  buildVermiBill();
}

const set = (id,v) => { const el=document.getElementById(id); if(el) el.innerHTML=v; };
function refresh(){
  const c = calc();
  c.rows.forEach((r,i)=>{ set("r"+i+"a",fmtN(r.amt)); });
  set("tA",fmtN(c.bill));
  set("xBill", c.bill?fmt0(c.bill):"—"); set("xMb", c.mb?fmt0(c.mb):"—");
  set("xStdCost", fmt0(c.standardCost));
  set("xBase",fmt0(c.base)); set("xRate",(c.rate*100).toFixed(0)+"%"); set("xSub",fmt0(c.sub));
  set("xShare",fmt0(c.base-c.sub)); set("xMax",fmt0(c.cap||24998)); set("xShort",fmt0(c.shortfall)); set("xOwn",c.bill>0?fmt0(c.own):"—");
  set("xBase2",fmt0(c.base)); set("oSub1",fmt0(c.sub)); set("oWords1",words(c.sub)); set("oName",esc(S.f.name)||"…………");
  save();
}
function refreshWorkTotals(){ document.querySelectorAll("#workBody table").forEach(tb=>{ const t = tb.querySelector("[data-tot]"); if(!t) return; const k = t.dataset.tot, cfg = COLS[k]; tb.querySelectorAll("tbody tr").forEach((tr,i)=>{ if(i<(S[k]||[]).length){ const cell=tr.querySelector("td.calc"); if(cell) cell.textContent=fmtN(cfg.amt(S[k][i])); } }); t.textContent = fmtN(sum(k)); }); refresh(); }

let cur="register";
let subCur="application";

function showTab(tab){
  cur=tab;
  // Only toggle MAIN views (register, filling) - direct children of main
  document.querySelectorAll("main > .view").forEach(s=>{ s.classList.toggle("on", s.dataset.v===tab); s.classList.remove("print-target"); });
  document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("on", a.dataset.tab===tab));
  
  if(tab==="register"){
    buildRegister();
    const subnav=document.getElementById("subnav");
    if(subnav) subnav.style.display="none";
  }else if(tab==="filling"){
    // Show subnav - always navigate to first sub-tab (आवेदन पत्र)
    const subnav=document.getElementById("subnav");
    if(subnav) subnav.style.display="flex";
    subCur = "application"; // Reset to first tab
    showSub("application");
  }
  window.scrollTo(0,0);
}

function showSub(v){
  subCur=v;
  // Only handle sub-tabs when in filling mode
  if(cur!=="filling") return;
  
  // Only toggle SUB views inside the filling section
  const fillingSection = document.querySelector('.view[data-v="filling"]');
  if(fillingSection){
    fillingSection.querySelectorAll(".view[data-v]").forEach(s=>{ s.classList.toggle("on", s.dataset.v===v); s.classList.remove("print-target"); });
  }
  document.querySelectorAll("#subnav a").forEach(a=>a.classList.toggle("on", a.dataset.go===v));
  
  if(v==="application"){ buildApplication(); }
  else if(v==="affidavit"){ buildAffidavit(); }
  else if(v==="work"){ buildWork(); refresh(); }
  else if(v==="bill"){ buildBill(); }
  window.scrollTo(0,0);
}

function buildRegister(){
  // Registration form logic - placeholder for API integration
  const tbody=document.getElementById("regRows");
  if(tbody) tbody.innerHTML='<tr><td colspan="8" class="empty">कोई पंजीकृत कृषक नहीं — ऊपर फॉर्म भरकर पंजीकरण करें</td></tr>';
}

document.addEventListener("input", e=>{
  const t=e.target;
  if(t.dataset && t.dataset.vc){ const i=+t.dataset.vc, k=t.dataset.k; if(!S.vcrops) S.vcrops=[{}]; if(!S.vcrops[i]) S.vcrops[i]={}; S.vcrops[i][k]=t.value; save(); return; }
  if(t.dataset && t.dataset.f){
    S.f[t.dataset.f]=t.value; save();
    refresh();
    const activeView = cur==="filling" ? subCur : cur;
    if(activeView==="application"){ const fn=document.getElementById("app_farmer_name"); if(fn) fn.textContent=S.f.name||"…………"; }
    return;
  }
  if(t.dataset && t.dataset.norm){ S.norm[t.dataset.norm]=t.value; save(); refresh(); }
  else if(t.dataset && t.dataset.row){ S[t.dataset.row][+t.dataset.i][t.dataset.k]=t.value; refreshWorkTotals(); }
});

document.addEventListener("change", e=>{
  const t=e.target;
  if(t.dataset && t.dataset.f){
    S.f[t.dataset.f]=t.value; save();
    const activeView = cur==="filling" ? subCur : cur;
    if(t.dataset.f==="gender"){
      if(activeView==="application") buildVermiApplication();
      if(activeView==="affidavit") buildVermiAffidavit();
    }
    refresh();
    return;
  }
  const listId = t.getAttribute && t.getAttribute("list");
  if(listId && DL[listId] && t.value.trim() && !S.lists[DL[listId]].includes(t.value.trim())){
    S.lists[DL[listId]].push(t.value.trim()); buildLists(); save();
  }
});

document.addEventListener("click", e=>{
  const b=e.target.closest("[data-add],[data-del],[data-go],[data-tab],#addCropBtn,[data-vcdel],#regForm button[type=submit],#regRefresh");
  if(!b) return;
  if(b.id==="addCropBtn"){ if(!S.vcrops) S.vcrops=[]; S.vcrops.push({name:"",area:""}); buildApplication(); save(); return; }
  if(b.dataset.vcdel!==undefined){ const i=+b.dataset.vcdel; if(S.vcrops && i<S.vcrops.length){ S.vcrops.splice(i,1); buildApplication(); save(); } return; }
  if(b.dataset.add){ S[b.dataset.add].push({}); buildWork(); refresh(); }
  else if(b.dataset.del){ const k=b.dataset.del; S[k].splice(+b.dataset.i,1); if(!S[k].length) S[k].push({}); buildWork(); refresh(); }
  else if(b.dataset.go){ showSub(b.dataset.go); }
  else if(b.dataset.tab){ showTab(b.dataset.tab); }
  else if(b.id==="regRefresh"){ buildRegister(); }
  else if(b.type==="submit" && b.form && b.form.id==="regForm"){
    e.preventDefault();
    const name=document.getElementById("regName").value.trim();
    const mob=document.getElementById("regMob").value.trim();
    const village=document.getElementById("regVillage").value.trim();
    const dist=document.getElementById("regDist").value.trim();
    if(!name || !mob){ alert("नाम और मोबाइल अनिवार्य हैं"); return; }
    // TODO: Replace with actual API POST call
    // const formId = await api.post("/register", {name, mob, village, dist, scheme:"vermicompost"});
    const formId = "VMC-" + Date.now().toString(36).toUpperCase();
    alert("पंजीकरण सफल! फॉर्म आईडी: " + formId);
    // Pre-fill form data
    S.f.name=name; S.f.mob=mob; S.f.village=village; S.f.dist=dist;
    S.f.date=new Date().toISOString().slice(0,10);
    save();
    showTab("filling");
  }
});

const bGoBtn = document.getElementById("bGo");
if (bGoBtn) bGoBtn.onclick = ()=>showSub("bill");

function printCurrent(){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("print-target"));
  let target;
  if(cur==="filling"){
    const fillingSection = document.querySelector('.view[data-v="filling"]');
    target = fillingSection ? fillingSection.querySelector('.view[data-v="' + subCur + '"]') : null;
  }else{
    target = document.querySelector('.view[data-v="' + cur + '"]');
  }
  if(!target) return;
  target.classList.add("print-target");
  window.print();
}
const PV_TITLES={application:"आवेदन पत्र", affidavit:"शपथ-पत्र", work:"व्यय विवरण", bill:"देयक प्रपत्र", register:"उपयोगकर्ता पंजीकरण"};
function openPreview(){
  const overlay=document.getElementById("pvOverlay");
  const body=document.getElementById("pvBody");
  let target;
  if(cur==="filling"){
    const fillingSection = document.querySelector('.view[data-v="filling"]');
    target = fillingSection ? fillingSection.querySelector('.view[data-v="' + subCur + '"]') : null;
  }else{
    target = document.querySelector('.view[data-v="' + cur + '"]');
  }
  if(!overlay||!body||!target) return;
  const activeView = cur==="filling" ? subCur : cur;
  document.getElementById("pvTitle").textContent = "प्रिंट पूर्वावलोकन — " + (PV_TITLES[activeView]||"प्रपत्र");
  body.innerHTML="";
  const clone=target.cloneNode(true);
  clone.classList.add("on");
  body.appendChild(clone);
  overlay.hidden=false;
  overlay.scrollTop=0;
}
function closePreview(){
  const overlay=document.getElementById("pvOverlay");
  if(!overlay) return;
  overlay.hidden=true;
  const body=document.getElementById("pvBody");
  if(body) body.innerHTML="";
}

try{
  const r=localStorage.getItem(KEY);
  if(r){
    S=Object.assign(blank(), JSON.parse(r));
    if(!S.vcrops) S.vcrops=[{name:"",area:""}];
    if(!S.vermi) S.vermi=[{}];
  }
}catch(e){}

buildNav();
toggleStrip();
showTab("register");

const bPreviewBtn=document.getElementById("bPreview");
if (bPreviewBtn) bPreviewBtn.onclick = openPreview;
const pvCloseBtn=document.getElementById("pvClose");
if (pvCloseBtn) pvCloseBtn.onclick = closePreview;
const pvPrintBtn=document.getElementById("pvPrint");
if (pvPrintBtn) pvPrintBtn.onclick = ()=>{ closePreview(); printCurrent(); };
const pvOverlayEl=document.getElementById("pvOverlay");
if (pvOverlayEl) pvOverlayEl.addEventListener("click", e=>{ if(e.target===e.currentTarget) closePreview(); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closePreview(); });
window.addEventListener("beforeprint", ()=>{ closePreview(); });
`;

export default function KisanAavedan() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.innerHTML = HTML_BODY;

    const syncAppNav = () => {
      const appNav = document.querySelector(".app-container > nav, .app-container > .navbar");
      if (!appNav) {
        root.style.setProperty("--app-nav-h", "0px");
        root.style.setProperty("--app-nav-pad", "0px");
        return;
      }
      const h = Math.round(appNav.getBoundingClientRect().height) || 0;
      const isFixed = window.getComputedStyle(appNav).position === "fixed";
      root.style.setProperty("--app-nav-h", h + "px");
      root.style.setProperty("--app-nav-pad", isFixed ? h + "px" : "0px");
    };
    syncAppNav();
    window.addEventListener("resize", syncAppNav);
    window.addEventListener("load", syncAppNav);
    const navSyncTimer = window.setTimeout(syncAppNav, 400);

    try {
      const run = new Function("document", "window", HTML_LOGIC);
      run(document, window);
    } catch (error) {
      console.error("Kisan Aavedan Portal initialization failed:", error);
      const target = root.querySelector("main") || root;
      const box = document.createElement("div");
      box.style.cssText =
        "margin:20px;padding:14px;border:1px solid #d8b4b4;background:#fff5f5;color:#7f1d1d;font-family:Segoe UI,sans-serif;";
      box.innerHTML =
        "<b>पोर्टल लोड नहीं हो सका।</b><br/>कृपया browser console में error देखें।";
      target.prepend(box);
    }

    return () => {
      window.removeEventListener("resize", syncAppNav);
      window.removeEventListener("load", syncAppNav);
      window.clearTimeout(navSyncTimer);
      root.innerHTML = "";
    };
  }, []);

  return <div ref={rootRef} className="kisan-html-react-root" />;
}