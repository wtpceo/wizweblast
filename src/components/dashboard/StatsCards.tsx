'use client';

import { useState, useEffect } from 'react';

interface StatCard {
  icon: string;
  iconColor: string;
  bgGradient: string;
  borderColor: string;
  title: string;
  value: number;
  subtitle: string;
  subtitleColor: string;
  link?: string;
}

export const StatsCards = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);
  
  const stats: StatCard[] = [
    {
      icon: '👥',
      iconColor: 'text-blue-400',
      bgGradient: 'from-blue-600/10 via-blue-500/5 to-blue-600/10',
      borderColor: 'border-blue-500/20',
      title: '총 광고주',
      value: 207,
      subtitle: '개의 업체 관리중',
      subtitleColor: 'text-slate-400'
    },
    {
      icon: '⏰',
      iconColor: 'text-amber-400',
      bgGradient: 'from-amber-600/10 via-amber-500/5 to-amber-600/10',
      borderColor: 'border-amber-500/20',
      title: '곧 종료 할 광고주',
      value: 9,
      subtitle: '본부장 한테 방문만 잡아줘',
      subtitleColor: 'text-amber-400',
      link: '#'
    },
    {
      icon: '⚠️',
      iconColor: 'text-red-400',
      bgGradient: 'from-red-600/10 via-red-500/5 to-red-600/10',
      borderColor: 'border-red-500/20',
      title: '관리 소홀',
      value: 0,
      subtitle: '욕먹고 할래? 그냥 할래?',
      subtitleColor: 'text-slate-400'
    },
    {
      icon: '🔔',
      iconColor: 'text-green-400',
      bgGradient: 'from-green-600/10 via-green-500/5 to-green-600/10',
      borderColor: 'border-green-500/20',
      title: '민웢 중',
      value: 0,
      subtitle: '기도 메타 시작..',
      subtitleColor: 'text-red-400'
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`group relative overflow-hidden rounded-lg border ${stat.borderColor} bg-[#151523]/80 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-lg`}
          onMouseEnter={() => setHoveredCard(index)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {/* 배경 그라데이션 */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50 group-hover:opacity-100 transition-all duration-500`}></div>
          
          {/* 테두리 효과 */}
          <div className="absolute inset-0 border border-white/5 rounded-lg"></div>
          
          {/* 숫자 증가 애니메이션 오버레이 */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-5 overflow-hidden pointer-events-none">
            <span className="text-[120px] font-bold text-white/10 group-hover:scale-125 transition-all duration-500">
              {stat.value}
            </span>
          </div>
          
          <div className="p-5 relative z-10">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 shadow-inner shadow-black/10 group-hover:scale-110 transition-all duration-300 backdrop-blur-sm">
                  <span className={`${stat.iconColor} text-lg group-hover:${stat.iconColor.replace('400', '300')} transition-colors duration-300`}>
                    {stat.icon}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors duration-300">
                  {stat.title}
                </span>
              </div>
              
              <CountUp 
                to={stat.value} 
                className="text-3xl font-bold text-white transition-colors duration-300 mb-2"
              />
              
              {stat.link ? (
                <a 
                  href={stat.link}
                  className={`text-xs ${stat.subtitleColor} mt-1 group-hover:${stat.subtitleColor.replace('400', '300')} transition-colors duration-300 hover:underline flex items-center gap-1`}
                >
                  <span>{stat.subtitle}</span>
                  <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              ) : (
                <p className={`text-xs ${stat.subtitleColor} mt-1 group-hover:${stat.subtitleColor.replace('400', '300')} transition-colors duration-300`}>
                  {stat.subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* 반짝이는 그라데이션 효과 */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full bg-[length:200%_100%] animate-[shimmer_3s_infinite] pointer-events-none"></div>
        </div>
      ))}
    </div>
  );
};

// 카운트업 애니메이션 컴포넌트
const CountUp = ({ to, className }: { to: number, className: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (to === 0) {
      setCount(0);
      return;
    }
    
    let start = 0;
    const end = Math.min(to, 1000);
    const duration = 2000;
    const increment = end / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      setCount(Math.min(Math.floor(start), end));
      
      if (start >= end) {
        clearInterval(timer);
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [to]);
  
  return <div className={className}>{count}</div>;
}; 