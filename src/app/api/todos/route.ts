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
      // clientId가 있고 UUID 형식이 아닌 경우 Supabase UUID로 변환
      let supabaseClientId = clientId;
      if (clientId) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId);
        
        if (!isUUID) {
          console.log('clientId가 UUID 형식이 아님:', clientId);
          
          try {
            // 1. ID 필드로 직접 조회 시도
            const { data: directClient, error: directError } = await supabase
              .from('clients')
              .select('id, name')
              .eq('id', clientId)
              .single();
            
            if (!directError && directClient) {
              // ID 필드로 직접 찾은 경우
              console.log(`클라이언트 ID '${clientId}'를 직접 찾음`);
              supabaseClientId = directClient.id;
            } else {
              // 2. 이름으로 조회 시도
              const { data: nameClients, error: nameError } = await supabase
                .from('clients')
                .select('id, name')
                .ilike('name', `%${clientId}%`)
                .limit(1);
              
              if (!nameError && nameClients && nameClients.length > 0) {
                console.log(`이름이 '${clientId}'와 유사한 클라이언트 찾음: ${nameClients[0].id}`);
                supabaseClientId = nameClients[0].id;
              } else {
                console.warn(`모든 방법으로 클라이언트 ID '${clientId}'를 찾을 수 없음`);
                // 여기서는 원래 ID 사용 (목업 데이터로 폴백될 것임)
              }
            }
          } catch (lookupError) {
            console.error('클라이언트 ID 조회 오류:', lookupError);
            console.warn(`클라이언트 조회 중 오류 발생, 원본 ID '${clientId}' 사용`);
            // 원래 ID 사용 (목업 데이터로 폴백될 것임)
          }
        }
      }

      // Supabase 쿼리 구성
      let query = supabase
        .from('client_todos')
        .select(`
          *,
          clients(name, icon)
        `)
        .order('created_at', { ascending: false });
      
      // 필터 적용
      if (supabaseClientId) {
        query = query.eq('client_id', supabaseClientId);
      }
      
      // 담당자 필터 수정: 특정 담당자가 지정된 경우 그대로 적용, 그렇지 않으면 내가 담당하거나 내가 만든 할 일 조회
      if (assignedTo && assignedTo !== userId) {
        // URL에서 특정 담당자를 명시적으로 요청한 경우
        query = query.eq('assigned_to', assignedTo);
      } else {
        // 담당자 미지정 또는 현재 사용자인 경우 -> 내가 담당하거나 내가 만든 할 일 조회
        query = query.or(`assigned_to.eq.${userId},created_by.eq.${userId}`);
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
          clientId: clientId || todo.client_id, // 원래 요청한 clientId 유지
          clientName: todo.clients?.name,
          clientIcon: todo.clients?.icon || '🏢',
          content: todo.content,
          assignedTo: todo.assigned_to,
          assigneeName: todo.assignee_name || '담당자', // 담당자 이름 추가
          assigneeAvatar: todo.assignee_avatar || '', // 담당자 아바타 추가
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
    
    // Supabase 연결 상태 확인
    console.log('Supabase 연결 정보:');
    console.log('- URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '미설정');
    console.log('- ANON KEY 길이:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0);
    
    // Supabase 연결 테스트
    try {
      const { data: testData, error: testError } = await supabase
        .from('clients')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('Supabase 연결 테스트 실패:', testError);
      } else {
        console.log('Supabase 연결 테스트 성공');
      }
    } catch (testError) {
      console.error('Supabase 연결 테스트 중 오류:', testError);
    }
    
    const body = await request.json();
    const { clientId: originalClientId, content, assignedTo, assigneeName, assigneeAvatar, dueDate } = body;
    
    console.log('할 일 추가 요청:', { 
      clientId: originalClientId, 
      content, 
      assignedTo: assignedTo?.substring(0, 10) + '...', 
      assigneeName,
      assigneeAvatar,
      dueDate 
    });
    
    // 기본값: 담당자는 현재 사용자
    const assignee = assignedTo || userId;
    
    // 필수 필드 검증
    if (!originalClientId || !content) {
      return NextResponse.json(
        { error: '광고주 ID와 할 일 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // UUID 형식 검증 및 변환
    // 클라이언트 ID가 Clerk ID 형식(user_xxx)이면 오류 반환
    if (originalClientId.startsWith('user_')) {
      return NextResponse.json(
        { error: '유효하지 않은 클라이언트 ID 형식입니다.' },
        { status: 400 }
      );
    }
    
    // UUID 형식 확인 및 처리
    let supabaseClientId = originalClientId;
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(originalClientId);
    console.log('Client ID UUID 검증:', originalClientId, isUUID ? 'UUID 형식' : '기존 형식');
    
    // 할 일 데이터 삽입 시도
    try {
      // 숫자 ID 형식으로 조회
      if (!isUUID) {
        try {
          // 클라이언트 테이블 구조 확인
          console.log('클라이언트 테이블 구조 확인 중...');
          
          // 클라이언트 ID 유효성 검사
          const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('id, name')
            .eq('id', originalClientId)
            .single();
          
          if (clientError || !clientData) {
            // ID를 찾을 수 없는 경우 이름으로 검색
            console.log(`ID '${originalClientId}'로 광고주를 찾을 수 없음, 이름으로 시도...`);
            
            const { data: clientByName, error: clientByNameError } = await supabase
              .from('clients')
              .select('id, name')
              .ilike('name', `%${originalClientId}%`)
              .limit(1);
            
            if (clientByNameError || !clientByName || clientByName.length === 0) {
              console.error('클라이언트 찾기 실패:', clientByNameError || '일치하는 클라이언트 없음');
              return NextResponse.json(
                { error: '지정된 광고주 ID 또는 이름을 찾을 수 없습니다.' },
                { status: 404 }
              );
            }
            
            supabaseClientId = clientByName[0].id;
            console.log(`이름으로 클라이언트 찾기 성공. ID: ${supabaseClientId}, 이름: ${clientByName[0].name}`);
          } else {
            supabaseClientId = clientData.id;
            console.log(`ID로 클라이언트 찾기 성공. ID: ${supabaseClientId}, 이름: ${clientData.name}`);
          }
        } catch (clientLookupError) {
          console.error('클라이언트 조회 중 오류:', clientLookupError);
          return NextResponse.json(
            { error: '광고주 정보 조회 중 오류가 발생했습니다.' },
            { status: 500 }
          );
        }
      }
      
      // 담당자 정보 설정
      const finalAssigneeName = assigneeName || '담당자';
      const finalAssigneeAvatar = assigneeAvatar || '';
      
      // 할 일 데이터 준비
      const todoData = {
        client_id: supabaseClientId,
        content,
        assigned_to: assignee,
        assignee_name: finalAssigneeName,
        assignee_avatar: finalAssigneeAvatar,
        due_date: dueDate,
        created_by: userId,
        updated_at: new Date().toISOString()
      };
      
      console.log('삽입할 할 일 데이터:', todoData);
      
      // Supabase에 할 일 데이터 삽입
      const { data, error } = await supabase
        .from('client_todos')
        .insert([todoData])
        .select();
      
      if (error) {
        console.error('할 일 생성 오류:', error);
        
        // 스키마 문제인 경우 확인
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          return NextResponse.json({
            error: '스키마 오류: 데이터베이스 스키마를 업데이트해야 합니다.',
            suggestion: '스키마 업데이트를 위해 /api/update-todos-schema를 호출하세요.',
            details: error.message
          }, { status: 400 });
        }
        
        return NextResponse.json(
          { error: `할 일 생성에 실패했습니다: ${error.message}` },
          { status: 500 }
        );
      }
      
      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: '할 일을 생성했지만 데이터를 찾을 수 없습니다.' },
          { status: 500 }
        );
      }
      
      console.log('할 일 생성 성공:', data[0]);
      
      // 클라이언트 정보 가져오기
      const { data: clientInfo } = await supabase
        .from('clients')
        .select('name, icon')
        .eq('id', supabaseClientId)
        .single();
      
      // 응답 데이터 형식
      const todoResponse = {
        id: data[0].id,
        clientId: data[0].client_id,
        clientName: clientInfo?.name || '광고주',
        clientIcon: clientInfo?.icon || '🏢',
        content: data[0].content,
        assignedTo: data[0].assigned_to,
        assigneeName: data[0].assignee_name || finalAssigneeName,
        assigneeAvatar: data[0].assignee_avatar || finalAssigneeAvatar,
        completed: data[0].completed,
        createdAt: data[0].created_at,
        completedAt: data[0].completed_at,
        dueDate: data[0].due_date
      };
      
      return NextResponse.json({
        success: true,
        message: '할 일이 성공적으로 생성되었습니다.',
        todo: todoResponse
      });
    } catch (err) {
      console.error('할 일 생성 오류:', err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : '서버 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('할 일 추가 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 할 일 완료 상태 변경 API
export async function PATCH(request: Request) {
  try {
    // 인증 확인
    const { userId } = await auth();
    
    console.log('[DEBUG] PATCH /api/todos 호출됨 - 할 일 완료 상태 변경');
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { todoId, completed } = body;
    
    console.log('[DEBUG] 할 일 완료 상태 변경 요청 상세:', { todoId, completed, userId });
    
    // 필수 필드 검증
    if (!todoId || completed === undefined) {
      console.error('[DEBUG] 필수 필드 누락:', { todoId, completed });
      return NextResponse.json(
        { error: '할 일 ID와 완료 상태는 필수 항목입니다.' },
        { status: 400 }
      );
    }
    
    try {
      // 할 일 정보 조회 (권한 확인용)
      const { data: todoData, error: todoError } = await supabase
        .from('client_todos')
        .select('assigned_to, client_id')
        .eq('id', todoId)
        .single();
      
      if (todoError) {
        console.error('[DEBUG] 할 일 정보 조회 실패:', todoError);
        
        // 여기서 즉시 오류를 던지지 않고 계속 진행합니다 (유연한 권한 처리)
        console.warn('[DEBUG] 할 일 정보를 찾을 수 없지만, 상태 변경을 계속 시도합니다.');
      } else {
        // 담당자가 다른 경우 - 개발 환경에서는 허용
        if (todoData && todoData.assigned_to !== userId && process.env.NODE_ENV === 'production') {
          console.warn('[DEBUG] 권한 없음: 본인이 담당한 할 일만 상태를 변경할 수 있습니다.');
          // 프로덕션 환경에서만 엄격하게 권한 검사
          return NextResponse.json(
            { error: '본인이 담당한 할 일만 상태를 변경할 수 있습니다.' },
            { status: 403 }
          );
        }
      }
      
      // 현재 시간을 ISO 형식으로 저장
      const now = new Date().toISOString();
      const completedAt = completed ? now : null;
      const completedBy = completed ? userId : null;
      
      console.log('[DEBUG] 업데이트할 데이터:', { 
        completed, 
        completed_at: completedAt, 
        completed_by: completedBy
      });
      
      // 할 일 상태 업데이트 시도
      const { data, error } = await supabase
        .from('client_todos')
        .update({
          completed,
          completed_at: completedAt,
          completed_by: completedBy
        })
        .eq('id', todoId)
        .select('*, clients(name, icon)');
      
      if (error) {
        console.error('[DEBUG] 할 일 상태 업데이트 오류:', error);
        throw new Error(`데이터베이스 업데이트 실패: ${error.message}`);
      }
      
      console.log('[DEBUG] 할 일 상태 업데이트 성공:', data);
      
      if (data && data.length > 0) {
        // 광고주 정보 추가
        const clientData = data[0].clients || {};
        
        // 정상적인 응답 반환
        const todoResponse = {
          id: data[0].id,
          clientId: data[0].client_id,
          clientName: clientData.name || '광고주',
          clientIcon: clientData.icon || '🏢',
          content: data[0].content,
          assignedTo: data[0].assigned_to,
          completed: data[0].completed, 
          createdAt: data[0].created_at,
          completedAt: data[0].completed_at,
          completedBy: data[0].completed_by,
          dueDate: data[0].due_date
        };
        
        console.log('[DEBUG] 클라이언트에 반환할 응답:', todoResponse);
        
        return NextResponse.json({ 
          success: true, 
          todo: todoResponse
        });
      } else {
        // 데이터가 없는 경우 (이미 없는 할 일을 완료 처리한 경우 등)
        // 성공으로 처리하고 클라이언트가 제공한 ID 기준으로 응답
        return NextResponse.json({ 
          success: true, 
          todo: {
            id: todoId,
            completed: completed,
            completedAt: completedAt,
            completedBy: completedBy,
            message: '상태가 성공적으로 변경되었습니다. (부분 업데이트)'
          }
        });
      }
    } catch (dbError) {
      console.error('[DEBUG] 할 일 상태 변경 실패:', dbError);
      
      // 모든 환경에서 동일하게 처리 (폴백 제거)
      throw dbError;
    }
  } catch (error) {
    console.error('할 일 상태 변경 API 오류:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}

// 할 일 삭제 API
export async function DELETE(request: Request) {
  try {
    // 인증 확인
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    // URL에서 todoId 파라미터 추출
    const url = new URL(request.url);
    const todoId = url.searchParams.get('todoId');
    
    if (!todoId) {
      return NextResponse.json(
        { error: '삭제할 할 일 ID가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }
    
    console.log('할 일 삭제 요청:', { todoId, userId });
    
    // 권한 확인: 본인이 담당한 할 일인지 확인
    try {
      const { data: todoData, error: todoError } = await supabase
        .from('client_todos')
        .select('assigned_to')
        .eq('id', todoId)
        .single();
        
      if (todoError) {
        console.error('할 일 조회 실패:', todoError);
        throw new Error('할 일 정보를 찾을 수 없습니다.');
      }
      
      // 담당자가 아닌 경우 (실제 구현 시 관리자 권한도 확인)
      if (todoData.assigned_to !== userId) {
        console.warn('권한 없음: 본인이 담당한 할 일만 삭제할 수 있습니다.');
        return NextResponse.json(
          { error: '본인이 담당한 할 일만 삭제할 수 있습니다.' },
          { status: 403 }
        );
      }
    } catch (authError) {
      // 권한 확인 실패 시 개발 환경에서는 계속 진행
      console.error('권한 확인 실패:', authError);
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: '할 일 삭제 권한을 확인할 수 없습니다.' },
          { status: 500 }
        );
      }
    }
    
    // 할 일 삭제 시도
    try {
      const { error } = await supabase
        .from('client_todos')
        .delete()
        .eq('id', todoId);
      
      if (error) {
        console.error('할 일 삭제 오류:', error);
        throw new Error(`데이터베이스 삭제 실패: ${error.message}`);
      }
      
      return NextResponse.json({
        success: true,
        message: '할 일이 성공적으로 삭제되었습니다.',
        todoId
      });
    } catch (dbError) {
      console.error('DB 삭제 실패:', dbError);
      
      // 개발 환경에서 디버깅을 위한 추가 정보
      if (process.env.NODE_ENV === 'development') {
        console.log('데이터베이스 연결 정보 확인:');
        console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '미설정');
        console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '미설정');
        
        // 폴백으로 성공 응답 (개발 환경만)
        return NextResponse.json({
          success: true,
          message: '개발 환경: 할 일 삭제 성공으로 처리됩니다.',
          todoId,
          _error: dbError instanceof Error ? dbError.message : '알 수 없는 오류',
          _dev: true
        });
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('할 일 삭제 API 오류:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : '서버 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}