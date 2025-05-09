# WizWebBlast

광고주 관리 플랫폼 WizWebBlast 프로젝트입니다.

## 프로젝트 구조

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **Authentication**: Supabase Auth

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

# 사이트 URL (이메일 검증 및 비밀번호 재설정에 사용)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. 개발 서버 실행
```bash
npm run dev
```

## 테스트 계정 생성

1. ts-node 설치 (글로벌)
```bash
npm install -g ts-node
```

2. 테스트 계정 생성 스크립트 실행
```bash
ts-node src/scripts/create-test-accounts.ts
```

생성되는 테스트 계정:
- 관리자: admin@wizwebblast.com / admin123456
- 일반 사용자 1: user1@wizwebblast.com / user123456
- 일반 사용자 2: user2@wizwebblast.com / user123456
- 승인 대기 사용자: pending@wizwebblast.com / pending123456

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
  - Next.js 14 (App Router)
  - React 18
  - TailwindCSS
  - TypeScript

- **Backend**
  - Next.js API Routes
  - Supabase

- **Database**
  - Supabase (PostgreSQL)

- **인증**
  - Supabase Auth

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
