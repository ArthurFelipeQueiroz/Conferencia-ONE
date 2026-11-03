# Conferência ONE · 07/11/2026

Painel de credenciamento e administração para o ministério de jovens.

## Estrutura

- Código e painel: ArthurFelipeQueiroz/Conferencia-ONE, GitHub Pages, pasta docs.
- API: Vercel, projeto conferencia-one-api, Node.js 22.
- Banco: PostgreSQL 17 no Neon, projeto conferencia-one-2026, banco one, região São Paulo.
- O VOZ e a Jornada Diaconal pertencem a projetos separados.

## Publicação

Instalar dependências com npm ci; executar npm run check, npm test e npm run build.
Configurar DATABASE_URL como segredo de produção na Vercel e PUBLIC_APP_URL como https://arthurfelipequeiroz.github.io/Conferencia-ONE.
A API está em api/index.ts. O adaptador PostgreSQL usa consultas parametrizadas e transações Serializable com repetição em conflitos de concorrência.
A estrutura inicial para um banco vazio está em postgres/schema.sql.
As migrações da pasta migrations são histórico da versão anterior em D1; não devem ser executadas no Neon.

## Dados e acesso

Os inscritos e as credenciais são privados e ficam fora deste repositório. O administrador recebe suas credenciais separadamente. Nenhuma conexão de banco, senha, token de instalação ou lista de participantes deve ser enviada ao GitHub.
As consultas, check-in, entregas, exportações e funções administrativas exigem uma sessão e o perfil autorizado.
O navegador se conecta à API e não recebe a credencial do banco.
A consulta pública exige nome completo e contato, ou um ticket individual. Os dados ausentes na planilha devem ser conferidos pela equipe.

## Validação

npm test executa verificações de origem, sessão, rotas públicas, geração do GitHub Pages e parametrização de SQL.
O teste tests/postgres.integration.mjs exige ONE_TEST_SECRETS apontando a um arquivo privado que contenha qa_database_url. A conexão precisa ser diferente da produção. Ele cria apenas cadastros sintéticos em uma branch isolada de testes.

## Entrega ao Arthur

O código e o endereço do GitHub já pertencem ao Arthur. O projeto Neon foi criado diretamente no Neon, fora de uma organização gerenciada pela Vercel, para permitir transferência de titularidade. A transferência do banco e a da hospedagem da API são etapas separadas. O projeto Neon possui uma branch de produção main e uma branch de testes one-qa-synthetic.
