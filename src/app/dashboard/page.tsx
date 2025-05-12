'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import { DashboardStats } from "@/components/DashboardStats";
import { NoticeList } from "@/components/NoticeList";
import { DashboardActions } from "@/components/DashboardActions";
import { EmailVerification } from "@/components/EmailVerification";
import { mockNotices, type DashboardStats as DashboardStatsType } from "@/lib/mock-data";
import { Header } from '@/components/Header';

export default function Dashboard() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [stats, setStats] = useState<DashboardStatsType>({
    totalClients: 0,
    nearExpiry: 0,
    poorManaged: 0,
    complaintsOngoing: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 임의의 재미있는 인사말 목록
  const greetings = [
    "오늘도 위즈하게 시작해볼까요? ✨",
    "새로운 하루, 새로운 성과를 만들어보세요! 🚀",
    "업무가 즐거워지는 마법, WIZ와 함께! 🪄",
    "우리의 협업이 멋진 결과를 만들어요! 🤝",
    "오늘의 업무, 게임처럼 즐겁게! 🎮"
  ];

  // 통계 데이터 가져오기
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error('통계 데이터를 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setStats(data);
      
      // 관리 소홀 광고주 ID 목록을 로컬 스토리지에 저장
      if (data.poorManagedClientIds && Array.isArray(data.poorManagedClientIds)) {
        try {
          localStorage.setItem('wizweblast_poor_managed_clients', JSON.stringify(data.poorManagedClientIds));
          console.log('관리 소홀 광고주 ID 목록을 로컬 스토리지에 저장했습니다:', data.poorManagedClientIds.length + '개');
        } catch (storageErr) {
          console.error('로컬 스토리지 저장 오류:', storageErr);
        }
      }
    } catch (err) {
      console.error('대시보드 통계 로드 오류:', err);
      setError('통계 데이터를 불러오는데 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 페이지 로드 시 데이터 가져오기
  useEffect(() => {
    if (isSignedIn) {
      fetchDashboardStats();
    }
  }, [isSignedIn]);

  // 랜덤 인사말 선택
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  // 로딩 중일 때 표시할 화면
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F9FAFD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#2251D1] border-t-transparent animate-spin mb-4 mx-auto"></div>
          <p className="text-lg text-[#2251D1] font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 사용자를 위한 화면
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#F9FAFD]">
        <Header
          title="WIZ WORKS"
          description="광고주 관리 시스템"
          icon="🚀"
          actions={
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="bg-white text-[#2251D1] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow">
                  <span className="mr-2">🔑</span> 로그인
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-[#2251D1] text-white px-4 py-2 rounded-lg hover:bg-[#1A41B6] transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow">
                  <span className="mr-2">✨</span> 회원가입
                </button>
              </SignUpButton>
            </div>
          }
        />

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              대시보드에 접근하려면 로그인이 필요합니다
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              WIZ WORKS의 모든 기능을 이용하려면 로그인해주세요.
              아직 계정이 없다면 지금 바로 회원가입하세요!
            </p>
            
            <div className="flex justify-center gap-4">
              <SignInButton mode="modal">
                <button className="bg-[#2251D1] text-white px-8 py-3 rounded-lg hover:bg-[#1A41B6] transition-all duration-200 flex items-center text-lg font-medium shadow-sm hover:shadow">
                  <span className="mr-2">🔑</span> 로그인하기
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-white text-[#2251D1] px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center text-lg font-medium shadow-sm hover:shadow border border-[#2251D1]">
                  <span className="mr-2">✨</span> 회원가입하기
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로그인된 사용자를 위한 대시보드
  return (
    <div className="min-h-screen bg-[#F9FAFD]">
      <Header
        title="WIZ WORKS 대시보드"
        description={randomGreeting}
        icon="🌟"
        actions={
          <button 
            className="bg-white text-[#2251D1] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow"
            onClick={fetchDashboardStats}
          >
            <span className="mr-2">🔄</span> 새로고침
          </button>
        }
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* 이메일 검증 알림 */}
        <EmailVerification />
        
        {/* 오류 메시지 표시 */}
        {error && (
          <div className="my-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p>{error}</p>
            <button 
              onClick={fetchDashboardStats}
              className="text-sm underline mt-2"
            >
              다시 시도하기
            </button>
          </div>
        )}
        
        {/* 상단 통계 카드 */}
        {loading ? (
          <div className="h-32 flex items-center justify-center my-6">
            <div className="w-10 h-10 rounded-full border-4 border-[#2251D1] border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <DashboardStats stats={stats} />
        )}
        
        {/* 공지사항 */}
        <NoticeList notices={mockNotices} />
        
        {/* 기능 바로가기 */}
        <DashboardActions />
        
        {/* 하단 팁 섹션 */}
        <div className="mt-8 bg-[#EEF2FB] rounded-lg p-4 flex items-start border-l-4 border-[#2251D1]">
          <span role="img" aria-label="팁" className="text-2xl mr-3 mt-1">💡</span>
          <div>
            <h3 className="font-medium mb-1">오늘의 팁</h3>
            <p className="text-sm text-gray-600">
              종료 임박 고객에게 미리 연락하면 재계약률이 30% 높아진다는 사실, 알고 계셨나요?
              <a href="#" className="text-[#2251D1] ml-2 hover:underline">더 많은 팁 보기 →</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 