"use strict";
const https = require("https");

const SUPABASE_URL = "https://ixmvfxehbjodnjndikzg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bXZmeGVoYmpvZGpuamRpa3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Njc0NTgsImV4cCI6MjA5NjI0MzQ1OH0.kiSg7UeGJLJznNJdixSQMJp1cPLnZq0at3vvv2lRX5c";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

function supaReq(path, method, body) {
  return new Promise(function(resolve, reject) {
    const fullUrl = SUPABASE_URL + "/rest/v1/" + path;
    const urlObj = new URL(fullUrl);
    const bodyStr = body ? JSON.stringify(body) : null;
    const hdrs = {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json"
    };
    if (method === "POST") hdrs["Prefer"] = "return=minimal";
    if (method === "DELETE") hdrs["Prefer"] = "return=minimal";
    if (bodyStr) hdrs["Content-Length"] = Buffer.byteLength(bodyStr);

    const opts = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: hdrs
    };

    const r = https.request(opts, function(res) {
      let data = "";
      res.on("data", function(c) { data += c; });
      res.on("end", function() {
        if (res.statusCode >= 400) {
          reject(new Error("Supabase " + res.statusCode + ": " + data.slice(0, 200)));
        } else {
          try { resolve(data ? JSON.parse(data) : {}); }
          catch(e) { resolve({}); }
        }
      });
    });
    r.on("error", reject);
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}

exports.handler = async function(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: headers };
  }
  try {
    const body = JSON.parse(event.body || "{}");
    const action = body.action;
    const table  = body.table;
    const handle = body.handle;
    const items  = body.items;

    if (action === "read") {
      const rows = await supaReq(
        table + "?handle=eq." + encodeURIComponent(handle) + "&order=saved_at.desc&limit=1",
        "GET"
      );
      if (!Array.isArray(rows) || !rows.length) {
        return { statusCode: 200, headers: headers, body: JSON.stringify({ fresh: false, items: [] }) };
      }
      const row = rows[0];
      const age = Date.now() - new Date(row.saved_at).getTime();
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ fresh: age < CACHE_TTL_MS, items: row.items, saved_at: row.saved_at })
      };
    }

    if (action === "write") {
      await supaReq(table + "?handle=eq." + encodeURIComponent(handle), "DELETE");
      await supaReq(table, "POST", { handle: handle, items: items, saved_at: new Date().toISOString() });
      return { statusCode: 200, headers: headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 400, headers: headers, body: JSON.stringify({ error: "unknown action" }) };
  } catch(e) {
    return { statusCode: 500, headers: headers, body: JSON.stringify({ error: e.message }) };
  }
};
