import React, { useEffect, useMemo, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import "./kisan-aavedan-portal.css";

const getCenterNameFromUser = (authUser) => {
  if (!authUser) return "";
  const candidates = [
    authUser.center_name, authUser.centerName, authUser.username, authUser.name,
    authUser.center?.center_name, authUser.center?.name, authUser.profile?.center_name
  ];
  const direct = candidates.find(v => v !== null && v !== undefined && String(v).trim() !== "");
  return direct ? String(direct).trim() : "";
};

const API_FENCING = "https://mahadevaaya.com/govbillingsystem/backend/api/fencing-kisan/";
const API_FENCING_LAND_DETAILS = "https://mahadevaaya.com/govbillingsystem/backend/api/fencing-land-details/";

const centerStore = { value: "" };
const readCenterName = () => (centerStore.value || "").trim();
const centerLine = () => readCenterName() || "……………………";

const HTML_BODY = `
<style>
.landtable input.landVil,.landtable input.landSelfName,.landtable input.landSelfFather,.landtable input.landSelfAadhaar{
  background:#EEF1EC;color:var(--ink-soft,#4A5A50);border-color:var(--rule,#C6CDC4);cursor:default
}
</style>
<div class="shell">
  <header class="topbar noprint">
    <div class="topbar-brand">
      <h1>अनुदान देयक प्रपत्र</h1>
      <p class="sub">कार्यालय — उद्यान विशेषज्ञ, कोटद्वार (गढ़वाल) · वित्तीय वर्ष 2026-27</p>
    </div>
    <div class="topbar-scheme">
      <label class="tk">योजना</label>
      <select id="scheme">
        <option value="fencing">चेनलिंक फेंसिंग / घेरबाड़</option>
      </select>
    </div>
    <div class="topbar-formid">
      <label class="tk">चयनित फॉर्म</label>
      <span class="fid" id="curFormId">— कोई फॉर्म चयनित नहीं —</span>
    </div>
  </header>
  <nav id="nav" class="tabs noprint">
    <a data-tab="register" class="on">उपयोगकर्ता पंजीकरण</a>
    <a data-tab="filling">प्रपत्र भरना</a>
    <button type="button" class="tabs-preview" id="bPreview">प्रिंट पूर्वावलोकन</button>
  </nav>
  <div class="api-msg noprint" id="apiMsg" hidden></div>
  <main>
    <section class="view on" data-v="register">
      <h2 class="head">उपयोगकर्ता पंजीकरण</h2>
      <p class="lead">पहले कृषक का पंजीकरण करें — इससे सर्वर पर फॉर्म आईडी बन जाती है। उसी फॉर्म आईडी पर आगे आवेदन, व्यय विवरण एवं देयक प्रपत्र भरा जाता है।</p>
      <div class="card">
        <div class="cap"><i></i>नया पंजीकरण<small>POST — फॉर्म आईडी स्वतः बनेगी</small></div>
        <div class="pad">
          <form id="regForm" class="grid" autocomplete="off">
            <div><label class="f">कृषक का नाम</label><input id="regName" placeholder="पूरा नाम"></div>
            <div><label class="f">मोबाइल नंबर</label><input id="regMob" inputmode="numeric" maxlength="10" placeholder="10 अंक"></div>
            <div><label class="f">केंद्र / कार्यालय का नाम</label><input id="regCenter" readonly disabled></div>
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
                <th>केंद्र</th><th>योजना</th><th>उद्यान कार्ड</th><th>पौधे</th>
                <th>क्षेत्रफल (हे०)</th><th>देय राजसहायता</th><th>स्थिति</th>
                <th style="width:160px">क्रिया</th>
              </tr></thead>
              <tbody id="regRows"><tr><td colspan="12" class="empty">लोड हो रहा है…</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
    <section class="view" data-v="filling">
      <div class="subtabs noprint" id="subnav">
        <a data-go="application" class="on">आवेदन पत्र</a>
        <a data-go="work">व्यय विवरण</a>
        <a data-go="bill">देयक प्रपत्र</a>
      </div>
      <section class="view on" data-v="application">
        <h2 class="head">आवेदन पत्र</h2>
        <p class="lead">चेनलिंक फेंसिंग / घेरबाड़ के लिए आवेदन पत्र — उद्यान कार्ड, पौधों की संख्या, भूमि और फेंसिंग mapping के अनुसार।</p>
        <div id="applicationOut"></div>
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
        <p class="lead">सीधे प्रपत्र पर ही भरें — जहाँ बिन्दु बने हैं वहीं लिखते जाएँ। तालिका, राजसहायता और शब्दों में राशि अपने आप भरती जाएगी।</p>
        <div class="card noprint" id="billSaveCard">
          <div class="cap"><i></i>सर्वर पर सहेजें<small>सभी चरण एक साथ</small></div>
          <div class="pad reg-actions">
            <button type="button" class="addrow solid" id="btnSaveAll">सम्पूर्ण प्रपत्र सहेजें</button>
            <span class="save-hint" id="saveAllHint"></span>
          </div>
        </div>
        <div id="billOut"></div>
      </section>
    </section>
  </main>
</div>
<div id="datalists" hidden></div>
<div class="strip noprint">
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

export default function KisanAavedanPortal() {
  const rootRef = useRef(null);
  const { user } = useAuth();
  const centerName = useMemo(() => getCenterNameFromUser(user), [user]);
  const centerRef = useRef(centerName);
  centerRef.current = centerName;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.innerHTML = HTML_BODY;
    const authCenter = (centerRef.current || "").trim();
    centerStore.value = authCenter;
    const centerInput = root.querySelector("#regCenter");
    if (centerInput) {
      centerInput.value = authCenter || "— लॉग इन केंद्र नहीं मिला —";
      centerInput.title = authCenter ? ("लॉग इन केंद्र: " + authCenter) : "लॉग इन केंद्र नहीं मिला";
    }

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
      (function() {
        "use strict";
        const num  = v => { const n = parseFloat(String(v==null?"":v).replace(/[^0-9.\-]/g,"")); return isNaN(n)?0:n; };
        const fmt0 = n => "₹ " + Math.round(Number(n)||0).toLocaleString("en-IN");
        const fmtN = n => (Number(n)||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
        const esc  = s => String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

        const ONE=["","एक","दो","तीन","चार","पाँच","छह","सात","आठ","नौ","दस","ग्यारह","बारह","तेरह","चौदह","पन्द्रह","सोलह","सत्रह","अठारह","उन्नीस",
        "बीस","इक्कीस","बाईस","तेईस","चौबीस","पच्चीस","छब्बीस","सत्ताईस","अट्ठाईस","उनतीस","तीस","इकतीस","बत्तीस","तैंतीस","चौंतीस","पैंतीस","छत्तीस","सैंतीस","अड़तीस","उनतालीस",
        "चालीस","इकतालीस","बयालीस","तैंतालीस","चवालीस","पैंतालीस","छियालीस","सैंतालीस","अड़तालीस","उनचास","पचास","इक्यावन","बावन","तिरेपन","चौवन","पचपन","छप्पन","सत्तावन","अट्ठावन","उनसठ",
        "साठ","इकसठ","बासठ","तिरेसठ","चौंसठ","पैंसठ","छियासठ","सड़सठ","अड़सठ","उनहत्तर","सत्तर","इकहत्तर","बहत्तर","तिहत्तर","चौहत्तर","पचहत्तर","छिहत्तर","सतहत्तर","अठहत्तर","उन्यासी",
        "अस्सी","इक्यासी","बयासी","तिरासी","चौरासी","पचासी","छियासी","सत्तासी","अट्ठासी","नवासी","नब्बे","इक्यानवे","बानवे","तिरानवे","चौरानवे","पचानवे","छियानवे","सत्तानवे","अट्ठानवे","निन्यानवे"];
        const three = n => { const s=Math.floor(n/100), r=n%100; let o = s?ONE[s]+" सौ":""; if(r) o+=(o?" ":"")+ONE[r]; return o; };
        function words(v){
          const n = Math.round(Math.abs(num(v))); if(!n) return "शून्य";
          const cr=Math.floor(n/10000000), lk=Math.floor(n%10000000/100000), th=Math.floor(n%100000/1000), hn=n%1000;
          const o=[]; if(cr)o.push(three(cr)+" करोड़"); if(lk)o.push(three(lk)+" लाख");
          if(th)o.push(three(th)+" हजार"); if(hn)o.push(three(hn));
          return o.join(" ");
        }

        const LISTS = {
          material:["चेनलिंक जाली (10 गेज)","चेनलिंक जाली (12 गेज)","कंटीले तार (बार्बड वायर)","एंगल आयरन 35×35×5 मि०मी०","एंगल आयरन 35×35×5 मि०मी०","एंगल आयरन 40×40×5 मि०मी०",
                    "एंगल आयरन 50×50×5 मि०मी०","लोहे के खम्बे","नटबोल्ट","बाइंडिंग वायर","लोहे का गेट","पेंट / प्राइमर"],
          footing:["सीमेंट","रेत","बजरी","रेत बजरी","ईंट","पत्थर","सरिया"],
          unit:["मीटर","नग","किग्रा","बोरी","घन मीटर","ट्रॉली","फीट","क्विंटल"],
          work:["गड्ढा खुदान","खम्बों की स्थापना","चेनलिंक जाली लगाना","कंटीले तार लगाना","गेट लगाना","फेंसिंग कार्य","अन्य श्रमिक कार्य"],
          other:["फोटोग्राफी / जियो टैग फोटोग्राफ","ढुलाई","लोडिंग / अनलोडिंग","मजदूरी","अन्य व्यय"]
        };
        const DL = {dlMaterial:"material", dlFooting:"footing", dlUnit:"unit", dlWork:"work", dlOther:"other"};

        const blank = () => ({
          scheme:"fencing",
          formId:"",
          lists: JSON.parse(JSON.stringify(LISTS)),
          norm:{fRate:80, vRate:75, fCap:"", vCap:"", fCostHa:200000},
          f:{name:"",father:"",village:"",post:"",block:"",dist:"",mob:"",aadhar:"",khasra:"",
             bank:"",branch:"",acct:"",ifsc:"",cat:"सामान्य",farmerCat:"सीमांत",gardenCard:"",plants:"",irrigation:"उपलब्ध",fenceStandardCost:"",
             planType:"जिला योजना", fenceMaterial:"चेनलिंक जाली", gender:"पुरुष",
             nali:"",area:"",fenceLen:"",poles:"",mbNo:"", verifiedLen:"260",
             mbLen:"",mbRate:"",mbAmt:"82000", date:new Date().toISOString().slice(0,10), place:"", officer:"", desig:""},
          landRows:[{relation:"स्वयं",name:"",father:"",khasra:"",aadhaar:"",hec:"0.40"},{relation:"भाई",name:"",father:"",khasra:"",aadhaar:"",hec:""},{relation:"पुत्र",name:"",father:"",khasra:"",aadhaar:"",hec:""},{relation:"पिता",name:"",father:"",khasra:"",aadhaar:"",hec:""},{relation:"अन्य",name:"",father:"",khasra:"",aadhaar:"",hec:""}],
          material:[{}], footing:[{}], labour:[{}], other:[{}]
        });
        let S = blank();

        const COLS = {
          material:{amt:r=>num(r.amt),
            c:[["item","किस कार्य / सामग्री का बिल है",0,0,"dlMaterial"],["sup","आपूर्तिकर्ता / फर्म"],["bill","बिल सं०"],
               ["amt","बिल राशि (₹)",0,"n"]]},
          footing:{amt:r=>num(r.amt),
            c:[["item","किस कार्य / सामग्री का बिल है",0,0,"dlFooting"],["sup","आपूर्तिकर्ता / फर्म"],
               ["amt","बिल राशि (₹)",0,"n"]]},
          labour:{amt:r=>num(r.amt),
            c:[["work","कार्य का विवरण",0,0,"dlWork"],["amt","भुगतान राशि (₹)",0,"n"]]},
          other:{amt:r=>num(r.amt),
            c:[["item","विवरण",0,0,"dlOther"],["name","प्राप्तकर्ता का नाम"],["vil","ग्राम"],["aad","आधार सं०"],["amt","राशि (₹)",0,"n"]]}
        };
        const sum = k => S[k].reduce((a,r)=>a+COLS[k].amt(r),0);

        const SECTIONS = {
          fencing:[["material","अ · सामग्री","चेनलिंक / कंटीले वायर, एंगल आयरन, नटबोल्ट आदि → देयक पंक्ति 1"],
                   ["footing","ब · फुटिंग सामग्री","सीमेंट, रेत, बजरी → देयक पंक्ति 2"],
                   ["labour","स · श्रमिक कार्य","→ देयक पंक्ति 3"],
                   ["other","अन्य","→ देयक पंक्ति 4"]]
        };

        function mbValue(){
          const direct = num(S.f.mbAmt);
          if(direct>0) return direct;
          const l=num(S.f.mbLen), r=num(S.f.mbRate);
          return (l>0 && r>0) ? l*r : 0;
        }
        function calc(){
          const isF = S.scheme==="fencing";
          const parts = isF ? [
              ["सामग्री — चेनलिंक / कंटीले वायर, एंगल आयरन, नटबोल्ट आदि", sum("material")],
              ["फुटिंग सामग्री — सीमेंट, रेत, बजरी", sum("footing")],
              ["श्रमिक कार्य — गड्ढा खुदान, खम्बों की स्थापना, चेनलिंक / कंटीले वायर लगाना, गेट लगाना आदि", sum("labour")],
              ["अन्य", sum("other")]
            ] : [];

          const bill = parts.reduce((a,p)=>a+p[1],0);
          const rate = (isF ? num(S.norm.fRate) : num(S.norm.vRate))/100;
          const cap  = num(isF ? S.norm.fCap : S.norm.vCap);

          let mb=0, base=0, bases=[], hec=0, allowedLen=0, verifiedLen=0, ratio=1, actualArea=0, standardCost=0, shortfall=0;
          // FIX: track totalHec separately for display
          let totalHec = 0;

          if(isF){
            mb = mbValue();
            const app = applicationData();
            totalHec = app.totalHec;
            hec = app.allowedArea ? app.totalHec : 0;
            const std = app.allowedArea ? fenceStandard(hec) : null;
            allowedLen = std ? std.len : 0;
            verifiedLen = num(S.f.verifiedLen);
            ratio = (allowedLen>0 && verifiedLen>0) ? (verifiedLen/allowedLen) : 1;
            actualArea = hec * ratio;
            const costHa = num(S.norm.fCostHa)||200000;
            standardCost = actualArea>0 ? Math.round(actualArea*costHa) : 0;
            shortfall = Math.max(0, allowedLen - verifiedLen);

            if(bill>0)         bases.push({key:"bill",     label:"बिल / वाउचर के अनुसार कुल व्यय",   val:bill});
            if(mb>0)           bases.push({key:"mb",       label:"एम०बी० मूल्यांकन धनराशि",          val:mb});
            if(standardCost>0) bases.push({key:"standard", label:"मानक लागत (क्षेत्रफल × ₹2,00,000)", val:standardCost});
            base = bases.length ? Math.min(...bases.map(b=>b.val)) : 0;
          }else{
            mb = mbValue();
            base = mb>0 ? Math.min(bill, mb) : bill;
          }

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
          // FIX: include totalHec in return
          return {isF, bill, mb, base, bases, rate, sub, own:bill-sub, cap, capped, over: mb>0 && bill>0 && bill>mb,
                  hec, totalHec, allowedLen, verifiedLen, mbLen:num(S.f.mbLen), ratio, actualArea, standardCost, shortfall, rows};
        }

        function tableHTML(k){
          const cfg=COLS[k];
          let h='<table class="expense-table"><thead><tr><th style="width:38px">क्र०</th>';
          cfg.c.forEach(c=>h+=`<th>${c[1]}</th>`);
          h+='<th style="width:38px"></th></tr></thead><tbody>';
          S[k].forEach((r,i)=>{
            h+=`<tr><td class="n">${i+1}</td>`;
            const tip = (r.item||r.work)
              ? ` title="सर्वर: मात्रा ${esc(r.qty||0)} ${esc(r.unit||"")} × दर ${esc(r.rate||0)}"`
              : "";
            cfg.c.forEach(c=>{
              if(c[0]==="_amt"){ h+=`<td class="calc num">${fmtN(cfg.amt(r))}</td>`; return; }
              h+=`<td><input data-row="${k}" data-i="${i}" data-k="${c[0]}" value="${esc(r[c[0]]||"")}"`
                + (c[4]?` list="${c[4]}"`:"") + (c[3]==="n"?' inputmode="decimal" style="text-align:right"':"") + (c[0]==="item"||c[0]==="work"?tip:"") + `></td>`;
            });
            h+=`<td><button class="rm" data-del="${k}" data-i="${i}" title="पंक्ति हटाएँ">×</button></td></tr>`;
          });
          const ai = cfg.c.findIndex(c=>c[0]==="_amt"||c[0]==="amt");
          h+=`<tr class="tot"><td colspan="${ai+1}" style="text-align:right">योग</td><td class="calc num" data-tot="${k}">${fmtN(sum(k))}</td>`;
          for(let j=ai+1;j<=cfg.c.length;j++) h+="<td></td>";
          h+='</tr></tbody></table>';
          h+=`<button class="addrow" data-add="${k}">+ पंक्ति जोड़ें</button>`;
          return h;
        }
        function buildLists(){
          document.getElementById("datalists").innerHTML =
            Object.keys(DL).map(i=>`<datalist id="${i}">`+(S.lists[DL[i]]||[]).map(v=>`<option value="${esc(v)}">`).join("")+"</datalist>").join("");
        }
        function buildStandards(){
          const body=document.getElementById("standardsBody");
          const title=document.getElementById("standardsTitle");
          if(!body) return;
          title.textContent="फेंसिंग राजसहायता के मानक";
          body.innerHTML=`<div class="grid">
            <div><label class="f">फेंसिंग राजसहायता दर (%) — सभी श्रेणियों के लिए समान</label>
              <select data-norm="fRate"><option value="50">50%</option><option value="80">80%</option></select></div>
            <div><label class="f">इकाई लागत ₹ प्रति हेक्टेयर</label><input data-norm="fCostHa" inputmode="decimal" placeholder="2,00,000"></div>
            <div><label class="f">अतिरिक्त अधिकतम सीमा ₹ (वैकल्पिक)</label><input data-norm="fCap" inputmode="decimal" placeholder="खाली = कोई अलग सीमा नहीं"></div>
          </div>
          <p class="lead" style="margin:12px 0 0">विभागीय मानक: इकाई लागत ₹2,00,000 प्रति हेक्टेयर। लागत सदैव क्षेत्रफल (हे०) से बनती है, मीटर से गुणा करके नहीं।
          सत्यापित लम्बाई अनुमन्य लम्बाई से जितनी कम हो, उसी अनुपात में क्षेत्रफल घटाकर मानक लागत निकाली जाती है।
          राजसहायता तीन आधारों — <b>बिल / वाउचर का योग</b>, <b>एम०बी० मूल्यांकन</b>, तथा <b>मानक लागत</b> — इनमें से जो <b>न्यूनतम</b> हो, उस पर देय होगी।</p>`;
          body.querySelectorAll("[data-norm]").forEach(el=>el.value=S.norm[el.dataset.norm]);
        }
        function buildWork(){
          buildStandards();
          document.getElementById("workLead").textContent = S.scheme==="fencing"
            ? "बिल एवं वाउचर के अनुसार पूरा व्यय भरें। हर अनुभाग का योग अपने आप देयक की सम्बन्धित पंक्ति में चला जाएगा।"
            : "इकाई निर्माण पर हुआ पूरा व्यय भरें। हर पंक्ति में पहले कार्य / विवरण चुनें, फिर उसी के सामने बिल राशि डालें।";
          document.getElementById("workBody").innerHTML = SECTIONS[S.scheme].map(([k,t,n])=>
            `<div class="card"><div class="cap"><i></i>${t}<small>${n}</small></div><div class="pad">${tableHTML(k)}${saveBar(k, SAVE_LABELS[k]||t)}</div></div>`).join("");
          buildLists();
          const mapCard=document.getElementById("fenceMapCard");
          if(mapCard) mapCard.style.display = S.scheme==="fencing" ? "" : "none";
          document.querySelectorAll("[data-norm]").forEach(el=>el.value = S.norm[el.dataset.norm]);
        }

        const FENCE_AREA_MAP = [
          {nali:10,  hec:0.20, len:240, poles:81},
          {nali:15,  hec:0.30, len:260, poles:87},
          {nali:20,  hec:0.40, len:280, poles:94},
          {nali:25,  hec:0.50, len:300, poles:101},
          {nali:30,  hec:0.60, len:320, poles:107},
          {nali:35,  hec:0.70, len:340, poles:114},
          {nali:40,  hec:0.80, len:360, poles:121},
          {nali:45,  hec:0.90, len:380, poles:127},
          {nali:50,  hec:1.00, len:400, poles:134},
          {nali:60,  hec:1.20, len:440, poles:147},
          {nali:70,  hec:1.40, len:480, poles:161},
          {nali:80,  hec:1.60, len:520, poles:174},
          {nali:90,  hec:1.80, len:560, poles:187},
          {nali:100, hec:2.00, len:600, poles:201}
        ];
        let FENCE_MAP_DATA = null;
        async function loadFenceStandards(){
          try{
            const res = await apiFetch(API_FENCING_LAND_DETAILS);
            const data = await readJsonResponse(res);
            const arr = Array.isArray(data) ? data : (data && data.data ? data.data : []);
            if(arr.length){
              FENCE_MAP_DATA = arr.map(r=>({
                nali: num(r.land_nali),
                hec: num(r.area_hectare),
                len: num(r.permissible_length),
                poles: num(r.pillars)
              })).filter(x=>x.hec>0).sort((a,b)=>a.hec-b.hec);
            }
          }catch(e){ /* fallback to hardcoded map */ }
        }
        function getFenceMap(){
          return (FENCE_MAP_DATA && FENCE_MAP_DATA.length) ? FENCE_MAP_DATA : FENCE_AREA_MAP;
        }
        function fenceStandard(hec){
          const map = getFenceMap();
          const h = Math.round(num(hec)*100)/100;
          if(h<=0) return null;
          return map.find(x=>Math.abs(x.hec-h)<0.0001) || null;
        }
        function isAllowedFenceHec(hec){
          const map = getFenceMap();
          const h = Math.round(num(hec)*100)/100;
          return map.some(x=>Math.abs(x-h)<0.0001);
        }
        function fenceMaterialName(){
          return S.f.fenceMaterial==="कंटीले तार" ? "कंटीले तार (बार्बड वायर)" : "चेनलिंक जाली";
        }
        const LANG_FIELDS=["planType","gender","fenceMaterial"];
        function rebuildDocs(){
          if(cur==="application" && document.getElementById("applicationOut")) buildApplication();
          if(cur==="bill" && document.getElementById("billOut")) buildBill();
        }
        function isFemale(){ return (S.f.gender||"पुरुष")==="महिला"; }
        function G(m,f){ return isFemale()?f:m; }
        function applicantWord(){ return G("आवेदक","आवेदिका"); }
        function beneficiaryWord(){ return G("लाभार्थी","लाभार्थिनी"); }
        function fenceHeading(){
          return S.f.fenceMaterial==="कंटीले तार" ? "कंटीले तार" : "चेनलिंक फेंसिंग";
        }
        function fenceKaamPhrase(){
          return S.f.fenceMaterial==="कंटीले तार" ? "कंटीले तार की घेरबाड़" : "चेनलिंक फेंसिंग की घेरबाड़";
        }
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

        function affidavitHasCoSharers(d){
          const rows=S.landRows||[];
          const ownHec=num(rows[0]?.hec);
          const totalHec=num(d?.totalHec);
          return totalHec > ownHec + 0.000001;
        }
        function affHec(v){
          const n=num(v);
          return n>0 ? n.toFixed(2) : "…………";
        }
        function affNali(v){
          const n=num(v);
          return n>0 ? n.toFixed(2).replace(/\.00$/,"") : "…………";
        }
        function buildFencingAffidavit(d){
          const f=S.f||{};
          const joint=affidavitHasCoSharers(d);
          const total=affHec(d.totalHec);
          const totalNali=affNali(d.totalNali);
          const first=(S.landRows&&S.landRows[0])||{};
          const coRows=(S.landRows||[]).slice(1).filter(r =>
            num(r.hec)>0 || String(r.name||"").trim() || String(r.relation||"").trim()
          );

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
            const rate=num(S.norm.fRate)||80;
            const costHa=num(S.norm.fCostHa)||200000;
            const stdCost=Math.round(num(d.totalHec)*costHa);
            const estSub=Math.round(stdCost*rate/100);
            const bank=esc(f.bank||"…………");
            const branch=esc(f.branch||"…………");
            const acct=esc(f.acct||"…………");
            return `<div class="affidavit-doc aff-page-break">
              <div class="aff-head">
                <div class="aff-kicker">उद्यान विभाग, कोटद्वार · वित्तीय वर्ष 2026-27</div>
                <div class="aff-title">लाभार्थी स्व-घोषणा एवं शपथ-पत्र</div>
                <div class="aff-sub">(${fenceKaamPhrase()} हेतु आवेदन एवं स्व-घोषणा — स्वयं की पूर्ण भूमि की स्थिति में) · स्टाम्प : ₹10/-</div>
                <div class="aff-line"></div>
              </div>
              <div class="aff-intro">मैं श्री <b>${name}</b>, ${G("पुत्र","पुत्री")} श्री <b>${father}</b>, निवासी ग्राम <b>${village}</b>, ग्राम पंचायत <b>${esc(f.panchayat||"…………")}</b>, विकासखण्ड <b>${block}</b>, उद्यान सचल दल केन्द्र कोटद्वार, जनपद <b>${dist}</b>, उत्तराखण्ड, सत्यनिष्ठा से शपथपूर्वक निम्नलिखित घोषणा ${G("करता","करती")} हूँ कि —</div>
              <div class="aff-item">1. यह कि मेरी स्वयं के स्वामित्व एवं कब्जे की भूमि का विवरण निम्नानुसार है — ग्राम <b>${village}</b>, खसरा / खतौनी सं० <b>${khasra}</b>, कुल क्षेत्रफल <b>${total} हे० (${totalNali} नाली)</b>, भूमि का स्वामित्व : स्वयं। उक्त संपूर्ण भूमि मेरी स्वयं की है तथा ${plan} अन्तर्गत ${fenceKaamPhrase()} की स्थापना हेतु प्रस्तावित क्षेत्रफल इसी भूमि से संबंधित है।</div>
              <div class="aff-item">2. यह कि आवेदन स्वीकृत होने की दशा में, उक्त भूमि पर ${fenceKaamPhrase()} का कार्य उद्यान विभाग द्वारा निर्धारित मानकों एवं स्वीकृत तकनीकी विवरण के अनुसार ही कराया जाएगा। कार्य पूर्ण होने के पश्चात मैं मौके पर सामग्री एवं कार्य का निरीक्षण कर विभाग को सूचित ${G("करूँगा","करूँगी")}।</div>
              <div class="aff-item">3. यह कि आवेदन के समय विभागीय मानक दर के अनुसार उक्त क्षेत्रफल हेतु ${fenceKaamPhrase()} की अनुमानित लागत <b>${stdCost?fmt0(stdCost):"…………"}/-</b> आँकी गई है। चूँकि कार्य अभी प्रारम्भ नहीं हुआ है, अतः वास्तविक व्यय की जानकारी मुझे नहीं है — कार्य पूर्ण होने के पश्चात प्रस्तुत बिल / वाउचर के आधार पर अंतिम राजसहायता की गणना मान्य लागत या वास्तविक व्यय, इन दोनों में से जो भी कम हो, उसके अनुसार की जाएगी।</div>
              <div class="aff-item">4. उक्त अनुमानित लागत पर योजना में निर्धारित दर (<b>${rate}%</b>) के अनुसार अनुमानित राजसहायता <b>${estSub?fmt0(estSub):"…………"}/-</b> होगी, जिसका भुगतान कार्य पूर्ण होने एवं देयक सत्यापित होने के पश्चात नियमानुसार डी.बी.टी. (DBT) के माध्यम से मेरे बैंक खाते (<b>${bank}, ${branch}</b>, खाता सं० <b>${acct}</b>) में किया जाएगा।</div>
              <div class="aff-item">5. यह कि योजनान्तर्गत निर्धारित राजसहायता की शर्तों से मैं पूर्णतः सहमत हूँ। यदि वास्तविक ${fenceKaamPhrase()} कार्य स्वीकृत मानकों या स्वीकृत क्षेत्रफल से अधिक होता है, तो अतिरिक्त लंबाई / क्षेत्रफल पर होने वाला समस्त व्यय मैं स्वयं वहन ${G("करूँगा","करूँगी")} और विभाग से किसी अतिरिक्त राजसहायता की मांग नहीं ${G("करूँगा","करूँगी")}। इसके अतिरिक्त, वास्तविक व्यय मान्य विभागीय लागत से अधिक होने की दशा में भी उस अतिरिक्त राशि पर कोई राजसहायता देय नहीं होगी तथा मान्य लागत एवं देय राजसहायता के मध्य की शेष राशि सहित यह संपूर्ण भार मेरे द्वारा स्वयं वहन किया जाएगा।</div>
              <div class="aff-item">6. यह कि इससे पूर्व मेरे द्वारा उक्त प्रस्तावित भूमि की घेराबाड़ हेतु किसी भी अन्य सरकारी विभाग अथवा किसी अन्य योजना / परियोजना से कोई सरकारी अनुदान, सहायता या वित्तीय लाभ प्राप्त नहीं किया गया है।</div>
              <div class="aff-item">7. यह कि उक्त भूमि पूर्णतः विवाद रहित है तथा इस पर किसी भी प्रकार का कोई मालिकाना हक का वाद-विवाद, न्यायालयीन प्रकरण, बैंक बंधक अथवा अन्य कोई कानूनी अड़चन विद्यमान नहीं है।</div>
              <div class="aff-item">8. यह कि कार्य स्थल पर मेरे द्वारा विभागीय निर्देशानुसार हरी पृष्ठभूमि पर सफेद पेंट से अंकित एक लोहे का सूचना बोर्ड लगाया जाएगा, जिसमें योजना का नाम "${plan} अन्तर्गत उद्यान की ${fenceHeading()} घेराबाड़ योजना वर्ष 2026-2027", कृषक का विवरण, कुल क्षेत्रफल, कुल लागत एवं राजसहायता का स्पष्ट उल्लेख होगा।</div>
              <div class="aff-item">9. यह कि स्थापित की जाने वाली घेराबाड़ के भविष्य में रख-रखाव, मरम्मत एवं देख-रेख की संपूर्ण जिम्मेदारी मेरी स्वयं की होगी। प्राकृतिक आपदा या किसी अन्य कारण से घेराबाड़ को होने वाले नुकसान के लिए उद्यान विभाग उत्तरदायी नहीं होगा।</div>
              <div class="aff-item">10. यह कि मैं विभाग द्वारा किए जाने वाले स्थलीय निरीक्षण, भौतिक सत्यापन एवं आवश्यक जाँच में सहयोग ${G("करूँगा","करूँगी")}। यदि मेरे द्वारा प्रस्तुत भूमि अभिलेख, बैंक खाते की जानकारी या घेराबाड़ से संबंधित कोई भी तथ्य भविष्य में असत्य या भ्रामक पाया जाता है, तो विभाग को मेरे विरुद्ध कानूनी कार्यवाही करने तथा दी गई राजसहायता की राशि को भू-राजस्व की भांति वसूल करने का पूर्ण अधिकार होगा, जो मुझे सहर्ष स्वीकार होगा।</div>
              <div class="aff-decl">मैंने यह शपथ-पत्र बिना किसी दबाव, भय अथवा प्रलोभन के अपनी स्वतंत्र इच्छा से दिया है तथा इसमें वर्णित सभी तथ्य मेरे ज्ञान एवं विश्वास के अनुसार सत्य एवं सही हैं।</div>
              <div class="aff-sign-plain">
                <div><b>${G("शपथकर्ता","शपथकर्त्री")} / कृषक</b></div>
                <div>नाम : ${name}</div>
                <div>हस्ताक्षर : ________________</div>
                <div>मो० : ${esc(f.mob||"…………")}</div>
                <div>स्थान : ________________</div>
                <div>दिनांक : ${esc(f.date||"…………")}</div>
              </div>
            </div>`;
          }

          const coTable=coRows.length ? coRows.map((r,i)=>`
              <tr>
                <td style="text-align:center">${i+1}</td>
                <td>${esc(r.name||"…………")}</td>
                <td>${esc(r.relation||"…………")}</td>
                <td>${esc(r.khasra||"…………")}</td>
                <td>${esc(r.aadhaar||"…………")}</td>
                <td class="right">${affHec(r.hec)}</td>
              </tr>`).join("") : `<tr><td colspan="6" style="text-align:center">कोई सह-खातेदार विवरण उपलब्ध नहीं</td></tr>`;

          return `<div class="affidavit-doc aff-page-break">
            <div class="aff-head">
              <div class="aff-kicker">उद्यान विभाग · वित्तीय वर्ष 2026-27</div>
              <div class="aff-title">शपथ-पत्र</div>
              <div class="aff-sub">(चेनलिंक घेराबाड़ कार्य हेतु — संयुक्त भूमि / सह-खातेदार)</div>
              <div class="aff-line"></div>
            </div>
            <div class="aff-meta">
              <div><span>नाम</span><b>${name}</b></div>
              <div><span>पिता / पति का नाम</span><b>${father}</b></div>
              <div><span>ग्राम</span><b>${village}</b></div>
              <div><span>डाकघर</span><b>${post}</b></div>
              <div><span>विकास खण्ड</span><b>${block}</b></div>
              <div><span>जनपद</span><b>${dist}</b></div>
              <div><span>उद्यान कार्ड (कृषक पहचान)</span><b>${card}</b></div>
              <div><span>घेराबाड़ हेतु कुल प्रस्तावित क्षेत्रफल</span><b>${total} हे० (${totalNali} नाली)</b></div>
            </div>
            <div class="aff-intro">मैं <b>${name}</b> ${G("पुत्र","पुत्री")} <b>${father}</b>, निवासी ग्राम <b>${village}</b>, डाकघर <b>${post}</b>, जनपद <b>${dist}</b>, शपथपूर्वक बयान ${G("करता","करती")} हूँ कि:</div>
            <div class="aff-item">1. यह कि मेरा नाम, पता एवं अन्य व्यक्तिगत विवरण उपर्युक्त अनुसार पूर्णतः सत्य, सही एवं प्रमाणिक हैं।</div>
            <div class="aff-item">2. यह कि मेरे द्वारा अपनी एवं अपने परिवार के सह-खातेदारों की संयुक्त भूमि की जंगली जानवरों एवं बाह्य कारकों से सुरक्षा हेतु घेराबाड़ कार्य पर राजसहायता / अनुदान प्राप्त करने के लिए उद्यान विभाग, कोटद्वार में विधिवत आवेदन प्रस्तुत किया जा रहा है।</div>
            <div class="aff-item">3. यह कि जिस संपूर्ण भूमि पर मेरे द्वारा घेराबाड़ का कार्य कराया जाना प्रस्तावित है, वह भूमि हमारे संयुक्त परिवार के वैधानिक स्वामित्व एवं वास्तविक कब्जे में है तथा वह भौगोलिक रूप से एक ही चक के रूप में स्थित है, जिसका विवरण निम्नवत है:</div>
            <table class="aff-land">
              <thead><tr><th>क्र०</th><th>सह-खातेदार का नाम</th><th>${applicantWord()} से संबंध</th><th>खसरा / खतौनी सं०</th><th>आधार संख्या</th><th>क्षेत्रफल (हे०)</th></tr></thead>
              <tbody>
                <tr><td style="text-align:center">स्वयं</td><td>${name}</td><td>स्वयं</td><td>${khasra}</td><td>${esc(f.aadhar||"…………")}</td><td class="right">${affHec(first.hec)}</td></tr>
                ${coTable}
                <tr><td colspan="4" style="text-align:right"><b>घेराबाड़ हेतु कुल प्रस्तावित क्षेत्रफल</b></td><td class="right"><b>${total}</b></td></tr>
              </tbody>
            </table>
            <div class="aff-item">4. यह कि उक्त संपूर्ण एकत्रित भूमि पर वर्तमान में विभिन्न प्रजातियों के फलदार पौधे लगे हुए हैं, जिनकी सुरक्षा, सिंचाई, खाद-उर्वरक प्रबंधन एवं समस्त रख-रखाव की पूर्ण जिम्मेदारी वास्तविक रूप से मेरे (${applicantWord()}) द्वारा ही संभाली जाती है।</div>
            <div class="aff-item">5. यह कि मेरे सह-खातेदारों द्वारा अपनी भूमि पर घेराबाड़ कार्य कराए जाने तथा योजना के अंतर्गत देय राजसहायता की समस्त धनराशि डी.बी.टी. के माध्यम से सीधे मेरे (${applicantWord()} के) बैंक खाते में प्राप्त करने हेतु स्वेच्छा से अपनी लिखित सहमति प्रदान की गई है, जो इस शपथ-पत्र का मुख्य अंग है।</div>
            <div class="aff-item">6. यह कि इससे पूर्व हमारे द्वारा किसी भी सरकारी विभाग अथवा योजना / परियोजना से उक्त प्रस्तावित संयुक्त भूमि की घेराबाड़ हेतु किसी भी प्रकार का कोई सरकारी अनुदान, सहायता या वित्तीय लाभ प्राप्त नहीं किया गया है।</div>
            <div class="aff-item">7. यह कि उक्त भूमि पूर्णतः विवाद रहित है तथा इस पर किसी भी प्रकार का कोई मालिकाना हक का वाद-विवाद, न्यायालयीन प्रकरण, पारिवारिक आपसी बंटवारे का विवाद, बैंक बंधक अथवा अन्य कोई कानूनी अड़चन विद्यमान नहीं है।</div>
            <div class="aff-item">8. यह कि आवेदन स्वीकृत होने की दशा में, मेरे द्वारा घेराबाड़ का कार्य उद्यान विभाग द्वारा निर्धारित विभागीय तकनीकी मानकों एवं दिशा-निर्देशों के अनुरूप ही कराया जाएगा।</div>
            <div class="aff-item">9. यह कि योजनान्तर्गत निर्धारित राजसहायता की शर्तों से मैं पूर्णतः सहमत हूँ। यदि वास्तविक घेराबाड़ कार्य स्वीकृत मानकों या स्वीकृत क्षेत्रफल से अधिक होता है, तो अतिरिक्त लंबाई पर होने वाला समस्त व्यय मैं स्वयं वहन ${G("करूँगा","करूँगी")} और विभाग से किसी अतिरिक्त राजसहायता की मांग नहीं ${G("करूँगा","करूँगी")}।</div>
            <div class="aff-item">10. यह कि कार्य स्थल पर मेरे द्वारा विभागीय निर्देशानुसार हरी पृष्ठभूमि पर सफेद पेंट से अंकित एक लोहे का सूचना बोर्ड लगाया जाएगा, जिसमें योजना का नाम "${plan} अन्तर्गत उद्यान की ${fenceHeading()} घेराबाड़ योजना वर्ष 2026-2027", कृषक का विवरण, कुल क्षेत्रफल, कुल लागत एवं राजसहायता का स्पष्ट उल्लेख होगा।</div>
            <div class="aff-item">11. यह कि स्थापित की गई घेराबाड़ के भविष्य में रख-रखाव, मरम्मत एवं देख-रेख की संपूर्ण जिम्मेदारी मेरी स्वयं की होगी। प्राकृतिक आपदा या किसी अन्य कारण से घेराबाड़ को होने वाले नुकसान के लिए उद्यान विभाग उत्तरदायी नहीं होगा।</div>
            <div class="aff-item">12. यह कि भविष्य में यदि मेरे द्वारा प्रस्तुत भूमि के दस्तावेज, पारिवारिक सहमति-पत्र, बैंक खाते की जानकारी या घेराबाड़ से संबंधित कोई भी तथ्य असत्य या भ्रामक पाया जाता है, तो विभाग को मेरा आवेदन निरस्त करने, कानूनी कार्यवाही करने तथा यदि कोई राशि प्राप्त हुई हो तो उसे भू-राजस्व की भांति वसूल करने का पूर्ण अधिकार होगा, जो मुझे सहर्ष स्वीकार होगा।</div>
            <div class="aff-decl">मैं यह शपथ-पत्र पूर्ण होश-हवास में, बिना किसी दबाव, प्रलोभन अथवा भय के, स्वेच्छा से सत्यनिष्ठा के साथ दे रहा / रही हूँ।</div>
            <div class="aff-sign">
              <div class="box">स्थान: ${village}<br>दिनांक: ${esc(f.date||"…………")}</div>
              <div class="box line">${G("शपथकर्ता","शपथकर्त्री")} के हस्ताक्षर<br>${name}</div>
            </div>
            <div class="aff-consent aff-page-break">
              <div class="aff-head">
                <div class="aff-title">सह-खातेदार / परिवार के सदस्यों का सहमति-पत्र</div>
                <div class="aff-line"></div>
              </div>
              <div class="aff-item">हम शपथपूर्वक बयान करते हैं कि हमें उद्यान विभाग की इस योजना के अंतर्गत ${applicantWord()} <b>${name}</b> द्वारा उपरोक्त वर्णित हमारी संयुक्त भूमि पर घेराबाड़ का कार्य कराए जाने तथा विभाग द्वारा अनुमन्य राजसहायता की राशि सीधे ${applicantWord()} के बैंक खाते में हस्तांतरित (DBT) किए जाने पर कोई आपत्ति नहीं है। हम अपनी भूमि पर इस कार्य हेतु अपनी पूर्ण सहमति सहर्ष प्रदान करते हैं।</div>
              ${coRows.length ? coRows.map((r,i)=>`
                <div class="aff-consent-block">
                  <div class="hd">${applicantWord()} से संबंध : ${esc(r.relation||"…………")} &nbsp;·&nbsp; आधार कार्ड सं० : ${esc(r.aadhaar||"…………")}</div>
                  <div class="aff-sign-plain">
                    <div><b>सह-खातेदार / परिवार का सदस्य (क्र० ${i+1})</b></div>
                    <div>नाम : ${esc(r.name||"…………")}</div>
                    <div>हस्ताक्षर : ________________</div>
                    <div>मो० : ${esc(r.mob||"…………")}</div>
                    <div>स्थान : ________________</div>
                    <div>दिनांक : ${esc(f.date||"…………")}</div>
                  </div>
                </div>`).join("") : `
                <div class="aff-consent-block">
                  <div class="aff-sign-plain">
                    <div><b>सह-खातेदार / परिवार का सदस्य</b></div>
                    <div>नाम : ________________</div>
                    <div>हस्ताक्षर : ________________</div>
                    <div>मो० : ________________</div>
                    <div>स्थान : ________________</div>
                    <div>दिनांक : ________________</div>
                  </div>
                </div>`}
            </div>
          </div>`;
        }

        function buildFencingApplication(){
          const d=applicationData();
          const rate=num(S.norm.fRate);
          const standard = (d.allowedArea && d.totalHec>0) ? Math.round(d.totalHec*(num(S.norm.fCostHa)||200000)) : 0;
          const subsidy=standard>0 ? Math.round(standard*rate/100) : 0;
          const status = !S.f.gardenCard
            ? `<div class="appbad"><b>फेंसिंग पात्रता:</b> अयोग्य — उद्यान कार्ड संख्या अनिवार्य है।</div>`
            : d.plants<=0
            ? `<div class="appbad"><b>फेंसिंग पात्रता:</b> अयोग्य — उद्यान में उपलब्ध फल पौधों की संख्या भरना अनिवार्य है।</div>`
            : d.area<=0
            ? `<div class="appbad"><b>फेंसिंग पात्रता:</b> पहले भूमि का क्षेत्रफल चुनें।</div>`
            : !d.allowedArea
            ? `<div class="appbad"><b>आवेदन स्थिति:</b> लागू नहीं — सभी भूमि प्रविष्टियों को जोड़ने पर प्रस्तावित भूमि का कुल क्षेत्रफल निर्धारित मैपिंग की किसी भी स्वीकृत श्रेणी से मेल नहीं खाता। केवल 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80, 0.90, 1.00, 1.20, 1.40, 1.60, 1.80 या 2.00 हे० का कुल क्षेत्रफल मान्य होगा।</div>`
            : d.plants/d.area<100
            ? `<div class="appbad"><b>फेंसिंग पात्रता:</b> अयोग्य — न्यूनतम 100 पौधे प्रति हे० आवश्यक हैं। वर्तमान ${fmtN(d.plants/d.area)} पौधे/हे०।</div>`
            : `<div class="appok"><b>फेंसिंग पात्रता:</b> पात्र — न्यूनतम 100 पौधे प्रति हे० की शर्त पूरी है।</div>`;

          document.getElementById("applicationOut").innerHTML=`<div class="appdoc">
            <div style="text-align:center;font-size:11.5px;color:#65746B;margin:2px 0 4px">उद्यान विभाग · वित्तीय वर्ष 2026-27</div>
            <h3 style="text-decoration:underline">${esc(S.f.planType||"जिला योजना")} अन्तर्गत ${fenceHeading()} हेतु</h3>
            <h4 style="color:var(--ink);font-size:16px;font-weight:600">कृषक आवेदन पत्र</h4>
            <div class="appnote">
              <b>योजना:</b>
              <select data-f="planType" style="margin-left:8px;padding:3px">
                <option>जिला योजना</option><option>राज्य सेक्टर योजना</option>
              </select>
              <span style="margin-left:18px"><b>लिंग:</b></span>
              <select data-f="gender" style="margin-left:8px;padding:3px">
                <option value="पुरुष">पुरुष</option><option value="महिला">महिला</option>
              </select>
              <span style="margin-left:18px"><b>फेंसिंग सामग्री:</b></span>
              <select data-f="fenceMaterial" style="margin-left:8px;padding:3px">
                <option value="चेनलिंक जाली">चेनलिंक जाली</option>
                <option value="कंटीले तार">कंटीले तार (बार्बड वायर)</option>
              </select>
              <span style="margin-left:18px"><b>फेंसिंग राजसहायता दर:</b></span>
              <select data-f="fRate" id="appRate" style="margin-left:8px;padding:3px">
                <option value="50">50%</option><option value="80">80%</option>
              </select>
              <span style="margin-left:12px">सभी श्रेणियों के लिए समान चयनित दर लागू होगी। चुनी गयी सामग्री (चेनलिंक/कंटीले तार) के अनुसार भाषा पूरे आवेदन एवं अनुदान (देयक) प्रपत्र में स्वतः बदल जाती है।</span>
            </div>
            <h5>उद्यान कार्ड विवरण — फेंसिंग आवेदन के लिए अनिवार्य</h5>
            <table class="landtable infoTable"><tbody>
              <tr><td class="flabel">उद्यान कार्ड संख्या</td><td><input data-f="gardenCard" value="${esc(S.f.gardenCard||"")}"></td></tr>
              <tr><td class="flabel">उद्यान में उपलब्ध फल पौधों की संख्या</td><td><input data-f="plants" inputmode="numeric" value="${esc(S.f.plants||"")}"></td></tr>
            </tbody></table>
            <div id="fenceEligibility">${status}</div>
            <h5>1. ${applicantWord()} का विवरण</h5>
            <table class="landtable infoTable"><tbody>
              <tr><td class="flabel">${beneficiaryWord()} / ${applicantWord()} का नाम</td><td><input data-f="name" value="${esc(S.f.name||"")}"></td></tr>
              <tr><td class="flabel">पिता / पति का नाम</td><td><input data-f="father" value="${esc(S.f.father||"")}"></td></tr>
              <tr><td class="flabel">ग्राम</td><td><input data-f="village" value="${esc(S.f.village||"")}"></td></tr>
              <tr><td class="flabel">पोस्ट ऑफिस</td><td><input data-f="post" value="${esc(S.f.post||"")}"></td></tr>
              <tr><td class="flabel">विकास खण्ड</td><td><input data-f="block" value="${esc(S.f.block||"")}"></td></tr>
              <tr><td class="flabel">जनपद</td><td><input data-f="dist" value="${esc(S.f.dist||"")}"></td></tr>
              <tr><td class="flabel">मोबाइल नंबर</td><td><input data-f="mob" value="${esc(S.f.mob||"")}"></td></tr>
              <tr><td class="flabel">आधार संख्या</td><td><input data-f="aadhar" value="${esc(S.f.aadhar||"")}"></td></tr>
              <tr><td class="flabel">वर्ग</td><td><select data-f="cat"><option>सामान्य</option><option>OBC</option><option>SC</option><option>ST</option><option>महिला</option></select></td></tr>
              <tr><td class="flabel">कृषक श्रेणी</td><td><select data-f="farmerCat"><option>सीमांत</option><option>लघु</option><option>अन्य</option></select></td></tr>
              <tr><td class="flabel">सिंचाई की सुविधा</td><td><select data-f="irrigation"><option>उपलब्ध</option><option>उपलब्ध नहीं</option></select></td></tr>
            </tbody></table>
            ${saveBar("personal","आवेदक एवं योजना विवरण")}
            <h5>2. बैंक विवरण (DBT हेतु)</h5>
            <table class="landtable infoTable"><tbody>
              <tr><td class="flabel">बैंक का नाम</td><td><input data-f="bank" value="${esc(S.f.bank||"")}"></td></tr>
              <tr><td class="flabel">शाखा</td><td><input data-f="branch" value="${esc(S.f.branch||"")}"></td></tr>
              <tr><td class="flabel">खाता संख्या</td><td><input data-f="acct" value="${esc(S.f.acct||"")}"></td></tr>
              <tr><td class="flabel">IFSC कोड</td><td><input data-f="ifsc" value="${esc(S.f.ifsc||"")}"></td></tr>
            </tbody></table>
            ${saveBar("bank","बैंक विवरण")}
            <h5>3. भूमि एवं कार्य का विवरण</h5>
            <table class="landtable">
              <thead><tr>
                <th style="width:42px">क्र.</th>
                <th style="width:110px">भूमि किसकी / विवरण</th>
                <th>नाम (खतौनी के अनुसार)</th>
                <th>पिता का नाम</th>
                <th style="width:120px">ग्राम</th>
                <th style="width:120px">खसरा / खतौनी सं०</th>
                <th style="width:125px">आधार संख्या</th>
                <th style="width:110px">${applicantWord()} की प्रस्तावित भूमि — फेंसिंग हेतु</th>
                <th class="noprint" style="width:46px">क्रिया</th>
              </tr></thead>
              <tbody>${(S.landRows||[]).map((r,i)=>`
                <tr>
                  <td style="text-align:center">${i+1}</td>
                  <td><input data-land="${i}" data-k="relation" value="${esc(r.relation||"")}" placeholder="भूमि किसकी / विवरण"></td>
                  <td>${i===0
                    ? `<input class="landSelfName" value="${esc(S.f.name||"")}" placeholder="नाम खतौनी अनुसार" readonly tabindex="-1">`
                    : `<input data-land="${i}" data-k="name" value="${esc(r.name||"")}" placeholder="नाम खतौनी अनुसार">`}</td>
                  <td>${i===0
                    ? `<input class="landSelfFather" value="${esc(S.f.father||"")}" placeholder="पिता का नाम" readonly tabindex="-1">`
                    : `<input data-land="${i}" data-k="father" value="${esc(r.father||"")}" placeholder="पिता का नाम">`}</td>
                  <td><input class="landVil" value="${esc(S.f.village||"")}" placeholder="ग्राम" readonly tabindex="-1"></td>
                  <td><input data-land="${i}" data-k="khasra" value="${esc(r.khasra||"")}" placeholder="खसरा / खतौनी सं०"></td>
                  <td>${i===0
                    ? `<input class="landSelfAadhaar" value="${esc(S.f.aadhar||"")}" placeholder="आधार संख्या" readonly tabindex="-1">`
                    : `<input data-land="${i}" data-k="aadhaar" value="${esc(r.aadhaar||"")}" inputmode="numeric" maxlength="12" placeholder="आधार संख्या">`}</td>
                  <td><input data-land="${i}" data-k="hec" inputmode="decimal" value="${esc(r.hec||"")}" placeholder="हे०"></td>
                  <td class="noprint" style="text-align:center">${i===0 ? "" : `<button type="button" class="land-remove" data-land-del="${i}" title="यह पंक्ति हटाएँ">×</button>`}</td>
                </tr>`).join("")}
                <tr class="tot">
                  <td colspan="7" style="text-align:right">प्रस्तावित भूमि का क्षेत्रफल (कुल हे०) — वास्तविक आवेदन क्षेत्रफल</td>
                  <td class="calc">${fmtN(d.totalHec)}</td>
                  <td class="noprint"></td>
                </tr>
              </tbody>
            </table>
            <div class="noprint land-row-actions">
              <button type="button" class="addrow" id="addLandRow">+ पंक्ति जोड़ें</button>
            </div>
            <h5>निर्धारित क्षेत्रफल एवं फेंसिंग मानक मैपिंग</h5>
            <table class="landtable" id="fenceMappingApplicationTable">
              <thead><tr>
                <th>भूमि (नाली)</th><th>क्षेत्रफल (हे०)</th><th>अनुमन्य लम्बाई (मी०)</th><th>खम्बे</th>
              </tr></thead>
              <tbody>${getFenceMap().map(x=>`<tr data-map-hec="${x.hec.toFixed(2)}">
                <td style="text-align:center">${x.nali}</td>
                <td style="text-align:center">${x.hec.toFixed(2)}</td>
                <td style="text-align:center"><b>${x.len}</b></td>
                <td style="text-align:center">${x.poles}</td>
              </tr>`).join("")}</tbody>
            </table>
            <p class="appnote noprint" style="margin-top:6px">
              फेंसिंग के लिए ऊपर दर्ज सभी भूमि पंक्तियों का क्षेत्रफल जोड़कर कुल क्षेत्रफल निकलेगा। यही कुल क्षेत्रफल ऊपर दी गयी मैपिंग तालिका के किसी एक निर्धारित अंक से हूबहू मिलना आवश्यक है। कुल क्षेत्रफल किसी भी निर्धारित अंक से मेल नहीं होने पर किसान का फेंसिंग आवेदन लागू नहीं माना जाएगा।
            </p>
            <p class="appnote noprint" style="margin-top:6px">«नाम», «पिता का नाम» (पहली पंक्ति — स्वयं) एवं «ग्राम» कॉलम ऊपर <b>1. ${applicantWord()} का विवरण</b> में भरे गये विवरण से स्वतः भरते हैं — यहाँ अलग से टाइप करने की आवश्यकता नहीं। «खसरा / खतौनी सं०» एवं «आधार संख्या» प्रत्येक सह-खातेदार की पंक्ति में अलग-अलग भरें — पहली पंक्ति (स्वयं) का आधार संख्या आवेदन विवरण से स्वतः आएगा।</p>
            ${saveBar("farmers","भूमि / सह-खातेदार विवरण")}
            <h5>4. सारांश — क्षेत्रफल, फेंसिंग एवं राजसहायता</h5>
            <table>
              <thead><tr>
                <th>भूमि (नाली)</th><th>क्षेत्रफल (हे०)</th><th>अनुमन्य लम्बाई (मी०)</th><th>खम्बे</th>
                <th>लागत (₹)</th><th>राजसहायता 80%</th><th>राजसहायता 50%</th>
              </tr></thead>
              <tbody>
                <tr>
                  <td style="text-align:center" id="sumNali">${d.exact?fmtN(d.totalNali).replace(/\.00$/,""):"—"}</td>
                  <td style="text-align:center" id="sumHec">${d.allowedArea?d.totalHec.toFixed(2):"—"}</td>
                  <td style="text-align:center" id="sumLen">${d.exact?d.exact.len:"—"}</td>
                  <td style="text-align:center" id="sumPoles">${d.exact?d.exact.poles:"—"}</td>
                  <td style="text-align:right" id="sumCost">${fmt0(standard)}</td>
                  <td style="text-align:right" id="sumSub80">${fmt0(Math.round(standard*0.8))}</td>
                  <td style="text-align:right" id="sumSub50">${fmt0(Math.round(standard*0.5))}</td>
                </tr>
                <tr class="tot">
                  <td colspan="6" style="text-align:right">देय राजसहायता (चयनित दर <span id="sumRateLbl">${rate}</span>%)</td>
                  <td class="calc" id="sumSubsidy">${fmt0(subsidy)}</td>
                </tr>
              </tbody>
            </table>
            ${saveBar("expenses","क्षेत्रफल एवं मानक सारांश")}
            <h5>5. घोषणा</h5>
            <div class="appnote">
              • उपर्युक्त सभी विवरण मेरी जानकारी में पूर्णतः सत्य हैं।<br>
              • मुझे पूर्व में किसी अन्य सरकारी योजना से इस कार्य हेतु अनुदान प्राप्त नहीं हुआ है।<br>
              • कार्य / इकाई का निर्माण, रखरखाव एवं संचालन विभागीय दिशा-निर्देशों के अनुसार मेरी जिम्मेदारी होगी।<br>
              • संलग्न बिल / वाउचर एवं दस्तावेज सही हैं।
            </div>
            <h5>6. आवश्यक संलग्नक</h5>
            <div class="appgrid">
              <div>☐ उद्यान कार्ड</div><div>☐ खतौनी / भूमि स्वामित्व प्रमाण पत्र</div>
              <div>☐ आधार कार्ड एवं बैंक पासबुक की छायाप्रति</div><div>☐ अन्य आवश्यक दस्तावेज</div>
            </div>
            <h5>7. कृषक का प्रमाणपत्र</h5>
            <div class="appnote" style="line-height:1.9;text-align:justify">
              प्रमाणित किया जाता है कि मेरे द्वारा ${S.f.planType||"जिला योजना"} अन्तर्गत ${fenceHeading()} / घेरबाड़ कार्य हेतु उपर्युक्तानुसार आवेदन प्रस्तुत किया जा रहा है तथा आवेदन में अंकित समस्त विवरण सत्य एवं सही हैं।
              अतः नियमानुसार देय राजसहायता की धनराशि <b id="appCertSub">${fmt0(subsidy)}</b> (<span id="appCertWords">${subsidy>0?words(subsidy)+" रुपये मात्र":"…………"}</span>) स्वीकृत करने की कृपा कीजिएगा।
            </div>
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:22px;gap:20px">
              <div style="flex:0 0 auto">
                <div style="display:flex;gap:6px;align-items:baseline"><b>दिनांक :</b><input class="ln sm" type="date" data-f="date"></div>
                <div style="display:flex;gap:6px;align-items:baseline;margin-top:8px"><b>स्थान :</b><input class="ln sm" data-f="place"></div>
              </div>
              <div style="text-align:center;min-width:240px;border-top:1px solid var(--ink);padding-top:5px">
                हस्ताक्षर ${G("कृषक","कृषिका")}<br><span class="auto" id="appCertName">${esc(S.f.name||"")}</span></div>
            </div>
            ${saveBar("date","दिनांक एवं स्थान")}
            <h5>8. प्रभारी की आख्या</h5>
            <div class="appnote" style="line-height:1.9;text-align:justify">
              प्रमाणित किया जाता है कि ${G("कृषक","कृषिका")} द्वारा प्रस्तुत आवेदन, उद्यान कार्ड, भूमि अभिलेख (खतौनी) एवं अन्य संबंधित अभिलेखों का परीक्षण कर लिया गया है तथा प्रस्तावित भूमि का स्थलीय निरीक्षण किया गया है। आवेदन में अंकित विवरण एवं प्रस्तुत अभिलेख सही पाए गए हैं।
              प्रस्तावित भूमि का कुल क्षेत्रफल <b id="offArea">…………</b> हे० (<b id="offNali">…………</b> नाली) पाया गया, जिस पर विभागीय मानक के अनुसार अनुमन्य ${fenceHeading()} की लम्बाई <b id="offLen">…………</b> मी० तथा अनुमन्य खम्बे <b id="offPoles">…………</b> नग हैं। उद्यान में उपलब्ध फलदार पौधों की संख्या <b id="offPlants">…………</b> होने के कारण न्यूनतम 100 पौधे प्रति हे० की शर्त <b id="offEligible">…………</b>।
              मानक लागत <b id="offCost">…………</b> के सापेक्ष चयनित दर <b id="offRate">…………</b>% के अनुसार देय राजसहायता की अनुमानित धनराशि <b id="offSub">…………</b> होगी।
              अतः ${G("कृषक","कृषिका")} का आवेदन <b>उद्यान विशेषज्ञ, कोटद्वार महोदय की सेवा में ${S.f.planType||"जिला योजना"} अन्तर्गत ${fenceHeading()} / घेरबाड़ कार्य हेतु वर्क ऑर्डर जारी करने के लिए संस्तुति सहित अग्रसारित</b> है।
            </div>
            <div style="margin-top:18px;line-height:2">
              <b>प्रभारी, उद्यान सचल दल केन्द्र :</b> <span class="auto" id="appOfficerCenter">${esc(centerLine())}</span>
            </div>
          </div>
          ${buildFencingAffidavit(d)}`;
          document.querySelectorAll("#applicationOut [data-f]").forEach(el=>{
            if(el.dataset.f==="fRate") el.value=S.norm.fRate;
            else if(S.f[el.dataset.f]!==undefined) el.value=S.f[el.dataset.f];
          });
          const rr=document.getElementById("appRate"); if(rr) rr.value=S.norm.fRate;
          updateApplicationDerived();
        }

        function updateApplicationDerived(){
          if(cur!=="application" || !document.getElementById("applicationOut")) return;
          const d=applicationData();
          const rate=num(S.norm.fRate);
          const standard = d.totalHec>0 ? Math.round(d.totalHec*(num(S.norm.fCostHa)||200000)) : 0;
          const subsidy=standard>0 ? Math.round(standard*rate/100) : 0;
          const set=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=v;};
          // FIX: sync readonly fields from S.f to first row DOM elements
          document.querySelectorAll('#applicationOut .landVil').forEach(el=>{ el.value = S.f.village||""; });
          document.querySelectorAll('#applicationOut .landSelfName').forEach(el=>{ el.value = S.f.name||""; });
          document.querySelectorAll('#applicationOut .landSelfFather').forEach(el=>{ el.value = S.f.father||""; });
          const ownAad = document.querySelector('#applicationOut .landSelfAadhaar');
          if(ownAad) ownAad.value = S.f.aadhar || "";
          // FIX: also sync S.landRows[0] from S.f for saving
          syncSelfRowFields();

          const h3=document.querySelector('#applicationOut h3');
          if(h3) h3.textContent = (S.f.planType||"जिला योजना")+" अन्तर्गत "+fenceHeading()+" हेतु";
          const totalCell=document.querySelector('#applicationOut .landtable .tot .calc');
          if(totalCell) totalCell.textContent=fmtN(d.totalHec);
          set("sumNali", d.totalNali?fmtN(d.totalNali).replace(/\.00$/,""):"—");
          set("sumHec", d.totalHec>0?d.totalHec.toFixed(2):"—");
          set("sumLen", d.exact?d.exact.len:"—");
          set("sumPoles", d.exact?d.exact.poles:"—");
          set("sumCost", fmt0(standard));
          set("sumSub80", fmt0(Math.round(standard*0.8)));
          set("sumSub50", fmt0(Math.round(standard*0.5)));
          set("sumRateLbl", rate);
          set("sumSubsidy", fmt0(subsidy));
          set("appCertSub", fmt0(subsidy));
          set("appCertWords", subsidy>0?words(subsidy)+" रुपये मात्र":"…………");
          set("appCertName", S.f.name||"");
          const okPlants = d.area>0 && d.plants>0 && (d.plants/d.area)>=100;
          set("offArea", d.totalHec>0?d.totalHec.toFixed(2):"…………");
          set("offNali", d.totalNali?fmtN(d.totalNali).replace(/\.00$/,""):"…………");
          set("offLen", d.exact?d.exact.len:"…………");
          set("offPoles", d.exact?d.exact.poles:"…………");
          set("offPlants", d.plants>0?fmtN(d.plants).replace(/\.00$/,""):"…………");
          set("offEligible", okPlants?"पूर्ण होती है":"पूर्ण नहीं होती है");
          set("offCost", fmt0(standard));
          set("offRate", rate);
          set("offSub", fmt0(subsidy));
          const status = !S.f.gardenCard
            ? `<div class="appbad"><b>फेंसिंग पात्रता:</b> अयोग्य — उद्यान कार्ड संख्या अनिवार्य है।</div>`
            : d.plants<=0
            ? `<div class="appbad"><b>फेंसिंग पात्रता:</b> अयोग्य — उद्यान में उपलब्ध फल पौधों की संख्या भरना अनिवार्य है।</div>`
            : d.area<=0
            ? `<div class="appbad"><b>फेंसिंग पात्रता:</b> पहले भूमि का क्षेत्रफल भरें।</div>`
            : d.plants/d.area<100
            ? `<div class="appbad"><b>फेंसिंग पात्रता:</b> अयोग्य — न्यूनतम 100 पौधे प्रति हे० आवश्यक हैं। वर्तमान ${fmtN(d.plants/d.area)} पौधे/हे०।</div>`
            : `<div class="appok"><b>फेंसिंग पात्रता:</b> पात्र — न्यूनतम 100 पौधे प्रति हे० की शर्त पूरी है।</div>`;
          const old=document.getElementById("fenceEligibility");
          if(old) old.innerHTML=status;
          setFenceMappingPrintRow();
        }

        function buildApplication(){
          document.querySelector('[data-v="application"] .head').textContent = "फेंसिंग आवेदन पत्र";
          document.querySelector('[data-v="application"] .lead').textContent =
            fenceHeading()+" / घेरबाड़ के लिए आवेदन पत्र — केवल चयनित योजना की जानकारी।";
          buildFencingApplication();
        }

        const L = (lab,k,cls="") => `<div class="r"><b>${lab}</b><input class="ln ${cls}" data-f="${k}" value="${esc(S.f[k]||"")}"></div>`;
        const LR = (lab,k) => `<div class="r"><b>${lab}</b><span class="auto">${esc(S.f[k]||"…………")}</span></div>`;
        function buildBill(){
          const isF = true, c = calc();
          const schemeName = S.f.planType || "—";
          const title = `${fenceHeading()} / घेरबाड़ — राजसहायता देयक`;
          const mbUnit = "मी०";
          const napName = "लम्बाई";
          const kaam = fenceKaamPhrase();
          const planLabel = S.f.planType || "जिला योजना";

          let tbl = `<table><thead><tr><th style="width:44px">क्र०सं०</th><th>कार्य का विवरण</th>
            <th style="width:116px">देयक की कुल धनराशि</th><th style="width:138px">भुगतान की जाने वाली राजसहायता धनराशि</th>
            <th style="width:128px">कृषक द्वारा वहन की गयी धनराशि</th><th style="width:88px">अभ्युक्ति</th></tr></thead><tbody>`;
          c.rows.forEach((r,i)=>{
            tbl+=`<tr><td style="text-align:center">${i+1}</td><td>${esc(r.name)}</td>
              <td class="calc num" id="r${i}a"></td><td class="calc num" id="r${i}s"></td>
              <td class="calc num" id="r${i}o"></td><td></td></tr>`;
          });
          tbl+=`<tr class="tot"><td colspan="2" style="text-align:right">योग</td>
            <td class="calc num" id="tA"></td><td class="calc num" id="tS"></td><td class="calc num" id="tO"></td><td></td></tr></tbody></table>`;

          document.getElementById("billOut").innerHTML = `<div class="doc bill-doc">
            <div class="bill-header">
              <div class="bill-kicker">उद्यान विभाग · राजसहायता प्रपत्र</div>
              <h3 class="bill-title">${title}</h3>
              <div class="bill-rule"></div>
              <div class="bill-meta">
                <div><span>योजना</span><b>${schemeName}</b></div>
                <div><span>कार्यालय</span><b>उद्यान विशेषज्ञ, कोटद्वार (गढ़वाल)</b></div>
                <div><span>वित्तीय वर्ष</span><b>2026-27</b></div>
              </div>
            </div>
            <div class="serial-layout">
              <div class="serial-section">
                <div class="serial-title">1. कृषक का विवरण</div>
                <div class="kv">
                  ${LR("नाम कृषक:","name")}${LR("पिता / पति का नाम:","father")}
                  ${LR("ग्राम:","village")}${LR("पोस्ट ऑफिस:","post")}
                  ${LR("विकास खण्ड:","block")}${LR("जनपद:","dist")}
                  ${LR("आधार संख्या:","aadhar")}${LR("मोबाइल:","mob")}
                  <div class="r"><b>खसरा / खतौनी सं० (स्वयं):</b><span class="auto">${esc((S.landRows&&S.landRows[0]&&S.landRows[0].khasra)||"…………")}</span></div>
                  <div class="r"><b>वर्ग:</b><span class="auto">${esc(S.f.cat||"…………")}</span>
                    <b>· लागू राजसहायता दर:</b><span class="auto" id="oRate"></span></div>
                </div>
              </div>
              <div class="serial-section">
                <div class="serial-title">2. बैंक विवरण</div>
                <div class="kv">
                  ${LR("बैंक का नाम:","bank")}${LR("शाखा:","branch")}
                  ${LR("बैंक खाता संख्या:","acct")}${LR("IFSC कोड:","ifsc")}
                </div>
              </div>
              ${isF ? `
              <div class="serial-section">
                <div class="serial-title">3. फेंसिंग एवं भूमि का विवरण</div>
                <div class="kv">
                  <div class="r"><b>फेंसिंग सामग्री:</b><span class="auto">${esc(fenceMaterialName())}</span></div>
                  <div class="r"><b>${applicantWord()} की प्रस्तावित भूमि — फेंसिंग हेतु:</b><span class="auto" id="oArea">…………</span></div>
                  <div class="r"><b>अनुमन्य फेंसिंग लम्बाई:</b><span class="auto" id="oFenceLen">…………</span> मी०</div>
                  <div class="r"><b>अनुमन्य खम्बे:</b><span class="auto" id="oPoles">…………</span> नग</div>
                </div>
              </div>
              <div class="serial-section">
                <div class="serial-title">4. एम०बी० (मापपुस्तिका) के अनुसार मूल्यांकन — कनिष्ठ अभियन्ता द्वारा तैयार</div>
                <div class="kv">
                  <div class="r"><b>मापी गयी वास्तविक लम्बाई:</b><input class="ln rt sm" data-f="mbLen" inputmode="decimal" value="${esc(S.f.mbLen||"")}"><b> मी०</b></div>
                  <div class="r"><b>अथवा सीधे एम०बी० धनराशि:</b><input class="ln rt sm" data-f="mbAmt" inputmode="decimal" value="${esc(S.f.mbAmt||"")}"><b> ₹</b><span style="font-size:12px;color:#4A5A50" id="oMbSrc"></span></div>
                  <div class="r"><b>एम०बी० मूल्यांकन धनराशि:</b><span class="auto" id="oMb"></span></div>
                </div>
              </div>
              <div class="serial-section">
                <div class="serial-title">5. प्रभारी द्वारा स्थलीय सत्यापन</div>
                <div class="kv">
                  <div class="r"><b>क्षेत्रफलानुसार अनुमन्य लम्बाई:</b><span class="auto" id="oAllowed"></span> मी०</div>
                  <div class="r"><b>स्थलीय सत्यापित वास्तविक लम्बाई:</b><input class="ln rt sm" data-f="verifiedLen" inputmode="decimal" value="${esc(S.f.verifiedLen||"")}"><b> मी०</b></div>
                  <div class="r"><b>कार्य में कमी:</b><span class="auto" id="oShort"></span> मी०</div>
                  <div class="r"><b>वास्तविक क्षेत्रफल (कमी समायोजित):</b><span class="auto" id="oActualArea"></span> हे०</div>
                  <div class="r"><b id="oStdLabel">मानक लागत: वास्तविक क्षेत्रफल (— हे०) × ₹2,00,000 प्रति हे०:</b><span class="auto" id="oStdCost"></span></div>
                </div>
              </div>
            ` : ``}
            </div>
            <div class="bill-table-heading">
              <div class="bill-table-title">कृषक द्वारा प्रस्तुत कार्य एवं व्यय का विवरण</div>
              <div class="bill-table-subtitle">प्रस्तुत बिल / वाउचर के आधार पर — एम०बी० एवं स्थलीय सत्यापन से मिलान हेतु</div>
            </div>
            ${tbl}
            <div id="oFlag"></div>
            <div class="xbox">
              <div class="xh">राजसहायता की गणना — तीनों में से न्यूनतम</div>
              <table><tbody>
                <tr><td>बिल / वाउचर के अनुसार कुल व्यय</td><td class="v" id="xBill"></td></tr>
                <tr><td>एम०बी० मूल्यांकन धनराशि</td><td class="v" id="xMb"></td></tr>
                ${isF?`<tr><td id="xStdLabel">मानक लागत: वास्तविक क्षेत्रफल (— हे०) × ₹2,00,000 प्रति हे०</td><td class="v" id="xStdCost"></td></tr>`:``}
                <tr><td>राजसहायता हेतु स्वीकार्य आधार — उपरोक्त में से न्यूनतम</td><td class="v" id="xBase"></td></tr>
                <tr><td>लागू राजसहायता दर</td><td class="v" id="xRate"></td></tr>
                <tr class="hi"><td><b>देय राजसहायता धनराशि</b></td><td class="v" id="xSub"></td></tr>
                ${isF?`<tr><td>कृषक अंश (आधार × शेष दर — मानक अनुसार)</td><td class="v" id="xFarmerShare"></td></tr>
                <tr><td>मानक की अधिकतम अनुदान सीमा (मानक लागत × दर)</td><td class="v" id="xMaxSub"></td></tr>
                <tr><td>मानक से कम हुई लागत (कमी के कारण)</td><td class="v" id="xReduction"></td></tr>`:``}
                <tr><td>कृषक द्वारा वहन की गयी वास्तविक धनराशि (बिल − राजसहायता)</td><td class="v" id="xOwn"></td></tr>
              </tbody></table>
            </div>
            <div class="note-box" id="fencingCalculationNote">
              <div class="note-title">महत्वपूर्ण नोट — फेंसिंग कार्य की गणना</div>
              <div>• मानक लागत: वास्तविक क्षेत्रफल (<span id="noteActualArea">—</span> हे०) × ₹2,00,000 प्रति हे० = <span id="noteStdCost">—</span></div>
              <div style="margin-top:5px">• सत्यापित लम्बाई कम होने पर क्षेत्रफल एवं मानक लागत उसी अनुपात में निर्धारित की गई है।</div>
              <div style="margin-top:5px">• देय आधार: उपलब्ध आधारों में न्यूनतम राशि — <span id="noteBase">—</span></div>
              <div style="margin-top:5px">• कृषक अंश: आधार राशि पर लागू शेष दर के अनुसार।</div>
              <div style="margin-top:5px">• कृषक द्वारा वहन की गयी वास्तविक धनराशि: बिल राशि में से देय राजसहायता घटाकर।</div>
            </div>
            <p style="margin:10px 0 0"><b>संलग्न:</b> बिल वाउचर, एम०बी०, जियो टैग कलर फोटोग्राफ आदि।</p>
            <div class="decl">प्रमाणित किया जाता है कि मेरे द्वारा ${planLabel} अन्तर्गत ${kaam} पर उक्तानुसार धनराशि व्यय की गई है।
            अतः राजसहायता की धनराशि <span class="blank" id="oSub1"></span> (<span id="oWords1"></span> रुपये मात्र) का भुगतान मुझे करने की कृपा कीजिएगा।</div>
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:22px;gap:20px">
              <div style="flex:0 0 auto">
                <div style="display:flex;gap:6px;align-items:baseline"><b>दिनांक:</b><input class="ln sm" type="date" data-f="date"></div>
                <div style="display:flex;gap:6px;align-items:baseline;margin-top:8px"><b>स्थान:</b><input class="ln sm" data-f="place"></div>
              </div>
              <div style="text-align:center;min-width:240px;border-top:1px solid var(--ink);padding-top:5px">
                हस्ताक्षर ${G("कृषक","कृषिका")}<br><span class="auto" id="oName"></span></div>
            </div>
            <div class="decl" style="margin-top:26px">प्रमाणित किया जाता है कि मेरे द्वारा ${planLabel} अन्तर्गत ${kaam} कार्य का स्थलीय निरीक्षण कर लिया गया है। प्रभारी द्वारा सत्यापित वास्तविक ${napName}: <span class="blank" id="oLen"></span> ${mbUnit}। एम०बी० (मापपुस्तिका) के अनुसार मूल्यांकन — कनिष्ठ अभियन्ता द्वारा तैयार; मापी गयी वास्तविक लम्बाई: <span class="blank" id="oMbLen"></span> ${mbUnit}; मूल्यांकन धनराशि: <span class="blank" id="oMb2"></span>। बिल में दर्शायी गयी कुल राशि: <span class="blank" id="oBill2"></span>। बिल, एम०बी० एवं स्थलीय सत्यापन का मिलान करने के उपरान्त लागू आधार पर देय राजसहायता धनराशि <span class="blank" id="oSub2"></span> कृषक को भुगतान हेतु देयक सत्यापित कर संस्तुति सहित अग्रसारित।</div>
            <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:20px;gap:20px">
              <div style="font-size:13px;color:#4A5A50;display:flex;gap:6px;align-items:baseline;flex-wrap:wrap">
                प्रभारी का नाम एवं पदनाम —
                <input class="ln sm" data-f="officer" placeholder="नाम"><input class="ln sm" data-f="desig" placeholder="पदनाम"></div>
              <div style="text-align:center;min-width:240px;border-top:1px solid var(--ink);padding-top:5px">
                हस्ताक्षर प्रभारी<br><span class="auto" id="oOff"></span></div>
            </div>
          </div>`;
          document.querySelectorAll("#billOut [data-f]").forEach(el=>{ if(S.f[el.dataset.f]!==undefined) el.value = S.f[el.dataset.f]; });
          refresh();
        }

        const set = (id,v) => { const el=document.getElementById(id); if(el) el.innerHTML=v; };
        function refresh(){
          const c = calc();
          c.rows.forEach((r,i)=>{ set("r"+i+"a",fmtN(r.amt)); set("r"+i+"s",fmtN(r.sub)); set("r"+i+"o",fmtN(r.own)); });
          set("tA",fmtN(c.bill)); set("tS",fmtN(c.sub)); set("tO",fmtN(c.own));
          set("oRate",(c.rate*100).toFixed(0)+"%");
          if(S.scheme==="fencing"){
            // FIX: use totalHec (actual entered area) for display, not c.hec (which is 0 when not allowed)
            const dispHec = (c.totalHec||0) > 0 ? c.totalHec : c.hec;
            const m = fenceStandard(dispHec);
            set("oArea", dispHec>0 ? dispHec.toFixed(2) : "…………");
            set("oFenceLen", m ? fmtN(m.len).replace(/\.00$/,"") : "…………");
            set("oPoles", m ? fmtN(m.poles).replace(/\.00$/,"") : "…………");
          }
          set("oMb", c.mb ? fmt0(c.mb) : "—");
          set("oMbSrc", num(S.f.mbAmt)>0 ? "" : "");
          set("xBill", c.bill?fmt0(c.bill):"— (नहीं भरा गया)");
          set("xMb", c.mb?fmt0(c.mb):"— (नहीं भरा गया)");
          if(c.isF){
            set("oAllowed", c.allowedLen ? fmtN(c.allowedLen).replace(/\.00$/,"") : "…………");
            set("oShort", c.shortfall>0 ? fmtN(c.shortfall).replace(/\.00$/,"") : "0");
            set("oActualArea", c.actualArea ? c.actualArea.toFixed(4) : "0.0000");
            set("oStdCost", c.standardCost ? fmt0(c.standardCost) : "—");
            set("xStdCost", c.standardCost ? fmt0(c.standardCost) : "— (भूमि हे० भरें)");
            const costHa = num(S.norm.fCostHa)||200000;
            const fullCost = c.hec>0 ? Math.round(c.hec*costHa) : 0;
            set("xFarmerShare", fmt0(Math.round(c.base*(1-c.rate))));
            set("xMaxSub", fmt0(c.sub));
            set("xReduction", fmt0(Math.max(0, fullCost-c.standardCost)));
          }
          const noteBase = document.getElementById("noteBase");
          const noteArea = document.getElementById("noteActualArea");
          const noteStd = document.getElementById("noteStdCost");
          if(noteBase) noteBase.textContent = c.base ? fmt0(c.base) : "—";
          if(noteArea) noteArea.textContent = c.actualArea>0 ? Number(c.actualArea).toFixed(2) : "—";
          if(noteStd) noteStd.textContent = c.standardCost ? fmt0(c.standardCost) : "—";
          set("xBase",fmt0(c.base)); set("xRate",(c.rate*100).toFixed(0)+"%");
          set("xSub",fmt0(c.sub)); set("xOwn",fmt0(c.own));
          set("oSub1",fmt0(c.sub)); set("oSub2",fmt0(c.sub)); set("oWords1",words(c.sub));
          set("oActualArea", c.actualArea>0 ? Number(c.actualArea).toFixed(2) : "…………");
          const actualAreaTxt = c.actualArea>0 ? Number(c.actualArea).toFixed(2) : "—";
          const oStdLabel = document.getElementById("oStdLabel");
          const xStdLabel = document.getElementById("xStdLabel");
          if(oStdLabel) oStdLabel.textContent = `मानक लागत: वास्तविक क्षेत्रफल (${actualAreaTxt} हे०) × ₹2,00,000 प्रति हे०:`;
          if(xStdLabel) xStdLabel.textContent = `मानक लागत: वास्तविक क्षेत्रफल (${actualAreaTxt} हे०) × ₹2,00,000 प्रति हे०`;
          const autoMbLen = c.mbLen;
          set("oMb2", c.mb?fmt0(c.mb):"…………");
          set("oMbLen", autoMbLen?fmtN(autoMbLen).replace(/\.00$/,""):"…………");
          set("oBill2", c.bill?fmt0(c.bill):"…………");
          set("oLen", c.isF ? (c.verifiedLen?fmtN(c.verifiedLen).replace(/\.00$/,""):"…………") : (esc(S.f.mbLen)||"…………"));
          set("oName", esc(S.f.name)||"…………");
          set("oOff", (esc(S.f.officer)||"…………") + (S.f.desig?"<br>"+esc(S.f.desig):""));
          let flag="";
          if(c.isF){
            if(!c.bases.length){
              flag = `<div class="flag bad">व्यय विवरण, एम०बी०, अथवा भूमि का क्षेत्रफल — इनमें से कम से कम एक भरें।</div>`;
            }else{
              const min = c.bases.reduce((a,b)=>b.val<a.val?b:a);
              flag = `<div class="flag ok">देय आधार — ${min.label}: ${fmt0(min.val)} (उपलब्ध आधारों में न्यूनतम)</div>`;
            }
            if(c.shortfall>0){
              flag += `<div class="flag bad">सत्यापित लम्बाई अनुमन्य ${fmtN(c.allowedLen).replace(/\.00$/,"")} मी० से ${fmtN(c.shortfall).replace(/\.00$/,"")} मी० कम है — उसी अनुपात में क्षेत्रफल घटाकर मानक लागत निकाली गयी है।</div>`;
            }
            if(c.mb>0 && c.bill>0 && c.bill>c.mb){
              flag += `<div class="flag bad">बिल का योग एम०बी० मूल्यांकन से ${fmt0(c.bill-c.mb)} अधिक है — अन्तर कृषक द्वारा स्वयं वहन किया जाएगा।</div>`;
            }
          }
          if(c.capped) flag += `<div class="flag bad">गणना अधिकतम सीमा ${fmt0(c.cap)} से अधिक थी — राजसहायता सीमा तक ही देय।</div>`;
          set("oFlag",flag);
          const sBill=document.getElementById("sBill"); if(sBill) sBill.textContent = fmt0(c.bill);
          const sMb=document.getElementById("sMb"); if(sMb) sMb.textContent = c.mb?fmt0(c.mb):"—";
          const sSub=document.getElementById("sSub"); if(sSub) sSub.textContent = fmt0(c.sub);
          const sOwn=document.getElementById("sOwn"); if(sOwn) sOwn.textContent = fmt0(c.own);
          const sRate=document.getElementById("sRate"); if(sRate) sRate.textContent = c.bill?`(${(c.rate*100).toFixed(0)}%)`:"";
          const m=document.getElementById("sMsg");
          if(m){
            m.className = "msg" + (c.over?" bad":"");
            m.textContent = !c.bill ? "व्यय विवरण भरना प्रारम्भ करें"
              : c.over ? `बिल एम०बी० से ${fmt0(c.bill-c.mb)} अधिक — राजसहायता एम०बी० पर ही देय`
              : `राजसहायता शब्दों में: ${words(c.sub)} रुपये मात्र`;
          }
        }
        function refreshWorkTotals(){
          document.querySelectorAll("#workBody table").forEach(tb=>{
            const t = tb.querySelector("[data-tot]"); if(!t) return;
            const k = t.dataset.tot, cfg = COLS[k];
            tb.querySelectorAll("tbody tr").forEach((tr,i)=>{
              if(i<S[k].length){ const cell=tr.querySelector("td.calc"); if(cell) cell.textContent=fmtN(cfg.amt(S[k][i])); }
            });
            t.textContent = fmtN(sum(k));
          });
          refresh();
        }

        /* SERVER API */
        const apiFetch = async (url, options = {}) => {
          const method = (options.method || "GET").toUpperCase();
          return fetch(url, { ...options, method, credentials: "omit" });
        };
        const readJsonResponse = async (response) => {
          const ct = response.headers.get("content-type") || "";
          const text = await response.text();
          if (!text) return {};
          if (!ct.toLowerCase().includes("application/json")) {
            throw new Error("सर्वर से अपेक्षित JSON नहीं मिला (" + response.status + ")।");
          }
          try { return JSON.parse(text); }
          catch (e) { throw new Error("सर्वर का उत्तर पढ़ा नहीं जा सका।"); }
        };
        let FORM_ID = "";
        let AUTH_CENTER = "";
        let REG_ROWS = [];
        let apiMsgTimer = null;
        function apiMsg(text, kind){
          const el=document.getElementById("apiMsg");
          if(!el) return;
          if(!text){ el.hidden=true; el.textContent=""; return; }
          el.hidden=false;
          el.className = "api-msg noprint " + (kind||"info");
          el.textContent = text;
          if(apiMsgTimer) window.clearTimeout(apiMsgTimer);
          apiMsgTimer = window.setTimeout(()=>{ el.hidden=true; }, 6000);
        }
        function setFormId(id){
          FORM_ID = id || "";
          S.formId = FORM_ID;
          const el=document.getElementById("curFormId");
          if(el){
            el.textContent = FORM_ID ? ("फॉर्म: " + FORM_ID) : "— कोई फॉर्म चयनित नहीं —";
            el.classList.toggle("active", !!FORM_ID);
          }
        }
        function pickFormId(data){
          if(!data) return "";
          if(typeof data === "string") return data;
          if(data.form_id) return data.form_id;
          if(data.personal_details && data.personal_details.form_id) return data.personal_details.form_id;
          if(Array.isArray(data) && data[0]) return data[0].form_id || (data[0].personal_details && data[0].personal_details.form_id) || "";
          if(data.id && data.form_id === undefined && data.full_name) return data.id;
          return "";
        }
        function apiCenterName(){
          const raw = (AUTH_CENTER||"").trim();
          if(!raw) return "";
          const parts = raw.split(/[,–—]/).map(s=>s.trim()).filter(Boolean);
          return parts.length>1 ? parts[parts.length-1] : raw;
        }
        function centerFilter(){
          return apiCenterName() || AUTH_CENTER;
        }
        const EXTRA = { material:["sup","bill"], footing:["sup"], labour:[], other:["name","vil","aad"] };
        function expenseTuples(section){
          const ex = EXTRA[section] || [];
          return (S[section]||[])
            .filter(r => String(r.item || r.work || "").trim() || num(r.amt)!==0)
            .map(r=>{
              const base = [r.item || r.work || "", num(r.qty), r.unit || "", num(r.rate), num(r.amt)];
              return base.concat(ex.map(k=>r[k] || ""));
            });
        }
        const isBarbed = () => /कंटीले|barbed/i.test(String(S.f.fenceMaterial||""));
        const rateValue = () => { const r=num(S.norm.fRate); return r>=60 ? 80 : 50; };
        const catToApi = v => ({ "सामान्य":"General", "OBC":"OBC", "SC":"SC", "ST":"ST", "महिला":"Female" }[v] || v || "");
        const farmerCatToApi = v => ({ "सीमांत":"Marginal", "लघु":"Small Farmer", "अन्य":"Other" }[v] || v || "");
        function payloadPersonal(){
          return {
            form_id: FORM_ID,
            scheme_name: S.f.planType || "जिला योजना",
            gender: isFemale() ? "Female" : "Male",
            fencing_material: isBarbed() ? "Barbed Wire" : "Chain Link",
            subsidy_rate: String(rateValue()),
            garden_card: S.f.gardenCard || "",
            plants_no: num(S.f.plants),
            full_name: S.f.name || "",
            father_name: S.f.father || "",
            village: S.f.village || "",
            post: S.f.post || "",
            block: S.f.block || "",
            dist: S.f.dist || "",
            mob: S.f.mob || "",
            aadhar: S.f.aadhar || "",
            category: catToApi(S.f.cat),
            farmer_category: farmerCatToApi(S.f.farmerCat)
          };
        }
        function payloadBank(){
          return { form_id: FORM_ID, bank_name: S.f.bank || "", branch: S.f.branch || "",
                   account: S.f.acct || "", ifsc: S.f.ifsc || "" };
        }
        function payloadFarmers(){
          return {
            form_id: FORM_ID,
            farmer_details: (S.landRows||[]).filter(r=>String(r.name||"").trim() || num(r.hec)>0).map(r=>{
              const hec=num(r.hec);
              return [r.name||"", r.father||"", r.village||S.f.village||"", r.khasra||"", r.aadhaar||"",
                      Math.round(hec*50*100)/100, hec];
            })
          };
        }
        function payloadExpenses(){
          const c=calc();
          const std=fenceStandard(c.hec);
          const costHa=num(S.norm.fCostHa)||200000;
          const totalCost=c.hec>0 ? Math.round(c.hec*costHa) : 0;
          return {
            form_id: FORM_ID,
            land_nali: Math.round(c.hec*50*100)/100,
            area_hectare: c.hec,
            permissible_length_meter: std ? std.len : 0,
            number_of_poles: std ? std.poles : 0,
            total_cost: totalCost,
            subsidy_80_percent: Math.round(totalCost*0.8),
            subsidy_50_percent: Math.round(totalCost*0.5),
            selected_subsidy_rate: rateValue(),
            payable_subsidy: c.sub,
            subsidy_rate: rateValue(),
            unit_cost_per_hectare: costHa,
            additional_max_limit: num(S.norm.fCap)
          };
        }
        function payloadSection(section){
          const rows = expenseTuples(section);
          const total = rows.reduce((a,r)=>a+num(r[4]),0);
          return { form_id: FORM_ID, [section+"_expenses"]: rows, [section+"_total"]: total };
        }
        function payloadDate(){
          return { form_id: FORM_ID, date: S.f.date || null, place: S.f.place || "" };
        }
        function apiErrorText(data, res){
          if(!data) return ("सहेजना विफल (" + res.status + ")");
          if(typeof data === "string") return data;
          const simple = data.detail || data.error || data.message;
          if(typeof simple === "string" && simple) return simple;
          try{
            const txt = JSON.stringify(data);
            return txt.length > 300 ? (txt.slice(0,300) + "…") : txt;
          }catch(e){ return ("सहेजना विफल (" + res.status + ")"); }
        }
        async function apiPut(payload, label, key, quiet){
          if(!FORM_ID){
            const m="पहले 'उपयोगकर्ता पंजीकरण' टैब से कृषक पंजीकृत करें — फॉर्म आईडी आवश्यक है।";
            if(!quiet) apiMsg(m, "bad");
            setSaveState(key, "✗ फॉर्म आईडी नहीं है", "bad");
            return false;
          }
          const btn=document.querySelector('[data-save="'+(key||"")+'"]');
          if(btn && !quiet) btn.disabled=true;
          try{
            const res = await apiFetch(API_FENCING, {
              method:"PUT",
              headers:{ "Content-Type":"application/json" },
              body: JSON.stringify(payload)
            });
            const data = await readJsonResponse(res);
            if(!res.ok) throw new Error(apiErrorText(data, res));
            if(!quiet) apiMsg("✓ " + (label||"विवरण") + " सफलतापूर्वक सहेजा गया — " + FORM_ID, "ok");
            setSaveState(key, "✓ सहेजा गया", "ok");
            loadRegistrations();
            return true;
          }catch(err){
            const msg=(err && err.message) ? err.message : "अज्ञात त्रुटि";
            if(!quiet) apiMsg("सहेजना विफल: " + msg, "bad");
            setSaveState(key, "✗ " + msg, "bad");
            return false;
          }finally{
            if(btn) btn.disabled=false;
          }
        }
        async function apiDelete(formIds){
          const ids=(Array.isArray(formIds) ? formIds : [formIds]).map(x=>String(x||"").trim()).filter(Boolean);
          if(!ids.length){ apiMsg("फॉर्म आईडी नहीं मिली — हटाया नहीं जा सका।","bad"); return false; }
          try{
            const res = await apiFetch(API_FENCING, {
              method:"DELETE",
              headers:{ "Content-Type":"application/json" },
              body: JSON.stringify({ form_ids: ids })
            });
            const data = await readJsonResponse(res);
            if(!res.ok) throw new Error((data && (data.detail || data.error || data.message)) || ("हटाना विफल (" + res.status + ")"));
            const left = Array.isArray(data && data.form_ids) ? data.form_ids.map(String) : null;
            if(FORM_ID && ids.includes(FORM_ID)){
              FORM_ID = ""; S.formId = "";
              S = blank();
              const el=document.getElementById("curFormId");
              if(el) el.textContent = "— कोई फॉर्म चयनित नहीं —";
            }
            REG_ROWS = left
              ? REG_ROWS.filter(r => left.includes(String((r.form_id || (r.personal_details||{}).form_id) || "")))
              : REG_ROWS.filter(r => !ids.includes(String((r.form_id || (r.personal_details||{}).form_id) || "")));
            renderRegistrations();
            apiMsg(ids.length + " फॉर्म हटा दिया गया: " + ids.join(", ")
                  + (left ? (" · शेष: " + (left.length ? left.join(", ") : "कोई नहीं")) : ""), "ok");
            loadRegistrations();
            return true;
          }catch(err){
            apiMsg("हटाना विफल: " + (err && err.message ? err.message : "अज्ञात त्रुटि"), "bad");
            return false;
          }
        }
        function requestDeleteForm(fid, btn){
          if(!fid) return;
          const rec=findRecord(fid);
          const p=rec ? (rec.personal_details||rec) : null;
          const name=(p && p.full_name) ? p.full_name : "";
          const msg="फॉर्म " + fid + (name ? (" (" + name + ")") : "") + " सर्वर से स्थायी रूप से हटा देना है?\nयह कार्रवाई वापस नहीं होगी।";
          if(!window.confirm(msg)) return;
          if(btn){ btn.disabled = true; btn.textContent = "हट रहा है…"; }
          apiDelete([fid]);
        }
        const SAVE_STEPS = [
          { key:"personal", label:"आवेदक एवं योजना विवरण",   build:payloadPersonal },
          { key:"bank",     label:"बैंक विवरण",               build:payloadBank },
          { key:"farmers",  label:"भूमि / सह-खातेदार विवरण", build:payloadFarmers },
          { key:"expenses", label:"क्षेत्रफल एवं मानक",       build:payloadExpenses },
          { key:"material", label:"सामग्री व्यय",             build:()=>payloadSection("material") },
          { key:"footing",  label:"फुटिंग व्यय",              build:()=>payloadSection("footing") },
          { key:"labour",   label:"श्रमिक व्यय",               build:()=>payloadSection("labour") },
          { key:"other",    label:"अन्य व्यय",                build:()=>payloadSection("other") },
          { key:"date",     label:"दिनांक एवं स्थान",         build:payloadDate }
        ];
        function saveStep(key){
          const step = SAVE_STEPS.find(s=>s.key===key);
          if(!step) return;
          setSaveState(key, "सहेजा जा रहा है…", "wait");
          apiPut(step.build(), step.label, key);
        }
        const SAVE_STATES = {};
        function setSaveState(key, text, kind){
          if(!key) return;
          if(text) SAVE_STATES[key] = { text, kind: kind||"" };
          else delete SAVE_STATES[key];
          const st = SAVE_STATES[key];
          document.querySelectorAll('[data-savestate="'+key+'"]').forEach(el=>{
            el.className = "save-state" + (st ? (" " + st.kind) : "");
            el.textContent = st ? st.text : "";
          });
        }
        function clearSaveStates(){ Object.keys(SAVE_STATES).forEach(k=>{ delete SAVE_STATES[k]; }); }
        const SAVE_LABELS = { material:"सामग्री व्यय", footing:"फुटिंग व्यय", labour:"श्रमिक व्यय", other:"अन्य व्यय" };
        function saveBar(key, label){
          const st = SAVE_STATES[key];
          return `<div class="save-bar noprint">
            <button type="button" class="addrow solid" data-save="${key}">सहेजें — ${label}</button>
            <span class="save-state${st ? (" " + st.kind) : ""}" data-savestate="${key}">${st ? st.text : ""}</span>
            <span class="save-hint">PUT · फॉर्म आईडी <b>${esc(FORM_ID||"चयनित नहीं")}</b></span>
          </div>`;
        }
        async function saveAllSteps(){
          if(!FORM_ID){
            apiMsg("पहले 'उपयोगकर्ता पंजीकरण' टैब से कृषक पंजीकृत करें — फॉर्म आईडी आवश्यक है।", "bad");
            return;
          }
          const hint=document.getElementById("saveAllHint");
          let ok=0;
          for(const step of SAVE_STEPS){
            if(hint) hint.textContent = "सहेजा जा रहा है: " + step.label + "…";
            setSaveState(step.key, "सहेजा जा रहा है…", "wait");
            const done = await apiPut(step.build(), step.label, step.key, true);
            if(done) ok++;
            if(!done) break;
          }
          if(hint) hint.textContent = ok + " / " + SAVE_STEPS.length + " चरण सहेजे गए।";
          if(ok===SAVE_STEPS.length) apiMsg("✓ सम्पूर्ण प्रपत्र सफलतापूर्वक सहेजा गया — " + FORM_ID + " (" + ok + "/" + SAVE_STEPS.length + " चरण)", "ok");
          else apiMsg("✗ " + ok + " / " + SAVE_STEPS.length + " चरण ही सहेजे जा सके।", "bad");
        }

        /* GET: पंजीकृत फॉर्म सूची */
        const GENDER_BACK = { male:"पुरुष", पुरुष:"पुरुष", female:"महिला", महिला:"महिला" };
        const CAT_BACK = { general:"सामान्य", सामान्य:"सामान्य", obc:"OBC", sc:"SC", st:"ST", female:"महिला" };
        const FARMER_BACK = { "small farmer":"लघु", "small":"लघु", लघु:"लघु", marginal:"सीमांत", "border farmer":"सीमांत",
                              सीमांत:"सीमांत", "other":"अन्य", अन्य:"अन्य" };
        const MAT_BACK = { "chain link":"चेनलिंक जाली", "chainlink":"चेनलिंक जाली", "चेनलिंक जाली":"चेनलिंक जाली",
                           "barbed wire":"कंटीले तार (बार्बड वायर)", "barbedwire":"कंटीले तार (बार्बड वायर)",
                           "कंटीले तार":"कंटीले तार (बार्बड वायर)", "कंटीले तार (बार्बड वायर)":"कंटीले तार (बार्बड वायर)" };
        function matchValue(map, v, fallback){
          if(v===null || v===undefined || v==="") return fallback;
          const k=String(v).trim().toLowerCase();
          if(map[k]) return map[k];
          const hit=Object.keys(map).find(x=>x.length>2 && k.indexOf(x)===0);
          return hit ? map[hit] : v;
        }
        function rowFilled(rec){
          const p=rec.personal_details||{}, e=rec.expense_details||{};
          const has = (p.garden_card && String(p.garden_card).trim()) ||
                       (p.father_name && String(p.father_name).trim()) ||
                       (p.bank_name && String(p.bank_name).trim()) ||
                       (e.area_hectare && num(e.area_hectare)>0) ||
                       (e.material_expenses && e.material_expenses.length) ||
                       (e.footing_expenses && e.footing_expenses.length) ||
                       (e.labour_expenses && e.labour_expenses.length) ||
                       (e.other_expenses && e.other_expenses.length);
          return has ? "भरा गया" : "पंजीकृत (रिक्त)";
        }
        function renderRegistrations(){
          const tb=document.getElementById("regRows");
          const cnt=document.getElementById("regCount");
          if(!tb) return;
          if(cnt) cnt.textContent = REG_ROWS.length ? (REG_ROWS.length + " फॉर्म") : "";
          if(!REG_ROWS.length){
            tb.innerHTML = '<tr><td colspan="12" class="empty">कोई फॉर्म नहीं मिला। ऊपर नया पंजीकरण करें।</td></tr>';
            return;
          }
          tb.innerHTML = REG_ROWS.map((rec,i)=>{
            const p=rec.personal_details||rec, e=rec.expense_details||{};
            const fid=rec.form_id || p.form_id || "";
            const hec=num(e.area_hectare);
            const plants=num(p.plants_no);
            const payable=num(e.payable_subsidy);
            const filled=rowFilled(rec);
            const active = fid && fid===FORM_ID;
            return `<tr class="${active?"sel":""}">
              <td class="n">${i+1}</td>
              <td><b>${esc(fid||"—")}</b></td>
              <td>${esc(p.full_name||"—")}</td>
              <td>${esc(p.mob||"—")}</td>
              <td>${esc(p.center_name||"—")}</td>
              <td>${esc(p.scheme_name||"—")}</td>
              <td>${esc(p.garden_card||"—")}</td>
              <td style="text-align:right">${plants>0?fmtN(plants).replace(/\.00$/,""):"—"}</td>
              <td style="text-align:right">${hec>0?fmtN(hec).replace(/\.00$/,""):"—"}</td>
              <td style="text-align:right">${payable>0?fmt0(payable):"—"}</td>
              <td><span class="pill ${filled==="भरा गया"?"ok":"wait"}">${filled}</span></td>
              <td class="act">
                <button type="button" class="mini ${active?"on":""}" data-open="${esc(fid)}" title="इस फॉर्म के विवरण प्रपत्र में खोलें">प्रपत्र भरें</button>
                <button type="button" class="mini danger" data-delform="${esc(fid)}" title="यह फॉर्म सर्वर से हटाएँ">हटाएँ</button>
              </td>
            </tr>`;
          }).join("");
        }
        async function loadRegistrations(){
          const tb=document.getElementById("regRows");
          if(tb) tb.innerHTML = '<tr><td colspan="10" class="empty">लोड हो रहा है…</td></tr>';
          const c = centerFilter();
          const full = (AUTH_CENTER||"").trim();
          const candidates = [];
          if(c) candidates.push(c);
          if(full && full!==c) candidates.push(full);
          if(!candidates.length) candidates.push("");
          let rows = [], lastErr = null;
          for(let i=0;i<candidates.length;i++){
            const q = candidates[i];
            const url = API_FENCING + (q ? ("?center_name=" + encodeURIComponent(q)) : "");
            try{
              const res = await apiFetch(url);
              const data = await readJsonResponse(res);
              if(!res.ok) throw new Error((data && (data.detail || data.error)) || ("सूची प्राप्त नहीं (" + res.status + ")"));
              const list = Array.isArray(data) ? data : (data && data.results ? data.results : []);
              rows = list;
              if(list.length) break;
            }catch(err){
              lastErr = err;
            }
          }
          if(!rows.length && lastErr){
            REG_ROWS = [];
            renderRegistrations();
            apiMsg("सूची लोड नहीं हो सकी: " + (lastErr && lastErr.message ? lastErr.message : "अज्ञात त्रुटि"), "bad");
            return;
          }
          REG_ROWS = rows.map(r => (r && r.personal_details) ? r : { form_id: r.form_id, personal_details: r, expense_details: r.expense_details || {} });
          renderRegistrations();
        }
        function findRecord(formId){
          return REG_ROWS.find(r => (r.form_id || (r.personal_details||{}).form_id) === formId) || null;
        }
        function applyRecord(rec){
          if(!rec) return;
          const p = rec.personal_details || rec;
          const e = rec.expense_details || {};
          S.f.planType     = matchValue({}, p.scheme_name, S.f.planType);
          S.f.gender       = matchValue(GENDER_BACK, p.gender, S.f.gender);
          S.f.fenceMaterial= matchValue(MAT_BACK, p.fencing_material, S.f.fenceMaterial);
          S.f.gardenCard   = p.garden_card || "";
          S.f.plants       = p.plants_no !== undefined && p.plants_no !== null ? p.plants_no : "";
          S.f.name         = p.full_name || "";
          S.f.father       = p.father_name || "";
          S.f.village      = p.village || "";
          S.f.post         = p.post || "";
          S.f.block        = p.block || "";
          S.f.dist         = p.dist || "";
          S.f.mob          = p.mob || "";
          S.f.aadhar       = p.aadhar || "";
          if(p.category!==undefined && p.category!==null && String(p.category)!=="") S.f.cat = matchValue(CAT_BACK, p.category, "सामान्य");
          if(p.farmer_category!==undefined && p.farmer_category!==null && String(p.farmer_category)!=="") S.f.farmerCat = matchValue(FARMER_BACK, p.farmer_category, "सीमांत");
          S.f.bank   = p.bank_name || "";
          S.f.branch = p.branch || "";
          S.f.acct   = p.account || "";
          S.f.ifsc   = p.ifsc || "";
          S.f.date   = p.date || S.f.date;
          S.f.place  = p.place || S.f.place;

          if(p.subsidy_rate!==undefined && p.subsidy_rate!==null && String(p.subsidy_rate)!=="") S.norm.fRate = String(num(p.subsidy_rate));
          if(e.subsidy_rate!==undefined && num(e.subsidy_rate)>0) S.norm.fRate = String(num(e.subsidy_rate));
          S.norm.fRate = num(S.norm.fRate)>=60 ? "80" : "50";
          const uc = num(e.unit_cost_per_hectare);
          S.norm.fCostHa = uc>0 ? String(uc) : "200000";
          S.norm.fCap = (e.additional_max_limit!==undefined && e.additional_max_limit!==null && String(e.additional_max_limit)!=="")
                        ? String(num(e.additional_max_limit)) : "";

          if(Array.isArray(p.farmer_details) && p.farmer_details.length){
            S.landRows = p.farmer_details.map((row,i)=>{
              const arr = Array.isArray(row) ? row : [];
              const hec = num(arr[6]) || (num(arr[5])>0 ? num(arr[5])/50 : 0);
              return {
                relation: (S.landRows && S.landRows[i] && S.landRows[i].relation) || (i===0 ? "स्वयं" : "अन्य"),
                name: arr[0]||"", father: arr[1]||"", village: arr[2]||"", khasra: arr[3]||"",
                aadhaar: arr[4]||"", hec: hec>0 ? String(hec) : ""
              };
            });
            // FIX: ensure at least 5 rows
            while(S.landRows.length < 5) S.landRows.push({relation:"अन्य",name:"",father:"",khasra:"",aadhaar:"",hec:""});
          }else{
            S.landRows = blank().landRows;
          }
          const loadRows=(sec, arr, firstKey)=>{
            const list = Array.isArray(arr) ? arr : [];
            if(!list.length){ S[sec] = [{}]; return; }
            const ex = EXTRA[sec] || [];
            S[sec] = list.map(row=>{
              const a = Array.isArray(row) ? row : (row && typeof row==="object" ? Object.values(row) : []);
              const o = {};
              o[firstKey] = a[0] || "";
              o.qty = num(a[1]) || "";
              o.unit = a[2] || "";
              o.rate = num(a[3]) || "";
              o.amt  = num(a[4]) || "";
              ex.forEach((key,i)=>{ o[key] = a[5+i] || ""; });
              return o;
            });
          };
          loadRows("material", e.material_expenses, "item");
          loadRows("footing",  e.footing_expenses,  "item");
          loadRows("labour",   e.labour_expenses,   "work");
          loadRows("other",    e.other_expenses,    "item");
        }
        let fillLocked = false;
        function resetFill(){
          S = blank();
          setFormId("");
          clearSaveStates();
          refresh();
        }
        function expenseRowsLoaded(rec){
          const e = rec && (rec.expense_details || {}) || {};
          return ["material","footing","labour","other"].reduce((a,k)=>{
            const arr = e[k+"_expenses"];
            return a + (Array.isArray(arr) ? arr.length : 0);
          }, 0);
        }
        function openForm(formId){
          const rec = findRecord(formId);
          if(!rec){
            S = blank();
          }
          setFormId(formId);
          clearSaveStates();
          if(rec){ applyRecord(rec); }
          fillLocked = true;
          showTab("filling");
          show("application");
          buildWork(); refresh();
          renderRegistrations();
          const n = expenseRowsLoaded(rec);
          const e = (rec && rec.expense_details) || {};
          const landSaved = num(e.area_hectare);
          const landLocal = (S.landRows||[]).reduce((a,r)=>a+num(r.hec),0);
          if(!rec){ apiMsg("फॉर्म " + formId + " चयनित — विवरण भरकर सहेजें।", "bad"); return; }
          if(landLocal>0 && landSaved<=0){
            apiMsg("फॉर्म " + formId + " खुला — भूमि " + fmtN(landLocal) + " हे० (सर्वर पर 0 है)। 'भूमि / सह-खातेदार विवरण' और 'क्षेत्रफल एवं मानक' दोबारा सहेजें।", "bad");
          }else if(n===0){
            apiMsg("फॉर्म " + formId + " खोला गया — सर्वर पर अभी कोई व्यय पंक्ति सहेजी नहीं गई है।", "bad");
          }else{
            apiMsg("फॉर्म " + formId + " खोला गया — सर्वर से " + n + " व्यय पंक्ति(याँ) तथा " + fmtN(landSaved) + " हे० भूमि लोड हुई।", "ok");
          }
        }
        async function registerUser(ev){
          ev && ev.preventDefault && ev.preventDefault();
          const name=(document.getElementById("regName")||{}).value || "";
          const mob =(document.getElementById("regMob")||{}).value  || "";
          const ctr = apiCenterName();
          if(!ctr){ apiMsg("लॉग इन केंद्र का नाम नहीं मिला — पहले दोबारा लॉगिन करें।","bad"); return; }
          if(!name.trim()){ apiMsg("कृषक का नाम भरना अनिवार्य है।","bad"); return; }
          if(!/^\d{10}$/.test(mob.trim())){ apiMsg("10 अंक का सही मोबाइल नंबर भरें।","bad"); return; }
          const btn=document.querySelector('#regForm button[type="submit"]');
          if(btn) btn.disabled=true;
          try{
            const res = await apiFetch(API_FENCING, {
              method:"POST",
              headers:{ "Content-Type":"application/json" },
              body: JSON.stringify({ full_name: name.trim(), mob: mob.trim(), center_name: ctr.trim() })
            });
            const data = await readJsonResponse(res);
            if(!res.ok) throw new Error((data && (data.detail || data.error || data.message)) || ("पंजीकरण विफल (" + res.status + ")"));
            const newId = pickFormId(data);
            await loadRegistrations();
            if(newId){
              setFormId(newId);
              S.f.name = name.trim();
              S.f.mob = mob.trim();
              S.f.gardenCard = "";
              S.f.plants = "";
              // FIX: use blank().landRows to preserve default hec:"0.40"
              S.landRows = blank().landRows;
              S.landRows[0].name = name.trim();

              const rec=findRecord(newId);
              if(rec) applyRecord(rec);
              renderRegistrations();
              apiMsg("पंजीकरण हो गया — फॉर्म आईडी " + newId + "। अब 'प्रपत्र भरना' टैब में विवरण भरें।", "ok");
              fillLocked = true;
              showTab("filling");
            }else{
              apiMsg("पंजीकरण हो गया, पर फॉर्म आईडी नहीं मिली। सूची ताज़ा करें।", "bad");
            }
          }catch(err){
            apiMsg("पंजीकरण विफल: " + (err && err.message ? err.message : "अज्ञात त्रुटि"), "bad");
          }finally{
            if(btn) btn.disabled=false;
          }
        }

        let cur="application";
        let topCur="register";
        function show(v){
          cur=v;
          document.querySelectorAll("#subnav a").forEach(a=>a.classList.toggle("on", a.dataset.go===v));
          const host = document.querySelector('.view[data-v="filling"]');
          if(host){
            host.querySelectorAll(":scope > .view").forEach(s=>{
              s.classList.toggle("on", s.dataset.v===v);
              s.classList.remove("print-target");
            });
          }
          if(v==="application"){ buildApplication(); }
          else if(v==="work"){ buildWork(); refresh(); }
          else if(v==="bill"){ buildBill(); }
          window.scrollTo(0,0);
        }
        function showTab(v){
          topCur=v;
          document.querySelectorAll("main > .view").forEach(s=>s.classList.toggle("on", s.dataset.v===v));
          document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("on", a.dataset.tab===v));
          if(v==="filling"){
            if(fillLocked){ fillLocked=false; }
            else { resetFill(); }
            show(cur);
          }
          if(v==="register"){ loadRegistrations(); }
          const pv=document.getElementById("bPreview");
          if(pv) pv.disabled = (v!=="filling");
          window.scrollTo(0,0);
        }

        function validateFenceAreaValue(i){ return true; }

        // FIX: always sync from S.f to S.landRows[0] (not just when empty)
        function syncSelfRowFields(){
          const row = (S.landRows||[])[0];
          if(!row) return;
          row.name = S.f.name || "";
          row.father = S.f.father || "";
          row.village = S.f.village || "";
          row.aadhaar = S.f.aadhar || "";
        }

        function setFenceMappingPrintRow(){
          const d = applicationData();
          const table = document.getElementById("fenceMappingApplicationTable");
          if(!table) return;
          table.querySelectorAll("tbody tr").forEach(tr=>tr.classList.remove("print-selected"));
          if(!d.allowedArea || !d.exact) return;
          const row = table.querySelector(`tbody tr[data-map-hec="${d.exact.hec.toFixed(2)}"]`);
          if(row) row.classList.add("print-selected");
        }

        document.addEventListener("input", e=>{
          const t=e.target;
          if(t.dataset.land){
            const i=+t.dataset.land, k=t.dataset.k;
            if(!S.landRows) S.landRows=[{relation:"स्वयं",name:"",father:"",khasra:"",aadhaar:"",hec:""},{relation:"भाई",name:"",father:"",khasra:"",aadhaar:"",hec:""},{relation:"पुत्र",name:"",father:"",khasra:"",aadhaar:"",hec:""},{relation:"पिता",name:"",father:"",khasra:"",aadhaar:"",hec:""},{relation:"अन्य",name:"",father:"",khasra:"",aadhaar:"",hec:""}];
            if(!S.landRows[i]) S.landRows[i]={relation:"",hec:"",aadhaar:""};
            if(["relation","hec","name","father","village","khasra","aadhaar"].includes(k)) S.landRows[i][k]=t.value;
            const validArea = k==="hec" ? validateFenceAreaValue(i) : true;
            updateApplicationDerived(); return;
          }
          if(t.dataset.f){
            S.f[t.dataset.f]=t.value;
            refresh();
            if(LANG_FIELDS.includes(t.dataset.f)){ rebuildDocs(); }
            else{
              if(cur==="application") updateApplicationDerived();
              if(cur==="bill") buildBill();
            }
          }
          else if(t.dataset.norm){ S.norm[t.dataset.norm]=t.value; refresh(); if(cur==="application") buildApplication(); }
          else if(t.dataset.row){
            const k=t.dataset.row, i=+t.dataset.i;
            if(!S[k][i]) S[k][i]={};
            S[k][i][t.dataset.k]=t.value;
            refreshWorkTotals();
          }
        });
        document.addEventListener("change", e=>{
          const t=e.target;
          if(t.dataset.f){ S.f[t.dataset.f]=t.value; refresh();
            if(LANG_FIELDS.includes(t.dataset.f)){ rebuildDocs(); }
            else { if(cur==="application") updateApplicationDerived(); if(cur==="bill") buildBill(); } }
          if(t.id==="appRate"){ S.norm.fRate=t.value; refresh(); if(cur==="application") updateApplicationDerived(); return; }
          if(t.dataset.land){ const i=+t.dataset.land, k=t.dataset.k; if(!S.landRows) S.landRows=[]; if(!S.landRows[i]) S.landRows[i]={relation:"",hec:"",aadhaar:""}; S.landRows[i][k]=t.value; if(k==="hec") validateFenceAreaValue(i); if(cur==="application") { buildApplication(); } return; }
          if(t.id==="scheme"){ S.scheme=t.value; buildApplication(); show("work"); return; }
          const id = t.getAttribute && t.getAttribute("list");
          if(id && DL[id] && t.value.trim() && !S.lists[DL[id]].includes(t.value.trim())){
            S.lists[DL[id]].push(t.value.trim()); buildLists();
          }
        });
        document.addEventListener("click", e=>{
          const b=e.target.closest("[data-add],[data-del],[data-go],[data-tab],[data-save],[data-open],[data-delform],[data-land-del],#addLandRow"); if(!b) return;
          if(b.id==="addLandRow"){
            if(!S.landRows) S.landRows=[];
            S.landRows.push({relation:"अन्य",name:"",father:"",khasra:"",aadhaar:"",hec:""});
            buildApplication();
            return;
          }
          if(b.dataset.landDel!==undefined){
            const i=+b.dataset.landDel;
            if(i>0 && S.landRows && i<S.landRows.length){
              S.landRows.splice(i,1);
              buildApplication();
            }
            return;
          }
          if(b.dataset.open!==undefined){ openForm(b.dataset.open); return; }
          if(b.dataset.delform!==undefined){ requestDeleteForm(b.dataset.delform, b); return; }
          if(b.dataset.save!==undefined){ saveStep(b.dataset.save); return; }
          if(b.dataset.tab){ showTab(b.dataset.tab); return; }
          if(b.dataset.add){ S[b.dataset.add].push({}); buildWork(); refresh(); }
          else if(b.dataset.del){ const k=b.dataset.del; S[k].splice(+b.dataset.i,1); if(!S[k].length) S[k].push({}); buildWork(); refresh(); }
          else if(b.dataset.go){ show(b.dataset.go); }
        });
        const bGoEl=document.getElementById("bGo");
        if(bGoEl) bGoEl.onclick = ()=>{ showTab("filling"); show("bill"); };
        const regFormEl=document.getElementById("regForm");
        if(regFormEl) regFormEl.addEventListener("submit", registerUser);
        const regRefreshEl=document.getElementById("regRefresh");
        if(regRefreshEl) regRefreshEl.onclick = ()=>loadRegistrations();
        const btnSaveAllEl=document.getElementById("btnSaveAll");
        if(btnSaveAllEl) btnSaveAllEl.onclick = ()=>saveAllSteps();
        function printCurrent(){
          const root=rootRef.current;
          if(!root) return;
          root.querySelectorAll(".view").forEach(v=>v.classList.remove("print-target","has-print-target"));
          const host=root.querySelector('.view[data-v="filling"]');
          const target=(host ? host.querySelector('.view[data-v="'+cur+'"]') : null)
                     || root.querySelector('.view[data-v="'+cur+'"]');
          if(!target) return;
          target.classList.add("print-target");
          let p=target.parentElement;
          while(p && p!==root){
            if(p.classList && p.classList.contains("view")) p.classList.add("has-print-target");
            p=p.parentElement;
          }
          window.print();
        }
        const PV_TITLES={application:"फेंसिंग आवेदन पत्र", work:"व्यय विवरण", bill:"देयक प्रपत्र"};
        function openPreview(){
          if(topCur!=="filling"){ apiMsg("पहले 'प्रपत्र भरना' टैब खोलें।","bad"); return; }
          const overlay=document.getElementById("pvOverlay");
          const body=document.getElementById("pvBody");
          const host=document.querySelector('.view[data-v="filling"]');
          const target=(host ? host.querySelector('.view[data-v="'+cur+'"]') : null)
                     || document.querySelector('.view[data-v="'+cur+'"]');
          if(!overlay||!body||!target) return;
          document.getElementById("pvTitle").textContent = "प्रिंट पूर्वावलोकन — " + (PV_TITLES[cur]||"प्रपत्र");
          body.innerHTML="";
          if(cur==="application") setFenceMappingPrintRow();
          const sheet=document.createElement("div");
          sheet.className="pv-sheet";
          const clone=target.cloneNode(true);
          clone.classList.add("on");
          const liveFields=target.querySelectorAll("input,select,textarea");
          const cloneFields=clone.querySelectorAll("input,select,textarea");
          for(let i=0;i<liveFields.length;i++){
            const cf=cloneFields[i];
            if(!cf) break;
            if(cf.type==="checkbox"||cf.type==="radio") cf.checked=liveFields[i].checked;
            else cf.value=liveFields[i].value;
          }
          sheet.appendChild(clone);
          body.appendChild(sheet);
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
        const bPreviewEl=document.getElementById("bPreview");
        if(bPreviewEl) bPreviewEl.onclick = openPreview;
        const pvCloseEl=document.getElementById("pvClose");
        if(pvCloseEl) pvCloseEl.onclick = closePreview;
        const pvPrintEl=document.getElementById("pvPrint");
        if(pvPrintEl) pvPrintEl.onclick = ()=>{ closePreview(); printCurrent(); };
        const pvOverlayEl=document.getElementById("pvOverlay");
        if(pvOverlayEl) pvOverlayEl.addEventListener("click", e=>{
          if(e.target === e.currentTarget) closePreview();
        });
        document.addEventListener("keydown", e=>{
          if(e.key==="Escape") closePreview();
        });
        window.addEventListener("beforeprint", ()=>{ closePreview(); });

        document.getElementById("scheme").value = S.scheme;
        setFormId("");
        AUTH_CENTER = authCenter;
        showTab("register");
        loadRegistrations();
        loadFenceStandards();
        function clearPrintTarget(){
          const r = rootRef.current;
          if(r) r.querySelectorAll(".print-target, .has-print-target").forEach(v=>v.classList.remove("print-target","has-print-target"));
        }
        window.addEventListener('beforeprint', setFenceMappingPrintRow);
        window.addEventListener('afterprint', ()=>{
          document.querySelectorAll('#fenceMappingApplicationTable tbody tr').forEach(tr=>tr.classList.remove('print-selected'));
          clearPrintTarget();
        });
      })();
    } catch (error) {
      console.error("Kisan Aavedan Portal initialization failed:", error);
      const target = root.querySelector("main") || root;
      const box = document.createElement("div");
      box.style.cssText = "margin:20px;padding:14px;border:1px solid #d8b4b4;background:#fff5f5;color:#7f1d1d;font-family:Segoe UI,sans-serif;";
      box.innerHTML = "<b>पोर्टल लोड नहीं हो सका।</b><br/>कृपया browser console में error देखें।";
      target.prepend(box);
    }

    return () => {
      window.removeEventListener("resize", syncAppNav);
      window.removeEventListener("load", syncAppNav);
      window.clearTimeout(navSyncTimer);
      root.innerHTML = "";
    };
  }, []);

  const centerSyncRef = useRef(false);
  useEffect(() => {
    const el = rootRef.current && rootRef.current.querySelector("#regCenter");
    if (!el) return;
    const value = (centerName || "").trim();
    centerStore.value = value;
    const appCenter = document.getElementById("appOfficerCenter");
    if (appCenter) appCenter.textContent = value || "……………………";
    el.value = value || "— लॉग इन केंद्र नहीं मिला —";
    el.title = value ? ("लॉग इन केंद्र: " + value) : "लॉग इन केंद्र नहीं मिला";
    if (!centerSyncRef.current) { centerSyncRef.current = true; return; }
    const btn = document.getElementById("regRefresh");
    if (btn) btn.click();
  }, [centerName]);

  return <div ref={rootRef} className="kisan-html-react-root" />;
}