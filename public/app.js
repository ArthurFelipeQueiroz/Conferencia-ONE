const root=document.getElementById('root');
const state={user:null,items:[],selected:null,stats:null,comms:null,tab:'queue',lookup:null,token:null,sessionToken:(()=>{try{return sessionStorage.getItem('enr_session')||null}catch{return null}})(),video:null,scanTimer:null,refreshing:false,receptionFilter:'waiting',receptionSearch:'',receptionTimer:null,receptionMode:false,receptionDetailOpen:false,receptionBusy:false,receptionSelecting:null,receptionRefreshPromise:null,receptionConnection:'online',receptionLastSync:null,receptionNotice:null,rosterVersion:null,serviceRetryAt:0,serviceLimitNotice:''};
state.receptionRegistrationOpen=false;state.onsitePending=null;
const H=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const badge=(s,type='blue')=>`<span class="chip ${type}">${H(s)}</span>`;
const registrationTypeLabel=(t,group)=>group==='volunteer'?'Voluntário':group==='support'?'Apoio':t==='adolescent'?'Adolescente':t==='adult_guardian'?'Adulto / responsável':t==='team'?'Equipe':'Categoria a confirmar';
const fmtDate=s=>s?new Date(s.includes('T')?s:s.replace(' ','T')+'Z').toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',dateStyle:'short',timeStyle:'short'}):'—';
async function api(path,method='GET',data){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),method==='GET'?15000:25000);
 try{
   const r=await fetch(path,{method,credentials:'same-origin',signal:controller.signal,headers:{...(data?{'content-type':'application/json'}:{}),...(state.sessionToken?{'x-jovens-session':state.sessionToken}:{})},body:data?JSON.stringify(data):undefined});
   const x=await r.json().catch(()=>{throw new Error('O serviço não respondeu corretamente. Tente atualizar a página.');});
   if(!r.ok){const error=new Error(x.error||`Erro HTTP ${r.status}`);error.status=r.status;error.code=x.error_code;if(x.error_code==='D1_DAILY_LIMIT'){state.serviceRetryAt=Date.now()+Number(x.retry_after||60)*1000;state.serviceLimitNotice=error.message;}throw error;}
   return x;
 }catch(error){
   if(controller.signal.aborted)throw new Error('A conexão demorou. Atualize a ficha para conferir antes de repetir.');
   throw error;
 }finally{clearTimeout(timer);}
}
function flash(message,kind='success',target='alert'){const el=document.getElementById(target);if(el){el.className=`message ${kind}`;el.textContent=message;el.hidden=false;}else alert(message);}
const msg=(id='alert')=>`<div id="${id}" class="message" hidden role="status"></div>`;
function headerArt(){return `<div class="hero"><img src="/evento-arte.svg" alt="Arte do encontro de jovens"><div class="glow"></div></div>`;}
function renderPublic(){
 const ticket=new URLSearchParams(location.search).get('t');
 root.innerHTML=`${headerArt()}<div class="public-grid"><section class="panel"><p class="eyebrow">Credenciamento oficial · 07/11/2026</p><h1>Chegou para o encontro?</h1><p class="muted">Localize sua inscrição e confirme a chegada. A equipe fará a conferência e liberação na recepção.</p><div id="public-body"></div>${msg('public-error')}</section><aside class="panel qr-box"><p class="eyebrow">Conferência ONE</p><h2>Um encontro. Novas histórias.</h2><p class="tagline">Que este encontro marque sua história.</p><img src="/api/public/qr.svg" alt="QR Code para abrir o credenciamento"><p class="small">Compartilhe este QR com os participantes no dia do evento. Não é necessária a instalação de aplicativo.</p><div class="actions"><a href="/confirmacao" class="btn ghost">Confirmar minha inscrição</a><a href="/equipe" class="btn ghost">Sou da equipe →</a></div></aside></div>`;
 if(ticket&&/^[a-f0-9]{48}$/.test(ticket)){state.token=ticket;showPublicTicket(ticket);}else showPublicSearch();
}
function showPublicSearch(){document.getElementById('public-body').innerHTML=`<form id="find"><label for="full-name">Nome completo da inscrição</label><input required minlength="5" autocomplete="name" id="full-name" placeholder="Seu nome completo"><label for="contact">Telefone informado no cadastro</label><input required minlength="9" inputmode="tel" autocomplete="tel" id="contact" placeholder="DDD + número cadastrado"><button class="btn wide" type="submit">Localizar minha inscrição →</button></form><p class="small">Se estiver sem celular ou não souber o telefone informado, procure a recepção. O voluntário poderá localizar sua inscrição pelo nome e concluir o credenciamento.</p>`;
 document.getElementById('find').onsubmit=async e=>{e.preventDefault();const btn=e.submitter||document.querySelector('#find button');if(btn){btn.disabled=true;btn.textContent='Localizando…';}try{const data=await api('/api/public/lookup','POST',{name:document.getElementById('full-name').value,contact:document.getElementById('contact').value});state.token=data.ticket;showPublicTicket(data.ticket,data);}catch(err){if(btn){btn.disabled=false;btn.textContent='Localizar minha inscrição →';}flash(err.message,'error','public-error');}};
}
async function showPublicTicket(token,cached){try{const d=cached||await api(`/api/public/ticket?t=${encodeURIComponent(token)}`);document.getElementById('public-body').innerHTML=`<div class="notice good"><div class="success-mark">✓</div><h2>${H(d.name)}</h2><p>${d.arrived?'Chegada registrada no credenciamento. Aguarde a conferência da equipe.':'Inscrição localizada. Confirme sua chegada abaixo.'}</p>${badge(d.checked_in?'Entrada liberada':d.arrived?'Chegada confirmada':'Aguardando confirmação',d.checked_in?'green':'orange')}</div>${d.arrived?'<p class="muted">Chegada já registrada. Apresente-se à equipe com um documento ou informação de identificação, se solicitado.</p>':'<button id="arrive" class="btn wide">Confirmar minha chegada →</button>'}<p class="small">A confirmação de chegada não substitui a liberação feita pelo administrador.</p>`;const b=document.getElementById('arrive');if(b)b.onclick=async()=>{try{b.disabled=true;const confirmation=await api('/api/public/arrive','POST',{ticket:token});await showPublicTicket(token,confirmation);}catch(err){b.disabled=false;flash(err.message,'error','public-error');}};}catch(err){flash(err.message,'error','public-error');showPublicSearch();}}
function renderRegistrationConfirmation(){
 root.innerHTML=`${headerArt()}<div class="public-grid"><section class="panel"><p class="eyebrow">Antes do evento</p><h1>Confirme sua inscrição</h1><p class="muted">Esta consulta apenas confirma que seu cadastro está na lista da Conferência ONE. Ela <strong>não registra chegada</strong> e não libera entrada.</p><div id="confirmation-body"><form id="confirmation-form"><label for="confirmation-name">Nome completo de quem participará</label><input required minlength="5" autocomplete="name" id="confirmation-name" placeholder="Nome completo do participante"><label for="confirmation-contact">Telefone usado na inscrição</label><input required minlength="9" inputmode="tel" autocomplete="tel" id="confirmation-contact" placeholder="DDD + número informado no formulário"><button class="btn wide" type="submit">Confirmar minha inscrição →</button></form><p class="small">Se o responsável fez a inscrição de um adolescente, informe o nome do adolescente e o telefone usado pelo responsável. Quem não tiver celular poderá ser localizado pelo nome na recepção no dia.</p></div>${msg('confirmation-alert')}</section><aside class="panel"><p class="eyebrow">Como funciona</p><h2>Sem código individual</h2><p class="muted">Não é necessário receber um QR pessoal por mensagem. O QR do credenciamento será disponibilizado na entrada do evento. A equipe também poderá buscar a inscrição diretamente pelo nome.</p><div class="notice">No dia 07/11, use o QR da mesa para registrar a chegada. Esta página serve somente para conferir antecipadamente que a inscrição está na base.</div><a class="btn ghost wide" href="/checkin">Ir para o credenciamento do dia</a></aside></div>`;
 document.getElementById('confirmation-form').onsubmit=async e=>{e.preventDefault();const btn=e.submitter||document.querySelector('#confirmation-form button');if(btn)btn.disabled=true;try{const d=await api('/api/public/confirm-registration','POST',{name:document.getElementById('confirmation-name').value,contact:document.getElementById('confirmation-contact').value});document.getElementById('confirmation-body').innerHTML=`<div class="notice good"><div class="success-mark">✓</div><h2>Inscrição confirmada</h2><p><strong>${H(d.name)}</strong></p><p>${badge(d.registration_label,'green')}</p><p class="muted">Seu cadastro está na lista da Conferência ONE para 07/11/2026.</p>${d.shirt_requested?`<p><strong>👕 Camiseta:</strong> solicitada · tamanho ${H(d.shirt_size||'a confirmar')}</p>`:'<p><strong>👕 Camiseta:</strong> não solicitada na inscrição.</p>'}<div class="divider"></div><p class="small">Isto não é o check-in. No dia, escaneie o QR disponível no credenciamento ou informe seu nome à equipe.</p><a class="btn ghost wide" href="/confirmacao">Consultar outra inscrição</a></div>`;flash('Inscrição localizada na base.','success','confirmation-alert');}catch(err){if(btn)btn.disabled=false;flash(err.message,'error','confirmation-alert');}};
}
async function renderAuth(){const cfg=await api('/api/setup-status');const bootstrapBlocked=!cfg.initialized&&!cfg.bootstrap_ready;root.innerHTML=`${headerArt()}<div class="public-grid"><section class="panel"><p class="eyebrow">Área restrita</p><h1>${cfg.initialized?'Acesso à equipe':'Configuração inicial'}</h1><p class="muted">Credenciamento, brindes e camisetas.</p>${bootstrapBlocked?'<div class="notice bad" role="alert"><strong>Instalação aguardando segredo de segurança.</strong><p>Na Cloudflare, abra conferencia-one-checkin → Settings → Runtime variables and secrets → Add variable. Escolha Secret, use o nome BOOTSTRAP_TOKEN e um valor aleatório com pelo menos 32 caracteres. Salve e atualize esta página. Não compartilhe o valor em mensagens.</p></div>':''}<form id="auth-form">${!cfg.initialized?'<label for="token">Token de instalação do Cloudflare</label><input id="token" required type="password" autocomplete="off">':''}<label for="username">Usuário</label><input id="username" required autocomplete="username"><label for="password">Senha</label><input id="password" required type="password" minlength="12" autocomplete="${cfg.initialized?'current-password':'new-password'}"><button class="btn wide" type="submit" ${bootstrapBlocked?'disabled title="Configure BOOTSTRAP_TOKEN na Cloudflare antes de continuar"':''}>${cfg.initialized?'Entrar':'Criar administrador'}</button></form>${msg()}</section><aside class="panel"><h2>Informações da equipe</h2><p class="muted">Os dados pessoais são acessíveis somente após login. Cada entrega e liberação é registrada com operador e horário.</p><div class="notice">A autorização de participação já foi recolhida na inscrição. Confira a identidade e registre a entrada e cada entrega.</div></aside></div>`;
 document.getElementById('auth-form').onsubmit=async e=>{e.preventDefault();const btn=e.submitter||document.querySelector('#auth-form button');if(btn)btn.disabled=true;try{const username=document.getElementById('username').value,password=document.getElementById('password').value;if(!cfg.initialized){await api('/api/initialize','POST',{username,password,token:document.getElementById('token').value});await renderAuth();flash('Administrador criado. Faça login e remova o segredo BOOTSTRAP_TOKEN do Cloudflare.');}else{const x=await api('/api/session','POST',{username,password});state.user=x.user;const verify=await api('/api/session');if(!verify.user && x.sessionToken){state.sessionToken=x.sessionToken;try{sessionStorage.setItem('enr_session',x.sessionToken)}catch{}}else{state.sessionToken=null;try{sessionStorage.removeItem('enr_session')}catch{}}if(location.pathname==='/admin'&&state.user?.role!=='admin'){location.href='/equipe';return;}state.tab=location.pathname==='/admin'?'admin':'queue';await renderStaff();}}catch(err){if(btn)btn.disabled=false;flash(err.message,'error');}};
}
const can=(...roles)=>state.user && roles.includes(state.user.role);
async function loadStaff(onlyIfChanged=false){const updates=await api('/api/staff/updates');if(onlyIfChanged&&state.rosterVersion!==null&&updates.version===state.rosterVersion)return false;const [st,list]=await Promise.all([api('/api/staff/stats'),api('/api/staff/list')]);state.stats=st;state.items=list.items;state.rosterVersion=Number.isSafeInteger(updates.version)?updates.version:null;state.serviceRetryAt=0;state.serviceLimitNotice='';state.receptionLastSync=Date.now();state.receptionConnection='online';let selected=state.items.find(p=>p.id===state.selected?.id);if(!selected){const next=(st.recent_arrivals||[]).find(p=>!p.checkin_at);selected=state.items.find(p=>p.id===next?.id)||null;}state.selected=selected||null;return true;}
async function renderStaff(){await loadStaff();drawStaff();}
function drawStaff(){if(state.user?.role==='reception'||state.receptionMode){drawReception();return;}if(state.receptionTimer){clearInterval(state.receptionTimer);state.receptionTimer=null;}const pending=Number(state.stats?.counts?.arrived||0)-Number(state.stats?.counts?.checked_in||0);root.innerHTML=`<section class="staff-top"><div><p class="eyebrow">Central de operação · ${H(state.user.role)}</p><h1>${can('admin')?'ONE · Administração':'ONE · Recepção'}</h1><p class="muted">Operador: ${H(state.user.username)} · 7 de novembro de 2026</p></div><div class="actions">${can('admin')?'<button id="open-reception" class="btn ok">Modo recepção →</button>':''}<a href="/qr-impressao" class="btn ghost" target="_blank" rel="noopener">🖨 Imprimir QR oficial</a><button id="logout" class="btn ghost">Sair</button></div></section><div class="nav"><button data-tab="queue" class="${state.tab==='queue'?'active':''}">Credenciamento <span id="queue-pending">(${Math.max(0,pending)} na recepção)</span></button>${can('admin')?'<button data-tab="comms" class="'+(state.tab==='comms'?'active':'')+'">Comunicação</button><button data-tab="admin" class="'+(state.tab==='admin'?'active':'')+'">Administração</button>':''}</div><section id="dashboard"></section>${msg()}`;
 const receptionMode=document.getElementById('open-reception');if(receptionMode)receptionMode.onclick=()=>{state.receptionMode=true;state.receptionDetailOpen=false;drawStaff();};document.getElementById('logout').onclick=async()=>{await api('/api/session','DELETE');state.user=null;state.sessionToken=null;try{sessionStorage.removeItem('enr_session')}catch{}location.href='/equipe';};document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab;drawStaff();});drawMetrics();
 if(state.tab==='queue')drawQueue();if(state.tab==='stock')drawStock();if(state.tab==='comms')drawCommunications();if(state.tab==='admin')drawAdmin();
}
function drawMetrics(){const c=state.stats?.counts||{};let el=document.getElementById('dashboard');const pending=Math.max(0,Number(c.arrived||0)-Number(c.checked_in||0));el.innerHTML=`<div class="metrics">${[['Inscritos',c.total],['Chegadas',c.arrived],['Entradas',c.checked_in],['Prêmios entregues',c.prizes],['Camisetas entregues',c.shirts]].map(([k,v])=>`<div class="metric"><strong>${Number(v||0)}</strong><span>${k}</span></div>`).join('')}</div><div class="notice ${pending?'good':''}" id="arrival-banner" role="status"><strong>${pending} chegada(s) aguardando liberação pela equipe.</strong> A confirmação no celular registra a chegada, mas a entrada só é liberada na aba Credenciamento.</div>`;}
function labelStatus(p){if(!p.active)return badge('Inativo','red');if(p.checkin_at)return badge('Entrada liberada','green');if(p.arrival_at)return badge('Na recepção','orange');return badge('Aguardando','blue');}
function drawQueue(){const container=document.getElementById('dashboard');container.insertAdjacentHTML('beforeend',`<div class="layout"><section class="panel"><h2>Participantes</h2><p class="muted">As chegadas recentes aparecem primeiro. Quem estiver sem celular apenas informa o nome e a equipe localiza a inscrição aqui.</p><input id="search" placeholder="Buscar por nome..." autocomplete="off"><div class="actions"><button id="refresh" class="btn ghost">↻ Atualizar</button></div><div class="divider"></div><div id="recent-arrivals" aria-live="polite"></div><div class="divider"></div><div class="list" id="participant-list"></div></section><section id="participant-detail" class="panel"><h2>Selecione uma inscrição</h2><p class="muted">Clique em um nome para conferir a ficha.</p></section></div>`);
 document.getElementById('search').oninput=()=>drawList();document.getElementById('refresh').onclick=async()=>{await loadStaff();drawStaff();};drawRecentArrivals();drawList();drawDetail();}
function drawRecentArrivals(){
 const el=document.getElementById('recent-arrivals');if(!el)return;
 const recent=(state.stats?.recent_arrivals||[]).slice(0,6);
 el.innerHTML=`<p class="eyebrow">Últimas chegadas registradas no banco</p>${recent.length?recent.map(p=>`<button class="participant" data-recent-id="${p.id}" type="button"><div class="participant-head"><span>${H(p.full_name)}</span>${badge(p.checkin_at?'Entrada liberada':'Aguardando recepção',p.checkin_at?'green':'orange')}</div><small>Chegada: ${H(fmtDate(p.arrival_at))}</small></button>`).join(''):'<p class="small">Ainda não há chegadas registradas.</p>'}`;
 el.querySelectorAll('[data-recent-id]').forEach(b=>b.onclick=async()=>{
   try{
     const id=Number(b.dataset.recentId);
     const exact=await api('/api/staff/participant?id='+id);
     const idx=state.items.findIndex(p=>p.id===id);
     if(idx>=0)state.items[idx]=exact.item;else state.items.unshift(exact.item);
     state.selected=exact.item;drawList();drawDetail();
   }catch(e){flash(e.message,'error');}
 });
}
function provisionalPrizeRank(p){const row=Number(p?.official_source_row);return p?.active&&row>=43&&row<=92?row-42:0;}
function credentialExtras(p){
 const parts=[];
 if(p.shirt_requested)parts.push('👕 '+H(p.shirt_size||'?')+(receptionPaid(p)?' · paga':' · receber R$ 60'));
 const rank=provisionalPrizeRank(p);
 if(state.stats?.prizes_locked){if(p.prize_eligible)parts.push('🎁 prêmio'+(p.prize_rank?' #'+p.prize_rank:''));}
 else if(rank&&rank<=50)parts.push('🎁 prévia #'+rank);
 return parts.length?parts.join(' · '):'Sem entrega adicional registrada';
}
function drawList(){const q=String(document.getElementById('search')?.value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const hits=state.items.filter(p=>p.full_name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q));const el=document.getElementById('participant-list');if(!el)return;el.innerHTML=hits.map(p=>`<button class="participant ${state.selected?.id===p.id?'selected':''}" data-id="${p.id}"><div class="participant-head"><span>${H(p.full_name)}</span>${labelStatus(p)}</div><small>Planilha: linha ${p.source_row}</small><small class="credential-extras">${credentialExtras(p)}</small></button>`).join('')||'<p class="muted">Nenhuma inscrição encontrada.</p>';el.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{state.selected=state.items.find(p=>p.id===Number(b.dataset.id));drawList();drawDetail();});}
function row(label,value){return `<div class="detail-row"><span>${H(label)}</span><strong>${value}</strong></div>`;}
function drawDetail(){const p=state.selected,el=document.getElementById('participant-detail');if(!p||!el)return;
 const provisional=provisionalPrizeRank(p);
 const shirt=p.shirt_requested?`${badge('Solicitou '+p.shirt_size,'orange')} ${badge(receptionPaid(p)?'Paga':'Receber R$ 60',receptionPaid(p)?'green':'red')}`:badge('Não solicitada');
 const registrationProfile=registrationTypeLabel(p.registration_type,p.roster_group);
 const shirtReady=p.shirt_requested&&receptionPaid(p)&&!p.shirt_delivered_at;
 const prizeReady=!!(state.stats.prizes_locked&&p.prize_eligible&&!p.prize_delivered_at);
 const handoff=`<div class="notice good"><p class="eyebrow">Resumo da liberação</p><strong>Entrada: ${p.checkin_at?'LIBERADA':'aguardando liberação'}</strong><br>${p.shirt_requested?'👕 Camiseta '+H(p.shirt_size||'?')+': '+(p.shirt_delivered_at?'já entregue':shirtReady?'LIBERAR ITEM':!receptionPaid(p)?'RECEBER R$ 60':'PAGA'):'👕 Camiseta: não solicitada'}<br>${state.stats.prizes_locked?(p.prize_eligible?'🎁 Prêmio: '+(p.prize_delivered_at?'já entregue':prizeReady?'LIBERAR ITEM':'aguardando entrada'):'🎁 Prêmio: não contemplado'):(provisional&&provisional<=50?'🎁 Prêmio: PRÉVIA #'+provisional+' — lista ainda não fechada':'🎁 Prêmio: lista ainda não fechada')}</div>`;
 el.innerHTML=`<div class="detail-top"><div><p class="eyebrow">Ficha #${p.id} · linha ${p.source_row}</p><h2 class="detail-title">${H(p.full_name)}</h2></div>${labelStatus(p)}</div>${msg('detail-alert')}${handoff}${row('Perfil da inscrição',badge(registrationProfile,p.registration_type==='other'?'orange':'blue'))}${row('Confirmação pré-evento',p.registration_confirmed_at?badge('Confirmada · '+fmtDate(p.registration_confirmed_at),'green'):badge('Ainda não consultada','orange'))}${row('Responsável',H(p.guardian_name||'Não informado'))}${row('Contato',H(p.contact||'Não informado'))}${row('Igreja',H(p.church||'—'))}${row('Autorização de imagem',badge(p.media_consent?'Autorizada':'Sem autorização',p.media_consent?'green':'orange'))}${row('Premiação',!state.stats.prizes_locked?(provisional?badge('PRÉVIA: posição '+provisional+(provisional<=50?' (entre os 50)':''),'orange'):badge('Lista ainda não fechada','orange')):p.prize_eligible?badge('Contemplado · posição '+p.prize_rank,'green'):badge('Não contemplado'))}${row('Entrega do prêmio',p.prize_delivered_at?badge('Entregue · '+fmtDate(p.prize_delivered_at),'green'):badge('Pendente','orange'))}${row('Camiseta',shirt)}${row('Camiseta entregue',p.shirt_delivered_at?badge('Sim · '+p.shirt_delivered_size,'green'):badge('Ainda não','orange'))}${row('Chegada',fmtDate(p.arrival_at))}${row('Check-in',fmtDate(p.checkin_at))}${p.duplicate_status==='needs_review'||!p.active?`<div class="notice bad">Cadastro em revisão: ${H(p.duplicate_status)}. ${p.active?'':'Registro marcado como inativo.'}</div>`:''}
 ${can('admin','reception','gifts')?`<div class="divider"></div><h3>Entregas</h3><div class="actions"><button id="do-prize" class="btn" ${!p.prize_eligible||!!p.prize_delivered_at||!state.stats.prizes_locked?'disabled':''}>🎁 ${p.prize_delivered_at?'Prêmio entregue':'Liberar brinde'}</button></div><label>Tamanho para entrega</label><select id="delivery-size" ${!p.shirt_requested?'disabled':''}>${['PP','P','M','G','GG','XGG'].map(s=>`<option ${p.shirt_size===s?'selected':''}>${s}</option>`).join('')}</select><button id="do-shirt" class="btn ghost wide" ${!shirtReady?'disabled':''}>${p.shirt_delivered_at?'✓ Camiseta entregue':'Liberar camiseta'}</button>`:''}
 ${can('admin','reception')?`<div class="divider"></div><h3>Entrada</h3><button id="do-checkin" class="btn ok wide" ${p.checkin_at||!p.active?'disabled':''}>${p.checkin_at?'✓ Entrada já liberada':'✓ Liberar entrada'}</button>`:''}
 ${can('admin')?`<div class="divider"></div><h3>Revisões administrativas</h3><label>Perfil da inscrição</label><select id="registration-type"><option value="adolescent" ${p.registration_type==='adolescent'?'selected':''}>Adolescente</option><option value="adult_guardian" ${p.registration_type==='adult_guardian'?'selected':''}>Adulto / responsável</option><option value="team" ${p.registration_type==='team'?'selected':''}>Equipe</option><option value="other" ${p.registration_type==='other'?'selected':''}>Categoria a confirmar</option></select><button id="save-registration-type" class="btn ghost wide">Salvar perfil da inscrição</button><label>Pagamento da camiseta</label><select id="payment">${[['unverified','Não verificado'],['confirmed','Confirmado'],['waived','Dispensado pela coordenação']].map(([v,n])=>`<option value="${v}" ${p.shirt_payment_status===v?'selected':''}>${n}</option>`).join('')}</select><button id="save-payment" class="btn ghost wide" ${p.shirt_delivered_at?'disabled':''}>Salvar pagamento</button><label>Correção de idade (antes de fechar os 50)</label><input id="fix-age" inputmode="numeric" type="number" min="1" max="110" value="${p.age??''}" ${state.stats.prizes_locked?'disabled':''}><label>Duplicidade / integridade</label><select id="duplicate-status" ${state.stats.prizes_locked?'disabled':''}>${[['clear','Sem duplicidade'],['needs_review','Aguardando revisão'],['distinct','Inscrição distinta confirmada'],['void','Registro anulado']].map(([v,n])=>`<option value="${v}" ${p.duplicate_status===v?'selected':''}>${n}</option>`).join('')}</select><label>Justificativa da revisão</label><textarea id="review-note" ${state.stats.prizes_locked?'disabled':''}>${H(p.review_note||'')}</textarea><label><input id="active" type="checkbox" style="width:auto;min-height:auto" ${p.active?'checked':''} ${state.stats.prizes_locked?'disabled':''}> Manter inscrição ativa</label><button id="save-review" class="btn ghost wide" ${state.stats.prizes_locked?'disabled':''}>Salvar revisão do cadastro</button>`:''}`;
 const run=(id,path,body,confirmText)=>{const btn=el.querySelector('#'+id);if(!btn)return;btn.onclick=async()=>{if(confirmText&&!confirm(confirmText))return;btn.disabled=true;try{await api(path,'POST',typeof body==='function'?body():body);await loadStaff();drawStaff();flash('Operação registrada com sucesso.','success','detail-alert');}catch(e){btn.disabled=false;flash(e.message,'error','detail-alert');}};};
 const checkinBtn=el.querySelector('#do-checkin');
 if(checkinBtn&&!p.checkin_at)checkinBtn.onclick=async()=>{if(!confirm(`Finalizar e liberar a entrada de ${p.full_name}?`))return;checkinBtn.disabled=true;try{await api('/api/staff/checkin','POST',{id:p.id});await loadStaff();drawStaff();flash('Entrada liberada.','success','detail-alert');}catch(e){checkinBtn.disabled=false;flash(e.message,'error','detail-alert');}};
 run('do-prize','/api/staff/prize',{id:p.id},`Confirmar entrega DEFINITIVA do prêmio a ${p.full_name}?`);
 run('do-shirt','/api/staff/shirt',()=>({id:p.id,size:el.querySelector('#delivery-size').value}),`Confirmar entrega DEFINITIVA da camiseta a ${p.full_name}?`);
 run('save-registration-type','/api/admin/registration-type',()=>({id:p.id,registration_type:el.querySelector('#registration-type').value}));
 run('save-payment','/api/admin/payment',()=>({id:p.id,status:el.querySelector('#payment').value}));
 run('save-review','/api/admin/review',()=>({id:p.id,age:el.querySelector('#fix-age').value,duplicate_status:el.querySelector('#duplicate-status').value,active:el.querySelector('#active').checked,note:el.querySelector('#review-note').value}));
}
async function scanStart(){if(!('BarcodeDetector' in window)){flash('Leitor de QR não disponível neste navegador. Use a busca por nome ou um dispositivo compatível.','error');return;}const slot=document.getElementById('scanbox');try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});state.video=stream;slot.innerHTML=`<video id="video" class="camera" autoplay playsinline muted></video><button id="scan-stop" class="btn ghost">Fechar câmera</button>`;const video=document.getElementById('video');video.srcObject=stream;await video.play();document.getElementById('scan-stop').onclick=scanStop;const detector=new BarcodeDetector({formats:['qr_code']});state.scanTimer=setInterval(async()=>{try{const data=await detector.detect(video);if(!data.length)return;const u=new URL(data[0].rawValue,location.origin);if(u.origin!==location.origin)throw new Error('QR de outro endereço.');const t=u.searchParams.get('t');if(!t)throw new Error('Este QR abre a página pública. Localize o participante pelo nome.');const found=await api('/api/staff/ticket?t='+encodeURIComponent(t));scanStop();state.selected=state.items.find(x=>x.id===found.item.id)||found.item;drawList();drawDetail();}catch(e){if(!String(e.message).includes('NotFound')){scanStop();flash(e.message,'error');}}},750);}catch(e){scanStop();flash('Não foi possível acessar a câmera. Use HTTPS ou a busca manual.','error');}}
function scanStop(){if(state.scanTimer){clearInterval(state.scanTimer);state.scanTimer=null;}if(state.video){state.video.getTracks().forEach(t=>t.stop());state.video=null;}const slot=document.getElementById('scanbox');if(slot)slot.innerHTML='';}

function receptionMeta(p){
 // The reconciliation preserves database IDs and rows; the official group is authoritative.
 const gift=!!p.prize_eligible,rank=p.prize_rank||null;
 if(p.roster_group==='volunteer')return {key:'volunteer',label:'VOLUNTÁRIO',gift,rank};
 if(p.roster_group==='support')return {key:'support',label:'APOIO',gift,rank};
 if(p.roster_group==='adolescent')return {key:'teen',label:'ADOLESCENTE / JOVEM',gift,rank};
 if(p.roster_group==='adult_guardian'||p.registration_type==='adult_guardian')return {key:'adult',label:'ADULTO / RESPONSÁVEL',gift,rank};
 const row=Number(p.source_row);
 if(row>=2&&row<=33)return {key:'volunteer',label:'VOLUNTÁRIO',icon:'🔵',gift:false,rank:null};
 if((row>=34&&row<=42)||[166,167,171].includes(row))return {key:'support',label:'APOIO',icon:'🟢',gift:false,rank:null};
 if(p.registration_type==='team')return {key:'support',label:'APOIO',icon:'🟢',gift:false,rank:null};
 if(row>=43&&row<=91)return {key:'gift',label:'MARCAÇÃO AMARELA',icon:'🟡',gift:!!p.prize_eligible,rank:p.prize_rank||row-42};
 if(row===92)return {key:'gift',label:'50ª INDICADA · CONFERIR',icon:'🟡',gift:!!p.prize_eligible,rank:p.prize_rank||50};
 return {key:'teen',label:'ADOLESCENTE',icon:'⚪',gift:!!p.prize_eligible,rank:p.prize_rank||null};
}
function receptionPaid(p){const raw=Number(String(p.payment_raw??'').replace(/[^0-9,.-]/g,'').replace(',','.'))||0;return !p.shirt_requested||raw>=50||p.shirt_payment_status==='confirmed'||p.shirt_payment_status==='waived'||!!p.reception_payment_received_at;}
function receptionShirtDone(p){return !!(p.shirt_delivered_at||p.reception_shirt_delivered_at);}
function receptionGiftDone(p){return !!(p.prize_delivered_at||p.reception_gift_delivered_at);}
function receptionGroupChip(p){const m=receptionMeta(p);return badge(m.label,m.key==='support'?'green':m.key==='gift'?'orange':m.key==='volunteer'?'blue':'blue');}
function receptionShirtText(p){
 if(!p.shirt_requested)return '<div class="reception-item neutral"><strong>👕 SEM CAMISETA</strong><span>Nenhuma retirada necessária.</span></div>';
 const size=H(p.shirt_size||'?');
 if(receptionShirtDone(p))return '<div class="reception-item done"><strong>👕 CAMISETA '+size+' · ENTREGUE</strong><span>Entrega já registrada.</span></div>';
 if(!receptionPaid(p))return '<div class="reception-item pending"><strong>👕 CAMISETA '+size+' · RECEBER R$ 60</strong><span>Pagamento pendente no credenciamento.</span></div>';
 return '<div class="reception-item ready"><strong>👕 CAMISETA '+size+' · PAGA</strong></div>';
}
function receptionGiftText(p){
 const m=receptionMeta(p);
 if(!m.gift&&m.key==='gift')return '<div class="reception-item pending"><strong>🎁 MARCAÇÃO DE BRINDE</strong><span>Indicação na planilha: conferir liberação administrativa antes de entregar.</span></div>';
 if(!m.gift)return '<div class="reception-item neutral"><strong>🎁 '+(state.stats?.prizes_locked?'SEM BRINDE':'BRINDE · AGUARDANDO LISTA')+'</strong><span>'+(state.stats?.prizes_locked?'Sem contemplação confirmada no banco.':'A coordenação ainda precisa confirmar a lista de contemplados.')+'</span></div>';
 if(receptionGiftDone(p))return '<div class="reception-item done"><strong>🎁 BRINDE #'+m.rank+' · ENTREGUE</strong><span>Entrega já registrada.</span></div>';
 return '<div class="reception-item ready gift"><strong>🎁 '+(state.stats?.prizes_locked?'BRINDE LIBERADO':'BRINDE · AGUARDANDO LISTA')+(m.rank?' #'+m.rank:'')+'</strong><span>'+(state.stats?.prizes_locked?'Participante contemplado.':'Aguarde a confirmação da lista pela coordenação.')+'</span></div>';
}
function receptionRows(){return state.items.filter(p=>!!p.active);}
function receptionSummary(){
 const rows=receptionRows();
 return {waiting:rows.filter(p=>p.arrival_at&&!p.checkin_at).length,done:rows.filter(p=>p.checkin_at).length,total:rows.length};
}
function syncReceptionView(){
 const shell=document.getElementById('reception-shell');
 if(shell)shell.classList.toggle('is-detail-open',!!state.receptionDetailOpen);
 if(shell)shell.classList.toggle('is-registering',!!state.receptionRegistrationOpen);
}
function updateReceptionConnection(){
 const label=document.getElementById('reception-connection-label');
 const timestamp=document.getElementById('reception-sync-time');
 const warning=document.getElementById('reception-connection-warning');
 const refresh=document.getElementById('reception-refresh');
 const offline=state.receptionConnection==='offline';
 if(label){label.textContent=offline?'Conexão interrompida':'Conectado';label.className='reception-live '+(offline?'is-offline':'');}
 if(timestamp)timestamp.textContent=state.receptionLastSync?'Última atualização às '+new Date(state.receptionLastSync).toLocaleTimeString('pt-BR',{timeZone:'America/Sao_Paulo',hour:'2-digit',minute:'2-digit',second:'2-digit'}):'';
 if(warning){warning.hidden=!offline;warning.textContent=state.serviceLimitNotice||'Não foi possível atualizar a lista. As informações abaixo são da última conexão. Toque em Atualizar antes de registrar uma operação.';}
 if(refresh){refresh.disabled=state.receptionBusy||!!state.receptionRefreshPromise;refresh.textContent=state.receptionRefreshPromise?'Atualizando…':'↻ Atualizar';}
 updateReceptionRegistration();
}
function receptionRegistrationForm(){
 if(!can('admin','reception'))return '';
 return `<section id="reception-registration-panel" class="panel reception-registration" aria-labelledby="onsite-title" hidden><p class="eyebrow">Inscrição presencial</p><h2 id="onsite-title">Chegou sem inscrição?</h2><p class="muted">Cadastre a pessoa, confira os itens da ficha e depois libere a entrada.</p><form id="reception-registration-form"><div class="onsite-fields"><div class="onsite-full"><label for="onsite-name">Nome completo *</label><input id="onsite-name" name="full_name" required minlength="3" maxlength="150" autocomplete="off"></div><div><label for="onsite-profile">Perfil</label><select id="onsite-profile" name="profile"><option value="adolescent">Adolescente / jovem</option><option value="adult_guardian">Adulto / responsável</option><option value="volunteer">Voluntário</option><option value="support">Apoio</option></select></div><div><label for="onsite-contact">Telefone com DDD · opcional</label><input id="onsite-contact" name="contact" type="tel" inputmode="tel" maxlength="40" autocomplete="off" placeholder="Pode cadastrar sem telefone"></div><div><label for="onsite-church">Igreja · opcional</label><input id="onsite-church" name="church" maxlength="150" autocomplete="off"></div><div><label for="onsite-guardian">Responsável · opcional</label><input id="onsite-guardian" name="guardian_name" maxlength="150" autocomplete="off"></div><div><label for="onsite-shirt">Deseja camiseta?</label><select id="onsite-shirt" name="shirt_requested"><option value="0">Não</option><option value="1">Sim · receber R$ 60</option></select></div><div id="onsite-size-field" hidden><label for="onsite-size">Tamanho da camiseta *</label><select id="onsite-size" name="shirt_size"><option value="">Selecione</option>${['PP','P','M','G','GG','XGG'].map(size=>'<option>'+size+'</option>').join('')}</select></div></div><p class="small onsite-note">Camiseta: R$ 60, com pagamento e entrega registrados na ficha. Novas inscrições não entram na lista dos 50 brindes.</p>${msg('onsite-alert')}<div class="actions onsite-actions"><button id="onsite-submit" type="submit" class="btn">Cadastrar e abrir ficha →</button><button id="onsite-cancel" type="button" class="btn ghost">Cancelar</button><button id="onsite-find-existing" type="button" class="btn ghost" hidden>Buscar cadastro existente</button></div></form></section>`;
}
function updateReceptionRegistration(){
 const panel=document.getElementById('reception-registration-panel');if(!panel)return;
 panel.hidden=!state.receptionRegistrationOpen;
 const toggle=document.getElementById('reception-register');if(toggle){toggle.disabled=state.receptionBusy||state.receptionConnection==='offline';toggle.setAttribute('aria-expanded',String(state.receptionRegistrationOpen));}
 const form=document.getElementById('reception-registration-form');
 form?.querySelectorAll('input,select').forEach(el=>{el.disabled=state.receptionBusy||!!state.onsitePending;});
 const submit=document.getElementById('onsite-submit');if(submit){submit.disabled=state.receptionBusy||state.receptionConnection==='offline';submit.textContent=state.receptionBusy?'Cadastrando… aguarde':state.onsitePending?'Conferir e concluir cadastro →':'Cadastrar e abrir ficha →';}
 const cancel=document.getElementById('onsite-cancel');if(cancel)cancel.disabled=state.receptionBusy;
 const find=document.getElementById('onsite-find-existing');if(find)find.disabled=state.receptionBusy;
 syncReceptionView();
}
function bindReceptionRegistration(){
 const toggle=document.getElementById('reception-register');if(!toggle)return;
 if(state.onsitePending){for(const [name,value] of Object.entries(state.onsitePending)){const field=document.getElementById('reception-registration-form').elements.namedItem(name);if(field)field.value=name==='shirt_requested'?(value?'1':'0'):(value??'');}document.getElementById('onsite-size-field').hidden=!state.onsitePending.shirt_requested;document.getElementById('onsite-size').required=state.onsitePending.shirt_requested;}
 toggle.onclick=()=>{if(state.receptionBusy||state.receptionConnection==='offline')return;state.receptionRegistrationOpen=!state.receptionRegistrationOpen;updateReceptionRegistration();if(state.receptionRegistrationOpen){if(!state.onsitePending)document.getElementById('onsite-name').focus({preventScroll:true});document.getElementById('reception-registration-panel').scrollIntoView({block:'start'});}};
 document.getElementById('onsite-cancel').onclick=()=>{if(state.receptionBusy)return;state.receptionRegistrationOpen=false;updateReceptionRegistration();toggle.focus({preventScroll:true});};
 document.getElementById('onsite-shirt').onchange=e=>{const requested=e.target.value==='1';document.getElementById('onsite-size-field').hidden=!requested;document.getElementById('onsite-size').required=requested;};
 document.getElementById('onsite-find-existing').onclick=()=>{if(state.receptionBusy)return;state.receptionSearch=document.getElementById('onsite-name').value;document.getElementById('reception-search').value=state.receptionSearch;document.getElementById('reception-clear-search').hidden=!state.receptionSearch;state.receptionRegistrationOpen=false;state.receptionDetailOpen=false;updateReceptionRegistration();drawReceptionList();document.getElementById('reception-search').focus({preventScroll:true});};
 document.getElementById('reception-registration-form').onsubmit=e=>{e.preventDefault();if(state.receptionBusy||state.receptionConnection==='offline')return;const fields=new FormData(e.currentTarget);return submitOnsiteRegistration({full_name:fields.get('full_name'),profile:fields.get('profile'),contact:fields.get('contact'),church:fields.get('church'),guardian_name:fields.get('guardian_name'),shirt_requested:fields.get('shirt_requested')==='1',shirt_size:fields.get('shirt_size')});};
}
async function submitOnsiteRegistration(body){
 if(state.receptionBusy||state.receptionSelecting||state.receptionConnection==='offline')return;
 state.onsitePending=state.onsitePending||{...body,request_key:crypto.randomUUID()};
 state.receptionBusy=true;document.getElementById('onsite-find-existing').hidden=true;updateReceptionConnection();drawReceptionList();drawReceptionDetail();
 let confirmed=false;
 try{
   if(state.receptionRefreshPromise)await state.receptionRefreshPromise;
   if(state.receptionConnection==='offline')throw new Error('Atualize a lista antes de cadastrar.');
   const result=await api('/api/staff/register-onsite','POST',state.onsitePending);confirmed=true;
   const index=state.items.findIndex(p=>p.id===result.item.id);if(index>=0)state.items[index]=result.item;else state.items.push(result.item);
   state.selected=result.item;state.receptionDetailOpen=true;
   const refreshed=await refreshReception(true);
   state.receptionNotice={kind:'success',message:(result.existing?'Inscrição já existente. Confira a identidade nesta ficha.':result.created?'Inscrição cadastrada. Confira os itens e libere a entrada.':'Inscrição já confirmada. Nenhum cadastro duplicado foi criado.')+(refreshed?'':' Cadastro confirmado. Atualize a lista antes de registrar entregas ou entrada.')};
   state.onsitePending=null;state.receptionRegistrationOpen=false;
   document.getElementById('reception-registration-form').reset();document.getElementById('onsite-size-field').hidden=true;document.getElementById('onsite-size').required=false;document.getElementById('onsite-alert').hidden=true;
 }catch(e){
   if(!confirmed){if([400,409].includes(e.status))state.onsitePending=null;flash(e.message+(state.onsitePending?' Os dados foram mantidos. Atualize e toque em Conferir e concluir cadastro para verificar o mesmo envio.':''),'error','onsite-alert');document.getElementById('onsite-find-existing').hidden=false;await refreshReception(true);}
   else{state.receptionRegistrationOpen=false;state.onsitePending=null;state.receptionNotice={kind:'success',message:'Cadastro confirmado. Atualize a lista para continuar.'};}
 }finally{state.receptionBusy=false;drawReceptionList();drawReceptionDetail();updateReceptionConnection();if(confirmed){document.getElementById('reception-participant-name')?.focus({preventScroll:true});if(window.matchMedia('(max-width: 850px)').matches)document.getElementById('reception-detail').scrollIntoView({block:'start'});}}
}
function drawReception(){
 if(state.receptionTimer){clearInterval(state.receptionTimer);state.receptionTimer=null;}
 const c=receptionSummary();
 root.innerHTML=`<div id="reception-shell" class="reception-shell"><section class="staff-top reception-top"><div><p class="eyebrow">Equipe · 7 de novembro de 2026</p><h1>Credenciamento</h1><p class="muted">JOVENS · ${H(state.user.username)}</p></div><div class="actions">${can('admin','reception')?'<button id="reception-register" class="btn" aria-controls="reception-registration-panel" aria-expanded="false">+ Inscrever na hora</button>':''}${can('admin')?'<button id="close-reception" class="btn ghost">Administração</button>':''}<button id="reception-logout" class="btn ghost">Sair</button></div></section>
 <section class="reception-summary" aria-label="Resumo do credenciamento"><div><strong id="reception-waiting-count">${c.waiting}</strong><span>Na recepção</span></div><div><strong id="reception-done-count">${c.done}</strong><span>Liberados</span></div><div><strong id="reception-total-count">${c.total}</strong><span>Inscritos</span></div></section>
 <div class="reception-connection"><div><span id="reception-connection-label" class="reception-live" role="status">Conectado</span><span id="reception-sync-time" class="small"></span></div><button id="reception-refresh" class="btn ghost">↻ Atualizar</button></div><div id="reception-connection-warning" class="message error" role="alert" hidden></div>
 ${receptionRegistrationForm()}
 <section class="reception-toolbar" aria-label="Localizar participante"><div class="reception-search-box"><label for="reception-search">Buscar por nome</label><div class="reception-search-field"><input id="reception-search" type="search" autocomplete="off" enterkeyhint="search" placeholder="Digite o nome do participante" value="${H(state.receptionSearch)}" aria-describedby="reception-search-hint"><button id="reception-clear-search" class="btn ghost" aria-label="Limpar busca" ${state.receptionSearch?'':'hidden'}>×</button></div><p id="reception-search-hint" class="small">A busca encontra todos os inscritos, inclusive quem chegou sem celular.</p></div><div class="reception-filters" aria-label="Filtrar lista">${[['waiting','Na recepção'],['done','Liberados'],['all','Todos']].map(([key,label])=>`<button data-rfilter="${key}" aria-pressed="${state.receptionFilter===key}" class="${state.receptionFilter===key?'active':''}">${label}</button>`).join('')}</div></section>
 <div class="reception-layout"><section class="panel reception-list-panel"><div class="reception-list-heading"><h2>Participantes</h2><span id="reception-result-count" class="small" role="status"></span></div><div id="reception-list" class="reception-list"></div></section><section id="reception-detail" class="panel reception-detail" aria-label="Ficha do participante"></section></div>${msg()}</div>`;
 document.getElementById('reception-logout').onclick=async()=>{if(state.receptionBusy)return;try{await api('/api/session','DELETE');if(state.receptionTimer)clearInterval(state.receptionTimer);state.user=null;state.sessionToken=null;try{sessionStorage.removeItem('enr_session')}catch{}location.href='/equipe';}catch(e){flash(e.message,'error');}};
 const close=document.getElementById('close-reception');if(close)close.onclick=()=>{if(state.receptionBusy)return;state.receptionMode=false;drawStaff();};
 document.getElementById('reception-refresh').onclick=()=>refreshReception(true);
 document.getElementById('reception-search').oninput=e=>{state.receptionSearch=e.target.value;document.getElementById('reception-clear-search').hidden=!state.receptionSearch;drawReceptionList();};
 document.getElementById('reception-clear-search').onclick=()=>{state.receptionSearch='';document.getElementById('reception-search').value='';document.getElementById('reception-clear-search').hidden=true;drawReceptionList();document.getElementById('reception-search').focus();};
 document.querySelectorAll('[data-rfilter]').forEach(b=>b.onclick=()=>{state.receptionFilter=b.dataset.rfilter;document.querySelectorAll('[data-rfilter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});drawReceptionList();});
 bindReceptionRegistration();
 drawReceptionList();drawReceptionDetail();syncReceptionView();updateReceptionConnection();
 state.receptionTimer=setInterval(()=>refreshReception(),10000);
}
function drawReceptionList(){
 const el=document.getElementById('reception-list');if(!el)return;
 const q=String(state.receptionSearch||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 let rows=receptionRows().filter(p=>!q||p.full_name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q));
 // A name search also finds people without a QR arrival, independently of the active filter.
 if(!q&&state.receptionFilter==='waiting')rows=rows.filter(p=>p.arrival_at&&!p.checkin_at);
 if(!q&&state.receptionFilter==='done')rows=rows.filter(p=>p.checkin_at);
 rows=[...rows].sort((a,b)=>Number(!!b.arrival_at&&!b.checkin_at)-Number(!!a.arrival_at&&!a.checkin_at)||Number(a.official_source_row||a.source_row)-Number(b.official_source_row||b.source_row));
 const scroll=el.scrollTop;
 const focused=document.activeElement?.dataset?.rid;
 el.innerHTML=rows.map(p=>{
   const m=receptionMeta(p);
   const shirt=!p.shirt_requested?'Sem camiseta':receptionShirtDone(p)?'Camiseta entregue':receptionPaid(p)?'Camiseta '+H(p.shirt_size||'?')+' paga':'Receber R$ 60 · '+H(p.shirt_size||'?');
   const gift=receptionGiftDone(p)?'Brinde entregue':m.gift?'Brinde'+(m.rank?' #'+m.rank:''):state.stats?.prizes_locked?'Sem brinde':'Brinde: lista pendente';
   return `<button type="button" class="reception-person ${state.selected?.id===p.id?'selected':''}" data-rid="${p.id}" aria-pressed="${state.selected?.id===p.id}" ${state.receptionBusy||state.receptionSelecting?'disabled':''}><div class="reception-person-head"><strong>${H(p.full_name)}</strong>${badge(p.checkin_at?'Liberado':p.arrival_at?'Chegou':'Inscrito',p.checkin_at?'green':p.arrival_at?'orange':'blue')}</div><div class="chips">${receptionGroupChip(p)}</div><small>${shirt} · ${gift}</small><span class="reception-open">Abrir ficha →</span></button>`;
 }).join('')||`<div class="reception-empty"><strong>${q?'Nenhum nome encontrado':'Nenhuma pessoa neste filtro'}</strong><p>${q?'Confira a escrita do nome ou tente uma parte dele.':'Quem chegou sem escanear o QR pode ser encontrado pela busca ou em Todos.'}</p>${q?'':'<button id="reception-show-all" class="btn ghost">Ver todos os inscritos</button>'}</div>`;
 el.scrollTop=scroll;
 const count=document.getElementById('reception-result-count');if(count)count.textContent=rows.length+' '+(rows.length===1?'pessoa':'pessoas')+(q?' · busca em todos':'');
 const all=document.getElementById('reception-show-all');if(all)all.onclick=()=>{document.querySelector('[data-rfilter="all"]').click();};
 el.querySelectorAll('[data-rid]').forEach(b=>b.onclick=async()=>{
   if(state.receptionBusy||state.receptionSelecting)return;
   const id=Number(b.dataset.rid);state.receptionSelecting=id;b.disabled=true;b.setAttribute('aria-busy','true');
   try{
     if(state.receptionRefreshPromise)await state.receptionRefreshPromise;
     const exact=await api('/api/staff/participant?id='+id);
     const idx=state.items.findIndex(x=>x.id===id);if(idx>=0)state.items[idx]=exact.item;
     state.selected=exact.item;state.receptionNotice=null;state.receptionDetailOpen=true;
     state.receptionSelecting=null;drawReceptionList();drawReceptionDetail();syncReceptionView();
     document.getElementById('reception-search').blur();
     const heading=document.getElementById('reception-participant-name');heading?.focus({preventScroll:true});
     if(window.matchMedia('(max-width: 850px)').matches)document.getElementById('reception-detail').scrollIntoView({block:'start'});
   }catch(e){state.receptionSelecting=null;drawReceptionList();flash(e.message,'error');}
 });
 if(focused)el.querySelector('[data-rid="'+focused+'"]')?.focus({preventScroll:true});
}
function drawReceptionDetail(){
 const p=state.selected,el=document.getElementById('reception-detail');if(!el)return;
 if(!p){el.innerHTML='<div class="reception-placeholder"><span aria-hidden="true">↖</span><h2>Abra uma ficha para começar</h2><p class="muted">Busque pelo nome, confira a pessoa e libere a entrada. Quem chega pelo QR aparece em Na recepção.</p></div>';return;}
 const paid=receptionPaid(p),needsPayment=!!p.shirt_requested&&!paid,finished=!!p.checkin_at;
 const shirtReady=!!p.shirt_requested&&paid&&!receptionShirtDone(p);
 const giftReady=!!p.prize_eligible&&!!state.stats?.prizes_locked&&!receptionGiftDone(p);
 const unavailable=state.receptionBusy||state.receptionConnection==='offline'||!p.active;
 el.innerHTML=`<button id="reception-back" class="btn ghost reception-back" ${state.receptionBusy?'disabled':''}>← Voltar à lista</button><div class="reception-card-head"><div><p class="eyebrow">Ficha #${p.id}</p><h2 id="reception-participant-name" tabindex="-1">${H(p.full_name)}</h2><div class="chips">${receptionGroupChip(p)}</div></div>${badge(finished?'Entrada liberada':p.arrival_at?'Na recepção':'Inscrição localizada',finished?'green':p.arrival_at?'orange':'blue')}</div>
 <details class="reception-identity"><summary>Dados para conferir a identidade</summary>${row('Responsável',H(p.guardian_name||'Não informado'))}${row('Contato',H(p.contact||'Não informado'))}${row('Igreja',H(p.church||'Não informada'))}</details>
 ${p.duplicate_status==='needs_review'?'<div class="notice bad">Possível cadastro duplicado: confira a identidade antes de entregar itens.</div>':''}
  ${msg('reception-detail-alert')}
 <section class="reception-deliveries" hidden><p class="small">Confira os itens da ficha e registre cada entrega.</p><div class="reception-checklist"><p class="eyebrow">1 · Camiseta</p>${receptionShirtText(p)}${needsPayment?'<button id="receive-shirt-payment" data-reception-action class="btn danger wide reception-pay" '+(unavailable?'disabled':'')+'>💰 RECEBER R$ 60</button>':''}${shirtReady?'<button id="deliver-reception-shirt" data-reception-action class="btn wide" '+(unavailable?'disabled':'')+'>👕 LIBERAR CAMISETA</button>':''}<p class="eyebrow">2 · Brinde</p>${receptionGiftText(p)}${giftReady?'<button id="deliver-reception-gift" data-reception-action class="btn wide" '+(unavailable?'disabled':'')+'>🎁 LIBERAR BRINDE</button>':''}</div></section>
 <section class="reception-entry"><p class="eyebrow">Entrada</p>${finished?'<div class="notice good"><strong>✓ Entrada liberada.</strong><br>'+H(fmtDate(p.checkin_at))+'</div>':'<p class="reception-final-note">Confira a identidade e libere a entrada. A entrada é gratuita.</p><button id="finish-reception" data-reception-action class="btn ok wide reception-finish" '+(unavailable?'disabled':'')+'>✓ LIBERAR ENTRADA</button>'}</section>${state.receptionBusy?'<p class="reception-saving" role="status">Registrando… aguarde a confirmação.</p>':''}`;
 document.getElementById('reception-back').onclick=()=>{if(state.receptionBusy)return;state.selected=null;state.receptionNotice=null;state.receptionDetailOpen=false;drawReceptionList();drawReceptionDetail();syncReceptionView();document.getElementById('reception-search').focus({preventScroll:true});};
 if(state.receptionNotice)flash(state.receptionNotice.message,state.receptionNotice.kind,'reception-detail-alert');
 const bind=(id,path,body,question,success)=>{const button=document.getElementById(id);if(button)button.onclick=()=>runReceptionAction(path,body,question,success);};
 bind('receive-shirt-payment','/api/staff/reception-payment',{id:p.id},'Confirmar o pagamento de R$ 60 da camiseta?','Pagamento registrado. Camiseta paga.');
 bind('finish-reception','/api/staff/reception-complete',{id:p.id},'Confirmar identidade e LIBERAR a entrada de '+p.full_name+'? Esta ação NÃO registra entrega de itens.','Entrada liberada.');
 bind('deliver-reception-shirt','/api/staff/shirt',{id:p.id,size:p.shirt_size},'Confirmar a entrega física da camiseta para '+p.full_name+'?','Entrega da camiseta registrada.');
 bind('deliver-reception-gift','/api/staff/prize',{id:p.id},'Confirmar a entrega física do brinde para '+p.full_name+'?','Entrega do brinde registrada.');
}
async function runReceptionAction(path,body,question,success){
 if(state.receptionBusy||state.receptionConnection==='offline'||state.selected?.id!==body.id)return;
 if(!confirm(question))return;
 state.receptionBusy=true;state.receptionNotice=null;drawReceptionDetail();drawReceptionList();updateReceptionConnection();
 let written=false;
 try{
   if(state.receptionRefreshPromise)await state.receptionRefreshPromise;
   if(state.receptionConnection==='offline')throw new Error('Atualize a ficha antes de registrar a operação.');
   await api(path,'POST',body);written=true;
   const refreshed=await refreshReception(true);
   state.receptionNotice={kind:'success',message:success+(refreshed?'':' O registro foi confirmado. Atualize a lista antes da próxima operação.')};
 }catch(e){
   state.receptionNotice={kind:'error',message:e.message+(written?'':' Atualize a ficha para conferir o resultado antes de repetir.')};
   // A lost write response may still have committed; require a fresh read before another action.
   await refreshReception(true);
 }finally{state.receptionBusy=false;drawReceptionDetail();drawReceptionList();updateReceptionConnection();}
}
async function refreshReception(forceDetail=false){
 if(!document.getElementById('reception-shell'))return false;
 if(!forceDetail&&(document.hidden||Date.now()<state.serviceRetryAt))return false;
 if(state.receptionRefreshPromise)return state.receptionRefreshPromise;
 if((state.receptionBusy||state.receptionSelecting)&&!forceDetail)return false;
 const previousItems=JSON.stringify(state.items),previousDetail=JSON.stringify(state.selected),previousLocked=state.stats?.prizes_locked,previousStock=JSON.stringify(state.stats?.stock),previousConnection=state.receptionConnection;
 state.receptionRefreshPromise=(async()=>{
   try{
     const updates=await api('/api/staff/updates');
     if(!forceDetail&&state.rosterVersion!==null&&updates.version===state.rosterVersion&&previousConnection==='online'){state.receptionLastSync=Date.now();return true;}
     const [list,stats]=await Promise.all([api('/api/staff/list'),api('/api/staff/stats')]);
     if(!document.getElementById('reception-shell'))return false;
     state.items=list.items;state.stats=stats;state.rosterVersion=Number.isSafeInteger(updates.version)?updates.version:null;state.serviceRetryAt=0;state.serviceLimitNotice='';
     if(state.selected)state.selected=state.items.find(x=>x.id===state.selected.id&&x.active)||null;
     state.receptionLastSync=Date.now();state.receptionConnection='online';
     if(JSON.stringify(state.items)!==previousItems||previousLocked!==state.stats.prizes_locked)drawReceptionList();
     if(forceDetail||JSON.stringify(state.selected)!==previousDetail||previousLocked!==state.stats.prizes_locked||previousStock!==JSON.stringify(state.stats.stock)||previousConnection!==state.receptionConnection)drawReceptionDetail();
     const c=receptionSummary();for(const [key,value] of Object.entries(c)){const id={waiting:'reception-waiting-count',done:'reception-done-count',total:'reception-total-count'}[key];const el=document.getElementById(id);if(el)el.textContent=String(value);}
     if(!state.selected){state.receptionDetailOpen=false;syncReceptionView();}
     return true;
   }catch(e){state.receptionConnection='offline';if(previousConnection!=='offline'||forceDetail)drawReceptionDetail();return false;}
 })();
 updateReceptionConnection();
 try{return await state.receptionRefreshPromise;}finally{state.receptionRefreshPromise=null;updateReceptionConnection();}
}
function drawStock(){
 const rows=receptionRows().filter(p=>p.shirt_requested);
 const sizes=['PP','P','M','G','GG','XGG'];
 document.getElementById('dashboard').insertAdjacentHTML('beforeend',`<section class="panel" style="margin-top:20px"><p class="eyebrow">Camisetas</p><h2>Pagamentos e entregas</h2><p class="muted">Pagamento no dia: <strong>R$ 60</strong>. Libere a camiseta, depois o brinde e finalize a entrada.</p><table class="stock-table"><thead><tr><th>Tamanho</th><th>Pedidas</th><th>Pagas</th><th>Receber R$ 60</th><th>Entregues</th></tr></thead><tbody>${sizes.map(size=>{const group=rows.filter(p=>p.shirt_size===size);return '<tr><td>'+size+'</td><td>'+group.length+'</td><td>'+group.filter(receptionPaid).length+'</td><td>'+group.filter(p=>!receptionPaid(p)).length+'</td><td>'+group.filter(receptionShirtDone).length+'</td></tr>';}).join('')}</tbody></table>${can('admin')&&state.stats.reception_policy_version!==1?'<div class="divider"></div><button id="apply-reception-policy" class="btn wide">Aplicar R$ 60 e o fluxo camiseta, brinde, entrada</button>':'<p class="small">Configuração do evento aplicada.</p>'}${msg('stock-alert')}</section>`);
 const setup=document.getElementById('apply-reception-policy');if(setup)setup.onclick=async()=>{setup.disabled=true;try{await api('/api/admin/reception-policy','POST',{onsite_shirt_price:60,shirts_available:true,flow:'shirt_gift_entry'});await loadStaff();drawStaff();flash('Configuração do evento aplicada.','success','stock-alert');}catch(e){setup.disabled=false;flash(e.message,'error','stock-alert');}};
}

function startBatchMode(){
 if(!state.comms?.contacts?.length)return;
 const pending=state.comms.contacts.filter(c=>c.whatsapp_phone&&(c.status==='not_sent'||c.status==='failed'));
 if(!pending.length){flash('Não há mensagens aptas para este lote. Confira os contatos pendentes de revisão.','success','communication-alert');return;}
 const batch=pending.slice(0,10);
 sessionStorage.setItem('enr_batch',JSON.stringify({ids:batch.map(c=>c.participant_id),index:0,started_at:Date.now()}));
 renderBatchMode();
}
function renderBatchMode(){
 const raw=sessionStorage.getItem('enr_batch');if(!raw)return;
 let batch;try{batch=JSON.parse(raw)}catch{return;}
 if(!Array.isArray(batch.ids)){sessionStorage.removeItem('enr_batch');return;}
 const contacts=(state.comms?.contacts||[]).filter(c=>batch.ids.includes(c.participant_id));
 const current=contacts.find(c=>c.participant_id===batch.ids[batch.index]);
 const el=document.getElementById('communication-body');if(!el||!current)return;
 el.innerHTML=`<div class="notice good"><strong>Modo lote ativo</strong><br>Participante ${batch.index+1} de ${batch.ids.length}. Ao concluir este lote, o próximo ficará disponível após 20 minutos.</div>
 <article class="communication-card"><div class="participant-head"><span>${H(current.names.join(' · '))}</span>${commStatus(current.status)}</div><small>Mensagem individual · telefone final ${H(String(current.contact_digits).slice(-4))}</small><p class="communication-message" style="white-space:pre-line">${H(current.message)}</p><div class="actions">${current.whatsapp_phone?`<button id="batch-open" class="btn">Abrir WhatsApp</button>`:''}<button id="batch-sent" class="btn ok">Marcar enviado e próximo</button><button id="batch-skip" class="btn ghost">Pular e próximo</button><button id="batch-exit" class="btn ghost">Sair do modo lote</button></div></article>`;
 if(document.getElementById('batch-open'))document.getElementById('batch-open').onclick=()=>window.open('https://wa.me/'+current.whatsapp_phone+'?text='+encodeURIComponent(current.message),'_blank','noopener');
 document.getElementById('batch-sent').onclick=()=>advanceBatch(current,'sent');
 document.getElementById('batch-skip').onclick=()=>advanceBatch(current,'skipped');
 document.getElementById('batch-exit').onclick=()=>{sessionStorage.removeItem('enr_batch');renderCommunications();};
}
async function advanceBatch(current,status){
 await api('/api/admin/communication-status','POST',{participant_id:current.participant_id,status});
 const batch=JSON.parse(sessionStorage.getItem('enr_batch'));
 batch.index+=1;
 if(batch.index>=batch.ids.length){
   sessionStorage.removeItem('enr_batch');
   const unlock=Date.now()+20*60*1000;
   localStorage.setItem('enr_next_batch_after',String(unlock));
   state.comms=await api('/api/admin/communications');
   renderCommunications();
   flash('Lote concluído. O próximo lote ficará disponível em 20 minutos.','success','communication-alert');
   return;
 }
 sessionStorage.setItem('enr_batch',JSON.stringify(batch));
 state.comms=await api('/api/admin/communications');
 renderBatchMode();
}
function batchWaitText(){
 const t=Number(localStorage.getItem('enr_next_batch_after')||0),left=t-Date.now();
 if(left<=0){if(t)localStorage.removeItem('enr_next_batch_after');return '';}
 const m=Math.ceil(left/60000);return `Próximo lote disponível em aproximadamente ${m} min.`;
}
function commStatus(s){return s==='sent'?badge('Enviado','green'):s==='failed'?badge('Falhou','red'):s==='skipped'?badge('Pulado','orange'):badge('Não enviado','blue');}
async function drawCommunications(){
 const rootPanel=document.getElementById('dashboard');
 rootPanel.insertAdjacentHTML('beforeend',`<section class="panel" style="margin-top:18px"><p class="eyebrow">Confirmações pelo WhatsApp</p><h2>Central de Comunicação</h2><p class="muted">Uma mensagem por participante, mesmo quando o telefone é compartilhado. Camiseta é mencionada apenas para quem solicitou.</p><div id="communication-body"><p class="muted">Carregando contatos…</p></div>${msg('communication-alert')}</section>`);
 try{state.comms=await api('/api/admin/communications');renderCommunications();}catch(e){flash(e.message,'error','communication-alert');}
}
function renderCommunications(){
 const el=document.getElementById('communication-body');if(!el||!state.comms)return;
 const s=state.comms.summary||{},contacts=state.comms.contacts||[];
 el.innerHTML=`<div class="metrics comm-metrics">${[['Mensagens individuais',s.registrations],['Telefones distintos',s.contacts],['Enviados',s.sent],['Pendentes',s.not_sent],['Falhas',s.failed]].map(([k,v])=>`<div class="metric"><strong>${Number(v||0)}</strong><span>${H(k)}</span></div>`).join('')}</div>
 <div class="notice good"><strong>${Number(s.registrations||0)} mensagens individuais</strong> para <strong>${Number(s.contacts||0)} telefones válidos</strong>. ${Number(s.invalid_phone||0)} inscrições com telefone a conferir.</div>
 <div class="actions"><button id="start-batch" class="btn">▶ Iniciar lote de 10</button><a class="btn ghost" href="/api/admin/communications.csv">⬇ Baixar CSV</a><button id="next-pending" class="btn ghost">Ir para o próximo pendente</button><button id="refresh-comms" class="btn ghost">↻ Atualizar</button></div><p id="batch-wait" class="small">${H(batchWaitText())}</p>
 <div class="divider"></div><div class="communication-list">${contacts.length?contacts.map((c,i)=>`<article class="communication-card" data-comm-index="${i}"><div class="participant-head"><span>${H(c.names.join(' · '))}</span>${commStatus(c.status)}</div><small>Inscrição individual · ${c.shirt_requested?'camiseta '+H(c.shirt_size||'a confirmar'):'sem camiseta'} · telefone final ${H(String(c.contact_digits||'').slice(-4))}</small><p class="communication-message" style="white-space:pre-line">${H(c.message)}</p><div class="actions">${c.whatsapp_phone?`<button class="btn open-whatsapp" data-index="${i}">Abrir WhatsApp</button>`:`<button class="btn" disabled>Telefone inválido</button>`}<button class="btn ghost mark-sent" data-index="${i}" ${c.whatsapp_phone?"":"disabled"}>Marcar enviado</button><button class="btn ghost mark-skip" data-index="${i}">Pular</button><button class="btn ghost mark-failed" data-index="${i}">Falhou</button></div></article>`).join(''):'<p class="muted">Nenhum telefone válido encontrado.</p>'}</div>`;
 const startBatch=document.getElementById('start-batch');if(startBatch){const wait=Number(localStorage.getItem('enr_next_batch_after')||0)-Date.now();startBatch.disabled=wait>0;startBatch.onclick=()=>startBatchMode();}
 document.getElementById('refresh-comms').onclick=async()=>{state.comms=await api('/api/admin/communications');renderCommunications();};
 document.getElementById('next-pending').onclick=()=>{const i=contacts.findIndex(c=>c.status==='not_sent'||c.status==='failed');const card=document.querySelector('[data-comm-index="'+i+'"]');if(card)card.scrollIntoView({behavior:'smooth',block:'center'});else flash('Não há contatos pendentes.','success','communication-alert');};
 el.querySelectorAll('.open-whatsapp').forEach(b=>b.onclick=()=>{const c=contacts[Number(b.dataset.index)];if(!c?.whatsapp_phone)return;window.open('https://wa.me/'+c.whatsapp_phone+'?text='+encodeURIComponent(c.message),'_blank','noopener');});
 const setStatus=async(index,status)=>{const c=contacts[Number(index)];try{await api('/api/admin/communication-status','POST',{participant_id:c.participant_id,status});state.comms=await api('/api/admin/communications');renderCommunications();flash(status==='sent'?'Envio marcado como concluído.':'Status atualizado.','success','communication-alert');}catch(e){flash(e.message,'error','communication-alert');}};
 el.querySelectorAll('.mark-sent').forEach(b=>b.onclick=()=>setStatus(b.dataset.index,'sent'));
 el.querySelectorAll('.mark-skip').forEach(b=>b.onclick=()=>setStatus(b.dataset.index,'skipped'));
 el.querySelectorAll('.mark-failed').forEach(b=>b.onclick=()=>setStatus(b.dataset.index,'failed'));
}
async function drawWhatsAppAdmin(){
 const host=document.getElementById('dashboard');if(!host)return;
 host.insertAdjacentHTML('beforeend',`<section class="panel whatsapp-admin" style="margin-top:18px">
   <p class="eyebrow">Conexão operacional</p>
   <h2>WhatsApp da recepção</h2>
   <p class="muted">Esta é a nova Evolution API exclusiva do JOVENS, independente do Escala IDG. Conecte pelo QR e teste com seu número.</p>
   <div id="wa-admin-body"><p class="muted">Carregando configuração…</p></div>
   ${msg('wa-admin-alert')}
 </section>`);
 const body=document.getElementById('wa-admin-body');
 let qrPollTimer=null;
 const stopQrPolling=()=>{if(qrPollTimer){clearInterval(qrPollTimer);qrPollTimer=null;}};
 const probe=async()=>{try{return await api('/api/admin/whatsapp/status?probe=1');}catch(e){return{configured:true,state:'error',connected:false,error:e.message};}};
 const showQr=async(q)=>{
   const slot=document.getElementById('wa-qr');
   if(!slot)return;
   if(q.connected){stopQrPolling();slot.innerHTML='<div class="notice good"><strong>🟢 WhatsApp conectado</strong><p>A vinculação foi concluída.</p></div>';return;}
   if(!q.base64){slot.innerHTML='<p class="muted">QR ainda não disponível. Aguarde alguns segundos e tente novamente.</p>';return;}
   slot.innerHTML=`<div class="notice good"><strong>Escaneie agora</strong><p>No celular: WhatsApp → Aparelhos conectados → Conectar aparelho.</p><img id="wa-live-qr" src="${H(q.base64)}" alt="QR Code para conectar o WhatsApp" style="display:block;max-width:360px;width:100%;margin:14px auto;background:white;border-radius:16px;padding:12px"><small class="muted">O QR é atualizado automaticamente enquanto esta tela estiver aberta.</small></div>`;
   stopQrPolling();
   qrPollTimer=setInterval(async()=>{
     try{
       const latest=await api('/api/admin/whatsapp/qr');
       if(latest.connected){stopQrPolling();await render();return;}
       if(latest.base64){
         const img=document.getElementById('wa-live-qr');
         if(img)img.src=latest.base64;
       }
     }catch(_e){}
   },12000);
 };
 const render=async()=>{
   stopQrPolling();
   try{
     const st=await probe();
     if(!st.configured){
       body.innerHTML=`<div class="notice"><strong>WhatsApp ainda não configurado.</strong><p>Copie a AUTHENTICATION_API_KEY do serviço jovens-evolution no Railway e cole abaixo.</p><label for="wa-api-key">Chave da Evolution API</label><input id="wa-api-key" type="password" autocomplete="off" placeholder="Cole a AUTHENTICATION_API_KEY"><button id="wa-save-key" class="btn wide">Salvar conexão</button></div>`;
       document.getElementById('wa-save-key').onclick=async()=>{
         const key=document.getElementById('wa-api-key').value.trim();
         if(key.length<32){flash('A chave precisa ter pelo menos 32 caracteres.','error','wa-admin-alert');return;}
         try{await api('/api/admin/whatsapp/config','POST',{api_key:key});flash('Chave salva. Agora teste a conexão.','success','wa-admin-alert');await render();}catch(e){flash(e.message,'error','wa-admin-alert');}
       };
       return;
     }
     body.innerHTML=`<div class="notice"><strong>🔐 Evolution API configurada</strong><p>A chave é protegida no banco de dados. O envio de teste só fica disponível quando a Evolution API estiver conectada.</p></div>
     <div class="panel" style="margin-top:14px;padding:16px">
       <p class="eyebrow">Teste de envio</p>
       <h3>Enviar uma mensagem pelo WhatsApp</h3>
       <p class="small">Teste apenas com seu próprio número e confirme que a mensagem chegou legível.</p>
       <div class="form-grid">
         <label>Número com DDD<input id="wa-test-number" inputmode="tel" placeholder="61999999999"></label>
         <label>Mensagem<textarea id="wa-test-text" rows="3" placeholder="Olá! Esta é uma mensagem de teste do JOVENS."></textarea></label>
       </div>
       <div class="notice orange"><strong>Nova integração Evolution API.</strong> Conecte a instância e teste o envio individual. O envio manual continua disponível se necessário.</div><div class="actions"><button id="wa-send-test" class="btn" disabled>✈ Testar envio pela Evolution</button><button id="wa-manual-send" class="btn ghost">Abrir no WhatsApp manualmente</button></div>
       <div id="wa-send-result"></div>
     </div>
     <div class="actions"><button id="wa-test" class="btn">✓ Testar conexão</button><button id="wa-change-key" class="btn ghost">Alterar chave</button></div><div id="wa-test-result"></div>`;
     if(st.connected) document.getElementById('wa-send-test').disabled=false;
     document.getElementById('wa-manual-send').onclick=()=>{
       const raw=document.getElementById('wa-test-number').value.replace(/\D/g,'');
       const text=document.getElementById('wa-test-text').value.trim();
       const phone=(raw.length===10||raw.length===11?'55'+raw:raw);
       if(!/^55\d{10,11}$/.test(phone)){document.getElementById('wa-send-result').innerHTML='<div class="notice bad">Informe o telefone brasileiro com DDD.</div>';return;}
       if(!text){document.getElementById('wa-send-result').innerHTML='<div class="notice bad">Digite a mensagem.</div>';return;}
       window.open('https://wa.me/'+phone+'?text='+encodeURIComponent(text),'_blank','noopener');
       document.getElementById('wa-send-result').innerHTML='<div class="notice">A conversa foi aberta com a mensagem preenchida. Confira o destinatário e toque em Enviar no WhatsApp.</div>';
     };
     document.getElementById('wa-send-test').onclick=async()=>{
       const number=document.getElementById('wa-test-number').value.replace(/\D/g,'');
       const text=document.getElementById('wa-test-text').value.trim();
       const out=document.getElementById('wa-send-result');
       if(number.length<10){out.innerHTML='<div class="notice bad">Informe o número com DDD.</div>';return;}
       if(!text){out.innerHTML='<div class="notice bad">Digite a mensagem.</div>';return;}
       const btn=document.getElementById('wa-send-test');btn.disabled=true;btn.textContent='Enviando…';out.innerHTML='<p class="muted">Enviando…</p>';
       try{await api('/api/admin/whatsapp/send','POST',{number,text});out.innerHTML='<div class="notice good">✓ A Evolution API aceitou o envio. Confirme que a mensagem apareceu legível no celular antes de avisar os inscritos.</div>';}
       catch(e){out.innerHTML=`<div class="notice bad">${H(e.message)}</div>`;}
       finally{btn.disabled=false;btn.textContent='✈ Testar envio pela Evolution';}
     };
     document.getElementById('wa-change-key').onclick=()=>{
       body.innerHTML=`<div class="notice"><strong>Alterar chave do conector</strong></div><label for="wa-api-key">Nova AUTHENTICATION_API_KEY</label><input id="wa-api-key" type="password" autocomplete="off" placeholder="Cole a chave atual do Railway"><div class="actions"><button id="wa-save-key" class="btn">Salvar nova chave</button><button id="wa-cancel-key" class="btn ghost">Cancelar</button></div>`;
       document.getElementById('wa-save-key').onclick=async()=>{const key=document.getElementById('wa-api-key').value.trim();if(key.length<32){flash('A chave precisa ter pelo menos 32 caracteres.','error','wa-admin-alert');return;}try{await api('/api/admin/whatsapp/config','POST',{api_key:key});flash('Chave atualizada.','success','wa-admin-alert');await render();}catch(e){flash(e.message,'error','wa-admin-alert');}};
       document.getElementById('wa-cancel-key').onclick=render;
     };
     document.getElementById('wa-test').onclick=async()=>{
       const result=document.getElementById('wa-test-result');
       result.innerHTML='<p class="muted">Testando conexão…</p>';
       const x=await probe();
       if(x.state==='open'){
         document.getElementById('wa-send-test').disabled=false;
         result.innerHTML=`<div class="notice good"><strong>🟢 WhatsApp conectado</strong><p>O aparelho está vinculado ao JOVENS. Utilize o formulário de teste acima.</p>${x.owner?`<small>Conta conectada: ${H(x.owner)}</small>`:''}</div><div class="actions"><button id="wa-disconnect" class="btn ghost">Desconectar WhatsApp</button></div>`;
       }else if(x.state==='error'){
         document.getElementById('wa-send-test').disabled=true;
         result.innerHTML=`<div class="notice bad"><strong>Não foi possível validar o conector.</strong><p>${H(x.error||'Verifique a chave no serviço jovens-evolution do Railway.')}</p></div><button id="wa-change-key2" class="btn">Corrigir chave</button>`;
         document.getElementById('wa-change-key2').onclick=()=>document.getElementById('wa-change-key').click();
       }else{
         document.getElementById('wa-send-test').disabled=true;
         result.innerHTML=`<div class="notice orange"><strong>⚪ WhatsApp ainda não conectado</strong><p>Gere um QR Code novo na Evolution API para vincular seu aparelho.</p></div><div class="actions"><button id="wa-qr-btn" class="btn">▣ Gerar QR Code</button><button id="wa-disconnect" class="btn ghost">Desconectar</button></div><div id="wa-qr"></div>`;
       }
       const qrBtn=document.getElementById('wa-qr-btn');
       if(qrBtn)qrBtn.onclick=async()=>{
         qrBtn.disabled=true;qrBtn.textContent='Gerando QR…';
         try{const q=await api('/api/admin/whatsapp/qr');if(q.connected){await render();return;}await showQr(q);}
         catch(e){flash(e.message,'error','wa-admin-alert');}
         finally{qrBtn.disabled=false;qrBtn.textContent='▣ Gerar QR Code';}
       };
       const dis=document.getElementById('wa-disconnect');
       if(dis)dis.onclick=async()=>{
         if(!confirm('Desconectar o WhatsApp do JOVENS? Será necessário escanear um novo QR para conectar novamente.'))return;
         try{await api('/api/admin/whatsapp/disconnect','POST');flash('WhatsApp desconectado.','success','wa-admin-alert');await render();}catch(e){flash(e.message,'error','wa-admin-alert');}
       };
     };
   }catch(e){
     body.innerHTML=`<div class="notice bad">Não foi possível carregar a configuração: ${H(e.message)}</div><button id="wa-retry" class="btn">Tentar novamente</button>`;
     document.getElementById('wa-retry').onclick=render;
   }
 };
 await render();
}
function drawAdmin(){document.getElementById('dashboard').insertAdjacentHTML('beforeend',`<div class="setup-grid" style="margin-top:18px"><section class="panel"><p class="eyebrow">Antes do evento</p><h2>Confirmação de inscrição</h2><p class="muted">Compartilhe um único link. A pessoa confirma que está na base; isso não faz check-in.</p><div class="notice good"><strong>${Number(state.stats.counts?.registration_confirmed||0)} de ${Number(state.stats.counts?.total||0)}</strong> inscrições já consultadas.<br>Adolescentes: <strong>${Number(state.stats.counts?.adolescents||0)}</strong> · Adultos/responsáveis: <strong>${Number(state.stats.counts?.adults_guardians||0)}</strong> · Equipe: <strong>${Number(state.stats.counts?.team||0)}</strong> · A revisar: <strong>${Number(state.stats.counts?.type_review||0)}</strong></div><a class="btn wide" href="/confirmacao" target="_blank" rel="noopener">Abrir confirmação pública</a><p class="small">Link para compartilhar: <code>${location.origin}/confirmacao</code></p></section><section class="panel"><p class="eyebrow">Atualização até 06/11</p><h2>Planilha de inscrições</h2><p class="muted">Sincronize a planilha oficial, inclusive após o encerramento das inscrições. No modo protegido, as fichas, autorizações, check-ins, entregas e o ranking fechado serão preservados.</p><p>${state.stats.registration_closed?badge('Inscrições encerradas','green'):badge('Inscrições abertas','orange')} · ${Number(state.stats.import_count||0)} importações</p><div class="notice ${Number(state.stats.import_count||0)>0&&Number(state.stats.counts?.total||0)>0?'good':'bad'}"><strong>${Number(state.stats.import_count||0)>0&&Number(state.stats.counts?.total||0)>0?'Base carregada — confira o total com a planilha':'Base não confirmada — não distribua o QR ainda'}</strong><br>Inscrições ativas no banco: <strong>${Number(state.stats.counts?.total||0)}</strong><br>Última importação: ${fmtDate(state.stats.last_imported_at)}</div><input id="upload" type="file" accept=".json,application/json" ><button id="preview-import" class="btn ghost wide" >1. Conferir atualização</button><div id="import-preview" class="small"></div><button id="do-import" class="btn wide" disabled>2. Aplicar atualização validada</button>${msg('import-alert')}</section><section class="panel"><p class="eyebrow">Inscrições</p><h2>Encerramento</h2><p class="muted">Esta cópia não utiliza as regras de brindes e pagamentos do evento anterior.</p><button id="close-registrations" class="btn ghost wide" ${state.stats.registration_closed||!state.stats.can_close?'disabled':''}>Encerrar inscrições</button><button id="finalize" hidden disabled>Brindes desabilitados</button>${msg('final-alert')}</section><section class="panel"><p class="eyebrow">Acesso</p><h2>Novo operador</h2><form id="add-user"><label>Nome de usuário</label><input name="username" required minlength="4"><label>Senha temporária segura</label><input name="password" type="password" required minlength="12"><label>Perfil</label><select name="role"><option value="reception">Recepção</option><option value="gifts">Entrega de brindes e camisetas</option><option value="admin">Administrador</option></select><button type="submit" class="btn wide">Criar acesso</button></form>${msg('user-alert')}</section><section class="panel"><p class="eyebrow">QR Code oficial</p><h2>Cartaz de check-in</h2><img src="/api/public/qr.svg" style="max-width:220px;width:100%;background:white;border-radius:10px;padding:12px" alt="QR universal"><p class="small">Este QR é público; os dados de identificação são confirmados no próprio celular. O QR individual de cada pessoa aparece na ficha.</p><div class="actions"><a class="btn" href="/qr-impressao" target="_blank" rel="noopener">🖨 Imprimir cartaz A4</a><a class="btn ghost" href="/api/public/qr.svg" target="_blank" rel="noopener">Somente QR Code</a></div></section></div>`);
 drawWhatsAppAdmin();
 let validated=null;
 document.getElementById('upload').onchange=()=>{validated=null;document.getElementById('do-import').disabled=true;document.getElementById('import-preview').textContent='Arquivo alterado: confira novamente antes de importar.';};
 document.getElementById('preview-import').onclick=async()=>{try{const f=document.getElementById('upload').files?.[0];if(!f)throw new Error('Selecione o JSON privado gerado com a planilha atual.');const body=JSON.parse(await f.text());const r=await api('/api/admin/sync-preview','POST',body);validated=r.ok?body:null;document.getElementById('do-import').disabled=!r.ok;document.getElementById('import-preview').textContent=`${r.total} registros; ${r.new_rows} novos; ${r.existing_rows} existentes. ${r.recovery_mode?'RECUPERAÇÃO PROTEGIDA: sem alterar check-ins, entregas ou classificação dos brindes.':'Lista aberta para conciliação.'} ${r.conflicts.length?'CONFLITOS: '+r.conflicts.join(' | '):'Sem conflitos de identidade.'}`;flash(r.ok?'Conferência concluída. Verifique os totais e aplique a atualização.':'Há conflitos. Nenhum dado foi alterado.',r.ok?'success':'error','import-alert');}catch(e){validated=null;document.getElementById('do-import').disabled=true;flash(e.message,'error','import-alert');}};
 document.getElementById('do-import').onclick=async()=>{try{if(!validated)throw new Error('Primeiro valide o arquivo.');if(!confirm('Aplicar esta atualização no banco? Os registros operacionais existentes serão preservados.'))return;const r=await api('/api/admin/import','POST',validated);validated=null;flash(`${r.imported} inscrições no banco; ${r.new_rows} novas; ${r.needs_review} fichas precisam de revisão.`,'success','import-alert');try{await loadStaff();drawStaff();}catch(e){flash('Importação confirmada no banco, porém a tela não recarregou. Atualize a página.','error','import-alert');}}catch(e){validated=null;document.getElementById('do-import').disabled=true;flash(e.message,'error','import-alert');}};
 document.getElementById('close-registrations').onclick=async()=>{const confirmText=prompt('Após conferir a planilha final de 06/11, digite ENCERRAR INSCRICOES para bloquear novas importações:');if(confirmText!=='ENCERRAR INSCRICOES')return;try{const r=await api('/api/admin/close-registrations','POST',{confirm:confirmText});flash(`Inscrições encerradas: ${r.total} participantes no banco. A lista oficial de brindes permanece disponível.`,'success','final-alert');await loadStaff();drawStaff();}catch(e){flash(e.message,'error','final-alert');}};
 document.getElementById('finalize').onclick=async()=>{if(!confirm('Liberar os 50 brindes usando a lista oficial já recebida? Pagamentos, entradas e entregas serão preservados.'))return;try{const r=await api('/api/admin/finalize-prizes','POST',{});flash(`Lista oficial confirmada: ${r.eligible} contemplados.`,'success','final-alert');await loadStaff();drawStaff();}catch(e){flash(e.message,'error','final-alert');}};
 document.getElementById('add-user').onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));try{await api('/api/admin/users','POST',data);e.target.reset();flash('Operador criado. Entregue a senha por canal privado.','success','user-alert');}catch(e){flash(e.message,'error','user-alert');}};
 drawReconciliation();
 drawTestEntryReset();
}
function drawTestEntryReset(){
 if(!can('admin')||new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date())>='2026-11-07')return;
 const entries=state.items.filter(p=>p.checkin_at);
 if(!entries.length)return;
 document.getElementById('dashboard').insertAdjacentHTML('beforeend',`<section class="panel" style="margin-top:18px"><p class="eyebrow">Antes do evento</p><h2>Reverter entradas de teste</h2><p class="muted">Selecione até três fichas testadas. Elas voltarão a aguardar chegada e entrada. Os pagamentos e a lista de brindes serão preservados.</p><div>${entries.map(p=>`<label><input type="checkbox" class="test-entry-choice" value="${p.id}" style="width:auto;min-height:auto"> ${H(p.full_name)} · ficha ${p.id}</label>`).join('')}</div><label><input id="reset-test-deliveries" type="checkbox" style="width:auto;min-height:auto"> Reverter também as entregas feitas no teste</label><button id="reset-test-entries" class="btn ghost">Reverter fichas selecionadas</button>${msg('test-reset-alert')}</section>`);
 document.getElementById('reset-test-entries').onclick=async()=>{
  const selected=[...document.querySelectorAll('.test-entry-choice:checked')].map(e=>Number(e.value));
  if(!selected.length||selected.length>3){flash('Selecione de uma a três fichas.','error','test-reset-alert');return;}
  const deliveries=document.getElementById('reset-test-deliveries').checked;
  if(!confirm(`Reverter ${selected.length} entrada(s) de teste${deliveries?' e suas entregas':''}? Os pagamentos serão preservados.`))return;
  const button=document.getElementById('reset-test-entries');button.disabled=true;
  try{
   const backup=await api('/api/admin/database-backup','POST',{confirm:'CRIAR BACKUP'});
   const records=state.items.filter(p=>selected.includes(p.id)).map(p=>({id:p.id,arrival_at:p.arrival_at,checkin_at:p.checkin_at,shirt_delivered_at:p.shirt_delivered_at,prize_delivered_at:p.prize_delivered_at}));
   const result=await api('/api/admin/reset-test-entries','POST',{entries:records,reset_deliveries:deliveries,backup_id:backup.backup.id,reason:'teste_pre_evento'});
   await loadStaff();drawStaff();flash(`${result.reset} entrada(s) de teste revertida(s). Pagamentos preservados.`,'success');
  }catch(error){button.disabled=false;flash(error.message,'error','test-reset-alert');}
 };
}
function drawReconciliation(){
 const dashboard=document.getElementById('dashboard');
 dashboard.insertAdjacentHTML('afterbegin',`<section class="panel" style="margin-top:18px"><p class="eyebrow">Base oficial · preservação do histórico</p><h2>Backup e conciliação por identidade</h2><p class="muted">Confere nome, contato e data da inscrição. Mantém os identificadores, QR Codes, autorizações, check-ins e entregas existentes. Posições diferentes da planilha são registradas separadamente.</p><div class="actions"><button id="database-backup" class="btn ghost">Criar backup privado do D1</button><button id="database-backup-export" class="btn ghost" ${state.stats.latest_backup_id?'':'disabled'}>Baixar backup SQL</button></div><p id="database-backup-status" class="small">${state.stats.latest_backup_id?'Backup disponível: '+H(state.stats.latest_backup_id):'Faça o backup antes de aplicar alterações.'}</p><label for="roster-upload">Base oficial preparada</label><input id="roster-upload" type="file" accept=".json,application/json"><div class="actions"><button id="roster-preview" class="btn ghost">Conferir identidades da base oficial</button><button id="roster-apply" class="btn" disabled>Reconciliar preservando históricos</button></div><pre id="roster-result" style="white-space:pre-wrap;font:inherit" class="small">${state.stats.official_roster_count?'Base oficial conciliada: '+state.stats.official_roster_count+' inscrições · Voluntários: '+state.stats.roster_groups.volunteer+' · Apoio: '+state.stats.roster_groups.support+' · Adolescentes/jovens: '+state.stats.roster_groups.adolescent:'Aguardando conferência.'}</pre>${msg('reconcile-alert')}</section>`);
 let backupId=state.stats.latest_backup_id||null,validated=null;
 const setResult=r=>document.getElementById('roster-result').textContent=`Base oficial: ${r.total}. Banco antes: ${r.database_total}. Correspondências: ${r.existing_rows}. Novas: ${r.new_rows}. Posições diferentes: ${r.moved_rows}. Contatos corrigidos: ${r.contact_corrections}. Nomes corrigidos: ${r.name_corrections}. Fichas antigas adicionais preservadas: ${r.extra_rows}.\nVoluntários: ${r.groups.volunteer}. Apoio: ${r.groups.support}. Adolescentes/jovens: ${r.groups.adolescent}.\n${r.conflicts.length?'Conflitos: '+r.conflicts.join('\n'):'Sem conflitos de identidade.'}${r.verified?'\nConsulta após atualização: '+r.verified.total+' registros; '+r.verified.active+' ativos; '+r.verified.checked_in+' entradas; '+r.verified.arrived+' chegadas; '+r.verified.shirts+' camisetas entregues; '+r.verified.prizes+' brindes entregues.':''}`;
 document.getElementById('database-backup').onclick=async()=>{const button=document.getElementById('database-backup');button.disabled=true;try{const r=await api('/api/admin/database-backup','POST',{confirm:'CRIAR BACKUP'});backupId=r.backup.id;validated=null;document.getElementById('roster-apply').disabled=true;document.getElementById('database-backup-export').disabled=false;document.getElementById('database-backup-status').textContent=`Backup ${backupId}: ${r.backup.table_count} tabelas; ${r.backup.counts.total} registros; ${r.backup.counts.checked_in} entradas; ${r.backup.counts.shirts} camisetas e ${r.backup.counts.prizes} brindes entregues.`;flash('Backup privado criado e verificado no D1.','success','reconcile-alert');}catch(e){flash(e.message,'error','reconcile-alert');}finally{button.disabled=false;}};
 document.getElementById('database-backup-export').onclick=async()=>{try{if(!backupId)throw new Error('Crie o backup primeiro.');const r=await fetch('/api/admin/database-backup/export',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json',...(state.sessionToken?{'x-jovens-session':state.sessionToken}:{})},body:JSON.stringify({backup_id:backupId})});if(!r.ok)throw new Error('Não foi possível baixar o backup.');const link=document.createElement('a');link.href=URL.createObjectURL(await r.blob());link.download='JOVENS_D1_BACKUP_'+backupId+'.sql';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(link.href);}catch(e){flash(e.message,'error','reconcile-alert');}};
 document.getElementById('roster-upload').onchange=()=>{validated=null;document.getElementById('roster-apply').disabled=true;};
 document.getElementById('roster-preview').onclick=async()=>{try{const file=document.getElementById('roster-upload').files?.[0];if(!file)throw new Error('Selecione a base oficial preparada.');const body=JSON.parse(await file.text());const r=await api('/api/admin/roster-preview','POST',body);setResult(r);validated=r.ok?{...body,expected_fingerprint:r.expected_fingerprint}:null;document.getElementById('roster-apply').disabled=!r.ok||!backupId;flash(r.ok?'Identidades conferidas. Backup obrigatório antes de aplicar.':'Há conflitos. Nenhum registro foi alterado.',r.ok?'success':'error','reconcile-alert');}catch(e){validated=null;document.getElementById('roster-apply').disabled=true;flash(e.message,'error','reconcile-alert');}};
 document.getElementById('roster-apply').onclick=async()=>{const button=document.getElementById('roster-apply');try{if(!validated||!backupId)throw new Error('Crie o backup e confira a base oficial.');if(!confirm('Reconciliar a base oficial sem excluir registros e preservando os históricos?'))return;button.disabled=true;const r=await api('/api/admin/roster-reconcile','POST',{...validated,backup_id:backupId,confirm:'RECONCILIAR SEM EXCLUIR'});validated=null;await loadStaff();drawStaff();setResult(r);flash('Atualização confirmada no banco. Backup privado preservado.','success','reconcile-alert');}catch(e){button.disabled=true;validated=null;flash(e.message,'error','reconcile-alert');}};
}
async function init(){if(location.pathname==='/confirmacao'){renderRegistrationConfirmation();return;}if(location.pathname!=='/equipe'&&location.pathname!=='/admin'){renderPublic();return;}const s=await api('/api/session');state.user=s.user;if(!state.user){state.sessionToken=null;try{sessionStorage.removeItem('enr_session')}catch{}await renderAuth();return;}if(location.pathname==='/admin'&&state.user.role!=='admin'){location.href='/equipe';return;}state.tab=location.pathname==='/admin'?'admin':'queue';await renderStaff();}
init().catch(err=>{root.innerHTML=`<section class="panel"><h1>Não foi possível abrir o painel</h1><p class="muted">${H(err.message||'Erro de conexão')}</p><a class="btn" href="/equipe">Tentar novamente</a></section>`;});
setInterval(async()=>{
 if(!state.user||document.hidden||Date.now()<state.serviceRetryAt||!document.getElementById('dashboard')||state.refreshing)return;
 state.refreshing=true;
 try{
   if(!await loadStaff(true))return;
   const c=state.stats.counts||{};
   const vals=[c.total,c.arrived,c.checked_in,c.prizes,c.shirts];
   document.querySelectorAll('.metric strong').forEach((e,i)=>e.textContent=Number(vals[i]||0));
   const pending=Math.max(0,Number(c.arrived||0)-Number(c.checked_in||0));
   const marker=document.getElementById('queue-pending');if(marker)marker.textContent='('+pending+' na recepção)';
   const banner=document.getElementById('arrival-banner');
   if(banner){banner.className='notice '+(pending?'good':'');banner.innerHTML='<strong>'+pending+' chegada(s) aguardando liberação pela equipe.</strong> A confirmação no celular registra a chegada, mas a entrada só é liberada na aba Credenciamento.';}
   if(state.tab==='queue'&&document.getElementById('participant-list')){drawRecentArrivals();drawList();}
   // Do not rerender administrative forms or overwrite in-progress observations.
 }catch(e){if(e.code==='D1_DAILY_LIMIT')flash(e.message,'error');}finally{state.refreshing=false;}
},10000);



