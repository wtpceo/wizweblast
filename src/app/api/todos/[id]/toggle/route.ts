import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

/**
 * 업데이트 데이터 타입 정의
 */
interface TodoUpdateData {
  completed: boolean;
  completed_at?: string | null;
  completed_by?: string | null;
}

/**
 * 할 일 완료 상태 토글 API
 * PATCH /api/todos/[id]/toggle
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 확인
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    const resolvedParams = await params;
    const todoId = resolvedParams.id;
    
    if (!todoId) {
      return NextResponse.json(
        { error: '할 일 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 기존 할 일 정보 조회
    const { data: todoData, error: todoError } = await supabase
      .from('client_todos')
      .select('completed')
      .eq('id', todoId)
      .single();
      
    if (todoError) {
      return NextResponse.json(
        { error: '할 일 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 반전된 완료 상태
    const newCompletedState = !todoData.completed;
    const now = new Date().toISOString();
    
    // 간단하게 하나의 필드만 업데이트
    let updateData: TodoUpdateData = { completed: newCompletedState };
    
    // 완료 상태가 되면 완료 시간과 완료자를 기록, 아니면 null로 설정
    if (newCompletedState) {
      updateData = {
        ...updateData,
        completed_at: now,
        completed_by: userId
      };
    } else {
      updateData = {
        ...updateData,
        completed_at: null,
        completed_by: null
      };
    }
    
    // 할 일 상태 업데이트
    const { data, error } = await supabase
      .from('client_todos')
      .update(updateData)
      .eq('id', todoId)
      .select('*, clients(id, name, icon)');
    
    if (error) {
      console.error('할 일 상태 업데이트 오류:', error);
      
      // 스키마를 확인하고 문제가 있는 경우 기록
      if (error.message.includes('column') && error.message.includes('not exist')) {
        return NextResponse.json(
          { 
            error: '데이터베이스 스키마 오류',
            message: error.message,
            suggestion: '스키마를 업데이트하기 위해 /api/update-todos-schema 엔드포인트를 호출하세요.'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `데이터베이스 업데이트 실패: ${error.message}` },
        { status: 500 }
      );
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: '할 일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 광고주의 last_activity_at 업데이트
    try {
      const clientId = data[0].client_id;
      
      const { error: updateError } = await supabase
        .from('clients')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', clientId);
      
      if (updateError) {
        console.warn('광고주 최근 활동 시간 업데이트 실패:', updateError);
      } else {
        console.log(`광고주 ID ${clientId}의 최근 활동 시간이 업데이트되었습니다.`);
      }
    } catch (updateError) {
      console.warn('광고주 최근 활동 시간 업데이트 중 오류:', updateError);
    }
    
    return NextResponse.json({
      success: true,
      todo: data[0]
    });
  } catch (error) {
    console.error('할 일 상태 토글 API 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 