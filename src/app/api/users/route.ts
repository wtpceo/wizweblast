import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import type { User } from '@clerk/nextjs/server';

// 가입된 사용자 목록 조회 API
export async function GET(request: Request) {
  try {
    // Clerk으로 인증 확인
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    // Clerk에서 사용자 목록 가져오기
    const users = await clerkClient.users.getUserList({
      limit: 100,
    });
    
    // 필요한 정보만 추출하여 반환
    const simplifiedUsers = users.map((user: User) => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || '이름 없음',
      email: user.emailAddresses[0]?.emailAddress || '',
      imageUrl: user.imageUrl,
      department: user.publicMetadata?.department || '미지정',
      role: user.publicMetadata?.role || 'staff'
    }));
    
    return NextResponse.json(simplifiedUsers);
  } catch (error) {
    console.error('사용자 목록 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 