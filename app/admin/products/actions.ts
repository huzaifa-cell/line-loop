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
    console.error("getAdminProducts error:", error);
    return [];
  }
  
  console.log("getAdminProducts returned:", data?.length, "products");
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
  try {
    const { sessionClaims, userId } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (role !== "admin" && role !== "staff") return { success: false, error: "Unauthorized" };

    const productId = formData.get("productId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const basePrice = parseFloat(formData.get("basePrice") as string);
    const comparePriceRaw = formData.get("comparePrice") as string;
    const comparePrice = comparePriceRaw && comparePriceRaw !== "" && !isNaN(parseFloat(comparePriceRaw)) ? parseFloat(comparePriceRaw) : null;
    
    let slug = formData.get("slug") as string;
    if (!slug) slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const categoryIdRaw = formData.get("categoryId") as string;
    const categoryId = categoryIdRaw || null;
    const isPublished = formData.get("isPublished") === "true";
    const metaTitle = formData.get("metaTitle") as string || null;
    const metaDescription = formData.get("metaDescription") as string || null;

    // Use admin client for ALL operations to bypass RLS
    const adminClient = createSupabaseAdminClient();
    
    let finalProductId = productId;

    const productData = {
      title,
      description,
      base_price: basePrice,
      compare_at_price: comparePrice,
      category_id: categoryId,
      is_published: isPublished,
      meta_title: metaTitle,
      meta_description: metaDescription
    };

    if (productId === "new") {
      const { data, error } = await adminClient
        .from('products')
        .insert({
          ...productData,
          slug: `${slug}-${Math.random().toString(36).substring(2, 7)}` // simple uniqueness
        })
        .select('id')
        .single();
        
      if (error) return { success: false, error: error.message };
      finalProductId = data.id;
    } else {
      const { error } = await adminClient
        .from('products')
        .update({ ...productData, slug })
        .eq('id', productId);
        
      if (error) return { success: false, error: error.message };
    }

    // Handle Variants
    const variantsRaw = formData.get("variants") as string;
    if (variantsRaw) {
      const variants = JSON.parse(variantsRaw) as any[];
      const keepIds = variants.filter(v => !v.isNew).map(v => v.id);
      
      // Delete removed variants
      if (keepIds.length > 0) {
        await adminClient.from('product_variants').delete().eq('product_id', finalProductId).not('id', 'in', `(${keepIds.join(',')})`);
      } else {
        await adminClient.from('product_variants').delete().eq('product_id', finalProductId);
      }
      
      // Upsert variants
      for (const v of variants) {
        const variantData = {
          product_id: finalProductId,
          sku: v.sku,
          color: v.color || null,
          size: v.size || null,
          stock_quantity: v.stock_quantity
        };
        
        if (v.isNew) {
          const { error: insertError } = await adminClient.from('product_variants').insert(variantData);
          if (insertError) {
            return { success: false, error: `Failed to save variant (SKU: ${v.sku}): ${insertError.message}` };
          }
        } else {
          const { error: updateError } = await adminClient.from('product_variants').update(variantData).eq('id', v.id);
          if (updateError) {
            return { success: false, error: `Failed to update variant (SKU: ${v.sku}): ${updateError.message}` };
          }
        }
      }
    }

    // Handle existing media (deletions & reordering)
    const existingMediaRaw = formData.get("existingMedia") as string;
    if (existingMediaRaw) {
      const existingMedia = JSON.parse(existingMediaRaw) as { id: string, sort_order: number }[];
      const keepIds = existingMedia.map(m => m.id);
      
      if (keepIds.length > 0) {
        await adminClient.from('product_images').delete().eq('product_id', finalProductId).not('id', 'in', `(${keepIds.join(',')})`);
      } else {
        await adminClient.from('product_images').delete().eq('product_id', finalProductId);
      }
      
      for (const m of existingMedia) {
        await adminClient.from('product_images').update({ sort_order: m.sort_order }).eq('id', m.id);
      }
    }

    // Handle new file uploads
    const newFiles = formData.getAll("newFiles") as File[];
    const newMediaOrderRaw = formData.get("newMediaOrder") as string;
    const newMediaOrder = newMediaOrderRaw ? JSON.parse(newMediaOrderRaw) as { id: string, sort_order: number }[] : [];

    for (const file of newFiles) {
      const ext = file.name.split('.').pop();
      const fileName = `${finalProductId}/${crypto.randomUUID()}.${ext}`;
      
      const arrayBuffer = await file.arrayBuffer();
      
      const { error: uploadError } = await adminClient.storage
        .from('product-images')
        .upload(fileName, arrayBuffer, { 
          upsert: true,
          contentType: file.type 
        });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }
      
      const orderData = newMediaOrder.find(m => m.id === file.name);
      const sortOrder = orderData ? orderData.sort_order : 99;
      
      await adminClient.from('product_images').insert({
        product_id: finalProductId,
        storage_path: fileName,
        sort_order: sortOrder
      });
    }

    // Log Activity
    const { data: profile } = await adminClient.from('profiles').select('id').eq('clerk_user_id', userId).single();
    if (profile) {
      await adminClient.from('activity_log').insert({
        actor_id: profile.id,
        action: productId === "new" ? 'product.create' : 'product.update',
        entity_type: 'products',
        entity_id: finalProductId,
        metadata: { title }
      });
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${finalProductId}`);
    revalidatePath("/", "layout");
    
    return { success: true, productId: finalProductId };
  } catch (err: any) {
    console.error("saveProduct error:", err);
    return { success: false, error: err.message || "An unexpected error occurred" };
  }
}
