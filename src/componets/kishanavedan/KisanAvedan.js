import React, { useEffect, useRef, useMemo } from "react";
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

const API_VERMI = "https://mahadevaaya.com/govbillingsystem/backend/api/vermicompost-kisan/";
const DISTRICT_NAME = "पौड़ी गढ़वाल";

const centerStore = { value: "", onChange: null };

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
            <div><label class="f">ग्राम</label><input id="regVillage" placeholder="ग्राम का नाम"></div>
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
                <th>ग्राम</th><th>केंद्र</th><th>स्थिति</th>
                <th style="width:180px">क्रिया</th>
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
        <div id="workBody"></div>
      </section>
      <section class="view" data-v="bill">
        <h2 class="head">देयक प्रपत्र</h2>
        <p class="lead" id="billLead"></p>
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

export default function KisanAavedan() {
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

    const userData = {
      dist: DISTRICT_NAME,
      block: (user && user.block) || "",
      tehsil: (user && user.tehsil) || ""
    };

    const printCleanupRef = { fn: null };
    try {
      (function() {
        "use strict";

        const num  = v => { const n = parseFloat(String(v==null?"":v).replace(/[^0-9.\-]/g,"")); return isNaN(n)?0:n; };
        const fmt0 = n => "₹ " + Math.round(Number(n)||0).toLocaleString("en-IN");
        const fmtN = n => (Number(n)||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2});
        const esc  = s => String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

        const ONE=["","एक","दो","तीन","चार","पाँच","छह","सात","आठ","नौ","दस","ग्यारह","बारह","तेरह","चौदह","पन्द्रह","सोलह","सत्रह","अठारह","उन्नीस","बीस","इक्कीस","बाईस","तेईस","चौबीस","पच्चीस","छब्बीस","सत्ताईस","अट्ठाईस","उनतीस","तीस","इकतीस","बत्तीस","तैंतीस","चौंतीस","पैंतीस","छत्तीस","सैंतीस","अड़तीस","उनतालीस","चालीस","इकतालीस","बयालीस","तैंतालीस","चवालीस","पैंतालीस","छियालीस","सैंतालीस","अड़तालीस","उनचास","पचास","इक्यावन","बावन","तिरेपन","चौवन","पचपन","छप्पन","सत्तावन","अट्ठावन","उनसठ","साठ","इकसठ","बासठ","तिरेसठ","चौंसठ","पैंसठ","छियासठ","सड़सठ","अड़सठ","उनहत्तर","सत्तर","इकहत्तर","बहत्तर","तिहत्तर","चौहत्तर","पचहत्तर","छिहत्तर","सतहत्तर","अठहत्तर","उन्यासी","अस्सी","इक्यासी","बयासी","तिरासी","चौरासी","पचासी","छियासी","सत्तासी","अट्ठासी","नवासी","नब्बे","इक्यानवे","बानवे","तिरानवे","चौरानवे","पंचानवे","छियानवे","सत्तानवे","अट्ठानवे","निन्यानवे"];
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
          vermi:{amt:r=>num(r.amt),c:[["item","कार्य / सामग्री का विवरण","62%",0,"dlVermi"],["amt","बिल राशि (₹)","38%",0,"n"]]}
        };
        const sum = k => (S[k]||[]).reduce((a,r)=>a+COLS[k].amt(r),0);
        const SECTIONS = {
          vermicompost:[["vermi","वर्मी कम्पोस्ट इकाई — सामग्री एवं व्यय","ईंट, सीमेंट, रेत, बजरी, चिनाई, केंचुए, गोबर आदि"]]
        };

        const blank = () => ({
          scheme:"vermicompost",
          lists: JSON.parse(JSON.stringify(LISTS)),
          norm:{ vRate:75, vCap:24998, vStdCost:33333 },
          f:{name:"",father:"",village:"",post:"",block:userData.block,dist:userData.dist,mob:"",aadhar:"",khasra:"",bank:"",branch:"",acct:"",ifsc:"",cat:"सामान्य",farmerCat:"सीमांत",hortiCard:"",tehsil:userData.tehsil,proposedArea:"",irrigation:"उपलब्ध", gender:"",mbAmt:"", date:new Date().toISOString().slice(0,10), place:"", officer:"", desig:""},
          vermi:[
            {item:"ईंट", amt:""},
            {item:"सीमेंट", amt:""},
            {item:"रेत", amt:""},
            {item:"बजरी", amt:""},
            {item:"चिनाई मजदूरी", amt:""},
            {item:"प्लास्टर कार्य", amt:""},
            {item:"केंचुए (वर्म कल्चर)", amt:""},
            {item:"गोबर / जैविक अपशिष्ट", amt:""},
            {item:"छाया हेतु शेड / तिरपाल", amt:""},
            {item:"अन्य", amt:""}
          ], 
          vcrops:[{name:"",area:""}]
        });
        let S = blank();
        let FORM_ID = "";
        let AUTH_CENTER = authCenter;
        let AUTH_USER = userData;
        let REG_ROWS = [];
        let fillLocked = false;
        let cur = "register";
        let subCur = "application";

        function authCenterName(){
          return String((centerStore.value || AUTH_CENTER || "") || "").trim();
        }

        const apiFetch = async (url, options = {}) => {
          const method = (options.method || "GET").toUpperCase();
          return fetch(url, { ...options, method, credentials: "omit" });
        };
        const readJsonResponse = async (response) => {
          const ct = response.headers.get("content-type") || "";
          const text = await response.text();
          if (!text) return {};
          if (!ct.toLowerCase().includes("application/json")) {
            throw new Error("सर्वर से अपेक्षित JSON नहीं मिला (status " + response.status + ")।");
          }
          try { return JSON.parse(text); }
          catch (e) { throw new Error("सर्वर का उत्तर पढ़ा नहीं जा सका।"); }
        };
        function apiErrorText(data, res){
          if(!data) return "सहेजना विफल (status " + res.status + ")";
          if(typeof data === "string") return data;
          const simple = data.detail || data.error || data.message;
          if(typeof simple === "string" && simple) return simple;
          try{ const txt = JSON.stringify(data); return txt.length>300?(txt.slice(0,300)+"…"):txt; }
          catch(e){ return "सहेजना विफल (status " + res.status + ")"; }
        }

        let apiMsgTimer = null;
        function apiMsg(text, kind){
          const el = document.getElementById("apiMsg");
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
          S._editingFormId = FORM_ID || null;
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
        function clearSaveStates(){ Object.keys(SAVE_STATES).forEach(k=>delete SAVE_STATES[k]); }

        function saveBar(key, label){
          const st = SAVE_STATES[key];
          return `<div class="save-bar noprint">
            <button type="button" class="addrow solid" data-save="${key}">सहेजें — ${label}</button>
            <span class="save-state${st ? (" " + st.kind) : ""}" data-savestate="${key}">${st ? st.text : ""}</span>
            <span class="save-hint">PUT · फॉर्म आईडी <b>${esc(FORM_ID||"चयनित नहीं")}</b></span>
          </div>`;
        }

        const genderToApi = g => (g==="पुरुष"?"Male":g==="महिला"?"Female":"");
        const genderFromApi = g => {
          const k = String(g||"").trim().toLowerCase();
          if(k==="male"||k==="पुरुष") return "पुरुष";
          if(k==="female"||k==="महिला") return "महिला";
          return "";
        };
        function payloadPersonal(){
          return {
            form_id: FORM_ID,
            father_name: S.f.father || "",
            village: S.f.village || "",
            post: S.f.post || "",
            tehsil: S.f.tehsil || "",
            dist: DISTRICT_NAME,
            horticulture_card: S.f.hortiCard || "",
            aadhar: S.f.aadhar || "",
            khasra: S.f.khasra || "",
            gender: genderToApi(S.f.gender)
          };
        }
        function payloadArea(){
          return {
            form_id: FORM_ID,
            proposed_area: num(S.f.proposedArea),
            crop_details: (S.vcrops||[]).filter(c=>c.name).map(c=>[c.name, num(c.area)])
          };
        }
        function payloadBank(){
          return {
            form_id: FORM_ID,
            block: S.f.block || "",
            bank_name: S.f.bank || "",
            branch: S.f.branch || "",
            account: S.f.acct || "",
            ifsc: S.f.ifsc || ""
          };
        }
        function payloadDate(){
          return {
            form_id: FORM_ID,
            place: S.f.place || "",
            date: S.f.date || new Date().toISOString().slice(0,10)
          };
        }
        function payloadMb(){
          return {
            form_id: FORM_ID,
            mb_valuation_amount: num(S.f.mbAmt)
          };
        }
        function payloadExpenses(){
          return {
            form_id: FORM_ID,
            subsidy_rate: num(S.norm.vRate),
            standard_cost: num(S.norm.vStdCost),
            maximum_subsidy: num(S.norm.vCap),
            vermi_expenses: (S.vermi||[]).filter(v=>v.item).map(v=>[v.item, num(v.amt)])
          };
        }
        const SAVE_STEPS = [
          { key:"personal",  label:"आवेदक विवरण",            build:payloadPersonal },
          { key:"area",      label:"भूमि एवं फसल विवरण",     build:payloadArea },
          { key:"bank",      label:"बैंक विवरण",              build:payloadBank },
          { key:"expenses",  label:"मानक एवं व्यय विवरण",     build:payloadExpenses },
          { key:"mb",        label:"एम०बी० मूल्यांकन धनराशि", build:payloadMb },
          { key:"date",      label:"दिनांक एवं स्थान",        build:payloadDate }
        ];

        async function apiPut(payload, label, key, quiet){
          if(!FORM_ID){
            const m = "पहले 'उपयोगकर्ता पंजीकरण' टैब से कृषक पंजीकृत करें — फॉर्म आईडी आवश्यक है।";
            if(!quiet) apiMsg(m, "bad");
            setSaveState(key, "✗ फॉर्म आईडी नहीं है", "bad");
            return false;
          }
          const btn = document.querySelector('[data-save="'+(key||"")+'"]');
          if(btn && !quiet) btn.disabled = true;
          try{
            const res = await apiFetch(API_VERMI, {
              method:"PUT",
              headers:{ "Content-Type":"application/json" },
              body: JSON.stringify(payload)
            });
            const data = await readJsonResponse(res);
            if(!res.ok) throw new Error(apiErrorText(data, res));
            if(!quiet) apiMsg("✓ " + (label||"विवरण") + " सफलतापूर्वक सहेजा गया — " + FORM_ID, "ok");
            setSaveState(key, "✓ सहेजा गया", "ok");
            return true;
          }catch(err){
            const msg = (err && err.message) ? err.message : "अज्ञात त्रुटि";
            if(!quiet) apiMsg("सहेजना विफल: " + msg, "bad");
            setSaveState(key, "✗ " + msg, "bad");
            return false;
          }finally{
            if(btn) btn.disabled = false;
          }
        }
        function saveStep(key){
          const step = SAVE_STEPS.find(s=>s.key===key);
          if(!step) return;
          setSaveState(key, "सहेजा जा रहा है…", "wait");
          apiPut(step.build(), step.label, key);
        }
        async function saveAllSteps(){
          if(!FORM_ID){
            apiMsg("पहले 'उपयोगकर्ता पंजीकरण' टैब से कृषक पंजीकृत करें — फॉर्म आईडी आवश्यक है।", "bad");
            return;
          }
          const hint = document.getElementById("saveAllHint");
          let ok = 0;
          for(const step of SAVE_STEPS){
            if(hint) hint.textContent = "सहेजा जा रहा है: " + step.label + "…";
            setSaveState(step.key, "सहेजा जा रहा है…", "wait");
            const done = await apiPut(step.build(), step.label, step.key, true);
            if(done) ok++;
            if(!done) break;
          }
          if(hint) hint.textContent = ok + " / " + SAVE_STEPS.length + " चरण सहेजे गए।";
          if(ok === SAVE_STEPS.length) apiMsg("✓ सम्पूर्ण प्रपत्र सफलतापूर्वक सहेजा गया — " + FORM_ID + " (" + ok + "/" + SAVE_STEPS.length + ")", "ok");
          else apiMsg("✗ " + ok + " / " + SAVE_STEPS.length + " चरण ही सहेजे जा सके।", "bad");
        }

        async function apiDelete(formIds){
          const ids = (Array.isArray(formIds) ? formIds : [formIds]).map(x=>String(x||"").trim()).filter(Boolean);
          if(!ids.length){ apiMsg("फॉर्म आईडी नहीं मिली।","bad"); return false; }
          try{
            const res = await apiFetch(API_VERMI, {
              method:"DELETE",
              headers:{ "Content-Type":"application/json" },
              body: JSON.stringify({ form_ids: ids })
            });
            const data = await readJsonResponse(res);
            if(!res.ok) throw new Error((data && (data.detail||data.error||data.message)) || ("हटाना विफल (status " + res.status + ")"));
            if(FORM_ID && ids.includes(FORM_ID)){
              setFormId("");
              S = blank();
            }
            apiMsg(ids.length + " फॉर्म हटा दिया गया: " + ids.join(", "), "ok");
            return true;
          }catch(err){
            apiMsg("हटाना विफल: " + (err && err.message ? err.message : "अज्ञात त्रुटि"), "bad");
            return false;
          }
        }
        function requestDeleteForm(fid, btn){
          if(!fid) return;
          if(!window.confirm("फॉर्म " + fid + " सर्वर से स्थायी रूप से हटा देना है?")) return;
          if(btn){ btn.disabled = true; btn.textContent = "हट रहा है…"; }
          apiDelete([fid]).then(()=>{ loadRegistrations(); });
        }

        function mbValue(){ return num(S.f.mbAmt); }
        function calc(){
          const parts = [["वर्मी कम्पोस्ट इकाई निर्माण कार्य", sum("vermi")]];
          const bill = parts.reduce((a,p)=>a+p[1],0);
          const rate = num(S.norm.vRate)/100;
          const cap  = num(S.norm.vCap);
          let mb=0, base=0, bases=[], standardCost=0, shortfall=0;
          mb = mbValue();
          standardCost = num(S.norm.vStdCost)||33333;
          if(bill>0) bases.push({key:"bill",label:"बिल / वाउचर के अनुसार कुल व्यय",val:bill});
          if(mb>0) bases.push({key:"mb",label:"एम०बी० मूल्यांकन धनराशि",val:mb});
          if(standardCost>0) bases.push({key:"standard",label:"मानक लागत (10 फीट × 8 फीट × 2.5 फीट)",val: standardCost});
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
          let h='<table class="expense-table">';
          h+='<colgroup><col style="width:38px">'+cfg.c.map(c=>`<col style="width:${c[2]||"auto"}">`).join("")+'<col style="width:46px"></colgroup>';
          h+='<thead><tr><th>क्र०</th>';
          cfg.c.forEach(c=>h+=`<th>${c[1]}</th>`);
          h+='<th class="noprint">क्रिया</th></tr></thead><tbody>';
          S[k].forEach((r,i)=>{
            h+=`<tr><td class="n">${i+1}</td>`;
            cfg.c.forEach(c=>{
              if(c[0]==="_amt"){ h+=`<td class="calc num">${fmtN(cfg.amt(r))}</td>`; return; }
              h+=`<td><input data-row="${k}" data-i="${i}" data-k="${c[0]}" value="${esc(r[c[0]]||"")}"`+ (c[4]?` list="${c[4]}"`:"") + (c[3]==="n"?' inputmode="decimal"':"") + `></td>`;
            });
            h+=`<td><button class="rm" data-del="${k}" data-i="${i}" title="पंक्ति हटाएँ">×</button></td></tr>`;
          });
          const ai = cfg.c.findIndex(c=>c[0]==="_amt"||c[0]==="amt");
          h+=`<tr class="tot"><td colspan="${ai+1}" style="text-align:right">योग</td><td class="calc num" data-tot="${k}">${fmtN(sum(k))}</td>`;
          for(let j=ai+1;j<cfg.c.length;j++) h+="<td></td>";
          h+='<td class="noprint"></td>';
          h+='</tr></tbody></table>';
          h+=`<button class="addrow" data-add="${k}">+ पंक्ति जोड़ें</button>`;
          return h;
        }
        function buildLists(){
          document.getElementById("datalists").innerHTML =
            Object.keys(DL).map(i=>`<datalist id="${i}">`+(S.lists[DL[i]]||[]).map(v=>`<option value="${esc(v)}">`).join("")+"</datalist>").join("");
        }
        function toggleStrip(){
          const strip = document.getElementById("bottomStrip");
          if(strip) strip.style.display = "none";
        }

        function buildWork(){
          document.getElementById("workLead").textContent = "वर्मी कम्पोस्ट इकाई निर्माण पर हुआ पूरा व्यय भरें। हर पंक्ति में पहले कार्य / विवरण चुनें, फिर उसी के सामने बिल राशि डालें।";
          document.getElementById("workBody").innerHTML = SECTIONS.vermicompost.map(([k,t,n])=>
            `<div class="card"><div class="cap"><i></i>${t}<small>${n}</small></div><div class="pad">${tableHTML(k)}</div></div>`).join("")
            + `<div class="note">कार्य / सामग्री: ईंट, सीमेंट, रेत, बजरी, चिनाई मजदूरी, प्लास्टर कार्य, केंचुए (वर्म कल्चर), गोबर / जैविक अपशिष्ट, छाया हेतु शेड / तिरपाल एवं अन्य।</div>`
            + saveBar("expenses", "व्यय विवरण");
          buildLists();
        }

        /* ===================== Render: Application ===================== */
        function buildVermiApplication(){
          const f = S.f || {};
          const cropHTML = (S.vcrops||[]).map(function(r,i){
            return '<tr>'
              + '<td class="n">' + (i+1) + '</td>'
              + '<td><input list="cropOptions" data-vc="' + i + '" data-k="name" value="' + esc(r.name||"") + '" placeholder="फसल / बागवानी फसल का नाम"></td>'
              + '<td><input data-vc="' + i + '" data-k="area" value="' + esc(r.area||"") + '" inputmode="decimal" placeholder="हे०"></td>'
              + '<td class="noprint"><button class="rm" data-vcdel="' + i + '" title="पंक्ति हटाएँ">×</button></td>'
              + '</tr>';
          }).join("");

          const html =
            '<div class="appdoc">'
            + '<div style="text-align:center;font-size:11.5px;color:#65746B;margin:2px 0 4px">उद्यान विभाग · वित्तीय वर्ष 2026-27</div>'
            + '<h3 style="text-decoration:underline">राज्य सेक्टर योजना अन्तर्गत वर्मी कम्पोस्ट इकाई हेतु</h3>'
            + '<h4 style="color:var(--ink);font-size:16px;font-weight:600">कृषक आवेदन पत्र</h4>'

            + '<div class="st">आवेदक का विवरण</div>'
            + '<div class="grid2">'
            +   '<div class="field"><label>कृषक का नाम</label><input data-f="name" value="' + esc(f.name||"") + '"></div>'
            +   '<div class="field"><label>पिता / पति का नाम</label><input data-f="father" value="' + esc(f.father||"") + '"></div>'
            +   '<div class="field"><label>ग्राम</label><input data-f="village" value="' + esc(f.village||"") + '"></div>'
            +   '<div class="field"><label>डाकघर</label><input data-f="post" value="' + esc(f.post||"") + '"></div>'
            +   '<div class="field"><label>तहसील</label><input data-f="tehsil" value="' + esc(f.tehsil||"") + '" placeholder="तहसील का नाम"></div>'
            +   '<div class="field"><label>जनपद</label><input data-f="dist" value="' + esc(f.dist||DISTRICT_NAME) + '" readonly disabled title="यह जनपद पूर्व निर्धारित है"></div>'
            +   '<div class="field"><label>उद्यान कार्ड संख्या</label><input data-f="hortiCard" value="' + esc(f.hortiCard||"") + '"></div>'
            +   '<div class="field"><label>मोबाइल नं.</label><input data-f="mob" inputmode="numeric" maxlength="10" value="' + esc(f.mob||"") + '"></div>'
            +   '<div class="field"><label>आधार संख्या</label><input data-f="aadhar" inputmode="numeric" maxlength="12" value="' + esc(f.aadhar||"") + '"></div>'
            +   '<div class="field"><label>खाता / खतौनी संख्या</label><input data-f="khasra" value="' + esc(f.khasra||"") + '"></div>'
            +   '<div class="field"><label>लिंग</label><select data-f="gender"><option value="">चुनें</option><option value="पुरुष">पुरुष</option><option value="महिला">महिला</option></select></div>'
            + '</div>'
            + saveBar("personal", "आवेदक एवं योजना विवरण")

            + '<div class="st">भूमि का विवरण</div>'
            + '<div class="grid2">'
            +   '<div class="field"><label>भूमि का क्षेत्रफल (हे०)</label><input data-f="proposedArea" inputmode="decimal" value="' + esc(f.proposedArea||"") + '" placeholder="हे० में क्षेत्रफल"></div>'
            + '</div>'

            + '<div class="st">कृषक की खेती का विवरण</div>'
            + '<table class="expense-table"><colgroup><col style="width:38px"><col><col style="width:140px"><col class="noprint" style="width:60px"></colgroup><thead><tr>'
            +   '<th>क्र०</th><th>फसल / बागवानी फसल का नाम</th><th>क्षेत्रफल (हे०)</th><th class="noprint">क्रिया</th>'
            + '</tr></thead><tbody>' + (cropHTML || '<tr><td colspan="4" class="empty">कोई फसल नहीं जोड़ी गई</td></tr>') + '</tbody></table>'
            + '<button type="button" class="addrow" id="addCropBtn">+ फसल जोड़ें</button>'
            + saveBar("area", "भूमि एवं फसल विवरण")

            + '<div class="st">बैंक विवरण</div>'
            + '<div class="grid2">'
            +   '<div class="field"><label>विकासखण्ड</label><input data-f="block" value="' + esc(f.block||"") + '"></div>'
            +   '<div class="field"><label>बैंक का नाम</label><input data-f="bank" value="' + esc(f.bank||"") + '"></div>'
            +   '<div class="field"><label>शाखा</label><input data-f="branch" value="' + esc(f.branch||"") + '"></div>'
            +   '<div class="field"><label>बैंक खाता संख्या</label><input data-f="acct" inputmode="numeric" value="' + esc(f.acct||"") + '"></div>'
            +   '<div class="field"><label>IFSC कोड</label><input data-f="ifsc" value="' + esc(f.ifsc||"") + '"></div>'
            + '</div>'
            + saveBar("bank", "बैंक विवरण")

            + '<div class="st">स्थान एवं दिनांक</div>'
            + '<div class="grid2">'
            +   '<div class="field"><label>स्थान</label><input data-f="place" value="' + esc(f.place||"") + '" placeholder="स्थान का नाम"></div>'
            +   '<div class="field"><label>दिनांक</label><input type="date" data-f="date" value="' + esc(f.date||"") + '"></div>'
            + '</div>'

            + '<div class="st">7. घोषणा</div>'
            + '<div class="declaration-box">'
            +   '<p>उपर्युक्त सभी विवरण मेरी जानकारी में पूर्णतः सत्य हैं। मुझे पूर्व में किसी भी सरकारी योजना से वर्मी कम्पोस्ट यूनिट हेतु अनुदान प्राप्त नहीं हुआ है। यूनिट की स्थापना व रखरखाव विभागीय दिशा-निर्देशों के अनुसार मेरी जिम्मेदारी होगी।</p>'
            +   '<div class="farmer-signature">'
            +     '<div>कृषक का नाम : <strong id="app_farmer_name">' + esc(f.name||"…………") + '</strong></div>'
            +     '<div>कृषक के हस्ताक्षर : ______________________________</div>'
            +   '</div>'
            + '</div>'

            + '<div class="st">संलग्न दस्तावेज</div>'
            + '<div class="note">'
            +   '1. खाता-खतौनी की प्रति — 6 माह से अधिक पुरानी नहीं हो।<br>'
            +   '2. आधार कार्ड की प्रति।<br>'
            +   '3. उद्यान कार्ड की प्रति।<br>'
            +   '4. बैंक खाते का विवरण / बैंक पासबुक की प्रति।<br>'
            +   '5. ₹10 का नोटरीकृत शपथ-पत्र।'
            + '</div>'

            + '<div class="st">8. प्रभारी की आख्या</div>'
            + '<div class="declaration-box prabhari-box">'
            +   '<p>प्रमाणित किया जाता है कि कृषक द्वारा प्रस्तुत आवेदन, भूमि अभिलेख एवं अन्य संबंधित अभिलेखों का परीक्षण कर लिया गया है। आवेदन में अंकित विवरण एवं प्रस्तुत अभिलेख सही पाए गए हैं।अतः कृषक आवेदन <strong>उद्यान विशेषज्ञ, कोटद्वार महोदय की सेवा में वर्क ऑर्डर जारी करने हेतु संस्तुति सहित अग्रसारित</strong> है।</p>'
            +   '<p style="margin-top:24px;"><strong>प्रभारी, उद्यान सचल दल केन्द्र</strong><br>'
            +   '<strong>केन्द्र का नाम :</strong> ' + (authCenterName()
                 ? '<span style="display:inline-block;min-width:300px;border-bottom:1px solid #333;text-align:center;padding:0 6px">' + esc(authCenterName()) + '</span>'
                 : '<span style="display:inline-block;min-width:300px;border-bottom:1px solid #333;text-align:center">&nbsp;</span>') + '</p>'
            + '</div>'
            + saveBar("date", "दिनांक एवं स्थान")
            + '</div>';

          document.getElementById("applicationOut").innerHTML = html;
          document.querySelectorAll("#applicationOut [data-f]").forEach(function(el){
            if(S.f[el.dataset.f] !== undefined) el.value = S.f[el.dataset.f];
          });

          let dl = document.getElementById("cropOptions");
          if(!dl){
            dl = document.createElement("datalist");
            dl.id = "cropOptions";
            document.body.appendChild(dl);
          }
          dl.innerHTML = ["गेहूँ","धान","मक्का","मंडुवा","झंगोरा","दालें","सब्जियाँ","आलू","टमाटर","मिर्च","फूल","सेब","नाशपाती","कीवी","अमरूद","आम","अखरोट","अन्य"]
            .map(function(x){ return '<option value="' + esc(x) + '">'; }).join("");
        }
        function buildApplication(){
          document.querySelector('[data-v="application"] .head').textContent = "वर्मी कम्पोस्ट आवेदन पत्र";
          document.getElementById("appLead").textContent = "वर्मी कम्पोस्ट इकाई निर्माण हेतु आवेदन पत्र।";
          buildVermiApplication();
        }

        /* ===================== Render: Affidavit ===================== */
        function buildVermiAffidavit(){
          const f = S.f || {};
          const name = esc(f.name||"…………"), father = esc(f.father||"…………"), village = esc(f.village||"…………"),
                post = esc(f.post||"…………"), tehsil = esc(f.tehsil||"…………"), dist = esc(f.dist||"…………"),
                horti = esc(f.hortiCard||"…………"), khasra = esc(f.khasra||"…………");
          const place = esc(f.place||"…………"), date = esc(f.date||"…………"), mob = esc(f.mob||"…………");

          document.getElementById("affidavitOut").innerHTML = 
            '<div class="appdoc" style="padding:34px 40px">'
            + '<h2 style="text-align:center">शपथ-पत्र</h2>'
            + '<h3 style="text-align:center">(वर्मी कम्पोस्ट यूनिट निर्माण हेतु)</h3>'
            + '<p>मैं <b>' + name + '</b> पुत्र / पुत्री / पत्नी श्री <b>' + father + '</b>, '
            + 'निवासी ग्राम <b>' + village + '</b> डाकघर <b>' + post + '</b>, '
            + 'तहसील <b>' + tehsil + '</b> जनपद <b>' + dist + '</b>, '
            + 'उद्यान कार्ड (कृषक पहचान) संख्या <b>' + horti + '</b></p>'
            + '<p>यह शपथपूर्वक कथन करता / करती हूँ कि—</p>'
            + '<p><b>1.</b> मेरा नाम, पता एवं अन्य व्यक्तिगत विवरण उपर्युक्त अनुसार पूर्णतः सत्य, सही एवं प्रमाणिक हैं।</p>'
            + '<p><b>2.</b> मेरे द्वारा राज्य सेक्टर योजनान्तर्गत <b>वर्मी कम्पोस्ट यूनिट निर्माण हेतु</b> उद्यान विभाग में विधिवत आवेदन किया गया है।</p>'
            + '<p><b>3.</b> जिस भूमि पर वर्मी कम्पोस्ट यूनिट का निर्माण किया गया है, वह भूमि मेरे वैधानिक स्वामित्व एवं वास्तविक कब्जे में है।</p>'
            + '<p>ग्राम : <b>' + village + '</b> &nbsp;&nbsp; खाता संख्या : <b>' + khasra + '</b></p>'
            + '<p><b>4.</b> मेरे द्वारा उक्त भूमि पर विभागीय मानकों के अनुसार <b>10 फीट × 8 फीट × 2.5 फीट आकार की पक्की वर्मी कम्पोस्ट यूनिट</b> का निर्माण किया गया है।</p>'
            + '<p><b>5.</b> उक्त वर्मी कम्पोस्ट यूनिट की प्रो-रेटा लागत <b>₹33,333/-</b>, देय 75 प्रतिशत राजसहायता <b>₹24,998/-</b> तथा कृषक का 25 प्रतिशत अंशदान <b>₹8,335/-</b> है।</p>'
            + '<p><b>6.</b> इससे पूर्व मेरे द्वारा उक्त यूनिट हेतु किसी अन्य सरकारी विभाग / संस्था / योजना / परियोजना से कोई सरकारी अनुदान, सहायता अथवा वित्तीय लाभ प्राप्त नहीं किया गया है।</p>'
            + '<p><b>7.</b> मेरे द्वारा प्रस्तुत समस्त दस्तावेज, भूमि अभिलेख, बैंक विवरण, बिल / वाउचर एवं अन्य जानकारी सत्य एवं सही है।</p>'
            + '<p><b>8.</b> यूनिट का निर्माण विभागीय तकनीकी मानकों एवं दिशा-निर्देशों के अनुरूप किया गया है। भिन्नता पाए जाने पर उसकी जिम्मेदारी मेरी होगी।</p>'
            + '<p><b>9.</b> यूनिट के रख-रखाव, सफाई, संचालन, केंचुओं की देखभाल एवं नमी बनाए रखने की जिम्मेदारी मेरी होगी।</p>'
            + '<p><b>10.</b> कोई जानकारी असत्य या भ्रामक पाए जाने पर विभाग को आवेदन / राजसहायता निरस्त करने तथा प्राप्त राशि की वसूली करने का अधिकार होगा।</p>'
            + '<p><b>11.</b> मैं योजना की निर्धारित शर्तों एवं विभागीय दिशा-निर्देशों से सहमत हूँ।</p>'
            + '<p>मैं यह शपथ-पत्र पूर्ण होश-हवास में, बिना किसी दबाव, प्रलोभन अथवा भय के, अपनी स्वेच्छा से सत्यनिष्ठा के साथ दे रहा / रही हूँ।</p>'
            + '<div style="margin-top:22px">स्थान : <b>' + place + '</b><br>दिनांक : <b>' + date + '</b></div>'
            + '<div style="margin-top:28px;text-align:right">शपथकर्ता के हस्ताक्षर : ____________________<br><br>'
            + 'नाम : <b>' + name + '</b><br><br>मोबाइल नं. : <b>' + mob + '</b></div>'
            + '</div>';
        }
        function buildAffidavit(){
          document.querySelector('[data-v="affidavit"] .head').textContent = "शपथ-पत्र";
          document.getElementById("affLead").textContent = "वर्मी कम्पोस्ट यूनिट निर्माण हेतु शपथ-पत्र।";
          buildVermiAffidavit();
        }

        /* ===================== Render: Bill ===================== */
        function buildVermiBill(){
          const c = calc();
          const stdCost = num(S.norm.vStdCost) || 33333;
          const rate = num(S.norm.vRate) || 75;
          let tbl = `<table><thead><tr><th style="width:10%">क्र०</th><th style="width:58%">कार्य / सामग्री</th><th class="num" style="width:32%">बिल राशि (₹)</th></tr></thead><tbody>`;
          c.rows.forEach((r,i)=>{ tbl += `<tr><td style="text-align:center">${i+1}</td><td>${esc(r.name)}</td><td class="num" id="r${i}a"></td></tr>`; });
          tbl += `</tbody><tfoot><tr><th colspan="2" class="num">योग</th><th class="num" id="tA">₹ 0.00</th></tr></tfoot></table>`;

          document.getElementById("billOut").innerHTML = 
            '<div class="appdoc" style="padding:34px 40px">'
            + '<h3 style="text-align:center;margin:0 0 2px">वर्मी कम्पोस्ट इकाई — राजसहायता देयक प्रपत्र</h3>'
            + '<h4 style="text-align:center;margin:0 0 18px">उद्यान विभाग · राज्य सेक्टर योजना · वित्तीय वर्ष 2026-27</h4>'

            + '<div class="st noprint">एम०बी० मूल्यांकन (भरें)</div>'
            + '<div class="grid2 noprint"><div class="field"><label>एम०बी० मूल्यांकन धनराशि (₹)</label><input data-f="mbAmt" inputmode="decimal" placeholder="उदा. 75000.00"></div></div>'
            + saveBar("mb", "एम०बी० मूल्यांकन")

            + '<div class="st">1. कृषक का विवरण</div>'
            + '<table><colgroup><col style="width:20%"><col style="width:30%"><col style="width:20%"><col style="width:30%"></colgroup><tbody>'
            +   '<tr><td>नाम कृषक</td><td>' + esc(S.f.name||"…………") + '</td><td>पिता / पति का नाम</td><td>' + esc(S.f.father||"…………") + '</td></tr>'
            +   '<tr><td>ग्राम</td><td>' + esc(S.f.village||"…………") + '</td><td>विकासखण्ड</td><td>' + esc(S.f.block||"…………") + '</td></tr>'
            +   '<tr><td>जनपद</td><td>' + esc(S.f.dist||"…………") + '</td><td>आधार संख्या</td><td>' + esc(S.f.aadhar||"…………") + '</td></tr>'
            +   '<tr><td>बैंक का नाम</td><td>' + esc(S.f.bank||"…………") + '</td><td>शाखा</td><td>' + esc(S.f.branch||"…………") + '</td></tr>'
            +   '<tr><td>खाता संख्या</td><td>' + esc(S.f.acct||"…………") + '</td><td>IFSC कोड</td><td>' + esc(S.f.ifsc||"…………") + '</td></tr>'
            + '</tbody></table>'
            + saveBar("bank", "बैंक विवरण")

            + '<div class="st">2. इकाई का विवरण</div>'
            + '<table><colgroup><col style="width:34%"><col style="width:66%"></colgroup><tbody>'
            +   '<tr><td>यूनिट का आकार</td><td>10 फीट × 8 फीट × 2.5 फीट (पक्की संरचना)</td></tr>'
            +   '<tr><td>मानक लागत</td><td>₹ ' + stdCost.toLocaleString("en-IN") + '</td></tr>'
            +   '<tr><td>राजसहायता दर</td><td>' + rate + '%</td></tr>'
            + '</tbody></table>'

            + '<div class="st">3. प्रस्तुत व्यय (बिल / वाउचर)</div>'
            + tbl

            + '<div class="st">4. राजसहायता की गणना — तीनों में से न्यूनतम</div>'
            + '<table class="summaryTbl"><colgroup><col style="width:62%"><col style="width:38%"></colgroup><tbody>'
            +   '<tr><td>बिल / वाउचर के अनुसार कुल व्यय</td><td class="sv" id="xBill">—</td></tr>'
            +   '<tr><td>एम०बी० मूल्यांकन धनराशि</td><td class="sv" id="xMb">—</td></tr>'
            +   '<tr><td>मानक लागत (10 फीट × 8 फीट × 2.5 फीट)</td><td class="sv" id="xStdCost">—</td></tr>'
            +   '<tr class="hi"><td>राजसहायता हेतु स्वीकार्य आधार — उपरोक्त में से न्यूनतम</td><td class="sv" id="xBase">—</td></tr>'
            +   '<tr><td>लागू राजसहायता दर</td><td class="sv" id="xRate">—</td></tr>'
            +   '<tr class="hi"><td>देय राजसहायता धनराशि</td><td class="sv big" id="xSub">—</td></tr>'
            +   '<tr><td>कृषक अंश (आधार × शेष दर — मानक अनुसार)</td><td class="sv" id="xShare">—</td></tr>'
            +   '<tr><td>मानक की अधिकतम अनुदान सीमा (मानक लागत × दर)</td><td class="sv" id="xMax">—</td></tr>'
            +   '<tr><td>मानक से कम हुई लागत (कमी के कारण)</td><td class="sv" id="xShort">—</td></tr>'
            +   '<tr><td>कृषक द्वारा वहन की गयी वास्तविक धनराशि (बिल − राजसहायता)</td><td class="sv" id="xOwn">—</td></tr>'
            + '</tbody></table>'

            + '<div class="note">'
            +   '<b>महत्वपूर्ण नोट — वर्मी कम्पोस्ट इकाई की गणना</b><br>'
            +   '• मानक लागत: एक इकाई (10 फीट × 8 फीट × 2.5 फीट) हेतु निर्धारित ₹' + stdCost.toLocaleString("en-IN") + '।<br>'
            +   '• देय आधार: बिल / वाउचर राशि, एम०बी० मूल्यांकन धनराशि एवं मानक लागत — इनमें से न्यूनतम राशि (<span id="xBase2">—</span>)।<br>'
            +   '• कृषक अंश: आधार राशि पर लागू शेष दर (' + (100-rate) + '%) के अनुसार।<br>'
            +   '• कृषक द्वारा वहन की गयी वास्तविक धनराशि: बिल राशि में से देय राजसहायता घटाकर।'
            + '</div>'

            + '<div style="margin-top:12px">संलग्न : बिल / वाउचर, एम०बी० (मापपुस्तिका), जियो टैग कलर फोटोग्राफ, कृषक का शपथ-पत्र आदि।</div>'

            + '<div class="st">5. कृषक का प्रमाणपत्र</div>'
            + '<div class="report-box">प्रमाणित किया जाता है कि मेरे द्वारा राज्य सेक्टर योजना अन्तर्गत वर्मी कम्पोस्ट इकाई के निर्माण पर उक्तानुसार धनराशि व्यय की गई है। अतः राजसहायता की धनराशि <b id="oSub1">—</b> (<span id="oWords1">…………</span>) का भुगतान मुझे करने की कृपा कीजिएगा।</div>'
            + '<div class="farmer-signature" style="display:flex;justify-content:space-between;gap:30px;margin-top:24px;line-height:1.8">'
            +   '<div>दिनांक : <b id="bill_date_disp">…………</b><br>स्थान : <b id="bill_place_disp">…………</b></div>'
            +   '<div style="text-align:right">हस्ताक्षर कृषक<br><br><b id="oName">…………</b></div>'
            + '</div>'
            + '<div class="grid2 noprint" style="margin-top:10px"><div class="field"><label>दिनांक</label><input type="date" data-f="date"></div><div class="field"><label>स्थान</label><input data-f="place"></div></div>'

            + '<div class="st">6. प्रभारी की आख्या एवं सत्यापन</div>'
            + '<div class="report-box">प्रमाणित किया जाता है कि मेरे द्वारा वर्मी कम्पोस्ट इकाई के निर्माण कार्य का स्थलीय निरीक्षण कर लिया गया है तथा इकाई विभागीय मानक (10 फीट × 8 फीट × 2.5 फीट) के अनुरूप पूर्ण पायी गयी। एम०बी० (मापपुस्तिका) के अनुसार कनिष्ठ अभियन्ता द्वारा तैयार मूल्यांकन धनराशि : <b id="xMbVerify">…………</b>। बिल में दर्शायी गयी कुल राशि : <b id="xBillVerify">…………</b>। बिल, एम०बी० एवं स्थलीय सत्यापन का मिलान करने के उपरान्त लागू आधार पर देय राजसहायता धनराशि <b id="xSubVerify">—</b> कृषक को भुगतान हेतु देयक सत्यापित कर संस्तुति सहित अग्रसारित।</div>'
            + '<div class="report-sign" style="margin-top:24px;text-align:right;line-height:1.8">हस्ताक्षर प्रभारी<br>…………</div>'
            + saveBar("date", "दिनांक एवं स्थान")
            + '</div>';
            
          document.querySelectorAll("#billOut [data-f]").forEach(el=>{ if(S.f[el.dataset.f]!==undefined) el.value = S.f[el.dataset.f]; });
          refresh();
        }
        function buildBill(){
          document.querySelector('[data-v="bill"] .head').textContent = "देयक प्रपत्र";
          document.getElementById("billLead").textContent = "वर्मी कम्पोस्ट इकाई — राजसहायता देयक प्रपत्र।";
          buildVermiBill();
        }

        /* ===================== Refresh ===================== */
        const set = (id,v) => { const el=document.getElementById(id); if(el) el.innerHTML=v; };
        function refresh(){
          const c = calc();
          c.rows.forEach((r,i)=>{ set("r"+i+"a",fmtN(r.amt)); });
          set("tA",fmtN(c.bill));
          set("xBill", c.bill?fmt0(c.bill):"—"); set("xMb", c.mb?fmt0(c.mb):"—");
          set("xStdCost", fmt0(c.standardCost));
          set("xBase",fmt0(c.base)); set("xRate",(c.rate*100).toFixed(0)+"%"); set("xSub",fmt0(c.sub));
          set("xShare",fmt0(c.base-c.sub)); set("xMax",fmt0(c.cap||24998)); set("xShort",fmt0(c.shortfall)); set("xOwn",c.bill>0?fmt0(c.own):"—");
          set("xBase2",fmt0(c.base)); 
          set("oSub1",fmt0(c.sub)); set("oWords1",words(c.sub)); set("oName",esc(S.f.name)||"…………");
          set("xMbVerify", c.mb ? fmt0(c.mb) : "…………");
          set("xBillVerify", c.bill > 0 ? fmt0(c.bill) : "…………");
          set("xSubVerify", fmt0(c.sub));
          set("bill_date_disp", esc(S.f.date||"…………"));
          set("bill_place_disp", esc(S.f.place||"…………"));
        }
        function refreshWorkTotals(){
          document.querySelectorAll("#workBody table").forEach(tb=>{
            const t = tb.querySelector("[data-tot]"); if(!t) return;
            const k = t.dataset.tot, cfg = COLS[k];
            tb.querySelectorAll("tbody tr").forEach((tr,i)=>{
              if(i<(S[k]||[]).length){ const cell=tr.querySelector("td.calc"); if(cell) cell.textContent=fmtN(cfg.amt(S[k][i])); }
            });
            t.textContent = fmtN(sum(k));
          });
          refresh();
        }

        function resetFill(){
          S = blank();
          setFormId("");
          clearSaveStates();
          refresh();
        }
        function showSub(v){
          subCur = v;
          if(cur !== "filling") return;
          clearPrintMarks();
          const fillingSection = root.querySelector('.view[data-v="filling"]');
          if(fillingSection){
            fillingSection.querySelectorAll(".view[data-v]").forEach(s=>{
              s.classList.toggle("on", s.dataset.v===v);
            });
          }
          root.querySelectorAll("#subnav a").forEach(a=>a.classList.toggle("on", a.dataset.go===v));
          if(v==="application") buildApplication();
          else if(v==="affidavit") buildAffidavit();
          else if(v==="work"){ buildWork(); refresh(); }
          else if(v==="bill") buildBill();
          window.scrollTo(0,0);
        }
        function showTab(tab){
          cur = tab;
          clearPrintMarks();
          root.querySelectorAll("main > .view").forEach(s=>{
            s.classList.toggle("on", s.dataset.v===tab);
          });
          root.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("on", a.dataset.tab===tab));
          if(tab==="register"){
            loadRegistrations();
            const subnav = document.getElementById("subnav");
            if(subnav) subnav.style.display = "none";
          } else if(tab==="filling"){
            const subnav = document.getElementById("subnav");
            if(subnav) subnav.style.display = "flex";
            if(fillLocked){ fillLocked = false; }
            else { resetFill(); }
            showSub(subCur || "application");
          }
          window.scrollTo(0,0);
        }

        function renderRegistrations(){
          const tb = document.getElementById("regRows");
          const cnt = document.getElementById("regCount");
          if(!tb) return;
          if(cnt) cnt.textContent = REG_ROWS.length ? ("("+REG_ROWS.length+")") : "";
          if(!REG_ROWS.length){
            tb.innerHTML = '<tr><td colspan="8" class="empty">कोई पंजीकृत कृषक नहीं</td></tr>';
            return;
          }
          tb.innerHTML = REG_ROWS.map((d,i)=>{
            const p = d.personal_details || {};
            const status = d.expense_details ? "व्यय भरा गया" : "केवल पंजीकरण";
            const fid = p.form_id || "";
            const active = fid && fid === FORM_ID;
            return `<tr class="${active?"sel":""}">
              <td class="n">${i+1}</td>
              <td><b>${esc(fid||"—")}</b></td>
              <td>${esc(p.full_name||"—")}</td>
              <td>${esc(p.mob||"—")}</td>
              <td>${esc(p.village||"—")}</td>
              <td>${esc(p.center_name||"—")}</td>
              <td><span class="pill ${status==="व्यय भरा गया"?"ok":"wait"}">${status}</span></td>
              <td class="act">
                <button type="button" class="mini ${active?"on":""}" data-open="${esc(fid)}" title="इस फॉर्म के विवरण प्रपत्र में खोलें">प्रपत्र भरें</button>
                <button type="button" class="mini danger" data-delform="${esc(fid)}" title="यह फॉर्म सर्वर से हटाएँ">हटाएँ</button>
              </td>
            </tr>`;
          }).join("");
        }
        async function loadRegistrations(){
          const tb = document.getElementById("regRows");
          if(tb) tb.innerHTML = '<tr><td colspan="8" class="empty">लोड हो रहा है…</td></tr>';
          try{
            const center = authCenterName() || "कोटद्वार";
            const url = API_VERMI + "?center_name=" + encodeURIComponent(center);
            const res = await apiFetch(url);
            const data = await readJsonResponse(res);
            if(!res.ok) throw new Error(apiErrorText(data, res));
            REG_ROWS = Array.isArray(data) ? data : (data && data.results ? data.results : []);
            renderRegistrations();
          }catch(err){
            REG_ROWS = [];
            renderRegistrations();
            apiMsg("सूची लोड नहीं हो सकी: " + (err && err.message ? err.message : "अज्ञात त्रुटि"), "bad");
          }
        }
        function findRecord(formId){
          return REG_ROWS.find(r => (r.personal_details||{}).form_id === formId) || null;
        }
        function applyRecord(rec){
          if(!rec) return;
          const p = rec.personal_details || rec;
          const exp = rec.expense_details || {};
          S.f.name = p.full_name || "";
          S.f.father = p.father_name || "";
          S.f.village = p.village || "";
          S.f.post = p.post || "";
          S.f.block = p.block || userData.block || "";
          S.f.dist = DISTRICT_NAME;
          S.f.mob = p.mob || "";
          S.f.aadhar = p.aadhar || "";
          S.f.khasra = p.khasra || "";
          S.f.gender = genderFromApi(p.gender);
          S.f.proposedArea = p.proposed_area || "";
          S.f.bank = p.bank_name || "";
          S.f.branch = p.branch || "";
          S.f.acct = p.account || "";
          S.f.ifsc = p.ifsc || "";
          S.f.place = p.place || "";
          S.f.date = p.date || new Date().toISOString().slice(0,10);
          S.f.hortiCard = p.horticulture_card || "";
          S.f.tehsil = p.tehsil || userData.tehsil || "";

          if(p.crop_details && p.crop_details.length){
            S.vcrops = p.crop_details.map(c => ({name: c[0], area: c[1]}));
          }
          if(exp && exp.vermi_expenses && exp.vermi_expenses.length){
            S.vermi = exp.vermi_expenses.map(e => ({item: e[0], amt: e[1]}));
          }
          if(exp){
            S.norm.vRate = exp.subsidy_rate || 75;
            S.norm.vStdCost = exp.standard_cost || 33333;
            S.norm.vCap = exp.maximum_subsidy || 24998;
          }
          const mbSources = [
            rec.mb_valuation_amount,
            rec.mb_details && rec.mb_details.mb_valuation_amount,
            exp.mb_valuation_amount,
            p.mb_valuation_amount
          ];
          const mbLoaded = mbSources.find(v => v !== null && v !== undefined && String(v).trim() !== "");
          S.f.mbAmt = mbLoaded === undefined ? "" : mbLoaded;
        }
        function openForm(formId){
          const rec = findRecord(formId);
          if(!rec){
            apiMsg("फॉर्म " + formId + " सूची में नहीं मिली।", "bad");
            return;
          }
          setFormId(formId);
          clearSaveStates();
          applyRecord(rec);
          fillLocked = true;
          showTab("filling");
          showSub("application");
          buildWork(); refresh();
          renderRegistrations();
          apiMsg("फॉर्म " + formId + " खोला गया — सर्वर से डेटा लोड हुआ।", "ok");
        }
        async function registerUser(ev){
          if(ev && ev.preventDefault) ev.preventDefault();
          const name = (document.getElementById("regName")||{}).value || "";
          const mob  = (document.getElementById("regMob")||{}).value  || "";
          const village = (document.getElementById("regVillage")||{}).value || "";
          const center = authCenterName() || "कोटद्वार";
          if(!name.trim()){ apiMsg("कृषक का नाम भरना अनिवार्य है।","bad"); return; }
          if(!/^\d{10}$/.test(mob.trim())){ apiMsg("10 अंक का सही मोबाइल नंबर भरें।","bad"); return; }
          const btn = document.querySelector('#regForm button[type="submit"]');
          if(btn) btn.disabled = true;
          try{
            const payload = {
              full_name: name.trim(),
              mob: mob.trim(),
              village: village.trim(),
              center_name: center,
              scheme_name: "वर्मी कम्पोस्ट",
              father_name: "",
              post: "",
              tehsil: userData.tehsil || "",
              block: userData.block || "",
              dist: DISTRICT_NAME,
              horticulture_card: "",
              aadhar: "",
              khasra: "",
              gender: "",
              proposed_area: "",
              crop_details: [],
              bank_name: "",
              branch: "",
              account: "",
              ifsc: "",
              place: "",
              date: new Date().toISOString().slice(0,10)
            };
            const res = await apiFetch(API_VERMI, {
              method:"POST",
              headers:{ "Content-Type":"application/json" },
              body: JSON.stringify(payload)
            });
            const data = await readJsonResponse(res);
            if(!res.ok) throw new Error(apiErrorText(data, res));
            const newId = data.form_id || (data.personal_details && data.personal_details.form_id) || "";
            if(!newId) throw new Error("सर्वर से फॉर्म आईडी नहीं मिली।");
            await loadRegistrations();
            setFormId(newId);
            S.f.name = name.trim();
            S.f.mob = mob.trim();
            S.f.village = village.trim();
            fillLocked = true;
            showTab("filling");
            showSub("application");
            apiMsg("पंजीकरण सफल! फॉर्म आईडी: " + newId, "ok");
          }catch(err){
            apiMsg("पंजीकरण विफल: " + (err && err.message ? err.message : "अज्ञात त्रुटि"), "bad");
          }finally{
            if(btn) btn.disabled = false;
          }
        }

        document.addEventListener("input", e=>{
          const t = e.target;
          if(t.dataset && t.dataset.vc){
            const i = +t.dataset.vc, k = t.dataset.k;
            if(!S.vcrops) S.vcrops = [{}];
            if(!S.vcrops[i]) S.vcrops[i] = {};
            S.vcrops[i][k] = t.value;
            return;
          }
          if(t.dataset && t.dataset.f){
            S.f[t.dataset.f] = t.value;
            refresh();
            const activeView = cur==="filling" ? subCur : cur;
            if(activeView==="application"){
              const fn = document.getElementById("app_farmer_name");
              if(fn) fn.textContent = S.f.name || "…………";
            }
            return;
          }
          if(t.dataset && t.dataset.row){
            S[t.dataset.row][+t.dataset.i][t.dataset.k] = t.value;
            refreshWorkTotals();
          }
        });

        document.addEventListener("change", e=>{
          const t = e.target;
          if(t.dataset && t.dataset.f){
            S.f[t.dataset.f] = t.value;
            const activeView = cur==="filling" ? subCur : cur;
            if(t.dataset.f === "gender"){
              if(activeView==="application") buildVermiApplication();
              if(activeView==="affidavit") buildVermiAffidavit();
            }
            refresh();
            return;
          }
          const listId = t.getAttribute && t.getAttribute("list");
          if(listId && DL[listId] && t.value.trim() && !S.lists[DL[listId]].includes(t.value.trim())){
            S.lists[DL[listId]].push(t.value.trim());
            buildLists();
          }
        });

        document.addEventListener("click", e=>{
          const b = e.target.closest("[data-add],[data-del],[data-go],[data-tab],[data-save],[data-open],[data-delform],#addCropBtn,[data-vcdel],#regRefresh");
          if(!b) return;
          if(b.id === "addCropBtn"){
            if(!S.vcrops) S.vcrops = [];
            S.vcrops.push({name:"",area:""});
            buildApplication();
            return;
          }
          if(b.dataset.vcdel !== undefined){
            const i = +b.dataset.vcdel;
            if(S.vcrops && i < S.vcrops.length){
              S.vcrops.splice(i,1);
              buildApplication();
            }
            return;
          }
          if(b.dataset.add){
            S[b.dataset.add].push({item:"", amt:""});
            buildWork();
            refresh();
          } else if(b.dataset.del){
            const k = b.dataset.del;
            S[k].splice(+b.dataset.i, 1);
            if(!S[k].length) S[k].push({item:"", amt:""});
            buildWork();
            refresh();
          } else if(b.dataset.go){
            showSub(b.dataset.go);
          } else if(b.dataset.tab){
            showTab(b.dataset.tab);
          } else if(b.id === "regRefresh"){
            loadRegistrations();
          } else if(b.dataset.save !== undefined){
            saveStep(b.dataset.save);
          } else if(b.dataset.open !== undefined){
            openForm(b.dataset.open);
          } else if(b.dataset.delform !== undefined){
            requestDeleteForm(b.dataset.delform, b);
          }
        });

        function clearPrintMarks(){
          if(!root) return;
          root.querySelectorAll(".view").forEach(v=>v.classList.remove("print-target","has-print-target"));
        }
        function markPrintTarget(target){
          /* `.view` छुपा देता है (CSS) — इसलिए पूरी ancestor chain पर
             has-print-target लगाना ज़रूरी, वरना प्रिंट खाली आता है। */
          clearPrintMarks();
          if(!target) return;
          target.classList.add("print-target");
          let p = target.parentElement;
          while(p && p !== root){
            if(p.classList && p.classList.contains("view")) p.classList.add("has-print-target");
            p = p.parentElement;
          }
        }
        function markForPrint(){
          let target;
          if(cur === "filling"){
            const fillingSection = root.querySelector('.view[data-v="filling"]');
            target = fillingSection ? fillingSection.querySelector('.view[data-v="'+subCur+'"]') : null;
          } else {
            target = root.querySelector('.view[data-v="'+cur+'"]');
          }
          if(target) markPrintTarget(target);
        }
        function printCurrent(){
          markForPrint();
          window.print();
        }
        const onBeforePrint = ()=>{ closePreview(); markForPrint(); };
        window.addEventListener("beforeprint", onBeforePrint);
        window.addEventListener("afterprint", clearPrintMarks);
        printCleanupRef.fn = ()=>{
          window.removeEventListener("beforeprint", onBeforePrint);
          window.removeEventListener("afterprint", clearPrintMarks);
        };
        const PV_TITLES = {application:"आवेदन पत्र", affidavit:"शपथ-पत्र", work:"व्यय विवरण", bill:"देयक प्रपत्र", register:"उपयोगकर्ता पंजीकरण"};
        function openPreview(){
          const overlay = document.getElementById("pvOverlay");
          const body = document.getElementById("pvBody");
          let target;
          if(cur === "filling"){
            const fillingSection = root.querySelector('.view[data-v="filling"]');
            target = fillingSection ? fillingSection.querySelector('.view[data-v="'+subCur+'"]') : null;
          } else {
            target = root.querySelector('.view[data-v="'+cur+'"]');
          }
          if(!overlay || !body || !target) return;
          const activeView = cur==="filling" ? subCur : cur;
          document.getElementById("pvTitle").textContent = "प्रिंट पूर्वावलोकन — " + (PV_TITLES[activeView] || "प्रपत्र");
          body.innerHTML = "";
          const sheet = document.createElement("div");
          sheet.className = "pv-sheet";
          const clone = target.cloneNode(true);
          clone.classList.add("on");
          const liveFields = target.querySelectorAll("input,select,textarea");
          const cloneFields = clone.querySelectorAll("input,select,textarea");
          for(let i=0; i<liveFields.length; i++){
            const cf = cloneFields[i];
            if(!cf) break;
            if(cf.type === "checkbox" || cf.type === "radio") cf.checked = liveFields[i].checked;
            else cf.value = liveFields[i].value;
          }
          sheet.appendChild(clone);
          body.appendChild(sheet);
          overlay.hidden = false;
          overlay.scrollTop = 0;
        }
        function closePreview(){
          const overlay = document.getElementById("pvOverlay");
          if(!overlay) return;
          overlay.hidden = true;
          const body = document.getElementById("pvBody");
          if(body) body.innerHTML = "";
        }

        centerStore.onChange = () => {
          if(cur === "filling" && subCur === "application") buildVermiApplication();
        };

        toggleStrip();
        showTab("register");
        const bGo = document.getElementById("bGo");
        if (bGo) bGo.onclick = ()=>{ showTab("filling"); showSub("bill"); };
        const regFormEl = document.getElementById("regForm");
        if (regFormEl) regFormEl.addEventListener("submit", registerUser);
        const regRefreshEl = document.getElementById("regRefresh");
        if (regRefreshEl) regRefreshEl.onclick = ()=>loadRegistrations();
        const onSaveAll = document.getElementById("btnSaveAll");
        if (onSaveAll) onSaveAll.onclick = ()=>saveAllSteps();
        const bPreviewEl = document.getElementById("bPreview");
        if (bPreviewEl) bPreviewEl.onclick = openPreview;
        const pvCloseEl = document.getElementById("pvClose");
        if (pvCloseEl) pvCloseEl.onclick = closePreview;
        const pvPrintEl = document.getElementById("pvPrint");
        if (pvPrintEl) pvPrintEl.onclick = ()=>{ closePreview(); printCurrent(); };
        const pvOverlayEl = document.getElementById("pvOverlay");
        if (pvOverlayEl) pvOverlayEl.addEventListener("click", e=>{ if(e.target === e.currentTarget) closePreview(); });
        document.addEventListener("keydown", e=>{ if(e.key === "Escape") closePreview(); });
      })();
    } catch (error) {
      console.error("Kisan Aavedan Portal initialization failed:", error);
      const target = root.querySelector("main") || root;
      const box = document.createElement("div");
      box.style.cssText = "margin:20px;padding:14px;border:1px solid #d8b4b4;background:#fff5f5;color:#7f1d1d;font-family:Segoe UI,sans-serif;";
      box.innerHTML = "<b>पोर्टल लोड नहीं हो सका।</b><br/>" +
        "<pre style='white-space:pre-wrap;margin-top:8px;font-size:12px'>" +
        (error && error.message ? error.message : "अज्ञात त्रुटि") +
        "</pre><br/>कृपया browser console में error देखें।";
      target.prepend(box);
    }

    return () => {
      window.removeEventListener("resize", syncAppNav);
      window.removeEventListener("load", syncAppNav);
      window.clearTimeout(navSyncTimer);
      if (printCleanupRef.fn) printCleanupRef.fn();
      centerStore.onChange = null;
      root.innerHTML = "";
    };
  }, []);

  const centerSyncRef = useRef(false);
  useEffect(() => {
    const el = rootRef.current && rootRef.current.querySelector("#regCenter");
    if (!el) return;
    const value = (centerName || "").trim();
    centerStore.value = value;
    el.value = value || "— लॉग इन केंद्र नहीं मिला —";
    el.title = value ? ("लॉग इन केंद्र: " + value) : "लॉग इन केंद्र नहीं मिला";
    if (!centerSyncRef.current) { centerSyncRef.current = true; return; }
    if (centerStore.onChange) centerStore.onChange();
    const btn = document.getElementById("regRefresh");
    if (btn) btn.click();
  }, [centerName]);

  return <div ref={rootRef} className="kisan-html-react-root" />;
}