import { convertCents, type Moneda } from "./money";

export type GastoLineLike = { moneda: Moneda; montoCents: number };

export type CosteoInput = {
  tipoCambioMicros: number;
  precioCompraUsdCents: number;
  precioVentaRealUsdCents: number;
};

const GANANCIA_IDEAL_PORCENTAJE = 0.15;

export function resolveRateMicros(costeoRateMicros: number, configRateMicros: number): number {
  return costeoRateMicros > 0 ? costeoRateMicros : configRateMicros;
}

export function computeCosteo(costeo: CosteoInput, gastos: GastoLineLike[], configRateMicros: number) {
  const rateMicros = resolveRateMicros(costeo.tipoCambioMicros, configRateMicros);

  const totalGastosUsdCents = gastos.reduce(
    (sum, g) => sum + convertCents(g.montoCents, g.moneda, "USD", rateMicros),
    0,
  );

  const costoTotalUsdCents = costeo.precioCompraUsdCents + totalGastosUsdCents;
  const gananciaIdealUsdCents = Math.round(costoTotalUsdCents * GANANCIA_IDEAL_PORCENTAJE);
  const precioVentaIdealUsdCents = costoTotalUsdCents + gananciaIdealUsdCents;
  const gananciaFinalUsdCents = costeo.precioVentaRealUsdCents - costoTotalUsdCents;

  return {
    rateMicros,
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
