const SUPABASE_URL = "https://ixmvfxehbjodnjndikzg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bXZmeGVoYmpvZGpuamRpa3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Njc0NTgsImV4cCI6MjA5NjI0MzQ1OH0.kiSg7UeGJLJznNJdixSQMJp1cPLnZq0at3vvv2lRX5c";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

async function supaFetch(path, method = "GET", body = null) {
  const opts = {
    method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      "Prefer": method === "POST" ? "return=minimal" : "return=representation"
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(SUPABASE_URL + "/rest/v1/" + path, opts);
  if (!r.ok) {
    const txt = await r.text();
    throw new Error("Supabase " + r.status + ": " + txt.substring(0,200));
  }
  if (method === "POST" || method === "DELETE") return {};
  return r.json();
}

exports.handler = async (event) => {
  const headers = {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"};
  try {
    const body = JSON.parse(event.body || "{}");
    const { action, table, handle, items } = body;

    if (action === "read") {
      // read latest cache entry for this handle
      const rows = await supaFetch(
        `${table}?handle=eq.${encodeURIComponent(handle)}&order=saved_at.desc&limit=1`
      );
      if (!rows.length) return { statusCode: 200, headers, body: JSON.stringify({ fresh: false, items: [] }) };
      const row = rows[0];
      const age = Date.now() - new Date(row.saved_at).getTime();
      return {
        statusCode: 200, headers,
        body: JSON.stringify({ fresh: age < CACHE_TTL_MS, items: row.items, saved_at: row.saved_at })
      };
    }

    if (action === "write") {
      // delete old rows for this handle, then insert new
      await supaFetch(`${table}?handle=eq.${encodeURIComponent(handle)}`, "DELETE");
      await supaFetch(table, "POST", { handle, items, saved_at: new Date().toISOString() });
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "unknown action" }) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
