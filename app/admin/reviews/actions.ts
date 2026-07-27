"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getReviews(statusFilter?: string) {
  const supabase = await createSupabaseServerClient();
  
  let query = supabase
    .from('reviews')
    .select(`
      id,
      rating,
      title,
      body,
      status,
      guest_name,
      created_at,
      products ( id, title ),
      profiles ( email, full_name )
    `)
    .order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query.limit(100);
  if (error) return [];
  return data;
}

export async function moderateReview(reviewId: string, action: 'approved' | 'rejected') {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('clerk_user_id', userId).single();

  const { error } = await supabase
    .from('reviews')
    .update({ status: action, moderated_by: profile?.id })
    .eq('id', reviewId);

  if (error) throw new Error(error.message);

  await supabase.from('activity_log').insert({
    actor_id: profile?.id,
    action: `review.${action === 'approved' ? 'approve' : 'reject'}`,
    entity_type: 'reviews',
    entity_id: reviewId,
  });

  revalidatePath("/admin/reviews");
}

export async function deleteReview(reviewId: string) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) throw new Error(error.message);

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('clerk_user_id', userId).single();
  await supabase.from('activity_log').insert({
    actor_id: profile?.id,
    action: 'review.delete',
    entity_type: 'reviews',
    entity_id: reviewId,
  });

  revalidatePath("/admin/reviews");
}
