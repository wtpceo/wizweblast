-- 테이블 존재 여부 확인
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    -- client_todos 테이블이 존재하는지 확인
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'client_todos'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        -- 테이블이 없으면 생성
        CREATE TABLE public.client_todos (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_id UUID NOT NULL,
            content TEXT NOT NULL,
            assigned_to TEXT,
            completed BOOLEAN DEFAULT false,
            completed_at TIMESTAMPTZ,
            completed_by TEXT,
            created_at TIMESTAMPTZ DEFAULT now()
        );
        
        RAISE NOTICE 'client_todos 테이블을 새로 생성했습니다.';
    ELSE
        RAISE NOTICE 'client_todos 테이블이 이미 존재합니다.';
    END IF;
END $$;

-- completed_at 컬럼 존재 여부 확인 및 추가
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- completed_at 컬럼이 존재하는지 확인
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'client_todos' 
        AND column_name = 'completed_at'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        -- 컬럼이 없으면 추가
        ALTER TABLE public.client_todos ADD COLUMN completed_at TIMESTAMPTZ;
        RAISE NOTICE 'completed_at 컬럼을 추가했습니다.';
    ELSE
        RAISE NOTICE 'completed_at 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- completed_by 컬럼 존재 여부 확인 및 추가
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- completed_by 컬럼이 존재하는지 확인
    SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'client_todos' 
        AND column_name = 'completed_by'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        -- 컬럼이 없으면 추가
        ALTER TABLE public.client_todos ADD COLUMN completed_by TEXT;
        RAISE NOTICE 'completed_by 컬럼을 추가했습니다.';
    ELSE
        RAISE NOTICE 'completed_by 컬럼이 이미 존재합니다.';
    END IF;
END $$;

-- 기존에 완료된 할 일에 completed_at 설정
UPDATE public.client_todos
SET completed_at = created_at
WHERE completed = TRUE AND completed_at IS NULL;

-- 완료 상태 인덱스 추가 
CREATE INDEX IF NOT EXISTS idx_client_todos_completed ON public.client_todos(completed);

-- 완료 시간 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_client_todos_completed_at ON public.client_todos(completed_at);

-- 테이블 컬럼 조회 (확인용)
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'client_todos'
ORDER BY ordinal_position; 