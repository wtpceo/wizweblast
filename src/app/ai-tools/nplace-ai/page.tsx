'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import Image from 'next/image';

// 업종 목록
const BUSINESS_TYPES = [
  { id: 'korean', name: '한식' },
  { id: 'chinese', name: '중식' },
  { id: 'japanese', name: '일식' },
  { id: 'western', name: '양식' },
  { id: 'cafe', name: '카페' },
  { id: 'bakery', name: '베이커리' },
  { id: 'malatang', name: '마라탕' },
  { id: 'chicken', name: '치킨' },
  { id: 'pizza', name: '피자' },
];

// 비즈니스 타입과 데이터 타입 정의
type BusinessTypeId = 'korean' | 'chinese' | 'japanese' | 'western' | 'cafe' | 'bakery' | 'malatang' | 'chicken' | 'pizza';
type CategoryType = 'main' | 'menu' | 'reviews';

// 업종별 데이터 인터페이스
interface MenuItem {
  name: string;
  price: string;
  image: string;
}

interface BusinessTypeData {
  images: string[];
  menus: MenuItem[];
  coupons: { title: string; period: string }[];
  posts: { title: string; date: string; content: string }[];
  clips: { title: string; views: string; date: string }[];
  reviews: { author: string; rating: number; content: string; date: string }[];
  blogReviews: { title: string; author: string; views: string; date: string }[];
}

interface BusinessData {
  [key: string]: BusinessTypeData;
}

// 랜덤 이미지 선택 유틸리티 함수
const getRandomImages = (businessType: BusinessTypeId, category: CategoryType, count: number): string[] => {
  // 각 업종별로 가능한 이미지 개수 (예시 - 실제 이미지 파일 개수에 맞게 조정해야 함)
  const imageCountMap: Record<BusinessTypeId, Record<CategoryType, number>> = {
    korean: { main: 5, menu: 8, reviews: 3 },
    chinese: { main: 4, menu: 6, reviews: 3 },
    japanese: { main: 4, menu: 7, reviews: 4 },
    western: { main: 3, menu: 5, reviews: 2 },
    cafe: { main: 4, menu: 6, reviews: 3 },
    bakery: { main: 3, menu: 7, reviews: 2 },
    malatang: { main: 3, menu: 4, reviews: 2 },
    chicken: { main: 4, menu: 5, reviews: 3 },
    pizza: { main: 3, menu: 6, reviews: 2 },
  };

  // 해당 업종의 카테고리 이미지 개수 (기본값 1)
  const imageCount = (imageCountMap[businessType]?.[category] || 1);
  
  // 결과 이미지 배열
  const results: string[] = [];
  
  // 중복 없이 랜덤 이미지 선택
  const selectedIndices = new Set<number>();
  while (selectedIndices.size < Math.min(count, imageCount)) {
    const randomIndex = Math.floor(Math.random() * imageCount) + 1;
    if (!selectedIndices.has(randomIndex)) {
      selectedIndices.add(randomIndex);
      // 이미지 경로 생성
      results.push(`/images/nplace/${businessType}/${category}/${randomIndex}.jpg`);
    }
  }
  
  return results;
};

// 업종별 데이터 (실제로는 더 많은 이미지와 데이터가 필요합니다)
const BUSINESS_DATA: BusinessData = {
  korean: {
    images: [
      '/placeholder-korean1.jpg',
      '/placeholder-korean2.jpg',
      '/placeholder-korean3.jpg',
      '/placeholder-korean4.jpg',
    ],
    menus: [
      { name: '불고기', price: '15,000원', image: '/placeholder-bulgogi.jpg' },
      { name: '된장찌개', price: '8,000원', image: '/placeholder-jjigae.jpg' },
      { name: '비빔밥', price: '9,000원', image: '/placeholder-bibimbap.jpg' },
      { name: '김치찌개', price: '8,000원', image: '/placeholder-kimchi.jpg' },
    ],
    coupons: [
      { title: '평일 점심 10% 할인', period: '2023.06.01 ~ 2023.08.31' },
      { title: '생일 고객 디저트 무료', period: '2023.01.01 ~ 2023.12.31' },
    ],
    posts: [
      { title: '여름 신메뉴 출시 안내', date: '2023.06.01', content: '무더운 여름을 시원하게 보낼 수 있는 신메뉴가 출시되었습니다.' },
    ],
    clips: [
      { title: '매콤한 매력의 비빔밥', views: '1,234', date: '2주 전' },
      { title: '불향 가득한 불고기', views: '2,345', date: '3주 전' },
    ],
    reviews: [
      { author: '맛있게먹자', rating: 5, content: '불고기가 정말 맛있어요. 고기가 부드럽고 양념이 잘 배어있어요.', date: '1개월 전' },
      { author: '맛집탐험가', rating: 4, content: '된장찌개의 구수한 맛이 일품입니다. 반찬도 다양하고 좋았어요.', date: '2개월 전' },
      { author: '푸드러버', rating: 5, content: '가족 모임으로 방문했는데 모두 만족했어요. 특히 비빔밥이 추천!', date: '3개월 전' },
    ],
    blogReviews: [
      { title: '강남에서 찾은 한식의 진수', author: '맛집여행가', views: '3,243', date: '2023.05.15' },
      { title: '회식하기 좋은 한식당 추천', author: '직장인식탐', views: '1,543', date: '2023.04.22' },
    ]
  },
  chinese: {
    images: [
      '/placeholder-chinese1.jpg',
      '/placeholder-chinese2.jpg',
      '/placeholder-chinese3.jpg',
      '/placeholder-chinese4.jpg',
    ],
    menus: [
      { name: '짜장면', price: '7,000원', image: '/placeholder-jajangmyeon.jpg' },
      { name: '짬뽕', price: '8,000원', image: '/placeholder-jjamppong.jpg' },
      { name: '탕수육', price: '18,000원', image: '/placeholder-tangsooyuk.jpg' },
      { name: '양장피', price: '25,000원', image: '/placeholder-yangjangpi.jpg' },
    ],
    coupons: [
      { title: '점심 세트메뉴 15% 할인', period: '2023.06.01 ~ 2023.09.30' },
      { title: '3인 이상 주문시 탕수육 5,000원 할인', period: '상시' },
    ],
    posts: [
      { title: '신메뉴 마라탕면 출시', date: '2023.05.15', content: '중국 현지의 맛을 그대로 담은 마라탕면이 출시되었습니다.' },
    ],
    clips: [
      { title: '쫄깃한 수제 짜장면', views: '2,354', date: '1주 전' },
      { title: '얇바삭 탕수육의 비밀', views: '3,456', date: '2주 전' },
    ],
    reviews: [
      { author: '중식매니아', rating: 5, content: '정통 중국 요리를 맛볼 수 있어 좋아요. 특히 짬뽕이 맵고 시원해요!', date: '2주 전' },
      { author: '맛집탐방러', rating: 4, content: '탕수육이 바삭하고 소스가 달달해요. 양도 많아서 좋았습니다.', date: '1개월 전' },
      { author: '먹방중독자', rating: 5, content: '양장피 강추합니다. 신선한 해산물과 채소가 풍부해요.', date: '3개월 전' },
    ],
    blogReviews: [
      { title: '중식의 명가, 정통 중화요리의 세계', author: '중식러버', views: '4,523', date: '2023.04.10' },
      { title: '가성비 좋은 중국집 발견!', author: '알뜰미식가', views: '2,134', date: '2023.03.25' },
    ]
  },
  japanese: {
    images: [
      '/placeholder-japanese1.jpg',
      '/placeholder-japanese2.jpg',
      '/placeholder-japanese3.jpg',
      '/placeholder-japanese4.jpg',
    ],
    menus: [
      { name: '스시 모듬', price: '25,000원', image: '/placeholder-sushi.jpg' },
      { name: '라멘', price: '9,000원', image: '/placeholder-ramen.jpg' },
      { name: '돈카츠', price: '12,000원', image: '/placeholder-donkatsu.jpg' },
      { name: '오코노미야키', price: '13,000원', image: '/placeholder-okonomiyaki.jpg' },
    ],
    coupons: [
      { title: '런치 세트 10% 할인', period: '평일 11:00-14:00' },
      { title: '생일 방문 고객 사케 1병 증정', period: '상시' },
    ],
    posts: [
      { title: '제철 회 입고 안내', date: '2023.06.10', content: '신선한 제철 생선으로 만드는 특별한 스시를 만나보세요.' },
    ],
    clips: [
      { title: '장인의 손길, 스시 장인의 비밀', views: '5,678', date: '2주 전' },
      { title: '깊은 맛의 비밀, 라멘 육수', views: '3,421', date: '1개월 전' },
    ],
    reviews: [
      { author: '일식매니아', rating: 5, content: '스시가 정말 신선하고 맛있어요. 가격도 합리적입니다.', date: '3주 전' },
      { author: '라멘홀릭', rating: 5, content: '라멘의 깊은 맛이 일품입니다. 국물이 정말 깊고 진해요.', date: '1개월 전' },
      { author: '미식가123', rating: 4, content: '돈카츠가 두툼하고 육즙이 살아있어요. 소스도 맛있습니다.', date: '2개월 전' },
    ],
    blogReviews: [
      { title: '장인의 손길이 느껴지는 진정한 일식의 세계', author: '일식탐험가', views: '6,789', date: '2023.05.05' },
      { title: '합리적인 가격의 프리미엄 일식당', author: '맛집블로거', views: '4,321', date: '2023.04.15' },
    ]
  },
};

// 기본 데이터 (모든 업종에 공통으로 적용)
const DEFAULT_DATA = {
  address: '대구 수성구 무학로 154',
  subway: '수성못역 1번 출구에서 402m',
  operationHours: '10:00에 영업 시작',
  phone: '053-939-8892',
  reviewCount: 288,
  blogReviewCount: 73,
};

export default function NplaceAIPage() {
  const [animateIn, setAnimateIn] = useState(false);
  const [businessType, setBusinessType] = useState<BusinessTypeId>('korean');
  const [storeName, setStoreName] = useState('맛있는 가게');
  const [previewMode, setPreviewMode] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessData>(BUSINESS_DATA);
  
  // 현재 선택된 업종에 따른 데이터
  const getBusinessData = () => {
    return businessData[businessType] || businessData.korean;
  };
  
  // 업종 한글명 가져오기
  const getBusinessTypeName = () => {
    return BUSINESS_TYPES.find(type => type.id === businessType)?.name || '한식';
  };

  // 페이지 로드 시 애니메이션 효과
  useEffect(() => {
    setAnimateIn(true);
  }, []);

  // 업종에 따른 업체명 자동 완성
  useEffect(() => {
    // 업종에 따라 적절한 업체명 제안
    const businessTypeNames: Record<BusinessTypeId, string> = {
      korean: '맛있는 한식당',
      chinese: '황금 짬뽕',
      japanese: '스시 하우스',
      western: '파스타 공방',
      cafe: '커피 한잔',
      bakery: '달콤 베이커리',
      malatang: '마라왕 마라탕',
      chicken: '바삭바삭 치킨',
      pizza: '피자 플레이스'
    };
    
    setStoreName(businessTypeNames[businessType] || '맛있는 가게');
  }, [businessType]);

  // 업종이 변경될 때마다 이미지 업데이트
  useEffect(() => {
    // 메인 이미지, 메뉴 이미지, 리뷰 이미지 등을 업데이트
    const mainImages = getRandomImages(businessType, 'main', 5);
    const menuImages = getRandomImages(businessType, 'menu', 8);
    const reviewImages = getRandomImages(businessType, 'reviews', 4);
    
    // 기존 데이터를 복사한 후 이미지만 업데이트
    setBusinessData(prevData => {
      // 선택한 업종의 데이터가 없으면 기본 데이터 구조 생성
      if (!prevData[businessType]) {
        const defaultBusinessData = { ...prevData.korean };
        prevData = { ...prevData, [businessType]: defaultBusinessData };
      }
      
      return {
        ...prevData,
        [businessType]: {
          ...prevData[businessType],
          images: mainImages.length > 0 ? mainImages : prevData[businessType].images,
          menus: prevData[businessType].menus.map((menu, index) => ({
            ...menu,
            image: menuImages[index % menuImages.length] || menu.image
          }))
        }
      };
    });
  }, [businessType]);

  return (
    <div className="min-h-screen bg-[#0F0F1A] pb-10 text-slate-200 dark">
      <Header
        title="N플레이스 AI"
        description="네이버 플레이스 커스텀 미리보기 도구"
        icon="📍"
        actions={
          <Link href="/ai-tools" className="bg-[#242436] text-blue-400 px-4 py-2 rounded-lg hover:bg-[#2A2A40] transition-all duration-200 flex items-center text-sm font-medium shadow-md hover:shadow-lg border border-blue-700/20 backdrop-blur-sm">
            <span className="mr-2">🤖</span> AI 도구 목록으로
          </Link>
        }
      />

      <div className="container mx-auto px-4 py-6">
        {/* 소개 */}
        <div className={`bg-gradient-to-r from-green-800/20 to-teal-800/20 backdrop-blur-sm rounded-lg p-6 mb-6 transition-all duration-500 border border-white/10 shadow-xl ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          <h2 className="text-xl font-bold mb-3 text-white flex items-center">
            <span className="text-2xl mr-2">📍</span> 
            네이버 플레이스 미리보기 시뮬레이터
          </h2>
          <p className="text-slate-300 mb-4">
            원하는 업종과 업체명을 입력하면 네이버 플레이스에 등록된 것처럼 미리 볼 수 있습니다.
            각 업종에 맞는 사진, 메뉴, 리뷰 등이 자동으로 생성됩니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 커스텀 옵션 */}
          <div className={`lg:col-span-1 bg-[#151523]/80 rounded-lg border border-white/10 shadow-md p-6 transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <h3 className="text-lg font-bold mb-4 text-white">커스텀 옵션</h3>
            
            <div className="space-y-4">
              {/* 업종 선택 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  업종 선택
                </label>
                <select 
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as BusinessTypeId)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-200"
                >
                  {BUSINESS_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              
              {/* 업체명 입력 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  업체명
                </label>
                <input 
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-200"
                  maxLength={20}
                  placeholder="가게 이름 입력"
                />
              </div>
              
              {/* 미리보기 버튼 */}
              <div className="pt-4">
                <button
                  onClick={() => setPreviewMode(true)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-green-700/30 font-medium"
                >
                  <span className="mr-2">👁️</span> 네이버 플레이스 미리보기
                </button>
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 네이버 플레이스 미리보기 */}
          <div className={`lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-md transition-all duration-500 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
            <div className="p-4 text-black">
              <div className="text-center text-sm text-slate-500 mb-4">
                * 아래는 실제 네이버 플레이스가 아닌 시뮬레이션입니다 *
              </div>
              
              {/* 모바일 화면 프레임 */}
              <div className="max-w-sm mx-auto border-4 border-gray-800 rounded-3xl overflow-hidden bg-white shadow-xl">
                {/* 상단 상태바 */}
                <div className="bg-gray-800 text-white py-2 px-4 flex justify-between items-center text-xs">
                  <div>11:37</div>
                  <div className="flex items-center gap-1">
                    <span>LTE</span>
                    <span>32</span>
                  </div>
                </div>
                
                {/* 네이버 플레이스 화면 */}
                <div className="h-[600px] overflow-y-auto bg-gray-100">
                  {/* 네이버 플레이스 UI */}
                  <div className="bg-white">
                    {/* 헤더 이미지 갤러리 */}
                    <div className="relative h-64 flex overflow-hidden">
                      {/* 메인 이미지 (왼쪽 큰 이미지) */}
                      <div className="w-1/2 h-full bg-gray-300 relative">
                        {getBusinessData().images && getBusinessData().images[0] ? (
                          <div className="w-full h-full relative">
                            <Image 
                              src={getBusinessData().images[0]}
                              alt={`${getBusinessTypeName()} 메인 이미지`}
                              fill
                              style={{ objectFit: 'cover' }}
                              onError={(e) => {
                                // 이미지 로드 실패 시 배경만 표시
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-300/30 z-10">
                              <span className="text-sm text-gray-700">{getBusinessTypeName()} 메인 이미지</span>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
                            {getBusinessTypeName()} 메인 이미지
                          </div>
                        )}
                        <div className="absolute left-2 top-2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center z-20">
                          <span className="text-white text-xs">←</span>
                        </div>
                      </div>
                      
                      {/* 오른쪽 이미지 그리드 */}
                      <div className="w-1/2 h-full grid grid-cols-2 grid-rows-2">
                        {[0, 1, 2, 3].map((idx) => (
                          <div key={idx} className="bg-gray-300 border border-white relative">
                            {getBusinessData().images && getBusinessData().images[idx + 1] ? (
                              <div className="w-full h-full relative">
                                <Image 
                                  src={getBusinessData().images[idx + 1]}
                                  alt={`${getBusinessTypeName()} ${idx + 1}`}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  onError={(e) => {
                                    // 이미지 로드 실패 시 배경만 표시
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-300/30 z-10">
                                  <span className="text-xs text-gray-700">{getBusinessTypeName()} {idx + 1}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                                {getBusinessTypeName()} {idx + 1}
                              </div>
                            )}
                            {idx === 3 && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white z-20">
                                <div>999+</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 가게 정보 헤더 */}
                    <div className="p-4 border-b">
                      <div className="flex items-center space-x-2">
                        <h1 className="text-xl font-bold">{storeName} {getBusinessTypeName()}</h1>
                        <span className="text-gray-500 text-sm">육류,고기요리</span>
                      </div>
                      
                      <div className="flex text-sm text-gray-500 mt-2">
                        <span>방문자 리뷰 {DEFAULT_DATA.reviewCount}</span>
                        <span className="mx-2">•</span>
                        <span>블로그 리뷰 {DEFAULT_DATA.blogReviewCount}</span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mt-2">
                        맛있는 {getBusinessTypeName()}과 품질 좋은 고기의 조화
                      </div>
                    </div>
                    
                    {/* 액션 버튼 */}
                    <div className="grid grid-cols-4 text-center py-4 border-b">
                      <div className="flex flex-col items-center text-sm">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600">
                          <span>📞</span>
                        </div>
                        <span className="mt-1 text-xs">전화</span>
                      </div>
                      <div className="flex flex-col items-center text-sm">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600">
                          <span>⭐</span>
                        </div>
                        <span className="mt-1 text-xs">저장</span>
                      </div>
                      <div className="flex flex-col items-center text-sm">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600">
                          <span>🧭</span>
                        </div>
                        <span className="mt-1 text-xs">길찾기</span>
                      </div>
                      <div className="flex flex-col items-center text-sm">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600">
                          <span>🔗</span>
                        </div>
                        <span className="mt-1 text-xs">공유</span>
                      </div>
                    </div>
                    
                    {/* 탭 메뉴 */}
                    <div className="flex text-center border-b">
                      <div className="flex-1 py-3 font-medium border-b-2 border-black">홈</div>
                      <div className="flex-1 py-3 text-gray-500">메뉴</div>
                      <div className="flex-1 py-3 text-gray-500">리뷰</div>
                      <div className="flex-1 py-3 text-gray-500">사진</div>
                      <div className="flex-1 py-3 text-gray-500">지도</div>
                      <div className="flex-1 py-3 text-gray-500">주변</div>
                    </div>
                    
                    {/* 주소 및 정보 */}
                    <div className="p-4 border-b">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="w-6 h-6 mt-0.5 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                          <span>📍</span>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span>{DEFAULT_DATA.address}</span>
                            <span className="ml-2 text-blue-500 text-sm flex items-center">
                              지도 <span className="ml-1">▶</span>
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <span className="bg-amber-100 text-amber-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">3</span>
                            <span className="text-sm text-gray-600">{DEFAULT_DATA.subway}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="w-6 h-6 mt-0.5 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                          <span>🕒</span>
                        </div>
                        <div className="flex items-center">
                          <span>영업 중 · {DEFAULT_DATA.operationHours}</span>
                          <span className="ml-2 text-gray-500 text-sm">▼</span>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 mt-0.5 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                          <span>📞</span>
                        </div>
                        <div className="flex items-center">
                          <span>{DEFAULT_DATA.phone}</span>
                          <span className="ml-2 text-blue-500 text-sm">복사</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 쿠폰 */}
                    <div className="p-4 border-b">
                      <div className="bg-green-50 rounded-lg p-4 flex items-center">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <span className="text-green-600 font-medium">사장님, 플레이스를</span>
                          </div>
                          <div className="flex items-center text-green-600 font-bold">
                            <span>무료로 직접</span>
                            <span className="mx-1">관리하세요!</span>
                          </div>
                        </div>
                        <div className="text-blue-500 text-sm">
                          권한 받기 &gt;
                        </div>
                      </div>
                    </div>
                    
                    {/* 메뉴 섹션 */}
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">메뉴</h3>
                        <span className="text-blue-500 text-sm">더보기 &gt;</span>
                      </div>
                      
                      <div className="space-y-3">
                        {getBusinessData().menus.slice(0, 3).map((menu, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div>
                              <div className="font-medium">{menu.name}</div>
                              <div className="text-sm text-gray-600">{menu.price}</div>
                            </div>
                            <div className="w-16 h-16 bg-gray-200 rounded relative overflow-hidden">
                              {menu.image ? (
                                <div className="w-full h-full relative">
                                  <Image 
                                    src={menu.image}
                                    alt={`${menu.name} 메뉴 이미지`}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    onError={(e) => {
                                      // 이미지 로드 실패 시 배경만 표시
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200/30 z-10">
                                    <span className="text-xs text-gray-700">메뉴 이미지</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                  메뉴 이미지
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 리뷰 섹션 */}
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">방문자 리뷰</h3>
                        <span className="text-blue-500 text-sm">더보기 &gt;</span>
                      </div>
                      
                      <div className="space-y-4">
                        {getBusinessData().reviews.slice(0, 2).map((review, idx) => (
                          <div key={idx} className="border-b border-gray-100 pb-3">
                            <div className="flex items-center mb-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
                              <div className="flex-1">
                                <div className="font-medium">{review.author}</div>
                                <div className="flex items-center">
                                  <div className="flex text-yellow-400">
                                    {'★'.repeat(review.rating)}
                                  </div>
                                  <span className="text-xs text-gray-500 ml-2">{review.date}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm">{review.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 블로그 리뷰 섹션 */}
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">블로그 리뷰</h3>
                        <span className="text-blue-500 text-sm">더보기 &gt;</span>
                      </div>
                      
                      <div className="space-y-3">
                        {getBusinessData().blogReviews.slice(0, 2).map((review, idx) => (
                          <div key={idx} className="border-b border-gray-100 pb-3">
                            <div className="font-medium mb-1">{review.title}</div>
                            <div className="flex text-sm text-gray-500">
                              <span>{review.author}</span>
                              <span className="mx-1">•</span>
                              <span>조회수 {review.views}</span>
                              <span className="mx-1">•</span>
                              <span>{review.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 하단 네비게이션 바 */}
                <div className="bg-white py-3 px-4 flex justify-between items-center border-t border-gray-200">
                  <div className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md">N</div>
                  <div className="w-8 h-8 flex items-center justify-center text-gray-500">←</div>
                  <div className="w-8 h-8 flex items-center justify-center text-gray-500">→</div>
                  <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white">●</div>
                  <div className="w-8 h-8 flex items-center justify-center text-gray-500">↻</div>
                  <div className="w-8 h-8 flex items-center justify-center text-gray-500">↗</div>
                  <div className="w-8 h-8 flex items-center justify-center text-gray-500">☰</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 