require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase.from('reviews').select(`
    id,
    profiles!reviews_profile_id_fkey ( email, full_name )
  `);
  console.log("Data:", data);
  if (error) console.error("Error:", error);
}
main();
