"use server";

import { createSupabaseServerClient } from "@/lib/supabase";
import crypto from "crypto";

export async function uploadPaymentProof(orderNumber: string, formData: FormData) {
  const file = formData.get("file") as File;
  
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  const supabase = await createSupabaseServerClient();

  // 1. Verify the order exists and is pending bank transfer
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber)
    .eq("payment_method", "bank")
    .single();

  if (orderError || !order) {
    return { success: false, error: "Invalid order number or payment method" };
  }

  // 2. Generate hash for duplicate detection
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");

  // Check if hash already exists
  const { data: existingHash } = await supabase
    .from("orders")
    .select("id")
    .eq("bank_transfer_screenshot_hash", hash)
    .single();

  if (existingHash) {
    return { success: false, error: "This screenshot has already been used for another order" };
  }

  // 3. Upload to Supabase Storage
  const ext = file.name.split(".").pop();
  const fileName = `${order.id}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("payment-screenshots")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { success: false, error: "Failed to upload file" };
  }

  // 4. Update the order
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      bank_transfer_screenshot_path: fileName,
      bank_transfer_screenshot_hash: hash,
      payment_status: "bank_transfer_under_review",
    })
    .eq("id", order.id);

  if (updateError) {
    return { success: false, error: "Failed to update order record" };
  }
  
  // 5. Add a note to the order status history
  await supabase.from("order_status_history").insert({
    order_id: order.id,
    status: "pending",
    note: "Customer uploaded bank transfer proof",
  });

  return { success: true };
}
