import { chromium, Page } from 'playwright';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 크롤링 결과 타입 정의
export interface CrawlResult {
  [key: string]: any;
  type: string;
  url: string;
  metadata: {
    crawledAt: string;
    clientId: string | null;
  };
}

export type NaverPlaceData = {
  placeName: string;
  address: string;
  phone: string | null;
  categories: string[];
  openingHours: string[];
  menus: Array<{ name: string; price: string }>;
  images: string[];
  hasReservation: boolean;
  hasCoupon: boolean;
  hasNews: boolean;
};

/**
 * 웹 페이지를 크롤링하는 공통 함수
 */
export async function crawlWebPage(url: string, crawlType: string, options: any = {}): Promise<CrawlResult> {
  const browser = await chromium.launch({ 
    headless: true,
    timeout: 60000 // 브라우저 시작 타임아웃 증가
  });
  
  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      viewport: { width: 1280, height: 800 }, // 뷰포트 설정 추가
      // 타임아웃 설정 증가
      timezoneId: 'Asia/Seoul', // 한국 시간대 설정
      locale: 'ko-KR', // 한국어 로케일 설정
    });
    const page = await context.newPage();
    
    // 전역 타임아웃 설정
    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(60000);
    
    console.log(`크롤링 시작: ${url}, 타입: ${crawlType}`);
    
    // 네트워크 이벤트 모니터링
    page.on('request', req => console.log(`요청 시작: ${req.url().substring(0, 100)}...`));
    page.on('response', res => console.log(`응답 수신: ${res.url().substring(0, 100)}... (${res.status()})`));
    page.on('requestfailed', req => console.log(`요청 실패: ${req.url().substring(0, 100)}...`));
    
    // 네이버 맵 URL을 플레이스 URL로 변환 (지도 URL 처리)
    let isNaverMap = false;
    if (url.includes('map.naver.com')) {
      isNaverMap = true;
      console.log('네이버 지도 URL 감지, 처리 방식 변경');
      
      // URL에서 placeId 추출 시도
      const placeIdMatch = url.match(/place\/(\d+)/);
      if (placeIdMatch && placeIdMatch[1]) {
        const placeId = placeIdMatch[1];
        console.log(`네이버 지도에서 장소 ID 추출: ${placeId}`);
        
        // 플레이스 URL로 변환 가능
        const placeUrl = `https://m.place.naver.com/restaurant/${placeId}/home`;
        console.log(`변환된 URL: ${placeUrl}`);
        // 변환된 URL을 사용할지 결정 (여기서는 사용하지 않고 원래 URL 사용)
      }
    }
    
    // 모바일 URL을 일반 URL로 변환 (필요한 경우)
    if (url.includes('m.place.naver.com')) {
      url = url.replace('m.place.naver.com', 'place.naver.com');
    }
    
    // 짧은 URL(naver.me) 처리
    if (url.includes('naver.me')) {
      console.log('짧은 URL 감지, 리다이렉트 추적...');
      // 짧은 URL 처리 시 리다이렉트 추적
      const response = await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
      
      // 최종 URL 사용
      url = page.url();
      console.log(`리다이렉트된 최종 URL: ${url}`);
    } else {
      // 일반 URL 처리
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });
    }
    
    // 페이지가 완전히 로드될 때까지 기다림 (조건부 처리)
    try {
      // 최대 10초만 네트워크 유휴 상태 대기
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        console.log('네트워크 유휴 상태 대기 타임아웃, 계속 진행합니다.');
      });
    } catch (e) {
      console.log('페이지 로드 상태 대기 중 오류 발생, 계속 진행합니다.');
    }
    
    // 기본 콘텐츠가 로드될 때까지 최소 대기
    await page.waitForTimeout(2000);
    
    let result;
    switch (crawlType) {
      case 'naver-place':
        // 네이버 지도일 경우 다른 크롤링 함수 사용
        if (isNaverMap) {
          result = await crawlNaverMap(page, url, options);
        } else {
          result = await crawlNaverPlace(page, url, options);
        }
        break;
      case 'instagram':
        result = await crawlInstagramProfile(page, url, options);
        break;
      default:
        result = await crawlGeneralWebpage(page, url, options);
    }
    
    await context.close();
    return result;
  } catch (error: any) {
    console.error('크롤링 중 오류 발생:', error);
    
    // 오류 발생 시 스크린샷 캡처 시도
    try {
      const page = await browser.newPage();
      await page.goto('about:blank');
      const screenshot = await page.screenshot({ type: 'jpeg' });
      console.log('오류 상황 스크린샷 캡처됨');
      
      // 오류 정보를 포함한 결과 반환
      return {
        type: 'error',
        url,
        error: error.message,
        screenshot: `data:image/jpeg;base64,${screenshot.toString('base64')}`,
        metadata: {
          crawledAt: new Date().toISOString(),
          clientId: options.clientId || null,
        }
      } as CrawlResult;
    } catch (screenshotError) {
      console.error('스크린샷 캡처 실패:', screenshotError);
    }
    
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * 네이버 플레이스에서 데이터 크롤링
 */
async function crawlNaverPlace(page: Page, url: string, options: any): Promise<CrawlResult> {
  try {
    console.log('네이버 플레이스 페이지 크롤링 시작...');
    
    // JavaScript 오류 무시 설정
    await page.route('**/*', (route) => {
      // 이미지, 폰트, 스타일시트 등 불필요한 리소스는 차단하여 속도 향상
      const resourceType = route.request().resourceType();
      if (['image', 'font', 'stylesheet'].includes(resourceType)) {
        return route.abort();
      }
      return route.continue();
    });
    
    // 더 많은 정보를 보기 위해 페이지 상세 정보 영역이 로딩될 때까지 기다림
    console.log('페이지 주요 요소 대기 중...');
    
    // 여러 가능한 선택자 중 가장 먼저 나타나는 것 대기
    const selectors = [
      'div.place_section', 
      'span.Fc1rA', 
      'span.lnJFt', 
      'div.xS150',
      'h2.place_header',
      'div.place_detail'
    ];
    
    let elementFound = false;
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`선택자 발견: ${selector}`);
        elementFound = true;
        break;
      } catch (e) {
        console.log(`선택자 ${selector} 찾기 실패, 다음 시도 중...`);
      }
    }
    
    if (!elementFound) {
      console.log('기본 선택자를 찾지 못함, 계속 진행합니다.');
      // 페이지가 로드될 시간을 조금 더 줍니다
      await page.waitForTimeout(3000);
    }
    
    // 페이지 스크린샷 (디버깅용)
    try {
      const screenshot = await page.screenshot({ type: 'jpeg', quality: 70 });
      console.log('페이지 스크린샷 캡처 성공');
      
      // base64로 변환
      const screenshotBase64 = `data:image/jpeg;base64,${screenshot.toString('base64')}`;
      
      // 이후 코드에서 결과에 스크린샷 포함하도록 저장
      options.screenshot = screenshotBase64;
    } catch (e) {
      console.error('스크린샷 캡처 실패:', e);
    }
    
    // 가게 이름
    let name = null;
    try {
      // 여러 가능한 선택자 시도
      for (const selector of ['span.Fc1rA', 'span[class*="name"]', 'h1.place_name', 'h2.place_header']) {
        const nameElement = await page.$(selector);
        if (nameElement) {
          name = await nameElement.textContent();
          if (name) break;
        }
      }
    } catch (e) {
      console.error('가게 이름 추출 실패:', e);
    }
    
    // 업종 정보 (요리주점)
    let category = null;
    try {
      // 업종 카테고리 대응 선택자 다양화
      for (const selector of ['span.lnJFt', 'span[class*="category"]', 'span.category']) {
        const categoryElement = await page.$(selector);
        if (categoryElement) {
          category = await categoryElement.textContent();
          if (category) break;
        }
      }
    } catch (e) {
      console.error('업종 카테고리 추출 실패:', e);
    }
    
    // 업종 정보 (요리주점)도 텍스트 검색 기반으로 시도
    if (!category) {
      try {
        const categoryByText = await page.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('div, span, a'));
          for (const el of elements) {
            const text = el.textContent || '';
            // "요리주점" 텍스트가 포함된 요소 찾기
            if (text.includes('요리주점') || text.includes('한식')) {
              return {
                text: text.trim(),
                className: el.className,
                id: el.id,
                tagName: el.tagName
              };
            }
          }
          return null;
        });
        
        if (categoryByText) {
          console.log('텍스트 기반으로 업종 정보 발견:', categoryByText);
          category = categoryByText.text;
        }
      } catch (e) {
        console.error('업종 정보 텍스트 기반 추출 실패:', e);
      }
    }
    
    // 쿠폰 정보
    let couponTitle = null;
    let hasCoupon = false;
    try {
      // 쿠폰 관련 특정 텍스트 찾기
      const couponText = await page.evaluate(() => {
        // 페이지 전체 텍스트 내용
        const pageText = document.body.textContent || '';
        
        // 쿠폰 관련 키워드 찾기
        const keywords = ['쿠폰', '증정', '카프레제', '외 2개'];
        for (const keyword of keywords) {
          if (pageText.includes(keyword)) {
            // 해당 텍스트를 포함하는 요소 찾기
            const elements = Array.from(document.querySelectorAll('div, span'));
            for (const el of elements) {
              if (el.textContent && el.textContent.includes(keyword)) {
                return {
                  text: el.textContent.trim(),
                  className: el.className
                };
              }
            }
          }
        }
        return null;
      });
      
      if (couponText) {
        console.log('쿠폰 정보 발견:', couponText);
        couponTitle = couponText.text;
        hasCoupon = true;
      }
    } catch (e) {
      console.error('쿠폰 정보 추출 실패:', e);
    }
    
    // 소식 정보
    let newsTitle = null;
    let hasNews = false;
    try {
      // 소식 관련 특정 텍스트 찾기
      const newsText = await page.evaluate(() => {
        // 소식 관련 키워드 찾기
        const keywords = ['소식', '가정의달', '5월'];
        for (const keyword of keywords) {
          const elements = Array.from(document.querySelectorAll('div, span'));
          for (const el of elements) {
            if (el.textContent && el.textContent.includes(keyword)) {
        return {
                text: el.textContent.trim(),
                className: el.className
              };
            }
          }
        }
        return null;
      });
      
      if (newsText) {
        console.log('소식 정보 발견:', newsText);
        newsTitle = newsText.text;
        hasNews = true;
      }
    } catch (e) {
      console.error('소식 정보 추출 실패:', e);
    }
    
    // 예약 정보
    let reservationTitle = null;
    let hasReservation = false;
    try {
      // 예약 관련 특정 텍스트 찾기
      const reservationText = await page.evaluate(() => {
        // 예약 관련 키워드 찾기
        const keywords = ['예약', '단독 사용', '이층'];
        for (const keyword of keywords) {
          const elements = Array.from(document.querySelectorAll('div, span, a, button'));
          for (const el of elements) {
            if (el.textContent && el.textContent.includes(keyword)) {
              return {
                text: el.textContent.trim(),
                className: el.className
              };
            }
          }
        }
        return null;
      });
      
      if (reservationText) {
        console.log('예약 정보 발견:', reservationText);
        reservationTitle = reservationText.text;
        hasReservation = true;
      }
    } catch (e) {
      console.error('예약 정보 추출 실패:', e);
    }
    
    // 결과 객체 생성
    const result: CrawlResult = {
      type: 'naver-place',
      url,
      name,
      category,
      hasCoupon,
      couponTitle,
      hasNews,
      newsTitle,
      hasReservation,
      reservationTitle,
      screenshot: options.screenshot, // 스크린샷 포함 (디버깅용)
      metadata: {
        crawledAt: new Date().toISOString(),
        clientId: options.clientId || null,
      }
    };
    
    console.log('네이버 플레이스 페이지 크롤링 완료');
    return result;
  } catch (error) {
    console.error('네이버 플레이스 크롤링 중 오류:', error);
    throw error;
  }
}

/**
 * 인스타그램 프로필 크롤링
 */
async function crawlInstagramProfile(page: Page, url: string, options: any): Promise<CrawlResult> {
  try {
    // 프로필 정보 추출
    await page.waitForSelector('header section', { timeout: 30000 });
    
    // 사용자 이름
    const usernameElement = await page.$('header h2');
    const username = usernameElement ? await usernameElement.textContent() : null;
    
    // 프로필 소개
    const bioElement = await page.$('header div._aa_c');
    const bio = bioElement ? await bioElement.textContent() : null;
    
    // 팔로워 수
    const followerElement = await page.$('ul li:nth-child(2) span');
    const followers = followerElement ? await followerElement.textContent() : null;
    
    // 팔로잉 수
    const followingElement = await page.$('ul li:nth-child(3) span');
    const following = followingElement ? await followingElement.textContent() : null;
    
    // 게시물 수
    const postsElement = await page.$('ul li:nth-child(1) span');
    const posts = postsElement ? await postsElement.textContent() : null;
    
    // 프로필 이미지
    const profileImageElement = await page.$('header img');
    const profileImage = profileImageElement ? await profileImageElement.getAttribute('src') : null;
    
    // 최근 게시물 URL
    const postElements = await page.$$('article a');
    const postUrls = await Promise.all(
      postElements.slice(0, 6).map(async (post) => {
        return await post.getAttribute('href');
      })
    );
    
    // 최근 게시물 이미지
    const postImageElements = await page.$$('article img');
    const postImages = await Promise.all(
      postImageElements.slice(0, 6).map(async (img) => {
        return await img.getAttribute('src');
      })
    );
    
    const result: CrawlResult = {
      type: 'instagram',
      url,
      username,
      bio,
      followers,
      following,
      posts,
      profileImage,
      postUrls: postUrls.filter(Boolean).map(url => `https://instagram.com${url}`),
      postImages: postImages.filter(Boolean),
      metadata: {
        crawledAt: new Date().toISOString(),
        clientId: options.clientId || null,
      }
    };
    
    return result;
  } catch (error) {
    console.error('인스타그램 프로필 크롤링 중 오류:', error);
    throw error;
  }
}

/**
 * 지정된 URL에서 일반적인 SEO 정보 추출 (메타 태그, 제목 등)
 */
async function crawlGeneralWebpage(page: Page, url: string, options: any): Promise<CrawlResult> {
  try {
    // 페이지 타이틀
    const title = await page.title();
    
    // 메타 설명
    const descriptionElement = await page.$('meta[name="description"]');
    const description = descriptionElement 
      ? await descriptionElement.getAttribute('content') 
      : null;
    
    // 모든 링크 수집
    const linkElements = await page.$$('a');
    const links = await Promise.all(
      linkElements.slice(0, 20).map(async (link) => {
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        return { href, text };
      })
    );
    
    // 이미지 수집
    const imageElements = await page.$$('img');
    const images = await Promise.all(
      imageElements.slice(0, 10).map(async (img) => {
        const src = await img.getAttribute('src');
        const alt = await img.getAttribute('alt');
        return { src, alt };
      })
    );
    
    // 메타 태그 수집
    const metaTags = await page.evaluate(() => {
      const metas = document.querySelectorAll('meta');
      return Array.from(metas).map(meta => {
        const attributes = Array.from(meta.attributes);
        const metaObj: Record<string, string> = {};
        
        attributes.forEach(attr => {
          metaObj[attr.name] = attr.value;
        });
        
        return metaObj;
      });
    });
    
    const result: CrawlResult = {
      type: 'general',
      url,
      title,
      description,
      links: links.filter(link => link.href && link.text),
      images: images.filter(img => img.src),
      metaTags,
      metadata: {
        crawledAt: new Date().toISOString(),
        clientId: options.clientId || null,
      }
    };
    
    return result;
    } catch (error) {
    console.error('일반 웹페이지 크롤링 중 오류:', error);
      throw error;
  }
}

/**
 * 네이버 지도에서 데이터 크롤링
 */
async function crawlNaverMap(page: Page, url: string, options: any): Promise<CrawlResult> {
  try {
    console.log('네이버 지도 페이지 크롤링 시작...');
    
    // 페이지 로딩 대기 시간 증가
    await page.waitForTimeout(5000); // 5초로 증가

    // 기본 로딩이 완료되었는지 확인
    try {
      // 지도 페이지에서 특정 요소들이 나타날 때까지 기다림
      const loadingSelectors = [
        'div._title', // 지도 타이틀 영역
        'div._info', // 정보 영역
        'span[role="heading"]', // 제목 역할을 하는 span
        'div.place_on_pcmap', // PC 지도 플레이스 컨테이너
        'div.place_section', // 플레이스 섹션
        'div.O8qbU', // 새로운 네이버 지도 컨테이너
        'a[href*="menu"]', // 메뉴 링크
        'a[href*="photo"]' // 사진 링크
      ];
      
      console.log('페이지 핵심 요소 대기 중...');
      for (const selector of loadingSelectors) {
        try {
          // 각 선택자에 대해 10초의 타임아웃으로 대기
          await page.waitForSelector(selector, { timeout: 10000 })
            .then(() => console.log(`선택자 발견: ${selector}`))
            .catch(() => console.log(`선택자 ${selector} 찾지 못함`));
        } catch (e) {
          // 특정 선택자를 찾지 못해도 계속 진행
        }
      }
    } catch (e) {
      console.log('기본 대기 요소를 찾지 못함, 계속 진행합니다');
    }

    // 스크롤 한 번 수행하여 더 많은 콘텐츠 로드
    await page.evaluate(() => {
      window.scrollTo(0, 800);
    });
    await page.waitForTimeout(2000); // 스크롤 후 추가 대기
    
    // 페이지 스크린샷 (디버깅용)
    try {
      const screenshot = await page.screenshot({ type: 'jpeg', quality: 70 });
      console.log('페이지 스크린샷 캡처 성공');
      
      // base64로 변환
      const screenshotBase64 = `data:image/jpeg;base64,${screenshot.toString('base64')}`;
      
      // 이후 코드에서 결과에 스크린샷 포함하도록 저장
      options.screenshot = screenshotBase64;
    } catch (e) {
      console.error('스크린샷 캡처 실패:', e);
    }
    
    // 페이지의 HTML 구조를 자세히 분석
    const htmlStructure = await page.evaluate(() => {
      // 지도 페이지의 구조 파악을 위한 정보 수집
      const headers = Array.from(document.querySelectorAll('h1, h2, h3, [role="heading"]')).map(h => ({
        tag: h.tagName,
        text: h.textContent?.trim() || '',
        className: h.className,
        id: h.id,
        attributes: Array.from(h.attributes).map(attr => ({ name: attr.name, value: attr.value }))
      }));
      
      // 주요 컨테이너 정보
      const containers = Array.from(document.querySelectorAll('div.place_section, div.place_on_pcmap, div._info, div.O8qbU')).map(div => ({
        className: div.className,
        id: div.id,
        childCount: div.children.length,
        innerText: (div as HTMLElement).innerText.substring(0, 100) + ((div as HTMLElement).innerText.length > 100 ? '...' : '')
      }));
      
      // 주요 링크와 텍스트 버튼 정보
      const links = Array.from(document.querySelectorAll('a, button')).map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim() || '',
        className: el.className,
        href: el.getAttribute('href') || ''
      })).filter(link => link.text && link.text.length < 30);
      
      return { headers, containers, links };
    });
    
    console.log('페이지 HTML 구조 분석:', JSON.stringify(htmlStructure, null, 2).substring(0, 500) + '...');
    
    // 가게 이름 추출 (더 많은 선택자 시도)
    let name = null;
    try {
      // 네이버 지도의 장소명 선택자 확장
      const nameSelectors = [
        'span[role="heading"]', // 역할 기반 선택 (가장 우선)
        '.Fc1rA', // 네이버 플레이스 모바일
        '.place_title', // 네이버 플레이스 웹
        '.lsnx_det', // 네이버 지도
        '.lsnx_tit', // 네이버 지도 다른 버전
        'div._title', // 새 네이버 지도
        'h1.title_h1', // 특정 제목 셀렉터
        'div.place_section_content .title_h1', // 섹션 내 제목
        'h1, h2', // 일반 헤더
        'div.title_text' // 제목 텍스트 컨테이너
      ];
      
      for (const selector of nameSelectors) {
        const nameElement = await page.$(selector);
        if (nameElement) {
          name = await nameElement.textContent();
          console.log(`${selector}에서 이름 발견:`, name);
          if (name && name.trim().length > 0) {
            name = name.trim();
            break;
          }
        }
      }
      
      // 선택자로 찾지 못했으면 HTML 구조 분석 결과에서 찾기
      if (!name || name.trim().length === 0) {
        // 헤딩 요소에서 가장 짧은 텍스트를 제목으로 간주
        const possibleTitles = htmlStructure.headers
          .map(h => h.text)
          .filter(text => text && text.length > 1 && text.length < 30);
          
        if (possibleTitles.length > 0) {
          // 가장 짧은 텍스트가 가게 이름일 가능성이 높음
          name = possibleTitles.sort((a, b) => a.length - b.length)[0];
          console.log('헤더 분석으로 이름 발견:', name);
        }
      }
      
      // 역할 기반 검색 시도 (페이지 내에서 역할이 제목인 요소 찾기)
      if (!name || name.trim().length === 0) {
        name = await page.evaluate(() => {
          const headingElement = document.querySelector('[role="heading"]');
          return headingElement?.textContent?.trim() || null;
        });
        
        if (name) {
          console.log('역할 기반으로 이름 발견:', name);
        }
      }
      
      // 최후의 수단: 가장 눈에 띄는 텍스트 요소 찾기
      if (!name || name.trim().length === 0) {
        name = await page.evaluate(() => {
          // 큰 글씨나 눈에 띄는 요소들은 보통 이런 스타일 속성을 가짐
          const possibleTitleElements = Array.from(document.querySelectorAll('*'))
            .filter(el => {
              const style = window.getComputedStyle(el);
              const fontSize = parseInt(style.fontSize.replace('px', ''), 10);
              const fontWeight = style.fontWeight;
              // 글씨 크기가 18px 이상이고 굵은 글씨인 요소들
              return fontSize >= 18 && (fontWeight === 'bold' || parseInt(fontWeight, 10) >= 600);
            });
            
          // 텍스트 콘텐츠가 있는 요소만 필터링
          const titleTexts = possibleTitleElements
            .map(el => el.textContent?.trim())
            .filter(text => text && text.length > 1 && text.length < 30);
            
          return titleTexts[0] || null;
        });
        
        if (name) {
          console.log('스타일 분석으로 이름 발견:', name);
        }
      }
    } catch (e) {
      console.error('가게 이름 추출 중 오류:', e);
    }
    
    // 업종 정보 추출 개선
    let category = null;
    try {
      // 업종 카테고리 선택자 확장
      const categorySelectors = [
        '.category', // 네이버 플레이스
        '.lsnx_dtc', // 네이버 지도
        '.lnJFt', // 네이버 플레이스 모바일
        'span.type', // 일반
        'span._type', // 새 네이버 지도
        'div.O8qbU span:nth-child(2)', // 새 구조의 네이버 지도
        'div._info span', // 정보 영역 내 스팬
        'div.place_section_content .link_text' // 섹션 내 링크
      ];
      
      for (const selector of categorySelectors) {
        const categoryElements = await page.$$(selector);
        // 여러 요소가 선택될 수 있으므로 모두 확인
        for (const element of categoryElements) {
          const text = await element.textContent();
          if (text && isCategoryText(text.trim())) {
            category = text.trim();
            console.log(`${selector}에서 카테고리 발견:`, category);
            break;
          }
        }
        if (category) break;
      }
      
      // 페이지 전체에서 카테고리 키워드 탐색
      if (!category) {
        const categoryKeywords = [
          '요리주점', '한식', '중식', '양식', '일식', '분식', '카페', '베이커리',
          '음식점', '식당', '레스토랑', '주점', '호프', '술집', '커피',
          '패밀리레스토랑', '뷔페', '치킨', '패스트푸드', '피자', '햄버거'
        ];
        
        // 링크 요소 중에서 카테고리 찾기
        for (const link of htmlStructure.links) {
          if (link.text && categoryKeywords.some(keyword => link.text.includes(keyword))) {
            category = link.text;
            console.log('링크 텍스트에서 카테고리 발견:', category);
            break;
          }
        }
        
        // 아직도 못 찾았으면 전체 페이지에서 검색
        if (!category) {
          category = await page.evaluate((keywords) => {
            // 페이지 전체 텍스트
            const pageText = document.body.textContent || '';
            
            // 키워드 찾기
            for (const keyword of keywords) {
              if (pageText.includes(keyword)) {
                // 해당 텍스트를 포함하는 짧은 요소 찾기
                const elements = Array.from(document.querySelectorAll('span, div, p'))
                  .filter(el => el.textContent && el.textContent.includes(keyword))
                  .sort((a, b) => (a.textContent?.length || 0) - (b.textContent?.length || 0));
                
                if (elements.length > 0) {
                  return elements[0].textContent?.trim() || null;
                }
              }
            }
            return null;
          }, categoryKeywords);
          
          if (category) {
            console.log('텍스트 분석으로 카테고리 발견:', category);
          }
        }
        
        // 이미지 alt 텍스트 또는 메타 데이터에서 카테고리 찾기 시도
        if (!category) {
          category = await page.evaluate((keywords: string[]) => {
            // 이미지 alt 텍스트 확인
            const images = Array.from(document.querySelectorAll('img[alt]'));
            for (const img of images) {
              const alt = img.getAttribute('alt') || '';
              if (keywords.some(keyword => alt.includes(keyword))) {
                return alt;
              }
            }
            
            // 메타 데이터 확인
            const metaDescriptions = Array.from(document.querySelectorAll('meta[name="description"], meta[property="og:description"]'));
            for (const meta of metaDescriptions) {
              const content = meta.getAttribute('content') || '';
              for (const keyword of keywords) {
                if (content.includes(keyword)) {
                  // 카테고리를 포함한 짧은 문구 추출
                  const start = Math.max(0, content.indexOf(keyword) - 10);
                  const end = Math.min(content.length, content.indexOf(keyword) + keyword.length + 10);
                  return content.substring(start, end);
                }
              }
            }
            
            return null;
          }, categoryKeywords);
          
          if (category) {
            console.log('이미지/메타 데이터에서 카테고리 발견:', category);
          }
        }
      }
    } catch (e) {
      console.error('업종 카테고리 추출 중 오류:', e);
    }
    
    // 쿠폰 정보 추출 개선
    let couponTitle = null;
    let hasCoupon = false;
    try {
      // 쿠폰 관련 선택자 확장
      const couponSelectors = [
        '.xS150', // 네이버 플레이스 모바일
        '.coupon', // 일반
        '[class*="coupon"]', // 클래스에 coupon이 포함된 요소
        'a:has-text("쿠폰")', // 텍스트에 쿠폰이 포함된 링크
        'span:has-text("쿠폰")', // 텍스트에 쿠폰이 포함된 스팬
        'div:has-text("쿠폰")', // 텍스트에 쿠폰이 포함된 div
        'img[alt*="쿠폰"]', // alt 텍스트에 쿠폰이 포함된 이미지
        'div.place_section_content a.tMklg' // 특정 구조의 쿠폰 링크
      ];
      
      for (const selector of couponSelectors) {
        try {
          const couponElements = await page.$$(selector);
          for (const couponElement of couponElements) {
            couponTitle = await couponElement.textContent();
            console.log(`${selector}에서 쿠폰 발견:`, couponTitle);
            if (couponTitle && couponTitle.trim().length > 0) {
              hasCoupon = true;
              couponTitle = couponTitle.trim();
              break;
            }
          }
          if (hasCoupon) break;
        } catch (e) {
          // 선택자 오류는 무시하고 계속 진행
        }
      }
      
      // 링크 텍스트에서 쿠폰 정보 확인
      if (!hasCoupon) {
        for (const link of htmlStructure.links) {
          if (link.text && (
              link.text.includes('쿠폰') || 
              link.text.includes('할인') || 
              link.text.includes('증정')
            )) {
            couponTitle = link.text;
            hasCoupon = true;
            console.log('링크 텍스트에서 쿠폰 발견:', couponTitle);
            break;
          }
        }
      }
      
      // 전체 페이지에서 쿠폰 키워드 찾기
      if (!hasCoupon) {
        const couponKeywords = ['쿠폰', '할인', '증정', '혜택', '카프레제', '1+1', '2+1', '서비스'];
        
        const couponInfo = await page.evaluate((keywords) => {
          // 페이지 전체 텍스트
          const pageText = document.body.textContent || '';
          
          // 키워드 찾기
          for (const keyword of keywords) {
            if (pageText.includes(keyword)) {
              // 해당 텍스트를 포함하는 짧은 요소 찾기
              const elements = Array.from(document.querySelectorAll('span, div, p, a, button'))
                .filter(el => el.textContent && el.textContent.includes(keyword))
                .sort((a, b) => (a.textContent?.length || 0) - (b.textContent?.length || 0));
              
              if (elements.length > 0) {
                return elements[0].textContent?.trim() || null;
              }
            }
          }
          return null;
        }, couponKeywords);
        
        if (couponInfo) {
          couponTitle = couponInfo;
          hasCoupon = true;
          console.log('텍스트 분석으로 쿠폰 발견:', couponTitle);
        }
      }
    } catch (e) {
      console.error('쿠폰 정보 추출 중 오류:', e);
    }
    
    // 소식/이벤트 정보 추출 개선
    let newsTitle = null;
    let hasNews = false;
    try {
      // 소식 관련 선택자 확장
      const newsSelectors = [
        '.ShCaU', // 네이버 플레이스 모바일
        '.notice', // 일반
        '[class*="notice"]', // 클래스에 notice가 포함된 요소
        '[class*="event"]', // 클래스에 event가 포함된 요소
        'a:has-text("소식")', // 텍스트에 소식이 포함된 링크
        'a:has-text("이벤트")', // 텍스트에 이벤트가 포함된 링크
        'div:has-text("소식")', // 텍스트에 소식이 포함된 div
        'span:has-text("소식")', // 텍스트에 소식이 포함된 스팬
        'div.place_section_content a.tMklg' // 특정 구조의 소식 링크
      ];
      
      for (const selector of newsSelectors) {
        try {
          const newsElements = await page.$$(selector);
          for (const newsElement of newsElements) {
            newsTitle = await newsElement.textContent();
            console.log(`${selector}에서 소식 발견:`, newsTitle);
            if (newsTitle && newsTitle.trim().length > 0) {
              hasNews = true;
              newsTitle = newsTitle.trim();
              break;
            }
          }
          if (hasNews) break;
        } catch (e) {
          // 선택자 오류는 무시하고 계속 진행
        }
      }
      
      // 링크 텍스트에서 소식 정보 확인
      if (!hasNews) {
        for (const link of htmlStructure.links) {
          if (link.text && (
              link.text.includes('소식') || 
              link.text.includes('이벤트') || 
              link.text.includes('공지') ||
              link.text.includes('행사')
            )) {
            newsTitle = link.text;
            hasNews = true;
            console.log('링크 텍스트에서 소식 발견:', newsTitle);
            break;
          }
        }
      }
      
      // 전체 페이지에서 소식 키워드 찾기
      if (!hasNews) {
        const newsKeywords = ['소식', '이벤트', '행사', '공지', '가정의달', '오픈', '기념', '신메뉴', '5월'];
        
        const newsInfo = await page.evaluate((keywords) => {
          // 페이지 전체 텍스트
          const pageText = document.body.textContent || '';
          
          // 키워드 찾기
          for (const keyword of keywords) {
            if (pageText.includes(keyword)) {
              // 해당 텍스트를 포함하는 짧은 요소 찾기
              const elements = Array.from(document.querySelectorAll('span, div, p, a, button'))
                .filter(el => el.textContent && el.textContent.includes(keyword))
                .sort((a, b) => (a.textContent?.length || 0) - (b.textContent?.length || 0));
              
              if (elements.length > 0) {
                return elements[0].textContent?.trim() || null;
              }
            }
          }
          return null;
        }, newsKeywords);
        
        if (newsInfo) {
          newsTitle = newsInfo;
          hasNews = true;
          console.log('텍스트 분석으로 소식 발견:', newsTitle);
        }
      }
    } catch (e) {
      console.error('소식 정보 추출 중 오류:', e);
    }
    
    // 예약 정보 추출 개선
    let reservationTitle = null;
    let hasReservation = false;
    try {
      // 예약 관련 선택자 확장
      const reservationSelectors = [
        '.wpUMQ', // 네이버 플레이스 모바일
        '.reservation', // 일반
        '[class*="reservation"]', // 클래스에 reservation이 포함된 요소
        'a:has-text("예약")', // 텍스트에 예약이 포함된 링크
        'button:has-text("예약")', // 텍스트에 예약이 포함된 버튼
        'div:has-text("예약")', // 텍스트에 예약이 포함된 div
        'span:has-text("예약")', // 텍스트에 예약이 포함된 스팬
        'a.eWQEfU' // 특정 클래스의 예약 버튼
      ];
      
      for (const selector of reservationSelectors) {
        try {
          const reservationElements = await page.$$(selector);
          for (const reservationElement of reservationElements) {
            reservationTitle = await reservationElement.textContent();
            console.log(`${selector}에서 예약 발견:`, reservationTitle);
            if (reservationTitle && reservationTitle.trim().length > 0) {
              hasReservation = true;
              reservationTitle = reservationTitle.trim();
              break;
            }
          }
          if (hasReservation) break;
        } catch (e) {
          // 선택자 오류는 무시하고 계속 진행
        }
      }
      
      // 링크 텍스트에서 예약 정보 확인
      if (!hasReservation) {
        for (const link of htmlStructure.links) {
          if (link.text && (
              link.text.includes('예약') || 
              link.text.includes('방문예약') || 
              link.text.includes('방문 예약')
            )) {
            reservationTitle = link.text;
            hasReservation = true;
            console.log('링크 텍스트에서 예약 발견:', reservationTitle);
            break;
          }
        }
      }
      
      // 전체 페이지에서 예약 키워드 찾기
      if (!hasReservation) {
        const reservationKeywords = ['예약', '방문예약', '방문 예약', '단독 사용', '단독사용', '이층', '2층', '테이블 예약'];
        
        const reservationInfo = await page.evaluate((keywords) => {
          // 페이지 전체 텍스트
          const pageText = document.body.textContent || '';
          
          // 키워드 찾기
          for (const keyword of keywords) {
            if (pageText.includes(keyword)) {
              // 해당 텍스트를 포함하는 짧은 요소 찾기
              const elements = Array.from(document.querySelectorAll('span, div, p, a, button'))
                .filter(el => el.textContent && el.textContent.includes(keyword))
                .sort((a, b) => (a.textContent?.length || 0) - (b.textContent?.length || 0));
              
              if (elements.length > 0) {
                return elements[0].textContent?.trim() || null;
              }
            }
          }
          return null;
        }, reservationKeywords);
        
        if (reservationInfo) {
          reservationTitle = reservationInfo;
          hasReservation = true;
          console.log('텍스트 분석으로 예약 발견:', reservationTitle);
        }
      }
    } catch (e) {
      console.error('예약 정보 추출 중 오류:', e);
    }
    
    // 결과 객체 생성
    const result: CrawlResult = {
      type: 'naver-place',
      url,
      name,
      category,
      hasCoupon,
      couponTitle,
      hasNews,
      newsTitle,
      hasReservation,
      reservationTitle,
      screenshot: options.screenshot, // 스크린샷 포함 (디버깅용)
      isNaverMap: true, // 네이버 지도 여부 표시
      metadata: {
        crawledAt: new Date().toISOString(),
        clientId: options.clientId || null,
      }
    };
    
    console.log('네이버 지도 페이지 크롤링 완료');
    return result;
  } catch (error) {
    console.error('네이버 지도 크롤링 중 오류:', error);
    throw error;
  }
}

// 업종 정보인지 확인하는 헬퍼 함수
function isCategoryText(text: string): boolean {
  // 업종으로 판단할 수 있는 키워드들
  const categoryKeywords = [
    '요리주점', '한식', '중식', '양식', '일식', '분식', '카페', '베이커리',
    '음식점', '식당', '레스토랑', '주점', '호프', '술집', '커피',
    '패밀리레스토랑', '뷔페', '치킨', '패스트푸드', '피자', '햄버거'
  ];
  
  // 짧은 텍스트면서 카테고리 키워드를 포함하거나 완전 일치하는 경우
  return text.length < 30 && (
    categoryKeywords.some(keyword => text.includes(keyword)) ||
    categoryKeywords.includes(text)
  );
}