exports.handler = async (event) => {
  const h = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: h, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: h, body: JSON.stringify({ error: 'POST only' }) };

  try {
    const body = JSON.parse(event.body || '{}');
    const { actorId, input } = body;
    const token = (body.token || '').trim();

    if (!token)   return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'Apify token not provided' }) };
    if (!actorId) return { statusCode: 400, headers: h, body: JSON.stringify({ error: 'actorId not provided' }) };

    // Use Authorization header — safe for all token formats (avoids URL encoding bugs)
    const r = await fetch(
      'https://api.apify.com/v2/acts/' + encodeURIComponent(actorId) + '/runs',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(input || {})
      }
    );

    const data = await r.json();
    if (!r.ok) return {
      statusCode: r.status, headers: h,
      body: JSON.stringify({ error: (data.error && data.error.message) || 'Apify error', detail: JSON.stringify(data).substring(0, 300) })
    };

    return {
      statusCode: 200, headers: h,
      body: JSON.stringify({ runId: data.data.id, status: data.data.status })
    };
  } catch (e) {
    return { statusCode: 500, headers: h, body: JSON.stringify({ error: e.message }) };
  }
};
