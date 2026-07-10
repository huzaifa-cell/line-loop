"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import UnderlineInput from "@/components/UnderlineInput";
import DashedCTA from "@/components/DashedCTA";

export default function TrackForm({
  initialOrderNumber,
  initialEmail,
}: {
  initialOrderNumber: string;
  initialEmail: string;
}) {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState(initialEmail);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      order: orderNumber.trim(),
      email: email.trim(),
    });
    router.push(`/track-order?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-[var(--spacing-20)]">
      <UnderlineInput
        label="Order Number (e.g. LL-2026-00001)"
        name="orderNumber"
        required
        value={orderNumber}
        onChange={(e) => setOrderNumber(e.target.value)}
      />
      <UnderlineInput
        label="Email Address"
        name="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <DashedCTA type="submit">Track Order</DashedCTA>
    </form>
  );
}
