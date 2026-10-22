-- CampusFind — Migração 002: categorias iniciais (docs/04-modelagem-dados.md)
insert into public.categoria (nome) values
  ('Documentos'),
  ('Eletrônicos'),
  ('Acessórios'),
  ('Material Escolar'),
  ('Roupas'),
  ('Outros')
on conflict (nome) do nothing;
