import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 공개 API 경로 지정 (인증이 필요 없는 경로)
const publicApiRoutes = createRouteMatcher([
  '/api/notices(.*)', // 공지사항 API는 인증 없이 접근 가능
]);

// 보호된 라우트 지정 (로그인 필요한 페이지)
const protectedRoutes = createRouteMatcher([
  '/dashboard(.*)',
  '/clients(.*)',
  '/create(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // 인증 정보 가져오기
  const authObject = await auth();
  
  // 요청 정보 로깅 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log(`미들웨어 - 요청 경로: ${req.url}`, {
      isPublicApi: publicApiRoutes(req),
      isProtectedRoute: protectedRoutes(req),
      hasAuth: !!authObject.userId,
    });
  }

  // 공개 API 경로는 인증 검사 없이 통과
  if (publicApiRoutes(req)) {
    return NextResponse.next();
  }

  // 보호된 라우트에 대한 인증 체크
  if (protectedRoutes(req) && !authObject.userId) {
    return authObject.redirectToSignIn({ returnBackUrl: req.url });
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 