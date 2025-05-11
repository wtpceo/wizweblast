import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// 광고주 메모 조회 API
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;
    
    if (!clientId) {
      return NextResponse.json(
        { error: '유효하지 않은 광고주 ID입니다.' },
        { status: 400 }
      );
    }
    
    // 테이블 없음 오류를 처리하기 위해 먼저 테이블 존재 여부 확인
    try {
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'client_notes')
        .single();
      
      if (tableCheckError || !tableExists) {
        console.log('client_notes 테이블이 존재하지 않습니다. 스키마 설정이 필요합니다.');
        
        return NextResponse.json([], { status: 200 }); // 빈 배열 반환 (테이블이 없어도 오류는 아님)
      }
    } catch (tableError) {
      console.error('테이블 확인 오류:', tableError);
      // 무시하고 계속 진행
    }
    
    // 광고주 메모 조회
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      // "relation does not exist" 오류가 발생하면 빈 배열 반환 (테이블 없음)
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('client_notes 테이블이 존재하지 않습니다:', error.message);
        return NextResponse.json([], { status: 200 }); // 빈 배열 반환
      }
      
      console.error('광고주 메모 조회 오류:', error);
      return NextResponse.json(
        { error: '메모 목록을 가져오는 데 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('광고주 메모 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 광고주 메모 추가 API
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;
    const body = await request.json();
    const { note } = body;
    
    // 필수 필드 검증
    if (!note || note.trim() === '') {
      return NextResponse.json(
        { error: '메모 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 사용자 정보 가져오기
    const { userId } = await auth();
    const createdBy = userId || 'unknown';
    
    // 광고주 존재 여부 확인
    try {
      const { data: clientExists, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .single();
      
      if (clientError) {
        // 테이블이 없거나 광고주가 없는 경우
        console.log('광고주 확인 중 오류:', clientError);
        
        // 개발 환경에서는 광고주가 없어도 계속 진행
        if (process.env.NODE_ENV === 'development') {
          console.log('개발 환경이므로 광고주 존재 여부 검사 건너뜀');
        } else {
          return NextResponse.json(
            { error: '존재하지 않는 광고주입니다.' },
            { status: 404 }
          );
        }
      }
    } catch (clientCheckError) {
      console.error('광고주 확인 오류:', clientCheckError);
      // 개발 환경에서는 무시하고 계속 진행
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          { error: '광고주 확인 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    }
    
    // 메모 테이블이 없는 경우를 처리하기 위한 스키마 확인 및 설정
    try {
      const { data: tableExists, error: tableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'client_notes')
        .single();
      
      if (tableCheckError || !tableExists) {
        console.log('client_notes 테이블이 존재하지 않습니다. 생성을 시도합니다.');
        
        // 테이블 생성 시도
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS client_notes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_id UUID NOT NULL,
            note TEXT NOT NULL,
            created_by TEXT,
            created_at TIMESTAMPTZ DEFAULT now()
          );
          
          CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
        `;
        
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql_query: createTableSQL
        });
        
        if (createError) {
          console.error('메모 테이블 생성 오류:', createError);
          return NextResponse.json(
            { error: '메모 저장을 위한 데이터베이스 설정 오류가 발생했습니다.' },
            { status: 500 }
          );
        }
        
        console.log('client_notes 테이블을 성공적으로 생성했습니다.');
      }
    } catch (tableSetupError) {
      console.error('메모 테이블 설정 오류:', tableSetupError);
      // 무시하고 계속 진행
    }
    
    // 메모 데이터 삽입
    const { data, error } = await supabase
      .from('client_notes')
      .insert({
        client_id: clientId,
        note,
        created_by: createdBy,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('메모 추가 오류:', error);
      
      // relation does not exist 오류 처리
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: '메모 저장을 위한 데이터베이스가 설정되지 않았습니다.',
            details: 'Supabase 스키마 설정을 먼저 실행해주세요.',
            code: 'RELATION_NOT_EXIST'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: '메모 추가에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, note: data[0] });
  } catch (error) {
    console.error('메모 추가 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 