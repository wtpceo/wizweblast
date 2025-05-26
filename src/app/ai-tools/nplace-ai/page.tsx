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
  { id: 'malatang', name: '마라탕' },
  { id: 'chicken', name: '치킨' },
  { id: 'pizza', name: '피자' },
];

// 비즈니스 타입과 데이터 타입 정의
type BusinessTypeId = 'korean' | 'chinese' | 'japanese' | 'western' | 'malatang' | 'chicken' | 'pizza';
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
  reviews: { author: string; rating: number; content: string; date: string; image?: string }[];
  blogReviews: { title: string; author: string; views: string; date: string }[];
}

interface BusinessData {
  [key: string]: BusinessTypeData;
}

// 랜덤 이미지 선택 유틸리티 함수
const getRandomImages = (businessType: BusinessTypeId, category: CategoryType, count: number): string[] => {
  // 각 업종별로 가능한 이미지 개수 (모든 업종에 동일하게 적용)
  const imageCountMap: Record<BusinessTypeId, Record<CategoryType, number>> = {
    korean: { main: DISPLAY_CONFIG.MAIN_IMAGES, menu: DISPLAY_CONFIG.MENU_ITEMS, reviews: DISPLAY_CONFIG.REVIEWS },
    chinese: { main: DISPLAY_CONFIG.MAIN_IMAGES, menu: DISPLAY_CONFIG.MENU_ITEMS, reviews: DISPLAY_CONFIG.REVIEWS },
    japanese: { main: DISPLAY_CONFIG.MAIN_IMAGES, menu: DISPLAY_CONFIG.MENU_ITEMS, reviews: DISPLAY_CONFIG.REVIEWS },
    western: { main: DISPLAY_CONFIG.MAIN_IMAGES, menu: DISPLAY_CONFIG.MENU_ITEMS, reviews: DISPLAY_CONFIG.REVIEWS },
    malatang: { main: DISPLAY_CONFIG.MAIN_IMAGES, menu: DISPLAY_CONFIG.MENU_ITEMS, reviews: DISPLAY_CONFIG.REVIEWS },
    chicken: { main: DISPLAY_CONFIG.MAIN_IMAGES, menu: DISPLAY_CONFIG.MENU_ITEMS, reviews: DISPLAY_CONFIG.REVIEWS },
    pizza: { main: DISPLAY_CONFIG.MAIN_IMAGES, menu: DISPLAY_CONFIG.MENU_ITEMS, reviews: DISPLAY_CONFIG.REVIEWS },
  };
  
  // 해당 업종의 카테고리 이미지 개수 (기본값 DISPLAY_CONFIG 적용)
  const imageCount = (imageCountMap[businessType]?.[category] || 
    (category === 'main' ? DISPLAY_CONFIG.MAIN_IMAGES :
     category === 'menu' ? DISPLAY_CONFIG.MENU_ITEMS : DISPLAY_CONFIG.REVIEWS));
  
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

// 업종별 데이터 (각 업종마다 DISPLAY_CONFIG에 맞게 이미지/메뉴/리뷰 수 통일)
const BUSINESS_DATA: BusinessData = {
  korean: {
    images: [
      '/images/nplace/korean/main/1.jpg',
      '/images/nplace/korean/main/2.jpg',
      '/images/nplace/korean/main/3.jpg',
      '/images/nplace/korean/main/4.jpg',
      '/images/nplace/korean/main/5.jpg',
    ],
    menus: [
      { name: '불고기', price: '15,000원', image: '/images/nplace/korean/menu/1.jpg' },
      { name: '된장찌개', price: '8,000원', image: '/images/nplace/korean/menu/2.jpg' },
      { name: '비빔밥', price: '9,000원', image: '/images/nplace/korean/menu/3.jpg' },
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
      { author: '맛있게먹자', rating: 5, content: '불고기가 정말 맛있어요. 고기가 부드럽고 양념이 잘 배어있어요.', date: '1개월 전', image: '/images/nplace/korean/reviews/1.jpg' },
      { author: '맛집탐험가', rating: 4, content: '된장찌개의 구수한 맛이 일품입니다. 반찬도 다양하고 좋았어요.', date: '2개월 전', image: '/images/nplace/korean/reviews/2.jpg' },
    ],
    blogReviews: [
      { title: '강남에서 찾은 한식의 진수', author: '맛집여행가', views: '3,243', date: '2023.05.15' },
      { title: '회식하기 좋은 한식당 추천', author: '직장인식탐', views: '1,543', date: '2023.04.22' },
    ]
  },
  chinese: {
    images: [
      '/images/nplace/chinese/main/1.jpg',
      '/images/nplace/chinese/main/2.jpg',
      '/images/nplace/chinese/main/3.jpg',
      '/images/nplace/chinese/main/4.jpg',
      '/images/nplace/chinese/main/5.jpg',
    ],
    menus: [
      { name: '짜장면', price: '7,000원', image: '/images/nplace/chinese/menu/1.jpg' },
      { name: '짬뽕', price: '8,000원', image: '/images/nplace/chinese/menu/2.jpg' },
      { name: '탕수육', price: '18,000원', image: '/images/nplace/chinese/menu/3.jpg' },
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
      { author: '중식매니아', rating: 5, content: '정통 중국 요리를 맛볼 수 있어 좋아요. 특히 짬뽕이 맵고 시원해요!', date: '2주 전', image: '/images/nplace/chinese/reviews/1.jpg' },
      { author: '맛집탐방러', rating: 4, content: '탕수육이 바삭하고 소스가 달달해요. 양도 많아서 좋았습니다.', date: '1개월 전', image: '/images/nplace/chinese/reviews/2.jpg' },
    ],
    blogReviews: [
      { title: '중식의 명가, 정통 중화요리의 세계', author: '중식러버', views: '4,523', date: '2023.04.10' },
      { title: '가성비 좋은 중국집 발견!', author: '알뜰미식가', views: '2,134', date: '2023.03.25' },
    ]
  },
  japanese: {
    images: [
      '/images/nplace/japanese/main/1.jpg',
      '/images/nplace/japanese/main/2.jpg',
      '/images/nplace/japanese/main/3.jpg',
      '/images/nplace/japanese/main/4.jpg',
      '/images/nplace/japanese/main/5.jpg',
    ],
    menus: [
      { name: '스시 모듬', price: '25,000원', image: '/images/nplace/japanese/menu/1.jpg' },
      { name: '라멘', price: '9,000원', image: '/images/nplace/japanese/menu/2.jpg' },
      { name: '돈카츠', price: '12,000원', image: '/images/nplace/japanese/menu/3.jpg' },
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
      { author: '일식매니아', rating: 5, content: '스시가 정말 신선하고 맛있어요. 가격도 합리적입니다.', date: '3주 전', image: '/images/nplace/japanese/reviews/1.jpg' },
      { author: '라멘홀릭', rating: 5, content: '라멘의 깊은 맛이 일품입니다. 국물이 정말 깊고 진해요.', date: '1개월 전', image: '/images/nplace/japanese/reviews/2.jpg' },
    ],
    blogReviews: [
      { title: '장인의 손길이 느껴지는 진정한 일식의 세계', author: '일식탐험가', views: '6,789', date: '2023.05.05' },
      { title: '합리적인 가격의 프리미엄 일식당', author: '맛집블로거', views: '4,321', date: '2023.04.15' },
    ]
  },
  western: {
    images: [
      '/images/nplace/western/main/1.jpg',
      '/images/nplace/western/main/2.jpg',
      '/images/nplace/western/main/3.jpg',
      '/images/nplace/western/main/4.jpg',
      '/images/nplace/western/main/5.jpg',
    ],
    menus: [
      { name: '토마토 파스타', price: '14,000원', image: '/images/nplace/western/menu/1.jpg' },
      { name: '안심 스테이크', price: '32,000원', image: '/images/nplace/western/menu/2.jpg' },
      { name: '시저 샐러드', price: '12,000원', image: '/images/nplace/western/menu/3.jpg' },
    ],
    coupons: [
      { title: '와인 1병 주문시 치즈플레이트 증정', period: '2023.07.01 ~ 2023.09.30' },
      { title: '디너 코스 10% 할인', period: '주중 17:00 이후' },
    ],
    posts: [
      { title: '여름 한정 프로모션', date: '2023.06.15', content: '여름을 맞아 특별 와인 페어링 코스를 선보입니다.' },
    ],
    clips: [
      { title: '셰프의 스페셜 파스타', views: '4,567', date: '1주 전' },
      { title: '완벽한 미디엄 레어의 비밀', views: '3,890', date: '3주 전' },
    ],
    reviews: [
      { author: '미식가123', rating: 5, content: '스테이크가 정말 부드럽고 맛있어요. 와인 페어링도 완벽했습니다.', date: '2주 전', image: '/images/nplace/western/reviews/1.jpg' },
      { author: '맛있는여행', rating: 4, content: '분위기도 좋고 음식도 맛있어요. 데이트하기 좋은 장소입니다.', date: '1개월 전', image: '/images/nplace/western/reviews/2.jpg' },
    ],
    blogReviews: [
      { title: '로맨틱한 분위기의 프리미엄 양식당', author: '맛집블로거', views: '5,678', date: '2023.05.20' },
      { title: '와인과 함께하는 완벽한 저녁', author: '와인러버', views: '3,456', date: '2023.04.30' },
    ]
  },
  malatang: {
    images: [
      '/images/nplace/malatang/main/1.jpg',
      '/images/nplace/malatang/main/2.jpg',
      '/images/nplace/malatang/main/3.jpg',
      '/images/nplace/malatang/main/4.jpg',
      '/images/nplace/malatang/main/5.jpg',
    ],
    menus: [
      { name: '마라탕', price: '9,500원', image: '/images/nplace/malatang/menu/1.jpg' },
      { name: '마라샹궈', price: '28,000원', image: '/images/nplace/malatang/menu/2.jpg' },
      { name: '꿔바로우', price: '15,000원', image: '/images/nplace/malatang/menu/3.jpg' },
    ],
    coupons: [
      { title: '첫 방문 고객 10% 할인', period: '2023.07.01 ~ 2023.12.31' },
      { title: '리뷰 작성시 음료 1잔 무료', period: '상시' },
    ],
    posts: [
      { title: '숨겨진 재료 추가 안내', date: '2023.06.05', content: '더 다양한 재료를 추가했습니다. 새로운 맛을 경험해보세요.' },
    ],
    clips: [
      { title: '마라의 매운맛 단계', views: '3,245', date: '2주 전' },
      { title: '마라탕 재료 고르는 팁', views: '4,567', date: '3주 전' },
    ],
    reviews: [
      { author: '매운맛매니아', rating: 5, content: '진짜 중국 마라탕 맛이에요! 중간맛도 엄청 맵지만 맛있어요.', date: '1주 전', image: '/images/nplace/malatang/reviews/1.jpg' },
      { author: '맛집탐험가', rating: 4, content: '재료가 신선하고 육수가 깊어요. 약간 맵지만 중독성 있습니다.', date: '1개월 전', image: '/images/nplace/malatang/reviews/2.jpg' },
    ],
    blogReviews: [
      { title: '입맛대로 골라먹는 마라탕의 매력', author: '푸드블로거', views: '3,789', date: '2023.05.10' },
      { title: '마라탕 맵기 단계별 도전기', author: '매운맛챌린지', views: '5,432', date: '2023.04.20' },
    ]
  },
  chicken: {
    images: [
      '/images/nplace/chicken/main/1.jpg',
      '/images/nplace/chicken/main/2.jpg',
      '/images/nplace/chicken/main/3.jpg',
      '/images/nplace/chicken/main/4.jpg',
      '/images/nplace/chicken/main/5.jpg',
    ],
    menus: [
      { name: '후라이드 치킨', price: '18,000원', image: '/images/nplace/chicken/menu/1.jpg' },
      { name: '양념 치킨', price: '19,000원', image: '/images/nplace/chicken/menu/2.jpg' },
      { name: '반반 치킨', price: '19,500원', image: '/images/nplace/chicken/menu/3.jpg' },
    ],
    coupons: [
      { title: '치킨 주문시 콜라 1.25L 증정', period: '상시' },
      { title: '2마리 주문시 5,000원 할인', period: '2023.06.01 ~ 2023.08.31' },
    ],
    posts: [
      { title: '신메뉴 출시 안내', date: '2023.06.20', content: '더 바삭하고 맛있는 신메뉴가 출시되었습니다.' },
    ],
    clips: [
      { title: '바삭함의 비밀', views: '6,789', date: '1주 전' },
      { title: '특제 양념의 황금비율', views: '4,567', date: '2주 전' },
    ],
    reviews: [
      { author: '치킨러버', rating: 5, content: '정말 바삭바삭하고 육즙이 살아있어요. 양념도 맛있어요!', date: '2주 전', image: '/images/nplace/chicken/reviews/1.jpg' },
      { author: '맥주와치킨', rating: 4, content: '반반 치킨이 좋아요. 매콤한 양념과 바삭한 후라이드를 같이 즐길 수 있어요.', date: '1개월 전', image: '/images/nplace/chicken/reviews/2.jpg' },
    ],
    blogReviews: [
      { title: '치맥의 성지를 찾아서', author: '치킨블로거', views: '5,678', date: '2023.05.15' },
      { title: '바삭함의 끝판왕, 진짜 맛있는 치킨집', author: '맛집탐험가', views: '4,321', date: '2023.04.25' },
    ]
  },
  pizza: {
    images: [
      '/images/nplace/pizza/main/1.jpg',
      '/images/nplace/pizza/main/2.jpg',
      '/images/nplace/pizza/main/3.jpg',
      '/images/nplace/pizza/main/4.jpg',
      '/images/nplace/pizza/main/5.jpg',
    ],
    menus: [
      { name: '페퍼로니 피자', price: '18,900원', image: '/images/nplace/pizza/menu/1.jpg' },
      { name: '콤비네이션 피자', price: '19,900원', image: '/images/nplace/pizza/menu/2.jpg' },
      { name: '포테이토 피자', price: '20,900원', image: '/images/nplace/pizza/menu/3.jpg' },
    ],
    coupons: [
      { title: 'L 사이즈 주문시 콜라 1.25L 증정', period: '상시' },
      { title: '온라인 주문 15% 할인', period: '2023.07.01 ~ 2023.09.30' },
    ],
    posts: [
      { title: '치즈 크러스트 무료 이벤트', date: '2023.06.25', content: '모든 피자에 치즈 크러스트 무료 업그레이드!' },
    ],
    clips: [
      { title: '쫄깃한 도우의 비밀', views: '3,456', date: '1주 전' },
      { title: '토핑 가득한 스페셜 피자', views: '5,678', date: '3주 전' },
    ],
    reviews: [
      { author: '피자매니아', rating: 5, content: '도우가 쫄깃하고 토핑이 풍성해요. 특히 치즈가 듬뿍 들어가서 좋아요!', date: '2주 전', image: '/images/nplace/pizza/reviews/1.jpg' },
      { author: '치즈러버', rating: 4, content: '치즈 크러스트가 정말 맛있어요. 도우도 바삭하고 쫄깃해요.', date: '1개월 전', image: '/images/nplace/pizza/reviews/2.jpg' },
    ],
    blogReviews: [
      { title: '피자 맛집의 숨겨진 보석', author: '맛집블로거', views: '4,567', date: '2023.05.25' },
      { title: '치즈 풍미가 살아있는 피자', author: '치즈덕후', views: '3,789', date: '2023.04.15' },
    ]
  },
};

// 기본 데이터 (모든 업종에 공통으로 적용)
const DEFAULT_DATA = {
  address: '대구 수성구 무학로 154',
  subway: '수성못역 1번 출구에서 402m',
  operationHours: '10:00에 영업 시작',
  phone: '053-939-8892',
};

// 디스플레이 설정 상수
const DISPLAY_CONFIG = {
  MAIN_IMAGES: 5,  // 메인 사진 개수 (큰 메인 1개 + 그리드 4개)
  MENU_ITEMS: 3,   // 메뉴 항목 개수
  REVIEWS: 2,      // 리뷰 개수
  BLOG_REVIEWS: 2  // 블로그 리뷰 개수
};

export default function NplaceAIPage() {
  const [animateIn, setAnimateIn] = useState(false);
  const [businessType, setBusinessType] = useState<BusinessTypeId>('korean');
  const [storeName, setStoreName] = useState('맛있는 가게');
  const [previewMode, setPreviewMode] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessData>(BUSINESS_DATA);
  const [reviewCount, setReviewCount] = useState<number>(288);
  const [blogReviewCount, setBlogReviewCount] = useState<number>(73);
  const [viewCount, setViewCount] = useState<number>(1200);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  
  // 조회수에 따른 현실적인 예상 데이터 계산
  const getEstimatedData = () => {
    // 업종별 전환율 계수 (조회수 → 방문)
    const conversionRateByType: Record<BusinessTypeId, number> = {
      korean: 0.026,
      chinese: 0.024,
      japanese: 0.028,
      western: 0.032,
      malatang: 0.025,
      chicken: 0.023,
      pizza: 0.021
    };
    
    // 업종별 평균 객단가
    const avgSpendingByType: Record<BusinessTypeId, number> = {
      korean: 15000,
      chinese: 12000,
      japanese: 22000,
      western: 25000,
      malatang: 13000,
      chicken: 18000,
      pizza: 17000
    };
    
    // 업종별 시간대 인기도
    const peakHoursByType: Record<BusinessTypeId, Record<string, string>> = {
      korean: { high: "12:00 ~ 13:30", low: "17:30 ~ 19:00" },
      chinese: { high: "12:00 ~ 13:00", low: "17:00 ~ 18:30" },
      japanese: { high: "18:00 ~ 20:00", low: "12:00 ~ 13:30" },
      western: { high: "19:00 ~ 21:00", low: "12:00 ~ 14:00" },
      malatang: { high: "17:30 ~ 19:30", low: "13:00 ~ 14:30" },
      chicken: { high: "19:00 ~ 22:00", low: "17:00 ~ 18:30" },
      pizza: { high: "18:00 ~ 21:00", low: "12:00 ~ 13:30" }
    };
    
    // 업종별 추천 키워드
    const keywordsByType: Record<BusinessTypeId, string[][]> = {
      korean: [
        ["가족모임", "한정식", "고기맛집"], 
        ["가성비", "정갈한", "단체가능"]
      ],
      chinese: [
        ["중화요리", "탕수육맛집", "짬뽕맛집"], 
        ["가성비", "배달가능", "혼밥"]
      ],
      japanese: [
        ["신선한", "오마카세", "데이트코스"], 
        ["가성비", "조용한", "인스타"]
      ],
      western: [
        ["와인", "스테이크", "분위기좋은"], 
        ["파스타", "샐러드", "데이트"]
      ],
      malatang: [
        ["마라맛집", "중국본토", "매운맛"], 
        ["재료다양", "셀프", "혼밥"]
      ],
      chicken: [
        ["치맥", "바삭한", "양념맛집"], 
        ["배달", "회식", "야식"]
      ],
      pizza: [
        ["치즈듬뿍", "도우맛집", "가족모임"], 
        ["배달", "파티", "사이드"]
      ]
    };
    
    // 현실적인 계산 로직
    const conversionRate = conversionRateByType[businessType];
    const dailyVisitors = Math.round(viewCount * conversionRate);
    const monthlyVisitors = Math.round(dailyVisitors * 30);
    
    // 리뷰 작성률 (방문자 중 약 2-4%가 리뷰 작성)
    const reviewRate = 0.02 + (viewCount > 2000 ? 0.02 : 0.01);
    const expectedReviews = Math.round(monthlyVisitors * reviewRate);
    
    // 테이블 회전율 (시간당 테이블 회전 횟수)
    const tableRotationRate = businessType === 'western' || businessType === 'japanese' ? 1.2 : 1.8;
    
    // 객단가
    const avgSpending = avgSpendingByType[businessType];
    
    // 월 매출 예상 (월방문자 × 객단가)
    const monthlyRevenue = monthlyVisitors * avgSpending;
    
    // 업종별 순위 산출
    const getRankByViews = () => {
      if (viewCount > 5000) return `상위 5% (우수)`;
      if (viewCount > 3000) return `상위 10% (우수)`;
      if (viewCount > 1500) return `상위 20% (양호)`;
      if (viewCount > 800) return `상위 35% (보통)`;
      return `상위 50% (노출 필요)`;
    };
    
    // 방문 시간대 인기도
    const peakHours = viewCount > 2000 
      ? peakHoursByType[businessType].high 
      : peakHoursByType[businessType].low;
    
    // 방문자 체류 시간
    const stayDuration = 
      businessType === 'western' ? '70~90분' : 
      businessType === 'japanese' ? '60~80분' : 
      businessType === 'korean' ? '50~70분' : 
      businessType === 'chinese' ? '40~60분' : 
      businessType === 'chicken' || businessType === 'pizza' ? '60~90분' : 
      '30~50분';
    
    // 예상 재방문율
    const returnRate = 
      viewCount > 3000 ? '32~38%' : 
      viewCount > 1500 ? '25~30%' : 
      '15~20%';
    
    // 키워드 추천
    const keywordIndex = viewCount > 1500 ? 0 : 1;
    const recommendedKeywords = keywordsByType[businessType][keywordIndex];
    
    return {
      dailyVisitors,
      monthlyVisitors,
      expectedReviews,
      tableRotationRate: tableRotationRate.toFixed(1) + '회/시간',
      avgSpending: avgSpending.toLocaleString() + '원',
      monthlyRevenue: Math.round(monthlyRevenue / 10000) + '만원',
      estimatedRank: getRankByViews(),
      peakHours,
      stayDuration,
      returnRate,
      recommendedKeywords,
      conversionRate: (conversionRate * 100).toFixed(1) + '%'
    };
  };
  
  const estimatedData = getEstimatedData();
  
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
      malatang: '마라왕 마라탕',
      chicken: '바삭바삭 치킨',
      pizza: '피자 플레이스'
    };
    
    setStoreName(businessTypeNames[businessType] || '맛있는 가게');
  }, [businessType]);

  // 업종에 따른 이미지 업데이트
  useEffect(() => {
    // 메인 이미지, 메뉴 이미지, 리뷰 이미지 등을 업데이트
    const mainImages = getRandomImages(businessType, 'main', DISPLAY_CONFIG.MAIN_IMAGES);
    const menuImages = getRandomImages(businessType, 'menu', DISPLAY_CONFIG.MENU_ITEMS);
    const reviewImages = getRandomImages(businessType, 'reviews', DISPLAY_CONFIG.REVIEWS);
    
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
            image: index < menuImages.length ? menuImages[index] : menu.image
          })),
          // 리뷰 이미지도 업데이트
          reviews: prevData[businessType].reviews.map((review, index) => ({
            ...review,
            image: index < reviewImages.length ? reviewImages[index] : review.image
          }))
        }
      };
    });
  }, [businessType]);

  // 이미지 로드 핸들러
  const handleImageLoad = (imagePath: string | undefined) => {
    if (!imagePath) return;
    setLoadedImages(prev => ({
      ...prev,
      [imagePath]: true
    }));
  };

  // 이미지 오류 핸들러
  const handleImageError = (imagePath: string | undefined) => {
    if (!imagePath) return;
    setLoadedImages(prev => ({
      ...prev,
      [imagePath]: false
    }));
  };

  // 이미지가 로드되었는지 확인
  const isImageLoaded = (imagePath: string | undefined) => {
    if (!imagePath) return false;
    return loadedImages[imagePath] === true;
  };

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
              
              {/* 조회수 입력 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  조회수 입력
                </label>
                <input 
                  type="number"
                  value={viewCount}
                  onChange={(e) => setViewCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-200"
                  min="0"
                  max="99999"
                  placeholder="월간 조회수 입력"
                />
                <p className="text-xs text-slate-400 mt-1">
                  월간 예상 조회수를 입력하세요. 조회수에 따라 예상 데이터가 계산됩니다.
                </p>
              </div>
              
              {/* 예상 데이터 표시 */}
              <div className="mt-4 bg-[#1D1D2D] rounded-lg p-4 border border-green-900/30">
                <h4 className="font-medium text-green-400 mb-2 flex items-center">
                  <span className="text-lg mr-2">📊</span> 조회수 기반 예상 분석
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">조회-방문 전환율:</span>
                    <span className="text-white font-medium">{estimatedData.conversionRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">일 평균 방문자:</span>
                    <span className="text-white font-medium">{estimatedData.dailyVisitors}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">월 방문자:</span>
                    <span className="text-white font-medium">{estimatedData.monthlyVisitors}명</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">객단가:</span>
                    <span className="text-white font-medium">{estimatedData.avgSpending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">월 예상 매출:</span>
                    <span className="text-white font-medium">{estimatedData.monthlyRevenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">예상 월간 리뷰:</span>
                    <span className="text-white font-medium">{estimatedData.expectedReviews}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">테이블 회전율:</span>
                    <span className="text-white font-medium">{estimatedData.tableRotationRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">평균 체류 시간:</span>
                    <span className="text-white font-medium">{estimatedData.stayDuration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">인기 시간대:</span>
                    <span className="text-white font-medium">{estimatedData.peakHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">재방문율:</span>
                    <span className="text-white font-medium">{estimatedData.returnRate}</span>
                  </div>
                  <div className="pt-1">
                    <div className="text-slate-400 mb-1">추천 키워드:</div>
                    <div className="flex flex-wrap gap-1">
                      {estimatedData.recommendedKeywords.map((keyword, idx) => (
                        <span key={idx} className="bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded text-xs">
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">업종 내 인기도:</span>
                    <span className={`font-medium ${
                      viewCount > 3000 ? 'text-green-400' : 
                      viewCount > 1000 ? 'text-yellow-400' : 'text-gray-400'
                    }`}>{estimatedData.estimatedRank}</span>
                  </div>
                </div>
              </div>
              
              {/* 방문자 리뷰 수 입력 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  방문자 리뷰 수
                </label>
                <input 
                  type="number"
                  value={reviewCount}
                  onChange={(e) => setReviewCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-200"
                  min="0"
                  max="9999"
                  placeholder="방문자 리뷰 수 입력"
                />
              </div>
              
              {/* 블로그 리뷰 수 입력 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  블로그 리뷰 수
                </label>
                <input 
                  type="number"
                  value={blogReviewCount}
                  onChange={(e) => setBlogReviewCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-200"
                  min="0"
                  max="9999"
                  placeholder="블로그 리뷰 수 입력"
                />
              </div>
              
              {/* 미리보기 버튼 */}
              <div className="pt-4">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`w-full px-4 py-2 ${previewMode 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500' 
                    : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500'} 
                    text-white rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-green-700/30 font-medium`}
                >
                  <span className="mr-2">{previewMode ? '✏️' : '👁️'}</span> 
                  {previewMode ? '편집 모드로 전환' : '네이버 플레이스 미리보기'}
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
              
              {/* 미리보기 모드 전환 메시지 */}
              {previewMode && (
                <div className="text-center bg-green-100 text-green-800 py-2 px-4 rounded-lg mb-4 animate-pulse">
                  미리보기 모드가 활성화되었습니다
                </div>
              )}
              
              {/* 모바일 화면 프레임 */}
              <div className={`max-w-sm mx-auto border-4 border-gray-800 rounded-3xl overflow-hidden bg-white shadow-xl ${previewMode ? 'ring-4 ring-green-400' : ''}`}>
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
                              onLoad={() => handleImageLoad(getBusinessData().images[0])}
                              onError={() => handleImageError(getBusinessData().images[0])}
                              className={isImageLoaded(getBusinessData().images[0]) ? 'opacity-100' : 'opacity-0'}
                            />
                            {!isImageLoaded(getBusinessData().images[0]) && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-500">
                                <span className="text-sm">{getBusinessTypeName()} 메인 이미지</span>
                              </div>
                            )}
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
                        {[1, 2, 3, 4].map((idx) => (
                          <div key={idx} className="bg-gray-300 border border-white relative">
                            {getBusinessData().images && getBusinessData().images[idx] ? (
                              <div className="w-full h-full relative">
                                <Image 
                                  src={getBusinessData().images[idx]}
                                  alt={`${getBusinessTypeName()} ${idx}`}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  onLoad={() => handleImageLoad(getBusinessData().images[idx])}
                                  onError={() => handleImageError(getBusinessData().images[idx])}
                                  className={isImageLoaded(getBusinessData().images[idx]) ? 'opacity-100' : 'opacity-0'}
                                />
                                {!isImageLoaded(getBusinessData().images[idx]) && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-500">
                                    <span className="text-xs">{getBusinessTypeName()} {idx}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                                {getBusinessTypeName()} {idx}
                              </div>
                            )}
                            {idx === 4 && (
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
                        <span>방문자 리뷰 {reviewCount}</span>
                        <span className="mx-2">•</span>
                        <span>블로그 리뷰 {blogReviewCount}</span>
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
                    
                    {/* 쿠폰 알림 */}
                    <div className="border-b">
                      <div className="m-4 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 pl-4">
                            <div className="text-green-600 text-sm font-medium pt-3">쿠폰이 있어요</div>
                            <div className="text-gray-800 font-medium py-2">[리뷰] 1일 무료 입장 쿠폰 외 1개</div>
                          </div>
                          <div className="pr-3">
                            <div className="py-2 px-3 text-green-600 text-sm font-medium">
                              모두<br/>보기
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 릴(영상) 섹션 */}
                    <div className="border-b">
                      <div className="m-4 bg-white rounded-lg overflow-hidden border border-gray-100">
                        <div className="flex">
                          {/* 릴 영상 썸네일 */}
                          <div className="w-1/3 h-24 relative bg-gray-200">
                            <div className="absolute top-2 left-2 rounded-full bg-red-500 text-white text-xs px-2 py-0.5">
                              알림
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                                <span className="text-white text-xl">▶</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* 릴 설명 */}
                          <div className="w-2/3 p-3">
                            <div className="text-gray-800 font-medium mb-2">
                              <span className="text-yellow-500 mr-1">📢</span>
                              하남스크린골프, 케이원골프아카데미!
                            </div>
                            <div className="text-gray-500 text-sm">
                              2025.03.26.
                            </div>
                          </div>
                        </div>
                      </div>
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
                        {getBusinessData().menus.slice(0, DISPLAY_CONFIG.MENU_ITEMS).map((menu, idx) => (
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
                                    onLoad={() => handleImageLoad(menu.image)}
                                    onError={() => handleImageError(menu.image)}
                                    className={isImageLoaded(menu.image) ? 'opacity-100' : 'opacity-0'}
                                  />
                                  {!isImageLoaded(menu.image) && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                                      <span className="text-xs">메뉴 이미지</span>
                                    </div>
                                  )}
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
                        {getBusinessData().reviews.slice(0, DISPLAY_CONFIG.REVIEWS).map((review, idx) => (
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
                            
                            {/* 리뷰 이미지 표시 (리뷰에 이미지가 있는 경우) */}
                            {review.image && (
                              <div className="mt-2 w-full h-32 relative rounded overflow-hidden">
                                <Image
                                  src={review.image}
                                  alt={`${review.author}의 리뷰 이미지`}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  onLoad={() => handleImageLoad(review.image)}
                                  onError={() => handleImageError(review.image)}
                                  className={isImageLoaded(review.image) ? 'opacity-100' : 'opacity-0'}
                                />
                                {!isImageLoaded(review.image) && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500">
                                    <span className="text-xs">리뷰 이미지</span>
                                  </div>
                                )}
                              </div>
                            )}
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
                        {getBusinessData().blogReviews.slice(0, DISPLAY_CONFIG.BLOG_REVIEWS).map((review, idx) => (
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