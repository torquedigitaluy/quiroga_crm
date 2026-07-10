import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { centsToUnits } from "@/lib/money";
import { VentaForm } from "@/components/ventas/VentaForm";
import { updateVenta } from "../actions";

function toDateInput(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default async function EditarVentaPage({ params }: { params: Promise<{ id: string }> }) {
  await assertCan("ventas.edit");
  const { id } = await params;

  const [venta, vendedores] = await Promise.all([
    db.venta.findUnique({ where: { id }, include: { vehiculo: true, cliente: true } }),
    db.user.findMany({ where: { activo: true, esVendedor: true }, orderBy: { nombre: "asc" } }),
  ]);
  if (!venta) notFound();

  const boundUpdate = updateVenta.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/ventas" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver a ventas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Editar venta</h1>
      </div>

      <VentaForm
        action={boundUpdate}
        submitLabel="Guardar cambios"
        vendedores={vendedores.map((u) => ({ id: u.id, label: u.nombre }))}
        vehiculos={[
          {
            id: venta.vehiculo.id,
            label: `${venta.vehiculo.marca} ${venta.vehiculo.modelo}${venta.vehiculo.matricula ? ` — ${venta.vehiculo.matricula}` : ""}`,
            propietario: venta.vehiculo.propietario,
          },
        ]}
        initial={{
          id: venta.id,
          vehiculoId: venta.vehiculoId,
          clienteNombre: venta.cliente?.nombre ?? "",
          clienteApellido: venta.cliente?.apellido ?? "",
          clienteCi: venta.cliente?.ci ?? "",
          clienteContacto: venta.cliente?.contacto ?? "",
          fechaSena: toDateInput(venta.fechaSena),
          senaUsd: centsToUnits(venta.senaUsdCents),
          fechaEntrega: toDateInput(venta.fechaEntrega),
          precioVentaUsd: centsToUnits(venta.precioVentaUsdCents),
          vendedorId: venta.vendedorId,
          localVenta: venta.localVenta,
          comisionVentaUsd: centsToUnits(venta.comisionVentaUsdCents),
          comisionTituloUsd: centsToUnits(venta.comisionTituloUsdCents),
        }}
      />
    </div>
  );
}
