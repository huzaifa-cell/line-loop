import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export async function createSupabaseServerClient() {
  const { getToken } = await auth();
  
  // To use RLS with Clerk, you must create a JWT template in the Clerk dashboard
  // named "supabase" that includes the `sub` claim.
  const supabaseToken = await getToken({ template: "supabase" });
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseToken}`,
        },
      },
    }
  );
}

// For operations that explicitly need to bypass RLS (like webhooks)
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
