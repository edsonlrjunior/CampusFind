# ADR-001: Escolha do Front-end com React e Vite

**Status:** Aceito  |  **Data:** 2026-10-07  |  **Autores:** Edson Luis Rosa Junior, Gian Carlo Fiamoncini e Gustavo Pereira

## Contexto

O CampusFind precisa de uma interface web simples, responsiva e composta por telas como listagem de publicações, busca, formulário de cadastro, detalhes e área do usuário.

A equipe precisa de uma solução adequada a um MVP acadêmico, com curva de aprendizado aceitável, boa organização por componentes e facilidade para testar e publicar a aplicação.

Como restrições, o projeto possui equipe pequena, prazo acadêmico e necessidade de evitar uma arquitetura excessivamente complexa.

## Decisão

Será utilizado **React** para construção da interface e **Vite** como ferramenta de criação, desenvolvimento e build do projeto front-end.

A aplicação será organizada como uma SPA simples, com componentes reutilizáveis para cabeçalho, cards de publicação, formulários e filtros.

## Consequências

(+) Permite organizar a interface em componentes reutilizáveis.

(+) Possui ampla documentação e grande quantidade de material de apoio.

(+) Vite oferece configuração inicial simples e execução rápida durante o desenvolvimento.

(-) Exige conhecimento básico de componentes, estado e ciclo de renderização do React.

(-) Adiciona uma etapa de build antes da publicação da aplicação.

## Alternativas rejeitadas

- **HTML, CSS e JavaScript puro**: seria suficiente para telas simples, mas dificultaria a organização e reutilização à medida que o MVP ganhasse mais componentes e estados.

- **Angular**: possui estrutura mais completa, porém adicionaria complexidade desnecessária para o escopo atual.

- **Vue**: também atenderia ao projeto, mas foi rejeitado para manter a escolha em uma tecnologia mais alinhada ao conhecimento atual da equipe.

## Links

- Substitui: Não se aplica.
- Relacionado: RF05, RF06, RF07 e documentação de protótipos.
- Evidências: Protótipo navegável e requisitos funcionais disponíveis neste repositório.
