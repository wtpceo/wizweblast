'use client';

import { Notice } from "@/lib/mock-data";
import Link from "next/link";
import { useNoticeContext } from "@/context/NoticeContext";
import { useEffect } from "react";

export function NoticeList() {
  const { notices } = useNoticeContext();
  
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
    <div className="mb-8 rounded-lg border border-white/10 bg-[#151523] overflow-hidden shadow-xl hover:shadow-blue-900/20 transition-all duration-300">
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm px-6 py-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center text-white">
          <span role="img" aria-label="공지사항" className="mr-2 text-red-400">📢</span>
          공지사항
        </h2>
        <span className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer transform hover:translate-x-1 transition-transform duration-300">새로운 업데이트를 확인하세요!</span>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {displayedNotices.length > 0 ? (
          <ul className="divide-y divide-slate-800/80">
            {displayedNotices.map((notice) => (
              <li key={notice.id} className="hover:bg-gradient-to-r hover:from-slate-800/40 hover:to-slate-800/10 transition-all duration-300 group">
                <Link href={`/notices/${notice.id}`} className="block px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 truncate">
                      {notice.isFixed && (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-950/80 text-pink-400 text-xs group-hover:bg-pink-900 group-hover:text-pink-300 transition-colors duration-300 group-hover:animate-pulse mr-2">
                          중요
                        </span>
                      )}
                      <span className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors duration-300 group-hover:translate-x-1 transform">{notice.title}</span>
                    </div>
                    <span className="text-xs text-slate-500 ml-2 flex-shrink-0 group-hover:text-slate-300 transition-colors duration-300">{formatDate(notice.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-8 text-center text-slate-400 flex flex-col items-center">
            <span role="img" aria-label="공지사항 없음" className="text-3xl mb-2 animate-pulse">🔍</span>
            <p>아직 공지사항이 없어요. 곧 새로운 소식을 전해드릴게요!</p>
          </div>
        )}
      </div>
      
      <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-800/30">
        <Link href="/notices" className="flex items-center justify-center w-full py-2 rounded-md border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300 relative overflow-hidden group">
          <span className="relative z-10 flex items-center">전체보기 <span className="ml-1 group-hover:translate-x-1 transition-transform duration-300">→</span></span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/30 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite] -translate-x-full group-hover:translate-x-full"></span>
        </Link>
      </div>
    </div>
  );
} 