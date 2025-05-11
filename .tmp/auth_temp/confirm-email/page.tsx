'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/auth-client';

export default function ConfirmEmailPage() {
  const [message, setMessage] = useState('이메일 확인 중...');
  const [error, setError] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  
  const router = useRouter();
  const supabase = createClient();
  
  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // 현재 URL에서 토큰과 타입 매개변수 추출
        const params = new URLSearchParams(window.location.search);
        
        // 이메일 확인 상태 체크
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setError('이메일 확인 중 오류가 발생했습니다.');
          return;
        }
        
        if (session) {
          setMessage('이메일이 성공적으로 확인되었습니다!');
          
          // 카운트다운 시작
          const interval = setInterval(() => {
            setRedirectCountdown((prevCount) => {
              const newCount = prevCount - 1;
              if (newCount <= 0) {
                clearInterval(interval);
                router.push('/'); // 홈으로 리디렉션
              }
              return newCount;
            });
          }, 1000);
          
          return () => clearInterval(interval);
        } else {
          setError('이메일 확인에 실패했습니다. 링크가 만료되었거나 유효하지 않습니다.');
        }
      } catch (err) {
        console.error('이메일 확인 오류:', err);
        setError('처리 중 오류가 발생했습니다.');
      }
    };
    
    confirmEmail();
  }, []);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">WizWebBlast</h1>
          <h2 className="mt-2 text-xl font-medium text-gray-600">이메일 확인</h2>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            {error ? (
              <>
                <div className="mb-4 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">이메일 확인 실패</h3>
                <p className="text-sm text-gray-600 mb-6">{error}</p>
                <Link
                  href="/auth/login"
                  className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  로그인으로 돌아가기
                </Link>
              </>
            ) : (
              <>
                <div className="mb-4 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{message}</h3>
                {message.includes('성공') && (
                  <p className="text-sm text-gray-600 mb-6">
                    {redirectCountdown}초 후 홈페이지로 이동합니다.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 