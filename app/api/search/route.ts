import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/search?q=<query>
 * Searches published products in Supabase by title and description.
 * Returns max 8 results mapped to a lightweight shape for the SearchOverlay.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      id,
      title,
      slug,
      base_price,
      description,
      categories ( name ),
      product_images ( storage_path, sort_order )
    `
    )
    .eq("is_published", true)
    .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error || !data) {
    return NextResponse.json({ results: [] });
  }

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`;
  };

  const results = data.map((row: any) => {
    const primaryImage =
      row.product_images?.sort(
        (a: any, b: any) => a.sort_order - b.sort_order
      )[0]?.storage_path || "";

    return {
      id: row.id,
      name: row.title,
      price: row.base_price,
      category: row.categories?.name || "",
      image: getImageUrl(primaryImage),
    };
  });

  return NextResponse.json({ results });
}
