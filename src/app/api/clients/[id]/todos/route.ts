import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// UUID 패턴을 확인하는 함수
const isValidUUID = (str: string) => {
  const regexExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regexExp.test(str);
};

// ID를 UUID 형식으로 변환하는 함수
const formatToUUID = (id: string) => {
  if (isValidUUID(id)) return id;
  
  try {
    // 숫자 또는 문자열에서 UUID v4 형식으로 변환 시도
    const uuid = `00000000-0000-4000-8000-${id.padStart(12, '0')}`;
    console.log(`ID를 UUID 형식으로 변환: ${id} -> ${uuid}`);
    return uuid;
  } catch (error) {
    console.error('UUID 변환 실패:', error);
    return id; // 변환 실패 시 원래 값 반환
  }
};

// 광고주 할 일 조회 API
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;
    const formattedClientId = formatToUUID(clientId);
    
    console.log(`할 일 조회 요청: clientId=${clientId}, 변환된 ID=${formattedClientId}`);
    
    // 테이블 없음 오류를 처리하기 위해 먼저 테이블 존재 여부 확인
    try {
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'client_todos')
        .single();
      
      if (tableCheckError || !tableExists) {
        console.log('client_todos 테이블이 존재하지 않습니다. 스키마 설정이 필요합니다.');
        
        return NextResponse.json([], { status: 200 }); // 빈 배열 반환 (테이블이 없어도 오류는 아님)
      }
    } catch (tableError) {
      console.error('테이블 확인 오류:', tableError);
      // 무시하고 계속 진행
    }
    
    // 현재 사용자 ID 가져오기
    const { userId } = await auth();
    const currentUserId = userId || 'unknown';
    
    // 쿼리 수정: 클라이언트 ID로 필터링 + (현재 사용자가 담당하거나 생성한 할 일만 표시)
    const { data, error } = await supabase
      .from('client_todos')
      .select('*')
      .eq('client_id', formattedClientId)
      .or(`assigned_to.eq.${currentUserId},created_by.eq.${currentUserId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('광고주 할 일 조회 오류:', error);
      return NextResponse.json({ error: '할 일 목록을 가져오는 데 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('광고주 할 일 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 광고주 할 일 추가 API
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    // Clerk 인증 확인
    const { userId } = await auth();
    const createdBy = userId || 'unknown';
    
    // 클라이언트 ID
    const clientId = params.id;
    const formattedClientId = formatToUUID(clientId);
    
    console.log(`할 일 추가 요청: clientId=${clientId}, 변환된 ID=${formattedClientId}`);
    
    const body = await request.json();
    const { content, title, assignedTo } = body;
    
    // 필수 필드 검증
    if (!content) {
      return NextResponse.json(
        { error: '할 일 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 1. UUID 확장 활성화 시도
    try {
      await supabase.rpc('exec_sql', {
        sql_query: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
      });
    } catch (extError) {
      console.log('UUID 확장 활성화 실패 (무시):', extError);
    }
    
    // 2. 할 일 테이블 직접 생성 시도
    try {
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
      
      console.log('테이블 생성 SQL:', createTableSQL);
      
      try {
        await supabase.rpc('exec_sql', { sql_query: createTableSQL });
        console.log('테이블 생성 시도 완료');
      } catch (sqlError) {
        console.log('exec_sql 함수 호출 실패:', sqlError);
      }
    } catch (tableCreateError) {
      console.error('테이블 생성 시도 중 예외 발생:', tableCreateError);
    }
    
    // 3. 할 일 데이터 삽입
    console.log('할 일 데이터 삽입 시도...');
    
    const todoData = {
      client_id: formattedClientId,
      content: content,
      title: title || null,
      assigned_to: assignedTo || null,
      created_by: createdBy,
      created_at: new Date().toISOString()
    };
    
    console.log('삽입할 데이터:', todoData);
    
    const { data, error } = await supabase
      .from('client_todos')
      .insert(todoData)
      .select();
    
    if (error) {
      console.error('할 일 추가 오류:', error);
      
      // relation does not exist 오류 처리
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: '할 일 저장을 위한 데이터베이스가 설정되지 않았습니다.',
            details: 'Supabase 스키마 설정을 먼저 실행해주세요.',
            code: 'RELATION_NOT_EXIST'
          },
          { status: 500 }
        );
      }
      
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Supabase SQL 함수가 설정되지 않았습니다.',
            details: '관리자 페이지에서 SQL 함수 설정을 먼저 실행해주세요.',
            code: 'FUNCTION_NOT_EXIST'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: '할 일 추가에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('할 일 추가 성공:', data);
    return NextResponse.json({ success: true, todo: data[0] });
  } catch (error) {
    console.error('할 일 추가 API 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: errorMessage },
      { status: 500 }
    );
  }
} 