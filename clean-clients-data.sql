-- 광고주 관련 데이터 모두 초기화하기

-- 1. 먼저 관련 테이블 데이터 삭제
-- 참고: 외래 키 제약으로 인해 삭제 순서가 중요합니다

-- 연결된 메모 삭제
TRUNCATE TABLE client_notes CASCADE;

-- 연결된 할일 삭제
TRUNCATE TABLE client_todos CASCADE;

-- 연결된 활동 데이터 삭제
TRUNCATE TABLE client_activities CASCADE;

-- 연결된 외부 데이터 삭제
TRUNCATE TABLE client_external_data CASCADE;

-- 마지막으로 광고주 데이터 삭제
TRUNCATE TABLE clients CASCADE;

-- 2. 시퀀스 초기화 (옵션)
-- 일부 테이블에서 시퀀스를 사용하는 경우 초기화
-- ALTER SEQUENCE clients_id_seq RESTART WITH 1;

-- 3. 광고주 데이터를 새로 추가할 준비가 완료되었습니다.
-- 이제 새 데이터를 수동으로 추가하거나 CSV 업로드를 통해 추가할 수 있습니다. 