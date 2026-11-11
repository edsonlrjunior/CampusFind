# CampusFind — aplicação web

SPA em React + Vite (ADR-001) com Supabase (ADR-002), pronta para a Vercel (ADR-003).

## Rodar localmente

Requer Node.js 22.12 ou superior na linha 22, ou Node.js 24 ou superior.

```bash
cd app
npm ci
npm run dev        # http://localhost:5173
npm test           # testes unitários (Vitest)
npm run test:browser # testes de login e redirecionamento em navegador headless
npm run build      # gera dist/
```

Em desenvolvimento, sem as duas variáveis do Supabase, o app abre em **modo demonstração**: dados fictícios salvos no navegador e a conta `demo@campusfind.app` / `demo1234`. Não use dados pessoais ou senhas reais. Configuração parcial é rejeitada. Em produção, o app exige Supabase ou a opção explícita `VITE_DEMO_MODE=true` com ambas as credenciais ausentes.

Os testes de navegador exigem Node.js 22 ou superior e usam dados de demonstração isolados, sem acessar o Supabase,
mesmo quando as variáveis de ambiente estão configuradas. Eles detectam Edge/Chrome
nos caminhos usuais do Windows e Chromium/Chrome no Linux; para outro caminho,
defina `CHROME_BIN` com o executável do navegador.

## Conectar ao Supabase

1. Crie um projeto em <https://supabase.com>.
2. No **SQL Editor**, execute, nesta ordem:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_seed_categorias.sql`
   - `supabase/migrations/003_security_hardening.sql`
3. Em **Authentication > Sign In / Providers > Email**, desative **Confirm email**
   e salve. O cadastro deve criar a conta e iniciar a sessão sem envio de e-mail;
   o login usa e-mail e senha. Essa configuração remota é necessária para que a
   cota de e-mails não seja pré-requisito de cadastro nem login no CampusFind.
4. Em **Project Settings > API**, copie a *Project URL* e a chave *anon public*.
5. Crie `app/.env.local` a partir de `.env.example`:

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

6. Rode `npm run dev` novamente. A faixa "Modo demonstração" deve sumir.

A chave *anon* é pública por natureza; a proteção dos dados vem das políticas RLS da migração. **Nunca** use a chave *service_role* no front-end.

## Erro `email rate limit exceeded`

Esse erro vem do Supabase Auth (`429`, `over_email_send_rate_limit`). O serviço
de e-mail padrão tem um limite de 2 mensagens por hora para todo o projeto;
cadastros que precisam de confirmação consomem essa cota. O limite é configurado
no serviço e não é removido por uma mudança no React ou nas tabelas.

Para cadastrar e autenticar sem depender de envio de e-mails, abra o projeto no painel
do Supabase e vá a **Authentication > Sign In / Providers > Email**, desative
**Confirm email** e salve. Novos cadastros passam a entrar automaticamente.
Essa decisão dispensa comprovar a posse do e-mail; habilitar a confirmação
obrigatória novamente reintroduz a dependência do serviço de envio.

Se a política de autenticação mudar para exigir confirmação, configure um **SMTP próprio**
em **Authentication > Email > SMTP Settings** e ajuste a cota em
**Authentication > Rate Limits**, conforme os limites do provedor escolhido.

O app identifica a falha de envio e mostra uma mensagem em português, mas não
bloqueia o formulário nem inicia uma contagem regressiva por esse motivo.
Não há reenvio automático. Pausas antigas por e-mail são descartadas.
O limite de requisições de autenticação (`over_request_rate_limit`) continua
recebendo uma pausa de 60 segundos, independente da cota de e-mails.
Login e cadastro também impedem requisições simultâneas do formulário.

O front-end só autentica após uma resposta válida do Supabase. Ele não transforma
um erro de envio em cadastro bem-sucedido e não cria uma sessão fictícia.

Referências: [testes de autenticação](https://supabase.com/docs/guides/auth/testing-auth-flows),
[SMTP próprio](https://supabase.com/docs/guides/auth/auth-smtp) e
[limites de autenticação](https://supabase.com/docs/guides/auth/rate-limits).

## Publicar na Vercel

1. Importe o repositório na Vercel.
2. Em **Root Directory**, selecione `app`.
3. Em **Environment Variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Faça o deploy. Cada push na branch principal gera uma nova versão.

O `vercel.json` já define o build e cabeçalhos de segurança (HSTS, `nosniff`, `X-Frame-Options`). Como as rotas usam `#`, não é preciso configurar reescritas.

Também foram adicionadas CSP e Permissions-Policy. A CSP permite o Supabase em
`*.supabase.co` e as fontes Google usadas pelo projeto. Se usar domínio próprio
para o Supabase, ajuste `connect-src` e `img-src` para a origem exata.
Confira os cabeçalhos na hospedagem após o deploy; `vite preview` não aplica
automaticamente os cabeçalhos do arquivo Vercel.

O cadastro sem confirmação de email descrito acima é uma escolha do MVP acadêmico.
Para uso com pessoas reais, configure confirmação de posse de email e SMTP,
limites de autenticação no servidor e monitoração no Supabase. Não trate a
pausa visual do formulário como controle contra força bruta.

## Auditoria de segurança

Veja o [relatório OWASP Top 10:2025](../docs/06-relatorio-seguranca-owasp-2025.md)
e o [registro das correções e validação](../docs/07-correcoes-seguranca.md).

## Rotas

| Rota | Tela | HU |
|---|---|---|
| `#/` | Início, busca e filtros | HU05, HU06 |
| `#/entrar` | Login | HU02 |
| `#/cadastro` | Cadastro | HU01 |
| `#/nova` | Nova publicação (protegida) | HU03, HU04 |
| `#/publicacao/:id` | Detalhes e contato | HU07, HU09 |
| `#/publicacao/:id/editar` | Edição (protegida, só autor) | HU08 |
| `#/minhas` | Minhas publicações (protegida) | HU09, HU10 |
