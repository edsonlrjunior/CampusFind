# ADR-002: Escolha do Banco de Dados e Serviços com Supabase/PostgreSQL

**Status:** Aceito  |  **Data:** 2026-10-07  |  **Autores:** Edson Luis Rosa Junior, Gian Carlo Fiamoncini e Gustavo Pereira

## Contexto

O CampusFind precisa armazenar usuários, categorias e publicações, mantendo relacionamentos claros entre essas informações. Também precisa de autenticação e armazenamento de imagens para as publicações.

Como o sistema será desenvolvido como MVP acadêmico, a equipe precisa reduzir o trabalho de infraestrutura e configuração de servidor sem perder a possibilidade de utilizar um banco de dados relacional.

O baixo custo inicial e a rapidez de configuração também são fatores importantes para o projeto.

## Decisão

Será utilizado **Supabase**, utilizando **PostgreSQL** como banco de dados relacional, além dos recursos de autenticação e armazenamento de arquivos fornecidos pela plataforma.

As entidades principais serão USUARIO, CATEGORIA e PUBLICACAO, seguindo o DER definido na documentação do projeto.

## Consequências

(+) PostgreSQL atende bem aos relacionamentos definidos no DER.

(+) Supabase reúne banco, autenticação e armazenamento, reduzindo a necessidade de configurar vários serviços separados.

(+) Possibilita iniciar o MVP com baixo custo e configuração relativamente simples.

(-) Cria dependência dos serviços e limites oferecidos pelo Supabase.

(-) A equipe precisa compreender políticas de acesso e permissões para evitar exposição indevida de dados.

## Alternativas rejeitadas

- **Firebase/Firestore**: oferece serviços semelhantes, mas utiliza modelo NoSQL que não representa de forma tão direta os relacionamentos definidos para este MVP.

- **MySQL em servidor próprio**: atenderia à modelagem, porém exigiria maior esforço de hospedagem, autenticação, manutenção e configuração.

- **SQLite**: é simples para desenvolvimento local, mas não é a melhor opção para uma aplicação web multiusuário hospedada.

## Links

- Substitui: Não se aplica.
- Relacionado: DER, RN01, RN06, RN10 e RN11.
- Evidências: `docs/04-modelagem-dados.md` e `docs/01-requisitos-funcionais.md`.
