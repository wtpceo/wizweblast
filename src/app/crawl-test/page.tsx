'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';

export default function CrawlTestPage() {
  const [url, setUrl] = useState<string>('');
  const [type, setType] = useState<string>('naver-place');
  const [clientId, setClientId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [debug, setDebug] = useState<boolean>(true);

  const exampleUrls = {
    'naver-place': [
      'https://m.place.naver.com/restaurant/33297858/home', 
      'https://m.place.naver.com/restaurant/1130524389/home',
      'https://naver.me/5GpYrOXY'
    ],
    'instagram': [
      'https://www.instagram.com/official_kia/',
      'https://www.instagram.com/netflixkr/'
    ],
    'general': [
      'https://www.naver.com/',
      'https://www.daum.net/'
    ]
  };

  const applyExampleUrl = () => {
    if (exampleUrls[type as keyof typeof exampleUrls]) {
      setUrl(exampleUrls[type as keyof typeof exampleUrls][0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('URL을 입력해주세요.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          type,
          clientId: clientId || undefined,
          options: {
            debug,
            timeout: 60000,
            bypassCache: true
          }
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '크롤링 중 오류가 발생했습니다.');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || '요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Header title="크롤링 테스트" />
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">웹 크롤링 테스트</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              크롤링 유형
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setUrl('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="naver-place">네이버 플레이스</option>
              <option value="instagram">인스타그램</option>
              <option value="general">일반 웹페이지</option>
            </select>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">URL</label>
              <button 
                type="button" 
                onClick={applyExampleUrl}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                예시 적용
              </button>
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={
                type === 'naver-place' 
                  ? 'https://m.place.naver.com/restaurant/33297858/home 또는 https://naver.me/5GpYrOXY' 
                  : type === 'instagram' 
                    ? 'https://www.instagram.com/username/' 
                    : 'https://example.com'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
            <div className="mt-1 text-xs text-gray-500">
              {type === 'naver-place' && (
                <p>네이버 플레이스 URL을 입력하세요. (일반 URL, 모바일 URL, 또는 단축 URL)</p>
              )}
              {type === 'instagram' && (
                <p>인스타그램 프로필 URL을 입력하세요. (예: https://www.instagram.com/사용자명/)</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              클라이언트 ID (선택 사항)
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="결과를 저장할 클라이언트 ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              클라이언트 ID를 입력하면 크롤링 결과가 Supabase에 저장됩니다.
            </p>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
            >
              {showAdvanced ? '고급 옵션 접기 ▲' : '고급 옵션 펼치기 ▼'}
            </button>
          </div>

          {showAdvanced && (
            <div className="border-t pt-4 mt-2">
              <h3 className="text-sm font-medium mb-3">고급 옵션</h3>
              
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="checkbox"
                  id="debug"
                  checked={debug}
                  onChange={(e) => setDebug(e.target.checked)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="debug" className="text-sm text-gray-700">
                  디버그 모드 (스크린샷 포함)
                </label>
              </div>
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? '크롤링 중...' : '크롤링 시작'}
            </button>
          </div>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            <strong>오류:</strong> {error}
          </div>
        )}
      </div>
      
      {result && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">크롤링 결과</h2>
          
          {/* 스크린샷이 있으면 표시 */}
          {result.data?.screenshot && (
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">페이지 스크린샷</h3>
              <img 
                src={result.data.screenshot} 
                alt="페이지 스크린샷" 
                className="border rounded max-w-full" 
              />
            </div>
          )}
          
          {/* 크롤링 결과 표시 */}
          <div>
            <h3 className="text-lg font-medium mb-2">크롤링 데이터</h3>
            <div className="overflow-auto">
              <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
          
          {/* 요약 정보 표시 */}
          {result.data && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-medium mb-3">주요 정보 요약</h3>
              <ul className="space-y-2">
                <li><strong>페이지 타입:</strong> {result.data.type}</li>
                {result.data.name && <li><strong>이름:</strong> {result.data.name}</li>}
                {result.data.category && <li><strong>업종:</strong> {result.data.category}</li>}
                {result.data.hasCoupon && (
                  <li className="text-green-600">
                    <strong>쿠폰:</strong> {result.data.couponTitle || '있음'}
                  </li>
                )}
                {result.data.hasNews && (
                  <li className="text-blue-600">
                    <strong>소식:</strong> {result.data.newsTitle || '있음'}
                  </li>
                )}
                {result.data.hasReservation && (
                  <li className="text-purple-600">
                    <strong>예약:</strong> {result.data.reservationTitle || '있음'}
                  </li>
                )}
                <li>
                  <strong>크롤링 시간:</strong> {new Date(result.data.metadata?.crawledAt).toLocaleString()}
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 