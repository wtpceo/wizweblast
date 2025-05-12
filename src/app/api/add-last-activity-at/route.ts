import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

/**
 * 광고주 테이블에 last_activity_at 컬럼 추가 API
 * GET /api/add-last-activity-at
 */
export async function GET(request: Request) {
  try {
    // Supabase 클라이언트 생성
    const supabase = createServerClient();
    
    // last_activity_at 컬럼 추가
    const { error: columnError } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- 광고주 테이블에 last_activity_at 컬럼 추가
        ALTER TABLE clients 
        ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        
        -- 모든 광고주의 last_activity_at을 현재 시간으로 초기화
        UPDATE clients 
        SET last_activity_at = now() 
        WHERE last_activity_at IS NULL;
        
        -- 설명 추가
        COMMENT ON COLUMN clients.last_activity_at IS '광고주의 최근 활동 일시 (할일 등록, 완료 등)';
      `
    });
    
    if (columnError) {
      console.error('last_activity_at 컬럼 추가 오류:', columnError);
      return NextResponse.json(
        { error: 'last_activity_at 컬럼 추가 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'last_activity_at 컬럼이 성공적으로 추가되었습니다.' 
    });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 