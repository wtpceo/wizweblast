-- WizWebBlast Supabase 스키마 생성 스크립트

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 기존 테이블 삭제 (있는 경우)
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

-- 다른 객체들과 함께 role 타입 삭제 (CASCADE 옵션 사용)
-- DETAIL: column role of table profiles depends on type role
DROP TYPE IF EXISTS role CASCADE;

-- role 타입 생성
CREATE TYPE role AS ENUM ('user', 'admin');

-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password TEXT NOT NULL,
  role role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 게시물 테이블
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 댓글 테이블
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 설정
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON comments
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- 인덱스 생성
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);

-- 연결 테스트용 함수
CREATE OR REPLACE FUNCTION get_current_timestamp()
RETURNS TIMESTAMP AS $$
BEGIN
  RETURN now();
END;
$$ language 'plpgsql';

-- 1. clients (광고주) 테이블
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contract_start DATE NOT NULL,
  contract_end DATE NOT NULL,
  status_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 광고주 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_clients_contract_end ON clients(contract_end);
CREATE INDEX IF NOT EXISTS idx_clients_status_tags ON clients USING GIN(status_tags);

-- 2. client_todos (광고주 할 일) 테이블
CREATE TABLE IF NOT EXISTS client_todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  assigned_to TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 할 일 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_client_todos_client_id ON client_todos(client_id);
CREATE INDEX IF NOT EXISTS idx_client_todos_assigned_to ON client_todos(assigned_to);

-- 3. client_notes (광고주 메모) 테이블
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 메모 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);

-- 4. notices (공지사항) 테이블
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_fixed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 공지사항 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_notices_is_fixed ON notices(is_fixed);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at);

-- 5. client_activities (광고주 활동 로그) 테이블
CREATE TABLE IF NOT EXISTS client_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 활동 로그 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_client_activities_client_id ON client_activities(client_id);
CREATE INDEX IF NOT EXISTS idx_client_activities_user_id ON client_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_client_activities_department ON client_activities(department);
CREATE INDEX IF NOT EXISTS idx_client_activities_created_at ON client_activities(created_at);

-- 6. client_external_data (광고주 외부 데이터) 테이블
CREATE TABLE IF NOT EXISTS client_external_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  source_url TEXT NOT NULL,
  scraped_data JSONB NOT NULL,
  scraped_at TIMESTAMPTZ DEFAULT now()
);

-- 외부 데이터 테이블 인덱스
CREATE INDEX IF NOT EXISTS idx_client_external_data_client_id ON client_external_data(client_id);
CREATE INDEX IF NOT EXISTS idx_client_external_data_platform ON client_external_data(platform);

-- RLS (Row Level Security) 설정
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_users_select_clients" ON clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_users_insert_clients" ON clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_users_update_clients" ON clients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_users_delete_clients" ON clients FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE client_todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_users_select_todos" ON client_todos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_users_insert_todos" ON client_todos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_users_update_todos" ON client_todos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_users_delete_todos" ON client_todos FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_users_select_notes" ON client_notes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_users_insert_notes" ON client_notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_users_update_notes" ON client_notes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_users_delete_notes" ON client_notes FOR DELETE USING (auth.role() = 'authenticated');

ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_users_select_notices" ON notices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_users_insert_notices" ON notices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "authenticated_users_update_notices" ON notices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "authenticated_users_delete_notices" ON notices FOR DELETE USING (auth.role() = 'authenticated');

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- clients 테이블에 updated_at 자동 업데이트 트리거 적용
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 