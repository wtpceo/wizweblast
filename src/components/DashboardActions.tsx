import Link from "next/link";

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
    </div>
  );
} 