import { createClient } from '@supabase/supabase-js';

// URL과 anon 키를 하드코딩하는 대신 환경 변수에서 가져오도록 설정
// 프로덕션 환경에서는 .env.local 파일에 이 값들을 설정해야 합니다.
// 예: NEXT_PUBLIC_SUPABASE_URL=https://fqzqmnmyffaibkpnytii.supabase.co
// 예: NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fqzqmnmyffaibkpnytii.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxenFtbm15ZmZhaWJrcG55dGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Nzg3NzIsImV4cCI6MjA2MjI1NDc3Mn0.wFelzClTbOZrLOUcflat4MQpXdOtkjo43_WRIqoEEaA';

// Supabase 클라이언트 객체 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 