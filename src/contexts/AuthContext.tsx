'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPending: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
}

// AuthContext 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  
  // Clerk 사용자 인증 상태 동기화
  useEffect(() => {
    setIsLoading(!isLoaded);
  }, [isLoaded]);
  
  // 로그인 함수 (Clerk 인증 사용 - 실제로는 사용하지 않음)
  const login = async (email: string, password: string) => {
    // 실제 구현은 필요하지 않음 (Clerk 사용)
    return { success: true };
  };
  
  // 회원가입 함수 (Clerk 인증 사용 - 실제로는 사용하지 않음)
  const signup = async (email: string, password: string, name: string) => {
    // 실제 구현은 필요하지 않음 (Clerk 사용)
    return { success: true, message: '회원가입 완료' };
  };
  
  // 로그아웃 함수 (Clerk 인증 사용 - 실제로는 사용하지 않음)
  const logout = async () => {
    // 실제 구현은 필요하지 않음 (Clerk 사용)
  };
  
  // 컨텍스트 값 제공
  const contextValue: AuthContextType = {
    user: clerkUser,
    isLoading,
    isAuthenticated: isSignedIn || false,
    isPending: false, // 임시 값
    login,
    signup,
    logout
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
