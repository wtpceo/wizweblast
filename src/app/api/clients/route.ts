import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 광고주 목록 조회 API
export async function GET(request: Request) {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('광고주 목록 조회 오류:', error);
      return NextResponse.json({ error: '광고주 목록을 가져오는 데 실패했습니다.' }, { status: 500 });
    }
    
    // 현재 날짜 기준으로 종료 임박 태그 추가
    const now = new Date();
    const enhancedData = data.map(client => {
      const contractEnd = new Date(client.contract_end);
      const daysDiff = Math.ceil((contractEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // 상태 태그 가공
      let statusTags = client.status_tags || [];
      
      // 계약 종료 7일 이내인 경우 '종료 임박' 태그 추가 (이미 있는 경우 제외)
      if (daysDiff <= 7 && daysDiff >= 0 && !statusTags.includes('종료 임박')) {
        statusTags = [...statusTags, '종료 임박'];
      }
      
      return {
        id: client.id,
        name: client.name,
        contractStart: client.contract_start,
        contractEnd: client.contract_end,
        statusTags: statusTags
      };
    });
    
    return NextResponse.json(enhancedData);
  } catch (error) {
    console.error('광고주 목록 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 광고주 등록 API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contractStart, contractEnd, statusTags = [] } = body;
    
    // 필수 필드 검증
    if (!name || !contractStart || !contractEnd) {
      return NextResponse.json(
        { error: '업체명, 계약 시작일, 계약 종료일은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 날짜 유효성 검증
    const startDate = new Date(contractStart);
    const endDate = new Date(contractEnd);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: '유효하지 않은 날짜 형식입니다.' },
        { status: 400 }
      );
    }
    
    // 광고주 데이터 삽입
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name,
        contract_start: contractStart,
        contract_end: contractEnd,
        status_tags: statusTags
      })
      .select();
    
    if (error) {
      console.error('광고주 등록 오류:', error);
      return NextResponse.json({ error: '광고주 등록에 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, client: data[0] });
  } catch (error) {
    console.error('광고주 등록 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 