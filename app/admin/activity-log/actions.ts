"use server";

import { createSupabaseServerClient } from "@/lib/supabase";

export async function getActivityLogs(page = 1, filter?: string) {
  const supabase = await createSupabaseServerClient();
  const limit = 50;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('activity_log')
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      metadata,
      created_at,
      profiles ( full_name, email )
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filter && filter !== 'all') {
    query = query.like('action', `${filter}%`);
  }

  const { data, count, error } = await query.range(offset, offset + limit - 1);

  if (error) return { logs: [], totalPages: 0 };
  
  return {
    logs: data,
    totalPages: count ? Math.ceil(count / limit) : 0,
  };
}
