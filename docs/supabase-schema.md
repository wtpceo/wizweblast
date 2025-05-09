# WizWebBlast Supabase 스키마 가이드

WizWebBlast 애플리케이션을 위한 Supabase 데이터베이스 스키마 설계 가이드입니다.

## 테이블 구조

### 1. clients (광고주)

| 컬럼명           | 타입      | 설명                   | 제약 조건               |
|---------------|---------|----------------------|---------------------|
| id            | uuid    | 광고주 고유 ID            | PRIMARY KEY         |
| name          | text    | 광고주 이름              | NOT NULL            |
| contract_start| date    | 계약 시작일               | NOT NULL            |
| contract_end  | date    | 계약 종료일               | NOT NULL            |
| status_tags   | text[]  | 상태 태그 배열             | DEFAULT '{}'        |
| created_at    | timestamptz | 생성 일시           | DEFAULT now()       |
| updated_at    | timestamptz | 수정 일시           | DEFAULT now()       |

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contract_start DATE NOT NULL,
  contract_end DATE NOT NULL,
  status_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 설정
CREATE INDEX idx_clients_contract_end ON clients(contract_end);
CREATE INDEX idx_clients_status_tags ON clients USING GIN(status_tags);
```

### 2. client_todos (광고주 할 일)

| 컬럼명        | 타입      | 설명           | 제약 조건                         |
|------------|---------|--------------|-------------------------------|
| id         | uuid    | 할 일 고유 ID    | PRIMARY KEY                   |
| client_id  | uuid    | 광고주 ID       | FOREIGN KEY REFERENCES clients |
| content    | text    | 할 일 내용       | NOT NULL                      |
| assigned_to| text    | 담당자          | NULL                          |
| completed  | boolean | 완료 여부        | DEFAULT false                 |
| created_at | timestamptz | 생성 일시     | DEFAULT now()                 |

```sql
CREATE TABLE client_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  assigned_to TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 설정
CREATE INDEX idx_client_todos_client_id ON client_todos(client_id);
CREATE INDEX idx_client_todos_assigned_to ON client_todos(assigned_to);
```

### 3. client_notes (광고주 메모)

| 컬럼명       | 타입      | 설명       | 제약 조건                         |
|-----------|---------|----------|-------------------------------|
| id        | uuid    | 메모 고유 ID  | PRIMARY KEY                   |
| client_id | uuid    | 광고주 ID   | FOREIGN KEY REFERENCES clients |
| note      | text    | 메모 내용    | NOT NULL                      |
| created_at| timestamptz | 생성 일시 | DEFAULT now()                 |

```sql
CREATE TABLE client_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 설정
CREATE INDEX idx_client_notes_client_id ON client_notes(client_id);
```

### 4. notices (공지사항)

| 컬럼명       | 타입      | 설명       | 제약 조건        |
|-----------|---------|----------|--------------|
| id        | uuid    | 공지사항 ID  | PRIMARY KEY  |
| title     | text    | 제목       | NOT NULL     |
| content   | text    | 내용       | NOT NULL     |
| is_fixed  | boolean | 상단 고정 여부 | DEFAULT false |
| created_at| timestamptz | 생성 일시 | DEFAULT now() |

```sql
CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_fixed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 설정
CREATE INDEX idx_notices_is_fixed ON notices(is_fixed);
CREATE INDEX idx_notices_created_at ON notices(created_at);
```

### 5. client_activities (광고주 활동 로그)

| 컬럼명           | 타입      | 설명       | 제약 조건                         |
|---------------|---------|----------|-------------------------------|
| id            | uuid    | 활동 로그 ID | PRIMARY KEY                   |
| client_id     | uuid    | 광고주 ID   | FOREIGN KEY REFERENCES clients |
| user_id       | text    | 사용자 ID   | NOT NULL                      |
| activity_type | text    | 활동 유형    | NOT NULL                      |
| department    | text    | 부서       | NULL                          |
| created_at    | timestamptz | 생성 일시 | DEFAULT now()                 |

```sql
CREATE TABLE client_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 설정
CREATE INDEX idx_client_activities_client_id ON client_activities(client_id);
CREATE INDEX idx_client_activities_user_id ON client_activities(user_id);
CREATE INDEX idx_client_activities_department ON client_activities(department);
CREATE INDEX idx_client_activities_created_at ON client_activities(created_at);
```

### 6. client_external_data (광고주 외부 데이터)

| 컬럼명        | 타입      | 설명         | 제약 조건                         |
|------------|---------|------------|-------------------------------|
| id         | uuid    | 데이터 ID     | PRIMARY KEY                   |
| client_id  | uuid    | 광고주 ID     | FOREIGN KEY REFERENCES clients |
| platform   | text    | 플랫폼 (출처)   | NOT NULL                      |
| source_url | text    | 수집 URL     | NOT NULL                      |
| scraped_data | jsonb  | 수집 데이터     | NOT NULL                      |
| scraped_at | timestamptz | 수집 일시   | DEFAULT now()                 |

```sql
CREATE TABLE client_external_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  source_url TEXT NOT NULL,
  scraped_data JSONB NOT NULL,
  scraped_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스 설정
CREATE INDEX idx_client_external_data_client_id ON client_external_data(client_id);
CREATE INDEX idx_client_external_data_platform ON client_external_data(platform);
```

## RLS (Row Level Security) 설정

보안을 위해 각 테이블에 RLS 정책을 설정할 수 있습니다. 아래는 기본적인 RLS 정책 예시입니다.

```sql
-- 인증된 사용자만 접근 가능한 정책
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "인증된 사용자만 광고주 조회 가능" ON clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "인증된 사용자만 광고주 수정 가능" ON clients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "인증된 사용자만 광고주 추가 가능" ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "인증된 사용자만 광고주 삭제 가능" ON clients FOR DELETE USING (auth.role() = 'authenticated');
```

## 트리거 설정

데이터 변경 시 자동화된 작업을 실행할 수 있는 트리거를 설정할 수 있습니다.

```sql
-- updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
```

## Supabase 환경 설정

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

`.env.local` 파일에 아래 환경 변수를 설정해야 합니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
``` 