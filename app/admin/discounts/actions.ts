"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getDiscounts() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('discounts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function createDiscount(formData: FormData) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") return { success: false, error: "Unauthorized" };

  const supabase = await createSupabaseServerClient();

  const code = (formData.get("code") as string).toUpperCase().trim();
  const type = formData.get("type") as string;
  const value = parseFloat(formData.get("value") as string);
  const minOrderValue = parseFloat(formData.get("minOrderValue") as string) || 0;
  const usageLimit = formData.get("usageLimit") ? parseInt(formData.get("usageLimit") as string) : null;
  const startsAt = formData.get("startsAt") as string || null;
  const expiresAt = formData.get("expiresAt") as string || null;

  const { error } = await supabase.from('discounts').insert({
    code,
    type,
    value,
    min_order_value: minOrderValue,
    usage_limit: usageLimit,
    starts_at: startsAt || null,
    expires_at: expiresAt || null,
    is_active: true,
  });

  if (error) return { success: false, error: error.message };

  // Log activity
  const { data: profile } = await supabase
    .from('profiles').select('id').eq('clerk_user_id', userId).single();
  await supabase.from('activity_log').insert({
    actor_id: profile?.id,
    action: 'discount.create',
    entity_type: 'discounts',
    metadata: { code },
  });

  revalidatePath("/admin/discounts");
  return { success: true };
}

export async function toggleDiscountStatus(id: string, currentStatus: boolean) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('discounts')
    .update({ is_active: !currentStatus })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(id: string) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();

  const { data: discount } = await supabase.from('discounts').select('code').eq('id', id).single();

  const { error } = await supabase
    .from('discounts')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('clerk_user_id', userId).single();
  await supabase.from('activity_log').insert({
    actor_id: profile?.id,
    action: 'discount.delete',
    entity_type: 'discounts',
    metadata: { code: discount?.code },
  });

  revalidatePath("/admin/discounts");
}
