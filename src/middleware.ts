import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// 인증이 필요한 경로 패턴 (임시로 비워둠)
const protectedRoutes: string[] = [
  // '/clients',
  // '/admin',
  // '/dashboard',
  // '/notices/create',
];

// 관리자 권한이 필요한 경로 패턴
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  // 임시 인증 우회: 모든 요청에 대해 접근 허용
  return NextResponse.next();
  
  // 아래 코드는 인증 체크를 다시 활성화할 때 사용할 수 있도록 주석 처리
  /*
  // 요청 경로
  const { pathname } = request.nextUrl;
  
  // 인증이 필요하지 않은 경로는 바로 통과
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Supabase 클라이언트 생성
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  // 세션 확인
  const { data: { session } } = await supabase.auth.getSession();
  
  // 로그인되지 않은 경우 로그인 페이지로 리디렉션
  if (!session) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // 관리자 권한 검사
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  if (isAdminRoute) {
    // 사용자 역할 확인
    const { data, error } = await supabase
      .from('users')
      .select('role, is_approved')
      .eq('id', session.user.id)
      .single();
    
    // 승인되지 않았거나 관리자가 아닌 경우
    if (error || !data || !data.is_approved || data.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/unauthorized', request.url));
    }
  } else {
    // 일반 보호 경로의 경우 승인 상태만 확인
    const { data, error } = await supabase
      .from('users')
      .select('is_approved')
      .eq('id', session.user.id)
      .single();
    
    // 승인되지 않은 경우
    if (error || !data || !data.is_approved) {
      return NextResponse.redirect(new URL('/auth/pending', request.url));
    }
  }
  
  return res;
  */
}

// 미들웨어를 적용할 경로 패턴 설정
export const config = {
  matcher: [
    /*
     * /api 경로는 클라이언트 사이드 리디렉션이 아닌 API 내부에서 인증 처리
     * 정적 파일 경로는 제외
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}; 