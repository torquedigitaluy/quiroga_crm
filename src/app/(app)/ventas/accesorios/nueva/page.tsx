import { db } from "@/lib/db";
import { assertCan } from "@/lib/permissions/engine";
import { VentaAccesorioForm } from "@/components/ventas/VentaAccesorioForm";
import { createVentaAccesorio } from "../../actions";

export default async function NuevaVentaAccesorioPage({
  searchParams,
}: {
  searchParams: Promise<{ accesorioId?: string }>;
}) {
  await assertCan("ventas.create");
  const { accesorioId } = await searchParams;

  const [accesorios, usuarios] = await Promise.all([
    db.vehiculo.findMany({
      where: { esVehiculo: false, estado: { not: "VENDIDO" }, archivedAt: null },
      orderBy: { marca: "asc" },
    }),
    db.user.findMany({ where: { activo: true, esVendedor: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Registrar venta de accesorio</h1>
        <p className="text-sm text-muted-foreground">
          La comisión de accesorios queda diferenciada de la comisión por venta de vehículos.
        </p>
      </div>
      <VentaAccesorioForm
        accesorios={accesorios.map((a) => ({ id: a.id, label: `${a.marca} ${a.modelo}` }))}
        vendedores={usuarios.map((u) => ({ id: u.id, label: u.nombre }))}
        defaultAccesorioId={accesorioId}
        action={createVentaAccesorio}
      />
    </div>
  );
}
