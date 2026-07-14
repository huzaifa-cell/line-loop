"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getAdminProducts() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      is_published,
      base_price,
      categories ( name ),
      product_variants ( stock_quantity ),
      product_images ( storage_path )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }
  
  return data;
}

export async function toggleProductPublishStatus(id: string, currentStatus: boolean) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('products')
    .update({ is_published: !currentStatus })
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
  
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function deleteProduct(id: string) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
  
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
