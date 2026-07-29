const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const path = 'd781b5cb-f059-46a0-ab8b-6e8cc5057e06/881cca41-8127-4456-87c1-0f4f9bad4445.png';
  const { data, error } = await supabase.storage
    .from('payment-screenshots')
    .createSignedUrl(path, 60);
  
  console.log('Result:', data, 'Error:', error);
}

test();
