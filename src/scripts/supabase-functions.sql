-- Supabase 함수 생성 스크립트
-- 이 스크립트는 Supabase SQL 편집기에서 실행하여 필요한 함수를 생성합니다.

-- 서버 타임스탬프 가져오는 함수
CREATE OR REPLACE FUNCTION get_server_timestamp()
RETURNS TIMESTAMPTZ
LANGUAGE SQL
AS $$
  SELECT NOW();
$$;

-- 테이블 행 수 가져오는 함수
CREATE OR REPLACE FUNCTION get_table_count(table_name TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  count_result INTEGER;
BEGIN
  EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO count_result;
  RETURN count_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN -1;
END;
$$;

-- 특정 클라이언트의 모든 관련 데이터 가져오기
CREATE OR REPLACE FUNCTION get_client_full_data(client_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  client_data JSON;
  todos_data JSON;
  notes_data JSON;
  activities_data JSON;
  external_data JSON;
  result JSON;
BEGIN
  -- 클라이언트 기본 정보
  SELECT row_to_json(c) INTO client_data
  FROM clients c
  WHERE c.id = client_id;
  
  -- 할 일 목록
  SELECT json_agg(t) INTO todos_data
  FROM client_todos t
  WHERE t.client_id = client_id;
  
  -- 메모 목록
  SELECT json_agg(n) INTO notes_data
  FROM client_notes n
  WHERE n.client_id = client_id;
  
  -- 활동 내역
  SELECT json_agg(a) INTO activities_data
  FROM client_activities a
  WHERE a.client_id = client_id;
  
  -- 외부 데이터
  SELECT json_agg(e) INTO external_data
  FROM client_external_data e
  WHERE e.client_id = client_id;
  
  -- 결과 조합
  SELECT json_build_object(
    'client', client_data,
    'todos', COALESCE(todos_data, '[]'::json),
    'notes', COALESCE(notes_data, '[]'::json),
    'activities', COALESCE(activities_data, '[]'::json),
    'external_data', COALESCE(external_data, '[]'::json)
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 계약 만료가 임박한 클라이언트 목록 가져오기
CREATE OR REPLACE FUNCTION get_expiring_contracts(days_threshold INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  name TEXT,
  contract_end TIMESTAMPTZ,
  days_remaining INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.contract_end::TIMESTAMPTZ,
    (c.contract_end::DATE - CURRENT_DATE) AS days_remaining
  FROM 
    clients c
  WHERE 
    c.contract_end IS NOT NULL
    AND (c.contract_end::DATE - CURRENT_DATE) <= days_threshold
    AND (c.contract_end::DATE - CURRENT_DATE) >= 0
  ORDER BY 
    days_remaining ASC;
END;
$$;

-- 클라이언트 활동 로그 추가 함수
CREATE OR REPLACE FUNCTION log_client_activity(
  p_client_id UUID,
  p_user_id UUID,
  p_activity_type TEXT,
  p_department TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_activity_id UUID;
BEGIN
  INSERT INTO client_activities (
    client_id,
    user_id,
    activity_type,
    department,
    created_at
  ) VALUES (
    p_client_id,
    p_user_id,
    p_activity_type,
    p_department,
    NOW()
  )
  RETURNING id INTO new_activity_id;
  
  RETURN new_activity_id;
END;
$$;

-- 클라이언트 외부 데이터 업데이트 함수
CREATE OR REPLACE FUNCTION update_client_external_data(
  p_client_id UUID,
  p_platform TEXT,
  p_source_url TEXT,
  p_scraped_data JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  existing_count INTEGER;
BEGIN
  -- 기존 데이터 확인
  SELECT COUNT(*) INTO existing_count
  FROM client_external_data
  WHERE client_id = p_client_id AND platform = p_platform;
  
  -- 기존 데이터가 있으면 업데이트, 없으면 삽입
  IF existing_count > 0 THEN
    UPDATE client_external_data
    SET 
      source_url = p_source_url,
      scraped_data = p_scraped_data,
      scraped_at = NOW()
    WHERE 
      client_id = p_client_id AND platform = p_platform;
  ELSE
    INSERT INTO client_external_data (
      client_id,
      platform,
      source_url,
      scraped_data,
      scraped_at
    ) VALUES (
      p_client_id,
      p_platform,
      p_source_url,
      p_scraped_data,
      NOW()
    );
  END IF;
  
  RETURN TRUE;
END;
$$;

-- 클라이언트 상태 태그 업데이트 함수
CREATE OR REPLACE FUNCTION update_client_status_tags(
  p_client_id UUID,
  p_status_tags TEXT[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE clients
  SET status_tags = p_status_tags
  WHERE id = p_client_id;
  
  RETURN FOUND;
END;
$$;

-- 테이블 스키마 정보 가져오기
CREATE OR REPLACE FUNCTION get_table_schema(table_name TEXT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'column_name', column_name,
      'data_type', data_type,
      'is_nullable', is_nullable,
      'column_default', column_default
    )
  ) INTO result
  FROM information_schema.columns
  WHERE table_name = $1
  AND table_schema = 'public';
  
  RETURN result;
END;
$$;

-- 사용 방법 예시:
-- SELECT get_server_timestamp();
-- SELECT get_table_count('clients');
-- SELECT get_client_full_data('클라이언트_ID');
-- SELECT * FROM get_expiring_contracts(30);
-- SELECT log_client_activity('클라이언트_ID', '사용자_ID', '활동_타입', '부서');
-- SELECT update_client_external_data('클라이언트_ID', '네이버', 'https://place.naver.com/...', '{"key": "value"}'::jsonb);
-- SELECT update_client_status_tags('클라이언트_ID', ARRAY['정상', '계약 갱신 필요']);
-- SELECT get_table_schema('clients'); 