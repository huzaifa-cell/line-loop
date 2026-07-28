import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lunyvqiywzyyiixpwotb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bnl2cWl5d3p5eWlpeHB3b3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzkxMTc2MSwiZXhwIjoyMDk5NDg3NzYxfQ.obI1nCuIHIkXbfhZo2QwlC6JX_7yoU0tQ38xZF1vJ8c"
);

async function run() {
  const { data, error } = await supabase.from('order_items').insert({
    order_id: "dbb4c960-d332-4da3-a2a4-7dba66c0c6cf", // use the order id we just created
    variant_id: null,
    product_title: "Test",
    variant_label: "M",
    unit_price: 1000,
    quantity: 1
  });
  console.log("Insert result:", { data, error });
}

run();
