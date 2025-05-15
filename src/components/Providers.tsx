'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider } from './ThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // 클라이언트 사이드에서 하이드레이션이 완료될 때까지 최소한의 UI 반환
    return <>{children}</>;
  }

  return <ThemeProvider>{children}</ThemeProvider>;
} 