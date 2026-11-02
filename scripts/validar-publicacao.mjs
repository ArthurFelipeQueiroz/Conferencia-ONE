import {readFileSync} from 'node:fs';
const c=JSON.parse(readFileSync('wrangler.jsonc','utf8')),db=c.d1_databases.find(x=>x.binding==='DB');
if(!db||!db.database_id||db.database_id==='00000000-0000-0000-0000-000000000000')throw Error('Crie um D1 NOVO e preencha database_id em wrangler.jsonc.');
if(c.name!=='conferencia-one-checkin'||db.database_name!=='conferencia-one-2026')throw Error('Recursos fora do novo projeto.');
console.log('Configuração independente validada.');
