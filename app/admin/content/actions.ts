"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getBanners() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}

export async function saveBanner(formData: FormData) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") return { success: false, error: "Unauthorized" };

  const supabase = await createSupabaseServerClient();

  const bannerId = formData.get("bannerId") as string;
  const placement = formData.get("placement") as string;
  const headline = formData.get("headline") as string || null;
  const subtext = formData.get("subtext") as string || null;
  const ctaLabel = formData.get("ctaLabel") as string || null;
  const ctaUrl = formData.get("ctaUrl") as string || null;
  const isLive = formData.get("isLive") === "true";
  const startsAt = formData.get("startsAt") as string || null;
  const endsAt = formData.get("endsAt") as string || null;

  const bannerData = {
    placement,
    headline,
    subtext,
    cta_label: ctaLabel,
    cta_url: ctaUrl,
    is_live: isLive,
    starts_at: startsAt || null,
    ends_at: endsAt || null,
    updated_at: new Date().toISOString(),
  };

  if (bannerId && bannerId !== "new") {
    const { error } = await supabase.from('banners').update(bannerData).eq('id', bannerId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from('banners').insert(bannerData);
    if (error) return { success: false, error: error.message };
  }

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('clerk_user_id', userId).single();
  await supabase.from('activity_log').insert({
    actor_id: profile?.id,
    action: 'banner.update',
    entity_type: 'banners',
    metadata: { placement, headline },
  });

  revalidatePath("/admin/content");
  return { success: true };
}

export async function toggleBannerLive(id: string, currentStatus: boolean) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('banners')
    .update({ is_live: !currentStatus, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/content");
}

export async function deleteBanner(id: string) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/content");
}
