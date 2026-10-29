import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseBackend } from '../src/services/supabaseBackend.js';

const signup = { nome: 'Ana', email: 'ana@example.test', telefone: '47999990000', senha: 'teste123' };

function backendWithError(code, message, status = 429) {
  const fetch = vi.fn(async () => new Response(JSON.stringify({ code, msg: message }), {
    status, headers: { 'Content-Type': 'application/json', 'X-Supabase-Api-Version': '2024-01-01' },
  }));
  vi.stubGlobal('fetch', fetch);
  return { api: createSupabaseBackend('https://campusfind.test', 'sb_publishable_test'), fetch };
}

afterEach(() => vi.unstubAllGlobals());

describe('limites de autenticação do Supabase', () => {
  it('identifica o limite de emails sem impor uma pausa ao cadastro', async () => {
    const { api, fetch } = backendWithError('over_email_send_rate_limit', 'email rate limit exceeded');
    await expect(api.signUp(signup)).rejects.toMatchObject({
      code: 'over_email_send_rate_limit',
      message: expect.stringMatching(/limite de envio de e-mails/i),
      cooldownSeconds: 0,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('não apresenta limite de tentativas como senha inválida no login', async () => {
    const { api } = backendWithError('over_request_rate_limit', 'Request rate limit reached');
    await expect(api.signIn(signup)).rejects.toMatchObject({
      code: 'over_request_rate_limit',
      message: expect.stringMatching(/muitas tentativas/i),
      cooldownSeconds: 60,
    });
  });

  it('também trata respostas HTTP 429 sem código conhecido', async () => {
    const { api } = backendWithError(undefined, 'Too many requests');
    await expect(api.signUp(signup)).rejects.toMatchObject({
      code: 'over_request_rate_limit', cooldownSeconds: 60,
    });
  });

  it('mantém a mensagem genérica para credenciais incorretas', async () => {
    const { api } = backendWithError('invalid_credentials', 'Invalid login credentials', 400);
    await expect(api.signIn(signup)).rejects.toThrow('E-mail ou senha inválidos.');
  });

  it('mantém a indicação de email duplicado no cadastro', async () => {
    const { api } = backendWithError('user_already_exists', 'User already registered', 422);
    await expect(api.signUp(signup)).rejects.toMatchObject({ field: 'email' });
  });
});
