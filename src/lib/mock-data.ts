// 대시보드 통계 데이터 타입
export type DashboardStats = {
  totalClients: number;
  nearExpiry: number;
  poorManaged: number;
  complaintsOngoing: number;
};

// 공지사항 데이터 타입
export type Notice = {
  id: string;
  title: string;
  isFixed: boolean;
  createdAt: string;
};

// 광고주 데이터 타입
export type Client = {
  id: string;
  name: string;
  icon: string; // 이모지 아이콘
  contractStart: string;
  contractEnd: string;
  statusTags: string[]; // 예: ["관리 소홀", "민원 중"]
  usesCoupon: boolean; // 쿠폰 사용 여부
  publishesNews: boolean; // 소식 발행 여부
  usesReservation: boolean; // 예약 시스템 사용 여부
  phoneNumber?: string; // 전화번호
  naverPlaceUrl?: string; // 네이버플레이스 링크
  keywords?: string[]; // 대표 키워드
  last_activity_at?: string; // 최근 활동 일시
};

// 할일 데이터 타입
export type ClientTodo = {
  id: string;
  clientId: string;
  clientName?: string; // 클라이언트 이름 (선택적)
  clientIcon?: string; // 클라이언트 아이콘 (선택적)
  content: string;
  assignedTo: string;
  completed: boolean; // 완료 여부 추가
  createdAt: string;
  completedAt?: string; // 완료 날짜 (선택적)
};

// 메모 데이터 타입
export type ClientNote = {
  id: string;
  clientId: string;
  note: string;
  createdAt: string;
};

// 관리자 통계 데이터 타입
export type AdminStats = {
  departmentSummary: {
    department: string;
    totalTodos: number;
    completedTodos: number;
  }[];
  userSummary: {
    userId: string;
    name: string;
    department: string;
    totalTodos: number;
    completedTodos: number;
  }[];
};

// 대시보드 통계 목업 데이터
export const mockDashboardStats: DashboardStats = {
  totalClients: 124,
  nearExpiry: 8,
  poorManaged: 15,
  complaintsOngoing: 3
};

// 공지사항 목업 데이터
export const mockNotices: Notice[] = [
  {
    id: '1',
    title: '[중요] 신규 플랫폼 출시 안내 및 필수 교육 일정',
    isFixed: true,
    createdAt: '2023-11-15T10:30:00Z'
  },
  {
    id: '2',
    title: '[공지] 11월 휴무 안내 및 대체 인력 배치',
    isFixed: true,
    createdAt: '2023-11-10T09:00:00Z'
  },
  {
    id: '3',
    title: '광고주 관리 가이드라인 업데이트',
    isFixed: false,
    createdAt: '2023-11-08T14:25:00Z'
  },
  {
    id: '4',
    title: '시스템 정기점검 안내 (11/20 03:00~05:00)',
    isFixed: false,
    createdAt: '2023-11-05T11:45:00Z'
  },
  {
    id: '5',
    title: '신규 광고주 등록 프로세스 변경 안내',
    isFixed: false,
    createdAt: '2023-11-01T16:20:00Z'
  }
];

// 광고주 목업 데이터
export const mockClients: Client[] = [
  {
    id: '1',
    name: '대한치킨',
    icon: '🍗',
    contractStart: '2023-09-01T00:00:00Z',
    contractEnd: '2024-08-31T23:59:59Z',
    statusTags: [],
    usesCoupon: true,
    publishesNews: true,
    usesReservation: false,
    phoneNumber: '02-1234-5678',
    naverPlaceUrl: 'https://place.naver.com/12345678',
    keywords: ['치킨', '배달', '야식', '맥주', '파티'],
    last_activity_at: '2023-11-15T10:30:00Z'
  },
  {
    id: '2',
    name: '서울피자',
    icon: '🍕',
    contractStart: '2023-10-15T00:00:00Z',
    contractEnd: '2024-01-15T23:59:59Z',
    statusTags: ['종료 임박'],
    usesCoupon: false,
    publishesNews: true,
    usesReservation: true,
    phoneNumber: '02-1234-5678',
    naverPlaceUrl: 'https://place.naver.com/12345678',
    keywords: ['피자', '배달', '파티', '치즈', '페퍼로니'],
    last_activity_at: '2023-11-15T10:30:00Z'
  },
  {
    id: '3',
    name: '바다횟집',
    icon: '🐟',
    contractStart: '2023-08-20T00:00:00Z',
    contractEnd: '2024-08-20T23:59:59Z',
    statusTags: ['관리 소홀'],
    usesCoupon: true,
    publishesNews: false,
    usesReservation: true,
    phoneNumber: '02-1234-5678',
    naverPlaceUrl: 'https://place.naver.com/12345678',
    keywords: ['회', '해산물', '신선', '모듬회', '소주'],
    last_activity_at: '2023-11-15T10:30:00Z'
  },
  {
    id: '4',
    name: '행복떡볶이',
    icon: '🧂',
    contractStart: '2023-11-01T00:00:00Z',
    contractEnd: '2024-11-01T23:59:59Z',
    statusTags: ['민원 중'],
    usesCoupon: false,
    publishesNews: false,
    usesReservation: false,
    phoneNumber: '02-1234-5678',
    naverPlaceUrl: 'https://place.naver.com/12345678',
    last_activity_at: '2023-11-15T10:30:00Z'
  },
  {
    id: '5',
    name: '도시락카페',
    icon: '🍱',
    contractStart: '2023-07-15T00:00:00Z',
    contractEnd: '2024-01-15T23:59:59Z',
    statusTags: ['종료 임박', '관리 소홀'],
    usesCoupon: true,
    publishesNews: false,
    usesReservation: true,
    phoneNumber: '02-1234-5678',
    naverPlaceUrl: 'https://place.naver.com/12345678',
    last_activity_at: '2023-11-15T10:30:00Z'
  },
  {
    id: '6',
    name: '커피나무',
    icon: '☕',
    contractStart: '2023-05-10T00:00:00Z',
    contractEnd: '2024-05-10T23:59:59Z',
    statusTags: [],
    usesCoupon: false,
    publishesNews: true,
    usesReservation: true,
    phoneNumber: '02-1234-5678',
    naverPlaceUrl: 'https://place.naver.com/12345678'
  },
  {
    id: '7',
    name: '웰빙마트',
    icon: '🛒',
    contractStart: '2023-06-01T00:00:00Z',
    contractEnd: '2024-06-01T23:59:59Z',
    statusTags: ['관리 소홀', '민원 중'],
    usesCoupon: false,
    publishesNews: false,
    usesReservation: false,
    phoneNumber: '02-1234-5678',
    naverPlaceUrl: 'https://place.naver.com/12345678'
  },
  {
    id: '8',
    name: '달콤베이커리',
    icon: '🍰',
    contractStart: '2023-10-01T00:00:00Z',
    contractEnd: '2024-03-31T23:59:59Z',
    statusTags: ['종료 임박'],
    usesCoupon: true,
    publishesNews: true,
    usesReservation: false,
    phoneNumber: '02-1234-5678',
    naverPlaceUrl: 'https://place.naver.com/12345678'
  }
];

// 관리자 통계 목업 데이터
export const mockAdminStats: AdminStats = {
  departmentSummary: [
    { department: '디자인', totalTodos: 78, completedTodos: 62 },
    { department: '콘텐츠', totalTodos: 124, completedTodos: 93 },
    { department: '미디어', totalTodos: 96, completedTodos: 67 },
    { department: '고객관리', totalTodos: 45, completedTodos: 38 },
    { department: '관리자', totalTodos: 32, completedTodos: 30 }
  ],
  userSummary: [
    { userId: 'user1', name: '김담당', department: '미디어', totalTodos: 32, completedTodos: 28 },
    { userId: 'user2', name: '이매니저', department: '콘텐츠', totalTodos: 45, completedTodos: 37 },
    { userId: 'user3', name: '박대리', department: '디자인', totalTodos: 27, completedTodos: 20 },
    { userId: 'user4', name: '최주임', department: '고객관리', totalTodos: 19, completedTodos: 15 },
    { userId: 'user5', name: '정과장', department: '미디어', totalTodos: 38, completedTodos: 24 },
    { userId: 'user6', name: '조디자이너', department: '디자인', totalTodos: 51, completedTodos: 42 },
    { userId: 'user7', name: '한팀장', department: '관리자', totalTodos: 32, completedTodos: 30 },
    { userId: 'user8', name: '유대리', department: '콘텐츠', totalTodos: 41, completedTodos: 32 },
    { userId: 'user9', name: '임주임', department: '고객관리', totalTodos: 26, completedTodos: 23 },
    { userId: 'user10', name: '차대리', department: '콘텐츠', totalTodos: 38, completedTodos: 24 }
  ]
};

// 할 일 목업 데이터
export const mockTodos: ClientTodo[] = [
  {
    id: '1',
    clientId: '1',
    clientName: '대한치킨',
    clientIcon: '🍗',
    content: '메뉴 사진 업데이트 요청하기',
    assignedTo: 'user1',
    completed: false,
    createdAt: '2023-11-15T10:30:00Z'
  },
  {
    id: '2',
    clientId: '2',
    clientName: '서울피자',
    clientIcon: '🍕',
    content: '할인 쿠폰 등록 및 활성화',
    assignedTo: 'user1',
    completed: true,
    createdAt: '2023-11-10T14:20:00Z',
    completedAt: '2023-11-12T09:15:00Z'
  },
  {
    id: '3',
    clientId: '3',
    clientName: '바다횟집',
    clientIcon: '🐟',
    content: '영업시간 수정 반영하기',
    assignedTo: 'user2',
    completed: false,
    createdAt: '2023-11-08T11:45:00Z'
  },
  {
    id: '4',
    clientId: '4',
    clientName: '행복떡볶이',
    clientIcon: '🧂',
    content: '민원 관련 전화 연락하기',
    assignedTo: 'user1',
    completed: false,
    createdAt: '2023-11-05T16:30:00Z'
  },
  {
    id: '5',
    clientId: '5',
    clientName: '도시락카페',
    clientIcon: '🍱',
    content: '계약 연장 상담 진행',
    assignedTo: 'user3',
    completed: true,
    createdAt: '2023-11-01T13:20:00Z',
    completedAt: '2023-11-03T10:45:00Z'
  },
  {
    id: '6',
    clientId: '6',
    clientName: '커피나무',
    clientIcon: '☕',
    content: '신메뉴 소식 등록하기',
    assignedTo: 'user1',
    completed: false,
    createdAt: '2023-11-12T09:50:00Z'
  },
  {
    id: '7',
    clientId: '7',
    clientName: '웰빙마트',
    clientIcon: '🛒',
    content: '민원 처리 결과 공유하기',
    assignedTo: 'user2',
    completed: true,
    createdAt: '2023-11-09T14:10:00Z',
    completedAt: '2023-11-10T17:30:00Z'
  }
]; 