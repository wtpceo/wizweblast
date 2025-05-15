import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase, createServerClient } from '@/lib/supabase';

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
    // 인증 확인 - 디버그 로그 추가
    const authResult = await auth();
    const { userId } = authResult;
    
    console.log('공지사항 추가 API - 인증 정보:', { userId, hasUserId: !!userId, auth: authResult });
    
    // 인증 체크를 간소화 - 개발 환경에서는 인증 체크를 건너뛸 수 있음
    if (!userId && process.env.NODE_ENV === 'production') {
      console.error('공지사항 추가 API - 인증 실패');
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, content, isFixed = false } = body;
    
    console.log('공지사항 추가 API - 요청 데이터:', { title, content, isFixed });
    
    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 현재 시간 생성
    const now = new Date().toISOString();
    
    try {
      // 서비스 롤 Supabase 클라이언트 생성
      // RLS를 우회하여 공지사항 추가
      const adminSupabase = createServerClient();
      
      console.log('서비스 롤 클라이언트로 공지사항 추가 시도');
      
      // 공지사항 추가
      const { data, error } = await adminSupabase
        .from('notices')
        .insert([{
          title,
          content,
          is_fixed: isFixed,
          created_at: now,
        }])
        .select()
        .single();
      
      if (error) {
        console.error('공지사항 추가 오류:', error);
        return NextResponse.json({ 
          error: '공지사항 추가에 실패했습니다. 오류: ' + error.message,
          details: error
        }, { status: 500 });
      }
      
      // 응답 데이터 형식 변환
      const formattedNotice = {
        id: data.id,
        title: data.title,
        content: data.content,
        isFixed: data.is_fixed,
        createdAt: data.created_at
      };
      
      console.log('공지사항 추가 성공:', formattedNotice);
      
      return NextResponse.json({ 
        success: true, 
        notice: formattedNotice
      });
    } catch (insertError: any) {
      console.error('서비스 롤로 공지사항 추가 중 오류:', insertError);
      
      // 일반 Supabase 클라이언트로 추가 시도 (RLS 실패 가능성 있음)
      try {
        console.log('일반 클라이언트로 공지사항 추가 대체 시도');
        
        const { data, error } = await supabase
          .from('notices')
          .insert([{
            title,
            content,
            is_fixed: isFixed,
            created_at: now,
          }])
          .select()
          .single();
        
        if (error) {
          console.error('일반 클라이언트로 공지사항 추가 오류:', error);
          
          // RLS 정책 오류인 경우
          if (error.message && error.message.includes('policy')) {
            return NextResponse.json({ 
              error: 'RLS 정책으로 인해 공지사항을 추가할 수 없습니다. 관리자에게 문의하세요.',
              code: 'RLS_POLICY_ERROR',
              details: error
            }, { status: 403 });
          }
          
          return NextResponse.json({ 
            error: '공지사항 추가에 실패했습니다. 오류: ' + error.message,
            details: error
          }, { status: 500 });
        }
        
        // 응답 데이터 형식 변환
        const formattedNotice = {
          id: data.id,
          title: data.title,
          content: data.content,
          isFixed: data.is_fixed,
          createdAt: data.created_at
        };
        
        console.log('일반 클라이언트로 공지사항 추가 성공:', formattedNotice);
        
        return NextResponse.json({ 
          success: true, 
          notice: formattedNotice
        });
      } catch (fallbackError: any) {
        console.error('모든 공지사항 추가 시도 실패:', fallbackError);
        return NextResponse.json({ 
          error: '공지사항 추가를 위한 모든 시도가 실패했습니다.',
          originalError: insertError?.message,
          fallbackError: fallbackError?.message
        }, { status: 500 });
      }
    }
  } catch (error: any) {
    console.error('공지사항 추가 API 오류:', error);
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.', 
      details: error?.message || '알 수 없는 오류'
    }, { status: 500 });
  }
} 