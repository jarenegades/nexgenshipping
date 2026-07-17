export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const projectId = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : '';
