import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

// 이메일 검증 요청 API
export async function POST(request: Request) {
  try {
    const supabaseServerClient = createServerComponentClient<Database>({ cookies });
    
    // 현재 세션 확인
    const { data: { session } } = await supabaseServerClient.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    // Supabase Auth를 사용하여 이메일 검증 메일 발송
    const { error } = await supabaseServerClient.auth.resend({
      type: 'signup',
      email: session.user.email || '',
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm-email`,
      }
    });
    
    if (error) {
      console.error('이메일 검증 요청 오류:', error);
      return NextResponse.json(
        { error: error.message || '이메일 검증 요청에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '이메일 검증 링크가 전송되었습니다. 이메일을 확인해 주세요.' 
    });
  } catch (error) {
    console.error('이메일 검증 요청 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 