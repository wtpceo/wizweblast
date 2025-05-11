아래는 WIZ WORKS - 할 일 등록 및 내 할 일 모아 보기 기능을 위한 전체 기능명세서입니다. 프론트엔드와 백엔드 기능명세서를 통합하여, 개발 우선순위 순서대로 정리했습니다.
(Supabase 직접 호출, Clerk 인증 기반, Drizzle ORM 사용 안함)

⸻

✅ 전체 기능명세서 – WIZ WORKS 할 일 기능

⸻

1. 할 일 카드 및 리스트 표시 (쉬운 기능)

◼️ 프론트엔드 기능명세서
	•	화면 위치:
	•	광고주 상세 페이지: app/dashboard/[clientId]/page.tsx
	•	내 할 일 보기 페이지: app/dashboard/my-todos/page.tsx
	•	UI 요소:
	•	카드 컴포넌트: TodoCard.tsx (상태 아이콘, 담당자, 마감일 포함)
	•	리스트 컴포넌트: TodoList.tsx
	•	ShadCN Badge, Avatar, Tooltip, Checkbox 사용
	•	상태 구분: 진행 중(#FFC107), 완료(#4CAF50), 지연됨(#F44336)
	•	상호작용: 마우스 오버 시 버튼 노출 ([완료], [담당자 변경])

◼️ 백엔드 없음 (Supabase 클라이언트 fetch로 리스트 직접 호출)

⸻

2. 할 일 등록 (핵심 기능)

◼️ 프론트엔드 기능명세서
	•	화면 위치:
	•	app/dashboard/[clientId]/TodoModal.tsx
	•	트리거: + 새 할 일 등록 버튼 → ShadCN Dialog 사용
	•	입력 필드:
	•	내용 (Input)
	•	담당자 선택 (Select – 사용자 목록)
	•	마감일 선택 (Calendar)
	•	피드백: 등록 후 로딩 → 토스트 “할 일이 등록되었어요!”

◼️ 백엔드 기능명세서
	•	파일 위치: app/api/todos/route.ts (POST)
	•	요청 데이터: clientId, content, assignedTo, dueDate
	•	처리 방식: Supabase insert (todos 테이블)
	•	인증 처리: Clerk auth()로 현재 사용자 검증
	•	응답: todoId, 성공 메시지
	•	상태 기본값: 'pending'

⸻

3. 할 일 완료 처리 (핵심 기능)

◼️ 프론트엔드 기능명세서
	•	위치:
	•	할 일 카드 내 Checkbox 클릭 처리
	•	상태 전환: 체크 → 상태 completed → UI 흐림 처리
	•	애니메이션: 체크 후 간단한 피드백 및 위치 고정

◼️ 백엔드 기능명세서
	•	파일 위치: app/api/todos/[id]/complete/route.ts (PATCH)
	•	요청 파라미터: todoId
	•	처리 내용: Supabase update → status: completed
	•	인증 처리: Clerk 세션 유저와 담당자 일치 여부 확인
	•	응답: 상태 변경 성공 여부

⸻

4. 담당자 변경 (핵심 기능)

◼️ 프론트엔드 기능명세서
	•	위치:
	•	TodoCard.tsx 내 “담당자 변경” 클릭 시 ShadCN Popover 또는 Dialog 사용
	•	기능 요소:
	•	사용자 검색 입력 필드
	•	Select 또는 사용자 목록 표시
	•	변경 버튼

◼️ 백엔드 기능명세서
	•	파일 위치: app/api/todos/[id]/assign/route.ts (PATCH)
	•	요청 파라미터: todoId, newAssigneeId
	•	처리 내용: Supabase update → assigned_to 변경
	•	인증 처리: 관리자 또는 현재 담당자만 변경 가능
	•	응답: 성공 메시지

⸻

5. 내 할 일 보기 페이지 (쉬운 기능)

◼️ 프론트엔드 기능명세서
	•	파일 위치: app/dashboard/my-todos/page.tsx
	•	기능:
	•	나에게 할당된 todos 필터링
	•	광고주별 그룹핑
	•	상태별 정렬 지원 (예: 마감일 기준, 완료 여부 등)
	•	UI 컴포넌트: ShadCN Accordion, Badge, Checkbox

◼️ 백엔드 없음 (Supabase 클라이언트에서 assigned_to = currentUserId 조건으로 조회)

⸻

6. 실시간 동기화 (중간 난이도 기능)

◼️ 프론트엔드 기능명세서
	•	적용 위치:
	•	광고주 상세, 내 할 일 보기
	•	기술 요소:
	•	Supabase realtime.channel('todos')
	•	on('INSERT' | 'UPDATE') 핸들링

◼️ 백엔드 기능명세서
	•	Supabase Broadcast 설정 필요
	•	todos 테이블에 실시간 기능 활성화
	•	클라이언트별 channel.subscribe() 및 상태 반영

⸻

7. 접근성 및 마이크로 인터랙션 (어려운 기능)

◼️ 프론트엔드 기능명세서
	•	접근성 구현:
	•	키보드 탭 이동 순서 지정
	•	모든 주요 버튼에 aria-* 속성 명시
	•	색상 외 텍스트로 상태 전달
	•	인터랙션:
	•	등록 후 버튼 애니메이션
	•	체크 처리 시 fade-out
	•	담당자 변경 시 슬라이드 등장

⸻