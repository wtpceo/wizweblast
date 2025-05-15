'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
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
      <div className="min-h-screen bg-[#F9FAFD] dark:bg-[#0F0F19] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#2251D1] dark:border-blue-500 border-t-transparent animate-spin mb-4 mx-auto"></div>
          <p className="text-lg text-[#2251D1] dark:text-blue-400 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 사용자를 위한 랜딩 페이지
  return (
    <div className="min-h-screen bg-[#F9FAFD] dark:bg-[#0F0F19] text-gray-900 dark:text-white">
      {/* 배경 효과 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white to-blue-50 dark:from-[#0F0F19] dark:to-[#141428] opacity-90"></div>
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-blue-500/5 dark:bg-blue-600/10 blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-purple-500/5 dark:bg-purple-600/10 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-60 h-60 rounded-full bg-blue-500/5 dark:bg-blue-600/10 blur-3xl"></div>
        <div className="absolute bottom-40 right-1/3 w-40 h-40 rounded-full bg-amber-500/5 dark:bg-orange-600/10 blur-3xl"></div>
      </div>
      
      <Header
        title="WIZ WORKS"
        description="광고주 관리 시스템"
        icon="🚀"
      />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 relative">
            <h2 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              광고주 관리를 더 스마트하게
            </h2>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-blue-600/0 via-blue-600 to-blue-600/0 rounded-full"></div>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-slate-300 mb-12 leading-relaxed">
            WIZ WORKS와 함께 광고주 관리를 효율적으로 해보세요.
            <span className="block mt-2">실시간 모니터링, 자동 알림, 데이터 분석까지 한 번에!</span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-slate-800/60 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 dark:border dark:border-slate-700/50 group">
              <div className="text-4xl mb-6 rounded-full bg-blue-100 dark:bg-blue-900/30 w-16 h-16 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">📊</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">실시간 모니터링</h3>
              <p className="text-gray-600 dark:text-slate-300">광고주 현황을 한눈에 파악하고 중요한 변화를 놓치지 마세요</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800/60 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 dark:border dark:border-slate-700/50 group">
              <div className="text-4xl mb-6 rounded-full bg-purple-100 dark:bg-purple-900/30 w-16 h-16 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">🔔</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">자동 알림</h3>
              <p className="text-gray-600 dark:text-slate-300">중요 일정과 업무를 자동으로 알려주어 항상 한 발 앞서 준비하세요</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800/60 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 dark:border dark:border-slate-700/50 group">
              <div className="text-4xl mb-6 rounded-full bg-green-100 dark:bg-green-900/30 w-16 h-16 flex items-center justify-center mx-auto text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300">📈</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">데이터 분석</h3>
              <p className="text-gray-600 dark:text-slate-300">스마트한 데이터 분석으로 효율적인 의사결정을 도와드립니다</p>
            </div>
          </div>

          <div className="mt-12">
            <div className="inline-block relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300 group-hover:animate-pulse"></div>
              <Link 
                href="/dashboard" 
                className="relative px-8 py-4 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 inline-flex items-center"
              >
                시작하기
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="flex justify-center gap-6 mt-16 text-sm">
            <Link href="/clients" className="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">광고주 목록</Link>
            <span className="text-gray-400 dark:text-slate-600">|</span>
            <Link href="/supabase-view" className="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Supabase 데이터 뷰어</Link>
            <span className="text-gray-400 dark:text-slate-600">|</span>
            <Link href="/about" className="text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">서비스 소개</Link>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
