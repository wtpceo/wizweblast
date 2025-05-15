'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notice } from '@/lib/mock-data';  // 타입만 가져옵니다

type NoticeContextType = {
  notices: Notice[];
  isLoading: boolean;
  error: string | null;
  addNotice: (title: string, content: string, isFixed: boolean) => Promise<{success: boolean, error?: string}>;
  deleteNotice: (id: string) => Promise<{success: boolean, error?: string}>;
  updateNotice: (id: string, title: string, content: string, isFixed: boolean) => Promise<{success: boolean, error?: string}>;
  refreshNotices: () => Promise<void>;
};

const NoticeContext = createContext<NoticeContextType | undefined>(undefined);

export function NoticeProvider({ children }: { children: React.ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 공지사항 데이터 가져오기
  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      // 캐시 방지를 위한 타임스탬프 추가
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/notices?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('공지사항을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setNotices(data);
      setError(null);
    } catch (err) {
      console.error('공지사항 로딩 오류:', err);
      setError('공지사항을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchNotices();
  }, []);

  // 공지사항 추가
  const addNotice = async (title: string, content: string, isFixed: boolean) => {
    try {
      console.log('공지사항 추가 시도:', { title, content, isFixed });
      
      // 서버 측 API를 사용하여 공지사항 추가 요청
      const response = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          title,
          content,
          isFixed,
        }),
      });
      
      console.log('응답 상태:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('응답 데이터:', data);
      
      if (!response.ok) {
        console.error('공지사항 추가 실패:', data.error);
        
        // API 오류 메시지가 RLS 정책 관련인지 확인
        if (data.error && data.error.includes('row-level security policy')) {
          return { 
            success: false, 
            error: '권한 오류: RLS 정책으로 인해 공지사항을 추가할 수 없습니다. 관리자에게 문의하세요.'
          };
        }
        
        return { success: false, error: data.error || '공지사항 추가에 실패했습니다.' };
      }
      
      // 새 공지사항 추가
      if (data.notice) {
        setNotices(prevNotices => [data.notice, ...prevNotices]);
      } else {
        // 데이터가 올바르지 않은 경우 전체 새로고침
        await fetchNotices();
      }
      
      return { success: true };
    } catch (err) {
      console.error('공지사항 추가 오류:', err);
      return { success: false, error: '공지사항 추가 중 오류가 발생했습니다.' };
    }
  };

  // 공지사항 삭제
  const deleteNotice = async (id: string) => {
    try {
      const response = await fetch(`/api/notices/${id}`, {
        method: 'DELETE',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '공지사항 삭제에 실패했습니다.' };
      }
      
      // 공지사항 목록에서 삭제
      setNotices(prevNotices => prevNotices.filter(notice => notice.id !== id));
      
      // 전체 목록 새로고침하여 동기화 확인
      setTimeout(() => fetchNotices(), 300);
      
      return { success: true };
    } catch (err) {
      console.error('공지사항 삭제 오류:', err);
      return { success: false, error: '공지사항 삭제 중 오류가 발생했습니다.' };
    }
  };

  // 공지사항 업데이트
  const updateNotice = async (id: string, title: string, content: string, isFixed: boolean) => {
    try {
      const response = await fetch(`/api/notices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          title,
          content,
          isFixed,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error || '공지사항 수정에 실패했습니다.' };
      }
      
      const data = await response.json();
      
      // 공지사항 목록 업데이트
      if (data.notice) {
        setNotices(prevNotices => 
          prevNotices.map(notice => 
            notice.id === id ? data.notice : notice
          )
        );
      } else {
        // 데이터가 올바르지 않은 경우 전체 새로고침
        await fetchNotices();
      }
      
      return { success: true };
    } catch (err) {
      console.error('공지사항 수정 오류:', err);
      return { success: false, error: '공지사항 수정 중 오류가 발생했습니다.' };
    }
  };
  
  // 공지사항 새로고침
  const refreshNotices = async () => {
    await fetchNotices();
  };

  return (
    <NoticeContext.Provider value={{ 
      notices, 
      isLoading,
      error,
      addNotice, 
      deleteNotice, 
      updateNotice,
      refreshNotices
    }}>
      {children}
    </NoticeContext.Provider>
  );
}

export function useNoticeContext() {
  const context = useContext(NoticeContext);
  if (context === undefined) {
    throw new Error('useNoticeContext must be used within a NoticeProvider');
  }
  return context;
} 