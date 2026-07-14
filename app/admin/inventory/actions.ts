"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getInventoryItems() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('product_variants')
    .select(`
      id,
      sku,
      color,
      size,
      stock_quantity,
      low_stock_threshold,
      products!inner (
        title,
        is_published
      )
    `)
    .order('stock_quantity', { ascending: true });

  if (error) {
    return [];
  }
  
  return data;
}

export async function adjustInventory(variantId: string, changeAmount: number, reason: string) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();
  
  // 1. Get current stock
  const { data: variant, error: varError } = await supabase
    .from('product_variants')
    .select('stock_quantity')
    .eq('id', variantId)
    .single();
    
  if (varError || !variant) throw new Error("Variant not found");
  
  const newStock = Math.max(0, variant.stock_quantity + changeAmount);
  
  // 2. Update stock
  const { error: updateError } = await supabase
    .from('product_variants')
    .update({ stock_quantity: newStock })
    .eq('id', variantId);
    
  if (updateError) throw new Error(updateError.message);
  
  // 3. Log the change
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', (await auth()).userId)
    .single();

  await supabase
    .from('inventory_log')
    .insert({
      variant_id: variantId,
      change_amount: changeAmount,
      reason: reason,
      changed_by: profile?.id
    });
    
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
}
