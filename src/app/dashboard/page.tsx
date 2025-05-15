"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { AnimatedBackground } from "@/components/dashboard/AnimatedBackground"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { Announcements } from "@/components/dashboard/Announcements"
import { FeatureCards } from "@/components/dashboard/FeatureCards"
import { TipSection } from "@/components/dashboard/TipSection"

export default function Dashboard() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const [progress, setProgress] = useState(13)
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  // 인증 확인 및 리다이렉트
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/')
    }
  }, [isSignedIn, isLoaded, router])

  useEffect(() => {
    // 프로그레스 업데이트
    const timer = setTimeout(() => setProgress(66), 500)
    
    // 페이지 로드 애니메이션
    const loadTimer = setTimeout(() => setIsPageLoaded(true), 100)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(loadTimer)
    }
  }, [])

  // 로딩 중일 때 표시할 화면
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0F0F19] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4 mx-auto"></div>
          <p className="text-lg text-blue-400 font-medium">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 로그인된 사용자를 위한 대시보드
  return (
    <div className="flex min-h-screen flex-col bg-[#0F0F19] text-slate-200 relative overflow-hidden">
      {/* 페이지 로드 애니메이션 */}
      <div className={`fixed inset-0 z-50 bg-[#0F0F19] flex items-center justify-center transition-opacity duration-1000 ${isPageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">WIZ</span>
          </div>
        </div>
      </div>
      
      {/* 애니메이션 배경 */}
      <AnimatedBackground />
      
      {/* 헤더 */}
      <DashboardHeader />

      {/* 메인 컨텐츠 */}
      <main className={`flex-1 p-6 pt-4 relative z-1 transform transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        {/* 이메일 인증 상태 */}
        <div className="mb-6 rounded-lg border border-slate-800 bg-[#151523] p-4 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/10">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/20 group-hover:from-slate-900/70 group-hover:to-purple-900/10 transition-all duration-500"></div>
          <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 group-hover:scale-110 transition-all duration-700"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="relative">
                  <span className="absolute -inset-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-0 group-hover:opacity-70 group-hover:animate-pulse blur transition-all duration-700"></span>
                  <span className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-inner shadow-white/10">
                    ✓
                  </span>
                </span>
                <h2 className="text-lg font-semibold text-slate-200 group-hover:text-white transition-colors duration-300">이메일 인증</h2>
              </div>
              <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300 ml-10">
                현재 상태: <span className="text-green-400 font-medium group-hover:text-green-300 transition-colors duration-300">인증됨</span>
              </p>
            </div>
            
            <div className="relative">
              <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="absolute right-0 -bottom-6 text-xs text-slate-500 group-hover:text-slate-400 transition-colors duration-300">{progress}% 완료</span>
            </div>
          </div>
        </div>

        {/* 통계 카드 */}
        <StatsCards />

        {/* 공지사항 섹션 */}
        <Announcements />

        {/* 기능 카드 */}
        <FeatureCards />

        {/* 팁 섹션 */}
        <TipSection />
      </main>

      {/* 글로벌 애니메이션 스타일 */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        @keyframes floatReverse {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(147, 51, 234, 0); }
          100% { box-shadow: 0 0 0 0 rgba(147, 51, 234, 0); }
        }

        @keyframes borderGlow {
          0% { border-color: rgba(124, 58, 237, 0.5); box-shadow: 0 0 5px rgba(124, 58, 237, 0.5); }
          50% { border-color: rgba(236, 72, 153, 0.8); box-shadow: 0 0 15px rgba(236, 72, 153, 0.8); }
          100% { border-color: rgba(124, 58, 237, 0.5); box-shadow: 0 0 5px rgba(124, 58, 237, 0.5); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes aurora {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }

        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
} 