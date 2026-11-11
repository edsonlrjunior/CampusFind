-- Auditoria OWASP Top 10:2025. Aplicar após 001 e 002.
-- Não remove nem reescreve dados legados.
begin;

-- RF08: contato para falar com o autor de uma publicação ativa.
-- O próprio perfil continua disponível para carregar a sessão.
drop policy if exists usuario_select_autenticado on public.usuario;
drop policy if exists usuario_select_contato on public.usuario;
create policy usuario_select_contato on public.usuario
  for select to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1 from public.publicacao p
      where p.usuario_id = usuario.id and p.status = 'ATIVA'
    )
  );

-- O cliente não é uma fronteira de segurança: requisições REST diretas
-- devem respeitar o mesmo limite de conteúdo do formulário.
alter table public.publicacao
  add constraint publicacao_descricao_limite
  check (char_length(btrim(descricao)) <= 2000) not valid;
-- NOT VALID preserva registros antigos e já bloqueia INSERT/UPDATE inválidos.
-- Depois de revisar eventuais registros legados:
-- alter table public.publicacao validate constraint publicacao_descricao_limite;

commit;
