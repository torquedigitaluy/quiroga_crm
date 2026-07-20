import { convertCents, type Moneda } from "./money";
import { cuotasPatentePagasAutomaticas } from "./patente";

export type GastoLineLike = { moneda: Moneda; montoCents: number };

export type CosteoInput = {
  tipoCambioMicros: number;
  precioCompraUsdCents: number;
  precioVentaRealUsdCents: number;
  // Fechas para calcular cuántas cuotas de patente cargó la automotora.
  fechaCompra?: Date | null;
  fechaVenta?: Date | null;
};

export type PatenteCosteoInput = {
  patenteCuotaCents: number | null;
  patenteNoSumar: boolean;
};

const GANANCIA_IDEAL_PORCENTAJE = 0.15;

export function resolveRateMicros(costeoRateMicros: number, configRateMicros: number): number {
  return costeoRateMicros > 0 ? costeoRateMicros : configRateMicros;
}

/**
 * Costo de patente que le corresponde a la automotora (en USD): las cuotas que
 * vencen entre la compra y hoy (o la venta), por el valor de cuota cargado en el
 * stock. Devuelve 0 si está marcada como "no sumar" o no tiene valor de cuota.
 */
export function patentePagaUsdCents(
  patente: PatenteCosteoInput,
  fechaCompra: Date | null,
  fechaVenta: Date | null,
  rateMicros: number,
  hoy: Date = new Date(),
): number {
  if (patente.patenteNoSumar || !patente.patenteCuotaCents) return 0;
  const cuotas = cuotasPatentePagasAutomaticas(hoy, fechaCompra, fechaVenta);
  if (cuotas <= 0) return 0;
  return convertCents(cuotas * patente.patenteCuotaCents, "UYU", "USD", rateMicros);
}

export function computeCosteo(
  costeo: CosteoInput,
  gastos: GastoLineLike[],
  configRateMicros: number,
  patente?: PatenteCosteoInput | null,
  hoy: Date = new Date(),
) {
  const rateMicros = resolveRateMicros(costeo.tipoCambioMicros, configRateMicros);

  const gastosUsdCents = gastos.reduce(
    (sum, g) => sum + convertCents(g.montoCents, g.moneda, "USD", rateMicros),
    0,
  );

  const patenteUsdCents = patente
    ? patentePagaUsdCents(patente, costeo.fechaCompra ?? null, costeo.fechaVenta ?? null, rateMicros, hoy)
    : 0;

  // La patente forma parte del total de gastos (y por lo tanto del costo total).
  const totalGastosUsdCents = gastosUsdCents + patenteUsdCents;
  const costoTotalUsdCents = costeo.precioCompraUsdCents + totalGastosUsdCents;
  const gananciaIdealUsdCents = Math.round(costoTotalUsdCents * GANANCIA_IDEAL_PORCENTAJE);
  const precioVentaIdealUsdCents = costoTotalUsdCents + gananciaIdealUsdCents;
  const gananciaFinalUsdCents = costeo.precioVentaRealUsdCents - costoTotalUsdCents;

  return {
    rateMicros,
    gastosUsdCents,
    patenteUsdCents,
    totalGastosUsdCents,
    costoTotalUsdCents,
    gananciaIdealUsdCents,
    precioVentaIdealUsdCents,
    gananciaFinalUsdCents,
  };
}

export function gastoLineUsdCents(gasto: GastoLineLike, rateMicros: number): number {
  return convertCents(gasto.montoCents, gasto.moneda, "USD", rateMicros);
}
