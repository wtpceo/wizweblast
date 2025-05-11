'use client';

import React from 'react';
import { SupabaseStatusBanner } from '@/components/SupabaseStatusBanner';

export default function ClientsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [setupCompleted, setSetupCompleted] = React.useState(false);
  
  const handleSetupComplete = () => {
    setSetupCompleted(true);
    
    // 페이지 리로드 (새로고침)
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  
  return (
    <div className="relative">
      {children}
      <SupabaseStatusBanner onSetup={handleSetupComplete} />
    </div>
  );
} 