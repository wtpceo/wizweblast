import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 공지사항 목록 조회 API
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    // 쿼리 파라미터 추출
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const fixedFirst = url.searchParams.get('fixedFirst') === 'true';
    
    // 쿼리 구성
    let query = supabase
      .from('notices')
      .select('*');
    
    // 정렬 적용 (고정 공지 우선 옵션 처리)
    if (fixedFirst) {
      query = query.order('is_fixed', { ascending: false })
                   .order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    // 결과 수 제한
    if (limit > 0) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('공지사항 목록 조회 오류:', error);
      return NextResponse.json({ error: '공지사항 목록을 가져오는 데 실패했습니다.' }, { status: 500 });
    }
    
    // 응답 데이터 포맷 변환 (프론트엔드 기대 형식에 맞게)
    const formattedData = data.map(notice => ({
      id: notice.id,
      title: notice.title,
      content: notice.content,
      isFixed: notice.is_fixed,
      createdAt: notice.created_at
    }));
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('공지사항 목록 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 공지사항 등록 API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, isFixed = false } = body;
    
    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 공지사항 데이터 삽입
    const { data, error } = await supabase
      .from('notices')
      .insert({
        title,
        content,
        is_fixed: isFixed,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('공지사항 등록 오류:', error);
      return NextResponse.json({ error: '공지사항 등록에 실패했습니다.' }, { status: 500 });
    }
    
    // 응답 데이터 포맷 변환
    const formattedNotice = {
      id: data[0].id,
      title: data[0].title,
      content: data[0].content,
      isFixed: data[0].is_fixed,
      createdAt: data[0].created_at
    };
    
    return NextResponse.json({ success: true, notice: formattedNotice });
  } catch (error) {
    console.error('공지사항 등록 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 