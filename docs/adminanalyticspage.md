
# ✅ 기능명세서: 관리자 통계 대시보드 (`/admin`)

---

## 📘 프론트엔드 기능명세서

### 1. 화면 레이아웃 및 디자인 명세

* **페이지 경로**: `app/admin/page.tsx`

* **전용 컴포넌트**:

  * `AdminUserStats.tsx`: 유저별 통계 테이블
  * `AdminDepartmentChart.tsx`: 부서별 통계 시각화
  * `AdminFilterControls.tsx`: 검색 및 정렬 컨트롤

* **레이아웃 구조**:

  ```
  ┌──────────────────────────────────────────────┐
  │ AdminFilterControls (검색/정렬 UI)           │
  ├──────────────────────────────────────────────┤
  │ AdminDepartmentChart (막대 그래프 - 부서별)  │
  ├──────────────────────────────────────────────┤
  │ AdminUserStats (테이블 - 유저별 통계)         │
  └──────────────────────────────────────────────┘
  ```

* **사용 ShadCN 컴포넌트**:

  * `Table`, `Input`, `Select`, `Card`, `Button`

* **차트**: `recharts` 라이브러리 사용 (막대 그래프)

### 2. 사용자 흐름 및 상호작용

* 페이지 진입 시 자동 통계 로딩
* 검색 입력 → 유저명 실시간 필터링
* 부서 선택 → 특정 부서로 통계 필터링
* 정렬 선택 → 할 일 수 기준 오름/내림 정렬

### 3. API 연동

| 항목       | API 경로                           | 설명               |
| -------- | -------------------------------- | ---------------- |
| 통계 전체 조회 | `/api/admin/stats`               | 유저별 + 부서별 통계 데이터 |
| 필터링/정렬   | 프론트에서 클라이언트 사이드 적용 또는 서버 연동 (옵션) |                  |

### 4. 컴포넌트 및 파일 구조

```
app/
└── admin/
    ├── page.tsx
    ├── AdminUserStats.tsx
    ├── AdminDepartmentChart.tsx
    └── AdminFilterControls.tsx
```

### 5. 테스트 항목

* 통계 데이터가 정확히 표시되는가?
* 검색 필터 적용 시 실시간 반응하는가?
* 부서/정렬 변경 시 테이블과 그래프가 모두 반영되는가?
* UI 반응 속도 및 애니메이션(hover 등) 확인

---

## 🛠️ 백엔드 기능명세서

### 1. API 정의

#### 📌 관리자 통계 조회 API

* **경로**: `app/api/admin/stats/route.ts`

* **메서드**: GET

* **Query Parameters** (선택):

  * `department`: string (필터용)
  * `sort`: `"asc" | "desc"` (정렬 기준)

* **응답 구조**:

```ts
type AdminStats = {
  departmentSummary: {
    department: string;
    totalTodos: number;
    completedTodos: number;
  }[];
  userSummary: {
    userId: string;
    name: string;
    department: string;
    totalTodos: number;
    completedTodos: number;
  }[];
};
```

### 2. Supabase 연동

* **테이블: `client_todos`**

  * `assigned_to` (user ID)
  * `completed`

* **테이블: `users`**

  * `id`, `name`, `department`

* **통계 계산 로직**:

  * 부서별: `users` JOIN `client_todos`, GROUP BY `department`
  * 유저별: `users` JOIN `client_todos`, GROUP BY `user.id`

* **Supabase 예시 쿼리 (부서별)**:

```ts
await supabase
  .from("client_todos")
  .select("assigned_to, completed")
  .eq("department", "마케팅")
  .then(...) // 집계 처리
```

### 3. 테스트 항목

* 데이터 정합성 확인: `총 등록 수`, `완료 수`, `진행률`
* 부서 필터/정렬이 정확히 적용되는가?
* 유저-할 일 조인 시 데이터 누락 없는가?
* 응답 구조가 프론트 요구사항과 일치하는가?

---