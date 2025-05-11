import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Supabase 연결 테스트 시작');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase ANON KEY 길이:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0);
    
    // clients 테이블 조회
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('id, name')
      .limit(5);
    
    if (clientsError) {
      console.error('클라이언트 데이터 조회 오류:', clientsError);
      return NextResponse.json({
        success: false,
        error: clientsError.message,
        details: {
          hint: clientsError.hint,
          code: clientsError.code
        }
      }, { status: 500 });
    }
    
    // client_todos 테이블 조회
    const { data: todos, error: todosError } = await supabase
      .from('client_todos')
      .select('id, client_id, content')
      .limit(5);
    
    if (todosError) {
      console.error('할 일 데이터 조회 오류:', todosError);
      return NextResponse.json({
        success: false,
        error: todosError.message,
        details: {
          hint: todosError.hint,
          code: todosError.code
        }
      }, { status: 500 });
    }
    
    // 테이블 구조 조회
    const { data: clientsColumns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'clients' });
      
    return NextResponse.json({
      success: true,
      message: 'Supabase 연결 성공',
      data: {
        clients: clients || [],
        todos: todos || [],
        clientsColumns: clientsColumns || []
      }
    });
  } catch (error) {
    console.error('Supabase 연결 테스트 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}
