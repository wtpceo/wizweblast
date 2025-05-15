'use client';

import { useEffect, useState } from 'react';

export const AnimatedBackground = () => {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* 그라데이션 배경 */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#0F0F19] opacity-90"></div>
      
      {/* 그리드 패턴 오버레이 */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), 
                           linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          transform: `translateY(${scrollY * 0.1}px)`
        }}
      ></div>
      
      {/* 움직이는 그라데이션 블롭 */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-purple-600/10 blur-3xl animate-[float_8s_ease-in-out_infinite]"></div>
      <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-pink-600/10 blur-3xl animate-[floatReverse_12s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-20 left-1/4 w-60 h-60 rounded-full bg-blue-600/10 blur-3xl animate-[float_15s_ease-in-out_infinite]"></div>
      <div className="absolute bottom-40 right-1/3 w-40 h-40 rounded-full bg-orange-600/10 blur-3xl animate-[floatReverse_10s_ease-in-out_infinite]"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-indigo-600/5 blur-3xl animate-[pulse_8s_ease-in-out_infinite]"></div>
      
      {/* 구름 파티클 */}
      <div className="particles absolute inset-0 z-0">
        {Array.from({ length: 15 }).map((_, index) => (
          <div 
            key={index}
            className="absolute rounded-full opacity-10 bg-white"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s linear infinite`
            }}
          ></div>
        ))}
      </div>
      
      {/* 각진 라인 */}
      <div className="absolute bottom-0 left-0 w-full h-[30vh] opacity-10"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(32, 32, 70, 0.2) 100%)',
          clipPath: 'polygon(0 40%, 100% 0%, 100% 100%, 0% 100%)'
        }}
      ></div>
      <div className="absolute top-0 right-0 w-full h-[20vh] opacity-10 transform rotate-180"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(32, 32, 70, 0.2) 100%)',
          clipPath: 'polygon(0 40%, 100% 0%, 100% 100%, 0% 100%)'
        }}
      ></div>
      
      {/* 오로라 효과 */}
      <div 
        className="absolute top-0 left-0 w-full h-[30vh] opacity-5"
        style={{
          background: 'linear-gradient(90deg, #4158D0, #C850C0, #FFCC70)',
          backgroundSize: '300% 300%',
          animation: 'aurora 15s ease infinite'
        }}
      ></div>
    </div>
  );
}; 