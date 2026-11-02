# Conferência ONE | Check-in — 07/11/2026

Código adaptado do sistema de check-in ENRAIZADOS, preparado para ser hospedado de maneira **independente** pela equipe da Conferência ONE. O banco de dados e o projeto original permanecem intactos.

**Repositório de destino:** https://github.com/ArthurFelipeQueiroz/Conferencia-ONE

## Funciona com
- Frontend HTML/CSS/JavaScript; backend TypeScript em Cloudflare Workers; banco Cloudflare D1.
- Páginas `/checkin` (QR público), `/equipe` (recepção) e `/admin` (administradores).
- Busca por nome e telefone, confirmação de chegada, liberação manual, relatórios e importação de inscrições.
- Funcionalidades exclusivas do ENRAIZADOS — premiação, vendas/entregas de camisetas e Evolution API — desativadas para não usar dados ou integrações de outro evento.

## Enviar ao GitHub ArthurFelipeQueiroz/Conferencia-ONE
O repositório de destino foi encontrado **vazio e público** em 02/11/2026. Baixe esta branch em ZIP, extraia os arquivos e envie o conteúdo da pasta extraída para a raiz do repositório usando **Add file → Upload files**. Não envie o ZIP fechado como arquivo da aplicação e não inclua o diretório `.git` do repositório de origem. 

Alternativamente, após extrair, execute na pasta do código (em uma conta que tenha permissão de escrita):

```bash
git init
git add .
git commit -m "Check-in Conferencia ONE 2026"
git branch -M main
git remote add origin https://github.com/ArthurFelipeQueiroz/Conferencia-ONE.git
git push -u origin main
```

O repositório público pode conter o **código**, mas nunca dados de participantes, especialmente menores, senhas, planilhas privadas ou backups.

## Publicar com Cloudflare Workers + D1
GitHub **não hospeda sozinho** este backend com banco D1. Na conta **Cloudflare da organização**:

1. Instale Node.js 22, execute `npm ci`, `npm run check` e `npm test`.
2. Faça login: `npx wrangler login`.
3. Crie D1 exclusivo: `npx wrangler d1 create conferencia-one-2026`.
4. Atualize `database_id` em `wrangler.jsonc` com o ID retornado pelo comando. Não reutilize o D1 do ENRAIZADOS.
5. Aplique migrações: `npm run db:remote`.
6. Configure segredo de bootstrap: `npx wrangler secret put BOOTSTRAP_TOKEN` (valor aleatório >=32 caracteres; guarde fora do GitHub).
7. Publique: `npm run deploy`.
8. Acesse `/equipe` na URL `*.workers.dev` retornada, cadastre o primeiro administrador e remova o bootstrap com `npx wrangler secret delete BOOTSTRAP_TOKEN`.
9. Importe cadastros **exclusivos da Conferência ONE**, crie operadores e teste o fluxo completo em dois celulares antes do dia 7.

## Importar inscritos de forma privada
Utilize um CSV privado com colunas `nome;telefone;idade;responsavel;igreja`, como no arquivo `modelo-inscricoes.csv` que contém apenas um exemplo fictício. Gere o JSON local com `node scripts/csv-para-json.mjs caminho/inscritos.csv`; o arquivo gerado fica em `arquivos-privados/`, ignorado pelo Git. Importe via `/admin`, confirmando a prévia. A importação atual suporta até 200 pessoas por arquivo. Não reordene linhas já importadas.

## Personalização
- Visual: `public/evento-arte.svg`, `public/index.html`, `public/qr-impressao.html` e `public/styles.css`.
- Conteúdos e fluxo de interface: `public/app.js`.
- Data e regras: `src/index.ts`, `scripts/csv-para-json.mjs`.
- Recursos Cloudflare: `wrangler.jsonc`.

**Antes da operação:** teste cadastro de menores e autorização de responsáveis, login, importação, busca, QR, check-in, relatórios e tratamentos de erros. Esta versão não está publicada no Cloudflare do Arthur e requer homologação em ambiente próprio.
