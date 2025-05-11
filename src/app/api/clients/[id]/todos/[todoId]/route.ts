import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

// UUID 패턴을 확인하는 함수
const isValidUUID = (str: string) => {
  const regexExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regexExp.test(str);
};

// ID를 UUID 형식으로 변환하는 함수
const formatToUUID = (id: string) => {
  if (isValidUUID(id)) return id;
  
  try {
    // 숫자 또는 문자열에서 UUID v4 형식으로 변환 시도
    const uuid = `00000000-0000-4000-8000-${id.padStart(12, '0')}`;
    console.log(`ID를 UUID 형식으로 변환: ${id} -> ${uuid}`);
    return uuid;
  } catch (error) {
    console.error('UUID 변환 실패:', error);
    return id; // 변환 실패 시 원래 값 반환
  }
};

// 특정 할 일 조회 API
export async function GET(
  request: Request,
  { params }: { params: { id: string; todoId: string } }
) {
  try {
    const clientId = formatToUUID(params.id);
    const todoId = formatToUUID(params.todoId);
    
    console.log(`특정 할 일 조회: clientId=${clientId}, todoId=${todoId}`);
    
    // 할 일 조회
    const { data, error } = await supabase
      .from('client_todos')
      .select('*')
      .eq('id', todoId)
      .eq('client_id', clientId)
      .single();
    
    if (error) {
      console.error('할 일 조회 오류:', error);
      return NextResponse.json(
        { error: '할 일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('할 일 조회 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 할 일 삭제 API
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; todoId: string } }
) {
  try {
    const clientId = formatToUUID(params.id);
    const todoId = formatToUUID(params.todoId);
    
    console.log(`할 일 삭제: clientId=${clientId}, todoId=${todoId}`);
    
    // 할 일 삭제
    const { error } = await supabase
      .from('client_todos')
      .delete()
      .eq('id', todoId)
      .eq('client_id', clientId);
    
    if (error) {
      console.error('할 일 삭제 오류:', error);
      return NextResponse.json(
        { error: '할 일 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('할 일 삭제 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 할 일 업데이트 API (내용 변경)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; todoId: string } }
) {
  try {
    const clientId = formatToUUID(params.id);
    const todoId = formatToUUID(params.todoId);
    const body = await request.json();
    const { content, title, assignedTo, completed } = body;
    
    if (!content && !title && assignedTo === undefined && completed === undefined) {
      return NextResponse.json(
        { error: '변경할 내용이 없습니다.' },
        { status: 400 }
      );
    }
    
    console.log(`할 일 업데이트: clientId=${clientId}, todoId=${todoId}`);
    
    // 업데이트할 데이터 준비
    const updateData: Record<string, any> = {};
    
    if (content !== undefined) updateData.content = content;
    if (title !== undefined) updateData.title = title;
    if (assignedTo !== undefined) updateData.assigned_to = assignedTo;
    
    // 완료 상태가 변경되었을 경우 완료 날짜도 업데이트
    if (completed !== undefined) {
      updateData.completed = completed;
      
      // 완료 시간 및 처리자 정보 업데이트
      if (completed) {
        const { userId } = await auth();
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = userId || 'unknown';
      } else {
        // 완료 취소 시 관련 정보 초기화
        updateData.completed_at = null;
        updateData.completed_by = null;
      }
    }
    
    console.log('업데이트할 데이터:', updateData);
    
    // 할 일 업데이트
    const { data, error } = await supabase
      .from('client_todos')
      .update(updateData)
      .eq('id', todoId)
      .eq('client_id', clientId)
      .select();
    
    if (error) {
      console.error('할 일 업데이트 오류:', error);
      return NextResponse.json(
        { error: '할 일 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, todo: data[0] });
  } catch (error) {
    console.error('할 일 업데이트 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 