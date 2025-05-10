# Supabase 설정 및 사용 가이드

이 문서는 WizWebBlast 프로젝트에서 Supabase를 설정하고 사용하는 방법을 안내합니다.

## 목차

1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [데이터베이스 테이블 생성](#3-데이터베이스-테이블-생성)
4. [데이터베이스 함수 생성](#4-데이터베이스-함수-생성)
5. [권한 설정](#5-권한-설정)
6. [로컬 개발환경 연결](#6-로컬-개발환경-연결)
7. [Supabase API 호출 예제](#7-supabase-api-호출-예제)

## 1. Supabase 프로젝트 생성

1. [Supabase 웹사이트](https://supabase.com/)에 접속하여 계정을 생성하거나 로그인합니다.
2. "New Project" 버튼을 클릭합니다.
3. 프로젝트 이름을 `wizweblast`로 설정합니다.
4. 데이터베이스 비밀번호를 설정합니다 (안전하게 보관하세요).
5. 지역은 서비스 대상 사용자와 가까운 곳을 선택합니다 (예: 한국 사용자라면 Tokyo).
6. 프로젝트 생성 버튼을 클릭하고 프로젝트가 생성될 때까지 기다립니다.

## 2. 환경 변수 설정

프로젝트가 생성되면 API 키와 URL을 찾아 환경 변수에 설정해야 합니다.

1. Supabase 대시보드에서 "Settings" > "API" 메뉴로 이동합니다.
2. 프로젝트의 루트 디렉토리에 `.env.local` 파일을 생성하고 다음 값들을 설정합니다:

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 익명(anon/public) 키 - 클라이언트 사이드에서 사용
- `SUPABASE_SERVICE_ROLE_KEY`: 서비스 롤 키 - 서버 사이드에서만 사용 (보안 주의)

## 3. 데이터베이스 테이블 생성

Supabase 대시보드에서 SQL 편집기를 사용하여 테이블을 생성합니다.

1. Supabase 대시보드에서 "SQL Editor" 탭으로 이동합니다.
2. "New Query" 버튼을 클릭합니다.
3. `src/scripts/supabase-tables.sql` 파일의 내용을 복사하여 붙여넣습니다.
4. "Run" 버튼을 클릭하여 SQL 스크립트를 실행합니다.

이 스크립트는 다음 테이블을 생성합니다:
- `clients`: 광고주(클라이언트) 정보
- `client_todos`: 광고주 관련 할 일
- `client_notes`: 광고주 관련 메모
- `notices`: 공지사항
- `client_activities`: 광고주 관련 활동 내역
- `client_external_data`: 광고주 관련 외부 데이터(크롤링)
- `users`: 시스템 사용자

## 4. 데이터베이스 함수 생성

Supabase의 데이터베이스 함수를 생성하려면:

1. Supabase 대시보드에서 "SQL Editor" 탭으로 이동합니다.
2. "New Query" 버튼을 클릭합니다.
3. `src/scripts/supabase-functions.sql` 파일의 내용을 복사하여 붙여넣습니다.
4. "Run" 버튼을 클릭하여 SQL 스크립트를 실행합니다.

이 스크립트는 다음 함수를 생성합니다:
- `get_server_timestamp()`: 서버 시간 반환
- `get_table_count(table_name)`: 테이블의 행 수 반환
- `get_client_full_data(client_id)`: 특정 클라이언트의 모든 관련 데이터 반환
- `get_expiring_contracts(days_threshold)`: 계약 만료가 임박한 클라이언트 목록 반환
- `log_client_activity(...)`: 클라이언트 활동 로그 추가
- `update_client_external_data(...)`: 클라이언트 외부 데이터 업데이트
- `update_client_status_tags(...)`: 클라이언트 상태 태그 업데이트
- `get_table_schema(table_name)`: 테이블 스키마 정보 반환

## 5. 권한 설정

Supabase의 Row Level Security(RLS) 정책을 설정합니다:

1. Supabase 대시보드에서 "Authentication" > "Policies" 탭으로 이동합니다.
2. 각 테이블에 대해 적절한 RLS 정책을 설정합니다.

기본 RLS 정책 예시 (SQL Editor에서 실행):

```sql
-- 클라이언트 테이블: 인증된 사용자만 열람 가능
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "클라이언트 정보는 인증된 사용자만" ON clients
  FOR SELECT USING (auth.role() = 'authenticated');

-- 업데이트는 인증된 사용자만 가능
CREATE POLICY "클라이언트 정보는 인증된 사용자만 업데이트" ON clients
  FOR UPDATE USING (auth.role() = 'authenticated');
```

## 6. 로컬 개발환경 연결

프로젝트에서 Supabase를 사용하려면:

1. `.env.local` 파일이 올바르게 설정되어 있는지 확인합니다.
2. 개발 서버를 실행합니다:

```bash
npm run dev
```

3. 브라우저에서 http://localhost:3000/supabase-view 로 접속하여 Supabase 데이터 뷰어를 확인합니다.

## 7. Supabase API 호출 예제

### 클라이언트 컴포넌트에서 사용

```tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  
  useEffect(() => {
    async function fetchClients() {
      const supabase = createBrowserClient();
      
      // 클라이언트 목록 가져오기
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('클라이언트 데이터 로딩 오류:', error);
        return;
      }
      
      setClients(data || []);
    }
    
    fetchClients();
  }, []);
  
  return (
    <div>
      <h1>광고주 목록</h1>
      <ul>
        {clients.map(client => (
          <li key={client.id}>{client.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 서버 컴포넌트에서 사용

```tsx
import { createServerClient } from '@/lib/supabase';

export default async function ClientsPage() {
  const supabase = createServerClient();
  
  // 클라이언트 목록 가져오기
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('name');
    
  if (error) {
    console.error('클라이언트 데이터 로딩 오류:', error);
    return <div>오류가 발생했습니다.</div>;
  }
  
  return (
    <div>
      <h1>광고주 목록</h1>
      <ul>
        {clients.map(client => (
          <li key={client.id}>{client.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### API 라우트에서 사용

```tsx
// src/app/api/clients/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServerClient();
    
    // 클라이언트 목록 가져오기
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');
      
    if (error) {
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (err) {
    console.error('클라이언트 API 오류:', err);
    return NextResponse.json(
      { error: '광고주 데이터를 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
  }
}
```

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Next.js 통합 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase JavaScript 클라이언트 API](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase RLS 정책 가이드](https://supabase.com/docs/guides/auth/row-level-security) 