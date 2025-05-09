import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

// 서버 컴포넌트에서 사용할 supabase 클라이언트
export const createServerClient = () => 
  createServerComponentClient<Database>({ cookies });

// 세션 유효성 검사 (서버 사이드)
export async function getSession() {
  const supabase = createServerComponentClient<Database>({ cookies });
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('세션 오류:', error);
    return null;
  }
}

// 사용자 정보 가져오기 (서버 사이드)
export async function getUserDetails() {
  const supabase = createServerComponentClient<Database>({ cookies });
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // 사용자 메타데이터도 같이 가져오기
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error || !data) {
      console.error('사용자 정보 조회 오류:', error);
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata.name || '',
        role: 'user',
        department: user.user_metadata.department || ''
      };
    }
    
    return {
      id: user.id,
      email: user.email,
      name: data.name || user.user_metadata.name || '',
      role: data.role || 'user',
      department: data.department || user.user_metadata.department || '',
      isApproved: data.is_approved
    };
  } catch (error) {
    console.error('사용자 정보 오류:', error);
    return null;
  }
} 