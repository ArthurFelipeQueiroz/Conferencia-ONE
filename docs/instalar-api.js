const copyWorker=document.getElementById('copy-worker');
const workerStatus=document.getElementById('worker-status');
const workerFallback=document.getElementById('worker-fallback');
const installToken=document.getElementById('install-token');
const tokenStatus=document.getElementById('token-status');
const generateToken=document.getElementById('generate-token');
const copyToken=document.getElementById('copy-token');

async function copyText(value, fallback, status) {
  try {
    await navigator.clipboard.writeText(value);
    status.textContent='Copiado.';
  } catch {
    fallback.hidden=false;
    fallback.value=value;
    fallback.focus();fallback.select();
    try { status.textContent=document.execCommand('copy')?'Copiado.':'Conteúdo selecionado. Copie com Ctrl+C ou pelo menu.'; }
    catch { status.textContent='Conteúdo selecionado. Copie com Ctrl+C ou pelo menu.'; }
  }
}

copyWorker.addEventListener('click',async()=>{
  copyWorker.disabled=true;
  try {
    const response=await fetch('worker.js',{credentials:'omit',cache:'no-store'});
    if(!response.ok)throw new Error('Não foi possível carregar o código. Use o botão Baixar código.');
    await copyText(await response.text(),workerFallback,workerStatus);
  } catch(error) { workerStatus.textContent=error.message; }
  finally { copyWorker.disabled=false; }
});

generateToken.addEventListener('click',()=>{
  const bytes=new Uint8Array(32);crypto.getRandomValues(bytes);
  installToken.value=Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('');
  generateToken.disabled=true;copyToken.disabled=false;
  tokenStatus.textContent='Token gerado. Guarde este mesmo valor para criar o administrador.';
});
copyToken.addEventListener('click',()=>copyText(installToken.value,installToken,tokenStatus));
