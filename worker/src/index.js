export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    if (url.pathname === '/message') {
      if (request.method === 'GET') {
        const message = await env.MESSAGES.get('current');
        return new Response(JSON.stringify({ message: message || '' }), { headers });
      }

      if (request.method === 'POST') {
        const authHeader = request.headers.get('Authorization');
        const token = env.API_TOKEN;

        if (!token || authHeader !== `Bearer ${token}`) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers,
          });
        }

        const body = await request.json();
        const message = body.message;

        if (typeof message !== 'string') {
          return new Response(JSON.stringify({ error: 'Message must be a string' }), {
            status: 400,
            headers,
          });
        }

        await env.MESSAGES.put('current', message);
        return new Response(JSON.stringify({ ok: true, message }), { headers });
      }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers,
    });
  },
};
