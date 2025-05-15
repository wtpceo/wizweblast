'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export function EmailVerification() {
  const { user } = useUser();
  const [isSending, setIsSending] = useState(false);

  const handleSendVerification = async () => {
    if (!user) return;
    
    try {
      setIsSending(true);
      await user.emailAddresses[0].prepareVerification({ strategy: 'email_code' });
      // Clerk는 자동으로 이메일을 전송합니다
    } catch (error) {
      console.error('이메일 인증 전송 실패:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return null;
  }

  const isEmailVerified = user.emailAddresses[0]?.verification?.status === 'verified';

  return (
    <div className="mb-6 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#151523] p-5 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900/5 dark:to-slate-900/20 opacity-50"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-slate-200 flex items-center">
            <span className="mr-2 text-blue-500 dark:text-blue-400">✉️</span>
            이메일 인증
          </h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            현재 상태: 
            {isEmailVerified ? (
              <span className="ml-1 text-green-600 dark:text-green-400 font-medium">인증됨</span>
            ) : (
              <span className="ml-1 text-orange-500 dark:text-orange-400 font-medium">인증 필요</span>
            )}
          </p>
        </div>
        
        {!isEmailVerified ? (
          <button
            onClick={handleSendVerification}
            disabled={isSending}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-blue-500/20 transform hover:translate-y-[-2px]"
          >
            {isSending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                전송 중...
              </span>
            ) : (
              '인증 이메일 전송'
            )}
          </button>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
            모든 기능 사용 가능
          </span>
        )}
      </div>
    </div>
  );
} 