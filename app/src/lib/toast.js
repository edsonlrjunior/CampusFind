// Avisos rápidos de sucesso/erro exibidos pelo componente <Toaster />.
export function toast(message, kind = 'success') {
  window.dispatchEvent(new CustomEvent('cf:toast', { detail: { message, kind, id: Date.now() + Math.random() } }));
}
