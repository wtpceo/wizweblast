import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function GET(request: Request) {
  try {
    // Supabase 클라이언트 생성
    const supabase = createServerClient();
    
    // updated_at 컬럼 추가
    const { error: columnError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE clients 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        
        -- 트리거 함수 생성
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- 트리거가 이미 존재하는지 확인 후 없는 경우에만 생성
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at'
          ) THEN
            CREATE TRIGGER update_clients_updated_at
            BEFORE UPDATE ON clients
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
          END IF;
        END;
        $$;
      `
    });
    
    if (columnError) {
      console.error('updated_at 컬럼 추가 오류:', columnError);
      return NextResponse.json(
        { error: `updated_at 컬럼 추가 실패: ${columnError.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'updated_at 컬럼과 자동 업데이트 트리거가 성공적으로 추가되었습니다'
    });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 