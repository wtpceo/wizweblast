import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { clients as clientsTable } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

// 초기 데이터 (실제로는 데이터베이스를 사용해야 합니다)
const initialClients = [
  {
    id: '1',
    name: '샘플 광고주',
    icon: '🏢',
    contractStart: '2024-01-01',
    contractEnd: '2024-12-31',
    statusTags: ['정상'],
    usesCoupon: true,
    publishesNews: true,
    usesReservation: true,
    phoneNumber: '02-1234-5678',
    naverPlaceUrl: 'https://place.naver.com/restaurant/12345678'
  }
];

// 직접 SQL을 통한 광고주 목록 조회 (대체 방법)
async function getClientsDirectly() {
  try {
    console.log('[직접 SQL 쿼리] 시도 중...');
    
    // db 객체에서 실행 메서드 확인 - 더 유연하게 객체 접근
    const dbInstance = db;
    
    if (!dbInstance) {
      console.error('[직접 SQL 쿼리] 데이터베이스 인스턴스가 없습니다.');
      throw new Error('유효한 데이터베이스 인스턴스가 없습니다');
    }
    
    // 연결 상태 확인
    const connectionState = (db as any).getConnectionState?.();
    if (connectionState) {
      console.log('[직접 SQL 쿼리] DB 연결 상태:', 
        connectionState.isConnected ? '연결됨' : '연결되지 않음', 
        '마지막 시도:', connectionState.lastAttempt?.toISOString());
      
      if (!connectionState.isConnected) {
        console.error('[직접 SQL 쿼리] DB가 연결되지 않았습니다. .env.local 파일의 DATABASE_URL을 확인하세요.');
        console.error('[직접 SQL 쿼리] 오류 정보:', connectionState.error);
      }
    }
    
    // 다양한 방식으로 쿼리 실행 시도
    if (typeof dbInstance.execute === 'function') {
      // 직접 SQL 쿼리 실행
      try {
        const result = await dbInstance.execute(sql`
          SELECT * FROM clients ORDER BY created_at DESC
        `);
        console.log('[직접 SQL 쿼리] 성공 (execute):', result.length + '개 항목');
        return result;
      } catch (execError) {
        console.error('[직접 SQL 쿼리] execute 메서드 실패:', execError);
        // 다른 방법으로 계속 시도
      }
    } 
    
    if (dbInstance.sql && typeof dbInstance.sql === 'function') {
      // sql 메서드 사용 시도
      try {
        const result = await dbInstance.sql`
          SELECT * FROM clients ORDER BY created_at DESC
        `;
        console.log('[직접 SQL 쿼리] 성공 (sql):', result.length + '개 항목');
        return result;
      } catch (sqlError) {
        console.error('[직접 SQL 쿼리] sql 메서드 실패:', sqlError);
        // 다른 방법으로 계속 시도
      }
    } 
    
    if (dbInstance.query && dbInstance.query.clients && typeof dbInstance.query.clients.findMany === 'function') {
      // 쿼리 빌더 사용 시도
      try {
        const result = await dbInstance.query.clients.findMany({
          orderBy: [desc(clientsTable.createdAt)]
        });
        console.log('[직접 SQL 쿼리] 성공 (query):', result.length + '개 항목');
        return result;
      } catch (queryError) {
        console.error('[직접 SQL 쿼리] query 메서드 실패:', queryError);
      }
    }
    
    // 모든 방법이 실패한 경우
    console.error('[직접 SQL 쿼리] 모든 쿼리 방법이 실패했습니다.');
    throw new Error('데이터베이스 쿼리 메서드를 찾을 수 없거나 모든 쿼리 방법이 실패했습니다');
  } catch (error) {
    console.error('[직접 SQL 쿼리] 실패:', error);
    throw error;
  }
}

// 광고주 목록 조회 API
export async function GET(request: Request) {
  try {
    console.log('[광고주 목록 API] 요청 시작');
    
    // 인증 확인
    const { userId } = await auth();
    
    if (!userId) {
      console.log('[광고주 목록 API] 인증되지 않은 사용자');
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    console.log('[광고주 목록 API] 인증된 사용자:', userId);

    // URL에서 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    console.log('[광고주 목록 API] 쿼리 파라미터:', { status, search });

    // DB 연결 상태 확인
    const connectionState = (db as any).getConnectionState?.();
    console.log('[광고주 목록 API] DB 연결 상태:', connectionState);

    // DB에서 광고주 목록 가져오기
    console.log('[광고주 목록 API] DB 쿼리 시작');
    
    let clientList = [];
    
    try {
      // 방법 1: 기본 Drizzle 쿼리 메서드 사용
      try {
        console.log('[광고주 목록 API] Drizzle 쿼리 시도...');
        clientList = await db.query.clients.findMany({
          orderBy: [desc(clientsTable.createdAt)]
        });
        console.log('[광고주 목록 API] Drizzle 쿼리 성공:', clientList.length + '개 항목');
      } catch (drizzleError) {
        console.error('[광고주 목록 API] Drizzle 쿼리 실패:', drizzleError);
        
        // 방법 2: 직접 SQL 실행
        console.log('[광고주 목록 API] 직접 SQL 시도 중...');
        clientList = await getClientsDirectly();
      }
      
      console.log('[광고주 목록 API] DB 쿼리 성공:', clientList.length + '개 항목');

      // 상태별 필터링
      if (status && status !== 'all') {
        clientList = clientList.filter((client: any) => 
          client.statusTags && Array.isArray(client.statusTags) && client.statusTags.includes(status)
        );
      }

      // 검색어 필터링
      if (search) {
        const searchLower = search.toLowerCase();
        clientList = clientList.filter((client: any) => {
          // 방어적 코딩: client.name이 undefined인 경우 처리
          if (!client.name) return false;
          
          try {
            return client.name.toLowerCase().includes(searchLower);
          } catch (e) {
            console.error('[광고주 목록 API] 검색 필터링 오류:', e, client);
            return false;
          }
        });
      }

      // API 응답 데이터 포맷팅 (camelCase로 통일)
      const formattedClients = clientList.map((client: any) => {
        try {
          // 타입 안전을 위한 데이터 처리
          const startDate = typeof client.contractStart === 'string' 
            ? client.contractStart 
            : (client.contractStart as any) instanceof Date
              ? (client.contractStart as Date).toISOString() 
              : '';
              
          const endDate = typeof client.contractEnd === 'string' 
            ? client.contractEnd 
            : (client.contractEnd as any) instanceof Date
              ? (client.contractEnd as Date).toISOString() 
              : '';
          
          // 컬럼명 변환 - DB에서 snake_case, 클라이언트에서 camelCase 처리
          return {
            id: String(client.id),
            name: client.name || '',
            icon: client.icon || client.icon || '🏢',
            contractStart: startDate,
            contractEnd: endDate,
            statusTags: client.statusTags || client.status_tags || ['정상'],
            usesCoupon: client.usesCoupon !== undefined ? client.usesCoupon : (client.uses_coupon || false),
            publishesNews: client.publishesNews !== undefined ? client.publishesNews : (client.publishes_news || false),
            usesReservation: client.usesReservation !== undefined ? client.usesReservation : (client.uses_reservation || false),
            phoneNumber: client.phoneNumber || client.phone_number || '',
            naverPlaceUrl: client.naverPlaceUrl || client.naver_place_url || '',
          };
        } catch (error) {
          console.error('[광고주 목록 API] 클라이언트 포맷팅 오류:', error, client);
          return {
            id: String(client.id || 0),
            name: client.name || '오류 발생 데이터',
            icon: '⚠️',
            contractStart: '',
            contractEnd: '',
            statusTags: ['오류'],
            usesCoupon: false,
            publishesNews: false,
            usesReservation: false,
            phoneNumber: '',
            naverPlaceUrl: '',
          };
        }
      });

      console.log('[광고주 목록 API] 응답 생성:', formattedClients.length + '개 항목');
      return NextResponse.json(formattedClients);
    } catch (dbError) {
      console.error('[광고주 목록 API] 🔥 DB 쿼리 실패:', dbError);
      console.error('[광고주 목록 API] 오류 상세 정보:', {
        message: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined,
        name: dbError instanceof Error ? dbError.name : undefined
      });
      
      // 임시 대응으로 샘플 데이터 반환
      console.log('[광고주 목록 API] ⚠️ 샘플 데이터 사용');
      
      return NextResponse.json(
        { 
          error: '광고주 데이터베이스 쿼리 실패', 
          message: dbError instanceof Error ? dbError.message : String(dbError),
          fallbackData: initialClients 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[광고주 목록 API] 🔥 처리 오류:', error);
    console.error('[광고주 목록 API] 오류 상세 정보:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      code: error instanceof Error ? (error as any).code : undefined
    });
    
    return NextResponse.json(
      { 
        error: '광고주 목록을 가져오는 중 오류가 발생했습니다.',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// 광고주 등록 API
export async function POST(request: Request) {
  try {
    console.log("[광고주 등록 API] 요청 받음");
    const { userId } = await auth();
    
    if (!userId) {
      console.log("[광고주 등록 API] 인증되지 않은 사용자");
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("[광고주 등록 API] 요청 데이터:", body);
    
    // camelCase 변수만 사용하도록 수정
    const name = body.name;
    const contractStart = body.contractStart || body.contract_start;
    const contractEnd = body.contractEnd || body.contract_end;
    const statusTags = body.statusTags || body.status_tags || ['정상'];
    const icon = body.icon || '🏢';
    const usesCoupon = body.usesCoupon !== undefined ? body.usesCoupon : (body.uses_coupon || false);
    const publishesNews = body.publishesNews !== undefined ? body.publishesNews : (body.publishes_news || false);
    const usesReservation = body.usesReservation !== undefined ? body.usesReservation : (body.uses_reservation || false);
    const phoneNumber = body.phoneNumber || body.phone_number || '';
    
    // URL 처리 - 네이버 미(me) 링크 형식도 지원
    let naverPlaceUrl = body.naverPlaceUrl || body.naver_place_url || '';
    // URL이 제공되었고 http로 시작하지 않는 경우 https:// 접두사 추가
    if (naverPlaceUrl && !naverPlaceUrl.startsWith('http')) {
      naverPlaceUrl = `https://${naverPlaceUrl}`;
    }

    // 필수 필드 검증
    if (!name || !contractStart || !contractEnd) {
      console.log("[광고주 등록 API] 필수 정보 누락:", { name, contractStart, contractEnd });
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    console.log("[광고주 등록 API] 데이터 유효성 검사 통과, DB 저장 시도");
    
    // 연결 상태 확인
    const connectionState = (db as any).getConnectionState?.();
    if (connectionState) {
      console.log('[광고주 등록 API] DB 연결 상태:', 
        connectionState.isConnected ? '연결됨' : '연결되지 않음', 
        '마지막 시도:', connectionState.lastAttempt?.toISOString());
      
      if (!connectionState.isConnected) {
        console.error('[광고주 등록 API] ⚠️ DB가 연결되지 않았습니다. .env.local 파일의 DATABASE_URL을 확인하세요.');
        console.error('[광고주 등록 API] 오류 정보:', connectionState.error);
        
        // 연결이 되지 않았더라도 계속 진행 (폴백 로직이 있으므로)
        console.log('[광고주 등록 API] 연결 실패에도 불구하고 계속 진행합니다 (폴백 설계)');
      }
    }
    
    // 날짜 형식 변환 (ISO 문자열 -> Date 객체)
    let startDate: Date;
    let endDate: Date;
    
    try {
      startDate = new Date(contractStart);
      if (isNaN(startDate.getTime())) {
        throw new Error('계약 시작일이 유효한 날짜 형식이 아닙니다.');
      }
    } catch (dateError) {
      console.error('[광고주 등록 API] 계약 시작일 형식 오류:', dateError);
      return NextResponse.json(
        { error: '계약 시작일이 유효한 날짜 형식이 아닙니다.' },
        { status: 400 }
      );
    }
    
    try {
      endDate = new Date(contractEnd);
      if (isNaN(endDate.getTime())) {
        throw new Error('계약 종료일이 유효한 날짜 형식이 아닙니다.');
      }
    } catch (dateError) {
      console.error('[광고주 등록 API] 계약 종료일 형식 오류:', dateError);
      return NextResponse.json(
        { error: '계약 종료일이 유효한 날짜 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // DB에 광고주 추가
    console.log("[광고주 등록 API] DB 삽입 시작:", { 
      name, startDate, endDate, teamId: 1, createdBy: 1 
    });
    
    try {
      // 날짜를 ISO 문자열로 변환
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0]; 
      
      const insertData = {
        name,
        icon,
        contractStart: formattedStartDate,  // ISO 날짜 문자열 사용
        contractEnd: formattedEndDate,      // ISO 날짜 문자열 사용
        statusTags,
        usesCoupon,
        publishesNews,
        usesReservation,
        phoneNumber,
        naverPlaceUrl,
        teamId: 1, // 임시 팀 ID (실제로는 사용자의 팀 ID를 찾아야 함)
        createdBy: Number(userId) || 1 // 로그인한 사용자 ID를 사용 (Clerk ID는 문자열이므로 숫자로 변환 시도)
      };
      
      console.log("[광고주 등록 API] 삽입할 데이터:", insertData);
      
      // 여러 방식으로 DB 삽입 시도
      let result;
      const dbInstance = db;
      
      // 직접 insert 메서드 호출 시도
      if (dbInstance && typeof dbInstance.insert === 'function') {
        console.log("[광고주 등록 API] 기본 insert 메서드 사용");
        try {
          result = await dbInstance.insert(clientsTable).values(insertData).returning();
          console.log("[광고주 등록 API] 삽입 성공 (insert):", result);
        } catch (insertError) {
          console.error("[광고주 등록 API] insert 메서드 실패:", insertError);
          // 다른 방법으로 계속 시도
        }
      } 
      
      // 이전 시도 실패 시 다른 방식으로 삽입 시도
      if (!result && dbInstance.query && dbInstance.query.clients && typeof dbInstance.query.clients.create === 'function') {
        console.log("[광고주 등록 API] query.clients.create 메서드 사용");
        try {
          const createdClient = await dbInstance.query.clients.create({
            data: insertData
          });
          result = [createdClient];
          console.log("[광고주 등록 API] 삽입 성공 (create):", result);
        } catch (createError) {
          console.error("[광고주 등록 API] create 메서드 실패:", createError);
          // 다른 방법으로 계속 시도
        }
      }
      
      // 이전 시도 실패 시 SQL 직접 실행 시도
      if (!result && dbInstance && typeof dbInstance.execute === 'function') {
        console.log("[광고주 등록 API] SQL 실행 메서드 사용");
        try {
          // SQL 파라미터를 객체로 전달
          result = await dbInstance.execute(sql`
            INSERT INTO clients 
              (name, icon, contract_start, contract_end, status_tags, uses_coupon, publishes_news, uses_reservation, phone_number, naver_place_url, team_id, created_by)
            VALUES 
              (${name}, ${icon}, ${formattedStartDate}, ${formattedEndDate}, ${JSON.stringify(statusTags)}, ${usesCoupon}, ${publishesNews}, ${usesReservation}, ${phoneNumber}, ${naverPlaceUrl}, 1, 1)
            RETURNING *
          `);
          console.log("[광고주 등록 API] 삽입 성공 (execute):", result);
        } catch (executeError) {
          console.error("[광고주 등록 API] execute 메서드 실패:", executeError);
        }
      } 
      
      // 모든 방법이 실패한 경우
      if (!result || !result.length) {
        console.error("[광고주 등록 API] 모든 삽입 방법이 실패했습니다.");
        
        // 모의 데이터로 응답
        const mockId = `mock-${Date.now()}`;
        const mockClient = {
          id: mockId,
          name,
          icon,
          contractStart: formattedStartDate,
          contractEnd: formattedEndDate,
          statusTags,
          usesCoupon,
          publishesNews,
          usesReservation,
          phoneNumber,
          naverPlaceUrl
        };
        
        return NextResponse.json({ 
          message: "데이터베이스 연결 실패로 임시 응답합니다. .env.local 파일의 DATABASE_URL을 확인하세요.",
          client: mockClient,
          success: false,
          isTemporary: true
        }, { status: 200 });
      }
      
      console.log("[광고주 등록 API] DB 삽입 결과:", result);
      
      const newClient = result[0];
      console.log("[광고주 등록 API] 신규 광고주:", newClient);

      // API 응답 데이터 포맷팅 (camelCase로 통일)
      const clientResponse = {
        id: String(newClient.id),
        name: newClient.name,
        icon: newClient.icon || '🏢',
        contractStart: (newClient.contractStart as any) instanceof Date 
          ? (newClient.contractStart as Date).toISOString() 
          : String(newClient.contractStart || newClient.contract_start),
        contractEnd: (newClient.contractEnd as any) instanceof Date 
          ? (newClient.contractEnd as Date).toISOString() 
          : String(newClient.contractEnd || newClient.contract_end),
        statusTags: newClient.statusTags || newClient.status_tags || ['정상'],
        usesCoupon: newClient.usesCoupon !== undefined ? newClient.usesCoupon : (newClient.uses_coupon || false),
        publishesNews: newClient.publishesNews !== undefined ? newClient.publishesNews : (newClient.publishes_news || false),
        usesReservation: newClient.usesReservation !== undefined ? newClient.usesReservation : (newClient.uses_reservation || false),
        phoneNumber: newClient.phoneNumber || newClient.phone_number || '',
        naverPlaceUrl: newClient.naverPlaceUrl || newClient.naver_place_url || '',
      };
      
      console.log("[광고주 등록 API] 응답 데이터:", clientResponse);
      return NextResponse.json({ client: clientResponse, success: true }, { status: 201 });
    } catch (dbError) {
      console.error("[광고주 등록 API] DB 오류:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('[광고주 등록 API] 오류:', error);
    return NextResponse.json(
      { error: '광고주 등록 중 오류가 발생했습니다.', message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 