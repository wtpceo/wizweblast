import { NextResponse } from 'next/server';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import type { User as ClerkUser } from '@clerk/nextjs/server';

interface FormattedUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string | null;
  profileImageUrl: string | null;
  department: string;
  position: string;
  role: string;
  lastSignIn: number | null;
  createdAt: number;
  isCurrentUser?: boolean;
  emoji?: string;
}

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
      
      // 모든 사용자 목록 가져오기 - 최신 버전 API 호출 방식
      const clerk = await clerkClient();
      const allUsers = await clerk.users.getUserList({
        limit: 100,
        orderBy: '-created_at',
      });
      
      console.log('Clerk API 응답:', allUsers.data.length, '명의 사용자 정보 가져옴');
      
      // 사용자 정보 변환
      let formattedUsers: FormattedUser[] = allUsers.data.map((u: ClerkUser) => ({
        id: u.id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || '사용자',
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.emailAddresses[0]?.emailAddress || '',
        imageUrl: u.imageUrl,
        profileImageUrl: u.imageUrl,
        department: (u.publicMetadata?.department as string) || '미지정',
        position: (u.publicMetadata?.position as string) || '',
        role: (u.publicMetadata?.role as string) || 'staff',
        lastSignIn: u.lastSignInAt,
        createdAt: u.createdAt
      }));
      
      // 현재 사용자를 최상단에 배치하고, 나머지는 이름순으로 정렬
      formattedUsers = formattedUsers.sort((a: FormattedUser, b: FormattedUser) => {
        if (a.id === userId) return -1;
        if (b.id === userId) return 1;
        return a.name.localeCompare(b.name);
      });
      
      // 현재 사용자에 special 마커 추가
      formattedUsers = formattedUsers.map((user: FormattedUser) => ({
        ...user,
        isCurrentUser: user.id === userId
      }));
      
      console.log(`사용자 목록 API: ${formattedUsers.length}명의 사용자 정보 반환`);
      return NextResponse.json(formattedUsers);
    } catch (clerkError) {
      console.error('Clerk API 오류:', clerkError);
      
      // 최소한의 정보 제공 (현재 사용자만)
      return NextResponse.json([
        { 
          id: userId, 
          name: '현재 사용자', 
          emoji: '👨‍💼',
          isCurrentUser: true 
        }
      ]);
    }
  } catch (error) {
    console.error('사용자 목록 API 오류:', error);
    // 서버 오류 시에도 최소한의 정보 제공
    return NextResponse.json([
      { id: 'unknown-user', name: '사용자', emoji: '👨‍��' }
    ]);
  }
} 