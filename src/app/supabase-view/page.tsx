'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import Link from 'next/link';
import { Header } from '@/components/Header';

interface ConnectionStatus {
  status: 'connected' | 'error' | 'checking';
  message?: string;
  timestamp?: string;
  serverTime?: string;
  tables?: {
    table: string;
    count: number;
    status: 'ok' | 'error';
    error: string | null;
  }[];
  environment?: string;
  supabaseUrl?: string;
}

export default function SupabaseViewPage() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 데이터 수정 관련 상태
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editData, setEditData] = useState<any>({});
  const [editRowIndex, setEditRowIndex] = useState<number | null>(null);
  
  // 데이터 추가 관련 상태
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newData, setNewData] = useState<any>({});
  
  // 연결 상태 관련
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'checking'
  });
  const [showConnectionDetails, setShowConnectionDetails] = useState<boolean>(false);

  // Supabase 클라이언트 인스턴스 생성
  const supabase = createBrowserClient();

  // 연결 상태 확인
  useEffect(() => {
    async function checkConnectionStatus() {
      try {
        const response = await fetch('/api/supabase/status');
        const data = await response.json();
        
        setConnectionStatus({
          status: data.status === 'error' ? 'error' : 'connected',
          message: data.message,
          timestamp: data.timestamp,
          serverTime: data.serverTime,
          tables: data.tables,
          environment: data.environment,
          supabaseUrl: data.supabaseUrl
        });
      } catch (err) {
        console.error('Supabase 연결 상태 확인 오류:', err);
        setConnectionStatus({
          status: 'error',
          message: '연결 상태를 확인하는 중 오류가 발생했습니다.'
        });
      }
    }

    checkConnectionStatus();
  }, []);

  // 테이블 목록 가져오기
  useEffect(() => {
    async function fetchTables() {
      try {
        setLoading(true);
        
        // Supabase에서 사용 가능한 테이블 목록 가져오기
        const availableTables = [
          'clients',
          'client_todos',
          'client_notes',
          'client_activities',
          'client_external_data',
          'notices',
          'users'
        ];
        
        setTables(availableTables);
        
        // 기본 선택 테이블 설정
        if (availableTables.length > 0 && !selectedTable) {
          setSelectedTable(availableTables[0]);
        }
      } catch (err) {
        console.error('테이블 목록 가져오기 오류:', err);
        setError('테이블 목록을 가져오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchTables();
  }, []);

  // 선택된 테이블의 데이터 가져오기
  useEffect(() => {
    async function fetchTableData() {
      if (!selectedTable) return;
      
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        console.log(`[Supabase View] ${selectedTable} 테이블 데이터 로드 시작`);
        
        // API 경로를 통해 데이터 가져오기 (대체 방법)
        try {
          console.log(`[Supabase View] API 경로를 통해 데이터 요청: /api/supabase/${selectedTable}`);
          const response = await fetch(`/api/supabase/${selectedTable}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Supabase View] API 응답 오류 (${response.status}):`, errorText);
            try {
              const errorData = JSON.parse(errorText);
              throw new Error(errorData.error || `API 오류: ${response.status}`);
            } catch (parseError) {
              throw new Error(`API 오류 (${response.status}): ${errorText.substring(0, 100)}...`);
            }
          }
          
          const data = await response.json();
          console.log(`[Supabase View] API 경로 응답:`, { count: data?.length || 0 });
          
          setTableData(data || []);
          console.log(`[Supabase View] ${selectedTable} 테이블 데이터 로드 완료:`, data?.length || 0);
          return;
        } catch (apiError: any) {
          console.error(`[Supabase View] API 경로 호출 오류:`, apiError);
          // 첫 번째 방법이 실패하면 두 번째 방법 시도
        }
        
        // 첫 번째 방법이 실패한 경우 Supabase 클라이언트를 직접 사용하여 시도
        try {
          console.log(`[Supabase View] Supabase 직접 호출 시도`);
          const { data, error } = await supabase
            .from(selectedTable)
            .select('*')
            .limit(100);
          
          console.log(`[Supabase View] Supabase 직접 호출 응답:`, { data: data?.length || 0, error });
          
          if (error) {
            throw error;
          }
          
          setTableData(data || []);
          console.log(`[Supabase View] ${selectedTable} 테이블 데이터 로드 완료:`, data?.length || 0);
        } catch (supabaseError: any) {
          console.error(`[Supabase View] Supabase 직접 호출 실패:`, supabaseError);
          throw new Error(`Supabase 직접 호출 오류: ${supabaseError.message || supabaseError}`);
        }
      } catch (err: any) {
        console.error(`[Supabase View] ${selectedTable} 테이블 데이터 가져오기 오류:`, err);
        setError(`${selectedTable} 테이블 데이터를 가져오는 중 오류가 발생했습니다: ${err.message}`);
        // 오류 발생해도 빈 배열로 설정하여 로딩 상태 종료
        setTableData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTableData();
  }, [selectedTable, supabase]);

  // 테이블 변경 핸들러
  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
    setIsEditing(false);
    setIsAdding(false);
    setEditRowIndex(null);
    setEditData({});
    setNewData({});
  };

  // 데이터 새로고침 핸들러
  const handleRefresh = () => {
    if (selectedTable) {
      // 현재 선택된 테이블 데이터를 다시 가져옴
      const currentTable = selectedTable;
      setSelectedTable('');
      setTimeout(() => {
        setSelectedTable(currentTable);
      }, 100);
    }
  };
  
  // 연결 상태 새로고침 핸들러
  const handleRefreshConnection = async () => {
    setConnectionStatus({
      status: 'checking'
    });
    
    try {
      const response = await fetch('/api/supabase/status');
      const data = await response.json();
      
      setConnectionStatus({
        status: data.status === 'error' ? 'error' : 'connected',
        message: data.message,
        timestamp: data.timestamp,
        serverTime: data.serverTime,
        tables: data.tables,
        environment: data.environment,
        supabaseUrl: data.supabaseUrl
      });
    } catch (err) {
      console.error('Supabase 연결 상태 확인 오류:', err);
      setConnectionStatus({
        status: 'error',
        message: '연결 상태를 확인하는 중 오류가 발생했습니다.'
      });
    }
  };

  // 편집 시작 핸들러
  const handleEditClick = (row: any, index: number) => {
    setIsEditing(true);
    setEditRowIndex(index);
    setEditData({ ...row });
  };

  // 편집 취소 핸들러
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditRowIndex(null);
    setEditData({});
  };

  // 편집 데이터 변경 핸들러
  const handleEditDataChange = (key: string, value: any) => {
    setEditData((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  // 편집 저장 핸들러
  const handleSaveEdit = async () => {
    if (!editData.id) {
      setError('ID가 필요합니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/supabase/${selectedTable}?id=${editData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '데이터 업데이트에 실패했습니다.');
      }
      
      // 테이블 데이터 업데이트
      setTableData((prevData) => 
        prevData.map((row, idx) => 
          idx === editRowIndex ? editData : row
        )
      );
      
      setSuccess('데이터가 성공적으로 업데이트되었습니다.');
      setIsEditing(false);
      setEditRowIndex(null);
      setEditData({});
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('데이터 업데이트 오류:', err);
      setError(`데이터 업데이트 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 데이터 삭제 핸들러
  const handleDeleteClick = async (id: string) => {
    if (!confirm('정말 이 데이터를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/supabase/${selectedTable}?id=${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '데이터 삭제에 실패했습니다.');
      }
      
      // 테이블 데이터에서 삭제된 행 제거
      setTableData((prevData) => 
        prevData.filter((row) => row.id !== id)
      );
      
      setSuccess('데이터가 성공적으로 삭제되었습니다.');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('데이터 삭제 오류:', err);
      setError(`데이터 삭제 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 데이터 추가 시작 핸들러
  const handleAddClick = () => {
    setIsAdding(true);
    
    // 테이블에 있는 열 구조대로 빈 데이터 생성
    if (tableData.length > 0) {
      const emptyRow = Object.keys(tableData[0]).reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {} as any);
      setNewData(emptyRow);
    } else {
      setNewData({});
    }
  };

  // 데이터 추가 취소 핸들러
  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewData({});
  };

  // 새 데이터 변경 핸들러
  const handleNewDataChange = (key: string, value: any) => {
    setNewData((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  // 데이터 추가 저장 핸들러
  const handleSaveAdd = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/supabase/${selectedTable}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '데이터 추가에 실패했습니다.');
      }
      
      // 테이블 데이터에 새 행 추가
      if (result.data && result.data.length > 0) {
        setTableData((prevData) => [...prevData, ...result.data]);
      }
      
      setSuccess('데이터가 성공적으로 추가되었습니다.');
      setIsAdding(false);
      setNewData({});
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('데이터 추가 오류:', err);
      setError(`데이터 추가 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 객체를 문자열로 포맷팅하는 함수
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch (e) {
        return String(value);
      }
    }
    
    return String(value);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFD]">
      <Header
        title="Supabase 데이터 뷰어"
        description="Supabase 데이터베이스의 모든 테이블과 데이터를 확인할 수 있습니다."
        icon="📊"
        actions={
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center transition-all"
              disabled={loading}
            >
              {loading ? '로딩중...' : '새로고침'}
            </button>
            <Link
              href="/clients"
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center transition-all"
            >
              광고주 목록으로
            </Link>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-6">
        {/* Supabase 연결 상태 */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                connectionStatus.status === 'connected' ? 'bg-green-500' :
                connectionStatus.status === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
              }`}></div>
              <h3 className="text-lg font-medium">
                Supabase 연결 상태: {
                  connectionStatus.status === 'connected' ? '연결됨' :
                  connectionStatus.status === 'error' ? '오류' : '확인 중...'
                }
              </h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowConnectionDetails(!showConnectionDetails)}
                className="text-blue-500 hover:text-blue-700"
              >
                {showConnectionDetails ? '상세 정보 숨기기' : '상세 정보 보기'}
              </button>
              <button
                onClick={handleRefreshConnection}
                className="text-gray-500 hover:text-gray-700"
                disabled={connectionStatus.status === 'checking'}
              >
                🔄
              </button>
            </div>
          </div>
          
          {/* 연결 상태 새로고침 핸들러 */}
          {showConnectionDetails && (
            <div className="mt-4 border-t pt-4">
              {connectionStatus.status === 'checking' ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                  <span>연결 상태를 확인하는 중...</span>
                </div>
              ) : connectionStatus.status === 'error' ? (
                <div className="text-red-500">
                  <p><strong>오류:</strong> {connectionStatus.message}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p><strong>환경:</strong> {connectionStatus.environment}</p>
                    <p><strong>Supabase URL:</strong> {connectionStatus.supabaseUrl}</p>
                    <p><strong>서버 시간:</strong> {connectionStatus.timestamp || connectionStatus.serverTime}</p>
                  </div>
                  
                  {connectionStatus.tables && connectionStatus.tables.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">테이블 상태:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {connectionStatus.tables.map(table => (
                          <div 
                            key={table.table}
                            className={`p-2 rounded border ${
                              table.status === 'ok' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{table.table}</span>
                              <span className={table.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
                                {table.status === 'ok' ? 
                                  `${table.count}행` : 
                                  '오류'
                                }
                              </span>
                            </div>
                            {table.status === 'error' && table.error && (
                              <p className="text-xs text-red-500 mt-1">{table.error}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 테이블 선택 탭 */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-2 overflow-x-auto">
          <div className="flex space-x-1">
            {tables.map(table => (
              <button
                key={table}
                onClick={() => handleTableChange(table)}
                className={`px-4 py-2 rounded-md transition-all ${
                  selectedTable === table
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {table}
              </button>
            ))}
          </div>
        </div>

        {/* 성공 메시지 */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p>{success}</p>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* 데이터 추가 버튼 */}
        {!isAdding && !isEditing && selectedTable && (
          <div className="mb-6">
            <button
              onClick={handleAddClick}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-all"
              disabled={loading}
            >
              + 새 데이터 추가
            </button>
          </div>
        )}

        {/* 데이터 추가 폼 */}
        {isAdding && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">새 데이터 추가</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(newData).map(key => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {key}
                  </label>
                  <input
                    type="text"
                    value={newData[key] || ''}
                    onChange={(e) => handleNewDataChange(key, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleCancelAdd}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              >
                취소
              </button>
              <button
                onClick={handleSaveAdd}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && !isAdding && !isEditing && (
          <div className="flex justify-center my-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* 테이블 데이터 */}
        {!loading && tableData.length > 0 && !isAdding && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold">{selectedTable} 테이블</h2>
              <p className="text-sm text-gray-500">{tableData.length}개의 행</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(tableData[0]).map(key => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {isEditing && editRowIndex === rowIndex ? (
                        // 편집 모드
                        <>
                          {Object.keys(row).map((key) => (
                            <td key={key} className="px-6 py-4">
                              <input
                                type="text"
                                value={editData[key] || ''}
                                onChange={(e) => handleEditDataChange(key, e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                              />
                            </td>
                          ))}
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
                                disabled={loading}
                              >
                                저장
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded text-sm"
                              >
                                취소
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // 보기 모드
                        <>
                          {Object.values(row).map((value, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                            >
                              <div className="max-w-xs overflow-hidden text-ellipsis">
                                {formatValue(value)}
                              </div>
                            </td>
                          ))}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditClick(row, rowIndex)}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                                disabled={isEditing}
                              >
                                편집
                              </button>
                              <button
                                onClick={() => handleDeleteClick(row.id)}
                                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                                disabled={isEditing}
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 데이터 없음 */}
        {!loading && selectedTable && tableData.length === 0 && !isAdding && !error && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl mb-2">🔍</p>
            <h3 className="text-lg font-medium text-gray-900">데이터가 없습니다</h3>
            <p className="mt-2 text-gray-500">
              선택한 '{selectedTable}' 테이블에 데이터가 없습니다.
            </p>
            <button
              onClick={handleAddClick}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-all"
            >
              + 새 데이터 추가
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 