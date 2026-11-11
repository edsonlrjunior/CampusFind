# Relatório de segurança do MVP CampusFind

Data: 11/11/2026. Referência: **OWASP Top 10:2025 para aplicações web**.
Base: commit `fa02726` e arquivos locais modificados presentes no início da revisão. A auditoria considerou o conteúdo de trabalho, não apenas esse commit.

## Escopo e método

Foram revisados `app/src`, dependências npm, configuração Vite/Vercel, migrações Supabase e protótipo estático. O sistema usa React no navegador, Supabase Auth, PostgreSQL com RLS e Storage público para fotos. Sem Supabase, há uma implementação de demonstração em localStorage.

As fronteiras principais são: visitante → dados públicos; usuário autenticado → contatos e anúncios; autor → alterações do próprio anúncio; navegador → banco/Storage; dependências de desenvolvimento → máquina do desenvolvedor e build.

O trabalho combina revisão estática, testes locais com dados fictícios e consulta de avisos npm. Os critérios de evidência foram inspirados na [skill da Cloudflare](https://github.com/cloudflare/security-audit-skill): separar problema demonstrado, hipótese dependente de ambiente e defesa adicional. **Não foi executado o fluxo integral dessa skill**, nem sua validação independente por agentes e schemas. Não houve teste de exploração em produção, acesso a contas reais, deploy ou alteração do Supabase remoto. Esta revisão não é certificação de conformidade nem prova de ausência de outras falhas.

## Resultado

| ID | Problema ou fraqueza constatada | Categoria 2025 | Prioridade contextual | Situação |
|---|---|---|---|---|
| SEC-01 | Política de contatos permite ler perfis sem vínculo com anúncio ativo | A01 — Broken Access Control | Média | Migração corretiva criada; execução SQL pendente |
| SEC-02 | Produção entra automaticamente no backend de demonstração se faltar uma credencial | A02 — Security Misconfiguration; A06 — Insecure Design | Média, condicionada a configuração incompleta | Corrigido e testado localmente |
| SEC-03 | Ferramentas de desenvolvimento com avisos conhecidos e ausência de lockfile versionado | A03 — Software Supply Chain Failures | Alta para manutenção do ambiente; exploração não demonstrada | Atualizadas; nova auditoria necessária a cada atualização |
| SEC-04 | Limite de descrição pode ser contornado pela API direta | A06 — Insecure Design | Baixa; integridade da regra de negócio | Constraint criada; execução SQL pendente |

Os alertas npm descrevem severidades dos pacotes. Não significam que o site estático tenha execução remota crítica: os caminhos dependem de servidores de desenvolvimento/teste e outras condições específicas. Não se confirmou vulnerabilidade crítica explorável no site publicado.

## SEC-01 — Exposição excessiva de contatos

**Evidência anterior:** `001_schema.sql` criava `usuario_select_autenticado` com `for select to authenticated using (true)`. Em `supabaseBackend.js`, a interface consulta um único autor, mas esse filtro no cliente não impede consultar a tabela inteira pela Data API. Não há política de escrita de perfis que compense a leitura ampla. A implementação local também retornava qualquer contato após login.

**Cenário:** em uma base fictícia com A (anúncio ativo), B (somente anúncio resolvido) e C (sem anúncio), uma conta autenticada podia obter nome, email e telefone dos três. O risco adicional é a coleta dos contatos de B e C fora do fluxo de contato de um anúncio disponível.

**Critério adotado:** RF08 exige contato do autor; a correção aplica menor privilégio: ler o próprio perfil ou contato de quem possui anúncio ativo. Esse refinamento restringe a regra anterior, que só exigia autenticação. Os contatos de autores ativos continuam intencionalmente acessíveis a usuários autenticados; a correção não impede toda coleta desses contatos.

**Correção:** migração `003_security_hardening.sql` substitui a política permissiva por `id = auth.uid() OR EXISTS(publicacao ativa do autor)`. A implementação de demonstração acompanha a regra. O próprio perfil continua disponível para carregar a sessão. O teste local falhou retornando o contato de uma conta sem anúncio e passou após a alteração. A política SQL foi revisada estaticamente; sua execução e os grants efetivos precisam ser validados em Supabase local.

## SEC-02 — Fallback inseguro em produção

**Evidência anterior:** `api.js` usava `isDemo = !(url && key)` em todos os ambientes. Uma única variável ausente ativava localStorage e contas demonstrativas. Esse backend permite alterar a identidade editando o armazenamento e mantém hashes rápidos de senhas. Essas características são adequadas somente à simulação com dados fictícios.

**Impacto:** uma implantação mal configurada podia receber cadastros reais em um armazenamento local sem autoridade de servidor e aparentar autenticação operacional. Não foi demonstrado acesso ao Supabase de terceiros por esse caminho; o problema é a seleção silenciosa de um sistema sem os controles esperados.

**Correção:** `backendConfig.js` rejeita configuração parcial e produção sem Supabase. Uma demonstração publicada exige `VITE_DEMO_MODE=true` e ausência das duas credenciais. Credenciais completas selecionam o backend real. O bloqueio ocorre ao inicializar o módulo da aplicação; o build pode gerar arquivos mesmo sem credenciais. Desenvolvimento sem ambas as variáveis continua permitido. Cinco testes cobrem a matriz, incluindo três falhas observadas antes da correção.

**Risco residual:** demonstração continua sem autenticação confiável e não deve receber senhas usadas em outros serviços, contatos ou fotos reais. A opção explícita não transforma localStorage em backend seguro.

## SEC-03 — Dependências vulneráveis

**Evidência:** não havia `app/package-lock.json` versionado. A primeira resolução/auditoria registrou seis pacotes afetados: `vite`, `vitest`, `vite-node`, `@vitest/mocker`, `esbuild` e `tinypool`, com três alertas moderados, um alto e dois críticos na contagem de pacotes npm. Exemplos de condições descritas pelos avisos: acesso ao servidor UI do Vitest, caminhos especiais no servidor Vite e opções de workers com pré-condições de poluição de protótipo. Não foram reproduzidas essas explorações.

**Correção:** versões diretas fixadas em Vite `8.3.8`, Vitest `4.1.12` e plugin React `5.2.0`; lockfile com integridade e árvore resolvida criado. Node exigido: `^22.12.0 || >=24.0.0`. A atualização foi feita com scripts de instalação desativados e seguida por testes e build. Preferir `npm ci` para reproduzir a árvore.

**Limite:** resultado sem avisos conhecidos é uma consulta temporal ao registro npm, não comprovação de que todos os pacotes sejam seguros. O lockfile reduz variação; não substitui revisão de novos pacotes nem protege contra todo comprometimento de fornecedor.

## SEC-04 — Validação restrita ao formulário

**Evidência:** `validation.js` limita `descricao` a 2.000 caracteres; `001_schema.sql` declara `text` com apenas uma condição de não vazio. Usuário autenticado pode enviar seu próprio anúncio diretamente pela API sem passar pelo formulário e persistir conteúdo acima do limite. RLS restringe a autoria, mas não o tamanho.

**Impacto demonstrável pelo código:** violação de uma regra de integridade e armazenamento de conteúdo além do previsto. Não se demonstrou indisponibilidade ou esgotamento de recursos; esses impactos não são atribuídos como confirmados.

**Correção:** CHECK `char_length(btrim(descricao)) <= 2000` na migração incremental. `NOT VALID` evita apagar/truncar registros antigos e já aplica o limite a novas inserções/atualizações. Revisar registros legados e validar a constraint antes de considerar todo o acervo conforme. O teste SQL preparado inclui os limites de 2.000/2.001 caracteres, mas ainda não foi executado.

## Cobertura das dez categorias

| Categoria oficial | Revisão e conclusão limitada ao escopo |
|---|---|
| A01:2025 Broken Access Control | SEC-01. Revisadas políticas de autoria, anúncios ativos/resolvidos e pastas de upload por UID. RLS já protege escrita de anúncios alheios no código SQL; teste efetivo de banco pendente. |
| A02:2025 Security Misconfiguration | SEC-02. HSTS, nosniff e bloqueio de frames já existiam. CSP e Permissions-Policy adicionadas como defesa adicional, sem atribuir exploração à sua ausência. Cabeçalhos efetivos dependem de deploy. |
| A03:2025 Software Supply Chain Failures | SEC-03. Auditoria npm, atualização das ferramentas e lockfile. Infraestrutura de CI, proteção de branches e permissões da conta de hospedagem não foram verificadas. |
| A04:2025 Cryptographic Failures | Demonstração usa SHA-256 rápido e dados editáveis no localStorage, restritos agora por seleção explícita. Backend real delega senha ao Supabase Auth. Não foi verificada criptografia/backup/configuração TLS do serviço remoto. Nenhum segredo administrativo foi reproduzido no relatório. |
| A05:2025 Injection | React renderiza texto sem `dangerouslySetInnerHTML`; filtros usam parâmetros da biblioteca, e a busca remove metacaracteres antes do `.or`. Protótipo usa innerHTML com fixtures fixas, sem entrada persistida de terceiros identificada. Não foi confirmada SQL injection ou XSS neste percurso. |
| A06:2025 Insecure Design | SEC-02 e SEC-04. Fotos são públicas por decisão do bucket: resolver anúncio não torna sua URL privada. Não publicar documentos ou dados sensíveis em fotos. Não se alterou esse contrato para bucket privado. |
| A07:2025 Authentication Failures | Login real valida usuário no servidor; cliente apresenta erro genérico de credenciais e trata 429. Demonstração não autentica com segurança. Confirmação de email, força de senha, CAPTCHA e limites reais exigem conferência no Supabase; uma pausa de UI não é rate limiting do servidor. |
| A08:2025 Software or Data Integrity Failures | RLS e triggers impõem autoria/tipo/status; localStorage é adulterável por desenho da demo. Lockfile acrescentado. Não há webhook, desserialização executável ou mecanismo de atualização próprio identificado no MVP. |
| A09:2025 Security Logging and Alerting Failures | Há erros no console, mas isso não comprova trilha de auditoria ou alertas operacionais. Retenção, alertas e logs de Auth/banco precisam ser verificados no provedor. Registrar apenas eventos mínimos, nunca senha, token ou corpo completo do cadastro. |
| A10:2025 Mishandling of Exceptional Conditions | Revisados erros de autenticação, API e upload. SEC-02 passa a rejeitar configuração parcial. Falha de gravação de anúncio com imagem pode demandar limpeza de objetos órfãos; não se demonstrou efeito entre usuários. Não foi afirmada resistência completa a falhas do provedor. |

Uma categoria sem falha confirmada continua sujeita a revisão futura. A avaliação de configurações externas fica **pendente, sem severidade atribuída**: ausência de evidência no repositório não comprova ausência do controle em produção.

## Referências

- [OWASP Top 10:2025 — lista oficial](https://top10.owasp.org/2025/)
- [Cloudflare security-audit-skill](https://github.com/cloudflare/security-audit-skill)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Aviso Vitest UI](https://github.com/advisories/GHSA-5xrq-8626-4rwp)
- [Aviso esbuild](https://github.com/advisories/GHSA-67mh-4wv8-2f99)

As alterações, comandos, resultados e etapas restantes estão em [Correções de segurança](07-correcoes-seguranca.md).
