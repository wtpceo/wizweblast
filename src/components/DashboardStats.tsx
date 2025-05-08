import type { DashboardStats as DashboardStatsType } from "@/lib/mock-data";

type DashboardStatsProps = {
  stats: DashboardStatsType;
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* 총 광고주 */}
      <div className="wiz-card hover-scale p-4 border-l-4 border-[#2251D1]">
        <div className="flex items-center">
          <div className="flex-shrink-0 rounded-md bg-[#EEF2FB] p-3">
            <span role="img" aria-label="총 광고주" className="text-2xl">👥</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">총 광고주</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold">{stats.totalClients}</p>
              <p className="text-xs text-[#2251D1] ml-2">개의 업체 관리중</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 종료 임박 */}
      <div className="wiz-card hover-scale p-4 border-l-4 border-[#FFC107]">
        <div className="flex items-center">
          <div className="flex-shrink-0 rounded-md bg-[#FFF8E1] p-3">
            <span role="img" aria-label="종료 임박" className="text-2xl">⏰</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">종료 임박</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold">{stats.nearExpiry}</p>
              <p className="text-xs text-[#FFC107] ml-2">곧 떠날지도..?</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 관리 소홀 */}
      <div className="wiz-card hover-scale p-4 border-l-4 border-[#FF9800]">
        <div className="flex items-center">
          <div className="flex-shrink-0 rounded-md bg-[#FFF3E0] p-3">
            <span role="img" aria-label="관리 소홀" className="text-2xl">⚠️</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">관리 소홀</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold">{stats.poorManaged}</p>
              <p className="text-xs text-[#FF9800] ml-2">관심이 필요해요!</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 민원 진행 */}
      <div className="wiz-card hover-scale p-4 border-l-4 border-[#F44336]">
        <div className="flex items-center">
          <div className="flex-shrink-0 rounded-md bg-[#FFEBEE] p-3">
            <span role="img" aria-label="민원 진행" className="text-2xl">🔔</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">민원 진행</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold">{stats.complaintsOngoing}</p>
              <p className="text-xs text-[#F44336] ml-2">SOS! 해결 급해요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 