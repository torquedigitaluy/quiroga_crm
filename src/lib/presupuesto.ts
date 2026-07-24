type LineaMoneda = { precioCents: number; cantidad: number; moneda: "UYU" | "USD" };

export function totalesPresupuesto(aceites: LineaMoneda[], articulos: LineaMoneda[]): { uyuCents: number; usdCents: number } {
  let uyuCents = 0;
  let usdCents = 0;
  for (const item of [...aceites, ...articulos]) {
    const total = item.precioCents * item.cantidad;
    if (item.moneda === "USD") usdCents += total;
    else uyuCents += total;
  }
  return { uyuCents, usdCents };
}
