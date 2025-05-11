-- client_todos 테이블에 필요한 컬럼 추가
ALTER TABLE IF EXISTS client_todos 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_by TEXT;

-- 테이블 컬럼 설명 추가
COMMENT ON COLUMN client_todos.completed_at IS '할 일이 완료된 시간';
COMMENT ON COLUMN client_todos.completed_by IS '할 일을 완료한 사용자 ID';

-- 기존 완료된 할 일에 대해 completed_at 설정
UPDATE client_todos 
SET completed_at = created_at
WHERE completed = TRUE AND completed_at IS NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_client_todos_completed ON client_todos(completed);
CREATE INDEX IF NOT EXISTS idx_client_todos_completed_at ON client_todos(completed_at); 