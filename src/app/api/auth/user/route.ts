import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

// 현재 로그인한 사용자 정보 조회 API
export async function GET() {
  try {
    const supabaseServerClient = createServerComponentClient<Database>({ cookies });
    
    // 현재 세션 확인
    const { data: { session } } = await supabaseServerClient.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // 사용자 기본 정보
    const { data: { user } } = await supabaseServerClient.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // 사용자 추가 정보 조회
    const { data: userData, error: userError } = await supabaseServerClient
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError) {
      console.error('사용자 정보 조회 오류:', userError);
      return NextResponse.json({ error: '사용자 정보를 조회할 수 없습니다.' }, { status: 500 });
    }
    
    // 승인되지 않은 사용자인 경우
    if (!userData.is_approved) {
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: userData.name || user.user_metadata.name || '',
          isApproved: false
        },
        message: '관리자 승인 대기 중입니다.'
      });
    }
    
    // 승인된 사용자 정보 응답
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: userData.name || user.user_metadata.name || '',
        role: userData.role,
        department: userData.department,
        isApproved: userData.is_approved
      }
    });
  } catch (error) {
    console.error('사용자 정보 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 