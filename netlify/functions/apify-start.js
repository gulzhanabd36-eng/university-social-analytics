exports.handler = async (event) => {
  const h = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: h, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'POST only' }) };
  try {
    const { actorId, input } = JSON.parse(event.body || '{}');
    const token = process.env.APIFY_TOKEN;
    if (!token) return { statusCode: 500, headers: h, body: JSON.stringify({ error: 'APIFY_TOKEN not set in Netlify env vars' }) };
    const r = await fetch(
      'https://api.apify.com/v2/acts/' + encodeURIComponent(actorId) + '/runs?token=' + token,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input || {}) }
    );
    const data = await r.json();
    if (!r.ok) return { statusCode: 400, headers: h, body: JSON.stringify({ error: (data.error && data.error.message) || 'Apify error' }) };
    return { statusCode: 200, headers: h, body: JSON.stringify({ runId: data.data.id, status: data.data.status }) };
  } catch (e) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: e.message }) };
  }
};
