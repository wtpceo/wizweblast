import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase';

export async function GET() {
  try {
    // Supabase 연결 테스트
    const supabase = createServerClient();
    
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // 클라이언트 테이블 존재 확인
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('count(*)', { count: 'exact', head: true });
      
    // client_external_data 테이블 존재 확인
    const { data: externalData, error: externalError } = await supabase
      .from('client_external_data')
      .select('count(*)', { count: 'exact', head: true });
    
    return NextResponse.json({
      success: true,
      environment: {
        supabaseUrl: supabaseUrl ? '설정됨' : '설정되지 않음',
        supabaseKey: supabaseKey ? '설정됨' : '설정되지 않음',
        serviceKey: serviceKey ? '설정됨' : '설정되지 않음',
      },
      tables: {
        clients: {
          exists: !clientsError,
          error: clientsError ? clientsError.message : null,
        },
        client_external_data: {
          exists: !externalError,
          error: externalError ? externalError.message : null,
        }
      }
    });
  } catch (error: any) {
    console.error('Supabase 연결 테스트 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
} 