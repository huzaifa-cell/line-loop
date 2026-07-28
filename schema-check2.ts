import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lunyvqiywzyyiixpwotb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1bnl2cWl5d3p5eWlpeHB3b3RiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzkxMTc2MSwiZXhwIjoyMDk5NDg3NzYxfQ.obI1nCuIHIkXbfhZo2QwlC6JX_7yoU0tQ38xZF1vJ8c"
);

async function run() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      guest_email,
      status,
      payment_method,
      payment_status,
      total,
      created_at,
      profiles ( email )
    `)
    .order('created_at', { ascending: false });
    
  console.log("Orders with profiles:", { data, error });
}

run();
