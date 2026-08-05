export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  tag?: 'SALE' | 'NEW';
  category?: string;
  description?: string;
  fabric?: string;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  gallery?: string[];
  variants?: { id: string; color: string; size: string; stock: number }[];
  size_guide_url?: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Asymmetric Linen Dress',
    price: 28500,
    category: 'Dresses',
    description: 'A flowing linen silhouette with an asymmetric hemline that moves beautifully with every step. Hand-dyed using natural indigo for a soft, lived-in finish.',
    fabric: '100% European Linen. Machine wash cold, hang dry. Iron while slightly damp.',
    colors: [{ name: 'Onyx', hex: '#131313' }, { name: 'Pearl', hex: '#F5F5F5' }, { name: 'Sand', hex: '#C2B280' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1597983073750-16f5ded1321f?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1597983073750-16f5ded1321f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1614098097306-c67b8020c04e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1622049605334-72e1e4432346?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1522276280767-ce4a7715cf46?auto=format&fit=crop&q=80&w=800',
    ]
  },
  {
    id: '2',
    name: 'Silk Structured Blouse',
    price: 19000,
    originalPrice: 24000,
    tag: 'SALE',
    category: 'Kurtis & Tops',
    description: 'Precision-tailored in pure silk with a structured mandarin collar. The subtle sheen of the fabric catches light beautifully, making it perfect for evening wear.',
    fabric: '100% Pure Silk. Dry clean only. Iron on low heat.',
    colors: [{ name: 'Burgundy', hex: '#722F37' }, { name: 'Ivory', hex: '#FFFFF0' }],
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1614098097306-c67b8020c04e?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1614098097306-c67b8020c04e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1597983073750-16f5ded1321f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1622049605334-72e1e4432346?auto=format&fit=crop&q=80&w=800',
    ]
  },
  {
    id: '3',
    name: 'Embroidered Cotton Kurti',
    price: 14500,
    category: 'Kurtis & Tops',
    description: 'A testament to artisanal mastery, this pure cotton kurti features intricate hand-embroidery inspired by heritage motifs. Designed for a modern silhouette with timeless appeal.',
    fabric: '100% Organic Cotton. Machine wash cold, tumble dry low.',
    colors: [{ name: 'Onyx', hex: '#131313' }, { name: 'Terracotta', hex: '#CC5E3B' }, { name: 'Sage', hex: '#9CAF88' }],
    sizes: ['XS', 'S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1622049605334-72e1e4432346?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1622049605334-72e1e4432346?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1597983073750-16f5ded1321f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1614098097306-c67b8020c04e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1522276280767-ce4a7715cf46?auto=format&fit=crop&q=80&w=800',
    ]
  },
  {
    id: '4',
    name: 'Wide-Leg Linen Jumpsuit',
    price: 31000,
    tag: 'NEW',
    category: 'Dresses',
    description: 'Effortless elegance in a single piece. This wide-leg jumpsuit is cut from premium linen with a relaxed, architectural drape that flatters every silhouette.',
    fabric: '100% European Linen. Dry clean recommended.',
    colors: [{ name: 'Chalk', hex: '#EBEBEB' }, { name: 'Onyx', hex: '#131313' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1522276280767-ce4a7715cf46?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1522276280767-ce4a7715cf46?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1597983073750-16f5ded1321f?auto=format&fit=crop&q=80&w=800',
    ]
  },
  {
    id: '5',
    name: 'Tailored Wool Blazer',
    price: 45000,
    category: 'Outerwear',
    description: 'A masterfully tailored blazer in premium Italian wool. Single-breasted with a nipped waist and soft shoulders for a refined, feminine structure.',
    fabric: '100% Italian Wool. Dry clean only.',
    colors: [{ name: 'Charcoal', hex: '#36454F' }, { name: 'Camel', hex: '#C19A6B' }],
    sizes: ['S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1680506660555-1c225f5da953?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1680506660555-1c225f5da953?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1597983073750-16f5ded1321f?auto=format&fit=crop&q=80&w=800',
    ]
  },
  {
    id: '6',
    name: 'Pleated Midi Skirt',
    price: 22500,
    category: 'Bottoms',
    description: 'Delicate accordion pleats fall gracefully to a midi length, creating beautiful movement. Finished with an elasticated waistband for all-day comfort.',
    fabric: '100% Polyester Chiffon. Hand wash cold.',
    colors: [{ name: 'Dusty Rose', hex: '#DCAE96' }, { name: 'Black', hex: '#000000' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1717007404665-fc3a4da9fb48?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1717007404665-fc3a4da9fb48?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1614098097306-c67b8020c04e?auto=format&fit=crop&q=80&w=800',
    ]
  },
  {
    id: '7',
    name: 'Cashmere Wrap',
    price: 35000,
    category: 'Accessories',
    description: 'Luxuriously soft Mongolian cashmere, woven into a generous wrap that drapes beautifully over any outfit. The perfect finishing layer for elegance.',
    fabric: '100% Mongolian Cashmere. Dry clean only.',
    colors: [{ name: 'Oatmeal', hex: '#D4C5A9' }, { name: 'Onyx', hex: '#131313' }, { name: 'Burgundy', hex: '#722F37' }],
    sizes: ['One Size'],
    image: 'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&q=80&w=800',
    ]
  },
  {
    id: '8',
    name: 'Minimalist Leather Tote',
    price: 52000,
    category: 'Accessories',
    description: 'Hand-stitched from full-grain vegetable-tanned leather. Designed with clean lines and a spacious interior, this tote ages beautifully over time.',
    fabric: 'Full-grain Vegetable-tanned Leather. Wipe with a dry cloth.',
    colors: [{ name: 'Cognac', hex: '#9A463D' }, { name: 'Onyx', hex: '#131313' }],
    sizes: ['One Size'],
    image: 'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1503160865267-af4660ce7bf2?auto=format&fit=crop&q=80&w=800',
    ]
  }
];
