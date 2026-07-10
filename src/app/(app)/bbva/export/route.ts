import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { centsToUnits } from "@/lib/money";

const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
};

function csvCell(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  // Escapa comillas y envuelve siempre entre comillas para soportar ; y saltos.
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET() {
  await assertCan("bbva.view");

  const creditos = await db.creditoBBVA.findMany({
    include: { vehiculo: true },
    orderBy: { fechaFirma: "desc" },
  });

  const headers = ["Nombre", "Cédula", "Vehículo", "Monto solicitado (USD)", "Fecha de firma", "Estado"];
  const rows = creditos.map((c) =>
    [
      csvCell(c.nombre),
      csvCell(c.ci ?? ""),
      csvCell(c.vehiculo ? `${c.vehiculo.marca} ${c.vehiculo.modelo}` : ""),
      csvCell(centsToUnits(c.montoSolicitadoUsdCents).toFixed(2)),
      csvCell(c.fechaFirma ? new Date(c.fechaFirma).toLocaleDateString("es-UY") : ""),
      csvCell(ESTADO_LABELS[c.estado] ?? c.estado),
    ].join(";"),
  );

  // BOM para que Excel detecte UTF-8; separador ";" (formato es-UY).
  const csv = "﻿" + [headers.map(csvCell).join(";"), ...rows].join("\r\n");
  const fecha = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="creditos-bbva-${fecha}.csv"`,
    },
  });
}
