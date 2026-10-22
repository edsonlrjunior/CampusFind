# 5. Modelagem de Dados — DER

## Entidades do MVP

### USUARIO

| Atributo | Tipo sugerido | Regra |
|---|---|---|
| id | UUID | PK |
| nome | VARCHAR(120) | Obrigatório |
| email | VARCHAR(160) | Obrigatório e único |
| telefone | VARCHAR(20) | Meio de contato |
| criado_em | TIMESTAMP | Data de criação |

### CATEGORIA

| Atributo | Tipo sugerido | Regra |
|---|---|---|
| id | INTEGER | PK |
| nome | VARCHAR(60) | Obrigatório e único |

Exemplos: Documentos, Eletrônicos, Acessórios, Material Escolar, Roupas e Outros.

### PUBLICACAO

| Atributo | Tipo sugerido | Regra |
|---|---|---|
| id | UUID | PK |
| usuario_id | UUID | FK → USUARIO.id |
| categoria_id | INTEGER | FK → CATEGORIA.id |
| tipo | VARCHAR(10) | PERDIDO ou ENCONTRADO |
| titulo | VARCHAR(120) | Obrigatório |
| descricao | TEXT | Obrigatório |
| data_ocorrido | DATE | Obrigatório |
| local | VARCHAR(160) | Obrigatório |
| imagem_url | TEXT | Opcional |
| status | VARCHAR(10) | ATIVA ou RESOLVIDA |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

## Relacionamentos

- Um **USUARIO** pode criar **0..N PUBLICACOES**.
- Cada **PUBLICACAO** pertence a **1 USUARIO**.
- Uma **CATEGORIA** pode classificar **0..N PUBLICACOES**.
- Cada **PUBLICACAO** pertence a **1 CATEGORIA**.

## DER em Mermaid

```mermaid
erDiagram
    USUARIO ||--o{ PUBLICACAO : cria
    CATEGORIA ||--o{ PUBLICACAO : classifica

    USUARIO {
        uuid id PK
        varchar nome
        varchar email UK
        varchar telefone
        timestamp criado_em
    }

    CATEGORIA {
        int id PK
        varchar nome UK
    }

    PUBLICACAO {
        uuid id PK
        uuid usuario_id FK
        int categoria_id FK
        varchar tipo
        varchar titulo
        text descricao
        date data_ocorrido
        varchar local
        text imagem_url
        varchar status
        timestamp criado_em
        timestamp atualizado_em
    }
```

Os arquivos visuais e editáveis do DER estão disponíveis em `docs/diagramas/`:

- `der-campusfind.svg`
- `der-campusfind.dot`
