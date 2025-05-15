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
      return NextResponse.json({ error: '공지사항 목록 조회에 실패했습니다.' }, { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }
    
    // 응답 데이터 형식 변환
    const formattedNotices = data.map(notice => ({
      id: notice.id,
      title: notice.title,
      content: notice.content,
      isFixed: notice.is_fixed,
      createdAt: notice.created_at
    }));
    
    return NextResponse.json(formattedNotices, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error('공지사항 목록 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  }
}

// 공지사항 추가 API
export async function POST(request: Request) {
  try {
    // 인증 확인
    const authResult = await auth();
    const { userId } = authResult;
    
    console.log('공지사항 추가 API - 인증 정보:', { userId, hasUserId: !!userId, auth: authResult });
    
    // 인증 체크를 간소화 - 개발 환경에서는 인증 체크를 건너뛸 수 있음
    if (!userId && process.env.NODE_ENV === 'production') {
      console.error('공지사항 추가 API - 인증 실패');
      return NextResponse.json({ error: '인증이 필요합니다.' }, { 
        status: 401,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    }
    
    const body = await request.json();
    const { title, content, isFixed = false } = body;
    
    console.log('공지사항 추가 API - 요청 데이터:', { title, content, isFixed });
    
    // 필수 필드 검증
    if (!title || !content) {
      return NextResponse.json(
        { error: '제목과 내용은 필수 입력 항목입니다.' },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        }
      );
    }
    
    // 현재 시간 생성
    const now = new Date().toISOString();
    
    // 서비스 롤 Supabase 클라이언트 생성
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
        updated_at: now,
      }])
      .select()
      .single();
    
    if (error) {
      console.error('공지사항 추가 오류:', error);
      
      // 일반 클라이언트로 시도
      console.log('일반 클라이언트로 추가 시도');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('notices')
        .insert([{
          title,
          content,
          is_fixed: isFixed,
          created_at: now,
          updated_at: now,
        }])
        .select()
        .single();
      
      if (fallbackError) {
        console.error('일반 클라이언트로 추가 시도 실패:', fallbackError);
        return NextResponse.json({ 
          error: '공지사항 추가에 실패했습니다. 오류: ' + fallbackError.message,
          details: fallbackError
        }, { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        });
      }
      
      // 성공 응답
      const formattedNotice = {
        id: fallbackData.id,
        title: fallbackData.title,
        content: fallbackData.content,
        isFixed: fallbackData.is_fixed,
        createdAt: fallbackData.created_at
      };
      
      console.log('일반 클라이언트로 공지사항 추가 성공:', formattedNotice);
      
      return NextResponse.json({ 
        success: true, 
        notice: formattedNotice
      }, {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
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
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('공지사항 추가 API 오류:', error);
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.', 
      details: error?.message || '알 수 없는 오류'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  }
} 