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
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-2">이메일 인증</h2>
      <p className="mb-4">
        현재 상태: {isEmailVerified ? '인증됨' : '인증 필요'}
      </p>
      {!isEmailVerified && (
        <button
          onClick={handleSendVerification}
          disabled={isSending}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isSending ? '전송 중...' : '인증 이메일 전송'}
        </button>
      )}
    </div>
  );
} 