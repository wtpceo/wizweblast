import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    // Supabase 클라이언트 생성
    const supabase = createServerClient();
    
    // 서버 타임스탬프 가져오기
    const { data: timeData, error: timeError } = await supabase.rpc('get_server_timestamp');
    
    if (timeError) {
      console.error('[API] Supabase 연결 확인 오류:', timeError);
      throw new Error(`Supabase 연결 확인 실패: ${timeError.message}`);
    }
    
    // 각 테이블의 행 수 조회
    const tables = [
      'clients',
      'client_todos',
      'client_notes',
      'client_activities',
      'client_external_data',
      'notices',
      'users'
    ];
    
    const tableStats = await Promise.all(
      tables.map(async (tableName) => {
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          return {
            table: tableName,
            count: count || 0,
            status: error ? 'error' : 'ok',
            error: error ? error.message : null
          };
        } catch (err: any) {
          return {
            table: tableName,
            count: 0,
            status: 'error',
            error: err.message
          };
        }
      })
    );
    
    return NextResponse.json({
      status: 'connected',
      timestamp: timeData,
      serverTime: new Date(),
      tables: tableStats,
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
  } catch (err: any) {
    console.error('[API] Supabase 상태 확인 예외:', err);
    return NextResponse.json(
      {
        status: 'error',
        message: `Supabase 연결 실패: ${err.message}`,
        serverTime: new Date(),
        environment: process.env.NODE_ENV,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      },
      { status: 500 }
    );
  }
} 