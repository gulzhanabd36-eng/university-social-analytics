"use strict";
const https = require("https");

const SUPABASE_URL = "https://ixmvfxehbjodjnjdikzg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bXZmeGVoYmpvZGpuamRpa3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Njc0NTgsImV4cCI6MjA5NjI0MzQ1OH0.kiSg7UeGJLJznNJdixSQMJp1cPLnZq0at3vvv2lRX5c";
const TABLE = "uni_ig_all";

function supaReq(path, method, bodyObj, extraHeaders) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(SUPABASE_URL + "/rest/v1/" + path);
    const bodyStr = bodyObj ? JSON.stringify(bodyObj) : null;
    const opts = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: Object.assign({
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json"
      }, extraHeaders || {})
    };
    if (bodyStr) opts.headers["Content-Length"] = Buffer.byteLength(bodyStr);
    const r = https.request(opts, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        if (res.statusCode >= 400) return reject(new Error("Supabase " + res.statusCode + ": " + data.slice(0,300)));
        try { resolve(data ? JSON.parse(data) : {}); } catch(e) { resolve({}); }
      });
    });
    r.on("error", reject);
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}

exports.handler = async (event) => {
  const headers = {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"};
  if (event.httpMethod === "OPTIONS") return {statusCode: 204, headers};

  try {
    const body = JSON.parse(event.body || "{}");
    const { action, handle, items } = body;

    // ── READ: return all posts for handle, newest first ──
    if (action === "read") {
      const rows = await supaReq(
        TABLE + "?handle=eq." + encodeURIComponent(handle) +
        "&order=timestamp.desc&limit=5000" +
        "&select=raw,likes,comments,timestamp,short_code,post_url,caption,owner_username",
        "GET", null, {"Prefer": "return=representation"}
      );
      const arr = Array.isArray(rows) ? rows : [];
      const posts = arr.map(row =>
        (row.raw && typeof row.raw === "object") ? row.raw : {
          shortCode: row.short_code,
          url: row.post_url,
          timestamp: row.timestamp,
          likesCount: row.likes,
          commentsCount: row.comments,
          caption: row.caption,
          ownerUsername: row.owner_username
        }
      );
      return {statusCode: 200, headers, body: JSON.stringify({items: posts, count: posts.length})};
    }

    // ── LATEST: timestamp of the newest saved post ──
    if (action === "latest") {
      const rows = await supaReq(
        TABLE + "?handle=eq." + encodeURIComponent(handle) +
        "&order=timestamp.desc&limit=1&select=timestamp",
        "GET", null, {}
      );
      const arr = Array.isArray(rows) ? rows : [];
      return {statusCode: 200, headers, body: JSON.stringify({timestamp: arr.length ? arr[0].timestamp : null})};
    }

    // ── UPSERT: insert new posts, skip duplicates on (handle, short_code) ──
    if (action === "upsert") {
      if (!items || !items.length) return {statusCode: 200, headers, body: JSON.stringify({inserted: 0})};

      const rows = items.map(p => {
        const sc = p.shortCode || p.shortcode || p.id || "";
        if (!sc) return null;
        const rawTs = p.timestamp || p.taken_at_timestamp || p.takenAtTimestamp || null;
        let isoTs = null;
        if (rawTs) {
          try {
            const n = typeof rawTs === "number" ? (rawTs > 2e10 ? rawTs : rawTs * 1000) : Date.parse(rawTs);
            isoTs = new Date(n).toISOString();
          } catch(e) {}
        }
        return {
          handle,
          short_code: sc,
          post_url: p.url || (sc ? "https://www.instagram.com/p/" + sc + "/" : null),
          timestamp: isoTs,
          likes: p.likesCount || p.likes || 0,
          comments: p.commentsCount || p.comments || 0,
          caption: String(p.caption || p.alt || p.text || "").substring(0, 2000),
          owner_username: String(p.ownerUsername || p.username || handle || "").replace(/^@/, ""),
          raw: p
        };
      }).filter(Boolean);

      if (!rows.length) return {statusCode: 200, headers, body: JSON.stringify({inserted: 0})};

      // Batch upsert in chunks of 200
      let inserted = 0;
      for (let i = 0; i < rows.length; i += 200) {
        const batch = rows.slice(i, i + 200);
        await supaReq(
          TABLE + "?on_conflict=handle%2Cshort_code",
          "POST", batch,
          {"Prefer": "resolution=ignore-duplicates,return=minimal"}
        );
        inserted += batch.length;
      }
      return {statusCode: 200, headers, body: JSON.stringify({inserted, total: rows.length})};
    }

    return {statusCode: 400, headers, body: JSON.stringify({error: "unknown action: " + action})};
  } catch(e) {
    return {statusCode: 500, headers, body: JSON.stringify({error: e.message})};
  }
};
