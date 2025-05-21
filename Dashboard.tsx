"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function Dashboard() {
  const [progress, setProgress] = useState(13)
  const [totalClients, setTotalClients] = useState<number | null>(null)
  const [soonExpireClients, setSoonExpireClients] = useState<number | null>(null)
  const [neglectedClients, setNeglectedClients] = useState<number | null>(0)
  const [complainingClients, setComplainingClients] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true)
      setError(null)
      
      try {
        // 대시보드 통계를 한 번에 가져오기 위한 API 호출
        const response = await fetch('/api/dashboard/stats')
        
        if (!response.ok) {
          throw new Error(`API 오류: ${response.status}`)
        }
        
        const data = await response.json()
        console.log("대시보드 데이터:", data)
        
        // 데이터 설정
        setTotalClients(data.totalClients)
        setSoonExpireClients(data.nearExpiry)
        setNeglectedClients(data.poorManaged)
        setComplainingClients(data.complaintsOngoing)
      } catch (error) {
        console.error("대시보드 데이터 로딩 중 오류 발생:", error)
        setError("데이터를 불러오는데 실패했습니다")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
    
    // 디버깅을 위해 window 객체에 상태 노출 (숨겨진 기능)
    if (typeof window !== 'undefined') {
      (window as any).dashboardDebug = {
        getState: () => ({
          totalClients,
          soonExpireClients,
          neglectedClients,
          complainingClients,
          isLoading,
          error
        }),
        forceRefresh: fetchDashboardData
      }
    }
    
    // 60초마다 데이터 갱신
    const refreshInterval = setInterval(fetchDashboardData, 60000)
    return () => clearInterval(refreshInterval)
  }, [])

  // 로딩 상태와 값 표시를 위한 헬퍼 함수
  function displayValue(value: number | null) {
    if (isLoading) return "···"
    if (error) return "오류"
    return value !== null ? value : "···"
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0F0F1A] text-slate-200 dark">
      {/* Animated Background - 더 미묘하고 전문적인 배경 */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0F0F19] to-[#141428] opacity-90"></div>
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-blue-600/10 blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-purple-600/10 blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-60 h-60 rounded-full bg-blue-600/10 blur-3xl"></div>
        <div className="absolute bottom-40 right-1/3 w-40 h-40 rounded-full bg-orange-600/10 blur-3xl"></div>
      </div>

      {/* Header - 더 세련된 디자인 */}
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#0F0F19]/80 backdrop-blur-md shadow-sm">
        <div className="flex h-16 items-center px-6 justify-between relative max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-500 transition-colors duration-300">
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">⭐</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                WIZ WORKS <span className="text-slate-400 font-normal">대시보드</span>
              </h1>
              <p className="text-xs text-slate-500">오늘도 위즈하게 시작해볼까요? 🎮</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg hover:bg-slate-800/70 transition-colors duration-300 hover:shadow-md hover:shadow-blue-500/10 focus:ring-2 focus:ring-blue-500/40 focus:outline-none">
              <span className="text-blue-400">✓</span>
              <span className="text-sm text-slate-300 hover:text-white transition-colors duration-300">
                나의 할 일 모아보기
              </span>
            </button>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full opacity-70 blur group-hover:opacity-100 transition duration-300 group-hover:animate-pulse"></div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 relative flex items-center justify-center text-white font-medium cursor-pointer hover:from-blue-500 hover:to-indigo-500 transition-colors duration-300 group-hover:scale-110 transform">
                MS
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 더 나은 간격과 구성 */}
      <main className="flex-1 p-6 pt-4 relative z-1 max-w-7xl mx-auto w-full">
        {/* Email Verification Status - 더 깔끔한 알림 카드 */}
        <div className="mb-6 rounded-lg border border-slate-800 bg-[#151523] p-4 shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 to-slate-900/20 opacity-50"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-200 flex items-center">
                <span className="mr-2 text-blue-400">✉️</span>
                이메일 인증
              </h2>
              <p className="text-sm text-slate-400">모든 기능을 사용할 수 있습니다</p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
              인증됨
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-900/20 p-4 shadow-md">
            <p className="text-red-400 flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </p>
          </div>
        )}

        {/* Stats Cards - 더 깔끔하고 일관된 스타일 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* 총 광고주 */}
          <div className="group relative overflow-hidden rounded-lg border border-slate-800 bg-[#151523] transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-500/50">
            <div className="absolute inset-0 bg-gradient-to-br opacity-20"></div>
            <div className="absolute bottom-0 right-0 h-32 w-32 translate-x-8 translate-y-8 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 blur-xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
            <div className="p-4 relative flex items-center">
              <div className="flex-shrink-0 rounded-full bg-blue-900/30 p-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-blue-400 text-lg">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                  총 광고주
                </p>
                <div className="flex items-baseline">
                  <p className={`text-2xl font-bold text-slate-200 group-hover:text-blue-400 transition-colors duration-300 ${isLoading ? 'animate-pulse' : ''}`}>
                    {displayValue(totalClients)}
                  </p>
                  <p className="text-xs text-blue-400 ml-2 group-hover:translate-x-1 transition-transform duration-300">
                    개의 업체 관리중
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 곧 종료할 광고주 */}
          <div className="group relative overflow-hidden rounded-lg border border-slate-800 bg-[#151523] transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/20 hover:border-amber-500/50">
            <div className="absolute inset-0 bg-gradient-to-br opacity-20"></div>
            <div className="absolute bottom-0 right-0 h-32 w-32 translate-x-8 translate-y-8 rounded-full bg-gradient-to-br from-amber-600/20 to-yellow-600/20 blur-xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
            <div className="p-4 relative flex items-center">
              <div className="flex-shrink-0 rounded-full bg-amber-900/30 p-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-amber-400 text-lg">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                  곧 종료 할 광고주
                </p>
                <div className="flex items-baseline">
                  <p className={`text-2xl font-bold text-slate-200 group-hover:text-amber-400 transition-colors duration-300 ${isLoading ? 'animate-pulse' : ''}`}>
                    {displayValue(soonExpireClients)}
                  </p>
                  <p className="text-xs text-amber-400 ml-2 cursor-pointer group-hover:translate-x-1 transition-transform duration-300">
                    본부장 한테 방문만 잡아줘
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 관리 소홀 */}
          <div className="group relative overflow-hidden rounded-lg border border-slate-800 bg-[#151523] transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/20 hover:border-orange-500/50">
            <div className="absolute inset-0 bg-gradient-to-br opacity-20"></div>
            <div className="absolute bottom-0 right-0 h-32 w-32 translate-x-8 translate-y-8 rounded-full bg-gradient-to-br from-orange-600/20 to-red-600/20 blur-xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
            <div className="p-4 relative flex items-center">
              <div className="flex-shrink-0 rounded-full bg-orange-900/30 p-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-orange-400 text-lg">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                  관리 소홀
                </p>
                <div className="flex items-baseline">
                  <p className={`text-2xl font-bold text-slate-200 group-hover:text-orange-400 transition-colors duration-300 ${isLoading ? 'animate-pulse' : ''}`}>
                    {displayValue(neglectedClients)}
                  </p>
                  <p className="text-xs text-slate-500 ml-2 group-hover:translate-x-1 transition-transform duration-300">
                    욕먹고 할래? 그냥 할래?
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 민원 중 */}
          <div className="group relative overflow-hidden rounded-lg border border-slate-800 bg-[#151523] transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/20 hover:border-green-500/50">
            <div className="absolute inset-0 bg-gradient-to-br opacity-20"></div>
            <div className="absolute bottom-0 right-0 h-32 w-32 translate-x-8 translate-y-8 rounded-full bg-gradient-to-br from-green-600/20 to-emerald-600/20 blur-xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
            <div className="p-4 relative flex items-center">
              <div className="flex-shrink-0 rounded-full bg-green-900/30 p-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-green-400 text-lg">🔔</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
                  민원 중
                </p>
                <div className="flex items-baseline">
                  <p className={`text-2xl font-bold text-slate-200 group-hover:text-green-400 transition-colors duration-300 ${isLoading ? 'animate-pulse' : ''}`}>
                    {displayValue(complainingClients)}
                  </p>
                  <p className="text-xs text-red-400 ml-2 group-hover:translate-x-1 transition-transform duration-300">
                    기도 메타 시작..
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Section - 더 깔끔한 테이블 구조 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-red-500">📢</span>
              <h2 className="text-lg font-semibold text-slate-200">공지사항</h2>
            </div>
            <a href="#" className="text-xs text-blue-600 hover:underline transform hover:translate-x-1 transition-all duration-300">
              새로운 업데이트를 확인하세요!
            </a>
          </div>

          <div className="rounded-lg border border-slate-800 bg-[#151523] overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
            <div className="divide-y divide-slate-800">
              <div className="flex items-center justify-between p-4 hover:bg-slate-900/5 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-100 text-pink-500 text-xs group-hover:bg-pink-200 group-hover:text-pink-600 transition-colors duration-300 group-hover:animate-pulse">
                    중요
                  </span>
                  <span className="font-medium text-slate-200 group-hover:text-slate-300 transition-colors duration-300 group-hover:translate-x-1 transform">
                    시스템 업데이트 안내
                  </span>
                </div>
                <div className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors duration-300">
                  2025.05.11
                </div>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-slate-900/5 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-100 text-pink-500 text-xs group-hover:bg-pink-200 group-hover:text-pink-600 transition-colors duration-300 group-hover:animate-pulse">
                    중요
                  </span>
                  <span className="font-medium text-slate-200 group-hover:text-slate-300 transition-colors duration-300 group-hover:translate-x-1 transform">
                    🎉 신규 기능 출시 안내
                  </span>
                </div>
                <div className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors duration-300">
                  2025.05.09
                </div>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-slate-900/5 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-100 text-pink-500 text-xs group-hover:bg-pink-200 group-hover:text-pink-600 transition-colors duration-300 group-hover:animate-pulse">
                    중요
                  </span>
                  <span className="font-medium text-slate-200 group-hover:text-slate-300 transition-colors duration-300 group-hover:translate-x-1 transform">
                    캠페인 일정 안내
                  </span>
                </div>
                <div className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors duration-300">
                  2025.05.08
                </div>
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-slate-900/5 transition-all duration-300 group">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-200 group-hover:text-slate-300 transition-colors duration-300 group-hover:translate-x-1 transform">
                    휴일 고객센터 운영 안내
                  </span>
                </div>
                <div className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors duration-300">
                  2025.05.11
                </div>
              </div>
            </div>
            <div className="flex justify-center p-4 border-t border-slate-800">
              <button className="w-full py-2 px-4 rounded-lg border border-slate-700 text-slate-700 hover:bg-slate-800 hover:text-slate-200 transition-all duration-300 focus:ring-2 focus:ring-blue-500/40 focus:outline-none relative overflow-hidden group">
                <span className="relative z-10">전체보기 →</span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/30 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite] -translate-x-full group-hover:translate-x-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Cards - 더 접근성 높은 카드 디자인 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">✨</span>
              <h2 className="text-lg font-semibold text-slate-200">바로가기</h2>
            </div>
            <span className="text-xs text-slate-500">오늘도 멋진 하루 되세요!</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group relative overflow-hidden rounded-lg border border-slate-800 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-600/20">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 opacity-90 group-hover:from-blue-500 group-hover:to-indigo-500 transition-colors duration-300"></div>
              <div className="absolute inset-0 bg-[url('https://v0.blob.com/pattern-dots.png')] opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-blend-overlay"></div>
              <div className="p-6 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-slate-800/20 p-2 group-hover:bg-slate-800/30 group-hover:scale-110 transition-all duration-300">
                    <span className="text-slate-200 text-xl">👥</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200">광고주 관리</h3>
                </div>
                <p className="text-sm text-blue-100 mb-6 group-hover:text-slate-200 transition-colors duration-300">
                  광고주 목록, 정보 수정, 계약 관리
                </p>
                <div className="flex justify-between items-center">
                  <Link href="/clients" className="w-full">
                    <button className="w-full text-sm bg-slate-800/20 hover:bg-slate-800/40 text-slate-200 py-1.5 px-3 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 relative overflow-hidden group-hover:translate-x-1">
                      <span className="relative z-10">고객을 만나러 가볼까요?</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-slate-800/0 via-slate-800/20 to-slate-800/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite] -translate-x-full group-hover:translate-x-full"></span>
                    </button>
                  </Link>
                  <span className="text-slate-200 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg border border-slate-800 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-600/20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 opacity-90 group-hover:from-purple-500 group-hover:to-pink-500 transition-colors duration-300"></div>
              <div className="absolute inset-0 bg-[url('https://v0.blob.com/pattern-dots.png')] opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-blend-overlay"></div>
              <div className="p-6 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-slate-800/20 p-2 group-hover:bg-slate-800/30 group-hover:scale-110 transition-all duration-300">
                    <span className="text-slate-200 text-xl">🤖</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200">WIZ AI 도구</h3>
                </div>
                <p className="text-sm text-purple-100 mb-6 group-hover:text-slate-200 transition-colors duration-300">
                  AI 지능화 마케팅, 분석, 리포트 생성
                </p>
                <div className="flex justify-between items-center">
                  <Link href="/ai-tools" className="w-full">
                    <button className="text-sm bg-slate-800/20 hover:bg-slate-800/40 text-slate-200 py-1.5 px-3 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/30 relative overflow-hidden group-hover:translate-x-1">
                      <span className="relative z-10">AI와 마법을 경험하세요</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-slate-800/0 via-slate-800/20 to-slate-800/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite] -translate-x-full group-hover:translate-x-full"></span>
                    </button>
                  </Link>
                  <span className="text-slate-200 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-lg border border-slate-800 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-600/20">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 opacity-90 group-hover:from-green-400 group-hover:to-emerald-500 transition-colors duration-300"></div>
              <div className="absolute inset-0 bg-[url('https://v0.blob.com/pattern-dots.png')] opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-blend-overlay"></div>
              <div className="p-6 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-slate-800/20 p-2 group-hover:bg-slate-800/30 group-hover:scale-110 transition-all duration-300">
                    <span className="text-slate-200 text-xl">🎮</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200">WIZ GAME</h3>
                </div>
                <p className="text-sm text-green-100 mb-6 group-hover:text-slate-200 transition-colors duration-300">
                  리워드 적립, 성과 대시보드, 팀 랭킹
                </p>
                <div className="flex justify-between items-center">
                  <button className="text-sm bg-slate-800/20 hover:bg-slate-800/40 text-slate-200 py-1.5 px-3 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 relative overflow-hidden group-hover:translate-x-1">
                    <span className="relative z-10">업무도 게임처럼 즐겁게</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-slate-800/0 via-slate-800/20 to-slate-800/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite] -translate-x-full group-hover:translate-x-full"></span>
                  </button>
                  <span className="text-slate-200 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tip Section - 더 깔끔한 디자인 */}
        <div className="mt-8 bg-slate-800/30 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
          <div className="relative p-5 flex items-start border-l-4 border-blue-600">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full opacity-0 blur group-hover:opacity-70 group-hover:animate-pulse transition-opacity duration-500"></div>
              <div className="relative rounded-full bg-slate-800/80 p-3 text-amber-500 mr-3 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">💡</span>
              </div>
            </div>
            <div className="flex-1 ml-3">
              <h3 className="font-medium mb-1 text-slate-200">오늘의 팁</h3>
              <p className="text-sm text-slate-400">
                종료 임박 고객에게 미리 연락하면 재계약률이 30% 높아진다는 사실, 알고 계셨나요?
                <a href="#" className="text-blue-600 ml-2 hover:underline group-hover:ml-3 transition-all duration-300">더 많은 팁 보기 →</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34, 81, 209, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(34, 81, 209, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 81, 209, 0); }
        }

        @keyframes borderGlow {
          0% { 
            border-color: rgba(34, 81, 209, 0.5); 
            box-shadow: 0 0 5px rgba(34, 81, 209, 0.5); 
          }
          50% { 
            border-color: rgba(147, 51, 234, 0.8); 
            box-shadow: 0 0 15px rgba(147, 51, 234, 0.8); 
          }
          100% { 
            border-color: rgba(34, 81, 209, 0.5); 
            box-shadow: 0 0 5px rgba(34, 81, 209, 0.5); 
          }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
} 