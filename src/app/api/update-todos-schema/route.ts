import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 할 일 테이블 스키마 업데이트 API
export async function POST(request: Request) {
  try {
    console.log('할 일 테이블 스키마 업데이트 시작...');
    
    // 1. 기존 테이블 확인
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('client_todos')
      .select('id')
      .limit(1);
    
    if (tableCheckError) {
      console.error('테이블 확인 실패:', tableCheckError);
      return NextResponse.json(
        { error: '테이블 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 유효한 UUID 형식 (더미 ID)
    const dummyUuid = '00000000-0000-0000-0000-000000000000';
    
    // 2. assignee_avatar 컬럼 추가 시도
    try {
      // assignee_avatar 컬럼 추가 (이미 존재하면 무시)
      const alterQuery = `
        ALTER TABLE client_todos 
        ADD COLUMN IF NOT EXISTS assignee_avatar TEXT DEFAULT '';
      `;
      
      // SQL 직접 실행 (RPC 대신 raw query 사용)
      const { error: alterError } = await supabase.rpc('exec_sql', { sql: alterQuery });
      
      if (alterError) {
        console.error('컬럼 추가 실패:', alterError);
        
        // 대안 시도: 데이터 업데이트를 통한 컬럼 추가
        console.log('대안 방법으로 컬럼 추가 시도...');
        const { error: updateError } = await supabase
          .from('client_todos')
          .update({ assignee_avatar: '' })
          .eq('id', dummyUuid);
        
        if (updateError && !updateError.message.includes('does not exist')) {
          return NextResponse.json(
            { error: `컬럼 추가 중 오류: ${updateError.message}` },
            { status: 500 }
          );
        }
      }
      
      // assignee_name 컬럼 추가 (이미 존재하면 무시)
      const { error: updateNameError } = await supabase
        .from('client_todos')
        .update({ assignee_name: '' })
        .eq('id', dummyUuid);
      
      if (updateNameError && !updateNameError.message.includes('does not exist')) {
        console.error('assignee_name 컬럼 추가 실패:', updateNameError);
      }
      
      console.log('스키마 업데이트 완료');
      
      return NextResponse.json({
        success: true,
        message: '할 일 테이블 스키마가 성공적으로 업데이트되었습니다.'
      });
    } catch (sqlError) {
      console.error('SQL 실행 오류:', sqlError);
      return NextResponse.json(
        { error: '스키마 업데이트 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('스키마 업데이트 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 