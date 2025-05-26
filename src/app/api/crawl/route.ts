import { NextRequest, NextResponse } from 'next/server';
import { crawlWebPage } from '@/lib/playwright-service';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// 안전한 서버 클라이언트 생성 함수 (내부 함수로 사용)
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

// Supabase 클라이언트 설정 - 안전한 클라이언트 사용
const supabase = createSafeServerClient();

/**
 * 웹사이트 크롤링 API 엔드포인트
 * POST /api/crawl
 * 
 * body: {
 *   url: string,           // 크롤링할 URL
 *   type: string,          // 크롤링 유형 (naver_place, instagram, general)
 *   instagramUsername?: string, // 인스타그램 크롤링 시 필요한 사용자명
 *   clientId?: string,     // 결과를 저장할 클라이언트 ID (선택 사항)
 *   options?: object       // 추가적인 크롤링 옵션 (선택 사항)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, type = 'general', clientId, options = {} } = body;
    
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL이 필요합니다.' },
        { status: 400 }
      );
    }
    
    console.log(`크롤링 요청 - URL: ${url}, 타입: ${type}, 클라이언트 ID: ${clientId}`);
    
    // URL 형식 검증 및 전처리
    let processedUrl = url.trim();
    
    // http:// 또는 https:// 프로토콜이 없는 경우 추가
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    
    // 크롤링 실행
    const crawlOptions = {
      ...options,
      clientId,
      maxRetries: 2, // 실패 시 재시도 횟수
    };
    
    let result;
    try {
      result = await crawlWebPage(processedUrl, type, crawlOptions);
    } catch (crawlError: any) {
      console.error('첫 번째 크롤링 시도 실패, 다시 시도 중...', crawlError);
      
      // 일시 대기 후 다시 시도
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      try {
        result = await crawlWebPage(processedUrl, type, {
          ...crawlOptions,
          bypassCache: true // 캐시를 무시하고 새로운 요청
        });
      } catch (retryError: any) {
        return NextResponse.json(
          { 
            success: false, 
            error: '크롤링 실패 (재시도 후)', 
            message: retryError.message,
            url: processedUrl,
          },
          { status: 500 }
        );
      }
    }
    
    // 결과 저장
    if (result && clientId) {
      try {
        // 크롤링 결과를 Supabase에 저장
        const { error } = await supabase
          .from('crawl_results')
          .insert({
            client_id: clientId,
            url: processedUrl,
            crawl_type: type,
            result_data: result,
            created_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('크롤링 결과 저장 오류:', error);
        }
        
        // 네이버 플레이스 크롤링인 경우 클라이언트 상태 업데이트
        if (type === 'naver-place') {
          await updateClientStatusTags(clientId, result);
        }
      } catch (saveError) {
        console.error('크롤링 결과 저장 중 예외 발생:', saveError);
      }
    }
    
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('크롤링 API 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message || '크롤링 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 테스트용 GET 엔드포인트
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const type = request.nextUrl.searchParams.get('type') || 'general';
  
  if (!url) {
    return NextResponse.json(
      { success: false, error: 'URL 매개변수가 필요합니다.' },
      { status: 400 }
    );
  }
  
  // URL 전처리
  let processedUrl = url.trim();
  if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
    processedUrl = 'https://' + processedUrl;
  }
  
  try {
    const result = await crawlWebPage(processedUrl, type, {});
    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '크롤링 중 오류가 발생했습니다.',
        url: processedUrl
      },
      { status: 500 }
    );
  }
}

/**
 * 네이버 플레이스 크롤링 결과에 따라 클라이언트 상태 태그 업데이트
 */
async function updateClientStatusTags(clientId: string, crawlResult: any) {
  try {
    // 현재 클라이언트 태그 가져오기
    const { data: clientData, error: fetchError } = await supabase
      .from('clients')
      .select('id, tags')
      .eq('id', clientId)
      .single();
    
    if (fetchError) {
      console.error('클라이언트 데이터 조회 오류:', fetchError);
      return;
    }
    
    // 업데이트할 태그들
    let tags = clientData?.tags || [];
    
    // 쿠폰 사용 여부
    if (crawlResult.hasCoupon && !tags.includes('쿠폰사용')) {
      tags.push('쿠폰사용');
    }
    
    // 소식 발행 여부
    if (crawlResult.hasNews && !tags.includes('소식발행')) {
      tags.push('소식발행');
    }
    
    // 예약 시스템 여부
    if (crawlResult.hasReservation && !tags.includes('예약시스템')) {
      tags.push('예약시스템');
    }
    
    // 크롤링 완료 태그 추가
    if (!tags.includes('크롤링완료')) {
      tags.push('크롤링완료');
    }
    
    // 업데이트된 태그 저장
    const { error: updateError } = await supabase
      .from('clients')
      .update({ tags, last_crawled_at: new Date().toISOString() })
      .eq('id', clientId);
    
    if (updateError) {
      console.error('클라이언트 태그 업데이트 오류:', updateError);
    }
  } catch (error) {
    console.error('클라이언트 상태 태그 업데이트 오류:', error);
  }
} 