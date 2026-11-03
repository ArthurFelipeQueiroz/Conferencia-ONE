import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import { buildGithubPages, PAGES_BASE, API_ORIGIN } from '../scripts/build-github-pages.mjs';

test('Páginas da equipe e administração abrem diretamente e carregam os recursos do projeto', () => {
  const outDir = mkdtempSync(join(tmpdir(), 'one-pages-'));
  try {
    buildGithubPages({ outDir });
    for (const page of ['index.html', 'equipe/index.html', 'admin/index.html', 'checkin/index.html', 'confirmacao/index.html', 'qr-impressao/index.html']) {
      const html = readFileSync(join(outDir, page), 'utf8');
      for (const [, path] of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
        const pathname = new URL(path, 'https://arthurfelipequeiroz.github.io').pathname;
        assert.ok(pathname.startsWith(PAGES_BASE + '/'), pathname);
        const local = join(outDir, pathname.slice(PAGES_BASE.length + 1));
        assert.ok(existsSync(local), `${page}: ${path}`);
      }
      assert.ok(html.includes(`connect-src 'self' ${API_ORIGIN}`));
    }
    assert.ok(existsSync(join(outDir, '.nojekyll')));
  } finally { rmSync(outDir, { recursive: true, force: true }); }
});

test('Login, retorno ao painel e exportações usam a API externa com sessão', () => {
  const outDir = mkdtempSync(join(tmpdir(), 'one-pages-'));
  try {
    buildGithubPages({ outDir });
    const code = readFileSync(join(outDir, 'app.js'), 'utf8');
    new vm.Script(code);
    const routing = code.slice(0, code.indexOf('const root='));
    for (const [path, expected] of [[`${PAGES_BASE}/equipe/`, '/equipe'], [`${PAGES_BASE}/admin/index.html`, '/admin'], [`${PAGES_BASE}/`, '/']]) {
      const context = { location: { pathname: path } };
      vm.runInNewContext(routing + ';globalThis.result=oneRoutePath()', context);
      assert.equal(context.result, expected);
    }
    assert.ok(code.includes('fetch(ONE_API_ORIGIN+path,'));
    assert.ok(code.includes('x-jovens-session'));
    assert.ok(code.includes(`${API_ORIGIN}/api/admin/communications.csv" data-one-download`));
    assert.ok(!code.includes("location.href='/equipe'"));
    assert.ok(!code.includes('src="/evento-arte.svg"'));
  } finally { rmSync(outDir, { recursive: true, force: true }); }
});
