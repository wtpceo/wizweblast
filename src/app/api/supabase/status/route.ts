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
          // 전체 행 수를 조회하고 첫 번째 페이지 데이터를 샘플로 가져옴
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
            
          if (countError) {
            return {
              table: tableName,
              count: 0,
              status: 'error',
              error: `행 수 조회 오류: ${countError.message}`
            };
          }
          
          // 첫 번째 페이지 데이터 일부만 가져와서 실제 접근 가능한지 테스트
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .range(0, 9); // 처음 10개 항목만 확인
            
          return {
            table: tableName,
            count: count || 0,
            sample_count: sampleData?.length || 0,
            status: sampleError ? 'error' : 'ok',
            error: sampleError ? sampleError.message : null
          };
        } catch (err: any) {
          return {
            table: tableName,
            count: 0,
            sample_count: 0,
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