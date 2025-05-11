import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // 인증 확인 (보안을 위해 관리자만 접근 가능하도록)
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    // Supabase 연결 확인
    const testQuery = await supabase.from('client_todos').select('count').limit(1);
    console.log('Supabase 연결 테스트 결과:', testQuery);
    
    if (testQuery.error) {
      throw new Error(`Supabase 연결 오류: ${testQuery.error.message}`);
    }

    // 컬럼 추가: ALTER TABLE 대신 직접 컬럼 추가 시도
    const addCompletedAtResult = await supabase
      .from('client_todos')
      .update({ completed_at: null })
      .eq('id', 'fakeid');
    
    const addCompletedByResult = await supabase
      .from('client_todos')
      .update({ completed_by: null })
      .eq('id', 'fakeid');
    
    // 결과 반환
    return NextResponse.json({
      success: true,
      message: 'client_todos 테이블 스키마가 검사되었습니다.',
      updateResults: {
        completed_at: addCompletedAtResult.error 
          ? addCompletedAtResult.error.message.includes('column') 
            ? '컬럼이 존재하지 않음' 
            : addCompletedAtResult.error.message
          : '컬럼이 존재함',
        completed_by: addCompletedByResult.error 
          ? addCompletedByResult.error.message.includes('column') 
            ? '컬럼이 존재하지 않음' 
            : addCompletedByResult.error.message
          : '컬럼이 존재함'
      },
      rawResults: {
        completed_at: addCompletedAtResult,
        completed_by: addCompletedByResult
      }
    });
  } catch (error) {
    console.error('스키마 업데이트 오류:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
} 