import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function GET() {
  try {
    // 환경 변수 확인
    const envStatus = {
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '미설정',
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
          `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10)}...` : '없음',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '미설정',
        anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? '설정됨' : '미설정',
      },
      node_env: process.env.NODE_ENV,
      vercel_env: process.env.VERCEL_ENV || '로컬 환경',
    };

    // 수파베이스 연결 테스트 (환경 변수가 설정된 경우에만)
    let connectionTest: { success: boolean, error: string | null } = { success: false, error: null };
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createServerClient();
        const { data, error } = await supabase.from('clients').select('id').limit(1);
        
        if (error) {
          connectionTest = { success: false, error: error.message };
        } else {
          connectionTest = { success: true, error: null };
        }
      } catch (err) {
        connectionTest = { 
          success: false, 
          error: err instanceof Error ? err.message : '알 수 없는 오류' 
        };
      }
    } else {
      connectionTest = { 
        success: false, 
        error: '환경 변수가 설정되지 않아 연결 테스트를 수행할 수 없습니다.' 
      };
    }

    return NextResponse.json({
      envStatus,
      connectionTest,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      }, 
      { status: 500 }
    );
  }
} 