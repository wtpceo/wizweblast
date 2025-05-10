-- Supabase 테이블 생성 스크립트
-- 이 스크립트는 Supabase SQL 편집기에서 실행하여 필요한 테이블을 생성합니다.

-- 광고주(클라이언트) 테이블
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contract_start TIMESTAMPTZ,
  contract_end TIMESTAMPTZ,
  status_tags TEXT[] DEFAULT '{정상}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 자동 업데이트 설정을 위한 트리거
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_modtime
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- 광고주 할 일 테이블
CREATE TABLE IF NOT EXISTS client_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  assigned_to TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_client_todos_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 광고주 메모 테이블
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_client_notes_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 공지사항 테이블
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_fixed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 광고주 활동 내역 테이블
CREATE TABLE IF NOT EXISTS client_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_client_activities_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 광고주 외부 데이터 테이블 (크롤링 데이터)
CREATE TABLE IF NOT EXISTS client_external_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  source_url TEXT NOT NULL,
  scraped_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_client_external_data_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT uq_client_platform UNIQUE (client_id, platform)
);

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  department TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_clients_contract_end ON clients(contract_end);
CREATE INDEX IF NOT EXISTS idx_client_todos_client_id ON client_todos(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_activities_client_id ON client_activities(client_id);
CREATE INDEX IF NOT EXISTS idx_client_activities_user_id ON client_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_client_external_data_client_id ON client_external_data(client_id);
CREATE INDEX IF NOT EXISTS idx_client_external_data_platform ON client_external_data(platform);

-- 테이블에 설명 추가
COMMENT ON TABLE clients IS '광고주(클라이언트) 정보를 저장하는 테이블';
COMMENT ON TABLE client_todos IS '광고주 관련 할 일 목록을 저장하는 테이블';
COMMENT ON TABLE client_notes IS '광고주 관련 메모를 저장하는 테이블';
COMMENT ON TABLE notices IS '시스템 전체 공지사항을 저장하는 테이블';
COMMENT ON TABLE client_activities IS '광고주 관련 활동 내역을 저장하는 테이블';
COMMENT ON TABLE client_external_data IS '광고주 관련 외부 데이터(크롤링)를 저장하는 테이블';
COMMENT ON TABLE users IS '시스템 사용자 정보를 저장하는 테이블';

-- 샘플 데이터 추가
INSERT INTO clients (name, contract_start, contract_end, status_tags)
VALUES
  ('위즈웹 디자인', '2023-01-01', '2023-12-31', '{정상,계약중}'),
  ('스마트 마케팅', '2023-02-15', '2023-11-15', '{정상,계약중}'),
  ('블라스트 미디어', '2023-03-01', '2024-03-01', '{정상,계약중}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO notices (title, content, is_fixed)
VALUES
  ('시스템 업데이트 안내', '새로운 기능이 추가되었습니다. 자세한 내용은 공지사항을 확인해주세요.', TRUE),
  ('휴일 고객센터 운영 안내', '추석 연휴 기간에는 고객센터 운영 시간이 단축됩니다.', FALSE)
ON CONFLICT (id) DO NOTHING; 