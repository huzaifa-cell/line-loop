/**
 * LINE&LOOP — product catalog (Pakistani handmade ladies' garments).
 *
 * Prices are integers in PKR (minor currency unit — PKR is effectively
 * subdivision-free, so 1 = 1 rupee). See lib/utils.ts -> formatPrice.
 *
 * NOTE on the two image shapes: `images: ProductImage[]` is the structured
 * source of truth (spec Section 6: ordered, primary + hover/alternate). The
 * flat `image` / `gallery` fields are convenience mirrors so existing display
 * components can read a primary URL without unpacking the array. Phase B
 * rebuilds cards/PDP around `images` directly.
 *
 * Variants carry real `inventoryCount` so stock urgency ("Only N left") and
 * checkout inventory decrement are honest, not fabricated.
 */

export type Category =
  | "Kurtis & Tops"
  | "Shalwar Kameez"
  | "Trousers & Bottoms"
  | "Dupattas & Stoles";

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface Variant {
  id: string;
  size: string;
  color: string;
  sku: string;
  inventoryCount: number;
  priceOverride?: number; // PKR integer; omitted = use product.price
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: "LINE&LOOP";
  category: Category;
  description: string;
  price: number; // PKR integer
  compareAtPrice?: number; // PKR integer; original price if on sale
  // Structured detail fields (spec Section 6)
  fabricComposition: string;
  careInstructions: string;
  fitNotes: string;
  images: ProductImage[]; // ordered; [0] primary, [1] hover/alternate
  variants: Variant[];
  status: ProductStatus;
  tags: string[];
  rating: number; // avg (1-5); seeded, later derived from reviews
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  featured?: boolean;
  // Derived convenience mirror: true when every variant is at zero stock.
  // Kept in sync from inventory (see derive step below), never hardcoded.
  soldOut?: boolean;
  // Convenience mirrors for existing display components
  image: string;
  gallery?: string[];
  colours: string[];
  sizes: string[];
  fabric: string; // short descriptor (cards)
  care: string; // short care line
  craft: string; // technique
  artisan: string; // maker / atelier
}

export const CATEGORIES: Category[] = [
  "Kurtis & Tops",
  "Shalwar Kameez",
  "Trousers & Bottoms",
  "Dupattas & Stoles",
];

/** Low-stock threshold — below this, the PDP shows honest "Only N left". */
export const LOW_STOCK_THRESHOLD = 3;

const u = (id: string, w = 1000, h = 1250) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

/** Build a variant matrix for a size list × single default color, with stock. */
function variants(
  prefix: string,
  color: string,
  sizes: string[],
  stockBySize: Record<string, number> | number
): Variant[] {
  return sizes.map((size, i) => ({
    id: `${prefix}-${color}-${size}`.toLowerCase().replace(/\s+/g, "-"),
    size,
    color,
    sku: `${prefix}-${i + 1}`.toUpperCase(),
    inventoryCount:
      typeof stockBySize === "number"
        ? Math.max(0, stockBySize - i)
        : stockBySize[size] ?? 0,
  }));
}

/** Total sellable inventory across all variants. */
export function totalInventory(p: Product): number {
  return p.variants.reduce((n, v) => n + v.inventoryCount, 0);
}

/** A product is sold out only when every variant is at zero. */
export function isSoldOut(p: Product): boolean {
  return totalInventory(p) === 0;
}

export const products: Product[] = deriveSoldOut([
  {
    id: "p01",
    slug: "hand-embroidered-cotton-kurti-ivory",
    name: "Hand-Embroidered Cotton Kurti — Ivory",
    brand: "LINE&LOOP",
    category: "Kurtis & Tops",
    description:
      "A breathable cotton kurti finished by hand with shadow-work embroidery along the neckline. Cut for everyday wear, stitched in our atelier one piece at a time.",
    price: 4200,
    compareAtPrice: 5200,
    fabricComposition: "100% handloom cotton",
    careInstructions: "Hand wash cold. Iron on reverse. Do not bleach.",
    fitNotes: "Relaxed fit. True to size — order your usual.",
    images: [
      { url: u("photo-1583391733981-3d1c0e9a8d9e"), alt: "Ivory embroidered cotton kurti" },
      { url: u("photo-1602810318383-e386572f5ebb"), alt: "Alternate view" },
    ],
    variants: variants("HEC", "Ivory", ["XS", "S", "M", "L", "XL"], {
      XS: 4, S: 2, M: 6, L: 3, XL: 0,
    }),
    status: "ACTIVE",
    tags: ["embroidered", "everyday", "natural-dye"],
    rating: 4.7,
    reviewCount: 41,
    createdAt: "2025-09-01",
    updatedAt: "2026-06-20",
    featured: true,
    image: u("photo-1583391733981-3d1c0e9a8d9e"),
    gallery: [u("photo-1583391733981-3d1c0e9a8d9e"), u("photo-1525507119028-ed4c629a60a3")],
    colours: ["Ivory", "Mint"],
    sizes: ["XS", "S", "M", "L", "XL"],
    fabric: "Handloom cotton",
    craft: "Shadow-work hand embroidery",
    care: "Hand wash cold. Iron on reverse.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p02",
    slug: "ajrakh-block-print-kurti-indigo",
    name: "Ajrakh Block-Print Kurti — Indigo",
    brand: "LINE&LOOP",
    category: "Kurtis & Tops",
    description:
      "Geometric Ajrakh printed by hand over sixteen stages of natural dye. A kurti with weight, meaning, and a pattern that lives in the cloth itself.",
    price: 5600,
    fabricComposition: "Cotton voile, natural dyes",
    careInstructions: "Hand wash cold separately. Colours may settle with wear.",
    fitNotes: "Regular fit with side slits.",
    images: [
      { url: u("photo-1564257577154-757c5c3d8e8d"), alt: "Indigo Ajrakh block-print kurti" },
      { url: u("photo-1583391733956-6c78276477e2"), alt: "Alternate view" },
    ],
    variants: variants("AJK", "Indigo", ["XS", "S", "M", "L", "XL"], 7),
    status: "ACTIVE",
    tags: ["ajrakh", "block-print", "natural-dye"],
    rating: 4.8,
    reviewCount: 33,
    createdAt: "2025-09-08",
    updatedAt: "2026-06-18",
    featured: true,
    image: u("photo-1564257577154-757c5c3d8e8d"),
    gallery: [u("photo-1564257577154-757c5c3d8e8d")],
    colours: ["Indigo", "Madder"],
    sizes: ["XS", "S", "M", "L", "XL"],
    fabric: "Cotton voile",
    craft: "Hand block-printed Ajrakh, 16 dye stages",
    care: "Hand wash cold separately.",
    artisan: "The Khatri block-printers, Sindh",
  },
  {
    id: "p03",
    slug: "stonewashed-linen-ayan-kurti",
    name: "Stonewashed Linen Ayan Kurti",
    brand: "LINE&LOOP",
    category: "Kurtis & Tops",
    description:
      "Crisp stonewashed linen cut for ease, with French seams and a clean placket. The piece you reach for on repeat.",
    price: 4900,
    fabricComposition: "100% stonewashed linen",
    careInstructions: "Machine wash cold. Hang to dry.",
    fitNotes: "Relaxed, straight cut.",
    images: [
      { url: u("photo-1525507119028-ed4c629a60a3"), alt: "Stonewashed linen kurti" },
      { url: u("photo-1551803091-e20673f15770"), alt: "Alternate view" },
    ],
    variants: variants("LIN", "Sand", ["S", "M", "L", "XL"], { S: 5, M: 4, L: 2, XL: 1 }),
    status: "ACTIVE",
    tags: ["linen", "everyday"],
    rating: 4.6,
    reviewCount: 27,
    createdAt: "2025-09-12",
    updatedAt: "2026-06-10",
    image: u("photo-1525507119028-ed4c629a60a3"),
    gallery: [u("photo-1525507119028-ed4c629a60a3")],
    colours: ["Sand", "Charcoal"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "100% stonewashed linen",
    craft: "Tailored by hand, French seams",
    care: "Machine wash cold. Hang dry.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p04",
    slug: "mulmul-tunic-mustard",
    name: "Mulmul Tunic — Mustard",
    brand: "LINE&LOOP",
    category: "Kurtis & Tops",
    description:
      "Featherweight mulmul in a warm mustard, dyed by hand. A short tunic that pairs as easily with trousers as with jeans.",
    price: 3400,
    fabricComposition: "Mulmul cotton",
    careInstructions: "Hand wash cold.",
    fitNotes: "Relaxed, hip-length.",
    images: [
      { url: u("photo-1572804013309-59a88b7e92f1"), alt: "Mustard mulmul tunic" },
      { url: u("photo-1503342217505-b0a15ec3261c"), alt: "Alternate view" },
    ],
    variants: variants("MUL", "Mustard", ["XS", "S", "M", "L"], 9),
    status: "ACTIVE",
    tags: ["mulmul", "natural-dye", "everyday"],
    rating: 4.5,
    reviewCount: 18,
    createdAt: "2025-09-15",
    updatedAt: "2026-06-05",
    image: u("photo-1572804013309-59a88b7e92f1"),
    gallery: [u("photo-1572804013309-59a88b7e92f1")],
    colours: ["Mustard", "Olive"],
    sizes: ["XS", "S", "M", "L"],
    fabric: "Mulmul cotton",
    craft: "Hand-dyed, hand-stitched",
    care: "Hand wash cold.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p05",
    slug: "bandhani-peplum-kurti-maroon",
    name: "Bandhani Peplum Kurti — Maroon",
    brand: "LINE&LOOP",
    category: "Kurtis & Tops",
    description:
      "A tie-dyed bandhani peplum in deep maroon, gathered at the waist and finished by hand. Festive without being loud.",
    price: 6200,
    fabricComposition: "Silk-cotton blend",
    careInstructions: "Dry clean recommended.",
    fitNotes: "Fitted bodice, flared hem. Size up if between sizes.",
    images: [
      { url: u("photo-1610030469983-98e550d6193c"), alt: "Maroon bandhani peplum kurti" },
      { url: u("photo-1583743814966-8936f5b7be1a"), alt: "Alternate view" },
    ],
    variants: variants("BND", "Maroon", ["S", "M", "L", "XL"], { S: 0, M: 1, L: 2, XL: 0 }),
    status: "ACTIVE",
    tags: ["bandhani", "festive"],
    rating: 4.9,
    reviewCount: 12,
    createdAt: "2025-09-20",
    updatedAt: "2026-06-22",
    featured: true,
    image: u("photo-1610030469983-98e550d6193c"),
    gallery: [u("photo-1610030469983-98e550d6193c")],
    colours: ["Maroon", "Black"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Silk-cotton blend",
    craft: "Hand tie-dyed bandhani",
    care: "Dry clean recommended.",
    artisan: "The Khatri bandhani makers, Sindh",
  },
  {
    id: "p06",
    slug: "chikankari-unstitched-kameez-ivory",
    name: "Chikankari Kameez Set — Ivory",
    brand: "LINE&LOOP",
    category: "Shalwar Kameez",
    description:
      "A full shalwar kameez set on mulmul, hand-embroidered in Lucknowi chikankari across the bodice and sleeves. Quiet, considered, ours.",
    price: 12500,
    compareAtPrice: 14000,
    fabricComposition: "Mulmul cotton; cotton dupatta",
    careInstructions: "Hand wash cold. Iron on reverse.",
    fitNotes: "Unstitched margins; tailoring to your measurements available on request.",
    images: [
      { url: u("photo-1583391733981-3d1c0e9a8d9e"), alt: "Ivory chikankari shalwar kameez set" },
      { url: u("photo-1595777457583-95e059d581b8"), alt: "Alternate view" },
    ],
    variants: variants("CHK", "Ivory", ["S", "M", "L", "XL"], { S: 3, M: 2, L: 4, XL: 1 }),
    status: "ACTIVE",
    tags: ["chikankari", "festive", "set"],
    rating: 4.8,
    reviewCount: 22,
    createdAt: "2025-08-25",
    updatedAt: "2026-06-15",
    featured: true,
    image: u("photo-1583391733981-3d1c0e9a8d9e"),
    gallery: [u("photo-1583391733981-3d1c0e9a8d9e"), u("photo-1595777457583-95e059d581b8")],
    colours: ["Ivory", "Powder"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Mulmul cotton, 3-piece set",
    craft: "Lucknowi chikankari hand embroidery",
    care: "Hand wash cold. Iron on reverse.",
    artisan: "The Lucknow Chikankari Collective",
  },
  {
    id: "p07",
    slug: "khadi-shalwar-kameez-olive",
    name: "Khadi Shalwar Kameez — Olive",
    brand: "LINE&LOOP",
    category: "Shalwar Kameez",
    description:
      "Handspun khadi cut into a two-piece — straight kameez and tapered shalwar. Earthy, structured, and made to be worn for years.",
    price: 9800,
    fabricComposition: "Handspun khadi cotton",
    careInstructions: "Hand wash cold.",
    fitNotes: "Straight kameez, tapered shalwar. True to size.",
    images: [
      { url: u("photo-1595777457583-95e059d581b8"), alt: "Olive khadi shalwar kameez" },
      { url: u("photo-1490481651871-ab68de25d43d"), alt: "Alternate view" },
    ],
    variants: variants("KHD", "Olive", ["XS", "S", "M", "L", "XL"], 6),
    status: "ACTIVE",
    tags: ["khadi", "everyday", "set"],
    rating: 4.7,
    reviewCount: 19,
    createdAt: "2025-08-30",
    updatedAt: "2026-06-12",
    image: u("photo-1595777457583-95e059d581b8"),
    gallery: [u("photo-1595777457583-95e059d581b8")],
    colours: ["Olive", "Stone"],
    sizes: ["XS", "S", "M", "L", "XL"],
    fabric: "Handspun khadi, 2-piece",
    craft: "Hand-woven, hand-stitched",
    care: "Hand wash cold.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p08",
    slug: "block-print-lawn-suit-sapphire",
    name: "Block-Print Lawn Suit — Sapphire",
    brand: "LINE&LOOP",
    category: "Shalwar Kameez",
    description:
      "Summer lawn printed with carved teak blocks in sapphire and white. Light as air, finished with a cotton dupatta.",
    price: 7400,
    fabricComposition: "Pure cotton lawn; cotton dupatta",
    careInstructions: "Hand wash cold separately.",
    fitNotes: "Relaxed straight cut.",
    images: [
      { url: u("photo-1551803091-e20673f15770"), alt: "Sapphire block-print lawn suit" },
      { url: u("photo-1610189000919-d8c937c1f63a"), alt: "Alternate view" },
    ],
    variants: variants("LWN", "Sapphire", ["S", "M", "L", "XL"], { S: 2, M: 5, L: 4, XL: 0 }),
    status: "ACTIVE",
    tags: ["lawn", "summer", "block-print", "set"],
    rating: 4.6,
    reviewCount: 24,
    createdAt: "2025-09-02",
    updatedAt: "2026-06-08",
    featured: true,
    image: u("photo-1551803091-e20673f15770"),
    gallery: [u("photo-1551803091-e20673f15770")],
    colours: ["Sapphire", "White"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Cotton lawn, 3-piece",
    craft: "Hand block-printed",
    care: "Hand wash cold separately.",
    artisan: "The Bagru printer families",
  },
  {
    id: "p09",
    slug: "silk-formal-kameez-charcoal",
    name: "Silk Formal Kameez — Charcoal",
    brand: "LINE&LOOP",
    category: "Shalwar Kameez",
    description:
      "A formal kameez in raw silk, minimal in line, with hand-finished seams and a concealed placket. Made for the evenings that matter.",
    price: 16500,
    fabricComposition: "Raw silk",
    careInstructions: "Dry clean only.",
    fitNotes: "Tailored fit. Made to order — allow two weeks.",
    images: [
      { url: u("photo-1490481651871-ab68de25d43d"), alt: "Charcoal silk formal kameez" },
      { url: u("photo-1583391733956-6c78276477e2"), alt: "Alternate view" },
    ],
    variants: variants("SLK", "Charcoal", ["S", "M", "L", "XL"], { S: 0, M: 0, L: 0, XL: 0 }),
    status: "ACTIVE",
    tags: ["silk", "formal", "made-to-order"],
    rating: 4.9,
    reviewCount: 8,
    createdAt: "2025-09-18",
    updatedAt: "2026-06-01",
    image: u("photo-1490481651871-ab68de25d43d"),
    gallery: [u("photo-1490481651871-ab68de25d43d")],
    colours: ["Charcoal", "Black"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Raw silk",
    craft: "Tailored by hand",
    care: "Dry clean only.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p10",
    slug: "printed-cotton-suit-terracotta",
    name: "Printed Cotton Suit — Terracotta",
    brand: "LINE&LOOP",
    category: "Shalwar Kameez",
    description:
      "A everyday three-piece in soft cotton, screen-printed by hand in terracotta. Washes well, wears better.",
    price: 6800,
    fabricComposition: "Cotton cambric; cotton dupatta",
    careInstructions: "Machine wash cold, gentle.",
    fitNotes: "Relaxed straight cut.",
    images: [
      { url: u("photo-1572804013309-59a88b7e92f1"), alt: "Terracotta printed cotton suit" },
      { url: u("photo-1503342217505-b0a15ec3261c"), alt: "Alternate view" },
    ],
    variants: variants("PRT", "Terracotta", ["S", "M", "L", "XL"], 8),
    status: "ACTIVE",
    tags: ["cotton", "everyday", "set"],
    rating: 4.4,
    reviewCount: 15,
    createdAt: "2025-09-22",
    updatedAt: "2026-05-28",
    image: u("photo-1572804013309-59a88b7e92f1"),
    gallery: [u("photo-1572804013309-59a88b7e92f1")],
    colours: ["Terracotta", "Rust"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Cotton cambric, 3-piece",
    craft: "Hand screen-printed",
    care: "Machine wash cold, gentle.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p11",
    slug: "wide-leg-trousers-stone",
    name: "Wide-Leg Trousers — Stone",
    brand: "LINE&LOOP",
    category: "Trousers & Bottoms",
    description:
      "High-waisted wide-leg trousers in stonewashed cotton. Clean lines, a deep hem, and a pull-on waistband for ease.",
    price: 3800,
    fabricComposition: "Stonewashed cotton twill",
    careInstructions: "Machine wash cold. Hang dry.",
    fitNotes: "High waist, wide leg. True to size.",
    images: [
      { url: u("photo-1503342217505-b0a15ec3261c"), alt: "Stone wide-leg trousers" },
      { url: u("photo-1551803091-e20673f15770"), alt: "Alternate view" },
    ],
    variants: variants("WLT", "Stone", ["XS", "S", "M", "L", "XL"], { XS: 3, S: 2, M: 4, L: 1, XL: 0 }),
    status: "ACTIVE",
    tags: ["trousers", "everyday"],
    rating: 4.6,
    reviewCount: 31,
    createdAt: "2025-09-05",
    updatedAt: "2026-06-14",
    featured: true,
    image: u("photo-1503342217505-b0a15ec3261c"),
    gallery: [u("photo-1503342217505-b0a15ec3261c")],
    colours: ["Stone", "Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    fabric: "Stonewashed cotton twill",
    craft: "Tailored by hand",
    care: "Machine wash cold. Hang dry.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p12",
    slug: "straight-cotton-trousers-black",
    name: "Straight Cotton Trousers — Black",
    brand: "LINE&LOOP",
    category: "Trousers & Bottoms",
    description:
      "A tailored straight trouser in black cotton with a clean front and a modest flare. The everyday base layer.",
    price: 3200,
    fabricComposition: "Cotton twill",
    careInstructions: "Machine wash cold.",
    fitNotes: "Mid-rise, straight leg.",
    images: [
      { url: u("photo-1551803091-e20673f15770"), alt: "Black straight cotton trousers" },
      { url: u("photo-1503342217505-b0a15ec3261c"), alt: "Alternate view" },
    ],
    variants: variants("SCT", "Black", ["XS", "S", "M", "L", "XL"], 10),
    status: "ACTIVE",
    tags: ["trousers", "everyday", "essential"],
    rating: 4.5,
    reviewCount: 26,
    createdAt: "2025-09-10",
    updatedAt: "2026-06-09",
    image: u("photo-1551803091-e20673f15770"),
    gallery: [u("photo-1551803091-e20673f15770")],
    colours: ["Black", "Charcoal"],
    sizes: ["XS", "S", "M", "L", "XL"],
    fabric: "Cotton twill",
    craft: "Tailored by hand",
    care: "Machine wash cold.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p13",
    slug: "linen-culottes-sage",
    name: "Linen Culottes — Sage",
    brand: "LINE&LOOP",
    category: "Trousers & Bottoms",
    description:
      "Cropped wide culottes in sage linen, pleated at the waist and cropped at the ankle. Cool, structured, and easy.",
    price: 4100,
    fabricComposition: "100% linen",
    careInstructions: "Machine wash cold. Hang dry.",
    fitNotes: "Mid-rise, cropped.",
    images: [
      { url: u("photo-1525507119028-ed4c629a60a3"), alt: "Sage linen culottes" },
      { url: u("photo-1572804013309-59a88b7e92f1"), alt: "Alternate view" },
    ],
    variants: variants("CUL", "Sage", ["S", "M", "L"], { S: 2, M: 1, L: 3 }),
    status: "ACTIVE",
    tags: ["linen", "trousers"],
    rating: 4.7,
    reviewCount: 14,
    createdAt: "2025-09-14",
    updatedAt: "2026-06-04",
    image: u("photo-1525507119028-ed4c629a60a3"),
    gallery: [u("photo-1525507119028-ed4c629a60a3")],
    colours: ["Sage", "Sand"],
    sizes: ["S", "M", "L"],
    fabric: "100% linen",
    craft: "Tailored by hand",
    care: "Machine wash cold. Hang dry.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p14",
    slug: "tapered-shalwar-natural",
    name: "Tapered Shalwar — Natural",
    brand: "LINE&LOOP",
    category: "Trousers & Bottoms",
    description:
      "A traditional tapered shalwar in undyed cotton, cut full through the seat and narrowed at the ankle. Heritage cut, modern hand.",
    price: 2900,
    fabricComposition: "Undyed cotton",
    careInstructions: "Hand wash cold.",
    fitNotes: "Traditional shalwar fit.",
    images: [
      { url: u("photo-1610189000919-d8c937c1f63a"), alt: "Natural tapered shalwar" },
      { url: u("photo-1503342217505-b0a15ec3261c"), alt: "Alternate view" },
    ],
    variants: variants("SHL", "Natural", ["S", "M", "L", "XL"], 7),
    status: "ACTIVE",
    tags: ["shalwar", "everyday"],
    rating: 4.4,
    reviewCount: 21,
    createdAt: "2025-09-19",
    updatedAt: "2026-05-30",
    image: u("photo-1610189000919-d8c937c1f63a"),
    gallery: [u("photo-1610189000919-d8c937c1f63a")],
    colours: ["Natural", "Black"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Undyed cotton",
    craft: "Tailored by hand",
    care: "Hand wash cold.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p15",
    slug: "silk-dupatta-rose",
    name: "Silk Dupatta — Rose",
    brand: "LINE&LOOP",
    category: "Dupattas & Stoles",
    description:
      "A featherweight silk dupatta in rose, hand-dyed and finished with a fine stitched border. Drapes soft, wears light.",
    price: 4500,
    fabricComposition: "Mulberry silk",
    careInstructions: "Dry clean only.",
    fitNotes: "2.5m length.",
    images: [
      { url: u("photo-1583391733956-6c78276477e2"), alt: "Rose silk dupatta" },
      { url: u("photo-1583743814966-8936f5b7be1a"), alt: "Alternate view" },
    ],
    variants: variants("SDP", "Rose", ["Free Size"], 5),
    status: "ACTIVE",
    tags: ["silk", "dupatta", "festive"],
    rating: 4.8,
    reviewCount: 17,
    createdAt: "2025-08-28",
    updatedAt: "2026-06-16",
    featured: true,
    image: u("photo-1583391733956-6c78276477e2"),
    gallery: [u("photo-1583391733956-6c78276477e2")],
    colours: ["Rose", "Plum"],
    sizes: ["Free Size"],
    fabric: "Mulberry silk, 2.5m",
    craft: "Hand-dyed, hand-finished border",
    care: "Dry clean only.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p16",
    slug: "cotton-block-print-dupatta-indigo",
    name: "Block-Print Cotton Dupatta — Indigo",
    brand: "LINE&LOOP",
    category: "Dupattas & Stoles",
    description:
      "A cotton dupatta block-printed by hand in indigo, finished with a hand-rolled hem. Pairs with the Ajrakh kurti or stands alone.",
    price: 2800,
    fabricComposition: "Cotton voile, natural dyes",
    careInstructions: "Hand wash cold separately.",
    fitNotes: "2.25m length.",
    images: [
      { url: u("photo-1564257577154-757c5c3d8e8d"), alt: "Indigo block-print cotton dupatta" },
      { url: u("photo-1610030469983-98e550d6193c"), alt: "Alternate view" },
    ],
    variants: variants("BDP", "Indigo", ["Free Size"], 8),
    status: "ACTIVE",
    tags: ["dupatta", "block-print", "natural-dye"],
    rating: 4.6,
    reviewCount: 13,
    createdAt: "2025-09-03",
    updatedAt: "2026-06-07",
    image: u("photo-1564257577154-757c5c3d8e8d"),
    gallery: [u("photo-1564257577154-757c5c3d8e8d")],
    colours: ["Indigo", "Natural"],
    sizes: ["Free Size"],
    fabric: "Cotton voile, 2.25m",
    craft: "Hand block-printed",
    care: "Hand wash cold separately.",
    artisan: "The Khatri block-printers, Sindh",
  },
  {
    id: "p17",
    slug: "wool-shawl-camel",
    name: "Handwoven Wool Shawl — Camel",
    brand: "LINE&LOOP",
    category: "Dupattas & Stoles",
    description:
      "A handwoven wool shawl in warm camel, finished with a knotted fringe. Made for the cold months, built to outlast them.",
    price: 5400,
    fabricComposition: "Handwoven wool",
    careInstructions: "Dry clean recommended.",
    fitNotes: "2m length, generous width.",
    images: [
      { url: u("photo-1490481651871-ab68de25d43d"), alt: "Camel wool shawl" },
      { url: u("photo-1583391733956-6c78276477e2"), alt: "Alternate view" },
    ],
    variants: variants("WSH", "Camel", ["Free Size"], { "Free Size": 2 }),
    status: "ACTIVE",
    tags: ["wool", "shawl", "winter"],
    rating: 4.9,
    reviewCount: 9,
    createdAt: "2025-09-25",
    updatedAt: "2026-06-19",
    image: u("photo-1490481651871-ab68de25d43d"),
    gallery: [u("photo-1490481651871-ab68de25d43d")],
    colours: ["Camel", "Charcoal"],
    sizes: ["Free Size"],
    fabric: "Handwoven wool, 2m",
    craft: "Hand-woven, knotted fringe",
    care: "Dry clean recommended.",
    artisan: "The Northern weavers",
  },
  {
    id: "p18",
    slug: "mulmul-stole-blush",
    name: "Mulmul Stole — Blush",
    brand: "LINE&LOOP",
    category: "Dupattas & Stoles",
    description:
      "A soft mulmul stole in blush, light enough for summer and finished with a thin embroidered edge. The everyday companion.",
    price: 1900,
    fabricComposition: "Mulmul cotton",
    careInstructions: "Hand wash cold.",
    fitNotes: "2m length.",
    images: [
      { url: u("photo-1583743814966-8936f5b7be1a"), alt: "Blush mulmul stole" },
      { url: u("photo-1572804013309-59a88b7e92f1"), alt: "Alternate view" },
    ],
    variants: variants("MST", "Blush", ["Free Size"], 12),
    status: "ACTIVE",
    tags: ["mulmul", "stole", "everyday"],
    rating: 4.3,
    reviewCount: 11,
    createdAt: "2025-09-28",
    updatedAt: "2026-05-25",
    image: u("photo-1583743814966-8936f5b7be1a"),
    gallery: [u("photo-1583743814966-8936f5b7be1a")],
    colours: ["Blush", "Ivory"],
    sizes: ["Free Size"],
    fabric: "Mulmul cotton, 2m",
    craft: "Hand-stitched, embroidered edge",
    care: "Hand wash cold.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p19",
    slug: "handloom-cotton-kurti-teal",
    name: "Handloom Cotton Kurti — Teal",
    brand: "LINE&LOOP",
    category: "Kurtis & Tops",
    description:
      "A handloom cotton kurti in teal with a woven selvedge and a clean neckline. Restrained colour, honest cloth.",
    price: 4600,
    fabricComposition: "Handloom cotton",
    careInstructions: "Hand wash cold.",
    fitNotes: "Relaxed straight cut.",
    images: [
      { url: u("photo-1610189000919-d8c937c1f63a"), alt: "Teal handloom cotton kurti" },
      { url: u("photo-1583391733981-3d1c0e9a8d9e"), alt: "Alternate view" },
    ],
    variants: variants("HCK", "Teal", ["S", "M", "L", "XL"], { S: 0, M: 2, L: 1, XL: 0 }),
    status: "ACTIVE",
    tags: ["handloom", "everyday"],
    rating: 4.5,
    reviewCount: 16,
    createdAt: "2025-10-01",
    updatedAt: "2026-06-11",
    image: u("photo-1610189000919-d8c937c1f63a"),
    gallery: [u("photo-1610189000919-d8c937c1f63a")],
    colours: ["Teal", "Black"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Handloom cotton",
    craft: "Hand-woven, hand-stitched",
    care: "Hand wash cold.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p20",
    slug: "embroidered-tunic-dusty-rose",
    name: "Embroidered Tunic — Dusty Rose",
    brand: "LINE&LOOP",
    category: "Kurtis & Tops",
    description:
      "A dusty-rose tunic with fine thread embroidery along the yoke. Soft in colour, quiet in detail.",
    price: 3900,
    compareAtPrice: 4600,
    fabricComposition: "Cotton cambric",
    careInstructions: "Hand wash cold. Iron on reverse.",
    fitNotes: "Relaxed, hip-length.",
    images: [
      { url: u("photo-1595777457583-95e059d581b8"), alt: "Dusty rose embroidered tunic" },
      { url: u("photo-1525507119028-ed4c629a60a3"), alt: "Alternate view" },
    ],
    variants: variants("ETR", "Dusty Rose", ["XS", "S", "M", "L"], 6),
    status: "ACTIVE",
    tags: ["embroidered", "everyday"],
    rating: 4.4,
    reviewCount: 20,
    createdAt: "2025-10-04",
    updatedAt: "2026-06-03",
    image: u("photo-1595777457583-95e059d581b8"),
    gallery: [u("photo-1595777457583-95e059d581b8")],
    colours: ["Dusty Rose", "Ivory"],
    sizes: ["XS", "S", "M", "L"],
    fabric: "Cotton cambric",
    craft: "Hand thread embroidery",
    care: "Hand wash cold. Iron on reverse.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p21",
    slug: "everyday-cotton-suit-blush",
    name: "Everyday Cotton Suit — Blush",
    brand: "LINE&LOOP",
    category: "Shalwar Kameez",
    description:
      "A soft blush three-piece in everyday cotton — straight kameez, tapered shalwar, and a matching dupatta. The weekday uniform.",
    price: 7200,
    fabricComposition: "Cotton cambric; cotton dupatta",
    careInstructions: "Machine wash cold, gentle.",
    fitNotes: "Relaxed straight cut.",
    images: [
      { url: u("photo-1583743814966-8936f5b7be1a"), alt: "Blush everyday cotton suit" },
      { url: u("photo-1572804013309-59a88b7e92f1"), alt: "Alternate view" },
    ],
    variants: variants("ECS", "Blush", ["S", "M", "L", "XL"], 9),
    status: "ACTIVE",
    tags: ["cotton", "everyday", "set"],
    rating: 4.5,
    reviewCount: 23,
    createdAt: "2025-10-07",
    updatedAt: "2026-05-27",
    image: u("photo-1583743814966-8936f5b7be1a"),
    gallery: [u("photo-1583743814966-8936f5b7be1a")],
    colours: ["Blush", "Sage"],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Cotton cambric, 3-piece",
    craft: "Tailored by hand",
    care: "Machine wash cold, gentle.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
  {
    id: "p22",
    slug: "pleated-cotton-trousers-ivory",
    name: "Pleated Cotton Trousers — Ivory",
    brand: "LINE&LOOP",
    category: "Trousers & Bottoms",
    description:
      "Pleated front, tapered leg, in ivory cotton. A clean, warm-weather trouser that dresses up or down.",
    price: 3600,
    fabricComposition: "Cotton twill",
    careInstructions: "Hand wash cold.",
    fitNotes: "Mid-rise, tapered.",
    images: [
      { url: u("photo-1503342217505-b0a15ec3261c"), alt: "Ivory pleated cotton trousers" },
      { url: u("photo-1551803091-e20673f15770"), alt: "Alternate view" },
    ],
    variants: variants("PCT", "Ivory", ["XS", "S", "M", "L"], { XS: 1, S: 0, M: 2, L: 1 }),
    status: "ACTIVE",
    tags: ["trousers", "everyday"],
    rating: 4.3,
    reviewCount: 10,
    createdAt: "2025-10-10",
    updatedAt: "2026-05-22",
    image: u("photo-1503342217505-b0a15ec3261c"),
    gallery: [u("photo-1503342217505-b0a15ec3261c")],
    colours: ["Ivory", "Black"],
    sizes: ["XS", "S", "M", "L"],
    fabric: "Cotton twill",
    craft: "Tailored by hand",
    care: "Hand wash cold.",
    artisan: "The LINE&LOOP atelier, Lahore",
  },
]);

/**
 * Derive the `soldOut` mirror from inventory for every product.
 * A function declaration so it is hoisted and usable in the array initialiser.
 */
function deriveSoldOut(list: Product[]): Product[] {
  return list.map((p) => ({ ...p, soldOut: isSoldOut(p) }));
}

/* ------------------------------ accessors ------------------------------ */

export function getAllProducts(): Product[] {
  return products.filter((p) => p.status === "ACTIVE");
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug && p.status === "ACTIVE");
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeatured(limit = 8): Product[] {
  return getAllProducts()
    .filter((p) => p.featured)
    .slice(0, limit);
}

export function getByCategory(category: Category | "All" | string): Product[] {
  if (!category || category === "All") return getAllProducts();
  if (!CATEGORIES.includes(category as Category)) return [];
  return getAllProducts().filter((p) => p.category === (category as Category));
}

/** Every colour offered across the catalog, for the Shop filter sidebar. */
export function getAllColors(): string[] {
  return Array.from(new Set(getAllProducts().flatMap((p) => p.colours))).sort();
}

/** Every size offered across the catalog, for the Shop filter sidebar. */
export function getAllSizes(): string[] {
  const order = ["XS", "S", "M", "L", "XL", "Free Size"];
  const present = new Set(getAllProducts().flatMap((p) => p.sizes));
  return order.filter((s) => present.has(s));
}

export function getRelated(slug: string, limit = 4): Product[] {
  const current = getProduct(slug);
  if (!current) return getAllProducts().slice(0, limit);
  return getAllProducts()
    .filter((p) => p.slug !== slug && p.category === current.category)
    .concat(getAllProducts().filter((p) => p.slug !== slug && p.category !== current.category))
    .slice(0, limit);
}

/** Lowest inventory across a product's variants (for stock-urgency text). */
export function lowestVariantStock(p: Product): number {
  return p.variants.reduce((min, v) => Math.min(min, v.inventoryCount), Infinity);
}

/** Price ranges for the Shop sidebar filter. */
export const PRICE_RANGES = [
  { label: "Under Rs 3,000", min: 0, max: 2999 },
  { label: "Rs 3,000 – Rs 5,000", min: 3000, max: 5000 },
  { label: "Rs 5,000 – Rs 10,000", min: 5001, max: 10000 },
  { label: "Over Rs 10,000", min: 10001, max: Infinity },
] as const;
