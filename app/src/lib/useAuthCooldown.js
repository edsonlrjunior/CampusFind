import { useEffect, useState } from 'react';

// Aplica-se somente ao limite de requisições, nunca à cota de envio de email.
export function useAuthCooldown(action) {
  const key = `campusfind:auth:${action}:requestRetryAt`;
  const [retryAt, setRetryAt] = useState(() => {
    try { return Number(sessionStorage.getItem(key)) || 0; } catch { return 0; }
  });
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    // Descarta pausas da versão anterior, que também eram criadas por falhas de email.
    try { sessionStorage.removeItem(`campusfind:auth:${action}:retryAt`); } catch { /* indisponível */ }
  }, [action]);

  useEffect(() => {
    const current = Date.now();
    if (retryAt <= current) {
      setNow(current);
      return;
    }
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= retryAt) {
        setRetryAt(0);
        try { sessionStorage.removeItem(key); } catch { /* armazenamento indisponível */ }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [key, retryAt]);

  function startCooldown(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    const current = Date.now();
    const next = current + seconds * 1000;
    setNow(current);
    setRetryAt(next);
    try { sessionStorage.setItem(key, String(next)); } catch { /* segue em memória */ }
  }

  return { remaining: Math.max(0, Math.ceil((retryAt - now) / 1000)), startCooldown };
}
