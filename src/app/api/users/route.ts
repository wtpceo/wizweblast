import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

// 가입된 사용자 목록 조회 API
export async function GET(request: Request) {
  try {
    // Clerk으로 인증 확인
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    const supabaseServerClient = createServerComponentClient<Database>({ cookies });
    
    // 승인된 사용자 목록만 조회
    const { data: users, error: usersError } = await supabaseServerClient
      .from('users')
      .select('id, name, email, role, avatar_url')
      .eq('is_approved', true)
      .order('name');
    
    if (usersError) {
      console.error('사용자 목록 조회 오류:', usersError);
      return NextResponse.json(
        { error: '사용자 목록을 가져오는 데 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('사용자 목록 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 