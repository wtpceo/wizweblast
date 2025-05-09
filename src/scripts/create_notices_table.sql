-- notices 테이블 생성 스크립트
-- 이 스크립트를 Supabase SQL 편집기에서 실행해주세요

CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_fixed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS 정책 설정 (필요에 따라 조정)
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 공지사항을 읽을 수 있도록 정책 추가
CREATE POLICY "공지사항 읽기 허용" ON notices
  FOR SELECT USING (true);

-- 인증된 사용자만 공지사항을 추가/수정/삭제할 수 있도록 정책 추가
CREATE POLICY "인증된 사용자 공지사항 추가" ON notices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자 공지사항 수정" ON notices
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "인증된 사용자 공지사항 삭제" ON notices
  FOR DELETE USING (auth.role() = 'authenticated');

-- 테스트용 샘플 데이터 삽입
INSERT INTO notices (title, content, is_fixed, created_at)
VALUES 
  ('🎉 신규 기능 출시 안내', '새로운 기능이 추가되었습니다. 자세한 내용은 본문을 확인해주세요.', true, now()),
  ('캠페인 일정 안내', '다가오는 캠페인 일정을 확인하세요.', true, now() - interval '1 day'),
  ('시스템 점검 예정', '시스템 점검이 예정되어 있습니다. 자세한 일정은 본문을 참고하세요.', false, now() - interval '2 days'),
  ('설문 참여 요청', '새로운 기능 개선을 위한 설문에 참여해주세요.', false, now() - interval '5 days'); 