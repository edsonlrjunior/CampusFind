# ADR-004: Roteamento por hash e modo demonstração

**Status:** Proposto  |  **Data:** 2026-10-22  |  **Autores:** Edson Luis Rosa Junior, Gian Carlo Fiamoncini e Gustavo Pereira

## Contexto

Durante a implementação do MVP surgiram duas necessidades não cobertas pelos ADRs 001–003:

1. A SPA precisa de rotas (`/publicacao/:id`, `/minhas` etc.). Uma biblioteca de roteamento adiciona dependência e, com rotas por caminho, exige configurar reescritas na hospedagem para que um link direto não retorne 404.
2. A equipe precisa apresentar e testar o sistema mesmo sem um projeto Supabase configurado (avaliação, máquinas de laboratório, apresentação sem internet estável).

## Decisão

- Usar um **roteador por hash** próprio (`src/lib/router.jsx`, ~50 linhas), com rotas como `#/publicacao/123`.
- Isolar o acesso a dados em `src/services/api.js`, com duas implementações de mesma interface: **Supabase** (padrão quando as variáveis de ambiente existem) e **local/demonstração** (`localStorage`, com dados de exemplo e as mesmas regras de negócio).
- Exibir uma faixa "Modo demonstração" sempre que a implementação local estiver ativa.

## Consequências

(+) Nenhuma configuração extra na Vercel; links diretos sempre funcionam.

(+) O MVP pode ser demonstrado com `npm run dev`, sem criar conta em nenhum serviço.

(+) A interface única facilita testes e uma eventual troca de backend.

(-) URLs com `#` são menos elegantes e menos indicadas para SEO (irrelevante para o MVP).

(-) As regras de negócio existem em dois lugares no modo demonstração; o banco continua sendo a fonte de verdade em produção.

## Alternativas rejeitadas

- **React Router com rotas por caminho**: atenderia, mas exigiria dependência extra e regra de reescrita na Vercel.
- **Mock Service Worker**: mais fiel à API, porém mais complexo de configurar e explicar.

## Links

- Relacionado: ADR-001, ADR-002, ADR-003 e `docs/05-plano-desenvolvimento-mvp.md`.
