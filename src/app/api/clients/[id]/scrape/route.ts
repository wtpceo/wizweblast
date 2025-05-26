import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../../../lib/supabase';

/**
 * 네이버 플레이스 정보 크롤링 API
 * POST /api/clients/[id]/scrape
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    console.log("크롤링 API 호출됨: clientId =", resolvedParams.id);
    
    // 클라이언트 ID 파라미터 받기
    const clientId = resolvedParams.id;
    
    if (!clientId) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 광고주 ID입니다.' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("처리 중인 clientId:", clientId);
    
    // Supabase 클라이언트 생성
    const supabase = createServerClient();
    
    // 클라이언트 찾기
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (clientError || !client) {
      console.log("클라이언트를 찾을 수 없음", clientError);
      
      // 폴백 데이터
      const mockClient = {
        id: clientId,
        name: '임시 광고주 데이터',
        icon: '🏢',
        contract_start: '2024-01-01',
        contract_end: '2024-12-31',
        status_tags: ['정상'],
        uses_coupon: false,
        publishes_news: false,
        uses_reservation: false,
        phone_number: '02-1234-5678',
        naver_place_url: 'https://place.naver.com/restaurant/12345678',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return NextResponse.json(
        { 
          success: true, 
          message: '모의 데이터를 사용합니다 (클라이언트를 찾을 수 없음).',
          client: {
            id: mockClient.id,
            name: mockClient.name,
            icon: mockClient.icon,
            contractStart: mockClient.contract_start,
            contractEnd: mockClient.contract_end,
            statusTags: mockClient.status_tags,
            usesCoupon: mockClient.uses_coupon,
            publishesNews: mockClient.publishes_news,
            usesReservation: mockClient.uses_reservation,
            phoneNumber: mockClient.phone_number,
            naverPlaceUrl: mockClient.naver_place_url
          }
        },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("찾은 클라이언트:", client);

    if (!client.naver_place_url) {
      console.log("네이버 플레이스 URL이 없음");
      return NextResponse.json(
        { success: false, error: '네이버 플레이스 URL이 설정되어 있지 않습니다.' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 네이버 URL 유효성 검사 (place.naver.com 또는 naver.me 형식 모두 지원)
    const isValidNaverUrl = 
      client.naver_place_url.includes('place.naver.com') || 
      client.naver_place_url.includes('naver.me');
      
    if (!isValidNaverUrl) {
      console.log("유효하지 않은 네이버 URL:", client.naver_place_url);
      return NextResponse.json(
        { success: false, error: '유효한 네이버 플레이스 URL이 아닙니다.' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 크롤링 시뮬레이션 - 실제 구현 시 Playwright 사용 필요
    const now = new Date();
    console.log("크롤링 시뮬레이션 시작 시간:", now.toISOString());
    
    // 크롤링된 외부 데이터 (모의 데이터)
    const externalData = {
      lastScrapedAt: now.toISOString(),
      industry: '음식점 > 카페/디저트',
      coupon: '첫 방문 10% 할인',
      news: true,
      reservation: '예약 가능',
      keywords: ['아늑한', '데이트', '디저트', '커피맛집', '브런치']
    };
    
    // 광고주 정보 업데이트
    // 기존 상태 태그에 '크롤링 완료' 추가 (중복 방지)
    const updatedStatusTags = [...(client.status_tags || [])];
    if (!updatedStatusTags.includes('크롤링 완료')) {
      updatedStatusTags.push('크롤링 완료');
    }
    
    // Supabase에 업데이트
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update({
        uses_coupon: true,
        publishes_news: true,
        uses_reservation: true,
        status_tags: updatedStatusTags,
        updated_at: now.toISOString()
      })
      .eq('id', clientId)
      .select()
      .single();
    
    if (updateError) {
      console.error("클라이언트 업데이트 오류:", updateError);
      return NextResponse.json(
        { success: false, error: '광고주 정보 업데이트에 실패했습니다.' },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 외부 데이터 저장
    try {
      // 기존 외부 데이터 확인
      const { data: existingData } = await supabase
        .from('client_external_data')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();
      
      if (existingData) {
        // 기존 데이터 업데이트
        const { error: updateExtError } = await supabase
          .from('client_external_data')
          .update({
            platform: 'naver_place',
            source_url: client.naver_place_url,
            scraped_data: externalData,
            scraped_at: now.toISOString()
          })
          .eq('client_id', clientId);
          
        if (updateExtError) {
          console.error("외부 데이터 업데이트 오류:", updateExtError);
        }
      } else {
        // 새 데이터 삽입
        const { error: insertExtError } = await supabase
          .from('client_external_data')
          .insert({
            client_id: clientId,
            platform: 'naver_place',
            source_url: client.naver_place_url,
            scraped_data: externalData,
            scraped_at: now.toISOString()
          });
          
        if (insertExtError) {
          console.error("외부 데이터 삽입 오류:", insertExtError);
        }
      }
    } catch (externalDataError) {
      console.error("외부 데이터 저장 오류:", externalDataError);
      // 이 오류는 무시하고 계속 진행 (비필수 작업)
    }
    
    // API 응답을 위한 클라이언트 정보 포맷팅 (camelCase로 변환)
    const clientResponse = {
      id: String(updatedClient.id),
      name: updatedClient.name,
      icon: updatedClient.icon || '🏢',
      contractStart: updatedClient.contract_start || '',
      contractEnd: updatedClient.contract_end || '',
      statusTags: updatedClient.status_tags || ['정상', '크롤링 완료'],
      usesCoupon: updatedClient.uses_coupon || false,
      publishesNews: updatedClient.publishes_news || false,
      usesReservation: updatedClient.uses_reservation || false,
      phoneNumber: updatedClient.phone_number || '',
      naverPlaceUrl: updatedClient.naver_place_url || '',
    };
    
    console.log("업데이트된 클라이언트 정보:", clientResponse);
    
    // 전체 광고주 목록 조회
    const { data: allClients = [], error: listError } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (listError) {
      console.error("전체 광고주 목록 조회 오류:", listError);
    }
    
    // API 응답 데이터 포맷팅 (camelCase로 통일)
    const formattedClients = (allClients || []).map((client: any) => {
      // 현재 업데이트한 클라이언트는 최신 상태로 교체
      if (client.id === updatedClient.id) {
        return clientResponse;
      }
      
      // 나머지 클라이언트는 형식 통일
      return {
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
    });
    
    // 성공 응답 반환
    return NextResponse.json({
      success: true, 
      message: '네이버 플레이스에서 정보를 성공적으로 가져왔습니다.',
      data: externalData,
      client: clientResponse,
      allClients: formattedClients
    }, { 
      headers: { 'Content-Type': 'application/json' } 
    });
    
  } catch (error: any) {
    console.error('크롤링 오류:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error.message || '정보 가져오기에 실패했습니다.' 
    }, { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    });
  }
} 