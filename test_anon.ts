import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function reloadSchema() {
  console.log("Reloading PostgREST schema cache...");
  
  // We can call a generic RPC if we have one, or just try to trigger a schema reload.
  // Actually, inserting/deleting or altering a dummy table forces a reload in Supabase.
  const { error } = await supabase.rpc('reload_schema'); // This might not exist
  
  console.log("Checking if we can access product_details with ANON key...");
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data, error: anonError } = await anonClient
    .from('products')
    .select('*')
    .limit(1);
    
  if (anonError) {
    console.error("Anon error:", anonError);
  } else {
    console.log("Anon success!");
    if (data && data.length > 0) {
      console.log("Anon Columns:", Object.keys(data[0]));
    }
  }
}

reloadSchema();
