// All money is stored as integer cents. Never use Float for money.
// Exchange rates are stored as integer "micros" scaled by 10000
// (e.g. 40.50 -> 405000) to avoid floating point entirely.

export type Moneda = "UYU" | "USD";

const RATE_SCALE = 10000;

export function centsToUnits(cents: number): number {
  return cents / 100;
}

export function unitsToCents(units: number): number {
  return Math.round(units * 100);
}

export function rateToMicros(rate: number): number {
  return Math.round(rate * RATE_SCALE);
}

export function microsToRate(micros: number): number {
  return micros / RATE_SCALE;
}

/** Converts an amount (in cents, in `from` currency) to cents in the other currency, using a UYU-per-USD rate given in micros. */
export function convertCents(
  amountCents: number,
  from: Moneda,
  to: Moneda,
  rateMicros: number,
): number {
  if (from === to) return amountCents;
  const rate = microsToRate(rateMicros);
  if (from === "UYU" && to === "USD") {
    return Math.round(amountCents / rate);
  }
  // USD -> UYU
  return Math.round(amountCents * rate);
}

export function formatCents(cents: number, moneda: Moneda): string {
  const units = centsToUnits(cents);
  const formatted = new Intl.NumberFormat("es-UY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(units));
  const sign = units < 0 ? "-" : "";
  const prefix = moneda === "USD" ? "U$D " : "$ ";
  return `${sign}${prefix}${formatted}`;
}

export function formatRate(rateMicros: number): string {
  return microsToRate(rateMicros).toFixed(2);
}

/** Parses a user-typed amount like "9,490.50" or "9490.5" into cents. */
export function parseAmountToCents(input: string): number {
  const cleaned = input.replace(/[^\d.,-]/g, "").replace(/,/g, "");
  const value = parseFloat(cleaned);
  if (Number.isNaN(value)) return 0;
  return unitsToCents(value);
}
