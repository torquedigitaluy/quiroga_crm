import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { ConformePDF } from "@/components/pdf/ConformePDF";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await assertCan("docs.generate");
  const { id } = await params;

  const conforme = await db.conforme.findUnique({
    where: { id },
    include: { cuota: true },
  });

  if (!conforme) {
    return new Response("Conforme no encontrado", { status: 404 });
  }

  const buffer = await renderToBuffer(
    <ConformePDF
      data={{
        montoCuotaCents: conforme.montoCuotaCents,
        montoEnLetras: conforme.montoEnLetras,
        fechaVencimiento: conforme.fechaVencimiento,
        numeroCuota: conforme.cuota?.numero ?? null,
        cantidadCuotas: conforme.cantidadCuotas,
        acreedorNombre: conforme.acreedorNombre,
        acreedorCi: conforme.acreedorCi,
        fechaPago: conforme.fechaPago,
        numeroFactura: conforme.numeroFactura,
        concepto: conforme.concepto,
        fechaFactura: conforme.fechaFactura,
        deudorNombre: conforme.deudorNombre,
        deudorCedula: conforme.deudorCedula,
        deudorDomicilio: conforme.deudorDomicilio,
        deudorDepartamentoDireccion: conforme.deudorDepartamentoDireccion,
        deudorTelefono: conforme.deudorTelefono,
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
