import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

// clients 테이블 설정 SQL
const SETUP_CLIENTS_SQL = `
-- clients 테이블이 있는지 확인하고 없으면 생성
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏢',
  contract_start DATE,
  contract_end DATE,
  status_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  uses_coupon BOOLEAN DEFAULT false,
  publishes_news BOOLEAN DEFAULT false,
  uses_reservation BOOLEAN DEFAULT false,
  phone_number TEXT DEFAULT '',
  naver_place_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 업데이트 시 updated_at 자동 갱신을 위한 트리거
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거가 없는 경우에만 생성
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at'
  ) THEN
    CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;
`;

// client_todos 테이블 설정 SQL
const SETUP_TODOS_SQL = `
-- client_todos 테이블이 있는지 확인하고 없으면 생성
CREATE TABLE IF NOT EXISTS client_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  content TEXT NOT NULL,
  assigned_to TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- completed_at 컬럼 존재 여부 확인 및 추가
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- completed_at 컬럼이 존재하는지 확인
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'client_todos' 
        AND column_name = 'completed_at'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        -- 컬럼이 없으면 추가
        ALTER TABLE public.client_todos ADD COLUMN completed_at TIMESTAMPTZ;
        RAISE NOTICE 'completed_at 컬럼을 추가했습니다.';
    ELSE
        RAISE NOTICE 'completed_at 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- completed_by 컬럼 존재 여부 확인 및 추가
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- completed_by 컬럼이 존재하는지 확인
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'client_todos' 
        AND column_name = 'completed_by'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        -- 컬럼이 없으면 추가
        ALTER TABLE public.client_todos ADD COLUMN completed_by TEXT;
        RAISE NOTICE 'completed_by 컬럼을 추가했습니다.';
    ELSE
        RAISE NOTICE 'completed_by 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- 기존에 완료된 할 일에 completed_at 설정
UPDATE public.client_todos
SET completed_at = created_at
WHERE completed = TRUE AND completed_at IS NULL;

-- 완료 상태 인덱스 추가 
CREATE INDEX IF NOT EXISTS idx_client_todos_completed ON public.client_todos(completed);

-- 완료 시간 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_client_todos_completed_at ON public.client_todos(completed_at);
`;

// 메모 테이블 설정 SQL
const SETUP_NOTES_SQL = `
-- client_notes 테이블이 있는지 확인하고 없으면 생성
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_created_at ON client_notes(created_at);
`;

// 샘플 데이터 삽입 SQL
const INSERT_SAMPLE_DATA_SQL = `
-- 샘플 클라이언트 데이터 삽입 (이미 존재하지 않는 경우에만)
INSERT INTO clients (name, icon, contract_start, contract_end, status_tags)
SELECT '샘플 광고주', '🏢', '2024-01-01', '2024-12-31', ARRAY['샘플']
WHERE NOT EXISTS (
  SELECT 1 FROM clients WHERE name = '샘플 광고주'
);

-- 샘플 클라이언트 ID 가져오기
DO $$
DECLARE
  sample_client_id UUID;
BEGIN
  SELECT id INTO sample_client_id FROM clients WHERE name = '샘플 광고주' LIMIT 1;
  
  IF sample_client_id IS NOT NULL THEN
    -- 샘플 할 일 데이터 삽입 (이미 존재하지 않는 경우에만)
    INSERT INTO client_todos (client_id, content, completed)
    SELECT sample_client_id, '샘플 할 일 1', false
    WHERE NOT EXISTS (
      SELECT 1 FROM client_todos WHERE client_id = sample_client_id AND content = '샘플 할 일 1'
    );
    
    INSERT INTO client_todos (client_id, content, completed)
    SELECT sample_client_id, '샘플 할 일 2', true
    WHERE NOT EXISTS (
      SELECT 1 FROM client_todos WHERE client_id = sample_client_id AND content = '샘플 할 일 2'
    );
    
    -- 샘플 메모 데이터 삽입 (이미 존재하지 않는 경우에만)
    INSERT INTO client_notes (client_id, note, created_by)
    SELECT sample_client_id, '샘플 메모 1 - 중요한 사항입니다.', '시스템'
    WHERE NOT EXISTS (
      SELECT 1 FROM client_notes WHERE client_id = sample_client_id AND note = '샘플 메모 1 - 중요한 사항입니다.'
    );
  END IF;
END $$;
`;

export async function GET(request: Request) {
  try {
    console.log('Supabase 초기 설정 API 호출됨');
    
    // Supabase 클라이언트 생성
    const supabase = createServerClient();
    
    // 테이블 설정 및 초기화 작업
    const results = {
      clients_setup: null as any,
      todos_setup: null as any,
      notes_setup: null as any,
      sample_data: null as any,
      errors: [] as string[]
    };
    
    try {
      // clients 테이블 설정
      const { data: clientsSetupData, error: clientsSetupError } = await supabase.rpc('exec_sql', {
        sql_query: SETUP_CLIENTS_SQL
      });
      
      results.clients_setup = {
        success: !clientsSetupError,
        data: clientsSetupData,
        error: clientsSetupError
      };
      
      if (clientsSetupError) {
        results.errors.push(`clients 테이블 설정 오류: ${clientsSetupError.message}`);
      } else {
        console.log('clients 테이블 설정 완료');
      }
    } catch (clientsError) {
      results.errors.push(`clients 테이블 설정 중 예외 발생: ${clientsError instanceof Error ? clientsError.message : '알 수 없는 오류'}`);
    }
    
    try {
      // client_todos 테이블 설정
      const { data: todosSetupData, error: todosSetupError } = await supabase.rpc('exec_sql', {
        sql_query: SETUP_TODOS_SQL
      });
      
      results.todos_setup = {
        success: !todosSetupError,
        data: todosSetupData,
        error: todosSetupError
      };
      
      if (todosSetupError) {
        results.errors.push(`client_todos 테이블 설정 오류: ${todosSetupError.message}`);
      } else {
        console.log('client_todos 테이블 설정 완료');
      }
    } catch (todosError) {
      results.errors.push(`client_todos 테이블 설정 중 예외 발생: ${todosError instanceof Error ? todosError.message : '알 수 없는 오류'}`);
    }
    
    try {
      // client_notes 테이블 설정
      const { data: notesSetupData, error: notesSetupError } = await supabase.rpc('exec_sql', {
        sql_query: SETUP_NOTES_SQL
      });
      
      results.notes_setup = {
        success: !notesSetupError,
        data: notesSetupData,
        error: notesSetupError
      };
      
      if (notesSetupError) {
        results.errors.push(`client_notes 테이블 설정 오류: ${notesSetupError.message}`);
      } else {
        console.log('client_notes 테이블 설정 완료');
      }
    } catch (notesError) {
      results.errors.push(`client_notes 테이블 설정 중 예외 발생: ${notesError instanceof Error ? notesError.message : '알 수 없는 오류'}`);
    }
    
    // 개발 환경에서만 샘플 데이터 추가
    if (process.env.NODE_ENV === 'development') {
      try {
        const { data: sampleDataResult, error: sampleDataError } = await supabase.rpc('exec_sql', {
          sql_query: INSERT_SAMPLE_DATA_SQL
        });
        
        results.sample_data = {
          success: !sampleDataError,
          data: sampleDataResult,
          error: sampleDataError
        };
        
        if (sampleDataError) {
          results.errors.push(`샘플 데이터 삽입 오류: ${sampleDataError.message}`);
        } else {
          console.log('샘플 데이터 삽입 완료');
        }
      } catch (sampleError) {
        results.errors.push(`샘플 데이터 삽입 중 예외 발생: ${sampleError instanceof Error ? sampleError.message : '알 수 없는 오류'}`);
      }
    }
    
    // 테이블 목록 조회하여 결과에 포함
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    return NextResponse.json({
      success: results.errors.length === 0,
      results,
      tables: tables || [],
      tablesError: tablesError || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Supabase 설정 API 오류:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 