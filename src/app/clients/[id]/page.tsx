'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { mockClients, Client } from '@/lib/mock-data';
import { ClientInfo } from './ClientInfo';
import { ClientTabs } from './ClientTabs';
import { ChevronLeft } from 'lucide-react';

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 목업 데이터에서 광고주 정보 가져오기
  useEffect(() => {
    // 백엔드 API 연동 시 fetch 사용
    // 현재는 목업 데이터 사용
    setLoading(true);
    
    try {
      const foundClient = mockClients.find(c => c.id === clientId);
      
      if (foundClient) {
        setClient(foundClient);
        setError(null);
      } else {
        setError('해당 광고주를 찾을 수 없습니다.');
      }
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);
  
  // 계약 날짜 업데이트 핸들러
  const handleContractUpdate = (start?: string, end?: string) => {
    if (!client) return;
    
    // 실제로는 API 호출
    // 현재는 클라이언트에서 상태 업데이트
    setClient({
      ...client,
      contractStart: start || client.contractStart,
      contractEnd: end || client.contractEnd
    });
    
    alert('계약 정보가 업데이트 되었습니다! 👍');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFD] flex items-center justify-center">
        <div className="animate-pulse text-[#2251D1] flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#2251D1] border-t-transparent animate-spin mb-4"></div>
          <p className="text-lg font-medium">광고주 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  if (error || !client) {
    return (
      <div className="min-h-screen bg-[#F9FAFD] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-4">{error || '광고주 정보를 찾을 수 없습니다'}</h2>
          <p className="text-gray-600 mb-6">
            요청하신 광고주 정보를 찾을 수 없습니다. 광고주 목록으로 돌아가 다시 시도해주세요.
          </p>
          <Link href="/clients" className="wiz-btn inline-block">
            광고주 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#F9FAFD] pb-10">
      {/* 상단 헤더 */}
      <div className="bg-gradient-to-r from-[#2251D1] to-[#4169E1] text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center mb-2">
            <Link 
              href="/clients" 
              className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm mr-3">
                  <span role="img" aria-label={client.name}>{client.icon}</span>
                </div>
                <h1 className="text-2xl font-bold">{client.name}</h1>
              </div>
              <p className="text-white text-opacity-90 text-sm mt-1">
                광고주 상세 정보 및 관리 센터
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* 광고주 정보 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 광고주 정보 */}
          <div className="lg:col-span-1">
            <ClientInfo client={client} onContractUpdate={handleContractUpdate} />
          </div>
          
          {/* 우측: 탭 콘텐츠 */}
          <div className="lg:col-span-2">
            <ClientTabs client={client} />
          </div>
        </div>
      </div>
    </div>
  );
} 