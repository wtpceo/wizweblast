좋습니다. 이번에는 \*\*광고주 목록 페이지(`/clients`)\*\*에 대한 **프론트엔드 및 백엔드 기능명세서**를 작성하겠습니다.
이 페이지는 광고주별 카드 UI와 함께, 상세 보기/할 일 추가/메모/민원 상태 등의 관리 액션 진입이 가능한 핵심 페이지입니다.

---

# ✅ 기능명세서: 광고주 목록 페이지 (`/clients`)

---

## 📘 프론트엔드 기능명세서

### 1. 화면 레이아웃 및 디자인 명세

* **페이지 경로**: `app/clients/page.tsx`

* **페이지 전용 컴포넌트**:

  * `app/clients/ClientCard.tsx`: 광고주 카드 컴포넌트

* **레이아웃 구조**:

  * Vertical Stack + 카드 그리드 (2\~3열, 반응형)
  * 상태 뱃지 + 액션 버튼 포함

* **사용 ShadCN 컴포넌트**:

  * `Card`: 광고주 카드
  * `Badge`: 상태 태그 (`관리 소홀`, `민원 중`)
  * `Button`: 상세보기, 할 일 추가, 메모
  * `Popover` 또는 `Dialog`: 할 일 추가 / 메모 기능

* **디자인 디테일**:

  * 업체명 + 아이콘 + 계약기간 표시
  * 상태 뱃지: 이모지 + 색상 강조
  * 카드 Hover 시 약간의 scale-up 애니메이션 적용

### 2. 사용자 흐름 및 상호작용

* `/clients` 진입 시 광고주 목록 자동 조회
* 각 광고주 카드에 버튼 3종:

  * \[상세 보기] → `/clients/[id]`
  * \[할 일 추가] → 할 일 추가 Dialog 열림
  * \[✍️ 메모] → 메모 작성 Dialog 열림

### 3. API 연동

| 항목     | API 경로                    | 설명                 |
| ------ | ------------------------- | ------------------ |
| 광고주 목록 | `/api/clients`            | 전체 광고주 카드 데이터 조회   |
| 할 일 추가 | `/api/clients/[id]/todos` | 광고주별 할 일 추가 (POST) |
| 메모 추가  | `/api/clients/[id]/notes` | 광고주별 메모 추가 (POST)  |

### 4. 컴포넌트 및 파일 구조

```
app/
└── clients/
    ├── page.tsx               # 광고주 목록 페이지
    └── ClientCard.tsx         # 광고주 카드 컴포넌트
components/
└── ClientMemoDialog.tsx       # 메모 작성 다이얼로그
└── ClientTodoDialog.tsx       # 할 일 추가 다이얼로그
```

### 5. 테스트 항목

* 목록 진입 시 카드가 정확히 표시되는가?
* 상태 뱃지가 조건에 따라 정확히 출력되는가?
* 각 버튼 클릭 시 해당 액션이 정상 작동하는가?
* 반응형 및 애니메이션 적용 확인

---

## 🛠️ 백엔드 기능명세서

### 1. API 정의

#### ① 광고주 목록 조회 API

* **파일 경로**: `app/api/clients/route.ts`

* **메서드**: GET

* **엔드포인트**: `/api/clients`

* **응답 구조**:

```ts
type Client = {
  id: string;
  name: string;
  contractStart: string;
  contractEnd: string;
  statusTags: string[]; // 예: ["관리 소홀", "민원 중"]
};
```

#### ② 할 일 추가 API

* **파일 경로**: `app/api/clients/[id]/todos/route.ts`
* **메서드**: POST
* **요청 바디**:

```ts
{
  content: string;
  assignedTo: string;
}
```

#### ③ 메모 추가 API

* **파일 경로**: `app/api/clients/[id]/notes/route.ts`
* **메서드**: POST
* **요청 바디**:

```ts
{
  note: string;
}
```

### 2. 데이터베이스 설계

#### 테이블: `clients`

| 컬럼              | 타입        |
| --------------- | --------- |
| id              | string    |
| name            | string    |
| contract\_start | date      |
| contract\_end   | date      |
| status\_tags    | string\[] |

#### 테이블: `client_todos`

| 컬럼           | 타입          |
| ------------ | ----------- |
| id           | string      |
| client\_id   | string (FK) |
| content      | string      |
| assigned\_to | string      |
| created\_at  | timestamp   |

#### 테이블: `client_notes`

| 컬럼          | 타입          |
| ----------- | ----------- |
| id          | string      |
| client\_id  | string (FK) |
| note        | text        |
| created\_at | timestamp   |

### 3. 테스트 항목

* 광고주 목록이 정상적으로 조회되는가?
* 할 일 추가 시 DB에 저장되는가?
* 메모 추가 시 DB에 저장되는가?
* 상태 태그 필터링 및 표시가 정확한가?

---

다음으로 이어서 광고주 **상세 페이지**, 또는 할 일/메모 다이얼로그 컴포넌트 명세서를 작성해드릴까요?
