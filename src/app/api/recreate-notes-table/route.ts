import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// client_notes 테이블 재생성 SQL
const RECREATE_NOTES_TABLE_SQL = `
-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 기존 테이블의 외래 키 제약 조건 제거 시도
ALTER TABLE IF EXISTS client_notes
DROP CONSTRAINT IF EXISTS client_notes_client_id_fkey;

-- 테이블 삭제 후 재생성
DROP TABLE IF EXISTS client_notes;

-- 테이블 생성 (외래 키 제약 없이)
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  note TEXT NOT NULL,
  photo TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_created_at ON client_notes(created_at);
`;

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    console.log('client_notes 테이블 재생성 시작...');
    
    // 1. 테이블 재생성 SQL 실행
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: RECREATE_NOTES_TABLE_SQL
    });
    
    if (error) {
      console.error('테이블 재생성 SQL 오류:', error);
      
      // 개별 단계로 시도
      console.log('개별 단계로 테이블 재생성 시도...');
      
      // 1. UUID 확장 활성화
      try {
        await supabase.rpc('exec_sql', {
          sql_query: 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
        });
        console.log('UUID 확장 활성화 성공');
      } catch (extError) {
        console.error('UUID 확장 활성화 실패:', extError);
      }
      
      // 2. 외래 키 제약 조건 제거
      try {
        await supabase.rpc('exec_sql', {
          sql_query: 'ALTER TABLE IF EXISTS client_notes DROP CONSTRAINT IF EXISTS client_notes_client_id_fkey;'
        });
        console.log('외래 키 제약 조건 제거 성공');
      } catch (constraintError) {
        console.error('외래 키 제약 조건 제거 실패:', constraintError);
      }
      
      // 3. 테이블 삭제
      try {
        await supabase.rpc('exec_sql', {
          sql_query: 'DROP TABLE IF EXISTS client_notes;'
        });
        console.log('기존 테이블 삭제 성공');
      } catch (dropError) {
        console.error('테이블 삭제 실패:', dropError);
      }
      
      // 4. 테이블 생성
      try {
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS client_notes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_id UUID NOT NULL,
            note TEXT NOT NULL,
            photo TEXT,
            created_by TEXT,
            created_at TIMESTAMPTZ DEFAULT now()
          );
          
          CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
          CREATE INDEX IF NOT EXISTS idx_client_notes_created_at ON client_notes(created_at);
        `;
        
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql_query: createTableSQL
        });
        
        if (createError) {
          console.error('테이블 생성 오류:', createError);
          return NextResponse.json(
            { success: false, error: createError.message },
            { status: 500 }
          );
        }
        
        console.log('테이블 생성 성공');
      } catch (createError) {
        console.error('테이블 생성 중 오류:', createError);
        return NextResponse.json(
          { success: false, error: createError instanceof Error ? createError.message : '알 수 없는 오류' },
          { status: 500 }
        );
      }
    } else {
      console.log('테이블 재생성 SQL 실행 성공');
    }
    
    // 5. 테이블 생성 확인
    try {
      const checkTableSQL = `
        SELECT EXISTS (
          SELECT FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename = 'client_notes'
        );
      `;

      const { data: tableExistsData, error: tableExistsError } = await supabase.rpc('exec_sql', {
        sql_query: checkTableSQL
      });

      if (tableExistsError) {
        console.error('테이블 존재 여부 확인 오류:', tableExistsError);
      } else {
        console.log('테이블 존재 여부 확인 성공:', tableExistsData);
      }
    } catch (checkError) {
      console.error('테이블 확인 과정 중 오류:', checkError);
    }
    
    // 6. 응답 반환
    return NextResponse.json({
      success: true,
      message: 'client_notes 테이블이 성공적으로 재생성되었습니다.',
      data: { success: true }
    });
  } catch (error) {
    console.error('client_notes 테이블 재생성 중 오류:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 