'use client';

import Link from 'next/link';
import { UserButton, SignInButton, SignUpButton, useUser } from '@clerk/nextjs';

interface HeaderProps {
  title: string;
  description?: string;
  icon?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, icon, actions }: HeaderProps) {
  const { isSignedIn } = useUser();

  return (
    <div className="bg-gradient-to-r from-[#2251D1] to-[#4169E1] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold flex items-center">
            {icon && <span className="text-3xl mr-3">{icon}</span>}
            {title}
          </h1>
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
                  <button className="bg-white text-[#2251D1] px-4 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center text-sm font-medium shadow-sm hover:shadow">
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
        {description && (
          <p className="text-white text-opacity-90">{description}</p>
        )}
      </div>
    </div>
  );
} 