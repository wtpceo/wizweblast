import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 계약 날짜 변경 API
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const { contractStart, contractEnd } = body;
    
    // 최소한 하나의 날짜는 제공되어야 함
    if (!contractStart && !contractEnd) {
      return NextResponse.json(
        { error: '계약 시작일 또는 계약 종료일 중 하나는 필수 입력 항목입니다.' },
        { status: 400 }
      );
    }
    
    // 날짜 유효성 검증
    const updateFields: any = {};
    
    if (contractStart) {
      const startDate = new Date(contractStart);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: '유효하지 않은 계약 시작일입니다.' },
          { status: 400 }
        );
      }
      updateFields.contract_start = contractStart;
    }
    
    if (contractEnd) {
      const endDate = new Date(contractEnd);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: '유효하지 않은 계약 종료일입니다.' },
          { status: 400 }
        );
      }
      updateFields.contract_end = contractEnd;
    }
    
    // 계약 날짜 유효성 검증 (시작일이 종료일보다 이후인 경우)
    if (contractStart && contractEnd) {
      const startDate = new Date(contractStart);
      const endDate = new Date(contractEnd);
      
      if (startDate > endDate) {
        return NextResponse.json(
          { error: '계약 시작일은 계약 종료일보다 이전이어야 합니다.' },
          { status: 400 }
        );
      }
    }
    
    // 데이터 업데이트
    const { data, error } = await supabase
      .from('clients')
      .update(updateFields)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('계약 날짜 수정 오류:', error);
      return NextResponse.json({ error: '계약 날짜 수정에 실패했습니다.' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, client: data[0] });
  } catch (error) {
    console.error('계약 날짜 수정 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 