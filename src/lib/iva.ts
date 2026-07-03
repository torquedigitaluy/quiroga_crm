export type IvaRate = "EXENTO" | "DIEZ" | "VEINTIDOS";

const RATE_VALUE: Record<IvaRate, number> = {
  EXENTO: 0,
  DIEZ: 0.1,
  VEINTIDOS: 0.22,
};

export const IVA_RATE_LABELS: Record<IvaRate, string> = {
  EXENTO: "Exento",
  DIEZ: "10%",
  VEINTIDOS: "22%",
};

/** Given a gross (IVA-inclusive) total, back-calculates the net amount and the IVA portion. */
export function calcularIva(importeTotalCents: number, rate: IvaRate): { netoCents: number; ivaCents: number } {
  const r = RATE_VALUE[rate];
  if (r === 0) return { netoCents: importeTotalCents, ivaCents: 0 };
  const netoCents = Math.round(importeTotalCents / (1 + r));
  return { netoCents, ivaCents: importeTotalCents - netoCents };
}
