import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';

// 가입된 사용자 목록 조회 API
export async function GET(request: Request) {
  try {
    // Clerk으로 인증 확인
    const { userId } = await auth();
    
    // 인증되지 않은 경우에도 최소한의 정보 제공
    if (!userId) {
      console.warn('인증되지 않은 사용자의 API 요청');
      return NextResponse.json([
        { id: 'current-user', name: '현재 사용자', emoji: '👨‍💼' }
      ]);
    }
    
    try {
      // 현재 사용자 정보 가져오기
      const user = await currentUser();
      
      if (!user) {
        return NextResponse.json([
          { id: userId, name: '현재 사용자', emoji: '👨‍💼' }
        ]);
      }
      
      // 단순화된 사용자 정보 반환 (현재는 로그인한 사용자만)
      return NextResponse.json([{
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || '현재 사용자',
        email: user.emailAddresses[0]?.emailAddress || '',
        imageUrl: user.imageUrl,
        department: user.publicMetadata?.department || '미지정',
        role: user.publicMetadata?.role || 'staff'
      }]);
    } catch (clerkError) {
      console.error('Clerk API 오류:', clerkError);
      
      // 최소한의 정보 제공 (현재 사용자만)
      return NextResponse.json([
        { id: userId, name: '현재 사용자', emoji: '👨‍💼' }
      ]);
    }
  } catch (error) {
    console.error('사용자 목록 API 오류:', error);
    // 서버 오류 시에도 최소한의 정보 제공
    return NextResponse.json([
      { id: 'unknown-user', name: '사용자', emoji: '��' }
    ]);
  }
} 