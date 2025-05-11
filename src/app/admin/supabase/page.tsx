'use client';

import { useState, useEffect } from 'react';
import { SupabaseStatusBanner } from '@/components/SupabaseStatusBanner';
import Link from 'next/link';

export default function SupabaseAdminPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [setupResults, setSetupResults] = useState<any>(null);
  const [isSetupRunning, setIsSetupRunning] = useState<boolean>(false);

  useEffect(() => {
    const testSupabase = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/test-supabase');
        const data = await response.json();
        setTestResults(data);
      } catch (error) {
        console.error('Supabase 테스트 오류:', error);
        setTestResults({ success: false, error: String(error) });
      } finally {
        setLoading(false);
      }
    };

    testSupabase();
  }, []);

  const handleSetupSupabase = async () => {
    try {
      setIsSetupRunning(true);
      const response = await fetch('/api/setup-supabase');
      const data = await response.json();
      setSetupResults(data);
      
      // 성공 시 테스트 다시 실행
      if (data.success) {
        setTimeout(async () => {
          const testResponse = await fetch('/api/test-supabase');
          const testData = await testResponse.json();
          setTestResults(testData);
        }, 1000);
      }
    } catch (error) {
      console.error('Supabase 설정 오류:', error);
      setSetupResults({ success: false, error: String(error) });
    } finally {
      setIsSetupRunning(false);
    }
  };

  const handleClearLocalStorage = () => {
    if (confirm('로컬 스토리지의 모든 데이터를 삭제하시겠습니까?')) {
      localStorage.clear();
      alert('로컬 스토리지가 초기화되었습니다. 페이지를 새로고침합니다.');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFD]">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                &larr; 홈으로 돌아가기
              </Link>
              <h1 className="text-2xl font-bold mt-2">Supabase 관리</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearLocalStorage}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                로컬스토리지 초기화
              </button>
              <button
                onClick={handleSetupSupabase}
                disabled={isSetupRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isSetupRunning ? '설정 중...' : 'Supabase 스키마 설정'}
              </button>
            </div>
          </div>
          <p className="text-gray-600">
            Supabase 연결 상태 확인 및 스키마 설정을 위한 관리자 페이지입니다.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">연결 상태</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Supabase 연결 테스트 중...</p>
              </div>
            ) : (
              <div>
                <div className={`mb-4 p-3 rounded-md ${testResults?.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  <div className="font-medium">
                    {testResults?.success ? '✅ 연결 성공' : '❌ 연결 실패'}
                  </div>
                  {testResults?.error && (
                    <p className="mt-1 text-sm">{testResults.error}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">환경 변수</h3>
                    <ul className="mt-2 text-sm space-y-1">
                      <li>URL: {testResults?.connection?.url || '설정되지 않음'}</li>
                      <li>API Key 길이: {testResults?.connection?.keyLength || 0}</li>
                      <li>Service Role Key 길이: {testResults?.connection?.serviceRoleKeyLength || 0}</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium">테이블 상태</h3>
                    <ul className="mt-2 text-sm space-y-2">
                      <li>
                        <span className="font-medium">클라이언트 테이블: </span>
                        {testResults?.clients?.error ? 
                          <span className="text-red-600">오류 - {testResults.clients.error.message}</span> : 
                          <span className="text-green-600">정상</span>
                        }
                      </li>
                      <li>
                        <span className="font-medium">할 일 테이블: </span>
                        {testResults?.todos?.error ? 
                          <span className="text-red-600">오류 - {testResults.todos.error.message}</span> : 
                          <span className="text-green-600">정상</span>
                        }
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">설정 결과</h2>
            
            {setupResults ? (
              <div>
                <div className={`mb-4 p-3 rounded-md ${setupResults.success ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                  <div className="font-medium">
                    {setupResults.success ? '✅ 설정 성공' : '⚠️ 일부 설정 실패'}
                  </div>
                  {setupResults.error && (
                    <p className="mt-1 text-sm">{setupResults.error}</p>
                  )}
                </div>

                {setupResults.results?.errors?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">오류 목록</h3>
                    <ul className="text-sm space-y-1 text-red-600">
                      {setupResults.results.errors.map((error: string, i: number) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-2">테이블 목록</h3>
                  <ul className="text-sm space-y-1">
                    {(setupResults.tables || []).map((table: any, i: number) => (
                      <li key={i}>• {table.table_name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>아직 스키마 설정을 실행하지 않았습니다.</p>
                <p className="mt-2 text-sm">상단의 &apos;Supabase 스키마 설정&apos; 버튼을 클릭하여 필요한 테이블과 스키마를 설정하세요.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">문제 해결 가이드</h2>
          
          <div className="prose max-w-none">
            <h3>자주 발생하는 문제</h3>
            
            <div className="mb-6">
              <h4>1. 404 오류 (API 응답 오류)</h4>
              <p>광고주 정보를 찾을 수 없거나 API 응답이 404를 반환하는 경우:</p>
              <ul>
                <li>환경 변수가 올바르게 설정되어 있는지 확인하세요.</li>
                <li>&apos;Supabase 스키마 설정&apos; 버튼을 클릭하여 테이블을 초기화하세요.</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h4>2. &quot;Could not find the &apos;completed_at&apos; column of &apos;client_todos&apos;&quot;</h4>
              <p>할 일 완료 기능 사용 시 이 오류가 발생하는 경우:</p>
              <ul>
                <li>&apos;Supabase 스키마 설정&apos; 버튼을 클릭하여 테이블 스키마를 업데이트하세요.</li>
                <li>또는 <code>/api/update-todos-schema</code> API 엔드포인트를 호출하세요.</li>
              </ul>
            </div>
            
            <div>
              <h4>3. 데이터 불일치</h4>
              <p>로컬 스토리지와 Supabase 데이터 간 불일치가 발생하면:</p>
              <ul>
                <li>&apos;로컬스토리지 초기화&apos; 버튼을 클릭하여 캐시된 데이터를 삭제하세요.</li>
                <li>페이지를 새로고침하면 Supabase에서 최신 데이터를 가져옵니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <SupabaseStatusBanner />
    </div>
  );
} 