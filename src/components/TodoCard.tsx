'use client';

import { useState } from 'react';
import { format, isPast } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Check, Clock, AlertTriangle, User, Calendar, MoreHorizontal, Trash2 } from 'lucide-react';

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
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: <Check className="h-4 w-4 text-green-500" />,
      label: '완료됨',
      textColor: 'text-green-600'
    },
    delayed: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      label: '지연됨',
      textColor: 'text-red-600'
    },
    pending: {
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      label: '진행 중',
      textColor: 'text-amber-600'
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
  
  return (
    <div 
      className={`p-4 border rounded-lg transition-colors mb-3 
        ${todo.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}
        ${statusConfig[status].borderColor}
        ${statusConfig[status].bgColor}
        hover:shadow-sm
        ${isDeleting ? 'opacity-50' : ''}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start">
        <button
          onClick={() => onComplete(todo.id, todo.completed)}
          disabled={isDeleting}
          className={`w-5 h-5 rounded-full flex-shrink-0 mt-1 ${
            todo.completed 
              ? 'bg-[#4CAF50] text-white flex items-center justify-center'
              : 'border-2 border-gray-300 hover:border-[#4CAF50]'
          }`}
          aria-label={todo.completed ? "완료 취소하기" : "완료 처리하기"}
        >
          {todo.completed && <Check className="h-3 w-3" />}
        </button>
        
        <div className="ml-3 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <p className={`${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                {todo.content}
              </p>
              
              <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
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
                className={`px-2 py-1 text-xs rounded-full flex items-center ${statusConfig[status].textColor}`}
              >
                {statusConfig[status].icon}
                <span className="ml-1">{statusConfig[status].label}</span>
              </span>
            </div>
          </div>
          
          {/* 담당자 정보 및 액션 버튼 */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center text-xs text-gray-600">
              <User className="h-3 w-3 mr-1" />
              <span>{todo.assigneeName || '담당자 없음'}</span>
            </div>
            
            {/* 마우스 오버 시 나타나는 액션 버튼 */}
            {showActions && (
              <div className="flex space-x-1 transition-opacity duration-200 ease-in-out">
                {onAssigneeChange && (
                  <button
                    onClick={() => onAssigneeChange(todo.id)}
                    disabled={isDeleting}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-500 rounded hover:bg-blue-100"
                  >
                    담당자 변경
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-xs px-2 py-1 bg-red-50 text-red-500 rounded hover:bg-red-100 flex items-center"
                    aria-label="할 일 삭제"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    삭제
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 