import { NextResponse } from 'next/server';

export async function GET() {
  // 필요한 환경 변수가 설정되어 있는지 확인만 하고, 실제 값은 노출하지 않음
  const envStatus = {
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '미설정',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '설정됨' : '미설정',
      serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? '설정됨' : '미설정',
    },
    node_env: process.env.NODE_ENV,
  };

  return NextResponse.json(envStatus);
} 