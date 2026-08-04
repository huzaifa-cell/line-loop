"use server";

import { createSupabaseAdminClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function submitReview(productId: string, formData: FormData) {
  const rating = Number(formData.get("rating"));
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const guestName = formData.get("name") as string;

  if (!rating || rating < 1 || rating > 5) {
    return { error: "Please provide a valid rating between 1 and 5." };
  }

  const supabase = createSupabaseAdminClient();
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

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    profile_id: profileId,
    guest_name: profileId ? null : (guestName || "Anonymous"),
    rating,
    title,
    body,
    status: "pending",
  });

  if (error) {
    console.error("Error submitting review:", error);
    return { error: "Failed to submit review. Please try again later." };
  }

  return { success: true };
}
