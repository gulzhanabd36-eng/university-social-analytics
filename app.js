var CFG = {};

// ═══════════════════════════════════════════════
// 2GIS UNIVERSITY DATABASE (auto-lookup by name)
// ═══════════════════════════════════════════════
var UNI_2GIS_DB = [
  {
    keywords: ["almau", "almaty management", "\u0430\u043b\u043c\u0430\u044e", "\u0430\u043b\u044c\u043c\u0430\u044e"],
    name: "AlmaU",
    branches: [
      { label: "\u0410\u043b\u043c\u0430\u0442\u044b — \u0420\u043e\u0437\u044b\u0431\u0430\u043a\u0438\u0435\u0432\u0430 227", url: "https://2gis.kz/almaty/firm/9429940000927160" },
      { label: "\u0410\u0442\u044b\u0440\u0430\u0443", url: "https://2gis.kz/atyrau/firm/70000001035051272" }
    ]
  },
  {
    keywords: ["narxoz", "\u043d\u0430\u0440\u0445\u043e\u0437", "\u043d\u0430\u0440\u0445\u043e\u0437"],
    name: "Narxoz",
    branches: [
      { label: "\u0413\u043b\u0430\u0432\u043d\u044b\u0439 \u043a\u043e\u0440\u043f\u0443\u0441 — \u0416\u0430\u043d\u0434\u043e\u0441\u043e\u0432\u0430 55", url: "https://2gis.kz/almaty/firm/9429940000796151" },
      { label: "2-\u0439 \u043a\u043e\u0440\u043f\u0443\u0441 — 1-\u0439 \u043c\u043a\u0440", url: "https://2gis.kz/almaty/firm/70000001024926051" },
      { label: "Narxoz Business School", url: "https://2gis.kz/almaty/firm/9429940001143920" }
    ]
  },
  {
    keywords: ["kaznu", "\u043a\u0430\u0437\u043d\u0443", "\u0430\u043b\u044c-\u0444\u0430\u0440\u0430\u0431\u0438", "al-farabi"],
    name: "KazNU",
    branches: [
      { label: "\u0413\u043b\u0430\u0432\u043d\u044b\u0439 \u043a\u0430\u043c\u043f\u0443\u0441", url: "https://2gis.kz/almaty/firm/9429940000928527" }
    ]
  },
  {
    keywords: ["kbtu", "\u043a\u0431\u0442\u0443", "british technical"],
    name: "KBTU",
    branches: [
      { label: "\u0413\u043b\u0430\u0432\u043d\u044b\u0439 \u043a\u0430\u043c\u043f\u0443\u0441", url: "https://2gis.kz/almaty/firm/9429940000927993" }
    ]
  },
  {
    keywords: ["iab", "uib", "\u043c\u0435\u0436\u0434\u0443\u043d\u0430\u0440\u043e\u0434\u043d\u044b\u0439 \u0431\u0438\u0437\u043d\u0435\u0441", "international business"],
    name: "UIB",
    branches: [
      { label: "\u0413\u043b\u0430\u0432\u043d\u044b\u0439 \u043a\u0430\u043c\u043f\u0443\u0441", url: "https://2gis.kz/almaty/firm/9429940000928031" }
    ]
  },
  {
    keywords: ["turan", "\u0442\u0443\u0440\u0430\u043d"],
    name: "Turan",
    branches: [
      { label: "\u0410\u043b\u043c\u0430\u0442\u044b", url: "https://2gis.kz/almaty/firm/9429940000928165" }
    ]
  }
];

function detectUni2GIS(name) {
  if (!name) return null;
  var t = name.toLowerCase();
  for (var i = 0; i < UNI_2GIS_DB.length; i++) {
    var uni = UNI_2GIS_DB[i];
    for (var k = 0; k < uni.keywords.length; k++) {
      if (t.indexOf(uni.keywords[k]) >= 0) return uni;
    }
  }
  return null;
}

var isLoading = false;

window.onload = function() {
  var s = localStorage.getItem("uni_cfg_v4");
  if (s) {
    try {
      var c = JSON.parse(s);
      if (c.name) document.getElementById("uniName").value = c.name;
      if (c.abbr) document.getElementById("uniAbbr").value = c.abbr;
      if (c.ig) document.getElementById("igHandle").value = c.ig;
      if (c.tt) document.getElementById("ttHandle").value = c.tt;
      if (c.location && document.getElementById("uniLocation")) document.getElementById("uniLocation").value = c.location;
      if (c.gis2 && document.getElementById("gis2Url")) document.getElementById("gis2Url").value = c.gis2;
    } catch(e) {}
  }
};

function openSettings() {
  document.getElementById("setupOverlay").style.display = "flex";
}

function startDashboard() {
  var name = document.getElementById("uniName").value.trim();
  var abbr = document.getElementById("uniAbbr").value.trim();
  var ig = document.getElementById("igHandle").value.trim().replace(/^@+/, "").trim();
  var tt = document.getElementById("ttHandle").value.trim().replace(/^#+/, "").trim();
  var loc = document.getElementById("uniLocation") ? document.getElementById("uniLocation").value.trim() : "";
  var token = document.getElementById("apifyToken").value.trim();
  if (!name) { alert("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0443\u043d\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u0430"); return; }
  if (!token) { alert("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 Apify API Token"); return; }
  if (!ig && !tt) { alert("\u0423\u043a\u0430\u0436\u0438\u0442\u0435 \u0445\u043e\u0442\u044f \u0431\u044b \u043e\u0434\u0438\u043d \u0430\u043a\u043a\u0430\u0443\u043d\u0442 \u0438\u043b\u0438 \u0445\u044d\u0448\u0442\u0435\u0433"); return; }
  var gis2 = (document.getElementById("gis2Url")||{value:""}).value.trim();
  CFG = {name: name, abbr: abbr || name.charAt(0), ig: ig, tt: tt, token: token, location: loc, gis2: gis2};
  localStorage.setItem("uni_cfg_v4", JSON.stringify({name: name, abbr: CFG.abbr, ig: ig, tt: tt, location: loc, gis2: gis2}));
  (function(){var _el=document.getElementById("headerTitle");if(_el)_el.textContent=name + " \u2014 Analytics";})();
  (function(){var _el=document.getElementById("headerAbbr");if(_el)_el.textContent=CFG.abbr.charAt(0).toUpperCase();})();
  var _ab=document.getElementById("genAbbrBig");if(_ab)_ab.textContent=CFG.abbr.charAt(0).toUpperCase();
  (function(){var _el=document.getElementById("genFullName");if(_el)_el.textContent=name;})();
  (function(){var _el=document.getElementById("genIG");if(_el)_el.textContent=ig ? "@" + ig : "\u2014";})();
  (function(){var _el=document.getElementById("genTT");if(_el)_el.textContent=tt ? "#" + tt : "\u2014";})();
  (function(){var _el=document.getElementById("igStatHandle");if(_el)_el.textContent=ig ? "@" + ig : "\u2014";})();
  (function(){var _el=document.getElementById("ttStatHandle");if(_el)_el.textContent=tt ? "#" + tt : "\u2014";})();
  document.getElementById("setupOverlay").style.display = "none";
  document.getElementById("app").style.display = "block";
  realRefresh();
}

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
function fmtNum(n) { n = Number(n) || 0; if (n >= 1000000) return (n/1000000).toFixed(1) + "M"; if (n >= 1000) return (n/1000).toFixed(1) + "K"; return String(n); }
function parseTs(ts) { if (!ts) return null; if (typeof ts === "number") return ts > 2e10 ? new Date(ts) : new Date(ts*1000); return new Date(ts); }
function fmtDate(ts) { var d = parseTs(ts); if (!d || isNaN(d)) return "\u2014"; return d.toLocaleDateString("ru", {day:"numeric",month:"long",year:"numeric"}); }
function isNew(ts, lv) { if (!ts) return false; var d = parseTs(ts); if (!d || isNaN(d)) return false; return d > new Date(lv); }
function is2026(ts) { if (!ts) return false; var d = parseTs(ts); if (!d || isNaN(d)) return false; return d.getFullYear() === 2026; }
function sentiment(t) {
  if (!t) return "neu"; t = t.toLowerCase();
  var p = ["\u043f\u043e\u0431\u0435\u0434","\u043b\u0443\u0447\u0448","\u0434\u043e\u0441\u0442\u0438\u0436","\u043e\u0442\u043b\u0438\u0447","\u043f\u043e\u0437\u0434\u0440\u0430\u0432","\u0443\u0441\u043f\u0435\u0445","\u043d\u0430\u0433\u0440\u0430\u0434","\u043f\u0435\u0440\u0432","\u0440\u0435\u043a\u043e\u0440\u0434","\u0437\u043e\u043b\u043e\u0442","\u043b\u0438\u0434\u0435\u0440","winner","award","best","top","ranked"];
  var n = ["\u0441\u043a\u0430\u043d\u0434\u0430\u043b","\u043f\u0440\u043e\u0432\u0430\u043b","\u043f\u043b\u043e\u0445","\u0443\u0436\u0430\u0441","\u043f\u0440\u043e\u0431\u043b\u0435\u043c","\u0436\u0430\u043b\u043e\u0431","\u043e\u0448\u0438\u0431\u043a","\u0448\u0442\u0440\u0430\u0444","scandal","fail","problem"];
  if (p.some(function(w) { return t.indexOf(w) >= 0; })) return "pos";
  if (n.some(function(w) { return t.indexOf(w) >= 0; })) return "neg";
  return "neu";
}
function sLbl(s) { return {pos:"\u043f\u043e\u0437\u0438\u0442\u0438\u0432",neg:"\u043d\u0435\u0433\u0430\u0442\u0438\u0432",neu:"\u043d\u0435\u0439\u0442\u0440\u0430\u043b\u044c\u043d\u043e"}[s] || "\u043d\u0435\u0439\u0442\u0440\u0430\u043b\u044c\u043d\u043e"; }
function sCls(s) { return {pos:"b-pos",neg:"b-neg",neu:"b-neu"}[s] || "b-neu"; }

var IG_CATS = [
  {id:"study",    emoji:"\u{1F393}", label:"\u0423\u0447\u0451\u0431\u0430",
   words:["\u0441\u0442\u0443\u0434\u0435\u043d\u0442","\u043e\u0431\u0443\u0447\u0435\u043d","\u043a\u0443\u0440\u0441","\u043b\u0435\u043a\u0446\u0438\u044f","\u0434\u0438\u043f\u043b\u043e\u043c","\u043c\u0430\u0433\u0438\u0441\u0442\u0440","\u0431\u0430\u043a\u0430\u043b\u0430\u0432\u0440","\u044d\u043a\u0437\u0430\u043c\u0435\u043d","\u0444\u0430\u043a\u0443\u043b\u044c\u0442\u0435\u0442","\u043d\u0430\u0443\u043a\u0430","\u0441\u0442\u0430\u0436\u0438\u0440\u043e\u0432\u043a\u0430","mba","oqu","\u0431\u0456\u043b\u0456\u043c"]},
  {id:"achieve",  emoji:"\u{1F3C6}", label:"\u0414\u043e\u0441\u0442\u0438\u0436\u0435\u043d\u0438\u044f",
   words:["\u043f\u043e\u0431\u0435\u0434","\u043d\u0430\u0433\u0440\u0430\u0434","\u0440\u0435\u0439\u0442\u0438\u043d\u0433","\u043f\u0435\u0440\u0432\u043e\u0435","\u0440\u0435\u043a\u043e\u0440\u0434","\u0437\u043e\u043b\u043e\u0442\u043e","winner","award","best","top","ranked","\u0430\u043a\u043a\u0440\u0435\u0434\u0438\u0442\u0430\u0446\u0438\u044f","qs","\u0432\u044b\u043f\u0443\u0441\u043a\u043d\u0438\u043a","\u0436\u0435\u04a3\u0456\u0441"]},
  {id:"event",    emoji:"\u{1F389}", label:"\u041c\u0435\u0440\u043e\u043f\u0440\u0438\u044f\u0442\u0438\u044f",
   words:["\u043a\u043e\u043d\u0444\u0435\u0440\u0435\u043d\u0446\u0438\u044f","\u0444\u043e\u0440\u0443\u043c","\u0446\u0435\u0440\u0435\u043c\u043e\u043d\u0438\u044f","\u043f\u0440\u0430\u0437\u0434\u043d\u0438\u043a","\u0432\u044b\u0441\u0442\u0430\u0432\u043a\u0430","\u043e\u0442\u043a\u0440\u044b\u0442\u0438\u0435","\u0444\u0435\u0441\u0442\u0438\u0432\u0430\u043b","\u044f\u0440\u043c\u0430\u0440\u043a\u0430","\u0441\u0430\u043c\u043c\u0438\u0442","\u0432\u0435\u0431\u0438\u043d\u0430\u0440","event","\u043c\u0435\u0440\u0435\u043a\u0435"]},
  {id:"admission",emoji:"\u{1F4E2}", label:"\u041f\u043e\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u0435",
   words:["\u0430\u0431\u0438\u0442\u0443\u0440\u0438\u0435\u043d\u0442","\u043f\u043e\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u0435","\u0433\u0440\u0430\u043d\u0442","\u0431\u0430\u043b\u043b","\u043f\u0440\u0438\u0435\u043c","\u0435\u043d\u0442","\u0443\u0431\u0442","\u043f\u0440\u043e\u0445\u043e\u0434\u043d\u043e\u0439","\u049b\u0430\u0431\u044b\u043b\u0434\u0430\u0443"]},
  {id:"partner",  emoji:"\u{1F91D}", label:"\u041f\u0430\u0440\u0442\u043d\u0451\u0440\u0441\u0442\u0432\u043e",
   words:["\u0441\u043e\u0442\u0440\u0443\u0434\u043d\u0438\u0447\u0435\u0441\u0442\u0432","\u043f\u0430\u0440\u0442\u043d\u0451\u0440","\u043c\u0435\u043c\u043e\u0440\u0430\u043d\u0434\u0443\u043c","\u0441\u043e\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435","\u0432\u0438\u0437\u0438\u0442","\u0434\u0435\u043b\u0435\u0433\u0430\u0446\u0438\u044f","mou"]},
  {id:"life",     emoji:"\u{1F30D}", label:"\u0421\u0442\u0443\u0434\u0436\u0438\u0437\u043d\u044c",
   words:["\u043a\u043b\u0443\u0431","\u0432\u043e\u043b\u043e\u043d\u0442\u0451\u0440","\u0441\u043f\u043e\u0440\u0442","\u043a\u043e\u043c\u0430\u043d\u0434\u0430","\u043a\u0443\u043b\u044c\u0442\u0443\u0440\u0430","\u0430\u043a\u0442\u0438\u0432\u0438\u0441\u0442","\u043a\u0430\u043c\u043f\u0443\u0441","\u043e\u0431\u0449\u0435\u0436\u0438\u0442\u0438\u0435","\u0436\u0430\u0441\u0442\u0430\u0440"]}
];
function categorize(text) {
  if (!text) return "other";
  var t = text.toLowerCase();
  for (var i = 0; i < IG_CATS.length; i++) {
    for (var j = 0; j < IG_CATS[i].words.length; j++) {
      if (t.indexOf(IG_CATS[i].words[j]) >= 0) return IG_CATS[i].id;
    }
  }
  return "other";
}
function catInfo(id) {
  for (var i = 0; i < IG_CATS.length; i++) { if (IG_CATS[i].id === id) return IG_CATS[i]; }
  return {id:"other", emoji:"\u{1F4CC}", label:"\u0420\u0430\u0437\u043d\u043e\u0435"};
}
var _igAllPosts = [], _igLv = "", _igLd = "";
function setIgFilter(catId) {
  _igActiveCat = catId;
  _renderIgCards();
}
var _igActiveCat = "all";

function sepNew(l) { return "<div class=\"date-sep\"><div class=\"date-sep-line\"></div><div class=\"date-sep-text new-block\">" + l + "</div><div class=\"date-sep-line\"></div></div>"; }
function sepOld(l) { return "<div class=\"date-sep\"><div class=\"date-sep-line\"></div><div class=\"date-sep-text old-block\">" + l + "</div><div class=\"date-sep-line\"></div></div>"; }
function emptyState(m, i, s) { return "<div class=\"empty-state\"><div class=\"es-icon\">" + i + "</div><div class=\"es-text\">" + m + "</div>" + (s ? "<div class=\"es-sub\">" + s + "</div>" : "") + "</div>"; }
function setStep(id, st) { var el = document.getElementById("step-" + id); if (el) el.className = "step " + st; }
function showLoading(m) {
  document.getElementById("loadingBar").classList.remove("hidden");
  document.getElementById("refreshIcon").style.animation = "spin 1s linear infinite";
  document.querySelector(".refresh-btn").disabled = true;
  (function(){var _el=document.getElementById("loadingText");if(_el)_el.textContent=m;})();
  document.getElementById("errorBar").style.display = "none";
}
function hideLoading() {
  document.getElementById("loadingBar").classList.add("hidden");
  document.getElementById("refreshIcon").style.animation = "";
  document.querySelector(".refresh-btn").disabled = false;
}
function showError(m) { var el = document.getElementById("errorBar"); el.textContent = "\u274C " + m; el.style.display = "block"; }

async function apifyRun(actorId, input, stepId, label) {
  setStep(stepId, "active");
  (function(){var _el=document.getElementById("loadingText");if(_el)_el.textContent=label + " \u2014 \u0437\u0430\u043f\u0443\u0441\u043a\u0430\u0435\u043c...";})();
  var r = await fetch("/.netlify/functions/apify-start", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({actorId: actorId, input: input, token: CFG.token})
  });
  var sd;
  try { sd = await r.json(); } catch(e) { throw new Error(label + ": \u043d\u0435\u0432\u0435\u0440\u043d\u044b\u0439 \u043e\u0442\u0432\u0435\u0442"); }
  if (!r.ok || sd.error) throw new Error(label + ": " + (sd.error || sd.detail || r.status));
  var runId = sd.runId;
  for (var i = 0; i < 180; i++) {
    await sleep(5000);
    (function(){var _el=document.getElementById("loadingText");if(_el)_el.textContent=label + " \u2014 " + ((i+1)*5) + "\u0441...";})();
    var pr = await fetch("/.netlify/functions/apify-poll", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({runId: runId, token: CFG.token, getItems: true})
    });
    var pd;
    try { pd = await pr.json(); } catch(e) { continue; }
    if (pd.status === "SUCCEEDED") { setStep(stepId, "done"); return pd.items || []; }
    if (["FAILED","ABORTED","TIMED-OUT"].indexOf(pd.status) >= 0) throw new Error(label + ": \u0430\u043a\u0442\u043e\u0440 " + pd.status);
  }
  throw new Error(label + ": timeout 15 \u043c\u0438\u043d");
}


async function cacheRead(table, handle) {
  try {
    var r = await fetch("/.netlify/functions/supabase-cache", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({action: "read", table: table, handle: handle})
    });
    if (!r.ok) return null;
    return await r.json(); // {fresh, items, saved_at}
  } catch(e) { return null; }
}
async function cacheWrite(table, handle, items) {
  try {
    await fetch("/.netlify/functions/supabase-cache", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({action: "write", table: table, handle: handle, items: items})
    });
  } catch(e) { /* silent */ }
}


async function supaRead(table, handle) {
  try {
    var r = await fetch("/.netlify/functions/supabase-read", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({table: table, handle: handle})
    });
    if (!r.ok) return null;
    return await r.json(); // {items, count}
  } catch(e) { return null; }
}


// Phase 1: Accumulation helper
async function accFetch(action, handle, items) {
  try {
    var payload = {action: action, handle: handle};
    if (items) payload.items = items;
    var r = await fetch("/.netlify/functions/supabase-accumulate", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });
    if (!r.ok) return null;
    return await r.json();
  } catch(e) { console.warn("accFetch error:", e); return null; }
}
function setIgBadge(text) {
  var el = document.getElementById("ig-acc-badge");
  if (el) { el.style.display = "block"; el.textContent = text; }
}

async function realRefresh() {
  if (isLoading) return;
  if (!CFG.token) { openSettings(); return; }
  isLoading = true;
  var lastKey = "lv_" + (CFG.ig || CFG.tt || CFG.name).replace(/[^a-z0-9]/gi, "_").toLowerCase();
  var lastVisit = localStorage.getItem(lastKey) || "2025-12-31T23:59:59Z";
  var lastDisp = fmtDate(lastVisit);
  setStep("ig", ""); setStep("tt", ""); setStep("web", "");
  showLoading("\u041f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043a\u0430...");
  try {
    if (CFG.ig) {
      var igHandle = CFG.ig.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/^\/+|\/+$/g, "").replace(/^@/, "").trim();

      // ── Step 1: Load existing accumulation from Supabase ──
      setIgBadge("\u23F3 \u0427\u0438\u0442\u0430\u0435\u043c \u0431\u0430\u0437\u0443...");
      var igAcc = await accFetch("read", igHandle, null);
      var igAllItems = (igAcc && igAcc.items && igAcc.items.length) ? igAcc.items : [];

      // ── Step 2: Show existing posts immediately (fast render) ──
      if (igAllItems.length > 0) {
        setStep("ig", "done");
        setIgBadge("\uD83D\uDCE6 \u0411\u0430\u0437\u0430: " + igAllItems.length + " \u043f\u043e\u0441\u0442\u043e\u0432 \u2014 \u0438\u0449\u0435\u043c \u043d\u043e\u0432\u044b\u0435...");
        document.getElementById("loadingText").textContent = "\uD83D\uDCF8 Instagram \u2014 " + igAllItems.length + " \u043f\u043e\u0441\u0442\u043e\u0432 \u0432 \u0431\u0430\u0437\u0435, \u0438\u0449\u0435\u043c \u043d\u043e\u0432\u044b\u0435...";
        renderIG(igAllItems, lastVisit, lastDisp);
        var _igp1 = document.getElementById("gen-ig-posts"); if(_igp1) _igp1.textContent = igAllItems.length;
        updateGenProfile(igAllItems, null, null);
        if (typeof _syncGenSummary === "function") _syncGenSummary();
      }

      // ── Step 3: Get latest timestamp for incremental fetch ──
      var igLatestTs = null;
      if (igAllItems.length > 0) {
        var igLatResp = await accFetch("latest", igHandle, null);
        if (igLatResp && igLatResp.timestamp) igLatestTs = igLatResp.timestamp;
      }

      // ── Step 4: Fetch from Apify (1000 posts max) ──
      var igApifyInput = (function() {
        var inp = {
          directUrls: ["https://www.instagram.com/" + igHandle + "/"],
          resultsType: "posts",
          resultsLimit: 1000,
          addParentData: false
        };
        if (igLatestTs) inp.onlyPostsNewerThan = igLatestTs.substring(0, 10); // YYYY-MM-DD
        return inp;
      })();

      var igApifyLabel = igAllItems.length > 0
        ? "\uD83D\uDCF8 Instagram \u2014 \u043D\u043E\u0432\u044B\u0435 \u043F\u043E\u0441\u0442\u044B"
        : "\uD83D\uDCF8 Instagram \u2014 \u043F\u0435\u0440\u0432\u0438\u0447\u043D\u0430\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430";

      var igNew = await apifyRun("apify~instagram-scraper", igApifyInput, "ig", igApifyLabel);

      // ── Step 5: Upsert new posts to accumulation table ──
      if (igNew && igNew.length > 0) {
        setIgBadge("\uD83D\uDCBE \u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u043C " + igNew.length + " \u043D\u043E\u0432\u044B\u0445 \u043F\u043E\u0441\u0442\u043E\u0432...");
        await accFetch("upsert", igHandle, igNew);

        // Re-read full accumulation
        var igAccFull = await accFetch("read", igHandle, null);
        if (igAccFull && igAccFull.items && igAccFull.items.length) {
          igAllItems = igAccFull.items;
        } else {
          // Fallback: upsert may have failed (RLS?) — use Apify results directly
          igAllItems = igNew;
        }
        setIgBadge("\uD83D\uDCE6 \u0411\u0430\u0437\u0430: " + igAllItems.length + " \u043F\u043E\u0441\u0442\u043E\u0432 \u00B7 +" + igNew.length + " \u043D\u043E\u0432\u044B\u0445 \u00B7 " + new Date().toLocaleDateString("ru", {day:"2-digit", month:"2-digit", year:"numeric"}));
      } else if (igAllItems.length === 0) {
        // Apify returned nothing AND no DB data — try old caches as last resort
        var igDb = await supaRead("uni_ig_2026", CFG.ig);
        if (igDb && igDb.items && igDb.items.length) igAllItems = igDb.items;
        if (!igAllItems.length) {
          var igCacheFb = await cacheRead("uni_ig_posts", CFG.ig);
          if (igCacheFb && igCacheFb.items && igCacheFb.items.length) igAllItems = igCacheFb.items;
        }
        setIgBadge("\uD83D\uDCE6 \u0411\u0430\u0437\u0430: " + igAllItems.length + " \u043F\u043E\u0441\u0442\u043E\u0432 \u00B7 \u043D\u043E\u0432\u044B\u0445 \u043D\u0435\u0442 \u00B7 " + new Date().toLocaleDateString("ru", {day:"2-digit", month:"2-digit", year:"numeric"}));
      } else {
        setIgBadge("\uD83D\uDCE6 \u0411\u0430\u0437\u0430: " + igAllItems.length + " \u043F\u043E\u0441\u0442\u043E\u0432 \u00B7 \u043D\u043E\u0432\u044B\u0445 \u043D\u0435\u0442 \u00B7 " + new Date().toLocaleDateString("ru", {day:"2-digit", month:"2-digit", year:"numeric"}));
      }

      // ── Step 6: Final render ──
      renderIG(igAllItems, lastVisit, lastDisp);
      var _igp2 = document.getElementById("gen-ig-posts"); if(_igp2) _igp2.textContent = igAllItems.length;
      updateGenProfile(igAllItems, null, null);
      if (typeof _syncGenSummary === "function") _syncGenSummary();
      cacheWrite("uni_ig_posts", CFG.ig, (igAllItems || []).slice(0, 100));
      updateAnalytics(igAllItems, null);

    } else {
      var _igCont = document.getElementById("ig-content");
      if (_igCont) _igCont.innerHTML = emptyState("Instagram \u0430\u043a\u043a\u0430\u0443\u043d\u0442 \u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d", "\uD83D\uDCF8", "\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438");
    }

        if (CFG.tt) {
      var ttCache = await cacheRead("uni_tt_videos", CFG.tt);
      var ttItems;
      if (ttCache && ttCache.fresh && ttCache.items && ttCache.items.length) {
        ttItems = ttCache.items;
        setStep("tt", "done");
        (function(){var _el=document.getElementById("loadingText");if(_el)_el.textContent="\uD83C\uDFB5 TikTok \u2014 \u0438\u0437 \u043a\u0435\u0448\u0430";})();
      } else {
        ttItems = await apifyRun("clockworks/tiktok-hashtag-scraper",
          {hashtags: [CFG.tt], resultsPerPage: 30},
          "tt", "\uD83C\uDFB5 TikTok"
        );
        cacheWrite("uni_tt_videos", CFG.tt, ttItems);
      }
      var videos = ttItems.filter(function(v) { return is2026(v.createTime || v.createTimeISO || v.timestamp); });
      renderTT(videos, lastVisit, lastDisp);
      (function(){var _el=document.getElementById("gen-tt-videos");if(_el)_el.textContent=videos.length;})();
      updateGenProfile(null, videos, null); _syncGenSummary();
      updateAnalytics(null, videos);
      _lastTTVideos = videos;
    } else {
      (function(){var _el=document.getElementById("tt-content");if(_el)_el.innerHTML=emptyState("TikTok \u0445\u044d\u0448\u0442\u0435\u0433 \u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d", "\uD83C\uDFB5", "\u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438");})();
    }
    var q = "\"" + CFG.name + "\" 2026\n" + CFG.name + " site:tengrinews.kz OR site:informburo.kz 2026";
    var webItems = await apifyRun("apify/google-search-scraper",
      {queries: q, maxPagesPerQuery: 2, resultsPerPage: 10, languageCode: "ru", countryCode: "kz"},
      "web", "\uD83C\uDF10 \u0418\u043d\u0442\u0435\u0440\u043d\u0435\u0442"
    );
    var flatWeb = [];
    webItems.forEach(function(item) {
      if (item.organicResults && Array.isArray(item.organicResults)) {
        item.organicResults.forEach(function(r) {
          if (r.url && r.url.indexOf("google.") === -1) {
            flatWeb.push({title: r.title || "", url: r.url || "", description: r.description || r.snippet || "", date: r.date || ""});
          }
        });
      } else {
        var itemUrl = item.link || item.url || "";
        if (itemUrl && itemUrl.indexOf("google.") === -1) {
          flatWeb.push({title: item.title || "", url: itemUrl, description: item.description || item.snippet || "", date: item.date || ""});
        }
      }
    });
    renderWeb(flatWeb.length ? flatWeb : webItems, lastVisit, lastDisp);
    localStorage.setItem(lastKey, new Date().toISOString());
  } catch(e) {
    console.error(e); showError(e.message);
  } finally {
    isLoading = false; hideLoading();
    (function(){var _el=document.getElementById("lastUpdate");if(_el)_el.textContent="\u041e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u043e: " + new Date().toLocaleString("ru", {day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});})();
  }
}


// Update general profile stats
function updateGenProfile(posts, videos, webItems) {
  if (posts !== null) {
    var tL = posts.reduce(function(s,p){return s+(p.likesCount||p.likes||0);},0);
    // top categories
    var catCounts = {};
    posts.forEach(function(p){
      var cid = typeof categorize==="function" ? categorize(p.caption||p.alt||p.text||"") : "other";
      var ci = catInfo(cid);
      var label = ci.emoji + " " + ci.label;
      catCounts[label] = (catCounts[label]||0)+1;
    });
    var catArr = Object.keys(catCounts).map(function(k){return {k:k,v:catCounts[k]};}).sort(function(a,b){return b.v-a.v;});
    [1,2,3,4].forEach(function(i){
      var cn=document.getElementById("gen-cat"+i+"-name"), cv=document.getElementById("gen-cat"+i+"-cnt");
      if (cn && cv) { var c=catArr[i-1]; if(c){cn.textContent=c.k;cv.textContent=c.v;}else{cn.textContent="—";cv.textContent="—";} }
    });
  }
  if (videos !== null) {
    var tV=0, tL2=0;
    videos.forEach(function(v){
      var s=v.stats||{};
      tV+=(s.playCount||v.playCount||0);
      tL2+=(s.diggCount||v.diggCount||0);
    });
    var er=tV>0?((tL2/tV)*100).toFixed(1)+"%":"—";
    var el=document.getElementById("gen-tt-cnt"); if(el) el.textContent=videos.length;
    el=document.getElementById("gen-tt-views"); if(el) el.textContent=fmtNum(tV);
    el=document.getElementById("gen-tt-likes"); if(el) el.textContent=fmtNum(tL2);
    el=document.getElementById("gen-tt-er"); if(el) el.textContent=er;
  }
}


// sync summary row in general profile
function _syncGenSummary() {
  // sync social card mirrors
  var ttCnt = document.getElementById("gen-tt-cnt");
  var ttViews = document.getElementById("gen-tt-views");
  var sc1 = document.getElementById("gen-soc-tt-cnt");
  var sc2 = document.getElementById("gen-soc-tt-views");
  if (sc1 && ttCnt) sc1.textContent = ttCnt.textContent || "—";
  if (sc2 && ttViews) sc2.textContent = ttViews.textContent || "—";

  var igP = document.getElementById("gen-ig-posts");
  var ttV = document.getElementById("gen-tt-videos");
  var webM = document.getElementById("gen-web-mentions");
  var s1 = document.getElementById("gen-sum-ig");
  var s2 = document.getElementById("gen-sum-tt");
  var s3 = document.getElementById("gen-sum-views");
  var s4 = document.getElementById("gen-sum-web");
  var h1 = document.getElementById("gen-sum-ig-h");
  var h2 = document.getElementById("gen-sum-tt-h");
  if (s1 && igP) s1.textContent = igP.textContent || "—";
  if (h1 && CFG && CFG.ig) h1.textContent = "@" + CFG.ig;
  if (s2 && ttV) s2.textContent = ttV.textContent || "—";
  if (h2 && CFG && CFG.tt) h2.textContent = "#" + CFG.tt;
  var ttViews = document.getElementById("gen-tt-views");
  if (s3 && ttViews) s3.textContent = ttViews.textContent || "—";
  if (s4 && webM) s4.textContent = webM.textContent || "—";
}


// Phase 2: group items by year-month
function groupByMonth(items, getTs) {
  var groups = {};
  items.forEach(function(item) {
    var d = parseTs(getTs(item));
    if (!d || isNaN(d)) d = new Date("2000-01-01");
    var key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  // Sort keys descending (newest first)
  var keys = Object.keys(groups).sort(function(a, b) { return b > a ? 1 : -1; });
  return keys.map(function(k) {
    var parts = k.split("-");
    var yr = parseInt(parts[0]), mo = parseInt(parts[1]);
    var d = new Date(yr, mo - 1, 1);
    var label = d.toLocaleDateString("ru", {month: "long", year: "numeric"});
    label = label.charAt(0).toUpperCase() + label.slice(1);
    var half = mo <= 6 ? "H1" : "H2";
    return {key: k, year: yr, month: mo, half: half, label: label, items: groups[k]};
  });
}

// Phase 2: render semester banner
function semesterBanner(half, year) {
  var label = half === "H1"
    ? "\uD83D\uDCC5 \u041F\u0435\u0440\u0432\u043E\u0435 \u043F\u043E\u043B\u0443\u0433\u043E\u0434\u0438\u0435 " + year + " \u2014 \u044F\u043D\u0432\u0430\u0440\u044C \u2014 \u0438\u044E\u043D\u044C"
    : "\uD83D\uDCC5 \u0412\u0442\u043E\u0440\u043E\u0435 \u043F\u043E\u043B\u0443\u0433\u043E\u0434\u0438\u0435 " + year + " \u2014 \u0438\u044E\u043B\u044C \u2014 \u0434\u0435\u043A\u0430\u0431\u0440\u044C";
  return '<div class="semester-banner"><div class="semester-line"></div><div class="semester-label">' + label + '</div><div class="semester-line"></div></div>';
}

// Phase 2: render one month section (collapsible)
function monthSection(group, renderCard, isNewFn, uid) {
  var newCount = group.items.filter(isNewFn).length;
  var totalLikes = group.items.reduce(function(s, p) {
    return s + (p.likesCount || p.likes || (p.stats && p.stats.diggCount) || p.diggCount || 0);
  }, 0);
  var statsHtml =
    '<span class="month-stat-item">' + group.items.length + ' \u043F\u0443\u0431\u043B.'  + '</span>' +
    (totalLikes ? '<span class="month-stat-item">\u2764 ' + fmtNum(totalLikes) + '</span>' : '') +
    (newCount ? '<span class="month-stat-item"><span class="month-new-dot"></span>' + newCount + ' \u043D\u043E\u0432\u044B\u0445</span>' : '');
  var bodyId = "mbody-" + uid;
  // First month open, rest open too (all open by default)
  var cards = group.items.map(renderCard).join("");
  return '<div class="month-section">' +
    '<div class="month-header" onclick="toggleMonth(\'' + bodyId + '\', this)">' +
      '<div class="month-header-left">' +
        '<span class="month-name">' + group.label + '</span>' +
        '<div class="month-stats">' + statsHtml + '</div>' +
      '</div>' +
      '<span class="month-chevron open">&#9660;</span>' +
    '</div>' +
    '<div class="month-body" id="' + bodyId + '" style="max-height:99999px">' +
      '<div class="web-grid">' + cards + '</div>' +
    '</div>' +
  '</div>';
}

// Phase 2: toggle month collapse
function toggleMonth(bodyId, headerEl) {
  var body = document.getElementById(bodyId);
  var chev = headerEl.querySelector(".month-chevron");
  if (!body) return;
  if (body.classList.contains("collapsed")) {
    body.style.maxHeight = body.scrollHeight + "px";
    body.classList.remove("collapsed");
    if (chev) chev.classList.add("open");
    // after transition, set to auto so content can grow
    setTimeout(function() { if (!body.classList.contains("collapsed")) body.style.maxHeight = "99999px"; }, 320);
  } else {
    body.style.maxHeight = body.scrollHeight + "px";
    requestAnimationFrame(function() {
      body.classList.add("collapsed");
      if (chev) chev.classList.remove("open");
    });
  }
}

function igTs(p) { return p.timestamp || p.taken_at_timestamp || p.takenAtTimestamp || null; }
function renderIG(posts, lv, ld) {
  _igAllPosts = posts; _igLv = lv || ""; _igLd = ld || ""; _igActiveCat = "all";
  var tL = posts.reduce(function(s,p){return s+(p.likesCount||p.likes||0);},0);
  var tC = posts.reduce(function(s,p){return s+(p.commentsCount||p.comments||0);},0);
  var nP = posts.filter(function(p){return isNew(igTs(p),lv);});
  (function(){var _el=document.getElementById("ig-stat-posts");if(_el)_el.textContent=posts.length;})();
  (function(){var _el=document.getElementById("ig-stat-likes");if(_el)_el.textContent=fmtNum(tL);})()
  ;(function(){var _el=document.getElementById("gen-ig-likes");if(_el)_el.textContent=fmtNum(tL);})();
  (function(){var _el=document.getElementById("ig-stat-comments");if(_el)_el.textContent=fmtNum(tC);})();
  (function(){var _el=document.getElementById("ig-stat-avg");if(_el)_el.textContent=posts.length ? Math.round(tL/posts.length) : 0;})();
  (function(){var _el=document.getElementById("ig-stat-new");if(_el)_el.textContent=nP.length;})();
  (function(){var _el=document.getElementById("ig-count");if(_el)_el.textContent=posts.length + " \u043f\u043e\u0441\u0442\u043e\u0432 \u00B7 " + nP.length + " \u043d\u043e\u0432\u044b\u0445";})();
  _renderIgCards();
}
function _renderIgCards() {
  var posts = _igAllPosts; var lv = _igLv; var ld = _igLd;
  var counts = {all: posts.length, other: 0};
  IG_CATS.forEach(function(c) { counts[c.id] = 0; });
  posts.forEach(function(p) {
    var cid = categorize(p.caption || p.alt || p.text || "");
    if (counts[cid] !== undefined) counts[cid]++; else counts.other++;
  });
  posts.forEach(function(p) {
    if (categorize(p.caption || p.alt || p.text || "") === "other") counts.other++;
  });

  // ── Filter bar ──
  var fb = '<div class="ig-filter-bar">';
  fb += '<button class="ig-cat-btn' + (_igActiveCat === "all" ? " active" : "") + '" onclick="setIgFilter(\'all\')">\u0412\u0441\u0435 <span class="ig-cat-count">' + counts.all + '</span></button>';
  IG_CATS.forEach(function(c) {
    if (!counts[c.id]) return;
    fb += '<button class="ig-cat-btn' + (_igActiveCat === c.id ? " active" : "") + '" onclick="setIgFilter(\'' + c.id + '\')">' + c.emoji + ' ' + c.label + ' <span class="ig-cat-count">' + counts[c.id] + '</span></button>';
  });
  if (counts.other) fb += '<button class="ig-cat-btn' + (_igActiveCat === "other" ? " active" : "") + '" onclick="setIgFilter(\'other\')">\uD83D\uDCCC \u0420\u0430\u0437\u043D\u043E\u0435 <span class="ig-cat-count">' + counts.other + '</span></button>';
  fb += '</div>';

  // ── Filter posts ──
  var filtered = _igActiveCat === "all" ? posts : posts.filter(function(p) {
    var cid = categorize(p.caption || p.alt || p.text || "");
    return _igActiveCat === "other" ? (cid === "other") : (cid === _igActiveCat);
  });

  if (!filtered.length) {
    (function(){var _el=document.getElementById("ig-content");if(_el)_el.innerHTML=fb+emptyState("\u041D\u0435\u0442 \u043F\u043E\u0441\u0442\u043E\u0432 \u0432 \u044D\u0442\u043E\u0439 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438","\uD83D\uDCF8","");})();
    return;
  }

  // ── Group by month ──
  var groups = groupByMonth(filtered, igTs);
  var h = fb;
  var lastHalf = null; var lastYear = null;

  groups.forEach(function(g, idx) {
    // Semester banner when half or year changes
    var halfKey = g.year + "-" + g.half;
    if (halfKey !== (lastYear + "-" + lastHalf)) {
      h += semesterBanner(g.half, g.year);
      lastHalf = g.half; lastYear = g.year;
    }
    h += monthSection(g, function(p) {
      return igCard(p, isNew(igTs(p), lv));
    }, function(p) { return isNew(igTs(p), lv); }, "ig" + idx);
  });

  (function(){var _el=document.getElementById("ig-content");if(_el)_el.innerHTML=h;})();
}


function igCard(p, isN) {
  var cap = p.caption || p.alt || p.text || "";
  var titleLine = cap.substring(0, 120);
  var bodyLine  = cap.length > 120 ? cap.substring(120, 380) : "";
  var s = sentiment(cap);
  var vr = (p.likesCount || p.likes || 0) > 500;
  var owner = (p.ownerUsername || p.username || CFG.ig || "").replace(/^https?:\/\/[^/]*\//, "").replace(/\/$/, "").replace(/^@/, "");
  var isProfile = CFG.ig && owner.toLowerCase() === CFG.ig.toLowerCase();
  var sc  = p.shortCode || p.shortcode || "";
  var url = p.url || (sc ? "https://www.instagram.com/p/" + sc + "/" : "#");
  var cat = catInfo(typeof categorize === "function" ? categorize(cap) : "other");
  var sentCls = s === "pos" ? "b-positive" : s === "neg" ? "b-negative" : "b-neutral";
  var sentLbl = s === "pos" ? "\u043f\u043e\u0437\u0438\u0442\u0438\u0432" : s === "neg" ? "\u043d\u0435\u0433\u0430\u0442\u0438\u0432" : "\u043d\u0435\u0439\u0442\u0440\u0430\u043b\u044c\u043d\u043e";
  return '<div class="card' + (isN ? " is-new" : "") + '">' +
    '<div class="card-head">' +
      '<div>' +
        '<div class="author">@' + owner + '</div>' +
        '<div class="date-sm">' + fmtDate(igTs(p)) + '</div>' +
      '</div>' +
      '<div class="badges">' +
        '<span class="b ' + (isProfile ? "b-profile" : "b-mentions") + '">' + (isProfile ? "\u043f\u0440\u043e\u0444\u0438\u043b\u044c" : "\u0443\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u0435") + '</span>' +
        '<span class="b ' + sentCls + '">' + sentLbl + '</span>' +
        (vr ? '<span class="b b-viral">\u0432\u0438\u0440\u0443\u0441</span>' : '') +
      '</div>' +
    '</div>' +
    '<span class="cat-tag">' + cat.emoji + ' ' + cat.label + '</span>' +
    '<div class="caption" style="font-weight:700;-webkit-line-clamp:2">' + (titleLine || '\u2014') + '</div>' +
    (bodyLine ? '<div class="caption" style="opacity:.7">' + bodyLine + '</div>' : '') +
    '<div class="card-foot">' +
      '<div class="meta">' +
        '<span class="likes">\u2764 ' + fmtNum(p.likesCount || p.likes || 0) + '</span>' +
        '<span>\ud83d\udcac ' + fmtNum(p.commentsCount || p.comments || 0) + '</span>' +
      '</div>' +
      '<a class="open-link" href="' + url + '" target="_blank">\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u2192</a>' +
    '</div>' +
  '</div>';
}


function renderTT(videos, lv, ld) {
  function gTs(v) { return v.createTime || v.createTimeISO || v.timestamp || null; }
  function gP(v) { return (v.stats && v.stats.playCount) || v.playCount || v.plays || 0; }
  function gL(v) { return (v.stats && v.stats.diggCount) || v.diggCount || v.likes || 0; }
  function gC(v) { return (v.stats && v.stats.commentCount) || v.commentCount || v.comments || 0; }
  function gS(v) { return (v.stats && v.stats.shareCount) || v.shareCount || v.shares || 0; }
  function gD(v) { return v.desc || v.text || v.description || ""; }

  var tViews = videos.reduce(function(s,v) { return s + gP(v); }, 0);
  var tLikes = videos.reduce(function(s,v) { return s + gL(v); }, 0);
  var nV = videos.filter(function(v) { return isNew(gTs(v), lv); });
  (function(){var _el=document.getElementById("tt-stat-videos");if(_el)_el.textContent=videos.length;})();
  (function(){var _el=document.getElementById("tt-stat-views");if(_el)_el.textContent=fmtNum(tViews);})();
  (function(){var _el=document.getElementById("tt-stat-likes");if(_el)_el.textContent=fmtNum(tLikes);})();
  (function(){var _el=document.getElementById("tt-stat-avg");if(_el)_el.textContent=videos.length ? fmtNum(Math.round(tViews/videos.length)) : 0;})();
  (function(){var _el=document.getElementById("tt-stat-er");if(_el)_el.textContent=videos.length && tViews ? ((tLikes/tViews)*100).toFixed(1) + "%" : "\u2014";})();
  (function(){var _el=document.getElementById("tt-count");if(_el)_el.textContent=videos.length + " \u0432\u0438\u0434\u0435\u043E \u00B7 " + nV.length + " \u043D\u043E\u0432\u044B\u0445";})();

  if (!videos.length) {
    (function(){var _el=document.getElementById("tt-content");if(_el)_el.innerHTML=emptyState("\u041D\u0435\u0442 \u0432\u0438\u0434\u0435\u043E","\uD83C\uDFB5","\u0414\u0430\u043D\u043D\u044B\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u044B");})();
    return;
  }

  var groups = groupByMonth(videos, gTs);
  var h = "";
  var lastHalf = null; var lastYear = null;

  groups.forEach(function(g, idx) {
    var halfKey = g.year + "-" + g.half;
    if (halfKey !== (lastYear + "-" + lastHalf)) {
      h += semesterBanner(g.half, g.year);
      lastHalf = g.half; lastYear = g.year;
    }
    h += monthSection(g, function(v) {
      return ttCard(v, gTs, gP, gL, gC, gS, gD, isNew(gTs(v), lv));
    }, function(v) { return isNew(gTs(v), lv); }, "tt" + idx);
  });

  (function(){var _el=document.getElementById("tt-content");if(_el)_el.innerHTML=h;})();
}


function ttCard(v,gTs,gP,gL,gC,gS,gD,isN) {
  var d = parseTs(gTs(v)) || new Date();
  var desc = gD(v);
  var titleLine = desc.substring(0, 120);
  var url = v.webVideoUrl || v.url || ("https://www.tiktok.com/@" + ((v.authorMeta && v.authorMeta.name) || "") + "/video/" + (v.id || ""));
  var authorName = (v.authorMeta && v.authorMeta.name) || (v.author && v.author.uniqueId) || v.author || "";
  var views = gP(v), lks = gL(v), cms = gC(v), shs = gS(v);
  var viral = views > 100000;
  var isAlmaU = authorName.toLowerCase().indexOf(CFG.tt ? CFG.tt.toLowerCase() : "almau") >= 0 ||
                (desc && desc.toLowerCase().indexOf(CFG.tt ? CFG.tt.toLowerCase() : "almau") >= 0);
  var hashtags = v.hashtags || v.challenges || [];
  if (typeof hashtags === "string") { try { hashtags = JSON.parse(hashtags); } catch(e) { hashtags = []; } }
  var tags = Array.isArray(hashtags) ? hashtags.slice(0,5).map(function(h){ return typeof h === "object" ? (h.name || h.title || "") : String(h); }).filter(Boolean) : [];
  return '<div class="card' + (isN ? " is-new" : "") + '">' +
    '<div class="card-head">' +
      '<div>' +
        '<div class="author">@' + authorName + '</div>' +
        '<div class="date-sm">' + d.toLocaleDateString("ru", {day:"numeric",month:"long",year:"numeric"}) + '</div>' +
      '</div>' +
      '<div class="badges">' +
        (isAlmaU ? '<span class="b b-profile">' + (CFG.tt ? "#"+CFG.tt : "AlmaU") + '</span>' : '<span class="b b-mentions">\u0443\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u0435</span>') +
        (viral ? '<span class="b b-viral">\u0432\u0438\u0440\u0443\u0441</span>' : '') +
      '</div>' +
    '</div>' +
    '<div class="caption" style="font-weight:700;-webkit-line-clamp:2">' + (titleLine || '\u2014') + '</div>' +
    (tags.length ? '<div class="meta" style="flex-wrap:wrap;gap:4px">' + tags.map(function(t){ return '<span style="font-size:10px;color:#C57E33;background:#FFF8EE;border:1px solid #F5D5A0;padding:2px 7px;border-radius:6px;font-weight:600">#'+t+'</span>'; }).join("") + '</div>' : '') +
    '<div class="card-foot">' +
      '<div class="meta">' +
        '<span class="likes">\u25b6 ' + fmtNum(views) + '</span>' +
        '<span>\u2764 ' + fmtNum(lks) + '</span>' +
        (cms ? '<span>\ud83d\udcac ' + fmtNum(cms) + '</span>' : '') +
      '</div>' +
      '<a class="open-link" href="' + url + '" target="_blank">\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u2192</a>' +
    '</div>' +
  '</div>';
}


function renderWeb(items, lv, ld) {
  var seen = {}; var unique = [];
  items.forEach(function(i) { var k=(i.url||i.title||"").substring(0,80); if(k&&!seen[k]){seen[k]=true;unique.push(i);} });
  var words = CFG.name.toLowerCase().split(" ").filter(function(w){return w.length>2;});
  var f = unique.filter(function(i){var t=((i.title||"")+(i.description||"")).toLowerCase();return words.some(function(w){return t.indexOf(w)>=0;});});
  if (!f.length) f = unique;
  var nI = f.filter(function(i){return i.date&&isNew(i.date,lv);});
  var oI = f.filter(function(i){return !i.date||!isNew(i.date,lv);});
  var hs = {}; f.forEach(function(i){try{hs[new URL(i.url||"http://x").hostname]=1;}catch(e){}});
  var posC = f.filter(function(i){return sentiment((i.title||"")+(i.description||""))==="pos";}).length;
  (function(){var _el=document.getElementById("web-stat-topics");if(_el)_el.textContent=f.length;})();
  (function(){var _el=document.getElementById("web-stat-new");if(_el)_el.textContent=nI.length;})();
  (function(){var _el=document.getElementById("web-stat-mentions");if(_el)_el.textContent=f.length;})();
  (function(){var _el=document.getElementById("web-stat-sources");if(_el)_el.textContent=Object.keys(hs).length;})();
  (function(){var _el=document.getElementById("web-stat-sentiment");if(_el)_el.textContent=f.length ? Math.round(posC/f.length*100)+"%" : "\u2014";})();
  (function(){var _el=document.getElementById("web-sync-badge");if(_el)_el.textContent="\uD83C\uDD95 " + nI.length + " \u043d\u043e\u0432\u044b\u0445";})();
  (function(){var _el=document.getElementById("web-last-sync");if(_el)_el.textContent="\u041f\u0440\u043e\u0432\u0435\u0440\u0435\u043d\u043e: " + new Date().toLocaleString("ru",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});})();
  (function(){var _el=document.getElementById("gen-web-mentions");if(_el)_el.textContent=f.length;})();
  var h = "";
  if (nI.length) h += sepNew("\uD83C\uDF10 \u0418\u043d\u0442\u0435\u0440\u043d\u0435\u0442 \u2014 \u043d\u043e\u0432\u043e\u0435 \u0441 " + ld) + "<div class=\"web-grid\">" + nI.map(function(i){return webCard(i,true);}).join("") + "</div>";
  if (oI.length) h += sepOld("\u0420\u0430\u043d\u0435\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043d\u043e\u0435") + "<div class=\"web-grid\">" + oI.map(function(i){return webCard(i,false);}).join("") + "</div>";
  if (!f.length) h = emptyState("\u041d\u0435\u0442 \u0443\u043f\u043e\u043c\u0438\u043d\u0430\u043d\u0438\u0439","\uD83C\uDF10","\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u043f\u043e\u0437\u0436\u0435");
  (function(){var _el=document.getElementById("web-content");if(_el)_el.innerHTML=h;})();
}
function webCard(item, isN) {
  var host = "\u2014";
  try { host = new URL(item.url || "http://x").hostname.replace("www.",""); } catch(e) {}
  var s = sentiment((item.title || "") + (item.description || ""));
  var sentCls = s === "pos" ? "b-positive" : s === "neg" ? "b-negative" : "b-neutral";
  var sentLbl = s === "pos" ? "\u043f\u043e\u0437\u0438\u0442\u0438\u0432" : s === "neg" ? "\u043d\u0435\u0433\u0430\u0442\u0438\u0432" : "\u043d\u0435\u0439\u0442\u0440\u0430\u043b";
  return '<div class="card' + (isN ? " is-new" : "") + '">' +
    '<div class="card-head">' +
      '<div>' +
        '<div class="author">' + host + '</div>' +
        '<div class="date-sm">' + (item.date || "") + '</div>' +
      '</div>' +
      '<div class="badges">' +
        (isN ? '<span class="b b-new">\ud83c\udd95 \u041d\u043e\u0432\u043e\u0435</span>' : '') +
        '<span class="b ' + sentCls + '">' + sentLbl + '</span>' +
      '</div>' +
    '</div>' +
    '<div class="caption" style="font-weight:700;-webkit-line-clamp:2">' + (item.title || "\u2014") + '</div>' +
    '<div class="caption" style="opacity:.7">' + (item.description || "").substring(0,250) + '</div>' +
    '<div class="card-foot">' +
      '<div class="meta"><span>\ud83d\udcf0 ' + host + '</span></div>' +
      '<a class="open-link" href="' + (item.url || "#") + '" target="_blank">\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u2192</a>' +
    '</div>' +
  '</div>';
}


// ═══════════════════════════════════════════════
// PHASE 3: Analytics — Chart + Top Posts
// ═══════════════════════════════════════════════

var _chartInstance = null;
var _chartIgData   = {};  // { "2026-01": {posts:N, likes:N}, ... }
var _chartTtData   = {};  // { "2026-01": {videos:N, views:N}, ... }
var _activeChart   = "ig";

function buildChartData(items, getTs, getMetric) {
  var data = {};
  items.forEach(function(item) {
    var d = parseTs(getTs(item));
    if (!d || isNaN(d)) return;
    var key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    if (!data[key]) data[key] = {count: 0, metric: 0};
    data[key].count++;
    data[key].metric += getMetric(item);
  });
  return data;
}

function renderActivityChart(type) {
  var data = type === "ig" ? _chartIgData : _chartTtData;
  var keys = Object.keys(data).sort();
  if (!keys.length) return;

  var labels = keys.map(function(k) {
    var parts = k.split("-");
    var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
    return d.toLocaleDateString("ru", {month: "short", year: "2-digit"});
  });
  var counts  = keys.map(function(k) { return data[k].count; });
  var metrics = keys.map(function(k) { return data[k].metric; });

  var metricLabel = type === "ig" ? "\u041B\u0430\u0439\u043A\u0438" : "\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u044B";
  var countLabel  = type === "ig" ? "\u041F\u043E\u0441\u0442\u044B" : "\u0412\u0438\u0434\u0435\u043E";

  var canvas = document.getElementById("activityChart");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");

  if (_chartInstance) { _chartInstance.destroy(); _chartInstance = null; }

  _chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: countLabel,
          data: counts,
          backgroundColor: "rgba(197, 126, 51, 0.7)",
          borderColor: "#C57E33",
          borderWidth: 1.5,
          borderRadius: 5,
          yAxisID: "y"
        },
        {
          label: metricLabel,
          data: metrics,
          type: "line",
          borderColor: "#1a1a1a",
          backgroundColor: "rgba(26,26,26,0.07)",
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#1a1a1a",
          tension: 0.35,
          yAxisID: "y1",
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { position: "top", labels: { font: { size: 11 }, boxWidth: 12 } },
        tooltip: { bodyFont: { size: 11 }, titleFont: { size: 11 } }
      },
      scales: {
        x:  { grid: { display: false }, ticks: { font: { size: 10 } } },
        y:  { position: "left",  ticks: { font: { size: 10 } }, grid: { color: "#f5f5f5" } },
        y1: { position: "right", ticks: { font: { size: 10 } }, grid: { display: false } }
      }
    }
  });
}

function switchChart(type, btn) {
  _activeChart = type;
  document.querySelectorAll(".chart-tab-btn").forEach(function(b) { b.classList.remove("active"); });
  if (btn) btn.classList.add("active");
  renderActivityChart(type);
}

// Top cards
function renderTopCard(rank, caption, author, metric, metricLabel, url) {
  var medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
  var medal = medals[rank] || "#" + (rank + 1);
  return '<div class="top-card">' +
    '<div class="top-rank' + (rank === 0 ? " gold" : "") + '">' + (rank + 1) + '</div>' +
    '<div class="top-author">' + medal + ' ' + (author || "") + '</div>' +
    '<div class="top-caption">' + (caption || "\u2014") + '</div>' +
    '<div class="top-metric">' + fmtNum(metric) + '</div>' +
    '<div class="top-metric-label">' + metricLabel + '</div>' +
    '<a class="top-link" href="' + (url || "#") + '" target="_blank">\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u2192</a>' +
  '</div>';
}

function updateAnalytics(igPosts, ttVideos) {
  // ── Build chart data ──
  if (igPosts && igPosts.length) {
    _chartIgData = buildChartData(
      igPosts,
      function(p) { return p.timestamp || p.taken_at_timestamp || p.takenAtTimestamp || null; },
      function(p) { return p.likesCount || p.likes || 0; }
    );
  }
  if (ttVideos && ttVideos.length) {
    var _ttGetTs = function(v) { return v.createTime || v.createTimeISO || v.timestamp || null; };
    var _ttGetV  = function(v) { return (v.stats && v.stats.playCount) || v.playCount || v.plays || 0; };
    _chartTtData = buildChartData(ttVideos, _ttGetTs, _ttGetV);
  }

  // Re-render chart if Analytics tab is visible
  var panel = document.getElementById("panel-analytics");
  if (panel && panel.classList.contains("active")) {
    renderActivityChart(_activeChart);
  }

  // ── Top IG posts ──
  if (igPosts && igPosts.length) {
    var sorted = igPosts.slice().sort(function(a, b) {
      return (b.likesCount || b.likes || 0) - (a.likesCount || a.likes || 0);
    });
    var top3 = sorted.slice(0, 3);
    var html = top3.map(function(p, i) {
      var cap = p.caption || p.alt || p.text || "";
      var owner = (p.ownerUsername || p.username || "").replace(/^@/, "");
      var sc = p.shortCode || p.shortcode || "";
      var url = p.url || (sc ? "https://www.instagram.com/p/" + sc + "/" : "#");
      return renderTopCard(i, cap.substring(0, 150), "@" + owner,
        p.likesCount || p.likes || 0, "\u043B\u0430\u0439\u043A\u043E\u0432", url);
    }).join("");
    var el = document.getElementById("top-ig-cards");
    if (el) el.innerHTML = html;
  }

  // ── Top TT videos ──
  if (ttVideos && ttVideos.length) {
    var sortedTT = ttVideos.slice().sort(function(a, b) {
      var vA = (a.stats && a.stats.playCount) || a.playCount || a.plays || 0;
      var vB = (b.stats && b.stats.playCount) || b.playCount || b.plays || 0;
      return vB - vA;
    });
    var top3tt = sortedTT.slice(0, 3);
    var htmlTT = top3tt.map(function(v, i) {
      var desc = v.desc || v.text || v.description || "";
      var author = (v.authorMeta && v.authorMeta.name) || (v.author && v.author.uniqueId) || v.author || "";
      var views = (v.stats && v.stats.playCount) || v.playCount || v.plays || 0;
      var url = v.webVideoUrl || v.url || ("https://www.tiktok.com/@" + author + "/video/" + (v.id || ""));
      return renderTopCard(i, desc.substring(0, 150), "@" + author,
        views, "\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u043E\u0432", url);
    }).join("");
    var elTT = document.getElementById("top-tt-cards");
    if (elTT) elTT.innerHTML = htmlTT;
  }
}

// Re-render chart when switching to Analytics tab
var _origSwitchTab = typeof switchTab === "function" ? switchTab : null;
function switchTab(tab, el) {
  document.querySelectorAll(".plat-tab").forEach(function(t) { t.classList.remove("active"); });
  if (el) el.classList.add("active");
  document.querySelectorAll(".tab-panel").forEach(function(p) { p.classList.remove("active"); });
  var panel = document.getElementById("panel-" + tab);
  if (panel) panel.classList.add("active");
  // Render chart when Analytics tab opens
  if (tab === "analytics") {
    setTimeout(function() { renderActivityChart(_activeChart); }, 50);
  }
  if (tab === "reviews") {
    // Show auto-detected university info
    var _uni2gis = detectUni2GIS(CFG.name || "");
    var _revStatus = document.getElementById("rev-status");
    if (_uni2gis && _revStatus && _revStatus.textContent === "") {
      _revStatus.textContent = "?? Найдено " + _uni2gis.branches.length + " филиала " + _uni2gis.name + " — нажмите «Загрузить»";
    }
    if (_allReviews.length === 0) {
      cacheRead("uni_reviews_gmaps", CFG.name || "uni").then(function(c){
        if(c&&c.items&&c.items.length){_allReviews=c.items;renderReviewStats(_allReviews);renderReviewCards();var s=document.getElementById("rev-status");if(s)s.textContent="Из кеша: "+_allReviews.length+" отзывов";}
      });
    }
  }
  if (tab === "trends") {
    cacheRead("uni_trends_global","global").then(function(c){
      if(c&&c.items&&c.items.length){renderTrends(c.items);var s=document.getElementById("trends-status");if(s)s.textContent="\u0418\u0437 \u043a\u044d\u0448\u0430";}
    });
  }
}


// ═══════════════════════════════════════════════
// PHASE 4: Competitors
// ═══════════════════════════════════════════════

var _competitors = [];   // [{name, ig, tt, igPosts:[], ttVideos:[]}]

function loadCompetitors() {
  try {
    var s = localStorage.getItem("uni_competitors_v1");
    if (s) _competitors = JSON.parse(s);
  } catch(e) { _competitors = []; }
}

function saveCompetitors() {
  // Save only name/ig/tt, not posts (too large)
  var slim = _competitors.map(function(c) {
    return {name: c.name, ig: c.ig, tt: c.tt};
  });
  localStorage.setItem("uni_competitors_v1", JSON.stringify(slim));
}


// Standalone Apify fetch for competitors (does NOT touch loading bar / isLoading)
async function apifyRunCompetitor(ig, label, onStatus, override) {
  try {
    var token = CFG.token;
    onStatus("\u23F3 \u0417\u0430\u043f\u0443\u0441\u043a\u0430\u0435\u043c Apify...");

    // Step 1: Start actor
    var startResp = await fetch("/.netlify/functions/apify-start", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        actorId: (override && override.actorId) ? override.actorId : "apify~instagram-scraper",
        input: (override && override.input) ? override.input : {
          directUrls: ["https://www.instagram.com/" + ig + "/"],
          resultsType: "posts", resultsLimit: 1000, addParentData: false
        },
        token: token
      })
    });

    if (!startResp.ok) {
      var errText = await startResp.text();
      throw new Error("apify-start HTTP " + startResp.status + ": " + errText.substring(0, 100));
    }

    var startData = await startResp.json();
    if (startData.error) throw new Error("Apify error: " + startData.error);

    var runId = startData.runId;
    onStatus("\u23F3 \u0417\u0430\u043f\u0443\u0449\u0435\u043d (" + runId.substring(0,8) + ")... \u0436\u0434\u0451\u043c");

    // Step 2: Poll until done
    for (var i = 0; i < 80; i++) {
      await new Promise(function(res) { setTimeout(res, 5000); });
      onStatus("\u23F3 " + ((i+1)*5) + "\u0441... (" + label + ")");

      var pollResp = await fetch("/.netlify/functions/apify-poll", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({runId: runId, token: token, getItems: true})
      });

      if (!pollResp.ok) {
        onStatus("\u26A0\uFE0F poll HTTP " + pollResp.status + " — \u043f\u043e\u0432\u0442\u043e\u0440...");
        continue;
      }

      var pollData = await pollResp.json();
      var status = pollData.status || "UNKNOWN";

      if (status === "SUCCEEDED") {
        var items = pollData.items || [];
        onStatus("\u2705 \u041f\u043e\u043b\u0443\u0447\u0435\u043d\u043e: " + items.length + " \u0437\u0430\u043f\u0438\u0441\u0435\u0439");
        return items;
      }
      if (["FAILED","ABORTED","TIMED-OUT"].indexOf(status) >= 0) {
        throw new Error("Apify run " + status);
      }
    }
    throw new Error("\u0422\u0430\u0439\u043c\u0430\u0443\u0442 10 \u043c\u0438\u043d");
  } catch(e) {
    throw e;
  }
}

async function addCompetitor() {
  if (_competitors.length >= 3) {
    alert("\u041c\u0430\u043a\u0441\u0438\u043c\u0443\u043c 3 \u043a\u043e\u043d\u043a\u0443\u0440\u0435\u043d\u0442\u0430");
    return;
  }
  var name = (document.getElementById("comp-name") || {}).value || "";
  var ig   = ((document.getElementById("comp-ig") || {}).value || "").replace(/^@/, "").trim();
  var tt   = ((document.getElementById("comp-tt") || {}).value || "").replace(/^#/, "").trim();
  if (!name) { alert("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435"); return; }
  if (!ig && !tt) { alert("\u0423\u043a\u0430\u0436\u0438\u0442\u0435 Instagram \u0438\u043b\u0438 TikTok"); return; }
  if (!CFG.token) { alert("\u0421\u043d\u0430\u0447\u0430\u043b\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u043e\u0441\u043d\u043e\u0432\u043d\u043e\u0433\u043e \u0443\u043d\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u0430"); return; }

  var comp = {name: name, ig: ig, tt: tt, igPosts: [], ttVideos: [], loading: true};
  _competitors.push(comp);
  saveCompetitors();
  renderCompChips();

  // Fetch IG — standalone (bypasses apifyRun state)
  if (ig) {
    try {
      var igItems = await apifyRunCompetitor(ig, name, function(msg) {
        comp._igStatus = msg;
        renderCompChips();
      });
      var igFiltered = igItems.filter(function(p) {
        var ts = p.timestamp || p.taken_at_timestamp || p.takenAtTimestamp;
        return is2026(ts);
      });
      comp.igPosts = (igFiltered.length > 0) ? igFiltered : igItems.slice(0, 500);
      comp._igStatus = "✅ " + comp.igPosts.length + " постов (2026)";
      renderCompChips();
    } catch(e) {
      console.error("Competitor IG error:", e);
      comp.igPosts = [];
      comp._igStatus = "⚠️ " + e.message.substring(0, 80);
      renderCompChips();
    }
  }

  // Fetch TT
  if (tt) {
    try {
      var ttItems = await apifyRun("clockworks/tiktok-hashtag-scraper", {
        hashtags: [tt], resultsPerPage: 50
      }, "tt", "\uD83C\uDFB5 " + name + " TikTok");
      // cache skipped — use in-memory only
      comp.ttVideos = ttItems.slice(0, 500);
    } catch(e) {
      console.warn("Competitor TT fetch error:", e.message);
      comp.ttVideos = [];
    }
  }

  comp.loading = false;
  if (document.getElementById("comp-name")) document.getElementById("comp-name").value = "";
  if (document.getElementById("comp-ig"))   document.getElementById("comp-ig").value = "";
  if (document.getElementById("comp-tt"))   document.getElementById("comp-tt").value = "";
  renderCompChips();
  renderComparisonTable();
  renderCompCats();
}

function removeCompetitor(idx) {
  _competitors.splice(idx, 1);
  saveCompetitors();
  renderCompChips();
  renderComparisonTable();
  renderCompCats();
}

function renderCompChips() {
  var el = document.getElementById("comp-chips");
  if (!el) return;
  if (!_competitors.length) { el.innerHTML = ""; return; }
  el.innerHTML = _competitors.map(function(c, i) {
    var statusStr = c._igStatus ? '<span style="color:#888;font-size:10px;margin-left:6px">' + c._igStatus + '</span>' : '';
    return '<div class="comp-chip' + (c.loading ? " loading" : " done") + '">' +
      (c.loading ? "\u23F3 " : "\u2705 ") + c.name +
      (c.ig ? ' <span style="color:#aaa;font-weight:400">@' + c.ig + '</span>' : '') +
      statusStr +
      '<span class="comp-chip-remove" onclick="removeCompetitor(' + i + ')">\u00D7</span>' +
    '</div>';
  }).join("");
}

function compStats(igPosts, ttVideos) {
  var igCount   = igPosts.length;
  var igLikes   = igPosts.reduce(function(s,p){return s+(p.likesCount||p.likes||0);},0);
  var igAvg     = igCount ? Math.round(igLikes / igCount) : 0;
  var ttCount   = ttVideos.length;
  var ttViews   = ttVideos.reduce(function(s,v){return s+((v.stats&&v.stats.playCount)||v.playCount||v.plays||0);},0);
  var ttLikes   = ttVideos.reduce(function(s,v){return s+((v.stats&&v.stats.diggCount)||v.diggCount||v.likes||0);},0);
  var ttER      = ttViews > 0 ? ((ttLikes / ttViews) * 100).toFixed(1) : 0;
  return {igCount:igCount, igLikes:igLikes, igAvg:igAvg, ttCount:ttCount, ttViews:ttViews, ttLikes:ttLikes, ttER:ttER};
}

function renderComparisonTable() {
  var el = document.getElementById("comp-table-container");
  if (!el) return;

  var ownIG = typeof _igAllPosts !== "undefined" ? _igAllPosts : [];
  var ownTT = [];
  // Gather TT from last renderTT call — use global if set
  if (typeof _lastTTVideos !== "undefined") ownTT = _lastTTVideos;

  var allUnis = [{name: CFG.name || "\u0421\u0432\u043e\u0439 \u0443\u043d\u0438\u0432.", ig: ownIG, tt: ownTT, own: true}]
    .concat(_competitors.filter(function(c){return !c.loading;}).map(function(c){
      return {name: c.name, ig: c.igPosts||[], tt: c.ttVideos||[], own: false};
    }));

  if (allUnis.length <= 1 && !_competitors.length) {
    el.innerHTML = '<div class="comp-empty">\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043a\u043e\u043d\u043a\u0443\u0440\u0435\u043d\u0442\u0430 \u0447\u0442\u043e\u0431\u044b \u0443\u0432\u0438\u0434\u0435\u0442\u044c \u0441\u0440\u0430\u0432\u043d\u0435\u043d\u0438\u0435</div>';
    return;
  }

  var stats = allUnis.map(function(u) { return compStats(u.ig, u.tt); });

  var rows = [
    {label: "\u041f\u043e\u0441\u0442\u043e\u0432 Instagram", key: "igCount", fmt: function(v){return String(v);}, higher: true},
    {label: "\u041b\u0430\u0439\u043a\u043e\u0432 Instagram", key: "igLikes", fmt: fmtNum, higher: true},
    {label: "\u0421\u0440. \u043b\u0430\u0439\u043a\u043e\u0432 \u043d\u0430 \u043f\u043e\u0441\u0442", key: "igAvg", fmt: fmtNum, higher: true},
    {label: "\u0412\u0438\u0434\u0435\u043e TikTok", key: "ttCount", fmt: function(v){return String(v);}, higher: true},
    {label: "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u043e\u0432 TikTok", key: "ttViews", fmt: fmtNum, higher: true},
    {label: "\u041b\u0430\u0439\u043a\u043e\u0432 TikTok", key: "ttLikes", fmt: fmtNum, higher: true},
    {label: "ER TikTok", key: "ttER", fmt: function(v){return v+"%";}, higher: true}
  ];

  var thead = '<tr><th>\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c</th>' +
    allUnis.map(function(u,i){ return '<th' + (u.own?' class="own"':'') + '>' + u.name + '</th>'; }).join("") +
  '</tr>';

  var tbody = rows.map(function(row) {
    var vals = stats.map(function(s){ return parseFloat(s[row.key]) || 0; });
    var maxVal = Math.max.apply(null, vals);
    return '<tr>' +
      '<td class="label">' + row.label + '</td>' +
      vals.map(function(v, i) {
        var isBest = row.higher && v === maxVal && maxVal > 0;
        return '<td class="metric' + (isBest ? ' best' : '') + '">' +
          row.fmt(stats[i][row.key]) +
          (isBest ? ' \uD83C\uDFC6' : '') +
        '</td>';
      }).join("") +
    '</tr>';
  }).join("");

  el.innerHTML = '<div class="comp-table-wrap"><table class="comp-table"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table></div>';
}

function renderCompCats() {
  var el = document.getElementById("comp-cats-container");
  if (!el || !_competitors.length) { if(el) el.innerHTML = ""; return; }

  var ownIG = typeof _igAllPosts !== "undefined" ? _igAllPosts : [];
  var allUnis = [{name: CFG.name || "\u0421\u0432\u043e\u0439", ig: ownIG, own: true}]
    .concat(_competitors.filter(function(c){return !c.loading;}).map(function(c){
      return {name: c.name, ig: c.igPosts||[], own: false};
    }));

  var title = '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:#888;margin-bottom:12px">\uD83D\uDCCA \u0421\u0440\u0430\u0432\u043d\u0435\u043d\u0438\u0435 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0439 Instagram</div>';

  var cards = allUnis.map(function(u) {
    if (!u.ig.length) return '';
    var counts = {};
    u.ig.forEach(function(p) {
      var cid = categorize(p.caption || p.alt || p.text || "");
      var ci = catInfo(cid);
      var lbl = ci.emoji + " " + ci.label;
      counts[lbl] = (counts[lbl]||0) + 1;
    });
    var arr = Object.keys(counts).map(function(k){return {k:k,v:counts[k]};}).sort(function(a,b){return b.v-a.v;}).slice(0,5);
    var max = arr.length ? arr[0].v : 1;
    var rows = arr.map(function(item){
      var pct = Math.round((item.v / max) * 100);
      return '<div class="comp-cat-row"><span>' + item.k + '</span><span style="font-weight:700">' + item.v + '</span></div>' +
        '<div class="comp-cat-bar"><div class="comp-cat-fill" style="width:' + pct + '%"></div></div>';
    }).join("");
    return '<div class="comp-cat-card">' +
      '<div class="comp-cat-name">' + (u.own ? '\uD83C\uDFC0 ' : '') + u.name + ' <span style="color:#aaa;font-weight:400;font-size:10px">(' + u.ig.length + ' \u043f\u043e\u0441\u0442\u043e\u0432)</span></div>' +
      rows +
    '</div>';
  }).join("");

  el.innerHTML = title + '<div class="comp-cats">' + cards + '</div>';
}

// Store last TT videos for comparison
var _lastTTVideos = [];


// === REVIEWS 2GIS ===
var _allReviews = [];
var _revFilter = "all";

function revSentiment(rating) {
  if (rating >= 4) return "pos";
  if (rating === 3) return "neu";
  return "neg";
}

function starsHtml(n) {
  var s = ""; for (var i=1;i<=5;i++) s += i<=n ? "\u2b50" : "\u2606"; return s;
}

function reviewCard(rv) {
  var sent = revSentiment(rv.rating || 0);
  var sentBg = sent==="pos"?"#ECFDF5":sent==="neg"?"#FEF2F2":"#F9FAFB";
  var sentColor = sent==="pos"?"#10B981":sent==="neg"?"#EF4444":"#6B7280";
  var sentLabel = sent==="pos"?"\u041f\u043e\u0437\u0438\u0442\u0438\u0432":sent==="neg"?"\u041d\u0435\u0433\u0430\u0442\u0438\u0432":"\u041d\u0435\u0439\u0442\u0440\u0430\u043b";
  var author = (rv.author&&rv.author.name)||rv.authorName||rv.name||"\u0410\u043d\u043e\u043d\u0438\u043c";
  var text = rv.text || rv.body || rv.comment || "";
  var dateStr = "";
  if (rv.dateCreated||rv.date||rv.created_at) { try { dateStr = new Date(rv.dateCreated||rv.date||rv.created_at).toLocaleDateString("ru",{day:"2-digit",month:"long",year:"numeric"}); } catch(e){} }
  return '<div class="review-card '+sent+'">' +
    '<div class="review-card-head">' +
      '<div><div class="review-author">'+author+'</div><div style="display:flex;gap:6px;align-items:center;margin-top:3px"><span class="review-stars">'+starsHtml(rv.rating||0)+'</span>'+(dateStr?'<span class="review-date">'+dateStr+'</span>':'')+'</div></div>' +
      '<span style="font-size:11px;font-weight:700;padding:3px 9px;border-radius:10px;background:'+sentBg+';color:'+sentColor+'">'+sentLabel+'</span>' +
    '</div>' +
    (text?'<div class="review-text">'+text.substring(0,400)+(text.length>400?"...":"")+'</div>':'') +
  '</div>';
}

function setRevFilter(f, btn) {
  _revFilter = f;
  document.querySelectorAll(".review-filter-btn").forEach(function(b){b.classList.remove("active");});
  if (btn) btn.classList.add("active");
  renderReviewCards();
}

function renderReviewCards() {
  var filtered = _revFilter==="all" ? _allReviews : _allReviews.filter(function(rv){return revSentiment(rv.rating||0)===_revFilter;});
  var el = document.getElementById("rev-content");
  if (!el) return;
  if (!filtered.length) { el.innerHTML='<div style="text-align:center;padding:40px;color:#ccc">\u041d\u0435\u0442 \u043e\u0442\u0437\u044b\u0432\u043e\u0432</div>'; return; }
  el.innerHTML = filtered.map(reviewCard).join("");
}

function renderReviewStats(reviews) {
  var total=reviews.length;
  var pos=reviews.filter(function(r){return (r.rating||0)>=4;}).length;
  var neg=reviews.filter(function(r){return (r.rating||0)<=2;}).length;
  var neu=total-pos-neg;
  var avg=total?(reviews.reduce(function(s,r){return s+(r.rating||0);},0)/total).toFixed(1):0;
  var ids={"rev-total":total,"rev-avg":avg,"rev-pos":pos,"rev-neg":neg,"rf-all":total,"rf-pos":pos,"rf-neu":neu,"rf-neg":neg};
  Object.keys(ids).forEach(function(id){var e=document.getElementById(id);if(e)e.textContent=ids[id];});
  var rs=document.getElementById("rev-stars"); if(rs) rs.textContent=starsHtml(Math.round(avg));
  var starCounts={5:0,4:0,3:0,2:0,1:0};
  reviews.forEach(function(r){var s=r.rating||0;if(starCounts[s]!==undefined)starCounts[s]++;});
  var maxS=Math.max.apply(null,[5,4,3,2,1].map(function(s){return starCounts[s];}));
  var colors={5:"#10B981",4:"#C57E33",3:"#F59E0B",2:"#F97316",1:"#EF4444"};
  var barEl=document.getElementById("rev-bars-content");
  if (barEl) barEl.innerHTML=[5,4,3,2,1].map(function(s){
    var pct=maxS?Math.round((starCounts[s]/maxS)*100):0;
    return '<div class="star-bar-row"><span style="font-size:11px;color:#888;min-width:36px">'+s+' \u2b50</span><div class="star-bar-track"><div class="star-bar-fill" style="width:'+pct+'%;background:'+colors[s]+'"></div></div><span class="star-bar-cnt">'+starCounts[s]+'</span></div>';
  }).join("");
  var bw=document.getElementById("rev-star-bars"); if(bw) bw.style.display="block";
  var fb=document.getElementById("rev-filter-bar"); if(fb) fb.style.display="flex";
}

async function fetch2GISReviews() {
  var btn = document.getElementById("rev-fetch-btn");
  var status = document.getElementById("rev-status");
  var content = document.getElementById("rev-content");
  if (btn) btn.disabled = true;

  var uniName = CFG.name || "";
  if (!uniName) {
    if (status) status.textContent = "\u26a0\ufe0f \u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0443\u043d\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u0430 \u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d\u043e \u2014 \u043e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438";
    if (btn) btn.disabled = false;
    return;
  }

  try {
    if (status) status.textContent = "\uD83D\uDD0D \u0418\u0449\u0435\u043c \u00ab" + uniName + "\u00bb \u0432 Google Maps...";
    if (content) content.innerHTML = '<div style="text-align:center;padding:40px;color:#888">\uD83D\uDD0D \u041f\u043e\u0438\u0441\u043a \u0432 Google Maps...</div>';

    // ── Google Maps via Apify crawler-google-places ──
    var items = await apifyRunCompetitor(
      "__gmaps__",
      "\u2b50 Google Maps",
      function(msg) { if (status) status.textContent = msg; },
      {
        actorId: "compass~crawler-google-places",
        input: {
          searchStringsArray: [uniName],
          maxCrawledPlacesPerSearch: 5,
          language: "ru",
          reviewsSort: "newest",
          maxReviews: 300,
          scrapeReviewerInfo: true,
          reviewsTranslation: "originalAndTranslated",
          includeReviews: true
        }
      }
    );

    // Extract reviews from all found places
    var allReviews = [];
    var placesFound = 0;

    items.forEach(function(place) {
      var placeName = place.title || place.name || "";
      var nameL = placeName.toLowerCase();
      var queryL = uniName.toLowerCase().split(" ");
      // Match if place name contains any significant word from query
      var isMatch = queryL.some(function(w) { return w.length > 3 && nameL.indexOf(w) >= 0; });
      if (!isMatch && placesFound === 0) isMatch = true; // Take at least first result

      if (isMatch && place.reviews) {
        placesFound++;
        place.reviews.forEach(function(rv) {
          allReviews.push({
            rating: rv.stars || rv.rating || 0,
            text: rv.text || rv.textTranslated || "",
            authorName: rv.name || rv.reviewerName || "\u0410\u043d\u043e\u043d\u0438\u043c",
            date: rv.publishedAtDate || rv.date || "",
            _place: placeName,
            _placeRating: place.totalScore || place.rating,
            _placeReviewCount: place.reviewsCount
          });
        });
      }
    });

    // If no reviews in nested structure, items themselves might be reviews
    if (allReviews.length === 0 && items.length > 0 && items[0].stars !== undefined) {
      allReviews = items.map(function(rv) {
        return {
          rating: rv.stars || rv.rating || 0,
          text: rv.text || rv.textTranslated || "",
          authorName: rv.name || rv.reviewerName || "\u0410\u043d\u043e\u043d\u0438\u043c",
          date: rv.publishedAtDate || rv.date || ""
        };
      });
    }

    _allReviews = allReviews.filter(function(r) { return r.rating || r.text; });

    if (_allReviews.length > 0) {
      renderReviewStats(_allReviews);
      _revFilter = "all";
      renderReviewCards();
      if (status) status.textContent = "\u2705 " + _allReviews.length + " \u043e\u0442\u0437\u044b\u0432\u043e\u0432 \u0438\u0437 Google Maps | " + uniName;
      cacheWrite("uni_reviews_gmaps", CFG.name || "uni", _allReviews);
    } else {
      if (status) status.textContent = "\u26a0\ufe0f \u041e\u0442\u0437\u044b\u0432\u044b \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u044b. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0443\u043d\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u0430 \u0432 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430\u0445";
      if (content) content.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa">' +
        '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u043d\u0430\u0439\u0442\u0438 \u043e\u0442\u0437\u044b\u0432\u044b \u0434\u043b\u044f <b>' + uniName + '</b> \u0432 Google Maps.<br>' +
        '\u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u0432 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0430\u0445 \u2699\ufe0f' +
      '</div>';
    }
  } catch(e) {
    if (status) status.textContent = "\u26a0\ufe0f " + e.message;
    // Try cache
    var cached = await cacheRead("uni_reviews_gmaps", CFG.name || "uni");
    if (cached && cached.items && cached.items.length) {
      _allReviews = cached.items;
      renderReviewStats(_allReviews);
      renderReviewCards();
      if (status) status.textContent = "\uD83D\uDCBE \u0418\u0437 \u043a\u0435\u0448\u0430: " + _allReviews.length + " \u043e\u0442\u0437\u044b\u0432\u043e\u0432";
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}


// === PHASE 5: GLOBAL TRENDS ===
async function loadGlobalTrends() {
  var btn=document.getElementById("trends-btn"), status=document.getElementById("trends-status");
  if(btn) btn.disabled=true;
  var tags=["universitytiktok","studytok","collegelife","universitylife","studentlife"];
  var allVideos=[];
  for(var hi=0;hi<tags.length;hi++){
    if(status) status.textContent="\u23F3 #"+tags[hi]+" ("+( hi+1)+"/"+tags.length+")...";
    try {
      var items=await apifyRunCompetitor("__tr"+hi+"__","#"+tags[hi],function(msg){if(status)status.textContent=msg;},{
        actorId:"clockworks/tiktok-hashtag-scraper",
        input:{hashtags:[tags[hi]],resultsPerPage:30}
      });
      allVideos=allVideos.concat(items);
    } catch(e){console.warn("trend err #"+tags[hi],e.message);}
  }
  var seen={};
  var deduped=allVideos.filter(function(v){var id=v.id||v.url||"";if(seen[id])return false;seen[id]=true;return true;});
  deduped.sort(function(a,b){return ((b.stats&&b.stats.playCount)||b.playCount||0)-((a.stats&&a.stats.playCount)||a.playCount||0);});
  var top=deduped.slice(0,50);
  if(status) status.textContent="\u2705 \u041d\u0430\u0439\u0434\u0435\u043d\u043e: "+top.length;
  renderTrends(top);
  cacheWrite("uni_trends_global","global",top);
  if(btn) btn.disabled=false;
}

function renderTrends(videos) {
  var el = document.getElementById("trends-content");
  if (!el) return;
  if (!videos.length) {
    el.innerHTML = '<div style="text-align:center;padding:60px;color:#ccc">\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445</div>';
    return;
  }

  var abbr = (CFG && CFG.abbr) ? CFG.abbr : (CFG && CFG.name ? CFG.name.split(" ")[0] : "");

  function trendInsight(desc, views, likes) {
    var d = (desc || "").toLowerCase();
    var er = views > 0 ? ((likes / views) * 100).toFixed(1) : 0;
    var erAvg = 2.1; // avg ER for #studytok
    var erMulti = er > 0 ? (er / erAvg).toFixed(1) : null;

    // Detect format
    var fmt = "";
    var idea = "";
    if (d.indexOf("day in my life") >= 0 || d.indexOf("a day") >= 0 || d.indexOf("день") >= 0) {
      fmt = "\u0424\u043e\u0440\u043c\u0430\u0442 \u00ab\u0434\u0435\u043d\u044c \u0438\u0437 \u0436\u0438\u0437\u043d\u0438\u00bb \u2014 \u21161 \u0432 #studytok";
      idea = "\u0414\u0435\u043d\u044c \u0438\u0437 \u0436\u0438\u0437\u043d\u0438 \u0441\u0442\u0443\u0434\u0435\u043d\u0442\u0430 " + abbr + " \u2014 \u0443\u0442\u0440\u043e, \u043f\u0430\u0440\u044b, \u043a\u0430\u043c\u043f\u0443\u0441";
    } else if (d.indexOf("campus") >= 0 || d.indexOf("\u043a\u0430\u043c\u043f\u0443\u0441") >= 0 || d.indexOf("tour") >= 0) {
      fmt = "\u0422\u0443\u0440 \u043f\u043e \u043a\u0430\u043c\u043f\u0443\u0441\u0443 \u2014 \u0437\u0440\u0438\u0442\u0435\u043b\u044c \u0432\u0438\u0434\u0438\u0442 \u0441\u0435\u0431\u044f \u043d\u0430 \u043c\u0435\u0441\u0442\u0435 \u0441\u0442\u0443\u0434\u0435\u043d\u0442\u0430";
      idea = "\u0422\u0443\u0440 \u043f\u043e \u043a\u0430\u043c\u043f\u0443\u0441\u0443 " + abbr + " \u2014 \u0430\u0443\u0434\u0438\u0442\u043e\u0440\u0438\u0438, \u043b\u0430\u0431\u043e\u0440\u0430\u0442\u043e\u0440\u0438\u0438";
    } else if (d.indexOf("study") >= 0 || d.indexOf("exam") >= 0 || d.indexOf("hack") >= 0) {
      fmt = "\u041b\u0430\u0439\u0444\u0445\u0430\u043a\u0438 \u2014 \u0432\u044b\u0441\u043e\u043a\u0430\u044f \u0441\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u043c\u043e\u0441\u0442\u044c \u0432\u0438\u0434\u0435\u043e";
      idea = "\u041b\u0430\u0439\u0444\u0445\u0430\u043a\u0438 \u0434\u043b\u044f \u0441\u0442\u0443\u0434\u0435\u043d\u0442\u043e\u0432 " + abbr + " \u2014 \u043a\u0430\u043a \u0443\u0447\u0438\u0442\u044c\u0441\u044f, \u0441\u0434\u0430\u0432\u0430\u0442\u044c";
    } else if (d.indexOf("graduat") >= 0 || d.indexOf("\u0432\u044b\u043f\u0443\u0441\u043a") >= 0) {
      fmt = "\u0412\u044b\u043f\u0443\u0441\u043a \u2014 \u044d\u043c\u043e\u0446\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u044c \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442";
      idea = "\u0412\u044b\u043f\u0443\u0441\u043a\u043d\u043e\u0439 \u0432\u0435\u0447\u0435\u0440 " + abbr + " 2026";
    } else if (d.indexOf("professor") >= 0 || d.indexOf("teacher") >= 0 || d.indexOf("\u043f\u0440\u0435\u043f\u043e\u0434\u0430\u0432") >= 0) {
      fmt = "\u041f\u0440\u0435\u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435\u043b\u044c \u0432 \u0440\u043e\u043b\u0438 \u0433\u0435\u0440\u043e\u044f \u2014 \u043e\u0447\u0435\u043d\u044c \u043f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u044b\u0439 \u0444\u043e\u0440\u043c\u0430\u0442";
      idea = "\u0418\u043d\u0442\u0435\u0440\u0432\u044c\u044e \u0441 \u043f\u0440\u0435\u043f\u043e\u0434\u0430\u0432\u0430\u0442\u0435\u043b\u0435\u043c " + abbr;
    } else {
      fmt = "\u0412\u0438\u0440\u0443\u0441\u043d\u044b\u0439 \u043a\u043e\u043d\u0442\u0435\u043d\u0442 \u2014 \u0434\u043e \u043a\u043e\u043d\u0446\u0430 \u0441\u043c\u043e\u0442\u0440\u044f\u0442 90%+ \u0437\u0440\u0438\u0442\u0435\u043b\u0435\u0439";
      idea = "\u0410\u0434\u0430\u043f\u0442\u0438\u0440\u0443\u0439\u0442\u0435 \u0444\u043e\u0440\u043c\u0430\u0442 \u0434\u043b\u044f " + abbr;
    }

    var insight = '<div style="background:#F9F0FF;border-radius:8px;padding:10px 12px;margin-top:10px;font-size:11px">' +
      '<div style="font-weight:700;color:#7C3AED;margin-bottom:6px">\ud83d\udcca \u041f\u043e\u0447\u0435\u043c\u0443 \u0432\u0438\u0440\u0443\u0441\u043d\u043e\u0435:</div>' +
      '<div style="color:#555;margin-bottom:3px">\u2022 ' + fmt + '</div>' +
      (erMulti && parseFloat(erMulti) > 1 ? '<div style="color:#555;margin-bottom:3px">\u2022 ER ' + er + '% \u2014 \u0432 ' + erMulti + '\u00d7 \u0432\u044b\u0448\u0435 \u0441\u0440\u0435\u0434\u043d\u0435\u0433\u043e \u043f\u043e \u043d\u0438\u0448\u0435</div>' : '') +
      (views > 500000 ? '<div style="color:#555;margin-bottom:3px">\u2022 ' + (views > 1000000 ? "\u041c\u0438\u043b\u043b\u0438\u043e\u043d\u043d\u0438\u043a" : "\u041f\u043e\u043b\u0443\u043c\u0438\u043b\u043b\u0438\u043e\u043d\u043d\u0438\u043a") + ' \u2014 \u0432\u044b\u0448\u0435 \u043f\u043e\u0440\u043e\u0433\u0430 \u0432\u0438\u0440\u0443\u0441\u043d\u043e\u0441\u0442\u0438</div>' : '') +
    '</div>' +
    (idea && abbr ? '<div style="background:#ECFDF5;border-radius:8px;padding:10px 12px;margin-top:6px;font-size:11px">' +
      '<div style="font-weight:700;color:#059669;margin-bottom:4px">\ud83d\udca1 \u0418\u0434\u0435\u044f \u0434\u043b\u044f ' + abbr + ':</div>' +
      '<div style="color:#065F46">' + idea + '</div>' +
    '</div>' : '');

    return insight;
  }

  el.innerHTML = videos.map(function(v, i) {
    var views = (v.stats && v.stats.playCount) || v.playCount || v.plays || 0;
    var likes = (v.stats && v.stats.diggCount) || v.diggCount || v.likes || 0;
    var desc  = v.desc || v.text || v.description || "";
    var author = (v.authorMeta && v.authorMeta.name) || (v.author && v.author.uniqueId) || v.author || "";
    var url   = v.webVideoUrl || v.url || ("https://www.tiktok.com/@" + author + "/video/" + (v.id || ""));
    var tags  = v.hashtags || v.challenges || [];
    if (typeof tags === "string") { try { tags = JSON.parse(tags); } catch(e) { tags = []; } }
    var tagArr = Array.isArray(tags) ? tags.slice(0,5).map(function(h) {
      return typeof h === "object" ? (h.name || h.title || "") : String(h);
    }).filter(Boolean) : [];

    var medal = i === 0 ? "\uD83E\uDD47" : i === 1 ? "\uD83E\uDD48" : i === 2 ? "\uD83E\uDD49" : ("#" + (i+1));

    return '<div class="trend-card">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">' +
        '<div>' +
          '<div style="font-size:11px;color:#EC4899;font-weight:800;margin-bottom:2px">' + medal + '</div>' +
          '<div class="trend-views">' + fmtNum(views) + '</div>' +
          '<div class="trend-views-label">\u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u043e\u0432</div>' +
        '</div>' +
        '<div style="text-align:right">' +
          '<div style="font-size:11px;font-weight:700;color:#555">@' + author + '</div>' +
          '<div style="font-size:10px;color:#aaa">\u2764 ' + fmtNum(likes) + '</div>' +
          (views > 0 ? '<div style="font-size:10px;color:#EC4899;font-weight:700">ER ' + ((likes/views)*100).toFixed(1) + '%</div>' : '') +
        '</div>' +
      '</div>' +
      '<div class="trend-desc">' + (desc.substring(0, 180) || "\u2014") + '</div>' +
      (tagArr.length ? '<div class="trend-tags">' + tagArr.map(function(t) {
        return '<span class="trend-tag">#' + t + '</span>';
      }).join("") + '</div>' : '') +
      trendInsight(desc, views, likes) +
      '<div style="margin-top:10px;text-align:right">' +
        '<a href="' + url + '" target="_blank" style="font-size:11px;color:#EC4899;font-weight:700;text-decoration:none;padding:5px 12px;border:1.5px solid #FBCFE8;border-radius:8px">\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u2192</a>' +
      '</div>' +
    '</div>';
  }).join("");
}



// ═══════════════════════════════════════════════
// EXCEL EXPORT
// ═══════════════════════════════════════════════
function exportToExcel() {
  if (typeof XLSX === "undefined") {
    alert("\u0411\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0430 XLSX \u043d\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u0430");
    return;
  }

  var wb = XLSX.utils.book_new();
  var uniName = (CFG && CFG.name) ? CFG.name : "\u0423\u043d\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442";
  var dateStr = new Date().toLocaleDateString("ru", {day:"2-digit", month:"2-digit", year:"numeric"});

  // ── Sheet 1: Instagram ──
  var igPosts = (typeof _igAllPosts !== "undefined" && _igAllPosts) ? _igAllPosts : [];
  if (igPosts.length > 0) {
    var igRows = igPosts.map(function(p) {
      var ts = p.timestamp || p.taken_at_timestamp || p.takenAtTimestamp || "";
      var date = "";
      if (ts) { try { date = new Date(typeof ts === "number" ? (ts > 2e10 ? ts : ts * 1000) : ts).toLocaleDateString("ru"); } catch(e){} }
      var sc = p.shortCode || p.shortcode || "";
      return {
        "\u0414\u0430\u0442\u0430": date,
        "\u0410\u0432\u0442\u043e\u0440": "@" + (p.ownerUsername || p.username || ""),
        "\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f": (function(){var ci=catInfo(categorize(p.caption||p.alt||p.text||""));return ci.emoji+" "+ci.label;})(),
        "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435": (p.caption || p.alt || p.text || "").substring(0, 300),
        "\u041b\u0430\u0439\u043a\u0438": p.likesCount || p.likes || 0,
        "\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438": p.commentsCount || p.comments || 0,
        "\u0421\u0441\u044b\u043b\u043a\u0430": sc ? "https://www.instagram.com/p/" + sc + "/" : (p.url || "")
      };
    });
    var wsIg = XLSX.utils.json_to_sheet(igRows);
    wsIg["!cols"] = [{wch:12},{wch:20},{wch:22},{wch:60},{wch:10},{wch:14},{wch:45}];
    XLSX.utils.book_append_sheet(wb, wsIg, "Instagram");
  }

  // ── Sheet 2: TikTok ──
  var ttVideos = (typeof _lastTTVideos !== "undefined" && _lastTTVideos) ? _lastTTVideos : [];
  if (ttVideos.length > 0) {
    var ttRows = ttVideos.map(function(v) {
      var ts = v.createTime || v.createTimeISO || v.timestamp || "";
      var date = "";
      if (ts) { try { date = new Date(typeof ts === "number" ? (ts > 2e10 ? ts : ts * 1000) : ts).toLocaleDateString("ru"); } catch(e){} }
      var views = (v.stats && v.stats.playCount) || v.playCount || 0;
      var likes = (v.stats && v.stats.diggCount) || v.diggCount || 0;
      var author = (v.authorMeta && v.authorMeta.name) || (v.author && v.author.uniqueId) || v.author || "";
      return {
        "\u0414\u0430\u0442\u0430": date,
        "\u0410\u0432\u0442\u043e\u0440": "@" + author,
        "\u041e\u043f\u0438\u0441\u0430\u043d\u0438\u0435": (v.desc || v.text || v.description || "").substring(0, 300),
        "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u044b": views,
        "\u041b\u0430\u0439\u043a\u0438": likes,
        "\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438": (v.stats && v.stats.commentCount) || v.commentCount || 0,
        "ER%": views > 0 ? ((likes / views) * 100).toFixed(2) : 0,
        "\u0421\u0441\u044b\u043b\u043a\u0430": v.webVideoUrl || v.url || ""
      };
    });
    var wsTt = XLSX.utils.json_to_sheet(ttRows);
    wsTt["!cols"] = [{wch:12},{wch:20},{wch:60},{wch:12},{wch:10},{wch:14},{wch:8},{wch:50}];
    XLSX.utils.book_append_sheet(wb, wsTt, "TikTok");
  }

  // ── Sheet 3: Reviews ──
  if (typeof _allReviews !== "undefined" && _allReviews && _allReviews.length > 0) {
    var revRows = _allReviews.map(function(rv) {
      var date = "";
      if (rv.dateCreated || rv.date || rv.publishedAtDate) {
        try { date = new Date(rv.dateCreated || rv.date || rv.publishedAtDate).toLocaleDateString("ru"); } catch(e){}
      }
      var sent = (rv.rating||0) >= 4 ? "\u041f\u043e\u0437\u0438\u0442\u0438\u0432" : (rv.rating||0) <= 2 ? "\u041d\u0435\u0433\u0430\u0442\u0438\u0432" : "\u041d\u0435\u0439\u0442\u0440\u0430\u043b";
      return {
        "\u0414\u0430\u0442\u0430": date,
        "\u0410\u0432\u0442\u043e\u0440": (rv.author && rv.author.name) || rv.authorName || rv.name || "\u0410\u043d\u043e\u043d\u0438\u043c",
        "\u041e\u0446\u0435\u043d\u043a\u0430": rv.rating || 0,
        "\u0422\u043e\u043d": sent,
        "\u0424\u0438\u043b\u0438\u0430\u043b": rv._branch || rv._place || "",
        "\u0422\u0435\u043a\u0441\u0442": (rv.text || rv.body || rv.comment || rv.textTranslated || "").substring(0, 500)
      };
    });
    var wsRev = XLSX.utils.json_to_sheet(revRows);
    wsRev["!cols"] = [{wch:12},{wch:25},{wch:8},{wch:12},{wch:30},{wch:80}];
    XLSX.utils.book_append_sheet(wb, wsRev, "\u041e\u0442\u0437\u044b\u0432\u044b");
  }

  // ── Sheet 4: Summary ──
  var summaryRows = [
    {"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c": "\u0423\u043d\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442", "\u0417\u043d\u0430\u0447\u0435\u043d\u0438\u0435": uniName},
    {"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c": "\u0414\u0430\u0442\u0430 \u044d\u043a\u0441\u043f\u043e\u0440\u0442\u0430", "\u0417\u043d\u0430\u0447\u0435\u043d\u0438\u0435": dateStr},
    {"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c": "---"},
    {"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c": "\u041f\u043e\u0441\u0442\u043e\u0432 Instagram", "\u0417\u043d\u0430\u0447\u0435\u043d\u0438\u0435": igPosts.length},
    {"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c": "\u041b\u0430\u0439\u043a\u043e\u0432 Instagram", "\u0417\u043d\u0430\u0447\u0435\u043d\u0438\u0435": igPosts.reduce(function(s,p){return s+(p.likesCount||p.likes||0);},0)},
    {"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c": "\u0412\u0438\u0434\u0435\u043e TikTok", "\u0417\u043d\u0430\u0447\u0435\u043d\u0438\u0435": ttVideos.length},
    {"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c": "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u043e\u0432 TikTok", "\u0417\u043d\u0430\u0447\u0435\u043d\u0438\u0435": ttVideos.reduce(function(s,v){return s+((v.stats&&v.stats.playCount)||v.playCount||0);},0)},
    {"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c": "\u041e\u0442\u0437\u044b\u0432\u043e\u0432 Google Maps", "\u0417\u043d\u0430\u0447\u0435\u043d\u0438\u0435": (typeof _allReviews !== "undefined" && _allReviews) ? _allReviews.length : 0}
  ];
  var wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary["!cols"] = [{wch:30},{wch:20}];
  XLSX.utils.book_append_sheet(wb, wsSummary, "\u0421\u0432\u043e\u0434\u043a\u0430");

  // Download
  var filename = uniName.replace(/\s+/g, "_") + "_analytics_" + dateStr.replace(/\./g, "-") + ".xlsx";
  XLSX.writeFile(wb, filename);
}

function loadIGFromExcel(input) {
  var file = input.files[0]; if (!file) return;
  if (typeof XLSX === "undefined") { showError("\u0411\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0430 Excel \u043d\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u043b\u0430\u0441\u044c."); return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var wb = XLSX.read(new Uint8Array(e.target.result), {type:"array", cellDates:true});
      var ws = wb.Sheets[wb.SheetNames[0]];
      var rows = XLSX.utils.sheet_to_json(ws, {defval:""});
      if (!rows.length) { showError("Excel \u0444\u0430\u0439\u043b \u043f\u0443\u0441\u0442\u043e\u0439."); return; }
      function gc(row,names){for(var i=0;i<names.length;i++){var v=row[names[i]];if(v!==undefined&&v!==null&&v!=="")return v;}return "";}
      var posts = [];
      for (var ri = 0; ri < rows.length; ri++) {
        var row = rows[ri];
        var dv=gc(row,["\u0414\u0430\u0442\u0430","Date","date","\u0434\u0430\u0442\u0430","timestamp","\u0412\u0440\u0435\u043c\u044f","created_at"]);
        var cap=gc(row,["\u041f\u043e\u0434\u043f\u0438\u0441\u044c","\u0422\u0435\u043a\u0441\u0442","Caption","Text","caption","text"]);
        var lk=gc(row,["\u041b\u0430\u0439\u043a\u0438","Likes","likes","likesCount"]);
        var cm=gc(row,["\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438","Comments","comments","commentsCount"]);
        var url=gc(row,["\u0421\u0441\u044b\u043b\u043a\u0430","URL","url","Link","link"]);
        var au=gc(row,["\u0410\u0432\u0442\u043e\u0440","Author","author","ownerUsername","username"]);
        var ts = null;
        if (dv) {
          if (dv instanceof Date && !isNaN(dv)) { ts = dv.toISOString(); }
          else if (typeof dv === "number") { ts = new Date((dv-25569)*86400*1000).toISOString(); }
          else { var pd=new Date(String(dv).replace(/(\d{2})\.(\d{2})\.(\d{4})/,"$3-$2-$1")); if(!isNaN(pd))ts=pd.toISOString(); }
        }
        if (!ts) ts = new Date("2026-01-"+(String(ri+1).padStart(2,"0"))).toISOString();
        var caption=String(cap||"").trim();
        var likesN=parseInt(String(lk).replace(/[^0-9]/g,""))||0;
        var cmN=parseInt(String(cm).replace(/[^0-9]/g,""))||0;
        if (!caption && !likesN) continue;
        posts.push({timestamp:ts,likesCount:likesN,commentsCount:cmN,caption:caption,ownerUsername:String(au||CFG.ig||"").replace("@",""),url:String(url||"#").trim()||"#"});
      }
      if (!posts.length) { showError("\u041d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e \u043f\u043e\u0441\u0442\u043e\u0432 \u0432 \u0444\u0430\u0439\u043b\u0435."); return; }
      posts.sort(function(a,b){return new Date(b.timestamp)-new Date(a.timestamp);});
      var lvKey = "lv_"+(CFG.ig||CFG.tt||CFG.name).replace(/[^a-z0-9]/gi,"_").toLowerCase();
      var lv = localStorage.getItem(lvKey) || "2025-12-31T23:59:59Z";
      renderIG(posts, lv, fmtDate(lv));
      (function(){var _el=document.getElementById("gen-ig-posts");if(_el)_el.textContent=posts.length;})();
      var wb2=document.getElementById("warnBar");
      if (wb2){wb2.textContent="\uD83D\uDCC2 \u0417\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u043e: "+posts.length+" \u043f\u043e\u0441\u0442\u043e\u0432";wb2.style.display="block";setTimeout(function(){wb2.style.display="none";},5000);}
    } catch(ex) { showError("\u041e\u0448\u0438\u0431\u043a\u0430 Excel: " + ex.message); }
  };
  reader.readAsArrayBuffer(file);
  input.value = "";
}
function downloadIGTemplate() {
  if (typeof XLSX === "undefined") { showError("\u0411\u0438\u0431\u043b\u0438\u043e\u0442\u0435\u043a\u0430 Excel \u043d\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u043b\u0430\u0441\u044c."); return; }
  var ig = CFG.ig || "your_account";
  var data = [["\u0414\u0430\u0442\u0430","\u041f\u043e\u0434\u043f\u0438\u0441\u044c","\u041b\u0430\u0439\u043a\u0438","\u041a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u0438","\u0421\u0441\u044b\u043b\u043a\u0430","\u0410\u0432\u0442\u043e\u0440"],["15.01.2026","\u0422\u0435\u043a\u0441\u0442 \u043f\u043e\u0441\u0442\u0430",150,12,"https://www.instagram.com/p/XXXX/",ig]];
  var ws = XLSX.utils.aoa_to_sheet(data);
  var wbk = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wbk, ws, "Instagram");
  XLSX.writeFile(wbk, "template.xlsx");
}
function switchTab(tab, el) {
  document.querySelectorAll(".plat-tab").forEach(function(t){t.classList.remove("active");});
  el.classList.add("active");
  document.querySelectorAll(".tab-panel").forEach(function(p){p.classList.remove("active");});
  document.getElementById("panel-" + tab).classList.add("active");
}
