'use client';

import { useEffect, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 클라이언트 사이드에서 하이드레이션이 완료될 때까지 최소한의 UI 반환
    return <>{children}</>;
  }

  // ThemeProvider 없이 children을 직접 반환
  return <>{children}</>;
} 