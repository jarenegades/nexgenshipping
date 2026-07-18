import { createClient } from '@jsr/supabase__supabase-js';
import { supabaseUrl, publicAnonKey, hasSupabaseConfig } from './supabase/info';

const supabaseKey = publicAnonKey;

// Log connection details for debugging
console.log('🔵 Initializing Supabase client...');
console.log('🔵 Supabase URL:', supabaseUrl || 'not configured');
console.log('🔵 Anon Key configured:', Boolean(supabaseKey));

let supabaseClient: any = null;

if (hasSupabaseConfig) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'Content-Type': 'application/json',
        }
      },
      db: {
        schema: 'public'
      },
      storage: {}
    });

    console.log('✅ Supabase client created with storage support');
  } catch (error) {
    console.error('⚠️ Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('⚠️ Supabase is not configured for this deployment. Falling back to local-only mode.');
}

export const supabase = supabaseClient;

