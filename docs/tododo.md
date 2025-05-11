# 기술명세서: Clerk 기반 할 일 할당 시스템

## 1. 시스템 개요

### 1.1 목적
본 시스템은 Clerk 인증 서비스를 활용하여 사용자 간 할 일을 효율적으로 할당하고 관리하기 위한 기능을 제공합니다.

### 1.2 범위
- 사용자 간 할 일 할당 및 관리
- 광고주별 할 일 목록 조회
- 담당자별 할 일 현황 파악
- 부서별 업무 현황 모니터링

## 2. 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트엔드 | Next.js, React, TypeScript, TailwindCSS |
| 백엔드 | Next.js API Routes |
| 데이터베이스 | Supabase (PostgreSQL) |
| 인증 | Clerk Authentication |
| 상태 관리 | React Hooks |
| 배포 | Vercel |

## 3. 데이터베이스 스키마

### 3.1 client_todos 테이블

| 필드명 | 데이터 타입 | 설명 | 제약 조건 |
|--------|------------|------|----------|
| id | UUID | 할 일 고유 식별자 | PRIMARY KEY |
| client_id | UUID | 광고주 ID | NOT NULL, FOREIGN KEY |
| content | TEXT | 할 일 내용 | NOT NULL |
| created_by | TEXT | 할 일 생성자 ID (Clerk) | NOT NULL |
| assigned_to | TEXT | 할 일 담당자 ID (Clerk) | NOT NULL |
| department | TEXT | 담당 부서 | NOT NULL |
| completed | BOOLEAN | 완료 여부 | DEFAULT false |
| created_at | TIMESTAMPTZ | 생성 일시 | DEFAULT now() |
| completed_at | TIMESTAMPTZ | 완료 일시 | NULL 허용 |
| completed_by | TEXT | 완료 처리한 사용자 ID | NULL 허용 |

### 3.2 인덱스

| 테이블 | 인덱스명 | 필드 | 타입 |
|--------|---------|------|------|
| client_todos | idx_todos_client_id | client_id | B-tree |
| client_todos | idx_todos_assigned_to | assigned_to | B-tree |
| client_todos | idx_todos_created_by | created_by | B-tree |
| client_todos | idx_todos_completed | completed | B-tree |
| client_todos | idx_todos_department | department | B-tree |

## 4. API 명세

### 4.1 사용자 관련 API

#### 4.1.1 사용자 목록 조회
- **엔드포인트**: `GET /api/users`
- **인증**: 필요
- **응답 형식**:
  ```json
  [
    {
      "id": "user_2NxYXuFN8DfCJJa",
      "name": "홍길동",
      "email": "hong@example.com",
      "department": "디자인",
      "role": "staff",
      "profileImageUrl": "https://example.com/profile.jpg"
    }
  ]
  ```

### 4.2 할 일 관련 API

#### 4.2.1 할 일 생성
- **엔드포인트**: `POST /api/clients/:id/todos`
- **인증**: 필요
- **요청 형식**:
  ```json
  {
    "content": "메뉴 사진 업데이트 요청하기",
    "assignedTo": "user_2NxYXuFN8DfCJJa",
    "department": "디자인"
  }
  ```
- **응답 형식**:
  ```json
  {
    "success": true,
    "todo": {
      "id": "todo_123",
      "client_id": "client_456",
      "content": "메뉴 사진 업데이트 요청하기",
      "created_by": "user_789",
      "assigned_to": "user_2NxYXuFN8DfCJJa",
      "department": "디자인",
      "completed": false,
      "created_at": "2023-12-15T10:30:00Z",
      "completed_at": null,
      "completed_by": null
    }
  }
  ```

#### 4.2.2 광고주별 할 일 목록 조회
- **엔드포인트**: `GET /api/clients/:id/todos`
- **인증**: 필요
- **응답 형식**:
  ```json
  [
    {
      "id": "todo_123",
      "client_id": "client_456",
      "content": "메뉴 사진 업데이트 요청하기",
      "created_by": "user_789",
      "assigned_to": "user_2NxYXuFN8DfCJJa",
      "department": "디자인",
      "completed": false,
      "created_at": "2023-12-15T10:30:00Z",
      "completed_at": null,
      "completed_by": null
    }
  ]
  ```

#### 4.2.3 사용자에게 할당된 할 일 조회
- **엔드포인트**: `GET /api/todos/assigned-to-me`
- **인증**: 필요
- **응답 형식**:
  ```json
  [
    {
      "id": "todo_123",
      "client_id": "client_456",
      "content": "메뉴 사진 업데이트 요청하기",
      "created_by": "user_789",
      "assigned_to": "user_2NxYXuFN8DfCJJa",
      "department": "디자인",
      "completed": false,
      "created_at": "2023-12-15T10:30:00Z",
      "completed_at": null,
      "completed_by": null,
      "clients": {
        "id": "client_456",
        "name": "대한치킨",
        "icon": "🍗"
      }
    }
  ]
  ```

#### 4.2.4 사용자가 생성한 할 일 조회
- **엔드포인트**: `GET /api/todos/created-by-me`
- **인증**: 필요
- **응답 형식**: 4.2.3과 동일

#### 4.2.5 할 일 상태 업데이트
- **엔드포인트**: `PATCH /api/todos/:id`
- **인증**: 필요
- **요청 형식**:
  ```json
  {
    "completed": true
  }
  ```
- **응답 형식**:
  ```json
  {
    "success": true,
    "todo": {
      "id": "todo_123",
      "client_id": "client_456",
      "content": "메뉴 사진 업데이트 요청하기",
      "created_by": "user_789",
      "assigned_to": "user_2NxYXuFN8DfCJJa",
      "department": "디자인",
      "completed": true,
      "created_at": "2023-12-15T10:30:00Z",
      "completed_at": "2023-12-16T09:45:00Z",
      "completed_by": "user_2NxYXuFN8DfCJJa"
    }
  }
  ```

## 5. 컴포넌트 명세

### 5.1 할 일 할당 폼 컴포넌트

#### 5.1.1 TodoAssignmentForm
- **목적**: 새 할 일 생성 및 사용자 할당
- **속성**:
  - `clientId`: 광고주 ID
  - `onSuccess`: 성공 시 콜백 함수
- **상태**:
  - `content`: 할 일 내용
  - `selectedUserId`: 선택된 담당자 ID
  - `department`: 담당 부서
  - `users`: 사용자 목록
  - `isLoading`: 로딩 상태

### 5.2 할 일 목록 컴포넌트

#### 5.2.1 TodoList
- **목적**: 할 일 목록 표시 및 상태 관리
- **속성**:
  - `filter`: 필터링 옵션 (선택사항)
  - `clientId`: 광고주 ID (선택사항)
- **상태**:
  - `todos`: 할 일 목록
  - `isLoading`: 로딩 상태
  - `users`: 사용자 정보 맵

## 6. Clerk 메타데이터 구조

### 6.1 사용자 공개 메타데이터
```json
{
  "department": "디자인",
  "role": "staff",
  "position": "디자이너"
}
```

### 6.2 사용자 비공개 메타데이터
```json
{
  "employeeId": "EMP123",
  "permissions": ["create_todo", "assign_todo", "view_all_todos"]
}
```

## 7. 구현 세부사항

### 7.1 사용자 목록 API 구현

```typescript
// /api/users/route.ts
import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const users = await clerkClient.users.getUserList({
      limit: 100,
    });

    const simplifiedUsers = users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0]?.emailAddress,
      profileImageUrl: user.profileImageUrl,
      department: user.publicMetadata.department || '미지정',
      role: user.publicMetadata.role || 'staff'
    }));

    return NextResponse.json(simplifiedUsers);
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '사용자 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

### 7.2 할 일 생성 API 구현

```typescript
// /api/clients/[id]/todos/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const clientId = params.id;
    const body = await request.json();
    const { content, assignedTo, department } = body;

    if (!content || !assignedTo) {
      return NextResponse.json(
        { error: '내용과 담당자는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('client_todos')
      .insert({
        client_id: clientId,
        content,
        created_by: userId,
        assigned_to: assignedTo,
        department,
        completed: false,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('할 일 저장 오류:', error);
      return NextResponse.json(
        { error: '할 일 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, todo: data[0] });
  } catch (error) {
    console.error('할 일 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
```

### 7.3 데이터베이스 마이그레이션 SQL

```sql
-- 기존 테이블 백업
CREATE TABLE IF NOT EXISTS client_todos_backup AS
SELECT * FROM client_todos;

-- 테이블 변경
ALTER TABLE client_todos
ADD COLUMN IF NOT EXISTS created_by TEXT,
ADD COLUMN IF NOT EXISTS assigned_to TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS completed_by TEXT;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_todos_assigned_to ON client_todos(assigned_to);
CREATE INDEX IF NOT EXISTS idx_todos_created_by ON client_todos(created_by);
CREATE INDEX IF NOT EXISTS idx_todos_department ON client_todos(department);
```

## 8. 성능 고려사항

### 8.1 데이터베이스 쿼리 최적화
- 인덱스를 활용하여 조회 성능 향상
- 필요한 필드만 선택적으로 조회
- 페이지네이션 구현으로 대량 데이터 처리 최적화

### 8.2 클라이언트 측 성능
- 상태 관리 최적화
- 불필요한 리렌더링 방지
- 데이터 캐싱 구현

## 9. 보안 고려사항

### 9.1 인증 및 권한 부여
- Clerk을 통한 사용자 인증
- API 엔드포인트에 인증 미들웨어 적용
- 권한 기반 접근 제어

### 9.2 데이터 보안
- 민감한 정보 암호화
- HTTPS 통신 필수
- CORS 정책 설정

## 10. 테스트 계획

### 10.1 단위 테스트
- API 엔드포인트 테스트
- 컴포넌트 렌더링 테스트
- 상태 관리 로직 테스트

### 10.2 통합 테스트
- 사용자 인증 및 권한 부여 테스트
- API 엔드포인트 간 상호작용 테스트
- 데이터베이스 연동 테스트

### 10.3 사용자 인터페이스 테스트
- 할 일 생성 및 할당 기능 테스트
- 할 일 상태 업데이트 테스트
- 반응형 디자인 테스트

## 11. 배포 계획

### 11.1 개발 환경
- 로컬 개발 환경 설정
- Clerk 개발 환경 설정
- Supabase 개발 환경 설정

### 11.2 스테이징 환경
- Vercel 스테이징 환경 설정
- 테스트 데이터 구성
- 성능 및 안정성 테스트

### 11.3 프로덕션 환경
- Vercel 프로덕션 환경 설정
- 데이터베이스 마이그레이션
- 모니터링 및 로깅 설정

## 12. 유지보수 계획

### 12.1 모니터링
- API 응답 시간 모니터링
- 오류 발생률 모니터링
- 사용자 행동 분석

### 12.2 업데이트 및 개선
- 정기적인 보안 업데이트
- 사용자 피드백 기반 기능 개선
- 성능 최적화

## 13. 확장 가능성

### 13.1 추가 기능
- 할 일 알림 시스템
- 할 일 반복 일정 설정
- 할 일 우선순위 지정

### 13.2 통합 가능성
- 캘린더 시스템 연동
- 메시징 플랫폼 연동
- 분석 도구 연동

## 14. 일정 및 마일스톤

| 단계 | 설명 | 예상 기간 |
|------|------|----------|
| 1 | 데이터베이스 스키마 설계 및 구현 | 1주 |
| 2 | API 엔드포인트 개발 | 2주 |
| 3 | UI 컴포넌트 개발 | 2주 |
| 4 | Clerk 인증 통합 | 1주 |
| 5 | 테스트 및 버그 수정 | 1주 |
| 6 | 배포 및 문서화 | 1주 |

## 15. 참고 자료

- [Clerk 공식 문서](https://clerk.com/docs)
- [Supabase 공식 문서](https://supabase.io/docs)
- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://reactjs.org/docs)
