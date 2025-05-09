import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 단일 광고주 조회 API
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // 광고주 정보 조회
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (clientError) {
      if (clientError.code === 'PGRST116') {
        return NextResponse.json({ error: '광고주를 찾을 수 없습니다.' }, { status: 404 });
      }
      return NextResponse.json({ error: '광고주 정보 조회에 실패했습니다.' }, { status: 500 });
    }
    
    // 광고주 관련 할 일 조회
    const { data: todosData, error: todosError } = await supabase
      .from('client_todos')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });
    
    // 광고주 관련 메모 조회
    const { data: notesData, error: notesError } = await supabase
      .from('client_notes')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });
    
    // 응답 데이터 구성
    const responseData = {
      ...clientData,
      todos: todosError ? [] : todosData,
      notes: notesError ? [] : notesData
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('광고주 상세 정보 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 광고주 정보 수정 API
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // 수정할 필드 추출
    const updateFields: any = {};
    
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.contractStart !== undefined) updateFields.contract_start = body.contractStart;
    if (body.contractEnd !== undefined) updateFields.contract_end = body.contractEnd;
    if (body.statusTags !== undefined) updateFields.status_tags = body.statusTags;
    
    // 수정할 내용이 없는 경우
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: '수정할 내용이 없습니다.' }, { status: 400 });
    }
    
    // 데이터 업데이트
    const { data, error } = await supabase
      .from('clients')
      .update(updateFields)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('광고주 정보 수정 오류:', error);
      return NextResponse.json({ error: '광고주 정보 수정에 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, client: data[0] });
  } catch (error) {
    console.error('광고주 수정 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 광고주 삭제 API
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    
    // 광고주 삭제 전, 관련 레코드 삭제 (foreign key constraint 위반 방지)
    await supabase.from('client_todos').delete().eq('client_id', id);
    await supabase.from('client_notes').delete().eq('client_id', id);
    
    // 광고주 삭제
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('광고주 삭제 오류:', error);
      return NextResponse.json({ error: '광고주 삭제에 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('광고주 삭제 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 