import { createClient } from "@supabase/supabase-js";
import { Product } from "./types";

/**
 * Creates an anonymous Supabase client for reading public storefront data.
 */
function getSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Helper to map Supabase relational data back into the existing UI `Product` shape.
 */
function mapToUIProduct(row: any): Product {
  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
  };

  const primaryImagePath = row.product_images?.find((img: any) => img.sort_order === 0)?.storage_path || row.product_images?.[0]?.storage_path || "";
  const primaryImage = getImageUrl(primaryImagePath);
  
  const gallery = row.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((img: any) => getImageUrl(img.storage_path)) || [];
  
  // Extract unique colors and sizes from variants
  const colorMap = new Map();
  const sizes = new Set<string>();
  
  if (row.product_variants) {
    row.product_variants.forEach((v: any) => {
      if (v.color) {
        let colorName = v.color;
        let colorHex = '#131313';
        try {
          if (v.color.startsWith('{')) {
            const parsed = JSON.parse(v.color);
            colorName = parsed.name || v.color;
            colorHex = parsed.hex || '#131313';
          }
        } catch (e) {}
        colorMap.set(colorName, { name: colorName, hex: colorHex });
      }
      if (v.size) sizes.add(v.size);
    });
  }

  const totalStock = Array.isArray(row.product_variants) 
    ? row.product_variants.reduce((acc: number, v: any) => acc + (v.stock_quantity || 0), 0)
    : 0;

  return {
    id: row.id,
    name: row.title,
    price: row.base_price,
    originalPrice: row.compare_at_price,
    category: row.categories?.name,
    description: row.description,
    image: primaryImage,
    gallery: gallery.length > 0 ? gallery : [primaryImage],
    colors: Array.from(colorMap.values()),
    sizes: Array.from(sizes),
    totalStock,
    variants: row.product_variants ? row.product_variants.map((v: any) => {
      let colorName = v.color || "Default";
      try {
        if (v.color?.startsWith('{')) {
          colorName = JSON.parse(v.color).name || colorName;
        }
      } catch(e) {}
      return {
        id: v.id,
        color: colorName,
        size: v.size,
        stock: v.stock_quantity || 0
      };
    }) : []
  };
}

export async function getStorefrontProducts(): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Database configuration is missing.");
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      description,
      base_price,
      compare_at_price,
      categories ( name ),
      product_images ( storage_path, sort_order ),
      product_variants ( color, size, stock_quantity )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to load products. Database unavailable.");
  }
  if (!data) return [];

  return data.map(mapToUIProduct);
}

export async function getStorefrontProduct(idOrSlug: string): Promise<Product | null> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Database configuration is missing.");
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      description,
      base_price,
      compare_at_price,
      categories ( name ),
      product_images ( storage_path, sort_order ),
      product_variants ( id, color, size, stock_quantity )
    `)
    .eq('is_published', true)
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to load product. Database unavailable.");
  }
  if (!data) return null;
  return mapToUIProduct(data);
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Database configuration is missing.");
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      title,
      slug,
      description,
      base_price,
      compare_at_price,
      categories ( name ),
      product_images ( storage_path, sort_order ),
      product_variants ( color, size, stock_quantity )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured products:", error);
    throw new Error("Failed to load featured products. Database unavailable.");
  }
  if (!data) return [];
  return data.map(mapToUIProduct);
}

export async function getStorefrontOrdersByEmail(email: string) {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      status,
      total,
      created_at,
      order_items ( id )
    `)
    .eq('guest_email', email)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((o: any) => ({
    orderNumber: o.order_number,
    status: o.status,
    total: o.total,
    createdAt: o.created_at,
    lineCount: o.order_items ? o.order_items.length : 0
  }));
}

export async function getStorefrontOrderByNumberAndEmail(orderNumber: string, email: string) {
  const supabase = getSupabase();
  if (!supabase) return null;
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
      subtotal,
      shipping_amount,
      discount_amount,
      shipping_address,
      created_at,
      order_items (
        id,
        product_title,
        variant_label,
        unit_price,
        quantity
      )
    `)
    .eq('order_number', orderNumber)
    .eq('guest_email', email)
    .single();

  if (error || !data) return null;

  return {
    orderNumber: data.order_number,
    customerEmail: data.guest_email,
    status: data.status,
    paymentMethod: data.payment_method,
    paymentStatus: data.payment_status,
    createdAt: data.created_at,
    total: data.total,
    subtotal: data.subtotal,
    shippingCost: data.shipping_amount,
    discount: data.discount_amount,
    codFee: 0,
    shippingAddress: data.shipping_address,
    lines: data.order_items.map((item: any) => ({
      name: item.product_title,
      colour: item.variant_label.split(' / ')[1] || 'Default',
      size: item.variant_label.split(' / ')[0],
      price: item.unit_price,
      qty: item.quantity
    }))
  };
}
export async function getApprovedReviews(productId: string) {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      title,
      body,
      guest_name,
      created_at,
      profiles!reviews_profile_id_fkey (
        full_name,
        email
      )
    `)
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
}

