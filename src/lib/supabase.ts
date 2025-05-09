import { createClient } from '@supabase/supabase-js';

// 빌드 중 오류를 방지하기 위해 하드코딩된 값으로 설정
// 프로덕션 환경에서는 환경 변수가 제대로 설정되어 있어야 합니다.
const supabaseUrl = 'https://fqzqmnmyffaibkpnytii.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxenFtbm15ZmZhaWJrcG55dGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Nzg3NzIsImV4cCI6MjA2MjI1NDc3Mn0.wFelzClTbOZrLOUcflat4MQpXdOtkjo43_WRIqoEEaA';

// Supabase 클라이언트 객체 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 