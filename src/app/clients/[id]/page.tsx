'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const clientId = params.id as string;
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'todos' | 'notes' | 'analytics'>('info');
  
  // URL 쿼리 파라미터에서 탭 정보 가져오기
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['info', 'todos', 'notes', 'analytics'].includes(tabParam)) {
      setActiveTab(tabParam as 'info' | 'todos' | 'notes' | 'analytics');
    }
  }, [searchParams]);

  // 탭 변경 핸들러
  const handleTabChange = (tab: 'info' | 'todos' | 'notes' | 'analytics') => {
    setActiveTab(tab);
    // URL 업데이트 (history 스택에 추가하지 않고 현재 URL만 변경)
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url);
  };
  
  // API에서 광고주 정보 가져오기
  useEffect(() => {
    const fetchClientData = async () => {
      setLoading(true);
      
      try {
        console.log("광고주 정보 가져오기 시작, ID:", clientId);
        
        // UUID 형식 확인 (Supabase ID는 보통 UUID 형식)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId);
        
        // 로컬 스토리지에서 클라이언트 데이터 확인
        const localClientData = localStorage.getItem(`wizweblast_client_${clientId}`);
        if (localClientData) {
          const parsedClientData = JSON.parse(localClientData);
          console.log("로컬 스토리지에서 불러온 클라이언트 데이터:", parsedClientData);
          setClient(parsedClientData);
          setError(null);
          setLoading(false);
          return;
        }
        
        // 로컬 스토리지에 없으면 API 호출
        console.log(`API 호출: /api/clients/${clientId}`);
        const response = await fetch(`/api/clients/${clientId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("API 응답 오류:", response.status, errorData);
          
          // 상세 에러 정보 로깅
          if (response.status === 404) {
            console.log("광고주 ID를 찾을 수 없습니다:", clientId);
          } else if (response.status === 500) {
            console.log("서버 내부 오류 발생");
          }
          
          throw new Error(errorData.error || '광고주를 찾을 수 없습니다.');
        }
        
        const data = await response.json();
        console.log("API에서 받은 광고주 데이터:", data);
        
        // API 응답 확인
        if (!data || !data.id) {
          console.error("API 응답에 유효한 데이터가 없습니다:", data);
          throw new Error('유효하지 않은 광고주 데이터입니다.');
        }
        
        // API 응답을 Client 타입에 맞게 변환
        const clientData: Client = {
          id: data.id,
          name: data.name,
          icon: data.icon || '🏢', // 기본 아이콘
          contractStart: data.contractStart || data.contract_start || '',
          contractEnd: data.contractEnd || data.contract_end || '',
          statusTags: data.statusTags || data.status_tags || [],
          usesCoupon: data.usesCoupon ?? data.uses_coupon ?? false,
          publishesNews: data.publishesNews ?? data.publishes_news ?? false,
          usesReservation: data.usesReservation ?? data.uses_reservation ?? false,
          phoneNumber: data.phoneNumber || data.phone_number || '',
          naverPlaceUrl: data.naverPlaceUrl || data.naver_place_url || '',
          last_activity_at: data.last_activity_at || data.lastActivityAt || ''
        };
        
        // 로컬 스토리지에 저장
        try {
          localStorage.setItem(`wizweblast_client_${clientId}`, JSON.stringify(clientData));
        } catch (storageErr) {
          console.warn("로컬 스토리지 저장 실패:", storageErr);
        }
        
        setClient(clientData);
        setError(null);
      } catch (err) {
        console.error('광고주 데이터 로딩 오류:', err);
        setError(err instanceof Error ? err.message : '광고주 정보를 불러오는 중 오류가 발생했습니다.');
        
        // API 호출 실패 시 최신 목업 데이터로 폴백
        try {
          console.log("API 호출 실패, 목업 데이터 사용 시도");
          
          // 먼저 localStorage에서 클라이언트 목록 확인
          const clientsFromStorage = localStorage.getItem('wizweblast_clients');
          if (clientsFromStorage) {
            const parsedClients = JSON.parse(clientsFromStorage);
            const clientFromStorage = parsedClients.find((c: any) => c.id === clientId);
            if (clientFromStorage) {
              console.log("로컬 스토리지의 목록에서 클라이언트 찾음:", clientFromStorage);
              setClient(clientFromStorage);
              setError(null);
              return;
            }
          }
          
          // 또는 목업 데이터에서 찾기
          const fallbackClient = mockClients.find(c => c.id === clientId);
          if (fallbackClient) {
            console.log("목업 데이터로 폴백:", fallbackClient);
            setClient(fallbackClient);
            setError(null);
          } else {
            console.log("목업 데이터에서도 클라이언트를 찾을 수 없음");
            // 개발 환경에서는 샘플 데이터 제공
            if (process.env.NODE_ENV === 'development') {
              console.log("개발 환경에서 샘플 데이터 생성");
              const sampleClient: Client = {
                id: clientId,
                name: '샘플 광고주',
                icon: '🏢',
                contractStart: '2024-01-01',
                contractEnd: '2024-12-31',
                statusTags: ['개발용'],
                usesCoupon: false,
                publishesNews: false,
                usesReservation: false,
                phoneNumber: '010-0000-0000',
                naverPlaceUrl: '',
                last_activity_at: ''
              };
              setClient(sampleClient);
              setError(null);
            }
          }
        } catch (fallbackErr) {
          console.error("폴백 처리 중 오류:", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [clientId]);
  
  // 클라이언트 업데이트 이벤트 리스너 추가
  useEffect(() => {
    // 상세 페이지 내부에서 발생한 업데이트 이벤트 감지 (예: Todo 추가)
    const handleClientUpdate = (event: CustomEvent) => {
      const { clientId: updatedClientId, last_activity_at } = event.detail;
      
      // 현재 보고 있는 클라이언트가 업데이트된 경우에만 처리
      if (clientId === updatedClientId && client) {
        console.log("클라이언트 업데이트 이벤트 감지:", updatedClientId, last_activity_at);
        
        // 로컬 스토리지에서 최신 데이터 다시 불러오기
        try {
          const localClientData = localStorage.getItem(`wizweblast_client_${clientId}`);
          if (localClientData) {
            const parsedClientData = JSON.parse(localClientData);
            console.log("업데이트 후 로컬 스토리지에서 재로딩:", parsedClientData);
            setClient(parsedClientData);
          }
        } catch (storageErr) {
          console.error("로컬 스토리지 데이터 로딩 오류:", storageErr);
        }
      }
    };
    
    // 이벤트 리스너 등록
    window.addEventListener('client_updated', handleClientUpdate as EventListener);
    
    // 컴포넌트 언마운트 시 제거
    return () => {
      window.removeEventListener('client_updated', handleClientUpdate as EventListener);
    };
  }, [clientId, client]);
  
  // 계약 날짜 업데이트 핸들러
  const handleContractUpdate = (start?: string, end?: string) => {
    if (!client) return;
    
    // 업데이트된 클라이언트 정보
    const updatedClient = {
      ...client,
      contractStart: start || client.contractStart,
      contractEnd: end || client.contractEnd
    };
    
    // 클라이언트 상태 업데이트
    setClient(updatedClient);
    
    // 로컬 스토리지에 업데이트된 정보 저장
    try {
      // 단일 클라이언트 데이터 저장
      localStorage.setItem(`wizweblast_client_${client.id}`, JSON.stringify(updatedClient));
      
      // 목록에 있는 경우 해당 데이터도 업데이트
      const storedClientsJSON = localStorage.getItem('wizweblast_clients');
      if (storedClientsJSON) {
        const storedClients = JSON.parse(storedClientsJSON);
        if (Array.isArray(storedClients)) {
          const updatedClients = storedClients.map(c => 
            c.id === client.id ? updatedClient : c
          );
          localStorage.setItem('wizweblast_clients', JSON.stringify(updatedClients));
        }
      }
      
      console.log("계약 정보가 로컬 스토리지에 저장되었습니다.");
    } catch (storageErr) {
      console.error("로컬 스토리지 저장 실패:", storageErr);
    }
    
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
          <div className="space-y-3">
            <Link href="/clients" className="wiz-btn inline-block">
              광고주 목록으로 돌아가기
            </Link>
            <div>
              <Link href="/admin/supabase" className="text-blue-600 hover:text-blue-800 text-sm inline-block mt-4">
                Supabase 연결 상태 확인 및 문제 해결
              </Link>
            </div>
          </div>
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
          <div className="flex items-center gap-2">
            <Link 
              href="/my-todos"
              className="bg-[#4CAF50] hover:bg-[#3d8b40] text-white py-2 px-4 rounded-lg flex items-center transition-all hover:shadow"
            >
              <span className="mr-1">✅</span> 나의 할 일 모아보기
            </Link>
            <button
              onClick={() => setIsDeleteDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center transition-all hover:shadow"
            >
              <span className="mr-1">🗑️</span> 광고주 삭제
            </button>
          </div>
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
            <ClientTabs 
              client={client} 
              onClientUpdate={(updatedClient) => {
                setClient(updatedClient);
              }}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
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