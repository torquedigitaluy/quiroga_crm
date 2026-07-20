// La patente se paga en 6 cuotas anuales con fechas fijas. Quiroga las paga
// apenas vencen (gestoría/débito automático), así que el sistema no necesita
// que nadie tilde "pagada" a mano: se calcula en base al calendario.
export const PATENTE_VENCIMIENTOS: { mes: number; dia: number }[] = [
  { mes: 1, dia: 10 },
  { mes: 3, dia: 20 },
  { mes: 5, dia: 20 },
  { mes: 7, dia: 20 },
  { mes: 9, dia: 20 },
  { mes: 11, dia: 20 },
];

function vencimientoDate(anio: number, v: { mes: number; dia: number }): Date {
  return new Date(anio, v.mes - 1, v.dia);
}

/**
 * Cantidad de las 6 cuotas anuales que le corresponden a la automotora.
 * Límite superior: si el vehículo ya se entregó, la fecha de entrega (una
 * cuota que vence justo ese día cuenta como paga); si sigue en stock, hoy.
 * Límite inferior: la fecha de compra — las cuotas que vencieron antes de
 * que el vehículo ingresara no son un gasto de la automotora.
 */
export function cuotasPatentePagasAutomaticas(hoy: Date, fechaCompra: Date | null, fechaVenta: Date | null): number {
  const limite = fechaVenta ?? hoy;
  const anio = limite.getFullYear();
  return PATENTE_VENCIMIENTOS.filter((v) => {
    const fecha = vencimientoDate(anio, v);
    if (fecha > limite) return false;
    if (fechaCompra && fecha < fechaCompra) return false;
    return true;
  }).length;
}

/** Próxima fecha de vencimiento a partir de "hoy" (o null si ya pasaron todas este año). */
export function proximoVencimientoPatente(hoy: Date): Date | null {
  const anio = hoy.getFullYear();
  const proximo = PATENTE_VENCIMIENTOS.map((v) => vencimientoDate(anio, v)).find((d) => d > hoy);
  return proximo ?? null;
}
