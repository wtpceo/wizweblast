import { DashboardStats } from "@/components/DashboardStats";
import { NoticeList } from "@/components/NoticeList";
import { DashboardActions } from "@/components/DashboardActions";
import { EmailVerification } from "@/components/EmailVerification";
import { mockDashboardStats, mockNotices } from "@/lib/mock-data";

export default function Dashboard() {
  // 임의의 재미있는 인사말 목록
  const greetings = [
    "오늘도 위즈하게 시작해볼까요? ✨",
    "새로운 하루, 새로운 성과를 만들어보세요! 🚀",
    "업무가 즐거워지는 마법, WIZ와 함께! 🪄",
    "우리의 협업이 멋진 결과를 만들어요! 🤝",
    "오늘의 업무, 게임처럼 즐겁게! 🎮"
  ];

  // 랜덤 인사말 선택
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  return (
    <div className="min-h-screen bg-[#F9FAFD]">
      {/* 상단 재미있는 웰컴 배너 */}
      <div className="bg-gradient-to-r from-[#2251D1] to-[#4169E1] text-white py-3 px-4 text-center text-sm">
        WIZ WORKS에 오신 것을 환영합니다! 새로운 기능들을 확인해보세요 🎉
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center">
              <span className="mr-2">🌟</span> WIZ WORKS 대시보드
            </h1>
            <p className="text-gray-600">{randomGreeting}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="wiz-btn flex items-center">
              <span className="mr-2">🔄</span> 새로고침
            </button>
          </div>
        </div>
        
        {/* 이메일 검증 알림 */}
        <EmailVerification />
        
        {/* 상단 통계 카드 */}
        <DashboardStats stats={mockDashboardStats} />
        
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