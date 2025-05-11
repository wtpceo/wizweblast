import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

// 공지사항 목록 조회 API
export async function GET(request: Request) {
  try {
    // URL에서 파라미터 추출
    const url = new URL(request.url);
    const isFixed = url.searchParams.get('is_fixed');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    // Supabase 쿼리 구성
    let query = supabase
      .from('notices')
      .select('*')
      .order('is_fixed', { ascending: false })
      .order('created_at', { ascending: false });
    
    // 고정 공지 필터링
    if (isFixed !== null) {
      query = query.eq('is_fixed', isFixed === 'true');
    }
    
    // 결과 수 제한
    query = query.limit(limit);
    
    // 쿼리 실행
    const { data, error } = await query;
    
    if (error) {
      console.error('공지사항 목록 조회 오류:', error);
      return NextResponse.json({ error: '공지사항 목록 조회에 실패했습니다.' }, { status: 500 });
    }
    
    // 응답 데이터 형식 변환
    const formattedNotices = data.map(notice => ({
      id: notice.id,
      title: notice.title,
      content: notice.content,
      isFixed: notice.is_fixed,
      createdAt: notice.created_at
    }));
    
    return NextResponse.json(formattedNotices);
  } catch (error) {
    console.error('공지사항 목록 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 공지사항 추가 API
export async function POST(request: Request) {
  try {
    // 인증 확인
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, content, isFixed = false } = body;
    
    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 공지사항 추가
    const { data, error } = await supabase
      .from('notices')
      .insert([{
        title,
        content,
        is_fixed: isFixed,
        created_at: new Date().toISOString(),
        user_id: userId
      }])
      .select()
      .single();
    
    if (error) {
      console.error('공지사항 추가 오류:', error);
      return NextResponse.json({ error: '공지사항 추가에 실패했습니다.' }, { status: 500 });
    }
    
    // 응답 데이터 형식 변환
    const formattedNotice = {
      id: data.id,
      title: data.title,
      content: data.content,
      isFixed: data.is_fixed,
      createdAt: data.created_at
    };
    
    return NextResponse.json({ 
      success: true, 
      notice: formattedNotice
    });
  } catch (error) {
    console.error('공지사항 추가 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 