-- client_external_data 테이블 생성
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

GRANT SELECT, INSERT, UPDATE ON clients TO anon;
GRANT SELECT, INSERT, UPDATE ON client_external_data TO anon;

-- clients 테이블에 대한 정책
CREATE POLICY "모든 사용자가 clients 테이블에 접근 가능" ON clients
FOR ALL USING (true);

-- client_external_data 테이블에 대한 정책
CREATE POLICY "모든 사용자가 client_external_data 테이블에 접근 가능" ON client_external_data
FOR ALL USING (true); 