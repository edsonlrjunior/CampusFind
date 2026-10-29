# CampusFind — aplicação web

SPA em React + Vite (ADR-001) com Supabase (ADR-002), pronta para a Vercel (ADR-003).

## Rodar localmente

Requer Node.js 18 ou superior.

```bash
cd app
npm install
npm run dev        # http://localhost:5173
npm test           # testes unitários (Vitest)
npm run test:browser # testes de login e redirecionamento em navegador headless
npm run build      # gera dist/
```

Sem o arquivo `.env.local`, o app abre em **modo demonstração**: dados de exemplo salvos no navegador e a conta `demo@campusfind.app` / `demo1234`. Ótimo para apresentar e testar sem configurar nada.

Os testes de navegador exigem Node.js 22 ou superior e usam dados de demonstração isolados, sem acessar o Supabase,
mesmo quando as variáveis de ambiente estão configuradas. Eles detectam Edge/Chrome
nos caminhos usuais do Windows e Chromium/Chrome no Linux; para outro caminho,
defina `CHROME_BIN` com o executável do navegador.

## Conectar ao Supabase

1. Crie um projeto em <https://supabase.com>.
2. No **SQL Editor**, execute, nesta ordem:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_seed_categorias.sql`
3. Em **Authentication > Providers > Email**, decida sobre **Confirm email**:
   - desligado: o usuário entra logo após criar a conta (mais simples para a apresentação);
   - ligado: o app mostra a tela "Confirme seu e-mail". Configure em **Authentication > URL Configuration** a URL do site (local e Vercel).
4. Em **Project Settings > API**, copie a *Project URL* e a chave *anon public*.
5. Crie `app/.env.local` a partir de `.env.example`:

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

6. Rode `npm run dev` novamente. A faixa "Modo demonstração" deve sumir.

A chave *anon* é pública por natureza; a proteção dos dados vem das políticas RLS da migração. **Nunca** use a chave *service_role* no front-end.

## Publicar na Vercel

1. Importe o repositório na Vercel.
2. Em **Root Directory**, selecione `app`.
3. Em **Environment Variables**, adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Faça o deploy. Cada push na branch principal gera uma nova versão.

O `vercel.json` já define o build e cabeçalhos de segurança (HSTS, `nosniff`, `X-Frame-Options`). Como as rotas usam `#`, não é preciso configurar reescritas.

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
