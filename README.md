# Conferência ONE | Check-in — 07/11/2026

O código e as páginas públicas pertencem ao repositório **ArthurFelipeQueiroz/Conferencia-ONE**. A API e o banco D1 são hospedados na conta Cloudflare do Gustavo.

| Parte | Local |
|---|---|
| Código e páginas | Este repositório, branch `main`, pasta `docs` |
| Painel da equipe, após ativar Pages | `https://arthurfelipequeiroz.github.io/Conferencia-ONE/equipe/` |
| Administração, após ativar Pages | `https://arthurfelipequeiroz.github.io/Conferencia-ONE/admin/` |
| API | Worker `conferencia-one-checkin`, na Cloudflare do Gustavo |
| Banco | D1 `conferencia-one-2026`, ID `bb82d5b7-e186-41bc-b13c-3f0ec6e40bae` |

## 1. Arthur: ativar as páginas

Os arquivos já estão prontos na pasta `docs`. Uma pessoa com permissão de administração do repositório deve abrir **Settings → Pages**, selecionar **Deploy from a branch**, escolher a branch **main** e a pasta **/docs**, e salvar.

O GitHub mostrará o endereço publicado após a implantação. Para o painel usar a base de dados, conclua também a publicação da API abaixo.

## 2. Gustavo: publicar a API pelo navegador

Após ativar Pages, abra `https://arthurfelipequeiroz.github.io/Conferencia-ONE/instalar-api.html`. O guia contém o código compilado e um gerador privado de token; não é necessário instalar programas.

1. Na sua Cloudflare, abra o Worker existente **conferencia-one-checkin**.
2. Em **Settings → Builds**, desconecte o repositório **ENRAIZADOS** deste Worker. O ENRAIZADOS original usa outro Worker.
3. No guia, clique em **Copiar código da API**. No Worker, abra **Edit code**, substitua o arquivo principal e clique em **Deploy**.
4. Confira a vinculação D1: variável **DB**, banco **conferencia-one-2026**. Use o banco já criado, com o ID da tabela acima.
5. Gere o token no guia. Em **Settings → Variables and Secrets** do Worker, adicione **Secret**, nome **BOOTSTRAP_TOKEN**, valor igual ao token gerado; salve e implante.
6. Abra o painel da equipe pelo GitHub Pages, informe esse token, escolha usuário com pelo menos 4 caracteres e senha com pelo menos 12 caracteres, e crie o administrador.
7. Faça login. Depois remova o segredo **BOOTSTRAP_TOKEN** do Worker e confirme a implantação.

A API direciona os endereços antigos de páginas para o GitHub do Arthur. O CORS permite o frontend `https://arthurfelipequeiroz.github.io`; a autenticação continua exigida nas rotas de equipe. O painel usa a sessão por cabeçalho quando acessado no GitHub, sem depender de cookies de terceiros.

## 3. Importar inscrições

Importe somente cadastros da Conferência ONE pelo painel administrativo. Dados pessoais, senhas, planilhas privadas e backups não devem ser enviados ao repositório público.

O formato de importação está no arquivo `modelo-inscricoes.csv`, que contém apenas um exemplo fictício. O conversor `scripts/csv-para-json.mjs` continua disponível para preparar o arquivo privado. Faça a conferência no painel antes de aplicar a importação.

## Desenvolvimento

- Interface editável: `public/`.
- Frontend publicado: `docs/`, gerado por `npm run build:pages`.
- API: `src/index.ts`, `src/web-origin.mjs` e `src/reconciliation.mjs`.
- Configuração D1 e URL pública: `wrangler.jsonc`.
- Validação: `npm run check`, `npm test` e `npm run test:integration`.
- Compilação para publicação pelo navegador: `npm run build:pages && npm run build:browser-api`.

Depois de editar a interface ou API, gere novamente os arquivos de `docs/` e confirme os testes antes de publicar. O comando `npm run deploy` também pode ser usado em um ambiente de desenvolvimento autorizado para a conta Cloudflare do Gustavo.

Não reutilize bancos, credenciais ou integrações do ENRAIZADOS. Brindes, camisetas e WhatsApp automático herdados do outro evento permanecem desativados na API desta cópia.

