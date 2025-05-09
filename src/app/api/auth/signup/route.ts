import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 회원가입 API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    
    // 필수 필드 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: '이메일, 비밀번호, 이름은 필수 입력 항목입니다.' },
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
    
    // 이메일 형식 확인
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '유효한 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }
    
    // Supabase Auth로 회원가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    if (authError) {
      console.error('회원가입 오류:', authError);
      return NextResponse.json(
        { error: authError.message || '회원가입에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    // 사용자 추가 정보 저장 (users 테이블)
    // 기본적으로 승인 대기 상태로 설정
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user?.id || '',
        email,
        name,
        role: 'user',
        is_approved: false,
        created_at: new Date().toISOString()
      });
    
    if (userError) {
      console.error('상세 오류 정보:', {
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint
      });
      // Auth에는 가입되었지만 추가 정보 저장에 실패한 경우
      // 선택 사항: 여기서 auth 사용자 삭제를 고려할 수 있음
      return NextResponse.json(
        { error: '사용자 정보 저장에 실패했습니다. 관리자에게 문의하세요.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '회원가입 요청이 완료되었습니다. 관리자 승인 후 로그인 가능합니다.'
    });
  } catch (error) {
    console.error('전체 에러 객체:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 