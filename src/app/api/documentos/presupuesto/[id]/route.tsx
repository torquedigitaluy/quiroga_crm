import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { assertCanAny } from "@/lib/permissions/engine";
import { PresupuestoPDF } from "@/components/pdf/PresupuestoPDF";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await assertCanAny(["presupuestos.view", "presupuestos.edit"]);
  const { id } = await params;

  const presupuesto = await db.presupuesto.findUnique({
    where: { id },
    include: { vehiculo: true, aceites: true, articulos: true },
  });

  if (!presupuesto) {
    return new Response("Presupuesto no encontrado", { status: 404 });
  }

  const vehiculoLabel = presupuesto.vehMarca
    ? `${presupuesto.vehMarca} ${presupuesto.vehModelo ?? ""}`.trim()
    : presupuesto.vehiculo
      ? `${presupuesto.vehiculo.marca} ${presupuesto.vehiculo.modelo}`
      : (presupuesto.vehiculoExterno ?? "Vehículo externo");

  const buffer = await renderToBuffer(
    <PresupuestoPDF
      data={{
        numero: presupuesto.numero,
        fecha: presupuesto.fecha,
        vehiculoLabel,
        vehMatricula: presupuesto.vehMatricula ?? presupuesto.vehiculo?.matricula ?? null,
        vehCombustible: presupuesto.vehCombustible,
        esVehiculoExterno: !presupuesto.vehiculoId,
        clienteNombre: presupuesto.clienteNombre,
        clienteTelefono: presupuesto.clienteTelefono,
        comentarios: presupuesto.comentarios,
        aceites: presupuesto.aceites,
        articulos: presupuesto.articulos,
      }}
    />,
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="presupuesto-${presupuesto.numero}.pdf"`,
    },
  });
}
