import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

// 권한 확인 유틸리티 함수
async function checkAdminPermission(supabaseClient: any) {
  // 현재 로그인한 사용자 확인
  const { data: { user } } = await supabaseClient.auth.getUser();
  
  if (!user) {
    return { allowed: false, status: 401, message: '인증되지 않은 사용자입니다.' };
  }
  
  // 관리자 권한 확인
  const { data: adminData, error: adminError } = await supabaseClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (adminError || !adminData || adminData.role !== 'admin') {
    return { allowed: false, status: 403, message: '관리자 권한이 필요합니다.' };
  }
  
  return { allowed: true, user };
}

// 특정 사용자 정보 조회 API (관리자용)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const supabaseServerClient = createServerComponentClient<Database>({ cookies });
    
    // 관리자 권한 확인
    const { allowed, status, message } = await checkAdminPermission(supabaseServerClient);
    if (!allowed) {
      return NextResponse.json({ error: message }, { status });
    }
    
    // 사용자 정보 조회
    const { data: userData, error: userError } = await supabaseServerClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      if (userError.code === 'PGRST116') {
        return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
      }
      return NextResponse.json({ error: '사용자 정보 조회에 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('사용자 정보 조회 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 사용자 정보 수정 API (관리자용)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const supabaseServerClient = createServerComponentClient<Database>({ cookies });
    
    // 관리자 권한 확인
    const { allowed, status, message } = await checkAdminPermission(supabaseServerClient);
    if (!allowed) {
      return NextResponse.json({ error: message }, { status });
    }
    
    const body = await request.json();
    const { name, department, role, isApproved } = body;
    
    // 수정할 필드 추출
    const updateFields: any = {};
    
    if (name !== undefined) updateFields.name = name;
    if (department !== undefined) updateFields.department = department;
    if (role !== undefined) updateFields.role = role;
    if (isApproved !== undefined) updateFields.is_approved = isApproved;
    
    // 수정할 내용이 없는 경우
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: '수정할 내용이 없습니다.' }, { status: 400 });
    }
    
    // 사용자 정보 업데이트
    const { data, error } = await supabaseServerClient
      .from('users')
      .update(updateFields)
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error('사용자 정보 수정 오류:', error);
      return NextResponse.json({ error: '사용자 정보 수정에 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, user: data[0] });
  } catch (error) {
    console.error('사용자 정보 수정 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 