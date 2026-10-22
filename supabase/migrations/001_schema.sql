-- =====================================================================
-- CampusFind — Migração 001: esquema, regras de negócio, RLS e storage
-- Baseado em docs/04-modelagem-dados.md e docs/01-requisitos-funcionais.md
-- Executar no SQL Editor do Supabase (ou via `supabase db push`).
-- =====================================================================

create extension if not exists pg_trgm with schema extensions;

-- ---------------------------------------------------------------------
-- USUARIO (perfil público ligado ao auth.users do Supabase)
-- A senha fica somente em auth.users, com hash bcrypt (RNF05).
-- ---------------------------------------------------------------------
create table if not exists public.usuario (
  id         uuid primary key references auth.users (id) on delete cascade,
  nome       varchar(120) not null check (char_length(btrim(nome)) > 0),
  email      varchar(160) not null unique,                                   -- RN11
  telefone   varchar(20)  not null
             check (char_length(regexp_replace(telefone, '\D', '', 'g')) between 10 and 13), -- RN12
  criado_em  timestamptz  not null default now()
);

-- ---------------------------------------------------------------------
-- CATEGORIA
-- ---------------------------------------------------------------------
create table if not exists public.categoria (
  id   serial primary key,
  nome varchar(60) not null unique
);

-- ---------------------------------------------------------------------
-- PUBLICACAO
-- ---------------------------------------------------------------------
create table if not exists public.publicacao (
  id             uuid primary key default gen_random_uuid(),
  usuario_id     uuid    not null references public.usuario (id) on delete cascade, -- RN10
  categoria_id   integer not null references public.categoria (id),                  -- RN10
  tipo           varchar(10) not null check (tipo in ('PERDIDO', 'ENCONTRADO')),     -- RN02
  titulo         varchar(120) not null check (char_length(btrim(titulo)) > 0),       -- RN03
  descricao      text         not null check (char_length(btrim(descricao)) > 0),    -- RN03
  data_ocorrido  date         not null,                                              -- RN03/RN04
  "local"        varchar(160) not null check (char_length(btrim("local")) > 0),      -- RN03
  imagem_url     text,                                                               -- RN05 (opcional)
  status         varchar(10)  not null default 'ATIVA'
                 check (status in ('ATIVA', 'RESOLVIDA')),                           -- RN07
  criado_em      timestamptz  not null default now(),
  atualizado_em  timestamptz  not null default now()
);

-- Índices para listagem e busca (RNF01 / RNF02 — até 10.000 publicações)
create index if not exists publicacao_status_criado_idx  on public.publicacao (status, criado_em desc);
create index if not exists publicacao_usuario_idx        on public.publicacao (usuario_id, criado_em desc);
create index if not exists publicacao_categoria_idx      on public.publicacao (categoria_id);
create index if not exists publicacao_titulo_trgm_idx    on public.publicacao using gin (titulo extensions.gin_trgm_ops);
create index if not exists publicacao_descricao_trgm_idx on public.publicacao using gin (descricao extensions.gin_trgm_ops);

-- ---------------------------------------------------------------------
-- Criação automática do perfil quando a conta é criada no Auth (RF01)
-- nome e telefone chegam em options.data do signUp.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuario (id, nome, email, telefone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'telefone', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Regras de negócio garantidas no banco (independem do front-end)
--   RN04: data do ocorrido não pode ser futura
--   RN07: toda publicação nasce ATIVA
--   RN09: tipo não pode ser alterado
--   RF09: só publicações ativas podem ser editadas
-- ---------------------------------------------------------------------
create or replace function public.publicacao_validar()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.data_ocorrido > (now() at time zone 'America/Sao_Paulo')::date then
    raise exception 'A data do ocorrido não pode ser posterior à data atual.'
      using errcode = 'check_violation';
  end if;

  if tg_op = 'INSERT' then
    new.status    := 'ATIVA';
    new.criado_em := now();
  else
    if new.tipo is distinct from old.tipo then
      raise exception 'O tipo da publicação não pode ser alterado após a criação.'
        using errcode = 'check_violation';
    end if;
    if new.usuario_id is distinct from old.usuario_id then
      raise exception 'O autor da publicação não pode ser alterado.'
        using errcode = 'check_violation';
    end if;
    if old.status = 'RESOLVIDA' then
      raise exception 'Publicações resolvidas não podem ser alteradas.'
        using errcode = 'check_violation';
    end if;
    new.criado_em := old.criado_em;
  end if;

  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists publicacao_validar_trg on public.publicacao;
create trigger publicacao_validar_trg
  before insert or update on public.publicacao
  for each row execute function public.publicacao_validar();

-- ---------------------------------------------------------------------
-- Row Level Security (RN01, RN06, RN08, RNF06)
-- ---------------------------------------------------------------------
alter table public.usuario    enable row level security;
alter table public.categoria  enable row level security;
alter table public.publicacao enable row level security;

-- Contato do autor: visível apenas para usuários autenticados (RF08 + LGPD).
drop policy if exists usuario_select_autenticado on public.usuario;
create policy usuario_select_autenticado on public.usuario
  for select to authenticated using (true);

drop policy if exists categoria_select_todos on public.categoria;
create policy categoria_select_todos on public.categoria
  for select to anon, authenticated using (true);

-- Listagem pública mostra só ATIVAS; o autor também vê as próprias resolvidas.
drop policy if exists publicacao_select on public.publicacao;
create policy publicacao_select on public.publicacao
  for select to anon, authenticated
  using (status = 'ATIVA' or usuario_id = (select auth.uid()));

drop policy if exists publicacao_insert_autenticado on public.publicacao;
create policy publicacao_insert_autenticado on public.publicacao
  for insert to authenticated
  with check (usuario_id = (select auth.uid()));

drop policy if exists publicacao_update_autor on public.publicacao;
create policy publicacao_update_autor on public.publicacao
  for update to authenticated
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

-- Sem política de DELETE: exclusão não faz parte do escopo do MVP.

-- ---------------------------------------------------------------------
-- Storage de imagens (RN05 / RNF12): JPG/PNG até 5 MB, validado no servidor
-- Cada usuário só grava na pasta com o próprio id: <uid>/<arquivo>
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('publicacoes', 'publicacoes', true, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists imagens_insert_proprio on storage.objects;
create policy imagens_insert_proprio on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'publicacoes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists imagens_delete_proprio on storage.objects;
create policy imagens_delete_proprio on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'publicacoes'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
