'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNoticeContext } from '@/context/NoticeContext';

export default function CreateNoticePage() {
  const router = useRouter();
  const { addNotice } = useNoticeContext();
  
  const [title, setTitle] = useState('');
  const [isFixed, setIsFixed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    
    // Context를 통해 공지사항 등록
    addNotice(title, isFixed);
    
    // 목록 페이지로 이동
    router.push('/notices');
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center">
        <Link 
          href="/notices" 
          className="text-[#2251D1] hover:underline flex items-center mr-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          목록으로
        </Link>
        <h1 className="text-xl font-semibold text-gray-800">새 공지사항 등록</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2251D1] focus:border-transparent"
              placeholder="공지사항 제목을 입력하세요"
              required
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="isFixed"
                type="checkbox"
                checked={isFixed}
                onChange={(e) => setIsFixed(e.target.checked)}
                className="h-4 w-4 text-[#2251D1] focus:ring-[#2251D1] border-gray-300 rounded"
              />
              <label htmlFor="isFixed" className="ml-2 block text-sm text-gray-700">
                상단 고정 공지
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              중요한 공지사항은 상단에 고정하여 표시됩니다.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Link 
              href="/notices"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2251D1]"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2251D1] hover:bg-[#1A41B6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2251D1] disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              등록하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 