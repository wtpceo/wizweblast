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

// 단일 광고주 조회 API
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const client = clients.find(c => c.id === params.id);
    
    if (!client) {
      return NextResponse.json(
        { error: '광고주를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('광고주 조회 오류:', error);
    return NextResponse.json(
      { error: '광고주 정보를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 광고주 정보 수정 API
export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    const clientIndex = clients.findIndex(c => c.id === params.id);
    
    if (clientIndex === -1) {
      return NextResponse.json(
        { error: '광고주를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 광고주 정보 업데이트
    clients[clientIndex] = {
      ...clients[clientIndex],
      name,
      contract_start,
      contract_end,
      status_tags: status_tags || clients[clientIndex].status_tags,
      icon: icon || clients[clientIndex].icon,
      uses_coupon: uses_coupon ?? clients[clientIndex].uses_coupon,
      publishes_news: publishes_news ?? clients[clientIndex].publishes_news,
      uses_reservation: uses_reservation ?? clients[clientIndex].uses_reservation,
      phone_number: phone_number || clients[clientIndex].phone_number,
      naver_place_url: naver_place_url || clients[clientIndex].naver_place_url
    };

    return NextResponse.json({ client: clients[clientIndex] });
  } catch (error) {
    console.error('광고주 수정 오류:', error);
    return NextResponse.json(
      { error: '광고주 정보를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 광고주 삭제 API
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const clientIndex = clients.findIndex(c => c.id === params.id);
    
    if (clientIndex === -1) {
      return NextResponse.json(
        { error: '광고주를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 광고주 삭제
    clients.splice(clientIndex, 1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('광고주 삭제 오류:', error);
    return NextResponse.json(
      { error: '광고주를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 