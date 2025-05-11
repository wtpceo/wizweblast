import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// 임시 인증 모듈 (실제 프로젝트에서는 사용되지 않음)
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  return createSupabaseClient(supabaseUrl, supabaseKey);
}

export default createClient;
