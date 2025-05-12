import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// 안전한 서버 클라이언트 생성 함수
export function createSafeServerClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // URL 인코딩된 문자가 있는지 확인하고 디코딩
    if (supabaseKey && supabaseKey.includes('%')) {
      supabaseKey = decodeURIComponent(supabaseKey);
    }
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL 또는 API 키가 설정되지 않았습니다.');
    }
    
    return createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      }
    });
  } catch (err) {
    console.error('[API] Supabase 클라이언트 생성 오류:', err);
    throw err;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const { table } = params;
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  // 시작 로그
  console.log(`[API] GET ${table} 테이블 요청 시작`, { id });
  
  // 허용된 테이블 목록
  const allowedTables = [
    'clients',
    'client_todos',
    'client_notes',
    'client_activities',
    'client_external_data',
    'notices',
    'users'
  ];
  
  // 테이블 접근 권한 검사
  if (!allowedTables.includes(table)) {
    console.warn(`[API] 유효하지 않은 테이블 접근 시도: ${table}`);
    return NextResponse.json(
      { error: '유효하지 않은 테이블 이름입니다.' },
      { status: 400 }
    );
  }
  
  try {
    const supabase = createSafeServerClient();
    console.log(`[API] Supabase 클라이언트 생성 성공`);
    
    // 특정 ID의 데이터만 요청한 경우
    if (id) {
      console.log(`[API] ${table} 테이블에서 ID: ${id} 조회 중...`);
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('id', id);
      
      if (error) {
        console.error(`[API] 테이블 ${table} ID: ${id} 조회 오류:`, error);
        return NextResponse.json(
          { error: `테이블 데이터 조회 실패: ${error.message}` },
          { status: 500 }
        );
      }
      
      console.log(`[API] ${table} 테이블 ID: ${id} 데이터 로드 성공`);
      return NextResponse.json(data);
    }
    
    // 전체 데이터 조회시 페이지네이션 적용
    console.log(`[API] ${table} 테이블 전체 데이터 조회 중...`);
    
    // 전체 레코드 수 먼저 확인
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error(`[API] 테이블 ${table} 전체 레코드 수 조회 오류:`, countError);
      return NextResponse.json(
        { error: `테이블 레코드 수 조회 실패: ${countError.message}` },
        { status: 500 }
      );
    }
    
    console.log(`[API] ${table} 테이블 전체 레코드 수: ${count || 0}`);
    
    // 페이지네이션 설정
    const pageSize = 1000; // 한 번에 가져올 최대 레코드 수
    const totalPages = Math.ceil((count || 0) / pageSize);
    let allData: any[] = [];
    
    // 모든 페이지 데이터 가져오기
    for (let page = 0; page < totalPages; page++) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      console.log(`[API] ${table} 페이지 ${page + 1}/${totalPages} 로드 중 (${from}-${to})...`);
      
      const { data: pageData, error: pageError } = await supabase
        .from(table)
        .select('*')
        .range(from, to);
        
      if (pageError) {
        console.error(`[API] 테이블 ${table} 페이지 ${page + 1} 로드 오류:`, pageError);
        return NextResponse.json(
          { error: `테이블 데이터 페이지 ${page + 1} 조회 실패: ${pageError.message}` },
          { status: 500 }
        );
      }
      
      if (pageData && pageData.length > 0) {
        allData = [...allData, ...pageData];
        console.log(`[API] ${table} 페이지 ${page + 1} 데이터 ${pageData.length}개 로드 완료`);
      } else {
        console.log(`[API] ${table} 페이지 ${page + 1}에 데이터가 없습니다.`);
        break; // 더 이상 데이터가 없으면 중단
      }
    }
    
    console.log(`[API] ${table} 테이블 데이터 ${allData.length || 0}개 로드 성공`);
    return NextResponse.json(allData);
  } catch (err: any) {
    console.error(`[API] 테이블 ${table} 조회 중 예외 발생:`, err);
    return NextResponse.json(
      { 
        error: `서버 오류: ${err.message}`,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const { table } = params;
  
  // 허용된 테이블 목록
  const allowedTables = [
    'clients',
    'client_todos',
    'client_notes',
    'client_activities',
    'client_external_data',
    'notices',
    'users'
  ];
  
  // 테이블 접근 권한 검사
  if (!allowedTables.includes(table)) {
    return NextResponse.json(
      { error: '유효하지 않은 테이블 이름입니다.' },
      { status: 400 }
    );
  }
  
  try {
    const requestData = await request.json();
    
    if (!requestData || typeof requestData !== 'object') {
      return NextResponse.json(
        { error: '유효하지 않은 데이터 형식입니다.' },
        { status: 400 }
      );
    }
    
    const supabase = createSafeServerClient();
    
    const { data, error } = await supabase
      .from(table)
      .insert(requestData)
      .select();
    
    if (error) {
      console.error(`[API] 테이블 ${table} 데이터 추가 오류:`, error);
      return NextResponse.json(
        { error: `데이터 추가 실패: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '데이터가 성공적으로 추가되었습니다.',
      data
    });
  } catch (err: any) {
    console.error(`[API] 테이블 ${table} 데이터 추가 중 예외 발생:`, err);
    return NextResponse.json(
      { error: `서버 오류: ${err.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const { table } = params;
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID 파라미터가 필요합니다.' },
      { status: 400 }
    );
  }
  
  // 허용된 테이블 목록
  const allowedTables = [
    'clients',
    'client_todos',
    'client_notes',
    'client_activities',
    'client_external_data',
    'notices',
    'users'
  ];
  
  // 테이블 접근 권한 검사
  if (!allowedTables.includes(table)) {
    return NextResponse.json(
      { error: '유효하지 않은 테이블 이름입니다.' },
      { status: 400 }
    );
  }
  
  try {
    const requestData = await request.json();
    
    if (!requestData || typeof requestData !== 'object') {
      return NextResponse.json(
        { error: '유효하지 않은 데이터 형식입니다.' },
        { status: 400 }
      );
    }
    
    const supabase = createSafeServerClient();
    
    const { data, error } = await supabase
      .from(table)
      .update(requestData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`[API] 테이블 ${table} 데이터 업데이트 오류:`, error);
      return NextResponse.json(
        { error: `데이터 업데이트 실패: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '데이터가 성공적으로 업데이트되었습니다.',
      data
    });
  } catch (err: any) {
    console.error(`[API] 테이블 ${table} 데이터 업데이트 중 예외 발생:`, err);
    return NextResponse.json(
      { error: `서버 오류: ${err.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  const { table } = params;
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json(
      { error: 'ID 파라미터가 필요합니다.' },
      { status: 400 }
    );
  }
  
  // 허용된 테이블 목록
  const allowedTables = [
    'clients',
    'client_todos',
    'client_notes',
    'client_activities',
    'client_external_data',
    'notices',
    'users'
  ];
  
  // 테이블 접근 권한 검사
  if (!allowedTables.includes(table)) {
    return NextResponse.json(
      { error: '유효하지 않은 테이블 이름입니다.' },
      { status: 400 }
    );
  }
  
  try {
    const supabase = createSafeServerClient();
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`[API] 테이블 ${table} 데이터 삭제 오류:`, error);
      return NextResponse.json(
        { error: `데이터 삭제 실패: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '데이터가 성공적으로 삭제되었습니다.'
    });
  } catch (err: any) {
    console.error(`[API] 테이블 ${table} 데이터 삭제 중 예외 발생:`, err);
    return NextResponse.json(
      { error: `서버 오류: ${err.message}` },
      { status: 500 }
    );
  }
} 