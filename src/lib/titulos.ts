import { convertCents, type Moneda } from "@/lib/money";

// Si la financiación tiene carta de pago, se suma un recargo fijo de $4.000
// (pesos uruguayos) al costo de los títulos.
export const CARTA_DE_PAGO_RECARGO_UYU_CENTS = 400_000;

/** Recargo por carta de pago expresado en la moneda del costo. */
export function recargoCartaDePagoCents(moneda: Moneda, rateMicros: number): number {
  return convertCents(CARTA_DE_PAGO_RECARGO_UYU_CENTS, "UYU", moneda, rateMicros);
}

/** Costo efectivo de títulos = base + recargo por carta de pago (si aplica). */
export function costoTitulosEfectivoCents(
  baseCents: number,
  cartaDePago: boolean,
  moneda: Moneda,
  rateMicros: number,
): number {
  return baseCents + (cartaDePago ? recargoCartaDePagoCents(moneda, rateMicros) : 0);
}
