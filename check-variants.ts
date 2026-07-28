import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lunyvqiywzyyiixpwotb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bnl2cWl5d3p5eWlpeHB3b3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzkxMTc2MSwiZXhwIjoyMDk5NDg3NzYxfQ.obI1nCuIHIkXbfhZo2QwlC6JX_7yoU0tQ38xZF1vJ8c"
);

async function run() {
  const { data, error } = await supabase.from('product_variants').insert({
    product_id: '4ae69ca1-2f73-455c-a797-d80d5b8d72ec',
    sku: 'SKU-123', // Exists in DB
    color: 'Red',
    size: 'M',
    stock_quantity: 5
  });
  console.log("Insert duplicate SKU:", error);
}

run();
