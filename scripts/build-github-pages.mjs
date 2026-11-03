import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const PAGES_BASE = '/Conferencia-ONE';
export const API_ORIGIN = 'https://conferencia-one-checkin.gustavo-marques-lopes.workers.dev';

function browserHref(path) {
  if (path.startsWith('/api/')) return API_ORIGIN + path;
  const route = ['/checkin', '/confirmacao', '/equipe', '/admin', '/qr-impressao'].includes(path);
  return PAGES_BASE + path + (route ? '/' : '');
}

function assetPaths(content) {
  return content.replace(/\b(href|src)="(\/[^"\s]*)"/g, (_, attribute, path) =>
    `${attribute}="${browserHref(path)}"${attribute === 'href' && path.startsWith('/api/admin/') ? ' data-one-download' : ''}`);
}

function securePage(html) {
  const csp = `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: ${API_ORIGIN}; connect-src 'self' ${API_ORIGIN}; object-src 'none'; base-uri 'none'; form-action 'self'`;
  return assetPaths(html).replace('<head>', `<head><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="no-referrer">`);
}

export function buildGithubPages({ outDir = resolve(repositoryRoot, 'docs') } = {}) {
  mkdirSync(outDir, { recursive: true });
  const read = file => readFileSync(resolve(repositoryRoot, 'public', file), 'utf8');
  const write = (file, content) => {
    const path = resolve(outDir, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  };
  const index = securePage(read('index.html'));
  write('index.html', index);
  for (const route of ['checkin', 'confirmacao', 'equipe', 'admin']) write(`${route}/index.html`, index);
  write('qr-impressao/index.html', securePage(read('qr-impressao.html')));
  write('instalar-api.html', securePage(read('instalar-api.html')));
  for (const file of ['styles.css', 'evento-arte.svg', 'qr-print.js', 'instalar-api.js']) {
    copyFileSync(resolve(repositoryRoot, 'public', file), resolve(outDir, file));
  }
  let app = read('app.js')
    .replaceAll("fetch(path,{", "fetch(ONE_API_ORIGIN+path,{")
    .replaceAll("fetch('/api/", "fetch(ONE_API_ORIGIN+'/api/")
    .replaceAll('location.pathname', 'oneRoutePath()')
    .replace(/location\.href=(['"])(\/[^'"]*)\1/g, (_, quote, path) => `location.href=${quote}${browserHref(path)}${quote}`);
  app = assetPaths(app);
  const paths = `const ONE_API_ORIGIN=${JSON.stringify(API_ORIGIN)};
function oneRoutePath(){const base=${JSON.stringify(PAGES_BASE)};let path=location.pathname;if(path===base||path.startsWith(base+'/'))path=path.slice(base.length);return path.replace(/\\/index\\.html$/,'').replace(/\\/$/,'')||'/';}
`;
  const downloads = `
document.addEventListener('click',async event=>{
 const anchor=event.target instanceof Element?event.target.closest('a[data-one-download]'):null;
 if(!anchor)return;
 event.preventDefault();
 const target=new URL(anchor.href);
 if(target.origin!==ONE_API_ORIGIN||!target.pathname.startsWith('/api/admin/'))return;
 try{
   const response=await fetch(target.href,{credentials:'same-origin',headers:state.sessionToken?{'x-jovens-session':state.sessionToken}:{}});
   if(!response.ok)throw new Error('Não foi possível baixar o arquivo. Entre novamente no painel.');
   const link=document.createElement('a');const address=URL.createObjectURL(await response.blob());
   link.href=address;link.download='Conferencia_ONE_'+target.pathname.split('/').pop();
   document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(address),1000);
 }catch(error){flash(error.message,'error');}
});
`;
  write('app.js', paths + app + downloads);
  write('.nojekyll', '');
  return { outDir, publicUrl: `https://arthurfelipequeiroz.github.io${PAGES_BASE}/` };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(buildGithubPages()));
}
