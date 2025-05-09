import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 할 일 목록 조회 API
export async function GET(request: Request) {
  try {
    // URL에서 파라미터 추출
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    const assignedTo = url.searchParams.get('assignedTo');
    const completed = url.searchParams.get('completed');
    
    // Supabase 쿼리 구성
    let query = supabase
      .from('client_todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 필터 적용
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo);
    }
    
    if (completed !== null) {
      query = query.eq('completed', completed === 'true');
    }
    
    // 데이터 조회
    const { data, error } = await query;
    
    if (error) {
      console.error('할 일 목록 조회 오류:', error);
      return NextResponse.json({ error: '할 일 목록을 가져오는 데 실패했습니다.' }, { status: 500 });
    }
    
    // 응답 데이터 형식 변환
    const formattedData = data.map(todo => ({
      id: todo.id,
      clientId: todo.client_id,
      content: todo.content,
      assignedTo: todo.assigned_to,
      completed: todo.completed,
      createdAt: todo.created_at
    }));
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('할 일 목록 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 할 일 추가 API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, content, assignedTo } = body;
    
    // 필수 필드 검증
    if (!clientId || !content || !assignedTo) {
      return NextResponse.json(
        { error: '광고주 ID, 할 일 내용, 담당자는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 할 일 데이터 삽입
    const { data, error } = await supabase
      .from('client_todos')
      .insert({
        client_id: clientId,
        content,
        assigned_to: assignedTo,
        completed: false,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('할 일 추가 오류:', error);
      return NextResponse.json({ error: '할 일 추가에 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      todo: {
        id: data[0].id,
        clientId: data[0].client_id,
        content: data[0].content,
        assignedTo: data[0].assigned_to,
        completed: data[0].completed,
        createdAt: data[0].created_at
      }
    });
  } catch (error) {
    console.error('할 일 추가 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 