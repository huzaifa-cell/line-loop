"use server";

import { createSupabaseAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function submitReview(productId: string, formData: FormData) {
  const rating = Number(formData.get("rating"));
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const guestName = formData.get("name") as string;

  if (!rating || rating < 1 || rating > 5) {
    return { error: "Please provide a valid rating between 1 and 5." };
  }

  const mediaFiles = formData.getAll("media") as File[];
  const uploadedPaths: string[] = [];

  const supabase = createSupabaseAdminClient();

  // Upload media files if any
  for (const file of mediaFiles) {
    if (file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = file.name.split(".").pop();
      const fileName = `reviews/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        // Continue with other files or fail? We'll continue but log it.
      } else {
        // Construct the full public URL for easier rendering
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${fileName}`;
        uploadedPaths.push(url);
      }
    }
  }

  const { userId } = await auth();

  let profileId = null;

  if (userId) {
    // Attempt to get the profile_id for the logged-in user
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", userId)
      .single();

    if (profile) {
      profileId = profile.id;
    }
  }

  // Serialize the body to include media URLs
  const serializedBody = JSON.stringify({
    text: body,
    media: uploadedPaths,
  });

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    profile_id: profileId,
    guest_name: profileId ? null : (guestName || "Anonymous"),
    rating,
    title,
    body: serializedBody,
    status: "approved", // Auto-approve
  });

  if (error) {
    console.error("Error submitting review:", error);
    return { error: "Failed to submit review. Please try again later." };
  }

  revalidatePath(`/shop/${productId}`);
  return { success: true };
}
