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
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {backButton && (
              <button
                onClick={onBack}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
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
              <div className="mr-4 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-2xl">
                {icon}
              </div>
            )}
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && <p className="text-gray-500">{description}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {actions}
            
            {isSignedIn ? (
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
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="bg-white text-[#2251D1] px-4 py-2 rounded-lg border border-[#2251D1] hover:bg-[#f8f9ff] transition-all duration-200 flex items-center text-sm font-medium">
                    <span className="mr-2">🔑</span> 로그인
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-[#2251D1] text-white px-4 py-2 rounded-lg hover:bg-[#1A41B6] transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow">
                    <span className="mr-2">✨</span> 회원가입
                  </button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 