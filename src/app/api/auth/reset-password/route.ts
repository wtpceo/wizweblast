import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 비밀번호 재설정 요청 API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;
    
    // 이메일 필드 검증
    if (!email) {
      return NextResponse.json(
        { error: '이메일은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 이메일 형식 확인
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '유효한 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }
    
    // Supabase Auth를 사용하여 비밀번호 재설정 이메일 전송
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
    });
    
    if (error) {
      console.error('비밀번호 재설정 요청 오류:', error);
      return NextResponse.json(
        { error: error.message || '비밀번호 재설정 요청에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해 주세요.' 
    });
  } catch (error) {
    console.error('비밀번호 재설정 요청 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 