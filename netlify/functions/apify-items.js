exports.handler = async (event) => {
  const h = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: h, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'POST only' }) };

  try {
    const { runId, token, offset, limit } = JSON.parse(event.body || '{}');
    if (!runId || !token) return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'runId and token required' }) };

    const pageSize = limit || 100;
    const pageOffset = offset || 0;

    const r = await fetch(
      'https://api.apify.com/v2/actor-runs/' + runId +
      '/dataset/items?token=' + token +
      '&limit=' + pageSize + '&offset=' + pageOffset + '&clean=true'
    );
    const items = await r.json();

    return {
      statusCode: 200,
      headers: h,
      body: JSON.stringify({ items: Array.isArray(items) ? items : [], count: Array.isArray(items) ? items.length : 0 })
    };
  } catch (e) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: e.message }) };
  }
};
