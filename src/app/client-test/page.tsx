'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientTestPage() {
  const router = useRouter();
  // 테스트에서 확인한 실제 UUID 형식의 ID 사용
  const [clientId, setClientId] = useState('0b7ccacb-1066-475a-8168-0922123d2da4');

  const handleGoToClient = () => {
    if (clientId) {
      router.push(`/clients/${clientId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">광고주 상세 페이지 테스트</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">광고주 이동 테스트</h2>
          <p className="text-gray-600 mb-4">
            아래 광고주 ID를 선택하거나 직접 입력한 후 이동 버튼을 클릭하면 해당 광고주의 상세 페이지로 이동합니다.
          </p>
          
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="광고주 ID"
              className="border rounded-md px-3 py-2 flex-1"
            />
            <button
              onClick={handleGoToClient}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              상세 페이지로 이동
            </button>
          </div>
          
          <div className="mb-6 text-sm text-gray-600">
            <p className="font-medium mb-2">샘플 광고주 ID:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <li>
                <button 
                  className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-blue-100 rounded-md"
                  onClick={() => setClientId('0b7ccacb-1066-475a-8168-0922123d2da4')}
                >
                  <span className="font-medium">위즈웍스 카페</span><br />
                  <span className="text-xs text-gray-500">0b7ccacb-1066-475a-8168-0922123d2da4</span>
                </button>
              </li>
              <li>
                <button 
                  className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-blue-100 rounded-md"
                  onClick={() => setClientId('ab70871f-7364-40d3-9251-32ce31b0687f')}
                >
                  <span className="font-medium">스마트 치과</span><br />
                  <span className="text-xs text-gray-500">ab70871f-7364-40d3-9251-32ce31b0687f</span>
                </button>
              </li>
              <li>
                <button 
                  className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-blue-100 rounded-md"
                  onClick={() => setClientId('5e3c6b77-740f-4b6b-a98c-34ee0e668579')}
                >
                  <span className="font-medium">골드 헤어샵</span><br />
                  <span className="text-xs text-gray-500">5e3c6b77-740f-4b6b-a98c-34ee0e668579</span>
                </button>
              </li>
              <li>
                <button 
                  className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-blue-100 rounded-md"
                  onClick={() => setClientId('b4de20d3-bca7-40e0-91ff-5c30042df5d9')}
                >
                  <span className="font-medium">청담 정형외과</span><br />
                  <span className="text-xs text-gray-500">b4de20d3-bca7-40e0-91ff-5c30042df5d9</span>
                </button>
              </li>
            </ul>
          </div>
          
          <div className="flex space-x-4">
            <Link 
              href="/api-test" 
              className="text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50"
            >
              API 테스트 페이지
            </Link>
            <Link 
              href="/clients" 
              className="text-green-600 border border-green-600 px-4 py-2 rounded-md hover:bg-green-50"
            >
              광고주 목록 페이지
            </Link>
            <Link 
              href="/" 
              className="text-gray-600 border border-gray-600 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 