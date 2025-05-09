import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

// 비밀번호 변경 API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;
    
    // 비밀번호 필드 검증
    if (!password) {
      return NextResponse.json(
        { error: '새 비밀번호는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 비밀번호 강도 확인 (최소 6자 이상)
    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 최소 6자 이상이어야 합니다.' },
        { status: 400 }
      );
    }
    
    // 서버 컴포넌트 클라이언트 생성 (쿠키 관리용)
    const supabaseServerClient = createServerComponentClient<Database>({ cookies });
    
    // 현재 세션 확인
    const { data: { session } } = await supabaseServerClient.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다. 비밀번호 재설정 링크를 다시 요청해주세요.' },
        { status: 401 }
      );
    }
    
    // Supabase Auth를 사용하여 비밀번호 변경
    const { error } = await supabaseServerClient.auth.updateUser({
      password: password
    });
    
    if (error) {
      console.error('비밀번호 변경 오류:', error);
      return NextResponse.json(
        { error: error.message || '비밀번호 변경에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.' 
    });
  } catch (error) {
    console.error('비밀번호 변경 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 