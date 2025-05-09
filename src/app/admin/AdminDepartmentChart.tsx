'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type DepartmentSummary = {
  department: string;
  totalTodos: number;
  completedTodos: number;
};

type AdminDepartmentChartProps = {
  departmentData: DepartmentSummary[];
};

const departmentColors = {
  '디자인': '#F44336',
  '콘텐츠': '#4CAF50',
  '미디어': '#2196F3',
  '고객관리': '#FF9800',
  '관리자': '#9C27B0'
};

export function AdminDepartmentChart({ departmentData }: AdminDepartmentChartProps) {
  // 차트 데이터 가공
  const chartData = departmentData.map(dept => {
    const pendingTodos = dept.totalTodos - dept.completedTodos;
    const completionRate = Math.round((dept.completedTodos / dept.totalTodos) * 100);
    
    return {
      name: dept.department,
      완료: dept.completedTodos,
      미완료: pendingTodos,
      완료율: completionRate
    };
  });
  
  return (
    <div>
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {departmentData.map(dept => {
            const completionRate = Math.round((dept.completedTodos / dept.totalTodos) * 100);
            const departmentColor = departmentColors[dept.department as keyof typeof departmentColors] || '#666666';
            
            return (
              <div 
                key={dept.department}
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center mb-2">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: departmentColor }}
                  ></div>
                  <h3 className="font-medium text-sm">{dept.department}</h3>
                </div>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <div className="text-xs text-gray-500">
                  {dept.completedTodos}/{dept.totalTodos} 완료
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [value, name === '완료율' ? '완료율 (%)' : `${name} 할 일`]}
              labelFormatter={(name) => `${name} 부서`}
            />
            <Legend />
            <Bar dataKey="완료" stackId="a" fill="#4CAF50" name="완료한 할 일" />
            <Bar dataKey="미완료" stackId="a" fill="#F44336" name="미완료 할 일" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 