export const DEFAULT_PUBLIC_APP_URL = 'https://arthurfelipequeiroz.github.io/Conferencia-ONE';

export function publicAppBase(value = DEFAULT_PUBLIC_APP_URL) {
  const url = new URL(value || DEFAULT_PUBLIC_APP_URL);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('PUBLIC_APP_URL deve ser um endereço HTTPS sem credenciais, consulta ou fragmento.');
  }
  return url.href.replace(/\/+$/, '');
}

export function mutationOriginAllowed(request, publicUrl) {
  const origin = request.headers.get('origin');
  const ownOrigin = new URL(request.url).origin;
  const frontendOrigin = new URL(publicAppBase(publicUrl)).origin;
  if (origin && origin !== ownOrigin && origin !== frontendOrigin) return false;
  return request.headers.get('sec-fetch-site') !== 'cross-site' || origin === frontendOrigin;
}

function rejection(message, status = 403) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

export async function withFrontend(request, publicUrl, handle) {
  if (!new URL(request.url).pathname.startsWith('/api/')) return handle();
  const origin = request.headers.get('origin');
  const ownOrigin = new URL(request.url).origin;
  const frontendOrigin = new URL(publicAppBase(publicUrl)).origin;
  if (origin && origin !== ownOrigin && origin !== frontendOrigin) return rejection('Origem inválida.');

  let response;
  if (request.method === 'OPTIONS') {
    const method = request.headers.get('access-control-request-method');
    const headers = (request.headers.get('access-control-request-headers') || '')
      .split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
    if (!origin || !['GET', 'POST', 'DELETE'].includes(method || '') ||
        headers.some(value => !['content-type', 'x-jovens-session'].includes(value))) {
      response = rejection('Pré-verificação inválida.');
    } else {
      response = new Response(null, { status: 204, headers: {
        'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
        'access-control-allow-headers': 'content-type, x-jovens-session',
        'access-control-max-age': '600'
      }});
    }
  } else {
    response = await handle();
  }
  if (!origin) return response;
  const headers = new Headers(response.headers);
  headers.set('access-control-allow-origin', origin);
  headers.set('access-control-expose-headers', 'content-disposition, retry-after');
  headers.append('vary', 'Origin');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
