import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function GET(request: Request) {
  try {
    // Supabase 클라이언트 생성
    const supabase = createServerClient();
    
    // 테이블 구조 정보 조회
    console.log('테이블 구조 정보 조회 시도');
    const { data: tableInfo, error: tableError } = await supabase
      .from('clients')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('테이블 정보 조회 오류:', tableError);
      return NextResponse.json(
        { error: `테이블 조회 실패: ${tableError.message}` },
        { status: 500 }
      );
    }
    
    // 테이블에 레코드 존재하는지 확인
    if (!tableInfo || tableInfo.length === 0) {
      console.log('테이블에 레코드가 없습니다');
      
      // 샘플 데이터 생성
      const { data: insertedData, error: insertError } = await supabase
        .from('clients')
        .insert({
          name: '테스트 광고주',
          contract_start: '2024-06-01',
          contract_end: '2025-06-01',
          status_tags: ['정상'],
          icon: '🏢',
          uses_coupon: false,
          publishes_news: false,
          uses_reservation: false,
          phone_number: '010-1234-5678',
          naver_place_url: 'https://example.com'
        })
        .select();
      
      if (insertError) {
        console.error('샘플 데이터 삽입 오류:', insertError);
        return NextResponse.json(
          { error: `샘플 데이터 생성 실패: ${insertError.message}` },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        message: '샘플 데이터를 생성했습니다',
        data: insertedData
      });
    }
    
    // 테이블 구조 조회 (컬럼 정보)
    let tableStructureInfo = {};
    try {
      const { data } = await supabase.rpc('get_table_info', { table_name: 'clients' });
      if (data) {
        tableStructureInfo = { columns: data };
      }
    } catch (structureError) {
      console.warn('테이블 구조 조회 실패:', structureError);
    }
    
    return NextResponse.json({
      message: '테이블 정보를 성공적으로 가져왔습니다',
      data: tableInfo,
      tableStructure: tableStructureInfo
    });
  } catch (error) {
    console.error('API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 