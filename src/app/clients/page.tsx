'use client';

import { useState, useEffect } from 'react';
import { ClientCard } from './ClientCard';
import { ClientMemoDialog } from '@/components/ClientMemoDialog';
import { ClientTodoDialog } from '@/components/ClientTodoDialog';
import { ClientRegisterDialog } from '@/components/ClientRegisterDialog';
import { mockClients, Client } from '@/lib/mock-data';
import Link from 'next/link';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [memoDialogOpen, setMemoDialogOpen] = useState(false);
  const [todoDialogOpen, setTodoDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [animateIn, setAnimateIn] = useState(false);
  
  // 새로운 필터 상태 추가
  const [filterNoCoupon, setFilterNoCoupon] = useState<boolean>(false);
  const [filterNoNews, setFilterNoNews] = useState<boolean>(false);
  const [filterNoReservation, setFilterNoReservation] = useState<boolean>(false);
  
  // 페이지 로딩 시 애니메이션 효과
  useEffect(() => {
    setAnimateIn(true);
  }, []);
  
  // 재미있는 팁 메시지
  const tips = [
    "종료 임박 고객에게 미리 연락하면 재계약률이 30% 높아져요! 🚀",
    "정기적인 고객 체크인으로 관리 소홀을 예방하세요! ⏰",
    "대시보드에서 민원 진행 상황을 실시간으로 확인하세요! 📊",
    "WIZ AI로 고객 데이터를 분석하면 성공률이 높아져요! 🤖",
    "할 일을 관리하면 업무 효율이 두 배로 올라갑니다! ✅"
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  // 필터링된 광고주 목록
  const filteredClients = clients.filter(client => {
    // 검색어 필터링
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 상태 필터링
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = client.statusTags.includes(statusFilter);
    }
    
    // 추가 필터링 (쿠폰/소식/예약)
    let matchesCouponFilter = true;
    let matchesNewsFilter = true;
    let matchesReservationFilter = true;
    
    if (filterNoCoupon) {
      matchesCouponFilter = !client.usesCoupon;
    }
    
    if (filterNoNews) {
      matchesNewsFilter = !client.publishesNews;
    }
    
    if (filterNoReservation) {
      matchesReservationFilter = !client.usesReservation;
    }
    
    return matchesSearch && matchesStatus && matchesCouponFilter && matchesNewsFilter && matchesReservationFilter;
  });
  
  // 상태별 카운트
  const statusCounts = {
    total: clients.length,
    nearExpiry: clients.filter(c => c.statusTags.includes('종료 임박')).length,
    poorManaged: clients.filter(c => c.statusTags.includes('관리 소홀')).length,
    complaints: clients.filter(c => c.statusTags.includes('민원 중')).length,
    noCoupon: clients.filter(c => !c.usesCoupon).length,
    noNews: clients.filter(c => !c.publishesNews).length,
    noReservation: clients.filter(c => !c.usesReservation).length
  };
  
  // 필터 토글 함수
  const toggleFilter = (filter: 'coupon' | 'news' | 'reservation') => {
    if (filter === 'coupon') {
      setFilterNoCoupon(!filterNoCoupon);
    } else if (filter === 'news') {
      setFilterNoNews(!filterNoNews);
    } else if (filter === 'reservation') {
      setFilterNoReservation(!filterNoReservation);
    }
  };
  
  // 메모 추가 처리
  const handleAddNote = (clientId: string, note: string) => {
    console.log(`메모 추가: ${clientId}, ${note}`);
    // 실제로는 API 호출하여 백엔드에 저장
    // 여기서는 목업 데이터만 사용하므로 콘솔에 출력
    alert(`'${note}' 메모가 저장되었습니다. 굿잡! 🙌`);
  };
  
  // 할 일 추가 처리
  const handleAddTodo = (clientId: string, content: string, assignedTo: string) => {
    console.log(`할 일 추가: ${clientId}, ${content}, 담당: ${assignedTo}`);
    // 실제로는 API 호출하여 백엔드에 저장
    // 여기서는 목업 데이터만 사용하므로 콘솔에 출력
    alert(`'${content}' 할 일이 성공적으로 등록되었습니다! 👍`);
  };
  
  // 메모 다이얼로그 열기
  const openMemoDialog = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setMemoDialogOpen(true);
    }
  };
  
  // 할 일 다이얼로그 열기
  const openTodoDialog = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setTodoDialogOpen(true);
    }
  };
  
  // 광고주 등록 처리
  const handleRegisterClient = (newClient: Omit<Client, 'id'>) => {
    // 실제로는 API 호출하여 백엔드에 저장하고 ID를 받아옴
    // 여기서는 클라이언트에서 임시 ID 생성
    const tempId = `temp_${Date.now()}`;
    const clientWithId: Client = {
      ...newClient,
      id: tempId
    };
    
    setClients([clientWithId, ...clients]);
    setRegisterDialogOpen(false);
    
    alert(`'${newClient.name}' 광고주가 성공적으로 등록되었습니다! 👍`);
  };
  
  return (
    <div className="min-h-screen bg-[#F9FAFD] pb-10">
      {/* 상단 헤더 */}
      <div className="bg-gradient-to-r from-[#2251D1] to-[#4169E1] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold flex items-center">
              <span className="text-3xl mr-3">👥</span> 광고주 관리
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRegisterDialogOpen(true)}
                className="bg-white text-[#2251D1] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow"
              >
                <span className="mr-2">➕</span> 신규 광고주 등록
              </button>
              <Link href="/dashboard" className="bg-white text-[#2251D1] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow">
                <span className="mr-2">📊</span> 대시보드로 돌아가기
              </Link>
            </div>
          </div>
          <p className="text-white text-opacity-90">광고주 정보를 확인하고 할 일이나 메모를 관리하세요.</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* 팁 메시지 */}
        <div className={`bg-[#EEF2FB] rounded-lg p-4 mb-6 flex items-start transition-all duration-500 delay-100 ${animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'}`}>
          <span className="text-2xl mr-3 mt-1">💡</span>
          <div>
            <h3 className="font-medium mb-1">오늘의 팁</h3>
            <p className="text-sm text-gray-700">{randomTip}</p>
          </div>
        </div>
      
        {/* 검색 및 필터 */}
        <div className={`bg-white rounded-lg shadow-sm p-4 mb-6 transition-all duration-500 delay-200 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* 검색 */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="광고주 이름, 상태 검색..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2251D1] focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                🔍
              </span>
            </div>
            
            {/* 필터 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">상태:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${statusFilter === 'all' ? 'bg-[#2251D1] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setStatusFilter('all')}
                >
                  전체 보기
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center ${statusFilter === '종료 임박' ? 'bg-[#FFF8E1] text-[#FFC107] border border-[#FFC107]' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setStatusFilter('종료 임박')}
                >
                  <span className="mr-1">⏰</span> 종료 임박
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center ${statusFilter === '관리 소홀' ? 'bg-[#FFF3E0] text-[#FF9800] border border-[#FF9800]' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setStatusFilter('관리 소홀')}
                >
                  <span className="mr-1">⚠️</span> 관리 소홀
                </button>
                <button
                  className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center ${statusFilter === '민원 중' ? 'bg-[#FFEBEE] text-[#F44336] border border-[#F44336]' : 'bg-gray-100 hover:bg-gray-200'}`}
                  onClick={() => setStatusFilter('민원 중')}
                >
                  <span className="mr-1">🔔</span> 민원 중
                </button>
              </div>
            </div>
          </div>
          
          {/* 추가 필터 (쿠폰/소식/예약) */}
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="text-sm text-gray-600 self-center">추가 필터:</span>
            <button
              className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center ${filterNoCoupon ? 'bg-[#E3F2FD] text-[#2196F3] border border-[#2196F3]' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => toggleFilter('coupon')}
            >
              <span className="mr-1">🎟️</span> 쿠폰 미사용 ({statusCounts.noCoupon})
            </button>
            <button
              className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center ${filterNoNews ? 'bg-[#E8F5E9] text-[#4CAF50] border border-[#4CAF50]' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => toggleFilter('news')}
            >
              <span className="mr-1">📰</span> 소식 미발행 ({statusCounts.noNews})
            </button>
            <button
              className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center ${filterNoReservation ? 'bg-[#F3E5F5] text-[#9C27B0] border border-[#9C27B0]' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => toggleFilter('reservation')}
            >
              <span className="mr-1">📅</span> 예약 미사용 ({statusCounts.noReservation})
            </button>
            {(filterNoCoupon || filterNoNews || filterNoReservation) && (
              <button
                className="px-3 py-2 rounded-lg text-sm transition-all flex items-center bg-gray-200 hover:bg-gray-300 text-gray-700"
                onClick={() => {
                  setFilterNoCoupon(false);
                  setFilterNoNews(false);
                  setFilterNoReservation(false);
                }}
              >
                <span className="mr-1">❌</span> 필터 초기화
              </button>
            )}
          </div>
          
          {/* 활성화된 필터 표시 */}
          {(filterNoCoupon || filterNoNews || filterNoReservation) && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-gray-500">적용된 필터:</span>
              {filterNoCoupon && (
                <span className="text-xs bg-[#E3F2FD] text-[#2196F3] px-2 py-1 rounded-full">
                  쿠폰 미사용
                </span>
              )}
              {filterNoNews && (
                <span className="text-xs bg-[#E8F5E9] text-[#4CAF50] px-2 py-1 rounded-full">
                  소식 미발행
                </span>
              )}
              {filterNoReservation && (
                <span className="text-xs bg-[#F3E5F5] text-[#9C27B0] px-2 py-1 rounded-full">
                  예약 미사용
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* 광고주 카드 그리드 */}
        {filteredClients.length > 0 ? (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 delay-300 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            {filteredClients.map((client, index) => (
              <div 
                key={client.id} 
                className={`transition-all duration-500`} 
                style={{ transitionDelay: `${300 + index * 100}ms` }}
              >
                <ClientCard
                  client={client} 
                  onAddTodo={openTodoDialog} 
                  onAddNote={openMemoDialog}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={`bg-white rounded-lg shadow-sm p-10 text-center transition-all duration-500 delay-300 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">결과를 찾을 수 없습니다</h3>
            <p className="text-gray-600 mb-5">검색어나 필터를 변경해 보세요.</p>
            <button 
              className="wiz-btn"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setFilterNoCoupon(false);
                setFilterNoNews(false);
                setFilterNoReservation(false);
              }}
            >
              모든 광고주 보기
            </button>
          </div>
        )}
      </div>
      
      {/* 메모 다이얼로그 */}
      <ClientMemoDialog
        client={selectedClient}
        isOpen={memoDialogOpen}
        onClose={() => setMemoDialogOpen(false)}
        onSave={handleAddNote}
      />
      
      {/* 할 일 다이얼로그 */}
      <ClientTodoDialog
        client={selectedClient}
        isOpen={todoDialogOpen}
        onClose={() => setTodoDialogOpen(false)}
        onSave={handleAddTodo}
      />
      
      {/* 광고주 등록 다이얼로그 */}
      <ClientRegisterDialog
        isOpen={registerDialogOpen}
        onClose={() => setRegisterDialogOpen(false)}
        onSave={handleRegisterClient}
      />
    </div>
  );
} 