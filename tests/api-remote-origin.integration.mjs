import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

const FRONTEND = 'https://arthurfelipequeiroz.github.io';
const BASE = 'https://conferencia-one-checkin.gustavo-marques-lopes.workers.dev';
const bootstrap = 'installation-test-'.repeat(4);
const password = 'Senha-Ficticia-Local-2026';
let mf, db, session;

async function call(path, { method = 'GET', origin = FRONTEND, body, token, cookie } = {}) {
  const headers = { origin, 'sec-fetch-site': origin === BASE ? 'same-origin' : 'cross-site' };
  if (body) headers['content-type'] = 'application/json';
  if (token) headers['x-jovens-session'] = token;
  if (cookie) headers.cookie = cookie;
  return mf.dispatchFetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
}

before(async () => {
  mf = new Miniflare(convertV4MiniflareOptions({
    modules: true,
    scriptPath: resolve('.qa-worker/index.js'),
    compatibilityDate: '2026-09-29',
    compatibilityFlags: ['nodejs_compat'],
    d1Databases: ['DB'],
    bindings: { BOOTSTRAP_TOKEN: bootstrap, PUBLIC_APP_URL: FRONTEND + '/Conferencia-ONE' }
  }));
  db = await mf.getD1Database('DB');
  for (const file of readdirSync('migrations').filter(file => file.endsWith('.sql')).sort()) {
    const sql=readFileSync('migrations/' + file, 'utf8').replace(/^\s*--.*$/gm,'').replace(/\r?\n/g,' ');
    await db.exec(sql);
  }
});
after(async () => { if (mf) await mf.dispose(); });

test('Endereço antigo direciona o painel para o GitHub do Arthur', async () => {
  const response=await mf.dispatchFetch(BASE+'/equipe',{redirect:'manual'});
  assert.equal(response.status,302);
  assert.equal(response.headers.get('location'),FRONTEND+'/Conferencia-ONE/equipe/');
});

test('Origem externa não autorizada não consegue instalar administrador', async () => {
  const response = await call('/api/initialize', { method: 'POST', origin: 'https://example.com', body: { token: bootstrap, username: 'teste.one', password } });
  assert.equal(response.status, 403);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
  assert.equal((await db.prepare('SELECT COUNT(*) AS total FROM staff_users').first()).total, 0);
});

test('Origem do Arthur instala administrador com o token correto', async () => {
  const response = await call('/api/initialize', { method: 'POST', body: { token: bootstrap, username: 'teste.one', password } });
  assert.equal(response.status, 200, await response.clone().text());
  assert.equal(response.headers.get('access-control-allow-origin'), FRONTEND);
  assert.deepEqual(await response.json(), { ok: true });
});

test('Senha incorreta retorna erro para o painel do Arthur', async () => {
  const response = await call('/api/session', { method: 'POST', body: { username: 'teste.one', password: 'senha-errada' } });
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('access-control-allow-origin'), FRONTEND);
});

test('Login e leitura do painel funcionam sem cookies de terceiros', async () => {
  const login = await call('/api/session', { method: 'POST', body: { username: 'teste.one', password } });
  assert.equal(login.status, 200, await login.clone().text());
  const data = await login.json();
  session = data.sessionToken;
  assert.match(session, /^[a-f0-9]{64}$/);
  assert.match(login.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Strict/);
  const verify = await call('/api/session', { token: session });
  assert.equal((await verify.json()).user.username, 'teste.one');
  const list = await call('/api/staff/list', { token: session });
  assert.equal(list.status, 200, await list.clone().text());
  assert.deepEqual((await list.json()).items, []);
});

test('API de participantes exige autenticação também no GitHub Pages', async () => {
  const response = await call('/api/staff/list');
  assert.equal(response.status, 401);
});

test('Logout invalida a sessão usada no painel do Arthur', async () => {
  const logout = await call('/api/session', { method: 'DELETE', token: session });
  assert.equal(logout.status, 200);
  const verify = await call('/api/session', { token: session });
  assert.equal((await verify.json()).user, null);
});
