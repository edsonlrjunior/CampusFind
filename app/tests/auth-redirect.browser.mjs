import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { startBrowser } from './helpers/browser.mjs';

let browser;
before(async () => { browser = await startBrowser(); });
after(async () => { await browser?.close(); });

async function login(page, senha = 'demo1234') {
  await page.fill('#email', 'demo@campusfind.app');
  await page.fill('#senha', senha);
  await page.click('button[type="submit"]');
}

async function expectRoute(page, hash, heading) {
  await page.wait(() => !!document.querySelector('.session-name'), 'sessão autenticada');
  await page.wait((expected) => location.hash === expected && !!document.querySelector('h1') && !document.querySelector('#senha'), 'página de destino', hash);
  assert.equal(await page.evaluate(() => location.hash), hash);
  assert.equal(await page.evaluate(() => document.querySelector('h1')?.textContent), heading);
}

test('login direto abre a Home', async () => {
  const page = await browser.page('/entrar');
  try {
    await login(page);
    await expectRoute(page, '#/', 'Achados e Perdidos');
  } finally { await page.close(); }
});

test('login retorna à página protegida que pediu autenticação', async () => {
  const page = await browser.page('/nova');
  try {
    await page.wait(() => !!document.querySelector('#senha'), 'redirecionamento ao login');
    assert.equal(await page.evaluate(() => location.hash), '#/entrar?next=%2Fnova');
    await login(page);
    await expectRoute(page, '#/nova', 'Nova publicação');
  } finally { await page.close(); }
});

test('Entrar no cabeçalho preserva a publicação que estava aberta', async () => {
  const page = await browser.page('/');
  try {
    await page.wait(() => !!document.querySelector('.card-link'), 'publicações de demonstração');
    const post = await page.evaluate(() => document.querySelector('.card-link').getAttribute('href'));
    const title = await page.evaluate(() => document.querySelector('.card-link').textContent);
    await page.click('.card-link');
    await page.wait(() => !!document.querySelector('.contact-box'), 'detalhes da publicação');
    await page.click('.session a');
    await login(page);
    await expectRoute(page, post, title);
  } finally { await page.close(); }
});

for (const route of ['/entrar?next=%2Fminhas', '/cadastro?next=%2Fminhas']) {
  test(`sessão existente em ${route} retorna ao destino solicitado`, async () => {
    const page = await browser.page('/');
    try {
      await page.evaluate(async (destination) => {
        const { api } = await import('/src/services/api.js');
        await api.signIn({ email: 'demo@campusfind.app', senha: 'demo1234' });
        location.hash = destination;
      }, route);
      await page.wait(() => location.hash === '#/minhas' && !!document.querySelector('h1'), 'retorno com sessão existente');
      assert.equal(await page.evaluate(() => document.querySelector('h1')?.textContent), 'Minhas publicações');
    } finally { await page.close(); }
  });
}

test('cadastro com confirmação de email mantém o destino no link para entrar', async () => {
  const page = await browser.page('/cadastro?next=%2Fnova');
  try {
    // O backend demo entra automaticamente; simula somente a resposta externa
    // do Supabase quando a confirmação de email está habilitada.
    await page.evaluate(async () => {
      const { api } = await import('/src/services/api.js');
      api.signUp = async () => ({ needsConfirmation: true, user: null });
    });
    for (const [id, value] of Object.entries({ nome: 'Ana Teste', telefone: '47999990000',
      email: 'ana@example.test', senha: 'teste123', confirmacao: 'teste123' })) {
      await page.fill(`#${id}`, value);
    }
    await page.click('button[type="submit"]');
    await page.wait(() => document.querySelector('h1')?.textContent === 'Confirme seu e-mail', 'confirmação de email');
    assert.equal(await page.evaluate(() => document.querySelector('.auth-card a').getAttribute('href')), '#/entrar?next=%2Fnova');
    await page.click('.auth-card a');
    await login(page);
    await expectRoute(page, '#/nova', 'Nova publicação');
  } finally { await page.close(); }
});

test('cadastro com entrada automática retorna à página solicitada', async () => {
  const page = await browser.page('/cadastro?next=%2Fnova');
  try {
    for (const [id, value] of Object.entries({ nome: 'Ana Teste', telefone: '47999990000',
      email: 'ana@example.test', senha: 'teste123', confirmacao: 'teste123' })) {
      await page.fill(`#${id}`, value);
    }
    await page.click('button[type="submit"]');
    await expectRoute(page, '#/nova', 'Nova publicação');
  } finally { await page.close(); }
});

for (const destination of ['/entrar', '/cadastro', '//example.test']) {
  test(`destino ${destination} retorna à Home sem criar um ciclo de login`, async () => {
    const page = await browser.page(`/entrar?next=${encodeURIComponent(destination)}`);
    try {
      await login(page);
      await expectRoute(page, '#/', 'Achados e Perdidos');
    } finally { await page.close(); }
  });
}

test('senha incorreta mantém o usuário no login e exibe o erro', async () => {
  const page = await browser.page('/entrar?next=%2Fnova');
  try {
    await login(page, 'senha-errada');
    await page.wait(() => !!document.querySelector('[role="alert"]'), 'erro de login');
    assert.equal(await page.evaluate(() => location.hash), '#/entrar?next=%2Fnova');
    assert.equal(await page.evaluate(() => document.querySelector('.session-name')), null);
  } finally { await page.close(); }
});

async function prepareRateLimit(page, action, kind = 'request') {
  await page.evaluate(async (operation, limitKind) => {
    const { api } = await import('/src/services/api.js');
    const { createSupabaseBackend } = await import('/src/services/supabaseBackend.js');
    const originalFetch = window.fetch.bind(window);
    window.originalAuthOperation = api[operation].bind(api);
    window.authRequests = 0;
    window.fetch = async (input, options) => {
      if (String(input).startsWith('https://campusfind.test/auth/v1/')) {
        window.authRequests++;
        await new Promise((resolve) => setTimeout(resolve, 100));
        return new Response(JSON.stringify({
          code: limitKind === 'email' ? 'over_email_send_rate_limit' : 'over_request_rate_limit',
          msg: limitKind === 'email' ? 'email rate limit exceeded' : 'Request rate limit reached',
        }), { status: 429, headers: { 'Content-Type': 'application/json', 'X-Supabase-Api-Version': '2024-01-01' } });
      }
      return originalFetch(input, options);
    };
    const backend = createSupabaseBackend('https://campusfind.test', 'sb_publishable_test');
    api[operation] = backend[operation].bind(backend);
  }, action, kind);
  if (action === 'signUp') {
    await page.fill('#nome', 'Ana Teste');
    await page.fill('#telefone', '47999990000');
    await page.fill('#confirmacao', 'teste123');
  }
  await page.fill('#email', 'ana@example.test');
  await page.fill('#senha', 'teste123');
}

for (const [route, action, message] of [
  ['/cadastro?next=%2Fnova', 'signUp', /muitas tentativas/i],
  ['/entrar?next=%2Fnova', 'signIn', /muitas tentativas/i],
]) {
  test(`${action}: resposta 429 explica o bloqueio e impede novas tentativas imediatas`, async () => {
    const page = await browser.page(route);
    try {
      await prepareRateLimit(page, action);
      await page.click('button[type="submit"]');
      await page.wait(() => !!document.querySelector('[role="alert"]'), 'mensagem de limite');
      assert.match(await page.evaluate(() => document.querySelector('[role="alert"]').textContent), message);
      assert.equal(await page.evaluate(() => document.querySelector('button[type="submit"]').disabled), true);
      await page.evaluate(() => document.querySelector('form').requestSubmit());
      assert.equal(await page.evaluate(() => window.authRequests), 1);
      assert.equal(await page.evaluate(() => location.hash), `#${route}`);
      await page.evaluate(() => { location.hash = '/'; });
      await page.wait(() => !!document.querySelector('.post-grid'), 'volta à Home');
      await page.evaluate((destination) => { location.hash = destination; }, route);
      await page.wait(() => !!document.querySelector('#senha'), 'retorno ao formulário');
      assert.equal(await page.evaluate(() => document.querySelector('button[type="submit"]').disabled), true);
    } finally { await page.close(); }
  });

  test(`${action}: dois envios simultâneos geram somente uma requisição`, async () => {
    const page = await browser.page(route);
    try {
      await prepareRateLimit(page, action);
      await page.evaluate(() => {
        const form = document.querySelector('form');
        form.requestSubmit();
        form.requestSubmit();
      });
      await page.wait(() => !!document.querySelector('[role="alert"]'), 'fim da requisição');
      assert.equal(await page.evaluate(() => window.authRequests), 1);
    } finally { await page.close(); }
  });
}

test('o formulário volta a permitir login quando a pausa de requisições termina', async () => {
  const page = await browser.page('/');
  try {
    await page.evaluate(() => {
      sessionStorage.setItem('campusfind:auth:login:requestRetryAt', String(Date.now() + 1500));
      location.hash = '/entrar';
    });
    await page.wait(() => !!document.querySelector('#senha'), 'formulário de login');
    assert.equal(await page.evaluate(() => document.querySelector('button[type="submit"]').disabled), true);
    await page.wait(() => !document.querySelector('button[type="submit"]').disabled, 'fim da pausa');
    await login(page);
    await expectRoute(page, '#/', 'Achados e Perdidos');
  } finally { await page.close(); }
});

for (const [route, action] of [['/cadastro?next=%2Fnova', 'signUp'], ['/entrar?next=%2Fnova', 'signIn']]) {
  test(`${action}: falha de email mantém o formulário disponível e permite autenticar na tentativa seguinte`, async () => {
    const page = await browser.page(route);
    try {
      await prepareRateLimit(page, action, 'email');
      await page.click('button[type="submit"]');
      await page.wait(() => !!document.querySelector('[role="alert"]'), 'aviso de falha no email');
      assert.equal(await page.evaluate(() => document.querySelector('button[type="submit"]').disabled), false);
      assert.equal(await page.evaluate(() => window.authRequests), 1);
      assert.equal(await page.evaluate(() => !!document.querySelector('.session-name')), false);
      await page.evaluate(async (operation) => {
        const { api } = await import('/src/services/api.js');
        api[operation] = window.originalAuthOperation;
      }, action);
      if (action === 'signIn') await login(page);
      else await page.click('button[type="submit"]');
      await expectRoute(page, '#/nova', 'Nova publicação');
    } finally { await page.close(); }
  });
}

for (const [route, action] of [['/cadastro', 'signup'], ['/entrar', 'login']]) {
  test(`${action}: pausa antiga por email não bloqueia o formulário`, async () => {
    const page = await browser.page('/');
    try {
      await page.evaluate((destination, operation) => {
        sessionStorage.setItem(`campusfind:auth:${operation}:retryAt`, String(Date.now() + 60000));
        location.hash = destination;
      }, route, action);
      await page.wait(() => !!document.querySelector('#senha'), 'formulário disponível');
      assert.equal(await page.evaluate(() => document.querySelector('button[type="submit"]').disabled), false);
    } finally { await page.close(); }
  });
}
