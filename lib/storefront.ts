import { createClient } from "@supabase/supabase-js";
import { Product, products } from "./mockData";

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
  const primaryImage = row.product_images?.find((img: any) => img.sort_order === 0)?.storage_path || row.product_images?.[0]?.storage_path || "";
  const gallery = row.product_images?.sort((a: any, b: any) => a.sort_order - b.sort_order).map((img: any) => img.storage_path) || [];
  
  // Extract unique colors and sizes from variants
  const colorMap = new Map();
  const sizes = new Set<string>();
  
  if (row.product_variants) {
    row.product_variants.forEach((v: any) => {
      if (v.color) colorMap.set(v.color, { name: v.color, hex: '#000000' }); // Fallback hex, we could add hex to variants later if needed
      if (v.size) sizes.add(v.size);
    });
  }

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
    sizes: Array.from(sizes)
  };
}

export async function getStorefrontProducts(): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
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
      product_variants ( color, size )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return products; // Fallback to mock data if table is missing or error occurs
  }

  return data.map(mapToUIProduct);
}

export async function getStorefrontProduct(idOrSlug: string): Promise<Product | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
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

  if (error || !data) {
    return products.find(p => p.id === idOrSlug || p.name.toLowerCase().replace(/\s+/g, '-') === idOrSlug) || null;
  }
  return mapToUIProduct(data);
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
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
      product_variants ( color, size )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return products.slice(0, limit);
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

