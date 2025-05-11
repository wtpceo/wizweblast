'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ClearCachePage() {
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const clearLocalStorage = () => {
    try {
      // 모든 로컬 스토리지 데이터 삭제
      localStorage.clear();
      setMessage('모든 로컬 스토리지 데이터가 삭제되었습니다.');
      setError('');
    } catch (err) {
      setError('로컬 스토리지 삭제 중 오류가 발생했습니다.');
      console.error('로컬 스토리지 삭제 오류:', err);
    }
  };
  
  const clearClientCache = () => {
    try {
      // 광고주 관련 캐시 데이터만 삭제
      const keys = Object.keys(localStorage);
      let count = 0;
      
      keys.forEach(key => {
        if (key.startsWith('wizweblast_client_') || key === 'wizweblast_clients') {
          localStorage.removeItem(key);
          count++;
        }
      });
      
      setMessage(`${count}개의 광고주 관련 캐시 데이터가 삭제되었습니다.`);
      setError('');
    } catch (err) {
      setError('광고주 캐시 데이터 삭제 중 오류가 발생했습니다.');
      console.error('캐시 삭제 오류:', err);
    }
  };
  
  const clearTodoCache = () => {
    try {
      // 할 일 관련 캐시 데이터만 삭제
      const keys = Object.keys(localStorage);
      let count = 0;
      
      keys.forEach(key => {
        if (key.startsWith('wizweblast_todos') || key.includes('todos_client_')) {
          localStorage.removeItem(key);
          count++;
        }
      });
      
      setMessage(`${count}개의 할 일 관련 캐시 데이터가 삭제되었습니다.`);
      setError('');
    } catch (err) {
      setError('할 일 캐시 데이터 삭제 중 오류가 발생했습니다.');
      console.error('캐시 삭제 오류:', err);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F9FAFD] p-8">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">캐시 데이터 관리</h1>
        
        <div className="space-y-4">
          <button
            onClick={clearClientCache}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            광고주 캐시 데이터만 삭제
          </button>
          
          <button
            onClick={clearTodoCache}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
          >
            할 일 캐시 데이터만 삭제
          </button>
          
          <button
            onClick={clearLocalStorage}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
          >
            모든 로컬 스토리지 데이터 삭제
          </button>
          
          {message && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link 
              href="/clients"
              className="text-blue-600 hover:underline"
            >
              광고주 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 