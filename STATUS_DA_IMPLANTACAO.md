# Conferência ONE — situação em 03/11/2026

O VOZ foi mantido em seu projeto original.

Concluído:
- Banco próprio PostgreSQL no Neon, projeto conferencia-one-2026, região São Paulo.
- API publicada na Vercel, projeto conferencia-one-api.
- 121 inscrições importadas após autorização explícita. Conferência de integridade da carga aprovada.
- Administrador criado somente para a ONE. Credenciais entregues em arquivo privado separado.
- Login, sessão, listagem de 121 inscritos, totais do painel e logout validados na API publicada.
- 18 verificações locais aprovadas; chegada, check-in, cadastro presencial, comunicação, backup e QR verificados com dados fictícios em ambiente isolado.
- Perfis e brindes não são inferidos pela posição da pessoa na planilha.

Dados a completar pela equipe:
- Telefone e idade não constam da origem e permanecem vazios.
- 66 pessoas solicitaram camiseta; 45 tamanhos estão pendentes.

GitHub:
- O repositório continua pertencendo a ArthurFelipeQueiroz/Conferencia-ONE.
- Interface publicada a partir da pasta docs, na branch main. A configuração de GitHub Pages permanece no repositório do Arthur.
- Para atualizações futuras, gerar novamente docs com npm run build e publicar o código na main. As credenciais e os inscritos ficam fora do repositório.
- Este pacote contém apenas código e páginas públicas; inscrições, tokens individuais, senhas e credenciais de banco não foram incluídos.

A API e o banco utilizam temporariamente a conta do Gustavo. A transferência para o Arthur pode ser feita depois, separadamente em cada serviço. Não é necessário alterar o VOZ.
