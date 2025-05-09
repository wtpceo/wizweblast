'use client';

import React from 'react';

type AdminFilterControlsProps = {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
};

export function AdminFilterControls({
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  sortOrder,
  setSortOrder
}: AdminFilterControlsProps) {
  const departments = [
    { id: 'all', name: '전체 부서' },
    { id: '디자인', name: '디자인' },
    { id: '콘텐츠', name: '콘텐츠' },
    { id: '미디어', name: '미디어' },
    { id: '고객관리', name: '고객관리' },
    { id: '관리자', name: '관리자' }
  ];
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(e.target.value);
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value as 'asc' | 'desc');
  };
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-gray-700">🔍 검색 및 필터</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            유저 이름 검색
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#2251D1] focus:border-transparent"
              placeholder="유저 이름으로 검색..."
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
            부서 선택
          </label>
          <select
            id="department"
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#2251D1] focus:border-transparent"
          >
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            정렬 방식
          </label>
          <select
            id="sort"
            value={sortOrder}
            onChange={handleSortChange}
            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#2251D1] focus:border-transparent"
          >
            <option value="desc">할 일 많은 순</option>
            <option value="asc">할 일 적은 순</option>
          </select>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2251D1] hover:bg-[#1A41B6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2251D1]"
        >
          필터 적용
        </button>
      </div>
    </div>
  );
} 