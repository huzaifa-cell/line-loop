"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/lib/reviews";
import { cn } from "@/lib/utils";
import UnderlineInput from "@/components/UnderlineInput";
import DashedCTA from "@/components/DashedCTA";

/**
 * Review submission form for the PDP.
 * Gated to verified purchasers — the server action checks if the email has a
 * delivered order containing this product slug. Non-purchasers can still read
 * reviews but cannot submit.
 *
 * Stars are hand-built (plain thin-line, no icon pack) to match the design system.
 */

function Stars({
  value,
  onChange,
  size = "caption",
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: string;
}) {
  return (
    <div className="flex gap-[4px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={cn(
            size,
            "leading-none",
            onChange ? "cursor-pointer" : "cursor-default",
            n <= value ? "text-brand-red" : "opacity-20"
          )}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ReviewForm({ productSlug }: { productSlug: string }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    startTransition(async () => {
      const res = await submitReview({
        productSlug,
        rating,
        title,
        body,
        authorName,
        email,
      });
      if (res.success) {
        setResult({ success: true });
        setRating(0);
        setTitle("");
        setBody("");
      } else {
        setResult({ error: res.error });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[440px] space-y-[var(--spacing-20)]">
      <p className="caption uppercase font-bold">Write a Review</p>
      <p className="caption opacity-60">
        Only verified purchasers (with a delivered order) can review.
      </p>

      {/* Rating selector — hand-built stars */}
      <div>
        <p className="caption uppercase opacity-60 mb-[var(--spacing-10)]">Rating</p>
        <Stars value={rating} onChange={setRating} />
      </div>

      <UnderlineInput
        label="Title"
        name="title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div>
        <label className="caption uppercase opacity-60 block mb-[5px]">Review</label>
        <textarea
          required
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full bg-transparent border border-ink-black/30 p-[var(--spacing-15)] text-base outline-none focus:border-[var(--color-brand-red)] resize-none"
        />
      </div>
      <UnderlineInput
        label="Your Name"
        name="authorName"
        required
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
      />
      <UnderlineInput
        label="Email (for verification)"
        name="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {result?.error && (
        <p className="caption text-brand-red">{result.error}</p>
      )}
      {result?.success && (
        <p className="caption text-brand-red">
          Thank you! Your review has been submitted.
        </p>
      )}

      <DashedCTA type="submit" disabled={isPending || rating === 0}>
        {isPending ? "Submitting…" : "Submit Review"}
      </DashedCTA>
    </form>
  );
}

export { Stars };
