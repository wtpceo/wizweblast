'use client';

import { useState } from 'react';
import { Client } from '@/lib/mock-data';

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
  id: number;
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
    keywords: ['불고기', '한우', '점심특선', '가족모임', '단체예약'],
    lastUpdated: '2023-12-01T15:45:00Z'
  };
  
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
  const handleAddTodo = () => {
    if (!todoInput.trim()) return;
    
    const newTodo: Todo = {
      id: Date.now(),
      content: todoInput,
      date: new Date().toISOString(),
      completed: false,
      user: '현재 사용자', // 실제 구현 시 로그인 사용자 정보 사용
      department: selectedDepartment as any
    };
    
    setTodos([newTodo, ...todos]);
    setTodoInput('');
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
  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    
    const newNote: Note = {
      id: Date.now(),
      content: noteInput,
      date: new Date().toISOString(),
      user: '현재 사용자', // 실제 구현 시 로그인 사용자 정보 사용
    };
    
    setNotes([newNote, ...notes]);
    setNoteInput('');
  };
  
  // 메모 삭제
  const deleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  
  // 민원 토글 처리
  const toggleComplaint = () => {
    setHasComplaint(!hasComplaint);
    
    // 실제 구현 시 API 호출하여 상태 업데이트
    alert(`민원 상태가 ${!hasComplaint ? '활성화' : '비활성화'}되었습니다.`);
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
              
              <div className="flex flex-wrap gap-2">
                {crawledInfo.keywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1.5 bg-[#EEF2FB] text-[#2251D1] rounded-full text-sm"
                  >
                    {keyword}
                  </span>
                ))}
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
        
        {/* 할 일 탭 */}
        {activeTab === 'todos' && (
          <div>
            <div className="mb-6">
              <h3 className="font-medium text-lg mb-4">할 일 관리</h3>
              
              <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex flex-col space-y-3">
                  <input
                    type="text"
                    value={todoInput}
                    onChange={(e) => setTodoInput(e.target.value)}
                    placeholder="새 할 일을 입력하세요..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2251D1]"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">담당 부서:</span>
                      <div className="flex space-x-1">
                        {departments.map(dept => (
                          <button
                            key={dept.id}
                            onClick={() => setSelectedDepartment(dept.id)}
                            className={`p-1.5 rounded-full transition-colors ${
                              selectedDepartment === dept.id
                                ? `bg-[${dept.color}] text-white`
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={dept.name}
                          >
                            {dept.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleAddTodo}
                      disabled={!todoInput.trim()}
                      className={`px-4 py-2 rounded-lg ${
                        todoInput.trim()
                          ? 'bg-[#4CAF50] text-white hover:bg-[#3d8b40]'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {todos.length > 0 ? (
                  todos.map(todo => {
                    // 부서 정보 찾기
                    const department = departments.find(d => d.id === todo.department);
                    
                    return (
                      <div
                        key={todo.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start">
                          <button
                            onClick={() => toggleTodoComplete(todo.id)}
                            className={`w-5 h-5 rounded-full flex-shrink-0 mt-1 ${
                              todo.completed
                                ? 'bg-[#4CAF50] text-white flex items-center justify-center'
                                : 'border-2 border-gray-300'
                            }`}
                          >
                            {todo.completed && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                          
                          <div className="ml-3 flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className={`${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                  {todo.content}
                                </p>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs text-gray-500 mr-2">{formatDate(todo.date)}</span>
                                  <span className="text-xs text-gray-500">{todo.user}</span>
                                </div>
                              </div>
                              
                              <div className="flex space-x-2">
                                <span 
                                  className="px-2 py-1 text-xs rounded-full" 
                                  style={{ 
                                    backgroundColor: department ? `${department.color}20` : '#f0f0f0',
                                    color: department?.color || '#666'
                                  }}
                                >
                                  {department?.icon} {department?.name}
                                </span>
                                
                                <button
                                  onClick={() => deleteTodo(todo.id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-gray-500">등록된 할 일이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* 메모 탭 */}
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
                      disabled={!noteInput.trim()}
                      className={`px-4 py-2 rounded-lg ${
                        noteInput.trim()
                          ? 'bg-[#FFC107] text-white hover:bg-[#e6ac00]'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      메모 저장
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {notes.length > 0 ? (
                  notes.map(note => (
                    <div
                      key={note.id}
                      className="p-4 bg-[#FFF8E1] rounded-lg relative"
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
        
        {/* 분석 탭 */}
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