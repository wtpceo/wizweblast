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
      <div className="border border-gray-200 rounded-md p-4 mb-4 hover:bg-[#F9FAFD] hover:border-[#2251D1] transition-all duration-300 cursor-pointer">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              {notice.isFixed && (
                <span className="bg-[#EEF2FB] text-[#2251D1] text-xs font-medium mr-2 px-2 py-1 rounded-full flex items-center">
                  <span className="mr-1">📌</span> 
                  고정
                </span>
              )}
              <h3 className="text-base font-medium text-gray-800">{notice.title}</h3>
            </div>
          </div>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
      </div>
    </Link>
  );
} 