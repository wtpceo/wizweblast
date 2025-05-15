'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNoticeContext } from '@/context/NoticeContext';

export default function CreateNoticePage() {
  const router = useRouter();
  const { addNotice } = useNoticeContext();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isFixed, setIsFixed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }
    
    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    console.log('공지사항 등록 시작:', { title, content, isFixed });
    
    try {
      // Context를 통해 공지사항 등록
      const result = await addNotice(title, content, isFixed);
      
      console.log('공지사항 등록 결과:', result);
      
      if (result.success) {
        // 목록 페이지로 이동
        router.push('/notices');
      } else {
        console.error('공지사항 등록 실패:', result.error);
        setError(result.error || '공지사항 등록에 실패했습니다.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('공지사항 등록 중 오류 발생:', err);
      setError('공지사항 등록 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0F0F1A] py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-8 flex items-center">
          <Link 
            href="/notices" 
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center mr-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            목록으로
          </Link>
          <h1 className="text-xl font-semibold text-white">새 공지사항 등록</h1>
        </div>
        
        <div className="bg-[#151523] rounded-lg shadow-xl p-6 border border-white/10">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 text-red-400 rounded-md border border-red-500/30">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-1">
                제목 <span className="text-red-400">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a2e] border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="공지사항 제목을 입력하세요"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-1">
                내용 <span className="text-red-400">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 bg-[#1a1a2e] border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="공지사항 내용을 입력하세요"
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
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 bg-slate-800 border-slate-600 rounded"
                />
                <label htmlFor="isFixed" className="ml-2 block text-sm text-slate-300">
                  상단 고정 공지
                </label>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                중요한 공지사항은 상단에 고정하여 표시됩니다.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Link 
                href="/notices"
                className="px-4 py-2 border border-slate-700 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isSubmitting ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 