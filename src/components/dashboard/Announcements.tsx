'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNoticeContext } from "@/context/NoticeContext";

export const Announcements = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<string | null>(null);
  const { notices } = useNoticeContext();
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // 최대 4개의 공지사항을 표시하고, 고정된 공지사항을 우선 표시
  const displayedNotices = notices
    .sort((a, b) => {
      // 고정된 공지사항을 우선 정렬
      if (a.isFixed && !b.isFixed) return -1;
      if (!a.isFixed && b.isFixed) return 1;
      
      // 같은 고정 상태라면 날짜순 정렬
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 4);

  // 날짜 포맷 함수
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className={`mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute -inset-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-30 animate-pulse blur"></div>
            <span className="text-red-400 relative">📢</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-200">공지사항</h2>
        </div>
        <span 
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-300 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>새로운 업데이트를 확인하세요!</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>

      <div className="rounded-lg border border-slate-800 bg-[#151523] overflow-hidden">
        <div className="divide-y divide-slate-800/70">
          {displayedNotices.length > 0 ? (
            displayedNotices.map((notice) => (
              <Link 
                key={notice.id}
                href={`/notices/${notice.id}`}
                className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-slate-800/50 hover:to-slate-800/20 transition-all duration-300 group relative overflow-hidden cursor-pointer block"
                onMouseEnter={() => setActiveAnnouncement(notice.id)}
                onMouseLeave={() => setActiveAnnouncement(null)}
              >
                {/* 호버 배경 효과 */}
                {activeAnnouncement === notice.id && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500"></div>
                )}
                
                <div className="flex items-center gap-3 relative z-10">
                  {notice.isFixed && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-950 text-pink-400 text-xs group-hover:bg-pink-900 group-hover:text-pink-300 transition-colors duration-300 group-hover:animate-pulse">
                      중요
                    </span>
                  )}
                  <span className={`${notice.isFixed ? 'font-medium' : ''} text-slate-200 group-hover:text-white transition-colors duration-300 group-hover:translate-x-1 transform`}>
                    {notice.title}
                  </span>
                  
                  {/* New 뱃지 - 최근 3일 이내 게시물 */}
                  {((new Date().getTime() - new Date(notice.createdAt).getTime()) / (1000 * 60 * 60 * 24) < 3) && (
                    <span className="inline-block px-1.5 py-0.5 bg-blue-900/50 text-blue-400 text-[10px] rounded">NEW</span>
                  )}
                </div>
                
                <div className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors duration-300 relative z-10">
                  {formatDate(notice.createdAt)}
                </div>
                
                {/* 반짝이는 효과 */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"></div>
              </Link>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-slate-400 flex flex-col items-center">
              <span role="img" aria-label="공지사항 없음" className="text-3xl mb-2 animate-pulse">🔍</span>
              <p>아직 공지사항이 없어요. 곧 새로운 소식을 전해드릴게요!</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center p-4 border-t border-slate-800">
          <Link 
            href="/notices"
            className="w-full py-2 px-4 rounded-md border border-slate-700 text-slate-400 hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-800 hover:text-white hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/50 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-1">
              <span>전체보기</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/30 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite] -translate-x-full group-hover:translate-x-full"></span>
          </Link>
        </div>
      </div>
    </div>
  );
}; 