import { createClient } from '@supabase/supabase-js'

// 1. Paste your Supabase URL and Anon Key below (between the quotes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const isReady = supabaseUrl.startsWith('http');

export const supabase = isReady
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (null as any);
