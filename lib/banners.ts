import { createClient } from "@supabase/supabase-js";

/**
 * Fetches a live banner by placement from the Supabase `banners` table.
 * Returns the most recently created match, or null if none is live.
 */
function getSupabase() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export interface Banner {
  id: string;
  placement: string;
  headline: string | null;
  subtext: string | null;
  cta_label: string | null;
  cta_url: string | null;
  storage_path: string | null;
  is_live: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

export async function getLiveBanner(
  placement: string
): Promise<Banner | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("banners")
    .select("*")
    .eq("placement", placement)
    .eq("is_live", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as Banner;
}
