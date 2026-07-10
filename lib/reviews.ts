"use server";

import { mutateStore, readStore } from "./file-store";
import { getOrdersByEmail } from "./orders";

/**
 * File-based review store. Reviews are submitted on the PDP, gated to verified
 * purchasers (has a delivered order containing the product slug).
 *
 * Derived ratings (avgRating, reviewCount) are calculated on read and can later
 * be cached in the product record when the admin dashboard lands.
 */

export interface Review {
  id: string;
  productSlug: string;
  rating: number; // 1–5
  title: string;
  body: string;
  authorName: string;
  email: string; // used for verification, never displayed
  clerkUserId?: string;
  verified: boolean;
  createdAt: string;
}

type ReviewStore = { reviews: Review[]; counter: number };

const FILE = "reviews.json";

function emptyStore(): ReviewStore {
  return { reviews: [], counter: 0 };
}

/** Get all reviews for a product, newest first. */
export async function getReviewsForProduct(
  productSlug: string
): Promise<Review[]> {
  const store = await readStore<ReviewStore>(FILE, emptyStore());
  return store.reviews
    .filter((r) => r.productSlug === productSlug)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Get derived rating stats for a product. */
export async function getRatingStats(
  productSlug: string
): Promise<{ avgRating: number; reviewCount: number }> {
  const reviews = await getReviewsForProduct(productSlug);
  if (reviews.length === 0) return { avgRating: 0, reviewCount: 0 };
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return {
    avgRating: Math.round((sum / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  };
}

/**
 * Check if an email has a delivered order containing the given product slug.
 * Used to gate review submission to verified purchasers.
 */
export async function isVerifiedPurchaser(
  email: string,
  productSlug: string
): Promise<boolean> {
  const orders = await getOrdersByEmail(email);
  return orders.some(
    (o) =>
      o.status === "DELIVERED" &&
      o.lines.some((l) => l.slug === productSlug)
  );
}

export interface SubmitReviewInput {
  productSlug: string;
  rating: number;
  title: string;
  body: string;
  authorName: string;
  email: string;
  clerkUserId?: string;
}

/** Create a new review. Only verified purchasers can review. */
export async function submitReview(
  input: SubmitReviewInput
): Promise<{ success: boolean; error?: string; review?: Review }> {
  // Validate
  if (input.rating < 1 || input.rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5" };
  }
  if (input.title.trim().length < 3) {
    return { success: false, error: "Title is too short" };
  }
  if (input.body.trim().length < 10) {
    return { success: false, error: "Review is too short" };
  }

  // Verify purchaser
  const verified = await isVerifiedPurchaser(input.email, input.productSlug);

  const now = new Date().toISOString();

  const store = await mutateStore<ReviewStore>(FILE, emptyStore(), (current) => {
    const counter = current.counter + 1;
    const review: Review = {
      id: `review-${counter}`,
      productSlug: input.productSlug,
      rating: input.rating,
      title: input.title.trim(),
      body: input.body.trim(),
      authorName: input.authorName.trim() || "Anonymous",
      email: input.email.toLowerCase(),
      clerkUserId: input.clerkUserId,
      verified,
      createdAt: now,
    };
    return {
      reviews: [...current.reviews, review],
      counter,
    };
  });

  const review = store.reviews[store.reviews.length - 1];
  return { success: true, review };
}
