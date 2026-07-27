"use client";

import { useState, useRef } from "react";
import { saveProduct } from "../actions";
import { useRouter } from "next/navigation";

type MediaItem = {
  id: string; // uuid for existing, or random string for new
  type: "existing" | "new";
  url: string;
  storage_path?: string; // only for existing
  file?: File; // only for new
  sort_order: number;
};

type VariantItem = {
  id: string;
  sku: string;
  color: string;
  size: string;
  stock_quantity: number;
  isNew: boolean;
};

export function ProductForm({ productId, initialData, categories }: { productId: string, initialData?: any, categories: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [basePrice, setBasePrice] = useState(initialData?.base_price?.toString() || "");
  const [comparePrice, setComparePrice] = useState(initialData?.compare_at_price?.toString() || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [isPublished, setIsPublished] = useState(initialData?.is_published ?? false);
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || "");

  // Variants
  const [variants, setVariants] = useState<VariantItem[]>(
    (initialData?.product_variants || []).map((v: any) => ({
      id: v.id,
      sku: v.sku,
      color: v.color || "",
      size: v.size || "",
      stock_quantity: v.stock_quantity,
      isNew: false
    }))
  );

  const addVariant = () => {
    setVariants([...variants, {
      id: Math.random().toString(36).substring(7),
      sku: "",
      color: "",
      size: "",
      stock_quantity: 0,
      isNew: true
    }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof VariantItem, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  // Initialize media from existing product_images
  const [media, setMedia] = useState<MediaItem[]>(
    (initialData?.product_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((img: any) => ({
      id: img.id,
      type: "existing",
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${img.storage_path}`,
      storage_path: img.storage_path,
      sort_order: img.sort_order
    }))
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newItems: MediaItem[] = Array.from(files).map((file, index) => ({
      id: Math.random().toString(36).substring(7),
      type: "new",
      url: URL.createObjectURL(file),
      file,
      sort_order: media.length + index
    }));

    setMedia([...media, ...newItems]);
  };

  const moveMedia = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= media.length) return;
    
    const newMedia = [...media];
    const temp = newMedia[index];
    newMedia[index] = newMedia[index + direction];
    newMedia[index + direction] = temp;
    
    // update sort_orders
    newMedia.forEach((m, i) => m.sort_order = i);
    setMedia(newMedia);
  };

  const removeMedia = (index: number) => {
    const newMedia = media.filter((_, i) => i !== index);
    newMedia.forEach((m, i) => m.sort_order = i);
    setMedia(newMedia);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("description", description);
      formData.append("basePrice", basePrice);
      formData.append("comparePrice", comparePrice);
      formData.append("categoryId", categoryId);
      formData.append("isPublished", isPublished.toString());
      formData.append("metaTitle", metaTitle);
      formData.append("metaDescription", metaDescription);
      
      formData.append("variants", JSON.stringify(variants));

      const existingMedia = media.filter(m => m.type === "existing").map(m => ({
        id: m.id,
        sort_order: m.sort_order
      }));
      formData.append("existingMedia", JSON.stringify(existingMedia));
      
      const newMediaOrder: { id: string, sort_order: number }[] = [];
      
      media.filter(m => m.type === "new").forEach((m) => {
        if (m.file) {
          formData.append("newFiles", m.file);
          newMediaOrder.push({ id: m.file.name, sort_order: m.sort_order }); // assuming filenames are unique enough in this upload batch
        }
      });
      
      formData.append("newMediaOrder", JSON.stringify(newMediaOrder));

      const res = await saveProduct(formData);
      if (res.success) {
        router.push("/admin/products");
        router.refresh();
      } else {
        alert(res.error || "Failed to save product");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-ivory-mist border border-ink-black p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-ink-black/20 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Basic Information</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold uppercase tracking-widest">Published</span>
            <input 
              type="checkbox" 
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="accent-ink-black w-4 h-4 cursor-pointer"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Title *</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black rounded-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Slug</label>
            <input 
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="Leave empty to auto-generate from title"
              className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black rounded-none"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Description</label>
          <textarea 
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black rounded-none"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black rounded-none"
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Base Price (Rs) *</label>
            <input 
              type="number" 
              required
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black rounded-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Compare Price (Rs)</label>
            <input 
              type="number" 
              value={comparePrice}
              onChange={(e) => setComparePrice(e.target.value)}
              className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black rounded-none"
            />
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-ivory-mist border border-ink-black p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-ink-black/20 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Variants (Sizes & Colors)</h2>
          <button 
            type="button" 
            onClick={addVariant}
            className="text-xs font-bold uppercase tracking-widest border border-ink-black px-3 py-1 hover:bg-ink-black/5"
          >
            + Add Variant
          </button>
        </div>

        {variants.length === 0 ? (
          <div className="text-sm text-ink-black/60 py-4">No variants added. The product will not be purchasable without at least one variant.</div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-widest text-ink-black/60 px-2">
              <div className="col-span-3">SKU *</div>
              <div className="col-span-3">Color</div>
              <div className="col-span-3">Size</div>
              <div className="col-span-2">Stock *</div>
              <div className="col-span-1 text-center">Delete</div>
            </div>
            {variants.map((variant, idx) => (
              <div key={variant.id} className="grid grid-cols-12 gap-2 items-center bg-ink-black/5 p-2">
                <div className="col-span-3">
                  <input required type="text" value={variant.sku} onChange={(e) => updateVariant(idx, 'sku', e.target.value)} placeholder="SKU-123" className="w-full bg-transparent border border-ink-black px-2 py-1 text-sm rounded-none focus:outline-none" />
                </div>
                <div className="col-span-3">
                  <input type="text" value={variant.color} onChange={(e) => updateVariant(idx, 'color', e.target.value)} placeholder="Red" className="w-full bg-transparent border border-ink-black px-2 py-1 text-sm rounded-none focus:outline-none" />
                </div>
                <div className="col-span-3">
                  <input type="text" value={variant.size} onChange={(e) => updateVariant(idx, 'size', e.target.value)} placeholder="M" className="w-full bg-transparent border border-ink-black px-2 py-1 text-sm rounded-none focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <input required type="number" min="0" value={variant.stock_quantity} onChange={(e) => updateVariant(idx, 'stock_quantity', parseInt(e.target.value) || 0)} className="w-full bg-transparent border border-ink-black px-2 py-1 text-sm rounded-none focus:outline-none" />
                </div>
                <div className="col-span-1 flex justify-center">
                  <button type="button" onClick={() => removeVariant(idx)} className="text-thread-red font-bold hover:underline">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="bg-ivory-mist border border-ink-black p-6 space-y-6">
        <div className="border-b border-ink-black/20 pb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest">Search Engine Optimization (SEO)</h2>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Meta Title</label>
          <input 
            type="text" 
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black rounded-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Meta Description</label>
          <textarea 
            rows={3}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black rounded-none"
          />
        </div>
      </div>
      
      {/* Media */}
      <div className="bg-ivory-mist border border-ink-black p-6">
        <div className="border-b border-ink-black/20 pb-4 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest">Media (Photos & Videos)</h2>
        </div>
        
        {media.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {media.map((item, index) => (
              <div key={item.id} className="relative aspect-square border border-ink-black/20 group overflow-hidden bg-ink-black/5">
                {item.url.match(/\.(mp4|webm|mov)$/i) || (item.file && item.file.type.startsWith('video/')) ? (
                  <video src={item.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={item.url} alt="preview" className="w-full h-full object-cover" />
                )}
                
                <div className="absolute inset-0 bg-ink-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button type="button" onClick={() => removeMedia(index)} className="bg-thread-red text-white p-1 rounded-sm text-xs font-bold uppercase hover:bg-red-700">Delete</button>
                  </div>
                  <div className="flex justify-between">
                    <button type="button" onClick={() => moveMedia(index, -1)} disabled={index === 0} className="bg-ink-black text-white p-1 px-2 rounded-sm text-xs disabled:opacity-30">&larr;</button>
                    <button type="button" onClick={() => moveMedia(index, 1)} disabled={index === media.length - 1} className="bg-ink-black text-white p-1 px-2 rounded-sm text-xs disabled:opacity-30">&rarr;</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <label className="border-2 border-dashed border-ink-black/20 p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-ink-black/5 block w-full">
          <svg className="w-8 h-8 mb-4 text-ink-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          <span className="text-sm font-bold uppercase tracking-widest text-ink-black/70">Click to upload files</span>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            multiple 
            accept="image/*,video/*" 
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>
      
      <div className="flex justify-end pt-4 pb-12">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-ink-black text-ivory-mist px-10 py-4 text-sm uppercase tracking-widest font-bold hover:bg-ink-black/80 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
