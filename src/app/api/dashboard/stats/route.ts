import { NextResponse } from 'next/server';
import { createSafeServerClient } from '../../../../lib/supabase-server';

// 대시보드 통계 API
export async function GET(request: Request) {
  try {
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(now.getDate() + 30);
    
    // RLS 정책을 우회하는 클라이언트 생성
    const supabaseAdmin = createSafeServerClient();
    
    // 1. 전체 광고주 수 조회
    const { data: allClients, error: totalError } = await supabaseAdmin
      .from('clients')
      .select('id, contract_end');
    
    if (totalError) {
      console.error('전체 광고주 수 조회 오류:', totalError);
      return NextResponse.json({ error: '통계 데이터 조회에 실패했습니다.' }, { status: 500 });
    }
    
    // 종료된 광고주 필터링 (contract_end < 현재 날짜)
    const activeClients = allClients.filter((client: any) => {
      const contractEnd = new Date(client.contract_end);
      return contractEnd >= now;
    });
    
    // 2. 계약 종료 임박 광고주 수 조회 (D-30일 이하)
    const nearExpiryClients = activeClients.filter((client: any) => {
      const contractEnd = new Date(client.contract_end);
      return contractEnd <= thirtyDaysLater && contractEnd >= now;
    });
    
    // 3. 관리 소홀 광고주 데이터 조회 (최근 활동이 5일 이상 없는 경우)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(now.getDate() - 5);
    
    // 최근 활동이 없는 광고주 조회 (last_activity_at 기준)
    const { data: poorManagedClientsData, error: poorManagedError } = await supabaseAdmin
      .from('clients')
      .select('id, name, last_activity_at')
      .lt('last_activity_at', fiveDaysAgo.toISOString())
      .in('id', activeClients.map((client: any) => client.id));
    
    if (poorManagedError) {
      console.error('관리 소홀 광고주 조회 오류:', poorManagedError);
    }
    
    // 관리 소홀 광고주 ID 목록
    const poorManagedClientIds = (poorManagedClientsData || []).map((client: any) => client.id);
    const poorManagedCount = poorManagedClientIds.length;
    
    // 4. 민원 진행 중인 광고주 수 조회
    const { data: complaintsData, error: complaintsError } = await supabaseAdmin
      .from('clients')
      .select('id, status_tags')
      .in('id', activeClients.map((client: any) => client.id));
    
    if (complaintsError) {
      console.error('민원 광고주 조회 오류:', complaintsError);
    }
    
    // 민원 중 태그가 있는 광고주 필터링
    const complaintsOngoingClients = (complaintsData || []).filter((client: any) => {
      return client.status_tags && 
        Array.isArray(client.status_tags) && 
        client.status_tags.includes('민원 중');
    });
    
    // 통계 데이터 응답
    const dashboardStats = {
      totalClients: activeClients.length || 0,
      nearExpiry: nearExpiryClients.length || 0,
      poorManaged: poorManagedCount || 0,
      complaintsOngoing: complaintsOngoingClients.length || 0,
      // 관리 소홀 광고주 ID 목록 추가
      poorManagedClientIds: poorManagedClientIds
    };
    
    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error('대시보드 통계 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 