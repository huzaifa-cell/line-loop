import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { ProductForm } from "./ProductForm";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  const supabase = await createSupabaseServerClient();
  let product = null;
  
  if (id !== "new") {
    const { data } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('id', id)
      .single();
    product = data;
    if (!product) redirect('/admin/products');
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center border-b border-ink-black pb-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {id === "new" ? "New Product" : `Edit Product`}
        </h1>
      </div>
      
      <ProductForm productId={id} initialData={product} />
    </div>
  );
}
