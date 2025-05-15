'use client';

import { NoticeListFull } from './NoticeListFull';
import Link from 'next/link';
import { useNoticeContext } from '@/context/NoticeContext';
import { Header } from '@/components/Header';

export default function NoticesPage() {
  const { notices } = useNoticeContext();
  
  return (
    <div className="min-h-screen bg-[#0F0F1A] py-8 px-4">
      <div className="container mx-auto">
        <Header
          title="공지사항"
          description="새로운 업데이트를 확인하세요!"
          icon="📋"
          actions={
            <div className="flex items-center gap-2">
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
          <NoticeListFull notices={notices} />
        </div>
      </div>
    </div>
  );
} 