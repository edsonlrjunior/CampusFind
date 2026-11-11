import { afterEach, expect, it, vi } from 'vitest';
import { createLocalBackend, DEMO_LOGIN } from '../src/services/localBackend.js';

afterEach(() => vi.unstubAllGlobals());

it('contato exige sessão e um anúncio ativo, exceto o próprio perfil', async () => {
  const storage = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  });
  const api = createLocalBackend();
  const { user } = await api.signUp({ nome: 'Conta sem anúncio', email: 'sem-anuncio@example.test',
    telefone: '47999990000', senha: 'fixture1234' });
  expect(await api.getContato(user.id)).toMatchObject({ email: user.email });
  await api.signOut();
  await expect(api.getContato(user.id)).rejects.toThrow(/sessão/);
  await api.signIn(DEMO_LOGIN);
  expect(await api.getContato(user.id)).toBeNull();
  const { items } = await api.listPublicacoes();
  expect(await api.getContato(items[0].usuarioId)).toMatchObject({ nome: expect.any(String) });
});
