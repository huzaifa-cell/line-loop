"use client";

import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import { Product } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import { submitReview } from "./actions";
import { WishlistButton } from "@/components/WishlistButton";

function StarRating({ rating, setRating, interactive = false }: { rating: number, setRating?: (r: number) => void, interactive?: boolean }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : "button"}
          onClick={() => interactive && setRating && setRating(star)}
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
            star <= rating ? 'text-amber-500' : 'text-white/20'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ReviewsSection({ productId, reviews }: { productId: string, reviews: any[] }) {
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleReviewSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.append("rating", rating.toString());
    
    // We override the 'media' with our manually tracked selectedFiles
    formData.delete('media');
    selectedFiles.forEach((file) => formData.append('media', file));

    const result = await submitReview(productId, formData);
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: "Your review has been submitted successfully." });
      (e.target as HTMLFormElement).reset();
      setRating(5);
      setSelectedFiles([]);
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-8">
      {/* Existing Reviews */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-sm text-beige/60">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((review) => {
            let parsedBody = { text: review.body, media: [] as string[] };
            try {
              if (review.body && review.body.startsWith('{')) {
                parsedBody = JSON.parse(review.body);
              }
            } catch (e) {
              // fallback to plain text
            }

            return (
              <div key={review.id} className="border-b border-white/10 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <StarRating rating={review.rating} />
                  <span className="font-label-caps text-[10px] text-beige uppercase tracking-widest">
                    {review.profiles?.full_name || review.guest_name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-beige/50">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.title && <h4 className="font-bold text-ivory mb-1">{review.title}</h4>}
                {parsedBody.text && <p className="text-sm text-beige leading-relaxed">{parsedBody.text}</p>}
                {parsedBody.media && parsedBody.media.length > 0 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                    {parsedBody.media.map((url, i) => {
                      const isVideo = url.toLowerCase().match(/\.(mp4|webm|mov)$/);
                      return isVideo ? (
                        <video key={i} src={url} controls className="h-24 w-24 object-cover rounded-sm shrink-0" />
                      ) : (
                        <img key={i} src={url} alt="Review media" className="h-24 w-24 object-cover rounded-sm shrink-0" />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Review Form */}
      <div className="mt-8 bg-white/5 p-6 rounded-sm">
        <h3 className="font-label-caps text-sm text-ivory uppercase tracking-widest mb-4">Write a Review</h3>
        
        {message && (
          <div className={`p-4 mb-4 text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-brand-red/20 text-brand-red'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-label-caps uppercase tracking-widest text-beige mb-2">Rating</label>
            <StarRating rating={rating} setRating={setRating} interactive />
          </div>
          <div>
            <label htmlFor="name" className="block text-xs font-label-caps uppercase tracking-widest text-beige mb-2">Name</label>
            <input type="text" id="name" name="name" required className="w-full bg-black/50 border border-white/10 px-4 py-2 text-ivory focus:border-ivory outline-none" />
          </div>
          <div>
            <label htmlFor="title" className="block text-xs font-label-caps uppercase tracking-widest text-beige mb-2">Review Title (Optional)</label>
            <input type="text" id="title" name="title" className="w-full bg-black/50 border border-white/10 px-4 py-2 text-ivory focus:border-ivory outline-none" />
          </div>
          <div>
            <label htmlFor="body" className="block text-xs font-label-caps uppercase tracking-widest text-beige mb-2">Review</label>
            <textarea id="body" name="body" required rows={4} className="w-full bg-black/50 border border-white/10 px-4 py-2 text-ivory focus:border-ivory outline-none" />
          </div>
          <div>
            <label htmlFor="media" className="block text-xs font-label-caps uppercase tracking-widest text-beige mb-2">Photos & Videos (Optional)</label>
            <input type="file" id="media" name="media" accept="image/*,video/*" multiple onChange={handleFileChange} className="w-full text-xs text-beige file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-label-caps file:uppercase file:tracking-widest file:bg-white/10 file:text-ivory hover:file:bg-white/20" />
            
            {selectedFiles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="relative group">
                    <div className="h-16 w-16 bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden rounded-sm">
                      {file.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-beige uppercase font-label-caps p-1 text-center truncate">{file.name}</span>
                      )}
                    </div>
                    <button type="button" onClick={() => removeFile(i)} className="absolute -top-2 -right-2 h-5 w-5 bg-thread-red text-white flex items-center justify-center rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" disabled={isSubmitting} className="bg-ivory text-espresso px-6 py-3 font-label-caps uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-50">
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}


function ProductAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center cursor-pointer group"
      >
        <span className="font-label-caps text-label-caps uppercase tracking-widest text-ivory group-hover:text-brand-red transition-colors">
          {title}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          className="material-symbols-outlined text-beige"
        >
          add
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 font-body-md text-beige leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ProductClientProps {
  product: Product;
  related: Product[];
  reviews?: any[];
}

export default function ProductClient({ product, related, reviews = [] }: ProductClientProps) {
  const { add } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const gallery = product.gallery || [product.image];
  const isVideo = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov');
  };
  const colors = product.colors || [{ name: "Default", hex: "#131313" }];
  const sizes = product.sizes || ["S", "M", "L"];

  const selectedVariant = product.variants?.find(
    (v) => v.size === selectedSize && v.color === colors[selectedColor].name
  );
  
  const isOutOfStock = product.totalStock === 0 
    ? true 
    : (selectedSize && product.variants && product.variants.length > 0
        ? (selectedVariant ? selectedVariant.stock <= 0 : true)
        : false);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    add(product, selectedSize, colors[selectedColor].name, quantity);
  };

  return (
    <>
      {/* Breadcrumbs */}
      <nav className="px-margin-mobile md:px-margin-desktop pt-6 md:pt-8 mb-6 md:mb-8">
        <ol className="flex items-center gap-2 font-label-caps text-[11px] text-beige uppercase tracking-widest flex-wrap">
          <li>
            <Link href="/" className="hover:text-ivory transition-colors">Home</Link>
          </li>
          <li className="material-symbols-outlined text-[14px]">chevron_right</li>
          <li>
            <Link href="/shop" className="hover:text-ivory transition-colors">Shop</Link>
          </li>
          <li className="material-symbols-outlined text-[14px]">chevron_right</li>
          <li className="text-ivory truncate max-w-[150px] md:max-w-none">{product.name}</li>
        </ol>
      </nav>

      {/* Product Hero — Split Layout */}
      <section className="px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-10 gap-6 md:gap-12 mb-12 md:mb-24">
        {/* Left: Gallery (60%) */}
        <div className="lg:col-span-6 flex flex-col lg:flex-row gap-4">
          {/* Thumbnails */}
          <div className="order-2 lg:order-1 flex lg:flex-col gap-3 overflow-x-auto lg:w-20 shrink-0 pb-2 lg:pb-0">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`w-20 h-20 shrink-0 cursor-pointer overflow-hidden transition-all duration-300 rounded-sm ${
                  selectedImage === i
                    ? "border-2 border-ivory opacity-100"
                    : "border border-white/10 opacity-50 hover:opacity-80"
                }`}
              >
                {isVideo(img) ? (
                  <video src={img} className="w-full h-full object-cover" muted loop playsInline autoPlay />
                ) : (
                  <Image src={img} alt={`${product.name} view ${i + 1}`} width={80} height={80} className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>

          {/* Main Image */}
          <AnimatedWrapper delay={0.1} className="order-1 lg:order-2 flex-grow aspect-[3/4] overflow-hidden relative rounded-md group">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                {isVideo(gallery[selectedImage]) ? (
                  <video
                    src={gallery[selectedImage]}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={gallery[selectedImage]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    quality={80}
                    priority
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                )}
              </motion.div>
            </AnimatePresence>
            
            {product.totalStock === 0 && (
              <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
                <span className="bg-espresso/90 text-white px-6 py-3 font-label-caps text-label-caps uppercase tracking-[0.2em] shadow-lg rounded-sm">
                  Sold Out
                </span>
              </div>
            )}
            
            {gallery.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedImage((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                  aria-label="Previous image"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedImage((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                  aria-label="Next image"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </>
            )}
          </AnimatedWrapper>
        </div>

        {/* Right: Product Info (40%) */}
        <AnimatedWrapper delay={0.3} className="lg:col-span-4 flex flex-col">
          {/* Category */}
          <span className="font-label-caps text-label-caps text-brand-red uppercase tracking-[0.2em] mb-2">
            {product.category || "Collection"}
          </span>

          {/* Title */}
          <h1 className="font-headline-md text-headline-md text-ivory uppercase tracking-wide mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mb-6">
            {product.originalPrice && (
              <span className="line-through text-beige mr-4 font-body-md">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
            )}
            <span className="font-headline-sm text-headline-sm text-brand-red">
              Rs. {product.price.toLocaleString()}
            </span>
          </div>

          {/* Description */}
          <p className="font-body-md text-beige leading-relaxed mb-8">
            {product.description || "A beautifully crafted piece from the LINE&LOOP collection."}
          </p>

          {/* Color Selector */}
          <div className="mb-8">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-beige block mb-3">
              Color: {colors[selectedColor].name}
            </span>
            <div className="flex gap-3">
              {colors.map((color, i) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(i)}
                  title={color.name}
                  className={`w-8 h-8 rounded-full transition-all duration-300 ${
                    selectedColor === i
                      ? "border-2 border-ivory scale-110"
                      : "border border-white/20 hover:border-white/60"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-3">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-beige">Size</span>
              {product.size_guide_url && (
                <button 
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="font-label-caps text-[11px] text-ivory underline underline-offset-4 decoration-white/20 hover:decoration-white transition-all"
                >
                  Size Guide
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-6 py-2.5 font-label-caps text-label-caps transition-all duration-300 rounded-sm ${
                    selectedSize === size
                      ? "bg-ivory text-espresso border border-ivory"
                      : "border border-white/10 text-ivory hover:border-ivory"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-8 flex items-center gap-4">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-beige">Qty</span>
            <div className="flex items-center border border-white/10 rounded-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-ivory hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <span className="px-4 py-2 font-body-md text-ivory min-w-[40px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 text-ivory hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-4 font-label-caps text-label-caps uppercase tracking-[0.2em] rounded-md transition-all duration-500 shadow-lg ${
                isOutOfStock 
                  ? "bg-espresso/50 text-white cursor-not-allowed shadow-none" 
                  : "bg-brand-red text-white hover:bg-white hover:text-brand-red shadow-brand-red/20"
              }`}
            >
              {isOutOfStock ? "Sold Out" : "Add to Bag"}
            </motion.button>
            <WishlistButton 
              productId={product.id} 
              showText={true}
              className="w-full border border-white/20 text-ivory py-4 font-label-caps text-label-caps uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/5 transition-all rounded-md"
            />
          </div>

          {/* Accordions */}
          <div className="mt-12 border-t border-white/10">
            <ProductAccordion title="Description">
              {product.description || "Handcrafted with care using premium materials and traditional techniques."}
            </ProductAccordion>
            <ProductAccordion title="Fabric & Care">
              {product.fabric || "Please refer to the garment label for care instructions."}
            </ProductAccordion>
            <ProductAccordion title="Sizing Guide">
              Our garments are designed with a relaxed, feminine fit. We recommend selecting your usual size. For between-size customers, we suggest sizing up for a more flowing silhouette.
            </ProductAccordion>
            <ProductAccordion title="Shipping & Returns">
              Free nationwide shipping on orders over Rs. 10,000. Returns accepted within 7 days of delivery for unworn items with tags attached.
            </ProductAccordion>
            <ProductAccordion title="Reviews">
              <ReviewsSection productId={product.id} reviews={reviews} />
            </ProductAccordion>
          </div>
        </AnimatedWrapper>
      </section>

      {/* You May Also Like */}
      <section className="bg-ivory py-12 md:py-24 px-margin-mobile md:px-margin-desktop">
        <AnimatedWrapper className="text-center mb-8 md:mb-16">
          <h2 className="font-headline-md text-headline-md uppercase tracking-[0.2em] text-espresso">
            You May Also Like
          </h2>
        </AnimatedWrapper>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {related.map((item, index) => (
            <AnimatedWrapper key={item.id} delay={0.1 * index}>
              <Link href={`/shop/${item.id}`} className="group cursor-pointer block">
                <div className="relative aspect-[3/4] overflow-hidden mb-3 md:mb-4 rounded-md shadow-sm">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    quality={75}
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  {item.tag && (
                    <span className="absolute top-3 left-3 md:top-4 md:left-4 bg-brand-red/90 backdrop-blur-sm text-white px-3 py-1 md:px-4 md:py-1.5 font-label-caps text-[10px] rounded-full tracking-widest">
                      {item.tag}
                    </span>
                  )}
                </div>
                <p className="font-label-caps text-[10px] text-taupe uppercase mb-1 tracking-widest">{item.category || "Category"}</p>
                <p className="font-body-md text-espresso font-medium group-hover:text-brand-red transition-colors text-sm md:text-base">{item.name}</p>
                <p className="font-label-caps text-label-caps text-taupe mt-1">Rs. {item.price.toLocaleString()}</p>
              </Link>
            </AnimatedWrapper>
          ))}
        </div>
      </section>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {isSizeGuideOpen && product.size_guide_url && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsSizeGuideOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] bg-ivory rounded-md overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center p-4 border-b border-ink-black/10">
                <h3 className="font-headline-sm text-espresso uppercase tracking-widest text-lg">Size Guide</h3>
                <button 
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="text-espresso hover:text-brand-red transition-colors material-symbols-outlined"
                >
                  close
                </button>
              </div>
              <div className="p-4 overflow-auto flex-grow flex items-center justify-center bg-white">
                <img 
                  src={product.size_guide_url.startsWith('http') ? product.size_guide_url : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.size_guide_url}`} 
                  alt="Size Guide" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

