"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function syncWishlistAction(productIds: string[]) {
  const { userId } = await auth();
  
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = createSupabaseAdminClient();

  try {
    // 1. Fetch existing wishlist items for user to avoid duplicates
    const { data: existing, error: fetchError } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", userId);
      
    if (fetchError) throw fetchError;
      
    const existingIds = new Set(existing?.map((item) => item.product_id) || []);
    
    // 2. Filter out products already in DB
    const newItems = productIds
      .filter((id) => !existingIds.has(id))
      .map((id) => ({
        user_id: userId,
        product_id: id,
      }));

    if (newItems.length > 0) {
      // 3. Insert new items
      const { error } = await supabase
        .from("wishlists")
        .insert(newItems);
        
      if (error) throw error;
    }

    // 4. Return the fully synced list (merged)
    const allIds = Array.from(new Set([...existingIds, ...productIds]));
    return { success: true, productIds: allIds };
  } catch (error: any) {
    console.error("Wishlist sync error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleWishlistItemAction(productId: string, isAdding: boolean) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: "Unauthorized" };

  const supabase = createSupabaseAdminClient();
  
  try {
    if (isAdding) {
      const { error } = await supabase
        .from("wishlists")
        .insert({ user_id: userId, product_id: productId });
      if (error && error.code !== '23505') throw error; // Ignore unique constraint violation
    } else {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .match({ user_id: userId, product_id: productId });
      if (error) throw error;
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
