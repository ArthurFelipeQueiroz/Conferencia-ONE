import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';
const read=p=>readFileSync(p,'utf8');const cfg=JSON.parse(read('wrangler.jsonc')),api=read('src/index.ts'),ui=read('public/app.js');
test('D1 e Worker isolados',()=>{assert.equal(cfg.name,'conferencia-one-checkin');assert.equal(cfg.d1_databases[0].database_name,'conferencia-one-2026');assert.match(cfg.d1_databases[0].database_id,/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);assert.notEqual(cfg.d1_databases[0].database_id,'00000000-0000-0000-0000-000000000000')});
test('Evento 7 de novembro',()=>{assert.ok(api.includes('2026-11-07'));assert.ok(ui.includes('07/11/2026'))});
test('Regras exclusivas bloqueadas',()=>{assert.ok(api.includes('blockedLegacy'));assert.ok(api.includes('WhatsApp automático indisponível'))});
test('Arte independente',()=>assert.ok(ui.includes('/evento-arte.svg')));

