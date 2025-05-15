'use client';

import React from 'react';
import Link from 'next/link';
import { UserButton, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';

interface HeaderProps {
  title: string;
  description?: string;
  icon?: string;
  actions?: React.ReactNode;
  backButton?: boolean;
  onBack?: () => void;
}

export function Header({ 
  title, 
  description, 
  icon, 
  actions, 
  backButton,
  onBack
}: HeaderProps) {
  const { isSignedIn } = useUser();

  return (
    <div className="relative z-10">
      {/* 그라데이션 백그라운드 */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 z-0"></div>
      
      {/* 백드롭 블러 효과 */}
      <div className="absolute inset-0 backdrop-blur-sm z-0"></div>
      
      {/* 하단 테두리 효과 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 z-0"></div>
      
      {/* 컨텐츠 */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {backButton && (
              <button
                onClick={onBack}
                className="mr-4 p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label="뒤로 가기"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            
            {icon && (
              <div className="mr-4 w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl shadow-inner shadow-black/10 border border-white/10">
                {icon}
              </div>
            )}
            
            <div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {description && <p className="text-slate-300">{description}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {actions}
            
            {isSignedIn ? (
              <div className="bg-[#242436] rounded-lg p-1 shadow-md border border-white/10">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10",
                      userButtonBox: "flex items-center gap-3",
                      userButtonTrigger: "focus:shadow-none"
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="bg-[#242436] text-blue-300 px-4 py-2 rounded-lg border border-blue-700/20 hover:bg-[#2A2A40] transition-all duration-200 flex items-center text-sm font-medium shadow-md hover:shadow-lg backdrop-blur-sm">
                    <span className="mr-2">🔑</span> 로그인
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center text-sm font-medium shadow-lg hover:shadow-blue-700/50 backdrop-blur-sm">
                    <span className="mr-2">✨</span> 회원가입
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 반짝이는 효과 */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-500 -translate-x-full hover:translate-x-full animate-[shimmer_5s_infinite] pointer-events-none z-0"></div>
    </div>
  );
} 