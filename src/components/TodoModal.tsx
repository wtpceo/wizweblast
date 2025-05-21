'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, User, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Client } from '@/lib/mock-data';
import { useUser } from '@clerk/nextjs';

interface TodoModalProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    clientId: string, 
    content: string, 
    assignedTo: string, 
    dueDate: string | undefined, 
    assigneeName: string, 
    assigneeAvatar: string
  ) => Promise<void>;
}

type TeamMember = {
  id: string;
  name: string;
  emoji: string;
  department?: string;
  imageUrl?: string;
};

export function TodoModal({ client, isOpen, onClose, onSave }: TodoModalProps) {
  const [content, setContent] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const contentInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  
  // 사용자 목록 가져오기
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await fetch('/api/users');
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`사용자 목록을 가져오는데 실패했습니다. 상태: ${response.status}, 메시지: ${errorText}`);
        }
        
        const users = await response.json();
        
        // 팀원 데이터 형식으로 변환
        const formattedTeamMembers: TeamMember[] = users.map((user: any) => ({
          id: user.id,
          name: user.name,
          emoji: '👤', // 기본 이모지
          department: user.department,
          imageUrl: user.imageUrl
        }));
        
        setTeamMembers(formattedTeamMembers);
        
        // 기본 담당자를 현재 로그인한 사용자로 설정
        if (formattedTeamMembers.length > 0 && user) {
          const currentUserMember = formattedTeamMembers.find(m => m.id === user.id);
          if (currentUserMember) {
            setAssignedTo(currentUserMember.id);
          } else if (formattedTeamMembers.length > 0) {
            // 현재 사용자가 목록에 없으면 첫 번째 사용자 선택
            setAssignedTo(formattedTeamMembers[0].id);
          }
        }
      } catch (error) {
        console.error('사용자 목록 로딩 오류:', error);
        // 오류 시 기본 사용자만 표시
        if (user) {
          setTeamMembers([
            { id: user.id || 'current-user', name: user.firstName || '현재 사용자', emoji: '👨‍💼' }
          ]);
          setAssignedTo(user.id || 'current-user');
        } else {
          setTeamMembers([
            { id: 'current-user', name: '현재 사용자', emoji: '👨‍💼' }
          ]);
          setAssignedTo('current-user');
        }
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, user]);
  
  // 모달이 열릴 때 필드 초기화
  useEffect(() => {
    if (isOpen) {
      setContent('');
      setDueDate(null);
      setShowCalendar(false);
      setIsSubmitting(false);
      
      // 입력 필드에 포커스
      setTimeout(() => {
        contentInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Esc 키: 모달 닫기
      if (e.key === 'Escape') {
        onClose();
      }
      
      // Enter 키 + Alt 키: 제출 (text area에서 Enter만 누르면 줄바꿈으로 처리)
      if (e.key === 'Enter' && e.altKey && content.trim() && assignedTo) {
        handleSubmit(e as any);
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, content, assignedTo, onClose]);
  
  // 달력에 표시할 월 관리
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  
  // 이전/다음 월 이동
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // 해당 월의 일 수 계산
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // 해당 월의 첫 날 요일 계산 (0: 일요일, 6: 토요일)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // 달력 생성
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    
    // 이전 달의 날짜로 채우기
    const prevMonthDays = currentMonth === 0 
      ? getDaysInMonth(currentYear - 1, 11) 
      : getDaysInMonth(currentYear, currentMonth - 1);
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="text-gray-600 text-center p-2">
          {prevMonthDays - i}
        </div>
      );
    }
    
    // 현재 달의 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dateString = format(date, 'yyyy-MM-dd');
      const isSelected = dueDate === dateString;
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
      
      days.push(
        <div 
          key={`current-${i}`}
          className={`text-center p-2 cursor-pointer rounded-full transition-colors
            ${isSelected ? 'bg-blue-700 text-white hover:bg-blue-600' : ''}
            ${isToday && !isSelected ? 'bg-blue-950 text-green-400 border border-green-500' : ''}
            ${isPast && !isSelected && !isToday ? 'text-gray-500' : ''}
            ${!isPast && !isSelected && !isToday ? 'text-gray-300 hover:bg-blue-900/50 hover:text-white' : ''}
          `}
          onClick={() => {
            setDueDate(dateString);
            setShowCalendar(false);
          }}
        >
          {i}
        </div>
      );
    }
    
    // 다음 달의 날짜로 채우기
    const totalCells = 42; // 6주 x 7일
    const nextMonthDays = totalCells - days.length;
    
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push(
        <div key={`next-${i}`} className="text-gray-600 text-center p-2">
          {i}
        </div>
      );
    }
    
    return days;
  };
  
  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !assignedTo) return;
    
    try {
      setIsSubmitting(true);
      
      // 선택된 담당자 정보 가져오기
      const selectedMember = teamMembers.find(m => m.id === assignedTo);
      const assigneeName = selectedMember?.name || '';
      const assigneeAvatar = selectedMember?.imageUrl || '';
      
      await onSave(
        client.id, 
        content, 
        assignedTo, 
        dueDate || undefined, 
        assigneeName, 
        assigneeAvatar
      );
      
      onClose();
    } catch (error) {
      console.error('할 일 저장 오류:', error);
      alert('할 일 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 선택된 담당자 정보
  const selectedMember = assignedTo ? teamMembers.find(m => m.id === assignedTo) : null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
      <div 
        className="bg-gray-950/90 rounded-xl shadow-xl p-6 w-full max-w-lg transform transition-all animate-scale-up border border-gray-800 text-gray-100"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold flex items-center">
            <div className="mr-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
              <span className="text-xl">{client.icon}</span>
            </div>
            <div>
              <span>{client.name}</span>
              <div className="text-xs text-gray-500">새 할 일 등록</div>
            </div>
          </h3>
          <button 
            onClick={onClose}
            className="bg-blue-900 hover:bg-blue-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-white"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* 할 일 내용 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-blue-300 mb-1">
              할 일 내용
            </label>
            <input
              ref={contentInputRef}
              type="text"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="할 일 내용을 입력하세요"
              className="w-full bg-gray-900 border border-blue-900/50 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
              required
            />
          </div>
          
          {/* 담당자 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-blue-300 mb-1">
              담당자 선택
            </label>
            
            {isLoadingUsers ? (
              <div className="flex justify-center py-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-400 border-t-transparent"></div>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-blue-900/50 bg-gray-900">
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    onClick={() => setAssignedTo(member.id)}
                    className={`flex items-center p-3 cursor-pointer transition-colors ${
                      assignedTo === member.id
                        ? 'bg-blue-900/50 border-l-4 border-l-green-400 border-t-0 border-r-0 border-b border-b-gray-800'
                        : 'hover:bg-gray-800 border-b border-gray-800'
                    }`}
                  >
                    {member.imageUrl ? (
                      <img
                        src={member.imageUrl}
                        alt={member.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-green-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className={`${assignedTo === member.id ? 'font-medium text-green-400' : 'text-gray-300'}`}>
                        {member.name}
                      </div>
                      {member.department && (
                        <div className="text-xs text-blue-300">
                          {member.department}
                        </div>
                      )}
                    </div>
                    {assignedTo === member.id && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* 마감일 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-blue-300 mb-1">
              마감일 (선택사항)
            </label>
            <div className="relative">
              <div 
                className="flex items-center bg-gray-900 border border-blue-900/50 rounded-lg p-3 cursor-pointer hover:border-blue-700"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <Calendar className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-gray-300">
                {dueDate 
                  ? format(new Date(dueDate), 'yyyy년 MM월 dd일 (EEEE)', { locale: ko })
                  : '마감일을 선택하세요'}
                </span>
                {dueDate && (
                  <button
                    type="button"
                    className="ml-auto text-blue-400 hover:text-blue-300"
                    onClick={e => {
                      e.stopPropagation();
                      setDueDate(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {/* 날짜 선택 캘린더 */}
              {showCalendar && (
                <div className="absolute z-10 mt-1 w-full bg-gray-950/90 rounded-lg shadow-lg border border-gray-800 p-3 animate-fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <button
                      type="button"
                      onClick={goToPreviousMonth}
                      className="h-7 w-7 bg-blue-900 border border-blue-800 p-0 opacity-100 hover:bg-blue-800 text-green-400 rounded-md"
                    >
                      <ChevronLeft className="h-4 w-4 m-auto" />
                    </button>
                    <div className="font-medium text-white">
                      {format(new Date(currentYear, currentMonth), 'yyyy년 MM월', { locale: ko })}
                    </div>
                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="h-7 w-7 bg-blue-900 border border-blue-800 p-0 opacity-100 hover:bg-blue-800 text-green-400 rounded-md"
                    >
                      <ChevronRight className="h-4 w-4 m-auto" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {/* 요일 헤더 */}
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                      <div key={day} className="text-center font-bold text-sm text-blue-300 p-2 border-b border-gray-800">
                        {day}
                      </div>
                    ))}
                    
                    {/* 날짜 그리드 */}
                    {renderCalendar()}
                  </div>
                  
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-green-400 hover:text-green-300"
                      onClick={() => setShowCalendar(false)}
                    >
                      닫기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 요약 정보 */}
          {(assignedTo || dueDate) && (
            <div className="mb-4 bg-gray-900 p-3 rounded-lg border border-blue-900/30">
              <div className="text-sm text-blue-300 font-medium mb-2">등록 정보</div>
              <div className="space-y-2">
                {selectedMember && (
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-green-400" />
                    <span className="text-gray-300">담당자: {selectedMember.name}</span>
                  </div>
                )}
                {dueDate && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-green-400" />
                    <span className="text-gray-300">마감일: {format(new Date(dueDate), 'yyyy년 MM월 dd일', { locale: ko })}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 액션 버튼 */}
          <div className="flex justify-between items-center">
            <div className="text-xs text-blue-300">
              {content.length > 0 && assignedTo
                ? "필수 정보가 모두 입력되었습니다."
                : "내용과 담당자는 필수 입력사항입니다."}
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={!content.trim() || !assignedTo || isSubmitting}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                  content.trim() && assignedTo && !isSubmitting
                    ? 'bg-blue-700 text-white hover:bg-blue-600'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 