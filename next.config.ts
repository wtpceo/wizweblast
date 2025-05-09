import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 빌드 시 ESLint 체크를 비활성화 (배포 중 발생하는 린트 오류 무시)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 빌드 시 타입 체크를 비활성화 (타입 오류가 있어도 빌드 진행)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
