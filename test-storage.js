const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabase.storage.getBucket('payment-screenshots');
  console.log('Bucket:', data, 'Error:', error);

  const { data: files, error: filesError } = await supabase.storage.from('payment-screenshots').list();
  console.log('Root Files:', files, 'Error:', filesError);

  if (files && files.length > 0) {
    for (const f of files) {
      if (!f.id) {
         // It's a folder
         const { data: subFiles } = await supabase.storage.from('payment-screenshots').list(f.name);
         console.log('Folder', f.name, 'Files:', subFiles);
      }
    }
  }
}

test();
