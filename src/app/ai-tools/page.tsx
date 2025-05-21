'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';

// AI 도구 데이터
const aiTools = [
  {
    id: 'keyword-combinator',
    title: '키워드 조합 도구',
    description: '효과적인 키워드 조합을 생성하여 광고 효과를 최적화합니다.',
    icon: '🔤',
    color: 'from-blue-600 to-indigo-600',
    hoverColor: 'from-blue-500 to-indigo-500',
    path: '/ai-tools/keyword-combinator'
  },
  {
    id: 'content-generator',
    title: '콘텐츠 생성기',
    description: 'AI로 매력적인 마케팅 콘텐츠를 빠르게 작성합니다.',
    icon: '📝',
    color: 'from-purple-600 to-pink-600',
    hoverColor: 'from-purple-500 to-pink-500',
    path: '/ai-tools/content-generator',
    comingSoon: true
  },
  {
    id: 'image-generator',
    title: '이미지 생성기',
    description: '광고용 이미지를 AI로 손쉽게 생성합니다.',
    icon: '🖼️',
    color: 'from-orange-600 to-amber-600',
    hoverColor: 'from-orange-500 to-amber-500',
    path: '/ai-tools/image-generator',
    comingSoon: true
  },
  {
    id: 'campaign-analyzer',
    title: '캠페인 분석기',
    description: '현재 광고 캠페인의 성과를 분석하고 개선점을 제안합니다.',
    icon: '📊',
    color: 'from-green-600 to-emerald-600',
    hoverColor: 'from-green-500 to-emerald-500',
    path: '/ai-tools/campaign-analyzer',
    comingSoon: true
  }
];

export default function AIToolsPage() {
  const [animateIn, setAnimateIn] = useState(false);
  
  // 페이지 로드 시 애니메이션 효과
  useState(() => {
    setAnimateIn(true);
  });

  return (
    <div className="min-h-screen bg-[#0F0F1A] pb-10 text-slate-200 dark">
      <Header
        title="WIZ AI 도구"
        description="인공지능으로 마케팅 업무를 효율적으로 처리하세요"
        icon="🤖"
        actions={
          <Link href="/dashboard" className="bg-[#242436] text-blue-400 px-4 py-2 rounded-lg hover:bg-[#2A2A40] transition-all duration-200 flex items-center text-sm font-medium shadow-md hover:shadow-lg border border-blue-700/20 backdrop-blur-sm">
            <span className="mr-2">📊</span> 대시보드로 돌아가기
          </Link>
        }
      />
      
      <div className="container mx-auto px-4 py-6">
        {/* 소개 섹션 */}
        <div className={`bg-gradient-to-r from-blue-800/20 to-purple-800/20 backdrop-blur-sm rounded-lg p-6 mb-8 transition-all duration-500 border border-white/10 shadow-xl ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <h2 className="text-xl font-bold mb-3 text-white flex items-center">
            <span className="text-2xl mr-2">🔮</span> 
            WIZ AI가 당신의 마케팅을 한 단계 업그레이드합니다
          </h2>
          <p className="text-slate-300 mb-4">
            강력한 AI 기반 도구를 사용하여 고객 유치에서 브랜딩까지 마케팅 전 과정을 최적화하세요.
            클릭 몇 번으로 전문가급 결과물을 얻을 수 있습니다.
          </p>
          <div className="flex items-center text-sm text-amber-300">
            <span className="mr-2">💡</span>
            <span>새로운 도구는 계속 추가될 예정입니다. 기대해 주세요!</span>
          </div>
        </div>

        {/* AI 도구 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {aiTools.map((tool) => (
            <div 
              key={tool.id}
              className={`group relative overflow-hidden rounded-lg border border-slate-800 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-90 group-hover:${tool.hoverColor} transition-colors duration-300`}></div>
              <div className="absolute inset-0 bg-[url('https://v0.blob.com/pattern-dots.png')] opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-blend-overlay"></div>
              
              {tool.comingSoon && (
                <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white text-xs font-medium py-1 px-2 rounded-full z-20">
                  출시 예정
                </div>
              )}
              
              <div className="p-6 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-slate-800/20 p-2 group-hover:bg-slate-800/30 group-hover:scale-110 transition-all duration-300">
                    <span className="text-slate-200 text-xl">{tool.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-200">{tool.title}</h3>
                </div>
                <p className="text-sm text-blue-100 mb-6 group-hover:text-slate-200 transition-colors duration-300">
                  {tool.description}
                </p>
                <div className="flex justify-between items-center">
                  {tool.comingSoon ? (
                    <button 
                      disabled
                      className="w-full text-sm bg-slate-900/40 text-slate-400 py-1.5 px-3 rounded-md cursor-not-allowed"
                    >
                      출시 예정
                    </button>
                  ) : (
                    <Link href={tool.path} className="w-full">
                      <button className="w-full text-sm bg-slate-800/20 hover:bg-slate-800/40 text-slate-200 py-1.5 px-3 rounded-md transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 relative overflow-hidden group-hover:translate-x-1">
                        <span className="relative z-10">시작하기</span>
                        <span className="absolute inset-0 bg-gradient-to-r from-slate-800/0 via-slate-800/20 to-slate-800/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite] -translate-x-full group-hover:translate-x-full"></span>
                      </button>
                    </Link>
                  )}
                  {!tool.comingSoon && (
                    <span className="text-slate-200 group-hover:translate-x-1 transition-transform duration-300">→</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 