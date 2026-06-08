exports.handler = async (event) => {
  const h = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: h, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'POST only' }) };

  try {
    const { runId, token, getItems } = JSON.parse(event.body || '{}');

    if (!token) return {
      statusCode: 400, headers: h,
      body: JSON.stringify({ error: 'Apify token not provided' })
    };
    if (!runId) return {
      statusCode: 400, headers: h,
      body: JSON.stringify({ error: 'runId not provided' })
    };

    // Poll with 20s server-side wait (safe for Netlify 26s limit)
    const r = await fetch(
      'https://api.apify.com/v2/actor-runs/' + runId + '?token=' + token + '&waitForFinish=20'
    );
    const data = await r.json();
    const status = (data.data && data.data.status) || 'UNKNOWN';

    if (status === 'SUCCEEDED' && getItems) {
      const ir = await fetch(
        'https://api.apify.com/v2/actor-runs/' + runId + '/dataset/items?token=' + token + '&limit=1000&clean=true'
      );
      const items = await ir.json();
      return {
        statusCode: 200, headers: h,
        body: JSON.stringify({ status: 'SUCCEEDED', items: Array.isArray(items) ? items : [] })
      };
    }

    return {
      statusCode: 200, headers: h,
      body: JSON.stringify({ status: status, runId: runId })
    };
  } catch (e) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: e.message }) };
  }
};
