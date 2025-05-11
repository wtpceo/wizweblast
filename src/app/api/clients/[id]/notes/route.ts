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
  // 이미 UUID 형식인 경우 그대로 반환
  if (isValidUUID(id)) {
    console.log(`이미 유효한 UUID 형식: ${id}`);
    return id;
  }
  
  try {
    // 숫자인 경우 문자열로 변환
    const idStr = String(id).trim();
    
    // UUID 패턴에 맞는 형식으로 변환
    // 숫자 또는 문자열에서 UUID v4 형식으로 변환 시도
    // 12자리로 패딩하여 8000-... 형식으로 변환
    const paddedId = idStr.padStart(12, '0');
    const uuid = `00000000-0000-4000-8000-${paddedId}`;
    
    console.log(`ID를 UUID 형식으로 변환: ${id} -> ${uuid}`);
    
    // 생성된 UUID 유효성 검사
    if (!isValidUUID(uuid)) {
      console.error(`생성된 UUID가 유효하지 않음: ${uuid}`);
      // 기본 UUID 반환 (fallback)
      return '00000000-0000-4000-8000-000000000000';
    }
    
    return uuid;
  } catch (error) {
    console.error('UUID 변환 실패:', error);
    // 변환 실패 시 기본 UUID 반환 (안전장치)
    return '00000000-0000-4000-8000-000000000000';
  }
};

// 광고주 메모 조회 API
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // 전역 try-catch로 모든 예외 처리
  try {
    console.log(`메모 조회 API 호출: URL=${request.url}, 클라이언트 ID=${params.id}`);
    
    // 응답 헤더 설정 (캐시 방지)
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // 클라이언트 ID 유효성 검사
    const clientId = params.id;
    if (!clientId) {
      console.error('클라이언트 ID가 제공되지 않음');
      return NextResponse.json(
        { error: '광고주 ID가 필요합니다.', code: 'MISSING_CLIENT_ID' },
        { status: 400, headers }
      );
    }
    
    // UUID 변환
    let formattedClientId;
    try {
      formattedClientId = formatToUUID(clientId);
      console.log(`메모 조회 요청: clientId=${clientId}, 변환된 ID=${formattedClientId}`);
    } catch (uuidError) {
      console.error('UUID 변환 오류:', uuidError);
      return NextResponse.json(
        { error: '잘못된 광고주 ID 형식입니다.', code: 'INVALID_CLIENT_ID' },
        { status: 400, headers }
      );
    }
    
    // Supabase를 사용하여 메모 조회
    try {
      console.log('Supabase로 메모 조회 시도...');
      
      // 클라이언트 존재 여부 확인
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, name')
        .eq('id', formattedClientId)
        .single();
      
      if (clientError && clientError.code !== 'PGRST116') { // PGRST116: 결과가 없음
        console.error('클라이언트 조회 오류:', clientError);
      }
      
      if (!clientData) {
        console.log(`클라이언트가 존재하지 않음: ID=${formattedClientId}`);
      } else {
        console.log('클라이언트 확인 성공:', clientData.name);
      }
      
      const { data, error } = await supabase
        .from('client_notes')
        .select('*')
        .eq('client_id', formattedClientId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase 메모 조회 오류:', error);
        return NextResponse.json(
          [], 
          { 
            status: 200,
            headers: {
              ...headers,
              'X-Error-Message': error.message,
              'X-Error-Code': error.code
            }
          }
        );
      }
      
      console.log(`Supabase 메모 조회 성공: ${data?.length || 0}개 메모 반환`);
      return NextResponse.json(data || [], { headers });
    } catch (supabaseError) {
      console.error('Supabase 메모 조회 중 예외 발생:', supabaseError);
      
      // 오류 발생 시 빈 배열 반환
      return NextResponse.json(
        [], 
        { 
          status: 200,
          headers: {
            ...headers,
            'X-Error-Message': supabaseError instanceof Error ? supabaseError.message : 'Unknown error',
            'X-Error-Source': 'supabase_exception'
          }
        }
      );
    }
  } catch (error) {
    console.error('광고주 메모 API 최상위 오류:', error);
    
    // 모든 조회 방법 실패 시 빈 배열 반환
    return NextResponse.json(
      [],
      { 
        status: 200, 
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Error-Message': error instanceof Error ? error.message : 'Unknown error',
          'X-Error-Source': 'general_exception'
        }
      }
    );
  }
}

// 광고주 메모 추가 API
export async function POST(request: Request, { params }: { params: { id: string } }) {
  console.log(`메모 추가 API 호출: URL=${request.url}, 클라이언트 ID=${params.id}`);
  
  try {
    const clientId = params.id;
    
    // 클라이언트 ID가 없는 경우 처리
    if (!clientId) {
      console.error('클라이언트 ID가 제공되지 않음');
      return NextResponse.json(
        { error: '광고주 ID가 필요합니다.', code: 'MISSING_CLIENT_ID' },
        { status: 400 }
      );
    }
    
    // 요청 본문 파싱
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('요청 본문 파싱 오류:', parseError);
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.', code: 'INVALID_REQUEST_BODY' },
        { status: 400 }
      );
    }
    
    const { note, photo } = body;
    const formattedClientId = formatToUUID(clientId);
    
    console.log(`메모 추가 요청: clientId=${clientId}, 변환된 ID=${formattedClientId}, note=${note?.substring(0, 30)}...`);
    
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
    
    // 클라이언트 존재 여부 확인
    try {
      console.log('클라이언트 존재 여부 확인 중...');
      
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, name')
        .eq('id', formattedClientId)
        .single();
      
      if (clientError && clientError.code !== 'PGRST116') { // PGRST116: 결과가 없음
        console.error('클라이언트 조회 오류:', clientError);
      }
      
      if (!clientData) {
        console.error(`클라이언트가 존재하지 않음: ${formattedClientId}`);
        
        // 클라이언트가 존재하지 않으면 새 클라이언트 레코드를 생성 시도
        try {
          console.log('클라이언트 레코드 생성 시도...');
          
          const { data: newClient, error: createError } = await supabase
            .from('clients')
            .insert({
              id: formattedClientId,
              name: `Client ${clientId}`,
              contractStart: new Date().toISOString(),
              contractEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
              statusTags: []
            })
            .select()
            .single();
          
          if (createError) {
            console.error('클라이언트 레코드 생성 실패:', createError);
            return NextResponse.json({ 
              error: '존재하지 않는 광고주입니다.', 
              code: 'CLIENT_NOT_FOUND',
              details: `클라이언트 ID: ${formattedClientId}`
            }, { status: 404 });
          }
          
          console.log('클라이언트 레코드 생성 성공:', newClient);
        } catch (createClientError) {
          console.error('클라이언트 레코드 생성 실패:', createClientError);
          
          return NextResponse.json({ 
            error: '존재하지 않는 광고주입니다.', 
            code: 'CLIENT_NOT_FOUND',
            details: `클라이언트 ID: ${formattedClientId}`
          }, { status: 404 });
        }
      } else {
        console.log('클라이언트 확인 성공:', clientData.name);
      }
    } catch (clientCheckError) {
      console.error('클라이언트 확인 오류:', clientCheckError);
      // 클라이언트 확인 실패는 계속 진행
    }
    
    // 로컬 스토리지에 메모 저장 (백업)
    try {
      const localNote = {
        id: `local-${Date.now()}`,
        clientId: formattedClientId,
        note,
        photo,
        createdAt: new Date().toISOString(),
        createdBy: createdBy
      };
      
      console.log('로컬 스토리지에 메모 백업 준비:', localNote);
    } catch (localError) {
      console.error('로컬 스토리지 저장 준비 오류:', localError);
    }
    
    // Supabase로 메모 추가
    const { data, error } = await supabase
      .from('client_notes')
      .insert({
        client_id: formattedClientId,
        note,
        photo,
        created_by: createdBy,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('Supabase 메모 추가 오류:', error);
      
      // 오류 처리 및 응답
      if (error.message.includes('violates foreign key constraint')) {
        console.log('외래 키 제약 조건 위반, 테이블 재생성 API 호출...');
        
        try {
          const recreateResponse = await fetch('/api/recreate-notes-table', {
            method: 'POST'
          });
          
          if (recreateResponse.ok) {
            console.log('테이블 재생성 성공, 다시 시도합니다.');
            
            // 재시도
            const retryResponse = await supabase
              .from('client_notes')
              .insert({
                client_id: formattedClientId,
                note,
                photo,
                created_by: createdBy,
                created_at: new Date().toISOString()
              })
              .select();
            
            if (!retryResponse.error) {
              console.log('재시도 후 메모 추가 성공:', retryResponse.data);
              return NextResponse.json({ success: true, note: retryResponse.data[0] });
            } else {
              console.error('재시도 후에도 메모 추가 오류:', retryResponse.error);
            }
          } else {
            console.error('테이블 재생성 실패:', await recreateResponse.text());
          }
        } catch (recreateError) {
          console.error('테이블 재생성 API 호출 오류:', recreateError);
        }
      }
      
      return NextResponse.json(
        { error: '메모 추가에 실패했습니다.', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('Supabase로 메모 추가 성공:', data);
    return NextResponse.json({ success: true, note: data[0] });
  } catch (error) {
    console.error('메모 추가 API 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: errorMessage },
      { status: 500 }
    );
  }
} 