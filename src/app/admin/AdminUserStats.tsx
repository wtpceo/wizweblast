'use client';

type UserSummary = {
  userId: string;
  name: string;
  department: string;
  totalTodos: number;
  completedTodos: number;
};

type AdminUserStatsProps = {
  userData: UserSummary[];
};

const departmentColors = {
  '디자인': '#F44336',
  '콘텐츠': '#4CAF50',
  '미디어': '#2196F3',
  '고객관리': '#FF9800',
  '관리자': '#9C27B0'
};

export function AdminUserStats({ userData }: AdminUserStatsProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              유저
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              부서
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              할 일 등록
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              완료
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              진행률
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {userData.length > 0 ? (
            userData.map(user => {
              const completionRate = Math.round((user.completedTodos / user.totalTodos) * 100);
              const departmentColor = departmentColors[user.department as keyof typeof departmentColors] || '#666666';
              
              return (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#EEF2FB] flex items-center justify-center text-[#2251D1] font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: `${departmentColor}20`,
                        color: departmentColor
                      }}
                    >
                      {user.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.totalTodos}개
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.completedTodos}개
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative w-32 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="absolute left-0 top-0 h-2 rounded-full" 
                          style={{ 
                            width: `${completionRate}%`,
                            backgroundColor: completionRate > 75 ? '#4CAF50' : completionRate > 50 ? '#FFC107' : '#F44336'
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{completionRate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                검색 결과가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 