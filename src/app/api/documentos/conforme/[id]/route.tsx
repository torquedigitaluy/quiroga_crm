import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { ConformePDF } from "@/components/pdf/ConformePDF";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await assertCan("docs.generate");
  const { id } = await params;

  const conforme = await db.conforme.findUnique({
    where: { id },
    include: {
      firmantes: { orderBy: { orden: "asc" } },
      cuota: true,
      financiacionPropia: { include: { vehiculo: true } },
    },
  });

  if (!conforme) {
    return new Response("Conforme no encontrado", { status: 404 });
  }

  const buffer = await renderToBuffer(
    <ConformePDF
      data={{
        montoCuotaCents: conforme.montoCuotaCents,
        fechaVencimiento: conforme.fechaVencimiento,
        cantidadCuotas: conforme.cantidadCuotas,
        diaVencimientoMensual: conforme.financiacionPropia.diaVencimientoMensual,
        vehiculoLabel: conforme.financiacionPropia.vehiculo
          ? `${conforme.financiacionPropia.vehiculo.marca} ${conforme.financiacionPropia.vehiculo.modelo}`
          : conforme.financiacionPropia.nombre,
        numeroCuota: conforme.cuota?.numero ?? null,
        firmantes: conforme.firmantes.map((f) => ({ nombre: f.nombre, ci: f.ci })),
      }}
    />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="conforme-${id}.pdf"`,
    },
  });
}
