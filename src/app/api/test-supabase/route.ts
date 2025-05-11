import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    console.log('Supabase 연결 테스트 API 호출됨');
    
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log("Supabase URL 설정 여부:", !!supabaseUrl);
    console.log("Supabase Anon Key 설정 여부:", !!supabaseKey);
    console.log("Supabase Service Role Key 설정 여부:", !!serviceRoleKey);
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase 환경 변수가 설정되지 않았습니다.');
      return NextResponse.json({
        success: false,
        error: 'Supabase 환경 변수가 설정되지 않았습니다.',
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseKey: !!supabaseKey,
          serviceRoleKey: !!serviceRoleKey
        }
      }, { status: 500 });
    }
    
    // clients 테이블 조회
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    // client_todos 테이블 조회
    const { data: todos, error: todosError } = await supabase
      .from('client_todos')
      .select('count')
      .limit(1);
    
    // Supabase 테이블 및 스키마 정보
    const tablesResponse = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(20);
    
    // Supabase 연결 정보 반환 (보안 정보는 마스킹)
    return NextResponse.json({
      success: true,
      connection: {
        url: supabaseUrl ? supabaseUrl.substring(0, 15) + '...' : '미설정',
        keyLength: supabaseKey?.length || 0,
        serviceRoleKeyLength: serviceRoleKey?.length || 0
      },
      clients: {
        data: clients,
        error: clientsError ? {
          message: clientsError.message,
          hint: clientsError.hint,
          code: clientsError.code
        } : null
      },
      todos: {
        data: todos,
        error: todosError ? {
          message: todosError.message,
          hint: todosError.hint,
          code: todosError.code
        } : null
      },
      tables: {
        data: tablesResponse.data,
        error: tablesResponse.error ? {
          message: tablesResponse.error.message,
          hint: tablesResponse.error.hint,
          code: tablesResponse.error.code
        } : null
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Supabase 테스트 API 오류:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 