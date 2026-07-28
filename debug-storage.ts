import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lunyvqiywzyyiixpwotb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bnl2cWl5d3p5eWlpeHB3b3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzkxMTc2MSwiZXhwIjoyMDk5NDg3NzYxfQ.obI1nCuIHIkXbfhZo2QwlC6JX_7yoU0tQ38xZF1vJ8c"
);

async function run() {
  const { data: order } = await supabase.from('orders').select('bank_transfer_screenshot_path').not('bank_transfer_screenshot_path', 'is', null).limit(1).single();
  console.log("Order screenshot path:", order?.bank_transfer_screenshot_path);

  const { data, error } = await supabase.storage.from('payment-screenshots').list('', { limit: 100 });
  console.log("Storage list root:", data, error);
}

run();
