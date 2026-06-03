exports.handler = async (event) => {
  const h = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: h, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'POST only' }) };

  try {
    const { runId, getItems } = JSON.parse(event.body || '{}');
    const token = process.env.APIFY_TOKEN;
    if (!token) return {
      statusCode: 500, headers: h,
      body: JSON.stringify({ error: 'APIFY_TOKEN not configured' })
    };

    // Poll with 20s wait (safe for Netlify 26s limit)
    const r = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${token}&waitForFinish=20`
    );
    const data = await r.json();
    const status = data.data?.status || 'UNKNOWN';

    if (status === 'SUCCEEDED' && getItems) {
      const ir = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${token}&limit=200&clean=true`
      );
      const items = await ir.json();
      return {
        statusCode: 200, headers: h,
        body: JSON.stringify({ status: 'SUCCEEDED', items: Array.isArray(items) ? items : [] })
      };
    }

    return { statusCode: 200, headers: h, body: JSON.stringify({ status, runId }) };
  } catch (e) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: e.message }) };
  }
};
