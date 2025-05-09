import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

// 로그아웃 API
export async function POST() {
  try {
    const supabaseServerClient = createServerComponentClient<Database>({ cookies });
    
    // Supabase Auth에서 로그아웃
    await supabaseServerClient.auth.signOut();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('로그아웃 API 오류:', error);
    return NextResponse.json({ error: '로그아웃 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 