// Mantém o retorno dentro do app e evita voltar para outra tela de autenticação.
export function authDestination(next) {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//') || /[\\#\s]/.test(next)) return '/';
  const path = next.split('?')[0].replace(/\/+$/, '') || '/';
  if (path === '/entrar' || path === '/cadastro') return '/';
  return next;
}

export function loginPath(next) {
  const destination = authDestination(next);
  return destination === '/' ? '/entrar' : `/entrar?next=${encodeURIComponent(destination)}`;
}
