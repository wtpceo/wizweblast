import { NextResponse } from 'next/server';
import { createSafeServerClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const now = new Date();
    
    // RLS 정책을 우회하는 클라이언트 생성
    const supabaseAdmin = createSafeServerClient();
    
    // 전체 활성 광고주 조회
    const { data: allClients, error: totalError } = await supabaseAdmin
      .from('clients')
      .select('id, contract_end');
    
    if (totalError) {
      console.error('광고주 조회 오류:', totalError);
      return NextResponse.json({ error: '광고주 데이터 조회에 실패했습니다.' }, { status: 500 });
    }
    
    // 현재 활성화된 광고주만 필터링
    const activeClientIds = allClients
      .filter((client: any) => new Date(client.contract_end) >= now)
      .map((client: any) => client.id);
    
    // 민원 중인 광고주 조회
    const { data: complaintsData, error: complaintsError } = await supabaseAdmin
      .from('clients')
      .select('id, status_tags')
      .in('id', activeClientIds);
    
    if (complaintsError) {
      console.error('민원 광고주 조회 오류:', complaintsError);
      return NextResponse.json({ error: '민원 광고주 조회에 실패했습니다.' }, { status: 500 });
    }
    
    // 민원 중 태그가 있는 광고주 필터링
    const complaintsOngoingClients = (complaintsData || []).filter((client: any) => {
      return client.status_tags && 
        Array.isArray(client.status_tags) && 
        client.status_tags.includes('민원 중');
    });
    
    return NextResponse.json({ count: complaintsOngoingClients.length || 0 });
  } catch (error) {
    console.error('민원 중 광고주 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 