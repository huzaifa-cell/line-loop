export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Currency — Pakistani Rupee. PKR is subdivision-free, so 1 = 1 rupee.
// One line to change if the brand ever expands region.
export const CURRENCY = "Rs";

export function formatPrice(amount: number): string {
  return `${CURRENCY} ${amount.toLocaleString("en-PK")}`;
}
