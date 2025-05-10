import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// 임시 데이터 저장소 (실제로는 데이터베이스를 사용해야 합니다)
let notices = [
  {
    id: '1',
    title: '시스템 점검 안내',
    content: '시스템 점검이 예정되어 있습니다.',
    isFixed: true,
    createdAt: new Date().toISOString()
  }
];

// 공지사항 목록 조회 API
export async function GET(request: Request) {
  try {
    // URL에서 파라미터 추출
    const url = new URL(request.url);
    const isFixed = url.searchParams.get('is_fixed');
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    // 데이터 필터링
    let filteredNotices = [...notices];
    
    // 고정 공지 필터링
    if (isFixed !== null) {
      filteredNotices = filteredNotices.filter(notice => notice.isFixed === (isFixed === 'true'));
    }
    
    // 정렬 및 제한
    filteredNotices.sort((a, b) => {
      if (a.isFixed !== b.isFixed) {
        return a.isFixed ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    filteredNotices = filteredNotices.slice(0, limit);
    
    return NextResponse.json(filteredNotices);
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
    
    // 새 공지사항 생성
    const newNotice = {
      id: Date.now().toString(),
      title,
      content,
      isFixed,
      createdAt: new Date().toISOString()
    };
    
    // 데이터 저장 (실제로는 데이터베이스에 저장해야 합니다)
    notices.push(newNotice);
    
    return NextResponse.json({ 
      success: true, 
      notice: newNotice
    });
  } catch (error) {
    console.error('공지사항 추가 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 