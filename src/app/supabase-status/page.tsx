'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface StatusResponse {
  envStatus: {
    supabase: {
      url: string;
      urlValue: string;
      anonKey: string;
      anonKeyLength: number;
      serviceRole: string;
    };
    node_env: string;
    vercel_env: string;
  };
  connectionTest: {
    success: boolean;
    error: string | null;
  };
  serverTime: string;
}

export default function SupabaseStatusPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('수파베이스 연결 상태를 확인 중입니다...');
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [clientStatus, setClientStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [clientMessage, setClientMessage] = useState('클라이언트 연결 상태를 확인 중입니다...');

  useEffect(() => {
    // 서버 API를 통한 상태 확인
    async function checkServerStatus() {
      try {
        const response = await fetch('/api/supabase-status');
        const data = await response.json();
        
        setStatusData(data);
        setStatus(data.connectionTest.success ? 'success' : 'error');
        setMessage(data.connectionTest.success 
          ? '서버 측 수파베이스 연결이 정상입니다.' 
          : `서버 측 연결 오류: ${data.connectionTest.error}`);
      } catch (err) {
        console.error('상태 확인 중 오류 발생:', err);
        setStatus('error');
        setMessage('서버 API 호출 중 오류가 발생했습니다.');
      }
    }

    // 클라이언트 측 연결 테스트
    async function checkClientStatus() {
      try {
        const { data, error } = await supabase.from('clients').select('id').limit(1);
        
        if (error) {
          console.error('클라이언트 연결 오류:', error);
          setClientStatus('error');
          setClientMessage(`클라이언트 연결 오류: ${error.message}`);
        } else {
          setClientStatus('success');
          setClientMessage('클라이언트 측 수파베이스 연결이 정상입니다.');
        }
      } catch (err) {
        console.error('클라이언트 연결 테스트 중 오류 발생:', err);
        setClientStatus('error');
        setClientMessage('클라이언트 연결 테스트 중 예외가 발생했습니다.');
      }
    }

    checkServerStatus();
    checkClientStatus();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">수파베이스 연결 상태</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 서버 측 연결 상태 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">서버 측 연결</h2>
            <div className={`p-3 mb-4 rounded-md ${
              status === 'loading' ? 'bg-blue-100 text-blue-700' :
              status === 'success' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'
            }`}>
              <p className="font-medium">{message}</p>
            </div>
            
            {statusData && (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">환경:</span> {statusData.envStatus.vercel_env}</p>
                <p><span className="font-medium">Supabase URL:</span> {statusData.envStatus.supabase.url}</p>
                <p><span className="font-medium">URL 값:</span> {statusData.envStatus.supabase.urlValue}</p>
                <p><span className="font-medium">Anon Key:</span> {statusData.envStatus.supabase.anonKey}</p>
                <p><span className="font-medium">Key 길이:</span> {statusData.envStatus.supabase.anonKeyLength}</p>
                <p><span className="font-medium">서버 시간:</span> {statusData.serverTime}</p>
              </div>
            )}
          </div>
          
          {/* 클라이언트 측 연결 상태 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3">클라이언트 측 연결</h2>
            <div className={`p-3 mb-4 rounded-md ${
              clientStatus === 'loading' ? 'bg-blue-100 text-blue-700' :
              clientStatus === 'success' ? 'bg-green-100 text-green-700' :
              'bg-red-100 text-red-700'
            }`}>
              <p className="font-medium">{clientMessage}</p>
            </div>
            
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">URL 설정:</span> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '있음' : '없음'}</p>
              <p><span className="font-medium">Anon Key 설정:</span> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '있음' : '없음'}</p>
              <p><span className="font-medium">현재 시간:</span> {new Date().toISOString()}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-2">문제 해결 방법</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>환경 변수가 <code>미설정</code>으로 표시된다면, 배포 환경에 환경 변수를 추가해주세요.</li>
            <li>Vercel에 배포한 경우: Vercel 대시보드 → 프로젝트 → Settings → Environment Variables</li>
            <li>필요한 환경 변수: <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
            <li>서버 측 기능을 위해: <code>SUPABASE_SERVICE_ROLE_KEY</code></li>
            <li>환경 변수 추가 후 프로젝트를 다시 배포해주세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 