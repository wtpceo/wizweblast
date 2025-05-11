import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 메모 삭제 API
export async function DELETE(
  request: Request, 
  { params }: { params: { id: string; noteId: string } }
) {
  try {
    const clientId = params.id;
    const noteId = params.noteId;
    
    if (!clientId || !noteId) {
      return NextResponse.json(
        { error: '유효하지 않은 요청입니다.' },
        { status: 400 }
      );
    }
    
    console.log(`메모 삭제 요청: 광고주 ID ${clientId}, 메모 ID ${noteId}`);
    
    // Supabase에서 메모 삭제
    const { error } = await supabase
      .from('client_notes')
      .delete()
      .eq('id', noteId)
      .eq('client_id', clientId);
    
    if (error) {
      console.error('메모 삭제 오류:', error);
      
      // relation does not exist 오류 처리
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: '메모 테이블이 존재하지 않습니다.',
            details: 'Supabase 스키마 설정을 먼저 실행해주세요.',
            code: 'RELATION_NOT_EXIST'
          },
          { status: 500 }
        );
      }
      
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