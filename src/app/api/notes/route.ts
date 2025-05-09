import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 메모 목록 조회 API
export async function GET(request: Request) {
  try {
    // URL에서 광고주 ID 파라미터 추출
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    
    // Supabase 쿼리 구성
    let query = supabase
      .from('client_notes')
      .select('*')
      .order('created_at', { ascending: false });
    
    // 광고주 ID로 필터링 (있는 경우)
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    // 데이터 조회
    const { data, error } = await query;
    
    if (error) {
      console.error('메모 목록 조회 오류:', error);
      return NextResponse.json({ error: '메모 목록을 가져오는 데 실패했습니다.' }, { status: 500 });
    }
    
    // 응답 데이터 형식 변환
    const formattedData = data.map(note => ({
      id: note.id,
      clientId: note.client_id,
      note: note.note,
      createdAt: note.created_at
    }));
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('메모 목록 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 메모 추가 API
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, note } = body;
    
    // 필수 필드 검증
    if (!clientId || !note) {
      return NextResponse.json(
        { error: '광고주 ID와 메모 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 메모 데이터 삽입
    const { data, error } = await supabase
      .from('client_notes')
      .insert({
        client_id: clientId,
        note,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('메모 추가 오류:', error);
      return NextResponse.json({ error: '메모 추가에 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      note: {
        id: data[0].id,
        clientId: data[0].client_id,
        note: data[0].note,
        createdAt: data[0].created_at
      }
    });
  } catch (error) {
    console.error('메모 추가 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 