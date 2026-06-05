var CFG = {};
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
  CFG = {name: name, abbr: abbr || name.charAt(0), ig: ig, tt: tt, token: token, location: loc};
  localStorage.setItem("uni_cfg_v4", JSON.stringify({name: name, abbr: CFG.abbr, ig: ig, tt: tt, location: loc}));
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
  for (var i = 0; i < 72; i++) {
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
  throw new Error(label + ": timeout 6 \u043c\u0438\u043d");
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
      // 1. Try full 2026 history from Supabase first
      var igDb = await supaRead("uni_ig_2026", CFG.ig);
      var igItems;
      if (igDb && igDb.items && igDb.items.length) {
        igItems = igDb.items;
        setStep("ig", "done");
        (function(){var _el=document.getElementById("loadingText");if(_el)_el.textContent="\uD83D\uDCF8 Instagram \u2014 \u0438\u0437 \u0431\u0430\u0437\u044b (" + igDb.count + " \u043f\u043e\u0441\u0442\u043e\u0432)";})();
      } else {
        // 2. Try 6h cache
        var igCache = await cacheRead("uni_ig_posts", CFG.ig);
        if (igCache && igCache.fresh && igCache.items && igCache.items.length) {
          igItems = igCache.items;
          setStep("ig", "done");
          (function(){var _el=document.getElementById("loadingText");if(_el)_el.textContent="\uD83D\uDCF8 Instagram \u2014 \u0438\u0437 \u043a\u044d\u0448\u0430";})();
        } else {
          // 3. Fetch from Apify
          igItems = await apifyRun("apify~instagram-scraper",
            (function(){
              var h = CFG.ig.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/^\/+|\/+$/g, "").replace(/^@/, "").trim();
              return {directUrls: ["https://www.instagram.com/" + h + "/"], resultsType: "posts", resultsLimit: 30, addParentData: false};
            })(),
            "ig", "\uD83D\uDCF8 Instagram"
          );
          cacheWrite("uni_ig_posts", CFG.ig, igItems);
        }
      }
      var posts = igItems.filter(function(p) { var ts = p.timestamp || p.taken_at_timestamp || p.takenAtTimestamp; return is2026(ts); });
      if (igItems.length > 0 && posts.length === 0) posts = igItems;
      renderIG(posts, lastVisit, lastDisp);
      (function(){var _el=document.getElementById("gen-ig-posts");if(_el)_el.textContent=posts.length;})();
      updateGenProfile(posts, null, null); _syncGenSummary();
    } else {
      (function(){var _el=document.getElementById("ig-content");if(_el)_el.innerHTML=emptyState("Instagram \u0430\u043a\u043a\u0430\u0443\u043d\u0442 \u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d", "\uD83D\uDCF8", "\u041e\u0442\u043a\u0440\u043e\u0439\u0442\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438");})();
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
  IG_CATS.forEach(function(c){counts[c.id]=0;});
  posts.forEach(function(p){
    var cid = categorize(p.caption||p.alt||p.text||"");
    if (counts[cid] !== undefined) counts[cid]++; else counts.other++;
  });
  posts.forEach(function(p){
    if (categorize(p.caption||p.alt||p.text||"") === "other") counts.other++;
  });
  // filter bar
  var fb = '<div class="ig-filter-bar">';
  fb += '<button class="ig-cat-btn'+((_igActiveCat==="all")?" active":"")+'" onclick="setIgFilter(\'all\')">\u0412\u0441\u0435 <span class="ig-cat-count">'+counts.all+'</span></button>';
  IG_CATS.forEach(function(c){
    if (!counts[c.id]) return;
    fb += '<button class="ig-cat-btn'+((_igActiveCat===c.id)?" active":"")+'" onclick="setIgFilter(\''+c.id+'\')">'+c.emoji+' '+c.label+' <span class="ig-cat-count">'+counts[c.id]+'</span></button>';
  });
  if (counts.other) fb += '<button class="ig-cat-btn'+((_igActiveCat==="other")?" active":"")+'" onclick="setIgFilter(\'other\')">\u{1F4CC} \u0420\u0430\u0437\u043d\u043e\u0435 <span class="ig-cat-count">'+counts.other+'</span></button>';
  fb += '</div>';
  var filtered = _igActiveCat === "all" ? posts : posts.filter(function(p){
    var cid = categorize(p.caption||p.alt||p.text||"");
    return _igActiveCat === "other" ? (cid === "other") : (cid === _igActiveCat);
  });
  var nP = filtered.filter(function(p){return isNew(igTs(p),lv);});
  var oP = filtered.filter(function(p){return !isNew(igTs(p),lv);});
  var h = fb;
  if (nP.length) h += sepNew("\u{1F4F8} \u041d\u043e\u0432\u043e\u0435 \u0432 Instagram \u2014 \u0441 "+ld)+'<div class="tt-grid">'+nP.map(function(p){return igCard(p,true);}).join("")+"</div>";
  if (oP.length) h += sepOld("\u0411\u044b\u043b\u043e \u043f\u0440\u0438 \u043f\u0440\u043e\u0448\u043b\u043e\u043c \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0438")+'<div class="tt-grid">'+oP.map(function(p){return igCard(p,false);}).join("")+"</div>";
  if (!filtered.length) h += emptyState("\u041d\u0435\u0442 \u043f\u043e\u0441\u0442\u043e\u0432 \u0432 \u044d\u0442\u043e\u0439 \u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438","\u{1F4F8}","");
  (function(){var _el=document.getElementById("ig-content");if(_el)_el.innerHTML=h;})();
}
function igCard(p, isN) {
  var cap = p.caption || p.alt || p.text || "";
  var s = sentiment(cap);
  var vr = (p.likesCount || p.likes || 0) > 500;
  var owner = (p.ownerUsername || p.username || CFG.ig || "").replace(/^https?:\/\/[^/]*\//, "").replace(/\/$/, "").replace(/^@/, "");
  var isProfile = CFG.ig && owner.toLowerCase() === CFG.ig.toLowerCase();
  var sc = p.shortCode || p.shortcode || "";
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
    '<div class="caption">' + (cap ? cap.substring(0, 400) : '\u2014') + '</div>' +
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
  var nV = videos.filter(function(v) { return isNew(gTs(v), lv); });
  var oV = videos.filter(function(v) { return !isNew(gTs(v), lv); });
  var tViews = videos.reduce(function(s,v) { return s + gP(v); }, 0);
  var tLikes = videos.reduce(function(s,v) { return s + gL(v); }, 0);
  (function(){var _el=document.getElementById("tt-stat-videos");if(_el)_el.textContent=videos.length;})();
  (function(){var _el=document.getElementById("tt-stat-views");if(_el)_el.textContent=fmtNum(tViews);})();
  (function(){var _el=document.getElementById("tt-stat-likes");if(_el)_el.textContent=fmtNum(tLikes);})();
  (function(){var _el=document.getElementById("tt-stat-avg");if(_el)_el.textContent=videos.length ? fmtNum(Math.round(tViews/videos.length)) : 0;})();
  (function(){var _el=document.getElementById("tt-stat-er");if(_el)_el.textContent=videos.length && tViews ? ((tLikes/tViews)*100).toFixed(1) + "%" : "\u2014";})();
  (function(){var _el=document.getElementById("tt-count");if(_el)_el.textContent=videos.length + " \u0432\u0438\u0434\u0435\u043e \u00B7 " + nV.length + " \u043d\u043e\u0432\u044b\u0445";})();
  var h = "";
  if (nV.length) h += sepNew("\uD83C\uDFB5 \u041d\u043e\u0432\u043e\u0435 \u0432 TikTok \u2014 \u0441 " + ld) + "<div class=\"tiktok-grid\">" + nV.map(function(v) { return ttCard(v,gTs,gP,gL,gC,gS,gD,true); }).join("") + "</div>";
  if (oV.length) h += sepOld("\u0411\u044b\u043b\u043e \u043f\u0440\u0438 \u043f\u0440\u043e\u0448\u043b\u043e\u043c \u043e\u0431\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u0438") + "<div class=\"tiktok-grid\">" + oV.map(function(v) { return ttCard(v,gTs,gP,gL,gC,gS,gD,false); }).join("") + "</div>";
  if (!videos.length) h = emptyState("\u041d\u0435\u0442 \u0432\u0438\u0434\u0435\u043e", "\uD83C\uDFB5", "\u0414\u0430\u043d\u043d\u044b\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043d\u044b");
  (function(){var _el=document.getElementById("tt-content");if(_el)_el.innerHTML=h;})();
}
function ttCard(v,gTs,gP,gL,gC,gS,gD,isN) {
  var d = parseTs(gTs(v)) || new Date();
  var desc = gD(v);
  var url = v.webVideoUrl || v.url || ("https://www.tiktok.com/@" + ((v.authorMeta && v.authorMeta.name) || "") + "/video/" + (v.id || ""));
  var authorName = (v.authorMeta && v.authorMeta.name) || (v.author && v.author.uniqueId) || v.author || "";
  var views = gP(v), lks = gL(v), cms = gC(v), shs = gS(v);
  var viral = views > 100000;
  var isAlmaU = authorName.toLowerCase().indexOf(CFG.tt ? CFG.tt.toLowerCase() : "almau") >= 0 ||
                (desc && desc.toLowerCase().indexOf(CFG.tt ? CFG.tt.toLowerCase() : "almau") >= 0);
  var hashtags = v.hashtags || v.challenges || [];
  if (typeof hashtags === "string") { try { hashtags = JSON.parse(hashtags); } catch(e) { hashtags = []; } }
  var tags = Array.isArray(hashtags) ? hashtags.slice(0,5).map(function(h){ return typeof h === "object" ? (h.name || h.title || "") : String(h); }).filter(Boolean) : [];
  return '<div class="tt-card' + (isAlmaU ? " is-almau" : "") + '">' +
    '<div class="tt-head">' +
      '<div>' +
        '<div class="tt-author">@' + authorName + '</div>' +
        '<div class="tt-date">' + d.toLocaleDateString("ru", {day:"numeric",month:"long",year:"numeric"}) + '</div>' +
      '</div>' +
      '<div class="badges">' +
        (isAlmaU ? '<span class="tt-almau-badge">' + (CFG.tt ? "#"+CFG.tt : "AlmaU") + '</span>' : '') +
        (viral ? '<span class="b b-viral">\u0432\u0438\u0440\u0443\u0441</span>' : '') +
      '</div>' +
    '</div>' +
    '<div class="tt-caption">' + (desc ? desc.substring(0,300) : "\u2014") + '</div>' +
    (tags.length ? '<div class="tt-hashtags">' + tags.map(function(t){ return '<span class="tt-tag">#'+t+'</span>'; }).join("") + '</div>' : '') +
    '<div class="tt-stats">' +
      '<span class="tt-views">\u25b6 ' + fmtNum(views) + '</span>' +
      '<span>\u2764 ' + fmtNum(lks) + '</span>' +
      '<span>\ud83d\udcac ' + fmtNum(cms) + '</span>' +
      (shs ? '<span>\u21a5 ' + fmtNum(shs) + '</span>' : '') +
      '<a class="tt-link" href="' + url + '" target="_blank">\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u2192</a>' +
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
