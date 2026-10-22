// Roteador por hash, sem dependências. Funciona em qualquer hospedagem estática
// (Vercel inclusive) sem configuração de rewrites.
import { useEffect, useState } from 'react';

function readHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  return { path: path || '/', query: new URLSearchParams(query), full: raw };
}

export function useRoute() {
  const [route, setRoute] = useState(readHash);
  useEffect(() => {
    const onChange = () => {
      setRoute(readHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}

export function navigate(to, { replace = false } = {}) {
  const target = '#' + to;
  if (replace) {
    window.history.replaceState(null, '', target);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = to;
  }
}

/** Retorna os parâmetros se `path` casar com o padrão (ex.: '/publicacao/:id'). */
export function match(pattern, path) {
  const p = pattern.split('/');
  const s = path.split('/');
  if (p.length !== s.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

export function Link({ to, children, ...props }) {
  return (
    <a href={'#' + to} {...props}>
      {children}
    </a>
  );
}
