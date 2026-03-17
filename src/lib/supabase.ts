import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
    console.warn('⚠️ Supabase URL is malformed or missing');
}
if (!supabaseAnonKey) {
    console.warn('⚠️ Supabase Anon Key is missing');
}

// General client for server components and API routes
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
