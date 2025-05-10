'use client';

import { NoticeListFull } from './NoticeListFull';
import Link from 'next/link';
import { useNoticeContext } from '@/context/NoticeContext';
import { Header } from '@/components/Header';

export default function NoticesPage() {
  const { notices } = useNoticeContext();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Header
        title="공지사항"
        description="새로운 업데이트를 확인하세요!"
        icon="📋"
        actions={
          <div className="flex items-center gap-2">
            <Link 
              href="/notices/create" 
              className="bg-white text-[#2251D1] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow"
            >
              <span className="mr-2">➕</span> 새 공지 등록
            </Link>
            <Link 
              href="/" 
              className="bg-white text-[#2251D1] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow"
            >
              <span className="mr-2">📊</span> 대시보드로 돌아가기
            </Link>
          </div>
        }
      />
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <NoticeListFull notices={notices} />
      </div>
    </div>
  );
} 