import { createSupabaseAdminClient } from "@/lib/supabase";
import { products } from "@/lib/seedData";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createSupabaseAdminClient();
  let addedProducts = 0;

  try {
    for (const product of products) {
      // 1. Check or Create Category
      let categoryId = null;
      if (product.category) {
        const slug = product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', slug)
          .single();
          
        if (catData) {
          categoryId = catData.id;
        } else {
          const { data: newCat } = await supabase
            .from('categories')
            .insert({ name: product.category, slug: slug })
            .select('id')
            .single();
          if (newCat) categoryId = newCat.id;
        }
      }

      // 2. Create Product
      const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { data: newProduct, error: prodError } = await supabase
        .from('products')
        .insert({
          title: product.name,
          slug: productSlug,
          description: product.description + (product.fabric ? `\n\nCare: ${product.fabric}` : ''),
          base_price: product.price,
          compare_at_price: product.originalPrice || null,
          category_id: categoryId,
          is_published: true
        })
        .select('id')
        .single();

      if (prodError || !newProduct) {
        console.error("Failed to insert product:", product.name, prodError);
        continue;
      }
      
      addedProducts++;

      // 3. Create Images
      if (product.gallery && product.gallery.length > 0) {
        // Use external URLs in the storage_path for the prototype phase
        // The UI will handle it gracefully if it looks like http...
        const imageInserts = product.gallery.map((url, idx) => ({
          product_id: newProduct.id,
          storage_path: url, 
          sort_order: idx
        }));
        await supabase.from('product_images').insert(imageInserts);
      } else if (product.image) {
        await supabase.from('product_images').insert({
          product_id: newProduct.id,
          storage_path: product.image,
          sort_order: 0
        });
      }

      // 4. Create Variants
      if (product.sizes && product.colors) {
        for (const color of product.colors) {
          for (const size of product.sizes) {
            const sku = `${productSlug.substring(0, 3).toUpperCase()}-${color.name.substring(0, 3).toUpperCase()}-${size}`;
            await supabase.from('product_variants').insert({
              product_id: newProduct.id,
              sku: sku,
              color: color.name,
              size: size,
              stock_quantity: Math.floor(Math.random() * 20) + 1 // random stock for mock
            });
          }
        }
      } else if (product.sizes) {
        for (const size of product.sizes) {
          const sku = `${productSlug.substring(0, 3).toUpperCase()}-XXX-${size}`;
          await supabase.from('product_variants').insert({
            product_id: newProduct.id,
            sku: sku,
            size: size,
            stock_quantity: Math.floor(Math.random() * 20) + 1
          });
        }
      } else {
        // Single default variant
        await supabase.from('product_variants').insert({
          product_id: newProduct.id,
          sku: `${productSlug.substring(0, 3).toUpperCase()}-BASE`,
          stock_quantity: Math.floor(Math.random() * 20) + 1
        });
      }
    }

    return NextResponse.json({ success: true, message: `Seeded ${addedProducts} products` });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
