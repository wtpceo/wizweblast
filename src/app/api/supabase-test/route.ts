import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// Supabase 테스트 API
export async function GET(request: Request) {
  try {
    // 테이블 존재 여부 확인
    const { data: tablesData, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (tablesError) {
      return NextResponse.json({ 
        error: '테이블 목록 조회에 실패했습니다.', 
        details: tablesError 
      }, { status: 500 });
    }
    
    const tables = tablesData.map(t => t.tablename);
    
    // 각 테이블의 레코드 수 확인
    const tablesInfo = [];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        tablesInfo.push({
          table,
          recordCount: error ? 'Error' : count,
          error: error ? error.message : null
        });
      } catch (err) {
        tablesInfo.push({
          table,
          recordCount: 'Error',
          error: err instanceof Error ? err.message : '알 수 없는 오류'
        });
      }
    }
    
    // RLS 정책 확인
    const { data: policiesData, error: policiesError } = await supabase
      .rpc('list_policies');
    
    // Supabase 클라이언트 인증 상태 확인
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    return NextResponse.json({
      status: 'success',
      database: {
        tables: tablesInfo,
        policies: policiesError ? { error: policiesError.message } : policiesData
      },
      auth: {
        session: authError ? { error: authError.message } : authData
      }
    });
  } catch (error) {
    console.error('Supabase 테스트 API 오류:', error);
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.', 
      details: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
}

// Supabase 테이블 생성 테스트
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'create_test_client':
        // 테스트 광고주 생성
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: '테스트 광고주',
            contract_start: new Date().toISOString().split('T')[0],
            contract_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status_tags: ['테스트', '신규']
          })
          .select();
        
        if (clientError) {
          return NextResponse.json({ 
            error: '테스트 광고주 생성에 실패했습니다.', 
            details: clientError 
          }, { status: 500 });
        }
        
        return NextResponse.json({ 
          success: true, 
          message: '테스트 광고주가 생성되었습니다.', 
          client: clientData[0] 
        });
      
      case 'create_test_notice':
        // 테스트 공지사항 생성
        const { data: noticeData, error: noticeError } = await supabase
          .from('notices')
          .insert({
            title: '테스트 공지사항',
            content: '이것은 테스트 공지사항입니다.',
            is_fixed: false
          })
          .select();
        
        if (noticeError) {
          return NextResponse.json({ 
            error: '테스트 공지사항 생성에 실패했습니다.', 
            details: noticeError 
          }, { status: 500 });
        }
        
        return NextResponse.json({ 
          success: true, 
          message: '테스트 공지사항이 생성되었습니다.', 
          notice: noticeData[0] 
        });

      case 'run_schema_sql':
        try {
          const schemaPath = path.join(process.cwd(), 'src/app/api/supabase-test/schema.sql');
          const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
          
          // FIXME: 실제 프로덕션에서는 보안상 이런 방식으로 구현하면 안됩니다.
          // 단지 테스트용으로만 사용하세요.
          const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', {
            sql_string: schemaSQL
          });
          
          if (sqlError) {
            return NextResponse.json({ 
              success: false, 
              message: 'SQL 스크립트 실행 실패', 
              error: sqlError 
            });
          }
          
          return NextResponse.json({ 
            success: true, 
            message: 'SQL 스크립트가 성공적으로 실행되었습니다.' 
          });
        } catch (err) {
          return NextResponse.json({ 
            success: false, 
            message: 'SQL 스크립트 실행 중 오류 발생', 
            error: err instanceof Error ? err.message : err 
          });
        }
      
      default:
        return NextResponse.json({ 
          error: '알 수 없는 액션입니다.' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Supabase 테스트 API 오류:', error);
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.', 
      details: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
}