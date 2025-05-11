import Link from "next/link";
import { Plus, Search, FilePlus, ClipboardList, Calendar } from 'lucide-react';

export function DashboardActions() {
  const actionButtons = [
    {
      title: "광고주 관리",
      description: "광고주 목록, 정보 수정, 계약 관리",
      icon: "👥",
      color: "bg-gradient-to-r from-[#2251D1] to-[#4169E1]",
      hoverEffect: "transform hover:translate-y-[-5px]",
      caption: "고객을 만나러 가볼까요?",
      href: "/clients"
    },
    {
      title: "할 일 모아보기",
      description: "내 할 일 목록, 완료 여부 관리, 진행 현황",
      icon: "✅",
      color: "bg-gradient-to-r from-[#4CAF50] to-[#66BB6A]",
      hoverEffect: "transform hover:translate-y-[-5px]",
      caption: "할 일 마스터되기!",
      href: "/my-todos"
    },
    {
      title: "공지사항",
      description: "업무 소식, 시스템 공지, 이벤트 안내",
      icon: "📋",
      color: "bg-gradient-to-r from-[#FF9800] to-[#FFC107]",
      hoverEffect: "transform hover:scale-[1.02]",
      caption: "새로운 공지를 확인하세요",
      href: "/notices"
    },
    {
      title: "WIZ AI 도구",
      description: "AI 자동화 마케팅, 분석, 리포트 생성",
      icon: "🤖",
      color: "bg-gradient-to-r from-[#7B68EE] to-[#9370DB]",
      hoverEffect: "transform hover:scale-[1.03]",
      caption: "AI의 마법을 경험하세요",
      href: "/tools"
    },
    {
      title: "WIZ GAME",
      description: "리워드 적립, 성과 대시보드, 팀 랭킹",
      icon: "🎮",
      color: "bg-gradient-to-r from-[#5D85CC] to-[#8BC34A]",
      hoverEffect: "transform hover:rotate-1",
      caption: "업무도 게임처럼 즐겁게!",
      href: "/game"
    },
    {
      title: "관리자 대시보드",
      description: "팀 통계, 업무 분석, 성과 트래킹",
      icon: "📊",
      color: "bg-gradient-to-r from-[#9C27B0] to-[#CE93D8]",
      hoverEffect: "transform hover:scale-[1.03]",
      caption: "팀 성과를 한눈에!",
      href: "/admin"
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center">
          <span role="img" aria-label="바로가기" className="mr-2">✨</span>
          바로가기
        </h2>
        <span className="text-xs text-[#2251D1]">오늘도 멋진 하루 되세요!</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {actionButtons.map((action, index) => (
          <Link 
            href={action.href} 
            key={index} 
            className={`${action.color} hover-scale ${action.hoverEffect} text-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{action.icon}</span>
                <h3 className="text-lg font-bold">{action.title}</h3>
              </div>
              <p className="text-sm text-white/90 mt-auto">{action.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full text-white/90">
                  {action.caption}
                </span>
                <span className="text-sm font-medium flex items-center">
                  바로가기 <span className="ml-1">→</span>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="font-bold text-lg mb-3">빠른 작업</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 광고주 검색 */}
        <Link 
          href="/clients/search" 
          className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-[#2251D1] transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EEF2FB] flex items-center justify-center mr-3 group-hover:bg-[#2251D1]/10">
            <Search className="w-5 h-5 text-[#2251D1]" />
          </div>
          <div>
            <h3 className="font-medium">광고주 검색</h3>
            <p className="text-xs text-gray-500">이름 또는 전화번호로 검색</p>
          </div>
        </Link>
        
        {/* 광고주 등록 */}
        <Link 
          href="/clients/new"
          className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-[#2251D1] transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EEF2FB] flex items-center justify-center mr-3 group-hover:bg-[#2251D1]/10">
            <Plus className="w-5 h-5 text-[#2251D1]" />
          </div>
          <div>
            <h3 className="font-medium">광고주 등록</h3>
            <p className="text-xs text-gray-500">새 광고주 정보 추가</p>
          </div>
        </Link>
        
        {/* 상담일지 작성 */}
        <Link 
          href="/clients/notes"
          className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-[#2251D1] transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EEF2FB] flex items-center justify-center mr-3 group-hover:bg-[#2251D1]/10">
            <FilePlus className="w-5 h-5 text-[#2251D1]" />
          </div>
          <div>
            <h3 className="font-medium">상담일지 작성</h3>
            <p className="text-xs text-gray-500">광고주 상담 기록</p>
          </div>
        </Link>
        
        {/* 나의 할 일 모아보기 */}
        <Link 
          href="/my-todos"
          className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-[#2251D1] transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EEF2FB] flex items-center justify-center mr-3 group-hover:bg-[#2251D1]/10">
            <ClipboardList className="w-5 h-5 text-[#2251D1]" />
          </div>
          <div>
            <h3 className="font-medium">나의 할 일 모아보기</h3>
            <p className="text-xs text-gray-500">담당 할 일 한눈에 보기</p>
          </div>
        </Link>
        
        {/* 일정 보기 */}
        <Link 
          href="/calendar"
          className="flex items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-[#2251D1] transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#EEF2FB] flex items-center justify-center mr-3 group-hover:bg-[#2251D1]/10">
            <Calendar className="w-5 h-5 text-[#2251D1]" />
          </div>
          <div>
            <h3 className="font-medium">일정 보기</h3>
            <p className="text-xs text-gray-500">주간 미팅 및 일정 관리</p>
          </div>
        </Link>
      </div>
    </div>
  );
} 