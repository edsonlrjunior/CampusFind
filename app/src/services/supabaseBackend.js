// Implementação real da API do CampusFind sobre Supabase (ADR-002).
// As regras críticas também são garantidas pelo banco (RLS + triggers).
import { createClient } from '@supabase/supabase-js';
import { sanitizeSearch } from '../lib/validation.js';

const BUCKET = 'publicacoes';
const PAGE_SIZE = 12;
const COLUMNS =
  'id, usuario_id, categoria_id, tipo, titulo, descricao, data_ocorrido, local, imagem_url, status, criado_em, atualizado_em, categoria:categoria_id(nome)';

function toPost(r) {
  return {
    id: r.id,
    usuarioId: r.usuario_id,
    categoriaId: r.categoria_id,
    categoria: r.categoria?.nome ?? '',
    tipo: r.tipo,
    titulo: r.titulo,
    descricao: r.descricao,
    dataOcorrido: r.data_ocorrido,
    local: r.local,
    imagemUrl: r.imagem_url,
    status: r.status,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  };
}

function fail(error, fallback = 'Não foi possível concluir a operação. Tente novamente.') {
  if (!error) return;
  // Mensagens dos triggers já estão em português (errcode 23514).
  if (error.code === '23514' && error.message) throw new Error(error.message);
  if (error.code === '42501') throw new Error('Você não tem permissão para esta ação.');
  console.error(error);
  throw new Error(fallback);
}

export function createSupabaseBackend(url, anonKey) {
  const sb = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });

  async function loadProfile(authUser) {
    if (!authUser) return null;
    const { data } = await sb.from('usuario').select('id, nome, email, telefone').eq('id', authUser.id).maybeSingle();
    return data ?? {
      id: authUser.id,
      nome: authUser.user_metadata?.nome ?? authUser.email,
      email: authUser.email,
      telefone: authUser.user_metadata?.telefone ?? '',
    };
  }

  async function requireUser() {
    const { data } = await sb.auth.getUser(); // valida o token no servidor (RNF06)
    if (!data?.user) throw new Error('Sua sessão expirou. Entre novamente.');
    return data.user;
  }

  async function uploadImage(userId, file) {
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      console.error(error);
      throw new Error('Não foi possível enviar a imagem. Use JPG ou PNG de até 5 MB.');
    }
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async function removeImage(publicUrl) {
    if (!publicUrl) return;
    const marker = `/object/public/${BUCKET}/`;
    const i = publicUrl.indexOf(marker);
    if (i === -1) return;
    await sb.storage.from(BUCKET).remove([publicUrl.slice(i + marker.length)]);
  }

  return {
    mode: 'supabase',

    async getSession() {
      const { data } = await sb.auth.getSession();
      return loadProfile(data.session?.user);
    },

    onAuthChange(callback) {
      const { data } = sb.auth.onAuthStateChange((_event, session) => {
        // Adiado para fora do callback para evitar bloqueio interno do supabase-js.
        setTimeout(async () => callback(await loadProfile(session?.user)), 0);
      });
      return () => data.subscription.unsubscribe();
    },

    async signUp({ nome, email, telefone, senha }) {
      const { data, error } = await sb.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: { data: { nome: nome.trim(), telefone: telefone.trim() } },
      });
      if (error) {
        if (/already|registered|exists/i.test(error.message)) {
          const e = new Error('Este e-mail já está cadastrado.');
          e.field = 'email';
          throw e;
        }
        if (/password/i.test(error.message)) {
          const e = new Error('A senha não atende aos requisitos mínimos.');
          e.field = 'senha';
          throw e;
        }
        fail(error, 'Não foi possível criar a conta.');
      }
      // Com confirmação de e-mail ativa, um e-mail repetido retorna usuário sem identidades.
      if (data.user && data.user.identities?.length === 0) {
        const e = new Error('Este e-mail já está cadastrado.');
        e.field = 'email';
        throw e;
      }
      return { needsConfirmation: !data.session, user: data.session ? await loadProfile(data.user) : null };
    },

    async signIn({ email, senha }) {
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
      if (error) {
        if (/confirm/i.test(error.message)) throw new Error('Confirme seu e-mail antes de entrar.');
        throw new Error('E-mail ou senha inválidos.'); // HU02: não revela qual credencial está errada
      }
      return loadProfile(data.user);
    },

    async signOut() {
      await sb.auth.signOut();
    },

    async listCategorias() {
      const { data, error } = await sb.from('categoria').select('id, nome').order('id');
      fail(error, 'Não foi possível carregar as categorias.');
      return data;
    },

    async listPublicacoes({ q = '', categoriaId = '', tipo = '', page = 0 } = {}) {
      let query = sb
        .from('publicacao')
        .select(COLUMNS)
        .eq('status', 'ATIVA')
        .order('criado_em', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE); // 1 a mais para saber se há próxima página
      const term = sanitizeSearch(q);
      if (term) query = query.or(`titulo.ilike.%${term}%,descricao.ilike.%${term}%`);
      if (categoriaId) query = query.eq('categoria_id', Number(categoriaId));
      if (tipo) query = query.eq('tipo', tipo);
      const { data, error } = await query;
      fail(error, 'Não foi possível carregar as publicações.');
      return { items: data.slice(0, PAGE_SIZE).map(toPost), hasMore: data.length > PAGE_SIZE };
    },

    async getPublicacao(id) {
      const { data, error } = await sb.from('publicacao').select(COLUMNS).eq('id', id).maybeSingle();
      if (error && error.code !== '22P02') fail(error); // 22P02 = id inválido
      return data ? toPost(data) : null;
    },

    async getContato(usuarioId) {
      const { data, error } = await sb.from('usuario').select('nome, email, telefone').eq('id', usuarioId).maybeSingle();
      fail(error, 'Não foi possível carregar o contato.');
      return data;
    },

    async listMinhas() {
      const user = await requireUser();
      const { data, error } = await sb
        .from('publicacao')
        .select(COLUMNS)
        .eq('usuario_id', user.id)
        .order('criado_em', { ascending: false });
      fail(error, 'Não foi possível carregar suas publicações.');
      return data.map(toPost);
    },

    async createPublicacao(input, file) {
      const user = await requireUser();
      const imagemUrl = file ? await uploadImage(user.id, file) : null;
      const { data, error } = await sb
        .from('publicacao')
        .insert({
          usuario_id: user.id,
          categoria_id: Number(input.categoriaId),
          tipo: input.tipo,
          titulo: input.titulo.trim(),
          descricao: input.descricao.trim(),
          data_ocorrido: input.dataOcorrido,
          local: input.local.trim(),
          imagem_url: imagemUrl,
        })
        .select(COLUMNS)
        .single();
      if (error && imagemUrl) await removeImage(imagemUrl);
      fail(error, 'Não foi possível publicar.');
      return toPost(data);
    },

    async updatePublicacao(id, input, file, { removerImagem = false } = {}) {
      const user = await requireUser();
      const atual = await this.getPublicacao(id);
      if (!atual || atual.usuarioId !== user.id) throw new Error('Você só pode editar suas próprias publicações.');
      if (atual.status !== 'ATIVA') throw new Error('Publicações resolvidas não podem ser alteradas.');

      let imagemUrl = atual.imagemUrl;
      if (file) imagemUrl = await uploadImage(user.id, file);
      else if (removerImagem) imagemUrl = null;

      // RN09: o tipo não é enviado na edição.
      const { data, error } = await sb
        .from('publicacao')
        .update({
          categoria_id: Number(input.categoriaId),
          titulo: input.titulo.trim(),
          descricao: input.descricao.trim(),
          data_ocorrido: input.dataOcorrido,
          local: input.local.trim(),
          imagem_url: imagemUrl,
        })
        .eq('id', id)
        .select(COLUMNS)
        .single();
      fail(error, 'Não foi possível salvar as alterações.');
      if (imagemUrl !== atual.imagemUrl) await removeImage(atual.imagemUrl).catch(() => {});
      return toPost(data);
    },

    async resolverPublicacao(id) {
      await requireUser();
      const { data, error } = await sb
        .from('publicacao')
        .update({ status: 'RESOLVIDA' })
        .eq('id', id)
        .eq('status', 'ATIVA')
        .select(COLUMNS)
        .maybeSingle();
      fail(error, 'Não foi possível marcar como resolvida.');
      if (!data) throw new Error('Publicação não encontrada ou já resolvida.');
      return toPost(data);
    },
  };
}
