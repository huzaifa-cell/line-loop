"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getShippingZones() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('shipping_zones')
    .select('*')
    .order('name');
  if (error) return [];
  return data;
}

export async function getTaxSettings() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('tax_settings')
    .select('*')
    .order('region');
  if (error) return [];
  return data;
}

export async function saveShippingZone(formData: FormData) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") return { success: false, error: "Unauthorized" };

  const supabase = await createSupabaseServerClient();
  
  const zoneId = formData.get("zoneId") as string;
  const name = formData.get("name") as string;
  const countriesRaw = formData.get("countries") as string;
  const countries = countriesRaw.split(',').map(c => c.trim()).filter(Boolean);
  const flatRate = parseFloat(formData.get("flatRate") as string);
  const freeThresholdRaw = formData.get("freeShippingThreshold") as string;
  const freeShippingThreshold = freeThresholdRaw && !isNaN(parseFloat(freeThresholdRaw)) ? parseFloat(freeThresholdRaw) : null;
  const isActive = formData.get("isActive") === "true";

  const zoneData = { name, countries, flat_rate: flatRate, free_shipping_threshold: freeShippingThreshold, is_active: isActive };

  if (zoneId && zoneId !== "new") {
    const { error } = await supabase.from('shipping_zones').update(zoneData).eq('id', zoneId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from('shipping_zones').insert(zoneData);
    if (error) return { success: false, error: error.message };
  }

  const { data: profile } = await supabase.from('profiles').select('id').eq('clerk_user_id', userId).single();
  await supabase.from('activity_log').insert({
    actor_id: profile?.id, action: 'settings.update', entity_type: 'shipping_zones', metadata: { name },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deleteShippingZone(id: string) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('shipping_zones').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}

export async function saveTaxSetting(formData: FormData) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") return { success: false, error: "Unauthorized" };

  const supabase = await createSupabaseServerClient();
  
  const taxId = formData.get("taxId") as string;
  const region = formData.get("region") as string;
  const ratePercent = parseFloat(formData.get("ratePercent") as string);
  const isActive = formData.get("isActive") === "true";

  const taxData = { region, rate_percent: ratePercent, is_active: isActive };

  if (taxId && taxId !== "new") {
    const { error } = await supabase.from('tax_settings').update(taxData).eq('id', taxId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from('tax_settings').insert(taxData);
    if (error) return { success: false, error: error.message };
  }

  const { data: profile } = await supabase.from('profiles').select('id').eq('clerk_user_id', userId).single();
  await supabase.from('activity_log').insert({
    actor_id: profile?.id, action: 'settings.update', entity_type: 'tax_settings', metadata: { region },
  });

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function deleteTaxSetting(id: string) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('tax_settings').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}
