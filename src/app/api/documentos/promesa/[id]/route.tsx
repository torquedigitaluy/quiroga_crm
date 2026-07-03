import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { PromesaPDF } from "@/components/pdf/PromesaPDF";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await assertCan("docs.generate");
  const { id } = await params;

  const venta = await db.venta.findUnique({
    where: { id },
    include: { vehiculo: true, cliente: true },
  });

  if (!venta) {
    return new Response("Venta no encontrada", { status: 404 });
  }

  const buffer = await renderToBuffer(
    <PromesaPDF
      data={{
        clienteNombre: venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido ?? ""}`.trim() : "—",
        clienteCi: venta.cliente?.ci ?? null,
        vehiculoLabel: `${venta.vehiculo.marca} ${venta.vehiculo.modelo} ${venta.vehiculo.version ?? ""}`.trim(),
        matricula: venta.vehiculo.matricula,
        padron: venta.vehiculo.padron,
        precioVentaUsdCents: venta.precioVentaUsdCents,
        senaUsdCents: venta.senaUsdCents,
        fechaSena: venta.fechaSena,
        fechaEntrega: venta.fechaEntrega,
      }}
    />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="promesa-${id}.pdf"`,
    },
  });
}
