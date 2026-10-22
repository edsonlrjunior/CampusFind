// Implementação de demonstração: mesma interface do supabaseBackend, com dados
// salvos no localStorage do navegador. Aplica as mesmas regras de negócio para
// que o MVP possa ser apresentado e testado sem nenhum serviço externo.
// NÃO usar em produção: os dados ficam apenas no navegador de quem acessa.
import { fileToDataURL } from '../lib/image.js';
import { sanitizeSearch, todayISO, validatePublicacao, hasErrors } from '../lib/validation.js';

const KEY = 'campusfind:demo:v1';
const PAGE_SIZE = 12;

const CATEGORIAS = [
  { id: 1, nome: 'Documentos' },
  { id: 2, nome: 'Eletrônicos' },
  { id: 3, nome: 'Acessórios' },
  { id: 4, nome: 'Material Escolar' },
  { id: 5, nome: 'Roupas' },
  { id: 6, nome: 'Outros' },
];

export const DEMO_LOGIN = { email: 'demo@campusfind.app', senha: 'demo1234' };

async function hash(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayISO(d);
}

function stampAgo(n, h = 10) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
}

async function seed() {
  const demoId = uid();
  const anaId = uid();
  const brunoId = uid();
  const users = [
    { id: demoId, nome: 'Usuário Demonstração', email: DEMO_LOGIN.email, telefone: '(47) 99999-0000' },
    { id: anaId, nome: 'Ana Souza', email: 'ana.souza@campusfind.app', telefone: '(47) 98888-1234' },
    { id: brunoId, nome: 'Bruno Lima', email: 'bruno.lima@campusfind.app', telefone: '(47) 97777-4321' },
  ];
  for (const u of users) u.senhaHash = await hash(`${u.email}:${DEMO_LOGIN.senha}`);

  const p = (usuarioId, categoriaId, tipo, titulo, descricao, dias, local, status = 'ATIVA') => ({
    id: uid(), usuarioId, categoriaId, tipo, titulo, descricao,
    dataOcorrido: daysAgo(dias), local, imagemUrl: null, status,
    criadoEm: stampAgo(dias, 9 + (dias % 8)), atualizadoEm: stampAgo(dias, 9 + (dias % 8)),
  });

  const posts = [
    p(anaId, 3, 'PERDIDO', 'Mochila preta com detalhe vermelho', 'Mochila preta com zíper vermelho e dois bolsos frontais. Tinha um caderno de Cálculo II dentro.', 1, 'Bloco B, sala 204'),
    p(brunoId, 6, 'ENCONTRADO', 'Chave com chaveiro azul', 'Molho com duas chaves e um chaveiro azul de borracha. Encontrei perto das mesas de estudo em grupo.', 2, 'Biblioteca central, 2º andar'),
    p(demoId, 2, 'PERDIDO', 'Fone de ouvido sem fio branco', 'Estojo branco com um adesivo de estrela na tampa. Esqueci no intervalo.', 3, 'Cantina do Bloco A'),
    p(brunoId, 1, 'ENCONTRADO', 'Carteirinha estudantil', 'Carteirinha da universidade com foto. Deixei com a secretaria do Bloco C, mas podem falar comigo.', 4, 'Estacionamento norte'),
    p(anaId, 4, 'PERDIDO', 'Calculadora científica HP', 'Calculadora HP 50g com o nome “Ana” gravado na parte de trás.', 6, 'Laboratório de Física'),
    p(demoId, 5, 'ENCONTRADO', 'Jaqueta jeans tamanho M', 'Jaqueta jeans clara, ficou pendurada na cadeira após a aula das 19h.', 7, 'Auditório principal'),
    p(brunoId, 2, 'PERDIDO', 'Carregador de notebook', 'Carregador USB-C de 65 W, cabo preto com uma fita amarela perto do conector.', 9, 'Bloco D, sala 101'),
    p(demoId, 1, 'PERDIDO', 'Carteira marrom', 'Carteira de couro marrom com documentos. Já foi devolvida.', 12, 'Cantina', 'RESOLVIDA'),
  ];
  return { users, posts, sessionUserId: null };
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function write(db) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    throw new Error('O armazenamento do navegador está cheio. Use imagens menores ou restaure os dados de demonstração.');
  }
}

const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));
const publicUser = (u) => u && { id: u.id, nome: u.nome, email: u.email, telefone: u.telefone };

export function createLocalBackend() {
  let memory = null; // fallback se o localStorage estiver indisponível
  const listeners = new Set();

  async function db() {
    const stored = read() ?? memory;
    if (stored) return stored;
    const fresh = await seed();
    memory = fresh;
    try { write(fresh); } catch { /* segue em memória */ }
    return fresh;
  }

  function save(data) {
    memory = data;
    write(data);
  }

  const withCategoria = (post) => ({
    ...post,
    categoria: CATEGORIAS.find((c) => c.id === Number(post.categoriaId))?.nome ?? '',
  });

  async function currentUser() {
    const d = await db();
    return d.users.find((u) => u.id === d.sessionUserId) ?? null;
  }

  async function requireUser() {
    const u = await currentUser();
    if (!u) throw new Error('Sua sessão expirou. Entre novamente.'); // RN01 / RNF06
    return u;
  }

  function emit(user) {
    listeners.forEach((cb) => cb(publicUser(user)));
  }

  return {
    mode: 'demo',

    async reset() {
      try { localStorage.removeItem(KEY); } catch { /* indisponível */ }
      memory = null;
      await db();
      emit(null);
    },

    async getSession() {
      return publicUser(await currentUser());
    },

    onAuthChange(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },

    async signUp({ nome, email, telefone, senha }) {
      await delay();
      const d = await db();
      const mail = email.trim().toLowerCase();
      if (d.users.some((u) => u.email === mail)) {
        const e = new Error('Este e-mail já está cadastrado.'); // RN11
        e.field = 'email';
        throw e;
      }
      const user = { id: uid(), nome: nome.trim(), email: mail, telefone: telefone.trim(), senhaHash: await hash(`${mail}:${senha}`) };
      d.users.push(user);
      d.sessionUserId = user.id;
      save(d);
      emit(user);
      return { needsConfirmation: false, user: publicUser(user) };
    },

    async signIn({ email, senha }) {
      await delay();
      const d = await db();
      const mail = email.trim().toLowerCase();
      const user = d.users.find((u) => u.email === mail);
      if (!user || user.senhaHash !== (await hash(`${mail}:${senha}`))) {
        throw new Error('E-mail ou senha inválidos.');
      }
      d.sessionUserId = user.id;
      save(d);
      emit(user);
      return publicUser(user);
    },

    async signOut() {
      const d = await db();
      d.sessionUserId = null;
      save(d);
      emit(null);
    },

    async listCategorias() {
      return CATEGORIAS;
    },

    async listPublicacoes({ q = '', categoriaId = '', tipo = '', page = 0 } = {}) {
      await delay();
      const d = await db();
      const term = sanitizeSearch(q).toLowerCase();
      const all = d.posts
        .filter((p) => p.status === 'ATIVA')
        .filter((p) => !term || `${p.titulo} ${p.descricao}`.toLowerCase().includes(term))
        .filter((p) => !categoriaId || p.categoriaId === Number(categoriaId))
        .filter((p) => !tipo || p.tipo === tipo)
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
      const start = page * PAGE_SIZE;
      return { items: all.slice(start, start + PAGE_SIZE).map(withCategoria), hasMore: all.length > start + PAGE_SIZE };
    },

    async getPublicacao(id) {
      await delay(60);
      const d = await db();
      const post = d.posts.find((p) => p.id === id);
      if (!post) return null;
      if (post.status !== 'ATIVA' && post.usuarioId !== d.sessionUserId) return null; // RN08
      return withCategoria(post);
    },

    async getContato(usuarioId) {
      await requireUser(); // contato só para autenticados
      const d = await db();
      const u = d.users.find((x) => x.id === usuarioId);
      return u ? { nome: u.nome, email: u.email, telefone: u.telefone } : null;
    },

    async listMinhas() {
      const user = await requireUser();
      const d = await db();
      return d.posts
        .filter((p) => p.usuarioId === user.id)
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
        .map(withCategoria);
    },

    async createPublicacao(input, file) {
      await delay();
      const user = await requireUser();
      const errors = validatePublicacao(input, { file });
      if (hasErrors(errors)) throw new Error(Object.values(errors)[0]);
      const d = await db();
      const now = new Date().toISOString();
      const post = {
        id: uid(),
        usuarioId: user.id,
        categoriaId: Number(input.categoriaId),
        tipo: input.tipo,
        titulo: input.titulo.trim(),
        descricao: input.descricao.trim(),
        dataOcorrido: input.dataOcorrido,
        local: input.local.trim(),
        imagemUrl: file ? await fileToDataURL(file) : null,
        status: 'ATIVA',
        criadoEm: now,
        atualizadoEm: now,
      };
      d.posts.push(post);
      save(d);
      return withCategoria(post);
    },

    async updatePublicacao(id, input, file, { removerImagem = false } = {}) {
      await delay();
      const user = await requireUser();
      const d = await db();
      const post = d.posts.find((p) => p.id === id);
      if (!post || post.usuarioId !== user.id) throw new Error('Você só pode editar suas próprias publicações.'); // RN06
      if (post.status !== 'ATIVA') throw new Error('Publicações resolvidas não podem ser alteradas.');
      const errors = validatePublicacao(input, { isEdit: true, file });
      if (hasErrors(errors)) throw new Error(Object.values(errors)[0]);
      Object.assign(post, {
        categoriaId: Number(input.categoriaId),
        titulo: input.titulo.trim(),
        descricao: input.descricao.trim(),
        dataOcorrido: input.dataOcorrido,
        local: input.local.trim(),
        imagemUrl: file ? await fileToDataURL(file) : removerImagem ? null : post.imagemUrl,
        atualizadoEm: new Date().toISOString(),
      }); // RN09: tipo nunca é alterado
      save(d);
      return withCategoria(post);
    },

    async resolverPublicacao(id) {
      await delay();
      const user = await requireUser();
      const d = await db();
      const post = d.posts.find((p) => p.id === id);
      if (!post || post.usuarioId !== user.id) throw new Error('Você só pode encerrar suas próprias publicações.');
      if (post.status !== 'ATIVA') throw new Error('Publicação não encontrada ou já resolvida.');
      post.status = 'RESOLVIDA';
      post.atualizadoEm = new Date().toISOString();
      save(d);
      return withCategoria(post);
    },
  };
}
