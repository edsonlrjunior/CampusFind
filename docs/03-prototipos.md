# 3. Protótipos de Tela

## Objetivo

Os protótipos representam diretamente as histórias de usuário descritas na documentação de requisitos. Além do protótipo navegável simples em HTML/CSS/JavaScript, foi criado um arquivo no **Figma** com identidade visual, componentes reutilizáveis, as principais telas desktop e o fluxo de navegação do MVP.

## Arquivo no Figma

**CampusFind — MVP de Achados e Perdidos**

https://www.figma.com/design/oPyi3VwzQzftKlxjtvyfbe

O arquivo contém:

- identidade visual do CampusFind;
- paleta de cores;
- componentes de botão, input, badge e card;
- 7 telas desktop;
- identificação das Histórias de Usuário atendidas por cada tela;
- quadro com o fluxo de navegação principal.

## Telas incluídas

1. **Cadastro** — HU01
   - Nome;
   - E-mail;
   - Telefone ou outro meio de contato;
   - Senha;
   - Confirmação de senha;
   - Ação de criar conta.

2. **Login** — HU02
   - E-mail;
   - Senha;
   - Entrada simulada;
   - Acesso à tela de cadastro.

3. **Nova Publicação** — HU03 e HU04
   - Tipo da publicação;
   - Título;
   - Categoria;
   - Data;
   - Local;
   - Descrição;
   - Seleção de imagem.

4. **Início / Listagem** — HU05 e HU06
   - Busca textual;
   - Filtro por categoria;
   - Filtro por tipo;
   - Cards com objetos perdidos e encontrados;
   - Acesso aos detalhes.

5. **Detalhes da Publicação** — HU07
   - Informações completas;
   - Identificação do status;
   - Dados de contato.

6. **Editar Publicação** — HU08
   - Campos preenchidos com os dados atuais;
   - Alteração de categoria, título, data, local e descrição;
   - Tipo da publicação bloqueado para edição, conforme RN09;
   - Ação de salvar alterações.

7. **Minhas Publicações** — HU09 e HU10
   - Lista de publicações do usuário;
   - Identificação do status;
   - Acesso à edição;
   - Ação para marcar publicação como resolvida.

## Rastreabilidade entre histórias e telas

| História de Usuário | Tela que representa o fluxo |
|---|---|
| HU01 — Criar conta | Cadastro |
| HU02 — Entrar no sistema | Login |
| HU03 — Publicar objeto perdido | Nova Publicação |
| HU04 — Publicar objeto encontrado | Nova Publicação |
| HU05 — Consultar publicações | Início / Listagem |
| HU06 — Pesquisar e filtrar | Início / Listagem |
| HU07 — Ver detalhes e contato | Detalhes da Publicação |
| HU08 — Editar minha publicação | Editar Publicação |
| HU09 — Marcar publicação como resolvida | Minhas Publicações |
| HU10 — Visualizar minhas publicações | Minhas Publicações |

## Fluxo principal representado no Figma

- Login → Cadastro → Início
- Início → Detalhes
- Início → Nova Publicação → Início
- Minhas Publicações → Editar Publicação → Minhas Publicações
- Minhas Publicações → Detalhes

## Arquivos complementares

- Protótipo navegável: `../prototipo/index.html`
- Wireframes estáticos: `diagramas/wireframes-campusfind.svg`

## Observação

O protótipo não representa o código final do produto. Ele serve para validar visualmente os fluxos antes da implementação real. As ações de autenticação, cadastro, edição e alteração de status são simuladas.
