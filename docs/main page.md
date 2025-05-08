✅ 기능명세서: 대시보드 메인페이지 (/ 루트 경로)

📘 프론트엔드 기능명세서
1. 화면 레이아웃 및 디자인 명세
* 페이지 경로: app/page.tsx (Next.js App Router의 루트)
* 페이지 구성:┌──────────────────────────────┐
* │ DashboardStats (상단 상태 카드)          │
* ├──────────────────────────────┤
* │ NoticeList (공지사항)                  │
* ├──────────────────────────────┤
* │ DashboardActions (기능 이동 버튼 묶음)  │
* └──────────────────────────────┘
* 
* ShadCN 컴포넌트 사용:
    * Card, Badge, Button, ScrollArea (공지 스크롤용)
* 아이콘: Lucide 아이콘 + 이모지 조합 사용
2. 사용자 흐름 및 상호작용
* 사용자 로그인 후 / 루트로 이동
* 루트 페이지 진입 시:
    * 상태 통계 자동 조회 (/api/dashboard/stats)
    * 공지사항 자동 조회 (/api/notices)
* 주요 기능 버튼 클릭 시 이동:
    * 광고주 관리 → /clients
    * WIZ AI 도구 → /tools
    * WIZ GAME → /game
3. API 연동
데이터 항목	API 경로	설명
광고주 상태 통계	/api/dashboard/stats	총 광고주, 종료 임박, 관리 소홀, 민원 진행
공지사항 목록	/api/notices?limit=4&fixedFirst=true	상단 고정 포함 최신 4개
4. 컴포넌트 및 파일 구조
app/
├── page.tsx                   # 루트 페이지 (대시보드 역할)
├── DashboardStats.tsx        # 상단 상태 카드
├── NoticeList.tsx            # 공지사항 카드
└── DashboardActions.tsx      # 기능 이동 버튼 묶음
5. 테스트 항목
* 루트 진입 시 자동 데이터 조회 확인
* 공지사항 고정 순서, 최대 4개 노출 확인
* 버튼 클릭 시 정확한 페이지 이동 여부
* 각 컴포넌트 내 애니메이션 및 스타일 확인

🛠️ 백엔드 기능명세서
1. API 정의
① 광고주 상태 통계 API
* 파일 경로: app/api/dashboard/stats/route.ts
* 메서드: GET
* 엔드포인트: /api/dashboard/stats
* 응답 구조:
type DashboardStats = {
  totalClients: number;
  nearExpiry: number;
  poorManaged: number;
  complaintsOngoing: number;
};
② 공지사항 조회 API
* 파일 경로: app/api/notices/route.ts
* 메서드: GET
* 엔드포인트: /api/notices
* Query Parameters:
    * limit: number (default: 4)
    * fixedFirst: boolean (default: true)
* 응답 구조:
type Notice = {
  id: string;
  title: string;
  isFixed: boolean;
  createdAt: string;
};
2. 데이터베이스 설계
테이블: clients
컬럼	타입	설명
id	string	PK
contract_end_date	date	계약 종료일
status_tags	string[]	예: ["관리 소홀", "민원 중"]
테이블: notices
컬럼	타입	설명
id	string	PK
title	string	제목
content	text	본문
is_fixed	boolean	상단 고정 여부
created_at	timestamp	등록일
3. 쿼리 조건 요약
* 종료 임박: contract_end_date <= NOW() + INTERVAL 7 DAY
* 관리 소홀: status_tags @> '["관리 소홀"]'
* 민원 중: status_tags @> '["민원 중"]'
* 공지사항: is_fixed DESC, created_at DESC LIMIT 4
4. 테스트 항목
* 통계 수치가 정확히 반환되는가
* 공지사항 고정 순서 및 최신 정렬 작동 여부
* 쿼리 파라미터가 잘 반영되는가
* 응답 타입이 프론트와 일치하는가

이제 루트 경로를 기반으로 하는 메인 대시보드 페이지 명세서가 완전히 준비되었습니다.
다음으로 어떤 기능 명세서를 작성할까요?예: 광고주 목록, 광고주 상세, 관리자 통계 등
