'use client';

import { useState } from 'react';
import { format, isPast } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Check, Clock, AlertTriangle, User, Calendar, MoreHorizontal, Trash2, Lock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

// 할 일 타입 정의
export interface Todo {
  id: string;
  clientId: string;
  clientName?: string;
  clientIcon?: string;
  content: string;
  assignedTo: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
}

interface TodoCardProps {
  todo: Todo;
  onComplete: (id: string, currentStatus: boolean) => void;
  onAssigneeChange?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TodoCard({ todo, onComplete, onAssigneeChange, onDelete }: TodoCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useUser();
  
  // 상태 계산: 완료, 지연, 진행 중
  const getStatus = () => {
    if (todo.completed) return 'completed';
    if (todo.dueDate && isPast(new Date(todo.dueDate))) return 'delayed';
    return 'pending';
  };
  
  const status = getStatus();
  
  // 상태별 색상 및 아이콘
  const statusConfig = {
    completed: {
      bgColor: 'bg-green-950/40',
      borderColor: 'border-green-600/40',
      icon: <Check className="h-4 w-4 text-green-500" />,
      label: '완료됨',
      textColor: 'text-green-500'
    },
    delayed: {
      bgColor: 'bg-red-950/40',
      borderColor: 'border-red-600/40',
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      label: '지연됨',
      textColor: 'text-red-500'
    },
    pending: {
      bgColor: 'bg-amber-950/40',
      borderColor: 'border-amber-600/40',
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      label: '진행 중',
      textColor: 'text-amber-500'
    }
  };
  
  // 할 일 삭제 처리
  const handleDelete = () => {
    if (isDeleting || !onDelete) return;
    
    if (confirm('이 할 일을 정말 삭제하시겠습니까?')) {
      setIsDeleting(true);
      onDelete(todo.id);
    }
  };
  
  // 담당자 변경 처리
  const handleAssigneeChange = () => {
    if (!onAssigneeChange) return;
    onAssigneeChange(todo.id);
  };
  
  return (
    <div 
      className={`p-4 border rounded-lg transition-all duration-300 mb-3 
        ${todo.completed ? 'bg-[#1E1E32] border-green-600/20' : 'bg-[#171727] border-blue-600/10'}
        hover:border-blue-500/30 hover:bg-[#1a1a2e]
        hover:shadow-lg hover:shadow-blue-900/10
        ${isDeleting ? 'opacity-50' : ''}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start">
        <button
          onClick={() => onComplete(todo.id, todo.completed)}
          disabled={isDeleting}
          className={`w-5 h-5 rounded-full flex-shrink-0 mt-1 transition-all duration-300 ${
            todo.completed 
              ? 'bg-green-600 text-white flex items-center justify-center'
              : 'border-2 border-slate-500 hover:border-green-500 hover:scale-110'
          }`}
          aria-label={todo.completed ? "완료 취소하기" : "완료 처리하기"}
        >
          {todo.completed && <Check className="h-3 w-3" />}
        </button>
        
        <div className="ml-3 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <p className={`${todo.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                {todo.content}
              </p>
              
              <div className="flex items-center mt-1 text-xs text-slate-500 space-x-2">
                {/* 등록일 */}
                {todo.createdAt && (
                  <span>
                    등록: {format(new Date(todo.createdAt), 'yyyy.MM.dd', { locale: ko })}
                  </span>
                )}
                
                {/* 마감일이 있는 경우 */}
                {todo.dueDate && (
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(todo.dueDate), 'yyyy.MM.dd', { locale: ko })}
                  </span>
                )}
                
                {/* 완료일이 있는 경우 */}
                {todo.completed && todo.completedAt && (
                  <span>
                    완료: {format(new Date(todo.completedAt), 'yyyy.MM.dd', { locale: ko })}
                  </span>
                )}
              </div>
            </div>
            
            {/* 상태 뱃지 */}
            <div className="flex space-x-2">
              <span 
                className={`px-2 py-1 text-xs rounded-full flex items-center ${statusConfig[status].textColor} ${statusConfig[status].bgColor} border ${statusConfig[status].borderColor}`}
              >
                {statusConfig[status].icon}
                <span className="ml-1">{statusConfig[status].label}</span>
              </span>
            </div>
          </div>
          
          {/* 담당자 정보 및 액션 버튼 */}
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center">
              {todo.assigneeAvatar ? (
                <img 
                  src={todo.assigneeAvatar} 
                  alt={todo.assigneeName || '담당자'} 
                  className="w-6 h-6 rounded-full mr-2 border border-white/20"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center mr-2 border border-slate-700">
                  <User className="h-3 w-3 text-slate-400" />
                </div>
              )}
              <div className="text-xs">
                <div className="flex items-center">
                  <span className={`font-medium ${todo.assigneeName ? 'text-blue-400' : 'text-slate-400'}`}>
                    {todo.assigneeName || '담당자 미지정'}
                  </span>
                  {onAssigneeChange && (
                    <button
                      onClick={handleAssigneeChange}
                      disabled={isDeleting}
                      className="ml-2 text-xs bg-blue-950/50 hover:bg-blue-900/60 text-blue-400 px-2 py-0.5 rounded-full flex items-center transition-all duration-300 border border-blue-700/30 hover:scale-105"
                      title="담당자 변경하기"
                    >
                      <User className="h-3 w-3 mr-1" />
                      담당자 변경
                    </button>
                  )}
                </div>
                {todo.clientName && (
                  <div className="text-slate-500 mt-1 flex items-center">
                    <span className="mr-1">{todo.clientIcon || '🏢'}</span>
                    {todo.clientName}
                  </div>
                )}
              </div>
            </div>
            
            {/* 마우스 오버 시 나타나는 액션 버튼 */}
            {showActions && onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs px-2 py-1 bg-red-950/50 hover:bg-red-900/60 text-red-400 rounded flex items-center transition-all duration-300 border border-red-700/30 hover:scale-105"
                aria-label="할 일 삭제"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                삭제
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 