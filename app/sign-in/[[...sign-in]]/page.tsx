import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function SignInPage() {
  return (
    <section className="bg-warm-parchment py-[var(--spacing-80)]">
      <div className="mx-auto max-w-[440px] px-6">
        <h1 className="text-[32px] font-bold leading-none mb-[var(--spacing-30)] text-center">
          Sign In
        </h1>
        <p className="caption text-center opacity-60 mb-[var(--spacing-30)]">
          Access your orders, wishlist, and saved details.
        </p>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: "dashed-cta",
              card: "bg-transparent shadow-none",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "caption uppercase border border-ink-black/30 px-[var(--spacing-15)] py-[8px]",
              formFieldLabel: "caption uppercase opacity-60",
              formFieldInput:
                "bg-transparent border-b border-ink-black/30 py-[var(--spacing-15)] text-base outline-none focus:border-[var(--color-brand-red)]",
              footerActionLink: "caption uppercase",
              logoBox: "hidden",
            },
          }}
        />
      </div>
    </section>
  );
}
