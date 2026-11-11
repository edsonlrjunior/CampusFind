// Ponto único de acesso aos dados. Usa Supabase quando as variáveis de ambiente
// estão definidas. Demonstração automática somente em desenvolvimento;
// produção sem Supabase exige opção explícita (ver backendConfig.js).
import { createSupabaseBackend } from './supabaseBackend.js';
import { createLocalBackend } from './localBackend.js';
import { backendMode } from '../lib/backendConfig.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isDemo = backendMode(import.meta.env) === 'demo';
export const api = isDemo ? createLocalBackend() : createSupabaseBackend(url, key);
