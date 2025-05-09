'use client';

import { NoticeListFull } from './NoticeListFull';
import Link from 'next/link';
import { useNoticeContext } from '@/context/NoticeContext';

export default function NoticesPage() {
  const { notices } = useNoticeContext();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">📋</span> 공지사항
        </h1>
        <div className="flex items-center mt-4 md:mt-0">
          <Link 
            href="/notices/create" 
            className="mr-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2251D1] hover:bg-[#1A41B6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2251D1]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            새 공지 등록
          </Link>
          <Link 
            href="/" 
            className="flex items-center text-[#2251D1] hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <NoticeListFull notices={notices} />
      </div>
    </div>
  );
} 