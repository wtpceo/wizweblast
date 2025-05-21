import { NextResponse } from 'next/server';
import { createSafeServerClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const now = new Date();
    
    // RLS 정책을 우회하는 클라이언트 생성
    const supabaseAdmin = createSafeServerClient();
    
    // 전체 광고주 수 조회
    const { data: allClients, error: totalError } = await supabaseAdmin
      .from('clients')
      .select('id, contract_end');
    
    if (totalError) {
      console.error('전체 광고주 수 조회 오류:', totalError);
      return NextResponse.json({ error: '광고주 데이터 조회에 실패했습니다.' }, { status: 500 });
    }
    
    // 종료된 광고주 필터링 (contract_end < 현재 날짜)
    const activeClients = allClients.filter((client: any) => {
      const contractEnd = new Date(client.contract_end);
      return contractEnd >= now;
    });
    
    return NextResponse.json({ count: activeClients.length || 0 });
  } catch (error) {
    console.error('총 광고주 수 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 