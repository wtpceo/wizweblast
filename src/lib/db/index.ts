import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

// 환경 변수에서 정제된 연결 문자열 가져오기
const rawConnectionString = process.env.DATABASE_URL || '';

// 연결 문자열 정제 및 처리 - 더 강화된 방식
let connectionString = rawConnectionString;

// 환경 변수가 없는 경우
if (!connectionString) {
  console.error('[DB] ❌ DATABASE_URL 환경 변수가 설정되지 않았습니다!');
  console.error('[DB] ⚠️ .env.local 파일에 다음 설정을 추가하세요:');
  console.error('[DB] DATABASE_URL=postgresql://postgres:I6e2JjSXC8ZBuGdr@db.fqzqmnmyffaibkpnytii.supabase.co:5432/postgres');
}

// 특수 문자 처리 - < > 및 [ ] 제거
if (connectionString.includes('<') || connectionString.includes('[')) {
  console.log('[DB] 특수 문자가 포함된 연결 문자열 정제 중...');
  connectionString = connectionString
    .replace(/[<>]/g, '')  // < > 기호 제거
    .replace(/\[([^\]]+)\]/g, '$1');  // [ ] 안의 내용만 추출
}

// 연결 문자열 로깅 (비밀번호 가려서)
const logSafeConnectionString = connectionString.replace(/:(.*?)@/, ':***@');
console.log('[DB] 연결 문자열(마스킹됨):', logSafeConnectionString);

// 개발 환경을 위한 임시 수정
const IS_DEV = process.env.NODE_ENV !== 'production';
const useLocalDb = IS_DEV && !!process.env.POSTGRES_HOST; 

// Supabase 호스트 확인
const isSupabase = connectionString.includes('supabase.co');

// 실제 연결 문자열 생성
const finalConnectionString = useLocalDb
  ? `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DATABASE || 'postgres'}`
  : connectionString;

console.log('[DB] 데이터베이스 연결 방식:', useLocalDb ? '로컬 연결' : '원격 연결');
console.log('[DB] Supabase 연결:', isSupabase ? '예' : '아니오');

// DB 연결 상태 관리
const dbConnectionState = {
  isConnected: false,
  lastAttempt: new Date(),
  error: null as Error | null
};

// 로컬 스토리지 관련 기능은 유지하되 폴백으로만 사용 (완전히 제거하면 다른 코드에서 참조 오류 발생 가능)
const getClientsFromStorage = (): any[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedClients = localStorage.getItem('wizweblast_clients');
    if (storedClients) {
      const parsedClients = JSON.parse(storedClients);
      console.log('[로컬캐시] 로컬 스토리지에서 광고주 데이터 불러옴:', parsedClients.length + '개');
      
      return parsedClients.map((client: any) => ({
        ...client,
        contractStart: client.contractStart ? new Date(client.contractStart) : new Date(),
        contractEnd: client.contractEnd ? new Date(client.contractEnd) : new Date(),
        createdAt: client.createdAt ? new Date(client.createdAt) : new Date(),
        updatedAt: client.updatedAt ? new Date(client.updatedAt) : new Date()
      }));
    }
    return [];
  } catch (error) {
    console.error('클라이언트 데이터 로드 오류:', error);
    return [];
  }
};

const saveClientsToStorage = (clients: any[]) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('wizweblast_clients', JSON.stringify(clients));
    console.log('[로컬캐시] 광고주 데이터 로컬 스토리지에 저장됨:', clients.length + '개');
  } catch (error) {
    console.error('클라이언트 데이터 저장 오류:', error);
  }
};

// 임시 로컬 메모리 저장소 (폴백만을 위한 빈 배열로 변경)
const initialMockClients: any[] = [];

// 로컬 캐시 (API 호출 최적화용으로만 사용)
let clientsCache: any[] = [];

// 타입스크립트 에러를 피하기 위한 타입 설정
type QueryType = {
  clients: {
    findMany: (options?: any) => Promise<any[]>;
    findFirst: (options?: any) => Promise<any | null>;
  };
};

// 데이터베이스 초기화 
let dbInstance: any = null;
let queryClient: QueryType = {
  clients: {
    findMany: async ({ orderBy }: any = {}) => {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    },
    findFirst: async ({ where }: any = {}) => {
      throw new Error('데이터베이스가 초기화되지 않았습니다.');
    }
  }
};

try {
  console.log('[DB] 데이터베이스 연결 시도 중...');
  
  if (!finalConnectionString) {
    throw new Error('데이터베이스 연결 문자열이 설정되지 않았습니다. DATABASE_URL 환경 변수를 확인하세요.');
  }
  
  // PostgreSQL 클라이언트 초기화
  const client = postgres(finalConnectionString, { 
    max: 10,
    prepare: false,
    // Supabase는 항상 SSL 필요
    ssl: isSupabase ? true : process.env.NODE_ENV === 'production',
    connection: {
      // 연결 타임아웃 증가
      connectTimeout: 10000,
    },
  });

  // 연결 테스트
  const testConnection = async () => {
    try {
      console.log('[DB] 데이터베이스 연결 테스트 중...');
      const result = await client`SELECT 1 as test`;
      dbConnectionState.isConnected = true;
      dbConnectionState.lastAttempt = new Date();
      dbConnectionState.error = null;
      console.log('[DB] 데이터베이스 연결 테스트 성공:', result);
      return true;
    } catch (error) {
      dbConnectionState.isConnected = false;
      dbConnectionState.lastAttempt = new Date();
      dbConnectionState.error = error as Error;
      console.error('[DB] 데이터베이스 연결 테스트 실패:', error);
      return false;
    }
  };

  // 비동기적으로 연결 테스트 실행
  testConnection();

  // Drizzle ORM 초기화
  dbInstance = drizzle(client, { schema });
  
  // 실제 쿼리 클라이언트 설정
  queryClient = {
    clients: {
      findMany: async ({ orderBy }: any = {}) => {
        try {
          console.log('[DB] 광고주 목록 조회 시도...');
          const result = await dbInstance.query.clients.findMany({ orderBy });
          console.log('[DB] 광고주 목록 조회 성공:', result.length + '개');
          
          // 캐싱 (API 호출 최적화용)
          clientsCache = [...result];
          
          return result;
        } catch (error) {
          console.error('[DB] 광고주 목록 조회 실패:', error);
          throw error; // 오류를 상위로 전파하여 API에서 적절히 처리하도록 함
        }
      },
      findFirst: async ({ where }: any = {}) => {
        try {
          console.log('[DB] 광고주 단일 조회 시도...');
          const result = await dbInstance.query.clients.findFirst({ where });
          console.log('[DB] 광고주 단일 조회 결과:', result ? '성공' : '없음');
          return result;
        } catch (error) {
          console.error('[DB] 광고주 단일 조회 실패:', error);
          throw error; // 오류를 상위로 전파
        }
      }
    }
  };

  console.log('[DB] 데이터베이스 연결 성공!');
} catch (error) {
  console.error('[DB] 데이터베이스 연결 실패:', error);
  throw new Error('데이터베이스 연결에 실패했습니다. 서버를 다시 시작하거나 환경 변수를 확인하세요.');
}

// 통합 DB 객체 생성 - fallback 제거
export const db = {
  ...dbInstance, // dbInstance의 모든 프로퍼티 전달
  query: queryClient,
  // 추가 메서드: 삽입, 업데이트, 삭제 - 항상 실제 DB 사용
  insert: (table: any) => ({
    values: (data: any) => ({
      returning: async () => {
        console.log('[DB] 데이터 삽입 시도:', table?.name || '테이블', data);
        
        if (!dbInstance || typeof dbInstance.insert !== 'function') {
          console.error('[DB] 데이터베이스 인스턴스가 유효하지 않습니다.');
          throw new Error('데이터베이스 연결이 설정되지 않았습니다.');
        }
        
        try {
          const result = await dbInstance.insert(table).values(data).returning();
          console.log('[DB] 데이터 삽입 성공:', result);
          
          // 캐시 업데이트 (API 호출 최적화용)
          if (result.length > 0 && table.name === 'clients') {
            const newItem = result[0];
            clientsCache = [...clientsCache.filter(c => c.id !== newItem.id), newItem];
          }
          
          return result;
        } catch (error) {
          console.error('[DB] 데이터 삽입 실패:', error);
          throw error; // 오류를 상위로 전파
        }
      }
    })
  }),
  update: (table: any) => ({
    set: (data: any) => ({
      where: (condition: any) => ({
        returning: async () => {
          console.log('[DB] 데이터 업데이트 시도:', table?.name || '테이블', data);
          
          if (!dbInstance || typeof dbInstance.update !== 'function') {
            console.error('[DB] 데이터베이스 인스턴스가 유효하지 않습니다.');
            throw new Error('데이터베이스 연결이 설정되지 않았습니다.');
          }
          
          try {
            const result = await dbInstance.update(table).set(data).where(condition).returning();
            console.log('[DB] 데이터 업데이트 성공:', result);
            
            // 캐시 업데이트 (API 호출 최적화용)
            if (result.length > 0 && table.name === 'clients') {
              const updatedItem = result[0];
              clientsCache = [...clientsCache.filter(c => c.id !== updatedItem.id), updatedItem];
            }
            
            return result;
          } catch (error) {
            console.error('[DB] 데이터 업데이트 실패:', error);
            throw error; // 오류를 상위로 전파
          }
        }
      })
    })
  }),
  delete: (table: any) => ({
    where: (condition: any) => ({
      returning: async () => {
        console.log('[DB] 데이터 삭제 시도:', table?.name || '테이블', condition);
        
        if (!dbInstance || typeof dbInstance.delete !== 'function') {
          console.error('[DB] 데이터베이스 인스턴스가 유효하지 않습니다.');
          throw new Error('데이터베이스 연결이 설정되지 않았습니다.');
        }
        
        try {
          const result = await dbInstance.delete(table).where(condition).returning();
          console.log('[DB] 데이터 삭제 성공:', result);
          
          // 캐시 업데이트 (API 호출 최적화용)
          if (result.length > 0 && table.name === 'clients') {
            const deletedItem = result[0];
            clientsCache = clientsCache.filter(c => c.id !== deletedItem.id);
          }
          
          return result;
        } catch (error) {
          console.error('[DB] 데이터 삭제 실패:', error);
          throw error; // 오류를 상위로 전파
        }
      }
    })
  }),
  // 추가: 데이터베이스 연결 상태 확인
  getConnectionState: () => dbConnectionState
};

// Drizzle 쿼리 빌더 타입 내보내기
export type DB = typeof db; 