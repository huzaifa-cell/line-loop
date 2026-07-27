"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return [];
  return data;
}

export async function saveCategory(formData: FormData) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff")
    return { success: false, error: "Unauthorized" };

  const supabase = await createSupabaseServerClient();

  const categoryId = formData.get("categoryId") as string;
  const name = formData.get("name") as string;
  let slug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || null;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
  const isPublished = formData.get("isPublished") === "true";

  if (!slug) {
    slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  const categoryData = {
    name,
    slug,
    description,
    sort_order: sortOrder,
    is_published: isPublished,
    updated_at: new Date().toISOString(),
  };

  if (categoryId && categoryId !== "new") {
    const { error } = await supabase
      .from("categories")
      .update(categoryData)
      .eq("id", categoryId);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("categories")
      .insert(categoryData);
    if (error) return { success: false, error: error.message };
  }

  // Log activity
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();
  await supabase.from("activity_log").insert({
    actor_id: profile?.id,
    action: categoryId === "new" ? "category.create" : "category.update",
    entity_type: "categories",
    metadata: { name },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin" && role !== "staff") throw new Error("Unauthorized");

  const supabase = await createSupabaseServerClient();

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();
  await supabase.from("activity_log").insert({
    actor_id: profile?.id,
    action: "category.delete",
    entity_type: "categories",
    metadata: { name: category?.name },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}
