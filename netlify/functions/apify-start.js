exports.handler = async (event) => {
  const h = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: h, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'POST only' }) };

  try {
    const { actorId, input, token } = JSON.parse(event.body || '{}');

    if (!token) return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'Apify token not provided' }) };
    if (!actorId) return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'actorId not provided' }) };

    console.log('Starting actor:', actorId, 'input:', JSON.stringify(input).substring(0, 200));

    const r = await fetch(
      'https://api.apify.com/v2/acts/' + encodeURIComponent(actorId) + '/runs?token=' + token,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input || {})
      }
    );
    const data = await r.json();
    console.log('Apify response:', r.status, JSON.stringify(data).substring(0, 300));

    if (!r.ok) return {
      statusCode: 400, headers: h,
      body: JSON.stringify({
        error: (data.error && data.error.message) || 'Apify start failed',
        detail: JSON.stringify(data).substring(0, 300)
      })
    };

    return {
      statusCode: 200, headers: h,
      body: JSON.stringify({ runId: data.data.id, status: data.data.status })
    };
  } catch (e) {
    console.error('Exception:', e.message);
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: e.message }) };
  }
};
