'use client';

import { useState, useEffect } from 'react';
import { ClientCard } from './ClientCard';
import { ClientMemoDialog } from '@/components/ClientMemoDialog';
import { ClientTodoDialog } from '@/components/ClientTodoDialog';
import { mockClients, Client } from '@/lib/mock-data';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [memoDialogOpen, setMemoDialogOpen] = useState(false);
  const [todoDialogOpen, setTodoDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [animateIn, setAnimateIn] = useState(false);
  
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
    
    return matchesSearch && matchesStatus;
  });
  
  // 상태별 카운트
  const statusCounts = {
    total: clients.length,
    nearExpiry: clients.filter(c => c.statusTags.includes('종료 임박')).length,
    poorManaged: clients.filter(c => c.statusTags.includes('관리 소홀')).length,
    complaints: clients.filter(c => c.statusTags.includes('민원 중')).length
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
  
  return (
    <div className="min-h-screen bg-[#F9FAFD] pb-10">
      {/* 상단 헤더 */}
      <div className="bg-gradient-to-r from-[#2251D1] to-[#4169E1] text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-1 flex items-center">
            <span className="text-3xl mr-3">👥</span> 광고주 관리
          </h1>
          <p className="text-white text-opacity-90">광고주 정보를 확인하고 할 일이나 메모를 관리하세요.</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* 요약 통계 */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-[#2251D1]">
            <div className="text-sm text-gray-600">총 광고주</div>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-[#FFC107]">
            <div className="text-sm text-gray-600">종료 임박</div>
            <div className="text-2xl font-bold">{statusCounts.nearExpiry}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-[#FF9800]">
            <div className="text-sm text-gray-600">관리 소홀</div>
            <div className="text-2xl font-bold">{statusCounts.poorManaged}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-[#F44336]">
            <div className="text-sm text-gray-600">민원 진행</div>
            <div className="text-2xl font-bold">{statusCounts.complaints}</div>
          </div>
        </div>
        
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
              <div className="flex gap-2">
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
    </div>
  );
} 