import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 광고주 할 일 조회 API
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;
    
    const { data, error } = await supabase
      .from('client_todos')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('광고주 할 일 조회 오류:', error);
      return NextResponse.json({ error: '할 일 목록을 가져오는 데 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('광고주 할 일 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 광고주 할 일 추가 API
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const clientId = params.id;
    const body = await request.json();
    const { content, assignedTo } = body;
    
    // 필수 필드 검증
    if (!content) {
      return NextResponse.json(
        { error: '할 일 내용은 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 광고주 존재 여부 확인
    const { data: clientExists, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('id', clientId)
      .single();
    
    if (clientError || !clientExists) {
      return NextResponse.json({ error: '존재하지 않는 광고주입니다.' }, { status: 404 });
    }
    
    // 할 일 데이터 삽입
    const { data, error } = await supabase
      .from('client_todos')
      .insert({
        client_id: clientId,
        content,
        assigned_to: assignedTo || null,
        created_at: new Date().toISOString(),
        completed: false
      })
      .select();
    
    if (error) {
      console.error('할 일 추가 오류:', error);
      return NextResponse.json({ error: '할 일 추가에 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, todo: data[0] });
  } catch (error) {
    console.error('할 일 추가 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 