'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 루트 페이지에서 대시보드로 리다이렉트
    router.push('/dashboard');
  }, [router]);

  // 리다이렉트 중 표시할 로딩 화면
  return (
    <div className="min-h-screen bg-[#F9FAFD] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#2251D1] border-t-transparent animate-spin mb-4 mx-auto"></div>
        <p className="text-lg text-[#2251D1] font-medium">WIZ WORKS 대시보드로 이동 중...</p>
      </div>
    </div>
  );
}
