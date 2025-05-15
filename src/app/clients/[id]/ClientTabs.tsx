'use client';

import { useState, useEffect, useCallback } from 'react';
import { Client } from '@/lib/mock-data';
import { useUser } from '@clerk/nextjs';
import { TodoSection } from './TodoSection';

interface ClientTabsProps {
  client: Client;
  onClientUpdate?: (updatedClient: Client) => void;
  activeTab?: 'info' | 'todos' | 'notes' | 'analytics';
  onTabChange?: (tab: 'info' | 'todos' | 'notes' | 'analytics') => void;
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

export function ClientTabs({ client, onClientUpdate, activeTab: externalActiveTab, onTabChange }: ClientTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<'info' | 'todos' | 'notes' | 'analytics'>('info');
  
  // 외부에서 activeTab이 제공되면 그것을 사용, 아니면 내부 상태 사용
  const currentActiveTab = externalActiveTab || internalActiveTab;
  
  // 탭 변경 핸들러
  const handleTabChange = (tab: 'info' | 'todos' | 'notes' | 'analytics') => {
    if (onTabChange) {
      // 외부 핸들러가 있으면 호출
      onTabChange(tab);
    } else {
      // 없으면 내부 상태만 변경
      setInternalActiveTab(tab);
    }
  };
  
  const [hasComplaint, setHasComplaint] = useState(client.statusTags.includes('민원 중'));
  const [noteInput, setNoteInput] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [notesLoadError, setNotesLoadError] = useState<string | null>(null);
  const [notesSource, setNotesSource] = useState<'api' | 'local'>('api');
  const [keywords, setKeywords] = useState<string[]>(client.keywords || ['불고기', '한우', '점심특선', '가족모임', '단체예약']);
  const [keywordInput, setKeywordInput] = useState('');
  const [isSavingKeywords, setIsSavingKeywords] = useState(false);
  const { user } = useUser();
  
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
      // 먼저 새로운 형식의 스토리지 키로 확인
      const clientSpecificNotes = localStorage.getItem(`wizweblast_notes_client_${client.id}`);
      if (clientSpecificNotes) {
        const parsedNotes = JSON.parse(clientSpecificNotes);
        
        if (parsedNotes.length > 0) {
          const notesData: Note[] = parsedNotes.map((item: any) => ({
            id: item.id,
            content: item.note || item.content,
            date: item.createdAt || item.created_at,
            user: item.createdBy || item.created_by || '로컬 저장'
          }));
          
          setNotes(notesData);
          setNotesSource('local');
          console.log('새 형식 로컬 스토리지에서 메모 데이터 복구:', notesData);
          return;
        }
      }
      
      // 이전 형식의 스토리지 확인
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
          console.log('이전 형식 로컬 스토리지에서 메모 데이터 복구:', notesData);
          
          // 이전 형식에서 로드한 데이터를 새 형식으로도 저장 (마이그레이션)
          try {
            localStorage.setItem(`wizweblast_notes_client_${client.id}`, JSON.stringify(
              clientNotes.map((note: any) => ({
                id: note.id,
                note: note.note,
                content: note.note,
                createdAt: note.createdAt,
                created_at: note.createdAt,
                createdBy: note.createdBy,
                created_by: note.createdBy
              }))
            ));
            console.log('메모 데이터를 새 형식으로 마이그레이션했습니다.');
          } catch (migrationErr) {
            console.error('메모 데이터 마이그레이션 오류:', migrationErr);
          }
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
        // 기존 'client_notes' 형식에 저장 (이전 버전 호환성)
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
        
        // 새로운 'wizweblast_notes_client_${client.id}' 형식에도 저장
        const clientSpecificNotes = JSON.parse(localStorage.getItem(`wizweblast_notes_client_${client.id}`) || '[]');
        clientSpecificNotes.push({
          id: `local-${Date.now()}`,
          note: noteInput,
          content: noteInput,
          createdAt: new Date().toISOString(),
          created_at: new Date().toISOString(),
          createdBy: currentUser,
          created_by: currentUser
        });
        localStorage.setItem(`wizweblast_notes_client_${client.id}`, JSON.stringify(clientSpecificNotes));
        
        console.log('메모가 로컬 스토리지에 백업되었습니다.');
        
        // 상위 컴포넌트에 업데이트 알림을 위한 커스텀 이벤트 발생
        window.dispatchEvent(new Event('note_updated'));
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
    <div className="bg-[#151523] rounded-lg shadow-xl overflow-hidden border border-white/10">
      {/* 탭 헤더 */}
      <div className="border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20 backdrop-blur-sm">
        <nav className="flex">
          <button
            className={`px-4 py-4 font-medium text-sm flex items-center border-b-2 ${
              currentActiveTab === 'info'
                ? 'border-blue-500 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-white hover:border-white/30'
            }`}
            onClick={() => handleTabChange('info')}
          >
            <span className="mr-2">📌</span>
            상세 정보
          </button>
          
          <button
            className={`px-4 py-4 font-medium text-sm flex items-center border-b-2 ${
              currentActiveTab === 'todos'
                ? 'border-green-500 text-green-300'
                : 'border-transparent text-slate-400 hover:text-white hover:border-white/30'
            }`}
            onClick={() => handleTabChange('todos')}
          >
            <span className="mr-2">✅</span>
            할 일
          </button>
          
          <button
            className={`px-4 py-4 font-medium text-sm flex items-center border-b-2 ${
              currentActiveTab === 'notes'
                ? 'border-amber-500 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white hover:border-white/30'
            }`}
            onClick={() => handleTabChange('notes')}
          >
            <span className="mr-2">📝</span>
            메모
          </button>
          
          <button
            className={`px-4 py-4 font-medium text-sm flex items-center border-b-2 ${
              currentActiveTab === 'analytics'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white hover:border-white/30'
            }`}
            onClick={() => handleTabChange('analytics')}
          >
            <span className="mr-2">📊</span>
            분석
          </button>
        </nav>
      </div>
      
      {/* 탭 컨텐츠 */}
      <div className="p-6 text-white">
        {/* 상세 정보 탭 */}
        {currentActiveTab === 'info' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-medium text-lg text-white">네이버 플레이스 정보</h3>
              <button 
                data-refresh-button
                onClick={handleRefreshInfo}
                className="text-blue-300 text-sm hover:text-blue-100 flex items-center transition-colors"
              >
                <span className="mr-1">🔄</span> 정보 갱신하기
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-[#1e1e30] rounded-lg border border-white/10">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">마지막 갱신일:</span>
                <span className="font-medium text-white">{formatDate(crawledInfo.lastUpdated)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-400">업종:</span>
                <span className="font-medium text-white">{crawledInfo.category}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-400 mb-3">서비스 현황</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center p-3 border border-white/10 bg-[#1e1e30] rounded-lg">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center text-lg mr-3">🎟️</span>
                    <div>
                      <div className="font-medium">쿠폰</div>
                      <div className="text-xs text-slate-400">
                        {client.usesCoupon ? '사용 중' : '미사용'}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${client.usesCoupon ? 'bg-blue-900/30 text-blue-300 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700'}`}>
                    {client.usesCoupon ? '활성' : '비활성'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 border border-white/10 bg-[#1e1e30] rounded-lg">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center text-lg mr-3">📰</span>
                    <div>
                      <div className="font-medium">소식</div>
                      <div className="text-xs text-slate-400">
                        {client.publishesNews ? '발행 중' : '미발행'}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${client.publishesNews ? 'bg-green-900/30 text-green-300 border border-green-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700'}`}>
                    {client.publishesNews ? '활성' : '비활성'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 border border-white/10 bg-[#1e1e30] rounded-lg">
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center text-lg mr-3">📅</span>
                    <div>
                      <div className="font-medium">예약</div>
                      <div className="text-xs text-slate-400">
                        {client.usesReservation ? '사용 중' : '미사용'}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${client.usesReservation ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700'}`}>
                    {client.usesReservation ? '활성' : '비활성'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-400 mb-3">대표 키워드</h4>
              
              <div className="mb-4 p-4 bg-[#1e1e30] border border-white/10 rounded-lg">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="새 키워드 입력..."
                      className="flex-1 border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#151523] text-white"
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
                          ? 'bg-blue-600 text-white hover:bg-blue-500'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isSavingKeywords ? '저장 중...' : '추가'}
                    </button>
                  </div>
                  
                  <div className="text-xs text-slate-400">
                    Enter 키를 누르거나 추가 버튼을 클릭하여 키워드를 추가하세요.
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <div 
                    key={index} 
                    className="px-3 py-1.5 bg-blue-900/30 text-blue-300 rounded-full text-sm flex items-center group border border-blue-500/30"
                  >
                    {keyword}
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="ml-2 text-slate-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {keywords.length === 0 && (
                  <div className="text-slate-400 text-sm italic">
                    등록된 키워드가 없습니다. 위 입력창에서 키워드를 추가해보세요.
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-slate-400 mb-3">민원 상태 관리</h4>
              
              <div className="flex items-center justify-between p-4 bg-[#1e1e30] border border-white/10 rounded-lg">
                <div>
                  <div className="font-medium flex items-center text-white">
                    <span className="mr-2">🔔</span>
                    민원 상태
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    민원이 접수된 광고주는 대시보드에 별도 표시됩니다.
                  </div>
                </div>
                
                <button
                  onClick={toggleComplaint}
                  className={`px-4 py-2 rounded-lg ${
                    hasComplaint
                      ? 'bg-red-900/30 text-red-300 hover:bg-red-800/50 border border-red-500/30'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700'
                  }`}
                >
                  {hasComplaint ? '민원 중' : '정상'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {currentActiveTab === 'todos' && (
          <TodoSection client={client} onClientUpdate={onClientUpdate} />
        )}
        
        {currentActiveTab === 'notes' && (
          <div>
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4 text-white">메모</h3>
              
              <div className="mb-4 p-4 bg-[#1e1e30] border border-white/10 rounded-lg">
                <div className="flex flex-col space-y-3">
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="새 메모를 입력하세요..."
                    className="w-full border border-slate-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none bg-[#151523] text-white"
                  />
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleAddNote}
                      disabled={!noteInput.trim() || isSavingNote}
                      className={`px-4 py-2 rounded-lg ${
                        noteInput.trim() && !isSavingNote
                          ? 'bg-amber-500 text-white hover:bg-amber-400 transition-colors'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
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
                <div className="mb-4 p-3 bg-amber-900/30 border border-amber-500/30 rounded-lg text-amber-300 text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">⚠️</span>
                    <span>{notesLoadError}</span>
                  </div>
                </div>
              )}
              
              {notesSource === 'local' && (
                <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/30 rounded-lg text-blue-300 text-sm">
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
                    <p className="text-slate-400">메모를 불러오는 중입니다...</p>
                  </div>
                ) : notes.length > 0 ? (
                  notes.map(note => (
                    <div
                      key={note.id}
                      className={`p-4 rounded-lg relative ${
                        typeof note.id === 'string' && note.id.toString().startsWith('local-')
                          ? 'bg-blue-900/30 border border-blue-500/30' // 로컬 저장 메모는 파란색 배경
                          : 'bg-amber-900/30 border border-amber-500/30'  // API에서 불러온 메모는 노란색 배경
                      }`}
                    >
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center">
                          <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-lg mr-2">
                            📝
                          </span>
                          <span className="font-medium text-white">{note.user}</span>
                        </div>
                        <span className="text-xs text-slate-400">{formatDate(note.date)}</span>
                      </div>
                      
                      <p className="pl-10 text-slate-300 whitespace-pre-wrap">{note.content}</p>
                      
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-300"
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
                    <p className="text-slate-400">등록된 메모가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {currentActiveTab === 'analytics' && (
          <div>
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4 text-white">서비스 사용 현황</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                  <div className="text-xs text-slate-400 mb-1">쿠폰 사용</div>
                  <div className="text-2xl font-bold text-blue-300">{client.usesCoupon ? '사용중' : '미사용'}</div>
                  <div className="text-sm text-slate-400 mt-1">최근 30일</div>
                </div>
                
                <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30">
                  <div className="text-xs text-slate-400 mb-1">소식 발행</div>
                  <div className="text-2xl font-bold text-green-300">{client.publishesNews ? '발행중' : '미발행'}</div>
                  <div className="text-sm text-slate-400 mt-1">최근 30일</div>
                </div>
                
                <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
                  <div className="text-xs text-slate-400 mb-1">예약 시스템</div>
                  <div className="text-2xl font-bold text-purple-300">{client.usesReservation ? '사용중' : '미사용'}</div>
                  <div className="text-sm text-slate-400 mt-1">최근 30일</div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4 text-white">업무 진행 현황</h3>
              
              <div className="bg-[#1e1e30] rounded-lg border border-white/10 p-4">
                <div className="text-center py-4 text-slate-400">
                  <p>진행 상황 데이터를 불러오는 중입니다...</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4 text-white">부서별 할 일 현황</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['디자인', '콘텐츠', '미디어', '고객관리', '관리자'].map((dept, index) => (
                  <div key={index} className="bg-[#1e1e30] rounded-lg border border-white/10 p-4 text-center">
                    <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center bg-slate-800">
                      <span className="text-xl">📊</span>
                    </div>
                    <div className="font-medium text-sm mb-1 text-white">{dept}</div>
                    <div className="text-xs text-slate-400">데이터 로딩 중...</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 shadow-lg border border-purple-500/30"
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