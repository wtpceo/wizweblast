'use client';

import { NoticeProvider } from '@/context/NoticeContext';

export default function NoticesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NoticeProvider>
      {children}
    </NoticeProvider>
  );
} 