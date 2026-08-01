import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const baseUrl = "https://lineandloop.shop";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/shipping-returns`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Dynamic product pages
  let productPages: MetadataRoute.Sitemap = [];

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const { data: products } = await supabase
        .from("products")
        .select("id, updated_at")
        .eq("is_published", true);

      if (products) {
        productPages = products.map((product) => ({
          url: `${baseUrl}/shop/${product.id}`,
          lastModified: new Date(product.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
      }
    }
  } catch (error) {
    console.error("Sitemap: Failed to fetch products", error);
  }

  return [...staticPages, ...productPages];
}
