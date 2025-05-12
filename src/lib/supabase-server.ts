import { createClient } from '@supabase/supabase-js';

// RLS 정책을 우회하는 안전한 서버 클라이언트 생성 함수
export function createSafeServerClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // URL 인코딩된 문자가 있는지 확인하고 디코딩
    if (supabaseKey && supabaseKey.includes('%')) {
      supabaseKey = decodeURIComponent(supabaseKey);
    }
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL 또는 API 키가 설정되지 않았습니다.');
    }
    
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      }
    });
  } catch (err) {
    console.error('[API] Supabase 클라이언트 생성 오류:', err);
    throw err;
  }
} 