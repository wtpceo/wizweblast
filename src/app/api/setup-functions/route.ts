import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// exec_sql 및 기타 유틸리티 함수 생성 SQL
const SETUP_FUNCTIONS_SQL = `
-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- exec_sql 함수 생성
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- 서버 타임스탬프 가져오는 함수
CREATE OR REPLACE FUNCTION get_server_timestamp()
RETURNS TIMESTAMPTZ
LANGUAGE SQL
AS $$
  SELECT NOW();
$$;

-- 테이블 존재 여부 확인 함수
CREATE OR REPLACE FUNCTION table_exists(schema_name TEXT, table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  exists_bool BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = schema_name
    AND table_name = table_name
  ) INTO exists_bool;
  
  RETURN exists_bool;
END;
$$;
`;

export async function GET(request: Request) {
  try {
    console.log('Supabase 함수 설정 API 호출됨');
    
    // Supabase 클라이언트 생성
    const supabase = createServerClient();
    
    // 함수 생성 시도
    try {
      // 먼저 exec_sql 함수 실행 시도
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: SETUP_FUNCTIONS_SQL
        });
        
        if (error) {
          console.error('함수 설정 SQL 오류:', error);
          return NextResponse.json({
            success: false,
            message: '함수 설정에 실패했습니다.',
            error: error
          });
        }
        
        console.log('함수 설정 성공');
        return NextResponse.json({
          success: true,
          message: 'Supabase 함수 설정이 완료되었습니다.',
          data: data
        });
      } catch (execError: unknown) {
        // exec_sql 함수가 없는 경우 이 부분이 실행됨
        console.log('exec_sql 함수가 없습니다. 직접 SQL 실행을 시도합니다.');
        
        // 사용자에게 직접 SQL 실행 안내
        return NextResponse.json({
          success: false,
          message: 'Supabase에 필요한 SQL 함수가 설정되어 있지 않습니다.',
          instructions: `
Supabase SQL 에디터에서 다음 SQL을 실행하여 필요한 함수를 설정해주세요:

${SETUP_FUNCTIONS_SQL}

함수 설정 후 다시 시도해주세요.
          `,
          error: execError instanceof Error ? execError.message : 'exec_sql 함수가 없습니다.'
        });
      }
    } catch (err: unknown) {
      console.error('함수 설정 중 예외 발생:', err);
      return NextResponse.json({
        success: false,
        message: '함수 설정 중 예외가 발생했습니다.',
        error: err instanceof Error ? err.message : '알 수 없는 오류'
      }, { status: 500 });
    }
  } catch (error: unknown) {
    console.error('Supabase 함수 설정 API 오류:', error);
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// POST 메서드도 동일하게 처리
export async function POST(request: Request) {
  return GET(request);
} 