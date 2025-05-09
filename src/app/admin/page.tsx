'use client';

import { useState } from 'react';
import { AdminDepartmentChart } from './AdminDepartmentChart';
import { AdminUserStats } from './AdminUserStats';
import { AdminFilterControls } from './AdminFilterControls';
import { mockAdminStats } from '@/lib/mock-data';

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // 부서별 데이터 필터링
  const filteredDepartmentData = selectedDepartment === 'all'
    ? mockAdminStats.departmentSummary
    : mockAdminStats.departmentSummary.filter(dept => dept.department === selectedDepartment);
  
  // 필터링된 유저 데이터 준비
  const filteredUserData = mockAdminStats.userSummary.filter(user => {
    // 이름 검색 필터
    const nameMatch = searchTerm 
      ? user.name.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
      
    // 부서 필터
    const departmentMatch = selectedDepartment === 'all' 
      ? true 
      : user.department === selectedDepartment;
      
    return nameMatch && departmentMatch;
  }).sort((a, b) => {
    // 할 일 수 기준 정렬
    if (sortOrder === 'asc') {
      return a.totalTodos - b.totalTodos;
    } else {
      return b.totalTodos - a.totalTodos;
    }
  });
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">👨‍💼 관리자 통계 대시보드</h1>
      
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <AdminFilterControls 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">📊 부서별 통계</h2>
          <AdminDepartmentChart departmentData={filteredDepartmentData} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">👥 유저별 통계</h2>
          <AdminUserStats userData={filteredUserData} />
        </div>
      </div>
    </div>
  );
} 