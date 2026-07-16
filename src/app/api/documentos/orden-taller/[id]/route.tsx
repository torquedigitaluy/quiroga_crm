import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { assertCanAny } from "@/lib/permissions/engine";
import { OrdenTallerPDF } from "@/components/pdf/OrdenTallerPDF";
import { ESTADO_ORDEN_CONFIG } from "@/components/taller/OrdenEstadoBadge";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await assertCanAny(["taller.view", "taller.view_ordenes"]);
  const { id } = await params;

  const orden = await db.ordenTaller.findUnique({
    where: { id },
    include: {
      vehiculo: true,
      repuestos: true,
      gastos: true,
      checklist: { orderBy: { orden: "asc" } },
      tecnicoResponsable: true,
      revisadoPor: true,
    },
  });

  if (!orden) {
    return new Response("Orden de taller no encontrada", { status: 404 });
  }

  const vehiculoLabel = orden.vehMarca
    ? `${orden.vehMarca} ${orden.vehModelo ?? ""}`.trim()
    : orden.vehiculo
      ? `${orden.vehiculo.marca} ${orden.vehiculo.modelo}`
      : (orden.vehiculoExterno ?? "Vehículo externo");

  const buffer = await renderToBuffer(
    <OrdenTallerPDF
      data={{
        numeroOrden: orden.numeroOrden,
        prioridad: orden.prioridad,
        createdAt: orden.createdAt,
        vehiculoLabel,
        matricula: orden.vehMatricula ?? orden.vehiculo?.matricula ?? null,
        vehAnio: orden.vehAnio ?? orden.vehiculo?.anio ?? null,
        vehVersion: orden.vehVersion ?? orden.vehiculo?.version ?? null,
        vehColor: orden.vehColor ?? orden.vehiculo?.color ?? null,
        vehKm: orden.vehKm ?? orden.vehiculo?.km ?? null,
        vehChasis: orden.vehChasis,
        clienteNombre: orden.clienteNombre,
        clienteTelefono: orden.clienteTelefono,
        clienteDireccion: orden.clienteDireccion,
        tiposServicio: orden.tiposServicio,
        tipoServicioOtro: orden.tipoServicioOtro,
        estado: ESTADO_ORDEN_CONFIG[orden.estado]?.label ?? orden.estado,
        fechaIngreso: orden.fechaIngreso,
        fechaFinalizacion: orden.fechaFinalizacion,
        problema: orden.problema,
        trabajosRealizados: orden.trabajosRealizados,
        observaciones: orden.observaciones,
        manoDeObraCents: orden.manoDeObraCents,
        repuestos: orden.repuestos,
        gastos: orden.gastos,
        checklist: orden.checklist,
        tecnicoResponsableNombre: orden.tecnicoResponsable?.nombre ?? orden.responsable ?? null,
        tecnicoResponsableFecha: orden.tecnicoResponsableFecha,
        revisadoPorNombre: orden.revisadoPor?.nombre ?? null,
        revisadoAprobado: orden.revisadoAprobado,
        revisadoAt: orden.revisadoAt,
        clienteFirmaDataUrl: orden.clienteFirmaDataUrl,
        clienteFirmaFecha: orden.clienteFirmaFecha,
      }}
    />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orden-taller-${orden.numeroOrden}.pdf"`,
    },
  });
}
