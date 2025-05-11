'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ApiTestPage() {
  // Supabase 테스트에서 확인한 실제 UUID 형식의 ID로 변경
  const [clientId, setClientId] = useState('0b7ccacb-1066-475a-8168-0922123d2da4');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [envStatus, setEnvStatus] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [connectionLoading, setConnectionLoading] = useState(false);

  // 환경 변수 상태 확인
  useEffect(() => {
    const checkEnvVars = async () => {
      try {
        const res = await fetch('/api/env-check');
        const data = await res.json();
        setEnvStatus(data);
      } catch (err) {
        console.error('환경변수 확인 중 오류:', err);
        setEnvStatus({ error: '환경변수 확인 실패' });
      }
    };
    
    checkEnvVars();
  }, []);

  const fetchClient = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || '광고주 정보를 가져오는데 실패했습니다.');
        setResult(null);
      }
    } catch (err) {
      console.error('API 테스트 중 오류:', err);
      setError('API 호출 중 오류가 발생했습니다.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    setConnectionLoading(true);
    
    try {
      const res = await fetch('/api/supabase-test');
      const data = await res.json();
      setConnectionStatus(data);
    } catch (err) {
      console.error('Supabase 연결 테스트 중 오류:', err);
      setConnectionStatus({ 
        success: false, 
        message: '연결 테스트 중 오류 발생',
        error: err instanceof Error ? err.message : '알 수 없는 오류'
      });
    } finally {
      setConnectionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Supabase API 테스트</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">환경 변수 상태</h2>
          {envStatus ? (
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(envStatus, null, 2)}
            </pre>
          ) : (
            <div className="text-gray-500">환경 변수 상태를 확인 중...</div>
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Supabase 연결 테스트</h2>
          <button
            onClick={testSupabaseConnection}
            disabled={connectionLoading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-300 mb-4"
          >
            {connectionLoading ? '테스트 중...' : 'Supabase 연결 테스트'}
          </button>
          
          {connectionStatus && (
            <div className={`p-4 rounded-md ${connectionStatus.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <h3 className="font-medium mb-2">연결 테스트 결과:</h3>
              <pre className="overflow-x-auto">
                {JSON.stringify(connectionStatus, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">광고주 API 테스트</h2>
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="광고주 ID"
              className="border rounded-md px-3 py-2 w-96"
            />
            <button
              onClick={fetchClient}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? '로딩 중...' : '광고주 정보 가져오기'}
            </button>
          </div>
          
          <div className="mb-4 text-sm text-gray-600">
            <p>* Supabase에 저장된 샘플 광고주 ID:</p>
            <ul className="list-disc pl-5 mt-1">
              <li><button className="text-blue-600 hover:underline" onClick={() => setClientId('0b7ccacb-1066-475a-8168-0922123d2da4')}>위즈웍스 카페: 0b7ccacb-1066-475a-8168-0922123d2da4</button></li>
              <li><button className="text-blue-600 hover:underline" onClick={() => setClientId('ab70871f-7364-40d3-9251-32ce31b0687f')}>스마트 치과: ab70871f-7364-40d3-9251-32ce31b0687f</button></li>
              <li><button className="text-blue-600 hover:underline" onClick={() => setClientId('5e3c6b77-740f-4b6b-a98c-34ee0e668579')}>골드 헤어샵: 5e3c6b77-740f-4b6b-a98c-34ee0e668579</button></li>
            </ul>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {result && (
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-medium mb-2">API 응답 결과:</h3>
              <pre className="overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <Link href="/" className="text-blue-600 hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
} 