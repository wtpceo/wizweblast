import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

// 클라이언트 컴포넌트에서 사용할 supabase 클라이언트
export const createClient = () => createClientComponentClient<Database>(); 