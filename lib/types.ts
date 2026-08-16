export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  tag?: 'SALE' | 'NEW';
  category?: string;
  description?: string;
  productDetails?: string;
  fabric?: string;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  gallery?: string[];
  variants?: { id: string; color: string; size: string; stock: number }[];
  size_guide_url?: string;
  totalStock?: number;
}
