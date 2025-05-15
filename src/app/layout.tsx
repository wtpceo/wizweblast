import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NoticeProvider } from "@/context/NoticeContext";
import { ClerkProvider } from '@clerk/nextjs';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WIZ WORKS",
  description: "광고주 관리 플랫폼",
  openGraph: {
    title: "WIZ WORKS - 광고주 관리 플랫폼",
    description: "광고주 관리를 위한 최적의 솔루션, WIZ WORKS에서 시작하세요!",
    type: "website",
    url: "https://wizweblast.vercel.app",
    images: [
      {
        url: "https://wizweblast.vercel.app/api/og",
        width: 1200,
        height: 630,
        alt: "WIZ WORKS 대시보드 이미지",
      },
    ],
    siteName: "WIZ WORKS",
  },
  twitter: {
    card: "summary_large_image",
    title: "WIZ WORKS - 광고주 관리 플랫폼",
    description: "광고주 관리를 위한 최적의 솔루션, WIZ WORKS에서 시작하세요!",
    images: ["https://wizweblast.vercel.app/api/og"],
    creator: "@wizworks",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider
          appearance={{
            elements: {
              formButtonPrimary: 'bg-slate-500 hover:bg-slate-400',
              footerActionLink: 'text-slate-500 hover:text-slate-400',
            },
            baseTheme: 'light',
          }}
          localization={{
            signIn: {
              title: '로그인',
              subtitle: '계정에 로그인하세요',
            },
            signUp: {
              title: '회원가입',
              subtitle: '새 계정을 만드세요',
            },
          }}
        >
          <NoticeProvider>
            {children}
          </NoticeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
