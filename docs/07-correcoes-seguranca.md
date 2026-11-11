# Correções de segurança e validação

Data: 11/11/2026. Relacionado ao [relatório OWASP Top 10:2025](06-relatorio-seguranca-owasp-2025.md).

## Alterações realizadas

| Achado | Arquivos | Como foi corrigido |
|---|---|---|
| SEC-01 | `supabase/migrations/003_security_hardening.sql`, `app/src/services/localBackend.js` | Removida política de leitura irrestrita para autenticados. Contato disponível somente do próprio perfil ou de autor com anúncio ativo. Implementação local acompanha o refinamento. |
| SEC-02 | `app/src/lib/backendConfig.js`, `app/src/services/api.js`, `app/.env.example` | Configuração parcial provoca erro; produção sem Supabase exige demonstração explicitamente habilitada. Desenvolvimento sem credenciais segue funcionando. |
| SEC-03 | `app/package.json`, `app/package-lock.json` | Vite 8.3.8, Vitest 4.1.12 e plugin React 5.2.0; requisito de Node atualizado; árvore de dependências e integridades registradas. |
| SEC-04 | `supabase/migrations/003_security_hardening.sql` | CHECK no banco impede novas descrições com mais de 2.000 caracteres após trim, inclusive por REST direto. Dados antigos são preservados para revisão. |
| Defesa adicional | `app/vercel.json` | CSP restringe scripts à própria origem, recursos às origens necessárias, objetos e enquadramento; Permissions-Policy desabilita câmera, microfone e geolocalização. |

Não foram reescritas as migrações 001 e 002. As alterações locais já existentes foram preservadas. Não houve commit, push, deploy nem aplicação remota de migrações.

## Validação executada

O shell WSL não possuía Node Linux e inicialmente bloqueou a chamada ao Node Windows. Após autorização para execução externa ao sandbox, os comandos foram executados com o Node Windows `v24.8.0` já instalado e dependências locais. Os testes de navegador usaram perfis temporários e backend demonstrativo, sem acesso ao Supabase. A consulta npm acessou o registro de avisos; as explorações descritas pelos avisos não foram executadas.

| Verificação | Resultado observado |
|---|---|
| Testes de configuração antes da correção | 3 falhas e 2 sucessos: produção e configuração parcial não eram rejeitadas |
| Teste de contato antes da correção | Falhou: retornou email e telefone do usuário fictício sem anúncio |
| Testes unitários após correções e atualização | **33/33 passaram**, em 4 arquivos, Vitest 4.1.12 |
| Testes de navegador após atualização | **20/20 passaram**, incluindo login, cadastro, retorno seguro e tratamento de 429 |
| Build de produção | Sucesso com Vite 8.3.8, 90 módulos transformados |
| `npm audit --json` antes | 6 pacotes afetados: 3 moderados, 1 alto, 2 críticos |
| `npm audit --json` depois | **0 vulnerabilidades conhecidas**, código de saída 0 |
| Migração e testes SQL | Revisão estática realizada; **não executados** por ausência de PostgreSQL/Supabase local configurado |
| CSP/Permissions-Policy na hospedagem | Arquivo configurado; comportamento efetivo no deploy **não verificado** |

Os comandos equivalentes em um terminal com Node configurado são:

```bash
cd app
npm ci --ignore-scripts
npm test
npm run test:browser
npm run build
npm audit --json
```

A instalação realizada usou `--ignore-scripts`. A árvore resultante foi usada nos testes e no build. Os comandos de teste/build foram chamados diretamente pelos executáveis JavaScript de Vitest/Vite porque o lançador `npm` do WSL não conseguia iniciar o Node Windows. `npm ci` como reinstalação limpa não foi executado nesta revisão.

## Aplicar e validar o banco

Primeiro use uma instância **local descartável** de Supabase, com as migrações 001, 002 e 003 aplicadas nessa ordem. O arquivo de teste cria usuários fictícios e termina com rollback; qualquer falha deve abortar o comando.

```bash
# Na raiz do repositório. LOCAL_DATABASE_URL deve apontar ao Supabase LOCAL.
psql "$LOCAL_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/security.sql
```

O teste verifica: anônimo sem contato; anúncio resolvido oculto; próprio perfil visível; contato de autor ativo disponível; contato sem anúncio ativo oculto; edição e criação em nome de terceiros bloqueadas; descrição de 2.000 aceita e de 2.001 rejeitada. Este roteiro ainda precisa de execução: testes da implementação de demonstração não comprovam as políticas do banco.

Depois da validação local, aplicar `003_security_hardening.sql` em ambiente de homologação e seguir o processo de publicação do projeto. Para uma base existente, executar apenas a migração nova; não recriar o banco.

O CHECK foi criado com `NOT VALID`: novas escritas são verificadas imediatamente, mas registros antigos podem exceder o limite. Um administrador deve identificar e revisar esses registros sem apagá-los automaticamente:

```sql
select id, char_length(btrim(descricao)) as caracteres
from public.publicacao
where char_length(btrim(descricao)) > 2000;

-- Depois da revisão/correção autorizada dos dados legados:
alter table public.publicacao
  validate constraint publicacao_descricao_limite;
```

Ao atualizar um registro legado que ainda exceda o limite, será necessário ajustar a descrição, inclusive se a atualização pretendida for apenas encerrar o anúncio. A constraint não foi aplicada remotamente nesta sessão.

## Configurar a publicação

Para operação real, informar as duas variáveis públicas do Supabase no build: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Nunca usar chave administrativa ou `service_role` em variáveis `VITE_*`. Produção sem essas variáveis falha ao iniciar o app; o build isoladamente pode concluir sem elas.

Para uma apresentação acadêmica publicada, remover as duas credenciais e definir explicitamente `VITE_DEMO_MODE=true` antes do build. Usar somente dados fictícios. O login local continua editável pelo navegador e os hashes locais não são apropriados para armazenamento de senhas reais.

Após o deploy, conferir CSP, Permissions-Policy e os cabeçalhos existentes no painel de rede do navegador. Testar carregamento de fontes, login, imagem de prévia e imagem do Storage. A política permite `*.supabase.co`; domínios próprios exigem ajuste explícito. Ela não autoriza scripts inline nem `eval`. O protótipo estático em `prototipo/` não faz parte do diretório de publicação do MVP.

## Pendências dependentes do ambiente

- Executar teste SQL local, aplicar migração em homologação e validar dados legados.
- Confirmar grants e políticas efetivamente instalados: políticas extras permissivas no projeto remoto podem ampliar o acesso.
- Verificar limites de autenticação, confirmação de email/SMTP e proteção contra abuso no Supabase. A configuração acadêmica sem confirmação foi preservada e documentada; não comprova posse do endereço.
- Conferir logs de autenticação, retenção e alertas operacionais. Console do navegador não substitui monitoração do serviço.
- Avaliar retenção de fotos públicas e limpeza de uploads órfãos. Marcar anúncio como resolvido não revoga a URL pública da foto.

Essas pendências têm validação externa não realizada, sem alegação de vulnerabilidade remota confirmada. As correções de código estão disponíveis para revisão; as mudanças de banco e de cabeçalhos só passam a proteger o serviço após aplicação/deploy e verificação correspondente.
