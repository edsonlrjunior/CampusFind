-- Executar SOMENTE em Supabase local descartável, depois das migrações.
-- psql "$LOCAL_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/security.sql
begin;

insert into auth.users (id, email, raw_user_meta_data) values
  ('10000000-0000-4000-8000-000000000001', 'audit-a@example.test', '{"nome":"Autor A","telefone":"47999990001"}'),
  ('10000000-0000-4000-8000-000000000002', 'audit-b@example.test', '{"nome":"Autor B","telefone":"47999990002"}'),
  ('10000000-0000-4000-8000-000000000003', 'audit-c@example.test', '{"nome":"Sem anúncio","telefone":"47999990003"}');

insert into public.publicacao (id, usuario_id, categoria_id, tipo, titulo, descricao, data_ocorrido, "local") values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001',
   (select min(id) from public.categoria), 'PERDIDO', 'Fixture A', 'Teste', current_date - 1, 'Campus'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002',
   (select min(id) from public.categoria), 'ENCONTRADO', 'Fixture B', 'Teste', current_date - 1, 'Campus');
update public.publicacao set status = 'RESOLVIDA' where id = '20000000-0000-4000-8000-000000000002';

set local role anon;
do $$
begin
  -- Tanto ausência de grant como RLS sem linhas protegem contatos anônimos.
  begin
    if exists (select 1 from public.usuario) then
      raise exception 'FAIL: contato exposto ao anônimo';
    end if;
  exception when insufficient_privilege then null;
  end;
  if exists (select 1 from public.publicacao where id = '20000000-0000-4000-8000-000000000002') then
    raise exception 'FAIL: publicação resolvida exposta';
  end if;
end $$;

reset role;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', true);
set local role authenticated;
do $$
declare affected integer;
begin
  if (select count(*) from public.usuario where id in
    ('10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003')) <> 2 then
    raise exception 'FAIL: próprio perfil ou contato ativo indisponível';
  end if;
  if exists (select 1 from public.usuario where id = '10000000-0000-4000-8000-000000000002') then
    raise exception 'FAIL: contato de autor sem anúncio ativo exposto';
  end if;
  update public.publicacao set titulo = 'Alteração indevida'
    where id = '20000000-0000-4000-8000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'FAIL: alterou anúncio alheio'; end if;
  begin
    insert into public.publicacao (usuario_id, categoria_id, tipo, titulo, descricao, data_ocorrido, "local")
    values ('10000000-0000-4000-8000-000000000001', (select min(id) from public.categoria),
      'PERDIDO', 'Autor forjado', 'Teste', current_date - 1, 'Campus');
    raise exception 'FAIL: inseriu anúncio em nome de outro usuário';
  exception when insufficient_privilege then null;
  end;
  insert into public.publicacao (usuario_id, categoria_id, tipo, titulo, descricao, data_ocorrido, "local")
  values ('10000000-0000-4000-8000-000000000003', (select min(id) from public.categoria),
    'PERDIDO', 'Limite válido', repeat('x', 2000), current_date - 1, 'Campus');
  begin
    insert into public.publicacao (usuario_id, categoria_id, tipo, titulo, descricao, data_ocorrido, "local")
    values ('10000000-0000-4000-8000-000000000003', (select min(id) from public.categoria),
      'PERDIDO', 'Limite inválido', repeat('x', 2001), current_date - 1, 'Campus');
    raise exception 'FAIL: aceitou descrição acima do limite';
  exception when check_violation then null;
  end;
end $$;

-- Um autor ativo também não pode consultar o contato de quem não publicou.
reset role;
delete from public.publicacao where usuario_id = '10000000-0000-4000-8000-000000000003';
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
set local role authenticated;
do $$
begin
  if exists (select 1 from public.usuario where id = '10000000-0000-4000-8000-000000000003') then
    raise exception 'FAIL: contato de pessoa sem publicação exposto';
  end if;
end $$;
reset role;
rollback;
