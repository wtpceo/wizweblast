'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { createClient } from '@/lib/auth-client';

// 사용자 타입 정의
export type User = {
  id: string;
  email: string;
  name: string;
  role?: string;
  department?: string;
  isApproved: boolean;
  emailVerified?: boolean;
};

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPending: boolean;
  isEmailVerified: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  refreshUser: () => Promise<void>;
  sendVerificationEmail: () => Promise<{ success: boolean; error?: string; message?: string }>;
}

// 컨텍스트 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 인증 컨텍스트 프로바이더 컴포넌트
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Supabase 클라이언트
  const supabase = createClient();
  
  // 인증 상태 계산 값
  const isAuthenticated = !!user;
  const isAdmin = !!user?.role && user.role === 'admin';
  const isPending = !!user && !user.isApproved;
  const isEmailVerified = !!user?.emailVerified;
  
  // 사용자 정보 새로고침
  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const { data } = await fetch('/api/auth/user').then(res => res.json());
      
      if (data && data.user) {
        // Supabase 사용자 정보 가져오기 (이메일 검증 상태 확인용)
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        setUser({
          ...data.user,
          emailVerified: authUser?.email_confirmed_at ? true : false
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('사용자 정보 불러오기 오류:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 이메일 검증 메일 전송
  const sendVerificationEmail = async () => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || '이메일 검증 요청에 실패했습니다.' };
      }
      
      return { 
        success: true, 
        message: data.message || '이메일 검증 링크가 전송되었습니다. 이메일을 확인해 주세요.' 
      };
    } catch (error: any) {
      console.error('이메일 검증 요청 오류:', error);
      return { success: false, error: error.message || '이메일 검증 요청 중 오류가 발생했습니다.' };
    }
  };
  
  // 초기 로드 시 사용자 정보 가져오기
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // 세션이 있는 경우 사용자 정보 조회
          const response = await fetch('/api/auth/user');
          const data = await response.json();
          
          if (data.user) {
            // 이메일 검증 상태 추가
            setUser({
              ...data.user,
              emailVerified: session.user.email_confirmed_at ? true : false
            });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('인증 초기화 오류:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // 세션 변경 시 이벤트 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        refreshUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // 로그인 함수
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || '로그인에 실패했습니다.' };
      }
      
      await refreshUser();
      return { success: true };
    } catch (error: any) {
      console.error('로그인 오류:', error);
      return { success: false, error: error.message || '로그인 중 오류가 발생했습니다.' };
    }
  };
  
  // 로그아웃 함수
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };
  
  // 회원가입 함수
  const signup = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { success: false, error: data.error || '회원가입에 실패했습니다.' };
      }
      
      return { 
        success: true, 
        message: '회원가입이 완료되었습니다. 관리자 승인 후 로그인 가능합니다.' 
      };
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      return { success: false, error: error.message || '회원가입 중 오류가 발생했습니다.' };
    }
  };
  
  // 컨텍스트 값
  const value = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isPending,
    isEmailVerified,
    login,
    logout,
    signup,
    refreshUser,
    sendVerificationEmail
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 인증 컨텍스트 훅
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 