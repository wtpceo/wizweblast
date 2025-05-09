/**
 * 테스트 계정 생성 스크립트
 * 
 * 사용 방법:
 * 1. npm install -g ts-node (전역 설치)
 * 2. ts-node src/scripts/create-test-accounts.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

// Supabase 연결 정보
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fqzqmnmyffaibkpnytii.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxenFtbm15ZmZhaWJrcG55dGlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Nzg3NzIsImV4cCI6MjA2MjI1NDc3Mn0.wFelzClTbOZrLOUcflat4MQpXdOtkjo43_WRIqoEEaA';

// Supabase 클라이언트 생성
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// 생성할 테스트 계정 목록
const testAccounts = [
  {
    email: 'admin@wizwebblast.com',
    password: 'admin123456', // 실제 사용 시 보안성 높은 비밀번호로 변경
    name: '관리자',
    role: 'admin',
    department: '관리부',
    is_approved: true
  },
  {
    email: 'user1@wizwebblast.com',
    password: 'user123456',
    name: '홍길동',
    role: 'user',
    department: '마케팅',
    is_approved: true
  },
  {
    email: 'user2@wizwebblast.com',
    password: 'user123456',
    name: '김철수',
    role: 'user',
    department: '디자인',
    is_approved: true
  },
  {
    email: 'pending@wizwebblast.com',
    password: 'pending123456',
    name: '대기사용자',
    role: 'user',
    department: '개발',
    is_approved: false
  }
];

/**
 * 테스트 계정 생성 함수
 */
async function createTestAccounts() {
  console.log('테스트 계정 생성을 시작합니다...');
  
  for (const account of testAccounts) {
    try {
      // 1. Supabase Auth를 통해 사용자 계정 생성
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            name: account.name,
            department: account.department
          }
        }
      });
      
      if (authError) {
        console.error(`계정 생성 실패 (${account.email}):`, authError.message);
        continue;
      }
      
      const userId = authData.user?.id;
      
      if (!userId) {
        console.error(`사용자 ID를 가져올 수 없음 (${account.email})`);
        continue;
      }
      
      // 2. 사용자 정보 테이블에 추가 정보 저장
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: account.email,
          name: account.name,
          role: account.role,
          department: account.department,
          is_approved: account.is_approved,
          created_at: new Date().toISOString()
        });
      
      if (userError) {
        console.error(`사용자 정보 저장 실패 (${account.email}):`, userError.message);
        continue;
      }
      
      console.log(`✅ 계정 생성 완료: ${account.email} (${account.role}${account.is_approved ? '' : ', 승인 대기 중'})`);
    } catch (error) {
      console.error(`예상치 못한 오류 (${account.email}):`, error);
    }
  }
  
  console.log('테스트 계정 생성이 완료되었습니다.');
}

// 스크립트 실행
createTestAccounts()
  .catch(error => {
    console.error('스크립트 실행 오류:', error);
    process.exit(1);
  }); 