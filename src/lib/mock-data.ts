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
};

// 할일 데이터 타입
export type ClientTodo = {
  id: string;
  clientId: string;
  content: string;
  assignedTo: string;
  createdAt: string;
};

// 메모 데이터 타입
export type ClientNote = {
  id: string;
  clientId: string;
  note: string;
  createdAt: string;
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
    statusTags: []
  },
  {
    id: '2',
    name: '서울피자',
    icon: '🍕',
    contractStart: '2023-10-15T00:00:00Z',
    contractEnd: '2024-01-15T23:59:59Z',
    statusTags: ['종료 임박']
  },
  {
    id: '3',
    name: '바다횟집',
    icon: '🐟',
    contractStart: '2023-08-20T00:00:00Z',
    contractEnd: '2024-08-20T23:59:59Z',
    statusTags: ['관리 소홀']
  },
  {
    id: '4',
    name: '행복떡볶이',
    icon: '🧂',
    contractStart: '2023-11-01T00:00:00Z',
    contractEnd: '2024-11-01T23:59:59Z',
    statusTags: ['민원 중']
  },
  {
    id: '5',
    name: '도시락카페',
    icon: '🍱',
    contractStart: '2023-07-15T00:00:00Z',
    contractEnd: '2024-01-15T23:59:59Z',
    statusTags: ['종료 임박', '관리 소홀']
  },
  {
    id: '6',
    name: '커피나무',
    icon: '☕',
    contractStart: '2023-05-10T00:00:00Z',
    contractEnd: '2024-05-10T23:59:59Z',
    statusTags: []
  },
  {
    id: '7',
    name: '웰빙마트',
    icon: '🛒',
    contractStart: '2023-06-01T00:00:00Z',
    contractEnd: '2024-06-01T23:59:59Z',
    statusTags: ['관리 소홀', '민원 중']
  },
  {
    id: '8',
    name: '달콤베이커리',
    icon: '🍰',
    contractStart: '2023-10-01T00:00:00Z',
    contractEnd: '2024-03-31T23:59:59Z',
    statusTags: ['종료 임박']
  }
]; 