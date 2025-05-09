'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notice, mockNotices } from '@/lib/mock-data';

type NoticeContextType = {
  notices: Notice[];
  addNotice: (title: string, isFixed: boolean) => void;
  deleteNotice: (id: string) => void;
  updateNotice: (id: string, title: string, isFixed: boolean) => void;
};

const NoticeContext = createContext<NoticeContextType | undefined>(undefined);

export function NoticeProvider({ children }: { children: React.ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([]);

  // 초기 목업 데이터 로드
  useEffect(() => {
    setNotices(mockNotices);
  }, []);

  // 공지사항 추가
  const addNotice = (title: string, isFixed: boolean) => {
    const newNotice: Notice = {
      id: Date.now().toString(), // 간단한 임시 ID 생성
      title,
      isFixed,
      createdAt: new Date().toISOString(),
    };
    
    setNotices(prevNotices => [newNotice, ...prevNotices]);
  };

  // 공지사항 삭제
  const deleteNotice = (id: string) => {
    setNotices(prevNotices => prevNotices.filter(notice => notice.id !== id));
  };

  // 공지사항 업데이트
  const updateNotice = (id: string, title: string, isFixed: boolean) => {
    setNotices(prevNotices => 
      prevNotices.map(notice => 
        notice.id === id 
          ? { ...notice, title, isFixed } 
          : notice
      )
    );
  };

  return (
    <NoticeContext.Provider value={{ notices, addNotice, deleteNotice, updateNotice }}>
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