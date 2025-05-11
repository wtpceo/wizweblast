import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('client_todos 테이블 재생성 시작...');
    
    // 1. UUID 확장 활성화
    try {
      await supabase.rpc('exec_sql', {
        sql_query: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
      });
      console.log('UUID 확장 활성화 성공');
    } catch (extError) {
      console.error('UUID 확장 활성화 실패:', extError);
    }
    
    // 2. 테이블 존재 시 삭제 (초기화)
    try {
      await supabase.rpc('exec_sql', {
        sql_query: 'DROP TABLE IF EXISTS client_todos;'
      });
      console.log('기존 테이블 삭제 성공');
    } catch (dropError) {
      console.error('테이블 삭제 실패:', dropError);
    }
    
    // 3. 테이블 생성
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS client_todos (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        client_id UUID NOT NULL,
        content TEXT NOT NULL,
        title TEXT,
        assigned_to VARCHAR(255),
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        created_by UUID,
        completed_at TIMESTAMPTZ,
        completed_by TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_client_todos_client_id ON client_todos(client_id);
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: createTableSQL
    });
    
    if (error) {
      console.error('테이블 생성 오류:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // 4. 테이블 생성 확인
    const { data: tableExists, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'client_todos')
      .single();
    
    if (checkError) {
      console.error('테이블 확인 오류:', checkError);
      return NextResponse.json(
        { success: false, error: checkError.message },
        { status: 500 }
      );
    }
    
    console.log('client_todos 테이블 재생성 완료:', tableExists);
    
    return NextResponse.json({
      success: true,
      message: 'client_todos 테이블이 성공적으로 재생성되었습니다.',
      data: { success: true }
    });
  } catch (error) {
    console.error('client_todos 테이블 재생성 중 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 