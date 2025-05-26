import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { clients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 광고주 계약 정보 업데이트 API
 * PATCH /api/clients/[id]/contract
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 인증 확인
    const session = await auth();
    if (!session.userId) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // params가 Promise로 래핑되어 있으므로 await으로 해결
    const resolvedParams = await params;
    const clientId = resolvedParams.id; // UUID는 문자열로 사용
    
    // 2. 요청 본문 파싱
    const body = await request.json();
    const { contractStart, contractEnd } = body;
    
    // 3. 유효성 검사: 최소한 한 필드는 있어야 함
    if (!contractStart && !contractEnd) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'At least one of contractStart or contractEnd must be provided' 
        }),
        { status: 400 }
      );
    }
    
    // 4. 날짜 형식 유효성 검사
    const updateData: any = {};
    
    if (contractStart) {
      if (!isValidISODate(contractStart)) {
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid contractStart date format. Expected YYYY-MM-DD' 
          }),
          { status: 400 }
        );
      }
      updateData.contractStart = new Date(contractStart);
    }
    
    if (contractEnd) {
      if (!isValidISODate(contractEnd)) {
        return new NextResponse(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid contractEnd date format. Expected YYYY-MM-DD' 
          }),
          { status: 400 }
        );
      }
      updateData.contractEnd = new Date(contractEnd);
    }
    
    // 5. 광고주 존재 여부 확인
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, clientId),
    });

    if (!client) {
      return new NextResponse(
        JSON.stringify({ success: false, error: 'Client not found' }),
        { status: 404 }
      );
    }
    
    // 6. 계약 날짜가 논리적으로 유효한지 확인
    const startDate = updateData.contractStart || client.contractStart;
    const endDate = updateData.contractEnd || client.contractEnd;
    
    if (startDate > endDate) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Contract start date cannot be later than end date' 
        }),
        { status: 400 }
      );
    }
    
    // 7. 데이터베이스 업데이트
    updateData.updatedAt = new Date();
    
    const updatedClient = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, clientId))
      .returning();
    
    // 8. 성공 응답 반환
    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        message: 'Contract dates updated successfully',
        data: updatedClient[0]
      })
    );
    
  } catch (error: any) {
    console.error('Contract update error:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: `Failed to update contract: ${error.message}` 
      }),
      { status: 500 }
    );
  }
}

/**
 * ISO 날짜 형식(YYYY-MM-DD) 유효성 검사
 */
function isValidISODate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return false;
  }
  
  return true;
} 