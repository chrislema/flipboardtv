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

    if (url.pathname === '/send') {
      if (request.method === 'GET') {
        return new Response(sendPage(), {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      if (request.method === 'POST') {
        const form = await request.formData();
        const message = (form.get('message') || '').toString().trim();

        if (!message) {
          return new Response(sendPage('Message cannot be empty.'), {
            headers: { 'Content-Type': 'text/html' },
          });
        }

        if (message.length > 25) {
          return new Response(sendPage('Message cannot exceed 25 characters.'), {
            headers: { 'Content-Type': 'text/html' },
          });
        }

        await env.MESSAGES.put('current', message);
        return new Response(sendPage(null, message), {
          headers: { 'Content-Type': 'text/html' },
        });
      }
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

function sendPage(error, sent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Send to FlipBoard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #111;
      color: #fff;
      font-family: -apple-system, system-ui, sans-serif;
    }
    .card {
      background: #1a1a1a;
      border-radius: 12px;
      padding: 40px;
      width: 90%;
      max-width: 480px;
    }
    h1 { font-size: 24px; font-weight: 500; margin-bottom: 24px; }
    input[type="text"] {
      width: 100%;
      padding: 14px 16px;
      font-size: 18px;
      background: #222;
      border: 1px solid #333;
      border-radius: 8px;
      color: #fff;
      outline: none;
      margin-bottom: 8px;
    }
    input[type="text"]:focus { border-color: #555; }
    .counter {
      text-align: right;
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
    }
    .counter.over { color: #e55; }
    button {
      width: 100%;
      padding: 14px;
      font-size: 18px;
      font-weight: 500;
      background: #fff;
      color: #111;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    button:hover { background: #ddd; }
    .error { color: #e55; margin-bottom: 16px; font-size: 14px; }
    .success { color: #5a5; margin-bottom: 16px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Send to FlipBoard</h1>
    ${error ? `<p class="error">${error}</p>` : ''}
    ${sent ? `<p class="success">Sent: ${sent}</p>` : ''}
    <form method="POST" action="/send">
      <input type="text" name="message" maxlength="25" placeholder="Your message..." autofocus>
      <div class="counter"><span id="count">0</span> / 25</div>
      <button type="submit">Send</button>
    </form>
  </div>
  <script>
    const input = document.querySelector('input');
    const counter = document.getElementById('count');
    const counterDiv = document.querySelector('.counter');
    input.addEventListener('input', () => {
      counter.textContent = input.value.length;
      counterDiv.classList.toggle('over', input.value.length > 25);
    });
  </script>
</body>
</html>`;
}
