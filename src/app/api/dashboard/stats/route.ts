import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 대시보드 통계 API
export async function GET(request: Request) {
  try {
    const now = new Date();
    const oneWeekLater = new Date();
    oneWeekLater.setDate(now.getDate() + 7);
    
    // 1. 전체 광고주 수 조회
    const { count: totalClients, error: totalError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) {
      console.error('전체 광고주 수 조회 오류:', totalError);
      return NextResponse.json({ error: '통계 데이터 조회에 실패했습니다.' }, { status: 500 });
    }
    
    // 2. 계약 종료 임박 광고주 수 조회 (7일 이내)
    const { count: nearExpiry, error: expiryError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .lte('contract_end', oneWeekLater.toISOString())
      .gte('contract_end', now.toISOString());
    
    // 3. 관리 소홀 광고주 수 조회
    const { count: poorManaged, error: poorError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .contains('status_tags', ['관리 소홀']);
    
    // 4. 민원 진행 중인 광고주 수 조회
    const { count: complaintsOngoing, error: complaintsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .contains('status_tags', ['민원 중']);
    
    // 통계 데이터 응답
    const dashboardStats = {
      totalClients: totalClients || 0,
      nearExpiry: nearExpiry || 0,
      poorManaged: poorManaged || 0,
      complaintsOngoing: complaintsOngoing || 0
    };
    
    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error('대시보드 통계 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 