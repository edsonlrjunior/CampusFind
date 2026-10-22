// Regras de validação do CampusFind (RN02–RN05, RN09, RN11, RN12, RNF12).
// Funções puras: retornam um objeto { campo: 'mensagem' } — vazio quando válido.
// O banco repete as regras críticas (ver supabase/migrations/001_schema.sql).

export const TIPOS = ['PERDIDO', 'ENCONTRADO'];
export const TIPO_LABEL = { PERDIDO: 'Perdido', ENCONTRADO: 'Encontrado' };
export const STATUS_LABEL = { ATIVA: 'Ativa', RESOLVIDA: 'Resolvida' };

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_MIME = ['image/jpeg', 'image/png'];
export const IMAGE_EXT = ['jpg', 'jpeg', 'png'];

export const LIMITS = { nome: 120, email: 160, titulo: 120, local: 160, descricao: 2000 };
export const SENHA_MIN = 6;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Data de hoje no fuso local, no formato AAAA-MM-DD. */
export function todayISO(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}

const blank = (v) => !v || !String(v).trim();

export function onlyDigits(v = '') {
  return String(v).replace(/\D/g, '');
}

/** RN05 / RNF12 — imagem opcional, JPG/JPEG/PNG, até 5 MB. */
export function validateImage(file) {
  if (!file) return null;
  const ext = (file.name || '').split('.').pop().toLowerCase();
  if (!IMAGE_EXT.includes(ext) || (file.type && !IMAGE_MIME.includes(file.type))) {
    return 'Envie uma imagem JPG, JPEG ou PNG.';
  }
  if (file.size > IMAGE_MAX_BYTES) {
    return 'A imagem deve ter no máximo 5 MB.';
  }
  return null;
}

/**
 * RN02, RN03, RN04, RN05 (e RN09 na edição: o tipo é ignorado).
 * @param {object} data { tipo, titulo, categoriaId, descricao, dataOcorrido, local }
 * @param {{ isEdit?: boolean, file?: File|null, today?: string }} opts
 */
export function validatePublicacao(data, { isEdit = false, file = null, today = todayISO() } = {}) {
  const e = {};
  if (!isEdit && !TIPOS.includes(data.tipo)) e.tipo = 'Escolha se o objeto foi perdido ou encontrado.';
  if (blank(data.titulo)) e.titulo = 'Informe um título.';
  else if (data.titulo.trim().length > LIMITS.titulo) e.titulo = `Use até ${LIMITS.titulo} caracteres.`;
  if (!data.categoriaId) e.categoriaId = 'Escolha uma categoria.';
  if (blank(data.descricao)) e.descricao = 'Descreva o objeto.';
  else if (data.descricao.trim().length > LIMITS.descricao) e.descricao = `Use até ${LIMITS.descricao} caracteres.`;
  if (blank(data.dataOcorrido)) e.dataOcorrido = 'Informe a data.';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dataOcorrido)) e.dataOcorrido = 'Data inválida.';
  else if (data.dataOcorrido > today) e.dataOcorrido = 'A data não pode ser posterior a hoje.';
  if (blank(data.local)) e.local = 'Informe o local.';
  else if (data.local.trim().length > LIMITS.local) e.local = `Use até ${LIMITS.local} caracteres.`;
  const imgError = validateImage(file);
  if (imgError) e.imagem = imgError;
  return e;
}

/** RF01, RN11, RN12 — dados de cadastro. */
export function validateSignup({ nome, email, telefone, senha, confirmacao }) {
  const e = {};
  if (blank(nome)) e.nome = 'Informe seu nome.';
  else if (nome.trim().length > LIMITS.nome) e.nome = `Use até ${LIMITS.nome} caracteres.`;
  if (blank(email)) e.email = 'Informe seu e-mail.';
  else if (!EMAIL_RE.test(email.trim()) || email.trim().length > LIMITS.email) e.email = 'Informe um e-mail válido.';
  const digits = onlyDigits(telefone);
  if (!digits) e.telefone = 'Informe um telefone para contato.';
  else if (digits.length < 10 || digits.length > 13) e.telefone = 'Informe o telefone com DDD, ex.: (47) 99999-9999.';
  if (!senha) e.senha = 'Crie uma senha.';
  else if (senha.length < SENHA_MIN) e.senha = `A senha precisa de pelo menos ${SENHA_MIN} caracteres.`;
  if (!confirmacao) e.confirmacao = 'Repita a senha.';
  else if (senha !== confirmacao) e.confirmacao = 'As senhas não conferem.';
  return e;
}

export function validateLogin({ email, senha }) {
  const e = {};
  if (blank(email)) e.email = 'Informe seu e-mail.';
  if (!senha) e.senha = 'Informe sua senha.';
  return e;
}

/** Máscara simples de telefone brasileiro para exibição/digitação. */
export function formatTelefone(v = '') {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** AAAA-MM-DD → DD/MM/AAAA */
export function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

/** Remove caracteres que quebram o filtro de busca do PostgREST. */
export function sanitizeSearch(q = '') {
  return q.replace(/[%_,()\\*:."']/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}
