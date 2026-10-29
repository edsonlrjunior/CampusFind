import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createServer } from 'vite';

async function until(check, description) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try { if (await check()) return; } catch { /* A página pode estar navegando. */ }
    await delay(25);
  }
  throw new Error(`Tempo esgotado: ${description}`);
}

async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });
  socket.addEventListener('close', () => {
    for (const request of pending.values()) {
      clearTimeout(request.timer);
      request.reject(new Error('Navegador desconectado.'));
    }
    pending.clear();
  });
  return {
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const requestId = ++id;
        const timer = setTimeout(() => {
          pending.delete(requestId);
          reject(new Error(`Tempo esgotado: ${method}`));
        }, 10000);
        pending.set(requestId, { resolve, reject, timer });
        socket.send(JSON.stringify({ id: requestId, method, params }));
      });
    },
    close: () => socket.close(),
  };
}

export async function startBrowser() {
  const executable = [process.env.CHROME_BIN,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/chromium', '/usr/bin/google-chrome',
  ].find((path) => path && existsSync(path));
  if (!executable) throw new Error('Defina CHROME_BIN com o caminho do Chrome, Chromium ou Edge.');
  const profile = await mkdtemp(join(tmpdir(), 'campusfind-auth-'));
  const server = await createServer({
    define: {
      'import.meta.env.VITE_SUPABASE_URL': '""',
      'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
    },
    server: { host: '127.0.0.1', port: 0 },
  });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const child = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`], { stdio: 'ignore' });
  let connection;
  let debugPort;
  try {
    let endpoint;
    await until(async () => {
      const [port, path] = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).trim().split(/\r?\n/);
      debugPort = port;
      endpoint = `ws://127.0.0.1:${port}${path}`;
      return true;
    }, 'inicialização do navegador');
    connection = await connect(endpoint);
  } catch (error) {
    child.kill();
    await server.close();
    await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    throw error;
  }
  return {
    async page(route) {
      const { browserContextId } = await connection.send('Target.createBrowserContext');
      const { targetId } = await connection.send('Target.createTarget', { url: 'about:blank', browserContextId });
      const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();
      const target = targets.find((item) => item.id === targetId);
      const client = await connect(target.webSocketDebuggerUrl);
      const evaluate = async (fn, ...args) => {
        const result = await client.send('Runtime.evaluate', {
          expression: `(${fn.toString()})(${args.map((arg) => JSON.stringify(arg)).join(',')})`,
          awaitPromise: true, returnByValue: true,
        });
        if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
        return result.result.value;
      };
      await client.send('Page.navigate', { url: `${origin}/#${route}` });
      await until(() => evaluate(() => !!document.querySelector('h1')), 'carregamento da aplicação');
      return {
        evaluate,
        wait: (fn, description, ...args) => until(() => evaluate(fn, ...args), description),
        click: (selector) => evaluate((s) => document.querySelector(s).click(), selector),
        fill: (selector, value) => evaluate((s, v) => {
          const input = document.querySelector(s);
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, v);
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }, selector, value),
        async close() {
          client.close();
          await connection.send('Target.disposeBrowserContext', { browserContextId });
        },
      };
    },
    async close() {
      await connection.send('Browser.close').catch(() => {});
      connection.close();
      await server.close();
      await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    },
  };
}
