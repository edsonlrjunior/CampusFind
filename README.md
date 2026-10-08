# CampusFind

**CampusFind** é um MVP acadêmico de um sistema de **achados e perdidos para o ambiente universitário**.

A proposta é centralizar publicações de objetos perdidos e encontrados para facilitar a comunicação entre quem perdeu e quem encontrou um objeto.

## Equipe

- Edson Luis Rosa Junior
- Gian Carlo Fiamoncini
- Gustavo Pereira

## Objetivo da Parte 2

Transformar a ideia conceitual do MVP em uma documentação técnica estruturada, cobrindo:

- requisitos funcionais;
- histórias de usuário e critérios de aceite;
- regras de negócio;
- requisitos não funcionais mensuráveis;
- protótipos de tela;
- decisões de arquitetura (ADRs);
- modelagem de dados (DER).

## Estrutura do repositório

```text
CampusFind/
├── README.md
├── docs/
│   ├── 01-requisitos-funcionais.md
│   ├── 02-requisitos-nao-funcionais.md
│   ├── 03-prototipos.md
│   ├── 04-modelagem-dados.md
│   ├── adrs/
│   │   ├── ADR-001-frontend-react-vite.md
│   │   ├── ADR-002-banco-supabase-postgresql.md
│   │   └── ADR-003-hospedagem-vercel.md
│   └── diagramas/
│       ├── der-campusfind.svg
│       ├── der-campusfind.dot
│       └── wireframes-campusfind.svg
└── prototipo/
    ├── index.html
    ├── styles.css
    └── app.js
```

## Escopo do MVP

O MVP permite:

- cadastro e autenticação de usuário;
- publicação de objeto perdido;
- publicação de objeto encontrado;
- listagem de publicações ativas;
- pesquisa e filtros;
- consulta dos detalhes;
- visualização do contato do autor;
- edição de publicação própria;
- encerramento de publicação como resolvida;
- consulta das próprias publicações.

## Decisões de arquitetura

Foram registrados três ADRs:

1. **ADR-001 — Front-end:** React + Vite.
2. **ADR-002 — Banco e autenticação:** Supabase + PostgreSQL.
3. **ADR-003 — Hospedagem:** Vercel.

As decisões priorizam simplicidade, baixo custo e facilidade de desenvolvimento, por se tratar de um MVP acadêmico.

## Protótipos

### Figma

Foi criado um arquivo completo no Figma com:

- identidade visual;
- componentes reutilizáveis;
- 7 telas desktop do MVP;
- indicação das Histórias de Usuário em cada tela;
- fluxo de navegação principal.

**Figma:** https://www.figma.com/design/oPyi3VwzQzftKlxjtvyfbe

### Protótipo navegável local

Existe também um protótipo navegável simples em `prototipo/`.

Para visualizar localmente, basta abrir:

```text
prototipo/index.html
```

As interações são simuladas e servem para demonstrar o fluxo das principais histórias de usuário.

## Documentação

A documentação detalhada está na pasta `docs/`.
