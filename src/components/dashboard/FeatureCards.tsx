'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FeatureCard {
  id: number;
  title: string;
  description: string;
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  buttonText: string;
  patternUrl: string;
  link: string;
}

export const FeatureCards = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 700);
    return () => clearTimeout(timer);
  }, []);
  
  const features: FeatureCard[] = [
    {
      id: 1,
      title: '광고주 관리',
      description: '광고주 목록, 정보 수정, 계약 관리',
      icon: '👥',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-indigo-500',
      textColor: 'text-blue-100',
      buttonText: '고객을 만나러 가볼까요?',
      patternUrl: 'https://v0.blob.com/30QP7-pattern1.png',
      link: '/clients'
    },
    {
      id: 2,
      title: 'WIZ AI 도구',
      description: 'AI 지능화 마케팅, 분석, 리포트 생성',
      icon: '🤖',
      gradientFrom: 'from-purple-500',
      gradientTo: 'to-pink-500',
      textColor: 'text-purple-100',
      buttonText: 'AI와 마법을 경험하세요',
      patternUrl: 'https://v0.blob.com/30QP7-pattern2.png',
      link: '/ai-tools'
    },
    {
      id: 3,
      title: 'WIZ GAME',
      description: '리워드 적립, 성과 대시보드, 팀 랭킹',
      icon: '🎮',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-500',
      textColor: 'text-emerald-100',
      buttonText: '업무도 게임처럼 즐겁게',
      patternUrl: 'https://v0.blob.com/30QP7-pattern3.png',
      link: '/wiz-game'
    }
  ];

  return (
    <div className={`mb-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute -inset-1 bg-yellow-500 rounded-full opacity-0 group-hover:opacity-30 animate-pulse blur"></div>
            <span className="text-yellow-400 relative">✨</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-200">바로가기</h2>
        </div>
        <span className="text-xs text-slate-400">오늘도 멋진 하루 되세요!</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature) => (
          <div 
            key={feature.id}
            className="group relative overflow-hidden rounded-lg border border-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
            onMouseEnter={() => setHoveredCard(feature.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* 배경 그라데이션 - 더 밝게 조정 */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradientFrom} ${feature.gradientTo} opacity-80`}></div>
            
            {/* 패턴 오버레이 */}
            <div 
              className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-500 bg-blend-overlay"
              style={{ backgroundImage: `url('${feature.patternUrl}')` }}
            ></div>
            
            {/* 호버 그라데이션 */}
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-all duration-500`} style={{
              background: `linear-gradient(135deg, ${feature.gradientFrom.replace('from-', '')}, ${feature.gradientTo.replace('to-', '')})`
            }}></div>
            
            {/* 콘텐츠 */}
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-white/20 p-3 text-lg group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-black/10">
                  <span className="text-white">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide">{feature.title}</h3>
              </div>
              
              <p className={`text-sm ${feature.textColor} mb-6 group-hover:text-white transition-colors duration-300 font-medium`}>
                {feature.description}
              </p>
              
              <div className="flex justify-between items-center">
                <Link 
                  href={feature.link}
                  className="text-sm bg-white/20 hover:bg-white/40 text-white py-2 px-4 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/30 relative overflow-hidden group-hover:translate-x-1 font-medium"
                >
                  <span className="relative z-10">{feature.buttonText}</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite] -translate-x-full group-hover:translate-x-full"></span>
                </Link>
                <span className="text-white text-xl group-hover:translate-x-1 transition-transform duration-300">→</span>
              </div>
              
              {/* 움직이는 효과 */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-[float_4s_ease-in-out_infinite]"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 