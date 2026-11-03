import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PUBLIC_APP_URL, publicAppBase, mutationOriginAllowed, withFrontend } from '../src/web-origin.mjs';

const api = 'https://conferencia-one-checkin.gustavo-marques-lopes.workers.dev/api/session';
const origin = 'https://arthurfelipequeiroz.github.io';

test('QR público mantém o projeto do Arthur no caminho', () => {
  assert.equal(publicAppBase(DEFAULT_PUBLIC_APP_URL + '/'), DEFAULT_PUBLIC_APP_URL);
  assert.throws(() => publicAppBase('http://example.com'));
  assert.throws(() => publicAppBase('https://example.com/?token=abc'));
});

test('Publicação do Arthur pode enviar operações; outros sites são bloqueados', () => {
  assert.equal(mutationOriginAllowed(new Request(api, { method: 'POST', headers: { origin, 'sec-fetch-site': 'cross-site' } })), true);
  assert.equal(mutationOriginAllowed(new Request(api, { method: 'POST', headers: { origin: 'https://example.com', 'sec-fetch-site': 'cross-site' } })), false);
  assert.equal(mutationOriginAllowed(new Request(api, { method: 'POST', headers: { 'sec-fetch-site': 'cross-site' } })), false);
});

test('Pré-verificação autoriza somente a origem e os cabeçalhos necessários', async () => {
  let called = false;
  const response = await withFrontend(new Request(api, { method: 'OPTIONS', headers: {
    origin, 'access-control-request-method': 'POST', 'access-control-request-headers': 'Content-Type, X-Jovens-Session'
  }}), undefined, async () => { called = true; return new Response('unused'); });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(response.headers.get('access-control-allow-credentials'), null);
  assert.equal(called, false);
});

test('Origens desconhecidas não executam a operação nem recebem CORS', async () => {
  let called = false;
  const response = await withFrontend(new Request(api, { headers: { origin: 'https://arthurfelipequeiroz.github.io.example.com' } }), undefined,
    async () => { called = true; return new Response('private'); });
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  assert.equal(called, false);
});

test('Erros de autenticação continuam legíveis na origem autorizada', async () => {
  const response = await withFrontend(new Request(api, { headers: { origin } }), undefined,
    async () => new Response('{"error":"Faça login"}', { status: 401, headers: { 'cache-control': 'no-store' } }));
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { error: 'Faça login' });
});

test('Pré-verificação recusa métodos e cabeçalhos extras', async () => {
  const response = await withFrontend(new Request(api, { method: 'OPTIONS', headers: {
    origin, 'access-control-request-method': 'PUT', 'access-control-request-headers': 'x-extra'
  }}), undefined, async () => new Response('unused'));
  assert.equal(response.status, 403);
});
