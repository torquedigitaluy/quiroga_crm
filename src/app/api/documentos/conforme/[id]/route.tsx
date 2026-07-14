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
    return new Response("Recibo no encontrado", { status: 404 });
  }

  const numeroCuota = conforme.cuota?.numero ?? null;
  const cuotasRestantes = numeroCuota !== null ? Math.max(conforme.cantidadCuotas - numeroCuota, 0) : null;

  const buffer = await renderToBuffer(
    <ConformePDF
      data={{
        montoCuotaCents: conforme.montoCuotaCents,
        fechaPago: conforme.fechaPago,
        formaPago: conforme.formaPago,
        cantidadCuotas: conforme.cantidadCuotas,
        vehiculoLabel: conforme.financiacionPropia.vehiculo
          ? `${conforme.financiacionPropia.vehiculo.marca} ${conforme.financiacionPropia.vehiculo.modelo}`
          : conforme.financiacionPropia.nombre,
        numeroCuota,
        cuotasRestantes,
        firmantes: conforme.firmantes.map((f) => ({ nombre: f.nombre, ci: f.ci })),
      }}
    />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="recibo-pago-${id}.pdf"`,
    },
  });
}
