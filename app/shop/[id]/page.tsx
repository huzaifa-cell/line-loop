import { getStorefrontProduct, getFeaturedProducts } from "@/lib/storefront";
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getStorefrontProduct(id);

  if (!product) {
    notFound();
  }

  const related = await getFeaturedProducts(4);
  const filteredRelated = related.filter(p => p.id !== product.id).slice(0, 4);

  return <ProductClient product={product} related={filteredRelated} />;
}
