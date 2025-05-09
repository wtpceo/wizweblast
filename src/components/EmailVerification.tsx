'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function EmailVerification() {
  const { user, isEmailVerified, sendVerificationEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // 이미 이메일이 검증되었거나 사용자가 없으면 렌더링하지 않음
  if (!user || isEmailVerified) {
    return null;
  }
  
  const handleSendVerificationEmail = async () => {
    setIsLoading(true);
    setMessage('');
    setError('');
    
    try {
      const { success, message, error } = await sendVerificationEmail();
      
      if (success) {
        setMessage(message || '이메일 검증 링크가 전송되었습니다. 이메일을 확인해 주세요.');
      } else {
        setError(error || '이메일 검증 요청에 실패했습니다.');
      }
    } catch (err) {
      setError('처리 중 오류가 발생했습니다.');
      console.error('이메일 검증 요청 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            이메일 검증 필요
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              계정 보안을 위해 이메일 주소 검증이 필요합니다. 아래 버튼을 클릭하여 검증 이메일을 받으세요.
            </p>
            {message && (
              <p className="mt-2 text-green-600 font-medium">
                {message}
              </p>
            )}
            {error && (
              <p className="mt-2 text-red-600">
                {error}
              </p>
            )}
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={handleSendVerificationEmail}
              disabled={isLoading || !!message}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {isLoading ? '이메일 전송 중...' : '검증 이메일 보내기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 