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

export function ProductForm({ productId, initialData }: { productId: string, initialData?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [basePrice, setBasePrice] = useState(initialData?.base_price?.toString() || "");
  const [comparePrice, setComparePrice] = useState(initialData?.compare_at_price?.toString() || "");

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
      formData.append("description", description);
      formData.append("basePrice", basePrice);
      formData.append("comparePrice", comparePrice);
      
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
    <form onSubmit={handleSubmit} className="bg-ivory-mist border border-ink-black p-6 space-y-6">
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2">Title *</label>
        <input 
          type="text" 
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black focus:border-transparent rounded-none"
        />
      </div>
      
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2">Description</label>
        <textarea 
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black focus:border-transparent rounded-none"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Base Price (Rs) *</label>
          <input 
            type="number" 
            required
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black focus:border-transparent rounded-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Compare At Price (Rs)</label>
          <input 
            type="number" 
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
            className="w-full bg-transparent border border-ink-black p-3 focus:outline-none focus:ring-2 focus:ring-ink-black focus:border-transparent rounded-none"
          />
        </div>
      </div>
      
      <div>
        <span className="block text-xs font-bold uppercase tracking-widest mb-2">Media (Photos & Videos)</span>
        
        {media.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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

        <label className="border-2 border-dashed border-ink-black/20 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-ink-black/5 block w-full">
          <svg className="w-8 h-8 mb-4 text-ink-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          <span className="text-sm text-ink-black/70">Click to upload photos and videos</span>
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
      
      <div className="pt-4 border-t border-ink-black/20 flex justify-end">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-ink-black text-ivory-mist px-8 py-3 text-sm uppercase tracking-widest font-bold hover:bg-ink-black/80 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}
