'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useNoticeContext } from '@/context/NoticeContext';

// 날짜 포맷팅 함수
const formatNoticeDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
};

export default function NoticeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { notices, deleteNotice } = useNoticeContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [noticeDetail, setNoticeDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 현재 데이터를 초기값으로 설정
  const notice = notices.find(notice => notice.id === params.id);
  
  // 상세 공지사항 데이터를 가져오는 함수
  useEffect(() => {
    const fetchNoticeDetail = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/notices/${params.id}`);
        
        if (!response.ok) {
          throw new Error('공지사항을 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setNoticeDetail(data);
        setError(null);
      } catch (err) {
        console.error('공지사항 상세 로딩 오류:', err);
        setError('공지사항을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNoticeDetail();
  }, [params.id]);
  
  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
          <div className="h-24 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-24 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  // 에러가 있을 때
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-700">오류가 발생했습니다</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link 
            href="/notices" 
            className="text-[#2251D1] hover:underline"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }
  
  // 서버에서 데이터를 가져왔지만 존재하지 않는 경우
  if (!noticeDetail) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-xl font-semibold mb-4">공지사항을 찾을 수 없습니다.</h2>
        <Link 
          href="/notices" 
          className="text-[#2251D1] hover:underline"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }
  
  const formattedDate = formatNoticeDate(noticeDetail.createdAt);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Context를 통해 공지사항 삭제
      const result = await deleteNotice(noticeDetail.id);
      
      if (result.success) {
        // 목록 페이지로 이동
        router.push('/notices');
      } else {
        alert(result.error || '삭제 중 오류가 발생했습니다.');
        setIsDeleting(false);
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            href="/notices" 
            className="text-[#2251D1] hover:underline flex items-center mr-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            목록으로
          </Link>
          <h1 className="text-xl font-semibold text-gray-800">공지사항</h1>
        </div>
        
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-500 hover:text-red-700 flex items-center"
          disabled={isDeleting}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          삭제
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center mb-2">
            {noticeDetail.isFixed && (
              <span className="bg-[#EEF2FB] text-[#2251D1] text-xs font-medium mr-2 px-2 py-1 rounded-full flex items-center">
                <span className="mr-1">📌</span> 
                고정
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{noticeDetail.title}</h2>
          <div className="text-sm text-gray-500">{formattedDate}</div>
        </div>
        
        {/* 공지사항 내용 표시 */}
        <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
          {noticeDetail.content}
        </div>
      </div>
      
      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-3">공지사항 삭제</h3>
            <p className="text-gray-700 mb-4">
              정말로 이 공지사항을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none"
                disabled={isDeleting}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 