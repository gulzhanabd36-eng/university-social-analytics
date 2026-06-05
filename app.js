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
  var token = document.getElementById("apifyToken").value.trim();
  if (!name) { alert("Введите название университета"); return; }
  if (!token) { alert("Введите Apify API Token"); return; }
  if (!ig && !tt) { alert("Укажите хотя бы один аккаунт или хэштег"); return; }
  CFG = {name: name, abbr: abbr || name.charAt(0), ig: ig, tt: tt, token: token};
  localStorage.setItem("uni_cfg_v4", JSON.stringify({name: name, abbr: CFG.abbr, ig: ig, tt: tt}));
  document.getElementById("headerTitle").textContent = name + " — Analytics";
  document.getElementById("headerAbbr").textContent = CFG.abbr.charAt(0).toUpperCase();
  document.getElementById("genFullName").textContent = name;
  document.getElementById("genIG").textContent = ig ? "@" + ig : "—";
  document.getElementById("genTT").textContent = tt ? "#" + tt : "—";
  document.getElementById("igStatHandle").textContent = ig ? "@" + ig : "—";
  document.getElementById("ttStatHandle").textContent = tt ? "#" + tt : "—";
  document.getElementById("setupOverlay").style.display = "none";
  document.getElementById("app").style.display = "block";
  realRefresh();
}

function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }
function fmtNum(n) { n = Number(n) || 0; if (n >= 1000000) return (n/1000000).toFixed(1) + "M"; if (n >= 1000) return (n/1000).toFixed(1) + "K"; return String(n); }
function parseTs(ts) { if (!ts) return null; if (typeof ts === "number") return ts > 2e10 ? new Date(ts) : new Date(ts*1000); return new Date(ts); }
function fmtDate(ts) { var d = parseTs(ts); if (!d || isNaN(d)) return "—"; return d.toLocaleDateString("ru", {day:"numeric",month:"long",year:"numeric"}); }
function isNew(ts, lv) { if (!ts) return false; var d = parseTs(ts); if (!d || isNaN(d)) return false; return d > new Date(lv); }
function is2026(ts) { if (!ts) return false; var d = parseTs(ts); if (!d || isNaN(d)) return false; return d.getFullYear() === 2026; }
function sentiment(t) {
  if (!t) return "neu"; t = t.toLowerCase();
  var p = ["побед","лучш","достиж","отлич","поздрав","успех","наград","перв","рекорд","золот","лидер","winner","award","best","top","ranked"];
  var n = ["скандал","провал","плох","ужас","проблем","жалоб","ошибк","штраф","scandal","fail","problem"];
  if (p.some(function(w) { return t.indexOf(w) >= 0; })) return "pos";
  if (n.some(function(w) { return t.indexOf(w) >= 0; })) return "neg";
  return "neu";
}
function sLbl(s) { return {pos:"позитив",neg:"негатив",neu:"нейтрально"}[s] || "нейтрально"; }
function sCls(s) { return {pos:"b-pos",neg:"b-neg",neu:"b-neu"}[s] || "b-neu"; }
function sepNew(l) { return "<div class=\"date-sep\"><div class=\"date-sep-line\"></div><div class=\"date-sep-text new-block\">" + l + "</div><div class=\"date-sep-line\"></div></div>"; }
function sepOld(l) { return "<div class=\"date-sep\"><div class=\"date-sep-line\"></div><div class=\"date-sep-text old-block\">" + l + "</div><div class=\"date-sep-line\"></div></div>"; }
function emptyState(m, i, s) { return "<div class=\"empty-state\"><div class=\"es-icon\">" + i + "</div><div class=\"es-text\">" + m + "</div>" + (s ? "<div class=\"es-sub\">" + s + "</div>" : "") + "</div>"; }
function setStep(id, st) { var el = document.getElementById("step-" + id); if (el) el.className = "step " + st; }
function showLoading(m) {
  document.getElementById("loadingBar").classList.remove("hidden");
  document.getElementById("refreshIcon").style.animation = "spin 1s linear infinite";
  document.querySelector(".refresh-btn").disabled = true;
  document.getElementById("loadingText").textContent = m;
  document.getElementById("errorBar").style.display = "none";
}
function hideLoading() {
  document.getElementById("loadingBar").classList.add("hidden");
  document.getElementById("refreshIcon").style.animation = "";
  document.querySelector(".refresh-btn").disabled = false;
}
function showError(m) { var el = document.getElementById("errorBar"); el.textContent = "❌ " + m; el.style.display = "block"; }

async function apifyRun(actorId, input, stepId, label) {
  setStep(stepId, "active");
  document.getElementById("loadingText").textContent = label + " — запускаем...";
  var r = await fetch("/.netlify/functions/apify-start", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({actorId: actorId, input: input, token: CFG.token})
  });
  var sd;
  try { sd = await r.json(); } catch(e) { throw new Error(label + ": неверный ответ"); }
  if (!r.ok || sd.error) throw new Error(label + ": " + (sd.error || sd.detail || r.status));
  var runId = sd.runId;
  for (var i = 0; i < 72; i++) {
    await sleep(5000);
    document.getElementById("loadingText").textContent = label + " — " + ((i+1)*5) + "с...";
    var pr = await fetch("/.netlify/functions/apify-poll", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({runId: runId, token: CFG.token, getItems: true})
    });
    var pd;
    try { pd = await pr.json(); } catch(e) { continue; }
    if (pd.status === "SUCCEEDED") { setStep(stepId, "done"); return pd.items || []; }
    if (["FAILED","ABORTED","TIMED-OUT"].indexOf(pd.status) >= 0) throw new Error(label + ": актор " + pd.status);
  }
  throw new Error(label + ": timeout 6 мин");
}

async function realRefresh() {
  if (isLoading) return;
  if (!CFG.token) { openSettings(); return; }
  isLoading = true;
  var lastKey = "lv_" + (CFG.ig || CFG.tt || CFG.name).replace(/[^a-z0-9]/gi, "_").toLowerCase();
  var lastVisit = localStorage.getItem(lastKey) || "2025-12-31T23:59:59Z";
  var lastDisp = fmtDate(lastVisit);
  setStep("ig", ""); setStep("tt", ""); setStep("web", "");
  showLoading("Подготовка...");
  try {
    if (CFG.ig) {
      var igItems = await apifyRun("apify/instagram-scraper",
        {usernames: [CFG.ig], resultsType: "posts", resultsLimit: 30},
        "ig", "📸 Instagram"
      );
      var posts = igItems.filter(function(p) { var ts = p.timestamp || p.taken_at_timestamp || p.takenAtTimestamp; return is2026(ts); });
      if (igItems.length > 0 && posts.length === 0) posts = igItems;
      renderIG(posts, lastVisit, lastDisp);
      document.getElementById("gen-ig-posts").textContent = posts.length;
    } else {
      document.getElementById("ig-content").innerHTML = emptyState("Instagram аккаунт не указан", "📸", "Откройте настройки");
    }
    if (CFG.tt) {
      var ttItems = await apifyRun("clockworks/tiktok-hashtag-scraper",
        {hashtags: [CFG.tt], resultsPerPage: 30},
        "tt", "🎵 TikTok"
      );
      var videos = ttItems.filter(function(v) { return is2026(v.createTime || v.createTimeISO || v.timestamp); });
      renderTT(videos, lastVisit, lastDisp);
      document.getElementById("gen-tt-videos").textContent = videos.length;
    } else {
      document.getElementById("tt-content").innerHTML = emptyState("TikTok хэштег не указан", "🎵", "Откройте настройки");
    }
    var q = "\"" + CFG.name + "\" 2026\n" + CFG.name + " site:tengrinews.kz OR site:informburo.kz 2026";
    var webItems = await apifyRun("apify/google-search-scraper",
      {queries: q, maxPagesPerQuery: 2, resultsPerPage: 10, languageCode: "ru", countryCode: "kz"},
      "web", "🌐 Интернет"
    );
    renderWeb(webItems, lastVisit, lastDisp);
    localStorage.setItem(lastKey, new Date().toISOString());
  } catch(e) {
    console.error(e); showError(e.message);
  } finally {
    isLoading = false; hideLoading();
    document.getElementById("lastUpdate").textContent = "Обновлено: " + new Date().toLocaleString("ru", {day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
  }
}

function igTs(p) { return p.timestamp || p.taken_at_timestamp || p.takenAtTimestamp || null; }
function renderIG(posts, lv, ld) {
  var nP = posts.filter(function(p) { return isNew(igTs(p), lv); });
  var oP = posts.filter(function(p) { return !isNew(igTs(p), lv); });
  var tL = posts.reduce(function(s,p) { return s + (p.likesCount || p.likes || 0); }, 0);
  var tC = posts.reduce(function(s,p) { return s + (p.commentsCount || p.comments || 0); }, 0);
  document.getElementById("ig-stat-posts").textContent = posts.length;
  document.getElementById("ig-stat-likes").textContent = fmtNum(tL);
  document.getElementById("ig-stat-comments").textContent = fmtNum(tC);
  document.getElementById("ig-stat-avg").textContent = posts.length ? Math.round(tL/posts.length) : 0;
  document.getElementById("ig-stat-new").textContent = nP.length;
  document.getElementById("ig-count").textContent = posts.length + " постов · " + nP.length + " новых";
  var h = "";
  if (nP.length) h += sepNew("📸 Новое в Instagram — с " + ld) + "<div class=\"grid\">" + nP.map(function(p) { return igCard(p, true); }).join("") + "</div>";
  if (oP.length) h += sepOld("Было при прошлом обновлении") + "<div class=\"grid\">" + oP.map(function(p) { return igCard(p, false); }).join("") + "</div>";
  if (!posts.length) h = emptyState("Нет постов", "📸", "Данные загружены");
  document.getElementById("ig-content").innerHTML = h;
}
function igCard(p, isN) {
  var cap = p.caption || p.alt || p.text || "";
  var s = sentiment(cap);
  var vr = (p.likesCount || p.likes || 0) > 500;
  var ip = CFG.ig && (p.ownerUsername || p.username || "").toLowerCase() === CFG.ig.toLowerCase();
  var sc = p.shortCode || p.shortcode || "";
  var url = p.url || (sc ? "https://www.instagram.com/p/" + sc + "/" : "#");
  return "<div class=\"card" + (isN ? " is-new" : "") + "\">" +
    "<div class=\"card-head\"><div><div class=\"author\">" + (p.ownerUsername || p.username || CFG.ig) + "</div><div class=\"date-sm\">" + fmtDate(igTs(p)) + "</div></div>" +
    "<div class=\"badges\">" + (isN ? "<span class=\"b b-new\">🆕 Новое</span>" : "") + (vr ? "<span class=\"b b-viral\">вирусный</span>" : "") +
    "<span class=\"b " + (ip ? "b-profile" : "b-mention") + "\">" + (ip ? "профиль" : "упоминание") + "</span>" +
    "<span class=\"b " + sCls(s) + "\">" + sLbl(s) + "</span></div></div>" +
    "<div class=\"caption\">" + cap.substring(0, 300) + "</div>" +
    "<div class=\"card-foot\"><div class=\"meta\"><span class=\"likes\">❤ " + fmtNum(p.likesCount || p.likes) + "</span><span>💬 " + fmtNum(p.commentsCount || p.comments) + "</span></div>" +
    "<a class=\"open-link\" href=\"" + url + "\" target=\"_blank\">Открыть →</a></div></div>";
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
  document.getElementById("tt-stat-videos").textContent = videos.length;
  document.getElementById("tt-stat-views").textContent = fmtNum(tViews);
  document.getElementById("tt-stat-likes").textContent = fmtNum(tLikes);
  document.getElementById("tt-stat-avg").textContent = videos.length ? fmtNum(Math.round(tViews/videos.length)) : 0;
  document.getElementById("tt-stat-er").textContent = videos.length && tViews ? ((tLikes/tViews)*100).toFixed(1) + "%" : "—";
  document.getElementById("tt-count").textContent = videos.length + " видео · " + nV.length + " новых";
  var h = "";
  if (nV.length) h += sepNew("🎵 Новое в TikTok — с " + ld) + "<div class=\"tiktok-grid\">" + nV.map(function(v) { return ttCard(v,gTs,gP,gL,gC,gS,gD,true); }).join("") + "</div>";
  if (oV.length) h += sepOld("Было при прошлом обновлении") + "<div class=\"tiktok-grid\">" + oV.map(function(v) { return ttCard(v,gTs,gP,gL,gC,gS,gD,false); }).join("") + "</div>";
  if (!videos.length) h = emptyState("Нет видео", "🎵", "Данные загружены");
  document.getElementById("tt-content").innerHTML = h;
}
function ttCard(v,gTs,gP,gL,gC,gS,gD,isN) {
  var d = parseTs(gTs(v)) || new Date();
  var desc = gD(v);
  var url = v.webVideoUrl || v.url || ("https://www.tiktok.com/@" + ((v.authorMeta && v.authorMeta.name) || "") + "/video/" + (v.id || ""));
  return "<div class=\"tt-card" + (isN ? " is-new" : "") + "\">" +
    "<div class=\"tt-text-body\">" +
    (isN ? "<span class=\"b b-new\" style=\"font-size:10px;margin-bottom:6px;display:inline-block;\">\u{1F195} \u041d\u043e\u0432\u043e\u0435</span>" : "") +
    "<div class=\"tt-desc-full\">" + (desc ? desc.substring(0, 300) : "\u2014") + "</div>" +
    "<div class=\"tt-row\">" +
    "<div class=\"tt-meta\"><span>\u25b6 " + fmtNum(gP(v)) + "</span><span>\u2764 " + fmtNum(gL(v)) + "</span><span>\ud83d\udcac " + fmtNum(gC(v)) + "</span><span class=\"tt-date-sm\">" + d.toLocaleDateString("ru", {day:"numeric",month:"short",year:"numeric"}) + "</span></div>" +
    "<a class=\"open-link\" href=\"" + url + "\" target=\"_blank\">\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u0432\u0438\u0434\u0435\u043e \u2192</a>" +
    "</div></div></div>";
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
  document.getElementById("web-stat-topics").textContent = f.length;
  document.getElementById("web-stat-new").textContent = nI.length;
  document.getElementById("web-stat-mentions").textContent = f.length;
  document.getElementById("web-stat-sources").textContent = Object.keys(hs).length;
  document.getElementById("web-stat-sentiment").textContent = f.length ? Math.round(posC/f.length*100)+"%" : "—";
  document.getElementById("web-sync-badge").textContent = "🆕 " + nI.length + " новых";
  document.getElementById("web-last-sync").textContent = "Проверено: " + new Date().toLocaleString("ru",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
  document.getElementById("gen-web-mentions").textContent = f.length;
  var h = "";
  if (nI.length) h += sepNew("🌐 Интернет — новое с " + ld) + "<div class=\"web-grid\">" + nI.map(function(i){return webCard(i,true);}).join("") + "</div>";
  if (oI.length) h += sepOld("Ранее найденное") + "<div class=\"web-grid\">" + oI.map(function(i){return webCard(i,false);}).join("") + "</div>";
  if (!f.length) h = emptyState("Нет упоминаний","🌐","Попробуйте обновить позже");
  document.getElementById("web-content").innerHTML = h;
}
function webCard(item, isN) {
  var host="—"; try{host=new URL(item.url||"http://x").hostname.replace("www.","");}catch(e){}
  var s = sentiment((item.title||"")+(item.description||""));
  return "<div class=\"web-card"+(isN?" is-new":"")+"\">" +
    "<div class=\"wc-body\"><div class=\"web-source-icon\">📰</div>" +
    "<div class=\"web-main\"><div class=\"web-title\">"+(item.title||"—")+"</div>" +
    "<div class=\"web-tags\">"+(isN?"<span class=\"web-tag wt-new\">🆕 Новое</span>":"")+
    "<span class=\"web-tag wt-news\">Новость</span></div>" +
    "<div class=\"web-snippet\">"+(item.description||"").substring(0,250)+"</div>" +
    "</div></div>" +
    "<div class=\"sources-strip\"><span class=\"sources-label\">Источник</span>" +
    "<a class=\"source-pill\" href=\""+(item.url||"#")+"\" target=\"_blank\">📰 "+host+"</a></div></div>";
}
function loadIGFromExcel(input) {
  var file = input.files[0]; if (!file) return;
  if (typeof XLSX === "undefined") { showError("Библиотека Excel не загрузимась."); return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var wb = XLSX.read(new Uint8Array(e.target.result), {type:"array", cellDates:true});
      var ws = wb.Sheets[wb.SheetNames[0]];
      var rows = XLSX.utils.sheet_to_json(ws, {defval:""});
      if (!rows.length) { showError("Excel файл пустой."); return; }
      function gc(row,names){for(var i=0;i<names.length;i++){var v=row[names[i]];if(v!==undefined&&v!==null&&v!=="")return v;}return "";}
      var posts = [];
      for (var ri = 0; ri < rows.length; ri++) {
        var row = rows[ri];
        var dv=gc(row,["Дата","Date","date","дата","timestamp","Время","created_at"]);
        var cap=gc(row,["Подпись","Текст","Caption","Text","caption","text"]);
        var lk=gc(row,["Лайки","Likes","likes","likesCount"]);
        var cm=gc(row,["Комментарии","Comments","comments","commentsCount"]);
        var url=gc(row,["Ссылка","URL","url","Link","link"]);
        var au=gc(row,["Автор","Author","author","ownerUsername","username"]);
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
      if (!posts.length) { showError("Не найдено постов в файле."); return; }
      posts.sort(function(a,b){return new Date(b.timestamp)-new Date(a.timestamp);});
      var lvKey = "lv_"+(CFG.ig||CFG.tt||CFG.name).replace(/[^a-z0-9]/gi,"_").toLowerCase();
      var lv = localStorage.getItem(lvKey) || "2025-12-31T23:59:59Z";
      renderIG(posts, lv, fmtDate(lv));
      document.getElementById("gen-ig-posts").textContent = posts.length;
      var wb2=document.getElementById("warnBar");
      if (wb2){wb2.textContent="📂 Загружено: "+posts.length+"постов";wb2.style.display="block";setTimeout(function(){wb2.style.display="none";},5000);}
    } catch(ex) { showError("Ошибка Excel: " + ex.message); }
  };
  reader.readAsArrayBuffer(file);
  input.value = "";
}
function downloadIGTemplate() {
  if (typeof XLSX === "undefined") { showError("Библиотека Excel не загрузимась."); return; }
  var ig = CFG.ig || "your_account";
  var data = [["Дата","Подпись","Лайки","Комментарии","Ссылка","Автор"],["15.01.2026","Текст поста",150,12,"https://www.instagram.com/p/XXXX/",ig]];
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
