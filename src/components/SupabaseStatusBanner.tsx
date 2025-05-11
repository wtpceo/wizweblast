'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, X } from 'lucide-react';

interface SupabaseStatusBannerProps {
  onSetup?: () => void;
}

export function SupabaseStatusBanner({ onSetup }: SupabaseStatusBannerProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'warning' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Supabase 연결 상태를 확인하는 중...');
  const [details, setDetails] = useState<any>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  
  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        // Supabase 연결 테스트 API 호출
        const response = await fetch('/api/test-supabase');
        const data = await response.json();
        
        if (!data.success) {
          setStatus('error');
          setMessage('Supabase 연결 오류가 발생했습니다');
          setDetails(data);
          return;
        }
        
        // 클라이언트 테이블 확인
        if (data.clients?.error) {
          setStatus('warning');
          setMessage('Supabase 연결은 성공했지만 clients 테이블에 접근할 수 없습니다');
          setDetails(data);
          return;
        }
        
        // 할 일 테이블 확인
        if (data.todos?.error) {
          setStatus('warning');
          setMessage('Supabase 연결은 성공했지만 client_todos 테이블에 접근할 수 없습니다');
          setDetails(data);
          return;
        }
        
        // 모든 테스트 통과
        setStatus('success');
        setMessage('Supabase 연결이 정상입니다');
        setDetails(data);
        
        // 성공 시 5초 후 자동으로 배너 닫기
        setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      } catch (error) {
        console.error('Supabase 상태 확인 중 오류:', error);
        setStatus('error');
        setMessage('Supabase 연결 확인 중 오류가 발생했습니다');
        setDetails(error);
      }
    };
    
    checkSupabaseStatus();
  }, []);
  
  // 환경 설정 실행 함수
  const handleSetup = async () => {
    try {
      setStatus('loading');
      setMessage('Supabase 스키마 설정 중...');
      
      const response = await fetch('/api/setup-supabase');
      const data = await response.json();
      
      if (data.success) {
        setStatus('success');
        setMessage('Supabase 스키마가 성공적으로 설정되었습니다');
        
        // 온보딩 완료 시 콜백 실행
        if (onSetup) {
          onSetup();
        }
        
        // 성공 시 5초 후 자동으로 배너 닫기
        setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      } else {
        setStatus('warning');
        setMessage('Supabase 스키마 설정 중 일부 오류가 발생했습니다');
      }
      
      setDetails(data);
    } catch (error) {
      console.error('Supabase 설정 중 오류:', error);
      setStatus('error');
      setMessage('Supabase 스키마 설정 중 오류가 발생했습니다');
      setDetails(error);
    }
  };
  
  // 배너가 숨겨진 경우 렌더링하지 않음
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg ${
      status === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
      status === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
      status === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
      'bg-blue-50 text-blue-800 border border-blue-200'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
          {status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          {status === 'loading' && (
            <div className="w-5 h-5 border-2 rounded-full border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
          )}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {message}
          </h3>
          
          {(status === 'warning' || status === 'error') && (
            <div className="mt-2 text-sm">
              <p>
                Supabase 설정이 필요합니다. 필요한 테이블을 자동으로 생성하고 초기 데이터를 설정합니다.
              </p>
              <button
                onClick={handleSetup}
                className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? '설정 중...' : 'Supabase 스키마 설정'}
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 