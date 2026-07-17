import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { ConformePDF } from "@/components/pdf/ConformePDF";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await assertCan("docs.generate");
  const { id } = await params;

  const conforme = await db.conforme.findUnique({
    where: { id },
    include: { cuota: true, financiacionPropia: { include: { cliente: true, vehiculo: true } } },
  });

  if (!conforme) {
    return new Response("Conforme no encontrado", { status: 404 });
  }

  const fin = conforme.financiacionPropia;
  const persona =
    conforme.deudorNombre?.trim() ||
    (fin.cliente ? `${fin.cliente.nombre} ${fin.cliente.apellido ?? ""}`.trim() : "") ||
    fin.nombre;
  const vehiculoLabel = fin.vehiculo ? `${fin.vehiculo.marca} ${fin.vehiculo.modelo}` : null;

  const buffer = await renderToBuffer(
    <ConformePDF
      data={{
        numeroRecibo: conforme.cuota?.numero ?? conforme.cantidadCuotas,
        montoCuotaCents: conforme.montoCuotaCents,
        montoEnLetras: conforme.montoEnLetras,
        numeroCuota: conforme.cuota?.numero ?? null,
        cantidadCuotas: conforme.cantidadCuotas,
        fechaPago: conforme.fechaPago,
        personaNombre: persona,
        vehiculoLabel,
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
