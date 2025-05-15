import Link from "next/link";

export function DashboardActions() {
  const actionButtons = [
    {
      title: "광고주 관리",
      description: "광고주 목록, 정보 수정, 계약 관리",
      icon: "👥",
      color: "from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700",
      hoverColor: "from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600",
      iconBg: "bg-white/20",
      textColor: "text-blue-100",
      hoverEffect: "transform hover:scale-[1.02]",
      caption: "고객을 만나러 가볼까요?",
      href: "/clients"
    },
    {
      title: "WIZ AI 도구",
      description: "AI 자동화 마케팅, 분석, 리포트 생성",
      icon: "🤖",
      color: "from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700",
      hoverColor: "from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600",
      iconBg: "bg-white/20",
      textColor: "text-purple-100",
      hoverEffect: "transform hover:scale-[1.02]",
      caption: "AI의 마법을 경험하세요",
      href: "/tools"
    },
    {
      title: "WIZ GAME",
      description: "리워드 적립, 성과 대시보드, 팀 랭킹",
      icon: "🎮",
      color: "from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700",
      hoverColor: "from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600",
      iconBg: "bg-white/20",
      textColor: "text-green-100",
      hoverEffect: "transform hover:scale-[1.02]",
      caption: "업무도 게임처럼 즐겁게!",
      href: "/game"
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold flex items-center text-gray-900 dark:text-slate-200">
          <span role="img" aria-label="바로가기" className="mr-2 text-yellow-500 dark:text-yellow-400">✨</span>
          바로가기
        </h2>
        <span className="text-xs text-gray-500 dark:text-slate-500">오늘도 멋진 하루 되세요!</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {actionButtons.map((action, index) => (
          <Link 
            href={action.href} 
            key={index} 
            className={`group relative overflow-hidden rounded-lg border border-slate-800 transition-all duration-500 ${action.hoverEffect} hover:shadow-xl hover:shadow-${action.color.split(' ')[0]}/20`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-90 group-hover:${action.hoverColor} transition-colors duration-300`}></div>
            <div className="absolute inset-0 bg-[url('https://v0.blob.com/pattern-dots.png')] opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-blend-overlay"></div>
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={`rounded-full ${action.iconBg} p-2 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300`}>
                  <span className="text-white text-xl">{action.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{action.title}</h3>
              </div>
              <p className={`text-sm ${action.textColor} mb-6 group-hover:text-white transition-colors duration-300`}>
                {action.description}
              </p>
              <div className="flex justify-between items-center">
                <button className="text-sm bg-white/20 hover:bg-white/40 text-white py-1.5 px-3 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-white/30 relative overflow-hidden group-hover:translate-x-1">
                  <span className="relative z-10">{action.caption}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite] -translate-x-full group-hover:translate-x-full"></span>
                </button>
                <span className="text-white group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 