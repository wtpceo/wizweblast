import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

// 로그인 API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    // 필수 필드 검증
    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 서버 컴포넌트 클라이언트 생성 (쿠키 관리용)
    const supabaseServerClient = createServerComponentClient<Database>({ cookies });
    
    // Supabase Auth로 로그인
    const { data: authData, error: authError } = await supabaseServerClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      console.error('로그인 오류:', authError);
      
      // 오류 메시지 사용자 친화적으로 변환
      let errorMessage = '로그인에 실패했습니다.';
      if (authError.message.includes('Invalid login credentials')) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
    
    // 사용자 승인 상태 확인
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('is_approved, role')
      .eq('id', authData.user.id)
      .single();
    
    if (userError) {
      console.error('사용자 정보 조회 오류:', userError);
      return NextResponse.json(
        { error: '사용자 정보를 확인할 수 없습니다.' },
        { status: 500 }
      );
    }
    
    // 승인되지 않은 사용자인 경우
    if (!userData.is_approved) {
      // 로그아웃 처리
      await supabaseServerClient.auth.signOut();
      
      return NextResponse.json(
        { error: '아직 관리자 승인이 완료되지 않았습니다. 관리자에게 문의하세요.' },
        { status: 403 }
      );
    }
    
    // 사용자 정보 포함해서 응답
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: userData.role,
        isApproved: userData.is_approved
      }
    });
  } catch (error) {
    console.error('로그인 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 