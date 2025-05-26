import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

/**
 * 할 일 담당자 변경 API
 * PATCH /api/todos/[id]/assign
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
    
    const body = await request.json();
    const { newAssigneeId } = body;
    
    if (!newAssigneeId) {
      return NextResponse.json(
        { error: '새 담당자 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 권한 확인: 본인이 담당한 할 일 또는 관리자인지 확인
    try {
      const { data: todoData, error: todoError } = await supabase
        .from('client_todos')
        .select('assigned_to, client_id')
        .eq('id', todoId)
        .single();
        
      if (todoError) {
        return NextResponse.json(
          { error: '할 일 정보를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      
      // 관리자 권한 확인 (실제 구현 시 관리자 테이블 참조)
      const isAdmin = false;
      
      // 담당자가 아니고 관리자도 아닌 경우
      if (todoData.assigned_to !== userId && !isAdmin) {
        return NextResponse.json(
          { error: '본인이 담당한 할 일만 담당자를 변경할 수 있습니다.' },
          { status: 403 }
        );
      }
    } catch (authError) {
      console.error('권한 확인 실패:', authError);
      return NextResponse.json(
        { error: '권한 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 담당자 존재 여부 확인 (실제 구현 시 사용자 테이블 참조)
    // 모의 환경에서는 건너뜀
    
    // 담당자 업데이트
    const { data, error } = await supabase
      .from('client_todos')
      .update({
        assigned_to: newAssigneeId,
        updated_at: new Date().toISOString()
      })
      .eq('id', todoId)
      .select();
    
    if (error) {
      console.error('할 일 담당자 업데이트 오류:', error);
      return NextResponse.json(
        { error: '할 일 담당자 업데이트 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: '할 일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 클라이언트 정보 가져오기
    const { data: clientData } = await supabase
      .from('clients')
      .select('name, icon')
      .eq('id', data[0].client_id)
      .single();
    
    // 담당자 정보 가져오기 (실제 구현 시 사용자 테이블 참조)
    const assigneeName = '새 담당자'; // 예시 이름
    
    return NextResponse.json({
      success: true,
      todo: {
        id: data[0].id,
        clientId: data[0].client_id,
        clientName: clientData?.name,
        clientIcon: clientData?.icon,
        content: data[0].content,
        assignedTo: data[0].assigned_to,
        assigneeName,
        completed: data[0].completed,
        createdAt: data[0].created_at,
        completedAt: data[0].completed_at,
        completedBy: data[0].completed_by,
        dueDate: data[0].due_date
      }
    });
  } catch (error) {
    console.error('할 일 담당자 변경 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 