import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { OrdenTallerPDF } from "@/components/pdf/OrdenTallerPDF";
import { ESTADO_ORDEN_CONFIG, TIPO_SERVICIO_LABELS } from "@/components/taller/OrdenEstadoBadge";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await assertCan("taller.view");
  const { id } = await params;

  const orden = await db.ordenTaller.findUnique({
    where: { id },
    include: { vehiculo: true, repuestos: true, gastos: true, checklist: { orderBy: { orden: "asc" } } },
  });

  if (!orden) {
    return new Response("Orden de taller no encontrada", { status: 404 });
  }

  const vehiculoLabel = orden.vehiculo
    ? `${orden.vehiculo.marca} ${orden.vehiculo.modelo} ${orden.vehiculo.version ?? ""}`.trim()
    : (orden.vehiculoExterno ?? "Vehículo externo");

  const buffer = await renderToBuffer(
    <OrdenTallerPDF
      data={{
        vehiculoLabel,
        matricula: orden.vehiculo?.matricula ?? null,
        tipoServicio: TIPO_SERVICIO_LABELS[orden.tipoServicio] ?? orden.tipoServicio,
        estado: ESTADO_ORDEN_CONFIG[orden.estado].label,
        fechaIngreso: orden.fechaIngreso,
        fechaFinalizacion: orden.fechaFinalizacion,
        problema: orden.problema,
        trabajosRealizados: orden.trabajosRealizados,
        observaciones: orden.observaciones,
        responsable: orden.responsable,
        manoDeObraCents: orden.manoDeObraCents,
        repuestos: orden.repuestos,
        gastos: orden.gastos,
        checklist: orden.checklist,
      }}
    />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orden-taller-${id}.pdf"`,
    },
  });
}
