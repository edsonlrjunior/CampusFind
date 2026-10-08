# ADR-003: Escolha da Hospedagem do Front-end com Vercel

**Status:** Aceito  |  **Data:** 2026-10-07  |  **Autores:** Edson Luis Rosa Junior, Gian Carlo Fiamoncini e Gustavo Pereira

## Contexto

O CampusFind precisa ser disponibilizado pela internet para apresentação, testes e demonstração do MVP. A solução de hospedagem deve aceitar facilmente uma aplicação React/Vite e possuir processo de publicação simples para uma equipe acadêmica.

O projeto não exige, neste momento, servidores dedicados, escalabilidade complexa ou infraestrutura própria. O baixo custo e a facilidade de publicar novas versões são prioridades.

## Decisão

O front-end do CampusFind será hospedado na **Vercel**, conectado ao repositório GitHub do projeto.

Cada versão aprovada na branch principal poderá gerar uma nova publicação do front-end, mantendo o banco e os serviços de autenticação no Supabase.

## Consequências

(+) Publicação simples de projetos React/Vite.

(+) Integração direta com repositórios GitHub e atualização automatizada após novos commits.

(+) Possui HTTPS e infraestrutura adequada para a demonstração de um MVP.

(-) O projeto passa a depender dos limites e condições do plano utilizado na Vercel.

(-) Configurações de variáveis de ambiente precisam ser mantidas corretamente na plataforma.

## Alternativas rejeitadas

- **GitHub Pages**: é adequado para aplicações estáticas, mas a Vercel oferece um fluxo de publicação mais direto para projetos React/Vite e gerenciamento simples de variáveis de ambiente.

- **Netlify**: também atenderia ao MVP, porém foi rejeitado para manter uma única escolha de plataforma e reduzir decisões equivalentes.

- **Servidor VPS próprio**: daria maior controle, mas aumentaria custos e responsabilidade de configuração e manutenção sem benefício proporcional para o MVP.

## Links

- Substitui: Não se aplica.
- Relacionado: ADR-001 e ADR-002.
- Evidências: Estrutura prevista do front-end e requisitos não funcionais de disponibilidade e HTTPS.
