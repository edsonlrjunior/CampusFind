// Decisão isolada para verificar a configuração sem iniciar clientes ou sessões.
export function backendMode(env) {
  const hasUrl = Boolean(env.VITE_SUPABASE_URL?.trim());
  const hasKey = Boolean(env.VITE_SUPABASE_ANON_KEY?.trim());
  if (hasUrl !== hasKey) {
    throw new Error('Configuração incompleta do Supabase: informe URL e chave pública.');
  }
  if (hasUrl && hasKey) return 'supabase';
  if (env.PROD && env.VITE_DEMO_MODE !== 'true') {
    throw new Error('Configure o Supabase para produção ou habilite VITE_DEMO_MODE=true para uma demonstração sem dados reais.');
  }
  return 'demo';
}
