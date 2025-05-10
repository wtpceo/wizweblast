import { NextResponse } from 'next/server';
import { seedClientData } from '../seed';

// 시드 데이터 API
export async function GET() {
  try {
    const result = await seedClientData();
    
    if (result.success) {
      return NextResponse.json({
        status: 'success',
        message: result.message,
        data: result
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('시드 API 오류:', error);
    return NextResponse.json({
      status: 'error',
      message: '시드 데이터 추가 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 