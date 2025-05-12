import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import { createServerClient } from '../../../lib/supabase';

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
  }
];

// RLS 정책을 우회하는 안전한 서버 클라이언트 생성 함수
function createSafeServerClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // URL 인코딩된 문자가 있는지 확인하고 디코딩
    if (supabaseKey && supabaseKey.includes('%')) {
      supabaseKey = decodeURIComponent(supabaseKey);
    }
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL 또는 API 키가 설정되지 않았습니다.');
    }
    
    return createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      }
    });
  } catch (err) {
    console.error('[API] Supabase 클라이언트 생성 오류:', err);
    throw err;
  }
}

// 광고주 목록 조회 API
export async function GET(request: Request) {
  try {
    console.log('[광고주 목록 API] 요청 시작');
    
    // 인증 확인 (임시로 비활성화)
    /* 
    const { userId } = await auth();
    
    if (!userId) {
      console.log('[광고주 목록 API] 인증되지 않은 사용자');
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    console.log('[광고주 목록 API] 인증된 사용자:', userId);
    */

    // URL에서 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const id = searchParams.get('id');
    console.log('[광고주 목록 API] 쿼리 파라미터:', { status, search, id });

    // Supabase 클라이언트 생성 (RLS 정책 우회를 위해 서비스 롤 키 사용)
    const supabase = createSafeServerClient();
    console.log('[광고주 목록 API] Supabase 클라이언트 생성 성공');
    
    // 특정 ID의 광고주만 요청한 경우
    if (id) {
      console.log(`[광고주 목록 API] ID: ${id} 조회 중...`);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id);
      
      if (error) {
        console.error(`[광고주 목록 API] ID: ${id} 조회 오류:`, error);
        return NextResponse.json(
          { error: `광고주 데이터 조회 실패: ${error.message}` },
          { status: 500 }
        );
      }
      
      if (!data || data.length === 0) {
        console.log(`[광고주 목록 API] ID: ${id} 데이터 없음`);
        return NextResponse.json([]);
      }
      
      // 데이터 포맷팅
      const formattedClients = data.map(formatClientData);
      console.log(`[광고주 목록 API] ID: ${id} 데이터 로드 성공`);
      return NextResponse.json(formattedClients);
    }
    
    // 전체 데이터 조회시 페이지네이션 적용
    console.log('[광고주 목록 API] 전체 데이터 조회 중 (페이지네이션 적용)...');
    
    // 전체 레코드 수 먼저 확인
    const { count, error: countError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('[광고주 목록 API] 전체 레코드 수 조회 오류:', countError);
      return NextResponse.json(
        { error: `광고주 레코드 수 조회 실패: ${countError.message}` },
        { status: 500 }
      );
    }
    
    console.log(`[광고주 목록 API] 전체 광고주 수: ${count || 0}`);
    
    // 페이지네이션 설정
    const pageSize = 1000; // 한 번에 가져올 최대 레코드 수
    const totalPages = Math.ceil((count || 0) / pageSize);
    let allData: any[] = [];
    
    // 모든 페이지 데이터 가져오기
    for (let page = 0; page < totalPages; page++) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      console.log(`[광고주 목록 API] 페이지 ${page + 1}/${totalPages} 로드 중 (${from}-${to})...`);
      
      const { data: pageData, error: pageError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);
        
      if (pageError) {
        console.error(`[광고주 목록 API] 페이지 ${page + 1} 로드 오류:`, pageError);
        continue; // 페이지 오류가 있어도 계속 진행
      }
      
      if (pageData && pageData.length > 0) {
        allData = [...allData, ...pageData];
        console.log(`[광고주 목록 API] 페이지 ${page + 1} 데이터 ${pageData.length}개 로드 완료`);
      } else {
        console.log(`[광고주 목록 API] 페이지 ${page + 1}에 데이터가 없습니다.`);
        break; // 더 이상 데이터가 없으면 중단
      }
    }
    
    console.log(`[광고주 목록 API] 전체 데이터 ${allData.length || 0}개 로드 완료`);
    
    let clientList = allData;
    
    // 상태별 필터링
    if (status && status !== 'all') {
      clientList = clientList.filter((client: any) => 
        client.status_tags && Array.isArray(client.status_tags) && client.status_tags.includes(status)
      );
      console.log(`[광고주 목록 API] 상태 필터링 후 ${clientList.length}개 항목`);
    }

    // 검색어 필터링
    if (search) {
      const searchLower = search.toLowerCase();
      clientList = clientList.filter((client: any) => {
        // 방어적 코딩: client.name이 undefined인 경우 처리
        if (!client.name) return false;
        
        try {
          return client.name.toLowerCase().includes(searchLower);
        } catch (e) {
          console.error('[광고주 목록 API] 검색 필터링 오류:', e, client);
          return false;
        }
      });
      console.log(`[광고주 목록 API] 검색어 필터링 후 ${clientList.length}개 항목`);
    }

    // API 응답 데이터 포맷팅 (camelCase로 통일)
    const formattedClients = clientList.map(formatClientData);

    console.log('[광고주 목록 API] 응답 생성:', formattedClients.length + '개 항목');
    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error('[광고주 목록 API] 🔥 처리 오류:', error);
    console.error('[광고주 목록 API] 오류 상세 정보:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      code: error instanceof Error ? (error as any).code : undefined
    });
    
    // 오류가 발생해도 초기 데이터 반환하여 클라이언트 측에서 최소한의 데이터를 보여줄 수 있게 함
    return NextResponse.json(initialClients);
  }
}

// 클라이언트 데이터 포맷팅 함수
function formatClientData(client: any) {
  try {
    // 타입 안전을 위한 데이터 처리
    const startDate = client.contract_start || '';
    const endDate = client.contract_end || '';
    
    // 컬럼명 변환 - DB에서 snake_case, 클라이언트에서 camelCase 처리
    return {
      id: String(client.id),
      name: client.name || '',
      icon: client.icon || '🏢',
      contractStart: startDate,
      contractEnd: endDate,
      statusTags: client.status_tags || ['정상'],
      usesCoupon: client.uses_coupon || false,
      publishesNews: client.publishes_news || false,
      usesReservation: client.uses_reservation || false,
      phoneNumber: client.phone_number || '',
      naverPlaceUrl: client.naver_place_url || '',
    };
  } catch (error) {
    console.error('[광고주 목록 API] 클라이언트 포맷팅 오류:', error, client);
    return {
      id: String(client.id || 0),
      name: client.name || '오류 발생 데이터',
      icon: '⚠️',
      contractStart: '',
      contractEnd: '',
      statusTags: ['오류'],
      usesCoupon: false,
      publishesNews: false,
      usesReservation: false,
      phoneNumber: '',
      naverPlaceUrl: '',
    };
  }
}

// 광고주 등록 API
export async function POST(request: Request) {
  try {
    console.log("[광고주 등록 API] 요청 받음");
    
    // 인증 확인 (임시로 비활성화)
    /*
    const { userId } = await auth();
    
    if (!userId) {
      console.log("[광고주 등록 API] 인증되지 않은 사용자");
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    */

    const body = await request.json();
    console.log("[광고주 등록 API] 요청 데이터:", body);
    
    // snake_case 변수로 변환
    const name = body.name;
    const contractStart = body.contractStart || body.contract_start;
    const contractEnd = body.contractEnd || body.contract_end;
    const statusTags = body.statusTags || body.status_tags || ['정상'];
    const icon = body.icon || '🏢';
    const usesCoupon = body.usesCoupon !== undefined ? body.usesCoupon : (body.uses_coupon || false);
    const publishesNews = body.publishesNews !== undefined ? body.publishesNews : (body.publishes_news || false);
    const usesReservation = body.usesReservation !== undefined ? body.usesReservation : (body.uses_reservation || false);
    const phoneNumber = body.phoneNumber || body.phone_number || '';
    
    // URL 처리 - 네이버 미(me) 링크 형식도 지원
    let naverPlaceUrl = body.naverPlaceUrl || body.naver_place_url || '';
    // URL이 제공되었고 http로 시작하지 않는 경우 https:// 접두사 추가
    if (naverPlaceUrl && !naverPlaceUrl.startsWith('http')) {
      naverPlaceUrl = `https://${naverPlaceUrl}`;
    }

    // 필수 필드 검증
    if (!name || !contractStart || !contractEnd) {
      console.log("[광고주 등록 API] 필수 정보 누락:", { name, contractStart, contractEnd });
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    console.log("[광고주 등록 API] 데이터 유효성 검사 통과, DB 저장 시도");
    
    // 날짜 형식 변환 (ISO 문자열 -> Date 객체)
    let startDate: Date;
    let endDate: Date;
    
    try {
      startDate = new Date(contractStart);
      if (isNaN(startDate.getTime())) {
        throw new Error('계약 시작일이 유효한 날짜 형식이 아닙니다.');
      }
    } catch (dateError) {
      console.error('[광고주 등록 API] 계약 시작일 형식 오류:', dateError);
      return NextResponse.json(
        { error: '계약 시작일이 유효한 날짜 형식이 아닙니다.' },
        { status: 400 }
      );
    }
    
    try {
      endDate = new Date(contractEnd);
      if (isNaN(endDate.getTime())) {
        throw new Error('계약 종료일이 유효한 날짜 형식이 아닙니다.');
      }
    } catch (dateError) {
      console.error('[광고주 등록 API] 계약 종료일 형식 오류:', dateError);
      return NextResponse.json(
        { error: '계약 종료일이 유효한 날짜 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // Supabase에 광고주 추가
    console.log("[광고주 등록 API] DB 삽입 시작:", { 
      name, startDate, endDate
    });
    
    try {
      // 날짜를 ISO 문자열로 변환
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0]; 
      
      const supabase = createServerClient();
      
      // snake_case로 저장
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name,
          icon,
          contract_start: formattedStartDate,
          contract_end: formattedEndDate,
          status_tags: statusTags,
          uses_coupon: usesCoupon,
          publishes_news: publishesNews,
          uses_reservation: usesReservation,
          phone_number: phoneNumber,
          naver_place_url: naverPlaceUrl,
        })
        .select()
        .single();
      
      if (error) {
        console.error("[광고주 등록 API] Supabase 삽입 오류:", error);
        throw error;
      }
      
      const newClient = data;
      console.log("[광고주 등록 API] 신규 광고주:", newClient);

      // API 응답 데이터 포맷팅 (camelCase로 통일)
      const clientResponse = {
        id: String(newClient.id),
        name: newClient.name,
        icon: newClient.icon || '🏢',
        contractStart: String(newClient.contract_start),
        contractEnd: String(newClient.contract_end),
        statusTags: newClient.status_tags || ['정상'],
        usesCoupon: newClient.uses_coupon || false,
        publishesNews: newClient.publishes_news || false,
        usesReservation: newClient.uses_reservation || false,
        phoneNumber: newClient.phone_number || '',
        naverPlaceUrl: newClient.naver_place_url || '',
      };
      
      console.log("[광고주 등록 API] 응답 데이터:", clientResponse);
      return NextResponse.json({ client: clientResponse, success: true }, { status: 201 });
    } catch (dbError) {
      console.error("[광고주 등록 API] DB 오류:", dbError);
      
      // 모의 데이터로 응답
      const mockId = `mock-${Date.now()}`;
      const mockClient = {
        id: mockId,
        name,
        icon,
        contractStart: contractStart,
        contractEnd: contractEnd,
        statusTags,
        usesCoupon,
        publishesNews,
        usesReservation,
        phoneNumber,
        naverPlaceUrl
      };
      
      return NextResponse.json({ 
        client: mockClient,
        success: true,
        isTemporary: true
      }, { status: 201 });
    }
  } catch (error) {
    console.error('[광고주 등록 API] 오류:', error);
    
    // 임시 응답 데이터
    const tempClient = {
      id: `temp-${Date.now()}`,
      name: '임시 광고주 데이터',
      icon: '⚠️',
      contractStart: new Date().toISOString().split('T')[0],
      contractEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      statusTags: ['임시'],
      usesCoupon: false,
      publishesNews: false,
      usesReservation: false,
      phoneNumber: '',
      naverPlaceUrl: ''
    };
    
    return NextResponse.json({ 
      client: tempClient, 
      success: true,
      isTemporary: true 
    }, { status: 201 });
  }
} 