'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import { Header } from '@/components/Header';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // 로그인된 사용자는 대시보드로 리다이렉트
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  // 로딩 중일 때 표시할 화면
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F9FAFD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#2251D1] border-t-transparent animate-spin mb-4 mx-auto"></div>
          <p className="text-lg text-[#2251D1] font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 사용자를 위한 랜딩 페이지
  return (
    <div className="min-h-screen bg-[#F9FAFD]">
      <Header
        title="WIZ WORKS"
        description="광고주 관리 시스템"
        icon="🚀"
        actions={
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
        }
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            광고주 관리를 더 스마트하게
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            WIZ WORKS와 함께 광고주 관리를 효율적으로 해보세요.
            실시간 모니터링, 자동 알림, 데이터 분석까지 한 번에!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">실시간 모니터링</h3>
              <p className="text-gray-600">광고주 현황을 한눈에 파악하세요</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold mb-2">자동 알림</h3>
              <p className="text-gray-600">중요 일정을 놓치지 마세요</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-lg font-semibold mb-2">데이터 분석</h3>
              <p className="text-gray-600">스마트한 의사결정을 도와드립니다</p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <SignInButton mode="modal">
              <button className="bg-[#2251D1] text-white px-8 py-3 rounded-lg hover:bg-[#1A41B6] transition-all duration-200 flex items-center text-lg font-medium shadow-sm hover:shadow">
                <span className="mr-2">🔑</span> 지금 시작하기
              </button>
            </SignInButton>
          </div>
          
          <div className="flex justify-center gap-4 mt-12 text-sm">
            <Link href="/clients" className="text-gray-600 hover:text-[#2251D1]">광고주 목록</Link>
            <span className="text-gray-400">|</span>
            <Link href="/supabase-view" className="text-gray-600 hover:text-[#2251D1]">Supabase 데이터 뷰어</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
