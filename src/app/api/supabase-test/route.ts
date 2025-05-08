import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    // 간단한 테스트 쿼리 실행 (Supabase 서버 상태 확인)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Supabase에 성공적으로 연결되었습니다!",
      serverTime: new Date().toISOString(),
      connectionStatus: "정상"
    });
  } catch (error) {
    console.error('Supabase 연결 오류:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Supabase 연결에 실패했습니다.'
    }, { status: 500 });
  }
} 