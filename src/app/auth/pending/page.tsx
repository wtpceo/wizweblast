'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function PendingPage() {
  const { user, isLoading, isAuthenticated, isPending, logout } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // 로그인하지 않은 경우 로그인 페이지로 이동
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
    
    // 이미 승인된 경우 홈으로 이동
    if (!isLoading && isAuthenticated && !isPending) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, isPending, router]);
  
  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">WizWebBlast</h1>
          <h2 className="mt-2 text-xl font-medium text-gray-600">승인 대기 중</h2>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">관리자 승인 대기 중</h3>
            <p className="text-sm text-gray-600 mb-6">
              계정 승인이 완료될 때까지 기다려 주세요. 관리자가 가입 요청을 검토하고 있습니다.
              <br />
              승인이 완료되면 로그인 후 서비스를 이용하실 수 있습니다.
            </p>
            
            <div className="mt-6">
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                로그아웃
              </button>
            </div>
            
            <div className="mt-4">
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 