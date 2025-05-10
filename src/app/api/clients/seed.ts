import { createServerClient } from '../../../lib/supabase';

// 시드 데이터
const seedClients = [
  {
    name: '카페 드림',
    icon: '☕',
    contract_start: '2024-01-15',
    contract_end: '2024-12-31',
    status_tags: ['정상', '우수'],
    uses_coupon: true,
    publishes_news: true,
    uses_reservation: true,
    phone_number: '02-1234-5678',
    naver_place_url: 'https://place.naver.com/restaurant/example1'
  },
  {
    name: '멋진 헤어샵',
    icon: '💇',
    contract_start: '2024-02-01',
    contract_end: '2024-08-31',
    status_tags: ['종료 임박', '관리 소홀'],
    uses_coupon: false,
    publishes_news: false,
    uses_reservation: true,
    phone_number: '02-9876-5432',
    naver_place_url: 'https://place.naver.com/restaurant/example2'
  },
  {
    name: '피자왕',
    icon: '🍕',
    contract_start: '2024-03-10',
    contract_end: '2025-03-09',
    status_tags: ['정상'],
    uses_coupon: true,
    publishes_news: false,
    uses_reservation: false,
    phone_number: '02-5555-1234',
    naver_place_url: 'https://place.naver.com/restaurant/example3'
  }
];

// 시드 데이터 추가 함수
export async function seedClientData() {
  try {
    const supabase = createServerClient();
    
    // 기존 데이터 확인
    const { data: existingClients, error: countError } = await supabase
      .from('clients')
      .select('*');
    
    if (countError) {
      console.error('기존 데이터 확인 오류:', countError);
      return {
        success: false,
        error: countError.message
      };
    }
    
    // 이미 데이터가 있으면 추가하지 않음
    if (existingClients && existingClients.length > 0) {
      return {
        success: true,
        message: `이미 ${existingClients.length}개의 데이터가 있습니다. 추가 작업을 건너뜁니다.`,
        existingCount: existingClients.length,
      };
    }
    
    // 데이터 추가
    const { data, error } = await supabase
      .from('clients')
      .insert(seedClients)
      .select();
    
    if (error) {
      console.error('시드 데이터 추가 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      message: `${data.length}개의 시드 데이터가 추가되었습니다.`,
      addedCount: data.length,
    };
  } catch (error) {
    console.error('시드 함수 실행 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 