import { NextResponse } from 'next/server';
import { createSafeServerClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(now.getDate() + 30);
    
    // RLS 정책을 우회하는 클라이언트 생성
    const supabaseAdmin = createSafeServerClient();
    
    // 전체 광고주 수 조회
    const { data: allClients, error: totalError } = await supabaseAdmin
      .from('clients')
      .select('id, contract_end');
    
    if (totalError) {
      console.error('광고주 데이터 조회 오류:', totalError);
      return NextResponse.json({ error: '광고주 데이터 조회에 실패했습니다.' }, { status: 500 });
    }
    
    // 계약 종료 임박 광고주 필터링 (현재 <= 계약종료일 <= 30일 후)
    const soonExpireClients = allClients.filter((client: any) => {
      const contractEnd = new Date(client.contract_end);
      return contractEnd <= thirtyDaysLater && contractEnd >= now;
    });
    
    return NextResponse.json({ count: soonExpireClients.length || 0 });
  } catch (error) {
    console.error('곧 종료 예정 광고주 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 