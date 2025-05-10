# Next.js 프로젝트에 Clerk 연동하기

이 문서는 Next.js 프로젝트에 Clerk 인증 서비스를 연동하는 과정을 단계별로 설명합니다.

## 1. Clerk 설치

먼저 필요한 패키지들을 설치합니다:

```bash
# npm을 사용하는 경우
npm install @clerk/nextjs

# yarn을 사용하는 경우
yarn add @clerk/nextjs

# pnpm을 사용하는 경우
pnpm add @clerk/nextjs
```

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 Clerk 대시보드에서 제공하는 API 키들을 추가합니다:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_****
CLERK_SECRET_KEY=sk_test_****
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 3. ClerkProvider 설정

Clerk의 모든 기능을 사용하기 위해서는 애플리케이션의 최상위 레벨에 `ClerkProvider`를 설정해야 합니다. 
`src/app/layout.tsx` 파일을 다음과 같이 수정합니다:

```typescript
import { ClerkProvider } from '@clerk/nextjs';
import { NoticeProvider } from "@/context/NoticeContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ClerkProvider
          appearance={{
            // Clerk UI 커스터마이징
            elements: {
              formButtonPrimary: 'bg-slate-500 hover:bg-slate-400',
              footerActionLink: 'text-slate-500 hover:text-slate-400',
            },
            // 다크 모드 지원
            baseTheme: 'light',
          }}
          // 다국어 지원
          localization={{
            signIn: {
              title: '로그인',
              subtitle: '계정에 로그인하세요',
            },
            signUp: {
              title: '회원가입',
              subtitle: '새 계정을 만드세요',
            },
          }}
        >
          <NoticeProvider>
            {children}
          </NoticeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

### ClerkProvider 주요 속성

1. `appearance`: Clerk UI의 스타일을 커스터마이징할 수 있습니다.
   - `elements`: 각 컴포넌트의 스타일을 Tailwind CSS 클래스로 지정
   - `baseTheme`: 'light' 또는 'dark' 테마 설정
   - `layout`: 전체 레이아웃 스타일 설정

2. `localization`: 다국어 지원을 위한 텍스트 설정
   - `signIn`: 로그인 관련 텍스트
   - `signUp`: 회원가입 관련 텍스트
   - `userButton`: 사용자 버튼 관련 텍스트

3. `publishableKey`: 환경 변수로 설정한 키를 직접 지정할 수 있습니다.
   ```typescript
   publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
   ```

4. `afterSignInUrl`: 로그인 후 리다이렉트할 URL
   ```typescript
   afterSignInUrl="/dashboard"
   ```

5. `afterSignUpUrl`: 회원가입 후 리다이렉트할 URL
   ```typescript
   afterSignUpUrl="/onboarding"
   ```

## 4. 미들웨어 설정

`src/middleware.ts` 파일을 생성하고 다음과 같이 설정합니다:

```typescript
import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  // 공개적으로 접근 가능한 경로 설정
  publicRoutes: ["/", "/api/public"]
});
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

## 5. 인증 컴포넌트 사용

### 로그인 버튼

```typescript
import { SignInButton } from "@clerk/nextjs";

export default function LoginButton() {
  return (
    <SignInButton mode="modal">
      <button className="btn">
        로그인
      </button>
    </SignInButton>
  );
}
```

### 회원가입 버튼

```typescript
import { SignUpButton } from "@clerk/nextjs";

export default function SignUpButton() {
  return (
    <SignUpButton mode="modal">
      <button className="btn">
        회원가입
      </button>
    </SignUpButton>
  );
}
```

### 사용자 프로필

```typescript
import { UserButton } from "@clerk/nextjs";

export default function UserProfile() {
  return <UserButton afterSignOutUrl="/" />;
}
```

## 6. 보호된 라우트 설정

특정 페이지를 인증된 사용자만 접근할 수 있도록 설정하려면 다음과 같이 사용합니다:

```typescript
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function ProtectedPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect("/sign-in");
  }
  
  return (
    <div>
      <h1>보호된 페이지</h1>
      <p>이 페이지는 로그인한 사용자만 볼 수 있습니다.</p>
    </div>
  );
}
```

## 7. API 라우트 보호

API 라우트를 보호하려면 다음과 같이 사용합니다:

```typescript
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = auth();
  
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  
  // API 로직 구현
  return NextResponse.json({ message: "인증된 요청" });
}
```

## 8. 사용자 정보 가져오기

클라이언트 컴포넌트에서 사용자 정보를 가져오는 방법:

```typescript
import { useUser } from "@clerk/nextjs";

export default function UserProfile() {
  const { user } = useUser();
  
  return (
    <div>
      <h1>프로필</h1>
      <p>이름: {user?.firstName} {user?.lastName}</p>
      <p>이메일: {user?.emailAddresses[0].emailAddress}</p>
    </div>
  );
}
```

## 9. 커스텀 페이지 생성

Clerk의 기본 페이지 대신 커스텀 페이지를 사용하려면 다음과 같이 설정합니다:

```typescript
// src/app/sign-in/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

```typescript
// src/app/sign-up/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

## 주의사항

1. 환경 변수는 반드시 `.env.local` 파일에 설정하고, 이 파일은 `.gitignore`에 추가하여 버전 관리에서 제외해야 합니다.
2. 프로덕션 환경에서는 반드시 Clerk 대시보드에서 프로덕션 API 키를 사용해야 합니다.
3. 미들웨어 설정에서 `publicRoutes`를 적절히 설정하여 인증이 필요하지 않은 페이지를 지정해야 합니다.
4. TypeScript를 사용하는 경우, Clerk의 타입 정의가 자동으로 제공됩니다.

## 추가 리소스

- [Clerk 공식 문서](https://clerk.com/docs)
- [Next.js 인증 가이드](https://clerk.com/docs/nextjs/get-started)
- [Clerk API 레퍼런스](https://clerk.com/docs/references/nextjs) 