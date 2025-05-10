-- clients 테이블이 있는지 확인하고 없으면 생성
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 업데이트 시 updated_at 자동 갱신을 위한 트리거
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거가 없는 경우에만 생성
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at'
  ) THEN
    CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END $$; 