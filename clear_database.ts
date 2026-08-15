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

async function clearDatabase() {
  console.log("Starting full database wipe...");

  const tablesToClear = [
    "activity_log",
    "order_status_history",
    "order_items",
    "inventory_log",
    "orders",
    "customer_addresses",
    "reviews",
    "product_variants",
    "product_images",
    "products",
    "categories",
    "profiles",
    "discounts",
    "banners",
    "shipping_zones",
    "tax_settings"
  ];

  for (const table of tablesToClear) {
    console.log(`Clearing table: ${table}...`);
    const { error } = await supabase
      .from(table)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // deletes all rows

    if (error) {
      console.error(`Error clearing ${table}:`, error);
    } else {
      console.log(`Successfully cleared ${table}.`);
    }
  }

  console.log("Full database wipe completed.");
}

clearDatabase();
