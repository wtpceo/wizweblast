'use client';

import { NoticeListFull } from './NoticeListFull';
import Link from 'next/link';
import { useNoticeContext } from '@/context/NoticeContext';
import { Header } from '@/components/Header';
import { useEffect, useState } from 'react';

export default function NoticesPage() {
  const { notices, refreshNotices, isLoading } = useNoticeContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 페이지 로드 시 데이터 새로고침
  useEffect(() => {
    // 현재 로딩 중이 아닐 경우에만 새로고침
    if (!isLoading) {
      refreshNotices();
    }
  }, []);
  
  // 수동 새로고침 핸들러
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNotices();
    setIsRefreshing(false);
  };
  
  return (
    <div className="min-h-screen bg-[#0F0F1A] py-8 px-4">
      <div className="container mx-auto">
        <Header
          title="공지사항"
          description="새로운 업데이트를 확인하세요!"
          icon="📋"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white py-2 px-4 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-green-700/30 border border-green-500/30 text-sm disabled:opacity-50"
              >
                <span className="mr-2">{isRefreshing ? '🔄' : '🔄'}</span> 
                {isRefreshing ? '새로고침 중...' : '새로고침'}
              </button>
              <Link 
                href="/notices/create" 
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-2 px-4 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-amber-700/30 border border-amber-500/30 text-sm"
              >
                <span className="mr-2">➕</span> 새 공지 등록
              </Link>
              <Link 
                href="/" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2 px-4 rounded-lg flex items-center transition-all duration-300 shadow-lg hover:shadow-blue-700/30 border border-blue-500/30 text-sm"
              >
                <span className="mr-2">📊</span> 대시보드로 돌아가기
              </Link>
            </div>
          }
        />
        
        <div className="bg-[#151523] rounded-lg shadow-xl p-6 border border-white/10 mt-6">
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">공지사항 로딩 중...</p>
            </div>
          ) : (
            <NoticeListFull notices={notices} />
          )}
        </div>
      </div>
    </div>
  );
} 