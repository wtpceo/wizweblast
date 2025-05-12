'use client';

import { useState, useEffect, useCallback } from 'react';
import { Client } from '@/lib/mock-data';
import { useUser } from '@clerk/nextjs';
import { TodoSection } from './TodoSection';

interface ClientTabsProps {
  client: Client;
}

// 확장된 할 일 타입 정의
interface Todo {
  id: number;
  content: string;
  date: string;
  completed: boolean;
  user: string;
  department: 'design' | 'content' | 'media' | 'cs' | 'admin';
}

// 메모 타입 정의
interface Note {
  id: number | string;
  content: string;
  date: string;
  user: string;
}

// 부서 정보
const departments = [
  { id: 'design', name: '디자인', color: '#F44336', icon: '🎨' },
  { id: 'content', name: '콘텐츠', color: '#4CAF50', icon: '📝' },
  { id: 'media', name: '미디어', color: '#2196F3', icon: '📊' },
  { id: 'cs', name: '고객관리', color: '#FF9800', icon: '🙋' },
  { id: 'admin', name: '관리자', color: '#9C27B0', icon: '⚙️' }
];

export function ClientTabs({ client }: ClientTabsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'todos' | 'notes' | 'analytics'>('info');
  const [hasComplaint, setHasComplaint] = useState(client.statusTags.includes('민원 중'));
  const [todoInput, setTodoInput] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('media');
  const [noteInput, setNoteInput] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [notesLoadError, setNotesLoadError] = useState<string | null>(null);
  const [notesSource, setNotesSource] = useState<'api' | 'local'>('api');
  const [keywords, setKeywords] = useState<string[]>(client.keywords || ['불고기', '한우', '점심특선', '가족모임', '단체예약']);
  const [keywordInput, setKeywordInput] = useState('');
  const [isSavingKeywords, setIsSavingKeywords] = useState(false);
  const { user } = useUser();
  
  // 할 일 목업 데이터
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, content: '네이버 플레이스 리뷰 관리 교육', date: '2023-12-10T14:00:00Z', completed: true, user: '이매니저', department: 'media' },
    { id: 2, content: '홀리데이 시즌 프로모션 기획 미팅', date: '2023-11-20T15:30:00Z', completed: false, user: '이매니저', department: 'content' },
    { id: 3, content: '제품 사진 촬영 일정 조율', date: '2023-12-05T10:00:00Z', completed: false, user: '김디자이너', department: 'design' },
    { id: 4, content: '민원 대응 프로세스 설명', date: '2023-12-12T09:00:00Z', completed: true, user: '박매니저', department: 'cs' },
  ]);
  
  // 메모 목업 데이터
  const [notes, setNotes] = useState<Note[]>([
    { id: 1, content: '기존 쿠폰 프로모션 문의 - 할인율 조정 필요, 담당자와 논의 후 결정 예정', date: '2023-12-15T10:30:00Z', user: '김담당' },
    { id: 2, content: '신메뉴 출시 관련 광고 문의, 다음 미팅에서 상세 기획 필요', date: '2023-11-28T11:20:00Z', user: '박담당' },
  ]);
  
  // 크롤링 정보 목업 데이터
  const crawledInfo = {
    category: '음식점 > 한식',
    keywords: keywords,
    lastUpdated: '2023-12-01T15:45:00Z'
  };
  
  // useEffect 밖으로 함수 이동
  const fetchNotes = useCallback(async () => {
    if (!client.id) return;
    
    setIsLoadingNotes(true);
    setNotesLoadError(null);
    
    const MAX_RETRIES = 2;
    let retryCount = 0;
    
    const attemptFetch = async (): Promise<boolean> => {
      try {
        console.log(`메모 불러오기 시도 ${retryCount + 1}/${MAX_RETRIES + 1}, 광고주 ID: ${client.id}`);
        
        // 광고주 ID 형식 확인 및 변환
        const clientIdValue = typeof client.id === 'string' ? client.id : String(client.id);
        
        // 타임아웃 설정 (5초)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch(`/api/clients/${clientIdValue}/notes`, {
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          
          clearTimeout(timeoutId);
          console.log('메모 API 응답 상태:', response.status);
          
          // 응답 타입 확인 (Content-Type 헤더)
          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('JSON이 아닌 응답 타입 감지:', contentType);
            return false;
          }
          
          if (!response.ok) {
            console.error("메모 API 응답 오류:", response.status);
            return false;
          }
          
          // 응답 본문 읽기
          const data = await response.json();
          console.log('메모 API 응답 데이터:', typeof data, Array.isArray(data) ? `배열 (${data.length}개)` : '객체');
          
          // 빈 응답 처리
          if (!data || (Array.isArray(data) && data.length === 0)) {
            console.log('메모가 없습니다.');
            setNotes([]);
            setIsLoadingNotes(false);
            setNotesSource('api');
            return true;
          }
          
          // 데이터 형식 검증
          if (!Array.isArray(data)) {
            console.error('응답이 배열 형식이 아닙니다:', typeof data);
            return false;
          }
          
          // API 응답을 Note 타입에 맞게 변환
          const notesData: Note[] = data.map((item: any) => {
            return {
              id: item.id || item.note_id || Date.now(),
              content: item.note || item.content || '',
              date: item.created_at || item.date || new Date().toISOString(),
              user: item.created_by || item.user || '알 수 없음'
            };
          });
          
          console.log('변환된 메모 데이터:', notesData.length, '개');
          
          // 기존 메모 데이터 대체
          setNotes(notesData);
          setNotesSource('api');
          setIsLoadingNotes(false);
          return true;
        } catch (fetchErr: unknown) {
          clearTimeout(timeoutId);
          
          if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
            console.error('메모 API 요청 타임아웃');
          } else if (fetchErr instanceof SyntaxError) {
            console.error('JSON 파싱 오류:', fetchErr);
          } else {
            console.error('메모 API 요청 오류:', fetchErr);
          }
          
          return false;
        }
      } catch (err) {
        console.error('메모 데이터 로딩 오류:', err);
        return false;
      }
    };
    
    // 최대 3번까지 시도 (초기 시도 + 최대 2번 재시도)
    while (retryCount <= MAX_RETRIES) {
      const success = await attemptFetch();
      
      if (success) {
        console.log(`메모 불러오기 성공 (시도 ${retryCount + 1}/${MAX_RETRIES + 1})`);
        return;
      }
      
      retryCount++;
      
      if (retryCount <= MAX_RETRIES) {
        // 재시도 전 잠시 대기 (지수 백오프: 500ms, 1000ms, ...)
        const delay = 500 * Math.pow(2, retryCount - 1);
        console.log(`메모 불러오기 실패, ${delay}ms 후 재시도 (${retryCount}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // 모든 시도 실패 시 로컬 스토리지에서 복구
    console.error(`메모 불러오기 ${MAX_RETRIES + 1}회 시도 모두 실패, 로컬 스토리지에서 복구 시도`);
    setNotesLoadError('서버에서 메모를 불러오지 못했습니다. 로컬에 저장된 메모를 표시합니다.');
    loadNotesFromLocalStorage();
    setIsLoadingNotes(false);
  }, [client.id]);

  // 로컬 스토리지에서 메모 로드 함수 (중복 코드 제거)
  const loadNotesFromLocalStorage = useCallback(() => {
    try {
      const localNotes = localStorage.getItem('client_notes');
      if (localNotes) {
        const parsedNotes = JSON.parse(localNotes);
        const clientNotes = parsedNotes.filter((note: any) => note.clientId === client.id);
        
        if (clientNotes.length > 0) {
          const notesData: Note[] = clientNotes.map((item: any) => ({
            id: item.id,
            content: item.note,
            date: item.createdAt,
            user: item.createdBy || '로컬 저장'
          }));
          
          setNotes(notesData);
          setNotesSource('local');
          console.log('로컬 스토리지에서 메모 데이터 복구:', notesData);
        } else {
          setNotes([]);
        }
      } else {
        setNotes([]);
      }
    } catch (localErr) {
      console.error('로컬 스토리지 메모 복구 오류:', localErr);
      setNotes([]);
    }
  }, [client.id]);

  // useEffect에서 호출
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);
  
  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    }
  };
  
  // 할 일 추가
  const handleAddTodo = async () => {
    if (!todoInput.trim()) return;
    
    // 현재 로그인한 사용자의 ID를 담당자로 설정
    const currentUserId = user?.id || 'user1'; // 기본값은 모의 데이터 사용
    
    // 새 할 일 데이터 생성
    const newTodo: Todo = {
      id: Date.now(),
      content: todoInput,
      date: new Date().toISOString(),
      completed: false,
      user: '현재 사용자', // 실제 구현 시 로그인 사용자 정보 사용
      department: selectedDepartment as any
    };
    
    // 화면에 먼저 표시 (낙관적 UI 업데이트)
    setTodos([newTodo, ...todos]);
    setTodoInput('');
    
    try {
      // API 호출하여 할 일 등록
      const response = await fetch(`/api/clients/${client.id}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: todoInput,
          assignedTo: currentUserId // 현재 사용자 ID 전달
        })
      });
      
      if (!response.ok) {
        throw new Error('할 일 등록에 실패했습니다.');
      }
      
      // 성공 시 로컬 스토리지 업데이트
      try {
        // 로컬 스토리지에서 기존 할 일 목록 가져오기
        const storedTodos = localStorage.getItem('wizweblast_todos');
        let todosList = [];
        
        if (storedTodos) {
          todosList = JSON.parse(storedTodos);
        }
        
        // 새 할 일 추가
        const todoData = {
          id: `temp-${Date.now()}`,
          clientId: client.id,
          clientName: client.name,
          clientIcon: client.icon,
          content: todoInput,
          assignedTo: currentUserId,
          completed: false,
          createdAt: new Date().toISOString()
        };
        
        // 목록 업데이트 후 저장
        todosList.unshift(todoData);
        localStorage.setItem('wizweblast_todos', JSON.stringify(todosList));
        
        console.log('할 일이 로컬 스토리지에 저장되었습니다.');
      } catch (storageErr) {
        console.error('로컬 스토리지 저장 오류:', storageErr);
      }
      
      alert(`'${todoInput}' 할 일이 등록되었습니다! 👍`);
    } catch (err) {
      console.error('할 일 등록 오류:', err);
      // 에러 발생 시 UI 원상복구
      setTodos(todos.filter(todo => todo.id !== newTodo.id));
      alert('할 일 등록 중 오류가 발생했습니다.');
    }
  };
  
  // 할 일 완료 토글
  const toggleTodoComplete = (id: number) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  // 할 일 삭제
  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  // 메모 추가
  const handleAddNote = async () => {
    if (!noteInput.trim()) return;
    
    // 저장 중 상태 설정
    setIsSavingNote(true);
    
    // 현재 사용자 정보
    const currentUser = user?.fullName || 'Unknown User';
    
    // 새 메모 데이터 생성 (UI용)
    const newNote: Note = {
      id: `temp-${Date.now()}`,
      content: noteInput,
      date: new Date().toISOString(),
      user: currentUser,
    };
    
    // 화면에 먼저 표시 (낙관적 UI 업데이트)
    setNotes([newNote, ...notes]);
    setNoteInput('');
    
    try {
      console.log(`메모 저장 시도: 광고주 ID=${client.id}, 내용="${noteInput.substring(0, 30)}..."`);
      
      // 로컬 스토리지에 메모 저장 (백업)
      try {
        const localNotes = JSON.parse(localStorage.getItem('client_notes') || '[]');
        const noteData = {
          id: `local-${Date.now()}`,
          clientId: client.id,
          note: noteInput,
          createdAt: new Date().toISOString(),
          createdBy: currentUser
        };
        
        localNotes.push(noteData);
        localStorage.setItem('client_notes', JSON.stringify(localNotes));
        console.log('메모가 로컬 스토리지에 백업되었습니다.');
      } catch (localError) {
        console.error('로컬 스토리지 저장 오류:', localError);
      }
      
      // 광고주 ID가 숫자 또는 문자열인지 확인하고 적절히 처리
      const clientIdValue = typeof client.id === 'string' ? client.id : String(client.id);
      
      const response = await fetch(`/api/clients/${clientIdValue}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          note: noteInput
        })
      });
      
      // 응답 데이터 확인
      const responseData = await response.json();
      
      if (!response.ok) {
        const errorMsg = responseData?.error || '메모 등록에 실패했습니다.';
        const errorDetails = responseData?.details || '';
        const errorCode = responseData?.code || '';
        
        console.error('메모 저장 실패:', errorMsg, errorDetails, errorCode);
        
        // 특정 오류에 대한 안내
        if (errorCode === 'CLIENT_NOT_FOUND') {
          alert(`존재하지 않는 광고주입니다. 페이지를 새로고침하거나 관리자에게 문의하세요.
          
※ 메모는 로컬에 저장되었습니다.`);
          return;
        }
        
        alert(`메모 등록 중 오류가 발생했습니다: ${errorMsg}${errorDetails ? ` (${errorDetails})` : ''}

※ 메모는 로컬에 저장되었습니다. 페이지를 새로고침해도 확인할 수 있습니다.`);
        
        // 오류가 발생해도 로컬에 저장되었으므로 UI는 유지
        return;
      }
      
      console.log('메모 저장 성공:', responseData);
      
      // 저장 성공 후 메모 목록 새로고침
      fetchNotes();
      
      // 성공 메시지
      alert(`메모가 성공적으로 저장되었습니다! 👍`);
    } catch (err) {
      console.error('메모 등록 오류:', err);
      
      // 이미 로컬에 저장되었으므로, UI는 유지
      
      // 오류 메시지 표시
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      alert(`메모 등록 중 오류가 발생했습니다: ${errorMessage}

※ 메모는 로컬에 저장되었습니다. 페이지를 새로고침하면 확인할 수 있습니다.`);
    } finally {
      // 저장 상태 해제
      setIsSavingNote(false);
    }
  };
  
  // 메모 삭제
  const deleteNote = async (id: number | string) => {
    try {
      // 삭제 전 사용자 확인
      if (!confirm('정말 이 메모를 삭제하시겠습니까?')) {
        return;
      }
      
      // UI에서 먼저 삭제 (낙관적 UI 업데이트)
      setNotes(notes.filter(note => note.id !== id));
      
      // 임시 ID(로컬에서만 생성된 메모)는 API 호출 필요 없음
      if (typeof id === 'number') {
        console.log('로컬 메모 삭제:', id);
        return;
      }
      
      // API 호출하여 메모 삭제
      const response = await fetch(`/api/clients/${client.id}/notes/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('메모 삭제에 실패했습니다.');
      }
      
      console.log('메모 삭제 성공:', id);
    } catch (err) {
      console.error('메모 삭제 오류:', err);
      // 에러 발생 시 다시 목록 불러오기
      const fetchNotes = async () => {
        try {
          const response = await fetch(`/api/clients/${client.id}/notes`);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
              const notesData = data.map(item => ({
                id: item.id,
                content: item.note,
                date: item.created_at,
                user: item.created_by || '알 수 없음'
              }));
              setNotes(notesData);
            }
          }
        } catch (fetchErr) {
          console.error('메모 새로고침 오류:', fetchErr);
        }
      };
      
      fetchNotes();
      alert('메모 삭제 중 오류가 발생했습니다.');
    }
  };
  
  // 민원 토글 처리
  const toggleComplaint = async () => {
    try {
      // 서버에 보낼 새로운 상태 설정
      const newHasComplaint = !hasComplaint;
      setHasComplaint(newHasComplaint);
      
      // 현재 상태 태그 복사
      let updatedStatusTags = [...client.statusTags];
      
      // 상태 토글에 따라 '민원 중' 태그 추가 또는 제거
      if (newHasComplaint && !updatedStatusTags.includes('민원 중')) {
        updatedStatusTags.push('민원 중');
      } else if (!newHasComplaint) {
        updatedStatusTags = updatedStatusTags.filter(tag => tag !== '민원 중');
        // '정상' 태그가 없으면 추가
        if (!updatedStatusTags.includes('정상')) {
          updatedStatusTags.push('정상');
        }
      }
      
      console.log(`민원 상태 변경: ${hasComplaint ? '비활성화' : '활성화'}`);
      console.log('클라이언트 ID:', client.id, '타입:', typeof client.id);
      console.log('업데이트할 상태 태그:', updatedStatusTags);
      
      // API 요청 데이터
      const requestData = {
        // 필수 필드
        name: client.name,
        contractStart: client.contractStart,
        contractEnd: client.contractEnd,
        // 업데이트 필드
        statusTags: updatedStatusTags
      };
      
      console.log('API 요청 데이터:', requestData);
      
      // API 요청 송신
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('API 응답 상태:', response.status, response.statusText);
      
      // 응답 본문을 텍스트로 먼저 읽어서 디버깅
      const responseText = await response.text();
      console.log('API 응답 텍스트:', responseText);
      
      // 텍스트를 다시 JSON으로 파싱
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('응답 JSON 파싱 오류:', parseError);
        throw new Error(`응답을 파싱할 수 없습니다: ${responseText}`);
      }
      
      if (!response.ok) {
        console.error('API 응답 오류:', responseData);
        throw new Error(responseData?.error || '민원 상태 업데이트에 실패했습니다.');
      }
      
      console.log('민원 상태 업데이트 성공:', responseData);
      
      // 로컬 스토리지 업데이트
      try {
        // 단일 클라이언트 데이터에 상태 업데이트
        const clientData = localStorage.getItem(`wizweblast_client_${client.id}`);
        if (clientData) {
          const parsedClient = JSON.parse(clientData);
          parsedClient.statusTags = updatedStatusTags;
          localStorage.setItem(`wizweblast_client_${client.id}`, JSON.stringify(parsedClient));
        }
        
        // 목록에 있는 경우 해당 데이터도 업데이트
        const storedClientsJSON = localStorage.getItem('wizweblast_clients');
        if (storedClientsJSON) {
          const storedClients = JSON.parse(storedClientsJSON);
          if (Array.isArray(storedClients)) {
            const updatedClients = storedClients.map(c => 
              c.id === client.id ? {...c, statusTags: updatedStatusTags} : c
            );
            localStorage.setItem('wizweblast_clients', JSON.stringify(updatedClients));
          }
        }
      } catch (storageErr) {
        console.error("로컬 스토리지 저장 실패:", storageErr);
      }
      
      alert(`민원 상태가 ${newHasComplaint ? '활성화' : '비활성화'}되었습니다.`);
    } catch (error) {
      console.error('민원 상태 변경 오류:', error);
      // 오류 정보 자세히 로깅
      if (error instanceof Error) {
        console.error('오류 메시지:', error.message);
        console.error('오류 스택:', error.stack);
      }
      // 오류 발생 시 이전 상태로 복원
      setHasComplaint(hasComplaint);
      alert(`민원 상태 변경 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };
  
  // 정보 자동 갱신 처리
  const handleRefreshInfo = async () => {
    if (!client.naverPlaceUrl) {
      alert('네이버 플레이스 URL이 설정되어 있지 않습니다.');
      return;
    }
    
    console.log("정보 갱신하기 버튼 클릭됨");
    console.log("API 호출 URL:", `/api/clients/${client.id}/scrape`);
    console.log("클라이언트 ID:", client.id);
    
    // 버튼 요소 찾기
    const button = document.querySelector('button[data-refresh-button]');
    const originalButtonText = button?.innerHTML || '';
    
    // 버튼 텍스트를 로딩 표시로 변경
    if (button) {
      button.innerHTML = '<span class="mr-1">🔄</span><span class="animate-pulse">정보 갱신 중...</span>';
      button.setAttribute('disabled', 'true');
      button.classList.add('opacity-70');
    }
    
    try {
      console.log("API 요청 시작");
      const response = await fetch(`/api/clients/${client.id}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("API 응답 상태:", response.status, response.statusText);
      
      if (!response.ok) {
        console.error("API 응답 오류:", response.status);
        const errorData = await response.json();
        console.error("오류 데이터:", errorData);
        throw new Error(errorData.error || '정보 가져오기에 실패했습니다.');
      }
      
      console.log("응답 데이터 파싱 시작");
      const data = await response.json();
      console.log("파싱된 응답 데이터:", data);
      
      if (data.success) {
        console.log("API 호출 성공, 클라이언트 데이터:", data.client);
        
        // 로컬 스토리지에 업데이트된 클라이언트 정보 저장
        if (data.allClients) {
          try {
            localStorage.setItem('wizweblast_clients', JSON.stringify(data.allClients));
            console.log("클라이언트 데이터가 로컬 스토리지에 저장되었습니다.");
          } catch (storageErr) {
            console.error("로컬 스토리지 저장 실패:", storageErr);
          }
        }
        
        // 성공 알림을 자세하게 표시
        alert(`
네이버 플레이스에서 정보를 성공적으로 가져왔습니다!

업데이트된 정보:
- 쿠폰 사용: ${data.client.usesCoupon ? '사용중' : '미사용'}
- 소식 발행: ${data.client.publishesNews ? '발행중' : '미발행'}
- 예약 시스템: ${data.client.usesReservation ? '사용중' : '미사용'}
- 상태: ${data.client.statusTags.join(', ')}

페이지를 새로고침하여 변경사항을 확인하세요.
        `);
        
        // 2초 후 페이지 새로고침
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error("API 호출 실패:", data);
        throw new Error(data.error || '정보 가져오기에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('크롤링 오류:', err);
      alert(`정보 갱신 중 오류가 발생했습니다: ${err.message}`);
      
      // 오류 발생 시 버튼 원상 복구
      if (button) {
        button.innerHTML = originalButtonText;
        button.removeAttribute('disabled');
        button.classList.remove('opacity-70');
      }
    }
  };
  
  // 키워드 추가
  const handleAddKeyword = async () => {
    if (!keywordInput.trim()) return;
    
    // 중복 키워드 체크
    if (keywords.includes(keywordInput.trim())) {
      alert('이미 존재하는 키워드입니다.');
      return;
    }
    
    setIsSavingKeywords(true);
    
    // 새 키워드 배열 생성
    const newKeywords = [...keywords, keywordInput.trim()];
    
    try {
      // API 호출하여 키워드 업데이트 (실제 구현 시 API 호출)
      // const response = await fetch(`/api/clients/${client.id}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     keywords: newKeywords
      //   })
      // });
      
      // if (!response.ok) {
      //   throw new Error('키워드 저장에 실패했습니다.');
      // }
      
      // 성공 시 상태 업데이트 (API 구현 전 임시로 바로 상태 업데이트)
      setKeywords(newKeywords);
      setKeywordInput('');
      
      // 로컬 스토리지에 저장 (임시)
      try {
        localStorage.setItem(`client_${client.id}_keywords`, JSON.stringify(newKeywords));
      } catch (storageErr) {
        console.error('키워드 로컬 저장 오류:', storageErr);
      }
      
    } catch (err) {
      console.error('키워드 저장 오류:', err);
      alert('키워드 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingKeywords(false);
    }
  };
  
  // 키워드 삭제
  const handleRemoveKeyword = async (keywordToRemove: string) => {
    setIsSavingKeywords(true);
    
    // 키워드 제거
    const newKeywords = keywords.filter(keyword => keyword !== keywordToRemove);
    
    try {
      // API 호출하여 키워드 업데이트 (실제 구현 시 API 호출)
      // const response = await fetch(`/api/clients/${client.id}`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     keywords: newKeywords
      //   })
      // });
      
      // if (!response.ok) {
      //   throw new Error('키워드 삭제에 실패했습니다.');
      // }
      
      // 성공 시 상태 업데이트 (API 구현 전 임시로 바로 상태 업데이트)
      setKeywords(newKeywords);
      
      // 로컬 스토리지에 저장 (임시)
      try {
        localStorage.setItem(`client_${client.id}_keywords`, JSON.stringify(newKeywords));
      } catch (storageErr) {
        console.error('키워드 로컬 저장 오류:', storageErr);
      }
      
    } catch (err) {
      console.error('키워드 삭제 오류:', err);
      alert('키워드 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsSavingKeywords(false);
    }
  };
  
  // 로컬 스토리지에서 키워드 불러오기
  useEffect(() => {
    try {
      const savedKeywords = localStorage.getItem(`client_${client.id}_keywords`);
      if (savedKeywords) {
        setKeywords(JSON.parse(savedKeywords));
      }
    } catch (err) {
      console.error('키워드 로드 오류:', err);
    }
  }, [client.id]);
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* 탭 헤더 */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            className={`px-4 py-4 font-medium text-sm flex items-center border-b-2 ${
              activeTab === 'info'
                ? 'border-[#2251D1] text-[#2251D1]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('info')}
          >
            <span className="mr-2">📌</span>
            상세 정보
          </button>
          
          <button
            className={`px-4 py-4 font-medium text-sm flex items-center border-b-2 ${
              activeTab === 'todos'
                ? 'border-[#2251D1] text-[#2251D1]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('todos')}
          >
            <span className="mr-2">✅</span>
            할 일
          </button>
          
          <button
            className={`px-4 py-4 font-medium text-sm flex items-center border-b-2 ${
              activeTab === 'notes'
                ? 'border-[#2251D1] text-[#2251D1]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('notes')}
          >
            <span className="mr-2">📝</span>
            메모
          </button>
          
          <button
            className={`px-4 py-4 font-medium text-sm flex items-center border-b-2 ${
              activeTab === 'analytics'
                ? 'border-[#2251D1] text-[#2251D1]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="mr-2">📊</span>
            분석
          </button>
        </nav>
      </div>
      
      {/* 탭 컨텐츠 */}
      <div className="p-6">
        {/* 상세 정보 탭 */}
        {activeTab === 'info' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-medium text-lg">네이버 플레이스 정보</h3>
              <button 
                data-refresh-button
                onClick={handleRefreshInfo}
                className="text-[#2251D1] text-sm hover:underline flex items-center"
              >
                <span className="mr-1">🔄</span> 정보 갱신하기
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-[#F9FAFD] rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">마지막 갱신일:</span>
                <span className="font-medium">{formatDate(crawledInfo.lastUpdated)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-500">업종:</span>
                <span className="font-medium">{crawledInfo.category}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 mb-3">서비스 현황</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-[#E3F2FD] flex items-center justify-center text-lg mr-3">🎟️</span>
                    <div>
                      <div className="font-medium">쿠폰</div>
                      <div className="text-xs text-gray-500">
                        {client.usesCoupon ? '사용 중' : '미사용'}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${client.usesCoupon ? 'bg-[#E3F2FD] text-[#2196F3]' : 'bg-gray-100 text-gray-500'}`}>
                    {client.usesCoupon ? '활성' : '비활성'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center text-lg mr-3">📰</span>
                    <div>
                      <div className="font-medium">소식</div>
                      <div className="text-xs text-gray-500">
                        {client.publishesNews ? '발행 중' : '미발행'}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${client.publishesNews ? 'bg-[#E8F5E9] text-[#4CAF50]' : 'bg-gray-100 text-gray-500'}`}>
                    {client.publishesNews ? '활성' : '비활성'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-[#F3E5F5] flex items-center justify-center text-lg mr-3">📅</span>
                    <div>
                      <div className="font-medium">예약</div>
                      <div className="text-xs text-gray-500">
                        {client.usesReservation ? '사용 중' : '미사용'}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${client.usesReservation ? 'bg-[#F3E5F5] text-[#9C27B0]' : 'bg-gray-100 text-gray-500'}`}>
                    {client.usesReservation ? '활성' : '비활성'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-500 mb-3">대표 키워드</h4>
              
              <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="새 키워드 입력..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2251D1]"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddKeyword();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddKeyword}
                      disabled={!keywordInput.trim() || isSavingKeywords}
                      className={`ml-2 px-4 py-2 rounded-lg ${
                        keywordInput.trim() && !isSavingKeywords
                          ? 'bg-[#2251D1] text-white hover:bg-[#1A41B6]'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isSavingKeywords ? '저장 중...' : '추가'}
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Enter 키를 누르거나 추가 버튼을 클릭하여 키워드를 추가하세요.
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <div 
                    key={index} 
                    className="px-3 py-1.5 bg-[#EEF2FB] text-[#2251D1] rounded-full text-sm flex items-center group"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {keywords.length === 0 && (
                  <div className="text-gray-500 text-sm italic">
                    등록된 키워드가 없습니다. 위 입력창에서 키워드를 추가해보세요.
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-500 mb-3">민원 상태 관리</h4>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium flex items-center">
                    <span className="mr-2">🔔</span>
                    민원 상태
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    민원이 접수된 광고주는 대시보드에 별도 표시됩니다.
                  </div>
                </div>
                
                <button
                  onClick={toggleComplaint}
                  className={`px-4 py-2 rounded-lg ${
                    hasComplaint
                      ? 'bg-[#FFEBEE] text-[#F44336] hover:bg-red-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {hasComplaint ? '민원 중' : '정상'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'todos' && (
          <TodoSection client={client} />
        )}
        
        {activeTab === 'notes' && (
          <div>
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4">메모</h3>
              
              <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex flex-col space-y-3">
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="새 메모를 입력하세요..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2251D1] min-h-[100px] resize-none"
                  />
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddNote}
                      disabled={!noteInput.trim() || isSavingNote}
                      className={`px-4 py-2 rounded-lg ${
                        noteInput.trim() && !isSavingNote
                          ? 'bg-[#FFC107] text-white hover:bg-[#e6ac00]'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isSavingNote ? (
                        <>
                          <span className="inline-block animate-spin mr-2">⏳</span>
                          저장 중...
                        </>
                      ) : (
                        '메모 저장'
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {notesLoadError && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    <span>{notesLoadError}</span>
                  </div>
                </div>
              )}
              
              {notesSource === 'local' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">💾</span>
                    <span>로컬 스토리지에서 불러온 메모를 표시하고 있습니다.</span>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {isLoadingNotes ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin text-3xl mb-2">⏳</div>
                    <p className="text-gray-500">메모를 불러오는 중입니다...</p>
                  </div>
                ) : notes.length > 0 ? (
                  notes.map(note => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-lg relative ${
                        typeof note.id === 'string' && note.id.toString().startsWith('local-')
                          ? 'bg-[#E3F2FD]' // 로컬 저장 메모는 파란색 배경
                          : 'bg-[#FFF8E1]'  // API에서 불러온 메모는 노란색 배경
                      }`}
                    >
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <span className="w-8 h-8 rounded-full bg-[#FFC107] bg-opacity-20 flex items-center justify-center text-lg mr-2">
                            📝
                          </span>
                          <span className="font-medium">{note.user}</span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(note.date)}</span>
                      </div>
                      
                      <p className="pl-10 text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">📝</div>
                    <p className="text-gray-500">등록된 메모가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div>
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4">서비스 사용 현황</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#EEF2FB] rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">쿠폰 사용</div>
                  <div className="text-2xl font-bold">{client.usesCoupon ? '사용중' : '미사용'}</div>
                  <div className="text-sm text-gray-600 mt-1">최근 30일</div>
                </div>
                
                <div className="bg-[#F3E5F5] rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">소식 발행</div>
                  <div className="text-2xl font-bold">{client.publishesNews ? '발행중' : '미발행'}</div>
                  <div className="text-sm text-gray-600 mt-1">최근 30일</div>
                </div>
                
                <div className="bg-[#E8F5E9] rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">예약 시스템</div>
                  <div className="text-2xl font-bold">{client.usesReservation ? '사용중' : '미사용'}</div>
                  <div className="text-sm text-gray-600 mt-1">최근 30일</div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4">업무 진행 현황</h3>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">할 일 완료율</span>
                  <span className="font-bold">{Math.round((todos.filter(t => t.completed).length / todos.length) * 100) || 0}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-[#4CAF50] h-2.5 rounded-full" 
                    style={{ width: `${Math.round((todos.filter(t => t.completed).length / todos.length) * 100) || 0}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>완료: {todos.filter(t => t.completed).length}개</span>
                  <span>전체: {todos.length}개</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4">부서별 할 일 현황</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {departments.map(dept => {
                  const deptTodos = todos.filter(t => t.department === dept.id);
                  const completedCount = deptTodos.filter(t => t.completed).length;
                  
                  return (
                    <div key={dept.id} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                      <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${dept.color}20`, color: dept.color }}>
                        <span className="text-xl">{dept.icon}</span>
                      </div>
                      <div className="font-medium text-sm mb-1">{dept.name}</div>
                      <div className="text-xs text-gray-500">{completedCount}/{deptTodos.length} 완료</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button 
                className="bg-[#2251D1] text-white px-4 py-2 rounded-lg hover:bg-[#1A41B6] transition-colors"
                onClick={() => alert('상세 분석 기능은 개발 예정입니다!')}
              >
                상세 분석 보기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}