const clean = v => String(v ?? '').trim();
const norm = v => clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ');
const digits = v => clean(v).replace(/\D/g, '');
const timestamp = v => clean(v).replace('T', ' ').replace(/\.\d+Z?$/, '').replace(/Z$/, '');
const amount = v => { let s = clean(v).replace(/[^\d,.-]/g, ''); if (s.includes(',') && s.includes('.')) s = s.replace(/\./g, ''); const n = Number(s.replace(',', '.')); return Number.isFinite(n) ? n : 0; };
const ageOf = v => { const m = /^(\d{1,2})(?:\s*anos?)?$/i.exec(clean(v)); return m && +m[1] > 0 ? +m[1] : null; };
const quoteId = name => { if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new Error('Nome de tabela inválido.'); return '"' + name + '"'; };
const pair = p => norm(p.full_name) + '|' + digits(p.contact);
const identity = p => pair(p) + '|' + timestamp(p.registered_at);

// Spreadsheet positions are provenance. Database IDs and source rows remain immutable.
export function planRoster(items, existing, previousMapping = []) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 200) throw new Error('Base oficial inválida.');
  const ordered = [...items].sort((a, b) => +a.source_row - +b.source_row);
  const seen = new Set(), used = new Set(), conflicts = [], matches = [];
  const oldByRow = new Map(existing.map(p => [+p.source_row, p]));
  const saved = new Map(previousMapping.map(p => [+p.official_source_row, p]));
  const counts = new Map(); for (const p of ordered) counts.set(pair(p), (counts.get(pair(p)) || 0) + 1);
  let nextRow = Math.max(1, ...existing.map(p => +p.source_row)), moved = 0, contactCorrections = 0, nameCorrections = 0;
  for (const input of ordered) {
    const officialRow = +input.source_row;
    if (!Number.isInteger(officialRow) || officialRow < 2 || seen.has(officialRow) || norm(input.full_name).length < 3 || !timestamp(input.registered_at)) throw new Error('Inscrição oficial sem identificador, nome ou data válida.');
    seen.add(officialRow);
    if (!['volunteer', 'support', 'adolescent'].includes(input.roster_group)) throw new Error('Grupo oficial ausente na linha ' + officialRow);
    const hasShirt = norm(input.shirt_requested) === 'sim', inputSize = clean(input.shirt_size).toUpperCase();
    if (hasShirt && !['PP', 'P', 'M', 'G', 'GG', 'XGG'].includes(inputSize)) throw new Error('Tamanho inválido na linha ' + officialRow);
    let old;
    const previous = saved.get(officialRow);
    if (previous) {
      const candidate = oldByRow.get(+previous.database_source_row);
      if (!candidate || identity(candidate) !== identity(input)) { conflicts.push('Linha oficial ' + officialRow + ': a identidade mudou desde a conciliação anterior.'); continue; }
      old = candidate;
    } else {
      const exact = existing.filter(p => !used.has(+p.source_row) && identity(p) === identity(input));
      if (exact.length === 1) old = exact[0];
      else if (exact.length > 1) { conflicts.push('Linha oficial ' + officialRow + ': mais de uma ficha com nome, telefone e data idênticos.'); continue; }
      else {
        const sameNameTime = existing.filter(p => !used.has(+p.source_row) && norm(p.full_name) === norm(input.full_name) && timestamp(p.registered_at) === timestamp(input.registered_at));
        const samePhoneTime = existing.filter(p => !used.has(+p.source_row) && digits(p.contact) === digits(input.contact) && timestamp(p.registered_at) === timestamp(input.registered_at) && norm(p.guardian_name) === norm(input.guardian_name) && ageOf(p.age_raw) === ageOf(input.age_raw));
        const candidates = [...new Map([...sameNameTime, ...samePhoneTime].map(p => [+p.source_row, p])).values()];
        if (candidates.length === 1) old = candidates[0];
        else if (candidates.length > 1) { conflicts.push('Linha oficial ' + officialRow + ': correspondência ambígua; histórico preservado.'); continue; }
      }
    }
    if (old && used.has(+old.source_row)) { conflicts.push('Linha oficial ' + officialRow + ': duas inscrições apontam para a mesma ficha antiga.'); continue; }
    if (old) {
      used.add(+old.source_row); if (+old.source_row !== officialRow) moved++;
      if (digits(old.contact) !== digits(input.contact)) contactCorrections++;
      if (norm(old.full_name) !== norm(input.full_name)) nameCorrections++;
    }
    matches.push({ ...input, official_source_row: officialRow, source_row: old ? +old.source_row : ++nextRow, database_source_row: old ? +old.source_row : nextRow, is_new: !old,
      full_name: clean(input.full_name), normalized_name: norm(input.full_name), contact: clean(input.contact), contact_digits: digits(input.contact),
      age_raw: clean(input.age_raw), age: ageOf(input.age_raw), shirt_requested: hasShirt ? 1 : 0, shirt_size: hasShirt ? (inputSize === 'XGG' ? 'GG' : inputSize) : null,
      shirt_payment_status: amount(input.payment_raw) >= 50 ? 'confirmed' : 'unverified',
      registration_type: input.roster_group === 'adolescent' ? 'adolescent' : 'team',
      duplicate_status: digits(input.contact).length >= 9 && counts.get(pair(input)) > 1 ? 'needs_review' : 'clear',
      media_consent: norm(input.media_consent).includes('sim') ? 1 : 0 });
  }
  const extras = existing.filter(p => !used.has(+p.source_row));
  return { matches, conflicts, extras, total: ordered.length, existing_rows: used.size, new_rows: matches.filter(p => p.is_new).length, moved_rows: moved, contact_corrections: contactCorrections, name_corrections: nameCorrections,
    groups: Object.fromEntries(['volunteer', 'support', 'adolescent'].map(group => [group, ordered.filter(p => p.roster_group === group).length])) };
}

export async function snapshotDatabase(db) {
  const schema = (await db.prepare("SELECT type,name,tbl_name,sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'enr_backup_%' AND name<>'enr_reconcile_guards' ORDER BY type='table' DESC,name").all()).results;
  const originals = schema.filter(s => s.type === 'table');
  if (!originals.some(s => s.name === 'participants') || originals.length > 25) throw new Error('Esquema inesperado; backup não criado.');
  const id = Date.now().toString() + '_' + crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  const tables = originals.map((s, i) => ({ original: s.name, copy: 'enr_backup_' + id + '_' + i }));
  const operations = [db.prepare('CREATE TABLE IF NOT EXISTS enr_backup_manifest(id TEXT PRIMARY KEY,created_at TEXT NOT NULL DEFAULT (datetime(\'now\')),metadata TEXT NOT NULL)')];
  for (const t of tables) operations.push(db.prepare('CREATE TABLE ' + quoteId(t.copy) + ' AS SELECT * FROM ' + quoteId(t.original)));
  operations.push(db.prepare('INSERT INTO enr_backup_manifest(id,metadata) VALUES(?,?)').bind(id, JSON.stringify({ schema, tables })));
  await db.batch(operations);
  const participantsTable = tables.find(t => t.original === 'participants').copy;
  const counts = await db.prepare('SELECT count(*) total,sum(active=1) active,sum(checkin_at IS NOT NULL) checked_in,sum(arrival_at IS NOT NULL) arrived,sum(shirt_delivered_at IS NOT NULL) shirts,sum(prize_delivered_at IS NOT NULL) prizes FROM ' + quoteId(participantsTable)).first();
  return { id, counts, table_count: tables.length };
}

export async function loadSnapshot(db, id) {
  if (!/^\d{13}_[a-f0-9]{8}$/.test(id)) throw new Error('Identificador de backup inválido.');
  const row = await db.prepare('SELECT metadata FROM enr_backup_manifest WHERE id=?').bind(id).first();
  if (!row) throw new Error('Backup não encontrado.');
  return JSON.parse(row.metadata);
}

const sqlValue = value => value == null ? 'NULL' : typeof value === 'number' ? String(value) : Array.isArray(value) ? "X'" + value.map(v => (+v).toString(16).padStart(2, '0')).join('') + "'" : "'" + String(value).replace(/'/g, "''") + "'";
export async function exportSnapshot(db, id) {
  const meta = await loadSnapshot(db, id), lines = ['-- ENRAIZADOS: backup privado do D1 antes da reconciliação.', '-- Backup ' + id, 'PRAGMA defer_foreign_keys=ON;'];
  for (const t of meta.tables) {
    const schema = meta.schema.find(s => s.type === 'table' && s.name === t.original);
    lines.push(schema.sql.replace(/;\s*$/, '') + ';');
  }
  for (const t of meta.tables) {
    const rows = (await db.prepare('SELECT * FROM ' + quoteId(t.copy)).all()).results;
    for (const row of rows) lines.push('INSERT INTO ' + quoteId(t.original) + '(' + Object.keys(row).map(quoteId).join(',') + ') VALUES(' + Object.values(row).map(sqlValue).join(',') + ');');
  }
  for (const s of meta.schema.filter(s => s.type !== 'table')) lines.push(s.sql.replace(/;\s*$/, '') + ';');
  return lines.join('\n');
}

export function reconciliationStatements(db, plan, snapshot, locked, runId, actorId) {
  const before = quoteId(snapshot.tables.find(t => t.original === 'participants').copy);
  const configBefore = quoteId(snapshot.tables.find(t => t.original === 'event_config').copy);
  const payload = JSON.stringify(plan.matches), j = field => "json_extract(j.value,'$." + field + "')";
  const updateFields = ['full_name', 'normalized_name', 'contact', 'contact_digits', 'guardian_name', 'church', 'previous_attendance', 'media_consent', 'registration_type'].map(f => f + '=' + j(f));
  updateFields.push("shirt_requested=CASE WHEN p.shirt_delivered_at IS NOT NULL THEN p.shirt_requested ELSE " + j('shirt_requested') + ' END',
    "shirt_size=CASE WHEN p.shirt_delivered_at IS NOT NULL THEN p.shirt_size ELSE " + j('shirt_size') + ' END',
    "payment_raw=CASE WHEN " + j('shirt_payment_status') + "='confirmed' THEN " + j('payment_raw') + ' ELSE p.payment_raw END',
    "shirt_payment_status=CASE WHEN p.shirt_payment_status IN ('confirmed','waived') THEN p.shirt_payment_status ELSE " + j('shirt_payment_status') + ' END');
  if (!locked) updateFields.push("age=CASE WHEN p.checkin_at IS NOT NULL OR COALESCE(p.review_note,'')<>'' OR p.prize_eligible=1 THEN p.age ELSE " + j('age') + ' END',
    "age_raw=CASE WHEN p.checkin_at IS NOT NULL OR COALESCE(p.review_note,'')<>'' OR p.prize_eligible=1 THEN p.age_raw ELSE " + j('age_raw') + ' END',
    "duplicate_status=CASE WHEN p.duplicate_status<>'clear' OR COALESCE(p.review_note,'')<>'' THEN p.duplicate_status ELSE " + j('duplicate_status') + ' END');
  const columns = ['source_row','registered_at','full_name','normalized_name','guardian_name','contact','contact_digits','age_raw','age','duplicate_status','church','shirt_requested','shirt_size','previous_attendance','media_consent','payment_raw','shirt_payment_status','registration_type','ticket_token'];
  return [
    db.prepare('CREATE TABLE IF NOT EXISTS enr_reconcile_guards(id TEXT PRIMARY KEY,ok INTEGER NOT NULL CHECK(ok=1))'),
    db.prepare('INSERT INTO enr_reconcile_guards(id,ok) SELECT ?,CASE WHEN NOT EXISTS(SELECT * FROM participants EXCEPT SELECT * FROM ' + before + ') AND NOT EXISTS(SELECT * FROM ' + before + " EXCEPT SELECT * FROM participants) AND NOT EXISTS(SELECT key,value FROM event_config WHERE key IN ('prizes_locked','registration_closed') OR key LIKE 'roster_member:%' EXCEPT SELECT key,value FROM " + configBefore + " WHERE key IN ('prizes_locked','registration_closed') OR key LIKE 'roster_member:%') AND NOT EXISTS(SELECT key,value FROM " + configBefore + " WHERE key IN ('prizes_locked','registration_closed') OR key LIKE 'roster_member:%' EXCEPT SELECT key,value FROM event_config WHERE key IN ('prizes_locked','registration_closed') OR key LIKE 'roster_member:%') THEN 1 ELSE 0 END").bind(runId),
    db.prepare('UPDATE participants AS p SET ' + updateFields.join(',') + ' FROM json_each(?) AS j WHERE p.source_row=' + j('source_row') + ' AND ' + j('is_new') + '=0').bind(payload),
    db.prepare('INSERT INTO participants(' + columns.join(',') + ') SELECT ' + columns.map(j).join(',') + ' FROM json_each(?) AS j WHERE ' + j('is_new') + '=1').bind(payload),
    db.prepare("INSERT INTO event_config(key,value) SELECT 'roster_member:'||" + j('source_row') + ",json_object('official_source_row'," + j('official_source_row') + ",'database_source_row'," + j('source_row') + ",'roster_group'," + j('roster_group') + ",'physical_row'," + j('physical_row') + ",'batch',?) FROM json_each(?) AS j WHERE 1 ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(runId,payload),
    db.prepare("INSERT INTO event_config(key,value) VALUES('latest_imported_at',datetime('now')),('official_roster_count',?),('last_reconciliation_backup',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(String(plan.total),runId.split(':')[0]),
    db.prepare("INSERT INTO event_config(key,value) VALUES('import_count','1') ON CONFLICT(key) DO UPDATE SET value=CAST(CAST(event_config.value AS INTEGER)+1 AS TEXT)"),
    db.prepare("INSERT INTO audit_log(action,actor_id,details) VALUES('official_roster_reconciled',?,?)").bind(actorId,JSON.stringify({backup_id:runId.split(':')[0],total:plan.total,existing:plan.existing_rows,new:plan.new_rows,extras:plan.extras.length}))
  ];
}
