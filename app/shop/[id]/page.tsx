import { getStorefrontProduct, getFeaturedProducts, getApprovedReviews } from "@/lib/storefront";
import { notFound } from "next/navigation";
import ProductClient from "./ProductClient";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getStorefrontProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.description || `Buy ${product.name} at LINE&LOOP. Handmade garments, made slowly.`,
    openGraph: {
      title: product.name,
      description: product.description || `Buy ${product.name} at LINE&LOOP. Handmade garments, made slowly.`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 1067,
          alt: product.name,
        }
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getStorefrontProduct(id);

  if (!product) {
    notFound();
  }

  const related = await getFeaturedProducts(4);
  const filteredRelated = related.filter(p => p.id !== product.id).slice(0, 4);

  const reviews = await getApprovedReviews(product.id);

  return <ProductClient product={product} related={filteredRelated} reviews={reviews} />;
}
