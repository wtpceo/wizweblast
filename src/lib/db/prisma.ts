import { PrismaClient } from '@prisma/client';

// PrismaClient 전역 인스턴스 선언
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 전역 객체에 prisma가 없는 경우에만 새 인스턴스 생성 (개발 환경에서 핫 리로딩 문제 방지)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// 개발 환경일 때만 전역 객체에 할당
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} 