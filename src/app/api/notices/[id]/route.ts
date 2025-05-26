import { NextRequest, NextResponse } from 'next/server';
import { supabase, createServerClient } from '@/lib/supabase';

// 특정 공지사항 조회 API
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const noticeId = resolvedParams.id;
    
    // 공지사항 조회
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('id', noticeId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '공지사항을 찾을 수 없습니다.' }, { 
          status: 404,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        });
      }
      return NextResponse.json({ error: '공지사항 조회에 실패했습니다.' }, { 
        status: 500,
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
    
    return NextResponse.json(formattedNotice, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error('공지사항 조회 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  }
}

// 공지사항 수정 API
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const noticeId = resolvedParams.id;
    const body = await request.json();
    const { title, content, isFixed } = body;
    
    // 필수 필드 검증
    if (!title && !content && isFixed === undefined) {
      return NextResponse.json(
        { error: '수정할 내용이 없습니다.' },
        { 
          status: 400,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        }
      );
    }
    
    // 업데이트할 필드 구성
    const updateFields: Record<string, any> = {};
    
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;
    if (isFixed !== undefined) updateFields.is_fixed = isFixed;
    updateFields.updated_at = new Date().toISOString();
    
    // 서비스 롤 Supabase 클라이언트 생성
    const adminSupabase = createServerClient();
    
    // 공지사항 업데이트
    const { data, error } = await adminSupabase
      .from('notices')
      .update(updateFields)
      .eq('id', noticeId)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '공지사항을 찾을 수 없습니다.' }, { 
          status: 404,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        });
      }
      console.error('공지사항 수정 오류:', error);
      
      // 일반 클라이언트로 재시도
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('notices')
        .update(updateFields)
        .eq('id', noticeId)
        .select()
        .single();
        
      if (fallbackError) {
        console.error('일반 클라이언트로 공지사항 수정 오류:', fallbackError);
        return NextResponse.json({ error: '공지사항 수정에 실패했습니다.' }, { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        });
      }
      
      // 응답 데이터 형식 변환
      const formattedNotice = {
        id: fallbackData.id,
        title: fallbackData.title,
        content: fallbackData.content,
        isFixed: fallbackData.is_fixed,
        createdAt: fallbackData.created_at
      };
      
      return NextResponse.json({ success: true, notice: formattedNotice }, {
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
    
    return NextResponse.json({ success: true, notice: formattedNotice }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error('공지사항 수정 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  }
}

// 공지사항 삭제 API
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const noticeId = resolvedParams.id;
    
    // 서비스 롤 Supabase 클라이언트 생성
    const adminSupabase = createServerClient();
    
    // 공지사항 삭제
    const { error } = await adminSupabase
      .from('notices')
      .delete()
      .eq('id', noticeId);
    
    if (error) {
      console.error('공지사항 삭제 오류:', error);
      
      // 일반 클라이언트로 재시도
      const { error: fallbackError } = await supabase
        .from('notices')
        .delete()
        .eq('id', noticeId);
        
      if (fallbackError) {
        console.error('일반 클라이언트로 공지사항 삭제 오류:', fallbackError);
        return NextResponse.json({ error: '공지사항 삭제에 실패했습니다.' }, { 
          status: 500,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        });
      }
    }
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error('공지사항 삭제 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  }
} 