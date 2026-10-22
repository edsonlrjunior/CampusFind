import { useEffect, useState } from 'react';

export default function Toaster() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const onToast = (e) => {
      const t = e.detail;
      setItems((list) => [...list, t].slice(-3));
      setTimeout(() => setItems((list) => list.filter((x) => x.id !== t.id)), 4000);
    };
    window.addEventListener('cf:toast', onToast);
    return () => window.removeEventListener('cf:toast', onToast);
  }, []);
  return (
    <div className="toaster" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>{t.message}</div>
      ))}
    </div>
  );
}
