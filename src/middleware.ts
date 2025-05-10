// import { clerkMiddleware } from '@clerk/nextjs/server';

// 임시로 Clerk 미들웨어 비활성화
export default function middleware() {
  return;
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 