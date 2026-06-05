"use strict";
const https = require("https");

const SUPABASE_URL = "https://ixmvfxehbjodnjndikzg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bXZmeGVoYmpvZGpuamRpa3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Njc0NTgsImV4cCI6MjA5NjI0MzQ1OH0.kiSg7UeGJLJznNJdixSQMJp1cPLnZq0at3vvv2lRX5c";

function supaReq(path, method, body) {
  return new Promise(function(resolve, reject) {
    const urlObj = new URL(SUPABASE_URL + "/rest/v1/" + path);
    const bodyStr = body ? JSON.stringify(body) : null;
    const hdrs = {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      "Prefer": "resolution=merge-duplicates,return=minimal"
    };
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
        if (res.statusCode >= 400) reject(new Error("Supabase " + res.statusCode + ": " + data.slice(0,200)));
        else resolve(data ? JSON.parse(data) : {});
      });
    });
    r.on("error", reject);
    if (bodyStr) r.write(bodyStr);
    r.end();
  });
}

exports.handler = async function(event) {
  const headers = {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"};
  if (event.httpMethod === "OPTIONS") return {statusCode: 204, headers};
  try {
    const body = JSON.parse(event.body || "{}");
    const { table, rows } = body;
    if (!table || !rows || !rows.length) {
      return {statusCode: 400, headers, body: JSON.stringify({error: "table and rows required"})};
    }
    // Batch upsert in chunks of 50
    let inserted = 0;
    const errors = [];
    for (let i = 0; i < rows.length; i += 50) {
      const chunk = rows.slice(i, i + 50);
      try {
        await supaReq(table, "POST", chunk);
        inserted += chunk.length;
      } catch(e) {
        errors.push({chunk: i, msg: e.message});
      }
    }
    return {statusCode: 200, headers, body: JSON.stringify({ok: true, inserted, errors})};
  } catch(e) {
    return {statusCode: 500, headers, body: JSON.stringify({error: e.message})};
  }
};
