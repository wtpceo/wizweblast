import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function GET() {
  try {
    console.log('Supabase 연결 테스트 시작');
    const supabase = createServerClient();
    
    // 1. 데이터베이스 연결 상태 확인
    try {
      const { data: timeData, error: timeError } = await supabase
        .from('_test_connection')
        .select('now()')
        .limit(1)
        .single();
      
      if (timeError) {
        if (timeError.code === 'PGRST116') {
          console.log('테이블이 없는 오류 (정상):', timeError.message);
        } else {
          console.error('데이터베이스 연결 오류:', timeError);
          throw timeError;
        }
      } else {
        console.log('데이터베이스 시간 확인 성공:', timeData);
      }
    } catch (dbError) {
      console.error('데이터베이스 검사 오류:', dbError);
    }

    // 2. 서버 정보 확인
    try {
      const { data: versionData, error: versionError } = await supabase
        .rpc('get_server_version');
      
      if (versionError) {
        console.error('서버 버전 확인 오류:', versionError);
      } else {
        console.log('서버 버전 확인 성공:', versionData);
      }
    } catch (versionError) {
      console.error('서버 버전 확인 처리 오류:', versionError);
    }

    // 3. clients 테이블 확인
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('clients')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error('clients 테이블 확인 오류:', tableError);
        
        // 테이블이 없으면 내용 출력
        if (tableError.code === 'PGRST116') {
          console.log('clients 테이블이 존재하지 않습니다. SQL 스크립트를 실행해야 합니다.');
        }
      } else {
        console.log('clients 테이블 접근 성공:', tableData);
      }
    } catch (tableError) {
      console.error('테이블 확인 처리 오류:', tableError);
    }

    // 응답 구성
    return NextResponse.json({
      status: 'success',
      message: 'Supabase 연결 확인 완료',
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15) + '...',
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
  } catch (error) {
    console.error('Supabase 연결 테스트 오류:', error);
    return NextResponse.json({
      status: 'error',
      message: '연결 테스트 실패',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 