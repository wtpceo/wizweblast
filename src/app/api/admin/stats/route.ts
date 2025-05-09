import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 관리자 통계 API
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    // 쿼리 파라미터 추출
    const period = url.searchParams.get('period') || 'month'; // month, quarter, year 
    const department = url.searchParams.get('department'); // 특정 부서 필터링
    
    // 기간에 따른 날짜 범위 설정
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // 기본값: 1개월
    }
    
    // 기본 쿼리 구성
    let query = supabase
      .from('client_activities')
      .select(`
        id,
        client_id,
        user_id,
        activity_type,
        department,
        created_at,
        clients(name)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', now.toISOString());
    
    // 부서 필터 적용
    if (department) {
      query = query.eq('department', department);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('관리자 통계 조회 오류:', error);
      return NextResponse.json({ error: '통계 데이터 조회에 실패했습니다.' }, { status: 500 });
    }
    
    // 부서별 통계
    const departmentStats: Record<string, number> = {};
    // 유저별 통계
    interface UserStat {
      userId: string;
      totalActivities: number;
      clientsServed: Set<string>;
      activityTypes: Record<string, number>;
    }
    const userStats: Record<string, UserStat> = {};
    // 활동 유형별 통계
    const activityTypeStats: Record<string, number> = {
      'client_created': 0,
      'client_updated': 0,
      'client_deleted': 0,
      'todo_added': 0,
      'note_added': 0
    };
    
    // 데이터 집계
    data.forEach(activity => {
      const dept = activity.department as string;
      const userId = activity.user_id as string;
      const clientId = activity.client_id as string;
      const activityType = activity.activity_type as string;
      
      // 부서별 통계
      if (!departmentStats[dept]) {
        departmentStats[dept] = 0;
      }
      departmentStats[dept]++;
      
      // 유저별 통계
      if (!userStats[userId]) {
        userStats[userId] = {
          userId,
          totalActivities: 0,
          clientsServed: new Set<string>(),
          activityTypes: {}
        };
      }
      userStats[userId].totalActivities++;
      userStats[userId].clientsServed.add(clientId);
      
      if (!userStats[userId].activityTypes[activityType]) {
        userStats[userId].activityTypes[activityType] = 0;
      }
      userStats[userId].activityTypes[activityType]++;
      
      // 활동 유형별 통계
      if (activityTypeStats[activityType] !== undefined) {
        activityTypeStats[activityType]++;
      }
    });
    
    // 유저 통계 후처리 (Set → Array)
    const formattedUserStats = Object.values(userStats).map(user => ({
      ...user,
      clientsServed: Array.from(user.clientsServed).length
    }));
    
    // 부서별 통계를 차트 데이터 형식으로 변환
    const departmentChartData = Object.entries(departmentStats).map(([department, count]) => ({
      department,
      count
    }));
    
    // 활동 유형별 차트 데이터
    const activityTypeChartData = Object.entries(activityTypeStats).map(([type, count]) => ({
      type,
      count
    }));
    
    // 응답 데이터 구성
    const stats = {
      totalActivities: data.length,
      departmentStats: departmentChartData,
      userStats: formattedUserStats,
      activityTypeStats: activityTypeChartData,
      periodCovered: {
        start: startDate.toISOString(),
        end: now.toISOString(),
        periodType: period
      }
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('관리자 통계 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
} 