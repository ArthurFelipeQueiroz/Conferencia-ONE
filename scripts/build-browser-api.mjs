import { copyFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

if (!existsSync('docs/index.html')) throw new Error('Execute npm run build:pages primeiro.');
const source=resolve('.qa-worker/index.js');
const code=readFileSync(source,'utf8');
if(!code.includes('export')||!code.includes('DEFAULT_PUBLIC_APP_URL'))throw new Error('Compile a API atual com Wrangler antes de montar a publicação pelo navegador.');
copyFileSync(source,resolve('docs/worker.js'));
console.log('API compilada disponível no guia de instalação do GitHub Pages.');
