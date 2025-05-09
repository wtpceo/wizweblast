import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PlaywrightService } from '@/lib/playwright-service';

// 외부 플랫폼에서 정보 수집 API
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;
    const body = await request.json();
    const { targetUrl, platform = 'naver_place' } = body;
    
    // 필수 필드 검증
    if (!targetUrl) {
      return NextResponse.json(
        { error: '수집 대상 URL은 필수입니다.' },
        { status: 400 }
      );
    }
    
    // 광고주 존재 여부 확인
    const { data: clientExists, error: clientError } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', clientId)
      .single();
    
    if (clientError || !clientExists) {
      return NextResponse.json({ error: '존재하지 않는 광고주입니다.' }, { status: 404 });
    }
    
    // Playwright 서비스 초기화
    const playwrightService = new PlaywrightService();
    
    // 플랫폼에 따른 스크래핑 수행
    let scrapedData;
    try {
      scrapedData = await playwrightService.scrapeData(targetUrl);
    } catch (error: any) {
      await playwrightService.close();
      console.error('크롤링 실패:', error);
      return NextResponse.json(
        { error: `크롤링 과정에서 오류가 발생했습니다: ${error.message}` },
        { status: 500 }
      );
    } finally {
      await playwrightService.close();
    }
    
    // 수집된 데이터 DB 저장
    const { data: savedData, error: saveError } = await supabase
      .from('client_external_data')
      .insert({
        client_id: clientId,
        platform,
        source_url: targetUrl,
        scraped_data: scrapedData,
        scraped_at: new Date().toISOString()
      })
      .select();
    
    if (saveError) {
      console.error('수집 데이터 저장 오류:', saveError);
      return NextResponse.json(
        { error: '수집된 데이터를 저장하는 데 실패했습니다.' },
        { status: 500 }
      );
    }
    
    // 응답
    return NextResponse.json({
      success: true,
      message: '외부 플랫폼 데이터가 성공적으로 수집되었습니다.',
      data: scrapedData
    });
  } catch (error) {
    console.error('크롤링 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 