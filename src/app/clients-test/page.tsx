'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ClientsTestPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('확인 중...');

  // Supabase 연결 테스트
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/supabase-test-simple');
        const data = await response.json();
        
        if (response.ok) {
          setConnectionStatus(`연결 성공 (${data.timestamp})`);
          console.log('Supabase 연결 정보:', data);
        } else {
          setConnectionStatus(`연결 오류: ${data.message || '알 수 없는 오류'}`);
        }
      } catch (err) {
        setConnectionStatus('연결 테스트 중 오류 발생');
        console.error('연결 테스트 오류:', err);
      }
    };
    
    checkConnection();
  }, []);

  // 광고주 데이터 로딩
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        
        const response = await fetch('/api/clients');
        console.log('API 응답 상태:', response.status);
        
        // 응답 타입 확인
        const contentType = response.headers.get('content-type');
        console.log('응답 콘텐츠 타입:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('응답 데이터:', data);
          
          // 배열인지 확인
          if (Array.isArray(data)) {
            setClients(data);
          } else if (data.fallbackData && Array.isArray(data.fallbackData)) {
            // 오류 응답에 폴백 데이터가 있는 경우
            setClients(data.fallbackData);
            setError(`${data.error || '서버 오류'} (폴백 데이터 사용 중)`);
          } else {
            // 오류 메시지 있는 경우
            setError(data.error || data.message || '응답이 유효한 형식이 아닙니다.');
            setClients([]);
          }
        } else {
          // JSON이 아닌 경우
          setError('서버 응답이 JSON 형식이 아닙니다.');
          setClients([]);
        }
      } catch (err) {
        console.error('광고주 데이터 로딩 오류:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">광고주 목록 테스트 페이지</h1>
      
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Supabase 연결 상태</h2>
        <p>{connectionStatus}</p>
      </div>
      
      {isLoading ? (
        <div className="p-4 bg-gray-100 rounded animate-pulse">데이터 로딩 중...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-600 font-semibold mb-2">오류 발생</h2>
          <p>{error}</p>
        </div>
      ) : (
        <div>
          <h2 className="font-semibold mb-2">총 {clients.length}개의 광고주</h2>
          
          {clients.length === 0 ? (
            <p className="p-4 bg-yellow-50 rounded">
              광고주 데이터가 없습니다. 새 광고주를 추가해보세요.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.map((client) => (
                <div key={client.id} className="border p-4 rounded shadow-sm">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{client.icon} {client.name}</h3>
                    <div className="text-xs py-1 px-2 bg-blue-100 rounded">
                      ID: {client.id.substring(0, 8)}...
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>계약: {client.contractStart} ~ {client.contractEnd}</p>
                    <div className="flex flex-wrap mt-2 gap-1">
                      {client.statusTags?.map((tag: string) => (
                        <span key={tag} className="bg-gray-200 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6">
        <Link href="/clients" className="bg-blue-500 text-white px-4 py-2 rounded">
          실제 광고주 페이지로 이동
        </Link>
      </div>
    </div>
  );
} 