'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function SupabaseTestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Supabase 연결 상태를 확인 중입니다...');
  const [serverTime, setServerTime] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // 세션 정보로 연결 테스트
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Supabase 연결 오류:', error);
          setStatus('error');
          setMessage(`연결 실패: ${error.message}`);
          return;
        }

        // 직접 API 엔드포인트 호출을 통한 테스트
        const response = await fetch('/api/supabase-test');
        const result = await response.json();

        if (!result.success) {
          setStatus('error');
          setMessage(`API 테스트 실패: ${result.error || '알 수 없는 오류'}`);
          return;
        }

        setStatus('success');
        setMessage('Supabase에 성공적으로 연결되었습니다!');
        setServerTime(result.serverTime || new Date().toISOString());
      } catch (err) {
        console.error('테스트 중 예외 발생:', err);
        setStatus('error');
        setMessage('연결 중 오류가 발생했습니다.');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Supabase 연결 테스트</h1>
        
        <div className={`p-4 mb-4 rounded-md ${
          status === 'loading' ? 'bg-blue-100 text-blue-700' :
          status === 'success' ? 'bg-green-100 text-green-700' :
          'bg-red-100 text-red-700'
        }`}>
          <p className="font-medium">{message}</p>
          {serverTime && (
            <p className="mt-2 text-sm">서버 시간: {serverTime}</p>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">연결 정보</h2>
          <div className="text-sm bg-gray-100 p-3 rounded">
            <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fqzqmnmyffaibkpnytii.supabase.co'}</p>
            <p className="mt-1">상태: {status === 'success' ? '연결됨' : status === 'loading' ? '연결 중...' : '연결 실패'}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 