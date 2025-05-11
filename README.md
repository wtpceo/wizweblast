# WizWebBlast

광고주 관리 플랫폼 WizWebBlast 프로젝트입니다.

## 프로젝트 구조

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **Authentication**: Clerk

## 설치 및 실행

1. 저장소 클론
```bash
git clone <repository-url>
cd wizweblast
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.local` 파일을 프로젝트 루트에 생성하고 다음 내용을 추가합니다:
```
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clerk 인증
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Database URL
DATABASE_URL=postgresql://postgres:password@your-supabase-project.supabase.co:5432/postgres
```

4. 개발 서버 실행
```bash
npm run dev
```

## 배포 가이드

### Vercel 배포 (권장)

1. GitHub에 프로젝트 푸시
```bash
git add .
git commit -m "Ready for deployment"
git push
```

2. [Vercel](https://vercel.com)에 가입하고 새 프로젝트 생성

3. GitHub 저장소 연결하고 다음 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL`

4. 배포 설정:
   - Framework: Next.js
   - Root Directory: ./
   - Node.js Version: 18.x (또는 최신 LTS)

5. "Deploy" 버튼 클릭

### Docker 배포 (선택 사항)

1. Docker 이미지 빌드
```bash
docker build -t wizweblast:latest .
```

2. 컨테이너 실행
```bash
docker run -p 3000:3000 --env-file .env.local wizweblast:latest
```

## 주요 기능

### 사용자 인증 시스템
- 회원가입/로그인/로그아웃
- 비밀번호 재설정
- 이메일 검증
- 회원가입 후 관리자 승인 프로세스
- 관리자/일반 사용자 권한 분리

### 광고주 관리
- 광고주 목록 조회
- 광고주 상세 정보
- 광고주 등록/수정/삭제
- 계약 날짜 관리

### 할 일/메모 관리
- 광고주별 할 일 관리
- 광고주별 메모 관리
- 내 할 일 모아보기

### 공지사항
- 공지사항 목록 조회
- 고정 공지 우선 표시
- 공지사항 등록/수정/삭제

### 대시보드/통계
- 광고주 현황 통계
- 부서/사용자별 활동 통계

### 크롤링
- Playwright를 활용한 외부 데이터 수집

## 기술 스택

- **Frontend**
  - Next.js 15
  - React 19
  - TailwindCSS
  - TypeScript

- **Backend**
  - Next.js API Routes
  - Supabase

- **Database**
  - Supabase (PostgreSQL)

- **인증**
  - Clerk Authentication

- **배포**
  - Vercel

## 폴더 구조

```
wizweblast/
├── src/
│   ├── app/               # App Router 페이지 및 API Routes
│   │   ├── api/           # 백엔드 API 엔드포인트
│   │   ├── auth/          # 인증 관련 페이지
│   │   └── ...            # 기타 페이지
│   │
│   ├── components/        # 공통 컴포넌트
│   ├── contexts/          # React Contexts
│   ├── lib/               # 유틸리티 함수 및 설정
│   └── scripts/           # 스크립트 (테스트 계정 생성 등)
│
├── public/                # 정적 파일
├── .env.local             # 환경 변수 (git에 추가하지 않음)
└── package.json           # 프로젝트 의존성
```
