import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// 임시 데이터 저장소 (실제로는 데이터베이스를 사용해야 합니다)
let clients = [
  {
    id: '1',
    name: '샘플 광고주',
    icon: '🏢',
    contract_start: '2024-01-01',
    contract_end: '2024-12-31',
    status_tags: ['정상'],
    uses_coupon: true,
    publishes_news: true,
    uses_reservation: true,
    phone_number: '02-1234-5678',
    naver_place_url: 'https://map.naver.com'
  }
];

// 광고주 목록 조회 API
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // URL에서 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // 필터링된 광고주 목록
    let filteredClients = [...clients];

    // 상태별 필터링
    if (status && status !== 'all') {
      filteredClients = filteredClients.filter(client => 
        client.status_tags.includes(status)
      );
    }

    // 검색어 필터링
    if (search) {
      const searchLower = search.toLowerCase();
      filteredClients = filteredClients.filter(client =>
        client.name.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json(filteredClients);
  } catch (error) {
    console.error('광고주 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '광고주 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 광고주 등록 API
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, contract_start, contract_end, status_tags, icon, uses_coupon, publishes_news, uses_reservation, phone_number, naver_place_url } = body;

    // 필수 필드 검증
    if (!name || !contract_start || !contract_end) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 새 광고주 생성
    const newClient = {
      id: String(clients.length + 1),
      name,
      icon: icon || '🏢',
      contract_start,
      contract_end,
      status_tags: status_tags || ['정상'],
      uses_coupon: uses_coupon || false,
      publishes_news: publishes_news || false,
      uses_reservation: uses_reservation || false,
      phone_number: phone_number || '',
      naver_place_url: naver_place_url || ''
    };

    // 임시 저장소에 추가
    clients.push(newClient);

    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error) {
    console.error('광고주 등록 오류:', error);
    return NextResponse.json(
      { error: '광고주 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 