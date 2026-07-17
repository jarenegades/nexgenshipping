import { createClient } from '@jsr/supabase__supabase-js';
import { supabaseUrl, publicAnonKey } from './supabase/info';

const supabaseKey = publicAnonKey;

// Log connection details for debugging
console.log('🔵 Initializing Supabase client...');
console.log('🔵 Supabase URL:', supabaseUrl);
console.log('🔵 Anon Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

// Create client with auth options and storage configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
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
  // Storage configuration
  storage: {
    // Additional storage options can be configured here
  }
});

console.log('✅ Supabase client created with storage support');

