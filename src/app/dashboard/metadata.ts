import { Metadata } from "next";

export const metadata: Metadata = {
  title: "WIZ WORKS - 대시보드",
  description: "광고주 관리 및 마케팅 대시보드",
  openGraph: {
    title: "WIZ WORKS - 대시보드",
    description: "광고주 관리를 위한 최적의 대시보드",
    images: [
      {
        url: "https://wizweblast.vercel.app/api/og",
        width: 1200,
        height: 630,
        alt: "WIZ WORKS 대시보드 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WIZ WORKS - 대시보드",
    description: "광고주 관리를 위한 최적의 대시보드",
    images: ["https://wizweblast.vercel.app/api/og"],
  },
}; 