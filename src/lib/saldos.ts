export type MovimientoLike = {
  tipo: "INGRESO" | "EGRESO";
  montoPesosCents: number;
  montoUsdCents: number;
};

/** Running balance for an account: saldo inicial + ingresos - egresos, kept separately per currency. */
export function computeSaldos(
  saldoInicialPesosCents: number,
  saldoInicialUsdCents: number,
  movimientos: MovimientoLike[],
): { saldoPesosCents: number; saldoUsdCents: number } {
  let saldoPesosCents = saldoInicialPesosCents;
  let saldoUsdCents = saldoInicialUsdCents;

  for (const m of movimientos) {
    const sign = m.tipo === "INGRESO" ? 1 : -1;
    saldoPesosCents += sign * m.montoPesosCents;
    saldoUsdCents += sign * m.montoUsdCents;
  }

  return { saldoPesosCents, saldoUsdCents };
}
