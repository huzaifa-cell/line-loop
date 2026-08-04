"use client";

import { useWishlist } from "@/lib/wishlist";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  showText?: boolean;
}

export function WishlistButton({ productId, className, showText = false }: WishlistButtonProps) {
  const { items, isLoaded, toggleItem } = useWishlist();

  const isFavorited = items.includes(productId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic UI toggle is handled instantly inside the context action
    await toggleItem(productId);
  };

  if (!isLoaded) {
    // Render disabled/loading state silently
    return (
       <button disabled className={cn("opacity-50 cursor-not-allowed", className)}>
         <span className="material-symbols-outlined">favorite</span>
         {showText && (
          <span className="font-label-caps text-label-caps uppercase tracking-[0.2em]">
            Add to Wishlist
          </span>
         )}
       </button>
    );
  }

  return (
    <motion.button 
      whileTap={{ scale: 0.9 }}
      onClick={handleToggle}
      className={cn(
        "flex items-center justify-center gap-3 transition-colors", 
        isFavorited ? "text-brand-red" : "text-ivory hover:bg-white/5",
        className
      )}
    >
      <span className={cn(
        "material-symbols-outlined text-[20px] transition-all",
        isFavorited && "fill-current font-variation-settings-'FILL'_1"
      )}>
        favorite
      </span>
      {showText && (
        <span className="font-label-caps text-label-caps uppercase tracking-[0.2em]">
          {isFavorited ? "Saved" : "Add to Wishlist"}
        </span>
      )}
    </motion.button>
  );
}
