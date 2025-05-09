'use client';

import { Notice } from "@/lib/mock-data";
import Link from "next/link";
import { useNoticeContext } from "@/context/NoticeContext";

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
    <div className="wiz-card mb-8 overflow-hidden">
      <div className="px-6 py-4 border-b border-[#EEF2FB] flex justify-between items-center">
        <h2 className="text-lg font-bold flex items-center">
          <span role="img" aria-label="공지사항" className="mr-2">📌</span>
          공지사항
        </h2>
        <span className="text-xs text-[#2251D1]">새로운 업데이트를 확인하세요!</span>
      </div>
      
      <div className="max-h-64 overflow-y-auto">
        {displayedNotices.length > 0 ? (
          <ul className="divide-y divide-[#EEF2FB]">
            {displayedNotices.map((notice) => (
              <li key={notice.id} className="px-6 py-4 hover:bg-[#F9FAFD] transition-all duration-200 cursor-pointer">
                <Link href={`/notices/${notice.id}`} className="block">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 truncate">
                      {notice.isFixed && (
                        <span className="bg-[#FFEBEE] text-[#F44336] text-xs px-2 py-0.5 rounded-full mr-2 font-medium flex-shrink-0">
                          중요
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-900 truncate">{notice.title}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{formatDate(notice.createdAt)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500 flex flex-col items-center">
            <span role="img" aria-label="공지사항 없음" className="text-3xl mb-2">🔍</span>
            <p>아직 공지사항이 없어요. 곧 새로운 소식을 전해드릴게요!</p>
          </div>
        )}
      </div>
      
      <div className="px-6 py-3 border-t border-[#EEF2FB] bg-[#F9FAFD]">
        <Link href="/notices" className="wiz-btn flex items-center justify-center w-full bg-opacity-10 text-[#2251D1] hover:bg-opacity-20 transition-all">
          전체보기 <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );
} 