'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';

export const DashboardHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user } = useUser();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 임의의 재미있는 인사말 목록
  const greetings = [
    "오늘도 위즈하게 시작해볼까요? 🎮",
    "새로운 하루, 새로운 성과를 만들어보세요! 🚀",
    "업무가 즐거워지는 마법, WIZ와 함께! 🪄",
    "우리의 협업이 멋진 결과를 만들어요! 🤝",
    "오늘의 업무, 게임처럼 즐겁게! 🎮"
  ];

  // 랜덤 인사말 선택
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  return (
    <header className={`sticky top-0 z-10 border-b transition-all duration-300 ${
      isScrolled 
        ? 'border-slate-800/80 bg-[#0F0F19]/95 backdrop-blur-md shadow-md shadow-purple-900/5' 
        : 'border-slate-800/30 bg-[#0F0F19]/80 backdrop-blur-sm'
    }`}>
      <div className="flex h-16 items-center px-6 justify-between relative max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="group">
            <div className="relative h-9 w-9 overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-500 group-hover:from-yellow-300 group-hover:to-yellow-400 transition-colors duration-300"></div>
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">⭐</span>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-500 opacity-0 group-hover:opacity-40 animate-pulse transition-opacity duration-300"></div>
            </div>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-500">WIZ WORKS</span>
              <span className="ml-2 text-slate-400 font-normal">대시보드</span>
            </h1>
            <p className="text-xs text-slate-500">{randomGreeting}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-white transition-colors duration-300 px-3 py-1.5">
              대시보드
            </Link>
            <Link href="/clients" className="text-xs text-slate-500 hover:text-white transition-colors duration-300 px-3 py-1.5">
              광고주
            </Link>
            <Link href="/notices" className="text-xs text-slate-500 hover:text-white transition-colors duration-300 px-3 py-1.5">
              공지사항
            </Link>
            <Link href="/supabase-view" className="text-xs text-slate-500 hover:text-white transition-colors duration-300 px-3 py-1.5">
              DB뷰어
            </Link>
          </div>
        
          <Link 
            href="/my-todos"
            className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full hover:bg-slate-800/70 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 cursor-pointer group"
          >
            <span className="relative">
              <span className="absolute -inset-1 bg-green-500 rounded-full opacity-0 group-hover:opacity-30 group-hover:animate-pulse blur-sm transition-opacity duration-300"></span>
              <span className="text-green-400 relative">✓</span>
            </span>
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors duration-300">
              나의 할 일 모아보기
            </span>
          </Link>
          
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-300 group-hover:animate-pulse"></div>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10 rounded-full relative cursor-pointer hover:scale-110 transform transition-all duration-300"
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}; 