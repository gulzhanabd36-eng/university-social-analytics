"use strict";
const https = require("https");

const SUPABASE_URL = "https://ixmvfxehbjodjnjdikzg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bXZmeGVoYmpvZGpuamRpa3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Njc0NTgsImV4cCI6MjA5NjI0MzQ1OH0.kiSg7UeGJLJznNJdixSQMJp1cPLnZq0at3vvv2lRX5c";

function supaGet(path) {
  return new Promise(function(resolve, reject) {
    const urlObj = new URL(SUPABASE_URL + "/rest/v1/" + path);
    const opts = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json"
      }
    };
    const r = https.request(opts, function(res) {
      let data = "";
      res.on("data", function(c) { data += c; });
      res.on("end", function() {
        if (res.statusCode >= 400) reject(new Error("Supabase " + res.statusCode + ": " + data.slice(0, 200)));
        else { try { resolve(JSON.parse(data)); } catch(e) { resolve([]); } }
      });
    });
    r.on("error", reject);
    r.end();
  });
}

exports.handler = async function(event) {
  const headers = {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"};
  if (event.httpMethod === "OPTIONS") return {statusCode: 204, headers};
  try {
    const body = JSON.parse(event.body || "{}");
    const table = body.table;
    const handle = body.handle;
    if (!table || !handle) return {statusCode: 400, headers, body: JSON.stringify({error: "table and handle required"})};

    const rows = await supaGet(
      table + "?handle=eq." + encodeURIComponent(handle) +
      "&order=timestamp.desc&limit=500&select=raw,likes,comments,timestamp,short_code,post_url,caption,owner_username"
    );

    const items = rows.map(function(row) {
      if (row.raw && typeof row.raw === "object") return row.raw;
      return {
        shortCode: row.short_code,
        url: row.post_url,
        timestamp: row.timestamp,
        likesCount: row.likes,
        commentsCount: row.comments,
        caption: row.caption,
        ownerUsername: row.owner_username
      };
    });

    return {statusCode: 200, headers, body: JSON.stringify({items: items, count: items.length})};
  } catch(e) {
    return {statusCode: 500, headers, body: JSON.stringify({error: e.message})};
  }
};
