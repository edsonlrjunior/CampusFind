# 1. Requisitos Funcionais, Histórias de Usuário e Regras de Negócio

## 1.1 Requisitos Funcionais (RF)

| Código | Requisito funcional |
|---|---|
| RF01 | O sistema deve permitir que o usuário crie uma conta informando nome, e-mail, senha e um meio de contato. |
| RF02 | O sistema deve permitir que o usuário autenticado entre e saia da aplicação. |
| RF03 | O sistema deve permitir cadastrar uma publicação do tipo **Perdido**. |
| RF04 | O sistema deve permitir cadastrar uma publicação do tipo **Encontrado**. |
| RF05 | O sistema deve listar publicações ativas de objetos perdidos e encontrados. |
| RF06 | O sistema deve permitir pesquisar e filtrar publicações por texto, categoria e tipo. |
| RF07 | O sistema deve exibir os detalhes completos de uma publicação. |
| RF08 | O sistema deve permitir que o usuário visualize um meio de contato do autor da publicação. |
| RF09 | O sistema deve permitir que o autor edite uma publicação própria enquanto ela estiver ativa. |
| RF10 | O sistema deve permitir que o autor marque uma publicação como resolvida. |
| RF11 | O sistema deve permitir que o usuário visualize suas próprias publicações. |

## 1.2 Histórias de Usuário e Critérios de Aceite

### HU01 — Criar conta

**Como** novo usuário, **quero** criar uma conta, **para** poder publicar objetos perdidos ou encontrados.

**Critérios de aceite**

- **Dado que** estou na tela de cadastro, **quando** preencher os campos obrigatórios com dados válidos e confirmar, **então** minha conta deve ser criada.
- **Dado que** informei um e-mail já cadastrado, **quando** tentar criar a conta, **então** o sistema deve impedir o cadastro e exibir uma mensagem clara.
- **Dado que** algum campo obrigatório não foi preenchido, **quando** tentar continuar, **então** o sistema deve indicar o campo que precisa ser corrigido.

**Relacionamento:** RF01.

### HU02 — Entrar no sistema

**Como** usuário cadastrado, **quero** entrar no sistema, **para** acessar os recursos que exigem autenticação.

**Critérios de aceite**

- **Dado que** possuo uma conta válida, **quando** informar e-mail e senha corretos, **então** devo ser autenticado.
- **Dado que** a senha está incorreta, **quando** tentar entrar, **então** o sistema deve negar o acesso sem informar qual credencial está errada.
- **Dado que** estou autenticado, **quando** selecionar a opção de sair, **então** minha sessão deve ser encerrada.

**Relacionamento:** RF02.

### HU03 — Publicar objeto perdido

**Como** usuário autenticado, **quero** registrar um objeto que perdi, **para** aumentar a chance de encontrá-lo.

**Critérios de aceite**

- **Dado que** estou autenticado, **quando** preencher tipo, título, categoria, descrição, data e local, **então** devo conseguir publicar o objeto perdido.
- **Dado que** deixei um campo obrigatório vazio, **quando** tentar publicar, **então** o sistema deve impedir o envio e destacar os campos pendentes.
- **Dado que** inseri uma imagem válida, **quando** concluir a publicação, **então** a imagem deve aparecer nos detalhes do anúncio.

**Relacionamento:** RF03.

### HU04 — Publicar objeto encontrado

**Como** usuário autenticado, **quero** registrar um objeto encontrado, **para** que o dono possa localizá-lo.

**Critérios de aceite**

- **Dado que** encontrei um objeto, **quando** preencher os dados obrigatórios e selecionar o tipo **Encontrado**, **então** a publicação deve ser criada.
- **Dado que** a data informada está no futuro, **quando** tentar publicar, **então** o sistema deve recusar a data.

**Relacionamento:** RF04.

### HU05 — Consultar publicações

**Como** usuário, **quero** visualizar os objetos cadastrados, **para** verificar se meu objeto aparece no sistema.

**Critérios de aceite**

- **Dado que** existem publicações ativas, **quando** acessar a página inicial, **então** devo visualizar uma lista com as publicações mais recentes.
- **Dado que** uma publicação foi marcada como resolvida, **quando** acessar a listagem padrão, **então** ela não deve aparecer entre os registros ativos.

**Relacionamento:** RF05.

### HU06 — Pesquisar e filtrar

**Como** usuário, **quero** pesquisar e filtrar as publicações, **para** encontrar um objeto com menos esforço.

**Critérios de aceite**

- **Dado que** existem várias publicações, **quando** pesquisar por uma palavra presente no título ou descrição, **então** o sistema deve exibir somente resultados compatíveis.
- **Dado que** selecionei uma categoria ou tipo, **quando** aplicar o filtro, **então** devem aparecer apenas publicações que atendem ao filtro.
- **Dado que** nenhuma publicação corresponde à busca, **quando** pesquisar, **então** o sistema deve informar que nenhum resultado foi encontrado.

**Relacionamento:** RF06.

### HU07 — Ver detalhes e contato

**Como** usuário, **quero** visualizar os detalhes e o contato de uma publicação, **para** confirmar se o objeto é o que procuro e falar com o responsável.

**Critérios de aceite**

- **Dado que** estou na listagem, **quando** abrir uma publicação, **então** devo visualizar título, tipo, categoria, descrição, local, data, imagem e status.
- **Dado que** a publicação possui um meio de contato, **quando** abrir os detalhes, **então** devo conseguir visualizar a forma de contato disponibilizada pelo autor.

**Relacionamento:** RF07 e RF08.

### HU08 — Editar minha publicação

**Como** autor de uma publicação, **quero** editar informações do meu anúncio, **para** corrigir ou complementar os dados.

**Critérios de aceite**

- **Dado que** sou o autor de uma publicação ativa, **quando** selecionar editar, **então** devo poder alterar os campos permitidos.
- **Dado que** não sou o autor da publicação, **quando** visualizar os detalhes, **então** a opção de edição não deve estar disponível.

**Relacionamento:** RF09.

### HU09 — Marcar publicação como resolvida

**Como** autor de uma publicação, **quero** informar que o caso foi resolvido, **para** evitar que um anúncio antigo continue aparecendo como ativo.

**Critérios de aceite**

- **Dado que** sou autor de uma publicação ativa, **quando** selecionar **Marcar como resolvida**, **então** o status deve ser alterado para **Resolvida**.
- **Dado que** a publicação foi resolvida, **quando** acessar a busca padrão, **então** ela não deve aparecer entre as publicações ativas.

**Relacionamento:** RF10.

### HU10 — Visualizar minhas publicações

**Como** usuário autenticado, **quero** visualizar minhas publicações, **para** acompanhar, editar ou encerrar meus registros.

**Critérios de aceite**

- **Dado que** estou autenticado, **quando** acessar **Minhas publicações**, **então** devo ver apenas registros criados por mim.
- **Dado que** possuo publicações ativas e resolvidas, **quando** acessar essa tela, **então** o status de cada uma deve ser identificado visualmente.

**Relacionamento:** RF11.

## 1.3 Regras de Negócio (RN)

| Código | Regra de negócio |
|---|---|
| RN01 | Somente usuários autenticados podem criar, editar ou encerrar publicações. |
| RN02 | Toda publicação deve possuir exatamente um tipo: **PERDIDO** ou **ENCONTRADO**. |
| RN03 | Título, categoria, descrição, data do ocorrido, local e tipo são obrigatórios. |
| RN04 | A data do ocorrido não pode ser posterior à data atual. |
| RN05 | A imagem é opcional e, quando enviada, deve ser JPG, JPEG ou PNG e possuir no máximo 5 MB. |
| RN06 | Apenas o autor pode editar ou marcar sua própria publicação como resolvida. |
| RN07 | Uma publicação deve possuir um dos status: **ATIVA** ou **RESOLVIDA**. |
| RN08 | Publicações resolvidas não aparecem na listagem padrão de registros ativos, mas permanecem disponíveis no histórico do autor. |
| RN09 | O tipo da publicação não poderá ser alterado após a criação; em caso de erro, o autor deverá criar uma nova publicação. |
| RN10 | Cada publicação pertence a um único usuário e a uma única categoria. |
| RN11 | O e-mail utilizado no cadastro deve ser único no sistema. |
| RN12 | O usuário deve informar ao menos um meio de contato válido para permitir a comunicação sobre suas publicações. |

## 1.4 Matriz de rastreabilidade

| História | RF relacionado | Tela principal |
|---|---|---|
| HU01 | RF01 | Cadastro |
| HU02 | RF02 | Login |
| HU03 | RF03 | Nova publicação |
| HU04 | RF04 | Nova publicação |
| HU05 | RF05 | Início |
| HU06 | RF06 | Início |
| HU07 | RF07, RF08 | Detalhes |
| HU08 | RF09 | Minhas publicações / Edição |
| HU09 | RF10 | Minhas publicações / Detalhes |
| HU10 | RF11 | Minhas publicações |
