import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '../../../../lib/supabase';

// 초기 데이터 (실제로는 데이터베이스를 사용해야 합니다)
const initialClients = [
  {
    id: '1',
    name: '샘플 광고주',
    icon: '🏢',
    contractStart: '2024-01-01',
    contractEnd: '2024-12-31',
    statusTags: ['정상'],
    usesCoupon: true,
    publishesNews: true,
    usesReservation: true,
    phoneNumber: '02-1234-5678',
    naverPlaceUrl: 'https://place.naver.com/restaurant/12345678'
  },
  {
    id: '2',
    name: '카페 드림',
    icon: '☕',
    contractStart: '2024-02-15',
    contractEnd: '2025-02-14',
    statusTags: ['정상'],
    usesCoupon: false,
    publishesNews: false,
    usesReservation: true,
    phoneNumber: '02-9876-5432',
    naverPlaceUrl: 'https://place.naver.com/restaurant/87654321'
  }
];

// 클라이언트 목록을 저장하고 불러오는 함수들
const getClientsFromStorage = () => {
  // 서버 사이드에서 실행 중인지 확인
  if (typeof window === 'undefined') {
    return initialClients;
  }
  
  try {
    const storedClients = localStorage.getItem('wizweblast_clients');
    return storedClients ? JSON.parse(storedClients) : initialClients;
  } catch (error) {
    console.error('클라이언트 데이터 로드 오류:', error);
    return initialClients;
  }
};

const saveClientsToStorage = (clients: any[]) => {
  // 서버 사이드에서 실행 중인지 확인
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('wizweblast_clients', JSON.stringify(clients));
  } catch (error) {
    console.error('클라이언트 데이터 저장 오류:', error);
  }
};

// 전역 변수로 클라이언트 목록 관리
let clients = getClientsFromStorage();

// 단일 광고주 조회 API
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("GET 광고주 조회 API 호출됨, clientId:", params.id);
    
    // 인증 검사를 임시로 비활성화 (개발 편의를 위함)
    /* 
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    */

    const clientId = params.id;
    
    if (!clientId) {
      return NextResponse.json(
        { error: '유효하지 않은 광고주 ID입니다.' },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = createServerClient();
    
    // Supabase에서 광고주 조회
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (error) {
      console.error('광고주 조회 Supabase 오류:', error);
      
      // 초기 데이터에서 찾기 (폴백)
      const mockClient = initialClients.find(c => c.id === clientId);
      if (mockClient) {
        console.log('초기 데이터에서 클라이언트 찾음:', mockClient);
        return NextResponse.json(mockClient);
      }
      
      return NextResponse.json(
        { error: '광고주를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    console.log("찾은 클라이언트:", client);
    
    if (!client) {
      console.log("클라이언트를 찾을 수 없음");
      return NextResponse.json(
        { error: '광고주를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // API 응답 데이터 포맷팅 (camelCase로 통일)
    const clientResponse = {
      id: String(client.id),
      name: client.name,
      icon: client.icon || '🏢',
      contractStart: client.contract_start || '',
      contractEnd: client.contract_end || '',
      statusTags: client.status_tags || ['정상'],
      usesCoupon: client.uses_coupon || false,
      publishesNews: client.publishes_news || false,
      usesReservation: client.uses_reservation || false,
      phoneNumber: client.phone_number || '',
      naverPlaceUrl: client.naver_place_url || '',
    };

    // camelCase 형식으로 일관되게 반환
    return NextResponse.json(clientResponse);
  } catch (error) {
    console.error('광고주 조회 오류:', error);
    
    // 오류가 발생해도 더미 데이터 반환
    const mockClient = initialClients[0];
    return NextResponse.json({
      ...mockClient,
      _error: '광고주 정보를 가져오는 중 오류가 발생했습니다. 임시 데이터를 표시합니다.'
    });
  }
}

// 광고주 정보 수정 API
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log('PUT API 요청 수신됨, 클라이언트 ID:', params.id);
    
    // 인증 검사를 임시로 비활성화 (개발 편의를 위함)
    /*
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    */
    
    const body = await request.json();
    console.log('요청 데이터:', body);
    
    const clientId = params.id;
    
    if (!clientId) {
      return NextResponse.json(
        { error: '유효하지 않은 광고주 ID입니다.' },
        { status: 400 }
      );
    }
    
    // camelCase 변수만 사용하도록 수정
    const name = body.name;
    const contractStart = body.contractStart || body.contract_start;
    const contractEnd = body.contractEnd || body.contract_end;
    const statusTags = body.statusTags || body.status_tags || [];
    const icon = body.icon;
    const usesCoupon = body.usesCoupon !== undefined ? body.usesCoupon : body.uses_coupon;
    const publishesNews = body.publishesNews !== undefined ? body.publishesNews : body.publishes_news;
    const usesReservation = body.usesReservation !== undefined ? body.usesReservation : body.uses_reservation;
    const phoneNumber = body.phoneNumber || body.phone_number;
    
    // URL 처리 - 네이버 미(me) 링크 형식도 지원
    let naverPlaceUrl = body.naverPlaceUrl || body.naver_place_url || '';
    // URL이 제공되었고 http로 시작하지 않는 경우 https:// 접두사 추가
    if (naverPlaceUrl && !naverPlaceUrl.startsWith('http')) {
      naverPlaceUrl = `https://${naverPlaceUrl}`;
    }

    // 필수 필드 검증
    if (!name || !contractStart || !contractEnd) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = createServerClient();
    
    // 기존 광고주 확인
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (checkError || !existingClient) {
      return NextResponse.json(
        { error: '광고주를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 광고주 정보 업데이트
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update({
        name,
        icon: icon || existingClient.icon,
        contract_start: contractStart,
        contract_end: contractEnd,
        status_tags: statusTags,
        uses_coupon: usesCoupon,
        publishes_news: publishesNews,
        uses_reservation: usesReservation,
        phone_number: phoneNumber,
        naver_place_url: naverPlaceUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .select()
      .single();

    if (updateError) {
      console.error('광고주 업데이트 오류:', updateError);
      return NextResponse.json(
        { error: '광고주 정보를 수정하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // API 응답 데이터 포맷팅 (camelCase로 통일)
    const clientResponse = {
      id: String(updatedClient.id),
      name: updatedClient.name,
      icon: updatedClient.icon || '🏢',
      contractStart: updatedClient.contract_start,
      contractEnd: updatedClient.contract_end,
      statusTags: updatedClient.status_tags || ['정상'],
      usesCoupon: updatedClient.uses_coupon || false,
      publishesNews: updatedClient.publishes_news || false,
      usesReservation: updatedClient.uses_reservation || false,
      phoneNumber: updatedClient.phone_number || '',
      naverPlaceUrl: updatedClient.naver_place_url || '',
    };

    console.log('업데이트된 클라이언트 정보:', clientResponse);
    return NextResponse.json({ client: clientResponse });
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
    // 인증 검사를 임시로 비활성화 (개발 편의를 위함)
    /*
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    */

    const clientId = params.id;
    
    if (!clientId) {
      return NextResponse.json(
        { error: '유효하지 않은 광고주 ID입니다.' },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 생성
    const supabase = createServerClient();
    
    // 기존 광고주 확인
    const { data: existingClient, error: checkError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (checkError || !existingClient) {
      return NextResponse.json(
        { error: '광고주를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 광고주 삭제
    const { error: deleteError } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (deleteError) {
      console.error('광고주 삭제 오류:', deleteError);
      return NextResponse.json(
        { error: '광고주를 삭제하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('광고주 삭제 오류:', error);
    return NextResponse.json(
      { error: '광고주를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 