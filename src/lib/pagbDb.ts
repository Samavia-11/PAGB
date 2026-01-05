import { query } from '@/lib/db';

export async function pagbQuery<T = any>(sql: string, params?: any[]): Promise<T> {
  return (await query(sql, params)) as T;
}
