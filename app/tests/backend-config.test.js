import { describe, expect, it } from 'vitest';
import { backendMode } from '../src/lib/backendConfig.js';

describe('seleção segura do backend', () => {
  it('permite demonstração local sem configuração', () => {
    expect(backendMode({ PROD: false })).toBe('demo');
  });
  it('recusa produção sem backend configurado', () => {
    expect(() => backendMode({ PROD: true })).toThrow(/Supabase/);
  });
  it('exige opção explícita para publicar uma demonstração', () => {
    expect(backendMode({ PROD: true, VITE_DEMO_MODE: 'true' })).toBe('demo');
    expect(() => backendMode({ PROD: true, VITE_DEMO_MODE: 'false' })).toThrow();
  });
  it('recusa configuração parcial mesmo em desenvolvimento ou demo explícita', () => {
    expect(() => backendMode({ VITE_SUPABASE_URL: 'https://example.supabase.co' })).toThrow();
    expect(() => backendMode({ VITE_SUPABASE_ANON_KEY: 'public-key', VITE_DEMO_MODE: 'true' })).toThrow();
  });
  it('prioriza o backend real quando as duas variáveis estão presentes', () => {
    expect(backendMode({ PROD: true, VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'public-key', VITE_DEMO_MODE: 'true' })).toBe('supabase');
  });
});
