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
      'https://api.apify.com/v2/actor-runs/' + runId + '?token=' + token
    );
    const data = await r.json();
    const status = (data.data && data.data.status) || 'UNKNOWN';

    if (status === 'SUCCEEDED' && getItems) {
      // Paginate to get ALL items (not just first 1000)
      let allItems = [];
      let offset = 0;
      const pageSize = 500;
      let keepFetching = true;
      while (keepFetching) {
        const ir = await fetch(
          'https://api.apify.com/v2/actor-runs/' + runId +
          '/dataset/items?token=' + token +
          '&limit=' + pageSize + '&offset=' + offset + '&clean=true'
        );
        const page = await ir.json();
        if (Array.isArray(page) && page.length > 0) {
          allItems = allItems.concat(page);
          offset += pageSize;
          if (page.length < pageSize) keepFetching = false;
          if (allItems.length >= 2000) keepFetching = false; // safety cap
        } else {
          keepFetching = false;
        }
      }
      return {
        statusCode: 200, headers: h,
        body: JSON.stringify({ status: 'SUCCEEDED', items: allItems })
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
