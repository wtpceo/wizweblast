-- 클라이언트 테이블 생성
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏢',
  contract_start TIMESTAMP WITH TIME ZONE,
  contract_end TIMESTAMP WITH TIME ZONE,
  status_tags TEXT[] DEFAULT '{}',
  uses_coupon BOOLEAN DEFAULT false,
  publishes_news BOOLEAN DEFAULT false,
  uses_reservation BOOLEAN DEFAULT false,
  phone_number TEXT,
  naver_place_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 외부 데이터 테이블 생성
CREATE TABLE IF NOT EXISTS client_external_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  source_url TEXT NOT NULL,
  scraped_data JSONB NOT NULL,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_client_external_data_client_id ON client_external_data(client_id);
CREATE INDEX IF NOT EXISTS idx_client_external_data_platform ON client_external_data(platform);

-- 샘플 데이터 추가
INSERT INTO clients (name, icon, contract_start, contract_end, status_tags, uses_coupon, publishes_news, uses_reservation, phone_number, naver_place_url)
VALUES 
('대한치킨', '🍗', '2023-09-01', '2024-08-31', ARRAY['정상'], true, true, false, '02-1234-5678', 'https://place.naver.com/restaurant/12345678'),
('서울피자', '🍕', '2023-10-15', '2024-01-15', ARRAY['종료 임박'], false, true, true, '02-1234-5678', 'https://place.naver.com/restaurant/87654321'); 