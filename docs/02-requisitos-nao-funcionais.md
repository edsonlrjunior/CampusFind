# 2. Requisitos Não Funcionais (RNF)

Os requisitos abaixo foram definidos de forma mensurável para permitir validação durante os testes do MVP.

| Código | Categoria | Requisito mensurável |
|---|---|---|
| RNF01 | Desempenho | As páginas principais devem carregar em até **2 segundos** em pelo menos **95%** das requisições sob uso normal e conexão estável. |
| RNF02 | Desempenho | A pesquisa e aplicação de filtros devem apresentar o resultado em até **2 segundos** para uma base de até **10.000 publicações**. |
| RNF03 | Disponibilidade | Quando publicado para uso, o sistema deve manter disponibilidade mensal mínima de **99,5%**, desconsiderando manutenções previamente comunicadas. |
| RNF04 | Segurança | Toda comunicação entre navegador e serviços externos deve utilizar **HTTPS/TLS**; acesso via HTTP não deve ser aceito em produção. |
| RNF05 | Segurança | Senhas não podem ser armazenadas em texto puro; a autenticação deve utilizar mecanismo de hash seguro fornecido pelo serviço de autenticação escolhido. |
| RNF06 | Segurança | Operações de criar, editar e encerrar publicações devem validar a sessão do usuário em **100%** das requisições protegidas. |
| RNF07 | Usabilidade | Um usuário que já possua cadastro deve conseguir publicar um objeto em até **3 minutos**, considerando o fluxo normal e sem erros de preenchimento. |
| RNF08 | Responsividade | As telas principais devem permanecer utilizáveis sem rolagem horizontal entre **360 px e 1440 px** de largura. |
| RNF09 | Compatibilidade | O MVP deve funcionar nas **2 versões estáveis mais recentes** de Google Chrome, Microsoft Edge e Mozilla Firefox na data da entrega. |
| RNF10 | Acessibilidade | Textos principais e botões devem manter contraste mínimo de **4,5:1**, seguindo o nível AA da WCAG para texto normal. |
| RNF11 | Integridade | Uma publicação criada com sucesso deve permanecer associada ao mesmo autor e categoria em **100%** das leituras posteriores, salvo alteração válida de categoria pelo autor. |
| RNF12 | Limite de arquivo | O sistema deve rejeitar imagens acima de **5 MB** ou em formatos diferentes de JPG, JPEG e PNG antes da conclusão do cadastro da publicação. |
