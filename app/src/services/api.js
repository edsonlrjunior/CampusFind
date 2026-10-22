// Ponto único de acesso aos dados. Usa Supabase quando as variáveis de ambiente
// estão definidas; caso contrário, entra em modo demonstração (localStorage).
import { createSupabaseBackend } from './supabaseBackend.js';
import { createLocalBackend } from './localBackend.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isDemo = !(url && key);
export const api = isDemo ? createLocalBackend() : createSupabaseBackend(url, key);
