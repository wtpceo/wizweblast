'use client';

import { Notice } from '@/lib/mock-data';
import Link from 'next/link';

interface NoticeItemProps {
  notice: Notice;
}

// 날짜 포맷팅 함수
const formatNoticeDate = (dateString: string) => {
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

export function NoticeItem({ notice }: NoticeItemProps) {
  const formattedDate = formatNoticeDate(notice.createdAt);
  
  return (
    <Link href={`/notices/${notice.id}`}>
      <div className="border border-white/10 rounded-lg p-4 mb-4 bg-[#151523] hover:bg-[#1a1a2e] hover:border-blue-600/30 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-blue-900/10">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              {notice.isFixed && (
                <span className="bg-blue-950/50 text-blue-400 text-xs font-medium mr-2 px-2 py-1 rounded-full flex items-center border border-blue-700/30">
                  <span className="mr-1">📌</span> 
                  고정
                </span>
              )}
              <h3 className="text-base font-medium text-white">{notice.title}</h3>
            </div>
          </div>
          <span className="text-xs text-slate-500">{formattedDate}</span>
        </div>
      </div>
    </Link>
  );
} 