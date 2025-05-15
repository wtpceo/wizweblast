import type { DashboardStats as DashboardStatsType } from "@/lib/mock-data";

type DashboardStatsProps = {
  stats: DashboardStatsType;
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* 총 광고주 */}
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#151523] transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-500/50">
        <div className="absolute inset-0 bg-gradient-to-br opacity-20"></div>
        <div className="absolute bottom-0 right-0 h-32 w-32 translate-x-8 translate-y-8 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 blur-xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
        <div className="p-4 relative flex items-center">
          <div className="flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 group-hover:scale-110 transition-transform duration-300">
            <span role="img" aria-label="총 광고주" className="text-2xl">👥</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-slate-300 transition-colors duration-300">총 광고주</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{stats.totalClients}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 ml-2 group-hover:translate-x-1 transition-transform duration-300">개의 업체 관리중</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 종료 임박 */}
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#151523] transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/20 hover:border-amber-500/50">
        <div className="absolute inset-0 bg-gradient-to-br opacity-20"></div>
        <div className="absolute bottom-0 right-0 h-32 w-32 translate-x-8 translate-y-8 rounded-full bg-gradient-to-br from-amber-600/20 to-yellow-600/20 blur-xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
        <div className="p-4 relative flex items-center">
          <div className="flex-shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/30 p-3 group-hover:scale-110 transition-transform duration-300">
            <span role="img" aria-label="종료 임박" className="text-2xl">⏰</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-slate-300 transition-colors duration-300">종료 임박</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-200 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors duration-300">{stats.nearExpiry}</p>
              <p className="text-xs text-amber-500 dark:text-amber-400 ml-2 group-hover:translate-x-1 transition-transform duration-300">곧 떠날지도..?</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 관리 소홀 */}
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#151523] transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/20 hover:border-orange-500/50">
        <div className="absolute inset-0 bg-gradient-to-br opacity-20"></div>
        <div className="absolute bottom-0 right-0 h-32 w-32 translate-x-8 translate-y-8 rounded-full bg-gradient-to-br from-orange-600/20 to-red-600/20 blur-xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
        <div className="p-4 relative flex items-center">
          <div className="flex-shrink-0 rounded-full bg-orange-100 dark:bg-orange-900/30 p-3 group-hover:scale-110 transition-transform duration-300">
            <span role="img" aria-label="관리 소홀" className="text-2xl">⚠️</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-slate-300 transition-colors duration-300">관리 소홀</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-200 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300">{stats.poorManaged}</p>
              <p className="text-xs text-orange-500 dark:text-orange-400 ml-2 group-hover:translate-x-1 transition-transform duration-300">관심이 필요해요!</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 민원 진행 */}
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#151523] transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20 hover:border-red-500/50">
        <div className="absolute inset-0 bg-gradient-to-br opacity-20"></div>
        <div className="absolute bottom-0 right-0 h-32 w-32 translate-x-8 translate-y-8 rounded-full bg-gradient-to-br from-red-600/20 to-pink-600/20 blur-xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"></div>
        <div className="p-4 relative flex items-center">
          <div className="flex-shrink-0 rounded-full bg-red-100 dark:bg-red-900/30 p-3 group-hover:scale-110 transition-transform duration-300">
            <span role="img" aria-label="민원 진행" className="text-2xl">🔔</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-slate-300 transition-colors duration-300">민원 진행</p>
            <div className="flex items-baseline">
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-200 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300">{stats.complaintsOngoing}</p>
              <p className="text-xs text-red-500 dark:text-red-400 ml-2 group-hover:translate-x-1 transition-transform duration-300">SOS! 해결 급해요</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 