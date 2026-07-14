import { createSupabaseServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  const supabase = await createSupabaseServerClient();
  let product = null;
  
  if (id !== "new") {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
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
      
      <div className="bg-ivory-mist border border-ink-black p-6 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Title</label>
          <input 
            type="text" 
            defaultValue={product?.title}
            className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black focus:border-transparent rounded-none"
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Description</label>
          <textarea 
            rows={4}
            defaultValue={product?.description}
            className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black focus:border-transparent rounded-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Base Price (Rs)</label>
            <input 
              type="number" 
              defaultValue={product?.base_price}
              className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black focus:border-transparent rounded-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Compare At Price (Rs)</label>
            <input 
              type="number" 
              defaultValue={product?.compare_at_price}
              className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black focus:border-transparent rounded-none"
            />
          </div>
        </div>
        
        <div>
          <span className="block text-xs font-bold uppercase tracking-widest mb-2">Media (Photos & Videos)</span>
          <label className="border-2 border-dashed border-ink-black/20 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-ink-black/5 transition-colors block w-full">
            <svg className="w-8 h-8 mb-4 text-ink-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            <span className="text-sm text-ink-black/70">Click to upload photos and videos</span>
            <input type="file" className="hidden" multiple accept="image/*,video/*" />
          </label>
        </div>
        
        <div className="pt-4 border-t border-ink-black/20 flex justify-end">
          <button className="bg-ink-black text-ivory-mist px-8 py-3 text-sm uppercase tracking-widest font-bold hover:bg-ink-black/80 transition-colors">
            Save Product
          </button>
        </div>
      </div>
    </div>
  );
}
