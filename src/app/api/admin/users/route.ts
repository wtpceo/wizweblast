import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

// 모든 사용자 목록 조회 API (관리자용)
export async function GET(request: Request) {
  try {
    const supabaseServerClient = createServerComponentClient<Database>({ cookies });
    
    // 현재 로그인한 사용자 확인
    const { data: { user } } = await supabaseServerClient.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    // 관리자 권한 확인
    const { data: adminData, error: adminError } = await supabaseServerClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (adminError || !adminData || adminData.role !== 'admin') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }
    
    // 쿼리 파라미터 처리
    const url = new URL(request.url);
    const isApproved = url.searchParams.get('is_approved');
    
    // 모든 사용자 목록 조회
    let query = supabaseServerClient.from('users').select('*');
    
    // 승인 상태 필터링
    if (isApproved === 'true') {
      query = query.eq('is_approved', true);
    } else if (isApproved === 'false') {
      query = query.eq('is_approved', false);
    }
    
    const { data: users, error: usersError } = await query;
    
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