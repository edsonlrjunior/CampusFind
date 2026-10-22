import { describe, it, expect } from 'vitest';
import {
  validatePublicacao, validateSignup, validateImage, validateLogin,
  todayISO, formatDate, formatTelefone, sanitizeSearch, hasErrors,
} from '../src/lib/validation.js';

const HOJE = '2026-10-22';
const valida = {
  tipo: 'PERDIDO', titulo: 'Mochila preta', categoriaId: '3',
  descricao: 'Zíper vermelho', dataOcorrido: '2026-10-20', local: 'Bloco B',
};
const file = (name, type, size) => ({ name, type, size });

describe('validatePublicacao (HU03/HU04, RN02–RN05, RN09)', () => {
  it('aceita publicação completa', () => {
    expect(validatePublicacao(valida, { today: HOJE })).toEqual({});
  });

  it('aponta cada campo obrigatório vazio (RN03)', () => {
    const e = validatePublicacao({}, { today: HOJE });
    expect(Object.keys(e).sort()).toEqual(['categoriaId', 'dataOcorrido', 'descricao', 'local', 'tipo', 'titulo']);
  });

  it('exige tipo PERDIDO ou ENCONTRADO (RN02)', () => {
    expect(validatePublicacao({ ...valida, tipo: 'OUTRO' }, { today: HOJE }).tipo).toBeTruthy();
    expect(validatePublicacao({ ...valida, tipo: 'ENCONTRADO' }, { today: HOJE })).toEqual({});
  });

  it('recusa data futura e aceita hoje (RN04)', () => {
    expect(validatePublicacao({ ...valida, dataOcorrido: '2026-10-23' }, { today: HOJE }).dataOcorrido).toMatch(/posterior/);
    expect(validatePublicacao({ ...valida, dataOcorrido: HOJE }, { today: HOJE })).toEqual({});
  });

  it('ignora o tipo na edição (RN09)', () => {
    expect(validatePublicacao({ ...valida, tipo: '' }, { isEdit: true, today: HOJE })).toEqual({});
  });

  it('não aceita campos só com espaços', () => {
    expect(validatePublicacao({ ...valida, titulo: '   ' }, { today: HOJE }).titulo).toBeTruthy();
  });

  it('valida a imagem junto com o formulário (RN05)', () => {
    const e = validatePublicacao(valida, { today: HOJE, file: file('a.gif', 'image/gif', 10) });
    expect(e.imagem).toBeTruthy();
  });
});

describe('validateImage (RN05 / RNF12)', () => {
  it('imagem é opcional', () => expect(validateImage(null)).toBeNull());
  it('aceita JPG, JPEG e PNG', () => {
    expect(validateImage(file('a.jpg', 'image/jpeg', 1000))).toBeNull();
    expect(validateImage(file('a.JPEG', 'image/jpeg', 1000))).toBeNull();
    expect(validateImage(file('a.png', 'image/png', 1000))).toBeNull();
  });
  it('recusa outros formatos', () => {
    expect(validateImage(file('a.webp', 'image/webp', 1000))).toMatch(/JPG/);
    expect(validateImage(file('a.png', 'application/pdf', 1000))).toMatch(/JPG/);
  });
  it('aceita exatamente 5 MB e recusa acima', () => {
    expect(validateImage(file('a.png', 'image/png', 5 * 1024 * 1024))).toBeNull();
    expect(validateImage(file('a.png', 'image/png', 5 * 1024 * 1024 + 1))).toMatch(/5 MB/);
  });
});

describe('validateSignup (HU01, RN12)', () => {
  const ok = { nome: 'Ana', email: 'ana@uni.br', telefone: '(47) 99999-9999', senha: 'segredo1', confirmacao: 'segredo1' };
  it('aceita dados válidos', () => expect(validateSignup(ok)).toEqual({}));
  it('indica todos os campos pendentes', () => {
    expect(Object.keys(validateSignup({})).sort()).toEqual(['confirmacao', 'email', 'nome', 'senha', 'telefone']);
  });
  it('valida formato de e-mail', () => expect(validateSignup({ ...ok, email: 'ana@' }).email).toBeTruthy());
  it('exige telefone com DDD', () => expect(validateSignup({ ...ok, telefone: '9999-9999' }).telefone).toBeTruthy());
  it('exige senhas iguais', () => expect(validateSignup({ ...ok, confirmacao: 'outra' }).confirmacao).toBeTruthy());
  it('exige senha mínima', () => expect(validateSignup({ ...ok, senha: '123', confirmacao: '123' }).senha).toBeTruthy());
});

describe('utilitários', () => {
  it('validateLogin', () => expect(hasErrors(validateLogin({ email: '', senha: '' }))).toBe(true));
  it('todayISO usa a data local', () => expect(todayISO(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05'));
  it('formatDate', () => expect(formatDate('2026-10-07')).toBe('07/10/2026'));
  it('formatTelefone', () => {
    expect(formatTelefone('47999998888')).toBe('(47) 99999-8888');
    expect(formatTelefone('4733334444')).toBe('(47) 3333-4444');
  });
  it('sanitizeSearch remove caracteres do filtro PostgREST', () => {
    expect(sanitizeSearch('mochila,(preta)%')).toBe('mochila preta');
  });
});
