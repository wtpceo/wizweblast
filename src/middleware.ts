import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 관리자 접근 경로 패턴 정의
const isAdminRoute = createRouteMatcher(['/admin(.*)', '/api/admin(.*)']);

// Clerk 미들웨어와 관리자 권한 체크를 결합
export default clerkMiddleware((auth, req) => {
  // 관리자 경로 체크
  if (isAdminRoute(req)) {
    console.log('관리자 페이지 접근:', req.nextUrl.pathname);
    
    // 추후 실제 권한 체크 로직 구현 시 활성화
    // return auth().protect((has) => has({ role: 'admin' }));
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 