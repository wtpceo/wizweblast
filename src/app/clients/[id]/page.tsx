'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { mockClients, Client } from '@/lib/mock-data';
import { ClientInfo } from './ClientInfo';
import { ClientTabs } from './ClientTabs';
import { ClientDeleteDialog } from '@/components/ClientDeleteDialog';
import { ChevronLeft } from 'lucide-react';
import { Header } from '@/components/Header';

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // API에서 광고주 정보 가져오기
  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/clients/${clientId}`);
        
        if (!response.ok) {
          throw new Error('광고주 정보를 가져오는 데 실패했습니다.');
        }
        
        const data = await response.json();
        
        // API 응답을 Client 타입에 맞게 변환
        const clientData: Client = {
          id: data.id,
          name: data.name,
          icon: '🏢', // 기본 아이콘
          contractStart: data.contract_start,
          contractEnd: data.contract_end,
          statusTags: data.status_tags || [],
          usesCoupon: data.uses_coupon || false,
          publishesNews: data.publishes_news || false,
          usesReservation: data.uses_reservation || false,
          phoneNumber: data.phone_number,
          naverPlaceUrl: data.naver_place_url
        };
        
        setClient(clientData);
        setError(null);
      } catch (err) {
        console.error('광고주 데이터 로딩 오류:', err);
        setError('광고주 정보를 불러오는 중 오류가 발생했습니다.');
        
        // 개발 편의를 위해 목업 데이터로 폴백
        const fallbackClient = mockClients.find(c => c.id === clientId);
        if (fallbackClient) {
          setClient(fallbackClient);
          setError(null);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientData();
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

  // 광고주 삭제 핸들러
  const handleDeleteClient = async (clientId: string) => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('광고주 삭제에 실패했습니다.');
      }
      
      // 삭제 성공 시 목록 페이지로 이동
      alert('광고주가 성공적으로 삭제되었습니다.');
      router.push('/clients');
    } catch (err) {
      console.error('광고주 삭제 오류:', err);
      alert('광고주 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
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
      <Header
        title={client.name}
        description="광고주 상세 정보 및 관리 센터"
        icon={client.icon}
        actions={
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center transition-all hover:shadow"
          >
            <span className="mr-1">🗑️</span> 광고주 삭제
          </button>
        }
      />
      
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
      
      {/* 삭제 확인 다이얼로그 */}
      <ClientDeleteDialog
        client={client}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onDelete={handleDeleteClient}
        isDeleting={isDeleting}
      />
    </div>
  );
} 