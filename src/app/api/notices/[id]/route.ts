import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 단일 공지사항 조회 API
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '공지사항을 찾을 수 없습니다.' }, { status: 404 });
      }
      return NextResponse.json({ error: '공지사항 조회에 실패했습니다.' }, { status: 500 });
    }
    
    // 응답 데이터 포맷 변환
    const formattedNotice = {
      id: data.id,
      title: data.title,
      content: data.content,
      isFixed: data.is_fixed,
      createdAt: data.created_at
    };
    
    return NextResponse.json(formattedNotice);
  } catch (error) {
    console.error('공지사항 상세 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 공지사항 수정 API
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { title, content, isFixed } = body;
    
    // 수정할 필드 추출
    const updateFields: any = {};
    
    if (title !== undefined) updateFields.title = title;
    if (content !== undefined) updateFields.content = content;
    if (isFixed !== undefined) updateFields.is_fixed = isFixed;
    
    // 수정할 내용이 없는 경우
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: '수정할 내용이 없습니다.' }, { status: 400 });
    }
    
    // 데이터 업데이트
    const { data, error } = await supabase
      .from('notices')
      .update(updateFields)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('공지사항 수정 오류:', error);
      return NextResponse.json({ error: '공지사항 수정에 실패했습니다.' }, { status: 500 });
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
    console.error('공지사항 수정 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 공지사항 삭제 API
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('공지사항 삭제 오류:', error);
      return NextResponse.json({ error: '공지사항 삭제에 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('공지사항 삭제 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 