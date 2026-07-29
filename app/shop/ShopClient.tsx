"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { AnimatedWrapper } from "@/components/AnimatedWrapper";
import { Product } from "@/lib/mockData";
import Image from "next/image";
import Link from "next/link";

export default function ShopClient({ products }: { products: Product[] }) {
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sizeFilter, setSizeFilter] = useState<string>("");
  const [colorFilter, setColorFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>(""); // 'price_asc', 'price_desc', 'newest'
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjust based on grid layout, 8 looks good

  // Derive filter options dynamically
  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean))), [products]) as string[];
  const sizes = useMemo(() => Array.from(new Set(products.flatMap(p => p.sizes || []).filter(Boolean))), [products]) as string[];
  const colors = useMemo(() => Array.from(new Set(products.flatMap(p => (p.colors || []).map(c => c.name)).filter(Boolean))), [products]) as string[];

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products;

    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (sizeFilter) {
      result = result.filter(p => p.sizes?.includes(sizeFilter));
    }
    if (colorFilter) {
      result = result.filter(p => p.colors?.some(c => c.name === colorFilter));
    }

    if (sortBy === 'price_asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      // Products are returned newest first by default in our supabase query
    }

    return result;
  }, [products, categoryFilter, sizeFilter, colorFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Effect to reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, sizeFilter, colorFilter, sortBy]);

  const isVideo = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov');
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => prev === name ? null : name);
  };

  return (
    <>
      {/* Filter & Sort Bar */}
      <div className="sticky top-14 md:top-20 z-40 bg-espresso/95 backdrop-blur-md border-b border-mocha px-margin-mobile md:px-margin-desktop py-3 md:py-4 flex flex-wrap md:flex-row justify-between items-center gap-2 md:gap-4" ref={dropdownRef}>
        <div className="flex gap-4 md:gap-8 overflow-visible relative">
          
          {/* Category Dropdown */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('category')}
              className="flex items-center gap-2 font-label-caps text-label-caps text-beige hover:text-ivory transition-colors whitespace-nowrap"
            >
              {categoryFilter ? `CATEGORY: ${categoryFilter.toUpperCase()}` : 'CATEGORY'} <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            {openDropdown === 'category' && (
              <div className="absolute top-full left-0 mt-4 w-48 bg-espresso border border-mocha rounded shadow-lg z-50 py-2">
                <button onClick={() => { setCategoryFilter(""); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${!categoryFilter ? 'text-ivory bg-mocha/50' : 'text-beige hover:bg-mocha hover:text-ivory'}`}>All Categories</button>
                {categories.map(c => (
                  <button key={c} onClick={() => { setCategoryFilter(c); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${categoryFilter === c ? 'text-ivory bg-mocha/50' : 'text-beige hover:bg-mocha hover:text-ivory'}`}>{c}</button>
                ))}
              </div>
            )}
          </div>

          {/* Size Dropdown */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('size')}
              className="flex items-center gap-2 font-label-caps text-label-caps text-beige hover:text-ivory transition-colors whitespace-nowrap"
            >
              {sizeFilter ? `SIZE: ${sizeFilter}` : 'SIZE'} <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            {openDropdown === 'size' && (
              <div className="absolute top-full left-0 mt-4 w-48 bg-espresso border border-mocha rounded shadow-lg z-50 py-2">
                <button onClick={() => { setSizeFilter(""); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${!sizeFilter ? 'text-ivory bg-mocha/50' : 'text-beige hover:bg-mocha hover:text-ivory'}`}>All Sizes</button>
                {sizes.map(s => (
                  <button key={s} onClick={() => { setSizeFilter(s); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${sizeFilter === s ? 'text-ivory bg-mocha/50' : 'text-beige hover:bg-mocha hover:text-ivory'}`}>{s}</button>
                ))}
              </div>
            )}
          </div>

          {/* Color Dropdown */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('color')}
              className="flex items-center gap-2 font-label-caps text-label-caps text-beige hover:text-ivory transition-colors whitespace-nowrap"
            >
              {colorFilter ? `COLOR: ${colorFilter.toUpperCase()}` : 'COLOR'} <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            {openDropdown === 'color' && (
              <div className="absolute top-full left-0 mt-4 w-48 bg-espresso border border-mocha rounded shadow-lg z-50 py-2">
                <button onClick={() => { setColorFilter(""); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${!colorFilter ? 'text-ivory bg-mocha/50' : 'text-beige hover:bg-mocha hover:text-ivory'}`}>All Colors</button>
                {colors.map(c => (
                  <button key={c} onClick={() => { setColorFilter(c); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${colorFilter === c ? 'text-ivory bg-mocha/50' : 'text-beige hover:bg-mocha hover:text-ivory'}`}>{c}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 relative">
          <span className="font-body-md text-taupe text-sm">{filteredProducts.length} PRODUCTS</span>
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('sort')}
              className="flex items-center gap-2 font-label-caps text-label-caps text-ivory"
            >
              SORT BY <span className="material-symbols-outlined text-[16px]">sort</span>
            </button>
            {openDropdown === 'sort' && (
              <div className="absolute top-full right-0 mt-4 w-48 bg-espresso border border-mocha rounded shadow-lg z-50 py-2">
                <button onClick={() => { setSortBy(""); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${!sortBy ? 'text-ivory bg-mocha/50' : 'text-beige hover:bg-mocha hover:text-ivory'}`}>Newest</button>
                <button onClick={() => { setSortBy("price_asc"); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === 'price_asc' ? 'text-ivory bg-mocha/50' : 'text-beige hover:bg-mocha hover:text-ivory'}`}>Price: Low to High</button>
                <button onClick={() => { setSortBy("price_desc"); setOpenDropdown(null); }} className={`w-full text-left px-4 py-2 text-sm transition-colors ${sortBy === 'price_desc' ? 'text-ivory bg-mocha/50' : 'text-beige hover:bg-mocha hover:text-ivory'}`}>Price: High to Low</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section className="bg-ivory py-8 md:py-16 px-margin-mobile md:px-margin-desktop min-h-screen">
        {paginatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 md:gap-x-6 gap-y-8 md:gap-y-16">
            {paginatedProducts.map((product, index) => (
              <AnimatedWrapper key={product.id} delay={0.1 * (index % 4)}>
                <Link href={`/shop/${product.id}`} className="group cursor-pointer block">
                  <div className="relative aspect-[3/4] overflow-hidden mb-3 md:mb-5 rounded-md shadow-sm">
                    {isVideo(product.image) ? (
                      <video 
                        src={product.image}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        muted
                        loop
                        playsInline
                        autoPlay
                      />
                    ) : (
                      <Image 
                        src={product.image} 
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        quality={75}
                        priority={index < 4}
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    )}
                    {product.tag && (
                      <span className="absolute top-3 left-3 md:top-4 md:left-4 bg-brand-red/90 backdrop-blur-sm text-white px-3 py-1 md:px-4 md:py-1.5 font-label-caps text-[10px] rounded-full tracking-widest">
                        {product.tag}
                      </span>
                    )}
                    {/* Quick Add Hover Effect */}
                    <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <button className="w-full bg-ivory/95 backdrop-blur text-espresso font-button text-[12px] py-3 rounded-sm hover:bg-brand-red hover:text-white transition-colors">
                        VIEW PRODUCT
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="font-body-md font-medium tracking-wide text-espresso text-sm md:text-base">{product.name}</h3>
                    <p className="font-body-md text-taupe text-sm md:text-base">
                      {product.originalPrice && <span className="line-through text-beige mr-3">Rs. {product.originalPrice.toLocaleString()}</span>}
                      Rs. {product.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              </AnimatedWrapper>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 flex flex-col items-center">
            <span className="material-symbols-outlined text-4xl text-beige mb-4">search_off</span>
            <h3 className="font-display-md text-espresso mb-2">No products found</h3>
            <p className="font-body-md text-taupe mb-6">Try adjusting your filters to find what you're looking for.</p>
            <button 
              onClick={() => { setCategoryFilter(""); setSizeFilter(""); setColorFilter(""); setSortBy(""); }}
              className="text-espresso border-b border-espresso pb-1 font-label-caps text-sm hover:text-brand-red hover:border-brand-red transition-colors"
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        )}

        {/* Dynamic Pagination - Only show if more than 1 page */}
        {totalPages > 1 && (
          <AnimatedWrapper delay={0.2} className="mt-12 md:mt-24 flex justify-center items-center gap-4">
            <button 
              onClick={() => {
                setCurrentPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === 1}
              className={`transition-colors ${currentPage === 1 ? 'text-taupe/30 cursor-not-allowed' : 'text-taupe hover:text-espresso'}`}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            {Array.from({ length: totalPages }).map((_, i) => (
              <button 
                key={i}
                onClick={() => {
                  setCurrentPage(i + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-full font-body-md text-sm transition-colors ${
                  currentPage === i + 1 
                    ? 'bg-espresso text-ivory' 
                    : 'text-taupe hover:bg-beige/30'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => {
                setCurrentPage(p => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={currentPage === totalPages}
              className={`transition-colors ${currentPage === totalPages ? 'text-taupe/30 cursor-not-allowed' : 'text-taupe hover:text-espresso'}`}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </AnimatedWrapper>
        )}
      </section>
    </>
  );
}
