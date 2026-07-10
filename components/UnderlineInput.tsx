"use client";

import { cn } from "@/lib/utils";
import { useId } from "react";

/**
 * Underline-only input — the spec's form field style.
 * No border, no box, no radius — just a bottom border that turns Thread Red
 * on focus. Used across checkout, account, and newsletter forms.
 */
export default function UnderlineInput({
  label,
  name,
  type = "text",
  required,
  placeholder,
  autoComplete,
  value,
  onChange,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("relative", className)}>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent border-b border-ink-black/30 py-[var(--spacing-15)] text-base leading-[1.8] outline-none transition-colors placeholder:text-ink-black/40 focus:border-[var(--color-brand-red)]"
        aria-label={label}
      />
      <label
        htmlFor={id}
        className="caption uppercase absolute top-0 left-0 opacity-60 pointer-events-none"
      >
        {label}
      </label>
    </div>
  );
}
