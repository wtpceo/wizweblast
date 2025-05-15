'use client';

import { useState, useEffect } from 'react';

export const TipSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 900);
    
    // 5초마다 팁 변경
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(tipTimer);
    };
  }, []);
  
  const tips = [
    "중요 일정 고객에게 미리 연락하셔서 재계약률이 30% 높아집니다. 지금 고객 계산해볼까요?",
    "AI 리포트 자동 생성 기능으로 주간 보고서를 5분 만에 완성하세요.",
    "오늘의 할 일 3개 이상 완료하면 WIZ 포인트 100P를 추가로 받을 수 있어요!",
    "광고주 프로필 작성시 세부 정보를 상세히 기록하면 AI 추천이 더 정확해집니다."
  ];

  return (
    <div 
      className={`rounded-lg border border-amber-500/20 bg-[#151523]/80 backdrop-blur-sm overflow-hidden relative group hover:border-amber-500/40 transition-all duration-500 hover:shadow-lg hover:shadow-amber-500/20 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 via-orange-600/10 to-amber-600/10 group-hover:from-amber-600/15 group-hover:via-orange-600/15 group-hover:to-amber-600/15 transition-colors duration-500"></div>
      <div 
        className="absolute inset-0 bg-[url('https://v0.blob.com/30QP7-dots.png')] opacity-5 group-hover:opacity-10 transition-opacity duration-500 bg-repeat"
        style={{
          transform: `translateY(${isHovered ? -5 : 0}px)`,
          transition: 'transform 1s ease-in-out'
        }}
      ></div>

      <div className="p-5 flex items-center gap-5 relative">
        <div className="flex-shrink-0 relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-70 blur group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>
          <div className="relative rounded-full bg-gradient-to-br from-amber-500 to-orange-500 p-3 shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300 group-hover:scale-110">
            <span className="text-white text-xl">💡</span>
            
            {/* 반짝이는 효과 */}
            {isHovered && (
              <>
                <span className="absolute inset-0 rounded-full animate-ripple bg-white/30 opacity-0"></span>
                <span className="absolute inset-0 rounded-full animate-ripple bg-white/30 opacity-0" style={{ animationDelay: '0.5s' }}></span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <h3 className="font-bold text-lg bg-gradient-to-r from-amber-300 to-orange-300 inline-block text-transparent bg-clip-text mb-2 group-hover:from-amber-200 group-hover:to-orange-200 transition-colors duration-300">
            오늘의 팁
          </h3>
          <div className="h-[40px] relative overflow-hidden">
            {tips.map((tip, index) => (
              <p 
                key={index}
                className="text-sm text-slate-200 group-hover:text-white transition-all duration-500 absolute w-full font-medium"
                style={{
                  opacity: tipIndex === index ? 1 : 0,
                  transform: `translateY(${tipIndex === index ? 0 : 20}px)`,
                  transition: 'transform 0.5s ease, opacity 0.5s ease'
                }}
              >
                {tip}
              </p>
            ))}
          </div>
        </div>

        <button className="whitespace-nowrap border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 py-2 px-4 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 relative overflow-hidden group font-medium">
          <span className="relative z-10 flex items-center gap-1">
            <span>더 많은 팁 보기</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/30 to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite] -translate-x-full group-hover:translate-x-full"></span>
        </button>
      </div>
      
      {/* 부드러운 물결 효과 */}
      <div
        className="absolute bottom-0 left-0 w-full h-1 opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.7), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s infinite'
        }}
      ></div>
    </div>
  );
}; 