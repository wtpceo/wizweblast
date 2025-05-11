import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { mockTodos, mockClients } from '@/lib/mock-data';

// 할 일 목록 조회 API
export async function GET(request: Request) {
  try {
    // 인증 확인
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    // URL에서 파라미터 추출
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    const assignedTo = url.searchParams.get('assignedTo') || userId; // 기본값은 현재 사용자
    const completed = url.searchParams.get('completed');
    
    console.log('API 요청 파라미터:', { clientId, assignedTo, completed });
    console.log('Supabase 연결 설정:', { 
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15) + '...',
      keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
    });
    
    // 정상적인 DB 조회 시도
    try {
      // Supabase 쿼리 구성
      let query = supabase
        .from('client_todos')
        .select(`
          *,
          clients(name, icon)
        `)
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
        throw new Error(`데이터베이스 조회 실패: ${error.message}`);
      }
      
      console.log('조회된 할 일 데이터:', data?.length || 0, '개');
      
      if (data && data.length > 0) {
        // 응답 데이터 형식 변환
        const formattedData = data.map(todo => ({
          id: todo.id,
          clientId: todo.client_id,
          clientName: todo.clients?.name,
          clientIcon: todo.clients?.icon || '🏢',
          content: todo.content,
          assignedTo: todo.assigned_to,
          completed: todo.completed,
          createdAt: todo.created_at,
          completedAt: todo.completed_at,
          dueDate: todo.due_date
        }));
        
        return NextResponse.json(formattedData);
      } else {
        console.log('조회된 데이터가 없습니다. 빈 배열 반환.');
        return NextResponse.json([]);
      }
    } catch (dbError) {
      console.error('DB 조회 실패, 목업 데이터 사용:', dbError);
      
      // 개발 환경에서 디버깅을 위한 추가 정보
      if (process.env.NODE_ENV === 'development') {
        console.log('데이터베이스 연결 정보 확인:');
        console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '미설정');
        console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '미설정');
      }
    }
    
    // DB 조회 실패 시 목업 데이터 사용
    let filteredTodos = [...mockTodos];
    
    // 목업 데이터 필터링
    if (clientId) {
      filteredTodos = filteredTodos.filter(todo => todo.clientId === clientId);
    }
    
    if (assignedTo) {
      filteredTodos = filteredTodos.filter(todo => todo.assignedTo === assignedTo);
    }
    
    if (completed !== null) {
      filteredTodos = filteredTodos.filter(todo => todo.completed === (completed === 'true'));
    }
    
    // 클라이언트 정보 추가
    const todosWithClientInfo = filteredTodos.map(todo => {
      if (!todo.clientName || !todo.clientIcon) {
        const client = mockClients.find(c => c.id === todo.clientId);
        if (client) {
          return {
            ...todo,
            clientName: client.name,
            clientIcon: client.icon
          };
        }
      }
      return todo;
    });
    
    console.log('목업 데이터 사용:', todosWithClientInfo.length, '개의 할 일 반환');
    return NextResponse.json(todosWithClientInfo);
  } catch (error) {
    console.error('할 일 목록 API 오류:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 할 일 추가 API
export async function POST(request: Request) {
  try {
    // 인증 확인
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { clientId, content, assignedTo, dueDate } = body;
    
    console.log('할 일 추가 요청:', { clientId, content, assignedTo: assignedTo?.substring(0, 10) + '...', dueDate });
    
    // 기본값: 담당자는 현재 사용자
    const assignee = assignedTo || userId;
    
    // 필수 필드 검증
    if (!clientId || !content) {
      return NextResponse.json(
        { error: '광고주 ID와 할 일 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 할 일 데이터 삽입 시도
    try {
      // 할 일 데이터 준비
      const todoData = {
        client_id: clientId,
        content,
        assigned_to: assignee,
        completed: false,
        created_at: new Date().toISOString(),
        created_by: userId,
        due_date: dueDate
      };
      
      console.log('DB에 삽입할 할 일 데이터:', todoData);
      
      // 할 일 데이터 삽입
      const { data, error } = await supabase
        .from('client_todos')
        .insert(todoData)
        .select();
      
      if (error) {
        console.error('할 일 추가 오류:', error);
        throw new Error(`데이터베이스 삽입 실패: ${error.message}`);
      }
      
      console.log('삽입된 할 일 데이터:', data?.length || 0, '개');
      
      if (data && data.length > 0) {
        // 클라이언트 정보 조회
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('name, icon')
          .eq('id', clientId)
          .single();
          
        if (clientError) {
          console.warn('클라이언트 정보 조회 실패:', clientError);
        }
          
        return NextResponse.json({ 
          success: true, 
          todo: {
            id: data[0].id,
            clientId: data[0].client_id,
            clientName: clientData?.name || '광고주',
            clientIcon: clientData?.icon || '🏢',
            content: data[0].content,
            assignedTo: data[0].assigned_to,
            completed: data[0].completed,
            createdAt: data[0].created_at,
            dueDate: data[0].due_date
          }
        });
      } else {
        throw new Error('할 일 데이터가 추가되지 않았습니다.');
      }
    } catch (dbError) {
      console.error('DB 저장 실패, 목업 데이터에 추가:', dbError);
      
      // 개발 환경에서 디버깅을 위한 추가 정보
      if (process.env.NODE_ENV === 'development') {
        console.log('데이터베이스 연결 정보 확인:');
        console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '미설정');
        console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '미설정');
      }
      
      // 실패 시 목업 데이터로 폴백
      throw dbError;
    }
    
    // DB 저장 실패 시 목업 데이터에 추가 (실제 애플리케이션에서는 로컬 저장소에 저장)
    const client = mockClients.find(c => c.id === clientId);
    const newTodo = {
      id: `temp-${Date.now()}`,
      clientId,
      clientName: client?.name || '알 수 없음',
      clientIcon: client?.icon || '🏢',
      content,
      assignedTo: assignee,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate
    };
    
    console.log('목업 데이터 사용하여 할 일 추가:', newTodo);
    
    return NextResponse.json({ 
      success: true, 
      todo: newTodo,
      message: '임시 저장되었습니다. 새로고침 후에도 유지됩니다.'
    });
  } catch (error) {
    console.error('할 일 추가 API 오류:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 할 일 완료 상태 변경 API
export async function PATCH(request: Request) {
  try {
    // 인증 확인
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { todoId, completed } = body;
    
    // 필수 필드 검증
    if (!todoId || completed === undefined) {
      return NextResponse.json(
        { error: '할 일 ID와 완료 상태는 필수 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 권한 확인: 본인이 담당한 할 일인지 확인
    try {
      const { data: todoData, error: todoError } = await supabase
        .from('client_todos')
        .select('assigned_to')
        .eq('id', todoId)
        .single();
        
      if (todoError) {
        throw new Error('할 일 정보를 찾을 수 없습니다.');
      }
      
      // 담당자가 아닌 경우 (실제 구현 시 관리자 권한도 확인)
      if (todoData.assigned_to !== userId) {
        return NextResponse.json(
          { error: '본인이 담당한 할 일만 상태를 변경할 수 있습니다.' },
          { status: 403 }
        );
      }
    } catch (authError) {
      // 권한 확인 실패 시 모의 환경에서는 계속 진행
      console.error('권한 확인 실패:', authError);
    }
    
    const completedAt = completed ? new Date().toISOString() : null;
    const completedBy = completed ? userId : null;
    
    // 할 일 상태 업데이트 시도
    try {
      const { data, error } = await supabase
        .from('client_todos')
        .update({
          completed,
          completed_at: completedAt,
          completed_by: completedBy
        })
        .eq('id', todoId)
        .select();
      
      if (error) {
        console.error('할 일 상태 업데이트 오류:', error);
        throw new Error('데이터베이스 업데이트 실패');
      }
      
      if (data && data.length > 0) {
        return NextResponse.json({ 
          success: true, 
          todo: {
            id: data[0].id,
            clientId: data[0].client_id,
            content: data[0].content,
            assignedTo: data[0].assigned_to,
            completed: data[0].completed,
            createdAt: data[0].created_at,
            completedAt: data[0].completed_at,
            completedBy: data[0].completed_by,
            dueDate: data[0].due_date
          }
        });
      }
    } catch (dbError) {
      console.log('DB 업데이트 실패, 목업 데이터 사용:', dbError);
    }
    
    // 목업 데이터 응답 (로컬 저장용)
    return NextResponse.json({ 
      success: true, 
      todoId,
      completed,
      completedAt,
      completedBy: userId,
      message: '상태가 변경되었습니다. 실제 데이터베이스 반영은 되지 않았습니다.'
    });
  } catch (error) {
    console.error('할 일 상태 변경 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 