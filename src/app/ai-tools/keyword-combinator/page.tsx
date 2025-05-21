'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';

export default function KeywordCombinatorPage() {
  // 상태 변수들
  const [mainKeywords, setMainKeywords] = useState<string>(''); // 주요 키워드 입력값
  const [subKeywords, setSubKeywords] = useState<string>(''); // 보조 키워드 입력값
  const [thirdKeywords, setThirdKeywords] = useState<string>(''); // 세 번째 키워드 입력값
  const [fourthKeywords, setFourthKeywords] = useState<string>(''); // 네 번째 키워드 입력값
  const [resultKeywords, setResultKeywords] = useState<string[]>([]); // 생성된 키워드 조합 결과
  const [isGenerating, setIsGenerating] = useState<boolean>(false); // 생성 중 상태
  const [showTips, setShowTips] = useState<boolean>(true); // 팁 표시 여부
  const [animateIn, setAnimateIn] = useState(false); // 애니메이션 상태

  // 각 입력값을 배열로 분리하여 총 조합 수 계산
  const parseKeywords = (input: string): string[] => {
    return input
      .split(/[,\n]/) // 쉼표나 줄바꿈으로 구분
      .map(k => k.trim()) // 앞뒤 공백 제거
      .filter(k => k.length > 0); // 빈 문자열 제거
  };

  const mainArr = parseKeywords(mainKeywords);
  const subArr = parseKeywords(subKeywords);
  const thirdArr = parseKeywords(thirdKeywords);
  const fourthArr = parseKeywords(fourthKeywords);
  
  // 비어있지 않은 그룹만 필터링하여 총 가능한 조합 수 계산
  const nonEmptyGroups = [mainArr, subArr, thirdArr, fourthArr].filter(arr => arr.length > 0);
  const totalPossible = nonEmptyGroups.reduce((acc, arr) => acc * arr.length, 1);

  // 페이지 로드 시 애니메이션 효과
  useState(() => {
    setAnimateIn(true);
  });

  // 키워드 조합 생성 함수
  const generateCombinations = () => {
    setIsGenerating(true);
    
    // 1. 각 그룹의 키워드 배열 준비
    const groups = [
      mainArr,    // 주요 키워드
      subArr,     // 보조 키워드
      thirdArr,   // 세 번째 키워드
      fourthArr   // 네 번째 키워드
    ];

    // 2. 모든 그룹이 비어있는지 확인
    if (groups.every(group => group.length === 0)) {
      alert('키워드를 최소 하나 이상 입력해주세요');
      setIsGenerating(false);
      return;
    }

    setTimeout(() => {
      try {
        // 3. 카르테시안 곱을 사용한 조합 생성
        let results: string[] = [''];
        
        for (const group of groups) {
          if (group.length === 0) continue; // 빈 그룹은 건너뛰기
          
          const temp: string[] = [];
          for (const current of results) {
            for (const keyword of group) {
              temp.push(current ? `${current} ${keyword}` : keyword);
            }
          }
          results = temp;
        }

        // 4. 빈 결과 제거
        const validCombinations = results.filter(r => r.length > 0);

        // 5. 결과 설정
        setResultKeywords(validCombinations);
        
        // 6. 완료 메시지
        console.log(`총 ${validCombinations.length}개의 키워드 조합이 생성되었습니다.`);

      } catch (error) {
        console.error('키워드 조합 생성 중 오류 발생:', error);
        alert('키워드 조합 생성 중 오류가 발생했습니다.');
      } finally {
        setIsGenerating(false);
      }
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('클립보드에 복사되었습니다!');
  };

  const copyAllToClipboard = () => {
    navigator.clipboard.writeText(resultKeywords.join('\n'));
    alert('모든 키워드가 클립보드에 복사되었습니다!');
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] pb-10 text-slate-200 dark">
      <Header
        title="키워드 조합 도구"
        description="효과적인 키워드 조합으로 광고 효과를 극대화하세요"
        icon="🔤"
        actions={
          <Link href="/ai-tools" className="bg-[#242436] text-blue-400 px-4 py-2 rounded-lg hover:bg-[#2A2A40] transition-all duration-200 flex items-center text-sm font-medium shadow-md hover:shadow-lg border border-blue-700/20 backdrop-blur-sm">
            <span className="mr-2">🤖</span> AI 도구 목록으로
          </Link>
        }
      />

      <div className="container mx-auto px-4 py-6">
        {/* 팁 메시지 */}
        {showTips && (
          <div className={`bg-gradient-to-r from-blue-800/20 to-purple-800/20 backdrop-blur-sm rounded-lg p-4 mb-6 flex items-start transition-all duration-500 delay-100 border border-white/10 shadow-xl ${animateIn ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'}`}>
            <div className="text-2xl mr-3 mt-1">💡</div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <h3 className="font-medium text-white">키워드 조합 팁</h3>
                <button 
                  className="text-slate-400 hover:text-white"
                  onClick={() => setShowTips(false)}
                >
                  ✕
                </button>
              </div>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• 주요 키워드는 핵심 상품이나 서비스를 나타내는 단어를 입력하세요.</li>
                <li>• 보조 키워드는 지역, 특성, 혜택 등 부가적인 정보를 입력하세요.</li>
                <li>• 키워드는 쉼표(,)로 구분해서 여러 개를 입력할 수 있습니다.</li>
                <li>• 입력한 모든 키워드 그룹의 가능한 조합이 생성됩니다.</li>
              </ul>
            </div>
          </div>
        )}

        {/* 입력 폼 */}
        <div className={`bg-[#151523]/80 rounded-lg border border-white/10 shadow-md p-6 mb-6 transition-all duration-500 delay-200 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 주요 키워드 입력 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                주요 키워드 <span className="text-amber-400">*</span>
              </label>
              <textarea
                value={mainKeywords}
                onChange={(e) => setMainKeywords(e.target.value)}
                placeholder="핵심 키워드를 입력하세요. 쉼표(,)로 구분 (예: 디지털마케팅, 광고대행사, SNS마케팅)"
                className="w-full h-32 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 placeholder-slate-500"
              />
            </div>

            {/* 보조 키워드 입력 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                보조 키워드
              </label>
              <textarea
                value={subKeywords}
                onChange={(e) => setSubKeywords(e.target.value)}
                placeholder="상품/서비스의 특성, 지역, 혜택 등 추가 키워드 (예: 서울, 전문가, 무료상담)"
                className="w-full h-32 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 placeholder-slate-500"
              />
            </div>

            {/* 세 번째 키워드 입력 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                세 번째 키워드
              </label>
              <textarea
                value={thirdKeywords}
                onChange={(e) => setThirdKeywords(e.target.value)}
                placeholder="키워드를 입력하세요. 쉼표(,)로 구분"
                className="w-full h-32 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 placeholder-slate-500"
              />
            </div>

            {/* 네 번째 키워드 입력 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                네 번째 키워드
              </label>
              <textarea
                value={fourthKeywords}
                onChange={(e) => setFourthKeywords(e.target.value)}
                placeholder="키워드를 입력하세요. 쉼표(,)로 구분"
                className="w-full h-32 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-200 placeholder-slate-500"
              />
            </div>
          </div>

          {/* 생성 버튼 */}
          <div className="mb-4 text-sm text-slate-300">총 가능한 키워드 조합 수: {totalPossible}개</div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={generateCombinations}
              disabled={isGenerating}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-blue-700/30 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>키워드 조합 생성 중...</span>
                </>
              ) : (
                <>
                  <span className="mr-2">✨</span> 키워드 조합 생성하기
                </>
              )}
            </button>
          </div>
        </div>

        {/* 결과 출력 */}
        {resultKeywords.length > 0 && (
          <div className={`bg-[#151523]/80 rounded-lg border border-white/10 shadow-md p-6 transition-all duration-500 delay-300 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-xl text-white">
                생성된 키워드 조합 ({resultKeywords.length}개)
              </h3>
              <button
                onClick={copyAllToClipboard}
                className="text-sm bg-slate-800/50 hover:bg-slate-700/50 px-3 py-1.5 rounded-md text-slate-300 hover:text-white transition-all duration-300 flex items-center"
              >
                <span className="mr-1.5">📋</span> 전체 복사
              </button>
            </div>
            
            <textarea
              readOnly
              rows={Math.max(resultKeywords.length, 4)}
              value={resultKeywords.join('\n')}
              onFocus={(e) => e.target.select()}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-slate-300 whitespace-pre-wrap"
            />
          </div>
        )}
      </div>
    </div>
  );
} 