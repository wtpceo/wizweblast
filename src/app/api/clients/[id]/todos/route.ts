import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// 환경 변수에서 Supabase URL과 키 가져오기
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 광고주 할 일 조회 API
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;
    
    const { data, error } = await supabase
      .from('client_todos')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('광고주 할 일 조회 오류:', error);
      return NextResponse.json({ error: '할 일 목록을 가져오는 데 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json(data);
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
    
    if (!userId) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }
    
    // 클라이언트 ID 확인 (UUID 형식인지 확인)
    const clientIdRaw = params.id;
    
    // UUID 형식 검증 (8-4-4-4-12 형식, 예: 123e4567-e89b-12d3-a456-426614174000)
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidPattern.test(clientIdRaw)) {
      console.error('잘못된 UUID 형식:', clientIdRaw);
      return NextResponse.json({ error: '잘못된 형식의 클라이언트 ID입니다.' }, { status: 400 });
    }
    
    const body = await request.json();
    const { content, assignedTo } = body;
    
    console.log('받은 요청 데이터:', { 
      clientIdRaw, 
      content, 
      assignedTo,
      userId
    });
    
    // 필수 필드 검증
    if (!content) {
      return NextResponse.json(
        { error: '할 일 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 광고주 존재 여부 확인 (UUID 형식으로 조회)
    const { data: clientExists, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientIdRaw)
      .single();
    
    if (clientError) {
      console.error('광고주 조회 오류:', clientError);
      return NextResponse.json({ error: '광고주 정보를 조회하는데 실패했습니다.' }, { status: 500 });
    }
    
    if (!clientExists) {
      return NextResponse.json({ error: '존재하지 않는 광고주입니다.' }, { status: 404 });
    }
    
    console.log('직접 삽입 시도 중...');
    
    // 절대 최소한의 필드만 사용 - 다른 모든 필드는 무시
    try {
      // content만 사용하는 극단적으로 단순한 삽입
      const { data, error } = await supabase
        .from('client_todos')
        .insert({
          content: content,
          // client_id만 필수로 포함, 다른 필드는 제외
          client_id: clientIdRaw
        })
        .select();
      
      if (error) {
        console.error('삽입 오류:', error);
        
        // 마지막 시도: 원시 쿼리 사용
        try {
          console.log('원시 SQL 시도...');
          // 원시 쿼리 - 절대 최소한의 필드만 사용
          const { data: rawData, error: rawError } = await supabase.rpc(
            'insert_todo_raw', 
            {
              p_content: content,
              p_client_id: clientIdRaw
            }
          );
          
          if (rawError) {
            return NextResponse.json({ 
              error: '할 일 추가에 실패했습니다. 원시 SQL도 실패.', 
              details: rawError.message
            }, { status: 500 });
          }
          
          return NextResponse.json({ success: true, todo: rawData });
        } catch (rawSqlError: any) {
          return NextResponse.json({ 
            error: '할 일 추가에 실패했습니다.', 
            details: error.message,
          }, { status: 500 });
        }
      }
      
      console.log('성공적으로 할 일 추가:', data);
      return NextResponse.json({ success: true, todo: data[0] });
    } catch (dbError: any) {
      console.error('데이터베이스 오류:', dbError);
      
      // 오류 상세 정보 반환
      return NextResponse.json({ 
        error: '할 일 추가에 실패했습니다.', 
        message: dbError.message
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('할 일 추가 API 오류:', error);
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.', 
      message: error.message
    }, { status: 500 });
  }
} 