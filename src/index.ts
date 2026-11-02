import type { D1Database, D1PreparedStatement } from "@cloudflare/workers-types";
type Fetcher = { fetch: (request: Request) => Promise<Response> };
import QRCode from 'qrcode';
import { planRoster, snapshotDatabase, loadSnapshot, exportSnapshot, reconciliationStatements } from './reconciliation.mjs';

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  BOOTSTRAP_TOKEN: string;
  RATE_LIMIT_SALT?: string;
}
type Role = 'admin' | 'reception' | 'gifts';
type Staff = { id: number; username: string; role: Role };
const EVENT_DATE = '2026-11-07';
const REGISTRATION_CUTOFF = '2026-11-06';
function brazilDate() { const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()); const v=Object.fromEntries(parts.map(p=>[p.type,p.value])); return `${v.year}-${v.month}-${v.day}`; }
const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG'];
const encoder = new TextEncoder();
class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
function d1DailyLimit(error:unknown):boolean {
 let current=error;
 // Binding errors may wrap the provider's detailed message in a cause.
 for(let depth=0;depth<5&&current!=null;depth++) {
   const item=typeof current==='object'?current as {message?:unknown;cause?:unknown}:null;
   const message=typeof current==='string'?current:typeof item?.message==='string'?item.message:'';
   if(/exceeded D1['’]s free tier daily row (read|write) limit/i.test(message))return true;
   current=item?.cause;
 }
 return false;
}
const reply = (v: unknown, status = 200) => new Response(JSON.stringify(v), {status, headers: {'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const fail = (status: number, message: string): never => { throw new HttpError(status, message); };
const clean = (v: unknown, max=250): string => typeof v === 'string' ? v.trim().slice(0,max) : v == null ? '' : String(v).trim().slice(0,max);
const paymentAmount=(v:unknown)=>{let raw=clean(v,60).replace(/[^0-9,.-]/g,'');if(raw.includes(',')&&raw.includes('.'))raw=raw.replace(/\./g,'').replace(',','.');else raw=raw.replace(',','.');const n=Number(raw);return Number.isFinite(n)?n:0;};
const digits = (v: unknown) => clean(v).replace(/\D/g,'');
const normalize = (v: unknown) => clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
const whatsappNumber=(v:unknown)=>{const d=digits(v);if((d.length===12||d.length===13)&&d.startsWith('55'))return d;if(d.length===10||d.length===11)return '55'+d;return '';};
const csvCell=(v:unknown)=>'"'+String(v??'').replace(/"/g,'""')+'"';
function confirmationMessage(name:string,hasShirt:boolean,size:string|null) {
 const text='Olá! A inscrição de '+clean(name)+' no Conferência ONE está confirmada para o dia 07/11/2026.';
 const shirt=hasShirt?'Sua camiseta'+(size?', tamanho '+clean(size):'')+', será entregue no dia do evento.':'';
 return text+'\n\n'+(shirt?shirt+'\n\n':'')+'Até lá! 🌳';
}
const hex = (buf: ArrayBuffer | Uint8Array) => [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
const random = (n=32) => hex(crypto.getRandomValues(new Uint8Array(n)));
const sha = async (s: string) => hex(await crypto.subtle.digest('SHA-256',encoder.encode(s)));
async function passwordHash(pass:string,salt:string) {
  const key=await crypto.subtle.importKey('raw',encoder.encode(pass),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:encoder.encode(salt),iterations:100000,hash:'SHA-256'},key,256));
}
const safeEqual=(a:string,b:string)=> { if(a.length!==b.length) return false; let d=0; for(let i=0;i<a.length;i++) d |= a.charCodeAt(i)^b.charCodeAt(i); return d===0; };
function cookie(request:Request,name:string) { return (request.headers.get('cookie')||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(name+'='))?.slice(name.length+1)||''; }
function sessionCookie(token:string,maxAge:number) { return `enr_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`; }
async function staffSession(request:Request,env:Env):Promise<Staff|null> {
 const token=cookie(request,'enr_session') || request.headers.get('x-jovens-session') || ''; if(!/^[a-f0-9]{64}$/.test(token)) return null;
 const h=await sha(token);
 return await env.DB.prepare('SELECT u.id,u.username,u.role FROM sessions s JOIN staff_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.active=1').bind(h,Date.now()).first<Staff>();
}
function requireRole(staff:Staff|null,allowed:Role[]): Staff {
 if(!staff) return fail(401,'Faça login para continuar.');
 if(!allowed.includes(staff.role)) return fail(403,'Seu perfil não permite esta operação.');
 return staff;
}
const DEFAULT_WHATSAPP_CONNECTOR_URL = '';
const LEGACY_WHATSAPP_CONNECTOR_URL = '';
const WHATSAPP_INSTANCE = 'jovens';

async function whatsappConfig(env:Env) {
  const rows=await env.DB.prepare("SELECT key,value FROM event_config WHERE key IN ('whatsapp_connector_url','whatsapp_connector_key')").all<{key:string;value:string}>();
  const cfg=Object.fromEntries(rows.results.map(x=>[x.key,x.value]));
  const url=cfg.whatsapp_connector_url;
  return {
    // Migrate the previous broken connector URL without exposing stored API keys.
    url:!url || url===LEGACY_WHATSAPP_CONNECTOR_URL ? DEFAULT_WHATSAPP_CONNECTOR_URL : url,
    key:cfg.whatsapp_connector_key || ''
  };
}

async function whatsappRequest(env:Env,path:string,init:RequestInit={}) {
  throw new HttpError(501,'WhatsApp automático indisponível nesta cópia.');
  const cfg=await whatsappConfig(env);
  if(!cfg.key || cfg.key.length<32) throw new Error('Configure a chave da Evolution API no painel administrativo.');
  const headers=new Headers(init.headers);
  headers.set('apikey',cfg.key);
  headers.set('accept','application/json');
  // Evolution API enforces CORS_ORIGIN even for server-to-server requests.
  // Cloudflare Workers do not automatically attach an Origin header to fetch().
  // Supply the one origin allowlisted on the dedicated Railway service.
  headers.set('origin','https://localhost.invalid');
  let response:Response;
  try {
    response=await fetch(cfg.url.replace(/\/$/,'')+path,{...init,headers,signal:AbortSignal.timeout(12000),cache:'no-store'});
  } catch {
    throw new Error('Evolution API indisponível. Verifique o serviço no Railway.');
  }
  const raw=await response.text();
  let data:any={};
  try{data=raw?JSON.parse(raw):{};}catch{data={};}
  if(!response.ok) {
    const err=data?.response?.message||data?.message||data?.error;
    const message=typeof err==='string'?clean(err,200):'HTTP '+response.status;
    throw new Error(response.status===401?'Chave da Evolution API inválida. Atualize no painel.':'Evolution API: '+message);
  }
  return data;
}

async function evolutionInstances(env:Env):Promise<any[]> {
  const data=await whatsappRequest(env,'/instance/fetchInstances');
  return Array.isArray(data)?data:[];
}
function hasEvolutionInstance(items:any[]):boolean {
  return items.some(item=>item?.name===WHATSAPP_INSTANCE || item?.instance?.instanceName===WHATSAPP_INSTANCE);
}
async function evolutionConnection(env:Env):Promise<string> {
  const instances=await evolutionInstances(env);
  if(!hasEvolutionInstance(instances)) return 'close';
  try {
    const data=await whatsappRequest(env,'/instance/connectionState/'+WHATSAPP_INSTANCE);
    return data?.instance?.state||'close';
  } catch {return 'close';}
}
function asQrImage(data:any):string|null {
  const value=data?.base64||data?.qrcode?.base64||data?.qrcode?.base64Qr||null;
  if(typeof value!=='string'||!value) return null;
  return value.startsWith('data:image/')?value:'data:image/png;base64,'+value;
}

async function jsonBody(request:Request,limit=250000):Promise<Record<string,any>> {
 if(!(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json')) return fail(415,'Envie JSON.');
 const text=await request.text(); if(text.length>limit) return fail(413,'Arquivo excede o limite.');
 try {const obj=JSON.parse(text); if(obj && typeof obj==='object' && !Array.isArray(obj)) return obj;} catch {}
 return fail(400,'JSON inválido.');
}
async function rateLimit(request:Request,env:Env,scope:string,max:number) {
 const saltRow=await env.DB.prepare("SELECT value FROM event_config WHERE key='rate_limit_salt'").first<{value:string}>();
 const salt=env.RATE_LIMIT_SALT || saltRow?.value;
 if(!salt || salt.length<20) return fail(503,'Proteção de acesso não configurada.');
 const ip=request.headers.get('cf-connecting-ip')||'local';
 const key=await sha(salt+':'+scope+':'+ip);
 const start=Math.floor(Date.now()/3600000);
 await env.DB.prepare('INSERT INTO rate_limits(key,window_start,attempts) VALUES(?,?,1) ON CONFLICT(key) DO UPDATE SET window_start=excluded.window_start, attempts=CASE WHEN rate_limits.window_start=excluded.window_start THEN rate_limits.attempts+1 ELSE 1 END').bind(key,start).run();
 const item=await env.DB.prepare('SELECT attempts FROM rate_limits WHERE key=?').bind(key).first<{attempts:number}>();
 if((item?.attempts||0)>max) return fail(429,'Muitas tentativas. Procure a recepção ou tente mais tarde.');
}
async function audit(env:Env,action:string,actor:number|null,participant:number|null,details='') {
 await env.DB.prepare('INSERT INTO audit_log(action,actor_id,participant_id,details) VALUES(?,?,?,?)').bind(action,actor,participant,details).run();
}
function publicCard(p:any) {
 const names=clean(p.full_name).split(/\s+/); return {name:names.length>1?`${names[0]} ${names.at(-1)?.[0]}.`:names[0], arrived:!!p.arrival_at, checked_in:!!p.checkin_at};
}
// The supplied gift list is independent of age. Keep legacy fields and history intact.
const PRIZE_ELIGIBLE_SQL="CASE WHEN (SELECT value FROM event_config WHERE key='official_prizes_source')='roster_2026' THEN EXISTS(SELECT 1 FROM event_config WHERE key='official_prize:'||participants.id) ELSE participants.prize_eligible END";
const PRIZE_RANK_SQL="CASE WHEN (SELECT value FROM event_config WHERE key='official_prizes_source')='roster_2026' THEN CAST((SELECT value FROM event_config WHERE key='official_prize:'||participants.id) AS INTEGER) ELSE participants.prize_rank END";
const PRIZE_DELIVERY_GUARD_SQL=`CREATE TRIGGER guarded_prize_delivery BEFORE UPDATE OF prize_delivered_at ON participants
 WHEN NEW.prize_delivered_at IS NOT NULL AND OLD.prize_delivered_at IS NULL
 BEGIN
   SELECT RAISE(ABORT,'prize list not finalized') WHERE COALESCE((SELECT value FROM event_config WHERE key='prizes_locked'),'0')<>'1';
   SELECT RAISE(ABORT,'not eligible for prize') WHERE OLD.active=0 OR
     CASE WHEN (SELECT value FROM event_config WHERE key='official_prizes_source')='roster_2026'
       THEN NOT EXISTS(SELECT 1 FROM event_config WHERE key='official_prize:'||OLD.id)
       ELSE OLD.prize_eligible=0 END;
 END`;
const SELECT_PARTICIPANT=`SELECT
 id,source_row,registered_at,full_name,guardian_name,contact,age_raw,age,active,
 duplicate_status,review_note,church,shirt_requested,
 CASE WHEN COALESCE(json_extract(roster.value,'$.official_source_row'),source_row)=135 OR (shirt_size='GG' AND json_extract(onsite.value,'$.shirt_size')='XGG') THEN 'XGG' ELSE shirt_size END AS shirt_size,
 json_extract(roster.value,'$.official_source_row') AS official_source_row,
 COALESCE(json_extract(roster.value,'$.roster_group'),json_extract(onsite.value,'$.roster_group')) AS roster_group,
 previous_attendance,media_consent,payment_raw,
 CASE
   WHEN shirt_payment_status='waived' THEN 'waived'
   WHEN CAST(REPLACE(REPLACE(REPLACE(COALESCE(payment_raw,''),'R$',''),' ',''),',','.') AS REAL)>=50 THEN 'confirmed'
   ELSE shirt_payment_status
 END AS shirt_payment_status,
 ${PRIZE_RANK_SQL} AS prize_rank,${PRIZE_ELIGIBLE_SQL} AS prize_eligible,authorization_status,authorization_note,authorization_at,
 registration_type,registration_confirmed_at,arrival_at,checkin_at,checkin_note,
 prize_delivered_at,shirt_delivered_at,
 COALESCE((SELECT value FROM event_config WHERE key='shirt_delivery_size:'||participants.id),shirt_delivered_size) AS shirt_delivered_size,ticket_token,
 reception_events.reception_payment_received_at,
 reception_events.reception_shirt_delivered_at,
 reception_events.reception_gift_delivered_at
 FROM participants LEFT JOIN event_config roster ON roster.key='roster_member:'||participants.source_row
 LEFT JOIN event_config onsite ON onsite.key='onsite_member:'||participants.id
 LEFT JOIN (
   SELECT participant_id,
     max(CASE WHEN action='reception_shirt_payment_received' THEN created_at END) AS reception_payment_received_at,
     max(CASE WHEN action='reception_shirt_delivered' THEN created_at END) AS reception_shirt_delivered_at,
     max(CASE WHEN action='reception_gift_delivered' THEN created_at END) AS reception_gift_delivered_at
   FROM audit_log WHERE action IN ('reception_shirt_payment_received','reception_shirt_delivered','reception_gift_delivered')
   GROUP BY participant_id
 ) reception_events ON reception_events.participant_id=participants.id`;
async function route(request:Request,env:Env):Promise<Response> {
 const url=new URL(request.url), path=url.pathname, method=request.method;
 if(!path.startsWith('/api/')) {
   if(method!=='GET' && method!=='HEAD') return reply({error:'Método não permitido.'},405);
   const appPage=['/','/checkin','/confirmacao','/equipe','/admin'].includes(path);
   // Cloudflare canonicalizes /index.html to / with a 307. Fetch / internally instead,
   // preserving the browser URL (/checkin, /equipe or /admin) for client-side routing.
   const assetPath=appPage?'/':path;
   const u=new URL(request.url); u.pathname=assetPath;
   const result=await env.ASSETS.fetch(new Request(u.toString(),request));
   const h=new Headers(result.headers); h.set('x-content-type-options','nosniff'); h.set('referrer-policy','no-referrer');
   h.set('content-security-policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
   if(appPage) h.set('cache-control','no-store');
   return new Response(result.body,{status:result.status,headers:h});
 }
 if(method!=='GET' && method!=='HEAD') {
   const origin=request.headers.get('origin');
   if(origin && origin!==url.origin) return fail(403,'Origem inválida.');
   if((request.headers.get('sec-fetch-site')||'')==='cross-site') return fail(403,'Origem inválida.');
 }
 if(path==='/api/health' && method==='GET') {
   // Report whether an authenticated spreadsheet import was applied without
   // exposing attendee counts, identities or other private registration data.
   const lastImport=await env.DB.prepare("SELECT value FROM event_config WHERE key='import_count'").first<{value:string}>();
   return reply({status:'ok',event_date:EVENT_DATE,configured:!!env.DB,import_applied:Number(lastImport?.value||0)>0});
 }
 if(path==='/api/public/qr.svg' && method==='GET') {
   const svg=await QRCode.toString(`${url.origin}/checkin`,{type:'svg',width:320,margin:2,errorCorrectionLevel:'M'});
   return new Response(svg,{headers:{'content-type':'image/svg+xml','cache-control':'public,max-age=3600','x-content-type-options':'nosniff'}});
 }
 if(path==='/api/setup-status' && method==='GET') {
   const row=await env.DB.prepare('SELECT count(*) AS total FROM staff_users').first<{total:number}>();
   return reply({initialized:(row?.total||0)>0,bootstrap_ready:typeof env.BOOTSTRAP_TOKEN==='string' && env.BOOTSTRAP_TOKEN.length>=32});
 }
 if(path==='/api/initialize' && method==='POST') {
   await rateLimit(request,env,'initialize',10); const b=await jsonBody(request);
   const count=await env.DB.prepare('SELECT count(*) AS total FROM staff_users').first<{total:number}>();
   if(count?.total) return fail(409,'A administração já foi configurada.');
   if(!env.BOOTSTRAP_TOKEN || env.BOOTSTRAP_TOKEN.length<32 || !safeEqual(clean(b.token,200),env.BOOTSTRAP_TOKEN)) return fail(403,'Token de instalação inválido.');
   const username=normalize(b.username).replace(/\s+/g,'.');
   if(!/^[a-z0-9._-]{4,40}$/.test(username)||typeof b.password!=='string'||b.password.length<12) return fail(400,'Informe usuário válido e senha de pelo menos 12 caracteres.');
   const salt=random(16), hashed=await passwordHash(b.password,salt);
   await env.DB.prepare("INSERT INTO staff_users(username,password_hash,salt,role) VALUES(?,?,?,'admin')").bind(username,hashed,salt).run();
   await audit(env,'bootstrap',null,null);
   return reply({ok:true});
 }
 if(path==='/api/session' && method==='POST') {
   await rateLimit(request,env,'login',100); const b=await jsonBody(request);
   await rateLimit(request,env,'login-account:'+normalize(b.username),12);
   const username=normalize(b.username).replace(/\s+/g,'.');
   const u=await env.DB.prepare('SELECT id,username,role,password_hash,salt FROM staff_users WHERE username=? AND active=1').bind(username).first<any>();
   if(!u || typeof b.password!=='string' || !safeEqual(await passwordHash(b.password,u.salt),u.password_hash)) return fail(401,'Usuário ou senha inválidos.');
   const token=random(32), expires=Date.now()+12*3600000;
   await env.DB.prepare('INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)').bind(await sha(token),u.id,expires).run();
   const response=reply({user:{id:u.id,username:u.username,role:u.role},sessionToken:token});
   response.headers.append('set-cookie',sessionCookie(token,12*3600)); return response;
 }
 if(path==='/api/session' && method==='GET') {const s=await staffSession(request,env);return reply({user:s});}
 if(path==='/api/session' && method==='DELETE') {
   const token=cookie(request,'enr_session') || request.headers.get('x-jovens-session') || ''; if(/^[a-f0-9]{64}$/.test(token)) await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha(token)).run();
   const response=reply({ok:true}); response.headers.append('set-cookie',sessionCookie('',0)); return response;
 }
 if(path==='/api/public/confirm-registration' && method==='POST') {
   await rateLimit(request,env,'registration-confirm',500);const b=await jsonBody(request);
   const name=normalize(b.name),phone=digits(b.contact);
   if(name.length<5||phone.length<9) return fail(400,'Informe o nome completo e o telefone usado na inscrição, com DDD quando houver.');
   await rateLimit(request,env,'registration-confirm-contact:'+phone,20);
   const hits=await env.DB.prepare('SELECT id,full_name,registration_type,shirt_requested,shirt_size,registration_confirmed_at FROM participants WHERE normalized_name=? AND contact_digits=? AND active=1').bind(name,phone).all<any>();
   if(hits.results.length!==1) return fail(404,'Não foi possível confirmar uma única inscrição com esses dados. Procure a equipe.');
   const p=hits.results[0];
   if(!p.registration_confirmed_at) {
     const updated=await env.DB.prepare("UPDATE participants SET registration_confirmed_at=datetime('now') WHERE id=? AND registration_confirmed_at IS NULL").bind(p.id).run();
     if(updated.meta.changes) await audit(env,'registration_confirmed_public',null,p.id);
   }
   const label=p.registration_type==='adolescent'?'Adolescente':p.registration_type==='adult_guardian'?'Adulto / responsável':p.registration_type==='team'?'Equipe':'Categoria a confirmar pela equipe';
   return reply({ok:true,name:publicCard(p).name,registration_type:p.registration_type,registration_label:label,shirt_requested:!!p.shirt_requested,shirt_size:p.shirt_size||null,event_date:EVENT_DATE});
 }
 if(path==='/api/public/lookup' && method==='POST') {
   await rateLimit(request,env,'lookup',500);const b=await jsonBody(request);
   const name=normalize(b.name), phone=digits(b.contact);
   if(name.length<5||phone.length<9) return fail(400,'Informe o nome completo e telefone cadastrado, incluindo DDD quando houver.');
   // One contact may legitimately be shared by several family registrations.
   await rateLimit(request,env,'lookup-contact:'+phone,20);
   const hits=await env.DB.prepare('SELECT id,source_row,full_name,ticket_token,arrival_at,checkin_at FROM participants WHERE normalized_name=? AND contact_digits=? AND active=1 ORDER BY source_row').bind(name,phone).all<any>();
   if(!hits.results.length) return fail(404,'Não foi possível confirmar a inscrição. Procure a equipe de recepção.');
   // Duplicidade exata de nome + telefone é tratada como a mesma pessoa no autoatendimento; usa a primeira inscrição física.
   const chosen=hits.results[0];
   return reply({ticket:chosen.ticket_token,...publicCard(chosen)});
 }
 if(path==='/api/public/ticket' && method==='GET') {
   await rateLimit(request,env,'ticket',1200);
   const ticket=url.searchParams.get('t')||'';
   if(!/^[a-f0-9]{48}$/.test(ticket)) return fail(400,'Código inválido.');
   const p=await env.DB.prepare('SELECT full_name,arrival_at,checkin_at FROM participants WHERE ticket_token=? AND active=1').bind(ticket).first<any>();
   if(!p) return fail(404,'Código de inscrição não encontrado.');
   return reply(publicCard(p));
 }
 if(path==='/api/public/arrive' && method==='POST') {
   await rateLimit(request,env,'arrive',600); const b=await jsonBody(request);
   if(!/^[a-f0-9]{48}$/.test(clean(b.ticket))) return fail(400,'Código inválido.');
   const p=await env.DB.prepare('SELECT id,full_name,arrival_at,checkin_at FROM participants WHERE ticket_token=? AND active=1').bind(b.ticket).first<any>();
   if(!p) return fail(404,'Inscrição não encontrada.');
   if(p.arrival_at) return reply({ok:true,already:true,...publicCard(p)});
   const r=await env.DB.prepare("UPDATE participants SET arrival_at=datetime('now') WHERE id=? AND arrival_at IS NULL").bind(p.id).run();
   if(r.meta.changes) await audit(env,'participant_arrived',null,p.id);
   return reply({ok:true,...publicCard({...p,arrival_at:new Date().toISOString()})});
 }
 const staff=await staffSession(request,env);
 // Recursos legados de premiação, vendas e integração externa: bloqueados neste projeto independente.
 const blockedLegacy=['/api/admin/finalize-prizes','/api/admin/reception-policy','/api/admin/stock','/api/staff/reception-payment','/api/staff/shirt','/api/staff/prize'];
 if(path.startsWith('/api/admin/whatsapp/')||blockedLegacy.includes(path)) {
   requireRole(staff,['admin','reception','gifts']);
   return fail(501,'Recurso legado desabilitado na cópia do Ministério de Jovens.');
 }

 if(path==='/api/staff/updates' && method==='GET') {
   requireRole(staff,['admin','reception','gifts']);
   // The primary key answers this probe without scanning participant histories.
   const latest=await env.DB.prepare('SELECT id FROM audit_log ORDER BY id DESC LIMIT 1').first<{id:number}>();
   return reply({version:Number(latest?.id||0)});
 }
 if(path==='/api/admin/database-backup' && method==='POST') {
   const u=requireRole(staff,['admin']);const b=await jsonBody(request);
   if(b.confirm!=='CRIAR BACKUP') return fail(400,'Confirmação de backup obrigatória.');
   const backup=await snapshotDatabase(env.DB);
   await env.DB.prepare("INSERT INTO event_config(key,value) VALUES('latest_backup_id',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(backup.id).run();
   await audit(env,'database_backup_created',u.id,null,'id='+backup.id+';tables='+backup.table_count);
   return reply({ok:true,backup});
 }
 if(path==='/api/admin/database-backup/export' && method==='POST') {
   requireRole(staff,['admin']);const b=await jsonBody(request);
   const sql=await exportSnapshot(env.DB,clean(b.backup_id,40));
   return new Response(sql,{headers:{'content-type':'application/sql; charset=utf-8','content-disposition':'attachment; filename="CONFERENCIA_ONE_D1_BACKUP_'+clean(b.backup_id,40)+'.sql"','cache-control':'no-store','x-content-type-options':'nosniff'}});
 }
 if((path==='/api/admin/roster-preview'||path==='/api/admin/roster-reconcile') && method==='POST') {
   const u=requireRole(staff,['admin']);const b=await jsonBody(request,1200000);
   if(b.schema_version!==1||b.event_date!==EVENT_DATE) return fail(400,'Base oficial de outro evento ou versão inválida.');
   const rows=await env.DB.prepare('SELECT * FROM participants ORDER BY source_row').all<any>();
   const configs=await env.DB.prepare("SELECT key,value FROM event_config WHERE key IN ('prizes_locked','registration_closed') OR key LIKE 'roster_member:%' ORDER BY key").all<{key:string;value:string}>();
   const previous=configs.results.filter(p=>p.key.startsWith('roster_member:')).map(p=>JSON.parse(p.value));
   const plan=planRoster(b.participants,rows.results,previous);
   const fingerprint=await sha(JSON.stringify({rows:rows.results,configs:configs.results}));
   const summary={ok:plan.conflicts.length===0,total:plan.total,existing_rows:plan.existing_rows,new_rows:plan.new_rows,moved_rows:plan.moved_rows,contact_corrections:plan.contact_corrections,name_corrections:plan.name_corrections,groups:plan.groups,conflicts:plan.conflicts,extra_rows:plan.extras.length,extra_source_rows:plan.extras.map((p:any)=>p.source_row),database_total:rows.results.length,expected_fingerprint:fingerprint};
   if(path.endsWith('roster-preview')) return reply(summary);
   if(plan.conflicts.length) return fail(409,'Conciliação interrompida: '+plan.conflicts.slice(0,4).join(' '));
   if(b.expected_fingerprint!==fingerprint) return fail(409,'O banco mudou após a conferência. Faça nova conferência e novo backup.');
   if(b.confirm!=='RECONCILIAR SEM EXCLUIR') return fail(400,'Confirmação de reconciliação obrigatória.');
   const backupId=clean(b.backup_id,40),snapshot=await loadSnapshot(env.DB,backupId);
   for(const p of plan.matches) if(p.is_new) p.ticket_token=random(24);
   const locked=configs.results.some(p=>p.key==='prizes_locked'&&p.value==='1');
   const runId=backupId+':'+random(6);
   try {await env.DB.batch(reconciliationStatements(env.DB,plan,snapshot,locked,runId,u.id));}
   catch {return fail(409,'A base mudou desde o backup ou a validação falhou. Nada foi aplicado; faça novo backup e nova conferência.');}
   const verified=await env.DB.prepare('SELECT count(*) total,sum(active=1) active,sum(checkin_at IS NOT NULL) checked_in,sum(arrival_at IS NOT NULL) arrived,sum(shirt_delivered_at IS NOT NULL) shirts,sum(prize_delivered_at IS NOT NULL) prizes FROM participants').first();
   return reply({...summary,applied:true,backup_id:backupId,verified});
 }
 if(path==='/api/staff/stats' && method==='GET') {
   requireRole(staff,['admin','reception','gifts']);
   const counts=await env.DB.prepare("SELECT count(*) total,sum(CASE WHEN registration_confirmed_at IS NOT NULL THEN 1 ELSE 0 END) registration_confirmed,sum(CASE WHEN registration_type='adolescent' THEN 1 ELSE 0 END) adolescents,sum(CASE WHEN registration_type='adult_guardian' THEN 1 ELSE 0 END) adults_guardians,sum(CASE WHEN registration_type='team' THEN 1 ELSE 0 END) team,sum(CASE WHEN registration_type='other' THEN 1 ELSE 0 END) type_review,sum(CASE WHEN arrival_at IS NOT NULL THEN 1 ELSE 0 END) arrived,sum(CASE WHEN checkin_at IS NOT NULL THEN 1 ELSE 0 END) checked_in,sum(CASE WHEN prize_delivered_at IS NOT NULL THEN 1 ELSE 0 END) prizes,sum(CASE WHEN shirt_delivered_at IS NOT NULL THEN 1 ELSE 0 END) shirts FROM participants WHERE active=1").first<any>();
   const stock=await env.DB.prepare('SELECT size,total_qty,delivered_qty,(total_qty-delivered_qty) available FROM shirt_stock ORDER BY CASE size WHEN \'PP\' THEN 0 WHEN \'P\' THEN 1 WHEN \'M\' THEN 2 WHEN \'G\' THEN 3 ELSE 4 END').all();
   // Latest arrivals are only returned to authenticated team members.
   const recent=await env.DB.prepare(`SELECT id,full_name,source_row,arrival_at,checkin_at,shirt_requested,shirt_size,shirt_payment_status,${PRIZE_ELIGIBLE_SQL} AS prize_eligible,${PRIZE_RANK_SQL} AS prize_rank,prize_delivered_at,shirt_delivered_at,authorization_status,age FROM participants WHERE active=1 AND arrival_at IS NOT NULL ORDER BY arrival_at DESC,id DESC LIMIT 12`).all<any>();
   const configs=await env.DB.prepare("SELECT key,value FROM event_config WHERE key IN ('prizes_locked','registration_closed','latest_imported_at','import_count','latest_backup_id','official_roster_count','last_reconciliation_backup','official_prizes_source','onsite_shirt_price','reception_flow','reception_policy_version') OR (key>='official_prize:' AND key<'official_prize;') OR (key>='roster_member:' AND key<'roster_member;')").all<{key:string;value:string}>();
   const cfg=Object.fromEntries(configs.results.map(x=>[x.key,x.value]));
   const groups=configs.results.filter(p=>p.key.startsWith('roster_member:')).map(p=>JSON.parse(p.value).roster_group);
   return reply({onsite_shirt_price:Number(cfg.onsite_shirt_price||60),reception_flow:cfg.reception_flow||'shirt_gift_entry',reception_policy_version:Number(cfg.reception_policy_version||0),counts:counts||{},stock:stock.results,recent_arrivals:recent.results,prizes_locked:cfg.prizes_locked==='1',official_prize_count:configs.results.filter(p=>p.key.startsWith('official_prize:')).length,registration_closed:cfg.registration_closed==='1',last_imported_at:cfg.latest_imported_at||null,import_count:Number(cfg.import_count||0),can_close:brazilDate()>=REGISTRATION_CUTOFF,latest_backup_id:staff?.role==='admin'?(cfg.latest_backup_id||null):null,official_roster_count:Number(cfg.official_roster_count||0),roster_groups:{volunteer:groups.filter(x=>x==='volunteer').length,support:groups.filter(x=>x==='support').length,adolescent:groups.filter(x=>x==='adolescent').length}});
 }
 if(path==='/api/admin/whatsapp/status' && method==='GET') {
   requireRole(staff,['admin']);
   const cfg=await whatsappConfig(env);
   if(!cfg.key || cfg.key.length<32) return reply({configured:false,provider:'evolution',state:'not_configured',connected:false});
   if(url.searchParams.get('probe')!=='1') return reply({configured:true,provider:'evolution',state:'not_checked',connected:false});
   try {
     const state=await evolutionConnection(env);
     return reply({configured:true,provider:'evolution',state,connected:state==='open'});
   } catch(e:any) {
     return reply({configured:true,provider:'evolution',state:'error',connected:false,error:e instanceof Error?e.message:'Falha ao consultar a Evolution API.'});
   }
 }
 if(path==='/api/admin/whatsapp/config' && method==='POST') {
   const u=requireRole(staff,['admin']); const b=await jsonBody(request);
   const key=clean(b.api_key,300);
   if(key.length<32) return fail(400,'A chave da Evolution API precisa ter pelo menos 32 caracteres.');
   await env.DB.prepare("INSERT INTO event_config(key,value) VALUES('whatsapp_connector_url',?),('whatsapp_connector_key',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(DEFAULT_WHATSAPP_CONNECTOR_URL,key).run();
   await audit(env,'whatsapp_evolution_configured',u.id,null);
   return reply({ok:true,configured:true,provider:'evolution'});
 }
 if(path==='/api/admin/whatsapp/qr' && method==='GET') {
   requireRole(staff,['admin']);
   const instances=await evolutionInstances(env);
   const exists=hasEvolutionInstance(instances);
   const state=exists?await evolutionConnection(env):'close';
   if(state==='open') return reply({configured:true,provider:'evolution',state,connected:true,base64:null});
   let created:any=null;
   if(!exists) {
     try {
       created=await whatsappRequest(env,'/instance/create',{
         method:'POST',headers:{'content-type':'application/json'},
         body:JSON.stringify({instanceName:WHATSAPP_INSTANCE,qrcode:true,integration:'WHATSAPP-BAILEYS'})
       });
     } catch(e:any) {
       // Another authenticated request may have already created the instance.
       if(!String(e?.message||'').toLowerCase().includes('already')) throw e;
     }
   }
   const initialQr=asQrImage(created);
   if(initialQr) return reply({configured:true,provider:'evolution',state:'qr',connected:false,base64:initialQr});
   const data=await whatsappRequest(env,'/instance/connect/'+WHATSAPP_INSTANCE);
   const base64=asQrImage(data);
   return reply({configured:true,provider:'evolution',state:base64?'qr':'connecting',connected:false,base64});
 }
 if(path==='/api/admin/whatsapp/send' && method==='POST') {
   const u=requireRole(staff,['admin']);
   const b=await jsonBody(request);
   const number=whatsappNumber(b.number);
   const text=clean(b.text,4000);
   if(!number) return fail(400,'Informe um número brasileiro válido com DDD.');
   if(!text) return fail(400,'Digite a mensagem.');
   await rateLimit(request,env,'whatsapp-test',14);
   if(await evolutionConnection(env)!=='open') return fail(409,'Conecte a nova instância da Evolution API antes de enviar.');
   const local=number.slice(4),ddd=number.slice(2,4);
   const candidates=[number];
   if(local.length===9&&local.startsWith('9')) candidates.push('55'+ddd+local.slice(1));
   if(local.length===8&&!local.startsWith('9')) candidates.push('55'+ddd+'9'+local);
   let jid='';
   for(const candidate of [...new Set(candidates)]) {
     try {
       const matched=await whatsappRequest(env,'/chat/whatsappNumbers/'+WHATSAPP_INSTANCE,{
         method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({numbers:[candidate]})
       });
       if(Array.isArray(matched)&&matched[0]?.exists) {jid=matched[0].jid||candidate;break;}
     } catch { /* Try next candidate. No message is sent during lookup. */ }
   }
   if(!jid) return fail(422,'Número não encontrado no WhatsApp. Confira o telefone.');
   const data=await whatsappRequest(env,'/message/sendText/'+WHATSAPP_INSTANCE,{
     method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({number:jid,text})
   });
   const messageId=data?.key?.id||data?.message?.key?.id||null;
   await audit(env,'whatsapp_evolution_message_accepted',u.id,null,'number_last4='+number.slice(-4));
   return reply({ok:true,provider:'evolution',status:'accepted',delivery:'unconfirmed',messageId});
 }
 if(path==='/api/admin/whatsapp/disconnect' && method==='POST') {
   const u=requireRole(staff,['admin']);
   await whatsappRequest(env,'/instance/logout/'+WHATSAPP_INSTANCE,{method:'DELETE'});
   await audit(env,'whatsapp_evolution_disconnected',u.id,null);
   return reply({ok:true});
 }
 if(path==='/api/admin/communications' && method==='GET') {
   requireRole(staff,['admin']);
   const rows=await env.DB.prepare(
      "SELECT p.id participant_id,p.full_name,p.contact_digits,p.contact,p.shirt_requested,p.shirt_size,p.registration_confirmed_at,"+
      "COALESCE(c.status,'not_sent') status,c.sent_at,c.note "+
      "FROM participants p LEFT JOIN communication_individual c ON c.participant_id=p.id "+
      "WHERE p.active=1 "+
      "ORDER BY CASE COALESCE(c.status,'not_sent') WHEN 'not_sent' THEN 0 WHEN 'failed' THEN 1 WHEN 'sent' THEN 2 ELSE 3 END,p.source_row"
   ).all<any>();
   const contacts=rows.results.map(r=>({
      participant_id:Number(r.participant_id),contact_digits:r.contact_digits,
      whatsapp_phone:whatsappNumber(r.contact_digits),contact:r.contact,
      names:[r.full_name],total:1,confirmed:r.registration_confirmed_at?1:0,
      shirt_requested:!!r.shirt_requested,shirt_size:r.shirt_size||null,
      status:r.status||'not_sent',sent_at:r.sent_at||null,note:r.note||'',
      message:confirmationMessage(r.full_name,!!r.shirt_requested,r.shirt_size||null)
   }));
   const countByPhone=new Map<string,number>();
   for(const c of contacts) if(c.whatsapp_phone) countByPhone.set(c.whatsapp_phone,(countByPhone.get(c.whatsapp_phone)||0)+1);
   const summary={
      contacts:countByPhone.size,registrations:contacts.length,
      confirmed:contacts.reduce((n,x)=>n+x.confirmed,0),
      not_sent:contacts.filter(x=>x.status==='not_sent').length,
      sent:contacts.filter(x=>x.status==='sent').length,
      failed:contacts.filter(x=>x.status==='failed').length,
      skipped:contacts.filter(x=>x.status==='skipped').length,
      invalid_phone:contacts.filter(x=>!x.whatsapp_phone).length,
      family_contacts:[...countByPhone.values()].filter(n=>n>1).length
   };
   return reply({contacts,summary});
 }
 if(path==='/api/admin/communications.csv' && method==='GET') {
   requireRole(staff,['admin']);
   const rows=await env.DB.prepare(
      "SELECT p.id,p.full_name,p.contact_digits,p.shirt_requested,p.shirt_size,"+
      "COALESCE(c.status,'not_sent') status "+
      "FROM participants p LEFT JOIN communication_individual c ON c.participant_id=p.id "+
      "WHERE p.active=1 ORDER BY p.source_row"
   ).all<any>();
   const lines=['Inscricao,Nome,Telefone WhatsApp,Mensagem,Camiseta,Tamanho,Status'];
   for(const r of rows.results){
      const phone=whatsappNumber(r.contact_digits);
      lines.push([
        r.id,r.full_name,phone,
        confirmationMessage(r.full_name,!!r.shirt_requested,r.shirt_size||null),
        r.shirt_requested?'Sim':'Não',r.shirt_size||'',phone?(r.status||'not_sent'):'revisar_telefone'
      ].map(csvCell).join(','));
   }
   return new Response('\uFEFF'+lines.join('\r\n'),{headers:{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="jovens-confirmacoes-individuais.csv"','cache-control':'no-store','x-content-type-options':'nosniff'}});
 }
 if(path==='/api/admin/communication-status' && method==='POST') {
   const u=requireRole(staff,['admin']);const b=await jsonBody(request);
   const participantId=Number(b.participant_id),status=clean(b.status),note=clean(b.note,200);
   if(!Number.isInteger(participantId)||participantId<=0||!['not_sent','sent','skipped','failed'].includes(status))
      return fail(400,'Inscrição ou status inválido.');
   const person=await env.DB.prepare('SELECT id,contact_digits FROM participants WHERE id=? AND active=1').bind(participantId).first<{id:number;contact_digits:string}>();
   if(!person) return fail(404,'Inscrição não encontrada ou inativa.');
   if(status==='sent'&&!whatsappNumber(person.contact_digits)) return fail(422,'Confirme o telefone antes de marcar a mensagem como enviada.');
   await env.DB.prepare(
      "INSERT INTO communication_individual(participant_id,status,sent_at,updated_at,updated_by,note) "+
      "VALUES(?,?,CASE WHEN ?='sent' THEN datetime('now') ELSE NULL END,datetime('now'),?,?) "+
      "ON CONFLICT(participant_id) DO UPDATE SET status=excluded.status,"+
      "sent_at=CASE WHEN excluded.status='sent' THEN COALESCE(communication_individual.sent_at,datetime('now')) WHEN excluded.status='not_sent' THEN NULL ELSE communication_individual.sent_at END,"+
      "updated_at=datetime('now'),updated_by=excluded.updated_by,note=excluded.note"
   ).bind(participantId,status,status,u.id,note||null).run();
   await audit(env,'communication_individual_status',u.id,participantId,status);
   return reply({ok:true});
 }
 if(path==='/api/staff/list' && method==='GET') {
   const u=requireRole(staff,['admin','reception','gifts']);
   const q=normalize(url.searchParams.get('q')||'');
   const items=await env.DB.prepare(SELECT_PARTICIPANT+` WHERE (?='' OR normalized_name LIKE ?) ORDER BY CASE WHEN arrival_at IS NOT NULL AND checkin_at IS NULL THEN 0 WHEN checkin_at IS NULL THEN 1 ELSE 2 END,source_row LIMIT 300`).bind(q,`%${q}%`).all<any>();
   const output=items.results.map(p=>u.role==='gifts'?({...p,guardian_name:undefined,contact:undefined,authorization_note:undefined,checkin_note:undefined,ticket_token:undefined}):p);
   return reply({items:output});
 }
 if(path==='/api/staff/register-onsite' && method==='POST') {
   const u=requireRole(staff,['admin','reception']);const b=await jsonBody(request,8000);
   const requestKey=clean(b.request_key,60),name=clean(b.full_name,151),contact=clean(b.contact,41),guardian=clean(b.guardian_name,151),church=clean(b.church,151);
   if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(requestKey))return fail(400,'Atualize o painel antes de cadastrar.');
   const normalizedName=normalize(name),phone=digits(contact);
   if(name.length<3||name.length>150||normalizedName.length<3)return fail(400,'Informe o nome completo do participante.');
   if(contact.length>40||(contact&&!/^(?:\d{10,11}|55\d{10,11})$/.test(phone)))return fail(400,'Informe um telefone com DDD ou deixe o contato vazio.');
   if(guardian.length>150||church.length>150)return fail(400,'Responsável e igreja devem ter até 150 caracteres.');
   const profile=clean(b.profile,30);
   if(!['adolescent','adult_guardian','volunteer','support'].includes(profile))return fail(400,'Selecione o perfil da inscrição.');
   if(typeof b.shirt_requested!=='boolean')return fail(400,'Informe se deseja camiseta.');
   const size=b.shirt_requested?clean(b.shirt_size,10).toUpperCase():null;
   if(b.shirt_requested&&!SIZES.includes(size!))return fail(400,'Selecione o tamanho da camiseta.');
   const fingerprint=await sha(JSON.stringify({name,contact,guardian,church,profile,shirt:b.shirt_requested,size}));
   const receiptKey='onsite_registration:'+requestKey;
   const receipt=await env.DB.prepare('SELECT value FROM event_config WHERE key=?').bind(receiptKey).first<{value:string}>();
   if(receipt){
     const saved=JSON.parse(receipt.value);
     if(saved.fingerprint!==fingerprint)return fail(409,'Este cadastro já foi enviado com outros dados. Confira a ficha antes de cadastrar outra pessoa.');
     const item=await env.DB.prepare(SELECT_PARTICIPANT+' WHERE ticket_token=?').bind(saved.ticket_token).first<any>();
     if(!item||!item.active)return fail(409,'A inscrição foi alterada pela administração. Busque a ficha pelo nome.');
     return reply({ok:true,created:false,replayed:true,item});
   }
   // A shared phone is normal for siblings. A repeated full name must be checked
   // in the existing ficha; this route never edits or merges that person's history.
   const existing=await env.DB.prepare(SELECT_PARTICIPANT+' WHERE normalized_name=? AND active=1 ORDER BY id LIMIT 2').bind(normalizedName).all<any>();
   if(existing.results.length>1)return fail(409,'Há mais de uma inscrição com esse nome. Localize e confira a ficha pela busca antes de continuar.');
   if(existing.results.length===1)return reply({ok:true,created:false,existing:true,item:existing.results[0]});
   const ticket=random(24),group=profile==='adult_guardian'?'adult_guardian':profile;
   const registrationType=['volunteer','support'].includes(profile)?'team':profile;
   const record=JSON.stringify({fingerprint,ticket_token:ticket,actor_id:u.id});
   const metadata=JSON.stringify({roster_group:group,shirt_size:size,registered_by:u.id,origin:'reception'});
   // D1 executes the batch transactionally: both the retry receipt and the name
   // check are repeated inside it, covering two desks registering concurrently.
   const saved=await env.DB.batch([
     env.DB.prepare("INSERT INTO event_config(key,value) SELECT ?,? WHERE NOT EXISTS(SELECT 1 FROM participants WHERE normalized_name=? AND active=1) ON CONFLICT(key) DO NOTHING").bind(receiptKey,record,normalizedName),
     env.DB.prepare(`INSERT INTO participants(source_row,registered_at,full_name,normalized_name,guardian_name,contact,contact_digits,church,shirt_requested,shirt_size,shirt_payment_status,payment_raw,registration_type,arrival_at,ticket_token)
       SELECT (SELECT COALESCE(MAX(source_row),1)+1 FROM participants),datetime('now'),?,?,?,?,?,?,?,?, 'unverified','',?,datetime('now'),json_extract(value,'$.ticket_token')
       FROM event_config WHERE key=? AND json_extract(value,'$.fingerprint')=?
       AND NOT EXISTS(SELECT 1 FROM participants WHERE normalized_name=? AND active=1)
       AND NOT EXISTS(SELECT 1 FROM participants WHERE ticket_token=json_extract(event_config.value,'$.ticket_token'))`)
       .bind(name,normalizedName,guardian,contact,phone,church,b.shirt_requested?1:0,size==='XGG'?'GG':size,registrationType,receiptKey,fingerprint,normalizedName),
     env.DB.prepare(`INSERT INTO event_config(key,value) SELECT 'onsite_member:'||id,? FROM participants WHERE ticket_token=(SELECT json_extract(value,'$.ticket_token') FROM event_config WHERE key=? AND json_extract(value,'$.fingerprint')=?) ON CONFLICT(key) DO NOTHING`).bind(metadata,receiptKey,fingerprint),
     env.DB.prepare(`INSERT INTO audit_log(action,actor_id,participant_id,details)
       SELECT 'onsite_registration_created',?,id,'origin=reception;event=07/11/2026' FROM participants
       WHERE ticket_token=(SELECT json_extract(value,'$.ticket_token') FROM event_config WHERE key=? AND json_extract(value,'$.fingerprint')=?)
       AND NOT EXISTS(SELECT 1 FROM audit_log WHERE action='onsite_registration_created' AND participant_id=participants.id)`).bind(u.id,receiptKey,fingerprint)
   ]);
   const committed=await env.DB.prepare('SELECT value FROM event_config WHERE key=?').bind(receiptKey).first<{value:string}>();
   if(committed){
     const stored=JSON.parse(committed.value);
     if(stored.fingerprint!==fingerprint)return fail(409,'Este cadastro já foi enviado com outros dados. Confira a ficha pelo nome.');
     const item=await env.DB.prepare(SELECT_PARTICIPANT+' WHERE ticket_token=? AND active=1').bind(stored.ticket_token).first<any>();
     if(item)return reply({ok:true,created:!!saved[1].meta.changes,replayed:!saved[1].meta.changes,item});
   }
   const concurrent=await env.DB.prepare(SELECT_PARTICIPANT+' WHERE normalized_name=? AND active=1 ORDER BY id LIMIT 2').bind(normalizedName).all<any>();
   if(concurrent.results.length===1)return reply({ok:true,created:false,existing:true,item:concurrent.results[0]});
   return fail(409,'A base mudou durante o cadastro. Busque e confira a ficha antes de continuar.');
 }
 if(path==='/api/staff/participant' && method==='GET') {
   const u=requireRole(staff,['admin','reception','gifts']);
   const id=Number(url.searchParams.get('id'));
   if(!Number.isInteger(id)||id<=0) return fail(400,'Inscrição inválida.');
   const p=await env.DB.prepare(SELECT_PARTICIPANT+' WHERE id=? AND active=1').bind(id).first<any>();
   if(!p) return fail(404,'Inscrição não encontrada.');
   const item=u.role==='gifts'?({...p,guardian_name:undefined,contact:undefined,authorization_note:undefined,checkin_note:undefined,ticket_token:undefined}):p;
   return reply({item});
 }
 if(path==='/api/staff/ticket' && method==='GET') {
   requireRole(staff,['admin','reception']);
   const token=url.searchParams.get('t')||'';
   if(!/^[a-f0-9]{48}$/.test(token)) return fail(400,'QR Code inválido.');
   const p=await env.DB.prepare(SELECT_PARTICIPANT+' WHERE ticket_token=? AND active=1').bind(token).first<any>();
   if(!p) return fail(404,'Inscrição não encontrada.');
   return reply({item:p});
 }
 const qrMatch=path.match(/^\/api\/staff\/qr\/(\d+)\.svg$/);
 if(qrMatch && method==='GET') {
   requireRole(staff,['admin','reception']);
   const p=await env.DB.prepare('SELECT ticket_token FROM participants WHERE id=? AND active=1').bind(Number(qrMatch[1])).first<{ticket_token:string}>();
   if(!p) return fail(404,'Participante não encontrado.');
   const svg=await QRCode.toString(`${url.origin}/checkin?t=${p.ticket_token}`,{type:'svg',width:360,margin:2});
   return new Response(svg,{headers:{'content-type':'image/svg+xml','cache-control':'no-store','x-content-type-options':'nosniff'}});
 }
 if(path==='/api/staff/checkin' && method==='POST') {
   const u=requireRole(staff,['admin','reception']);const b=await jsonBody(request);const id=Number(b.id);
   const p=await env.DB.prepare('SELECT id,age,active,authorization_status,checkin_at FROM participants WHERE id=?').bind(id).first<any>();
   if(!p||!p.active) return fail(404,'Inscrição inativa ou inexistente.');
   if(p.checkin_at) return fail(409,'Entrada já liberada.');
   const r=await env.DB.prepare("UPDATE participants SET arrival_at=coalesce(arrival_at,datetime('now')),checkin_at=datetime('now'),checkin_by=?,checkin_note=? WHERE id=? AND checkin_at IS NULL AND active=1").bind(u.id,clean(b.note,300),id).run();
   if(!r.meta.changes) return fail(409,'O cadastro foi alterado; atualize a ficha.');
   await audit(env,'checkin_approved',u.id,id);return reply({ok:true});
 }
 if(path==='/api/staff/reception-payment' && method==='POST') {
   const u=requireRole(staff,['admin','reception']);const b=await jsonBody(request);const id=Number(b.id);
   const p=await env.DB.prepare('SELECT id,active,shirt_requested,shirt_payment_status,payment_raw FROM participants WHERE id=?').bind(id).first<any>();
   if(!p||!p.active) return fail(404,'Inscrição inativa ou inexistente.');
   if(!p.shirt_requested) return fail(409,'Esta inscrição não possui camiseta.');
   if(p.shirt_payment_status==='confirmed'||p.shirt_payment_status==='waived'||paymentAmount(p.payment_raw)>=50){if(p.shirt_payment_status==='unverified')await env.DB.prepare("UPDATE participants SET shirt_payment_status='confirmed' WHERE id=?").bind(id).run();return reply({ok:true,already:true,source:paymentAmount(p.payment_raw)>=50?'planilha':'status'});}
   await env.DB.batch([
     env.DB.prepare("UPDATE participants SET shirt_payment_status='confirmed' WHERE id=? AND active=1 AND shirt_requested=1").bind(id),
     env.DB.prepare("INSERT INTO audit_log(action,participant_id,actor_id,details) SELECT 'reception_shirt_payment_received',?,?,? WHERE NOT EXISTS(SELECT 1 FROM audit_log WHERE participant_id=? AND action='reception_shirt_payment_received')").bind(id,u.id,'amount=60;event=07/11/2026',id)
   ]);
   return reply({ok:true,amount:60});
 }
 if(path==='/api/staff/reception-complete' && method==='POST') {
   const u=requireRole(staff,['admin','reception']);const b=await jsonBody(request);const id=Number(b.id);
   const p=await env.DB.prepare(`SELECT id,active,checkin_at,${PRIZE_ELIGIBLE_SQL} AS prize_eligible,${PRIZE_RANK_SQL} AS prize_rank FROM participants WHERE id=?`).bind(id).first<any>();
   if(!p||!p.active) return fail(404,'Inscrição inativa ou inexistente.');
   if(p.checkin_at) return reply({ok:true,already:true,gift_eligible:!!p.prize_eligible,gift_rank:p.prize_rank||null});
   const r=await env.DB.prepare("UPDATE participants SET arrival_at=coalesce(arrival_at,datetime('now')),checkin_at=datetime('now'),checkin_by=? WHERE id=? AND active=1 AND checkin_at IS NULL").bind(u.id,id).run();
   if(!r.meta.changes) return fail(409,'A ficha já foi atualizada. Recarregue o painel.');
   await audit(env,'reception_checkin_completed',u.id,id,'entrada_liberada_sem_entregas_automaticas');
   return reply({ok:true,gift_eligible:!!p.prize_eligible,gift_rank:p.prize_rank||null});
 }
 if(path==='/api/staff/prize' && method==='POST') {
   const u=requireRole(staff,['admin','reception','gifts']);const b=await jsonBody(request);const id=Number(b.id);
   const r=await env.DB.prepare(`UPDATE participants SET prize_delivered_at=datetime('now'),prize_delivered_by=? WHERE id=? AND (${PRIZE_ELIGIBLE_SQL})=1 AND active=1 AND prize_delivered_at IS NULL AND (SELECT value FROM event_config WHERE key='prizes_locked')='1'`).bind(u.id,id).run();
   if(!r.meta.changes) return fail(409,'Prêmio não disponível, lista ainda aberta ou já entregue.');
   await audit(env,'prize_delivered',u.id,id);return reply({ok:true});
 }
 if(path==='/api/staff/shirt' && method==='POST') {
   const u=requireRole(staff,['admin','reception','gifts']);const b=await jsonBody(request);const id=Number(b.id),size=clean(b.size);
   if(!SIZES.includes(size)) return fail(400,'Tamanho inválido.');
   const storedSize=size==='XGG'?'GG':size;
   try {
     await env.DB.batch([
       // Preserve the exact delivered size without changing the existing table's legacy enum.
       // The NOT NULL guard makes duplicate or unpaid deliveries roll back as one batch.
       env.DB.prepare(`INSERT INTO event_config(key,value) SELECT 'shirt_delivery_size:'||CAST(? AS INTEGER),
         CASE WHEN EXISTS(SELECT 1 FROM participants WHERE id=? AND active=1 AND shirt_requested=1
           AND (shirt_payment_status IN ('confirmed','waived') OR CAST(REPLACE(REPLACE(REPLACE(COALESCE(payment_raw,''),'R$',''),' ',''),',','.') AS REAL)>=50) AND shirt_delivered_at IS NULL)
         THEN ? ELSE NULL END ON CONFLICT(key) DO UPDATE SET value=excluded.value`).bind(id,id,size),
       env.DB.prepare("UPDATE participants SET shirt_delivered_at=datetime('now'),shirt_delivered_size=?,shirt_delivered_by=? WHERE id=?").bind(storedSize,u.id,id),
       env.DB.prepare("INSERT INTO audit_log(action,actor_id,participant_id,details) VALUES('shirt_delivered',?,?,?)").bind(u.id,id,'size='+size)
     ]);
   } catch(e) {if(d1DailyLimit(e))throw e;return fail(409,'Camiseta não disponível: confira o pagamento, a inscrição e se a entrega já foi registrada.');}
   return reply({ok:true,size});
 }
 if(path==='/api/admin/authorize' && method==='POST') {
   const u=requireRole(staff,['admin']);const b=await jsonBody(request),id=Number(b.id),status=clean(b.status),note=clean(b.note,300);
   if(!['pending','approved','rejected'].includes(status)||note.length<5) return fail(400,'Informe o status e evidência da conferência em observações.');
   const r=await env.DB.prepare("UPDATE participants SET authorization_status=?,authorization_note=?,authorization_at=datetime('now'),authorization_by=? WHERE id=? AND active=1").bind(status,note,u.id,id).run();
   if(!r.meta.changes) return fail(404,'Inscrição não encontrada.');
   await audit(env,'minor_authorization',u.id,id,status);return reply({ok:true});
 }
 if(path==='/api/admin/registration-type' && method==='POST') {
   const u=requireRole(staff,['admin']);const b=await jsonBody(request),id=Number(b.id),type=clean(b.registration_type);
   if(!['adolescent','adult_guardian','team','other'].includes(type)) return fail(400,'Perfil de inscrição inválido.');
   const r=await env.DB.prepare('UPDATE participants SET registration_type=? WHERE id=? AND active=1').bind(type,id).run();
   if(!r.meta.changes) return fail(404,'Inscrição não encontrada.');
   await audit(env,'registration_type_reviewed',u.id,id,type);return reply({ok:true});
 }
 if(path==='/api/admin/payment' && method==='POST') {
   const u=requireRole(staff,['admin']);const b=await jsonBody(request),id=Number(b.id),status=clean(b.status);
   if(!['unverified','confirmed','waived'].includes(status)) return fail(400,'Status de pagamento inválido.');
   const r=await env.DB.prepare('UPDATE participants SET shirt_payment_status=? WHERE id=? AND active=1 AND shirt_delivered_at IS NULL').bind(status,id).run();
   if(!r.meta.changes) return fail(409,'Inscrição inexistente ou camiseta já entregue.');
   await audit(env,'shirt_payment_reviewed',u.id,id,status);return reply({ok:true});
 }
 if(path==='/api/admin/reset-test-entries' && method==='POST') {
   const u=requireRole(staff,['admin']);const b=await jsonBody(request);
   if(brazilDate()>=EVENT_DATE)return fail(409,'A reversão de testes só está disponível antes do evento.');
   const entries=b.entries;
   if(b.reason!=='teste_pre_evento'||!Array.isArray(entries)||entries.length<1||entries.length>3||
     entries.some((p:any)=>!Number.isSafeInteger(p.id)||p.id<1||typeof p.checkin_at!=='string'||!p.checkin_at)||
     new Set(entries.map((p:any)=>p.id)).size!==entries.length||typeof b.reset_deliveries!=='boolean')return fail(400,'Selecione até três entradas de teste.');
   const snapshot=await loadSnapshot(env.DB,clean(b.backup_id));
   const table=snapshot.tables.find((t:any)=>t.original==='participants')?.copy;
   if(!table||!/^enr_backup_[0-9]{13}_[a-f0-9]{8}_\d+$/.test(table))return fail(409,'Crie um backup atual antes de reverter os testes.');
   const protections=(await env.DB.prepare("SELECT name,sql FROM sqlite_master WHERE type='trigger' AND name IN ('no_prize_undo','no_shirt_undo')").all<{name:string;sql:string}>()).results;
   if(protections.length!==2)return fail(409,'As proteções de entrega precisam ser verificadas antes da reversão.');
   const payload=JSON.stringify(entries),selected="id IN (SELECT CAST(json_extract(value,'$.id') AS INTEGER) FROM json_each(?))";
   const runId='test_reset:'+crypto.randomUUID();
   const statements=[
     env.DB.prepare('CREATE TABLE IF NOT EXISTS enr_reconcile_guards(id TEXT PRIMARY KEY,ok INTEGER NOT NULL CHECK(ok=1))'),
     env.DB.prepare(`INSERT INTO enr_reconcile_guards(id,ok) SELECT ?,CASE WHEN
       (SELECT count(*) FROM participants p JOIN json_each(?) j ON p.id=json_extract(j.value,'$.id')
        WHERE p.checkin_at IS json_extract(j.value,'$.checkin_at') AND p.arrival_at IS json_extract(j.value,'$.arrival_at')
        AND p.shirt_delivered_at IS json_extract(j.value,'$.shirt_delivered_at') AND p.prize_delivered_at IS json_extract(j.value,'$.prize_delivered_at'))=?
       AND NOT EXISTS(SELECT * FROM participants WHERE ${selected} EXCEPT SELECT * FROM "${table}" WHERE ${selected})
       AND NOT EXISTS(SELECT * FROM "${table}" WHERE ${selected} EXCEPT SELECT * FROM participants WHERE ${selected})
       THEN 1 ELSE 0 END`).bind(runId,payload,entries.length,payload,payload,payload,payload),
     env.DB.prepare('DROP TRIGGER no_prize_undo'),env.DB.prepare('DROP TRIGGER no_shirt_undo'),
     env.DB.prepare(`INSERT INTO audit_log(action,participant_id,actor_id,details)
       SELECT 'pre_event_test_reset',id,?,json_object('backup_id',?,'arrival_at',arrival_at,'checkin_at',checkin_at,
         'shirt_delivered_at',shirt_delivered_at,'prize_delivered_at',prize_delivered_at,'reset_deliveries',?) FROM participants WHERE ${selected}`).bind(u.id,b.backup_id,b.reset_deliveries?1:0,payload),
     env.DB.prepare(`UPDATE participants SET arrival_at=NULL,checkin_at=NULL,checkin_by=NULL,checkin_note=NULL,
       shirt_delivered_at=CASE WHEN ? THEN NULL ELSE shirt_delivered_at END,
       shirt_delivered_size=CASE WHEN ? THEN NULL ELSE shirt_delivered_size END,
       shirt_delivered_by=CASE WHEN ? THEN NULL ELSE shirt_delivered_by END,
       prize_delivered_at=CASE WHEN ? THEN NULL ELSE prize_delivered_at END,
       prize_delivered_by=CASE WHEN ? THEN NULL ELSE prize_delivered_by END WHERE ${selected}`).bind(...Array(5).fill(b.reset_deliveries?1:0),payload),
     ...protections.map(t=>env.DB.prepare(t.sql))
   ];
   try{await env.DB.batch(statements);}catch(error){if(d1DailyLimit(error))throw error;return fail(409,'A base mudou desde o backup. Crie outro backup e confira as fichas novamente.');}
   return reply({ok:true,reset:entries.length,deliveries_reset:b.reset_deliveries});
 }
 if(path==='/api/admin/reception-policy' && method==='POST') {
   const u=requireRole(staff,['admin']);const b=await jsonBody(request);
   if(b.onsite_shirt_price!==60 || b.shirts_available!==true || b.flow!=='shirt_gift_entry')return fail(400,'Confirme as regras do evento: camiseta disponível, R$ 60 no dia e camiseta, brinde, entrada.');
   await env.DB.batch([
     env.DB.prepare('DROP TRIGGER IF EXISTS guarded_shirt_delivery'),
     env.DB.prepare(`CREATE TRIGGER guarded_shirt_delivery BEFORE UPDATE OF shirt_delivered_at ON participants
       WHEN NEW.shirt_delivered_at IS NOT NULL AND OLD.shirt_delivered_at IS NULL
       BEGIN
         SELECT RAISE(ABORT,'inactive registration') WHERE OLD.active=0;
         SELECT RAISE(ABORT,'shirt not requested') WHERE OLD.shirt_requested=0;
         SELECT RAISE(ABORT,'shirt payment not confirmed') WHERE OLD.shirt_payment_status NOT IN ('confirmed','waived') AND CAST(REPLACE(REPLACE(REPLACE(COALESCE(OLD.payment_raw,''),'R$',''),' ',''),',','.') AS REAL)<50;
       END`),
     env.DB.prepare('DROP TRIGGER IF EXISTS guarded_prize_delivery'),
     env.DB.prepare(PRIZE_DELIVERY_GUARD_SQL),
     env.DB.prepare("INSERT INTO event_config(key,value) VALUES('onsite_shirt_price','60'),('reception_flow','shirt_gift_entry'),('reception_policy_version','1') ON CONFLICT(key) DO UPDATE SET value=excluded.value"),
     env.DB.prepare("INSERT INTO audit_log(action,actor_id,details) VALUES('reception_policy_updated',?,'onsite_shirt_price=60;shirts_available_confirmed;flow=shirt_gift_entry')").bind(u.id)
   ]);
   return reply({ok:true,onsite_shirt_price:60,flow:'shirt_gift_entry'});
 }
 if(path==='/api/admin/stock' && method==='POST') {
   const u=requireRole(staff,['admin']);const b=await jsonBody(request),size=clean(b.size),qty=Number(b.total_qty);
   if(!SIZES.includes(size)||!Number.isInteger(qty)||qty<0||qty>10000) return fail(400,'Tamanho ou quantidade inválidos.');
   const r=await env.DB.prepare("UPDATE shirt_stock SET total_qty=?,updated_at=datetime('now') WHERE size=? AND delivered_qty<=?").bind(qty,size,qty).run();
   if(!r.meta.changes) return fail(409,'A quantidade não pode ser inferior ao total já entregue.');
   await audit(env,'stock_set',u.id,null,size+':'+qty);return reply({ok:true});
 }
 if(path==='/api/admin/review' && method==='POST') {
   const u=requireRole(staff,['admin']);const b=await jsonBody(request),id=Number(b.id),note=clean(b.note,300),active=b.active===true?1:0;
   const age=b.age===''||b.age==null?null:Number(b.age);
   const dup=clean(b.duplicate_status);
   if(note.length<5||(!Number.isInteger(age) && age!==null)||(age!==null&&(age<1||age>110))||!['clear','needs_review','distinct','void'].includes(dup)) return fail(400,'Informe idade, situação de duplicidade e justificativa.');
   const locked=await env.DB.prepare("SELECT value FROM event_config WHERE key='prizes_locked'").first<{value:string}>();
   if(locked?.value==='1') return fail(409,'Premiação fechada: ranking protegido contra alterações.');
   if(dup==='void' && active) return fail(400,'Registro anulado deve ficar inativo.');
   const r=await env.DB.prepare('UPDATE participants SET age=?,active=?,duplicate_status=?,review_note=? WHERE id=?').bind(age,active,dup,note,id).run();
   if(!r.meta.changes) return fail(404,'Inscrição não encontrada.');
   await audit(env,'registration_reviewed',u.id,id,'active='+active+';dup='+dup);return reply({ok:true});
 }
 if(path==='/api/admin/close-registrations' && method==='POST') {
   const u=requireRole(staff,['admin']);const b=await jsonBody(request);
   if(b.confirm!=='ENCERRAR INSCRICOES') return fail(400,'Digite exatamente ENCERRAR INSCRICOES para confirmar.');
   if(brazilDate()<REGISTRATION_CUTOFF) return fail(409,'O encerramento de inscrições fica disponível a partir de 06/11, horário de Brasília.');
   const count=await env.DB.prepare('SELECT count(*) total FROM participants').first<{total:number}>();
   if(!count?.total) return fail(409,'Importe a planilha atualizada antes de encerrar.');
   const r=await env.DB.prepare("UPDATE event_config SET value='1' WHERE key='registration_closed' AND value='0'").run();
   if(!r.meta.changes) return fail(409,'As inscrições já foram encerradas.');
   await audit(env,'registrations_closed',u.id,null,'total='+count.total);
   return reply({ok:true,total:count.total});
 }
 if(path==='/api/admin/finalize-prizes' && method==='POST') {
   const u=requireRole(staff,['admin']);
   const configs=await env.DB.prepare("SELECT key,value FROM event_config WHERE key IN ('prizes_locked','official_roster_count')").all<{key:string;value:string}>();
   const cfg=Object.fromEntries(configs.results.map(x=>[x.key,x.value]));
   if(cfg.prizes_locked==='1') return fail(409,'A lista de brindes já está confirmada.');
   if(cfg.official_roster_count!=='171') return fail(409,'Concilie a base oficial de 171 inscrições antes de liberar os brindes.');
   // 49 yellow-marked entries plus the previously indicated 50th entry.
   // These are official rows, never the preserved physical database row numbers.
   const selected=await env.DB.prepare(`SELECT participants.id,participants.source_row,active,
     json_extract(roster.value,'$.official_source_row') AS official_source_row,
     json_extract(roster.value,'$.roster_group') AS roster_group
     FROM participants JOIN event_config roster ON roster.key='roster_member:'||participants.source_row
     WHERE json_extract(roster.value,'$.official_source_row') BETWEEN 43 AND 92
     ORDER BY official_source_row`).all<any>();
   if(selected.results.length!==50 || selected.results.some((p,i)=>!p.active || p.roster_group!=='adolescent' || p.official_source_row!==43+i))
     return fail(409,'A correspondência da lista oficial de brindes está incompleta. Nenhuma classificação foi alterada.');
   const payload=JSON.stringify(selected.results.map((p,i)=>({id:p.id,source_row:p.source_row,official_source_row:p.official_source_row,rank:i+1})));
   const deliveredOutside=await env.DB.prepare("SELECT count(*) n FROM participants WHERE prize_delivered_at IS NOT NULL AND id NOT IN (SELECT json_extract(value,'$.id') FROM json_each(?))").bind(payload).first<{n:number}>();
   if(deliveredOutside?.n) return fail(409,'Existe entrega registrada fora da lista oficial. O histórico foi preservado.');
   const stmts=[
     // A NOT NULL guard aborts the entire D1 batch if the roster changes before commit.
     env.DB.prepare(`INSERT INTO event_config(key,value)
       SELECT 'official_prizes_source',CASE WHEN
         (SELECT value FROM event_config WHERE key='prizes_locked')='0'
         AND (SELECT value FROM event_config WHERE key='official_roster_count')='171'
         AND NOT EXISTS(SELECT 1 FROM json_each(?) j WHERE NOT EXISTS(
           SELECT 1 FROM participants p JOIN event_config r ON r.key='roster_member:'||p.source_row
           WHERE p.id=json_extract(j.value,'$.id') AND p.active=1
           AND p.source_row=json_extract(j.value,'$.source_row')
           AND json_extract(r.value,'$.official_source_row')=json_extract(j.value,'$.official_source_row')
           AND json_extract(r.value,'$.roster_group')='adolescent'))
         AND NOT EXISTS(SELECT 1 FROM participants WHERE prize_delivered_at IS NOT NULL AND id NOT IN (SELECT json_extract(value,'$.id') FROM json_each(?)))
         THEN 'roster_2026' ELSE NULL END
       ON CONFLICT(key) DO UPDATE SET value=excluded.value`).bind(payload,payload),
     env.DB.prepare("INSERT INTO event_config(key,value) SELECT 'official_prize:'||json_extract(value,'$.id'),CAST(json_extract(value,'$.rank') AS TEXT) FROM json_each(?) WHERE 1 ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(payload),
     env.DB.prepare('DROP TRIGGER IF EXISTS guarded_prize_delivery'),
     env.DB.prepare(PRIZE_DELIVERY_GUARD_SQL),
     env.DB.prepare("UPDATE event_config SET value='1' WHERE key='prizes_locked'"),
     env.DB.prepare("INSERT INTO audit_log(action,actor_id,details) VALUES('prizes_finalized',?,'eligible=50;source=official_roster;registration_authorization_already_collected')").bind(u.id)
   ];
   try {await env.DB.batch(stmts);} catch(e) {if(d1DailyLimit(e))throw e;return fail(409,'A base mudou durante a confirmação. Nenhuma alteração foi aplicada; atualize o painel.');}
   return reply({ok:true,eligible:50,source:'official_roster'});
 }
 if(path==='/api/admin/users' && method==='POST') {
   const u=requireRole(staff,['admin']);const b=await jsonBody(request),username=normalize(b.username).replace(/\s+/g,'.'),role=clean(b.role);
   if(!/^[a-z0-9._-]{4,40}$/.test(username)||!['admin','reception','gifts'].includes(role)||typeof b.password!=='string'||b.password.length<12) return fail(400,'Usuário, perfil ou senha inválidos.');
   const salt=random(16),pass=await passwordHash(b.password,salt);
   await env.DB.prepare('INSERT INTO staff_users(username,password_hash,salt,role) VALUES(?,?,?,?)').bind(username,pass,salt,role).run();
   await audit(env,'staff_created',u.id,null,username+' '+role);return reply({ok:true});
 }
 if((path==='/api/admin/import' || path==='/api/admin/sync-preview') && method==='POST') {
   const u=requireRole(staff,['admin']);const preview=path.endsWith('sync-preview');
   const cfg=await env.DB.prepare("SELECT key,value FROM event_config WHERE key IN ('registration_closed','prizes_locked')").all<{key:string;value:string}>();
   const state=Object.fromEntries(cfg.results.map(x=>[x.key,x.value]));
   const recovery=state.registration_closed==='1'||state.prizes_locked==='1';
   const b=await jsonBody(request,1200000),items=b.participants;
   if(b.schema_version!==1 || b.event_date!==EVENT_DATE || !Array.isArray(items)||!items.length||items.length>200) return fail(400,'JSON ou versão incorreta. Use o conversor atualizado da planilha oficial (até 200 registros por importação).');
   const existing=await env.DB.prepare('SELECT source_row,normalized_name,contact_digits,age_raw,age,review_note,shirt_requested,shirt_size,shirt_delivered_at,checkin_at,registration_type,registration_confirmed_at FROM participants ORDER BY source_row').all<any>();
   const oldByRow=new Map<number,any>(existing.results.map(x=>[x.source_row,x]));
   const ordered=[...items].sort((a,b)=>Number(a.source_row)-Number(b.source_row));
   const sources=new Set<number>(),pairCounts=new Map<string,number>(),issues:string[]=[];
   for(const p of ordered) {
     const row=Number(p.source_row),name=normalize(p.full_name),phone=digits(p.contact),raw=clean(p.age_raw,30),hasShirt=clean(p.shirt_requested).toLowerCase()==='sim',size=clean(p.shirt_size).toUpperCase();
     if(!Number.isInteger(row)||row<2||sources.has(row)||name.length<3||!clean(p.full_name)||clean(p.full_name).length>250) return fail(400,'Posição duplicada ou cadastro sem nome.');
     if(hasShirt&&!SIZES.includes(size)) return fail(400,'Camiseta com tamanho inválido na linha '+row);
     sources.add(row);
     const pair=name+'|'+phone;if(phone.length>=9)pairCounts.set(pair,(pairCounts.get(pair)||0)+1);
     const old=oldByRow.get(row);
     if(old) {
       // The physical row is an immutable source ID. A changed identity may mean a reordered spreadsheet.
       if(old.normalized_name!==name||old.contact_digits!==phone) issues.push(`Linha ${row}: nome ou telefone alterado. Conferir manualmente para não associar histórico à pessoa errada.`);
       const oldHasShirt=!!old.shirt_requested;
       if(!recovery && old.shirt_delivered_at && (oldHasShirt!==hasShirt||old.shirt_size!==size)) issues.push(`Linha ${row}: camiseta já entregue; tamanho ou solicitação alterado.`);
       const match=raw.match(/^(\d{1,2})(?:\s*anos?)?$/i),newAge=match?Number(match[1]):null;
       if(!recovery && old.checkin_at && raw!==old.age_raw && newAge!==old.age) issues.push(`Linha ${row}: idade alterada após liberação da entrada.`);
     }
   }
   for(const old of existing.results) if(!sources.has(old.source_row)) issues.push(`Linha ${old.source_row}: desapareceu da planilha. Corrija a origem; não excluímos um cadastro com histórico.`);
   const inserts=ordered.filter(p=>!oldByRow.has(Number(p.source_row))).length;
   const revised=ordered.filter(p=>oldByRow.has(Number(p.source_row))).length;
   const provisional=ordered.filter(p=>{const raw=clean(p.age_raw,30),m=/^(\d{1,2})(?:\s*anos?)?$/i.exec(raw);return m&&Number(m[1])>=12&&Number(m[1])<=17;}).map(p=>Number(p.source_row));
   if(preview) return reply({ok:issues.length===0,total:ordered.length,new_rows:inserts,existing_rows:revised,conflicts:issues.slice(0,25),provisional_teen_count:provisional.length,provisional_50th_row:provisional[49]||null,registration_closed:state.registration_closed==='1',prizes_locked:state.prizes_locked==='1',recovery_mode:recovery});
   if(issues.length) return fail(409,'Importação interrompida sem alterar dados. '+issues.slice(0,3).join(' '));
   const stmts:D1PreparedStatement[]=[];
   const importValues:any[][]=[];
   for(const p of ordered) {
     const name=clean(p.full_name),phone=digits(p.contact),pair=normalize(name)+'|'+phone;
     const raw=clean(p.age_raw,30),match=raw.match(/^(\d{1,2})(?:\s*anos?)?$/i),numeric=match?Number(match[1]):null;
     const age=numeric && numeric>=1 && numeric<=110?numeric:null;
     const hasShirt=clean(p.shirt_requested).toLowerCase()==='sim';const size=clean(p.shirt_size).toUpperCase();const storedSize=size==='XGG'?'GG':size;
     const duplicate=phone.length>=9&&(pairCounts.get(pair)||0)>1;
     const payment=clean(p.payment_raw),confirmed=paymentAmount(payment)>=50;
     const sourceRow=Number(p.source_row);const inferredType=age!==null&&age>=18?'adult_guardian':age!==null&&age>=12?'adolescent':'other';
     importValues.push([Number(p.source_row),clean(p.registered_at,40)||null,name,normalize(name),clean(p.guardian_name)||null,clean(p.contact,60),phone,raw,age,duplicate?'needs_review':'clear',clean(p.church,180),hasShirt?1:0,hasShirt?storedSize:null,clean(p.previous_attendance,30),clean(p.media_consent).toLowerCase().includes('sim')?1:0,payment||null,confirmed?'confirmed':'unverified',inferredType,random(24)]);
   }
   // At most 5 rows per statement (95 bindings). The UPSERT never resets admission,
   // authorization, manually reviewed payment, delivery, role or immutable QR token.
   for(let i=0;i<importValues.length;i+=5) {
     const chunk=importValues.slice(i,i+5);
     const placeholders=chunk.map(()=>`(${Array(19).fill('?').join(',')})`).join(',');
     const sql=`INSERT INTO participants(source_row,registered_at,full_name,normalized_name,guardian_name,contact,contact_digits,age_raw,age,duplicate_status,church,shirt_requested,shirt_size,previous_attendance,media_consent,payment_raw,shirt_payment_status,registration_type,ticket_token) VALUES ${placeholders}
     ON CONFLICT(source_row) DO UPDATE SET
       registered_at=excluded.registered_at, guardian_name=excluded.guardian_name,
       church=excluded.church, previous_attendance=excluded.previous_attendance,media_consent=excluded.media_consent,
       age=CASE WHEN participants.age_raw=excluded.age_raw THEN participants.age ELSE excluded.age END,
       age_raw=excluded.age_raw,shirt_requested=excluded.shirt_requested,shirt_size=excluded.shirt_size,
       payment_raw=excluded.payment_raw,
       registration_type=CASE WHEN participants.registration_type IN ('team','adult_guardian','adolescent') THEN participants.registration_type ELSE excluded.registration_type END,
       shirt_payment_status=CASE WHEN participants.shirt_payment_status IN ('confirmed','waived') THEN participants.shirt_payment_status ELSE excluded.shirt_payment_status END`;
     // Recovery changes no identity, age, duplicate review, prize eligibility, check-in or delivery fields.
     const recoverySql=`INSERT INTO participants(source_row,registered_at,full_name,normalized_name,guardian_name,contact,contact_digits,age_raw,age,duplicate_status,church,shirt_requested,shirt_size,previous_attendance,media_consent,payment_raw,shirt_payment_status,registration_type,ticket_token) VALUES ${placeholders}
     ON CONFLICT(source_row) DO UPDATE SET
       guardian_name=excluded.guardian_name,
       church=excluded.church,
       previous_attendance=excluded.previous_attendance,
       media_consent=excluded.media_consent,
       shirt_requested=CASE WHEN participants.shirt_delivered_at IS NOT NULL THEN participants.shirt_requested ELSE excluded.shirt_requested END,
       shirt_size=CASE WHEN participants.shirt_delivered_at IS NOT NULL THEN participants.shirt_size ELSE excluded.shirt_size END,
       payment_raw=CASE WHEN excluded.shirt_payment_status='confirmed' THEN excluded.payment_raw ELSE participants.payment_raw END,
       shirt_payment_status=CASE WHEN participants.shirt_payment_status IN ('confirmed','waived') THEN participants.shirt_payment_status ELSE excluded.shirt_payment_status END,
       registration_type=CASE WHEN participants.registration_type='other' THEN excluded.registration_type ELSE participants.registration_type END`;
     stmts.push(env.DB.prepare(recovery?recoverySql:sql).bind(...chunk.flat()));
   }
   if(!recovery) stmts.push(env.DB.prepare(`UPDATE participants SET duplicate_status='needs_review' WHERE active=1 AND duplicate_status='clear' AND length(contact_digits)>=9 AND EXISTS(SELECT 1 FROM participants x WHERE x.id<>participants.id AND x.active=1 AND x.normalized_name=participants.normalized_name AND x.contact_digits=participants.contact_digits)`));
   stmts.push(env.DB.prepare("INSERT INTO event_config(key,value) VALUES ('latest_imported_at',datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value"));
   stmts.push(env.DB.prepare("INSERT INTO event_config(key,value) VALUES ('import_count','1') ON CONFLICT(key) DO UPDATE SET value=CAST(CAST(event_config.value AS INTEGER)+1 AS TEXT)"));
   // D1 batch is atomic: a validation failure rolls back every statement.
   await env.DB.batch(stmts);
   await audit(env,recovery?'sheet_recovered':'sheet_synchronized',u.id,null,`total=${ordered.length};new=${inserts};existing=${revised}`);
   const pending=await env.DB.prepare("SELECT count(*) total FROM participants WHERE active=1 AND (age IS NULL OR duplicate_status='needs_review')").first<{total:number}>();
   return reply({ok:true,imported:ordered.length,new_rows:inserts,existing_rows:revised,needs_review:pending?.total||0,recovery_mode:recovery});
 }
 return fail(404,'Rota não encontrada.');
}
export default {
 async fetch(request:Request,env:Env):Promise<Response> {
   try { return await route(request,env); }
   catch(err) {
     if(err instanceof HttpError) return reply({error:err.message},err.status);
     if(d1DailyLimit(err)) {
       const now=Date.now();
       const reset=new Date(now);reset.setUTCHours(24,0,0,0);
       const retryAfter=Math.max(1,Math.ceil((reset.getTime()-now)/1000));
       const when=reset.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
       const response=reply({error:`O banco atingiu o limite diário de uso. O limite será renovado em ${when} (horário de Brasília). Procure a coordenação.`,error_code:'D1_DAILY_LIMIT',retry_after:retryAfter},503);
       response.headers.set('retry-after',String(retryAfter));
       return response;
     }
     console.error('Request failed',err instanceof Error?err.message:'unexpected');
     return reply({error:'Não foi possível concluir a operação. Atualize a tela ou procure o administrador.'},500);
   }
 }
};

