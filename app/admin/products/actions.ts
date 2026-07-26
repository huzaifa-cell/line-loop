"use server";

import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase";
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

export async function saveProduct(formData: FormData) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") return { success: false, error: "Unauthorized" };

  const productId = formData.get("productId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const basePrice = parseFloat(formData.get("basePrice") as string);
  const comparePrice = formData.get("comparePrice") ? parseFloat(formData.get("comparePrice") as string) : null;
  
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();
  
  let finalProductId = productId;

  if (productId === "new") {
    const { data, error } = await supabase
      .from('products')
      .insert({
        title,
        description,
        base_price: basePrice,
        compare_at_price: comparePrice,
        slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`
      })
      .select('id')
      .single();
      
    if (error) return { success: false, error: error.message };
    finalProductId = data.id;
  } else {
    const { error } = await supabase
      .from('products')
      .update({
        title,
        description,
        base_price: basePrice,
        compare_at_price: comparePrice
      })
      .eq('id', productId);
      
    if (error) return { success: false, error: error.message };
  }

  const existingMediaRaw = formData.get("existingMedia") as string;
  if (existingMediaRaw) {
    const existingMedia = JSON.parse(existingMediaRaw) as { id: string, sort_order: number }[];
    const keepIds = existingMedia.map(m => m.id);
    
    if (keepIds.length > 0) {
      await supabase.from('product_images').delete().eq('product_id', finalProductId).not('id', 'in', `(${keepIds.join(',')})`);
    } else {
      await supabase.from('product_images').delete().eq('product_id', finalProductId);
    }
    
    for (const m of existingMedia) {
      await supabase.from('product_images').update({ sort_order: m.sort_order }).eq('id', m.id);
    }
  }

  const newFiles = formData.getAll("newFiles") as File[];
  const newMediaOrderRaw = formData.get("newMediaOrder") as string;
  const newMediaOrder = newMediaOrderRaw ? JSON.parse(newMediaOrderRaw) as { id: string, sort_order: number }[] : [];

  for (const file of newFiles) {
    const ext = file.name.split('.').pop();
    const fileName = `${finalProductId}/${crypto.randomUUID()}.${ext}`;
    
    const { error: uploadError } = await adminClient.storage
      .from('product-images')
      .upload(fileName, file, { upsert: true });
      
    if (uploadError) {
      console.error("Upload error:", uploadError);
      continue;
    }
    
    const orderData = newMediaOrder.find(m => m.id === file.name);
    const sortOrder = orderData ? orderData.sort_order : 99;
    
    await supabase.from('product_images').insert({
      product_id: finalProductId,
      storage_path: fileName,
      sort_order: sortOrder
    });
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${finalProductId}`);
  revalidatePath("/shop");
  
  return { success: true, productId: finalProductId };
}
