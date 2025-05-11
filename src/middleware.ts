import { clerkMiddleware } from '@clerk/nextjs/server';

// 임시로 Clerk 미들웨어 비활성화
export default clerkMiddleware();

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 