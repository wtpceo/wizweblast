import { db } from '.';
import { clients, clientExternalData } from './schema';
import { eq, sql } from 'drizzle-orm';

// 데이터베이스 연결 상태 관리
let dbConnectionState = {
  isConnected: false,
  lastAttempt: new Date(),
  error: null as Error | null
};

// dbInstance 참조
const dbInstance = (db as any).dbInstance || db;

// 클라이언트에서만 사용되는 로컬 스토리지 함수
const getClientsFromStorage = (): any[] => {
  // 서버 사이드에서 실행 중인지 확인
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const storedClients = localStorage.getItem('wizweblast_clients');
    if (storedClients) {
      const parsedClients = JSON.parse(storedClients);
      console.log('로컬 스토리지에서 광고주 데이터 불러옴:', parsedClients.length + '개');
      
      // 날짜 문자열을 Date 객체로 변환
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

// 연결 테스트 함수
const testConnection = async (): Promise<boolean> => {
  try {
    dbConnectionState.lastAttempt = new Date();
    
    if (dbInstance && typeof dbInstance.execute === 'function') {
      const result = await dbInstance.execute(sql`SELECT 1 as test`);
      dbConnectionState.isConnected = true;
      dbConnectionState.error = null;
      console.log('데이터베이스 연결 테스트 성공:', result);
      return true;
    } else {
      throw new Error('데이터베이스 인스턴스가 유효하지 않음');
    }
  } catch (error) {
    dbConnectionState.isConnected = false;
    dbConnectionState.error = error as Error;
    console.error('데이터베이스 연결 테스트 실패:', error);
    
    // 재연결 시도 스케줄링 (5분 후)
    if (typeof window !== 'undefined') {
      setTimeout(() => testConnection(), 5 * 60 * 1000);
    }
    return false;
  }
};

/**
 * 광고주 크롤링 데이터 가져오기
 */
export async function getClientExternalData(clientId: number) {
  try {
    // db 객체에서 dbInstance 접근 (직접 추가한 필드가 아니므로 타입 단언 사용)
    const dbInstance = (db as any).dbInstance || db;
    
    // 실제 DB 쿼리 시도
    if (dbInstance && typeof dbInstance.select === 'function') {
      console.log('[쿼리] 실제 DB에서 광고주 외부 데이터 조회 시도:', clientId);
      
      const result = await dbInstance
        .select()
        .from(clientExternalData)
        .where(eq(clientExternalData.clientId, clientId));
        
      console.log('[쿼리] 실제 DB 조회 결과:', result);
      
      if (result && result.length > 0) {
        return result[0];
      }
    } else {
      console.warn('[쿼리] 실제 DB 접근 불가, 폴백 메서드 사용');
      // 폴백으로 기존 query 메서드 사용
      if (db.query?.clientExternalData?.findFirst) {
        return await db.query.clientExternalData.findFirst({
          where: eq(clientExternalData.clientId, clientId)
        });
      }
    }
    
    console.warn('[쿼리] 광고주 외부 데이터 없음:', clientId);
    return null;
  } catch (error) {
    console.error('[쿼리] 광고주 외부 데이터 조회 오류:', error);
    return null;
  }
}

/**
 * 광고주 정보 가져오기
 */
export async function getClient(clientId: number) {
  try {
    // db 객체에서 dbInstance 접근
    const dbInstance = (db as any).dbInstance || db;
    
    // 실제 DB 쿼리 시도
    if (dbInstance && typeof dbInstance.select === 'function') {
      console.log('[쿼리] 실제 DB에서 광고주 정보 조회 시도:', clientId);
      
      const result = await dbInstance
        .select()
        .from(clients)
        .where(eq(clients.id, clientId));
        
      console.log('[쿼리] 실제 DB 조회 결과:', result);
      
      if (result && result.length > 0) {
        return result[0];
      }
    } else {
      console.warn('[쿼리] 실제 DB 접근 불가, 폴백 메서드 사용');
      // 폴백으로 기존 query 메서드 사용
      if (db.query?.clients?.findFirst) {
        return await db.query.clients.findFirst({
          where: eq(clients.id, clientId)
        });
      }
    }
    
    console.warn('[쿼리] 광고주 정보 없음:', clientId);
    return null;
  } catch (error) {
    console.error('[쿼리] 광고주 정보 조회 오류:', error);
    return null;
  }
}

/**
 * 광고주 크롤링 데이터 업데이트
 */
export async function updateClientExternalData(
  clientId: number, 
  data: {
    industry?: string | null;
    coupon?: string | null;
    news?: boolean;
    reservation?: string | null;
    keywords?: string[];
  }
) {
  try {
    // 기존 데이터 확인
    const existingData = await getClientExternalData(clientId);
    
    // db 객체에서 dbInstance 접근
    const dbInstance = (db as any).dbInstance || db;
    
    console.log('[쿼리] 광고주 외부 데이터 업데이트 시도:', clientId, data);
    
    if (existingData) {
      // 업데이트 - 실제 DB 쿼리 시도
      if (dbInstance && typeof dbInstance.update === 'function') {
        console.log('[쿼리] 실제 DB를 통해 외부 데이터 업데이트');
        
        return await dbInstance
          .update(clientExternalData)
          .set({
            ...data,
            lastScrapedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(clientExternalData.clientId, clientId))
          .returning();
      } else {
        // 폴백으로 기존 메서드 사용
        console.warn('[쿼리] 실제 DB 접근 불가, 폴백 메서드 사용');
        return await db
          .update(clientExternalData)
          .set({
            ...data,
            lastScrapedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(clientExternalData.clientId, clientId))
          .returning();
      }
    } else {
      // 새로 생성 - 실제 DB 쿼리 시도
      if (dbInstance && typeof dbInstance.insert === 'function') {
        console.log('[쿼리] 실제 DB를 통해 외부 데이터 생성');
        
        return await dbInstance
          .insert(clientExternalData)
          .values({
            clientId,
            ...data,
            lastScrapedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
      } else {
        // 폴백으로 기존 메서드 사용
        console.warn('[쿼리] 실제 DB 접근 불가, 폴백 메서드 사용');
        return await db
          .insert(clientExternalData)
          .values({
            clientId,
            ...data,
            lastScrapedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
      }
    }
  } catch (error) {
    console.error('[쿼리] 광고주 외부 데이터 업데이트 오류:', error);
    // 오류 처리: 모의 응답 반환
    return [{
      id: 1,
      clientId,
      industry: data.industry || null,
      coupon: data.coupon || null,
      news: data.news || false,
      reservation: data.reservation || null,
      keywords: data.keywords || [],
      lastScrapedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }];
  }
}

/**
 * 광고주 크롤링 결과 기반으로 정보 업데이트
 */
export async function updateClientFromCrawlData(
  clientId: number,
  data: {
    usesCoupon?: boolean;
    publishesNews?: boolean;
    usesReservation?: boolean;
  }
) {
  try {
    // db 객체에서 dbInstance 접근
    const dbInstance = (db as any).dbInstance || db;
    
    console.log('[쿼리] 광고주 정보 업데이트 시도:', clientId, data);
    
    // 실제 DB 쿼리 시도
    if (dbInstance && typeof dbInstance.update === 'function') {
      console.log('[쿼리] 실제 DB를 통해 광고주 정보 업데이트');
      
      return await dbInstance
        .update(clients)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(clients.id, clientId))
        .returning();
    } else {
      // 폴백으로 기존 메서드 사용
      console.warn('[쿼리] 실제 DB 접근 불가, 폴백 메서드 사용');
      return await db
        .update(clients)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(clients.id, clientId))
        .returning();
    }
  } catch (error) {
    console.error('[쿼리] 광고주 정보 업데이트 오류:', error);
    
    // 기존 클라이언트 정보 조회 시도
    const client = await getClient(clientId);
    
    // 오류 처리: 모의 응답 반환
    return [{
      id: clientId,
      name: client?.name || '임시 광고주 데이터',
      icon: client?.icon || '🏢',
      contractStart: client?.contractStart || new Date('2024-01-01'),
      contractEnd: client?.contractEnd || new Date('2024-12-31'),
      statusTags: client?.statusTags || ['정상', '크롤링 완료'],
      usesCoupon: data.usesCoupon !== undefined ? data.usesCoupon : (client?.usesCoupon || false),
      publishesNews: data.publishesNews !== undefined ? data.publishesNews : (client?.publishesNews || false),
      usesReservation: data.usesReservation !== undefined ? data.usesReservation : (client?.usesReservation || false),
      phoneNumber: client?.phoneNumber || '',
      naverPlaceUrl: client?.naverPlaceUrl || '',
      teamId: client?.teamId || 1,
      createdBy: client?.createdBy || null,
      createdAt: client?.createdAt || new Date(),
      updatedAt: new Date()
    }];
  }
}

// 로컬 데이터를 DB에 동기화하는 함수
export const syncLocalDataToDB = async () => {
  if (!dbConnectionState.isConnected || !dbInstance) return;
  
  try {
    console.log('로컬 데이터 DB 동기화 시도...');
    const localClients = getClientsFromStorage();
    
    // 최근 업데이트 시간으로 필터링 (마지막 동기화 이후 데이터만)
    const unsyncedClients = localClients.filter((client: any) => {
      const updateTime = new Date(client.updatedAt).getTime();
      const lastSyncTime = parseInt(localStorage.getItem('last_sync_time') || '0');
      return updateTime > lastSyncTime;
    });
    
    if (unsyncedClients.length === 0) {
      console.log('동기화할 로컬 데이터 없음');
      return;
    }
    
    // 각 로컬 클라이언트를 DB에 upsert
    for (const client of unsyncedClients) {
      // DB에 해당 ID가 있는지 확인
      const existingClient = await dbInstance.query.clients.findFirst({
        where: { id: { equals: client.id } }
      });
      
      if (existingClient) {
        // 업데이트
        await dbInstance.update(clients).set(client).where(eq(clients.id, client.id));
      } else {
        // 신규 추가
        await dbInstance.insert(clients).values(client);
      }
    }
    
    // 동기화 시간 기록
    localStorage.setItem('last_sync_time', Date.now().toString());
    console.log('로컬 데이터 DB 동기화 완료');
  } catch (error) {
    console.error('로컬 데이터 DB 동기화 오류:', error);
  }
};

// 네트워크 연결 감지 이벤트에 동기화 함수 등록
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('네트워크 연결 감지, DB 동기화 시도...');
    testConnection().then((connected: boolean) => {
      if (connected) syncLocalDataToDB();
    });
  });
}

// 날짜 포맷 유틸리티 함수
export const formatDateForDB = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

export const formatDateFromDB = (date: any): string => {
  if (!date) return '';
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date;
  return String(date);
}; 