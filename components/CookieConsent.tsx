"use client";

import { useEffect, useState } from "react";

const KEY = "lineloop-cookie-consent";

/** Bottom-right utility notice — small card, minimal close affordance. */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) {
        const t = setTimeout(() => setVisible(true), 1800);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-30 max-w-xs bg-ivory-mist text-ink-black border border-ink-black p-[var(--spacing-20)]">
      <p className="caption">
        We use cookies for a smoother visit.{" "}
        <span className="link-underline cursor-pointer">Learn more.</span>
      </p>
      <button
        onClick={dismiss}
        className="caption uppercase link-underline mt-[var(--spacing-15)]"
      >
        Accept & Close
      </button>
    </div>
  );
}
