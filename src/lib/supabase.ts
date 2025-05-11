import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 환경 변수가 없을 경우 콘솔에 경고 메시지 출력
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '수파베이스 환경 변수가 설정되지 않았습니다. 환경 변수를 확인해주세요:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// 클라이언트 측 Supabase 인스턴스
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-application-name': 'wizweblast',
      },
    },
    db: {
      schema: 'public',
    },
  }
);

/**
 * 서버 컴포넌트를 위한 Supabase 클라이언트 생성 함수
 * Next.js 서버 컴포넌트 또는 API 라우트에서 사용
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL 또는 API 키가 설정되지 않았습니다.');
  }
  
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    }
  });
}

/**
 * Supabase 클라이언트 생성 (클라이언트 컴포넌트용)
 * - 브라우저에서 사용
 * - RLS 정책에 따른 제한된 접근 권한
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL 또는 API 키가 설정되지 않았습니다.');
  }
  
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      storageKey: 'supabase-auth',
    }
  });
}

// 서버 클라이언트 싱글톤 인스턴스 (서버 컴포넌트에서 사용)
let serverClientInstance: ReturnType<typeof createServerClient> | null = null;

export function getServerClient() {
  if (!serverClientInstance) {
    serverClientInstance = createServerClient();
  }
  return serverClientInstance;
} 