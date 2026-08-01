const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function setAdmin(email) {
  if (!email) {
    console.error('Please provide an email address: node set-admin.js <email>');
    process.exit(1);
  }

  console.log(`Setting admin role for: ${email}`);

  // 1. Update Supabase Profile
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, clerk_user_id, email')
    .eq('email', email)
    .single();

  if (fetchError || !profile) {
    console.error('Could not find user in Supabase profiles:', fetchError?.message || 'User not found');
    process.exit(1);
  }

  console.log('Found user in Supabase, updating role to admin...');
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', profile.id);

  if (updateError) {
    console.error('Failed to update Supabase role:', updateError.message);
    process.exit(1);
  }
  
  console.log('Successfully updated Supabase profile.');

  // 2. We also need to update Clerk Public Metadata
  // We can use the Clerk REST API directly using the secret key
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) {
    console.error('Missing CLERK_SECRET_KEY environment variable');
    process.exit(1);
  }

  console.log('Updating Clerk public metadata...');
  try {
    const response = await fetch(`https://api.clerk.com/v1/users/${profile.clerk_user_id}/metadata`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        public_metadata: {
          role: 'admin'
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to update Clerk metadata:', errorData);
      process.exit(1);
    }
    
    console.log('Successfully updated Clerk metadata.');
    console.log('✅ User is now an admin! They may need to log out and log back in for changes to take effect.');
    
  } catch (error) {
    console.error('Error calling Clerk API:', error);
  }
}

const email = process.argv[2];
setAdmin(email);
