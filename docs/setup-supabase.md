# Supabase 설정 가이드

이 문서는 WizWebBlast 애플리케이션에서 Supabase를 사용하기 위한 설정 방법을 안내합니다.

## 1. 기본 설정

### 환경 변수 설정

`.env.local` 파일에 다음 변수들을 설정하세요:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 2. 스키마 설정 방법

### 방법 1: 자동 설정 (추천) - 관리자 페이지 이용

1. 관리자 페이지(`/admin/supabase`)로 이동합니다.
2. 먼저 "SQL 함수 설정" 버튼을 클릭합니다 (중요: 이 단계를 먼저 수행해야 합니다).
3. 다음으로 "테이블 스키마 설정" 버튼을 클릭합니다.
4. 테이블이 성공적으로 생성되면 메모 및 할 일 기능을 사용할 수 있습니다.

> **중요**: 순서대로 진행하세요! SQL 함수를 먼저 설정한 다음, 테이블 스키마를 설정해야 합니다.

### 방법 2: API 직접 호출

```bash
# 1. 먼저 기본 함수 설정 (필수)
curl -X POST http://localhost:3000/api/setup-functions

# 2. 다음으로 테이블 스키마 설정
curl -X POST http://localhost:3000/api/setup-supabase
```

### 방법 3: 수동 설정 (Supabase SQL 에디터)

Supabase 대시보드의 SQL 에디터에서 다음 스크립트를 실행하세요:

#### 1. UUID 확장 활성화 및 기본 함수 생성 (필수 첫 단계)

```sql
-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SQL 실행 함수 (스키마 설정에 필요)
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;
```

#### 2. 기본 테이블 생성 (두 번째 단계)

```sql
-- 광고주 테이블
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏢',
  contract_start DATE NOT NULL,
  contract_end DATE NOT NULL,
  status_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  uses_coupon BOOLEAN DEFAULT false,
  publishes_news BOOLEAN DEFAULT false,
  uses_reservation BOOLEAN DEFAULT false,
  phone_number TEXT DEFAULT '',
  naver_place_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 광고주 할 일 테이블
CREATE TABLE IF NOT EXISTS client_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  content TEXT NOT NULL,
  assigned_to TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_client_todos_client_id ON client_todos(client_id);

-- 광고주 메모 테이블
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL,
  note TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
```

## 3. 문제 해결

### `exec_sql 함수가 존재하지 않습니다` 오류

이 오류는 Supabase에 `exec_sql` 함수가 생성되지 않았을 때 발생합니다.
1. 관리자 페이지(`/admin/supabase`)로 이동
2. "SQL 함수 설정" 버튼 클릭

### `uuid_generate_v4 함수가 존재하지 않습니다` 오류

이 오류는 Supabase에 UUID 확장이 활성화되지 않았을 때 발생합니다.
1. 관리자 페이지(`/admin/supabase`)로 이동
2. "SQL 함수 설정" 버튼 클릭 (이 과정에서 UUID 확장이 설치됨)

### 테이블이 존재하지 않는 오류

테이블이 없을 경우:
1. 관리자 페이지(`/admin/supabase`)로 이동
2. 먼저 "SQL 함수 설정" 버튼 클릭
3. 다음으로 "테이블 스키마 설정" 버튼 클릭

### 자주 발생하는 오류 메시지 및 해결 방법

| 오류 메시지 | 해결 방법 |
|------------|-----------|
| "relation \"client_notes\" does not exist" | 관리자 페이지에서 테이블 스키마 설정 |
| "function \"exec_sql\" does not exist" | 관리자 페이지에서 SQL 함수 설정 |
| "function \"uuid_generate_v4\" does not exist" | 관리자 페이지에서 SQL 함수 설정 |
| "메모 추가에 실패했습니다" | 관리자 페이지에서 SQL 함수 설정 후 테이블 스키마 설정 |
| "할 일 등록에 실패했습니다" | 관리자 페이지에서 SQL 함수 설정 후 테이블 스키마 설정 |

## 4. 테스트 및 확인

설정이 완료되었는지 확인하려면 다음 API를 호출해보세요:

```bash
# Supabase 연결 테스트
curl -X GET http://localhost:3000/api/supabase-test

# 테이블 목록 확인
curl -X GET http://localhost:3000/api/supabase-test?action=list_tables
```

설정이 성공적으로 완료되면 광고주 상세 페이지에서 메모와 할 일 기능을 정상적으로 사용할 수 있습니다. 