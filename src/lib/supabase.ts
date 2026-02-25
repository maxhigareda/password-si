import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your .env.local file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      // OVERRIDE: Desactivar por completo el navigator.locks del navegador
      // Esto soluciona de raíz el bug global de Supabase (NavigatorLockAcquireTimeoutError de 10000ms)
      // que causa bloqueos infinitos de sesión al recargar la página o volver de caché.
      // @ts-expect-error Type interference issue with Supabase 2.97 options
      lock: async (_name: string, acquire: () => Promise<any>) => {
        // Ejecutar de forma síncrona/memoria sin trabar el Storage del navegador
        return await acquire();
      },
      autoRefreshToken: true,
      persistSession: true,
    }
  }
);
