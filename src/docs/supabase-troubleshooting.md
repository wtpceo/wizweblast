# Supabase 문제 해결 가이드

## 일반적인 오류

### 404 오류 (API 응답 오류)

광고주 정보를 찾을 수 없거나 API 응답이 404를 반환하는 경우 다음 단계를 따르세요:

1. **Supabase 연결 확인**: 환경 변수가 올바르게 설정되어 있는지 확인합니다.
   - `.env.local` 파일에 다음 변수가 설정되어 있어야 합니다:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
     ```

2. **테이블 초기화**: 애플리케이션에서 자동으로 테이블을 초기화하는 기능을 사용하세요.
   - 웹 페이지 하단에 표시되는 Supabase 상태 배너에서 "Supabase 스키마 설정" 버튼을 클릭합니다.
   - 또는 직접 API 엔드포인트를 호출합니다: `/api/setup-supabase`

3. **수동 스키마 적용**: Supabase 대시보드에서 직접 SQL 스크립트를 실행할 수 있습니다.
   - Supabase 대시보드 > SQL 에디터로 이동
   - `src/scripts/supabase-schema-fix.sql` 파일의 내용을 복사하여 실행

## 스키마 문제

### "Could not find the 'completed_at' column of 'client_todos'"

할 일 완료 기능 사용 시 이 오류가 발생하는 경우:

1. 자동 설정 사용:
   - 웹 페이지 하단의 Supabase 배너에서 "Supabase 스키마 설정" 버튼 클릭
   - 또는 `/api/update-todos-schema` API 엔드포인트 호출

2. 수동 SQL 실행:
   ```sql
   -- completed_at 컬럼 추가
   ALTER TABLE public.client_todos ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
   
   -- completed_by 컬럼 추가
   ALTER TABLE public.client_todos ADD COLUMN IF NOT EXISTS completed_by TEXT;
   
   -- 기존에 완료된 할 일에 completed_at 설정
   UPDATE public.client_todos
   SET completed_at = created_at
   WHERE completed = TRUE AND completed_at IS NULL;
   ```

## 로컬 스토리지 vs. Supabase

애플리케이션은 다음 로직으로 작동합니다:

1. 먼저 로컬 스토리지에서 데이터를 확인
2. 로컬 스토리지에 없으면 Supabase에서 데이터 조회
3. Supabase에서 조회한 데이터를 로컬 스토리지에 캐싱

데이터 불일치가 발생하면:

1. 로컬 스토리지 초기화:
   ```javascript
   // 개발자 도구 콘솔에서 실행
   localStorage.clear();
   ```
2. 페이지 새로고침

## 디버깅 도구

다음 API 엔드포인트를 사용하여 연결 및 데이터베이스 상태를 확인할 수 있습니다:

- `/api/test-supabase` - Supabase 연결 및 기본 테이블 테스트
- `/api/setup-supabase` - 테이블 설정 및 초기화

## 알려진 문제

1. **임시 ID로 생성된 할 일**: ID가 `temp-`로 시작하는 할 일은 Supabase에 저장되지 않고 로컬 스토리지에만 존재합니다.

2. **스키마 변경 후 즉시 반영되지 않음**: 스키마를 변경한 후 페이지를 새로고침해야 변경사항이 적용됩니다. 