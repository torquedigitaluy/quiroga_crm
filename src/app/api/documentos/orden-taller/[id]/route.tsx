import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { assertCanAny } from "@/lib/permissions/engine";
import { OrdenTallerPDF } from "@/components/pdf/OrdenTallerPDF";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await assertCanAny(["docs.generate", "taller.view"]);
  const { id } = await params;

  const orden = await db.ordenTaller.findUnique({ where: { id }, include: { vehiculo: true } });

  if (!orden) {
    return new Response("Orden de taller no encontrada", { status: 404 });
  }

  const buffer = await renderToBuffer(
    <OrdenTallerPDF
      data={{
        vehiculoLabel: `${orden.vehiculo.marca} ${orden.vehiculo.modelo} ${orden.vehiculo.version ?? ""}`.trim(),
        matricula: orden.vehiculo.matricula,
        fechaIngreso: orden.fechaIngreso,
        trabajos: orden.trabajos,
        repuestos: orden.repuestos,
        responsable: orden.responsable,
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
