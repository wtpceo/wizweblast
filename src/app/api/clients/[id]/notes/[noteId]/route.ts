import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// UUID 패턴을 확인하는 함수
const isValidUUID = (str: string) => {
  const regexExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regexExp.test(str);
};

// ID를 UUID 형식으로 변환하는 함수
const formatToUUID = (id: string) => {
  if (isValidUUID(id)) return id;
  
  try {
    // 숫자 또는 문자열에서 UUID v4 형식으로 변환 시도
    const uuid = `00000000-0000-4000-8000-${id.padStart(12, '0')}`;
    console.log(`ID를 UUID 형식으로 변환: ${id} -> ${uuid}`);
    return uuid;
  } catch (error) {
    console.error('UUID 변환 실패:', error);
    return id; // 변환 실패 시 원래 값 반환
  }
};

// 특정 메모 조회 API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const resolvedParams = await params;
    const clientId = formatToUUID(resolvedParams.id);
    const noteId = formatToUUID(resolvedParams.noteId);
    
    console.log(`특정 메모 조회: clientId=${clientId}, noteId=${noteId}`);
    
    // 메모 조회
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('id', noteId)
      .eq('client_id', clientId)
      .single();
    
    if (error) {
      console.error('메모 조회 오류:', error);
      return NextResponse.json(
        { error: '메모를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('메모 조회 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 메모 삭제 API
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const resolvedParams = await params;
    const clientId = formatToUUID(resolvedParams.id);
    const noteId = formatToUUID(resolvedParams.noteId);
    
    console.log(`메모 삭제: clientId=${clientId}, noteId=${noteId}`);
    
    // 메모 삭제
    const { error } = await supabase
      .from('client_notes')
      .delete()
      .eq('id', noteId)
      .eq('client_id', clientId);
    
    if (error) {
      console.error('메모 삭제 오류:', error);
      return NextResponse.json(
        { error: '메모 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('메모 삭제 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 메모 업데이트 API
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  try {
    const resolvedParams = await params;
    const clientId = formatToUUID(resolvedParams.id);
    const noteId = formatToUUID(resolvedParams.noteId);
    const body = await request.json();
    const { note } = body;
    
    if (!note || note.trim() === '') {
      return NextResponse.json(
        { error: '메모 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    console.log(`메모 업데이트: clientId=${clientId}, noteId=${noteId}, note=${note.substring(0, 30)}...`);
    
    // 메모 업데이트
    const { data, error } = await supabase
      .from('client_notes')
      .update({ note })
      .eq('id', noteId)
      .eq('client_id', clientId)
      .select();
    
    if (error) {
      console.error('메모 업데이트 오류:', error);
      return NextResponse.json(
        { error: '메모 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, note: data[0] });
  } catch (error) {
    console.error('메모 업데이트 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 