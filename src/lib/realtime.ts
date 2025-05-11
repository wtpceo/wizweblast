import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * 할 일 실시간 업데이트를 위한 채널 설정
 * @param clientId 광고주 ID (특정 광고주 할 일만 실시간 동기화 시)
 * @returns 실시간 업데이트 채널 및 구독 해제 함수
 */
export function setupTodoRealtimeChannel(
  clientId?: string,
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void
) {
  // 채널 생성 - 모든 할 일 또는 특정 광고주의 할 일
  const channelName = clientId ? `todos:client=${clientId}` : 'todos';
  
  // Filter 설정 (필요한 경우)
  const filter = clientId 
    ? `client_id=eq.${clientId}` 
    : '*';
  
  // 채널 생성 및 설정
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'client_todos',
      filter
    }, (payload) => {
      console.log('실시간 할 일 추가:', payload);
      if (onInsert) onInsert(payload);
    })
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'client_todos',
      filter
    }, (payload) => {
      console.log('실시간 할 일 업데이트:', payload);
      if (onUpdate) onUpdate(payload);
    })
    .on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'client_todos',
      filter
    }, (payload) => {
      console.log('실시간 할 일 삭제:', payload);
      if (onDelete) onDelete(payload);
    });
  
  // 채널 구독 시작
  channel.subscribe((status, err) => {
    if (status === 'SUBSCRIBED') {
      console.log(`할 일 실시간 업데이트 구독 시작 (${channelName})`);
    }
    
    if (status === 'CLOSED') {
      console.log(`할 일 실시간 업데이트 구독 종료 (${channelName})`);
    }
    
    if (err) {
      console.error(`할 일 실시간 업데이트 오류 (${channelName}):`, err);
    }
  });
  
  // 구독 해제 함수 반환
  return {
    channel,
    unsubscribe: () => {
      supabase.removeChannel(channel);
    }
  };
}

/**
 * 여러 할 일 관련 컴포넌트에서 사용할 실시간 업데이트 기능 모음
 */
export const todoRealtime = {
  /**
   * 할 일 추가 시 호출될 함수
   * @param newTodo 새로 추가된 할 일
   */
  onTodoAdded: (newTodo: any) => {
    // 브로드캐스트 이벤트 발송
    const event = new CustomEvent('wiz:todo-added', { detail: newTodo });
    window.dispatchEvent(event);
  },
  
  /**
   * 할 일 업데이트 시 호출될 함수
   * @param updatedTodo 업데이트된 할 일
   */
  onTodoUpdated: (updatedTodo: any) => {
    // 브로드캐스트 이벤트 발송
    const event = new CustomEvent('wiz:todo-updated', { detail: updatedTodo });
    window.dispatchEvent(event);
  },
  
  /**
   * 할 일 삭제 시 호출될 함수
   * @param deletedTodo 삭제된 할 일
   */
  onTodoDeleted: (deletedTodo: any) => {
    // 브로드캐스트 이벤트 발송
    const event = new CustomEvent('wiz:todo-deleted', { detail: deletedTodo });
    window.dispatchEvent(event);
  },
  
  /**
   * 할 일 추가 이벤트 리스너 등록
   * @param callback 콜백 함수
   */
  onAddedListener: (callback: (e: CustomEvent) => void) => {
    window.addEventListener('wiz:todo-added', callback as EventListener);
    return () => window.removeEventListener('wiz:todo-added', callback as EventListener);
  },
  
  /**
   * 할 일 업데이트 이벤트 리스너 등록
   * @param callback 콜백 함수
   */
  onUpdatedListener: (callback: (e: CustomEvent) => void) => {
    window.addEventListener('wiz:todo-updated', callback as EventListener);
    return () => window.removeEventListener('wiz:todo-updated', callback as EventListener);
  },
  
  /**
   * 할 일 삭제 이벤트 리스너 등록
   * @param callback 콜백 함수
   */
  onDeletedListener: (callback: (e: CustomEvent) => void) => {
    window.addEventListener('wiz:todo-deleted', callback as EventListener);
    return () => window.removeEventListener('wiz:todo-deleted', callback as EventListener);
  }
}; 