import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearProducts() {
  console.log("Deleting all dependent records to satisfy foreign key constraints...");

  // 1. Delete all order items (or orders, which cascades to order items typically)
  console.log("Deleting orders (and order_items)...");
  const { error: deleteOrdersError } = await supabase
    .from("orders")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteOrdersError) {
    console.error("Error deleting orders:", deleteOrdersError);
  }

  // 2. Delete all reviews
  console.log("Deleting reviews...");
  const { error: deleteReviewsError } = await supabase
    .from("reviews")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteReviewsError) {
    console.error("Error deleting reviews:", deleteReviewsError);
  }

  // 3. Delete products
  console.log("Deleting products...");
  const { error: deleteProductsError } = await supabase
    .from("products")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (deleteProductsError) {
    console.error("Error deleting products:", deleteProductsError);
  } else {
    console.log("Successfully deleted all products (and their dependent records).");
  }
}

clearProducts();
