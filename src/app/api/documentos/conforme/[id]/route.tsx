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

  // Vehículo: usa el snapshot guardado en el recibo; si no hay, cae al de la financiación.
  const vMarca = conforme.vehMarca ?? fin.vehiculo?.marca ?? null;
  const vModelo = conforme.vehModelo ?? fin.vehiculo?.modelo ?? null;
  const vMatricula = conforme.vehMatricula ?? fin.vehiculo?.matricula ?? null;
  const vehiculoLabel = vMarca || vModelo ? `${vMarca ?? ""} ${vModelo ?? ""}`.trim() : null;

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
        vehiculoMatricula: vMatricula,
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
