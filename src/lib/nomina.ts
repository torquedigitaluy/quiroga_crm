export type AsistenciaEstado = "PRESENTE" | "MEDIO_DIA" | "LICENCIA" | "ENFERMO" | "AUSENTE";

export type EmpleadoPagoInput = {
  tipoPago: "MENSUAL" | "JORNAL";
  sueldoMensualCents: number | null;
  jornalDiarioCents: number | null;
};

/** Monthly pay: MENSUAL employees earn their flat salary regardless of a few
 * absences (matches how the business already runs payroll — attendance is
 * tracked for oversight, not as a per-day payroll deduction). JORNAL
 * employees (day laborers) are paid per day actually worked, with a half
 * day counting as 0.5. Ad-hoc deductions (adelantos, multas) always apply. */
export function computeMonthlyPay(
  empleado: EmpleadoPagoInput,
  asistencias: { estado: AsistenciaEstado }[],
  descuentosCents: number,
): { basePayCents: number; descuentosCents: number; totalCents: number; diasTrabajados: number } {
  let basePayCents = 0;
  let diasTrabajados = 0;

  if (empleado.tipoPago === "MENSUAL") {
    basePayCents = empleado.sueldoMensualCents ?? 0;
    diasTrabajados = asistencias.filter((a) => a.estado === "PRESENTE").length + 0.5 * asistencias.filter((a) => a.estado === "MEDIO_DIA").length;
  } else {
    const presentes = asistencias.filter((a) => a.estado === "PRESENTE").length;
    const medios = asistencias.filter((a) => a.estado === "MEDIO_DIA").length;
    diasTrabajados = presentes + 0.5 * medios;
    basePayCents = Math.round((empleado.jornalDiarioCents ?? 0) * diasTrabajados);
  }

  return {
    basePayCents,
    descuentosCents,
    totalCents: basePayCents - descuentosCents,
    diasTrabajados,
  };
}
