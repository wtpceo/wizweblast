import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    console.log('테스트 할 일 생성 API 호출됨');
    
    const body = await request.json();
    const { clientId, content, assignedTo, dueDate } = body;
    
    console.log('할 일 추가 요청:', { clientId, content, assignedTo });
    
    // Supabase 연결 상태 확인
    console.log('Supabase 연결 정보:');
    console.log('- URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '미설정');
    console.log('- ANON KEY 길이:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0);
    
    // 필수 필드 검증
    if (!clientId || !content) {
      return NextResponse.json(
        { error: '광고주 ID와 할 일 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 테스트용 사용자 ID
    const testUserId = assignedTo || 'test_user_id';
    
    // UUID 형식 확인 및 처리
    let supabaseClientId = clientId;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId);
    console.log('Client ID UUID 검증:', clientId, isUUID ? 'UUID 형식' : '기존 형식');
    
    // 할 일 데이터 준비
    const todoData: {
      client_id: string;
      content: string;
      assigned_to: string;
      due_date?: string;
      [key: string]: any;
    } = {
      client_id: supabaseClientId,
      content: content,
      assigned_to: testUserId
    };
    
    if (dueDate) {
      todoData.due_date = dueDate;
    }
    
    console.log('DB에 삽입할 할 일 데이터:', todoData);
    
    // 할 일 데이터 삽입
    const { data, error } = await supabase
      .from('client_todos')
      .insert(todoData)
      .select();
    
    if (error) {
      console.error('할 일 추가 오류:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: {
          hint: error.hint,
          code: error.code
        }
      }, { status: 500 });
    }
    
    console.log('삽입된 할 일 데이터:', data);
    
    if (data && data.length > 0) {
      // 클라이언트 정보 조회
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('name, icon')
        .eq('id', supabaseClientId)
        .single();
        
      if (clientError) {
        console.warn('클라이언트 정보 조회 실패:', clientError);
      }
        
      return NextResponse.json({ 
        success: true, 
        todo: {
          id: data[0].id,
          clientId: data[0].client_id,
          clientName: clientData?.name || '광고주',
          clientIcon: clientData?.icon || '🏢',
          content: data[0].content,
          assignedTo: data[0].assigned_to,
          completed: data[0].completed,
          createdAt: data[0].created_at,
          dueDate: data[0].due_date
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '할 일 데이터가 추가되지 않았습니다.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('테스트 할 일 추가 API 오류:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
} 